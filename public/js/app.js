// Main Application Controller for Giffú Entrega

const CATEGORY_COLORS = [
  { id: 'default', name: 'Padrão', hex: '#FF5400', isDefault: true },
  { id: 'yellow', name: 'Amarelo', hex: '#EAB308' },
  { id: 'blue', name: 'Azul', hex: '#2563EB' },
  { id: 'green', name: 'Verde', hex: '#16A34A' },
  { id: 'pink', name: 'Rosa', hex: '#EC4899' },
  { id: 'purple', name: 'Roxo', hex: '#9333EA' },
  { id: 'red', name: 'Vermelho', hex: '#EF4444' },
  { id: 'brown', name: 'Marrom', hex: '#8D5B4C' },
  { id: 'dark-gray', name: 'Cinza Escuro', hex: '#475569' },
  { id: 'light-gray', name: 'Cinza Claro', hex: '#94A3B8' },
  { id: 'violet', name: 'Violeta', hex: '#7C3AED' },
  { id: 'cyan', name: 'Ciano', hex: '#06B6D4' },
  { id: 'cerulean', name: 'Cerúleo', hex: '#0284C7' },
  { id: 'gold', name: 'Dourado', hex: '#D97706' },
  { id: 'light-orange', name: 'Laranja Clarinho', hex: '#FB923C' }
];

const SYSTEM_THEME_COLORS = [
  { id: 'orange', name: 'Laranja', hex: '#FF5400' },
  { id: 'yellow', name: 'Amarelo', hex: '#EAB308' },
  { id: 'blue', name: 'Azul', hex: '#2563EB' },
  { id: 'green', name: 'Verde', hex: '#16A34A' },
  { id: 'red', name: 'Vermelho', hex: '#EF4444' },
  { id: 'purple', name: 'Roxo', hex: '#9333EA' },
  { id: 'violet', name: 'Violeta', hex: '#7C3AED' },
  { id: 'ocean', name: 'Oceano', hex: '#0D9488' },
  { id: 'wine', name: 'Vinho', hex: '#881337' },
  { id: 'brown', name: 'Marrom', hex: '#8D5B4C' }
];

const DEFAULT_CATEGORY_ICON = '<svg class="cat-tag-icon" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>';

const ZIP_FILE_ICON = `<svg class="file-card-svg zip-svg" width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
  <polyline points="14 2 14 8 20 8"></polyline>
  <line x1="10" y1="7" x2="11.5" y2="7"></line>
  <line x1="12.5" y1="9" x2="14" y2="9"></line>
  <line x1="10" y1="11" x2="11.5" y2="11"></line>
  <line x1="12.5" y1="13" x2="14" y2="13"></line>
  <line x1="10" y1="15" x2="11.5" y2="15"></line>
  <rect x="9" y="16.5" width="4" height="4" rx="0.5" fill="currentColor"></rect>
</svg>`;

const DOC_FILE_ICON = `<svg class="file-card-svg doc-svg" width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
  <polyline points="14 2 14 8 20 8"></polyline>
  <line x1="16" y1="13" x2="8" y2="13"></line>
  <line x1="16" y1="17" x2="8" y2="17"></line>
  <line x1="10" y1="9" x2="8" y2="9"></line>
</svg>`;

const ZIP_FILE_ICON_LARGE = `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
  <polyline points="14 2 14 8 20 8"></polyline>
  <line x1="10" y1="7" x2="11.5" y2="7"></line>
  <line x1="12.5" y1="9" x2="14" y2="9"></line>
  <line x1="10" y1="11" x2="11.5" y2="11"></line>
  <line x1="12.5" y1="13" x2="14" y2="13"></line>
  <line x1="10" y1="15" x2="11.5" y2="15"></line>
  <rect x="9" y="16.5" width="4" height="4" rx="0.5" fill="currentColor"></rect>
</svg>`;

const DOC_FILE_ICON_LARGE = `<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
  <polyline points="14 2 14 8 20 8"></polyline>
  <line x1="16" y1="13" x2="8" y2="13"></line>
  <line x1="16" y1="17" x2="8" y2="17"></line>
  <line x1="10" y1="9" x2="8" y2="9"></line>
</svg>`;

window.detectAspectRatio = function(width, height) {
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
};

window.handleVideoPreviewMetadata = function(videoEl) {
  if (!videoEl || !videoEl.videoWidth || !videoEl.videoHeight) return;
  const aspect = window.detectAspectRatio(videoEl.videoWidth, videoEl.videoHeight);
  if (!aspect) return;
  const card = videoEl.closest('.video-card');
  if (card) {
    const badge = card.querySelector('.badge-aspect');
    if (badge && badge.textContent !== aspect) {
      badge.textContent = aspect;
    }
    const wrapper = card.querySelector('.card-media-wrapper');
    if (wrapper) {
      wrapper.classList.remove('aspect-16-9', 'aspect-9-16', 'aspect-4-3', 'aspect-1-1', 'aspect-3-2', 'aspect-2-3', 'aspect-3-4');
      wrapper.classList.add('aspect-' + aspect.replace(':', '-'));
    }
    const vidId = card.getAttribute('data-video-id');
    if (vidId && window.app && window.app.selectedProject && Array.isArray(window.app.selectedProject.videos)) {
      const vid = window.app.selectedProject.videos.find(v => v.id === vidId);
      if (vid && vid.aspectRatio !== aspect) {
        vid.aspectRatio = aspect;
      }
    }
  }
};

class NotificationsManager {
  constructor(app) {
    this.app = app;
    this.pendingComments = [];
    this.historyComments = [];
    this.stagedResolvedIds = new Set();
    this.activeTab = 'pending'; // 'pending' | 'history'
    this.seenCommentIds = new Set();
    this.isFirstFetch = true;
    this.isOpen = false;
    this.pollInterval = null;
    this.sseSource = null;
    this.broadcastChannel = null;
    this.currentMount = null;
    this.audioCtx = null;
    this.lastChimeAt = 0;
    this.lastHighlightedCommentId = null;
    this._fetchPromise = null;
    this._pendingTriggerToast = false;
    this._pendingFromLocal = false;

    this.init();
  }

  init() {
    const mountEl = document.getElementById('notificationsBellMount');
    if (mountEl) {
      this.mountBell(mountEl);
    }

    // Desbloqueia WebAudio no primeiro clique/tecla para garantir som instantâneo em qualquer aba
    const unlockAudio = () => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        if (!this.audioCtx) this.audioCtx = new AudioCtx();
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume().catch(() => {});
        }
      } catch (e) {}
    };
    document.addEventListener('pointerdown', unlockAudio, { passive: true });
    document.addEventListener('keydown', unlockAudio, { passive: true });

    this.fetchNotifications({ triggerToast: false });

    // Conexão em tempo real via Server-Sent Events (SSE) para chegada instantânea
    this.connectRealtimeStream();

    // Canal entre abas do mesmo navegador para sincronia imediata (0ms)
    if (typeof window.BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('giffu_notifications');
        this.broadcastChannel.onmessage = (ev) => {
          const payload = ev && ev.data ? ev.data : {};
          this.fetchNotifications({ triggerToast: true });
          if (payload.videoId && this.app && this.app.commentsController && this.app.selectedVideo && this.app.selectedVideo.id === payload.videoId) {
            this.app.commentsController.loadComments();
          }
        };
      } catch (e) {}
    }

    // Polling de segurança a cada 5 segundos
    this.pollInterval = setInterval(() => {
      this.fetchNotifications({ triggerToast: true });
    }, 5000);

    // Fechar dropdown ao clicar fora
    document.addEventListener('click', (e) => {
      if (this.isOpen) {
        const wrapper = document.getElementById('notificationsBellWrapper');
        if (wrapper && !wrapper.contains(e.target)) {
          this.closePopover();
        }
      }
    });

    // Fechar dropdown ao teclar Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closePopover();
      }
    });
  }

  connectRealtimeStream() {
    if (typeof window.EventSource === 'undefined') return;
    try {
      if (this.sseSource) {
        this.sseSource.close();
      }
      const es = new EventSource('/api/notifications/stream');
      this.sseSource = es;

      es.onmessage = (event) => {
        if (!event || !event.data) return;
        try {
          const payload = JSON.parse(event.data);
          if (payload && payload.type && payload.type !== 'connected') {
            this.fetchNotifications({ triggerToast: true });
            if (payload.videoId && this.app && this.app.commentsController && this.app.selectedVideo && this.app.selectedVideo.id === payload.videoId) {
              this.app.commentsController.loadComments();
            }
          }
        } catch (e) {}
      };

      es.onerror = () => {
        try { es.close(); } catch (e) {}
        this.sseSource = null;
        setTimeout(() => this.connectRealtimeStream(), 3000);
      };
    } catch (e) {}
  }

  notifyInstantActivity(payload = {}) {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(payload);
      } catch (e) {}
    }
    this.fetchNotifications({ triggerToast: true, fromLocalSubmit: true });
  }

  isAuthorUser() {
    if (window.Auth && window.Auth.user) {
      return Boolean(window.Auth.user.isAuthor);
    }
    return Boolean(this.app && this.app.isAuthorMode);
  }

  getCurrentProjectId() {
    if (this.app && this.app.selectedProject) return this.app.selectedProject.id;
    return null;
  }

  getCurrentCode() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const candidate = (parts[0] === 'entrega' && parts[1]) ? parts[1] : parts[0];
    if (candidate && /^[a-z0-9]{6,12}$/.test(candidate)) return candidate;
    return null;
  }

  getActivityKey(item) {
    if (!item) return '';
    return item.latestReply && item.latestReply.id
      ? `${item.id}:reply:${item.latestReply.id}:${item.repliesCount || 1}`
      : `${item.id}:comment`;
  }

  formatMentionsInSnippet(str) {
    if (!str) return '';
    const escaped = this.app.escapeHtml(String(str));
    return escaped.replace(/(^|[\s(\[{,;:])(@[A-Za-zÀ-ÖØ-öø-ÿ0-9_.-]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ0-9_.-]+)?)(?=$|[\s.,!?;:)\]}])/g, '$1<span class="comment-mention">$2</span>');
  }

  async fetchNotifications({ triggerToast = true, fromLocalSubmit = false } = {}) {
    if (triggerToast) this._pendingTriggerToast = true;
    if (fromLocalSubmit) this._pendingFromLocal = true;

    if (this._fetchPromise) {
      this._needsRefetch = true;
      return this._fetchPromise;
    }

    this._fetchPromise = (async () => {
      try {
        const shouldTrigger = this._pendingTriggerToast;
        const isLocal = this._pendingFromLocal;
        this._pendingTriggerToast = false;
        this._pendingFromLocal = false;
        this._needsRefetch = false;

        const data = await window.API.getNotifications({
          projectId: this.getCurrentProjectId(),
          code: this.getCurrentCode()
        });

        const newPending = data.pending || [];
        const newHistory = data.history || [];
        const currentUserEmail = window.Auth && window.Auth.user && window.Auth.user.email ? String(window.Auth.user.email).toLowerCase() : '';

        if (!this.isFirstFetch && shouldTrigger) {
          let playedAlertForBatch = false;
          for (const item of newPending) {
            const actKey = this.getActivityKey(item);
            if (!this.seenCommentIds.has(actKey)) {
              const actorEmail = item.latestReply ? (item.latestReply.authorEmail || '') : (item.authorEmail || '');
              const isOwnAction = Boolean(isLocal && actorEmail && currentUserEmail && String(actorEmail).toLowerCase() === currentUserEmail);

              // Se chegou uma nova resposta num item que estava provisoriamente concluído, desmarca para exibir como pendente
              if (this.stagedResolvedIds.has(item.id)) {
                this.stagedResolvedIds.delete(item.id);
              }

              this.lastHighlightedCommentId = item.id;

              // Sempre toca o som de notificação e balança o sininho ao entrar novo comentário ou nova resposta
              // (mesmo que o comentário pai já estivesse na lista de notificações)
              if (!playedAlertForBatch) {
                this.playChime();
                this.shakeBell();
                playedAlertForBatch = true;
              }

              if (!isOwnAction) {
                this.showNotificationToast(item);
              }
            }
          }
        }

        // Se o popover estiver aberto e houver itens concluídos provisoriamente,
        // preservamos eles na lista para que não sumam durante o polling antes de fechar o popover
        if (this.isOpen && this.stagedResolvedIds.size > 0) {
          const existingStagedMap = new Map();
          for (const c of this.pendingComments) {
            if (this.stagedResolvedIds.has(c.id)) {
              existingStagedMap.set(c.id, c);
            }
          }
          const mergedPending = [...newPending];
          for (const [id, item] of existingStagedMap.entries()) {
            if (!mergedPending.some(p => p.id === id)) {
              mergedPending.push(item);
            }
          }
          this.pendingComments = mergedPending;
        } else {
          this.pendingComments = newPending;
        }

        this.historyComments = newHistory;
        this.seenCommentIds = new Set(newPending.map(c => this.getActivityKey(c)));
        this.isFirstFetch = false;

        this.updateBadge();
        if (this.isOpen) {
          this.renderPopoverList();
        }
      } catch (e) {
        // Ignora falhas temporárias de conexão
      } finally {
        this._fetchPromise = null;
        if (this._needsRefetch) {
          this._needsRefetch = false;
          this.fetchNotifications({
            triggerToast: this._pendingTriggerToast,
            fromLocalSubmit: this._pendingFromLocal
          });
        }
      }
    })();

    return this._fetchPromise;
  }

  handleCommentResolved(commentId, isResolved) {
    if (isResolved) {
      this.pendingComments = this.pendingComments.filter(c => c.id !== commentId);
    }
    this.updateBadge();
    if (this.isOpen) {
      this.renderPopoverList();
    }
  }

  removeComment(commentId) {
    this.pendingComments = this.pendingComments.filter(c => c.id !== commentId);
    this.historyComments = this.historyComments.filter(c => c.id !== commentId);
    this.stagedResolvedIds.delete(commentId);
    this.updateBadge();
    if (this.isOpen) {
      this.renderPopoverList();
    }
  }

  getPendingCount() {
    return this.pendingComments.filter(c => !this.stagedResolvedIds.has(c.id)).length;
  }

  updateBadge() {
    const count = this.getPendingCount();
    let badge = document.getElementById('bellBadgeCount');
    let bellBtn = document.getElementById('btnNotificationsBell');
    let countText = document.getElementById('notifCountText');

    if (!bellBtn) {
      const mountEl = document.getElementById('notificationsBellMount');
      if (mountEl) {
        this.mountBell(mountEl);
        badge = document.getElementById('bellBadgeCount');
        bellBtn = document.getElementById('btnNotificationsBell');
        countText = document.getElementById('notifCountText');
      }
    }

    if (badge) {
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }

    if (bellBtn) {
      if (count > 0) {
        bellBtn.classList.add('has-pending');
      } else {
        bellBtn.classList.remove('has-pending');
      }
    }

    if (countText) {
      if (this.activeTab === 'pending') {
        countText.textContent = count > 0 ? String(count) : '';
        countText.style.display = count > 0 ? 'inline' : 'none';
      } else {
        countText.textContent = '';
        countText.style.display = 'none';
      }
    }
  }

  shakeBell() {
    const bellBtn = document.getElementById('btnNotificationsBell');
    if (bellBtn) {
      bellBtn.classList.remove('bell-ringing');
      void bellBtn.offsetWidth;
      bellBtn.classList.add('bell-ringing');
    }
  }

  playChime() {
    const nowMs = Date.now();
    if (nowMs - (this.lastChimeAt || 0) < 180) return;
    this.lastChimeAt = nowMs;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) this.audioCtx = new AudioCtx();

      const triggerNotes = () => {
        try {
          const now = this.audioCtx.currentTime;
          // Nota 1 (Ré5) -> Nota 2 (Lá5) nítida e agradável
          const osc1 = this.audioCtx.createOscillator();
          const gain1 = this.audioCtx.createGain();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(587.33, now);
          osc1.frequency.exponentialRampToValueAtTime(880, now + 0.13);
          gain1.gain.setValueAtTime(0.22, now);
          gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
          osc1.connect(gain1);
          gain1.connect(this.audioCtx.destination);
          osc1.start(now);
          osc1.stop(now + 0.46);
        } catch (e) {}
      };

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().then(triggerNotes).catch(() => {});
      } else {
        triggerNotes();
      }
    } catch (e) {}
  }

  mountBell(container) {
    if (!container) return;
    this.currentMount = container;

    const count = this.getPendingCount();
    container.innerHTML = `
      <div class="notifications-bell-wrapper" id="notificationsBellWrapper">
        <button class="btn-notifications-bell ${count > 0 ? 'has-pending' : ''}" id="btnNotificationsBell" aria-label="Notificações de comentários" title="Notificações de comentários">
          <svg class="bell-icon bell-outlined" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <svg class="bell-icon bell-filled" width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
          <span class="bell-badge" id="bellBadgeCount" style="${count > 0 ? 'display: flex;' : 'display: none;'}">${count > 99 ? '99+' : count}</span>
        </button>
        <div class="notifications-popover" id="notificationsPopover" style="${this.isOpen ? 'display: block;' : 'display: none;'}">
          <div class="notifications-popover-header">
            <div class="notifications-popover-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>
              <span id="notifPopoverHeading">Comentários Pendentes</span>
            </div>
            <div class="notif-header-actions">
              <span class="notif-count-text" id="notifCountText" style="${(this.activeTab === 'pending' && count > 0) ? '' : 'display: none;'}">${(this.activeTab === 'pending' && count > 0) ? count : ''}</span>
              <button class="btn-notif-history-toggle" id="btnNotifHistoryToggle" type="button" title="Ver comentários concluídos anteriores">Anteriores</button>
            </div>
          </div>
          <div class="notifications-popover-list" id="notificationsPopoverList"></div>
        </div>
      </div>
    `;

    const bellBtn = container.querySelector('#btnNotificationsBell');
    if (bellBtn) {
      bellBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.togglePopover();
      };
    }

    const historyBtn = container.querySelector('#btnNotifHistoryToggle');
    if (historyBtn) {
      historyBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleTab();
      };
    }

    if (this.isOpen) {
      this.renderPopoverList();
    }
  }

  toggleTab() {
    if (this.activeTab === 'pending' && this.stagedResolvedIds.size > 0) {
      this.commitStagedResolved();
    }
    this.activeTab = (this.activeTab === 'pending') ? 'history' : 'pending';
    this.renderPopoverList();
  }

  commitStagedResolved() {
    if (this.stagedResolvedIds.size === 0) return;
    const moved = [];
    this.pendingComments = this.pendingComments.filter(c => {
      if (this.stagedResolvedIds.has(c.id)) {
        moved.push({ ...c, resolved: true, resolvedAt: new Date().toISOString() });
        return false;
      }
      return true;
    });
    this.historyComments = [...moved, ...this.historyComments];
    this.stagedResolvedIds.clear();
    this.updateBadge();
  }

  togglePopover() {
    if (this.isOpen) {
      this.closePopover();
    } else {
      this.openPopover();
    }
  }

  openPopover() {
    const popover = document.getElementById('notificationsPopover');
    if (!popover) return;
    this.isOpen = true;
    popover.style.display = 'block';
    this.renderPopoverList();
  }

  closePopover() {
    const popover = document.getElementById('notificationsPopover');
    if (!popover) return;

    // A notificação só é excluída da lista de pendentes após fechar o sininho!
    this.commitStagedResolved();
    this.activeTab = 'pending';

    this.isOpen = false;
    popover.style.display = 'none';
  }

  formatRelativeTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return 'agora';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `há ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `há ${diffH}h`;
    const diffDays = Math.floor(diffH / 24);
    if (diffDays === 1) return 'ontem';
    if (diffDays < 7) return `há ${diffDays} dias`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }

  getFileDisplayName(item) {
    if (!item) return 'Arquivo';
    let name = String(item.fileName || item.videoTitle || 'Arquivo').trim();
    if (/\.[a-zA-Z0-9]{2,5}$/.test(name)) return name;
    if (item.videoType === 'video') return `${name}.mp4`;
    if (item.videoType === 'image') return `${name}.jpg`;
    if (item.videoType === 'audio') return `${name}.mp3`;
    return name;
  }

  renderPopoverList() {
    const listEl = document.getElementById('notificationsPopoverList');
    const heading = document.getElementById('notifPopoverHeading');
    const historyBtn = document.getElementById('btnNotifHistoryToggle');
    if (!listEl) return;

    this.updateBadge();

    // ========================================================
    // ABA ANTERIORES (Histórico)
    // ========================================================
    if (this.activeTab === 'history') {
      if (heading) heading.textContent = 'Comentários Anteriores';
      if (historyBtn) {
        historyBtn.textContent = '← Pendentes';
        historyBtn.classList.add('is-active');
        historyBtn.title = 'Voltar para comentários pendentes';
      }

      if (this.historyComments.length === 0) {
        listEl.innerHTML = `
          <div class="notif-empty-state">
            <div class="notif-empty-icon-wrap" style="background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.1);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted);">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 14 14"></polyline>
              </svg>
            </div>
            <span class="notif-empty-title">Nenhum comentário anterior</span>
            <span class="notif-empty-desc">Comentários marcados como concluídos aparecerão aqui.</span>
          </div>
        `;
        return;
      }

      listEl.innerHTML = this.historyComments.map(item => {
        const relTime = this.formatRelativeTime(item.resolvedAt || item.lastActivityAt || item.createdAt);
        const fileNameWithExt = this.getFileDisplayName(item);
        const latestReply = item.latestReply;
        const repliesCount = item.repliesCount || (Array.isArray(item.replies) ? item.replies.length : 0);

        return `
          <div class="notif-card is-history-card" data-comment-id="${item.id}" data-project-id="${item.projectId}" data-video-id="${item.videoId}">
            <div class="notif-card-header">
              <div class="notif-card-author">
                <img class="notif-avatar" src="${item.authorAvatar || '/assets/default-avatar.svg'}" alt="" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='/assets/default-avatar.svg';">
                <span class="notif-author-name">${this.app.escapeHtml(item.authorName)}</span>
                ${item.isAuthor ? '<span class="badge-role-author">Autor</span>' : ''}
                ${item.isMentioned ? '<span class="badge-notif-mention" title="Você foi mencionado">@ Menção</span>' : ''}
              </div>
              <div class="notif-card-meta">
                <span class="notif-rel-time">${relTime}</span>
              </div>
            </div>

            <div class="notif-card-context">
              <span class="notif-ctx-video font-mono" title="${this.app.escapeHtml(fileNameWithExt)}">${this.app.escapeHtml(fileNameWithExt)}</span>
              ${repliesCount > 0 ? `<span class="badge-notif-replies">💬 ${repliesCount} ${repliesCount === 1 ? 'resposta' : 'respostas'}</span>` : ''}
            </div>

            <div class="notif-card-snippet">${this.formatMentionsInSnippet(item.content)}</div>

            ${latestReply ? `
              <div class="notif-card-reply-preview">
                <div class="notif-reply-meta">
                  <img class="notif-reply-avatar" src="${latestReply.authorAvatar || '/assets/default-avatar.svg'}" alt="" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='/assets/default-avatar.svg';">
                  <span class="notif-reply-author">↳ ${this.app.escapeHtml(latestReply.authorName)}</span>
                  ${latestReply.isAuthor ? '<span class="badge-role-author">Autor</span>' : ''}
                  <span class="notif-rel-time">${this.formatRelativeTime(latestReply.createdAt)}</span>
                </div>
                <div class="notif-reply-text">${this.formatMentionsInSnippet(latestReply.content)}</div>
              </div>
            ` : ''}

            ${item.isProjectAuthor ? `
              <div class="notif-card-footer">
                <button class="btn-quick-undo" data-comment-id="${item.id}" title="Reabrir comentário como pendente">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 7v6h6"></path>
                    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
                  </svg>
                  Desfazer
                </button>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');

      listEl.querySelectorAll('.notif-card').forEach(card => {
        card.addEventListener('click', () => {
          const commentId = card.getAttribute('data-comment-id');
          const item = this.historyComments.find(c => c.id === commentId);
          if (item) {
            this.closePopover();
            this.app.openPendingComment(item);
          }
        });
      });

      listEl.querySelectorAll('.btn-quick-undo').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          e.preventDefault();
          const commentId = btn.getAttribute('data-comment-id');
          const targetItem = this.historyComments.find(c => c.id === commentId);
          if (!targetItem || !targetItem.isProjectAuthor) {
            alert('Apenas o autor deste projeto pode marcar comentários como concluídos.');
            return;
          }
          btn.disabled = true;
          try {
            await window.API.toggleResolveComment(commentId, false);
            const foundIdx = this.historyComments.findIndex(c => c.id === commentId);
            if (foundIdx !== -1) {
              const item = this.historyComments.splice(foundIdx, 1)[0];
              item.resolved = false;
              this.pendingComments.unshift(item);
            }
            this.stagedResolvedIds.delete(commentId);
            this.updateBadge();
            this.renderPopoverList();
            window.showToast('Comentário reaberto como pendente ✓');
          } catch (err) {
            alert('Erro ao reabrir comentário');
          } finally {
            btn.disabled = false;
          }
        });
      });
      return;
    }

    // ========================================================
    // ABA PRINCIPAL (Pendentes)
    // ========================================================
    if (heading) heading.textContent = 'Comentários Pendentes';
    if (historyBtn) {
      historyBtn.textContent = 'Anteriores';
      historyBtn.classList.remove('is-active');
      historyBtn.title = 'Ver comentários concluídos anteriores';
    }

    if (this.pendingComments.length === 0) {
      listEl.innerHTML = `
        <div class="notif-empty-state">
          <div class="notif-empty-icon-wrap">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <span class="notif-empty-title">Tudo resolvido!</span>
          <span class="notif-empty-desc">Nenhum comentário pendente no momento.</span>
        </div>
      `;
      return;
    }

    listEl.innerHTML = this.pendingComments.map(item => {
      const relTime = this.formatRelativeTime(item.lastActivityAt || item.createdAt);
      const isStaged = this.stagedResolvedIds.has(item.id);
      const isJustUpdated = this.lastHighlightedCommentId === item.id;
      const fileNameWithExt = this.getFileDisplayName(item);
      const latestReply = item.latestReply;
      const repliesCount = item.repliesCount || (Array.isArray(item.replies) ? item.replies.length : 0);

      return `
        <div class="notif-card ${isStaged ? 'is-staged-resolved' : ''} ${isJustUpdated ? 'comment-highlight-pulse' : ''}" data-comment-id="${item.id}" data-project-id="${item.projectId}" data-video-id="${item.videoId}">
          <div class="notif-card-header">
            <div class="notif-card-author">
              <img class="notif-avatar" src="${item.authorAvatar || '/assets/default-avatar.svg'}" alt="" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='/assets/default-avatar.svg';">
              <span class="notif-author-name">${this.app.escapeHtml(item.authorName)}</span>
              ${item.isAuthor ? '<span class="badge-role-author">Autor</span>' : ''}
              ${item.isMentioned ? '<span class="badge-notif-mention" title="Você foi mencionado">@ Menção</span>' : ''}
            </div>
            <div class="notif-card-meta">
              <span class="notif-rel-time">${relTime}</span>
            </div>
          </div>

          <div class="notif-card-context">
            <span class="notif-ctx-video font-mono" title="${this.app.escapeHtml(fileNameWithExt)}">${this.app.escapeHtml(fileNameWithExt)}</span>
            ${repliesCount > 0 ? `<span class="badge-notif-replies">💬 ${repliesCount} ${repliesCount === 1 ? 'resposta' : 'respostas'}</span>` : ''}
          </div>

          <div class="notif-card-snippet">${this.formatMentionsInSnippet(item.content)}</div>

          ${latestReply ? `
            <div class="notif-card-reply-preview">
              <div class="notif-reply-meta">
                <img class="notif-reply-avatar" src="${latestReply.authorAvatar || '/assets/default-avatar.svg'}" alt="" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='/assets/default-avatar.svg';">
                <span class="notif-reply-author">↳ ${this.app.escapeHtml(latestReply.authorName)}</span>
                ${latestReply.isAuthor ? '<span class="badge-role-author">Autor</span>' : ''}
                <span class="notif-rel-time">${this.formatRelativeTime(latestReply.createdAt)}</span>
              </div>
              <div class="notif-reply-text">${this.formatMentionsInSnippet(latestReply.content)}</div>
            </div>
          ` : ''}

          ${item.isProjectAuthor ? `
            <div class="notif-card-footer">
              ${isStaged ? `
                <button class="btn-quick-undo" data-comment-id="${item.id}" title="Desfazer e manter pendente">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 7v6h6"></path>
                    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
                  </svg>
                  Desfazer
                </button>
              ` : `
                <button class="btn-quick-resolve" data-comment-id="${item.id}" title="Marcar comentário como concluído">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Concluir
                </button>
              `}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Click card -> abre comentário
    listEl.querySelectorAll('.notif-card').forEach(card => {
      card.addEventListener('click', () => {
        const commentId = card.getAttribute('data-comment-id');
        const item = this.pendingComments.find(c => c.id === commentId);
        if (item) {
          this.closePopover();
          this.app.openPendingComment(item);
        }
      });
    });

    // Click Concluir -> muda para Desfazer mantendo o card na tela até fechar o sininho
    listEl.querySelectorAll('.btn-quick-resolve').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        e.preventDefault();
        const commentId = btn.getAttribute('data-comment-id');
        const targetItem = this.pendingComments.find(c => c.id === commentId);
        if (!targetItem || !targetItem.isProjectAuthor) {
          alert('Apenas o autor deste projeto pode marcar comentários como concluídos.');
          return;
        }
        btn.disabled = true;
        try {
          await window.API.toggleResolveComment(commentId, true);
          this.stagedResolvedIds.add(commentId);
          this.updateBadge();
          this.renderPopoverList();
        } catch (err) {
          alert('Erro ao concluir comentário');
        } finally {
          btn.disabled = false;
        }
      });
    });

    // Click Desfazer -> reverte para Concluir mantendo na lista
    listEl.querySelectorAll('.btn-quick-undo').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        e.preventDefault();
        const commentId = btn.getAttribute('data-comment-id');
        const targetItem = this.pendingComments.find(c => c.id === commentId);
        if (!targetItem || !targetItem.isProjectAuthor) {
          alert('Apenas o autor deste projeto pode marcar comentários como concluídos.');
          return;
        }
        btn.disabled = true;
        try {
          await window.API.toggleResolveComment(commentId, false);
          this.stagedResolvedIds.delete(commentId);
          this.updateBadge();
          this.renderPopoverList();
        } catch (err) {
          alert('Erro ao desfazer conclusão');
        } finally {
          btn.disabled = false;
        }
      });
    });
  }

  showNotificationToast(item) {
    let container = document.getElementById('commentsToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'commentsToastContainer';
      container.className = 'comments-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'comment-toast';
    const fileNameWithExt = this.getFileDisplayName(item);
    const isReplyNotif = Boolean(item.latestReply);
    const displayAvatar = isReplyNotif ? (item.latestReply.authorAvatar || '/assets/default-avatar.svg') : (item.authorAvatar || '/assets/default-avatar.svg');
    const displayAuthor = isReplyNotif ? item.latestReply.authorName : item.authorName;
    const displaySnippet = isReplyNotif ? item.latestReply.content : item.content;
    const toastLabel = item.isMentioned
      ? (isReplyNotif ? 'Mencionou você na resposta' : 'Mencionou você no comentário')
      : (isReplyNotif ? 'Nova resposta' : 'Novo comentário');

    toast.innerHTML = `
      <div class="comment-toast-accent-strip"></div>
      <div class="comment-toast-header">
        <div class="comment-toast-title">
          <svg class="comment-toast-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
          <span class="comment-toast-label">${toastLabel}</span>
          ${item.isMentioned ? '<span class="badge-notif-mention">@ Menção</span>' : ''}
        </div>
        <button class="btn-close-toast" aria-label="Fechar notificação">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="comment-toast-context">
        <span class="toast-file-name font-mono" title="${this.app.escapeHtml(fileNameWithExt)}">${this.app.escapeHtml(fileNameWithExt)}</span>
      </div>
      <div class="comment-toast-body">
        <img class="comment-toast-avatar" src="${displayAvatar}" alt="" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='/assets/default-avatar.svg';">
        <div class="comment-toast-content">
          <div class="comment-toast-author-line">
            <span class="comment-toast-author">${this.app.escapeHtml(displayAuthor)}</span>
          </div>
          ${isReplyNotif ? `<div class="comment-toast-parent-quote">Em: "${this.app.escapeHtml(item.content)}"</div>` : ''}
          <div class="comment-toast-snippet">${this.formatMentionsInSnippet(displaySnippet)}</div>
        </div>
      </div>
      <div class="comment-toast-footer">
        <span>Clique para abrir o arquivo e ver no player →</span>
      </div>
      <div class="comment-toast-progress">
        <div class="comment-toast-progress-bar"></div>
      </div>
    `;

    toast.addEventListener('click', (e) => {
      if (e.target.closest('.btn-close-toast')) return;
      this.dismissToast(toast);
      this.app.openPendingComment(item);
    });

    toast.querySelector('.btn-close-toast')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dismissToast(toast);
    });

    const timer = setTimeout(() => {
      this.dismissToast(toast);
    }, 8000);
    toast._timer = timer;

    container.appendChild(toast);
  }

  dismissToast(toast) {
    if (!toast || toast._isDismissing) return;
    toast._isDismissing = true;
    if (toast._timer) clearTimeout(toast._timer);
    toast.classList.add('is-dismissing');
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 320);
  }
}

class EntregaApp {
  constructor() {
    this.data = null;
    this.currentView = 'author_lobby'; // 'author_lobby' | 'author' | 'client_gallery' | 'client_player'
    this.selectedProject = null;
    this.selectedVideo = null;
    this.playerInstance = null;
    this.commentsController = null;
    this.notificationsManager = null;
    this.isClientMode = false;
    this.currentFolderId = null;
    this.scopedFolderId = null; // Quando o cliente abre link específico de pasta (impede ver pastas anteriores)
    this.isIsolatedFile = false; // Quando o cliente abre link de arquivo isolado (impede ver pastas/galeria)
    this.unlockedSlugs = new Set();
    this.authorSession = null; // preenchido apenas com sessão Google verificada pelo servidor
    this.mediaFilter = 'all'; // 'all' | 'video' | 'image'
    this.lobbyFilter = 'all'; // 'all' | 'active' | 'archived'
    this.lobbyCategoryFilter = 'all'; // 'all' | 'Eventos' | 'Marcas' | 'IURD' | 'Pessoal'
    this.lobbyClientFilter = 'all'; // 'all' | '<NomeDoCliente>'
    this.lobbySearchQuery = '';
    this.gallerySearchQuery = '';
    this.commentsVisible = false; // Oculta por padrão para dar mais espaço ao player
    this.isSelectionMode = false;
    this.projectViewModes = this.loadProjectViewModes();
    this.selectedMediaIds = new Set();
    this.selectedFolderIds = new Set();
    this._lastSelectedAnchor = null;
    this.isLobbyFilterOpen = false;
    this.isGalleryFilterOpen = false;
    this.activeContextMenuCategory = null;
    this.sidebarCollapsedYears = this.loadCollapsedYears();
    this.sidebarCollapsedCategories = this.loadCollapsedCategories();
    this.unlockedPasswords = {};
    window.APP = this;
    window.app = this;

    this.init();
  }

  formatFileSize(size) {
    if (!size || size === 'Original') return '';
    if (typeof size === 'string') {
      const trimmed = size.trim();
      if (/[KMG]?B$/i.test(trimmed)) return trimmed;
      const num = Number(trimmed);
      if (!isNaN(num) && num > 0) size = num;
      else return trimmed;
    }
    const b = Number(size) || 0;
    if (b >= 1073741824) return `${(b / 1073741824).toFixed(2)} GB`;
    if (b >= 1048576) return `${(b / 1048576).toFixed(1)} MB`;
    if (b >= 1024) return `${(b / 1024).toFixed(1)} KB`;
    if (b > 0) return `${b} B`;
    return '';
  }

  loadProjectViewModes() {
    try {
      const saved = localStorage.getItem('giffu_project_view_modes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {}
    return {};
  }

  getVideoCoverMode() {
    const fromSettings = this.data?.settings?.videoCoverMode;
    if (fromSettings === 'first_frame' || fromSettings === 'auto') return fromSettings;
    try {
      const saved = localStorage.getItem('giffu_video_cover_mode');
      if (saved === 'first_frame' || saved === 'auto') return saved;
    } catch (e) {}
    return 'auto'; // Por padrão quando o usuário cria a conta, Automático está selecionado
  }

  getVideoPreviewTimecode(video = null) {
    if (this.getVideoCoverMode() === 'first_frame') {
      return '#t=0.001';
    }
    return '#t=0.5';
  }

  getDefaultViewMode() {
    const fromSettings = this.data?.settings?.defaultViewMode;
    if (fromSettings === 'columns' || fromSettings === 'grid') return fromSettings;
    try {
      const saved = localStorage.getItem('giffu_default_view_mode');
      if (saved === 'columns' || saved === 'grid') return saved;
    } catch (e) {}
    return 'grid';
  }

  get lobbyViewMode() {
    if (this._lobbyViewMode) return this._lobbyViewMode;
    try {
      const saved = localStorage.getItem('giffu_lobby_view_mode');
      if (saved === 'columns' || saved === 'grid') return saved;
    } catch (e) {}
    return 'grid';
  }

  setLobbyViewMode(mode) {
    if (mode !== 'columns' && mode !== 'grid') mode = 'grid';
    this._lobbyViewMode = mode;
    this._isColumnsNavActive = (mode === 'columns');
    try {
      localStorage.setItem('giffu_lobby_view_mode', mode);
      localStorage.setItem('giffu_default_view_mode', mode);
    } catch (e) {}
    if (mode === 'columns') {
      if (this.selectedProject) {
        this.columnsActiveCategory = this.selectedProject.category || null;
        this.columnsActiveDivisionId = this.selectedProject.divisionId || null;
      }
      this.columnsPreviewItemId = null;
      this._columnsFocusedColType = 'projects';
      this._columnsFocusedColIndex = null;
    }
    const container = document.getElementById('mainContentArea');
    if (container) {
      this.renderDirectoryLobby(container);
    }
  }

  get galleryViewMode() {
    // Se estiver ativamente em sessão de colunas (navegando dentro da visualização em colunas),
    // permanece em colunas até que o usuário clique expressamente no botão de galeria (grid)
    // ou abra um arquivo no player.
    if (this._isColumnsNavActive) {
      return 'columns';
    }
    const projId = this.selectedProject?.id;
    if (projId && this.projectViewModes && this.projectViewModes[projId]) {
      return this.projectViewModes[projId];
    }
    return this.getDefaultViewMode(); // Padrão das configurações do sistema caso o diretório ainda não tenha preferência salva
  }

  setGalleryViewMode(mode, targetProjectId = null) {
    if (mode !== 'columns' && mode !== 'grid') mode = 'grid';
    // Se o usuário alternar para colunas, marca a sessão ativa de navegação em colunas.
    // Se alternar para grid, desativa a navegação em colunas.
    this._isColumnsNavActive = (mode === 'columns');
    const projId = targetProjectId || this.selectedProject?.id;
    if (!this.projectViewModes) this.projectViewModes = {};
    if (projId) {
      this.projectViewModes[projId] = mode;
      try {
        localStorage.setItem('giffu_project_view_modes', JSON.stringify(this.projectViewModes));
      } catch (e) {}
      if (this.authorSession) {
        this.syncUiPreferencesToCloud({ projectViewModes: { [projId]: mode } });
      }
    }
    if (mode === 'columns') {
      if (this.selectedProject) {
        this.columnsActiveCategory = this.selectedProject.category || null;
        this.columnsActiveDivisionId = this.selectedProject.divisionId || null;
      }
      this.columnsPreviewItemId = null;
      this._columnsFocusedColType = 'folders';
      this._columnsFocusedColIndex = null;
    }
    const container = document.getElementById('mainContentArea');
    if (container) {
      this.renderGalleryView(container);
    }
  }

  loadAuthorSession() {
    const user = window.Auth && window.Auth.user;
    return user || null;
  }

  async saveVideoCoverFrame(projectId, videoId, base64Image) {
    try {
      window.showToast('Salvando frame como capa...');
      const res = await window.API.setVideoCover(projectId, videoId, base64Image);
      if (res && res.coverUrl) {
        // Atualiza localmente no objeto de vídeos
        const targetProj = (this.data?.projects || []).find(p => p.id === projectId);
        if (targetProj) {
          const v = (targetProj.videos || []).find(vid => vid.id === videoId);
          if (v) {
            v.customThumbnailUrl = res.coverUrl;
            v.coverUrl = res.coverUrl;
            v.thumbnailUrl = res.coverUrl;
            v.hasCustomCover = true;
          }
        }
        if (this.selectedVideo && this.selectedVideo.id === videoId) {
          this.selectedVideo.customThumbnailUrl = res.coverUrl;
          this.selectedVideo.coverUrl = res.coverUrl;
          this.selectedVideo.thumbnailUrl = res.coverUrl;
          this.selectedVideo.hasCustomCover = true;
        }
        window.showToast('Capa do vídeo atualizada com sucesso! ✓');
        // Se estiver na galeria, renderiza novamente os cards
        const container = document.getElementById('mainContentArea');
        if (this.currentView === 'author' || this.currentView === 'client_gallery') {
          if (container) this.renderGalleryView(container);
        } else if (this.currentView === 'client_player') {
          // Atualiza o estado visual no player sem destruir a reprodução nem voltar ao início
          if (this.playerInstance && typeof this.playerInstance.updateCustomCoverState === 'function') {
            this.playerInstance.updateCustomCoverState(true);
          }
          // Atualiza botão de desfazer na barra superior se existir
          let headerResetBtn = document.getElementById('btnHeaderResetCover');
          const headerSetBtn = document.getElementById('btnHeaderSetCover');
          if (!headerResetBtn && headerSetBtn) {
            headerResetBtn = document.createElement('button');
            headerResetBtn.className = 'icon-action-btn';
            headerResetBtn.id = 'btnHeaderResetCover';
            headerResetBtn.title = 'Desfazer capa personalizada';
            headerResetBtn.setAttribute('aria-label', 'Desfazer');
            headerResetBtn.innerHTML = `
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
              </svg>
            `;
            headerSetBtn.insertAdjacentElement('afterend', headerResetBtn);
            headerResetBtn.addEventListener('click', async () => {
              const curVid = this.selectedVideo;
              if (curVid) await this.resetVideoCoverFrame(projectId, curVid.id);
            });
          }
        }
      }
    } catch (err) {
      console.error('Erro ao definir capa:', err);
      window.showToast(err.message || 'Erro ao definir capa do vídeo');
    }
  }

  async resetVideoCoverFrame(projectId, videoId) {
    try {
      window.showToast('Restaurando capa padrão...');
      const res = await window.API.resetVideoCover(projectId, videoId);
      if (res && res.success) {
        const targetProj = (this.data?.projects || []).find(p => p.id === projectId);
        if (targetProj) {
          const v = (targetProj.videos || []).find(vid => vid.id === videoId);
          if (v) {
            delete v.customThumbnailUrl;
            delete v.coverUrl;
            delete v.hasCustomCover;
            if (v.driveFileId && v.type === 'video') {
              delete v.thumbnailUrl;
            }
          }
        }
        if (this.selectedVideo && this.selectedVideo.id === videoId) {
          delete this.selectedVideo.customThumbnailUrl;
          delete this.selectedVideo.coverUrl;
          delete this.selectedVideo.hasCustomCover;
          if (this.selectedVideo.driveFileId && this.selectedVideo.type === 'video') {
            delete this.selectedVideo.thumbnailUrl;
          }
        }
        window.showToast('Capa restaurada para a configuração padrão ✓');
        const container = document.getElementById('mainContentArea');
        if (this.currentView === 'author' || this.currentView === 'client_gallery') {
          if (container) this.renderGalleryView(container);
        } else if (this.currentView === 'client_player') {
          // Atualiza o estado visual no player sem destruir a reprodução nem voltar ao início
          if (this.playerInstance && typeof this.playerInstance.updateCustomCoverState === 'function') {
            this.playerInstance.updateCustomCoverState(false);
          }
          // Remove botão de desfazer da barra superior
          document.getElementById('btnHeaderResetCover')?.remove();
        }
      }
    } catch (err) {
      console.error('Erro ao redefinir capa:', err);
      window.showToast(err.message || 'Erro ao redefinir capa do vídeo');
    }
  }

  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  normalizeSearch(s) {
    if (s === null || s === undefined) return '';
    return String(s)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  matchesSearch(text, rawQuery) {
    if (!text || !rawQuery) return false;
    const query = this.normalizeSearch(rawQuery);
    if (!query) return false;
    const norm = this.normalizeSearch(text);
    if (norm.includes(query)) return true;

    const cleanNorm = norm.replace(/[-_./\\]+/g, ' ');
    const cleanQuery = query.replace(/[-_./\\]+/g, ' ').trim();
    if (cleanQuery && cleanNorm.includes(cleanQuery)) return true;

    const terms = cleanQuery.split(/\s+/).filter(Boolean);
    if (terms.length > 0 && terms.every(t => cleanNorm.includes(t) || norm.includes(t))) return true;
    return false;
  }

  matchesItemSearch(item, rawQuery) {
    if (!item || !rawQuery) return false;
    const detectedExt = (this.getFileExtension(item) || '').replace(/^\./, '');
    const itemType = this.getItemType(item);
    const typeKeywords = {
      image: 'foto fotos imagem imagens picture photo',
      video: 'video videos filme film clipe',
      audio: 'audio audios som musica soundtrack trilha',
      pdf: 'pdf pdfs documento documentos texto doc',
      archive: 'zip rar 7z pacote arquivo compactado compactados'
    }[itemType] || '';

    const subTypeKeywords = item.subType === 'psd'
      ? 'psd photoshop arte artes design layout'
      : (item.subType === 'ai' ? 'ai illustrator vetor vetores vetorizado logo marca' : '');

    const corpus = [
      item.fileName,
      item.title,
      item.name,
      item.folderPath,
      item.extension,
      detectedExt,
      item.resolution,
      item.dimensions,
      item.duration,
      itemType,
      item.subType,
      typeKeywords,
      subTypeKeywords
    ].filter(Boolean).join(' ');

    return this.matchesSearch(corpus, rawQuery);
  }

  matchesFolderSearch(folder, rawQuery) {
    if (!folder || !rawQuery) return false;
    const corpus = [
      folder.name,
      folder.path,
      'pasta pastas folder folders dir subpasta'
    ].filter(Boolean).join(' ');
    return this.matchesSearch(corpus, rawQuery);
  }

  getFileExtension(item) {
    if (!item) return '';

    // 1. First priority: fileName
    if (item.fileName && typeof item.fileName === 'string') {
      const match = item.fileName.trim().match(/\.([a-zA-Z0-9_-]+)$/);
      if (match) return `.${match[1].toLowerCase()}`;
    }

    // 2. Second priority: extension field
    if (item.extension && typeof item.extension === 'string') {
      const clean = item.extension.trim().replace(/^\./, '').toLowerCase();
      if (clean) return `.${clean}`;
    }

    // 3. Third priority: check if title has an extension
    if (item.title && typeof item.title === 'string') {
      const match = item.title.trim().match(/\.([a-zA-Z0-9_-]+)$/);
      if (match) return `.${match[1].toLowerCase()}`;
    }

    // 4. Fourth priority: mimeType
    if (item.mimeType && typeof item.mimeType === 'string') {
      const mime = item.mimeType.toLowerCase();
      if (mime.includes('mp4')) return '.mp4';
      if (mime.includes('quicktime')) return '.mov';
      if (mime.includes('webm')) return '.webm';
      if (mime.includes('matroska') || mime.includes('mkv')) return '.mkv';
      if (mime.includes('jpeg') || mime.includes('jpg')) return '.jpg';
      if (mime.includes('png')) return '.png';
      if (mime.includes('webp')) return '.webp';
      if (mime.includes('gif')) return '.gif';
      if (mime.includes('wav')) return '.wav';
      if (mime.includes('mpeg') || mime.includes('mp3')) return '.mp3';
      if (mime.includes('zip')) return '.zip';
      if (mime.includes('pdf')) return '.pdf';
    }

    // 5. Fallback based on type or isAlpha
    if (item.isAlpha) return '.mov';
    if (item.type === 'video') return '.mp4';
    if (item.type === 'image') return '.jpg';
    if (item.type === 'audio') return '.mp3';
    if (item.type === 'archive') return '.zip';

    return '';
  }

  getItemType(item) {
    if (!item) return 'file';
    const name = String(item.fileName || item.title || '').toLowerCase();
    const mime = String(item.mimeType || '').toLowerCase();
    const ext = (name.split('.').pop() || '').toLowerCase();
    if (item.type === 'pdf' || item.subType === 'pdf' || ext === 'pdf' || mime === 'application/pdf') return 'pdf';
    if (ext === 'psd' || ext === 'ai' || item.subType === 'psd' || item.subType === 'ai' || mime === 'image/x-photoshop' || mime === 'image/vnd.adobe.photoshop' || mime === 'application/illustrator') return 'image';
    if (item.type === 'audio') return 'audio';
    if (item.type === 'image') return 'image';
    if (item.type === 'archive') return 'archive';
    if (item.type === 'video') return 'video';
    if (mime.startsWith('audio/') || /\.(mp3|wav|aac|flac|ogg|m4a|aiff|aif|wma|opus|alac|mid|midi)$/i.test(name)) return 'audio';
    if (mime.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|tiff|tif|heic|heif|svg)$/i.test(name)) return 'image';
    if (mime.startsWith('video/') || /\.(mp4|mov|m4v|webm|mkv|avi|flv|wmv|prores)$/i.test(name)) return 'video';
    if (['application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed', 'application/vnd.rar', 'application/x-7z-compressed'].includes(mime) || /\.(zip|rar|7z|tar|gz|bz2)$/i.test(name)) return 'archive';
    return item.type || 'file';
  }

  getDisplayTitle(item) {
    if (!item) return '';
    const rawTitle = (item.title || item.fileName || '').trim();
    if (!rawTitle) return '';

    const showExt = Boolean(this.data?.settings?.showFileExtensions);
    const ext = this.getFileExtension(item);

    // Remove any trailing extension from rawTitle so we have a clean baseTitle
    let baseTitle = rawTitle;
    if (ext && baseTitle.toLowerCase().endsWith(ext.toLowerCase())) {
      baseTitle = baseTitle.slice(0, -ext.length);
    } else {
      baseTitle = baseTitle.replace(/\.(mp4|mov|mkv|webm|avi|m4v|jpg|jpeg|png|webp|gif|wav|mp3|aac|flac|ogg|m4a|zip|rar|7z|tar|gz|pdf|psd|ai|prproj|aep)$/i, '');
    }

    if (showExt && ext) {
      return `${baseTitle}${ext}`;
    }
    return baseTitle;
  }

  getCategoryTagSvg(color = null) {
    const fill = color || 'var(--brand-orange)';
    return `<svg class="cat-tag-icon" width="13" height="13" viewBox="0 0 24 24" fill="${fill}" style="color: ${fill}; flex-shrink: 0;"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>`;
  }

  getCategories() {
    if (this.data && Array.isArray(this.data.categories) && this.data.categories.length > 0) {
      return [...this.data.categories]
        .map(c => ({
          id: c.id || c.name,
          name: c.name,
          color: c.color || null,
          svg: this.getCategoryTagSvg(c.color)
        }))
        .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { numeric: true, sensitivity: 'base' }));
    }
    return [{
      id: 'cat-padrao',
      name: 'Categoria Padrão',
      color: null,
      svg: this.getCategoryTagSvg(null)
    }];
  }

  populateCategorySelects(selectedNew = null, selectedEdit = null, selectedNewDiv = null, selectedEditDiv = null) {
    const cats = this.getCategories();
    const newSelect = document.getElementById('newProjCategory');
    const newDivSelect = document.getElementById('newProjDivision');
    if (newSelect) {
      newSelect.innerHTML = cats.map((c, i) =>
        `<option value="${c.name}" ${selectedNew === c.name || (!selectedNew && i === 0) ? 'selected' : ''}>${c.name}</option>`
      ).join('');
      if (newDivSelect) {
        this.populateDivisionSelect(newDivSelect, newSelect.value, selectedNewDiv);
      }
      newSelect.onchange = () => {
        if (newDivSelect) {
          this.populateDivisionSelect(newDivSelect, newSelect.value);
        }
      };
    }
    const editSelect = document.getElementById('editProjCategory');
    const editDivSelect = document.getElementById('editProjDivision');
    if (editSelect) {
      editSelect.innerHTML = cats.map((c, i) =>
        `<option value="${c.name}" ${selectedEdit === c.name || (!selectedEdit && i === 0) ? 'selected' : ''}>${c.name}</option>`
      ).join('');
      if (editDivSelect) {
        this.populateDivisionSelect(editDivSelect, editSelect.value, selectedEditDiv);
      }
      editSelect.onchange = () => {
        if (editDivSelect) {
          this.populateDivisionSelect(editDivSelect, editSelect.value);
        }
      };
    }
  }

  async loginAuthor(user) {
    if (!user) return;
    this.authorSession = user;
    await this.fetchData();
    if (this.notificationsManager) {
      this.notificationsManager.fetchNotifications({ triggerToast: false });
    }
    const displayName = this.getAuthorBrandName() || user.name || user.email;
    window.showToast(`Conectado como ${displayName}`);
    this.detectRoute();
    this.render();
  }

  async logoutAuthor() {
    await window.Auth.logout();
    this.authorSession = null;
    this.selectedProject = null;
    this.selectedVideo = null;
    this.data = null;
    await this.fetchData();
    window.showToast('Sessão encerrada');
    this.detectRoute();
  }

  bindAuthorLoginGateEvents() {
    const btnConnect = document.getElementById('btnConnectAuthorDriveGoogle');
    const errorEl = document.getElementById('authorLoginError');
    const noticeEl = document.getElementById('authorGateNotice');

    const btnToggleAbout = document.getElementById('btnToggleAboutPopover');
    const aboutPopover = document.getElementById('aboutPopover');
    const btnCloseAbout = document.getElementById('btnCloseAboutPopover');

    if (btnToggleAbout && aboutPopover) {
      const positionArrow = () => {
        const btnRect = btnToggleAbout.getBoundingClientRect();
        const popoverRect = aboutPopover.getBoundingClientRect();
        const arrowEl = aboutPopover.querySelector('.popover-arrow-up');
        if (arrowEl && popoverRect.width > 0) {
          const btnCenter = btnRect.left + (btnRect.width / 2);
          const arrowOffset = btnCenter - popoverRect.left;
          const clampedOffset = Math.max(16, Math.min(popoverRect.width - 16, arrowOffset));
          arrowEl.style.left = `${clampedOffset}px`;
          arrowEl.style.transform = 'translateX(-50%) rotate(45deg)';
        }
      };

      btnToggleAbout.onclick = (e) => {
        e.stopPropagation();
        const isOpen = aboutPopover.style.display !== 'none';
        if (isOpen) {
          aboutPopover.style.display = 'none';
          btnToggleAbout.classList.remove('active');
        } else {
          aboutPopover.style.display = 'block';
          btnToggleAbout.classList.add('active');
          requestAnimationFrame(positionArrow);
        }
      };

      window.addEventListener('resize', () => {
        if (aboutPopover.style.display !== 'none') {
          positionArrow();
        }
      });

      if (btnCloseAbout) {
        btnCloseAbout.onclick = (e) => {
          e.stopPropagation();
          aboutPopover.style.display = 'none';
          btnToggleAbout.classList.remove('active');
        };
      }

      if (!this._aboutPopoverDocClickBound) {
        this._aboutPopoverDocClickBound = true;
        document.addEventListener('click', (e) => {
          const popover = document.getElementById('aboutPopover');
          const btn = document.getElementById('btnToggleAboutPopover');
          if (popover && popover.style.display !== 'none') {
            if (!popover.contains(e.target) && (!btn || !btn.contains(e.target))) {
              popover.style.display = 'none';
              if (btn) btn.classList.remove('active');
            }
          }
        });

        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            const popover = document.getElementById('aboutPopover');
            const btn = document.getElementById('btnToggleAboutPopover');
            if (popover && popover.style.display !== 'none') {
              popover.style.display = 'none';
              if (btn) btn.classList.remove('active');
            }
          }
        });
      }
    }

    if (noticeEl) {
      noticeEl.style.display = 'none';
    }

    if (btnConnect) {
      btnConnect.onclick = async () => {
        if (errorEl) errorEl.textContent = '';
        btnConnect.disabled = true;
        try {
          const user = await window.Auth.signIn('author', { switchAccount: true });
          if (!user) {
            throw new Error('Não foi possível entrar com o Google.');
          }
          await this.loginAuthor(user);
        } catch (err) {
          if (errorEl && err.message !== 'Login cancelado') {
            errorEl.textContent = err.message || 'Não foi possível entrar com o Google.';
          }
        } finally {
          btnConnect.disabled = false;
        }
      };
    }
  }

  handlePwaStartup() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) {
      document.documentElement.classList.add('is-pwa-standalone');
      try {
        localStorage.setItem('giffu_pwa_installed', 'true');
      } catch (e) {}
      try {
        const targetUrl = localStorage.getItem('giffu_pwa_target_url');
        if (targetUrl) {
          const u = new URL(targetUrl, window.location.origin);
          if (u.origin === window.location.origin) {
            localStorage.removeItem('giffu_pwa_target_url');
            if (window.location.href !== u.href) {
              window.location.replace(u.href);
              return true;
            }
          }
        }
      } catch (e) {
        localStorage.removeItem('giffu_pwa_target_url');
      }
    }
    return false;
  }

  getMobilePlatform() {
    const ua = navigator.userAgent || '';
    const isIPad = /iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua));
    const isIPhone = /iPhone|iPod/i.test(ua);
    const isIOS = isIPhone || isIPad;
    const isAndroid = /Android/i.test(ua);
    const isChromeIOS = isIOS && /CriOS/i.test(ua);
    const isSafariIOS = isIOS && !isChromeIOS;
    const isMobile = isIOS || isAndroid || (navigator.maxTouchPoints > 0) || ('ontouchstart' in window);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    return { isMobile, isIOS, isIPhone, isIPad, isAndroid, isChromeIOS, isSafariIOS, isStandalone };
  }

  async init() {
    if (this.handlePwaStartup()) return;
    this.setupTheme();
    this.setupMobileOrientationGuard();
    this.setupMediaSessionCleanup();
    await window.Auth.init();
    this.authorSession = this.loadAuthorSession();
    await this.fetchData();
    this.initNotificationsManager();
    this.detectRoute();
    this.bindGlobalEvents();
    this.setupCategoryContextMenu();
    this.setupUniversalContextMenu();
    this.setupAddCategoryColorPicker();
  }

  setupMediaSessionCleanup() {
    const cleanupMediaSession = () => {
      if (this.playerInstance) {
        try {
          this.playerInstance.destroy();
        } catch (e) {}
        this.playerInstance = null;
      }
      if ('mediaSession' in navigator) {
        try {
          navigator.mediaSession.playbackState = 'none';
          navigator.mediaSession.metadata = null;
        } catch (e) {}
      }
      document.querySelectorAll('video, audio').forEach(el => {
        try {
          el.pause();
          el.removeAttribute('src');
          el.load();
        } catch (e) {}
      });
    };

    window.addEventListener('pagehide', cleanupMediaSession);
    window.addEventListener('beforeunload', cleanupMediaSession);
  }

  initNotificationsManager() {
    if (!this.notificationsManager) {
      this.notificationsManager = new NotificationsManager(this);
    }
    const bellMount = document.getElementById('notificationsBellMount');
    if (bellMount) {
      this.notificationsManager.mountBell(bellMount);
    }
  }

  setupMobileOrientationGuard() {
    const lockPortrait = (e) => {
      if (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.body.classList.contains('video-fullscreen-active') ||
        document.body.classList.contains('photo-fullscreen-active') ||
        (this.playerInstance && this.playerInstance.isFullscreen && this.playerInstance.isFullscreen())
      ) {
        return;
      }
      if (e && e.target && e.target.closest && e.target.closest('#btnFullscreen, #btnFullscreenPhoto, .custom-player-wrapper, .custom-image-wrapper, .comment-lightbox-backdrop')) {
        return;
      }
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('portrait').catch(() => {});
      }
    };

    // Attempt lock portrait early and on user interaction (exceto quando o player estiver em tela cheia)
    lockPortrait();
    window.addEventListener('click', lockPortrait, { passive: true });
    window.addEventListener('touchstart', lockPortrait, { passive: true });

    const guard = document.getElementById('mobilePortraitGuard');
    const btnGuardWatch = document.getElementById('btnGuardWatchFullscreen');

    if (btnGuardWatch) {
      btnGuardWatch.onclick = () => {
        if (this.playerInstance) {
          const info = this.playerInstance.getOrientationInfo();
          this.playerInstance.play();
          this.playerInstance.enterFullscreen(info.direction);
          if (guard) guard.style.display = 'none';
        }
      };
    }

    const checkOrientation = () => {
      const isMobile = ('ontouchstart' in window) || navigator.maxTouchPoints > 0 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (!isMobile) {
        if (guard) guard.style.display = 'none';
        return;
      }

      let angle = 0;
      let type = '';
      if (screen.orientation) {
        angle = screen.orientation.angle || 0;
        type = screen.orientation.type || '';
      } else if (typeof window.orientation !== 'undefined') {
        angle = window.orientation;
      }
      if (angle === -90) angle = 270;

      const isLandscape = (angle === 90 || angle === 270 || type.startsWith('landscape') || (window.innerWidth > window.innerHeight && window.innerHeight < 600));

      const isVideoFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        (this.playerInstance && this.playerInstance.video && this.playerInstance.video.webkitDisplayingFullscreen) ||
        document.body.classList.contains('video-fullscreen-active') ||
        document.body.classList.contains('photo-fullscreen-active') ||
        (this.playerInstance && this.playerInstance.isFullscreen && this.playerInstance.isFullscreen()) ||
        document.querySelector('.custom-image-wrapper.is-fullscreen')
      );

      const isVideoPlaying = !!(
        this.playerInstance &&
        this.playerInstance.video &&
        !this.playerInstance.video.paused &&
        !this.playerInstance.video.ended
      );

      if (isLandscape) {
        if (isVideoPlaying) {
          // Playing video: fullscreen in the direction rotated (exceto vídeos verticais)
          if (guard) guard.style.display = 'none';
          if (this.playerInstance && !isVideoFullscreen && !this.playerInstance.isVerticalVideo()) {
            const direction = (angle === 270 || type === 'landscape-secondary') ? 'landscape-secondary' : 'landscape-primary';
            this.playerInstance._enteredFullscreenViaRotate = true;
            this.playerInstance.enterFullscreen(direction);
          }
        } else if (isVideoFullscreen) {
          // Already in fullscreen
          if (guard) guard.style.display = 'none';
        } else {
          // On mobile in landscape, but no video playing:
          // Keep page from turning by showing the guard
          if (guard) {
            guard.style.display = 'flex';
            if (btnGuardWatch) {
              btnGuardWatch.style.display = (this.playerInstance && this.playerInstance.video) ? 'inline-flex' : 'none';
            }
          }
        }
      } else {
        // Portrait mode: oculta apenas o guard; o ciclo de tela cheia é controlado pelo CustomVideoPlayer
        // para permitir tela cheia com rotação automática mesmo quando o lock rotation do celular está ativo
        if (guard) guard.style.display = 'none';
      }
    };

    window.addEventListener('orientationchange', () => setTimeout(checkOrientation, 150));
    if (screen.orientation) {
      screen.orientation.addEventListener('change', () => setTimeout(checkOrientation, 100));
    }
    window.addEventListener('resize', checkOrientation);
    document.addEventListener('fullscreenchange', checkOrientation);
    document.addEventListener('webkitfullscreenchange', checkOrientation);
  }

  getDefaultColor() {
    return this.data?.settings?.defaultColor || window.__SERVER_DEFAULT_COLOR__ || (this.authorSession ? localStorage.getItem('giffu_default_color') : null) || '#FF5400';
  }

  applyThemeColor(hex) {
    if (!hex || typeof hex !== 'string') hex = '#FF5400';
    hex = hex.trim();
    if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)) hex = '#FF5400';

    const r = parseInt(hex.length === 4 ? hex[1] + hex[1] : hex.slice(1, 3), 16);
    const g = parseInt(hex.length === 4 ? hex[2] + hex[2] : hex.slice(3, 5), 16);
    const b = parseInt(hex.length === 4 ? hex[3] + hex[3] : hex.slice(5, 7), 16);

    const subtle = `rgba(${r}, ${g}, ${b}, 0.12)`;
    const glow = `rgba(${r}, ${g}, ${b}, 0.28)`;
    const hoverR = Math.min(255, Math.max(0, Math.round(r * 1.12)));
    const hoverG = Math.min(255, Math.max(0, Math.round(g * 1.12)));
    const hoverB = Math.min(255, Math.max(0, Math.round(b * 1.12)));
    const hover = `#${hoverR.toString(16).padStart(2, '0')}${hoverG.toString(16).padStart(2, '0')}${hoverB.toString(16).padStart(2, '0')}`;

    document.documentElement.style.setProperty('--brand-orange', hex);
    document.documentElement.style.setProperty('--brand-orange-subtle', subtle);
    document.documentElement.style.setProperty('--brand-orange-glow', glow);
    document.documentElement.style.setProperty('--brand-orange-hover', hover);

    if (CATEGORY_COLORS[0]) {
      CATEGORY_COLORS[0].hex = hex;
    }

    const ctxDefaultCircle = document.querySelector('#ctxSwatchDefaultBtn .ctx-swatch-circle');
    if (ctxDefaultCircle) ctxDefaultCircle.style.backgroundColor = hex;
    const ctxBtnDefaultCircle = document.querySelector('#ctxBtnDefaultColor .context-swatch-lg');
    if (ctxBtnDefaultCircle) ctxBtnDefaultCircle.style.backgroundColor = hex;
    const newCatDefaultCircle = document.querySelector('#btnAddCatDefaultColor .new-cat-swatch-lg');
    if (newCatDefaultCircle) newCatDefaultCircle.style.backgroundColor = hex;
  }

  renderSettingsColorPicker(activeHex) {
    const grid = document.getElementById('settingsThemeColorGrid');
    const hiddenInput = document.getElementById('settingDefaultColor');
    const nameLabel = document.getElementById('settingDefaultColorName');
    if (!grid) return;

    if (!activeHex) activeHex = this.getDefaultColor();
    activeHex = activeHex.toLowerCase();

    if (hiddenInput) hiddenInput.value = activeHex;
    const currentObj = SYSTEM_THEME_COLORS.find(c => c.hex.toLowerCase() === activeHex) || SYSTEM_THEME_COLORS[0];
    if (nameLabel) {
      nameLabel.textContent = currentObj.name;
      nameLabel.style.color = currentObj.hex;
    }

    grid.innerHTML = SYSTEM_THEME_COLORS.map(c => {
      const isSelected = c.hex.toLowerCase() === activeHex;
      return `
        <button type="button" class="settings-color-btn ${isSelected ? 'selected' : ''}" data-color="${c.hex}" data-name="${c.name}" title="${c.name}" style="background-color: ${c.hex};" aria-label="${c.name}">
          ${isSelected ? '<span class="settings-color-check">✓</span>' : ''}
        </button>
      `;
    }).join('');

    grid.querySelectorAll('.settings-color-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const hex = btn.getAttribute('data-color');
        const name = btn.getAttribute('data-name');
        if (!hex) return;
        if (hiddenInput) hiddenInput.value = hex;
        if (nameLabel) {
          nameLabel.textContent = name;
          nameLabel.style.color = hex;
        }
        grid.querySelectorAll('.settings-color-btn').forEach(b => {
          b.classList.remove('selected');
          b.innerHTML = '';
        });
        btn.classList.add('selected');
        btn.innerHTML = '<span class="settings-color-check">✓</span>';
        this.applyThemeColor(hex);
      });
    });
  }

  setupTheme() {
    const savedTheme = localStorage.getItem('giffu_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);
    this.applyThemeColor(this.getDefaultColor());
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('giffu_theme', next);
    this.updateThemeIcon(next);
    if (this.authorSession && window.API && typeof window.API.saveSettings === 'function') {
      window.API.saveSettings({ theme: next }).catch(() => {});
    }
  }

  syncUiPreferencesToCloud(partialSettings) {
    if (!this.authorSession || !window.API || typeof window.API.saveSettings !== 'function') return;
    this._pendingUiSettings = { ...(this._pendingUiSettings || {}), ...partialSettings };
    if (this._uiSyncTimer) clearTimeout(this._uiSyncTimer);
    this._uiSyncTimer = setTimeout(() => {
      const payload = this._pendingUiSettings;
      this._pendingUiSettings = null;
      if (payload) {
        window.API.saveSettings(payload).catch(() => {});
      }
    }, 800);
  }

  updateThemeIcon(theme) {
    const btn = document.getElementById('themeToggleBtn');
    if (!btn) return;
    if (theme === 'light') {
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>`;
      btn.title = "Alternar para Modo Escuro";
    } else {
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>`;
      btn.title = "Alternar para Modo Claro";
    }
  }

  async fetchData() {
    try {
      this.data = await window.API.getData();
      if (this.data && Array.isArray(this.data.projects)) {
        this.data.projects.sort((a, b) => 
          (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' })
        );
      }
      if (this.data && Array.isArray(this.data.categories)) {
        this.data.categories.sort((a, b) => 
          (a.name || '').localeCompare(b.name || '', 'pt-BR', { numeric: true, sensitivity: 'base' })
        );
      }
      // Sincroniza preferências salvas na conta em nuvem quando logado como autor
      if (this.authorSession && this.data && this.data.settings) {
        const s = this.data.settings;
        if (s.theme && (s.theme === 'dark' || s.theme === 'light')) {
          document.documentElement.setAttribute('data-theme', s.theme);
          localStorage.setItem('giffu_theme', s.theme);
          this.updateThemeIcon(s.theme);
        }
        if (s.defaultViewMode && (s.defaultViewMode === 'grid' || s.defaultViewMode === 'columns')) {
          localStorage.setItem('giffu_default_view_mode', s.defaultViewMode);
        }
        if (s.videoCoverMode && (s.videoCoverMode === 'first_frame' || s.videoCoverMode === 'auto')) {
          localStorage.setItem('giffu_video_cover_mode', s.videoCoverMode);
        }
        if (s.projectViewModes && typeof s.projectViewModes === 'object' && !Array.isArray(s.projectViewModes)) {
          this.projectViewModes = { ...(this.projectViewModes || {}), ...s.projectViewModes };
          localStorage.setItem('giffu_project_view_modes', JSON.stringify(this.projectViewModes));
        }
        if (Array.isArray(s.collapsedYears)) {
          this.sidebarCollapsedYears = new Set(s.collapsedYears);
          localStorage.setItem('giffu_sidebar_collapsed_years', JSON.stringify(s.collapsedYears));
        }
        if (Array.isArray(s.collapsedCategories)) {
          this.sidebarCollapsedCategories = new Set(s.collapsedCategories);
          localStorage.setItem('giffu_sidebar_collapsed_categories', JSON.stringify(s.collapsedCategories));
        }
        if (Array.isArray(s.collapsedDivisions)) {
          this.sidebarCollapsedDivisions = new Set(s.collapsedDivisions);
          localStorage.setItem('giffu_sidebar_collapsed_divisions', JSON.stringify(s.collapsedDivisions));
        }
        if (s.defaultColor) {
          localStorage.setItem('giffu_default_color', s.defaultColor);
        }
      }

      // Aplica a cor padrão predominante da conta de autor (tanto para autor quanto para link do cliente)
      const effectiveThemeColor = this.data?.settings?.defaultColor || window.__SERVER_DEFAULT_COLOR__ || this.getDefaultColor();
      this.applyThemeColor(effectiveThemeColor);
    } catch (e) {
      console.error('Erro ao buscar dados:', e);
    }
  }

  detectRoute() {
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    const searchParams = new URLSearchParams(window.location.search);
    const hasAuthorProjQuery = Boolean(searchParams.get('project'));
    const isAuthorRoute = parts.length === 0 || parts[0] === 'author';
    const rawCandidate = !isAuthorRoute
      ? ((parts[0] === 'entrega' && parts[1]) ? parts[1] : ((/^\d{4}$/.test(parts[0]) && parts[1]) ? parts[1] : parts[0]))
      : null;
    const candidateCode = rawCandidate ? rawCandidate.toLowerCase() : null;

    // 1. Verificação se os dados já vieram resolvidos pelo backend via resolvedTarget
    // (rota de cliente ou link com ?project=... aberto sem sessão do autor dono do projeto)
    if ((!isAuthorRoute || hasAuthorProjQuery) && this.data && this.data.resolvedTarget && Array.isArray(this.data.projects) && this.data.projects.length > 0) {
      const target = this.data.resolvedTarget;
      const proj = this.data.projects[0];
      if (isAuthorRoute && hasAuthorProjQuery) {
        const cleanShareCode = target.code || proj.shortCode || proj.slug;
        if (cleanShareCode) {
          window.history.replaceState({}, '', `/${cleanShareCode}`);
        }
      }
      this.selectedProject = proj;
      this.isClientMode = true;

      if (target.type === 'file') {
        const vid = (proj.videos || []).find(v => v.id === target.videoId || v.shortCode === target.code || v.driveFileId === target.videoId);
        if (vid) {
          this.selectedVideo = vid;
          this.currentFolderId = vid.driveFolderId || null;
          this.scopedFolderId = null;
          this.isIsolatedFile = true;
          this.currentView = 'client_player';
          this.render();
          return;
        }
        // Quando protegido por senha (isLocked), vídeos só vêm após verificar a senha
        this.selectedVideo = null;
        this.scopedFolderId = null;
        this.isIsolatedFile = true;
        this.currentView = 'client_gallery';
        this.render();
        return;
      } else if (target.type === 'folder') {
        this.scopedFolderId = target.folderId;
        this.currentFolderId = target.folderId;
        this.selectedVideo = null;
        this.isIsolatedFile = false;
        this.currentView = 'client_gallery';
        this.render();
        return;
      } else {
        // 'project'
        this.scopedFolderId = null;
        this.currentFolderId = null;
        this.selectedVideo = null;
        this.isIsolatedFile = false;
        this.currentView = 'client_gallery';
        this.render();
        return;
      }
    }

    // 2. Verificação de shortCode direto na rota atual (navegação local ou popstate)
    if (candidateCode && this.data && Array.isArray(this.data.projects)) {
      for (const proj of this.data.projects) {
        if ((proj.shortCode && proj.shortCode.toLowerCase() === candidateCode) || (proj.slug && proj.slug.toLowerCase() === candidateCode) || proj.id === rawCandidate) {
          this.selectedProject = proj;
          this.isClientMode = true;
          this.scopedFolderId = null;
          this.currentFolderId = null;
          this.selectedVideo = null;
          this.isIsolatedFile = false;
          this.currentView = 'client_gallery';
          this.render();
          return;
        }
        const matchedFolder = (proj.folders || []).find(f => (f.shortCode && f.shortCode.toLowerCase() === candidateCode) || f.id === rawCandidate);
        if (matchedFolder) {
          this.selectedProject = proj;
          this.isClientMode = true;
          this.scopedFolderId = matchedFolder.id;
          this.currentFolderId = matchedFolder.id;
          this.selectedVideo = null;
          this.isIsolatedFile = false;
          this.currentView = 'client_gallery';
          this.render();
          return;
        }
        const matchedVideo = (proj.videos || []).find(v => (v.shortCode && v.shortCode.toLowerCase() === candidateCode) || v.id === rawCandidate);
        if (matchedVideo) {
          this.selectedProject = proj;
          this.isClientMode = true;
          this.selectedVideo = matchedVideo;
          this.currentFolderId = matchedVideo.driveFolderId || null;
          this.scopedFolderId = null;
          this.isIsolatedFile = true;
          this.currentView = 'client_player';
          this.render();
          return;
        }
      }
    }

    let slug = null;
    let videoId = null;

    if (parts[0] === 'entrega' && parts[1]) {
      slug = parts[1];
      videoId = parts[2];
    } else if (/^\d{4}$/.test(parts[0]) && parts[1]) {
      slug = parts[1];
      videoId = parts[2];
    }

    if (slug) {
      const proj = (this.data.projects || []).find(p => p.slug === slug);
      if (proj) {
        this.selectedProject = proj;
        this.isClientMode = true;
        const searchParams = new URLSearchParams(window.location.search);
        const folderParam = searchParams.get('folder') || searchParams.get('pasta') || null;
        const scopeParam = searchParams.get('scope') || null;

        // Se veio scope explícito ou folder inicial na URL de entrega, define o escopo restrito (teto)
        this.scopedFolderId = scopeParam || (folderParam ? folderParam : null);
        this.currentFolderId = folderParam || (this.scopedFolderId || null);

        if (videoId) {
          const vid = (proj.videos || []).find(v => v.id === videoId);
          if (vid) {
            this.selectedVideo = vid;
            this.currentView = 'client_player';
            // Arquivo isolado se acessado via link direto sem parâmetros de pasta/escopo
            this.isIsolatedFile = !folderParam && !scopeParam;
          } else {
            this.currentView = 'client_gallery';
            this.isIsolatedFile = false;
          }
        } else {
          this.currentView = 'client_gallery';
          this.isIsolatedFile = false;
        }

        // Se há escopo de pasta e ela não existe ou currentFolderId saiu do escopo, sanitiza
        if (this.scopedFolderId) {
          const scopedFolder = (proj.folders || []).find(f => f.id === this.scopedFolderId);
          if (scopedFolder) {
            const allowedIds = this.getDescendantFolderIds(proj, this.scopedFolderId);
            allowedIds.add(this.scopedFolderId);
            if (!this.currentFolderId || !allowedIds.has(this.currentFolderId)) {
              this.currentFolderId = this.scopedFolderId;
            }
          } else {
            this.scopedFolderId = null;
          }
        }

        this.render();
        return;
      }
    }

    // Default to Author view: homepage is the directories lobby
    this.isClientMode = false;
    this.isIsolatedFile = false;
    this.scopedFolderId = null;
    const authorProjParam = searchParams.get('project');
    const authorVidParam = searchParams.get('video');
    this.currentFolderId = searchParams.get('folder') || searchParams.get('pasta') || null;

    if (authorProjParam) {
      const proj = (this.data.projects || []).find(p => p.id === authorProjParam || p.slug === authorProjParam);
      if (proj) {
        this.selectedProject = proj;
        if (this.galleryViewMode === 'columns') {
          this.columnsActiveCategory = proj.category || null;
          this.columnsActiveDivisionId = proj.divisionId || null;
          this.columnsPreviewItemId = null;
          this._columnsFocusedColType = 'folders';
          this._columnsFocusedColIndex = null;
        }
        if (authorVidParam) {
          const vid = (proj.videos || []).find(v => v.id === authorVidParam);
          if (vid) {
            this.selectedVideo = vid;
            this.currentView = 'client_player';
            this.render();
            return;
          }
        }
        this.currentView = 'author';
        this.render();
        return;
      }
    }

    // Sem parâmetro de projeto no modo autor: sempre retorna ao dashboard lobby do autor
    this.selectedProject = null;
    this.selectedVideo = null;
    this.currentFolderId = null;
    this.currentView = 'author_lobby';
    this.render();
  }

  isCommentsAllowedForFolder(folder, project) {
    if (!project) return true;
    if (folder && folder.allowComments !== undefined && folder.allowComments !== null) {
      return folder.allowComments !== false;
    }
    const scopedFolderId = this.scopedFolderId;
    let curr = folder;
    const foldersMap = new Map((project.folders || []).map(f => [f.id, f]));
    while (curr && curr.parentId) {
      if (scopedFolderId && curr.id === scopedFolderId) break;
      const parent = foldersMap.get(curr.parentId);
      if (!parent) break;
      if (parent.allowComments !== undefined && parent.allowComments !== null) {
        return parent.allowComments !== false;
      }
      if (scopedFolderId && parent.id === scopedFolderId) break;
      curr = parent;
    }
    return project.allowComments !== false;
  }

  isCommentsAllowedForVideo(item, project) {
    if (!project) return true;
    if (item && item.allowComments !== undefined && item.allowComments !== null) {
      return item.allowComments !== false;
    }
    const scopedFolderId = this.scopedFolderId;
    if (item && (item.folderId || item.driveFolderId)) {
      const fId = item.folderId || item.driveFolderId;
      const foldersMap = new Map((project.folders || []).map(f => [f.id, f]));
      let curr = foldersMap.get(fId);
      while (curr) {
        if (curr.allowComments !== undefined && curr.allowComments !== null) {
          return curr.allowComments !== false;
        }
        if (scopedFolderId && curr.id === scopedFolderId) break;
        if (!curr.parentId) break;
        curr = foldersMap.get(curr.parentId);
      }
    }
    return project.allowComments !== false;
  }

  getInheritedCommentsStateForFolder(folder, project) {
    if (!project) return true;
    const scopedFolderId = this.scopedFolderId;
    let curr = folder;
    const foldersMap = new Map((project.folders || []).map(f => [f.id, f]));
    while (curr && curr.parentId) {
      if (scopedFolderId && curr.id === scopedFolderId) break;
      const parent = foldersMap.get(curr.parentId);
      if (!parent) break;
      if (parent.allowComments !== undefined && parent.allowComments !== null) {
        return parent.allowComments !== false;
      }
      if (scopedFolderId && parent.id === scopedFolderId) break;
      curr = parent;
    }
    return project.allowComments !== false;
  }

  getInheritedCommentsStateForVideo(item, project) {
    if (!project) return true;
    const scopedFolderId = this.scopedFolderId;
    if (item && (item.folderId || item.driveFolderId)) {
      const fId = item.folderId || item.driveFolderId;
      const foldersMap = new Map((project.folders || []).map(f => [f.id, f]));
      let curr = foldersMap.get(fId);
      while (curr) {
        if (curr.allowComments !== undefined && curr.allowComments !== null) {
          return curr.allowComments !== false;
        }
        if (scopedFolderId && curr.id === scopedFolderId) break;
        if (!curr.parentId) break;
        curr = foldersMap.get(curr.parentId);
      }
    }
    return project.allowComments !== false;
  }

  isShareAllowedForFolder(folder, project) {
    if (!project) return true;
    if (folder && folder.allowShare !== undefined && folder.allowShare !== null) {
      return folder.allowShare !== false;
    }
    const scopedFolderId = this.scopedFolderId;
    let curr = folder;
    const foldersMap = new Map((project.folders || []).map(f => [f.id, f]));
    while (curr && curr.parentId) {
      if (scopedFolderId && curr.id === scopedFolderId) break;
      const parent = foldersMap.get(curr.parentId);
      if (!parent) break;
      if (parent.allowShare !== undefined && parent.allowShare !== null) {
        return parent.allowShare !== false;
      }
      if (scopedFolderId && parent.id === scopedFolderId) break;
      curr = parent;
    }
    return project.allowShare !== false;
  }

  isShareAllowedForVideo(item, project) {
    if (!project) return true;
    if (item && item.allowShare !== undefined && item.allowShare !== null) {
      return item.allowShare !== false;
    }
    const scopedFolderId = this.scopedFolderId;
    if (item && (item.folderId || item.driveFolderId)) {
      const fId = item.folderId || item.driveFolderId;
      const foldersMap = new Map((project.folders || []).map(f => [f.id, f]));
      let curr = foldersMap.get(fId);
      while (curr) {
        if (curr.allowShare !== undefined && curr.allowShare !== null) {
          return curr.allowShare !== false;
        }
        if (scopedFolderId && curr.id === scopedFolderId) break;
        if (!curr.parentId) break;
        curr = foldersMap.get(curr.parentId);
      }
    }
    return project.allowShare !== false;
  }

  getInheritedPasswordInfoForFolder(folder, project) {
    if (!project || !folder) return null;
    const foldersMap = new Map((project.folders || []).map(f => [f.id, f]));
    let curr = folder.parentId ? foldersMap.get(folder.parentId) : null;
    const visited = new Set([folder.id]);
    while (curr && !visited.has(curr.id)) {
      visited.add(curr.id);
      if (typeof curr.password === 'string' && curr.password.trim()) {
        return {
          password: curr.password.trim(),
          sourceName: curr.name || 'Pasta',
          sourceType: 'folder',
          sourceId: curr.id
        };
      }
      curr = curr.parentId ? foldersMap.get(curr.parentId) : null;
    }
    if (typeof project.password === 'string' && project.password.trim()) {
      return {
        password: project.password.trim(),
        sourceName: project.name || 'Diretório',
        sourceType: 'project',
        sourceId: project.id
      };
    }
    return null;
  }

  getInheritedPasswordInfoForVideo(item, project) {
    if (!project || !item) return null;
    const fId = item.driveFolderId || item.folderId;
    if (fId) {
      const foldersMap = new Map((project.folders || []).map(f => [f.id, f]));
      let curr = foldersMap.get(fId);
      const visited = new Set();
      while (curr && !visited.has(curr.id)) {
        visited.add(curr.id);
        if (typeof curr.password === 'string' && curr.password.trim()) {
          return {
            password: curr.password.trim(),
            sourceName: curr.name || 'Pasta',
            sourceType: 'folder',
            sourceId: curr.id
          };
        }
        curr = curr.parentId ? foldersMap.get(curr.parentId) : null;
      }
    }
    if (typeof project.password === 'string' && project.password.trim()) {
      return {
        password: project.password.trim(),
        sourceName: project.name || 'Diretório',
        sourceType: 'project',
        sourceId: project.id
      };
    }
    return null;
  }

  getEffectivePasswordForFolder(folder, project) {
    if (!folder) return '';
    if (typeof folder.password === 'string' && folder.password.trim()) {
      return folder.password.trim();
    }
    const inherited = this.getInheritedPasswordInfoForFolder(folder, project);
    return inherited ? inherited.password : '';
  }

  isFolderPasswordProtected(folder, project) {
    if (!folder) return false;
    if (folder.password === true || (typeof folder.password === 'string' && folder.password.trim())) {
      return true;
    }
    if (!project) return false;
    const foldersMap = new Map((project.folders || []).map(f => [f.id, f]));
    let curr = folder.parentId ? foldersMap.get(folder.parentId) : null;
    const visited = new Set([folder.id]);
    while (curr && !visited.has(curr.id)) {
      visited.add(curr.id);
      if (curr.password === true || (typeof curr.password === 'string' && curr.password.trim())) {
        return true;
      }
      curr = curr.parentId ? foldersMap.get(curr.parentId) : null;
    }
    return Boolean(project.password === true || project.hasOwnPassword || (typeof project.password === 'string' && project.password.trim()));
  }

  isVideoPasswordProtected(item, project) {
    if (!item) return false;
    if (item.password === true || (typeof item.password === 'string' && item.password.trim())) {
      return true;
    }
    if (!project) return false;
    const fId = item.driveFolderId || item.folderId;
    if (fId) {
      const fObj = (project.folders || []).find(f => f.id === fId);
      if (fObj && this.isFolderPasswordProtected(fObj, project)) return true;
    }
    return Boolean(project.password === true || project.hasOwnPassword || (typeof project.password === 'string' && project.password.trim()));
  }

  isFolderLockedForClient(folder, project) {
    if (!this.isClientMode || !folder) return false;
    if (this.unlockedSlugs && (this.unlockedSlugs.has(folder.id) || (folder.shortCode && this.unlockedSlugs.has(folder.shortCode)))) {
      return false;
    }
    return Boolean(folder.isLocked);
  }

  isVideoLockedForClient(item, project) {
    if (!this.isClientMode || !item) return false;
    if (this.unlockedSlugs && (this.unlockedSlugs.has(item.id) || (item.shortCode && this.unlockedSlugs.has(item.shortCode)))) {
      return false;
    }
    return Boolean(item.isLocked);
  }

  openEditMediaModal(vid, proj) {
    const modal = document.getElementById('modalEditMedia');
    if (!modal) return;

    this.updateBrandElements();

    const initialTitle = vid.fileName || vid.title || this.getDisplayTitle(vid);
    this.editingMedia = { vid, proj, initialTitle };
    const titleEl = document.getElementById('editMediaTitle');
    if (titleEl) {
      titleEl.value = initialTitle;
    }

    const pwdInput = document.getElementById('editMediaPassword');
    const pwdNotice = document.getElementById('inheritedMediaPasswordNotice');
    const pwdLabel = document.getElementById('labelEditMediaPassword');
    const inheritedPwdInfo = this.getInheritedPasswordInfoForVideo(vid, proj);
    const ownPwd = (typeof vid.password === 'string') ? vid.password.trim() : '';
    if (pwdInput) {
      pwdInput.value = ownPwd || (inheritedPwdInfo ? inheritedPwdInfo.password : '');
      pwdInput.placeholder = inheritedPwdInfo ? 'Protegido pela senha herdada' : 'Sem senha';
    }
    if (pwdLabel) {
      pwdLabel.textContent = inheritedPwdInfo
        ? 'Senha de Acesso (Herdada ou Exclusiva)'
        : 'Senha de Acesso (Deixe em branco para remover)';
    }
    if (pwdNotice) {
      if (inheritedPwdInfo) {
        const srcLabel = inheritedPwdInfo.sourceType === 'folder'
          ? `pela pasta "${inheritedPwdInfo.sourceName}"`
          : `pelo diretório "${inheritedPwdInfo.sourceName}"`;
        pwdNotice.textContent = ownPwd && ownPwd !== inheritedPwdInfo.password
          ? `Usando senha exclusiva (além da proteção ${srcLabel}).`
          : `Protegido automaticamente ${srcLabel}. Digite outra senha exclusiva se desejar.`;
        pwdNotice.style.display = 'block';
      } else {
        pwdNotice.textContent = '';
        pwdNotice.style.display = 'none';
      }
    }

    const checkbox = document.getElementById('editMediaAllowComments');
    if (checkbox) {
      const isAllowed = vid.allowComments !== undefined
        ? vid.allowComments
        : this.isCommentsAllowedForVideo(vid, proj);
      checkbox.checked = Boolean(isAllowed);
    }

    const checkHideBrand = document.getElementById('editMediaHideBrand');
    if (checkHideBrand) {
      const isHide = vid.hideBrandName !== undefined
        ? vid.hideBrandName !== false
        : (proj && proj.hideBrandName !== false);
      checkHideBrand.checked = Boolean(isHide);
    }

    const checkAllowShare = document.getElementById('editMediaAllowShare');
    if (checkAllowShare) {
      const isShare = vid.allowShare !== undefined
        ? vid.allowShare !== false
        : this.isShareAllowedForVideo(vid, proj);
      checkAllowShare.checked = Boolean(isShare);
    }

    modal.classList.add('open');
  }

  openEditFolderModal(folder, proj) {
    const modal = document.getElementById('modalEditFolder');
    if (!modal) return;

    this.updateBrandElements();

    this.editingFolder = { folder, proj };
    const nameEl = document.getElementById('editFolderName');
    if (nameEl) {
      nameEl.value = folder.name || '';
    }

    const pwdInput = document.getElementById('editFolderPassword');
    const pwdNotice = document.getElementById('inheritedFolderPasswordNotice');
    const pwdLabel = document.getElementById('labelEditFolderPassword');
    const inheritedPwdInfo = this.getInheritedPasswordInfoForFolder(folder, proj);
    const ownPwd = (typeof folder.password === 'string') ? folder.password.trim() : '';
    if (pwdInput) {
      pwdInput.value = ownPwd || (inheritedPwdInfo ? inheritedPwdInfo.password : '');
      pwdInput.placeholder = inheritedPwdInfo ? 'Protegido pela senha herdada' : 'Sem senha';
    }
    if (pwdLabel) {
      pwdLabel.textContent = inheritedPwdInfo
        ? 'Senha de Acesso (Herdada ou Exclusiva)'
        : 'Senha de Acesso (Deixe em branco para remover)';
    }
    if (pwdNotice) {
      if (inheritedPwdInfo) {
        const srcLabel = inheritedPwdInfo.sourceType === 'folder'
          ? `pela pasta "${inheritedPwdInfo.sourceName}"`
          : `pelo diretório "${inheritedPwdInfo.sourceName}"`;
        pwdNotice.textContent = ownPwd && ownPwd !== inheritedPwdInfo.password
          ? `Usando senha exclusiva (além da proteção ${srcLabel}).`
          : `Protegido automaticamente ${srcLabel}. Digite outra senha exclusiva se desejar.`;
        pwdNotice.style.display = 'block';
      } else {
        pwdNotice.textContent = '';
        pwdNotice.style.display = 'none';
      }
    }

    const checkbox = document.getElementById('editFolderAllowComments');
    if (checkbox) {
      const isAllowed = folder.allowComments !== undefined
        ? folder.allowComments
        : this.isCommentsAllowedForFolder(folder, proj);
      checkbox.checked = Boolean(isAllowed);
    }

    const checkHideBrand = document.getElementById('editFolderHideBrand');
    if (checkHideBrand) {
      const isHide = folder.hideBrandName !== undefined
        ? folder.hideBrandName !== false
        : (proj && proj.hideBrandName !== false);
      checkHideBrand.checked = Boolean(isHide);
    }

    const checkAllowShare = document.getElementById('editFolderAllowShare');
    if (checkAllowShare) {
      const isShare = folder.allowShare !== undefined
        ? folder.allowShare !== false
        : this.isShareAllowedForFolder(folder, proj);
      checkAllowShare.checked = Boolean(isShare);
    }

    modal.classList.add('open');
  }

  pinFolder(folder = null, proj = null) {
    if (!folder || !proj) {
      const currentG = this.getGalleryData();
      if (!currentG || !currentG.currentFolder || !currentG.proj) return;
      folder = currentG.currentFolder;
      proj = currentG.proj;
    }
    this.pendingPinFolder = { folder, proj };
    const modal = document.getElementById('modalConfirmPinFolder');
    const titleEl = document.getElementById('modalConfirmPinFolderTitle');
    if (titleEl) {
      titleEl.textContent = `Fixar "${folder.name}" como novo diretório?`;
    }
    if (modal) {
      modal.classList.add('open');
    }
  }

  pinCurrentFolder() {
    this.pinFolder();
  }

  async executePinCurrentFolder() {
    let folder = null;
    let proj = null;
    if (this.pendingPinFolder) {
      folder = this.pendingPinFolder.folder;
      proj = this.pendingPinFolder.proj;
      this.pendingPinFolder = null;
    } else {
      const currentG = this.getGalleryData();
      if (!currentG || !currentG.currentFolder || !currentG.proj) return;
      folder = currentG.currentFolder;
      proj = currentG.proj;
    }

    let driveLink = '';
    if (proj.cloudProvider && proj.cloudProvider !== 'google') {
      driveLink = folder.url || folder.path || proj.driveLink || folder.id;
    } else {
      driveLink = `https://drive.google.com/drive/folders/${folder.id}`;
    }

    const pinBtn = document.getElementById('btnPinFolder');
    try {
      if (pinBtn) {
        pinBtn.disabled = true;
        pinBtn.style.opacity = '0.5';
        pinBtn.style.pointerEvents = 'none';
      }
      window.showToast('Espelhando pasta como novo diretório...');

      if (driveLink && window.Auth && !window.Auth.driveConnected && (!proj.cloudProvider || proj.cloudProvider === 'google')) {
        const user = await window.Auth.signIn('author');
        if (user) this.authorSession = user;
      }

      const newProj = await window.API.createProject({
        name: folder.name,
        clientName: proj.clientName || 'Cliente',
        category: proj.category,
        divisionId: proj.divisionId || null,
        driveLink: driveLink,
        password: this.getEffectivePasswordForFolder(folder, proj) || proj.password || '',
        allowComments: proj.allowComments !== undefined ? proj.allowComments : true,
        allowShare: proj.allowShare !== undefined ? proj.allowShare : true,
        hideBrandName: Boolean(proj.hideBrandName),
        year: proj.year || (proj.division || new Date().getFullYear().toString())
      });

      await this.fetchData();
      window.showToast(`Pasta "${folder.name}" fixada como diretório com sucesso! ✓`);

      const created = (this.projects || []).find(p => p.id === newProj.id) || newProj;
      this.selectedProject = created;
      this.currentFolderId = null;
      if (this.isClientMode) {
        window.history.pushState({}, '', `/${created.shortCode || created.slug}`);
      } else {
        window.history.pushState({}, '', `/author?project=${encodeURIComponent(created.id)}`);
      }
      this.syncSidebarActiveProject(created);
      this.render();
    } catch (err) {
      alert('Erro ao fixar pasta como diretório: ' + (err.message || err));
    } finally {
      if (pinBtn) {
        pinBtn.disabled = false;
        pinBtn.style.opacity = '';
        pinBtn.style.pointerEvents = '';
      }
    }
  }

  async navigateTo(path) {
    window.history.pushState({}, '', path);
    await this.fetchData();
    this.detectRoute();
  }

  render() {
    const loginGate = document.getElementById('authorLoginGate');
    const appContainer = document.querySelector('.app-container');

    // If Author mode and NOT logged in with Google: show login gate
    if (!this.isClientMode && !this.authorSession) {
      if (loginGate) loginGate.style.display = 'flex';
      if (appContainer) appContainer.style.display = 'none';
      this.bindAuthorLoginGateEvents();
      return;
    }

    // Otherwise hide login gate and show app
    if (loginGate) loginGate.style.display = 'none';
    if (appContainer) appContainer.style.display = 'flex';

    this.renderHeader();

    const sidebar = document.getElementById('authorSidebar');
    if (this.isClientMode) {
      if (sidebar) sidebar.style.display = 'none';
    } else {
      if (sidebar) sidebar.style.display = 'flex';
      this.renderSidebar();
    }

    // If client mode and protected with password (project root, subfolder, or file)
    if (this.isClientMode && this.selectedProject) {
      const proj = this.selectedProject;
      const projUnlockKey = proj.id || proj.slug;

      // 1. Diretório raiz (ou link direto de pasta/arquivo ainda bloqueado na origem)
      if ((proj.isLocked || (proj.password && !proj.folders?.length && !proj.videos?.length)) && !this.unlockedSlugs.has(projUnlockKey) && !this.unlockedSlugs.has(proj.slug)) {
        this.renderPasswordGate({
          type: proj.lockedTargetType || (this.isIsolatedFile ? 'file' : (this.scopedFolderId ? 'folder' : 'project')),
          proj,
          folderId: proj.lockedFolderId || this.scopedFolderId || null,
          videoId: proj.lockedVideoId || (this.selectedVideo ? this.selectedVideo.id : null),
          targetName: proj.lockedTargetName || proj.name,
          isRootGate: true,
          canGoBack: false
        });
        return;
      }

      // 2. Arquivo individual selecionado que possui senha própria bloqueada
      if (this.currentView === 'client_player' && this.selectedVideo && this.isVideoLockedForClient(this.selectedVideo, proj)) {
        this.renderPasswordGate({
          type: 'file',
          proj,
          video: this.selectedVideo,
          videoId: this.selectedVideo.id,
          folderId: this.currentFolderId || null,
          targetName: this.getDisplayTitle(this.selectedVideo),
          isRootGate: false,
          canGoBack: !this.isIsolatedFile
        });
        return;
      }

      // 3. Pasta aberta que possui senha própria bloqueada (ou ancestral bloqueado)
      if (this.currentFolderId) {
        const folders = proj.folders || [];
        let checkFid = this.currentFolderId;
        let lockedFolderTarget = null;
        const visited = new Set();
        while (checkFid && !visited.has(checkFid)) {
          visited.add(checkFid);
          const fObj = folders.find(f => f.id === checkFid);
          if (fObj && this.isFolderLockedForClient(fObj, proj)) {
            lockedFolderTarget = fObj;
          }
          if (this.scopedFolderId && checkFid === this.scopedFolderId) break;
          checkFid = fObj ? fObj.parentId : null;
        }
        if (lockedFolderTarget) {
          this.renderPasswordGate({
            type: 'folder',
            proj,
            folder: lockedFolderTarget,
            folderId: lockedFolderTarget.id,
            targetName: lockedFolderTarget.name,
            isRootGate: false,
            canGoBack: this.scopedFolderId !== lockedFolderTarget.id
          });
          return;
        }
      }
    }

    this.renderMainContent();
  }

  renderMainContent(container = null) {
    const mainContainer = container || document.getElementById('mainContentArea');
    if (!mainContainer) return;

    this.updateBrandElements();

    if (this.currentView === 'client_player') {
      this.renderPlayerDetailView(mainContainer);
    } else if (this.currentView === 'author_lobby' || (!this.isClientMode && !this.selectedProject)) {
      this.renderDirectoryLobby(mainContainer);
    } else {
      this.renderGalleryView(mainContainer);
    }
  }

  getAuthorBrandName() {
    return (this.data && this.data.settings && this.data.settings.authorName)
      || (this.authorSession && this.authorSession.name)
      || (this.data && this.data.user && this.data.user.name)
      || 'Giffú';
  }

  getBrandLogoSvg() {
    return `<svg class="brand-badge-logo" viewBox="0 0 1585.74 1030.98" width="22" height="15" fill="currentColor" aria-hidden="true"><path fill="currentColor" d="M86.51,508.26c-.28.3-.55.61-.82.91-1.87-.33-3.73-.63-5.61-.91h6.43Z"/><path fill="currentColor" d="M86.51,508.26c-.28.3-.55.61-.82.91-1.87-.33-3.73-.63-5.61-.91h6.43Z"/><g><path fill="currentColor" d="M331.2,1024.8c-26.64-5.22-52.18-13.64-76.22-24.84C106.1,944.84,0,801.6,0,633.58c0-195.39,143.43-357.25,330.76-386.04-22.01,27.86-34.3,62.6-34.3,99.73v577.31c0,29.93,8.07,58.96,23.33,83.94,3.46,5.66,7.27,11.1,11.41,16.28Z"/><path fill="currentColor" d="M1585.74,693.33c0,122.09-69.26,228.03-170.62,280.62-53.46,36.06-117.43,57.03-186.14,57.03h-636.4l444.28-272.6c49.44-30.34,78.18-83.07,76.87-141.06-1.31-58-32.4-109.38-83.16-137.46l-494.84-273.69c-12.02-6.65-24.56-11.66-37.37-15.05C589.85,74.73,731.91,0,891.42,0c240.88,0,441.95,170.45,489.19,397.33,119.84,44.92,205.13,160.48,205.13,296Z"/></g><g><path fill="currentColor" d="M955.63,698.49l-434.14,266.38c-.14.09-.28.17-.42.25-27.71,16.8-61.1,17.39-89.41,1.54-28.45-15.92-45.44-44.9-45.44-77.5v-506.49c0-31.77,16.34-60.37,43.7-76.51,10.63-6.26,22.1-10.17,33.79-11.69,4.21.59,8.39,1.25,12.55,1.98.52-.89,1.04-1.79,1.57-2.68,13.79.45,27.53,4.17,40.2,11.18l13.91,7.69,420.23,232.42c27.96,15.46,45.09,43.77,45.81,75.71.72,31.94-15.11,60.99-42.34,77.71Z"/><path fill="currentColor" d="M477.83,293.78c-.53.89-1.05,1.78-1.57,2.68-4.16-.74-8.33-1.4-12.55-1.98,3.75-.49,7.53-.74,11.3-.74.94,0,1.88.02,2.82.04Z"/></g></svg>`;
  }

  updateBrandElements() {
    const authorName = this.getAuthorBrandName();

    const labelAdd = document.getElementById('labelNewProjHideBrand');
    if (labelAdd) {
      labelAdd.textContent = `Ocultar o nome ${authorName} para o cliente`;
    }
    const labelEdit = document.getElementById('labelEditProjHideBrand');
    if (labelEdit) {
      labelEdit.textContent = `Ocultar o nome ${authorName} para o cliente`;
    }
    const labelMediaEdit = document.getElementById('labelEditMediaHideBrand');
    if (labelMediaEdit) {
      labelMediaEdit.textContent = `Ocultar o nome ${authorName} para o cliente`;
    }
    const labelFolderEdit = document.getElementById('labelEditFolderHideBrand');
    if (labelFolderEdit) {
      labelFolderEdit.textContent = `Ocultar o nome ${authorName} para o cliente`;
    }

    const sidebarAuthorName = document.getElementById('sidebarAuthorName');
    if (sidebarAuthorName) {
      sidebarAuthorName.textContent = authorName;
    }

    document.querySelectorAll('.brand-author-name').forEach(el => {
      el.textContent = authorName;
    });

    this.updateDocumentTitle();
  }

  updateDocumentTitle() {
    const authorName = this.getAuthorBrandName();
    let hideBrand = this.isClientMode && (this.selectedProject ? (this.selectedProject.hideBrandName !== false) : true);
    if (this.isClientMode && this.currentView === 'client_player' && this.selectedVideo && this.selectedVideo.hideBrandName !== undefined) {
      hideBrand = this.selectedVideo.hideBrandName !== false;
    }
    const defaultAppTitle = hideBrand ? 'Cloud' : `${authorName} Cloud`;

    if (this.currentView === 'client_player' && this.selectedVideo) {
      document.title = this.getDisplayTitle(this.selectedVideo);
    } else if (this.selectedProject) {
      document.title = this.selectedProject.name;
    } else {
      document.title = defaultAppTitle;
    }
  }

  renderHeader() {
    const brandElement = document.getElementById('headerBrand');
    const headerRight = document.getElementById('headerRight');

    if (!headerRight || !brandElement) return;

    const authorName = this.getAuthorBrandName();

    if (this.isClientMode) {
      const clientName = this.selectedProject ? (this.selectedProject.clientName || 'Cliente') : 'Cloud';
      headerRight.innerHTML = `
        <div class="client-header-group">
          <span class="client-name-display">${clientName}</span>
          <div class="notifications-bell-mount" id="notificationsBellMount"></div>
        </div>
      `;

      // Hide author/studio name for client: only "Cloud" is displayed in the brand title
      let hideBrand = this.selectedProject ? (this.selectedProject.hideBrandName !== false) : true;
      if (this.currentView === 'client_player' && this.selectedVideo && this.selectedVideo.hideBrandName !== undefined) {
        hideBrand = this.selectedVideo.hideBrandName !== false;
      }
      if (hideBrand) {
        brandElement.innerHTML = `
          <div class="brand-badge client-brand-badge">
            ${this.getBrandLogoSvg()}
            <span>Cloud</span>
          </div>
        `;
      } else {
        brandElement.innerHTML = `
          <div class="brand-badge client-brand-badge">
            ${this.getBrandLogoSvg()}
            <span class="brand-author-name">${authorName}</span>
            <span class="app-subtitle">Cloud</span>
          </div>
        `;
      }
    } else {
      brandElement.innerHTML = `
        <button class="mobile-menu-btn" id="btnMobileMenuToggle" aria-label="Abrir Menu de Diretórios e Categorias" title="Navegação">
          <svg class="hamburger-icon-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line class="line-1" x1="4" y1="6" x2="20" y2="6"></line>
            <line class="line-2" x1="4" y1="12" x2="20" y2="12"></line>
            <line class="line-3" x1="4" y1="18" x2="20" y2="18"></line>
          </svg>
        </button>
        <div class="brand-badge desktop-brand-badge" id="btnHeaderLobby">
          ${this.getBrandLogoSvg()}
          <span class="brand-author-name">${authorName}</span>
          <span class="app-subtitle">Cloud</span>
        </div>
      `;

      headerRight.innerHTML = `
        <div class="author-header-group">
          <span class="header-mode-tag">Versão Autor</span>
          <div class="notifications-bell-mount" id="notificationsBellMount"></div>
        </div>
      `;
    }

    const bellMount = document.getElementById('notificationsBellMount');
    if (bellMount) {
      if (!this.notificationsManager) {
        this.initNotificationsManager();
      } else {
        this.notificationsManager.mountBell(bellMount);
      }
    }

    const mobileMenuBtn = document.getElementById('btnMobileMenuToggle');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleMobileSidebar();
      });
    }

    const desktopBadge = brandElement.querySelector('.desktop-brand-badge') || brandElement.querySelector('.brand-badge');
    if (desktopBadge) {
      if (this.authorSession || (window.Auth && window.Auth.user) || !this.isClientMode) {
        desktopBadge.style.cursor = 'pointer';
        desktopBadge.title = 'Ir para a homepage de autor';
        desktopBadge.onclick = (e) => {
          e.preventDefault();
          this.goToLobby();
        };
      } else if (this.isClientMode) {
        if (this.isIsolatedFile) {
          // Arquivo isolado: não navega para a galeria/raiz
          desktopBadge.style.cursor = 'default';
          desktopBadge.title = 'Cloud';
          desktopBadge.onclick = (e) => e.preventDefault();
        } else if (this.scopedFolderId) {
          // Pasta com escopo: retorna ao topo da pasta permitida
          desktopBadge.style.cursor = 'pointer';
          const scopedFolder = (this.selectedProject.folders || []).find(f => f.id === this.scopedFolderId);
          desktopBadge.title = `Voltar para ${scopedFolder ? scopedFolder.name : 'a pasta'}`;
          desktopBadge.onclick = (e) => {
            e.preventDefault();
            this.currentFolderId = this.scopedFolderId;
            const code = (scopedFolder && scopedFolder.shortCode) || this.selectedProject.shortCode || this.selectedProject.slug;
            this.navigateTo(`/${code}`);
          };
        } else if (this.selectedProject) {
          desktopBadge.style.cursor = 'pointer';
          desktopBadge.title = 'Voltar para Cloud';
          desktopBadge.onclick = (e) => {
            e.preventDefault();
            this.currentFolderId = null;
            const code = this.selectedProject.shortCode || this.selectedProject.slug;
            this.navigateTo(`/${code}`);
          };
        }
      }
    }
  }

  toggleMobileSidebar(forceOpen) {
    const sidebar = document.getElementById('authorSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    const menuBtn = document.getElementById('btnMobileMenuToggle');
    if (!sidebar) return;

    const shouldOpen = (typeof forceOpen === 'boolean') ? forceOpen : !sidebar.classList.contains('mobile-open');

    if (shouldOpen) {
      sidebar.classList.add('mobile-open');
      backdrop?.classList.add('visible');
      menuBtn?.classList.add('active');
      document.body.classList.add('mobile-sidebar-active');
    } else {
      sidebar.classList.remove('mobile-open');
      backdrop?.classList.remove('visible');
      menuBtn?.classList.remove('active');
      document.body.classList.remove('mobile-sidebar-active');
    }
  }

  closeMobileSidebar() {
    this.toggleMobileSidebar(false);
  }

  async goToLobby() {
    this.closeMobileSidebar();
    if (this.playerInstance) {
      this.playerInstance.destroy();
      this.playerInstance = null;
    }
    this.cleanupPhotoFullscreen();
    this.selectedProject = null;
    this.selectedVideo = null;
    this.currentFolderId = null;
    this.scopedFolderId = null;
    this.isIsolatedFile = false;
    this.gallerySearchQuery = '';
    this.isSelectionMode = false;
    this.selectedMediaIds.clear();
    this.selectedFolderIds.clear();
    this.mediaFilter = 'all';
    this.isClientMode = false;
    this.currentView = 'author_lobby';
    this.authorSession = this.loadAuthorSession();
    window.history.pushState({}, '', '/author');
    await this.fetchData();
    if (this.notificationsManager) {
      this.notificationsManager.fetchNotifications({ triggerToast: false });
    }
    this.render();
  }

  openProject(proj, initialFolderId = null) {
    if (this.playerInstance) {
      this.playerInstance.destroy();
      this.playerInstance = null;
    }
    this.cleanupPhotoFullscreen();
    // Ao abrir um diretório a partir da barra lateral ou lobby, respeita a preferência configurada do projeto
    this._isColumnsNavActive = false;
    this.selectedProject = proj;

    // Se o item for um arquivo solto na divisão (adicionado via link direto de arquivo)
    if (proj.isFile || proj.isIsolatedFile) {
      this.selectedVideo = (proj.videos && proj.videos[0]) || null;
      this.currentFolderId = null;
      this.scopedFolderId = null;
      this.isIsolatedFile = true;
      this.isClientMode = false;
      this.gallerySearchQuery = '';
      this.isSelectionMode = false;
      this.selectedMediaIds.clear();
      this.selectedFolderIds.clear();

      if (this.galleryViewMode === 'columns') {
        this.columnsActiveCategory = proj.category || null;
        this.columnsActiveDivisionId = proj.divisionId || null;
        this.columnsPreviewItemId = this.selectedVideo ? this.selectedVideo.id : null;
        this._columnsFocusedColType = 'projects';
        this.currentView = 'author';
        window.history.pushState({}, '', `/author?project=${encodeURIComponent(proj.id)}`);
      } else {
        this.currentView = this.selectedVideo ? 'client_player' : 'author';
        const targetUrl = this.selectedVideo 
          ? `/author?project=${encodeURIComponent(proj.id)}&video=${encodeURIComponent(this.selectedVideo.id)}`
          : `/author?project=${encodeURIComponent(proj.id)}`;
        window.history.pushState({}, '', targetUrl);
      }

      const catName = proj.category || this.getCategories()[0]?.name;
      if (catName) {
        this.setSidebarCategoryCollapsed(catName, false);
      }
      this.render();
      return;
    }

    this.selectedVideo = null;
    this.currentFolderId = initialFolderId || null;
    this.scopedFolderId = null;
    this.isIsolatedFile = false;
    this.gallerySearchQuery = '';
    this.isSelectionMode = false;
    this.selectedMediaIds.clear();
    this.selectedFolderIds.clear();
    this.mediaFilter = 'all';
    this.isClientMode = false;
    this.currentView = 'author';

    if (this.galleryViewMode === 'columns') {
      this.columnsActiveCategory = proj.category || null;
      this.columnsActiveDivisionId = proj.divisionId || null;
      this.columnsPreviewItemId = null;
      this._columnsFocusedColType = 'folders';
      this._columnsFocusedColIndex = null;
    }

    // Garantir que a categoria deste projeto esteja expandida na barra lateral (sem fechar as demais)
    const catName = proj.category || this.getCategories()[0]?.name;
    if (catName) {
      this.setSidebarCategoryCollapsed(catName, false);
    }

    const folderQuery = initialFolderId ? `&folder=${encodeURIComponent(initialFolderId)}` : '';
    window.history.pushState({}, '', `/author?project=${encodeURIComponent(proj.id)}${folderQuery}`);
    this.render();
  }

  getUnresolvedCommentsCount(videoId) {
    if (!this.data || !this.data.comments) return 0;
    return this.data.comments.filter(c => c.videoId === videoId && !c.resolved).length;
  }

  getUnresolvedCommentsCountForProject(projectId) {
    if (!this.data || !this.data.comments) return 0;
    return this.data.comments.filter(c => c.projectId === projectId && !c.resolved).length;
  }

  getUnresolvedCommentsCountForFolder(project, folderId) {
    if (!project || !folderId || !this.data || !this.data.comments) return 0;
    const folders = project.folders || [];
    const targetFolderIds = new Set([folderId]);
    let added = true;
    while (added) {
      added = false;
      for (const f of folders) {
        if (f.parentId && targetFolderIds.has(f.parentId) && !targetFolderIds.has(f.id)) {
          targetFolderIds.add(f.id);
          added = true;
        }
      }
    }
    const matchingVideoIds = new Set();
    const videos = project.videos || [];
    for (const v of videos) {
      const fid = v.driveFolderId || v.folderId;
      if (fid && targetFolderIds.has(fid)) {
        matchingVideoIds.add(v.id);
      }
    }
    return this.data.comments.filter(c => matchingVideoIds.has(c.videoId) && !c.resolved).length;
  }

  getUnresolvedCommentsCountForDivision(divisionId, categoryName) {
    if (!this.data || !this.data.comments) return 0;
    const allDivs = this.data.divisions || [];
    const catDivs = categoryName ? allDivs.filter(d => d.category === categoryName) : allDivs;
    const targetDivIds = new Set();
    let divObj = null;
    if (divisionId) {
      targetDivIds.add(divisionId);
      divObj = allDivs.find(d => d.id === divisionId);
      let added = true;
      while (added) {
        added = false;
        for (const d of catDivs) {
          if (d.parentId && targetDivIds.has(d.parentId) && !targetDivIds.has(d.id)) {
            targetDivIds.add(d.id);
            added = true;
          }
        }
      }
    }
    const divName = divObj ? divObj.name : null;
    const allProjects = this.data.projects || [];
    let count = 0;
    for (const p of allProjects) {
      if (categoryName && (p.category || 'Categoria Padrão') !== categoryName) continue;
      let matches = false;
      if (p.divisionId && targetDivIds.size > 0) {
        matches = targetDivIds.has(p.divisionId);
      } else if (divName) {
        matches = (this.getProjectDivisionName(p).toLowerCase() === divName.toLowerCase());
      }
      if (matches) {
        count += this.getUnresolvedCommentsCountForProject(p.id);
      }
    }
    return count;
  }

  getUnresolvedCommentsCountForCategory(categoryName) {
    if (!this.data || !this.data.comments) return 0;
    const allProjects = this.data.projects || [];
    let count = 0;
    for (const p of allProjects) {
      const pCat = p.category || (this.getCategories()[0] ? this.getCategories()[0].name : 'Categoria Padrão');
      if (pCat === categoryName) {
        count += this.getUnresolvedCommentsCountForProject(p.id);
      }
    }
    return count;
  }

  loadCollapsedYears() {
    try {
      const raw = localStorage.getItem('giffu_sidebar_collapsed_years');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch (e) {
      console.warn('Error reading collapsed years preference', e);
    }
    return new Set();
  }

  saveCollapsedYears() {
    try {
      if (!this.sidebarCollapsedYears) this.sidebarCollapsedYears = new Set();
      const arr = Array.from(this.sidebarCollapsedYears);
      localStorage.setItem('giffu_sidebar_collapsed_years', JSON.stringify(arr));
      this.syncUiPreferencesToCloud({ collapsedYears: arr });
    } catch (e) {
      console.warn('Error saving collapsed years preference', e);
    }
  }

  isSidebarYearCollapsed(catName, year) {
    if (this.selectedProject) {
      const projCat = this.selectedProject.category || this.getCategories()[0]?.name;
      const projYr = this.selectedProject.year || new Date().getFullYear().toString();
      if (projCat === catName && projYr === year) {
        return false;
      }
    }
    if (!this.sidebarCollapsedYears) this.sidebarCollapsedYears = this.loadCollapsedYears();
    return this.sidebarCollapsedYears.has(`${catName}:${year}`);
  }

  toggleSidebarYear(catName, year, forceCollapsed = null) {
    if (!this.sidebarCollapsedYears) this.sidebarCollapsedYears = this.loadCollapsedYears();
    const key = `${catName}:${year}`;
    const willBeCollapsed = (forceCollapsed !== null) ? forceCollapsed : !this.sidebarCollapsedYears.has(key);
    if (willBeCollapsed) {
      this.sidebarCollapsedYears.add(key);
    } else {
      this.sidebarCollapsedYears.delete(key);
    }
    this.saveCollapsedYears();
    return willBeCollapsed;
  }

  // ==========================================
  // MÉTODOS DE DIVISÕES (Substituição de Anos)
  // ==========================================

  loadCollapsedDivisions() {
    try {
      const raw = localStorage.getItem('giffu_sidebar_collapsed_divisions') || localStorage.getItem('giffu_sidebar_collapsed_years');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch (e) {
      console.warn('Error reading collapsed divisions preference', e);
    }
    return new Set();
  }

  saveCollapsedDivisions() {
    try {
      if (!this.sidebarCollapsedDivisions) this.sidebarCollapsedDivisions = new Set();
      const arr = Array.from(this.sidebarCollapsedDivisions);
      localStorage.setItem('giffu_sidebar_collapsed_divisions', JSON.stringify(arr));
      this.syncUiPreferencesToCloud({ collapsedDivisions: arr });
    } catch (e) {
      console.warn('Error saving collapsed divisions preference', e);
    }
  }

  isSidebarDivisionCollapsed(catName, divId) {
    if (this.selectedProject) {
      const defaultCat = this.getCategories()[0]?.name;
      const projCat = this.selectedProject.category || defaultCat;
      if (projCat === catName) {
        const projDivId = this.selectedProject.divisionId;
        const currentYear = new Date().getFullYear().toString();
        const projDivName = (this.selectedProject.division || this.selectedProject.year || currentYear).toLowerCase();
        const catDivs = this.getDivisionsForCategory(catName);
        const thisDiv = catDivs.find(d => d.id === divId);

        // Se a divisão for diretamente a do projeto
        if ((projDivId && projDivId === divId) || (thisDiv && thisDiv.name && thisDiv.name.toLowerCase() === projDivName)) {
          return false;
        }

        // Se a divisão for pai/ancestral da divisão do projeto (subdivisões em árvore)
        if (projDivId) {
          let curr = catDivs.find(d => d.id === projDivId);
          const visited = new Set();
          while (curr && curr.parentId && !visited.has(curr.id)) {
            visited.add(curr.id);
            if (curr.parentId === divId) return false;
            curr = catDivs.find(d => d.id === curr.parentId);
          }
        }
      }
    }
    if (!this.sidebarCollapsedDivisions) this.sidebarCollapsedDivisions = this.loadCollapsedDivisions();
    return this.sidebarCollapsedDivisions.has(divId) || this.sidebarCollapsedDivisions.has(`${catName}:${divId}`);
  }

  toggleSidebarDivision(catName, divId, forceCollapsed = null) {
    if (!this.sidebarCollapsedDivisions) this.sidebarCollapsedDivisions = this.loadCollapsedDivisions();
    const key = divId;
    const willBeCollapsed = (forceCollapsed !== null) ? forceCollapsed : !this.sidebarCollapsedDivisions.has(key);
    if (willBeCollapsed) {
      this.sidebarCollapsedDivisions.add(key);
      this.sidebarCollapsedDivisions.add(`${catName}:${divId}`);
    } else {
      this.sidebarCollapsedDivisions.delete(key);
      this.sidebarCollapsedDivisions.delete(`${catName}:${divId}`);
    }
    this.saveCollapsedDivisions();
    return willBeCollapsed;
  }

  getDivisionsForCategory(catName) {
    const allDivs = this.data?.divisions || [];
    const catDivs = allDivs.filter(d => d.category === catName);
    if (catDivs.length === 0) {
      const currentYear = new Date().getFullYear().toString();
      return [{
        id: `div-default-${catName}`,
        name: currentYear,
        category: catName,
        parentId: null
      }];
    }
    return catDivs;
  }

  getDefaultDivisionForCategory(catName) {
    const divs = this.getDivisionsForCategory(catName);
    if (divs.length === 0) return null;
    if (divs.length === 1) return divs[0];
    const sorted = [...divs].sort((a, b) => 
      (a.name || '').localeCompare(b.name || '', 'pt-BR', { numeric: true, sensitivity: 'base' })
    );
    // Padrão: a que está por último na ordem alfabética de a-z
    return sorted[sorted.length - 1];
  }

  getProjectDivisionName(proj) {
    if (!proj) return new Date().getFullYear().toString();
    if (proj.divisionId && this.data?.divisions) {
      const match = this.data.divisions.find(d => d.id === proj.divisionId);
      if (match) return match.name;
    }
    return proj.division || proj.year || new Date().getFullYear().toString();
  }

  populateDivisionSelect(selectEl, categoryName, selectedDivisionId = null, excludeDivId = null) {
    if (!selectEl) return;
    const divs = this.getDivisionsForCategory(categoryName);
    const defaultDiv = this.getDefaultDivisionForCategory(categoryName);

    const excludeIds = new Set();
    if (excludeDivId) {
      excludeIds.add(excludeDivId);
      const addDescendants = (pid) => {
        divs.filter(d => d.parentId === pid).forEach(c => {
          excludeIds.add(c.id);
          addDescendants(c.id);
        });
      };
      addDescendants(excludeDivId);
    }

    const topLevel = divs.filter(d => (!d.parentId || !divs.some(p => p.id === d.parentId)) && !excludeIds.has(d.id));
    
    const buildOptions = (items, depth = 0) => {
      let result = [];
      const prefix = depth > 0 ? '— '.repeat(depth) : '';
      items.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { numeric: true, sensitivity: 'base' }));
      for (const item of items) {
        result.push(`<option value="${item.id}">${prefix}${this.escapeHtml(item.name)}</option>`);
        const children = divs.filter(d => d.parentId === item.id && !excludeIds.has(d.id));
        if (children.length > 0) {
          result = result.concat(buildOptions(children, depth + 1));
        }
      }
      return result;
    };

    const optionsHtml = buildOptions(topLevel);
    selectEl.innerHTML = optionsHtml.join('');

    const targetVal = selectedDivisionId || (defaultDiv ? defaultDiv.id : '');
    if (targetVal) {
      selectEl.value = targetVal;
    }
  }

  getActiveCategoryName() {
    // 1. Categoria selecionada no filtro da galeria/lobby
    if (this.lobbyCategoryFilter && this.lobbyCategoryFilter !== 'all') {
      return this.lobbyCategoryFilter;
    }
    // 2. Categoria do projeto atualmente selecionado/aberto
    if (this.selectedProject && this.selectedProject.category) {
      return this.selectedProject.category;
    }
    // 3. Categoria ativa na navegação por colunas
    if (this.columnsActiveCategory) {
      return this.columnsActiveCategory;
    }
    // 4. Nenhuma categoria ativa explicitamente
    return null;
  }

  openAddDivisionModal(defaultCategory = null, defaultParentId = null) {
    const modal = document.getElementById('modalAddDivision');
    if (!modal) return;

    const cats = this.getCategories();
    const catSelect = document.getElementById('newDivisionCategory');
    const parentSelect = document.getElementById('newDivisionParent');
    const nameInput = document.getElementById('newDivisionName');

    if (nameInput) nameInput.value = '';

    // Categoria ativa: caso tenha alguma ativa, caso não, a primeira em ordem alfabética A-Z
    const activeCatName = this.getActiveCategoryName();
    const fallbackFirstAlphabetical = cats[0] ? cats[0].name : 'Categoria Padrão';
    const selectedCat = defaultCategory || activeCatName || fallbackFirstAlphabetical;

    if (catSelect) {
      catSelect.innerHTML = cats.map(c => 
        `<option value="${c.name}" ${c.name === selectedCat ? 'selected' : ''}>${c.name}</option>`
      ).join('');

      const updateParents = () => {
        if (!parentSelect) return;
        const currentCat = catSelect.value;
        const parentOptions = ['<option value="">Nenhuma (Raiz da Categoria)</option>'];
        const tempSelect = document.createElement('select');
        this.populateDivisionSelect(tempSelect, currentCat);
        Array.from(tempSelect.options).forEach(opt => {
          parentOptions.push(`<option value="${opt.value}">${opt.textContent}</option>`);
        });
        parentSelect.innerHTML = parentOptions.join('');
        if (defaultParentId && currentCat === selectedCat) {
          parentSelect.value = defaultParentId;
        } else {
          parentSelect.value = '';
        }
      };

      catSelect.onchange = updateParents;
      updateParents();
    }

    modal.classList.add('open');
    setTimeout(() => nameInput?.focus(), 80);
  }

  openEditDivisionModal(div) {
    if (!div) return;
    const modal = document.getElementById('modalEditDivision');
    if (!modal) return;

    const idInput = document.getElementById('editDivisionId');
    const nameInput = document.getElementById('editDivisionName');
    const catSelect = document.getElementById('editDivisionCategory');
    const parentSelect = document.getElementById('editDivisionParent');

    if (idInput) idInput.value = div.id;
    if (nameInput) nameInput.value = div.name;

    const cats = this.getCategories();
    if (catSelect) {
      catSelect.innerHTML = cats.map(c => 
        `<option value="${c.name}" ${c.name === div.category ? 'selected' : ''}>${c.name}</option>`
      ).join('');

      const updateParents = () => {
        if (!parentSelect) return;
        const currentCat = catSelect.value;
        const parentOptions = ['<option value="">Nenhuma (Raiz da Categoria)</option>'];
        const tempSelect = document.createElement('select');
        this.populateDivisionSelect(tempSelect, currentCat, div.parentId, div.id);
        Array.from(tempSelect.options).forEach(opt => {
          parentOptions.push(`<option value="${opt.value}">${opt.textContent}</option>`);
        });
        parentSelect.innerHTML = parentOptions.join('');
        parentSelect.value = (currentCat === div.category && div.parentId) ? div.parentId : '';
      };

      catSelect.onchange = updateParents;
      updateParents();
    }

    modal.classList.add('open');
    setTimeout(() => nameInput?.focus(), 80);
  }

  confirmDeleteDivision(div) {
    if (!div) return;
    const modal = document.getElementById('modalConfirmDeleteDivision');
    if (!modal) return;

    this.pendingDeleteDivision = div;
    const nameEl = document.getElementById('deleteDivisionNameTarget');
    if (nameEl) nameEl.textContent = `"${div.name}"`;

    modal.classList.add('open');
  }

  closeConfirmDeleteDivisionModal() {
    const modal = document.getElementById('modalConfirmDeleteDivision');
    if (modal) modal.classList.remove('open');
    this.pendingDeleteDivision = null;
  }

  openDivisionContextMenu(e, div) {
    const menu = document.getElementById('divisionContextMenu');
    if (!menu) return;

    this.activeContextMenuDivision = div;
    const nameEl = document.getElementById('ctxDivisionHeaderName');
    if (nameEl) nameEl.textContent = div.name;

    menu.style.display = 'block';
    menu.style.position = 'fixed';

    const menuW = 190;
    const menuH = 140;
    let left = e.clientX;
    let top = e.clientY;

    if (left + menuW > window.innerWidth) left = window.innerWidth - menuW - 10;
    if (top + menuH > window.innerHeight) top = window.innerHeight - menuH - 10;

    menu.style.left = `${Math.max(10, left)}px`;
    menu.style.top = `${Math.max(10, top)}px`;
    menu.style.zIndex = '9999';
  }

  loadCollapsedCategories() {
    try {
      const raw = localStorage.getItem('giffu_sidebar_collapsed_categories');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch (e) {
      console.warn('Error reading collapsed categories preference', e);
    }
    return null;
  }

  saveCollapsedCategories() {
    try {
      if (!this.sidebarCollapsedCategories) this.sidebarCollapsedCategories = new Set();
      const arr = Array.from(this.sidebarCollapsedCategories);
      localStorage.setItem('giffu_sidebar_collapsed_categories', JSON.stringify(arr));
      this.syncUiPreferencesToCloud({ collapsedCategories: arr });
    } catch (e) {
      console.warn('Error saving collapsed categories preference', e);
    }
  }

  isSidebarCategoryCollapsed(catName, categories) {
    if (this.selectedProject) {
      const defaultCat = categories[0]?.name;
      const projCat = this.selectedProject.category || defaultCat;
      if (projCat === catName) return false;
    }
    if (this.sidebarCollapsedCategories === undefined || this.sidebarCollapsedCategories === null) {
      this.sidebarCollapsedCategories = this.loadCollapsedCategories();
    }
    if (this.sidebarCollapsedCategories !== null) {
      return this.sidebarCollapsedCategories.has(catName);
    }
    // Inicialização padrão (primeira visita): mantém apenas a categoria ativa ou primeira aberta
    const activeCat = (this.lobbyCategoryFilter && this.lobbyCategoryFilter !== 'all')
      ? this.lobbyCategoryFilter
      : (categories[0]?.name || null);
    return catName !== activeCat;
  }

  toggleSidebarCategory(catName, forceCollapsed = null) {
    if (this.sidebarCollapsedCategories === undefined || this.sidebarCollapsedCategories === null) {
      this.sidebarCollapsedCategories = this.loadCollapsedCategories() || new Set();
    }
    const willBeCollapsed = (forceCollapsed !== null) ? forceCollapsed : !this.sidebarCollapsedCategories.has(catName);
    if (willBeCollapsed) {
      this.sidebarCollapsedCategories.add(catName);
    } else {
      this.sidebarCollapsedCategories.delete(catName);
    }
    this.saveCollapsedCategories();
    return willBeCollapsed;
  }

  setSidebarCategoryCollapsed(catName, isCollapsed) {
    if (this.sidebarCollapsedCategories === undefined || this.sidebarCollapsedCategories === null) {
      this.sidebarCollapsedCategories = this.loadCollapsedCategories() || new Set();
    }
    if (isCollapsed) {
      this.sidebarCollapsedCategories.add(catName);
    } else {
      this.sidebarCollapsedCategories.delete(catName);
    }
    this.saveCollapsedCategories();
  }

  isSidebarArchiveCollapsed(archivedCount) {
    const saved = localStorage.getItem('giffu_sidebar_archive_collapsed');
    if (saved !== null) {
      return saved === 'true';
    }
    return archivedCount === 0;
  }

  renderSidebar() {
    const treeContainer = document.getElementById('directoryTree');
    if (!treeContainer || !this.data) return;

    const currentYear = new Date().getFullYear().toString();
    const allProjects = this.data.projects || [];
    const activeProjects = allProjects.filter(p => !p.archived);
    const archivedProjects = allProjects.filter(p => p.archived);

    const isAllActive = !this.selectedProject && (!this.lobbyCategoryFilter || this.lobbyCategoryFilter === 'all');
    let html = `
      <div class="sidebar-lobby-item ${isAllActive ? 'active' : ''}" id="btnSidebarLobby" title="Ver todos os diretórios">
        <div class="sidebar-lobby-left">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
          <span>Todos os Diretórios</span>
        </div>
      </div>
    `;

    const categories = this.getCategories();
    const defaultCatName = categories[0].name;

    html += categories.map(cat => {
      const projsInCat = activeProjects.filter(p => (p.category || defaultCatName) === cat.name);
      const isCatActive = !this.selectedProject && this.lobbyCategoryFilter === cat.name;

      const isCategoryCollapsed = this.isSidebarCategoryCollapsed(cat.name, categories);
      const catColor = cat.color || '#FF5400';

      const catDivs = this.getDivisionsForCategory(cat.name);
      const topDivs = catDivs.filter(d => !d.parentId || !catDivs.some(p => p.id === d.parentId));
      topDivs.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { numeric: true, sensitivity: 'base' }));

      const renderDivisionTree = (div) => {
        const isDivCollapsed = this.isSidebarDivisionCollapsed(cat.name, div.id);
        const childDivs = catDivs.filter(d => d.parentId === div.id);
        childDivs.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { numeric: true, sensitivity: 'base' }));

        const projsInDiv = projsInCat.filter(p => {
          if (p.divisionId) return p.divisionId === div.id;
          return (p.division || p.year || currentYear).toLowerCase() === div.name.toLowerCase();
        }).sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' }));

        const unresolvedInDiv = this.getUnresolvedCommentsCountForDivision(div.id, cat.name);

        return `
          <div class="division-group ${isDivCollapsed ? 'collapsed' : ''}" data-division-id="${div.id}" data-category="${cat.name}">
            <div class="division-header" data-division-id="${div.id}" data-category="${cat.name}" draggable="true" title="${this.escapeHtml(div.name)} (Clique direito para opções, arraste para mover)">
              <div class="division-header-left">
                <span class="division-arrow">▼</span>
                <svg class="div-dir-icon" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style="${div.color ? `color: ${div.color}; fill: ${div.color};` : ''}"><path d="M19 4h-4V2H9v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V8h14v12z"/></svg>
                <span class="division-title" style="${div.color ? `color: ${div.color};` : ''}">${this.escapeHtml(div.name)}</span>
              </div>
              <div class="division-header-actions">
                ${unresolvedInDiv > 0 ? `
                  <span class="dir-unresolved-badge" style="margin-right: 4px;" title="${unresolvedInDiv} comentário${unresolvedInDiv > 1 ? 's' : ''} a resolver">${unresolvedInDiv}</span>
                ` : ''}
                <button type="button" class="btn-division-opt" data-division-id="${div.id}" title="Opções da divisão">⋮</button>
              </div>
            </div>
            <div class="division-projects">
              ${projsInDiv.length === 0 && childDivs.length === 0 ? `
                <div class="empty-year-hint" style="font-size: 11px; color: var(--text-muted); padding: 4px 6px;">Sem diretórios nesta divisão</div>
              ` : projsInDiv.map(p => {
                const unresolvedInDir = this.getUnresolvedCommentsCountForProject(p.id);
                const isLoose = Boolean(p.isFile || p.isIsolatedFile);
                const fileObj = (p.videos && p.videos[0]) || null;
                const fileType = p.fileType || (fileObj && (fileObj.itemType || fileObj.type)) || 'file';
                const ext = ((fileObj && (fileObj.fileName || fileObj.title)) || p.name || '').split('.').pop() || '';

                let iconHtml = '';
                if (isLoose) {
                  if (fileType === 'audio') {
                    iconHtml = `<svg class="proj-dir-icon" width="13" height="13" viewBox="0 0 24 24" fill="#a855f7"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`;
                  } else if (fileType === 'image') {
                    iconHtml = `<svg class="proj-dir-icon" width="13" height="13" viewBox="0 0 24 24" fill="#10b981"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`;
                  } else if (fileType === 'pdf') {
                    iconHtml = `<svg class="proj-dir-icon" width="13" height="13" viewBox="0 0 24 24" fill="#3b82f6"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`;
                  } else if (fileType === 'video') {
                    iconHtml = `<svg class="proj-dir-icon" width="13" height="13" viewBox="0 0 24 24" fill="#ef4444"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>`;
                  } else {
                    iconHtml = `<svg class="proj-dir-icon" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/></svg>`;
                  }
                  if (p.color || (fileObj && fileObj.color)) {
                    const c = p.color || fileObj.color;
                    iconHtml = iconHtml.replace('fill="', `style="color: ${c}; fill: ${c};" fill="`);
                  }
                } else {
                  iconHtml = `<svg class="proj-dir-icon" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style="${p.color ? `color: ${p.color}; fill: ${p.color};` : ''}"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`;
                }

                return `
                  <div class="project-item ${isLoose ? 'is-loose-file' : ''} ${this.selectedProject && this.selectedProject.id === p.id ? 'active' : ''}" 
                       data-id="${p.id}" 
                       draggable="true" 
                       title="${isLoose ? 'Arquivo: ' : 'Diretório: '}${this.escapeHtml(p.name)} (Arraste para mover de divisão ou categoria)">
                    <div class="project-item-left">
                      ${unresolvedInDir > 0 ? `
                        <span class="dir-unresolved-badge" title="${unresolvedInDir} comentário${unresolvedInDir > 1 ? 's' : ''} a resolver">${unresolvedInDir}</span>
                      ` : ''}
                      ${iconHtml}
                      <span class="proj-label">${this.escapeHtml(p.name)}</span>
                    </div>
                    ${isLoose && ext ? `<span class="sidebar-ext-tag">${this.escapeHtml(ext.toUpperCase().slice(0, 4))}</span>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
            ${childDivs.length > 0 ? `
              <div class="division-subdivisions">
                ${childDivs.map(renderDivisionTree).join('')}
              </div>
            ` : ''}
          </div>
        `;
      };

      return `
        <div class="category-group ${isCategoryCollapsed ? 'collapsed' : ''}" data-category="${cat.name}">
          <div class="category-header ${isCatActive ? 'active' : ''}" data-category="${cat.name}" title="${cat.name} (Clique direito para alterar a cor)">
            <div class="category-header-left">
              <span class="category-arrow">▼</span>
              <span class="category-icon" style="color: ${catColor};">${cat.svg}</span>
              <span class="category-title" style="color: ${catColor};">${cat.name}</span>
            </div>
          </div>

          <div class="category-body">
            ${topDivs.length === 0 ? `
              <div class="category-empty-drop" data-category="${cat.name}">
                Nenhum diretório (arraste para cá)
              </div>
            ` : topDivs.map(renderDivisionTree).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Add Archive Section in Sidebar
    const isArchiveCollapsed = this.isSidebarArchiveCollapsed(archivedProjects.length);
    html += `
      <div class="archive-section ${isArchiveCollapsed ? 'collapsed' : ''}" id="archiveSection">
        <div class="archive-header">
          <div class="archive-header-left">
            <span class="year-arrow">▼</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/></svg>
            <span>Arquivo</span>
          </div>
        </div>
        <div class="archive-projects">
          ${archivedProjects.length === 0 ? `
            <div style="font-size: 11px; color: var(--text-muted); padding: 8px 10px;">Nenhum projeto arquivado</div>
          ` : [...archivedProjects].sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' })).map(p => {
            const unresolvedInDir = this.getUnresolvedCommentsCountForProject(p.id);
            return `
            <div class="project-item ${this.selectedProject && this.selectedProject.id === p.id ? 'active' : ''}" data-id="${p.id}" title="${this.escapeHtml(p.name)}">
              <div class="project-item-left">
                ${unresolvedInDir > 0 ? `
                  <span class="dir-unresolved-badge" title="${unresolvedInDir} comentário${unresolvedInDir > 1 ? 's' : ''} a resolver">${unresolvedInDir}</span>
                ` : ''}
                <svg class="proj-dir-icon" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                </svg>
                <span class="proj-label">${this.escapeHtml(p.name)}</span>
              </div>
            </div>
          `;}).join('')}
        </div>
      </div>
    `;

    treeContainer.innerHTML = html;

    // Attach click events
    document.getElementById('btnSidebarLobby')?.addEventListener('click', () => {
      this.lobbyCategoryFilter = 'all';
      this.closeMobileSidebar();
      this.goToLobby();
    });

    // Division collapse click handlers & options button
    treeContainer.querySelectorAll('.division-header').forEach(dHdr => {
      const divId = dHdr.getAttribute('data-division-id');
      const catName = dHdr.getAttribute('data-category');
      const division = (this.data?.divisions || []).find(d => d.id === divId) || { id: divId, name: dHdr.querySelector('.division-title')?.textContent, category: catName };

      dHdr.addEventListener('click', (e) => {
        if (e.target.closest('.btn-division-opt')) {
          e.stopPropagation();
          this.openDivisionContextMenu(e, division);
          return;
        }
        e.stopPropagation();
        const divisionGroup = dHdr.closest('.division-group');
        if (!divisionGroup) return;
        const isCollapsed = divisionGroup.classList.toggle('collapsed');
        this.toggleSidebarDivision(catName, divId, isCollapsed);
      });

      dHdr.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openDivisionContextMenu(e, division);
      });
    });

    // Year collapse click handlers (saved to localStorage - fallback)
    treeContainer.querySelectorAll('.year-header').forEach(yHdr => {
      yHdr.addEventListener('click', (e) => {
        e.stopPropagation();
        const yearGroup = yHdr.closest('.year-group');
        if (!yearGroup) return;
        const yr = yHdr.getAttribute('data-year');
        const catName = yHdr.getAttribute('data-category');
        const isCollapsed = yearGroup.classList.toggle('collapsed');
        this.toggleSidebarYear(catName, yr, isCollapsed);
      });
    });

    // Archive collapse click handler
    const archiveSection = document.getElementById('archiveSection');
    const archiveHeader = archiveSection?.querySelector('.archive-header');
    if (archiveHeader && archiveSection) {
      archiveHeader.addEventListener('click', (e) => {
        e.stopPropagation();
        const isCollapsed = archiveSection.classList.toggle('collapsed');
        try {
          localStorage.setItem('giffu_sidebar_archive_collapsed', String(isCollapsed));
        } catch (err) {}
      });
    }

    // Category click handlers (independent toggle & navigation)
    treeContainer.querySelectorAll('.category-header').forEach(hdr => {
      const catName = hdr.getAttribute('data-category');
      const cat = categories.find(c => c.name === catName);

      hdr.addEventListener('click', (e) => {
        const group = hdr.closest('.category-group');
        const isCurrentlyCollapsed = group ? group.classList.contains('collapsed') : true;

        if (e.target.closest('.category-arrow')) {
          e.stopPropagation();
          // Alterna APENAS esta categoria, todas as outras ficam intactas
          const isCollapsed = group.classList.toggle('collapsed');
          this.toggleSidebarCategory(catName, isCollapsed);
          return;
        }

        // Clicou no corpo/título do cabeçalho da categoria
        if (isCurrentlyCollapsed) {
          // Se estava recolhida, abre apenas ela (as outras abertas continuam abertas)
          group.classList.remove('collapsed');
          this.setSidebarCategoryCollapsed(catName, false);
          this.selectedProject = null;
          this.selectedVideo = null;
          this.currentView = 'author_lobby';
          this.lobbyCategoryFilter = catName;
        } else {
          // Se já estava aberta: alterna o filtro do lobby
          this.selectedProject = null;
          this.selectedVideo = null;
          this.currentView = 'author_lobby';
          this.lobbyCategoryFilter = (this.lobbyCategoryFilter === catName) ? 'all' : catName;
        }

        window.history.pushState({}, '', '/author');
        this.closeMobileSidebar();
        this.render();
      });

      hdr.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (cat) {
          this.openCategoryContextMenu(e, cat);
        }
      });
    });

    treeContainer.querySelectorAll('.project-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        const proj = this.data.projects.find(p => p.id === id);
        if (proj) {
          this.closeMobileSidebar();
          this.openProject(proj);
        }
      });
    });

    document.getElementById('btnSidebarCloseMobile')?.addEventListener('click', () => {
      this.closeMobileSidebar();
    });

    // Render author profile in sidebar footer
    const authorAvatar = document.getElementById('sidebarAuthorAvatar');
    const authorName = document.getElementById('sidebarAuthorName');
    const authorEmail = document.getElementById('sidebarAuthorEmail');
    if (authorAvatar) {
      const avatarSrc = (this.authorSession && this.authorSession.avatar) || this.data?.settings?.authorAvatar || '/assets/default-avatar.svg';
      authorAvatar.src = avatarSrc;
      authorAvatar.setAttribute('referrerpolicy', 'no-referrer');
      authorAvatar.onerror = function() {
        this.onerror = null;
        this.src = '/assets/default-avatar.svg';
      };
    }
    if (authorName) authorName.textContent = this.getAuthorBrandName();
    if (authorEmail) authorEmail.textContent = (this.authorSession && this.authorSession.email) || this.data?.settings?.authorEmail || '';

    document.getElementById('btnSidebarLogout')?.addEventListener('click', () => {
      this.logoutAuthor();
    });

    // Ativa e rola o diretório selecionado suavemente para a visão na barra lateral
    if (this.selectedProject) {
      const activeItem = treeContainer.querySelector(`.project-item[data-id="${this.selectedProject.id}"]`);
      if (activeItem) {
        requestAnimationFrame(() => {
          try {
            activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          } catch (e) {}
        });
      }
    }

    this.attachDragAndDropHandlers();
  }

  syncSidebarActiveProject(proj = this.selectedProject) {
    if (this.isClientMode) return;
    this.selectedProject = proj || null;

    if (proj) {
      const catName = proj.category || this.getCategories()[0]?.name;
      if (catName) {
        this.setSidebarCategoryCollapsed(catName, false);
      }
    }

    this.renderSidebar();

    if (proj) {
      const treeContainer = document.getElementById('directoryTree');
      const activeItem = treeContainer?.querySelector(`.project-item[data-id="${proj.id}"]`);
      if (activeItem) {
        requestAnimationFrame(() => {
          try {
            activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          } catch (e) {}
        });
      }
    }
  }

  attachDragAndDropHandlers() {
    // Draggable elements (directories in sidebar tree and in lobby pastinhas)
    const draggableItems = document.querySelectorAll('.project-item[draggable="true"], .folder-card[draggable="true"]');
    draggableItems.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        const id = item.getAttribute('data-id');
        e.dataTransfer.setData('text/plain', `proj:${id}`);
        e.dataTransfer.setData('application/project-id', id);
        e.dataTransfer.effectAllowed = 'move';
        item.classList.add('is-dragging');
        document.body.classList.add('is-dragging-directory');
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('is-dragging');
        document.body.classList.remove('is-dragging-directory');
        document.querySelectorAll('.is-drag-over').forEach(el => el.classList.remove('is-drag-over'));
      });
    });

    // Draggable divisions in sidebar tree
    const draggableDivisions = document.querySelectorAll('.division-header[draggable="true"]');
    draggableDivisions.forEach(divEl => {
      divEl.addEventListener('dragstart', (e) => {
        const divId = divEl.getAttribute('data-division-id');
        e.dataTransfer.setData('text/plain', `div:${divId}`);
        e.dataTransfer.setData('application/division-id', divId);
        e.dataTransfer.effectAllowed = 'move';
        divEl.classList.add('is-dragging');
        document.body.classList.add('is-dragging-division');
      });

      divEl.addEventListener('dragend', () => {
        divEl.classList.remove('is-dragging');
        document.body.classList.remove('is-dragging-division');
        document.querySelectorAll('.is-drag-over').forEach(el => el.classList.remove('is-drag-over'));
      });
    });

    // Drop target elements on Categories ([data-category])
    const dropTargets = document.querySelectorAll('[data-category]');
    dropTargets.forEach(target => {
      target.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      target.addEventListener('dragenter', (e) => {
        e.preventDefault();
        target.classList.add('is-drag-over');
      });

      target.addEventListener('dragleave', (e) => {
        if (!target.contains(e.relatedTarget)) {
          target.classList.remove('is-drag-over');
        }
      });

      target.addEventListener('drop', async (e) => {
        e.preventDefault();
        target.classList.remove('is-drag-over');
        const raw = e.dataTransfer.getData('text/plain') || '';
        const divId = e.dataTransfer.getData('application/division-id') || (raw.startsWith('div:') ? raw.slice(4) : null);
        const projId = !divId ? (e.dataTransfer.getData('application/project-id') || (raw.startsWith('proj:') ? raw.slice(5) : raw)) : null;
        const targetCategory = target.getAttribute('data-category');

        if (divId && targetCategory) {
          await this.moveDivisionToCategory(divId, targetCategory);
        } else if (projId && targetCategory) {
          await this.moveProjectToCategory(projId, targetCategory);
        }
      });
    });

    // Drop target elements on Divisions ([data-division-id])
    const divisionDropTargets = document.querySelectorAll('.division-header[data-division-id]');
    divisionDropTargets.forEach(target => {
      target.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      target.addEventListener('dragenter', (e) => {
        e.preventDefault();
        target.classList.add('is-drag-over');
      });

      target.addEventListener('dragleave', (e) => {
        if (!target.contains(e.relatedTarget)) {
          target.classList.remove('is-drag-over');
        }
      });

      target.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        target.classList.remove('is-drag-over');
        const raw = e.dataTransfer.getData('text/plain') || '';
        const draggedDivId = e.dataTransfer.getData('application/division-id') || (raw.startsWith('div:') ? raw.slice(4) : null);
        const projId = !draggedDivId ? (e.dataTransfer.getData('application/project-id') || (raw.startsWith('proj:') ? raw.slice(5) : raw)) : null;
        const targetDivId = target.getAttribute('data-division-id');
        const targetCategory = target.getAttribute('data-category');

        if (draggedDivId && targetDivId) {
          if (draggedDivId === targetDivId) return;
          await this.moveDivisionToParent(draggedDivId, targetDivId, targetCategory);
        } else if (projId && targetDivId) {
          await this.moveProjectToDivision(projId, targetDivId);
        }
      });
    });
  }

  async moveDivisionToCategory(divId, targetCategory) {
    if (!this.data || !this.data.divisions) return;
    const div = this.data.divisions.find(d => d.id === divId);
    if (!div) return;

    if (div.category === targetCategory && !div.parentId) {
      window.showToast(`A divisão "${div.name}" já está em "${targetCategory}"`);
      return;
    }

    try {
      const res = await window.API.updateDivision(divId, { category: targetCategory, parentId: null });
      if (res && res.divisions) {
        this.data.divisions = res.divisions;
      }
      await this.fetchData();
      window.showToast(`Divisão "${div.name}" e diretórios movidos para "${targetCategory}" ✓`);
      this.renderSidebar();
      if (!this.selectedProject) {
        const lobbyContainer = document.getElementById('authorLobbyContainer');
        if (lobbyContainer) this.renderDirectoryLobby(lobbyContainer);
      }
    } catch (err) {
      alert('Erro ao mover divisão: ' + err.message);
    }
  }

  async moveDivisionToParent(draggedDivId, targetParentDivId, targetCategory) {
    if (!this.data || !this.data.divisions) return;
    const div = this.data.divisions.find(d => d.id === draggedDivId);
    const parentDiv = this.data.divisions.find(d => d.id === targetParentDivId);
    if (!div || !parentDiv) return;

    if (div.parentId === targetParentDivId && div.category === targetCategory) {
      return;
    }

    try {
      const res = await window.API.updateDivision(draggedDivId, { 
        parentId: targetParentDivId, 
        category: targetCategory || parentDiv.category 
      });
      if (res && res.divisions) {
        this.data.divisions = res.divisions;
      }
      await this.fetchData();
      window.showToast(`Divisão "${div.name}" movida para dentro de "${parentDiv.name}" ✓`);
      this.renderSidebar();
      if (!this.selectedProject) {
        const lobbyContainer = document.getElementById('authorLobbyContainer');
        if (lobbyContainer) this.renderDirectoryLobby(lobbyContainer);
      }
    } catch (err) {
      alert('Erro ao mover divisão: ' + err.message);
    }
  }

  async moveProjectToDivision(projId, targetDivId) {
    if (!this.data || !this.data.projects) return;
    const proj = this.data.projects.find(p => p.id === projId);
    const div = (this.data.divisions || []).find(d => d.id === targetDivId);
    if (!proj || !div) return;

    if (proj.divisionId === targetDivId) {
      window.showToast(`O diretório já está na divisão "${div.name}"`);
      return;
    }

    try {
      await window.API.updateProjectDivision(projId, targetDivId);
      await this.fetchData();
      window.showToast(`Diretório movido para a divisão "${div.name}" ✓`);
      this.renderSidebar();
      if (!this.selectedProject) {
        const lobbyContainer = document.getElementById('authorLobbyContainer');
        if (lobbyContainer) this.renderDirectoryLobby(lobbyContainer);
      }
    } catch (err) {
      alert('Erro ao mover diretório: ' + err.message);
    }
  }

  async moveProjectToCategory(projId, targetCategory) {
    if (!this.data || !this.data.projects) return;
    const proj = this.data.projects.find(p => p.id === projId);
    if (!proj) return;

    const currentCat = proj.category || 'Eventos';
    if (currentCat === targetCategory) {
      window.showToast(`O diretório já está em "${targetCategory}"`);
      return;
    }

    try {
      proj.category = targetCategory;
      await window.API.updateProjectCategory(projId, targetCategory);
      window.showToast(`Diretório movido para "${targetCategory}" ✓`);
      this.renderSidebar();
      if (!this.selectedProject) {
        const lobbyContainer = document.getElementById('authorLobbyContainer');
        if (lobbyContainer) this.renderDirectoryLobby(lobbyContainer);
      }
    } catch (err) {
      alert('Erro ao mover diretório: ' + err.message);
    }
  }

  renderDirectoryLobby(container) {
    if (this.playerInstance) {
      this.playerInstance.destroy();
      this.playerInstance = null;
    }
    this.cleanupPhotoFullscreen();

    const gData = this.getGalleryData() || { proj: this.selectedProject, folders: (this.selectedProject?.folders || []) };

    const allProjects = this.data?.projects || [];
    const activeProjects = allProjects.filter(p => !p.archived);
    const archivedProjects = allProjects.filter(p => p.archived);

    // Compute stats
    let totalVideos = 0;
    let totalPhotos = 0;
    let totalFiles = 0;
    let totalUnresolvedComments = 0;

    allProjects.forEach(p => {
      const items = p.videos || [];
      totalVideos += items.filter(v => v.type === 'video').length;
      totalPhotos += items.filter(v => v.type === 'image').length;
      totalFiles += items.filter(v => v.type !== 'video' && v.type !== 'image').length;
      totalUnresolvedComments += this.getUnresolvedCommentsCountForProject(p.id);
    });

    const normalizeSearch = (s) => {
      if (s === null || s === undefined) return '';
      return String(s)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    };

    const rawSearch = (this.lobbySearchQuery || '').trim();
    const searchQuery = normalizeSearch(rawSearch);
    const searchClean = searchQuery.replace(/[-_./\\]/g, ' ');
    const searchTerms = searchQuery.split(/\s+/).filter(Boolean);

    const matchesSearch = (text) => {
      if (!text) return false;
      const norm = normalizeSearch(text);
      if (norm.includes(searchQuery)) return true;
      if (searchClean && norm.replace(/[-_./\\]/g, ' ').includes(searchClean)) return true;
      return false;
    };

    const projectsWithPending = allProjects.filter(p => this.getUnresolvedCommentsCountForProject(p.id) > 0);

    // Agrupar nomes de clientes únicos (case-insensitive, mantendo formatação original)
    const clientMap = new Map();
    allProjects.forEach(p => {
      const raw = String(p.clientName || '').trim();
      if (!raw) return;
      const key = raw.toLowerCase();
      if (!clientMap.has(key)) {
        clientMap.set(key, { name: raw, count: 0 });
      }
      clientMap.get(key).count++;
    });
    const uniqueClients = Array.from(clientMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );

    const hasStatusFilter = this.lobbyFilter && this.lobbyFilter !== 'all';
    const hasCategoryFilter = this.lobbyCategoryFilter && this.lobbyCategoryFilter !== 'all';
    const hasClientFilter = this.lobbyClientFilter && this.lobbyClientFilter !== 'all';
    const activeFilterCount = (hasStatusFilter ? 1 : 0) + (hasCategoryFilter ? 1 : 0) + (hasClientFilter ? 1 : 0);
    const hasActiveFilters = activeFilterCount > 0;

    const filteredProjects = allProjects.filter(p => {
      // Tab filter
      if (this.lobbyFilter === 'active' && p.archived) return false;
      if (this.lobbyFilter === 'archived' && !p.archived) return false;
      if (this.lobbyFilter === 'pending' && this.getUnresolvedCommentsCountForProject(p.id) === 0) return false;

      // Category filter
      if (this.lobbyCategoryFilter && this.lobbyCategoryFilter !== 'all') {
        const defaultCatName = (this.getCategories()[0] && this.getCategories()[0].name) || 'Categoria Padrão';
        if ((p.category || defaultCatName) !== this.lobbyCategoryFilter) return false;
      }

      // Client filter (case-insensitive, mesma quantidade e sequência exata de caracteres)
      if (this.lobbyClientFilter && this.lobbyClientFilter !== 'all') {
        const pClient = String(p.clientName || '').trim().toLowerCase();
        const targetClient = this.lobbyClientFilter.trim().toLowerCase();
        if (pClient !== targetClient) return false;
      }

      // Search filter: encontra arquivos, pastas e subpastas dentro dos diretórios, cliente, ano...
      if (searchQuery) {
        const defaultCatName = (this.getCategories()[0] && this.getCategories()[0].name) || 'Categoria Padrão';

        // 1. Metadados do diretório
        const nameMatch = matchesSearch(p.name);
        const driveFolderMatch = matchesSearch(p.driveFolderName);
        const clientMatch = matchesSearch(p.clientName);
        const slugMatch = matchesSearch(p.slug);
        const divName = this.getProjectDivisionName(p);
        const divisionMatch = matchesSearch(divName) || matchesSearch(p.division) || matchesSearch(p.year);
        const catMatch = matchesSearch(p.category || defaultCatName);

        if (nameMatch || driveFolderMatch || clientMatch || slugMatch || divisionMatch || catMatch) {
          return true;
        }

        // 2. Pastas e subpastas dentro do diretório
        const folderMatch = (p.folders || []).some(f => 
          matchesSearch(f.name) || matchesSearch(f.path)
        );
        if (folderMatch) return true;

        // 3. Arquivos e mídias dentro do diretório
        const fileMatch = (p.videos || []).some(v => 
          matchesSearch(v.fileName) ||
          matchesSearch(v.title) ||
          matchesSearch(v.name) ||
          (v.folderPath && matchesSearch(v.folderPath))
        );
        if (fileMatch) return true;

        // 4. Busca com múltiplos termos em qualquer parte do diretório
        if (searchTerms.length > 1) {
          const directoryFullText = [
            p.name,
            p.driveFolderName,
            p.clientName,
            p.slug,
            divName,
            p.division,
            p.year,
            p.category || defaultCatName,
            ...(p.folders || []).map(f => `${f.name || ''} ${f.path || ''}`),
            ...(p.videos || []).map(v => `${v.fileName || ''} ${v.title || ''} ${v.folderPath || ''}`)
          ].join(' ');

          const normFull = normalizeSearch(directoryFullText);
          const cleanFull = normFull.replace(/[-_./\\]/g, ' ');

          const allTermsMatched = searchTerms.every(term => {
            const cleanTerm = term.replace(/[-_./\\]/g, ' ');
            return normFull.includes(term) || cleanFull.includes(cleanTerm);
          });

          if (allTermsMatched) return true;
        }

        return false;
      }
      return true;
    });

    filteredProjects.sort((a, b) => 
      (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' })
    );

    container.innerHTML = `
      <div class="lobby-wrapper ${this.lobbyViewMode === 'columns' ? 'is-columns-mode' : ''}">
        <!-- Lobby Top Header -->
        <div class="lobby-header">
          <div class="lobby-header-left">
            <div class="lobby-title-row">
              <h1 class="lobby-title">Diretórios</h1>
            </div>
          </div>
          <div class="lobby-header-right">
            <button class="btn-secondary" id="btnLobbyOpenDirectory" title="Abrir pasta ou diretório selecionados como diretório aberto">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              Abrir Diretório
            </button>
            <button class="btn-primary" id="btnLobbyAddDirectory">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              Novo Diretório
            </button>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="lobby-stats-grid">
          <div class="lobby-stat-card">
            <div class="lobby-stat-icon folder-stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
            </div>
            <div class="lobby-stat-info">
              <span class="lobby-stat-value">${activeProjects.length}</span>
              <span class="lobby-stat-label">Diretórios Ativos</span>
            </div>
          </div>

          <div class="lobby-stat-card">
            <div class="lobby-stat-icon media-stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/></svg>
            </div>
            <div class="lobby-stat-info">
              <span class="lobby-stat-value">${totalVideos + totalPhotos + totalFiles}</span>
              <span class="lobby-stat-label">${totalVideos} vídeos • ${totalPhotos} fotos${totalFiles > 0 ? ` • ${totalFiles} arquivos` : ''}</span>
            </div>
          </div>

          <div class="lobby-stat-card ${totalUnresolvedComments > 0 ? 'has-unresolved' : ''}">
            <div class="lobby-stat-icon comment-stat-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/></svg>
            </div>
            <div class="lobby-stat-info">
              <div class="lobby-stat-unresolved-row">
                <span class="lobby-stat-value">${totalUnresolvedComments}</span>
                ${totalUnresolvedComments > 0 ? '<span class="lobby-stat-dot"></span>' : ''}
              </div>
              <span class="lobby-stat-label">${totalUnresolvedComments === 1 ? 'Comentário a resolver' : 'Comentários a resolver'}</span>
            </div>
          </div>
        </div>

        <!-- Filter & Search Bar -->
        <div class="lobby-toolbar">
          <div class="lobby-search-box">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            <input type="text" id="inputLobbySearch" placeholder="Buscar por pasta, arquivo, cliente, ano..." value="${this.lobbySearchQuery || ''}" />
            ${this.lobbySearchQuery ? `<button class="clear-search-btn" id="btnClearLobbySearch" title="Limpar busca">×</button>` : ''}
          </div>

          <div class="lobby-toolbar-right">
            <!-- Minimalist Filter Toggle & Dropdown -->
            <div class="lobby-filter-wrapper">
              <button class="lobby-filter-btn ${hasActiveFilters ? 'has-active' : ''} ${this.isLobbyFilterOpen ? 'is-open' : ''}" 
                      id="btnLobbyFilterToggle" 
                      title="Filtrar diretórios por status e categoria"
                      aria-label="Filtros">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                ${hasActiveFilters ? `<span class="lobby-filter-count">${activeFilterCount}</span>` : ''}
              </button>

              <!-- Floating Filter Popover -->
              <div class="lobby-filter-dropdown ${this.isLobbyFilterOpen ? 'open' : ''}" id="lobbyFilterDropdown">
                <div class="lobby-filter-dropdown-header">
                  <div class="lobby-filter-dropdown-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    <span>Filtrar Diretórios</span>
                  </div>
                  ${hasActiveFilters ? `
                    <button class="lobby-filter-clear-btn" id="btnClearAllLobbyFilters">
                      Limpar filtros
                    </button>
                  ` : ''}
                </div>

                <!-- Status Group -->
                <div class="lobby-filter-section">
                  <div class="lobby-filter-section-title">Status</div>
                  <div class="lobby-filter-pills-row">
                    <button class="filter-tab ${this.lobbyFilter === 'all' ? 'active' : ''}" data-filter="all">
                      Todos
                    </button>
                    <button class="filter-tab ${this.lobbyFilter === 'pending' ? 'active' : ''}" data-filter="pending">
                      ${projectsWithPending.length > 0 ? '<span class="filter-red-dot"></span>' : ''}
                      Com Pendências
                    </button>
                    <button class="filter-tab ${this.lobbyFilter === 'active' ? 'active' : ''}" data-filter="active">
                      Ativos
                    </button>
                    <button class="filter-tab ${this.lobbyFilter === 'archived' ? 'active' : ''}" data-filter="archived">
                      Arquivados
                    </button>
                  </div>
                </div>

                <!-- Categories Group -->
                <div class="lobby-filter-section">
                  <div class="lobby-filter-section-title">Categorias</div>
                  <div class="lobby-filter-pills-row">
                    <button class="category-tab-btn ${(!this.lobbyCategoryFilter || this.lobbyCategoryFilter === 'all') ? 'active' : ''}" data-cat-filter="all">
                      Todas Categorias
                    </button>
                    ${this.getCategories().map(cat => {
                      return `
                        <button class="category-tab-btn ${this.lobbyCategoryFilter === cat.name ? 'active' : ''}" 
                                data-cat-filter="${cat.name}" 
                                data-category="${cat.name}"
                                title="Filtrar por ${cat.name} (Clique direito para alterar a cor)">
                          <span class="category-icon" style="${cat.color ? `color: ${cat.color};` : ''}">${cat.svg}</span>
                          <span>${cat.name}</span>
                        </button>
                      `;
                    }).join('')}
                  </div>
                </div>

                <!-- Clientes Group -->
                ${uniqueClients.length > 0 ? `
                  <div class="lobby-filter-section">
                    <div class="lobby-filter-section-title">Clientes</div>
                    <div class="lobby-filter-pills-row">
                      <button class="client-tab-btn ${(!this.lobbyClientFilter || this.lobbyClientFilter === 'all') ? 'active' : ''}" data-client-filter="all">
                        Todos os Clientes
                      </button>
                      ${uniqueClients.map(c => {
                        const isClientActive = this.lobbyClientFilter && this.lobbyClientFilter.trim().toLowerCase() === c.name.toLowerCase();
                        return `
                          <button class="client-tab-btn ${isClientActive ? 'active' : ''}" 
                                  data-client-filter="${c.name}"
                                  title="Filtrar por cliente: ${c.name}">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                            <span>${c.name}</span>
                          </button>
                        `;
                      }).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- View Mode Toggle: Grid (Pastinhas) vs Colunas (macOS Style) -->
            <div class="view-mode-toggle-group" role="group" aria-label="Modo de visualização dos diretórios">
              <button class="view-mode-btn ${this.lobbyViewMode !== 'columns' ? 'active' : ''}" 
                      id="btnLobbyViewModeGrid" 
                      type="button" 
                      title="Visualização em Pastas (Grade)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zm-9 9h7v7H4v-7zm9 0h7v7h-7v-7z"/>
                </svg>
              </button>
              <button class="view-mode-btn ${this.lobbyViewMode === 'columns' ? 'active' : ''}" 
                      id="btnLobbyViewModeColumns" 
                      type="button" 
                      title="Visualização em Colunas">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h4v16H4V4zm6 0h4v16h-4V4zm6 0h4v16h-4V4z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        ${hasActiveFilters ? `
          <!-- Active Filter Chips Bar -->
          <div class="lobby-active-filter-chips">
            <span class="active-filter-label">Filtros:</span>
            ${hasStatusFilter ? `
              <span class="active-filter-chip">
                Status: <strong>${this.lobbyFilter === 'pending' ? 'Com Pendências' : (this.lobbyFilter === 'active' ? 'Ativos' : 'Arquivados')}</strong>
                <button class="chip-remove-btn" data-remove-filter="status" title="Remover filtro de status">×</button>
              </span>
            ` : ''}
            ${hasCategoryFilter ? `
              <span class="active-filter-chip">
                Categoria: <strong>${this.lobbyCategoryFilter}</strong>
                <button class="chip-remove-btn" data-remove-filter="category" title="Remover filtro de categoria">×</button>
              </span>
            ` : ''}
            ${hasClientFilter ? `
              <span class="active-filter-chip">
                Cliente: <strong>${this.lobbyClientFilter}</strong>
                <button class="chip-remove-btn" data-remove-filter="client" title="Remover filtro de cliente">×</button>
              </span>
            ` : ''}
            <button class="active-filter-clear-all" id="btnActiveFilterClearAll">Limpar todos</button>
          </div>
        ` : ''}

        <!-- Folders Grid / Lobby Pastinhas or macOS Columns -->
        ${allProjects.length === 0 ? `
          <div class="lobby-empty-state">
            <div class="lobby-empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
            </div>
            <h3>Nenhum diretório cadastrado</h3>
            <p>Espelhe uma pasta (diretório) do Google Drive para começar a entregar com mais profissionalismo e elegância!</p>
            <button class="btn-primary" id="btnLobbyEmptyAdd" style="margin-top: 14px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              Adicionar Primeiro Diretório
            </button>
          </div>
        ` : (this.lobbyViewMode === 'columns' ? `
          <div class="gallery-dynamic-area" id="galleryDynamicArea">
            ${this.buildColumnsViewHtml(gData)}
          </div>
        ` : (filteredProjects.length === 0 ? `
          <div class="lobby-empty-state">
            <div class="lobby-empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
            </div>
            <h3>Nenhum diretório encontrado</h3>
            <p>Tente pesquisar por outro termo ou selecione outra aba de filtro.</p>
            <button class="btn-secondary" id="btnResetLobbyFilters" style="margin-top: 14px;">
              Limpar Busca e Filtros
            </button>
          </div>
        ` : `
          <div class="lobby-folders-grid">
            ${filteredProjects.map(proj => {
              const unresolvedInDir = this.getUnresolvedCommentsCountForProject(proj.id);
              const items = proj.videos || [];
              const vCount = items.filter(v => this.getItemType(v) === 'video').length;
              const iCount = items.filter(v => this.getItemType(v) === 'image').length;
              const aCount = items.filter(v => this.getItemType(v) === 'audio').length;
              const pCount = items.filter(v => this.getItemType(v) === 'pdf').length;
              const fCount = items.filter(v => ['archive', 'file'].includes(this.getItemType(v))).length;
              const shortCode = proj.shortCode || proj.slug;
              const clientUrl = `${window.location.origin}/${shortCode}`;
              const customDisplayUrl = `https://${this.data?.settings?.baseDomain || 'giffu.com.br'}/${shortCode}`;
              const currentYear = new Date().getFullYear().toString();

              const projCatName = proj.category || defaultCatName;
              const catObj = this.getCategories().find(c => c.name === projCatName);
              const catColor = (catObj && catObj.color) || '#FF5400';
              const projDivName = this.getProjectDivisionName(proj);

              return `
                <div class="folder-card ${proj.archived ? 'is-archived' : ''}" data-id="${proj.id}" draggable="true" title="${proj.name} (Arraste para mover de categoria)">
                  <!-- Folder Top Tab -->
                  <div class="folder-card-tab">
                    <span class="folder-tab-category" style="color: ${catColor};">${projCatName}</span>
                    <span class="folder-tab-sep">•</span>
                    <span class="folder-tab-label">${this.escapeHtml(projDivName)}</span>
                  </div>

                  <div class="folder-card-body">
                    <!-- Top Icon and Status Badges -->
                    <div class="folder-card-header">
                      <div class="folder-svg-wrapper">
                        <svg class="folder-main-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.5 7C2.5 5.61929 3.61929 4.5 5 4.5H9.17157C9.83464 4.5 10.4706 4.76339 10.9393 5.23223L12.7071 7H19C20.3807 7 21.5 8.11929 21.5 9.5V17.5C21.5 18.8807 20.3807 20 19 20H5C3.61929 20 2.5 18.8807 2.5 17.5V7Z" fill="url(#folderGrad_${proj.id})" stroke="rgba(255,255,255,0.18)" stroke-width="1.2"/>
                          <path d="M2.5 10.5C2.5 9.39543 3.39543 8.5 4.5 8.5H19.5C20.6046 8.5 21.5 9.39543 21.5 10.5V17.5C21.5 18.8807 20.3807 20 19 20H5C3.61929 20 2.5 18.8807 2.5 17.5V10.5Z" fill="url(#folderFrontGrad_${proj.id})" fill-opacity="0.9" stroke="rgba(255,255,255,0.22)" stroke-width="1.2"/>
                          <defs>
                            <linearGradient id="folderGrad_${proj.id}" x1="2.5" y1="4.5" x2="21.5" y2="20" gradientUnits="userSpaceOnUse">
                              <stop stop-color="${proj.color || '#FF7A30'}"/>
                              <stop offset="1" stop-color="${proj.color || '#CC4000'}"/>
                            </linearGradient>
                            <linearGradient id="folderFrontGrad_${proj.id}" x1="2.5" y1="8.5" x2="21.5" y2="20" gradientUnits="userSpaceOnUse">
                              <stop stop-color="${proj.color || '#FF9457'}"/>
                              <stop offset="1" stop-color="${proj.color || '#D94800'}"/>
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>

                      <div class="folder-header-badges">
                        ${unresolvedInDir > 0 ? `
                          <div class="folder-badge-unresolved" title="${unresolvedInDir} comentário${unresolvedInDir > 1 ? 's' : ''} a resolver">
                            <span>${unresolvedInDir} ${unresolvedInDir === 1 ? 'pendente' : 'pendentes'}</span>
                          </div>
                        ` : ''}

                        ${proj.archived ? `
                          <div class="folder-badge-archived" title="Diretório Arquivado">Arquivado</div>
                        ` : ''}

                        ${proj.password ? `
                          <div class="folder-badge-locked" title="Protegido por senha">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                          </div>
                        ` : ''}
                      </div>
                    </div>

                    <!-- Folder Title & Meta -->
                    <div class="folder-content">
                      <h3 class="folder-name" title="${this.escapeHtml(proj.name)}">${this.escapeHtml(proj.name)}</h3>
                      <div class="folder-meta-row">
                        ${proj.clientName ? `<span class="folder-client-tag">${proj.clientName}</span><span class="folder-meta-sep">•</span>` : ''}
                        <span class="folder-files-count">
                          ${items.length === 0 ? 'Vazio' : (() => {
                            const parts = [];
                            if (vCount > 0) parts.push(`${vCount} vídeo${vCount > 1 ? 's' : ''}`);
                            if (iCount > 0) parts.push(`${iCount} foto${iCount > 1 ? 's' : ''}`);
                            if (aCount > 0) parts.push(`${aCount} áudio${aCount > 1 ? 's' : ''}`);
                            if (pCount > 0) parts.push(`${pCount} PDF${pCount > 1 ? 's' : ''}`);
                            if (fCount > 0) parts.push(`${fCount} arquivo${fCount > 1 ? 's' : ''}`);
                            return parts.join(' • ');
                          })()}
                        </span>
                      </div>
                      ${(() => {
                        if (!searchQuery) return '';

                        const matchedFolders = (proj.folders || []).filter(f => 
                          this.matchesFolderSearch(f, searchQuery)
                        );

                        (proj.videos || []).forEach(v => {
                          if (v.folderPath && this.matchesSearch(v.folderPath, searchQuery)) {
                            const leaf = v.folderPath.split('/').filter(Boolean).pop() || v.folderPath;
                            if (!matchedFolders.some(f => f.path === v.folderPath || f.name === leaf)) {
                              matchedFolders.push({ name: leaf, path: v.folderPath, id: v.driveFolderId || null });
                            }
                          }
                        });

                        const matchedFiles = (proj.videos || []).filter(v => 
                          this.matchesItemSearch(v, searchQuery)
                        );

                        // Deduplicate matched folders
                        const seenFolderKeys = new Set();
                        const uniqueFolders = [];
                        for (const f of matchedFolders) {
                          const k = f.id || f.path || f.name;
                          if (k && !seenFolderKeys.has(k)) {
                            seenFolderKeys.add(k);
                            uniqueFolders.push(f);
                          }
                        }

                        // Deduplicate matched files
                        const seenFileKeys = new Set();
                        const uniqueFiles = [];
                        for (const v of matchedFiles) {
                          const k = v.id || v.fileName;
                          if (k && !seenFileKeys.has(k)) {
                            seenFileKeys.add(k);
                            uniqueFiles.push(v);
                          }
                        }

                        if (uniqueFolders.length === 0 && uniqueFiles.length === 0) return '';

                        const badges = [];

                        // 1. Cada pasta encontrada exibida como seu próprio item na lista
                        for (const f of uniqueFolders) {
                          const fName = f.name || f.path || 'Pasta';
                          const targetFid = f.id || 'root';
                          const folderIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`;
                          const tooltip = `📁 Pasta: ${fName}${f.path && f.path !== fName ? ` (${f.path})` : ''}\nClique para abrir esta pasta`;
                          badges.push(`
                            <div class="folder-search-match-badge" data-target-folder="${targetFid}" title="${this.escapeHtml(tooltip)}">
                              <span class="match-badge-icon">${folderIcon}</span>
                              <span class="match-badge-name">${this.escapeHtml(fName)}</span>
                              <span class="match-badge-container">Pasta</span>
                            </div>
                          `);
                        }

                        // 2. Cada arquivo encontrado exibido como seu próprio item levando para sua pasta contêiner
                        for (const v of uniqueFiles) {
                          const vName = v.fileName || v.title || v.name || 'Arquivo';
                          const itemType = this.getItemType(v);
                          let fileIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`;
                          if (itemType === 'video') {
                            fileIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>`;
                          } else if (itemType === 'image') {
                            fileIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`;
                          } else if (itemType === 'audio') {
                            fileIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`;
                          }

                          const container = this.getMediaContainerFolder(v, proj);
                          const targetFid = container ? (container.id || 'root') : 'root';
                          const containerName = container ? (container.name || container.path || 'Pasta') : 'Raiz';
                          const tooltip = `📄 Arquivo: ${vName}\nPasta contêiner: ${containerName}\nClique para abrir nesta pasta`;

                          badges.push(`
                            <div class="folder-search-match-badge" data-target-folder="${targetFid}" data-target-video-id="${v.id}" title="${this.escapeHtml(tooltip)}">
                              <span class="match-badge-icon">${fileIcon}</span>
                              <span class="match-badge-name">${this.escapeHtml(vName)}</span>
                              <span class="match-badge-container">📁 ${this.escapeHtml(containerName)}</span>
                            </div>
                          `);
                        }

                        return `
                          <div class="folder-search-matches-list">
                            ${badges.join('')}
                          </div>
                        `;
                      })()}
                    </div>

                    <!-- Folder Footer / Quick Actions -->
                    <div class="folder-footer">
                      <div class="folder-footer-actions">
                        <button class="btn-folder-copy" data-url="${clientUrl}" data-code="${shortCode}" title="Copiar link de entrega do cliente" aria-label="Copiar link">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
                        </button>
                        <button class="btn-folder-edit" data-id="${proj.id}" title="Editar diretório" aria-label="Editar diretório">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                        </button>
                      </div>

                      <div class="folder-open-action" title="Abrir diretório">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `))}
      </div>
    `;

    // Bind Lobby Events
    document.getElementById('btnLobbyViewModeGrid')?.addEventListener('click', () => {
      this.setLobbyViewMode('grid');
    });

    document.getElementById('btnLobbyViewModeColumns')?.addEventListener('click', () => {
      this.setLobbyViewMode('columns');
    });

    if (this.lobbyViewMode === 'columns') {
      this.bindColumnsNavigationEvents(container, gData);
    }

    document.getElementById('btnLobbyOpenDirectory')?.addEventListener('click', () => {
      let targetProj = this.selectedProject;
      let targetFolderId = this.currentFolderId;

      // 1. Se não houver projeto na memória direta, tenta resolver pelo item ativo ou in-path nas colunas
      if (!targetProj) {
        const activeProjEl = container.querySelector('.macos-col-proj.active, .macos-col-proj.in-path');
        if (activeProjEl) {
          const pId = activeProjEl.getAttribute('data-project-id');
          targetProj = (this.data?.projects || []).find(p => p.id === pId);
        }
      }

      // 2. Se houver pasta ativa nas colunas
      const activeFolderEl = container.querySelector('.macos-col-folder.active');
      if (activeFolderEl) {
        targetFolderId = activeFolderEl.getAttribute('data-folder-id');
        if (!targetProj && targetFolderId) {
          targetProj = (this.data?.projects || []).find(p => (p.folders || []).some(f => f.id === targetFolderId));
        }
      }

      // 3. Se houver arquivo selecionado no preview da coluna
      if (this.columnsPreviewItemId) {
        const fileId = this.columnsPreviewItemId;
        for (const p of (this.data?.projects || [])) {
          const found = (p.videos || []).find(v => v.id === fileId);
          if (found) {
            targetProj = p;
            if (!targetFolderId) targetFolderId = found.driveFolderId || found.folderId || null;
            break;
          }
        }
      }

      // 4. Se houver item de contexto ativo recentemente clicado
      if (!targetProj && this.activeUniversalContextItem) {
        if (this.activeUniversalContextItem.type === 'project') {
          targetProj = this.activeUniversalContextItem.item;
        } else if (this.activeUniversalContextItem.type === 'folder') {
          targetProj = this.activeUniversalContextItem.project;
          targetFolderId = this.activeUniversalContextItem.id;
        }
      }

      // 5. Se houver card de diretório na grade que foi focado/selecionado
      if (!targetProj) {
        const activeCard = container.querySelector('.folder-card.active, .folder-card.selected');
        if (activeCard) {
          const pId = activeCard.getAttribute('data-id');
          targetProj = (this.data?.projects || []).find(p => p.id === pId);
        }
      }

      // 6. Executa a abertura do diretório
      if (targetProj) {
        const cleanFolder = (targetFolderId && targetFolderId !== 'root' && targetFolderId !== 'null' && targetFolderId !== 'undefined') ? targetFolderId : null;
        this.openProject(targetProj, cleanFolder);
      } else {
        window.showToast('Selecione uma pasta ou diretório primeiro para abrir', 'info');
      }
    });

    document.getElementById('btnLobbyAddDirectory')?.addEventListener('click', () => {
      this.openAddDirectoryModal();
    });

    document.getElementById('btnLobbyEmptyAdd')?.addEventListener('click', () => {
      this.openAddDirectoryModal();
    });

    const searchInput = document.getElementById('inputLobbySearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.lobbySearchQuery = e.target.value;
        const curPos = searchInput.selectionStart;
        if (this.lobbyViewMode === 'columns') {
          this.updateGalleryDynamicArea(container);
          const searchBox = container.querySelector('.lobby-search-box');
          let clearBtn = searchBox?.querySelector('#btnClearLobbySearch');
          if (this.lobbySearchQuery) {
            if (!clearBtn && searchBox) {
              clearBtn = document.createElement('button');
              clearBtn.className = 'clear-search-btn';
              clearBtn.id = 'btnClearLobbySearch';
              clearBtn.title = 'Limpar busca';
              clearBtn.type = 'button';
              clearBtn.textContent = '×';
              searchBox.appendChild(clearBtn);
              clearBtn.addEventListener('click', () => {
                this.lobbySearchQuery = '';
                searchInput.value = '';
                this.updateGalleryDynamicArea(container);
                clearBtn.remove();
                searchInput.focus();
              });
            }
          } else {
            if (clearBtn) clearBtn.remove();
          }

          if (document.activeElement !== searchInput) {
            try { searchInput.focus({ preventScroll: true }); } catch (_) {}
          }
          if (curPos !== null && curPos !== undefined) {
            try { searchInput.setSelectionRange(curPos, curPos); } catch (_) {}
          }
        } else {
          this.renderDirectoryLobby(container);
          const newSearchInput = document.getElementById('inputLobbySearch');
          if (newSearchInput) {
            try { newSearchInput.focus({ preventScroll: true }); } catch (_) {}
            if (curPos !== null && curPos !== undefined) {
              try { newSearchInput.setSelectionRange(curPos, curPos); } catch (_) {}
            }
          }
        }
      });
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.lobbySearchQuery = '';
          searchInput.value = '';
          if (this.lobbyViewMode === 'columns') {
            this.updateGalleryDynamicArea(container);
            container.querySelector('#btnClearLobbySearch')?.remove();
          } else {
            this.renderDirectoryLobby(container);
          }
        }
      });
    }

    document.getElementById('btnClearLobbySearch')?.addEventListener('click', () => {
      this.lobbySearchQuery = '';
      const input = document.getElementById('inputLobbySearch');
      if (input) input.value = '';
      if (this.lobbyViewMode === 'columns') {
        this.updateGalleryDynamicArea(container);
        document.getElementById('btnClearLobbySearch')?.remove();
      } else {
        this.renderDirectoryLobby(container);
      }
    });

    const filterToggleBtn = document.getElementById('btnLobbyFilterToggle');
    const filterDropdown = document.getElementById('lobbyFilterDropdown');

    if (filterToggleBtn && filterDropdown) {
      filterToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.isLobbyFilterOpen = !this.isLobbyFilterOpen;
        filterDropdown.classList.toggle('open', this.isLobbyFilterOpen);
        filterToggleBtn.classList.toggle('is-open', this.isLobbyFilterOpen);
      });

      filterDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    if (!this._lobbyFilterClickOutsideBound) {
      this._lobbyFilterClickOutsideBound = true;
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.lobby-filter-wrapper')) {
          if (this.isLobbyFilterOpen) {
            this.isLobbyFilterOpen = false;
            const dd = document.getElementById('lobbyFilterDropdown');
            const btn = document.getElementById('btnLobbyFilterToggle');
            if (dd) dd.classList.remove('open');
            if (btn) btn.classList.remove('is-open');
          }
        }
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isLobbyFilterOpen) {
          this.isLobbyFilterOpen = false;
          const dd = document.getElementById('lobbyFilterDropdown');
          const btn = document.getElementById('btnLobbyFilterToggle');
          if (dd) dd.classList.remove('open');
          if (btn) btn.classList.remove('is-open');
        }
      });
    }

    const resetAllFilters = () => {
      this.lobbyFilter = 'all';
      this.lobbyCategoryFilter = 'all';
      this.lobbyClientFilter = 'all';
      this.renderDirectoryLobby(container);
    };

    document.getElementById('btnClearAllLobbyFilters')?.addEventListener('click', resetAllFilters);
    document.getElementById('btnActiveFilterClearAll')?.addEventListener('click', resetAllFilters);

    container.querySelectorAll('[data-remove-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = btn.getAttribute('data-remove-filter');
        if (type === 'status') this.lobbyFilter = 'all';
        if (type === 'category') this.lobbyCategoryFilter = 'all';
        if (type === 'client') this.lobbyClientFilter = 'all';
        this.renderDirectoryLobby(container);
      });
    });

    document.getElementById('btnResetLobbyFilters')?.addEventListener('click', () => {
      this.lobbySearchQuery = '';
      this.lobbyFilter = 'all';
      this.lobbyCategoryFilter = 'all';
      this.lobbyClientFilter = 'all';
      this.renderDirectoryLobby(container);
    });

    container.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.lobbyFilter = tab.getAttribute('data-filter') || 'all';
        this.renderDirectoryLobby(container);
      });
    });

    container.querySelectorAll('[data-cat-filter]').forEach(tab => {
      const catName = tab.getAttribute('data-cat-filter');
      const cat = this.getCategories().find(c => c.name === catName);

      tab.addEventListener('click', () => {
        this.lobbyCategoryFilter = catName || 'all';
        if (catName && catName !== 'all') {
          this.setSidebarCategoryCollapsed(catName, false);
        }
        this.renderDirectoryLobby(container);
      });

      if (cat) {
        tab.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.openCategoryContextMenu(e, cat);
        });
      }
    });

    container.querySelectorAll('[data-client-filter]').forEach(tab => {
      tab.addEventListener('click', () => {
        const val = tab.getAttribute('data-client-filter') || 'all';
        this.lobbyClientFilter = (this.lobbyClientFilter && this.lobbyClientFilter.toLowerCase() === val.toLowerCase() && val !== 'all') ? 'all' : val;
        this.renderDirectoryLobby(container);
      });
    });

    this.attachDragAndDropHandlers();

    container.querySelectorAll('.folder-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-folder-copy') || e.target.closest('.btn-folder-edit')) return;

        const matchBadge = e.target.closest('.folder-search-match-badge');
        // Se clicou na lista de correspondências mas não exatamente em um badge (ex: scrollbar), não abre a raiz
        if (!matchBadge && e.target.closest('.folder-search-matches-list')) return;

        const targetFolder = matchBadge ? matchBadge.getAttribute('data-target-folder') : null;
        const targetVideoId = matchBadge ? matchBadge.getAttribute('data-target-video-id') : null;

        const id = card.getAttribute('data-id');
        const proj = this.data.projects.find(p => p.id === id);
        if (proj) {
          this.highlightedMediaId = targetVideoId || null;
          const cleanFolder = (targetFolder && targetFolder !== 'root' && targetFolder !== 'null' && targetFolder !== 'undefined') ? targetFolder : null;
          this.openProject(proj, cleanFolder);
        }
      });
    });

    container.querySelectorAll('.btn-folder-copy').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const url = btn.getAttribute('data-url');
        const code = btn.getAttribute('data-code') || (url ? url.split('/').pop() : '');
        if (url) {
          navigator.clipboard.writeText(url);
          const originalHtml = btn.innerHTML;
          btn.classList.add('copied');
          btn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
          `;
          window.showToast(`Link copiado: .../${code}`);
          setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = originalHtml;
          }, 2000);
        }
      });
    });

    container.querySelectorAll('.btn-folder-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const proj = this.data.projects.find(p => p.id === id);
        if (proj) {
          this.openEditProjectModal(proj);
        }
      });
    });
  }

  renderGalleryBreadcrumbHtml(gData) {
    const { proj, folders, currentFolder, breadcrumbTrail } = gData;
    const isScoped = this.isClientMode && this.scopedFolderId;
    const scopedFolderObj = isScoped ? (folders.find(f => f.id === this.scopedFolderId) || null) : null;

    if (isScoped && scopedFolderObj) {
      if (breadcrumbTrail.length <= 1) {
        return `<h1 class="project-heading">${this.escapeHtml(currentFolder ? currentFolder.name : scopedFolderObj.name)}</h1>`;
      }
      return `
        <nav class="gallery-breadcrumb-nav">
          ${breadcrumbTrail.map((crumb, idx) => {
            const isLast = idx === breadcrumbTrail.length - 1;
            const isFirst = idx === 0;
            const sep = !isFirst ? `<span class="gallery-crumb-sep">&gt;</span>` : '';
            return `
              ${sep}
              ${isLast ? `
                <h1 class="gallery-crumb-current">${this.escapeHtml(crumb.name)}</h1>
              ` : `
                <a class="gallery-crumb-link" data-folder-id="${crumb.id}" title="Ir para ${this.escapeHtml(crumb.name)}">${this.escapeHtml(crumb.name)}</a>
              `}
            `;
          }).join('')}
        </nav>
      `;
    }

    if (breadcrumbTrail.length > 0) {
      return `
        <nav class="gallery-breadcrumb-nav">
          <a class="gallery-crumb-link" data-folder-id="root" title="Ir para a raiz">${this.escapeHtml(proj.name)}</a>
          ${breadcrumbTrail.map((crumb, idx) => {
            const isLast = idx === breadcrumbTrail.length - 1;
            return `
              <span class="gallery-crumb-sep">&gt;</span>
              ${isLast ? `
                <h1 class="gallery-crumb-current">${this.escapeHtml(crumb.name)}</h1>
              ` : `
                <a class="gallery-crumb-link" data-folder-id="${crumb.id}" title="Ir para ${this.escapeHtml(crumb.name)}">${this.escapeHtml(crumb.name)}</a>
              `}
            `;
          }).join('')}
        </nav>
      `;
    }

    return `<h1 class="project-heading">${this.escapeHtml(proj.name)}</h1>`;
  }

  renderGalleryView(container) {
    if (this.playerInstance) {
      this.playerInstance.destroy();
      this.playerInstance = null;
    }
    this.cleanupPhotoFullscreen();

    // Empty state when no projects exist
    if (!this.selectedProject || !this.data.projects || this.data.projects.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 80px 20px; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; align-items: center;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--brand-orange-subtle); color: var(--brand-orange); display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
          </div>
          <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Nenhum diretório espelhado</h2>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 24px; line-height: 1.5;">Cole o link de uma pasta do Google Drive para gerar o link de entrega para seus clientes.</p>
          <button class="btn-primary" id="btnEmptyAddDir" style="padding: 10px 20px; font-size: 14px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            Adicionar Primeiro Diretório
          </button>
        </div>
      `;
      document.getElementById('btnEmptyAddDir')?.addEventListener('click', () => {
        this.openAddDirectoryModal();
      });
      return;
    }

    const gData = this.getGalleryData();
    if (!gData) return;
    const { proj, folders, currentFolder, breadcrumbTrail, targetFolderForCopy, copyCode, clientUrl, customDisplayUrl, currentLocationFolderId, scopedFolder, currentLocationName, searchPlaceholder, hasMultipleTypes, allItems, videoCount, imageCount, audioCount, pdfCount, fileCount, filteredItems, showCopyLinkBtn } = gData;

    container.innerHTML = `
      <!-- Header Row with Link & Edit Icons -->
      <div class="content-header-row gallery-title-header-row">
        <div class="project-title-wrapper">
          ${showCopyLinkBtn ? `
            <button class="icon-action-btn" id="btnCopyLink" title="Copiar link de entrega${targetFolderForCopy ? ` da pasta "${targetFolderForCopy.name}"` : ''}: .../${copyCode}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
            </button>
          ` : ''}

          ${(!this.isClientMode && currentFolder) ? `
            <button class="icon-action-btn" id="btnPinFolder" title="Fixar pasta &quot;${this.escapeHtml(currentFolder.name)}&quot; como novo diretório na divisão ${this.escapeHtml(proj.division || '')}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>
            </button>
          ` : ''}
          
          ${!this.isClientMode ? `
            <button class="icon-action-btn" id="btnEditProject" title="${currentFolder ? 'Editar configurações da pasta' : 'Editar título e link do Drive espelhado'}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            </button>
          ` : ''}

          <div class="gallery-breadcrumb-mount" id="galleryBreadcrumbMount">
            ${this.renderGalleryBreadcrumbHtml(gData)}
          </div>

          ${(() => {
            const unresolvedInProj = this.getUnresolvedCommentsCountForProject(proj.id);
            return unresolvedInProj > 0 ? `
              <span class="dir-unresolved-badge header-dir-badge" title="${unresolvedInProj} comentário${unresolvedInProj > 1 ? 's' : ''} a resolver neste diretório">
                ${unresolvedInProj}
              </span>
            ` : '';
          })()}
        </div>
      </div>

      <!-- Gallery Toolbar Section: Search on Left, Action Buttons on Right -->
      <div class="gallery-toolbar-section">
        <div class="gallery-toolbar-left">
          <!-- Barra de Pesquisa no Local Aberto -->
          <div class="gallery-header-search-box">
            <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              id="inputGallerySearch" 
              placeholder="${searchPlaceholder}" 
              value="${this.escapeHtml(this.gallerySearchQuery || '')}" 
              autocomplete="off" 
              title="Buscar pastas e arquivos no atual local aberto"
            />
            ${this.gallerySearchQuery ? `
              <button class="clear-search-btn" id="btnClearGallerySearch" title="Limpar busca" type="button">×</button>
            ` : ''}
          </div>
        </div>

        <div class="gallery-toolbar-right project-actions-right">
          <!-- Botão Filtrar -->
          ${((hasMultipleTypes || this.mediaFilter !== 'all') && allItems.length > 0) ? `
            <div class="gallery-filter-dropdown-wrapper">
              <button class="btn-secondary gallery-filter-btn ${this.mediaFilter !== 'all' ? 'has-active' : ''} ${this.isGalleryFilterOpen ? 'is-open' : ''}" 
                      id="btnGalleryFilterToggle" 
                      title="Filtrar arquivos por tipo"
                      type="button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                <span>${this.mediaFilter === 'video' ? 'Vídeos' : (this.mediaFilter === 'image' ? 'Fotos' : (this.mediaFilter === 'audio' ? 'Áudios' : (this.mediaFilter === 'file' ? 'Arquivos' : 'Filtrar')))}</span>
                ${this.mediaFilter !== 'all' ? `<span class="gallery-filter-pill-count">${filteredItems.length}</span>` : ''}
                <svg class="filter-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>

              <div class="gallery-filter-dropdown ${this.isGalleryFilterOpen ? 'open' : ''}" id="galleryFilterDropdown">
                <div class="gallery-filter-dropdown-header">
                  <div class="gallery-filter-dropdown-title">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    <span>Filtrar por tipo</span>
                  </div>
                  ${this.mediaFilter !== 'all' ? `
                    <button class="gallery-filter-clear-btn" id="btnClearGalleryFilter" type="button">
                      Limpar
                    </button>
                  ` : ''}
                </div>

                <div class="gallery-filter-options-list">
                  <button class="gallery-filter-opt ${this.mediaFilter === 'all' ? 'active' : ''}" data-filter="all" type="button">
                    <div class="gallery-filter-opt-left">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
                      <span>Todos</span>
                    </div>
                    <span class="gallery-filter-opt-count">${allItems.length}</span>
                  </button>

                  ${videoCount > 0 ? `
                    <button class="gallery-filter-opt ${this.mediaFilter === 'video' ? 'active' : ''}" data-filter="video" type="button">
                      <div class="gallery-filter-opt-left">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                        <span>Vídeos</span>
                      </div>
                      <span class="gallery-filter-opt-count">${videoCount}</span>
                    </button>
                  ` : ''}

                  ${imageCount > 0 ? `
                    <button class="gallery-filter-opt ${this.mediaFilter === 'image' ? 'active' : ''}" data-filter="image" type="button">
                      <div class="gallery-filter-opt-left">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                        <span>Fotos</span>
                      </div>
                      <span class="gallery-filter-opt-count">${imageCount}</span>
                    </button>
                  ` : ''}

                  ${audioCount > 0 ? `
                    <button class="gallery-filter-opt ${this.mediaFilter === 'audio' ? 'active' : ''}" data-filter="audio" type="button">
                      <div class="gallery-filter-opt-left">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                        <span>Áudios</span>
                      </div>
                      <span class="gallery-filter-opt-count">${audioCount}</span>
                    </button>
                  ` : ''}

                  ${pdfCount > 0 ? `
                    <button class="gallery-filter-opt ${this.mediaFilter === 'pdf' ? 'active' : ''}" data-filter="pdf" type="button">
                      <div class="gallery-filter-opt-left">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v2zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v4zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5z"/></svg>
                        <span>PDFs</span>
                      </div>
                      <span class="gallery-filter-opt-count">${pdfCount}</span>
                    </button>
                  ` : ''}

                  ${fileCount > 0 ? `
                    <button class="gallery-filter-opt ${this.mediaFilter === 'file' ? 'active' : ''}" data-filter="file" type="button">
                      <div class="gallery-filter-opt-left">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                        <span>Arquivos</span>
                      </div>
                      <span class="gallery-filter-opt-count">${fileCount}</span>
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Toggle de Visualização: Galeria vs Colunas (macOS Style) -->
          <div class="view-mode-toggle-group" role="group" aria-label="Modo de visualização">
            <button class="view-mode-btn ${this.galleryViewMode !== 'columns' ? 'active' : ''}" 
                    id="btnViewModeGrid" 
                    type="button" 
                    title="Visualização em Galeria (Grade)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zm-9 9h7v7H4v-7zm9 0h7v7h-7v-7z"/>
              </svg>
            </button>
            <button class="view-mode-btn ${this.galleryViewMode === 'columns' ? 'active' : ''}" 
                    id="btnViewModeColumns" 
                    type="button" 
                    title="Visualização em Colunas">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 4h4v16H4V4zm6 0h4v16h-4V4zm6 0h4v16h-4V4z"/>
              </svg>
            </button>
          </div>

          <!-- Botão Selecionar -->
          <button class="btn-secondary ${this.isSelectionMode ? 'active-select-btn' : ''}" id="btnToggleSelectionMode" title="Ativar ou desativar caixas de seleção">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            <span>${this.isSelectionMode ? 'Cancelar' : 'Selecionar'}</span>
          </button>

          <!-- Botão Baixar em Lote -->
          <button class="btn-primary" id="btnBatchDownload" title="Baixar arquivos em lote (.zip ou individuais)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
            <span>${gData.selectedCount > 0 ? `Baixar em Lote (${gData.selectedCount})` : 'Baixar em Lote'}</span>
          </button>

          <!-- Upload de Arquivos (Exclusivo Modo Autor) -->
          ${!this.isClientMode ? `
            <button class="btn-secondary" id="btnUploadMedia" title="Fazer upload de arquivos direto para esta pasta no Google Drive">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
              <span>Fazer Upload</span>
            </button>
            <input type="file" id="inputUploadMedia" multiple style="display:none;" />
          ` : ''}

          <!-- Atualizar do Drive (Modo Autor) -->
          ${!this.isClientMode ? `
            <button class="btn-secondary" id="btnSyncDrive" title="Espelhar e atualizar da pasta do Drive">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
              <span>Atualizar do Drive</span>
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Barra de Controle de Seleção (quando ativa) -->
      ${this.isSelectionMode ? `
        <div class="selection-control-bar">
          <div class="selection-control-left">
            <button class="btn-secondary btn-sm" id="btnSelectAllMedia">
              ${gData.isAllSelected ? 'Desmarcar Todos' : `Selecionar Todos (${gData.totalSelectable})`}
            </button>
            <span class="selection-count-text">
              <strong>${gData.selectedCount}</strong> de ${gData.totalSelectable} selecionado${gData.totalSelectable !== 1 ? 's' : ''}
            </span>
          </div>
          <div class="selection-control-right">
            <button class="btn-primary btn-sm" id="btnBatchDownloadFromBar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
              Baixar ${gData.selectedCount > 0 ? `(${gData.selectedCount})` : 'Tudo'}
            </button>
          </div>
        </div>
      ` : ''}

      <!-- Banner if Archived -->
      ${proj.archived ? `
        <div class="archive-banner">
          <div class="archive-banner-text">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/></svg>
            <span>Este diretório está arquivado e oculto dos diretórios ativos.</span>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button class="btn-secondary" id="btnRestoreFromBanner" style="font-size: 12px; padding: 6px 14px; font-weight: 600;">
              Restaurar Diretório
            </button>
            <button class="btn-danger-outline" id="btnDeleteFromBanner" style="font-size: 12px; padding: 6px 14px; font-weight: 600;" title="Excluir este diretório do Cloud (mantém no Google Drive)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              Excluir do Cloud
            </button>
          </div>
        </div>
      ` : ''}

      <!-- DYNAMIC RESULTS AREA (Pastas, Arquivos, Resultados de Busca e Estados Vazios) -->
      <div id="galleryDynamicArea">
        ${this.buildGalleryDynamicHtml(gData)}
      </div>

      <!-- Upload Dropzone Overlay (Apenas visível ao arrastar arquivos sobre a janela) -->
      ${!this.isClientMode ? `
        <div class="upload-dropzone-overlay" id="uploadDropOverlay">
          <div class="upload-dropzone-box">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            <h3>Solte os arquivos para enviar</h3>
            <p>Os arquivos irão direto para o Google Drive na pasta: <strong>${this.escapeHtml(currentFolder ? currentFolder.name : proj.name)}</strong></p>
          </div>
        </div>
      ` : ''}
    `;

    // Static Header & Toolbar Bindings
    document.getElementById('btnCopyLink')?.addEventListener('click', () => {
      const currentG = this.getGalleryData();
      const currentUrl = currentG ? currentG.clientUrl : clientUrl;
      const currentCode = currentG ? currentG.copyCode : copyCode;
      navigator.clipboard.writeText(currentUrl);
      window.showToast(`Link copiado: .../${currentCode}`);
    });

    // Barra de Pesquisa no Local Aberto (Instantânea, sem destruir input)
    const gallerySearchInput = document.getElementById('inputGallerySearch');
    if (gallerySearchInput) {
      gallerySearchInput.addEventListener('input', (e) => {
        this.gallerySearchQuery = e.target.value;
        const curPos = gallerySearchInput.selectionStart;
        this.updateGalleryDynamicArea(container);
        if (document.activeElement !== gallerySearchInput) {
          try { gallerySearchInput.focus({ preventScroll: true }); } catch (_) {}
        }
        if (curPos !== null && curPos !== undefined) {
          try { gallerySearchInput.setSelectionRange(curPos, curPos); } catch (_) {}
        }
      });
      gallerySearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.gallerySearchQuery = '';
          gallerySearchInput.value = '';
          this.updateGalleryDynamicArea(container);
        }
      });
    }

    document.getElementById('btnClearGallerySearch')?.addEventListener('click', () => {
      this.gallerySearchQuery = '';
      if (gallerySearchInput) gallerySearchInput.value = '';
      this.updateGalleryDynamicArea(container);
      gallerySearchInput?.focus();
    });

    container.querySelectorAll('.gallery-crumb-link').forEach(crumb => {
      crumb.addEventListener('click', () => {
        const targetFid = crumb.getAttribute('data-folder-id');
        this.gallerySearchQuery = '';
        this.currentFolderId = targetFid === 'root' ? (this.scopedFolderId || null) : targetFid;
        this.selectedMediaIds.clear();
        this.selectedFolderIds.clear();
        this.mediaFilter = 'all';
        const crumbFolder = folders.find(f => f.id === this.currentFolderId);
        const targetUrl = this.isClientMode
          ? `/${(crumbFolder && crumbFolder.shortCode) || (this.scopedFolderId && folders.find(f => f.id === this.scopedFolderId)?.shortCode) || proj.shortCode || proj.slug}`
          : `/author?project=${proj.id}${this.currentFolderId ? `&folder=${encodeURIComponent(this.currentFolderId)}` : ''}`;
        window.history.pushState({}, '', targetUrl);
        if (this.galleryViewMode === 'columns') {
          this.updateGalleryDynamicArea(container);
        } else {
          this.render();
        }
      });
    });

    document.getElementById('btnPinFolder')?.addEventListener('click', () => {
      this.pinCurrentFolder();
    });

    document.getElementById('btnEditProject')?.addEventListener('click', () => {
      const currentG = this.getGalleryData();
      if (currentG && currentG.currentFolder) {
        this.openEditFolderModal(currentG.currentFolder, currentG.proj);
      } else if (currentG && currentG.proj) {
        this.openEditProjectModal(currentG.proj);
      } else if (currentFolder) {
        this.openEditFolderModal(currentFolder, proj);
      } else {
        this.openEditProjectModal(proj);
      }
    });

    document.getElementById('btnRestoreFromBanner')?.addEventListener('click', async () => {
      try {
        const res = await window.API.unarchiveProject(proj.id);
        await this.fetchData();
        this.selectedProject = this.data.projects.find(p => p.id === proj.id);
        if (res && res.categoryRestored) {
          window.showToast(`Projeto restaurado! A categoria "${res.categoryRestored}" foi recuperada junto.`);
        } else {
          window.showToast('Projeto restaurado aos diretórios ativos');
        }
        this.render();
      } catch (e) {
        alert('Erro ao restaurar projeto');
      }
    });

    document.getElementById('btnDeleteFromBanner')?.addEventListener('click', () => {
      this.promptDeleteProject(proj);
    });

    document.getElementById('btnSyncDrive')?.addEventListener('click', async () => {
      window.showToast('Espelhando pasta do Google Drive...');
      try {
        const res = await window.API.syncDrive(proj.id, proj.driveLink);
        if (res.error) {
          alert(res.error);
          return;
        }
        window.showToast(res.message || 'Drive sincronizado com sucesso!');
        await this.fetchData();
        this.selectedProject = this.data.projects.find(p => p.id === proj.id);
        this.render();
      } catch (e) {
        window.showToast('Erro ao espelhar Drive');
      }
    });

    // Upload de Arquivos Direto para o Google Drive (Exclusivo Modo Autor)
    if (!this.isClientMode) {
      const btnUploadMedia = document.getElementById('btnUploadMedia');
      const inputUploadMedia = document.getElementById('inputUploadMedia');
      const targetFolderId = this.currentFolderId || proj.driveFolderId;
      const targetFolderName = currentFolder ? currentFolder.name : proj.name;

      btnUploadMedia?.addEventListener('click', () => {
        inputUploadMedia?.click();
      });

      inputUploadMedia?.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.handleFilesUpload(e.target.files, targetFolderId, targetFolderName);
          e.target.value = '';
        }
      });

      let dragCounter = 0;
      const dropOverlay = document.getElementById('uploadDropOverlay');

      container.addEventListener('dragenter', (e) => {
        if (!e.dataTransfer || !e.dataTransfer.types || !Array.from(e.dataTransfer.types).includes('Files')) return;
        e.preventDefault();
        dragCounter++;
        if (dropOverlay) dropOverlay.classList.add('visible');
      });

      container.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dragCounter--;
        if (dragCounter <= 0) {
          dragCounter = 0;
          if (dropOverlay) dropOverlay.classList.remove('visible');
        }
      });

      container.addEventListener('dragover', (e) => {
        if (!e.dataTransfer || !e.dataTransfer.types || !Array.from(e.dataTransfer.types).includes('Files')) return;
        e.preventDefault();
      });

      container.addEventListener('drop', (e) => {
        e.preventDefault();
        dragCounter = 0;
        if (dropOverlay) dropOverlay.classList.remove('visible');
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          this.handleFilesUpload(e.dataTransfer.files, targetFolderId, targetFolderName);
        }
      });
    }

    // Toggle View Mode (Galeria vs Colunas macOS)
    document.getElementById('btnViewModeGrid')?.addEventListener('click', () => {
      this.setGalleryViewMode('grid');
    });

    document.getElementById('btnViewModeColumns')?.addEventListener('click', () => {
      this.setGalleryViewMode('columns');
    });

    // Selection Mode Toggle
    document.getElementById('btnToggleSelectionMode')?.addEventListener('click', () => {
      const vp = container.querySelector('#macosColumnsViewport');
      if (vp) this._columnsLastScrollLeft = vp.scrollLeft;
      this.isSelectionMode = !this.isSelectionMode;
      if (!this.isSelectionMode) {
        this.selectedMediaIds.clear();
        this.selectedFolderIds.clear();
        this._lastSelectedAnchor = null;
      }
      this.renderGalleryView(container);
    });

    // Select / Deselect All
    document.getElementById('btnSelectAllMedia')?.addEventListener('click', () => {
      const vp = container.querySelector('#macosColumnsViewport');
      if (vp) this._columnsLastScrollLeft = vp.scrollLeft;
      const g = this.getGalleryData();
      if (!g) return;
      if (g.isAllSelected) {
        this.selectedMediaIds.clear();
        this.selectedFolderIds.clear();
        this._lastSelectedAnchor = null;
      } else {
        g.filteredItems.forEach(i => this.selectedMediaIds.add(i.id));
        g.subfoldersAtLevel.forEach(f => this.selectedFolderIds.add(f.id));
      }
      this.renderGalleryView(container);
    });

    // Batch Download Trigger
    document.getElementById('btnBatchDownload')?.addEventListener('click', () => {
      const g = this.getGalleryData();
      if (g) this.openBatchDownloadModal(proj, g.filteredItems);
    });

    document.getElementById('btnBatchDownloadFromBar')?.addEventListener('click', () => {
      const g = this.getGalleryData();
      if (g) this.openBatchDownloadModal(proj, g.filteredItems);
    });

    // Gallery Filter Dropdown Toggle & Click Outside
    const galFilterBtn = document.getElementById('btnGalleryFilterToggle');
    const galFilterDropdown = document.getElementById('galleryFilterDropdown');

    if (galFilterBtn && galFilterDropdown) {
      galFilterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.isGalleryFilterOpen = !this.isGalleryFilterOpen;
        galFilterDropdown.classList.toggle('open', this.isGalleryFilterOpen);
        galFilterBtn.classList.toggle('is-open', this.isGalleryFilterOpen);
      });

      galFilterDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    if (!this._galleryFilterClickOutsideBound) {
      this._galleryFilterClickOutsideBound = true;
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.gallery-filter-dropdown-wrapper')) {
          if (this.isGalleryFilterOpen) {
            this.isGalleryFilterOpen = false;
            const dd = document.getElementById('galleryFilterDropdown');
            const btn = document.getElementById('btnGalleryFilterToggle');
            if (dd) dd.classList.remove('open');
            if (btn) btn.classList.remove('is-open');
          }
        }
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isGalleryFilterOpen) {
          this.isGalleryFilterOpen = false;
          const dd = document.getElementById('galleryFilterDropdown');
          const btn = document.getElementById('btnGalleryFilterToggle');
          if (dd) dd.classList.remove('open');
          if (btn) btn.classList.remove('is-open');
        }
      });
    }

    // Filter Options
    container.querySelectorAll('.gallery-filter-opt').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        this.mediaFilter = opt.getAttribute('data-filter') || 'all';
        this.isGalleryFilterOpen = false;
        this.renderGalleryView(container);
      });
    });

    document.getElementById('btnClearGalleryFilter')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.mediaFilter = 'all';
      this.isGalleryFilterOpen = false;
      this.renderGalleryView(container);
    });

    // Bind Dynamic Area Events (cards, checkboxes, subfolders, search reset)
    this.bindGalleryDynamicEvents(container, gData);
  }

  getGalleryData(proj = this.selectedProject) {
    if (!proj) {
      return {
        proj: null,
        folders: [],
        currentFolder: null,
        breadcrumbTrail: [],
        targetFolderForCopy: null,
        copyCode: '',
        clientUrl: window.location.origin,
        customDisplayUrl: `https://${this.data?.settings?.baseDomain || 'giffu.com.br'}`,
        currentLocationFolderId: null,
        scopedFolder: null,
        currentLocationName: 'Diretórios',
        searchPlaceholder: 'Buscar diretórios...',
        hasMultipleTypes: false,
        allItems: [],
        videoCount: 0,
        imageCount: 0,
        audioCount: 0,
        pdfCount: 0,
        fileCount: 0,
        filteredItems: [],
        showCopyLinkBtn: false,
        subfoldersAtLevel: []
      };
    }
    const folders = proj.folders || [];

    // Find current folder if set
    let currentFolder = null;
    if (this.currentFolderId) {
      currentFolder = folders.find(f => f.id === this.currentFolderId) || null;
      if (!currentFolder && proj.driveFolderId === this.currentFolderId) {
        currentFolder = null;
      }
    }

    // Build breadcrumb trail of ancestor folders
    const breadcrumbTrail = [];
    if (currentFolder) {
      let temp = currentFolder;
      while (temp) {
        breadcrumbTrail.unshift(temp);
        if (this.isClientMode && this.scopedFolderId && temp.id === this.scopedFolderId) {
          break;
        }
        temp = temp.parentId ? folders.find(f => f.id === temp.parentId) : null;
      }
    }

    const targetFolderForCopy = currentFolder || (this.scopedFolderId ? folders.find(f => f.id === this.scopedFolderId) : null);
    const copyCode = targetFolderForCopy ? (targetFolderForCopy.shortCode || targetFolderForCopy.id) : (proj.shortCode || proj.slug);
    const clientUrl = `${window.location.origin}/${copyCode}`;
    const customDisplayUrl = `https://${this.data?.settings?.baseDomain || 'giffu.com.br'}/${copyCode}`;

    // Current open location definition
    const currentLocationFolderId = currentFolder ? currentFolder.id : (this.isClientMode && this.scopedFolderId ? this.scopedFolderId : null);
    const scopedFolder = (this.isClientMode && this.scopedFolderId) ? (folders.find(f => f.id === this.scopedFolderId) || null) : null;
    const currentLocationName = currentFolder ? currentFolder.name : (scopedFolder ? scopedFolder.name : proj.name);
    const searchPlaceholder = currentFolder ? `Buscar em "${currentFolder.name}"...` : (scopedFolder ? `Buscar em "${scopedFolder.name}"...` : 'Buscar neste diretório...');

    const rawGallerySearch = (this.gallerySearchQuery || '').trim();
    const isSearching = rawGallerySearch.length > 0;

    const openLocationDescendants = currentLocationFolderId ? this.getDescendantFolderIds(proj, currentLocationFolderId) : null;

    let subfoldersAtLevel = [];
    let allItems = [];

    if (!isSearching) {
      subfoldersAtLevel = folders.filter(f => {
        if (currentLocationFolderId) {
          return f.parentId === currentLocationFolderId;
        } else {
          return f.parentId === proj.driveFolderId || !f.parentId;
        }
      });

      allItems = (proj.videos || []).filter(item => {
        const itemFolderId = item.driveFolderId || item.folderId;
        if (currentLocationFolderId) {
          return itemFolderId === currentLocationFolderId;
        } else {
          return !itemFolderId || itemFolderId === proj.driveFolderId;
        }
      });
    } else {
      // Searching inside open location (either subfolder, scoped folder, or root of project)
      const candidateFolders = currentLocationFolderId
        ? folders.filter(f => openLocationDescendants.has(f.id) && f.id !== currentLocationFolderId)
        : folders;

      const candidateItems = currentLocationFolderId
        ? (proj.videos || []).filter(item => {
            const fid = item.driveFolderId || item.folderId;
            return fid && openLocationDescendants.has(fid);
          })
        : (proj.videos || []);

      subfoldersAtLevel = candidateFolders.filter(f => this.matchesFolderSearch(f, rawGallerySearch));
      allItems = candidateItems.filter(item => this.matchesItemSearch(item, rawGallerySearch));
    }

    const videoCount = allItems.filter(v => this.getItemType(v) === 'video').length;
    const imageCount = allItems.filter(v => this.getItemType(v) === 'image').length;
    const audioCount = allItems.filter(v => this.getItemType(v) === 'audio').length;
    const pdfCount = allItems.filter(v => this.getItemType(v) === 'pdf').length;
    const fileCount = allItems.filter(v => ['archive', 'file'].includes(this.getItemType(v))).length;
    const distinctTypes = [videoCount > 0, imageCount > 0, audioCount > 0, pdfCount > 0, fileCount > 0].filter(Boolean).length;
    const hasMultipleTypes = distinctTypes > 1;

    const filteredItems = allItems.filter(item => {
      const type = this.getItemType(item);
      if (this.mediaFilter === 'video') return type === 'video';
      if (this.mediaFilter === 'image') return type === 'image';
      if (this.mediaFilter === 'audio') return type === 'audio';
      if (this.mediaFilter === 'pdf') return type === 'pdf';
      if (this.mediaFilter === 'file') return type === 'archive' || type === 'file';
      return true;
    });

    const totalSelectable = subfoldersAtLevel.length + filteredItems.length;
    const selectedFoldersCount = this.selectedFolderIds ? this.selectedFolderIds.size : 0;
    const selectedMediaCount = this.selectedMediaIds ? this.selectedMediaIds.size : 0;
    const selectedCount = selectedFoldersCount + selectedMediaCount;

    const isAllSelected = totalSelectable > 0 &&
      subfoldersAtLevel.every(f => this.selectedFolderIds && this.selectedFolderIds.has(f.id)) &&
      filteredItems.every(i => this.selectedMediaIds && this.selectedMediaIds.has(i.id));

    const isShareAllowed = targetFolderForCopy
      ? this.isShareAllowedForFolder(targetFolderForCopy, proj)
      : (proj.allowShare !== false);
    const showCopyLinkBtn = (!this.isClientMode) || isShareAllowed;

    return {
      proj,
      folders,
      currentFolder,
      breadcrumbTrail,
      targetFolderForCopy,
      copyCode,
      clientUrl,
      customDisplayUrl,
      currentLocationFolderId,
      scopedFolder,
      currentLocationName,
      searchPlaceholder,
      rawGallerySearch,
      isSearching,
      subfoldersAtLevel,
      allItems,
      filteredItems,
      videoCount,
      imageCount,
      audioCount,
      pdfCount,
      fileCount,
      distinctTypes,
      hasMultipleTypes,
      totalSelectable,
      selectedCount,
      isAllSelected,
      showCopyLinkBtn
    };
  }

  handleGalleryShiftSelect(container, fromId, toId) {
    if (!container) return;
    const cards = Array.from(container.querySelectorAll('.subfolder-card, .video-card'));
    if (!cards.length) return;

    const toStr = toId != null ? String(toId) : '';
    let idxB = cards.findIndex(c => String(c.getAttribute('data-folder-id') || '') === toStr || String(c.getAttribute('data-video-id') || '') === toStr);
    if (idxB === -1) return;

    let idxA = -1;
    if (fromId != null) {
      const fromStr = String(fromId);
      idxA = cards.findIndex(c => String(c.getAttribute('data-folder-id') || '') === fromStr || String(c.getAttribute('data-video-id') || '') === fromStr);
    }
    // Se o âncora anterior não for encontrado, usa o primeiro item selecionado ou o primeiro card
    if (idxA === -1) {
      idxA = cards.findIndex(c => c.classList.contains('selected-for-batch') || c.querySelector('.video-card-checkbox.checked, .subfolder-checkbox-container.checked'));
    }
    if (idxA === -1) {
      idxA = 0;
    }

    const start = Math.min(idxA, idxB);
    const end = Math.max(idxA, idxB);

    for (let i = start; i <= end; i++) {
      const card = cards[i];
      const fId = card.getAttribute('data-folder-id');
      const vId = card.getAttribute('data-video-id');
      if (fId) {
        this.selectedFolderIds.add(fId);
      } else if (vId) {
        this.selectedMediaIds.add(vId);
      }
    }

    const targetCard = cards[idxB];
    const targetFid = targetCard?.getAttribute('data-folder-id');
    const targetVid = targetCard?.getAttribute('data-video-id');
    this._lastSelectedAnchor = {
      id: targetFid || targetVid || toId,
      type: targetFid ? 'folder' : 'file',
      context: 'gallery'
    };

    this.renderGalleryView(container);
  }

  handleColumnShiftSelect(col, fromId, toId, updateSelectionBar) {
    if (!col) return;
    const items = Array.from(col.querySelectorAll('.macos-col-folder, .macos-col-file'));
    if (!items.length) return;

    const toStr = toId != null ? String(toId) : '';
    let idxB = items.findIndex(el => String(el.getAttribute('data-folder-id') || '') === toStr || String(el.getAttribute('data-file-id') || '') === toStr);
    if (idxB === -1) return;

    let idxA = -1;
    if (fromId != null) {
      const fromStr = String(fromId);
      idxA = items.findIndex(el => String(el.getAttribute('data-folder-id') || '') === fromStr || String(el.getAttribute('data-file-id') || '') === fromStr);
    }
    // Se não encontrou âncora nesta coluna, procura o primeiro elemento já selecionado na coluna
    if (idxA === -1) {
      idxA = items.findIndex(el => el.classList.contains('selected-for-batch') || el.querySelector('.macos-col-checkbox.checked'));
    }
    // Se nenhum estiver selecionado, usa o primeiro item da coluna (índice 0)
    if (idxA === -1) {
      idxA = 0;
    }

    const checkSvg = `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>`;
    const start = Math.min(idxA, idxB);
    const end = Math.max(idxA, idxB);

    for (let i = start; i <= end; i++) {
      const el = items[i];
      const fId = el.getAttribute('data-folder-id');
      const fileId = el.getAttribute('data-file-id');
      const cb = el.querySelector('.macos-col-checkbox');

      if (fId) {
        this.selectedFolderIds.add(fId);
        cb?.classList.add('checked');
        if (cb) cb.innerHTML = checkSvg;
        el.classList.add('selected-for-batch');
      } else if (fileId) {
        this.selectedMediaIds.add(fileId);
        cb?.classList.add('checked');
        if (cb) cb.innerHTML = checkSvg;
        el.classList.add('selected-for-batch');
      }
    }

    const colIndex = col.getAttribute('data-col-index') || '0';
    const targetEl = items[idxB];
    const targetFid = targetEl?.getAttribute('data-folder-id');
    const targetFileId = targetEl?.getAttribute('data-file-id');
    this._lastSelectedAnchor = {
      id: targetFid || targetFileId || toId,
      type: targetFid ? 'folder' : 'file',
      context: `column_${colIndex}`
    };

    if (typeof updateSelectionBar === 'function') updateSelectionBar();
  }

  renderGalleryCard(item, isSearching = false) {
    const itemType = this.getItemType(item);
    const isAudio = itemType === 'audio';
    const isPdf = itemType === 'pdf';
    const isImage = itemType === 'image';
    const isArchive = itemType === 'archive';
    const isGenericFile = itemType === 'file';
    const isOtherFile = isArchive || isGenericFile;
    const unresolvedCount = this.getUnresolvedCommentsCount(item.id);
    const detectedExt = (this.getFileExtension(item) || '').replace(/^\./, '').toUpperCase();
    const isPsd = item.subType === 'psd' || detectedExt === 'PSD';
    const isAi = item.subType === 'ai' || detectedExt === 'AI';
    const isDesign = isPsd || isAi;

    const aspectClass = isAudio ? 'aspect-16-9' : ({
      '9:16': 'aspect-9-16',
      '3:2': 'aspect-3-2',
      '4:3': 'aspect-4-3',
      '1:1': 'aspect-1-1',
      '2:3': 'aspect-2-3',
      '3:4': 'aspect-3-4'
    }[item.aspectRatio] || (isImage || isPdf ? 'aspect-3-2' : (item.aspectRatio === '9:16' ? 'aspect-9-16' : 'aspect-16-9')));

    const isSelected = this.isSelectionMode && this.selectedMediaIds && this.selectedMediaIds.has(item.id);
    const isHighlighted = Boolean(this.highlightedMediaId && this.highlightedMediaId === item.id);
    const itemFormat = detectedExt || (isAudio ? 'MP3' : (isPdf ? 'PDF' : (isPsd ? 'PSD' : (isAi ? 'AI' : (isImage ? 'JPG' : (isOtherFile ? (isArchive ? 'ZIP' : 'ARQUIVO') : 'MP4'))))));
    const ext = itemFormat;

    const cardImgSrc = (isDesign || isPdf)
      ? (item.thumbnailUrl || (item.driveFileId ? `/api/stream/preview?drive=${item.driveFileId}&size=600` : item.url))
      : (item.thumbnailUrl || (item.driveFileId ? `/api/stream/preview?drive=${item.driveFileId}&size=600` : item.url));

    const pillClass = isPdf ? 'doc-pill pdf-pill' : (isPsd ? 'photo-pill psd-pill' : (isAi ? 'photo-pill ai-pill' : 'photo-pill'));
    const formattedSize = this.formatFileSize(item.size);
    const isProtected = this.isVideoPasswordProtected(item, this.selectedProject);
    const isLockedClient = this.isVideoLockedForClient(item, this.selectedProject);

    return `
      <div class="video-card ${isAudio ? 'audio-card' : (isPdf ? 'file-card pdf-card' : (isImage ? 'photo-card' : (isOtherFile ? 'file-card' : '')))} ${isSelected ? 'selected-for-batch' : ''} ${isHighlighted ? 'highlighted-search-item' : ''} ${isLockedClient ? 'locked-media-card' : ''}" data-video-id="${item.id}" data-type="${itemType}">
        <div class="card-media-wrapper ${aspectClass}">
          ${this.isSelectionMode ? `
            <div class="media-checkbox-container ${isSelected ? 'checked' : ''}" data-id="${item.id}" title="${isSelected ? 'Desmarcar' : 'Selecionar'}">
              ${isSelected ? `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
              ` : ''}
            </div>
          ` : ''}

          ${isProtected ? `
            <div class="card-lock-badge" title="${isLockedClient ? 'Arquivo protegido por senha (clique para desbloquear)' : 'Protegido por senha'}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
            </div>
          ` : ''}

          ${unresolvedCount > 0 ? `
            <div class="card-unresolved-badge" title="${unresolvedCount} comentário${unresolvedCount > 1 ? 's' : ''} não resolvido${unresolvedCount > 1 ? 's' : ''}">
              <span class="unresolved-num">${unresolvedCount}</span>
            </div>
          ` : ''}

          ${isLockedClient ? `
            <div class="card-file-display card-locked-display">
              <div class="file-icon-box locked-box">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </div>
              <span class="card-locked-label">Protegido por senha</span>
            </div>
            <span class="card-media-type-pill file-pill" style="${item.color ? `background-color: ${item.color}; color: #fff; border-color: ${item.color};` : ''}">
              ${ext}
            </span>
            <div class="card-play-overlay">
              <div class="play-icon-circle" title="Desbloquear arquivo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
              </div>
            </div>
          ` : ((isImage || isPdf) ? `
            <img class="card-preview-image" src="${cardImgSrc}" alt="${this.getDisplayTitle(item)}" loading="lazy" decoding="async" onerror="window.handleMediaThumbError && window.handleMediaThumbError(this, '${item.driveFileId || ''}', '${item.url || ''}')" onload="if (this.naturalWidth && !this.closest('.video-card').querySelector('.card-photo-res')?.textContent?.includes('x')) { const el = this.closest('.video-card').querySelector('.card-photo-res'); if (el && !${isPdf}) el.textContent = this.naturalWidth + 'x' + this.naturalHeight; }" />
            
            <span class="card-media-type-pill ${pillClass}" style="${item.color ? `background-color: ${item.color}; color: #fff; border-color: ${item.color};` : ''}">
              ${isPdf ? `
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v2zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v4zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5z"/></svg>
              ` : `
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
              `}
              ${itemFormat}
            </span>

            <div class="card-play-overlay">
              <div class="play-icon-circle image-zoom-circle" title="Visualizar ${isPdf ? 'PDF' : (isDesign ? itemFormat : 'foto')}">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="10.5" cy="10.5" r="7"></circle>
                  <line x1="21" y1="21" x2="15.5" y2="15.5"></line>
                </svg>
              </div>
            </div>
          ` : (isAudio ? `
            ${(item.customThumbnailUrl || (item.thumbnailUrl && item.thumbnailUrl.includes('/api/stream/preview'))) ? `
              <img class="card-preview-image" src="${item.customThumbnailUrl || item.thumbnailUrl}" alt="${this.getDisplayTitle(item)}" loading="lazy" />
            ` : `
              <div class="card-audio-display">
                <div class="card-audio-disc-icon" style="${item.color ? `color: ${item.color};` : ''}">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                  </svg>
                </div>
                <div class="card-audio-wave-anim">
                  <span></span><span></span><span></span><span></span><span></span>
                </div>
              </div>
            `}

            <span class="card-media-type-pill audio-pill" style="${item.color ? `background-color: ${item.color}; color: #fff; border-color: ${item.color};` : ''}">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
              ${ext}
            </span>

            <div class="card-play-overlay">
              <div class="play-icon-circle" title="Reproduzir áudio">
                <svg width="24" height="24" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          ` : (isOtherFile ? `
            <div class="card-file-display ${isArchive ? 'card-zip-display' : ''}">
              <div class="file-icon-box ${isArchive ? 'zip-box' : ''}" style="${item.color ? `color: ${item.color};` : ''}">
                ${isArchive ? `
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 10v2h-4v-2h4zm0-3v2h-4v-2h4zm0-3v2h-4v-2h4z"/>
                  </svg>
                ` : `
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                `}
              </div>
            </div>

            <span class="card-media-type-pill file-pill" style="${item.color ? `background-color: ${item.color}; color: #fff; border-color: ${item.color};` : ''}">
              ${ext}
            </span>

            <div class="card-play-overlay">
              <div class="play-icon-circle" title="Baixar arquivo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
              </div>
            </div>
          ` : `
            ${(item.customThumbnailUrl || item.thumbnailUrl) ? `
              <img class="card-preview-image" src="${item.customThumbnailUrl || item.thumbnailUrl}" alt="${this.getDisplayTitle(item)}" loading="lazy" decoding="async" onerror="window.handleMediaThumbError && window.handleMediaThumbError(this, '${item.driveFileId || ''}', '')" />
            ` : `
              <video 
                class="card-video video-preview-element" 
                src="${item.previewUrl || item.url}${this.getVideoPreviewTimecode(item)}" 
                preload="metadata" 
                muted 
                playsinline
                onloadedmetadata="window.handleVideoPreviewMetadata && window.handleVideoPreviewMetadata(this)"
              ></video>
            `}

            <span class="card-media-type-pill video-pill" style="${item.color ? `background-color: ${item.color}; color: #fff; border-color: ${item.color};` : ''}">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              ${itemFormat}
            </span>

            <div class="card-play-overlay">
              <div class="play-icon-circle">
                <svg width="24" height="24" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          `)))}
        </div>

        <div class="card-info">
          <span class="card-title">${this.getDisplayTitle(item)}</span>
          ${(isSearching && item.folderPath) ? `
            <div class="card-search-folder-tag" title="Localizado em: ${this.escapeHtml(item.folderPath)}">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
              <span>${this.escapeHtml(item.folderPath)}</span>
            </div>
          ` : ''}
          <div class="card-meta">
            ${isAudio ? `
              <span class="badge-aspect">ÁUDIO</span>
              <span>${item.duration || 'Áudio'}</span>
              <span>• ${ext}</span>
              ${formattedSize ? `<span>• ${formattedSize}</span>` : ''}
            ` : (isPdf ? `
              <span class="badge-aspect">PDF</span>
              <span>Documento</span>
              ${formattedSize ? `<span>• ${formattedSize}</span>` : ''}
            ` : (isOtherFile ? `
              <span class="badge-aspect">${ext || (isArchive ? 'ZIP' : 'ARQUIVO')}</span>
              <span>${formattedSize || 'Arquivo'}</span>
            ` : `
              <span class="badge-aspect">${isPsd ? 'PSD' : (isAi ? 'AI' : (item.aspectRatio || (isImage ? '3:2' : '16:9')))}</span>
              ${isImage ? `
                <span class="card-photo-res">${item.dimensions || (item.resolution && item.resolution.includes('x') ? item.resolution : (isPsd ? 'PSD' : (isAi ? 'AI' : 'Foto')))}</span>
                ${formattedSize ? `<span>• ${formattedSize}</span>` : ''}
              ` : `
                <span>${item.duration || '00:10'}</span>
                <span>• ${window.classifyResolution ? window.classifyResolution(item.resolution) : 'FHD'}</span>
                ${formattedSize ? `<span>• ${formattedSize}</span>` : ''}
              `}
            `))}
          </div>
        </div>
      </div>
    `;
  }

  buildGalleryDynamicHtml(gData) {
    const { proj, folders, currentLocationName, isSearching, rawGallerySearch, subfoldersAtLevel, allItems, filteredItems } = gData;

    let searchBarHtml = '';
    if (isSearching) {
      searchBarHtml = `
        <div class="gallery-search-results-bar">
          <div class="gallery-search-results-info">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <span>Resultados para "<strong>${this.escapeHtml(rawGallerySearch)}</strong>" em <em>${this.escapeHtml(currentLocationName)}</em> (${filteredItems.length} arquivo${filteredItems.length !== 1 ? 's' : ''}${subfoldersAtLevel.length > 0 ? `, ${subfoldersAtLevel.length} pasta${subfoldersAtLevel.length !== 1 ? 's' : ''}` : ''})</span>
          </div>
          <button class="btn-secondary btn-sm" id="btnResetGallerySearch" type="button">Limpar busca</button>
        </div>
      `;
    }

    let searchEmptyHtml = '';
    if (isSearching && subfoldersAtLevel.length === 0 && filteredItems.length === 0) {
      searchEmptyHtml = `
        <div class="gallery-search-empty">
          <div class="gallery-search-empty-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <h3>Nenhum resultado encontrado</h3>
          <p>Não encontramos pastas ou arquivos correspondentes a "<strong>${this.escapeHtml(rawGallerySearch)}</strong>" em <em>${this.escapeHtml(currentLocationName)}</em>.</p>
          <button class="btn-secondary" id="btnEmptyResetSearch" style="margin-top: 8px;">Ver todos os arquivos deste local</button>
        </div>
      `;
    }

    let subfoldersHtml = '';
    if (subfoldersAtLevel.length > 0) {
      subfoldersHtml = `
        <div class="subfolders-section">
          <div class="subfolders-grid">
            ${subfoldersAtLevel.map(sub => {
              const isSubProtected = this.isFolderPasswordProtected(sub, proj);
              const isSubLocked = this.isFolderLockedForClient(sub, proj);
              const directFiles = (proj.videos || []).filter(v => (v.driveFolderId || v.folderId) === sub.id).length;
              const directChildren = folders.filter(f => f.parentId === sub.id).length;
              let countStr = '';
              if (isSubLocked) {
                countStr = 'Protegida por senha';
              } else if (directChildren > 0 && directFiles > 0) {
                countStr = `${directChildren} pasta${directChildren > 1 ? 's' : ''} • ${directFiles} arquivo${directFiles > 1 ? 's' : ''}`;
              } else if (directChildren > 0) {
                countStr = `${directChildren} pasta${directChildren > 1 ? 's' : ''}`;
              } else if (directFiles > 0) {
                countStr = `${directFiles} arquivo${directFiles > 1 ? 's' : ''}`;
              } else {
                countStr = 'Vazia';
              }
              const isFolderSelected = this.isSelectionMode && this.selectedFolderIds && this.selectedFolderIds.has(sub.id);
              const unresolvedInSub = this.getUnresolvedCommentsCountForFolder(proj, sub.id);

              return `
                <div class="subfolder-card ${isFolderSelected ? 'selected-for-batch' : ''}" data-folder-id="${sub.id}" title="${this.isSelectionMode ? (isFolderSelected ? 'Desmarcar pasta ' + sub.name : 'Selecionar pasta ' + sub.name) : 'Abrir pasta ' + sub.name}">
                  ${this.isSelectionMode ? `
                    <div class="subfolder-checkbox-container ${isFolderSelected ? 'checked' : ''}" data-folder-id="${sub.id}" title="${isFolderSelected ? 'Desmarcar' : 'Selecionar'}">
                      ${isFolderSelected ? `
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                      ` : ''}
                    </div>
                  ` : ''}
                  <div class="subfolder-icon-wrap" style="${sub.color ? `color: ${sub.color};` : ''}">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
                  </div>
                  <div class="subfolder-info">
                    <span class="subfolder-name" title="${sub.name}">${sub.name}</span>
                    <span class="subfolder-count">${countStr}</span>
                  </div>
                  <div class="subfolder-actions">
                    ${isSubProtected ? `
                      <span class="subfolder-lock-badge" title="${isSubLocked ? 'Pasta protegida por senha (clique para desbloquear)' : 'Pasta protegida por senha'}">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                      </span>
                    ` : ''}
                    ${unresolvedInSub > 0 ? `
                      <span class="col-unresolved-badge" title="${unresolvedInSub} comentário${unresolvedInSub > 1 ? 's' : ''} a resolver">${unresolvedInSub}</span>
                    ` : ''}
                    <button class="subfolder-copy-btn" data-folder-id="${sub.id}" data-folder-name="${sub.name}" data-short-code="${sub.shortCode || sub.id}" title="Copiar link desta pasta: https://${this.data?.settings?.baseDomain || 'giffu.com.br'}/${sub.shortCode || sub.id}">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
                    </button>
                    ${!this.isSelectionMode ? `
                      <div class="subfolder-chevron">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </div>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    let itemsGridHtml = '';
    if (allItems.length === 0) {
      // Se houver subpastas neste nível, NÃO exibe nenhum informativo de vazio!
      // As pastas por si só já representam conteúdo válido no diretório.
      if (subfoldersAtLevel.length === 0 && !isSearching) {
        itemsGridHtml = `
          <div class="gallery-empty-state">
            <div class="gallery-empty-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <h3>Solte os arquivos para enviar</h3>
            <p>Os arquivos irão direto para o Google Drive na pasta: <strong>${this.escapeHtml(currentLocationName)}</strong></p>
            ${!this.isClientMode ? `
              <div class="gallery-empty-actions">
                <button class="btn-primary" id="btnEmptyUpload">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px;"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
                  Fazer Upload
                </button>
                <button class="btn-secondary" id="btnEmptySync">Atualizar do Drive</button>
              </div>
            ` : `
              <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">Este diretório ainda não possui arquivos para visualização.</p>
            `}
          </div>
        `;
      }
    } else if (filteredItems.length === 0) {
      if (!isSearching) {
        itemsGridHtml = `
          <div style="text-align: center; padding: 48px 20px; color: var(--text-secondary);">
            <p style="font-size: 14px; margin-bottom: 12px;">Nenhum arquivo encontrado para este filtro.</p>
            <button class="btn-secondary" id="btnResetFilterFromGrid" style="font-size: 12px; padding: 6px 14px;">Ver todos os arquivos</button>
          </div>
        `;
      }
    } else {
      itemsGridHtml = `
        <div class="video-grid" id="videoGrid">
          ${filteredItems.map(item => this.renderGalleryCard(item, isSearching)).join('')}
        </div>
      `;
    }

    if (this.galleryViewMode === 'columns') {
      return `
        ${searchBarHtml}
        ${this.buildColumnsViewHtml(gData)}
      `;
    }

    return `
      ${searchBarHtml}
      ${searchEmptyHtml}
      ${subfoldersHtml}
      ${itemsGridHtml}
    `;
  }

  buildColumnsViewHtml(gData) {
    const { proj, folders = [] } = gData || {};
    const isAuthor = !this.isClientMode;

    const rawSearch = (this.currentView === 'author_lobby' 
      ? this.lobbySearchQuery 
      : (this.gallerySearchQuery || this.lobbySearchQuery)) || '';
    const searchQuery = rawSearch.trim();
    const isSearching = searchQuery.length > 0;

    const isLobby = (this.currentView === 'author_lobby');
    const hasStatusFilter = Boolean(isLobby && this.lobbyFilter && this.lobbyFilter !== 'all');
    const hasCategoryFilter = Boolean(isLobby && this.lobbyCategoryFilter && this.lobbyCategoryFilter !== 'all');
    const hasClientFilter = Boolean(isLobby && this.lobbyClientFilter && this.lobbyClientFilter !== 'all');
    const isLobbyFiltering = hasStatusFilter || hasCategoryFilter || hasClientFilter;
    const isFiltering = isSearching || isLobbyFiltering;

    // Utilitários de correspondência de busca
    const normalizeText = (txt) => {
      return (txt || '')
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
    };

    const queryNorm = normalizeText(searchQuery);
    const searchTerms = queryNorm.split(/\s+/).filter(Boolean);

    const textMatches = (text) => {
      if (!text || !isSearching) return false;
      const norm = normalizeText(text);
      if (norm.includes(queryNorm)) return true;
      const cleanNorm = norm.replace(/[-_./\\]/g, ' ');
      const cleanQuery = queryNorm.replace(/[-_./\\]/g, ' ');
      if (cleanNorm.includes(cleanQuery)) return true;
      if (searchTerms.length > 1) {
        if (searchTerms.every(term => {
          const cleanTerm = term.replace(/[-_./\\]/g, ' ');
          return norm.includes(term) || cleanNorm.includes(cleanTerm);
        })) return true;
      }
      return false;
    };

    // Cache de avaliação de busca por projeto
    const projectMatchesMap = new Map();
    const getProjectMatch = (p) => {
      if (!p) return null;
      if (projectMatchesMap.has(p.id)) return projectMatchesMap.get(p.id);

      const pDivName = this.getProjectDivisionName(p);
      const isDirectMatch = Boolean(
        textMatches(p.name) ||
        textMatches(p.driveFolderName) ||
        textMatches(p.clientName) ||
        textMatches(p.category) ||
        textMatches(p.division) ||
        textMatches(pDivName) ||
        textMatches(p.slug) ||
        textMatches(p.year)
      );

      const matchingVideoIds = new Set();
      (p.videos || []).forEach(v => {
        const isVideoMatch = Boolean(
          textMatches(v.fileName) ||
          textMatches(v.title) ||
          textMatches(v.name) ||
          textMatches(v.folderPath) ||
          textMatches(v.notes) ||
          textMatches(v.clientName)
        );
        if (isVideoMatch) {
          matchingVideoIds.add(v.id);
        }
      });

      const directlyMatchedFolderIds = new Set();
      (p.folders || []).forEach(f => {
        if (textMatches(f.name) || textMatches(f.path)) {
          directlyMatchedFolderIds.add(f.id);
        }
      });

      let addedDescendant = true;
      while (addedDescendant) {
        addedDescendant = false;
        (p.folders || []).forEach(f => {
          if (f.parentId && directlyMatchedFolderIds.has(f.parentId) && !directlyMatchedFolderIds.has(f.id)) {
            directlyMatchedFolderIds.add(f.id);
            addedDescendant = true;
          }
        });
      }

      (p.videos || []).forEach(v => {
        const fid = v.driveFolderId || v.folderId;
        if (fid && directlyMatchedFolderIds.has(fid)) {
          matchingVideoIds.add(v.id);
        }
      });

      const foldersWithMatches = new Set();
      directlyMatchedFolderIds.forEach(fid => {
        let cur = fid;
        while (cur) {
          foldersWithMatches.add(cur);
          const parentF = (p.folders || []).find(f => f.id === cur);
          cur = parentF ? parentF.parentId : null;
        }
      });

      (p.videos || []).forEach(v => {
        if (matchingVideoIds.has(v.id)) {
          let fid = v.driveFolderId || v.folderId;
          while (fid) {
            foldersWithMatches.add(fid);
            const parentF = (p.folders || []).find(f => f.id === fid);
            fid = parentF ? parentF.parentId : null;
          }
        }
      });

      if (isDirectMatch && matchingVideoIds.size === 0 && foldersWithMatches.size === 0) {
        (p.videos || []).forEach(v => matchingVideoIds.add(v.id));
        (p.folders || []).forEach(f => foldersWithMatches.add(f.id));
      }

      const hasAnyMatch = isDirectMatch || matchingVideoIds.size > 0 || foldersWithMatches.size > 0;

      const matchInfo = {
        isDirectMatch,
        hasAnyMatch,
        matchingVideoIds,
        foldersWithMatches,
        directlyMatchedFolderIds
      };
      projectMatchesMap.set(p.id, matchInfo);
      return matchInfo;
    };

    const projectPassesLobbyFilters = (p) => {
      if (!p) return false;
      if (!isLobby) {
        return !p.archived;
      }
      if (this.lobbyFilter === 'active' && p.archived) return false;
      if (this.lobbyFilter === 'archived' && !p.archived) return false;
      if (this.lobbyFilter === 'pending') {
        if (p.archived) return false;
        if (this.getUnresolvedCommentsCountForProject(p.id) === 0) return false;
      }
      if (hasCategoryFilter) {
        const defaultCatName = (this.getCategories()[0] && this.getCategories()[0].name) || 'Categoria Padrão';
        if ((p.category || defaultCatName) !== this.lobbyCategoryFilter) return false;
      }
      if (hasClientFilter) {
        const pClient = String(p.clientName || '').trim().toLowerCase();
        const targetClient = this.lobbyClientFilter.trim().toLowerCase();
        if (pClient !== targetClient) return false;
      }
      return true;
    };

    const projectMatchesCriteria = (p) => {
      if (!p) return false;
      if (!projectPassesLobbyFilters(p)) return false;
      if (isSearching) {
        const pm = getProjectMatch(p);
        return Boolean(pm && pm.hasAnyMatch);
      }
      return true;
    };

    let effectiveProj = proj;
    if (effectiveProj) {
      if (!projectMatchesCriteria(effectiveProj)) {
        effectiveProj = null;
      }
    }
    const activeProjectMatch = effectiveProj ? getProjectMatch(effectiveProj) : null;

    const rootFolderId = (this.isClientMode && this.scopedFolderId) 
      ? this.scopedFolderId 
      : (effectiveProj ? (effectiveProj.driveFolderId || null) : null);

    // Identifica o arquivo selecionado para preview na coluna da direita
    let previewItem = null;
    if (this.columnsPreviewItemId && effectiveProj) {
      previewItem = (effectiveProj.videos || []).find(v => v.id === this.columnsPreviewItemId) || null;
    }
    if (!previewItem && effectiveProj && (effectiveProj.isFile || effectiveProj.isIsolatedFile)) {
      previewItem = (effectiveProj.videos && effectiveProj.videos[0]) || null;
    }
    if (isSearching && activeProjectMatch && previewItem) {
      if (!activeProjectMatch.matchingVideoIds.has(previewItem.id)) {
        previewItem = null;
      }
    }

    if (isSearching && activeProjectMatch && this.currentFolderId && this.currentFolderId !== rootFolderId) {
      if (!activeProjectMatch.foldersWithMatches.has(this.currentFolderId)) {
        this.currentFolderId = rootFolderId;
      }
    }

    // Determina o nível ativo da seleção no modo de colunas:
    // 'file' | 'folder' | 'project' | 'division' | 'category' | 'root'
    // Apenas o item terminal selecionado fica 'active' (laranja); ancestrais ficam 'in-path' (cinza neutro)
    let activeLevel = 'category';
    if (previewItem) {
      activeLevel = 'file';
    } else if (this.currentFolderId && this.currentFolderId !== rootFolderId) {
      activeLevel = 'folder';
    } else if (effectiveProj) {
      activeLevel = 'project';
    } else if (this.columnsActiveDivisionId) {
      activeLevel = 'division';
    } else {
      activeLevel = isAuthor ? 'category' : 'root';
    }

    // Se estiver em modo Autor, determinamos a hierarquia raiz ativa (Categoria -> Divisão -> Diretório)
    let rootColsHtml = '';
    let colIndexCounter = 0;

    if (isAuthor) {
      const rawProjects = (this.data && Array.isArray(this.data.projects)) ? this.data.projects : [];
      const allProjects = rawProjects.filter(p => projectPassesLobbyFilters(p));
      let categories = this.getCategories();

      // Categoria ativa na coluna
      let activeCatName = this.columnsActiveCategory || (effectiveProj && effectiveProj.category) || (categories[0] ? categories[0].name : 'Categoria Padrão');

      // Se estiver buscando ou com filtros ativos no lobby, filtra as categorias para apenas as que contêm resultados
      if (isFiltering) {
        categories = categories.filter(cat => {
          if (isSearching && textMatches(cat.name)) return true;
          if (isSearching) {
            const catDivisions = this.getDivisionsForCategory(cat.name);
            if (catDivisions.some(d => textMatches(d.name))) return true;
          }
          if (hasCategoryFilter && cat.name !== this.lobbyCategoryFilter) {
            return false;
          }
          return allProjects.some(p => {
            const pCat = p.category || (categories[0] ? categories[0].name : 'Categoria Padrão');
            if (pCat !== cat.name) return false;
            return projectMatchesCriteria(p);
          });
        });

        if (categories.length > 0 && !categories.some(c => c.name === activeCatName)) {
          activeCatName = categories[0].name;
          this.columnsActiveCategory = activeCatName;
        }
      }

      const divisionsForCat = this.getDivisionsForCategory(activeCatName);

      // Pré-computa divisões com resultados
      const matchingDivisionIds = new Set();
      if (isFiltering) {
        if (isSearching) {
          divisionsForCat.forEach(d => {
            if (textMatches(d.name)) matchingDivisionIds.add(d.id);
          });
        }
        allProjects.forEach(p => {
          const pCat = p.category || (categories[0] ? categories[0].name : 'Categoria Padrão');
          if (pCat !== activeCatName) return;
          if (projectMatchesCriteria(p)) {
            let divId = p.divisionId;
            if (!divId && p.division) {
              const found = divisionsForCat.find(d => d.name === p.division);
              if (found) divId = found.id;
            }
            if (divId) matchingDivisionIds.add(divId);
          }
        });
        let addedDiv = true;
        while (addedDiv) {
          addedDiv = false;
          divisionsForCat.forEach(d => {
            if (matchingDivisionIds.has(d.id) && d.parentId && !matchingDivisionIds.has(d.parentId)) {
              matchingDivisionIds.add(d.parentId);
              addedDiv = true;
            }
          });
        }
      }

      // Divisão ativa na coluna (não auto-seleciona divisão se o usuário não clicou nela)
      let activeDivId = this.columnsActiveDivisionId;
      if (isFiltering) {
        if (activeDivId && !matchingDivisionIds.has(activeDivId)) {
          activeDivId = null;
          this.columnsActiveDivisionId = null;
        }
      }
      if (!activeDivId && effectiveProj && effectiveProj.category === activeCatName) {
        if (projectMatchesCriteria(effectiveProj)) {
          activeDivId = effectiveProj.divisionId || null;
        }
      }

      // Re-avalia o nível ativo com a divisão resolvida
      if (previewItem) {
        activeLevel = 'file';
      } else if (this.currentFolderId && this.currentFolderId !== rootFolderId) {
        activeLevel = 'folder';
      } else if (effectiveProj) {
        activeLevel = 'project';
      } else if (activeDivId) {
        activeLevel = 'division';
      } else {
        activeLevel = 'category';
      }

      // 1. Coluna de Categorias
      const colCatIndex = colIndexCounter++;
      const catItemsHtml = categories.map(cat => {
        const isCurrentCat = (cat.name === activeCatName);
        let itemClass = '';
        if (isCurrentCat) {
          itemClass = (activeLevel === 'category') ? 'active' : 'in-path';
        }
        const count = allProjects.filter(p => {
          const pCat = p.category || (categories[0] && categories[0].name);
          if (pCat !== cat.name) return false;
          return projectMatchesCriteria(p);
        }).length;
        const unresolvedInCat = this.getUnresolvedCommentsCountForCategory(cat.name);
        return `
          <div class="macos-col-item macos-col-cat ${itemClass}"
               data-cat-name="${this.escapeHtml(cat.name)}"
               data-cat-id="${this.escapeHtml(cat.id)}"
               data-col-index="${colCatIndex}"
               role="option"
               aria-selected="${itemClass === 'active' ? 'true' : 'false'}"
               tabindex="-1"
               title="Categoria: ${this.escapeHtml(cat.name)}">
            <div class="macos-col-item-left">
              ${cat.svg || `<svg class="macos-col-icon folder-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="${cat.color ? `color: ${cat.color}; fill: ${cat.color};` : ''}"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`}
              <span class="macos-col-name">${this.escapeHtml(cat.name)}</span>
            </div>
            <div class="macos-col-item-right">
              ${unresolvedInCat > 0 ? `<span class="col-unresolved-badge" title="${unresolvedInCat} comentário${unresolvedInCat > 1 ? 's' : ''} a resolver">${unresolvedInCat}</span>` : ''}
              ${count > 0 ? `<span class="macos-col-badge">${count}</span>` : ''}
              <svg class="macos-col-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>
        `;
      }).join('');

      const colCategoriesHtml = `
        <div class="macos-column macos-col-type-cat" data-col-index="${colCatIndex}" data-col-type="categories">
          <div class="macos-column-header">
            <span class="macos-column-title" title="Categorias">Categorias</span>
            <span class="macos-column-count">${categories.length}</span>
          </div>
          <div class="macos-column-list" tabindex="0" role="listbox" aria-label="Categorias">
            ${catItemsHtml || '<div class="macos-col-empty"><span>Nenhum resultado</span></div>'}
          </div>
        </div>
      `;

      // Constrói a trilha ativa de divisões (suportando divisões e subdivisões em cadeia hierárquica)
      const divisionTrailIds = [];
      let activeDivTarget = activeDivId ? divisionsForCat.find(d => d.id === activeDivId) : null;

      if (activeDivTarget) {
        let currDiv = activeDivTarget;
        const visitedDivs = new Set();
        while (currDiv && !visitedDivs.has(currDiv.id)) {
          visitedDivs.add(currDiv.id);
          divisionTrailIds.unshift(currDiv.id);
          currDiv = currDiv.parentId ? divisionsForCat.find(d => d.id === currDiv.parentId) : null;
        }
      }

      // Níveis de divisões a serem exibidos como colunas:
      // O primeiro nível exibe as divisões de topo (parentId === null)
      // Cada nível subsequente exibe as filhas da divisão ativa no nível anterior
      const divisionLevels = [];
      let topLevelDivs = divisionsForCat.filter(d => !d.parentId || !divisionsForCat.some(p => p.id === d.parentId));
      if (isFiltering) {
        topLevelDivs = topLevelDivs.filter(d => matchingDivisionIds.has(d.id));
      }
      topLevelDivs.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { numeric: true, sensitivity: 'base' }));
      divisionLevels.push({ parentId: null, parentName: 'Divisões', list: topLevelDivs });

      for (let i = 0; i < divisionTrailIds.length; i++) {
        const currentTrailId = divisionTrailIds[i];
        const currentTrailDiv = divisionsForCat.find(d => d.id === currentTrailId);
        let childDivs = divisionsForCat.filter(d => d.parentId === currentTrailId);
        if (isFiltering) {
          childDivs = childDivs.filter(d => matchingDivisionIds.has(d.id));
        }
        childDivs.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { numeric: true, sensitivity: 'base' }));
        if (childDivs.length > 0) {
          divisionLevels.push({
            parentId: currentTrailId,
            parentName: currentTrailDiv ? currentTrailDiv.name : 'Subdivisões',
            list: childDivs
          });
        }
      }

      // Renderiza as colunas de divisões/subdivisões
      const divisionColumnsHtml = divisionLevels.map((lvl, lvlIdx) => {
        const colDivIndex = colIndexCounter++;
        const nextActiveInLevel = divisionTrailIds[lvlIdx] || null;

        const divItemsHtml = lvl.list.map(div => {
          const isCurrentDiv = (nextActiveInLevel === div.id);
          let itemClass = '';
          if (isCurrentDiv) {
            const isTerminalDivision = (lvlIdx === divisionLevels.length - 1);
            itemClass = (activeLevel === 'division' && isTerminalDivision) ? 'active' : 'in-path';
          }
          const subCount = divisionsForCat.filter(d => {
            if (d.parentId !== div.id) return false;
            if (isFiltering) return matchingDivisionIds.has(d.id);
            return true;
          }).length;

          const dirCount = allProjects.filter(p => {
            const pCat = p.category || (categories[0] ? categories[0].name : 'Categoria Padrão');
            if (pCat !== activeCatName) return false;
            let matchesDiv = false;
            if (p.divisionId) {
              matchesDiv = (p.divisionId === div.id);
            } else {
              matchesDiv = (this.getProjectDivisionName(p) === div.name);
            }
            if (!matchesDiv) return false;
            return projectMatchesCriteria(p);
          }).length;
          const totalCount = subCount + dirCount;
          const unresolvedInDiv = this.getUnresolvedCommentsCountForDivision(div.id, activeCatName);

          return `
            <div class="macos-col-item macos-col-div ${itemClass}"
                 data-div-id="${this.escapeHtml(div.id)}"
                 data-cat-name="${this.escapeHtml(activeCatName)}"
                 data-col-index="${colDivIndex}"
                 role="option"
                 aria-selected="${itemClass === 'active' ? 'true' : 'false'}"
                 tabindex="-1"
                 title="${subCount > 0 ? 'Divisão' : 'Divisão/Subdivisão'}: ${this.escapeHtml(div.name)}">
              <div class="macos-col-item-left">
                <svg class="macos-col-icon folder-icon" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="${div.color ? `color: ${div.color}; fill: ${div.color};` : ''}">
                  <path d="M19 4h-4V2H9v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V8h14v12z"/>
                </svg>
                <span class="macos-col-name">${this.escapeHtml(div.name)}</span>
              </div>
              <div class="macos-col-item-right">
                ${unresolvedInDiv > 0 ? `<span class="col-unresolved-badge" title="${unresolvedInDiv} comentário${unresolvedInDiv > 1 ? 's' : ''} a resolver">${unresolvedInDiv}</span>` : ''}
                ${totalCount > 0 ? `<span class="macos-col-badge">${totalCount}</span>` : ''}
                <svg class="macos-col-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
          `;
        }).join('');

        return `
          <div class="macos-column macos-col-type-div" data-col-index="${colDivIndex}" data-col-type="divisions" data-parent-div-id="${lvl.parentId || 'root'}">
            <div class="macos-column-header">
              <span class="macos-column-title" title="${this.escapeHtml(lvl.parentName)}">${this.escapeHtml(lvl.parentName)}</span>
              <span class="macos-column-count">${lvl.list.length}</span>
            </div>
            <div class="macos-column-list" tabindex="0" role="listbox" aria-label="${this.escapeHtml(lvl.parentName)} em ${this.escapeHtml(activeCatName)}">
              ${divItemsHtml || '<div class="macos-col-empty"><span>Nenhum resultado</span></div>'}
            </div>
          </div>
        `;
      }).join('');

      // A divisão final ativa na trilha
      const leafDivId = divisionTrailIds.length > 0 ? divisionTrailIds[divisionTrailIds.length - 1] : activeDivId;
      const leafDivObj = divisionsForCat.find(d => d.id === leafDivId) || activeDivTarget || null;
      const leafDivName = leafDivObj ? leafDivObj.name : '';

      let colProjectsHtml = '';
      if (leafDivId) {
        let projectsInDivision = allProjects.filter(p => {
          const pCat = p.category || (categories[0] ? categories[0].name : 'Categoria Padrão');
          if (pCat !== activeCatName) return false;
          if (p.divisionId && leafDivId) {
            return p.divisionId === leafDivId;
          }
          const pDivName = this.getProjectDivisionName(p);
          return pDivName === leafDivName;
        });

        if (isFiltering) {
          projectsInDivision = projectsInDivision.filter(p => projectMatchesCriteria(p));
        }

        projectsInDivision.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { numeric: true, sensitivity: 'base' }));

        const colProjIndex = colIndexCounter++;
        const hasLooseFiles = projectsInDivision.some(p => p.isFile || p.isIsolatedFile);
        const projItemsHtml = projectsInDivision.map(p => {
          const isCurrentProj = Boolean(effectiveProj && p.id === effectiveProj.id);
          let itemClass = '';
          if (isCurrentProj) {
            itemClass = (activeLevel === 'project') ? 'active' : 'in-path';
          }
          const isLoose = Boolean(p.isFile || p.isIsolatedFile);
          const pm = isSearching ? getProjectMatch(p) : null;
          const totalItems = isSearching && pm
            ? (pm.matchingVideoIds.size + pm.foldersWithMatches.size)
            : ((p.videos || []).length + (p.folders || []).length);
          const fileObj = (p.videos && p.videos[0]) || null;
          const fileType = p.fileType || (fileObj && (fileObj.itemType || fileObj.type)) || 'file';
          const ext = ((fileObj && (fileObj.fileName || fileObj.title)) || p.name || '').split('.').pop() || '';
          const unresolvedInProj = this.getUnresolvedCommentsCountForProject(p.id);

          let iconSvg = '';
          if (isLoose) {
            if (fileType === 'audio') {
              iconSvg = `<svg class="macos-col-icon file-icon audio-icon" width="15" height="15" viewBox="0 0 24 24" fill="#a855f7"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`;
            } else if (fileType === 'image') {
              iconSvg = `<svg class="macos-col-icon file-icon photo-icon" width="15" height="15" viewBox="0 0 24 24" fill="#10b981"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>`;
            } else if (fileType === 'pdf') {
              iconSvg = `<svg class="macos-col-icon file-icon pdf-icon" width="15" height="15" viewBox="0 0 24 24" fill="#3b82f6"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`;
            } else if (fileType === 'video') {
              iconSvg = `<svg class="macos-col-icon file-icon video-icon" width="15" height="15" viewBox="0 0 24 24" fill="#ef4444"><path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/></svg>`;
            } else {
              iconSvg = `<svg class="macos-col-icon file-icon generic-icon" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/></svg>`;
            }
            if (p.color || (fileObj && fileObj.color)) {
              const customC = p.color || fileObj.color;
              iconSvg = iconSvg.replace('fill="', `style="color: ${customC}; fill: ${customC};" fill="`);
            }
          } else {
            iconSvg = `<svg class="macos-col-icon folder-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="${p.color ? `color: ${p.color}; fill: ${p.color};` : ''}"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`;
          }

          return `
            <div class="macos-col-item macos-col-proj ${isLoose ? 'macos-col-loose-file' : ''} ${itemClass}"
                 data-project-id="${this.escapeHtml(p.id)}"
                 data-is-file="${isLoose ? 'true' : 'false'}"
                 data-col-index="${colProjIndex}"
                 draggable="true"
                 role="option"
                 aria-selected="${itemClass === 'active' ? 'true' : 'false'}"
                 tabindex="-1"
                 title="${isLoose ? 'Arquivo: ' : 'Diretório: '}${this.escapeHtml(p.name)}">
              <div class="macos-col-item-left">
                ${iconSvg}
                <span class="macos-col-name">${this.escapeHtml(p.name)}</span>
              </div>
              <div class="macos-col-item-right">
                ${unresolvedInProj > 0 ? `<span class="col-unresolved-badge" title="${unresolvedInProj} comentário${unresolvedInProj > 1 ? 's' : ''} a resolver">${unresolvedInProj}</span>` : ''}
                ${isLoose 
                  ? (ext ? `<span class="macos-col-ext-tag">${this.escapeHtml(ext.toUpperCase().slice(0, 4))}</span>` : '')
                  : `${totalItems > 0 ? `<span class="macos-col-badge">${totalItems}</span>` : ''}
                     <svg class="macos-col-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                       <polyline points="9 18 15 12 9 6"></polyline>
                     </svg>`
                }
              </div>
            </div>
          `;
        }).join('');

        const colTitle = hasLooseFiles ? 'Diretórios e Arquivos' : 'Diretórios';
        colProjectsHtml = `
          <div class="macos-column macos-col-type-proj" data-col-index="${colProjIndex}" data-col-type="projects">
            <div class="macos-column-header">
              <span class="macos-column-title" title="${colTitle}">${colTitle}</span>
              <span class="macos-column-count">${projectsInDivision.length}</span>
            </div>
            <div class="macos-column-list" tabindex="0" role="listbox" aria-label="${colTitle} em ${this.escapeHtml(leafDivName)}">
              ${projItemsHtml || '<div class="macos-col-empty"><span>Nenhum resultado</span></div>'}
            </div>
          </div>
        `;
      }

      rootColsHtml = colCategoriesHtml + divisionColumnsHtml + colProjectsHtml;
    }

    // Constrói a trilha ativa de pastas até o local atual aberto
    // Se currentFolderId estiver nulo ou na raiz, a trilha contém apenas a raiz
    const trailFolderIds = [];
    if (effectiveProj && !effectiveProj.isFile && !effectiveProj.isIsolatedFile) {
      if (this.currentFolderId && this.currentFolderId !== rootFolderId) {
        let curr = (folders || []).find(f => f.id === this.currentFolderId);
        const visited = new Set();
        while (curr && !visited.has(curr.id)) {
          visited.add(curr.id);
          trailFolderIds.unshift(curr.id);
          if (rootFolderId && curr.id === rootFolderId) break;
          if (rootFolderId && curr.parentId === rootFolderId) {
            trailFolderIds.unshift(rootFolderId);
            break;
          }
          curr = curr.parentId ? (folders || []).find(f => f.id === curr.parentId) : null;
        }
        if (trailFolderIds[0] !== rootFolderId) {
          trailFolderIds.unshift(rootFolderId);
        }
      } else {
        trailFolderIds.push(rootFolderId);
      }
    }

    // Se houver arquivo selecionado no preview, descobre em qual pasta ele está e garante que a trilha termine nela
    if (previewItem && effectiveProj) {
      const itemFid = previewItem.driveFolderId || previewItem.folderId || rootFolderId;
      // Trunca a trilha para que a coluna da pasta do item seja a última coluna antes da coluna de preview
      trailFolderIds.length = 0;
      let cF = (folders || []).find(f => f.id === itemFid);
      const visitedItem = new Set();
      while (cF && !visitedItem.has(cF.id)) {
        visitedItem.add(cF.id);
        trailFolderIds.unshift(cF.id);
        if (rootFolderId && cF.id === rootFolderId) break;
        cF = cF.parentId ? (folders || []).find(f => f.id === cF.parentId) : null;
      }
      if (trailFolderIds[0] !== rootFolderId) trailFolderIds.unshift(rootFolderId);
    }

    // Gera o HTML de cada coluna de pasta na trilha
    const folderColumnsHtml = (!effectiveProj || effectiveProj.isFile || effectiveProj.isIsolatedFile) ? '' : trailFolderIds.map((colFolderId, fIdx) => {
      const colIndex = colIndexCounter++;
      // Itens desta coluna: subpastas e mídias
      let subfolders = [];
      let items = [];

      if (colFolderId === rootFolderId) {
        subfolders = (folders || []).filter(f => {
          if (rootFolderId) return f.parentId === rootFolderId || (!f.parentId && f.id !== rootFolderId);
          return !f.parentId || f.parentId === (effectiveProj ? effectiveProj.driveFolderId : null);
        });
        items = ((effectiveProj && effectiveProj.videos) || []).filter(v => {
          const fid = v.driveFolderId || v.folderId;
          return !fid || fid === rootFolderId || fid === (effectiveProj ? effectiveProj.driveFolderId : null);
        });
      } else {
        subfolders = (folders || []).filter(f => f.parentId === colFolderId);
        items = ((effectiveProj && effectiveProj.videos) || []).filter(v => (v.driveFolderId || v.folderId) === colFolderId);
      }

      // Aplica filtro de tipo se ativo
      if (this.mediaFilter && this.mediaFilter !== 'all') {
        items = items.filter(v => this.getItemType(v) === this.mediaFilter);
      }

      // Aplica filtro de busca em colunas
      if (isSearching && activeProjectMatch) {
        subfolders = subfolders.filter(sub => activeProjectMatch.foldersWithMatches.has(sub.id));
        items = items.filter(v => activeProjectMatch.matchingVideoIds.has(v.id));
      }

      // Ordenação alfabética
      subfolders.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { numeric: true, sensitivity: 'base' }));
      items.sort((a, b) => (a.title || a.fileName || '').localeCompare(b.title || b.fileName || '', 'pt-BR', { numeric: true, sensitivity: 'base' }));

      // Próxima pasta selecionada na trilha
      const nextActiveFolderId = trailFolderIds[fIdx + 1] || null;

      // Nome da pasta atual da coluna
      let colName = effectiveProj ? effectiveProj.name : 'Pasta';
      if (colFolderId !== rootFolderId) {
        const fObj = (folders || []).find(f => f.id === colFolderId);
        colName = fObj ? fObj.name : 'Pasta';
      }

      return `
        <div class="macos-column macos-col-type-folder" data-col-index="${colIndex}" data-folder-id="${colFolderId || 'root'}" data-col-type="folders">
          <div class="macos-column-header">
            <span class="macos-column-title" title="${this.escapeHtml(colName)}">${this.escapeHtml(colName)}</span>
            <span class="macos-column-count">${subfolders.length + items.length}</span>
          </div>
          <div class="macos-column-list" tabindex="0" role="listbox" aria-label="Arquivos em ${this.escapeHtml(colName)}">
            ${subfolders.map(sub => {
              // Se há um arquivo selecionado para preview diretamente nesta coluna, nenhuma subpasta deve figurar como selecionada
              const isFileActiveInThisCol = Boolean(previewItem && (previewItem.driveFolderId || previewItem.folderId || rootFolderId) === colFolderId);
              const isSelected = !isFileActiveInThisCol && (nextActiveFolderId === sub.id || (activeLevel === 'folder' && sub.id === this.currentFolderId));
              let folderItemClass = '';
              if (isSelected) {
                const isTerminalFolder = (activeLevel === 'folder' && sub.id === this.currentFolderId);
                folderItemClass = isTerminalFolder ? 'active' : 'in-path';
              }
              const directFiles = ((effectiveProj && effectiveProj.videos) || []).filter(v => {
                const fid = v.driveFolderId || v.folderId;
                if (fid !== sub.id) return false;
                if (isSearching && activeProjectMatch) {
                  return activeProjectMatch.matchingVideoIds.has(v.id);
                }
                return true;
              }).length;

              const directSubs = (folders || []).filter(f => {
                if (f.parentId !== sub.id) return false;
                if (isSearching && activeProjectMatch) {
                  return activeProjectMatch.foldersWithMatches.has(f.id);
                }
                return true;
              }).length;

              const totalInside = directFiles + directSubs;
              const isFolderBatchSelected = this.isSelectionMode && this.selectedFolderIds && this.selectedFolderIds.has(sub.id);
              const unresolvedInSub = this.getUnresolvedCommentsCountForFolder(effectiveProj, sub.id);
              const isSubProtected = this.isFolderPasswordProtected(sub, effectiveProj);
              const isSubLocked = this.isFolderLockedForClient(sub, effectiveProj);

              return `
                <div class="macos-col-item macos-col-folder ${folderItemClass} ${isFolderBatchSelected ? 'selected-for-batch' : ''}" 
                     data-folder-id="${sub.id}" 
                     data-col-index="${colIndex}"
                     role="option"
                     aria-selected="${folderItemClass === 'active' ? 'true' : 'false'}"
                     tabindex="-1"
                     title="${this.isSelectionMode ? (isFolderBatchSelected ? 'Desmarcar pasta: ' + sub.name : 'Selecionar pasta: ' + sub.name) : 'Abrir pasta: ' + this.escapeHtml(sub.name)}">
                  <div class="macos-col-item-left">
                    ${this.isSelectionMode ? `
                      <div class="macos-col-checkbox ${isFolderBatchSelected ? 'checked' : ''}" data-folder-id="${sub.id}" title="${isFolderBatchSelected ? 'Desmarcar' : 'Selecionar'}">
                        ${isFolderBatchSelected ? `
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                        ` : ''}
                      </div>
                    ` : ''}
                    <svg class="macos-col-icon folder-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="${sub.color ? `color: ${sub.color}; fill: ${sub.color};` : ''}">
                      <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                    </svg>
                    <span class="macos-col-name">${this.escapeHtml(sub.name)}</span>
                  </div>
                  <div class="macos-col-item-right">
                    ${isSubProtected ? `<span class="macos-col-lock-icon" title="${isSubLocked ? 'Pasta protegida por senha (clique para desbloquear)' : 'Pasta protegida por senha'}"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg></span>` : ''}
                    ${unresolvedInSub > 0 ? `<span class="col-unresolved-badge" title="${unresolvedInSub} comentário${unresolvedInSub > 1 ? 's' : ''} a resolver">${unresolvedInSub}</span>` : ''}
                    ${(!isSubLocked && totalInside > 0) ? `<span class="macos-col-badge">${totalInside}</span>` : ''}
                    <svg class="macos-col-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                </div>
              `;
            }).join('')}

            ${items.map(item => {
              const isSelected = previewItem && previewItem.id === item.id;
              const isItemBatchSelected = this.isSelectionMode && this.selectedMediaIds && this.selectedMediaIds.has(item.id);
              const itemType = this.getItemType(item);
              const isAudio = itemType === 'audio';
              const isImage = itemType === 'image';
              const isPdf = itemType === 'pdf';
              const ext = (this.getFileExtension(item) || '').replace(/^\./, '').toUpperCase() || itemType.toUpperCase();
              const unresolved = this.getUnresolvedCommentsCount(item.id);
              const isItemProtected = this.isVideoPasswordProtected(item, effectiveProj);
              const isItemLocked = this.isVideoLockedForClient(item, effectiveProj);

              return `
                <div class="macos-col-item macos-col-file ${isSelected ? 'active' : ''} ${isItemBatchSelected ? 'selected-for-batch' : ''}" 
                     data-file-id="${item.id}" 
                     data-col-index="${colIndex}"
                     role="option"
                     aria-selected="${isSelected ? 'true' : 'false'}"
                     tabindex="-1"
                     title="${this.isSelectionMode ? (isItemBatchSelected ? 'Desmarcar: ' + this.getDisplayTitle(item) : 'Selecionar: ' + this.getDisplayTitle(item)) : this.escapeHtml(this.getDisplayTitle(item))}">
                  <div class="macos-col-item-left">
                    ${this.isSelectionMode ? `
                      <div class="macos-col-checkbox ${isItemBatchSelected ? 'checked' : ''}" data-file-id="${item.id}" title="${isItemBatchSelected ? 'Desmarcar' : 'Selecionar'}">
                        ${isItemBatchSelected ? `
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                        ` : ''}
                      </div>
                    ` : ''}
                    ${isImage || isPdf ? `
                      <svg class="macos-col-icon file-icon photo-icon" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="${item.color ? `color: ${item.color}; fill: ${item.color};` : ''}">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                      </svg>
                    ` : (isAudio ? `
                      <svg class="macos-col-icon file-icon audio-icon" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="${item.color ? `color: ${item.color}; fill: ${item.color};` : ''}">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                      </svg>
                    ` : (itemType === 'video' ? `
                      <svg class="macos-col-icon file-icon video-icon" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="${item.color ? `color: ${item.color}; fill: ${item.color};` : ''}">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    ` : `
                      <svg class="macos-col-icon file-icon generic-file-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="${item.color ? `color: ${item.color}; stroke: ${item.color};` : ''}">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                    `))}
                    <span class="macos-col-name">${this.escapeHtml(this.getDisplayTitle(item))}</span>
                  </div>
                  <div class="macos-col-item-right">
                    ${isItemProtected ? `<span class="macos-col-lock-icon" title="${isItemLocked ? 'Arquivo protegido por senha (clique para desbloquear)' : 'Arquivo protegido por senha'}"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg></span>` : ''}
                    ${unresolved > 0 ? `<span class="col-unresolved-badge" title="${unresolved} comentário${unresolved > 1 ? 's' : ''} a resolver">${unresolved}</span>` : ''}
                    <span class="macos-col-ext-tag">${ext}</span>
                  </div>
                </div>
              `;
            }).join('')}

            ${(subfolders.length === 0 && items.length === 0) ? `
              <div class="macos-col-empty">
                <span>${isSearching ? 'Nenhum resultado' : 'Pasta vazia'}</span>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Painel de Detalhes / Pré-visualização macOS (coluna final)
    let previewPanelHtml = '';
    if (previewItem) {
      const itemType = this.getItemType(previewItem);
      const isAudio = itemType === 'audio';
      const isImage = itemType === 'image';
      const isPdf = itemType === 'pdf';
      const isVideo = itemType === 'video';
      const itemFormat = (this.getFileExtension(previewItem) || '').replace(/^\./, '').toUpperCase() || itemType.toUpperCase();
      const unresolved = this.getUnresolvedCommentsCount(previewItem.id);
      const sizeStr = this.formatFileSize(previewItem.size);
      const showItemCopy = (!this.isClientMode) || (effectiveProj && this.isShareAllowedForVideo(previewItem, effectiveProj));
      const isPreviewLocked = this.isVideoLockedForClient(previewItem, effectiveProj);

      previewPanelHtml = `
        <div class="macos-preview-column" id="macosPreviewColumn">
          <div class="macos-preview-hero">
            ${isPreviewLocked ? `
              <div class="macos-preview-generic-box macos-preview-locked-box">
                <svg width="42" height="42" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
                <span style="font-size: 12px; color: var(--text-muted); margin-top: 8px;">Protegido por senha</span>
              </div>
            ` : (isImage || isPdf ? `
              <img class="macos-preview-thumb" src="${previewItem.thumbnailUrl || (previewItem.driveFileId ? `/api/stream/preview?drive=${previewItem.driveFileId}&size=600` : previewItem.url)}" alt="${this.escapeHtml(this.getDisplayTitle(previewItem))}" decoding="async" onerror="window.handleMediaThumbError && window.handleMediaThumbError(this, '${previewItem.driveFileId || ''}', '${previewItem.url || ''}')" />
            ` : (isAudio ? `
              <div class="macos-preview-audio-disc">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 18V5l12-2v13"></path>
                  <circle cx="6" cy="18" r="3"></circle>
                  <circle cx="18" cy="16" r="3"></circle>
                </svg>
              </div>
            ` : (isVideo ? `
              ${(previewItem.customThumbnailUrl || previewItem.thumbnailUrl) ? `
                <img class="macos-preview-thumb" src="${previewItem.customThumbnailUrl || previewItem.thumbnailUrl}" alt="${this.escapeHtml(this.getDisplayTitle(previewItem))}" decoding="async" onerror="window.handleMediaThumbError && window.handleMediaThumbError(this, '${previewItem.driveFileId || ''}', '')" />
              ` : `
                <video class="macos-preview-video" src="${previewItem.previewUrl || previewItem.url || ''}${this.getVideoPreviewTimecode(previewItem)}" preload="metadata" muted playsinline></video>
              `}
            ` : `
              <div class="macos-preview-generic-box">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
            `)))}
          </div>

          <div class="macos-preview-details">
            <h3 class="macos-preview-title" title="${this.escapeHtml(this.getDisplayTitle(previewItem))}">${this.escapeHtml(this.getDisplayTitle(previewItem))}</h3>
            <span class="macos-preview-kind">${itemFormat} • ${previewItem.resolution || itemFormat}</span>

            <div class="macos-preview-meta-table">
              ${sizeStr ? `
                <div class="macos-meta-row">
                  <span class="macos-meta-label">Tamanho</span>
                  <span class="macos-meta-value">${sizeStr}</span>
                </div>
              ` : ''}
              ${previewItem.duration ? `
                <div class="macos-meta-row">
                  <span class="macos-meta-label">Duração</span>
                  <span class="macos-meta-value">${previewItem.duration}</span>
                </div>
              ` : ''}
              ${previewItem.dimensions ? `
                <div class="macos-meta-row">
                  <span class="macos-meta-label">Dimensões</span>
                  <span class="macos-meta-value">${previewItem.dimensions}</span>
                </div>
              ` : ''}
              ${unresolved > 0 ? `
                <div class="macos-meta-row">
                  <span class="macos-meta-label">Comentários</span>
                  <span class="macos-meta-value has-alert">${unresolved} a resolver</span>
                </div>
              ` : ''}
            </div>

            <div class="macos-preview-actions">
              <button class="btn-primary btn-block" id="btnMacosOpenPlayer" data-file-id="${previewItem.id}">
                ${isPreviewLocked ? 'Desbloquear Arquivo' : (isVideo ? 'Assistir Vídeo' : (isAudio ? 'Ouvir Faixa' : 'Abrir Arquivo'))}
              </button>
              ${showItemCopy ? `
                <button class="btn-secondary btn-block" id="btnMacosCopyLink" data-file-id="${previewItem.id}" data-file-code="${previewItem.shortCode || previewItem.id}">
                  Copiar Link
                </button>
              ` : ''}
              ${!isPreviewLocked ? `
                <a class="btn-secondary btn-block" href="${previewItem.url ? `${previewItem.url}${previewItem.url.includes('?') ? '&' : '?'}download=1` : '#'}" download="${this.escapeHtml(previewItem.fileName || previewItem.title)}">
                  Baixar Original
                </a>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="macos-columns-viewport" id="macosColumnsViewport">
        <div class="macos-columns-scroll-track" id="macosColumnsTrack">
          ${rootColsHtml}
          ${(effectiveProj && (effectiveProj.isFile || effectiveProj.isIsolatedFile)) ? '' : folderColumnsHtml}
          ${previewPanelHtml}
        </div>
      </div>
    `;
  }

  bindGalleryDynamicEvents(container, gData) {
    const { proj, folders, subfoldersAtLevel, filteredItems } = gData;

    // Reset Search Buttons
    const clearGallerySearch = () => {
      this.gallerySearchQuery = '';
      const input = document.getElementById('inputGallerySearch');
      if (input) input.value = '';
      this.updateGalleryDynamicArea(container);
      input?.focus();
    };

    document.getElementById('btnResetGallerySearch')?.addEventListener('click', clearGallerySearch);
    document.getElementById('btnEmptyResetSearch')?.addEventListener('click', clearGallerySearch);

    // Subfolders navigation & selection
    container.querySelectorAll('.subfolder-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.subfolder-copy-btn') || e.target.closest('.subfolder-comments-btn')) return;
        const targetFid = card.getAttribute('data-folder-id');

        if (this.isSelectionMode) {
          if (e.shiftKey) {
            window.getSelection()?.removeAllRanges();
            this.handleGalleryShiftSelect(container, this._lastSelectedAnchor?.id, targetFid);
          } else {
            if (this.selectedFolderIds.has(targetFid)) {
              this.selectedFolderIds.delete(targetFid);
            } else {
              this.selectedFolderIds.add(targetFid);
            }
            this._lastSelectedAnchor = { id: targetFid, type: 'folder', context: 'gallery' };
            this.renderGalleryView(container);
          }
          return;
        }

        this.gallerySearchQuery = '';
        this.currentFolderId = targetFid;
        this.selectedMediaIds.clear();
        this.selectedFolderIds.clear();
        this._lastSelectedAnchor = null;
        this.mediaFilter = 'all';
        const subFolderObj = folders.find(f => f.id === targetFid);
        const targetUrl = this.isClientMode 
          ? `/${(subFolderObj && subFolderObj.shortCode) || proj.shortCode || proj.slug}`
          : `/author?project=${proj.id}&folder=${encodeURIComponent(targetFid)}`;
        window.history.pushState({}, '', targetUrl);
        if (subFolderObj && this.isFolderLockedForClient(subFolderObj, proj)) {
          this.render();
          return;
        }
        if (this.galleryViewMode === 'columns') {
          this.updateGalleryDynamicArea(container);
        } else {
          this.render();
        }
      });
    });

    container.querySelectorAll('.subfolder-copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const fId = btn.getAttribute('data-folder-id');
        const folderObj = folders.find(f => f.id === fId);
        const subCode = (folderObj && folderObj.shortCode) || btn.getAttribute('data-short-code') || fId;
        const subClientUrl = `${window.location.origin}/${subCode}`;
        navigator.clipboard.writeText(subClientUrl);
        window.showToast(`Link copiado: .../${subCode}`);
      });
    });

    // Subfolder checkbox toggle in selection mode
    container.querySelectorAll('.subfolder-checkbox-container').forEach(cb => {
      cb.addEventListener('click', (e) => {
        e.stopPropagation();
        const fId = cb.getAttribute('data-folder-id');
        if (e.shiftKey) {
          window.getSelection()?.removeAllRanges();
          this.handleGalleryShiftSelect(container, this._lastSelectedAnchor?.id, fId);
        } else {
          if (this.selectedFolderIds.has(fId)) {
            this.selectedFolderIds.delete(fId);
          } else {
            this.selectedFolderIds.add(fId);
          }
          this._lastSelectedAnchor = { id: fId, type: 'folder', context: 'gallery' };
          this.renderGalleryView(container);
        }
      });
    });

    // Media checkbox toggle in selection mode
    container.querySelectorAll('.media-checkbox-container').forEach(cb => {
      cb.addEventListener('click', (e) => {
        e.stopPropagation();
        const vId = cb.getAttribute('data-id');
        if (e.shiftKey) {
          window.getSelection()?.removeAllRanges();
          this.handleGalleryShiftSelect(container, this._lastSelectedAnchor?.id, vId);
        } else {
          if (this.selectedMediaIds.has(vId)) {
            this.selectedMediaIds.delete(vId);
          } else {
            this.selectedMediaIds.add(vId);
          }
          this._lastSelectedAnchor = { id: vId, type: 'file', context: 'gallery' };
          this.renderGalleryView(container);
        }
      });
    });

    // Card click -> open detail or toggle selection
    container.querySelectorAll('.video-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const vidId = card.getAttribute('data-video-id');
        if (this.isSelectionMode) {
          if (e.shiftKey) {
            window.getSelection()?.removeAllRanges();
            this.handleGalleryShiftSelect(container, this._lastSelectedAnchor?.id, vidId);
          } else {
            if (this.selectedMediaIds.has(vidId)) {
              this.selectedMediaIds.delete(vidId);
            } else {
              this.selectedMediaIds.add(vidId);
            }
            this._lastSelectedAnchor = { id: vidId, type: 'file', context: 'gallery' };
            this.renderGalleryView(container);
          }
          return;
        }

        const vid = proj.videos.find(v => v.id === vidId);
        if (vid) {
          this.selectedVideo = vid;
          this.currentView = 'client_player';
          this.isIsolatedFile = false;
          const targetUrl = this.isClientMode 
            ? `/${vid.shortCode || vid.id}`
            : `/author?project=${proj.id}&video=${vid.id}`;
          window.history.pushState({}, '', targetUrl);
          this.render();
        }
      });
    });

    // Empty state buttons
    document.getElementById('btnEmptyUpload')?.addEventListener('click', () => {
      document.getElementById('inputUploadMedia')?.click();
    });

    document.getElementById('btnEmptySync')?.addEventListener('click', () => {
      document.getElementById('btnSyncDrive')?.click();
    });

    document.getElementById('btnResetFilterFromGrid')?.addEventListener('click', () => {
      this.mediaFilter = 'all';
      this.isGalleryFilterOpen = false;
      this.render();
    });

    // Video preview metadata
    container.querySelectorAll('.video-preview-element').forEach(videoEl => {
      if (videoEl.videoWidth && videoEl.videoHeight) {
        window.handleVideoPreviewMetadata && window.handleVideoPreviewMetadata(videoEl);
      }
    });

    // macOS Columns Navigation Events & Keyboard Listeners
    if (this.galleryViewMode === 'columns') {
      this.bindColumnsNavigationEvents(container, gData);
    }

    // Rolar e destacar suavemente o arquivo selecionado a partir da busca do Lobby
    if (this.highlightedMediaId) {
      const targetId = this.highlightedMediaId;
      setTimeout(() => {
        const el = container.querySelector(`.video-card[data-video-id="${targetId}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
      setTimeout(() => {
        if (this.highlightedMediaId === targetId) {
          this.highlightedMediaId = null;
        }
        container.querySelector(`.video-card[data-video-id="${targetId}"]`)?.classList.remove('highlighted-search-item');
      }, 4200);
    }
  }

  bindColumnsNavigationEvents(container, gData) {
    const { proj, folders } = gData;
    const viewport = (container && typeof container.querySelector === 'function') 
      ? container.querySelector('#macosColumnsViewport') 
      : document.querySelector('#macosColumnsViewport');
    if (!viewport) return;

    const rootFolderId = (this.isClientMode && this.scopedFolderId) 
      ? this.scopedFolderId 
      : (proj ? (proj.driveFolderId || null) : null);

    // Garante que a sessão ativa de navegação em colunas esteja habilitada
    this._isColumnsNavActive = true;

    // Remove listener de teclado anterior se houver
    if (this._columnsKeydownHandler) {
      window.removeEventListener('keydown', this._columnsKeydownHandler);
      this._columnsKeydownHandler = null;
    }

    // Identifica com precisão a coluna que deve ser a base visível / foco atual
    const findTargetColumn = () => {
      const allCols = Array.from(viewport.querySelectorAll('.macos-column'));
      if (allCols.length === 0) return null;

      // Se houver coluna de preview aberta, ela é o alvo mais à direita
      const previewCol = viewport.querySelector('#macosPreviewColumn');
      if (previewCol) return previewCol;

      // A base é a pasta atual (a que já estava sendo visualizada como galeria ou aberta)
      if (this.currentFolderId) {
        const activeFolderCol = viewport.querySelector(`.macos-column[data-folder-id="${this.currentFolderId}"]`);
        if (activeFolderCol) return activeFolderCol;
      }

      // Se a pasta atual for a raiz do diretório
      const rootCol = viewport.querySelector(`.macos-column[data-folder-id="${rootFolderId || 'root'}"]`);
      if (rootCol) return rootCol;

      // Fallback: coluna da subpasta ativa mais à direita
      const activeItems = Array.from(viewport.querySelectorAll('.macos-col-item.active'));
      if (activeItems.length > 0) {
        let maxColIdx = -1;
        let rightmostCol = null;
        activeItems.forEach(item => {
          const c = item.closest('.macos-column');
          if (c) {
            const idx = parseInt(c.getAttribute('data-col-index') || '0', 10);
            if (idx >= maxColIdx) {
              maxColIdx = idx;
              rightmostCol = c;
            }
          }
        });
        const rightmostIndexInDom = allCols.indexOf(rightmostCol);
        if (rightmostIndexInDom >= 0 && rightmostIndexInDom < allCols.length - 1) {
          return allCols[rightmostIndexInDom + 1];
        }
        if (rightmostCol) return rightmostCol;
      }

      return allCols[allCols.length - 1];
    };

    // Scroll horizontal: posiciona a coluna alvo no campo de visão imediatamente, sem animação arrastada
    const scrollToAdvancedColumn = (smooth = false) => {
      if (!viewport) return;
      const targetCol = findTargetColumn();
      if (!targetCol) return;

      const targetRight = targetCol.offsetLeft + targetCol.offsetWidth;
      const targetLeft = targetCol.offsetLeft;
      const currentScroll = viewport.scrollLeft;
      const vpWidth = viewport.clientWidth;

      if (vpWidth > 0 && targetCol.offsetWidth > 0) {
        if (targetRight > currentScroll + vpWidth) {
          viewport.scrollTo({
            left: Math.max(0, targetRight - vpWidth + 24),
            behavior: smooth ? 'smooth' : 'auto'
          });
        } else if (targetLeft < currentScroll) {
          viewport.scrollTo({
            left: Math.max(0, targetLeft - 24),
            behavior: smooth ? 'smooth' : 'auto'
          });
        }
      } else {
        try {
          targetCol.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', inline: 'end', block: 'nearest' });
        } catch (e) {}
      }
    };

    // Define e restaura o foco na coluna da pasta ativa (apenas se o usuário NÃO estiver digitando em campos de busca/texto)
    const activeEl = document.activeElement;
    const isTyping = Boolean(
      activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.isContentEditable
      )
    );

    const targetCol = findTargetColumn();
    let colToFocus = null;

    if (this._columnsFocusedColIndex !== undefined && this._columnsFocusedColIndex !== null) {
      colToFocus = viewport.querySelector(`.macos-column[data-col-index="${this._columnsFocusedColIndex}"]`);
    }
    if (!colToFocus && targetCol) {
      colToFocus = targetCol;
      this._columnsFocusedColIndex = parseInt(targetCol.getAttribute('data-col-index') || '0', 10);
      this._columnsFocusedColType = targetCol.getAttribute('data-col-type') || 'folders';
    }

    if (colToFocus && !isTyping) {
      const itemToFocus = colToFocus.querySelector('.macos-col-item.active') || colToFocus.querySelector('.macos-col-item');
      if (itemToFocus) {
        try { itemToFocus.focus({ preventScroll: true }); } catch (err) {}
      }
    }

    // Restaura o scroll anterior se disponível (ex: ao alternar modo de seleção) ou alinha na coluna ativa
    if (this._columnsLastScrollLeft !== undefined && this._columnsLastScrollLeft !== null) {
      viewport.scrollLeft = this._columnsLastScrollLeft;
      const savedScroll = this._columnsLastScrollLeft;
      this._columnsLastScrollLeft = null;
      requestAnimationFrame(() => { viewport.scrollLeft = savedScroll; });
      setTimeout(() => { viewport.scrollLeft = savedScroll; }, 40);
    } else if (!isTyping) {
      scrollToAdvancedColumn(false);
      requestAnimationFrame(() => scrollToAdvancedColumn(false));
      setTimeout(() => scrollToAdvancedColumn(false), 40);
      setTimeout(() => scrollToAdvancedColumn(false), 120);
    }

    // 1. Clique em Categoria na coluna raiz
    viewport.querySelectorAll('.macos-col-cat').forEach(catEl => {
      catEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this._columnsFocusedColType = 'categories';
        const col = catEl.closest('.macos-column');
        if (col) this._columnsFocusedColIndex = parseInt(col.getAttribute('data-col-index') || '0', 10);
        const catName = catEl.getAttribute('data-cat-name');
        if (!catName) return;
        this.columnsActiveCategory = catName;
        this.columnsActiveDivisionId = null;
        this.selectedProject = null;
        this.currentFolderId = null;
        this.scopedFolderId = null;
        this.isIsolatedFile = false;
        this.gallerySearchQuery = '';
        this.columnsPreviewItemId = null;

        if (!this.isClientMode && this.currentView !== 'author_lobby') {
          window.history.pushState({}, '', '/author');
        }

        this.syncSidebarActiveProject(null);
        this.updateGalleryDynamicArea(container);
      });
    });

    // 2. Clique em Divisão / Subdivisão na coluna
    viewport.querySelectorAll('.macos-col-div').forEach(divEl => {
      divEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this._columnsFocusedColType = 'divisions';
        const col = divEl.closest('.macos-column');
        if (col) this._columnsFocusedColIndex = parseInt(col.getAttribute('data-col-index') || '0', 10);
        const divId = divEl.getAttribute('data-div-id');
        const catName = divEl.getAttribute('data-cat-name');
        if (catName) this.columnsActiveCategory = catName;

        this.columnsActiveDivisionId = divId;
        this.selectedProject = null;
        this.currentFolderId = null;
        this.scopedFolderId = null;
        this.isIsolatedFile = false;
        this.gallerySearchQuery = '';
        this.columnsPreviewItemId = null;

        if (!this.isClientMode && this.currentView !== 'author_lobby') {
          window.history.pushState({}, '', '/author');
        }

        this.syncSidebarActiveProject(null);
        this.updateGalleryDynamicArea(container);
      });
    });

    // 3. Clique em Diretório ou Arquivo Avulso na coluna raiz
    viewport.querySelectorAll('.macos-col-proj').forEach(projEl => {
      const openProjOrLooseFile = (targetProj) => {
        if (!targetProj) return;
        if ((targetProj.isFile || targetProj.isIsolatedFile) && targetProj.videos && targetProj.videos[0]) {
          this.selectedProject = targetProj;
          this.selectedVideo = targetProj.videos[0];
          this.currentView = 'client_player';
          this.isIsolatedFile = true;
          const targetUrl = `/author?project=${encodeURIComponent(targetProj.id)}&video=${encodeURIComponent(targetProj.videos[0].id)}`;
          window.history.pushState({}, '', targetUrl);
          this.syncSidebarActiveProject(targetProj);
          this.render();
        } else {
          this.openProject(targetProj);
        }
      };

      projEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const pId = projEl.getAttribute('data-project-id');
        const targetProj = (this.data?.projects || []).find(p => p.id === pId);
        const now = Date.now();
        if (this._lastColProjTapId === pId && now - (this._lastColProjTapTime || 0) < 380) {
          this._lastColProjTapId = null;
          openProjOrLooseFile(targetProj);
          return;
        }
        this._lastColProjTapId = pId;
        this._lastColProjTapTime = now;

        this._columnsFocusedColType = 'projects';
        const col = projEl.closest('.macos-column');
        if (col) this._columnsFocusedColIndex = parseInt(col.getAttribute('data-col-index') || '0', 10);
        if (targetProj) {
          const isLoose = Boolean(targetProj.isFile || targetProj.isIsolatedFile);
          this.selectedProject = targetProj;
          this.currentFolderId = null;
          this.scopedFolderId = null;
          this.isIsolatedFile = isLoose;
          this.gallerySearchQuery = '';
          this.isSelectionMode = false;
          this.selectedMediaIds.clear();
          this.selectedFolderIds.clear();
          this.mediaFilter = 'all';
          this.columnsPreviewItemId = isLoose && targetProj.videos && targetProj.videos[0] ? targetProj.videos[0].id : null;
          const targetUrl = `/author?project=${encodeURIComponent(targetProj.id)}`;
          window.history.pushState({}, '', targetUrl);
          this.syncSidebarActiveProject(targetProj);
          this.updateGalleryDynamicArea(container);
        }
      });

      // Duplo clique abre o diretório (ou o player se for arquivo avulso)
      projEl.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const pId = projEl.getAttribute('data-project-id');
        const targetProj = (this.data?.projects || []).find(p => p.id === pId);
        openProjOrLooseFile(targetProj);
      });

      // Suporte a arrastar da coluna para remanejar divisão ou categoria
      projEl.setAttribute('draggable', 'true');
      projEl.addEventListener('dragstart', (e) => {
        const pId = projEl.getAttribute('data-project-id');
        e.dataTransfer.setData('text/plain', `proj:${pId}`);
        e.dataTransfer.setData('application/json', JSON.stringify({ type: 'project', id: pId }));
      });
    });

    // Remanejamento via Drop nas colunas de Divisão
    viewport.querySelectorAll('.macos-col-div').forEach(divEl => {
      divEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        divEl.classList.add('drag-over');
      });
      divEl.addEventListener('dragleave', () => {
        divEl.classList.remove('drag-over');
      });
      divEl.addEventListener('drop', async (e) => {
        e.preventDefault();
        divEl.classList.remove('drag-over');
        const targetDivId = divEl.getAttribute('data-division-id');
        const raw = e.dataTransfer.getData('text/plain') || '';
        let projId = null;
        if (raw.startsWith('proj:')) {
          projId = raw.replace('proj:', '');
        } else {
          try {
            const data = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
            if (data.type === 'project') projId = data.id;
          } catch (_) {}
        }
        if (projId && targetDivId) {
          await this.moveProjectToDivision(projId, targetDivId);
        }
      });
    });

    // Remanejamento via Drop nas colunas de Categoria
    viewport.querySelectorAll('.macos-col-cat').forEach(catEl => {
      catEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        catEl.classList.add('drag-over');
      });
      catEl.addEventListener('dragleave', () => {
        catEl.classList.remove('drag-over');
      });
      catEl.addEventListener('drop', async (e) => {
        e.preventDefault();
        catEl.classList.remove('drag-over');
        const targetCat = catEl.getAttribute('data-cat-name');
        const raw = e.dataTransfer.getData('text/plain') || '';
        let projId = null;
        if (raw.startsWith('proj:')) {
          projId = raw.replace('proj:', '');
        } else {
          try {
            const data = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
            if (data.type === 'project') projId = data.id;
          } catch (_) {}
        }
        if (projId && targetCat) {
          await this.moveProjectToCategory(projId, targetCat);
        }
      });
    });

    // Helper para atualizar barra de controle de seleção
    const updateSelectionBar = () => {
      const g = this.getGalleryData();
      if (!g) return;
      const countEl = container.querySelector('.selection-count-text');
      if (countEl) {
        countEl.innerHTML = `<strong>${g.selectedCount}</strong> de ${g.totalSelectable} selecionado${g.totalSelectable !== 1 ? 's' : ''}`;
      }
      const selectAllBtn = container.querySelector('#btnSelectAllMedia');
      if (selectAllBtn) {
        selectAllBtn.textContent = g.isAllSelected ? 'Desmarcar Todos' : `Selecionar Todos (${g.totalSelectable})`;
      }
      const batchBtn = container.querySelector('#btnBatchDownloadFromBar');
      if (batchBtn) {
        batchBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
          Baixar ${g.selectedCount > 0 ? `(${g.selectedCount})` : 'Tudo'}
        `;
      }
    };

    // Cliques diretos nas caixas de seleção das colunas
    viewport.querySelectorAll('.macos-col-checkbox').forEach(cb => {
      cb.addEventListener('click', (e) => {
        e.stopPropagation();
        const fId = cb.getAttribute('data-folder-id');
        const fileId = cb.getAttribute('data-file-id');
        const targetId = fId || fileId;
        const parentItem = cb.closest('.macos-col-item');
        const col = cb.closest('.macos-column');
        const colIndex = col ? col.getAttribute('data-col-index') : '0';
        const context = `column_${colIndex}`;

        if (e.shiftKey) {
          window.getSelection()?.removeAllRanges();
          this.handleColumnShiftSelect(col, this._lastSelectedAnchor?.id, targetId, updateSelectionBar);
        } else {
          if (fId) {
            if (this.selectedFolderIds.has(fId)) {
              this.selectedFolderIds.delete(fId);
              cb.classList.remove('checked');
              cb.innerHTML = '';
              parentItem?.classList.remove('selected-for-batch');
            } else {
              this.selectedFolderIds.add(fId);
              cb.classList.add('checked');
              cb.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>`;
              parentItem?.classList.add('selected-for-batch');
            }
            this._lastSelectedAnchor = { id: fId, type: 'folder', context };
          } else if (fileId) {
            if (this.selectedMediaIds.has(fileId)) {
              this.selectedMediaIds.delete(fileId);
              cb.classList.remove('checked');
              cb.innerHTML = '';
              parentItem?.classList.remove('selected-for-batch');
            } else {
              this.selectedMediaIds.add(fileId);
              cb.classList.add('checked');
              cb.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>`;
              parentItem?.classList.add('selected-for-batch');
            }
            this._lastSelectedAnchor = { id: fileId, type: 'file', context };
          }
          updateSelectionBar();
        }
      });
    });

    // 4. Clique em subpasta da coluna
    viewport.querySelectorAll('.macos-col-folder').forEach(fEl => {
      fEl.addEventListener('click', (e) => {
        if (e.target.closest('.macos-col-checkbox')) return;
        e.stopPropagation();
        const col = fEl.closest('.macos-column');
        const colIndex = col ? col.getAttribute('data-col-index') : '0';
        const context = `column_${colIndex}`;
        const fId = fEl.getAttribute('data-folder-id');

        if (this.isSelectionMode) {
          if (e.shiftKey) {
            window.getSelection()?.removeAllRanges();
            this.handleColumnShiftSelect(col, this._lastSelectedAnchor?.id, fId, updateSelectionBar);
            return;
          }
        }

        this._columnsFocusedColType = 'folders';
        if (col) this._columnsFocusedColIndex = parseInt(col.getAttribute('data-col-index') || '0', 10);
        this.columnsPreviewItemId = null;
        this.currentFolderId = fId;

        // Atualiza URL
        const subFolderObj = (folders || []).find(f => f.id === fId);
        const activeProj = proj || this.selectedProject;
        const targetUrl = this.isClientMode 
          ? `/${(subFolderObj && subFolderObj.shortCode) || (activeProj && (activeProj.shortCode || activeProj.slug)) || ''}`
          : (activeProj ? `/author?project=${activeProj.id}&folder=${encodeURIComponent(fId)}` : `/author?folder=${encodeURIComponent(fId)}`);
        window.history.pushState({}, '', targetUrl);

        if (subFolderObj && this.isFolderLockedForClient(subFolderObj, activeProj)) {
          this.render();
          return;
        }

        this.updateGalleryDynamicArea(container);
      });

      // Duplo clique na pasta abre diretamente como diretório aberto
      fEl.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const fId = fEl.getAttribute('data-folder-id');
        const activeProj = proj || this.selectedProject;
        if (activeProj && fId) {
          this.openProject(activeProj, fId);
        }
      });
    });

    // 5. Clique em arquivo da coluna (atualiza preview diretamente e mantém a barra de rolagem parada)
    viewport.querySelectorAll('.macos-col-file').forEach(itemEl => {
      itemEl.addEventListener('click', (e) => {
        const clickedCb = e.target.closest('.macos-col-checkbox');
        e.stopPropagation();

        const col = itemEl.closest('.macos-column');
        const colIndex = col ? col.getAttribute('data-col-index') : '0';
        const context = `column_${colIndex}`;
        const fileId = itemEl.getAttribute('data-file-id');

        if (this.isSelectionMode) {
          const cb = itemEl.querySelector('.macos-col-checkbox');
          if (!clickedCb) {
            if (e.shiftKey) {
              window.getSelection()?.removeAllRanges();
              this.handleColumnShiftSelect(col, this._lastSelectedAnchor?.id, fileId, updateSelectionBar);
              return;
            } else {
              if (this.selectedMediaIds.has(fileId)) {
                this.selectedMediaIds.delete(fileId);
                cb?.classList.remove('checked');
                if (cb) cb.innerHTML = '';
                itemEl.classList.remove('selected-for-batch');
              } else {
                this.selectedMediaIds.add(fileId);
                cb?.classList.add('checked');
                if (cb) cb.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>`;
                itemEl.classList.add('selected-for-batch');
              }
              this._lastSelectedAnchor = { id: fileId, type: 'file', context };
              updateSelectionBar();
            }
          }
        }

        this._columnsFocusedColType = 'folders';
        if (col) this._columnsFocusedColIndex = parseInt(colIndex, 10);
        this.columnsPreviewItemId = fileId;

        // Se o container de colunas já existe, atualiza apenas a coluna de preview e a seleção do item
        // evitando reconstruir e rolar desnecessariamente as colunas
        const currentTrack = viewport.querySelector('#macosColumnsTrack');
        if (currentTrack) {
          // Atualiza classe active nos itens da coluna (remove seleção de pastas para não ter seleção dupla)
          const col = itemEl.closest('.macos-column');
          if (col) {
            col.querySelectorAll('.macos-col-folder').forEach(folderEl => {
              folderEl.classList.remove('active');
              folderEl.setAttribute('aria-selected', 'false');
            });
            col.querySelectorAll('.macos-col-file').forEach(f => {
              f.classList.remove('active');
              f.setAttribute('aria-selected', 'false');
            });
            itemEl.classList.add('active');
            itemEl.setAttribute('aria-selected', 'true');
          }

          // Atualiza apenas a coluna de preview
          const gData = this.getGalleryData();
          let existingPreview = currentTrack.querySelector('#macosPreviewColumn');
          const hadPreview = !!existingPreview;
          const dummy = document.createElement('div');
          dummy.innerHTML = this.buildColumnsViewHtml(gData);
          const newPreview = dummy.querySelector('#macosPreviewColumn');

          if (newPreview) {
            if (existingPreview) {
              existingPreview.replaceWith(newPreview);
            } else {
              currentTrack.appendChild(newPreview);
            }
          // Em dispositivos mobile/telas estreitas, garante que a coluna de preview fique visível ao tocar em um arquivo
          if (!hadPreview || window.innerWidth <= 768) {
            scrollToAdvancedColumn(window.innerWidth <= 768);
          }
          } else if (existingPreview) {
            existingPreview.remove();
          }

          // Reassocia eventos dos botões da coluna de preview
          const btnP = viewport.querySelector('#btnMacosOpenPlayer');
          if (btnP) {
            btnP.addEventListener('click', (ev) => {
              ev.stopPropagation();
              const fId = btnP.getAttribute('data-file-id');
              const vid = (proj.videos || []).find(v => v.id === fId);
              if (vid) {
                this.selectedVideo = vid;
                this.currentView = 'client_player';
                this.isIsolatedFile = false;
                const targetUrl = this.isClientMode 
                  ? `/${vid.shortCode || vid.id}`
                  : `/author?project=${proj.id}&video=${vid.id}`;
                window.history.pushState({}, '', targetUrl);
                this.render();
              }
            });
          }
          const btnC = viewport.querySelector('#btnMacosCopyLink');
          if (btnC) {
            btnC.addEventListener('click', (ev) => {
              ev.stopPropagation();
              const code = btnC.getAttribute('data-file-code');
              const directFileUrl = `${window.location.origin}/${code}`;
              navigator.clipboard.writeText(directFileUrl);
              window.showToast(`Link copiado: .../${code}`);
            });
          }
          return;
        }

        this.updateGalleryDynamicArea(container);
      });

      // Duplo clique ou duplo toque rápido no mobile abre o player direto
      const openFileInPlayer = () => {
        const fileId = itemEl.getAttribute('data-file-id');
        const vid = (proj.videos || []).find(v => v.id === fileId);
        if (vid) {
          this.selectedVideo = vid;
          this.currentView = 'client_player';
          this.isIsolatedFile = false;
          const targetUrl = this.isClientMode 
            ? `/${vid.shortCode || vid.id}`
            : `/author?project=${proj.id}&video=${vid.id}`;
          window.history.pushState({}, '', targetUrl);
          this.render();
        }
      };

      itemEl.addEventListener('touchend', (e) => {
        if (e.target.closest('.macos-col-checkbox') || this.isSelectionMode) return;
        const fileId = itemEl.getAttribute('data-file-id');
        const now = Date.now();
        if (this._lastColFileTapId === fileId && now - (this._lastColFileTapTime || 0) < 380) {
          this._lastColFileTapId = null;
          e.preventDefault();
          openFileInPlayer();
          return;
        }
        this._lastColFileTapId = fileId;
        this._lastColFileTapTime = now;
      }, { passive: false });

      itemEl.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        openFileInPlayer();
      });
    });

    // Botão de abrir no player a partir da coluna de detalhes
    const btnOpenPlayer = viewport.querySelector('#btnMacosOpenPlayer');
    if (btnOpenPlayer) {
      btnOpenPlayer.addEventListener('click', (e) => {
        e.stopPropagation();
        const fileId = btnOpenPlayer.getAttribute('data-file-id');
        const vid = (proj.videos || []).find(v => v.id === fileId);
        if (vid) {
          this.selectedVideo = vid;
          this.currentView = 'client_player';
          this.isIsolatedFile = false;
          const targetUrl = this.isClientMode 
            ? `/${vid.shortCode || vid.id}`
            : `/author?project=${proj.id}&video=${vid.id}`;
          window.history.pushState({}, '', targetUrl);
          this.render();
        }
      });
    }

    // Botão Copiar Link do arquivo selecionado na coluna de detalhes
    const btnMacosCopyLink = viewport.querySelector('#btnMacosCopyLink');
    if (btnMacosCopyLink) {
      btnMacosCopyLink.addEventListener('click', (e) => {
        e.stopPropagation();
        const code = btnMacosCopyLink.getAttribute('data-file-code');
        const directFileUrl = `${window.location.origin}/${code}`;
        navigator.clipboard.writeText(directFileUrl);
        window.showToast(`Link copiado: .../${code}`);
      });
    }

    // Navegação completa por setas do teclado (macOS Finder style: Cima, Baixo, Esquerda, Direita, Enter)
    const keyHandler = (e) => {
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
      if (tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable) return;
      if (document.querySelector(".modal.active, .modal.show, [data-modal-open=\"true\"]")) return;
      if (this.currentView !== "author" && this.currentView !== "client_gallery" && !(this.currentView === "author_lobby" && this.lobbyViewMode === "columns")) return;
      if (this.galleryViewMode !== "columns" && this.lobbyViewMode !== "columns") return;

      const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", " "];
      if (!keys.includes(e.key)) return;

      const columns = Array.from(viewport.querySelectorAll(".macos-column"));
      if (columns.length === 0) return;

      // Descobre qual coluna está com foco/ativa
      let activeCol = null;
      let activeItem = null;

      // 1. Procura se algum elemento interno tem foco
      const focusedEl = document.activeElement;
      if (focusedEl && viewport.contains(focusedEl)) {
        activeItem = focusedEl.closest(".macos-col-item");
        if (activeItem) {
          activeCol = activeItem.closest(".macos-column");
        }
      }

      // 2. Se não houver elemento com foco ativo direto no DOM, verifica se temos memorizada uma coluna focada
      if (!activeCol && this._columnsFocusedColIndex !== undefined && this._columnsFocusedColIndex !== null) {
        activeCol = columns.find(c => parseInt(c.getAttribute("data-col-index") || "-1", 10) === this._columnsFocusedColIndex) || null;
        if (activeCol) {
          activeItem = activeCol.querySelector(".macos-col-item.active") || activeCol.querySelector(".macos-col-item.in-path") || activeCol.querySelector(".macos-col-item");
        }
      }
      if (!activeCol && this._columnsFocusedColType) {
        if (this._columnsFocusedColType === 'folders') {
          activeCol = (this.currentFolderId && columns.find(c => c.getAttribute("data-folder-id") === this.currentFolderId))
            || columns.find(c => c.getAttribute("data-folder-id") === 'root')
            || columns.find(c => c.getAttribute("data-col-type") === 'folders')
            || null;
        } else {
          activeCol = columns.find(c => c.getAttribute("data-col-type") === this._columnsFocusedColType) || null;
        }
        if (activeCol) {
          activeItem = activeCol.querySelector(".macos-col-item.active") || activeCol.querySelector(".macos-col-item.in-path") || activeCol.querySelector(".macos-col-item");
        }
      }

      // 3. Fallback: procura pelo item .active ou .in-path na coluna mais à direita que possui item ativo
      if (!activeItem) {
        for (let i = columns.length - 1; i >= 0; i--) {
          const col = columns[i];
          const sel = col.querySelector(".macos-col-item.active") || col.querySelector(".macos-col-item.in-path");
          if (sel) {
            activeItem = sel;
            activeCol = col;
            break;
          }
        }
      }

      // 4. Fallback final: primeira coluna ou última coluna com itens
      if (!activeCol) {
        for (let i = columns.length - 1; i >= 0; i--) {
          if (columns[i].querySelectorAll(".macos-col-item").length > 0) {
            activeCol = columns[i];
            break;
          }
        }
        if (!activeCol) activeCol = columns[0];
      }

      const itemsInCol = Array.from(activeCol.querySelectorAll(".macos-col-item"));
      if (itemsInCol.length === 0) return;

      let currentItemIndex = activeItem ? itemsInCol.indexOf(activeItem) : -1;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIdx = currentItemIndex < itemsInCol.length - 1 ? currentItemIndex + 1 : 0;
        const target = itemsInCol[nextIdx];
        if (target) {
          this._columnsFocusedColType = activeCol.getAttribute("data-col-type") || null;
          this._columnsFocusedColIndex = parseInt(activeCol.getAttribute("data-col-index") || "0", 10);
          target.focus();
          target.click();
          const listEl = target.closest(".macos-column-list");
          if (listEl) {
            const tTop = target.offsetTop;
            const tBottom = tTop + target.offsetHeight;
            if (tBottom > listEl.scrollTop + listEl.clientHeight) {
              listEl.scrollTop = tBottom - listEl.clientHeight;
            } else if (tTop < listEl.scrollTop) {
              listEl.scrollTop = tTop;
            }
          }
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIdx = currentItemIndex > 0 ? currentItemIndex - 1 : itemsInCol.length - 1;
        const target = itemsInCol[prevIdx];
        if (target) {
          this._columnsFocusedColType = activeCol.getAttribute("data-col-type") || null;
          this._columnsFocusedColIndex = parseInt(activeCol.getAttribute("data-col-index") || "0", 10);
          target.focus();
          target.click();
          const listEl = target.closest(".macos-column-list");
          if (listEl) {
            const tTop = target.offsetTop;
            const tBottom = tTop + target.offsetHeight;
            if (tTop < listEl.scrollTop) {
              listEl.scrollTop = tTop;
            } else if (tBottom > listEl.scrollTop + listEl.clientHeight) {
              listEl.scrollTop = tBottom - listEl.clientHeight;
            }
          }
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        // Avançar para a próxima coluna à direita
        const currentPosInList = columns.indexOf(activeCol);
        if (currentPosInList < columns.length - 1) {
          const nextCol = columns[currentPosInList + 1];
          if (nextCol.classList.contains("macos-preview-column")) {
            const playBtn = nextCol.querySelector("#btnMacosOpenPlayer");
            if (playBtn) playBtn.focus();
            return;
          }
          const nextItems = Array.from(nextCol.querySelectorAll(".macos-col-item"));
          if (nextItems.length > 0) {
            this._columnsFocusedColType = nextCol.getAttribute("data-col-type") || null;
            this._columnsFocusedColIndex = parseInt(nextCol.getAttribute("data-col-index") || "0", 10);
            const alreadySelected = nextCol.querySelector(".macos-col-item.active") || nextCol.querySelector(".macos-col-item.in-path");
            const targetItem = alreadySelected || nextItems[0];
            targetItem.focus();
            targetItem.click();
          }
        } else if (activeItem && activeItem.classList.contains("macos-col-folder")) {
          activeItem.click();
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        // Voltar todos os níveis para a coluna à esquerda
        const currentPosInList = columns.indexOf(activeCol);
        if (currentPosInList > 0) {
          const prevCol = columns[currentPosInList - 1];
          const prevItems = Array.from(prevCol.querySelectorAll(".macos-col-item"));
          const prevSelected = prevCol.querySelector(".macos-col-item.active") || prevCol.querySelector(".macos-col-item.in-path") || prevItems[0];
          if (prevSelected) {
            this._columnsFocusedColType = prevCol.getAttribute("data-col-type") || null;
            this._columnsFocusedColIndex = parseInt(prevCol.getAttribute("data-col-index") || "0", 10);
            prevSelected.focus();
            prevSelected.click();
          }
        }
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (this.isSelectionMode && activeItem) {
          const cb = activeItem.querySelector('.macos-col-checkbox');
          if (cb) {
            cb.click();
            return;
          }
        }
        if (e.key === "Enter" && activeItem) {
          if (activeItem.classList.contains("macos-col-file")) {
            const fileId = activeItem.getAttribute("data-file-id");
            const vid = (proj.videos || []).find(v => v.id === fileId);
            if (vid) {
              this.selectedVideo = vid;
              this.currentView = "client_player";
              this.isIsolatedFile = false;
              const targetUrl = this.isClientMode 
                ? `/${vid.shortCode || vid.id}`
                : `/author?project=${proj.id}&video=${vid.id}`;
              window.history.pushState({}, "", targetUrl);
              this.render();
            }
          } else {
            activeItem.click();
          }
        }
      }
    };
    window.addEventListener('keydown', keyHandler);
    this._columnsKeydownHandler = keyHandler;
  }

  updateGalleryDynamicArea(container) {
    if (!container || typeof container.querySelector !== 'function') {
      container = document.getElementById('mainContentArea') || document.body;
    }
    const dynamicArea = container.querySelector('#galleryDynamicArea') || document.querySelector('#galleryDynamicArea');
    if (!dynamicArea) {
      if (this.currentView === 'author_lobby') {
        this.renderDirectoryLobby(container);
      } else {
        this.renderGalleryView(container);
      }
      return;
    }

    const activeEl = document.activeElement;
    const isInputActive = Boolean(activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA'));
    const selStart = isInputActive ? activeEl.selectionStart : null;
    const selEnd = isInputActive ? activeEl.selectionEnd : null;

    const gData = this.getGalleryData();
    if (!gData) return;

    if (this.currentView === 'author_lobby' && this.lobbyViewMode === 'columns') {
      dynamicArea.innerHTML = this.buildColumnsViewHtml(gData);
      this.bindColumnsNavigationEvents(container, gData);

      const lobbySearchBox = container.querySelector('.lobby-search-box') || document.querySelector('.lobby-search-box');
      let lobbyClearBtn = lobbySearchBox?.querySelector('#btnClearLobbySearch');
      if (this.lobbySearchQuery) {
        if (!lobbyClearBtn && lobbySearchBox) {
          lobbyClearBtn = document.createElement('button');
          lobbyClearBtn.className = 'clear-search-btn';
          lobbyClearBtn.id = 'btnClearLobbySearch';
          lobbyClearBtn.title = 'Limpar busca';
          lobbyClearBtn.type = 'button';
          lobbyClearBtn.textContent = '×';
          lobbySearchBox.appendChild(lobbyClearBtn);
          lobbyClearBtn.addEventListener('click', () => {
            this.lobbySearchQuery = '';
            const inLobby = document.getElementById('inputLobbySearch');
            if (inLobby) inLobby.value = '';
            this.updateGalleryDynamicArea(container);
            lobbyClearBtn.remove();
            inLobby?.focus();
          });
        }
      } else {
        if (lobbyClearBtn) lobbyClearBtn.remove();
      }

      if (isInputActive && activeEl && document.body.contains(activeEl)) {
        if (document.activeElement !== activeEl) {
          try { activeEl.focus({ preventScroll: true }); } catch (_) {}
        }
        if (selStart !== null && selEnd !== null) {
          try { activeEl.setSelectionRange(selStart, selEnd); } catch (_) {}
        }
      }
      return;
    }

    dynamicArea.innerHTML = this.buildGalleryDynamicHtml(gData);

    // Atualiza breadcrumb no topo (soma o diretório e pastas abertas)
    const breadcrumbMount = container.querySelector('#galleryBreadcrumbMount');
    if (breadcrumbMount) {
      breadcrumbMount.innerHTML = this.renderGalleryBreadcrumbHtml(gData);
      breadcrumbMount.querySelectorAll('.gallery-crumb-link').forEach(crumb => {
        crumb.addEventListener('click', () => {
          const targetFid = crumb.getAttribute('data-folder-id');
          this.gallerySearchQuery = '';
          this.currentFolderId = targetFid === 'root' ? (this.scopedFolderId || null) : targetFid;
          this.selectedMediaIds.clear();
          this.selectedFolderIds.clear();
          this.mediaFilter = 'all';
          const crumbFolder = gData.folders.find(f => f.id === this.currentFolderId);
          const targetUrl = this.isClientMode
            ? `/${(crumbFolder && crumbFolder.shortCode) || (this.scopedFolderId && gData.folders.find(f => f.id === this.scopedFolderId)?.shortCode) || gData.proj.shortCode || gData.proj.slug}`
            : `/author?project=${gData.proj.id}${this.currentFolderId ? `&folder=${encodeURIComponent(this.currentFolderId)}` : ''}`;
          window.history.pushState({}, '', targetUrl);
          if (this.galleryViewMode === 'columns') {
            this.updateGalleryDynamicArea(container);
          } else {
            this.render();
          }
        });
      });
    }

    // Atualiza o botão de copiar link da pasta/diretório aberta(o)
    let btnCopyLink = container.querySelector('#btnCopyLink');
    if (this.isClientMode && !gData.showCopyLinkBtn) {
      if (btnCopyLink) btnCopyLink.remove();
    } else {
      if (btnCopyLink) {
        btnCopyLink.title = `Copiar link de entrega${gData.targetFolderForCopy ? ` da pasta "${gData.targetFolderForCopy.name}"` : ''}: .../${gData.copyCode}`;
      } else {
        const titleWrapper = container.querySelector('.gallery-title-header-row .project-title-wrapper');
        if (titleWrapper) {
          btnCopyLink = document.createElement('button');
          btnCopyLink.className = 'icon-action-btn';
          btnCopyLink.id = 'btnCopyLink';
          btnCopyLink.title = `Copiar link de entrega${gData.targetFolderForCopy ? ` da pasta "${gData.targetFolderForCopy.name}"` : ''}: .../${gData.copyCode}`;
          btnCopyLink.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`;
          titleWrapper.insertBefore(btnCopyLink, titleWrapper.firstChild);
          btnCopyLink.addEventListener('click', () => {
            const currentG = this.getGalleryData();
            if (currentG) {
              navigator.clipboard.writeText(currentG.clientUrl);
              window.showToast(`Link copiado: .../${currentG.copyCode}`);
            }
          });
        }
      }
    }

    // Atualiza o botão de fixar pasta ativa (Pin) como novo diretório
    let btnPinFolder = container.querySelector('#btnPinFolder');
    if (this.isClientMode || !gData.currentFolder) {
      if (btnPinFolder) btnPinFolder.remove();
    } else {
      const titleWrapper = container.querySelector('.gallery-title-header-row .project-title-wrapper');
      if (titleWrapper) {
        if (!btnPinFolder) {
          btnPinFolder = document.createElement('button');
          btnPinFolder.className = 'icon-action-btn';
          btnPinFolder.id = 'btnPinFolder';
          btnPinFolder.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>`;
          const btnEdit = titleWrapper.querySelector('#btnEditProject');
          if (btnEdit) {
            titleWrapper.insertBefore(btnPinFolder, btnEdit);
          } else {
            const breadcrumbEl = titleWrapper.querySelector('#galleryBreadcrumbMount');
            if (breadcrumbEl) {
              titleWrapper.insertBefore(btnPinFolder, breadcrumbEl);
            } else {
              titleWrapper.appendChild(btnPinFolder);
            }
          }
          btnPinFolder.addEventListener('click', () => this.pinCurrentFolder());
        }
        btnPinFolder.title = `Fixar pasta "${gData.currentFolder.name}" como novo diretório na divisão ${gData.proj?.division || ''}`;
      }
    }

    // Atualiza o botão de editar (abrir modal de configurações respectivo da pasta ou diretório ativo)
    if (!this.isClientMode) {
      let btnEdit = container.querySelector('#btnEditProject');
      const titleWrapper = container.querySelector('.gallery-title-header-row .project-title-wrapper');
      if (!btnEdit && titleWrapper) {
        btnEdit = document.createElement('button');
        btnEdit.className = 'icon-action-btn';
        btnEdit.id = 'btnEditProject';
        btnEdit.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`;
        const breadcrumbEl = container.querySelector('#galleryBreadcrumbMount');
        if (breadcrumbEl) {
          titleWrapper.insertBefore(btnEdit, breadcrumbEl);
        } else {
          titleWrapper.appendChild(btnEdit);
        }
        btnEdit.addEventListener('click', () => {
          const currentG = this.getGalleryData();
          if (currentG && currentG.currentFolder) {
            this.openEditFolderModal(currentG.currentFolder, currentG.proj);
          } else if (currentG && currentG.proj) {
            this.openEditProjectModal(currentG.proj);
          }
        });
      }
      if (btnEdit) {
        btnEdit.title = gData.currentFolder ? `Editar configurações da pasta "${gData.currentFolder.name}"` : 'Editar título e link do Drive espelhado';
      }
    }

    // Manage clear button in search box
    const searchBox = container.querySelector('.gallery-header-search-box');
    let clearBtn = searchBox?.querySelector('#btnClearGallerySearch');
    if (this.gallerySearchQuery) {
      if (!clearBtn && searchBox) {
        clearBtn = document.createElement('button');
        clearBtn.className = 'clear-search-btn';
        clearBtn.id = 'btnClearGallerySearch';
        clearBtn.title = 'Limpar busca';
        clearBtn.type = 'button';
        clearBtn.textContent = '×';
        searchBox.appendChild(clearBtn);
        clearBtn.addEventListener('click', () => {
          this.gallerySearchQuery = '';
          const input = document.getElementById('inputGallerySearch');
          if (input) input.value = '';
          this.updateGalleryDynamicArea(container);
          input?.focus();
        });
      }
    } else {
      if (clearBtn) clearBtn.remove();
    }

    // Update filter counts in dropdown without destroying it
    const filterPillCount = container.querySelector('.gallery-filter-pill-count');
    if (filterPillCount) {
      filterPillCount.textContent = gData.filteredItems.length;
    }
    const updateCount = (filter, count) => {
      const el = container.querySelector(`.gallery-filter-opt[data-filter="${filter}"] .gallery-filter-opt-count`);
      if (el) el.textContent = count;
    };
    updateCount('all', gData.allItems.length);
    updateCount('video', gData.videoCount);
    updateCount('image', gData.imageCount);
    updateCount('audio', gData.audioCount);
    updateCount('pdf', gData.pdfCount);
    updateCount('file', gData.fileCount);

    // Rebind dynamic area events
    this.bindGalleryDynamicEvents(container, gData);

    if (isInputActive && activeEl && document.body.contains(activeEl)) {
      if (document.activeElement !== activeEl) {
        try { activeEl.focus({ preventScroll: true }); } catch (_) {}
      }
      if (selStart !== null && selEnd !== null) {
        try { activeEl.setSelectionRange(selStart, selEnd); } catch (_) {}
      }
    }
  }


  renderPlayerDetailView(container) {
    this._isColumnsNavActive = false;
    if (this._columnsKeydownHandler) {
      window.removeEventListener('keydown', this._columnsKeydownHandler);
      this._columnsKeydownHandler = null;
    }
    if (this.playerInstance) {
      this.playerInstance.destroy();
      this.playerInstance = null;
    }
    this.cleanupPhotoFullscreen();

    if (!this.selectedProject || !this.selectedVideo) {
      this.currentView = this.isClientMode ? 'client_gallery' : 'author';
      this.render();
      return;
    }

    const proj = this.selectedProject;
    const vid = this.selectedVideo;
    const folders = proj.folders || [];
    const fileFolder = folders.find(f => f.id === (vid.driveFolderId || vid.folderId || this.currentFolderId)) || null;
    if (fileFolder) {
      this.currentFolderId = fileFolder.id;
    } else if (vid.driveFolderId === proj.driveFolderId || !vid.folderPath) {
      this.currentFolderId = null;
    }
    const itemType = this.getItemType(vid);
    const isVideo = itemType === 'video';
    const isAudio = itemType === 'audio';
    const isImage = itemType === 'image';
    const isPdf = itemType === 'pdf';
    const isArchive = itemType === 'archive';
    const isGenericFile = itemType === 'file';
    const isOtherFile = isArchive || isGenericFile;
    const isPsd = vid.subType === 'psd' || (vid.fileName && /\.psd$/i.test(vid.fileName));
    const isAi = vid.subType === 'ai' || (vid.fileName && /\.ai$/i.test(vid.fileName));
    const isDesign = isPsd || isAi;
    const mediaLabel = isAudio ? 'áudio' : (isPdf ? 'documento PDF' : (isPsd ? 'arquivo PSD' : (isAi ? 'arquivo AI' : (isImage ? 'foto' : (isArchive ? 'arquivo compactado' : (isGenericFile ? 'arquivo' : 'vídeo'))))));
    const defaultExt = isAudio ? 'mp3' : (isPdf ? 'pdf' : (isPsd ? 'psd' : (isAi ? 'ai' : (isImage ? 'jpg' : 'mp4'))));
    const downloadFileName = vid.fileName || `${vid.title}.${defaultExt}`;
    const fileCode = vid.shortCode || vid.id;
    const clientUrl = `${window.location.origin}/${fileCode}`;
    const customDisplayUrl = `https://${this.data.settings.baseDomain || 'giffu.com.br'}/${fileCode}`;

    const isCommentsAllowed = this.isCommentsAllowedForVideo(vid, proj);
    const showCommentsBtn = (!this.isClientMode) || isCommentsAllowed;
    const showVideoCopyBtn = (!this.isClientMode) || this.isShareAllowedForVideo(vid, proj);

    container.innerHTML = `
      <!-- Breadcrumb Header Row (Sketch 3) -->
      <div class="content-header-row">
        <div class="project-title-wrapper">
          ${showVideoCopyBtn ? `
            <button class="icon-action-btn" id="btnCopyVideoLink" title="Copiar link direto d${isAudio ? 'o áudio' : (isImage ? 'a foto' : (isOtherFile ? 'o arquivo' : 'o vídeo'))}: .../${fileCode}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
            </button>
          ` : ''}

          ${!this.isClientMode ? `
            <button class="icon-action-btn" id="btnEditMedia" title="Editar arquivo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            </button>
          ` : ''}

          ${(!this.isClientMode && isVideo) ? `
            <button class="icon-action-btn" id="btnHeaderSetCover" title="Definir frame como capa" aria-label="Definir frame como capa">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </button>
            ${(vid.hasCustomCover || vid.customThumbnailUrl || vid.coverUrl) ? `
              <button class="icon-action-btn" id="btnHeaderResetCover" title="Desfazer capa personalizada" aria-label="Desfazer capa personalizada">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
                </svg>
              </button>
            ` : ''}
          ` : ''}

          ${(() => {
            if (this.isClientMode && this.isIsolatedFile) {
              // Arquivo isolado: apenas o arquivo para o cliente, sem pastas ou diretório anteriores
              return `
                <div class="project-breadcrumb">
                  <h1 class="project-heading" style="font-size: 18px; margin: 0; font-weight: 700;">${this.getDisplayTitle(vid)}</h1>
                </div>
              `;
            }

            if (this.isClientMode && this.scopedFolderId) {
              // Pasta escopada: breadcrumbs iniciam na pasta compartilhada Y, sem exibir X nem raiz
              const fileBreadcrumbTrail = [];
              let temp = fileFolder;
              while (temp) {
                fileBreadcrumbTrail.unshift(temp);
                if (temp.id === this.scopedFolderId) {
                  break;
                }
                temp = temp.parentId ? folders.find(f => f.id === temp.parentId) : null;
              }
              const scopedFolder = folders.find(f => f.id === this.scopedFolderId);
              if (fileBreadcrumbTrail.length === 0 && scopedFolder) {
                fileBreadcrumbTrail.push(scopedFolder);
              }

              return `
                <nav class="project-breadcrumb">
                  ${fileBreadcrumbTrail.map(crumb => `
                    <a class="breadcrumb-link breadcrumb-folder-jump" data-folder-id="${crumb.id}" title="Voltar à pasta ${crumb.name}">${crumb.name}</a>
                    <span class="breadcrumb-separator">&gt;</span>
                  `).join('')}
                  <span class="breadcrumb-current">${this.getDisplayTitle(vid)}</span>
                </nav>
              `;
            }

            // Modo autor ou diretório completo compartilhado
            return `
              <nav class="project-breadcrumb">
                <a class="breadcrumb-link" id="breadcrumbBackProject" title="Voltar ao início">${proj.name}</a>
                ${fileFolder ? `
                  <span class="breadcrumb-separator">&gt;</span>
                  <a class="breadcrumb-link" id="breadcrumbBackFolder" title="Voltar à pasta ${fileFolder.name}">${fileFolder.name}</a>
                ` : ''}
                <span class="breadcrumb-separator">&gt;</span>
                <span class="breadcrumb-current">${this.getDisplayTitle(vid)}</span>
              </nav>
            `;
          })()}
        </div>

        <div style="display: flex; gap: 10px; align-items: center;">
          ${showCommentsBtn ? `
          <button class="btn-secondary toggle-comments-btn" id="btnToggleComments" title="Mostrar ou ocultar seção de comentários">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>
            <span id="btnToggleCommentsText">Comentários</span>
            <span class="comments-badge" id="btnToggleCommentsBadge" style="display: none;">0</span>
          </button>
          ` : ''}
          <a class="btn-primary header-download-btn" id="btnHeaderDownloadMedia" href="${vid.url}${vid.url.includes('?') ? '&' : '?'}download=1" download="${downloadFileName}" title="Baixar este arquivo original">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
            <span>Baixar</span>
          </a>
          ${(!this.isClientMode || !this.isIsolatedFile) ? `
            <button class="btn-secondary" id="btnBackToGrid">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
              Voltar para Galeria
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Split Layout: Media Viewer (Left) + Comments (Right) -->
      <div class="detail-view-container comments-hidden">
        <!-- Main Column: Dedicated Custom Player or Photo Viewer -->
        <div class="player-main-column">
          <div id="customPlayerMount"></div>
        </div>

        <!-- Comments Column -->
        <div class="comments-panel" id="commentsMount"></div>
      </div>
    `;

    const playerMount = document.getElementById('customPlayerMount');

    if (isImage) {
      const photos = (this.isClientMode && this.isIsolatedFile) ? [vid] : this.getPhotosInContainerFolder(vid, proj);
      const photoIndex = photos.findIndex(p => p.id === vid.id);
      const hasMultiplePhotos = (!this.isClientMode || !this.isIsolatedFile) && photos.length > 1;
      const isPsd = vid.subType === 'psd' || (vid.fileName && /\.psd$/i.test(vid.fileName));
      const isAi = vid.subType === 'ai' || (vid.fileName && /\.ai$/i.test(vid.fileName));
      const isDesign = isPsd || isAi;
      const isNonNativeWebImg = /\.(heic|heif|tif|tiff|bmp|raw|cr2|nef|arw|dng|psd|ai)$/i.test(vid.fileName || vid.title || '');
      const initialDims = vid.dimensions || (vid.resolution && vid.resolution.includes('x') ? vid.resolution : (isDesign ? (isPsd ? 'PSD' : 'AI') : ''));
      const imageSrc = (isDesign || isNonNativeWebImg)
        ? (vid.previewUrl || (vid.driveFileId ? `/api/stream/preview?drive=${vid.driveFileId}&size=2048` : vid.url))
        : vid.url;
      const downloadLabel = isPsd ? 'Baixar PSD' : (isAi ? 'Baixar AI' : 'Baixar Foto');

      // Photo Lightbox & Viewer
      playerMount.innerHTML = `
        <div class="custom-image-wrapper is-loading-photo" id="customImageWrapper">
          <div class="player-top-badge" id="photoTopBadge" style="opacity: 1; visibility: visible; display: flex; gap: 8px; align-items: center;">
            ${hasMultiplePhotos ? `<span id="photoIndexBadge" class="photo-index-pill">${photoIndex >= 0 ? photoIndex + 1 : 1} / ${photos.length}</span>` : ''}
            <span id="photoQualityLabel">${initialDims}</span>
          </div>

          ${hasMultiplePhotos ? `
          <button class="photo-nav-btn prev-photo-btn" id="btnPrevPhoto" title="Foto anterior (Seta para a esquerda)" aria-label="Foto anterior">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button class="photo-nav-btn next-photo-btn" id="btnNextPhoto" title="Próxima foto (Seta para a direita)" aria-label="Próxima foto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          ` : ''}

          <img class="custom-image-element" id="mainPhotoElement" src="${imageSrc}" decoding="async" alt="${this.escapeHtml(vid.title)}">
          <div class="image-overlay-controls custom-image-toolbar">
            ${showCommentsBtn ? `
            <button class="btn-image-action" id="btnPhotoToggleComments" title="Mostrar ou ocultar comentários">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>
              <span id="btnPhotoToggleCommentsText">Comentários</span>
              <span class="comments-badge" id="btnPhotoToggleCommentsBadge" style="display: none;">0</span>
            </button>
            ` : ''}
            <a class="btn-image-action" id="btnDownloadPhotoAction" href="${vid.url}${vid.url.includes('?') ? '&' : '?'}download=1" download="${downloadFileName}" title="${downloadLabel}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
              <span id="btnDownloadPhotoText">${downloadLabel} ${this.formatFileSize(vid.size) ? `(${this.formatFileSize(vid.size)})` : (initialDims && initialDims.includes('x') ? `(${initialDims})` : '')}</span>
            </a>
            <button class="btn-image-action" id="btnFullscreenPhoto" title="Visualizar em Tela Cheia">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
              <span id="btnFullscreenPhotoText">Tela Cheia</span>
            </button>
          </div>
        </div>
      `;

      const imgWrapper = document.getElementById('customImageWrapper');
      const mainPhoto = document.getElementById('mainPhotoElement');
      if (mainPhoto) {
        const updateDims = () => {
          imgWrapper?.classList.remove('is-loading-photo');
          if (!mainPhoto.naturalWidth) return;
          const dims = `${mainPhoto.naturalWidth}x${mainPhoto.naturalHeight}`;
          const badgeLabel = document.getElementById('photoQualityLabel');
          if (badgeLabel && (!vid.dimensions || !badgeLabel.textContent.includes('x'))) {
            badgeLabel.textContent = isDesign ? `${(isPsd ? 'PSD' : 'AI')} • ${dims}` : dims;
          }
          const dlText = document.getElementById('btnDownloadPhotoText');
          if (dlText) {
            const sz = this.formatFileSize(vid.size);
            dlText.textContent = `${downloadLabel} ${sz ? `(${sz})` : `(${dims})`}`;
          }
        };
        mainPhoto.onerror = () => {
          if (vid.driveFileId && !mainPhoto.dataset.retriedPreview) {
            mainPhoto.dataset.retriedPreview = '1';
            mainPhoto.src = `/api/stream/preview?drive=${vid.driveFileId}&size=1600`;
            return;
          }
          if (vid.thumbnailUrl && !mainPhoto.dataset.retriedThumb) {
            mainPhoto.dataset.retriedThumb = '1';
            mainPhoto.src = vid.thumbnailUrl;
            return;
          }
          imgWrapper?.classList.remove('is-loading-photo');
        };
        if (mainPhoto.complete && mainPhoto.naturalWidth) updateDims();
        else mainPhoto.addEventListener('load', updateDims);
      }

      const btnFs = document.getElementById('btnFullscreenPhoto');
      if (btnFs && imgWrapper) {
        const syncPhotoFsState = (active) => {
          if (active) {
            imgWrapper.classList.add('is-fullscreen');
            document.body.classList.add('photo-fullscreen-active');
            document.documentElement.classList.add('photo-fullscreen-active');
          } else {
            imgWrapper.classList.remove('is-fullscreen');
            document.body.classList.remove('photo-fullscreen-active');
            document.documentElement.classList.remove('photo-fullscreen-active');
          }
          const fsText = document.getElementById('btnFullscreenPhotoText');
          if (fsText) fsText.textContent = active ? 'Sair' : 'Tela Cheia';
        };

        const isPhotoFs = () => !!(
          (document.fullscreenElement && (document.fullscreenElement === imgWrapper || imgWrapper.contains(document.fullscreenElement))) ||
          (document.webkitFullscreenElement && (document.webkitFullscreenElement === imgWrapper || imgWrapper.contains(document.webkitFullscreenElement))) ||
          imgWrapper.classList.contains('is-fullscreen')
        );

        const togglePhotoFs = () => {
          if (!isPhotoFs()) {
            syncPhotoFsState(true);
            if (imgWrapper.requestFullscreen) {
              imgWrapper.requestFullscreen().catch(() => {});
            } else if (imgWrapper.webkitRequestFullscreen) {
              try { imgWrapper.webkitRequestFullscreen(); } catch (e) {}
            }
          } else {
            if (document.fullscreenElement || document.webkitFullscreenElement) {
              if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
              } else if (document.webkitExitFullscreen) {
                try { document.webkitExitFullscreen(); } catch (e) {}
              }
            }
            syncPhotoFsState(false);
          }
        };

        btnFs.addEventListener('click', togglePhotoFs);

        const onPhotoFsChange = () => {
          const isCurrentFs = !!(
            (document.fullscreenElement && (document.fullscreenElement === imgWrapper || imgWrapper.contains(document.fullscreenElement))) ||
            (document.webkitFullscreenElement && (document.webkitFullscreenElement === imgWrapper || imgWrapper.contains(document.webkitFullscreenElement)))
          );
          syncPhotoFsState(isCurrentFs);
        };

        document.addEventListener('fullscreenchange', onPhotoFsChange);
        document.addEventListener('webkitfullscreenchange', onPhotoFsChange);

        const photoKeyHandler = (e) => {
          if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable) return;
          if (e.code === 'KeyF') {
            togglePhotoFs();
          } else if (e.code === 'Escape' || e.key === 'Escape' || e.keyCode === 27) {
            if (isPhotoFs()) {
              if (document.fullscreenElement || document.webkitFullscreenElement) {
                if (document.exitFullscreen) {
                  document.exitFullscreen().catch(() => {});
                } else if (document.webkitExitFullscreen) {
                  try { document.webkitExitFullscreen(); } catch (err) {}
                }
              }
              syncPhotoFsState(false);
            }
          } else if (e.key === 'ArrowLeft' || e.code === 'ArrowLeft') {
            e.preventDefault();
            this.navigatePhoto(-1);
          } else if (e.key === 'ArrowRight' || e.code === 'ArrowRight') {
            e.preventDefault();
            this.navigatePhoto(1);
          }
        };

        window.addEventListener('keydown', photoKeyHandler);
        this.photoKeyHandler = photoKeyHandler;
        this.photoFsHandler = onPhotoFsChange;
      }

      // Hook up UI arrow click events
      if (hasMultiplePhotos) {
        document.getElementById('btnPrevPhoto')?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.navigatePhoto(-1);
        });
        document.getElementById('btnNextPhoto')?.addEventListener('click', (e) => {
          e.stopPropagation();
          this.navigatePhoto(1);
        });

        // Touch swipe support for mobile/tablet
        if (imgWrapper) {
          let touchStartX = 0;
          let touchStartY = 0;
          imgWrapper.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches.length === 1) {
              touchStartX = e.touches[0].clientX;
              touchStartY = e.touches[0].clientY;
            }
          }, { passive: true });

          imgWrapper.addEventListener('touchend', (e) => {
            if (e.changedTouches && e.changedTouches.length === 1) {
              const diffX = e.changedTouches[0].clientX - touchStartX;
              const diffY = e.changedTouches[0].clientY - touchStartY;
              if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.4) {
                if (diffX > 0) {
                  this.navigatePhoto(-1);
                } else {
                  this.navigatePhoto(1);
                }
              }
            }
          }, { passive: true });
        }
      }

      // Suporte direto para salvar no Fotos/Galeria do iPhone/Android ao baixar foto individual
      const handleSinglePhotoMobileDownload = async (e) => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent));
        if (isMobile && navigator.canShare && typeof navigator.share === 'function') {
          e.preventDefault();
          const targetPhoto = this.currentPhoto || vid;
          try {
            window.showToast('Preparando foto para salvar no Fotos/Galeria...');
            const streamUrl = `${targetPhoto.url}${targetPhoto.url.includes('?') ? '&' : '?'}download=1`;
            const res = await fetch(streamUrl);
            if (!res.ok) throw new Error('Falha ao baixar arquivo');
            const blob = await res.blob();
            let ext = this.getFileExtension(targetPhoto) || '';
            if (ext.startsWith('.')) ext = ext.slice(1);
            if (!ext) ext = 'jpg';
            let fileName = targetPhoto.fileName || targetPhoto.title || 'foto';
            if (!fileName.toLowerCase().endsWith('.' + ext.toLowerCase())) fileName = `${fileName}.${ext}`;
            let mime = blob.type;
            const lName = fileName.toLowerCase();
            if (!mime || mime === 'application/octet-stream') {
              if (lName.endsWith('.jpg') || lName.endsWith('.jpeg')) mime = 'image/jpeg';
              else if (lName.endsWith('.png')) mime = 'image/png';
              else if (lName.endsWith('.webp')) mime = 'image/webp';
              else mime = 'image/jpeg';
            }
            const fileObj = new File([blob], fileName, { type: mime, lastModified: Date.now() });
            if (navigator.canShare({ files: [fileObj] })) {
              await navigator.share({
                files: [fileObj],
                title: fileName
              });
              window.showToast('Salvo com sucesso no Fotos/Galeria!');
              return;
            }
          } catch (err) {
            if (err.name === 'AbortError') return;
            console.warn('Share individual falhou:', err);
          }
          window.location.href = `${targetPhoto.url}${targetPhoto.url.includes('?') ? '&' : '?'}download=1`;
        }
      };

      document.getElementById('btnDownloadPhotoAction')?.addEventListener('click', handleSinglePhotoMobileDownload);
      document.getElementById('btnHeaderDownloadMedia')?.addEventListener('click', handleSinglePhotoMobileDownload);

      this.playerInstance = null;
    } else if (isAudio) {
      // Initialize Audio Player
      this.playerInstance = new window.CustomAudioPlayer(playerMount, vid, {
        project: proj,
        allowComments: showCommentsBtn,
        currentFolderId: fileFolder ? fileFolder.id : (this.currentFolderId || null),
        onTimeUpdate: (cur, dur) => {
          if (this.commentsController) {
            this.commentsController.updateVideoTime(cur);
          }
        },
        onToggleComments: () => {
          this.toggleComments();
        }
      });
    } else if (isPdf) {
      // PDF Interactive Reader & Cover Preview
      playerMount.innerHTML = `
        <div class="custom-pdf-wrapper" id="customPdfWrapper">
          <div class="pdf-top-toolbar">
            <div class="pdf-top-toolbar-left">
              <span class="card-media-type-pill doc-pill pdf-pill" style="font-size: 11px; padding: 3px 8px;">PDF</span>
              <span class="pdf-filename" title="${this.escapeHtml(vid.fileName || vid.title)}">${this.escapeHtml(vid.fileName || vid.title)}</span>
              ${this.formatFileSize(vid.size) ? `<span class="pdf-size">• ${this.formatFileSize(vid.size)}</span>` : ''}
            </div>
            <div class="pdf-top-toolbar-right">
              ${showCommentsBtn ? `
              <button class="btn-image-action" id="btnPdfToggleComments" title="Mostrar ou ocultar comentários">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>
                <span id="btnPdfToggleCommentsText">Comentários</span>
                <span class="comments-badge" id="btnPdfToggleCommentsBadge" style="display: none;">0</span>
              </button>
              ` : ''}
              <button class="btn-image-action" id="btnTogglePdfMode" title="Alternar entre Leitor e Capa">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                <span id="btnTogglePdfModeText">Ver Capa</span>
              </button>
              <a class="btn-image-action" href="${vid.url}${vid.url.includes('?') ? '&' : '?'}download=1" download="${downloadFileName}" title="Baixar PDF original">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                <span>Baixar PDF</span>
              </a>
              <a class="btn-image-action" href="${vid.url}" target="_blank" rel="noopener noreferrer" title="Abrir PDF em nova aba">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                <span>Nova Guia</span>
              </a>
            </div>
          </div>
          <div class="pdf-container-body" id="pdfContainerBody">
            <iframe class="pdf-embed-frame" id="pdfEmbedFrame" src="${vid.url}#toolbar=0&navpanes=0" title="${this.escapeHtml(vid.title)}"></iframe>
            <div class="pdf-cover-view" id="pdfCoverView" style="display: none;">
              <img src="${vid.previewUrl || `/api/stream/preview?drive=${vid.driveFileId}&size=2000`}" alt="${this.escapeHtml(vid.title)}" />
            </div>
          </div>
        </div>
      `;

      let isShowingCover = false;
      const pdfFrame = document.getElementById('pdfEmbedFrame');
      const pdfCover = document.getElementById('pdfCoverView');
      const btnToggleMode = document.getElementById('btnTogglePdfMode');
      const btnToggleModeText = document.getElementById('btnTogglePdfModeText');

      if (btnToggleMode && pdfFrame && pdfCover) {
        btnToggleMode.addEventListener('click', () => {
          isShowingCover = !isShowingCover;
          if (isShowingCover) {
            pdfFrame.style.display = 'none';
            pdfCover.style.display = 'flex';
            if (btnToggleModeText) btnToggleModeText.textContent = 'Ver Leitor';
          } else {
            pdfCover.style.display = 'none';
            pdfFrame.style.display = 'block';
            if (btnToggleModeText) btnToggleModeText.textContent = 'Ver Capa';
          }
        });
      }

      document.getElementById('btnPdfToggleComments')?.addEventListener('click', () => {
        this.toggleComments();
      });

      this.playerInstance = null;
    } else if (isOtherFile) {
      const extTag = (vid.extension || (isArchive ? 'ZIP' : 'ARQUIVO')).toUpperCase().replace('.', '');
      playerMount.innerHTML = `
        <div class="custom-file-wrapper" id="customFileWrapper">
          <div class="file-showcase-card">
            <div class="file-showcase-icon ${isArchive ? 'zip-showcase' : 'doc-showcase'}">
              ${isArchive ? ZIP_FILE_ICON_LARGE : DOC_FILE_ICON_LARGE}
            </div>
            <div class="file-showcase-details">
              <div class="file-showcase-header">
                <span class="file-showcase-tag ${isArchive ? 'zip-tag' : 'doc-tag'}">${extTag}</span>
                <span class="file-showcase-type-name">${isArchive ? 'Arquivo Compactado' : 'Arquivo / Documento'}</span>
              </div>
              <h2 class="file-showcase-title" title="${this.getDisplayTitle(vid)}">${this.getDisplayTitle(vid)}</h2>
              <div class="file-showcase-meta">
                ${vid.size ? `<span class="file-showcase-size">Tamanho: <strong>${vid.size}</strong></span>` : ''}
              </div>
              <div class="file-showcase-actions">
                <a class="btn-primary file-download-main-btn" href="${vid.url}${vid.url.includes('?') ? '&' : '?'}download=1" download="${downloadFileName}">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                  <span>Baixar Arquivo</span>
                </a>
                <a class="btn-secondary" href="${vid.url}" target="_blank" rel="noopener noreferrer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  <span>Abrir em Nova Guia</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
      this.playerInstance = null;
    } else {
      // Initialize Video Player
      this.playerInstance = new window.CustomVideoPlayer(playerMount, vid, {
        canSetCover: !this.isClientMode,
        onTimeUpdate: (cur, dur) => {
          if (this.commentsController) {
            this.commentsController.updateVideoTime(cur);
          }
        },
        onToggleComments: () => {
          this.toggleComments();
        },
        onSetCover: async (base64) => {
          if (!base64) {
            window.showToast('Não foi possível capturar o frame do vídeo.');
            return;
          }
          await this.saveVideoCoverFrame(proj.id, vid.id, base64);
        },
        onResetCover: async () => {
          await this.resetVideoCoverFrame(proj.id, vid.id);
        }
      });
    }

    // Initialize Comments Controller
    const commentsMount = document.getElementById('commentsMount');
    this.commentsController = new window.CommentsController(commentsMount, proj, vid, this.playerInstance, {
      allowComments: isCommentsAllowed,
      onCountChange: (count, unresolvedCount) => {
        this.updateCommentsCount(count, unresolvedCount);
      },
      onCommentsUpdated: (comments) => {
        if (comments) this.data.comments = comments;
        this.renderSidebar();
      },
      onClose: () => {
        this.setCommentsVisibility(false);
      }
    });

    // Hidden by default as requested to provide maximum space for video player
    this.setCommentsVisibility(false);

    document.getElementById('btnHeaderSetCover')?.addEventListener('click', async () => {
      const curVid = this.selectedVideo || vid;
      if (!this.playerInstance || typeof this.playerInstance.captureCurrentFrame !== 'function') {
        window.showToast('Vídeo indisponível para captura.');
        return;
      }
      const base64 = this.playerInstance.captureCurrentFrame();
      if (!base64) {
        window.showToast('Não foi possível capturar o frame do vídeo.');
        return;
      }
      await this.saveVideoCoverFrame(proj.id, curVid.id, base64);
    });

    document.getElementById('btnHeaderResetCover')?.addEventListener('click', async () => {
      const curVid = this.selectedVideo || vid;
      await this.resetVideoCoverFrame(proj.id, curVid.id);
    });

    document.getElementById('btnEditMedia')?.addEventListener('click', () => {
      this.openEditMediaModal(this.selectedVideo || vid, proj);
    });

    document.getElementById('btnToggleComments')?.addEventListener('click', () => {
      this.toggleComments();
    });

    document.getElementById('btnPhotoToggleComments')?.addEventListener('click', () => {
      this.toggleComments();
    });

    document.getElementById('btnCopyVideoLink')?.addEventListener('click', () => {
      const curVid = this.selectedVideo || vid;
      const curCode = curVid.shortCode || curVid.id;
      const curClientUrl = `${window.location.origin}/${curCode}`;
      navigator.clipboard.writeText(curClientUrl);
      window.showToast(`Link copiado: .../${curCode}`);
    });

    const goBack = (targetFolderId = this.currentFolderId) => {
      if (this.playerInstance) {
        this.playerInstance.destroy();
        this.playerInstance = null;
      }
      this.cleanupPhotoFullscreen();
      this.selectedVideo = null;
      this.currentFolderId = targetFolderId;
      this.currentView = this.isClientMode ? 'client_gallery' : 'author';
      const targetFolderObj = folders.find(f => f.id === this.currentFolderId);
      const backUrl = this.isClientMode 
        ? `/${(targetFolderObj && targetFolderObj.shortCode) || (this.scopedFolderId && folders.find(f => f.id === this.scopedFolderId)?.shortCode) || proj.shortCode || proj.slug}` 
        : `/author?project=${proj.id}${this.currentFolderId ? `&folder=${encodeURIComponent(this.currentFolderId)}` : ''}`;
      window.history.pushState({}, '', backUrl);
      this.render();
    };

    document.getElementById('breadcrumbBackProject')?.addEventListener('click', () => goBack(this.scopedFolderId || null));
    document.getElementById('breadcrumbBackFolder')?.addEventListener('click', () => goBack(fileFolder ? fileFolder.id : (this.scopedFolderId || null)));
    document.getElementById('btnBackToGrid')?.addEventListener('click', () => goBack(fileFolder ? fileFolder.id : (this.scopedFolderId || this.currentFolderId)));
    container.querySelectorAll('.breadcrumb-folder-jump').forEach(link => {
      link.addEventListener('click', () => {
        const fid = link.getAttribute('data-folder-id');
        goBack(fid || this.scopedFolderId || null);
      });
    });
  }

  cleanupPhotoFullscreen() {
    if (this.photoKeyHandler) {
      window.removeEventListener('keydown', this.photoKeyHandler);
      this.photoKeyHandler = null;
    }
    if (this.photoFsHandler) {
      document.removeEventListener('fullscreenchange', this.photoFsHandler);
      document.removeEventListener('webkitfullscreenchange', this.photoFsHandler);
      this.photoFsHandler = null;
    }
  }

  getMediaContainerFolder(vid, proj = this.selectedProject) {
    if (!proj || !vid) return null;
    const folders = proj.folders || [];

    // 1. Check if vid has a specific driveFolderId or folderId belonging to a subfolder
    const targetFolderId = vid.driveFolderId || vid.folderId;
    if (targetFolderId && targetFolderId !== proj.driveFolderId) {
      const match = folders.find(f => f.id === targetFolderId);
      if (match) return match;
    }

    // 2. Check by vid's folderPath
    if (vid.folderPath && vid.folderPath.trim() !== '') {
      const match = folders.find(f => f.path === vid.folderPath || f.name === vid.folderPath);
      if (match) return match;
      return { id: targetFolderId || null, name: vid.folderPath.split('/').pop(), path: vid.folderPath };
    }

    // 3. Check by currentFolderId if valid and not root
    if (this.currentFolderId && this.currentFolderId !== proj.driveFolderId) {
      const match = folders.find(f => f.id === this.currentFolderId);
      if (match) return match;
    }

    // If driveFolderId is a subfolder ID not in folders list
    if (targetFolderId && targetFolderId !== proj.driveFolderId) {
      return { id: targetFolderId, name: 'Pasta', path: '' };
    }

    return null;
  }

  getPhotosInContainerFolder(vid, proj = this.selectedProject) {
    if (!proj || !proj.videos) return [];
    const allPhotos = proj.videos.filter(v => this.getItemType(v) === 'image');
    if (!vid) return allPhotos;

    const containerFolder = this.getMediaContainerFolder(vid, proj);

    if (containerFolder) {
      // Photo is inside a subfolder: restrict strictly to photos in this same subfolder
      return allPhotos.filter(p => {
        if (containerFolder.id) {
          if (p.driveFolderId && p.driveFolderId === containerFolder.id) return true;
          if (p.folderId && p.folderId === containerFolder.id) return true;
        }
        if (containerFolder.path) {
          if (p.folderPath && p.folderPath === containerFolder.path) return true;
        }
        return false;
      });
    }

    // Photo is in root folder: exclude any photo belonging to a subfolder
    const subfolderIds = new Set((proj.folders || []).map(f => f.id).filter(id => id && id !== proj.driveFolderId));
    return allPhotos.filter(p => {
      if (p.driveFolderId && subfolderIds.has(p.driveFolderId)) return false;
      if (p.folderId && subfolderIds.has(p.folderId)) return false;
      if (p.folderPath && p.folderPath.trim() !== '') return false;
      return true;
    });
  }

  navigatePhoto(direction) {
    if (this.isClientMode && this.isIsolatedFile) return;
    const proj = this.selectedProject;
    if (!proj || !proj.videos) return;
    const currentVid = this.selectedVideo;
    const photos = this.getPhotosInContainerFolder(currentVid, proj);
    if (photos.length <= 1) return;

    const currentIndex = photos.findIndex(p => p.id === currentVid?.id);
    if (currentIndex === -1) return;

    const targetIndex = (currentIndex + direction + photos.length) % photos.length;
    const targetPhoto = photos[targetIndex];
    this.switchPhoto(targetPhoto, targetIndex, photos.length);
  }

  switchPhoto(targetPhoto, targetIndex, totalPhotos) {
    this.selectedVideo = targetPhoto;
    const proj = this.selectedProject;

    // Update document title
    this.updateDocumentTitle();

    // Update history URL without reloading or breaking fullscreen state
    const scopeParam = (this.isClientMode && this.scopedFolderId) ? `&scope=${encodeURIComponent(this.scopedFolderId)}` : '';
    const folderQuery = this.currentFolderId ? `?folder=${encodeURIComponent(this.currentFolderId)}${scopeParam}` : (scopeParam ? `?${scopeParam.slice(1)}` : '');
    const authorFolderQuery = this.currentFolderId ? `&folder=${encodeURIComponent(this.currentFolderId)}` : '';
    const targetUrl = this.isClientMode 
      ? `/${targetPhoto.shortCode || targetPhoto.id}`
      : `/author?project=${proj.id}&video=${targetPhoto.id}${authorFolderQuery}`;
    window.history.replaceState({}, '', targetUrl);

    // If imgWrapper is not present in DOM, fallback to full render
    const imgWrapper = document.getElementById('customImageWrapper');
    if (!imgWrapper) {
      const mainContainer = document.getElementById('mainContentArea');
      if (mainContainer) this.renderPlayerDetailView(mainContainer);
      return;
    }

    // Update Breadcrumb header current title
    const breadcrumbCurrent = document.querySelector('.breadcrumb-current');
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = this.getDisplayTitle(targetPhoto);

    const isPsd = targetPhoto.subType === 'psd' || (targetPhoto.fileName && /\.psd$/i.test(targetPhoto.fileName));
    const isAi = targetPhoto.subType === 'ai' || (targetPhoto.fileName && /\.ai$/i.test(targetPhoto.fileName));
    const isDesign = isPsd || isAi;
    const downloadLabel = isPsd ? 'Baixar PSD' : (isAi ? 'Baixar AI' : 'Baixar Foto');
    const defaultExt = isPsd ? 'psd' : (isAi ? 'ai' : 'jpg');
    const downloadFileName = targetPhoto.fileName || `${targetPhoto.title}.${defaultExt}`;

    // Update Header download button
    const headerDl = document.getElementById('btnHeaderDownloadMedia');
    if (headerDl) {
      headerDl.href = `${targetPhoto.url}${targetPhoto.url.includes('?') ? '&' : '?'}download=1`;
      headerDl.download = downloadFileName;
    }

    // Update Photo Index Badge
    const indexBadge = document.getElementById('photoIndexBadge');
    if (indexBadge) {
      indexBadge.textContent = `${targetIndex + 1} / ${totalPhotos}`;
    }

    // Update Dimensions / Quality Badge
    const initialDims = targetPhoto.dimensions || (targetPhoto.resolution && targetPhoto.resolution.includes('x') ? targetPhoto.resolution : (isDesign ? (isPsd ? 'PSD' : 'AI') : ''));
    const badgeLabel = document.getElementById('photoQualityLabel');
    if (badgeLabel) badgeLabel.textContent = initialDims;

    // Update Toolbar download button
    const dlAction = document.getElementById('btnDownloadPhotoAction');
    if (dlAction) {
      dlAction.href = `${targetPhoto.url}${targetPhoto.url.includes('?') ? '&' : '?'}download=1`;
      dlAction.download = downloadFileName;
      dlAction.title = downloadLabel;
    }
    const dlText = document.getElementById('btnDownloadPhotoText');
    if (dlText) {
      const sz = this.formatFileSize(targetPhoto.size);
      dlText.textContent = `${downloadLabel} ${sz ? `(${sz})` : (initialDims && initialDims.includes('x') ? `(${initialDims})` : '')}`;
    }

    // Update Main Photo Element smoothly with loading spinner and race-condition protection
    const mainPhoto = document.getElementById('mainPhotoElement');
    if (mainPhoto) {
      const switchToken = (this._photoSwitchToken = (this._photoSwitchToken || 0) + 1);
      const isNonNativeWebImg = /\.(heic|heif|tif|tiff|bmp|raw|cr2|nef|arw|dng|psd|ai)$/i.test(targetPhoto.fileName || targetPhoto.title || '');
      const nextSrc = (isDesign || isNonNativeWebImg)
        ? (targetPhoto.previewUrl || (targetPhoto.driveFileId ? `/api/stream/preview?drive=${targetPhoto.driveFileId}&size=2048` : targetPhoto.url))
        : targetPhoto.url;

      imgWrapper.classList.add('is-loading-photo');
      mainPhoto.style.opacity = '0.55';
      mainPhoto.alt = targetPhoto.title;
      delete mainPhoto.dataset.retriedPreview;
      delete mainPhoto.dataset.retriedThumb;
      mainPhoto.src = nextSrc;

      const updateDims = () => {
        if (this._photoSwitchToken !== switchToken) return;
        imgWrapper.classList.remove('is-loading-photo');
        mainPhoto.style.opacity = '1';
        if (!mainPhoto.naturalWidth) return;
        const dims = `${mainPhoto.naturalWidth}x${mainPhoto.naturalHeight}`;
        if (badgeLabel && (!targetPhoto.dimensions || !badgeLabel.textContent.includes('x'))) {
          badgeLabel.textContent = isDesign ? `${(isPsd ? 'PSD' : 'AI')} • ${dims}` : dims;
        }
        if (dlText) {
          const sz = this.formatFileSize(targetPhoto.size);
          dlText.textContent = `${downloadLabel} ${sz ? `(${sz})` : `(${dims})`}`;
        }
      };

      mainPhoto.onerror = () => {
        if (this._photoSwitchToken !== switchToken) return;
        if (targetPhoto.driveFileId && !mainPhoto.dataset.retriedPreview) {
          mainPhoto.dataset.retriedPreview = '1';
          mainPhoto.src = `/api/stream/preview?drive=${targetPhoto.driveFileId}&size=1600`;
          return;
        }
        if (targetPhoto.thumbnailUrl && !mainPhoto.dataset.retriedThumb) {
          mainPhoto.dataset.retriedThumb = '1';
          mainPhoto.src = targetPhoto.thumbnailUrl;
          return;
        }
        imgWrapper.classList.remove('is-loading-photo');
        mainPhoto.style.opacity = '1';
      };

      if (mainPhoto.complete && mainPhoto.naturalWidth) {
        updateDims();
      } else {
        mainPhoto.onload = updateDims;
      }
    }

    // Update comments controller for the newly active photo
    if (this.commentsController && typeof this.commentsController.setVideo === 'function') {
      this.commentsController.setVideo(targetPhoto);
    }
  }

  setCommentsVisibility(visible) {
    this.commentsVisible = !!visible;
    const container = document.querySelector('.detail-view-container');
    const commentsMount = document.getElementById('commentsMount');
    const btnToggle = document.getElementById('btnToggleComments');
    const btnToggleText = document.getElementById('btnToggleCommentsText');
    const btnPhotoToggle = document.getElementById('btnPhotoToggleComments');
    const btnPhotoText = document.getElementById('btnPhotoToggleCommentsText');

    if (!container || !commentsMount) return;

    if (this.commentsVisible) {
      container.classList.remove('comments-hidden');
      container.classList.add('comments-visible');
      if (btnToggle) {
        btnToggle.classList.add('is-active');
        btnToggle.title = 'Ocultar comentários (expandir player)';
      }
      if (btnToggleText) {
        btnToggleText.textContent = 'Ocultar Comentários';
      }
      if (btnPhotoToggle) {
        btnPhotoToggle.classList.add('is-active');
      }
      if (btnPhotoText) {
        btnPhotoText.textContent = 'Ocultar Comentários';
      }
      if (this.playerInstance && typeof this.playerInstance.setCommentsActive === 'function') {
        this.playerInstance.setCommentsActive(true);
      }
      // On mobile view, smooth scroll to comments when opened
      if (window.innerWidth <= 1080) {
        setTimeout(() => {
          commentsMount.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      }
    } else {
      container.classList.add('comments-hidden');
      container.classList.remove('comments-visible');
      if (btnToggle) {
        btnToggle.classList.remove('is-active');
        btnToggle.title = 'Mostrar comentários';
      }
      if (btnToggleText) {
        btnToggleText.textContent = 'Comentários';
      }
      if (btnPhotoToggle) {
        btnPhotoToggle.classList.remove('is-active');
      }
      if (btnPhotoText) {
        btnPhotoText.textContent = 'Comentários';
      }
      if (this.playerInstance && typeof this.playerInstance.setCommentsActive === 'function') {
        this.playerInstance.setCommentsActive(false);
      }
    }
  }

  toggleComments() {
    this.setCommentsVisibility(!this.commentsVisible);
  }

  updateCommentsCount(count, unresolvedCount = 0) {
    const badges = [
      document.getElementById('btnToggleCommentsBadge'),
      document.getElementById('btnPhotoToggleCommentsBadge')
    ].filter(Boolean);

    badges.forEach(badge => {
      if (count > 0) {
        if (unresolvedCount > 0) {
          badge.textContent = unresolvedCount;
          badge.classList.add('has-unresolved');
          badge.title = `${unresolvedCount} comentário${unresolvedCount > 1 ? 's' : ''} a resolver (total: ${count})`;
        } else {
          badge.textContent = count;
          badge.classList.remove('has-unresolved');
          badge.title = `${count} comentário${count > 1 ? 's' : ''} (todos resolvidos)`;
        }
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
        badge.classList.remove('has-unresolved');
      }
    });
  }

  renderPasswordGate(gateContext = null) {
    const container = document.getElementById('mainContentArea');
    if (!container) return;

    const proj = this.selectedProject || {};
    const ctx = gateContext || {
      type: proj.lockedTargetType || 'project',
      targetName: proj.lockedTargetName || proj.title || '',
      folderId: proj.lockedFolderId || null,
      videoId: proj.lockedVideoId || null,
      shortCode: proj.shortCode || null,
      isRootGate: true
    };

    const isFileGate = ctx.type === 'file';
    const isFolderGate = ctx.type === 'folder';
    const cardTitle = isFileGate
      ? 'Arquivo Protegido'
      : (isFolderGate ? 'Pasta Protegida' : 'Entrega Protegida');
    const targetLabel = ctx.targetName ? ` "${this.escapeHtml(ctx.targetName)}"` : '';
    const cardDesc = isFileGate
      ? `Digite a senha fornecida pelo autor para acessar o arquivo${targetLabel}.`
      : (isFolderGate
        ? `Digite a senha fornecida pelo autor para abrir a pasta${targetLabel}.`
        : 'Digite a senha fornecida pelo autor para abrir o projeto.');
    const btnText = isFileGate
      ? 'Desbloquear Arquivo'
      : (isFolderGate ? 'Desbloquear Pasta' : 'Desbloquear Entrega');

    container.innerHTML = `
      <div class="password-gate-container">
        <div class="password-card">
          <div class="lock-icon-wrapper">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
          </div>
          <h2 class="password-card-title">${cardTitle}</h2>
          <p class="password-card-desc">${cardDesc}</p>
          
          <form id="passwordForm" style="display: flex; flex-direction: column; gap: 14px;">
            <input type="password" id="inputPassword" class="form-input" placeholder="Digite a senha de acesso" required autofocus>
            <div id="passwordError" style="color: var(--danger); font-size: 12px; display: none;">Senha incorreta. Tente novamente.</div>
            <button type="submit" class="btn-primary" style="justify-content: center; padding: 12px;">${btnText}</button>
            ${ctx.canGoBack ? `
              <button type="button" id="btnPasswordGateBack" class="btn-secondary" style="justify-content: center; padding: 10px;">Voltar</button>
            ` : ''}
          </form>
        </div>
      </div>
    `;

    document.getElementById('btnPasswordGateBack')?.addEventListener('click', () => {
      if (isFileGate) {
        this.selectedVideo = null;
        this.currentView = 'client_gallery';
        const folderObj = (proj.folders || []).find(f => f.id === (this.currentFolderId || this.scopedFolderId));
        const backCode = (folderObj && folderObj.shortCode) || proj.shortCode || proj.slug || '';
        window.history.pushState({}, '', `/${backCode}`);
        this.render();
      } else if (isFolderGate) {
        this.currentFolderId = ctx.parentFolderId || this.scopedFolderId || null;
        const folderObj = (proj.folders || []).find(f => f.id === this.currentFolderId);
        const backCode = (folderObj && folderObj.shortCode) || proj.shortCode || proj.slug || '';
        window.history.pushState({}, '', `/${backCode}`);
        this.render();
      }
    });

    document.getElementById('passwordForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pwd = document.getElementById('inputPassword').value.trim();
      const verifyPayload = {
        id: proj.id,
        projectId: proj.id,
        shortCode: ctx.shortCode || proj.shortCode,
        slug: proj.slug,
        folderId: ctx.folderId || null,
        videoId: ctx.videoId || null
      };
      const res = await window.API.verifyPassword(verifyPayload, pwd);
      if (res && res.verified) {
        const markUnlocked = (key) => {
          if (!key) return;
          const k = String(key);
          this.unlockedSlugs.add(k);
          this.unlockedSlugs.add(k.toLowerCase());
          if (!this.unlockedPasswords) this.unlockedPasswords = {};
          this.unlockedPasswords[k] = pwd;
          this.unlockedPasswords[k.toLowerCase()] = pwd;
        };

        if (ctx.isRootGate) {
          markUnlocked(proj.id);
          markUnlocked(proj.slug);
          markUnlocked(proj.shortCode);
        }
        markUnlocked(ctx.folderId);
        markUnlocked(ctx.videoId);
        markUnlocked(ctx.shortCode);
        markUnlocked(res.projectId && ctx.isRootGate ? res.projectId : null);
        markUnlocked(res.folderId);
        markUnlocked(res.videoId);
        markUnlocked(res.shortCode);

        const currentPath = window.location.pathname.replace(/^\/+/, '').split('/')[0];
        if (currentPath) {
          markUnlocked(currentPath);
        }

        if (!ctx.isRootGate) {
          const prevProjId = proj.id;
          const prevScopedFolderId = this.scopedFolderId;
          const prevCurrentFolderId = this.currentFolderId;
          const prevIsIsolatedFile = this.isIsolatedFile;
          const prevView = this.currentView;
          const prevVideoId = ctx.videoId || (this.selectedVideo && this.selectedVideo.id) || null;

          // Busca os dados usando o escopo raiz da sessão atual para não isolar o projeto em um único arquivo/subpasta
          const scopedFolderObj = prevScopedFolderId ? (proj.folders || []).find(f => f.id === prevScopedFolderId) : null;
          const rootCodeForFetch = (scopedFolderObj && scopedFolderObj.shortCode) || proj.shortCode || proj.slug || '';
          this._overrideDataCode = rootCodeForFetch || null;
          try {
            await this.fetchData();
          } finally {
            this._overrideDataCode = null;
          }

          const refreshedProj = (this.data.projects || []).find(p => p.id === prevProjId) || this.data.projects[0];
          if (refreshedProj) {
            this.selectedProject = refreshedProj;
            this.scopedFolderId = prevScopedFolderId;
            this.currentFolderId = prevCurrentFolderId;
            this.isIsolatedFile = prevIsIsolatedFile;
            this.currentView = prevView;
            if (prevVideoId) {
              this.selectedVideo = (refreshedProj.videos || []).find(v => v.id === prevVideoId) || null;
            }
          }
          this.render();
        } else {
          await this.fetchData();
          this.detectRoute();
          this.render();
        }
      } else {
        const errEl = document.getElementById('passwordError');
        if (errEl) errEl.style.display = 'block';
      }
    });
  }

  // Batch Download Helpers & Flow
  getDescendantFolderIds(proj, folderId) {
    const folders = proj.folders || [];
    const folderSet = new Set([folderId]);
    let added = true;
    while (added) {
      added = false;
      for (const f of folders) {
        if (folderSet.has(f.parentId) && !folderSet.has(f.id)) {
          folderSet.add(f.id);
          added = true;
        }
      }
    }
    return folderSet;
  }

  getItemsInCurrentLocation(proj) {
    const openFolderId = this.currentFolderId || (this.isClientMode && this.scopedFolderId ? this.scopedFolderId : null);

    if (openFolderId) {
      const folderSet = this.getDescendantFolderIds(proj, openFolderId);
      folderSet.add(openFolderId);
      return (proj.videos || []).filter(item => {
        const fid = item.driveFolderId || item.folderId;
        if (!fid && (!openFolderId || (proj.driveFolderId && openFolderId === proj.driveFolderId))) return true;
        return folderSet.has(fid);
      });
    }

    if (this.isClientMode && this.scopedFolderId) {
      const folderSet = this.getDescendantFolderIds(proj, this.scopedFolderId);
      folderSet.add(this.scopedFolderId);
      return (proj.videos || []).filter(item => {
        const fid = item.driveFolderId || item.folderId;
        return folderSet.has(fid);
      });
    }

    // Modo autor ou cliente na raiz completa: retorna todos os vídeos/arquivos do projeto
    return (proj.videos || []);
  }

  getSelectedItems(proj, currentLevelItems) {
    const hasMediaSelection = this.selectedMediaIds && this.selectedMediaIds.size > 0;
    const hasFolderSelection = this.selectedFolderIds && this.selectedFolderIds.size > 0;

    // Se o usuário clicar "Baixar em Lote" sem nada selecionado, considere tudo que está na pasta aberta naquele momento (serve para o cliente também)
    if (!hasMediaSelection && !hasFolderSelection) {
      if (this.gallerySearchQuery && this.gallerySearchQuery.trim()) {
        return currentLevelItems || [];
      }
      return this.getItemsInCurrentLocation(proj);
    }

    const itemsMap = new Map();

    // 1. Files explicitly selected
    if (hasMediaSelection) {
      (proj.videos || []).forEach(v => {
        if (this.selectedMediaIds.has(v.id)) {
          itemsMap.set(v.id, v);
        }
      });
    }

    // 2. Files inside selected subfolders (and nested subfolders)
    if (hasFolderSelection) {
      const allSelectedFolderIds = new Set();
      this.selectedFolderIds.forEach(fid => {
        const descendants = this.getDescendantFolderIds(proj, fid);
        allSelectedFolderIds.add(fid);
        descendants.forEach(id => allSelectedFolderIds.add(id));
      });

      (proj.videos || []).forEach(v => {
        const fid = v.driveFolderId || v.folderId;
        if (allSelectedFolderIds.has(fid)) {
          itemsMap.set(v.id, v);
        }
      });
    }

    let result = Array.from(itemsMap.values());

    // Se estiver em modo cliente com escopo restrito a uma subpasta, impede baixar arquivos de fora desse escopo
    if (this.isClientMode && this.scopedFolderId) {
      const allowedFolderIds = this.getDescendantFolderIds(proj, this.scopedFolderId);
      allowedFolderIds.add(this.scopedFolderId);
      result = result.filter(item => {
        const fid = item.driveFolderId || item.folderId;
        return allowedFolderIds.has(fid);
      });
    }

    return result;
  }

  downloadSingleFile(file) {
    if (!file || !file.url) {
      window.showToast('Arquivo indisponível para download', 'error');
      return;
    }
    let downloadUrl = `${file.url}${file.url.includes('?') ? '&' : '?'}download=1`;
    const proj = this.selectedProject || (this.data && this.data.projects ? this.data.projects.find(p => (p.videos || []).some(v => v.id === file.id)) : null);
    const pwd = (this.unlockedPasswords && (
      this.unlockedPasswords[file.id] ||
      (file.folderId && this.unlockedPasswords[file.folderId]) ||
      (file.driveFolderId && this.unlockedPasswords[file.driveFolderId]) ||
      (proj && (this.unlockedPasswords[proj.id] || this.unlockedPasswords[proj.slug]))
    )) || (proj && typeof proj.password === 'string' ? proj.password : '') || '';
    if (pwd && !downloadUrl.includes('pwd=')) {
      downloadUrl += `&pwd=${encodeURIComponent(pwd)}`;
    }

    const isImg = file.type === 'image';
    const isArch = file.type === 'archive';
    const isFl = file.type === 'file';
    let ext = this.getFileExtension(file) || '';
    if (ext.startsWith('.')) ext = ext.slice(1);
    if (!ext) {
      ext = isImg ? 'jpg' : ((isArch || isFl) ? (file.extension ? file.extension.replace('.', '') : (isArch ? 'zip' : 'file')) : 'mp4');
    }
    let fileName = file.fileName || file.title || 'arquivo';
    if (!fileName.toLowerCase().endsWith('.' + ext.toLowerCase())) {
      fileName = `${fileName}.${ext}`;
    }

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.showToast(`Iniciando download de "${fileName}"...`);
  }

  openBatchDownloadModal(proj, allItems, customTarget = null) {
    const modal = document.getElementById('modalBatchDownload');
    if (!modal) return;

    let targetItems = [];
    let displayProjectName = proj.name;
    let modalTitleFolder = null;
    let hasSelection = false;
    let targetFolderId = null;

    if (customTarget && customTarget.folder) {
      modalTitleFolder = customTarget.folder;
      displayProjectName = customTarget.folder.name;
      targetFolderId = customTarget.folder.id;
      const folderSet = this.getDescendantFolderIds(proj, customTarget.folder.id);
      folderSet.add(customTarget.folder.id);
      targetItems = (proj.videos || []).filter(item => {
        const fid = item.driveFolderId || item.folderId;
        return folderSet.has(fid);
      });
      if (this.isClientMode && this.scopedFolderId) {
        const allowedFolderIds = this.getDescendantFolderIds(proj, this.scopedFolderId);
        allowedFolderIds.add(this.scopedFolderId);
        targetItems = targetItems.filter(item => {
          const fid = item.driveFolderId || item.folderId;
          return allowedFolderIds.has(fid);
        });
      }
    } else if (customTarget && customTarget.project) {
      displayProjectName = customTarget.project.name;
      targetItems = customTarget.project.videos || [];
      if (this.isClientMode && this.scopedFolderId) {
        const allowedFolderIds = this.getDescendantFolderIds(proj, this.scopedFolderId);
        allowedFolderIds.add(this.scopedFolderId);
        targetItems = targetItems.filter(item => {
          const fid = item.driveFolderId || item.folderId;
          return allowedFolderIds.has(fid);
        });
      }
    } else {
      const isScoped = this.isClientMode && this.scopedFolderId;
      const scopedFolder = isScoped ? (proj.folders || []).find(f => f.id === this.scopedFolderId) : null;
      const currentFolder = this.currentFolderId ? (proj.folders || []).find(f => f.id === this.currentFolderId) : null;
      modalTitleFolder = currentFolder || scopedFolder;
      displayProjectName = modalTitleFolder ? modalTitleFolder.name : proj.name;

      hasSelection = (this.selectedMediaIds && this.selectedMediaIds.size > 0) || (this.selectedFolderIds && this.selectedFolderIds.size > 0);
      targetItems = this.getSelectedItems(proj, allItems);
      targetFolderId = this.currentFolderId || (this.isClientMode ? this.scopedFolderId : null);
    }

    if (targetItems.length === 0) {
      window.showToast(`Nenhum arquivo disponível para download ${modalTitleFolder ? 'nesta pasta' : 'neste diretório'}`);
      return;
    }

    const subtitleEl = document.getElementById('batchModalSubtitle');
    if (subtitleEl) subtitleEl.textContent = displayProjectName;

    const infoEl = document.getElementById('batchSelectionInfo');
    if (infoEl) {
      if (hasSelection) {
        const fCount = this.selectedFolderIds ? this.selectedFolderIds.size : 0;
        const mCount = this.selectedMediaIds ? this.selectedMediaIds.size : 0;
        const parts = [];
        if (fCount > 0) parts.push(`<strong>${fCount} pasta${fCount > 1 ? 's' : ''}</strong>`);
        if (mCount > 0) parts.push(`<strong>${mCount} arquivo${mCount > 1 ? 's' : ''}</strong>`);
        infoEl.innerHTML = `Preparando download de <strong>${targetItems.length} arquivo${targetItems.length > 1 ? 's' : ''}</strong> (${parts.join(' e ')} selecionad${(fCount + mCount) > 1 ? 'os' : 'o'}).`;
      } else {
        infoEl.innerHTML = `Preparando download de <strong>todos os ${targetItems.length} arquivos</strong> ${modalTitleFolder ? 'desta pasta' : 'deste diretório'}.`;
      }
    }

    // Reset progress area
    const progressEl = document.getElementById('batchDownloadProgress');
    const fillEl = document.getElementById('batchProgressFill');
    const statusEl = document.getElementById('batchProgressStatus');
    if (progressEl) progressEl.style.display = 'none';
    if (fillEl) fillEl.style.width = '0%';
    if (statusEl) statusEl.textContent = 'Iniciando...';

    modal.classList.add('open');

    // Option 1: .ZIP Download
    const btnZip = document.getElementById('btnOptionDownloadZip');
    if (btnZip) {
      btnZip.onclick = () => {
        let zipUrl = `/api/projects/${proj.id}/download-zip`;
        const params = [];
        if (hasSelection) {
          params.push(`items=${targetItems.map(i => i.id).join(',')}`);
          if (this.selectedFolderIds && this.selectedFolderIds.size > 0) {
            params.push(`folders=${Array.from(this.selectedFolderIds).join(',')}`);
          }
        } else if (!customTarget && this.gallerySearchQuery && this.gallerySearchQuery.trim()) {
          params.push(`items=${targetItems.map(i => i.id).join(',')}`);
        }
        if (targetFolderId) {
          params.push(`folder=${encodeURIComponent(targetFolderId)}`);
        }
        const pwd = (this.unlockedPasswords && (this.unlockedPasswords[proj.id] || this.unlockedPasswords[proj.slug]))
          || (typeof proj.password === 'string' ? proj.password : '')
          || '';
        if (pwd) {
          params.push(`pwd=${encodeURIComponent(pwd)}`);
        }
        if (params.length > 0) {
          zipUrl += `?${params.join('&')}`;
        }

        if (progressEl) progressEl.style.display = 'block';
        if (fillEl) fillEl.style.width = '100%';
        if (statusEl) statusEl.textContent = 'Compactando arquivos em .ZIP... O download iniciará automaticamente.';
        window.showToast('Compactando e iniciando download do .zip...');

        const a = document.createElement('a');
        a.href = zipUrl;
        a.download = `${displayProjectName}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setTimeout(() => {
          if (statusEl) statusEl.textContent = 'Arquivo .ZIP enviado ao navegador! Verifique o gerenciador de downloads.';
        }, 3000);
      };
    }

    // Option 2: Loose Files (direct save to photos on mobile / sequential download on PC/Mac)
    const btnLoose = document.getElementById('btnOptionDownloadLoose');
    if (btnLoose) {
      btnLoose.onclick = () => {
        this.downloadLooseFiles(proj, targetItems, modal);
      };
    }
  }

  async downloadLooseFiles(proj, targetItems, modal) {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(navigator.userAgent));
    const progressEl = document.getElementById('batchDownloadProgress');
    const fillEl = document.getElementById('batchProgressFill');
    const statusEl = document.getElementById('batchProgressStatus');

    if (progressEl) progressEl.style.display = 'block';

    const total = targetItems.length;

    // Mobile Web Share API option for saving directly to Photos / Gallery
    if (isMobile && navigator.canShare && typeof navigator.share === 'function') {
      try {
        if (statusEl) statusEl.textContent = 'Preparando arquivos para salvar no Fotos/Galeria...';
        const fileObjects = [];
        for (let i = 0; i < total; i++) {
          const item = targetItems[i];
          const streamUrl = `${item.url}${item.url.includes('?') ? '&' : '?'}download=1`;
          if (fillEl) fillEl.style.width = `${Math.round(((i + 1) / total) * 70)}%`;
          if (statusEl) statusEl.textContent = `Carregando ${i + 1} de ${total}: ${item.fileName || item.title}...`;

          const response = await fetch(streamUrl);
          if (!response.ok) throw new Error(`Falha ao obter arquivo ${item.fileName || item.title}`);
          const blob = await response.blob();
          const isImg = item.type === 'image' || (blob.type && blob.type.startsWith('image/'));
          const isVid = item.type === 'video' || (blob.type && blob.type.startsWith('video/'));
          const isArch = item.type === 'archive';
          const isFl = item.type === 'file';

          let ext = this.getFileExtension(item) || '';
          if (ext.startsWith('.')) ext = ext.slice(1);
          if (!ext) {
            ext = isImg ? 'jpg' : (isVid ? 'mp4' : ((isArch || isFl) ? (item.extension ? item.extension.replace('.', '') : (isArch ? 'zip' : 'file')) : 'mp4'));
          }

          let fileName = item.fileName || item.title || `arquivo_${i + 1}`;
          if (!fileName.toLowerCase().endsWith('.' + ext.toLowerCase())) {
            fileName = `${fileName}.${ext}`;
          }

          let mime = blob.type;
          const lowerName = fileName.toLowerCase();
          if (!mime || mime === 'application/octet-stream') {
            if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) mime = 'image/jpeg';
            else if (lowerName.endsWith('.png')) mime = 'image/png';
            else if (lowerName.endsWith('.webp')) mime = 'image/webp';
            else if (lowerName.endsWith('.gif')) mime = 'image/gif';
            else if (lowerName.endsWith('.mp4')) mime = 'video/mp4';
            else if (lowerName.endsWith('.mov')) mime = 'video/quicktime';
            else if (lowerName.endsWith('.mp3')) mime = 'audio/mpeg';
            else if (lowerName.endsWith('.pdf')) mime = 'application/pdf';
            else mime = isImg ? 'image/jpeg' : (isVid ? 'video/mp4' : 'application/octet-stream');
          }

          fileObjects.push(new File([blob], fileName, { type: mime, lastModified: Date.now() }));
        }

        let canShare = false;
        try {
          canShare = navigator.canShare({ files: fileObjects });
        } catch (e) {
          canShare = false;
        }

        if (canShare) {
          if (fillEl) fillEl.style.width = '100%';
          if (statusEl) statusEl.textContent = 'Toque em "Salvar Imagens / Vídeos" na janela para salvar no Fotos/Galeria!';
          await navigator.share({
            files: fileObjects,
            title: proj.name || 'Fotos'
          });
          window.showToast('Salvo com sucesso no Fotos/Galeria!');
          if (modal) {
            setTimeout(() => modal.classList.remove('open'), 1500);
          }
          return;
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          if (statusEl) statusEl.textContent = 'Ação cancelada pelo usuário.';
          return;
        }
        console.warn('Web Share API não concluiu, usando download direto:', err);
      }
    }

    // Direct sequential downloads (PC, Mac, and Mobile fallback)
    for (let i = 0; i < total; i++) {
      const item = targetItems[i];
      const streamUrl = `${item.url}${item.url.includes('?') ? '&' : '?'}download=1`;
      const isImg = item.type === 'image';
      const isArch = item.type === 'archive';
      const isFl = item.type === 'file';
      let ext = this.getFileExtension(item) || '';
      if (ext.startsWith('.')) ext = ext.slice(1);
      if (!ext) {
        ext = isImg ? 'jpg' : ((isArch || isFl) ? (item.extension ? item.extension.replace('.', '') : (isArch ? 'zip' : 'file')) : 'mp4');
      }
      let fileName = item.fileName || item.title || `arquivo_${i + 1}`;
      if (!fileName.toLowerCase().endsWith('.' + ext.toLowerCase())) {
        fileName = `${fileName}.${ext}`;
      }

      if (fillEl) fillEl.style.width = `${Math.round(((i + 1) / total) * 100)}%`;
      if (statusEl) statusEl.textContent = `Baixando ${i + 1} de ${total}: ${fileName}...`;

      try {
        const res = await fetch(streamUrl);
        if (res.ok) {
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
        } else {
          const link = document.createElement('a');
          link.href = streamUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (err) {
        const link = document.createElement('a');
        link.href = streamUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      if (i < total - 1) {
        await new Promise(r => setTimeout(r, 600));
      }
    }

    if (fillEl) fillEl.style.width = '100%';
    if (statusEl) statusEl.textContent = `Download de ${total} arquivo${total > 1 ? 's' : ''} concluído!`;
    window.showToast(`${total} arquivo${total > 1 ? 's' : ''} baixado${total > 1 ? 's' : ''}!`);
    setTimeout(() => {
      if (modal) modal.classList.remove('open');
    }, 2000);
  }

  // Modals & User Actions
  openManageCategoriesModal(openPaletteForCatId = null) {
    const modal = document.getElementById('modalManageCategories');
    const listContainer = document.getElementById('categoryManageList');
    if (!modal || !listContainer) return;

    modal.classList.add('open');

    const categories = this.getCategories();
    const allProjects = this.data.projects || [];
    const activeProjects = allProjects.filter(p => !p.archived);
    const defaultCatName = (categories[0] && categories[0].name) || 'Categoria Padrão';

    listContainer.innerHTML = categories.map(cat => {
      const activeCount = activeProjects.filter(p => (p.category || defaultCatName) === cat.name).length;
      const canDelete = categories.length > 1;
      const isDefault = !cat.color || cat.color.toLowerCase() === '#ff5400';
      const curColorHex = cat.color || '#FF5400';
      const colorObj = CATEGORY_COLORS.find(c => c.hex.toLowerCase() === curColorHex.toLowerCase());
      const catColorName = colorObj ? colorObj.name : 'Padrão';
      const isOpenPalette = openPaletteForCatId === cat.id;

      return `
        <div class="category-manage-item ${isOpenPalette ? 'palette-open' : ''}" data-cat-id="${cat.id}">
          <div class="category-manage-row" data-cat-id="${cat.id}">
            <button type="button" class="category-manage-color-btn ${isOpenPalette ? 'active' : ''}" data-cat-id="${cat.id}" title="Alterar cor da categoria ${cat.name} (${catColorName})">
              <span class="cat-tag-badge" style="background-color: ${curColorHex};">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffffff"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>
              </span>
              <span class="category-color-chevron">▼</span>
            </button>
            <input type="text" class="category-manage-input" value="${cat.name}" data-id="${cat.id}" data-original="${cat.name}" placeholder="Nome da categoria" title="Clique para editar o nome" />
            <span class="category-manage-badge">${activeCount} diretório${activeCount !== 1 ? 's' : ''}</span>
            <div class="category-manage-actions">
              <button class="category-action-btn btn-delete-cat" data-id="${cat.id}" data-name="${cat.name}" data-count="${activeCount}" title="${canDelete ? 'Excluir categoria' : 'A única categoria do sistema não pode ser excluída'}" ${!canDelete ? 'disabled' : ''}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Inline Color Palette Drawer -->
          <div class="category-inline-palette ${isOpenPalette ? 'open' : ''}" id="catPalette_${cat.id}">
            <div class="category-palette-inner">
              <div class="category-palette-header">
                <span class="category-palette-title">Cor da Categoria</span>
                <span class="cat-palette-hover-name" id="paletteHover_${cat.id}">${catColorName}</span>
              </div>
              <div class="category-palette-swatches">
                <button type="button" class="category-palette-default-btn ${isDefault ? 'selected' : ''}" data-cat-id="${cat.id}" data-color="#FF5400" data-name="Padrão" title="Padrão (Identidade)">
                  <span class="swatch-circle" style="background-color: #FF5400;"></span>
                  <span>Padrão</span>
                  ${isDefault ? '<span class="swatch-check">✓</span>' : ''}
                </button>
                <div class="category-palette-grid">
                  ${CATEGORY_COLORS.slice(1).map(c => {
                    const isSelected = !isDefault && cat.color && cat.color.toLowerCase() === c.hex.toLowerCase();
                    return `
                      <button type="button" class="cat-palette-swatch ${isSelected ? 'selected' : ''}" 
                              data-cat-id="${cat.id}" 
                              data-color="${c.hex}" 
                              data-name="${c.name}"
                              title="${c.name}"
                              style="background-color: ${c.hex};">
                        ${isSelected ? '<span class="swatch-mini-check">✓</span>' : ''}
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    listContainer.querySelectorAll('.category-manage-item').forEach(item => {
      const row = item.querySelector('.category-manage-row');
      const input = item.querySelector('.category-manage-input');
      const btnDelete = item.querySelector('.btn-delete-cat');
      const catColorBtn = item.querySelector('.category-manage-color-btn');
      const palette = item.querySelector('.category-inline-palette');
      const hoverLabel = item.querySelector('.cat-palette-hover-name');
      const rowCatId = row.getAttribute('data-cat-id');

      // Toggle inline palette on clicking color badge
      catColorBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = palette?.classList.contains('open');
        listContainer.querySelectorAll('.category-inline-palette').forEach(p => p.classList.remove('open'));
        listContainer.querySelectorAll('.category-manage-item').forEach(it => it.classList.remove('palette-open'));
        listContainer.querySelectorAll('.category-manage-color-btn').forEach(b => b.classList.remove('active'));
        if (!isOpen && palette) {
          palette.classList.add('open');
          item.classList.add('palette-open');
          catColorBtn.classList.add('active');
        }
      });

      // Swatch hover names
      palette?.querySelectorAll('.cat-palette-swatch, .category-palette-default-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
          const name = btn.getAttribute('data-name');
          if (hoverLabel && name) hoverLabel.textContent = name;
        });
      });

      palette?.querySelector('.category-palette-grid')?.addEventListener('mouseleave', () => {
        if (hoverLabel) {
          const cat = categories.find(c => c.id === rowCatId);
          const curHex = (cat && cat.color) || '#FF5400';
          const found = CATEGORY_COLORS.find(c => c.hex.toLowerCase() === curHex.toLowerCase());
          hoverLabel.textContent = found ? found.name : 'Padrão';
        }
      });

      // Swatch click -> set color immediately
      palette?.querySelectorAll('.cat-palette-swatch, .category-palette-default-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const hex = btn.getAttribute('data-color');
          await this.selectCategoryColor(rowCatId, hex);
        });
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleDoneManageCategories();
        }
      });

      btnDelete?.addEventListener('click', async () => {
        const catId = btnDelete.getAttribute('data-id');
        const catName = btnDelete.getAttribute('data-name');
        const activeCount = parseInt(btnDelete.getAttribute('data-count') || '0', 10);

        let msg = `Tem certeza de que deseja excluir a categoria "${catName}"?`;
        if (activeCount > 0) {
          msg += `\n\n⚠️ ATENÇÃO: Os ${activeCount} diretório(s) ativos desta categoria serão movidos para o ARQUIVO.\n(Caso você restaure um diretório no futuro, esta categoria será recriada automaticamente junto).`;
        }

        if (!confirm(msg)) return;

        try {
          const res = await window.API.deleteCategory(catId);
          if (res && res.categories) this.data.categories = res.categories;
          if (this.lobbyCategoryFilter === catName) {
            this.lobbyCategoryFilter = 'all';
          }
          if (this.sidebarCollapsedCategories) {
            if (this.sidebarCollapsedCategories.has(catName)) {
              this.sidebarCollapsedCategories.delete(catName);
              this.saveCollapsedCategories();
            }
          }
          await this.fetchData();
          this.populateCategorySelects();
          this.render();
          this.openManageCategoriesModal();
          const countMsg = res.archivedCount > 0 ? ` (${res.archivedCount} diretório${res.archivedCount > 1 ? 's movidos' : ' movido'} para o Arquivo)` : '';
          window.showToast(`Categoria "${res.removedName}" excluída com sucesso!${countMsg}`);
        } catch (err) {
          window.showToast(err.message || 'Erro ao excluir categoria', 'error');
        }
      });
    });

    modal.classList.add('open');
  }

  async handleDoneManageCategories() {
    const modal = document.getElementById('modalManageCategories');
    const listContainer = document.getElementById('categoryManageList');
    if (!modal || !listContainer) return;

    const inputs = Array.from(listContainer.querySelectorAll('.category-manage-input'));
    const changed = [];

    for (const input of inputs) {
      const catId = input.getAttribute('data-id');
      const original = input.getAttribute('data-original');
      const newName = input.value.trim();

      if (!newName) {
        window.showToast('O nome da categoria não pode ficar vazio', 'error');
        input.focus();
        return;
      }

      if (newName !== original) {
        changed.push({ catId, original, newName, input });
      }
    }

    const doneBtn = document.getElementById('btnManageCategoriesDone');
    if (changed.length > 0) {
      if (doneBtn) {
        doneBtn.disabled = true;
        doneBtn.textContent = 'Salvando...';
      }

      try {
        for (const item of changed) {
          const res = await window.API.renameCategory(item.catId, item.newName);
          if (res && res.categories) this.data.categories = res.categories;
          item.input.setAttribute('data-original', item.newName);
          if (this.lobbyCategoryFilter === item.original) {
            this.lobbyCategoryFilter = item.newName;
          }
          if (this.sidebarCollapsedCategories) {
            if (this.sidebarCollapsedCategories.has(item.original)) {
              this.sidebarCollapsedCategories.delete(item.original);
              this.sidebarCollapsedCategories.add(item.newName);
              this.saveCollapsedCategories();
            }
          }
        }

        await this.fetchData();
        this.populateCategorySelects();
        this.render();

        if (changed.length === 1) {
          window.showToast(`Categoria renomeada para "${changed[0].newName}"! ✓`);
        } else {
          window.showToast(`${changed.length} categorias atualizadas com sucesso! ✓`);
        }
      } catch (err) {
        console.error(err);
        window.showToast(err.message || 'Erro ao renomear categoria', 'error');
        if (doneBtn) {
          doneBtn.disabled = false;
          doneBtn.textContent = 'Concluir';
        }
        return;
      } finally {
        if (doneBtn) {
          doneBtn.disabled = false;
          doneBtn.textContent = 'Concluir';
        }
      }
    }

    modal.classList.remove('open');
  }

  async handleFilesUpload(files, targetFolderId, targetFolderName, optionalProj = null) {
    if (!files || files.length === 0) return;
    if (this.isClientMode) return; // Strict safety guarantee

    const proj = optionalProj || this.selectedProject;
    if (!proj) return;

    const fileList = Array.from(files);
    const totalFiles = fileList.length;

    // Criar modal de progresso de upload
    let progressModal = document.getElementById('uploadProgressModal');
    if (!progressModal) {
      progressModal = document.createElement('div');
      progressModal.id = 'uploadProgressModal';
      progressModal.className = 'upload-progress-overlay visible';
      document.body.appendChild(progressModal);
    } else {
      progressModal.className = 'upload-progress-overlay visible';
    }

    const safeFolderName = String(targetFolderName || proj.name || 'Pasta').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    progressModal.innerHTML = `
      <div class="upload-progress-card">
        <div class="upload-progress-header">
          <div class="upload-progress-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>
          </div>
          <div class="upload-progress-header-text">
            <h4 class="upload-progress-title">Enviando para o Google Drive</h4>
            <span class="upload-progress-sub">Pasta: <strong>${safeFolderName}</strong></span>
          </div>
        </div>
        <div class="upload-progress-body">
          <div class="upload-current-file">
            <span class="upload-file-name" id="upCurrentName">Preparando...</span>
            <span class="upload-file-pct" id="upCurrentPct">0%</span>
          </div>
          <div class="upload-bar-track">
            <div class="upload-bar-thumb" id="upBarThumb" style="width: 0%;"></div>
          </div>
          <div class="upload-footer-stats">
            <span id="upFileCounter">Arquivo 1 de ${totalFiles}</span>
            <span id="upTransferRate">Enviando direto para seu Drive</span>
          </div>
        </div>
      </div>
    `;

    const elName = document.getElementById('upCurrentName');
    const elPct = document.getElementById('upCurrentPct');
    const elThumb = document.getElementById('upBarThumb');
    const elCounter = document.getElementById('upFileCounter');

    const successfulItems = [];
    const uploadErrors = [];

    for (let i = 0; i < totalFiles; i++) {
      const file = fileList[i];
      if (elName) elName.textContent = file.name;
      if (elCounter) elCounter.textContent = `Arquivo ${i + 1} de ${totalFiles}`;
      if (elPct) elPct.textContent = '0%';
      if (elThumb) elThumb.style.width = '0%';

      try {
        const res = await window.API.uploadFile(
          proj.id,
          targetFolderId,
          file,
          (percent) => {
            if (elPct) elPct.textContent = `${percent}%`;
            if (elThumb) elThumb.style.width = `${percent}%`;
          }
        );

        if (res.items && res.items.length > 0) {
          res.items.forEach(it => {
            successfulItems.push(it);
            proj.videos = proj.videos || [];
            const idx = proj.videos.findIndex(v => v.driveFileId === it.driveFileId);
            if (idx >= 0) proj.videos[idx] = it;
            else proj.videos.unshift(it);
          });
        } else if (res.item) {
          successfulItems.push(res.item);
          proj.videos = proj.videos || [];
          const idx = proj.videos.findIndex(v => v.driveFileId === res.item.driveFileId);
          if (idx >= 0) proj.videos[idx] = res.item;
          else proj.videos.unshift(res.item);
        }
      } catch (err) {
        console.error('Erro ao enviar arquivo:', file.name, err);
        uploadErrors.push({ file: file.name, error: err.message, code: err.code });
      }
    }

    if (progressModal) {
      progressModal.remove();
    }

    if (uploadErrors.length > 0) {
      const hasPermError = uploadErrors.some(e => e.code === 'DRIVE_INSUFFICIENT_PERMISSIONS' || (e.error && e.error.includes('Permissão')));
      if (hasPermError) {
        alert(
          'Permissão de escrita insuficiente no Google Drive!\n\n' +
          'Como os uploads agora são permitidos, por favor reconecte sua conta do Google Drive clicando em "Conectar Google Drive" ou fazendo login novamente com Google para conceder a permissão de envio.'
        );
      } else {
        alert(`Ocorreu um erro ao enviar ${uploadErrors.length} arquivo(s):\n` + uploadErrors.map(e => `• ${e.file}: ${e.error}`).join('\n'));
      }
    }

    if (successfulItems.length > 0) {
      window.showToast(
        successfulItems.length === 1
          ? `Arquivo "${successfulItems[0].title}" enviado com sucesso para o Google Drive!`
          : `${successfulItems.length} arquivos enviados com sucesso para o Google Drive!`
      );
      try {
        await this.fetchData();
        if (this.selectedProject && proj && this.selectedProject.id === proj.id) {
          this.selectedProject = (this.data.projects || []).find(p => p.id === proj.id) || null;
        }
      } catch (_) {}
      this.render();
    }
  }

  detectCloudProvider(url) {
    if (!url) return 'google';
    const str = String(url).trim().toLowerCase();
    if (str.includes('dropbox.com') || str.includes('dl.dropboxusercontent.com')) return 'dropbox';
    if (str.includes('1drv.ms') || str.includes('onedrive.live.com') || str.includes('sharepoint.com')) return 'onedrive';
    if (str.includes('box.com') || str.includes('app.box.com')) return 'box';
    if (str.includes('icloud.com') || str.includes('share.icloud.com')) return 'icloud';
    return 'google';
  }

  isLinkAFile(url) {
    if (!url) return false;
    const str = String(url).trim().toLowerCase();
    if (str.includes('/file/d/')) return true;
    if (str.includes('/scl/fi/') || /\.(mp4|mov|mkv|webm|m4v|avi|mp3|wav|aac|flac|m4a|ogg|jpg|jpeg|png|webp|gif|svg|pdf|zip|rar|7z|doc|docx|xls|xlsx|psd|ai)(\?.*)?$/i.test(str)) {
      return true;
    }
    if (str.includes('/file/')) return true;
    return false;
  }

  getCloudProviderBadgeHtml(provider, isFile = false) {
    const fileSuffix = isFile ? ' • Arquivo' : '';
    switch (provider) {
      case 'dropbox':
        return `
          <div class="provider-detection-badge" id="newProjProviderBadge" title="Dropbox${fileSuffix}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 1.807L0 5.629l6 3.822 6.001-3.822L6 1.807zM18 1.807l-6 3.822 6 3.822 6-3.822-6-3.822zM0 13.274l6 3.822 6.001-3.822L6 9.452l-6 3.822zM18 9.452l-6 3.822 6 3.822 6-3.822-6-3.822zM6 18.371l6.001 3.822 6-3.822-6-3.822L6 18.371z"/></svg>
          </div>`;
      case 'onedrive':
        return `
          <div class="provider-detection-badge" id="newProjProviderBadge" title="OneDrive${fileSuffix}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>
          </div>`;
      case 'box':
        return `
          <div class="provider-detection-badge" id="newProjProviderBadge" title="Box${fileSuffix}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.003 2.164L2.4 8.067v7.866l9.603 5.903 9.597-5.903V8.067l-9.597-5.903zm-1.2 13.916l-6.4-3.937 6.4-3.938v7.875zm2.4 0V8.205l6.4 3.938-6.4 3.937z"/></svg>
          </div>`;
      case 'icloud':
        return `
          <div class="provider-detection-badge" id="newProjProviderBadge" title="iCloud Drive${fileSuffix}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13.762 4.29a6.51 6.51 0 0 0-5.669 3.332 3.571 3.571 0 0 0-1.558-.36 3.571 3.571 0 0 0-3.516 3A4.918 4.918 0 0 0 0 14.796a4.918 4.918 0 0 0 4.92 4.914 4.93 4.93 0 0 0 .617-.045h14.42c2.305-.272 4.041-2.258 4.043-4.589v-.009a4.594 4.594 0 0 0-3.727-4.508 6.51 6.51 0 0 0-6.511-6.27z"/></svg>
          </div>`;
      case 'google':
      default:
        return `
          <div class="provider-detection-badge" id="newProjProviderBadge" title="Google Drive${fileSuffix}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.01 1.485c-2.082 0-3.754.02-3.743.047.01.02 1.708 3.001 3.774 6.62l3.76 6.574h3.76c2.081 0 3.753-.02 3.742-.047-.005-.02-1.708-3.001-3.775-6.62l-3.76-6.574zm-4.76 1.73a789.828 789.861 0 0 0-3.63 6.319L0 15.868l1.89 3.298 1.885 3.297 3.62-6.335 3.618-6.33-1.88-3.287C8.1 4.704 7.255 3.22 7.25 3.214zm2.259 12.653-.203.348c-.114.198-.96 1.672-1.88 3.287a423.93 423.948 0 0 1-1.698 2.97c-.01.026 3.24.042 7.222.042h7.244l1.796-3.157c.992-1.734 1.85-3.23 1.906-3.323l.104-.167h-7.249z"/></svg>
          </div>`;
    }
  }

  getProviderDisplayInfo(provider) {
    switch (provider) {
      case 'dropbox':
        return {
          name: 'Dropbox',
          color: '#0061FF',
          bg: 'rgba(0, 97, 255, 0.12)',
          description: 'Integração de pastas e arquivos via API oficial ou links compartilhados do Dropbox.',
          iconSvg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="#0061FF"><path d="M6 2l6 4-6 4-6-4 6-4zm12 0l6 4-6 4-6-4 6-4zM0 14l6-4 6 4-6 4-6-4zm24 0l-6-4-6 4 6 4 6-4zM6 19.5l6-4 6 4-6 4-6-4z"/></svg>`
        };
      case 'onedrive':
        return {
          name: 'Microsoft OneDrive',
          color: '#0078D4',
          bg: 'rgba(0, 120, 212, 0.12)',
          description: 'Conecte pastas do Microsoft 365, OneDrive pessoal ou SharePoint corporativo.',
          iconSvg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="#0078D4"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>`
        };
      case 'box':
        return {
          name: 'Box',
          color: '#0061D5',
          bg: 'rgba(0, 97, 213, 0.12)',
          description: 'Espelhamento de diretórios em nuvem corporativa e fluxos de trabalho Box.',
          iconSvg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="#0061D5"><path d="M12.003 2.164L2.4 8.067v7.866l9.603 5.903 9.597-5.903V8.067l-9.597-5.903zm-1.2 13.916l-6.4-3.937 6.4-3.938v7.875zm2.4 0V8.205l6.4 3.938-6.4 3.937z"/></svg>`
        };
      case 'icloud':
        return {
          name: 'iCloud Drive',
          color: '#0070c9',
          bg: 'rgba(0, 112, 201, 0.12)',
          description: 'Reconhecimento de links de compartilhamento nativos do Apple iCloud Drive.',
          iconSvg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="#0070c9"><path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95A5.5 5.5 0 0 1 12 6c2.53 0 4.71 1.7 5.32 4.19l.34 1.39 1.41.25C20.44 12.07 21 13.2 21 14.5c0 1.93-1.57 3.5-3.5 3.5z"/></svg>`
        };
      case 'google':
      default:
        return {
          name: 'Google Drive',
          color: '#4285F4',
          bg: 'rgba(66, 133, 244, 0.12)',
          description: 'Armazenamento Google Drive padrão ou conta secundária conectada.',
          iconSvg: `<svg width="22" height="22" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>`
        };
    }
  }

  async openManageAccountsModal() {
    const modal = document.getElementById('modalManageAccounts');
    if (!modal) return;
    modal.classList.add('open');

    // Primary account info
    const primaryNameEl = document.getElementById('primaryAccountEmail');
    if (primaryNameEl) {
      primaryNameEl.textContent = this.author?.name || this.author?.email || 'Google Drive Principal';
    }

    // Bind provider selection cards in modal
    modal.querySelectorAll('.cloud-provider-card').forEach(card => {
      card.onclick = () => {
        const provider = card.getAttribute('data-provider');
        this.openConnectAccountModal(provider);
      };
    });

    // Render other connected accounts
    const listContainer = document.getElementById('connectedAccountsList');
    if (listContainer) {
      listContainer.innerHTML = '<div style="font-size: 12px; color: var(--text-tertiary); padding: 8px;">Carregando contas...</div>';
      try {
        const data = await API.getAccounts();
        const accounts = (data && data.accounts) || [];
        if (accounts.length === 0) {
          listContainer.innerHTML = `
            <div class="accounts-empty-state">
              Nenhuma conta adicional conectada ainda. Você pode adicionar contas abaixo.
            </div>
          `;
        } else {
          listContainer.innerHTML = accounts.map(acc => {
            const label = this.getProviderDisplayInfo(acc.provider);
            const dateStr = acc.connectedAt ? new Date(acc.connectedAt).toLocaleDateString('pt-BR') : '';
            return `
              <div class="connected-account-card" data-account-id="${acc.id}">
                <div class="account-card-left">
                  <div class="account-provider-icon" style="background: ${label.bg}; color: ${label.color};">
                    ${label.iconSvg}
                  </div>
                  <div class="account-card-info">
                    <div class="account-card-name">${this.escapeHtml(acc.name)}</div>
                    <div class="account-card-meta">${this.escapeHtml(acc.email || label.name)} • Conectada em ${dateStr}</div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="account-card-badge status-connected">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                    <span>Conectada</span>
                  </span>
                  <button type="button" class="btn-disconnect-account" data-id="${acc.id}" title="Desconectar esta conta">
                    Desconectar
                  </button>
                </div>
              </div>
            `;
          }).join('');

          // Bind disconnect buttons
          listContainer.querySelectorAll('.btn-disconnect-account').forEach(btn => {
            btn.addEventListener('click', async (e) => {
              e.stopPropagation();
              const accId = btn.getAttribute('data-id');
              if (!confirm('Deseja realmente desconectar esta conta de armazenamento?')) return;
              try {
                await API.removeAccount(accId);
                window.showToast('Conta desconectada com sucesso.');
                this.openManageAccountsModal();
              } catch (err) {
                alert('Erro ao desconectar conta: ' + err.message);
              }
            });
          });
        }
      } catch (err) {
        listContainer.innerHTML = `
          <div class="accounts-empty-state">
            Nenhuma conta adicional conectada ainda. Você pode adicionar contas abaixo.
          </div>
        `;
      }
    }
  }

  openConnectAccountModal(provider) {
    const modal = document.getElementById('modalConnectAccount');
    if (!modal) return;

    const manageModal = document.getElementById('modalManageAccounts');
    if (manageModal) manageModal.classList.remove('open');

    const providerInfo = this.getProviderDisplayInfo(provider);
    const titleEl = document.getElementById('connectModalTitle');
    const heroEl = document.getElementById('connectProviderHero');
    const inputProvider = document.getElementById('connectProvider');
    const inputName = document.getElementById('connectAccountName');
    const inputEmail = document.getElementById('connectAccountEmail');
    const inputCred = document.getElementById('connectCredentialValue');
    const labelCred = document.getElementById('connectCredentialLabel');
    const hintCred = document.getElementById('connectCredentialHint');

    if (inputProvider) inputProvider.value = provider;
    if (titleEl) titleEl.textContent = `Conectar ${providerInfo.name}`;
    if (inputName) inputName.value = `${providerInfo.name} ${this.author?.name ? '(' + this.author.name + ')' : ''}`.trim();
    if (inputEmail) inputEmail.value = '';
    if (inputCred) inputCred.value = '';

    if (heroEl) {
      heroEl.innerHTML = `
        <div class="connect-hero-icon" style="background: ${providerInfo.bg}; color: ${providerInfo.color};">
          ${providerInfo.iconSvg}
        </div>
        <div class="connect-hero-info">
          <div class="connect-hero-title">${providerInfo.name}</div>
          <div class="connect-hero-desc">${providerInfo.description}</div>
        </div>
      `;
    }

    if (labelCred && hintCred) {
      if (provider === 'dropbox') {
        labelCred.textContent = 'Token de Acesso Dropbox (Opcional se usar links públicos)';
        hintCred.textContent = 'Para acesso a pastas privadas e upload automático, insira um Generated Access Token do Dropbox Developer Console. Para pastas já compartilhadas com link direto, este campo é opcional.';
      } else if (provider === 'onedrive') {
        labelCred.textContent = 'Token de Acesso Microsoft Graph / OneDrive (Opcional)';
        hintCred.textContent = 'Permite espelhar pastas do seu OneDrive ou SharePoint corporativo. Para pastas compartilhadas públicas, você pode criar diretórios diretamente colando o link.';
      } else if (provider === 'box') {
        labelCred.textContent = 'Developer Token Box (Opcional para links públicos)';
        hintCred.textContent = 'Insira o token de desenvolvedor gerado no portal Box Developers para integração total.';
      } else if (provider === 'icloud') {
        labelCred.textContent = 'Chave / Link de Pasta iCloud Drive';
        hintCred.textContent = 'Cole o link compartilhado da pasta no iCloud ou a chave de acesso.';
      } else if (provider === 'google') {
        labelCred.textContent = 'ID da Pasta ou Credencial de Acesso';
        hintCred.textContent = 'Permite conectar uma segunda conta Google ou pasta compartilhada entre organizações.';
      }
    }

    modal.classList.add('open');
  }

  openAddDirectoryModal(defaultCat = null, defaultDiv = null) {
    const modal = document.getElementById('modalAddDirectory');
    if (!modal) return;

    const defaultCategory = defaultCat || this.getActiveCategoryName();
    this.populateCategorySelects(defaultCategory, null, defaultDiv, null);
    this.updateBrandElements();

    const inputName = document.getElementById('newProjName');
    const inputClient = document.getElementById('newProjClient');
    const inputDrive = document.getElementById('newProjDrive');
    const inputPassword = document.getElementById('newProjPassword');
    const checkComments = document.getElementById('newProjAllowComments');
    const checkHideBrand = document.getElementById('newProjHideBrand');
    const checkAllowShare = document.getElementById('newProjAllowShare');
    if (inputName) {
      inputName.value = '';
      inputName.placeholder = 'Ex: 261024-SIGEM-NOME DO PROJETO';
    }
    if (inputClient) inputClient.value = '';
    if (inputDrive) inputDrive.value = '';
    if (inputPassword) inputPassword.value = '';
    if (checkComments) checkComments.checked = true;
    if (checkHideBrand) checkHideBrand.checked = true;
    if (checkAllowShare) checkAllowShare.checked = true;

    // Reset Title, Labels and Provider Badge to Google Drive default
    const titleEl = document.getElementById('titleModalAddDirectory');
    if (titleEl) titleEl.textContent = 'Novo Diretório';
    const labelName = document.getElementById('labelNewProjName');
    if (labelName) labelName.textContent = 'Nome do Projeto';
    const labelDrive = document.getElementById('labelNewProjDrive');
    if (labelDrive) labelDrive.textContent = 'Link (Google Drive, Dropbox, OneDrive, Box, iCloud)';

    const badge = document.getElementById('newProjProviderBadge');
    if (badge) {
      const dummy = document.createElement('div');
      dummy.innerHTML = this.getCloudProviderBadgeHtml('google');
      if (dummy.firstElementChild) badge.replaceWith(dummy.firstElementChild);
    }

    const loaderEl = document.getElementById('addDirectoryLoading');
    if (loaderEl) {
      loaderEl.style.display = 'none';
      const loadText = loaderEl.querySelector('span:last-child');
      if (loadText) loadText.textContent = 'Espelhando diretório...';
    }
    const submitBtn = document.getElementById('btnSubmitAddDirectory');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '';
      submitBtn.style.cursor = '';
      submitBtn.textContent = 'Criar e Espelhar';
    }

    modal.classList.add('open');
  }

  openEditProjectModal(proj) {
    const modal = document.getElementById('modalEditProject');
    if (!modal) return;

    const loaderEl = document.getElementById('editDirectoryLoading');
    if (loaderEl) loaderEl.style.display = 'none';
    const submitBtn = document.getElementById('btnSubmitEditProject');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '';
      submitBtn.style.cursor = '';
      submitBtn.textContent = 'Salvar Alterações';
    }

    this.updateBrandElements();

    const defaultCat = (this.getCategories()[0] && this.getCategories()[0].name) || 'Categoria Padrão';
    this.populateCategorySelects(null, proj.category || defaultCat, null, proj.divisionId);

    document.getElementById('editProjName').value = proj.name;
    document.getElementById('editProjClient').value = proj.clientName || '';
    document.getElementById('editProjDrive').value = proj.driveLink || '';
    document.getElementById('editProjPassword').value = proj.password || '';
    document.getElementById('editProjAllowComments').checked = proj.allowComments !== false;
    const checkEditHideBrand = document.getElementById('editProjHideBrand');
    if (checkEditHideBrand) checkEditHideBrand.checked = proj.hideBrandName !== false;
    const checkEditAllowShare = document.getElementById('editProjAllowShare');
    if (checkEditAllowShare) checkEditAllowShare.checked = proj.allowShare !== false;
    const catSelect = document.getElementById('editProjCategory');
    if (catSelect) catSelect.value = proj.category || defaultCat;
    const divSelect = document.getElementById('editProjDivision');
    if (divSelect && proj.divisionId) divSelect.value = proj.divisionId;

    // Configure Archive button in Edit Modal
    const btnArchive = document.getElementById('btnToggleArchiveProject');
    const labelArchive = document.getElementById('labelToggleArchiveProject');
    const btnDeleteArchived = document.getElementById('btnDeleteArchivedProject');

    if (btnArchive && labelArchive) {
      if (proj.archived) {
        labelArchive.textContent = 'Restaurar do Arquivo';
        btnArchive.className = 'btn-secondary';
        btnArchive.title = 'Restaurar este projeto para os diretórios ativos';
      } else {
        labelArchive.textContent = 'Mover para Arquivo';
        btnArchive.className = 'btn-danger-outline';
        btnArchive.title = 'Mover este projeto para o Arquivo';
      }

      btnArchive.onclick = async () => {
        try {
          if (proj.archived) {
            const res = await window.API.unarchiveProject(proj.id);
            if (res && res.categoryRestored) {
              window.showToast(`Projeto restaurado! A categoria "${res.categoryRestored}" foi recuperada junto.`);
            } else {
              window.showToast('Projeto restaurado aos diretórios ativos');
            }
          } else {
            await window.API.archiveProject(proj.id);
            window.showToast('Projeto movido para o Arquivo');
          }
          await this.fetchData();
          this.selectedProject = this.data.projects.find(p => p.id === proj.id);
          modal.classList.remove('open');
          this.render();
        } catch (err) {
          alert('Erro ao alterar status do projeto');
        }
      };
    }

    if (btnDeleteArchived) {
      if (proj.archived) {
        btnDeleteArchived.style.display = 'inline-flex';
        btnDeleteArchived.onclick = () => {
          this.promptDeleteProject(proj);
        };
      } else {
        btnDeleteArchived.style.display = 'none';
      }
    }

    modal.classList.add('open');
  }

  promptDeleteProject(proj) {
    const modal = document.getElementById('modalConfirmDeleteProject');
    const nameEl = document.getElementById('confirmDeleteProjectName');
    const btnSubmit = document.getElementById('btnConfirmDeleteProjectSubmit');
    if (!modal) return;

    if (nameEl) nameEl.textContent = `"${proj.name}"`;
    modal.classList.add('open');

    btnSubmit.onclick = async () => {
      try {
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Excluindo...';
        await window.API.deleteProject(proj.id);
        modal.classList.remove('open');
        document.getElementById('modalEditProject')?.classList.remove('open');
        window.showToast(`Diretório "${proj.name}" removido do Cloud (mantido no Google Drive)`);
        await this.fetchData();
        const activeProjects = (this.data.projects || []).filter(p => !p.archived);
        this.selectedProject = activeProjects.length > 0 ? activeProjects[0] : ((this.data.projects || [])[0] || null);
        this.render();
      } catch (err) {
        alert('Erro ao excluir diretório: ' + err.message);
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Excluir do Cloud';
      }
    };
  }

  openCategoryContextMenu(e, cat) {
    const menu = document.getElementById('categoryContextMenu');
    if (!menu) return;

    this.activeContextMenuCategory = cat;

    const catNameEl = document.getElementById('ctxCategoryName');
    if (catNameEl) catNameEl.textContent = cat.name;

    const btnRename = document.getElementById('ctxCatBtnRename');
    if (btnRename) {
      btnRename.style.display = this.isClientMode ? 'none' : 'flex';
    }

    const defaultBtn = document.getElementById('ctxBtnDefaultColor');
    const isDefault = !cat.color || cat.color.toLowerCase() === '#ff5400';
    if (defaultBtn) {
      defaultBtn.classList.toggle('selected', isDefault);
    }

    const swatches = menu.querySelectorAll('.context-swatch-btn');
    swatches.forEach(btn => {
      const hex = btn.getAttribute('data-color');
      const matches = !isDefault && hex && cat.color && hex.toLowerCase() === cat.color.toLowerCase();
      btn.classList.toggle('selected', !!matches);
    });

    const hoverLabel = document.getElementById('ctxHoverColorName');
    if (hoverLabel) {
      if (isDefault) {
        hoverLabel.textContent = 'Padrão';
      } else {
        const found = CATEGORY_COLORS.find(c => c.hex.toLowerCase() === (cat.color || '').toLowerCase());
        hoverLabel.textContent = found ? found.name : 'Personalizada';
      }
    }

    // Position safely within viewport
    menu.style.display = 'block';
    menu.style.visibility = 'hidden';
    const menuWidth = 250;
    const menuHeight = menu.offsetHeight || 215;

    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > window.innerWidth - 12) {
      x = window.innerWidth - menuWidth - 12;
    }
    if (y + menuHeight > window.innerHeight - 12) {
      y = window.innerHeight - menuHeight - 12;
    }
    menu.style.left = `${Math.max(12, x)}px`;
    menu.style.top = `${Math.max(12, y)}px`;
    menu.style.visibility = 'visible';
  }

  closeCategoryContextMenu() {
    const menu = document.getElementById('categoryContextMenu');
    if (menu) {
      menu.style.display = 'none';
      this.activeContextMenuCategory = null;
    }
  }

  selectCategoryColor(catId, colorHex) {
    if (!this.data || !catId) return;
    const cat = (this.data.categories || []).find(c => c.id === catId || c.name === catId);
    if (!cat) return;

    const defaultHex = (this.getDefaultColor() || '#FF5400').toLowerCase();
    const finalHex = (!colorHex || colorHex.toLowerCase() === defaultHex || colorHex.toLowerCase() === '#ff5400') ? null : colorHex;
    cat.color = finalHex;

    this.closeCategoryContextMenu();

    // Atualização instantânea na tela (0ms)
    this.renderSidebar();
    this.renderMainContent();

    (async () => {
      try {
        const res = await window.API.setCategoryColor(cat.id, finalHex);
        if (res && res.categories) {
          this.data.categories = res.categories;
        }
        this.populateCategorySelects();
        const colorObj = CATEGORY_COLORS.find(c => c.hex.toLowerCase() === (colorHex || '#FF5400').toLowerCase());
        const colorName = colorObj ? colorObj.name : 'Padrão';
        window.showToast(`Cor da categoria "${cat.name}" alterada para ${colorName}! ✓`);
      } catch (err) {
        console.error(err);
        window.showToast('Erro ao atualizar cor da categoria: ' + err.message, 'error');
      }
    })();
  }

  setupCategoryContextMenu() {
    const menu = document.getElementById('categoryContextMenu');
    if (!menu) return;

    const btnCatRename = document.getElementById('ctxCatBtnRename');
    btnCatRename?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.activeContextMenuCategory) {
        const cat = this.activeContextMenuCategory;
        this.closeCategoryContextMenu();
        this.openUniversalRenameModal({
          type: 'category',
          id: cat.id,
          name: cat.name,
          title: cat.name,
          color: cat.color || null,
          item: cat
        });
      }
    });

    const defaultBtn = document.getElementById('ctxBtnDefaultColor');
    defaultBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.activeContextMenuCategory) {
        this.selectCategoryColor(this.activeContextMenuCategory.id, this.getDefaultColor());
      }
    });

    const hoverLabel = document.getElementById('ctxHoverColorName');
    const swatches = menu.querySelectorAll('.context-swatch-btn');
    swatches.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const hex = btn.getAttribute('data-color');
        if (this.activeContextMenuCategory && hex) {
          this.selectCategoryColor(this.activeContextMenuCategory.id, hex);
        }
      });

      btn.addEventListener('mouseenter', () => {
        const name = btn.getAttribute('data-name');
        if (hoverLabel && name) hoverLabel.textContent = name;
      });
    });

    menu.querySelector('.context-palette-grid')?.addEventListener('mouseleave', () => {
      if (hoverLabel && this.activeContextMenuCategory) {
        const cat = this.activeContextMenuCategory;
        const isDefault = !cat.color || cat.color.toLowerCase() === '#ff5400';
        if (isDefault) {
          hoverLabel.textContent = 'Padrão';
        } else {
          const found = CATEGORY_COLORS.find(c => c.hex.toLowerCase() === (cat.color || '').toLowerCase());
          hoverLabel.textContent = found ? found.name : 'Personalizada';
        }
      }
    });

    // Dismiss on click outside
    document.addEventListener('click', (e) => {
      if (menu && menu.style.display !== 'none' && !menu.contains(e.target) && !e.target.closest('.category-header') && !e.target.closest('.category-tab-btn') && !e.target.closest('.category-manage-icon') && !e.target.closest('.category-manage-color-btn') && !e.target.closest('.btn-color-cat')) {
        this.closeCategoryContextMenu();
      }
    });

    // Dismiss on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu && menu.style.display !== 'none') {
        this.closeCategoryContextMenu();
      }
    });

    // Dismiss on scroll or resize
    window.addEventListener('scroll', () => {
      if (menu && menu.style.display !== 'none') {
        this.closeCategoryContextMenu();
      }
    }, { passive: true });

    window.addEventListener('resize', () => {
      if (menu && menu.style.display !== 'none') {
        this.closeCategoryContextMenu();
      }
    }, { passive: true });
  }

  // =========================================================================
  // UNIVERSAL CONTEXT MENU (Desktop Right-Click & Mobile Long-Press)
  // Supports: Categoria, Divisão, Diretório, Pasta Interna, Arquivo/Mídia
  // Surfaces: Homepage, Navegação (Colunas), Galeria, Barra Lateral
  // =========================================================================

  resolveContextMenuItem(target) {
    if (!target || !this.data) return null;
    if (target.closest('input, textarea, select, [contenteditable="true"]')) return null;
    if (target.closest('#appUniversalContextMenu, #modalUniversalRename, #modalRemoveCloud, #modalDeleteDrive, .modal-backdrop')) return null;

    // 1. Arquivo / Mídia (.macos-col-file, .video-card, .media-card)
    const fileEl = target.closest('.macos-col-file, .video-card[data-video-id], .media-card[data-video-id]');
    if (fileEl) {
      const fileId = fileEl.getAttribute('data-file-id') || fileEl.getAttribute('data-video-id');
      if (fileId) {
        let proj = this.selectedProject;
        let file = null;
        if (proj && proj.videos) {
          file = proj.videos.find(v => v.id === fileId);
        }
        if (!file && this.data.projects) {
          for (const p of this.data.projects) {
            const found = (p.videos || []).find(v => v.id === fileId);
            if (found) {
              proj = p;
              file = found;
              break;
            }
          }
        }
        if (file && proj) {
          const itemType = this.getItemType(file);
          const title = this.getDisplayTitle(file);
          return {
            type: 'file',
            id: file.id,
            name: title,
            title,
            color: file.color || null,
            item: file,
            projectId: proj.id,
            project: proj,
            itemType
          };
        }
      }
    }

    // 2. Pasta Interna (.macos-col-folder, .subfolder-card, .gallery-crumb-link)
    const folderEl = target.closest('.macos-col-folder, .subfolder-card[data-folder-id], .gallery-crumb-link[data-folder-id]');
    if (folderEl) {
      const folderId = folderEl.getAttribute('data-folder-id');
      if (folderId && folderId !== 'root') {
        let proj = this.selectedProject;
        let folder = null;
        if (proj && proj.folders) {
          folder = proj.folders.find(f => f.id === folderId);
        }
        if (!folder && this.data.projects) {
          for (const p of this.data.projects) {
            const found = (p.folders || []).find(f => f.id === folderId);
            if (found) {
              proj = p;
              folder = found;
              break;
            }
          }
        }
        if (folder && proj) {
          return {
            type: 'folder',
            id: folder.id,
            name: folder.name,
            title: folder.name,
            color: folder.color || null,
            item: folder,
            projectId: proj.id,
            project: proj
          };
        }
      }
    }

    // 3. Diretório / Projeto (.macos-col-proj, .folder-card, .project-item)
    const projEl = target.closest('.macos-col-proj, .folder-card[data-id], .project-item[data-id]');
    if (projEl) {
      const projId = projEl.getAttribute('data-project-id') || projEl.getAttribute('data-id');
      if (projId) {
        const proj = (this.data.projects || []).find(p => p.id === projId);
        if (proj) {
          const isLoose = Boolean(proj.isFile || proj.isIsolatedFile);
          return {
            type: 'project',
            id: proj.id,
            name: proj.name,
            title: proj.name,
            color: proj.color || null,
            item: proj,
            isLoose
          };
        }
      }
    }

    // 4. Divisão (.macos-col-div, .division-header, .division-group)
    const divEl = target.closest('.macos-col-div, .division-header[data-division-id], .division-group[data-division-id]');
    if (divEl) {
      const divId = divEl.getAttribute('data-div-id') || divEl.getAttribute('data-division-id');
      if (divId) {
        const div = (this.data.divisions || []).find(d => d.id === divId);
        if (div) {
          return {
            type: 'division',
            id: div.id,
            name: div.name,
            title: div.name,
            color: div.color || null,
            item: div
          };
        }
      }
    }

    // 5. Categoria (.macos-col-cat, .category-header, .category-tab-btn, [data-cat-id])
    const catEl = target.closest('.macos-col-cat, .category-header[data-cat-name], .category-tab-btn[data-category], [data-cat-id]');
    if (catEl) {
      const catName = catEl.getAttribute('data-cat-name') || catEl.getAttribute('data-category');
      const catId = catEl.getAttribute('data-cat-id');
      const cat = (this.data.categories || []).find(c => (catId && c.id === catId) || (catName && c.name === catName));
      if (cat) {
        return {
          type: 'category',
          id: cat.id,
          name: cat.name,
          title: cat.name,
          color: cat.color || null,
          item: cat
        };
      }
    }

    return null;
  }

  getItemShareLink(ctxItem) {
    if (!ctxItem) return null;

    // 1. Diretório / Projeto (project)
    if (ctxItem.type === 'project') {
      const proj = ctxItem.item;
      if (!proj) return null;
      if (this.isClientMode && proj.allowShare === false) {
        return null;
      }
      const code = proj.shortCode || proj.slug || proj.id;
      return {
        url: `${window.location.origin}/${code}`,
        code: code,
        title: proj.name || 'Diretório'
      };
    }

    // 2. Pasta interna (folder)
    if (ctxItem.type === 'folder') {
      const folder = ctxItem.item;
      const proj = ctxItem.project || (this.data && this.data.projects ? this.data.projects.find(p => p.id === ctxItem.projectId) : this.selectedProject);
      if (!folder) return null;
      if (this.isClientMode && proj && !this.isShareAllowedForFolder(folder, proj)) {
        return null;
      }
      const code = folder.shortCode || folder.id;
      return {
        url: `${window.location.origin}/${code}`,
        code: code,
        title: folder.name || 'Pasta'
      };
    }

    // 3. Arquivo / Mídia (file)
    if (ctxItem.type === 'file') {
      const file = ctxItem.item;
      const proj = ctxItem.project || (this.data && this.data.projects ? this.data.projects.find(p => p.id === ctxItem.projectId) : this.selectedProject);
      if (!file) return null;
      if (this.isClientMode && proj && !this.isShareAllowedForVideo(file, proj)) {
        return null;
      }
      const code = file.shortCode || file.id;
      return {
        url: `${window.location.origin}/${code}`,
        code: code,
        title: file.fileName || file.title || 'Arquivo'
      };
    }

    // Categorias e divisões não possuem links de compartilhamento do cliente
    return null;
  }

  setupUniversalContextMenu() {
    const menu = document.getElementById('appUniversalContextMenu');
    if (!menu) return;

    // Desktop: Right-Click (contextmenu)
    document.addEventListener('contextmenu', (e) => {
      const resolved = this.resolveContextMenuItem(e.target);
      if (resolved) {
        e.preventDefault();
        e.stopPropagation();
        this.openUniversalContextMenu(e, resolved);
      }
    });

    // Mobile: Touch Long-Press (Hold 500ms)
    let touchTimer = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchMoved = false;

    document.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) {
        if (touchTimer) clearTimeout(touchTimer);
        return;
      }
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchMoved = false;

      if (touchTimer) clearTimeout(touchTimer);

      const resolved = this.resolveContextMenuItem(e.target);
      if (!resolved) return;

      touchTimer = setTimeout(() => {
        if (!touchMoved) {
          try {
            if (navigator.vibrate) navigator.vibrate(40);
          } catch (_) {}
          this.openUniversalContextMenu({ clientX: touchStartX, clientY: touchStartY }, resolved);
        }
      }, 500);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!touchTimer) return;
      const moveX = Math.abs(e.touches[0].clientX - touchStartX);
      const moveY = Math.abs(e.touches[0].clientY - touchStartY);
      if (moveX > 10 || moveY > 10) {
        touchMoved = true;
        clearTimeout(touchTimer);
        touchTimer = null;
      }
    }, { passive: true });

    document.addEventListener('touchend', () => {
      if (touchTimer) {
        clearTimeout(touchTimer);
        touchTimer = null;
      }
    }, { passive: true });

    document.addEventListener('touchcancel', () => {
      if (touchTimer) {
        clearTimeout(touchTimer);
        touchTimer = null;
      }
    }, { passive: true });

    // Toggle Palette Accordion on "Cor"
    const btnColorToggle = document.getElementById('ctxBtnColorToggle');
    const colorGroup = document.getElementById('ctxColorGroup');
    const paletteWrap = document.getElementById('ctxPaletteWrapper');

    btnColorToggle?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = colorGroup?.classList.toggle('open');
      if (paletteWrap) {
        paletteWrap.style.display = isOpen ? 'block' : 'none';
      }
      btnColorToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Restore Default Swatch
    const defaultBtn = document.getElementById('ctxSwatchDefaultBtn');
    defaultBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.activeUniversalContextItem) {
        this.setElementColor(this.activeUniversalContextItem, this.getDefaultColor());
      }
    });

    // 14 Palette Swatches
    const swatches = menu.querySelectorAll('.ctx-swatch-btn');
    swatches.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const hex = btn.getAttribute('data-color');
        if (this.activeUniversalContextItem && hex) {
          this.setElementColor(this.activeUniversalContextItem, hex);
        }
      });
    });

    // Action: + Diretório (Abre menu normal de criar/espelhar diretório)
    const btnAddDirectory = document.getElementById('ctxBtnAddDirectory');
    btnAddDirectory?.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = this.activeUniversalContextItem;
      this.closeUniversalContextMenu();
      if (!item) return;

      if (item.type === 'division') {
        const div = item.item;
        this.openAddDirectoryModal(div?.category || null, div?.id || null);
      } else if (item.type === 'category') {
        this.openAddDirectoryModal(item.name || null, null);
      } else {
        this.openAddDirectoryModal();
      }
    });

    // Action: + Divisão (Abre menu normal de criar divisão ou subdivisão)
    const btnAddDivision = document.getElementById('ctxBtnAddDivision');
    btnAddDivision?.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = this.activeUniversalContextItem;
      this.closeUniversalContextMenu();
      if (!item) return;

      if (item.type === 'division') {
        const div = item.item;
        // Ao clicar com o direito em divisões/subdivisões: + Divisão (parar criar uma subdivisão — abre menu normal de criar divisão)
        this.openAddDivisionModal(div?.category || null, div?.id || null);
      } else if (item.type === 'project') {
        const proj = item.item;
        // Ao clicar com o direito em diretórios: + Divisão (abre menu normal de criar divisão)
        this.openAddDivisionModal(proj?.category || null, proj?.divisionId || null);
      } else if (item.type === 'category') {
        this.openAddDivisionModal(item.name || null, null);
      } else {
        this.openAddDivisionModal();
      }
    });

    // Action: + Upload (Envia arquivos para o drive como dentro dos diretórios já faz)
    const btnAddUpload = document.getElementById('ctxBtnAddUpload');
    const ctxInputUpload = document.getElementById('ctxInputUpload');

    btnAddUpload?.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = this.activeUniversalContextItem;
      this.closeUniversalContextMenu();
      if (!item) return;

      let targetFolderId = null;
      let targetFolderName = null;
      let targetProj = null;

      if (item.type === 'project') {
        targetProj = item.item;
        targetFolderId = item.item?.driveFolderId;
        targetFolderName = item.item?.name;
      } else if (item.type === 'folder') {
        targetProj = item.project || (this.data?.projects || []).find(p => p.id === item.projectId) || this.selectedProject;
        targetFolderId = item.item?.id || item.item?.driveFolderId;
        targetFolderName = item.item?.name;
      }

      if (!targetProj || !targetFolderId) {
        window.showToast('Pasta de destino não encontrada para upload', 'error');
        return;
      }

      this._pendingCtxUpload = {
        targetFolderId,
        targetFolderName,
        project: targetProj
      };

      ctxInputUpload?.click();
    });

    ctxInputUpload?.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0 && this._pendingCtxUpload) {
        const { targetFolderId, targetFolderName, project } = this._pendingCtxUpload;
        this.handleFilesUpload(e.target.files, targetFolderId, targetFolderName, project);
        this._pendingCtxUpload = null;
        e.target.value = '';
      }
    });

    // Action 2: Editar (Abre janela padrão do elemento)
    const btnEdit = document.getElementById('ctxBtnEdit');
    btnEdit?.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = this.activeUniversalContextItem;
      this.closeUniversalContextMenu();
      if (!item) return;

      if (item.type === 'category') {
        this.openManageCategoriesModal(item.id);
      } else if (item.type === 'division') {
        this.openEditDivisionModal(item.item);
      } else if (item.type === 'project') {
        this.openEditProjectModal(item.item);
      } else if (item.type === 'folder') {
        this.openEditFolderModal(item.item, item.project);
      } else if (item.type === 'file') {
        this.openEditMediaModal(item.item, item.project);
      }
    });

    // Action 2.02: Fixar (Pastas/Subpastas -> Novo Diretório)
    const btnPin = document.getElementById('ctxBtnPin');
    btnPin?.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = this.activeUniversalContextItem;
      this.closeUniversalContextMenu();
      if (item && item.type === 'folder') {
        const folder = item.item;
        const proj = item.project || (this.data && this.data.projects ? this.data.projects.find(p => p.id === item.projectId) : this.selectedProject);
        this.pinFolder(folder, proj);
      }
    });

    // Action 2.05: Baixar / Baixar em Lote (Embaixo do Editar)
    const btnDownload = document.getElementById('ctxBtnDownload');
    btnDownload?.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = this.activeUniversalContextItem;
      this.closeUniversalContextMenu();
      if (!item) return;

      if (item.type === 'file') {
        this.downloadSingleFile(item.item);
      } else if (item.type === 'folder') {
        const folder = item.item;
        const proj = item.project || (this.data && this.data.projects ? this.data.projects.find(p => p.id === item.projectId) : this.selectedProject);
        if (proj && folder) {
          this.openBatchDownloadModal(proj, null, { folder });
        }
      } else if (item.type === 'project') {
        const proj = item.item;
        if (proj) {
          this.openBatchDownloadModal(proj, null, { project: proj });
        }
      }
    });

    // Action 2.1: Copiar Link (Apenas itens compartilháveis)
    const btnCopyLink = document.getElementById('ctxBtnCopyLink');
    btnCopyLink?.addEventListener('click', async (e) => {
      e.stopPropagation();
      const item = this.activeUniversalContextItem;
      this.closeUniversalContextMenu();
      if (!item) return;

      const shareInfo = this.getItemShareLink(item);
      if (shareInfo && shareInfo.url) {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(shareInfo.url);
          } else {
            const textarea = document.createElement('textarea');
            textarea.value = shareInfo.url;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
          }
          window.showToast(`Link copiado: .../${shareInfo.code}`);
        } catch (err) {
          console.error('Falha ao copiar link:', err);
          window.showToast('Erro ao copiar link', 'error');
        }
      }
    });

    // Action 3: Renomear (Afeta Google Drive, exibe aviso claro)
    const btnRename = document.getElementById('ctxBtnRename');
    btnRename?.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = this.activeUniversalContextItem;
      this.closeUniversalContextMenu();
      if (item) {
        this.openUniversalRenameModal(item);
      }
    });

    // Action 4: Arquivar / Desarquivar {apenas diretórios}
    const btnArchive = document.getElementById('ctxBtnArchive');
    btnArchive?.addEventListener('click', async (e) => {
      e.stopPropagation();
      const item = this.activeUniversalContextItem;
      this.closeUniversalContextMenu();
      if (!item || item.type !== 'project') return;

      const proj = item.item;
      try {
        if (proj.archived) {
          const res = await window.API.unarchiveProject(proj.id);
          if (res && res.categoryRestored) {
            window.showToast(`Projeto restaurado! A categoria "${res.categoryRestored}" foi recuperada junto.`);
          } else {
            window.showToast(`Diretório "${proj.name}" restaurado aos diretórios ativos ✓`);
          }
        } else {
          await window.API.archiveProject(proj.id);
          window.showToast(`Diretório "${proj.name}" movido para o Arquivo ✓`);
        }

        await this.fetchData();
        if (this.selectedProject && this.selectedProject.id === proj.id) {
          this.selectedProject = (this.data.projects || []).find(p => p.id === proj.id) || null;
        }
        this.renderSidebar();
        this.renderMainContent();
      } catch (err) {
        console.error('Erro ao alterar status de arquivamento:', err);
        window.showToast('Erro ao arquivar/desarquivar: ' + err.message, 'error');
      }
    });

    // Action 5: Remover do Cloud {apenas diretórios} [mantém no Google Drive]
    const btnRemoveCloud = document.getElementById('ctxBtnRemoveCloud');
    btnRemoveCloud?.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = this.activeUniversalContextItem;
      this.closeUniversalContextMenu();
      if (item && item.type === 'project') {
        this.openRemoveCloudModal(item);
      }
    });

    // Action 5: Excluir do Drive [Remove do Cloud e do Google Drive, 2 confirmações]
    const btnDeleteDrive = document.getElementById('ctxBtnDeleteDrive');
    btnDeleteDrive?.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = this.activeUniversalContextItem;
      this.closeUniversalContextMenu();
      if (item) {
        if (item.type === 'division') {
          this.confirmDeleteDivision(item.item);
        } else {
          this.openDeleteDriveModal(item);
        }
      }
    });

    // Dismiss Menu on outside click
    document.addEventListener('click', (e) => {
      if (menu && menu.style.display !== 'none' && !menu.contains(e.target)) {
        this.closeUniversalContextMenu();
      }
    });

    // Dismiss on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu && menu.style.display !== 'none') {
        this.closeUniversalContextMenu();
      }
    });

    // Dismiss on scroll or resize
    window.addEventListener('scroll', () => {
      if (menu && menu.style.display !== 'none') {
        this.closeUniversalContextMenu();
      }
    }, { passive: true });

    window.addEventListener('resize', () => {
      if (menu && menu.style.display !== 'none') {
        this.closeUniversalContextMenu();
      }
    }, { passive: true });

    // Setup Modals Listeners
    this.setupUniversalModals();
  }

  openUniversalContextMenu(e, ctxItem) {
    this.activeUniversalContextItem = ctxItem;
    const menu = document.getElementById('appUniversalContextMenu');
    if (!menu) return;

    const isAuthor = !this.isClientMode;

    // Reset color accordion (exclusivo para o autor)
    const colorGroup = document.getElementById('ctxColorGroup');
    const paletteWrap = document.getElementById('ctxPaletteWrapper');
    const btnColorToggle = document.getElementById('ctxBtnColorToggle');
    if (colorGroup) {
      colorGroup.classList.remove('open');
      colorGroup.style.display = isAuthor ? 'block' : 'none';
    }
    if (paletteWrap) paletteWrap.style.display = 'none';
    if (btnColorToggle) btnColorToggle.setAttribute('aria-expanded', 'false');

    // 1. Badge & Title
    const badgeEl = document.getElementById('ctxBadgeType');
    const titleEl = document.getElementById('ctxItemTitle');
    const iconWrap = document.getElementById('ctxHeaderIconWrap');
    const colorDot = document.getElementById('ctxColorPreviewDot');

    let badgeText = 'DIRETÓRIO';
    let iconSvg = '';
    const curColor = ctxItem.color || '#FF5400';

    if (ctxItem.type === 'category') {
      badgeText = 'CATEGORIA';
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="${curColor}"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>`;
    } else if (ctxItem.type === 'division') {
      badgeText = 'DIVISÃO';
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="${curColor}"><path d="M19 4h-4V2H9v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V8h14v12z"/></svg>`;
    } else if (ctxItem.type === 'project') {
      badgeText = 'DIRETÓRIO';
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="${curColor}"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`;
    } else if (ctxItem.type === 'folder') {
      badgeText = 'PASTA';
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="${curColor}"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`;
    } else if (ctxItem.type === 'file') {
      badgeText = (ctxItem.itemType ? ctxItem.itemType.toUpperCase() : 'ARQUIVO');
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="${curColor}"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`;
    }

    if (badgeEl) badgeEl.textContent = badgeText;
    if (titleEl) titleEl.textContent = ctxItem.title;
    if (iconWrap) iconWrap.innerHTML = iconSvg;
    if (colorDot) colorDot.style.backgroundColor = curColor;

    // Ações de Adicionar abaixo de "Cor" (exclusivas do Autor):
    const btnAddDirectory = document.getElementById('ctxBtnAddDirectory');
    const btnAddDivision = document.getElementById('ctxBtnAddDivision');
    const btnAddUpload = document.getElementById('ctxBtnAddUpload');

    if (btnAddDirectory) {
      const showDir = isAuthor && (ctxItem.type === 'division' || ctxItem.type === 'category');
      btnAddDirectory.style.display = showDir ? 'flex' : 'none';
    }

    if (btnAddDivision) {
      const showDiv = isAuthor && (ctxItem.type === 'division' || ctxItem.type === 'category');
      btnAddDivision.style.display = showDiv ? 'flex' : 'none';
    }

    if (btnAddUpload) {
      const showUpload = isAuthor && (ctxItem.type === 'project' || ctxItem.type === 'folder');
      btnAddUpload.style.display = showUpload ? 'flex' : 'none';
    }

    // Editar (exclusivo do Autor):
    const btnEdit = document.getElementById('ctxBtnEdit');
    if (btnEdit) {
      btnEdit.style.display = isAuthor ? 'flex' : 'none';
    }

    // Fixar: Visível APENAS para pastas/subpastas e exclusivo do Autor
    const btnPin = document.getElementById('ctxBtnPin');
    if (btnPin) {
      btnPin.style.display = (isAuthor && ctxItem.type === 'folder') ? 'flex' : 'none';
    }

    // Baixar / Baixar em Lote: Embaixo do Editar
    // - Para arquivos (file): "Baixar" (download direto do arquivo selecionado)
    // - Para pastas (folder) e diretórios (project): "Baixar em Lote" (abre modal de lote com escopo da pasta/diretório clicado)
    // - Para divisões e categorias: oculto
    // Sempre disponível tanto para autor quanto para cliente
    const btnDownload = document.getElementById('ctxBtnDownload');
    const txtDownload = document.getElementById('ctxBtnDownloadText');
    if (btnDownload) {
      if (ctxItem.type === 'file') {
        btnDownload.style.display = 'flex';
        if (txtDownload) txtDownload.textContent = 'Baixar';
      } else if (ctxItem.type === 'folder' || ctxItem.type === 'project') {
        btnDownload.style.display = 'flex';
        if (txtDownload) txtDownload.textContent = 'Baixar em Lote';
      } else {
        btnDownload.style.display = 'none';
      }
    }

    // Copiar Link: Visível apenas se liberado pelo autor (getItemShareLink valida se está permitido)
    const btnCopyLink = document.getElementById('ctxBtnCopyLink');
    if (btnCopyLink) {
      const shareInfo = this.getItemShareLink(ctxItem);
      btnCopyLink.style.display = shareInfo ? 'flex' : 'none';
    }

    // Renomear (exclusivo do Autor):
    const btnRename = document.getElementById('ctxBtnRename');
    if (btnRename) {
      btnRename.style.display = isAuthor ? 'flex' : 'none';
    }

    // Arquivar: Visível APENAS para diretórios e exclusivo do Autor
    const btnArchive = document.getElementById('ctxBtnArchive');
    const txtArchive = document.getElementById('ctxBtnArchiveText');
    if (btnArchive) {
      const isProj = isAuthor && (ctxItem.type === 'project');
      btnArchive.style.display = isProj ? 'flex' : 'none';
      if (isProj && txtArchive) {
        const isArchived = Boolean(ctxItem.item && ctxItem.item.archived);
        txtArchive.textContent = isArchived ? 'Desarquivar' : 'Arquivar';
      }
    }

    // Remover do Cloud: Visível APENAS para diretórios e exclusivo do Autor
    const btnRemoveCloud = document.getElementById('ctxBtnRemoveCloud');
    if (btnRemoveCloud) {
      btnRemoveCloud.style.display = (isAuthor && ctxItem.type === 'project') ? 'flex' : 'none';
    }

    // Excluir do Drive (exclusivo do Autor):
    const dividerDanger = document.getElementById('ctxDividerDanger');
    if (dividerDanger) {
      dividerDanger.style.display = isAuthor ? 'block' : 'none';
    }

    const btnDeleteDrive = document.getElementById('ctxBtnDeleteDrive');
    if (btnDeleteDrive) {
      btnDeleteDrive.style.display = isAuthor ? 'flex' : 'none';
    }

    const deleteText = document.getElementById('ctxBtnDeleteText');
    if (deleteText && isAuthor) {
      if (ctxItem.type === 'project' || ctxItem.type === 'folder' || ctxItem.type === 'file') {
        deleteText.textContent = 'Excluir do Drive';
      } else if (ctxItem.type === 'division') {
        deleteText.textContent = 'Excluir Divisão';
      } else if (ctxItem.type === 'category') {
        deleteText.textContent = 'Excluir Categoria';
      }
    }

    // No modo cliente, apenas "Baixar" (ou "Baixar em Lote") e "Copiar Link" (se liberado pelo autor) podem existir.
    // Se nenhum estiver visível, não há nenhuma ação para o cliente — aborta a exibição do menu de contexto.
    if (!isAuthor) {
      const hasDownload = Boolean(btnDownload && btnDownload.style.display !== 'none');
      const hasCopyLink = Boolean(btnCopyLink && btnCopyLink.style.display !== 'none');
      if (!hasDownload && !hasCopyLink) {
        this.closeUniversalContextMenu();
        return;
      }
    }

    // Update Swatches Active Status (somente se autor)
    if (isAuthor) {
      const defaultBtn = document.getElementById('ctxSwatchDefaultBtn');
      const defaultHex = this.getDefaultColor().toLowerCase();
      const isDefaultColor = !ctxItem.color || ctxItem.color.toLowerCase() === defaultHex || ctxItem.color.toLowerCase() === '#ff5400';
      if (defaultBtn) {
        defaultBtn.classList.toggle('selected', isDefaultColor);
        const defaultCheck = document.getElementById('ctxDefaultCheck');
        if (defaultCheck) defaultCheck.style.opacity = isDefaultColor ? '1' : '0';
      }

      const swatches = menu.querySelectorAll('.ctx-swatch-btn');
      swatches.forEach(btn => {
        const hex = btn.getAttribute('data-color');
        const isSelected = Boolean(!isDefaultColor && ctxItem.color && ctxItem.color.toLowerCase() === hex.toLowerCase());
        btn.classList.toggle('selected', isSelected);
      });
    }

    // Position menu within viewport
    menu.style.display = 'block';
    menu.style.visibility = 'hidden';

    const menuWidth = 250;
    const menuHeight = menu.offsetHeight || 230;
    let x = e.clientX || 0;
    let y = e.clientY || 0;

    if (x + menuWidth > window.innerWidth - 12) {
      x = window.innerWidth - menuWidth - 12;
    }
    if (y + menuHeight > window.innerHeight - 12) {
      y = window.innerHeight - menuHeight - 12;
    }

    menu.style.left = `${Math.max(12, x)}px`;
    menu.style.top = `${Math.max(12, y)}px`;
    menu.style.visibility = 'visible';
  }

  closeUniversalContextMenu() {
    const menu = document.getElementById('appUniversalContextMenu');
    if (menu) {
      menu.style.display = 'none';
    }
  }

  setElementColor(ctxItem, hex) {
    if (!ctxItem) return;
    const defaultHex = (this.getDefaultColor() || '#FF5400').toLowerCase();
    const finalHex = (!hex || hex.toLowerCase() === defaultHex || hex.toLowerCase() === '#ff5400') ? null : hex;

    // 1. Atualização instantânea em memória (0ms de atraso visual)
    if (ctxItem.item) {
      ctxItem.item.color = finalHex;
    }
    ctxItem.color = finalHex;

    if (ctxItem.type === 'category') {
      const cat = (this.data?.categories || []).find(c => c.id === ctxItem.id || c.name === ctxItem.id);
      if (cat) cat.color = finalHex;
    } else if (ctxItem.type === 'division') {
      const div = (this.data?.divisions || []).find(d => d.id === ctxItem.id);
      if (div) div.color = finalHex;
    } else if (ctxItem.type === 'project') {
      const proj = (this.data?.projects || []).find(p => p.id === ctxItem.id);
      if (proj) proj.color = finalHex;
      if (this.selectedProject && (this.selectedProject.id === ctxItem.id || this.selectedProject.slug === ctxItem.id)) {
        this.selectedProject.color = finalHex;
      }
    } else if (ctxItem.type === 'folder') {
      const proj = (this.data?.projects || []).find(p => p.id === ctxItem.projectId);
      const folder = (proj?.folders || []).find(f => f.id === ctxItem.id);
      if (folder) folder.color = finalHex;
      if (this.selectedProject && this.selectedProject.folders) {
        const selFolder = this.selectedProject.folders.find(f => f.id === ctxItem.id);
        if (selFolder) selFolder.color = finalHex;
      }
    } else if (ctxItem.type === 'file') {
      const proj = (this.data?.projects || []).find(p => p.id === ctxItem.projectId);
      const file = (proj?.videos || []).find(v => v.id === ctxItem.id);
      if (file) file.color = finalHex;
      if (this.selectedProject && this.selectedProject.videos) {
        const selFile = this.selectedProject.videos.find(v => v.id === ctxItem.id);
        if (selFile) selFile.color = finalHex;
      }
    }

    // 2. Fecha o menu de contexto instantaneamente
    this.closeUniversalContextMenu();

    // 3. Atualiza a tela de imediato no mesmo frame
    this.renderSidebar();
    this.renderMainContent();

    // 4. Salva no servidor de forma assíncrona (não trava a interface)
    (async () => {
      try {
        if (ctxItem.type === 'category') {
          await window.API.setCategoryColor(ctxItem.id, finalHex);
        } else if (ctxItem.type === 'division') {
          await window.API.updateDivision(ctxItem.id, { color: finalHex });
        } else if (ctxItem.type === 'project') {
          await window.API.updateProject(ctxItem.id, { color: finalHex });
        } else if (ctxItem.type === 'folder') {
          await window.API.setFolderComments(ctxItem.projectId, ctxItem.id, ctxItem.item?.allowComments, null, undefined, undefined, finalHex);
        } else if (ctxItem.type === 'file') {
          await window.API.setVideoComments(ctxItem.projectId, ctxItem.id, ctxItem.item?.allowComments, null, undefined, undefined, finalHex);
        }
      } catch (err) {
        console.error('Erro ao salvar cor no servidor:', err);
        window.showToast('Erro ao sincronizar cor: ' + (err.message || err), 'error');
      }
    })();
  }

  openUniversalRenameModal(ctxItem) {
    this.activeRenameItem = ctxItem;
    const modal = document.getElementById('modalUniversalRename');
    if (!modal) return;

    let typeLabel = 'Item';
    if (ctxItem.type === 'category') typeLabel = 'Categoria';
    else if (ctxItem.type === 'division') typeLabel = 'Divisão';
    else if (ctxItem.type === 'project') typeLabel = 'Diretório';
    else if (ctxItem.type === 'folder') typeLabel = 'Pasta';
    else if (ctxItem.type === 'file') typeLabel = 'Arquivo';

    const modalTitle = document.getElementById('renameModalTitle');
    const labelInput = document.getElementById('labelUniversalRename');
    const input = document.getElementById('inputUniversalRename');
    const warningBox = document.getElementById('renameDriveWarningBox');

    if (modalTitle) modalTitle.textContent = `Renomear ${typeLabel}`;
    if (labelInput) labelInput.textContent = `Novo nome para "${ctxItem.title}"`;
    if (input) {
      input.value = ctxItem.title;
    }

    if (warningBox) {
      if (ctxItem.type === 'category' || ctxItem.type === 'division') {
        warningBox.innerHTML = `
          <div class="rename-warning-icon">⚠️</div>
          <div class="rename-warning-content">
            <strong>Atenção:</strong> Alterar o nome afetará a organização interna de todos os diretórios associados a esta ${typeLabel.toLowerCase()}.
          </div>
        `;
      } else {
        warningBox.innerHTML = `
          <div class="rename-warning-icon">⚠️</div>
          <div class="rename-warning-content">
            <strong>Atenção:</strong> Alterar o nome afetará diretamente o arquivo/pasta original no seu <strong>Google Drive</strong>.
          </div>
        `;
      }
    }

    modal.classList.add('open');
    setTimeout(() => {
      if (input) {
        input.focus();
        input.select();
      }
    }, 50);
  }

  closeUniversalRenameModal() {
    const modal = document.getElementById('modalUniversalRename');
    if (modal) modal.classList.remove('open');
    this.activeRenameItem = null;
  }

  openRemoveCloudModal(ctxItem) {
    this.activeRemoveCloudItem = ctxItem;
    const modal = document.getElementById('modalRemoveCloud');
    if (!modal) return;

    const nameEl = document.getElementById('removeCloudProjName');
    if (nameEl) nameEl.textContent = `"${ctxItem.title}"`;

    modal.classList.add('open');
  }

  closeRemoveCloudModal() {
    const modal = document.getElementById('modalRemoveCloud');
    if (modal) modal.classList.remove('open');
    this.activeRemoveCloudItem = null;
  }

  openDeleteDriveModal(ctxItem) {
    this.activeDeleteDriveItem = ctxItem;
    const modal = document.getElementById('modalDeleteDrive');
    if (!modal) return;

    // Reset to Step 1
    const step1 = document.getElementById('deleteDriveStep1');
    const step2 = document.getElementById('deleteDriveStep2');
    const btnNext = document.getElementById('btnDeleteDriveStep1Next');
    const btnConfirm = document.getElementById('btnDeleteDriveConfirm');
    const itemName = document.getElementById('deleteDriveItemName');
    const modalTitle = document.getElementById('deleteDriveModalTitle');

    if (step1) step1.style.display = 'flex';
    if (step2) step2.style.display = 'none';
    if (btnNext) btnNext.style.display = 'inline-flex';
    if (btnConfirm) btnConfirm.style.display = 'none';
    if (itemName) itemName.textContent = `"${ctxItem.title}"`;

    if (modalTitle) {
      if (ctxItem.type === 'category') modalTitle.textContent = 'Excluir Categoria';
      else if (ctxItem.type === 'division') modalTitle.textContent = 'Excluir Divisão';
      else modalTitle.textContent = 'Excluir do Google Drive';
    }

    modal.classList.add('open');
  }

  closeDeleteDriveModal() {
    const modal = document.getElementById('modalDeleteDrive');
    if (modal) modal.classList.remove('open');
    this.activeDeleteDriveItem = null;
  }

  setupUniversalModals() {
    // 1. Rename Modal Events
    const renameModal = document.getElementById('modalUniversalRename');
    const btnRenameClose = document.getElementById('btnUniversalRenameClose');
    const btnRenameCancel = document.getElementById('btnUniversalRenameCancel');
    const btnRenameSave = document.getElementById('btnUniversalRenameSave');
    const inputRename = document.getElementById('inputUniversalRename');

    btnRenameClose?.addEventListener('click', () => this.closeUniversalRenameModal());
    btnRenameCancel?.addEventListener('click', () => this.closeUniversalRenameModal());
    renameModal?.addEventListener('click', (e) => {
      if (e.target === renameModal) this.closeUniversalRenameModal();
    });

    const handleSaveRename = async () => {
      if (!this.activeRenameItem) return;
      const ctxItem = this.activeRenameItem;
      const newName = (inputRename?.value || '').trim();
      if (!newName) {
        window.showToast('Por favor, informe um nome válido', 'error');
        return;
      }

      if (btnRenameSave) {
        btnRenameSave.disabled = true;
        btnRenameSave.textContent = 'Salvando...';
      }

      try {
        if (ctxItem.type === 'project') {
          await window.API.updateProject(ctxItem.id, { name: newName });
          ctxItem.item.name = newName;
        } else if (ctxItem.type === 'folder') {
          await window.API.setFolderComments(ctxItem.projectId, ctxItem.id, ctxItem.item.allowComments, newName);
          ctxItem.item.name = newName;
        } else if (ctxItem.type === 'file') {
          await window.API.setVideoComments(ctxItem.projectId, ctxItem.id, ctxItem.item.allowComments, newName);
          ctxItem.item.title = newName;
          ctxItem.item.fileName = newName;
        } else if (ctxItem.type === 'division') {
          await window.API.updateDivision(ctxItem.id, { name: newName });
          ctxItem.item.name = newName;
        } else if (ctxItem.type === 'category') {
          const res = await window.API.renameCategory(ctxItem.id, newName);
          if (res && res.categories) this.data.categories = res.categories;
          ctxItem.item.name = newName;
          if (this.lobbyCategoryFilter === ctxItem.title) {
            this.lobbyCategoryFilter = newName;
          }
          if (this.sidebarCollapsedCategories && this.sidebarCollapsedCategories.has(ctxItem.title)) {
            this.sidebarCollapsedCategories.delete(ctxItem.title);
            this.sidebarCollapsedCategories.add(newName);
            this.saveCollapsedCategories();
          }
        }

        this.closeUniversalRenameModal();
        window.showToast(`"${newName}" renomeado com sucesso! ✓`);

        await this.fetchData();
        this.populateCategorySelects();
        this.renderSidebar();
        this.renderMainContent();
      } catch (err) {
        console.error('Erro ao renomear:', err);
        window.showToast('Erro ao renomear: ' + err.message, 'error');
      } finally {
        if (btnRenameSave) {
          btnRenameSave.disabled = false;
          btnRenameSave.textContent = 'Salvar Nome';
        }
      }
    };

    btnRenameSave?.addEventListener('click', handleSaveRename);
    inputRename?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSaveRename();
      } else if (e.key === 'Escape') {
        this.closeUniversalRenameModal();
      }
    });

    // 2. Remove Cloud Modal Events
    const removeCloudModal = document.getElementById('modalRemoveCloud');
    const btnRemoveCloudClose = document.getElementById('btnRemoveCloudClose');
    const btnRemoveCloudCancel = document.getElementById('btnRemoveCloudCancel');
    const btnRemoveCloudConfirm = document.getElementById('btnRemoveCloudConfirm');

    btnRemoveCloudClose?.addEventListener('click', () => this.closeRemoveCloudModal());
    btnRemoveCloudCancel?.addEventListener('click', () => this.closeRemoveCloudModal());
    removeCloudModal?.addEventListener('click', (e) => {
      if (e.target === removeCloudModal) this.closeRemoveCloudModal();
    });

    btnRemoveCloudConfirm?.addEventListener('click', async () => {
      if (!this.activeRemoveCloudItem) return;
      const ctxItem = this.activeRemoveCloudItem;

      if (btnRemoveCloudConfirm) {
        btnRemoveCloudConfirm.disabled = true;
        btnRemoveCloudConfirm.textContent = 'Removendo...';
      }

      try {
        await window.API.deleteProject(ctxItem.id, false);
        this.closeRemoveCloudModal();
        window.showToast(`Diretório "${ctxItem.title}" removido do Cloud (mantido no Google Drive) ✓`);

        await this.fetchData();
        if (this.selectedProject && this.selectedProject.id === ctxItem.id) {
          this.selectProject(null);
        } else {
          this.renderSidebar();
          this.renderMainContent();
        }
      } catch (err) {
        console.error('Erro ao remover do Cloud:', err);
        window.showToast('Erro ao remover do Cloud: ' + err.message, 'error');
      } finally {
        if (btnRemoveCloudConfirm) {
          btnRemoveCloudConfirm.disabled = false;
          btnRemoveCloudConfirm.textContent = 'Remover do Cloud';
        }
      }
    });

    // 3. Delete Drive Modal Events (2 Confirmações)
    const deleteDriveModal = document.getElementById('modalDeleteDrive');
    const btnDeleteClose = document.getElementById('btnDeleteDriveClose');
    const btnDeleteCancel = document.getElementById('btnDeleteDriveCancel');
    const btnStep1Next = document.getElementById('btnDeleteDriveStep1Next');
    const btnConfirmFinal = document.getElementById('btnDeleteDriveConfirm');

    btnDeleteClose?.addEventListener('click', () => this.closeDeleteDriveModal());
    btnDeleteCancel?.addEventListener('click', () => this.closeDeleteDriveModal());
    deleteDriveModal?.addEventListener('click', (e) => {
      if (e.target === deleteDriveModal) this.closeDeleteDriveModal();
    });

    // Etapa 1 -> Etapa 2
    btnStep1Next?.addEventListener('click', () => {
      const step1 = document.getElementById('deleteDriveStep1');
      const step2 = document.getElementById('deleteDriveStep2');
      if (step1) step1.style.display = 'none';
      if (step2) step2.style.display = 'flex';
      if (btnStep1Next) btnStep1Next.style.display = 'none';
      if (btnConfirmFinal) btnConfirmFinal.style.display = 'inline-flex';
    });

    // Etapa 2 -> Confirmação Definitiva
    btnConfirmFinal?.addEventListener('click', async () => {
      if (!this.activeDeleteDriveItem) return;
      const ctxItem = this.activeDeleteDriveItem;

      if (btnConfirmFinal) {
        btnConfirmFinal.disabled = true;
        btnConfirmFinal.textContent = 'Excluindo definitivamente...';
      }

      try {
        if (ctxItem.type === 'project') {
          await window.API.deleteProject(ctxItem.id, true);
        } else if (ctxItem.type === 'folder') {
          await window.API.deleteFolder(ctxItem.projectId, ctxItem.id, true);
        } else if (ctxItem.type === 'file') {
          await window.API.deleteVideo(ctxItem.projectId, ctxItem.id, true);
        } else if (ctxItem.type === 'division') {
          await window.API.deleteDivision(ctxItem.id);
        } else if (ctxItem.type === 'category') {
          await window.API.deleteCategory(ctxItem.id);
        }

        this.closeDeleteDriveModal();
        window.showToast(`"${ctxItem.title}" excluído do Google Drive e do sistema com sucesso! ✓`);

        await this.fetchData();
        if (ctxItem.type === 'project' && this.selectedProject && this.selectedProject.id === ctxItem.id) {
          this.selectProject(null);
        } else {
          this.renderSidebar();
          this.renderMainContent();
        }
      } catch (err) {
        console.error('Erro ao excluir definitivamente:', err);
        window.showToast('Erro ao excluir: ' + err.message, 'error');
      } finally {
        if (btnConfirmFinal) {
          btnConfirmFinal.disabled = false;
          btnConfirmFinal.textContent = 'Sim, Excluir Definitivamente do Drive';
        }
      }
    });

    // Dismiss any open universal modal on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (renameModal?.classList.contains('open')) this.closeUniversalRenameModal();
        if (removeCloudModal?.classList.contains('open')) this.closeRemoveCloudModal();
        if (deleteDriveModal?.classList.contains('open')) this.closeDeleteDriveModal();
      }
    });
  }

  resetAddCategoryModal() {
    const inputName = document.getElementById('newCategoryName');
    const inputColor = document.getElementById('newCategoryColor');
    const colorLabel = document.getElementById('newCategoryColorLabel');
    const defaultBtn = document.getElementById('btnAddCatDefaultColor');
    const swatches = document.querySelectorAll('#newCatPaletteGrid .new-cat-swatch-btn');

    if (inputName) inputName.value = '';
    if (inputColor) inputColor.value = '#FF5400';
    if (colorLabel) {
      colorLabel.textContent = 'Padrão';
      colorLabel.style.color = '#FF5400';
    }
    if (defaultBtn) defaultBtn.classList.add('selected');
    swatches.forEach(s => s.classList.remove('selected'));
  }

  setupAddCategoryColorPicker() {
    const defaultBtn = document.getElementById('btnAddCatDefaultColor');
    const inputColor = document.getElementById('newCategoryColor');
    const colorLabel = document.getElementById('newCategoryColorLabel');
    const hoverLabel = document.getElementById('newCatHoverColorName');
    const swatches = document.querySelectorAll('#newCatPaletteGrid .new-cat-swatch-btn');

    defaultBtn?.addEventListener('click', () => {
      if (inputColor) inputColor.value = '#FF5400';
      if (colorLabel) {
        colorLabel.textContent = 'Padrão';
        colorLabel.style.color = '#FF5400';
      }
      defaultBtn.classList.add('selected');
      swatches.forEach(s => s.classList.remove('selected'));
    });

    swatches.forEach(btn => {
      btn.addEventListener('click', () => {
        const hex = btn.getAttribute('data-color');
        const name = btn.getAttribute('data-name');
        if (inputColor && hex) inputColor.value = hex;
        if (colorLabel && name) {
          colorLabel.textContent = name;
          colorLabel.style.color = hex;
        }
        defaultBtn?.classList.remove('selected');
        swatches.forEach(s => s.classList.remove('selected'));
        btn.classList.add('selected');
      });

      btn.addEventListener('mouseenter', () => {
        const name = btn.getAttribute('data-name');
        if (hoverLabel && name) hoverLabel.textContent = name;
      });
    });

    document.getElementById('newCatPaletteGrid')?.addEventListener('mouseleave', () => {
      if (hoverLabel) {
        const curHex = inputColor ? inputColor.value : '#FF5400';
        const found = CATEGORY_COLORS.find(c => c.hex.toLowerCase() === curHex.toLowerCase());
        hoverLabel.textContent = found ? found.name : 'Selecione uma cor';
      }
    });
  }

  bindGlobalEvents() {
    // Floating theme toggle button
    document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
      this.toggleTheme();
    });

    // Menu de contexto do botão (+) na Sidebar (+ Diretório ou + Categoria)
    const btnAddMenuToggle = document.getElementById('btnAddMenuToggle');
    const sidebarAddMenu = document.getElementById('sidebarAddMenu');
    const sidebarAddWrapper = document.getElementById('sidebarAddWrapper');

    btnAddMenuToggle?.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebarAddMenu?.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (sidebarAddWrapper && !sidebarAddWrapper.contains(e.target)) {
        sidebarAddMenu?.classList.remove('open');
      }
    });

    document.getElementById('sidebarBackdrop')?.addEventListener('click', () => {
      this.closeMobileSidebar();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) {
        this.closeMobileSidebar();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMobileSidebar();
      }
    });

    document.getElementById('btnEditCategories')?.addEventListener('click', () => {
      this.closeMobileSidebar();
      this.openManageCategoriesModal();
    });

    document.getElementById('btnManageOpenAddCategory')?.addEventListener('click', () => {
      this.closeMobileSidebar();
      document.getElementById('modalManageCategories')?.classList.remove('open');
      this.resetAddCategoryModal();
      document.getElementById('modalAddCategory')?.classList.add('open');
      setTimeout(() => document.getElementById('newCategoryName')?.focus(), 80);
    });

    document.getElementById('btnManageCategoriesDone')?.addEventListener('click', () => {
      this.handleDoneManageCategories();
    });

    document.getElementById('btnAddDirectoryAction')?.addEventListener('click', () => {
      this.closeMobileSidebar();
      sidebarAddMenu?.classList.remove('open');
      this.openAddDirectoryModal();
    });

    document.getElementById('btnAddAccountAction')?.addEventListener('click', (e) => {
      e?.stopPropagation();
      this.closeMobileSidebar();
      sidebarAddMenu?.classList.remove('open');
      this.openManageAccountsModal();
    });

    // Live link provider and single file detection on new directory modal
    const inputDriveModal = document.getElementById('newProjDrive');
    inputDriveModal?.addEventListener('input', () => {
      const url = inputDriveModal.value.trim();
      const provider = this.detectCloudProvider(url);
      const isFile = this.isLinkAFile(url);
      const badge = document.getElementById('newProjProviderBadge');
      if (badge) {
        const dummy = document.createElement('div');
        dummy.innerHTML = this.getCloudProviderBadgeHtml(provider, isFile);
        if (dummy.firstElementChild) badge.replaceWith(dummy.firstElementChild);
      }

      const titleEl = document.getElementById('titleModalAddDirectory');
      const labelName = document.getElementById('labelNewProjName');
      const inputName = document.getElementById('newProjName');
      const submitBtn = document.getElementById('btnSubmitAddDirectory');
      const loadText = document.querySelector('#addDirectoryLoading span:last-child');

      if (isFile) {
        if (titleEl) titleEl.textContent = 'Adicionar Arquivo à Divisão';
        if (labelName) labelName.textContent = 'Nome do Arquivo';
        if (inputName && !inputName.value) inputName.placeholder = 'Ex: Nome do Arquivo';
        if (submitBtn) submitBtn.textContent = 'Adicionar Arquivo';
        if (loadText) loadText.textContent = 'Importando arquivo...';
      } else {
        if (titleEl) titleEl.textContent = 'Novo Diretório';
        if (labelName) labelName.textContent = 'Nome do Projeto';
        if (inputName && !inputName.value) inputName.placeholder = 'Ex: 261024-SIGEM-NOME DO PROJETO';
        if (submitBtn) submitBtn.textContent = 'Criar e Espelhar';
        if (loadText) loadText.textContent = 'Espelhando diretório...';
      }
    });

    // Form Connect Cloud Account Submit
    document.getElementById('formConnectAccount')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const provider = document.getElementById('connectProvider')?.value || 'google';
      const name = document.getElementById('connectAccountName')?.value.trim();
      const email = document.getElementById('connectAccountEmail')?.value.trim();
      const credential = document.getElementById('connectCredentialValue')?.value.trim();
      const submitBtn = document.getElementById('btnSubmitConnectAccount');

      if (!name) return;

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Conectando...';
        }
        await API.addAccount({ provider, name, email, credential });
        window.showToast(`Conta "${name}" conectada com sucesso!`);
        document.getElementById('modalConnectAccount')?.classList.remove('open');
        this.openManageAccountsModal();
      } catch (err) {
        alert('Erro ao conectar conta: ' + err.message);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Salvar e Conectar';
        }
      }
    });

    document.getElementById('btnCancelConnectAccount')?.addEventListener('click', () => {
      document.getElementById('modalConnectAccount')?.classList.remove('open');
      this.openManageAccountsModal();
    });

    document.getElementById('btnAddDivisionAction')?.addEventListener('click', () => {
      this.closeMobileSidebar();
      sidebarAddMenu?.classList.remove('open');
      this.openAddDivisionModal();
    });

    document.getElementById('btnAddCategoryAction')?.addEventListener('click', () => {
      this.closeMobileSidebar();
      sidebarAddMenu?.classList.remove('open');
      this.resetAddCategoryModal();
      document.getElementById('modalAddCategory')?.classList.add('open');
      setTimeout(() => document.getElementById('newCategoryName')?.focus(), 80);
    });

    // Form Add Category Submit
    document.getElementById('formAddCategory')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('newCategoryName');
      const name = input ? input.value.trim() : '';
      if (!name) return;

      const colorInput = document.getElementById('newCategoryColor');
      const colorVal = colorInput && colorInput.value ? colorInput.value.trim() : '#FF5400';
      const color = colorVal.toUpperCase() === '#FF5400' ? null : colorVal;

      try {
        const res = await window.API.createCategory(name, color);
        if (res && res.categories) {
          this.data.categories = res.categories;
        } else if (res && res.category) {
          this.data.categories = this.data.categories || [];
          this.data.categories.push(res.category);
        }
        if (Array.isArray(this.data.categories)) {
          this.data.categories.sort((a, b) => 
            (a.name || '').localeCompare(b.name || '', 'pt-BR', { numeric: true, sensitivity: 'base' })
          );
        }
        document.getElementById('modalAddCategory')?.classList.remove('open');
        this.resetAddCategoryModal();
        this.populateCategorySelects(name);
        this.lobbyCategoryFilter = name;
        this.selectedProject = null;
        this.selectedVideo = null;
        this.currentView = 'author_lobby';
        this.render();
        window.showToast(`Categoria "${name}" criada com sucesso!`);
      } catch (err) {
        window.showToast(err.message || 'Erro ao criar categoria', 'error');
      }
    });

    // Close buttons on all modals
    document.querySelectorAll('.modal-close-btn, .btn-modal-cancel').forEach(btn => {
      btn.addEventListener('click', () => {
        const parentBackdrop = btn.closest('.modal-backdrop');
        if (parentBackdrop && parentBackdrop.id === 'modalConfirmRenameMedia') {
          parentBackdrop.classList.remove('open');
          this.pendingMediaSaveCallback = null;
          return;
        }
        if (parentBackdrop && parentBackdrop.id === 'modalSettings') {
          this.applyThemeColor(this.getDefaultColor());
        }
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
      });
    });

    // MsgBox Confirmação de alteração no Google Drive
    document.getElementById('btnCancelRenameMedia')?.addEventListener('click', () => {
      document.getElementById('modalConfirmRenameMedia')?.classList.remove('open');
      this.pendingMediaSaveCallback = null;
    });
    document.getElementById('btnCancelRenameMediaX')?.addEventListener('click', () => {
      document.getElementById('modalConfirmRenameMedia')?.classList.remove('open');
      this.pendingMediaSaveCallback = null;
    });
    document.getElementById('btnProceedRenameMedia')?.addEventListener('click', async () => {
      if (typeof this.pendingMediaSaveCallback === 'function') {
        const cb = this.pendingMediaSaveCallback;
        this.pendingMediaSaveCallback = null;
        await cb();
      }
    });

    // Modal de Confirmação de Fixar Pasta como Novo Diretório (Pin)
    const modalPin = document.getElementById('modalConfirmPinFolder');
    document.getElementById('btnCancelPinFolder')?.addEventListener('click', () => {
      modalPin?.classList.remove('open');
      this.pendingPinFolder = null;
    });
    modalPin?.addEventListener('click', (e) => {
      if (e.target === modalPin) {
        modalPin.classList.remove('open');
        this.pendingPinFolder = null;
      }
    });
    document.getElementById('btnConfirmPinFolder')?.addEventListener('click', async () => {
      modalPin?.classList.remove('open');
      await this.executePinCurrentFolder();
    });

    // Form Add Division Submit
    document.getElementById('formAddDivision')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('newDivisionName')?.value.trim();
      const category = document.getElementById('newDivisionCategory')?.value.trim();
      const parentId = document.getElementById('newDivisionParent')?.value.trim() || null;
      if (!name || !category) return;

      const submitBtn = document.getElementById('btnSubmitAddDivision');
      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Criando...';
        }
        const res = await window.API.createDivision(name, category, parentId);
        if (res && res.divisions) {
          this.data.divisions = res.divisions;
        }
        await this.fetchData();
        document.getElementById('modalAddDivision')?.classList.remove('open');
        this.populateCategorySelects();
        this.render();
        window.showToast(`Divisão "${name}" criada com sucesso!`);
      } catch (err) {
        window.showToast(err.message || 'Erro ao criar divisão', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Criar Divisão';
        }
      }
    });

    // Form Edit Division Submit
    document.getElementById('formEditDivision')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('editDivisionId')?.value;
      const name = document.getElementById('editDivisionName')?.value.trim();
      const category = document.getElementById('editDivisionCategory')?.value.trim();
      const parentId = document.getElementById('editDivisionParent')?.value.trim() || null;
      if (!id || !name || !category) return;

      const submitBtn = e.target.querySelector('button[type="submit"]');
      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Salvando...';
        }
        const res = await window.API.updateDivision(id, { name, category, parentId });
        if (res && res.divisions) {
          this.data.divisions = res.divisions;
        }
        await this.fetchData();
        document.getElementById('modalEditDivision')?.classList.remove('open');
        this.populateCategorySelects();
        this.render();
        window.showToast(`Divisão "${name}" atualizada com sucesso!`);
      } catch (err) {
        window.showToast(err.message || 'Erro ao atualizar divisão', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Salvar';
        }
      }
    });

    // Delete Division Button (inside Edit Modal)
    document.getElementById('btnDeleteDivision')?.addEventListener('click', () => {
      const id = document.getElementById('editDivisionId')?.value;
      const div = (this.data?.divisions || []).find(d => d.id === id);
      if (div) {
        this.confirmDeleteDivision(div);
      }
    });

    // Division Context Menu Actions
    document.getElementById('ctxDivisionAddSub')?.addEventListener('click', () => {
      const div = this.activeContextMenuDivision;
      const divMenu = document.getElementById('divisionContextMenu');
      if (divMenu) divMenu.style.display = 'none';
      if (div) {
        this.openAddDivisionModal(div.category, div.id);
      }
    });

    document.getElementById('ctxDivisionRename')?.addEventListener('click', () => {
      const div = this.activeContextMenuDivision;
      const divMenu = document.getElementById('divisionContextMenu');
      if (divMenu) divMenu.style.display = 'none';
      if (div) {
        this.openEditDivisionModal(div);
      }
    });

    document.getElementById('ctxDivisionDelete')?.addEventListener('click', () => {
      const div = this.activeContextMenuDivision;
      const divMenu = document.getElementById('divisionContextMenu');
      if (divMenu) divMenu.style.display = 'none';
      if (div) {
        this.confirmDeleteDivision(div);
      }
    });

    // Confirm Delete Division Modal Events (Identidade Giffú Cloud)
    const modalDeleteDiv = document.getElementById('modalConfirmDeleteDivision');
    const btnCancelDelDiv = document.getElementById('btnCancelDeleteDivision');
    const btnCancelDelDivX = document.getElementById('btnCancelDeleteDivisionX');
    const btnConfirmDelDiv = document.getElementById('btnConfirmDeleteDivisionAction');

    btnCancelDelDiv?.addEventListener('click', () => this.closeConfirmDeleteDivisionModal());
    btnCancelDelDivX?.addEventListener('click', () => this.closeConfirmDeleteDivisionModal());
    modalDeleteDiv?.addEventListener('click', (e) => {
      if (e.target === modalDeleteDiv) this.closeConfirmDeleteDivisionModal();
    });

    btnConfirmDelDiv?.addEventListener('click', async () => {
      const div = this.pendingDeleteDivision;
      if (!div) return;

      if (btnConfirmDelDiv) {
        btnConfirmDelDiv.disabled = true;
        btnConfirmDelDiv.textContent = 'Excluindo...';
      }

      try {
        const res = await window.API.deleteDivision(div.id);
        if (res && res.divisions) {
          this.data.divisions = res.divisions;
        }
        await this.fetchData();
        this.closeConfirmDeleteDivisionModal();
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
        this.render();
        window.showToast(`Divisão "${div.name}" excluída com sucesso! ✓`);
      } catch (err) {
        window.showToast(err.message || 'Erro ao excluir divisão', 'error');
      } finally {
        if (btnConfirmDelDiv) {
          btnConfirmDelDiv.disabled = false;
          btnConfirmDelDiv.textContent = 'Excluir';
        }
      }
    });

    // Dismiss division context menu on click outside, scroll, resize or Escape
    document.addEventListener('click', (e) => {
      const divMenu = document.getElementById('divisionContextMenu');
      if (divMenu && divMenu.style.display !== 'none' && !divMenu.contains(e.target) && !e.target.closest('.btn-division-opt')) {
        divMenu.style.display = 'none';
        this.activeContextMenuDivision = null;
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const divMenu = document.getElementById('divisionContextMenu');
        if (divMenu && divMenu.style.display !== 'none') {
          divMenu.style.display = 'none';
          this.activeContextMenuDivision = null;
        }
        if (modalDeleteDiv?.classList.contains('open')) {
          this.closeConfirmDeleteDivisionModal();
        }
      }
    });

    window.addEventListener('scroll', () => {
      const divMenu = document.getElementById('divisionContextMenu');
      if (divMenu && divMenu.style.display !== 'none') {
        divMenu.style.display = 'none';
        this.activeContextMenuDivision = null;
      }
    }, { passive: true });

    window.addEventListener('resize', () => {
      const divMenu = document.getElementById('divisionContextMenu');
      if (divMenu && divMenu.style.display !== 'none') {
        divMenu.style.display = 'none';
        this.activeContextMenuDivision = null;
      }
    }, { passive: true });

    // Form Add Directory Submit
    document.getElementById('formAddDirectory')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('newProjName').value.trim();
      const clientName = document.getElementById('newProjClient').value.trim();
      const defaultCat = (this.getCategories()[0] && this.getCategories()[0].name) || 'Categoria Padrão';
      const category = document.getElementById('newProjCategory')?.value || defaultCat;
      const divisionId = document.getElementById('newProjDivision')?.value || null;
      const driveLink = document.getElementById('newProjDrive').value.trim();
      const password = document.getElementById('newProjPassword').value.trim();
      const allowComments = document.getElementById('newProjAllowComments').checked;
      const hideBrandName = document.getElementById('newProjHideBrand')
        ? document.getElementById('newProjHideBrand').checked
        : true;
      const allowShare = document.getElementById('newProjAllowShare')
        ? document.getElementById('newProjAllowShare').checked
        : true;
      const currentYear = new Date().getFullYear().toString();

      const loaderEl = document.getElementById('addDirectoryLoading');
      const submitBtn = document.getElementById('btnSubmitAddDirectory') || e.target.querySelector('button[type="submit"]');
      const cancelBtn = e.target.querySelector('.btn-modal-cancel');

      try {
        if (loaderEl) loaderEl.style.display = 'flex';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.style.opacity = '0.7';
          submitBtn.style.cursor = 'not-allowed';
        }
        if (cancelBtn) {
          cancelBtn.disabled = true;
          cancelBtn.style.pointerEvents = 'none';
        }

        if (driveLink && window.Auth && !window.Auth.driveConnected) {
          const user = await window.Auth.signIn('author');
          if (user) this.authorSession = user;
        }

        const newProj = await window.API.createProject({
          name,
          clientName,
          category,
          divisionId,
          driveLink,
          password,
          allowComments,
          allowShare,
          hideBrandName,
          year: currentYear
        });

        await this.fetchData();
        this.selectedProject = newProj;
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
        window.showToast('Novo diretório criado com sucesso!');
        this.render();
      } catch (err) {
        window.showAppAlert(err.message || 'Erro ao criar diretório', 'Aviso do Google Drive');
      } finally {
        if (loaderEl) loaderEl.style.display = 'none';
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '';
          submitBtn.style.cursor = '';
        }
        if (cancelBtn) {
          cancelBtn.disabled = false;
          cancelBtn.style.pointerEvents = '';
        }
      }
    });

    // Form Edit Project Submit
    document.getElementById('formEditProject')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!this.selectedProject) return;

      const name = document.getElementById('editProjName').value.trim();
      const clientName = document.getElementById('editProjClient').value.trim();
      const defaultCat = (this.getCategories()[0] && this.getCategories()[0].name) || 'Categoria Padrão';
      const category = document.getElementById('editProjCategory')?.value || defaultCat;
      const divisionId = document.getElementById('editProjDivision')?.value || null;
      const driveLink = document.getElementById('editProjDrive').value.trim();
      const password = document.getElementById('editProjPassword').value.trim();
      const allowComments = document.getElementById('editProjAllowComments').checked;
      const hideBrandName = document.getElementById('editProjHideBrand')
        ? document.getElementById('editProjHideBrand').checked
        : true;
      const allowShare = document.getElementById('editProjAllowShare')
        ? document.getElementById('editProjAllowShare').checked
        : true;

      const loaderEl = document.getElementById('editDirectoryLoading');
      const submitBtn = document.getElementById('btnSubmitEditProject') || e.target.querySelector('button[type="submit"]');
      const cancelBtn = e.target.querySelector('.btn-modal-cancel');
      const archiveBtn = document.getElementById('btnToggleArchiveProject');

      try {
        if (loaderEl) loaderEl.style.display = 'flex';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.style.opacity = '0.7';
          submitBtn.style.cursor = 'not-allowed';
        }
        if (cancelBtn) {
          cancelBtn.disabled = true;
          cancelBtn.style.pointerEvents = 'none';
        }
        if (archiveBtn) {
          archiveBtn.disabled = true;
          archiveBtn.style.pointerEvents = 'none';
        }

        if (driveLink && window.Auth && !window.Auth.driveConnected) {
          const user = await window.Auth.signIn('author');
          if (user) this.authorSession = user;
        }

        const updated = await window.API.updateProject(this.selectedProject.id, {
          name,
          clientName,
          category,
          divisionId,
          driveLink,
          password,
          allowComments,
          allowShare,
          hideBrandName
        });

        await this.fetchData();
        this.selectedProject = updated;
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
        window.showToast('Diretório e configurações atualizados!');
        const mainContentArea = document.getElementById('mainContentArea');
        this.syncSidebarActiveProject(updated);
        if (this.galleryViewMode === 'columns' && mainContentArea) {
          this.updateGalleryDynamicArea(mainContentArea);
        } else {
          this.render();
        }
      } catch (err) {
        window.showAppAlert(err.message || 'Erro ao atualizar diretório', 'Aviso do Google Drive');
      } finally {
        if (loaderEl) loaderEl.style.display = 'none';
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '';
          submitBtn.style.cursor = '';
        }
        if (cancelBtn) {
          cancelBtn.disabled = false;
          cancelBtn.style.pointerEvents = '';
        }
        if (archiveBtn) {
          archiveBtn.disabled = false;
          archiveBtn.style.pointerEvents = '';
        }
      }
    });

    // Form Edit Media Submit
    document.getElementById('formEditMedia')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!this.editingMedia || !this.editingMedia.vid || !this.editingMedia.proj) return;
      const { vid, proj, initialTitle } = this.editingMedia;
      const title = document.getElementById('editMediaTitle')?.value.trim();
      const allowComments = Boolean(document.getElementById('editMediaAllowComments')?.checked);
      const hideBrandName = document.getElementById('editMediaHideBrand')
        ? document.getElementById('editMediaHideBrand').checked
        : true;
      const allowShare = document.getElementById('editMediaAllowShare')
        ? document.getElementById('editMediaAllowShare').checked
        : true;
      const rawPasswordInput = document.getElementById('editMediaPassword')
        ? document.getElementById('editMediaPassword').value.trim()
        : '';
      const inheritedPwdInfo = this.getInheritedPasswordInfoForVideo(vid, proj);
      // Se o valor digitado for exatamente igual à senha herdada do pai (ou vazio), não grava cópia redundante no filho
      const passwordToSave = (inheritedPwdInfo && rawPasswordInput === inheritedPwdInfo.password)
        ? ''
        : rawPasswordInput;
      const btnSave = document.getElementById('btnSaveEditMedia');
      const btnProceed = document.getElementById('btnProceedRenameMedia');

      const executeSave = async () => {
        try {
          if (btnSave) {
            btnSave.disabled = true;
            btnSave.textContent = 'Salvando no Drive...';
          }
          if (btnProceed) {
            btnProceed.disabled = true;
            btnProceed.textContent = 'Salvando no Drive...';
          }

          const res = await window.API.setVideoComments(proj.id, vid.id, allowComments, title, hideBrandName, allowShare, undefined, passwordToSave);
          vid.allowComments = allowComments;
          vid.hideBrandName = hideBrandName;
          vid.allowShare = allowShare;
          vid.password = passwordToSave || null;
          vid.hasOwnPassword = Boolean(passwordToSave);
          if (res && res.video) {
            if (res.video.title) vid.title = res.video.title;
            if (res.video.fileName) vid.fileName = res.video.fileName;
          } else if (title) {
            vid.fileName = title;
            vid.title = title.replace(/\.[^.]+$/, '') || title;
          }

          const pVid = (proj.videos || []).find(v => v.id === vid.id);
          if (pVid) {
            pVid.allowComments = allowComments;
            pVid.hideBrandName = hideBrandName;
            pVid.allowShare = allowShare;
            pVid.password = passwordToSave || null;
            pVid.hasOwnPassword = Boolean(passwordToSave);
            pVid.title = vid.title;
            pVid.fileName = vid.fileName;
          }

          document.getElementById('modalConfirmRenameMedia')?.classList.remove('open');
          document.getElementById('modalEditMedia')?.classList.remove('open');
          window.showToast('Arquivo e Google Drive atualizados com sucesso!');
          const mainContentArea = document.getElementById('mainContentArea');
          if (this.galleryViewMode === 'columns' && mainContentArea) {
            this.updateGalleryDynamicArea(mainContentArea);
          } else {
            this.render();
          }
        } catch (err) {
          alert(err.message || 'Erro ao atualizar configurações do arquivo');
        } finally {
          if (btnSave) {
            btnSave.disabled = false;
            btnSave.textContent = 'Salvar Alterações';
          }
          if (btnProceed) {
            btnProceed.disabled = false;
            btnProceed.textContent = 'Proceder';
          }
        }
      };

      const isTitleChanged = Boolean(title && title !== initialTitle);
      if (isTitleChanged) {
        // Exibe msgBox "A alteração no nome do arquivo afetará o NOME ORIGINAL no seu Google Drive. Tenha cuidado principalmente com a extensão do arquivo."
        const confirmModal = document.getElementById('modalConfirmRenameMedia');
        if (confirmModal) {
          this.pendingMediaSaveCallback = executeSave;
          confirmModal.classList.add('open');
          return;
        }
      }

      await executeSave();
    });

    // Form Edit Folder Submit
    document.getElementById('formEditFolder')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!this.editingFolder || !this.editingFolder.folder || !this.editingFolder.proj) return;
      const { folder, proj } = this.editingFolder;
      const name = document.getElementById('editFolderName')?.value.trim();
      const allowComments = Boolean(document.getElementById('editFolderAllowComments')?.checked);
      const hideBrandName = document.getElementById('editFolderHideBrand')
        ? document.getElementById('editFolderHideBrand').checked
        : true;
      const allowShare = document.getElementById('editFolderAllowShare')
        ? document.getElementById('editFolderAllowShare').checked
        : true;
      const rawPasswordInput = document.getElementById('editFolderPassword')
        ? document.getElementById('editFolderPassword').value.trim()
        : '';
      const inheritedPwdInfo = this.getInheritedPasswordInfoForFolder(folder, proj);
      const passwordToSave = (inheritedPwdInfo && rawPasswordInput === inheritedPwdInfo.password)
        ? ''
        : rawPasswordInput;
      const btnSave = document.getElementById('btnSaveEditFolder');

      try {
        if (btnSave) {
          btnSave.disabled = true;
          btnSave.textContent = 'Salvando...';
        }

        await window.API.setFolderComments(proj.id, folder.id, allowComments, name, hideBrandName, allowShare, undefined, passwordToSave);
        folder.allowComments = allowComments;
        folder.hideBrandName = hideBrandName;
        folder.allowShare = allowShare;
        folder.password = passwordToSave || null;
        folder.hasOwnPassword = Boolean(passwordToSave);
        if (name) folder.name = name;
        const pFolder = (proj.folders || []).find(f => f.id === folder.id);
        if (pFolder) {
          pFolder.allowComments = allowComments;
          pFolder.hideBrandName = hideBrandName;
          pFolder.allowShare = allowShare;
          pFolder.password = passwordToSave || null;
          pFolder.hasOwnPassword = Boolean(passwordToSave);
          if (name) pFolder.name = name;
        }

        document.getElementById('modalEditFolder')?.classList.remove('open');
        window.showToast('Configurações da pasta atualizadas!');
        const mainContentArea = document.getElementById('mainContentArea');
        this.syncSidebarActiveProject(proj);
        if (this.galleryViewMode === 'columns' && mainContentArea) {
          this.updateGalleryDynamicArea(mainContentArea);
        } else {
          this.render();
        }
      } catch (err) {
        alert(err.message || 'Erro ao atualizar configurações da pasta');
      } finally {
        if (btnSave) {
          btnSave.disabled = false;
          btnSave.textContent = 'Salvar Alterações';
        }
      }
    });



    // Settings Modal
    const chkAutoDeleteResolved = document.getElementById('settingAutoDeleteResolved');
    const inputAutoDeleteDays = document.getElementById('settingAutoDeleteResolvedDays');
    const syncAutoDeleteInputState = () => {
      if (inputAutoDeleteDays && chkAutoDeleteResolved) {
        inputAutoDeleteDays.disabled = !chkAutoDeleteResolved.checked;
        inputAutoDeleteDays.classList.toggle('is-disabled', !chkAutoDeleteResolved.checked);
      }
    };
    chkAutoDeleteResolved?.addEventListener('change', syncAutoDeleteInputState);

    document.getElementById('btnSidebarSettings')?.addEventListener('click', () => {
      const modal = document.getElementById('modalSettings');
      if (modal) {
        document.getElementById('settingAuthorName').value = this.getAuthorBrandName();
        const currentDefMode = this.getDefaultViewMode();
        const radioGrid = document.getElementById('settingDefaultViewModeGrid');
        const radioCols = document.getElementById('settingDefaultViewModeColumns');
        if (radioGrid && radioCols) {
          radioGrid.checked = (currentDefMode !== 'columns');
          radioCols.checked = (currentDefMode === 'columns');
        }
        const currentCoverMode = this.getVideoCoverMode();
        const radioCoverFirst = document.getElementById('settingVideoCoverModeFirst');
        const radioCoverAuto = document.getElementById('settingVideoCoverModeAuto');
        if (radioCoverFirst && radioCoverAuto) {
          radioCoverFirst.checked = (currentCoverMode === 'first_frame');
          radioCoverAuto.checked = (currentCoverMode !== 'first_frame');
        }
        const chkShowExt = document.getElementById('settingShowFileExtensions');
        if (chkShowExt) {
          chkShowExt.checked = Boolean(this.data?.settings?.showFileExtensions);
        }
        if (chkAutoDeleteResolved) {
          chkAutoDeleteResolved.checked = Boolean(this.data?.settings?.autoDeleteResolvedNotifications);
        }
        if (inputAutoDeleteDays) {
          const savedDays = parseInt(this.data?.settings?.autoDeleteResolvedDays, 10);
          inputAutoDeleteDays.value = (!Number.isNaN(savedDays) && savedDays >= 1) ? savedDays : 7;
        }
        syncAutoDeleteInputState();
        this.renderSettingsColorPicker(this.getDefaultColor());
        modal.classList.add('open');
      }
    });

    const saveSettingsHandler = async (e) => {
      if (e) e.preventDefault();
      const authorNameInput = document.getElementById('settingAuthorName');
      const authorName = authorNameInput ? authorNameInput.value.trim() : '';
      if (!authorName) {
        window.showToast('Por favor, informe o Nome do Autor / Estúdio', 'error');
        if (authorNameInput) authorNameInput.focus();
        return;
      }
      const showFileExtensions = Boolean(document.getElementById('settingShowFileExtensions')?.checked);
      const defaultViewMode = document.getElementById('settingDefaultViewModeColumns')?.checked ? 'columns' : 'grid';
      const videoCoverMode = document.getElementById('settingVideoCoverModeFirst')?.checked ? 'first_frame' : 'auto';
      const defaultColor = document.getElementById('settingDefaultColor')?.value || this.getDefaultColor();
      const autoDeleteResolvedNotifications = Boolean(document.getElementById('settingAutoDeleteResolved')?.checked);
      const rawDays = parseInt(document.getElementById('settingAutoDeleteResolvedDays')?.value, 10);
      const autoDeleteResolvedDays = (!Number.isNaN(rawDays) && rawDays >= 1) ? Math.min(365, rawDays) : 7;

      const btnSave = document.getElementById('btnSaveSettings') || document.querySelector('#formSettings button[type="submit"]');
      if (btnSave) {
        btnSave.disabled = true;
        btnSave.textContent = 'Salvando...';
      }

      try {
        const savedSettings = await window.API.saveSettings({
          authorName,
          defaultViewMode,
          videoCoverMode,
          defaultColor,
          showFileExtensions,
          autoDeleteResolvedNotifications,
          autoDeleteResolvedDays
        });

        if (savedSettings && savedSettings.error) {
          throw new Error(savedSettings.error);
        }

        try {
          localStorage.setItem('giffu_default_view_mode', defaultViewMode);
          localStorage.setItem('giffu_video_cover_mode', videoCoverMode);
          localStorage.setItem('giffu_default_color', defaultColor);
        } catch (err) {}

        if (this.data) {
          if (!this.data.settings) this.data.settings = {};
          this.data.settings.authorName = authorName;
          this.data.settings.authorNameCustomized = true;
          this.data.settings.defaultViewMode = defaultViewMode;
          this.data.settings.videoCoverMode = videoCoverMode;
          this.data.settings.defaultColor = defaultColor;
          this.data.settings.showFileExtensions = showFileExtensions;
          this.data.settings.autoDeleteResolvedNotifications = autoDeleteResolvedNotifications;
          this.data.settings.autoDeleteResolvedDays = autoDeleteResolvedDays;
        }

        this.applyThemeColor(defaultColor);

        if (this.authorSession) {
          this.authorSession.name = authorName;
        }
        if (window.Auth && window.Auth.user) {
          window.Auth.user.name = authorName;
        }

        await this.fetchData();
        if (this.notificationsManager) {
          this.notificationsManager.fetchNotifications({ triggerToast: false });
        }
        this.updateBrandElements();
        document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
        window.showToast('Configurações salvas!');
        this.render();
      } catch (err) {
        console.error('Erro ao salvar configurações:', err);
        window.showToast(err.message || 'Erro ao salvar configurações', 'error');
      } finally {
        if (btnSave) {
          btnSave.disabled = false;
          btnSave.textContent = 'Salvar';
        }
      }
    };

    document.getElementById('formSettings')?.addEventListener('submit', saveSettingsHandler);
    document.getElementById('btnSaveSettings')?.addEventListener('click', (e) => {
      saveSettingsHandler(e);
    });

    // Browser navigation (back/forward) with immediate mobile media & fullscreen cleanup
    window.addEventListener('popstate', async () => {
      try {
        this.closeMobileSidebar();
        document.querySelectorAll('.comment-lightbox-backdrop').forEach(el => el.remove());
        if (document.fullscreenElement || document.webkitFullscreenElement) {
          if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
          else if (document.webkitExitFullscreen) {
            try { document.webkitExitFullscreen(); } catch (e) {}
          }
        }
        document.body.classList.remove('video-fullscreen-active', 'photo-fullscreen-active');
        document.documentElement.classList.remove('video-fullscreen-active', 'photo-fullscreen-active');
        document.querySelectorAll('.custom-image-wrapper.is-fullscreen, .custom-player-wrapper.is-fullscreen').forEach(el => {
          el.classList.remove('is-fullscreen', 'fullscreen-rotated-landscape');
        });
        if (this.playerInstance) {
          this.playerInstance.destroy();
          this.playerInstance = null;
        }
      } catch (e) {}
      await this.fetchData();
      this.detectRoute();
    });
  }

  async openPendingComment(item) {
    if (!item) return;

    // Se estiver no modo Autor
    if (!this.isClientMode) {
      let proj = (this.data?.projects || []).find(p => p.id === item.projectId);
      if (!proj) {
        await this.fetchData();
        proj = (this.data?.projects || []).find(p => p.id === item.projectId);
      }

      if (proj) {
        const vid = (proj.videos || []).find(v => v.id === item.videoId);
        if (vid) {
          this.selectedProject = proj;
          this.selectedVideo = vid;
          this.currentFolderId = vid.driveFolderId || null;
          this.scopedFolderId = null;
          this.isIsolatedFile = false;
          this.currentView = 'client_player';
          const targetUrl = `/author?project=${proj.id}&video=${vid.id}`;
          window.history.pushState({}, '', targetUrl);
          this.render();
          this.focusCommentInPlayer(item);
          return;
        }
      }
    }

    // Modo Cliente
    if (this.selectedProject && this.selectedProject.id === item.projectId) {
      const vid = (this.selectedProject.videos || []).find(v => v.id === item.videoId);
      if (vid) {
        this.selectedVideo = vid;
        this.currentView = 'client_player';
        const targetUrl = `/${vid.shortCode || vid.id}`;
        window.history.pushState({}, '', targetUrl);
        this.render();
        this.focusCommentInPlayer(item);
        return;
      }
    }

    // Se for link de arquivo ou projeto diferente
    const dest = item.videoShortCode || item.projectSlug || item.videoId;
    if (dest) {
      this.navigateTo(`/${dest}`);
      setTimeout(() => {
        this.focusCommentInPlayer(item);
      }, 400);
    }
  }

  focusCommentInPlayer(item) {
    // Abre a gaveta de comentários se estiver oculta
    this.setCommentsVisibility(true);

    // Se for vídeo e houver timecode, salta diretamente para o ponto
    if (item.timecode && this.playerInstance && typeof this.playerInstance.seekTo === 'function') {
      try {
        this.playerInstance.seekTo(item.timecode);
      } catch (e) {}
    }

    // Scroll e animação pulsante no comentário ou resposta selecionada
    const attemptScroll = (retry = 0) => {
      const commentEl = document.querySelector(`.comment-item[data-id="${item.id}"]`);
      if (commentEl) {
        const replyEl = item.latestReply
          ? commentEl.querySelector(`.reply-item[data-reply-id="${item.latestReply.id}"]`)
          : null;
        const targetEl = replyEl || commentEl;
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        commentEl.classList.remove('comment-highlight-pulse');
        void commentEl.offsetWidth; // reflow
        commentEl.classList.add('comment-highlight-pulse');
        if (replyEl) {
          replyEl.classList.remove('comment-highlight-pulse');
          void replyEl.offsetWidth;
          replyEl.classList.add('comment-highlight-pulse');
        }
        setTimeout(() => {
          commentEl.classList.remove('comment-highlight-pulse');
          if (replyEl) replyEl.classList.remove('comment-highlight-pulse');
        }, 3600);
      } else if (retry < 6) {
        setTimeout(() => attemptScroll(retry + 1), 200);
      }
    };

    setTimeout(() => attemptScroll(0), 180);
  }
}

// Global Toast helper
window.showToast = function (message) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#10b981"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
};

// Global App Alert Modal (Identidade Visual Giffú Cloud)
window.showAppAlert = function (message, title = 'Atenção') {
  return new Promise((resolve) => {
    const modal = document.getElementById('modalAppAlert');
    if (!modal) {
      if (typeof window._originalAlert === 'function') {
        window._originalAlert(message);
      }
      return resolve();
    }

    const titleEl = document.getElementById('appAlertTitle');
    const msgEl = document.getElementById('appAlertMessage');
    const btnOk = document.getElementById('btnAppAlertOk');
    const btnClose = document.getElementById('btnAppAlertClose');

    if (titleEl) titleEl.textContent = title || 'Atenção';
    if (msgEl) msgEl.textContent = String(message || '');

    let isClosed = false;
    const closeAlert = () => {
      if (isClosed) return;
      isClosed = true;
      modal.classList.remove('open');
      btnOk?.removeEventListener('click', onOk);
      btnClose?.removeEventListener('click', onClose);
      modal.removeEventListener('click', onBackdrop);
      document.removeEventListener('keydown', onKeyDown);
      resolve();
    };

    const onOk = (e) => {
      e?.stopPropagation();
      closeAlert();
    };
    const onClose = (e) => {
      e?.stopPropagation();
      closeAlert();
    };
    const onBackdrop = (e) => {
      if (e.target === modal) {
        e.stopPropagation();
        closeAlert();
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        closeAlert();
      }
    };

    btnOk?.addEventListener('click', onOk);
    btnClose?.addEventListener('click', onClose);
    modal.addEventListener('click', onBackdrop);
    document.addEventListener('keydown', onKeyDown);

    modal.classList.add('open');
    setTimeout(() => {
      btnOk?.focus();
    }, 40);
  });
};

// Preserve original window.alert and redirect all alert calls to showAppAlert
if (typeof window._originalAlert !== 'function') {
  window._originalAlert = window.alert;
}
window.alert = function (message, title) {
  window.showAppAlert(message, title);
};

// Global thumbnail error fallback for mobile/Drive rate-limits
window.handleMediaThumbError = function (imgEl, driveFileId, fallbackStreamUrl) {
  if (!imgEl) return;
  const stage = parseInt(imgEl.dataset.fallbackStage || '0', 10);
  if (stage === 0 && driveFileId) {
    imgEl.dataset.fallbackStage = '1';
    const previewUrl = `/api/stream/preview?drive=${encodeURIComponent(driveFileId)}&size=600&retry=1`;
    if (imgEl.src !== window.location.origin + previewUrl) {
      imgEl.src = previewUrl;
      return;
    }
  }
  if (stage <= 1 && fallbackStreamUrl) {
    imgEl.dataset.fallbackStage = '2';
    imgEl.src = fallbackStreamUrl;
    return;
  }
  imgEl.onerror = null;
};

document.addEventListener('DOMContentLoaded', () => {
  window.app = new EntregaApp();
});
