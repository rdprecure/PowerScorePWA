import type {
    AssociationRules,
  } from '../rules/AssociationRules'
  
  import type {
    DivisionScoringCandidate,
    ScoredDivisionLifter,
  } from './divisionScoring'
  
  import {
    scoreTexasDivision,
  } from './divisionScoring'
  
  import type {
    DivisionTeamScore,
  } from './divisionTeamScoring'
  
  import {
    scoreDivisionTeams,
  } from './divisionTeamScoring'
  
  import type {
    TeamStandingResult,
  } from './teamStandings'
  
  import {
    rankTeamStandings,
  } from './teamStandings'
  
  import {
    buildTeamStandingCandidates,
  } from './teamStandingCandidates'
  
  export interface TexasDivisionScoringResult {
    lifters: ScoredDivisionLifter[]
    teams: DivisionTeamScore[]
    teamStandings: TeamStandingResult[]
  }
  
  export function scoreTexasMeetDivision(
    lifters: DivisionScoringCandidate[],
    rules: AssociationRules
  ): TexasDivisionScoringResult {
  
    const scoredLifters =
      scoreTexasDivision(
        lifters,
        rules
      )
  
    const teams =
      scoreDivisionTeams(
        scoredLifters,
        rules
      )
  
    const teamStandingCandidates =
      buildTeamStandingCandidates(
        scoredLifters,
        teams,
        rules.individualPoints.length
      )
  
    const teamStandings =
      rankTeamStandings(
        teamStandingCandidates,
        rules.teamStandings
      )
  
    return {
      lifters: scoredLifters,
      teams,
      teamStandings,
    }
  }