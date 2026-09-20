import {
  describe,
  expect,
  test,
} from 'vitest'

import {
  calculateIndividualStandings,
  calculateTeamStandings,
} from './standings'


function lifter(
  overrides:
    Partial<{
      id: number
      lifterNumber: number
      firstName: string
      lastName: string
      teamId: number | null
      bodyWeight: number | null
      weightClass: string | null
      status: string
      isGuest: boolean
      isExtraLifter: boolean
      squat: number | null
      bench: number | null
      deadlift: number | null
    }> = {},
) {
  return {
    id: 1,
    lifterNumber: 1,
    firstName: 'Test',
    lastName: 'Lifter',
    teamId: 1,
    bodyWeight: 180,
    weightClass: '181',
    status: 'active',
    isGuest: false,
    isExtraLifter: false,
    squat: 400,
    bench: 250,
    deadlift: 350,
    ...overrides,
  }
}


describe(
  'standings',
  () => {

    test(
      'places higher total first and lighter body weight wins a total tie',
      () => {
        const rows =
          calculateIndividualStandings([
            lifter({
              id: 1,
              lifterNumber: 1,
              bodyWeight: 180,
            }),
            lifter({
              id: 2,
              lifterNumber: 2,
              bodyWeight: 179,
            }),
            lifter({
              id: 3,
              lifterNumber: 3,
              squat: 410,
            }),
          ])

        expect(
          rows.map(
            row =>
              row.lifterId
          )
        ).toEqual([
          3,
          2,
          1,
        ])
      }
    )

    test(
      'excludes incomplete and non-active lifters',
      () => {
        const rows =
          calculateIndividualStandings([
            lifter({
              id: 1,
              deadlift: null,
            }),
            lifter({
              id: 2,
              status: 'scratched',
            }),
            lifter({
              id: 3,
            }),
          ])

        expect(
          rows.map(
            row =>
              row.lifterId
          )
        ).toEqual([3])
      }
    )

    test(
      'extra lifter can place but earns no team points',
      () => {
        const individual =
          calculateIndividualStandings([
            lifter({
              id: 1,
              teamId: 1,
              isExtraLifter: true,
              squat: 500,
            }),
            lifter({
              id: 2,
              teamId: 2,
              squat: 450,
            }),
          ])

        expect(
          individual[0].place
        ).toBe(1)

        const teams =
          calculateTeamStandings(
            individual
          )

        expect(
          teams
        ).toHaveLength(1)

        expect(
          teams[0].teamId
        ).toBe(2)

        expect(
          teams[0].totalPoints
        ).toBe(5)
      }
    )
  }
)
