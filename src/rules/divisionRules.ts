import type {
  Division,
} from '../models/Division'

import type {
  AssociationRules,
} from './AssociationRules'

import {
  THSPA_RULES,
} from './thspa'

import {
  THSWPA_RULES,
} from './thswpa'

import {
  NMAA_BOYS_RULES,
} from './nmaaBoys'

import {
  NMAA_GIRLS_RULES,
} from './nmaaGirls'


export class DivisionRulesError
  extends Error {

  constructor(
    message: string,
  ) {
    super(message)

    this.name =
      'DivisionRulesError'
  }
}


export function getDivisionRules(
  division: Division,
): AssociationRules {

  switch (
    division.ruleSet
  ) {
    case 'THSPA':
      return THSPA_RULES

    case 'THSWPA':
      return THSWPA_RULES

    case 'NMAA_BOYS':
      return NMAA_BOYS_RULES

    case 'NMAA_GIRLS':
      return NMAA_GIRLS_RULES

    default:
      throw new DivisionRulesError(
        `Division "${division.name}" must have an assigned rule set.`,
      )
  }
}
