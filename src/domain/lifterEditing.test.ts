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
  LifterRegistrationError,
} from './lifterRegistration'

import {
  updateDeclaredDeadliftOpener,
  updateRegisteredLifterCompetition,
  updateRegisteredLifterIdentity,
  updateRegisteredLifterNumber,
  updateRegisteredLifterPersonal,
} from './lifterEditing'

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
      resultEntryMode:
        'best-lift-only',
    },

    divisions: [
      {
        id: 10,
        meetId: 'meet-1',
        name: 'Division 1',
        ruleSet: 'THSPA',
      },
      {
        id: 11,
        meetId: 'meet-1',
        name: 'Division 2',
        ruleSet: 'THSWPA',
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
      {
        id: 21,
        meetId: 'meet-1',
        name: 'Levelland',
        region: null,
        classification: null,
      },
    ],

    lifters: [],
  }
}

describe(
  'PowerScore lifter editing',
  () => {

    test('updates lifter name without changing original lifter', () => {

      const lifter =
        createLifter()

      const updated =
        updateRegisteredLifterIdentity(
          lifter,
          {
            firstName: 'James',
            lastName: 'Jones',
          },
        )

      expect(
        updated.firstName
      ).toBe('James')

      expect(
        updated.lastName
      ).toBe('Jones')

      expect(
        lifter.firstName
      ).toBe('John')

      expect(
        lifter.lastName
      ).toBe('Smith')
    })

    test('changes lifter number when number is unused', () => {

      const lifter =
        createLifter()

      const state =
        createMeetState()

      state.lifters.push(
        lifter
      )

      const updated =
        updateRegisteredLifterNumber(
          lifter,
          25,
          state,
        )

      expect(
        updated.lifterNumber
      ).toBe(25)

      expect(
        lifter.lifterNumber
      ).toBe(1)
    })

    test('allows lifter number to remain unchanged', () => {

      const lifter =
        createLifter()

      const state =
        createMeetState()

      state.lifters.push(
        lifter
      )

      const updated =
        updateRegisteredLifterNumber(
          lifter,
          1,
          state,
        )

      expect(
        updated.lifterNumber
      ).toBe(1)
    })

    test('rejects lifter number already used by another lifter', () => {

      const lifter =
        createLifter(
          100,
          1,
        )

      const otherLifter =
        createLifter(
          200,
          2,
        )

      const state =
        createMeetState()

      state.lifters.push(
        lifter,
        otherLifter,
      )

      expect(
        () =>
          updateRegisteredLifterNumber(
            lifter,
            2,
            state,
          )
      ).toThrow(
        LifterRegistrationError
      )

      try {
        updateRegisteredLifterNumber(
          lifter,
          2,
          state,
        )
      } catch (error) {

        expect(
          error
        ).toBeInstanceOf(
          LifterRegistrationError
        )

        if (
          error instanceof
          LifterRegistrationError
        ) {
          expect(
            error.code
          ).toBe(
            'DUPLICATE_LIFTER_NUMBER'
          )
        }
      }
    })

    test('changes division when division exists', () => {

      const lifter =
        createLifter()

      const updated =
        updateRegisteredLifterCompetition(
          lifter,
          {
            divisionId: 11,
            teamId: 20,
            equipmentType:
              'equipped',
            isGuest: false,
            isExtraLifter: false,
          },
          createMeetState(),
        )

      expect(
        updated.divisionId
      ).toBe(11)
    })

    test('rejects nonexistent division', () => {

      const lifter =
        createLifter()

      expect(
        () =>
          updateRegisteredLifterCompetition(
            lifter,
            {
              divisionId: 999,
              teamId: 20,
              equipmentType:
                'equipped',
              isGuest: false,
              isExtraLifter: false,
            },
            createMeetState(),
          )
      ).toThrow(
        LifterRegistrationError
      )
    })

    test('changes team when team exists', () => {

      const lifter =
        createLifter()

      const updated =
        updateRegisteredLifterCompetition(
          lifter,
          {
            divisionId: 10,
            teamId: 21,
            equipmentType:
              'equipped',
            isGuest: false,
            isExtraLifter: false,
          },
          createMeetState(),
        )

      expect(
        updated.teamId
      ).toBe(21)
    })

    test('allows lifter to become unattached', () => {

      const lifter =
        createLifter()

      const updated =
        updateRegisteredLifterCompetition(
          lifter,
          {
            divisionId: 10,
            teamId: null,
            equipmentType:
              'equipped',
            isGuest: false,
            isExtraLifter: false,
          },
          createMeetState(),
        )

      expect(
        updated.teamId
      ).toBeNull()
    })

    test('rejects nonexistent team', () => {

      const lifter =
        createLifter()

      expect(
        () =>
          updateRegisteredLifterCompetition(
            lifter,
            {
              divisionId: 10,
              teamId: 999,
              equipmentType:
                'equipped',
              isGuest: false,
              isExtraLifter: false,
            },
            createMeetState(),
          )
      ).toThrow(
        LifterRegistrationError
      )
    })

    test('updates equipment and competition flags', () => {

      const lifter =
        createLifter()

      const updated =
        updateRegisteredLifterCompetition(
          lifter,
          {
            divisionId: 10,
            teamId: 20,
            equipmentType:
              'unequipped',
            isGuest: true,
            isExtraLifter: true,
          },
          createMeetState(),
        )

      expect(
        updated.equipmentType
      ).toBe('unequipped')

      expect(
        updated.isGuest
      ).toBe(true)

      expect(
        updated.isExtraLifter
      ).toBe(true)
    })

    test('updates age and grade', () => {

      const lifter =
        createLifter()

      const updated =
        updateRegisteredLifterPersonal(
          lifter,
          {
            age: 18,
            grade: 12,
          },
        )

      expect(
        updated.age
      ).toBe(18)

      expect(
        updated.grade
      ).toBe(12)
    })

    test('allows age and grade to be cleared', () => {

      const lifter =
        createLifter()

      const updated =
        updateRegisteredLifterPersonal(
          lifter,
          {
            age: null,
            grade: null,
          },
        )

      expect(
        updated.age
      ).toBeNull()

      expect(
        updated.grade
      ).toBeNull()
    })

    test('updates declared deadlift opener', () => {

      const lifter =
        createLifter()

      const updated =
        updateDeclaredDeadliftOpener(
          lifter,
          425,
        )

      expect(
        updated.declaredDeadliftOpener
      ).toBe(425)

      expect(
        lifter.declaredDeadliftOpener
      ).toBeNull()
    })

    test('allows declared deadlift opener to be cleared', () => {

      const lifter =
        createLifter()

      lifter.declaredDeadliftOpener =
        425

      const updated =
        updateDeclaredDeadliftOpener(
          lifter,
          null,
        )

      expect(
        updated.declaredDeadliftOpener
      ).toBeNull()
    })

  }
)
