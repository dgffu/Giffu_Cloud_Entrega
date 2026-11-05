// Comments System for Giffú Entrega
// Supports Google Account Authentication, timecode pinned comments, and replies

class CommentsController {
  constructor(containerElement, project, video, playerInstance, options = {}) {
    this.container = containerElement;
    this.project = project;
    this.video = video;
    this.player = playerInstance;
    this.options = options || {};
    this.comments = [];
    this.currentUser = this.loadCurrentUser();
    this.currentTime = 0;
    this.pendingAttachment = null;

    this.init();
  }

  loadCurrentUser() {
    return (window.Auth && window.Auth.user) || null;
  }

  setCurrentUser(user) {
    this.currentUser = user;
    this.render();
  }

  updateVideoTime(currentTime) {
    this.currentTime = currentTime;
    const pill = this.container.querySelector('#currentTimePill');
    if (pill) {
      pill.textContent = this.formatTime(currentTime);
    }
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  formatFileSize(bytes) {
    const b = Number(bytes) || 0;
    if (b >= 1048576) return `${(b / 1048576).toFixed(1)} MB`;
    if (b >= 1024) return `${(b / 1024).toFixed(0)} KB`;
    return `${b} B`;
  }

  setPendingAttachment(file) {
    if (!file) return;
    if (this.pendingAttachment && this.pendingAttachment.previewUrl) {
      try { URL.revokeObjectURL(this.pendingAttachment.previewUrl); } catch (e) {}
    }
    const previewUrl = URL.createObjectURL(file);
    this.pendingAttachment = {
      file,
      previewUrl,
      name: file.name,
      size: file.size
    };
    const bar = this.container.querySelector('#commentAttachmentPreview');
    if (bar) {
      bar.style.display = 'flex';
      const thumb = bar.querySelector('#commentAttachmentThumb');
      if (thumb) thumb.src = previewUrl;
      const nameEl = bar.querySelector('#commentAttachmentName');
      if (nameEl) nameEl.textContent = file.name;
      const sizeEl = bar.querySelector('#commentAttachmentSize');
      if (sizeEl) sizeEl.textContent = this.formatFileSize(file.size);
    }
  }

  clearPendingAttachment() {
    if (this.pendingAttachment && this.pendingAttachment.previewUrl) {
      try { URL.revokeObjectURL(this.pendingAttachment.previewUrl); } catch (e) {}
    }
    this.pendingAttachment = null;
    const bar = this.container.querySelector('#commentAttachmentPreview');
    if (bar) {
      bar.style.display = 'none';
      const thumb = bar.querySelector('#commentAttachmentThumb');
      if (thumb) thumb.src = '';
    }
    const input = this.container.querySelector('#inputCommentPicture');
    if (input) input.value = '';
  }

  openImageLightbox(imageUrl, imageName) {
    let lb = document.getElementById('commentImageLightboxModal');
    if (!lb) {
      lb = document.createElement('div');
      lb.id = 'commentImageLightboxModal';
      lb.className = 'comment-lightbox-backdrop';
      lb.innerHTML = `
        <div class="comment-lightbox-dialog">
          <div class="comment-lightbox-header">
            <span class="comment-lightbox-title" id="commentLightboxTitle"></span>
            <div class="comment-lightbox-actions">
              <a class="comment-lightbox-download" id="commentLightboxDownload" download target="_blank" title="Abrir imagem original">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </a>
              <button class="comment-lightbox-close" id="commentLightboxClose" title="Fechar (Esc)">&times;</button>
            </div>
          </div>
          <div class="comment-lightbox-body">
            <img id="commentLightboxImg" src="" alt="Imagem ampliada">
          </div>
        </div>
      `;
      document.body.appendChild(lb);

      const closeLb = () => lb.classList.remove('open');
      lb.querySelector('#commentLightboxClose')?.addEventListener('click', closeLb);
      lb.addEventListener('click', (e) => {
        if (e.target === lb) closeLb();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lb.classList.contains('open')) closeLb();
      });
    }

    const titleEl = lb.querySelector('#commentLightboxTitle');
    const imgEl = lb.querySelector('#commentLightboxImg');
    const dlEl = lb.querySelector('#commentLightboxDownload');
    if (titleEl) titleEl.textContent = imageName || 'Imagem do comentário';
    if (imgEl) imgEl.src = imageUrl;
    if (dlEl) dlEl.href = imageUrl;
    lb.classList.add('open');
  }

  openAnnotationStudio() {
    const isImage = this.video && this.video.type === 'image';
    let mediaEl = null;
    let currentTime = this.currentTime || 0;

    if (isImage) {
      mediaEl = document.getElementById('mainPhotoElement') || document.querySelector('.custom-image-element');
      if (!mediaEl) {
        if (window.showToast) window.showToast('Foto não encontrada na tela.');
        return;
      }
    } else {
      // Video
      if (this.player && this.player.video) {
        mediaEl = this.player.video;
        currentTime = typeof this.player.video.currentTime === 'number' ? this.player.video.currentTime : (this.currentTime || 0);
        try {
          if (!this.player.video.paused) {
            this.player.video.pause();
          }
        } catch (e) {}
      } else {
        mediaEl = document.querySelector('video.custom-video-element');
        if (mediaEl) {
          currentTime = typeof mediaEl.currentTime === 'number' ? mediaEl.currentTime : (this.currentTime || 0);
          try {
            if (!mediaEl.paused) mediaEl.pause();
          } catch (e) {}
        }
      }

      if (!mediaEl) {
        if (window.showToast) window.showToast('Vídeo não carregado para marcação de frame.');
        return;
      }
    }

    if (!window.FrameAnnotationStudio) {
      if (window.showToast) window.showToast('Módulo de anotação na tela não carregado.');
      return;
    }

    window.FrameAnnotationStudio.open({
      mediaElement: mediaEl,
      isImage,
      currentTime,
      videoTitle: (this.video && this.video.title) || 'Mídia',
      onComplete: (file, capturedTime) => {
        this.setPendingAttachment(file);
        if (!isImage && typeof capturedTime === 'number') {
          this.updateVideoTime(capturedTime);
          const cb = this.container.querySelector('#checkIncludeTimecode');
          if (cb) cb.checked = true;
        }
        if (window.app && typeof window.app.setCommentsVisibility === 'function') {
          window.app.setCommentsVisibility(true);
        }
        const ta = this.container.querySelector('#mainCommentText');
        if (ta) {
          ta.focus();
        }
        if (window.showToast) window.showToast('Marcação anexada ao comentário! Digite sua mensagem.');
      }
    });
  }

