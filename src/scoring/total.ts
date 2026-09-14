import type {
    AllAttemptResults,
    BestLiftResults,
  } from '../models/Competition'
  
  import type {
    LifterStatus,
  } from '../models/LifterStatus'
  
  import { getBestLift } from './bestLift'
  
  export interface LiftSummary {
    squat: number
    bench: number
    deadlift: number
    total: number
  }
  
  function zeroSummary(): LiftSummary {
    return {
      squat: 0,
      bench: 0,
      deadlift: 0,
      total: 0,
    }
  }
  
  export function summarizeBestLiftResults(
    results: BestLiftResults,
    status: LifterStatus = 'active'
  ): LiftSummary {
  
    if (status !== 'active') {
      return zeroSummary()
    }
  
    const squat = results.squat ?? 0
    const bench = results.bench ?? 0
    const deadlift = results.deadlift ?? 0
  
    return {
      squat,
      bench,
      deadlift,
      total: squat + bench + deadlift,
    }
  }
  
  export function summarizeAllAttemptResults(
    results: AllAttemptResults,
    status: LifterStatus = 'active'
  ): LiftSummary {
  
    if (status !== 'active') {
      return zeroSummary()
    }
  
    const squat = getBestLift(results.squat)
    const bench = getBestLift(results.bench)
    const deadlift = getBestLift(results.deadlift)
  
    return {
      squat,
      bench,
      deadlift,
      total: squat + bench + deadlift,
    }
  }