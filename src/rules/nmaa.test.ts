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
  
      test('does not use coefficient total as a team tie breaker', () => {
  
        expect(
          NMAA_TEAM_STANDINGS
            .useAverageCoefficientTieBreaker
        ).toBe(false)
      })
  
      test('does not use places below fifth as a team tie breaker', () => {
  
        expect(
          NMAA_TEAM_STANDINGS
            .useAllOtherPlacesTieBreaker
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
  
      test('boys use Schwartz coefficient', () => {
  
        expect(
          NMAA_BOYS_RULES
            .coefficient
            .type
        ).toBe('schwartz')
  
        expect(
          NMAA_BOYS_RULES
            .coefficient
            .roundUpBodyWeight
        ).toBe(false)
      })
  
      test('girls use Malone coefficient', () => {
  
        expect(
          NMAA_GIRLS_RULES
            .coefficient
            .type
        ).toBe('malone')
  
        expect(
          NMAA_GIRLS_RULES
            .coefficient
            .roundUpBodyWeight
        ).toBe(false)
      })
  
      test('boys award three Best Lifter places per group', () => {
  
        expect(
          NMAA_BOYS_RULES
            .bestLifter
            .placesPerGroup
        ).toBe(3)
      })
  
      test('girls award three Best Lifter places per group', () => {
  
        expect(
          NMAA_GIRLS_RULES
            .bestLifter
            .placesPerGroup
        ).toBe(3)
      })
  
      test('boys Best Lifter groups are 114 through 181 and 198 through SHW', () => {
  
        expect(
          NMAA_BOYS_RULES
            .bestLifter
            .groups
        ).toEqual([
          {
            name: '114 to 181',
            firstWeightClass: '114',
            lastWeightClass: '181',
          },
          {
            name: '198 to SHW',
            firstWeightClass: '198',
            lastWeightClass: 'SHW',
          },
        ])
      })
  
      test('girls Best Lifter groups are 97 through 148 and 165 through 259+', () => {
  
        expect(
          NMAA_GIRLS_RULES
            .bestLifter
            .groups
        ).toEqual([
          {
            name: '97 to 148',
            firstWeightClass: '97',
            lastWeightClass: '148',
          },
          {
            name: '165 to 259+',
            firstWeightClass: '165',
            lastWeightClass: 'SHW',
          },
        ])
      })
  
    }
  )