  async loadComments() {
    try {
      const data = await window.API.getData();
      if (window.app && window.app.data) {
        window.app.data.comments = data.comments || [];
      }
      this.comments = (data.comments || []).filter(c => c.videoId === this.video.id);
      this.render();
      if (this.options && typeof this.options.onCommentsUpdated === 'function') {
        this.options.onCommentsUpdated(data.comments || []);
      }
    } catch (e) {
      console.error('Error loading comments:', e);
    }
  }

  async init() {
    await this.loadComments();
  }

  setVideo(newVideo) {
    this.video = newVideo;
    this.loadComments();
  }

  isProjectAuthor() {
    if (!this.currentUser) return false;
    const appData = (window.app && window.app.data) || {};
    const ownerUser = appData.user || null;
    if (ownerUser && (ownerUser.id || ownerUser.email)) {
      if (ownerUser.id && this.currentUser.id && ownerUser.id === this.currentUser.id) return true;
      if (ownerUser.email && this.currentUser.email && String(ownerUser.email).trim().toLowerCase() === String(this.currentUser.email).trim().toLowerCase()) return true;
      return false;
    }
    return Boolean(window.app && !window.app.isClientMode && this.currentUser.isAuthor);
  }

  isCommentsAllowed() {
    if (this.options && typeof this.options.isCommentsAllowed === 'boolean') {
      return this.options.isCommentsAllowed;
    }
    if (window.app && typeof window.app.isCommentsAllowedForVideo === 'function') {
      return window.app.isCommentsAllowedForVideo(this.video, this.project);
    }
    return this.project && this.project.allowComments !== false;
  }

  render() {
    const isAllowed = this.isCommentsAllowed();
    const isAuthor = this.isProjectAuthor();

    if (!isAllowed && !isAuthor) {
      this.container.innerHTML = `
        <div class="comments-panel-header">
          <div class="comments-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>
            Comentários
          </div>
          <button class="btn-close-comments-panel" id="btnCloseCommentsPanel" title="Ocultar comentários">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>
        <div class="comments-disabled-notice">
          <p>O espaço para comentários foi desativado pelo autor para este item.</p>
        </div>
      `;
      this.container.querySelector('#btnCloseCommentsPanel')?.addEventListener('click', () => {
        if (this.options && typeof this.options.onClose === 'function') this.options.onClose();
      });
      return;
    }

    const commentsCount = this.comments.reduce((acc, c) => acc + 1 + (c.replies ? c.replies.length : 0), 0);
    const unresolvedCount = this.comments.filter(c => !c.resolved).length;
    if (this.options && typeof this.options.onCountChange === 'function') {
      this.options.onCountChange(commentsCount, unresolvedCount);
    }

    this.container.innerHTML = `
      <div class="comments-panel-header">
        <div class="comments-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>
          Comentários
          <span class="comments-count-badge ${unresolvedCount > 0 ? 'has-unresolved' : ''}">${unresolvedCount > 0 ? unresolvedCount : commentsCount}</span>
        </div>
        <button class="btn-close-comments-panel" id="btnCloseCommentsPanel" title="Ocultar comentários (expandir player)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>

      <!-- Google Auth Status Bar -->
      ${this.renderAuthSection()}

      ${!isAllowed && isAuthor ? `
        <div class="comments-disabled-author-pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          <span>Comentários desativados para clientes neste item</span>
        </div>
      ` : ''}

      <!-- Comments List -->
      <div class="comments-list" id="commentsList">
        ${this.renderCommentsList()}
      </div>

      <!-- Comment Input Area -->
      ${this.renderInputArea()}
    `;

    this.bindEvents();
  }

  renderAuthSection() {
    if (!this.currentUser) {
      return `
        <div class="comments-auth-banner">
          <button class="btn-google-login" id="btnGoogleAuthPrompt">
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
            Entrar com Google para Comentar
          </button>
        </div>
      `;
    }

    const isProjectAuthor = this.isProjectAuthor();
    return `
      <div class="logged-user-bar">
        <div class="logged-user-info">
          <img class="logged-avatar" src="${this.currentUser.avatar || '/assets/default-avatar.svg'}" alt="" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='/assets/default-avatar.svg';">
          <span class="logged-name">${this.currentUser.name} ${isProjectAuthor ? '(Autor)' : ''}</span>
        </div>
        <button class="btn-auth-switch" id="btnSwitchAccount" title="Trocar conta">Trocar</button>
      </div>
    `;
  }

