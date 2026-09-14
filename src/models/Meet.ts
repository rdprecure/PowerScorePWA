import type { ResultEntryMode } from './Competition'

export interface Meet {
  id: string

  name: string
  date: string

  association:
    | 'THSPA'
    | 'THSWPA'
    | 'NMAA'

  resultEntryMode: ResultEntryMode
}