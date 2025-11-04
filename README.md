# FNAF-Style 3D Game (Three.js + TypeScript + Vite)

A Five Nights at Freddy's-inspired 3D horror game built with Three.js, TypeScript, and Vite. Features animatronic AI, multiple camera views, door controls, power management, and touch controls for mobile devices.

## Repository Structure

This repository contains:
- **Root**: The FNAF-style 3D game (Three.js)
- **apps/noha-player-web**: A React PWA for video playback and playlist management (see [apps/noha-player-web/README.md](apps/noha-player-web/README.md))

## Features

- **3D Graphics**: Real-time 3D rendering with Three.js
- **Animatronic AI**: Dynamic pathfinding toward the office with adjustable aggression
- **Multiple Camera Views**: Office view and 4 CCTV cameras
- **Power Management**: Monitor power drain from doors and cameras
- **Touch Controls**: Full mobile support with touch-optimized UI
- **Audio System**: Audio unlock mechanism for mobile devices
- **Win/Lose Conditions**: Survive until 6 AM or face jumpscares

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- Modern web browser with WebGL support

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd fnaf-three
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on port 5173 with hot reload |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run test:smoke` | Run automated checks against the built `dist/` output |
| `npm run deploy` | Deploy to GitHub Pages (see deployment section) |

## Controls

### Desktop Controls
- **0**: Switch to Office Camera
- **1-4**: Switch to CCTV Cameras
- **Q**: Toggle Left Door
- **E**: Toggle Right Door
- **R**: Restart after win/lose

### Mobile Controls
- Touch controls are automatically enabled on mobile devices
- Tap camera buttons to switch views
- Tap door buttons to toggle doors
- Tap restart button after game over

## Mobile Testing

### Local Network Testing

1. Start the dev server with network access:
   ```bash
   npm run dev
   ```

2. Find your local IP address:
   - **macOS/Linux**: `ifconfig | grep inet`
   - **Windows**: `ipconfig`

3. Open `http://<your-ip>:5173` on your mobile device

### Tips for Mobile Testing

- **Audio Context**: Mobile browsers require user interaction before playing audio. Tap anywhere on the screen to unlock audio on first load.
- **Touch Responsiveness**: Test all touch interactions (camera switching, door toggles, restart)
- **Performance**: Monitor frame rate on lower-end devices
- **Orientation**: Test both portrait and landscape modes
- **Network Speed**: Test on both WiFi and cellular connections
- **Battery Usage**: Monitor battery drain during extended play sessions

### Debugging on Mobile

- **iOS Safari**: Enable Web Inspector in Settings > Safari > Advanced
- **Android Chrome**: Use `chrome://inspect` on desktop Chrome
- **Remote Debugging**: Use browser dev tools for remote device debugging

## Production Build

### Build for Production

```bash
npm run build
```

This will:
- Minify and bundle all JavaScript
- Separate Three.js into its own chunk for better caching
- Remove console logs and debugger statements
- Generate compressed (gzip + brotli) assets
- Output optimized files to `dist/`

### Preview Production Build

```bash
npm run preview
```

Opens the production build at `http://localhost:5173` for local testing.

### Build Configuration

The build is configured via `vite.config.ts` with:
- **Base Path**: Configurable via `VITE_APP_BASE_PATH` environment variable
- **Asset Optimization**: Inlining small assets, code splitting
- **Compression**: Brotli and gzip compression for all assets
- **Minification**: ESBuild minification with console/debugger removal
- **Source Maps**: Generated for debugging production issues

### Environment Variables

Create a `.env.production` file for production-specific configuration:

```env
# Base path for static hosting (e.g., GitHub Pages)
VITE_APP_BASE_PATH=/your-repo-name/

# Or for root domain
VITE_APP_BASE_PATH=/
```

## Deployment

### GitHub Pages Deployment

#### Automatic Deployment (GitHub Actions)

1. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          VITE_APP_BASE_PATH: /${{ github.event.repository.name }}/
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

2. Enable GitHub Pages in repository settings:
   - Go to Settings > Pages
   - Source: GitHub Actions

#### Manual Deployment

Use the provided deploy script:

```bash
# Set your repository
export GITHUB_REPOSITORY="username/repo-name"

# For GitHub Pages subdirectory
export VITE_APP_BASE_PATH="/repo-name/"

# With GitHub token (CI/CD)
export GITHUB_TOKEN="your-token"
npm run deploy

# Or with SSH (local)
npm run deploy
```

The script will:
1. Build the production bundle with the specified base path
2. Create a temporary git repository
3. Commit all built files
4. Force push to the `gh-pages` branch

### Other Static Hosting Services

#### Netlify

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Build: `npm run build`
3. Deploy: `netlify deploy --prod --dir=dist`

Or use continuous deployment:
- Connect your GitHub repository
- Build command: `npm run build`
- Publish directory: `dist`

#### Vercel

1. Install Vercel CLI: `npm install -g vercel`
2. Deploy: `vercel --prod`

Or connect via Vercel dashboard for automatic deployments.

#### AWS S3 + CloudFront

```bash
# Build with root path
VITE_APP_BASE_PATH=/ npm run build

# Sync to S3
aws s3 sync dist/ s3://your-bucket-name/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## Project Structure

```
fnaf-three/
├── src/
│   ├── main.ts          # Entry point, DOM setup, keyboard shortcuts
│   └── Game.ts          # Three.js scene, game logic, AI, rendering loop
├── index.html           # HTML with HUD overlay
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── scripts/
│   └── deploy.sh        # Deployment script for GitHub Pages
└── package.json         # Dependencies and scripts
```

## Smoke Testing Production Build

After building, perform these checks:

1. **Static Server Test**:
   ```bash
   npm run preview
   ```

2. **Touch Controls** (on mobile/tablet or browser dev tools):
   - Verify camera switching works via touch
   - Test door toggle buttons
   - Check restart functionality

3. **Audio Unlock**:
   - Confirm audio context unlocks on first user interaction
   - Verify audio plays correctly after unlock

4. **State Transitions**:
   - Play through a full game cycle
   - Test win condition (survive until 6 AM)
   - Test lose condition (power outage or animatronic reaches office)
   - Verify restart works correctly

5. **Performance**:
   - Check frame rate (should be ~60 FPS)
   - Monitor memory usage
   - Verify no console errors

6. **Offline Test**:
   - Build and serve locally with no network
   - Verify all assets load correctly
   - Test full gameplay offline

## Browser Support

- Chrome/Edge 90+ (recommended)
- Firefox 88+
- Safari 14+
- Mobile browsers with WebGL support

## Performance Optimization

- Three.js is code-split for better caching
- Console logs removed in production builds
- Brotli/gzip compression for smaller payloads
- Asset optimization and minification
- Efficient rendering loop with RAF

## Troubleshooting

### Build Issues

- **Module not found**: Run `npm install` to ensure all dependencies are installed
- **Type errors**: Check `tsconfig.json` and TypeScript version compatibility
- **Out of memory**: Increase Node.js heap size: `NODE_OPTIONS=--max_old_space_size=4096 npm run build`

### Mobile Issues

- **Audio not playing**: Ensure user interaction occurs before audio playback
- **Touch not responding**: Check CSS pointer-events and touch-action properties
- **Performance drops**: Reduce scene complexity or lower rendering quality

### Deployment Issues

- **404 on GitHub Pages**: Verify `VITE_APP_BASE_PATH` matches repository name
- **Assets not loading**: Check base path configuration in `vite.config.ts`
- **CORS errors**: Ensure proper server configuration for static assets

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## Credits

- Built with [Three.js](https://threejs.org/)
- Developed with [Vite](https://vitejs.dev/)
- Inspired by Five Nights at Freddy's by Scott Cawthon
