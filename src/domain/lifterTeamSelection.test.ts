import { describe, expect, test } from 'vitest'
import type { Team } from '../models/Team'
import { getLifterEntryTeamLabel, resolveLifterEntryTeam } from './lifterTeamSelection'

const regular: Team = {
  id: 1, meetId: 'meet', name: 'Abilene Cooper', region: null, classification: null,
}
const bTeam: Team = { ...regular, id: 2, isBTeam: true }

describe('lifter entry team selection', () => {
  test('resolves a division team with trimmed, case-insensitive input', () => {
    expect(resolveLifterEntryTeam(' abilene COOPER ', [regular, bTeam])).toBe(regular)
  })

  test('distinguishes regular and B teams with the same school name', () => {
    expect(getLifterEntryTeamLabel(bTeam)).toBe('Abilene Cooper (B Team)')
    expect(resolveLifterEntryTeam('Abilene Cooper (B Team)', [regular, bTeam])).toBe(bTeam)
    expect(resolveLifterEntryTeam('Abilene Cooper', [bTeam])).toBeUndefined()
  })

  test('rejects blank, partial, or unavailable names rather than assigning the wrong team', () => {
    expect(resolveLifterEntryTeam('', [regular])).toBeUndefined()
    expect(resolveLifterEntryTeam('Cooper', [regular])).toBeUndefined()
    expect(resolveLifterEntryTeam('Abilene Cooper', [])).toBeUndefined()
  })

  test('rejects ambiguous labels', () => {
    expect(resolveLifterEntryTeam('Abilene Cooper', [regular, { ...regular, id: 3 }])).toBeUndefined()
  })
})
