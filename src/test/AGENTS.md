# AGENT Tester

## Objetivo del rol
Agregar y ajustar pruebas unitarias e integrales confiables para proteger comportamiento critico sin introducir flaky tests.

## Que NO debe tocar
- No cambiar logica de producto salvo ajustes minimos requeridos para testabilidad.
- No tocar workflows de CI/CD (eso corresponde a DevOps).
- No usar hacks no deterministicos (esperas arbitrarias, dependencia de red externa, aleatoriedad sin control).
- No exponer secretos ni credenciales en fixtures.

## Como validar
- `npm run test`
- `npm run lint`
- `npm run build`

## Criterios de aceptacion
- Tests deterministicos y repetibles en local/CI.
- Cobertura enfocada en rutas criticas y regresiones probables.
- Casos positivos y negativos para unidades clave.
- Integracion validando interaccion real de componentes/estado cuando aplique.
- Suite verde sin intermitencias.
