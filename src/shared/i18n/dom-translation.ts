import type { AppLanguage } from '@/shared/i18n/config'

type TranslationEntry = {
  es: string
  en: string
  pt: string
}

const TRANSLATIONS: TranslationEntry[] = [
  { es: 'Generador de datos fake', en: 'Fake data generator', pt: 'Gerador de dados falsos' },
  {
    es: 'Genera JSON de prueba con nombres, emails, UUID y fechas.',
    en: 'Generate sample JSON with names, emails, UUID and dates.',
    pt: 'Gere JSON de teste com nomes, emails, UUID e datas.',
  },
  { es: 'Codificador URL', en: 'URL Encoder', pt: 'Codificador de URL' },
  { es: 'Codificar', en: 'Encode', pt: 'Codificar' },
  { es: 'Decodificar', en: 'Decode', pt: 'Decodificar' },
  { es: 'Copiar salida', en: 'Copy output', pt: 'Copiar saida' },
  { es: 'Entrada SQL', en: 'SQL input', pt: 'Entrada SQL' },
  { es: 'Entrada', en: 'Input', pt: 'Entrada' },
  { es: 'Salida', en: 'Output', pt: 'Saida' },
  { es: 'Base64 a imagen', en: 'Base64 to Image', pt: 'Base64 para imagem' },
  { es: 'Base64 a PDF', en: 'Base64 to PDF', pt: 'Base64 para PDF' },
  {
    es: 'Soporta una imagen o multiples. Formatos: una cadena por linea, data URL o array JSON.',
    en: 'Supports one or multiple images. Formats: one string per line, data URL or JSON array.',
    pt: 'Suporta uma ou varias imagens. Formatos: uma string por linha, data URL ou array JSON.',
  },
  {
    es: 'Soporta un PDF o multiples. Formatos: una cadena por linea, data URL o array JSON.',
    en: 'Supports one or multiple PDF files. Formats: one string per line, data URL or JSON array.',
    pt: 'Suporta um ou varios PDFs. Formatos: uma string por linha, data URL ou array JSON.',
  },
  {
    es: 'Entrada invalida. Usa string unico, data URL, una por linea, o array JSON.',
    en: 'Invalid input. Use single string, data URL, one per line, or JSON array.',
    pt: 'Entrada invalida. Use string unica, data URL, uma por linha, ou array JSON.',
  },
  { es: 'Descargar', en: 'Download', pt: 'Baixar' },
  { es: 'Copiar', en: 'Copy', pt: 'Copiar' },
  { es: 'Limpiar', en: 'Clear', pt: 'Limpar' },
  { es: 'Cargar archivo', en: 'Load file', pt: 'Carregar arquivo' },
  { es: 'Archivo no soportado. Usa .js o .css.', en: 'Unsupported file. Use .js or .css.', pt: 'Arquivo nao suportado. Use .js ou .css.' },
  { es: 'No se pudo leer el archivo.', en: 'Could not read the file.', pt: 'Nao foi possivel ler o arquivo.' },
  { es: 'No se pudo procesar contenido.', en: 'Could not process content.', pt: 'Nao foi possivel processar o conteudo.' },
  { es: 'Salida copiada', en: 'Output copied', pt: 'Saida copiada' },
  { es: 'Archivo descargado', en: 'File downloaded', pt: 'Arquivo baixado' },
  { es: 'Procesando JSON...', en: 'Processing JSON...', pt: 'Processando JSON...' },
  { es: 'Entrada JSON', en: 'JSON input', pt: 'Entrada JSON' },
  { es: 'Salida JSON', en: 'JSON output', pt: 'Saida JSON' },
  { es: 'Generar JWT', en: 'Generate JWT', pt: 'Gerar JWT' },
  { es: 'Firma valida para la clave ingresada.', en: 'Valid signature for the provided key.', pt: 'Assinatura valida para a chave informada.' },
  { es: 'Firma invalida para la clave ingresada.', en: 'Invalid signature for the provided key.', pt: 'Assinatura invalida para a chave informada.' },
  { es: 'No se pudo validar la firma.', en: 'Could not validate signature.', pt: 'Nao foi possivel validar a assinatura.' },
  { es: 'Generador UUID v4', en: 'UUID v4 Generator', pt: 'Gerador UUID v4' },
  { es: 'Genera identificadores y valida si cumplen formato UUID v4.', en: 'Generate identifiers and validate UUID v4 format.', pt: 'Gere identificadores e valide o formato UUID v4.' },
  { es: 'Vista previa lista', en: 'Preview ready', pt: 'Visualizacao pronta' },
  { es: 'Generando vista previa...', en: 'Generating preview...', pt: 'Gerando visualizacao...' },
  { es: 'Descargar README', en: 'Download README', pt: 'Baixar README' },
  { es: 'Copiar README', en: 'Copy README', pt: 'Copiar README' },
  { es: 'Cargando...', en: 'Loading...', pt: 'Carregando...' },
  { es: 'Cargando herramienta...', en: 'Loading tool...', pt: 'Carregando ferramenta...' },
  { es: 'Copiado al portapapeles', en: 'Copied to clipboard', pt: 'Copiado para a area de transferencia' },
  { es: 'Sin resultados', en: 'No results', pt: 'Sem resultados' },
  { es: 'Sin datos', en: 'No data', pt: 'Sem dados' },
  { es: 'Seleccionar archivo', en: 'Select file', pt: 'Selecionar arquivo' },
  { es: 'Selecciona un archivo', en: 'Select a file', pt: 'Selecione um arquivo' },
  { es: 'Seleccionar imagen', en: 'Select image', pt: 'Selecionar imagem' },
  { es: 'Selecciona una imagen', en: 'Select an image', pt: 'Selecione uma imagem' },
  { es: 'Seleccionar PDF', en: 'Select PDF', pt: 'Selecionar PDF' },
  { es: 'Selecciona un PDF', en: 'Select a PDF', pt: 'Selecione um PDF' },
  { es: 'Seleccionar', en: 'Select', pt: 'Selecionar' },
  { es: 'Generar', en: 'Generate', pt: 'Gerar' },
  { es: 'Convertir', en: 'Convert', pt: 'Converter' },
  { es: 'Procesar', en: 'Process', pt: 'Processar' },
  { es: 'Optimizar', en: 'Optimize', pt: 'Otimizar' },
  { es: 'Minificar', en: 'Minify', pt: 'Minificar' },
  { es: 'Expandir', en: 'Expand', pt: 'Expandir' },
  { es: 'Reiniciar', en: 'Reset', pt: 'Reiniciar' },
  { es: 'Restablecer', en: 'Reset', pt: 'Restabelecer' },
  { es: 'Previsualizar', en: 'Preview', pt: 'Visualizar' },
  { es: 'Vista previa', en: 'Preview', pt: 'Visualizacao' },
  { es: 'Resultado', en: 'Result', pt: 'Resultado' },
  { es: 'Herramienta', en: 'Tool', pt: 'Ferramenta' },
  { es: 'Herramientas', en: 'Tools', pt: 'Ferramentas' },
  { es: 'Opciones', en: 'Options', pt: 'Opcoes' },
  { es: 'Configuracion', en: 'Settings', pt: 'Configuracoes' },
  { es: 'Avanzado', en: 'Advanced', pt: 'Avancado' },
  { es: 'Ejemplo', en: 'Example', pt: 'Exemplo' },
  { es: 'Ejemplos', en: 'Examples', pt: 'Exemplos' },
  { es: 'Formato', en: 'Format', pt: 'Formato' },
  { es: 'Valido', en: 'Valid', pt: 'Valido' },
  { es: 'Invalido', en: 'Invalid', pt: 'Invalido' },
  { es: 'Correcto', en: 'Success', pt: 'Sucesso' },
  { es: 'Error de formato', en: 'Format error', pt: 'Erro de formato' },
  { es: 'Error de entrada', en: 'Input error', pt: 'Erro de entrada' },
]

const SKIPPED_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE', 'PRE'])

type LanguageReplaceMap = Record<AppLanguage, Map<string, string>>

function replaceAll(value: string, from: string, to: string): string {
  return value.split(from).join(to)
}

function buildReplaceMaps(): LanguageReplaceMap {
  const maps: LanguageReplaceMap = {
    es: new Map<string, string>(),
    en: new Map<string, string>(),
    pt: new Map<string, string>(),
  }

  for (const entry of TRANSLATIONS) {
    const variants: Record<AppLanguage, string> = {
      es: entry.es,
      en: entry.en,
      pt: entry.pt,
    }

    for (const targetLanguage of ['es', 'en', 'pt'] as const) {
      const targetValue = variants[targetLanguage]
      for (const sourceLanguage of ['es', 'en', 'pt'] as const) {
        const sourceValue = variants[sourceLanguage]
        if (sourceValue !== targetValue) {
          maps[targetLanguage].set(sourceValue, targetValue)
        }
      }
    }
  }

  return maps
}

const REPLACE_MAPS = buildReplaceMaps()

function translateString(value: string, language: AppLanguage): string {
  let result = value
  for (const [from, to] of REPLACE_MAPS[language]) {
    result = replaceAll(result, from, to)
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
