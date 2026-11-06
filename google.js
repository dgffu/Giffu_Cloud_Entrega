// Base Google OAuth 2.0 + Drive API helpers (sem dependências externas)
//
// Credenciais (NUNCA ficam dentro da pasta do app / Google Drive):
//   - variáveis GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET, ou
//   - ~/.giffu-entrega/google_oauth.json  (o JSON baixado do Google Cloud Console serve como está)
// Tokens do Drive do Autor ficam em ~/.giffu-entrega/drive_tokens.json (modo 0600).

const fs = require('fs');
const os = require('os');
const path = require('path');
const https = require('https');
const { URL, URLSearchParams } = require('url');

const CONFIG_DIR = process.env.CONFIG_DIR ? path.resolve(process.env.CONFIG_DIR) : path.join(os.homedir(), '.giffu-entrega');
const OAUTH_FILE = path.join(CONFIG_DIR, 'google_oauth.json');
const TOKENS_FILE = path.join(CONFIG_DIR, 'drive_tokens.json');

const SCOPE_BASIC = 'openid email profile';
const SCOPE_DRIVE = 'https://www.googleapis.com/auth/drive';

// Agente HTTPS persistente com Keep-Alive para eliminar handshakes TLS repetidos no streaming do Drive
const keepAliveAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 128,
  maxFreeSockets: 32,
  timeout: 60000
});

// Cache em memória RAM para acesso instantâneo (0ms) ao token durante streaming/ranges
const tokenRamCache = new Map(); // key -> { access_token, expiry_date }

function ensureDir() {
  fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
}

// ---------- Requisições HTTPS ----------
function request(urlString, { method = 'GET', headers = {}, body = null, timeout = 15000 } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const req = https.request(url, { method, headers, timeout, agent: keepAliveAgent }, (res) => {
      const chunks = [];
      let size = 0;
      res.on('data', (c) => {
        size += c.length;
        if (size > 5 * 1024 * 1024) return req.destroy(new Error('Resposta grande demais'));
        chunks.push(c);
      });
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let json = null;
        try { json = JSON.parse(text); } catch (e) {}
        resolve({ status: res.statusCode, headers: res.headers, text, json });
      });
    });
    req.on('timeout', () => req.destroy(new Error('Tempo esgotado ao falar com o Google')));
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function postForm(urlString, fields) {
  const body = new URLSearchParams(fields).toString();
  return request(urlString, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body)
    },
    body
  });
}

// ---------- Configuração OAuth ----------
function getOAuthConfig(readDB) {
  let clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  let clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();

  if (!clientId || !clientSecret) {
    try {
      const raw = JSON.parse(fs.readFileSync(OAUTH_FILE, 'utf8'));
      const cfg = raw.web || raw.installed || raw;
      clientId = clientId || String(cfg.client_id || '').trim();
      clientSecret = clientSecret || String(cfg.client_secret || '').trim();
    } catch (e) {}
  }

  if (!clientId && readDB) {
    const db = readDB();
    clientId = ((db.settings && db.settings.googleClientId) || '').trim();
  }

  return { clientId, clientSecret, configured: Boolean(clientId && clientSecret) };
}

// ---------- Armazenamento dos tokens do Drive ----------
function readTokens() {
  try {
    return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
  } catch (e) {
    return null;
  }
}

function writeTokens(tokens) {
  ensureDir();
  if (tokens && tokens.access_token && tokens.expiry_date) {
    tokenRamCache.set('__global__', { access_token: tokens.access_token, expiry_date: tokens.expiry_date });
  }
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2), { mode: 0o600 });
  try { fs.chmodSync(TOKENS_FILE, 0o600); } catch (e) {}
}

function clearTokens() {
  tokenRamCache.delete('__global__');
  try { fs.unlinkSync(TOKENS_FILE); } catch (e) {}
}

async function revokeToken(token) {
  tokenRamCache.clear();
  try {
    await postForm('https://oauth2.googleapis.com/revoke', { token });
  } catch (e) {}
}

// ---------- Access token do Drive (renova sozinho por usuário ou global) ----------
const userRefreshLocks = new Map();
let globalRefreshing = null;

