import type {
    PlacementCandidate,
  } from './placing'
  
  import {
    rankTexasByTotal,
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
  
  export function scoreTexasIndividuals(
    lifters: PlacementCandidate[],
    pointSchedule: number[]
  ): IndividualScoringResult[] {
  
    const placements =
      rankTexasByTotal(lifters)
  
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