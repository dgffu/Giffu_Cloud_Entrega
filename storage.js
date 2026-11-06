// Multi-Tenant User Database & Slugs Index Storage Manager
//
// Cada usuário do sistema possui seu próprio banco de dados isolado em:
//   data/users/<userId>.json
//
// Os links públicos (/entrega/:slug) são resolvidos instantaneamente pelo índice:
//   data/slugs.json
//
// O sistema migra automaticamente a base legada (data/db.json) se necessário.

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, 'data');
const USERS_DIR = path.join(DATA_DIR, 'users');
const SLUGS_FILE = path.join(DATA_DIR, 'slugs.json');
const SHORTLINKS_FILE = path.join(DATA_DIR, 'shortlinks.json');
const LEGACY_DB_FILE = path.join(DATA_DIR, 'db.json');

const CONFIG_DIR = process.env.CONFIG_DIR ? path.resolve(process.env.CONFIG_DIR) : path.join(os.homedir(), '.giffu-entrega');
const MASTER_KEY_FILE = path.join(CONFIG_DIR, 'master.key');
const CLOUD_VAULT_FILENAME = '.giffu_cloud_vault.json';

const SHORTLINK_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

const RESERVED_WORDS = new Set([
  'api', 'auth', 'author', 'entrega', 'stream', 'download', 'upload',
  'css', 'js', 'img', 'images', 'icons', 'favicon', 'assets', 'static', 'public',
  'login', 'logout', 'callback', 'google', 'privacy', 'privacidade', 'terms', 'termos',
  'settings', 'config', 'admin', 'dashboard', 'status', 'health', 'robots'
]);

function ensureDirectories() {
  fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
  fs.mkdirSync(USERS_DIR, { recursive: true, mode: 0o700 });
  fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
}

// ---------- Criptografia em Repouso (AES-256-GCM) ----------
let cachedMasterKey = null;
const fileCache = new Map(); // filePath -> { mtimeMs, jsonStr }
const driveIdLookupCache = new Map(); // driveFileId -> { result, expiresAt }

function getMasterKey() {
  if (cachedMasterKey) return cachedMasterKey;
  ensureDirectories();

  const envKey = (process.env.DATA_ENCRYPTION_KEY || '').trim();
  if (envKey) {
    if (/^[0-9a-fA-F]{64}$/.test(envKey)) {
      cachedMasterKey = Buffer.from(envKey, 'hex');
      return cachedMasterKey;
    }
    if (envKey.length >= 16) {
      cachedMasterKey = crypto.scryptSync(envKey, 'giffu-entrega-master-salt-v1', 32);
      return cachedMasterKey;
    }
  }

  try {
    if (fs.existsSync(MASTER_KEY_FILE)) {
      const hex = fs.readFileSync(MASTER_KEY_FILE, 'utf8').trim();
      if (/^[0-9a-fA-F]{64}$/.test(hex)) {
        cachedMasterKey = Buffer.from(hex, 'hex');
        return cachedMasterKey;
      }
      if (hex.length >= 16) {
        cachedMasterKey = crypto.scryptSync(hex, 'giffu-entrega-master-salt-v1', 32);
        return cachedMasterKey;
      }
    }
  } catch (e) {}

  const newKey = crypto.randomBytes(32);
  try {
    fs.writeFileSync(MASTER_KEY_FILE, newKey.toString('hex'), { encoding: 'utf8', mode: 0o600 });
    try { fs.chmodSync(MASTER_KEY_FILE, 0o600); } catch (e) {}
  } catch (e) {
    console.error('Erro ao gravar master.key:', e);
  }
  cachedMasterKey = newKey;
  return cachedMasterKey;
}

function encryptPayload(obj, customKey = null) {
  const key = customKey || getMasterKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(obj), 'utf8');
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    __giffu_encrypted: true,
    v: 1,
    alg: 'aes-256-gcm',
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    payload: encrypted.toString('base64')
  };
}

