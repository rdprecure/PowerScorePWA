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
  validateAssignedWeightClass,
} from './assignedWeightClassValidation'

export type LifterReadinessErrorCode =
  | 'BODY_WEIGHT_REQUIRED'
  | 'WEIGHT_CLASS_REQUIRED'
  | 'INVALID_WEIGHT_CLASS'
  | 'DIVISION_NOT_FOUND'
  | 'TEAM_NOT_FOUND'

export interface LifterReadinessError {
  code: LifterReadinessErrorCode
  message: string
}

export interface LifterCompetitionReadiness {
  ready: boolean
  requiresReadiness: boolean
  errors: LifterReadinessError[]
}

export function validateLifterCompetitionReadiness(
  lifter: Lifter,
  state: MeetState,
  rules: AssociationRules,
): LifterCompetitionReadiness {

  if (
    lifter.status !==
    'active'
  ) {
    return {
      ready: true,
      requiresReadiness: false,
      errors: [],
    }
  }

  const errors:
    LifterReadinessError[] = []

  validateBodyWeight(
    lifter,
    errors,
  )

  validateWeightClass(
    lifter,
    rules,
    errors,
  )

  validateDivision(
    lifter,
    state,
    errors,
  )

  validateTeam(
    lifter,
    state,
    errors,
  )

  return {
    ready:
      errors.length === 0,

    requiresReadiness:
      true,

    errors,
  }
}

function validateBodyWeight(
  lifter: Lifter,
  errors: LifterReadinessError[],
): void {

  if (
    lifter.bodyWeight === null ||
    lifter.bodyWeight <= 0
  ) {
    errors.push({
      code:
        'BODY_WEIGHT_REQUIRED',

      message:
        `Lifter ${lifter.lifterNumber} must have a valid body weight before competition.`,
    })
  }
}

function validateWeightClass(
  lifter: Lifter,
  rules: AssociationRules,
  errors: LifterReadinessError[],
): void {

  if (
    lifter.weightClass === null
  ) {
    errors.push({
      code:
        'WEIGHT_CLASS_REQUIRED',

      message:
        `Lifter ${lifter.lifterNumber} must have an assigned weight class before competition.`,
    })

    return
  }

  if (
    lifter.bodyWeight === null ||
    lifter.bodyWeight <= 0
  ) {
    return
  }

  const validation =
    validateAssignedWeightClass(
      lifter.bodyWeight,
      lifter.weightClass,
      rules,
    )

  if (!validation.valid) {
    errors.push({
      code:
        'INVALID_WEIGHT_CLASS',

      message:
        `Weight class "${lifter.weightClass}" is not valid for lifter ${lifter.lifterNumber}. ` +
        `Validation result: ${validation.code}.`,
    })
  }
}

function validateDivision(
  lifter: Lifter,
  state: MeetState,
  errors: LifterReadinessError[],
): void {

  const exists =
    state.divisions.some(
      division =>
        division.id ===
        lifter.divisionId
    )

  if (!exists) {
    errors.push({
      code:
        'DIVISION_NOT_FOUND',

      message:
        `Division ${lifter.divisionId} does not exist for lifter ${lifter.lifterNumber}.`,
    })
  }
}

function validateTeam(
  lifter: Lifter,
  state: MeetState,
  errors: LifterReadinessError[],
): void {

  if (
    lifter.teamId === null
  ) {
    return
  }

  const exists =
    state.teams.some(
      team =>
        team.id ===
        lifter.teamId
    )

  if (!exists) {
    errors.push({
      code:
        'TEAM_NOT_FOUND',

      message:
        `Team ${lifter.teamId} does not exist for lifter ${lifter.lifterNumber}.`,
    })
  }
}