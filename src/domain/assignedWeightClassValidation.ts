import type {
  AssociationRules,
} from '../rules/AssociationRules'

import {
  validateBodyWeightClassOnly,
  validateBodyWeightOrNextClass,
} from './weightClassAssignment'

import type {
  WeightClassValidationResult,
} from './weightClassAssignment'

export function validateAssignedWeightClass(
  bodyWeight: number | null,
  assignedWeightClass: string | null,
  rules: AssociationRules,
): WeightClassValidationResult {

  switch (
    rules.weightClassSelectionPolicy
  ) {

    case 'body-weight-class-only':
      return validateBodyWeightClassOnly(
        bodyWeight,
        assignedWeightClass,
        rules.weightClasses,
      )

    case 'body-weight-or-next-class':
      return validateBodyWeightOrNextClass(
        bodyWeight,
        assignedWeightClass,
        rules.weightClasses,
      )
  }
}