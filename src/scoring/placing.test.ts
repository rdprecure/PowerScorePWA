import {
    describe,
    expect,
    test,
  } from 'vitest'
  
  import {
    rankTexasByTotal,
  } from './placing'
  
  import type {
    PlacementCandidate,
  } from './placing'
  
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
  
  describe('Texas individual placing', () => {
  
    test('higher total places first', () => {
      const results =
        rankTexasByTotal([
          makeLifter({
            id: 1,
            total: 1000,
          }),
          makeLifter({
            id: 2,
            total: 1100,
          }),
        ])
  
      expect(results).toEqual([
        {
          id: 2,
          place: 1,
          tied: false,
          tieCount: 1,
        },
        {
          id: 1,
          place: 2,
          tied: false,
          tieCount: 1,
        },
      ])
    })
  
    test('lighter lifter wins equal-total comparison', () => {
      const results =
        rankTexasByTotal([
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
        ])
  
      expect(results[0].id).toBe(2)
      expect(results[0].place).toBe(1)
  
      expect(results[1].id).toBe(1)
      expect(results[1].place).toBe(2)
    })
  
    test('equal total and bodyweight are not automatically tied', () => {
      const results =
        rankTexasByTotal([
          makeLifter({
            id: 1,
            total: 1000,
            bodyWeight: 180,
          }),
          makeLifter({
            id: 2,
            total: 1000,
            bodyWeight: 180,
          }),
        ])
  
      expect(results[0].place).toBe(1)
      expect(results[0].tied).toBe(false)
  
      expect(results[1].place).toBe(2)
      expect(results[1].tied).toBe(false)
    })
  
    test('official true tie shares placing', () => {
      const results =
        rankTexasByTotal([
          makeLifter({
            id: 1,
            total: 1000,
            bodyWeight: 180,
            tieGroup: 'tie-1',
          }),
          makeLifter({
            id: 2,
            total: 1000,
            bodyWeight: 180,
            tieGroup: 'tie-1',
          }),
          makeLifter({
            id: 3,
            total: 950,
            bodyWeight: 175,
          }),
        ])
  
      expect(results).toEqual([
        {
          id: 1,
          place: 1,
          tied: true,
          tieCount: 2,
        },
        {
          id: 2,
          place: 1,
          tied: true,
          tieCount: 2,
        },
        {
          id: 3,
          place: 3,
          tied: false,
          tieCount: 1,
        },
      ])
    })
  
    test('three-way true tie occupies three places', () => {
      const results =
        rankTexasByTotal([
          makeLifter({
            id: 1,
            total: 1000,
            bodyWeight: 180,
            tieGroup: 'tie-1',
          }),
          makeLifter({
            id: 2,
            total: 1000,
            bodyWeight: 180,
            tieGroup: 'tie-1',
          }),
          makeLifter({
            id: 3,
            total: 1000,
            bodyWeight: 180,
            tieGroup: 'tie-1',
          }),
          makeLifter({
            id: 4,
            total: 950,
          }),
        ])
  
      expect(results[0].place).toBe(1)
      expect(results[1].place).toBe(1)
      expect(results[2].place).toBe(1)
  
      expect(results[0].tieCount).toBe(3)
      expect(results[1].tieCount).toBe(3)
      expect(results[2].tieCount).toBe(3)
  
      expect(results[3].place).toBe(4)
    })
  
    test('bombed lifter receives no place', () => {
      const results =
        rankTexasByTotal([
          makeLifter({
            id: 1,
            status: 'bombed',
          }),
        ])
  
      expect(results[0]).toEqual({
        id: 1,
        place: null,
        tied: false,
        tieCount: 1,
      })
    })
  
    test('guest lifter receives no place', () => {
      const results =
        rankTexasByTotal([
          makeLifter({
            id: 1,
            isGuest: true,
          }),
        ])
  
      expect(results[0]).toEqual({
        id: 1,
        place: null,
        tied: false,
        tieCount: 1,
      })
    })
  
    test('zero total receives no place', () => {
      const results =
        rankTexasByTotal([
          makeLifter({
            id: 1,
            total: 0,
          }),
        ])
  
      expect(results[0]).toEqual({
        id: 1,
        place: null,
        tied: false,
        tieCount: 1,
      })
    })
  
  })