import type {
    AssociationRules,
  } from './AssociationRules'
  
  import {
    TEXAS_INDIVIDUAL_POINTS,
    TEXAS_TEAM_SCORING,
    TEXAS_TEAM_STANDINGS,
  } from './texas'
  
  export const THSPA_RULES:
    AssociationRules = {
  
    association: 'THSPA',
  
    individualPoints:
      TEXAS_INDIVIDUAL_POINTS,
  
    teamScoring:
      TEXAS_TEAM_SCORING,
  
    teamStandings:
      TEXAS_TEAM_STANDINGS,
  
    weightClasses: [
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
        name: '242',
        maxWeight: 242,
      },
      {
        name: '275',
        maxWeight: 275,
      },
      {
        name: '308',
        maxWeight: 308,
      },
      {
        name: 'SHW',
        maxWeight:
          Number.POSITIVE_INFINITY,
      },
    ],
  
    coefficient: {
      type: 'schwartz',
      roundUpBodyWeight: false,
    },
  }