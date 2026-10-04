#!/usr/bin/env bash
#
# Deletes the leftover DRAFT releases created by electron-builder's GitHub
# publisher during an earlier desktop-app attempt. They are all "untagged-*"
# (no git tag), were never visible to users or Home Assistant, and each carries
# a set of stale .exe/.dmg/latest.yml assets.
#
# The current pipeline cannot recreate them: apps/desktop/scripts/pack.mjs runs
# electron-builder with --publish never, and release.yml attaches installers to
# the published release with `gh release upload`.
#
# Requires the gh CLI authenticated with an account that can delete releases.
#
#   ./scripts/delete-draft-releases.sh          # list what would be deleted
#   ./scripts/delete-draft-releases.sh --yes    # actually delete
set -euo pipefail

REPO="${REPO:-jimartincorral/priperfin}"
CONFIRM="${1:-}"

mapfile -t rows < <(
  gh api "repos/${REPO}/releases?per_page=100" \
    --jq '.[] | select(.draft==true) | [.id, .tag_name, (.assets|length)] | @tsv'
)

if [ ${#rows[@]} -eq 0 ]; then
  echo "No draft releases found."
  exit 0
fi

echo "Draft releases in ${REPO} (id / tag / assets):"
printf '  %s\n' "${rows[@]}"
echo

if [ "${CONFIRM}" != "--yes" ]; then
  echo "Dry run. Re-run with --yes to delete these ${#rows[@]} drafts."
  exit 0
fi

for row in "${rows[@]}"; do
  id="$(cut -f1 <<<"${row}")"
  tag="$(cut -f2 <<<"${row}")"
  echo "Deleting draft ${tag} (id ${id})"
  gh api -X DELETE "repos/${REPO}/releases/${id}" --silent
done

echo "Done. Deleted ${#rows[@]} draft releases."
