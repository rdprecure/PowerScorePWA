import type {
  MeetState,
} from '../models/MeetState'

import type {
  AssociationRules,
} from '../rules/AssociationRules'

import type {
  LifterReadinessError,
} from './lifterCompetitionReadiness'

import {
  validateLifterCompetitionReadiness,
} from './lifterCompetitionReadiness'

export interface MeetLifterReadiness {
  lifterId: number
  lifterNumber: number
  ready: boolean
  requiresReadiness: boolean
  errors: LifterReadinessError[]
}

export interface MeetCompetitionReadiness {
  ready: boolean
  totalLifters: number
  competingLifters: number
  readyLifters: number
  notReadyLifters: number
  notCompetingLifters: number
  lifters: MeetLifterReadiness[]
}

export function validateMeetCompetitionReadiness(
  state: MeetState,
  rules: AssociationRules,
): MeetCompetitionReadiness {

  const lifters:
    MeetLifterReadiness[] =
      state.lifters.map(
        lifter => {

          const readiness =
            validateLifterCompetitionReadiness(
              lifter,
              state,
              rules,
            )

          return {
            lifterId:
              lifter.id,

            lifterNumber:
              lifter.lifterNumber,

            ready:
              readiness.ready,

            requiresReadiness:
              readiness.requiresReadiness,

            errors:
              readiness.errors,
          }
        }
      )

  const competingLifters =
    lifters.filter(
      lifter =>
        lifter.requiresReadiness
    ).length

  const readyLifters =
    lifters.filter(
      lifter =>
        lifter.requiresReadiness &&
        lifter.ready
    ).length

  const notReadyLifters =
    lifters.filter(
      lifter =>
        lifter.requiresReadiness &&
        !lifter.ready
    ).length

  const notCompetingLifters =
    lifters.filter(
      lifter =>
        !lifter.requiresReadiness
    ).length

  return {
    ready:
      notReadyLifters === 0,

    totalLifters:
      lifters.length,

    competingLifters,

    readyLifters,

    notReadyLifters,

    notCompetingLifters,

    lifters,
  }
}