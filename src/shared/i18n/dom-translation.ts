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
  { es: 'JSON a tabla', en: 'JSON to table', pt: 'JSON para tabela' },
  {
    es: 'Modo plano (default) o modo anidado con subtablas para listas y objetos complejos.',
    en: 'Flat mode (default) or nested mode with subtables for lists and complex objects.',
    pt: 'Modo plano (padrao) ou modo aninhado com subtabelas para listas e objetos complexos.',
  },
  { es: 'Tabla plana (default)', en: 'Flat table (default)', pt: 'Tabela plana (padrao)' },
  { es: 'Tabla anidada (subtablas)', en: 'Nested table (subtables)', pt: 'Tabela aninhada (subtabelas)' },
  { es: 'JSON de entrada', en: 'Input JSON', pt: 'JSON de entrada' },
  { es: 'Preview tabla', en: 'Table preview', pt: 'Visualizacao da tabela' },
  { es: 'Exportar CSV', en: 'Export CSV', pt: 'Exportar CSV' },
  { es: 'Exportar Excel', en: 'Export Excel', pt: 'Exportar Excel' },
  { es: 'fila(s) raiz con render anidado', en: 'root row(s) with nested rendering', pt: 'linha(s) raiz com renderizacao aninhada' },
  { es: 'Fila', en: 'Row', pt: 'Linha' },
  { es: 'Estructura', en: 'Structure', pt: 'Estrutura' },
  {
    es: 'Exportacion CSV/Excel usa el modo plano para mantener una matriz tabular compatible.',
    en: 'CSV/Excel export uses flat mode to keep a compatible tabular matrix.',
    pt: 'A exportacao CSV/Excel usa o modo plano para manter uma matriz tabular compativel.',
  },
  { es: 'Base64 Texto', en: 'Base64 Text', pt: 'Base64 Texto' },
  { es: 'Base64 a imagen', en: 'Base64 to image', pt: 'Base64 para imagem' },
  { es: 'Base64 a PDF', en: 'Base64 to PDF', pt: 'Base64 para PDF' },
  {
    es: 'Ejemplo: ["data:application/pdf;base64,...", "..."]',
    en: 'Example: ["data:application/pdf;base64,...", "..."]',
    pt: 'Exemplo: ["data:application/pdf;base64,...", "..."]',
  },
  {
    es: 'Ejemplo: ["data:image/png;base64,...", "..."]',
    en: 'Example: ["data:image/png;base64,...", "..."]',
    pt: 'Exemplo: ["data:image/png;base64,...", "..."]',
  },
  { es: 'Visualizador JWT', en: 'JWT viewer', pt: 'Visualizador JWT' },
  {
    es: 'Decodifica el token localmente y permite validar firma con clave secreta (HS256/384/512).',
    en: 'Decode the token locally and validate signature with a secret key (HS256/384/512).',
    pt: 'Decodifica o token localmente e permite validar assinatura com chave secreta (HS256/384/512).',
  },
  { es: 'Clave secreta', en: 'Secret key', pt: 'Chave secreta' },
  {
    es: 'Ingresa una clave para validar firma (algoritmos HS*).',
    en: 'Enter a key to validate signature (HS* algorithms).',
    pt: 'Informe uma chave para validar a assinatura (algoritmos HS*).',
  },
  {
    es: 'El token es invalido. Corrige el JWT antes de validar firma.',
    en: 'The token is invalid. Fix the JWT before validating signature.',
    pt: 'O token e invalido. Corrija o JWT antes de validar a assinatura.',
  },
  { es: 'Ej: mi-clave-secreta', en: 'Eg: my-secret-key', pt: 'Ex: minha-chave-secreta' },
  { es: 'JWT Builder (HS256)', en: 'JWT Builder (HS256)', pt: 'JWT Builder (HS256)' },
  {
    es: 'Crea JWT localmente con header/payload custom y firma HS256 usando clave secreta.',
    en: 'Create JWT locally with custom header/payload and HS256 signature using a secret key.',
    pt: 'Crie JWT localmente com header/payload customizado e assinatura HS256 usando chave secreta.',
  },
  { es: 'Header JSON', en: 'JSON header', pt: 'Header JSON' },
  { es: 'Payload JSON', en: 'JSON payload', pt: 'Payload JSON' },
  { es: 'No se pudo generar JWT.', en: 'Could not generate JWT.', pt: 'Nao foi possivel gerar JWT.' },
  { es: 'JSON a clases', en: 'JSON to classes', pt: 'JSON para classes' },
  { es: 'Nombre raiz', en: 'Root name', pt: 'Nome raiz' },
  { es: 'Usar ejemplo', en: 'Use example', pt: 'Usar exemplo' },
  { es: 'Clase generada', en: 'Generated class', pt: 'Classe gerada' },
  { es: 'Formateador JSON', en: 'JSON formatter', pt: 'Formatador JSON' },
  {
    es: 'La entrada y salida permanecen en tu navegador. Soporta ref/$ref y referencias por $id.',
    en: 'Input and output stay in your browser. Supports ref/$ref and references by $id.',
    pt: 'Entrada e saida permanecem no seu navegador. Suporta ref/$ref e referencias por $id.',
  },
  { es: 'Salida JSON ampliada', en: 'Expanded JSON output', pt: 'Saida JSON expandida' },
  { es: 'refs resueltas', en: 'resolved refs', pt: 'refs resolvidas' },
  { es: 'refs sin resolver', en: 'unresolved refs', pt: 'refs nao resolvidas' },
  { es: 'Error en linea', en: 'Error at line', pt: 'Erro na linha' },
  { es: 'No hay JSON valido para exportar', en: 'No valid JSON to export', pt: 'Nao ha JSON valido para exportar' },
  { es: 'Entrada minificada', en: 'Input minified', pt: 'Entrada minificada' },
  { es: 'No se pudo minificar entrada', en: 'Could not minify input', pt: 'Nao foi possivel minificar a entrada' },
  { es: 'No se pudo ordenar', en: 'Could not sort', pt: 'Nao foi possivel ordenar' },
  { es: 'JSON valido', en: 'Valid JSON', pt: 'JSON valido' },
  { es: 'JSON invalido', en: 'Invalid JSON', pt: 'JSON invalido' },
  { es: 'Regenerar', en: 'Regenerate', pt: 'Regenerar' },
  { es: 'Validar UUID v4', en: 'Validate UUID v4', pt: 'Validar UUID v4' },
  { es: 'Pega un UUID...', en: 'Paste a UUID...', pt: 'Cole um UUID...' },
  { es: 'UUID valido.', en: 'Valid UUID.', pt: 'UUID valido.' },
  { es: 'UUID invalido.', en: 'Invalid UUID.', pt: 'UUID invalido.' },
  { es: 'SQL formateado', en: 'Formatted SQL', pt: 'SQL formatado' },
  { es: 'Entrada y modo intercambiados', en: 'Input and mode swapped', pt: 'Entrada e modo invertidos' },
  { es: 'Por ahora puedes usar la herramienta Formateador JSON desde el menu.', en: 'For now you can use the JSON Formatter tool from the menu.', pt: 'Por enquanto voce pode usar a ferramenta Formatador JSON pelo menu.' },
  { es: 'Visualizador JSON', en: 'JSON viewer', pt: 'Visualizador JSON' },
  { es: 'Filtrar por clave, ruta o valor...', en: 'Filter by key, path or value...', pt: 'Filtrar por chave, rota ou valor...' },
  { es: 'Arbol', en: 'Tree', pt: 'Arvore' },
  { es: 'Grafo', en: 'Graph', pt: 'Grafo' },
  { es: 'Expandir todo', en: 'Expand all', pt: 'Expandir tudo' },
  { es: 'Colapsar todo', en: 'Collapse all', pt: 'Recolher tudo' },
  { es: 'Pantalla completa', en: 'Fullscreen', pt: 'Tela cheia' },
  { es: 'Salir pantalla completa', en: 'Exit fullscreen', pt: 'Sair da tela cheia' },
  { es: 'Expandir nodo', en: 'Expand node', pt: 'Expandir no' },
  { es: 'Colapsar nodo', en: 'Collapse node', pt: 'Recolher no' },
  { es: 'Expandir seleccion', en: 'Expand selection', pt: 'Expandir selecao' },
  { es: 'Colapsar seleccion', en: 'Collapse selection', pt: 'Recolher selecao' },
  { es: 'Detalle nodo', en: 'Node details', pt: 'Detalhes do no' },
  { es: 'Conexiones hijas', en: 'Child connections', pt: 'Conexoes filhas' },
  { es: 'Sin hijos.', en: 'No children.', pt: 'Sem filhos.' },
  { es: 'Sin nodos para mostrar.', en: 'No nodes to display.', pt: 'Sem nos para exibir.' },
  { es: 'Ordenar', en: 'Sort', pt: 'Ordenar' },
  { es: 'Claves ordenadas', en: 'Keys sorted', pt: 'Chaves ordenadas' },
  { es: 'No hay filas para exportar', en: 'No rows to export', pt: 'Nao ha linhas para exportar' },
  { es: 'CSV exportado', en: 'CSV exported', pt: 'CSV exportado' },
  { es: 'Archivo Excel exportado', en: 'Excel file exported', pt: 'Arquivo Excel exportado' },
  { es: 'Validar', en: 'Validate', pt: 'Validar' },
  { es: 'Datos', en: 'Data', pt: 'Dados' },
  { es: 'Vista', en: 'View', pt: 'Visualizacao' },
  { es: 'Lineas', en: 'Lines', pt: 'Linhas' },
  { es: 'Sin lineas', en: 'No lines', pt: 'Sem linhas' },
  { es: 'No wrap', en: 'No wrap', pt: 'Sem quebra' },
  { es: 'Wrap', en: 'Wrap', pt: 'Quebra' },
  { es: 'Error en linea', en: 'Error at line', pt: 'Erro na linha' },
  { es: 'columna', en: 'column', pt: 'coluna' },
  { es: 'Cerrar', en: 'Close', pt: 'Fechar' },
  { es: 'Intercambiar', en: 'Swap', pt: 'Trocar' },
  { es: 'Entrada invalida para Base64.', en: 'Invalid Base64 input.', pt: 'Entrada invalida para Base64.' },
  { es: 'Convierte texto a camelCase, PascalCase, snake_case, kebab-case y otros formatos.', en: 'Convert text to camelCase, PascalCase, snake_case, kebab-case and other formats.', pt: 'Converta texto para camelCase, PascalCase, snake_case, kebab-case e outros formatos.' },
  { es: 'Codifica o decodifica HTML, Unicode escapes, Hex y URL-safe Base64.', en: 'Encode or decode HTML, Unicode escapes, Hex and URL-safe Base64.', pt: 'Codifique ou decodifique HTML, escapes Unicode, Hex e Base64 URL-safe.' },
  { es: 'No se pudo procesar el contenido.', en: 'Could not process content.', pt: 'Nao foi possivel processar o conteudo.' },
  { es: 'Entrada y modo intercambiados', en: 'Input and mode swapped', pt: 'Entrada e modo invertidos' },
  { es: 'Expresiones regulares', en: 'Regular expressions', pt: 'Expressoes regulares' },
  { es: 'Crea, prueba, debuggea y evalua regex con vista de matches/grupos y exportacion a C# o JavaScript.', en: 'Create, test, debug and evaluate regex with match/group view and export to C# or JavaScript.', pt: 'Crie, teste, depure e avalie regex com visualizacao de matches/grupos e exportacao para C# ou JavaScript.' },
  { es: 'Patron', en: 'Pattern', pt: 'Padrao' },
  { es: 'Texto de prueba', en: 'Test text', pt: 'Texto de teste' },
  { es: 'Plantilla de reemplazo', en: 'Replacement template', pt: 'Template de substituicao' },
  { es: 'Estado:', en: 'Status:', pt: 'Status:' },
  { es: 'Match encontrado', en: 'Match found', pt: 'Match encontrado' },
  { es: 'Sin coincidencias', en: 'No matches', pt: 'Sem correspondencias' },
  { es: 'Matches:', en: 'Matches:', pt: 'Matches:' },
  { es: 'Debug de matches', en: 'Match debug', pt: 'Debug de matches' },
  { es: 'Sin grupos.', en: 'No groups.', pt: 'Sem grupos.' },
  { es: 'No hay matches para el patron actual.', en: 'There are no matches for the current pattern.', pt: 'Nao ha matches para o padrao atual.' },
  { es: 'Resultado de reemplazo', en: 'Replacement result', pt: 'Resultado de substituicao' },
  { es: 'Explicador del patron', en: 'Pattern explainer', pt: 'Explicador do padrao' },
  { es: 'Diagrama de estados (aproximado)', en: 'State diagram (approximate)', pt: 'Diagrama de estados (aproximado)' },
  { es: 'Vista orientativa del flujo de evaluacion de la regex, con ramas y repeticiones.', en: 'Guided view of regex evaluation flow, with branches and repetitions.', pt: 'Visao orientativa do fluxo de avaliacao da regex, com ramificacoes e repeticoes.' },
  { es: 'Diagrama de estados de expresion regular', en: 'Regular expression state diagram', pt: 'Diagrama de estados de expressao regular' },
  { es: 'Exportar regex', en: 'Export regex', pt: 'Exportar regex' },
  { es: 'Expresion invalida.', en: 'Invalid expression.', pt: 'Expressao invalida.' },
  { es: 'Expresion invalida para exportar.', en: 'Invalid expression for export.', pt: 'Expressao invalida para exportar.' },
  { es: 'SQL a MongoDB', en: 'SQL to MongoDB', pt: 'SQL para MongoDB' },
  { es: 'Convierte SQL, o arma filtros estilo Compass, y exporta para distintos targets.', en: 'Convert SQL, or build Compass-style filters, and export to different targets.', pt: 'Converta SQL, ou monte filtros estilo Compass, e exporte para diferentes alvos.' },
  { es: 'Modo de armado', en: 'Build mode', pt: 'Modo de montagem' },
  { es: 'Desde SQL', en: 'From SQL', pt: 'A partir de SQL' },
  { es: 'Filtro tipo Compass', en: 'Compass-style filter', pt: 'Filtro estilo Compass' },
  { es: 'Salida', en: 'Output', pt: 'Saida' },
  { es: 'Ejemplos SQL (rapidos)', en: 'SQL examples (quick)', pt: 'Exemplos SQL (rapidos)' },
  { es: 'Aplicar ejemplo', en: 'Apply example', pt: 'Aplicar exemplo' },
  { es: 'Basicos', en: 'Basics', pt: 'Basicos' },
  { es: 'Fechas y rangos', en: 'Dates and ranges', pt: 'Datas e intervalos' },
  { es: 'Operadores', en: 'Operators', pt: 'Operadores' },
  { es: 'Consultas especiales', en: 'Special queries', pt: 'Consultas especiais' },
  { es: 'Filtro basico', en: 'Basic filter', pt: 'Filtro basico' },
  { es: 'Comparadores', en: 'Comparators', pt: 'Comparadores' },
  { es: 'Fecha exacta', en: 'Exact date', pt: 'Data exata' },
  { es: 'Rango por BETWEEN', en: 'Range with BETWEEN', pt: 'Intervalo por BETWEEN' },
  { es: 'Collection', en: 'Collection', pt: 'Colecao' },
  { es: 'Limit', en: 'Limit', pt: 'Limite' },
  { es: 'Filter (JSON)', en: 'Filter (JSON)', pt: 'Filtro (JSON)' },
  { es: 'Project (JSON)', en: 'Project (JSON)', pt: 'Projecao (JSON)' },
  { es: 'Sort (JSON)', en: 'Sort (JSON)', pt: 'Ordenacao (JSON)' },
]

