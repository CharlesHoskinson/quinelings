#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npm test
npm run test:v1
npm run formal:all
npm run formal:correspondence
npm run sdk:check
npm run sdk:pack
npm run ranch:build
npm run test:browser:v1
node scripts/render-sdk-docs.cjs
node scripts/verify-sdk-package.cjs
node scripts/verify-v1-release.cjs
site_dir=$(mktemp -d)
trap 'rm -rf "$site_dir"' EXIT
cp ranch-workshop.html ranch-workshop.js qdl-v1-offspring.js v1.html v1.css v1-workspace.js qdl-v1.js qdl-v1-types.js qdl-v1-contract.js qdl-v1-kernels.js qdl-v1-library.js qdl-v1-registry.js qdl-v1-migrate.js index.html create.html sdk.html ranch.html ranch.css ranch.js ranch-renderer.js ranch-world.js ranch-crypto.js offspring.js style.css creation.css translation.css learning.css orbit.js kernels.js anatomy.js qdl.js chroma.js morphology.js core.js thought.js lifeform-renderer.js creation.js gallery.js translation.js "$site_dir/"
cp -R programs assets docs design releases "$site_dir/"
cp creation-verification.json sdk-package-verification.json lean-verification.json "$site_dir/"
# Keep the separately labeled generative design studies available across releases.
git ls-files -z 'research/final-qdl-*' 'research/thought-lifeform-*' 'research/creation-*.png' 'research/sdk-*.md' 'research/sdk-*.json' 'research/sdk-*.png' 'research/ranch/*' 'research/qdl-v1/*' 'fixtures/qdl-v1/*' | xargs -0 -r cp --parents -t "$site_dir/"
# Publish only tracked specifications, never Lean toolchains or compiled dependency caches.
git ls-files -z spec | xargs -0 cp --parents -t "$site_dir/"
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