  renderCommentsList() {
    if (this.comments.length === 0) {
      const isImage = this.video && this.video.type === 'image';
      return `
        <div class="comment-empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <p>${isImage ? 'Nenhum comentário ainda.<br>Deixe sua observação ou feedback sobre esta foto!' : 'Nenhum comentário ainda.<br>Clique no player e comente com marcação de tempo!'}</p>
        </div>
      `;
    }

    const isProjectAuthor = this.isProjectAuthor();

    return this.comments.map(c => {
      const canModifyComment = this.currentUser && (
        isProjectAuthor || 
        (this.currentUser.email && c.authorEmail && String(this.currentUser.email).toLowerCase() === String(c.authorEmail).toLowerCase())
      );

      const isResolved = Boolean(c.resolved);

      return `
      <div class="comment-item ${isResolved ? 'is-resolved' : ''}" data-id="${c.id}">
        <div class="comment-header">
          <div class="comment-author-info">
            <img class="comment-avatar" src="${c.authorAvatar || '/assets/default-avatar.svg'}" alt="" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='/assets/default-avatar.svg';">
            <span class="comment-author-name">${c.authorName}</span>
            ${c.isAuthor ? '<span class="badge-role-author">Autor</span>' : ''}
          </div>
          ${this.video && this.video.type === 'image' ? '' : `
            <button class="comment-timecode-badge" data-timecode="${c.timecode}" title="Pular para este momento no vídeo">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.48 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/></svg>
              ${c.timecodeFormatted || this.formatTime(c.timecode)}
            </button>
          `}
        </div>

        ${c.content ? `<div class="comment-body-text" id="commentText-${c.id}">${this.formatContentWithMentions(c.content)}</div>` : ''}

        ${c.image ? `
          <div class="comment-image-wrapper">
            <div class="comment-image-card" data-img-url="${c.image.url}" title="Clique para ampliar">
              <img src="${c.image.url}" alt="${this.escapeHTML(c.image.name || 'Imagem')}" class="comment-attached-img" loading="lazy" onerror="this.closest('.comment-image-card').classList.add('is-unavailable');" />
              <div class="comment-image-unavailable">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                  <line x1="2" y1="2" x2="22" y2="22" stroke="var(--brand-orange, #ff6600)" stroke-width="2.2"/>
                </svg>
                <span class="unavailable-title">Unavailable Picture</span>
                <span class="unavailable-desc">A pasta ou imagem foi excluída no Google Drive</span>
              </div>
            </div>
            <div class="comment-image-info-bar">
              <span class="comment-image-name" title="${this.escapeHTML(c.image.name || '')}">${this.escapeHTML(c.image.name || '')}</span>
            </div>
          </div>
        ` : ''}

        <!-- Inline Comment Edit Form -->
        <div class="comment-edit-form" id="editCommentForm-${c.id}" style="display: none; position: relative;">
          <textarea class="comment-textarea edit-comment-textarea" style="height: 56px;">${this.escapeHTML(c.content)}</textarea>
          <div class="comment-edit-actions">
            <button class="btn-secondary btn-cancel-edit-comment" style="padding: 4px 8px; font-size: 11px;" data-comment-id="${c.id}">Cancelar</button>
            <button class="btn-primary btn-save-edit-comment" style="padding: 4px 10px; font-size: 11px;" data-comment-id="${c.id}">Salvar</button>
          </div>
        </div>

        <div class="comment-footer">
          <span>${this.formatDate(c.createdAt)}</span>
          <div class="comment-actions-group">
            ${isProjectAuthor ? `
              <button class="btn-resolve-comment ${isResolved ? 'is-resolved' : ''}" data-comment-id="${c.id}" title="${isResolved ? 'Comentário resolvido (clique para reabrir)' : 'Marcar como resolvido'}" aria-label="${isResolved ? 'Resolvido' : 'Marcar como resolvido'}">
                ${isResolved ? `
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#10b981"/>
                    <polyline points="8 12 11 15 16 9" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                ` : `
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="9.5"/>
                    <polyline points="8 12 11 15 16 9"/>
                  </svg>
                `}
              </button>
            ` : (isResolved ? `
              <span class="badge-comment-resolved-client" title="Comentário concluído pelo autor">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#10b981"/>
                  <polyline points="8 12 11 15 16 9" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Concluído
              </span>
            ` : '')}
            <button class="btn-reply-toggle" data-comment-id="${c.id}">Responder</button>
            ${canModifyComment ? `
              <button class="comment-action-link btn-edit-comment" data-comment-id="${c.id}">Editar</button>
              <button class="comment-action-link danger btn-delete-comment" data-comment-id="${c.id}">Excluir</button>
            ` : ''}
          </div>
        </div>

        <!-- Reply Form (Hidden by default) -->
        <div class="reply-form-wrapper" id="replyForm-${c.id}" style="display: none; margin-top: 8px; position: relative;">
          <textarea class="comment-textarea" style="height: 48px;" placeholder="Escreva uma resposta... (use @ para mencionar)"></textarea>
          <div style="display: flex; justify-content: flex-end; gap: 6px; margin-top: 6px;">
            <button class="btn-secondary" style="padding: 4px 8px; font-size: 11px;" onclick="document.getElementById('replyForm-${c.id}').style.display='none'">Cancelar</button>
            <button class="btn-primary btn-submit-reply" style="padding: 4px 10px; font-size: 11px;" data-comment-id="${c.id}">Enviar Resposta</button>
          </div>
        </div>

        <!-- Replies List -->
        ${c.replies && c.replies.length > 0 ? `
          <div class="comment-replies-list">
            ${c.replies.map(r => {
              const canModifyReply = this.currentUser && (
                isProjectAuthor || 
                (this.currentUser.email && r.authorEmail && String(this.currentUser.email).toLowerCase() === String(r.authorEmail).toLowerCase())
              );
              return `
              <div class="reply-item" data-reply-id="${r.id}">
                <div class="reply-header">
                  <img class="reply-avatar" src="${r.authorAvatar || '/assets/default-avatar.svg'}" alt="" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='/assets/default-avatar.svg';">
                  <span class="reply-author">${r.authorName} ${r.isAuthor ? '<span class="badge-role-author">Autor</span>' : ''}</span>
                </div>
                <div class="reply-text" id="replyText-${r.id}">${this.formatContentWithMentions(r.content)}</div>

                <!-- Inline Reply Edit Form -->
                <div class="comment-edit-form" id="editReplyForm-${r.id}" style="display: none; margin-top: 6px; position: relative;">
                  <textarea class="comment-textarea edit-reply-textarea" style="height: 48px;">${this.escapeHTML(r.content)}</textarea>
                  <div class="comment-edit-actions">
                    <button class="btn-secondary btn-cancel-edit-reply" style="padding: 4px 8px; font-size: 11px;" data-reply-id="${r.id}">Cancelar</button>
                    <button class="btn-primary btn-save-edit-reply" style="padding: 4px 10px; font-size: 11px;" data-comment-id="${c.id}" data-reply-id="${r.id}">Salvar</button>
                  </div>
                </div>

                <div class="reply-footer">
                  <span>${this.formatDate(r.createdAt)}</span>
                  ${canModifyReply ? `
                    <div class="comment-actions-group">
                      <button class="comment-action-link btn-edit-reply" data-reply-id="${r.id}">Editar</button>
                      <button class="comment-action-link danger btn-delete-reply" data-comment-id="${c.id}" data-reply-id="${r.id}">Excluir</button>
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
            }).join('')}
          </div>
        ` : ''}
      </div>
    `;
    }).join('');
  }

