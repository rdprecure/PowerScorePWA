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
        ).toEqual([])
      })
  
      test('NMAA girls can use the generic pipeline', () => {
  
        const lifters:
          DivisionScoringCandidate[] = [
            {
              id: 1,
              teamId: 10,
              bodyWeight: 250,
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
        ).toEqual([])
      })
  
      test('NMAA uses a maximum of two scoring lifters per weight class', () => {
  
        const lifters:
          DivisionScoringCandidate[] = [
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
              total: 900,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
            {
              id: 3,
              teamId: 10,
              bodyWeight: 112,
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
              total: 1100,
              status: 'active',
              isGuest: false,
              isExtraLifter: true,
            },
            {
              id: 2,
              teamId: 10,
              bodyWeight: 111,
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
  
      test('NMAA does not produce Best Lifter placements while configuration is disabled', () => {
  
        const lifters:
          DivisionScoringCandidate[] = [
            {
              id: 1,
              teamId: 10,
              bodyWeight: 110,
              total: 1200,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
            {
              id: 2,
              teamId: 20,
              bodyWeight: 200,
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
        ).toEqual([])
      })
  
      test('generic pipeline produces team standings for NMAA', () => {
  
        const lifters:
          DivisionScoringCandidate[] = [
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
              bodyWeight: 110,
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