import type { CameraName } from '../Game';

export interface MonitorCamera {
  name: CameraName;
  label: string;
}

interface MonitorUIOptions {
  cameras: MonitorCamera[];
  onOpen: () => void;
  onClose: () => void;
  onCameraSelected: (name: CameraName) => void;
  mount?: HTMLElement;
}

interface CameraEntry {
  button: HTMLButtonElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  imageData: ImageData | null;
}

let stylesInjected = false;

export class MonitorUI {
  private readonly options: MonitorUIOptions;
  private readonly overlay: HTMLDivElement;
  private readonly toggleButton: HTMLButtonElement;
  private readonly backButton: HTMLButtonElement;
  private readonly scrim: HTMLDivElement;
  private readonly grid: HTMLDivElement;
  private readonly cameraEntries: Map<CameraName, CameraEntry> = new Map();
  private isOpen = false;
  private activeCamera: CameraName | null = null;
  private readonly keyHandler = (ev: KeyboardEvent): void => {
    if (!this.isOpen) return;
    if (ev.key === 'Escape') {
      ev.preventDefault();
      this.close();
    }
  };

  constructor(options: MonitorUIOptions) {
    this.options = options;
    this.injectStyles();

    const mountTarget = options.mount ?? document.body;

    this.overlay = document.createElement('div');
    this.overlay.className = 'monitor-overlay';
    this.overlay.setAttribute('aria-hidden', 'true');

    this.scrim = document.createElement('div');
    this.scrim.className = 'monitor-overlay__scrim';
    this.overlay.appendChild(this.scrim);

    const panel = document.createElement('div');
    panel.className = 'monitor-overlay__panel';
    this.overlay.appendChild(panel);

    const header = document.createElement('div');
    header.className = 'monitor-overlay__header';
    panel.appendChild(header);

    this.backButton = document.createElement('button');
    this.backButton.type = 'button';
    this.backButton.className = 'monitor-overlay__back';
    this.backButton.textContent = 'Back';
    header.appendChild(this.backButton);

    const title = document.createElement('div');
    title.className = 'monitor-overlay__title';
    title.textContent = 'CCTV';
    header.appendChild(title);

    this.grid = document.createElement('div');
    this.grid.className = 'monitor-overlay__grid';
    panel.appendChild(this.grid);

    for (const camera of options.cameras) {
      const entry = this.createCameraButton(camera);
      this.cameraEntries.set(camera.name, entry);
      this.grid.appendChild(entry.button);
    }

    mountTarget.appendChild(this.overlay);

    this.toggleButton = document.createElement('button');
    this.toggleButton.type = 'button';
    this.toggleButton.className = 'monitor-toggle';
    this.toggleButton.setAttribute('aria-label', 'Open cameras');
    this.toggleButton.innerHTML = '<span class="monitor-toggle__dot"></span><span class="monitor-toggle__label">CAM</span>';
    mountTarget.appendChild(this.toggleButton);

    this.toggleButton.addEventListener('click', () => this.open());
    this.toggleButton.addEventListener('touchstart', (ev) => {
      ev.preventDefault();
      this.open();
    }, { passive: false });

    this.backButton.addEventListener('click', () => this.close());
    this.backButton.addEventListener('touchstart', (ev) => {
      ev.preventDefault();
      this.close();
    }, { passive: false });
    this.scrim.addEventListener('click', () => this.close());
    this.scrim.addEventListener('touchstart', (ev) => {
      ev.preventDefault();
      this.close();
    }, { passive: false });
  }

  public destroy(): void {
    this.toggleButton.remove();
    this.overlay.remove();
    document.removeEventListener('keydown', this.keyHandler);
  }

  public open(): void {
    if (this.isOpen) return;
    this.isOpen = true;
    this.overlay.classList.add('monitor-overlay--open');
    this.overlay.setAttribute('aria-hidden', 'false');
    this.toggleButton.classList.add('monitor-toggle--hidden');
    document.addEventListener('keydown', this.keyHandler);
    this.backButton.focus({ preventScroll: true });
    this.options.onOpen();
  }

