const fs = require('fs');
const path = require('path');
const https = require('https');
const google = require('./google');

const EXPORT_FOLDER_KEYWORDS = [
  '05-export', 'export', 'exports', 'final', 'entrega', 'video', 'videos',
  'foto', 'fotos', 'photo', 'photos', 'imagem', 'imagens', 'image', 'images'
];
const MAX_VIDEOS = 300;
const MAX_SUBFOLDERS = 30;
const ID_RE = /^[a-zA-Z0-9_-]{10,}$/;

function makeError(message, code, status) {
  const err = new Error(message);
  err.code = code;
  err.status = status;
  return err;
}

function extractFileId(input) {
  const raw = String(input || '').trim();
  const m = raw.match(/\/folders\/([a-zA-Z0-9_-]{10,})/) ||
            raw.match(/[?&]id=([a-zA-Z0-9_-]{10,})/) ||
            raw.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m) return m[1];
  if (/^[a-zA-Z0-9_-]{20,}$/.test(raw)) return raw;
  return null;
}

function translateApiError(res) {
  const apiErr = res.json && res.json.error;
  const reason = apiErr && apiErr.errors && apiErr.errors[0] && apiErr.errors[0].reason;
  if (reason === 'accessNotConfigured' || reason === 'SERVICE_DISABLED') {
    return makeError(
      'A API do Google Drive não está ativada no seu projeto do Google Cloud. Ative em "APIs e serviços → Biblioteca → Google Drive API".',
      'DRIVE_API_DISABLED', 502
    );
  }
  if (res.status === 404) {
    return makeError('Pasta não encontrada, ou sua conta Google não tem acesso a ela.', 'DRIVE_NOT_FOUND', 404);
  }
  if (res.status === 403) {
    return makeError('Sem permissão para acessar esta pasta com a conta conectada.', 'DRIVE_FORBIDDEN', 403);
  }
  if (res.status === 401) {
    return makeError('Sessão do Google Drive expirada. Faça login com Google novamente.', 'DRIVE_NOT_CONNECTED', 401);
  }
  return makeError('Erro ao consultar o Google Drive.', 'DRIVE_ERROR', 502);
}

async function driveGet(readDB, pathAndQuery) {
  const token = await google.getDriveAccessToken(readDB);
  const res = await google.request(`https://www.googleapis.com/drive/v3/${pathAndQuery}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.status !== 200 || !res.json) throw translateApiError(res);
  return res.json;
}

const FILE_FIELDS = 'id,name,mimeType,size,hasThumbnail,thumbnailLink,ownedByMe,owners(emailAddress,me),capabilities(canEdit,canAddChildren),videoMediaMetadata(width,height,durationMillis),imageMediaMetadata(width,height,rotation),shortcutDetails(targetId,targetMimeType)';

async function getItem(readDB, id) {
  if (!ID_RE.test(id)) throw makeError('Link do Google Drive inválido.', 'DRIVE_BAD_LINK', 400);
  let item = await driveGet(readDB, `files/${id}?supportsAllDrives=true&fields=${encodeURIComponent(FILE_FIELDS)}`);
  if (item.mimeType === 'application/vnd.google-apps.shortcut' && item.shortcutDetails) {
    item = await driveGet(
      readDB,
      `files/${item.shortcutDetails.targetId}?supportsAllDrives=true&fields=${encodeURIComponent(FILE_FIELDS)}`
    );
  }
  return item;
}

async function listChildren(readDB, folderId) {
  const files = [];
  let pageToken = '';
  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed=false`,
      fields: `nextPageToken,files(${FILE_FIELDS})`,
      pageSize: '1000',
      orderBy: 'name',
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true'
    });
    if (pageToken) params.set('pageToken', pageToken);
    const json = await driveGet(readDB, `files?${params.toString()}`);
    files.push(...(json.files || []));
    pageToken = json.nextPageToken || '';
  } while (pageToken && files.length < 5000);
  return files;
}

