import { describe, expect, it } from 'vitest'
import { convertDateTime } from '@/shared/lib/datetime'

describe('datetime tools', () => {
  it('convierte y retorna iso/unix', () => {
    const result = convertDateTime('2026-01-10T10:00:00Z', 'UTC', 'America/Argentina/Buenos_Aires')

    expect(result.iso).toContain('2026-01-10T10:00:00.000Z')
    expect(result.unixSeconds).toBeGreaterThan(0)
  })
})
