export interface TeamStandingCandidate {
    id: number
    totalPoints: number
  
    placeCounts: number[]
  
    allOtherPlaceCount: number
  
    averageCoefficient?: number
  }
  
  export interface TeamStandingRules {
    useAverageCoefficientTieBreaker: boolean
  }
  
  export interface TeamStandingResult {
    id: number
    place: number | null
    tied: boolean
  }
  
  function comparePlaceCounts(
    a: TeamStandingCandidate,
    b: TeamStandingCandidate
  ): number {
  
    const count = Math.max(
      a.placeCounts.length,
      b.placeCounts.length
    )
  
    for (let i = 0; i < count; i++) {
      const aCount = a.placeCounts[i] ?? 0
      const bCount = b.placeCounts[i] ?? 0
  
      if (aCount !== bCount) {
        return bCount - aCount
      }
    }
  
    if (
      a.allOtherPlaceCount !==
      b.allOtherPlaceCount
    ) {
      return (
        b.allOtherPlaceCount -
        a.allOtherPlaceCount
      )
    }
  
    return 0
  }
  
  function compareTeams(
    a: TeamStandingCandidate,
    b: TeamStandingCandidate,
    rules: TeamStandingRules
  ): number {
  
    if (a.totalPoints !== b.totalPoints) {
      return b.totalPoints - a.totalPoints
    }
  
    const placeComparison =
      comparePlaceCounts(a, b)
  
    if (placeComparison !== 0) {
      return placeComparison
    }
  
    if (rules.useAverageCoefficientTieBreaker) {
      const aCoefficient =
        a.averageCoefficient ?? 0
  
      const bCoefficient =
        b.averageCoefficient ?? 0
  
      if (aCoefficient !== bCoefficient) {
        return bCoefficient - aCoefficient
      }
    }
  
    return 0
  }
  
  function teamsAreTied(
    a: TeamStandingCandidate,
    b: TeamStandingCandidate,
    rules: TeamStandingRules
  ): boolean {
    return compareTeams(a, b, rules) === 0
  }
  
  export function rankTeamStandings(
    teams: TeamStandingCandidate[],
    rules: TeamStandingRules
  ): TeamStandingResult[] {
  
    const eligible = teams
      .filter((team) => team.totalPoints > 0)
      .sort((a, b) =>
        compareTeams(a, b, rules)
      )
  
    const results: TeamStandingResult[] = []
  
    for (let i = 0; i < eligible.length; i++) {
      const team = eligible[i]
  
      let place = i + 1
      let tied = false
  
      if (i > 0) {
        const previous = eligible[i - 1]
  
        if (
          teamsAreTied(
            team,
            previous,
            rules
          )
        ) {
          place =
            results[results.length - 1].place!
  
          tied = true
  
          results[results.length - 1].tied = true
        }
      }
  
      results.push({
        id: team.id,
        place,
        tied,
      })
    }
  
    const unplaced = teams
      .filter((team) => team.totalPoints <= 0)
      .map((team) => ({
        id: team.id,
        place: null,
        tied: false,
      }))
  
    return [
      ...results,
      ...unplaced,
    ]
  }