import {
    describe,
    expect,
    test,
  } from 'vitest'
  
  import type {
    ScoredDivisionLifter,
  } from './divisionScoring'
  
  import type {
    DivisionTeamScore,
  } from './divisionTeamScoring'
  
  import {
    buildTeamStandingCandidates,
  } from './teamStandingCandidates'
  
  function createLifter(
    id: number,
    teamId: number | null,
    place: number | null
  ): ScoredDivisionLifter {
  
    return {
      id,
      teamId,
      bodyWeight: 180,
      total: 1000,
      status: 'active',
      isGuest: false,
      isExtraLifter: false,
      weightClass: '181',
      place,
      tied: false,
      tieCount: 1,
      points: 0,
    }
  }
  
  describe('PowerScore team standing candidates', () => {
  
    test('builds team standing candidate from team score', () => {
  
      const lifters = [
        createLifter(
          1,
          10,
          1
        ),
      ]
  
      const teamScores:
        DivisionTeamScore[] = [
          {
            teamId: 10,
            totalPoints: 7,
            scoringLifterIds: [
              1,
            ],
            averageCoefficientTotal:
              623.8,
          },
        ]
  
      const results =
        buildTeamStandingCandidates(
          lifters,
          teamScores
        )
  
      expect(
        results
      ).toEqual([
        {
          id: 10,
          totalPoints: 7,
          placeCounts: [
            1,
            0,
            0,
            0,
            0,
          ],
          allOtherPlaceCount: 0,
          averageCoefficientTotal:
            623.8,
        },
      ])
    })
  
    test('counts first through fifth places separately', () => {
  
      const lifters = [
        createLifter(
          1,
          10,
          1
        ),
        createLifter(
          2,
          10,
          2
        ),
        createLifter(
          3,
          10,
          3
        ),
        createLifter(
          4,
          10,
          4
        ),
        createLifter(
          5,
          10,
          5
        ),
      ]
  
      const teamScores:
        DivisionTeamScore[] = [
          {
            teamId: 10,
            totalPoints: 18,
            scoringLifterIds: [
              1,
              2,
              3,
              4,
              5,
            ],
            averageCoefficientTotal:
              600,
          },
        ]
  
      const results =
        buildTeamStandingCandidates(
          lifters,
          teamScores
        )
  
      expect(
        results[0].placeCounts
      ).toEqual([
        1,
        1,
        1,
        1,
        1,
      ])
  
      expect(
        results[0]
          .allOtherPlaceCount
      ).toBe(0)
    })
  
    test('counts multiple lifters at the same place', () => {
  
      const lifters = [
        createLifter(
          1,
          10,
          1
        ),
        createLifter(
          2,
          10,
          1
        ),
        createLifter(
          3,
          10,
          3
        ),
      ]
  
      const teamScores:
        DivisionTeamScore[] = [
          {
            teamId: 10,
            totalPoints: 15,
            scoringLifterIds: [
              1,
              2,
              3,
            ],
            averageCoefficientTotal:
              600,
          },
        ]
  
      const results =
        buildTeamStandingCandidates(
          lifters,
          teamScores
        )
  
      expect(
        results[0].placeCounts
      ).toEqual([
        2,
        0,
        1,
        0,
        0,
      ])
    })
  
    test('counts places beyond fifth as all other places', () => {
  
      const lifters = [
        createLifter(
          1,
          10,
          1
        ),
        createLifter(
          2,
          10,
          6
        ),
        createLifter(
          3,
          10,
          8
        ),
      ]
  
      const teamScores:
        DivisionTeamScore[] = [
          {
            teamId: 10,
            totalPoints: 7,
            scoringLifterIds: [
              1,
              2,
              3,
            ],
            averageCoefficientTotal:
              600,
          },
        ]
  
      const results =
        buildTeamStandingCandidates(
          lifters,
          teamScores
        )
  
      expect(
        results[0].placeCounts
      ).toEqual([
        1,
        0,
        0,
        0,
        0,
      ])
  
      expect(
        results[0]
          .allOtherPlaceCount
      ).toBe(2)
    })
  
    test('does not count non-scoring lifters', () => {
  
      const lifters = [
        createLifter(
          1,
          10,
          1
        ),
        createLifter(
          2,
          10,
          2
        ),
      ]
  
      const teamScores:
        DivisionTeamScore[] = [
          {
            teamId: 10,
            totalPoints: 7,
            scoringLifterIds: [
              1,
            ],
            averageCoefficientTotal:
              600,
          },
        ]
  
      const results =
        buildTeamStandingCandidates(
          lifters,
          teamScores
        )
  
      expect(
        results[0].placeCounts
      ).toEqual([
        1,
        0,
        0,
        0,
        0,
      ])
    })
  
    test('does not count lifter assigned to another team', () => {
  
      const lifters = [
        createLifter(
          1,
          10,
          1
        ),
        createLifter(
          2,
          20,
          2
        ),
      ]
  
      const teamScores:
        DivisionTeamScore[] = [
          {
            teamId: 10,
            totalPoints: 7,
            scoringLifterIds: [
              1,
              2,
            ],
            averageCoefficientTotal:
              600,
          },
        ]
  
      const results =
        buildTeamStandingCandidates(
          lifters,
          teamScores
        )
  
      expect(
        results[0].placeCounts
      ).toEqual([
        1,
        0,
        0,
        0,
        0,
      ])
    })
  
    test('ignores null place', () => {
  
      const lifters = [
        createLifter(
          1,
          10,
          null
        ),
      ]
  
      const teamScores:
        DivisionTeamScore[] = [
          {
            teamId: 10,
            totalPoints: 0,
            scoringLifterIds: [
              1,
            ],
            averageCoefficientTotal:
              0,
          },
        ]
  
      const results =
        buildTeamStandingCandidates(
          lifters,
          teamScores
        )
  
      expect(
        results[0].placeCounts
      ).toEqual([
        0,
        0,
        0,
        0,
        0,
      ])
  
      expect(
        results[0]
          .allOtherPlaceCount
      ).toBe(0)
    })
  
    test('supports a different number of tracked places', () => {
  
      const lifters = [
        createLifter(
          1,
          10,
          1
        ),
        createLifter(
          2,
          10,
          3
        ),
        createLifter(
          3,
          10,
          4
        ),
      ]
  
      const teamScores:
        DivisionTeamScore[] = [
          {
            teamId: 10,
            totalPoints: 10,
            scoringLifterIds: [
              1,
              2,
              3,
            ],
            averageCoefficientTotal:
              600,
          },
        ]
  
      const results =
        buildTeamStandingCandidates(
          lifters,
          teamScores,
          3
        )
  
      expect(
        results[0].placeCounts
      ).toEqual([
        1,
        0,
        1,
      ])
  
      expect(
        results[0]
          .allOtherPlaceCount
      ).toBe(1)
    })
  
  })