function decryptPayload(envelope, customKey = null) {
  if (!envelope || typeof envelope !== 'object') return envelope;
  if (!envelope.__giffu_encrypted) return envelope;
  const key = customKey || getMasterKey();
  const iv = Buffer.from(envelope.iv, 'base64');
  const tag = Buffer.from(envelope.tag, 'base64');
  const encrypted = Buffer.from(envelope.payload, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8'));
}

function writeJsonFileSecure(filePath, data) {
  ensureDirectories();
  driveIdLookupCache.clear();
  const jsonStr = JSON.stringify(data);
  const envelope = encryptPayload(data);
  const serializedEnvelope = JSON.stringify(envelope, null, 2);
  fs.writeFileSync(filePath, serializedEnvelope, { encoding: 'utf8', mode: 0o600 });
  try { fs.chmodSync(filePath, 0o600); } catch (e) {}
  try {
    const stat = fs.statSync(filePath);
    fileCache.set(filePath, { mtimeMs: stat.mtimeMs, jsonStr });
  } catch (e) {}
  return true;
}

function readJsonFileSecure(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const stat = fs.statSync(filePath);
  const cached = fileCache.get(filePath);
  if (cached && cached.mtimeMs === stat.mtimeMs) {
    return JSON.parse(cached.jsonStr);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);

  if (parsed && parsed.__giffu_encrypted) {
    const decrypted = decryptPayload(parsed);
    const jsonStr = JSON.stringify(decrypted);
    fileCache.set(filePath, { mtimeMs: stat.mtimeMs, jsonStr });
    return decrypted;
  }

  // Arquivo legado em texto puro: criptografa imediatamente em disco para proteger os dados
  writeJsonFileSecure(filePath, parsed);
  return parsed;
}

function sanitizeId(raw) {
  if (!raw) return 'anonymous';
  return String(raw)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
}

function normalizeUserId(identifier) {
  if (!identifier) return 'anonymous';
  const str = String(identifier).trim();
  if (str.startsWith('usr_')) return sanitizeId(str);
  return `usr_${sanitizeId(str)}`;
}

// Retorna estrutura padrão de um banco de dados de usuário
function createDefaultUserDb(userProfile = {}) {
  const currentYear = new Date().getFullYear().toString();
  const userId = normalizeUserId(userProfile.id || userProfile.sub || userProfile.email);
  const defaultAuthorName = userProfile.name || (userProfile.email ? userProfile.email.split('@')[0] : 'Autor');
  return {
    user: {
      id: userId,
      sub: userProfile.sub || null,
      email: (userProfile.email || '').toLowerCase().trim(),
      name: defaultAuthorName,
      avatar: userProfile.avatar || ''
    },
    driveTokens: null,
    settings: {
      appName: 'Giffú Entrega',
      baseDomain: 'giffu.com.br',
      authorName: defaultAuthorName,
      authorNameCustomized: false, // Usuário novo: permanece com o nome original do Google até ser alterado
      authorEmail: (userProfile.email || '').toLowerCase().trim(),
      authorAvatar: userProfile.avatar || '',
      theme: 'dark'
    },
    categories: [
      { id: 'cat-padrao', name: 'Categoria Padrão' }
    ],
    divisions: [
      { id: `div-${Date.now()}`, name: currentYear, category: 'Categoria Padrão', parentId: null, createdAt: new Date().toISOString() }
    ],
    years: [currentYear],
    projects: [],
    comments: []
  };
}

// Lê o mapa de slugs global: { [slug]: { userId, projectId } }
function getSlugs() {
  ensureDirectories();
  try {
    if (fs.existsSync(SLUGS_FILE)) {
      return readJsonFileSecure(SLUGS_FILE) || {};
    }
  } catch (e) {
    console.error('Erro ao ler slugs.json:', e);
  }
  return {};
}

function saveSlugs(slugsMap) {
  ensureDirectories();
  try {
    return writeJsonFileSecure(SLUGS_FILE, slugsMap);
  } catch (e) {
    console.error('Erro ao salvar slugs.json:', e);
    return false;
  }
}

// Atualiza o índice de slugs para os projetos de um usuário
function syncUserSlugs(userId, projects) {
  const slugs = getSlugs();
  // Remove slugs anteriores apontando para este usuário que possam ter mudado
  Object.keys(slugs).forEach(s => {
    if (slugs[s] && slugs[s].userId === userId) {
      delete slugs[s];
    }
  });
  // Adiciona projetos atuais
  (projects || []).forEach(p => {
    if (p.slug) {
      slugs[p.slug] = {
        userId,
        projectId: p.id
      };
    }
  });
  saveSlugs(slugs);
}

// Lê o mapa de shortlinks global: { [code]: { code, type, userId, projectId, slug, folderId, videoId } }
function getShortLinks() {
  ensureDirectories();
  try {
    if (fs.existsSync(SHORTLINKS_FILE)) {
      return readJsonFileSecure(SHORTLINKS_FILE) || {};
    }
  } catch (e) {
    console.error('Erro ao ler shortlinks.json:', e);
  }
  return {};
}

function saveShortLinks(shortlinksMap) {
  ensureDirectories();
  try {
    return writeJsonFileSecure(SHORTLINKS_FILE, shortlinksMap);
  } catch (e) {
    console.error('Erro ao salvar shortlinks.json:', e);
    return false;
  }
}

// Gera código aleatório seguro com [a-z0-9] evitando palavras reservadas e colisões
function generateRandomShortCode(length, existingCodesSet) {
  for (let attempt = 0; attempt < 10000; attempt++) {
    let code = '';
    for (let i = 0; i < length; i++) {
      code += SHORTLINK_CHARS[crypto.randomInt(0, SHORTLINK_CHARS.length)];
    }
    if (!RESERVED_WORDS.has(code) && (!existingCodesSet || !existingCodesSet.has(code))) {
      if (existingCodesSet) existingCodesSet.add(code);
      return code;
    }
  }
  const fallback = Date.now().toString(36).slice(-length);
  if (existingCodesSet) existingCodesSet.add(fallback);
  return fallback;
}

// Calcula a profundidade de uma pasta no diretório
function getFolderDepth(folder, allFolders, projectDriveFolderId) {
  if (folder.path) {
    const parts = folder.path.split('/').filter(Boolean);
    if (parts.length > 0) return parts.length;
  }
  let depth = 1;
  let cur = folder;
  const visited = new Set([cur.id]);
  while (cur && cur.parentId && cur.parentId !== projectDriveFolderId) {
    const parent = (allFolders || []).find(f => f.id === cur.parentId);
    if (!parent || visited.has(parent.id)) break;
    visited.add(parent.id);
    depth++;
    cur = parent;
  }
  return depth;
}

// Determina o comprimento mínimo do código baseado no tipo e na distância/profundidade:
// - Diretório raiz: 6 caracteres (ex: 59j640)
// - Subpasta nível 1: 7 caracteres (ex: 39ak804)
// - Subpasta nível 2: 8 caracteres
// - Subpasta nível 3+: 9 caracteres
// - Arquivo isolado (vídeo/foto/áudio/arquivo): 10 caracteres (ex: j3j643508j)
function getRequiredCodeLength(type, depth = 0) {
  if (type === 'project') return 6;
  if (type === 'folder') {
    if (depth <= 1) return 7;
    if (depth === 2) return 8;
    return 9;
  }
  if (type === 'file') return 10;
  return 6;
}

// Garante códigos curtos aleatórios para todos os projetos, pastas e arquivos de um usuário
function ensureShortCodesForUserDb(userId, userDb, shortlinksMap) {
  if (!userDb || !Array.isArray(userDb.projects)) return false;
  let modified = false;
  const existingCodes = new Set(Object.keys(shortlinksMap));

  userDb.projects.forEach(p => {
    // 1. Projeto raiz (6 caracteres)
    if (!p.shortCode || p.shortCode.length !== 6 || RESERVED_WORDS.has(p.shortCode)) {
      p.shortCode = generateRandomShortCode(6, existingCodes);
      modified = true;
    } else {
      existingCodes.add(p.shortCode);
    }
    shortlinksMap[p.shortCode] = {
      code: p.shortCode,
      type: 'project',
      userId,
      projectId: p.id,
      slug: p.slug || ''
    };

    // 2. Subpastas (7 a 9 caracteres dependendo da profundidade)
    const folders = p.folders || [];
    folders.forEach(f => {
      const depth = getFolderDepth(f, folders, p.driveFolderId);
      const targetLen = getRequiredCodeLength('folder', depth);
      if (!f.shortCode || f.shortCode.length !== targetLen || RESERVED_WORDS.has(f.shortCode)) {
        f.shortCode = generateRandomShortCode(targetLen, existingCodes);
        modified = true;
      } else {
        existingCodes.add(f.shortCode);
      }
      shortlinksMap[f.shortCode] = {
        code: f.shortCode,
        type: 'folder',
        userId,
        projectId: p.id,
        slug: p.slug || '',
        folderId: f.id
      };
    });

    // 3. Arquivos / Mídias isoladas (10 caracteres)
    const videos = p.videos || [];
    videos.forEach(v => {
      if (!v.shortCode || v.shortCode.length !== 10 || RESERVED_WORDS.has(v.shortCode)) {
        v.shortCode = generateRandomShortCode(10, existingCodes);
        modified = true;
      } else {
        existingCodes.add(v.shortCode);
      }
      shortlinksMap[v.shortCode] = {
        code: v.shortCode,
        type: 'file',
        userId,
        projectId: p.id,
        slug: p.slug || '',
        videoId: v.id,
        driveFileId: v.driveFileId || ''
      };
    });
  });

  return modified;
}

// Sincroniza todos os bancos de dados com o registro global de shortlinks
function syncAllShortLinks() {
  ensureDirectories();
  const shortlinksMap = getShortLinks();
  try {
    const files = fs.readdirSync(USERS_DIR).filter(f => f.endsWith('.json'));
    for (const f of files) {
      const fullPath = path.join(USERS_DIR, f);
      try {
        const userDb = readJsonFileSecure(fullPath);
        if (!userDb) continue;
        const userId = (userDb.user && userDb.user.id) || f.replace('.json', '');
        const modified = ensureShortCodesForUserDb(userId, userDb, shortlinksMap);
        if (modified) {
          writeJsonFileSecure(fullPath, userDb);
        }
      } catch (err) {
        console.error(`Erro ao sincronizar shortlinks para ${f}:`, err);
      }
    }
    saveShortLinks(shortlinksMap);
  } catch (e) {
    console.error('Erro ao sincronizar shortlinks globais:', e);
  }
}

// Resolve um código curto instantaneamente (O(1)) retornando o recurso alvo e projeto
// Também aceita slug, projectId, folderId ou videoId como fallback seguro
function resolveShortLink(code) {
  if (!code) return null;
  const raw = String(code).trim();
  const clean = raw.toLowerCase();
  const map = getShortLinks();
  let entry = map[clean];
  if (!entry) {
    // Tenta sincronizar caso tenha sido criado recentemente
    syncAllShortLinks();
    entry = getShortLinks()[clean];
  }
  if (entry) {
    const userDb = getUserDb(entry.userId);
    const project = (userDb.projects || []).find(p => p.id === entry.projectId || (p.slug && p.slug.toLowerCase() === (entry.slug || '').toLowerCase()));
    if (project) {
      return {
        ...entry,
        project,
        userDb
      };
    }
  }

  // 2. Tenta pelo índice rápido global de slugs (O(1))
  try {
    const slugs = getSlugs();
    if (slugs[clean]) {
      const { userId, projectId } = slugs[clean];
      const userDb = getUserDb(userId);
      const project = (userDb.projects || []).find(p => p.id === projectId || (p.slug && p.slug.toLowerCase() === clean));
      if (project) {
        return {
          code: project.shortCode || project.slug || project.id,
          type: 'project',
          userId,
          projectId: project.id,
          slug: project.slug || '',
          project,
          userDb
        };
      }
    }
  } catch (e) {}

  // 3. Fallback: procura por projectId, slug, folderId ou videoId em todos os bancos de usuários
  ensureDirectories();
  try {
    const files = fs.readdirSync(USERS_DIR).filter(f => f.endsWith('.json'));
    // Ordena arquivos por mtime decrescente para priorizar contas ativas
    files.sort((a, b) => {
      try {
        return fs.statSync(path.join(USERS_DIR, b)).mtimeMs - fs.statSync(path.join(USERS_DIR, a)).mtimeMs;
      } catch (err) { return 0; }
    });

    const candidates = [];
    for (const f of files) {
      const fullPath = path.join(USERS_DIR, f);
      try {
        const parsedDb = readJsonFileSecure(fullPath);
        if (!parsedDb) continue;
        const userId = (parsedDb.user && parsedDb.user.id) || f.replace('.json', '');

        for (const p of parsedDb.projects || []) {
          if (p.id === raw || (p.slug && p.slug.toLowerCase() === clean) || (p.shortCode && p.shortCode.toLowerCase() === clean)) {
            const userDb = getUserDb(userId);
            const project = (userDb.projects || []).find(pr => pr.id === p.id) || p;
            candidates.push({
              code: project.shortCode || project.slug || project.id,
              type: 'project',
              userId,
              projectId: project.id,
              slug: project.slug || '',
              project,
              userDb,
              updatedAt: new Date(project.updatedAt || 0).getTime()
            });
          }
          for (const fol of p.folders || []) {
            if (fol.id === raw || (fol.shortCode && fol.shortCode.toLowerCase() === clean)) {
              const userDb = getUserDb(userId);
              const project = (userDb.projects || []).find(pr => pr.id === p.id) || p;
              const matchedFolder = (project.folders || []).find(fl => fl.id === fol.id) || fol;
              return {
                code: matchedFolder.shortCode || matchedFolder.id,
                type: 'folder',
                userId,
                projectId: project.id,
                slug: project.slug || '',
                folderId: matchedFolder.id,
                project,
                userDb
              };
            }
          }
          for (const vid of p.videos || []) {
            if (vid.id === raw || vid.driveFileId === raw || (vid.shortCode && vid.shortCode.toLowerCase() === clean)) {
              const userDb = getUserDb(userId);
              const project = (userDb.projects || []).find(pr => pr.id === p.id) || p;
              const matchedVid = (project.videos || []).find(v => v.id === vid.id) || vid;
              return {
                code: matchedVid.shortCode || matchedVid.id,
                type: 'file',
                userId,
                projectId: project.id,
                slug: project.slug || '',
                videoId: matchedVid.id,
                driveFileId: matchedVid.driveFileId || '',
                project,
                userDb
              };
            }
          }
        }
      } catch (err) {}
    }

    if (candidates.length > 0) {
      candidates.sort((a, b) => b.updatedAt - a.updatedAt);
      const chosen = candidates[0];
      if (chosen.slug) {
        try {
          const slugs = getSlugs();
          slugs[chosen.slug.toLowerCase()] = { userId: chosen.userId, projectId: chosen.projectId };
          saveSlugs(slugs);
        } catch (e) {}
      }
      return chosen;
    }
  } catch (e) {}

  return null;
}

// Verifica se comentários estão permitidos para um determinado arquivo/mídia dentro do contexto
function isCommentsAllowed(item, project, scopedFolderId = null) {
  if (!item || !project) return false;

  // 1. Configuração explícita do próprio arquivo/mídia (precedência máxima)
  if (item.allowComments === true) return true;
  if (item.allowComments === false) return false;

  // 2. Herança da hierarquia de pastas
  const folders = project.folders || [];
  let curFolder = folders.find(f => f.id === (item.driveFolderId || item.folderId));

  while (curFolder) {
    if (curFolder.allowComments === true) return true;
    if (curFolder.allowComments === false) return false;

    // Se a navegação está restrita ao escopo da pasta do link compartilhado, respeita o teto
    if (scopedFolderId && curFolder.id === scopedFolderId) {
      break;
    }
    curFolder = curFolder.parentId ? folders.find(f => f.id === curFolder.parentId) : null;
  }

  // 3. Fallback para configuração do diretório raiz
  return project.allowComments !== false;
}

// Verifica se comentários estão permitidos para uma pasta dentro do contexto
function isFolderCommentsAllowed(folder, project, scopedFolderId = null) {
  if (!folder || !project) return project ? (project.allowComments !== false) : true;

  let curFolder = folder;
  const folders = project.folders || [];

  while (curFolder) {
    if (curFolder.allowComments === true) return true;
    if (curFolder.allowComments === false) return false;

    if (scopedFolderId && curFolder.id === scopedFolderId) {
      break;
    }
    curFolder = curFolder.parentId ? folders.find(f => f.id === curFolder.parentId) : null;
  }

  return project.allowComments !== false;
}

// Verifica se compartilhamento de link está permitido para um determinado arquivo/mídia dentro do contexto
function isShareAllowed(item, project, scopedFolderId = null) {
  if (!item || !project) return true;

  // 1. Configuração explícita do próprio arquivo/mídia (precedência máxima)
  if (item.allowShare === true) return true;
  if (item.allowShare === false) return false;

  // 2. Herança da hierarquia de pastas
  const folders = project.folders || [];
  let curFolder = folders.find(f => f.id === (item.driveFolderId || item.folderId));

  while (curFolder) {
    if (curFolder.allowShare === true) return true;
    if (curFolder.allowShare === false) return false;

    if (scopedFolderId && curFolder.id === scopedFolderId) {
      break;
    }
    curFolder = curFolder.parentId ? folders.find(f => f.id === curFolder.parentId) : null;
  }

  // 3. Fallback para configuração do diretório raiz (padrão true)
  return project.allowShare !== false;
}

// Verifica se compartilhamento de link está permitido para uma pasta dentro do contexto
function isFolderShareAllowed(folder, project, scopedFolderId = null) {
  if (!folder || !project) return project ? (project.allowShare !== false) : true;

  let curFolder = folder;
  const folders = project.folders || [];

  while (curFolder) {
    if (curFolder.allowShare === true) return true;
    if (curFolder.allowShare === false) return false;

    if (scopedFolderId && curFolder.id === scopedFolderId) {
      break;
    }
    curFolder = curFolder.parentId ? folders.find(f => f.id === curFolder.parentId) : null;
  }

  return project.allowShare !== false;
}

// Retorna a cadeia de escopos de senha que protegem uma pasta (da própria pasta subindo até o diretório raiz)
// Regra: se a própria pasta, qualquer pasta-pai ou o diretório-pai tiver senha, o item herda a proteção.
function getFolderPasswordChain(folderOrId, project, scopedFolderId = null) {
  if (!project) return [];
  const folders = project.folders || [];
  let curFolder = typeof folderOrId === 'object' && folderOrId !== null
    ? folderOrId
    : (folderOrId ? folders.find(f => f.id === folderOrId || f.shortCode === folderOrId) : null);

  const chain = [];
  const visited = new Set();

  while (curFolder && !visited.has(curFolder.id)) {
    visited.add(curFolder.id);
    const fPwd = curFolder.password ? String(curFolder.password).trim() : '';
    if (fPwd) {
      chain.push({
        scopeType: 'folder',
        id: curFolder.id,
        shortCode: curFolder.shortCode || null,
        slug: null,
        name: curFolder.name || 'Pasta',
        password: fPwd
      });
    }
    if (scopedFolderId && curFolder.id === scopedFolderId) {
      break;
    }
    curFolder = curFolder.parentId ? folders.find(f => f.id === curFolder.parentId) : null;
  }

  // Se a navegação está escopada em scopedFolderId mas nenhuma senha própria foi definida até ele,
  // herda a proteção de qualquer pasta ancestral ou do diretório-pai
  if (scopedFolderId && chain.length === 0) {
    let ancestor = curFolder && curFolder.parentId ? folders.find(f => f.id === curFolder.parentId) : null;
    while (ancestor && !visited.has(ancestor.id)) {
      visited.add(ancestor.id);
      const aPwd = ancestor.password ? String(ancestor.password).trim() : '';
      if (aPwd) {
        chain.push({
          scopeType: 'folder',
          id: ancestor.id,
          shortCode: ancestor.shortCode || null,
          slug: null,
          name: ancestor.name || 'Pasta',
          password: aPwd
        });
        break;
      }
      ancestor = ancestor.parentId ? folders.find(f => f.id === ancestor.parentId) : null;
    }
  }

  const projPwd = project.password ? String(project.password).trim() : '';
  if (projPwd && (!scopedFolderId || chain.length === 0)) {
    chain.push({
      scopeType: 'project',
      id: project.id,
      shortCode: project.shortCode || null,
      slug: project.slug || null,
      name: project.name || 'Diretório',
      password: projPwd
    });
  }

  return chain;
}

// Retorna a cadeia de escopos de senha que protegem um arquivo/mídia (do próprio arquivo subindo até o diretório raiz)
function getVideoPasswordChain(itemOrId, project, scopedFolderId = null) {
  if (!project) return [];
  const videos = project.videos || [];
  const item = typeof itemOrId === 'object' && itemOrId !== null
    ? itemOrId
    : (itemOrId ? videos.find(v => v.id === itemOrId || v.shortCode === itemOrId || v.driveFileId === itemOrId) : null);

  const chain = [];
  if (item) {
    const vPwd = item.password ? String(item.password).trim() : '';
    if (vPwd) {
      chain.push({
        scopeType: 'file',
        id: item.id,
        shortCode: item.shortCode || null,
        driveFileId: item.driveFileId || null,
        slug: null,
        name: item.title || item.fileName || 'Arquivo',
        password: vPwd
      });
    }
    const parentFolderId = item.driveFolderId || item.folderId;
    if (parentFolderId && parentFolderId !== project.driveFolderId) {
      const folderChain = getFolderPasswordChain(parentFolderId, project, scopedFolderId);
      chain.push(...folderChain);
      return chain;
    }
  }

  const projPwd = project.password ? String(project.password).trim() : '';
  if (projPwd) {
    chain.push({
      scopeType: 'project',
      id: project.id,
      shortCode: project.shortCode || null,
      slug: project.slug || null,
      name: project.name || 'Diretório',
      password: projPwd
    });
  }

  return chain;
}

function isFolderPasswordProtected(folderOrId, project, scopedFolderId = null) {
  return getFolderPasswordChain(folderOrId, project, scopedFolderId).length > 0;
}

function isVideoPasswordProtected(itemOrId, project, scopedFolderId = null) {
  return getVideoPasswordChain(itemOrId, project, scopedFolderId).length > 0;
}

// Obtém o banco de dados do usuário
function getUserDb(identifier) {
  ensureDirectories();
  const userId = normalizeUserId(identifier);
  const filePath = path.join(USERS_DIR, `${userId}.json`);

  if (!fs.existsSync(filePath)) {
    // Procura por e-mail ou sub dentro dos arquivos existentes caso o ID tenha mudado de formato
    const matched = findUserFileByIdentifier(identifier);
    if (matched) return matched.db;
    return createDefaultUserDb({ id: userId });
  }

  try {
    const data = readJsonFileSecure(filePath);
    if (!data) return createDefaultUserDb({ id: userId });
    const currentYear = new Date().getFullYear().toString();

    // Garantir estrutura mínima e defaults
    if (!data.user) data.user = { id: userId };
    if (!data.settings) data.settings = { appName: 'Giffú Entrega', theme: 'dark' };
    if (data.settings.authorNameCustomized && data.settings.authorName) {
      data.user.name = data.settings.authorName;
    }
    // Sincroniza foto de perfil do Google com o perfil do autor
    if (data.user && data.user.avatar && (!data.settings.authorAvatar || data.settings.authorAvatar.includes('default-user'))) {
      data.settings.authorAvatar = data.user.avatar;
    }
    
    // Categorias: sempre começa com "Categoria Padrão" se vazio
    if (!Array.isArray(data.categories) || data.categories.length === 0) {
      data.categories = [{ id: 'cat-padrao', name: 'Categoria Padrão' }];
    } else {
      data.categories.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { numeric: true, sensitivity: 'base' }));
    }

    if (!Array.isArray(data.years)) data.years = [currentYear];
    if (!data.years.includes(currentYear)) {
      data.years.unshift(currentYear);
      data.years.sort((a, b) => b.localeCompare(a));
    }

    // Divisões: inicialização e compatibilidade com anos existentes
    if (!Array.isArray(data.divisions)) {
      data.divisions = [];
    }

    const defaultCatName = (data.categories && data.categories[0] && data.categories[0].name) || 'Categoria Padrão';

    // Para cada projeto existente, garantir que esteja vinculado a uma divisão
    if (Array.isArray(data.projects)) {
      data.projects.forEach(p => {
        const cat = p.category || defaultCatName;
        const divName = (p.division && String(p.division).trim()) || (p.year && String(p.year).trim()) || currentYear;
        
        let div = null;
        if (p.divisionId) {
          div = data.divisions.find(d => d.id === p.divisionId);
        }
        if (!div) {
          div = data.divisions.find(d => d.category === cat && d.name.toLowerCase() === divName.toLowerCase());
        }
        if (!div) {
          div = {
            id: `div-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            name: divName,
            category: cat,
            parentId: null,
            createdAt: p.createdAt || new Date().toISOString()
          };
          data.divisions.push(div);
        }
        p.divisionId = div.id;
        p.division = div.name;
        p.category = cat;
      });
    }

    // Se alguma categoria não tiver nenhuma divisão, cria a divisão padrão com base no ano atual
    if (Array.isArray(data.categories)) {
      data.categories.forEach(c => {
        const hasDiv = data.divisions.some(d => d.category === c.name);
        if (!hasDiv) {
          data.divisions.push({
            id: `div-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            name: currentYear,
            category: c.name,
            parentId: null,
            createdAt: new Date().toISOString()
          });
        }
      });
    }
    if (!Array.isArray(data.projects)) {
      data.projects = [];
    } else {
      data.projects.forEach(p => {
        if (Array.isArray(p.videos)) {
          p.videos.forEach(v => {
            if (v.size === 'Original' || v.size === 'original') {
              v.size = '';
            }
            const name = String(v.fileName || v.title || '').toLowerCase();
            const mime = String(v.mimeType || '').toLowerCase();
            const ext = (name.split('.').pop() || '').toLowerCase();
            if (ext === 'psd' || mime === 'image/x-photoshop' || mime === 'image/vnd.adobe.photoshop') {
              v.type = 'image';
              v.subType = 'psd';
              v.extension = 'PSD';
              if (!v.previewUrl && v.driveFileId) v.previewUrl = `/api/stream/preview?drive=${v.driveFileId}&size=2000`;
              if (!v.thumbnailUrl && v.driveFileId) v.thumbnailUrl = `/api/stream/preview?drive=${v.driveFileId}&size=600`;
            } else if (ext === 'ai' || mime === 'application/illustrator') {
              v.type = 'image';
              v.subType = 'ai';
              v.extension = 'AI';
              if (!v.previewUrl && v.driveFileId) v.previewUrl = `/api/stream/preview?drive=${v.driveFileId}&size=2000`;
              if (!v.thumbnailUrl && v.driveFileId) v.thumbnailUrl = `/api/stream/preview?drive=${v.driveFileId}&size=600`;
            } else if (ext === 'pdf' || mime === 'application/pdf') {
              v.type = 'pdf';
              v.subType = 'pdf';
              v.extension = 'PDF';
              if (!v.previewUrl && v.driveFileId) v.previewUrl = `/api/stream/preview?drive=${v.driveFileId}&size=2000`;
              if (!v.thumbnailUrl && v.driveFileId) v.thumbnailUrl = `/api/stream/preview?drive=${v.driveFileId}&size=600`;
            } else if (v.type !== 'audio' && (mime.startsWith('audio/') || /\.(mp3|wav|aac|flac|ogg|m4a|aiff|aif|wma|opus|alac|mid|midi)$/i.test(name))) {
              v.type = 'audio';
            }
          });
        }
      });
    }
    if (!Array.isArray(data.comments)) data.comments = [];

    // Garante que shortCodes estejam atribuídos
    const shortlinks = getShortLinks();
    const modified = ensureShortCodesForUserDb(userId, data, shortlinks);
    if (modified) {
      writeJsonFileSecure(filePath, data);
      saveShortLinks(shortlinks);
    }

    return data;
  } catch (e) {
    console.error(`Erro ao ler banco de dados do usuário ${userId}:`, e);
    return createDefaultUserDb({ id: userId });
  }
}

