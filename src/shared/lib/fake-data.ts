interface FakeRecord {
  id: string
  name: string
  email: string
  date: string
}

const firstNames = ['Matti', 'Lucia', 'Juan', 'Carla', 'Pedro', 'Ana', 'Sofia', 'Diego']
const lastNames = ['Perez', 'Gomez', 'Fernandez', 'Lopez', 'Torres', 'Rossi', 'Suarez', 'Diaz']

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function randomDate(): string {
  const now = Date.now()
  const randomOffset = Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365)
  return new Date(now - randomOffset).toISOString()
}

export function generateFakeData(count: number): FakeRecord[] {
  const safeCount = Math.max(1, Math.min(count, 200))

  return Array.from({ length: safeCount }, (_, index) => {
    const firstName = randomItem(firstNames)
    const lastName = randomItem(lastNames)
    const fullName = `${firstName} ${lastName}`

    return {
      id: crypto.randomUUID(),
      name: fullName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index + 1}@mail.dev`,
      date: randomDate(),
    }
  })
}
