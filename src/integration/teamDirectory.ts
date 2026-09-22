import type { DivisionRuleSet } from '../models/Division'

export const TEAM_DIRECTORY_URLS = {
  THSPA: 'https://thspa.us/PowerScore.asmx/GetTeams',
  THSWPA: 'https://thswpa.com/PowerScore.asmx/GetTeams',
  NMAA: 'https://nmaapowerlifting.com/PowerScore.asmx/GetTeams',
} as const

export type TeamAssociation = keyof typeof TEAM_DIRECTORY_URLS
type DirectoryStorage = Pick<Storage, 'getItem' | 'setItem'>

export function getTeamAssociation(ruleSet: DivisionRuleSet | undefined): TeamAssociation | undefined {
  switch (ruleSet) {
    case 'THSPA': return 'THSPA'
    case 'THSWPA': return 'THSWPA'
    case 'NMAA_BOYS':
    case 'NMAA_GIRLS': return 'NMAA'
    default: return undefined
  }
}

export function normalizeTeamNames(names: readonly string[]): string[] {
  const unique = new Map<string, string>()
  for (const value of names) {
    const name = value.trim()
    if (name !== '' && !unique.has(name.toLocaleLowerCase())) {
      unique.set(name.toLocaleLowerCase(), name)
    }
  }
  return [...unique.values()].sort((a, b) => a.localeCompare(b))
}

/** GetTeams payload: TeamName,Region,Division,UILClass;... */
export function parseTeamDirectoryRecords(value: string): string[] {
  const names: string[] = []
  for (const record of value.split(';')) {
    if (record.trim() === '') continue
    const fields = record.split(',')
    if (fields.length !== 4 || fields[0].trim() === '') {
      throw new Error('GetTeams returned an invalid team record.')
    }
    names.push(fields[0])
  }
  return normalizeTeamNames(names)
}

export function parseTeamDirectoryResponse(xml: string): string[] {
  const document = new DOMParser().parseFromString(xml, 'application/xml')
  const root = document.documentElement
  if (document.querySelector('parsererror') !== null || root.localName !== 'string' || root.children.length !== 0) {
    throw new Error('GetTeams returned an invalid XML string response.')
  }
  return parseTeamDirectoryRecords(root.textContent ?? '')
}

export async function fetchTeamDirectory(association: TeamAssociation): Promise<string[]> {
  const response = await fetch(TEAM_DIRECTORY_URLS[association], {
    cache: 'no-store',
    credentials: 'omit',
    signal: AbortSignal.timeout(15000),
  })
  if (!response.ok) throw new Error(`GetTeams returned HTTP ${response.status}.`)
  return parseTeamDirectoryResponse(await response.text())
}

function browserStorage(): DirectoryStorage | undefined {
  try { return window.localStorage } catch { return undefined }
}

/** One instance per app load: restore immediately, refresh each association once. */
export class TeamDirectory {
  private readonly lists = new Map<TeamAssociation, readonly string[]>()
  private refreshPromise: Promise<void> | undefined
  private readonly storage: DirectoryStorage | undefined
  private readonly fetchNames: typeof fetchTeamDirectory

  constructor(
    storage: DirectoryStorage | undefined = browserStorage(),
    fetchNames = fetchTeamDirectory,
  ) {
    this.storage = storage
    this.fetchNames = fetchNames
    for (const association of Object.keys(TEAM_DIRECTORY_URLS) as TeamAssociation[]) {
      try {
        const cached: unknown = JSON.parse(this.storage?.getItem(this.storageKey(association)) ?? 'null')
        if (Array.isArray(cached) && cached.every(name => typeof name === 'string')) {
          this.lists.set(association, normalizeTeamNames(cached))
        }
      } catch {
        // A damaged/unavailable cache must not prevent meet operation.
      }
    }
  }

  private storageKey(association: TeamAssociation): string {
    // v1 may contain metadata accidentally parsed as team names by the old parser.
    return `powerscore-team-directory-v2-${association}`
  }

  getNames(association: TeamAssociation): readonly string[] {
    return this.lists.get(association) ?? []
  }

  refresh(onUpdate: () => void = () => {}): Promise<void> {
    if (this.refreshPromise !== undefined) return this.refreshPromise
    this.refreshPromise = Promise.all(
      (Object.keys(TEAM_DIRECTORY_URLS) as TeamAssociation[]).map(async association => {
        try {
          const names = normalizeTeamNames(await this.fetchNames(association))
          this.lists.set(association, names)
          try {
            this.storage?.setItem(this.storageKey(association), JSON.stringify(names))
          } catch {
            // Continue with this session's list if browser storage is full/disabled.
          }
          onUpdate()
        } catch (error) {
          console.warn(`Could not refresh ${association} teams; retaining the last available list.`, error)
        }
      })
    ).then(() => {})
    return this.refreshPromise
  }
}

export function completeTeamName(value: string, names: readonly string[]): string | undefined {
  if (value.trim() === '') return undefined
  const query = value.toLocaleLowerCase()
  if (names.some(name => name.toLocaleLowerCase() === query)) return undefined
  return names.find(name => name.toLocaleLowerCase().includes(query))
}
