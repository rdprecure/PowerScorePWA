import type {
    CoefficientRules,
  } from '../rules/AssociationRules'
  
  import {
    getBodyWeightCoefficient,
  } from './coefficient'
  
  export interface CoefficientTotalResult {
    coefficient: number
    coefficientTotal: number
  }
  
  export function calculateCoefficientTotal(
    bodyWeight: number,
    total: number,
    rules: CoefficientRules
  ): CoefficientTotalResult {
  
    if (
      !Number.isFinite(bodyWeight) ||
      bodyWeight <= 0 ||
      !Number.isFinite(total) ||
      total <= 0
    ) {
      return {
        coefficient: 0,
        coefficientTotal: 0,
      }
    }
  
    const coefficient =
      getBodyWeightCoefficient(
        bodyWeight,
        rules
      )
  
    return {
      coefficient,
      coefficientTotal:
        total * coefficient,
    }
  }
  
  export interface TeamCoefficientCandidate {
    id: number
    bodyWeight: number
    total: number
  }
  
  export function calculateTeamAverageCoefficientTotal(
    lifters: TeamCoefficientCandidate[],
    scoringLifterIds: number[],
    rules: CoefficientRules
  ): number {
  
    if (scoringLifterIds.length === 0) {
      return 0
    }
  
    const lifterById =
      new Map(
        lifters.map(
          lifter => [
            lifter.id,
            lifter,
          ]
        )
      )
  
    let coefficientTotalSum = 0
    let scoringLifterCount = 0
  
    for (
      const lifterId
      of scoringLifterIds
    ) {
  
      const lifter =
        lifterById.get(lifterId)
  
      if (!lifter) {
        continue
      }
  
      const result =
        calculateCoefficientTotal(
          lifter.bodyWeight,
          lifter.total,
          rules
        )
  
      coefficientTotalSum +=
        result.coefficientTotal
  
      scoringLifterCount++
    }
  
    if (scoringLifterCount === 0) {
      return 0
    }
  
    return (
      coefficientTotalSum /
      scoringLifterCount
    )
  }