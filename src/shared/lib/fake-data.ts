export type FakeFieldType =
  | 'uuid'
  | 'firstName'
  | 'lastName'
  | 'fullName'
  | 'email'
  | 'date'
  | 'number'
  | 'boolean'
  | 'company'
  | 'country'
  | 'phone'

export interface FakeFieldSchema {
  key: string
  type: FakeFieldType
}

export const fakeFieldCatalog: Array<FakeFieldSchema & { label: string }> = [
  { key: 'id', type: 'uuid', label: 'UUID' },
  { key: 'firstName', type: 'firstName', label: 'Nombre' },
  { key: 'lastName', type: 'lastName', label: 'Apellido' },
  { key: 'name', type: 'fullName', label: 'Nombre completo' },
  { key: 'email', type: 'email', label: 'Email' },
  { key: 'createdAt', type: 'date', label: 'Fecha ISO' },
  { key: 'score', type: 'number', label: 'Numero' },
  { key: 'isActive', type: 'boolean', label: 'Booleano' },
  { key: 'company', type: 'company', label: 'Empresa' },
  { key: 'country', type: 'country', label: 'Pais' },
  { key: 'phone', type: 'phone', label: 'Telefono' },
]

const firstNames = ['Matti', 'Lucia', 'Juan', 'Carla', 'Pedro', 'Ana', 'Sofia', 'Diego']
const lastNames = ['Perez', 'Gomez', 'Fernandez', 'Lopez', 'Torres', 'Rossi', 'Suarez', 'Diaz']
const companies = ['Nova Labs', 'Skyline Tech', 'DataForge', 'PixelSoft', 'CloudRiver']
const countries = ['Argentina', 'Uruguay', 'Chile', 'Mexico', 'Colombia', 'Peru', 'Espana']

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function randomDate(): string {
  const now = Date.now()
  const randomOffset = Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365)
  return new Date(now - randomOffset).toISOString()
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomPhone(): string {
  return `+54 9 ${randomInt(100, 999)} ${randomInt(1000, 9999)}`
}

function defaultSchema(): FakeFieldSchema[] {
  return [
    { key: 'id', type: 'uuid' },
    { key: 'name', type: 'fullName' },
    { key: 'email', type: 'email' },
    { key: 'createdAt', type: 'date' },
  ]
}

export function generateFakeData(
  count: number,
  schema: FakeFieldSchema[] = defaultSchema(),
): Record<string, unknown>[] {
  const safeCount = Math.max(1, Math.min(count, 200))
  const safeSchema = schema.length > 0 ? schema : defaultSchema()

  return Array.from({ length: safeCount }, (_, index) => {
    const firstName = randomItem(firstNames)
    const lastName = randomItem(lastNames)
    const fullName = `${firstName} ${lastName}`
    const row: Record<string, unknown> = {}

    for (const field of safeSchema) {
      switch (field.type) {
        case 'uuid':
          row[field.key] = crypto.randomUUID()
          break
        case 'firstName':
          row[field.key] = firstName
          break
        case 'lastName':
          row[field.key] = lastName
          break
        case 'fullName':
          row[field.key] = fullName
          break
        case 'email':
          row[field.key] = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index + 1}@mail.dev`
          break
        case 'date':
          row[field.key] = randomDate()
          break
        case 'number':
          row[field.key] = randomInt(1, 1000)
          break
        case 'boolean':
          row[field.key] = Math.random() >= 0.5
          break
        case 'company':
          row[field.key] = randomItem(companies)
          break
        case 'country':
          row[field.key] = randomItem(countries)
          break
        case 'phone':
          row[field.key] = randomPhone()
          break
      }
    }

    return row
  })
}
