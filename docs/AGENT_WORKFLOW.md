# AGENT WORKFLOW

## Objetivo
Definir como coordinar especialistas por rol para implementar cambios con calidad y bajo riesgo.

## Orden recomendado de trabajo
1. Front/UX
2. React
3. Tester
4. DevOps

## Prompts cortos por rol

### Front/UX
`Mejora esta pantalla en accesibilidad y responsive sin cambiar logica de negocio. Valida foco, semantica y estados loading/error/empty.`

### React Performance
`Optimiza renders y composicion en estos componentes/hooks. Evita sobre-optimizar y manten legibilidad. Reporta que cambio en performance.`

### Tester
`Agrega/ajusta tests unitarios + integracion para este cambio. Evita flaky tests y cubre casos positivos/negativos criticos.`

### DevOps
`Ajusta workflows para correr lint, test, build en PR con cache. No expongas secretos ni reduzcas controles de calidad.`

## Que revisar en code review
- Alcance: cada PR respeta su rol y no mezcla responsabilidades.
- Seguridad: no hay secretos ni credenciales en codigo/configuracion.
- Calidad tecnica: `lint`, `test`, `build` en verde.
- UX/a11y: semantica correcta, foco visible, responsive y estados completos.
- React/performance: hooks correctos, composicion clara y sin renders evitables.
- Testing: pruebas deterministicas y relevantes para el riesgo del cambio.
- CI/CD: checks de PR configurados y ejecutando correctamente.
