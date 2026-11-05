/**
 * FrameAnnotationStudio - Giffú Entrega
 * Visual annotation / markup studio for comments on videos and photos.
 * Provides Freehand drawing (Rabiscos), Arrows (Setas), Circles (Círculos), Rectangles (Quadrados), and Text Boxes.
 * Supports clicking any created object to Select, Reposition (Move), and Resize with transform handles!
 * Operates on the exact corresponding frame from the media player.
 */

(function () {
  'use strict';

  class AnnotationStudio {
    constructor() {
      this.modalEl = null;
      this.canvas = null;
      this.ctx = null;
      this.baseCanvas = null;
      this.baseCtx = null;
      this.activeTool = 'select'; // 'select' | 'arrow' | 'circle' | 'rect' | 'freehand' | 'text'
      this.activeColor = '#FF5400';
      this.activeWidth = 6;
      this.shapes = [];
      this.undoStack = [];
      this.redoStack = [];
      this.isDrawing = false;
      this.currentDraft = null;
      this.scaleFactor = 1;
      this.mediaData = null;
      this.activeTextOverlay = null;

      // Selection & Manipulation state
      this.selectedShape = null;
      this.hoveredHandle = null;
      this.transformMode = null; // { type: 'move' | 'resize', handle, initialShape, startPoint, initBounds }
      this.lastClickTime = 0;

      this.COLOR_PALETTE = [
        { name: 'Laranja Giffú', color: '#FF5400' },
        { name: 'Vermelho', color: '#EF4444' },
        { name: 'Amarelo', color: '#FACC15' },
        { name: 'Verde', color: '#10B981' },
        { name: 'Azul Celeste', color: '#38BDF8' },
        { name: 'Branco', color: '#FFFFFF' }
      ];

      this.WIDTH_PRESETS = [
        { label: 'Fino', value: 3, iconSize: 4 },
        { label: 'Médio', value: 6, iconSize: 7 },
        { label: 'Grosso', value: 10, iconSize: 11 }
      ];

      this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    cloneShape(shape) {
      if (!shape) return null;
      return JSON.parse(JSON.stringify(shape));
    }

    cloneShapes(shapes) {
      return (shapes || []).map(s => this.cloneShape(s));
    }

    formatTimecode(seconds) {
      if (isNaN(seconds) || seconds < 0) return '00:00';
      const totalSec = Math.floor(seconds);
      const hrs = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;
      if (hrs > 0) {
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    getEffectiveWidth() {
      return Math.round(this.activeWidth * this.scaleFactor);
    }

    getEffectiveFontSize() {
      return Math.max(16, Math.round(22 * this.scaleFactor));
    }

    open(options = {}) {
      const {
        mediaElement,
        isImage = false,
        currentTime = 0,
        videoTitle = 'Mídia',
        onComplete,
        onCancel
      } = options;

      if (!mediaElement) {
        if (window.showToast) window.showToast('Elemento de mídia indisponível.');
        return;
      }

      this.mediaData = {
        mediaElement,
        isImage,
        currentTime,
        videoTitle,
        onComplete,
        onCancel
      };

      // Reset state
      this.shapes = [];
      this.undoStack = [];
      this.redoStack = [];
      this.isDrawing = false;
      this.currentDraft = null;
      this.selectedShape = null;
      this.transformMode = null;
      this.hoveredHandle = null;
      this.activeTool = 'arrow'; // Start with arrow as requested for markup

      // Extract dimensions
      let naturalW = 1280;
      let naturalH = 720;

      if (isImage) {
        naturalW = mediaElement.naturalWidth || mediaElement.clientWidth || 1280;
        naturalH = mediaElement.naturalHeight || mediaElement.clientHeight || 720;
      } else {
        naturalW = mediaElement.videoWidth || mediaElement.clientWidth || 1280;
        naturalH = mediaElement.videoHeight || mediaElement.clientHeight || 720;
      }

      // Base offscreen canvas for high-res frozen frame
      this.baseCanvas = document.createElement('canvas');
      this.baseCanvas.width = naturalW;
      this.baseCanvas.height = naturalH;
      this.baseCtx = this.baseCanvas.getContext('2d');

      try {
        this.baseCtx.drawImage(mediaElement, 0, 0, naturalW, naturalH);
      } catch (err) {
        console.warn('Erro ao desenhar frame inicial no canvas offscreen:', err);
      }

      // Proportional scale factor based on 1280px reference
      this.scaleFactor = Math.max(0.75, naturalW / 1280);

      this.createModalDOM(naturalW, naturalH);
      this.bindModalEvents();
      this.redraw();

      window.addEventListener('keydown', this.handleKeyDown);
    }

    createModalDOM(width, height) {
      if (this.modalEl) {
        this.modalEl.remove();
      }

      const isImage = this.mediaData.isImage;
      const timecodeStr = isImage ? 'Foto' : this.formatTimecode(this.mediaData.currentTime);

      const modal = document.createElement('div');
      modal.className = 'annotation-studio-modal';
      modal.id = 'annotationStudioModal';
      modal.innerHTML = `
        <div class="annotation-studio-backdrop"></div>
        <div class="annotation-studio-dialog">
          
          <!-- Top Floating Studio Toolbar -->
          <header class="annotation-studio-header">
            <div class="annotation-header-left">
              <div class="annotation-brand-badge">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
                <span>Marcação na Tela</span>
              </div>
              <div class="annotation-frame-tag" title="${isImage ? 'Anotação nesta foto' : 'Frame exato do tempo atual no vídeo'}">
                ${isImage ? `
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span>Foto</span>
                ` : `
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.48 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/></svg>
                  <span>Frame ${timecodeStr}</span>
                `}
              </div>
            </div>

            <!-- Central Tools Group -->
            <div class="annotation-tools-group">
              <!-- Selector & Drawing Shapes -->
              <div class="annotation-toolset" id="annotationToolset">
                <button type="button" class="btn-annotation-tool ${this.activeTool === 'select' ? 'is-active' : ''}" data-tool="select" title="Selecionar, Mover e Redimensionar (V)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3l7 18 3-7 7-3L3 3z"></path>
                  </svg>
                  <span class="tool-label">Selecionar</span>
                </button>
                <button type="button" class="btn-annotation-tool ${this.activeTool === 'arrow' ? 'is-active' : ''}" data-tool="arrow" title="Seta (A)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="19" x2="19" y2="5"></line>
                    <polyline points="10 5 19 5 19 14"></polyline>
                  </svg>
                  <span class="tool-label">Seta</span>
                </button>
                <button type="button" class="btn-annotation-tool ${this.activeTool === 'circle' ? 'is-active' : ''}" data-tool="circle" title="Círculo (C)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="9"></circle>
                  </svg>
                  <span class="tool-label">Círculo</span>
                </button>
                <button type="button" class="btn-annotation-tool ${this.activeTool === 'rect' ? 'is-active' : ''}" data-tool="rect" title="Quadrado / Retângulo (R)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  </svg>
                  <span class="tool-label">Quadrado</span>
                </button>
                <button type="button" class="btn-annotation-tool ${this.activeTool === 'freehand' ? 'is-active' : ''}" data-tool="freehand" title="Rabiscos / Desenho Livre (B)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 17c3-3 4-5 6-4s3 4 5 3 4-6 7-6"/>
                  </svg>
                  <span class="tool-label">Rabiscos</span>
                </button>
                <button type="button" class="btn-annotation-tool ${this.activeTool === 'text' ? 'is-active' : ''}" data-tool="text" title="Box de Texto (T)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="4 7 4 4 20 4 20 7"></polyline>
                    <line x1="9" y1="20" x2="15" y2="20"></line>
                    <line x1="12" y1="4" x2="12" y2="20"></line>
                  </svg>
                  <span class="tool-label">Texto</span>
                </button>
              </div>

              <div class="annotation-divider"></div>

              <!-- Color Palette -->
              <div class="annotation-colors" id="annotationColors">
                ${this.COLOR_PALETTE.map(c => `
                  <button type="button" class="color-swatch ${c.color === this.activeColor ? 'is-active' : ''}" data-color="${c.color}" title="${c.name}" style="--swatch-color: ${c.color};"></button>
                `).join('')}
              </div>

              <div class="annotation-divider"></div>

              <!-- Stroke Width Presets -->
              <div class="annotation-stroke-widths" id="annotationStrokeWidths">
                ${this.WIDTH_PRESETS.map(w => `
                  <button type="button" class="stroke-width-btn ${w.value === this.activeWidth ? 'is-active' : ''}" data-width="${w.value}" title="Espessura: ${w.label}">
                    <span class="stroke-dot" style="width: ${w.iconSize}px; height: ${w.iconSize}px;"></span>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Right Controls: Undo, Redo, Delete Selected, Clear & Actions -->
            <div class="annotation-header-right">
              <div class="annotation-history-btns">
                <button type="button" class="btn-annotation-action" id="btnAnnotationUndo" title="Desfazer (Ctrl/Cmd+Z)" disabled>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                  </svg>
                </button>
                <button type="button" class="btn-annotation-action" id="btnAnnotationRedo" title="Refazer (Ctrl/Cmd+Y)" disabled>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                  </svg>
                </button>
                <button type="button" class="btn-annotation-action btn-delete-selected" id="btnAnnotationDeleteSelected" title="Excluir marcação selecionada (Delete / Backspace)" disabled>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
                <button type="button" class="btn-annotation-action" id="btnAnnotationClear" title="Limpar tudo">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3l18 18M9 9v8m6-8v8M4 6h16M10 4h4"/>
                  </svg>
                </button>
              </div>

              <button type="button" class="btn-annotation-cancel" id="btnAnnotationCancel">Cancelar</button>
              <button type="button" class="btn-annotation-complete" id="btnAnnotationComplete">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Concluir e Anexar</span>
              </button>
            </div>
          </header>

          <!-- Interactive Viewport Canvas -->
          <main class="annotation-viewport" id="annotationViewport">
            <div class="annotation-canvas-wrap" id="annotationCanvasWrap">
              <canvas class="annotation-canvas" id="annotationDrawingCanvas" width="${width}" height="${height}"></canvas>
            </div>
          </main>

          <!-- Bottom Hint Pill -->
          <footer class="annotation-studio-footer">
            <span class="annotation-hint-text">
              Dica: Clique em qualquer marcação para <strong>reposicionar</strong> ou <strong>redimensionar</strong> pelos pontos. Use <strong>[V]</strong> para Selecionar, <strong>[Del]</strong> para excluir ou <strong>[Cmd/Ctrl+Z]</strong> para desfazer.
            </span>
          </footer>

        </div>
      `;

      document.body.appendChild(modal);
      this.modalEl = modal;
      this.canvas = modal.querySelector('#annotationDrawingCanvas');
      this.ctx = this.canvas.getContext('2d');
    }

    bindModalEvents() {
      if (!this.modalEl) return;

      // Tool Switcher
      const toolButtons = this.modalEl.querySelectorAll('.btn-annotation-tool');
      toolButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          toolButtons.forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          this.activeTool = btn.getAttribute('data-tool');
          if (this.activeTextOverlay) {
            this.commitTextOverlay();
          }
          if (this.activeTool !== 'select' && this.selectedShape) {
            // Keep shape selection until clicking elsewhere
          }
          this.updateCursor({ clientX: 0, clientY: 0 });
        });
      });

      // Color Swatches
      const swatches = this.modalEl.querySelectorAll('.color-swatch');
      swatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
          swatches.forEach(s => s.classList.remove('is-active'));
          swatch.classList.add('is-active');
          this.activeColor = swatch.getAttribute('data-color');

          // If a shape is currently selected, update its color immediately!
          if (this.selectedShape) {
            this.undoStack.push(this.cloneShapes(this.shapes));
            this.selectedShape.color = this.activeColor;
            this.redoStack = [];
            this.redraw();
            this.updateHistoryButtons();
          }
        });
      });

      // Stroke Width
      const widthBtns = this.modalEl.querySelectorAll('.stroke-width-btn');
      widthBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          widthBtns.forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          this.activeWidth = parseInt(btn.getAttribute('data-width'), 10) || 6;

          // If a shape is currently selected, update its strokeWidth immediately!
          if (this.selectedShape && this.selectedShape.type !== 'text') {
            this.undoStack.push(this.cloneShapes(this.shapes));
            this.selectedShape.strokeWidth = this.getEffectiveWidth();
            this.redoStack = [];
            this.redraw();
            this.updateHistoryButtons();
          }
        });
      });

      // History controls
      const btnUndo = this.modalEl.querySelector('#btnAnnotationUndo');
      const btnRedo = this.modalEl.querySelector('#btnAnnotationRedo');
      const btnDeleteSelected = this.modalEl.querySelector('#btnAnnotationDeleteSelected');
      const btnClear = this.modalEl.querySelector('#btnAnnotationClear');

      if (btnUndo) btnUndo.addEventListener('click', () => this.undo());
      if (btnRedo) btnRedo.addEventListener('click', () => this.redo());
      if (btnDeleteSelected) btnDeleteSelected.addEventListener('click', () => this.deleteSelectedShape());
      if (btnClear) {
        btnClear.addEventListener('click', () => {
          if (this.shapes.length === 0) return;
          this.undoStack.push(this.cloneShapes(this.shapes));
          this.shapes = [];
          this.selectedShape = null;
          this.redoStack = [];
          this.redraw();
          this.updateHistoryButtons();
        });
      }

      // Action Buttons
      const btnCancel = this.modalEl.querySelector('#btnAnnotationCancel');
      const btnComplete = this.modalEl.querySelector('#btnAnnotationComplete');

      if (btnCancel) {
        btnCancel.addEventListener('click', () => this.cancel());
      }

      if (btnComplete) {
        btnComplete.addEventListener('click', () => this.complete());
      }

      // Canvas Pointer Events
      this.canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
      this.canvas.addEventListener('pointermove', (e) => this.onPointerMove(e));
      this.canvas.addEventListener('pointerup', (e) => this.onPointerUp(e));
      this.canvas.addEventListener('pointercancel', (e) => this.onPointerUp(e));

      // Double-click to edit text shape directly
      this.canvas.addEventListener('dblclick', (e) => {
        const { x, y } = this.getCanvasCoordinates(e);
        const hit = this.hitTestShape(x, y);
        if (hit && hit.type === 'text') {
          this.editTextShape(hit, e.clientX, e.clientY);
        }
      });

      // Prevent gestures or scrolling while annotating
      this.canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    }

    getCanvasCoordinates(e) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }

    // =========================================================================
    // Hit Testing & Bounding Box Utilities
    // =========================================================================

    distToSegment(px, py, x1, y1, x2, y2) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const l2 = dx * dx + dy * dy;
      if (l2 === 0) return Math.hypot(px - x1, py - y1);
      let t = ((px - x1) * dx + (py - y1) * dy) / l2;
      t = Math.max(0, Math.min(1, t));
      return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
    }

    getShapeBounds(shape) {
      if (!shape) return null;
      switch (shape.type) {
        case 'arrow': {
          const minX = Math.min(shape.startX, shape.endX);
          const maxX = Math.max(shape.startX, shape.endX);
          const minY = Math.min(shape.startY, shape.endY);
          const maxY = Math.max(shape.startY, shape.endY);
          return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
        }
        case 'rect': {
          const minX = Math.min(shape.startX, shape.endX);
          const maxX = Math.max(shape.startX, shape.endX);
          const minY = Math.min(shape.startY, shape.endY);
          const maxY = Math.max(shape.startY, shape.endY);
          return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
        }
        case 'circle': {
          const cx = (shape.startX + shape.endX) / 2;
          const cy = (shape.startY + shape.endY) / 2;
          const rx = Math.abs(shape.endX - shape.startX) / 2;
          const ry = Math.abs(shape.endY - shape.startY) / 2;
          return {
            minX: cx - rx,
            minY: cy - ry,
            maxX: cx + rx,
            maxY: cy + ry,
            width: rx * 2,
            height: ry * 2,
            cx,
            cy,
            rx,
            ry
          };
        }
        case 'freehand': {
          if (!shape.points || shape.points.length === 0) return null;
          let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
          shape.points.forEach(p => {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
          });
          const extra = Math.max(shape.strokeWidth || 6, 8);
          return {
            minX: minX - extra,
            minY: minY - extra,
            maxX: maxX + extra,
            maxY: maxY + extra,
            width: (maxX - minX) + extra * 2,
            height: (maxY - minY) + extra * 2
          };
        }
        case 'text': {
          const fontSize = shape.fontSize || 24;
          const lines = (shape.text || '').split('\n');
          const lineHeight = fontSize * 1.35;
          const paddingX = Math.round(fontSize * 0.55);
          const paddingY = Math.round(fontSize * 0.4);

          let maxW = 0;
          this.ctx.save();
          this.ctx.font = `600 ${fontSize}px 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
          lines.forEach(line => {
            const m = this.ctx.measureText(line);
            if (m.width > maxW) maxW = m.width;
          });
          this.ctx.restore();

          const width = maxW + paddingX * 2;
          const height = lines.length * lineHeight + paddingY * 2;
          return {
            minX: shape.x,
            minY: shape.y,
            maxX: shape.x + width,
            maxY: shape.y + height,
            width,
            height
          };
        }
        default:
          return null;
      }
    }

    getBoundsHandles(bounds) {
      if (!bounds) return [];
      const { minX, minY, maxX, maxY } = bounds;
      const midX = (minX + maxX) / 2;
      const midY = (minY + maxY) / 2;

      return [
        { name: 'nw', x: minX, y: minY, cursor: 'nwse-resize' },
        { name: 'ne', x: maxX, y: minY, cursor: 'nesw-resize' },
        { name: 'se', x: maxX, y: maxY, cursor: 'nwse-resize' },
        { name: 'sw', x: minX, y: maxY, cursor: 'nesw-resize' },
        { name: 'n', x: midX, y: minY, cursor: 'ns-resize' },
        { name: 's', x: midX, y: maxY, cursor: 'ns-resize' },
        { name: 'w', x: minX, y: midY, cursor: 'ew-resize' },
        { name: 'e', x: maxX, y: midY, cursor: 'ew-resize' }
      ];
    }

    getShapeHandles(shape) {
      if (!shape) return [];
      if (shape.type === 'arrow') {
        return [
          { name: 'start', x: shape.startX, y: shape.startY, cursor: 'crosshair' },
          { name: 'end', x: shape.endX, y: shape.endY, cursor: 'crosshair' }
        ];
      }
      const bounds = this.getShapeBounds(shape);
      return this.getBoundsHandles(bounds);
    }

    hitTestHandles(x, y, shape) {
      if (!shape) return null;
      const handles = this.getShapeHandles(shape);
      const hitRadius = Math.max(10, Math.round(10 * this.scaleFactor));

      for (const h of handles) {
        if (Math.hypot(x - h.x, y - h.y) <= hitRadius) {
          return h;
        }
      }
      return null;
    }

    hitTestShape(x, y) {
      const padding = Math.max(10, Math.round(10 * this.scaleFactor));

      // Search top-to-bottom (last drawn shape first)
      for (let i = this.shapes.length - 1; i >= 0; i--) {
        const shape = this.shapes[i];
        if (this.isPointInsideShape(x, y, shape, padding)) {
          return shape;
        }
      }
      return null;
    }

    isPointInsideShape(x, y, shape, padding) {
      switch (shape.type) {
        case 'arrow': {
          const threshold = Math.max(16, (shape.strokeWidth || 6) * 1.6);
          return this.distToSegment(x, y, shape.startX, shape.startY, shape.endX, shape.endY) <= threshold;
        }
        case 'rect': {
          const minX = Math.min(shape.startX, shape.endX) - padding;
          const maxX = Math.max(shape.startX, shape.endX) + padding;
          const minY = Math.min(shape.startY, shape.endY) - padding;
          const maxY = Math.max(shape.startY, shape.endY) + padding;
          return x >= minX && x <= maxX && y >= minY && y <= maxY;
        }
        case 'circle': {
          const cx = (shape.startX + shape.endX) / 2;
          const cy = (shape.startY + shape.endY) / 2;
          const rx = Math.max(6, Math.abs(shape.endX - shape.startX) / 2) + padding;
          const ry = Math.max(6, Math.abs(shape.endY - shape.startY) / 2) + padding;
          const dx = (x - cx) / rx;
          const dy = (y - cy) / ry;
          return (dx * dx + dy * dy) <= 1.05;
        }
        case 'text': {
          const bounds = this.getShapeBounds(shape);
          if (!bounds) return false;
          return x >= bounds.minX - padding && x <= bounds.maxX + padding &&
                 y >= bounds.minY - padding && y <= bounds.maxY + padding;
        }
        case 'freehand': {
          const threshold = Math.max(16, (shape.strokeWidth || 6) * 1.5);
          if (!shape.points || shape.points.length === 0) return false;
          if (shape.points.length === 1) {
            return Math.hypot(x - shape.points[0].x, y - shape.points[0].y) <= threshold;
          }
          for (let i = 0; i < shape.points.length - 1; i++) {
            if (this.distToSegment(x, y, shape.points[i].x, shape.points[i].y, shape.points[i + 1].x, shape.points[i + 1].y) <= threshold) {
              return true;
            }
          }
          return false;
        }
        default:
          return false;
      }
    }

    // =========================================================================
    // Pointer Events: Selection, Moving, Resizing, and Drawing
    // =========================================================================

    updateCursor(e) {
      if (!this.canvas) return;
      if (this.isDrawing || this.transformMode) return;

      const { x, y } = this.getCanvasCoordinates(e);

      // 1. Check if hovering over handles of selected shape
      if (this.selectedShape) {
        const handle = this.hitTestHandles(x, y, this.selectedShape);
        if (handle) {
          this.canvas.style.cursor = handle.cursor;
          this.hoveredHandle = handle;
          return;
        }
        // 2. Check if hovering over selected shape body
        if (this.isPointInsideShape(x, y, this.selectedShape, Math.max(8, 8 * this.scaleFactor))) {
          this.canvas.style.cursor = 'move';
          this.hoveredHandle = null;
          return;
        }
      }

      this.hoveredHandle = null;

      // 3. If in 'select' mode or hovering over any shape
      const hit = this.hitTestShape(x, y);
      if (hit && this.activeTool === 'select') {
        this.canvas.style.cursor = 'pointer';
        return;
      }

      // 4. Default by tool
      if (this.activeTool === 'select') {
        this.canvas.style.cursor = 'default';
      } else {
        this.canvas.style.cursor = 'crosshair';
      }
    }

    onPointerDown(e) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;

      if (this.activeTextOverlay) {
        this.commitTextOverlay();
        return;
      }

      const { x, y } = this.getCanvasCoordinates(e);

      // Check if user clicked on a handle of the selected shape
      if (this.selectedShape) {
        const handle = this.hitTestHandles(x, y, this.selectedShape);
        if (handle) {
          this.transformMode = {
            type: 'resize',
            handle: handle.name,
            initialShape: this.cloneShape(this.selectedShape),
            initBounds: this.getShapeBounds(this.selectedShape),
            startPoint: { x, y }
          };
          this.canvas.setPointerCapture(e.pointerId);
          return;
        }
      }

      // Check if user clicked on an existing shape (either in 'select' mode or directly clicking to reposition)
      const clickedShape = this.hitTestShape(x, y);

      if (clickedShape && (this.activeTool === 'select' || clickedShape === this.selectedShape)) {
        this.selectedShape = clickedShape;
        this.transformMode = {
          type: 'move',
          initialShape: this.cloneShape(clickedShape),
          startPoint: { x, y }
        };
        this.canvas.setPointerCapture(e.pointerId);
        this.redraw();
        this.updateHistoryButtons();
        return;
      }

      // If user is in 'select' mode and clicked empty space
      if (this.activeTool === 'select') {
        if (clickedShape) {
          this.selectedShape = clickedShape;
          this.transformMode = {
            type: 'move',
            initialShape: this.cloneShape(clickedShape),
            startPoint: { x, y }
          };
          this.canvas.setPointerCapture(e.pointerId);
        } else {
          this.selectedShape = null;
        }
        this.redraw();
        this.updateHistoryButtons();
        return;
      }

      // If drawing with a shape tool, clear existing selection and begin drawing
      this.selectedShape = null;

      if (this.activeTool === 'text') {
        this.openTextOverlay(e.clientX, e.clientY, x, y);
        return;
      }

      this.isDrawing = true;
      this.canvas.setPointerCapture(e.pointerId);

      const color = this.activeColor;
      const strokeWidth = this.getEffectiveWidth();

      if (this.activeTool === 'freehand') {
        this.currentDraft = {
          type: 'freehand',
          points: [{ x, y }],
          color,
          strokeWidth
        };
      } else if (this.activeTool === 'arrow') {
        this.currentDraft = {
          type: 'arrow',
          startX: x,
          startY: y,
          endX: x,
          endY: y,
          color,
          strokeWidth
        };
      } else if (this.activeTool === 'circle') {
        this.currentDraft = {
          type: 'circle',
          startX: x,
          startY: y,
          endX: x,
          endY: y,
          color,
          strokeWidth
        };
      } else if (this.activeTool === 'rect') {
        this.currentDraft = {
          type: 'rect',
          startX: x,
          startY: y,
          endX: x,
          endY: y,
          color,
          strokeWidth
        };
      }

      this.redraw();
    }

    onPointerMove(e) {
      const { x, y } = this.getCanvasCoordinates(e);

      // Update interactive hover cursor when idle
      if (!this.isDrawing && !this.transformMode) {
        this.updateCursor(e);
        return;
      }

      // 1. Handling Transform (Moving or Resizing)
      if (this.transformMode && this.selectedShape) {
        const { type, handle, initialShape, initBounds, startPoint } = this.transformMode;
        const dx = x - startPoint.x;
        const dy = y - startPoint.y;

        if (type === 'move') {
          // Repositioning entire object
          if (this.selectedShape.type === 'arrow' || this.selectedShape.type === 'rect' || this.selectedShape.type === 'circle') {
            this.selectedShape.startX = initialShape.startX + dx;
            this.selectedShape.startY = initialShape.startY + dy;
            this.selectedShape.endX = initialShape.endX + dx;
            this.selectedShape.endY = initialShape.endY + dy;
          } else if (this.selectedShape.type === 'text') {
            this.selectedShape.x = initialShape.x + dx;
            this.selectedShape.y = initialShape.y + dy;
          } else if (this.selectedShape.type === 'freehand') {
            this.selectedShape.points = initialShape.points.map(p => ({
              x: p.x + dx,
              y: p.y + dy
            }));
          }
        } else if (type === 'resize') {
          // Resizing via handle
          if (this.selectedShape.type === 'arrow') {
            if (handle === 'start') {
              this.selectedShape.startX = x;
              this.selectedShape.startY = y;
            } else if (handle === 'end') {
              this.selectedShape.endX = x;
              this.selectedShape.endY = y;
            }
          } else if (this.selectedShape.type === 'rect' || this.selectedShape.type === 'circle') {
            let minX = Math.min(initialShape.startX, initialShape.endX);
            let maxX = Math.max(initialShape.startX, initialShape.endX);
            let minY = Math.min(initialShape.startY, initialShape.endY);
            let maxY = Math.max(initialShape.startY, initialShape.endY);

            if (handle.includes('e')) maxX = Math.max(minX + 8, x);
            if (handle.includes('w')) minX = Math.min(maxX - 8, x);
            if (handle.includes('s')) maxY = Math.max(minY + 8, y);
            if (handle.includes('n')) minY = Math.min(maxY - 8, y);

            if (e.shiftKey) {
              const side = Math.max(maxX - minX, maxY - minY);
              if (handle.includes('w')) minX = maxX - side; else maxX = minX + side;
              if (handle.includes('n')) minY = maxY - side; else maxY = minY + side;
            }

            this.selectedShape.startX = minX;
            this.selectedShape.startY = minY;
            this.selectedShape.endX = maxX;
            this.selectedShape.endY = maxY;
          } else if (this.selectedShape.type === 'freehand') {
            if (initBounds) {
              let newMinX = initBounds.minX;
              let newMaxX = initBounds.maxX;
              let newMinY = initBounds.minY;
              let newMaxY = initBounds.maxY;

              if (handle.includes('e')) newMaxX = Math.max(newMinX + 12, x);
              if (handle.includes('w')) newMinX = Math.min(newMaxX - 12, x);
              if (handle.includes('s')) newMaxY = Math.max(newMinY + 12, y);
              if (handle.includes('n')) newMinY = Math.min(newMaxY - 12, y);

              const scaleX = (newMaxX - newMinX) / Math.max(1, initBounds.width);
              const scaleY = (newMaxY - newMinY) / Math.max(1, initBounds.height);

              this.selectedShape.points = initialShape.points.map(p => ({
                x: newMinX + (p.x - initBounds.minX) * scaleX,
                y: newMinY + (p.y - initBounds.minY) * scaleY
              }));
            }
          } else if (this.selectedShape.type === 'text') {
            if (initBounds) {
              let newMinX = initBounds.minX;
              let newMaxX = initBounds.maxX;
              let newMinY = initBounds.minY;
              let newMaxY = initBounds.maxY;

              if (handle.includes('e')) newMaxX = Math.max(newMinX + 20, x);
              if (handle.includes('w')) newMinX = Math.min(newMaxX - 20, x);
              if (handle.includes('s')) newMaxY = Math.max(newMinY + 16, y);
              if (handle.includes('n')) newMinY = Math.min(newMaxY - 16, y);

              const scale = Math.max(0.4, Math.min(3.5, (newMaxY - newMinY) / Math.max(1, initBounds.height)));
              this.selectedShape.fontSize = Math.max(12, Math.round(initialShape.fontSize * scale));
              this.selectedShape.x = newMinX;
              this.selectedShape.y = newMinY;
            }
          }
        }

        this.redraw();
        return;
      }

      // 2. Handling Active Drawing
      if (this.isDrawing && this.currentDraft) {
        if (this.currentDraft.type === 'freehand') {
          this.currentDraft.points.push({ x, y });
        } else {
          if (e.shiftKey && (this.currentDraft.type === 'circle' || this.currentDraft.type === 'rect')) {
            const dx = x - this.currentDraft.startX;
            const dy = y - this.currentDraft.startY;
            const side = Math.max(Math.abs(dx), Math.abs(dy));
            this.currentDraft.endX = this.currentDraft.startX + (dx >= 0 ? side : -side);
            this.currentDraft.endY = this.currentDraft.startY + (dy >= 0 ? side : -side);
          } else {
            this.currentDraft.endX = x;
            this.currentDraft.endY = y;
          }
        }
        this.redraw();
      }
    }

    onPointerUp(e) {
      try {
        this.canvas.releasePointerCapture(e.pointerId);
      } catch (err) {}

      // 1. Concluding Transform (Move or Resize)
      if (this.transformMode) {
        const { initialShape } = this.transformMode;
        // Check if shape actually modified
        const changed = JSON.stringify(initialShape) !== JSON.stringify(this.selectedShape);
        if (changed) {
          // Push old state to undo stack
          this.undoStack.push(this.shapes.map(s => (s === this.selectedShape ? initialShape : this.cloneShape(s))));
          this.redoStack = [];
          this.updateHistoryButtons();
        }
        this.transformMode = null;
        this.redraw();
        return;
      }

      // 2. Concluding Drawing
      if (!this.isDrawing || !this.currentDraft) return;
      this.isDrawing = false;

      let isValid = false;

      if (this.currentDraft.type === 'freehand') {
        isValid = this.currentDraft.points && this.currentDraft.points.length > 0;
      } else if (this.currentDraft.type === 'arrow') {
        const dx = this.currentDraft.endX - this.currentDraft.startX;
        const dy = this.currentDraft.endY - this.currentDraft.startY;
        isValid = Math.sqrt(dx * dx + dy * dy) >= 6;
      } else if (this.currentDraft.type === 'circle' || this.currentDraft.type === 'rect') {
        const w = Math.abs(this.currentDraft.endX - this.currentDraft.startX);
        const h = Math.abs(this.currentDraft.endY - this.currentDraft.startY);
        isValid = w >= 4 && h >= 4;
      }

      if (isValid) {
        this.undoStack.push(this.cloneShapes(this.shapes));
        this.shapes.push(this.currentDraft);
        // Automatically select the freshly drawn shape so user can reposition or resize right away!
        this.selectedShape = this.currentDraft;
        this.redoStack = [];
      }

      this.currentDraft = null;
      this.redraw();
      this.updateHistoryButtons();
    }

    deleteSelectedShape() {
      if (!this.selectedShape) return;
      const idx = this.shapes.indexOf(this.selectedShape);
      if (idx !== -1) {
        this.undoStack.push(this.cloneShapes(this.shapes));
        this.shapes.splice(idx, 1);
        this.selectedShape = null;
        this.redoStack = [];
        this.redraw();
        this.updateHistoryButtons();
      }
    }

    editTextShape(shape, clientX, clientY) {
      if (!shape || shape.type !== 'text') return;
      this.selectedShape = shape;
      this.openTextOverlay(clientX, clientY, shape.x, shape.y, shape.text, (newText) => {
        if (newText !== shape.text) {
          this.undoStack.push(this.cloneShapes(this.shapes));
          shape.text = newText;
          this.redoStack = [];
          this.redraw();
          this.updateHistoryButtons();
        }
      });
    }

    openTextOverlay(clientX, clientY, canvasX, canvasY, initialText = '', onCustomCommit = null) {
      if (this.activeTextOverlay) {
        this.commitTextOverlay();
      }

      const wrap = document.createElement('div');
      wrap.className = 'annotation-text-input-wrap';
      wrap.style.left = `${clientX}px`;
      wrap.style.top = `${clientY}px`;
      wrap.style.setProperty('--text-accent-color', this.activeColor);

      wrap.innerHTML = `
        <div class="annotation-text-input-card">
          <textarea class="annotation-text-input" placeholder="Digite sua anotação..." rows="2">${this.escapeHTML(initialText)}</textarea>
          <div class="annotation-text-input-footer">
            <span class="text-hint">Enter para fixar</span>
            <div class="text-btns">
              <button type="button" class="btn-text-cancel">✕</button>
              <button type="button" class="btn-text-ok">✓</button>
            </div>
          </div>
        </div>
      `;

      this.modalEl.appendChild(wrap);
      const textarea = wrap.querySelector('.annotation-text-input');
      const btnOk = wrap.querySelector('.btn-text-ok');
      const btnCancel = wrap.querySelector('.btn-text-cancel');

      this.activeTextOverlay = {
        wrap,
        textarea,
        canvasX,
        canvasY,
        color: this.activeColor,
        fontSize: this.getEffectiveFontSize(),
        onCustomCommit
      };

      setTimeout(() => {
        textarea.focus();
        if (initialText) {
          textarea.setSelectionRange(initialText.length, initialText.length);
        }
      }, 30);

      textarea.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' && !ev.shiftKey) {
          ev.preventDefault();
          this.commitTextOverlay();
        } else if (ev.key === 'Escape') {
          ev.preventDefault();
          this.discardTextOverlay();
        }
      });

      btnOk.addEventListener('click', (ev) => {
        ev.stopPropagation();
        this.commitTextOverlay();
      });

      btnCancel.addEventListener('click', (ev) => {
        ev.stopPropagation();
        this.discardTextOverlay();
      });
    }

    commitTextOverlay() {
      if (!this.activeTextOverlay) return;
      const { wrap, textarea, canvasX, canvasY, color, fontSize, onCustomCommit } = this.activeTextOverlay;
      const val = textarea.value.trim();

      if (typeof onCustomCommit === 'function') {
        onCustomCommit(val);
      } else if (val) {
        this.undoStack.push(this.cloneShapes(this.shapes));
        const newShape = {
          type: 'text',
          x: canvasX,
          y: canvasY,
          text: val,
          color,
          fontSize
        };
        this.shapes.push(newShape);
        this.selectedShape = newShape;
        this.redoStack = [];
        this.redraw();
        this.updateHistoryButtons();
      }

      wrap.remove();
      this.activeTextOverlay = null;
    }

    discardTextOverlay() {
      if (!this.activeTextOverlay) return;
      this.activeTextOverlay.wrap.remove();
      this.activeTextOverlay = null;
    }

    undo() {
      if (this.undoStack.length === 0) return;
      this.redoStack.push(this.cloneShapes(this.shapes));
      this.shapes = this.undoStack.pop();
      this.selectedShape = null;
      this.redraw();
      this.updateHistoryButtons();
    }

    redo() {
      if (this.redoStack.length === 0) return;
      this.undoStack.push(this.cloneShapes(this.shapes));
      this.shapes = this.redoStack.pop();
      this.selectedShape = null;
      this.redraw();
      this.updateHistoryButtons();
    }

    updateHistoryButtons() {
      const btnUndo = this.modalEl?.querySelector('#btnAnnotationUndo');
      const btnRedo = this.modalEl?.querySelector('#btnAnnotationRedo');
      const btnDel = this.modalEl?.querySelector('#btnAnnotationDeleteSelected');

      if (btnUndo) btnUndo.disabled = this.undoStack.length === 0;
      if (btnRedo) btnRedo.disabled = this.redoStack.length === 0;
      if (btnDel) btnDel.disabled = !this.selectedShape;
    }

    redraw() {
      if (!this.ctx || !this.canvas) return;
      const w = this.canvas.width;
      const h = this.canvas.height;

      this.ctx.clearRect(0, 0, w, h);

      // 1. Draw base frozen frame
      if (this.baseCanvas) {
        this.ctx.drawImage(this.baseCanvas, 0, 0, w, h);
      }

      // 2. Draw all shapes in history
      for (const shape of this.shapes) {
        this.renderShape(this.ctx, shape);
      }

      // 3. Draw active draft being drawn
      if (this.currentDraft) {
        this.renderShape(this.ctx, this.currentDraft);
      }

      // 4. Draw interactive selection handles & bounding box for selectedShape
      if (this.selectedShape && !this.isDrawing) {
        this.drawSelectionUI(this.ctx, this.selectedShape);
      }
    }

    drawSelectionUI(ctx, shape) {
      if (!shape) return;
      const sf = this.scaleFactor;
      // Handles 50% smaller for a sleek, discreet, precision aesthetic
      const handleRadius = Math.max(3.5, Math.round(3 * sf));

      ctx.save();

      if (shape.type === 'arrow') {
        // Arrow selection: Circular handles at start and tip (50% smaller)
        const handles = [
          { x: shape.startX, y: shape.startY, name: 'start' },
          { x: shape.endX, y: shape.endY, name: 'end' }
        ];

        // Subtle guideline between ends
        ctx.setLineDash([3 * sf, 2.5 * sf]);
        ctx.strokeStyle = 'rgba(255, 84, 0, 0.45)';
        ctx.lineWidth = Math.max(1.2, Math.round(1.2 * sf));
        ctx.beginPath();
        ctx.moveTo(shape.startX, shape.startY);
        ctx.lineTo(shape.endX, shape.endY);
        ctx.stroke();

        ctx.setLineDash([]);
        handles.forEach(h => {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 3;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 1;

          ctx.beginPath();
          ctx.arc(h.x, h.y, handleRadius * 1.1, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.strokeStyle = '#FF5400';
          ctx.lineWidth = Math.max(1.5, Math.round(1.5 * sf));
          ctx.stroke();
        });

        ctx.restore();
        return;
      }

      const bounds = this.getShapeBounds(shape);
      if (!bounds) {
        ctx.restore();
        return;
      }

      const { minX, minY, width, height } = bounds;

      // 1. Dark dashed border for high contrast
      ctx.setLineDash([5 * sf, 3.5 * sf]);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.lineWidth = Math.max(2, Math.round(1.8 * sf));
      ctx.strokeRect(minX, minY, width, height);

      // 2. Bright Orange dashed border
      ctx.strokeStyle = '#FF5400';
      ctx.lineWidth = Math.max(1.2, Math.round(1.2 * sf));
      ctx.strokeRect(minX, minY, width, height);

      // 3. Render 8 resize handles (50% smaller square handles)
      ctx.setLineDash([]);
      const handles = this.getBoundsHandles(bounds);
      const size = Math.max(6, Math.round(handleRadius * 1.8));

      handles.forEach(h => {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 1;

        ctx.beginPath();
        ctx.rect(h.x - size / 2, h.y - size / 2, size, size);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = '#FF5400';
        ctx.lineWidth = Math.max(1.4, Math.round(1.3 * sf));
        ctx.stroke();
      });

      ctx.restore();
    }

    renderShape(ctx, shape) {
      if (!shape) return;

      switch (shape.type) {
        case 'arrow':
          this.drawArrow(ctx, shape.startX, shape.startY, shape.endX, shape.endY, shape.color, shape.strokeWidth);
          break;
        case 'circle':
          this.drawCircle(ctx, shape.startX, shape.startY, shape.endX, shape.endY, shape.color, shape.strokeWidth);
          break;
        case 'rect':
          this.drawRect(ctx, shape.startX, shape.startY, shape.endX, shape.endY, shape.color, shape.strokeWidth);
          break;
        case 'freehand':
          this.drawFreehand(ctx, shape.points, shape.color, shape.strokeWidth);
          break;
        case 'text':
          this.drawText(ctx, shape.x, shape.y, shape.text, shape.color, shape.fontSize);
          break;
      }
    }

    drawArrow(ctx, startX, startY, endX, endY, color, width) {
      const dx = endX - startX;
      const dy = endY - startY;
      const length = Math.sqrt(dx * dx + dy * dy);
      if (length < 3) return;

      const angle = Math.atan2(dy, dx);
      const headLength = Math.max(16, width * 3.6);
      const arrowAngle = Math.PI / 6; // 30 degrees

      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Contrast shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      ctx.shadowBlur = Math.max(3, width);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;

      // Shaft line
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Sleek arrowhead with notched back
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      const x1 = endX - headLength * Math.cos(angle - arrowAngle);
      const y1 = endY - headLength * Math.sin(angle - arrowAngle);
      const x2 = endX - headLength * Math.cos(angle + arrowAngle);
      const y2 = endY - headLength * Math.sin(angle + arrowAngle);
      const indentX = endX - (headLength * 0.72) * Math.cos(angle);
      const indentY = endY - (headLength * 0.72) * Math.sin(angle);

      ctx.lineTo(x1, y1);
      ctx.lineTo(indentX, indentY);
      ctx.lineTo(x2, y2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }

    drawCircle(ctx, startX, startY, endX, endY, color, width) {
      const cx = (startX + endX) / 2;
      const cy = (startY + endY) / 2;
      const rx = Math.abs(endX - startX) / 2;
      const ry = Math.abs(endY - startY) / 2;
      if (rx < 2 && ry < 2) return;

      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      ctx.shadowBlur = Math.max(3, width);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;

      ctx.beginPath();
      if (ctx.ellipse) {
        ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
      } else {
        const r = Math.max(rx, ry);
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
      }
      ctx.stroke();
      ctx.restore();
    }

    drawRect(ctx, startX, startY, endX, endY, color, width) {
      const x = Math.min(startX, endX);
      const y = Math.min(startY, endY);
      const w = Math.abs(endX - startX);
      const h = Math.abs(endY - startY);
      if (w < 2 && h < 2) return;

      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      ctx.shadowBlur = Math.max(3, width);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;

      const radius = Math.min(10 * this.scaleFactor, Math.min(w / 2, h / 2));
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, w, h, radius);
      } else {
        ctx.rect(x, y, w, h);
      }
      ctx.stroke();
      ctx.restore();
    }

    drawFreehand(ctx, points, color, width) {
      if (!points || points.length === 0) return;

      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      ctx.shadowBlur = Math.max(3, width);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;

      if (points.length === 1) {
        ctx.beginPath();
        ctx.arc(points[0].x, points[0].y, width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
      }

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 1; i++) {
        const midX = (points[i].x + points[i + 1].x) / 2;
        const midY = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.stroke();

      ctx.restore();
    }

    drawText(ctx, x, y, text, color, fontSize = 24) {
      if (!text || !text.trim()) return;
      const lines = text.split('\n');
      const lineHeight = fontSize * 1.35;
      const paddingX = Math.round(fontSize * 0.55);
      const paddingY = Math.round(fontSize * 0.4);

      ctx.save();
      ctx.font = `600 ${fontSize}px 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;

      let maxW = 0;
      lines.forEach(line => {
        const m = ctx.measureText(line);
        if (m.width > maxW) maxW = m.width;
      });

      const totalH = lines.length * lineHeight;
      const boxW = maxW + paddingX * 2;
      const boxH = totalH + paddingY * 2;

      // Dark glassy container behind text for 100% legibility
      ctx.fillStyle = 'rgba(15, 17, 23, 0.90)';
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(2, Math.round(2 * this.scaleFactor));
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      const radius = Math.min(8 * this.scaleFactor, boxH / 2);
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, boxW, boxH, radius);
      } else {
        ctx.rect(x, y, boxW, boxH);
      }
      ctx.fill();
      ctx.stroke();

      // Sharp white text with crisp rendering
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#FFFFFF';
      ctx.textBaseline = 'top';

      lines.forEach((line, idx) => {
        ctx.fillText(line, x + paddingX, y + paddingY + idx * lineHeight);
      });

      ctx.restore();
    }

    handleKeyDown(e) {
      if (!this.modalEl) return;

      // If active text editor overlay is open, don't trigger hotkeys
      if (this.activeTextOverlay) return;

      // Delete / Backspace: Delete selected shape
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.selectedShape) {
          e.preventDefault();
          this.deleteSelectedShape();
          return;
        }
      }

      // Undo: Cmd+Z or Ctrl+Z
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          this.redo();
        } else {
          this.undo();
        }
        return;
      }

      // Redo: Cmd+Y or Ctrl+Y
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        this.redo();
        return;
      }

      // Escape: Deselect current shape or Cancel/Close
      if (e.key === 'Escape') {
        e.preventDefault();
        if (this.selectedShape) {
          this.selectedShape = null;
          this.redraw();
          this.updateHistoryButtons();
        } else {
          this.cancel();
        }
        return;
      }

      // Single-key tool shortcuts
      const key = e.key.toLowerCase();
      if (key === 'v') {
        this.selectTool('select');
      } else if (key === 'a') {
        this.selectTool('arrow');
      } else if (key === 'c') {
        this.selectTool('circle');
      } else if (key === 'r') {
        this.selectTool('rect');
      } else if (key === 'b') {
        this.selectTool('freehand');
      } else if (key === 't') {
        this.selectTool('text');
      }
    }

    selectTool(toolName) {
      const btn = this.modalEl?.querySelector(`.btn-annotation-tool[data-tool="${toolName}"]`);
      if (btn) btn.click();
    }

    cancel() {
      if (this.shapes.length > 0) {
        if (!confirm('Deseja descartar as anotações feitas na tela?')) return;
      }
      this.close();
      if (this.mediaData && typeof this.mediaData.onCancel === 'function') {
        this.mediaData.onCancel();
      }
    }

    exportOptimizedBlob(callback) {
      const maxDim = 1920;
      let targetCanvas = this.canvas;

      // Smart downscaling if dimensions exceed 1920px (e.g. 4K, 8K)
      if (this.canvas.width > maxDim || this.canvas.height > maxDim) {
        const ratio = Math.min(maxDim / this.canvas.width, maxDim / this.canvas.height);
        const targetW = Math.round(this.canvas.width * ratio);
        const targetH = Math.round(this.canvas.height * ratio);

        const offCanvas = document.createElement('canvas');
        offCanvas.width = targetW;
        offCanvas.height = targetH;
        const offCtx = offCanvas.getContext('2d');
        offCtx.imageSmoothingEnabled = true;
        offCtx.imageSmoothingQuality = 'high';
        offCtx.drawImage(this.canvas, 0, 0, targetW, targetH);
        targetCanvas = offCanvas;
      }

      // Export as WebP with 0.82 quality for ultra-fast loading without perceptual loss
      targetCanvas.toBlob((blob) => {
        if (blob && blob.type === 'image/webp') {
          callback(blob, 'webp', 'image/webp');
        } else {
          // Fallback to JPEG at 0.84 quality if WebP not supported
          targetCanvas.toBlob((jpgBlob) => {
            if (jpgBlob) {
              callback(jpgBlob, 'jpg', 'image/jpeg');
            } else {
              targetCanvas.toBlob((pngBlob) => {
                callback(pngBlob, 'png', 'image/png');
              }, 'image/png');
            }
          }, 'image/jpeg', 0.84);
        }
      }, 'image/webp', 0.82);
    }

    complete() {
      if (this.activeTextOverlay) {
        this.commitTextOverlay();
      }

      if (this.shapes.length === 0) {
        if (window.showToast) window.showToast('Faça ao menos uma anotação na tela antes de salvar.');
        return;
      }

      // Deselect shape so selection handles and bounding box are NOT exported into final image!
      this.selectedShape = null;
      this.redraw();

      const isImage = this.mediaData.isImage;
      const currentTime = this.mediaData.currentTime || 0;
      const formattedTime = this.formatTimecode(currentTime).replace(/:/g, '-');

      this.exportOptimizedBlob((blob, extension, mimeType) => {
        if (!blob) {
          if (window.showToast) window.showToast('Erro ao exportar marcação na tela.');
          return;
        }

        const fileName = isImage
          ? `marcacao-foto-${Date.now().toString().slice(-4)}.${extension}`
          : `marcacao-frame-${formattedTime}-${Date.now().toString().slice(-4)}.${extension}`;

        const file = new File([blob], fileName, { type: mimeType });

        if (this.mediaData && typeof this.mediaData.onComplete === 'function') {
          this.mediaData.onComplete(file, currentTime);
        }

        this.close();
      });
    }

    close() {
      window.removeEventListener('keydown', this.handleKeyDown);
      if (this.modalEl) {
        this.modalEl.classList.add('closing');
        setTimeout(() => {
          if (this.modalEl) {
            this.modalEl.remove();
            this.modalEl = null;
          }
        }, 200);
      }
      this.baseCanvas = null;
      this.baseCtx = null;
      this.canvas = null;
      this.ctx = null;
      this.activeTextOverlay = null;
      this.selectedShape = null;
      this.transformMode = null;
    }

    escapeHTML(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  }

  // Expose singleton on window
  window.FrameAnnotationStudio = new AnnotationStudio();
})();
