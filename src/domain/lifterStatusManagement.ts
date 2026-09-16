import type {
  Lifter,
} from '../models/Lifter'

import type {
  LifterStatus,
} from '../models/LifterStatus'

import type {
  MeetState,
} from '../models/MeetState'

export type CompetitionEndingLifterStatus =
  | 'bombed'
  | 'scratched'
  | 'disqualified'

export function updateLifterStatus(
  lifter: Lifter,
  status: LifterStatus,
): Lifter {

  return {
    ...lifter,
    status,
  }
}

export function markLifterActive(
  lifter: Lifter,
): Lifter {

  return updateLifterStatus(
    lifter,
    'active',
  )
}

export function markLifterBombed(
  lifter: Lifter,
): Lifter {

  return updateLifterStatus(
    lifter,
    'bombed',
  )
}

export function markLifterScratched(
  lifter: Lifter,
): Lifter {

  return updateLifterStatus(
    lifter,
    'scratched',
  )
}

export function markLifterDisqualified(
  lifter: Lifter,
): Lifter {

  return updateLifterStatus(
    lifter,
    'disqualified',
  )
}

export function isLifterActive(
  lifter: Lifter,
): boolean {

  return (
    lifter.status ===
    'active'
  )
}

export function hasLifterCompetitionEnded(
  lifter: Lifter,
): boolean {

  return (
    lifter.status ===
      'bombed' ||
    lifter.status ===
      'scratched' ||
    lifter.status ===
      'disqualified'
  )
}

export function removeLifterFromMeet(
  state: MeetState,
  lifterId: number,
): MeetState {

  return {
    ...state,

    lifters:
      state.lifters.filter(
        lifter =>
          lifter.id !==
          lifterId
      ),
  }
}