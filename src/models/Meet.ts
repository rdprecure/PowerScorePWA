import type { ResultEntryMode } from './Competition'

export type Association = 'THSPA' | 'THSWPA' | 'NMAA'

export interface Meet {
  id: string
  name: string
  date: string
  location: string
  association: Association
  resultEntryMode: ResultEntryMode
}