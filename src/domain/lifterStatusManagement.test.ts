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
  hasLifterCompetitionEnded,
  isLifterActive,
  markLifterActive,
  markLifterBombed,
  markLifterDisqualified,
  markLifterScratched,
  removeLifterFromMeet,
  updateLifterStatus,
} from './lifterStatusManagement'

function createLifter(
  id = 100,
  lifterNumber = 1,
): Lifter {

  return {
    id,
    lifterNumber,
    firstName: 'John',
    lastName: 'Smith',
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

function createMeetState():
  MeetState {

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

    lifters: [
      createLifter(
        100,
        1,
      ),

      createLifter(
        200,
        2,
      ),
    ],
  }
}

describe(
  'PowerScore lifter status management',
  () => {

    test('new lifter can be marked bombed', () => {

      const lifter =
        createLifter()

      const updated =
        markLifterBombed(
          lifter
        )

      expect(
        updated.status
      ).toBe('bombed')

      expect(
        lifter.status
      ).toBe('active')
    })

    test('lifter can be marked scratched', () => {

      const lifter =
        createLifter()

      const updated =
        markLifterScratched(
          lifter
        )

      expect(
        updated.status
      ).toBe('scratched')
    })

    test('lifter can be marked disqualified', () => {

      const lifter =
        createLifter()

      const updated =
        markLifterDisqualified(
          lifter
        )

      expect(
        updated.status
      ).toBe('disqualified')
    })

    test('lifter can be returned to active status', () => {

      const lifter =
        createLifter()

      lifter.status =
        'scratched'

      const updated =
        markLifterActive(
          lifter
        )

      expect(
        updated.status
      ).toBe('active')
    })

    test('generic status update supports existing lifter statuses', () => {

      const lifter =
        createLifter()

      const updated =
        updateLifterStatus(
          lifter,
          'disqualified',
        )

      expect(
        updated.status
      ).toBe('disqualified')
    })

    test('active lifter is identified as active', () => {

      const lifter =
        createLifter()

      expect(
        isLifterActive(
          lifter
        )
      ).toBe(true)

      expect(
        hasLifterCompetitionEnded(
          lifter
        )
      ).toBe(false)
    })

    test('bombed lifter has ended competition', () => {

      const lifter =
        markLifterBombed(
          createLifter()
        )

      expect(
        isLifterActive(
          lifter
        )
      ).toBe(false)

      expect(
        hasLifterCompetitionEnded(
          lifter
        )
      ).toBe(true)
    })

    test('scratched lifter has ended competition', () => {

      const lifter =
        markLifterScratched(
          createLifter()
        )

      expect(
        hasLifterCompetitionEnded(
          lifter
        )
      ).toBe(true)
    })

    test('disqualified lifter has ended competition', () => {

      const lifter =
        markLifterDisqualified(
          createLifter()
        )

      expect(
        hasLifterCompetitionEnded(
          lifter
        )
      ).toBe(true)
    })

    test('removes selected lifter from meet', () => {

      const state =
        createMeetState()

      const updated =
        removeLifterFromMeet(
          state,
          100,
        )

      expect(
        updated.lifters
      ).toHaveLength(1)

      expect(
        updated.lifters[0].id
      ).toBe(200)
    })

    test('removing lifter does not modify original meet state', () => {

      const state =
        createMeetState()

      const updated =
        removeLifterFromMeet(
          state,
          100,
        )

      expect(
        state.lifters
      ).toHaveLength(2)

      expect(
        updated.lifters
      ).toHaveLength(1)
    })

    test('removing nonexistent lifter leaves lifter collection unchanged', () => {

      const state =
        createMeetState()

      const updated =
        removeLifterFromMeet(
          state,
          999,
        )

      expect(
        updated.lifters
      ).toEqual(
        state.lifters
      )
    })

  }
)