import type { WeightClass } from '../models/WeightClass'

export function getWeightClass(
  bodyWeight: number,
  weightClasses: WeightClass[]
): string {

  if (weightClasses.length === 0) {
    return 'N/A'
  }

  if (bodyWeight <= 0) {
    return 'UNC'
  }

  for (const weightClass of weightClasses) {
    if (bodyWeight <= weightClass.maxWeight) {
      return weightClass.name
    }
  }

  return weightClasses[weightClasses.length - 1].name
}