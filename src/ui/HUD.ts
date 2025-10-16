import type { GameUiState } from '../Game';

export type HudAction =
  | 'leftDoor'
  | 'rightDoor'
  | 'toggleMonitor'
  | 'cameraPrev'
  | 'cameraNext'
  | 'retry';

export interface HudCallbacks {
  onToggleLeftDoor?: () => void;
  onToggleRightDoor?: () => void;
  onToggleMonitor?: () => void;
  onCycleCamera?: (direction: 1 | -1) => void;
  onRetry?: () => void;
}

interface HudOptions {
  mount?: HTMLElement;
  callbacks?: HudCallbacks;
}

export const HUD_ACTION_ATTR = 'data-hud-action';

const clampPercent = (value: number): number => Math.max(0, Math.min(100, value));

export class HUD {
  private readonly root: HTMLDivElement;
  private readonly camNameEl: HTMLSpanElement;
  private readonly timeEl: HTMLSpanElement;
  private readonly powerPctEl: HTMLSpanElement;
  private readonly powerFillEl: HTMLDivElement;
  private readonly messageEl: HTMLDivElement;
  private readonly retryButton: HTMLButtonElement;
  private readonly leftDoorButton: HTMLButtonElement;
  private readonly rightDoorButton: HTMLButtonElement;
  private readonly monitorButton: HTMLButtonElement;
  private callbacks: HudCallbacks;

  constructor(options: HudOptions = {}) {
    this.callbacks = options.callbacks ?? {};

    const mountTarget = options.mount ?? document.body;

    this.root = document.createElement('div');
    this.root.className = 'hud-root';

    // Top status bar
    const top = document.createElement('div');
    top.className = 'hud-top';

    const camCard = this.createTopCard('Camera');
    this.camNameEl = this.createTopValue(camCard);

    const timeCard = this.createTopCard('Time');
    this.timeEl = this.createTopValue(timeCard);

    const powerCard = this.createTopCard('Power');
    this.powerPctEl = this.createTopValue(powerCard);
    const powerBar = document.createElement('div');
    powerBar.className = 'hud-power-bar';
    this.powerFillEl = document.createElement('div');
    this.powerFillEl.className = 'hud-power-fill';
    powerBar.appendChild(this.powerFillEl);
    powerCard.appendChild(powerBar);

    top.append(camCard, timeCard, powerCard);

    // Bottom controls
    const bottom = document.createElement('div');
    bottom.className = 'hud-bottom';

    this.leftDoorButton = this.createActionButton('Left Door', 'leftDoor');
    this.rightDoorButton = this.createActionButton('Right Door', 'rightDoor');

    const bottomCenter = document.createElement('div');
    bottomCenter.className = 'hud-bottom-center';
    const prevCamButton = this.createActionButton('◀', 'cameraPrev', true);
    const nextCamButton = this.createActionButton('▶', 'cameraNext', true);
    this.monitorButton = this.createActionButton('Monitor', 'toggleMonitor');
    bottomCenter.append(prevCamButton, this.monitorButton, nextCamButton);

    bottom.append(this.leftDoorButton, bottomCenter, this.rightDoorButton);

    // Message + retry
    this.messageEl = document.createElement('div');
    this.messageEl.className = 'hud-message';
    this.messageEl.setAttribute('aria-live', 'polite');
    this.messageEl.setAttribute('aria-hidden', 'true');

    this.retryButton = this.createActionButton('Retry', 'retry');
    this.retryButton.classList.add('hud-retry');
    this.retryButton.disabled = true;
    this.retryButton.setAttribute('aria-hidden', 'true');

    this.root.append(top, bottom, this.messageEl, this.retryButton);

    mountTarget.appendChild(this.root);
  }

  public dispose(): void {
    this.root.remove();
  }

  public setCallbacks(callbacks: HudCallbacks): void {
    this.callbacks = callbacks;
  }

  public getRoot(): HTMLDivElement {
    return this.root;
  }

  public update(state: GameUiState): void {
    this.camNameEl.textContent = state.cameraName;
    this.timeEl.textContent = state.timeString;

    const clampedPower = clampPercent(state.powerPercent);
    this.powerPctEl.textContent = `${Math.round(clampedPower)}%`;
    this.powerFillEl.style.width = `${clampedPower}%`;
    const hue = (clampedPower / 100) * 120;
    this.powerFillEl.style.background = `linear-gradient(90deg, hsl(${hue} 90% 45%), hsl(${Math.max(0, hue - 40)} 90% 50%))`;

    this.leftDoorButton.classList.toggle('active', state.leftDoorClosed);
    this.leftDoorButton.setAttribute('aria-pressed', state.leftDoorClosed ? 'true' : 'false');
    this.rightDoorButton.classList.toggle('active', state.rightDoorClosed);
    this.rightDoorButton.setAttribute('aria-pressed', state.rightDoorClosed ? 'true' : 'false');

    const monitorActive = state.monitorActive;
    this.monitorButton.classList.toggle('active', monitorActive);
    this.monitorButton.setAttribute('aria-pressed', monitorActive ? 'true' : 'false');
    this.monitorButton.textContent = monitorActive ? 'Close Cam' : 'Monitor';

    const retryVisible = state.ended;
    this.retryButton.classList.toggle('is-visible', retryVisible);
    this.retryButton.disabled = !retryVisible;
    this.retryButton.setAttribute('aria-hidden', retryVisible ? 'false' : 'true');
  }

  public showMessage(message: string): void {
    this.messageEl.textContent = message;
    this.messageEl.classList.add('is-visible');
    this.messageEl.setAttribute('aria-hidden', message ? 'false' : 'true');
  }

  public clearMessage(): void {
    this.messageEl.textContent = '';
    this.messageEl.classList.remove('is-visible');
    this.messageEl.setAttribute('aria-hidden', 'true');
  }

  public performAction(action: HudAction): void {
    switch (action) {
      case 'leftDoor':
        this.callbacks.onToggleLeftDoor?.();
        break;
      case 'rightDoor':
        this.callbacks.onToggleRightDoor?.();
        break;
      case 'toggleMonitor':
        this.callbacks.onToggleMonitor?.();
        break;
      case 'cameraPrev':
        this.callbacks.onCycleCamera?.(-1);
        break;
      case 'cameraNext':
        this.callbacks.onCycleCamera?.(1);
        break;
      case 'retry':
        this.callbacks.onRetry?.();
        break;
    }
  }

  public static actionFromTarget(target: EventTarget | null): HudAction | null {
    if (!(target instanceof Element)) return null;
    const actionable = target.closest<HTMLElement>(`[${HUD_ACTION_ATTR}]`);
    if (!actionable) return null;
    return actionable.getAttribute(HUD_ACTION_ATTR) as HudAction | null;
  }

  private createTopCard(title: string): HTMLDivElement {
    const card = document.createElement('div');
    card.className = 'hud-top-card';

    const titleEl = document.createElement('div');
    titleEl.className = 'hud-top-title';
    titleEl.textContent = title;
    card.appendChild(titleEl);

    return card;
  }

  private createTopValue(card: HTMLDivElement): HTMLSpanElement {
    const value = document.createElement('span');
    value.className = 'hud-top-value';
    value.textContent = '--';
    card.appendChild(value);
    return value;
  }

  private createActionButton(label: string, action: HudAction, isIcon = false): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'hud-button';
    if (isIcon) button.classList.add('hud-button-icon');
    button.setAttribute(HUD_ACTION_ATTR, action);
    button.textContent = label;
    button.addEventListener('click', (ev) => {
      ev.preventDefault();
      this.performAction(action);
    });
    return button;
  }
}
