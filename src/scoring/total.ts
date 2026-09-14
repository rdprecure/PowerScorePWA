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
  
  function calculateTotal(
    squat: number,
    bench: number,
    deadlift: number,
    status: LifterStatus
  ): number {
  
    if (status !== 'active') {
      return 0
    }
  
    return squat + bench + deadlift
  }
  
  export function summarizeBestLiftResults(
    results: BestLiftResults,
    status: LifterStatus = 'active'
  ): LiftSummary {
  
    const squat = results.squat ?? 0
    const bench = results.bench ?? 0
    const deadlift = results.deadlift ?? 0
  
    return {
      squat,
      bench,
      deadlift,
      total: calculateTotal(
        squat,
        bench,
        deadlift,
        status
      ),
    }
  }
  
  export function summarizeAllAttemptResults(
    results: AllAttemptResults,
    status: LifterStatus = 'active'
  ): LiftSummary {
  
    const squat = getBestLift(results.squat)
    const bench = getBestLift(results.bench)
    const deadlift = getBestLift(results.deadlift)
  
    return {
      squat,
      bench,
      deadlift,
      total: calculateTotal(
        squat,
        bench,
        deadlift,
        status
      ),
    }
  }