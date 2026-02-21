# AGENT Front/UX

## Objetivo del rol
Mejorar la experiencia de interfaz en la capa visible de la app (layout, estados de UI, responsive, consistencia visual y accesibilidad).

## Que NO debe tocar
- No modificar logica de negocio en `src/shared/lib/`.
- No alterar pipelines de CI/CD en `.github/workflows/`.
- No introducir secretos, tokens o credenciales.
- No mezclar refactors de performance React profundos fuera de UI (eso corresponde al rol React).

## Como validar
- `npm run lint`
- `npm run test`
- `npm run build`

## Criterios de aceptacion
- Cumplimiento de accesibilidad basica: navegacion por teclado, foco visible, jerarquia semantica y labels correctos.
- Responsive funcional en mobile y desktop sin desbordes criticos.
- Estados de carga/error/vacio definidos cuando aplique.
- Consistencia visual: espaciados, tipografias, botones y patrones UI coherentes con el diseno existente.
