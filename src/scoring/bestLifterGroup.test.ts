import {
    describe,
    expect,
    test,
  } from 'vitest'
  
  import {
    getBestLifterGroup,
  } from './bestLifterGroup'
  
  import {
    THSPA_RULES,
  } from '../rules/thspa'
  
  import {
    THSWPA_RULES,
  } from '../rules/thswpa'
  
  describe(
    'Best Lifter groups',
    () => {
  
      test('THSPA 114 is in the lighter group', () => {
  
        expect(
          getBestLifterGroup(
            '114',
            THSPA_RULES.weightClasses,
            THSPA_RULES.bestLifterGroups
          )
        ).toBe('114 to 165')
      })
  
      test('THSPA 165 is the last class in the lighter group', () => {
  
        expect(
          getBestLifterGroup(
            '165',
            THSPA_RULES.weightClasses,
            THSPA_RULES.bestLifterGroups
          )
        ).toBe('114 to 165')
      })
  
      test('THSPA 181 is the first class in the heavier group', () => {
  
        expect(
          getBestLifterGroup(
            '181',
            THSPA_RULES.weightClasses,
            THSPA_RULES.bestLifterGroups
          )
        ).toBe('181 to SHW')
      })
  
      test('THSPA SHW is in the heavier group', () => {
  
        expect(
          getBestLifterGroup(
            'SHW',
            THSPA_RULES.weightClasses,
            THSPA_RULES.bestLifterGroups
          )
        ).toBe('181 to SHW')
      })
  
      test('THSWPA 97 is in the lighter group', () => {
  
        expect(
          getBestLifterGroup(
            '97',
            THSWPA_RULES.weightClasses,
            THSWPA_RULES.bestLifterGroups
          )
        ).toBe('97 to 132')
      })
  
      test('THSWPA 132 is the last class in the lighter group', () => {
  
        expect(
          getBestLifterGroup(
            '132',
            THSWPA_RULES.weightClasses,
            THSWPA_RULES.bestLifterGroups
          )
        ).toBe('97 to 132')
      })
  
      test('THSWPA 148 is the first class in the heavier group', () => {
  
        expect(
          getBestLifterGroup(
            '148',
            THSWPA_RULES.weightClasses,
            THSWPA_RULES.bestLifterGroups
          )
        ).toBe('148 to 242+')
      })
  
      test('THSWPA 242+ is in the heavier group', () => {
  
        expect(
          getBestLifterGroup(
            '242+',
            THSWPA_RULES.weightClasses,
            THSWPA_RULES.bestLifterGroups
          )
        ).toBe('148 to 242+')
      })
  
      test('unknown weight class has no Best Lifter group', () => {
  
        expect(
          getBestLifterGroup(
            'UNKNOWN',
            THSPA_RULES.weightClasses,
            THSPA_RULES.bestLifterGroups
          )
        ).toBe('N/A')
      })
  
    }
  )