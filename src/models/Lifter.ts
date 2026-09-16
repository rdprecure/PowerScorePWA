import type {
  AllAttemptResults,
  BestLiftResults,
} from './Competition'

import type { LifterStatus } from './LifterStatus'

export type EquipmentType = 'equipped' | 'unequipped'

export type WeightClassSource = 'automatic' | 'manual'

export interface Lifter {
  id: number

  /**
   * Lifter numbers are unique across the entire PowerScore meet,
   * not merely within a division.
   */
  lifterNumber: number

  firstName: string
  lastName: string

  /**
   * A lifter competes in exactly one division within a PowerScore meet.
   */
  divisionId: number

  /**
   * Null is allowed for an unattached lifter.
   *
   * A Team is not tied to a single division. Lifters from the same
   * school/team may participate in multiple divisions.
   */
  teamId: number | null

  /**
   * Official body weight recorded for the lifter.
   */
  bodyWeight: number | null

  /**
   * The competition weight class assigned to the lifter.
   *
   * This is an authoritative meet designation. Scoring must use this
   * value rather than recalculating the class from bodyWeight.
   */
  weightClass: string | null

  /**
   * Indicates whether the current weight-class assignment was made
   * automatically from body weight or manually by the operator.
   *
   * Once manual, later body-weight changes must not silently overwrite
   * the assigned competition weight class.
   */
  weightClassSource: WeightClassSource

  equipmentType: EquipmentType

  age: number | null
  grade: number | null

  status: LifterStatus

  isGuest: boolean

  /**
   * Extra lifters may place individually when association rules allow,
   * but are not eligible to contribute team points.
   */
  isExtraLifter: boolean

  /**
   * Operational meet value used when a deadlift opener is declared.
   * This corresponds to the legacy CompLift3Declared field.
   */
  declaredDeadliftOpener: number | null

  bestLiftResults?: BestLiftResults
  allAttemptResults?: AllAttemptResults
}