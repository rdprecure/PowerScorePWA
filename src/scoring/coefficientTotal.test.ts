import {
    describe,
    expect,
    test,
  } from 'vitest'
  
  import {
    calculateCoefficientTotal,
    calculateTeamAverageCoefficientTotal,
  } from './coefficientTotal'
  
  import {
    THSPA_RULES,
  } from '../rules/thspa'
  
  import {
    THSWPA_RULES,
  } from '../rules/thswpa'
  
  describe('PowerScore coefficient totals', () => {
  
    test('calculates THSPA Schwartz coefficient total', () => {
  
      const result =
        calculateCoefficientTotal(
          180,
          1000,
          THSPA_RULES.coefficient
        )
  
      expect(
        result.coefficient
      ).toBe(0.6238)
  
      expect(
        result.coefficientTotal
      ).toBeCloseTo(
        623.8,
        10
      )
    })
  
    test('calculates THSWPA Malone coefficient total', () => {
  
      const result =
        calculateCoefficientTotal(
          180,
          1000,
          THSWPA_RULES.coefficient
        )
  
      expect(
        result.coefficient
      ).toBe(0.6786)
  
      expect(
        result.coefficientTotal
      ).toBeCloseTo(
        678.6,
        10
      )
    })
  
    test('zero bodyweight produces zero coefficient total', () => {
  
      const result =
        calculateCoefficientTotal(
          0,
          1000,
          THSPA_RULES.coefficient
        )
  
      expect(
        result.coefficient
      ).toBe(0)
  
      expect(
        result.coefficientTotal
      ).toBe(0)
    })
  
    test('zero competition total produces zero coefficient total', () => {
  
      const result =
        calculateCoefficientTotal(
          180,
          0,
          THSPA_RULES.coefficient
        )
  
      expect(
        result.coefficient
      ).toBe(0)
  
      expect(
        result.coefficientTotal
      ).toBe(0)
    })
  
    test('none coefficient type produces zero coefficient total', () => {
  
      const result =
        calculateCoefficientTotal(
          180,
          1000,
          {
            type: 'none',
            roundUpBodyWeight: false,
          }
        )
  
      expect(
        result.coefficient
      ).toBe(0)
  
      expect(
        result.coefficientTotal
      ).toBe(0)
    })
  
    test('calculates team average from scoring lifters', () => {
  
      const average =
        calculateTeamAverageCoefficientTotal(
          [
            {
              id: 1,
              bodyWeight: 180,
              total: 1000,
            },
            {
              id: 2,
              bodyWeight: 200,
              total: 1100,
            },
          ],
          [
            1,
            2,
          ],
          THSPA_RULES.coefficient
        )
  
      const lifter1 =
        1000 * 0.6238
  
      const lifter2 =
        1100 * 0.5826
  
      const expected =
        (
          lifter1 +
          lifter2
        ) / 2
  
      expect(
        average
      ).toBeCloseTo(
        expected,
        10
      )
    })
  
    test('team average includes only scoring lifters', () => {
  
      const average =
        calculateTeamAverageCoefficientTotal(
          [
            {
              id: 1,
              bodyWeight: 180,
              total: 1000,
            },
            {
              id: 2,
              bodyWeight: 200,
              total: 1100,
            },
            {
              id: 3,
              bodyWeight: 150,
              total: 1200,
            },
          ],
          [
            1,
            2,
          ],
          THSPA_RULES.coefficient
        )
  
      const lifter1 =
        1000 * 0.6238
  
      const lifter2 =
        1100 * 0.5826
  
      const expected =
        (
          lifter1 +
          lifter2
        ) / 2
  
      expect(
        average
      ).toBeCloseTo(
        expected,
        10
      )
    })
  
    test('team average ignores scoring id that has no matching lifter', () => {
  
      const average =
        calculateTeamAverageCoefficientTotal(
          [
            {
              id: 1,
              bodyWeight: 180,
              total: 1000,
            },
          ],
          [
            1,
            999,
          ],
          THSPA_RULES.coefficient
        )
  
      expect(
        average
      ).toBeCloseTo(
        623.8,
        10
      )
    })
  
    test('team with no scoring lifters has zero average coefficient total', () => {
  
      const average =
        calculateTeamAverageCoefficientTotal(
          [
            {
              id: 1,
              bodyWeight: 180,
              total: 1000,
            },
          ],
          [],
          THSPA_RULES.coefficient
        )
  
      expect(
        average
      ).toBe(0)
    })
  
    test('team average uses Malone for THSWPA', () => {
  
      const average =
        calculateTeamAverageCoefficientTotal(
          [
            {
              id: 1,
              bodyWeight: 180,
              total: 1000,
            },
            {
              id: 2,
              bodyWeight: 200,
              total: 1000,
            },
          ],
          [
            1,
            2,
          ],
          THSWPA_RULES.coefficient
        )
  
      const expected =
        (
          678.6 +
          628.7
        ) / 2
  
      expect(
        average
      ).toBeCloseTo(
        expected,
        10
      )
    })
  
  })