const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');
const os = require('os');
const { execSync, spawn } = require('child_process');
const multer = require('multer');
const { ZipArchive } = require('archiver');

const uploadTempDir = path.join(os.tmpdir(), 'giffu-entrega-uploads');
try { fs.mkdirSync(uploadTempDir, { recursive: true }); } catch (e) {}
const upload = multer({
  dest: uploadTempDir,
  limits: { fileSize: 10 * 1024 * 1024 * 1024 } // 10 GB
});

const app = express();
const PORT = process.env.PORT || 3000;

// Permite trust proxy para plataformas de hospedagem em nuvem (Railway, Render, Fly, Nginx, Cloudflare)
app.set('trust proxy', 1);

// Headers HTTP de proteção essencial contra clickjacking, MIME sniffing e XSS
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Bloqueia qualquer tentativa de acesso HTTP direto a arquivos de dados ou JSONs internos (exceto manifest.json do PWA)
app.use((req, res, next) => {
  const reqPath = (req.path || '').toLowerCase();
  if (reqPath === '/manifest.json') {
    return next();
  }
  if (reqPath.startsWith('/data') || (reqPath.endsWith('.json') && !reqPath.startsWith('/api/'))) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
});

app.get(['/favicon.ico', '/favicon.svg'], (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.sendFile(path.join(__dirname, 'public', 'assets', 'Cloud_Entrega.svg'));
});

app.use(express.static(path.join(__dirname, 'public')));

// Database helpers (fallback seguro sem gravar texto puro)
function readDB() {
  const currentYear = new Date().getFullYear().toString();
  return { settings: {}, years: [currentYear], projects: [], comments: [] };
}

function writeDB() {
  return true;
}

function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/\s+/g, '_')                              // replace spaces with _
    .replace(/[^a-z0-9_-]/g, '')                       // remove invalid chars
    .replace(/_+/g, '_');                              // collapse multiple _
}

function classifyResolution(input, height) {
  if (typeof input === 'number' && typeof height === 'number') {
    const p = Math.min(input, height);
    if (p >= 3841) return 'ULTRA';
    if (p >= 1441) return '4K';
    if (p >= 721) return 'FHD';
    if (p >= 561) return 'HD';
    return 'SD';
  }
  if (typeof input === 'number') {
    const p = input;
    if (p >= 3841) return 'ULTRA';
    if (p >= 1441) return '4K';
    if (p >= 721) return 'FHD';
    if (p >= 561) return 'HD';
    return 'SD';
  }
  const str = String(input || '').toUpperCase();
  if (['ULTRA', '4K', 'FHD', 'HD', 'SD'].includes(str)) return str;
  if (str.includes('8K') || str.includes('4320') || str.includes('ULTRA')) return 'ULTRA';
  if (str.includes('4K') || str.includes('2160') || str.includes('3840') || str.includes('UHD')) return '4K';
  if (str.includes('FHD') || str.includes('1080') || str.includes('1440') || str.includes('FULL HD') || str.includes('2K')) return 'FHD';
  if (str.includes('HD') || str.includes('720')) return 'HD';
  if (str.includes('SD') || str.includes('480') || str.includes('360') || str.includes('540')) return 'SD';
  const match = str.match(/(\d{3,4})P?/);
  if (match) {
    const p = parseInt(match[1], 10);
    if (p >= 3841) return 'ULTRA';
    if (p >= 1441) return '4K';
    if (p >= 721) return 'FHD';
    if (p >= 561) return 'HD';
    return 'SD';
  }
  return 'FHD';
}

// Storage & Multi-Tenant Databases
const storage = require('./storage');

function extractSlugOrCodeFromUrl(urlStr) {
  try {
    const parsed = new URL(urlStr, 'http://localhost');
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (!parts.length || parts[0] === 'author') {
      const targetParam = parsed.searchParams.get('video') || parsed.searchParams.get('folder') || parsed.searchParams.get('pasta') || parsed.searchParams.get('project');
      return targetParam || null;
    }
    if (['api', 'assets', 'css', 'js', 'privacidade', 'privacy', 'termos', 'terms'].includes(parts[0])) return null;
    if (parts[0] === 'entrega' && parts[1]) return parts[1];
    if (/^\d{4}$/.test(parts[0]) && parts[1]) return parts[1];
    return parts[0];
  } catch (e) {}
  return null;
}

// Authentication (real Google login + signed sessions)
const { createAuth } = require('./auth');
const auth = createAuth(storage);
const { requireAuthor, requireUser } = auth;
auth.register(app);

// Google Drive API (espelhamento + streaming)
const google = require('./google');
const driveApi = require('./drive');
const cloudStorage = require('./cloudStorage');

// Espelha a pasta do projeto: API oficial do Drive usando estritamente a conta conectada do autor ou provedor multi-cloud
async function mirrorProject(project, userDb) {
  const provider = cloudStorage.detectProvider(project.driveLink);
  if (provider && provider !== 'google') {
    return await cloudStorage.mirrorProject(project, userDb, classifyResolution);
  }

  // Google Drive (preservado 100% como já funciona perfeitamente)
  const user = userDb || (project.userId ? storage.getUserDb(project.userId) : null);
  if (user && user.driveTokens && user.driveTokens.refresh_token) {
    const r = await driveApi.mirrorFolder(user, project.driveLink, classifyResolution);
    project.driveFolderId = r.folderId;
    project.driveFolderName = r.folderName;
    delete project.resolvedDrivePath;
    project.cloudProvider = 'google';
    project.folders = r.folders || [];
    project.videos = r.videos;
    project.lastSyncedAt = new Date().toISOString();

    const isLoose = Boolean(r.isFile || cloudStorage.isLinkAFile(project.driveLink));
    if (isLoose) {
      project.isFile = true;
      project.isIsolatedFile = true;
      if (r.videos && r.videos[0]) {
        project.fileType = r.videos[0].itemType || r.videos[0].type || 'file';
        project.fileExt = (r.videos[0].fileName || r.folderName || '').split('.').pop() || '';
      }
    }

    return { source: 'api', resolvedFolder: r.folderName, detected: r.videos.length, foldersCount: (r.folders || []).length, isFile: isLoose };
  }

  const err = new Error('Sua conta do Google Drive não está conectada. Faça login com o Google para autorizar o acesso ao seu Google Drive.');
  err.code = 'DRIVE_NOT_CONNECTED';
  err.status = 403;
  throw err;
}

function applyMirror(target, draft) {
  target.driveLink = draft.driveLink;
  target.driveFolderId = draft.driveFolderId;
  target.driveFolderName = draft.driveFolderName;
  target.cloudProvider = draft.cloudProvider || 'google';
  target.cloudSharedUrl = draft.cloudSharedUrl;
  if (draft.isFile !== undefined) target.isFile = draft.isFile;
  if (draft.isIsolatedFile !== undefined) target.isIsolatedFile = draft.isIsolatedFile;
  if (draft.fileType !== undefined) target.fileType = draft.fileType;
  if (draft.fileExt !== undefined) target.fileExt = draft.fileExt;

  // Preserva shortCodes, allowComments, allowShare e hideBrandName existentes de pastas e arquivos/vídeos
  const oldFolderCodes = new Map((target.folders || []).map(f => [f.id, f.shortCode]));
  const oldFolderComments = new Map((target.folders || []).map(f => [f.id, f.allowComments]));
  const oldFolderShare = new Map((target.folders || []).map(f => [f.id, f.allowShare]));
  const oldFolderBrand = new Map((target.folders || []).map(f => [f.id, f.hideBrandName]));
  (draft.folders || []).forEach(f => {
    if (!f.shortCode && oldFolderCodes.has(f.id)) {
      f.shortCode = oldFolderCodes.get(f.id);
    }
    if (f.allowComments === undefined && oldFolderComments.has(f.id)) {
      f.allowComments = oldFolderComments.get(f.id);
    }
    if (f.allowShare === undefined && oldFolderShare.has(f.id)) {
      f.allowShare = oldFolderShare.get(f.id);
    }
    if (f.hideBrandName === undefined && oldFolderBrand.has(f.id)) {
      f.hideBrandName = oldFolderBrand.get(f.id);
    }
  });

  const oldVideoCodes = new Map((target.videos || []).map(v => [v.driveFileId || v.id, v.shortCode]));
  const oldVideoComments = new Map((target.videos || []).map(v => [v.driveFileId || v.id, v.allowComments]));
  const oldVideoShare = new Map((target.videos || []).map(v => [v.driveFileId || v.id, v.allowShare]));
  const oldVideoBrand = new Map((target.videos || []).map(v => [v.driveFileId || v.id, v.hideBrandName]));
  const oldCustomCovers = new Map((target.videos || []).map(v => [v.driveFileId || v.id, { customThumbnailUrl: v.customThumbnailUrl, coverUrl: v.coverUrl }]));
  (draft.videos || []).forEach(v => {
    const key = v.driveFileId || v.id;
    if (!v.shortCode && oldVideoCodes.has(key)) {
      v.shortCode = oldVideoCodes.get(key);
    }
    if (v.allowComments === undefined && oldVideoComments.has(key)) {
      v.allowComments = oldVideoComments.get(key);
    }
    if (v.allowShare === undefined && oldVideoShare.has(key)) {
      v.allowShare = oldVideoShare.get(key);
    }
    if (v.hideBrandName === undefined && oldVideoBrand.has(key)) {
      v.hideBrandName = oldVideoBrand.get(key);
    }
    if (oldCustomCovers.has(key)) {
      const cov = oldCustomCovers.get(key);
      if (cov.customThumbnailUrl) {
        v.customThumbnailUrl = cov.customThumbnailUrl;
        v.coverUrl = cov.coverUrl || cov.customThumbnailUrl;
        v.thumbnailUrl = cov.customThumbnailUrl;
      }
    }
  });

  target.folders = draft.folders || [];
  target.videos = draft.videos || [];
  delete target.removedDriveFileIds;
  ['resolvedDrivePath', 'driveFolderId', 'driveFolderName', 'lastSyncedAt'].forEach(k => {
    if (draft[k] === undefined) delete target[k];
    else target[k] = draft[k];
  });
}

function mirrorErrorStatus(err) {
  if (err.code === 'DRIVE_NOT_CONNECTED') return 403;
  if ([400, 401, 403, 404].includes(err.status)) return err.status;
  if (err.code === 'DRIVE_NOT_OWNER_OR_EDITOR' || err.code === 'DRIVE_FORBIDDEN') return 403;
  if (err.code === 'DRIVE_NOT_FOUND') return 404;
  if (err.code === 'DRIVE_BAD_LINK') return 400;
  return 502;
}

// Helpers de verificação de propriedade e desbloqueio de senha de diretório
function isProjectOwnerUser(user, ownerUserId, ownerDb) {
  if (!user) return false;
  if (ownerUserId && user.id === ownerUserId) return true;
  const userEmail = user.email ? String(user.email).trim().toLowerCase() : '';
  const dbEmail = ownerDb && ownerDb.user && ownerDb.user.email
    ? String(ownerDb.user.email).trim().toLowerCase()
    : '';
  return Boolean(userEmail && dbEmail && userEmail === dbEmail);
}

function isProjectAccessAuthorized(req, project, ownerUserId, ownerDb) {
  if (!project) return false;
  const pwd = project.password ? String(project.password).trim() : '';
  if (!pwd) return true;
  if (isProjectOwnerUser(req.user, ownerUserId, ownerDb)) return true;
  if (auth && typeof auth.hasPasswordUnlock === 'function' && (auth.hasPasswordUnlock(req, project) || auth.hasPasswordUnlock(req, project.id))) {
    return true;
  }
  const providedPwd = (req.query && req.query.pwd) || (req.body && req.body.password) || req.headers['x-project-password'];
  if (providedPwd) {
    const pStr = String(providedPwd).trim();
    const isMatch = (auth && typeof auth.safeEqual === 'function')
      ? auth.safeEqual(pStr, pwd)
      : (pStr === pwd);
    if (isMatch) return true;
  }
  return false;
}

function sanitizeVideoForClient(v) {
  if (!v || typeof v !== 'object') return v;
  const copy = { ...v };
  delete copy.localPath;
  return copy;
}

function buildSafeClientPayload(req, { project, userDb, userId, type = 'project', code = null, folderId = null, videoId = null, includeResolvedTarget = false }) {
  const hasPassword = Boolean(project.password && String(project.password).trim());
  const unlocked = isProjectAccessAuthorized(req, project, userId, userDb);
  const isLocked = hasPassword && !unlocked;

  let safeProject;
  let filteredComments = [];

  if (isLocked) {
    safeProject = {
      id: project.id,
      name: project.name,
      slug: project.slug,
      shortCode: project.shortCode,
      year: project.year,
      category: project.category,
      hideBrandName: project.hideBrandName,
      allowComments: project.allowComments,
      password: true,
      isLocked: true,
      videos: [],
      folders: []
    };
  } else {
    let allowedFolders = Array.isArray(project.folders) ? [...project.folders] : [];
    let allowedVideos = Array.isArray(project.videos) ? project.videos.map(sanitizeVideoForClient) : [];

    if (type === 'file' && videoId) {
      allowedVideos = allowedVideos.filter(v => v.id === videoId || v.shortCode === code || v.driveFileId === videoId);
      allowedFolders = [];
    } else if (type === 'folder' && folderId) {
      const folderSet = new Set([folderId]);
      let added = true;
      while (added) {
        added = false;
        for (const f of allowedFolders) {
          if (folderSet.has(f.parentId) && !folderSet.has(f.id)) {
            folderSet.add(f.id);
            added = true;
          }
        }
      }
      allowedFolders = allowedFolders.filter(f => folderSet.has(f.id));
      allowedVideos = allowedVideos.filter(v => folderSet.has(v.driveFolderId || v.folderId));
    }

    safeProject = {
      ...project,
      password: false,
      isLocked: false,
      folders: allowedFolders,
      videos: allowedVideos
    };
    delete safeProject.driveLink;
    delete safeProject.resolvedDrivePath;

    const allowedVideoIds = new Set(allowedVideos.map(v => v.id));
    filteredComments = (userDb.comments || []).filter(c => c.projectId === project.id && allowedVideoIds.has(c.videoId));
  }

  const s = (userDb && userDb.settings) || {};
  const safeSettings = {
    appName: s.appName || 'Giffú Entrega',
    baseDomain: s.baseDomain || 'giffu.com.br',
    authorName: s.authorName || (userDb && userDb.user && userDb.user.name) || 'Autor',
    authorAvatar: s.authorAvatar || (userDb && userDb.user && userDb.user.avatar) || '',
    theme: s.theme || 'dark',
    defaultColor: s.defaultColor || '#FF5400',
    showFileExtensions: s.showFileExtensions
  };

  const payload = {
    user: userDb && userDb.user ? {
      id: userDb.user.id,
      name: safeSettings.authorName,
      avatar: safeSettings.authorAvatar
    } : null,
    settings: safeSettings,
    categories: [{ id: 'cat-padrao', name: project.category || 'Categoria Padrão' }],
    years: [project.year || new Date().getFullYear().toString()],
    projects: [safeProject],
    comments: filteredComments
  };

  if (includeResolvedTarget) {
    payload.resolvedTarget = {
      type,
      code,
      folderId: folderId || null,
      videoId: videoId || null
    };
  }

  return payload;
}

// REST APIs

// 1. Get initial data (multi-tenant aware: cada usuário acessa exclusivamente seu banco)
app.get('/api/data', (req, res) => {
  // Caso 1: Consulta de projeto por código curto ou slug (visitante / cliente ou link direto de entrega)
  const codeParam = req.query.code;
  let resolvedShortLink = codeParam ? storage.resolveShortLink(codeParam) : null;

  const slugParam = req.query.slug || (!resolvedShortLink && !req.query.project && req.headers.referer ? extractSlugOrCodeFromUrl(req.headers.referer) : null);
  if (!resolvedShortLink && slugParam) {
    resolvedShortLink = storage.resolveShortLink(slugParam);
  }

  // Se alguém abriu uma URL com ?project=... (ex: copiou a barra de endereço do modo autor)
  // e NÃO está logado como o dono daquele projeto, resolve como link compartilhado de cliente
  if (!resolvedShortLink && req.query.project) {
    const targetCandidate = req.query.video || req.query.folder || req.query.pasta || req.query.project;
    const candidateResolved = storage.resolveShortLink(targetCandidate) || storage.resolveShortLink(req.query.project);
    if (candidateResolved) {
      const isOwner = isProjectOwnerUser(req.user, candidateResolved.userId, candidateResolved.userDb);
      if (!isOwner) {
        resolvedShortLink = candidateResolved;
      }
    }
  }

  if (resolvedShortLink) {
    const { project, userDb, userId, type, folderId, videoId, code } = resolvedShortLink;
    return res.json(buildSafeClientPayload(req, {
      project,
      userDb,
      userId,
      type,
      code,
      folderId,
      videoId,
      includeResolvedTarget: true
    }));
  }

  if (slugParam) {
    const found = storage.findProjectBySlug(slugParam);
    if (found) {
      const { project, userDb, userId } = found;
      return res.json(buildSafeClientPayload(req, {
        project,
        userDb,
        userId,
        type: 'project',
        code: project.shortCode || project.slug,
        includeResolvedTarget: false
      }));
    }
    if (req.query.slug) {
      return res.status(404).json({ error: 'Projeto não encontrado' });
    }
  }

  // Caso 2: Autor autenticado -> carrega exclusivamente a base de dados do autor logado (sem expor tokens OAuth)
  if (req.user && req.user.isAuthor) {
    const userDb = storage.getUserDb(req.user.id);
    if (Array.isArray(userDb.projects)) {
      userDb.projects.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' }));
    }
    if (Array.isArray(userDb.categories)) {
      userDb.categories.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { numeric: true, sensitivity: 'base' }));
    }
    const safeAuthorDb = { ...userDb };
    delete safeAuthorDb.driveTokens;
    delete safeAuthorDb.cloudVaultFileId;
    return res.json(safeAuthorDb);
  }

  // Caso 3: Visitante genérico / não logado -> estrutura vazia (nunca expõe dados de outro usuário)
  res.json({
    settings: { appName: 'Giffú Entrega', theme: 'dark' },
    categories: [{ id: 'cat-padrao', name: 'Categoria Padrão' }],
    years: [new Date().getFullYear().toString()],
    projects: [],
    comments: []
  });
});

// Accounts Management: Multi-Cloud (Google Drive, Dropbox, OneDrive, Box, iCloud)
app.get('/api/accounts', requireAuthor, (req, res) => {
  const userDb = storage.getUserDb(req.user.id);
  const primaryGoogle = {
    id: 'primary-google',
    provider: 'google',
    name: (userDb.user && userDb.user.name) || 'Conta Google Principal',
    email: (userDb.user && userDb.user.email) || '',
    avatar: (userDb.user && userDb.user.avatar) || '',
    isPrimary: true,
    status: Boolean(userDb.driveTokens && userDb.driveTokens.refresh_token) ? 'connected' : 'disconnected'
  };
  const accounts = cloudStorage.getConnectedAccounts(userDb);
  res.json({
    primary: primaryGoogle,
    accounts
  });
});

