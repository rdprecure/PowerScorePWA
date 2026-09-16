import type {
    AssociationRules,
  } from '../rules/AssociationRules'
  
  import type {
    DivisionScoringCandidate,
  } from './divisionScoring'
  
  import type {
    DivisionScoringResult,
  } from './divisionPipeline'
  
  import {
    scoreMeetDivision,
  } from './divisionPipeline'
  
  export type TexasDivisionScoringResult =
    DivisionScoringResult
  
  export function scoreTexasMeetDivision(
    lifters: DivisionScoringCandidate[],
    rules: AssociationRules
  ): TexasDivisionScoringResult {
  
    return scoreMeetDivision(
      lifters,
      rules
    )
  }