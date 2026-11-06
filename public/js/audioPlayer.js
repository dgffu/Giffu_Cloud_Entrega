// Custom High-End Interactive Audio Player for Giffú Entrega
// Supports pristine audio playback, waveform visualization, timestamped comments & track navigation

class CustomAudioPlayer {
  constructor(containerElement, audioData, options = {}) {
    this.container = containerElement;
    this.audioData = audioData;
    this.options = options || {};
    this.project = this.options.project || null;
    this.audio = null;
    this.canvas = null;
    this.ctx = null;
    this.isPlaying = false;
    this.isBuffering = false;
    this.isMuted = false;
    this.volume = 1.0;
    this.isLooping = false;
    this.playbackSpeeds = [0.5, 1, 2];
    this.currentSpeedIndex = 1; // 1x (padrão sempre)
    this.animationFrameId = null;
    this.waveformBars = 216;
    this.baseWaveform = null;
    this.hasDecodedRealWaveform = false;
    this.isWaveformLoading = true;
    this.isDraggingTimeline = false;
    this.audioSpecsText = '';
    this.parsedDurationSeconds = this.parseDurationToSeconds(this.audioData.duration);

    // Detect track list strictly within the current subfolder (not project-wide playlist)
    const targetFolderId = (this.options.currentFolderId !== undefined)
      ? this.options.currentFolderId
      : (this.audioData.driveFolderId || this.audioData.folderId || null);
    const isRootFolder = !targetFolderId || (this.project && targetFolderId === this.project.driveFolderId);

    if (this.project && Array.isArray(this.project.videos)) {
      this.audioTracks = this.project.videos.filter(v => {
        const isAudioFile = v.type === 'audio' || String(v.mimeType || '').startsWith('audio/') || /\.(mp3|wav|aac|flac|ogg|m4a|aiff|aif|wma|opus)$/i.test(v.fileName || v.title);
        if (!isAudioFile) return false;

        const vFolderId = v.driveFolderId || v.folderId || null;
        if (isRootFolder) {
          return !vFolderId || (this.project && vFolderId === this.project.driveFolderId);
        } else {
          return vFolderId === targetFolderId;
        }
      });
    } else {
      this.audioTracks = [this.audioData];
    }

    if (!this.audioTracks.some(t => t.id === this.audioData.id)) {
      this.audioTracks.unshift(this.audioData);
    }
    this.currentTrackIndex = this.audioTracks.findIndex(t => t.id === this.audioData.id);
    if (this.currentTrackIndex < 0) this.currentTrackIndex = 0;

    this.init();
  }

  parseDurationToSeconds(str) {
    if (!str) return 0;
    const parts = String(str).trim().split(':').map(Number);
    if (parts.some(isNaN)) return 0;
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  }

  parseFileSize(sizeStr) {
    if (!sizeStr) return 0;
    if (typeof sizeStr === 'number') return sizeStr;
    const match = String(sizeStr).trim().match(/^([\d.,]+)\s*([KMGTP]?B)$/i);
    if (!match) return 0;
    const val = parseFloat(match[1].replace(',', '.'));
    const unit = match[2].toUpperCase();
    const multipliers = {
      'B': 1,
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024
    };
    return val * (multipliers[unit] || 1);
  }

  init() {
    this.render();
    this.bindEvents();
    this.initWaveformCanvas();
    this.loadActualAudioWaveform();
  }

