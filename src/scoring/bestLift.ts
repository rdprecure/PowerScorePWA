import type {
    Attempt,
    EventAttempts,
  } from '../models/Competition'
  
  export function isSuccessfulAttempt(
    attempt: Attempt
  ): boolean {
    return (
      attempt.weight !== null &&
      attempt.status === 'good'
    )
  }
  
  export function getBestLift(
    attempts: EventAttempts
  ): number {
    const allAttempts = [
      attempts.attempt1,
      attempts.attempt2,
      attempts.attempt3,
    ]
  
    let bestLift = 0
  
    for (const attempt of allAttempts) {
      if (
        isSuccessfulAttempt(attempt) &&
        attempt.weight! > bestLift
      ) {
        bestLift = attempt.weight!
      }
    }
  
    return bestLift
  }