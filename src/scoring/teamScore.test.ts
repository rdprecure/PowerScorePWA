import {
    describe,
    expect,
    test,
  } from 'vitest'
  
  import {
    calculateTeamScore,
  } from './teamScore'
  
  import type {
    TeamScoringCandidate,
    TeamScoringRules,
  } from './teamScore'
  
  import {
    TEXAS_TEAM_SCORING,
  } from '../rules/texas'
  
  function makeLifter(
    overrides: Partial<TeamScoringCandidate>
  ): TeamScoringCandidate {
    return {
      id: 1,
      weightClass: '181',
      place: 1,
      points: 7,
      isGuest: false,
      isExtraLifter: false,
      isActive: true,
      hasValidTotal: true,
      ...overrides,
    }
  }
  
  describe('PowerScore team scoring', () => {
  
    test('adds points from eligible lifters', () => {
      const lifters = [
        makeLifter({
          id: 1,
          place: 1,
          points: 7,
        }),
        makeLifter({
          id: 2,
          weightClass: '198',
          place: 2,
          points: 5,
        }),
        makeLifter({
          id: 3,
          weightClass: '220',
          place: 3,
          points: 3,
        }),
      ]
  
      const result =
        calculateTeamScore(
          lifters,
          TEXAS_TEAM_SCORING
        )
  
      expect(result.totalPoints).toBe(15)
  
      expect(result.scoringLifterIds).toEqual([
        1,
        2,
        3,
      ])
    })
  
    test('guest lifter does not score team points', () => {
      const lifters = [
        makeLifter({
          id: 1,
          isGuest: true,
        }),
        makeLifter({
          id: 2,
          place: 2,
          points: 5,
        }),
      ]
  
      const result =
        calculateTeamScore(
          lifters,
          TEXAS_TEAM_SCORING
        )
  
      expect(result.totalPoints).toBe(5)
      expect(result.scoringLifterIds).toEqual([2])
    })
  
    test('extra lifter does not score team points', () => {
      const lifters = [
        makeLifter({
          id: 1,
          isExtraLifter: true,
        }),
        makeLifter({
          id: 2,
          place: 2,
          points: 5,
        }),
      ]
  
      const result =
        calculateTeamScore(
          lifters,
          TEXAS_TEAM_SCORING
        )
  
      expect(result.totalPoints).toBe(5)
      expect(result.scoringLifterIds).toEqual([2])
    })
  
    test('inactive lifter does not score team points', () => {
      const lifters = [
        makeLifter({
          id: 1,
          isActive: false,
        }),
        makeLifter({
          id: 2,
          place: 2,
          points: 5,
        }),
      ]
  
      const result =
        calculateTeamScore(
          lifters,
          TEXAS_TEAM_SCORING
        )
  
      expect(result.totalPoints).toBe(5)
      expect(result.scoringLifterIds).toEqual([2])
    })
  
    test('lifter without valid total does not score', () => {
      const lifters = [
        makeLifter({
          id: 1,
          hasValidTotal: false,
        }),
        makeLifter({
          id: 2,
          place: 2,
          points: 5,
        }),
      ]
  
      const result =
        calculateTeamScore(
          lifters,
          TEXAS_TEAM_SCORING
        )
  
      expect(result.totalPoints).toBe(5)
      expect(result.scoringLifterIds).toEqual([2])
    })
  
    test('lifter with no place does not score', () => {
      const lifters = [
        makeLifter({
          id: 1,
          place: null,
          points: 0,
        }),
        makeLifter({
          id: 2,
          place: 2,
          points: 5,
        }),
      ]
  
      const result =
        calculateTeamScore(
          lifters,
          TEXAS_TEAM_SCORING
        )
  
      expect(result.totalPoints).toBe(5)
      expect(result.scoringLifterIds).toEqual([2])
    })
  
    test('limits scoring lifters from one weight class', () => {
      const lifters = [
        makeLifter({
          id: 1,
          weightClass: '181',
          place: 1,
          points: 7,
        }),
        makeLifter({
          id: 2,
          weightClass: '181',
          place: 2,
          points: 5,
        }),
        makeLifter({
          id: 3,
          weightClass: '181',
          place: 3,
          points: 3,
        }),
        makeLifter({
          id: 4,
          weightClass: '181',
          place: 4,
          points: 2,
        }),
      ]
  
      const result =
        calculateTeamScore(
          lifters,
          TEXAS_TEAM_SCORING
        )
  
      expect(result.totalPoints).toBe(15)
  
      expect(result.scoringLifterIds).toEqual([
        1,
        2,
        3,
      ])
    })
  
    test('class limit does not prevent lifter from another class scoring', () => {
      const lifters = [
        makeLifter({
          id: 1,
          weightClass: '181',
          place: 1,
          points: 7,
        }),
        makeLifter({
          id: 2,
          weightClass: '181',
          place: 2,
          points: 5,
        }),
        makeLifter({
          id: 3,
          weightClass: '181',
          place: 3,
          points: 3,
        }),
        makeLifter({
          id: 4,
          weightClass: '181',
          place: 4,
          points: 2,
        }),
        makeLifter({
          id: 5,
          weightClass: '198',
          place: 5,
          points: 1,
        }),
      ]
  
      const result =
        calculateTeamScore(
          lifters,
          TEXAS_TEAM_SCORING
        )
  
      expect(result.totalPoints).toBe(16)
  
      expect(result.scoringLifterIds).toEqual([
        1,
        2,
        3,
        5,
      ])
    })
  
    test('best placing lifters consume class scoring slots first', () => {
      const lifters = [
        makeLifter({
          id: 4,
          weightClass: '181',
          place: 4,
          points: 2,
        }),
        makeLifter({
          id: 2,
          weightClass: '181',
          place: 2,
          points: 5,
        }),
        makeLifter({
          id: 1,
          weightClass: '181',
          place: 1,
          points: 7,
        }),
        makeLifter({
          id: 3,
          weightClass: '181',
          place: 3,
          points: 3,
        }),
      ]
  
      const result =
        calculateTeamScore(
          lifters,
          TEXAS_TEAM_SCORING
        )
  
      expect(result.totalPoints).toBe(15)
  
      expect(result.scoringLifterIds).toEqual([
        1,
        2,
        3,
      ])
    })
  
    test('limits total number of scoring lifters', () => {
      const rules: TeamScoringRules = {
        maxScoringLifters: 3,
        maxScoringLiftersPerClass: 3,
      }
  
      const lifters = [
        makeLifter({
          id: 1,
          weightClass: '181',
          place: 1,
          points: 7,
        }),
        makeLifter({
          id: 2,
          weightClass: '198',
          place: 2,
          points: 5,
        }),
        makeLifter({
          id: 3,
          weightClass: '220',
          place: 3,
          points: 3,
        }),
        makeLifter({
          id: 4,
          weightClass: '242',
          place: 4,
          points: 2,
        }),
      ]
  
      const result =
        calculateTeamScore(
          lifters,
          rules
        )
  
      expect(result.totalPoints).toBe(15)
  
      expect(result.scoringLifterIds).toEqual([
        1,
        2,
        3,
      ])
    })
  
  })