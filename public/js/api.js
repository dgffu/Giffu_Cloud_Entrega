// API Client for Giffú Entrega

const API = {
  async getData() {
    let slug = null;
    let code = null;
    const parts = window.location.pathname.split('/').filter(Boolean);
    const searchParams = new URLSearchParams(window.location.search);
    const reserved = new Set(['author', 'api', 'assets', 'css', 'js', 'privacidade', 'privacy', 'termos', 'terms']);

    if (parts[0] === 'entrega' && parts[1]) {
      if (/^[a-z0-9]{6,12}$/i.test(parts[1])) {
        code = parts[1].toLowerCase();
      } else {
        slug = parts[1];
      }
    } else if (/^\d{4}$/.test(parts[0]) && parts[1]) {
      slug = parts[1];
    } else if (parts[0] && !reserved.has(parts[0].toLowerCase())) {
      code = parts[0];
    }

    const params = new URLSearchParams();
    if (window.APP && window.APP._overrideDataCode) {
      params.set('code', window.APP._overrideDataCode);
    } else if (code) {
      params.set('code', code);
    } else if (slug) {
      params.set('slug', slug);
    } else if (searchParams.get('project')) {
      params.set('project', searchParams.get('project'));
      if (searchParams.get('folder') || searchParams.get('pasta')) {
        params.set('folder', searchParams.get('folder') || searchParams.get('pasta'));
      }
      if (searchParams.get('video')) {
        params.set('video', searchParams.get('video'));
      }
    }

    const qs = params.toString();
    const url = qs ? `/api/data?${qs}` : '/api/data';

    const headers = {};
    try {
      const knownKey = code || slug || searchParams.get('project');
      const passMap = window.APP && window.APP.unlockedPasswords;
      if (knownKey && passMap && passMap[knownKey]) {
        headers['x-project-password'] = passMap[knownKey];
      }
    } catch (e) {}

    const res = await fetch(url, {
      credentials: 'same-origin',
      headers
    });
    if (!res.ok) throw new Error('Falha ao carregar dados');
    return await res.json();
  },

  async createCategory(name, color = null) {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao criar categoria');
    }
    return await res.json();
  },

  async renameCategory(id, name) {
    const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao renomear categoria');
    }
    return await res.json();
  },

  async setCategoryColor(id, color) {
    const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ color })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao atualizar cor da categoria');
    }
    return await res.json();
  },

  async deleteCategory(id) {
    const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao remover categoria');
    }
    return await res.json();
  },

  async getDivisions() {
    const res = await fetch('/api/divisions');
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao carregar divisões');
    }
    return await res.json();
  },

  async createDivision(name, category, parentId = null) {
    const res = await fetch('/api/divisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category, parentId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao criar divisão');
    }
    return await res.json();
  },

  async updateDivision(id, data) {
    const res = await fetch(`/api/divisions/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao atualizar divisão');
    }
    return await res.json();
  },

  async deleteDivision(id) {
    const res = await fetch(`/api/divisions/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao remover divisão');
    }
    return await res.json();
  },

  async updateProjectDivision(projectId, divisionId) {
    const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/division`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ divisionId })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao mover projeto para divisão');
    }
    return await res.json();
  },

  async createProject(projectData) {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao criar projeto');
    }
    return await res.json();
  },

  async updateProject(id, projectData) {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao atualizar projeto');
    }
    return await res.json();
  },

  async updateProjectCategory(id, category) {
    const res = await fetch(`/api/projects/${id}/category`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao alterar categoria');
    }
    return await res.json();
  },

  async archiveProject(id) {
    const res = await fetch(`/api/projects/${id}/archive`, { method: 'POST' });
    if (!res.ok) throw new Error('Erro ao arquivar projeto');
    return await res.json();
  },

  async unarchiveProject(id) {
    const res = await fetch(`/api/projects/${id}/unarchive`, { method: 'POST' });
    if (!res.ok) throw new Error('Erro ao restaurar projeto');
    return await res.json();
  },

  async deleteProject(id, deleteFromDrive = false) {
    const res = await fetch(`/api/projects/${encodeURIComponent(id)}${deleteFromDrive ? '?deleteFromDrive=true' : ''}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao excluir projeto');
    return await res.json();
  },

  async addVideo(projectId, videoData) {
    const res = await fetch(`/api/projects/${projectId}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(videoData)
    });
    if (!res.ok) throw new Error('Erro ao adicionar vídeo');
    return await res.json();
  },

  async deleteVideo(projectId, videoId, deleteFromDrive = false) {
    const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/videos/${encodeURIComponent(videoId)}${deleteFromDrive ? '?deleteFromDrive=true' : ''}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao remover vídeo');
    return await res.json();
  },

  async deleteFolder(projectId, folderId, deleteFromDrive = false) {
    const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/folders/${encodeURIComponent(folderId)}${deleteFromDrive ? '?deleteFromDrive=true' : ''}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao remover pasta');
    return await res.json();
  },

  async setFolderComments(projectId, folderId, allowComments, name = null, hideBrandName = undefined, allowShare = undefined, color = undefined, password = undefined) {
    const body = { allowComments, name, hideBrandName, allowShare };
    if (color !== undefined) body.color = color;
    if (password !== undefined) body.password = password;
    const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/folders/${encodeURIComponent(folderId)}/comments`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao atualizar configurações da pasta');
    }
    return await res.json();
  },

  async setVideoComments(projectId, videoId, allowComments, title = null, hideBrandName = undefined, allowShare = undefined, color = undefined, password = undefined) {
    const body = { allowComments, title, hideBrandName, allowShare };
    if (color !== undefined) body.color = color;
    if (password !== undefined) body.password = password;
    const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/videos/${encodeURIComponent(videoId)}/comments`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao atualizar configurações do arquivo');
    }
    return await res.json();
  },

  async setVideoCover(projectId, videoId, imageBase64) {
    const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/videos/${encodeURIComponent(videoId)}/cover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao definir capa do vídeo');
    }
    return await res.json();
  },

  async resetVideoCover(projectId, videoId) {
    const res = await fetch(`/api/projects/${encodeURIComponent(projectId)}/videos/${encodeURIComponent(videoId)}/cover`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erro ao redefinir capa do vídeo');
    }
    return await res.json();
  },

  async verifyPassword(projectOrSlug, password) {
    const payload = (projectOrSlug && typeof projectOrSlug === 'object')
      ? {
          projectId: projectOrSlug.projectId || projectOrSlug.id || null,
          shortCode: projectOrSlug.shortCode || null,
          slug: projectOrSlug.slug || null,
          folderId: projectOrSlug.folderId || null,
          videoId: projectOrSlug.videoId || null,
          password
        }
      : { slug: projectOrSlug, password };
    const res = await fetch('/api/projects/verify-password', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  async addComment(commentData, imageFile = null) {
    if (imageFile) {
      const formData = new FormData();
      for (const [key, val] of Object.entries(commentData)) {
        if (val !== undefined && val !== null) {
          formData.append(key, val);
        }
      }
      formData.append('image', imageFile);
      const res = await fetch('/api/comments', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Erro ao enviar comentário');
      }
      return await res.json();
    } else {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData)
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Erro ao enviar comentário');
      }
      return await res.json();
    }
  },

  async updateComment(commentId, content) {
    const res = await fetch(`/api/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    if (!res.ok) throw new Error('Erro ao editar comentário');
    return await res.json();
  },

  async deleteComment(commentId) {
    const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao excluir comentário');
    return await res.json();
  },

  async toggleResolveComment(commentId, resolved) {
    const res = await fetch(`/api/comments/${commentId}/toggle-resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(typeof resolved === 'boolean' ? { resolved } : {})
    });
    if (!res.ok) throw new Error('Erro ao alterar status do comentário');
    return await res.json();
  },

  async replyComment(commentId, replyData) {
    const res = await fetch(`/api/comments/${commentId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(replyData)
    });
    if (!res.ok) throw new Error('Erro ao responder comentário');
    return await res.json();
  },

  async updateReply(commentId, replyId, content) {
    const res = await fetch(`/api/comments/${commentId}/reply/${replyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    if (!res.ok) throw new Error('Erro ao editar resposta');
    return await res.json();
  },

  async deleteReply(commentId, replyId) {
    const res = await fetch(`/api/comments/${commentId}/reply/${replyId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erro ao excluir resposta');
    return await res.json();
  },

  async getNotifications(params = {}) {
    const q = new URLSearchParams();
    if (params.projectId) q.set('projectId', params.projectId);
    if (params.code) q.set('code', params.code);
    const qs = q.toString() ? `?${q.toString()}` : '';
    const res = await fetch(`/api/notifications${qs}`);
    if (!res.ok) throw new Error('Erro ao carregar notificações');
    return await res.json();
  },

  async syncDrive(projectId, driveLink) {
    const res = await fetch('/api/drive/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, driveLink })
    });
    return await res.json();
  },

  async getSyncQueue() {
    const res = await fetch('/api/sync/queue');
    if (!res.ok) throw new Error('Erro ao obter fila de sincronização');
    return await res.json();
  },

  async saveSettings(settings) {
    const res = await fetch('/api/settings', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao salvar configurações');
    }
    return await res.json();
  },

  uploadFile(projectId, folderId, file, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);
      if (folderId) formData.append('targetFolderId', folderId);

      const url = `/api/projects/${encodeURIComponent(projectId)}/upload${folderId ? `?folder=${encodeURIComponent(folderId)}` : ''}`;

      xhr.open('POST', url, true);

      if (onProgress && xhr.upload) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent, e.loaded, e.total);
          }
        };
      }

      xhr.onload = () => {
        let json = null;
        try { json = JSON.parse(xhr.responseText); } catch (e) {}
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(json);
        } else {
          const errMsg = (json && (json.error || json.message)) || `Erro no upload (status ${xhr.status})`;
          const err = new Error(errMsg);
          if (json && json.code) err.code = json.code;
          reject(err);
        }
      };

      xhr.onerror = () => reject(new Error('Erro de conexão ao enviar arquivo para o servidor'));
      xhr.ontimeout = () => reject(new Error('Tempo limite esgotado no envio do arquivo'));
      xhr.send(formData);
    });
  },

  // Multi-Cloud Accounts Management
  async getAccounts() {
    const res = await fetch('/api/accounts');
    if (!res.ok) throw new Error('Erro ao carregar contas de armazenamento');
    return await res.json();
  },

  async addAccount(accountData) {
    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accountData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao conectar conta');
    }
    return await res.json();
  },

  async removeAccount(accountId) {
    const res = await fetch(`/api/accounts/${encodeURIComponent(accountId)}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao desconectar conta');
    }
    return await res.json();
  }
};

window.API = API;
