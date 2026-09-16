import {
    describe,
    expect,
    test,
  } from 'vitest'
  
  import {
    createScoringContext,
  } from '../models/ScoringContext'
  
  import {
    THSPA_RULES,
  } from './thspa'
  
  import {
    THSWPA_RULES,
  } from './thswpa'
  
  import {
    getTeamStandingPolicy,
  } from './teamStandingPolicy'
  
  describe(
    'PowerScore team standing policy',
    () => {
  
      test('THSPA invitational uses coefficient tiebreaker normally', () => {
  
        const policy =
          getTeamStandingPolicy(
            THSPA_RULES,
            createScoringContext(
              'invitational'
            )
          )
  
        expect(
          policy
            .useAverageCoefficientTieBreaker
        ).toBe(true)
  
        expect(
          policy
            .ignoreAverageCoefficientForChampionship
        ).toBe(false)
      })
  
      test('THSPA regional preserves coefficient tiebreaker but flags championship exception', () => {
  
        const policy =
          getTeamStandingPolicy(
            THSPA_RULES,
            createScoringContext(
              'regional'
            )
          )
  
        expect(
          policy
            .useAverageCoefficientTieBreaker
        ).toBe(true)
  
        expect(
          policy
            .ignoreAverageCoefficientForChampionship
        ).toBe(true)
      })
  
      test('THSPA state preserves coefficient tiebreaker but flags championship exception', () => {
  
        const policy =
          getTeamStandingPolicy(
            THSPA_RULES,
            createScoringContext(
              'state'
            )
          )
  
        expect(
          policy
            .useAverageCoefficientTieBreaker
        ).toBe(true)
  
        expect(
          policy
            .ignoreAverageCoefficientForChampionship
        ).toBe(true)
      })
  
      test('THSWPA invitational uses coefficient tiebreaker normally', () => {
  
        const policy =
          getTeamStandingPolicy(
            THSWPA_RULES,
            createScoringContext(
              'invitational'
            )
          )
  
        expect(
          policy
            .useAverageCoefficientTieBreaker
        ).toBe(true)
  
        expect(
          policy
            .ignoreAverageCoefficientForChampionship
        ).toBe(false)
      })
  
      test('THSWPA regional exposes championship exception', () => {
  
        const policy =
          getTeamStandingPolicy(
            THSWPA_RULES,
            createScoringContext(
              'regional'
            )
          )
  
        expect(
          policy
            .useAverageCoefficientTieBreaker
        ).toBe(true)
  
        expect(
          policy
            .ignoreAverageCoefficientForChampionship
        ).toBe(true)
      })
  
      test('THSWPA state exposes championship exception', () => {
  
        const policy =
          getTeamStandingPolicy(
            THSWPA_RULES,
            createScoringContext(
              'state'
            )
          )
  
        expect(
          policy
            .useAverageCoefficientTieBreaker
        ).toBe(true)
  
        expect(
          policy
            .ignoreAverageCoefficientForChampionship
        ).toBe(true)
      })
  
    }
  )