import type { Team } from '../models/Team'

export function getLifterEntryTeamLabel(team: Team): string {
  return team.name + (team.isBTeam === true ? ' (B Team)' : '')
}

/** Resolve only a unique team from the selected division's eligible teams. */
export function resolveLifterEntryTeam(value: string, teams: readonly Team[]): Team | undefined {
  const name = value.trim().toLocaleLowerCase()
  if (name === '') return undefined
  const matches = teams.filter(team => getLifterEntryTeamLabel(team).toLocaleLowerCase() === name)
  return matches.length === 1 ? matches[0] : undefined
}
