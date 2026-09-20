export type CompetitionProgressLift =
  | 'squat'
  | 'bench'
  | 'deadlift'

export type CompetitionProgressAttemptKey =
  | 'attempt1'
  | 'attempt2'
  | 'attempt3'

export type CompetitionProgressStatus =
  | 'active'
  | 'bombed'
  | 'scratched'
  | 'disqualified'
  | string

export type CompetitionProgressAttemptStatus =
  | 'good'
  | 'bad'
  | 'unspecified'
  | string

export interface CompetitionProgressAttempt {
  weight?: number | null
  status: CompetitionProgressAttemptStatus
}

export interface CompetitionProgressEventAttempts {
  attempt1: CompetitionProgressAttempt
  attempt2: CompetitionProgressAttempt
  attempt3: CompetitionProgressAttempt
}

export interface CompetitionProgressAllAttempts {
  squat: CompetitionProgressEventAttempts
  bench: CompetitionProgressEventAttempts
  deadlift: CompetitionProgressEventAttempts
}

export interface CompetitionProgressBestLifts {
  squat: number | null
  bench: number | null
  deadlift: number | null
}

export interface CompetitionProgressLifter {
  divisionId: number | null
  weightClass: string | null
  bodyWeight: number | null
  status: CompetitionProgressStatus
  bestLiftResults?: CompetitionProgressBestLifts
  allAttemptResults?: CompetitionProgressAllAttempts
}

export type CompetitionProgressCellState =
  | 'empty'
  | 'zero'
  | 'complete'
  | 'short'

export function getProgressLiftersForClass<
  T extends CompetitionProgressLifter,
>(
  lifters: readonly T[],
  divisionId: number,
  weightClass: string,
): T[] {
  return lifters.filter(
    lifter =>
      lifter.divisionId === divisionId &&
      lifter.weightClass === weightClass,
  )
}

export function getExpectedProgressLiftersForClass<
  T extends CompetitionProgressLifter,
>(
  lifters: readonly T[],
  divisionId: number,
  weightClass: string,
): T[] {
  return getProgressLiftersForClass(
    lifters,
    divisionId,
    weightClass,
  ).filter(
    lifter =>
      lifter.status === 'active',
  )
}

export function countBestLiftProgressResults<
  T extends CompetitionProgressLifter,
>(
  lifters: readonly T[],
  divisionId: number,
  weightClass: string,
  lift: CompetitionProgressLift,
): number {
  return getExpectedProgressLiftersForClass(
    lifters,
    divisionId,
    weightClass,
  ).filter(
    lifter => {
      const weight =
        lifter.bestLiftResults?.[lift]

      return (
        weight != null &&
        Number.isFinite(weight) &&
        weight > 0
      )
    },
  ).length
}

export function countAttemptProgressResults<
  T extends CompetitionProgressLifter,
>(
  lifters: readonly T[],
  divisionId: number,
  weightClass: string,
  lift: CompetitionProgressLift,
  attemptKey: CompetitionProgressAttemptKey,
): number {
  return getExpectedProgressLiftersForClass(
    lifters,
    divisionId,
    weightClass,
  ).filter(
    lifter => {
      const attempt =
        lifter.allAttemptResults?.[lift]?.[attemptKey]

      return (
        attempt != null &&
        Number.isFinite(
          attempt.weight
        ) &&
        (attempt.weight ?? 0) > 0 &&
        (
          attempt.status === 'good' ||
          attempt.status === 'bad'
        )
      )
    },
  ).length
}

export function getNoBwtProgressLifters<
  T extends CompetitionProgressLifter,
>(
  lifters: readonly T[],
  divisionId: number,
): T[] {
  return lifters.filter(
    lifter =>
      lifter.divisionId === divisionId &&
      (
        lifter.bodyWeight == null ||
        !Number.isFinite(lifter.bodyWeight) ||
        lifter.bodyWeight <= 0
      ),
  )
}

export function getExpectedNoBwtProgressLifters<
  T extends CompetitionProgressLifter,
>(
  lifters: readonly T[],
  divisionId: number,
): T[] {
  return getNoBwtProgressLifters(
    lifters,
    divisionId,
  ).filter(
    lifter =>
      lifter.status === 'active',
  )
}

export function countBestLiftProgressResultsNoBwt<
  T extends CompetitionProgressLifter,
>(
  lifters: readonly T[],
  divisionId: number,
  lift: CompetitionProgressLift,
): number {
  return getExpectedNoBwtProgressLifters(
    lifters,
    divisionId,
  ).filter(
    lifter => {
      const weight =
        lifter.bestLiftResults?.[lift]

      return (
        weight != null &&
        Number.isFinite(weight) &&
        weight > 0
      )
    },
  ).length
}

export function countAttemptProgressResultsNoBwt<
  T extends CompetitionProgressLifter,
>(
  lifters: readonly T[],
  divisionId: number,
  lift: CompetitionProgressLift,
  attemptKey: CompetitionProgressAttemptKey,
): number {
  return getExpectedNoBwtProgressLifters(
    lifters,
    divisionId,
  ).filter(
    lifter => {
      const attempt =
        lifter.allAttemptResults?.[lift]?.[attemptKey]

      return (
        attempt != null &&
        Number.isFinite(
          attempt.weight
        ) &&
        (attempt.weight ?? 0) > 0 &&
        (
          attempt.status === 'good' ||
          attempt.status === 'bad'
        )
      )
    },
  ).length
}

export function getCompetitionProgressCellState(
  completedCount: number,
  expectedCount: number,
): CompetitionProgressCellState {
  if (expectedCount <= 0) {
    return 'empty'
  }

  if (completedCount === 0) {
    return 'zero'
  }

  if (completedCount >= expectedCount) {
    return 'complete'
  }

  return 'short'
}
