import type {
  AssociationRules,
} from '../rules/AssociationRules'

import type {
  LifterStatus,
} from '../models/LifterStatus'

import {
  scoreIndividuals,
} from './individualScoring'

export interface DivisionScoringCandidate {
  id: number
  teamId: number | null
  bodyWeight: number
  weightClass: string
  total: number
  status: LifterStatus
  isGuest: boolean
  isExtraLifter: boolean
  tieGroup?: string
}

export interface ScoredDivisionLifter {
  id: number
  teamId: number | null
  bodyWeight: number
  total: number
  status: LifterStatus
  isGuest: boolean
  isExtraLifter: boolean
  weightClass: string
  place: number | null
  tied: boolean
  tieCount: number
  points: number
}

export function scoreDivision(
  lifters: DivisionScoringCandidate[],
  rules: AssociationRules
): ScoredDivisionLifter[] {

  const validWeightClasses =
    new Set(
      rules.weightClasses.map(
        weightClass =>
          weightClass.name
      )
    )

  for (
    const lifter
    of lifters
  ) {
    if (
      !validWeightClasses.has(
        lifter.weightClass
      )
    ) {
      throw new Error(
        `Invalid weight class "${lifter.weightClass}" for lifter ${lifter.id}`
      )
    }
  }

  const classNames =
    Array.from(
      new Set(
        lifters.map(
          lifter =>
            lifter.weightClass
        )
      )
    )

  const scoredLifters:
    ScoredDivisionLifter[] = []

  for (
    const className
    of classNames
  ) {

    const classLifters =
      lifters.filter(
        lifter =>
          lifter.weightClass ===
          className
      )

    const individualResults =
      scoreIndividuals(
        classLifters.map(
          lifter => ({
            id:
              lifter.id,
            bodyWeight:
              lifter.bodyWeight,
            total:
              lifter.total,
            status:
              lifter.status,
            isGuest:
              lifter.isGuest,
            tieGroup:
              lifter.tieGroup,
          })
        ),
        rules.individualPoints
      )

    const resultById =
      new Map(
        individualResults.map(
          result => [
            result.id,
            result,
          ]
        )
      )

    for (
      const lifter
      of classLifters
    ) {

      const result =
        resultById.get(
          lifter.id
        )

      if (!result) {
        throw new Error(
          `Missing scoring result for lifter ${lifter.id}`
        )
      }

      scoredLifters.push({
        ...lifter,
        place:
          result.place,
        tied:
          result.tied,
        tieCount:
          result.tieCount,
        points:
          result.points,
      })
    }
  }

  return scoredLifters
}

/*
 * Compatibility wrapper for existing
 * Texas callers and tests.
 *
 * New code should use scoreDivision().
 */
export function scoreTexasDivision(
  lifters: DivisionScoringCandidate[],
  rules: AssociationRules
): ScoredDivisionLifter[] {

  return scoreDivision(
    lifters,
    rules
  )
}