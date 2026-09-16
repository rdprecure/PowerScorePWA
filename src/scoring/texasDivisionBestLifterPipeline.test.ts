import {
    describe,
    expect,
    test,
  } from 'vitest'
  
  import type {
    DivisionScoringCandidate,
  } from './divisionScoring'
  
  import {
    scoreTexasMeetDivision,
  } from './texasDivisionPipeline'
  
  import {
    THSPA_RULES,
  } from '../rules/thspa'
  
  import {
    THSWPA_RULES,
  } from '../rules/thswpa'
  
  describe(
    'Texas division Best Lifter pipeline',
    () => {
  
      test('THSPA pipeline returns Best Lifter placements', () => {
  
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
            {
              id: 2,
              teamId: 20,
              bodyWeight: 160,
              total: 1100,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
          ]
  
        const result =
          scoreTexasMeetDivision(
            lifters,
            THSPA_RULES
          )
  
        expect(
          result.bestLifterPlacements.length
        ).toBe(2)
  
        expect(
          result.bestLifterPlacements.find(
            placement =>
              placement.id === 2
          )?.place
        ).toBe(1)
      })
  
      test('THSPA pipeline assigns lighter and heavier Best Lifter groups', () => {
  
        const lifters:
          DivisionScoringCandidate[] = [
            {
              id: 1,
              teamId: 10,
              bodyWeight: 160,
              total: 1000,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
            {
              id: 2,
              teamId: 20,
              bodyWeight: 180,
              total: 1200,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
          ]
  
        const result =
          scoreTexasMeetDivision(
            lifters,
            THSPA_RULES
          )
  
        expect(
          result.bestLifterPlacements.find(
            placement =>
              placement.id === 1
          )?.group
        ).toBe('114 to 165')
  
        expect(
          result.bestLifterPlacements.find(
            placement =>
              placement.id === 2
          )?.group
        ).toBe('181 to SHW')
  
        expect(
          result.bestLifterPlacements.find(
            placement =>
              placement.id === 1
          )?.place
        ).toBe(1)
  
        expect(
          result.bestLifterPlacements.find(
            placement =>
              placement.id === 2
          )?.place
        ).toBe(1)
      })
  
      test('THSPA pipeline uses Schwartz coefficient totals', () => {
  
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
          scoreTexasMeetDivision(
            lifters,
            THSPA_RULES
          )
  
        const bestLifter =
          result.bestLifterPlacements[0]
  
        expect(
          bestLifter.coefficient
        ).toBeCloseTo(
          0.7207,
          4
        )
  
        expect(
          bestLifter.coefficientTotal
        ).toBeCloseTo(
          720.7,
          1
        )
      })
  
      test('THSWPA pipeline uses Malone coefficient totals', () => {
  
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
          scoreTexasMeetDivision(
            lifters,
            THSWPA_RULES
          )
  
        const bestLifter =
          result.bestLifterPlacements[0]
  
        expect(
          bestLifter.group
        ).toBe('148 to 242+')
  
        expect(
          bestLifter.coefficient
        ).toBeCloseTo(
          0.7737,
          4
        )
  
        expect(
          bestLifter.coefficientTotal
        ).toBeCloseTo(
          773.7,
          1
        )
      })
  
      test('pipeline limits Best Lifter awards to configured places per group', () => {
  
        const lifters:
          DivisionScoringCandidate[] = [
            {
              id: 1,
              teamId: 10,
              bodyWeight: 150,
              total: 1200,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
            {
              id: 2,
              teamId: 20,
              bodyWeight: 150,
              total: 1100,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
            {
              id: 3,
              teamId: 30,
              bodyWeight: 150,
              total: 1000,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
            {
              id: 4,
              teamId: 40,
              bodyWeight: 150,
              total: 900,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
          ]
  
        const result =
          scoreTexasMeetDivision(
            lifters,
            THSPA_RULES
          )
  
        expect(
          THSPA_RULES
            .bestLifter
            .placesPerGroup
        ).toBe(3)
  
        expect(
          result.bestLifterPlacements.length
        ).toBe(3)
  
        expect(
          result.bestLifterPlacements.some(
            placement =>
              placement.id === 4
          )
        ).toBe(false)
      })
  
      test('guest lifter is excluded from pipeline Best Lifter awards', () => {
  
        const lifters:
          DivisionScoringCandidate[] = [
            {
              id: 1,
              teamId: 10,
              bodyWeight: 150,
              total: 1300,
              status: 'active',
              isGuest: true,
              isExtraLifter: false,
            },
            {
              id: 2,
              teamId: 20,
              bodyWeight: 150,
              total: 1000,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
          ]
  
        const result =
          scoreTexasMeetDivision(
            lifters,
            THSPA_RULES
          )
  
        expect(
          result.bestLifterPlacements.some(
            placement =>
              placement.id === 1
          )
        ).toBe(false)
  
        expect(
          result.bestLifterPlacements.find(
            placement =>
              placement.id === 2
          )?.place
        ).toBe(1)
      })
  
      test('extra lifter remains eligible for pipeline Best Lifter awards', () => {
  
        const lifters:
          DivisionScoringCandidate[] = [
            {
              id: 1,
              teamId: 10,
              bodyWeight: 150,
              total: 1300,
              status: 'active',
              isGuest: false,
              isExtraLifter: true,
            },
            {
              id: 2,
              teamId: 20,
              bodyWeight: 150,
              total: 1000,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
          ]
  
        const result =
          scoreTexasMeetDivision(
            lifters,
            THSPA_RULES
          )
  
        expect(
          result.bestLifterPlacements.find(
            placement =>
              placement.id === 1
          )?.place
        ).toBe(1)
      })
  
      test('bombed lifter is excluded from pipeline Best Lifter awards', () => {
  
        const lifters:
          DivisionScoringCandidate[] = [
            {
              id: 1,
              teamId: 10,
              bodyWeight: 150,
              total: 1300,
              status: 'bombed',
              isGuest: false,
              isExtraLifter: false,
            },
            {
              id: 2,
              teamId: 20,
              bodyWeight: 150,
              total: 1000,
              status: 'active',
              isGuest: false,
              isExtraLifter: false,
            },
          ]
  
        const result =
          scoreTexasMeetDivision(
            lifters,
            THSPA_RULES
          )
  
        expect(
          result.bestLifterPlacements.some(
            placement =>
              placement.id === 1
          )
        ).toBe(false)
  
        expect(
          result.bestLifterPlacements.find(
            placement =>
              placement.id === 2
          )?.place
        ).toBe(1)
      })
  
    }
  )