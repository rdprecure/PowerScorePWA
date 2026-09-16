import type { MeetState } from '../models/MeetState'

export interface MeetValidationError {
  code: string
  message: string
}

export function validateMeetState(
  state: MeetState,
): MeetValidationError[] {
  const errors: MeetValidationError[] = []

  validateDivisionMeetRelationships(state, errors)
  validateTeamMeetRelationships(state, errors)
  validateLifterNumbers(state, errors)
  validateLifterDivisionRelationships(state, errors)
  validateLifterTeamRelationships(state, errors)

  return errors
}

function validateDivisionMeetRelationships(
  state: MeetState,
  errors: MeetValidationError[],
): void {
  for (const division of state.divisions) {
    if (division.meetId !== state.meet.id) {
      errors.push({
        code: 'DIVISION_WRONG_MEET',
        message:
          `Division "${division.name}" belongs to meet ` +
          `"${division.meetId}" instead of "${state.meet.id}".`,
      })
    }
  }
}

function validateTeamMeetRelationships(
  state: MeetState,
  errors: MeetValidationError[],
): void {
  for (const team of state.teams) {
    if (team.meetId !== state.meet.id) {
      errors.push({
        code: 'TEAM_WRONG_MEET',
        message:
          `Team "${team.name}" belongs to meet ` +
          `"${team.meetId}" instead of "${state.meet.id}".`,
      })
    }
  }
}

function validateLifterNumbers(
  state: MeetState,
  errors: MeetValidationError[],
): void {
  const lifterNumberCounts = new Map<number, number>()

  for (const lifter of state.lifters) {
    const count = lifterNumberCounts.get(lifter.lifterNumber) ?? 0
    lifterNumberCounts.set(lifter.lifterNumber, count + 1)
  }

  for (const [lifterNumber, count] of lifterNumberCounts) {
    if (count > 1) {
      errors.push({
        code: 'DUPLICATE_LIFTER_NUMBER',
        message:
          `Lifter number ${lifterNumber} is used ${count} times. ` +
          'Lifter numbers must be unique across the entire meet.',
      })
    }
  }
}

function validateLifterDivisionRelationships(
  state: MeetState,
  errors: MeetValidationError[],
): void {
  const divisionIds = new Set(
    state.divisions.map((division) => division.id),
  )

  for (const lifter of state.lifters) {
    if (!divisionIds.has(lifter.divisionId)) {
      errors.push({
        code: 'LIFTER_DIVISION_NOT_FOUND',
        message:
          `Lifter ${lifter.lifterNumber} references division ` +
          `${lifter.divisionId}, which does not exist in the meet.`,
      })
    }
  }
}

function validateLifterTeamRelationships(
  state: MeetState,
  errors: MeetValidationError[],
): void {
  const teamIds = new Set(
    state.teams.map((team) => team.id),
  )

  for (const lifter of state.lifters) {
    if (
      lifter.teamId !== null &&
      !teamIds.has(lifter.teamId)
    ) {
      errors.push({
        code: 'LIFTER_TEAM_NOT_FOUND',
        message:
          `Lifter ${lifter.lifterNumber} references team ` +
          `${lifter.teamId}, which does not exist in the meet.`,
      })
    }
  }
}