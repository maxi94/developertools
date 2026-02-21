import {
  lazy,
  Suspense,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type LazyExoticComponent,
  type ReactNode,
} from 'react'
import {
  BookOpenText,
  Braces,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Code2,
  Database,
  FingerprintPattern as Fingerprint,
  Globe2,
  Menu,
  PanelLeft,
  Pin,
  PinOff,
  Search,
  Star,
  X,
} from 'lucide-react'
import {
  categoryOrder,
  createCategoryRecord,
  getCategoryDescription,
  getCategoryLabel,
  getCategorySlug,
  resolveCategoryFromSlug,
} from '@/features/tool-registry/model/categories'
import { localizeTool } from '@/features/tool-registry/model/tool-i18n'
import { tools } from '@/features/tool-registry/model/tools'
import { ToolCard } from '@/features/tool-registry/ui/ToolCard'
import { getI18nCopy } from '@/shared/i18n/catalog'
import { SUPPORTED_LANGUAGES, normalizeLanguage, type AppLanguage } from '@/shared/i18n/config'
import { applyDomTranslations } from '@/shared/i18n/dom-translation'
import { useI18n } from '@/shared/i18n/useI18n'
import { useTheme } from '@/shared/hooks/useTheme'
import type { ToolCategory, ToolDefinition, ToolId } from '@/shared/types/tool'
import { ToolErrorBoundary } from '@/shared/ui/ToolErrorBoundary'

const FAVORITES_KEY = 'developer-tools-favorites'
const FAVORITES_STORAGE_VERSION = 1
const RELEASE_SEEN_KEY = 'developer-tools-release-seen'
const APP_BASE_PATH = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '')

const categoryMeta: Record<
  ToolCategory,
  { icon: ReactNode; badgeClass: string; cardClass: string }
> = {
  Datos: {
    icon: <Database className="size-3.5" />,
    badgeClass:
      'bg-cyan-100 text-cyan-700 dark:bg-cyan-400/20 dark:text-cyan-200',
    cardClass:
      'border-slate-200 bg-slate-50 hover:border-cyan-400 hover:bg-cyan-50 dark:border-slate-700 dark:bg-slate-950/60 dark:hover:border-cyan-500 dark:hover:bg-cyan-950/30',
  },
  Formateadores: {
    icon: <Braces className="size-3.5" />,
    badgeClass:
      'bg-violet-100 text-violet-700 dark:bg-violet-400/20 dark:text-violet-200',
    cardClass:
      'border-slate-200 bg-slate-50 hover:border-violet-400 hover:bg-violet-50 dark:border-slate-700 dark:bg-slate-950/60 dark:hover:border-violet-500 dark:hover:bg-violet-950/30',
  },
  'Generadores de codigo': {
    icon: <Code2 className="size-3.5" />,
    badgeClass:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200',
    cardClass:
      'border-slate-200 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-950/60 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/30',
  },
  'Tokens e identidad': {
    icon: <Fingerprint className="size-3.5" />,
    badgeClass:
      'bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200',
    cardClass:
      'border-slate-200 bg-slate-50 hover:border-amber-400 hover:bg-amber-50 dark:border-slate-700 dark:bg-slate-950/60 dark:hover:border-amber-500 dark:hover:bg-amber-950/30',
  },
  'Utilidades web': {
    icon: <Globe2 className="size-3.5" />,
    badgeClass:
      'bg-sky-100 text-sky-700 dark:bg-sky-400/20 dark:text-sky-200',
    cardClass:
      'border-slate-200 bg-slate-50 hover:border-sky-400 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-950/60 dark:hover:border-sky-500 dark:hover:bg-sky-950/30',
  },
  Documentacion: {
    icon: <BookOpenText className="size-3.5" />,
    badgeClass:
      'bg-rose-100 text-rose-700 dark:bg-rose-400/20 dark:text-rose-200',
    cardClass:
      'border-slate-200 bg-slate-50 hover:border-rose-400 hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-950/60 dark:hover:border-rose-500 dark:hover:bg-rose-950/30',
  },
}

