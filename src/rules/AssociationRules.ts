import type {
  TeamScoringRules,
} from '../scoring/teamScore'

import type {
  TeamStandingRules,
} from '../scoring/teamStandings'

import type {
  WeightClass,
} from '../models/WeightClass'

import type {
  BestLifterRules,
} from '../models/BestLifterGroup'

export type Association =
  'THSPA' |
  'THSWPA' |
  'NMAA'

export type CoefficientType =
  'schwartz' |
  'malone' |
  'none'

export type WeightClassSelectionPolicy =
  'body-weight-class-only' |
  'body-weight-or-next-class'

export interface CoefficientRules {
  type: CoefficientType
  roundUpBodyWeight: boolean
}

export interface AssociationRules {
  association: Association
  individualPoints: number[]
  teamScoring: TeamScoringRules
  teamStandings: TeamStandingRules
  weightClasses: WeightClass[]
  weightClassSelectionPolicy:
    WeightClassSelectionPolicy
  coefficient: CoefficientRules
  bestLifter: BestLifterRules
}