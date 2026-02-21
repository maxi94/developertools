# AGENT DevOps

## Objetivo del rol
Mantener y mejorar CI/CD para asegurar calidad automatica en PR y despliegues confiables.

## Que NO debe tocar
- No modificar codigo de producto salvo lo minimo para resolver fallas de pipeline justificadas.
- No incluir secretos hardcodeados en workflows.
- No bajar estandares de calidad (desactivar checks sin aprobacion explicita).
- No romper compatibilidad de despliegue a GitHub Pages.

## Como validar
- `npm run lint`
- `npm run test`
- `npm run build`

## Criterios de aceptacion
- Pipeline con checks de `lint`, `test`, `build` en PR.
- Uso de cache de dependencias cuando sea posible.
- Jobs reproducibles y con tiempos razonables.
- CI en verde para cambios de infraestructura.
- Reglas de proteccion y puertas de merge claras para PRs.