app.post('/api/accounts', requireAuthor, (req, res) => {
  const { provider, name, email, token, refreshToken, credentials } = req.body;
  if (!provider) {
    return res.status(400).json({ error: 'Provedor é obrigatório.' });
  }
  const userDb = storage.getUserDb(req.user.id);
  const added = cloudStorage.addConnectedAccount(userDb, {
    provider,
    name,
    email,
    token,
    refreshToken,
    credentials
  });
  storage.saveUserDb(req.user.id, userDb);
  res.status(201).json({
    success: true,
    account: added,
    accounts: cloudStorage.getConnectedAccounts(userDb)
  });
});

app.delete('/api/accounts/:id', requireAuthor, (req, res) => {
  const userDb = storage.getUserDb(req.user.id);
  const removed = cloudStorage.removeConnectedAccount(userDb, req.params.id);
  if (!removed) {
    return res.status(404).json({ error: 'Conta não encontrada.' });
  }
  storage.saveUserDb(req.user.id, userDb);
  res.json({
    success: true,
    accounts: cloudStorage.getConnectedAccounts(userDb)
  });
});

// 2. Create project
app.post('/api/projects', requireAuthor, async (req, res) => {
  const { name, year, clientName, driveLink, password, allowComments, allowShare, hideBrandName, category, divisionId } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Nome do projeto é obrigatório' });
  }

  const userDb = storage.getUserDb(req.user.id);
  const currentYear = new Date().getFullYear().toString();
  
  // Define a categoria padrão da conta se não especificada
  const defaultCategory = (userDb.categories && userDb.categories[0] && userDb.categories[0].name) || 'Categoria Padrão';
  const projCategory = (category && String(category).trim()) || defaultCategory;

  // Resolve a divisão da categoria (padrão: única disponível ou última na ordem alfabética de A-Z)
  let targetDiv = null;
  if (divisionId) {
    targetDiv = (userDb.divisions || []).find(d => d.id === divisionId);
  }
  if (!targetDiv) {
    const catDivs = (userDb.divisions || []).filter(d => d.category === projCategory);
    if (catDivs.length === 0) {
      const newD = {
        id: `div-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: (year && String(year).trim()) || currentYear,
        category: projCategory,
        parentId: null,
        createdAt: new Date().toISOString()
      };
      if (!Array.isArray(userDb.divisions)) userDb.divisions = [];
      userDb.divisions.push(newD);
      catDivs.push(newD);
    }
    catDivs.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { numeric: true, sensitivity: 'base' }));
    targetDiv = catDivs[catDivs.length - 1];
  }

  const projYear = targetDiv ? targetDiv.name : ((year && String(year).trim()) || currentYear);

  const slug = generateSlug(name);
  const id = 'proj-' + Date.now();

  const newProject = {
    id,
    year: projYear,
    divisionId: targetDiv ? targetDiv.id : null,
    division: targetDiv ? targetDiv.name : projYear,
    category: projCategory,
    name: name.trim(),
    slug,
    clientName: (clientName || 'Cliente').trim(),
    driveLink: (driveLink || '').trim(),
    password: (password || '').trim(),
    allowComments: allowComments !== undefined ? Boolean(allowComments) : true,
    allowShare: allowShare !== undefined ? Boolean(allowShare) : true,
    hideBrandName: hideBrandName !== undefined ? Boolean(hideBrandName) : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    videos: []
  };

  // Espelhamento real do Google Drive na criação (usando exclusivamente token do autor)
  if (newProject.driveLink) {
    try {
      const mirrorRes = await mirrorProject(newProject, userDb);
      if (mirrorRes && mirrorRes.isFile) {
        newProject.isFile = true;
        newProject.isIsolatedFile = true;
        if (newProject.videos && newProject.videos[0]) {
          newProject.fileType = newProject.videos[0].itemType || newProject.videos[0].type || 'file';
          newProject.fileExt = (newProject.videos[0].fileName || newProject.name || '').split('.').pop() || '';
          if (!name || name.trim() === 'Novo Arquivo' || name.startsWith('261024-SIGEM')) {
            newProject.name = newProject.videos[0].title || newProject.videos[0].fileName || newProject.name;
          }
        }
      }
    } catch (err) {
      console.error('Falha ao espelhar pasta na criação:', err.message);
      return res.status(mirrorErrorStatus(err)).json({ error: err.message, code: err.code });
    }
  }

  const currentDb = storage.getUserDb(req.user.id);
  if (!currentDb.years.includes(projYear)) {
    currentDb.years.unshift(projYear);
    currentDb.years.sort((a, b) => b.localeCompare(a));
  }
  currentDb.projects.unshift(newProject);
  storage.saveUserDb(req.user.id, currentDb);

  res.status(201).json(newProject);
});

// 3. Update project
app.put('/api/projects/:id', requireAuthor, async (req, res) => {
  const userDb = storage.getUserDb(req.user.id);
  const probe = (userDb.projects || []).find(p => p.id === req.params.id);
  if (!probe) {
    return res.status(400).json({ error: 'Projeto não encontrado' });
  }

  const { name, clientName, driveLink, password, allowComments, allowShare, hideBrandName, year, category, divisionId, color } = req.body;

  // Espelha primeiro sobre uma cópia com os tokens do autor
  const draft = JSON.parse(JSON.stringify(probe));
  if (driveLink !== undefined && driveLink.trim()) {
    draft.driveLink = driveLink.trim();
    try {
      await mirrorProject(draft, userDb);
    } catch (err) {
      console.error('Falha ao espelhar pasta na edição:', err.message);
      return res.status(mirrorErrorStatus(err)).json({ error: err.message, code: err.code });
    }
  } else if (driveLink !== undefined && !driveLink.trim()) {
    draft.driveLink = '';
    draft.videos = [];
  }

  const currentDb = storage.getUserDb(req.user.id);
  const index = (currentDb.projects || []).findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(400).json({ error: 'Projeto não encontrado' });
  }

  const existing = currentDb.projects[index];

  if (name && name !== existing.name) {
    existing.name = name.trim();
    existing.slug = generateSlug(name);
    if (existing.driveFolderId) {
      try {
        await driveApi.renameFile(userDb, existing.driveFolderId, existing.name);
        existing.driveFolderName = existing.name;
      } catch (err) {
        console.warn('Erro ao renomear pasta raiz no Google Drive:', err.message);
      }
    }
  }
  if (color !== undefined) {
    existing.color = color ? String(color).trim() : null;
  }
  if (clientName !== undefined) existing.clientName = clientName.trim();
  if (driveLink !== undefined) applyMirror(existing, draft);
  if (password !== undefined) existing.password = password.trim();
  if (allowComments !== undefined) existing.allowComments = Boolean(allowComments);
  if (allowShare !== undefined) existing.allowShare = Boolean(allowShare);
  if (hideBrandName !== undefined) existing.hideBrandName = Boolean(hideBrandName);
  
  if (category !== undefined) {
    existing.category = String(category).trim();
  }

  if (divisionId !== undefined && divisionId) {
    const d = (currentDb.divisions || []).find(x => x.id === divisionId);
    if (d) {
      existing.divisionId = d.id;
      existing.division = d.name;
      existing.year = d.name;
      existing.category = d.category;
    }
  } else if (category !== undefined && (!existing.divisionId || (existing.category && existing.category !== probe.category))) {
    // Se mudou de categoria sem divisão específica, atribui a última da categoria em A-Z
    const catDivs = (currentDb.divisions || []).filter(d => d.category === existing.category);
    if (catDivs.length > 0) {
      catDivs.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { numeric: true, sensitivity: 'base' }));
      const lastDiv = catDivs[catDivs.length - 1];
      existing.divisionId = lastDiv.id;
      existing.division = lastDiv.name;
      existing.year = lastDiv.name;
    }
  } else if (year !== undefined) {
    existing.year = String(year).trim();
    existing.division = String(year).trim();
  }

  existing.updatedAt = new Date().toISOString();
  currentDb.projects[index] = existing;
  storage.saveUserDb(req.user.id, currentDb);

  res.json(existing);
});

// 3.1 Quick update project category (for drag & drop)
app.post('/api/projects/:id/category', requireAuthor, (req, res) => {
  const userDb = storage.getUserDb(req.user.id);
  const project = (userDb.projects || []).find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });
  const { category, divisionId } = req.body;
  if (!category) return res.status(400).json({ error: 'Categoria é obrigatória' });
  project.category = String(category).trim();

  if (divisionId) {
    const d = (userDb.divisions || []).find(x => x.id === divisionId);
    if (d) {
      project.divisionId = d.id;
      project.division = d.name;
      project.year = d.name;
    }
  } else {
    // Padrão: única divisão disponível ou a última na ordem alfabética de a-z
    const catDivs = (userDb.divisions || []).filter(d => d.category === project.category);
    if (catDivs.length === 0) {
      const currentYear = new Date().getFullYear().toString();
      const newD = {
        id: `div-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: currentYear,
        category: project.category,
        parentId: null,
        createdAt: new Date().toISOString()
      };
      if (!Array.isArray(userDb.divisions)) userDb.divisions = [];
      userDb.divisions.push(newD);
      catDivs.push(newD);
    }
    catDivs.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { numeric: true, sensitivity: 'base' }));
    const chosen = catDivs[catDivs.length - 1];
    project.divisionId = chosen.id;
    project.division = chosen.name;
    project.year = chosen.name;
  }

  project.updatedAt = new Date().toISOString();
  storage.saveUserDb(req.user.id, userDb);
  res.json(project);
});

// 3.1.1 Atualizar permissão de comentários para uma pasta específica
app.put('/api/projects/:id/folders/:folderId/comments', requireAuthor, async (req, res) => {
  const userDb = storage.getUserDb(req.user.id);
  const project = (userDb.projects || []).find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });

  const folder = (project.folders || []).find(f => f.id === req.params.folderId);
  if (!folder) return res.status(404).json({ error: 'Pasta não encontrada' });

  const { allowComments, allowShare, name, hideBrandName, color } = req.body;
  if (color !== undefined) {
    folder.color = color ? String(color).trim() : null;
  }
  if (name !== undefined && typeof name === 'string' && name.trim()) {
    const newFolderName = name.trim();
    if (folder.name !== newFolderName) {
      folder.name = newFolderName;
      if (folder.id) {
        try {
          await driveApi.renameFile(userDb, folder.id, newFolderName);
        } catch (err) {
          console.warn('Erro ao renomear pasta no Google Drive:', err.message);
        }
      }
    }
  }
  if (allowComments === null || allowComments === undefined || allowComments === 'inherit') {
    delete folder.allowComments;
  } else {
    folder.allowComments = Boolean(allowComments);
  }
  if (allowShare === null || allowShare === undefined || allowShare === 'inherit') {
    delete folder.allowShare;
  } else {
    folder.allowShare = Boolean(allowShare);
  }
  if (hideBrandName === null) {
    delete folder.hideBrandName;
  } else if (hideBrandName !== undefined) {
    folder.hideBrandName = Boolean(hideBrandName);
  }

  project.updatedAt = new Date().toISOString();
  storage.saveUserDb(req.user.id, userDb);
  res.json({ success: true, folder, color: folder.color, allowComments: folder.allowComments !== undefined ? folder.allowComments : null, allowShare: folder.allowShare !== undefined ? folder.allowShare : null, hideBrandName: folder.hideBrandName });
});

// 3.1.2 Atualizar permissão de comentários e nome para um arquivo/mídia específico (alterando no Google Drive)
app.put('/api/projects/:id/videos/:videoId/comments', requireAuthor, async (req, res) => {
  const userDb = storage.getUserDb(req.user.id);
  const project = (userDb.projects || []).find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });

  const video = (project.videos || []).find(v => v.id === req.params.videoId);
  if (!video) return res.status(404).json({ error: 'Arquivo não encontrado' });

  const { allowComments, allowShare, title, hideBrandName, color } = req.body;
  if (color !== undefined) {
    video.color = color ? String(color).trim() : null;
  }
  const newName = (typeof title === 'string') ? title.trim() : null;

  if (newName) {
    const currentName = video.fileName || video.title || '';
    if (newName !== currentName) {
      if (video.driveFileId) {
        try {
          // Determina o nome a ser enviado ao Google Drive:
          // Se o usuário não incluiu ponto/extensão mas o original possuía, preservamos a extensão original
          let driveName = newName;
          const origExtMatch = currentName.match(/\.([^.]+)$/);
          if (origExtMatch && !newName.includes('.')) {
            driveName = `${newName}.${origExtMatch[1]}`;
          }

          await driveApi.renameFile(req.user.id, video.driveFileId, driveName);
          video.fileName = driveName;
          video.title = driveName.replace(/\.[^.]+$/, '') || driveName;
        } catch (err) {
          console.error('Erro ao renomear arquivo no Google Drive:', err);
          return res.status(err.status || 502).json({
            error: `Erro ao renomear no Google Drive: ${err.message || 'Falha ao alterar nome no Drive'}`
          });
        }
      } else {
        video.fileName = newName;
        video.title = newName.replace(/\.[^.]+$/, '') || newName;
      }
    }
  }

  if (allowComments === null || allowComments === undefined || allowComments === 'inherit') {
    delete video.allowComments;
  } else {
    video.allowComments = Boolean(allowComments);
  }

  if (allowShare === null || allowShare === undefined || allowShare === 'inherit') {
    delete video.allowShare;
  } else {
    video.allowShare = Boolean(allowShare);
  }

  if (hideBrandName === null) {
    delete video.hideBrandName;
  } else if (hideBrandName !== undefined) {
    video.hideBrandName = Boolean(hideBrandName);
  }

  project.updatedAt = new Date().toISOString();
  storage.saveUserDb(req.user.id, userDb);
  res.json({ success: true, video, allowComments: video.allowComments !== undefined ? video.allowComments : null, allowShare: video.allowShare !== undefined ? video.allowShare : null, hideBrandName: video.hideBrandName });
});

// 3.1.3 Definir frame como capa personalizada do vídeo
const APP_DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, 'data');
const COVERS_DIR = path.join(APP_DATA_DIR, 'covers');
try { fs.mkdirSync(COVERS_DIR, { recursive: true }); } catch (e) {}
const PREVIEW_CACHE_DIR = path.join(APP_DATA_DIR, 'preview_cache');
try { fs.mkdirSync(PREVIEW_CACHE_DIR, { recursive: true }); } catch (e) {}

app.post('/api/projects/:id/videos/:videoId/cover', requireAuthor, async (req, res) => {
  const userDb = storage.getUserDb(req.user.id);
  const project = (userDb.projects || []).find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });

  const video = (project.videos || []).find(v => v.id === req.params.videoId);
  if (!video) return res.status(404).json({ error: 'Arquivo não encontrado' });

  const { imageBase64 } = req.body;
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return res.status(400).json({ error: 'Imagem base64 ausente' });
  }

  try {
    const matches = imageBase64.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Formato de imagem inválido' });
    }
    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const fileName = `cover_${video.id}_${Date.now()}.${ext}`;
    const filePath = path.join(COVERS_DIR, fileName);

    // Remove capa anterior se houver
    if (video.coverUrl && video.coverUrl.startsWith('/api/covers/')) {
      const oldName = video.coverUrl.replace('/api/covers/', '');
      const oldPath = path.join(COVERS_DIR, oldName);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (e) {}
      }
    }

    fs.writeFileSync(filePath, buffer);
    const coverUrl = `/api/covers/${fileName}`;
    video.customThumbnailUrl = coverUrl;
    video.coverUrl = coverUrl;
    video.thumbnailUrl = coverUrl;
    video.hasCustomCover = true;

    project.updatedAt = new Date().toISOString();
    storage.saveUserDb(req.user.id, userDb);

    res.json({ success: true, coverUrl, video });
  } catch (err) {
    console.error('Erro ao salvar capa do vídeo:', err);
    res.status(500).json({ error: 'Erro ao salvar capa do vídeo' });
  }
});

// 3.1.4 Remover capa manual e restaurar ao padrão
app.delete('/api/projects/:id/videos/:videoId/cover', requireAuthor, async (req, res) => {
  const userDb = storage.getUserDb(req.user.id);
  const project = (userDb.projects || []).find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });

  const video = (project.videos || []).find(v => v.id === req.params.videoId);
  if (!video) return res.status(404).json({ error: 'Arquivo não encontrado' });

  try {
    const existingCover = video.coverUrl || video.customThumbnailUrl;
    if (existingCover && existingCover.startsWith('/api/covers/')) {
      const oldName = existingCover.replace('/api/covers/', '');
      const oldPath = path.join(COVERS_DIR, oldName);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (e) {}
      }
    }

    delete video.customThumbnailUrl;
    delete video.coverUrl;
    delete video.hasCustomCover;

    // Se o driveFileId existir e não for imagem, restaura thumbnailUrl original se houver
    if (video.driveFileId && video.type === 'video') {
      delete video.thumbnailUrl;
    }

    project.updatedAt = new Date().toISOString();
    storage.saveUserDb(req.user.id, userDb);

    res.json({ success: true, video });
  } catch (err) {
    console.error('Erro ao remover capa do vídeo:', err);
    res.status(500).json({ error: 'Erro ao remover capa do vídeo' });
  }
});

// Servir capas estáticas salvas
app.get('/api/covers/:fileName', (req, res) => {
  const safeName = path.basename(req.params.fileName);
  const filePath = path.join(COVERS_DIR, safeName);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Capa não encontrada');
  }
  const ext = path.extname(safeName).toLowerCase();
  const ctype = ext === '.png' ? 'image/png' : (ext === '.webp' ? 'image/webp' : 'image/jpeg');
  res.setHeader('Content-Type', ctype);
  res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 dias de cache
  fs.createReadStream(filePath).pipe(res);
});

// Helpers para Open Graph e pré-visualizações ricas de links (WhatsApp, Telegram, redes sociais)
function findCustomCoverFile(videoId, driveFileId) {
  try {
    const candidates = [];
    if (videoId) candidates.push(`cover_${videoId}_`);
    if (driveFileId) candidates.push(`cover_vid-${driveFileId}_`);
    const files = fs.readdirSync(COVERS_DIR);
    for (const c of candidates) {
      const match = files.find(f => f.startsWith(c));
      if (match) return path.join(COVERS_DIR, match);
    }
  } catch (e) {}
  return null;
}

function sendDefaultOgIcon(res) {
  const iconPath = path.join(__dirname, 'public', 'assets', 'icon-512.png');
  if (fs.existsSync(iconPath)) {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    return fs.createReadStream(iconPath).pipe(res);
  }
  res.status(404).end();
}

function getRequestOrigin(req, userDb) {
  if (!req) {
    if (userDb && userDb.settings && userDb.settings.baseDomain) {
      const domain = userDb.settings.baseDomain.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
      return `https://${domain}`;
    }
    return 'https://cloud.giffu.com.br';
  }
  const forwardedProto = req.headers['x-forwarded-proto'];
  const proto = (forwardedProto ? forwardedProto.split(',')[0].trim() : (req.connection && req.connection.encrypted ? 'https' : 'http')) || 'https';
  let host = req.headers['x-forwarded-host'] || req.headers.host || '';
  if (host.includes(',')) host = host.split(',')[0].trim();
  if (!host || host.startsWith('127.0.0.1') || host.startsWith('localhost')) {
    if (userDb && userDb.settings && userDb.settings.baseDomain) {
      host = userDb.settings.baseDomain.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
    } else {
      host = 'cloud.giffu.com.br';
    }
  }
  const effectiveProto = (host.includes('giffu.com.br') || host.includes('cloud.')) ? 'https' : proto;
  return `${effectiveProto}://${host}`;
}