async function getDriveAccessToken(userContext) {
  const now = Date.now();

  // Fast-path em memória RAM (evita leitura/parse de banco a cada chunk de vídeo)
  if (typeof userContext === 'string' && userContext) {
    const cached = tokenRamCache.get(userContext);
    if (cached && cached.access_token && cached.expiry_date - 60000 > now) {
      return cached.access_token;
    }
  } else if (userContext && typeof userContext === 'object') {
    const uid = (userContext.user && userContext.user.id) || null;
    if (uid) {
      const cached = tokenRamCache.get(uid);
      if (cached && cached.access_token && cached.expiry_date - 60000 > now) {
        return cached.access_token;
      }
    }
  } else if (!userContext) {
    const cached = tokenRamCache.get('__global__');
    if (cached && cached.access_token && cached.expiry_date - 60000 > now) {
      return cached.access_token;
    }
  }

  const storage = require('./storage');
  let userDb = null;
  let userId = null;

  if (typeof userContext === 'function') {
    userDb = userContext();
    userId = (userDb && userDb.user && userDb.user.id) || null;
  } else if (typeof userContext === 'string') {
    userId = userContext;
    userDb = storage.getUserDb(userId);
  } else if (userContext && typeof userContext === 'object') {
    userDb = userContext;
    userId = (userDb.user && userDb.user.id) || null;
  }

  // Se tivermos um usuário com driveTokens próprio
  if (userDb && userDb.driveTokens && userDb.driveTokens.refresh_token) {
    const tokens = userDb.driveTokens;

    // Token ainda válido?
    if (tokens.access_token && tokens.expiry_date && tokens.expiry_date - 60 * 1000 > now) {
      if (userId) tokenRamCache.set(userId, { access_token: tokens.access_token, expiry_date: tokens.expiry_date });
      return tokens.access_token;
    }

    // Renova token do usuário
    const lockKey = userId || tokens.refresh_token;
    if (!userRefreshLocks.has(lockKey)) {
      const refreshPromise = (async () => {
        const cfg = getOAuthConfig(() => userDb);
        if (!cfg.configured) {
          const err = new Error('Credenciais OAuth do Google não configuradas.');
          err.code = 'OAUTH_NOT_CONFIGURED';
          throw err;
        }

        const res = await postForm('https://oauth2.googleapis.com/token', {
          client_id: cfg.clientId,
          client_secret: cfg.clientSecret,
          refresh_token: tokens.refresh_token,
          grant_type: 'refresh_token'
        });

        if (res.status !== 200 || !res.json || !res.json.access_token) {
          if (res.json && res.json.error === 'invalid_grant') {
            userDb.driveTokens = null;
            if (userId) {
              tokenRamCache.delete(userId);
              storage.saveUserDb(userId, userDb);
            }
            const err = new Error('O acesso ao Drive foi revogado. Faça login com Google novamente.');
            err.code = 'DRIVE_NOT_CONNECTED';
            throw err;
          }
          throw new Error('Não foi possível renovar o acesso ao Google Drive do usuário.');
        }

        const updatedTokens = {
          ...tokens,
          access_token: res.json.access_token,
          expiry_date: Date.now() + (Number(res.json.expires_in) || 3600) * 1000
        };

        userDb.driveTokens = updatedTokens;
        if (userId) {
          tokenRamCache.set(userId, { access_token: updatedTokens.access_token, expiry_date: updatedTokens.expiry_date });
          storage.saveUserDb(userId, userDb);
        }
        return updatedTokens.access_token;
      })().finally(() => {
        userRefreshLocks.delete(lockKey);
      });

      userRefreshLocks.set(lockKey, refreshPromise);
    }
    return userRefreshLocks.get(lockKey);
  }

  // Se um contexto de usuário foi fornecido mas não possui tokens válidos, não use tokens de outro usuário
  if (userContext) {
    const err = new Error('Google Drive não conectado para esta conta. Conecte o Google Drive para continuar.');
    err.code = 'DRIVE_NOT_CONNECTED';
    throw err;
  }

  // Fallback: tokens legados globais
  const tokens = readTokens();
  if (!tokens || !tokens.refresh_token) {
    const err = new Error('Google Drive não conectado. Faça login com Google como Autor.');
    err.code = 'DRIVE_NOT_CONNECTED';
    throw err;
  }

  if (tokens.access_token && tokens.expiry_date && tokens.expiry_date - 60 * 1000 > now) {
    tokenRamCache.set('__global__', { access_token: tokens.access_token, expiry_date: tokens.expiry_date });
    return tokens.access_token;
  }

  if (!globalRefreshing) {
    globalRefreshing = (async () => {
      const cfg = getOAuthConfig();
      if (!cfg.configured) {
        const err = new Error('Credenciais OAuth do Google não configuradas.');
        err.code = 'OAUTH_NOT_CONFIGURED';
        throw err;
      }
      const res = await postForm('https://oauth2.googleapis.com/token', {
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        refresh_token: tokens.refresh_token,
        grant_type: 'refresh_token'
      });
      if (res.status !== 200 || !res.json || !res.json.access_token) {
        if (res.json && res.json.error === 'invalid_grant') {
          clearTokens();
          const err = new Error('O acesso ao Drive foi revogado. Faça login com Google novamente.');
          err.code = 'DRIVE_NOT_CONNECTED';
          throw err;
        }
        throw new Error('Não foi possível renovar o acesso ao Google Drive.');
      }
      const updated = {
        ...tokens,
        access_token: res.json.access_token,
        expiry_date: Date.now() + (Number(res.json.expires_in) || 3600) * 1000
      };
      writeTokens(updated);
      return updated.access_token;
    })().finally(() => { globalRefreshing = null; });
  }
  return globalRefreshing;
}

module.exports = {
  SCOPE_BASIC,
  SCOPE_DRIVE,
  keepAliveAgent,
  request,
  postForm,
  getOAuthConfig,
  readTokens,
  writeTokens,
  clearTokens,
  revokeToken,
  getDriveAccessToken
};