  public close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.overlay.classList.remove('monitor-overlay--open');
    this.overlay.setAttribute('aria-hidden', 'true');
    this.toggleButton.classList.remove('monitor-toggle--hidden');
    document.removeEventListener('keydown', this.keyHandler);
    this.toggleButton.focus({ preventScroll: true });
    this.options.onClose();
  }

  public isOverlayOpen(): boolean {
    return this.isOpen;
  }

  public setActiveCamera(name: CameraName): void {
    if (this.activeCamera === name) return;
    this.activeCamera = name;
    for (const [cameraName, entry] of this.cameraEntries.entries()) {
      if (cameraName === name) {
        entry.button.classList.add('monitor-overlay__camera--active');
      } else {
        entry.button.classList.remove('monitor-overlay__camera--active');
      }
    }
  }

  public updateCameraPreview(name: CameraName, pixels: Uint8ClampedArray, width: number, height: number): void {
    const entry = this.cameraEntries.get(name);
    if (!entry) return;
    if (!entry.imageData || entry.imageData.width !== width || entry.imageData.height !== height) {
      entry.imageData = new ImageData(width, height);
      entry.canvas.width = width;
      entry.canvas.height = height;
      entry.ctx.imageSmoothingEnabled = false;
    }
    entry.imageData.data.set(pixels);
    entry.ctx.putImageData(entry.imageData, 0, 0);
  }

  private createCameraButton(camera: MonitorCamera): CameraEntry {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'monitor-overlay__camera';
    button.setAttribute('data-camera', camera.name);

    const preview = document.createElement('div');
    preview.className = 'monitor-overlay__preview';
    button.appendChild(preview);

    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    preview.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Unable to create canvas context for monitor preview');
    }
    ctx.imageSmoothingEnabled = false;

    const label = document.createElement('span');
    label.className = 'monitor-overlay__label';
    label.textContent = camera.label;
    button.appendChild(label);

    button.addEventListener('click', () => {
      this.options.onCameraSelected(camera.name);
      this.setActiveCamera(camera.name);
    });

    button.addEventListener('touchstart', (ev) => {
      ev.preventDefault();
      this.options.onCameraSelected(camera.name);
      this.setActiveCamera(camera.name);
    }, { passive: false });

    return {
      button,
      canvas,
      ctx,
      imageData: null
    };
  }

  private injectStyles(): void {
    if (stylesInjected) return;
    stylesInjected = true;

    const style = document.createElement('style');
    style.textContent = `
      .monitor-overlay {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        touch-action: none;
        opacity: 0;
        transition: opacity 180ms ease, transform 220ms ease;
        transform: scale(0.985);
        z-index: 30;
      }

      .monitor-overlay--open {
        pointer-events: auto;
        opacity: 1;
        transform: scale(1);
      }

      .monitor-overlay__scrim {
        position: absolute;
        inset: 0;
        background: rgba(5, 12, 22, 0.92);
        backdrop-filter: blur(2px);
      }

      .monitor-overlay__panel {
        position: relative;
        width: min(92vw, 760px);
        max-height: min(92vh, 620px);
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 24px;
        border-radius: 18px;
        background: linear-gradient(180deg, rgba(15, 32, 55, 0.9) 0%, rgba(5, 16, 25, 0.96) 100%);
        border: 1px solid rgba(94, 234, 212, 0.22);
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
        overflow: hidden;
      }

      .monitor-overlay__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .monitor-overlay__back {
        appearance: none;
        border: 1px solid rgba(94, 234, 212, 0.35);
        background: rgba(15, 32, 55, 0.8);
        color: #5eead4;
        padding: 10px 16px;
        border-radius: 12px;
        font-family: 'Share Tech Mono', monospace;
        font-size: 14px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        cursor: pointer;
        transition: transform 140ms ease, border-color 140ms ease;
      }

      .monitor-overlay__back:active {
        transform: scale(0.97);
      }

      .monitor-overlay__title {
        font-family: 'Share Tech Mono', monospace;
        font-size: 18px;
        color: #e2f9f3;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      .monitor-overlay__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 18px;
        overflow-y: auto;
        padding-bottom: 8px;
      }

      .monitor-overlay__camera {
        appearance: none;
        border: 1px solid rgba(94, 234, 212, 0.16);
        background: rgba(12, 24, 35, 0.95);
        color: #cbd5f5;
        border-radius: 14px;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        cursor: pointer;
        transition: border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease;
        min-height: 160px;
      }

      .monitor-overlay__camera--active {
        border-color: rgba(94, 234, 212, 0.55);
        box-shadow: 0 0 18px rgba(94, 234, 212, 0.25);
      }

      .monitor-overlay__camera:active {
        transform: scale(0.98);
      }

      .monitor-overlay__preview {
        flex: 1;
        background: radial-gradient(circle at center, rgba(255, 255, 255, 0.08), rgba(20, 42, 60, 0.8));
        border-radius: 10px;
        overflow: hidden;
        position: relative;
      }

      .monitor-overlay__preview::after {
        content: '';
        position: absolute;
        inset: 0;
        background-image: repeating-linear-gradient(
          rgba(255, 255, 255, 0.05) 0,
          rgba(255, 255, 255, 0.05) 1px,
          transparent 1px,
          transparent 3px
        );
        pointer-events: none;
      }

      .monitor-overlay__preview canvas {
        width: 100%;
        height: 100%;
        display: block;
        image-rendering: pixelated;
      }

      .monitor-overlay__label {
        font-family: 'Share Tech Mono', monospace;
        letter-spacing: 0.12em;
        font-size: 13px;
        text-transform: uppercase;
        color: #94a3ff;
      }

      .monitor-toggle {
        position: fixed;
        right: 24px;
        bottom: 24px;
        width: 88px;
        height: 88px;
        border-radius: 50%;
        border: 1px solid rgba(94, 234, 212, 0.25);
        background: radial-gradient(circle at 30% 30%, rgba(94, 234, 212, 0.4), rgba(6, 18, 28, 0.95));
        color: #5eead4;
        font-family: 'Share Tech Mono', monospace;
        font-size: 16px;
        letter-spacing: 0.14em;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        cursor: pointer;
        z-index: 25;
        transition: transform 160ms ease, opacity 160ms ease;
      }

      .monitor-toggle__dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #5eead4;
        box-shadow: 0 0 12px rgba(94, 234, 212, 0.75);
      }

      .monitor-toggle__label {
        font-size: 12px;
      }

      .monitor-toggle:active {
        transform: scale(0.94);
      }

      .monitor-toggle--hidden {
        opacity: 0;
        pointer-events: none;
      }

      @media (max-width: 720px) {
        .monitor-overlay__panel {
          width: min(94vw, 560px);
          padding: 20px;
          gap: 16px;
        }

        .monitor-overlay__grid {
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        }

        .monitor-toggle {
          width: 72px;
          height: 72px;
          right: 16px;
          bottom: 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
