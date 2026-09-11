#!/bin/bash
# ALTIVA — deploy the website.
# Double-click this file. It saves the site to GitHub (jennisanta-pixel/altiva-website),
# and Cloudflare publishes it automatically about a minute later.
# The first run installs the GitHub CLI and asks you to sign in to GitHub once.

REPO="jennisanta-pixel/altiva-website"
cd "$(dirname "$0")" || exit 1
: > deploy-last-run.log
log() { echo "$*" | tee -a deploy-last-run.log; }
log "== ALTIVA deploy — $(date '+%Y-%m-%d %H:%M:%S')"

fail() { log; log "!! $1"; log "== FAILED"; echo; read -r -p "Press Enter to close." _; exit 1; }

# 1. Git (Apple Command Line Tools)
if ! xcode-select -p >/dev/null 2>&1; then
  xcode-select --install >/dev/null 2>&1
  fail "Git is not installed yet. A window just opened: click Install, wait until it finishes, then double-click this file again."
fi

# 2. GitHub CLI
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
if ! command -v gh >/dev/null 2>&1; then
  log "-- Installing GitHub CLI into ~/.local/bin ..."
  URL=$(curl -fsSL https://api.github.com/repos/cli/cli/releases/latest \
        | grep -o '"browser_download_url": *"[^"]*macOS[^"]*\.zip"' \
        | grep -o 'https://[^"]*' | grep -E 'universal|arm64' | head -1)
  [ -n "$URL" ] || fail "Could not find the GitHub CLI download."
  TMP=$(mktemp -d)
  curl -fsSL -o "$TMP/gh.zip" "$URL" || fail "GitHub CLI download failed."
  unzip -q "$TMP/gh.zip" -d "$TMP" || fail "Could not unzip the GitHub CLI."
  mkdir -p "$HOME/.local/bin"
  cp "$TMP"/gh_*/bin/gh "$HOME/.local/bin/gh" && chmod +x "$HOME/.local/bin/gh"
  rm -rf "$TMP"
fi
log "-- $(gh --version | head -1)"

# 3. Sign in to GitHub (first time only)
if ! gh auth status -h github.com >/dev/null 2>&1; then
  log "-- Sign in to GitHub: press Enter, copy the code shown, and approve in your browser."
  gh auth login -h github.com -p https -w || fail "GitHub sign-in did not finish."
fi
gh auth setup-git -h github.com || fail "Could not connect git to GitHub."
LOGIN=$(gh api user -q .login) || fail "Could not read your GitHub account."
log "-- Signed in as $LOGIN"

# 4. Connect this folder to the repo (first time only)
[ -d .git ] || git init -q -b main
git remote get-url origin >/dev/null 2>&1 || git remote add origin "https://github.com/$REPO.git"
if ! git rev-parse -q --verify HEAD >/dev/null; then
  log "-- Connecting this folder to $REPO ..."
  git fetch -q origin main || fail "Could not reach $REPO."
  git checkout -q -B main 2>/dev/null || true
  git reset -q origin/main || fail "Could not connect to $REPO."
  git branch -q --set-upstream-to=origin/main main || true
fi
git config user.name  >/dev/null || git config user.name "$LOGIN"
git config user.email >/dev/null || git config user.email "$(gh api user -q .id)+$LOGIN@users.noreply.github.com"

# 5. Save and push
git pull -q --rebase --autostash origin main || fail "Could not get the latest version from GitHub."
git add -A
if git diff --cached --quiet; then
  log "-- No changes to save."
else
  git commit -q -m "Update website $(date '+%Y-%m-%d %H:%M')" || fail "Commit failed."
  log "-- Saved: $(git log -1 --pretty=%s)"
fi
git push -q -u origin main || fail "Push to GitHub failed."
log "-- GitHub is up to date ($(git rev-parse --short HEAD)). Cloudflare will publish in about a minute."
log "== DONE"
