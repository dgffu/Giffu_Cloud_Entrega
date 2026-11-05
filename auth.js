// Autenticação real via Google (OAuth 2.0 Authorization Code + PKCE, fluxo de servidor)
//
// Fluxo:
//   1. O navegador abre /api/auth/google/start (popup). O servidor redireciona ao Google com
//      state + PKCE guardados em cookie assinado.
//   2. O Google volta em /api/auth/google/callback com um "code". O servidor troca o code por
//      tokens (com o Client Secret, que nunca vai ao navegador) e lê o perfil verificado.
//   3. Autor: o e-mail precisa estar autorizado; o refresh_token do Drive é guardado no servidor
//      (~/.giffu-entrega) e usado para espelhar/transmitir os vídeos via API do Drive.
//   4. O servidor emite um cookie de sessão assinado (HMAC-SHA256), HttpOnly + SameSite=Lax.

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const google = require('./google');

const SESSION_COOKIE = 'giffu_sid';
const OAUTH_COOKIE = 'giffu_oauth';
const PASSWORD_COOKIE = 'giffu_pwd';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias
const OAUTH_TTL_MS = 10 * 60 * 1000;            // 10 minutos para concluir o login
const PASSWORD_TTL_MS = 24 * 60 * 60 * 1000;    // 24 horas de desbloqueio de diretório com senha

// ---------- Segredo de sessão (fora da pasta do app / do Google Drive) ----------
function loadSessionSecret() {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32) {
    return process.env.SESSION_SECRET;
  }
  const dir = process.env.CONFIG_DIR ? path.resolve(process.env.CONFIG_DIR) : path.join(os.homedir(), '.giffu-entrega');
  const file = path.join(dir, 'session.secret');
  try {
    const existing = fs.readFileSync(file, 'utf8').trim();
    if (existing.length >= 32) return existing;
  } catch (e) {}
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const secret = crypto.randomBytes(48).toString('hex');
  fs.writeFileSync(file, secret, { mode: 0o600 });
  return secret;
}

const SECRET = loadSessionSecret();

// ---------- Cookie assinado ----------
function signValue(value) {
  return crypto.createHmac('sha256', SECRET).update(value).digest('base64url');
}

function encodeSigned(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${signValue(body)}`;
}

function decodeSigned(token) {
  if (!token || typeof token !== 'string') return null;
  const dot = token.indexOf('.');
  if (dot < 1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const a = Buffer.from(sig);
  const b = Buffer.from(signValue(body));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload || !payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(';').forEach(part => {
    const idx = part.indexOf('=');
    if (idx < 0) return;
    try {
      out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
    } catch (e) {}
  });
  return out;
}

function isSecureRequest(req) {
  return req.secure || String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';
}

function baseUrl(req) {
  if (process.env.PUBLIC_URL) {
    let pUrl = process.env.PUBLIC_URL.trim().replace(/\/+$/, '');
    if (!/^https?:\/\//i.test(pUrl)) {
      pUrl = 'https://' + pUrl;
    }
    return pUrl;
  }
  return `${isSecureRequest(req) ? 'https' : 'http'}://${req.headers.host}`;
}

