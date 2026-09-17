export type DivisionRuleSet =
  | 'THSPA'
  | 'THSWPA'
  | 'NMAA_BOYS'
  | 'NMAA_GIRLS'

export interface Division {
  id: number
  meetId: string
  name: string

  /**
   * Identifies the association/gender rule set used
   * to calculate this division's weight classes,
   * individual placing, team points, team standings,
   * coefficients, and Best Lifter awards.
   *
   * Optional temporarily so existing test fixtures
   * can be migrated incrementally. New application
   * divisions always receive an explicit ruleSet.
   */
  ruleSet?: DivisionRuleSet
}
