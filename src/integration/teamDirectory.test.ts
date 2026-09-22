import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  TeamDirectory, TEAM_DIRECTORY_URLS, completeTeamName,
  fetchTeamDirectory, getTeamAssociation, normalizeTeamNames,
  parseTeamDirectoryRecords,
} from './teamDirectory'
import type { TeamAssociation } from './teamDirectory'

function memoryStorage() {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value) },
  }
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('association team directory', () => {
  test('extracts only names from semicolon-separated four-field records', () => {
    expect(parseTeamDirectoryRecords('Valley,2,1,5A;Academy,1,2,3A'))
      .toEqual(['Academy', 'Valley'])
  })

  test('accepts empty metadata, trailing separators, and duplicate team names', () => {
    expect(parseTeamDirectoryRecords(' Academy ,,,;academy,2,1,3A;College Station A&M Cons,1,1,5A;'))
      .toEqual(['Academy', 'College Station A&M Cons'])
    expect(parseTeamDirectoryRecords('')).toEqual([])
  })

  test('rejects malformed records instead of treating metadata as team names', () => {
    expect(() => parseTeamDirectoryRecords('Academy,1,2')).toThrow('invalid team record')
    expect(() => parseTeamDirectoryRecords(',1,2,3A')).toThrow('invalid team record')
    expect(() => parseTeamDirectoryRecords('Academy,1,2,3A,unexpected')).toThrow('invalid team record')
  })

  test('ignores old caches that may contain misparsed metadata', () => {
    const storage = memoryStorage()
    storage.setItem('powerscore-team-directory-v1-THSPA', '["1","5A;Academy"]')
    expect(new TeamDirectory(storage).getNames('THSPA')).toEqual([])
  })

  test('maps each division to its association, sharing NMAA', () => {
    expect(getTeamAssociation('THSPA')).toBe('THSPA')
    expect(getTeamAssociation('THSWPA')).toBe('THSWPA')
    expect(getTeamAssociation('NMAA_BOYS')).toBe('NMAA')
    expect(getTeamAssociation('NMAA_GIRLS')).toBe('NMAA')
    expect(getTeamAssociation(undefined)).toBeUndefined()
  })

  test('cleans duplicate and empty names without losing punctuation or accents', () => {
    expect(normalizeTeamNames([' Alice ', '', 'alice', 'College Station A&M Cons', 'Española Valley']))
      .toEqual(['Alice', 'College Station A&M Cons', 'Española Valley'])
  })

  test('matches anywhere case-insensitively and allows exact or unlisted names', () => {
    const names = ['Abilene', 'Abilene Cooper', 'Alice']
    expect(completeTeamName('abi', names)).toBe('Abilene')
    expect(completeTeamName('ABILENE C', names)).toBe('Abilene Cooper')
    expect(completeTeamName('coo', names)).toBe('Abilene Cooper')
    expect(completeTeamName('PER', names)).toBe('Abilene Cooper')
    expect(completeTeamName('lene C', names)).toBe('Abilene Cooper')
    expect(completeTeamName('Abilene', names)).toBeUndefined()
    expect(completeTeamName('New School', names)).toBeUndefined()
    expect(completeTeamName('', names)).toBeUndefined()
  })

  test('uses saved lists immediately and refreshes only once per app instance', async () => {
    const storage = memoryStorage()
    storage.setItem('powerscore-team-directory-v2-THSPA', JSON.stringify(['Old School']))
    const loader = vi.fn(async (association: TeamAssociation) => [`${association} School`])
    const directory = new TeamDirectory(storage, loader)
    expect(directory.getNames('THSPA')).toEqual(['Old School'])
    await Promise.all([directory.refresh(), directory.refresh()])
    await directory.refresh()
    expect(loader).toHaveBeenCalledTimes(3)
    expect(directory.getNames('THSPA')).toEqual(['THSPA School'])
    expect(directory.getNames('THSWPA')).toEqual(['THSWPA School'])
    expect(directory.getNames('NMAA')).toEqual(['NMAA School'])
    const nextLoad = new TeamDirectory(storage, loader)
    expect(nextLoad.getNames('THSPA')).toEqual(['THSPA School'])
    await nextLoad.refresh()
    expect(loader).toHaveBeenCalledTimes(6)
  })

  test('preserves a failed associations cache while others update', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const storage = memoryStorage()
    storage.setItem('powerscore-team-directory-v2-THSPA', '["Saved School"]')
    const directory = new TeamDirectory(storage, async association => {
      if (association === 'THSPA') throw new Error('offline or CORS')
      return ['Fresh School']
    })
    const onUpdate = vi.fn()
    await directory.refresh(onUpdate)
    expect(directory.getNames('THSPA')).toEqual(['Saved School'])
    expect(storage.getItem('powerscore-team-directory-v2-THSPA')).toBe('["Saved School"]')
    expect(directory.getNames('THSWPA')).toEqual(['Fresh School'])
    expect(onUpdate).toHaveBeenCalledTimes(2)
  })

  test('ignores malformed caches independently', () => {
    const storage = memoryStorage()
    storage.setItem('powerscore-team-directory-v2-THSPA', '{broken')
    storage.setItem('powerscore-team-directory-v2-THSWPA', '[12]')
    storage.setItem('powerscore-team-directory-v2-NMAA', '["Academy"]')
    const directory = new TeamDirectory(storage)
    expect(directory.getNames('THSPA')).toEqual([])
    expect(directory.getNames('THSWPA')).toEqual([])
    expect(directory.getNames('NMAA')).toEqual(['Academy'])
  })

  test('continues in memory when storage is blocked', async () => {
    const storage = {
      getItem: () => { throw new Error('blocked') },
      setItem: () => { throw new Error('full') },
    }
    const directory = new TeamDirectory(storage, async () => ['School'])
    await directory.refresh()
    expect(directory.getNames('THSPA')).toEqual(['School'])
  })

  test('rejects HTTP errors and requests fresh public data with a timeout', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    vi.stubGlobal('fetch', fetchMock)
    await expect(fetchTeamDirectory('THSPA')).rejects.toThrow('HTTP 500')
    expect(fetchMock).toHaveBeenCalledWith(TEAM_DIRECTORY_URLS.THSPA, {
      cache: 'no-store', credentials: 'omit', signal: expect.any(AbortSignal),
    })
  })
})
