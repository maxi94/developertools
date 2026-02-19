export interface ConvertedCases {
  camelCase: string
  pascalCase: string
  snake_case: string
  kebab_case: string
  CONSTANT_CASE: string
  'Title Case': string
}

function capitalize(value: string): string {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value
}

function tokenize(input: string): string[] {
  if (!input.trim()) {
    return []
  }

  const normalized = input
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_\-\s]+/g, ' ')

  return normalized
    .split(/[^A-Za-z0-9]+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => chunk.toLowerCase())
}

export function convertCases(input: string): ConvertedCases {
  const words = tokenize(input)
  if (words.length === 0) {
    return {
      camelCase: '',
      pascalCase: '',
      snake_case: '',
      kebab_case: '',
      CONSTANT_CASE: '',
      'Title Case': '',
    }
  }

  const pascalWords = words.map(capitalize)

  return {
    camelCase: `${words[0]}${pascalWords.slice(1).join('')}`,
    pascalCase: pascalWords.join(''),
    snake_case: words.join('_'),
    kebab_case: words.join('-'),
    CONSTANT_CASE: words.map((word) => word.toUpperCase()).join('_'),
    'Title Case': pascalWords.join(' '),
  }
}