function getOgImageUrl(req, userDb, options = {}) {
  const origin = getRequestOrigin(req, userDb);
  const { code, drive, video, proj, cover } = options;
  const params = new URLSearchParams();
  if (code) params.set('code', code);
  if (drive) params.set('drive', drive);
  if (video) params.set('video', video);
  if (proj) params.set('proj', proj);
  if (cover) params.set('cover', cover);
  const qs = params.toString();
  return qs ? `${origin}/api/og-image?${qs}` : `${origin}/assets/icon-512.png`;
}

// Servir capa ou thumbnail padrão para pré-visualização de links (Open Graph / WhatsApp / Telegram)
app.get('/api/og-image', async (req, res) => {
  try {
    const rawCode = (req.query.code || '').trim();
    const driveId = (req.query.drive || '').trim();
    const videoId = (req.query.video || '').trim();
    const projIdOrSlug = (req.query.proj || '').trim();
    const coverParam = (req.query.cover || '').trim();

    // 1. Capa direta se informada
    if (coverParam) {
      const safeName = path.basename(coverParam);
      const filePath = path.join(COVERS_DIR, safeName);
      if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
        const ext = path.extname(safeName).toLowerCase();
        const ctype = ext === '.png' ? 'image/png' : (ext === '.webp' ? 'image/webp' : 'image/jpeg');
        res.setHeader('Content-Type', ctype);
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
        return fs.createReadStream(filePath).pipe(res);
      }
    }

    let targetVideo = null;
    let targetProject = null;
    let targetUserDb = null;
    let targetDriveId = driveId;

    // 2. Resolução por shortCode ou slug
    if (rawCode) {
      const resolved = storage.resolveShortLink(rawCode);
      if (resolved) {
        targetProject = resolved.project;
        targetUserDb = resolved.userDb;
        if (resolved.type === 'file' && resolved.videoId) {
          targetVideo = (targetProject.videos || []).find(v => v.id === resolved.videoId || v.driveFileId === resolved.videoId || v.shortCode === rawCode);
        } else if (resolved.type === 'folder' && resolved.folderId) {
          const folderVids = (targetProject.videos || []).filter(v => v.driveFolderId === resolved.folderId || (v.folderPath && v.folderPath.includes(resolved.folderId)));
          targetVideo = folderVids.find(v => v.hasCustomCover || v.coverUrl) || folderVids[0] || null;
        } else if (resolved.type === 'project') {
          targetVideo = (targetProject.videos || [])[0] || null;
        }
      }
    }

    // 3. Resolução por driveId se ainda não localizou targetVideo
    if (!targetVideo && targetDriveId) {
      const found = storage.findVideoByDriveId(targetDriveId);
      if (found) {
        targetVideo = found.video;
        targetProject = found.project;
        targetUserDb = found.userDb;
      }
    }

    // 4. Resolução por videoId se ainda não localizou targetVideo
    if (!targetVideo && videoId) {
      const users = ['usr_novelfilmes_gmail_com', 'usr_102181345952808006205', 'usr_105551241729647220818'];
      for (const uid of users) {
        const uDb = storage.getUserDb(uid);
        if (!uDb) continue;
        for (const p of (uDb.projects || [])) {
          const v = (p.videos || []).find(item => item.id === videoId || item.driveFileId === videoId);
          if (v) {
            targetVideo = v;
            targetProject = p;
            targetUserDb = uDb;
            break;
          }
        }
        if (targetVideo) break;
      }
    }

    // 5. Resolução por projeto se ainda não localizou targetVideo
    if (!targetVideo && projIdOrSlug) {
      const foundProj = storage.findProjectBySlug(projIdOrSlug);
      if (foundProj && foundProj.project) {
        targetProject = foundProj.project;
        targetUserDb = foundProj.userDb;
        targetVideo = (targetProject.videos || [])[0] || null;
      }
    }

    if (targetVideo && !targetDriveId && targetVideo.driveFileId) {
      targetDriveId = targetVideo.driveFileId;
    }

    // REGRA 1: Capa manual definida pelo usuário (se houver, prioridade máxima)
    const hasManualCover = Boolean(
      targetVideo && (
        targetVideo.hasCustomCover === true ||
        (targetVideo.coverUrl && targetVideo.coverUrl.startsWith('/api/covers/')) ||
        (targetVideo.customThumbnailUrl && targetVideo.customThumbnailUrl.startsWith('/api/covers/'))
      )
    );

    if (hasManualCover) {
      const coverUrl = targetVideo.coverUrl || targetVideo.customThumbnailUrl;
      const safeName = path.basename(coverUrl);
      const filePath = path.join(COVERS_DIR, safeName);
      if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
        const ext = path.extname(safeName).toLowerCase();
        const ctype = ext === '.png' ? 'image/png' : (ext === '.webp' ? 'image/webp' : 'image/jpeg');
        res.setHeader('Content-Type', ctype);
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
        return fs.createReadStream(filePath).pipe(res);
      }
    }

    // Busca arquivo de capa manual correspondente no diretório de capas se existir
    const diskCustomCover = findCustomCoverFile(targetVideo ? targetVideo.id : videoId, targetDriveId);
    if (diskCustomCover && fs.existsSync(diskCustomCover) && fs.statSync(diskCustomCover).size > 0) {
      const ext = path.extname(diskCustomCover).toLowerCase();
      const ctype = ext === '.png' ? 'image/png' : (ext === '.webp' ? 'image/webp' : 'image/jpeg');
      res.setHeader('Content-Type', ctype);
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
      return fs.createReadStream(diskCustomCover).pipe(res);
    }

    // Se o projeto tiver capa manual e o vídeo não tiver capa específica
    if (targetProject && targetProject.coverUrl && targetProject.coverUrl.startsWith('/api/covers/')) {
      const safeName = path.basename(targetProject.coverUrl);
      const filePath = path.join(COVERS_DIR, safeName);
      if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
        const ext = path.extname(safeName).toLowerCase();
        const ctype = ext === '.png' ? 'image/png' : (ext === '.webp' ? 'image/webp' : 'image/jpeg');
        res.setHeader('Content-Type', ctype);
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
        return fs.createReadStream(filePath).pipe(res);
      }
    }

    // REGRA 2: Capa automática padrão do vídeo (thumbnail gerada automaticamente pelo Google Drive / plataforma)
    if (targetDriveId) {
      // 2.1 Verifica cache em disco (s1024, s600)
      const cacheBase = path.join(PREVIEW_CACHE_DIR, `${targetDriveId}_s1024`);
      const cacheJpg = `${cacheBase}.jpg`;
      const cachePng = `${cacheBase}.png`;
      if (fs.existsSync(cacheJpg) && fs.statSync(cacheJpg).size > 0) {
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
        return fs.createReadStream(cacheJpg).pipe(res);
      }
      if (fs.existsSync(cachePng) && fs.statSync(cachePng).size > 0) {
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
        return fs.createReadStream(cachePng).pipe(res);
      }
      const cache600Jpg = path.join(PREVIEW_CACHE_DIR, `${targetDriveId}_s600.jpg`);
      if (fs.existsSync(cache600Jpg) && fs.statSync(cache600Jpg).size > 0) {
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
        return fs.createReadStream(cache600Jpg).pipe(res);
      }

      // 2.2 Busca miniatura oficial da API do Google Drive
      if (!targetUserDb) {
        targetUserDb = storage.getUserDb('novelfilmes@gmail.com');
      }
      const token = await google.getDriveAccessToken(() => targetUserDb);
      const metaUrl = `https://www.googleapis.com/drive/v3/files/${targetDriveId}?supportsAllDrives=true&fields=id,name,mimeType,hasThumbnail,thumbnailLink`;
      const meta = await new Promise((resolve) => {
        https.get(metaUrl, { headers: { Authorization: `Bearer ${token}` } }, (mres) => {
          let b = '';
          mres.on('data', c => b += c);
          mres.on('end', () => {
            try { resolve(JSON.parse(b)); } catch (e) { resolve(null); }
          });
        }).on('error', () => resolve(null));
      });

      if (meta && meta.hasThumbnail && meta.thumbnailLink) {
        const thumbUrl = meta.thumbnailLink.replace(/=s\d+$/, '=s1024');
        return https.get(thumbUrl, { headers: { Authorization: `Bearer ${token}` } }, (tres) => {
          if (tres.statusCode === 200) {
            const ctype = tres.headers['content-type'] || 'image/jpeg';
            const ext = ctype.includes('png') ? '.png' : '.jpg';
            const targetCachePath = `${cacheBase}${ext}`;
            const tempPath = `${targetCachePath}.tmp.${Date.now()}`;
            const writeStream = fs.createWriteStream(tempPath);

            res.setHeader('Content-Type', ctype);
            res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');

            tres.on('data', chunk => {
              writeStream.write(chunk);
              res.write(chunk);
            });
            tres.on('end', () => {
              writeStream.end(() => {
                try { fs.renameSync(tempPath, targetCachePath); } catch (e) {}
              });
              res.end();
            });
            tres.on('error', () => {
              writeStream.destroy();
              try { fs.unlinkSync(tempPath); } catch (e) {}
              if (!res.headersSent) sendDefaultOgIcon(res);
              else res.destroy();
            });
            return;
          }

          // Fallback para thumbnailLink original caso =s1024 retorne status diferente de 200
          return https.get(meta.thumbnailLink, { headers: { Authorization: `Bearer ${token}` } }, (t2res) => {
            if (t2res.statusCode === 200) {
              res.setHeader('Content-Type', t2res.headers['content-type'] || 'image/jpeg');
              res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
              return t2res.pipe(res);
            }
            sendDefaultOgIcon(res);
          }).on('error', () => sendDefaultOgIcon(res));
        }).on('error', () => sendDefaultOgIcon(res));
      }
    }

    // Fallback: Ícone padrão oficial Giffú Cloud
    return sendDefaultOgIcon(res);
  } catch (err) {
    console.error('Erro na rota /api/og-image:', err.message);
    sendDefaultOgIcon(res);
  }
});

// 3.2 Category Management API (Personalizadas por usuário)
app.get('/api/categories', (req, res) => {
  if (req.user && req.user.isAuthor) {
    const userDb = storage.getUserDb(req.user.id);
    const cats = userDb.categories || [{ id: 'cat-padrao', name: 'Categoria Padrão' }];
    cats.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { numeric: true, sensitivity: 'base' }));
    return res.json(cats);
  }
  res.json([{ id: 'cat-padrao', name: 'Categoria Padrão' }]);
});

app.post('/api/categories', requireAuthor, (req, res) => {
  const userDb = storage.getUserDb(req.user.id);
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Nome da categoria é obrigatório' });

  if (!Array.isArray(userDb.categories)) {
    userDb.categories = [{ id: 'cat-padrao', name: 'Categoria Padrão' }];
  }

  const existing = userDb.categories.find(c => c.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'Já existe uma categoria com este nome', category: existing });
  }

  const newCategory = {
    id: `cat-${Date.now()}`,
    name,
    color: req.body.color ? String(req.body.color).trim() : null
  };

  userDb.categories.push(newCategory);
  userDb.categories.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { numeric: true, sensitivity: 'base' }));
  storage.saveUserDb(req.user.id, userDb);
  res.status(201).json({ success: true, category: newCategory, categories: userDb.categories });
});

// 3.3 Renomear Categoria / Atualizar Cor
app.put('/api/categories/:id', requireAuthor, (req, res) => {
  const userDb = storage.getUserDb(req.user.id);
  const catId = req.params.id;
  const hasName = req.body.name !== undefined;
  const hasColor = req.body.color !== undefined;

  if (!Array.isArray(userDb.categories)) {
    userDb.categories = [{ id: 'cat-padrao', name: 'Categoria Padrão' }];
  }

  const idx = userDb.categories.findIndex(c => c.id === catId || (c.name && c.name.toLowerCase() === catId.toLowerCase()));
  if (idx === -1) return res.status(404).json({ error: 'Categoria não encontrada' });

  if (hasName) {
    const newName = String(req.body.name || '').trim();
    if (!newName) return res.status(400).json({ error: 'Nome da categoria é obrigatório' });

    const existingSameName = userDb.categories.find((c, i) => i !== idx && c.name.toLowerCase() === newName.toLowerCase());
    if (existingSameName) {
      return res.status(409).json({ error: 'Já existe uma categoria com este nome' });
    }

    const oldName = userDb.categories[idx].name;
    userDb.categories[idx].name = newName;

    // Atualizar projetos que pertenciam ao nome antigo
    (userDb.projects || []).forEach(p => {
      if (p.category === oldName) {
        p.category = newName;
        p.updatedAt = new Date().toISOString();
      }
    });

    // Atualizar divisões que pertenciam ao nome antigo
    (userDb.divisions || []).forEach(d => {
      if (d.category === oldName) {
        d.category = newName;
        d.updatedAt = new Date().toISOString();
      }
    });
  }

  if (hasColor) {
    const newColor = req.body.color ? String(req.body.color).trim() : null;
    userDb.categories[idx].color = newColor;
  }

  userDb.categories.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { numeric: true, sensitivity: 'base' }));
  storage.saveUserDb(req.user.id, userDb);
  const updatedCategory = userDb.categories.find(c => c.id === catId || (c.name && c.name.toLowerCase() === catId.toLowerCase()));
  res.json({ success: true, category: updatedCategory, categories: userDb.categories });
});

// 3.4 Deletar Categoria (ATENÇÃO: diretórios vinculados vão para o ARQUIVO)
app.delete('/api/categories/:id', requireAuthor, (req, res) => {
  const userDb = storage.getUserDb(req.user.id);
  const catId = req.params.id;

  if (!Array.isArray(userDb.categories) || userDb.categories.length <= 1) {
    return res.status(400).json({ error: 'É necessário manter pelo menos uma categoria no sistema' });
  }

  const idx = (userDb.categories || []).findIndex(c => c.id === catId);
  if (idx === -1) return res.status(404).json({ error: 'Categoria não encontrada' });

  const removedCategory = userDb.categories[idx];
  const removedName = removedCategory.name;
  userDb.categories.splice(idx, 1);

  // Mover diretórios dessa categoria para o Arquivo
  let archivedCount = 0;
  (userDb.projects || []).forEach(p => {
    if (p.category === removedName && !p.archived) {
      p.archived = true;
      p.archivedAt = new Date().toISOString();
      p.updatedAt = new Date().toISOString();
      archivedCount++;
    }
  });

  userDb.categories.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { numeric: true, sensitivity: 'base' }));
  storage.saveUserDb(req.user.id, userDb);
  res.json({ success: true, removedName, archivedCount, categories: userDb.categories });
});

// ==========================================
// 3.5 ROTAS DE DIVISÕES (Substituição de Anos)
// ==========================================

// Listar divisões do autor logado
app.get('/api/divisions', requireAuthor, (req, res) => {
  const userDb = storage.getUserDb(req.user.id);
  res.json(userDb.divisions || []);
});

// Criar nova divisão (ou subdivisão)
app.post('/api/divisions', requireAuthor, (req, res) => {
  const userDb = storage.getUserDb(req.user.id);
  const name = String(req.body.name || '').trim();
  const category = String(req.body.category || '').trim();
  const parentId = req.body.parentId ? String(req.body.parentId).trim() : null;

  if (!name) return res.status(400).json({ error: 'Nome da divisão é obrigatório' });
  if (!category) return res.status(400).json({ error: 'Categoria é obrigatória' });

  if (!Array.isArray(userDb.divisions)) userDb.divisions = [];

  const existing = userDb.divisions.find(d => 
    d.category === category && 
    (d.parentId || null) === (parentId || null) && 
    d.name.toLowerCase() === name.toLowerCase()
  );
  if (existing) {
    return res.status(409).json({ error: 'Já existe uma divisão com este nome neste nível', division: existing });
  }

  const newDivision = {
    id: `div-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    name,
    category,
    parentId: parentId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  userDb.divisions.push(newDivision);
  storage.saveUserDb(req.user.id, userDb);
  res.status(201).json({ success: true, division: newDivision, divisions: userDb.divisions });
});

// Atualizar divisão (Renomear, mudar categoria por drag-and-drop, mudar parentId)
app.put('/api/divisions/:id', requireAuthor, (req, res) => {
  const userDb = storage.getUserDb(req.user.id);
  const divId = req.params.id;

  if (!Array.isArray(userDb.divisions)) userDb.divisions = [];
  const divIndex = userDb.divisions.findIndex(d => d.id === divId);
  if (divIndex === -1) return res.status(404).json({ error: 'Divisão não encontrada' });

  const division = userDb.divisions[divIndex];
  const oldCategory = division.category;
  const oldName = division.name;

  if (req.body.name !== undefined) {
    const newName = String(req.body.name || '').trim();
    if (!newName) return res.status(400).json({ error: 'Nome da divisão não pode ser vazio' });
    division.name = newName;

    // Se renomeou, atualiza o nome gravado nos projetos associados
    (userDb.projects || []).forEach(p => {
      if (p.divisionId === divId || (p.category === division.category && p.division === oldName)) {
        p.division = newName;
        p.year = newName;
        p.updatedAt = new Date().toISOString();
      }
    });
  }

  let categoryChanged = false;
  if (req.body.category !== undefined) {
    const newCategory = String(req.body.category || '').trim();
    if (newCategory && newCategory !== oldCategory) {
      division.category = newCategory;
      categoryChanged = true;
    }
  }

  if (req.body.parentId !== undefined) {
    const newParentId = req.body.parentId ? String(req.body.parentId).trim() : null;
    if (newParentId !== divId) {
      division.parentId = newParentId;
    }
  }

  if (req.body.color !== undefined) {
    division.color = req.body.color ? String(req.body.color).trim() : null;
  }

  division.updatedAt = new Date().toISOString();

  // Coleta recursiva de todas as subdivisões filhas
  function getAllDescendantDivisionIds(rootId) {
    const result = new Set([rootId]);
    let added = true;
    while (added) {
      added = false;
      userDb.divisions.forEach(d => {
        if (d.parentId && result.has(d.parentId) && !result.has(d.id)) {
          result.add(d.id);
          added = true;
        }
      });
    }
    return result;
  }

  // Se a divisão foi arrastada/movida para outra categoria:
  // Ela leva todas as subdivisões e todos os diretórios de dentro junto!
  if (categoryChanged) {
    const allAffectedDivIds = getAllDescendantDivisionIds(divId);
    
    // Atualiza categoria das subdivisões
    userDb.divisions.forEach(d => {
      if (allAffectedDivIds.has(d.id)) {
        d.category = division.category;
        d.updatedAt = new Date().toISOString();
      }
    });

    // Atualiza os diretórios de dentro junto
    (userDb.projects || []).forEach(p => {
      if (allAffectedDivIds.has(p.divisionId)) {
        p.category = division.category;
        p.updatedAt = new Date().toISOString();
      }
    });
  }

  storage.saveUserDb(req.user.id, userDb);
  res.json({ success: true, division, divisions: userDb.divisions });
});

// Excluir divisão
app.delete('/api/divisions/:id', requireAuthor, (req, res) => {
  const userDb = storage.getUserDb(req.user.id);
  const divId = req.params.id;

  if (!Array.isArray(userDb.divisions)) userDb.divisions = [];
  const div = userDb.divisions.find(d => d.id === divId);
  if (!div) return res.status(404).json({ error: 'Divisão não encontrada' });

  // Coleta todas as subdivisões filhas
  const descendants = new Set([divId]);
  let added = true;
  while (added) {
    added = false;
    userDb.divisions.forEach(d => {
      if (d.parentId && descendants.has(d.parentId) && !descendants.has(d.id)) {
        descendants.add(d.id);
        added = true;
      }
    });
  }

  // Remove as divisões
  userDb.divisions = userDb.divisions.filter(d => !descendants.has(d.id));

  // Garante que a categoria ainda tenha ao menos 1 divisão
  const remainingInCat = userDb.divisions.filter(d => d.category === div.category);
  let fallbackDivId = null;
  if (remainingInCat.length === 0) {
    const currentYear = new Date().getFullYear().toString();
    const fallback = {
      id: `div-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: currentYear,
      category: div.category,
      parentId: null,
      createdAt: new Date().toISOString()
    };
    userDb.divisions.push(fallback);
    fallbackDivId = fallback.id;
  } else {
    // Escolhe a última em ordem alfabética A-Z
    remainingInCat.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { numeric: true, sensitivity: 'base' }));
    fallbackDivId = remainingInCat[remainingInCat.length - 1].id;
  }

  // Reatribui projetos que estavam na divisão excluída para a divisão fallback
  (userDb.projects || []).forEach(p => {
    if (descendants.has(p.divisionId)) {
      p.divisionId = fallbackDivId;
      const targetDiv = userDb.divisions.find(d => d.id === fallbackDivId);
      if (targetDiv) {
        p.division = targetDiv.name;
        p.year = targetDiv.name;
      }
      p.updatedAt = new Date().toISOString();
    }
  });

  storage.saveUserDb(req.user.id, userDb);
  res.json({ success: true, divisions: userDb.divisions });
});

