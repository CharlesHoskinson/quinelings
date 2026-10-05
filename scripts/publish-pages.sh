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
npm run formal:website
npm run test:browser:website
npm run test:browser:nursery
node scripts/render-sdk-docs.cjs
node scripts/verify-sdk-package.cjs
node scripts/verify-v1-release.cjs
site_dir=$(mktemp -d)
trap 'rm -rf "$site_dir"' EXIT
cp nursery.html nursery.css nursery.js gallery.html living-thoughts.css living-thoughts.js lab-examples.js lab-insights.js lab-offspring.js living-copy.json ranch-workshop.html ranch-workshop.js qdl-v1-offspring.js v1.html v1.css v1-workspace.js qdl-v1.js qdl-v1-types.js qdl-v1-contract.js qdl-v1-kernels.js qdl-v1-library.js qdl-v1-registry.js qdl-v1-migrate.js index.html create.html sdk.html ranch.html ranch.css ranch.js ranch-renderer.js ranch-world.js ranch-crypto.js offspring.js style.css creation.css translation.css learning.css orbit.js kernels.js anatomy.js qdl.js chroma.js morphology.js core.js thought.js lifeform-renderer.js creation.js gallery.js translation.js "$site_dir/"
# Publish the product and reference documentation, not internal reports or test logs.
cp -R programs assets design releases "$site_dir/"
mkdir -p "$site_dir/docs"
site_docs=(
  docs/DESIGN-LANGUAGE.md
  docs/LEAN-FORMALIZATION.md
  docs/LOCAL-PROPOSALS.md
  docs/MAPPING.md
  docs/PROGRAM-CONTRACT.md
  docs/QDL-V1-LIBRARY.md
  docs/QDL-V1-UPGRADES.md
  docs/QDL-V1.md
  docs/QDL.md
  docs/RANCH-INTERFACES.md
  docs/SDK-RANCH-GUIDE.md
  docs/SDK-V1.md
  docs/TRANSLATION.md
  docs/qdl-v1-library.html
  docs/qdl-v1-upgrades.html
  docs/qdl-v1.html
  docs/sdk-a2a-guide.html
  docs/sdk-a2a-guide.md
  docs/sdk-api.html
  docs/sdk-api.md
  docs/sdk-lifecycle.html
  docs/sdk-lifecycle.md
  docs/sdk-mcp-guide.html
  docs/sdk-mcp-guide.md
  docs/sdk-quickstart.html
  docs/sdk-quickstart.md
  docs/sdk-ranch-guide.html
  docs/sdk-v1.html
)
cp "${site_docs[@]}" "$site_dir/docs/"
node scripts/check-public-site.cjs "$site_dir"
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
