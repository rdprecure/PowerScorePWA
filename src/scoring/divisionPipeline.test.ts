import {
  describe,
  expect,
  test,
} from 'vitest'

import type {
  DivisionScoringCandidate,
} from './divisionScoring'

import {
  scoreMeetDivision,
} from './divisionPipeline'

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
  'Generic division scoring pipeline',
  () => {

    test('THSPA can use the generic pipeline', () => {

      const lifters:
        DivisionScoringCandidate[] = [
          {
            id: 1,
            teamId: 10,
            bodyWeight: 150,
            weightClass: '165',
            total: 1000,
            status: 'active',
            isGuest: false,
            isExtraLifter: false,
          },
        ]

      const result =
        scoreMeetDivision(
          lifters,
          THSPA_RULES
        )

      expect(
        result.lifters[0].weightClass
      ).toBe('165')

      expect(
        result.lifters[0].place
      ).toBe(1)

      expect(
        result.lifters[0].points
      ).toBe(7)

      expect(
        result.bestLifterPlacements
          .length
      ).toBe(1)
    })

    test('THSWPA can use the generic pipeline', () => {

      const lifters:
        DivisionScoringCandidate[] = [
          {
            id: 1,
            teamId: 10,
            bodyWeight: 150,
            weightClass: '165',
            total: 1000,
            status: 'active',
            isGuest: false,
            isExtraLifter: false,
          },
        ]

      const result =
        scoreMeetDivision(
          lifters,
          THSWPA_RULES
        )

      expect(
        result.lifters[0].weightClass
      ).toBe('165')

      expect(
        result.lifters[0].place
      ).toBe(1)

      expect(
        result.lifters[0].points
      ).toBe(7)

      expect(
        result.bestLifterPlacements[0]
          .group
      ).toBe('148 to 242+')
    })

    test('NMAA boys can use the generic pipeline', () => {

      const lifters:
        DivisionScoringCandidate[] = [
          {
            id: 1,
            teamId: 10,
            bodyWeight: 220,
            weightClass: '220',
            total: 1200,
            status: 'active',
            isGuest: false,
            isExtraLifter: false,
          },
        ]

      const result =
        scoreMeetDivision(
          lifters,
          NMAA_BOYS_RULES
        )

      expect(
        result.lifters[0].weightClass
      ).toBe('220')

      expect(
        result.lifters[0].place
      ).toBe(1)

      expect(
        result.lifters[0].points
      ).toBe(7)

      expect(
        result.teams[0].totalPoints
      ).toBe(7)

      expect(
        result.bestLifterPlacements
          .length
      ).toBe(1)

      expect(
        result.bestLifterPlacements[0]
          .group
      ).toBe('198 to SHW')

      expect(
        result.bestLifterPlacements[0]
          .place
      ).toBe(1)

      expect(
        result.bestLifterPlacements[0]
          .coefficient
      ).toBeCloseTo(
        0.5545
      )

      expect(
        result.bestLifterPlacements[0]
          .coefficientTotal
      ).toBeCloseTo(
        665.4
      )
    })

    test('NMAA girls can use the generic pipeline', () => {

      const lifters:
        DivisionScoringCandidate[] = [
          {
            id: 1,
            teamId: 10,
            bodyWeight: 250,
            weightClass: '259',
            total: 1000,
            status: 'active',
            isGuest: false,
            isExtraLifter: false,
          },
        ]

      const result =
        scoreMeetDivision(
          lifters,
          NMAA_GIRLS_RULES
        )

      expect(
        result.lifters[0].weightClass
      ).toBe('259')

      expect(
        result.lifters[0].place
      ).toBe(1)

      expect(
        result.lifters[0].points
      ).toBe(7)

      expect(
        result.bestLifterPlacements
          .length
      ).toBe(1)

      expect(
        result.bestLifterPlacements[0]
          .group
      ).toBe('165 to 259+')

      expect(
        result.bestLifterPlacements[0]
          .place
      ).toBe(1)

      expect(
        result.bestLifterPlacements[0]
          .coefficient
      ).toBeCloseTo(
        0.5649
      )

      expect(
        result.bestLifterPlacements[0]
          .coefficientTotal
      ).toBeCloseTo(
        564.9
      )
    })

    test('NMAA uses a maximum of two scoring lifters per weight class', () => {

      const lifters:
        DivisionScoringCandidate[] = [
          {
            id: 1,
            teamId: 10,
            bodyWeight: 110,
            weightClass: '114',
            total: 1000,
            status: 'active',
            isGuest: false,
            isExtraLifter: false,
          },
          {
            id: 2,
            teamId: 10,
            bodyWeight: 111,
            weightClass: '114',
            total: 900,
            status: 'active',
            isGuest: false,
            isExtraLifter: false,
          },
          {
            id: 3,
            teamId: 10,
            bodyWeight: 112,
            weightClass: '114',
            total: 800,
            status: 'active',
            isGuest: false,
            isExtraLifter: false,
          },
        ]

      const result =
        scoreMeetDivision(
          lifters,
          NMAA_BOYS_RULES
        )

      expect(
        result.lifters.map(
          lifter =>
            lifter.weightClass
        )
      ).toEqual([
        '114',
        '114',
        '114',
      ])

      expect(
        result.teams[0]
          .scoringLifterIds
      ).toEqual([
        1,
        2,
      ])

      expect(
        result.teams[0].totalPoints
      ).toBe(12)
    })

    test('NMAA B or extra lifter can place individually but does not score for team', () => {

      const lifters:
        DivisionScoringCandidate[] = [
          {
            id: 1,
            teamId: 10,
            bodyWeight: 110,
            weightClass: '114',
            total: 1100,
            status: 'active',
            isGuest: false,
            isExtraLifter: true,
          },
          {
            id: 2,
            teamId: 10,
            bodyWeight: 111,
            weightClass: '114',
            total: 1000,
            status: 'active',
            isGuest: false,
            isExtraLifter: false,
          },
        ]

      const result =
        scoreMeetDivision(
          lifters,
          NMAA_BOYS_RULES
        )

      const extraLifter =
        result.lifters.find(
          lifter =>
            lifter.id === 1
        )

      expect(
        extraLifter?.place
      ).toBe(1)

      expect(
        extraLifter?.points
      ).toBe(7)

      expect(
        result.teams[0]
          .scoringLifterIds
      ).toEqual([
        2,
      ])

      expect(
        result.teams[0].totalPoints
      ).toBe(5)
    })

    test('NMAA Best Lifter placing keeps the two award groups separate', () => {

      const lifters:
        DivisionScoringCandidate[] = [
          {
            id: 1,
            teamId: 10,
            bodyWeight: 110,
            weightClass: '114',
            total: 1200,
            status: 'active',
            isGuest: false,
            isExtraLifter: false,
          },
          {
            id: 2,
            teamId: 20,
            bodyWeight: 200,
            weightClass: '220',
            total: 1500,
            status: 'active',
            isGuest: false,
            isExtraLifter: false,
          },
        ]

      const result =
        scoreMeetDivision(
          lifters,
          NMAA_BOYS_RULES
        )

      expect(
        result.bestLifterPlacements
          .length
      ).toBe(2)

      const lightGroup =
        result.bestLifterPlacements.find(
          placement =>
            placement.group ===
            '114 to 181'
        )

      const heavyGroup =
        result.bestLifterPlacements.find(
          placement =>
            placement.group ===
            '198 to SHW'
        )

      expect(
        lightGroup?.id
      ).toBe(1)

      expect(
        lightGroup?.place
      ).toBe(1)

      expect(
        lightGroup?.coefficient
      ).toBeCloseTo(
        0.9991
      )

      expect(
        lightGroup?.coefficientTotal
      ).toBeCloseTo(
        1198.92
      )

      expect(
        heavyGroup?.id
      ).toBe(2)

      expect(
        heavyGroup?.place
      ).toBe(1)

      expect(
        heavyGroup?.coefficient
      ).toBeCloseTo(
        0.5826
      )

      expect(
        heavyGroup?.coefficientTotal
      ).toBeCloseTo(
        873.9
      )
    })

    test('generic pipeline produces team standings for NMAA', () => {

      const lifters:
        DivisionScoringCandidate[] = [
          {
            id: 1,
            teamId: 10,
            bodyWeight: 110,
            weightClass: '114',
            total: 1000,
            status: 'active',
            isGuest: false,
            isExtraLifter: false,
          },
          {
            id: 2,
            teamId: 20,
            bodyWeight: 110,
            weightClass: '114',
            total: 900,
            status: 'active',
            isGuest: false,
            isExtraLifter: false,
          },
        ]

      const result =
        scoreMeetDivision(
          lifters,
          NMAA_BOYS_RULES
        )

      expect(
        result.teamStandings.find(
          team =>
            team.id === 10
        )?.place
      ).toBe(1)

      expect(
        result.teamStandings.find(
          team =>
            team.id === 20
        )?.place
      ).toBe(2)
    })

  }
)