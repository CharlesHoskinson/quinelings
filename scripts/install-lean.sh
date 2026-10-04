#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if ! command -v elan >/dev/null 2>&1 && [[ ! -x "$HOME/.elan/bin/elan" ]]; then
  qdl_installer=$(mktemp)
  trap 'rm -f "$qdl_installer"' EXIT
  curl -sSfL https://elan.lean-lang.org/elan-init.sh -o "$qdl_installer"
  sh "$qdl_installer" -y --no-modify-path --default-toolchain none
fi
qdl_lake=$(command -v lake || true)
if [[ -z "$qdl_lake" ]]; then qdl_lake="$HOME/.elan/bin/lake"; fi
cd spec/lean
"$qdl_lake" update
"$qdl_lake" exe cache get
