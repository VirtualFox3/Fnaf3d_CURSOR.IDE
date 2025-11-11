# VidFlow – Playlist-first YouTube Player

VidFlow is a Vite + React application that wraps the YouTube IFrame API with a persistent queue, keyboard shortcuts, and playlist management powered by Zustand. It provides a responsive watching experience that keeps a collapsible mini player available while you browse the library.

## Highlights

- **YouTube IFrame integration** with lazy script loading, autoplay, seek, volume, mute, and fullscreen control.
- **Global playback store** (Zustand + localStorage persistence) for queue, shuffle/repeat modes, audio-only toggle, history, and last played video.
- **Queue + mini player** that stays visible throughout the app with progress scrubber, volume slider, and quick controls.
- **Keyboard shortcuts** matching common streaming apps (`space`/`k` play-pause, `j`/`l` seek ±10s, `n`/`p` next/previous).
- **Watch view** that loads videos by route, keeps queue context, and auto-advances respecting shuffle/repeat rules.
- **Playlist view** with metadata editing, duration stats, and instant play-from-here actions.
- **Responsive layout** for desktop and mobile with sticky mini player and adaptive watch/grid layouts.

## Getting started

```bash
npm install
npm run dev
```

Open the app on [http://localhost:5173](http://localhost:5173). The Vite dev server hot-reloads changes.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Produce a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run test:smoke` | Run the existing smoke test harness |

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Space` / `K` | Toggle play / pause |
| `J` | Seek backward 10 seconds |
| `L` | Seek forward 10 seconds |
| `N` | Next item in queue |
| `P` | Previous item in queue |

Shortcuts are ignored while typing in inputs, textareas, selects, buttons, or editable content.

## Project structure

```
src/
├── App.tsx               # Route definitions
├── components/           # Layout, player, queue, and mini-player UI
├── data/                 # Seeded playlist + video metadata
├── hooks/                # IFrame loader and keyboard shortcut hooks
├── pages/                # Home, Watch, and Playlist screens
├── store/                # Zustand stores (player + library)
├── utils/                # Formatting helpers
└── index.css             # Global styling and theming
```

## State persistence

Player and library stores persist to `localStorage`, preserving queue state, history, last played video, and playlist edits across reloads. The YouTube player instance itself is kept out of persistence but is rehydrated when the iframe API is available.

## Styling

The UI is styled with a single global stylesheet (`src/index.css`) focused on a dark theme, responsive grids, and glassmorphism-inspired surfaces. CSS custom properties centralize colors, radii, and transitions.

## Notes

- The sample playlists in `src/data/playlists.ts` include assorted YouTube video IDs. Replace or extend them to point at your own content.
- If you run into YouTube embed restrictions, ensure the video allows embedding and that autoplay is permitted in your browser.
- The mini player can be collapsed but remains partially visible so queue playback never disappears while navigating.

Enjoy building on VidFlow! 🎧📺
