export type CodeLanguage = 'javascript' | 'css'
export type TransformMode = 'minify' | 'expand'

const JS_FILENAME = 'input.js'
const CSS_FILENAME = 'input.css'

let prettierPromise: Promise<typeof import('prettier/standalone')> | null = null
let babelPluginPromise: Promise<typeof import('prettier/plugins/babel')> | null = null
let estreePluginPromise: Promise<typeof import('prettier/plugins/estree')> | null = null
let postcssPluginPromise: Promise<typeof import('prettier/plugins/postcss')> | null = null
let babelParserPromise: Promise<typeof import('@babel/parser')> | null = null

function getPrettier() {
  if (!prettierPromise) {
    prettierPromise = import('prettier/standalone')
  }
  return prettierPromise
}

function getBabelPlugin() {
  if (!babelPluginPromise) {
    babelPluginPromise = import('prettier/plugins/babel')
  }
  return babelPluginPromise
}

function getEstreePlugin() {
  if (!estreePluginPromise) {
    estreePluginPromise = import('prettier/plugins/estree')
  }
  return estreePluginPromise
}

function getPostcssPlugin() {
  if (!postcssPluginPromise) {
    postcssPluginPromise = import('prettier/plugins/postcss')
  }
  return postcssPluginPromise
}

function getBabelParser() {
  if (!babelParserPromise) {
    babelParserPromise = import('@babel/parser')
  }
  return babelParserPromise
}

function isIdentifierBoundaryChar(char: string): boolean {
  return /[A-Za-z0-9_$]/.test(char)
}

function shouldInsertSpace(previousChunk: string, nextChunk: string): boolean {
  if (!previousChunk || !nextChunk) {
    return false
  }

  const previousLast = previousChunk.at(-1) ?? ''
  const nextFirst = nextChunk[0] ?? ''

  if (isIdentifierBoundaryChar(previousLast) && isIdentifierBoundaryChar(nextFirst)) {
    return true
  }

  if (
    (previousLast === '+' && nextFirst === '+') ||
    (previousLast === '-' && nextFirst === '-') ||
    (previousLast === '/' && (nextFirst === '/' || nextFirst === '*'))
  ) {
    return true
  }

  return false
}

function compactTokens(source: string, tokens: Array<{ start: number; end: number }>): string {
  let output = ''
  let previousChunk = ''

  for (const token of tokens) {
    const rawChunk = source.slice(token.start, token.end)
    if (!rawChunk) {
      continue
    }

    if (shouldInsertSpace(previousChunk, rawChunk)) {
      output += ' '
    }

    output += rawChunk
    previousChunk = rawChunk
  }

  return output.trim()
}

async function expandJavaScript(source: string): Promise<string> {
  const [prettier, babelPlugin, estreePlugin] = await Promise.all([
    getPrettier(),
    getBabelPlugin(),
    getEstreePlugin(),
  ])

  return prettier.format(source, {
    parser: 'babel',
    plugins: [babelPlugin, estreePlugin],
    printWidth: 90,
    tabWidth: 2,
    singleQuote: true,
    trailingComma: 'all',
    semi: false,
  })
}

async function expandCss(source: string): Promise<string> {
  const [prettier, postcssPlugin] = await Promise.all([getPrettier(), getPostcssPlugin()])

  return prettier.format(source, {
    parser: 'css',
    plugins: [postcssPlugin],
    printWidth: 90,
    tabWidth: 2,
    singleQuote: true,
  })
}

async function minifyJavaScript(source: string): Promise<string> {
  const { parse } = await getBabelParser()

  const ast = parse(source, {
    sourceType: 'unambiguous',
    allowReturnOutsideFunction: true,
    tokens: true,
    plugins: [
      'jsx',
      'typescript',
      'classProperties',
      'classPrivateProperties',
      'classPrivateMethods',
      'objectRestSpread',
      'topLevelAwait',
      'optionalChaining',
      'nullishCoalescingOperator',
    ],
  })

  const tokenList = (
    ast as unknown as {
      tokens?: Array<{ start: number; end: number }>
    }
  ).tokens

  if (!tokenList?.length) {
    return source.trim()
  }

  return compactTokens(source, tokenList)
}

function minifyCss(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim()
}

export async function transformCode(
  source: string,
  language: CodeLanguage,
  mode: TransformMode,
): Promise<string> {
  const trimmed = source.trim()
  if (!trimmed) {
    return ''
  }

  if (language === 'javascript') {
    if (mode === 'minify') {
      return minifyJavaScript(source)
    }
    return expandJavaScript(source)
  }

  if (mode === 'minify') {
    return minifyCss(source)
  }
  return expandCss(source)
}

export function getDownloadFileName(language: CodeLanguage, mode: TransformMode): string {
  const extension = language === 'javascript' ? 'js' : 'css'
  const suffix = mode === 'minify' ? 'min' : 'pretty'
  const baseName = language === 'javascript' ? JS_FILENAME : CSS_FILENAME
  const cleanBaseName = baseName.replace(/\.[^.]+$/, '')

  return `${cleanBaseName}.${suffix}.${extension}`
}
