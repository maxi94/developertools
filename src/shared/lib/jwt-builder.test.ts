import { describe, expect, it } from 'vitest'
import { buildJwtHs256 } from '@/shared/lib/jwt-builder'

describe('jwt builder', () => {
  it('genera token con 3 segmentos', async () => {
    const token = await buildJwtHs256('{"alg":"HS256"}', '{"sub":"123"}', 'secret')
    expect(token.split('.')).toHaveLength(3)
  })
})
