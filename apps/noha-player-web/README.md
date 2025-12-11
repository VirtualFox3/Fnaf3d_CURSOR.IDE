# Noha Player Web (PWA)

A modern, progressive web app for watching and organizing nohas, majlis recordings, and azadari sessions. Built with React, TypeScript, and Vite, designed to be installable on iOS/iPadOS and desktop.

## Features

- 🎥 **YouTube & Vimeo Integration** - Seamlessly embed videos from popular platforms
- 📚 **Library Management** - Organize your collection with custom playlists
- 🎵 **Playback Queue** - Build and manage your listening queue
- 📱 **Progressive Web App** - Install on mobile and desktop for app-like experience
- 🌙 **Dark Theme** - Optimized for comfortable viewing
- 📱 **Mobile-First** - Responsive design with safe-area insets for modern devices
- 💾 **Offline-Ready** - Service worker caching for reliability

## Tech Stack

- **React 18** - Modern hooks-based UI
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management with localStorage persistence
- **React Router** - Client-side routing
- **vite-plugin-pwa** - Progressive Web App capabilities

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn

### Installation

From the project root:

```bash
cd apps/noha-player-web
npm install
```

Or if using the workspace from the root:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at http://localhost:3000

### Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Type Checking

Run TypeScript type checking:

```bash
npm run type-check
```

### Linting

Run ESLint:

```bash
npm run lint
```

## Deployment

The app is automatically deployed to GitHub Pages via GitHub Actions.

- **Live URL**: https://<user>.github.io/<repo>/noha-player/
- **Workflow**: `.github/workflows/gh-pages-noha-player.yml`

To run the deployment workflow locally (dry run):

1. Build the project with the base path:
```bash
VITE_BASE_PATH=/noha-player/ npm run build
```
2. Preview the build:
```bash
npm run preview
```

## PWA Installation

### Desktop (Chrome/Edge/Brave)

1. Visit the app in your browser
2. Click the install icon (➕) in the address bar
3. Click "Install" in the popup

### iOS/iPadOS (Safari)

1. Open the app in Safari
2. Tap the Share button (⬆️)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

### Android (Chrome)

1. Visit the app in Chrome
2. Tap the menu (⋮) button
3. Tap "Install app" or "Add to Home screen"

## Project Structure

```
apps/noha-player-web/
├── public/              # Static assets (icons, splash screens)
├── src/
│   ├── components/      # React components
│   │   ├── Header.tsx
│   │   ├── LibraryList.tsx
│   │   ├── NowPlayingBar.tsx
│   │   ├── PlaylistSidebar.tsx
│   │   ├── QueueDrawer.tsx
│   │   ├── URLPasteForm.tsx
│   │   └── VideoPlayer.tsx
│   ├── pages/          # Route pages
│   │   ├── Library.tsx
│   │   ├── Playlist.tsx
│   │   └── Watch.tsx
│   ├── store/          # Zustand state management
│   │   ├── library.ts
│   │   ├── player.ts
│   │   ├── playlist.ts
│   │   └── queue.ts
│   ├── types/          # TypeScript types
│   │   ├── media.ts
│   │   └── playlist.ts
│   ├── App.tsx         # Root component with routing
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── vite.config.ts      # Vite + PWA configuration
├── tsconfig.json       # TypeScript config
├── tailwind.config.cjs # Tailwind config
└── package.json
```

## Routes

- `/` - Library page with URL paste form and video list
- `/watch/:videoId` - Video player page
- `/playlist/:id` - Individual playlist view

## State Management

The app uses Zustand stores with localStorage persistence:

- **Library Store** - User's video collection
- **Queue Store** - Playback queue and current index
- **Player Store** - Current video and playback state
- **Playlist Store** - User-created playlists

## Future Enhancements

- URL paste with oEmbed metadata fetch
- Search and filtering
- User authentication
- Cloud sync
- Lyrics/subtitles
- Picture-in-picture mode
- Background audio playback (iOS limitations apply)

## License

Private project.
