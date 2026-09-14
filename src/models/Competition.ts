export type ResultEntryMode =
| 'best-lift-only'
| 'all-attempts'

export type AttemptStatus =
| 'unspecified'
| 'good'
| 'bad'

export type ResultSource =
| 'manual'
| 'platform-manager'

export interface Attempt {
weight: number | null
status: AttemptStatus
source?: ResultSource
}

export interface EventAttempts {
attempt1: Attempt
attempt2: Attempt
attempt3: Attempt
}

export interface BestLiftResults {
squat: number | null
bench: number | null
deadlift: number | null
}

export interface AllAttemptResults {
squat: EventAttempts
bench: EventAttempts
deadlift: EventAttempts
}