function formatDuration(ms) {
  const totalSecs = Math.floor((Number(ms) || 0) / 1000);
  if (totalSecs <= 0) return '00:00';
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  const pad = (n) => n.toString().padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function formatSize(bytes) {
  const b = Number(bytes) || 0;
  if (b >= 1073741824) return `${(b / 1073741824).toFixed(2)} GB`;
  if (b >= 1048576) return `${(b / 1048576).toFixed(1)} MB`;
  if (b >= 1024) return `${(b / 1024).toFixed(1)} KB`;
  if (b > 0) return `${b} B`;
  return '';
}

function calculateAspectRatio(width, height) {
  if (!width || !height || width <= 0 || height <= 0) return '16:9';
  const ratio = width / height;
  if (Math.abs(ratio - 1) < 0.05) return '1:1';
  if (Math.abs(ratio - 4/3) < 0.08) return '4:3';
  if (Math.abs(ratio - 3/4) < 0.08) return '3:4';
  if (Math.abs(ratio - 3/2) < 0.08) return '3:2';
  if (Math.abs(ratio - 2/3) < 0.08) return '2:3';
  if (Math.abs(ratio - 16/9) < 0.08) return '16:9';
  if (Math.abs(ratio - 9/16) < 0.08) return '9:16';
  return width < height ? '9:16' : '16:9';
}

function toVideo(file, classifyResolution) {
  const meta = file.videoMediaMetadata || {};
  const width = Number(meta.width) || 0;
  const height = Number(meta.height) || 0;
  const hasDims = width > 0 && height > 0;

  const fileName = String(file.name || 'video.mp4');
  const extMatch = fileName.match(/\.([^.]+)$/);
  const ext = (extMatch ? extMatch[1] : '').toLowerCase();
  let mimeType = file.mimeType;
  if (!mimeType || mimeType === 'application/octet-stream') {
    if (ext === 'mov') mimeType = 'video/quicktime';
    else if (ext === 'webm') mimeType = 'video/webm';
    else if (ext === 'mkv') mimeType = 'video/x-matroska';
    else mimeType = 'video/mp4';
  }
  const isAlpha = ext !== 'mp4' && /4444|alpha|transp|transparent/i.test(fileName);

  return {
    id: 'vid-' + file.id,
    type: 'video',
    title: fileName.replace(/\.[^.]+$/, '') || fileName,
    aspectRatio: hasDims ? calculateAspectRatio(width, height) : '16:9',
    url: `/api/stream?drive=${file.id}`,
    driveFileId: file.id,
    fileName,
    resolution: hasDims ? classifyResolution(width, height) : classifyResolution('FHD'),
    duration: formatDuration(meta.durationMillis),
    size: formatSize(file.size),
    mimeType,
    isAlpha
  };
}

function toImage(file, classifyResolution) {
  const meta = file.imageMediaMetadata || {};
  let width = Number(meta.width) || 0;
  let height = Number(meta.height) || 0;
  const rotation = Number(meta.rotation) || 0;
  if (rotation === 90 || rotation === 270) {
    const temp = width;
    width = height;
    height = temp;
  }
  const hasDims = width > 0 && height > 0;

  const aspectRatio = hasDims ? calculateAspectRatio(width, height) : '16:9';

  return {
    id: 'img-' + file.id,
    type: 'image',
    title: String(file.name || 'Foto').replace(/\.[^.]+$/, ''),
    aspectRatio,
    url: `/api/stream?drive=${file.id}`,
    previewUrl: `/api/stream?drive=${file.id}`,
    thumbnailUrl: `/api/stream?drive=${file.id}`,
    driveFileId: file.id,
    fileName: String(file.name || 'foto.jpg'),
    resolution: hasDims ? `${width}x${height}` : 'Foto',
    dimensions: hasDims ? `${width}x${height}` : '',
    size: formatSize(file.size),
    mimeType: file.mimeType || 'image/jpeg',
    hasThumbnail: Boolean(file.hasThumbnail),
    thumbnailLink: file.thumbnailLink || ''
  };
}

function toPsd(file) {
  const name = String(file.name || 'arte.psd');
  return {
    id: 'psd-' + file.id,
    type: 'image',
    subType: 'psd',
    extension: 'PSD',
    title: name.replace(/\.[^.]+$/, '') || name,
    aspectRatio: '16:9',
    url: `/api/stream?drive=${file.id}`,
    previewUrl: `/api/stream/preview?drive=${file.id}&size=2000`,
    thumbnailUrl: `/api/stream/preview?drive=${file.id}&size=600`,
    driveFileId: file.id,
    fileName: name,
    resolution: 'PSD',
    dimensions: '',
    size: formatSize(file.size),
    mimeType: file.mimeType || 'image/vnd.adobe.photoshop',
    hasThumbnail: Boolean(file.hasThumbnail),
    thumbnailLink: file.thumbnailLink || ''
  };
}

function toAi(file) {
  const name = String(file.name || 'vetor.ai');
  return {
    id: 'ai-' + file.id,
    type: 'image',
    subType: 'ai',
    extension: 'AI',
    title: name.replace(/\.[^.]+$/, '') || name,
    aspectRatio: '16:9',
    url: `/api/stream?drive=${file.id}`,
    previewUrl: `/api/stream/preview?drive=${file.id}&size=2000`,
    thumbnailUrl: `/api/stream/preview?drive=${file.id}&size=600`,
    driveFileId: file.id,
    fileName: name,
    resolution: 'AI',
    dimensions: '',
    size: formatSize(file.size),
    mimeType: file.mimeType || 'application/illustrator',
    hasThumbnail: Boolean(file.hasThumbnail),
    thumbnailLink: file.thumbnailLink || ''
  };
}

function toPdf(file) {
  const name = String(file.name || 'documento.pdf');
  return {
    id: 'pdf-' + file.id,
    type: 'pdf',
    subType: 'pdf',
    extension: 'PDF',
    title: name.replace(/\.[^.]+$/, '') || name,
    aspectRatio: '16:9',
    url: `/api/stream?drive=${file.id}`,
    previewUrl: `/api/stream/preview?drive=${file.id}&size=2000`,
    thumbnailUrl: `/api/stream/preview?drive=${file.id}&size=600`,
    driveFileId: file.id,
    fileName: name,
    resolution: 'PDF',
    dimensions: '',
    size: formatSize(file.size),
    mimeType: 'application/pdf',
    hasThumbnail: Boolean(file.hasThumbnail),
    thumbnailLink: file.thumbnailLink || ''
  };
}

function toAudio(file) {
  const meta = file.videoMediaMetadata || {};
  const fileName = String(file.name || 'audio.mp3');
  const extMatch = fileName.match(/\.([^.]+)$/);
  const ext = (extMatch ? extMatch[1] : 'mp3').toLowerCase();
  let mimeType = file.mimeType;
  if (!mimeType || mimeType === 'application/octet-stream') {
    if (ext === 'mp3') mimeType = 'audio/mpeg';
    else if (ext === 'wav') mimeType = 'audio/wav';
    else if (ext === 'aac') mimeType = 'audio/aac';
    else if (ext === 'flac') mimeType = 'audio/flac';
    else if (ext === 'ogg') mimeType = 'audio/ogg';
    else if (ext === 'm4a') mimeType = 'audio/mp4';
    else if (ext === 'aiff' || ext === 'aif') mimeType = 'audio/aiff';
    else mimeType = 'audio/mpeg';
  }

  const duration = meta.durationMillis ? formatDuration(meta.durationMillis) : '';

  return {
    id: 'aud-' + file.id,
    type: 'audio',
    title: fileName.replace(/\.[^.]+$/, '') || fileName,
    aspectRatio: '16:9',
    url: `/api/stream?drive=${file.id}`,
    driveFileId: file.id,
    fileName,
    extension: ext.toUpperCase(),
    resolution: ext.toUpperCase(),
    duration,
    size: formatSize(file.size),
    mimeType,
    hasThumbnail: Boolean(file.hasThumbnail),
    thumbnailUrl: (file.hasThumbnail && file.thumbnailLink) ? `/api/stream/preview?drive=${file.id}&size=600` : '',
    thumbnailLink: file.thumbnailLink || ''
  };
}

function toArchiveOrFile(file) {
  const name = String(file.name || 'arquivo');
  const extMatch = name.match(/\.([^.]+)$/);
  const ext = (extMatch ? extMatch[1] : '').toLowerCase();
  const isArchive = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext) ||
    ['application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed', 'application/vnd.rar', 'application/x-7z-compressed'].includes(file.mimeType);

  return {
    id: (isArchive ? 'zip-' : 'file-') + file.id,
    type: isArchive ? 'archive' : 'file',
    title: name.replace(/\.[^.]+$/, '') || name,
    aspectRatio: '16:9',
    url: `/api/stream?drive=${file.id}`,
    driveFileId: file.id,
    fileName: name,
    extension: ext ? ext.toUpperCase() : 'ARQUIVO',
    resolution: ext ? ext.toUpperCase() : 'ARQUIVO',
    size: formatSize(file.size),
    mimeType: file.mimeType || (isArchive ? 'application/zip' : 'application/octet-stream')
  };
}

