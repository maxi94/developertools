# AGENTS Global

## Objetivo
Definir reglas generales para colaborar con agentes especialistas (Front/UX, React, Tester, DevOps) en este repositorio.

## Estructura Detectada (referencia)
- App principal: `src/`
- UI principal: `src/features/tool-registry/ui/`
- React compartido (hooks/componentes): `src/shared/`
- Testing base: `src/test/` y archivos `*.test.ts` en `src/shared/lib/`
- CI/CD: `.github/workflows/`
- Documentacion de flujo de agentes: `docs/`

## Reglas Generales (obligatorio)
- No tocar secretos ni credenciales (`.env*`, tokens, llaves, secretos de CI, credenciales de Git).
- Mantener cambios atomicos y con proposito unico por commit.
- Usar mensajes de commit claros en estilo convencional (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`).
- Preferir Pull Request a merge directo en `main`, con checklist minimo: `lint`, `test`, `build`.
- Si el cambio toca multiples areas, coordinar en orden: Front/UX -> React -> Tester -> DevOps.

## Branching Policy (Mandatory)
- Never implement new functionality directly on `main` or `master`.
- For every new request that changes code, always create a feature branch first.
- Branch naming format:
  - `feat/<short-kebab-name>` for features
  - `fix/<short-kebab-name>` for bug fixes
  - `chore/<short-kebab-name>` for maintenance

## Required Git Flow Per Feature
1. Ensure base is updated:
   - `git checkout main`
   - `git pull --ff-only`
2. Create branch:
   - `git checkout -b <type>/<short-kebab-name>`
3. Implement changes and validate (lint/tests/build when applicable).
4. Commit with a clear conventional-style message.
5. Push branch to origin:
   - `git push -u origin <branch-name>`
6. Do not merge to `main` directly; open PR unless user explicitly asks otherwise.

## Collaboration Constraint
- If credentials in this environment prevent push, stop after commit and provide exact push command for the user's terminal.

## Command Handoff (Mandatory)
- Always provide the exact commands the user must run to complete the next step.
- Commands must be copy/paste ready and ordered.
- Include only the minimum required commands for the current state (no generic extras).
- When relevant, include:
  - run/verify commands (`npm run lint`, `npm run test`, etc.)
  - git commands (branch, add, commit, push)
  - PR command (`gh pr create ...`) when a branch is ready

## Validacion Local (documentacion obligatoria)
- Desarrollo local: `npm run dev`
- Lint: `npm run lint`
- Tests: `npm run test`
- Build produccion: `npm run build`

## Versioning & Changelog Policy (Mandatory)
- Any code change must include a version update.
- Semver criteria:
  - `major`: breaking or incompatible behavior changes.
  - `minor`: new backward-compatible features.
  - `patch`: fixes, refactors, UI tweaks, docs/internal adjustments without breaking changes.
- For every delivered change, update:
  - `src/features/tool-registry/model/tools.ts` (`WEB_VERSION`).
  - Tool `version` fields in `src/features/tool-registry/model/tools.ts` for each impacted tool.
  - `releaseNotes` in `src/features/tool-registry/ui/ToolList.tsx` with a new top entry.
- The new `releaseNotes` entry must include:
  - `version` matching `WEB_VERSION`.
  - `date` in `YYYY-MM-DD`.
  - short `title`.
  - user-facing `changes` list.
