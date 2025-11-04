#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${OUT_DIR:-dist}"
BRANCH="${GH_PAGES_BRANCH:-gh-pages}"
REMOTE="${GITHUB_REMOTE:-origin}"
BASE_PATH="${VITE_APP_BASE_PATH:-${BASE_PATH:-./}}"

echo "======================================"
echo "FNAF-Three Deployment Script"
echo "======================================"
echo ""
echo "Configuration:"
echo "  Base Path: $BASE_PATH"
echo "  Output Directory: $OUT_DIR"
echo "  Target Branch: $BRANCH"
echo ""

pushd "$ROOT_DIR" >/dev/null

echo "Cleaning previous build..."
rm -rf "$OUT_DIR"

echo "Building production bundle..."
VITE_APP_BASE_PATH="$BASE_PATH" npm run build

echo ""
echo "✅ Build complete at $ROOT_DIR/$OUT_DIR"
echo ""

if [[ -z "${GITHUB_REPOSITORY:-}" ]]; then
  echo "ℹ️  GITHUB_REPOSITORY not set. Skipping automatic publish."
  echo ""
  echo "To deploy manually:"
  echo "  export GITHUB_REPOSITORY='username/repo-name'"
  echo "  export VITE_APP_BASE_PATH='/repo-name/'"
  echo "  npm run deploy"
  echo ""
  exit 0
fi

echo "Preparing deployment to ${GITHUB_REPOSITORY}:${BRANCH}..."

TMP_DIR="$(mktemp -d)"

function cleanup() {
  local code=$?
  echo "Cleaning up temporary directory..."
  rm -rf "$TMP_DIR"
  exit "$code"
}
trap cleanup EXIT INT TERM

echo "Copying build artifacts..."
cp -a "$OUT_DIR"/. "$TMP_DIR"/

pushd "$TMP_DIR" >/dev/null

echo "Initializing git repository..."
git init
git checkout -b "$BRANCH"

echo "Committing deployment..."
git add .
GIT_AUTHOR_NAME="${GIT_AUTHOR_NAME:-Deploy Bot}" \
GIT_AUTHOR_EMAIL="${GIT_AUTHOR_EMAIL:-deploy@example.com}" \
GIT_COMMITTER_NAME="${GIT_COMMITTER_NAME:-Deploy Bot}" \
GIT_COMMITTER_EMAIL="${GIT_COMMITTER_EMAIL:-deploy@example.com}" \
git commit -m "Deploy static site [$(date -u +%Y-%m-%d\ %H:%M:%S\ UTC)]"

echo "Configuring remote..."
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  ACTOR="${GITHUB_ACTOR:-deploy-bot}"
  git remote add "$REMOTE" "https://${ACTOR}:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
  echo "Using HTTPS with token authentication"
else
  git remote add "$REMOTE" "git@github.com:${GITHUB_REPOSITORY}.git"
  echo "Using SSH authentication"
fi

echo "Pushing to ${GITHUB_REPOSITORY}:${BRANCH}..."
git push -f "$REMOTE" "$BRANCH"

echo ""
echo "✅ Deployment successful!"
echo ""
echo "Your site should be available at:"
echo "  https://$(echo $GITHUB_REPOSITORY | cut -d/ -f1).github.io/$(echo $GITHUB_REPOSITORY | cut -d/ -f2)/"
echo ""

popd >/dev/null
popd >/dev/null