function formatDriveItem(file, folderId, folderPath, classifyResolution) {
  const name = String(file.name || '');
  const extMatch = name.match(/\.([^.]+)$/);
  const ext = (extMatch ? extMatch[1] : '').toLowerCase();
  const videoExts = ['mp4', 'mov', 'm4v', 'webm', 'mkv', 'avi', 'flv', 'wmv', 'prores'];
  const imageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'tif', 'heic', 'heif'];
  const audioExts = ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'aiff', 'aif', 'wma', 'opus', 'alac', 'mid', 'midi'];

  const isVideo = String(file.mimeType || '').startsWith('video/') || videoExts.includes(ext);
  const isPsd = ext === 'psd' || file.mimeType === 'image/x-photoshop' || file.mimeType === 'image/vnd.adobe.photoshop';
  const isAi = ext === 'ai' || file.mimeType === 'application/illustrator';
  const isPdf = ext === 'pdf' || file.mimeType === 'application/pdf';
  const isImage = !isPsd && !isAi && !isPdf && (String(file.mimeType || '').startsWith('image/') || imageExts.includes(ext));
  const isAudio = String(file.mimeType || '').startsWith('audio/') || audioExts.includes(ext);

  let item;
  if (isPsd) item = toPsd(file);
  else if (isAi) item = toAi(file);
  else if (isPdf) item = toPdf(file);
  else if (isVideo) item = toVideo(file, classifyResolution || (() => 'FHD'));
  else if (isImage) item = toImage(file, classifyResolution || (() => 'FHD'));
  else if (isAudio) item = toAudio(file);
  else item = toArchiveOrFile(file);
  item.driveFolderId = folderId;
  item.folderPath = folderPath || '';
  return item;
}