// Mover projeto diretamente para uma divisão (via drag-and-drop na Sidebar)
app.post('/api/projects/:id/division', requireAuthor, (req, res) => {
  const userDb = storage.getUserDb(req.user.id);
  const project = (userDb.projects || []).find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });
  
  const { divisionId } = req.body;
  if (!divisionId) return res.status(400).json({ error: 'Divisão é obrigatória' });

  const targetDiv = (userDb.divisions || []).find(d => d.id === divisionId);
  if (!targetDiv) return res.status(404).json({ error: 'Divisão não encontrada' });

  project.divisionId = targetDiv.id;
  project.division = targetDiv.name;
  project.year = targetDiv.name;
  project.category = targetDiv.category; // também atualiza a categoria do projeto para a da divisão
  project.updatedAt = new Date().toISOString();

  storage.saveUserDb(req.user.id, userDb);
  res.json(project);
});

// 4. Archive project
app.post('/api/projects/:id/archive', requireAuthor, (req, res) => {
  const userDb = storage.getUserDb(req.user.id);
  const project = (userDb.projects || []).find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });
  project.archived = true;
  project.archivedAt = new Date().toISOString();
  project.updatedAt = new Date().toISOString();
  storage.saveUserDb(req.user.id, userDb);
  res.json(project);
});

// 5. Unarchive project (restore - se restaurado, a categoria restaura junto se não existir)
app.post('/api/projects/:id/unarchive', requireAuthor, (req, res) => {
  const userDb = storage.getUserDb(req.user.id);
  const project = (userDb.projects || []).find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });
  project.archived = false;
  delete project.archivedAt;
  project.updatedAt = new Date().toISOString();

  let categoryRestored = null;
  if (project.category) {
    if (!Array.isArray(userDb.categories)) {
      userDb.categories = [{ id: 'cat-padrao', name: 'Categoria Padrão' }];
    }
    const catExists = userDb.categories.some(c => c.name.toLowerCase() === project.category.toLowerCase());
    if (!catExists) {
      const restoredCategory = {
        id: `cat-${Date.now()}`,
        name: project.category
      };
      userDb.categories.push(restoredCategory);
      categoryRestored = restoredCategory.name;
    }
  }

  storage.saveUserDb(req.user.id, userDb);
  res.json({ project, categoryRestored, categories: userDb.categories });
});

// 6. Delete project
app.delete('/api/projects/:id', requireAuthor, async (req, res) => {
  const userDb = storage.getUserDb(req.user.id);
  const project = (userDb.projects || []).find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });

  if (req.query.deleteFromDrive === 'true') {
    if (project.driveFolderId) {
      try {
        await driveApi.deleteDriveFileOrFolder(userDb, project.driveFolderId);
      } catch (err) {
        console.warn('Erro ao excluir pasta no Google Drive:', err.message);
      }
    }
  }

  userDb.projects = (userDb.projects || []).filter(p => p.id !== req.params.id);
  userDb.comments = (userDb.comments || []).filter(c => c.projectId !== req.params.id);
  storage.saveUserDb(req.user.id, userDb);
  res.json({ success: true });
});

// 7. Add Video to project
app.post('/api/projects/:id/videos', requireAuthor, (req, res) => {
  const userDb = storage.getUserDb(req.user.id);
  const project = (userDb.projects || []).find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });

  const { title, aspectRatio, url, resolution, duration, size } = req.body;
  const newVideo = {
    id: 'vid-' + Date.now(),
    title: (title || `${project.name}-VIDEO`).toUpperCase().trim(),
    aspectRatio: aspectRatio || '16:9',
    url: url || (aspectRatio === '9:16' ? '/assets/sample-9x16.mp4' : '/assets/sample-16x9.mp4'),
    resolution: classifyResolution(resolution),
    duration: duration || '00:10',
    size: (size || '').trim()
  };

  project.videos.push(newVideo);
  project.updatedAt = new Date().toISOString();
  storage.saveUserDb(req.user.id, userDb);

  res.status(201).json(newVideo);
});

// 7.1 Upload file directly to mirrored Google Drive directory (AUTHOR ONLY)
app.post('/api/projects/:id/upload', requireAuthor, upload.any(), async (req, res) => {
  const userDb = storage.getUserDb(req.user.id);
  const project = (userDb.projects || []).find(p => p.id === req.params.id);
  const files = req.files || (req.file ? [req.file] : []);

  if (!project) {
    files.forEach(f => { try { fs.unlinkSync(f.path); } catch (e) {} });
    return res.status(404).json({ error: 'Projeto não encontrado' });
  }

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado para upload' });
  }

  // Define pasta de destino: query ?folder=... ou body targetFolderId ou project.driveFolderId
  const targetFolderId = req.query.folder || req.body.targetFolderId || project.driveFolderId;
  if (!targetFolderId) {
    files.forEach(f => { try { fs.unlinkSync(f.path); } catch (e) {} });
    return res.status(400).json({ error: 'ID do diretório do Google Drive não configurado para este projeto' });
  }

  const folderObj = (project.folders || []).find(f => f.id === targetFolderId);
  const folderPath = folderObj ? (folderObj.path || folderObj.name) : '';

  const uploadedItems = [];
  const errors = [];

  for (const f of files) {
    try {
      let item;
      if (project.cloudProvider && project.cloudProvider !== 'google') {
        item = await cloudStorage.uploadFileToCloud(
          userDb,
          project,
          targetFolderId,
          f.path,
          f.originalname,
          f.mimetype
        );
      } else {
        const fullItem = await driveApi.uploadFileToFolder(
          userDb,
          targetFolderId,
          f.path,
          f.originalname,
          f.mimetype
        );
        item = driveApi.formatDriveItem(fullItem, targetFolderId, folderPath, classifyResolution);
      }

      // Desmarcar de removidos caso tenha sido excluído anteriormente
      if (project.removedDriveFileIds) {
        project.removedDriveFileIds = project.removedDriveFileIds.filter(
          id => id !== item.driveFileId && id !== item.fileName
        );
      }

      project.videos = project.videos || [];
      const existingIdx = project.videos.findIndex(v => v.driveFileId === item.driveFileId);
      if (existingIdx >= 0) {
        project.videos[existingIdx] = item;
      } else {
        project.videos.unshift(item);
      }
      uploadedItems.push(item);
    } catch (err) {
      console.error(`Erro ao enviar "${f.originalname}" para o Google Drive:`, err.message);
      errors.push({ file: f.originalname, error: err.message, code: err.code });
    } finally {
      try { fs.unlinkSync(f.path); } catch (e) {}
    }
  }

  if (uploadedItems.length > 0) {
    project.updatedAt = new Date().toISOString();
    storage.saveUserDb(req.user.id, userDb);
  }

  if (uploadedItems.length === 0 && errors.length > 0) {
    const firstErr = errors[0];
    const status = firstErr.code === 'DRIVE_INSUFFICIENT_PERMISSIONS' || firstErr.code === 'DRIVE_FORBIDDEN' ? 403 : 502;
    return res.status(status).json({
      error: firstErr.error,
      code: firstErr.code,
      details: errors
    });
  }

  res.status(201).json({
    success: true,
    items: uploadedItems,
    item: uploadedItems[0] || null,
    errors: errors.length > 0 ? errors : undefined,
    message: uploadedItems.length === 1
      ? `Arquivo "${uploadedItems[0].title}" enviado com sucesso para o Google Drive!`
      : `${uploadedItems.length} arquivos enviados com sucesso para o Google Drive!`
  });
});

// 8. Delete Video from project
app.delete('/api/projects/:id/videos/:videoId', requireAuthor, async (req, res) => {
  const userDb = storage.getUserDb(req.user.id);
  const project = (userDb.projects || []).find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });

  const vid = (project.videos || []).find(v => v.id === req.params.videoId);
  if (vid) {
    if (req.query.deleteFromDrive === 'true' && vid.driveFileId) {
      try {
        await driveApi.deleteDriveFileOrFolder(userDb, vid.driveFileId);
      } catch (err) {
        console.warn('Erro ao excluir arquivo no Google Drive:', err.message);
      }
    }
    project.removedDriveFileIds = project.removedDriveFileIds || [];
    if (vid.driveFileId && !project.removedDriveFileIds.includes(vid.driveFileId)) {
      project.removedDriveFileIds.push(vid.driveFileId);
    }
    if (vid.fileName && !project.removedDriveFileIds.includes(vid.fileName)) {
      project.removedDriveFileIds.push(vid.fileName);
    }
  }

  project.videos = (project.videos || []).filter(v => v.id !== req.params.videoId);
  userDb.comments = (userDb.comments || []).filter(c => c.videoId !== req.params.videoId);
  storage.saveUserDb(req.user.id, userDb);

  res.json({
    success: true,
    message: req.query.deleteFromDrive === 'true'
      ? 'Arquivo excluído do Google Drive e do Entrega com sucesso'
      : 'Arquivo removido da entrega com sucesso (arquivo mantido intacto no Google Drive)'
  });
});

// 8.1 Delete Folder from project
app.delete('/api/projects/:id/folders/:folderId', requireAuthor, async (req, res) => {
  const userDb = storage.getUserDb(req.user.id);
  const project = (userDb.projects || []).find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });

  const folderId = req.params.folderId;
  const folder = (project.folders || []).find(f => f.id === folderId);
  if (!folder) return res.status(404).json({ error: 'Pasta não encontrada' });

  if (req.query.deleteFromDrive === 'true') {
    try {
      await driveApi.deleteDriveFileOrFolder(userDb, folderId);
    } catch (err) {
      console.warn('Erro ao excluir pasta no Google Drive:', err.message);
    }
  }

  const foldersToRemove = new Set([folderId]);
  let added = true;
  while (added) {
    added = false;
    (project.folders || []).forEach(f => {
      if (f.parentId && foldersToRemove.has(f.parentId) && !foldersToRemove.has(f.id)) {
        foldersToRemove.add(f.id);
        added = true;
      }
    });
  }

  const vidsToRemove = (project.videos || []).filter(v => {
    const fid = v.driveFolderId || v.folderId;
    return fid && foldersToRemove.has(fid);
  });
  const vidIdsToRemove = new Set(vidsToRemove.map(v => v.id));

  project.folders = (project.folders || []).filter(f => !foldersToRemove.has(f.id));
  project.videos = (project.videos || []).filter(v => !vidIdsToRemove.has(v.id));
  userDb.comments = (userDb.comments || []).filter(c => !vidIdsToRemove.has(c.videoId));

  project.updatedAt = new Date().toISOString();
  storage.saveUserDb(req.user.id, userDb);
  res.json({ success: true, message: 'Pasta removida com sucesso' });
});

// Rate limiting para tentativas de senha (mitigação contra força bruta)
// Máximo de 5 tentativas com falha por intervalo de 10 minutos por IP + projeto
const passwordAttempts = new Map();
const MAX_PASSWORD_ATTEMPTS = 5;
const PASSWORD_WINDOW_MS = 10 * 60 * 1000;

function checkPasswordRateLimit(ip, targetId) {
  const key = `${ip}:${targetId}`;
  const now = Date.now();
  const entry = passwordAttempts.get(key);
  if (!entry) return { allowed: true };
  if (now - entry.firstAttempt > PASSWORD_WINDOW_MS) {
    passwordAttempts.delete(key);
    return { allowed: true };
  }
  if (entry.count >= MAX_PASSWORD_ATTEMPTS) {
    const remainingSec = Math.max(1, Math.ceil((PASSWORD_WINDOW_MS - (now - entry.firstAttempt)) / 1000));
    return { allowed: false, remainingSec };
  }
  return { allowed: true };
}

function recordPasswordFailure(ip, targetId) {
  const key = `${ip}:${targetId}`;
  const now = Date.now();
  const entry = passwordAttempts.get(key);
  if (!entry || (now - entry.firstAttempt > PASSWORD_WINDOW_MS)) {
    passwordAttempts.set(key, { count: 1, firstAttempt: now });
  } else {
    entry.count += 1;
  }
}

function clearPasswordFailure(ip, targetId) {
  const key = `${ip}:${targetId}`;
  passwordAttempts.delete(key);
}

// 9. Verify project password (emite cookie HttpOnly assinado para desbloqueio seguro no servidor)
app.post('/api/projects/verify-password', (req, res) => {
  const { projectId, shortCode, slug, password } = req.body;
  const found = (projectId ? storage.findUserByProjectId(projectId) : null)
    || (shortCode ? storage.resolveShortLink(shortCode) : null)
    || (slug ? storage.findProjectBySlug(slug) : null);
  if (!found || !found.project) return res.status(404).json({ error: 'Projeto não encontrado' });
  const { project } = found;

  const clientIp = (req.ip || (req.headers['x-forwarded-for'] || '').split(',')[0] || req.socket.remoteAddress || 'unknown').trim();
  const targetKey = project.id || shortCode || slug || 'generic';

  const rateLimit = checkPasswordRateLimit(clientIp, targetKey);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      verified: false,
      error: `Muitas tentativas incorretas. Aguarde ${rateLimit.remainingSec}s para tentar novamente.`,
      retryAfter: rateLimit.remainingSec
    });
  }

  const expected = String(project.password || '').trim();
  const provided = String(password || '').trim();
  const isMatch = !expected || (auth && auth.safeEqual ? auth.safeEqual(expected, provided) : expected === provided);
  if (isMatch) {
    clearPasswordFailure(clientIp, targetKey);
    if (auth && typeof auth.grantPasswordUnlock === 'function') {
      auth.grantPasswordUnlock(req, res, [project.id, project.slug, project.shortCode]);
    }
    return res.json({ verified: true, projectId: project.id, shortCode: project.shortCode });
  }

  recordPasswordFailure(clientIp, targetKey);
  return res.status(401).json({ verified: false, error: 'Senha incorreta' });
});