const releaseNotes = [
  {
    version: 'v2.6.1',
    date: '2026-02-21',
    title: 'UI optimizada para vista de categoria',
    changes: [
      'La vista de categoria pasa a grilla de cards con mejor jerarquia visual y menor dispersion horizontal.',
      'Acciones de cada herramienta (fijar/abrir) se acercan al contenido dentro de la misma card para uso mas comodo.',
      'Se agrega badge de version y truncado de descripcion para mejorar escaneo rapido.',
    ],
  },
  {
    version: 'v2.6.0',
    date: '2026-02-21',
    title: 'Menu desktop fijable/desfijable',
    changes: [
      'Se agrega modo de menu fijado (sidebar desktop) y desfijado (hamburguesa tipo mobile en desktop).',
      'Cuando el menu esta desfijado, el drawer lateral funciona igual que en mobile y se puede volver a fijar desde header o drawer.',
      'Se mantiene comportamiento responsive actual y colapso vertical del menu fijado.',
    ],
  },
  {
    version: 'v2.5.4',
    date: '2026-02-21',
    title: 'Resaltado de llaves y corchetes en hover',
    changes: [
      'Al pasar el mouse por { } [ ] en JSON normalizado se resaltan ambos extremos del bloque.',
      'Mejora de navegacion visual para encontrar cierres de estructura en payloads grandes.',
      'Se mantiene el plegado inline con +/- y el fondo alternado por fila.',
    ],
  },
  {
    version: 'v2.5.3',
    date: '2026-02-21',
    title: 'Legibilidad mejorada en salida JSON',
    changes: [
      'Se agrega fondo alternado por fila en la salida JSON para distinguir lineas rapidamente.',
      'Se mantiene el plegado inline con +/- por linea y bloques colapsados.',
      'Ajuste visual aplicado para mejorar lectura en claro y oscuro.',
    ],
  },
  {
    version: 'v2.5.2',
    date: '2026-02-21',
    title: 'Fix folding y fullscreen en Visor JSON Pro',
    changes: [
      'Se corrige el boton +/- del JSON normalizado para colapsar/expandir bloques correctamente por linea.',
      'Pantalla completa vuelve a aplicarse solo al panel de JSON normalizado, no a toda la herramienta.',
      'Se elimina duplicacion del boton de salir pantalla completa en el flujo del Visor JSON Pro.',
    ],
  },
  {
    version: 'v2.5.1',
    date: '2026-02-21',
    title: 'Folding inline real en salida JSON',
    changes: [
      'La salida JSON ahora permite colapsar/expandir bloques con botones +/- por linea, estilo editor de codigo.',
      'Se elimina el modo duplicado codigo/plegable del Visor JSON Pro para simplificar la experiencia.',
      'Fullscreen del Visor JSON Pro mantiene alcance total de herramienta con flujo unificado.',
    ],
  },
  {
    version: 'v2.5.0',
    date: '2026-02-21',
    title: 'Ajustes UX para Visor JSON Pro',
    changes: [
      'Pantalla completa del Visor JSON Pro ahora aplica a toda la herramienta (entrada, salida y visor), no solo al bloque inferior.',
      'La salida JSON agrega modo plegable para colapsar/expandir objetos y arrays durante la inspeccion.',
      'En vista de grafo, al colapsar un nodo tambien se marcan colapsados sus descendientes para evitar re-expansion completa al abrir de nuevo.',
    ],
  },
  {
    version: 'v2.4.0',
    date: '2026-02-21',
    title: 'Nueva herramienta Visor JSON Pro',
    changes: [
      'Se agrega Visor JSON Pro para explorar payloads grandes (incluyendo Swagger/OpenAPI).',
      'Incluye vista arbol y grafo, filtros, colapsado/expandido de secciones y pantalla completa.',
      'Se mejora el arbol JSON con colores por tipo de valor para lectura mas rapida.',
    ],
  },
  {
    version: 'v2.3.4',
    date: '2026-02-21',
    title: 'Refinamiento de paleta en modo claro',
    changes: [
      'Se mejora la gama cromatica global del modo claro para un look mas limpio y menos saturado.',
      'Se ajustan gradientes, overlays y acentos del fondo general sin modificar el modo oscuro.',
      'Mejor contraste visual en el layout principal para lectura y jerarquia.',
    ],
  },
  {
    version: 'v2.3.3',
    date: '2026-02-21',
    title: 'Fix deteccion SVG en byte[] a archivo',
    changes: [
      'La herramienta byte[] a archivo ahora detecta correctamente SVG desde contenido XML y lo trata como imagen.',
      'El guardado evita forzar extension extra cuando el nombre ya incluye una extension manual (por ejemplo archivo.svg).',
      'Version de byte[] a archivo actualizada a v1.0.3.',
    ],
  },
  {
    version: 'v2.3.2',
    date: '2026-02-21',
    title: 'Fix parser byte[] para blobs SQL 0x',
    changes: [
      'Se corrige parseo de entradas SQL con blob hex continuo (0x89504E...) para convertir en bytes validos.',
      'Ahora un token 0x largo se procesa por pares hex (1 byte por par), evitando errores de fuera de rango.',
      'Se valida y reporta error claro cuando el blob hex tiene longitud impar.',
    ],
  },
  {
    version: 'v2.3.1',
    date: '2026-02-21',
    title: 'byte[] parser desde primer 0x',
    changes: [
      'El parser de byte[] ahora toma solo tokens desde el primer valor hexadecimal (0x...) en adelante.',
      'Esto evita incluir prefijos/metadatos numericos que vienen antes del contenido real del archivo.',
      'Version de byte[] a archivo actualizada a v1.0.1.',
    ],
  },
  {
    version: 'v2.3.0',
    date: '2026-02-21',
    title: 'Nueva tool byte[] a archivo',
    changes: [
      'Se agrega herramienta byte[] a archivo con soporte para entrada C#/JSON/lista.',
      'Detecta tipo por firma (imagen, PDF y otros), con preview y descarga.',
      'Textos y catalogo de herramienta completos en ES/EN/PT.',
    ],
  },
  {
    version: 'v2.2.0',
    date: '2026-02-21',
    title: 'Guia de operadores para SQL a MongoDB',
    changes: [
      'SQL a MongoDB ahora incluye una guia visual de operadores de busqueda ($eq, $regex, $in, $or, etc.).',
      'Cada operador incluye descripcion y ejemplo listo para usar en filtros Mongo.',
      'Version de SQL a MongoDB actualizada a v1.4.0.',
    ],
  },
  {
    version: 'v2.1.0',
    date: '2026-02-21',
    title: 'SQL a MongoDB mas robusto',
    changes: [
      'SQL a MongoDB: soporte para mezcla AND/OR con parentesis y prioridad correcta.',
      'Nuevos casos soportados: OFFSET y SELECT TOP N en conversion a Mongo.',
      'Version de SQL a MongoDB actualizada a v1.3.0.',
    ],
  },
  {
    version: 'v2.0.0',
    date: '2026-02-21',
    title: 'Se elimina Fake Data Generator',
    changes: [
      'La herramienta Fake Data Generator se elimina del producto.',
      'Se remueven menu, registro y carga lazy asociados.',
      'Release mayor por cambio incompatible en el set de herramientas disponible.',
    ],
  },
  {
    version: 'v1.4.0',
    date: '2026-02-21',
    title: 'Fake Data flexible por esquema',
    changes: [
      'Generador fake data redisenado: ahora permite construir datasets por campos sin JSON fijo.',
      'Se agregan presets y seleccion manual de campos para armar payloads de prueba mas reales.',
      'Version de Generador fake data actualizada a v1.1.0.',
    ],
  },
  {
    version: 'v1.3.10',
    date: '2026-02-21',
    title: 'Fix definitivo: ocultar titulo interno en tools',
    changes: [
      'Se oculta el titulo/descripcion internos de cada herramienta para igualar el formato de JSON a tabla.',
      'La regla global de ocultado se refuerza para evitar que utilidades visuales la sobreescriban.',
      'Versiones de JSON a tabla y Minify/Expand JS-CSS actualizadas por ajuste de presentacion.',
    ],
  },
  {
    version: 'v1.3.9',
    date: '2026-02-21',
    title: 'Ajuste de duplicados internos en tools',
    changes: [
      'Se mantiene la cabecera general del template sin cambios de estructura.',
      'Se elimina duplicacion de titulo/descripcion dentro del contenido interno de herramientas.',
      'Se actualizan versiones de JSON a tabla y Minify/Expand JS-CSS por ajuste de formato unificado.',
    ],
  },
  {
    version: 'v1.3.8',
    date: '2026-02-21',
    title: 'Fix formato tool interno + snippet de menu',
    changes: [
      'Se ocultan titulo y descripcion internos repetidos dentro de cada herramienta para un formato consistente.',
      'Menu lateral: metadata de cada tool en formato vX.X.X · descripcion con truncado a dos lineas y ellipsis.',
      'Version de Base64 a imagen actualizada a v1.2.2 por ajuste de presentacion en el flujo unificado.',
    ],
  },
  {
    version: 'v1.3.7',
    date: '2026-02-21',
    title: 'Formato unificado en tools y menu detallado',
    changes: [
      'Se oculta el titulo interno repetido dentro de la vista de herramientas para mantener un encabezado unico.',
      'Se restaura el formato de tarjetas del menu lateral con icono, descripcion, version y fijador.',
      'Ajustes visuales para mantener el comportamiento responsive en desktop y mobile.',
    ],
  },
  {
    version: 'v1.3.6',
    date: '2026-02-21',
    title: 'Header de herramientas fuera de card',
    changes: [
      'La cabecera de herramienta deja de mostrarse como card y se integra al layout general.',
      'Se elimina la version web visible del header superior para reducir ruido visual.',
      'JSON a tabla incorpora ayuda de modos en tooltip y se actualiza su version a v1.0.2.',
    ],
  },
  {
    version: 'v1.3.5',
    date: '2026-02-21',
    title: 'Menu minimalista y cabecera de herramienta unificada',
    changes: [
      'Menu lateral redisenado con fila compacta: estrella a la izquierda, nombre y version a la derecha.',
      'Cabecera de herramienta simplificada en un solo bloque superior con nombre, descripcion y version.',
      'Ajuste de colores hacia una paleta mas neutra para reducir saturacion visual.',
    ],
  },
  {
    version: 'v1.3.4',
    date: '2026-02-21',
    title: 'Fix regresion de output JSON e i18n en portugues',
    changes: [
      'JSON Formatter: se elimina el toggle involuntario de Minificar/Expandir al hacer click en la salida.',
      'I18n DOM: se evita reemplazar subcadenas dentro de palabras para frenar corrupciones como Expandiririri.',
      'Se agregan tests de regresion para ambos casos.',
    ],
  },
  {
    version: 'v1.3.3',
    date: '2026-02-21',
    title: 'Barrido i18n completo en herramientas',
    changes: [
      'Se amplian traducciones de herramientas (JSON, Base64, Regex, SQL a Mongo, Case Converter y Encoding Suite).',
      'Se corrige el motor DOM para evitar textos corruptos en portugues al retraducir (ej: Expandiririri).',
      'Se actualizan versiones de herramientas impactadas por correcciones de idioma.',
    ],
  },
  {
    version: 'v1.3.2',
    date: '2026-02-21',
    title: 'Interfaz minimalista sin informacion duplicada',
    changes: [
      'Se simplifica la navegacion lateral: cada herramienta muestra favorito + nombre, sin descripcion/version repetida.',
      'La version web se muestra solo en el header superior para evitar ruido visual en vistas internas.',
      'Home y categoria se compactan a listados simples, eliminando cards pesadas y bloques redundantes.',
    ],
  },
  {
    version: 'v1.3.1',
    date: '2026-02-21',
    title: 'Fix definitivo i18n en tools y recarga',
    changes: [
      'Se corrige fallback de localizacion para evitar mezcla de idiomas en menu y descripciones.',
      'Se agrega observador de mutaciones para traducir contenido lazy al recargar sin tocar el selector.',
      'Se amplian textos traducibles de visualizador JSON (tree/graph) en ES/EN/PT.',
    ],
  },
  {
    version: 'v1.3.0',
    date: '2026-02-21',
    title: 'Cobertura i18n completa para herramientas',
    changes: [
      'Se completan traducciones visibles en tools para ES/EN/PT sin mezclar idiomas.',
      'Se amplian traducciones runtime para labels, descripciones y mensajes faltantes.',
      'Se actualizan versiones de herramientas impactadas por ajustes de copy multiidioma.',
    ],
  },
  {
    version: 'v1.2.3',
    date: '2026-02-21',
    title: 'Traducciones completas PT para menu de herramientas',
    changes: [
      'Se agregan textos en Portugues para nombres y descripciones de herramientas.',
      'Se elimina el caso donde el menu mostraba descripciones en Ingles en modo PT.',
    ],
  },
  {
    version: 'v1.2.2',
    date: '2026-02-21',
    title: 'Fallback i18n ajustado para portugues',
    changes: [
      'Se prioriza Espanol antes de Ingles cuando faltan traducciones en Portugues.',
      'Se evita que el menu de herramientas quede mezclado en Ingles en modo PT.',
    ],
  },
  {
    version: 'v1.2.1',
    date: '2026-02-21',
    title: 'Correccion de idioma en menu de herramientas',
    changes: [
      'Se corrige el fallback de localizacion para que Espanol no herede textos en Ingles.',
      'El menu de herramientas ahora respeta el idioma seleccionado de forma consistente.',
    ],
  },
  {
    version: 'v1.2.0',
    date: '2026-02-21',
    title: 'I18n unificado en catalogos y limpieza de textos mezclados',
    changes: [
      'Se centralizan textos UI en un catalogo tipado por idioma para menu y vistas principales.',
      'Se migran herramientas clave (Color, Box Shadow, Spacing, Image to Base64 y SVG Optimizer) al catalogo.',
      'Se mantiene traduccion de respaldo para componentes legacy sin condicionales por idioma.',
    ],
  },
  {
    version: 'v1.1.1',
    date: '2026-02-21',
    title: 'Fix i18n en interfaz y categoria sin duplicacion',
    changes: [
      'Se reemplazan condicionales de texto por un diccionario UI completo para ES/EN/PT.',
      'Se corrige la ruta de herramienta para portugues usando /ferramenta/:id.',
      'La vista de categoria elimina la cabecera duplicada y conserva un resumen compacto.',
    ],
  },
  {
    version: 'v1.1.0',
    date: '2026-02-21',
    title: 'UX global + tema avanzado + i18n escalable',
    changes: [
      'Se agrega modo de tema Light/Dark/System con persistencia y deteccion del sistema.',
      'La app incorpora base multilenguaje ampliada (ES/EN/PT) con fallback seguro.',
      'Se mejoran textos y controles del header para una experiencia mas clara en desktop y mobile.',
    ],
  },
  {
    version: 'v1.0.0',
    date: '2026-02-19',
    title: 'Se elimina generador README',
    changes: [
      'La herramienta Generador README se quita del producto.',
      'Se remueven acceso en menu/rutas y referencias asociadas.',
      'Release mayor por cambio incompatible en el set de herramientas disponible.',
    ],
  },
  {
    version: 'v0.12.0',
    date: '2026-02-19',
    title: 'Readme Generator overhaul',
    changes: [
      'Generador README redisenado con flujo por pasos y UX mas clara.',
      'Se agrega autosave, import/export de configuracion y checklist de calidad.',
      'Nuevos modos de vista previa (Markdown y resumen) con metricas de contenido.',
      'Version de la herramienta Generador README actualizada a v1.1.0.',
    ],
  },
  {
    version: 'v0.11.3',
    date: '2026-02-19',
    title: 'Spacing Preview responsive',
    changes: [
      'Border/Spacing Preview: mejoras de responsive para mobile.',
      'Preview con contenedor fluido y alturas/paddings adaptativos.',
      'Version de la herramienta Border/Spacing Preview actualizada a v1.0.1.',
    ],
  },
  {
    version: 'v0.11.2',
    date: '2026-02-19',
    title: 'Box Shadow responsive',
    changes: [
      'Box Shadow Generator: preview y layout ajustados para mobile.',
      'Se eliminan anchos rigidos y se optimiza la accion de copiar en pantallas chicas.',
      'Version de la herramienta Box Shadow Generator actualizada a v1.0.1.',
    ],
  },
  {
    version: 'v0.11.1',
    date: '2026-02-19',
    title: 'Scroll mobile + responsive tools',
    changes: [
      'Fix de scroll en mobile dentro de la vista de herramientas.',
      'Hardening responsive global para contenedores de tools (tablas, pre, media y bloques anchos).',
      'Ajustes de altura en paneles extensos para mejorar uso en pantallas chicas.',
    ],
  },
  {
    version: 'v0.11.0',
    date: '2026-02-19',
    title: 'Favoritos colapsables en menu',
    changes: [
      'Nueva categoria Favoritos al inicio del menu lateral en desktop y mobile.',
      'La seccion Favoritos ahora es colapsable para mantener orden en navegaciones largas.',
      'Header corregido: idioma y switch de tema vuelven a alinearse a la derecha.',
    ],
  },
  {
    version: 'v0.10.1',
    date: '2026-02-19',
    title: 'Versionado y changelog obligatorio',
    changes: [
      'Se define una politica de versionado semantico para cada entrega.',
      'Se fuerza actualizar la version web en cada cambio aplicado.',
      'Se estandariza el historial de cambios visible en la web por release.',
    ],
  },
  {
    version: 'v0.10.0',
    date: '2026-02-19',
    title: 'Minify/Expand JS-CSS',
    changes: [
      'Nueva herramienta para minificar y expandir JavaScript y CSS.',
      'Soporte para pegar contenido o cargar archivos .js/.mjs/.cjs/.css.',
      'Acciones de copiar y descargar salida procesada.',
    ],
  },
  {
    version: 'v0.9.0',
    date: '2026-02-19',
    title: 'JSON table export + SQL-Mongo examples',
    changes: [
      'Nueva herramienta JSON a tabla con soporte de objetos/arrays anidados.',
      'Preview tabular y exportacion a CSV y Excel (.xls).',
      'SQL a MongoDB: nuevos ejemplos (fechas, rangos, not, in, distinct, comparadores).',
      'UI de ejemplos en SQL a Mongo mejorada para que no sea invasiva.',
    ],
  },
  {
    version: 'v0.8.0',
    date: '2026-02-19',
    title: 'JSON classes + graph navigation + exports',
    changes: [
      'JSON Formatter: exportar CSV y Excel desde salida JSON estructurada.',
      'Toast de alertas sin texto fijo en medio y acciones separadas por textarea.',
      'Vista grafo mejorada: zoom, pan por arrastre, click para navegar, centrar nodo y pantalla completa.',
      'JSON a clases: soporte robusto para objetos anidados y nuevos lenguajes (Python, Kotlin, Go).',
      'Versiones actualizadas para web y herramientas JSON.',
    ],
  },
  {
    version: 'v0.6.0',
    date: '2026-02-19',
    title: 'Rediseno UI, rutas directas y versionado',
    changes: [
      'Rediseno global: shell, header, sidebar, Home y Categoria con mejor jerarquia visual.',
      'Menu colapsable corregido: tooltips, overflow y boton de categoria dentro del contenedor.',
      'Rutas directas por categoria: /datos, /formateadores, etc. (legacy /categoria/* soportado).',
      'Regex mejorado con diagrama de estados en SVG y visualizacion mas clara.',
      'Version web independiente y version por herramienta visible en la interfaz.',
    ],
  },
  {
    version: 'v0.5.0',
    date: '2026-02-19',
    title: 'Arquitectura por rutas',
    changes: [
      'Navegacion persistente por URL para Home, Categoria y Herramienta.',
      'Cada tool ahora tiene una ruta directa compartible y guardable en favoritos del navegador.',
      'Sincronizacion con back/forward del browser.',
    ],
  },
  {
    version: 'v0.4.0',
    date: '2026-02-19',
    title: 'Navegacion por Home/Categoria/Herramienta',
    changes: [
      'Nueva pagina de inicio con historial de mejoras.',
      'Nueva pagina por categoria con descripcion y accesos rapidos.',
      'Breadcrumb clickable para volver a Home o Categoria.',
    ],
  },
  {
    version: 'v0.3.0',
    date: '2026-02-19',
    title: 'Expansion de Base64',
    changes: [
      'Nuevas tools separadas: Base64 a Imagen y Base64 a PDF.',
      'Soporte para entrada unica y arrays JSON.',
      'Vista previa y descarga de assets generados.',
    ],
  },
]

