import type {
    CoefficientRules,
  } from '../rules/AssociationRules'
  
  import {
    SCHWARTZ_TABLE,
  } from '../rules/coefficients/schwartz'
  
  import {
    MALONE_TABLE,
  } from '../rules/coefficients/malone'
  
  export interface CoefficientEntry {
    bodyWeight: number
    coefficient: number
  }
  
  export interface CoefficientLookupOptions {
    roundUpBodyWeight: boolean
  }
  
  export function getTableCoefficient(
    bodyWeight: number,
    table: CoefficientEntry[],
    options: CoefficientLookupOptions
  ): number {
  
    if (
      !Number.isFinite(bodyWeight) ||
      bodyWeight <= 0 ||
      table.length === 0
    ) {
      return 0
    }
  
    const adjustedBodyWeight =
      bodyWeight +
      (options.roundUpBodyWeight
        ? 0.5
        : 0)
  
    let previousCoefficient =
      table[0].coefficient
  
    for (const entry of table) {
  
      if (
        entry.bodyWeight >
        adjustedBodyWeight
      ) {
        return previousCoefficient
      }
  
      previousCoefficient =
        entry.coefficient
    }
  
    return previousCoefficient
  }
  
  export function getBodyWeightCoefficient(
    bodyWeight: number,
    rules: CoefficientRules
  ): number {
  
    switch (rules.type) {
  
      case 'schwartz':
        return getTableCoefficient(
          bodyWeight,
          SCHWARTZ_TABLE,
          {
            roundUpBodyWeight:
              rules.roundUpBodyWeight,
          }
        )
  
      case 'malone':
        return getTableCoefficient(
          bodyWeight,
          MALONE_TABLE,
          {
            roundUpBodyWeight:
              rules.roundUpBodyWeight,
          }
        )
  
      case 'none':
        return 0
    }
  }