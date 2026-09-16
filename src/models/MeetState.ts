import type { Division } from './Division'
import type { Lifter } from './Lifter'
import type { Meet } from './Meet'
import type { Team } from './Team'

export interface MeetState {
  meet: Meet
  divisions: Division[]
  teams: Team[]
  lifters: Lifter[]
}