const latestRelease = releaseNotes[0]
type ReleaseNote = (typeof releaseNotes)[number]

type ViewState =
  | { type: 'home' }
  | { type: 'category'; category: ToolCategory }
  | { type: 'tool'; toolId: ToolId }

const toolById = new Map<ToolId, ToolDefinition>(tools.map((tool) => [tool.id, tool]))

function lazyNamedTool<T extends object, K extends keyof T>(
  loader: () => Promise<T>,
  key: K,
): LazyExoticComponent<ComponentType> {
  return lazy(async () => {
    const module = await loader()
    return { default: module[key] as ComponentType }
  })
}

const toolComponentById: Partial<Record<ToolId, LazyExoticComponent<ComponentType>>> = {
  'json-formatter': lazyNamedTool(
    () => import('@/features/json-formatter/ui/JsonFormatterTool'),
    'JsonFormatterTool',
  ),
  'json-viewer': lazyNamedTool(
    () => import('@/features/json-viewer/ui/JsonViewerTool'),
    'JsonViewerTool',
  ),
  'json-table': lazyNamedTool(
    () => import('@/features/json-table/ui/JsonTableTool'),
    'JsonTableTool',
  ),
  base64: lazyNamedTool(() => import('@/features/base64/ui/Base64Tool'), 'Base64Tool'),
  'base64-image': lazyNamedTool(
    () => import('@/features/base64-image/ui/Base64ImageTool'),
    'Base64ImageTool',
  ),
  'base64-pdf': lazyNamedTool(
    () => import('@/features/base64-pdf/ui/Base64PdfTool'),
    'Base64PdfTool',
  ),
  'byte-array-converter': lazyNamedTool(
    () => import('@/features/byte-array-converter/ui/ByteArrayConverterTool'),
    'ByteArrayConverterTool',
  ),
  'sql-formatter': lazyNamedTool(
    () => import('@/features/sql-formatter/ui/SqlFormatterTool'),
    'SqlFormatterTool',
  ),
  'code-minifier': lazyNamedTool(
    () => import('@/features/code-minifier/ui/CodeMinifierTool'),
    'CodeMinifierTool',
  ),
  'case-converter': lazyNamedTool(
    () => import('@/features/case-converter/ui/CaseConverterTool'),
    'CaseConverterTool',
  ),
  'sql-mongo-converter': lazyNamedTool(
    () => import('@/features/sql-mongo/ui/SqlMongoConverterTool'),
    'SqlMongoConverterTool',
  ),
  'regex-tool': lazyNamedTool(() => import('@/features/regex-tool/ui/RegexTool'), 'RegexTool'),
  'json-model-generator': lazyNamedTool(
    () => import('@/features/json-model-generator/ui/JsonModelGeneratorTool'),
    'JsonModelGeneratorTool',
  ),
  'jwt-builder': lazyNamedTool(
    () => import('@/features/jwt-builder/ui/JwtBuilderTool'),
    'JwtBuilderTool',
  ),
  jwt: lazyNamedTool(() => import('@/features/jwt/ui/JwtTool'), 'JwtTool'),
  uuid: lazyNamedTool(() => import('@/features/uuid/ui/UuidTool'), 'UuidTool'),
  'id-toolkit': lazyNamedTool(
    () => import('@/features/id-toolkit/ui/IdToolkitTool'),
    'IdToolkitTool',
  ),
  'url-codec': lazyNamedTool(
    () => import('@/features/url-codec/ui/UrlCodecTool'),
    'UrlCodecTool',
  ),
  'encoding-suite': lazyNamedTool(
    () => import('@/features/encoding-suite/ui/EncodingSuiteTool'),
    'EncodingSuiteTool',
  ),
  'color-tools': lazyNamedTool(
    () => import('@/features/color-tools/ui/ColorToolsTool'),
    'ColorToolsTool',
  ),
  'box-shadow-generator': lazyNamedTool(
    () => import('@/features/box-shadow-generator/ui/BoxShadowGeneratorTool'),
    'BoxShadowGeneratorTool',
  ),
  'spacing-preview': lazyNamedTool(
    () => import('@/features/spacing-preview/ui/SpacingPreviewTool'),
    'SpacingPreviewTool',
  ),
  'datetime-tools': lazyNamedTool(
    () => import('@/features/datetime-tools/ui/DateTimeTools'),
    'DateTimeTools',
  ),
  'svg-optimizer': lazyNamedTool(
    () => import('@/features/svg-optimizer/ui/SvgOptimizerTool'),
    'SvgOptimizerTool',
  ),
  'image-to-base64': lazyNamedTool(
    () => import('@/features/image-to-base64/ui/ImageToBase64Tool'),
    'ImageToBase64Tool',
  ),
}

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/'
  }

  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

