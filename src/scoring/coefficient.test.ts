import {
    describe,
    expect,
    test,
  } from 'vitest'
  
  import {
    getTableCoefficient,
  } from './coefficient'
  
  import type {
    CoefficientEntry,
  } from './coefficient'
  
  const TEST_TABLE:
    CoefficientEntry[] = [
      {
        bodyWeight: 90,
        coefficient: 1.30,
      },
      {
        bodyWeight: 91,
        coefficient: 1.20,
      },
      {
        bodyWeight: 92,
        coefficient: 1.10,
      },
      {
        bodyWeight: 93,
        coefficient: 1.00,
      },
    ]
  
  describe('PowerScore coefficient table lookup', () => {
  
    test('zero bodyweight returns zero', () => {
      expect(
        getTableCoefficient(
          0,
          TEST_TABLE,
          {
            roundUpBodyWeight: false,
          }
        )
      ).toBe(0)
    })
  
    test('negative bodyweight returns zero', () => {
      expect(
        getTableCoefficient(
          -100,
          TEST_TABLE,
          {
            roundUpBodyWeight: false,
          }
        )
      ).toBe(0)
    })
  
    test('empty table returns zero', () => {
      expect(
        getTableCoefficient(
          150,
          [],
          {
            roundUpBodyWeight: false,
          }
        )
      ).toBe(0)
    })
  
    test('exact table bodyweight returns matching coefficient', () => {
      expect(
        getTableCoefficient(
          91,
          TEST_TABLE,
          {
            roundUpBodyWeight: false,
          }
        )
      ).toBe(1.20)
    })
  
    test('bodyweight between rows uses previous coefficient', () => {
      expect(
        getTableCoefficient(
          91.4,
          TEST_TABLE,
          {
            roundUpBodyWeight: false,
          }
        )
      ).toBe(1.20)
    })
  
    test('bodyweight below first row uses first coefficient', () => {
      expect(
        getTableCoefficient(
          80,
          TEST_TABLE,
          {
            roundUpBodyWeight: false,
          }
        )
      ).toBe(1.30)
    })
  
    test('bodyweight above final row uses final coefficient', () => {
      expect(
        getTableCoefficient(
          100,
          TEST_TABLE,
          {
            roundUpBodyWeight: false,
          }
        )
      ).toBe(1.00)
    })
  
    test('round-up option shifts lookup by one half pound', () => {
      expect(
        getTableCoefficient(
          90.6,
          TEST_TABLE,
          {
            roundUpBodyWeight: true,
          }
        )
      ).toBe(1.20)
    })
  
    test('same bodyweight without round-up uses lower table row', () => {
      expect(
        getTableCoefficient(
          90.6,
          TEST_TABLE,
          {
            roundUpBodyWeight: false,
          }
        )
      ).toBe(1.30)
    })
  
    test('half-pound boundary with round-up reaches next row', () => {
      expect(
        getTableCoefficient(
          90.5,
          TEST_TABLE,
          {
            roundUpBodyWeight: true,
          }
        )
      ).toBe(1.20)
    })
  
  })