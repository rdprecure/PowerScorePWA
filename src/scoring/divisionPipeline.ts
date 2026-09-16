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
  
  import type {
    BestLifterPlacement,
  } from './bestLifterPlacing'
  
  import {
    placeDivisionBestLifters,
  } from './divisionBestLifterPlacing'
  
  export interface DivisionScoringResult {
    lifters: ScoredDivisionLifter[]
    teams: DivisionTeamScore[]
    teamStandings: TeamStandingResult[]
    bestLifterPlacements: BestLifterPlacement[]
  }
  
  export function scoreMeetDivision(
    lifters: DivisionScoringCandidate[],
    rules: AssociationRules
  ): DivisionScoringResult {
  
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
  
    const bestLifterPlacements =
      placeDivisionBestLifters(
        scoredLifters,
        rules,
        rules.bestLifter.placesPerGroup
      )
  
    return {
      lifters: scoredLifters,
      teams,
      teamStandings,
      bestLifterPlacements,
    }
  }