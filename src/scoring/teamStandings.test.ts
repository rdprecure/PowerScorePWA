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

import {
  TEXAS_TEAM_STANDINGS,
} from '../rules/texas'

describe('PowerScore team standings', () => {

  test('team with more points ranks higher', () => {

    const teams:
      TeamStandingCandidate[] = [
        {
          id: 1,
          totalPoints: 20,
          placeCounts: [
            1,
            0,
            0,
            0,
            0,
          ],
          allOtherPlaceCount: 0,
          averageCoefficientTotal: 500,
        },
        {
          id: 2,
          totalPoints: 18,
          placeCounts: [
            3,
            0,
            0,
            0,
            0,
          ],
          allOtherPlaceCount: 0,
          averageCoefficientTotal: 900,
        },
      ]

    const results =
      rankTeamStandings(
        teams,
        TEXAS_TEAM_STANDINGS
      )

    expect(
      results.find(
        result =>
          result.id === 1
      )?.place
    ).toBe(1)

    expect(
      results.find(
        result =>
          result.id === 2
      )?.place
    ).toBe(2)
  })

  test('first-place count breaks equal team points', () => {

    const teams:
      TeamStandingCandidate[] = [
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
          averageCoefficientTotal: 500,
        },
        {
          id: 2,
          totalPoints: 20,
          placeCounts: [
            1,
            4,
            0,
            0,
            0,
          ],
          allOtherPlaceCount: 0,
          averageCoefficientTotal: 900,
        },
      ]

    const results =
      rankTeamStandings(
        teams,
        TEXAS_TEAM_STANDINGS
      )

    expect(
      results.find(
        result =>
          result.id === 1
      )?.place
    ).toBe(1)

    expect(
      results.find(
        result =>
          result.id === 2
      )?.place
    ).toBe(2)
  })

  test('second-place count breaks tie when first-place counts are equal', () => {

    const teams:
      TeamStandingCandidate[] = [
        {
          id: 1,
          totalPoints: 20,
          placeCounts: [
            1,
            3,
            0,
            0,
            0,
          ],
          allOtherPlaceCount: 0,
          averageCoefficientTotal: 500,
        },
        {
          id: 2,
          totalPoints: 20,
          placeCounts: [
            1,
            2,
            5,
            0,
            0,
          ],
          allOtherPlaceCount: 0,
          averageCoefficientTotal: 900,
        },
      ]

    const results =
      rankTeamStandings(
        teams,
        TEXAS_TEAM_STANDINGS
      )

    expect(
      results.find(
        result =>
          result.id === 1
      )?.place
    ).toBe(1)

    expect(
      results.find(
        result =>
          result.id === 2
      )?.place
    ).toBe(2)
  })

  test('later place counts are compared in order', () => {

    const teams:
      TeamStandingCandidate[] = [
        {
          id: 1,
          totalPoints: 20,
          placeCounts: [
            1,
            2,
            3,
            1,
            0,
          ],
          allOtherPlaceCount: 0,
          averageCoefficientTotal: 500,
        },
        {
          id: 2,
          totalPoints: 20,
          placeCounts: [
            1,
            2,
            3,
            0,
            10,
          ],
          allOtherPlaceCount: 0,
          averageCoefficientTotal: 900,
        },
      ]

    const results =
      rankTeamStandings(
        teams,
        TEXAS_TEAM_STANDINGS
      )

    expect(
      results.find(
        result =>
          result.id === 1
      )?.place
    ).toBe(1)

    expect(
      results.find(
        result =>
          result.id === 2
      )?.place
    ).toBe(2)
  })

  test('all-other-place count is compared after configured place counts', () => {

    const teams:
      TeamStandingCandidate[] = [
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
          allOtherPlaceCount: 3,
          averageCoefficientTotal: 500,
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
          allOtherPlaceCount: 2,
          averageCoefficientTotal: 900,
        },
      ]

    const results =
      rankTeamStandings(
        teams,
        TEXAS_TEAM_STANDINGS
      )

    expect(
      results.find(
        result =>
          result.id === 1
      )?.place
    ).toBe(1)

    expect(
      results.find(
        result =>
          result.id === 2
      )?.place
    ).toBe(2)
  })

  test('average coefficient total is final tiebreaker', () => {

    const teams:
      TeamStandingCandidate[] = [
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
          allOtherPlaceCount: 2,
          averageCoefficientTotal: 650,
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
          allOtherPlaceCount: 2,
          averageCoefficientTotal: 700,
        },
      ]

    const results =
      rankTeamStandings(
        teams,
        TEXAS_TEAM_STANDINGS
      )

    expect(
      results.find(
        result =>
          result.id === 2
      )?.place
    ).toBe(1)

    expect(
      results.find(
        result =>
          result.id === 1
      )?.place
    ).toBe(2)
  })

  test('teams remain tied when all tiebreakers are equal', () => {

    const teams:
      TeamStandingCandidate[] = [
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
          allOtherPlaceCount: 2,
          averageCoefficientTotal: 650,
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
          allOtherPlaceCount: 2,
          averageCoefficientTotal: 650,
        },
      ]

    const results =
      rankTeamStandings(
        teams,
        TEXAS_TEAM_STANDINGS
      )

    expect(
      results.find(
        result =>
          result.id === 1
      )?.place
    ).toBe(1)

    expect(
      results.find(
        result =>
          result.id === 2
      )?.place
    ).toBe(1)

    expect(
      results.find(
        result =>
          result.id === 1
      )?.tied
    ).toBe(true)

    expect(
      results.find(
        result =>
          result.id === 2
      )?.tied
    ).toBe(true)
  })

  test('competition ranking skips place after tied teams', () => {

    const teams:
      TeamStandingCandidate[] = [
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
          allOtherPlaceCount: 2,
          averageCoefficientTotal: 650,
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
          allOtherPlaceCount: 2,
          averageCoefficientTotal: 650,
        },
        {
          id: 3,
          totalPoints: 18,
          placeCounts: [
            3,
            0,
            0,
            0,
            0,
          ],
          allOtherPlaceCount: 0,
          averageCoefficientTotal: 900,
        },
      ]

    const results =
      rankTeamStandings(
        teams,
        TEXAS_TEAM_STANDINGS
      )

    expect(
      results.find(
        result =>
          result.id === 1
      )?.place
    ).toBe(1)

    expect(
      results.find(
        result =>
          result.id === 2
      )?.place
    ).toBe(1)

    expect(
      results.find(
        result =>
          result.id === 3
      )?.place
    ).toBe(3)
  })

  test('coefficient total does not break tie when rule disables it', () => {

    const rules:
      TeamStandingRules = {
        useAllOtherPlacesTieBreaker:
          true,
        useAverageCoefficientTieBreaker:
          false,
      }

    const teams:
      TeamStandingCandidate[] = [
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
          allOtherPlaceCount: 2,
          averageCoefficientTotal: 600,
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
          allOtherPlaceCount: 2,
          averageCoefficientTotal: 700,
        },
      ]

    const results =
      rankTeamStandings(
        teams,
        rules
      )

    expect(
      results.find(
        result =>
          result.id === 1
      )?.place
    ).toBe(1)

    expect(
      results.find(
        result =>
          result.id === 2
      )?.place
    ).toBe(1)

    expect(
      results.find(
        result =>
          result.id === 1
      )?.tied
    ).toBe(true)

    expect(
      results.find(
        result =>
          result.id === 2
      )?.tied
    ).toBe(true)
  })

  test('team with zero points is unplaced', () => {

    const teams:
      TeamStandingCandidate[] = [
        {
          id: 1,
          totalPoints: 20,
          placeCounts: [
            1,
            0,
            0,
            0,
            0,
          ],
          allOtherPlaceCount: 0,
          averageCoefficientTotal: 600,
        },
        {
          id: 2,
          totalPoints: 0,
          placeCounts: [
            0,
            0,
            0,
            0,
            0,
          ],
          allOtherPlaceCount: 0,
          averageCoefficientTotal: 900,
        },
      ]

    const results =
      rankTeamStandings(
        teams,
        TEXAS_TEAM_STANDINGS
      )

    expect(
      results.find(
        result =>
          result.id === 1
      )?.place
    ).toBe(1)

    expect(
      results.find(
        result =>
          result.id === 2
      )?.place
    ).toBeNull()
  })

})