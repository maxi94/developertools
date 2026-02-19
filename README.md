# Proyecto Developer Tools (React + TypeScript)

Aplicacion de utilidades para desarrolladores orientada a ejecutarse del lado del cliente.
La primera herramienta incluida es un `JSON Formatter` que no envia informacion fuera del navegador.

## Requisitos

- Node.js `>= 20.19.0` (actualmente tienes `v24.13.1`)
- npm

## Arranque local

```bash
npm install
npm run dev
```

## Scripts utiles

```bash
npm run dev           # entorno de desarrollo
npm run build         # build de produccion
npm run preview       # previsualizar build
npm run lint          # eslint estricto
npm run lint:fix      # eslint con autofix
npm run format        # prettier write
npm run format:check  # prettier check
npm run test          # vitest + coverage
npm run test:watch    # vitest en watch
```

## Git local recomendado

Si no tienes repo inicializado:

```bash
git init
git add .
git commit -m "chore: bootstrap react developer tools project"
```

Hooks de calidad:

- `husky` se instala con `npm install` (script `prepare`)
- pre-commit ejecuta `lint-staged` sobre archivos staged

## Estructura base

```text
src/
  app/
    App.tsx
    providers/
  features/
    json-formatter/
    tool-registry/
  shared/
    lib/
    types/
  test/
```

## Mejores practicas aplicadas

- TypeScript estricto
- Alias de imports con `@/`
- ESLint + Prettier
- Vitest + cobertura
- Lint y format en pre-commit
- Arquitectura escalable por `app/features/shared`