  render() {
    const ext = (this.audioData.extension || this.getFileExtension(this.audioData) || 'MP3').toUpperCase().replace('.', '');
    const title = this.audioData.title || this.audioData.fileName || 'Faixa de Áudio';
    const downloadUrl = `${this.audioData.url}${this.audioData.url.includes('?') ? '&' : '?'}download=1`;
    const downloadFileName = this.audioData.fileName || `${title}.${ext.toLowerCase()}`;
    const hasMultipleTracks = this.audioTracks.length > 1;
    const initialDurationStr = this.audioData.duration || '00:00';

    this.container.className = `custom-audio-wrapper paused ${this.isWaveformLoading ? 'waveform-loading' : ''}`;
    this.container.innerHTML = `
      <!-- Hidden Native Audio -->
      <audio class="custom-audio-element" preload="metadata" playsinline src="${this.audioData.url}"></audio>

      <!-- Audio Hero Stage -->
      <div class="audio-stage">
        <!-- Top Track Info & Metadata -->
        <div class="audio-stage-top">
          <div class="audio-badge-group">
            <span class="audio-type-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
              ${ext} • ÁUDIO
            </span>
            <span class="audio-meta-sep" id="audioSpecsSep" style="${this.audioSpecsText ? '' : 'display: none;'}">•</span>
            <span class="audio-specs-text" id="audioSpecsText">${this.audioSpecsText || ''}</span>
            ${hasMultipleTracks ? `
              <span class="audio-meta-sep">•</span>
              <span class="audio-track-index-badge">${this.currentTrackIndex + 1} de ${this.audioTracks.length}</span>
            ` : ''}
          </div>

          <div class="audio-top-actions">
            ${(this.options && this.options.allowComments !== undefined ? this.options.allowComments : (window.app ? window.app.isCommentsAllowedForVideo(this.audioData, this.project) : this.project?.allowComments !== false)) ? `
              <button class="audio-action-btn" id="btnAudioToggleCommentsTop" title="Mostrar ou ocultar comentários (C)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>
                <span>Comentários</span>
                <span class="comments-badge" id="audioCommentsBadgeTop" style="display: none;">0</span>
              </button>
            ` : ''}
            <a class="audio-action-btn" id="btnAudioDownloadTop" href="${downloadUrl}" download="${downloadFileName}" title="Baixar áudio original">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
              <span>Baixar Original</span>
            </a>
          </div>
        </div>

        <!-- Center Turntable / Vinyl Visualizer Disc -->
        <div class="audio-center-disc-wrapper">
          <div class="audio-disc-ambient-glow"></div>
          
          <div class="audio-disc-container" id="audioDisc" title="Clique para reproduzir ou pausar">
            <div class="audio-disc-ring ring-outer"></div>
            <div class="audio-disc-ring ring-mid"></div>
            <div class="audio-disc-center">
              <div class="audio-disc-core">
                <svg class="audio-disc-icon" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 18V5l12-2v13"></path>
                  <circle cx="6" cy="18" r="3"></circle>
                  <circle cx="18" cy="16" r="3"></circle>
                </svg>
              </div>
            </div>
          </div>

          <!-- Loading Spinner no lugar do Vinyl enquanto a waveform carrega (igual no vídeo) -->
          <div class="audio-disc-loading-placeholder" id="audioDiscLoading">
            <div class="player-center-loading audio-center-loading">
              <span class="loading-spinner player-loading-spinner"></span>
            </div>
          </div>

          <!-- Track Metadata -->
          <div class="audio-meta-block">
            <h1 class="audio-track-title" title="${title}">${title}</h1>
            <p class="audio-track-subtitle">${this.project ? this.project.name : 'Cloud'}</p>
          </div>
        </div>

        <!-- Waveform Frequency Visualizer Stage -->
        <div class="audio-waveform-container" id="audioWaveformContainer" title="Clique para navegar no áudio">
          <canvas class="audio-waveform-canvas" id="audioWaveformCanvas"></canvas>
          <div class="audio-waveform-hover-line" id="waveformHoverLine"></div>
          <div class="audio-waveform-progress-overlay" id="waveformProgressOverlay"></div>
        </div>

        <!-- Audio Player Timeline Scrubber -->
        <div class="audio-timeline-wrapper" id="audioTimelineWrapper">
          <div class="audio-timeline-track">
            <div class="audio-buffer-bar" id="audioBufferBar"></div>
            <div class="audio-progress-bar" id="audioProgressBar"></div>
            <div class="audio-scrubber-handle" id="audioScrubberHandle"></div>
          </div>
          <div class="audio-time-tooltip" id="audioTimeTooltip">00:00</div>
        </div>

        <!-- Bottom Controls Bar -->
        <div class="audio-controls-bar">
          <!-- Left Controls: Play, Skips, Speeds, Volume -->
          <div class="audio-controls-left">
            ${hasMultipleTracks ? `
              <button class="audio-ctrl-btn" id="btnAudioPrevTrack" title="Faixa anterior">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
              </button>
            ` : ''}

            <!-- Skip -5s -->
            <button class="audio-ctrl-btn" id="btnAudioStepBack" title="Voltar 5 segundos (←)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
            </button>

            <!-- Play / Pause Main Button -->
            <button class="audio-play-main-btn" id="btnAudioPlayPause" title="Reproduzir / Pausar (Espaço)">
              <svg class="audio-play-icon" id="audioPlayIcon" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>

            <!-- Skip +5s -->
            <button class="audio-ctrl-btn" id="btnAudioStepForward" title="Avançar 5 segundos (→)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
            </button>

            ${hasMultipleTracks ? `
              <button class="audio-ctrl-btn" id="btnAudioNextTrack" title="Próxima faixa">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
              </button>
            ` : ''}

            <!-- Timecode -->
            <div class="audio-timecode-box">
              <span class="audio-timecode-current" id="audioCurrentTime">00:00</span>
              <span class="audio-timecode-sep">/</span>
              <span class="audio-timecode-duration" id="audioDuration">${initialDurationStr}</span>
            </div>
          </div>

          <!-- Right Controls: Volume, Speed, Loop, Download, Comments -->
          <div class="audio-controls-right">
            <!-- Volume Control -->
            <div class="audio-volume-group">
              <button class="audio-ctrl-btn" id="btnAudioVolume" title="Mudo / Ativar Som (M)">
                <svg id="audioVolumeIcon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              </button>
              <input type="range" class="audio-volume-slider" id="audioVolumeSlider" min="0" max="1" step="0.02" value="1">
            </div>

            <!-- Loop Toggle -->
            <button class="audio-pill-btn" id="btnAudioLoop" title="Repetir faixa (L)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
              <span>Loop</span>
            </button>

            <!-- Playback Speed -->
            <button class="audio-pill-btn" id="btnAudioSpeed" title="Alterar velocidade">1x</button>

            <!-- Comments Toggle -->
            <button class="audio-ctrl-btn" id="btnAudioComments" title="Mostrar/Ocultar Comentários (C)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;

    this.audio = this.container.querySelector('audio');
    this.canvas = this.container.querySelector('#audioWaveformCanvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }
  }

  getFileExtension(item) {
    const name = item.fileName || item.title || '';
    const m = name.match(/\.([^.]+)$/);
    return m ? m[1] : '';
  }

  bindEvents() {
    if (!this.audio) return;

    // Sincronização direta com eventos nativos do elemento de áudio
    this.audio.addEventListener('play', () => this.updatePlayStateUI(true));
    this.audio.addEventListener('playing', () => {
      this.isBuffering = false;
      this.container.classList.remove('buffering');
      this.updatePlayStateUI(true);
    });
    this.audio.addEventListener('pause', () => this.updatePlayStateUI(false));
    this.audio.addEventListener('waiting', () => {
      this.isBuffering = true;
      this.container.classList.add('buffering');
    });
    this.audio.addEventListener('canplay', () => {
      this.isBuffering = false;
      this.container.classList.remove('buffering');
    });
    this.audio.addEventListener('error', (e) => this.handleAudioError(e));

    // Time update & Progress
    this.audio.addEventListener('timeupdate', () => this.handleTimeUpdate());
    this.audio.addEventListener('progress', () => this.handleBufferProgress());
    this.audio.addEventListener('loadedmetadata', () => this.handleLoadedMetadata());
    this.audio.addEventListener('ended', () => this.handleEnded());

    // Play/Pause button
    const btnPlayPause = this.container.querySelector('#btnAudioPlayPause');
    btnPlayPause?.addEventListener('click', () => this.togglePlay());

    // Turntable center disc click to play/pause
    const audioDisc = this.container.querySelector('#audioDisc');
    audioDisc?.addEventListener('click', () => this.togglePlay());

    // Skips
    this.container.querySelector('#btnAudioStepBack')?.addEventListener('click', () => {
      this.seekTo(Math.max(0, this.audio.currentTime - 5));
    });
    this.container.querySelector('#btnAudioStepForward')?.addEventListener('click', () => {
      const dur = (this.audio.duration && isFinite(this.audio.duration)) ? this.audio.duration : this.parsedDurationSeconds;
      this.seekTo(Math.min(dur || 0, this.audio.currentTime + 5));
    });

    // Speed button
    this.container.querySelector('#btnAudioSpeed')?.addEventListener('click', () => {
      this.currentSpeedIndex = (this.currentSpeedIndex + 1) % this.playbackSpeeds.length;
      const speed = this.playbackSpeeds[this.currentSpeedIndex];
      this.audio.playbackRate = speed;
      const badge = this.container.querySelector('#btnAudioSpeed');
      if (badge) badge.textContent = `${speed}x`;
    });

    // Loop button
    const btnLoop = this.container.querySelector('#btnAudioLoop');
    btnLoop?.addEventListener('click', () => {
      this.isLooping = !this.isLooping;
      this.audio.loop = this.isLooping;
      btnLoop.classList.toggle('active', this.isLooping);
    });

    // Volume button & Slider
    const btnVolume = this.container.querySelector('#btnAudioVolume');
    const volumeSlider = this.container.querySelector('#audioVolumeSlider');
    
    btnVolume?.addEventListener('click', () => {
      this.isMuted = !this.isMuted;
      this.audio.muted = this.isMuted;
      this.updateVolumeUI();
    });

    volumeSlider?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.volume = val;
      this.audio.volume = val;
      this.isMuted = val === 0;
      this.audio.muted = this.isMuted;
      this.updateVolumeUI();
    });

    // Comments buttons
    const triggerToggleComments = () => {
      if (typeof this.options.onToggleComments === 'function') {
        this.options.onToggleComments();
      }
    };
    this.container.querySelector('#btnAudioComments')?.addEventListener('click', triggerToggleComments);
    this.container.querySelector('#btnAudioToggleCommentsTop')?.addEventListener('click', triggerToggleComments);

    // Track Navigation (if multiple tracks)
    this.container.querySelector('#btnAudioPrevTrack')?.addEventListener('click', () => this.navigateTrack(-1));
    this.container.querySelector('#btnAudioNextTrack')?.addEventListener('click', () => this.navigateTrack(1));

    // Timeline Scrubber Click & Drag
    const timelineWrapper = this.container.querySelector('#audioTimelineWrapper');
    const timeTooltip = this.container.querySelector('#audioTimeTooltip');

    if (timelineWrapper) {
      const updateSeek = (e) => {
        const rect = timelineWrapper.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const dur = (this.audio.duration && isFinite(this.audio.duration) && this.audio.duration > 0)
          ? this.audio.duration
          : (this.parsedDurationSeconds || 0);
        const seekTime = percent * dur;
        this.seekTo(seekTime);
      };

      timelineWrapper.addEventListener('click', (e) => {
        updateSeek(e);
      });

      timelineWrapper.addEventListener('mousemove', (e) => {
        const rect = timelineWrapper.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const dur = (this.audio.duration && isFinite(this.audio.duration) && this.audio.duration > 0)
          ? this.audio.duration
          : (this.parsedDurationSeconds || 0);
        const hoverTime = percent * dur;
        if (timeTooltip) {
          timeTooltip.textContent = this.formatTime(hoverTime);
          timeTooltip.style.left = `${percent * 100}%`;
          timeTooltip.style.opacity = '1';
        }
      });

      timelineWrapper.addEventListener('mouseleave', () => {
        if (timeTooltip) timeTooltip.style.opacity = '0';
      });
    }

    // Waveform click to seek
    const waveContainer = this.container.querySelector('#audioWaveformContainer');
    const hoverLine = this.container.querySelector('#waveformHoverLine');
    if (waveContainer) {
      waveContainer.addEventListener('click', (e) => {
        const rect = waveContainer.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const dur = (this.audio.duration && isFinite(this.audio.duration) && this.audio.duration > 0)
          ? this.audio.duration
          : (this.parsedDurationSeconds || 0);
        const seekTime = percent * dur;
        this.seekTo(seekTime);
      });

      waveContainer.addEventListener('mousemove', (e) => {
        const rect = waveContainer.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        if (hoverLine) {
          hoverLine.style.left = `${percent * 100}%`;
          hoverLine.style.opacity = '1';
        }
      });

      waveContainer.addEventListener('mouseleave', () => {
        if (hoverLine) hoverLine.style.opacity = '0';
      });
    }

    // Keyboard Shortcuts
    this.keyHandler = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable) return;

      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        this.seekTo(Math.max(0, this.audio.currentTime - 5));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        const dur = (this.audio.duration && isFinite(this.audio.duration)) ? this.audio.duration : this.parsedDurationSeconds;
        this.seekTo(Math.min(dur || 0, this.audio.currentTime + 5));
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        this.audio.volume = Math.min(1, this.audio.volume + 0.1);
        this.volume = this.audio.volume;
        this.updateVolumeUI();
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        this.audio.volume = Math.max(0, this.audio.volume - 0.1);
        this.volume = this.audio.volume;
        this.updateVolumeUI();
      } else if (e.code === 'KeyM') {
        this.isMuted = !this.isMuted;
        this.audio.muted = this.isMuted;
        this.updateVolumeUI();
      } else if (e.code === 'KeyL') {
        this.isLooping = !this.isLooping;
        this.audio.loop = this.isLooping;
        this.container.querySelector('#btnAudioLoop')?.classList.toggle('active', this.isLooping);
      } else if (e.code === 'KeyC') {
        triggerToggleComments();
      }
    };
    window.addEventListener('keydown', this.keyHandler);
  }

  handleAudioError(e) {
    this.updatePlayStateUI(false);
    this.container.classList.remove('buffering');
    const err = this.audio?.error;
    console.error('[AudioPlayer] Erro na reprodução do áudio:', err);
    let msg = 'Não foi possível reproduzir este áudio.';
    if (err) {
      if (err.code === 1) msg = 'Carregamento do áudio interrompido.';
      else if (err.code === 2) msg = 'Erro de rede ao carregar a faixa.';
      else if (err.code === 3) msg = 'Falha ao decodificar a faixa de áudio.';
      else if (err.code === 4) msg = 'Formato ou codec de áudio não suportado.';
    }
    if (window.showToast) window.showToast(msg);
  }

  async loadActualAudioWaveform() {
    if (!this.audioData || !this.audioData.url) {
      this.finishWaveformLoading();
      return;
    }

    this.isWaveformLoading = true;
    if (this.container) {
      this.container.classList.add('waveform-loading');
    }
    this.renderWaveformOnce();

    let loadedSuccessfully = false;

    try {
      // 1. Faz leitura rápida apenas dos primeiros 64KB via HTTP Range para extrair metadados técnicos (Hz e kbps)
      try {
        const res = await fetch(this.audioData.url, {
          headers: { Range: 'bytes=0-65535' }
        });
        if (res.ok || res.status === 206) {
          const chunk = await res.arrayBuffer();
          this.extractAudioSpecs(chunk);
        }
      } catch (err) {
        console.warn('[AudioPlayer] Header inspection error:', err);
      }

      // 2. Para faixas de áudio, decodifica via Web Audio API para extrair os picos reais da waveform
      const sizeBytes = this.parseFileSize(this.audioData.size);
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx && (sizeBytes === 0 || sizeBytes < 35 * 1024 * 1024)) {
        try {
          const resFull = await fetch(this.audioData.url);
          if (resFull.ok) {
            const fullBuf = await resFull.arrayBuffer();
            const audioCtx = new AudioCtx();
            const audioBuffer = await audioCtx.decodeAudioData(fullBuf);

            if (!this.audioSpecsText) {
              this.updateSpecsFromAudioBuffer(audioBuffer, fullBuf.byteLength);
            }

            this.computePeaksFromAudioBuffer(audioBuffer);

            if (audioCtx.state !== 'closed') {
              audioCtx.close().catch(() => {});
            }
            loadedSuccessfully = true;
          }
        } catch (e) {
          console.warn('[AudioPlayer] Web Audio decode failed, falling back to procedural:', e);
        }
      }

      // Se não foi possível decodificar via Web Audio (ex: arquivo muito grande ou erro de codec), gera fallback
      if (!loadedSuccessfully) {
        this.generateProceduralWaveform();
      }
    } catch (err) {
      console.warn('[AudioPlayer] Waveform loading error:', err);
      this.generateProceduralWaveform();
    } finally {
      this.finishWaveformLoading();
    }
  }

  finishWaveformLoading() {
    this.isWaveformLoading = false;
    if (this.container) {
      this.container.classList.remove('waveform-loading');
    }
    this.renderWaveformOnce();
  }

  generateProceduralWaveform() {
    if (this.hasDecodedRealWaveform) return;
    const bars = this.waveformBars || 216;
    const seedStr = String(this.audioData.id || this.audioData.title || 'audio-track');
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
      hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
      hash |= 0;
    }
    const pseudoRand = (i) => {
      const x = Math.sin(hash + i * 997.13) * 10000;
      return x - Math.floor(x);
    };

    const peaks = [];
    for (let i = 0; i < bars; i++) {
      const progress = i / bars;
      let envelope = 1.0;
      if (progress < 0.06) {
        envelope = 0.2 + (progress / 0.06) * 0.6;
      } else if (progress > 0.94) {
        envelope = 0.2 + ((1 - progress) / 0.06) * 0.6;
      }

      const wave1 = Math.sin(progress * Math.PI * 14) * 0.22;
      const wave2 = Math.cos(progress * Math.PI * 26) * 0.16;
      const wave3 = Math.sin(progress * Math.PI * 5) * 0.12;
      const noise = pseudoRand(i) * 0.42;
      const val = Math.max(0.1, Math.min(0.96, (0.32 + wave1 + wave2 + wave3 + noise) * envelope));
      peaks.push(val);
    }

    this.baseWaveform = peaks;
    if (!this.isWaveformLoading) {
      this.renderWaveformOnce();
    }
  }

  computePeaksFromAudioBuffer(audioBuffer) {
    if (!audioBuffer) return;
    const rawData = audioBuffer.getChannelData(0);
    const bars = this.waveformBars || 216;
    const totalSamples = rawData.length;
    const blockSize = Math.floor(totalSamples / bars);

    const peaks = [];
    for (let i = 0; i < bars; i++) {
      const start = i * blockSize;
      let sum = 0;
      let max = 0;
      const step = Math.max(1, Math.floor(blockSize / 40));
      let count = 0;
      for (let j = 0; j < blockSize; j += step) {
        const val = Math.abs(rawData[start + j] || 0);
        sum += val * val;
        if (val > max) max = val;
        count++;
      }
      const rms = count > 0 ? Math.sqrt(sum / count) : 0;
      peaks.push(0.7 * max + 0.3 * rms);
    }

    const maxPeak = Math.max(...peaks, 0.0001);
    this.baseWaveform = peaks.map(p => {
      const normalized = p / maxPeak;
      return Math.max(0.08, Math.min(0.96, normalized));
    });
    this.hasDecodedRealWaveform = true;
  }

  extractAudioSpecs(arrayBuffer) {
    if (!arrayBuffer) return;
    const bytes = new Uint8Array(arrayBuffer);
    let sampleRate = null;
    let bitrate = null;

    // 1. Try MP3 frame header parsing (handling ID3v2 tags safely)
    try {
      let offset = 0;
      if (bytes.length > 10 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
        const size = ((bytes[6] & 0x7f) << 21) | ((bytes[7] & 0x7f) << 14) | ((bytes[8] & 0x7f) << 7) | (bytes[9] & 0x7f);
        offset = 10 + size;
      }

      const bitratesV1L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
      const bitratesV2L3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
      const sampleRatesV1 = [44100, 48000, 32000];
      const sampleRatesV2 = [22050, 24000, 16000];

      for (let i = offset; i < Math.min(bytes.length - 4, offset + 16384); i++) {
        if (bytes[i] === 0xFF && (bytes[i + 1] & 0xE0) === 0xE0) {
          const version = (bytes[i + 1] >> 3) & 0x03; // 3 = V1, 2 = V2
          const layer = (bytes[i + 1] >> 1) & 0x03;   // 1 = Layer 3
          if ((version === 3 || version === 2) && layer === 1) {
            const brIdx = (bytes[i + 2] >> 4) & 0x0F;
            const srIdx = (bytes[i + 2] >> 2) & 0x03;
            if (brIdx > 0 && brIdx < 15 && srIdx < 3) {
              bitrate = version === 3 ? bitratesV1L3[brIdx] : bitratesV2L3[brIdx];
              sampleRate = version === 3 ? sampleRatesV1[srIdx] : sampleRatesV2[srIdx];
              break;
            }
          }
        }
      }
    } catch (e) {}

    // 2. Try WAV header parsing (traversing RIFF chunks to find 'fmt ')
    if (!sampleRate && bytes.length >= 36) {
      try {
        if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && // 'RIFF'
            bytes[8] === 0x57 && bytes[9] === 0x41 && bytes[10] === 0x56 && bytes[11] === 0x45) { // 'WAVE'
          const view = new DataView(arrayBuffer);
          let offset = 12;
          while (offset < bytes.length - 8) {
            const chunkId = String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
            const chunkSize = view.getUint32(offset + 4, true);
            if (chunkId === 'fmt ' && offset + 16 <= bytes.length) {
              sampleRate = view.getUint32(offset + 12, true);
              const byteRate = view.getUint32(offset + 16, true);
              if (byteRate > 0) {
                bitrate = Math.round((byteRate * 8) / 1000);
              }
              break;
            }
            offset += 8 + chunkSize;
          }
        }
      } catch (e) {}
    }

    if (sampleRate || bitrate) {
      this.displayAudioSpecs(sampleRate, bitrate);
    }
  }

  updateSpecsFromAudioBuffer(audioBuffer, totalBytes) {
    if (!audioBuffer) return;
    const sampleRate = audioBuffer.sampleRate;
    let bitrate = null;
    if (audioBuffer.duration > 0 && totalBytes > 0) {
      const calcKbps = Math.round((totalBytes * 8) / (audioBuffer.duration * 1000));
      const standardBitrates = [320, 256, 224, 192, 160, 128, 96, 64];
      const match = standardBitrates.find(b => Math.abs(calcKbps - b) <= 8);
      bitrate = match || calcKbps;
    }
    this.displayAudioSpecs(sampleRate, bitrate);
  }

  displayAudioSpecs(sampleRate, bitrate) {
    let hzStr = '';
    if (sampleRate) {
      if (sampleRate >= 1000) {
        const inKhz = sampleRate / 1000;
        hzStr = (inKhz % 1 === 0 ? inKhz.toFixed(0) : inKhz.toFixed(1)) + ' kHz';
      } else {
        hzStr = sampleRate + ' Hz';
      }
    }
    const kbpsStr = bitrate ? `${bitrate} kbps` : '';
    const specsStr = [hzStr, kbpsStr].filter(Boolean).join(' • ');
    if (specsStr) {
      this.audioSpecsText = specsStr;
      const el = this.container ? this.container.querySelector('#audioSpecsText') : null;
      const sep = this.container ? this.container.querySelector('#audioSpecsSep') : null;
      if (el) el.textContent = specsStr;
      if (sep) sep.style.display = 'inline';
    }
  }

  initWaveformCanvas() {
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.waveformBars = 216;
    this.renderWaveformOnce();
  }

  startWaveformLoop() {
    if (this.animationFrameId) return;
    const loop = () => {
      this.handleTimeUpdate();
      this.renderWaveformOnce();
      if (this.isPlaying) {
        this.animationFrameId = requestAnimationFrame(loop);
      } else {
        this.animationFrameId = null;
      }
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  stopWaveformLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.renderWaveformOnce();
  }

  renderWaveformOnce() {
    if (!this.canvas || !this.ctx) return;
    const width = this.canvas.clientWidth || 600;
    const height = this.canvas.clientHeight || 60;
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    this.ctx.clearRect(0, 0, width, height);

    const bars = this.waveformBars || 216;
    const slotWidth = width / bars;
    const gap = Math.max(0.8, Math.min(2, slotWidth * 0.3));
    const barWidth = Math.max(1.2, slotWidth - gap);
    const curTime = this.audio ? this.audio.currentTime : 0;
    const dur = (this.audio && this.audio.duration && isFinite(this.audio.duration) && this.audio.duration > 0)
      ? this.audio.duration
      : (this.parsedDurationSeconds || 1);
    const progressRatio = Math.max(0, Math.min(1, curTime / dur));

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const playedColor = '#FF5400';
    const unplayedColor = isLight ? 'rgba(0, 0, 0, 0.16)' : 'rgba(255, 255, 255, 0.22)';
    const radius = Math.min(barWidth / 2, 2);

    // 1. Renderiza a base completa da waveform com a cor não reproduzida (fundo neutro)
    this.ctx.fillStyle = unplayedColor;
    for (let i = 0; i < bars; i++) {
      let barHeightRatio = 0.04;
      if (!this.isWaveformLoading && this.baseWaveform && this.baseWaveform[i] !== undefined) {
        barHeightRatio = this.baseWaveform[i];
      }
      const barHeight = this.isWaveformLoading 
        ? 2.5 
        : Math.max(3, barHeightRatio * (height - 8));
      const x = i * slotWidth + (slotWidth - barWidth) / 2;
      const y = (height - barHeight) / 2;

      this.ctx.beginPath();
      if (this.ctx.roundRect) {
        this.ctx.roundRect(x, y, barWidth, barHeight, radius);
      } else {
        this.ctx.rect(x, y, barWidth, barHeight);
      }
      this.ctx.fill();
    }

    // 2. Preenchimento "deslizando" (fluido e contínuo):
    // Utiliza máscara de corte (clipping) na posição exata em pixels do progresso,
    // preenchendo os risquinhos de forma suave e contínua sem saltos barra a barra
    const progressX = progressRatio * width;
    if (progressX > 0) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.rect(0, 0, progressX, height);
      this.ctx.clip();

      this.ctx.fillStyle = playedColor;
      for (let i = 0; i < bars; i++) {
        const x = i * slotWidth + (slotWidth - barWidth) / 2;
        if (x > progressX) break;

        let barHeightRatio = 0.04;
        if (!this.isWaveformLoading && this.baseWaveform && this.baseWaveform[i] !== undefined) {
          barHeightRatio = this.baseWaveform[i];
        }
        const barHeight = this.isWaveformLoading 
          ? 2.5 
          : Math.max(3, barHeightRatio * (height - 8));
        const y = (height - barHeight) / 2;

        this.ctx.beginPath();
        if (this.ctx.roundRect) {
          this.ctx.roundRect(x, y, barWidth, barHeight, radius);
        } else {
          this.ctx.rect(x, y, barWidth, barHeight);
        }
        this.ctx.fill();
      }
      this.ctx.restore();
    }
  }

  togglePlay() {
    if (!this.audio) return;
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  async play() {
    if (!this.audio) return;
    try {
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
    } catch (err) {
      console.warn('[AudioPlayer] Erro ou bloqueio ao iniciar reprodução:', err);
      this.updatePlayStateUI(false);
      if (err.name === 'NotAllowedError') {
        if (window.showToast) window.showToast('Clique no botão de reprodução para iniciar o áudio.');
      }
    }
  }

  pause() {
    if (!this.audio) return;
    try {
      this.audio.pause();
    } catch (e) {}
  }

  updatePlayStateUI(isPlaying) {
    this.isPlaying = isPlaying;
    if (isPlaying) {
      this.container.classList.remove('paused');
      this.container.classList.add('playing');
      const icon = this.container.querySelector('#audioPlayIcon');
      if (icon) {
        icon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
      }
      this.startWaveformLoop();
    } else {
      this.container.classList.remove('playing');
      this.container.classList.add('paused');
      const icon = this.container.querySelector('#audioPlayIcon');
      if (icon) {
        icon.innerHTML = '<path d="M8 5v14l11-7z"/>';
      }
      this.stopWaveformLoop();
    }
  }

  seekTo(seconds) {
    if (!this.audio) return;
    const maxDur = (this.audio.duration && isFinite(this.audio.duration) && this.audio.duration > 0)
      ? this.audio.duration
      : (this.parsedDurationSeconds || 0);
    const target = maxDur > 0 ? Math.max(0, Math.min(maxDur, seconds)) : Math.max(0, seconds);
    try {
      this.audio.currentTime = target;
    } catch (e) {}
    this.handleTimeUpdate();
    this.renderWaveformOnce();
  }

  handleTimeUpdate() {
    if (!this.audio) return;
    const cur = this.audio.currentTime || 0;
    const dur = (this.audio.duration && isFinite(this.audio.duration) && this.audio.duration > 0)
      ? this.audio.duration
      : (this.parsedDurationSeconds || 0);

    // Timecode text
    const curEl = this.container.querySelector('#audioCurrentTime');
    const durEl = this.container.querySelector('#audioDuration');
    if (curEl) curEl.textContent = this.formatTime(cur);
    if (durEl && dur > 0) durEl.textContent = this.formatTime(dur);

    // Progress bar & scrubber
    const progressPercent = dur > 0 ? (cur / dur) * 100 : 0;
    const progressBar = this.container.querySelector('#audioProgressBar');
    const scrubberHandle = this.container.querySelector('#audioScrubberHandle');
    if (progressBar) progressBar.style.width = `${progressPercent}%`;
    if (scrubberHandle) scrubberHandle.style.left = `${progressPercent}%`;

    // Notify comments controller so timestamped comments sync
    if (typeof this.options.onTimeUpdate === 'function') {
      this.options.onTimeUpdate(cur, dur);
    }
  }

  handleBufferProgress() {
    if (!this.audio || !this.audio.duration) return;
    const bufferBar = this.container.querySelector('#audioBufferBar');
    if (!bufferBar) return;

    if (this.audio.buffered && this.audio.buffered.length > 0) {
      const bufferedEnd = this.audio.buffered.end(this.audio.buffered.length - 1);
      const percent = (bufferedEnd / this.audio.duration) * 100;
      bufferBar.style.width = `${Math.min(100, percent)}%`;
    }
  }

  handleLoadedMetadata() {
    const dur = this.audio.duration;
    if (dur && isFinite(dur) && dur > 0) {
      const durEl = this.container.querySelector('#audioDuration');
      if (durEl) durEl.textContent = this.formatTime(dur);
    }
    this.handleBufferProgress();
    this.renderWaveformOnce();
  }

  handleEnded() {
    if (this.isLooping) {
      this.seekTo(0);
      this.play();
    } else {
      this.pause();
      this.seekTo(0);
    }
  }

  navigateTrack(delta) {
    if (!this.audioTracks || this.audioTracks.length <= 1) return;
    let nextIndex = this.currentTrackIndex + delta;
    if (nextIndex < 0) nextIndex = this.audioTracks.length - 1;
    if (nextIndex >= this.audioTracks.length) nextIndex = 0;

    const nextTrack = this.audioTracks[nextIndex];
    if (nextTrack && window.app) {
      window.app.selectedVideo = nextTrack;
      const folderParam = window.app.currentFolderId 
        ? (window.app.isClientMode ? `?folder=${encodeURIComponent(window.app.currentFolderId)}` : `&folder=${encodeURIComponent(window.app.currentFolderId)}`)
        : '';
      const targetUrl = window.app.isClientMode 
        ? `/${nextTrack.shortCode || nextTrack.id}`
        : `/author?project=${window.app.selectedProject.id}&video=${nextTrack.id}${folderParam}`;
      window.history.pushState({}, '', targetUrl);
      window.app.render();
    }
  }

  updateVolumeUI() {
    const icon = this.container.querySelector('#audioVolumeIcon');
    const slider = this.container.querySelector('#audioVolumeSlider');
    if (slider) slider.value = this.isMuted ? 0 : this.volume;

    if (icon) {
      if (this.isMuted || this.volume === 0) {
        icon.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
      } else if (this.volume < 0.5) {
        icon.innerHTML = '<path d="M7 9v6h4l5 5V4L11 9H7z"/>';
      } else {
        icon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
      }
    }
  }

  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0 || !isFinite(seconds)) return '00:00';
    const s = Math.floor(seconds);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  setCommentsActive(isActive) {
    const btnComments = this.container.querySelector('#btnAudioComments');
    const btnCommentsTop = this.container.querySelector('#btnAudioToggleCommentsTop');
    if (btnComments) btnComments.classList.toggle('active', !!isActive);
    if (btnCommentsTop) btnCommentsTop.classList.toggle('active', !!isActive);
  }

  destroy() {
    this.stopWaveformLoop();
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.removeAttribute('src');
        this.audio.load();
      } catch (e) {}
      this.audio = null;
    }
    this.container = null;
    this.canvas = null;
    this.ctx = null;
  }
}

window.CustomAudioPlayer = CustomAudioPlayer;