// Lê a pasta (e subpastas de exportação/fotos/entrega/arquivos) e devolve todos os arquivos reais
async function mirrorFolder(readDB, link, classifyResolution) {
  const id = extractFileId(link);
  if (!id) throw makeError('Não encontrei um ID de pasta do Google Drive neste link.', 'DRIVE_BAD_LINK', 400);

  const root = await getItem(readDB, id);

  // Validação rigorosa de permissão do usuário conectado:
  // Apenas pastas/arquivos da própria conta ou compartilhados explicitamente como EDITOR
  const isOwner = Boolean(root.ownedByMe || (root.owners && root.owners.some(o => o.me)));
  const isEditor = Boolean(root.capabilities && (root.capabilities.canAddChildren || root.capabilities.canEdit));

  if (!isOwner && !isEditor) {
    throw makeError(
      'Esta pasta não pertence à sua conta do Google Drive e não foi compartilhada com você como Editor. Apenas pastas da sua própria conta ou compartilhadas como Editor são permitidas.',
      'DRIVE_NOT_OWNER_OR_EDITOR',
      403
    );
  }

  const media = [];
  const folders = [];
  const isVideo = (f) => String(f.mimeType || '').startsWith('video/');
  const isImage = (f) => String(f.mimeType || '').startsWith('image/');
  const isFolder = (f) => f.mimeType === 'application/vnd.google-apps.folder';
  const isGoogleDocOrNative = (f) => String(f.mimeType || '').startsWith('application/vnd.google-apps.');
  const isSupportedFile = (f) => !isFolder(f) && !isGoogleDocOrNative(f);

  const toItem = (f, folderId, folderPath) => formatDriveItem(f, folderId, folderPath, classifyResolution);

  // O link pode apontar direto para um único arquivo
  if (isSupportedFile(root)) {
    return { folderId: root.id, folderName: root.name, folders: [], videos: [toItem(root, root.id, '')], isFile: true };
  }
  if (!isFolder(root)) {
    throw makeError('O link precisa ser de uma pasta ou arquivo válido do Google Drive.', 'DRIVE_BAD_LINK', 400);
  }

  // Traversal em largura (BFS) para suportar subpastas em qualquer nível de profundidade
  const queue = [{ id: root.id, name: root.name, parentId: null, path: '' }];
  const visited = new Set([root.id]);
  const MAX_TOTAL_FOLDERS = 300;
  const MAX_TOTAL_FILES = 5000;

  while (queue.length > 0 && folders.length < MAX_TOTAL_FOLDERS) {
    const current = queue.shift();
    const children = await listChildren(readDB, current.id);

    for (const child of children) {
      if (isFolder(child)) {
        // Ignora a pasta interna "Zomments" para que não apareça na galeria de entregas
        if (String(child.name || '').trim().toLowerCase() === 'zomments') {
          continue;
        }
        if (!visited.has(child.id) && (folders.length + queue.length) < MAX_TOTAL_FOLDERS) {
          visited.add(child.id);
          const relPath = current.path ? `${current.path}/${child.name}` : child.name;
          const folderObj = {
            id: child.id,
            name: child.name,
            parentId: current.id,
            path: relPath
          };
          folders.push(folderObj);
          queue.push(folderObj);
        }
      } else if (isSupportedFile(child)) {
        if (media.length < MAX_TOTAL_FILES) {
          media.push(toItem(child, current.id, current.path));
        }
      }
    }
  }

  return {
    folderId: root.id,
    folderName: root.name,
    folders,
    videos: media
  };
}

// ---------- Read-Ahead RAM Cache para Mobile (Zero Disco, Latência Zero entre Chunks) ----------
const MOBILE_BLOCK_SIZE = 8 * 1024 * 1024; // 8 MB por bloco em RAM
const MAX_RAM_BLOCKS = 6; // Máximo ~48 MB em RAM no total, expira em 60s
const mobileBlockCache = new Map(); // key -> { buffer, start, end, totalSize, contentType, ts }
const mobileInflightBlocks = new Map(); // key -> Promise

function pruneMobileBlockCache() {
  const now = Date.now();
  for (const [k, v] of mobileBlockCache.entries()) {
    if (now - v.ts > 60000) mobileBlockCache.delete(k);
  }
  while (mobileBlockCache.size > MAX_RAM_BLOCKS) {
    const oldestKey = mobileBlockCache.keys().next().value;
    if (oldestKey) mobileBlockCache.delete(oldestKey);
    else break;
  }
}

