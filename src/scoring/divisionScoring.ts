import type {
    AssociationRules,
  } from '../rules/AssociationRules'
  
  import type {
    LifterStatus,
  } from '../models/LifterStatus'
  
  import {
    getWeightClass,
  } from './weightClass'
  
  import {
    scoreTexasIndividuals,
  } from './individualScoring'
  
  export interface DivisionScoringCandidate {
    id: number
    teamId: number | null
    bodyWeight: number
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
  
    const liftersWithClasses =
      lifters.map(
        lifter => ({
          ...lifter,
          weightClass:
            getWeightClass(
              lifter.bodyWeight,
              rules.weightClasses
            ),
        })
      )
  
    const classNames =
      Array.from(
        new Set(
          liftersWithClasses.map(
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
        liftersWithClasses.filter(
          lifter =>
            lifter.weightClass ===
            className
        )
  
      const individualResults =
        scoreTexasIndividuals(
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