function stripBasePath(pathname: string): string {
  if (!APP_BASE_PATH) {
    return pathname
  }

  if (!pathname.startsWith(APP_BASE_PATH)) {
    return pathname
  }

  const stripped = pathname.slice(APP_BASE_PATH.length)
  return stripped || '/'
}

function toAppAbsolutePath(pathname: string): string {
  const normalized = normalizePath(pathname)
  if (!APP_BASE_PATH) {
    return normalized
  }

  if (normalized === '/') {
    return `${APP_BASE_PATH}/`
  }

  return `${APP_BASE_PATH}${normalized}`
}

function getToolRouteSegment(language: AppLanguage): string {
  return getI18nCopy(language, 'toolRegistry').routeToolSegment
}

function getCategoryPath(category: ToolCategory, language: AppLanguage): string {
  return `/${getCategorySlug(category, language)}`
}

function getToolPath(toolId: ToolId, language: AppLanguage): string {
  return `/${getToolRouteSegment(language)}/${toolId}`
}

function viewToPath(view: ViewState, language: AppLanguage): string {
  if (view.type === 'home') {
    return '/'
  }

  if (view.type === 'category') {
    return getCategoryPath(view.category, language)
  }

  return getToolPath(view.toolId, language)
}

function parseViewFromPath(pathname: string): ViewState {
  const normalized = normalizePath(stripBasePath(pathname))
  if (normalized === '/') {
    return { type: 'home' }
  }

  // Canonical: /datos. Legacy accepted: /categoria/datos
  const directCategoryMatch = normalized.match(/^\/([^/]+)$/)
  if (directCategoryMatch) {
    const category = resolveCategoryFromSlug(directCategoryMatch[1])
    if (category) {
      return { type: 'category', category }
    }
  }

  const legacyCategoryMatch = normalized.match(/^\/categoria\/([^/]+)$/)
  if (legacyCategoryMatch) {
    const category = resolveCategoryFromSlug(legacyCategoryMatch[1])
    if (category) {
      return { type: 'category', category }
    }
    return { type: 'home' }
  }

  const englishCategoryMatch = normalized.match(/^\/category\/([^/]+)$/)
  if (englishCategoryMatch) {
    const category = resolveCategoryFromSlug(englishCategoryMatch[1])
    if (category) {
      return { type: 'category', category }
    }
    return { type: 'home' }
  }

  const toolMatch = normalized.match(/^\/([^/]+)\/([^/]+)$/)
  if (toolMatch && (toolMatch[1] === 'herramienta' || toolMatch[1] === 'tool' || toolMatch[1] === 'ferramenta')) {
    const toolId = toolMatch[2] as ToolId
    if (toolById.has(toolId)) {
      return { type: 'tool', toolId }
    }
    return { type: 'home' }
  }

  return { type: 'home' }
}

