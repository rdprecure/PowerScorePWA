import { describe, expect, it } from 'vitest'

import type { Lifter } from '../models/Lifter'
import type { MeetState } from '../models/MeetState'

import { validateMeetState } from './meetValidation'

function createLifter(
  id: number,
  lifterNumber: number,
  divisionId: number,
  teamId: number | null,
): Lifter {
  return {
    id,
    lifterNumber,
    firstName: `First${id}`,
    lastName: `Last${id}`,
    divisionId,
    teamId,
    bodyWeight: 180,
    weightClass: '181',
    weightClassSource: 'automatic',
    equipmentType: 'equipped',
    age: null,
    grade: null,
    status: 'active',
    isGuest: false,
    isExtraLifter: false,
    declaredDeadliftOpener: null,
  }
}

function createMeetState(): MeetState {
  return {
    meet: {
      id: 'meet-1',
      name: 'Test Meet',
      date: '2026-09-16',
      location: 'Test Gym',
      association: 'THSPA',
      resultEntryMode: 'best-lift-only',
    },

    divisions: [
      {
        id: 1,
        meetId: 'meet-1',
        name: 'Boys Equipped',
      },
      {
        id: 2,
        meetId: 'meet-1',
        name: 'Boys Unequipped',
      },
    ],

    teams: [
      {
        id: 1,
        meetId: 'meet-1',
        name: 'Sundown High School',
        region: null,
        classification: null,
      },
    ],

    lifters: [],
  }
}

describe('validateMeetState', () => {
  it('accepts a valid meet state', () => {
    const state = createMeetState()

    state.lifters.push(
      createLifter(1, 101, 1, 1),
      createLifter(2, 102, 2, 1),
    )

    expect(validateMeetState(state)).toEqual([])
  })

  it('allows the same team to have lifters in multiple divisions', () => {
    const state = createMeetState()

    state.lifters.push(
      createLifter(1, 101, 1, 1),
      createLifter(2, 102, 2, 1),
    )

    const errors = validateMeetState(state)

    expect(errors).toEqual([])
  })

  it('rejects duplicate lifter numbers across different divisions', () => {
    const state = createMeetState()

    state.lifters.push(
      createLifter(1, 101, 1, 1),
      createLifter(2, 101, 2, 1),
    )

    const errors = validateMeetState(state)

    expect(errors).toContainEqual({
      code: 'DUPLICATE_LIFTER_NUMBER',
      message:
        'Lifter number 101 is used 2 times. ' +
        'Lifter numbers must be unique across the entire meet.',
    })
  })

  it('rejects a lifter whose division does not exist', () => {
    const state = createMeetState()

    state.lifters.push(
      createLifter(1, 101, 999, 1),
    )

    const errors = validateMeetState(state)

    expect(errors).toContainEqual({
      code: 'LIFTER_DIVISION_NOT_FOUND',
      message:
        'Lifter 101 references division 999, ' +
        'which does not exist in the meet.',
    })
  })

  it('rejects a lifter whose team does not exist', () => {
    const state = createMeetState()

    state.lifters.push(
      createLifter(1, 101, 1, 999),
    )

    const errors = validateMeetState(state)

    expect(errors).toContainEqual({
      code: 'LIFTER_TEAM_NOT_FOUND',
      message:
        'Lifter 101 references team 999, ' +
        'which does not exist in the meet.',
    })
  })

  it('allows an unattached lifter with no team', () => {
    const state = createMeetState()

    state.lifters.push(
      createLifter(1, 101, 1, null),
    )

    expect(validateMeetState(state)).toEqual([])
  })

  it('rejects a division assigned to another meet', () => {
    const state = createMeetState()

    state.divisions[0].meetId = 'different-meet'

    const errors = validateMeetState(state)

    expect(errors).toContainEqual({
      code: 'DIVISION_WRONG_MEET',
      message:
        'Division "Boys Equipped" belongs to meet ' +
        '"different-meet" instead of "meet-1".',
    })
  })

  it('rejects a team assigned to another meet', () => {
    const state = createMeetState()

    state.teams[0].meetId = 'different-meet'

    const errors = validateMeetState(state)

    expect(errors).toContainEqual({
      code: 'TEAM_WRONG_MEET',
      message:
        'Team "Sundown High School" belongs to meet ' +
        '"different-meet" instead of "meet-1".',
    })
  })
})