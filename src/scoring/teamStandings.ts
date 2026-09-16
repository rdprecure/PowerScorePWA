export interface TeamStandingCandidate {
    id: number
    totalPoints: number
    placeCounts: number[]
    allOtherPlaceCount: number
    averageCoefficientTotal?: number
  }
  
  export interface TeamStandingRules {
    useAllOtherPlacesTieBreaker: boolean
    useAverageCoefficientTieBreaker: boolean
  }
  
  export interface TeamStandingResult {
    id: number
    place: number | null
    tied: boolean
  }
  
  function comparePlaceCounts(
    a: TeamStandingCandidate,
    b: TeamStandingCandidate,
    rules: TeamStandingRules
  ): number {
  
    const maxPlaces =
      Math.max(
        a.placeCounts.length,
        b.placeCounts.length
      )
  
    for (
      let index = 0;
      index < maxPlaces;
      index++
    ) {
  
      const aCount =
        a.placeCounts[index] ?? 0
  
      const bCount =
        b.placeCounts[index] ?? 0
  
      if (aCount !== bCount) {
        return bCount - aCount
      }
    }
  
    if (
      rules.useAllOtherPlacesTieBreaker &&
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
  
    if (
      a.totalPoints !==
      b.totalPoints
    ) {
      return (
        b.totalPoints -
        a.totalPoints
      )
    }
  
    const placeComparison =
      comparePlaceCounts(
        a,
        b,
        rules
      )
  
    if (placeComparison !== 0) {
      return placeComparison
    }
  
    if (
      rules
        .useAverageCoefficientTieBreaker
    ) {
  
      const aAverage =
        a.averageCoefficientTotal ?? 0
  
      const bAverage =
        b.averageCoefficientTotal ?? 0
  
      if (aAverage !== bAverage) {
        return (
          bAverage -
          aAverage
        )
      }
    }
  
    return 0
  }
  
  function teamsAreTied(
    a: TeamStandingCandidate,
    b: TeamStandingCandidate,
    rules: TeamStandingRules
  ): boolean {
  
    return (
      compareTeams(
        a,
        b,
        rules
      ) === 0
    )
  }
  
  export function rankTeamStandings(
    teams: TeamStandingCandidate[],
    rules: TeamStandingRules
  ): TeamStandingResult[] {
  
    const eligible =
      teams
        .filter(
          team =>
            team.totalPoints > 0
        )
        .sort(
          (a, b) =>
            compareTeams(
              a,
              b,
              rules
            )
        )
  
    const results:
      TeamStandingResult[] = []
  
    let previousTeam:
      TeamStandingCandidate |
      undefined
  
    let previousPlace:
      number | null = null
  
    for (
      let index = 0;
      index < eligible.length;
      index++
    ) {
  
      const team =
        eligible[index]
  
      const currentPosition =
        index + 1
  
      let place =
        currentPosition
  
      let tied =
        false
  
      if (
        previousTeam &&
        teamsAreTied(
          previousTeam,
          team,
          rules
        )
      ) {
  
        place =
          previousPlace ??
          currentPosition
  
        tied =
          true
  
        const previousResult =
          results[
            results.length - 1
          ]
  
        if (previousResult) {
          previousResult.tied =
            true
        }
      }
  
      results.push({
        id: team.id,
        place,
        tied,
      })
  
      previousTeam =
        team
  
      previousPlace =
        place
    }
  
    const unplaced =
      teams
        .filter(
          team =>
            team.totalPoints <= 0
        )
        .map(
          team => ({
            id: team.id,
            place: null,
            tied: false,
          })
        )
  
    return [
      ...results,
      ...unplaced,
    ]
  }