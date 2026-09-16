import type { WeightClass } from '../models/WeightClass'
import type { WeightClassSource } from '../models/Lifter'
import { getWeightClass } from '../scoring/weightClass'

export interface WeightClassAssignment {
  weightClass: string | null
  weightClassSource: WeightClassSource
}

export type WeightClassValidationCode =
  | 'VALID'
  | 'BODY_WEIGHT_REQUIRED'
  | 'WEIGHT_CLASS_NOT_FOUND'
  | 'NOT_BODY_WEIGHT_CLASS'
  | 'NOT_BODY_WEIGHT_OR_NEXT_CLASS'

export interface WeightClassValidationResult {
  valid: boolean
  code: WeightClassValidationCode
  automaticWeightClass: string | null
  nextHigherWeightClass: string | null
}

/**
 * Determines the automatic weight class for a body weight.
 *
 * A null or non-positive body weight does not produce an official
 * competition weight-class assignment.
 */
export function getAutomaticWeightClass(
  bodyWeight: number | null,
  weightClasses: WeightClass[],
): string | null {
  if (
    bodyWeight === null ||
    bodyWeight <= 0 ||
    weightClasses.length === 0
  ) {
    return null
  }

  return getWeightClass(bodyWeight, weightClasses)
}

/**
 * Creates an automatic weight-class assignment from body weight.
 */
export function createAutomaticWeightClassAssignment(
  bodyWeight: number | null,
  weightClasses: WeightClass[],
): WeightClassAssignment {
  return {
    weightClass: getAutomaticWeightClass(
      bodyWeight,
      weightClasses,
    ),
    weightClassSource: 'automatic',
  }
}

/**
 * Updates an existing assignment after body weight changes.
 *
 * Automatic assignments follow the new body weight.
 * Manual assignments are preserved exactly as entered by the operator.
 */
export function updateWeightClassForBodyWeight(
  bodyWeight: number | null,
  currentAssignment: WeightClassAssignment,
  weightClasses: WeightClass[],
): WeightClassAssignment {
  if (currentAssignment.weightClassSource === 'manual') {
    return {
      ...currentAssignment,
    }
  }

  return createAutomaticWeightClassAssignment(
    bodyWeight,
    weightClasses,
  )
}

/**
 * Records an operator-selected competition weight class.
 *
 * Validation is intentionally separate. This function records the
 * operator's designation and does not silently substitute another class.
 */
export function createManualWeightClassAssignment(
  weightClass: string,
): WeightClassAssignment {
  return {
    weightClass,
    weightClassSource: 'manual',
  }
}

/**
 * Returns the class immediately above the automatic body-weight class.
 */
export function getNextHigherWeightClass(
  bodyWeight: number | null,
  weightClasses: WeightClass[],
): string | null {
  const automaticWeightClass = getAutomaticWeightClass(
    bodyWeight,
    weightClasses,
  )

  if (automaticWeightClass === null) {
    return null
  }

  const index = weightClasses.findIndex(
    (weightClass) =>
      weightClass.name === automaticWeightClass,
  )

  if (
    index < 0 ||
    index >= weightClasses.length - 1
  ) {
    return null
  }

  return weightClasses[index + 1].name
}

/**
 * Validates that an assigned class is exactly the class determined
 * by body weight.
 *
 * This is useful for rule sets that require the lifter to compete
 * in the class in which the lifter weighs.
 */
export function validateBodyWeightClassOnly(
  bodyWeight: number | null,
  assignedWeightClass: string | null,
  weightClasses: WeightClass[],
): WeightClassValidationResult {
  const automaticWeightClass = getAutomaticWeightClass(
    bodyWeight,
    weightClasses,
  )

  const nextHigherWeightClass = getNextHigherWeightClass(
    bodyWeight,
    weightClasses,
  )

  if (automaticWeightClass === null) {
    return {
      valid: false,
      code: 'BODY_WEIGHT_REQUIRED',
      automaticWeightClass,
      nextHigherWeightClass,
    }
  }

  if (
    assignedWeightClass === null ||
    !weightClasses.some(
      (weightClass) =>
        weightClass.name === assignedWeightClass,
    )
  ) {
    return {
      valid: false,
      code: 'WEIGHT_CLASS_NOT_FOUND',
      automaticWeightClass,
      nextHigherWeightClass,
    }
  }

  if (assignedWeightClass !== automaticWeightClass) {
    return {
      valid: false,
      code: 'NOT_BODY_WEIGHT_CLASS',
      automaticWeightClass,
      nextHigherWeightClass,
    }
  }

  return {
    valid: true,
    code: 'VALID',
    automaticWeightClass,
    nextHigherWeightClass,
  }
}

/**
 * Validates that an assigned class is either:
 *
 * 1. the class determined by body weight, or
 * 2. the immediately higher weight class.
 *
 * This supports rule sets such as NMAA where a lifter may elect
 * to compete in the next higher class.
 */
export function validateBodyWeightOrNextClass(
  bodyWeight: number | null,
  assignedWeightClass: string | null,
  weightClasses: WeightClass[],
): WeightClassValidationResult {
  const automaticWeightClass = getAutomaticWeightClass(
    bodyWeight,
    weightClasses,
  )

  const nextHigherWeightClass = getNextHigherWeightClass(
    bodyWeight,
    weightClasses,
  )

  if (automaticWeightClass === null) {
    return {
      valid: false,
      code: 'BODY_WEIGHT_REQUIRED',
      automaticWeightClass,
      nextHigherWeightClass,
    }
  }

  if (
    assignedWeightClass === null ||
    !weightClasses.some(
      (weightClass) =>
        weightClass.name === assignedWeightClass,
    )
  ) {
    return {
      valid: false,
      code: 'WEIGHT_CLASS_NOT_FOUND',
      automaticWeightClass,
      nextHigherWeightClass,
    }
  }

  if (
    assignedWeightClass !== automaticWeightClass &&
    assignedWeightClass !== nextHigherWeightClass
  ) {
    return {
      valid: false,
      code: 'NOT_BODY_WEIGHT_OR_NEXT_CLASS',
      automaticWeightClass,
      nextHigherWeightClass,
    }
  }

  return {
    valid: true,
    code: 'VALID',
    automaticWeightClass,
    nextHigherWeightClass,
  }
}