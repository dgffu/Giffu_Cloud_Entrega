/**
 * Multi-Cloud Storage Engine - Giffú Entrega
 * Supports Google Drive (Primary & Additional), Dropbox, OneDrive, Box, and iCloud Drive.
 * Provides Link Detection, Account Connection Management, Folder Mirroring,
 * Media Streaming (with HTTP Range support), and File Uploads.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// =============================================================================
// Provider Detection & Metadata
// =============================================================================

function detectProvider(url) {
  if (!url) return null;
  const str = String(url).trim().toLowerCase();

  if (str.includes('drive.google.com') || str.includes('docs.google.com')) {
    return 'google';
  }
  if (str.includes('dropbox.com') || str.includes('dl.dropboxusercontent.com')) {
    return 'dropbox';
  }
  if (str.includes('1drv.ms') || str.includes('onedrive.live.com') || str.includes('sharepoint.com')) {
    return 'onedrive';
  }
  if (str.includes('box.com') || str.includes('app.box.com')) {
    return 'box';
  }
  if (str.includes('icloud.com') || str.includes('share.icloud.com')) {
    return 'icloud';
  }

  // Pure Google Drive ID pattern fallback
  if (/^[a-zA-Z0-9_-]{25,}$/.test(str)) {
    return 'google';
  }

  return null;
}

function isLinkAFile(url) {
  if (!url) return false;
  const str = String(url).trim().toLowerCase();
  if (str.includes('/file/d/')) return true;
  if (str.includes('/scl/fi/') || /\.(mp4|mov|mkv|webm|m4v|avi|mp3|wav|aac|flac|m4a|ogg|jpg|jpeg|png|webp|gif|svg|pdf|zip|rar|7z|doc|docx|xls|xlsx|psd|ai)(\?.*)?$/i.test(str)) {
    return true;
  }
  if (str.includes('/file/')) return true;
  return false;
}

function getProviderLabel(provider) {
  switch (provider) {
    case 'google': return 'Google Drive';
    case 'dropbox': return 'Dropbox';
    case 'onedrive': return 'Microsoft OneDrive';
    case 'box': return 'Box';
    case 'icloud': return 'iCloud Drive';
    default: return 'Armazenamento em Nuvem';
  }
}

function getProviderColor(provider) {
  switch (provider) {
    case 'google': return '#4285F4';
    case 'dropbox': return '#0061FF';
    case 'onedrive': return '#0078D4';
    case 'box': return '#0061D5';
    case 'icloud': return '#0070c9';
    default: return '#FF5400';
  }
}

function getProviderIconSvg(provider) {
  switch (provider) {
    case 'google':
      return `<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>`;
    case 'dropbox':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="#0061FF"><path d="M6 2l6 4-6 4-6-4 6-4zm12 0l6 4-6 4-6-4 6-4zM0 14l6-4 6 4-6 4-6-4zm24 0l-6-4-6 4 6 4 6-4zM6 19.5l6-4 6 4-6 4-6-4z"/></svg>`;
    case 'onedrive':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="#0078D4"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>`;
    case 'box':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="#0061D5"><path d="M12.003 2.164L2.4 8.067v7.866l9.603 5.903 9.597-5.903V8.067l-9.597-5.903zm-1.2 13.916l-6.4-3.937 6.4-3.938v7.875zm2.4 0V8.205l6.4 3.938-6.4 3.937z"/></svg>`;
    case 'icloud':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="#0070c9"><path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95A5.5 5.5 0 0 1 12 6c2.53 0 4.71 1.7 5.32 4.19l.34 1.39 1.41.25C20.44 12.07 21 13.2 21 14.5c0 1.93-1.57 3.5-3.5 3.5z"/></svg>`;
    default:
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>`;
  }
}

// =============================================================================
// Account Management
// =============================================================================

function getConnectedAccounts(userDb) {
  if (!userDb) return [];
  if (!Array.isArray(userDb.connectedAccounts)) {
    userDb.connectedAccounts = [];
  }
  return userDb.connectedAccounts;
}

function getAccountById(userDb, accountId) {
  const accounts = getConnectedAccounts(userDb);
  return accounts.find(a => a.id === accountId) || null;
}

function findAccountForProvider(userDb, provider) {
  const accounts = getConnectedAccounts(userDb);
  return accounts.find(a => a.provider === provider && a.status !== 'disconnected') || null;
}

function addConnectedAccount(userDb, accountData) {
  if (!userDb.connectedAccounts) userDb.connectedAccounts = [];

  const id = `acc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const newAccount = {
    id,
    provider: accountData.provider || 'dropbox',
    name: (accountData.name || '').trim() || getProviderLabel(accountData.provider),
    email: (accountData.email || '').trim() || '',
    token: (accountData.token || '').trim() || '',
    refreshToken: (accountData.refreshToken || '').trim() || '',
    credentials: accountData.credentials || {},
    status: 'connected',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  userDb.connectedAccounts.push(newAccount);
  return newAccount;
}

function removeConnectedAccount(userDb, accountId) {
  if (!userDb.connectedAccounts) return false;
  const idx = userDb.connectedAccounts.findIndex(a => a.id === accountId);
  if (idx !== -1) {
    userDb.connectedAccounts.splice(idx, 1);
    return true;
  }
  return false;
}

// =============================================================================
// Media File & Subfolder Mapping
// =============================================================================

function formatSize(bytes) {
  const b = Number(bytes) || 0;
  if (b >= 1073741824) return `${(b / 1073741824).toFixed(2)} GB`;
  if (b >= 1048576) return `${(b / 1048576).toFixed(1)} MB`;
  if (b >= 1024) return `${(b / 1024).toFixed(1)} KB`;
  if (b > 0) return `${b} B`;
  return '';
}

function classifyMediaType(fileName, mimeType = '') {
  const ext = (path.extname(fileName || '').replace('.', '') || '').toLowerCase();
  const m = String(mimeType || '').toLowerCase();

  if (m.startsWith('video/') || ['mp4', 'mov', 'webm', 'mkv', 'm4v', 'avi', 'flv'].includes(ext)) {
    return 'video';
  }
  if (m.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'tif', 'heic', 'svg', 'ai', 'psd'].includes(ext)) {
    return 'image';
  }
  if (m.startsWith('audio/') || ['mp3', 'wav', 'aac', 'flac', 'm4a', 'ogg', 'aiff'].includes(ext)) {
    return 'audio';
  }
  if (m === 'application/pdf' || ext === 'pdf') {
    return 'pdf';
  }
  return 'file';
}

function normalizeMimeType(fileName, originalMime) {
  const ext = (path.extname(fileName || '').replace('.', '') || '').toLowerCase();
  if (ext === 'mov') return 'video/quicktime';
  if (ext === 'mp4') return 'video/mp4';
  if (ext === 'webm') return 'video/webm';
  if (ext === 'wav') return 'audio/wav';
  if (ext === 'mp3') return 'audio/mpeg';
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'webp') return 'image/webp';
  return originalMime || 'application/octet-stream';
}

// =============================================================================
// Folder Mirroring for Multi-Cloud Services
// =============================================================================

async function mirrorProject(project, userDb, classifyResolution) {
  const provider = detectProvider(project.driveLink);
  if (!provider) {
    throw new Error('Link de compartilhamento inválido. Por favor, cole um link do Google Drive, Dropbox, OneDrive, Box ou iCloud.');
  }

  // 1. Google Drive with specific or additional account
  if (provider === 'google') {
    const driveApi = require('./drive');
    const matchedAccount = findAccountForProvider(userDb, 'google');
    const effectiveUser = matchedAccount && matchedAccount.driveTokens
      ? { ...userDb, driveTokens: matchedAccount.driveTokens }
      : userDb;
    const r = await driveApi.mirrorFolder(effectiveUser, project.driveLink, classifyResolution);
    project.driveFolderId = r.folderId;
    project.driveFolderName = r.folderName;
    project.cloudProvider = 'google';
    project.folders = r.folders || [];
    project.videos = r.videos;
    project.lastSyncedAt = new Date().toISOString();
    return {
      source: 'google',
      resolvedFolder: r.folderName,
      detected: r.videos.length,
      foldersCount: (r.folders || []).length
    };
  }

  // 2. Dropbox
  if (provider === 'dropbox') {
    return await mirrorDropbox(project, userDb, classifyResolution);
  }

  // 3. OneDrive
  if (provider === 'onedrive') {
    return await mirrorOneDrive(project, userDb, classifyResolution);
  }

  // 4. Box
  if (provider === 'box') {
    return await mirrorBox(project, userDb, classifyResolution);
  }

  // 5. iCloud Drive
  if (provider === 'icloud') {
    return await mirrorICloud(project, userDb, classifyResolution);
  }

  throw new Error(`Provedor ${provider} não reconhecido.`);
}

// -----------------------------------------------------------------------------
// Dropbox Mirroring Implementation
// -----------------------------------------------------------------------------

async function mirrorDropbox(project, userDb, classifyResolution) {
  const account = findAccountForProvider(userDb, 'dropbox');
  const token = account ? account.token : null;
  const rawUrl = project.driveLink.trim();

  // Normalize shared link
  let sharedUrl = rawUrl.replace(/[?&]dl=[01]/g, '').replace(/[?&]raw=1/g, '');
  if (!sharedUrl.includes('?')) sharedUrl += '?dl=0';

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const body = {
    shared_link: { url: sharedUrl },
    path: '',
    recursive: true,
    include_media_info: true
  };

  const res = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 || (json && json.error && json.error['.tag'] === 'invalid_access_token')) {
      throw new Error('Sua conta Dropbox precisa ser conectada. Clique em "+ Conta" para autorizar seu Dropbox.');
    }
    // Suporte a link direto de arquivo individual no Dropbox
    if (json?.error?.['.tag'] === 'not_folder' || json?.error_summary?.includes('not_folder') || isLinkAFile(rawUrl)) {
      const metaRes = await fetch('https://api.dropboxapi.com/2/sharing/get_shared_link_metadata', {
        method: 'POST',
        headers,
        body: JSON.stringify({ url: sharedUrl })
      });
      const metaJson = await metaRes.json().catch(() => ({}));
      if (metaRes.ok && metaJson && metaJson['.tag'] === 'file') {
        const f = metaJson;
        const fileName = f.name;
        const type = classifyMediaType(fileName);
        const mimeType = normalizeMimeType(fileName);
        const id = `file-dbx-${Buffer.from(fileName).toString('base64').replace(/=/g, '').slice(0, 18)}`;
        const isVideo = type === 'video';
        const isAudio = type === 'audio';

        const media = {
          id,
          type,
          title: fileName.replace(/\.[^.]+$/, '') || fileName,
          fileName,
          mimeType,
          size: formatSize(f.size),
          sizeBytes: f.size,
          folderId: null,
          folderPath: '',
          url: `/api/stream/cloud?provider=dropbox&fileId=${encodeURIComponent(id)}&proj=${encodeURIComponent(project.id)}`,
          cloudProvider: 'dropbox',
          cloudPath: f.path_lower || ('/' + fileName),
          cloudSharedUrl: sharedUrl,
          aspectRatio: '16:9',
          resolution: isVideo ? classifyResolution('FHD') : null,
          duration: isVideo || isAudio ? '00:00' : null,
          isAlpha: isVideo && /4444|alpha|transp/i.test(fileName)
        };

        project.cloudProvider = 'dropbox';
        project.cloudSharedUrl = sharedUrl;
        project.driveFolderName = fileName;
        project.folders = [];
        project.videos = [media];
        project.isFile = true;
        project.isIsolatedFile = true;
        project.fileType = type;
        project.fileExt = fileName.split('.').pop() || '';
        project.lastSyncedAt = new Date().toISOString();

        return {
          source: 'dropbox',
          resolvedFolder: fileName,
          detected: 1,
          foldersCount: 0,
          isFile: true
        };
      }
    }
    const msg = (json && json.error_summary) || 'Não foi possível acessar a pasta do Dropbox. Verifique as permissões do link.';
    throw new Error(msg);
  }

  const entries = json.entries || [];
  const folders = [];
  const videos = [];
  const folderMap = new Map();

  // 1. Process Folders
  entries.filter(e => e['.tag'] === 'folder').forEach(f => {
    const cleanPath = (f.path_display || f.name).replace(/^\//, '');
    const pathParts = cleanPath.split('/');
    const parentPath = pathParts.slice(0, -1).join('/');
    const folderId = `fol-dbx-${Buffer.from(cleanPath).toString('base64').replace(/=/g, '').slice(0, 16)}`;

    folderMap.set(cleanPath, folderId);

    folders.push({
      id: folderId,
      name: f.name,
      path: cleanPath,
      parentId: parentPath && folderMap.has(parentPath) ? folderMap.get(parentPath) : null,
      allowComments: true,
      hideBrandName: true,
      allowShare: true,
      shortCode: Math.random().toString(36).substring(2, 7)
    });
  });

  // 2. Process Files
  entries.filter(e => e['.tag'] === 'file').forEach(f => {
    const fullPath = (f.path_display || f.name).replace(/^\//, '');
    const pathParts = fullPath.split('/');
    const fileName = f.name;
    const parentPath = pathParts.slice(0, -1).join('/');
    const folderId = parentPath && folderMap.has(parentPath) ? folderMap.get(parentPath) : null;
    const type = classifyMediaType(fileName);
    const mimeType = normalizeMimeType(fileName);
    const id = `file-dbx-${Buffer.from(fullPath).toString('base64').replace(/=/g, '').slice(0, 18)}`;

    const isVideo = type === 'video';
    const isImage = type === 'image';
    const isAudio = type === 'audio';

    const media = {
      id,
      type,
      title: fileName.replace(/\.[^.]+$/, '') || fileName,
      fileName,
      mimeType,
      size: formatSize(f.size),
      sizeBytes: f.size,
      folderId,
      folderPath: parentPath || '',
      url: `/api/stream/cloud?provider=dropbox&fileId=${encodeURIComponent(id)}&proj=${encodeURIComponent(project.id)}`,
      cloudProvider: 'dropbox',
      cloudPath: f.path_lower || f.path_display || ('/' + fullPath),
      cloudSharedUrl: sharedUrl,
      aspectRatio: '16:9',
      resolution: isVideo ? classifyResolution('FHD') : null,
      duration: isVideo || isAudio ? '00:00' : null,
      isAlpha: isVideo && /4444|alpha|transp/i.test(fileName)
    };

    videos.push(media);
  });

  const rootName = (sharedUrl.match(/\/scl\/fo\/[^/]+\/([^/?]+)/) || sharedUrl.match(/\/sh\/[^/]+\/([^/?]+)/) || ['', 'Pasta Dropbox'])[1] || 'Pasta Dropbox';

  project.cloudProvider = 'dropbox';
  project.cloudSharedUrl = sharedUrl;
  project.driveFolderName = decodeURIComponent(rootName);
  project.folders = folders;
  project.videos = videos;
  project.lastSyncedAt = new Date().toISOString();

  return {
    source: 'dropbox',
    resolvedFolder: project.driveFolderName,
    detected: videos.length,
    foldersCount: folders.length
  };
}

// -----------------------------------------------------------------------------
// OneDrive Mirroring Implementation
// -----------------------------------------------------------------------------

async function mirrorOneDrive(project, userDb, classifyResolution) {
  const account = findAccountForProvider(userDb, 'onedrive');
  const token = account ? account.token : null;
  const rawUrl = project.driveLink.trim();

  // Microsoft Graph share URL encoding
  const base64Value = Buffer.from(rawUrl).toString('base64');
  const encodedUrl = 'u!' + base64Value.trimEnd('=').replace(/\//g, '_').replace(/\+/g, '-');

  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`https://graph.microsoft.com/v1.0/shares/${encodedUrl}/driveItem/children`, { headers });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Suporte a link direto de arquivo individual no OneDrive
    const singleRes = await fetch(`https://graph.microsoft.com/v1.0/shares/${encodedUrl}/driveItem`, { headers });
    const singleJson = await singleRes.json().catch(() => ({}));
    if (singleRes.ok && singleJson && singleJson.file) {
      const item = singleJson;
      const type = classifyMediaType(item.name, item.file?.mimeType);
      const mimeType = normalizeMimeType(item.name, item.file?.mimeType);
      const isVideo = type === 'video';
      const isAudio = type === 'audio';
      const id = `file-one-${item.id}`;

      const media = {
        id,
        type,
        title: item.name.replace(/\.[^.]+$/, '') || item.name,
        fileName: item.name,
        mimeType,
        size: formatSize(item.size),
        sizeBytes: item.size,
        folderId: null,
        folderPath: '',
        url: `/api/stream/cloud?provider=onedrive&fileId=${encodeURIComponent(id)}&proj=${encodeURIComponent(project.id)}`,
        cloudProvider: 'onedrive',
        cloudSharedUrl: rawUrl,
        downloadUrl: item['@microsoft.graph.downloadUrl'] || null,
        aspectRatio: '16:9',
        resolution: isVideo ? classifyResolution('FHD') : null,
        duration: isVideo || isAudio ? '00:00' : null,
        isAlpha: isVideo && /4444|alpha|transp/i.test(item.name)
      };

      project.cloudProvider = 'onedrive';
      project.cloudSharedUrl = rawUrl;
      project.driveFolderName = item.name;
      project.folders = [];
      project.videos = [media];
      project.isFile = true;
      project.isIsolatedFile = true;
      project.fileType = type;
      project.fileExt = (item.name || '').split('.').pop() || '';
      project.lastSyncedAt = new Date().toISOString();

      return {
        source: 'onedrive',
        resolvedFolder: item.name,
        detected: 1,
        foldersCount: 0,
        isFile: true
      };
    }

    if (res.status === 401) {
      throw new Error('Sua conta OneDrive precisa ser conectada. Clique em "+ Conta" para autorizar seu OneDrive.');
    }
    const msg = (json && json.error && json.error.message) || 'Não foi possível acessar a pasta do OneDrive. Verifique o compartilhamento do link.';
    throw new Error(msg);
  }

  const items = json.value || [];
  const folders = [];
  const videos = [];

  for (const item of items) {
    if (item.folder) {
      folders.push({
        id: `fol-one-${item.id}`,
        name: item.name,
        path: item.name,
        parentId: null,
        allowComments: true,
        hideBrandName: true,
        allowShare: true,
        shortCode: Math.random().toString(36).substring(2, 7)
      });
    } else if (item.file) {
      const type = classifyMediaType(item.name, item.file.mimeType);
      const mimeType = normalizeMimeType(item.name, item.file.mimeType);
      const isVideo = type === 'video';

      videos.push({
        id: `file-one-${item.id}`,
        type,
        title: item.name.replace(/\.[^.]+$/, '') || item.name,
        fileName: item.name,
        mimeType,
        size: formatSize(item.size),
        sizeBytes: item.size,
        folderId: null,
        folderPath: '',
        url: `/api/stream/cloud?provider=onedrive&fileId=${encodeURIComponent(item.id)}&proj=${encodeURIComponent(project.id)}`,
        directDownloadUrl: item['@microsoft.graph.downloadUrl'] || null,
        cloudProvider: 'onedrive',
        cloudFileId: item.id,
        aspectRatio: '16:9',
        resolution: isVideo ? classifyResolution('FHD') : null,
        duration: isVideo ? '00:00' : null,
        isAlpha: isVideo && /4444|alpha|transp/i.test(item.name)
      });
    }
  }

  project.cloudProvider = 'onedrive';
  project.driveFolderName = 'Pasta OneDrive';
  project.folders = folders;
  project.videos = videos;
  project.lastSyncedAt = new Date().toISOString();

  return {
    source: 'onedrive',
    resolvedFolder: project.driveFolderName,
    detected: videos.length,
    foldersCount: folders.length
  };
}

// -----------------------------------------------------------------------------
// Box Mirroring Implementation
// -----------------------------------------------------------------------------

async function mirrorBox(project, userDb, classifyResolution) {
  const account = findAccountForProvider(userDb, 'box');
  const token = account ? account.token : null;
  const rawUrl = project.driveLink.trim();

  const headers = {
    'BoxApi': `shared_link=${encodeURIComponent(rawUrl)}`
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch('https://api.box.com/2.0/shared_items', { headers });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Sua conta Box precisa ser conectada. Clique em "+ Conta" para autorizar seu Box.');
    }
    const msg = (json && json.message) || 'Não foi possível acessar a pasta do Box. Verifique o compartilhamento do link.';
    throw new Error(msg);
  }

  // Suporte a link direto de arquivo individual no Box
  if (json.type === 'file') {
    const item = json;
    const type = classifyMediaType(item.name);
    const mimeType = normalizeMimeType(item.name);
    const isVideo = type === 'video';
    const isAudio = type === 'audio';
    const id = `file-box-${item.id}`;

    const media = {
      id,
      type,
      title: item.name.replace(/\.[^.]+$/, '') || item.name,
      fileName: item.name,
      mimeType,
      size: formatSize(item.size),
      sizeBytes: item.size,
      folderId: null,
      folderPath: '',
      url: `/api/stream/cloud?provider=box&fileId=${encodeURIComponent(item.id)}&proj=${encodeURIComponent(project.id)}`,
      cloudProvider: 'box',
      cloudSharedUrl: rawUrl,
      aspectRatio: '16:9',
      resolution: isVideo ? classifyResolution('FHD') : null,
      duration: isVideo || isAudio ? '00:00' : null,
      isAlpha: isVideo && /4444|alpha|transp/i.test(item.name)
    };

    project.cloudProvider = 'box';
    project.cloudSharedUrl = rawUrl;
    project.driveFolderName = item.name;
    project.folders = [];
    project.videos = [media];
    project.isFile = true;
    project.isIsolatedFile = true;
    project.fileType = type;
    project.fileExt = (item.name || '').split('.').pop() || '';
    project.lastSyncedAt = new Date().toISOString();

    return {
      source: 'box',
      resolvedFolder: item.name,
      detected: 1,
      foldersCount: 0,
      isFile: true
    };
  }

  const entries = (json.item_collection && json.item_collection.entries) || [];
  const folders = [];
  const videos = [];

  for (const item of entries) {
    if (item.type === 'folder') {
      folders.push({
        id: `fol-box-${item.id}`,
        name: item.name,
        path: item.name,
        parentId: null,
        allowComments: true,
        hideBrandName: true,
        allowShare: true,
        shortCode: Math.random().toString(36).substring(2, 7)
      });
    } else if (item.type === 'file') {
      const type = classifyMediaType(item.name);
      const mimeType = normalizeMimeType(item.name);
      const isVideo = type === 'video';

      videos.push({
        id: `file-box-${item.id}`,
        type,
        title: item.name.replace(/\.[^.]+$/, '') || item.name,
        fileName: item.name,
        mimeType,
        size: formatSize(item.size),
        sizeBytes: item.size,
        folderId: null,
        folderPath: '',
        url: `/api/stream/cloud?provider=box&fileId=${encodeURIComponent(item.id)}&proj=${encodeURIComponent(project.id)}`,
        cloudProvider: 'box',
        cloudFileId: item.id,
        aspectRatio: '16:9',
        resolution: isVideo ? classifyResolution('FHD') : null,
        duration: isVideo ? '00:00' : null,
        isAlpha: isVideo && /4444|alpha|transp/i.test(item.name)
      });
    }
  }

  project.cloudProvider = 'box';
  project.driveFolderName = json.name || 'Pasta Box';
  project.folders = folders;
  project.videos = videos;
  project.lastSyncedAt = new Date().toISOString();

  return {
    source: 'box',
    resolvedFolder: project.driveFolderName,
    detected: videos.length,
    foldersCount: folders.length
  };
}

// -----------------------------------------------------------------------------
// iCloud Drive Mirroring Implementation
// -----------------------------------------------------------------------------

async function mirrorICloud(project, userDb, classifyResolution) {
  const rawUrl = project.driveLink.trim();
  const res = await fetch(rawUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }
  });

  const html = await res.text().catch(() => '');
  const videos = [];
  const folders = [];

  // Parse title and media references from iCloud web share metadata
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const folderName = (titleMatch ? titleMatch[1].replace(' - Apple iCloud', '') : 'Pasta iCloud').trim();

  // Extract shared items or direct photos/videos
  const streamMatches = html.match(/https:\/\/[^"'\s]+\.(mp4|mov|jpg|jpeg|png|heic)/gi) || [];
  const seen = new Set();

  streamMatches.forEach((mediaUrl, idx) => {
    if (seen.has(mediaUrl)) return;
    seen.add(mediaUrl);

    const fileName = path.basename(mediaUrl.split('?')[0]) || `midia-${idx + 1}.mp4`;
    const type = classifyMediaType(fileName);
    const mimeType = normalizeMimeType(fileName);
    const isVideo = type === 'video';

    videos.push({
      id: `file-icl-${idx}-${Date.now().toString(36)}`,
      type,
      title: fileName.replace(/\.[^.]+$/, '') || fileName,
      fileName,
      mimeType,
      size: 'Alta Qualidade',
      folderId: null,
      folderPath: '',
      url: `/api/stream/cloud?provider=icloud&url=${encodeURIComponent(mediaUrl)}&proj=${encodeURIComponent(project.id)}`,
      directDownloadUrl: mediaUrl,
      cloudProvider: 'icloud',
      aspectRatio: '16:9',
      resolution: isVideo ? classifyResolution('FHD') : null,
      duration: isVideo ? '00:00' : null,
      isAlpha: false
    });
  });

  project.cloudProvider = 'icloud';
  project.driveFolderName = folderName;
  project.folders = folders;
  project.videos = videos;
  project.lastSyncedAt = new Date().toISOString();

  const isLoose = Boolean(videos.length === 1 || isLinkAFile(rawUrl));
  if (isLoose) {
    project.isFile = true;
    project.isIsolatedFile = true;
    if (videos[0]) {
      project.fileType = videos[0].type || 'file';
      project.fileExt = (videos[0].fileName || folderName || '').split('.').pop() || '';
    }
  }

  return {
    source: 'icloud',
    resolvedFolder: project.driveFolderName,
    detected: videos.length,
    foldersCount: folders.length,
    isFile: isLoose
  };
}

// =============================================================================
// Streaming Proxy with HTTP Range Requests Support
// =============================================================================

async function streamCloudFile(req, res, userDb, project, fileItem, options = {}) {
  const provider = fileItem.cloudProvider || (project && project.cloudProvider) || 'dropbox';
  const rangeHeader = req.headers.range;

  let streamUrl = null;
  let customHeaders = {};

  if (provider === 'dropbox') {
    const account = findAccountForProvider(userDb, 'dropbox');
    const token = account ? account.token : null;

    if (token && fileItem.cloudPath) {
      // Get temporary link from Dropbox API
      const r = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path: fileItem.cloudPath })
      });
      const data = await r.json().catch(() => ({}));
      if (data && data.link) {
        streamUrl = data.link;
      }
    }

    if (!streamUrl && fileItem.cloudSharedUrl) {
      // Direct raw link from Dropbox
      streamUrl = fileItem.cloudSharedUrl.replace(/[?&]dl=[01]/g, '') + '?raw=1';
    }
  } else if (provider === 'onedrive') {
    streamUrl = fileItem.directDownloadUrl;
    if (!streamUrl && fileItem.cloudFileId) {
      const account = findAccountForProvider(userDb, 'onedrive');
      if (account && account.token) {
        customHeaders['Authorization'] = `Bearer ${account.token}`;
        streamUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${fileItem.cloudFileId}/content`;
      }
    }
  } else if (provider === 'box') {
    const account = findAccountForProvider(userDb, 'box');
    if (account && account.token && fileItem.cloudFileId) {
      customHeaders['Authorization'] = `Bearer ${account.token}`;
      streamUrl = `https://api.box.com/2.0/files/${fileItem.cloudFileId}/content`;
    }
  } else if (provider === 'icloud') {
    streamUrl = fileItem.directDownloadUrl || req.query.url;
  }

  if (!streamUrl) {
    return res.status(404).send('Arquivo em nuvem indisponível para transmissão');
  }

  // Forward range request to cloud source
  const fetchHeaders = { ...customHeaders };
  if (rangeHeader) {
    fetchHeaders['Range'] = rangeHeader;
  }

  try {
    const remoteRes = await fetch(streamUrl, {
      method: 'GET',
      headers: fetchHeaders
    });

    const status = remoteRes.status;
    const contentType = fileItem.mimeType || remoteRes.headers.get('content-type') || 'application/octet-stream';
    const contentLength = remoteRes.headers.get('content-length');
    const contentRange = remoteRes.headers.get('content-range');

    res.status(status);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');

    if (contentLength) res.setHeader('Content-Length', contentLength);
    if (contentRange) res.setHeader('Content-Range', contentRange);

    if (options.download) {
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileItem.fileName || 'arquivo')}"`);
    }

    if (remoteRes.body) {
      const { Readable } = require('stream');
      Readable.fromWeb(remoteRes.body).pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    console.error('Erro no streaming multi-cloud:', err);
    if (!res.headersSent) res.status(502).send('Erro ao transmitir arquivo da nuvem');
    else res.destroy();
  }
}

// =============================================================================
// File Upload & Comment Attachment for Multi-Cloud
// =============================================================================

async function uploadFileToCloud(userDb, project, targetFolderId, localFilePath, originalFileName, mimeType) {
  const provider = project.cloudProvider || 'dropbox';

  if (provider === 'dropbox') {
    const account = findAccountForProvider(userDb, 'dropbox');
    if (!account || !account.token) {
      throw new Error('Conta do Dropbox não conectada para upload. Acesse "+ Conta" para autorizar.');
    }

    const targetFolder = (project.folders || []).find(f => f.id === targetFolderId);
    const folderPath = targetFolder ? `/${targetFolder.path}` : '';
    const dropboxPath = `${folderPath}/${originalFileName}`;

    const fileContent = fs.readFileSync(localFilePath);

    const res = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${account.token}`,
        'Dropbox-API-Arg': JSON.stringify({
          path: dropboxPath,
          mode: 'add',
          autorename: true,
          mute: false
        }),
        'Content-Type': 'application/octet-stream'
      },
      body: fileContent
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error((json && json.error_summary) || 'Falha no envio para o Dropbox');
    }

    const type = classifyMediaType(json.name);
    return {
      id: `file-dbx-${Buffer.from(json.path_lower || json.path_display).toString('base64').replace(/=/g, '').slice(0, 18)}`,
      type,
      title: json.name.replace(/\.[^.]+$/, '') || json.name,
      fileName: json.name,
      mimeType: normalizeMimeType(json.name, mimeType),
      size: formatSize(json.size),
      sizeBytes: json.size,
      folderId: targetFolderId,
      folderPath: targetFolder ? targetFolder.path : '',
      url: `/api/stream/cloud?provider=dropbox&fileId=${encodeURIComponent(json.id)}&proj=${encodeURIComponent(project.id)}`,
      cloudProvider: 'dropbox',
      cloudPath: json.path_lower || json.path_display
    };
  }

  throw new Error(`Upload direto ainda não configurado para o provedor ${provider}. Conecte a conta correspondente.`);
}

async function uploadCommentImageToCloud(userDb, project, localFilePath, originalFileName, mimeType) {
  const provider = project.cloudProvider || 'dropbox';
  const account = findAccountForProvider(userDb, provider);

  if (!account || !account.token) {
    // If provider account not directly authenticated, fall back to Google Drive vault
    const driveApi = require('./drive');
    const rootFolderId = project.driveFolderId || (userDb && userDb.driveTokens ? 'root' : null);
    if (rootFolderId && userDb && userDb.driveTokens) {
      const zommentsFolder = await driveApi.getOrCreateZommentsFolder(userDb, rootFolderId);
      const existingFiles = await driveApi.listFilesInFolder(userDb, zommentsFolder.id);
      const existingNames = existingFiles.map(f => f.name);
      const finalFileName = driveApi.resolveUniqueFileName(existingNames, originalFileName);
      const uploadedItem = await driveApi.uploadFileToFolder(userDb, zommentsFolder.id, localFilePath, finalFileName, mimeType);
      return {
        name: finalFileName,
        originalName: originalFileName,
        driveFileId: uploadedItem.id,
        driveFolderId: zommentsFolder.id,
        mimeType,
        size: fs.statSync(localFilePath).size,
        url: `/api/comments/attachment/${uploadedItem.id}?project=${encodeURIComponent(project.id)}`
      };
    }
  }

  // Upload to provider's Zomments folder
  return await uploadFileToCloud(userDb, project, null, localFilePath, originalFileName, mimeType);
}

module.exports = {
  detectProvider,
  isLinkAFile,
  getProviderLabel,
  getProviderColor,
  getProviderIconSvg,
  getConnectedAccounts,
  getAccountById,
  findAccountForProvider,
  addConnectedAccount,
  removeConnectedAccount,
  mirrorProject,
  streamCloudFile,
  uploadFileToCloud,
  uploadCommentImageToCloud
};

