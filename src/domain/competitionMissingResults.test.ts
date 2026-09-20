import {
  describe,
  expect,
  test,
} from 'vitest'

import {
  hasLaterAttemptResultInSequence,
  hasLaterBestLiftResultInSequence,
  hasPeerAttemptResult,
  hasPeerBestLiftResult,
  isAttemptResultMissing,
  isBestLiftResultMissing,
} from './competitionMissingResults'

import type {
  CompetitionProgressLifter,
} from './competitionProgress'

type TestCompetitionProgressLifter =
  CompetitionProgressLifter & {
    lifterNumber: number
  }

function makeLifter(
  overrides:
    Partial<TestCompetitionProgressLifter> = {},
): TestCompetitionProgressLifter {
  return {
    lifterNumber: 1,
    divisionId: 1,
    weightClass: '181',
    bodyWeight: 175,
    status: 'active',
    bestLiftResults: {
      squat: null,
      bench: null,
      deadlift: null,
    },
    allAttemptResults: {
      squat: {
        attempt1: {
          weight: null,
          status: 'unspecified',
        },
        attempt2: {
          weight: null,
          status: 'unspecified',
        },
        attempt3: {
          weight: null,
          status: 'unspecified',
        },
      },
      bench: {
        attempt1: {
          weight: null,
          status: 'unspecified',
        },
        attempt2: {
          weight: null,
          status: 'unspecified',
        },
        attempt3: {
          weight: null,
          status: 'unspecified',
        },
      },
      deadlift: {
        attempt1: {
          weight: null,
          status: 'unspecified',
        },
        attempt2: {
          weight: null,
          status: 'unspecified',
        },
        attempt3: {
          weight: null,
          status: 'unspecified',
        },
      },
    },
    ...overrides,
  }
}

