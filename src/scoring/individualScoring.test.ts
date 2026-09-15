import {
    describe,
    expect,
    test,
  } from 'vitest'
  
  import {
    scoreTexasIndividuals,
  } from './individualScoring'
  
  import type {
    PlacementCandidate,
  } from './placing'
  
  import {
    TEXAS_INDIVIDUAL_POINTS,
  } from '../rules/texas'
  
  function makeLifter(
    overrides: Partial<PlacementCandidate>
  ): PlacementCandidate {
    return {
      id: 1,
      bodyWeight: 180,
      total: 1000,
      status: 'active',
      isGuest: false,
      ...overrides,
    }
  }
  
  describe('Texas individual scoring', () => {
  
    test('scores normal placing 7-5-3-2-1', () => {
      const lifters = [
        makeLifter({
          id: 1,
          total: 1200,
        }),
        makeLifter({
          id: 2,
          total: 1100,
        }),
        makeLifter({
          id: 3,
          total: 1000,
        }),
        makeLifter({
          id: 4,
          total: 900,
        }),
        makeLifter({
          id: 5,
          total: 800,
        }),
        makeLifter({
          id: 6,
          total: 700,
        }),
      ]
  
      const results =
        scoreTexasIndividuals(
          lifters,
          TEXAS_INDIVIDUAL_POINTS
        )
  
      expect(
        results.map(
          (result) => result.points
        )
      ).toEqual([
        7,
        5,
        3,
        2,
        1,
        0,
      ])
    })
  
    test('lighter lifter wins equal-total comparison', () => {
      const lifters = [
        makeLifter({
          id: 1,
          total: 1000,
          bodyWeight: 180,
        }),
        makeLifter({
          id: 2,
          total: 1000,
          bodyWeight: 175,
        }),
      ]
  
      const results =
        scoreTexasIndividuals(
          lifters,
          TEXAS_INDIVIDUAL_POINTS
        )
  
      expect(results[0]).toEqual({
        id: 2,
        place: 1,
        tied: false,
        tieCount: 1,
        points: 7,
      })
  
      expect(results[1]).toEqual({
        id: 1,
        place: 2,
        tied: false,
        tieCount: 1,
        points: 5,
      })
    })
  
    test('two-way true tie for first receives six points each', () => {
      const lifters = [
        makeLifter({
          id: 1,
          total: 1100,
          bodyWeight: 180,
          tieGroup: 'tie-1',
        }),
        makeLifter({
          id: 2,
          total: 1100,
          bodyWeight: 180,
          tieGroup: 'tie-1',
        }),
        makeLifter({
          id: 3,
          total: 1000,
        }),
      ]
  
      const results =
        scoreTexasIndividuals(
          lifters,
          TEXAS_INDIVIDUAL_POINTS
        )
  
      expect(results).toEqual([
        {
          id: 1,
          place: 1,
          tied: true,
          tieCount: 2,
          points: 6,
        },
        {
          id: 2,
          place: 1,
          tied: true,
          tieCount: 2,
          points: 6,
        },
        {
          id: 3,
          place: 3,
          tied: false,
          tieCount: 1,
          points: 3,
        },
      ])
    })
  
    test('three-way true tie for first receives five points each', () => {
      const lifters = [
        makeLifter({
          id: 1,
          total: 1100,
          tieGroup: 'tie-1',
        }),
        makeLifter({
          id: 2,
          total: 1100,
          tieGroup: 'tie-1',
        }),
        makeLifter({
          id: 3,
          total: 1100,
          tieGroup: 'tie-1',
        }),
        makeLifter({
          id: 4,
          total: 1000,
        }),
      ]
  
      const results =
        scoreTexasIndividuals(
          lifters,
          TEXAS_INDIVIDUAL_POINTS
        )
  
      expect(results[0].points).toBe(5)
      expect(results[1].points).toBe(5)
      expect(results[2].points).toBe(5)
  
      expect(results[0].place).toBe(1)
      expect(results[1].place).toBe(1)
      expect(results[2].place).toBe(1)
  
      expect(results[3]).toEqual({
        id: 4,
        place: 4,
        tied: false,
        tieCount: 1,
        points: 2,
      })
    })
  
    test('two-way tie for fourth receives one and a half points each', () => {
      const lifters = [
        makeLifter({
          id: 1,
          total: 1200,
        }),
        makeLifter({
          id: 2,
          total: 1100,
        }),
        makeLifter({
          id: 3,
          total: 1000,
        }),
        makeLifter({
          id: 4,
          total: 900,
          tieGroup: 'tie-4',
        }),
        makeLifter({
          id: 5,
          total: 900,
          tieGroup: 'tie-4',
        }),
        makeLifter({
          id: 6,
          total: 800,
        }),
      ]
  
      const results =
        scoreTexasIndividuals(
          lifters,
          TEXAS_INDIVIDUAL_POINTS
        )
  
      expect(results[3]).toEqual({
        id: 4,
        place: 4,
        tied: true,
        tieCount: 2,
        points: 1.5,
      })
  
      expect(results[4]).toEqual({
        id: 5,
        place: 4,
        tied: true,
        tieCount: 2,
        points: 1.5,
      })
  
      expect(results[5]).toEqual({
        id: 6,
        place: 6,
        tied: false,
        tieCount: 1,
        points: 0,
      })
    })
  
    test('tie crossing final scoring place splits available points', () => {
      const lifters = [
        makeLifter({
          id: 1,
          total: 1200,
        }),
        makeLifter({
          id: 2,
          total: 1100,
        }),
        makeLifter({
          id: 3,
          total: 1000,
        }),
        makeLifter({
          id: 4,
          total: 900,
        }),
        makeLifter({
          id: 5,
          total: 800,
          tieGroup: 'tie-5',
        }),
        makeLifter({
          id: 6,
          total: 800,
          tieGroup: 'tie-5',
        }),
      ]
  
      const results =
        scoreTexasIndividuals(
          lifters,
          TEXAS_INDIVIDUAL_POINTS
        )
  
      expect(results[4].points).toBe(0.5)
      expect(results[5].points).toBe(0.5)
  
      expect(results[4].place).toBe(5)
      expect(results[5].place).toBe(5)
    })
  
    test('bombed lifter receives no place and no points', () => {
      const lifters = [
        makeLifter({
          id: 1,
          total: 1200,
          status: 'bombed',
        }),
        makeLifter({
          id: 2,
          total: 1000,
        }),
      ]
  
      const results =
        scoreTexasIndividuals(
          lifters,
          TEXAS_INDIVIDUAL_POINTS
        )
  
      expect(results[0]).toEqual({
        id: 2,
        place: 1,
        tied: false,
        tieCount: 1,
        points: 7,
      })
  
      expect(results[1]).toEqual({
        id: 1,
        place: null,
        tied: false,
        tieCount: 1,
        points: 0,
      })
    })
  
    test('guest lifter receives no place and no points', () => {
      const lifters = [
        makeLifter({
          id: 1,
          total: 1200,
          isGuest: true,
        }),
        makeLifter({
          id: 2,
          total: 1000,
        }),
      ]
  
      const results =
        scoreTexasIndividuals(
          lifters,
          TEXAS_INDIVIDUAL_POINTS
        )
  
      expect(results[0]).toEqual({
        id: 2,
        place: 1,
        tied: false,
        tieCount: 1,
        points: 7,
      })
  
      expect(results[1]).toEqual({
        id: 1,
        place: null,
        tied: false,
        tieCount: 1,
        points: 0,
      })
    })
  
    test('zero-total lifter receives no place and no points', () => {
      const lifters = [
        makeLifter({
          id: 1,
          total: 0,
        }),
      ]
  
      const results =
        scoreTexasIndividuals(
          lifters,
          TEXAS_INDIVIDUAL_POINTS
        )
  
      expect(results).toEqual([
        {
          id: 1,
          place: null,
          tied: false,
          tieCount: 1,
          points: 0,
        },
      ])
    })
  
  })