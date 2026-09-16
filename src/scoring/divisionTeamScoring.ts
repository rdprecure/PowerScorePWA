import type {
    AssociationRules,
  } from '../rules/AssociationRules'
  
  import type {
    ScoredDivisionLifter,
  } from './divisionScoring'
  
  import {
    calculateTeamScore,
  } from './teamScore'
  
  import {
    calculateTeamAverageCoefficientTotal,
  } from './coefficientTotal'
  
  export interface DivisionTeamScore {
    teamId: number
    totalPoints: number
    scoringLifterIds: number[]
    averageCoefficientTotal: number
  }
  
  export function scoreDivisionTeams(
    lifters: ScoredDivisionLifter[],
    rules: AssociationRules
  ): DivisionTeamScore[] {
  
    const teamIds =
      Array.from(
        new Set(
          lifters
            .filter(
              lifter =>
                lifter.teamId !== null
            )
            .map(
              lifter =>
                lifter.teamId as number
            )
        )
      )
  
    const results:
      DivisionTeamScore[] = []
  
    for (const teamId of teamIds) {
  
      const teamLifters =
        lifters.filter(
          lifter =>
            lifter.teamId === teamId
        )
  
      const teamScore =
        calculateTeamScore(
          teamLifters.map(
            lifter => ({
              id: lifter.id,
              weightClass:
                lifter.weightClass,
              place:
                lifter.place,
              points:
                lifter.points,
              isGuest:
                lifter.isGuest,
              isExtraLifter:
                lifter.isExtraLifter,
              isActive:
                lifter.status ===
                'active',
              hasValidTotal:
                lifter.total > 0,
            })
          ),
          rules.teamScoring
        )
  
      const averageCoefficientTotal =
        calculateTeamAverageCoefficientTotal(
          teamLifters.map(
            lifter => ({
              id: lifter.id,
              bodyWeight:
                lifter.bodyWeight,
              total:
                lifter.total,
            })
          ),
          teamScore.scoringLifterIds,
          rules.coefficient
        )
  
      results.push({
        teamId,
        totalPoints:
          teamScore.totalPoints,
        scoringLifterIds:
          teamScore.scoringLifterIds,
        averageCoefficientTotal,
      })
    }
  
    return results
  }