// Salva o banco de dados do usuário e atualiza os slugs correspondentes
function saveUserDb(identifier, data, options = {}) {
  ensureDirectories();
  const userId = normalizeUserId(identifier || (data && data.user && data.user.id));
  const filePath = path.join(USERS_DIR, `${userId}.json`);

  try {
    if (!data.user) data.user = {};
    data.user.id = userId;
    data.updatedAt = new Date().toISOString();

    if (Array.isArray(data.categories)) {
      data.categories.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { numeric: true, sensitivity: 'base' }));
    }

    // Atualiza shortCodes antes de salvar
    const shortlinks = getShortLinks();
    ensureShortCodesForUserDb(userId, data, shortlinks);

    writeJsonFileSecure(filePath, data);
    saveShortLinks(shortlinks);

    // Sincroniza slugs no índice global
    syncUserSlugs(userId, data.projects || []);

    // Agenda sincronização em segundo plano com o cofre criptografado no Google Drive do usuário
    if (!options.skipCloudSync && data.driveTokens && data.driveTokens.refresh_token) {
      scheduleCloudSync(userId);
    }

    return true;
  } catch (e) {
    console.error(`Erro ao salvar banco de dados do usuário ${userId}:`, e);
    return false;
  }
}

// Procura usuário por e-mail ou sub em data/users/
function findUserFileByIdentifier(identifier) {
  ensureDirectories();
  const cleanId = String(identifier || '').toLowerCase().trim();
  if (!cleanId) return null;

  try {
    const files = fs.readdirSync(USERS_DIR).filter(f => f.endsWith('.json'));
    for (const f of files) {
      const fullPath = path.join(USERS_DIR, f);
      try {
        const db = readJsonFileSecure(fullPath);
        if (!db) continue;
        const u = db.user || {};
        if (
          u.id === cleanId ||
          u.sub === cleanId ||
          (u.email && u.email.toLowerCase() === cleanId) ||
          f === `${normalizeUserId(cleanId)}.json`
        ) {
          return { file: f, path: fullPath, userId: u.id || f.replace('.json', ''), db };
        }
      } catch (err) {}
    }
  } catch (e) {}
  return null;
}

