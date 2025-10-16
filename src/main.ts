import { Game } from './Game';

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element: ${id}`);
  return el as T;
}

const appRoot = document.getElementById('app') as HTMLDivElement;
const hudCamName = byId<HTMLSpanElement>('camName');
const hudTimeStr = byId<HTMLSpanElement>('timeStr');
const hudPowerPct = byId<HTMLSpanElement>('powerPct');
const hudPowerFill = byId<HTMLDivElement>('powerFill');
const centerMsg = byId<HTMLDivElement>('centerMsg');

const game = new Game({
  mountElement: appRoot,
  onUiUpdate: (ui) => {
    hudCamName.textContent = ui.cameraName;
    hudTimeStr.textContent = ui.timeString;
    hudPowerPct.textContent = `${Math.max(0, Math.min(100, Math.round(ui.powerPercent)))}%`;
    hudPowerFill.style.width = `${Math.max(0, Math.min(100, ui.powerPercent))}%`;
    const hue = Math.max(0, Math.min(120, (ui.powerPercent / 100) * 120));
    hudPowerFill.style.backgroundColor = `hsl(${hue} 90% 45%)`;
  },
  onGameMessage: (msg) => {
    centerMsg.style.display = 'block';
    centerMsg.textContent = msg;
  },
  onClearMessage: () => {
    centerMsg.style.display = 'none';
    centerMsg.textContent = '';
  }
});

(window as any).game = game; // handy for debugging

game.start();

window.addEventListener('keydown', (ev) => {
  if (game.isEnded() && ev.key.toLowerCase() === 'r') {
    game.reset();
    return;
  }
  switch (ev.key) {
    case '0': game.setCamera('office'); break;
    case '1': game.setCamera('stage'); break;
    case '2': game.setCamera('leftHall'); break;
    case '3': game.setCamera('rightHall'); break;
    case '4': game.setCamera('back'); break;
    case '5': game.setCamera('leftDoor'); break;
    case '6': game.setCamera('rightDoor'); break;
    case 'q': case 'Q': game.toggleLeftDoor(); break;
    case 'e': case 'E': game.toggleRightDoor(); break;
  }
});