import {
    describe,
    expect,
    test,
  } from 'vitest'
  
  import type {
    ScoredDivisionLifter,
  } from './divisionScoring'
  
  import {
    placeDivisionBestLifters,
  } from './divisionBestLifterPlacing'
  
  import {
    THSPA_RULES,
  } from '../rules/thspa'
  
  import {
    THSWPA_RULES,
  } from '../rules/thswpa'
  
  describe(
    'Division Best Lifter placing',
    () => {
  
      test('places Best Lifters from scored division lifters', () => {
  
        const lifters:
          ScoredDivisionLifter[] = [
            {
              id: 1,
              teamId: 10,
              bodyWeight: 150,
              total: 1000,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
              weightClass: '165',
              place: 1,
              tied: false,
              tieCount: 1,
              points: 7,
            },
            {
              id: 2,
              teamId: 20,
              bodyWeight: 150,
              total: 1100,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
              weightClass: '165',
              place: 2,
              tied: false,
              tieCount: 1,
              points: 5,
            },
          ]
  
        const results =
          placeDivisionBestLifters(
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
  
      test('uses scored weight class rather than recalculating it from body weight', () => {
  
        const lifters:
          ScoredDivisionLifter[] = [
            {
              id: 1,
              teamId: 10,
  
              /*
               * This body weight would normally
               * be assigned to a lighter THSPA
               * weight class.
               *
               * The scored division result says
               * 181, so Best Lifter placing must
               * consume that authoritative class
               * rather than calculate it again.
               */
              bodyWeight: 150,
  
              total: 1000,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
              weightClass: '181',
              place: 1,
              tied: false,
              tieCount: 1,
              points: 7,
            },
          ]
  
        const results =
          placeDivisionBestLifters(
            lifters,
            THSPA_RULES,
            1
          )
  
        expect(
          results[0].group
        ).toBe('181 to SHW')
      })
  
      test('uses the existing scored total for coefficient total', () => {
  
        const lifters:
          ScoredDivisionLifter[] = [
            {
              id: 1,
              teamId: 10,
              bodyWeight: 150,
              total: 1000,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
              weightClass: '165',
              place: 1,
              tied: false,
              tieCount: 1,
              points: 7,
            },
          ]
  
        const results =
          placeDivisionBestLifters(
            lifters,
            THSPA_RULES,
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
  
      test('individual weight-class place does not determine Best Lifter place', () => {
  
        const lifters:
          ScoredDivisionLifter[] = [
            {
              id: 1,
              teamId: 10,
              bodyWeight: 150,
              total: 1000,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
              weightClass: '165',
  
              /*
               * Lifter 1 won the weight class.
               */
              place: 1,
  
              tied: false,
              tieCount: 1,
              points: 7,
            },
            {
              id: 2,
              teamId: 20,
              bodyWeight: 150,
              total: 1100,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
              weightClass: '148',
  
              /*
               * Lifter 2 did not win the
               * weight class, but has the
               * higher coefficient total.
               */
              place: 2,
  
              tied: false,
              tieCount: 1,
              points: 5,
            },
          ]
  
        const results =
          placeDivisionBestLifters(
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
  
      test('individual points do not determine Best Lifter place', () => {
  
        const lifters:
          ScoredDivisionLifter[] = [
            {
              id: 1,
              teamId: 10,
              bodyWeight: 150,
              total: 1000,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
              weightClass: '165',
              place: 1,
              tied: false,
              tieCount: 1,
  
              /*
               * Deliberately give this
               * lifter more individual
               * points.
               */
              points: 100,
            },
            {
              id: 2,
              teamId: 20,
              bodyWeight: 150,
              total: 1100,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
              weightClass: '148',
              place: 2,
              tied: false,
              tieCount: 1,
              points: 1,
            },
          ]
  
        const results =
          placeDivisionBestLifters(
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
  
      test('extra lifter remains eligible for Best Lifter placing', () => {
  
        const lifters:
          ScoredDivisionLifter[] = [
            {
              id: 1,
              teamId: 10,
              bodyWeight: 150,
              total: 1200,
              status: 'active',
              isGuest: false,
  
              /*
               * Extra lifters cannot contribute
               * team points, but legacy PowerScore
               * does not exclude them from
               * Best Lifter awards.
               */
              isExtraLifter: true,
  
              weightClass: '165',
              place: 1,
              tied: false,
              tieCount: 1,
              points: 7,
            },
            {
              id: 2,
              teamId: 20,
              bodyWeight: 150,
              total: 1000,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
              weightClass: '165',
              place: 2,
              tied: false,
              tieCount: 1,
              points: 5,
            },
          ]
  
        const results =
          placeDivisionBestLifters(
            lifters,
            THSPA_RULES,
            2
          )
  
        expect(
          results.find(
            result =>
              result.id === 1
          )?.place
        ).toBe(1)
      })
  
      test('guest lifter remains excluded from Best Lifter placing', () => {
  
        const lifters:
          ScoredDivisionLifter[] = [
            {
              id: 1,
              teamId: 10,
              bodyWeight: 150,
              total: 1200,
              status: 'active',
              isGuest: true,
              isExtraLifter: false,
              weightClass: '165',
              place: null,
              tied: false,
              tieCount: 1,
              points: 0,
            },
            {
              id: 2,
              teamId: 20,
              bodyWeight: 150,
              total: 1000,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
              weightClass: '165',
              place: 1,
              tied: false,
              tieCount: 1,
              points: 7,
            },
          ]
  
        const results =
          placeDivisionBestLifters(
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
  
      test('THSWPA scored lifters use THSWPA Best Lifter rules', () => {
  
        const lifters:
          ScoredDivisionLifter[] = [
            {
              id: 1,
              teamId: 10,
              bodyWeight: 150,
              total: 1000,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
              weightClass: '165',
              place: 1,
              tied: false,
              tieCount: 1,
              points: 7,
            },
          ]
  
        const results =
          placeDivisionBestLifters(
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
  
    }
  )