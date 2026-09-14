import type {
    AllAttemptResults,
    BestLiftResults,
  } from './Competition'
  
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
  
    bestLiftResults?: BestLiftResults
    allAttemptResults?: AllAttemptResults
  }