import type {
    TeamScoringRules,
  } from '../scoring/teamScore'
  
  import type {
    TeamStandingRules,
  } from '../scoring/teamStandings'
  
  import type {
    WeightClass,
  } from '../models/WeightClass'
  
  export type Association =
    | 'THSPA'
    | 'THSWPA'
    | 'NMAA'
  
  export type CoefficientType =
    | 'schwartz'
    | 'malone'
    | 'none'
  
  export interface AssociationRules {
    association: Association
  
    individualPoints: number[]
  
    teamScoring: TeamScoringRules
  
    teamStandings: TeamStandingRules
  
    weightClasses: WeightClass[]
  
    coefficientType: CoefficientType
  }