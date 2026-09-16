import {
    describe,
    expect,
    test,
  } from 'vitest'
  
  import {
    rankTeamStandings,
  } from './teamStandings'
  
  import {
    NMAA_TEAM_STANDINGS,
  } from '../rules/nmaa'
  
  describe(
    'NMAA team standings',
    () => {
  
      test('first-place count breaks a team points tie', () => {
  
        const results =
          rankTeamStandings(
            [
              {
                id: 1,
                totalPoints: 20,
                placeCounts: [
                  2,
                  0,
                  0,
                  0,
                  0,
                ],
                allOtherPlaceCount: 0,
              },
              {
                id: 2,
                totalPoints: 20,
                placeCounts: [
                  1,
                  3,
                  0,
                  0,
                  0,
                ],
                allOtherPlaceCount: 0,
              },
            ],
            NMAA_TEAM_STANDINGS
          )
  
        expect(
          results.find(
            team => team.id === 1
          )?.place
        ).toBe(1)
  
        expect(
          results.find(
            team => team.id === 2
          )?.place
        ).toBe(2)
      })
  
      test('later scoring places break ties when earlier place counts are equal', () => {
  
        const results =
          rankTeamStandings(
            [
              {
                id: 1,
                totalPoints: 20,
                placeCounts: [
                  1,
                  1,
                  1,
                  1,
                  2,
                ],
                allOtherPlaceCount: 0,
              },
              {
                id: 2,
                totalPoints: 20,
                placeCounts: [
                  1,
                  1,
                  1,
                  1,
                  1,
                ],
                allOtherPlaceCount: 0,
              },
            ],
            NMAA_TEAM_STANDINGS
          )
  
        expect(
          results.find(
            team => team.id === 1
          )?.place
        ).toBe(1)
  
        expect(
          results.find(
            team => team.id === 2
          )?.place
        ).toBe(2)
      })
  
      test('places below fifth do not break an NMAA team tie', () => {
  
        const results =
          rankTeamStandings(
            [
              {
                id: 1,
                totalPoints: 20,
                placeCounts: [
                  1,
                  1,
                  1,
                  1,
                  1,
                ],
                allOtherPlaceCount: 4,
              },
              {
                id: 2,
                totalPoints: 20,
                placeCounts: [
                  1,
                  1,
                  1,
                  1,
                  1,
                ],
                allOtherPlaceCount: 1,
              },
            ],
            NMAA_TEAM_STANDINGS
          )
  
        expect(
          results.find(
            team => team.id === 1
          )?.place
        ).toBe(1)
  
        expect(
          results.find(
            team => team.id === 2
          )?.place
        ).toBe(1)
  
        expect(
          results.every(
            team => team.tied
          )
        ).toBe(true)
      })
  
      test('coefficient total does not break an NMAA team tie', () => {
  
        const results =
          rankTeamStandings(
            [
              {
                id: 1,
                totalPoints: 20,
                placeCounts: [
                  1,
                  1,
                  1,
                  1,
                  1,
                ],
                allOtherPlaceCount: 0,
                averageCoefficientTotal:
                  1000,
              },
              {
                id: 2,
                totalPoints: 20,
                placeCounts: [
                  1,
                  1,
                  1,
                  1,
                  1,
                ],
                allOtherPlaceCount: 0,
                averageCoefficientTotal:
                  900,
              },
            ],
            NMAA_TEAM_STANDINGS
          )
  
        expect(
          results.find(
            team => team.id === 1
          )?.place
        ).toBe(1)
  
        expect(
          results.find(
            team => team.id === 2
          )?.place
        ).toBe(1)
  
        expect(
          results.every(
            team => team.tied
          )
        ).toBe(true)
      })
    }
  )