// Verifica se o nome do autor foi personalizado pelo usuário
function isAuthorNameCustomized(userDb, googleProfileName) {
  if (!userDb || !userDb.settings) return false;
  if (userDb.settings.authorNameCustomized === true) return true;
  if (userDb.settings.authorNameCustomized === false) return false;
  // Compatibilidade com usuários que já haviam personalizado o nome antes da criação da flag:
  if (userDb.settings.authorName && googleProfileName) {
    const cur = String(userDb.settings.authorName).trim().toLowerCase();
    const gName = String(googleProfileName).trim().toLowerCase();
    if (cur && cur !== gName && cur !== 'giffú' && cur !== 'giffú autor') {
      return true;
    }
  }
  return false;
}

// Encontra ou cria o banco de dados do usuário a partir do perfil Google
function getOrCreateUserDb(profile) {
  ensureDirectories();
  const email = (profile.email || '').toLowerCase().trim();
  const sub = profile.sub || null;

  // 1. Tenta achar por sub ou e-mail
  let found = findUserFileByIdentifier(sub) || (email ? findUserFileByIdentifier(email) : null);

  let userDb;
  let userId;

  if (found) {
    userDb = found.db;
    userId = found.userId;
    // Atualiza dados técnicos de perfil
    if (sub) userDb.user.sub = sub;
    if (email) userDb.user.email = email;
    if (profile.avatar) userDb.user.avatar = profile.avatar;
    if (!userDb.settings) userDb.settings = {};

    // Sincroniza foto de perfil do Google com o perfil do autor
    if (profile.avatar || !userDb.settings.authorAvatar || userDb.settings.authorAvatar.includes('default-user')) {
      userDb.settings.authorAvatar = profile.avatar || userDb.user.avatar || userDb.settings.authorAvatar;
    }

    const customized = isAuthorNameCustomized(userDb, profile.name);

    if (customized) {
      // Nome personalizado gravado: mantém intacto e não sobrescreve com o nome do Google
      userDb.settings.authorNameCustomized = true;
      userDb.user.name = userDb.settings.authorName;
    } else {
      // Usuário com nome do autor inalterado: permanece com o nome original do Google
      userDb.settings.authorNameCustomized = false;
      userDb.user.name = profile.name || userDb.user.name || 'Autor';
      userDb.settings.authorName = profile.name || userDb.user.name || 'Autor';
    }
  } else {
    // Novo usuário: permanece com o nome original do Google até ser alterado
    userId = normalizeUserId(sub || email);
    userDb = createDefaultUserDb({ ...profile, id: userId });
  }

  saveUserDb(userId, userDb);
  return { userDb, userId };
}

