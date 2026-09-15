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