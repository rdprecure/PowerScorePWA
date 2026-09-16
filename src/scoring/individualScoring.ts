import type {
    PlacementCandidate,
  } from './placing'
  
  import {
    rankByTotal,
  } from './placing'
  
  import {
    getPointsForPlace,
    getSplitPointsForTie,
  } from './points'
  
  export interface IndividualScoringResult {
    id: number
    place: number | null
    tied: boolean
    tieCount: number
    points: number
  }
  
  export function scoreIndividuals(
    lifters: PlacementCandidate[],
    pointSchedule: number[]
  ): IndividualScoringResult[] {
  
    const placements =
      rankByTotal(lifters)
  
    return placements.map((placement) => {
  
      if (placement.place === null) {
        return {
          ...placement,
          points: 0,
        }
      }
  
      const points =
        placement.tied
          ? getSplitPointsForTie(
              placement.place,
              placement.tieCount,
              pointSchedule
            )
          : getPointsForPlace(
              placement.place,
              pointSchedule
            )
  
      return {
        ...placement,
        points,
      }
    })
  }
  
  /*
   * Compatibility wrapper for existing
   * Texas callers and tests.
   *
   * New code should use scoreIndividuals().
   */
  export function scoreTexasIndividuals(
    lifters: PlacementCandidate[],
    pointSchedule: number[]
  ): IndividualScoringResult[] {
  
    return scoreIndividuals(
      lifters,
      pointSchedule
    )
  }