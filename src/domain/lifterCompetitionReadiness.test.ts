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
  validateLifterCompetitionReadiness,
} from './lifterCompetitionReadiness'

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

    lifters: [],
  }
}

function createLifter():
  Lifter {

  return {
    id: 100,
    lifterNumber: 1,
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

describe(
  'PowerScore lifter competition readiness',
  () => {

    test('complete lifter is ready for competition', () => {

      const result =
        validateLifterCompetitionReadiness(
          createLifter(),
          createMeetState(),
          THSPA_RULES,
        )

      expect(
        result.ready
      ).toBe(true)

      expect(
        result.errors
      ).toEqual([])
    })

    test('next higher assigned class is ready for competition', () => {

      const lifter =
        createLifter()

      lifter.weightClass =
        '181'

      lifter.weightClassSource =
        'manual'

      const result =
        validateLifterCompetitionReadiness(
          lifter,
          createMeetState(),
          THSPA_RULES,
        )

      expect(
        result.ready
      ).toBe(true)

      expect(
        result.errors
      ).toEqual([])
    })

    test('missing body weight prevents competition readiness', () => {

      const lifter =
        createLifter()

      lifter.bodyWeight =
        null

      lifter.weightClass =
        null

      const result =
        validateLifterCompetitionReadiness(
          lifter,
          createMeetState(),
          THSPA_RULES,
        )

      expect(
        result.ready
      ).toBe(false)

      expect(
        result.errors.map(
          error =>
            error.code
        )
      ).toEqual([
        'BODY_WEIGHT_REQUIRED',
        'WEIGHT_CLASS_REQUIRED',
      ])
    })

    test('zero body weight prevents competition readiness', () => {

      const lifter =
        createLifter()

      lifter.bodyWeight =
        0

      const result =
        validateLifterCompetitionReadiness(
          lifter,
          createMeetState(),
          THSPA_RULES,
        )

      expect(
        result.ready
      ).toBe(false)

      expect(
        result.errors.some(
          error =>
            error.code ===
            'BODY_WEIGHT_REQUIRED'
        )
      ).toBe(true)
    })

    test('missing assigned weight class prevents competition readiness', () => {

      const lifter =
        createLifter()

      lifter.weightClass =
        null

      const result =
        validateLifterCompetitionReadiness(
          lifter,
          createMeetState(),
          THSPA_RULES,
        )

      expect(
        result.ready
      ).toBe(false)

      expect(
        result.errors.some(
          error =>
            error.code ===
            'WEIGHT_CLASS_REQUIRED'
        )
      ).toBe(true)
    })

    test('class above next higher class prevents competition readiness', () => {

      const lifter =
        createLifter()

      lifter.weightClass =
        '198'

      lifter.weightClassSource =
        'manual'

      const result =
        validateLifterCompetitionReadiness(
          lifter,
          createMeetState(),
          THSPA_RULES,
        )

      expect(
        result.ready
      ).toBe(false)

      expect(
        result.errors.some(
          error =>
            error.code ===
            'INVALID_WEIGHT_CLASS'
        )
      ).toBe(true)
    })

    test('unknown association class prevents competition readiness', () => {

      const lifter =
        createLifter()

      lifter.weightClass =
        '175'

      lifter.weightClassSource =
        'manual'

      const result =
        validateLifterCompetitionReadiness(
          lifter,
          createMeetState(),
          THSPA_RULES,
        )

      expect(
        result.ready
      ).toBe(false)

      expect(
        result.errors.some(
          error =>
            error.code ===
            'INVALID_WEIGHT_CLASS'
        )
      ).toBe(true)
    })

    test('nonexistent division prevents competition readiness', () => {

      const lifter =
        createLifter()

      lifter.divisionId =
        999

      const result =
        validateLifterCompetitionReadiness(
          lifter,
          createMeetState(),
          THSPA_RULES,
        )

      expect(
        result.ready
      ).toBe(false)

      expect(
        result.errors.some(
          error =>
            error.code ===
            'DIVISION_NOT_FOUND'
        )
      ).toBe(true)
    })

    test('nonexistent team prevents competition readiness', () => {

      const lifter =
        createLifter()

      lifter.teamId =
        999

      const result =
        validateLifterCompetitionReadiness(
          lifter,
          createMeetState(),
          THSPA_RULES,
        )

      expect(
        result.ready
      ).toBe(false)

      expect(
        result.errors.some(
          error =>
            error.code ===
            'TEAM_NOT_FOUND'
        )
      ).toBe(true)
    })

    test('unattached lifter is ready without a team', () => {

      const lifter =
        createLifter()

      lifter.teamId =
        null

      const result =
        validateLifterCompetitionReadiness(
          lifter,
          createMeetState(),
          THSPA_RULES,
        )

      expect(
        result.ready
      ).toBe(true)

      expect(
        result.errors
      ).toEqual([])
    })

    test('age and grade are not required for competition readiness', () => {

      const lifter =
        createLifter()

      lifter.age =
        null

      lifter.grade =
        null

      const result =
        validateLifterCompetitionReadiness(
          lifter,
          createMeetState(),
          THSPA_RULES,
        )

      expect(
        result.ready
      ).toBe(true)
    })

    test('declared deadlift opener is not required for competition readiness', () => {

      const lifter =
        createLifter()

      lifter.declaredDeadliftOpener =
        null

      const result =
        validateLifterCompetitionReadiness(
          lifter,
          createMeetState(),
          THSPA_RULES,
        )

      expect(
        result.ready
      ).toBe(true)
    })

  }
)