// Busca projeto por slug ou shortCode em qualquer autor
function findProjectBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = String(slug).toLowerCase().trim();

  // 1. Tenta pelo índice rápido global de slugs (O(1))
  try {
    const slugs = getSlugs();
    if (slugs[cleanSlug]) {
      const { userId, projectId } = slugs[cleanSlug];
      const userDb = getUserDb(userId);
      const proj = (userDb.projects || []).find(p => (p.slug && p.slug.toLowerCase() === cleanSlug) || p.id === projectId);
      if (proj) return { project: proj, userDb, userId };
    }
  } catch (e) {}

  // 2. Tenta pelo resolvedor geral de links (que inclui shortcodes e varredura segura com ordenação)
  const resolved = resolveShortLink(cleanSlug);
  if (resolved && resolved.project) {
    return { project: resolved.project, userDb: resolved.userDb, userId: resolved.userId };
  }

  return null;
}

// Busca usuário e projeto a partir do ID do projeto
function findUserByProjectId(projectId) {
  if (!projectId) return null;
  ensureDirectories();
  try {
    const files = fs.readdirSync(USERS_DIR).filter(f => f.endsWith('.json'));
    for (const f of files) {
      const fullPath = path.join(USERS_DIR, f);
      try {
        const userDb = readJsonFileSecure(fullPath);
        if (!userDb) continue;
        const proj = (userDb.projects || []).find(p => p.id === projectId);
        if (proj) {
          const userId = (userDb.user && userDb.user.id) || f.replace('.json', '');
          return { userDb, project: proj, userId };
        }
      } catch (err) {}
    }
  } catch (e) {}
  return null;
}

// Busca qual usuário/projeto possui um vídeo do Google Drive (para streaming)
function findVideoByDriveId(driveFileId) {
  if (!driveFileId) return null;
  const now = Date.now();
  const cached = driveIdLookupCache.get(driveFileId);
  if (cached && cached.expiresAt > now) {
    return cached.result;
  }

  ensureDirectories();
  try {
    const files = fs.readdirSync(USERS_DIR).filter(f => f.endsWith('.json'));
    for (const f of files) {
      const fullPath = path.join(USERS_DIR, f);
      try {
        const userDb = readJsonFileSecure(fullPath);
        if (!userDb) continue;
        for (const proj of userDb.projects || []) {
          for (const vid of proj.videos || []) {
            if (vid.driveFileId === driveFileId) {
              const userId = (userDb.user && userDb.user.id) || f.replace('.json', '');
              const result = { video: vid, project: proj, userDb, userId };
              driveIdLookupCache.set(driveFileId, { result, expiresAt: now + 15000 });
              return result;
            }
          }
        }
      } catch (err) {}
    }
  } catch (e) {}
  return null;
}

// Busca qual usuário possui um determinado comentário ou resposta
function findCommentById(commentId) {
  if (!commentId) return null;
  ensureDirectories();
  try {
    const files = fs.readdirSync(USERS_DIR).filter(f => f.endsWith('.json'));
    for (const f of files) {
      const fullPath = path.join(USERS_DIR, f);
      try {
        const userDb = readJsonFileSecure(fullPath);
        if (!userDb) continue;
        for (const comm of userDb.comments || []) {
          if (comm.id === commentId) {
            const userId = (userDb.user && userDb.user.id) || f.replace('.json', '');
            return { comment: comm, isReply: false, userDb, userId };
          }
          for (const rep of comm.replies || []) {
            if (rep.id === commentId) {
              const userId = (userDb.user && userDb.user.id) || f.replace('.json', '');
              return { comment: comm, reply: rep, isReply: true, userDb, userId };
            }
          }
        }
      } catch (err) {}
    }
  } catch (e) {}
  return null;
}

// Helper para garantir nome do arquivo com respectiva extensão
function resolveItemFileName(vid) {
  if (!vid) return 'Arquivo';
  let name = String(vid.fileName || vid.name || vid.title || 'Arquivo').trim();
  if (/\.[a-zA-Z0-9]{2,5}$/.test(name)) return name;
  if (vid.type === 'video') return `${name}.mp4`;
  if (vid.type === 'image') return `${name}.jpg`;
  if (vid.type === 'audio') return `${name}.mp3`;
  return name;
}

