export function getPointsForPlace(
    place: number | null,
    points: number[],
    awardLastPlacePointsToAll = false
  ): number {
  
    if (
      place === null ||
      place <= 0 ||
      points.length === 0
    ) {
      return 0
    }
  
    if (place <= points.length) {
      return points[place - 1]
    }
  
    if (awardLastPlacePointsToAll) {
      return points[points.length - 1]
    }
  
    return 0
  }
  
  export function getSplitPointsForTie(
    startingPlace: number,
    tieCount: number,
    points: number[]
  ): number {
  
    if (
      startingPlace <= 0 ||
      tieCount <= 0 ||
      points.length === 0
    ) {
      return 0
    }
  
    let combinedPoints = 0
  
    for (
      let offset = 0;
      offset < tieCount;
      offset++
    ) {
      const occupiedPlace =
        startingPlace + offset
  
      combinedPoints +=
        getPointsForPlace(
          occupiedPlace,
          points
        )
    }
  
    return combinedPoints / tieCount
  }