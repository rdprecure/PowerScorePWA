import type {
  ResultEntryMode,
} from './Competition'

export interface Meet {
  id: string
  name: string
  date: string
  location: string
  resultEntryMode: ResultEntryMode
  /** 8-character authorization code shared with PlatformManager stations. */
  platformMeetId?: string
}
