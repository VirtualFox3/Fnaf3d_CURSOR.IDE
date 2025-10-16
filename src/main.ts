import './styles/hud.css';

import { Game } from './Game';
import { HUD, HudAction } from './ui/HUD';
import { TouchInputManager } from './input/TouchInputManager';

const appRoot = document.getElementById('app');
if (!(appRoot instanceof HTMLDivElement)) {
  throw new Error('Missing #app container');
}

const hud = new HUD();

const game = new Game({
  mountElement: appRoot,
  onUiUpdate: (ui) => hud.update(ui),
  onGameMessage: (msg) => hud.showMessage(msg),
  onClearMessage: () => hud.clearMessage(),
});

hud.setCallbacks({
  onToggleLeftDoor: () => game.toggleLeftDoor(),
  onToggleRightDoor: () => game.toggleRightDoor(),
  onToggleMonitor: () => game.toggleMonitor(),
  onCycleCamera: (direction) => game.cycleCamera(direction),
  onRetry: () => {
    if (game.isEnded()) {
      game.reset();
    }
  },
});

const performHudAction = (action: HudAction): void => {
  hud.performAction(action);
};

new TouchInputManager({
  element: document.body,
  onTap: (info) => {
    const action = HUD.actionFromTarget(info.target);
    if (action) {
      performHudAction(action);
      return;
    }

    const width = window.innerWidth || document.documentElement.clientWidth || 1;
    const ratio = info.x / width;
    if (ratio <= 0.3) {
      game.toggleLeftDoor();
    } else if (ratio >= 0.7) {
      game.toggleRightDoor();
    }
  },
  onLongPress: () => {
    if (game.isEnded()) {
      performHudAction('retry');
    } else {
      game.toggleMonitor();
    }
  },
  onSwipe: (info) => {
    if (info.direction === 'left') {
      game.cycleCamera(1);
    } else if (info.direction === 'right') {
      game.cycleCamera(-1);
    }
  },
});

if (import.meta.env.DEV) {
  (window as any).game = game;
}

game.start();
