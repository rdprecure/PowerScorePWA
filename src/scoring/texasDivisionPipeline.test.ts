import {
  describe,
  expect,
  test,
} from 'vitest'

import type {
  DivisionScoringCandidate,
} from './divisionScoring'

import {
  scoreTexasMeetDivision,
} from './texasDivisionPipeline'

import {
  THSPA_RULES,
} from '../rules/thspa'

function createLifter(
  id: number,
  teamId: number | null,
  bodyWeight: number,
  weightClass: string,
  total: number,
  options?: {
    isGuest?: boolean
    isExtraLifter?: boolean
    status?:
      | 'active'
      | 'bombed'
      | 'scratched'
      | 'disqualified'
    tieGroup?: string
  }
): DivisionScoringCandidate {

  return {
    id,
    teamId,
    bodyWeight,
    weightClass,
    total,
    status:
      options?.status ??
      'active',
    isGuest:
      options?.isGuest ??
      false,
    isExtraLifter:
      options?.isExtraLifter ??
      false,
    tieGroup:
      options?.tieGroup,
  }
}

describe(
  'PowerScore Texas division scoring pipeline',
  () => {

    test('scores a complete division from lifters through team standings', () => {

      const lifters:
        DivisionScoringCandidate[] = [

          // 114 class
          createLifter(
            1,
            10,
            110,
            '114',
            1000
          ),

          createLifter(
            2,
            20,
            111,
            '114',
            950
          ),

          // 123 class
          createLifter(
            3,
            20,
            120,
            '123',
            1100
          ),

          createLifter(
            4,
            10,
            121,
            '123',
            1000
          ),
        ]

      const result =
        scoreTexasMeetDivision(
          lifters,
          THSPA_RULES
        )

      expect(
        result.lifters
      ).toHaveLength(4)

      expect(
        result.teams
      ).toHaveLength(2)

      expect(
        result.teamStandings
      ).toHaveLength(2)

      const team10 =
        result.teams.find(
          team =>
            team.teamId === 10
        )

      const team20 =
        result.teams.find(
          team =>
            team.teamId === 20
        )

      expect(
        team10?.totalPoints
      ).toBe(12)

      expect(
        team20?.totalPoints
      ).toBe(12)

      /*
       * Each team has one first place
       * and one second place.
       *
       * Therefore team points and
       * place counts are tied.
       *
       * The final Texas tiebreaker is
       * average coefficient total.
       */

      expect(
        team10?.averageCoefficientTotal
      ).not.toBe(
        team20?.averageCoefficientTotal
      )

      const expectedWinner =
        (
          team10
            ?.averageCoefficientTotal ??
          0
        ) >
        (
          team20
            ?.averageCoefficientTotal ??
          0
        )
          ? 10
          : 20

      const expectedSecond =
        expectedWinner === 10
          ? 20
          : 10

      expect(
        result.teamStandings.find(
          team =>
            team.place === 1
        )?.id
      ).toBe(
        expectedWinner
      )

      expect(
        result.teamStandings.find(
          team =>
            team.place === 2
        )?.id
      ).toBe(
        expectedSecond
      )
    })

    test('uses assigned weight classes and calculates individual places', () => {

      const result =
        scoreTexasMeetDivision(
          [
            createLifter(
              1,
              10,
              110,
              '114',
              1000
            ),

            createLifter(
              2,
              20,
              112,
              '114',
              900
            ),

            createLifter(
              3,
              10,
              120,
              '123',
              1100
            ),
          ],
          THSPA_RULES
        )

      const lifter1 =
        result.lifters.find(
          lifter =>
            lifter.id === 1
        )

      const lifter2 =
        result.lifters.find(
          lifter =>
            lifter.id === 2
        )

      const lifter3 =
        result.lifters.find(
          lifter =>
            lifter.id === 3
        )

      expect(
        lifter1?.weightClass
      ).toBe('114')

      expect(
        lifter1?.place
      ).toBe(1)

      expect(
        lifter1?.points
      ).toBe(7)

      expect(
        lifter2?.weightClass
      ).toBe('114')

      expect(
        lifter2?.place
      ).toBe(2)

      expect(
        lifter2?.points
      ).toBe(5)

      expect(
        lifter3?.weightClass
      ).toBe('123')

      expect(
        lifter3?.place
      ).toBe(1)

      expect(
        lifter3?.points
      ).toBe(7)
    })

    test('extra lifter can affect individual placing without contributing team points', () => {

      const result =
        scoreTexasMeetDivision(
          [
            createLifter(
              1,
              10,
              110,
              '114',
              1100,
              {
                isExtraLifter:
                  true,
              }
            ),

            createLifter(
              2,
              20,
              111,
              '114',
              1000
            ),

            createLifter(
              3,
              10,
              112,
              '114',
              900
            ),
          ],
          THSPA_RULES
        )

      expect(
        result.lifters.find(
          lifter =>
            lifter.id === 1
        )?.place
      ).toBe(1)

      expect(
        result.lifters.find(
          lifter =>
            lifter.id === 1
        )?.points
      ).toBe(7)

      expect(
        result.teams.find(
          team =>
            team.teamId === 10
        )?.scoringLifterIds
      ).toEqual([
        3,
      ])

      expect(
        result.teams.find(
          team =>
            team.teamId === 10
        )?.totalPoints
      ).toBe(3)

      expect(
        result.teams.find(
          team =>
            team.teamId === 20
        )?.totalPoints
      ).toBe(5)
    })

    test('guest lifter does not place or contribute team points', () => {

      const result =
        scoreTexasMeetDivision(
          [
            createLifter(
              1,
              10,
              110,
              '114',
              1100,
              {
                isGuest:
                  true,
              }
            ),

            createLifter(
              2,
              20,
              111,
              '114',
              1000
            ),
          ],
          THSPA_RULES
        )

      expect(
        result.lifters.find(
          lifter =>
            lifter.id === 1
        )?.place
      ).toBeNull()

      expect(
        result.lifters.find(
          lifter =>
            lifter.id === 1
        )?.points
      ).toBe(0)

      expect(
        result.teams.find(
          team =>
            team.teamId === 10
        )?.totalPoints
      ).toBe(0)

      expect(
        result.teams.find(
          team =>
            team.teamId === 20
        )?.totalPoints
      ).toBe(7)
    })

    test('bombed lifter does not place or contribute team points', () => {

      const result =
        scoreTexasMeetDivision(
          [
            createLifter(
              1,
              10,
              110,
              '114',
              1100,
              {
                status:
                  'bombed',
              }
            ),

            createLifter(
              2,
              20,
              111,
              '114',
              1000
            ),
          ],
          THSPA_RULES
        )

      expect(
        result.lifters.find(
          lifter =>
            lifter.id === 1
        )?.place
      ).toBeNull()

      expect(
        result.lifters.find(
          lifter =>
            lifter.id === 1
        )?.points
      ).toBe(0)

      expect(
        result.teams.find(
          team =>
            team.teamId === 10
        )?.totalPoints
      ).toBe(0)

      expect(
        result.teams.find(
          team =>
            team.teamId === 20
        )?.totalPoints
      ).toBe(7)
    })

    test('team place counts break equal team points', () => {

      const result =
        scoreTexasMeetDivision(
          [
            // 114
            createLifter(
              1,
              10,
              110,
              '114',
              1000
            ),

            createLifter(
              2,
              20,
              111,
              '114',
              900
            ),

            // 123
            createLifter(
              3,
              20,
              120,
              '123',
              1100
            ),

            createLifter(
              4,
              10,
              121,
              '123',
              1000
            ),

            // 132
            createLifter(
              5,
              10,
              130,
              '132',
              1000
            ),

            createLifter(
              6,
              30,
              131,
              '132',
              900
            ),

            // 148
            createLifter(
              7,
              30,
              140,
              '148',
              1100
            ),

            createLifter(
              8,
              20,
              141,
              '148',
              1000
            ),
          ],
          THSPA_RULES
        )

      const team10 =
        result.teams.find(
          team =>
            team.teamId === 10
        )

      const team20 =
        result.teams.find(
          team =>
            team.teamId === 20
        )

      expect(
        team10?.totalPoints
      ).toBe(19)

      expect(
        team20?.totalPoints
      ).toBe(17)

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

    test('calculates average coefficient total as part of complete pipeline', () => {

      const result =
        scoreTexasMeetDivision(
          [
            createLifter(
              1,
              10,
              180,
              '181',
              1000
            ),

            createLifter(
              2,
              10,
              200,
              '220',
              1100
            ),
          ],
          THSPA_RULES
        )

      const team =
        result.teams.find(
          currentTeam =>
            currentTeam.teamId ===
            10
        )

      const expected =
        (
          (1000 * 0.6238) +
          (1100 * 0.5826)
        ) / 2

      expect(
        team?.averageCoefficientTotal
      ).toBeCloseTo(
        expected,
        10
      )
    })

    test('average coefficient total breaks an otherwise complete team tie', () => {

      const result =
        scoreTexasMeetDivision(
          [
            // 181 class
            createLifter(
              1,
              10,
              180,
              '181',
              1000
            ),

            createLifter(
              2,
              20,
              181,
              '181',
              900
            ),

            // 220 class
            createLifter(
              3,
              20,
              200,
              '220',
              1100
            ),

            createLifter(
              4,
              10,
              201,
              '220',
              1000
            ),
          ],
          THSPA_RULES
        )

      const team10 =
        result.teams.find(
          team =>
            team.teamId === 10
        )

      const team20 =
        result.teams.find(
          team =>
            team.teamId === 20
        )

      expect(
        team10?.totalPoints
      ).toBe(12)

      expect(
        team20?.totalPoints
      ).toBe(12)

      expect(
        team10?.averageCoefficientTotal
      ).not.toBe(
        team20?.averageCoefficientTotal
      )

      const expectedWinner =
        (
          team10
            ?.averageCoefficientTotal ??
          0
        ) >
        (
          team20
            ?.averageCoefficientTotal ??
          0
        )
          ? 10
          : 20

      expect(
        result.teamStandings.find(
          team =>
            team.place === 1
        )?.id
      ).toBe(
        expectedWinner
      )
    })

  }
)