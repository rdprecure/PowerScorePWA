export interface Team {
  id: number
  meetId: string
  name: string
  region: string | null
  classification: string | null

  /**
   * When true, every lifter assigned to this team is treated
   * as a B Team lifter for team-scoring eligibility.
   *
   * Optional during migration so existing saved meets and
   * test fixtures continue to behave as regular A Teams.
   */
  isBTeam?: boolean
}
