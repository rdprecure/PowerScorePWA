import {
  describe,
  expect,
  test,
} from 'vitest'

import {
  validateAssignedWeightClass,
} from './assignedWeightClassValidation'

import {
  THSPA_RULES,
} from '../rules/thspa'

import {
  THSWPA_RULES,
} from '../rules/thswpa'

import {
  NMAA_BOYS_RULES,
} from '../rules/nmaaBoys'

import {
  NMAA_GIRLS_RULES,
} from '../rules/nmaaGirls'

describe(
  'PowerScore assigned weight class validation',
  () => {

    test('THSPA accepts automatic body-weight class', () => {

      const result =
        validateAssignedWeightClass(
          160,
          '165',
          THSPA_RULES,
        )

      expect(
        result.valid
      ).toBe(true)

      expect(
        result.code
      ).toBe('VALID')

      expect(
        result.automaticWeightClass
      ).toBe('165')

      expect(
        result.nextHigherWeightClass
      ).toBe('181')
    })

    test('THSPA accepts next higher weight class', () => {

      const result =
        validateAssignedWeightClass(
          160,
          '181',
          THSPA_RULES,
        )

      expect(
        result.valid
      ).toBe(true)

      expect(
        result.code
      ).toBe('VALID')
    })

    test('THSPA rejects class above next higher class', () => {

      const result =
        validateAssignedWeightClass(
          160,
          '198',
          THSPA_RULES,
        )

      expect(
        result.valid
      ).toBe(false)

      expect(
        result.code
      ).toBe(
        'NOT_BODY_WEIGHT_OR_NEXT_CLASS'
      )
    })

    test('THSWPA accepts next higher weight class', () => {

      const result =
        validateAssignedWeightClass(
          160,
          '181',
          THSWPA_RULES,
        )

      expect(
        result.valid
      ).toBe(true)
    })

    test('NMAA boys accepts next higher weight class', () => {

      const result =
        validateAssignedWeightClass(
          160,
          '181',
          NMAA_BOYS_RULES,
        )

      expect(
        result.valid
      ).toBe(true)
    })

    test('NMAA girls accepts next higher weight class', () => {

      const result =
        validateAssignedWeightClass(
          160,
          '181',
          NMAA_GIRLS_RULES,
        )

      expect(
        result.valid
      ).toBe(true)
    })

    test('invalid association weight class is rejected', () => {

      const result =
        validateAssignedWeightClass(
          160,
          '175',
          THSPA_RULES,
        )

      expect(
        result.valid
      ).toBe(false)

      expect(
        result.code
      ).toBe('WEIGHT_CLASS_NOT_FOUND')
    })

    test('missing body weight is rejected', () => {

      const result =
        validateAssignedWeightClass(
          null,
          '165',
          THSPA_RULES,
        )

      expect(
        result.valid
      ).toBe(false)

      expect(
        result.code
      ).toBe('BODY_WEIGHT_REQUIRED')
    })

  }
)