function prefetchDriveBlockToRam(token, fileId, blockStart, totalSizeHint = null) {
  if (totalSizeHint && blockStart >= totalSizeHint) return null;
  const key = `${fileId}:${blockStart}`;
  if (mobileBlockCache.has(key)) {
    mobileBlockCache.get(key).ts = Date.now();
    return Promise.resolve(mobileBlockCache.get(key));
  }
  if (mobileInflightBlocks.has(key)) {
    return mobileInflightBlocks.get(key);
  }

  const blockEnd = totalSizeHint
    ? Math.min(blockStart + MOBILE_BLOCK_SIZE - 1, totalSizeHint - 1)
    : (blockStart + MOBILE_BLOCK_SIZE - 1);

  const p = new Promise((resolve) => {
    const headers = {
      Authorization: `Bearer ${token}`,
      Range: `bytes=${blockStart}-${blockEnd}`
    };
    const reqUp = https.request(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`,
      { method: 'GET', headers, timeout: 45000, agent: google.keepAliveAgent },
      (ures) => {
        if (ures.statusCode !== 206 && ures.statusCode !== 200) {
          ures.resume();
          return resolve(null);
        }
        const cr = String(ures.headers['content-range'] || '');
        const crMatch = cr.match(/bytes\s+(\d+)-(\d+)\/(\d+)/i);
        const actualStart = crMatch ? parseInt(crMatch[1], 10) : blockStart;
        const actualEnd = crMatch ? parseInt(crMatch[2], 10) : blockEnd;
        const totalSize = crMatch ? parseInt(crMatch[3], 10) : (parseInt(ures.headers['content-length'] || '0', 10) || 0);
        const contentType = String(ures.headers['content-type'] || 'video/mp4').toLowerCase();

        const chunks = [];
        ures.on('data', (c) => chunks.push(c));
        ures.on('end', () => {
          const buffer = Buffer.concat(chunks);
          if (buffer.length > 0) {
            pruneMobileBlockCache();
            const entry = {
              buffer,
              start: actualStart,
              end: actualStart + buffer.length - 1,
              totalSize: totalSize || (actualStart + buffer.length),
              contentType,
              ts: Date.now()
            };
            mobileBlockCache.set(key, entry);
            resolve(entry);
          } else {
            resolve(null);
          }
        });
        ures.on('error', () => resolve(null));
      }
    );
    reqUp.on('timeout', () => reqUp.destroy());
    reqUp.on('error', () => resolve(null));
    reqUp.end();
  }).finally(() => {
    mobileInflightBlocks.delete(key);
  });

  mobileInflightBlocks.set(key, p);
  return p;
}

// Transmite o arquivo (vídeo ou imagem) do Drive para o navegador com suporte a Range (HTTP 206)
async function streamFile(req, res, readDB, fileId, { download = false, fileName = 'arquivo', mimeType = null } = {}) {
  if (!ID_RE.test(fileId)) return res.status(400).send('ID de arquivo inválido');

  let token;
  try {
    token = await google.getDriveAccessToken(readDB);
  } catch (err) {
    return res.status(503).send(err.message);
  }

  if (req.socket && typeof req.socket.setNoDelay === 'function') {
    req.socket.setNoDelay(true);
  }
  if (res.socket && typeof res.socket.setNoDelay === 'function') {
    res.socket.setNoDelay(true);
  }

  const headers = { Authorization: `Bearer ${token}` };
  const rawRange = req.headers.range;
  const ua = String(req.headers['user-agent'] || '');
  const isMobileUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

  //No Mobile (iOS Safari / Android Chrome):
  // Navegadores mobile abortam streams gigantes de 385MB para poupar RAM, o que quebrava o Keep-Alive.
  // Usamos blocos de 8MB alinhados + Read-Ahead Prefetch em RAM do bloco seguinte (0ms de espera no próximo chunk).
  if (!download && isMobileUa && rawRange) {
    const rangeMatch = rawRange.match(/^bytes=(\d+)-(\d+)?$/i);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const clientEnd = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : null;
      const blockIdx = Math.floor(start / MOBILE_BLOCK_SIZE);
      const blockStart = blockIdx * MOBILE_BLOCK_SIZE;
      const blockEnd = blockStart + MOBILE_BLOCK_SIZE - 1;
      const blockKey = `${fileId}:${blockStart}`;

      pruneMobileBlockCache();

      // Se o bloco já estiver em RAM (ou terminando de chegar via prefetch), entrega em 0ms direto da RAM!
      let cachedEntry = mobileBlockCache.get(blockKey);
      if (!cachedEntry && mobileInflightBlocks.has(blockKey)) {
        cachedEntry = await mobileInflightBlocks.get(blockKey);
      }

      if (cachedEntry && start >= cachedEntry.start && start <= cachedEntry.end) {
        cachedEntry.ts = Date.now();
        const actualEnd = clientEnd !== null
          ? Math.min(clientEnd, cachedEntry.end)
          : cachedEntry.end;
        const sliceStart = start - cachedEntry.start;
        const sliceEnd = actualEnd - cachedEntry.start + 1;
        const slice = cachedEntry.buffer.subarray(sliceStart, sliceEnd);

        // Dispara prefetch assíncrono do próximo bloco de 8MB em RAM enquanto o celular reproduz este
        const nextBlockStart = (blockIdx + 1) * MOBILE_BLOCK_SIZE;
        if (nextBlockStart < cachedEntry.totalSize) {
          prefetchDriveBlockToRam(token, fileId, nextBlockStart, cachedEntry.totalSize);
        }

        res.writeHead(206, {
          'Content-Type': mimeType || cachedEntry.contentType || 'video/mp4',
          'Accept-Ranges': 'bytes',
          'Content-Range': `bytes ${start}-${actualEnd}/${cachedEntry.totalSize}`,
          'Content-Length': slice.length,
          'Cache-Control': 'private, max-age=3600',
          'Content-Disposition': 'inline'
        });
        return res.end(slice);
      }

      // Se ainda não está em RAM: limita o range deste request ao fim do bloco de 8MB para preservar o Keep-Alive TLS
      const targetEnd = (clientEnd !== null && clientEnd < blockEnd) ? clientEnd : blockEnd;
      headers.Range = `bytes=${start}-${targetEnd}`;

      // Se não for apenas o probe de 2 bytes (bytes=0-1 do Safari), já dispara prefetch do próximo bloco (ou do bloco 0)
      if (clientEnd !== null && (clientEnd - start) <= 4) {
        prefetchDriveBlockToRam(token, fileId, 0);
      } else {
        const nextBlockStart = (blockIdx + 1) * MOBILE_BLOCK_SIZE;
        prefetchDriveBlockToRam(token, fileId, nextBlockStart);
      }
    } else {
      headers.Range = rawRange;
    }
  } else if (rawRange) {
    // No PC / Desktop: Stream contínuo aberto (Open-Ended HTTP 206) com velocidade máxima
    headers.Range = rawRange;
  }

  const upstream = https.request(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`,
    { method: 'GET', headers, timeout: 120000, agent: google.keepAliveAgent },
    (ures) => {
      if (ures.socket && typeof ures.socket.setNoDelay === 'function') {
        ures.socket.setNoDelay(true);
      }
      const status = ures.statusCode;

      if (status === 416) {
        res.writeHead(416, { 'Content-Range': ures.headers['content-range'] || 'bytes */*' });
        ures.resume();
        return res.end();
      }
      if (status !== 200 && status !== 206) {
        ures.resume();
        if (status === 404 && fileName && fileName.startsWith('comment-attachment')) {
          res.setHeader('Content-Type', 'image/svg+xml');
          return res.status(404).send(getUnavailablePictureSvg());
        }
        return res.status(status === 404 || status === 403 ? status : 502).send('Não foi possível ler o arquivo no Google Drive');
      }

      const rawUpstreamType = String(ures.headers['content-type'] || '').toLowerCase();
      let contentType = mimeType || 'application/octet-stream';

      // Normaliza tipos de áudio comuns retornados pelo Drive para padrões web universais
      if (rawUpstreamType === 'audio/x-wav' || rawUpstreamType === 'audio/wav') {
        contentType = 'audio/wav';
      } else if (rawUpstreamType === 'audio/x-m4a' || rawUpstreamType === 'audio/m4a') {
        contentType = 'audio/mp4';
      } else if (rawUpstreamType === 'audio/mp3' || rawUpstreamType === 'audio/x-mp3') {
        contentType = 'audio/mpeg';
      } else if (rawUpstreamType.startsWith('video/') || rawUpstreamType.startsWith('image/') || rawUpstreamType.startsWith('audio/')) {
        contentType = rawUpstreamType;
      } else if (mimeType && (mimeType.startsWith('video/') || mimeType.startsWith('image/') || mimeType.startsWith('audio/'))) {
        contentType = mimeType;
      } else if (fileName.match(/\.(jpg|jpeg)$/i)) {
        contentType = 'image/jpeg';
      } else if (fileName.match(/\.png$/i)) {
        contentType = 'image/png';
      } else if (fileName.match(/\.mp4$/i)) {
        contentType = 'video/mp4';
      } else if (fileName.match(/\.mov$/i)) {
        contentType = 'video/quicktime';
      } else if (fileName.match(/\.webm$/i)) {
        contentType = 'video/webm';
      } else if (fileName.match(/\.mkv$/i)) {
        contentType = 'video/x-matroska';
      } else if (fileName.match(/\.mp3$/i)) {
        contentType = 'audio/mpeg';
      } else if (fileName.match(/\.wav$/i)) {
        contentType = 'audio/wav';
      } else if (fileName.match(/\.aac$/i)) {
        contentType = 'audio/aac';
      } else if (fileName.match(/\.flac$/i)) {
        contentType = 'audio/flac';
      } else if (fileName.match(/\.ogg$/i)) {
        contentType = 'audio/ogg';
      } else if (fileName.match(/\.m4a$/i)) {
        contentType = 'audio/mp4';
      } else if (fileName.match(/\.aif(f)?$/i)) {
        contentType = 'audio/aiff';
      } else if (fileName.match(/\.opus$/i)) {
        contentType = 'audio/opus';
      } else if (fileName.match(/\.pdf$/i)) {
        contentType = 'application/pdf';
      } else if (fileName.match(/\.psd$/i)) {
        contentType = 'image/vnd.adobe.photoshop';
      } else if (fileName.match(/\.ai$/i)) {
        contentType = 'application/illustrator';
      }

      const out = {
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': download ? 'no-store' : 'private, max-age=3600',
        'Content-Disposition': download
          ? `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`
          : 'inline'
      };
      if (ures.headers['content-length']) out['Content-Length'] = ures.headers['content-length'];
      if (ures.headers['content-range']) out['Content-Range'] = ures.headers['content-range'];

      res.writeHead(status, out);
      ures.pipe(res);
      ures.on('error', () => res.destroy());
    }
  );

  upstream.on('timeout', () => upstream.destroy(new Error('timeout')));
  upstream.on('error', (err) => {
    // Se o cliente (navegador) fechou o stream propositalmente (seek, pause, fechar aba),
    // a destruição do upstream gera ECONNRESET esperado — não poluir logs
    if (res.destroyed || res.writableEnded || err.code === 'ECONNRESET' || err.code === 'ERR_STREAM_PREMATURE_CLOSE') {
      return;
    }
    console.error('Erro no stream do Drive:', err.code || err.message);
    if (!res.headersSent) res.status(502).send('Falha ao ler o arquivo no Google Drive');
    else res.destroy();
  });
  // Cancela o download no Google se o navegador desistir (seek / fechar aba)
  res.on('close', () => {
    try { upstream.destroy(); } catch (e) {}
  });
  upstream.end();
}

// Obtém um stream legível direto do arquivo no Google Drive para downloads/compactação
async function getFileStream(readDB, fileId) {
  if (!ID_RE.test(fileId)) throw new Error('ID de arquivo inválido: ' + fileId);
  const token = await google.getDriveAccessToken(readDB);
  const headers = { Authorization: `Bearer ${token}` };
  return new Promise((resolve, reject) => {
    const upstream = https.request(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`,
      { method: 'GET', headers, timeout: 60000, agent: google.keepAliveAgent },
      (ures) => {
        if (ures.statusCode !== 200 && ures.statusCode !== 206) {
          ures.resume();
          return reject(new Error(`Drive stream status ${ures.statusCode}`));
        }
        resolve(ures);
      }
    );
    upstream.on('timeout', () => upstream.destroy(new Error('timeout')));
    upstream.on('error', (err) => reject(err));
    upstream.end();
  });
}

// Faz upload de um arquivo para o Google Drive diretamente na pasta de destino (raiz ou subpasta)
async function uploadFileToFolder(readDB, targetFolderId, localFilePath, originalName, mimeType) {
  if (!ID_RE.test(targetFolderId)) throw makeError('ID de pasta inválido para upload no Google Drive.', 'DRIVE_BAD_ID', 400);

  const token = await google.getDriveAccessToken(readDB);
  const stat = fs.statSync(localFilePath);
  const fileSize = stat.size;
  const fileName = path.basename(originalName || 'arquivo');
  const uploadMime = mimeType || 'application/octet-stream';

  // 1. Iniciar sessão de upload resumível no Google Drive
  const initBody = JSON.stringify({
    name: fileName,
    parents: [targetFolderId]
  });

  const initRes = await new Promise((resolve, reject) => {
    const req = https.request('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': uploadMime,
        'X-Upload-Content-Length': String(fileSize),
        'Content-Length': Buffer.byteLength(initBody)
      },
      timeout: 30000
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data
        });
      });
    });
    req.on('timeout', () => req.destroy(new Error('Tempo esgotado ao iniciar upload no Google Drive')));
    req.on('error', reject);
    req.write(initBody);
    req.end();
  });

  if (initRes.status === 403) {
    let errMsg = 'Sem permissão para fazer upload nesta pasta do Google Drive.';
    try {
      const parsed = JSON.parse(initRes.data);
      if (parsed.error && parsed.error.message) {
        if (parsed.error.message.includes('insufficientFilePermissions') || parsed.error.message.includes('insufficientPermissions') || parsed.error.message.includes('Insufficient Permission')) {
          errMsg = 'Permissão de escrita insuficiente no Google Drive. Como os uploads agora são permitidos, por favor reconecte sua conta do Google Drive clicando em "Conectar Google Drive" ou fazendo login novamente como Autor para autorizar o envio.';
        }
      }
    } catch (e) {}
    throw makeError(errMsg, 'DRIVE_INSUFFICIENT_PERMISSIONS', 403);
  }

  if (initRes.status !== 200 || !initRes.headers.location) {
    throw makeError(`Falha ao iniciar upload no Google Drive (status ${initRes.status}).`, 'DRIVE_UPLOAD_INIT_FAILED', 502);
  }

  const uploadUrl = initRes.headers.location;

  // 2. Transmitir o arquivo local em streaming para a URL do upload resumível
  const uploadRes = await new Promise((resolve, reject) => {
    const fileStream = fs.createReadStream(localFilePath);
    const req = https.request(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Length': String(fileSize),
        'Content-Type': uploadMime
      },
      timeout: 600000 // 10 minutos
    }, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch (e) {}
        resolve({ status: res.statusCode, json, body });
      });
    });
    req.on('timeout', () => req.destroy(new Error('Tempo esgotado durante o envio do arquivo para o Google Drive')));
    req.on('error', reject);
    fileStream.pipe(req);
    fileStream.on('error', (err) => {
      req.destroy(err);
      reject(err);
    });
  });

  if (uploadRes.status !== 200 && uploadRes.status !== 201) {
    throw makeError('Falha ao enviar dados do arquivo para o Google Drive.', 'DRIVE_UPLOAD_FAILED', 502);
  }

  const fileData = uploadRes.json;
  if (!fileData || !fileData.id) {
    throw makeError('Google Drive não retornou as informações do arquivo enviado.', 'DRIVE_UPLOAD_INVALID', 502);
  }

  // 3. Buscar os metadados completos do arquivo criado
  let fullItem = null;
  try {
    fullItem = await getItem(readDB, fileData.id);
  } catch (e) {
    fullItem = {
      id: fileData.id,
      name: fileData.name || fileName,
      mimeType: fileData.mimeType || uploadMime,
      size: fileSize
    };
  }

  return fullItem;
}

// Renomeia um arquivo diretamente no Google Drive
async function renameFile(userContext, fileId, newName) {
  if (!ID_RE.test(fileId)) throw makeError('ID de arquivo inválido.', 'DRIVE_BAD_ID', 400);
  const token = await google.getDriveAccessToken(userContext);
  const body = JSON.stringify({ name: newName });
  const res = await google.request(`https://www.googleapis.com/drive/v3/files/${fileId}?supportsAllDrives=true`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    },
    body
  });
  if (res.status !== 200 || !res.json) {
    throw translateApiError(res);
  }
  return res.json;
}

async function getFileMetadata(readDB, fileId) {
  if (!ID_RE.test(fileId)) throw makeError('ID de arquivo inválido.', 'DRIVE_BAD_ID', 400);
  return getItem(readDB, fileId);
}

// Obtém ou cria a pasta "Zomments" na raiz do projeto para armazenar imagens de comentários
async function getOrCreateZommentsFolder(readDB, rootFolderId) {
  if (!ID_RE.test(rootFolderId)) throw makeError('ID de pasta raiz inválido.', 'DRIVE_BAD_ID', 400);
  const token = await google.getDriveAccessToken(readDB);

  // 1. Procura por pasta existente chamada "Zomments" dentro da pasta raiz
  const q = `'${rootFolderId}' in parents and name = 'Zomments' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&supportsAllDrives=true&includeItemsFromAllDrives=true&fields=files(id,name,mimeType)`;
  const searchRes = await google.request(searchUrl, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (searchRes.status === 200 && searchRes.json && Array.isArray(searchRes.json.files) && searchRes.json.files.length > 0) {
    return searchRes.json.files[0];
  }

  // 2. Se não existir, cria a pasta "Zomments"
  const body = JSON.stringify({
    name: 'Zomments',
    mimeType: 'application/vnd.google-apps.folder',
    parents: [rootFolderId]
  });
  const createRes = await google.request('https://www.googleapis.com/drive/v3/files?supportsAllDrives=true', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    },
    body
  });

  if ((createRes.status === 200 || createRes.status === 201) && createRes.json && createRes.json.id) {
    return createRes.json;
  }
  throw translateApiError(createRes);
}

// Lista arquivos dentro de uma pasta do Google Drive
async function listFilesInFolder(readDB, folderId) {
  if (!ID_RE.test(folderId)) return [];
  try {
    const token = await google.getDriveAccessToken(readDB);
    const q = `'${folderId}' in parents and trashed = false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&supportsAllDrives=true&includeItemsFromAllDrives=true&fields=files(id,name,mimeType,size)&pageSize=1000`;
    const res = await google.request(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.status === 200 && res.json && Array.isArray(res.json.files)) {
      return res.json.files;
    }
    return [];
  } catch (err) {
    console.warn(`[Drive] Erro ao listar arquivos da pasta ${folderId}:`, err.message);
    return [];
  }
}

// Resolve colisão de nomes de imagens na pasta Zomments: mesmo nome recebe (1), (2), sucessivamente...
function resolveUniqueFileName(existingNamesList, rawName) {
  const existingLower = new Set((existingNamesList || []).map(n => String(n || '').trim().toLowerCase()));
  const cleanName = path.basename(String(rawName || 'imagem.png')).trim() || 'imagem.png';
  if (!existingLower.has(cleanName.toLowerCase())) {
    return cleanName;
  }

  const extMatch = cleanName.match(/\.([^.]+)$/);
  const ext = extMatch ? '.' + extMatch[1] : '';
  let base = extMatch ? cleanName.slice(0, -ext.length) : cleanName;

  const counterMatch = base.match(/^(.*?)\s*\((\d+)\)$/);
  let startCounter = 1;
  if (counterMatch) {
    base = counterMatch[1].trim();
    startCounter = parseInt(counterMatch[2], 10) + 1;
  }

  let counter = startCounter;
  let candidate = `${base} (${counter})${ext}`;
  while (existingLower.has(candidate.toLowerCase())) {
    counter++;
    candidate = `${base} (${counter})${ext}`;
  }
  return candidate;
}

// Exclui um arquivo ou pasta do Google Drive
async function deleteDriveFileOrFolder(readDB, fileId) {
  if (!ID_RE.test(fileId)) return false;
  try {
    const token = await google.getDriveAccessToken(readDB);
    const res = await google.request(`https://www.googleapis.com/drive/v3/files/${fileId}?supportsAllDrives=true`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.status === 204 || res.status === 200 || res.status === 404;
  } catch (err) {
    console.warn(`[Drive] Não foi possível excluir item ${fileId}:`, err.message);
    return false;
  }
}

// Exclui imagem de comentário e, se só houver 1 (ou menos) na pasta Zomments, remove a pasta também
async function deleteCommentImage(readDB, fileId, zommentsFolderId) {
  if (!fileId) return;

  let filesCount = 0;
  if (zommentsFolderId) {
    try {
      const files = await listFilesInFolder(readDB, zommentsFolderId);
      filesCount = Array.isArray(files) ? files.length : 0;
    } catch (e) {
      filesCount = 0;
    }
  }

  // Exclui a imagem do comentário
  await deleteDriveFileOrFolder(readDB, fileId);

  // Se havia apenas 1 arquivo (o que acabou de ser excluído) ou nenhum, remove a pasta Zomments também
  if (zommentsFolderId && filesCount <= 1) {
    try {
      await deleteDriveFileOrFolder(readDB, zommentsFolderId);
    } catch (e) {
      console.warn(`[Drive] Não foi possível excluir a pasta Zomments ${zommentsFolderId}:`, e.message);
    }
  }
}

// SVG predefinido de Unavailable Picture quando a pasta ou imagem é excluída do Google Drive
function getUnavailablePictureSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260" fill="#181a1f">
    <rect width="100%" height="100%" fill="#181a1f"/>
    <rect x="20" y="20" width="360" height="220" rx="12" fill="#20242b" stroke="#333842" stroke-dasharray="6,6"/>
    <g transform="translate(160, 65)" stroke="#7d8799" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="74" height="64" rx="8"/>
      <circle cx="25" cy="25" r="7"/>
      <polyline points="77 55 58 35 18 75"/>
      <line x1="0" y1="0" x2="80" y2="70" stroke="#ff6600" stroke-width="3"/>
    </g>
    <text x="200" y="175" fill="#f0f2f5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" text-anchor="middle">Unavailable Picture</text>
    <text x="200" y="198" fill="#8a94a6" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" text-anchor="middle">A pasta ou imagem foi removida no Google Drive</text>
  </svg>`;
}

module.exports = {
  extractFileId,
  mirrorFolder,
  streamFile,
  getFileStream,
  uploadFileToFolder,
  formatDriveItem,
  renameFile,
  getFileMetadata,
  getOrCreateZommentsFolder,
  listFilesInFolder,
  resolveUniqueFileName,
  deleteDriveFileOrFolder,
  deleteCommentImage,
  getUnavailablePictureSvg
};


