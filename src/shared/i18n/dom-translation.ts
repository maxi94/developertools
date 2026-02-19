import type { AppLanguage } from '@/shared/i18n/config'

const TRANSLATION_PAIRS: Array<[string, string]> = [
  ['Generador de datos fake', 'Fake data generator'],
  ['Genera JSON de prueba con nombres, emails, UUID y fechas.', 'Generate sample JSON with names, emails, UUID and dates.'],
  ['Codificador URL', 'URL Encoder'],
  ['Codificar', 'Encode'],
  ['Decodificar', 'Decode'],
  ['Copiar salida', 'Copy output'],
  ['Entrada SQL', 'SQL input'],
  ['Entrada', 'Input'],
  ['Salida', 'Output'],
  ['Base64 a imagen', 'Base64 to Image'],
  ['Base64 a PDF', 'Base64 to PDF'],
  ['Soporta una imagen o multiples. Formatos: una cadena por linea, data URL o array JSON.', 'Supports one or multiple images. Formats: one string per line, data URL or JSON array.'],
  ['Soporta un PDF o multiples. Formatos: una cadena por linea, data URL o array JSON.', 'Supports one or multiple PDF files. Formats: one string per line, data URL or JSON array.'],
  ['Entrada invalida. Usa string unico, data URL, una por linea, o array JSON.', 'Invalid input. Use single string, data URL, one per line, or JSON array.'],
  ['Descargar', 'Download'],
  ['Copiar', 'Copy'],
  ['Limpiar', 'Clear'],
  ['Cargar archivo', 'Load file'],
  ['Archivo no soportado. Usa .js o .css.', 'Unsupported file. Use .js or .css.'],
  ['No se pudo leer el archivo.', 'Could not read the file.'],
  ['No se pudo procesar contenido.', 'Could not process content.'],
  ['Salida copiada', 'Output copied'],
  ['Archivo descargado', 'File downloaded'],
  ['Procesando JSON...', 'Processing JSON...'],
  ['Entrada JSON', 'JSON input'],
  ['Salida JSON', 'JSON output'],
  ['Generar JWT', 'Generate JWT'],
  ['Firma valida para la clave ingresada.', 'Valid signature for the provided key.'],
  ['Firma invalida para la clave ingresada.', 'Invalid signature for the provided key.'],
  ['No se pudo validar la firma.', 'Could not validate signature.'],
  ['Generador UUID v4', 'UUID v4 Generator'],
  ['Genera identificadores y valida si cumplen formato UUID v4.', 'Generate identifiers and validate UUID v4 format.'],
  ['Vista previa lista', 'Preview ready'],
  ['Generando vista previa...', 'Generating preview...'],
  ['Descargar README', 'Download README'],
  ['Copiar README', 'Copy README'],
  ['Cargando...', 'Loading...'],
  ['Cargando herramienta...', 'Loading tool...'],
  ['Copiado al portapapeles', 'Copied to clipboard'],
  ['Sin resultados', 'No results'],
  ['Sin datos', 'No data'],
  ['Seleccionar archivo', 'Select file'],
  ['Selecciona un archivo', 'Select a file'],
  ['Seleccionar imagen', 'Select image'],
  ['Selecciona una imagen', 'Select an image'],
  ['Seleccionar PDF', 'Select PDF'],
  ['Selecciona un PDF', 'Select a PDF'],
  ['Seleccionar', 'Select'],
  ['Generar', 'Generate'],
  ['Convertir', 'Convert'],
  ['Procesar', 'Process'],
  ['Optimizar', 'Optimize'],
  ['Minificar', 'Minify'],
  ['Expandir', 'Expand'],
  ['Reiniciar', 'Reset'],
  ['Restablecer', 'Reset'],
  ['Previsualizar', 'Preview'],
  ['Vista previa', 'Preview'],
  ['Resultado', 'Result'],
  ['Herramienta', 'Tool'],
  ['Herramientas', 'Tools'],
  ['Opciones', 'Options'],
  ['Configuracion', 'Settings'],
  ['Avanzado', 'Advanced'],
  ['Ejemplo', 'Example'],
  ['Ejemplos', 'Examples'],
  ['Formato', 'Format'],
  ['Valido', 'Valid'],
  ['Invalido', 'Invalid'],
  ['Correcto', 'Success'],
  ['Error de formato', 'Format error'],
  ['Error de entrada', 'Input error'],
]

const SKIPPED_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE', 'PRE'])

function replaceAll(value: string, from: string, to: string): string {
  return value.split(from).join(to)
}

function translateString(value: string, language: AppLanguage): string {
  let result = value
  for (const [es, en] of TRANSLATION_PAIRS) {
    result = language === 'en' ? replaceAll(result, es, en) : replaceAll(result, en, es)
  }
  return result
}

export function applyDomTranslations(root: HTMLElement, language: AppLanguage): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []

  while (walker.nextNode()) {
    const node = walker.currentNode as Text
    const parentTag = node.parentElement?.tagName
    if (!parentTag || SKIPPED_TAGS.has(parentTag)) {
      continue
    }
    textNodes.push(node)
  }

  for (const node of textNodes) {
    const current = node.nodeValue ?? ''
    const translated = translateString(current, language)
    if (translated !== current) {
      node.nodeValue = translated
    }
  }

  const elements = root.querySelectorAll<HTMLElement>('[placeholder],[title],[aria-label]')
  for (const element of elements) {
    for (const attribute of ['placeholder', 'title', 'aria-label'] as const) {
      const current = element.getAttribute(attribute)
      if (!current) {
        continue
      }
      const translated = translateString(current, language)
      if (translated !== current) {
        element.setAttribute(attribute, translated)
      }
    }
  }
}
