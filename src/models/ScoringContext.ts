export type MeetLevel =
| 'invitational'
| 'regional'
| 'state'

export interface ScoringContext {
meetLevel: MeetLevel
}

export function createScoringContext(
meetLevel: MeetLevel = 'invitational'
): ScoringContext {

return {
  meetLevel,
}
}

export function isChampionshipMeet(
context: ScoringContext
): boolean {

return (
  context.meetLevel === 'regional' ||
  context.meetLevel === 'state'
)
}