  renderInputArea() {
    const isImage = this.video && this.video.type === 'image';
    const isAudio = this.video && this.video.type === 'audio';
    const formattedCurrentTime = this.formatTime(this.currentTime);

    return `
      <div class="comments-input-area" id="commentsInputArea" style="position: relative;">
        <!-- Preview bar do anexo de imagem -->
        <div class="comment-attachment-preview-bar" id="commentAttachmentPreview" style="display: ${this.pendingAttachment ? 'flex' : 'none'};">
          <div class="comment-attachment-thumb-wrap">
            <img id="commentAttachmentThumb" src="${this.pendingAttachment ? this.pendingAttachment.previewUrl : ''}" alt="Anexo">
          </div>
          <div class="comment-attachment-info">
            <span class="comment-attachment-name" id="commentAttachmentName">${this.escapeHTML(this.pendingAttachment ? this.pendingAttachment.name : '')}</span>
            <span class="comment-attachment-size" id="commentAttachmentSize">${this.pendingAttachment ? this.formatFileSize(this.pendingAttachment.size) : ''}</span>
          </div>
          <button type="button" class="btn-remove-attachment" id="btnRemoveAttachment" title="Remover imagem">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div class="comment-input-row">
          <div class="comment-input-left-tools">
            <!-- Ícone de "Picture" do lado esquerdo da box de digitar mensagem -->
            <button type="button" class="btn-comment-picture" id="btnAttachPicture" title="Anexar imagem (ou arraste e solte)">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </button>
            <input type="file" id="inputCommentPicture" accept="image/*" style="display: none;">

            <!-- Fazer marcação na tela (Frame do vídeo ou Foto) -->
            ${!isAudio ? `
              <button type="button" class="btn-comment-picture btn-comment-markup" id="btnMarkupFrame" title="${isImage ? 'Desenhar marcação nesta foto' : 'Fazer marcação no frame atual do vídeo'}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </button>
            ` : ''}
          </div>

          <div class="comment-textarea-wrap" id="commentTextareaWrap">
            <textarea class="comment-textarea" id="mainCommentText" placeholder="${isImage ? 'Escreva uma observação sobre esta foto... (use @ para mencionar)' : 'Escreva uma observação ou comentário... (use @ para mencionar)'}"></textarea>
            <!-- Overlay visual para arrastar e soltar na barra de mensagem -->
            <div class="comment-drag-overlay" id="commentDragOverlay">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>Solte a imagem aqui para anexar</span>
            </div>
          </div>
        </div>

        <div class="comment-input-controls">
          ${!isImage ? `
            <label class="timecode-checkbox-label">
              <input type="checkbox" id="checkIncludeTimecode" checked>
              <span>Marcar no tempo: <strong class="current-time-pill" id="currentTimePill">${formattedCurrentTime}</strong></span>
            </label>
          ` : `<div></div>`}
          <button class="btn-send-comment" id="btnSubmitComment">Comentar</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Close / hide comments panel button
    const btnClose = this.container.querySelector('#btnCloseCommentsPanel');
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        if (this.options && typeof this.options.onClose === 'function') {
          this.options.onClose();
        }
      });
    }

    // Google Auth prompt button
    const btnGoogle = this.container.querySelector('#btnGoogleAuthPrompt');
    if (btnGoogle) {
      btnGoogle.addEventListener('click', () => {
        this.openGoogleLoginModal();
      });
    }

    // Switch account
    const btnSwitch = this.container.querySelector('#btnSwitchAccount');
    if (btnSwitch) {
      btnSwitch.addEventListener('click', () => {
        this.openGoogleLoginModal(true);
      });
    }

    // Click timecode to seek video
    const timecodeBadges = this.container.querySelectorAll('.comment-timecode-badge');
    timecodeBadges.forEach(badge => {
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        const time = parseFloat(badge.getAttribute('data-timecode'));
        if (this.player && !isNaN(time)) {
          this.player.seekTo(time);
          window.showToast(`Vídeo posicionado em ${badge.textContent.trim()}`);
        }
      });
    });

    // Toggle resolve comment
    const resolveButtons = this.container.querySelectorAll('.btn-resolve-comment');
    resolveButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const commentId = btn.getAttribute('data-comment-id');
        if (!this.currentUser) {
          this.openGoogleLoginModal();
          return;
        }

        if (!this.isProjectAuthor()) {
          alert('Apenas o autor deste projeto pode marcar comentários como concluídos.');
          return;
        }

        try {
          btn.disabled = true;
          const updated = await window.API.toggleResolveComment(commentId);
          await this.loadComments();
          if (window.app && window.app.notificationsManager) {
            window.app.notificationsManager.handleCommentResolved(commentId, updated.resolved);
          }
          window.showToast(updated.resolved ? 'Comentário marcado como resolvido ✓' : 'Comentário reaberto');
        } catch (err) {
          alert('Erro ao alterar status do comentário');
        } finally {
          btn.disabled = false;
        }
      });
    });

    // Toggle reply forms
    const replyButtons = this.container.querySelectorAll('.btn-reply-toggle');
    replyButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const commentId = btn.getAttribute('data-comment-id');
        const form = document.getElementById(`replyForm-${commentId}`);
        if (form) {
          form.style.display = form.style.display === 'none' ? 'block' : 'none';
          if (form.style.display === 'block') {
            form.querySelector('textarea').focus();
          }
        }
      });
    });

    // Edit Comment - toggle form
    const editCommentButtons = this.container.querySelectorAll('.btn-edit-comment');
    editCommentButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const commentId = btn.getAttribute('data-comment-id');
        const form = document.getElementById(`editCommentForm-${commentId}`);
        const textEl = document.getElementById(`commentText-${commentId}`);
        if (form) {
          const isHidden = form.style.display === 'none';
          form.style.display = isHidden ? 'flex' : 'none';
          if (textEl) textEl.style.display = isHidden ? 'none' : 'block';
          if (isHidden) {
            const ta = form.querySelector('textarea');
            if (ta) {
              ta.focus();
              ta.setSelectionRange(ta.value.length, ta.value.length);
            }
          }
        }
      });
    });

    // Cancel Edit Comment
    const cancelEditCommentButtons = this.container.querySelectorAll('.btn-cancel-edit-comment');
    cancelEditCommentButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const commentId = btn.getAttribute('data-comment-id');
        const form = document.getElementById(`editCommentForm-${commentId}`);
        const textEl = document.getElementById(`commentText-${commentId}`);
        if (form) form.style.display = 'none';
        if (textEl) textEl.style.display = 'block';
      });
    });

    // Save Edit Comment
    const saveEditCommentButtons = this.container.querySelectorAll('.btn-save-edit-comment');
    saveEditCommentButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const commentId = btn.getAttribute('data-comment-id');
        const form = document.getElementById(`editCommentForm-${commentId}`);
        const textarea = form ? form.querySelector('textarea') : null;
        const content = textarea ? textarea.value.trim() : '';

        if (!content) {
          alert('O comentário não pode ficar vazio.');
          return;
        }

        try {
          await window.API.updateComment(commentId, content);
          await this.loadComments();
          window.showToast('Comentário atualizado');
        } catch (err) {
          alert('Erro ao atualizar comentário');
        }
      });
    });

    // Delete Comment
    const deleteCommentButtons = this.container.querySelectorAll('.btn-delete-comment');
    deleteCommentButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const commentId = btn.getAttribute('data-comment-id');
        if (!confirm('Deseja excluir este comentário?')) return;

        try {
          await window.API.deleteComment(commentId);
          await this.loadComments();
          if (window.app && window.app.notificationsManager) {
            window.app.notificationsManager.removeComment(commentId);
          }
          window.showToast('Comentário excluído');
        } catch (err) {
          alert('Erro ao excluir comentário');
        }
      });
    });

    // Edit Reply - toggle form
    const editReplyButtons = this.container.querySelectorAll('.btn-edit-reply');
    editReplyButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const replyId = btn.getAttribute('data-reply-id');
        const form = document.getElementById(`editReplyForm-${replyId}`);
        const textEl = document.getElementById(`replyText-${replyId}`);
        if (form) {
          const isHidden = form.style.display === 'none';
          form.style.display = isHidden ? 'flex' : 'none';
          if (textEl) textEl.style.display = isHidden ? 'none' : 'block';
          if (isHidden) {
            const ta = form.querySelector('textarea');
            if (ta) {
              ta.focus();
              ta.setSelectionRange(ta.value.length, ta.value.length);
            }
          }
        }
      });
    });

    // Cancel Edit Reply
    const cancelEditReplyButtons = this.container.querySelectorAll('.btn-cancel-edit-reply');
    cancelEditReplyButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const replyId = btn.getAttribute('data-reply-id');
        const form = document.getElementById(`editReplyForm-${replyId}`);
        const textEl = document.getElementById(`replyText-${replyId}`);
        if (form) form.style.display = 'none';
        if (textEl) textEl.style.display = 'block';
      });
    });

    // Save Edit Reply
    const saveEditReplyButtons = this.container.querySelectorAll('.btn-save-edit-reply');
    saveEditReplyButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const commentId = btn.getAttribute('data-comment-id');
        const replyId = btn.getAttribute('data-reply-id');
        const form = document.getElementById(`editReplyForm-${replyId}`);
        const textarea = form ? form.querySelector('textarea') : null;
        const content = textarea ? textarea.value.trim() : '';

        if (!content) {
          alert('A resposta não pode ficar vazia.');
          return;
        }

        try {
          await window.API.updateReply(commentId, replyId, content);
          await this.loadComments();
          window.showToast('Resposta atualizada');
        } catch (err) {
          alert('Erro ao atualizar resposta');
        }
      });
    });

    // Delete Reply
    const deleteReplyButtons = this.container.querySelectorAll('.btn-delete-reply');
    deleteReplyButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const commentId = btn.getAttribute('data-comment-id');
        const replyId = btn.getAttribute('data-reply-id');
        if (!confirm('Deseja excluir esta resposta?')) return;

        try {
          await window.API.deleteReply(commentId, replyId);
          await this.loadComments();
          window.showToast('Resposta excluída');
        } catch (err) {
          alert('Erro ao excluir resposta');
        }
      });
    });

    // Submit reply
    const submitReplyButtons = this.container.querySelectorAll('.btn-submit-reply');
    submitReplyButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const commentId = btn.getAttribute('data-comment-id');
        const form = document.getElementById(`replyForm-${commentId}`);
        const textarea = form.querySelector('textarea');
        const content = textarea.value.trim();

        if (!content) return;

        if (!this.currentUser) {
          this.openGoogleLoginModal();
          return;
        }

        try {
          await window.API.replyComment(commentId, {
            authorName: this.currentUser.name,
            authorEmail: this.currentUser.email,
            authorAvatar: this.currentUser.avatar,
            isAuthor: this.isProjectAuthor(),
            content
          });
          await this.loadComments();
          if (window.app && window.app.notificationsManager) {
            window.app.notificationsManager.notifyInstantActivity({
              type: 'reply_created',
              commentId,
              videoId: this.video ? this.video.id : null
            });
          }
          window.showToast('Resposta enviada com sucesso');
        } catch (err) {
          alert('Erro ao enviar resposta');
        }
      });
    });

    // Submit main comment
    const btnSubmit = this.container.querySelector('#btnSubmitComment');
    const textarea = this.container.querySelector('#mainCommentText');
    const checkboxTimecode = this.container.querySelector('#checkIncludeTimecode');
    const btnAttach = this.container.querySelector('#btnAttachPicture');
    const inputPicture = this.container.querySelector('#inputCommentPicture');
    const btnRemoveAtt = this.container.querySelector('#btnRemoveAttachment');
    const inputArea = this.container.querySelector('#commentsInputArea');
    const textareaWrap = this.container.querySelector('#commentTextareaWrap');

    // Botão de Picture ao lado esquerdo da caixa de digitação
    if (btnAttach && inputPicture) {
      btnAttach.addEventListener('click', (e) => {
        e.preventDefault();
        inputPicture.click();
      });
      inputPicture.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file && file.type.startsWith('image/')) {
          this.setPendingAttachment(file);
        }
      });
    }

    // Botão de Marcação na tela (Frame do vídeo ou Foto)
    const btnMarkup = this.container.querySelector('#btnMarkupFrame');
    if (btnMarkup) {
      btnMarkup.addEventListener('click', (e) => {
        e.preventDefault();
        this.openAnnotationStudio();
      });
    }

    // Clique no thumbnail de anexo pendente para visualizar
    const thumbPending = this.container.querySelector('#commentAttachmentThumb');
    if (thumbPending) {
      thumbPending.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.pendingAttachment && this.pendingAttachment.previewUrl) {
          this.openImageLightbox(this.pendingAttachment.previewUrl, this.pendingAttachment.name);
        }
      });
    }

    // Remover anexo selecionado
    if (btnRemoveAtt) {
      btnRemoveAtt.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.clearPendingAttachment();
      });
    }

    // Arrastar e soltar imagem na barra de mensagem
    if (inputArea && textareaWrap) {
      ['dragenter', 'dragover'].forEach(eventName => {
        inputArea.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          textareaWrap.classList.add('drag-active');
        });
      });
      ['dragleave', 'dragend'].forEach(eventName => {
        inputArea.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!inputArea.contains(e.relatedTarget)) {
            textareaWrap.classList.remove('drag-active');
          }
        });
      });
      inputArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        textareaWrap.classList.remove('drag-active');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
          if (file) {
            this.setPendingAttachment(file);
          }
        }
      });
    }

    // Colar imagem da área de transferência (Ctrl+V / Cmd+V screenshot)
    if (textarea) {
      textarea.addEventListener('paste', (e) => {
        const items = (e.clipboardData || window.clipboardData)?.items;
        if (items) {
          for (const item of items) {
            if (item.type && item.type.startsWith('image/')) {
              const file = item.getAsFile();
              if (file) {
                this.setPendingAttachment(file);
                break;
              }
            }
          }
        }
      });

      // Atalho Cmd+Enter ou Ctrl+Enter para enviar
      textarea.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
          e.preventDefault();
          btnSubmit?.click();
        }
      });
    }

    if (btnSubmit && textarea) {
      btnSubmit.addEventListener('click', async () => {
        const content = textarea.value.trim();
        if (!content && !this.pendingAttachment) return;

        if (!this.currentUser) {
          this.openGoogleLoginModal();
          return;
        }

        const isImage = this.video && this.video.type === 'image';
        const includeTime = isImage ? false : (checkboxTimecode ? checkboxTimecode.checked : true);
        const commentTimecode = includeTime ? Math.floor(this.currentTime) : 0;
        const timecodeFormatted = isImage ? 'Foto' : (includeTime ? this.formatTime(this.currentTime) : 'Geral');

        try {
          btnSubmit.disabled = true;
          btnSubmit.textContent = this.pendingAttachment ? 'Enviando...' : 'Comentando...';

          await window.API.addComment({
            projectId: this.project.id,
            videoId: this.video.id,
            authorName: this.currentUser.name,
            authorEmail: this.currentUser.email,
            authorAvatar: this.currentUser.avatar,
            isAuthor: this.isProjectAuthor(),
            timecode: commentTimecode,
            timecodeFormatted,
            content
          }, this.pendingAttachment ? this.pendingAttachment.file : null);

          textarea.value = '';
          this.clearPendingAttachment();
          await this.loadComments();
          if (window.app && window.app.notificationsManager) {
            window.app.notificationsManager.notifyInstantActivity({
              type: 'comment_created',
              videoId: this.video ? this.video.id : null
            });
          }
          window.showToast('Comentário registrado');
        } catch (err) {
          alert(err.message || 'Erro ao registrar comentário');
        } finally {
          btnSubmit.disabled = false;
          btnSubmit.textContent = 'Comentar';
        }
      });
    }

    // Modal de ampliação (lightbox) das imagens anexadas
    const imageCards = this.container.querySelectorAll('.comment-image-card');
    imageCards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (card.classList.contains('is-unavailable')) return;
        const imgUrl = card.getAttribute('data-img-url');
        const imgEl = card.querySelector('img');
        const name = (imgEl && imgEl.alt) || 'Imagem anexada';
        if (imgUrl) {
          this.openImageLightbox(imgUrl, name);
        }
      });
    });

    // Habilita menções (@nome) em todas as caixas de texto de comentários e respostas
    this.setupMentionAutocomplete();
  }

  normalizeStr(str) {
    if (!str) return '';
    return String(str)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  getMentionableUsers() {
    const map = new Map();
    const addCandidate = (name, email, avatar, isAuthor) => {
      const cleanName = String(name || '').trim();
      const cleanEmail = String(email || '').toLowerCase().trim();
      if (!cleanName && !cleanEmail) return;
      const key = cleanEmail || `name:${this.normalizeStr(cleanName)}`;
      if (!map.has(key)) {
        map.set(key, {
          name: cleanName || cleanEmail.split('@')[0],
          email: cleanEmail,
          avatar: avatar || '',
          isAuthor: Boolean(isAuthor)
        });
      } else {
        const existing = map.get(key);
        if (isAuthor) existing.isAuthor = true;
        if (avatar && !existing.avatar) existing.avatar = avatar;
        if (cleanName && (!existing.name || existing.name === existing.email.split('@')[0])) {
          existing.name = cleanName;
        }
      }
    };

    // 1. Conta do Autor do projeto / link
    const appData = (window.app && window.app.data) || {};
    const settings = appData.settings || {};
    const ownerUser = appData.user || (window.app && window.app.authorSession) || null;
    const authorName = settings.authorName || (ownerUser && ownerUser.name) || 'Giffú';
    const authorEmail = settings.authorEmail || (ownerUser && ownerUser.email) || '';
    const authorAvatar = settings.authorAvatar || (ownerUser && ownerUser.avatar) || '';
    addCandidate(authorName, authorEmail, authorAvatar, true);

    if (ownerUser && ownerUser.name && this.normalizeStr(ownerUser.name) !== this.normalizeStr(authorName)) {
      addCandidate(ownerUser.name, ownerUser.email || authorEmail, ownerUser.avatar || authorAvatar, true);
    }

    // 2. Contas que já comentaram ou responderam no link (projeto/vídeo)
    const allProjectComments = Array.isArray(appData.comments)
      ? appData.comments.filter(c => !this.project || c.projectId === this.project.id)
      : [];
    const combinedComments = [...allProjectComments, ...(this.comments || [])];

    combinedComments.forEach(c => {
      if (!c) return;
      addCandidate(c.authorName, c.authorEmail, c.authorAvatar, c.isAuthor);
      (c.replies || []).forEach(r => {
        if (!r) return;
        addCandidate(r.authorName, r.authorEmail, r.authorAvatar, r.isAuthor);
      });
    });

    const list = Array.from(map.values());
    list.sort((a, b) => {
      if (a.isAuthor && !b.isAuthor) return -1;
      if (!a.isAuthor && b.isAuthor) return 1;
      return (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' });
    });
    return list;
  }

  formatContentWithMentions(str) {
    if (!str) return '';
    let escaped = this.escapeHTML(String(str));
    const users = this.getMentionableUsers();
    const sortedNames = users
      .map(u => u.name)
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);

    // Substitui @Nome conhecido por marcador temporário para evitar conflitos
    const placeholders = [];
    sortedNames.forEach((name) => {
      const escapedName = this.escapeHTML(name);
      const regexSafe = escapedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|[\\s(\\[{,;:])(@${regexSafe})(?=$|[\\s.,!?;:)\\]}])`, 'gi');
      escaped = escaped.replace(regex, (match, prefix, mentionText) => {
        const token = `__MENTION_TOKEN_${placeholders.length}__`;
        placeholders.push(`<span class="comment-mention">${mentionText}</span>`);
        return `${prefix}${token}`;
      });
    });

    // Também destaca menções genéricas @usuario no início ou após espaço
    escaped = escaped.replace(/(^|[\s(\[{,;:])(@[A-Za-zÀ-ÖØ-öø-ÿ0-9_.-]+)(?=$|[\s.,!?;:)\]}])/g, (match, prefix, mentionText) => {
      if (mentionText.startsWith('@__MENTION_TOKEN_')) return match;
      return `${prefix}<span class="comment-mention">${mentionText}</span>`;
    });

    placeholders.forEach((html, idx) => {
      escaped = escaped.replace(`__MENTION_TOKEN_${idx}__`, html);
    });

    return escaped;
  }

  setupMentionAutocomplete() {
    const textareas = this.container.querySelectorAll('.comment-textarea');
    textareas.forEach(ta => {
      if (ta.dataset.mentionBound === '1') return;
      ta.dataset.mentionBound = '1';

      let dropdown = null;
      let filteredUsers = [];
      let activeIndex = 0;
      let mentionStartIdx = -1;

      const closeDropdown = () => {
        if (dropdown) {
          dropdown.remove();
          dropdown = null;
        }
        filteredUsers = [];
        activeIndex = 0;
        mentionStartIdx = -1;
      };

      const selectUser = (user) => {
        if (!user || mentionStartIdx < 0) return;
        const val = ta.value;
        const cursorPos = ta.selectionStart;
        const before = val.slice(0, mentionStartIdx);
        const after = val.slice(cursorPos);
        const insertion = `@${user.name} `;
        ta.value = before + insertion + after;
        const newPos = before.length + insertion.length;
        ta.focus();
        ta.setSelectionRange(newPos, newPos);
        closeDropdown();
      };

      const renderDropdown = () => {
        if (!filteredUsers.length) {
          closeDropdown();
          return;
        }

        const parent = ta.parentElement;
        if (!parent) return;
        if (getComputedStyle(parent).position === 'static') {
          parent.style.position = 'relative';
        }

        if (!dropdown) {
          dropdown = document.createElement('div');
          dropdown.className = 'mention-autocomplete-dropdown';
          // Se for o campo principal no rodapé, abre para cima; nos demais, abre abaixo ou acima conforme espaço
          if (ta.id === 'mainCommentText') {
            dropdown.classList.add('mention-dropdown-up');
          }
          parent.appendChild(dropdown);
        }

        dropdown.innerHTML = `
          <div class="mention-dropdown-header">Mencionar pessoa</div>
          <div class="mention-dropdown-list">
            ${filteredUsers.map((u, idx) => `
              <div class="mention-option ${idx === activeIndex ? 'is-active' : ''}" data-index="${idx}">
                <img class="mention-option-avatar" src="${u.avatar || '/assets/default-avatar.svg'}" alt="" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='/assets/default-avatar.svg';">
                <div class="mention-option-info">
                  <div class="mention-option-name">
                    <span>@${this.escapeHTML(u.name)}</span>
                    ${u.isAuthor ? '<span class="badge-role-author">Autor</span>' : ''}
                  </div>
                  ${u.email ? `<div class="mention-option-email">${this.escapeHTML(u.email)}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `;

        dropdown.querySelectorAll('.mention-option').forEach(opt => {
          opt.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const idx = parseInt(opt.getAttribute('data-index'), 10);
            if (!isNaN(idx) && filteredUsers[idx]) {
              selectUser(filteredUsers[idx]);
            }
          });
        });

        const activeEl = dropdown.querySelector('.mention-option.is-active');
        if (activeEl) {
          activeEl.scrollIntoView({ block: 'nearest' });
        }
      };

      const checkMentionTrigger = () => {
        const val = ta.value;
        const cursorPos = ta.selectionStart;
        if (typeof cursorPos !== 'number') {
          closeDropdown();
          return;
        }

        const textBeforeCursor = val.slice(0, cursorPos);
        // Procura o último '@' precedido por início da linha ou espaço/pontuação
        const match = textBeforeCursor.match(/(?:^|[\s(\[{,;:])@([^\n\r@]*)$/);
        if (!match) {
          closeDropdown();
          return;
        }

        const query = match[1];
        // Se já tiver dois espaços seguidos, encerra o autocomplete
        if (/\s{2,}/.test(query)) {
          closeDropdown();
          return;
        }

        mentionStartIdx = textBeforeCursor.lastIndexOf('@');
        const normQuery = this.normalizeStr(query);
        const candidates = this.getMentionableUsers();

        filteredUsers = candidates.filter(u => {
          if (!normQuery) return true;
          const normName = this.normalizeStr(u.name);
          const normEmail = this.normalizeStr(u.email);
          return normName.includes(normQuery) || normEmail.includes(normQuery);
        });

        if (filteredUsers.length === 0) {
          closeDropdown();
          return;
        }

        if (activeIndex >= filteredUsers.length) {
          activeIndex = 0;
        }
        renderDropdown();
      };

      ta.addEventListener('input', checkMentionTrigger);
      ta.addEventListener('click', checkMentionTrigger);
      ta.addEventListener('keydown', (e) => {
        if (!dropdown || !filteredUsers.length) return;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          activeIndex = (activeIndex + 1) % filteredUsers.length;
          renderDropdown();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          activeIndex = (activeIndex - 1 + filteredUsers.length) % filteredUsers.length;
          renderDropdown();
        } else if (e.key === 'Enter' || e.key === 'Tab') {
          e.preventDefault();
          e.stopPropagation();
          selectUser(filteredUsers[activeIndex]);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeDropdown();
        }
      });

      ta.addEventListener('blur', () => {
        setTimeout(() => closeDropdown(), 180);
      });
    });
  }

  async openGoogleLoginModal(switchAccount = false) {
    try {
      const user = await window.Auth.signIn('client', { switchAccount });
      this.setCurrentUser(user);
      if (window.app) {
        window.app.authorSession = user;
        window.app.renderHeader();
        if (window.app.notificationsManager) {
          window.app.notificationsManager.fetchNotifications({ triggerToast: false });
        }
      }
      window.showToast(`Conectado como ${user.name}`);
    } catch (err) {
      if (err && err.message && err.message !== 'Login cancelado') alert(err.message);
    }
  }

  escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  formatDate(dateStr) {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'agora';
    }
  }
}

window.CommentsController = CommentsController;