function appendCookie(req, res, name, value, { maxAgeSec, cookiePath = '/' }) {
  const parts = [`${name}=${value}`, `Path=${cookiePath}`, 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAgeSec}`];
  if (isSecureRequest(req)) parts.push('Secure');
  res.append('Set-Cookie', parts.join('; '));
}

// Página mínima que devolve o resultado ao app (popup) e fecha
function sendAuthResult(res, result) {
  const json = JSON.stringify(result).replace(/</g, '\\u003c');
  res.set('Cache-Control', 'no-store');
  res.type('html').send(`<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>Login</title></head>
<body style="font-family:Outfit,system-ui,sans-serif;background:#0b0b0d;color:#a1a1aa;display:grid;place-items:center;height:100vh;margin:0">
<p id="msg">Concluindo login…</p>
<script>
  var result = ${json};
  if (window.opener) {
    window.opener.postMessage({ type: 'giffu-auth', ok: result.ok, error: result.error || null }, location.origin);
    window.close();
  } else if (result.ok) {
    location.replace(result.mode === 'author' ? '/author' : '/');
  } else {
    document.getElementById('msg').textContent = result.error || 'Não foi possível entrar com o Google.';
  }
</script></body></html>`);
}

function createAuth(storageModule) {
  const storage = storageModule || require('./storage');

  function buildUserFromSession(session) {
    if (!session) return null;
    const rawId = session.userId || (session.sub ? `usr_${session.sub}` : null) || (session.email ? `usr_${session.email.replace(/[^a-zA-Z0-9]/g, '_')}` : 'anonymous');
    const userId = String(rawId).startsWith('client_') && session.email
      ? storage.normalizeUserId(session.email)
      : rawId;
    let userName = session.name || 'Usuário';
    let userAvatar = session.avatar || '';

    try {
      const userDb = storage.getUserDb(userId);
      if (userDb) {
        if (userDb.settings && userDb.settings.authorName) {
          const customized = storage.isAuthorNameCustomized
            ? storage.isAuthorNameCustomized(userDb, session.name)
            : Boolean(userDb.settings.authorNameCustomized);
          if (customized) {
            userName = userDb.settings.authorName;
          }
        }
        if (!userAvatar && userDb.user && userDb.user.avatar) {
          userAvatar = userDb.user.avatar;
        }
        if (!userAvatar && userDb.settings && userDb.settings.authorAvatar) {
          userAvatar = userDb.settings.authorAvatar;
        }
      }
    } catch (e) {}

    return {
      id: userId,
      sub: session.sub || null,
      email: session.email || '',
      name: userName,
      avatar: userAvatar,
      isAuthor: true
    };
  }

  function attachUser(req, res, next) {
    const cookies = parseCookies(req.headers.cookie);
    const session = decodeSigned(cookies[SESSION_COOKIE]);
    req.user = buildUserFromSession(session);
    next();
  }

  function requireUser(req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'Faça login com o Google para continuar' });
    next();
  }

  function requireAuthor(req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'Sessão expirada. Faça login com o Google.' });
    next();
  }

  // Bloqueia requisições de escrita vindas de outra origem (CSRF)
  function sameOriginGuard(req, res, next) {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const origin = req.headers.origin;
    if (origin) {
      try {
        if (new URL(origin).host !== req.headers.host) {
          return res.status(403).json({ error: 'Origem não permitida' });
        }
      } catch (e) {
        return res.status(403).json({ error: 'Origem inválida' });
      }
    }
    next();
  }

  // Limite simples de tentativas de login por IP
  const attempts = new Map();
  function loginRateLimit(req, res, next) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const recent = (attempts.get(ip) || []).filter(t => now - t < 60 * 1000);
    if (recent.length >= 20) {
      return res.status(429).send('Muitas tentativas. Aguarde um minuto.');
    }
    recent.push(now);
    attempts.set(ip, recent);
    next();
  }

  function register(app) {
    app.use('/api', sameOriginGuard);
    app.use('/api', attachUser);

    app.get('/api/auth/config', (req, res) => {
      res.json({ configured: google.getOAuthConfig().configured });
    });

    app.get('/api/auth/session', (req, res) => {
      let driveConnected = false;
      if (req.user && req.user.isAuthor) {
        const userDb = storage.getUserDb(req.user.id);
        driveConnected = Boolean(userDb && userDb.driveTokens && userDb.driveTokens.refresh_token);
        if (userDb && userDb.settings && userDb.settings.authorName) {
          const customized = storage.isAuthorNameCustomized
            ? storage.isAuthorNameCustomized(userDb, req.user.name)
            : Boolean(userDb.settings.authorNameCustomized);
          if (customized) {
            req.user.name = userDb.settings.authorName;
          }
        }
      }
      res.json({
        user: req.user,
        driveConnected: req.user && req.user.isAuthor ? driveConnected : undefined
      });
    });

    // 1) Inicia o login: redireciona ao Google
    app.get('/api/auth/google/start', loginRateLimit, (req, res) => {
      const mode = req.query.mode === 'author' ? 'author' : 'client';
      const cfg = google.getOAuthConfig();
      if (!cfg.configured) {
        return sendAuthResult(res, {
          ok: false, mode,
          error: 'Login com Google ainda não configurado (faltam Client ID e Client Secret).'
        });
      }

      const state = crypto.randomBytes(24).toString('base64url');
      const verifier = crypto.randomBytes(48).toString('base64url');
      const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');

      appendCookie(req, res, OAUTH_COOKIE,
        encodeSigned({ state, verifier, mode, exp: Date.now() + OAUTH_TTL_MS }),
        { maxAgeSec: OAUTH_TTL_MS / 1000, cookiePath: '/api/auth/google' });

      const params = new URLSearchParams({
        client_id: cfg.clientId,
        redirect_uri: `${baseUrl(req)}/api/auth/google/callback`,
        response_type: 'code',
        scope: mode === 'author' ? `${google.SCOPE_BASIC} ${google.SCOPE_DRIVE}` : google.SCOPE_BASIC,
        state,
        code_challenge: challenge,
        code_challenge_method: 'S256'
      });

      const switchAccount = req.query.switch === '1';
      if (mode === 'author') {
        params.set('access_type', 'offline'); // necessário para o refresh_token do Drive
        params.set('prompt', 'consent select_account');
      } else if (switchAccount) {
        params.set('prompt', 'select_account');
      }

      res.set('Cache-Control', 'no-store');
      res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
    });

    // 2) Retorno do Google: troca o code por tokens e abre a sessão do usuário
    app.get('/api/auth/google/callback', async (req, res) => {
      const cookies = parseCookies(req.headers.cookie);
      const flow = decodeSigned(cookies[OAUTH_COOKIE]);
      appendCookie(req, res, OAUTH_COOKIE, '', { maxAgeSec: 0, cookiePath: '/api/auth/google' });

      const mode = flow && flow.mode === 'author' ? 'author' : 'client';
      const fail = (error) => sendAuthResult(res, { ok: false, mode, error });

      const { code, state, error } = req.query;
      if (error) return fail(error === 'access_denied' ? 'Login cancelado' : 'O Google recusou o login.');
      if (!flow || !code || !state || !safeEqual(state, flow.state)) {
        return fail('Sessão de login inválida ou expirada. Tente novamente.');
      }

      const cfg = google.getOAuthConfig();
      if (!cfg.configured) return fail('Login com Google não configurado.');

      try {
        const tokenRes = await google.postForm('https://oauth2.googleapis.com/token', {
          code: String(code),
          client_id: cfg.clientId,
          client_secret: cfg.clientSecret,
          redirect_uri: `${baseUrl(req)}/api/auth/google/callback`,
          grant_type: 'authorization_code',
          code_verifier: flow.verifier
        });
        if (tokenRes.status !== 200 || !tokenRes.json || !tokenRes.json.access_token) {
          console.error('Falha na troca do code:', tokenRes.text);
          return fail('Não foi possível validar o login com o Google.');
        }
        const tokens = tokenRes.json;

        const profileRes = await google.request('https://openidconnect.googleapis.com/v1/userinfo', {
          headers: { Authorization: `Bearer ${tokens.access_token}` }
        });
        const p = profileRes.json;
        if (profileRes.status !== 200 || !p || !p.email || p.email_verified !== true) {
          return fail('Não foi possível confirmar o e-mail da conta Google.');
        }

        let avatarUrl = typeof p.picture === 'string' && p.picture.startsWith('https://') ? p.picture : '';
        if (!avatarUrl && String(tokens.scope || '').includes('drive')) {
          try {
            const driveAbout = await google.request('https://www.googleapis.com/drive/v3/about?fields=user', {
              headers: { Authorization: `Bearer ${tokens.access_token}` }
            });
            if (driveAbout.json && driveAbout.json.user && driveAbout.json.user.photoLink) {
              avatarUrl = driveAbout.json.user.photoLink;
            }
          } catch (e) {}
        }

        const profile = {
          sub: String(p.sub),
          email: String(p.email).toLowerCase().trim(),
          name: String(p.name || p.email.split('@')[0]).slice(0, 120),
          avatar: avatarUrl
        };

        // Toda conta Google é única e possui seu próprio banco de usuário (podendo atuar como autor de seus projetos ou cliente em links recebidos)
        const { userDb, userId } = storage.getOrCreateUserDb(profile);
        const sessionUserId = userId;
        const hasDriveScope = String(tokens.scope || '').includes('https://www.googleapis.com/auth/drive');

        if (mode === 'author') {
          if (!hasDriveScope) {
            return fail('Permita o acesso ao Google Drive para gerenciar e espelhar seus projetos.');
          }

          const previousTokens = userDb.driveTokens;
          const refreshToken = tokens.refresh_token ||
            (previousTokens && previousTokens.refresh_token ? previousTokens.refresh_token : null);

          if (!refreshToken) {
            return fail('O Google não enviou a permissão offline. Acesse myaccount.google.com/permissions, desconecte o app e faça login novamente.');
          }

          userDb.driveTokens = {
            email: profile.email,
            refresh_token: refreshToken,
            access_token: tokens.access_token,
            expiry_date: Date.now() + (Number(tokens.expires_in) || 3600) * 1000,
            scope: tokens.scope,
            connectedAt: new Date().toISOString()
          };
        } else if (hasDriveScope && tokens.refresh_token) {
          userDb.driveTokens = {
            email: profile.email,
            refresh_token: tokens.refresh_token,
            access_token: tokens.access_token,
            expiry_date: Date.now() + (Number(tokens.expires_in) || 3600) * 1000,
            scope: tokens.scope,
            connectedAt: new Date().toISOString()
          };
        }

        storage.saveUserDb(userId, userDb);

        // Restaura/sincroniza automaticamente do Cofre Criptografado no Google Drive do usuário
        if (userDb.driveTokens && userDb.driveTokens.refresh_token && typeof storage.restoreUserDbFromCloudDrive === 'function') {
          try {
            await storage.restoreUserDbFromCloudDrive(userId, userDb);
          } catch (e) {}
        }

        let sessionUserName = profile.name;
        if (userDb && userDb.settings && userDb.settings.authorName) {
          const customized = storage.isAuthorNameCustomized
            ? storage.isAuthorNameCustomized(userDb, profile.name)
            : Boolean(userDb.settings.authorNameCustomized);
          if (customized) {
            sessionUserName = userDb.settings.authorName;
          }
        }

        const signedToken = encodeSigned({
          userId: sessionUserId,
          sub: profile.sub,
          email: profile.email,
          name: sessionUserName,
          avatar: profile.avatar,
          isAuthor: true,
          exp: Date.now() + SESSION_TTL_MS
        });

        appendCookie(req, res, SESSION_COOKIE, signedToken, { maxAgeSec: SESSION_TTL_MS / 1000 });

        sendAuthResult(res, { ok: true, mode });
      } catch (err) {
        console.error('Falha no login Google:', err.message);
        fail('Não foi possível concluir o login com o Google.');
      }
    });

    app.post('/api/auth/logout', (req, res) => {
      appendCookie(req, res, SESSION_COOKIE, '', { maxAgeSec: 0 });
      appendCookie(req, res, PASSWORD_COOKIE, '', { maxAgeSec: 0 });
      res.json({ success: true });
    });

    // Estado / desconexão do Google Drive (Autor)
    app.get('/api/drive/status', requireAuthor, (req, res) => {
      const userDb = storage.getUserDb(req.user.id);
      const t = userDb?.driveTokens;
      res.json({
        connected: Boolean(t && t.refresh_token),
        email: t ? t.email : null,
        connectedAt: t ? t.connectedAt : null
      });
    });

    app.post('/api/drive/disconnect', requireAuthor, async (req, res) => {
      const userDb = storage.getUserDb(req.user.id);
      if (userDb && userDb.driveTokens) {
        if (userDb.driveTokens.refresh_token) {
          await google.revokeToken(userDb.driveTokens.refresh_token);
        }
        userDb.driveTokens = null;
        storage.saveUserDb(req.user.id, userDb);
      }
      res.json({ success: true });
    });
  }

  function updateUserSession(req, res, updates = {}) {
    try {
      const cookies = parseCookies(req.headers.cookie);
      const session = decodeSigned(cookies[SESSION_COOKIE]);
      if (!session) return;
      const newPayload = { ...session, ...updates };
      appendCookie(req, res, SESSION_COOKIE, encodeSigned(newPayload), { maxAgeSec: SESSION_TTL_MS / 1000 });
    } catch (e) {
      console.error('Erro ao atualizar cookie de sessão:', e);
    }
  }

  function grantPasswordUnlock(req, res, identifiers) {
    if (!identifiers) return;
    const list = Array.isArray(identifiers) ? identifiers : [identifiers];
    try {
      const cookies = parseCookies(req.headers.cookie);
      const existing = decodeSigned(cookies[PASSWORD_COOKIE]);
      let unlocked = Array.isArray(existing && existing.unlocked) ? [...existing.unlocked] : [];
      for (const item of list) {
        if (!item) continue;
        const raw = String(item).trim();
        const lower = raw.toLowerCase();
        if (!unlocked.includes(raw)) unlocked.push(raw);
        if (!unlocked.includes(lower)) unlocked.push(lower);
      }
      const trimmed = unlocked.slice(-100);
      const signed = encodeSigned({
        unlocked: trimmed,
        exp: Date.now() + PASSWORD_TTL_MS
      });
      appendCookie(req, res, PASSWORD_COOKIE, signed, { maxAgeSec: PASSWORD_TTL_MS / 1000 });
    } catch (e) {
      console.error('Erro ao gravar cookie de desbloqueio de senha:', e);
    }
  }

  function hasPasswordUnlock(req, identifierOrProject) {
    if (!identifierOrProject) return false;
    try {
      const cookies = parseCookies(req.headers.cookie);
      const payload = decodeSigned(cookies[PASSWORD_COOKIE]);
      if (!payload || !Array.isArray(payload.unlocked)) return false;

      const candidates = typeof identifierOrProject === 'object' && identifierOrProject !== null
        ? [identifierOrProject.id, identifierOrProject.slug, identifierOrProject.shortCode].filter(Boolean)
        : [identifierOrProject];

      return candidates.some(c => {
        const raw = String(c).trim();
        const lower = raw.toLowerCase();
        return payload.unlocked.includes(raw) || payload.unlocked.includes(lower);
      });
    } catch (e) {
      return false;
    }
  }

  return { register, requireUser, requireAuthor, updateUserSession, grantPasswordUnlock, hasPasswordUnlock, safeEqual };
}

module.exports = { createAuth };