function normalizeSearchStr(str) {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getProjectParticipants(userDb, projectId = null) {
  const map = new Map();
  if (!userDb) return [];

  const authorEmail = ((userDb.settings && userDb.settings.authorEmail) || (userDb.user && userDb.user.email) || '').toLowerCase().trim();
  const authorName = (userDb.settings && userDb.settings.authorName) || (userDb.user && userDb.user.name) || 'Giffú';
  const authorAltName = (userDb.user && userDb.user.name) || '';
  const authorAvatar = (userDb.settings && userDb.settings.authorAvatar) || (userDb.user && userDb.user.avatar) || '';

  const addEntry = (name, email, avatar, isAuthor, altName = '') => {
    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').toLowerCase().trim();
    if (!cleanName && !cleanEmail) return;
    const key = cleanEmail || `name:${normalizeSearchStr(cleanName)}`;
    if (!map.has(key)) {
      map.set(key, {
        name: cleanName || cleanEmail.split('@')[0],
        altName: String(altName || '').trim(),
        email: cleanEmail,
        avatar: avatar || '',
        isAuthor: Boolean(isAuthor)
      });
    } else {
      const existing = map.get(key);
      if (isAuthor) existing.isAuthor = true;
      if (avatar && !existing.avatar) existing.avatar = avatar;
      if (altName && !existing.altName) existing.altName = String(altName).trim();
    }
  };

  addEntry(authorName, authorEmail, authorAvatar, true, authorAltName);

  const comments = Array.isArray(userDb.comments) ? userDb.comments : [];
  comments.forEach(c => {
    if (projectId && c.projectId !== projectId) return;
    addEntry(c.authorName, c.authorEmail, c.authorAvatar, c.isAuthor);
    (c.replies || []).forEach(r => {
      addEntry(r.authorName, r.authorEmail, r.authorAvatar, r.isAuthor);
    });
  });

  // Se houver outros comentários do banco também adiciona como fallback
  if (projectId) {
    comments.forEach(c => {
      if (c.projectId === projectId) return;
      addEntry(c.authorName, c.authorEmail, c.authorAvatar, c.isAuthor);
      (c.replies || []).forEach(r => {
        addEntry(r.authorName, r.authorEmail, r.authorAvatar, r.isAuthor);
      });
    });
  }

  return Array.from(map.values());
}

function isNameMentionedInContent(content, candidateName) {
  const normContent = normalizeSearchStr(content);
  const normName = normalizeSearchStr(candidateName);
  if (!normContent || !normName) return false;

  const escaped = normName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(^|[\\s(\\[{,;:])@${escaped}(?=$|[\\s.,!?;:)\\]}])`, 'i');
  return regex.test(normContent);
}

function extractMentionsFromText(content, userDb, projectId = null) {
  if (!content || typeof content !== 'string') return [];
  const participants = getProjectParticipants(userDb, projectId);
  const matched = [];
  const seenKeys = new Set();

  for (const p of participants) {
    const matchedMain = isNameMentionedInContent(content, p.name);
    const matchedAlt = p.altName && isNameMentionedInContent(content, p.altName);
    const firstName = p.name ? p.name.split(/\s+/)[0] : '';
    const matchedFirst = firstName.length >= 3 && isNameMentionedInContent(content, firstName);

    if (matchedMain || matchedAlt || matchedFirst) {
      const key = p.email || normalizeSearchStr(p.name);
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        matched.push({
          name: p.name,
          email: p.email || '',
          isAuthor: Boolean(p.isAuthor)
        });
      }
    }
  }

  return matched;
}

function isUserMentionedInItem(item, userEmail, userName, userAltName = '') {
  if (!item) return false;
  const cleanEmail = userEmail ? String(userEmail).trim().toLowerCase() : '';
  const normName = normalizeSearchStr(userName);
  const normAlt = normalizeSearchStr(userAltName);

  if (Array.isArray(item.mentions) && item.mentions.length > 0) {
    for (const m of item.mentions) {
      if (cleanEmail && m.email && String(m.email).trim().toLowerCase() === cleanEmail) return true;
      if (normName && m.name && normalizeSearchStr(m.name) === normName) return true;
      if (normAlt && m.name && normalizeSearchStr(m.name) === normAlt) return true;
    }
  }

  if (item.content) {
    if (userName && isNameMentionedInContent(item.content, userName)) return true;
    if (userAltName && isNameMentionedInContent(item.content, userAltName)) return true;
    if (userName) {
      const firstName = String(userName).trim().split(/\s+/)[0];
      if (firstName.length >= 3 && isNameMentionedInContent(item.content, firstName)) return true;
    }
  }

  return false;
}

function buildNotificationItem(c, proj, vid, userEmail, userName, userAltName = '', isProjectAuthor = false) {
  const replies = Array.isArray(c.replies) ? c.replies : [];
  const latestReply = replies.length > 0 ? replies[replies.length - 1] : null;
  const lastActivityAt = latestReply ? (latestReply.createdAt || c.createdAt) : (c.createdAt || new Date().toISOString());

  const mentionedInComment = isUserMentionedInItem(c, userEmail, userName, userAltName);
  const mentionedInReply = replies.some(r => isUserMentionedInItem(r, userEmail, userName, userAltName));
  const isMentioned = mentionedInComment || mentionedInReply;
  const isCommentOwner = Boolean(
    (userEmail && c.authorEmail && String(c.authorEmail).trim().toLowerCase() === userEmail) ||
    (userName && c.authorName && normalizeSearchStr(c.authorName) === normalizeSearchStr(userName))
  );

  return {
    id: c.id,
    projectId: c.projectId,
    projectName: proj ? (proj.name || 'Projeto') : 'Projeto',
    projectSlug: proj ? (proj.shortCode || proj.slug || '') : '',
    videoId: c.videoId,
    videoTitle: vid ? (vid.title || vid.name || vid.fileName || 'Arquivo') : 'Arquivo',
    fileName: resolveItemFileName(vid),
    videoType: vid ? (vid.type || 'video') : 'video',
    videoShortCode: vid ? (vid.shortCode || vid.id) : '',
    folderId: vid ? (vid.driveFolderId || vid.folderId || null) : null,
    authorName: c.authorName || 'Usuário',
    authorEmail: c.authorEmail || '',
    authorAvatar: c.authorAvatar || '',
    isAuthor: Boolean(c.isAuthor),
    isProjectAuthor: Boolean(isProjectAuthor),
    timecode: c.timecode || 0,
    timecodeFormatted: c.timecodeFormatted || '00:00',
    content: c.content || '',
    mentions: c.mentions || [],
    createdAt: c.createdAt || new Date().toISOString(),
    lastActivityAt,
    replies: replies.map(r => ({
      id: r.id,
      authorName: r.authorName || 'Usuário',
      authorEmail: r.authorEmail || '',
      authorAvatar: r.authorAvatar || '',
      isAuthor: Boolean(r.isAuthor),
      content: r.content || '',
      mentions: r.mentions || [],
      createdAt: r.createdAt || new Date().toISOString()
    })),
    repliesCount: replies.length,
    latestReply: latestReply ? {
      id: latestReply.id,
      authorName: latestReply.authorName || 'Usuário',
      authorEmail: latestReply.authorEmail || '',
      authorAvatar: latestReply.authorAvatar || '',
      isAuthor: Boolean(latestReply.isAuthor),
      content: latestReply.content || '',
      mentions: latestReply.mentions || [],
      createdAt: latestReply.createdAt || new Date().toISOString()
    } : null,
    isMentioned,
    mentionedInComment,
    mentionedInReply,
    isCommentOwner,
    resolved: Boolean(c.resolved),
    resolvedAt: c.resolvedAt || null
  };
}

function isResolvedNotificationExpired(c, settings) {
  if (!c || !c.resolved || !settings || !settings.autoDeleteResolvedNotifications) return false;
  const days = Math.max(1, parseInt(settings.autoDeleteResolvedDays, 10) || 7);
  const maxAgeMs = days * 24 * 60 * 60 * 1000;
  const refDateStr = c.resolvedAt || c.updatedAt || c.createdAt;
  if (!refDateStr) return false;
  const refTime = new Date(refDateStr).getTime();
  if (Number.isNaN(refTime)) return false;
  return (Date.now() - refTime) >= maxAgeMs;
}

// Busca comentários pendentes (não resolvidos) e anteriores (resolvidos) para notificações
// Toda conta Google é unificada: vê todos os comentários dos projetos dos quais é autora (isProjectAuthor: true)
// e também os comentários/respostas/@menções dos projetos de outros autores em que interagiu como cliente (isProjectAuthor: false)
function getPendingNotifications(user, currentProjectId = null, currentCode = null) {
  ensureDirectories();
  const pending = [];
  const history = [];

  try {
    const userId = user && user.id ? String(user.id).trim() : null;
    const userEmail = user && user.email ? String(user.email).trim().toLowerCase() : null;
    const userName = user && user.name ? String(user.name).trim() : null;

    // Se veio shortCode, resolve para descobrir o projeto atual
    let resolvedProjectId = currentProjectId;
    if (!resolvedProjectId && currentCode) {
      const resolved = resolveShortLink(currentCode);
      if (resolved && resolved.project) {
        resolvedProjectId = resolved.project.id;
      }
    }

    const files = fs.readdirSync(USERS_DIR).filter(f => f.endsWith('.json'));
    for (const f of files) {
      try {
        const dbUserId = f.replace(/\.json$/, '');
        const userDb = readJsonFileSecure(path.join(USERS_DIR, f));
        if (!userDb) continue;
        const comments = userDb.comments || [];
        const dbAuthorEmail = userDb.user && userDb.user.email ? String(userDb.user.email).trim().toLowerCase() : '';
        const authorSettingsName = (userDb.settings && userDb.settings.authorName) || (userDb.user && userDb.user.name) || '';
        const isProjectAuthor = Boolean(
          (userId && userId === dbUserId) ||
          (userEmail && dbAuthorEmail && userEmail === dbAuthorEmail)
        );

        comments.forEach(c => {
          if (!isProjectAuthor && resolvedProjectId && c.projectId !== resolvedProjectId) {
            if (!userEmail && !userName) return;
          }

          let isRelevant = false;
          if (isProjectAuthor) {
            isRelevant = true;
          } else if (userEmail || userName) {
            const isOwner = Boolean(
              (userEmail && c.authorEmail && String(c.authorEmail).trim().toLowerCase() === userEmail) ||
              (userName && c.authorName && normalizeSearchStr(c.authorName) === normalizeSearchStr(userName))
            );
            const hasReplied = (c.replies || []).some(r =>
              (userEmail && r.authorEmail && String(r.authorEmail).trim().toLowerCase() === userEmail) ||
              (userName && r.authorName && normalizeSearchStr(r.authorName) === normalizeSearchStr(userName))
            );
            const mentioned = isUserMentionedInItem(c, userEmail, userName, '') ||
              (c.replies || []).some(r => isUserMentionedInItem(r, userEmail, userName, ''));
            isRelevant = isOwner || hasReplied || mentioned;
          } else {
            isRelevant = Boolean(resolvedProjectId && c.projectId === resolvedProjectId);
          }

          if (isRelevant) {
            const proj = (userDb.projects || []).find(p => p.id === c.projectId);
            const vid = proj && (proj.videos || []).find(v => v.id === c.videoId);
            const item = buildNotificationItem(
              c,
              proj,
              vid,
              userEmail,
              isProjectAuthor ? (authorSettingsName || userName) : userName,
              isProjectAuthor ? userName : '',
              isProjectAuthor
            );
            if (c.resolved) {
              if (!isResolvedNotificationExpired(c, userDb.settings)) {
                history.push(item);
              }
            } else {
              pending.push(item);
            }
          }
        });
      } catch (err) {}
    }
  } catch (e) {
    console.error('Erro ao buscar notificações pendentes:', e);
  }

  // Deduplica pending por id e ordena pela atividade mais recente (comentário ou última resposta)
  const seenPending = new Set();
  const dedupedPending = [];
  for (const item of pending) {
    if (!seenPending.has(item.id)) {
      seenPending.add(item.id);
      dedupedPending.push(item);
    }
  }
  dedupedPending.sort((a, b) => new Date(b.lastActivityAt || b.createdAt) - new Date(a.lastActivityAt || a.createdAt));

  // Deduplica history por id
  const seenHistory = new Set();
  const dedupedHistory = [];
  for (const item of history) {
    if (!seenHistory.has(item.id) && !seenPending.has(item.id)) {
      seenHistory.add(item.id);
      dedupedHistory.push(item);
    }
  }
  dedupedHistory.sort((a, b) => {
    const timeA = new Date(a.resolvedAt || a.lastActivityAt || a.createdAt).getTime();
    const timeB = new Date(b.resolvedAt || b.lastActivityAt || b.createdAt).getTime();
    return timeB - timeA;
  });

  return {
    pending: dedupedPending,
    history: dedupedHistory.slice(0, 50)
  };
}

// ---------- Sincronização em Nuvem Criptografada por Conta Google ----------
const cloudSyncTimers = new Map();
const cloudSyncInFlight = new Set();

function getCloudVaultKey(userDb) {
  let clientSecret = '';
  try {
    const google = require('./google');
    const cfg = google.getOAuthConfig(() => userDb);
    clientSecret = cfg.clientSecret || '';
  } catch (e) {}
  const secretMaterial = (process.env.CLOUD_VAULT_SECRET || clientSecret || 'giffu-cloud-vault-v1').trim();
  const u = (userDb && userDb.user) || {};
  const userIdentity = String(u.sub || u.email || u.id || 'default').toLowerCase().trim();
  return crypto.scryptSync(secretMaterial, `giffu-cloud-vault:${userIdentity}`, 32);
}

async function findCloudVaultFileId(token, cachedFileId = null) {
  const google = require('./google');
  if (cachedFileId) {
    try {
      const checkRes = await google.request(
        `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(cachedFileId)}?fields=id,trashed`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (checkRes.status === 200 && checkRes.json && checkRes.json.id && !checkRes.json.trashed) {
        return checkRes.json.id;
      }
    } catch (e) {}
  }

  const q = `name = '${CLOUD_VAULT_FILENAME}' and 'root' in parents and trashed = false`;
  const listRes = await google.request(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime%20desc&pageSize=5`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (listRes.status === 200 && listRes.json && Array.isArray(listRes.json.files) && listRes.json.files.length > 0) {
    return listRes.json.files[0].id;
  }
  return null;
}

