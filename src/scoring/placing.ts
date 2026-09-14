import type { LifterStatus } from '../models/LifterStatus'

export interface PlacementCandidate {
  id: number
  bodyWeight: number
  total: number
  status: LifterStatus
  isGuest: boolean
}

export interface PlacementResult {
  id: number
  place: number | null
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

  const sorted = [...lifters].sort((a, b) => {
    if (b.total !== a.total) {
      return b.total - a.total
    }

    return a.bodyWeight - b.bodyWeight
  })

  let place = 1

  return sorted.map((lifter) => {
    if (!isEligibleForPlace(lifter)) {
      return {
        id: lifter.id,
        place: null,
      }
    }

    const result: PlacementResult = {
      id: lifter.id,
      place,
    }

    place++

    return result
  })
}