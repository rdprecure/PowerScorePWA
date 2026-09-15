export interface TeamScoringCandidate {
    id: number
    weightClass: string
    place: number | null
    points: number
    isGuest: boolean
    isExtraLifter: boolean
    isActive: boolean
    hasValidTotal: boolean
  }
  
  export interface TeamScoringRules {
    maxScoringLifters: number
    maxScoringLiftersPerClass: number
  }
  
  export interface TeamScoringResult {
    totalPoints: number
    scoringLifterIds: number[]
  }
  
  function isEligibleForTeamScoring(
    lifter: TeamScoringCandidate
  ): boolean {
    return (
      lifter.isActive &&
      lifter.hasValidTotal &&
      !lifter.isGuest &&
      !lifter.isExtraLifter &&
      lifter.place !== null &&
      lifter.points > 0
    )
  }
  
  export function calculateTeamScore(
    lifters: TeamScoringCandidate[],
    rules: TeamScoringRules
  ): TeamScoringResult {
  
    const eligible = lifters
      .filter(isEligibleForTeamScoring)
      .sort((a, b) => {
        return a.place! - b.place!
      })
  
    const classCounts = new Map<string, number>()
  
    const scoringLifterIds: number[] = []
  
    let totalPoints = 0
  
    for (const lifter of eligible) {
  
      if (
        scoringLifterIds.length >=
        rules.maxScoringLifters
      ) {
        break
      }
  
      const classCount =
        classCounts.get(lifter.weightClass) ?? 0
  
      if (
        classCount >=
        rules.maxScoringLiftersPerClass
      ) {
        continue
      }
  
      scoringLifterIds.push(lifter.id)
  
      totalPoints += lifter.points
  
      classCounts.set(
        lifter.weightClass,
        classCount + 1
      )
    }
  
    return {
      totalPoints,
      scoringLifterIds,
    }
  }