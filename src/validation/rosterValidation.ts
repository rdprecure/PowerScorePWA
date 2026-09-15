import type {
    AssociationRules,
  } from '../rules/AssociationRules'
  
  import type {
    LifterStatus,
  } from '../models/LifterStatus'
  
  import {
    getWeightClass,
  } from '../scoring/weightClass'
  
  export type ValidationSeverity =
    | 'error'
    | 'warning'
  
  export type RosterValidationCode =
    | 'TEAM_ROSTER_LIMIT_EXCEEDED'
    | 'WEIGHT_CLASS_LIMIT_EXCEEDED'
    | 'BODY_WEIGHT_MISSING'
    | 'BODY_WEIGHT_INVALID'
  
  export interface RosterValidationCandidate {
    id: number
    teamId: number | null
    bodyWeight: number | null
    status: LifterStatus
    isGuest: boolean
    isExtraLifter: boolean
  }
  
  export interface RosterValidationIssue {
    code: RosterValidationCode
    severity: ValidationSeverity
  
    teamId?: number
    lifterId?: number
    weightClass?: string
  
    message: string
  }
  
  function countsTowardTeamRoster(
    lifter: RosterValidationCandidate
  ): boolean {
  
    if (lifter.teamId === null) {
      return false
    }
  
    if (lifter.isGuest) {
      return false
    }
  
    if (lifter.isExtraLifter) {
      return false
    }
  
    if (
      lifter.status === 'scratched' ||
      lifter.status === 'disqualified'
    ) {
      return false
    }
  
    return true
  }
  
  export function validateRoster(
    lifters: RosterValidationCandidate[],
    rules: AssociationRules
  ): RosterValidationIssue[] {
  
    const issues: RosterValidationIssue[] = []
  
    /*
     * First validate bodyweights.
     */
    for (const lifter of lifters) {
  
      if (lifter.bodyWeight === null) {
        issues.push({
          code: 'BODY_WEIGHT_MISSING',
          severity: 'warning',
          lifterId: lifter.id,
          teamId:
            lifter.teamId ?? undefined,
          message:
            'Lifter does not have a bodyweight.',
        })
  
        continue
      }
  
      if (
        !Number.isFinite(lifter.bodyWeight) ||
        lifter.bodyWeight <= 0
      ) {
        issues.push({
          code: 'BODY_WEIGHT_INVALID',
          severity: 'error',
          lifterId: lifter.id,
          teamId:
            lifter.teamId ?? undefined,
          message:
            'Lifter has an invalid bodyweight.',
        })
      }
    }
  
    /*
     * Only lifters who count toward the
     * competitive team roster are used
     * for the team-limit checks.
     */
    const teamRosterLifters =
      lifters.filter(
        countsTowardTeamRoster
      )
  
    const teamIds =
      Array.from(
        new Set(
          teamRosterLifters.map(
            (lifter) =>
              lifter.teamId as number
          )
        )
      )
  
    for (const teamId of teamIds) {
  
      const teamLifters =
        teamRosterLifters.filter(
          (lifter) =>
            lifter.teamId === teamId
        )
  
      /*
       * Overall team roster limit.
       */
      if (
        teamLifters.length >
        rules.teamScoring.maxScoringLifters
      ) {
        issues.push({
          code:
            'TEAM_ROSTER_LIMIT_EXCEEDED',
          severity: 'error',
          teamId,
          message:
            `Team has ${teamLifters.length} ` +
            `team competitors; maximum is ` +
            `${rules.teamScoring.maxScoringLifters}.`,
        })
      }
  
      /*
       * Count team competitors by
       * weight class.
       *
       * Missing/invalid bodyweights have
       * already produced their own issue,
       * so they are skipped here.
       */
      const classCounts =
        new Map<string, number>()
  
      for (const lifter of teamLifters) {
  
        if (
          lifter.bodyWeight === null ||
          !Number.isFinite(
            lifter.bodyWeight
          ) ||
          lifter.bodyWeight <= 0
        ) {
          continue
        }
  
        const weightClass =
          getWeightClass(
            lifter.bodyWeight,
            rules.weightClasses
          )
  
        const count =
          classCounts.get(
            weightClass
          ) ?? 0
  
        classCounts.set(
          weightClass,
          count + 1
        )
      }
  
      for (
        const [
          weightClass,
          count,
        ] of classCounts
      ) {
  
        if (
          count >
          rules.teamScoring
            .maxScoringLiftersPerClass
        ) {
          issues.push({
            code:
              'WEIGHT_CLASS_LIMIT_EXCEEDED',
            severity: 'error',
            teamId,
            weightClass,
            message:
              `Team has ${count} competitors ` +
              `in weight class ${weightClass}; ` +
              `maximum is ` +
              `${rules.teamScoring.maxScoringLiftersPerClass}.`,
          })
        }
      }
    }
  
    return issues
  }