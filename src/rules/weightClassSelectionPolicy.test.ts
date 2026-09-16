import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  THSPA_RULES,
} from './thspa'

import {
  THSWPA_RULES,
} from './thswpa'

import {
  NMAA_BOYS_RULES,
} from './nmaaBoys'

import {
  NMAA_GIRLS_RULES,
} from './nmaaGirls'

describe(
  'weight class selection policy',
  () => {
    it(
      'allows THSPA lifters to use their body-weight class or next class',
      () => {
        expect(
          THSPA_RULES
            .weightClassSelectionPolicy,
        ).toBe(
          'body-weight-or-next-class',
        )
      },
    )

    it(
      'allows THSWPA lifters to use their body-weight class or next class',
      () => {
        expect(
          THSWPA_RULES
            .weightClassSelectionPolicy,
        ).toBe(
          'body-weight-or-next-class',
        )
      },
    )

    it(
      'allows NMAA boys to use their body-weight class or next class',
      () => {
        expect(
          NMAA_BOYS_RULES
            .weightClassSelectionPolicy,
        ).toBe(
          'body-weight-or-next-class',
        )
      },
    )

    it(
      'allows NMAA girls to use their body-weight class or next class',
      () => {
        expect(
          NMAA_GIRLS_RULES
            .weightClassSelectionPolicy,
        ).toBe(
          'body-weight-or-next-class',
        )
      },
    )
  },
)