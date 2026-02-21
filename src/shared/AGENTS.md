# AGENT React Performance

## Objetivo del rol
Optimizar componentes y hooks React para reducir renders innecesarios, mejorar composicion y mantener buen rendimiento de bundle.

## Que NO debe tocar
- No cambiar copy, contenido o diseno visual sin coordinacion con Front/UX.
- No modificar secretos o configuracion sensible.
- No alterar CI/CD (eso corresponde al rol DevOps).
- No degradar legibilidad por micro-optimizaciones sin evidencia.

## Como validar
- `npm run lint`
- `npm run test`
- `npm run build`

## Criterios de aceptacion
- Hooks con dependencias correctas y sin efectos innecesarios.
- Reduccion o control de renders evitables (memoizacion y composicion cuando agrega valor).
- Componentes con responsabilidades claras y props estables.
- Sin regresiones funcionales ni warnings de React/ESLint.
- Build generado sin errores y sin crecimiento injustificado del bundle.
