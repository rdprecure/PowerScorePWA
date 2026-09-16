import type {
  Lifter,
} from '../models/Lifter'

import type {
  MeetState,
} from '../models/MeetState'

import type {
  AssociationRules,
} from '../rules/AssociationRules'

import {
  createAutomaticWeightClassAssignment,
  createManualWeightClassAssignment,
  updateWeightClassForBodyWeight,
} from './weightClassAssignment'

import {
  validateAssignedWeightClass,
} from './assignedWeightClassValidation'

export interface CreateLifterInput {
  id: number
  lifterNumber: number
  firstName: string
  lastName: string
  divisionId: number
  teamId: number | null
  bodyWeight: number | null
  equipmentType: Lifter['equipmentType']
  age: number | null
  grade: number | null
  isGuest: boolean
  isExtraLifter: boolean
}

export type LifterRegistrationErrorCode =
  | 'DUPLICATE_LIFTER_NUMBER'
  | 'DIVISION_NOT_FOUND'
  | 'TEAM_NOT_FOUND'
  | 'INVALID_WEIGHT_CLASS'

export class LifterRegistrationError
  extends Error {

  readonly code:
    LifterRegistrationErrorCode

  constructor(
    code: LifterRegistrationErrorCode,
    message: string,
  ) {
    super(message)

    this.name =
      'LifterRegistrationError'

    this.code =
      code
  }
}

export function createRegisteredLifter(
  state: MeetState,
  input: CreateLifterInput,
  rules: AssociationRules,
): Lifter {

  ensureUniqueLifterNumber(
    state,
    input.lifterNumber,
  )

  ensureDivisionExists(
    state,
    input.divisionId,
  )

  ensureTeamExists(
    state,
    input.teamId,
  )

  const assignment =
    createAutomaticWeightClassAssignment(
      input.bodyWeight,
      rules.weightClasses,
    )

  return {
    id:
      input.id,

    lifterNumber:
      input.lifterNumber,

    firstName:
      input.firstName,

    lastName:
      input.lastName,

    divisionId:
      input.divisionId,

    teamId:
      input.teamId,

    bodyWeight:
      input.bodyWeight,

    weightClass:
      assignment.weightClass,

    weightClassSource:
      assignment.weightClassSource,

    equipmentType:
      input.equipmentType,

    age:
      input.age,

    grade:
      input.grade,

    status:
      'active',

    isGuest:
      input.isGuest,

    isExtraLifter:
      input.isExtraLifter,

    declaredDeadliftOpener:
      null,
  }
}

export function updateRegisteredLifterBodyWeight(
  lifter: Lifter,
  bodyWeight: number | null,
  rules: AssociationRules,
): Lifter {

  const assignment =
    updateWeightClassForBodyWeight(
      bodyWeight,
      {
        weightClass:
          lifter.weightClass,

        weightClassSource:
          lifter.weightClassSource,
      },
      rules.weightClasses,
    )

  return {
    ...lifter,

    bodyWeight,

    weightClass:
      assignment.weightClass,

    weightClassSource:
      assignment.weightClassSource,
  }
}

export function assignRegisteredLifterWeightClass(
  lifter: Lifter,
  weightClass: string,
  rules: AssociationRules,
): Lifter {

  const validation =
    validateAssignedWeightClass(
      lifter.bodyWeight,
      weightClass,
      rules,
    )

  if (!validation.valid) {
    throw new LifterRegistrationError(
      'INVALID_WEIGHT_CLASS',
      buildWeightClassErrorMessage(
        lifter,
        weightClass,
        validation.code,
      ),
    )
  }

  const assignment =
    createManualWeightClassAssignment(
      weightClass,
    )

  return {
    ...lifter,

    weightClass:
      assignment.weightClass,

    weightClassSource:
      assignment.weightClassSource,
  }
}

function ensureUniqueLifterNumber(
  state: MeetState,
  lifterNumber: number,
): void {

  const duplicate =
    state.lifters.some(
      lifter =>
        lifter.lifterNumber ===
        lifterNumber
    )

  if (duplicate) {
    throw new LifterRegistrationError(
      'DUPLICATE_LIFTER_NUMBER',
      `Lifter number ${lifterNumber} is already used in this meet.`,
    )
  }
}

function ensureDivisionExists(
  state: MeetState,
  divisionId: number,
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
  state: MeetState,
  teamId: number | null,
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

function buildWeightClassErrorMessage(
  lifter: Lifter,
  weightClass: string,
  validationCode: string,
): string {

  return (
    `Weight class "${weightClass}" is not valid ` +
    `for lifter ${lifter.lifterNumber}. ` +
    `Validation result: ${validationCode}.`
  )
}