describe('competition missing-result review', () => {
  test('normal best-lift entry does not flag untouched future lifts', () => {
    const lifter =
      makeLifter()

    expect(
      isBestLiftResultMissing(
        lifter,
        'squat',
        false,
      ),
    ).toBe(false)

    expect(
      isBestLiftResultMissing(
        lifter,
        'deadlift',
        false,
      ),
    ).toBe(false)
  })

  test('bench result proves a blank or zero squat was skipped', () => {
    const lifter =
      makeLifter({
        bestLiftResults: {
          squat: 0,
          bench: 225,
          deadlift: null,
        },
      })

    expect(
      isBestLiftResultMissing(
        lifter,
        'squat',
        false,
      ),
    ).toBe(true)
  })

  test('deadlift result proves a blank bench was skipped', () => {
    const lifter =
      makeLifter({
        bestLiftResults: {
          squat: 300,
          bench: null,
          deadlift: 400,
        },
      })

    expect(
      isBestLiftResultMissing(
        lifter,
        'bench',
        false,
      ),
    ).toBe(true)
  })

  test('review mode flags final missing best lift', () => {
    const lifter =
      makeLifter({
        bestLiftResults: {
          squat: 300,
          bench: 225,
          deadlift: 0,
        },
      })

    expect(
      isBestLiftResultMissing(
        lifter,
        'deadlift',
        false,
      ),
    ).toBe(false)

    expect(
      isBestLiftResultMissing(
        lifter,
        'deadlift',
        true,
      ),
    ).toBe(true)
  })

  test('later attempt proves an earlier attempt was skipped', () => {
    const lifter =
      makeLifter()

    lifter.allAttemptResults!.squat.attempt2 = {
      weight: 315,
      status: 'good',
    }

    expect(
      isAttemptResultMissing(
        lifter,
        'squat',
        'attempt1',
        false,
      ),
    ).toBe(true)
  })

  test('starting bench proves remaining blank squat attempts were skipped', () => {
    const lifter =
      makeLifter()

    lifter.allAttemptResults!.bench.attempt1 = {
      weight: 225,
      status: 'good',
    }

    expect(
      isAttemptResultMissing(
        lifter,
        'squat',
        'attempt3',
        false,
      ),
    ).toBe(true)
  })

  test('review mode flags final deadlift attempt with no later evidence', () => {
    const lifter =
      makeLifter()

    expect(
      isAttemptResultMissing(
        lifter,
        'deadlift',
        'attempt3',
        false,
      ),
    ).toBe(false)

    expect(
      isAttemptResultMissing(
        lifter,
        'deadlift',
        'attempt3',
        true,
      ),
    ).toBe(true)
  })

  test('BO SC and DQ lifters are never flagged for missing results', () => {
    for (
      const status of [
        'bombed',
        'scratched',
        'disqualified',
      ]
    ) {
      const lifter =
        makeLifter({
          status,
          bestLiftResults: {
            squat: null,
            bench: 200,
            deadlift: null,
          },
        })

      lifter.allAttemptResults!.bench.attempt1 = {
        weight: 200,
        status: 'good',
      }

      expect(
        isBestLiftResultMissing(
          lifter,
          'squat',
          true,
        ),
      ).toBe(false)

      expect(
        isAttemptResultMissing(
          lifter,
          'squat',
          'attempt1',
          true,
        ),
      ).toBe(false)
    }
  })
  test('later lifter result exposes a missing final best lift in the middle of a started column', () => {
    const current =
      makeLifter({
        lifterNumber: 9,
        bestLiftResults: {
          squat: 100,
          bench: 95,
          deadlift: null,
        },
      })

    const later =
      makeLifter({
        lifterNumber: 10,
        bestLiftResults: {
          squat: 85,
          bench: 120,
          deadlift: 155,
        },
      })

    expect(
      hasLaterBestLiftResultInSequence(
        current,
        [
          current,
          later,
        ],
        'deadlift',
      ),
    ).toBe(true)
  })

  test('no later lifter result means final best lift is not automatically flagged yet', () => {
    const current =
      makeLifter({
        lifterNumber: 9,
        bestLiftResults: {
          squat: 100,
          bench: 95,
          deadlift: null,
        },
      })

    const later =
      makeLifter({
        lifterNumber: 10,
        bestLiftResults: {
          squat: 85,
          bench: 120,
          deadlift: null,
        },
      })

    expect(
      hasLaterBestLiftResultInSequence(
        current,
        [
          current,
          later,
        ],
        'deadlift',
      ),
    ).toBe(false)
  })

  test('later lifter judged attempt exposes a missing attempt in a started column', () => {
    const current =
      makeLifter({
        lifterNumber: 20,
      })

    const later =
      makeLifter({
        lifterNumber: 21,
      })

    later.allAttemptResults!.deadlift.attempt3 = {
      weight: 400,
      status: 'good',
    }

    expect(
      hasLaterAttemptResultInSequence(
        current,
        [
          current,
          later,
        ],
        'deadlift',
        'attempt3',
      ),
    ).toBe(true)
  })

  test('completed best lift is never flagged merely because a later lifter has a result', () => {
    const current =
      makeLifter({
        lifterNumber: 5,
        bestLiftResults: {
          squat: 120,
          bench: null,
          deadlift: null,
        },
      })

    const later =
      makeLifter({
        lifterNumber: 6,
        bestLiftResults: {
          squat: 130,
          bench: null,
          deadlift: null,
        },
      })

    expect(
      isBestLiftResultMissing(
        current,
        'squat',
        false,
      ),
    ).toBe(false)

    expect(
      hasLaterBestLiftResultInSequence(
        current,
        [current, later],
        'squat',
      ),
    ).toBe(true)
  })

  test('completed judged attempt is never missing even when a later lifter has that attempt', () => {
    const current =
      makeLifter({
        lifterNumber: 5,
      })

    const later =
      makeLifter({
        lifterNumber: 6,
      })

    current.allAttemptResults!.squat.attempt1 = {
      weight: 300,
      status: 'good',
    }

    later.allAttemptResults!.squat.attempt1 = {
      weight: 315,
      status: 'good',
    }

    expect(
      isAttemptResultMissing(
        current,
        'squat',
        'attempt1',
        false,
      ),
    ).toBe(false)

    expect(
      hasLaterAttemptResultInSequence(
        current,
        [current, later],
        'squat',
        'attempt1',
      ),
    ).toBe(true)
  })

  test('peer best-lift result can expose a missing result for a highest-number imported lifter', () => {
    const current =
      makeLifter({
        lifterNumber: 999,
        divisionId: 1,
        weightClass: '275',
        bestLiftResults: {
          squat: 500,
          bench: 185,
          deadlift: null,
        },
      })

    const peer =
      makeLifter({
        lifterNumber: 42,
        divisionId: 1,
        weightClass: '275',
        bestLiftResults: {
          squat: 480,
          bench: 260,
          deadlift: 410,
        },
      })

    expect(
      hasPeerBestLiftResult(
        current,
        [
          current,
          peer,
        ],
        'deadlift',
      ),
    ).toBe(true)
  })

  test('peer result must be in the same division and weight class', () => {
    const current =
      makeLifter({
        lifterNumber: 999,
        divisionId: 1,
        weightClass: '275',
      })

    const wrongClass =
      makeLifter({
        lifterNumber: 42,
        divisionId: 1,
        weightClass: '242',
        bestLiftResults: {
          squat: null,
          bench: null,
          deadlift: 410,
        },
      })

    expect(
      hasPeerBestLiftResult(
        current,
        [
          current,
          wrongClass,
        ],
        'deadlift',
      ),
    ).toBe(false)
  })

  test('peer attempt result can expose a missing attempt for an imported lifter', () => {
    const current =
      makeLifter({
        lifterNumber: 999,
        divisionId: 1,
        weightClass: '275',
      })

    const peer =
      makeLifter({
        lifterNumber: 42,
        divisionId: 1,
        weightClass: '275',
      })

    peer.allAttemptResults!.deadlift.attempt3 = {
      weight: 420,
      status: 'good',
    }

    expect(
      hasPeerAttemptResult(
        current,
        [
          current,
          peer,
        ],
        'deadlift',
        'attempt3',
      ),
    ).toBe(true)
  })

})
