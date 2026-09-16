import type {
    AssociationRules,
  } from './AssociationRules'
  
  import type {
    ScoringContext,
  } from '../models/ScoringContext'
  
  import {
    isChampionshipMeet,
  } from '../models/ScoringContext'
  
  export interface TeamStandingPolicy {
    useAverageCoefficientTieBreaker: boolean
    ignoreAverageCoefficientForChampionship: boolean
  }
  
  export function getTeamStandingPolicy(
    rules: AssociationRules,
    context: ScoringContext
  ): TeamStandingPolicy {
  
    return {
      useAverageCoefficientTieBreaker:
        rules.teamStandings
          .useAverageCoefficientTieBreaker,
  
      ignoreAverageCoefficientForChampionship:
        (
          isChampionshipMeet(
            context
          ) &&
          rules.teamStandings
            .useAverageCoefficientTieBreaker
        ),
    }
  }