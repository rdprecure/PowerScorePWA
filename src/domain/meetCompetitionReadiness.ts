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
  errors: LifterReadinessError[]
}

export interface MeetCompetitionReadiness {
  ready: boolean
  totalLifters: number
  readyLifters: number
  notReadyLifters: number
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

            errors:
              readiness.errors,
          }
        }
      )

  const readyLifters =
    lifters.filter(
      lifter =>
        lifter.ready
    ).length

  const notReadyLifters =
    lifters.length -
    readyLifters

  return {
    ready:
      notReadyLifters === 0,

    totalLifters:
      lifters.length,

    readyLifters,

    notReadyLifters,

    lifters,
  }
}