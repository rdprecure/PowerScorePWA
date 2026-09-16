import type {
  Lifter,
} from '../models/Lifter'

import type {
  MeetState,
} from '../models/MeetState'

import {
  LifterRegistrationError,
} from './lifterRegistration'

export interface LifterIdentityUpdate {
  firstName: string
  lastName: string
}

export interface LifterCompetitionUpdate {
  divisionId: number
  teamId: number | null
  equipmentType: Lifter['equipmentType']
  isGuest: boolean
  isExtraLifter: boolean
}

export interface LifterPersonalUpdate {
  age: number | null
  grade: number | null
}

export function updateRegisteredLifterIdentity(
  lifter: Lifter,
  update: LifterIdentityUpdate,
): Lifter {

  return {
    ...lifter,

    firstName:
      update.firstName,

    lastName:
      update.lastName,
  }
}

export function updateRegisteredLifterNumber(
  lifter: Lifter,
  lifterNumber: number,
  state: MeetState,
): Lifter {

  const duplicate =
    state.lifters.some(
      existingLifter =>
        existingLifter.id !==
          lifter.id &&
        existingLifter.lifterNumber ===
          lifterNumber
    )

  if (duplicate) {
    throw new LifterRegistrationError(
      'DUPLICATE_LIFTER_NUMBER',
      `Lifter number ${lifterNumber} is already used in this meet.`,
    )
  }

  return {
    ...lifter,

    lifterNumber,
  }
}

export function updateRegisteredLifterCompetition(
  lifter: Lifter,
  update: LifterCompetitionUpdate,
  state: MeetState,
): Lifter {

  ensureDivisionExists(
    update.divisionId,
    state,
  )

  ensureTeamExists(
    update.teamId,
    state,
  )

  return {
    ...lifter,

    divisionId:
      update.divisionId,

    teamId:
      update.teamId,

    equipmentType:
      update.equipmentType,

    isGuest:
      update.isGuest,

    isExtraLifter:
      update.isExtraLifter,
  }
}

export function updateRegisteredLifterPersonal(
  lifter: Lifter,
  update: LifterPersonalUpdate,
): Lifter {

  return {
    ...lifter,

    age:
      update.age,

    grade:
      update.grade,
  }
}

export function updateDeclaredDeadliftOpener(
  lifter: Lifter,
  declaredDeadliftOpener: number | null,
): Lifter {

  return {
    ...lifter,

    declaredDeadliftOpener,
  }
}

function ensureDivisionExists(
  divisionId: number,
  state: MeetState,
): void {

  const exists =
    state.divisions.some(
      division =>
        division.id ===
        divisionId
    )

  if (!exists) {
    throw new LifterRegistrationError(
      'DIVISION_NOT_FOUND',
      `Division ${divisionId} does not exist in this meet.`,
    )
  }
}

function ensureTeamExists(
  teamId: number | null,
  state: MeetState,
): void {

  if (teamId === null) {
    return
  }

  const exists =
    state.teams.some(
      team =>
        team.id ===
        teamId
    )

  if (!exists) {
    throw new LifterRegistrationError(
      'TEAM_NOT_FOUND',
      `Team ${teamId} does not exist in this meet.`,
    )
  }
}