// Custom High-Performance Multi-function Video Player
// Always prioritizes maximum source quality without degradation

class CustomVideoPlayer {
  constructor(containerElement, videoData, options = {}) {
    this.container = containerElement;
    this.videoData = videoData;
    this.options = options;
    this.video = null;
    this.isPlaying = false;
    this.isBuffering = false;
    this.fps = 30; // standard 30fps for frame stepping
    this.playbackSpeeds = [0.5, 1, 2];
    this.currentSpeedIndex = 1; // 1x (padrão sempre)

    const fileName = (this.videoData.fileName || this.videoData.title || '').toLowerCase();
    const mimeType = (this.videoData.mimeType || '').toLowerCase();
    this.isMov = fileName.endsWith('.mov') || mimeType.includes('quicktime');
    this.isAlpha = Boolean(this.videoData.isAlpha);
    this.alphaBgMode = this.isAlpha ? 'checkerboard' : 'black';
    this._userMutedIntentionally = false;
    this.audioHealthTimer = null;

    this.init();
  }

  init() {
    this.render();
    this.setupInactivityTimer();
    this.setupOrientationHandler();
    this.setupAudioHealthMonitor();
    this.bindEvents();
    if (this.isAlpha) {
      this.checkAlphaStatus();
    } else if (this.isMov) {
      this.checkVideoCompatibilityStatus();
    }
  }

  setupAudioHealthMonitor() {
    this.audioHealthTimer = setInterval(() => {
      if (!this.video) return;
      if (this.isPlaying && !this.video.paused) {
        this.resyncAudio(false);
      }
    }, 2500);
  }

  resyncAudio(forceNudge = false) {
    if (!this.video) return;
    try {
      // 1. Se não foi silenciado intencionalmente pelo usuário, restaura estado desmutado e volume
      if (!this._userMutedIntentionally) {
        if (this.video.muted) {
          this.video.muted = false;
        }
        if (this.video.volume === 0) {
          const targetVol = this.volumeSlider ? (parseFloat(this.volumeSlider.value) || 1) : 1;
          this.video.volume = targetVol;
        }
      }

      // 2. Garante que trilhas de áudio estejam ativas caso o navegador tenha desabilitado por underrun
      if (this.video.audioTracks && this.video.audioTracks.length > 0) {
        let hasActive = false;
        for (let i = 0; i < this.video.audioTracks.length; i++) {
          if (this.video.audioTracks[i].enabled) hasActive = true;
        }
        if (!hasActive && this.video.audioTracks[0]) {
          this.video.audioTracks[0].enabled = true;
        }
      }

      // 3. Se solicitado, força o pipeline do navegador a re-sincronizar o relógio de áudio (AudioRenderer)
      if (forceNudge && this.isPlaying && !this.video.paused) {
        const cur = this.video.currentTime;
        if (cur > 0.05) {
          this.video.currentTime = cur;
        }
      }
    } catch (e) {}
  }

  setupInactivityTimer() {
    this.inactivityTimer = null;
    this.isInteracting = false;
    this._lastTouchTime = 0;
    this._wasInactiveOnTouchStart = false;

    this.showHUD = () => {
      this.container.classList.add('user-active');
      this.container.classList.remove('user-inactive');

      clearTimeout(this.inactivityTimer);

      if (!this.isInteracting) {
        this.inactivityTimer = setTimeout(() => {
          if (!this.isInteracting) {
            this.container.classList.remove('user-active');
            this.container.classList.add('user-inactive');
          }
        }, 2500);
      }
    };

    this.hideHUDImmediate = () => {
      clearTimeout(this.inactivityTimer);
      if (!this.isInteracting) {
        this.container.classList.remove('user-active');
        this.container.classList.add('user-inactive');
      }
    };

    this.onActivity = () => {
      this.showHUD();
    };

    this.onTouchStart = (e) => {
      this._lastTouchTime = Date.now();
      this._wasInactiveOnTouchStart = this.container.classList.contains('user-inactive');
      const isControlTouch = e.target && e.target.closest('.player-controls-bar, .center-play-btn, .player-top-badge');
      if (isControlTouch || this._wasInactiveOnTouchStart) {
        this.showHUD();
      }
    };

    this.onMouseLeave = () => {
      if (Date.now() - this._lastTouchTime < 800) return;
      this.hideHUDImmediate();
    };

    this.container.addEventListener('mousemove', this.onActivity);
    this.container.addEventListener('mouseenter', this.onActivity);
    this.container.addEventListener('mouseleave', this.onMouseLeave);
    this.container.addEventListener('touchstart', this.onTouchStart, { passive: true });
    this.container.addEventListener('touchmove', this.onActivity, { passive: true });

    // Exibe inicialmente ao abrir e inicia o timer
    this.showHUD();
  }

