import type {
    LifterStatus,
  } from '../models/LifterStatus'
  
  export interface PlacementCandidate {
    id: number
    bodyWeight: number
    total: number
    status: LifterStatus
    isGuest: boolean
  
    tieGroup?: string
  }
  
  export interface PlacementResult {
    id: number
    place: number | null
    tied: boolean
    tieCount: number
  }
  
  function isEligibleForPlace(
    lifter: PlacementCandidate
  ): boolean {
    return (
      lifter.status === 'active' &&
      lifter.total > 0 &&
      lifter.isGuest === false
    )
  }
  
  export function rankTexasByTotal(
    lifters: PlacementCandidate[]
  ): PlacementResult[] {
  
    const eligible = lifters
      .filter(isEligibleForPlace)
      .sort((a, b) => {
  
        if (b.total !== a.total) {
          return b.total - a.total
        }
  
        return a.bodyWeight - b.bodyWeight
      })
  
    const results: PlacementResult[] = []
  
    let place = 1
    let index = 0
  
    while (index < eligible.length) {
  
      const lifter = eligible[index]
  
      if (lifter.tieGroup) {
  
        const tiedLifters = eligible.filter(
          (candidate) =>
            candidate.tieGroup ===
            lifter.tieGroup
        )
  
        const tiedIds = new Set(
          tiedLifters.map(
            (candidate) => candidate.id
          )
        )
  
        const consecutiveTiedLifters:
          PlacementCandidate[] = []
  
        let tieIndex = index
  
        while (
          tieIndex < eligible.length &&
          tiedIds.has(eligible[tieIndex].id)
        ) {
          consecutiveTiedLifters.push(
            eligible[tieIndex]
          )
  
          tieIndex++
        }
  
        if (
          consecutiveTiedLifters.length > 1
        ) {
          for (
            const tiedLifter
            of consecutiveTiedLifters
          ) {
            results.push({
              id: tiedLifter.id,
              place,
              tied: true,
              tieCount:
                consecutiveTiedLifters.length,
            })
          }
  
          place +=
            consecutiveTiedLifters.length
  
          index = tieIndex
  
          continue
        }
      }
  
      results.push({
        id: lifter.id,
        place,
        tied: false,
        tieCount: 1,
      })
  
      place++
      index++
    }
  
    const unplaced = lifters
      .filter(
        (lifter) =>
          !isEligibleForPlace(lifter)
      )
      .map((lifter) => ({
        id: lifter.id,
        place: null,
        tied: false,
        tieCount: 1,
      }))
  
    return [
      ...results,
      ...unplaced,
    ]
  }