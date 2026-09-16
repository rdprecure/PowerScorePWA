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
              weightClass: '165',
              total: 1000,
              status: 'active',
              isGuest: false,
            },
            {
              id: 2,
              bodyWeight: 150,
              weightClass: '165',
              total: 1100,
              status: 'active',
              isGuest: false,
            },
          ]
  
        const results =
          placeBestLifters(
            lifters,
            THSPA_RULES,
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
  
      test('groups are derived from weight class and placed independently', () => {
  
        const lifters:
          BestLifterCandidate[] = [
            {
              id: 1,
              bodyWeight: 150,
              weightClass: '165',
              total: 1000,
              status: 'active',
              isGuest: false,
            },
            {
              id: 2,
              bodyWeight: 220,
              weightClass: '220',
              total: 1400,
              status: 'active',
              isGuest: false,
            },
          ]
  
        const results =
          placeBestLifters(
            lifters,
            THSPA_RULES,
            1
          )
  
        const light =
          results.find(
            result =>
              result.id === 1
          )
  
        const heavy =
          results.find(
            result =>
              result.id === 2
          )
  
        expect(
          light?.group
        ).toBe('114 to 165')
  
        expect(
          light?.place
        ).toBe(1)
  
        expect(
          heavy?.group
        ).toBe('181 to SHW')
  
        expect(
          heavy?.place
        ).toBe(1)
      })
  
      test('guest lifter does not receive Best Lifter place', () => {
  
        const lifters:
          BestLifterCandidate[] = [
            {
              id: 1,
              bodyWeight: 150,
              weightClass: '165',
              total: 1200,
              status: 'active',
              isGuest: true,
            },
            {
              id: 2,
              bodyWeight: 150,
              weightClass: '165',
              total: 1000,
              status: 'active',
              isGuest: false,
            },
          ]
  
        const results =
          placeBestLifters(
            lifters,
            THSPA_RULES,
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
              weightClass: '165',
              total: 1200,
              status: 'bombed',
              isGuest: false,
            },
            {
              id: 2,
              bodyWeight: 150,
              weightClass: '165',
              total: 1200,
              status: 'scratched',
              isGuest: false,
            },
            {
              id: 3,
              bodyWeight: 150,
              weightClass: '165',
              total: 1200,
              status: 'disqualified',
              isGuest: false,
            },
            {
              id: 4,
              bodyWeight: 150,
              weightClass: '165',
              total: 1000,
              status: 'active',
              isGuest: false,
            },
          ]
  
        const results =
          placeBestLifters(
            lifters,
            THSPA_RULES,
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
              weightClass: '165',
              total: 0,
              status: 'active',
              isGuest: false,
            },
          ]
  
        const results =
          placeBestLifters(
            lifters,
            THSPA_RULES,
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
              weightClass: '165',
              total: 1200,
              status: 'active',
              isGuest: false,
            },
            {
              id: 2,
              bodyWeight: 150,
              weightClass: '165',
              total: 1100,
              status: 'active',
              isGuest: false,
            },
            {
              id: 3,
              bodyWeight: 150,
              weightClass: '165',
              total: 1000,
              status: 'active',
              isGuest: false,
            },
          ]
  
        const results =
          placeBestLifters(
            lifters,
            THSPA_RULES,
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
  
      test('unknown weight class does not receive Best Lifter place', () => {
  
        const lifters:
          BestLifterCandidate[] = [
            {
              id: 1,
              bodyWeight: 150,
              weightClass: 'UNKNOWN',
              total: 1200,
              status: 'active',
              isGuest: false,
            },
          ]
  
        const results =
          placeBestLifters(
            lifters,
            THSPA_RULES,
            1
          )
  
        expect(
          results
        ).toEqual([])
      })
  
      test('THSWPA derives the correct group and uses Malone coefficient rules', () => {
  
        const lifters:
          BestLifterCandidate[] = [
            {
              id: 1,
              bodyWeight: 150,
              weightClass: '165',
              total: 1000,
              status: 'active',
              isGuest: false,
            },
          ]
  
        const results =
          placeBestLifters(
            lifters,
            THSWPA_RULES,
            1
          )
  
        expect(
          results[0].group
        ).toBe('148 to 242+')
  
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
  
      test('THSPA derives the correct group and uses Schwartz coefficient rules', () => {
  
        const lifters:
          BestLifterCandidate[] = [
            {
              id: 1,
              bodyWeight: 150,
              weightClass: '165',
              total: 1000,
              status: 'active',
              isGuest: false,
            },
          ]
  
        const results =
          placeBestLifters(
            lifters,
            THSPA_RULES,
            1
          )
  
        expect(
          results[0].group
        ).toBe('114 to 165')
  
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
  
      test('THSWPA 132 and 148 lifters are placed in separate award groups', () => {
  
        const lifters:
          BestLifterCandidate[] = [
            {
              id: 1,
              bodyWeight: 132,
              weightClass: '132',
              total: 900,
              status: 'active',
              isGuest: false,
            },
            {
              id: 2,
              bodyWeight: 148,
              weightClass: '148',
              total: 1000,
              status: 'active',
              isGuest: false,
            },
          ]
  
        const results =
          placeBestLifters(
            lifters,
            THSWPA_RULES,
            1
          )
  
        expect(
          results.find(
            result =>
              result.id === 1
          )
        ).toMatchObject({
          group: '97 to 132',
          place: 1,
        })
  
        expect(
          results.find(
            result =>
              result.id === 2
          )
        ).toMatchObject({
          group: '148 to 242+',
          place: 1,
        })
      })
  
      test('THSPA 165 and 181 lifters are placed in separate award groups', () => {
  
        const lifters:
          BestLifterCandidate[] = [
            {
              id: 1,
              bodyWeight: 165,
              weightClass: '165',
              total: 1000,
              status: 'active',
              isGuest: false,
            },
            {
              id: 2,
              bodyWeight: 181,
              weightClass: '181',
              total: 1100,
              status: 'active',
              isGuest: false,
            },
          ]
  
        const results =
          placeBestLifters(
            lifters,
            THSPA_RULES,
            1
          )
  
        expect(
          results.find(
            result =>
              result.id === 1
          )
        ).toMatchObject({
          group: '114 to 165',
          place: 1,
        })
  
        expect(
          results.find(
            result =>
              result.id === 2
          )
        ).toMatchObject({
          group: '181 to SHW',
          place: 1,
        })
      })
  
    }
  )