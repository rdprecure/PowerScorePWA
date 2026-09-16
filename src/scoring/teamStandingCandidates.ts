import type {
    ScoredDivisionLifter,
  } from './divisionScoring'
  
  import type {
    DivisionTeamScore,
  } from './divisionTeamScoring'
  
  import type {
    TeamStandingCandidate,
  } from './teamStandings'
  
  export function buildTeamStandingCandidates(
    lifters: ScoredDivisionLifter[],
    teamScores: DivisionTeamScore[],
    trackedPlaces: number = 5
  ): TeamStandingCandidate[] {
  
    return teamScores.map(
      teamScore => {
  
        const scoringIds =
          new Set(
            teamScore.scoringLifterIds
          )
  
        const scoringLifters =
          lifters.filter(
            lifter =>
              lifter.teamId ===
                teamScore.teamId &&
              scoringIds.has(
                lifter.id
              )
          )
  
        const placeCounts =
          Array.from(
            {
              length:
                trackedPlaces,
            },
            () => 0
          )
  
        let allOtherPlaceCount = 0
  
        for (
          const lifter
          of scoringLifters
        ) {
  
          if (
            lifter.place === null ||
            lifter.place <= 0
          ) {
            continue
          }
  
          if (
            lifter.place <=
            trackedPlaces
          ) {
  
            placeCounts[
              lifter.place - 1
            ]++
  
          } else {
  
            allOtherPlaceCount++
          }
        }
  
        return {
          id:
            teamScore.teamId,
  
          totalPoints:
            teamScore.totalPoints,
  
          placeCounts,
  
          allOtherPlaceCount,
  
          averageCoefficientTotal:
            teamScore
              .averageCoefficientTotal,
        }
      }
    )
  }