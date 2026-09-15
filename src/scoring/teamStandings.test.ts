import {
    describe,
    expect,
    test,
  } from 'vitest'
  
  import {
    rankTeamStandings,
  } from './teamStandings'
  
  import type {
    TeamStandingCandidate,
    TeamStandingRules,
  } from './teamStandings'
  
  const standardRules: TeamStandingRules = {
    useAverageCoefficientTieBreaker: false,
  }
  
  function makeTeam(
    overrides: Partial<TeamStandingCandidate>
  ): TeamStandingCandidate {
    return {
      id: 1,
      totalPoints: 0,
      placeCounts: [0, 0, 0, 0, 0],
      allOtherPlaceCount: 0,
      ...overrides,
    }
  }
  
  describe('PowerScore team standings', () => {
  
    test('team with more points places higher', () => {
      const teams = [
        makeTeam({
          id: 1,
          totalPoints: 20,
        }),
        makeTeam({
          id: 2,
          totalPoints: 25,
        }),
      ]
  
      const results =
        rankTeamStandings(
          teams,
          standardRules
        )
  
      expect(results).toEqual([
        {
          id: 2,
          place: 1,
          tied: false,
        },
        {
          id: 1,
          place: 2,
          tied: false,
        },
      ])
    })
  
    test('first-place count breaks equal-points tie', () => {
      const teams = [
        makeTeam({
          id: 1,
          totalPoints: 20,
          placeCounts: [1, 2, 1, 0, 0],
        }),
        makeTeam({
          id: 2,
          totalPoints: 20,
          placeCounts: [2, 0, 2, 0, 0],
        }),
      ]
  
      const results =
        rankTeamStandings(
          teams,
          standardRules
        )
  
      expect(results[0]).toEqual({
        id: 2,
        place: 1,
        tied: false,
      })
  
      expect(results[1]).toEqual({
        id: 1,
        place: 2,
        tied: false,
      })
    })
  
    test('second-place count breaks tie when firsts are equal', () => {
      const teams = [
        makeTeam({
          id: 1,
          totalPoints: 20,
          placeCounts: [1, 1, 2, 0, 0],
        }),
        makeTeam({
          id: 2,
          totalPoints: 20,
          placeCounts: [1, 2, 0, 0, 0],
        }),
      ]
  
      const results =
        rankTeamStandings(
          teams,
          standardRules
        )
  
      expect(results[0].id).toBe(2)
      expect(results[0].place).toBe(1)
  
      expect(results[1].id).toBe(1)
      expect(results[1].place).toBe(2)
    })
  
    test('later place counts are considered in order', () => {
      const teams = [
        makeTeam({
          id: 1,
          totalPoints: 20,
          placeCounts: [1, 1, 1, 1, 0],
        }),
        makeTeam({
          id: 2,
          totalPoints: 20,
          placeCounts: [1, 1, 2, 0, 0],
        }),
      ]
  
      const results =
        rankTeamStandings(
          teams,
          standardRules
        )
  
      expect(results[0].id).toBe(2)
      expect(results[1].id).toBe(1)
    })
  
    test('all-other-place count is used after configured places', () => {
      const teams = [
        makeTeam({
          id: 1,
          totalPoints: 20,
          placeCounts: [1, 1, 1, 0, 0],
          allOtherPlaceCount: 1,
        }),
        makeTeam({
          id: 2,
          totalPoints: 20,
          placeCounts: [1, 1, 1, 0, 0],
          allOtherPlaceCount: 2,
        }),
      ]
  
      const results =
        rankTeamStandings(
          teams,
          standardRules
        )
  
      expect(results[0].id).toBe(2)
      expect(results[1].id).toBe(1)
    })
  
    test('identical scoring records produce a true tie', () => {
      const teams = [
        makeTeam({
          id: 1,
          totalPoints: 20,
          placeCounts: [1, 2, 1, 0, 0],
        }),
        makeTeam({
          id: 2,
          totalPoints: 20,
          placeCounts: [1, 2, 1, 0, 0],
        }),
      ]
  
      const results =
        rankTeamStandings(
          teams,
          standardRules
        )
  
      expect(results).toEqual([
        {
          id: 1,
          place: 1,
          tied: true,
        },
        {
          id: 2,
          place: 1,
          tied: true,
        },
      ])
    })
  
    test('placing after a tie uses competition ranking', () => {
      const teams = [
        makeTeam({
          id: 1,
          totalPoints: 25,
          placeCounts: [2, 1, 0, 0, 0],
        }),
        makeTeam({
          id: 2,
          totalPoints: 25,
          placeCounts: [2, 1, 0, 0, 0],
        }),
        makeTeam({
          id: 3,
          totalPoints: 20,
          placeCounts: [1, 2, 1, 0, 0],
        }),
      ]
  
      const results =
        rankTeamStandings(
          teams,
          standardRules
        )
  
      expect(results).toEqual([
        {
          id: 1,
          place: 1,
          tied: true,
        },
        {
          id: 2,
          place: 1,
          tied: true,
        },
        {
          id: 3,
          place: 3,
          tied: false,
        },
      ])
    })
  
    test('average coefficient can break otherwise identical tie', () => {
      const rules: TeamStandingRules = {
        useAverageCoefficientTieBreaker: true,
      }
  
      const teams = [
        makeTeam({
          id: 1,
          totalPoints: 20,
          placeCounts: [1, 2, 1, 0, 0],
          averageCoefficient: 450.25,
        }),
        makeTeam({
          id: 2,
          totalPoints: 20,
          placeCounts: [1, 2, 1, 0, 0],
          averageCoefficient: 455.75,
        }),
      ]
  
      const results =
        rankTeamStandings(
          teams,
          rules
        )
  
      expect(results[0]).toEqual({
        id: 2,
        place: 1,
        tied: false,
      })
  
      expect(results[1]).toEqual({
        id: 1,
        place: 2,
        tied: false,
      })
    })
  
    test('coefficient is ignored when coefficient tiebreaker is disabled', () => {
      const teams = [
        makeTeam({
          id: 1,
          totalPoints: 20,
          placeCounts: [1, 2, 1, 0, 0],
          averageCoefficient: 450.25,
        }),
        makeTeam({
          id: 2,
          totalPoints: 20,
          placeCounts: [1, 2, 1, 0, 0],
          averageCoefficient: 455.75,
        }),
      ]
  
      const results =
        rankTeamStandings(
          teams,
          standardRules
        )
  
      expect(results[0].place).toBe(1)
      expect(results[1].place).toBe(1)
  
      expect(results[0].tied).toBe(true)
      expect(results[1].tied).toBe(true)
    })
  
    test('team with zero points receives no place', () => {
      const teams = [
        makeTeam({
          id: 1,
          totalPoints: 20,
        }),
        makeTeam({
          id: 2,
          totalPoints: 0,
        }),
      ]
  
      const results =
        rankTeamStandings(
          teams,
          standardRules
        )
  
      expect(results).toEqual([
        {
          id: 1,
          place: 1,
          tied: false,
        },
        {
          id: 2,
          place: null,
          tied: false,
        },
      ])
    })
  
  })