function getInitialFavorites(): ToolId[] {
  const raw = window.localStorage.getItem(FAVORITES_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)
    const validToolIds = new Set<ToolId>(tools.map((tool) => tool.id))

    // Backward compatibility: legacy format was an array of ids.
    if (Array.isArray(parsed)) {
      return parsed.filter((toolId: unknown): toolId is ToolId => validToolIds.has(toolId as ToolId))
    }

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('version' in parsed) ||
      !('ids' in parsed) ||
      parsed.version !== FAVORITES_STORAGE_VERSION ||
      !Array.isArray(parsed.ids)
    ) {
      return []
    }

    return parsed.ids.filter((toolId: unknown): toolId is ToolId => validToolIds.has(toolId as ToolId))
  } catch {
    return []
  }
}

interface SidebarContentProps {
  favoriteToolIds: ToolId[]
  menuTools: ToolDefinition[]
  searchTerm: string
  selectedCategory: ToolCategory | null
  activeToolId: ToolId | null
  viewType: ViewState['type']
  isMenuCollapsed: boolean
  collapsedCategories: Set<ToolCategory>
  onSelectCategory: (category: ToolCategory) => void
  onSelectTool: (toolId: ToolId) => void
  onToggleFavorite: (toolId: ToolId) => void
  onToggleCategory: (category: ToolCategory) => void
  onExpandCategory: (category: ToolCategory) => void
  onSearchTermChange: (value: string) => void
  onClearSearch: () => void
}

function getInitialSeenReleaseVersion(): string | null {
  const raw = window.localStorage.getItem(RELEASE_SEEN_KEY)
  return raw && raw.trim() ? raw : null
}

