import type {
    AssociationRules,
  } from './AssociationRules'
  
  import {
    TEXAS_INDIVIDUAL_POINTS,
    TEXAS_TEAM_SCORING,
    TEXAS_TEAM_STANDINGS,
  } from './texas'
  
  export const THSWPA_RULES:
    AssociationRules = {
  
      association: 'THSWPA',
  
      individualPoints:
        TEXAS_INDIVIDUAL_POINTS,
  
      teamScoring:
        TEXAS_TEAM_SCORING,
  
      teamStandings:
        TEXAS_TEAM_STANDINGS,
  
      weightClasses: [
        {
          name: '97',
          maxWeight: 97.5,
        },
        {
          name: '105',
          maxWeight: 105.5,
        },
        {
          name: '114',
          maxWeight: 114.5,
        },
        {
          name: '123',
          maxWeight: 123.5,
        },
        {
          name: '132',
          maxWeight: 132.5,
        },
        {
          name: '148',
          maxWeight: 148.5,
        },
        {
          name: '165',
          maxWeight: 165.5,
        },
        {
          name: '181',
          maxWeight: 181.5,
        },
        {
          name: '198',
          maxWeight: 198.5,
        },
        {
          name: '220',
          maxWeight: 220.5,
        },
        {
          name: '242',
          maxWeight: 242.5,
        },
        {
          name: '242+',
          maxWeight:
            Number.POSITIVE_INFINITY,
        },
      ],
  
      coefficient: {
        type: 'malone',
        roundUpBodyWeight: false,
      },
  
      bestLifter: {
        placesPerGroup: 3,
  
        groups: [
          {
            name: '97 to 132',
            firstWeightClass: '97',
            lastWeightClass: '132',
          },
          {
            name: '148 to 242+',
            firstWeightClass: '148',
            lastWeightClass: '242+',
          },
        ],
      },
    }