import type {
    TeamScoringRules,
  } from '../scoring/teamScore'
  
  import type {
    TeamStandingRules,
  } from '../scoring/teamStandings'
  
  export const TEXAS_INDIVIDUAL_POINTS =
    [
      7,
      5,
      3,
      2,
      1,
    ]
  
  export const TEXAS_TEAM_SCORING:
    TeamScoringRules = {
      maxScoringLifters: 12,
      maxScoringLiftersPerClass: 3,
    }
  
  export const TEXAS_TEAM_STANDINGS:
    TeamStandingRules = {
      useAllOtherPlacesTieBreaker: true,
      useAverageCoefficientTieBreaker: true,
    }