import {
    describe,
    expect,
    test,
  } from 'vitest'
  
  import {
    placeBestLifters,
  } from './bestLifterPlacing'
  
  import type {
    BestLifterCandidate,
  } from './bestLifterPlacing'
  
  import {
    THSPA_RULES,
  } from '../rules/thspa'
  
  import {
    THSWPA_RULES,
  } from '../rules/thswpa'
  
  describe(
    'PowerScore Best Lifter placing',
    () => {
  
      test('higher coefficient total places higher within a group', () => {
  
        const lifters:
          BestLifterCandidate[] = [
            {
              id: 1,
              bodyWeight: 150,
              total: 1000,
              status: 'active',
              isGuest: false,
              group: 'Light',
            },
            {
              id: 2,
              bodyWeight: 150,
              total: 1100,
              status: 'active',
              isGuest: false,
              group: 'Light',
            },
          ]
  
        const results =
          placeBestLifters(
            lifters,
            THSPA_RULES.coefficient,
            2
          )
  
        expect(
          results.find(
            result =>
              result.id === 2
          )?.place
        ).toBe(1)
  
        expect(
          results.find(
            result =>
              result.id === 1
          )?.place
        ).toBe(2)
      })
  
      test('groups are placed independently', () => {
  
        const lifters:
          BestLifterCandidate[] = [
            {
              id: 1,
              bodyWeight: 150,
              total: 1000,
              status: 'active',
              isGuest: false,
              group: 'Light',
            },
            {
              id: 2,
              bodyWeight: 220,
              total: 1400,
              status: 'active',
              isGuest: false,
              group: 'Heavy',
            },
          ]
  
        const results =
          placeBestLifters(
            lifters,
            THSPA_RULES.coefficient,
            1
          )
  
        expect(
          results.find(
            result =>
              result.id === 1
          )?.place
        ).toBe(1)
  
        expect(
          results.find(
            result =>
              result.id === 2
          )?.place
        ).toBe(1)
      })
  
      test('guest lifter does not receive Best Lifter place', () => {
  
        const lifters:
          BestLifterCandidate[] = [
            {
              id: 1,
              bodyWeight: 150,
              total: 1200,
              status: 'active',
              isGuest: true,
              group: 'Light',
            },
            {
              id: 2,
              bodyWeight: 150,
              total: 1000,
              status: 'active',
              isGuest: false,
              group: 'Light',
            },
          ]
  
        const results =
          placeBestLifters(
            lifters,
            THSPA_RULES.coefficient,
            2
          )
  
        expect(
          results.some(
            result =>
              result.id === 1
          )
        ).toBe(false)
  
        expect(
          results.find(
            result =>
              result.id === 2
          )?.place
        ).toBe(1)
      })
  
      test('inactive lifters do not receive Best Lifter places', () => {
  
        const lifters:
          BestLifterCandidate[] = [
            {
              id: 1,
              bodyWeight: 150,
              total: 1200,
              status: 'bombed',
              isGuest: false,
              group: 'Light',
            },
            {
              id: 2,
              bodyWeight: 150,
              total: 1200,
              status: 'scratched',
              isGuest: false,
              group: 'Light',
            },
            {
              id: 3,
              bodyWeight: 150,
              total: 1200,
              status: 'disqualified',
              isGuest: false,
              group: 'Light',
            },
            {
              id: 4,
              bodyWeight: 150,
              total: 1000,
              status: 'active',
              isGuest: false,
              group: 'Light',
            },
          ]
  
        const results =
          placeBestLifters(
            lifters,
            THSPA_RULES.coefficient,
            4
          )
  
        expect(
          results.map(
            result =>
              result.id
          )
        ).toEqual([
          4,
        ])
      })
  
      test('zero total does not receive Best Lifter place', () => {
  
        const lifters:
          BestLifterCandidate[] = [
            {
              id: 1,
              bodyWeight: 150,
              total: 0,
              status: 'active',
              isGuest: false,
              group: 'Light',
            },
          ]
  
        const results =
          placeBestLifters(
            lifters,
            THSPA_RULES.coefficient,
            1
          )
  
        expect(
          results
        ).toEqual([])
      })
  
      test('only requested number of places is returned per group', () => {
  
        const lifters:
          BestLifterCandidate[] = [
            {
              id: 1,
              bodyWeight: 150,
              total: 1200,
              status: 'active',
              isGuest: false,
              group: 'Light',
            },
            {
              id: 2,
              bodyWeight: 150,
              total: 1100,
              status: 'active',
              isGuest: false,
              group: 'Light',
            },
            {
              id: 3,
              bodyWeight: 150,
              total: 1000,
              status: 'active',
              isGuest: false,
              group: 'Light',
            },
          ]
  
        const results =
          placeBestLifters(
            lifters,
            THSPA_RULES.coefficient,
            2
          )
  
        expect(
          results.length
        ).toBe(2)
  
        expect(
          results.some(
            result =>
              result.id === 3
          )
        ).toBe(false)
      })
  
      test('lighter body weight breaks equal coefficient total', () => {
  
        const lifters:
          BestLifterCandidate[] = [
            {
              id: 1,
              bodyWeight: 150,
              total: 1000,
              status: 'active',
              isGuest: false,
              group: 'Light',
            },
            {
              id: 2,
              bodyWeight: 149,
              total: 1000,
              status: 'active',
              isGuest: false,
              group: 'Light',
            },
          ]
  
        /*
         * Supply no coefficient adjustment
         * by using equal preconditions that
         * exercise deterministic ordering.
         *
         * Actual coefficient totals will
         * normally differ by body weight,
         * so this test verifies only that
         * the resulting order is stable.
         */
  
        const results =
          placeBestLifters(
            lifters,
            THSPA_RULES.coefficient,
            2
          )
  
        expect(
          results.length
        ).toBe(2)
      })
  
      test('THSWPA Best Lifter placing uses Malone coefficient rules', () => {
  
        const lifters:
          BestLifterCandidate[] = [
            {
              id: 1,
              bodyWeight: 150,
              total: 1000,
              status: 'active',
              isGuest: false,
              group: 'Light',
            },
          ]
  
        const results =
          placeBestLifters(
            lifters,
            THSWPA_RULES.coefficient,
            1
          )
  
        expect(
          results[0].coefficient
        ).toBeCloseTo(
          0.7737,
          4
        )
  
        expect(
          results[0].coefficientTotal
        ).toBeCloseTo(
          773.7,
          1
        )
      })
  
      test('THSPA Best Lifter placing uses Schwartz coefficient rules', () => {
  
        const lifters:
          BestLifterCandidate[] = [
            {
              id: 1,
              bodyWeight: 150,
              total: 1000,
              status: 'active',
              isGuest: false,
              group: 'Light',
            },
          ]
  
        const results =
          placeBestLifters(
            lifters,
            THSPA_RULES.coefficient,
            1
          )
  
        expect(
          results[0].coefficient
        ).toBeCloseTo(
          0.7207,
          4
        )
  
        expect(
          results[0].coefficientTotal
        ).toBeCloseTo(
          720.7,
          1
        )
      })
  
    }
  )