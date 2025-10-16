export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface TouchInputInfo {
  x: number;
  y: number;
  target: EventTarget | null;
  pointerType: string;
  originalEvent: PointerEvent | null;
}

export interface SwipeInfo extends TouchInputInfo {
  direction: SwipeDirection;
  distance: number;
}

export interface TouchInputCallbacks {
  onTap?: (info: TouchInputInfo) => void;
  onLongPress?: (info: TouchInputInfo) => void;
  onSwipe?: (info: SwipeInfo) => void;
}

export interface TouchInputOptions extends TouchInputCallbacks {
  element?: HTMLElement | Document;
  longPressDurationMs?: number;
  tapMaxDurationMs?: number;
  moveTolerancePx?: number;
  swipeMinDistancePx?: number;
}

const DEFAULT_LONG_PRESS_MS = 500;
const DEFAULT_TAP_DURATION_MS = 250;
const DEFAULT_MOVE_TOLERANCE_PX = 12;
const DEFAULT_SWIPE_DISTANCE_PX = 60;

export class TouchInputManager {
  private readonly element: HTMLElement | Document;
  private readonly longPressDuration: number;
  private readonly tapMaxDuration: number;
  private readonly moveTolerance: number;
  private readonly swipeMinDistance: number;
  private readonly callbacks: TouchInputCallbacks;

  private pointerActive = false;
  private pointerId: number | null = null;
  private pointerType: string = 'touch';
  private pressTarget: EventTarget | null = null;
  private startX = 0;
  private startY = 0;
  private lastX = 0;
  private lastY = 0;
  private startTimestamp = 0;
  private longPressTriggered = false;
  private longPressTimeout: number | null = null;
  private pointerDownEvent: PointerEvent | null = null;

  constructor(options: TouchInputOptions = {}) {
    this.element = options.element ?? document.body;
    this.callbacks = {
      onTap: options.onTap,
      onLongPress: options.onLongPress,
      onSwipe: options.onSwipe,
    };
    this.longPressDuration = options.longPressDurationMs ?? DEFAULT_LONG_PRESS_MS;
    this.tapMaxDuration = options.tapMaxDurationMs ?? DEFAULT_TAP_DURATION_MS;
    this.moveTolerance = options.moveTolerancePx ?? DEFAULT_MOVE_TOLERANCE_PX;
    this.swipeMinDistance = options.swipeMinDistancePx ?? DEFAULT_SWIPE_DISTANCE_PX;

    this.element.addEventListener('pointerdown', this.handlePointerDown, { passive: false });
    this.element.addEventListener('pointermove', this.handlePointerMove, { passive: false });
    this.element.addEventListener('pointerup', this.handlePointerUp, { passive: false });
    this.element.addEventListener('pointercancel', this.handlePointerCancel, { passive: false });
  }

  public dispose(): void {
    this.element.removeEventListener('pointerdown', this.handlePointerDown);
    this.element.removeEventListener('pointermove', this.handlePointerMove);
    this.element.removeEventListener('pointerup', this.handlePointerUp);
    this.element.removeEventListener('pointercancel', this.handlePointerCancel);
    this.clearLongPressTimer();
  }

  private handlePointerDown = (event: PointerEvent): void => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (this.pointerActive) return;

    if (event.pointerType === 'touch') {
      event.preventDefault();
    }

    this.pointerActive = true;
    this.pointerId = event.pointerId;
    this.pointerType = event.pointerType;
    this.pressTarget = event.target;
    this.startX = this.lastX = event.clientX;
    this.startY = this.lastY = event.clientY;
    this.startTimestamp = performance.now();
    this.longPressTriggered = false;
    this.pointerDownEvent = event;

    this.clearLongPressTimer();
    this.longPressTimeout = window.setTimeout(this.triggerLongPress, this.longPressDuration);
  };

  private handlePointerMove = (event: PointerEvent): void => {
    if (!this.pointerActive || event.pointerId !== this.pointerId) return;

    this.lastX = event.clientX;
    this.lastY = event.clientY;

    const dx = this.lastX - this.startX;
    const dy = this.lastY - this.startY;
    const movedFar = dx * dx + dy * dy > this.moveTolerance * this.moveTolerance;

    if (movedFar && !this.longPressTriggered) {
      this.clearLongPressTimer();
    }

    if (event.pointerType === 'touch' && movedFar) {
      event.preventDefault();
    }
  };

  private handlePointerUp = (event: PointerEvent): void => {
    if (!this.pointerActive || event.pointerId !== this.pointerId) return;

    this.lastX = event.clientX;
    this.lastY = event.clientY;

    const elapsed = performance.now() - this.startTimestamp;
    const dx = this.lastX - this.startX;
    const dy = this.lastY - this.startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (!this.longPressTriggered) {
      if (elapsed <= this.tapMaxDuration && absDx <= this.moveTolerance && absDy <= this.moveTolerance) {
        this.callbacks.onTap?.(this.buildInfo(event));
      } else if (distance >= this.swipeMinDistance) {
        const direction: SwipeDirection = absDx > absDy
          ? (dx > 0 ? 'right' : 'left')
          : (dy > 0 ? 'down' : 'up');
        this.callbacks.onSwipe?.({ ...this.buildInfo(event), direction, distance });
      }
    }

    this.resetPointerState();
  };

  private handlePointerCancel = (event: PointerEvent): void => {
    if (!this.pointerActive || event.pointerId !== this.pointerId) return;
    this.resetPointerState();
  };

  private triggerLongPress = (): void => {
    if (!this.pointerActive || this.longPressTriggered) return;
    this.longPressTriggered = true;
    this.clearLongPressTimer();
    this.callbacks.onLongPress?.(this.buildInfo(this.pointerDownEvent));
  };

  private buildInfo(event: PointerEvent | null): TouchInputInfo {
    return {
      x: event ? event.clientX : this.lastX,
      y: event ? event.clientY : this.lastY,
      target: event ? event.target : this.pressTarget,
      pointerType: event ? event.pointerType : this.pointerType,
      originalEvent: event,
    };
  }

  private resetPointerState(): void {
    this.clearLongPressTimer();
    this.pointerActive = false;
    this.pointerId = null;
    this.pressTarget = null;
    this.pointerDownEvent = null;
    this.longPressTriggered = false;
  }

  private clearLongPressTimer(): void {
    if (this.longPressTimeout !== null) {
      window.clearTimeout(this.longPressTimeout);
      this.longPressTimeout = null;
    }
  }
}
