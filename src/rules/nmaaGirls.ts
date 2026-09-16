import type {
    AssociationRules,
  } from './AssociationRules'
  
  import {
    NMAA_INDIVIDUAL_POINTS,
    NMAA_TEAM_SCORING,
    NMAA_TEAM_STANDINGS,
  } from './nmaa'
  
  export const NMAA_GIRLS_RULES:
    AssociationRules = {
  
      association: 'NMAA',
  
      individualPoints:
        NMAA_INDIVIDUAL_POINTS,
  
      teamScoring:
        NMAA_TEAM_SCORING,
  
      teamStandings:
        NMAA_TEAM_STANDINGS,
  
      weightClasses: [
        {
          name: '97',
          maxWeight: 97,
        },
        {
          name: '105',
          maxWeight: 105,
        },
        {
          name: '114',
          maxWeight: 114,
        },
        {
          name: '123',
          maxWeight: 123,
        },
        {
          name: '132',
          maxWeight: 132,
        },
        {
          name: '148',
          maxWeight: 148,
        },
        {
          name: '165',
          maxWeight: 165,
        },
        {
          name: '181',
          maxWeight: 181,
        },
        {
          name: '198',
          maxWeight: 198,
        },
        {
          name: '220',
          maxWeight: 220,
        },
        {
          name: '259',
          maxWeight: 259,
        },
        {
          name: 'SHW',
          maxWeight:
            Number.POSITIVE_INFINITY,
        },
      ],
  
      coefficient: {
        type: 'none',
        roundUpBodyWeight: false,
      },
  
      bestLifter: {
        placesPerGroup: 0,
        groups: [],
      },
    }