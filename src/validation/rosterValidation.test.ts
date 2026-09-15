import {
    describe,
    expect,
    test,
  } from 'vitest'
  
  import {
    validateRoster,
  } from './rosterValidation'
  
  import type {
    RosterValidationCandidate,
  } from './rosterValidation'
  
  import {
    THSPA_RULES,
  } from '../rules/thspa'
  
  function makeLifter(
    overrides:
      Partial<RosterValidationCandidate>
  ): RosterValidationCandidate {
  
    return {
      id: 1,
      teamId: 10,
      bodyWeight: 180,
      status: 'active',
      isGuest: false,
      isExtraLifter: false,
      ...overrides,
    }
  }
  
  describe('Texas roster validation', () => {
  
    test('valid roster produces no issues', () => {
      const lifters = [
        makeLifter({
          id: 1,
          bodyWeight: 160,
        }),
        makeLifter({
          id: 2,
          bodyWeight: 175,
        }),
        makeLifter({
          id: 3,
          bodyWeight: 190,
        }),
      ]
  
      expect(
        validateRoster(
          lifters,
          THSPA_RULES
        )
      ).toEqual([])
    })
  
    test('more than twelve team competitors is an error', () => {
      const lifters:
        RosterValidationCandidate[] = []
  
      for (
        let index = 0;
        index < 13;
        index++
      ) {
        lifters.push(
          makeLifter({
            id: index + 1,
  
            /*
             * Spread lifters among classes
             * so this test isolates the
             * overall roster limit.
             */
            bodyWeight:
              110 + index * 10,
          })
        )
      }
  
      const issues =
        validateRoster(
          lifters,
          THSPA_RULES
        )
  
      const issue =
        issues.find(
          (item) =>
            item.code ===
            'TEAM_ROSTER_LIMIT_EXCEEDED'
        )
  
      expect(issue).toBeDefined()
      expect(issue?.teamId).toBe(10)
    })
  
    test('twelve team competitors is allowed', () => {
      const lifters:
        RosterValidationCandidate[] = []
  
      /*
       * Four weight classes,
       * three lifters in each.
       */
      const weights = [
        110, 111, 112,
        120, 121, 122,
        130, 131, 132,
        140, 141, 142,
      ]
  
      weights.forEach(
        (bodyWeight, index) => {
  
          lifters.push(
            makeLifter({
              id: index + 1,
              bodyWeight,
            })
          )
        }
      )
  
      const issues =
        validateRoster(
          lifters,
          THSPA_RULES
        )
  
      expect(
        issues.some(
          (issue) =>
            issue.code ===
            'TEAM_ROSTER_LIMIT_EXCEEDED'
        )
      ).toBe(false)
    })
  
    test('more than three team competitors in one weight class is an error', () => {
      const lifters = [
        makeLifter({
          id: 1,
          bodyWeight: 175,
        }),
        makeLifter({
          id: 2,
          bodyWeight: 176,
        }),
        makeLifter({
          id: 3,
          bodyWeight: 177,
        }),
        makeLifter({
          id: 4,
          bodyWeight: 178,
        }),
      ]
  
      const issues =
        validateRoster(
          lifters,
          THSPA_RULES
        )
  
      const issue =
        issues.find(
          (item) =>
            item.code ===
            'WEIGHT_CLASS_LIMIT_EXCEEDED'
        )
  
      expect(issue).toBeDefined()
      expect(issue?.teamId).toBe(10)
      expect(issue?.weightClass)
        .toBe('181')
    })
  
    test('three team competitors in one weight class is allowed', () => {
      const lifters = [
        makeLifter({
          id: 1,
          bodyWeight: 175,
        }),
        makeLifter({
          id: 2,
          bodyWeight: 176,
        }),
        makeLifter({
          id: 3,
          bodyWeight: 177,
        }),
      ]
  
      const issues =
        validateRoster(
          lifters,
          THSPA_RULES
        )
  
      expect(
        issues.some(
          (issue) =>
            issue.code ===
            'WEIGHT_CLASS_LIMIT_EXCEEDED'
        )
      ).toBe(false)
    })
  
    test('extra lifter does not count toward team roster limit', () => {
      const lifters:
        RosterValidationCandidate[] = []
  
      for (
        let index = 0;
        index < 12;
        index++
      ) {
        lifters.push(
          makeLifter({
            id: index + 1,
            bodyWeight:
              110 + index * 10,
          })
        )
      }
  
      lifters.push(
        makeLifter({
          id: 13,
          bodyWeight: 300,
          isExtraLifter: true,
        })
      )
  
      const issues =
        validateRoster(
          lifters,
          THSPA_RULES
        )
  
      expect(
        issues.some(
          (issue) =>
            issue.code ===
            'TEAM_ROSTER_LIMIT_EXCEEDED'
        )
      ).toBe(false)
    })
  
    test('extra lifter does not count toward weight-class limit', () => {
      const lifters = [
        makeLifter({
          id: 1,
          bodyWeight: 175,
        }),
        makeLifter({
          id: 2,
          bodyWeight: 176,
        }),
        makeLifter({
          id: 3,
          bodyWeight: 177,
        }),
        makeLifter({
          id: 4,
          bodyWeight: 178,
          isExtraLifter: true,
        }),
      ]
  
      const issues =
        validateRoster(
          lifters,
          THSPA_RULES
        )
  
      expect(
        issues.some(
          (issue) =>
            issue.code ===
            'WEIGHT_CLASS_LIMIT_EXCEEDED'
        )
      ).toBe(false)
    })
  
    test('guest does not count toward team limits', () => {
      const lifters = [
        makeLifter({
          id: 1,
          bodyWeight: 175,
        }),
        makeLifter({
          id: 2,
          bodyWeight: 176,
        }),
        makeLifter({
          id: 3,
          bodyWeight: 177,
        }),
        makeLifter({
          id: 4,
          bodyWeight: 178,
          isGuest: true,
        }),
      ]
  
      const issues =
        validateRoster(
          lifters,
          THSPA_RULES
        )
  
      expect(
        issues.some(
          (issue) =>
            issue.code ===
            'WEIGHT_CLASS_LIMIT_EXCEEDED'
        )
      ).toBe(false)
    })
  
    test('scratched lifter does not count toward team limits', () => {
      const lifters = [
        makeLifter({
          id: 1,
          bodyWeight: 175,
        }),
        makeLifter({
          id: 2,
          bodyWeight: 176,
        }),
        makeLifter({
          id: 3,
          bodyWeight: 177,
        }),
        makeLifter({
          id: 4,
          bodyWeight: 178,
          status: 'scratched',
        }),
      ]
  
      const issues =
        validateRoster(
          lifters,
          THSPA_RULES
        )
  
      expect(
        issues.some(
          (issue) =>
            issue.code ===
            'WEIGHT_CLASS_LIMIT_EXCEEDED'
        )
      ).toBe(false)
    })
  
    test('disqualified lifter does not count toward team limits', () => {
      const lifters = [
        makeLifter({
          id: 1,
          bodyWeight: 175,
        }),
        makeLifter({
          id: 2,
          bodyWeight: 176,
        }),
        makeLifter({
          id: 3,
          bodyWeight: 177,
        }),
        makeLifter({
          id: 4,
          bodyWeight: 178,
          status: 'disqualified',
        }),
      ]
  
      const issues =
        validateRoster(
          lifters,
          THSPA_RULES
        )
  
      expect(
        issues.some(
          (issue) =>
            issue.code ===
            'WEIGHT_CLASS_LIMIT_EXCEEDED'
        )
      ).toBe(false)
    })
  
    test('bombed lifter still counts toward team roster', () => {
      const lifters = [
        makeLifter({
          id: 1,
          bodyWeight: 175,
        }),
        makeLifter({
          id: 2,
          bodyWeight: 176,
        }),
        makeLifter({
          id: 3,
          bodyWeight: 177,
        }),
        makeLifter({
          id: 4,
          bodyWeight: 178,
          status: 'bombed',
        }),
      ]
  
      const issues =
        validateRoster(
          lifters,
          THSPA_RULES
        )
  
      expect(
        issues.some(
          (issue) =>
            issue.code ===
            'WEIGHT_CLASS_LIMIT_EXCEEDED'
        )
      ).toBe(true)
    })
  
    test('missing bodyweight produces warning', () => {
      const lifters = [
        makeLifter({
          id: 1,
          bodyWeight: null,
        }),
      ]
  
      const issues =
        validateRoster(
          lifters,
          THSPA_RULES
        )
  
      expect(issues).toEqual([
        {
          code: 'BODY_WEIGHT_MISSING',
          severity: 'warning',
          lifterId: 1,
          teamId: 10,
          message:
            'Lifter does not have a bodyweight.',
        },
      ])
    })
  
    test('zero bodyweight produces error', () => {
      const issues =
        validateRoster(
          [
            makeLifter({
              id: 1,
              bodyWeight: 0,
            }),
          ],
          THSPA_RULES
        )
  
      expect(issues[0].code)
        .toBe('BODY_WEIGHT_INVALID')
  
      expect(issues[0].severity)
        .toBe('error')
    })
  
    test('negative bodyweight produces error', () => {
      const issues =
        validateRoster(
          [
            makeLifter({
              id: 1,
              bodyWeight: -10,
            }),
          ],
          THSPA_RULES
        )
  
      expect(issues[0].code)
        .toBe('BODY_WEIGHT_INVALID')
    })
  
    test('teams are validated independently', () => {
      const lifters = [
        makeLifter({
          id: 1,
          teamId: 10,
          bodyWeight: 175,
        }),
        makeLifter({
          id: 2,
          teamId: 10,
          bodyWeight: 176,
        }),
        makeLifter({
          id: 3,
          teamId: 10,
          bodyWeight: 177,
        }),
        makeLifter({
          id: 4,
          teamId: 20,
          bodyWeight: 175,
        }),
        makeLifter({
          id: 5,
          teamId: 20,
          bodyWeight: 176,
        }),
        makeLifter({
          id: 6,
          teamId: 20,
          bodyWeight: 177,
        }),
      ]
  
      expect(
        validateRoster(
          lifters,
          THSPA_RULES
        )
      ).toEqual([])
    })
  
  })