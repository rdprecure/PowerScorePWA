import {
  describe,
  expect,
  test,
} from 'vitest'

import type {
  MeetState,
} from '../models/MeetState'

import type {
  Lifter,
} from '../models/Lifter'

import {
  THSPA_RULES,
} from '../rules/thspa'

import {
  assignRegisteredLifterWeightClass,
  createRegisteredLifter,
  LifterRegistrationError,
  updateRegisteredLifterBodyWeight,
} from './lifterRegistration'

function createEmptyMeetState():
  MeetState {

  return {
    meet: {
      id: 'meet-1',
      name: 'Test Meet',
      date: '2026-09-16',
      resultEntryMode: 'best-lift-only',
      location: 'Test Gym',
    },

    divisions: [
      {
        id: 10,
        meetId: 'meet-1',
        name: 'Division 1',
        ruleSet: 'THSPA',
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

    lifters: [],
  }
}

function createTestLifter():
  Lifter {

  return {
    id: 100,
    lifterNumber: 1,
    firstName: 'Test',
    lastName: 'Lifter',
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

describe(
  'PowerScore lifter registration',
  () => {

    test('creates lifter with automatic weight class', () => {

      const state =
        createEmptyMeetState()

      const lifter =
        createRegisteredLifter(
          state,
          {
            id: 100,
            lifterNumber: 1,
            firstName: 'John',
            lastName: 'Smith',
            divisionId: 10,
            teamId: 20,
            bodyWeight: 160,
            equipmentType:
              'equipped',
            age: 17,
            grade: 11,
            isGuest: false,
            isExtraLifter: false,
          },
          THSPA_RULES,
        )

      expect(
        lifter.weightClass
      ).toBe('165')

      expect(
        lifter.weightClassSource
      ).toBe('automatic')

      expect(
        lifter.status
      ).toBe('active')

      expect(
        lifter.declaredDeadliftOpener
      ).toBeNull()
    })

    test('allows lifter to be created before body weight is entered', () => {

      const state =
        createEmptyMeetState()

      const lifter =
        createRegisteredLifter(
          state,
          {
            id: 100,
            lifterNumber: 1,
            firstName: 'John',
            lastName: 'Smith',
            divisionId: 10,
            teamId: 20,
            bodyWeight: null,
            equipmentType:
              'equipped',
            age: 17,
            grade: 11,
            isGuest: false,
            isExtraLifter: false,
          },
          THSPA_RULES,
        )

      expect(
        lifter.bodyWeight
      ).toBeNull()

      expect(
        lifter.weightClass
      ).toBeNull()

      expect(
        lifter.weightClassSource
      ).toBe('automatic')
    })

    test('rejects duplicate lifter number anywhere in meet', () => {

      const state =
        createEmptyMeetState()

      state.lifters.push(
        createTestLifter()
      )

      expect(
        () =>
          createRegisteredLifter(
            state,
            {
              id: 200,
              lifterNumber: 1,
              firstName: 'Jane',
              lastName: 'Jones',
              divisionId: 10,
              teamId: null,
              bodyWeight: 150,
              equipmentType:
                'unequipped',
              age: 16,
              grade: 10,
              isGuest: false,
              isExtraLifter: false,
            },
            THSPA_RULES,
          )
      ).toThrow(
        LifterRegistrationError
      )

      try {
        createRegisteredLifter(
          state,
          {
            id: 200,
            lifterNumber: 1,
            firstName: 'Jane',
            lastName: 'Jones',
            divisionId: 10,
            teamId: null,
            bodyWeight: 150,
            equipmentType:
              'unequipped',
            age: 16,
            grade: 10,
            isGuest: false,
            isExtraLifter: false,
          },
          THSPA_RULES,
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

    test('allows unattached lifter with null team', () => {

      const state =
        createEmptyMeetState()

      const lifter =
        createRegisteredLifter(
          state,
          {
            id: 100,
            lifterNumber: 1,
            firstName: 'John',
            lastName: 'Smith',
            divisionId: 10,
            teamId: null,
            bodyWeight: 160,
            equipmentType:
              'equipped',
            age: 17,
            grade: 11,
            isGuest: false,
            isExtraLifter: false,
          },
          THSPA_RULES,
        )

      expect(
        lifter.teamId
      ).toBeNull()
    })

    test('rejects nonexistent division', () => {

      const state =
        createEmptyMeetState()

      expect(
        () =>
          createRegisteredLifter(
            state,
            {
              id: 100,
              lifterNumber: 1,
              firstName: 'John',
              lastName: 'Smith',
              divisionId: 999,
              teamId: 20,
              bodyWeight: 160,
              equipmentType:
                'equipped',
              age: 17,
              grade: 11,
              isGuest: false,
              isExtraLifter: false,
            },
            THSPA_RULES,
          )
      ).toThrow(
        LifterRegistrationError
      )
    })

    test('rejects nonexistent team', () => {

      const state =
        createEmptyMeetState()

      expect(
        () =>
          createRegisteredLifter(
            state,
            {
              id: 100,
              lifterNumber: 1,
              firstName: 'John',
              lastName: 'Smith',
              divisionId: 10,
              teamId: 999,
              bodyWeight: 160,
              equipmentType:
                'equipped',
              age: 17,
              grade: 11,
              isGuest: false,
              isExtraLifter: false,
            },
            THSPA_RULES,
          )
      ).toThrow(
        LifterRegistrationError
      )
    })

    test('body weight change updates automatic weight class', () => {

      const lifter =
        createTestLifter()

      const updated =
        updateRegisteredLifterBodyWeight(
          lifter,
          170,
          THSPA_RULES,
        )

      expect(
        updated.bodyWeight
      ).toBe(170)

      expect(
        updated.weightClass
      ).toBe('181')

      expect(
        updated.weightClassSource
      ).toBe('automatic')
    })

    test('manual next higher class is accepted', () => {

      const lifter =
        createTestLifter()

      const updated =
        assignRegisteredLifterWeightClass(
          lifter,
          '181',
          THSPA_RULES,
        )

      expect(
        updated.weightClass
      ).toBe('181')

      expect(
        updated.weightClassSource
      ).toBe('manual')
    })

    test('manual class is preserved when body weight changes', () => {

      const lifter =
        assignRegisteredLifterWeightClass(
          createTestLifter(),
          '181',
          THSPA_RULES,
        )

      const updated =
        updateRegisteredLifterBodyWeight(
          lifter,
          150,
          THSPA_RULES,
        )

      expect(
        updated.bodyWeight
      ).toBe(150)

      expect(
        updated.weightClass
      ).toBe('181')

      expect(
        updated.weightClassSource
      ).toBe('manual')
    })

    test('class above next higher class is rejected', () => {

      const lifter =
        createTestLifter()

      expect(
        () =>
          assignRegisteredLifterWeightClass(
            lifter,
            '198',
            THSPA_RULES,
          )
      ).toThrow(
        LifterRegistrationError
      )
    })

    test('unknown association weight class is rejected', () => {

      const lifter =
        createTestLifter()

      expect(
        () =>
          assignRegisteredLifterWeightClass(
            lifter,
            '175',
            THSPA_RULES,
          )
      ).toThrow(
        LifterRegistrationError
      )
    })

  }
)
