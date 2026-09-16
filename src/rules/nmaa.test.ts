import {
    describe,
    expect,
    test,
  } from 'vitest'
  
  import {
    NMAA_INDIVIDUAL_POINTS,
    NMAA_TEAM_SCORING,
    NMAA_TEAM_STANDINGS,
  } from './nmaa'
  
  import {
    NMAA_BOYS_RULES,
  } from './nmaaBoys'
  
  import {
    NMAA_GIRLS_RULES,
  } from './nmaaGirls'
  
  import {
    getWeightClass,
  } from '../scoring/weightClass'
  
  describe(
    'NMAA rules',
    () => {
  
      test('uses 7 5 3 2 1 individual points', () => {
  
        expect(
          NMAA_INDIVIDUAL_POINTS
        ).toEqual([
          7,
          5,
          3,
          2,
          1,
        ])
      })
  
      test('allows 12 team scoring lifters', () => {
  
        expect(
          NMAA_TEAM_SCORING
            .maxScoringLifters
        ).toBe(12)
      })
  
      test('allows no more than 2 team scoring lifters per class', () => {
  
        expect(
          NMAA_TEAM_SCORING
            .maxScoringLiftersPerClass
        ).toBe(2)
      })
  
      test('does not apply an unverified coefficient team tie breaker', () => {
  
        expect(
          NMAA_TEAM_STANDINGS
            .useAverageCoefficientTieBreaker
        ).toBe(false)
      })
  
      test('boys rule set belongs to NMAA', () => {
  
        expect(
          NMAA_BOYS_RULES.association
        ).toBe('NMAA')
      })
  
      test('girls rule set belongs to NMAA', () => {
  
        expect(
          NMAA_GIRLS_RULES.association
        ).toBe('NMAA')
      })
  
      test('boys use the NMAA boys weight classes', () => {
  
        expect(
          NMAA_BOYS_RULES
            .weightClasses
            .map(
              weightClass =>
                weightClass.name
            )
        ).toEqual([
          '114',
          '123',
          '132',
          '148',
          '165',
          '181',
          '198',
          '220',
          '242',
          '275',
          '308',
          'SHW',
        ])
      })
  
      test('girls use the NMAA girls weight classes', () => {
  
        expect(
          NMAA_GIRLS_RULES
            .weightClasses
            .map(
              weightClass =>
                weightClass.name
            )
        ).toEqual([
          '97',
          '105',
          '114',
          '123',
          '132',
          '148',
          '165',
          '181',
          '198',
          '220',
          '259',
          'SHW',
        ])
      })
  
      test('boys body weight above 308 is SHW', () => {
  
        expect(
          getWeightClass(
            309,
            NMAA_BOYS_RULES
              .weightClasses
          )
        ).toBe('SHW')
      })
  
      test('girls body weight above 259 is SHW', () => {
  
        expect(
          getWeightClass(
            260,
            NMAA_GIRLS_RULES
              .weightClasses
          )
        ).toBe('SHW')
      })
  
      test('NMAA coefficient calculation is explicitly disabled for now', () => {
  
        expect(
          NMAA_BOYS_RULES
            .coefficient
            .type
        ).toBe('none')
  
        expect(
          NMAA_GIRLS_RULES
            .coefficient
            .type
        ).toBe('none')
      })
  
      test('NMAA Best Lifter placing is explicitly disabled for now', () => {
  
        expect(
          NMAA_BOYS_RULES
            .bestLifter
            .placesPerGroup
        ).toBe(0)
  
        expect(
          NMAA_BOYS_RULES
            .bestLifter
            .groups
        ).toEqual([])
  
        expect(
          NMAA_GIRLS_RULES
            .bestLifter
            .placesPerGroup
        ).toBe(0)
  
        expect(
          NMAA_GIRLS_RULES
            .bestLifter
            .groups
        ).toEqual([])
      })
  
    }
  )