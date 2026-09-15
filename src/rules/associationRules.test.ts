import {
    describe,
    expect,
    test,
  } from 'vitest'
  
  import {
    THSPA_RULES,
  } from './thspa'
  
  import {
    THSWPA_RULES,
  } from './thswpa'
  
  import {
    getWeightClass,
  } from '../scoring/weightClass'
  
  describe('PowerScore association rules', () => {
  
    test('THSPA rules identify the association', () => {
      expect(
        THSPA_RULES.association
      ).toBe('THSPA')
    })
  
    test('THSWPA rules identify the association', () => {
      expect(
        THSWPA_RULES.association
      ).toBe('THSWPA')
    })
  
    test('THSPA uses Schwartz coefficient', () => {
      expect(
        THSPA_RULES.coefficientType
      ).toBe('schwartz')
    })
  
    test('THSWPA uses Malone coefficient', () => {
      expect(
        THSWPA_RULES.coefficientType
      ).toBe('malone')
    })
  
    test('Texas scoring uses 7-5-3-2-1', () => {
      expect(
        THSPA_RULES.individualPoints
      ).toEqual([
        7,
        5,
        3,
        2,
        1,
      ])
  
      expect(
        THSWPA_RULES.individualPoints
      ).toEqual([
        7,
        5,
        3,
        2,
        1,
      ])
    })
  
    test('Texas teams allow twelve scoring lifters', () => {
      expect(
        THSPA_RULES
          .teamScoring
          .maxScoringLifters
      ).toBe(12)
  
      expect(
        THSWPA_RULES
          .teamScoring
          .maxScoringLifters
      ).toBe(12)
    })
  
    test('Texas teams allow three scoring lifters per class', () => {
      expect(
        THSPA_RULES
          .teamScoring
          .maxScoringLiftersPerClass
      ).toBe(3)
  
      expect(
        THSWPA_RULES
          .teamScoring
          .maxScoringLiftersPerClass
      ).toBe(3)
    })
  
    test('THSPA has twelve weight classes', () => {
      expect(
        THSPA_RULES.weightClasses
      ).toHaveLength(12)
    })
  
    test('THSWPA has twelve weight classes', () => {
      expect(
        THSWPA_RULES.weightClasses
      ).toHaveLength(12)
    })
  
    test('THSPA assigns boys weight classes correctly', () => {
      expect(
        getWeightClass(
          113.9,
          THSPA_RULES.weightClasses
        )
      ).toBe('114')
  
      expect(
        getWeightClass(
          114,
          THSPA_RULES.weightClasses
        )
      ).toBe('114')
  
      expect(
        getWeightClass(
          114.1,
          THSPA_RULES.weightClasses
        )
      ).toBe('123')
  
      expect(
        getWeightClass(
          307.9,
          THSPA_RULES.weightClasses
        )
      ).toBe('308')
  
      expect(
        getWeightClass(
          308.1,
          THSPA_RULES.weightClasses
        )
      ).toBe('SHW')
    })
  
    test('THSWPA uses half-pound class boundaries', () => {
      expect(
        getWeightClass(
          97.5,
          THSWPA_RULES.weightClasses
        )
      ).toBe('97')
  
      expect(
        getWeightClass(
          97.6,
          THSWPA_RULES.weightClasses
        )
      ).toBe('105')
  
      expect(
        getWeightClass(
          242.5,
          THSWPA_RULES.weightClasses
        )
      ).toBe('242')
  
      expect(
        getWeightClass(
          242.6,
          THSWPA_RULES.weightClasses
        )
      ).toBe('242+')
    })
  
    test('Texas rules enable coefficient team tiebreaker', () => {
      expect(
        THSPA_RULES
          .teamStandings
          .useAverageCoefficientTieBreaker
      ).toBe(true)
  
      expect(
        THSWPA_RULES
          .teamStandings
          .useAverageCoefficientTieBreaker
      ).toBe(true)
    })
  
  })