// 10. Add comment (suporta texto e/ou anexo de imagem hospedado na pasta Zomments no Google Drive)
app.post('/api/comments', requireUser, upload.single('image'), async (req, res) => {
  const { projectId, videoId, timecode, timecodeFormatted, content } = req.body;
  const hasImage = Boolean(req.file);

  if (!projectId || !videoId || (!content && !hasImage)) {
    if (req.file) { try { fs.unlinkSync(req.file.path); } catch (e) {} }
    return res.status(400).json({ error: 'Comentário deve conter texto ou imagem anexada' });
  }

  const found = storage.findUserByProjectId(projectId);
  if (!found) {
    if (req.file) { try { fs.unlinkSync(req.file.path); } catch (e) {} }
    return res.status(404).json({ error: 'Projeto não encontrado' });
  }
  const { userDb, userId, project } = found;

  if (!isProjectAccessAuthorized(req, project, userId, userDb)) {
    if (req.file) { try { fs.unlinkSync(req.file.path); } catch (e) {} }
    return res.status(401).json({ error: 'Diretório protegido por senha.' });
  }

  // Quem define se é Autor neste comentário é exclusivamente ser o dono deste projeto
  const isAuthor = isProjectOwnerUser(req.user, userId, userDb);
  if (!isAuthor) {
    const vid = (project.videos || []).find(v => v.id === videoId);
    if (!storage.isCommentsAllowed(vid, project)) {
      if (req.file) { try { fs.unlinkSync(req.file.path); } catch (e) {} }
      return res.status(403).json({ error: 'Comentários estão desativados para este item' });
    }
  }

  let imageAttachment = null;
  if (req.file) {
    try {
      if (project.cloudProvider && project.cloudProvider !== 'google') {
        imageAttachment = await cloudStorage.uploadCommentImageToCloud(
          userDb,
          project,
          req.file.path,
          req.file.originalname,
          req.file.mimetype
        );
      } else {
        const rootFolderId = project.driveFolderId || driveApi.extractFileId(project.driveLink);
        if (!rootFolderId) {
          throw new Error('Diretório raiz do Google Drive não configurado para este projeto');
        }

        // 1. Obtém ou cria a pasta "Zomments" na raiz do diretório do projeto no Drive
        const zommentsFolder = await driveApi.getOrCreateZommentsFolder(userDb, rootFolderId);

        // 2. Lista os arquivos atuais na pasta Zomments para checar colisão de nomes
        const existingFiles = await driveApi.listFilesInFolder(userDb, zommentsFolder.id);
        const existingNames = existingFiles.map(f => f.name);

        // 3. Aplica a regra de resolução: imagens com mesmo nome recebem (1), (2), sucessivamente...
        const finalFileName = driveApi.resolveUniqueFileName(existingNames, req.file.originalname);

        // 4. Faz upload diretamente para a pasta Zomments no Google Drive
        const uploadedItem = await driveApi.uploadFileToFolder(
          userDb,
          zommentsFolder.id,
          req.file.path,
          finalFileName,
          req.file.mimetype
        );

        imageAttachment = {
          name: finalFileName,
          originalName: req.file.originalname,
          driveFileId: uploadedItem.id,
          driveFolderId: zommentsFolder.id,
          mimeType: req.file.mimetype,
          size: req.file.size,
          url: `/api/comments/attachment/${uploadedItem.id}?project=${encodeURIComponent(project.id)}`
        };
      }
    } catch (uploadErr) {
      console.error('Erro ao enviar imagem do comentário:', uploadErr);
      return res.status(502).json({ error: 'Falha ao salvar imagem do comentário: ' + (uploadErr.message || 'Erro desconhecido') });
    } finally {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
  }

  const trimmedContent = (content || '').trim();
  const mentions = storage.extractMentionsFromText(trimmedContent, userDb, projectId);

  const newComment = {
    id: 'comm-' + Date.now(),
    projectId,
    videoId,
    authorName: req.user.name,
    authorEmail: req.user.email,
    authorAvatar: req.user.avatar,
    isAuthor,
    timecode: Number(timecode) || 0,
    timecodeFormatted: timecodeFormatted || '00:00',
    content: trimmedContent,
    image: imageAttachment,
    mentions,
    resolved: false,
    resolvedAt: null,
    resolvedBy: null,
    createdAt: new Date().toISOString(),
    replies: []
  };

  userDb.comments = userDb.comments || [];
  userDb.comments.push(newComment);
  storage.saveUserDb(userId, userDb);

  broadcastNotificationEvent({
    type: 'comment_created',
    commentId: newComment.id,
    projectId: newComment.projectId,
    videoId: newComment.videoId,
    actorEmail: req.user.email || '',
    timestamp: Date.now()
  });

  res.status(201).json(newComment);
});

// 11. Reply to comment
app.post('/api/comments/:id/reply', requireUser, (req, res) => {
  const found = storage.findCommentById(req.params.id);
  if (!found) return res.status(404).json({ error: 'Comentário não encontrado' });
  const { comment, userDb, userId } = found;

  const isAuthor = isProjectOwnerUser(req.user, userId, userDb);
  if (!isAuthor) {
    const proj = (userDb.projects || []).find(p => p.id === comment.projectId);
    const vid = proj && (proj.videos || []).find(v => v.id === comment.videoId);
    if (!storage.isCommentsAllowed(vid, proj)) {
      return res.status(403).json({ error: 'Comentários estão desativados para este item' });
    }
  }

  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Conteúdo vazio' });

  const trimmedContent = content.trim();
  const mentions = storage.extractMentionsFromText(trimmedContent, userDb, comment.projectId);

  const reply = {
    id: 'rep-' + Date.now(),
    authorName: req.user.name,
    authorEmail: req.user.email,
    authorAvatar: req.user.avatar,
    isAuthor,
    content: trimmedContent,
    mentions,
    createdAt: new Date().toISOString()
  };

  comment.replies = comment.replies || [];
  comment.replies.push(reply);

  // Qualquer nova resposta torna o comentário pai pendente novamente (mesmo que estivesse concluído)
  comment.resolved = false;
  comment.resolvedAt = null;
  comment.resolvedBy = null;
  comment.updatedAt = reply.createdAt;

  storage.saveUserDb(userId, userDb);

  broadcastNotificationEvent({
    type: 'reply_created',
    commentId: comment.id,
    replyId: reply.id,
    projectId: comment.projectId,
    videoId: comment.videoId,
    actorEmail: req.user.email || '',
    timestamp: Date.now()
  });

  res.status(201).json(reply);
});

// Quem pode editar/excluir: o dono do comentário ou o Autor proprietário do projeto
function canModify(user, ownerEmail, authorUserId, ownerDb) {
  if (!user) return false;
  if (isProjectOwnerUser(user, authorUserId, ownerDb)) return true;
  return Boolean(ownerEmail && user.email && String(user.email).toLowerCase() === String(ownerEmail).toLowerCase());
}

// Edit comment
app.put('/api/comments/:id', requireUser, (req, res) => {
  const found = storage.findCommentById(req.params.id);
  if (!found) return res.status(404).json({ error: 'Comentário não encontrado' });
  const { comment, userDb, userId } = found;

  if (!canModify(req.user, comment.authorEmail, userId, userDb)) {
    return res.status(403).json({ error: 'Sem permissão' });
  }

  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Conteúdo vazio' });

  comment.content = content.trim();
  comment.mentions = storage.extractMentionsFromText(comment.content, userDb, comment.projectId);
  comment.updatedAt = new Date().toISOString();
  storage.saveUserDb(userId, userDb);

  broadcastNotificationEvent({
    type: 'comment_updated',
    commentId: comment.id,
    projectId: comment.projectId,
    videoId: comment.videoId,
    actorEmail: req.user.email || '',
    timestamp: Date.now()
  });

  res.json(comment);
});

// Delete comment (exclui a imagem no Drive e, se só houver 1 na pasta Zomments, remove a pasta também)
app.delete('/api/comments/:id', requireUser, async (req, res) => {
  const found = storage.findCommentById(req.params.id);
  if (!found) return res.status(404).json({ error: 'Comentário não encontrado' });
  const { comment, userDb, userId } = found;

  if (!canModify(req.user, comment.authorEmail, userId, userDb)) {
    return res.status(403).json({ error: 'Sem permissão' });
  }

  // Se o comentário tem imagem anexada no Google Drive
  if (comment.image && comment.image.driveFileId) {
    try {
      await driveApi.deleteCommentImage(userDb, comment.image.driveFileId, comment.image.driveFolderId);
    } catch (err) {
      console.warn('Erro ao remover imagem do comentário no Google Drive:', err.message);
    }
  }

  userDb.comments = (userDb.comments || []).filter(c => c.id !== req.params.id);
  storage.saveUserDb(userId, userDb);

  broadcastNotificationEvent({
    type: 'comment_deleted',
    commentId: comment.id,
    projectId: comment.projectId,
    videoId: comment.videoId,
    actorEmail: req.user.email || '',
    timestamp: Date.now()
  });

  res.json({ success: true });
});

// Servir imagem anexada em comentário diretamente do Google Drive (ou placeholder Unavailable Picture)
app.get('/api/comments/attachment/:fileId', async (req, res) => {
  const fileId = req.params.fileId;
  const projectId = req.query.project;

  if (!projectId || !fileId) {
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.status(404).send(driveApi.getUnavailablePictureSvg());
  }

  const found = storage.findUserByProjectId(projectId);
  if (!found) {
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.status(404).send(driveApi.getUnavailablePictureSvg());
  }
  const { userDb, userId, project } = found;

  if (!isProjectAccessAuthorized(req, project, userId, userDb)) {
    return res.status(401).send('Diretório protegido por senha');
  }

  try {
    return await driveApi.streamFile(req, res, userDb, fileId, { download: false, fileName: 'comment-attachment.jpg' });
  } catch (err) {
    console.warn(`[Comments] Imagem indisponível no Drive (${fileId}):`, err.message);
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.status(404).send(driveApi.getUnavailablePictureSvg());
  }
});

// Toggle Resolve comment (Restrito exclusivamente ao Autor proprietário daquele projeto)
app.post('/api/comments/:id/toggle-resolve', requireUser, (req, res) => {
  const found = storage.findCommentById(req.params.id);
  if (!found) return res.status(404).json({ error: 'Comentário não encontrado' });
  const { comment, userDb, userId } = found;

  // Clientes daquele projeto não podem marcar comentários como concluídos - apenas o autor do projeto
  if (!isProjectOwnerUser(req.user, userId, userDb)) {
    return res.status(403).json({ error: 'Apenas o autor deste projeto pode marcar comentários como concluídos.' });
  }

  const shouldResolve = typeof req.body.resolved === 'boolean' ? req.body.resolved : !comment.resolved;
  comment.resolved = shouldResolve;
  comment.resolvedAt = shouldResolve ? new Date().toISOString() : null;
  comment.resolvedBy = shouldResolve ? {
    name: req.user.name,
    email: req.user.email,
    isAuthor: true
  } : null;

  storage.saveUserDb(userId, userDb);

  broadcastNotificationEvent({
    type: 'comment_resolved',
    commentId: comment.id,
    resolved: comment.resolved,
    projectId: comment.projectId,
    videoId: comment.videoId,
    actorEmail: req.user.email || '',
    timestamp: Date.now()
  });

  res.json(comment);
});

// Edit reply
app.put('/api/comments/:id/reply/:replyId', requireUser, (req, res) => {
  const found = storage.findCommentById(req.params.id);
  if (!found) return res.status(404).json({ error: 'Comentário não encontrado' });
  const { comment, userDb, userId } = found;

  const reply = (comment.replies || []).find(r => r.id === req.params.replyId);
  if (!reply) return res.status(404).json({ error: 'Resposta não encontrada' });
  if (!canModify(req.user, reply.authorEmail, userId, userDb)) return res.status(403).json({ error: 'Sem permissão' });

  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Conteúdo vazio' });

  reply.content = content.trim();
  reply.mentions = storage.extractMentionsFromText(reply.content, userDb, comment.projectId);
  reply.updatedAt = new Date().toISOString();
  storage.saveUserDb(userId, userDb);

  broadcastNotificationEvent({
    type: 'reply_updated',
    commentId: comment.id,
    replyId: reply.id,
    projectId: comment.projectId,
    videoId: comment.videoId,
    actorEmail: req.user.email || '',
    timestamp: Date.now()
  });

  res.json(reply);
});

// Delete reply
app.delete('/api/comments/:id/reply/:replyId', requireUser, (req, res) => {
  const found = storage.findCommentById(req.params.id);
  if (!found) return res.status(404).json({ error: 'Comentário não encontrado' });
  const { comment, userDb, userId } = found;

  const target = (comment.replies || []).find(r => r.id === req.params.replyId);
  if (target && !canModify(req.user, target.authorEmail, userId, userDb)) {
    return res.status(403).json({ error: 'Sem permissão' });
  }

  comment.replies = (comment.replies || []).filter(r => r.id !== req.params.replyId);
  storage.saveUserDb(userId, userDb);

  broadcastNotificationEvent({
    type: 'reply_deleted',
    commentId: comment.id,
    replyId: req.params.replyId,
    projectId: comment.projectId,
    videoId: comment.videoId,
    actorEmail: req.user.email || '',
    timestamp: Date.now()
  });

  res.json({ success: true });
});

// Real-time Server-Sent Events (SSE) para notificações instantâneas
const notificationSseClients = new Set();

function broadcastNotificationEvent(payload) {
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  for (const clientRes of notificationSseClients) {
    try {
      clientRes.write(data);
    } catch (e) {
      notificationSseClients.delete(clientRes);
    }
  }
}

app.get('/api/notifications/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`);
  notificationSseClients.add(res);

  const heartbeat = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch (e) {
      clearInterval(heartbeat);
      notificationSseClients.delete(res);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    notificationSseClients.delete(res);
  });
});

// Notificações de comentários pendentes e histórico
app.get('/api/notifications', (req, res) => {
  const currentProjectId = req.query.projectId || null;
  const currentCode = req.query.code || null;
  const result = storage.getPendingNotifications(req.user, currentProjectId, currentCode);
  const pending = Array.isArray(result) ? result : (result.pending || []);
  const history = Array.isArray(result) ? [] : (result.history || []);
  res.json({
    ok: true,
    isAuthor: Boolean(req.user && req.user.isAuthor),
    user: req.user ? { id: req.user.id, name: req.user.name, email: req.user.email, isAuthor: req.user.isAuthor } : null,
    pending,
    history
  });
});

// 12. Sync from Google Drive link
app.post('/api/drive/sync', requireAuthor, async (req, res) => {
  const userDb = storage.getUserDb(req.user.id);
  const { driveLink, projectId } = req.body;
  const probe = (userDb.projects || []).find(p => p.id === projectId);
  if (!probe) return res.status(404).json({ error: 'Projeto não encontrado' });

  const linkToSync = (driveLink || probe.driveLink || '').trim();
  if (!linkToSync) {
    return res.status(400).json({ error: 'Link do Google Drive não fornecido' });
  }

  const draft = JSON.parse(JSON.stringify(probe));
  draft.driveLink = linkToSync;

  let result;
  try {
    result = await mirrorProject(draft, userDb);
  } catch (err) {
    console.error('Falha ao espelhar pasta:', err.message);
    return res.status(mirrorErrorStatus(err)).json({ error: err.message, code: err.code });
  }

  const currentDb = storage.getUserDb(req.user.id);
  const project = (currentDb.projects || []).find(p => p.id === projectId);
  if (!project) return res.status(404).json({ error: 'Projeto não encontrado' });

  applyMirror(project, draft);
  project.updatedAt = new Date().toISOString();
  storage.saveUserDb(req.user.id, currentDb);

  const count = project.videos.length;
  const videoCount = (project.videos || []).filter(v => v.type !== 'image').length;
  const imageCount = (project.videos || []).filter(v => v.type === 'image').length;
  let breakdown = '';
  if (videoCount > 0 && imageCount > 0) {
    breakdown = ` (${videoCount} vídeo${videoCount > 1 ? 's' : ''}, ${imageCount} foto${imageCount > 1 ? 's' : ''})`;
  } else if (imageCount > 0) {
    breakdown = ` (${imageCount} foto${imageCount > 1 ? 's' : ''})`;
  } else if (videoCount > 0) {
    breakdown = ` (${videoCount} vídeo${videoCount > 1 ? 's' : ''})`;
  }

  let message;
  if (result.source === 'api') {
    message = count > 0
      ? `${count} arquivo(s)${breakdown} espelhado(s) da pasta "${result.resolvedFolder}" pela API do Google Drive.`
      : `Pasta "${result.resolvedFolder}" encontrada, mas nenhum vídeo ou foto foi localizado nela.`;
  } else if (result.source === 'local') {
    message = count > 0
      ? `${count} arquivo(s)${breakdown} espelhado(s) da pasta local do Drive.`
      : 'Pasta localizada, mas nenhum arquivo de vídeo ou foto foi encontrado nela.';
  } else {
    message = 'Pasta vinculada. Faça login com Google como Autor para espelhar pela API do Drive.';
  }

  res.json({
    success: true,
    source: result.source,
    resolvedFolder: result.resolvedFolder,
    detectedFiles: count,
    message
  });
});

// 13. Batch Zip Download
async function handleDownloadZip(req, res) {
  const projectId = req.params.id;
  const found = storage.findUserByProjectId(projectId) || storage.findProjectBySlug(projectId);
  if (!found) return res.status(404).send('Diretório não encontrado');
  const { project, userDb } = found;

  // Verificar senha do projeto via cookie HttpOnly assinado, sessão do dono ou parâmetro
  if (!isProjectAccessAuthorized(req, project, found.userId, userDb)) {
    return res.status(401).send('Acesso bloqueado: senha incorreta');
  }

  let targetVideos = project.videos || [];
  const itemsParam = req.query.items || req.body?.items;
  const folderParam = req.query.folder || req.query.pasta;
  const foldersParam = req.query.folders || req.body?.folders;

  if (foldersParam || (itemsParam && itemsParam !== 'all')) {
    const selectedItemIds = new Set();
    if (itemsParam && itemsParam !== 'all') {
      const ids = Array.isArray(itemsParam) ? itemsParam : String(itemsParam).split(',');
      ids.forEach(s => selectedItemIds.add(String(s).trim()));
    }

    if (foldersParam) {
      const fids = Array.isArray(foldersParam) ? foldersParam : String(foldersParam).split(',');
      const folderSet = new Set(fids.map(s => String(s).trim()));
      let added = true;
      while (added) {
        added = false;
        for (const f of (project.folders || [])) {
          if (folderSet.has(f.parentId) && !folderSet.has(f.id)) {
            folderSet.add(f.id);
            added = true;
          }
        }
      }
      (project.videos || []).forEach(v => {
        if (folderSet.has(v.driveFolderId)) {
          selectedItemIds.add(v.id);
        }
      });
    }

    if (selectedItemIds.size > 0) {
      targetVideos = targetVideos.filter(v => selectedItemIds.has(v.id));
    }
  } else if (folderParam) {
    const folderSet = new Set([folderParam]);
    let added = true;
    while (added) {
      added = false;
      for (const f of (project.folders || [])) {
        if (folderSet.has(f.parentId) && !folderSet.has(f.id)) {
          folderSet.add(f.id);
          added = true;
        }
      }
    }
    targetVideos = targetVideos.filter(v => {
      const fid = v.driveFolderId || v.folderId;
      return folderSet.has(fid);
    });
  }

  if (targetVideos.length === 0) {
    return res.status(400).send('Nenhum arquivo disponível para compactação');
  }

  const scopedFolderObj = folderParam ? (project.folders || []).find(f => f.id === folderParam) : null;
  const zipBaseName = scopedFolderObj ? (scopedFolderObj.name || project.name) : (project.name || 'Entrega');
  const safeProjectName = zipBaseName.replace(/[/\\?%*:|"<>]/g, '_').trim();
  const zipFileName = `${safeProjectName}.zip`;

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(zipFileName)}`);

  const archive = new ZipArchive({
    zlib: { level: 0 }
  });

  archive.on('warning', (err) => {
    console.warn('Aviso no ZipArchive:', err);
  });

  archive.on('error', (err) => {
    console.error('Erro no ZipArchive:', err);
    if (!res.headersSent) res.status(500).send('Erro ao gerar arquivo compactado');
    else res.destroy();
  });

  res.on('close', () => {
    archive.destroy();
  });

  archive.pipe(res);

  // Map folders to calculate relative path in zip
  const folderMap = new Map();
  (project.folders || []).forEach(f => {
    if (f && f.id) folderMap.set(f.id, f);
  });

  function resolveFileFolderPath(v, baseFolderId) {
    let p = '';
    // 1. Direct folderPath from item if present (populated during Drive scan)
    if (v.folderPath) {
      p = v.folderPath;
    } else if (v.driveFolderId && folderMap.has(v.driveFolderId)) {
      const f = folderMap.get(v.driveFolderId);
      if (f.path) {
        p = f.path;
      } else {
        const parts = [];
        let curr = f;
        const visited = new Set();
        while (curr && !visited.has(curr.id) && curr.id !== project.driveFolderId) {
          visited.add(curr.id);
          parts.unshift(curr.name || 'Pasta');
          curr = curr.parentId ? folderMap.get(curr.parentId) : null;
        }
        p = parts.join('/');
      }
    }

    p = (p || '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').trim();

    // If downloading inside a subfolder (folderParam)
    if (baseFolderId && baseFolderId !== project.driveFolderId && folderMap.has(baseFolderId)) {
      const baseF = folderMap.get(baseFolderId);
      const basePath = (baseF.path || baseF.name || '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '').trim();
      if (basePath && p.startsWith(basePath)) {
        p = p.slice(basePath.length).replace(/^\/+/, '');
      }
    }

    if (!p) return '';
    return p
      .split('/')
      .map(seg => seg.replace(/[/\\?%*:|"<>]/g, '_').trim())
      .filter(seg => seg && seg !== '.' && seg !== '..')
      .join('/');
  }

  const createdDirs = new Set();
  function ensureZipDir(dirPath) {
    if (!dirPath) return;
    const parts = dirPath.split('/');
    let cur = '';
    for (const p of parts) {
      cur = cur ? `${cur}/${p}` : p;
      const key = cur.toLowerCase() + '/';
      if (!createdDirs.has(key)) {
        createdDirs.add(key);
        try {
          archive.append(null, { name: cur + '/' });
        } catch (e) {}
      }
    }
  }

  const usedPaths = new Set();

  for (const v of targetVideos) {
    let fileName = v.fileName || `${v.title || 'arquivo'}.${v.type === 'image' ? 'jpg' : 'mp4'}`;
    fileName = fileName.replace(/[/\\?%*:|"<>]/g, '_');
    const ext = path.extname(fileName) || (v.type === 'image' ? '.jpg' : '.mp4');
    const baseName = path.basename(fileName, ext);
    let nameCandidate = `${baseName}${ext}`;

    const relDir = resolveFileFolderPath(v, folderParam);
    if (relDir) {
      ensureZipDir(relDir);
    }

    let fullEntryPath = relDir ? `${relDir}/${nameCandidate}` : nameCandidate;
    let counter = 1;
    while (usedPaths.has(fullEntryPath.toLowerCase())) {
      const suffixedName = `${baseName} (${counter})${ext}`;
      fullEntryPath = relDir ? `${relDir}/${suffixedName}` : suffixedName;
      counter++;
    }
    usedPaths.add(fullEntryPath.toLowerCase());

    try {
      let stream = null;
      if (v.driveFileId) {
        stream = await driveApi.getFileStream(userDb, v.driveFileId);
      } else if (v.localPath && fs.existsSync(v.localPath)) {
        stream = fs.createReadStream(v.localPath);
      } else if (v.url && v.url.startsWith('/assets/')) {
        const assetPath = path.join(__dirname, 'public', v.url);
        if (fs.existsSync(assetPath)) {
          stream = fs.createReadStream(assetPath);
        }
      } else if (v.url && v.url.includes('drive=')) {
        const match = v.url.match(/drive=([a-zA-Z0-9_-]+)/);
        if (match) {
          stream = await driveApi.getFileStream(userDb, match[1]);
        }
      }

      if (stream) {
        await new Promise((resolve) => {
          let resolved = false;
          const finish = () => {
            if (!resolved) {
              resolved = true;
              resolve();
            }
          };
          stream.on('error', (err) => {
            console.error(`Erro ao transmitir ${fullEntryPath}:`, err.message);
            finish();
          });
          archive.once('entry', finish);
          archive.append(stream, { name: fullEntryPath });
        });
      }
    } catch (err) {
      console.error(`Erro ao processar ${fullEntryPath} no zip:`, err.message);
    }
  }

  await archive.finalize();
}

app.get('/api/projects/:id/download-zip', handleDownloadZip);
app.post('/api/projects/:id/download-zip', handleDownloadZip);

// 14. High Quality Secure Video Stream with HTTP 206 Partial Content & Alpha WebM VP9 support
const ALPHA_CACHE_DIR = path.join(APP_DATA_DIR, 'alpha_cache');
try { fs.mkdirSync(ALPHA_CACHE_DIR, { recursive: true }); } catch (e) {}

const WEB_VIDEO_CACHE_DIR = path.join(APP_DATA_DIR, 'web_cache');
try { fs.mkdirSync(WEB_VIDEO_CACHE_DIR, { recursive: true }); } catch (e) {}

const convertingAlphaJobs = new Map();
const convertingWebJobs = new Map();

// Codecs que NÃO rodam nativamente nos navegadores (Chrome, Safari, Firefox, Edge, iOS, Android)
// Estes arquivos (ex: ProRes 422, ProRes LT, ProRes 4444, DNxHD) reproduzem apenas áudio se não convertidos
const NON_BROWSER_VIDEO_CODECS = new Set([
  'prores', 'dnxhd', 'dnxhr', 'cineform', 'cfhd',
  'v210', 'v410', 'rawvideo', 'qtrle', 'mpeg2video', 'dvvideo', 'icod'
]);

function probeVideoNeedsWebTranscode(filePath) {
  return new Promise((resolve) => {
    let ffmpegPath = 'ffmpeg';
    try { ffmpegPath = require('ffmpeg-static') || 'ffmpeg'; } catch (e) {}
    const proc = spawn(ffmpegPath, ['-i', filePath]);
    let errStr = '';
    proc.stderr.on('data', d => errStr += d.toString());
    proc.on('close', () => {
      const vMatch = errStr.match(/Stream #\d+:\d+.*?: Video: ([a-zA-Z0-9_-]+)/i);
      const vCodec = vMatch ? vMatch[1].toLowerCase() : null;
      const needsTranscode = Boolean(vCodec && Array.from(NON_BROWSER_VIDEO_CODECS).some(c => vCodec.includes(c)));
      resolve({ vCodec, needsTranscode });
    });
    proc.on('error', () => resolve({ vCodec: null, needsTranscode: false }));
  });
}

function transcodeVideoToH264(input, output) {
  let ffmpegPath = 'ffmpeg';
  try { ffmpegPath = require('ffmpeg-static') || 'ffmpeg'; } catch (e) {}

  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, [
      '-y',
      '-i', input,
      '-map', '0:v:0',
      '-map', '0:a?',
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '21',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-movflags', '+faststart',
      output
    ]);

    let errStr = '';
    proc.stderr.on('data', d => errStr += d.toString());
    proc.on('close', code => {
      if (code === 0 && fs.existsSync(output) && fs.statSync(output).size > 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg web transcode failed with code ${code}: ${errStr.slice(-300)}`));
      }
    });
    proc.on('error', reject);
  });
}