  render() {
    const isVertical = this.videoData.aspectRatio === '9:16' || this.videoData.aspectRatio === '3:4' || this.videoData.aspectRatio === '2:3';
    const isFourThree = this.videoData.aspectRatio === '4:3';
    const isOneOne = this.videoData.aspectRatio === '1:1';
    const aspectClass = isVertical ? 'aspect-9-16 is-vertical' : (isFourThree ? 'aspect-4-3' : (isOneOne ? 'aspect-1-1' : ''));
    const bgClass = this.isAlpha ? 'alpha-checkerboard' : 'alpha-black';
    this.container.className = `custom-player-wrapper ${aspectClass} ${bgClass} paused`;

    const downloadFileName = this.videoData.fileName || (this.videoData.title + (this.isMov ? '.mov' : '.mp4'));
    const downloadUrl = `${this.videoData.url}${this.videoData.url.includes('?') ? '&' : '?'}download=1`;

    let streamUrl = this.videoData.url;
    if (this.isAlpha) {
      streamUrl = `${streamUrl}${streamUrl.includes('?') ? '&' : '?'}alpha=1`;
    }

    this.container.innerHTML = `
      <!-- Video Element -->
      <video class="custom-video-element" playsinline webkit-playsinline x5-playsinline preload="auto" src="${streamUrl}"></video>

      <!-- Transcode / Preparing State Overlay -->
      <div class="alpha-transcode-overlay" id="alphaTranscodeOverlay" style="display: none;">
        <div class="alpha-transcode-spinner"></div>
        <div class="alpha-transcode-text" id="alphaTranscodeText">Otimizando vídeo para reprodução...</div>
      </div>

      <!-- Center Play/Pause Overlay - ONLY APPEARS ON HOVER -->
      <div class="player-center-play-overlay">
        <button class="center-play-btn" id="centerPlayBtn" title="Reproduzir (Espaço)">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </button>
      </div>

      <!-- Center Loading Spinner (Buffer / Carregamento) -->
      <div class="player-center-loading" id="playerCenterLoading" style="display: none;">
        <span class="loading-spinner player-loading-spinner"></span>
      </div>

      <!-- Quality Badge (Preserving 100% Original Studio Quality) -->
      <div class="player-top-badge" id="playerTopBadge">
        <span id="playerQualityLabel">${this.classifyResolution(this.videoData.resolution)}</span>
      </div>

      <!-- Bottom Control Bar -->
      <div class="player-controls-bar">
        <!-- Scrubber Timeline -->
        <div class="player-timeline-wrapper" id="timelineWrapper">
          <div class="player-timeline-track">
            <div class="player-buffer-bar" id="bufferBar"></div>
            <div class="player-progress-bar" id="progressBar"></div>
            <div class="player-scrubber-handle" id="scrubberHandle"></div>
          </div>
          <div class="player-time-tooltip" id="timeTooltip">00:00</div>
        </div>

        <!-- Controls Row -->
        <div class="player-controls-row">
          <div class="player-controls-left">
            <!-- Play/Pause -->
            <button class="player-btn" id="btnPlayPause" title="Reproduzir/Pausar (Espaço)">
              <svg viewBox="0 0 24 24" id="playIcon"><path d="M8 5v14l11-7z"/></svg>
            </button>

            <!-- Frame backward (-1 frame) -->
            <button class="player-btn frame-step-btn" id="btnStepBack" title="Voltar 1 frame (Shift + ←)">
              <svg viewBox="0 0 24 24"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
            </button>

            <!-- Frame forward (+1 frame) -->
            <button class="player-btn frame-step-btn" id="btnStepForward" title="Avançar 1 frame (Shift + →)">
              <svg viewBox="0 0 24 24"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
            </button>

            <!-- Volume / Mute -->
            <div class="volume-group">
              <button class="player-btn" id="btnVolume" title="Mudo (M)">
                <svg viewBox="0 0 24 24" id="volumeIcon"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
              </button>
              <input type="range" class="volume-slider" id="volumeSlider" min="0" max="1" step="0.05" value="1">
            </div>

            <!-- Timecode -->
            <span class="player-timecode" id="timecodeDisplay">00:00 / 00:00</span>
          </div>

          <div class="player-controls-right">
            <!-- Playback Speed -->
            <span class="player-speed-badge" id="btnSpeed" title="Velocidade de Reprodução">1x</span>

            <!-- Picture-in-Picture -->
            <button class="player-btn" id="btnPiP" title="Picture in Picture">
              <svg viewBox="0 0 24 24"><path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z"/></svg>
            </button>

            <!-- Definir frame como capa (Picture) -->
            ${(this.options.canSetCover !== false) ? `
              <button class="player-btn" id="btnSetFrameAsCover" title="Definir frame como capa" aria-label="Definir frame como capa">
                <svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
              </button>
              ${(this.videoData && (this.videoData.hasCustomCover || this.videoData.customThumbnailUrl)) ? `
                <button class="player-btn" id="btnResetFrameCover" title="Desfazer capa personalizada" aria-label="Desfazer">
                  <svg viewBox="0 0 24 24"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>
                </button>
              ` : ''}
            ` : ''}

            <!-- Direct Download Original High-Res File -->
            <a class="player-btn" id="btnDownload" href="${downloadUrl}" download="${downloadFileName}" title="Baixar Arquivo Original (Máxima Qualidade)">
              <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
            </a>

            <!-- Toggle Comments -->
            <button class="player-btn" id="btnPlayerToggleComments" title="Mostrar/Ocultar Comentários (C)">
              <svg viewBox="0 0 24 24"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>
            </button>

            <!-- Fullscreen -->
            <button class="player-btn" id="btnFullscreen" title="Tela Cheia (F)">
              <svg viewBox="0 0 24 24" id="fullscreenIcon"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;

    this.video = this.container.querySelector('video');
    this.centerPlayBtn = this.container.querySelector('#centerPlayBtn');
    this.btnPlayPause = this.container.querySelector('#btnPlayPause');
    this.playIcon = this.container.querySelector('#playIcon');
    this.timelineWrapper = this.container.querySelector('#timelineWrapper');
    this.progressBar = this.container.querySelector('#progressBar');
    this.bufferBar = this.container.querySelector('#bufferBar');
    this.scrubberHandle = this.container.querySelector('#scrubberHandle');
    this.timeTooltip = this.container.querySelector('#timeTooltip');
    this.timecodeDisplay = this.container.querySelector('#timecodeDisplay');
    this.btnStepBack = this.container.querySelector('#btnStepBack');
    this.btnStepForward = this.container.querySelector('#btnStepForward');
    this.btnVolume = this.container.querySelector('#btnVolume');
    this.volumeSlider = this.container.querySelector('#volumeSlider');
    this.volumeIcon = this.container.querySelector('#volumeIcon');
    this.volumeGroup = this.container.querySelector('.volume-group');
    this.volumeHideTimer = null;
    this.isHoveringVolume = false;
    this.isDraggingVolume = false;
    this.btnSpeed = this.container.querySelector('#btnSpeed');
    this.qualityBadgeText = this.container.querySelector('#playerQualityLabel');
    this.btnPiP = this.container.querySelector('#btnPiP');
    this.btnSetFrameAsCover = this.container.querySelector('#btnSetFrameAsCover');
    this.btnResetFrameCover = this.container.querySelector('#btnResetFrameCover');
    this.btnPlayerToggleComments = this.container.querySelector('#btnPlayerToggleComments');
    this.btnFullscreen = this.container.querySelector('#btnFullscreen');
    this.qualityBadgeText = this.container.querySelector('#playerQualityLabel');
  }

  classifyResolution(input, height) {
    // If width and height numbers provided from actual video file
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

  buildStreamUrl() {
    let url = this.videoData.url || '';
    if (this.isAlpha) {
      url += `${url.includes('?') ? '&' : '?'}alpha=1`;
    }
    return url;
  }

  getFormatResolutionName(label) {
    const str = String(label || '').toUpperCase();
    if (str === 'ULTRA') return '8K';
    if (str === '4K') return '4K';
    if (str === 'FHD') return '1080p';
    if (str === 'HD') return '720p';
    if (str === 'SD') return '360p';
    return str || '1080p';
  }

  getQualityLabels() {
    const w = this.video?.videoWidth || Number(this.videoData.width) || 0;
    const h = this.video?.videoHeight || Number(this.videoData.height) || 0;
    const minDim = (w && h) ? Math.min(w, h) : (this.videoData.resolution === '4K' ? 2160 : (this.videoData.resolution === 'FHD' ? 1080 : 720));
    const maxDim = (w && h) ? Math.max(w, h) : (this.videoData.resolution === '4K' ? 3840 : (this.videoData.resolution === 'FHD' ? 1920 : 1280));

    let originalLabel = '1080p';

    if (minDim >= 1440 || maxDim >= 2500 || this.videoData.resolution === '4K' || this.videoData.resolution === 'ULTRA') {
      originalLabel = '4K';
    } else if (minDim > 720 || maxDim > 1280 || this.videoData.resolution === 'FHD') {
      originalLabel = '1080p';
    } else if (minDim > 540 || maxDim > 960 || this.videoData.resolution === 'HD') {
      originalLabel = '720p';
    } else if (minDim > 0) {
      originalLabel = `${minDim}p`;
    }

    return { originalLabel };
  }

  getResolutionInfo() {
    const w = this.video?.videoWidth || Number(this.videoData.width) || 0;
    const h = this.video?.videoHeight || Number(this.videoData.height) || 0;
    let rawLabel = this.classifyResolution(this.videoData.resolution);
    if (w && h) {
      rawLabel = this.classifyResolution(w, h);
    }
    const formatName = this.getFormatResolutionName(rawLabel);
    return { width: w, height: h, rawLabel, formatName };
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  togglePlay() {
    if (this.video.ended) {
      this.video.currentTime = 0;
      this.play();
    } else if (this.video.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  play() {
    if (!this.video) return;
    if (this.video.ended) {
      this.video.currentTime = 0;
    }
    this.isPlaying = true;
    if (this.video.readyState < 3) {
      this.setBuffering(true, false);
    }
    const p = this.video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(err => {
        console.warn('Playback error or blocked by autoplay policy:', err);
        this.setBuffering(false);
      });
    }
  }

  pause() {
    if (!this.video) return;
    this.video.pause();
    this.setBuffering(false);
  }

  setBuffering(isBuffering, immediate = false) {
    if (this._bufferingTimer) {
      clearTimeout(this._bufferingTimer);
      this._bufferingTimer = null;
    }

    if (!isBuffering) {
      this.isBuffering = false;
      this.container?.classList.remove('is-buffering');
      const loadingEl = this.container ? this.container.querySelector('#playerCenterLoading') : null;
      if (loadingEl) loadingEl.style.display = 'none';
      return;
    }

    const applyBufferingUi = () => {
      if (this.video && !this.video.paused && this.video.readyState < 3) {
        this.isBuffering = true;
        this.container?.classList.add('is-buffering');
        const loadingEl = this.container ? this.container.querySelector('#playerCenterLoading') : null;
        if (loadingEl) loadingEl.style.display = 'flex';
      }
    };

    if (immediate) {
      applyBufferingUi();
    } else {
      // Tolerância com debounce de 380ms para absorver oscilações normais entre chunks sem congelar o player
      this._bufferingTimer = setTimeout(applyBufferingUi, 380);
    }
  }

  getBufferedAhead() {
    if (!this.video) return 0;
    const b = this.video.buffered;
    if (!b || b.length === 0) return 0;
    const cur = this.video.currentTime || 0;
    let maxAhead = 0;
    for (let i = 0; i < b.length; i++) {
      const start = b.start(i);
      const end = b.end(i);
      if (cur >= (start - 0.5) && end > cur) {
        maxAhead = Math.max(maxAhead, end - cur);
      }
    }
    return maxAhead;
  }

  updateBufferProgress(throttled = false) {
    if (!this.video || !this.bufferBar) return;
    if (throttled) {
      const now = Date.now();
      if (this._lastBufferUiUpdate && (now - this._lastBufferUiUpdate) < 300) return;
      this._lastBufferUiUpdate = now;
    }
    const dur = this.video.duration || 0;
    if (dur <= 0) {
      this.bufferBar.style.width = '0%';
      return;
    }

    const b = this.video.buffered;
    if (!b || b.length === 0) {
      this.bufferBar.style.width = '0%';
      return;
    }

    const cur = this.video.currentTime || 0;
    let activeEnd = 0;

    // Encontra a faixa de buffer contígua que engloba ou está imediatamente à frente do ponto atual de reprodução
    for (let i = 0; i < b.length; i++) {
      const start = b.start(i);
      const end = b.end(i);
      if (cur >= (start - 0.25) && cur <= (end + 0.25)) {
        activeEnd = Math.max(activeEnd, end);
      }
    }

    // Se nenhuma faixa cobrir exatamente currentTime, busca a faixa mais próxima logo à frente (buffer sendo carregado)
    if (activeEnd <= cur) {
      for (let i = 0; i < b.length; i++) {
        const start = b.start(i);
        const end = b.end(i);
        if (start <= cur + 2.0 && end > cur) {
          activeEnd = Math.max(activeEnd, end);
        }
      }
    }

    // Fallback: se estiver no início ou após seek antes da nova faixa ser registrada
    if (activeEnd <= 0) {
      if (b.start(0) <= cur + 1.0) {
        activeEnd = b.end(0);
      } else {
        activeEnd = cur;
      }
    }

    const pct = Math.min(100, Math.max(0, (activeEnd / dur) * 100));
    this.bufferBar.style.width = `${pct.toFixed(2)}%`;
  }

  seekTo(seconds) {
    if (!this.video) return;
    this.video.currentTime = Math.max(0, Math.min(seconds, this.video.duration || 0));
  }

  stepFrame(direction) {
    if (!this.video) return;
    this.video.pause();
    const frameTime = 1 / this.fps;
    this.video.currentTime = Math.max(0, Math.min(this.video.currentTime + direction * frameTime, this.video.duration || 0));
  }

  cycleSpeed() {
    this.currentSpeedIndex = (this.currentSpeedIndex + 1) % this.playbackSpeeds.length;
    const speed = this.playbackSpeeds[this.currentSpeedIndex];
    this.video.playbackRate = speed;
    this.btnSpeed.textContent = `${speed}x`;
  }

  toggleMute() {
    if (!this.video) return;
    this.video.muted = !this.video.muted;
    this._userMutedIntentionally = this.video.muted;
    if (this.video.muted) {
      if (this.volumeSlider) this.volumeSlider.value = 0;
      this.volumeIcon.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
    } else {
      try {
        if (this.video.volume === 0) this.video.volume = 1;
      } catch (e) {}
      if (this.volumeSlider) this.volumeSlider.value = this.video.volume || 1;
      this.volumeIcon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
      this.resyncAudio(true);
    }
  }

  getOrientationInfo() {
    let angle = 0;
    let type = '';

    if (screen.orientation) {
      angle = screen.orientation.angle || 0;
      type = screen.orientation.type || '';
    } else if (typeof window.orientation !== 'undefined') {
      angle = window.orientation;
    }

    if (angle === -90) angle = 270;

    // Angle 90: counter-clockwise (top of phone is left -> landscape-primary)
    // Angle 270: clockwise (top of phone is right -> landscape-secondary)
    let direction = 'landscape-primary';
    if (angle === 270 || type === 'landscape-secondary') {
      direction = 'landscape-secondary';
    } else if (angle === 90 || type === 'landscape-primary') {
      direction = 'landscape-primary';
    }

    const isLandscape = (angle === 90 || angle === 270 || type.startsWith('landscape') || (window.innerWidth > window.innerHeight && window.innerHeight < 600));

    return { isLandscape, direction, angle, type };
  }

  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints > 1 && window.innerWidth <= 1024);
  }

  isVerticalVideo() {
    if (this.video && this.video.videoHeight > 0 && this.video.videoWidth > 0) {
      return this.video.videoHeight > this.video.videoWidth;
    }
    if (this.videoData && this.videoData.aspectRatio) {
      return ['9:16', '3:4', '2:3', 'portrait'].includes(this.videoData.aspectRatio);
    }
    if (this.container && (this.container.classList.contains('is-vertical') || this.container.classList.contains('aspect-9-16'))) {
      return true;
    }
    return !!(this.videoData && (this.videoData.isVertical || this.videoData.aspectRatio === '9:16'));
  }

  isFullscreen() {
    const isNative = !!(
      (document.fullscreenElement && (document.fullscreenElement === this.container || this.container.contains(document.fullscreenElement) || document.fullscreenElement === document.documentElement)) ||
      (document.webkitFullscreenElement && (document.webkitFullscreenElement === this.container || this.container.contains(document.webkitFullscreenElement) || document.webkitFullscreenElement === document.documentElement)) ||
      (this.video && this.video.webkitDisplayingFullscreen)
    );
    return isNative || this.container.classList.contains('is-fullscreen');
  }

  updateFullscreenIcon(isFullscreen) {
    if (!this.btnFullscreen) return;
    const icon = this.btnFullscreen.querySelector('svg');
    if (!icon) return;
    if (isFullscreen) {
      this.btnFullscreen.title = 'Sair da Tela Cheia (F)';
      icon.innerHTML = '<path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>';
    } else {
      this.btnFullscreen.title = 'Tela Cheia (F)';
      icon.innerHTML = '<path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>';
    }
  }

  setFullscreenThemeColor(active) {
    try {
      let meta = document.querySelector('meta[name="theme-color"]');
      if (active) {
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', 'theme-color');
          meta.dataset.createdByPlayer = '1';
          document.head.appendChild(meta);
        } else if (this._prevThemeColor === undefined) {
          this._prevThemeColor = meta.getAttribute('content') || '';
        }
        meta.setAttribute('content', '#000000');
      } else if (meta) {
        if (meta.dataset.createdByPlayer === '1') {
          meta.remove();
        } else if (this._prevThemeColor !== undefined) {
          meta.setAttribute('content', this._prevThemeColor);
          this._prevThemeColor = undefined;
        }
      }
    } catch (e) {}
  }

  syncFullscreenViewport() {
    if (!this.container) return { vw: window.innerWidth, vh: window.innerHeight };
    const vv = window.visualViewport;
    const vw = vv && vv.width ? vv.width : window.innerWidth;
    const vh = vv && vv.height ? vv.height : window.innerHeight;
    const offsetTop = vv ? vv.offsetTop : 0;
    const offsetLeft = vv ? vv.offsetLeft : 0;

    if (this.isFullscreen()) {
      if (this.isMobileDevice()) {
        this.container.style.setProperty('--fs-vw', `${vw}px`);
        this.container.style.setProperty('--fs-vh', `${vh}px`);
        this.container.style.setProperty('--fs-top', `${offsetTop}px`);
        this.container.style.setProperty('--fs-left', `${offsetLeft}px`);
        this.container.style.setProperty('--fs-center-x', `${offsetLeft + vw / 2}px`);
        this.container.style.setProperty('--fs-center-y', `${offsetTop + vh / 2}px`);
      } else {
        // Desktop PC: remove restrições de viewport inline para garantir 100vw x 100vh nativo
        this.container.style.removeProperty('--fs-vw');
        this.container.style.removeProperty('--fs-vh');
        this.container.style.removeProperty('--fs-top');
        this.container.style.removeProperty('--fs-left');
        this.container.style.removeProperty('--fs-center-x');
        this.container.style.removeProperty('--fs-center-y');
      }
    } else {
      this.container.style.removeProperty('--fs-vw');
      this.container.style.removeProperty('--fs-vh');
      this.container.style.removeProperty('--fs-top');
      this.container.style.removeProperty('--fs-left');
      this.container.style.removeProperty('--fs-center-x');
      this.container.style.removeProperty('--fs-center-y');
    }

    return { vw, vh, offsetTop, offsetLeft };
  }

  updateFullscreenOrientation() {
    if (!this.isFullscreen()) {
      this.container.classList.remove('fullscreen-rotated-landscape');
      this.syncFullscreenViewport();
      return;
    }

    const isMobile = this.isMobileDevice();
    const { vw, vh } = this.syncFullscreenViewport();

    if (!isMobile) {
      // DESKTOP PC / MAC WEB:
      // Monitores são fixos: nunca rotaciona via CSS nem bloqueia orientação de sistema
      this.container.classList.remove('fullscreen-rotated-landscape');
      return;
    }

    // DISPOSITIVOS MÓVEIS (MOBILE ONLY):
    const isVertical = this.isVerticalVideo();
    const isDevicePortrait = vh > vw;

    if (isVertical) {
      // COM EXCEÇÃO DOS VÍDEOS VERTICAIS:
      // se mantém verticais na tela cheia, preenchendo a tela em formato retrato.
      this.container.classList.remove('fullscreen-rotated-landscape');
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('portrait-primary').catch(() => {
          screen.orientation.lock('portrait').catch(() => {});
        });
      }
    } else {
      // VÍDEOS HORIZONTAIS / WIDE:
      // solicita bloqueio em landscape quando suportado (Android) e, se a viewport permanecer em retrato
      // (ex: Lock Rotation do smartphone ativado ou iPhone/iOS), gira automaticamente o player do app em 90deg.
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape-primary').catch(() => {
          screen.orientation.lock('landscape').catch(() => {});
        });
      }
      if (isDevicePortrait) {
        this.container.classList.add('fullscreen-rotated-landscape');
      } else {
        this.container.classList.remove('fullscreen-rotated-landscape');
      }
    }
  }

  enterFullscreen(direction = 'landscape-primary') {
    const isMobile = this.isMobileDevice();
    const isVertical = this.isVerticalVideo();
    const effectiveDir = isVertical ? 'portrait-primary' : direction;

    if (this.isFullscreen()) {
      if (isMobile) {
        this.applyOrientationLock(effectiveDir);
      }
      this.updateFullscreenOrientation();
      return;
    }

    const onEnterSuccess = () => {
      this.container.classList.toggle('is-desktop-player', !isMobile);
      this.container.classList.toggle('is-mobile-player', isMobile);
      this.container.classList.add('is-fullscreen');
      document.body.classList.add('video-fullscreen-active');
      document.documentElement.classList.add('video-fullscreen-active');
      this.setFullscreenThemeColor(true);
      if (isMobile) {
        this.applyOrientationLock(effectiveDir);
      }
      this.updateFullscreenOrientation();
      this.updateFullscreenIcon(true);
    };

    // Solicita Fullscreen API exclusivamente no CONTAINER do app (ou documentElement), nunca no <video> nativo,
    // garantindo o player do app sem barras do navegador onde a API é suportada
    const fsOptions = { navigationUI: 'hide' };
    const req = this.container.requestFullscreen ||
                this.container.webkitRequestFullscreen ||
                this.container.mozRequestFullScreen ||
                this.container.msRequestFullscreen;

    if (req) {
      let p;
      try {
        p = req.call(this.container, fsOptions);
      } catch (err) {
        try {
          p = req.call(this.container);
        } catch (e2) {}
      }

      if (p && p.then) {
        p.then(() => {
          this._hadNativeFullscreen = true;
          onEnterSuccess();
        }).catch(() => {
          onEnterSuccess();
        });
      } else {
        onEnterSuccess();
      }
    } else {
      onEnterSuccess();
    }
  }

  exitFullscreen() {
    this._enteredFullscreenViaRotate = false;
    this._hadNativeFullscreen = false;

    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
    if (this.video && this.video.webkitDisplayingFullscreen) {
      try { this.video.webkitExitFullscreen(); } catch (e) {}
    }

    this.container.classList.remove('is-fullscreen', 'fullscreen-rotated-landscape', 'is-desktop-player', 'is-mobile-player');
    document.body.classList.remove('video-fullscreen-active');
    document.documentElement.classList.remove('video-fullscreen-active');
    this.setFullscreenThemeColor(false);
    this.syncFullscreenViewport();
    this.updateFullscreenIcon(false);

    if (this.isMobileDevice()) {
      if (screen.orientation && screen.orientation.unlock) {
        try { screen.orientation.unlock(); } catch (e) {}
      }
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('portrait').catch(() => {});
      }
    }
  }

  toggleFullscreen() {
    if (!this.isFullscreen()) {
      this._enteredFullscreenViaRotate = false;
      const isVertical = this.isVerticalVideo();
      if (isVertical) {
        this.enterFullscreen('portrait-primary');
      } else {
        const info = this.getOrientationInfo();
        const targetDir = info.isLandscape ? info.direction : 'landscape-primary';
        this.enterFullscreen(targetDir);
      }
    } else {
      this.exitFullscreen();
    }
  }

  applyOrientationLock(direction) {
    if (!this.isMobileDevice()) return; // PC desktop não altera orientação de sistema
    if (screen.orientation && screen.orientation.lock) {
      const isVertical = this.isVerticalVideo();
      let targetLock;
      if (isVertical || direction === 'portrait' || direction === 'portrait-primary') {
        targetLock = 'portrait-primary';
      } else if (direction === 'landscape-secondary') {
        targetLock = 'landscape-secondary';
      } else {
        targetLock = 'landscape-primary';
      }

      screen.orientation.lock(targetLock).catch(() => {
        if (targetLock.startsWith('portrait')) {
          screen.orientation.lock('portrait').catch(() => {});
        } else {
          screen.orientation.lock('landscape').catch(() => {});
        }
      });
    }
  }

  setupOrientationHandler() {
    CustomVideoPlayer.activeInstance = this;

    this.onVisualViewportUpdate = () => {
      if (this.isFullscreen()) {
        this.updateFullscreenOrientation();
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.onVisualViewportUpdate);
      window.visualViewport.addEventListener('scroll', this.onVisualViewportUpdate);
    }

    this.onOrientationChange = () => {
      if (this.isFullscreen()) {
        this.syncFullscreenViewport();
      }

      // Auto-rotação e detecção de giro físico é EXCLUSIVA para mobile!
      // No PC Desktop, redimensionar a janela do navegador NUNCA deve forçar fullscreen.
      if (!this.isMobileDevice()) {
        return;
      }

      // Settle time for viewport on mobile rotation
      setTimeout(() => {
        if (!this.video) return;
        const info = this.getOrientationInfo();
        const isVertical = this.isVerticalVideo();

        if (info.isLandscape) {
          // Se for vídeo wide e estiver tocando, girar celular entra em tela cheia na direção correspondente
          if (!isVertical) {
            const isRunning = this.isPlaying || (!this.video.paused && !this.video.ended);
            if (isRunning && !this.isFullscreen()) {
              this._enteredFullscreenViaRotate = true;
              this.enterFullscreen(info.direction);
            }
          }
          if (this.isFullscreen()) {
            this.updateFullscreenOrientation();
          }
        } else {
          // Dispositivo voltou para formato retrato
          if (this.isFullscreen()) {
            if (isVertical) {
              // Vídeo vertical se mantém em tela cheia no formato retrato!
              this.updateFullscreenOrientation();
            } else if (this._enteredFullscreenViaRotate) {
              // Se entrou em tela cheia apenas pelo giro físico do aparelho, sai ao desvirar
              this.exitFullscreen();
            } else {
              // Se entrou pelo botão de tela cheia, adapta e vira automaticamente para preencher em wide
              this.updateFullscreenOrientation();
            }
          }
        }
      }, 120);
    };

    window.addEventListener('orientationchange', this.onOrientationChange);
    window.addEventListener('resize', this.onOrientationChange);
    if (screen.orientation) {
      screen.orientation.addEventListener('change', this.onOrientationChange);
    }

    this.onFullscreenChange = () => {
      const isNative = !!(
        (document.fullscreenElement && (document.fullscreenElement === this.container || this.container.contains(document.fullscreenElement) || document.fullscreenElement === document.documentElement)) ||
        (document.webkitFullscreenElement && (document.webkitFullscreenElement === this.container || this.container.contains(document.webkitFullscreenElement) || document.webkitFullscreenElement === document.documentElement)) ||
        (this.video && this.video.webkitDisplayingFullscreen)
      );

      if (isNative) {
        this._hadNativeFullscreen = true;
        const isMobile = this.isMobileDevice();
        this.container.classList.toggle('is-desktop-player', !isMobile);
        this.container.classList.toggle('is-mobile-player', isMobile);
        this.container.classList.add('is-fullscreen');
        document.body.classList.add('video-fullscreen-active');
        document.documentElement.classList.add('video-fullscreen-active');
        this.setFullscreenThemeColor(true);
        this.updateFullscreenOrientation();
        this.updateFullscreenIcon(true);
      } else if (this._hadNativeFullscreen || this.container.classList.contains('is-fullscreen')) {
        this._hadNativeFullscreen = false;
        this.exitFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', this.onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this.onFullscreenChange);

    this.video.addEventListener('webkitbeginfullscreen', () => {
      document.body.classList.add('video-fullscreen-active');
      document.documentElement.classList.add('video-fullscreen-active');
      this.container.classList.add('is-fullscreen');
      this.updateFullscreenIcon(true);
    });

    this.video.addEventListener('webkitendfullscreen', () => {
      document.body.classList.remove('video-fullscreen-active');
      document.documentElement.classList.remove('video-fullscreen-active');
      this.container.classList.remove('is-fullscreen', 'fullscreen-rotated-landscape');
      this.setFullscreenThemeColor(false);
      this.syncFullscreenViewport();
      this.updateFullscreenIcon(false);
      if (this.isMobileDevice() && screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('portrait').catch(() => {});
      }
    });
  }

  bindEvents() {
    // Read real file resolution upon metadata load and update badge
    this.video.addEventListener('loadedmetadata', () => {
      const realWidth = this.video.videoWidth;
      const realHeight = this.video.videoHeight;
      if (realWidth && realHeight) {
        const qualityLabel = this.classifyResolution(realWidth, realHeight);
        if (this.qualityBadgeText) {
          this.qualityBadgeText.textContent = qualityLabel;
        }
        if (window.detectAspectRatio) {
          const detectedAspect = window.detectAspectRatio(realWidth, realHeight);
          if (detectedAspect) {
            this.videoData.aspectRatio = detectedAspect;
            this.container.classList.remove('aspect-9-16', 'aspect-4-3', 'aspect-1-1', 'aspect-16-9', 'is-vertical');
            if (detectedAspect === '9:16' || detectedAspect === '3:4' || detectedAspect === '2:3' || realHeight > realWidth) {
              this.container.classList.add('aspect-9-16', 'is-vertical');
            } else if (detectedAspect === '4:3') {
              this.container.classList.add('aspect-4-3');
            } else if (detectedAspect === '1:1') {
              this.container.classList.add('aspect-1-1');
            }
          }
        }
        if (this.isFullscreen()) {
          this.updateFullscreenOrientation();
        }
        const resInfo = this.getResolutionInfo();
        if (this.qualityBadgeText) {
          this.qualityBadgeText.textContent = resInfo.rawLabel;
        }
      }
    });

    this.video.addEventListener('loadeddata', () => {
      const overlay = this.container.querySelector('#alphaTranscodeOverlay');
      if (overlay) overlay.style.display = 'none';
      if (this.video.readyState >= 3) {
        this.setBuffering(false);
      }
      this.updateBufferProgress();
    });

    this.video.addEventListener('canplay', () => {
      const overlay = this.container.querySelector('#alphaTranscodeOverlay');
      if (overlay) overlay.style.display = 'none';
      const isMob = this.isMobileDevice();
      const ahead = this.getBufferedAhead();
      const dur = this.video.duration || 0;
      const cur = this.video.currentTime || 0;
      const remaining = Math.max(0, dur - cur);
      const cushionNeeded = Math.min(2.0, remaining);

      // No mobile, se houve queda de buffer (_mobileWaitingForCushion), aguarda acumular margem de frente
      // proporcional ao tempo restante do vídeo (evita congelamento caso reste menos de 2s para o fim)
      if (isMob && this._mobileWaitingForCushion && ahead < cushionNeeded && remaining > 0.3 && this.video.readyState < 4) {
        this.updateBufferProgress();
        return;
      }
      this._mobileWaitingForCushion = false;
      if (this.video.readyState >= 3) {
        this.setBuffering(false);
      }
      if (!this.isSeeking && this.isPlaying && this.video.paused) {
        this.video.play().catch(() => {});
      }
      this.resyncAudio(false);
      this.updateBufferProgress();
    });

    this.video.addEventListener('canplaythrough', () => {
      this._mobileWaitingForCushion = false;
      this.setBuffering(false);
      if (!this.isSeeking && this.isPlaying && this.video.paused) {
        this.video.play().catch(() => {});
      }
      this.resyncAudio(false);
      this.updateBufferProgress();
    });

    this.video.addEventListener('waiting', () => {
      if (this.isMobileDevice()) {
        this._mobileWaitingForCushion = true;
      }
      this.setBuffering(true, false);
      this.updateBufferProgress();
    });

    this.video.addEventListener('stalled', () => {
      this.updateBufferProgress();
      if (this.isPlaying && !this.video.paused) {
        this.resyncAudio(false);
      }
    });

    this.video.addEventListener('seeking', () => {
      if (this.isPlaying) {
        this.setBuffering(true, false);
      }
      this.updateBufferProgress();
    });

    this.video.addEventListener('seeked', () => {
      if (this.video.readyState >= 3) {
        this.setBuffering(false);
      }
      // Durante o arrasto da timeline (isSeeking ativo), não retoma o play prematuramente
      if (!this.isSeeking && this.isPlaying && this.video.paused) {
        this.video.play().catch(() => {});
      }
      this.resyncAudio(false);
      this.updateBufferProgress();
    });

    this.video.addEventListener('playing', () => {
      this.isPlaying = true;
      this._networkRetryCount = 0;
      this.setBuffering(false);
      this.resyncAudio(false);
      this.updateBufferProgress();
    });

    this.video.addEventListener('volumechange', () => {
      if (!this.video) return;
      if (this.video.muted || this.video.volume === 0) {
        if (this.volumeSlider) this.volumeSlider.value = 0;
        if (this.volumeIcon) {
          this.volumeIcon.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
        }
      } else {
        if (this.volumeSlider) this.volumeSlider.value = this.video.volume;
        if (this.volumeIcon) {
          this.volumeIcon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
        }
      }
    });

    // Handle format/codec error or transient mobile network error
    this.video.addEventListener('error', () => {
      this.setBuffering(false);
      const err = this.video.error;
      console.warn('Erro ao decodificar vídeo no player:', err);
      if (this.isMov) {
        this.checkVideoCompatibilityStatus(true);
      }
      // Recuperação automática para falhas transitórias de rede/stream no mobile
      if (!this.isAlpha && err && (err.code === 2 || err.code === 3) && (this._networkRetryCount || 0) < 2) {
        this._networkRetryCount = (this._networkRetryCount || 0) + 1;
        const savedTime = this.video.currentTime || 0;
        const wasPlaying = this.isPlaying;
        setTimeout(() => {
          if (!this.video) return;
          try {
            this.video.load();
            if (savedTime > 0) {
              this.video.addEventListener('loadedmetadata', () => {
                try { this.video.currentTime = savedTime; } catch (e) {}
                if (wasPlaying) this.play();
              }, { once: true });
            } else if (wasPlaying) {
              this.play();
            }
          } catch (e) {}
        }, 700);
      }
    });

    // Play/Pause button clicks (com separação inteligente entre despertar HUD no touch e pausar)
    this.centerPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isTouchTap = Date.now() - (this._lastTouchTime || 0) < 650;
      if (isTouchTap && this._wasInactiveOnTouchStart && !this.video.paused) {
        this._wasInactiveOnTouchStart = false;
        this.showHUD();
        return;
      }
      this.showHUD();
      this.togglePlay();
    });

    this.btnPlayPause.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showHUD();
      this.togglePlay();
    });

    this.video.addEventListener('click', () => {
      const isTouchTap = Date.now() - (this._lastTouchTime || 0) < 650;
      if (isTouchTap) {
        if (this.video.paused || this.video.ended) {
          this.showHUD();
          this.togglePlay();
        } else if (this._wasInactiveOnTouchStart) {
          this._wasInactiveOnTouchStart = false;
          this.showHUD();
        } else if (this.container.classList.contains('user-active')) {
          this.hideHUDImmediate();
        } else {
          this.showHUD();
        }
        return;
      }
      this.showHUD();
      this.togglePlay();
    });

    // Playback state updates
    this.video.addEventListener('play', () => {
      this.isPlaying = true;
      this.showHUD();
      this.container.classList.remove('paused');
      this.playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
      this.centerPlayBtn.classList.add('paused');
      this.centerPlayBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
      if (this.video.readyState < 3) {
        this.setBuffering(true, false);
      }
    });

    this.video.addEventListener('pause', () => {
      this.isPlaying = false;
      this.setBuffering(false);
      this.showHUD();
      this.container.classList.add('paused');
      this.playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
      this.centerPlayBtn.classList.remove('paused');
      this.centerPlayBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    });

    this.video.addEventListener('ended', () => {
      this.isPlaying = false;
      this._mobileWaitingForCushion = false;
      this.setBuffering(false);
      const dur = this.video.duration || 0;
      this.progressBar.style.width = '100%';
      this.scrubberHandle.style.left = '100%';
      if (dur > 0) {
        this.timecodeDisplay.textContent = `${this.formatTime(dur)} / ${this.formatTime(dur)}`;
      }
      this.showHUD();
      this.container.classList.add('paused');
      this.playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
      this.centerPlayBtn.classList.remove('paused');
      this.centerPlayBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    });

    // Time update & Progress bar
    this.video.addEventListener('timeupdate', () => {
      if (this.isBuffering && !this.video.paused) {
        this._mobileWaitingForCushion = false;
        this.setBuffering(false);
      }
      this.updateBufferProgress(true);
      if (this.isSeeking) return;
      const cur = this.video.currentTime;
      const dur = this.video.duration || 0;
      const percent = dur > 0 ? (cur / dur) * 100 : 0;
      this.progressBar.style.width = `${percent}%`;
      this.scrubberHandle.style.left = `${percent}%`;
      this.timecodeDisplay.textContent = `${this.formatTime(cur)} / ${this.formatTime(dur)}`;

      if (this.options.onTimeUpdate) {
        this.options.onTimeUpdate(cur, dur);
      }
    });

    // Buffer progress
    this.video.addEventListener('progress', () => {
      this.updateBufferProgress();
      if (this._mobileWaitingForCushion) {
        const dur = this.video.duration || 0;
        const cur = this.video.currentTime || 0;
        const remaining = Math.max(0, dur - cur);
        const cushionNeeded = Math.min(2.0, remaining);
        if (this.getBufferedAhead() >= cushionNeeded || remaining <= 0.3) {
          this._mobileWaitingForCushion = false;
          this.setBuffering(false);
          if (!this.isSeeking && this.isPlaying && this.video.paused) {
            this.video.play().catch(() => {});
          }
        }
      }
    });

    // Scrubber click & drag (compatível com modo normal e rotacionado 90deg no mobile, mouse e touch)
    const getTimelineRatio = (clientX, clientY) => {
      const rect = this.timelineWrapper.getBoundingClientRect();
      if (this.container.classList.contains('fullscreen-rotated-landscape')) {
        return Math.max(0, Math.min(1, (clientY - rect.top) / (rect.height || 1)));
      }
      return Math.max(0, Math.min(1, (clientX - rect.left) / (rect.width || 1)));
    };

    this.isSeeking = false;
    this._wasPlayingBeforeSeek = false;
    this._lastSeekCommitTime = 0;
    this._pendingSeekRatio = null;

    const handleTimelineSeek = (clientX, clientY, commitImmediate = false) => {
      const pos = getTimelineRatio(clientX, clientY);
      const dur = this.video.duration || 0;
      const targetTime = pos * dur;
      const percent = pos * 100;

      // Atualiza visualmente a barra e o timecode na hora (60fps suave no touch)
      this.progressBar.style.width = `${percent}%`;
      this.scrubberHandle.style.left = `${percent}%`;
      if (dur > 0) {
        this.timecodeDisplay.textContent = `${this.formatTime(targetTime)} / ${this.formatTime(dur)}`;
      }
      if (this.timeTooltip) {
        this.timeTooltip.style.left = `${percent}%`;
        this.timeTooltip.textContent = this.formatTime(targetTime);
      }

      this._pendingSeekRatio = pos;
      const now = Date.now();
      if (dur > 0 && (commitImmediate || now - this._lastSeekCommitTime >= 180)) {
        this._lastSeekCommitTime = now;
        try {
          this.video.currentTime = targetTime;
        } catch (e) {}
      }
    };

    const finishTimelineSeek = () => {
      if (this.isSeeking) {
        const dur = this.video.duration || 0;
        if (this._pendingSeekRatio !== null && dur > 0) {
          try {
            this.video.currentTime = this._pendingSeekRatio * dur;
          } catch (e) {}
        }
        this.isSeeking = false;
        this.isInteracting = false;
        this._pendingSeekRatio = null;
        if (this._wasPlayingBeforeSeek) {
          this._wasPlayingBeforeSeek = false;
          this.play();
        }
        this.showHUD();
      }
    };

    const startTimelineSeek = (clientX, clientY) => {
      this.isSeeking = true;
      this.isInteracting = true;
      this._wasPlayingBeforeSeek = this.isPlaying && !this.video.paused;
      if (this._wasPlayingBeforeSeek) {
        this.video.pause();
      }
      this.showHUD();
      handleTimelineSeek(clientX, clientY, true);
    };

    this.timelineWrapper.addEventListener('mousedown', (e) => {
      startTimelineSeek(e.clientX, e.clientY);
    });

    this.onTimelineMouseMove = (e) => {
      if (this.isSeeking) {
        this.showHUD();
        handleTimelineSeek(e.clientX, e.clientY, false);
      }
    };
    window.addEventListener('mousemove', this.onTimelineMouseMove);

    this.onTimelineMouseUp = () => {
      finishTimelineSeek();
    };
    window.addEventListener('mouseup', this.onTimelineMouseUp);

    this.timelineWrapper.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        startTimelineSeek(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    this.onTimelineTouchMove = (e) => {
      if (this.isSeeking && e.touches && e.touches.length > 0) {
        if (e.cancelable) e.preventDefault();
        this.showHUD();
        handleTimelineSeek(e.touches[0].clientX, e.touches[0].clientY, false);
      }
    };
    window.addEventListener('touchmove', this.onTimelineTouchMove, { passive: false });

    this.onTimelineTouchEnd = () => {
      finishTimelineSeek();
    };
    window.addEventListener('touchend', this.onTimelineTouchEnd, { passive: true });
    window.addEventListener('touchcancel', this.onTimelineTouchEnd, { passive: true });

    // Timeline hover tooltip
    this.timelineWrapper.addEventListener('mousemove', (e) => {
      const pos = getTimelineRatio(e.clientX, e.clientY);
      const dur = this.video.duration || 0;
      const hoverTime = pos * dur;
      this.timeTooltip.style.left = `${pos * 100}%`;
      this.timeTooltip.textContent = this.formatTime(hoverTime);
    });

    // Frame Stepping
    this.btnStepBack.addEventListener('click', (e) => {
      e.stopPropagation();
      this.stepFrame(-1);
    });

    this.btnStepForward.addEventListener('click', (e) => {
      e.stopPropagation();
      this.stepFrame(1);
    });

    // Volume Hover & 1.4s Retention
    const showVolumeBar = () => {
      this.isHoveringVolume = true;
      if (this.volumeHideTimer) {
        clearTimeout(this.volumeHideTimer);
        this.volumeHideTimer = null;
      }
      this.volumeGroup?.classList.add('volume-active');
    };

    const scheduleHideVolumeBar = () => {
      this.isHoveringVolume = false;
      if (this.isDraggingVolume) return;
      if (this.volumeHideTimer) {
        clearTimeout(this.volumeHideTimer);
      }
      this.volumeHideTimer = setTimeout(() => {
        if (!this.isHoveringVolume && !this.isDraggingVolume) {
          this.volumeGroup?.classList.remove('volume-active');
        }
      }, 1400); // 1.4s de permanência após o mouse sair
    };

    if (this.volumeGroup) {
      this.volumeGroup.addEventListener('mouseenter', showVolumeBar);
      this.volumeGroup.addEventListener('mouseleave', scheduleHideVolumeBar);
    }
    if (this.btnVolume) {
      this.btnVolume.addEventListener('mouseenter', showVolumeBar);
    }
    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('mouseenter', showVolumeBar);
    }

    // Volume Slider Drag & Input
    this.volumeSlider.addEventListener('mousedown', () => {
      this.isDraggingVolume = true;
      this.isInteracting = true;
      showVolumeBar();
      this.showHUD();
    });

    this.onVolumeGlobalMouseUp = () => {
      if (this.isDraggingVolume) {
        this.isDraggingVolume = false;
        this.isInteracting = false;
        if (!this.isHoveringVolume) {
          scheduleHideVolumeBar();
        }
      }
    };
    window.addEventListener('mouseup', this.onVolumeGlobalMouseUp);

    this.volumeSlider.addEventListener('input', (e) => {
      this.showHUD();
      showVolumeBar();
      const val = parseFloat(e.target.value);
      try {
        this.video.volume = val;
      } catch (err) {}
      this.video.muted = val === 0;
      this._userMutedIntentionally = val === 0;
      if (val > 0) {
        this.resyncAudio(false);
      }
    });

    this.btnVolume.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showHUD();
      showVolumeBar();
      this.toggleMute();
      if (!this.isHoveringVolume) {
        scheduleHideVolumeBar();
      }
    });

    // Speed Cycle
    this.btnSpeed.addEventListener('click', (e) => {
      e.stopPropagation();
      this.cycleSpeed();
    });

    // PiP
    if (document.pictureInPictureEnabled) {
      this.btnPiP.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
          } else {
            await this.video.requestPictureInPicture();
          }
        } catch (err) {
          console.error('PiP Error:', err);
        }
      });
    } else {
      this.btnPiP.style.display = 'none';
    }

    // Set Current Frame As Cover
    if (this.btnSetFrameAsCover) {
      this.btnSetFrameAsCover.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof this.options.onSetCover === 'function') {
          this.options.onSetCover(this.captureCurrentFrame());
        }
      });
    }

    // Reset Custom Cover Frame (Restore default)
    if (this.btnResetFrameCover) {
      this.btnResetFrameCover.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof this.options.onResetCover === 'function') {
          this.options.onResetCover();
        }
      });
    }

    // Toggle Comments Button
    if (this.btnPlayerToggleComments) {
      this.btnPlayerToggleComments.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof this.options.onToggleComments === 'function') {
          this.options.onToggleComments();
        }
      });
    }

    // Fullscreen
    this.btnFullscreen.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleFullscreen();
    });

    // Keyboard Shortcuts
    this.keyHandler = (e) => {
      // Don't trigger if user is typing in textarea/input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      this.showHUD();

      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (e.shiftKey) {
          this.stepFrame(-1);
        } else {
          this.seekTo(this.video.currentTime - 5);
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (e.shiftKey) {
          this.stepFrame(1);
        } else {
          this.seekTo(this.video.currentTime + 5);
        }
      } else if (e.code === 'KeyM') {
        showVolumeBar();
        this.toggleMute();
        scheduleHideVolumeBar();
      } else if (e.code === 'KeyF') {
        this.toggleFullscreen();
      } else if (e.code === 'Escape' || e.key === 'Escape' || e.keyCode === 27) {
        if (this.isFullscreen()) {
          this.exitFullscreen();
        }
      } else if (e.code === 'KeyC') {
        e.preventDefault();
        if (typeof this.options.onToggleComments === 'function') {
          this.options.onToggleComments();
        }
      }
    };

    window.addEventListener('keydown', this.keyHandler);
  }

  captureCurrentFrame() {
    if (!this.video) return null;
    try {
      const v = this.video;
      const w = v.videoWidth || v.clientWidth || 1280;
      const h = v.videoHeight || v.clientHeight || 720;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(v, 0, 0, w, h);
      return canvas.toDataURL('image/jpeg', 0.92);
    } catch (err) {
      console.error('Erro ao capturar frame do vídeo:', err);
      return null;
    }
  }

  setCommentsActive(isActive) {
    if (this.btnPlayerToggleComments) {
      if (isActive) {
        this.btnPlayerToggleComments.classList.add('is-active');
      } else {
        this.btnPlayerToggleComments.classList.remove('is-active');
      }
    }
  }

  updateCustomCoverState(hasCustomCover) {
    this.videoData.hasCustomCover = !!hasCustomCover;
    let resetBtn = this.container.querySelector('#btnResetFrameCover');
    if (hasCustomCover) {
      if (!resetBtn && this.btnSetFrameAsCover) {
        resetBtn = document.createElement('button');
        resetBtn.className = 'player-btn';
        resetBtn.id = 'btnResetFrameCover';
        resetBtn.title = 'Desfazer capa personalizada';
        resetBtn.setAttribute('aria-label', 'Desfazer');
        resetBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>';
        this.btnSetFrameAsCover.insertAdjacentElement('afterend', resetBtn);
        this.btnResetFrameCover = resetBtn;
        resetBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (typeof this.options.onResetCover === 'function') {
            this.options.onResetCover();
          }
        });
      }
    } else {
      if (resetBtn) {
        resetBtn.remove();
        this.btnResetFrameCover = null;
      }
    }
  }

  cycleAlphaBg() {
    const modes = ['checkerboard', 'black', 'white'];
    const nextIdx = (modes.indexOf(this.alphaBgMode) + 1) % modes.length;
    this.alphaBgMode = modes[nextIdx];

    this.container.classList.remove('alpha-checkerboard', 'alpha-black', 'alpha-white');
    this.container.classList.add(`alpha-${this.alphaBgMode}`);

    const toastMsg = this.alphaBgMode === 'checkerboard' ? 'Fundo Xadrez (Alpha Transparente)' : (this.alphaBgMode === 'white' ? 'Fundo Branco' : 'Fundo Preto');
    if (window.showToast) window.showToast(toastMsg);
  }

  renderProResNotice() {
    let notice = this.container.querySelector('.player-prores-notice');
    if (!notice) {
      notice = document.createElement('div');
      notice.className = 'player-prores-notice';
      const downloadUrl = `${this.videoData.url}${this.videoData.url.includes('?') ? '&' : '?'}download=1`;
      const downloadName = this.videoData.fileName || (this.videoData.title + (this.isMov ? '.mov' : '.mp4'));
      notice.innerHTML = `
        <div class="prores-notice-card">
          <div class="prores-notice-badge">PRORES 4444 • CANAL ALPHA</div>
          <h3>Arquivo Master em Qualidade Máxima</h3>
          <p>Este arquivo foi mantido na <strong>máxima fidelidade original de estúdio</strong> (Apple ProRes 4444 com canal Alpha preservado, sem compressão ou degradação).</p>
          <p class="prores-notice-hint">
            O seu navegador atual não possui suporte nativo para decodificar Apple ProRes 4444. Para visualização direta com aceleração de hardware e transparência no navegador, utilize o <strong>Safari (macOS / iOS)</strong>.
          </p>
          <div class="prores-notice-actions">
            <a class="btn-primary" href="${downloadUrl}" download="${downloadName}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
              Baixar Arquivo Original (${this.videoData.size || 'Máxima Qualidade'})
            </a>
          </div>
        </div>
      `;
      this.container.appendChild(notice);
    }
    notice.style.display = 'flex';
  }

  checkAlphaStatus() {
    const driveMatch = (this.videoData.url || '').match(/drive=([a-zA-Z0-9_-]+)/);
    const driveId = driveMatch ? driveMatch[1] : null;
    const pathMatch = (this.videoData.url || '').match(/path=([^&]+)/);
    const localPath = pathMatch ? pathMatch[1] : null;
    if (!driveId && !localPath) return;

    const overlay = this.container.querySelector('#alphaTranscodeOverlay');
    const queryParam = driveId ? `drive=${encodeURIComponent(driveId)}` : `path=${localPath}`;

    const check = async () => {
      try {
        const res = await fetch(`/api/stream/alpha-status?${queryParam}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.isAlpha === false) {
          this.isAlpha = false;
          this.container.classList.remove('alpha-checkerboard');
          this.container.classList.add('alpha-black');
          if (overlay) overlay.style.display = 'none';
          return;
        }
        if (!data.ready && data.converting) {
          if (overlay && (!this.video.currentTime || this.video.readyState < 2)) {
            overlay.style.display = 'flex';
          }
          this.alphaPollTimer = setTimeout(check, 1500);
        } else if (data.ready) {
          if (overlay) overlay.style.display = 'none';
          if (this.video && (this.video.error || !this.video.readyState)) {
            const streamUrl = `${this.videoData.url}${this.videoData.url.includes('?') ? '&' : '?'}alpha=1`;
            if (this.video.src !== streamUrl) {
              this.video.src = streamUrl;
              this.video.load();
            }
          }
        }
      } catch (e) {}
    };

    check();
  }

  checkVideoCompatibilityStatus(isRetryAfterError = false) {
    const driveMatch = (this.videoData.url || '').match(/drive=([a-zA-Z0-9_-]+)/);
    const driveId = driveMatch ? driveMatch[1] : null;
    const pathMatch = (this.videoData.url || '').match(/path=([^&]+)/);
    const localPath = pathMatch ? pathMatch[1] : null;
    if (!driveId && !localPath) return;

    const overlay = this.container.querySelector('#alphaTranscodeOverlay');
    const textEl = this.container.querySelector('#alphaTranscodeText');
    const queryParam = driveId ? `drive=${encodeURIComponent(driveId)}` : `path=${localPath}`;

    const check = async () => {
      try {
        const res = await fetch(`/api/stream/video-status?${queryParam}`);
        if (!res.ok) return;
        const data = await res.json();

        if (!data.needsTranscode) {
          if (overlay) overlay.style.display = 'none';
          return;
        }

        if (!data.ready && data.converting) {
          if (overlay) {
            if (textEl) textEl.textContent = 'Otimizando vídeo para reprodução no navegador...';
            overlay.style.display = 'flex';
          }
          this.transcodePollTimer = setTimeout(check, 1500);
        } else if (data.ready) {
          if (overlay) overlay.style.display = 'none';
          if (this.video && (this.video.error || !this.video.readyState || isRetryAfterError)) {
            const streamUrl = this.videoData.url;
            const bustUrl = `${streamUrl}${streamUrl.includes('?') ? '&' : '?'}vready=${Date.now()}`;
            this.video.src = bustUrl;
            this.video.load();
          }
        }
      } catch (e) {}
    };

    check();
  }

  destroy() {
    clearInterval(this.audioHealthTimer);
    clearTimeout(this._bufferingTimer);
    clearTimeout(this.alphaPollTimer);
    clearTimeout(this.transcodePollTimer);
    clearTimeout(this.inactivityTimer);
    clearTimeout(this.volumeHideTimer);
    if (this.onVolumeGlobalMouseUp) {
      window.removeEventListener('mouseup', this.onVolumeGlobalMouseUp);
    }
    if (this.onTimelineMouseMove) {
      window.removeEventListener('mousemove', this.onTimelineMouseMove);
    }
    if (this.onTimelineMouseUp) {
      window.removeEventListener('mouseup', this.onTimelineMouseUp);
    }
    if (this.onTimelineTouchMove) {
      window.removeEventListener('touchmove', this.onTimelineTouchMove);
    }
    if (this.onTimelineTouchEnd) {
      window.removeEventListener('touchend', this.onTimelineTouchEnd);
      window.removeEventListener('touchcancel', this.onTimelineTouchEnd);
    }
    if (this.onVisualViewportUpdate && window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.onVisualViewportUpdate);
      window.visualViewport.removeEventListener('scroll', this.onVisualViewportUpdate);
    }
    if (this.onActivity) {
      this.container.removeEventListener('mousemove', this.onActivity);
      this.container.removeEventListener('mouseenter', this.onActivity);
      this.container.removeEventListener('mouseleave', this.onMouseLeave);
      if (this.onTouchStart) {
        this.container.removeEventListener('touchstart', this.onTouchStart);
      }
      this.container.removeEventListener('touchmove', this.onActivity);
    }
    if (this.onOrientationChange) {
      window.removeEventListener('orientationchange', this.onOrientationChange);
      window.removeEventListener('resize', this.onOrientationChange);
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', this.onOrientationChange);
      }
    }
    if (this.onFullscreenChange) {
      document.removeEventListener('fullscreenchange', this.onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', this.onFullscreenChange);
    }
    if (this.isFullscreen()) {
      this.exitFullscreen();
    }
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
    }
    if (this.video) {
      this.video.pause();
      try {
        this.video.removeAttribute('src');
        this.video.load();
      } catch (e) {}
      this.video.src = '';
    }
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'none';
        navigator.mediaSession.metadata = null;
      } catch (e) {}
    }
    if (CustomVideoPlayer.activeInstance === this) {
      CustomVideoPlayer.activeInstance = null;
    }
  }
}

window.CustomVideoPlayer = CustomVideoPlayer;
window.classifyResolution = (input, height) => CustomVideoPlayer.prototype.classifyResolution(input, height);
