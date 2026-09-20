import {
  describe,
  expect,
  test,
} from 'vitest'

import {
  countAttemptProgressResults,
  countBestLiftProgressResults,
  countBestLiftProgressResultsNoBwt,
  getCompetitionProgressCellState,
  getExpectedNoBwtProgressLifters,
  getExpectedProgressLiftersForClass,
  getNoBwtProgressLifters,
  type CompetitionProgressLifter,
} from './competitionProgress'

function makeLifter(
  overrides: Partial<CompetitionProgressLifter> = {},
): CompetitionProgressLifter {
  return {
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

describe('competition data-entry progress', () => {
  test('regression: SC result cannot hide two missing active squat results', () => {
    const lifters =
      Array.from(
        { length: 24 },
        () =>
          makeLifter({
            bestLiftResults: {
              squat: 100,
              bench: null,
              deadlift: null,
            },
          }),
      )

    lifters[8] = makeLifter({
      bestLiftResults: {
        squat: null,
        bench: null,
        deadlift: null,
      },
    })

    lifters[20] = makeLifter({
      bestLiftResults: {
        squat: null,
        bench: null,
        deadlift: null,
      },
    })

    lifters[21] = makeLifter({
      status: 'scratched',
      bestLiftResults: {
        squat: 130,
        bench: null,
        deadlift: null,
      },
    })

    const expected =
      getExpectedProgressLiftersForClass(
        lifters,
        1,
        '181',
      ).length

    const completed =
      countBestLiftProgressResults(
        lifters,
        1,
        '181',
        'squat',
      )

    expect(expected).toBe(23)
    expect(completed).toBe(21)

    expect(
      getCompetitionProgressCellState(
        completed,
        expected,
      ),
    ).toBe('short')
  })

  test('SC lifter with no result does not count as a missing result', () => {
    const lifters = [
      makeLifter({
        bestLiftResults: {
          squat: 100,
          bench: null,
          deadlift: null,
        },
      }),
      makeLifter({
        bestLiftResults: {
          squat: 110,
          bench: null,
          deadlift: null,
        },
      }),
      makeLifter({
        status: 'scratched',
        bestLiftResults: {
          squat: null,
          bench: null,
          deadlift: null,
        },
      }),
    ]

    const expected =
      getExpectedProgressLiftersForClass(
        lifters,
        1,
        '181',
      ).length

    const completed =
      countBestLiftProgressResults(
        lifters,
        1,
        '181',
        'squat',
      )

    expect(expected).toBe(2)
    expect(completed).toBe(2)

    expect(
      getCompetitionProgressCellState(
        completed,
        expected,
      ),
    ).toBe('complete')
  })

  test('BO and DQ lifters are excluded from both completed and expected best-lift counts', () => {
    const lifters = [
      makeLifter({
        bestLiftResults: {
          squat: 100,
          bench: null,
          deadlift: null,
        },
      }),
      makeLifter({
        status: 'bombed',
        bestLiftResults: {
          squat: 120,
          bench: null,
          deadlift: null,
        },
      }),
      makeLifter({
        status: 'disqualified',
        bestLiftResults: {
          squat: null,
          bench: null,
          deadlift: null,
        },
      }),
    ]

    expect(
      getExpectedProgressLiftersForClass(
        lifters,
        1,
        '181',
      ),
    ).toHaveLength(1)

    expect(
      countBestLiftProgressResults(
        lifters,
        1,
        '181',
        'squat',
      ),
    ).toBe(1)
  })

  test('all-attempt progress counts only active lifters judged good or bad', () => {
    const activeGood =
      makeLifter()

    activeGood.allAttemptResults!.squat.attempt1 = {
      weight: 315,
      status: 'good',
    }

    const activeBad =
      makeLifter()

    activeBad.allAttemptResults!.squat.attempt1 = {
      weight: 300,
      status: 'bad',
    }

    const activeUnspecified =
      makeLifter()

    activeUnspecified.allAttemptResults!.squat.attempt1 = {
      weight: 295,
      status: 'unspecified',
    }

    const scratchedGood =
      makeLifter({
        status: 'scratched',
      })

    scratchedGood.allAttemptResults!.squat.attempt1 = {
      weight: 290,
      status: 'good',
    }

    const lifters = [
      activeGood,
      activeBad,
      activeUnspecified,
      scratchedGood,
    ]

    expect(
      getExpectedProgressLiftersForClass(
        lifters,
        1,
        '181',
      ),
    ).toHaveLength(3)

    expect(
      countAttemptProgressResults(
        lifters,
        1,
        '181',
        'squat',
        'attempt1',
      ),
    ).toBe(2)
  })

  test('cell state is yellow at zero, red when partial, green when complete, and neutral when nobody is expected', () => {
    expect(
      getCompetitionProgressCellState(
        0,
        5,
      ),
    ).toBe('zero')

    expect(
      getCompetitionProgressCellState(
        3,
        5,
      ),
    ).toBe('short')

    expect(
      getCompetitionProgressCellState(
        5,
        5,
      ),
    ).toBe('complete')

    expect(
      getCompetitionProgressCellState(
        0,
        0,
      ),
    ).toBe('empty')
  })

  test('No-BWT group includes all no-BWT lifters but expected results include only Active lifters', () => {
    const activeNoBwt =
      makeLifter({
        bodyWeight: null,
        bestLiftResults: {
          squat: 100,
          bench: null,
          deadlift: null,
        },
      })

    const scratchedNoBwt =
      makeLifter({
        bodyWeight: null,
        status: 'scratched',
        bestLiftResults: {
          squat: 110,
          bench: null,
          deadlift: null,
        },
      })

    const activeWithBwt =
      makeLifter({
        bodyWeight: 175,
        bestLiftResults: {
          squat: 120,
          bench: null,
          deadlift: null,
        },
      })

    const lifters = [
      activeNoBwt,
      scratchedNoBwt,
      activeWithBwt,
    ]

    expect(
      getNoBwtProgressLifters(
        lifters,
        1,
      ),
    ).toHaveLength(2)

    expect(
      getExpectedNoBwtProgressLifters(
        lifters,
        1,
      ),
    ).toHaveLength(1)

    expect(
      countBestLiftProgressResultsNoBwt(
        lifters,
        1,
        'squat',
      ),
    ).toBe(1)
  })
  test('best-lift weight of zero is treated as missing progress', () => {
    const lifters = [
      makeLifter({
        bestLiftResults: {
          squat: 0,
          bench: null,
          deadlift: null,
        },
      }),
      makeLifter({
        bestLiftResults: {
          squat: 125,
          bench: null,
          deadlift: null,
        },
      }),
    ]

    expect(
      getExpectedProgressLiftersForClass(
        lifters,
        1,
        '181',
      ),
    ).toHaveLength(2)

    expect(
      countBestLiftProgressResults(
        lifters,
        1,
        '181',
        'squat',
      ),
    ).toBe(1)

    expect(
      getCompetitionProgressCellState(
        1,
        2,
      ),
    ).toBe('short')
  })

  test('judged attempt with weight zero is treated as missing progress', () => {
    const zeroGood =
      makeLifter()

    zeroGood.allAttemptResults!.squat.attempt1 = {
      weight: 0,
      status: 'good',
    }

    const zeroBad =
      makeLifter()

    zeroBad.allAttemptResults!.squat.attempt1 = {
      weight: 0,
      status: 'bad',
    }

    const validBad =
      makeLifter()

    validBad.allAttemptResults!.squat.attempt1 = {
      weight: 300,
      status: 'bad',
    }

    const lifters = [
      zeroGood,
      zeroBad,
      validBad,
    ]

    expect(
      countAttemptProgressResults(
        lifters,
        1,
        '181',
        'squat',
        'attempt1',
      ),
    ).toBe(1)
  })

})
