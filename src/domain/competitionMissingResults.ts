import type {
  CompetitionProgressAttemptKey,
  CompetitionProgressLifter,
  CompetitionProgressLift,
} from './competitionProgress'

const LIFT_ORDER:
  CompetitionProgressLift[] = [
    'squat',
    'bench',
    'deadlift',
  ]

const ATTEMPT_ORDER:
  CompetitionProgressAttemptKey[] = [
    'attempt1',
    'attempt2',
    'attempt3',
  ]

export function isPositiveCompetitionWeight(
  value: number | null | undefined,
): boolean {
  return (
    value != null &&
    Number.isFinite(value) &&
    value > 0
  )
}

export function isBestLiftResultComplete(
  lifter: CompetitionProgressLifter,
  lift: CompetitionProgressLift,
): boolean {
  return isPositiveCompetitionWeight(
    lifter.bestLiftResults?.[lift],
  )
}

export function isAttemptResultComplete(
  lifter: CompetitionProgressLifter,
  lift: CompetitionProgressLift,
  attemptKey: CompetitionProgressAttemptKey,
): boolean {
  const attempt =
    lifter.allAttemptResults?.[lift]?.[attemptKey]

  return (
    attempt != null &&
    isPositiveCompetitionWeight(
      attempt.weight,
    ) &&
    (
      attempt.status === 'good' ||
      attempt.status === 'bad'
    )
  )
}

export function isBestLiftResultMissing(
  lifter: CompetitionProgressLifter,
  lift: CompetitionProgressLift,
  reviewAllMissing: boolean,
): boolean {
  if (
    lifter.status !== 'active' ||
    isBestLiftResultComplete(
      lifter,
      lift,
    )
  ) {
    return false
  }

  if (
    reviewAllMissing
  ) {
    return true
  }

  const liftIndex =
    LIFT_ORDER.indexOf(
      lift,
    )

  return LIFT_ORDER
    .slice(
      liftIndex + 1,
    )
    .some(
      laterLift =>
        isBestLiftResultComplete(
          lifter,
          laterLift,
        ),
    )
}

export function isAttemptResultMissing(
  lifter: CompetitionProgressLifter,
  lift: CompetitionProgressLift,
  attemptKey: CompetitionProgressAttemptKey,
  reviewAllMissing: boolean,
): boolean {
  if (
    lifter.status !== 'active' ||
    isAttemptResultComplete(
      lifter,
      lift,
      attemptKey,
    )
  ) {
    return false
  }

  if (
    reviewAllMissing
  ) {
    return true
  }

  const attemptIndex =
    ATTEMPT_ORDER.indexOf(
      attemptKey,
    )

  const laterAttemptExists =
    ATTEMPT_ORDER
      .slice(
        attemptIndex + 1,
      )
      .some(
        laterAttemptKey =>
          isAttemptResultComplete(
            lifter,
            lift,
            laterAttemptKey,
          ),
      )

  if (
    laterAttemptExists
  ) {
    return true
  }

  const liftIndex =
    LIFT_ORDER.indexOf(
      lift,
    )

  return LIFT_ORDER
    .slice(
      liftIndex + 1,
    )
    .some(
      laterLift =>
        ATTEMPT_ORDER.some(
          laterAttemptKey =>
            isAttemptResultComplete(
              lifter,
              laterLift,
              laterAttemptKey,
            ),
        ),
    )
}


export interface CompetitionProgressSequencedLifter
  extends CompetitionProgressLifter {
  lifterNumber: number
}

export function hasLaterBestLiftResultInSequence(
  lifter: CompetitionProgressSequencedLifter,
  peers: readonly CompetitionProgressSequencedLifter[],
  lift: CompetitionProgressLift,
): boolean {
  return peers.some(
    peer =>
      peer.status === 'active' &&
      peer.divisionId === lifter.divisionId &&
      peer.weightClass === lifter.weightClass &&
      peer.lifterNumber > lifter.lifterNumber &&
      isBestLiftResultComplete(
        peer,
        lift,
      ),
  )
}

export function hasLaterAttemptResultInSequence(
  lifter: CompetitionProgressSequencedLifter,
  peers: readonly CompetitionProgressSequencedLifter[],
  lift: CompetitionProgressLift,
  attemptKey: CompetitionProgressAttemptKey,
): boolean {
  return peers.some(
    peer =>
      peer.status === 'active' &&
      peer.divisionId === lifter.divisionId &&
      peer.weightClass === lifter.weightClass &&
      peer.lifterNumber > lifter.lifterNumber &&
      isAttemptResultComplete(
        peer,
        lift,
        attemptKey,
      ),
  )
}
