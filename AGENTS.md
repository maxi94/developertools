# Workflow Rules

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
