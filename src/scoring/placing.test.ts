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
  
  describe('Texas PowerScore individual placing', () => {
  
    test('higher total places first', () => {
      const lifters: PlacementCandidate[] = [
        {
          id: 1,
          bodyWeight: 180,
          total: 1200,
          status: 'active',
          isGuest: false,
        },
        {
          id: 2,
          bodyWeight: 180,
          total: 1250,
          status: 'active',
          isGuest: false,
        },
      ]
  
      const results = rankTexasByTotal(lifters)
  
      expect(results).toEqual([
        { id: 2, place: 1 },
        { id: 1, place: 2 },
      ])
    })
  
    test('lighter lifter wins tie on total', () => {
      const lifters: PlacementCandidate[] = [
        {
          id: 1,
          bodyWeight: 181,
          total: 1200,
          status: 'active',
          isGuest: false,
        },
        {
          id: 2,
          bodyWeight: 179.5,
          total: 1200,
          status: 'active',
          isGuest: false,
        },
      ]
  
      const results = rankTexasByTotal(lifters)
  
      expect(results).toEqual([
        { id: 2, place: 1 },
        { id: 1, place: 2 },
      ])
    })
  
    test('bombed lifter receives no place', () => {
      const lifters: PlacementCandidate[] = [
        {
          id: 1,
          bodyWeight: 180,
          total: 0,
          status: 'bombed',
          isGuest: false,
        },
        {
          id: 2,
          bodyWeight: 181,
          total: 1100,
          status: 'active',
          isGuest: false,
        },
      ]
  
      const results = rankTexasByTotal(lifters)
  
      expect(results).toEqual([
        { id: 2, place: 1 },
        { id: 1, place: null },
      ])
    })
  
    test('guest lifter receives no place', () => {
      const lifters: PlacementCandidate[] = [
        {
          id: 1,
          bodyWeight: 175,
          total: 1300,
          status: 'active',
          isGuest: true,
        },
        {
          id: 2,
          bodyWeight: 180,
          total: 1200,
          status: 'active',
          isGuest: false,
        },
      ]
  
      const results = rankTexasByTotal(lifters)
  
      expect(results).toEqual([
        { id: 1, place: null },
        { id: 2, place: 1 },
      ])
    })
  
    test('zero total receives no place', () => {
      const lifters: PlacementCandidate[] = [
        {
          id: 1,
          bodyWeight: 175,
          total: 0,
          status: 'active',
          isGuest: false,
        },
        {
          id: 2,
          bodyWeight: 180,
          total: 1000,
          status: 'active',
          isGuest: false,
        },
      ]
  
      const results = rankTexasByTotal(lifters)
  
      expect(results).toEqual([
        { id: 2, place: 1 },
        { id: 1, place: null },
      ])
    })
  
  })