async function ensureLocalWebCompatibleVideo(filePath) {
  try {
    const stat = fs.statSync(filePath);
    const crypto = require('crypto');
    const fileKey = crypto.createHash('md5').update(`${filePath}_${stat.size}_${stat.mtimeMs}`).digest('hex');
    const cachePath = path.join(WEB_VIDEO_CACHE_DIR, `local_${fileKey}.mp4`);
    if (fs.existsSync(cachePath) && fs.statSync(cachePath).size > 0) {
      return cachePath;
    }

    if (convertingWebJobs.has(fileKey)) {
      return convertingWebJobs.get(fileKey);
    }

    const job = (async () => {
      const probe = await probeVideoNeedsWebTranscode(filePath);
      if (!probe.needsTranscode) {
        return null;
      }

      const tempTarget = path.join(uploadTempDir, `out_web_${fileKey}_${Date.now()}.mp4`);
      try {
        await transcodeVideoToH264(filePath, tempTarget);
        if (fs.existsSync(tempTarget)) {
          fs.renameSync(tempTarget, cachePath);
          return cachePath;
        }
        return null;
      } finally {
        try { if (fs.existsSync(tempTarget)) fs.unlinkSync(tempTarget); } catch (e) {}
        convertingWebJobs.delete(fileKey);
      }
    })();

    convertingWebJobs.set(fileKey, job);
    return job;
  } catch (err) {
    console.error('Erro em ensureLocalWebCompatibleVideo:', err.message);
    return null;
  }
}

async function ensureDriveWebCompatibleVideo(fileId, video, userDb) {
  const cachePath = path.join(WEB_VIDEO_CACHE_DIR, `${fileId}.mp4`);
  if (fs.existsSync(cachePath) && fs.statSync(cachePath).size > 0) {
    return cachePath;
  }

  if (convertingWebJobs.has(fileId)) {
    return convertingWebJobs.get(fileId);
  }

  const job = (async () => {
    const tempSource = path.join(uploadTempDir, `src_drive_${fileId}_${Date.now()}.mov`);
    const tempTarget = path.join(uploadTempDir, `out_drive_${fileId}_${Date.now()}.mp4`);

    try {
      const stream = await driveApi.getFileStream(userDb, fileId);
      const ws = fs.createWriteStream(tempSource);
      stream.pipe(ws);
      await new Promise((resolve, reject) => {
        ws.on('finish', resolve);
        ws.on('error', reject);
        stream.on('error', reject);
      });

      const probe = await probeVideoNeedsWebTranscode(tempSource);
      if (!probe.needsTranscode) {
        return null;
      }

      await transcodeVideoToH264(tempSource, tempTarget);
      if (fs.existsSync(tempTarget)) {
        fs.renameSync(tempTarget, cachePath);
        return cachePath;
      }
      return null;
    } catch (err) {
      console.error('Erro em ensureDriveWebCompatibleVideo:', err.message);
      return null;
    } finally {
      try { if (fs.existsSync(tempSource)) fs.unlinkSync(tempSource); } catch (e) {}
      try { if (fs.existsSync(tempTarget)) fs.unlinkSync(tempTarget); } catch (e) {}
      convertingWebJobs.delete(fileId);
    }
  })();

  convertingWebJobs.set(fileId, job);
  return job;
}

// Solução 4: FastStart Automático em Segundo Plano para Arquivos Pesados (Moov Atom Fix)
// Move o átomo moov para o byte 0 via FFmpeg stream copy (-c copy), sem reencodar nem perder qualidade
const fastStartJobs = new Map();
let activeFastStartCount = 0;
const MAX_CONCURRENT_FASTSTART = 2;
const fastStartQueue = [];

function processNextFastStartQueue() {
  if (activeFastStartCount >= MAX_CONCURRENT_FASTSTART || fastStartQueue.length === 0) return;
  const nextTask = fastStartQueue.shift();
  if (!nextTask) return;
  activeFastStartCount++;
  nextTask().finally(() => {
    activeFastStartCount--;
    processNextFastStartQueue();
  });
}

function queueFastStartTask(taskFn) {
  fastStartQueue.push(taskFn);
  processNextFastStartQueue();
}

function applyFastStartToMp4(input, output) {
  let ffmpegPath = 'ffmpeg';
  try { ffmpegPath = require('ffmpeg-static') || 'ffmpeg'; } catch (e) {}

  return new Promise((resolve, reject) => {
    // -c copy: Cópia direta de vídeo e áudio sem reencodar, 100% fidelidade original e execução em segundos
    // -movflags +faststart: reposiciona o índice moov no início do arquivo
    const proc = spawn(ffmpegPath, [
      '-y',
      '-i', input,
      '-c', 'copy',
      '-movflags', '+faststart',
      output
    ]);

    let errStr = '';
    proc.stderr.on('data', d => errStr += d.toString());
    proc.on('close', code => {
      if (code === 0 && fs.existsSync(output) && fs.statSync(output).size > 0) {
        resolve();
      } else {
        reject(new Error(`FastStart ffmpeg failed (code ${code}): ${errStr.slice(-250)}`));
      }
    });
    proc.on('error', reject);
  });
}

function ensureDriveFastStartBackground(fileId, video, userDb) {
  const cachePath = path.join(WEB_VIDEO_CACHE_DIR, `${fileId}_faststart.mp4`);
  if (fs.existsSync(cachePath) && fs.statSync(cachePath).size > 0) {
    return;
  }
  if (fastStartJobs.has(fileId)) {
    return;
  }

  // Não processa áudio, imagens ou arquivos que já tenham versão web transcodificada
  const webCacheOrig = path.join(WEB_VIDEO_CACHE_DIR, `${fileId}.mp4`);
  if (fs.existsSync(webCacheOrig)) return;

  const fileName = (video?.fileName || video?.title || '').toLowerCase();
  const mime = (video?.mimeType || '').toLowerCase();
  const isVideo = mime.startsWith('video/') || fileName.endsWith('.mp4') || fileName.endsWith('.mov') || fileName.endsWith('.m4v');
  if (!isVideo) return;

  fastStartJobs.set(fileId, true);

  queueFastStartTask(async () => {
    const tempSource = path.join(uploadTempDir, `src_fs_${fileId}_${Date.now()}.tmp`);
    const tempTarget = path.join(uploadTempDir, `out_fs_${fileId}_${Date.now()}.mp4`);
    try {
      const stream = await driveApi.getFileStream(userDb, fileId);
      const ws = fs.createWriteStream(tempSource);
      stream.pipe(ws);
      await new Promise((resolve, reject) => {
        ws.on('finish', resolve);
        ws.on('error', reject);
        stream.on('error', reject);
      });

      if (!fs.existsSync(tempSource) || fs.statSync(tempSource).size === 0) {
        return;
      }

      await applyFastStartToMp4(tempSource, tempTarget);
      if (fs.existsSync(tempTarget) && fs.statSync(tempTarget).size > 0) {
        fs.renameSync(tempTarget, cachePath);
      }
    } catch (err) {
      console.warn(`[FastStart] Não foi possível aplicar faststart para (${fileId}):`, err.message);
    } finally {
      try { if (fs.existsSync(tempSource)) fs.unlinkSync(tempSource); } catch (e) {}
      try { if (fs.existsSync(tempTarget)) fs.unlinkSync(tempTarget); } catch (e) {}
      fastStartJobs.delete(fileId);
    }
  });
}

function ensureLocalFastStartBackground(filePath, fileKey) {
  const cachePath = path.join(WEB_VIDEO_CACHE_DIR, `local_${fileKey}_faststart.mp4`);
  if (fs.existsSync(cachePath) && fs.statSync(cachePath).size > 0) {
    return;
  }
  if (fastStartJobs.has(fileKey)) {
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  if (ext !== '.mp4' && ext !== '.mov' && ext !== '.m4v') return;

  fastStartJobs.set(fileKey, true);

  queueFastStartTask(async () => {
    const tempTarget = path.join(uploadTempDir, `out_local_fs_${fileKey}_${Date.now()}.mp4`);
    try {
      await applyFastStartToMp4(filePath, tempTarget);
      if (fs.existsSync(tempTarget) && fs.statSync(tempTarget).size > 0) {
        fs.renameSync(tempTarget, cachePath);
      }
    } catch (err) {
      console.warn(`[FastStart] Não foi possível aplicar faststart local (${fileKey}):`, err.message);
    } finally {
      try { if (fs.existsSync(tempTarget)) fs.unlinkSync(tempTarget); } catch (e) {}
      fastStartJobs.delete(fileKey);
    }
  });
}

function streamLocalRangeFile(req, res, filePath, customContentType = null, customFileName = null, forceDownload = false) {
  let stat;
  try {
    stat = fs.statSync(filePath);
    if (!stat.isFile()) return res.status(400).send('O caminho solicitado não é um arquivo');
  } catch (err) {
    return res.status(404).send('Arquivo não encontrado');
  }

  const fileSize = stat.size;
  const range = req.headers.range;

  const ext = path.extname(filePath).toLowerCase();
  let contentType = customContentType;
  if (!contentType) {
    if (ext === '.mov') contentType = 'video/quicktime';
    else if (ext === '.webm') contentType = 'video/webm';
    else if (ext === '.mkv') contentType = 'video/x-matroska';
    else if (ext === '.m4v') contentType = 'video/x-m4v';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.tiff' || ext === '.tif') contentType = 'image/tiff';
    else if (ext === '.heic' || ext === '.heif') contentType = 'image/heic';
    else contentType = 'video/mp4';
  }

  const fileName = customFileName || path.basename(filePath);
  const disposition = forceDownload ? `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}` : 'inline';

  const onStreamError = (file) => file.on('error', (err) => {
    console.error('Erro ao ler stream local:', err.code || err.message);
    if (!res.headersSent) res.status(500).end();
    else res.destroy();
  });

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    let start;
    let end;
    if (parts[0] === '') {
      const suffix = parseInt(parts[1], 10);
      start = Number.isNaN(suffix) ? NaN : Math.max(fileSize - suffix, 0);
      end = fileSize - 1;
    } else {
      start = parseInt(parts[0], 10);
      const requestedEnd = parts[1] ? parseInt(parts[1], 10) : null;
      if (requestedEnd !== null) {
        end = Math.min(requestedEnd, fileSize - 1);
      } else {
        // Range aberto para streaming local (SSD): transmite continuamente até o fim do arquivo
        // com controle de fluxo natural pelo backpressure do Node.js/TCP
        end = fileSize - 1;
      }
    }

    if (Number.isNaN(start) || Number.isNaN(end) || start < 0 || start >= fileSize || end < start) {
      res.writeHead(416, { 'Content-Range': `bytes */${fileSize}` });
      return res.end();
    }

    const chunksize = (end - start) + 1;
    if (res.socket && typeof res.socket.setNoDelay === 'function') {
      res.socket.setNoDelay(true);
    }
    const file = fs.createReadStream(filePath, { start, end, highWaterMark: 1024 * 1024 });
    onStreamError(file);
    req.on('close', () => file.destroy());

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
      'Content-Disposition': disposition
    });
    file.pipe(res);
  } else {
    if (res.socket && typeof res.socket.setNoDelay === 'function') {
      res.socket.setNoDelay(true);
    }
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Content-Disposition': disposition
    });
    const file = fs.createReadStream(filePath, { highWaterMark: 1024 * 1024 });
    onStreamError(file);
    req.on('close', () => file.destroy());
    file.pipe(res);
  }
}

function probeVideoAlpha(filePath) {
  return new Promise((resolve) => {
    let ffmpegPath = 'ffmpeg';
    try { ffmpegPath = require('ffmpeg-static') || 'ffmpeg'; } catch (e) {}
    const proc = spawn(ffmpegPath, ['-i', filePath]);
    let errStr = '';
    proc.stderr.on('data', d => errStr += d.toString());
    proc.on('close', () => {
      // Formats with alpha channel: yuva, rgba, argb, bgra, abgr, ya8, ap4h, ap4x, qtrle
      const hasAlpha = /yuva|rgba|argb|bgra|abgr|ya8|ap4h|ap4x|qtrle/i.test(errStr);
      resolve(hasAlpha);
    });
    proc.on('error', () => resolve(false));
  });
}

async function ensureAlphaWebm(fileId, video, userDb) {
  const cachePath = path.join(ALPHA_CACHE_DIR, `${fileId}.webm`);
  if (fs.existsSync(cachePath) && fs.statSync(cachePath).size > 0) {
    return cachePath;
  }

  if (convertingAlphaJobs.has(fileId)) {
    return convertingAlphaJobs.get(fileId);
  }

  const job = (async () => {
    let ffmpegPath = 'ffmpeg';
    try { ffmpegPath = require('ffmpeg-static') || 'ffmpeg'; } catch (e) {}

    const tempSource = path.join(uploadTempDir, `src_alpha_${fileId}_${Date.now()}.mov`);
    const tempTarget = path.join(uploadTempDir, `out_alpha_${fileId}_${Date.now()}.webm`);

    try {
      const stream = await driveApi.getFileStream(userDb, fileId);
      const ws = fs.createWriteStream(tempSource);
      stream.pipe(ws);
      await new Promise((resolve, reject) => {
        ws.on('finish', resolve);
        ws.on('error', reject);
        stream.on('error', reject);
      });
      const sourcePath = tempSource;

      // Check if video genuinely has an alpha channel
      const hasAlpha = await probeVideoAlpha(sourcePath);
      if (!hasAlpha) {
        if (video) {
          video.isAlpha = false;
          if (userDb && userDb.user && userDb.user.id) {
            storage.saveUserDb(userDb.user.id, userDb);
          }
        }
        return null;
      }

      await runFfmpeg(sourcePath, tempTarget);

      fs.renameSync(tempTarget, cachePath);
      return cachePath;
    } finally {
      try { if (fs.existsSync(tempSource)) fs.unlinkSync(tempSource); } catch (e) {}
      try { if (fs.existsSync(tempTarget)) fs.unlinkSync(tempTarget); } catch (e) {}
      convertingAlphaJobs.delete(fileId);
    }

    function runFfmpeg(input, output) {
      return new Promise((resolve, reject) => {
        const proc = spawn(ffmpegPath, [
          '-y',
          '-i', input,
          '-map', '0:v:0',
          '-map', '0:a?',
          '-c:v', 'libvpx-vp9',
          '-pix_fmt', 'yuva420p',
          '-speed', '4',
          '-deadline', 'realtime',
          '-b:v', '3M',
          '-auto-alt-ref', '0',
          '-c:a', 'libopus',
          '-b:a', '128k',
          output
        ]);

        let errStr = '';
        proc.stderr.on('data', d => errStr += d.toString());
        proc.on('close', code => {
          if (code === 0 && fs.existsSync(output) && fs.statSync(output).size > 0) {
            resolve();
          } else {
            reject(new Error(`FFmpeg alpha failed with code ${code}: ${errStr.slice(-300)}`));
          }
        });
        proc.on('error', reject);
      });
    }
  })();

  convertingAlphaJobs.set(fileId, job);
  return job;
}

