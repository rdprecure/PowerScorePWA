import {
    describe,
    expect,
    test,
  } from 'vitest'
  
  import {
    scoreTexasDivision,
  } from './divisionScoring'
  
  import {
    scoreDivisionTeams,
  } from './divisionTeamScoring'
  
  import {
    THSPA_RULES,
  } from '../rules/thspa'
  
  describe('PowerScore division team scoring', () => {
  
    test('calculates team totals from division scoring results', () => {
  
      const division =
        scoreTexasDivision(
          [
            {
              id: 1,
              teamId: 10,
              bodyWeight: 110,
              total: 1000,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
            {
              id: 2,
              teamId: 20,
              bodyWeight: 111,
              total: 900,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
          ],
          THSPA_RULES
        )
  
      const teams =
        scoreDivisionTeams(
          division,
          THSPA_RULES
        )
  
      expect(
        teams.find(
          team =>
            team.teamId === 10
        )?.totalPoints
      ).toBe(7)
  
      expect(
        teams.find(
          team =>
            team.teamId === 20
        )?.totalPoints
      ).toBe(5)
    })
  
    test('extra lifter affects individual placing but not team score', () => {
  
      const division =
        scoreTexasDivision(
          [
            {
              id: 1,
              teamId: 10,
              bodyWeight: 110,
              total: 1000,
              status: 'active',
              isGuest: false,
              isExtraLifter: true,
            },
            {
              id: 2,
              teamId: 20,
              bodyWeight: 111,
              total: 900,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
          ],
          THSPA_RULES
        )
  
      const teams =
        scoreDivisionTeams(
          division,
          THSPA_RULES
        )
  
      expect(
        division.find(
          lifter =>
            lifter.id === 1
        )?.place
      ).toBe(1)
  
      expect(
        division.find(
          lifter =>
            lifter.id === 2
        )?.place
      ).toBe(2)
  
      expect(
        teams.find(
          team =>
            team.teamId === 10
        )?.totalPoints
      ).toBe(0)
  
      expect(
        teams.find(
          team =>
            team.teamId === 20
        )?.totalPoints
      ).toBe(5)
    })
  
    test('guest lifter does not contribute team points', () => {
  
      const division =
        scoreTexasDivision(
          [
            {
              id: 1,
              teamId: 10,
              bodyWeight: 110,
              total: 1000,
              status: 'active',
              isGuest: true,
              isExtraLifter: false,
            },
            {
              id: 2,
              teamId: 10,
              bodyWeight: 111,
              total: 900,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
          ],
          THSPA_RULES
        )
  
      const teams =
        scoreDivisionTeams(
          division,
          THSPA_RULES
        )
  
      expect(
        teams[0].totalPoints
      ).toBe(7)
  
      expect(
        teams[0].scoringLifterIds
      ).toEqual([
        2,
      ])
    })
  
    test('bombed lifter does not contribute team points', () => {
  
      const division =
        scoreTexasDivision(
          [
            {
              id: 1,
              teamId: 10,
              bodyWeight: 110,
              total: 1000,
              status: 'bombed',
              isGuest: false,
              isExtraLifter: false,
            },
            {
              id: 2,
              teamId: 10,
              bodyWeight: 111,
              total: 900,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
          ],
          THSPA_RULES
        )
  
      const teams =
        scoreDivisionTeams(
          division,
          THSPA_RULES
        )
  
      expect(
        teams[0].totalPoints
      ).toBe(7)
  
      expect(
        teams[0].scoringLifterIds
      ).toEqual([
        2,
      ])
    })
  
    test('split tie points flow into team totals', () => {
  
      const division =
        scoreTexasDivision(
          [
            {
              id: 1,
              teamId: 10,
              bodyWeight: 110,
              total: 1000,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
              tieGroup: 'tie-1',
            },
            {
              id: 2,
              teamId: 20,
              bodyWeight: 110,
              total: 1000,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
              tieGroup: 'tie-1',
            },
          ],
          THSPA_RULES
        )
  
      const teams =
        scoreDivisionTeams(
          division,
          THSPA_RULES
        )
  
      expect(
        teams.find(
          team =>
            team.teamId === 10
        )?.totalPoints
      ).toBe(6)
  
      expect(
        teams.find(
          team =>
            team.teamId === 20
        )?.totalPoints
      ).toBe(6)
    })
  
    test('only three lifters per team per class score', () => {
  
      const division =
        scoreTexasDivision(
          [
            {
              id: 1,
              teamId: 10,
              bodyWeight: 110,
              total: 1000,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
            {
              id: 2,
              teamId: 10,
              bodyWeight: 111,
              total: 950,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
            {
              id: 3,
              teamId: 10,
              bodyWeight: 112,
              total: 900,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
            {
              id: 4,
              teamId: 10,
              bodyWeight: 113,
              total: 850,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
          ],
          THSPA_RULES
        )
  
      const teams =
        scoreDivisionTeams(
          division,
          THSPA_RULES
        )
  
      expect(
        teams[0].scoringLifterIds
      ).toEqual([
        1,
        2,
        3,
      ])
  
      expect(
        teams[0].totalPoints
      ).toBe(15)
    })
  
    test('team scores across multiple weight classes', () => {
  
      const division =
        scoreTexasDivision(
          [
            {
              id: 1,
              teamId: 10,
              bodyWeight: 110,
              total: 1000,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
            {
              id: 2,
              teamId: 10,
              bodyWeight: 120,
              total: 1100,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
          ],
          THSPA_RULES
        )
  
      const teams =
        scoreDivisionTeams(
          division,
          THSPA_RULES
        )
  
      expect(
        teams[0].totalPoints
      ).toBe(14)
  
      expect(
        teams[0].scoringLifterIds
      ).toEqual([
        1,
        2,
      ])
    })
  
    test('teamless lifter is not included in team results but still occupies individual placing', () => {
  
      const division =
        scoreTexasDivision(
          [
            {
              id: 1,
              teamId: null,
              bodyWeight: 110,
              total: 1000,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
            {
              id: 2,
              teamId: 10,
              bodyWeight: 111,
              total: 900,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
          ],
          THSPA_RULES
        )
  
      const teams =
        scoreDivisionTeams(
          division,
          THSPA_RULES
        )
  
      expect(
        division.find(
          lifter =>
            lifter.id === 1
        )?.place
      ).toBe(1)
  
      expect(
        division.find(
          lifter =>
            lifter.id === 2
        )?.place
      ).toBe(2)
  
      expect(
        teams
      ).toHaveLength(1)
  
      expect(
        teams[0].teamId
      ).toBe(10)
  
      expect(
        teams[0].totalPoints
      ).toBe(5)
    })
  
    test('calculates average coefficient total from scoring lifters', () => {
  
      const division =
        scoreTexasDivision(
          [
            {
              id: 1,
              teamId: 10,
              bodyWeight: 180,
              total: 1000,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
            {
              id: 2,
              teamId: 10,
              bodyWeight: 200,
              total: 1100,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
          ],
          THSPA_RULES
        )
  
      const teams =
        scoreDivisionTeams(
          division,
          THSPA_RULES
        )
  
      const expected =
        (
          (1000 * 0.6238) +
          (1100 * 0.5826)
        ) / 2
  
      expect(
        teams[0]
          .averageCoefficientTotal
      ).toBeCloseTo(
        expected,
        10
      )
    })
  
    test('average coefficient total excludes extra lifters', () => {
  
      const division =
        scoreTexasDivision(
          [
            {
              id: 1,
              teamId: 10,
              bodyWeight: 180,
              total: 1000,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
            {
              id: 2,
              teamId: 10,
              bodyWeight: 150,
              total: 1200,
              status: 'active',
              isGuest: false,
              isExtraLifter: true,
            },
          ],
          THSPA_RULES
        )
  
      const teams =
        scoreDivisionTeams(
          division,
          THSPA_RULES
        )
  
      expect(
        teams[0]
          .scoringLifterIds
      ).toEqual([
        1,
      ])
  
      expect(
        teams[0]
          .averageCoefficientTotal
      ).toBeCloseTo(
        623.8,
        10
      )
    })
  
    test('team with no scoring lifters has zero average coefficient total', () => {
  
      const division =
        scoreTexasDivision(
          [
            {
              id: 1,
              teamId: 10,
              bodyWeight: 180,
              total: 1000,
              status: 'bombed',
              isGuest: false,
              isExtraLifter: false,
            },
          ],
          THSPA_RULES
        )
  
      const teams =
        scoreDivisionTeams(
          division,
          THSPA_RULES
        )
  
      expect(
        teams[0].totalPoints
      ).toBe(0)
  
      expect(
        teams[0]
          .averageCoefficientTotal
      ).toBe(0)
    })
  
  })