function SidebarContent({
  favoriteToolIds,
  menuTools,
  searchTerm,
  selectedCategory,
  activeToolId,
  viewType,
  isMenuCollapsed,
  collapsedCategories,
  onSelectCategory,
  onSelectTool,
  onToggleFavorite,
  onToggleCategory,
  onExpandCategory,
  onSearchTermChange,
  onClearSearch,
}: SidebarContentProps) {
  const { language } = useI18n()
  const ui = getI18nCopy(language, 'toolRegistry')
  const favoriteToolIdSet = useMemo(() => new Set(favoriteToolIds), [favoriteToolIds])
  const favoriteTools = useMemo(
    () => menuTools.filter((tool) => favoriteToolIdSet.has(tool.id)),
    [menuTools, favoriteToolIdSet],
  )
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [isFavoritesCollapsed, setIsFavoritesCollapsed] = useState(false)

  const groupedTools = useMemo(() => {
    const grouped = createCategoryRecord<ToolDefinition[]>(() => [])

    for (const tool of menuTools) {
      grouped[tool.category].push(tool)
    }

    return categoryOrder
      .map((category) => ({ category, tools: grouped[category] }))
      .filter((group) => group.tools.length > 0)
  }, [menuTools])

  const groupedSuggestions = useMemo(() => {
    if (!searchTerm.trim()) {
      return []
    }

    const grouped = createCategoryRecord<ToolDefinition[]>(() => [])

    for (const tool of menuTools) {
      grouped[tool.category].push(tool)
    }

    return categoryOrder
      .map((category) => ({ category, tools: grouped[category] }))
      .filter((group) => group.tools.length > 0)
  }, [menuTools, searchTerm])

  const flatSuggestions = useMemo(
    () => groupedSuggestions.flatMap((group) => group.tools),
    [groupedSuggestions],
  )

  const suggestionIndexById = useMemo(
    () => new Map(flatSuggestions.map((tool, index) => [tool.id, index])),
    [flatSuggestions],
  )

  const applySuggestion = (toolId: ToolId) => {
    onSelectTool(toolId)
    onClearSearch()
    setHighlightedIndex(0)
    setIsSearchFocused(false)
  }

  return (
    <>
      {!isMenuCollapsed ? (
        <div className="relative mb-3">
          <label className="inline-flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400">
            <Search className="size-3.5" />
            <input
              className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-100"
              placeholder={ui.searchInMenu}
              value={searchTerm}
              onChange={(event) => {
                onSearchTermChange(event.target.value)
                setHighlightedIndex(0)
              }}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => {
                window.setTimeout(() => setIsSearchFocused(false), 120)
              }}
              onKeyDown={(event) => {
                if (!flatSuggestions.length) {
                  return
                }

                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  setHighlightedIndex((current) => (current + 1) % flatSuggestions.length)
                }

                if (event.key === 'ArrowUp') {
                  event.preventDefault()
                  setHighlightedIndex((current) =>
                    current === 0 ? flatSuggestions.length - 1 : current - 1,
                  )
                }

                if (event.key === 'Enter') {
                  event.preventDefault()
                  applySuggestion(flatSuggestions[highlightedIndex].id)
                }

                if (event.key === 'Escape') {
                  setIsSearchFocused(false)
                }
              }}
              spellCheck={false}
            />
            {searchTerm ? (
              <button
                type="button"
                className="inline-flex size-5 cursor-pointer items-center justify-center rounded text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                onClick={() => {
                  onClearSearch()
                  setHighlightedIndex(0)
                }}
                aria-label={ui.clearSearch}
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </label>
          {isSearchFocused && groupedSuggestions.length > 0 ? (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              {groupedSuggestions.map((group) => (
                <div
                  key={group.category}
                  className="border-b border-slate-200/70 px-2 py-1.5 last:border-b-0 dark:border-slate-800"
                >
                  <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    {getCategoryLabel(group.category, language)}
                  </p>
                  <div className="mt-1 grid gap-1">
                    {group.tools.map((tool) => {
                      const index = suggestionIndexById.get(tool.id) ?? 0
                      return (
                        <button
                          key={tool.id}
                          type="button"
                          className={`block w-full cursor-pointer rounded-md px-2 py-2 text-left text-sm ${
                            index === highlightedIndex
                              ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300'
                              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                          }`}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          onClick={() => applySuggestion(tool.id)}
                        >
                          <p className="font-semibold">{tool.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {tool.description}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-3">
        {favoriteTools.length > 0 ? (
          <section className="grid gap-1.5">
            <div
              className={`grid items-center ${
                isMenuCollapsed ? 'grid-cols-1' : 'grid-cols-[minmax(0,1fr)_auto]'
              } gap-1`}
            >
              <button
                type="button"
                title={isMenuCollapsed ? ui.favorites : undefined}
                className={`min-w-0 inline-flex cursor-pointer items-center ${
                  isMenuCollapsed ? 'justify-center px-0.5' : 'gap-1.5 px-1'
                } rounded-md py-1 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-900 dark:text-white`}
                onClick={() => setIsFavoritesCollapsed((current) => !current)}
              >
                <span className="inline-flex size-4 shrink-0 items-center justify-center rounded-sm bg-amber-100 text-amber-700 dark:bg-amber-400/20 dark:text-amber-200">
                  <Star className="size-3.5" />
                </span>
                {!isMenuCollapsed ? (
                  <span className="truncate">{ui.favorites}</span>
                ) : null}
              </button>
              {!isMenuCollapsed ? (
                <button
                  type="button"
                  className="inline-flex size-6 shrink-0 cursor-pointer self-center items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  onClick={() => setIsFavoritesCollapsed((current) => !current)}
                  aria-label={
                    isFavoritesCollapsed
                      ? ui.expandFavorites
                      : ui.collapseFavorites
                  }
                >
                  <ChevronDown
                    className={`size-4 transition ${isFavoritesCollapsed ? '-rotate-90' : ''}`}
                  />
                </button>
              ) : null}
            </div>
            {!isFavoritesCollapsed ? (
              <nav
                className="grid gap-1.5"
                aria-label={ui.favoritesMenu}
              >
                {favoriteTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    compact={isMenuCollapsed}
                    isActive={tool.id === activeToolId && viewType === 'tool'}
                    isFavorite={true}
                    onSelect={onSelectTool}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </nav>
            ) : null}
          </section>
        ) : null}

        {groupedTools.map((group) => (
          <section key={group.category} className="grid gap-1.5">
            <div className={`grid items-center ${isMenuCollapsed ? 'grid-cols-1' : 'grid-cols-[minmax(0,1fr)_auto]'} gap-1`}>
              <button
                type="button"
                title={isMenuCollapsed ? group.category : undefined}
                className={`min-w-0 inline-flex cursor-pointer items-center ${isMenuCollapsed ? 'justify-center px-0.5' : 'gap-1.5 px-1'} rounded-md py-1 text-left text-[10px] font-semibold uppercase tracking-[0.1em] ${
                  selectedCategory === group.category
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
                onClick={() => {
                  onExpandCategory(group.category)
                  onSelectCategory(group.category)
                }}
              >
                <span
                  className={`inline-flex size-4 shrink-0 items-center justify-center rounded-sm ${categoryMeta[group.category].badgeClass}`}
                >
                  {categoryMeta[group.category].icon}
                </span>
                {!isMenuCollapsed ? (
                  <span className="truncate">{getCategoryLabel(group.category, language)}</span>
                ) : null}
              </button>
              {!isMenuCollapsed ? (
                <button
                  type="button"
                  className="inline-flex size-6 shrink-0 cursor-pointer self-center items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  onClick={() => onToggleCategory(group.category)}
                  aria-label={
                    collapsedCategories.has(group.category)
                      ? ui.expandCategory
                      : ui.collapseCategory
                  }
                >
                  <ChevronDown
                    className={`size-4 transition ${
                      collapsedCategories.has(group.category) ? '-rotate-90' : ''
                    }`}
                  />
                </button>
              ) : null}
            </div>
            {!collapsedCategories.has(group.category) ? (
              <nav
                className="grid gap-1.5"
                aria-label={`${ui.menu} ${getCategoryLabel(group.category, language)}`}
              >
                {group.tools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    compact={isMenuCollapsed}
                    isActive={tool.id === activeToolId && viewType === 'tool'}
                    isFavorite={favoriteToolIdSet.has(tool.id)}
                    onSelect={onSelectTool}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </nav>
            ) : null}
          </section>
        ))}
      </div>

      {menuTools.length === 0 ? (
        <p className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
          {ui.noToolsFound}{' '}
          <strong>{searchTerm}</strong>
        </p>
      ) : null}
    </>
  )
}

interface HomeOverviewProps {
  favorites: ToolDefinition[]
  latest: ReleaseNote
  showLatestRelease: boolean
  onDismissLatestRelease: () => void
  onSelectCategory: (category: ToolCategory) => void
  onSelectTool: (toolId: ToolId) => void
}

function HomeOverview({
  favorites,
  latest,
  showLatestRelease,
  onDismissLatestRelease,
  onSelectCategory,
  onSelectTool,
}: HomeOverviewProps) {
  const { language } = useI18n()
  const ui = getI18nCopy(language, 'toolRegistry')
  const activeCategories = useMemo(() => {
    const categoriesWithTools = new Set<ToolCategory>(tools.map((tool) => tool.category))
    return categoryOrder.filter((category) => categoriesWithTools.has(category))
  }, [])

  return (
    <section className="grid gap-5">
      {showLatestRelease ? (
        <section className="rounded-xl border border-teal-300/70 bg-teal-50/80 p-3 dark:border-teal-500/40 dark:bg-teal-950/25">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">
                {ui.whatsNew} {latest.version} - {latest.date}
              </p>
              <h2 className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                {latest.title}
              </h2>
            </div>
            <button
              type="button"
              className="rounded-lg border border-teal-300 bg-white px-2.5 py-1 text-xs font-semibold text-teal-700 transition hover:bg-teal-100 dark:border-teal-500/40 dark:bg-slate-900 dark:text-teal-300 dark:hover:bg-teal-950/35"
              onClick={onDismissLatestRelease}
            >
              {ui.hide}
            </button>
          </div>
          <ul className="mt-3 grid gap-1 text-sm text-slate-700 dark:text-slate-200">
            {latest.changes.slice(0, 3).map((change) => (
              <li key={change}>• {change}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{ui.categories}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {activeCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-500 dark:hover:text-cyan-300"
            >
              <span
                className={`inline-flex size-5 shrink-0 items-center justify-center rounded ${categoryMeta[category].badgeClass}`}
              >
                {categoryMeta[category].icon}
              </span>
              {getCategoryLabel(category, language)}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{ui.favorites}</h2>
        {favorites.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {favorites.map((tool) => (
              <button
                key={tool.id}
                type="button"
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-cyan-500 dark:hover:text-cyan-300"
                onClick={() => onSelectTool(tool.id)}
              >
                {tool.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {ui.noPinnedFavorites}
          </p>
        )}
      </section>
    </section>
  )
}

interface CategoryOverviewProps {
  toolsByCategory: ToolDefinition[]
  favoriteToolIds: ToolId[]
  onSelectTool: (toolId: ToolId) => void
  onToggleFavorite: (toolId: ToolId) => void
}

function CategoryOverview({
  toolsByCategory,
  favoriteToolIds,
  onSelectTool,
  onToggleFavorite,
}: CategoryOverviewProps) {
  const { language } = useI18n()
  const ui = getI18nCopy(language, 'toolRegistry')
  const favoriteToolIdSet = useMemo(() => new Set(favoriteToolIds), [favoriteToolIds])

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 [content-visibility:auto] [contain-intrinsic-size:740px]">
      {toolsByCategory.map((tool) => (
        <article
          key={tool.id}
          className="grid min-h-[152px] grid-rows-[auto_1fr_auto] rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-sm shadow-slate-900/5 transition hover:border-cyan-300/80 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-cyan-500/40"
        >
          <div className="mb-1 flex items-center justify-between gap-2">
            <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              {tool.name}
            </h3>
            <span className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              v{tool.version}
            </span>
          </div>

          <p className="overflow-hidden text-xs leading-relaxed text-slate-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] dark:text-slate-300">
            {tool.description}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleFavorite(tool.id)}
              className={`inline-flex cursor-pointer items-center rounded-md border px-2 py-1 text-[11px] font-semibold transition ${
                favoriteToolIdSet.has(tool.id)
                  ? 'border-amber-300/60 bg-amber-50 text-amber-700 dark:border-amber-400/60 dark:bg-amber-900/30 dark:text-amber-200'
                  : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {favoriteToolIdSet.has(tool.id) ? ui.favorite : ui.pin}
            </button>
            <button
              type="button"
              className="inline-flex cursor-pointer items-center rounded-md border border-cyan-300 bg-cyan-50 px-2 py-1 text-[11px] font-semibold text-cyan-700 transition hover:border-cyan-400 hover:bg-cyan-100 dark:border-cyan-500/40 dark:bg-cyan-900/20 dark:text-cyan-200 dark:hover:bg-cyan-900/30"
              onClick={() => onSelectTool(tool.id)}
            >
              {ui.open}
            </button>
          </div>
        </article>
      ))}
    </section>
  )
}

export function ToolList() {
  const { language, setLanguage } = useI18n()
  const { themeMode, setThemeMode } = useTheme()
  const ui = getI18nCopy(language, 'toolRegistry')
  const toolContentRef = useRef<HTMLDivElement | null>(null)
  const [view, setView] = useState<ViewState>(() => parseViewFromPath(window.location.pathname))
  const [favoriteToolIds, setFavoriteToolIds] = useState<ToolId[]>(getInitialFavorites)
  const [seenReleaseVersion, setSeenReleaseVersion] = useState<string | null>(
    getInitialSeenReleaseVersion,
  )
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDesktopMenuPinned, setIsDesktopMenuPinned] = useState(true)
  const [isDesktopMenuCollapsed, setIsDesktopMenuCollapsed] = useState(false)
  const [collapsedCategories, setCollapsedCategories] = useState<Set<ToolCategory>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  const localizedTools = useMemo(
    () => tools.map((tool) => localizeTool(tool, language)),
    [language],
  )
  const localizedToolById = useMemo(
    () => new Map(localizedTools.map((tool) => [tool.id, tool])),
    [localizedTools],
  )

  const activeTool = useMemo(
    () => (view.type === 'tool' ? (toolById.get(view.toolId) ?? null) : null),
    [view],
  )
  const activeToolLocalized = useMemo(
    () => (activeTool ? (localizedToolById.get(activeTool.id) ?? activeTool) : null),
    [activeTool, localizedToolById],
  )
  const favoriteSet = useMemo(() => new Set(favoriteToolIds), [favoriteToolIds])
  const isActiveToolFavorite = !!activeTool && favoriteSet.has(activeTool.id)

  const selectedCategory = useMemo<ToolCategory | null>(() => {
    if (view.type === 'category') {
      return view.category
    }

    if (view.type === 'tool' && activeTool) {
      return activeTool.category
    }

    return null
  }, [view, activeTool])

  const deferredSearchTerm = useDeferredValue(searchTerm)
  const normalizedSearch = deferredSearchTerm.trim().toLowerCase()
  const filteredTools = useMemo(() => {
    if (!normalizedSearch) {
      return localizedTools
    }

    const filteredTools: ToolDefinition[] = []

    for (const tool of localizedTools) {
      const filterTarget = `${tool.name} ${tool.description}`.toLowerCase()
      if (filterTarget.includes(normalizedSearch)) {
        filteredTools.push(tool)
      }
    }

    return filteredTools
  }, [localizedTools, normalizedSearch])

  const favoriteTools = useMemo(
    () =>
      favoriteToolIds
        .map((toolId) => localizedToolById.get(toolId))
        .filter(Boolean) as ToolDefinition[],
    [favoriteToolIds, localizedToolById],
  )
  const showLatestRelease = seenReleaseVersion !== latestRelease.version

  const toolsForSelectedCategory = useMemo(() => {
    if (!selectedCategory) {
      return []
    }
    return localizedTools.filter((tool) => tool.category === selectedCategory)
  }, [localizedTools, selectedCategory])
  const ActiveToolComponent = useMemo(
    () => (activeTool ? toolComponentById[activeTool.id] ?? null : null),
    [activeTool],
  )

  useEffect(() => {
    const onPopState = () => {
      setView(parseViewFromPath(window.location.pathname))
      setIsMobileMenuOpen(false)
    }

    window.addEventListener('popstate', onPopState)

    return () => {
      window.removeEventListener('popstate', onPopState)
    }
  }, [])

  useEffect(() => {
    const parsed = parseViewFromPath(window.location.pathname)
    const canonicalPath = toAppAbsolutePath(viewToPath(parsed, language))
    const normalizedCanonicalPath = normalizePath(canonicalPath)
    const currentPath = normalizePath(window.location.pathname)

    if (currentPath !== normalizedCanonicalPath) {
      window.history.replaceState({}, '', canonicalPath)
    }
  }, [language])

  useEffect(() => {
    if (view.type !== 'tool') {
      return
    }

    const root = toolContentRef.current
    if (!root) {
      return
    }

    const translate = () => {
      applyDomTranslations(root, language)
    }

    let queuedFrame: number | null = null
    const scheduleTranslate = () => {
      if (queuedFrame !== null) {
        return
      }
      queuedFrame = window.requestAnimationFrame(() => {
        queuedFrame = null
        translate()
      })
    }

    const frameId = window.requestAnimationFrame(translate)
    const observer = new MutationObserver(() => {
      scheduleTranslate()
    })
    observer.observe(root, {
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()
      if (queuedFrame !== null) {
        window.cancelAnimationFrame(queuedFrame)
      }
      window.cancelAnimationFrame(frameId)
    }
  }, [language, view.type, activeTool?.id])

  useEffect(() => {
    window.localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify({
        version: FAVORITES_STORAGE_VERSION,
        ids: favoriteToolIds,
      }),
    )
  }, [favoriteToolIds])

  useEffect(() => {
    if (!seenReleaseVersion) {
      window.localStorage.removeItem(RELEASE_SEEN_KEY)
      return
    }

    window.localStorage.setItem(RELEASE_SEEN_KEY, seenReleaseVersion)
  }, [seenReleaseVersion])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const scrollMainToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navigateTo = (path: string) => {
    const nextPath = toAppAbsolutePath(path)
    const currentPath = normalizePath(window.location.pathname)

    if (nextPath !== currentPath) {
      window.history.pushState({}, '', nextPath)
    }

    setView(parseViewFromPath(nextPath))
    setIsMobileMenuOpen(false)
    window.requestAnimationFrame(scrollMainToTop)
  }

  const toggleFavorite = (toolId: ToolId) => {
    setFavoriteToolIds((currentFavorites) =>
      currentFavorites.includes(toolId)
        ? currentFavorites.filter((id) => id !== toolId)
        : [...currentFavorites, toolId],
    )
  }

  const toggleCategory = (category: ToolCategory) => {
    setCollapsedCategories((current) => {
      const next = new Set(current)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const expandCategory = (category: ToolCategory) => {
    setCollapsedCategories((current) => {
      if (!current.has(category)) {
        return current
      }
      const next = new Set(current)
      next.delete(category)
      return next
    })
  }

  const goHome = () => {
    navigateTo('/')
  }

  const selectCategory = (category: ToolCategory) => {
    navigateTo(getCategoryPath(category, language))
  }

  const selectTool = (toolId: ToolId) => {
    navigateTo(getToolPath(toolId, language))
  }

  const cycleThemeMode = () => {
    setThemeMode((currentMode) => {
      if (currentMode === 'light') {
        return 'dark'
      }
      if (currentMode === 'dark') {
        return 'system'
      }
      return 'light'
    })
  }

  const toggleDesktopMenuPinned = () => {
    setIsDesktopMenuPinned((current) => {
      const next = !current
      if (next) {
        setIsMobileMenuOpen(false)
      }
      return next
    })
  }

  return (
    <section className="relative z-10 flex min-h-[100dvh] w-full flex-col [--app-header-h:64px] lg:h-[100dvh] lg:overflow-hidden">
      <header className="sticky top-0 z-20 flex min-h-[var(--app-header-h)] items-center gap-3 border-b border-slate-200/80 bg-white/85 px-3 py-2 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80 sm:px-4">
        <button
          type="button"
          className={`inline-flex size-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 ${
            isDesktopMenuPinned ? 'lg:hidden' : ''
          }`}
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label={ui.openMenu}
        >
          <Menu className="size-4" />
        </button>
        {!isDesktopMenuPinned ? (
          <button
            type="button"
            className="hidden cursor-pointer items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 lg:inline-flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={toggleDesktopMenuPinned}
            aria-label={ui.pinMenu}
          >
            <Pin className="size-3.5" />
            {ui.pin}
          </button>
        ) : null}

        <button
          type="button"
          className="inline-flex min-w-0 cursor-pointer items-center gap-2 rounded-xl px-1 py-1 text-left transition hover:bg-slate-100/80 dark:hover:bg-slate-800/70"
          onClick={goHome}
          aria-label={ui.goHome}
        >
          <img
            src={`${import.meta.env.BASE_URL}logo.svg`}
            alt="Logo Developer Tools"
            className="size-8 shrink-0 rounded-xl ring-1 ring-slate-300/80 dark:ring-slate-600/70"
          />
          <span className="min-w-0">
            <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Developer Tools
            </span>
            <span className="block truncate text-xs font-semibold text-slate-900 dark:text-slate-100">{ui.controlCenter}</span>
          </span>
        </button>

        <label className="ml-auto hidden items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 md:inline-flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <span className="uppercase">{ui.language}</span>
          <select
            value={language}
            onChange={(event) => setLanguage(normalizeLanguage(event.target.value))}
            className="rounded border border-slate-300 bg-white px-1 py-0.5 text-xs dark:border-slate-600 dark:bg-slate-900"
          >
            {SUPPORTED_LANGUAGES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label} - {item.nativeName}
              </option>
            ))}
          </select>
        </label>

        <label className="hidden items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 md:inline-flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <span className="uppercase">{ui.theme}</span>
          <select
            value={themeMode}
            onChange={(event) => setThemeMode(event.target.value as 'light' | 'dark' | 'system')}
            className="rounded border border-slate-300 bg-white px-1 py-0.5 text-xs dark:border-slate-600 dark:bg-slate-900"
          >
            <option value="light">{ui.themeLight}</option>
            <option value="dark">{ui.themeDark}</option>
            <option value="system">{ui.themeSystem}</option>
          </select>
        </label>
        <button
          type="button"
          onClick={cycleThemeMode}
          className="inline-flex cursor-pointer items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 md:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          aria-label={ui.changeThemeMode}
        >
          {themeMode}
        </button>
      </header>

      <div
        className={`grid min-h-0 flex-1 ${
          isDesktopMenuPinned
            ? isDesktopMenuCollapsed
              ? 'lg:grid-cols-[82px_minmax(0,1fr)]'
              : 'lg:grid-cols-[280px_minmax(0,1fr)]'
            : 'lg:grid-cols-[minmax(0,1fr)]'
        } lg:h-[calc(100dvh-var(--app-header-h))]`}
      >
        <aside
          className={`hidden overflow-x-hidden border-r border-slate-200/80 bg-white/70 py-4 dark:border-slate-800 dark:bg-slate-950/55 lg:h-full lg:overflow-y-auto ${
            isDesktopMenuCollapsed ? 'px-2' : 'px-3'
          } ${
            isDesktopMenuPinned ? 'lg:block' : 'lg:hidden'
          }`}
        >
          <div
            className={`mb-3 flex items-center gap-2 ${
              isDesktopMenuCollapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            {!isDesktopMenuCollapsed ? (
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                <PanelLeft className="size-3.5" />
                {ui.navigation}
              </p>
            ) : null}
            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => setIsDesktopMenuCollapsed((value) => !value)}
                aria-label={isDesktopMenuCollapsed ? ui.expandMenu : ui.collapseMenu}
              >
                {isDesktopMenuCollapsed ? (
                  <ChevronsRight className="size-4" />
                ) : (
                  <ChevronsLeft className="size-4" />
                )}
              </button>
              {!isDesktopMenuCollapsed ? (
                <button
                  type="button"
                  className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  onClick={toggleDesktopMenuPinned}
                  aria-label={ui.unpinMenu}
                >
                  <PinOff className="size-4" />
                </button>
              ) : null}
            </div>
          </div>
          <SidebarContent
            favoriteToolIds={favoriteToolIds}
            menuTools={filteredTools}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            activeToolId={activeTool?.id ?? null}
            viewType={view.type}
            isMenuCollapsed={isDesktopMenuCollapsed}
            collapsedCategories={collapsedCategories}
            onSelectCategory={selectCategory}
            onSelectTool={selectTool}
            onToggleFavorite={toggleFavorite}
            onToggleCategory={toggleCategory}
            onExpandCategory={expandCategory}
            onSearchTermChange={setSearchTerm}
            onClearSearch={() => setSearchTerm('')}
          />
        </aside>

        <main className="min-w-0 overflow-x-clip px-3 py-3 lg:h-full lg:overflow-y-auto lg:px-6 lg:py-5">
          <section className="mb-4 border-b border-slate-200/80 pb-3 dark:border-slate-700">
            <div className="inline-flex flex-wrap items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.11em] text-slate-500 dark:text-slate-400">
              <button
                type="button"
                className="cursor-pointer hover:text-cyan-700 dark:hover:text-cyan-300"
                onClick={goHome}
              >
                {ui.home}
              </button>
              {selectedCategory ? (
                <>
                  <span>/</span>
                  <button
                    type="button"
                    className="cursor-pointer hover:text-cyan-700 dark:hover:text-cyan-300"
                    onClick={() => selectCategory(selectedCategory)}
                  >
                    {getCategoryLabel(selectedCategory, language)}
                  </button>
                </>
              ) : null}
            </div>

            <div className="mt-2 flex items-start gap-3">
              {activeTool ? (
                <button
                  type="button"
                  className={`inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition ${
                    isActiveToolFavorite
                      ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/50 dark:bg-amber-900/25 dark:text-amber-200'
                      : 'border-slate-300 bg-white text-slate-500 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-slate-100'
                  }`}
                  onClick={() => toggleFavorite(activeTool.id)}
                  aria-label={isActiveToolFavorite ? ui.removeFavorite : ui.pinFavorite}
                >
                  <Star className={`size-4 ${isActiveToolFavorite ? 'fill-current' : ''}`} />
                </button>
              ) : null}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">
                    {view.type === 'home'
                      ? ui.mainDashboard
                      : (activeToolLocalized?.name ??
                        (selectedCategory ? getCategoryLabel(selectedCategory, language) : null))}
                  </h1>
                  {activeTool ? (
                    <span className="rounded border border-slate-300/80 bg-slate-100/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300">
                      v{activeTool.version}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {view.type === 'home'
                    ? ui.statusSummary
                    : (activeToolLocalized?.description ??
                      (selectedCategory
                        ? getCategoryDescription(selectedCategory, language)
                        : ui.selectFromMenu))}
                </p>
              </div>
            </div>
          </section>

          {view.type === 'home' ? (
            <HomeOverview
              favorites={favoriteTools}
              latest={latestRelease}
              showLatestRelease={showLatestRelease}
              onDismissLatestRelease={() => setSeenReleaseVersion(latestRelease.version)}
              onSelectCategory={selectCategory}
              onSelectTool={selectTool}
            />
          ) : null}

          {view.type === 'category' && selectedCategory ? (
            <CategoryOverview
              toolsByCategory={toolsForSelectedCategory}
              favoriteToolIds={favoriteToolIds}
              onSelectTool={selectTool}
              onToggleFavorite={toggleFavorite}
            />
          ) : null}

          {view.type === 'tool' && ActiveToolComponent ? (
            <div ref={toolContentRef} className="tool-content min-w-0">
              <ToolErrorBoundary>
                <Suspense
                  fallback={
                    <section className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                      {ui.loadingTool}
                    </section>
                  }
                >
                  <ActiveToolComponent />
                </Suspense>
              </ToolErrorBoundary>
            </div>
          ) : null}
        </main>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-slate-950/60 transition ${
          isDesktopMenuPinned ? 'lg:hidden' : ''
        } ${
          isMobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <aside
        className={`fixed left-0 top-0 z-50 h-[100dvh] max-h-[100dvh] w-[86vw] max-w-[360px] overflow-y-auto overflow-x-hidden overscroll-contain border-r border-slate-200 bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-[calc(env(safe-area-inset-top)+1rem)] shadow-2xl transition-transform duration-300 touch-pan-y dark:border-slate-700 dark:bg-slate-950 ${
          isDesktopMenuPinned ? 'lg:hidden' : ''
        } ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            <PanelLeft className="size-3.5" />
            {ui.menu}
          </p>
          <div className="inline-flex items-center gap-1">
            {!isDesktopMenuPinned ? (
              <button
                type="button"
                className="inline-flex size-8 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                onClick={toggleDesktopMenuPinned}
                aria-label={ui.pinMenu}
              >
                <Pin className="size-4" />
              </button>
            ) : null}
            <button
              type="button"
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label={ui.closeMenu}
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <SidebarContent
          favoriteToolIds={favoriteToolIds}
          menuTools={filteredTools}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          activeToolId={activeTool?.id ?? null}
          viewType={view.type}
          isMenuCollapsed={false}
          collapsedCategories={collapsedCategories}
          onSelectCategory={selectCategory}
          onSelectTool={selectTool}
          onToggleFavorite={toggleFavorite}
          onToggleCategory={toggleCategory}
          onExpandCategory={expandCategory}
          onSearchTermChange={setSearchTerm}
          onClearSearch={() => setSearchTerm('')}
        />
      </aside>
    </section>
  )
}










