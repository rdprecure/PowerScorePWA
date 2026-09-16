import { describe, expect, it } from 'vitest'

import type { WeightClass } from '../models/WeightClass'

import {
  createAutomaticWeightClassAssignment,
  createManualWeightClassAssignment,
  getAutomaticWeightClass,
  getNextHigherWeightClass,
  updateWeightClassForBodyWeight,
  validateBodyWeightClassOnly,
  validateBodyWeightOrNextClass,
} from './weightClassAssignment'

const weightClasses: WeightClass[] = [
  {
    name: '165',
    maxWeight: 165,
  },
  {
    name: '181',
    maxWeight: 181,
  },
  {
    name: '198',
    maxWeight: 198,
  },
  {
    name: '220',
    maxWeight: 220,
  },
  {
    name: 'SHW',
    maxWeight: Number.POSITIVE_INFINITY,
  },
]

describe('getAutomaticWeightClass', () => {
  it('assigns the class containing the body weight', () => {
    expect(
      getAutomaticWeightClass(180.2, weightClasses),
    ).toBe('181')
  })

  it('assigns the lower class when body weight is exactly its limit', () => {
    expect(
      getAutomaticWeightClass(181, weightClasses),
    ).toBe('181')
  })

  it('moves to the next class when body weight exceeds the limit', () => {
    expect(
      getAutomaticWeightClass(181.1, weightClasses),
    ).toBe('198')
  })

  it('returns null when body weight has not been entered', () => {
    expect(
      getAutomaticWeightClass(null, weightClasses),
    ).toBeNull()
  })
})

describe('automatic and manual assignments', () => {
  it('creates an automatic assignment from body weight', () => {
    expect(
      createAutomaticWeightClassAssignment(
        180.2,
        weightClasses,
      ),
    ).toEqual({
      weightClass: '181',
      weightClassSource: 'automatic',
    })
  })

  it('updates an automatic class when body weight changes', () => {
    const currentAssignment =
      createAutomaticWeightClassAssignment(
        180.2,
        weightClasses,
      )

    expect(
      updateWeightClassForBodyWeight(
        181.1,
        currentAssignment,
        weightClasses,
      ),
    ).toEqual({
      weightClass: '198',
      weightClassSource: 'automatic',
    })
  })

  it('preserves a manual class when body weight changes', () => {
    const currentAssignment =
      createManualWeightClassAssignment('198')

    expect(
      updateWeightClassForBodyWeight(
        175,
        currentAssignment,
        weightClasses,
      ),
    ).toEqual({
      weightClass: '198',
      weightClassSource: 'manual',
    })
  })
})

describe('getNextHigherWeightClass', () => {
  it('returns the class immediately above the body-weight class', () => {
    expect(
      getNextHigherWeightClass(
        180.2,
        weightClasses,
      ),
    ).toBe('198')
  })

  it('returns null when already in the highest class', () => {
    expect(
      getNextHigherWeightClass(
        250,
        weightClasses,
      ),
    ).toBeNull()
  })
})

describe('validateBodyWeightClassOnly', () => {
  it('accepts the body-weight class', () => {
    const result = validateBodyWeightClassOnly(
      180.2,
      '181',
      weightClasses,
    )

    expect(result.valid).toBe(true)
    expect(result.code).toBe('VALID')
  })

  it('rejects the next higher class', () => {
    const result = validateBodyWeightClassOnly(
      180.2,
      '198',
      weightClasses,
    )

    expect(result.valid).toBe(false)
    expect(result.code).toBe('NOT_BODY_WEIGHT_CLASS')
  })
})

describe('validateBodyWeightOrNextClass', () => {
  it('accepts the body-weight class', () => {
    const result = validateBodyWeightOrNextClass(
      180.2,
      '181',
      weightClasses,
    )

    expect(result.valid).toBe(true)
    expect(result.code).toBe('VALID')
  })

  it('accepts the immediately higher class', () => {
    const result = validateBodyWeightOrNextClass(
      180.2,
      '198',
      weightClasses,
    )

    expect(result.valid).toBe(true)
    expect(result.code).toBe('VALID')
  })

  it('rejects a class more than one class higher', () => {
    const result = validateBodyWeightOrNextClass(
      180.2,
      '220',
      weightClasses,
    )

    expect(result.valid).toBe(false)
    expect(result.code).toBe(
      'NOT_BODY_WEIGHT_OR_NEXT_CLASS',
    )
  })

  it('rejects a class below the body-weight class', () => {
    const result = validateBodyWeightOrNextClass(
      180.2,
      '165',
      weightClasses,
    )

    expect(result.valid).toBe(false)
    expect(result.code).toBe(
      'NOT_BODY_WEIGHT_OR_NEXT_CLASS',
    )
  })

  it('reports when body weight has not been entered', () => {
    const result = validateBodyWeightOrNextClass(
      null,
      '181',
      weightClasses,
    )

    expect(result.valid).toBe(false)
    expect(result.code).toBe('BODY_WEIGHT_REQUIRED')
  })

  it('rejects a weight class that does not exist', () => {
    const result = validateBodyWeightOrNextClass(
      180.2,
      '190',
      weightClasses,
    )

    expect(result.valid).toBe(false)
    expect(result.code).toBe(
      'WEIGHT_CLASS_NOT_FOUND',
    )
  })
})