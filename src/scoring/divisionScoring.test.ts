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
  
  describe('Texas division scoring', () => {
  
    test('assigns weight classes', () => {
      const lifters = [
        makeLifter({
          id: 1,
          bodyWeight: 164,
        }),
        makeLifter({
          id: 2,
          bodyWeight: 180,
        }),
        makeLifter({
          id: 3,
          bodyWeight: 200,
        }),
      ]
  
      const results =
        scoreTexasDivision(
          lifters,
          THSPA_RULES
        )
  
      expect(
        results.find(
          (result) => result.id === 1
        )?.weightClass
      ).toBe('165')
  
      expect(
        results.find(
          (result) => result.id === 2
        )?.weightClass
      ).toBe('181')
  
      expect(
        results.find(
          (result) => result.id === 3
        )?.weightClass
      ).toBe('220')
    })
  
    test('scores each weight class independently', () => {
      const lifters = [
        makeLifter({
          id: 1,
          bodyWeight: 160,
          total: 1000,
        }),
        makeLifter({
          id: 2,
          bodyWeight: 164,
          total: 900,
        }),
        makeLifter({
          id: 3,
          bodyWeight: 175,
          total: 1200,
        }),
        makeLifter({
          id: 4,
          bodyWeight: 180,
          total: 1100,
        }),
      ]
  
      const results =
        scoreTexasDivision(
          lifters,
          THSPA_RULES
        )
  
      const lifter1 =
        results.find(
          (result) => result.id === 1
        )!
  
      const lifter2 =
        results.find(
          (result) => result.id === 2
        )!
  
      const lifter3 =
        results.find(
          (result) => result.id === 3
        )!
  
      const lifter4 =
        results.find(
          (result) => result.id === 4
        )!
  
      expect(lifter1.weightClass)
        .toBe('165')
  
      expect(lifter1.place)
        .toBe(1)
  
      expect(lifter1.points)
        .toBe(7)
  
      expect(lifter2.place)
        .toBe(2)
  
      expect(lifter2.points)
        .toBe(5)
  
      expect(lifter3.weightClass)
        .toBe('181')
  
      expect(lifter3.place)
        .toBe(1)
  
      expect(lifter3.points)
        .toBe(7)
  
      expect(lifter4.place)
        .toBe(2)
  
      expect(lifter4.points)
        .toBe(5)
    })
  
    test('guest does not affect class placing', () => {
      const lifters = [
        makeLifter({
          id: 1,
          bodyWeight: 180,
          total: 1200,
          isGuest: true,
        }),
        makeLifter({
          id: 2,
          bodyWeight: 180,
          total: 1100,
        }),
        makeLifter({
          id: 3,
          bodyWeight: 180,
          total: 1000,
        }),
      ]
  
      const results =
        scoreTexasDivision(
          lifters,
          THSPA_RULES
        )
  
      const guest =
        results.find(
          (result) => result.id === 1
        )!
  
      const first =
        results.find(
          (result) => result.id === 2
        )!
  
      const second =
        results.find(
          (result) => result.id === 3
        )!
  
      expect(guest.place).toBeNull()
      expect(guest.points).toBe(0)
  
      expect(first.place).toBe(1)
      expect(first.points).toBe(7)
  
      expect(second.place).toBe(2)
      expect(second.points).toBe(5)
    })
  
    test('bombed lifter does not affect class placing', () => {
      const lifters = [
        makeLifter({
          id: 1,
          bodyWeight: 180,
          total: 1200,
          status: 'bombed',
        }),
        makeLifter({
          id: 2,
          bodyWeight: 180,
          total: 1100,
        }),
      ]
  
      const results =
        scoreTexasDivision(
          lifters,
          THSPA_RULES
        )
  
      const bombed =
        results.find(
          (result) => result.id === 1
        )!
  
      const active =
        results.find(
          (result) => result.id === 2
        )!
  
      expect(bombed.place).toBeNull()
      expect(bombed.points).toBe(0)
  
      expect(active.place).toBe(1)
      expect(active.points).toBe(7)
    })
  
    test('extra lifter can place individually', () => {
      const lifters = [
        makeLifter({
          id: 1,
          bodyWeight: 180,
          total: 1200,
          isExtraLifter: true,
        }),
        makeLifter({
          id: 2,
          bodyWeight: 180,
          total: 1100,
        }),
      ]
  
      const results =
        scoreTexasDivision(
          lifters,
          THSPA_RULES
        )
  
      const extra =
        results.find(
          (result) => result.id === 1
        )!
  
      const regular =
        results.find(
          (result) => result.id === 2
        )!
  
      expect(extra.place).toBe(1)
      expect(extra.points).toBe(7)
  
      expect(regular.place).toBe(2)
      expect(regular.points).toBe(5)
    })
  
    test('true tie is handled within its weight class', () => {
      const lifters = [
        makeLifter({
          id: 1,
          bodyWeight: 180,
          total: 1100,
          tieGroup: '181-tie',
        }),
        makeLifter({
          id: 2,
          bodyWeight: 180,
          total: 1100,
          tieGroup: '181-tie',
        }),
        makeLifter({
          id: 3,
          bodyWeight: 180,
          total: 1000,
        }),
        makeLifter({
          id: 4,
          bodyWeight: 160,
          total: 900,
        }),
      ]
  
      const results =
        scoreTexasDivision(
          lifters,
          THSPA_RULES
        )
  
      const first =
        results.find(
          (result) => result.id === 1
        )!
  
      const second =
        results.find(
          (result) => result.id === 2
        )!
  
      const third =
        results.find(
          (result) => result.id === 3
        )!
  
      const otherClass =
        results.find(
          (result) => result.id === 4
        )!
  
      expect(first.place).toBe(1)
      expect(first.tied).toBe(true)
      expect(first.points).toBe(6)
  
      expect(second.place).toBe(1)
      expect(second.tied).toBe(true)
      expect(second.points).toBe(6)
  
      expect(third.place).toBe(3)
      expect(third.points).toBe(3)
  
      expect(otherClass.place).toBe(1)
      expect(otherClass.points).toBe(7)
    })
  
    test('team membership does not affect individual placing', () => {
      const lifters = [
        makeLifter({
          id: 1,
          teamId: 10,
          bodyWeight: 180,
          total: 1100,
        }),
        makeLifter({
          id: 2,
          teamId: 10,
          bodyWeight: 180,
          total: 1000,
        }),
        makeLifter({
          id: 3,
          teamId: 20,
          bodyWeight: 180,
          total: 1050,
        }),
      ]
  
      const results =
        scoreTexasDivision(
          lifters,
          THSPA_RULES
        )
  
      expect(
        results.find(
          (result) => result.id === 1
        )?.place
      ).toBe(1)
  
      expect(
        results.find(
          (result) => result.id === 3
        )?.place
      ).toBe(2)
  
      expect(
        results.find(
          (result) => result.id === 2
        )?.place
      ).toBe(3)
    })
  
    test('does not modify original lifter records', () => {
      const lifters = [
        makeLifter({
          id: 1,
          bodyWeight: 180,
          total: 1100,
        }),
        makeLifter({
          id: 2,
          bodyWeight: 175,
          total: 1000,
        }),
      ]
  
      const original =
        JSON.parse(
          JSON.stringify(lifters)
        )
  
      scoreTexasDivision(
        lifters,
        THSPA_RULES
      )
  
      expect(lifters).toEqual(original)
    })
  
  })