async function syncUserDbToCloudDrive(identifier) {
  const userId = normalizeUserId(identifier);
  if (cloudSyncInFlight.has(userId)) return false;
  cloudSyncInFlight.add(userId);

  try {
    const userDb = getUserDb(userId);
    if (!userDb || !userDb.driveTokens || !userDb.driveTokens.refresh_token) {
      return false;
    }

    const google = require('./google');
    const token = await google.getDriveAccessToken(userDb);
    if (!token) return false;

    const vaultPayload = {
      version: 1,
      updatedAt: userDb.updatedAt || new Date().toISOString(),
      user: userDb.user || {},
      settings: userDb.settings || {},
      categories: userDb.categories || [],
      years: userDb.years || [],
      projects: userDb.projects || [],
      comments: userDb.comments || []
    };

    const vaultKey = getCloudVaultKey(userDb);
    const encryptedVault = encryptPayload(vaultPayload, vaultKey);
    const bodyStr = JSON.stringify(encryptedVault);

    let fileId = await findCloudVaultFileId(token, userDb.cloudVaultFileId);

    if (!fileId) {
      const metaBody = JSON.stringify({
        name: CLOUD_VAULT_FILENAME,
        mimeType: 'application/json',
        parents: ['root'],
        description: 'Giffu Entrega Encrypted Account Cloud Vault'
      });
      const createRes = await google.request('https://www.googleapis.com/drive/v3/files?fields=id', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(metaBody)
        },
        body: metaBody
      });
      if (createRes.status === 200 && createRes.json && createRes.json.id) {
        fileId = createRes.json.id;
      }
    }

    if (!fileId) return false;

    const uploadRes = await google.request(
      `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(fileId)}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr)
        },
        body: bodyStr,
        timeout: 30000
      }
    );

    if (uploadRes.status === 200 && userDb.cloudVaultFileId !== fileId) {
      userDb.cloudVaultFileId = fileId;
      saveUserDb(userId, userDb, { skipCloudSync: true });
    }
    return uploadRes.status === 200;
  } catch (e) {
    // Falha silenciosa em background para não interromper uso local
    return false;
  } finally {
    cloudSyncInFlight.delete(userId);
  }
}

function scheduleCloudSync(identifier, delayMs = 1500) {
  const userId = normalizeUserId(identifier);
  if (cloudSyncTimers.has(userId)) {
    clearTimeout(cloudSyncTimers.get(userId));
  }
  const timer = setTimeout(() => {
    cloudSyncTimers.delete(userId);
    syncUserDbToCloudDrive(userId).catch(() => {});
  }, delayMs);
  if (typeof timer.unref === 'function') timer.unref();
  cloudSyncTimers.set(userId, timer);
}

// Restaura e mescla os diretórios, categorias, configurações e comentários diretamente do cofre na nuvem (Google Drive) do usuário
async function restoreUserDbFromCloudDrive(identifier, currentDb = null) {
  const userId = normalizeUserId(identifier);
  try {
    const userDb = currentDb || getUserDb(userId);
    if (!userDb || !userDb.driveTokens || !userDb.driveTokens.refresh_token) {
      return userDb;
    }

    const google = require('./google');
    const token = await google.getDriveAccessToken(userDb);
    if (!token) return userDb;

    const fileId = await findCloudVaultFileId(token, userDb.cloudVaultFileId);
    if (!fileId) {
      // Ainda não existe cofre na nuvem para esta conta; cria o primeiro backup imediatamente
      scheduleCloudSync(userId, 300);
      return userDb;
    }

    const downloadRes = await google.request(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000
      }
    );

    if (downloadRes.status !== 200 || !downloadRes.json) {
      return userDb;
    }

    const vaultKey = getCloudVaultKey(userDb);
    let cloudData = null;
    try {
      cloudData = decryptPayload(downloadRes.json, vaultKey);
    } catch (decErr) {
      try {
        cloudData = decryptPayload(downloadRes.json);
      } catch (e2) {
        return userDb;
      }
    }

    if (!cloudData || typeof cloudData !== 'object') return userDb;

    let changed = false;
    if (userDb.cloudVaultFileId !== fileId) {
      userDb.cloudVaultFileId = fileId;
      changed = true;
    }

    // 1. Mescla Projetos (preservando senhas, shortCodes, pastas e vídeos)
    const localProjects = Array.isArray(userDb.projects) ? userDb.projects : [];
    const cloudProjects = Array.isArray(cloudData.projects) ? cloudData.projects : [];
    const localProjById = new Map(localProjects.map(p => [p.id, p]));

    for (const cp of cloudProjects) {
      if (!cp || !cp.id) continue;
      const lp = localProjById.get(cp.id);
      if (!lp) {
        localProjects.push(cp);
        localProjById.set(cp.id, cp);
        changed = true;
      } else {
        const cloudTime = new Date(cp.updatedAt || cp.createdAt || 0).getTime();
        const localTime = new Date(lp.updatedAt || lp.createdAt || 0).getTime();
        if (cloudTime > localTime) {
          Object.assign(lp, cp);
          changed = true;
        }
      }
    }
    userDb.projects = localProjects;

    // 2. Mescla Categorias
    const localCats = Array.isArray(userDb.categories) ? userDb.categories : [];
    const cloudCats = Array.isArray(cloudData.categories) ? cloudData.categories : [];
    const catIds = new Set(localCats.map(c => c.id));
    for (const cc of cloudCats) {
      if (cc && cc.id && !catIds.has(cc.id)) {
        localCats.push(cc);
        catIds.add(cc.id);
        changed = true;
      }
    }
    userDb.categories = localCats;

    // 3. Mescla Anos
    const yearsSet = new Set([...(userDb.years || []), ...(cloudData.years || [])]);
    const mergedYears = Array.from(yearsSet).filter(Boolean).sort((a, b) => String(b).localeCompare(String(a)));
    if (mergedYears.length !== (userDb.years || []).length) {
      userDb.years = mergedYears;
      changed = true;
    }

    // 4. Mescla Comentários e Respostas
    const localComments = Array.isArray(userDb.comments) ? userDb.comments : [];
    const cloudComments = Array.isArray(cloudData.comments) ? cloudData.comments : [];
    const localCommById = new Map(localComments.map(c => [c.id, c]));
    for (const cc of cloudComments) {
      if (!cc || !cc.id) continue;
      const lc = localCommById.get(cc.id);
      if (!lc) {
        localComments.push(cc);
        localCommById.set(cc.id, cc);
        changed = true;
      } else {
        const localReplies = Array.isArray(lc.replies) ? lc.replies : [];
        const replyIds = new Set(localReplies.map(r => r.id));
        for (const cr of (cc.replies || [])) {
          if (cr && cr.id && !replyIds.has(cr.id)) {
            localReplies.push(cr);
            replyIds.add(cr.id);
            changed = true;
          }
        }
        lc.replies = localReplies;
      }
    }
    userDb.comments = localComments;

    // 5. Mescla Configurações se o cofre na nuvem for mais recente ou tiver preferências salvas
    if (cloudData.settings && typeof cloudData.settings === 'object') {
      const cloudUpdated = new Date(cloudData.updatedAt || 0).getTime();
      const localUpdated = new Date(userDb.updatedAt || 0).getTime();
      if (cloudUpdated > localUpdated || !userDb.updatedAt) {
        userDb.settings = {
          ...cloudData.settings,
          ...(userDb.settings || {}),
          authorName: cloudData.settings.authorNameCustomized ? cloudData.settings.authorName : ((userDb.settings && userDb.settings.authorName) || cloudData.settings.authorName),
          authorNameCustomized: Boolean(cloudData.settings.authorNameCustomized || (userDb.settings && userDb.settings.authorNameCustomized)),
          theme: cloudData.settings.theme || (userDb.settings && userDb.settings.theme) || 'dark',
          autoDeleteResolvedNotifications: cloudData.settings.autoDeleteResolvedNotifications ?? (userDb.settings && userDb.settings.autoDeleteResolvedNotifications),
          autoDeleteResolvedDays: cloudData.settings.autoDeleteResolvedDays ?? (userDb.settings && userDb.settings.autoDeleteResolvedDays),
          collapsedYears: cloudData.settings.collapsedYears || (userDb.settings && userDb.settings.collapsedYears),
          collapsedCategories: cloudData.settings.collapsedCategories || (userDb.settings && userDb.settings.collapsedCategories)
        };
        changed = true;
      }
    }

    if (changed) {
      saveUserDb(userId, userDb, { skipCloudSync: true });
    }
    // Também garante que o cofre na nuvem receba eventuais novidades locais
    scheduleCloudSync(userId, 1000);
    return userDb;
  } catch (e) {
    return currentDb || getUserDb(userId);
  }
}

// Migra automaticamente a base legado db.json e garante que TODOS os arquivos em data/ estejam criptografados
function migrateLegacyDbIfNeeded() {
  ensureDirectories();
  const userFiles = fs.readdirSync(USERS_DIR).filter(f => f.endsWith('.json'));
  if (userFiles.length > 0) {
    // Garante que todos os arquivos de usuários sejam lidos e criptografados em disco
    const slugs = getSlugs();
    let slugsChanged = false;
    for (const f of userFiles) {
      try {
        const db = readJsonFileSecure(path.join(USERS_DIR, f));
        if (!db) continue;
        const userId = (db.user && db.user.id) || f.replace('.json', '');
        (db.projects || []).forEach(p => {
          if (p.slug && (!slugs[p.slug] || slugs[p.slug].userId !== userId)) {
            slugs[p.slug] = { userId, projectId: p.id };
            slugsChanged = true;
          }
        });
      } catch (e) {}
    }
    if (slugsChanged || !fs.existsSync(SLUGS_FILE)) {
      saveSlugs(slugs);
    }
    // Remove o data/db.json legado em texto puro caso ainda exista
    if (fs.existsSync(LEGACY_DB_FILE)) {
      try {
        fs.unlinkSync(LEGACY_DB_FILE);
        console.log('[Storage] Arquivo legado data/db.json removido por segurança.');
      } catch (e) {}
    }
    return;
  }

  // Se não há usuários, mas existe o data/db.json legado
  if (fs.existsSync(LEGACY_DB_FILE)) {
    try {
      const legacy = readJsonFileSecure(LEGACY_DB_FILE);
      if (!legacy) return;
      const email = (legacy.settings && legacy.settings.authorEmail) || 'novelfilmes@gmail.com';
      const userId = normalizeUserId(email);

      // Lê tokens legados se existirem
      let driveTokens = null;
      const legacyTokensFile = path.join(CONFIG_DIR, 'drive_tokens.json');
      if (fs.existsSync(legacyTokensFile)) {
        try {
          driveTokens = JSON.parse(fs.readFileSync(legacyTokensFile, 'utf8'));
        } catch (e) {}
      }

      // Converte categorias legadas
      const categories = [
        { id: 'cat-padrao', name: 'Categoria Padrão' }
      ];
      const existingCats = new Set();
      (legacy.projects || []).forEach(p => {
        if (p.category && p.category !== 'Categoria Padrão') {
          existingCats.add(p.category);
        }
      });
      existingCats.forEach(c => {
        categories.push({ id: `cat-${sanitizeId(c)}`, name: c });
      });

      const migratedDb = {
        user: {
          id: userId,
          email,
          name: (legacy.settings && legacy.settings.authorName) || 'Giffú',
          avatar: (legacy.settings && legacy.settings.authorAvatar) || ''
        },
        driveTokens,
        settings: legacy.settings || { appName: 'Giffú Entrega', theme: 'dark' },
        categories,
        years: legacy.years || [new Date().getFullYear().toString()],
        projects: legacy.projects || [],
        comments: legacy.comments || []
      };

      saveUserDb(userId, migratedDb);
      try { fs.unlinkSync(LEGACY_DB_FILE); } catch (e) {}
      console.log(`[Storage] Base legada data/db.json migrada e criptografada com sucesso para o usuário ${userId}`);
    } catch (e) {
      console.error('[Storage] Erro ao migrar base legada:', e);
    }
  }
}

// Executa migração e criptografia na inicialização
migrateLegacyDbIfNeeded();
syncAllShortLinks();

module.exports = {
  getUserDb,
  saveUserDb,
  getOrCreateUserDb,
  isAuthorNameCustomized,
  findUserFileByIdentifier,
  findProjectBySlug,
  findUserByProjectId,
  findVideoByDriveId,
  findCommentById,
  getSlugs,
  saveSlugs,
  normalizeUserId,
  getShortLinks,
  saveShortLinks,
  resolveShortLink,
  syncAllShortLinks,
  generateRandomShortCode,
  isCommentsAllowed,
  isFolderCommentsAllowed,
  isShareAllowed,
  isFolderShareAllowed,
  getFolderPasswordChain,
  getVideoPasswordChain,
  isFolderPasswordProtected,
  isVideoPasswordProtected,
  getPendingNotifications,
  extractMentionsFromText,
  getProjectParticipants,
  syncUserDbToCloudDrive,
  restoreUserDbFromCloudDrive,
  scheduleCloudSync,
  encryptPayload,
  decryptPayload,
  RESERVED_WORDS
};
