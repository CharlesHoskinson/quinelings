#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npm test
site_dir=$(mktemp -d)
trap 'rm -rf "$site_dir"' EXIT
cp index.html style.css translation.css learning.css orbit.js kernels.js qdl.js core.js gallery.js translation.js "$site_dir/"
cp -R programs assets docs design spec "$site_dir/"
touch "$site_dir/.nojekyll"
site_origin=$(git remote get-url origin)
site_revision=$(git rev-parse --short HEAD)
git init --initial-branch=gh-pages "$site_dir"
git -C "$site_dir" remote add origin "$site_origin"
# Keep publication history when the branch already exists.
if git ls-remote --exit-code --heads origin gh-pages >/dev/null 2>&1; then
  git -C "$site_dir" fetch --depth=1 origin gh-pages
  git -C "$site_dir" reset --mixed FETCH_HEAD
fi
git -C "$site_dir" add --all
if git -C "$site_dir" diff --cached --quiet && git -C "$site_dir" rev-parse --verify HEAD >/dev/null 2>&1; then
  echo 'The published files are already current.'
  exit 0
fi
git -C "$site_dir" commit -m "Publish Quinelings from $site_revision"
git -C "$site_dir" push origin HEAD:gh-pages
