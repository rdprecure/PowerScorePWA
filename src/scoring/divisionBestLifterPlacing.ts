import type {
    AssociationRules,
  } from '../rules/AssociationRules'
  
  import type {
    ScoredDivisionLifter,
  } from './divisionScoring'
  
  import type {
    BestLifterPlacement,
  } from './bestLifterPlacing'
  
  import {
    placeBestLifters,
  } from './bestLifterPlacing'
  
  export function placeDivisionBestLifters(
    lifters: ScoredDivisionLifter[],
    rules: AssociationRules,
    placesPerGroup: number
  ): BestLifterPlacement[] {
  
    return placeBestLifters(
      lifters.map(
        lifter => ({
          id:
            lifter.id,
          bodyWeight:
            lifter.bodyWeight,
          weightClass:
            lifter.weightClass,
          total:
            lifter.total,
          status:
            lifter.status,
          isGuest:
            lifter.isGuest,
        })
      ),
      rules,
      placesPerGroup
    )
  }