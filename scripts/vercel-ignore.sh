#!/usr/bin/env bash
# Vercel «Ignored Build Step». Exit 0 = hopp over bygget, exit 1 = bygg.
#
# Kjøres av Vercel fra prosjektets rotmappe (f.eks. apps/web). Argumentene er
# ekstra stier, relativt til repo-roten, som også skal utløse bygg (delte
# pakker o.l.). Regelen står i ~/.claude/CLAUDE.md («Vercel-forbruk»).
#
# Bygget hoppes over når:
#   - grenen er renovate/* eller claude/*
#   - ingenting i appen, de delte stiene eller rotoppsettet er endret siden
#     forrige vellykkede bygg (endringer i *.md og docs/ teller ikke)
# Er vi i tvil (ny gren, ukjent forrige commit), bygger vi.
set -u

ref="${VERCEL_GIT_COMMIT_REF:-}"
case "$ref" in
  renovate/* | claude/*)
    echo "Hopper over bygg: grenen $ref bygges ikke på Vercel."
    exit 0
    ;;
esac

root="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "Ikke et git-repo. Bygger."; exit 1; }
app="$(git rev-parse --show-prefix)"
app="${app%/}"

base="${VERCEL_GIT_PREVIOUS_SHA:-}"
if [ -z "$base" ]; then
  echo "Ingen tidligere bygg for grenen. Bygger."
  exit 1
fi
if ! git cat-file -e "${base}^{commit}" 2>/dev/null; then
  git fetch --quiet --depth=100 origin "$base" 2>/dev/null || true
fi
if ! git cat-file -e "${base}^{commit}" 2>/dev/null; then
  echo "Fant ikke forrige bygg ($base). Bygger for sikkerhets skyld."
  exit 1
fi

paths=("${app:-.}" "$@" package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json)
cd "$root" || exit 1
if git diff --quiet "$base" HEAD -- "${paths[@]}" ':(exclude)*.md' ':(exclude)docs/**'; then
  echo "Hopper over bygg: ingen endring i ${paths[*]} siden ${base:0:7}."
  exit 0
fi

echo "Endringer siden ${base:0:7}. Bygger."
exit 1
