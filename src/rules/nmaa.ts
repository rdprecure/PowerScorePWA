import type {
    TeamScoringRules,
  } from '../scoring/teamScore'
  
  import type {
    TeamStandingRules,
  } from '../scoring/teamStandings'
  
  export const NMAA_INDIVIDUAL_POINTS =
    [
      7,
      5,
      3,
      2,
      1,
    ]
  
  export const NMAA_TEAM_SCORING:
    TeamScoringRules = {
      maxScoringLifters: 12,
      maxScoringLiftersPerClass: 2,
    }
  
  export const NMAA_TEAM_STANDINGS:
    TeamStandingRules = {
      useAllOtherPlacesTieBreaker: false,
      useAverageCoefficientTieBreaker: false,
    }