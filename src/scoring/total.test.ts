import {
    describe,
    expect,
    test,
  } from 'vitest'
  
  import {
    summarizeAllAttemptResults,
    summarizeBestLiftResults,
  } from './total'
  
  import type {
    AllAttemptResults,
    BestLiftResults,
  } from '../models/Competition'
  
  describe('PowerScore competition results', () => {
  
    test('best-lift-only meet uses entered lifts directly', () => {
      const results: BestLiftResults = {
        squat: 415,
        bench: 265,
        deadlift: 475,
      }
  
      const summary = summarizeBestLiftResults(results)
  
      expect(summary.squat).toBe(415)
      expect(summary.bench).toBe(265)
      expect(summary.deadlift).toBe(475)
      expect(summary.total).toBe(1155)
    })
  
    test('all-attempts meet calculates best successful lifts', () => {
      const results: AllAttemptResults = {
        squat: {
          attempt1: {
            weight: 400,
            status: 'good',
          },
          attempt2: {
            weight: 425,
            status: 'bad',
          },
          attempt3: {
            weight: 415,
            status: 'good',
          },
        },
  
        bench: {
          attempt1: {
            weight: 250,
            status: 'good',
          },
          attempt2: {
            weight: 265,
            status: 'good',
          },
          attempt3: {
            weight: 275,
            status: 'bad',
          },
        },
  
        deadlift: {
          attempt1: {
            weight: 450,
            status: 'good',
          },
          attempt2: {
            weight: 475,
            status: 'good',
          },
          attempt3: {
            weight: 500,
            status: 'bad',
          },
        },
      }
  
      const summary = summarizeAllAttemptResults(results)
  
      expect(summary.squat).toBe(415)
      expect(summary.bench).toBe(265)
      expect(summary.deadlift).toBe(475)
      expect(summary.total).toBe(1155)
    })
  
    test('unspecified attempts do not count as successful lifts', () => {
      const results: AllAttemptResults = {
        squat: {
          attempt1: {
            weight: 400,
            status: 'good',
          },
          attempt2: {
            weight: 425,
            status: 'unspecified',
          },
          attempt3: {
            weight: null,
            status: 'unspecified',
          },
        },
  
        bench: {
          attempt1: {
            weight: 250,
            status: 'good',
          },
          attempt2: {
            weight: null,
            status: 'unspecified',
          },
          attempt3: {
            weight: null,
            status: 'unspecified',
          },
        },
  
        deadlift: {
          attempt1: {
            weight: 450,
            status: 'good',
          },
          attempt2: {
            weight: null,
            status: 'unspecified',
          },
          attempt3: {
            weight: null,
            status: 'unspecified',
          },
        },
      }
  
      const summary = summarizeAllAttemptResults(results)
  
      expect(summary.squat).toBe(400)
      expect(summary.bench).toBe(250)
      expect(summary.deadlift).toBe(450)
      expect(summary.total).toBe(1100)
    })
  
  })