// Status endpoint para o player saber se o vídeo alpha já está otimizado
app.get('/api/stream/alpha-status', async (req, res) => {
  if (req.query.drive) {
    const fileId = String(req.query.drive);
    const cachePath = path.join(ALPHA_CACHE_DIR, `${fileId}.webm`);
    if (fs.existsSync(cachePath) && fs.statSync(cachePath).size > 0) {
      return res.json({ ready: true, converting: false, isAlpha: true });
    }

    const found = storage.findVideoByDriveId(fileId);
    if (!found) return res.status(404).json({ error: 'Vídeo não encontrado' });

    if (!found.video || !found.video.isAlpha) {
      return res.json({ ready: true, converting: false, isAlpha: false });
    }

    const isConverting = convertingAlphaJobs.has(fileId);
    if (!isConverting) {
      ensureAlphaWebm(fileId, found.video, found.userDb).catch(err => {
        console.error('Erro na conversão alpha em segundo plano:', err.message);
      });
    }

    return res.json({ ready: false, converting: true, isAlpha: true });
  }

  if (req.query.path) {
    let resolvedFilePath = null;
    try {
      resolvedFilePath = path.resolve(decodeURIComponent(req.query.path));
    } catch (e) {
      resolvedFilePath = path.resolve(req.query.path);
    }
    if (!fs.existsSync(resolvedFilePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    const crypto = require('crypto');
    const fileHash = crypto.createHash('md5').update(resolvedFilePath).digest('hex');
    const cachePath = path.join(ALPHA_CACHE_DIR, `local_${fileHash}.webm`);
    if (fs.existsSync(cachePath) && fs.statSync(cachePath).size > 0) {
      return res.json({ ready: true, converting: false, isAlpha: true });
    }
    const hasAlpha = await probeVideoAlpha(resolvedFilePath);
    if (!hasAlpha) {
      return res.json({ ready: true, converting: false, isAlpha: false });
    }
    return res.json({ ready: false, converting: true, isAlpha: true });
  }

  return res.json({ ready: true, converting: false, isAlpha: false });
});

// Status endpoint para o player saber se o vídeo (ProRes / codecs não-nativos) precisa de transcode ou já está pronto
app.get('/api/stream/video-status', async (req, res) => {
  if (req.query.drive) {
    const fileId = String(req.query.drive);
    const webCachePath = path.join(WEB_VIDEO_CACHE_DIR, `${fileId}.mp4`);
    if (fs.existsSync(webCachePath) && fs.statSync(webCachePath).size > 0) {
      return res.json({ ready: true, converting: false, needsTranscode: true });
    }

    const found = storage.findVideoByDriveId(fileId);
    if (!found) return res.status(404).json({ error: 'Vídeo não encontrado' });

    const fileName = (found.video?.fileName || '').toLowerCase();
    const mime = (found.video?.mimeType || '').toLowerCase();
    const isLikelyProres = fileName.endsWith('.mov') || mime.includes('quicktime');

    if (!isLikelyProres) {
      return res.json({ ready: true, converting: false, needsTranscode: false });
    }

    const isConverting = convertingWebJobs.has(fileId);
    if (!isConverting) {
      ensureDriveWebCompatibleVideo(fileId, found.video, found.userDb).catch(err => {
        console.error('Erro na conversão web em segundo plano:', err.message);
      });
    }

    return res.json({ ready: false, converting: true, needsTranscode: true });
  }

  if (req.query.path) {
    let resolvedFilePath = null;
    try {
      resolvedFilePath = path.resolve(decodeURIComponent(req.query.path));
    } catch (e) {
      resolvedFilePath = path.resolve(req.query.path);
    }
    if (!fs.existsSync(resolvedFilePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    const stat = fs.statSync(resolvedFilePath);
    const crypto = require('crypto');
    const fileKey = crypto.createHash('md5').update(`${resolvedFilePath}_${stat.size}_${stat.mtimeMs}`).digest('hex');
    const webCachePath = path.join(WEB_VIDEO_CACHE_DIR, `local_${fileKey}.mp4`);
    if (fs.existsSync(webCachePath) && fs.statSync(webCachePath).size > 0) {
      return res.json({ ready: true, converting: false, needsTranscode: true });
    }

    const probe = await probeVideoNeedsWebTranscode(resolvedFilePath);
    if (!probe.needsTranscode) {
      return res.json({ ready: true, converting: false, needsTranscode: false });
    }

    const isConverting = convertingWebJobs.has(fileKey);
    if (!isConverting) {
      ensureLocalWebCompatibleVideo(resolvedFilePath).catch(err => {
        console.error('Erro na conversão web local em segundo plano:', err.message);
      });
    }

    return res.json({ ready: false, converting: true, needsTranscode: true });
  }

  return res.json({ ready: true, converting: false, needsTranscode: false });
});

// Pré-visualização renderizada de alta resolução para .psd, .ai, .pdf e imagens
app.get('/api/stream/preview', async (req, res) => {
  const fileId = req.query.drive ? String(req.query.drive).trim() : '';
  if (!fileId) return res.status(400).send('ID do arquivo ausente');

  const found = storage.findVideoByDriveId(fileId);
  if (!found) {
    return res.status(403).send('Acesso não autorizado');
  }

  const { video, project, userDb, userId } = found;
  if (project && !isProjectAccessAuthorized(req, project, userId, userDb)) {
    return res.status(401).send('Acesso bloqueado: senha do diretório necessária');
  }

  const requestedSize = parseInt(req.query.size, 10);
  const sizeBucket = [400, 600, 1024, 1600, 2048].find(b => b >= requestedSize) || (requestedSize > 2048 ? 2048 : 600);

  // 1. Verifica cache em disco
  const cacheBase = path.join(PREVIEW_CACHE_DIR, `${fileId}_s${sizeBucket}`);
  const cacheJpg = `${cacheBase}.jpg`;
  const cachePng = `${cacheBase}.png`;

  if (fs.existsSync(cacheJpg) && fs.statSync(cacheJpg).size > 0) {
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    return fs.createReadStream(cacheJpg).pipe(res);
  }
  if (fs.existsSync(cachePng) && fs.statSync(cachePng).size > 0) {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    return fs.createReadStream(cachePng).pipe(res);
  }

  try {
    const token = await google.getDriveAccessToken(() => userDb);
    // Busca metadados do Drive (thumbnailLink)
    const metaUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?supportsAllDrives=true&fields=id,name,mimeType,hasThumbnail,thumbnailLink`;
    const meta = await new Promise((resolve, reject) => {
      https.get(metaUrl, { headers: { Authorization: `Bearer ${token}` } }, (mres) => {
        let b = '';
        mres.on('data', c => b += c);
        mres.on('end', () => {
          try { resolve(JSON.parse(b)); } catch (e) { reject(e); }
        });
      }).on('error', reject);
    });

    if (meta && meta.hasThumbnail && meta.thumbnailLink) {
      // Ajusta tamanho da miniatura do Google Drive (ex: =s220 para =s1600 ou =s600)
      const thumbUrl = meta.thumbnailLink.replace(/=s\d+$/, `=s${sizeBucket}`);
      return https.get(thumbUrl, { headers: { Authorization: `Bearer ${token}` } }, (tres) => {
        if (tres.statusCode === 200) {
          const ctype = tres.headers['content-type'] || 'image/jpeg';
          const ext = ctype.includes('png') ? '.png' : '.jpg';
          const targetCachePath = `${cacheBase}${ext}`;
          const tempPath = `${targetCachePath}.tmp.${Date.now()}`;
          const writeStream = fs.createWriteStream(tempPath);

          res.setHeader('Content-Type', ctype);
          res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');

          tres.on('data', chunk => {
            writeStream.write(chunk);
            res.write(chunk);
          });
          tres.on('end', () => {
            writeStream.end(() => {
              fs.rename(tempPath, targetCachePath, () => {});
            });
            res.end();
          });
          tres.on('error', (err) => {
            writeStream.destroy();
            try { fs.unlinkSync(tempPath); } catch (e) {}
            if (!res.headersSent) res.status(502).end();
            else res.destroy();
          });
          return;
        }

        // Fallback: se tamanho customizado não retornou 200, serve via streamFile
        return driveApi.streamFile(req, res, userDb, fileId, { download: false, fileName: (video && video.fileName) || 'preview.jpg' });
      }).on('error', (err) => {
        console.error('Erro ao buscar thumbnail do Drive:', err.message);
        return driveApi.streamFile(req, res, userDb, fileId, { download: false, fileName: (video && video.fileName) || 'preview.jpg' });
      });
    }

    // Fallback: se sips estiver disponível no macOS e o arquivo for PSD ou PDF
    if (process.platform === 'darwin' && /\.(psd|pdf)$/i.test((video && video.fileName) || '')) {
      const scratchDir = path.join(__dirname, 'scratch');
      try { fs.mkdirSync(scratchDir, { recursive: true }); } catch (e) {}
      const tempInput = path.join(scratchDir, `temp_conv_${fileId}_${Date.now()}`);
      const tempOutput = `${cacheBase}.jpg`;

      // Download original from Drive
      const fileStream = await driveApi.getFileStream(() => userDb, fileId);
      const ws = fs.createWriteStream(tempInput);
      await new Promise((resolve, reject) => {
        fileStream.pipe(ws);
        ws.on('finish', resolve);
        ws.on('error', reject);
      });

      // Executa sips
      await new Promise((resolve, reject) => {
        const proc = spawn('sips', ['-s', 'format', 'jpeg', '--resampleHeightWidthMax', String(sizeBucket), tempInput, '--out', tempOutput]);
        proc.on('close', code => code === 0 ? resolve() : reject(new Error('sips failed with code ' + code)));
        proc.on('error', reject);
      });

      try { fs.unlinkSync(tempInput); } catch (e) {}

      if (fs.existsSync(tempOutput) && fs.statSync(tempOutput).size > 0) {
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
        return fs.createReadStream(tempOutput).pipe(res);
      }
    }

    // Fallback final: Stream original
    return driveApi.streamFile(req, res, userDb, fileId, { download: false, fileName: (video && video.fileName) || 'preview.jpg' });
  } catch (err) {
    console.error('Erro na rota /api/stream/preview:', err.message);
    if (!res.headersSent) res.status(500).send('Erro ao gerar pré-visualização');
    else res.destroy();
  }
});

// Multi-Cloud Streaming Proxy (Dropbox, OneDrive, Box, iCloud)
app.get('/api/stream/cloud', async (req, res) => {
  try {
    const { provider, fileId, url, proj } = req.query;
    const isDownload = req.query.download === '1';

    let foundProject = null;
    let userDb = null;

    if (proj) {
      const found = storage.findUserByProjectId(proj);
      if (found) {
        foundProject = found.project;
        userDb = found.userDb;
        if (!isProjectAccessAuthorized(req, foundProject, found.userId, userDb)) {
          return res.status(401).send('Acesso bloqueado: senha do diretório necessária');
        }
      }
    }

    if (!userDb && req.user && req.user.id) {
      userDb = storage.getUserDb(req.user.id);
    }

    let targetFile = null;
    if (foundProject && Array.isArray(foundProject.videos)) {
      targetFile = foundProject.videos.find(v => v.id === fileId || v.cloudFileId === fileId);
    }

    if (!targetFile) {
      targetFile = {
        cloudProvider: provider || 'dropbox',
        cloudFileId: fileId,
        directDownloadUrl: url || null,
        fileName: req.query.name || 'arquivo'
      };
    }

    return await cloudStorage.streamCloudFile(req, res, userDb, foundProject, targetFile, { download: isDownload });
  } catch (err) {
    console.error('Erro ao transmitir arquivo em nuvem:', err);
    if (!res.headersSent) res.status(502).send('Erro na transmissão do arquivo em nuvem');
    else res.destroy();
  }
});

app.get('/api/stream', async (req, res) => {
  // Vídeos espelhados pela API do Drive
  if (req.query.drive) {
    const fileId = String(req.query.drive);
    const found = storage.findVideoByDriveId(fileId);
    if (!found) {
      return res.status(403).send('Acesso não autorizado');
    }

    const { video, project, userDb, userId } = found;
    if (project && !isProjectAccessAuthorized(req, project, userId, userDb)) {
      return res.status(401).send('Acesso bloqueado: senha do diretório necessária');
    }
    const isDownload = req.query.download === '1';

    // Se o vídeo é alpha e NÃO é download, serve a versão WebM transparente nativa
    if (video && video.isAlpha && !isDownload) {
      const cachePath = path.join(ALPHA_CACHE_DIR, `${fileId}.webm`);
      if (fs.existsSync(cachePath) && fs.statSync(cachePath).size > 0) {
        return streamLocalRangeFile(req, res, cachePath, 'video/webm');
      }

      // Se ainda não está pronto, aguarda a geração e serve
      try {
        const result = await ensureAlphaWebm(fileId, video, userDb);
        if (result && fs.existsSync(cachePath) && fs.statSync(cachePath).size > 0) {
          return streamLocalRangeFile(req, res, cachePath, 'video/webm');
        }
      } catch (err) {
        console.error('Falha ao processar vídeo alpha, usando stream original:', err.message);
      }
    }

    // Se NÃO é download, verifica se há versão transcodificada compatível (ProRes / DNxHD)
    if (!isDownload) {
      const webCachePath = path.join(WEB_VIDEO_CACHE_DIR, `${fileId}.mp4`);
      if (fs.existsSync(webCachePath) && fs.statSync(webCachePath).size > 0) {
        return streamLocalRangeFile(req, res, webCachePath, 'video/mp4');
      }

      const fileName = (video?.fileName || '').toLowerCase();
      const mime = (video?.mimeType || '').toLowerCase();
      const isLikelyProres = fileName.endsWith('.mov') || mime.includes('quicktime');

      if (isLikelyProres) {
        try {
          const readyWebPath = await ensureDriveWebCompatibleVideo(fileId, video, userDb);
          if (readyWebPath && fs.existsSync(readyWebPath) && fs.statSync(readyWebPath).size > 0) {
            return streamLocalRangeFile(req, res, readyWebPath, 'video/mp4');
          }
        } catch (err) {
          console.error('Falha ao converter ProRes drive:', err.message);
        }
      }
    }

    let defaultExt = '.mp4';
    if (video) {
      if (video.type === 'audio' || (video.mimeType && video.mimeType.startsWith('audio/'))) {
        defaultExt = video.extension ? `.${video.extension.toLowerCase().replace('.', '')}` : '.mp3';
      } else if (video.mimeType === 'video/quicktime' || (video.fileName && video.fileName.toLowerCase().endsWith('.mov'))) {
        defaultExt = '.mov';
      }
    }
    const streamFileName = (video && video.fileName) || `${(video && video.title) || 'arquivo'}${defaultExt}`;

    return driveApi.streamFile(req, res, userDb, fileId, {
      download: isDownload,
      fileName: streamFileName,
      mimeType: video ? video.mimeType : null
    }).catch((err) => {
      console.error('Erro no stream do drive:', err.message);
      if (!res.headersSent) res.status(500).end();
      else res.destroy();
    });
  }

  const target = req.query.path || req.query.url;
  if (!target) return res.status(400).send('Caminho ou URL do vídeo ausente');

  let resolvedFilePath = null;
  if (target.startsWith('/assets/')) {
    resolvedFilePath = path.join(__dirname, 'public', target);
  } else {
    try {
      resolvedFilePath = path.resolve(decodeURIComponent(target));
    } catch (e) {
      resolvedFilePath = path.resolve(target);
    }
  }

  // Security Check: somente vídeos cadastrados em projetos (ou assets públicos) podem ser transmitidos
  const isUnder = (file, root) => file === root || file.startsWith(root + path.sep);
  const registered = new Set();
  (readDB().projects || []).forEach(p => (p.videos || []).forEach(v => {
    if (v.localPath) registered.add(path.resolve(v.localPath));
    if (typeof v.url === 'string' && v.url.startsWith('/api/stream?')) {
      try {
        const q = new URL(v.url, 'http://localhost').searchParams.get('path');
        if (q) registered.add(path.resolve(q));
      } catch (e) {}
    }
  }));

  const isAllowed = isUnder(resolvedFilePath, path.join(__dirname, 'public', 'assets')) ||
    registered.has(resolvedFilePath);
  if (!isAllowed) {
    return res.status(403).send('Acesso não autorizado');
  }

  if (!fs.existsSync(resolvedFilePath)) {
    return res.status(404).send('Arquivo de vídeo não encontrado');
  }

  const isDownload = req.query.download === '1';
  const isAlphaReq = req.query.alpha === '1';

  if (isAlphaReq && !isDownload) {
    const crypto = require('crypto');
    const fileHash = crypto.createHash('md5').update(resolvedFilePath).digest('hex');
    const cachePath = path.join(ALPHA_CACHE_DIR, `local_${fileHash}.webm`);
    if (fs.existsSync(cachePath) && fs.statSync(cachePath).size > 0) {
      return streamLocalRangeFile(req, res, cachePath, 'video/webm');
    }
    try {
      const hasAlpha = await probeVideoAlpha(resolvedFilePath);
      if (hasAlpha) {
        let ffmpegPath = 'ffmpeg';
        try { ffmpegPath = require('ffmpeg-static') || 'ffmpeg'; } catch (e) {}
        const tempTarget = path.join(uploadTempDir, `local_alpha_${fileHash}_${Date.now()}.webm`);
        await new Promise((resolve, reject) => {
          const proc = spawn(ffmpegPath, [
            '-y', '-i', resolvedFilePath,
            '-map', '0:v:0', '-map', '0:a?',
            '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p',
            '-speed', '4', '-deadline', 'realtime', '-b:v', '3M',
            '-auto-alt-ref', '0', '-c:a', 'libopus', '-b:a', '128k',
            tempTarget
          ]);
          let errStr = '';
          proc.stderr.on('data', d => errStr += d.toString());
          proc.on('close', code => {
            if (code === 0 && fs.existsSync(tempTarget)) resolve();
            else reject(new Error(errStr.slice(-200)));
          });
          proc.on('error', reject);
        });
        fs.renameSync(tempTarget, cachePath);
        return streamLocalRangeFile(req, res, cachePath, 'video/webm');
      }
    } catch (e) {
      console.error('Erro na conversão local alpha:', e.message);
    }
  }

  // Se NÃO é download, verifica se o vídeo local precisa de versão web
  if (!isDownload) {
    try {
      const stat = fs.statSync(resolvedFilePath);
      const crypto = require('crypto');
      const fileKey = crypto.createHash('md5').update(`${resolvedFilePath}_${stat.size}_${stat.mtimeMs}`).digest('hex');
      const webCachePath = path.join(WEB_VIDEO_CACHE_DIR, `local_${fileKey}.mp4`);
      if (fs.existsSync(webCachePath) && fs.statSync(webCachePath).size > 0) {
        return streamLocalRangeFile(req, res, webCachePath, 'video/mp4');
      }

      const webPath = await ensureLocalWebCompatibleVideo(resolvedFilePath);
      if (webPath && fs.existsSync(webPath) && fs.statSync(webPath).size > 0) {
        return streamLocalRangeFile(req, res, webPath, 'video/mp4');
      }
    } catch (e) {
      console.error('Erro na conversão web local:', e.message);
    }
  }

  return streamLocalRangeFile(req, res, resolvedFilePath, null, null, isDownload);
});

// 15. Save Settings
app.post('/api/settings', requireAuthor, (req, res) => {
  const userDb = storage.getUserDb(req.user.id);
  if (!userDb) {
    return res.status(500).json({ error: 'Banco de dados do usuário não encontrado' });
  }
  userDb.settings = userDb.settings || {};
  userDb.user = userDb.user || {};
  const allowed = [
    'baseDomain',
    'authorName',
    'authorAvatar',
    'appName',
    'theme',
    'showFileExtensions',
    'autoDeleteResolvedNotifications',
    'autoDeleteResolvedDays',
    'archiveCollapsed',
    'defaultViewMode',
    'videoCoverMode',
    'defaultColor'
  ];
  const updates = {};
  allowed.forEach(key => {
    if (typeof req.body[key] === 'string') updates[key] = req.body[key].trim();
    if (typeof req.body[key] === 'boolean') updates[key] = req.body[key];
    if (typeof req.body[key] === 'number' && !Number.isNaN(req.body[key])) updates[key] = req.body[key];
  });
  if (Array.isArray(req.body.collapsedYears)) {
    updates.collapsedYears = req.body.collapsedYears.map(y => String(y).trim()).filter(Boolean);
  }
  if (Array.isArray(req.body.collapsedCategories)) {
    updates.collapsedCategories = req.body.collapsedCategories.map(c => String(c).trim()).filter(Boolean);
  }
  if (Array.isArray(req.body.collapsedDivisions)) {
    updates.collapsedDivisions = req.body.collapsedDivisions.map(d => String(d).trim()).filter(Boolean);
  }
  if (req.body.projectViewModes && typeof req.body.projectViewModes === 'object' && !Array.isArray(req.body.projectViewModes)) {
    const cleanModes = { ...(userDb.settings && userDb.settings.projectViewModes ? userDb.settings.projectViewModes : {}) };
    for (const [pId, mode] of Object.entries(req.body.projectViewModes)) {
      if (typeof pId === 'string' && (mode === 'columns' || mode === 'grid')) {
        cleanModes[pId] = mode;
      }
    }
    updates.projectViewModes = cleanModes;
  }
  if (updates.autoDeleteResolvedDays !== undefined) {
    const parsedDays = parseInt(updates.autoDeleteResolvedDays, 10);
    updates.autoDeleteResolvedDays = Number.isNaN(parsedDays) ? 7 : Math.max(1, Math.min(365, parsedDays));
  }

  if (updates.authorName) {
    userDb.settings.authorName = updates.authorName;
    userDb.settings.authorNameCustomized = true;
    userDb.user.name = updates.authorName;
    if (req.user) {
      req.user.name = updates.authorName;
    }
    if (auth && typeof auth.updateUserSession === 'function') {
      auth.updateUserSession(req, res, { name: updates.authorName });
    }
  }

  userDb.settings = { ...(userDb.settings || {}), ...updates };
  storage.saveUserDb(req.user.id, userDb);
  res.json(userDb.settings);
});

function sendHtmlWithTitle(reqOrRes, resOrTitle, pageTitle, hideBrand = true, authorName = 'Giffú', authorColor = '#FF5400', ogImageUrl = null) {
  let req, res;
  if (reqOrRes && reqOrRes.get && reqOrRes.headers) {
    req = reqOrRes;
    res = resOrTitle;
  } else {
    req = null;
    res = reqOrRes;
    pageTitle = resOrTitle;
  }

  try {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf-8');
    const safeTitle = (pageTitle || (hideBrand ? 'Cloud' : `${authorName} Cloud`))
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    html = html.replace(/<title>.*?<\/title>/i, `<title>${safeTitle}</title>`);
    html = html.replace(/<meta property="og:title" content=".*?">/i, `<meta property="og:title" content="${safeTitle}">`);
    html = html.replace(/<meta name="twitter:title" content=".*?">/i, `<meta name="twitter:title" content="${safeTitle}">`);

    const siteName = hideBrand ? 'Cloud' : `${authorName} Cloud`;
    html = html.replace(/<meta property="og:site_name" content=".*?">/i, `<meta property="og:site_name" content="${siteName}">`);

    // Injeta imagem absoluta para WhatsApp, Telegram e redes sociais
    const origin = getRequestOrigin(req, null);
    const finalOgImageUrl = ogImageUrl || `${origin}/assets/icon-512.png`;
    const imageType = finalOgImageUrl.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    html = html.replace(/<meta property="og:image" content=".*?">/i, `<meta property="og:image" content="${finalOgImageUrl}">`);
    html = html.replace(/<meta property="og:image:secure_url" content=".*?">/i, `<meta property="og:image:secure_url" content="${finalOgImageUrl}">`);
    html = html.replace(/<meta property="og:image:type" content=".*?">/i, `<meta property="og:image:type" content="${imageType}">`);
    html = html.replace(/<meta name="twitter:image" content=".*?">/i, `<meta name="twitter:image" content="${finalOgImageUrl}">`);
    html = html.replace(/<meta name="twitter:card" content=".*?">/i, `<meta name="twitter:card" content="summary_large_image">`);

    // Injeta estilo CSS e variável com a cor padrão da conta de autor (evita flicker na abertura do link de cliente)
    let hex = (authorColor && typeof authorColor === 'string' && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(authorColor.trim()))
      ? authorColor.trim()
      : '#FF5400';

    const r = parseInt(hex.length === 4 ? hex[1] + hex[1] : hex.slice(1, 3), 16);
    const g = parseInt(hex.length === 4 ? hex[2] + hex[2] : hex.slice(3, 5), 16);
    const b = parseInt(hex.length === 4 ? hex[3] + hex[3] : hex.slice(5, 7), 16);

    const subtle = `rgba(${r}, ${g}, ${b}, 0.12)`;
    const glow = `rgba(${r}, ${g}, ${b}, 0.28)`;
    const hoverR = Math.min(255, Math.max(0, Math.round(r * 1.12)));
    const hoverG = Math.min(255, Math.max(0, Math.round(g * 1.12)));
    const hoverB = Math.min(255, Math.max(0, Math.round(b * 1.12)));
    const hover = `#${hoverR.toString(16).padStart(2, '0')}${hoverG.toString(16).padStart(2, '0')}${hoverB.toString(16).padStart(2, '0')}`;

    const themeOverrideTag = `<style id="server-theme-override">:root { --brand-orange: ${hex} !important; --brand-orange-hover: ${hover} !important; --brand-orange-subtle: ${subtle} !important; --brand-orange-glow: ${glow} !important; }</style><script>window.__SERVER_DEFAULT_COLOR__ = "${hex}";</script>`;
    html = html.replace('</head>', `${themeOverrideTag}\n</head>`);

    // Em rotas do cliente, já envia o badge como Cloud para evitar flicker inicial
    const brandLogoSvg = '<svg class="brand-badge-logo" viewBox="0 0 1585.74 1030.98" width="22" height="15" fill="currentColor" aria-hidden="true"><path fill="currentColor" d="M86.51,508.26c-.28.3-.55.61-.82.91-1.87-.33-3.73-.63-5.61-.91h6.43Z"/><path fill="currentColor" d="M86.51,508.26c-.28.3-.55.61-.82.91-1.87-.33-3.73-.63-5.61-.91h6.43Z"/><g><path fill="currentColor" d="M331.2,1024.8c-26.64-5.22-52.18-13.64-76.22-24.84C106.1,944.84,0,801.6,0,633.58c0-195.39,143.43-357.25,330.76-386.04-22.01,27.86-34.3,62.6-34.3,99.73v577.31c0,29.93,8.07,58.96,23.33,83.94,3.46,5.66,7.27,11.1,11.41,16.28Z"/><path fill="currentColor" d="M1585.74,693.33c0,122.09-69.26,228.03-170.62,280.62-53.46,36.06-117.43,57.03-186.14,57.03h-636.4l444.28-272.6c49.44-30.34,78.18-83.07,76.87-141.06-1.31-58-32.4-109.38-83.16-137.46l-494.84-273.69c-12.02-6.65-24.56-11.66-37.37-15.05C589.85,74.73,731.91,0,891.42,0c240.88,0,441.95,170.45,489.19,397.33,119.84,44.92,205.13,160.48,205.13,296Z"/></g><g><path fill="currentColor" d="M955.63,698.49l-434.14,266.38c-.14.09-.28.17-.42.25-27.71,16.8-61.1,17.39-89.41,1.54-28.45-15.92-45.44-44.9-45.44-77.5v-506.49c0-31.77,16.34-60.37,43.7-76.51,10.63-6.26,22.1-10.17,33.79-11.69,4.21.59,8.39,1.25,12.55,1.98.52-.89,1.04-1.79,1.57-2.68,13.79.45,27.53,4.17,40.2,11.18l13.91,7.69,420.23,232.42c27.96,15.46,45.09,43.77,45.81,75.71.72,31.94-15.11,60.99-42.34,77.71Z"/><path fill="currentColor" d="M477.83,293.78c-.53.89-1.05,1.78-1.57,2.68-4.16-.74-8.33-1.4-12.55-1.98,3.75-.49,7.53-.74,11.3-.74.94,0,1.88.02,2.82.04Z"/></g></svg>';
    const brandBadgeHtml = hideBrand 
      ? `<div class="brand-badge client-brand-badge">${brandLogoSvg}<span>Cloud</span></div>`
      : `<div class="brand-badge client-brand-badge">${brandLogoSvg}<span class="brand-author-name">${authorName}</span><span class="app-subtitle">Cloud</span></div>`;
    html = html.replace(/<div class="brand-badge desktop-brand-badge" id="btnHeaderLobby">[\s\S]*?<\/div>/i, brandBadgeHtml);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
}

// Routing for front-end
app.get('/entrega/:slug', (req, res) => {
  const codeOrSlug = req.params.slug;
  const resolved = storage.resolveShortLink(codeOrSlug);
  if (resolved) {
    const { project, userDb, type, folderId, videoId } = resolved;
    const authorName = (userDb && userDb.settings && userDb.settings.authorName) || (userDb && userDb.user && userDb.user.name) || 'Giffú';
    const authorColor = (userDb && userDb.settings && userDb.settings.defaultColor) || '#FF5400';
    let hideBrand = project ? (project.hideBrandName !== false) : true;
    let title = project.name || (hideBrand ? 'Cloud' : `${authorName} Cloud`);
    let ogImageUrl = null;
    if (type === 'file' && videoId) {
      const vid = (project.videos || []).find(v => v.id === videoId || v.driveFileId === videoId || v.shortCode === codeOrSlug);
      if (vid && vid.hideBrandName !== undefined) {
        hideBrand = vid.hideBrandName !== false;
      }
      if (vid) {
        title = vid.title || project.name;
        ogImageUrl = getOgImageUrl(req, userDb, { code: codeOrSlug, drive: vid.driveFileId, video: vid.id });
      }
    } else if (type === 'folder' && folderId) {
      const f = (project.folders || []).find(fol => fol.id === folderId || fol.shortCode === codeOrSlug);
      if (f && f.hideBrandName !== undefined) {
        hideBrand = f.hideBrandName !== false;
      }
      if (f) title = f.name || project.name;
      ogImageUrl = getOgImageUrl(req, userDb, { code: codeOrSlug });
    } else {
      ogImageUrl = getOgImageUrl(req, userDb, { code: codeOrSlug, proj: project.slug || project.id });
    }
    return sendHtmlWithTitle(req, res, title, hideBrand, authorName, authorColor, ogImageUrl);
  }

  const found = storage.findProjectBySlug(codeOrSlug);
  const proj = found ? found.project : null;
  const userDb = found ? storage.getUserDb(found.userId) : null;
  const authorName = (userDb && userDb.settings && userDb.settings.authorName) || (userDb && userDb.user && userDb.user.name) || 'Giffú';
  const authorColor = (userDb && userDb.settings && userDb.settings.defaultColor) || '#FF5400';
  const hideBrand = proj ? (proj.hideBrandName !== false) : true;
  const defaultTitle = hideBrand ? 'Cloud' : `${authorName} Cloud`;
  const title = proj ? proj.name : defaultTitle;
  const ogImageUrl = proj ? getOgImageUrl(req, userDb, { proj: proj.slug || proj.id }) : null;
  sendHtmlWithTitle(req, res, title, hideBrand, authorName, authorColor, ogImageUrl);
});

// Rota para shortlinks diretos ou slugs (ex: /59j640 ou /39ak804 ou /j3j643508j)
app.get('/:code', (req, res, next) => {
  const rawCode = (req.params.code || '').trim();
  const code = rawCode.toLowerCase();
  if (!code || code.includes('.')) {
    return next();
  }
  if (storage.RESERVED_WORDS && storage.RESERVED_WORDS.has(code)) {
    return next();
  }
  const resolved = storage.resolveShortLink(rawCode);
  if (resolved) {
    const { project, userDb, type, folderId, videoId } = resolved;
    const authorName = (userDb && userDb.settings && userDb.settings.authorName) || (userDb && userDb.user && userDb.user.name) || 'Giffú';
    const authorColor = (userDb && userDb.settings && userDb.settings.defaultColor) || '#FF5400';
    let hideBrand = project ? (project.hideBrandName !== false) : true;
    let title = project.name || (hideBrand ? 'Cloud' : `${authorName} Cloud`);
    let ogImageUrl = null;

    if (type === 'file' && videoId) {
      const vid = (project.videos || []).find(v => v.id === videoId || v.driveFileId === videoId || v.shortCode === code);
      if (vid && vid.hideBrandName !== undefined) {
        hideBrand = vid.hideBrandName !== false;
      }
      if (vid) {
        title = vid.title || project.name;
        ogImageUrl = getOgImageUrl(req, userDb, { code: rawCode, drive: vid.driveFileId, video: vid.id });
      }
    } else if (type === 'folder' && folderId) {
      const f = (project.folders || []).find(fol => fol.id === folderId || fol.shortCode === code);
      if (f && f.hideBrandName !== undefined) {
        hideBrand = f.hideBrandName !== false;
      }
      if (f) title = f.name || project.name;
      ogImageUrl = getOgImageUrl(req, userDb, { code: rawCode });
    } else {
      ogImageUrl = getOgImageUrl(req, userDb, { code: rawCode, proj: project.slug || project.id });
    }
    return sendHtmlWithTitle(req, res, title, hideBrand, authorName, authorColor, ogImageUrl);
  }
  next();
});

app.get('/entrega/:slug/:videoId', (req, res) => {
  const found = storage.findProjectBySlug(req.params.slug);
  const proj = found ? found.project : null;
  const userDb = found ? storage.getUserDb(found.userId) : null;
  const authorName = (userDb && userDb.settings && userDb.settings.authorName) || (userDb && userDb.user && userDb.user.name) || 'Giffú';
  const authorColor = (userDb && userDb.settings && userDb.settings.defaultColor) || '#FF5400';
  const video = proj && (proj.videos || []).find(v => v.id === req.params.videoId);
  let hideBrand = proj ? (proj.hideBrandName !== false) : true;
  if (video && video.hideBrandName !== undefined) {
    hideBrand = video.hideBrandName !== false;
  }
  const defaultTitle = hideBrand ? 'Cloud' : `${authorName} Cloud`;
  const title = video ? video.title : (proj ? proj.name : defaultTitle);
  const ogImageUrl = video
    ? getOgImageUrl(req, userDb, { drive: video.driveFileId, video: video.id, proj: proj ? (proj.slug || proj.id) : '' })
    : (proj ? getOgImageUrl(req, userDb, { proj: proj.slug || proj.id }) : null);
  sendHtmlWithTitle(req, res, title, hideBrand, authorName, authorColor, ogImageUrl);
});

app.get('/:year/:slug', (req, res, next) => {
  if (/^\d{4}$/.test(req.params.year)) {
    const found = storage.findProjectBySlug(req.params.slug);
    const proj = found ? found.project : null;
    const userDb = found ? storage.getUserDb(found.userId) : null;
    const authorName = (userDb && userDb.settings && userDb.settings.authorName) || (userDb && userDb.user && userDb.user.name) || 'Giffú';
    const authorColor = (userDb && userDb.settings && userDb.settings.defaultColor) || '#FF5400';
    const hideBrand = proj ? (proj.hideBrandName !== false) : true;
    const defaultTitle = hideBrand ? 'Cloud' : `${authorName} Cloud`;
    const title = proj ? proj.name : defaultTitle;
    const ogImageUrl = proj ? getOgImageUrl(req, userDb, { proj: proj.slug || proj.id }) : null;
    return sendHtmlWithTitle(req, res, title, hideBrand, authorName, authorColor, ogImageUrl);
  }
  next();
});

app.get('/:year/:slug/:videoId', (req, res, next) => {
  if (/^\d{4}$/.test(req.params.year)) {
    const found = storage.findProjectBySlug(req.params.slug);
    const proj = found ? found.project : null;
    const userDb = found ? storage.getUserDb(found.userId) : null;
    const authorName = (userDb && userDb.settings && userDb.settings.authorName) || (userDb && userDb.user && userDb.user.name) || 'Giffú';
    const authorColor = (userDb && userDb.settings && userDb.settings.defaultColor) || '#FF5400';
    const video = proj && (proj.videos || []).find(v => v.id === req.params.videoId);
    let hideBrand = proj ? (proj.hideBrandName !== false) : true;
    if (video && video.hideBrandName !== undefined) {
      hideBrand = video.hideBrandName !== false;
    }
    const defaultTitle = hideBrand ? 'Cloud' : `${authorName} Cloud`;
    const title = video ? video.title : (proj ? proj.name : defaultTitle);
    const ogImageUrl = video
      ? getOgImageUrl(req, userDb, { drive: video.driveFileId, video: video.id, proj: proj ? (proj.slug || proj.id) : '' })
      : (proj ? getOgImageUrl(req, userDb, { proj: proj.slug || proj.id }) : null);
    return sendHtmlWithTitle(req, res, title, hideBrand, authorName, authorColor, ogImageUrl);
  }
  next();
});

app.get(['/privacidade', '/privacy'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacidade.html'));
});

app.get(['/termos', '/terms'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'termos.html'));
});

app.get('/author', (req, res) => {
  if (req.user && req.user.isAuthor) {
    const userDb = storage.getUserDb(req.user.id);
    const authorColor = (userDb && userDb.settings && userDb.settings.defaultColor) || '#FF5400';
    const authorName = (userDb && userDb.settings && userDb.settings.authorName) || (userDb && userDb.user && userDb.user.name) || 'Giffú';
    return sendHtmlWithTitle(req, res, `${authorName} Cloud`, false, authorName, authorColor);
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/', (req, res) => {
  if (req.user && req.user.isAuthor) {
    const userDb = storage.getUserDb(req.user.id);
    const authorColor = (userDb && userDb.settings && userDb.settings.defaultColor) || '#FF5400';
    const authorName = (userDb && userDb.settings && userDb.settings.authorName) || (userDb && userDb.user && userDb.user.name) || 'Giffú';
    return sendHtmlWithTitle(req, res, `${authorName} Cloud`, false, authorName, authorColor);
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function getLanIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const HOST = '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
  const lanIp = getLanIp();
  console.log(`\n======================================================`);
  console.log(`🚀 Giffú Cloud rodando:`);
  console.log(`💻 Local:        http://localhost:${PORT}`);
  console.log(`📱 Rede LAN:     http://${lanIp}:${PORT}`);
  console.log(`📁 Modo Autor:   http://${lanIp}:${PORT}/author`);
  console.log(`======================================================\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n⚠️  Porta ${PORT} já está em uso.`);
  } else {
    console.error('Erro no servidor:', err);
  }
});