const SKIPPED_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE', 'PRE'])

type LanguageReplaceMap = Record<AppLanguage, Array<[string, string]>>
type LanguageTargetSet = Record<AppLanguage, Set<string>>

function replaceAll(value: string, from: string, to: string): string {
  return value.split(from).join(to)
}

function buildReplaceMaps(): LanguageReplaceMap {
  const maps = {
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

  return {
    es: Array.from(maps.es.entries()).sort((a, b) => b[0].length - a[0].length),
    en: Array.from(maps.en.entries()).sort((a, b) => b[0].length - a[0].length),
    pt: Array.from(maps.pt.entries()).sort((a, b) => b[0].length - a[0].length),
  }
}

function buildTargetSet(): LanguageTargetSet {
  return {
    es: new Set(TRANSLATIONS.map((entry) => entry.es)),
    en: new Set(TRANSLATIONS.map((entry) => entry.en)),
    pt: new Set(TRANSLATIONS.map((entry) => entry.pt)),
  }
}

const REPLACE_MAPS = buildReplaceMaps()
const TARGET_SET = buildTargetSet()

function translateString(value: string, language: AppLanguage): string {
  if (TARGET_SET[language].has(value.trim())) {
    return value
  }

  let result = value
  for (const [from, to] of REPLACE_MAPS[language]) {
    if (!result.includes(from)) {
      continue
    }
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
