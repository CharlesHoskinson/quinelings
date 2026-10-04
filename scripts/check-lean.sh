#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/generate-lean-fixtures.cjs --check
node scripts/check-qdl-domains.cjs
if command -v lake >/dev/null 2>&1; then
  qdl_lake=$(command -v lake)
elif [[ -x "$HOME/.elan/bin/lake" ]]; then
  qdl_lake="$HOME/.elan/bin/lake"
else
  echo 'Lean is missing. Run scripts/install-lean.sh first.' >&2
  exit 1
fi
cd spec/lean
"$qdl_lake" build QDL QDL.Audit
node ../../scripts/audit-lean.cjs --generate
qdl_audit_log=$(mktemp)
trap 'rm -f "$qdl_audit_log"' EXIT
"$qdl_lake" env lean .lake/qdl-theorem-audit.lean > "$qdl_audit_log"
node ../../scripts/audit-lean.cjs "$qdl_audit_log"
