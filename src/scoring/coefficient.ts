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