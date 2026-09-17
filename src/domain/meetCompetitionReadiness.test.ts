import {
  describe,
  expect,
  test,
} from 'vitest'

import type {
  Lifter,
} from '../models/Lifter'

import type {
  MeetState,
} from '../models/MeetState'

import {
  THSPA_RULES,
} from '../rules/thspa'

import {
  validateMeetCompetitionReadiness,
} from './meetCompetitionReadiness'

function createLifter(
  id: number,
  lifterNumber: number,
): Lifter {

  return {
    id,
    lifterNumber,
    firstName:
      `Lifter${id}`,
    lastName:
      'Test',
    divisionId: 10,
    teamId: 20,
    bodyWeight: 160,
    weightClass: '165',
    weightClassSource:
      'automatic',
    equipmentType:
      'equipped',
    age: 17,
    grade: 11,
    status: 'active',
    isGuest: false,
    isExtraLifter: false,
    declaredDeadliftOpener:
      null,
  }
}

function createMeetState(
  lifters: Lifter[],
): MeetState {

  return {
    meet: {
      id: 'meet-1',
      name: 'Test Meet',
      date: '2026-09-16',
      location: 'Test Gym',
      association: 'THSPA',
      resultEntryMode:
        'best-lift-only',
    },

    divisions: [
      {
        id: 10,
        meetId: 'meet-1',
        name: 'Division 1',
      },
    ],

    teams: [
      {
        id: 20,
        meetId: 'meet-1',
        name: 'Sundown',
        region: null,
        classification: null,
      },
    ],

    lifters,
  }
}

