import {
    describe,
    expect,
    test,
  } from 'vitest'
  
  import {
    scoreTexasDivision,
  } from './divisionScoring'
  
  import type {
    DivisionScoringCandidate,
  } from './divisionScoring'
  
  import {
    scoreDivisionTeams,
  } from './divisionTeamScoring'
  
  import {
    THSPA_RULES,
  } from '../rules/thspa'
  
  function makeLifter(
    overrides:
      Partial<DivisionScoringCandidate>
  ): DivisionScoringCandidate {
  
    return {
      id: 1,
      teamId: 1,
  
      bodyWeight: 180,
      total: 1000,
  
      status: 'active',
  
      isGuest: false,
      isExtraLifter: false,
  
      ...overrides,
    }
  }
  
  describe('Texas division team scoring', () => {
  
    test('calculates team totals from division results', () => {
      const lifters = [
        makeLifter({
          id: 1,
          teamId: 10,
          bodyWeight: 160,
          total: 1100,
        }),
        makeLifter({
          id: 2,
          teamId: 20,
          bodyWeight: 160,
          total: 1000,
        }),
        makeLifter({
          id: 3,
          teamId: 10,
          bodyWeight: 180,
          total: 1200,
        }),
        makeLifter({
          id: 4,
          teamId: 20,
          bodyWeight: 180,
          total: 1100,
        }),
      ]
  
      const scoredLifters =
        scoreTexasDivision(
          lifters,
          THSPA_RULES
        )
  
      const teams =
        scoreDivisionTeams(
          scoredLifters,
          THSPA_RULES
        )
  
      const team10 =
        teams.find(
          (team) => team.teamId === 10
        )!
  
      const team20 =
        teams.find(
          (team) => team.teamId === 20
        )!
  
      expect(team10.totalPoints).toBe(14)
      expect(team20.totalPoints).toBe(10)
  
      expect(
        team10.scoringLifterIds
      ).toEqual([1, 3])
  
      expect(
        team20.scoringLifterIds
      ).toEqual([2, 4])
    })
  
    test('extra lifter can affect placing but does not score for team', () => {
      const lifters = [
        makeLifter({
          id: 1,
          teamId: 10,
          bodyWeight: 180,
          total: 1200,
          isExtraLifter: true,
        }),
        makeLifter({
          id: 2,
          teamId: 10,
          bodyWeight: 180,
          total: 1100,
        }),
        makeLifter({
          id: 3,
          teamId: 20,
          bodyWeight: 180,
          total: 1000,
        }),
      ]
  
      const scoredLifters =
        scoreTexasDivision(
          lifters,
          THSPA_RULES
        )
  
      const extra =
        scoredLifters.find(
          (lifter) => lifter.id === 1
        )!
  
      const regular =
        scoredLifters.find(
          (lifter) => lifter.id === 2
        )!
  
      expect(extra.place).toBe(1)
      expect(extra.points).toBe(7)
  
      expect(regular.place).toBe(2)
      expect(regular.points).toBe(5)
  
      const teams =
        scoreDivisionTeams(
          scoredLifters,
          THSPA_RULES
        )
  
      const team10 =
        teams.find(
          (team) => team.teamId === 10
        )!
  
      expect(team10.totalPoints).toBe(5)
  
      expect(
        team10.scoringLifterIds
      ).toEqual([2])
    })
  
    test('guest does not score team points', () => {
      const lifters = [
        makeLifter({
          id: 1,
          teamId: 10,
          bodyWeight: 180,
          total: 1200,
          isGuest: true,
        }),
        makeLifter({
          id: 2,
          teamId: 10,
          bodyWeight: 180,
          total: 1100,
        }),
      ]
  
      const scoredLifters =
        scoreTexasDivision(
          lifters,
          THSPA_RULES
        )
  
      const teams =
        scoreDivisionTeams(
          scoredLifters,
          THSPA_RULES
        )
  
      expect(teams).toEqual([
        {
          teamId: 10,
          totalPoints: 7,
          scoringLifterIds: [2],
        },
      ])
    })
  
    test('bombed lifter does not score team points', () => {
      const lifters = [
        makeLifter({
          id: 1,
          teamId: 10,
          bodyWeight: 180,
          total: 1200,
          status: 'bombed',
        }),
        makeLifter({
          id: 2,
          teamId: 10,
          bodyWeight: 180,
          total: 1100,
        }),
      ]
  
      const scoredLifters =
        scoreTexasDivision(
          lifters,
          THSPA_RULES
        )
  
      const teams =
        scoreDivisionTeams(
          scoredLifters,
          THSPA_RULES
        )
  
      expect(teams).toEqual([
        {
          teamId: 10,
          totalPoints: 7,
          scoringLifterIds: [2],
        },
      ])
    })
  
    test('split tie points flow into team totals', () => {
      const lifters = [
        makeLifter({
          id: 1,
          teamId: 10,
          bodyWeight: 180,
          total: 1100,
          tieGroup: 'tie-1',
        }),
        makeLifter({
          id: 2,
          teamId: 20,
          bodyWeight: 180,
          total: 1100,
          tieGroup: 'tie-1',
        }),
        makeLifter({
          id: 3,
          teamId: 30,
          bodyWeight: 180,
          total: 1000,
        }),
      ]
  
      const scoredLifters =
        scoreTexasDivision(
          lifters,
          THSPA_RULES
        )
  
      expect(
        scoredLifters.find(
          (lifter) => lifter.id === 1
        )?.points
      ).toBe(6)
  
      expect(
        scoredLifters.find(
          (lifter) => lifter.id === 2
        )?.points
      ).toBe(6)
  
      expect(
        scoredLifters.find(
          (lifter) => lifter.id === 3
        )?.points
      ).toBe(3)
  
      const teams =
        scoreDivisionTeams(
          scoredLifters,
          THSPA_RULES
        )
  
      expect(
        teams.find(
          (team) => team.teamId === 10
        )?.totalPoints
      ).toBe(6)
  
      expect(
        teams.find(
          (team) => team.teamId === 20
        )?.totalPoints
      ).toBe(6)
  
      expect(
        teams.find(
          (team) => team.teamId === 30
        )?.totalPoints
      ).toBe(3)
    })
  
    test('only three lifters from one team and weight class score', () => {
      const lifters = [
        makeLifter({
          id: 1,
          teamId: 10,
          bodyWeight: 180,
          total: 1200,
        }),
        makeLifter({
          id: 2,
          teamId: 10,
          bodyWeight: 180,
          total: 1150,
        }),
        makeLifter({
          id: 3,
          teamId: 10,
          bodyWeight: 180,
          total: 1100,
        }),
        makeLifter({
          id: 4,
          teamId: 10,
          bodyWeight: 180,
          total: 1050,
        }),
        makeLifter({
          id: 5,
          teamId: 20,
          bodyWeight: 180,
          total: 1000,
        }),
      ]
  
      const scoredLifters =
        scoreTexasDivision(
          lifters,
          THSPA_RULES
        )
  
      const teams =
        scoreDivisionTeams(
          scoredLifters,
          THSPA_RULES
        )
  
      const team10 =
        teams.find(
          (team) => team.teamId === 10
        )!
  
      expect(team10.totalPoints).toBe(15)
  
      expect(
        team10.scoringLifterIds
      ).toEqual([
        1,
        2,
        3,
      ])
    })
  
    test('team can score lifters from multiple weight classes', () => {
      const lifters = [
        makeLifter({
          id: 1,
          teamId: 10,
          bodyWeight: 160,
          total: 1000,
        }),
        makeLifter({
          id: 2,
          teamId: 10,
          bodyWeight: 175,
          total: 1100,
        }),
        makeLifter({
          id: 3,
          teamId: 10,
          bodyWeight: 190,
          total: 1200,
        }),
      ]
  
      const scoredLifters =
        scoreTexasDivision(
          lifters,
          THSPA_RULES
        )
  
      const teams =
        scoreDivisionTeams(
          scoredLifters,
          THSPA_RULES
        )
  
      expect(teams).toEqual([
        {
          teamId: 10,
          totalPoints: 21,
          scoringLifterIds: [
            1,
            2,
            3,
          ],
        },
      ])
    })
  
    test('lifter without a team is not included in team results', () => {
      const lifters = [
        makeLifter({
          id: 1,
          teamId: null,
          bodyWeight: 180,
          total: 1200,
        }),
        makeLifter({
          id: 2,
          teamId: 10,
          bodyWeight: 180,
          total: 1100,
        }),
      ]
  
      const scoredLifters =
        scoreTexasDivision(
          lifters,
          THSPA_RULES
        )
  
      const teams =
        scoreDivisionTeams(
          scoredLifters,
          THSPA_RULES
        )
  
      expect(teams).toEqual([
        {
          teamId: 10,
          totalPoints: 5,
          scoringLifterIds: [2],
        },
      ])
    })
  
  })