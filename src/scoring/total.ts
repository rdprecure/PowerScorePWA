import type {
    AllAttemptResults,
    BestLiftResults,
  } from '../models/Competition'
  
  import { getBestLift } from './bestLift'
  
  export interface LiftSummary {
    squat: number
    bench: number
    deadlift: number
    total: number
  }
  
  export function summarizeBestLiftResults(
    results: BestLiftResults
  ): LiftSummary {
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
    results: AllAttemptResults
  ): LiftSummary {
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