describe(
  'PowerScore meet competition readiness',
  () => {

    test('empty meet is ready with zero lifters', () => {

      const result =
        validateMeetCompetitionReadiness(
          createMeetState([]),
          THSPA_RULES,
        )

      expect(
        result.ready
      ).toBe(true)

      expect(
        result.totalLifters
      ).toBe(0)

      expect(
        result.competingLifters
      ).toBe(0)

      expect(
        result.readyLifters
      ).toBe(0)

      expect(
        result.notReadyLifters
      ).toBe(0)

      expect(
        result.notCompetingLifters
      ).toBe(0)

      expect(
        result.lifters
      ).toEqual([])
    })

    test('meet with all complete active lifters is ready', () => {

      const state =
        createMeetState([
          createLifter(
            100,
            1,
          ),
          createLifter(
            200,
            2,
          ),
        ])

      const result =
        validateMeetCompetitionReadiness(
          state,
          THSPA_RULES,
        )

      expect(
        result.ready
      ).toBe(true)

      expect(
        result.totalLifters
      ).toBe(2)

      expect(
        result.competingLifters
      ).toBe(2)

      expect(
        result.readyLifters
      ).toBe(2)

      expect(
        result.notReadyLifters
      ).toBe(0)

      expect(
        result.notCompetingLifters
      ).toBe(0)
    })

    test('meet is not ready when one active lifter is incomplete', () => {

      const readyLifter =
        createLifter(
          100,
          1,
        )

      const incompleteLifter =
        createLifter(
          200,
          2,
        )

      incompleteLifter.bodyWeight =
        null

      incompleteLifter.weightClass =
        null

      const state =
        createMeetState([
          readyLifter,
          incompleteLifter,
        ])

      const result =
        validateMeetCompetitionReadiness(
          state,
          THSPA_RULES,
        )

      expect(
        result.ready
      ).toBe(false)

      expect(
        result.totalLifters
      ).toBe(2)

      expect(
        result.competingLifters
      ).toBe(2)

      expect(
        result.readyLifters
      ).toBe(1)

      expect(
        result.notReadyLifters
      ).toBe(1)

      expect(
        result.notCompetingLifters
      ).toBe(0)
    })

    test('summary identifies ready active lifter by id and number', () => {

      const state =
        createMeetState([
          createLifter(
            100,
            17,
          ),
        ])

      const result =
        validateMeetCompetitionReadiness(
          state,
          THSPA_RULES,
        )

      expect(
        result.lifters[0]
      ).toEqual({
        lifterId: 100,
        lifterNumber: 17,
        ready: true,
        requiresReadiness: true,
        errors: [],
      })
    })

    test('summary preserves readiness errors for incomplete active lifter', () => {

      const lifter =
        createLifter(
          100,
          17,
        )

      lifter.bodyWeight =
        null

      lifter.weightClass =
        null

      const state =
        createMeetState([
          lifter,
        ])

      const result =
        validateMeetCompetitionReadiness(
          state,
          THSPA_RULES,
        )

      const lifterResult =
        result.lifters[0]

      expect(
        lifterResult.ready
      ).toBe(false)

      expect(
        lifterResult.requiresReadiness
      ).toBe(true)

      expect(
        lifterResult.errors.map(
          error =>
            error.code
        )
      ).toEqual([
        'BODY_WEIGHT_REQUIRED',
        'WEIGHT_CLASS_REQUIRED',
      ])
    })

    test('summary counts multiple incomplete active lifters', () => {

      const lifter1 =
        createLifter(
          100,
          1,
        )

      const lifter2 =
        createLifter(
          200,
          2,
        )

      const lifter3 =
        createLifter(
          300,
          3,
        )

      lifter2.bodyWeight =
        null

      lifter2.weightClass =
        null

      lifter3.teamId =
        999

      const state =
        createMeetState([
          lifter1,
          lifter2,
          lifter3,
        ])

      const result =
        validateMeetCompetitionReadiness(
          state,
          THSPA_RULES,
        )

      expect(
        result.totalLifters
      ).toBe(3)

      expect(
        result.competingLifters
      ).toBe(3)

      expect(
        result.readyLifters
      ).toBe(1)

      expect(
        result.notReadyLifters
      ).toBe(2)

      expect(
        result.notCompetingLifters
      ).toBe(0)

      expect(
        result.ready
      ).toBe(false)
    })

    test('next-higher-class active lifter is counted as ready', () => {

      const lifter =
        createLifter(
          100,
          1,
        )

      lifter.weightClass =
        '181'

      lifter.weightClassSource =
        'manual'

      const state =
        createMeetState([
          lifter,
        ])

      const result =
        validateMeetCompetitionReadiness(
          state,
          THSPA_RULES,
        )

      expect(
        result.ready
      ).toBe(true)

      expect(
        result.competingLifters
      ).toBe(1)

      expect(
        result.readyLifters
      ).toBe(1)

      expect(
        result.notReadyLifters
      ).toBe(0)
    })

    test('unattached active lifter is counted as ready', () => {

      const lifter =
        createLifter(
          100,
          1,
        )

      lifter.teamId =
        null

      const state =
        createMeetState([
          lifter,
        ])

      const result =
        validateMeetCompetitionReadiness(
          state,
          THSPA_RULES,
        )

      expect(
        result.ready
      ).toBe(true)

      expect(
        result.competingLifters
      ).toBe(1)

      expect(
        result.readyLifters
      ).toBe(1)
    })

    test('incomplete scratched lifter does not prevent meet readiness', () => {

      const lifter =
        createLifter(
          100,
          1,
        )

      lifter.status =
        'scratched'

      lifter.bodyWeight =
        null

      lifter.weightClass =
        null

      const state =
        createMeetState([
          lifter,
        ])

      const result =
        validateMeetCompetitionReadiness(
          state,
          THSPA_RULES,
        )

      expect(
        result.ready
      ).toBe(true)

      expect(
        result.totalLifters
      ).toBe(1)

      expect(
        result.competingLifters
      ).toBe(0)

      expect(
        result.readyLifters
      ).toBe(0)

      expect(
        result.notReadyLifters
      ).toBe(0)

      expect(
        result.notCompetingLifters
      ).toBe(1)

      expect(
        result.lifters[0].requiresReadiness
      ).toBe(false)
    })

    test('bombed lifter is counted as not competing', () => {

      const lifter =
        createLifter(
          100,
          1,
        )

      lifter.status =
        'bombed'

      const result =
        validateMeetCompetitionReadiness(
          createMeetState([
            lifter,
          ]),
          THSPA_RULES,
        )

      expect(
        result.ready
      ).toBe(true)

      expect(
        result.competingLifters
      ).toBe(0)

      expect(
        result.readyLifters
      ).toBe(0)

      expect(
        result.notCompetingLifters
      ).toBe(1)
    })

    test('disqualified lifter is counted as not competing', () => {

      const lifter =
        createLifter(
          100,
          1,
        )

      lifter.status =
        'disqualified'

      const result =
        validateMeetCompetitionReadiness(
          createMeetState([
            lifter,
          ]),
          THSPA_RULES,
        )

      expect(
        result.ready
      ).toBe(true)

      expect(
        result.competingLifters
      ).toBe(0)

      expect(
        result.readyLifters
      ).toBe(0)

      expect(
        result.notCompetingLifters
      ).toBe(1)
    })

    test('scratched lifter does not hide incomplete active lifter', () => {

      const scratched =
        createLifter(
          100,
          1,
        )

      scratched.status =
        'scratched'

      scratched.bodyWeight =
        null

      scratched.weightClass =
        null

      const active =
        createLifter(
          200,
          2,
        )

      active.bodyWeight =
        null

      active.weightClass =
        null

      const result =
        validateMeetCompetitionReadiness(
          createMeetState([
            scratched,
            active,
          ]),
          THSPA_RULES,
        )

      expect(
        result.ready
      ).toBe(false)

      expect(
        result.totalLifters
      ).toBe(2)

      expect(
        result.competingLifters
      ).toBe(1)

      expect(
        result.readyLifters
      ).toBe(0)

      expect(
        result.notReadyLifters
      ).toBe(1)

      expect(
        result.notCompetingLifters
      ).toBe(1)
    })

  }
)