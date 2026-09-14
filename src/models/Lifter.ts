import type {
    AllAttemptResults,
    BestLiftResults,
  } from './Competition'

  import type { LifterStatus } from './LifterStatus'
  
  export type EquipmentType =
    | 'equipped'
    | 'unequipped'
  
  export interface Lifter {
    id: number
    lifterNumber: number
  
    firstName: string
    lastName: string
  
    teamId: number | null
  
    bodyWeight: number | null
    weightClass: string | null
  
    equipmentType: EquipmentType
    status: LifterStatus

    isGuest: boolean
  
    bestLiftResults?: BestLiftResults
    allAttemptResults?: AllAttemptResults
  }