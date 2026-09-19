import './style.css'

import type {
  Division,
  DivisionRuleSet,
} from './models/Division'

import type {
  Lifter,
} from './models/Lifter'

import type {
  Team,
} from './models/Team'

import type {
  MeetState,
} from './models/MeetState'

import type {
  ResultEntryMode,
} from './models/Competition'

import {
  createRegisteredLifter,
  assignRegisteredLifterWeightClass,
} from './domain/lifterRegistration'

import {
  getAutomaticWeightClass,
} from './domain/weightClassAssignment'

import {
  validateLifterCompetitionReadiness,
} from './domain/lifterCompetitionReadiness'

import {
  getDivisionRules,
} from './rules/divisionRules'


interface DivisionTeam {
  divisionId: number
  teamId: number
}


interface LocalMeet {
  state: MeetState
  divisionTeams: DivisionTeam[]
}


interface RegistrationDefaults {
  equipmentType:
    Lifter['equipmentType']
}


type AppPage =
  | 'registration'
  | 'competition'


type CompetitionLift =
  | 'squat'
  | 'bench'
  | 'deadlift'


type CompetitionAttemptKey =
  | 'attempt1'
  | 'attempt2'
  | 'attempt3'


type TeamStatusValue =
  | 'regular'
  | 'bteam'
  | 'guest'


type LifterSortColumn =
  | 'lifterNumber'
  | 'lifter'
  | 'firstName'
  | 'lastName'
  | 'team'
  | 'bodyWeight'
  | 'weightClass'
  | 'grade'
  | 'equipmentType'
  | 'teamStatus'
  | 'lifterStatus'
  | 'readiness'


type BulkSortColumn =
  | 'lifterNumber'
  | 'firstName'
  | 'lastName'
  | 'team'
  | 'bodyWeight'
  | 'weightClass'
  | 'grade'
  | 'equipmentType'
  | 'teamStatus'
  | 'lifterStatus'
  | 'readiness'


type CompetitionSortColumn =
  | 'lifterNumber'
  | 'lifter'
  | 'team'
  | 'bodyWeight'
  | 'weightClass'
  | 'place'
  | 'bestSquat'
  | 'bestBench'
  | 'bestDeadlift'
  | 'total'



const SCHWARTZ_COEFFICIENTS = [
  1.2803, 1.2627, 1.2455, 1.2287, 1.2124, 1.1965, 1.1809, 1.1657, 1.1509, 1.1365,
  1.1223, 1.1086, 1.0952, 1.0821, 1.0693, 1.0569, 1.0448, 1.0329, 1.0214, 1.0101,
  0.9991, 0.9884, 0.9779, 0.9677, 0.9578, 0.9401, 0.9385, 0.9292, 0.9203, 0.9115,
  0.9029, 0.8946, 0.8863, 0.8783, 0.8706, 0.8630, 0.8556, 0.8483, 0.8412, 0.8343,
  0.8276, 0.8210, 0.8146, 0.8083, 0.8022, 0.7961, 0.7903, 0.7846, 0.7790, 0.7735,
  0.7682, 0.7630, 0.7579, 0.7528, 0.7479, 0.7432, 0.7385, 0.7339, 0.7294, 0.7250,
  0.7207, 0.7165, 0.7124, 0.7083, 0.7044, 0.7004, 0.6967, 0.6930, 0.6893, 0.6857,
  0.6822, 0.6787, 0.6753, 0.6720, 0.6688, 0.6656, 0.6624, 0.6593, 0.6563, 0.6533,
  0.6504, 0.6475, 0.6447, 0.6420, 0.6392, 0.6365, 0.6339, 0.6313, 0.6288, 0.6262,
  0.6238, 0.6214, 0.6190, 0.6167, 0.6144, 0.6121, 0.6099, 0.6077, 0.6056, 0.6036,
  0.6014, 0.5994, 0.5978, 0.5954, 0.5935, 0.5916, 0.5897, 0.5879, 0.5861, 0.5843,
  0.5826, 0.5809, 0.5792, 0.5776, 0.5760, 0.5744, 0.5729, 0.5714, 0.5700, 0.5685,
  0.5670, 0.5657, 0.5643, 0.5630, 0.5617, 0.5604, 0.5592, 0.5580, 0.5568, 0.5558,
  0.5545, 0.5535, 0.5524, 0.5514, 0.5504, 0.5494, 0.5485, 0.5476, 0.5467, 0.5458,
  0.5449, 0.5441, 0.5433, 0.5426, 0.5418, 0.5411, 0.5405, 0.5398, 0.5391, 0.5385,
  0.5379, 0.5373, 0.5367, 0.5362, 0.5357, 0.5352, 0.5347, 0.5342, 0.5337, 0.5333,
  0.5328, 0.5325, 0.5320, 0.5316, 0.5312, 0.5308, 0.5304, 0.5300, 0.5296, 0.5292,
  0.5289, 0.5284, 0.5281, 0.5276, 0.5273, 0.5268, 0.5263, 0.5259, 0.5254, 0.5248,
  0.5243, 0.5239, 0.5232, 0.5227, 0.5220, 0.5214, 0.5208, 0.5203, 0.5197, 0.5192,
  0.5186, 0.5180, 0.5175, 0.5169, 0.5164, 0.5158, 0.5154, 0.5147, 0.5142, 0.5137,
  0.5132, 0.5126, 0.5121, 0.5119, 0.5109, 0.5104, 0.5098, 0.5094, 0.5088, 0.5083,
  0.5077, 0.5072, 0.5067, 0.5062, 0.5057, 0.5053, 0.5047, 0.5043, 0.5037, 0.5032,
  0.5027, 0.5022, 0.5017, 0.5013, 0.5007, 0.5002, 0.4998, 0.4992, 0.4988, 0.4982,
  0.4978, 0.4973, 0.4968, 0.4964, 0.4959, 0.4955, 0.4950, 0.4946, 0.4941, 0.4937,
  0.4932, 0.4928, 0.4924, 0.4919, 0.4914, 0.4909, 0.4905, 0.4901, 0.4896, 0.4891,
  0.4887, 0.4883, 0.4878, 0.4874, 0.4870, 0.4866, 0.4862, 0.4858, 0.4854, 0.4850,
  0.4845, 0.4841, 0.4837, 0.4833, 0.4829, 0.4825, 0.4821, 0.4817, 0.4813, 0.4809,
  0.4805, 0.4801, 0.4798, 0.4792, 0.4788, 0.4784,
] as const

const MALONE_COEFFICIENTS = [
  1.1756, 1.1645, 1.1557, 1.1450, 1.1365, 1.1261, 1.1180, 1.1079, 1.0980, 1.0903,
  1.0807, 1.0732, 1.0657, 1.0566, 1.0494, 1.0405, 1.0336, 1.0250, 1.0165, 1.0098,
  1.0016, 0.9952, 0.9872, 0.9809, 0.9731, 0.9670, 0.9595, 0.9536, 0.9462, 0.9390,
  0.9333, 0.9263, 0.9208, 0.9110, 0.9086, 0.9019, 0.8980, 0.8902, 0.8851, 0.8788,
  0.8728, 0.8676, 0.8628, 0.8568, 0.8508, 0.8462, 0.8401, 0.8358, 0.8302, 0.8257,
  0.8202, 0.8159, 0.8105, 0.8052, 0.8010, 0.7959, 0.7918, 0.7867, 0.7826, 0.7769,
  0.7737, 0.7697, 0.7666, 0.7627, 0.7596, 0.7565, 0.7520, 0.7490, 0.7453, 0.7431,
  0.7387, 0.7358, 0.7322, 0.7293, 0.7258, 0.7230, 0.7196, 0.7168, 0.7134, 0.7107,
  0.7074, 0.7040, 0.7014, 0.6981, 0.6956, 0.6923, 0.6898, 0.6866, 0.6841, 0.6810,
  0.6786, 0.6755, 0.6731, 0.6701, 0.6671, 0.6648, 0.6618, 0.6595, 0.6566, 0.6543,
  0.6521, 0.6492, 0.6464, 0.6442, 0.6415, 0.6387, 0.6366, 0.6339, 0.6317, 0.6300,
  0.6287, 0.6269, 0.6256, 0.6239, 0.6226, 0.6209, 0.6196, 0.6180, 0.6167, 0.6151,
  0.6134, 0.6122, 0.6109, 0.6093, 0.6077, 0.6064, 0.6049, 0.6036, 0.6021, 0.6008,
  0.5993, 0.5981, 0.5966, 0.5953, 0.5930, 0.5926, 0.5911, 0.5896, 0.5884, 0.5869,
  0.5858, 0.5843, 0.5831, 0.5817, 0.5805, 0.5791, 0.5779, 0.5765, 0.5754, 0.5740,
  0.5725, 0.5714, 0.5700, 0.5693, 0.5685, 0.5681, 0.5671, 0.5669, 0.5662, 0.5656,
  0.5649,
] as const

function getDivisionCoefficientSystem(
  division: Division,
): 'schwartz' | 'malone' | null {

  switch (
    division.ruleSet
  ) {
    case 'THSPA':
    case 'NMAA_BOYS':
      return 'schwartz'

    case 'THSWPA':
    case 'NMAA_GIRLS':
      return 'malone'

    default:
      return null
  }
}


function getBodyWeightCoefficient(
  division: Division,
  bodyWeight: number | null,
): number | null {

  if (
    bodyWeight === null ||
    !Number.isFinite(
      bodyWeight
    ) ||
    bodyWeight <= 0
  ) {
    return null
  }

  const system =
    getDivisionCoefficientSystem(
      division
    )

  if (
    system === null
  ) {
    return null
  }

  const table =
    system === 'schwartz'
      ? SCHWARTZ_COEFFICIENTS
      : MALONE_COEFFICIENTS

  const wholePounds =
    Math.floor(
      bodyWeight
    )

  const index =
    Math.max(
      0,
      Math.min(
        table.length - 1,
        wholePounds - 90
      )
    )

  return table[index]
}


function formatBodyWeightCoefficient(
  value: number | null,
): string {

  return value === null
    ? ''
    : value.toFixed(4)
}


function getLifterBodyWeightCoefficient(
  meet: LocalMeet,
  lifter: Lifter,
): number | null {

  const division =
    meet.state.divisions.find(
      item =>
        item.id ===
        lifter.divisionId
    )

  if (
    division === undefined
  ) {
    return null
  }

  return getBodyWeightCoefficient(
    division,
    lifter.bodyWeight
  )
}


function getRegistrationCoefficientHeader(
  division: Division | undefined,
): string {

  const system =
    division === undefined
      ? null
      : getDivisionCoefficientSystem(
          division
        )

  switch (
    system
  ) {
    case 'schwartz':
      return 'Schwartz'

    case 'malone':
      return 'Malone'

    default:
      return 'Coefficient'
  }
}
function createDevelopmentLifter(
  id: number,
  lifterNumber: number,
  firstName: string,
  lastName: string,
  divisionId: number,
  teamId: number,
  equipmentType: Lifter['equipmentType'] =
    'equipped',
): Lifter {

  return {
    id,
    lifterNumber,
    firstName,
    lastName,
    divisionId,
    teamId,
    bodyWeight: null,
    weightClass: null,
    weightClassSource:
      'automatic',
    equipmentType,
    age: null,
    grade: null,
    status: 'active',
    isGuest: false,
    isExtraLifter: false,
    declaredDeadliftOpener: null,
  }
}


const localMeets: LocalMeet[] = [
  {
    state: {
      meet: {
        id: 'development-meet',
        name: 'PowerScore Development Meet',
        date: '2026-09-16',
        location: 'Lubbock, Texas',
        resultEntryMode:
          'all-attempts',
      },

      divisions: [
        {
          id: 1,
          meetId:
            'development-meet',
          name:
            'Division 1',
          ruleSet:
            'THSPA',
        },

        {
          id: 2,
          meetId:
            'development-meet',
          name:
            'Division 2',
          ruleSet:
            'THSWPA',
        },
      ],

      teams: [
        {
          id: 1,
          meetId:
            'development-meet',
          name:
            'Sundown',
          region: null,
          classification: null,
        },

        {
          id: 2,
          meetId:
            'development-meet',
          name:
            'Levelland',
          region: null,
          classification: null,
        },

        {
          id: 3,
          meetId:
            'development-meet',
          name:
            'Brownfield',
          region: null,
          classification: null,
        },

        {
          id: 4,
          meetId:
            'development-meet',
          name:
            'Muleshoe',
          region: null,
          classification: null,
        },

        {
          id: 5,
          meetId:
            'development-meet',
          name:
            'Friona',
          region: null,
          classification: null,
        },

        {
          id: 6,
          meetId:
            'development-meet',
          name:
            'Denver City',
          region: null,
          classification: null,
        },

        {
          id: 7,
          meetId:
            'development-meet',
          name:
            'Morton',
          region: null,
          classification: null,
        },
      ],

      lifters: [
        createDevelopmentLifter(1, 1, 'Ethan', 'Garcia', 1, 1, 'equipped'),
        createDevelopmentLifter(2, 2, 'Mason', 'Rodriguez', 1, 1, 'equipped'),
        createDevelopmentLifter(3, 3, 'Caleb', 'Martinez', 1, 1, 'equipped'),
        createDevelopmentLifter(4, 4, 'Dylan', 'Hernandez', 1, 1, 'equipped'),
        createDevelopmentLifter(5, 5, 'Noah', 'Flores', 1, 1, 'equipped'),
        createDevelopmentLifter(6, 6, 'Logan', 'Torres', 1, 2, 'equipped'),
        createDevelopmentLifter(7, 7, 'Aiden', 'Ramirez', 1, 2, 'unequipped'),
        createDevelopmentLifter(8, 8, 'Jacob', 'Sanchez', 1, 2, 'equipped'),
        createDevelopmentLifter(9, 9, 'Luke', 'Castillo', 1, 2, 'equipped'),
        createDevelopmentLifter(10, 10, 'Owen', 'Reyes', 1, 2, 'equipped'),
        createDevelopmentLifter(11, 11, 'Wyatt', 'Lopez', 1, 4, 'equipped'),
        createDevelopmentLifter(12, 12, 'Carter', 'Gonzales', 1, 4, 'equipped'),
        createDevelopmentLifter(13, 13, 'Isaac', 'Mendoza', 1, 4, 'equipped'),
        createDevelopmentLifter(14, 14, 'Nathan', 'Ortiz', 1, 4, 'unequipped'),
        createDevelopmentLifter(15, 15, 'Levi', 'Salazar', 1, 4, 'equipped'),
        createDevelopmentLifter(16, 16, 'Jackson', 'Morales', 1, 5, 'equipped'),
        createDevelopmentLifter(17, 17, 'Cooper', 'Vasquez', 1, 5, 'equipped'),
        createDevelopmentLifter(18, 18, 'Gabriel', 'Ramos', 1, 5, 'equipped'),
        createDevelopmentLifter(19, 19, 'Hunter', 'Gomez', 1, 5, 'equipped'),
        createDevelopmentLifter(20, 20, 'Ryan', 'Chavez', 1, 5, 'equipped'),
        createDevelopmentLifter(21, 21, 'Colton', 'Perez', 1, 6, 'unequipped'),
        createDevelopmentLifter(22, 22, 'Brayden', 'Gutierrez', 1, 6, 'equipped'),
        createDevelopmentLifter(23, 23, 'Easton', 'Dominguez', 1, 6, 'equipped'),
        createDevelopmentLifter(24, 24, 'Jace', 'Herrera', 1, 6, 'equipped'),
        createDevelopmentLifter(25, 25, 'Adrian', 'Ruiz', 1, 6, 'equipped'),
        createDevelopmentLifter(26, 26, 'Connor', 'Alvarez', 1, 7, 'equipped'),
        createDevelopmentLifter(27, 27, 'Landon', 'Medina', 1, 7, 'equipped'),
        createDevelopmentLifter(28, 28, 'Eli', 'Cruz', 1, 7, 'unequipped'),
        createDevelopmentLifter(29, 29, 'Tyler', 'Vega', 1, 7, 'equipped'),
        createDevelopmentLifter(30, 30, 'Austin', 'Navarro', 1, 7, 'equipped'),
        createDevelopmentLifter(31, 31, 'Emma', 'Garcia', 2, 1, 'equipped'),
        createDevelopmentLifter(32, 32, 'Sofia', 'Rodriguez', 2, 1, 'equipped'),
        createDevelopmentLifter(33, 33, 'Ava', 'Martinez', 2, 1, 'equipped'),
        createDevelopmentLifter(34, 34, 'Mia', 'Hernandez', 2, 1, 'equipped'),
        createDevelopmentLifter(35, 35, 'Isabella', 'Flores', 2, 3, 'unequipped'),
        createDevelopmentLifter(36, 36, 'Camila', 'Torres', 2, 3, 'equipped'),
        createDevelopmentLifter(37, 37, 'Luna', 'Ramirez', 2, 3, 'equipped'),
        createDevelopmentLifter(38, 38, 'Harper', 'Sanchez', 2, 3, 'equipped'),
        createDevelopmentLifter(39, 39, 'Elena', 'Castillo', 2, 4, 'equipped'),
        createDevelopmentLifter(40, 40, 'Natalie', 'Reyes', 2, 4, 'equipped'),
        createDevelopmentLifter(41, 41, 'Grace', 'Lopez', 2, 4, 'equipped'),
        createDevelopmentLifter(42, 42, 'Chloe', 'Gonzales', 2, 4, 'unequipped'),
        createDevelopmentLifter(43, 43, 'Zoey', 'Mendoza', 2, 5, 'equipped'),
        createDevelopmentLifter(44, 44, 'Layla', 'Ortiz', 2, 5, 'equipped'),
        createDevelopmentLifter(45, 45, 'Victoria', 'Salazar', 2, 5, 'equipped'),
        createDevelopmentLifter(46, 46, 'Nora', 'Morales', 2, 5, 'equipped'),
        createDevelopmentLifter(47, 47, 'Addison', 'Vasquez', 2, 6, 'equipped'),
        createDevelopmentLifter(48, 48, 'Claire', 'Ramos', 2, 6, 'equipped'),
        createDevelopmentLifter(49, 49, 'Lucy', 'Gomez', 2, 6, 'unequipped'),
        createDevelopmentLifter(50, 50, 'Stella', 'Chavez', 2, 6, 'equipped'),
        createDevelopmentLifter(51, 51, 'Audrey', 'Perez', 2, 7, 'equipped'),
        createDevelopmentLifter(52, 52, 'Ruby', 'Gutierrez', 2, 7, 'equipped'),
        createDevelopmentLifter(53, 53, 'Alice', 'Dominguez', 2, 7, 'equipped'),
        createDevelopmentLifter(54, 54, 'Sadie', 'Herrera', 2, 7, 'equipped'),
      ],
    },

    divisionTeams: [
      { divisionId: 1, teamId: 1 },
      { divisionId: 1, teamId: 2 },
      { divisionId: 1, teamId: 4 },
      { divisionId: 1, teamId: 5 },
      { divisionId: 1, teamId: 6 },
      { divisionId: 1, teamId: 7 },

      { divisionId: 2, teamId: 1 },
      { divisionId: 2, teamId: 3 },
      { divisionId: 2, teamId: 4 },
      { divisionId: 2, teamId: 5 },
      { divisionId: 2, teamId: 6 },
      { divisionId: 2, teamId: 7 },
    ],
  },

  {
    state: {
      meet: {
        id: 'second-development-meet',
        name: 'Second Development Meet',
        date: '2026-10-03',
        location: '',
        resultEntryMode:
          'best-lift-only',
      },

      divisions: [
        {
          id: 1,
          meetId:
            'second-development-meet',
          name:
            'Division 1',
          ruleSet:
            'THSPA',
        },
      ],

      teams: [],

      lifters: [],
    },

    divisionTeams: [],
  },
]

function expandDevelopmentMeetLifters():
  void {

  const meet =
    localMeets.find(
      item =>
        item.state.meet.id ===
        'development-meet'
    )

  if (
    meet === undefined ||
    meet.state.lifters.length >=
      108
  ) {
    return
  }

  const boysFirstNames = [
    'Blake', 'Carson', 'Dominic', 'Grayson', 'Ian',
    'Jordan', 'Kayden', 'Micah', 'Nolan', 'Parker',
    'Quentin', 'Ryder', 'Sawyer', 'Tristan', 'Xavier',
    'Zane', 'Brody', 'Cameron', 'Diego', 'Emmett',
    'Finn', 'Gavin', 'Hayden', 'Jonah', 'Liam',
    'Miles', 'Preston', 'Reid', 'Tanner', 'Wesley',
  ]

  const girlsFirstNames = [
    'Abigail', 'Bella', 'Caroline', 'Delilah', 'Ellie',
    'Faith', 'Gianna', 'Hazel', 'Ivy', 'Julia',
    'Kinsley', 'Leah', 'Madeline', 'Naomi', 'Olivia',
    'Paige', 'Quinn', 'Reagan', 'Savannah', 'Tessa',
    'Valerie', 'Willow', 'Yaretzi', 'Zoe',
  ]

  const lastNames = [
    'Acosta', 'Barrera', 'Cantu', 'Delgado', 'Escobar',
    'Fuentes', 'Gallegos', 'Hinojosa', 'Ibarra', 'Jimenez',
    'Keller', 'Lara', 'Montoya', 'Nunez', 'Ochoa',
    'Padilla', 'Quintana', 'Rosales', 'Solis', 'Trevino',
    'Uribe', 'Valdez', 'Williams', 'Ybarra', 'Zamora',
    'Anderson', 'Baker', 'Coleman', 'Diaz', 'Estrada',
  ]

  const boysTeams = [
    1, 2, 4, 5, 6, 7,
  ]

  const girlsTeams = [
    1, 3, 4, 5, 6, 7,
  ]

  for (
    let index = 0;
    index < boysFirstNames.length;
    index += 1
  ) {
    const id =
      55 + index

    meet.state.lifters.push(
      createDevelopmentLifter(
        id,
        id,
        boysFirstNames[index],
        lastNames[index],
        1,
        boysTeams[
          index % boysTeams.length
        ],
        index % 7 === 0
          ? 'unequipped'
          : 'equipped',
      )
    )
  }

  for (
    let index = 0;
    index < girlsFirstNames.length;
    index += 1
  ) {
    const id =
      85 + index

    meet.state.lifters.push(
      createDevelopmentLifter(
        id,
        id,
        girlsFirstNames[index],
        lastNames[
          (index + 3) %
          lastNames.length
        ],
        2,
        girlsTeams[
          index % girlsTeams.length
        ],
        index % 6 === 0
          ? 'unequipped'
          : 'equipped',
      )
    )
  }
}


expandDevelopmentMeetLifters()


function roundDevelopmentAttempt(
  value: number,
): number {

  return Math.round(
    value / 5
  ) * 5
}


function seedDevelopmentLifterAttempts(
  lifter: Lifter,
): void {

  if (
    lifter.bodyWeight ===
    null
  ) {
    return
  }

  const squat1 =
    roundDevelopmentAttempt(
      lifter.bodyWeight * 1.45
    )

  const bench1 =
    roundDevelopmentAttempt(
      lifter.bodyWeight * 0.9
    )

  const deadlift1 =
    roundDevelopmentAttempt(
      lifter.bodyWeight * 1.65
    )

  const variant =
    lifter.lifterNumber % 3

  const squat2 =
    squat1 + 10

  const squat3 =
    squat2 + 10

  const bench2 =
    bench1 + 5

  const bench3 =
    bench2 + 5

  const deadlift2 =
    deadlift1 + 10

  const deadlift3 =
    deadlift2 + 10

  const bench2Good =
    variant !== 1

  lifter.allAttemptResults = {
    squat: {
      attempt1: {
        weight: squat1,
        status: 'good',
      },
      attempt2: {
        weight: squat2,
        status: 'good',
      },
      attempt3: {
        weight: squat3,
        status:
          variant === 0
            ? 'bad'
            : 'unspecified',
      },
    },

    bench: {
      attempt1: {
        weight: bench1,
        status: 'good',
      },
      attempt2: {
        weight: bench2,
        status:
          bench2Good
            ? 'good'
            : 'bad',
      },
      attempt3: {
        weight: bench3,
        status: 'unspecified',
      },
    },

    deadlift: {
      attempt1: {
        weight: deadlift1,
        status: 'good',
      },
      attempt2: {
        weight: deadlift2,
        status: 'good',
      },
      attempt3: {
        weight: deadlift3,
        status:
          variant === 2
            ? 'bad'
            : 'unspecified',
      },
    },
  }

  lifter.bestLiftResults = {
    squat:
      squat2,

    bench:
      bench2Good
        ? bench2
        : bench1,

    deadlift:
      deadlift2,
  }
}


function seedDevelopmentMeetData():
  void {

  const meet =
    localMeets.find(
      item =>
        item.state.meet.id ===
        'development-meet'
    )

  if (
    meet === undefined
  ) {
    return
  }

  /*
   * Sample bodyweights deliberately rotate through weight classes
   * instead of following team/lifter-number order. This keeps each
   * class populated by several different teams for Competition testing.
   */
  const boysWeights = [
    108.4, 119.6, 129.1, 143.7, 158.5, 175.2,
    191.4, 213.6, 235.8, 267.3, 286.5,
  ]

  const girlsWeights = [
    93.6, 101.8, 110.7, 119.4, 128.6, 143.2,
    158.7, 174.6, 191.2, 214.4, 235.6, 251.7,
  ]

  const assignDivisionWeights = (
    divisionId: number,
    classWeights: number[],
    step: number,
  ): void => {

    const lifters =
      meet.state.lifters
        .filter(
          lifter =>
            lifter.divisionId ===
            divisionId
        )
        .sort(
          (a, b) =>
            a.lifterNumber -
            b.lifterNumber
        )

    const division =
      meet.state.divisions.find(
        item =>
          item.id ===
          divisionId
      )

    if (
      division === undefined
    ) {
      return
    }

    for (
      let index = 0;
      index < lifters.length;
      index += 1
    ) {
      const lifter =
        lifters[index]

      const classIndex =
        (
          index * step +
          Math.floor(
            index /
            classWeights.length
          )
        ) %
        classWeights.length

      const variation =
        (
          (index % 4) -
          1.5
        ) * 0.2

      const bodyWeight =
        Math.round(
          (
            classWeights[classIndex] +
            variation
          ) * 10
        ) / 10

      try {

        const rules =
          getDivisionRules(
            division
          )

        lifter.bodyWeight =
          bodyWeight

        lifter.weightClass =
          getAutomaticWeightClass(
            bodyWeight,
            rules.weightClasses
          )

        lifter.weightClassSource =
          'automatic'

      } catch {
        lifter.bodyWeight =
          bodyWeight
      }
    }
  }

  assignDivisionWeights(
    1,
    boysWeights,
    5,
  )

  assignDivisionWeights(
    2,
    girlsWeights,
    5,
  )

  const classGroups =
    new Map<
      string,
      Lifter[]
    >()

  for (
    const lifter of
    meet.state.lifters
  ) {
    if (
      lifter.weightClass ===
      null
    ) {
      continue
    }

    const key =
      `${lifter.divisionId}|${lifter.weightClass}`

    const group =
      classGroups.get(
        key
      ) ?? []

    group.push(
      lifter
    )

    classGroups.set(
      key,
      group
    )
  }

  for (
    const group of
    classGroups.values()
  ) {
    const lifters =
      [...group].sort(
        (a, b) =>
          a.lifterNumber -
          b.lifterNumber
      )

    const sampleCount =
      Math.max(
        1,
        Math.round(
          lifters.length / 2
        )
      )

    /*
     * Seed every other lifter rather than simply the first half.
     * This spreads populated attempts across teams within each class.
     */
    const seeded =
      lifters.filter(
        (_, index) =>
          index % 2 === 0
      )

    for (
      const lifter of
      seeded.slice(
        0,
        sampleCount
      )
    ) {
      seedDevelopmentLifterAttempts(
        lifter
      )
    }
  }
}


seedDevelopmentMeetData()



let currentPage:
  AppPage =
    'registration'


let selectedMeetId:
  string | null =
    null


let selectedDivisionId:
  number | null =
    null


let selectedTeamId:
  number | null =
    null


let selectedLifterId:
  number | null =
    null


let selectedCompetitionWeightClass:
  string | null =
    null


let competitionSortColumn:
  CompetitionSortColumn =
    'lifterNumber'


let competitionSortAscending =
  true


const competitionWeightClassByDivision =
  new Map<string, string | null>()


function getCompetitionDivisionKey(
  meetId: string,
  divisionId: number,
): string {

  return `${meetId}:${divisionId}`
}


function rememberCompetitionWeightClass(
  meet: LocalMeet,
): void {

  if (
    selectedDivisionId === null
  ) {
    return
  }

  competitionWeightClassByDivision.set(
    getCompetitionDivisionKey(
      meet.state.meet.id,
      selectedDivisionId
    ),
    selectedCompetitionWeightClass
  )
}


function restoreCompetitionWeightClass(
  meet: LocalMeet,
  divisionId: number,
): void {

  const key =
    getCompetitionDivisionKey(
      meet.state.meet.id,
      divisionId
    )

  selectedCompetitionWeightClass =
    competitionWeightClassByDivision.has(
      key
    )
      ? competitionWeightClassByDivision.get(
          key
        ) ?? null
      : getCompetitionWeightClasses(
          meet
        )[0] ?? null
}


const competitionAutoBombedLifterIds =
  new Set<number>()


let competitionShortcutKeydownHandler:
  ((event: KeyboardEvent) => void) | null =
    null


type RegistrationEntry =
  | 'meet'
  | 'division'
  | 'team'
  | 'lifter'


interface EditTarget {
  type: RegistrationEntry
  id: string | number
}


let activeEntry:
  RegistrationEntry | null =
    null


let activeEdit:
  EditTarget | null =
    null


let activeEditOriginalSnapshot:
  string | null =
    null


let editLifterWeightClassManuallyChanged =
  false


let isBulkEditing =
  false


let bulkEditOriginalSnapshot:
  string | null =
    null


let lifterSortColumn:
  LifterSortColumn =
    'lifterNumber'


let lifterSortAscending =
  true


let bulkSortColumn:
  BulkSortColumn =
    'lifterNumber'


let bulkSortAscending =
  true


let lastRegistrationRowClickKey:
  string | null =
    null


let lastRegistrationRowClickAt =
  0


let lastRegistrationShortcutKey:
  RegistrationEntry | null =
    null


let lastRegistrationShortcutAt =
  0


let registrationShortcutKeydownHandler:
  ((event: KeyboardEvent) => void) | null =
    null


const REGISTRATION_DOUBLE_CLICK_MS =
  450


const REGISTRATION_SHORTCUT_MS =
  650


const LIFTER_WEIGHT_DIGIT_MS =
  1200


let focusedLifterWeightDigits =
  ''


let focusedLifterWeightLifterId:
  number | null =
    null


let focusedLifterWeightLastAt =
  0


let bulkMissingBodyweightsOnly =
  false


let outsideEntryClickHandler:
  ((event: MouseEvent) => void) | null =
    null


let registrationDefaults:
  RegistrationDefaults = {
    equipmentType:
      'equipped',
  }


function escapeHtml(
  value: string,
): string {

  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}


function createMeetId():
  string {

  return (
    'meet-' +
    Date.now().toString() +
    '-' +
    Math.random()
      .toString(36)
      .slice(2, 8)
  )
}


function getSelectedMeet():
  LocalMeet | undefined {

  return localMeets.find(
    item =>
      item.state.meet.id ===
      selectedMeetId
  )
}


function getSelectedDivision():
  Division | undefined {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined ||
    selectedDivisionId === null
  ) {
    return undefined
  }

  return meet.state.divisions.find(
    division =>
      division.id ===
      selectedDivisionId
  )
}


function getSelectedTeam():
  Team | undefined {

  const meet =
    getSelectedMeet()

  const division =
    getSelectedDivision()

  if (
    meet === undefined ||
    division === undefined ||
    selectedTeamId === null
  ) {
    return undefined
  }

  return getTeamsForDivision(
    meet,
    division.id
  ).find(
    team =>
      team.id ===
      selectedTeamId
  )
}


function getFirstLifterForSelection(
  meet: LocalMeet,
): Lifter | undefined {

  const divisionId =
    selectedDivisionId

  const teamId =
    selectedTeamId

  if (
    divisionId === null
  ) {
    return undefined
  }

  return [...meet.state.lifters]
    .filter(
      lifter =>
        lifter.divisionId ===
          divisionId &&
        (
          teamId === null ||
          lifter.teamId ===
            teamId
        )
    )
    .sort(
      (a, b) =>
        a.lifterNumber -
        b.lifterNumber
    )[0]
}


function selectFirstLifterForSelection(
  meet: LocalMeet,
): void {

  selectedLifterId =
    getFirstLifterForSelection(
      meet
    )?.id ??
    null
}


function selectFirstTeamForDivision(
  meet: LocalMeet,
  divisionId: number,
): void {

  void divisionId

  selectedTeamId =
    null

  selectFirstLifterForSelection(
    meet
  )
}


function selectFirstDivisionForMeet(
  meet: LocalMeet,
): void {

  const division =
    meet.state.divisions[0]

  selectedDivisionId =
    division?.id ??
    null

  if (
    division === undefined
  ) {
    selectedTeamId =
      null

    selectedLifterId =
      null

    return
  }

  selectFirstTeamForDivision(
    meet,
    division.id
  )
}


function selectFirstHierarchy():
  void {

  const meet =
    localMeets[0]

  selectedMeetId =
    meet?.state.meet.id ??
    null

  if (
    meet === undefined
  ) {
    selectedDivisionId =
      null

    selectedTeamId =
      null

    selectedLifterId =
      null

    return
  }

  selectFirstDivisionForMeet(
    meet
  )
}


function selectMeet(
  meetId: string,
): void {

  if (
    !finishBulkEdit(
      true
    )
  ) {
    return
  }

  if (
    !finishActiveEdit(
      true,
      false
    )
  ) {
    return
  }

  activeEntry =
    null

  selectedMeetId =
    meetId

  selectedCompetitionWeightClass =
    null

  registrationDefaults = {
    equipmentType:
      'equipped',
  }

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    selectedDivisionId =
      null

    selectedTeamId =
      null

    selectedLifterId =
      null
  } else {
    selectFirstDivisionForMeet(
      meet
    )
  }

  renderApp()
}


function selectDivision(
  divisionId: number,
): void {

  if (
    !finishBulkEdit(
      true
    )
  ) {
    return
  }

  if (
    !finishActiveEdit(
      true,
      false
    )
  ) {
    return
  }

  activeEntry =
    null

  const meet =
    getSelectedMeet()

  if (
    meet === undefined ||
    !meet.state.divisions.some(
      division =>
        division.id ===
        divisionId
    )
  ) {
    return
  }

  selectedDivisionId =
    divisionId

  selectedCompetitionWeightClass =
    null

  selectFirstTeamForDivision(
    meet,
    divisionId
  )

  renderApp()
}


function selectTeam(
  teamId: number,
): void {

  if (
    !finishBulkEdit(
      true
    )
  ) {
    return
  }

  if (
    !finishActiveEdit(
      true,
      false
    )
  ) {
    return
  }

  activeEntry =
    null

  const meet =
    getSelectedMeet()

  const team =
    getTeamsForSelectedDivision()
      .find(
        item =>
          item.id ===
          teamId
      )

  if (
    meet === undefined ||
    team === undefined
  ) {
    return
  }

  selectedTeamId =
    teamId

  selectFirstLifterForSelection(
    meet
  )

  renderApp()
}


function selectAllTeams():
  void {

  if (
    !finishBulkEdit(
      true
    )
  ) {
    return
  }

  if (
    !finishActiveEdit(
      true,
      false
    )
  ) {
    return
  }

  activeEntry =
    null

  const meet =
    getSelectedMeet()

  const division =
    getSelectedDivision()

  if (
    meet === undefined ||
    division === undefined
  ) {
    return
  }

  selectedTeamId =
    null

  selectFirstLifterForSelection(
    meet
  )

  renderApp()
}


function selectLifter(
  lifterId: number,
): void {

  if (
    !finishBulkEdit(
      true
    )
  ) {
    return
  }

  if (
    !finishActiveEdit(
      true,
      false
    )
  ) {
    return
  }

  activeEntry =
    null

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }

  const lifter =
    meet.state.lifters.find(
      item =>
        item.id ===
          lifterId &&
        item.divisionId ===
          selectedDivisionId &&
        (
          selectedTeamId === null ||
          item.teamId ===
            selectedTeamId
        )
    )

  if (
    lifter === undefined
  ) {
    return
  }

  selectedLifterId =
    lifterId

  renderApp()
}


function getNextDivisionId(
  meet: LocalMeet,
): number {

  if (
    meet.state.divisions.length === 0
  ) {
    return 1
  }

  return (
    Math.max(
      ...meet.state.divisions.map(
        division =>
          division.id
      )
    ) + 1
  )
}


function getNextTeamId(
  meet: LocalMeet,
): number {

  if (
    meet.state.teams.length === 0
  ) {
    return 1
  }

  return (
    Math.max(
      ...meet.state.teams.map(
        team =>
          team.id
      )
    ) + 1
  )
}


function getNextLifterId(
  state: MeetState,
): number {

  if (
    state.lifters.length === 0
  ) {
    return 1
  }

  return (
    Math.max(
      ...state.lifters.map(
        lifter =>
          lifter.id
      )
    ) + 1
  )
}


function getNextUnusedLifterNumber(
  state: MeetState,
): number {

  const used =
    new Set(
      state.lifters.map(
        lifter =>
          lifter.lifterNumber
      )
    )

  let candidate =
    1

  while (
    used.has(candidate)
  ) {
    candidate += 1
  }

  return candidate
}


function focusElement(
  selector: string,
): void {

  window.requestAnimationFrame(
    () => {
      document
        .querySelector<HTMLElement>(
          selector
        )
        ?.focus()
    }
  )
}


function flashRow(
  selector: string,
): void {

  window.requestAnimationFrame(
    () => {

      const row =
        document.querySelector(
          selector
        )

      if (
        row === null
      ) {
        return
      }

      row.classList.add(
        'entry-accepted'
      )

      window.setTimeout(
        () => {
          row.classList.remove(
            'entry-accepted'
          )
        },
        450
      )
    }
  )
}


function cancelActiveEntry():
  void {

  if (
    activeEntry === null
  ) {
    return
  }

  activeEntry =
    null

  renderApp()
}


function clearActiveEdit():
  void {

  activeEdit =
    null

  activeEditOriginalSnapshot =
    null

  editLifterWeightClassManuallyChanged =
    false
}


function isEditingEntity(
  type: RegistrationEntry,
  id: string | number,
): boolean {

  return (
    activeEdit?.type === type &&
    String(
      activeEdit.id
    ) ===
      String(id)
  )
}


function getEditEntitySnapshot(
  target: EditTarget,
): string | null {

  if (
    target.type ===
    'meet'
  ) {
    const meet =
      localMeets.find(
        item =>
          item.state.meet.id ===
          String(target.id)
      )

    if (
      meet === undefined
    ) {
      return null
    }

    return JSON.stringify({
      name:
        meet.state.meet.name,
      date:
        meet.state.meet.date,
      location:
        meet.state.meet.location,
      resultEntryMode:
        meet.state.meet
          .resultEntryMode,
    })
  }

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return null
  }

  const numericId =
    Number(
      target.id
    )

  if (
    target.type ===
    'division'
  ) {
    const division =
      meet.state.divisions.find(
        item =>
          item.id ===
          numericId
      )

    if (
      division === undefined
    ) {
      return null
    }

    return JSON.stringify({
      name:
        division.name,
      ruleSet:
        division.ruleSet ??
        '',
    })
  }

  if (
    target.type ===
    'team'
  ) {
    const team =
      meet.state.teams.find(
        item =>
          item.id ===
          numericId
      )

    if (
      team === undefined
    ) {
      return null
    }

    return JSON.stringify({
      name:
        team.name,
      isBTeam:
        team.isBTeam ===
        true,
    })
  }

  const lifter =
    meet.state.lifters.find(
      item =>
        item.id ===
        numericId
    )

  if (
    lifter === undefined
  ) {
    return null
  }

  return JSON.stringify({
    lifterNumber:
      lifter.lifterNumber,
    firstName:
      lifter.firstName,
    lastName:
      lifter.lastName,
    bodyWeight:
      lifter.bodyWeight,
    weightClass:
      lifter.weightClass ??
      '',
    grade:
      lifter.grade,
    equipmentType:
      lifter.equipmentType,
    isGuest:
      lifter.isGuest,
    isExtraLifter:
      lifter.isExtraLifter,
    status:
      lifter.status,
  })
}


function getEditFormSnapshot(
  target: EditTarget,
): string | null {

  if (
    target.type ===
    'meet'
  ) {
    const name =
      document.querySelector<HTMLInputElement>(
        '#editMeetName'
      )

    const date =
      document.querySelector<HTMLInputElement>(
        '#editMeetDate'
      )

    const location =
      document.querySelector<HTMLInputElement>(
        '#editMeetLocation'
      )

    const mode =
      document.querySelector<HTMLSelectElement>(
        '#editMeetResultEntryMode'
      )

    if (
      name === null ||
      date === null ||
      location === null ||
      mode === null
    ) {
      return null
    }

    return JSON.stringify({
      name:
        name.value.trim(),
      date:
        date.value,
      location:
        location.value.trim(),
      resultEntryMode:
        mode.value,
    })
  }

  if (
    target.type ===
    'division'
  ) {
    const name =
      document.querySelector<HTMLInputElement>(
        '#editDivisionName'
      )

    const ruleSet =
      document.querySelector<HTMLSelectElement>(
        '#editDivisionRuleSet'
      )

    if (
      name === null ||
      ruleSet === null
    ) {
      return null
    }

    return JSON.stringify({
      name:
        name.value.trim(),
      ruleSet:
        ruleSet.value,
    })
  }

  if (
    target.type ===
    'team'
  ) {
    const name =
      document.querySelector<HTMLInputElement>(
        '#editTeamName'
      )

    const bTeam =
      document.querySelector<HTMLInputElement>(
        '#editTeamBTeam'
      )

    if (
      name === null ||
      bTeam === null
    ) {
      return null
    }

    return JSON.stringify({
      name:
        name.value.trim(),
      isBTeam:
        bTeam.checked,
    })
  }

  const number =
    document.querySelector<HTMLInputElement>(
      '#editLifterNumber'
    )

  const first =
    document.querySelector<HTMLInputElement>(
      '#editLifterFirstName'
    )

  const last =
    document.querySelector<HTMLInputElement>(
      '#editLifterLastName'
    )

  const bodyWeight =
    document.querySelector<HTMLInputElement>(
      '#editLifterBodyWeight'
    )

  const weightClass =
    document.querySelector<HTMLSelectElement>(
      '#editLifterWeightClass'
    )

  const grade =
    document.querySelector<HTMLInputElement>(
      '#editLifterGrade'
    )

  const equipment =
    document.querySelector<HTMLSelectElement>(
      '#editLifterEquipment'
    )

  const teamStatus =
    document.querySelector<HTMLSelectElement>(
      '#editLifterTeamStatus'
    )

  const lifterStatus =
    document.querySelector<HTMLSelectElement>(
      '#editLifterStatus'
    )

  if (
    number === null ||
    first === null ||
    last === null ||
    bodyWeight === null ||
    weightClass === null ||
    grade === null ||
    equipment === null ||
    teamStatus === null ||
    lifterStatus === null
  ) {
    return null
  }

  const bodyWeightValue =
    bodyWeight.value.trim() ===
    ''
      ? null
      : Number(
          bodyWeight.value
        )

  const gradeValue =
    grade.value.trim() ===
    ''
      ? null
      : Number(
          grade.value
        )

  return JSON.stringify({
    lifterNumber:
      Number(
        number.value
      ),
    firstName:
      first.value.trim(),
    lastName:
      last.value.trim(),
    bodyWeight:
      bodyWeightValue,
    weightClass:
      weightClass.value,
    grade:
      gradeValue,
    equipmentType:
      equipment.value,
    isGuest:
      teamStatus.value ===
      'guest',
    isExtraLifter:
      teamStatus.value ===
      'bteam',
    status:
      lifterStatus.value,
  })
}


function hasActiveEditChanges():
  boolean {

  if (
    activeEdit === null ||
    activeEditOriginalSnapshot ===
      null
  ) {
    return false
  }

  const current =
    getEditFormSnapshot(
      activeEdit
    )

  return (
    current !== null &&
    current !==
      activeEditOriginalSnapshot
  )
}


function saveMeetEdit(
  target: EditTarget,
): boolean {

  const meet =
    localMeets.find(
      item =>
        item.state.meet.id ===
        String(target.id)
    )

  const nameInput =
    document.querySelector<HTMLInputElement>(
      '#editMeetName'
    )

  const dateInput =
    document.querySelector<HTMLInputElement>(
      '#editMeetDate'
    )

  const locationInput =
    document.querySelector<HTMLInputElement>(
      '#editMeetLocation'
    )

  const modeInput =
    document.querySelector<HTMLSelectElement>(
      '#editMeetResultEntryMode'
    )

  if (
    meet === undefined ||
    nameInput === null ||
    dateInput === null ||
    locationInput === null ||
    modeInput === null
  ) {
    return false
  }

  const name =
    nameInput.value.trim()

  if (
    name === ''
  ) {
    window.alert(
      'Enter a meet name.'
    )

    nameInput.focus()

    return false
  }

  meet.state.meet.name =
    name

  meet.state.meet.date =
    dateInput.value

  meet.state.meet.location =
    locationInput.value.trim()

  meet.state.meet.resultEntryMode =
    modeInput.value ===
      'all-attempts'
        ? 'all-attempts'
        : 'best-lift-only'

  return true
}


function saveDivisionEdit(
  target: EditTarget,
): boolean {

  const meet =
    getSelectedMeet()

  const nameInput =
    document.querySelector<HTMLInputElement>(
      '#editDivisionName'
    )

  const ruleSetInput =
    document.querySelector<HTMLSelectElement>(
      '#editDivisionRuleSet'
    )

  if (
    meet === undefined ||
    nameInput === null ||
    ruleSetInput === null
  ) {
    return false
  }

  const division =
    meet.state.divisions.find(
      item =>
        item.id ===
        Number(target.id)
    )

  if (
    division === undefined
  ) {
    return false
  }

  const name =
    nameInput.value.trim()

  if (
    name === ''
  ) {
    window.alert(
      'Enter a division name.'
    )

    nameInput.focus()

    return false
  }

  const ruleSet =
    ruleSetInput.value as
      DivisionRuleSet

  if (
    ruleSet !== 'THSPA' &&
    ruleSet !== 'THSWPA' &&
    ruleSet !== 'NMAA_BOYS' &&
    ruleSet !== 'NMAA_GIRLS'
  ) {
    window.alert(
      'Select a valid rule set for the division.'
    )

    ruleSetInput.focus()

    return false
  }

  division.name =
    name

  division.ruleSet =
    ruleSet

  return true
}


function saveTeamEdit(
  target: EditTarget,
): boolean {

  const meet =
    getSelectedMeet()

  const nameInput =
    document.querySelector<HTMLInputElement>(
      '#editTeamName'
    )

  const bTeamInput =
    document.querySelector<HTMLInputElement>(
      '#editTeamBTeam'
    )

  if (
    meet === undefined ||
    nameInput === null ||
    bTeamInput === null
  ) {
    return false
  }

  const teamId =
    Number(
      target.id
    )

  const team =
    meet.state.teams.find(
      item =>
        item.id ===
        teamId
    )

  if (
    team === undefined
  ) {
    return false
  }

  const name =
    nameInput.value.trim()

  if (
    name === ''
  ) {
    window.alert(
      'Enter a team name.'
    )

    nameInput.focus()

    return false
  }

  const isBTeam =
    bTeamInput.checked

  const duplicate =
    meet.state.teams.some(
      item =>
        item.id !==
          teamId &&
        item.name
          .trim()
          .toLocaleLowerCase() ===
        name.toLocaleLowerCase() &&
        (item.isBTeam === true) ===
          isBTeam
    )

  if (
    duplicate
  ) {
    window.alert(
      isBTeam
        ? 'A B Team with that name already exists in this meet.'
        : 'A regular team with that name already exists in this meet.'
    )

    nameInput.focus()

    return false
  }

  team.name =
    name

  team.isBTeam =
    isBTeam

  return true
}


function saveLifterEdit(
  target: EditTarget,
): boolean {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return false
  }

  const lifterId =
    Number(
      target.id
    )

  const lifter =
    meet.state.lifters.find(
      item =>
        item.id ===
        lifterId
    )

  const division =
    lifter === undefined
      ? undefined
      : meet.state.divisions.find(
          item =>
            item.id ===
            lifter.divisionId
        )

  const numberInput =
    document.querySelector<HTMLInputElement>(
      '#editLifterNumber'
    )

  const firstInput =
    document.querySelector<HTMLInputElement>(
      '#editLifterFirstName'
    )

  const lastInput =
    document.querySelector<HTMLInputElement>(
      '#editLifterLastName'
    )

  const bodyWeightInput =
    document.querySelector<HTMLInputElement>(
      '#editLifterBodyWeight'
    )

  const classInput =
    document.querySelector<HTMLSelectElement>(
      '#editLifterWeightClass'
    )

  const gradeInput =
    document.querySelector<HTMLInputElement>(
      '#editLifterGrade'
    )

  const equipmentInput =
    document.querySelector<HTMLSelectElement>(
      '#editLifterEquipment'
    )

  const teamStatusInput =
    document.querySelector<HTMLSelectElement>(
      '#editLifterTeamStatus'
    )

  const lifterStatusInput =
    document.querySelector<HTMLSelectElement>(
      '#editLifterStatus'
    )

  if (
    lifter === undefined ||
    division === undefined ||
    numberInput === null ||
    firstInput === null ||
    lastInput === null ||
    bodyWeightInput === null ||
    classInput === null ||
    gradeInput === null ||
    equipmentInput === null ||
    teamStatusInput === null ||
    lifterStatusInput === null
  ) {
    return false
  }

  const lifterNumber =
    Number(
      numberInput.value
    )

  if (
    !Number.isInteger(
      lifterNumber
    ) ||
    lifterNumber <= 0
  ) {
    window.alert(
      'Enter a valid lifter number.'
    )

    numberInput.focus()

    return false
  }

  const duplicateNumber =
    meet.state.lifters.some(
      item =>
        item.id !==
          lifter.id &&
        item.lifterNumber ===
          lifterNumber
    )

  if (
    duplicateNumber
  ) {
    window.alert(
      `Lifter number ${lifterNumber} is already in use.`
    )

    numberInput.focus()

    return false
  }

  const firstName =
    firstInput.value.trim()

  const lastName =
    lastInput.value.trim()

  if (
    firstName === ''
  ) {
    window.alert(
      'Enter the lifter first name.'
    )

    firstInput.focus()

    return false
  }

  if (
    lastName === ''
  ) {
    window.alert(
      'Enter the lifter last name.'
    )

    lastInput.focus()

    return false
  }

  const bodyWeight =
    bodyWeightInput.value.trim() ===
    ''
      ? null
      : Number(
          bodyWeightInput.value
        )

  if (
    bodyWeight !== null &&
    (
      !Number.isFinite(
        bodyWeight
      ) ||
      bodyWeight <= 0
    )
  ) {
    window.alert(
      'Enter a valid body weight.'
    )

    bodyWeightInput.focus()

    return false
  }

  const grade =
    gradeInput === null ||
    gradeInput.value.trim() ===
    ''
      ? null
      : Number(
          gradeInput.value
        )

  if (
    grade !== null &&
    (
      !Number.isInteger(
        grade
      ) ||
      grade < 9 ||
      grade > 12
    )
  ) {
    window.alert(
      'Grade must be 9, 10, 11, or 12.'
    )

    gradeInput.focus()

    return false
  }

  let rules

  try {
    rules =
      getDivisionRules(
        division
      )
  } catch (
    error
  ) {
    window.alert(
      error instanceof Error
        ? error.message
        : 'Unable to determine division rules.'
    )

    return false
  }

  let updated:
    Lifter = {
      ...lifter,
      lifterNumber,
      firstName,
      lastName,
      bodyWeight,
      grade,
      equipmentType:
        equipmentInput.value as
          Lifter['equipmentType'],
      isGuest:
        teamStatusInput.value ===
        'guest',
      isExtraLifter:
        teamStatusInput.value ===
        'bteam',
      status:
        lifterStatusInput.value as
          Lifter['status'],
    }

  const selectedClass =
    classInput.value

  const automaticClass =
    getAutomaticWeightClass(
      bodyWeight,
      rules.weightClasses
    )

  try {
    if (
      selectedClass === '' ||
      (
        selectedClass ===
          automaticClass &&
        !(
          lifter.weightClassSource ===
            'manual' &&
          selectedClass ===
            (
              lifter.weightClass ??
              ''
            )
        )
      )
    ) {
      updated.weightClass =
        automaticClass

      updated.weightClassSource =
        'automatic'
    } else {
      updated =
        assignRegisteredLifterWeightClass(
          updated,
          selectedClass,
          rules
        )
    }
  } catch (
    error
  ) {
    window.alert(
      error instanceof Error
        ? error.message
        : 'Unable to assign the weight class.'
    )

    classInput.focus()

    return false
  }

  Object.assign(
    lifter,
    updated
  )

  registrationDefaults = {
    equipmentType:
      lifter.equipmentType,
  }

  return true
}


function commitActiveEdit(
  renderAfter: boolean = true,
): boolean {

  if (
    activeEdit === null
  ) {
    return true
  }

  const target =
    activeEdit

  let saved =
    false

  switch (
    target.type
  ) {
    case 'meet':
      saved =
        saveMeetEdit(
          target
        )
      break

    case 'division':
      saved =
        saveDivisionEdit(
          target
        )
      break

    case 'team':
      saved =
        saveTeamEdit(
          target
        )
      break

    case 'lifter':
      saved =
        saveLifterEdit(
          target
        )
      break
  }

  if (
    !saved
  ) {
    return false
  }

  clearActiveEdit()

  if (
    renderAfter
  ) {
    renderApp()
  }

  return true
}


function finishActiveEdit(
  promptIfChanged: boolean,
  renderAfter: boolean = true,
): boolean {

  if (
    activeEdit === null
  ) {
    return true
  }

  if (
    promptIfChanged &&
    hasActiveEditChanges()
  ) {
    const saveChanges =
      window.confirm(
        'Save changes? Select OK to save or Cancel to discard the changes.'
      )

    if (
      saveChanges
    ) {
      return commitActiveEdit(
        renderAfter
      )
    }
  }

  clearActiveEdit()

  if (
    renderAfter
  ) {
    renderApp()
  }

  return true
}


function startEdit(
  type: RegistrationEntry,
  id: string | number,
): void {

  if (
    !finishActiveEdit(
      true,
      false
    )
  ) {
    return
  }

  activeEntry =
    null

  if (
    type ===
    'meet'
  ) {
    const meet =
      localMeets.find(
        item =>
          item.state.meet.id ===
          String(id)
      )

    if (
      meet === undefined
    ) {
      return
    }

    selectedMeetId =
      meet.state.meet.id

    selectFirstDivisionForMeet(
      meet
    )
  } else {
    const meet =
      getSelectedMeet()

    if (
      meet === undefined
    ) {
      return
    }

    const numericId =
      Number(id)

    if (
      type ===
      'division'
    ) {
      const division =
        meet.state.divisions.find(
          item =>
            item.id ===
            numericId
        )

      if (
        division === undefined
      ) {
        return
      }

      selectedDivisionId =
        division.id

      selectFirstTeamForDivision(
        meet,
        division.id
      )
    } else if (
      type ===
      'team'
    ) {
      const team =
        getTeamsForSelectedDivision()
          .find(
            item =>
              item.id ===
              numericId
          )

      if (
        team === undefined
      ) {
        return
      }

      selectedTeamId =
        team.id

      selectFirstLifterForSelection(
        meet
      )
    } else {
      const lifter =
        meet.state.lifters.find(
          item =>
            item.id ===
              numericId &&
            item.divisionId ===
              selectedDivisionId &&
            (
              selectedTeamId === null ||
              item.teamId ===
                selectedTeamId
            )
        )

      if (
        lifter === undefined
      ) {
        return
      }

      selectedLifterId =
        lifter.id

      editLifterWeightClassManuallyChanged =
        false
    }
  }

  activeEdit = {
    type,
    id,
  }

  activeEditOriginalSnapshot =
    getEditEntitySnapshot(
      activeEdit
    )

  renderApp()

  const selector =
    type === 'meet'
      ? '#editMeetName'
      : type === 'division'
        ? '#editDivisionName'
        : type === 'team'
          ? '#editTeamName'
          : '#editLifterFirstName'

  focusElement(
    selector
  )
}


function beginNewEntry(
  type: RegistrationEntry,
): void {

  if (
    !finishActiveEdit(
      true,
      false
    )
  ) {
    return
  }

  activeEdit =
    null

  if (
    type === 'division' &&
    getSelectedMeet() ===
      undefined
  ) {
    return
  }

  if (
    type === 'team' &&
    getSelectedDivision() ===
      undefined
  ) {
    return
  }

  if (
    type === 'lifter' &&
    getSelectedTeam() ===
      undefined
  ) {
    return
  }

  activeEntry =
    type

  renderApp()

  const selector =
    type === 'meet'
      ? '#newMeetName'
      : type === 'division'
        ? '#newDivisionName'
        : type === 'team'
          ? '#newTeamName'
          : '#entryFirstName'

  focusElement(
    selector
  )
}


function startMeetEntry():
  void {

  beginNewEntry(
    'meet'
  )
}


function startDivisionEntry():
  void {

  beginNewEntry(
    'division'
  )
}


function startTeamEntry():
  void {

  beginNewEntry(
    'team'
  )
}


function startLifterEntry():
  void {

  beginNewEntry(
    'lifter'
  )
}


function commitNewMeet():
  void {

  const nameInput =
    document.querySelector<HTMLInputElement>(
      '#newMeetName'
    )

  const dateInput =
    document.querySelector<HTMLInputElement>(
      '#newMeetDate'
    )

  const locationInput =
    document.querySelector<HTMLInputElement>(
      '#newMeetLocation'
    )

  const resultEntryInput =
    document.querySelector<HTMLSelectElement>(
      '#newMeetResultEntryMode'
    )

  if (
    nameInput === null ||
    dateInput === null ||
    locationInput === null ||
    resultEntryInput === null
  ) {
    return
  }

  const name =
    nameInput.value.trim()

  if (
    name === ''
  ) {
    nameInput.focus()
    return
  }

  const meetId =
    createMeetId()

  const resultEntryMode =
    resultEntryInput.value as
      ResultEntryMode

  const newMeet:
    LocalMeet = {

      state: {
        meet: {
          id:
            meetId,

          name,

          date:
            dateInput.value,

          location:
            locationInput.value.trim(),

          resultEntryMode:
            resultEntryMode ===
              'all-attempts'
                ? 'all-attempts'
                : 'best-lift-only',
        },

        divisions: [],

        teams: [],

        lifters: [],
      },

      divisionTeams: [],
    }

  localMeets.push(
    newMeet
  )

  selectedMeetId =
    meetId

  selectedDivisionId =
    null

  selectedTeamId =
    null

  selectedLifterId =
    null

  registrationDefaults = {
    equipmentType:
      'equipped',
  }

  activeEntry =
    'meet'

  renderApp()

  flashRow(
    `[data-meet-row="${meetId}"]`
  )

  focusElement(
    '#newMeetName'
  )
}


function commitNewDivision():
  void {

  const meet =
    getSelectedMeet()

  const input =
    document.querySelector<HTMLInputElement>(
      '#newDivisionName'
    )

  if (
    meet === undefined ||
    input === null
  ) {
    return
  }

  const name =
    input.value.trim()

  if (
    name === ''
  ) {
    return
  }

  const ruleSetInput =
    document.querySelector<HTMLSelectElement>(
      '#newDivisionRuleSet'
    )

  const ruleSet =
    ruleSetInput?.value as
      DivisionRuleSet | undefined

  if (
    ruleSet !== 'THSPA' &&
    ruleSet !== 'THSWPA' &&
    ruleSet !== 'NMAA_BOYS' &&
    ruleSet !== 'NMAA_GIRLS'
  ) {
    window.alert(
      'Select a valid rule set for the division.'
    )

    return
  }

  const division:
    Division = {

      id:
        getNextDivisionId(
          meet
        ),

      meetId:
        meet.state.meet.id,

      name,

      ruleSet,
    }

  meet.state.divisions.push(
    division
  )

  selectedDivisionId =
    division.id

  selectedTeamId =
    null

  selectedLifterId =
    null

  activeEntry =
    'division'

  renderApp()

  flashRow(
    `[data-division-row="${division.id}"]`
  )

  focusElement(
    '#newDivisionName'
  )
}


function findTeamByName(
  meet: LocalMeet,
  name: string,
  isBTeam: boolean,
): Team | undefined {

  const normalized =
    name
      .trim()
      .toLocaleLowerCase()

  return meet.state.teams.find(
    team =>
      team.name
        .trim()
        .toLocaleLowerCase() ===
      normalized &&
      (team.isBTeam === true) ===
        isBTeam
  )
}


function commitNewTeam():
  void {

  const meet =
    getSelectedMeet()

  const division =
    getSelectedDivision()

  const input =
    document.querySelector<HTMLInputElement>(
      '#newTeamName'
    )

  const bTeamInput =
    document.querySelector<HTMLInputElement>(
      '#newTeamBTeam'
    )

  if (
    meet === undefined ||
    division === undefined ||
    input === null ||
    bTeamInput === null
  ) {
    return
  }

  const name =
    input.value.trim()

  if (
    name === ''
  ) {
    return
  }

  const isBTeam =
    bTeamInput.checked

  let team =
    findTeamByName(
      meet,
      name,
      isBTeam
    )

  if (
    team === undefined
  ) {
    team = {
      id:
        getNextTeamId(
          meet
        ),

      meetId:
        meet.state.meet.id,

      name,

      region:
        null,

      classification:
        null,

      isBTeam,
    }

    meet.state.teams.push(
      team
    )
  }

  const alreadyAssigned =
    meet.divisionTeams.some(
      item =>
        item.divisionId ===
          division.id &&
        item.teamId ===
          team.id
    )

  if (
    !alreadyAssigned
  ) {
    meet.divisionTeams.push({
      divisionId:
        division.id,

      teamId:
        team.id,
    })
  }

  selectedTeamId =
    team.id

  selectFirstLifterForSelection(
    meet
  )

  activeEntry =
    'team'

  renderApp()

  flashRow(
    `[data-team-row="${team.id}"]`
  )

  focusElement(
    '#newTeamName'
  )
}


function deleteMeet(
  meetId: string,
): void {

  if (
    !finishActiveEdit(
      true,
      false
    )
  ) {
    return
  }

  activeEntry =
    null


  const meetIndex =
    localMeets.findIndex(
      item =>
        item.state.meet.id ===
        meetId
    )

  if (
    meetIndex < 0
  ) {
    return
  }

  const meet =
    localMeets[meetIndex]

  const confirmed =
    window.confirm(
      `Delete meet "${meet.state.meet.name}" and all of its divisions, teams, and lifters?`
    )

  if (
    !confirmed
  ) {
    return
  }

  localMeets.splice(
    meetIndex,
    1
  )

  if (
    selectedMeetId ===
    meetId
  ) {
    selectFirstHierarchy()
  }

  activeEntry =
    null

  renderApp()
}


function deleteDivision(
  divisionId: number,
): void {

  if (
    !finishActiveEdit(
      true,
      false
    )
  ) {
    return
  }

  activeEntry =
    null


  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }

  const division =
    meet.state.divisions.find(
      item =>
        item.id ===
        divisionId
    )

  if (
    division === undefined
  ) {
    return
  }

  const teamIds =
    new Set(
      meet.divisionTeams
        .filter(
          item =>
            item.divisionId ===
            divisionId
        )
        .map(
          item =>
            item.teamId
        )
    )

  const lifterCount =
    meet.state.lifters.filter(
      lifter =>
        lifter.divisionId ===
        divisionId
    ).length

  const confirmed =
    window.confirm(
      `Delete division "${division.name}" and its ${lifterCount} lifter${lifterCount === 1 ? '' : 's'}? Teams used only by this division will also be deleted.`
    )

  if (
    !confirmed
  ) {
    return
  }

  meet.state.lifters =
    meet.state.lifters.filter(
      lifter =>
        lifter.divisionId !==
        divisionId
    )

  meet.state.divisions =
    meet.state.divisions.filter(
      item =>
        item.id !==
        divisionId
    )

  meet.divisionTeams =
    meet.divisionTeams.filter(
      item =>
        item.divisionId !==
        divisionId
    )

  const stillUsedTeamIds =
    new Set(
      meet.divisionTeams.map(
        item =>
          item.teamId
      )
    )

  meet.state.teams =
    meet.state.teams.filter(
      team =>
        !(
          teamIds.has(team.id) &&
          !stillUsedTeamIds.has(
            team.id
          )
        )
    )

  if (
    selectedDivisionId ===
    divisionId
  ) {
    const firstDivision =
      meet.state.divisions[0]

    selectedDivisionId =
      firstDivision?.id ??
      null

    if (
      firstDivision === undefined
    ) {
      selectedTeamId =
        null

      selectedLifterId =
        null
    } else {
      selectFirstTeamForDivision(
        meet,
        firstDivision.id
      )
    }
  }

  activeEntry =
    null

  renderApp()
}


function deleteTeam(
  teamId: number,
): void {

  if (
    !finishActiveEdit(
      true,
      false
    )
  ) {
    return
  }

  activeEntry =
    null


  const meet =
    getSelectedMeet()

  const division =
    getSelectedDivision()

  if (
    meet === undefined
  ) {
    return
  }

  const team =
    meet.state.teams.find(
      item =>
        item.id ===
        teamId
    )

  if (
    team === undefined
  ) {
    return
  }

  const lifterCount =
    meet.state.lifters.filter(
      lifter =>
        lifter.teamId ===
        teamId
    ).length

  const confirmed =
    window.confirm(
      `Delete team "${team.name}" from this meet and delete all ${lifterCount} lifter${lifterCount === 1 ? '' : 's'} assigned to it?`
    )

  if (
    !confirmed
  ) {
    return
  }

  meet.state.lifters =
    meet.state.lifters.filter(
      lifter =>
        lifter.teamId !==
        teamId
    )

  meet.divisionTeams =
    meet.divisionTeams.filter(
      item =>
        item.teamId !==
        teamId
    )

  meet.state.teams =
    meet.state.teams.filter(
      item =>
        item.id !==
        teamId
    )

  if (
    selectedTeamId ===
    teamId
  ) {
    if (
      division === undefined
    ) {
      selectedTeamId =
        null

      selectedLifterId =
        null
    } else {
      selectFirstTeamForDivision(
        meet,
        division.id
      )
    }
  }

  activeEntry =
    null

  renderApp()
}


function deleteLifter(
  lifterId: number,
): void {

  if (
    !finishActiveEdit(
      true,
      false
    )
  ) {
    return
  }

  activeEntry =
    null


  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }

  const lifter =
    meet.state.lifters.find(
      item =>
        item.id ===
        lifterId
    )

  if (
    lifter === undefined
  ) {
    return
  }

  const confirmed =
    window.confirm(
      `Delete lifter #${lifter.lifterNumber} ${lifter.firstName} ${lifter.lastName}?`
    )

  if (
    !confirmed
  ) {
    return
  }

  meet.state.lifters =
    meet.state.lifters.filter(
      item =>
        item.id !==
        lifterId
    )

  if (
    selectedLifterId ===
    lifterId
  ) {
    selectFirstLifterForSelection(
      meet
    )
  }

  activeEntry =
    null

  renderApp()
}


function getTeamsForDivision(
  meet: LocalMeet,
  divisionId: number,
): Team[] {

  const teamIds =
    new Set(
      meet.divisionTeams
        .filter(
          item =>
            item.divisionId ===
            divisionId
        )
        .map(
          item =>
            item.teamId
        )
    )

  return meet.state.teams
    .filter(
      team =>
        teamIds.has(
          team.id
        )
    )
    .sort(
      (a, b) => {
        const byName =
          a.name.localeCompare(
            b.name
          )

        if (
          byName !== 0
        ) {
          return byName
        }

        return Number(
          a.isBTeam === true
        ) -
          Number(
            b.isBTeam === true
          )
      }
    )
}


function getTeamsForSelectedDivision():
  Team[] {

  const meet =
    getSelectedMeet()

  const division =
    getSelectedDivision()

  if (
    meet === undefined ||
    division === undefined
  ) {
    return []
  }

  return getTeamsForDivision(
    meet,
    division.id
  )
}


function renderNavigation():
  string {

  return `
    <nav class="main-nav">

      <button
        id="navRegistration"
        type="button"
        class="nav-item ${
          currentPage ===
          'registration'
            ? 'active'
            : ''
        }"
      >
        Registration
      </button>

      <button
        id="navCompetition"
        type="button"
        class="nav-item ${
          currentPage ===
          'competition'
            ? 'active'
            : ''
        }"
      >
        Competition
      </button>

      <button
        type="button"
        class="nav-item"
        disabled
      >
        Standings
      </button>

      <button
        type="button"
        class="nav-item"
        disabled
      >
        Best Lifters
      </button>

      <button
        type="button"
        class="nav-item"
        disabled
      >
        Reports
      </button>

      <button
        id="shortcutHelp"
        type="button"
        class="shortcut-help-button"
      >
        Shortcut Help
      </button>

    </nav>
  `
}


function renderShortcutHelpDialog():
  string {

  if (
    currentPage ===
    'competition'
  ) {
    return `
      <dialog
        id="shortcutHelpDialog"
        class="shortcut-help-dialog"
      >
        <div class="shortcut-help-title-row">
          <strong>Competition Entry Help</strong>

          <button
            id="closeShortcutHelp"
            type="button"
            class="shortcut-help-close"
            aria-label="Close shortcut help"
          >
            ×
          </button>
        </div>

        <div class="shortcut-help-grid">
          <div class="shortcut-help-group">
            <strong>Result Entry</strong>
            <span><kbd>Tab</kbd> / <kbd>Shift+Tab</kbd> move between fields</span>
            <span><kbd>Enter</kbd> moves to the same result field on the next lifter</span>
            <span>Result changes are applied immediately</span>
          </div>

          <div class="shortcut-help-group">
            <strong>All Attempts</strong>
            <span><kbd>Space</kbd> cycles Unknown → Good → Failed</span>
            <span><kbd>G</kbd> Good, <kbd>R</kbd> Failed, <kbd>W</kbd> Unknown</span>
            <span>Arrow keys move between weight-entry boxes</span>
            <span>The best lift is the highest attempt marked Good</span>
          </div>

          <div class="shortcut-help-group">
            <strong>Lifter Status</strong>
            <span><kbd>A</kbd> Active; <kbd>B</kbd> toggles Bombed / Active</span>
            <span><kbd>S</kbd> toggles Scratched / Active; <kbd>Q</kbd> toggles Disqualified / Active</span>
            <span>Three failed attempts in one lift automatically sets Bombed</span>
          </div>

          <div class="shortcut-help-group">
            <strong>Filters</strong>
            <span>Use the Division and Weight Class tabs above the grid</span>
            <span>All Weight Classes shows every class in the selected division</span>
            <span>The meet Result Entry mode on Registration controls which grid is shown</span>
          </div>
        </div>
      </dialog>
    `
  }

  return `
    <dialog
      id="shortcutHelpDialog"
      class="shortcut-help-dialog"
    >
      <div class="shortcut-help-title-row">
        <strong>Registration Shortcut Keys</strong>

        <button
          id="closeShortcutHelp"
          type="button"
          class="shortcut-help-close"
          aria-label="Close shortcut help"
        >
          ×
        </button>
      </div>

      <div class="shortcut-help-grid">
        <div class="shortcut-help-group">
          <strong>Move / Add</strong>
          <span><kbd>m</kbd> Meets</span>
          <span><kbd>mm</kbd> Add Meet</span>
          <span><kbd>d</kbd> Divisions</span>
          <span><kbd>dd</kbd> Add Division</span>
          <span><kbd>t</kbd> Teams / All Teams</span>
          <span><kbd>tt</kbd> Add Team</span>
          <span><kbd>l</kbd> Lifters</span>
          <span><kbd>ll</kbd> Add Lifter</span>
        </div>

        <div class="shortcut-help-group">
          <strong>Focused Lifter</strong>
          <span><kbd>a</kbd> Active</span>
          <span><kbd>b</kbd> Toggle Bombed / Active</span>
          <span><kbd>s</kbd> Toggle Scratched / Active</span>
          <span><kbd>q</kbd> Toggle Disqualified / Active</span>
          <span><kbd>e</kbd> Equipped</span>
          <span><kbd>u</kbd> Unequipped</span>
          <span><kbd>w</kbd> Enter BWT</span>
          <span><kbd>3 digits</kbd> Set BWT directly (for example, 094)</span>
        </div>

        <div class="shortcut-help-group">
          <strong>Row Navigation</strong>
          <span><kbd>↑</kbd> / <kbd>↓</kbd> Move selection</span>
          <span><kbd>Enter</kbd> Edit focused row</span>
          <span>Double-click a row to edit it</span>
        </div>
      </div>

      <p class="shortcut-help-note">
        Lifter shortcuts apply when the lifter row has keyboard focus (black outline).
        Q means Disqualified. D is reserved exclusively for moving to Divisions.
      </p>
    </dialog>
  `
}


function getResultEntryModeLabel(
  resultEntryMode: ResultEntryMode,
): string {

  return resultEntryMode ===
    'all-attempts'
      ? 'All Attempts'
      : 'Best Lift'
}


function renderMeetRows():
  string {

  const rows =
    localMeets
      .map(
        item => {

          const meet =
            item.state.meet

          const selected =
            meet.id ===
            selectedMeetId

          if (
            isEditingEntity(
              'meet',
              meet.id
            )
          ) {
            return `
              <div
                class="selector-row selector-row-with-actions meet-selector-row editing-row selected"
                data-meet-row="${escapeHtml(meet.id)}"
                data-edit-row="meet"
              >
                <div class="meet-entry-fields edit-fields">
                  <input
                    id="editMeetName"
                    type="text"
                    value="${escapeHtml(meet.name)}"
                    autocomplete="off"
                    aria-label="Meet name"
                  >

                  <input
                    id="editMeetDate"
                    type="date"
                    value="${escapeHtml(meet.date)}"
                    aria-label="Meet date"
                  >

                  <input
                    id="editMeetLocation"
                    type="text"
                    value="${escapeHtml(meet.location)}"
                    autocomplete="off"
                    aria-label="Meet location"
                  >

                  <select
                    id="editMeetResultEntryMode"
                    aria-label="Meet result entry mode"
                  >
                    <option
                      value="best-lift-only"
                      ${
                        meet.resultEntryMode ===
                        'best-lift-only'
                          ? 'selected'
                          : ''
                      }
                    >
                      Best Lift
                    </option>

                    <option
                      value="all-attempts"
                      ${
                        meet.resultEntryMode ===
                        'all-attempts'
                          ? 'selected'
                          : ''
                      }
                    >
                      All Attempts
                    </option>
                  </select>
                </div>

                <div></div>
                <div></div>
              </div>
            `
          }

          return `
            <div
              class="selector-row selector-row-with-actions meet-selector-row ${
                selected
                  ? 'selected'
                  : ''
              }"
              data-meet-row="${escapeHtml(meet.id)}"
              tabindex="0"
            >

              <button
                type="button"
                class="selector-button meet-selector-button"
                data-select-meet="${escapeHtml(meet.id)}"
                tabindex="-1"
              >
                <span class="meet-row-name">
                  ${escapeHtml(meet.name)}
                </span>

                <span class="meet-row-date">
                  ${
                    meet.date === ''
                      ? '—'
                      : escapeHtml(
                          meet.date
                        )
                  }
                </span>

                <span class="meet-row-location">
                  ${
                    meet.location === ''
                      ? '—'
                      : escapeHtml(
                          meet.location
                        )
                  }
                </span>

                <span class="meet-row-mode">
                  ${
                    getResultEntryModeLabel(
                      meet.resultEntryMode
                    )
                  }
                </span>
              </button>

              <button
                type="button"
                class="row-edit"
                data-edit-entity="meet"
                data-edit-id="${escapeHtml(meet.id)}"
                data-open-edit="meet"
                title="Edit meet"
                aria-label="Edit meet ${escapeHtml(meet.name)}"
                tabindex="-1"
              >
                ✎
              </button>

              <button
                type="button"
                class="row-delete"
                data-delete-meet="${escapeHtml(meet.id)}"
                title="Delete meet"
                aria-label="Delete meet ${escapeHtml(meet.name)}"
                tabindex="-1"
              >
                🗑
              </button>

            </div>
          `
        }
      )
      .join('')

  return `
    ${rows}

    ${
      activeEntry ===
      'meet'
        ? `
          <div
            class="quick-entry-row meet-entry-row"
            data-entry-row="meet"
          >
            <div class="meet-entry-fields">
              <input
                id="newMeetName"
                type="text"
                placeholder="Meet name"
                autocomplete="off"
                aria-label="New meet name"
              >

              <input
                id="newMeetDate"
                type="date"
                aria-label="New meet date"
              >

              <input
                id="newMeetLocation"
                type="text"
                placeholder="Location"
                autocomplete="off"
                aria-label="New meet location"
              >

              <select
                id="newMeetResultEntryMode"
                aria-label="New meet result entry mode"
              >
                <option value="best-lift-only">
                  Best Lift
                </option>
                <option value="all-attempts">
                  All Attempts
                </option>
              </select>
            </div>
          </div>
        `
        : ''
    }
  `
}


function getDivisionRuleSetLabel(
  ruleSet: DivisionRuleSet | undefined,
): string {

  switch (
    ruleSet
  ) {
    case 'THSPA':
      return 'THSPA'

    case 'THSWPA':
      return 'THSWPA'

    case 'NMAA_BOYS':
      return 'NMAA Boys'

    case 'NMAA_GIRLS':
      return 'NMAA Girls'

    default:
      return 'Rules required'
  }
}


function renderDivisionRuleSetOptions(
  selectedRuleSet: DivisionRuleSet | undefined,
): string {

  const options:
    Array<{
      value: DivisionRuleSet
      label: string
    }> = [
      {
        value: 'THSPA',
        label: 'THSPA',
      },
      {
        value: 'THSWPA',
        label: 'THSWPA',
      },
      {
        value: 'NMAA_BOYS',
        label: 'NMAA Boys',
      },
      {
        value: 'NMAA_GIRLS',
        label: 'NMAA Girls',
      },
    ]

  return options
    .map(
      option => `
        <option
          value="${option.value}"
          ${
            option.value ===
            selectedRuleSet
              ? 'selected'
              : ''
          }
        >
          ${option.label}
        </option>
      `
    )
    .join('')
}


function renderDivisionRows():
  string {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return `
      <div class="empty-column">
        Select or create a meet.
      </div>
    `
  }

  const rows =
    meet.state.divisions
      .map(
        division => {

          const selected =
            division.id ===
            selectedDivisionId

          if (
            isEditingEntity(
              'division',
              division.id
            )
          ) {
            return `
              <div
                class="selector-row selector-row-with-actions editing-row selected"
                data-division-row="${division.id}"
                data-edit-row="division"
              >
                <div class="division-entry-fields edit-fields">
                  <input
                    id="editDivisionName"
                    type="text"
                    value="${escapeHtml(division.name)}"
                    autocomplete="off"
                    aria-label="Division name"
                  >

                  <select
                    id="editDivisionRuleSet"
                    aria-label="Division rule set"
                  >
                    ${
                      renderDivisionRuleSetOptions(
                        division.ruleSet
                      )
                    }
                  </select>
                </div>

                <div></div>
                <div></div>
              </div>
            `
          }

          const detail =
            getDivisionRuleSetLabel(
              division.ruleSet
            )

          return `
            <div
              class="selector-row selector-row-with-actions ${
                selected
                  ? 'selected'
                  : ''
              }"
              data-division-row="${division.id}"
              tabindex="0"
            >

              <button
                type="button"
                class="selector-button division-selector-button"
                data-select-division="${division.id}"
                tabindex="-1"
              >
                <span class="selector-button-main">
                  ${
                    escapeHtml(
                      division.name
                    )
                  }
                </span>

                ${
                  detail === ''
                    ? ''
                    : `
                      <span class="selector-button-detail">
                        ${detail}
                      </span>
                    `
                }
              </button>

              <button
                type="button"
                class="row-edit"
                data-edit-entity="division"
                data-edit-id="${division.id}"
                data-open-edit="division"
                title="Edit division"
                aria-label="Edit division ${escapeHtml(division.name)}"
                tabindex="-1"
              >
                ✎
              </button>

              <button
                type="button"
                class="row-delete"
                data-delete-division="${division.id}"
                title="Delete division"
                aria-label="Delete division ${escapeHtml(division.name)}"
                tabindex="-1"
              >
                🗑
              </button>

            </div>
          `
        }
      )
      .join('')

  return `
    ${rows}

    ${
      activeEntry ===
      'division'
        ? `
          <div
            class="quick-entry-row division-entry-row"
            data-entry-row="division"
          >

            <div class="division-entry-fields">

              <input
                id="newDivisionName"
                type="text"
                placeholder="Division name"
                autocomplete="off"
                aria-label="New division name"
              >

              <select
                id="newDivisionRuleSet"
                aria-label="Division rule set"
              >
                ${
                  renderDivisionRuleSetOptions(
                    'THSPA'
                  )
                }
              </select>

            </div>

          </div>
        `
        : ''
    }
  `
}


function renderTeamRows():
  string {

  const meet =
    getSelectedMeet()

  const division =
    getSelectedDivision()

  if (
    meet === undefined
  ) {
    return `
      <div class="empty-column">
        Select or create a meet.
      </div>
    `
  }

  if (
    division === undefined
  ) {
    return `
      <div class="empty-column">
        Select a division to
        view its teams.
      </div>
    `
  }

  const teams =
    getTeamsForSelectedDivision()

  const rows =
    teams
      .map(
        team => {

          const selected =
            team.id ===
            selectedTeamId

          if (
            isEditingEntity(
              'team',
              team.id
            )
          ) {
            return `
              <div
                class="selector-row selector-row-with-actions editing-row selected"
                data-team-row="${team.id}"
                data-edit-row="team"
              >
                <div class="team-edit-fields">
                  <input
                    id="editTeamName"
                    class="row-edit-input"
                    type="text"
                    value="${escapeHtml(team.name)}"
                    autocomplete="off"
                    aria-label="Team name"
                  >

                  <label class="team-b-option">
                    <input
                      id="editTeamBTeam"
                      type="checkbox"
                      ${
                        team.isBTeam === true
                          ? 'checked'
                          : ''
                      }
                    >
                    BTeam
                  </label>
                </div>

                <div></div>
                <div></div>
              </div>
            `
          }

          return `
            <div
              class="selector-row selector-row-with-actions ${
                selected
                  ? 'selected'
                  : ''
              }"
              data-team-row="${team.id}"
              tabindex="0"
            >

              <button
                type="button"
                class="selector-button team-selector-button"
                data-select-team="${team.id}"
                tabindex="-1"
              >
                <span class="team-name">
                  ${escapeHtml(team.name)}
                </span>
                <span class="selector-button-detail">
                  ${team.isBTeam === true ? 'BTeam' : 'ATeam'}
                </span>
              </button>

              <button
                type="button"
                class="row-edit"
                data-edit-entity="team"
                data-edit-id="${team.id}"
                data-open-edit="team"
                title="Edit team"
                aria-label="Edit team ${escapeHtml(team.name)}"
                tabindex="-1"
              >
                ✎
              </button>

              <button
                type="button"
                class="row-delete"
                data-delete-team="${team.id}"
                title="Delete team"
                aria-label="Delete team ${escapeHtml(team.name)}"
                tabindex="-1"
              >
                🗑
              </button>

            </div>
          `
        }
      )
      .join('')

  const allTeamsSelected =
    selectedTeamId ===
    null

  const allTeamsLifterCount =
    meet.state.lifters.filter(
      lifter =>
        lifter.divisionId ===
        division.id
    ).length

  return `
    <div
      class="selector-row selector-row-with-actions all-teams-row ${
        allTeamsSelected
          ? 'selected'
          : ''
      }"
      data-all-teams-row
      tabindex="0"
    >
      <button
        type="button"
        class="selector-button"
        data-select-all-teams
        tabindex="-1"
      >
        <span class="team-name">
          All Teams
        </span>
        <span class="selector-button-detail">
          ${allTeamsLifterCount} lifters
        </span>
      </button>

      <div></div>
      <div></div>
    </div>

    ${rows}

    ${
      activeEntry ===
      'team'
        ? `
          <div
            class="quick-entry-row team-entry-row"
            data-entry-row="team"
          >
            <div class="team-entry-fields">
              <input
                id="newTeamName"
                type="text"
                placeholder="Team name"
                autocomplete="off"
                aria-label="New or existing team name"
              >

              <label class="team-b-option">
                <input
                  id="newTeamBTeam"
                  type="checkbox"
                >
                BTeam
              </label>
            </div>
          </div>
        `
        : ''
    }
  `
}


function renderRegistrationSidebar():
  string {

  const meet =
    getSelectedMeet()

  const division =
    getSelectedDivision()

  return `
    <div class="registration-sidebar">

      <section
        class="workspace-panel registration-sidebar-panel meet-panel"
      >

        <div class="column-heading">
          <div>
            <strong>Meets</strong>

            <span class="item-count">
              ${localMeets.length}
            </span>
          </div>

          <button
            id="addMeet"
            type="button"
            class="compact-button"
            data-open-entry="meet"
          >
            + Add
          </button>
        </div>

        <div class="selector-list sidebar-list">
          ${renderMeetRows()}
        </div>

      </section>


      <section
        class="workspace-panel registration-sidebar-panel division-panel"
      >

        <div class="column-heading">
          <div>
            <strong>Divisions</strong>

            <span class="item-count">
              ${
                meet
                  ?.state
                  .divisions
                  .length ??
                0
              }
            </span>
          </div>

          <button
            id="addDivision"
            type="button"
            class="compact-button"
            data-open-entry="division"
            ${
              meet === undefined
                ? 'disabled'
                : ''
            }
          >
            + Add
          </button>
        </div>

        <div class="selector-list sidebar-list">
          ${renderDivisionRows()}
        </div>

      </section>


      <section
        class="workspace-panel registration-sidebar-panel team-panel"
      >

        <div class="column-heading">
          <div>
            <strong>Teams</strong>

            <span class="item-count">
              ${
                getTeamsForSelectedDivision()
                  .length
              }
            </span>
          </div>

          <button
            id="addTeam"
            type="button"
            class="compact-button"
            data-open-entry="team"
            ${
              division === undefined
                ? 'disabled'
                : ''
            }
          >
            + Add
          </button>
        </div>

        <div class="selector-list sidebar-list">
          ${renderTeamRows()}
        </div>

      </section>

    </div>
  `
}


function getLifterReadinessLabel(
  lifter: Lifter,
  meet: LocalMeet,
): string {

  if (
    lifter.status !==
    'active'
  ) {
    return 'Not Competing'
  }

  const division =
    meet.state.divisions.find(
      item =>
        item.id ===
        lifter.divisionId
    )

  if (
    division === undefined
  ) {
    return 'Needs Attention'
  }

  try {

    const rules =
      getDivisionRules(
          division
        )

    const readiness =
      validateLifterCompetitionReadiness(
        lifter,
        meet.state,
        rules
      )

    return readiness.ready
      ? 'Ready'
      : 'Needs Attention'

  } catch {

    return 'Needs Attention'
  }
}


function getLifterSelectionLabel(
  meet: LocalMeet,
): string {

  const division =
    getSelectedDivision()

  const team =
    getSelectedTeam()

  if (
    division !== undefined &&
    team !== undefined
  ) {
    return (
      team.name +
      (
        team.isBTeam === true
          ? ' (B Team)'
          : ''
      ) +
      ' · ' +
      division.name
    )
  }

  if (
    division !== undefined
  ) {
    return (
      'All Teams · ' +
      division.name
    )
  }

  return meet.state.meet.name
}


function getVisibleLifters(
  meet: LocalMeet,
): Lifter[] {

  const division =
    getSelectedDivision()

  const team =
    getSelectedTeam()

  return meet.state.lifters.filter(
    lifter => {

      if (
        division === undefined
      ) {
        return true
      }

      if (
        lifter.divisionId !==
        division.id
      ) {
        return false
      }

      if (
        team === undefined
      ) {
        return true
      }

      return lifter.teamId ===
        team.id
    }
  )
}


function shouldShowLifterTeamColumn():
  boolean {

  return (
    selectedDivisionId !== null &&
    selectedTeamId === null
  )
}


function getLifterTeam(
  meet: LocalMeet,
  lifter: Lifter,
): Team | undefined {

  if (
    lifter.teamId ===
    null
  ) {
    return undefined
  }

  return meet.state.teams.find(
    team =>
      team.id ===
      lifter.teamId
  )
}


function getLifterTeamName(
  meet: LocalMeet,
  lifter: Lifter,
): string {

  return (
    getLifterTeam(
      meet,
      lifter
    )?.name ??
    'Unattached'
  )
}


function getIndividualTeamStatusValue(
  lifter: Lifter,
): TeamStatusValue {

  if (
    lifter.isGuest
  ) {
    return 'guest'
  }

  if (
    lifter.isExtraLifter
  ) {
    return 'bteam'
  }

  return 'regular'
}


function getLifterTeamStatusCode(
  meet: LocalMeet,
  lifter: Lifter,
): string {

  if (
    lifter.isGuest
  ) {
    return 'G'
  }

  if (
    lifter.isExtraLifter
  ) {
    return 'B'
  }

  if (
    getLifterTeam(
      meet,
      lifter
    )?.isBTeam ===
    true
  ) {
    return 'BT'
  }

  return ''
}


function getLifterStatusCode(
  lifter: Lifter,
): string {

  switch (
    lifter.status
  ) {
    case 'bombed':
      return 'BO'

    case 'scratched':
      return 'SC'

    case 'disqualified':
      return 'DQ'

    default:
      return ''
  }
}


function renderTeamStatusOptions(
  meet: LocalMeet,
  lifter: Lifter,
): string {

  const selected =
    getIndividualTeamStatusValue(
      lifter
    )

  const inheritedBTeam =
    getLifterTeam(
      meet,
      lifter
    )?.isBTeam ===
    true

  return `
    <option
      value="regular"
      ${selected === 'regular' ? 'selected' : ''}
    >
      ${inheritedBTeam ? 'BTeam (Team)' : 'Regular'}
    </option>
    <option
      value="bteam"
      ${selected === 'bteam' ? 'selected' : ''}
    >
      BTeam
    </option>
    <option
      value="guest"
      ${selected === 'guest' ? 'selected' : ''}
    >
      GuestLifter
    </option>
  `
}


function renderLifterStatusOptions(
  status: Lifter['status'],
): string {

  return `
    <option value="active" ${status === 'active' ? 'selected' : ''}>Active</option>
    <option value="bombed" ${status === 'bombed' ? 'selected' : ''}>Bombed</option>
    <option value="scratched" ${status === 'scratched' ? 'selected' : ''}>Scratched</option>
    <option value="disqualified" ${status === 'disqualified' ? 'selected' : ''}>Disqualified</option>
  `
}


function shouldShowLifterGradeColumn(
  meet: LocalMeet,
): boolean {

  if (
    activeEntry ===
      'lifter' ||
    activeEdit?.type ===
      'lifter'
  ) {
    return true
  }

  return getVisibleLifters(
    meet
  ).some(
    lifter =>
      lifter.grade !==
      null
  )
}


function getLifterGridClassNames(
  meet: LocalMeet,
): string {

  const classes:
    string[] =
      []

  if (
    shouldShowLifterTeamColumn()
  ) {
    classes.push(
      'with-team-column'
    )
  }

  if (
    shouldShowLifterGradeColumn(
      meet
    )
  ) {
    classes.push(
      'with-grade-column'
    )
  }

  return classes.join(' ')
}


function getLifterStatusRowClass(
  lifter: Lifter,
): string {

  switch (
    lifter.status
  ) {
    case 'bombed':
      return 'lifter-status-bombed'

    case 'scratched':
      return 'lifter-status-scratched'

    case 'disqualified':
      return 'lifter-status-disqualified'

    default:
      return ''
  }
}


function compareOptionalNumbers(
  a: number | null,
  b: number | null,
): number {

  if (
    a === null &&
    b === null
  ) {
    return 0
  }

  if (
    a === null
  ) {
    return 1
  }

  if (
    b === null
  ) {
    return -1
  }

  return a - b
}


function getWeightClassSortValue(
  value: string | null,
): number {

  if (
    value === null ||
    value === ''
  ) {
    return Number.POSITIVE_INFINITY
  }

  if (
    value.toLocaleUpperCase() ===
    'SHW'
  ) {
    return 10000
  }

  const parsed =
    Number.parseFloat(
      value
    )

  return Number.isFinite(
    parsed
  )
    ? parsed
    : 9999
}


function compareVisibleLifters(
  meet: LocalMeet,
  a: Lifter,
  b: Lifter,
  column: LifterSortColumn,
): number {

  switch (
    column
  ) {
    case 'lifterNumber':
      return a.lifterNumber -
        b.lifterNumber

    case 'lifter': {
      const lastNameResult =
        a.lastName.localeCompare(
          b.lastName
        )

      return lastNameResult !== 0
        ? lastNameResult
        : a.firstName.localeCompare(
            b.firstName
          )
    }

    case 'firstName':
      return a.firstName.localeCompare(
        b.firstName
      )

    case 'lastName':
      return a.lastName.localeCompare(
        b.lastName
      )

    case 'team':
      return getLifterTeamName(
        meet,
        a
      ).localeCompare(
        getLifterTeamName(
          meet,
          b
        )
      )

    case 'bodyWeight':
      return compareOptionalNumbers(
        a.bodyWeight,
        b.bodyWeight
      )

    case 'weightClass':
      return getWeightClassSortValue(
        a.weightClass
      ) -
        getWeightClassSortValue(
          b.weightClass
        )

    case 'grade':
      return compareOptionalNumbers(
        a.grade,
        b.grade
      )

    case 'equipmentType':
      return a.equipmentType.localeCompare(
        b.equipmentType
      )

    case 'teamStatus':
      return getLifterTeamStatusCode(
        meet,
        a
      ).localeCompare(
        getLifterTeamStatusCode(
          meet,
          b
        )
      )

    case 'lifterStatus':
      return getLifterStatusCode(
        a
      ).localeCompare(
        getLifterStatusCode(
          b
        )
      )

    case 'readiness':
      return getLifterReadinessLabel(
        a,
        meet
      ).localeCompare(
        getLifterReadinessLabel(
          b,
          meet
        )
      )
  }

  return 0
}


function getSortedVisibleLifters(
  meet: LocalMeet,
): Lifter[] {

  return [...getVisibleLifters(
    meet
  )].sort(
    (a, b) => {
      const result =
        compareVisibleLifters(
          meet,
          a,
          b,
          lifterSortColumn
        )

      const ordered =
        lifterSortAscending
          ? result
          : -result

      return ordered !==
        0
          ? ordered
          : a.lifterNumber -
            b.lifterNumber
    }
  )
}


function renderLifterSortHeader(
  label: string,
  column: LifterSortColumn,
): string {

  const active =
    lifterSortColumn ===
    column

  const wrappedLabel =
    escapeHtml(
      label
    ).replaceAll(
      ' ',
      '<br>'
    )

  return `
    <button
      type="button"
      class="lifter-sort-button ${active ? 'active' : ''}"
      data-lifter-sort="${column}"
    >
      <span class="sort-label">${wrappedLabel}</span>
      <span class="sort-indicator">${
        active
          ? (lifterSortAscending ? '▲' : '▼')
          : ''
      }</span>
    </button>
  `
}


function renderLifterEditRow(
  meet: LocalMeet,
  lifter: Lifter,
): string {

  const showTeamColumn =
    shouldShowLifterTeamColumn()

  const showGradeColumn =
    shouldShowLifterGradeColumn(
      meet
    )

  return `
    <div
      class="registration-row registered-row selected editing-row ${getLifterGridClassNames(meet)} ${getLifterStatusRowClass(lifter)}"
      data-lifter-row="${lifter.id}"
      data-edit-row="lifter"
    >

      <input
        id="editLifterNumber"
        class="grid-input number-input"
        type="number"
        min="1"
        value="${lifter.lifterNumber}"
        aria-label="Lifter number"
      >

      <div class="lifter-name-edit-fields">
        <input
          id="editLifterFirstName"
          class="grid-input"
          type="text"
          value="${escapeHtml(lifter.firstName)}"
          autocomplete="off"
          aria-label="First name"
          placeholder="First"
        >

        <input
          id="editLifterLastName"
          class="grid-input"
          type="text"
          value="${escapeHtml(lifter.lastName)}"
          autocomplete="off"
          aria-label="Last name"
          placeholder="Last"
        >
      </div>

      ${
        showTeamColumn
          ? `
            <div
              class="entry-fixed-cell"
              title="${escapeHtml(getLifterTeamName(meet, lifter))}"
            >
              ${escapeHtml(getLifterTeamName(meet, lifter))}
            </div>
          `
          : ''
      }

      <input
        id="editLifterBodyWeight"
        class="grid-input number-input"
        type="number"
        min="0"
        step="0.1"
        value="${lifter.bodyWeight ?? ''}"
        aria-label="Body weight"
      >

      <select
        id="editLifterWeightClass"
        class="grid-select"
        aria-label="Weight class"
      >
        ${renderEntryWeightClassOptions(
          meet,
          lifter.divisionId,
          lifter.weightClass ??
          ''
        )}
      </select>

      <div
        id="editLifterCoefficient"
        class="cell-coefficient"
      >
        ${formatBodyWeightCoefficient(
          getLifterBodyWeightCoefficient(
            meet,
            lifter
          )
        )}
      </div>

      ${
        showGradeColumn
          ? `
            <input
              id="editLifterGrade"
              class="grid-input number-input"
              type="text"
              inputmode="numeric"
              maxlength="2"
              pattern="9|10|11|12"
              value="${lifter.grade ?? ''}"
              aria-label="Grade (9 through 12)"
            >
          `
          : ''
      }

      <select
        id="editLifterEquipment"
        class="grid-select"
        aria-label="Equipment"
      >
        <option value="equipped" ${lifter.equipmentType === 'equipped' ? 'selected' : ''}>Equipped</option>
        <option value="unequipped" ${lifter.equipmentType === 'unequipped' ? 'selected' : ''}>Unequipped</option>
      </select>

      <select
        id="editLifterTeamStatus"
        class="grid-select status-select"
        aria-label="Team status"
      >
        ${renderTeamStatusOptions(
          meet,
          lifter
        )}
      </select>

      <select
        id="editLifterStatus"
        class="grid-select status-select"
        aria-label="Lifter status"
      >
        ${renderLifterStatusOptions(
          lifter.status
        )}
      </select>

      <div
        id="editLifterValidationStatus"
        class="readiness editing-status"
      >
        Editing
      </div>

      <div></div>
      <div></div>

    </div>
  `
}


function renderRegisteredLifterRows(
  meet: LocalMeet,
): string {

  const showTeamColumn =
    shouldShowLifterTeamColumn()

  const showGradeColumn =
    shouldShowLifterGradeColumn(
      meet
    )

  const lifters =
    getSortedVisibleLifters(
      meet
    )

  if (
    lifters.length ===
    0
  ) {
    return ''
  }

  return lifters
    .map(
      lifter => {

        if (
          isEditingEntity(
            'lifter',
            lifter.id
          )
        ) {
          return renderLifterEditRow(
            meet,
            lifter
          )
        }

        const readiness =
          getLifterReadinessLabel(
            lifter,
            meet
          )

        return `
          <div
            class="registration-row registered-row ${getLifterGridClassNames(meet)} ${getLifterStatusRowClass(lifter)} ${
              lifter.id ===
              selectedLifterId
                ? 'selected'
                : ''
            }"
            data-lifter-row="${lifter.id}"
            data-select-lifter="${lifter.id}"
            tabindex="0"
          >

            <div class="cell-number">
              ${lifter.lifterNumber}
            </div>

            <div class="cell-name">
              ${escapeHtml(lifter.lastName)}, ${escapeHtml(lifter.firstName)}
            </div>

            ${
              showTeamColumn
                ? `
                  <div
                    class="cell-text"
                    title="${escapeHtml(getLifterTeamName(meet, lifter))}"
                  >
                    ${escapeHtml(getLifterTeamName(meet, lifter))}
                  </div>
                `
                : ''
            }

            <div class="cell-number">
              ${lifter.bodyWeight ?? ''}
            </div>

            <div class="cell-class">
              ${escapeHtml(lifter.weightClass ?? '')}
            </div>

            <div class="cell-coefficient">
              ${formatBodyWeightCoefficient(
                getLifterBodyWeightCoefficient(
                  meet,
                  lifter
                )
              )}
            </div>

            ${
              showGradeColumn
                ? `
                  <div class="cell-number">
                    ${lifter.grade ?? ''}
                  </div>
                `
                : ''
            }

            <div class="cell-text">
              ${lifter.equipmentType === 'equipped' ? 'Eq' : 'UnEq'}
            </div>

            <div class="cell-team-status">
              ${getLifterTeamStatusCode(
                meet,
                lifter
              )}
            </div>

            <div class="cell-lifter-status">
              ${getLifterStatusCode(
                lifter
              )}
            </div>

            <div
              class="readiness ${
                readiness === 'Ready'
                  ? 'ready'
                  : readiness === 'Not Competing'
                    ? 'not-competing'
                    : 'attention'
              }"
            >
              ${readiness}
            </div>

            <button
              type="button"
              class="row-edit lifter-edit"
              data-edit-entity="lifter"
              data-edit-id="${lifter.id}"
              data-open-edit="lifter"
              title="Edit lifter"
              aria-label="Edit lifter ${escapeHtml(lifter.firstName)} ${escapeHtml(lifter.lastName)}"
              tabindex="-1"
            >
              ✎
            </button>

            <button
              type="button"
              class="row-delete lifter-delete"
              data-delete-lifter="${lifter.id}"
              title="Delete lifter"
              aria-label="Delete lifter ${escapeHtml(lifter.firstName)} ${escapeHtml(lifter.lastName)}"
              tabindex="-1"
            >
              🗑
            </button>

          </div>
        `
      }
    )
    .join('')
}


function renderRegistrationEntryRow(
  meet: LocalMeet,
): string {

  const division =
    getSelectedDivision()

  const team =
    getSelectedTeam()

  if (
    division === undefined ||
    team === undefined
  ) {
    return ''
  }

  const showGradeColumn =
    shouldShowLifterGradeColumn(
      meet
    )

  return `
    <div
      class="registration-row registration-entry-row ${getLifterGridClassNames(meet)}"
      data-entry-row="lifter"
    >

      <input
        id="entryLifterNumber"
        class="grid-input number-input"
        type="number"
        min="1"
        value="${getNextUnusedLifterNumber(meet.state)}"
        aria-label="Lifter number"
      >

      <div class="lifter-name-edit-fields">
        <input
          id="entryFirstName"
          class="grid-input"
          type="text"
          autocomplete="off"
          aria-label="First name"
          placeholder="First"
        >

        <input
          id="entryLastName"
          class="grid-input"
          type="text"
          autocomplete="off"
          aria-label="Last name"
          placeholder="Last"
        >
      </div>

      ${
        shouldShowLifterTeamColumn()
          ? `
            <div class="entry-fixed-cell">
              ${escapeHtml(team.name)}
            </div>
          `
          : ''
      }

      <input
        id="entryBodyWeight"
        class="grid-input number-input"
        type="number"
        min="0"
        step="0.1"
        aria-label="Body weight"
      >

      <select
        id="entryWeightClass"
        class="grid-select"
        aria-label="Weight class"
      >
        ${renderEntryWeightClassOptions(
          meet,
          division.id,
          ''
        )}
      </select>

      <div
        id="entryLifterCoefficient"
        class="cell-coefficient"
      ></div>

      ${
        showGradeColumn
          ? `
            <input
              id="entryGrade"
              class="grid-input number-input"
              type="text"
              inputmode="numeric"
              maxlength="2"
              pattern="9|10|11|12"
              aria-label="Grade (9 through 12)"
            >
          `
          : ''
      }

      <select
        id="entryEquipment"
        class="grid-select"
        aria-label="Equipment"
      >
        <option value="equipped" ${registrationDefaults.equipmentType === 'equipped' ? 'selected' : ''}>Equipped</option>
        <option value="unequipped" ${registrationDefaults.equipmentType === 'unequipped' ? 'selected' : ''}>Unequipped</option>
      </select>

      <select
        id="entryTeamStatus"
        class="grid-select status-select"
        aria-label="Team status"
      >
        <option value="regular" selected>${team.isBTeam === true ? 'BTeam (Team)' : 'Regular'}</option>
        <option value="bteam">BTeam</option>
        <option value="guest">GuestLifter</option>
      </select>

      <select
        id="entryLifterStatus"
        class="grid-select status-select"
        aria-label="Lifter status"
      >
        ${renderLifterStatusOptions(
          'active'
        )}
      </select>

      <div class="readiness attention">
        Needs Attention
      </div>

      <div></div>
      <div></div>

    </div>
  `
}


function renderEntryWeightClassOptions(
  meet: LocalMeet,
  divisionId: number | null,
  selectedClass: string,
): string {

  if (
    divisionId === null
  ) {
    return `
      <option value="">
        —
      </option>
    `
  }

  const division =
    meet.state.divisions.find(
      item =>
        item.id ===
        divisionId
    )

  if (
    division === undefined
  ) {
    return `
      <option value="">
        —
      </option>
    `
  }

  try {

    const rules =
      getDivisionRules(
          division
        )

    return `
      <option value="">
        Auto
      </option>

      ${
        rules.weightClasses
          .map(
            weightClass => `
              <option
                value="${
                  escapeHtml(
                    weightClass.name
                  )
                }"
                ${
                  weightClass.name ===
                  selectedClass
                    ? 'selected'
                    : ''
                }
              >
                ${
                  escapeHtml(
                    weightClass.name
                  )
                }
              </option>
            `
          )
          .join('')
      }
    `

  } catch {

    return `
      <option value="">
        Rules?
      </option>
    `
  }
}



function getBulkEditLifters(
  meet: LocalMeet,
): Lifter[] {

  return [...getVisibleLifters(
    meet
  )].sort(
    (a, b) =>
      a.lifterNumber -
      b.lifterNumber
  )
}


function getBulkEditModelSnapshot(
  meet: LocalMeet,
): string {

  return JSON.stringify(
    getBulkEditLifters(
      meet
    ).map(
      lifter => ({
        id:
          lifter.id,
        lifterNumber:
          lifter.lifterNumber,
        firstName:
          lifter.firstName,
        lastName:
          lifter.lastName,
        bodyWeight:
          lifter.bodyWeight,
        weightClass:
          lifter.weightClass ??
          '',
        grade:
          lifter.grade,
        equipmentType:
          lifter.equipmentType,
        isGuest:
          lifter.isGuest,
        isExtraLifter:
          lifter.isExtraLifter,
        status:
          lifter.status,
      })
    ).sort(
      (a, b) =>
        a.id -
        b.id
    )
  )
}


function getBulkEditFormSnapshot():
  string | null {

  const meet =
    getSelectedMeet()

  const rows =
    document.querySelectorAll<HTMLElement>(
      '[data-bulk-lifter-id]'
    )

  if (
    meet === undefined
  ) {
    return null
  }

  if (
    rows.length ===
    0
  ) {
    return '[]'
  }

  const values:
    Array<Record<string, unknown>> =
      []

  for (
    const row of
    Array.from(rows)
  ) {
    const id =
      Number(
        row.dataset
          .bulkLifterId
      )

    const lifter =
      meet.state.lifters.find(
        item =>
          item.id ===
          id
      )

    const number =
      row.querySelector<HTMLInputElement>(
        '[data-bulk-field="lifterNumber"]'
      )

    const first =
      row.querySelector<HTMLInputElement>(
        '[data-bulk-field="firstName"]'
      )

    const last =
      row.querySelector<HTMLInputElement>(
        '[data-bulk-field="lastName"]'
      )

    const bodyWeight =
      row.querySelector<HTMLInputElement>(
        '[data-bulk-field="bodyWeight"]'
      )

    const weightClass =
      row.querySelector<HTMLSelectElement>(
        '[data-bulk-field="weightClass"]'
      )

    const grade =
      row.querySelector<HTMLInputElement>(
        '[data-bulk-field="grade"]'
      )

    const equipment =
      row.querySelector<HTMLSelectElement>(
        '[data-bulk-field="equipmentType"]'
      )

    const teamStatus =
      row.querySelector<HTMLSelectElement>(
        '[data-bulk-field="teamStatus"]'
      )

    const lifterStatus =
      row.querySelector<HTMLSelectElement>(
        '[data-bulk-field="lifterStatus"]'
      )

    if (
      Number.isNaN(id) ||
      lifter === undefined ||
      number === null ||
      first === null ||
      last === null ||
      bodyWeight === null ||
      weightClass === null ||
      equipment === null ||
      teamStatus === null ||
      lifterStatus === null
    ) {
      return null
    }

    values.push({
      id,
      lifterNumber:
        Number(
          number.value
        ),
      firstName:
        first.value.trim(),
      lastName:
        last.value.trim(),
      bodyWeight:
        bodyWeight.value.trim() ===
        ''
          ? null
          : Number(
              bodyWeight.value
            ),
      weightClass:
        weightClass.value,
      grade:
        grade === null
          ? lifter.grade
          : grade.value.trim() ===
            ''
            ? null
            : Number(
                grade.value
              ),
      equipmentType:
        equipment.value,
      isGuest:
        teamStatus.value ===
        'guest',
      isExtraLifter:
        teamStatus.value ===
        'bteam',
      status:
        lifterStatus.value,
    })
  }

  values.sort(
    (a, b) =>
      Number(a.id) -
      Number(b.id)
  )

  return JSON.stringify(
    values
  )
}


function hasBulkEditChanges():
  boolean {

  if (
    !isBulkEditing ||
    bulkEditOriginalSnapshot ===
      null
  ) {
    return false
  }

  const current =
    getBulkEditFormSnapshot()

  return (
    current !== null &&
    current !==
      bulkEditOriginalSnapshot
  )
}


function startBulkEdit():
  void {

  const meet =
    getSelectedMeet()

  const division =
    getSelectedDivision()

  if (
    meet === undefined ||
    division === undefined ||
    getVisibleLifters(
      meet
    ).length ===
      0
  ) {
    return
  }

  if (
    !finishActiveEdit(
      true,
      false
    )
  ) {
    return
  }

  activeEntry =
    null

  isBulkEditing =
    true

  bulkSortColumn =
    'lifterNumber'

  bulkSortAscending =
    true

  bulkMissingBodyweightsOnly =
    false

  bulkEditOriginalSnapshot =
    getBulkEditModelSnapshot(
      meet
    )

  renderApp()

  focusElement(
    '[data-bulk-field="bodyWeight"]'
  )
}


function clearBulkEdit():
  void {

  isBulkEditing =
    false

  bulkEditOriginalSnapshot =
    null

  bulkSortColumn =
    'lifterNumber'

  bulkSortAscending =
    true

  bulkMissingBodyweightsOnly =
    false
}


function cancelBulkEdit():
  void {

  if (
    !isBulkEditing
  ) {
    return
  }

  if (
    hasBulkEditChanges() &&
    !window.confirm(
      'Discard the unsaved bulk-edit changes?'
    )
  ) {
    return
  }

  clearBulkEdit()
  renderApp()
}


function finishBulkEdit(
  promptIfChanged: boolean,
): boolean {

  if (
    !isBulkEditing
  ) {
    return true
  }

  if (
    promptIfChanged &&
    hasBulkEditChanges()
  ) {
    const saveChanges =
      window.confirm(
        'Save the bulk-edit changes before leaving? Select OK to save or Cancel to discard the changes.'
      )

    if (
      saveChanges
    ) {
      return saveBulkEdit(
        false
      )
    }
  }

  clearBulkEdit()

  return true
}


function renderBulkEditRow(
  meet: LocalMeet,
  lifter: Lifter,
  rowIndex: number,
  showGradeColumn: boolean,
): string {

  const division =
    meet.state.divisions.find(
      item =>
        item.id ===
        lifter.divisionId
    )

  const team =
    getLifterTeam(
      meet,
      lifter
    )

  const equipmentCol =
    showGradeColumn
      ? 6
      : 5

  const teamStatusCol =
    equipmentCol +
    1

  const lifterStatusCol =
    teamStatusCol +
    1


  const readiness =
    getLifterReadinessLabel(
      lifter,
      meet
    )

  return `
    <div
      class="bulk-edit-row ${showGradeColumn ? 'with-grade-column' : ''} ${getLifterStatusRowClass(lifter)}"
      data-bulk-lifter-id="${lifter.id}"
      data-bulk-row-index="${rowIndex}"
      data-team-is-bteam="${team?.isBTeam === true ? 'true' : 'false'}"
    >
      <input
        class="bulk-edit-input number-input"
        type="number"
        min="1"
        value="${lifter.lifterNumber}"
        data-bulk-field="lifterNumber"
        data-bulk-col="0"
        aria-label="Lifter number for ${escapeHtml(lifter.firstName)} ${escapeHtml(lifter.lastName)}"
      >

      <input
        class="bulk-edit-input"
        type="text"
        value="${escapeHtml(lifter.firstName)}"
        data-bulk-field="firstName"
        data-bulk-col="1"
        aria-label="First name"
      >

      <input
        class="bulk-edit-input"
        type="text"
        value="${escapeHtml(lifter.lastName)}"
        data-bulk-field="lastName"
        data-bulk-col="2"
        aria-label="Last name"
      >

      <div
        class="bulk-team-cell"
        title="${escapeHtml(team?.name ?? 'Unattached')}"
      >
        ${escapeHtml(team?.name ?? 'Unattached')}
      </div>

      <input
        class="bulk-edit-input number-input bulk-bodyweight"
        type="number"
        min="0"
        step="0.1"
        value="${lifter.bodyWeight ?? ''}"
        data-bulk-field="bodyWeight"
        data-bulk-col="3"
        aria-label="Body weight"
      >

      <select
        class="bulk-edit-select"
        data-bulk-field="weightClass"
        data-bulk-col="4"
        data-original-source="${lifter.weightClassSource}"
        data-manual-changed="false"
        aria-label="Weight class"
      >
        ${renderEntryWeightClassOptions(
          meet,
          division?.id ??
            null,
          lifter.weightClass ??
            ''
        )}
      </select>

      ${
        showGradeColumn
          ? `
            <input
              class="bulk-edit-input number-input"
              type="text"
              inputmode="numeric"
              maxlength="2"
              pattern="9|10|11|12"
              value="${lifter.grade ?? ''}"
              data-bulk-field="grade"
              data-bulk-col="5"
              aria-label="Grade (9 through 12)"
            >
          `
          : ''
      }

      <select
        class="bulk-edit-select"
        data-bulk-field="equipmentType"
        data-bulk-col="${equipmentCol}"
        aria-label="Equipment"
      >
        <option value="equipped" ${lifter.equipmentType === 'equipped' ? 'selected' : ''}>Equipped</option>
        <option value="unequipped" ${lifter.equipmentType === 'unequipped' ? 'selected' : ''}>Unequipped</option>
      </select>

      <select
        class="bulk-edit-select status-select"
        data-bulk-field="teamStatus"
        data-bulk-col="${teamStatusCol}"
        aria-label="Team status"
      >
        ${renderTeamStatusOptions(
          meet,
          lifter
        )}
      </select>

      <select
        class="bulk-edit-select status-select"
        data-bulk-field="lifterStatus"
        data-bulk-col="${lifterStatusCol}"
        aria-label="Lifter status"
      >
        ${renderLifterStatusOptions(
          lifter.status
        )}
      </select>

      <div
        class="readiness bulk-readiness ${
          readiness === 'Ready'
            ? 'ready'
            : readiness === 'Not Competing'
              ? 'not-competing'
              : 'attention'
        }"
      >
        ${readiness}
      </div>
    </div>
  `
}


function renderBulkSortHeader(
  label: string,
  column: BulkSortColumn,
): string {

  const active =
    bulkSortColumn ===
    column

  const wrappedLabel =
    escapeHtml(
      label
    ).replaceAll(
      ' ',
      '<br>'
    )

  return `
    <button
      type="button"
      class="bulk-sort-button ${active ? 'active' : ''}"
      data-bulk-sort="${column}"
    >
      <span class="bulk-sort-label">${wrappedLabel}</span>
      <span data-bulk-sort-indicator="${column}">${
        active
          ? (bulkSortAscending ? '▲' : '▼')
          : ''
      }</span>
    </button>
  `
}


function renderBulkEditGrid(
  meet: LocalMeet,
): string {

  const lifters =
    getBulkEditLifters(
      meet
    )

  const showGradeColumn =
    lifters.some(
      lifter =>
        lifter.grade !==
        null
    )

  return `
    <div class="bulk-edit-grid">
      <div class="bulk-edit-row bulk-edit-header ${showGradeColumn ? 'with-grade-column' : ''}">
        ${renderBulkSortHeader('Lifter#', 'lifterNumber')}
        ${renderBulkSortHeader('First', 'firstName')}
        ${renderBulkSortHeader('Last', 'lastName')}
        ${renderBulkSortHeader('Team', 'team')}
        ${renderBulkSortHeader('BWT', 'bodyWeight')}
        ${renderBulkSortHeader('Weight Class', 'weightClass')}
        ${showGradeColumn ? renderBulkSortHeader('Grade', 'grade') : ''}
        ${renderBulkSortHeader('Equip', 'equipmentType')}
        ${renderBulkSortHeader('Team Status', 'teamStatus')}
        ${renderBulkSortHeader('Lifter Status', 'lifterStatus')}
        ${renderBulkSortHeader('Readiness', 'readiness')}
      </div>

      <div class="bulk-edit-body">
        ${
          lifters
            .map(
              (
                lifter,
                index,
              ) =>
                renderBulkEditRow(
                  meet,
                  lifter,
                  index,
                  showGradeColumn
                )
            )
            .join('')
        }
      </div>
    </div>
  `
}


function updateBulkReadiness(
  row: HTMLElement,
): void {

  const meet =
    getSelectedMeet()

  const lifterId =
    Number(
      row.dataset
        .bulkLifterId
    )

  if (
    meet === undefined ||
    Number.isNaN(
      lifterId
    )
  ) {
    return
  }

  const lifter =
    meet.state.lifters.find(
      item =>
        item.id ===
        lifterId
    )

  const readinessCell =
    row.querySelector<HTMLElement>(
      '.bulk-readiness'
    )

  const bodyWeightInput =
    row.querySelector<HTMLInputElement>(
      '[data-bulk-field="bodyWeight"]'
    )

  const classInput =
    row.querySelector<HTMLSelectElement>(
      '[data-bulk-field="weightClass"]'
    )

  const statusInput =
    row.querySelector<HTMLSelectElement>(
      '[data-bulk-field="lifterStatus"]'
    )

  if (
    lifter === undefined ||
    readinessCell === null ||
    bodyWeightInput === null ||
    classInput === null ||
    statusInput === null
  ) {
    return
  }

  const bodyWeight =
    bodyWeightInput.value.trim() ===
    ''
      ? null
      : Number(
          bodyWeightInput.value
        )

  const staged:
    Lifter = {
      ...lifter,
      bodyWeight,
      weightClass:
        classInput.value ===
        ''
          ? null
          : classInput.value,
      status:
        statusInput.value as
          Lifter['status'],
    }

  const readiness =
    getLifterReadinessLabel(
      staged,
      meet
    )

  readinessCell.className =
    `readiness bulk-readiness ${
      readiness === 'Ready'
        ? 'ready'
        : readiness === 'Not Competing'
          ? 'not-competing'
          : 'attention'
    }`

  readinessCell.textContent =
    readiness
}


function updateBulkWeightClass(
  bodyWeightInput:
    HTMLInputElement,
): void {

  const row =
    bodyWeightInput.closest<HTMLElement>(
      '[data-bulk-lifter-id]'
    )

  if (
    row === null
  ) {
    return
  }

  const classInput =
    row.querySelector<HTMLSelectElement>(
      '[data-bulk-field="weightClass"]'
    )

  if (
    classInput === null
  ) {
    return
  }

  if (
    classInput.dataset
      .manualChanged !==
      'true' &&
    classInput.dataset
      .originalSource !==
      'manual'
  ) {
    const meet =
      getSelectedMeet()

    const lifterId =
      Number(
        row.dataset
          .bulkLifterId
      )

    const lifter =
      meet?.state.lifters.find(
        item =>
          item.id ===
          lifterId
      )

    const division =
      lifter === undefined ||
      meet === undefined
        ? undefined
        : meet.state.divisions.find(
            item =>
              item.id ===
              lifter.divisionId
          )

    if (
      division !== undefined
    ) {
      const bodyWeight =
        bodyWeightInput.value.trim() ===
        ''
          ? null
          : Number(
              bodyWeightInput.value
            )

      try {
        const rules =
          getDivisionRules(
            division
          )

        classInput.value =
          getAutomaticWeightClass(
            bodyWeight,
            rules.weightClasses
          ) ??
          ''
      } catch {
        // Keep the existing selection when rules cannot be resolved.
      }
    }
  }

  updateBulkReadiness(
    row
  )
}


function updateBulkRowIndices():
  void {

  const rows =
    Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-bulk-lifter-id]'
      )
    )

  let visibleIndex =
    0

  for (
    const row of
    rows
  ) {
    if (
      row.hidden
    ) {
      row.dataset
        .bulkRowIndex =
          '-1'

      continue
    }

    row.dataset
      .bulkRowIndex =
        String(
          visibleIndex
        )

    visibleIndex += 1
  }
}


function updateBulkSortIndicators():
  void {

  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-bulk-sort]'
    )
    .forEach(
      button => {

        const key =
          button.dataset
            .bulkSort

        const active =
          key ===
          bulkSortColumn

        button.classList
          .toggle(
            'active',
            active
          )

        const indicator =
          button.querySelector<HTMLElement>(
            '[data-bulk-sort-indicator]'
          )

        if (
          indicator !== null
        ) {
          indicator.textContent =
            active
              ? (
                  bulkSortAscending
                    ? '▲'
                    : '▼'
                )
              : ''
        }
      }
    )
}


function getBulkSortText(
  row: HTMLElement,
  column: BulkSortColumn,
): string {

  if (
    column ===
    'team'
  ) {
    return (
      row.querySelector<HTMLElement>(
        '.bulk-team-cell'
      )?.textContent ??
      ''
    ).trim()
  }

  if (
    column ===
    'readiness'
  ) {
    return (
      row.querySelector<HTMLElement>(
        '.bulk-readiness'
      )?.textContent ??
      ''
    ).trim()
  }

  if (
    column ===
    'teamStatus'
  ) {
    const select =
      row.querySelector<HTMLSelectElement>(
        '[data-bulk-field="teamStatus"]'
      )

    if (
      select?.value ===
      'guest'
    ) {
      return 'G'
    }

    if (
      select?.value ===
      'bteam'
    ) {
      return 'B'
    }

    return row.dataset
      .teamIsBteam ===
      'true'
        ? 'BT'
        : ''
  }

  if (
    column ===
    'lifterStatus'
  ) {
    const value =
      row.querySelector<HTMLSelectElement>(
        '[data-bulk-field="lifterStatus"]'
      )?.value

    switch (
      value
    ) {
      case 'bombed':
        return 'BO'
      case 'scratched':
        return 'SC'
      case 'disqualified':
        return 'DQ'
      default:
        return ''
    }
  }

  const control =
    row.querySelector<
      HTMLInputElement |
      HTMLSelectElement
    >(
      `[data-bulk-field="${column}"]`
    )

  return control?.value ??
    ''
}


function sortBulkRows(
  column: BulkSortColumn,
): void {

  const body =
    document.querySelector<HTMLElement>(
      '.bulk-edit-body'
    )

  if (
    body === null
  ) {
    return
  }

  if (
    bulkSortColumn ===
    column
  ) {
    bulkSortAscending =
      !bulkSortAscending
  } else {
    bulkSortColumn =
      column

    bulkSortAscending =
      true
  }

  const rows =
    Array.from(
      body.querySelectorAll<HTMLElement>(
        '[data-bulk-lifter-id]'
      )
    )

  rows.sort(
    (a, b) => {
      let comparison =
        0

      if (
        column ===
          'lifterNumber' ||
        column ===
          'bodyWeight' ||
        column ===
          'grade'
      ) {
        const aText =
          getBulkSortText(
            a,
            column
          )

        const bText =
          getBulkSortText(
            b,
            column
          )

        const aNumber =
          aText.trim() ===
          ''
            ? null
            : Number(
                aText
              )

        const bNumber =
          bText.trim() ===
          ''
            ? null
            : Number(
                bText
              )

        comparison =
          compareOptionalNumbers(
            aNumber,
            bNumber
          )
      } else if (
        column ===
        'weightClass'
      ) {
        comparison =
          getWeightClassSortValue(
            getBulkSortText(
              a,
              column
            )
          ) -
          getWeightClassSortValue(
            getBulkSortText(
              b,
              column
            )
          )
      } else {
        comparison =
          getBulkSortText(
            a,
            column
          )
            .toLocaleLowerCase()
            .localeCompare(
              getBulkSortText(
                b,
                column
              ).toLocaleLowerCase()
            )
      }

      if (
        comparison ===
        0
      ) {
        comparison =
          Number(
            a.querySelector<HTMLInputElement>(
              '[data-bulk-field="lifterNumber"]'
            )?.value ??
            ''
          ) -
          Number(
            b.querySelector<HTMLInputElement>(
              '[data-bulk-field="lifterNumber"]'
            )?.value ??
            ''
          )
      }

      return bulkSortAscending
        ? comparison
        : -comparison
    }
  )

  for (
    const row of
    rows
  ) {
    body.appendChild(
      row
    )
  }

  updateBulkRowIndices()
  updateBulkSortIndicators()
}


function applyBulkMissingBodyweightFilter():
  void {

  const rows =
    document.querySelectorAll<HTMLElement>(
      '[data-bulk-lifter-id]'
    )

  rows.forEach(
    row => {
      const bodyWeight =
        row.querySelector<HTMLInputElement>(
          '[data-bulk-field="bodyWeight"]'
        )

      row.hidden =
        bulkMissingBodyweightsOnly &&
        (
          bodyWeight === null ||
          bodyWeight.value.trim() !==
            ''
        )
    }
  )

  updateBulkRowIndices()
}


function setBulkValidationMessage(
  message: string,
): void {

  const element =
    document.querySelector<HTMLElement>(
      '#bulkValidationMessage'
    )

  if (
    element !== null
  ) {
    element.textContent =
      message
  }
}


function validateBulkLifterNumbers():
  boolean {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return true
  }

  const rows =
    Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-bulk-lifter-id]'
      )
    )

  const editedIds =
    new Set(
      rows.map(
        row =>
          Number(
            row.dataset
              .bulkLifterId
          )
      )
    )

  const outsideNumbers =
    new Set(
      meet.state.lifters
        .filter(
          lifter =>
            !editedIds.has(
              lifter.id
            )
        )
        .map(
          lifter =>
            lifter.lifterNumber
        )
    )

  const seen =
    new Map<
      number,
      HTMLInputElement
    >()

  let firstDuplicate:
    HTMLInputElement | null =
      null

  let duplicateNumber:
    number | null =
      null

  for (
    const row of
    rows
  ) {
    const input =
      row.querySelector<HTMLInputElement>(
        '[data-bulk-field="lifterNumber"]'
      )

    if (
      input === null
    ) {
      continue
    }

    input.classList.remove(
      'duplicate-number-warning'
    )

    input.removeAttribute(
      'aria-invalid'
    )

    input.setCustomValidity(
      ''
    )
  }

  for (
    const row of
    rows
  ) {
    const input =
      row.querySelector<HTMLInputElement>(
        '[data-bulk-field="lifterNumber"]'
      )

    if (
      input === null
    ) {
      continue
    }

    const value =
      Number(
        input.value
      )

    if (
      !Number.isInteger(
        value
      ) ||
      value <= 0
    ) {
      continue
    }

    const prior =
      seen.get(
        value
      )

    const duplicate =
      outsideNumbers.has(
        value
      ) ||
      prior !==
        undefined

    if (
      duplicate
    ) {
      input.classList.add(
        'duplicate-number-warning'
      )

      input.setAttribute(
        'aria-invalid',
        'true'
      )

      input.setCustomValidity(
        `Lifter number ${value} is already in use.`
      )

      if (
        prior !== undefined
      ) {
        prior.classList.add(
          'duplicate-number-warning'
        )

        prior.setAttribute(
          'aria-invalid',
          'true'
        )

        prior.setCustomValidity(
          `Lifter number ${value} is already in use.`
        )
      }

      if (
        firstDuplicate ===
        null
      ) {
        firstDuplicate =
          input

        duplicateNumber =
          value
      }
    } else {
      seen.set(
        value,
        input
      )
    }
  }

  if (
    firstDuplicate !==
    null &&
    duplicateNumber !==
    null
  ) {
    setBulkValidationMessage(
      `Lifter number ${duplicateNumber} is already in use.`
    )

    return false
  }

  setBulkValidationMessage(
    ''
  )

  return true
}


function validateEditLifterNumberImmediate():
  boolean {

  const meet =
    getSelectedMeet()

  const input =
    document.querySelector<HTMLInputElement>(
      '#editLifterNumber'
    )

  const status =
    document.querySelector<HTMLElement>(
      '#editLifterValidationStatus'
    )

  if (
    meet === undefined ||
    input === null ||
    activeEdit?.type !==
      'lifter'
  ) {
    return true
  }

  const lifterId =
    Number(
      activeEdit.id
    )

  const value =
    Number(
      input.value
    )

  const duplicate =
    Number.isInteger(
      value
    ) &&
    value > 0 &&
    meet.state.lifters.some(
      lifter =>
        lifter.id !==
          lifterId &&
        lifter.lifterNumber ===
          value
    )

  input.classList.toggle(
    'duplicate-number-warning',
    duplicate
  )

  if (
    duplicate
  ) {
    input.setAttribute(
      'aria-invalid',
      'true'
    )

    input.setCustomValidity(
      `Lifter number ${value} is already in use.`
    )

    if (
      status !== null
    ) {
      status.className =
        'readiness attention'

      status.textContent =
        `#${value} in use`
    }

    return false
  }

  input.removeAttribute(
    'aria-invalid'
  )

  input.setCustomValidity(
    ''
  )

  if (
    status !== null
  ) {
    status.className =
      'readiness editing-status'

    status.textContent =
      'Editing'
  }

  return true
}


function wireSelectAllOnEditableInputs():
  void {

  document
    .querySelectorAll<HTMLInputElement>(
      [
        '[data-edit-row] input:not([type="checkbox"])',
        '.bulk-edit-input',
        '.competition-result-input',
      ].join(',')
    )
    .forEach(
      input => {

        input.addEventListener(
          'focus',
          () => {
            window.requestAnimationFrame(
              () => {
                try {
                  input.select()
                } catch {
                  // Some input types do not support select().
                }
              }
            )
          }
        )

        input.addEventListener(
          'mouseup',
          event => {
            event.preventDefault()
          }
        )
      }
    )
}


function saveBulkEdit(
  renderAfter: boolean = true,
): boolean {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return false
  }

  if (
    !validateBulkLifterNumbers()
  ) {
    document
      .querySelector<HTMLInputElement>(
        '.duplicate-number-warning'
      )
      ?.focus()

    return false
  }

  const rows =
    Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-bulk-lifter-id]'
      )
    )

  const editedIds =
    new Set(
      rows.map(
        row =>
          Number(
            row.dataset
              .bulkLifterId
          )
      )
    )

  const usedNumbers =
    new Set(
      meet.state.lifters
        .filter(
          lifter =>
            !editedIds.has(
              lifter.id
            )
        )
        .map(
          lifter =>
            lifter.lifterNumber
        )
    )

  const updates:
    Array<{
      lifter: Lifter
      updated: Lifter
    }> =
      []

  for (
    const row of
    rows
  ) {
    const lifterId =
      Number(
        row.dataset
          .bulkLifterId
      )

    const lifter =
      meet.state.lifters.find(
        item =>
          item.id ===
          lifterId
      )

    const numberInput =
      row.querySelector<HTMLInputElement>(
        '[data-bulk-field="lifterNumber"]'
      )

    const firstInput =
      row.querySelector<HTMLInputElement>(
        '[data-bulk-field="firstName"]'
      )

    const lastInput =
      row.querySelector<HTMLInputElement>(
        '[data-bulk-field="lastName"]'
      )

    const bodyWeightInput =
      row.querySelector<HTMLInputElement>(
        '[data-bulk-field="bodyWeight"]'
      )

    const classInput =
      row.querySelector<HTMLSelectElement>(
        '[data-bulk-field="weightClass"]'
      )

    const gradeInput =
      row.querySelector<HTMLInputElement>(
        '[data-bulk-field="grade"]'
      )

    const equipmentInput =
      row.querySelector<HTMLSelectElement>(
        '[data-bulk-field="equipmentType"]'
      )

    const teamStatusInput =
      row.querySelector<HTMLSelectElement>(
        '[data-bulk-field="teamStatus"]'
      )

    const lifterStatusInput =
      row.querySelector<HTMLSelectElement>(
        '[data-bulk-field="lifterStatus"]'
      )

    if (
      lifter === undefined ||
      numberInput === null ||
      firstInput === null ||
      lastInput === null ||
      bodyWeightInput === null ||
      classInput === null ||
      equipmentInput === null ||
      teamStatusInput === null ||
      lifterStatusInput === null
    ) {
      return false
    }

    const lifterNumber =
      Number(
        numberInput.value
      )

    if (
      !Number.isInteger(
        lifterNumber
      ) ||
      lifterNumber <= 0
    ) {
      window.alert(
        'Enter a valid lifter number.'
      )

      numberInput.focus()

      return false
    }

    if (
      usedNumbers.has(
        lifterNumber
      )
    ) {
      window.alert(
        `Lifter number ${lifterNumber} is already in use.`
      )

      numberInput.focus()

      return false
    }

    usedNumbers.add(
      lifterNumber
    )

    const firstName =
      firstInput.value.trim()

    const lastName =
      lastInput.value.trim()

    if (
      firstName === ''
    ) {
      window.alert(
        'Enter the lifter first name.'
      )

      firstInput.focus()

      return false
    }

    if (
      lastName === ''
    ) {
      window.alert(
        'Enter the lifter last name.'
      )

      lastInput.focus()

      return false
    }

    const bodyWeight =
      bodyWeightInput.value.trim() ===
      ''
        ? null
        : Number(
            bodyWeightInput.value
          )

    if (
      bodyWeight !== null &&
      (
        !Number.isFinite(
          bodyWeight
        ) ||
        bodyWeight <= 0
      )
    ) {
      window.alert(
        'Enter a valid body weight.'
      )

      bodyWeightInput.focus()

      return false
    }

    const grade =
      gradeInput === null
        ? lifter.grade
        : gradeInput.value.trim() ===
          ''
          ? null
          : Number(
              gradeInput.value
            )

    if (
      grade !== null &&
      (
        !Number.isInteger(
          grade
        ) ||
        grade < 9 ||
        grade > 12
      )
    ) {
      window.alert(
        'Grade must be 9, 10, 11, or 12.'
      )

      gradeInput?.focus()

      return false
    }

    const division =
      meet.state.divisions.find(
        item =>
          item.id ===
          lifter.divisionId
      )

    if (
      division === undefined
    ) {
      window.alert(
        'Unable to locate the lifter division.'
      )

      return false
    }

    let rules

    try {
      rules =
        getDivisionRules(
          division
        )
    } catch (
      error
    ) {
      window.alert(
        error instanceof Error
          ? error.message
          : 'Unable to determine division rules.'
      )

      return false
    }

    let updated:
      Lifter = {
        ...lifter,
        lifterNumber,
        firstName,
        lastName,
        bodyWeight,
        grade,
        equipmentType:
          equipmentInput.value as
            Lifter['equipmentType'],
        isGuest:
          teamStatusInput.value ===
          'guest',
        isExtraLifter:
          teamStatusInput.value ===
          'bteam',
        status:
          lifterStatusInput.value as
            Lifter['status'],
      }

    const selectedClass =
      classInput.value

    const automaticClass =
      getAutomaticWeightClass(
        bodyWeight,
        rules.weightClasses
      )

    try {
      if (
        selectedClass === '' ||
        (
          classInput.dataset
            .manualChanged !==
            'true' &&
          lifter.weightClassSource ===
            'automatic'
        )
      ) {
        updated.weightClass =
          automaticClass

        updated.weightClassSource =
          'automatic'
      } else {
        updated =
          assignRegisteredLifterWeightClass(
            updated,
            selectedClass,
            rules
          )
      }
    } catch (
      error
    ) {
      window.alert(
        error instanceof Error
          ? error.message
          : 'Unable to assign the weight class.'
      )

      classInput.focus()

      return false
    }

    updates.push({
      lifter,
      updated,
    })
  }

  for (
    const update of
    updates
  ) {
    Object.assign(
      update.lifter,
      update.updated
    )
  }

  clearBulkEdit()

  if (
    renderAfter
  ) {
    renderApp()
  }

  return true
}


function focusBulkCell(
  rowIndex: number,
  columnIndex: number,
): void {

  document
    .querySelector<HTMLElement>(
      `[data-bulk-row-index="${rowIndex}"] [data-bulk-col="${columnIndex}"]`
    )
    ?.focus()
}


function wireBulkEdit():
  void {

  document
    .querySelector<HTMLButtonElement>(
      '#bulkEditLifters'
    )
    ?.addEventListener(
      'click',
      startBulkEdit
    )

  document
    .querySelector<HTMLButtonElement>(
      '#saveBulkEdit'
    )
    ?.addEventListener(
      'click',
      () => {
        saveBulkEdit()
      }
    )

  document
    .querySelector<HTMLButtonElement>(
      '#cancelBulkEdit'
    )
    ?.addEventListener(
      'click',
      cancelBulkEdit
    )

  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-bulk-sort]'
    )
    .forEach(
      button => {
        button.addEventListener(
          'click',
          () => {
            const key =
              button.dataset
                .bulkSort

            if (
              key !==
              undefined
            ) {
              sortBulkRows(
                key as
                  BulkSortColumn
              )
            }
          }
        )
      }
    )

  document
    .querySelector<HTMLInputElement>(
      '#bulkMissingBodyweightsOnly'
    )
    ?.addEventListener(
      'change',
      event => {
        bulkMissingBodyweightsOnly =
          (
            event.currentTarget as
              HTMLInputElement
          ).checked

        applyBulkMissingBodyweightFilter()
      }
    )

  document
    .querySelectorAll<HTMLInputElement>(
      '[data-bulk-field="lifterNumber"]'
    )
    .forEach(
      input => {
        input.addEventListener(
          'input',
          validateBulkLifterNumbers
        )
      }
    )

  document
    .querySelector<HTMLElement>(
      '.bulk-edit-grid'
    )
    ?.addEventListener(
      'keydown',
      event => {
        if (
          (
            event.ctrlKey ||
            event.metaKey
          ) &&
          event.key
            .toLocaleLowerCase() ===
            's'
        ) {
          event.preventDefault()
          saveBulkEdit()
        }
      }
    )


  document
    .querySelectorAll<HTMLInputElement>(
      '.bulk-bodyweight'
    )
    .forEach(
      input => {
        input.addEventListener(
          'input',
          () => {
            updateBulkWeightClass(
              input
            )
          }
        )
      }
    )

  document
    .querySelectorAll<HTMLSelectElement>(
      '[data-bulk-field="weightClass"]'
    )
    .forEach(
      select => {
        select.addEventListener(
          'change',
          () => {
            select.dataset
              .manualChanged =
                'true'

            const row =
              select.closest<HTMLElement>(
                '[data-bulk-lifter-id]'
              )

            if (
              row !== null
            ) {
              updateBulkReadiness(
                row
              )
            }
          }
        )
      }
    )

  document
    .querySelectorAll<HTMLSelectElement>(
      '[data-bulk-field="lifterStatus"]'
    )
    .forEach(
      select => {
        select.addEventListener(
          'change',
          () => {
            const row =
              select.closest<HTMLElement>(
                '[data-bulk-lifter-id]'
              )

            if (
              row !== null
            ) {
              row.classList.remove(
                'lifter-status-bombed',
                'lifter-status-scratched',
                'lifter-status-disqualified'
              )

              const statusClass =
                select.value === 'bombed'
                  ? 'lifter-status-bombed'
                  : select.value === 'scratched'
                    ? 'lifter-status-scratched'
                    : select.value === 'disqualified'
                      ? 'lifter-status-disqualified'
                      : ''

              if (
                statusClass !== ''
              ) {
                row.classList.add(
                  statusClass
                )
              }

              updateBulkReadiness(
                row
              )
            }
          }
        )
      }
    )


  document
    .querySelectorAll<HTMLElement>(
      '[data-bulk-col]'
    )
    .forEach(
      control => {

        control.addEventListener(
          'input',
          () => {
            control
              .closest(
                '.bulk-edit-row'
              )
              ?.classList
              .add(
                'bulk-row-changed'
              )
          }
        )

        control.addEventListener(
          'change',
          () => {
            control
              .closest(
                '.bulk-edit-row'
              )
              ?.classList
              .add(
                'bulk-row-changed'
              )
          }
        )

        control.addEventListener(
          'keydown',
          event => {

            const row =
              control.closest<HTMLElement>(
                '[data-bulk-row-index]'
              )

            const rowIndex =
              Number(
                row?.dataset
                  .bulkRowIndex
              )

            const columnIndex =
              Number(
                control.dataset
                  .bulkCol
              )

            if (
              Number.isNaN(
                rowIndex
              ) ||
              Number.isNaN(
                columnIndex
              )
            ) {
              return
            }

            let targetRow =
              rowIndex

            let targetColumn =
              columnIndex

            switch (
              event.key
            ) {
              case 'ArrowUp':
                targetRow -= 1
                break

              case 'ArrowDown':
              case 'Enter':
                targetRow += 1
                break

              case 'ArrowLeft':
                targetColumn -= 1
                break

              case 'ArrowRight':
                targetColumn += 1
                break

              case 'Escape':
                event.preventDefault()
                cancelBulkEdit()
                return

              default:
                return
            }

            event.preventDefault()

            focusBulkCell(
              targetRow,
              targetColumn
            )
          }
        )
      }
    )

  updateBulkSortIndicators()
  applyBulkMissingBodyweightFilter()
  validateBulkLifterNumbers()
}

function renderRegistration():
  string {

  const meet =
    getSelectedMeet()

  const division =
    getSelectedDivision()

  const selectedTeam =
    getSelectedTeam()

  const visibleLifterCount =
    meet === undefined
      ? 0
      : getVisibleLifters(
          meet
        ).length

  return `
    <main class="workspace registration-workspace ${
      isBulkEditing
        ? 'bulk-editing'
        : ''
    }">

      <div class="registration-layout">

        ${renderRegistrationSidebar()}

        ${
          meet === undefined
            ? `
              <section
                class="workspace-panel registration-panel"
              >

                <div class="registration-placeholder">

                  <strong>
                    No Meet Selected
                  </strong>

                  <span>
                    Create or select a meet
                    on the left to begin.
                  </span>

                </div>

              </section>
            `
            : `
              <section
                class="workspace-panel registration-panel"
              >

                <div class="registration-toolbar">

                  <div>
                    <span class="section-title">
                      Lifters
                    </span>

                    <span class="item-count">
                      ${visibleLifterCount}
                      lifters
                    </span>
                  </div>

                  <div class="registration-meet-name">
                    ${
                      escapeHtml(
                        getLifterSelectionLabel(
                          meet
                        )
                      )
                    }
                  </div>

                  <div class="registration-actions">
                    ${
                      isBulkEditing
                        ? `
                          <button
                            id="cancelBulkEdit"
                            type="button"
                            class="compact-button secondary-button"
                          >
                            Cancel
                          </button>

                          <button
                            id="saveBulkEdit"
                            type="button"
                            class="compact-button"
                          >
                            Save Changes
                          </button>
                        `
                        : `
                          <span class="registration-help">
                            ${
                              selectedTeam ===
                              undefined
                                ? (
                                    division ===
                                    undefined
                                      ? 'Select a division'
                                      : 'All Teams selected · choose a team to add lifters'
                                  )
                                : activeEntry ===
                                  'lifter'
                                  ? 'Tab moves fields · Enter adds · Esc cancels'
                                  : ''
                            }
                          </span>

                          <button
                            id="bulkEditLifters"
                            type="button"
                            class="compact-button secondary-button"
                            ${
                              division ===
                                undefined ||
                              visibleLifterCount ===
                                0
                                ? 'disabled'
                                : ''
                            }
                          >
                            Bulk Edit
                          </button>

                          <button
                            id="addLifter"
                            type="button"
                            class="compact-button"
                            data-open-entry="lifter"
                            ${
                              selectedTeam ===
                              undefined
                                ? 'disabled'
                                : ''
                            }
                          >
                            + Add
                          </button>
                        `
                    }
                  </div>

                </div>

                ${
                  isBulkEditing
                    ? `
                      <div class="bulk-options-bar">
                        <label class="bulk-filter-option">
                          <input
                            id="bulkMissingBodyweightsOnly"
                            type="checkbox"
                            ${
                              bulkMissingBodyweightsOnly
                                ? 'checked'
                                : ''
                            }
                          >
                          Show Missing Bodyweights Only
                        </label>

                        <span
                          id="bulkValidationMessage"
                          class="bulk-validation-message"
                          aria-live="polite"
                        ></span>

                        <span class="bulk-keyboard-help">
                          Arrow keys move cells · Enter moves down · Ctrl+S saves
                        </span>
                      </div>
                    `
                    : ''
                }

                ${
                  isBulkEditing
                    ? renderBulkEditGrid(
                        meet
                      )
                    : `
                      <div class="registration-grid">

                        <div
                          class="registration-row registration-header ${getLifterGridClassNames(meet)}"
                        >
                          ${renderLifterSortHeader('Lifter#', 'lifterNumber')}
                          ${renderLifterSortHeader('Lifter', 'lifter')}
                          ${
                            shouldShowLifterTeamColumn()
                              ? renderLifterSortHeader('Team', 'team')
                              : ''
                          }
                          ${renderLifterSortHeader('BWT', 'bodyWeight')}
                          ${renderLifterSortHeader('Weight Class', 'weightClass')}
                          <div class="registration-derived-header">
                            ${escapeHtml(
                              getRegistrationCoefficientHeader(
                                division
                              )
                            )}
                          </div>
                          ${
                            shouldShowLifterGradeColumn(
                              meet
                            )
                              ? renderLifterSortHeader('Grade', 'grade')
                              : ''
                          }
                          ${renderLifterSortHeader('Equip', 'equipmentType')}
                          ${renderLifterSortHeader('Team Status', 'teamStatus')}
                          ${renderLifterSortHeader('Lifter Status', 'lifterStatus')}
                          ${renderLifterSortHeader('Readiness', 'readiness')}
                          <div></div>
                          <div></div>
                        </div>

                        <div class="registration-body">
                          ${
                            renderRegisteredLifterRows(
                              meet
                            )
                          }

                          ${
                            activeEntry ===
                            'lifter'
                              ? renderRegistrationEntryRow(
                                  meet
                                )
                              : ''
                          }
                        </div>

                      </div>
                    `
                }

              </section>
            `
        }

      </div>

    </main>
  `
}


type CompetitionBestLiftResults =
  NonNullable<
    Lifter['bestLiftResults']
  >


type CompetitionAllAttemptResults =
  NonNullable<
    Lifter['allAttemptResults']
  >


type CompetitionEventAttempts =
  CompetitionAllAttemptResults[
    CompetitionLift
  ]


type CompetitionAttempt =
  CompetitionEventAttempts[
    CompetitionAttemptKey
  ]


function createEmptyCompetitionAttempt():
  CompetitionAttempt {

  return {
    weight: null,
    status: 'unspecified',
  }
}


function createEmptyCompetitionEventAttempts():
  CompetitionEventAttempts {

  return {
    attempt1:
      createEmptyCompetitionAttempt(),
    attempt2:
      createEmptyCompetitionAttempt(),
    attempt3:
      createEmptyCompetitionAttempt(),
  }
}


function createEmptyAllAttemptResults():
  CompetitionAllAttemptResults {

  return {
    squat:
      createEmptyCompetitionEventAttempts(),
    bench:
      createEmptyCompetitionEventAttempts(),
    deadlift:
      createEmptyCompetitionEventAttempts(),
  }
}


function getBestLiftResults(
  lifter: Lifter,
): CompetitionBestLiftResults {

  return (
    lifter.bestLiftResults ??
    {
      squat: null,
      bench: null,
      deadlift: null,
    }
  )
}


function ensureBestLiftResults(
  lifter: Lifter,
): CompetitionBestLiftResults {

  if (
    lifter.bestLiftResults ===
    undefined
  ) {
    lifter.bestLiftResults = {
      squat: null,
      bench: null,
      deadlift: null,
    }
  }

  return lifter.bestLiftResults
}


function getAllAttemptResults(
  lifter: Lifter,
): CompetitionAllAttemptResults {

  return (
    lifter.allAttemptResults ??
    createEmptyAllAttemptResults()
  )
}


function ensureAllAttemptResults(
  lifter: Lifter,
): CompetitionAllAttemptResults {

  if (
    lifter.allAttemptResults ===
    undefined
  ) {
    lifter.allAttemptResults =
      createEmptyAllAttemptResults()
  }

  return lifter.allAttemptResults
}


function readCompetitionWeight(
  value: string,
): number | null {

  const trimmed =
    value.trim()

  if (
    trimmed === ''
  ) {
    return null
  }

  const parsed =
    Number(
      trimmed
    )

  return (
    Number.isFinite(
      parsed
    ) &&
    parsed >= 0
  )
    ? parsed
    : null
}


function formatCompetitionWeight(
  value: number | null,
): string {

  return value === null
    ? ''
    : String(
        value
      )
}


function formatCompetitionDisplayWeight(
  value: number | null,
): string {

  return value === null
    ? '—'
    : String(
        value
      )
}


function calculateCompetitionTotal(
  results: CompetitionBestLiftResults,
): number | null {

  if (
    results.squat === null ||
    results.bench === null ||
    results.deadlift === null
  ) {
    return null
  }

  return (
    results.squat +
    results.bench +
    results.deadlift
  )
}


function getBestGoodAttempt(
  attempts: CompetitionEventAttempts,
): number | null {

  const values =
    [
      attempts.attempt1,
      attempts.attempt2,
      attempts.attempt3,
    ]
      .filter(
        attempt =>
          attempt.status ===
            'good' &&
          attempt.weight !==
            null
      )
      .map(
        attempt =>
          attempt.weight as
            number
      )

  if (
    values.length ===
    0
  ) {
    return null
  }

  return Math.max(
    ...values
  )
}


function getAllAttemptBestLifts(
  lifter: Lifter,
): CompetitionBestLiftResults {

  const results =
    getAllAttemptResults(
      lifter
    )

  return {
    squat:
      getBestGoodAttempt(
        results.squat
      ),
    bench:
      getBestGoodAttempt(
        results.bench
      ),
    deadlift:
      getBestGoodAttempt(
        results.deadlift
      ),
  }
}


function getCompetitionTotalForLifter(
  meet: LocalMeet,
  lifter: Lifter,
): number | null {

  if (
    meet.state.meet.resultEntryMode ===
    'all-attempts'
  ) {
    return calculateCompetitionTotal(
      getAllAttemptBestLifts(
        lifter
      )
    )
  }

  return calculateCompetitionTotal(
    getBestLiftResults(
      lifter
    )
  )
}


function getCompetitionBestLiftValue(
  meet: LocalMeet,
  lifter: Lifter,
  lift: CompetitionLift,
): number | null {

  if (
    meet.state.meet.resultEntryMode ===
      'all-attempts'
  ) {
    return getAllAttemptBestLifts(
      lifter
    )[lift]
  }

  return getBestLiftResults(
    lifter
  )[lift]
}


function compareCompetitionOptionalNumbers(
  a: number | null,
  b: number | null,
  ascending: boolean,
): number {

  if (
    a === null &&
    b === null
  ) {
    return 0
  }

  if (
    a === null
  ) {
    return 1
  }

  if (
    b === null
  ) {
    return -1
  }

  return ascending
    ? a - b
    : b - a
}


function compareCompetitionLifters(
  meet: LocalMeet,
  a: Lifter,
  b: Lifter,
): number {

  let result =
    0

  switch (
    competitionSortColumn
  ) {
    case 'lifterNumber':
      result =
        competitionSortAscending
          ? a.lifterNumber -
            b.lifterNumber
          : b.lifterNumber -
            a.lifterNumber

      break

    case 'lifter':
      result =
        a.lastName.localeCompare(
          b.lastName
        )

      if (
        result ===
        0
      ) {
        result =
          a.firstName.localeCompare(
            b.firstName
          )
      }

      if (
        !competitionSortAscending
      ) {
        result =
          -result
      }

      break

    case 'team':
      result =
        getLifterTeamName(
          meet,
          a
        ).localeCompare(
          getLifterTeamName(
            meet,
            b
          )
        )

      if (
        !competitionSortAscending
      ) {
        result =
          -result
      }

      break

    case 'bodyWeight':
      result =
        compareCompetitionOptionalNumbers(
          a.bodyWeight,
          b.bodyWeight,
          competitionSortAscending
        )

      break

    case 'weightClass': {
      const aMissing =
        a.weightClass ===
          null ||
        a.weightClass ===
          ''

      const bMissing =
        b.weightClass ===
          null ||
        b.weightClass ===
          ''

      if (
        aMissing ||
        bMissing
      ) {
        result =
          aMissing ===
          bMissing
            ? 0
            : aMissing
              ? 1
              : -1
      } else {
        const aValue =
          getWeightClassSortValue(
            a.weightClass
          )

        const bValue =
          getWeightClassSortValue(
            b.weightClass
          )

        result =
          competitionSortAscending
            ? aValue - bValue
            : bValue - aValue
      }

      break
    }

    case 'place':
      result =
        compareCompetitionOptionalNumbers(
          getCompetitionPlace(
            meet,
            a
          ),
          getCompetitionPlace(
            meet,
            b
          ),
          competitionSortAscending
        )

      break

    case 'bestSquat':
      result =
        compareCompetitionOptionalNumbers(
          getCompetitionBestLiftValue(
            meet,
            a,
            'squat'
          ),
          getCompetitionBestLiftValue(
            meet,
            b,
            'squat'
          ),
          competitionSortAscending
        )

      break

    case 'bestBench':
      result =
        compareCompetitionOptionalNumbers(
          getCompetitionBestLiftValue(
            meet,
            a,
            'bench'
          ),
          getCompetitionBestLiftValue(
            meet,
            b,
            'bench'
          ),
          competitionSortAscending
        )

      break

    case 'bestDeadlift':
      result =
        compareCompetitionOptionalNumbers(
          getCompetitionBestLiftValue(
            meet,
            a,
            'deadlift'
          ),
          getCompetitionBestLiftValue(
            meet,
            b,
            'deadlift'
          ),
          competitionSortAscending
        )

      break

    case 'total':
      result =
        compareCompetitionOptionalNumbers(
          getCompetitionTotalForLifter(
            meet,
            a
          ),
          getCompetitionTotalForLifter(
            meet,
            b
          ),
          competitionSortAscending
        )

      break
  }

  if (
    result !==
    0
  ) {
    return result
  }

  return (
    a.lifterNumber -
    b.lifterNumber
  )
}


function renderCompetitionSortHeader(
  label: string,
  column: CompetitionSortColumn,
): string {

  const active =
    competitionSortColumn ===
    column

  const wrappedLabel =
    escapeHtml(
      label
    ).replaceAll(
      ' ',
      '<br>'
    )

  return `
    <div class="competition-sort-header-cell">
      <button
        type="button"
        class="competition-sort-button ${
          active
            ? 'active'
            : ''
        }"
        data-competition-sort="${column}"
      >
        <span>${wrappedLabel}</span>
        <span class="competition-sort-indicator">${
          active
            ? (
                competitionSortAscending
                  ? '▲'
                  : '▼'
              )
            : ''
        }</span>
      </button>
    </div>
  `
}


function getCompetitionPlace(
  meet: LocalMeet,
  lifter: Lifter,
): number | null {

  if (
    lifter.status !==
      'active' ||
    lifter.isGuest ||
    lifter.weightClass ===
      null
  ) {
    return null
  }

  const total =
    getCompetitionTotalForLifter(
      meet,
      lifter
    )

  if (
    total === null
  ) {
    return null
  }

  const candidates =
    meet.state.lifters
      .filter(
        candidate =>
          candidate.divisionId ===
            lifter.divisionId &&
          candidate.weightClass ===
            lifter.weightClass &&
          candidate.status ===
            'active' &&
          !candidate.isGuest &&
          getCompetitionTotalForLifter(
            meet,
            candidate
          ) !==
            null
      )
      .sort(
        (a, b) => {

          const totalA =
            getCompetitionTotalForLifter(
              meet,
              a
            ) ?? 0

          const totalB =
            getCompetitionTotalForLifter(
              meet,
              b
            ) ?? 0

          if (
            totalA !==
            totalB
          ) {
            return (
              totalB -
              totalA
            )
          }

          const bodyWeightA =
            a.bodyWeight ??
            Number.POSITIVE_INFINITY

          const bodyWeightB =
            b.bodyWeight ??
            Number.POSITIVE_INFINITY

          if (
            bodyWeightA !==
            bodyWeightB
          ) {
            return (
              bodyWeightA -
              bodyWeightB
            )
          }

          return (
            a.lifterNumber -
            b.lifterNumber
          )
        }
      )

  const index =
    candidates.findIndex(
      candidate =>
        candidate.id ===
        lifter.id
    )

  if (
    index < 0
  ) {
    return null
  }

  for (
    let previousIndex = 0;
    previousIndex < index;
    previousIndex += 1
  ) {
    const previous =
      candidates[
        previousIndex
      ]

    if (
      getCompetitionTotalForLifter(
        meet,
        previous
      ) ===
        total &&
      previous.bodyWeight ===
        lifter.bodyWeight
    ) {
      return (
        previousIndex +
        1
      )
    }
  }

  return index + 1
}


function formatCompetitionPlace(
  lifter: Lifter,
  place: number | null,
): string {

  switch (
    lifter.status
  ) {
    case 'bombed':
      return 'BO'

    case 'scratched':
      return 'SC'

    case 'disqualified':
      return 'DQ'

    default:
      return place ===
        null
          ? '—'
          : String(
              place
            )
  }
}


function getCompetitionLifters(
  meet: LocalMeet,
): Lifter[] {

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return []
  }

  return [
    ...meet.state.lifters,
  ]
    .filter(
      lifter =>
        lifter.divisionId ===
          division.id &&
        (
          selectedCompetitionWeightClass ===
            null ||
          lifter.weightClass ===
            selectedCompetitionWeightClass
        )
    )
    .sort(
      (a, b) =>
        compareCompetitionLifters(
          meet,
          a,
          b
        )
    )
}


function selectFirstCompetitionLifter(
  meet: LocalMeet,
): void {

  selectedLifterId =
    getCompetitionLifters(
      meet
    )[0]?.id ??
    null
}


function getCompetitionWeightClasses(
  meet: LocalMeet,
): string[] {

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return []
  }

  const present =
    new Set(
      meet.state.lifters
        .filter(
          lifter =>
            lifter.divisionId ===
              division.id &&
            lifter.weightClass !==
              null
        )
        .map(
          lifter =>
            lifter.weightClass as
              string
        )
    )

  try {

    const rules =
      getDivisionRules(
        division
      )

    const ordered =
      rules.weightClasses
        .map(
          weightClass =>
            weightClass.name
        )
        .filter(
          name =>
            present.has(
              name
            )
        )

    const orderedSet =
      new Set(
        ordered
      )

    const extras =
      [...present]
        .filter(
          name =>
            !orderedSet.has(
              name
            )
        )
        .sort(
          (a, b) =>
            a.localeCompare(
              b
            )
        )

    return [
      ...ordered,
      ...extras,
    ]

  } catch {

    return [
      ...present,
    ].sort(
      (a, b) =>
        a.localeCompare(
          b
        )
    )
  }
}


function renderCompetitionWeightClassTabs(
  meet: LocalMeet,
): string {

  const weightClasses =
    getCompetitionWeightClasses(
      meet
    )

  return `
    <div
      class="competition-weight-tabs"
      role="tablist"
      aria-label="Weight Class"
    >
      ${
        weightClasses
          .map(
            weightClass => `
              <button
                type="button"
                class="competition-weight-tab ${
                  weightClass ===
                  selectedCompetitionWeightClass
                    ? 'active'
                    : ''
                }"
                data-competition-weight-class="${escapeHtml(weightClass)}"
                role="tab"
                aria-selected="${
                  weightClass ===
                  selectedCompetitionWeightClass
                    ? 'true'
                    : 'false'
                }"
              >
                ${escapeHtml(weightClass)}
              </button>
            `
          )
          .join('')
      }

      <button
        type="button"
        class="competition-weight-tab ${
          selectedCompetitionWeightClass ===
          null
            ? 'active'
            : ''
        }"
        data-competition-weight-class=""
        role="tab"
        aria-selected="${
          selectedCompetitionWeightClass ===
          null
            ? 'true'
            : 'false'
        }"
      >
        All Weight Classes
      </button>
    </div>
  `
}


function renderCompetitionDivisionTabs(
  meet: LocalMeet,
): string {

  if (
    meet.state.divisions.length <=
    1
  ) {
    return ''
  }

  return `
    <div
      class="competition-division-tabs"
      role="tablist"
      aria-label="Division"
    >
      ${
        meet.state.divisions
          .map(
            division => `
              <button
                type="button"
                class="competition-division-tab ${
                  division.id ===
                  selectedDivisionId
                    ? 'active'
                    : ''
                }"
                data-competition-division="${division.id}"
                role="tab"
                aria-selected="${
                  division.id ===
                  selectedDivisionId
                    ? 'true'
                    : 'false'
                }"
              >
                ${escapeHtml(division.name)}
              </button>
            `
          )
          .join('')
      }
    </div>
  `
}


function getCompetitionStatusSummary(
  meet: LocalMeet,
  lifter: Lifter,
): string {

  const codes =
    [
      getLifterTeamStatusCode(
        meet,
        lifter
      ),
      getLifterStatusCode(
        lifter
      ),
    ].filter(
      value =>
        value !== ''
    )

  return codes.length ===
    0
      ? '—'
      : codes.join(' / ')
}


function renderBestLiftCompetitionRows(
  meet: LocalMeet,
): string {

  const lifters =
    getCompetitionLifters(
      meet
    )

  const showWeightClass =
    selectedCompetitionWeightClass ===
      null

  if (
    lifters.length ===
    0
  ) {
    return `
      <div class="competition-empty-row">
        No lifters are available for this selection.
      </div>
    `
  }

  return lifters.map(
    lifter => {

      const results =
        getBestLiftResults(
          lifter
        )

      const total =
        calculateCompetitionTotal(
          results
        )

      const selected =
        lifter.id ===
        selectedLifterId

      return `
        <div
          class="competition-row competition-best-row ${getLifterStatusRowClass(lifter)} ${
            showWeightClass
              ? 'with-weight-class'
              : ''
          } ${
            selected
              ? 'selected'
              : ''
          }"
          data-competition-lifter-row="${lifter.id}"
        >
          <div class="competition-center">
            ${lifter.lifterNumber}
          </div>

          <div class="competition-lifter-name">
            <strong>${escapeHtml(lifter.lastName)}, ${escapeHtml(lifter.firstName)}</strong>
          </div>

          <div>
            ${escapeHtml(getLifterTeamName(meet, lifter))}
          </div>

          <div class="competition-center">
            ${formatCompetitionDisplayWeight(lifter.bodyWeight)}
          </div>

          ${
            showWeightClass
              ? `
                <div class="competition-center">
                  ${escapeHtml(lifter.weightClass ?? '—')}
                </div>
              `
              : ''
          }

          <div
            class="competition-center"
            data-competition-place="${lifter.id}"
          >
            ${formatCompetitionPlace(
              lifter,
              getCompetitionPlace(
                meet,
                lifter
              )
            )}
          </div>

          ${
            renderBestLiftInput(
              lifter,
              'squat',
              results.squat
            )
          }

          ${
            renderBestLiftInput(
              lifter,
              'bench',
              results.bench
            )
          }

          ${
            renderBestLiftInput(
              lifter,
              'deadlift',
              results.deadlift
            )
          }

          <div
            class="competition-total"
            data-best-total="${lifter.id}"
          >
            ${formatCompetitionDisplayWeight(total)}
          </div>

          <div
            class="competition-center"
            data-competition-status="${lifter.id}"
          >
            ${escapeHtml(getCompetitionStatusSummary(meet, lifter))}
          </div>

          <div
            data-competition-readiness="${lifter.id}"
            class="readiness ${
              getLifterReadinessLabel(
                lifter,
                meet
              ) === 'Ready'
                ? 'ready'
                : getLifterReadinessLabel(
                    lifter,
                    meet
                  ) === 'Not Competing'
                  ? 'not-competing'
                  : 'attention'
            }"
          >
            ${getLifterReadinessLabel(lifter, meet)}
          </div>
        </div>
      `
    }
  ).join('')
}


function renderBestLiftInput(
  lifter: Lifter,
  lift: CompetitionLift,
  value: number | null,
): string {

  return `
    <div class="competition-result-cell">
      <input
        class="competition-result-input"
        type="text"
        inputmode="decimal"
        autocomplete="off"
        value="${formatCompetitionWeight(value)}"
        data-best-lift="${lift}"
        data-competition-lifter-id="${lifter.id}"
        data-competition-column="best-${lift}"
        aria-label="${lift} best lift for ${escapeHtml(lifter.firstName)} ${escapeHtml(lifter.lastName)}"
        ${
          isCompetitionResultEditingLocked(
            lifter
          )
            ? 'disabled'
            : ''
        }
      >
    </div>
  `
}


function getAttemptStatusSymbol(
  status: CompetitionAttempt['status'],
): string {

  switch (
    status
  ) {
    case 'good':
      return '✓'

    case 'bad':
      return '×'

    default:
      return ''
  }
}


function getAttemptStatusTitle(
  status: CompetitionAttempt['status'],
): string {

  switch (
    status
  ) {
    case 'good':
      return 'Good'

    case 'bad':
      return 'Failed'

    default:
      return 'Unknown'
  }
}


function getNextAttemptStatus(
  status: CompetitionAttempt['status'],
): CompetitionAttempt['status'] {

  switch (
    status
  ) {
    case 'unspecified':
      return 'good'

    case 'good':
      return 'bad'

    default:
      return 'unspecified'
  }
}


function renderAttemptStatusCycle(
  lifterId: number,
  lift: CompetitionLift,
  attemptKey: CompetitionAttemptKey,
  attempt: CompetitionAttempt,
  disabled: boolean,
): string {

  const title =
    getAttemptStatusTitle(
      attempt.status
    )

  return `
    <button
      type="button"
      class="attempt-status-cycle attempt-status-${attempt.status}"
      data-attempt-status-cycle
      data-competition-lifter-id="${lifterId}"
      data-attempt-lift="${lift}"
      data-attempt-key="${attemptKey}"
      data-attempt-status-title="${title}"
      ${
        disabled
          ? ''
          : `title="${title} — click to cycle result"`
      }
      aria-label="${lift} ${attemptKey}: ${title}.${
        disabled
          ? ''
          : ' Click to cycle result.'
      }"
      tabindex="-1"
      ${disabled ? 'disabled' : ''}
    >${getAttemptStatusSymbol(attempt.status)}</button>
  `
}


function renderAttemptCell(
  lifter: Lifter,
  lift: CompetitionLift,
  attemptKey: CompetitionAttemptKey,
  attempt: CompetitionAttempt,
): string {

  const editingLocked =
    isCompetitionResultEditingLocked(
      lifter
    )

  return `
    <div
      class="competition-attempt-cell attempt-${attempt.status}"
      data-attempt-cell
    >
      <input
        class="competition-result-input competition-attempt-input"
        type="text"
        inputmode="decimal"
        autocomplete="off"
        value="${formatCompetitionWeight(attempt.weight)}"
        data-attempt-weight
        data-competition-lifter-id="${lifter.id}"
        data-attempt-lift="${lift}"
        data-attempt-key="${attemptKey}"
        data-competition-column="${lift}-${attemptKey}"
        aria-label="${lift} ${attemptKey} for ${escapeHtml(lifter.firstName)} ${escapeHtml(lifter.lastName)}"
        ${editingLocked ? 'disabled' : ''}
      >

      ${
        renderAttemptStatusCycle(
          lifter.id,
          lift,
          attemptKey,
          attempt,
          editingLocked
        )
      }
    </div>
  `
}


function renderAllAttemptCompetitionRows(
  meet: LocalMeet,
): string {

  const lifters =
    getCompetitionLifters(
      meet
    )

  const showWeightClass =
    selectedCompetitionWeightClass ===
      null

  if (
    lifters.length ===
    0
  ) {
    return `
      <div class="competition-empty-row">
        No lifters are available for this selection.
      </div>
    `
  }

  return lifters.map(
    lifter => {

      const attempts =
        getAllAttemptResults(
          lifter
        )

      const best =
        getAllAttemptBestLifts(
          lifter
        )

      const total =
        calculateCompetitionTotal(
          best
        )

      const selected =
        lifter.id ===
        selectedLifterId

      return `
        <div
          class="competition-row competition-attempt-row ${getLifterStatusRowClass(lifter)} ${
            showWeightClass
              ? 'with-weight-class'
              : ''
          } ${
            selected
              ? 'selected'
              : ''
          }"
          data-competition-lifter-row="${lifter.id}"
        >
          <div class="competition-center">
            ${lifter.lifterNumber}
          </div>

          <div class="competition-lifter-name">
            <strong>${escapeHtml(lifter.lastName)}, ${escapeHtml(lifter.firstName)}</strong>
          </div>

          <div>
            ${escapeHtml(getLifterTeamName(meet, lifter))}
          </div>

          <div class="competition-center">
            ${formatCompetitionDisplayWeight(lifter.bodyWeight)}
          </div>

          ${
            showWeightClass
              ? `
                <div class="competition-center">
                  ${escapeHtml(lifter.weightClass ?? '—')}
                </div>
              `
              : ''
          }

          <div
            class="competition-center"
            data-competition-place="${lifter.id}"
          >
            ${formatCompetitionPlace(
              lifter,
              getCompetitionPlace(
                meet,
                lifter
              )
            )}
          </div>

          ${renderAttemptCell(lifter, 'squat', 'attempt1', attempts.squat.attempt1)}
          ${renderAttemptCell(lifter, 'squat', 'attempt2', attempts.squat.attempt2)}
          ${renderAttemptCell(lifter, 'squat', 'attempt3', attempts.squat.attempt3)}

          ${renderAttemptCell(lifter, 'bench', 'attempt1', attempts.bench.attempt1)}
          ${renderAttemptCell(lifter, 'bench', 'attempt2', attempts.bench.attempt2)}
          ${renderAttemptCell(lifter, 'bench', 'attempt3', attempts.bench.attempt3)}

          ${renderAttemptCell(lifter, 'deadlift', 'attempt1', attempts.deadlift.attempt1)}
          ${renderAttemptCell(lifter, 'deadlift', 'attempt2', attempts.deadlift.attempt2)}
          ${renderAttemptCell(lifter, 'deadlift', 'attempt3', attempts.deadlift.attempt3)}

          <div
            class="competition-best-summary"
            data-attempt-best="${lifter.id}-squat"
          >
            ${formatCompetitionDisplayWeight(best.squat)}
          </div>

          <div
            class="competition-best-summary"
            data-attempt-best="${lifter.id}-bench"
          >
            ${formatCompetitionDisplayWeight(best.bench)}
          </div>

          <div
            class="competition-best-summary"
            data-attempt-best="${lifter.id}-deadlift"
          >
            ${formatCompetitionDisplayWeight(best.deadlift)}
          </div>

          <div
            class="competition-total"
            data-attempt-total="${lifter.id}"
          >
            ${formatCompetitionDisplayWeight(total)}
          </div>

          <div
            data-competition-readiness="${lifter.id}"
            class="readiness ${
              getLifterReadinessLabel(
                lifter,
                meet
              ) === 'Ready'
                ? 'ready'
                : getLifterReadinessLabel(
                    lifter,
                    meet
                  ) === 'Not Competing'
                  ? 'not-competing'
                  : 'attention'
            }"
          >
            ${getLifterReadinessLabel(lifter, meet)}
          </div>
        </div>
      `
    }
  ).join('')
}


function renderCompetition():
  string {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return `
      <main class="workspace competition-workspace">
        <section class="workspace-panel competition-panel">
          <div class="competition-placeholder">
            <strong>No Meet Selected</strong>
            <span>Select a meet on Registration before entering competition results.</span>
          </div>
        </section>
      </main>
    `
  }

  const division =
    getSelectedDivision()

  const availableWeightClasses =
    getCompetitionWeightClasses(
      meet
    )

  if (
    selectedCompetitionWeightClass !==
      null &&
    !availableWeightClasses.includes(
      selectedCompetitionWeightClass
    )
  ) {
    selectedCompetitionWeightClass =
      availableWeightClasses[0] ??
      null

    rememberCompetitionWeightClass(
      meet
    )
  }

  const allAttempts =
    meet.state.meet
      .resultEntryMode ===
      'all-attempts'

  const showWeightClass =
    selectedCompetitionWeightClass ===
      null

  return `
    <main class="workspace competition-workspace">
      <section class="workspace-panel competition-panel">

        ${renderCompetitionDivisionTabs(meet)}

        ${
          division === undefined
            ? ''
            : renderCompetitionWeightClassTabs(
                meet
              )
        }

        <div class="competition-grid-wrap">
          ${
            allAttempts
              ? `
                <div class="competition-grid competition-attempt-grid">
                  <div class="competition-row competition-header competition-attempt-row ${
                    showWeightClass
                      ? 'with-weight-class'
                      : ''
                  }">
                    ${renderCompetitionSortHeader('Lifter#', 'lifterNumber')}
                    ${renderCompetitionSortHeader('Lifter', 'lifter')}
                    ${renderCompetitionSortHeader('Team', 'team')}
                    ${renderCompetitionSortHeader('BWT', 'bodyWeight')}
                    ${
                      showWeightClass
                        ? renderCompetitionSortHeader(
                            'Weight Class',
                            'weightClass'
                          )
                        : ''
                    }
                    ${renderCompetitionSortHeader('Place', 'place')}
                    <div>1st<br>Squat</div>
                    <div>2nd<br>Squat</div>
                    <div>3rd<br>Squat</div>
                    <div>1st<br>Bench</div>
                    <div>2nd<br>Bench</div>
                    <div>3rd<br>Bench</div>
                    <div>1st<br>Deadlift</div>
                    <div>2nd<br>Deadlift</div>
                    <div>3rd<br>Deadlift</div>
                    ${renderCompetitionSortHeader('Best Squat', 'bestSquat')}
                    ${renderCompetitionSortHeader('Best Bench', 'bestBench')}
                    ${renderCompetitionSortHeader('Best Deadlift', 'bestDeadlift')}
                    ${renderCompetitionSortHeader('Total', 'total')}
                    <div>Readiness</div>
                  </div>

                  <div class="competition-body">
                    ${renderAllAttemptCompetitionRows(meet)}
                  </div>
                </div>
              `
              : `
                <div class="competition-grid competition-best-grid">
                  <div class="competition-row competition-header competition-best-row ${
                    showWeightClass
                      ? 'with-weight-class'
                      : ''
                  }">
                    ${renderCompetitionSortHeader('Lifter#', 'lifterNumber')}
                    ${renderCompetitionSortHeader('Lifter', 'lifter')}
                    ${renderCompetitionSortHeader('Team', 'team')}
                    ${renderCompetitionSortHeader('BWT', 'bodyWeight')}
                    ${
                      showWeightClass
                        ? renderCompetitionSortHeader(
                            'Weight Class',
                            'weightClass'
                          )
                        : ''
                    }
                    ${renderCompetitionSortHeader('Place', 'place')}
                    ${renderCompetitionSortHeader('Best Squat', 'bestSquat')}
                    ${renderCompetitionSortHeader('Best Bench', 'bestBench')}
                    ${renderCompetitionSortHeader('Best Deadlift', 'bestDeadlift')}
                    ${renderCompetitionSortHeader('Total', 'total')}
                    <div>Status</div>
                    <div>Readiness</div>
                  </div>

                  <div class="competition-body">
                    ${renderBestLiftCompetitionRows(meet)}
                  </div>
                </div>
              `
          }
        </div>

      </section>
    </main>
  `
}


function getCompetitionLifterById(
  lifterId: number,
): Lifter | undefined {

  return getSelectedMeet()
    ?.state.lifters.find(
      lifter =>
        lifter.id ===
        lifterId
    )
}


function updateCompetitionPlaceDisplays(
  meet: LocalMeet,
): void {

  for (
    const lifter of
    getCompetitionLifters(
      meet
    )
  ) {
    const cell =
      document.querySelector<HTMLElement>(
        `[data-competition-place="${lifter.id}"]`
      )

    if (
      cell !== null
    ) {
      cell.textContent =
        formatCompetitionPlace(
          lifter,
          getCompetitionPlace(
            meet,
            lifter
          )
        )
    }
  }
}


function updateBestLiftTotalDisplay(
  lifter: Lifter,
): void {

  const total =
    calculateCompetitionTotal(
      getBestLiftResults(
        lifter
      )
    )

  const cell =
    document.querySelector<HTMLElement>(
      `[data-best-total="${lifter.id}"]`
    )

  if (
    cell !== null
  ) {
    cell.textContent =
      formatCompetitionDisplayWeight(
        total
      )
  }

  const meet =
    getSelectedMeet()

  if (
    meet !== undefined
  ) {
    updateCompetitionPlaceDisplays(
      meet
    )
  }
}


function updateAttemptSummaryDisplay(
  lifter: Lifter,
): void {

  const best =
    getAllAttemptBestLifts(
      lifter
    )

  const total =
    calculateCompetitionTotal(
      best
    )

  const values:
    Array<[
      CompetitionLift,
      number | null,
    ]> = [
      ['squat', best.squat],
      ['bench', best.bench],
      ['deadlift', best.deadlift],
    ]

  for (
    const [
      lift,
      value,
    ] of values
  ) {
    const cell =
      document.querySelector<HTMLElement>(
        `[data-attempt-best="${lifter.id}-${lift}"]`
      )

    if (
      cell !== null
    ) {
      cell.textContent =
        formatCompetitionDisplayWeight(
          value
        )
    }
  }

  const totalCell =
    document.querySelector<HTMLElement>(
      `[data-attempt-total="${lifter.id}"]`
    )

  if (
    totalCell !== null
  ) {
    totalCell.textContent =
      formatCompetitionDisplayWeight(
        total
      )
  }

  const meet =
    getSelectedMeet()

  if (
    meet !== undefined
  ) {
    updateCompetitionPlaceDisplays(
      meet
    )
  }
}


function updateCompetitionLifterStatusDisplays(
  meet: LocalMeet,
  lifter: Lifter,
): void {

  const row =
    document.querySelector<HTMLElement>(
      `[data-competition-lifter-row="${lifter.id}"]`
    )

  if (
    row !== null
  ) {
    row.classList.remove(
      'lifter-status-bombed',
      'lifter-status-scratched',
      'lifter-status-disqualified'
    )

    const statusClass =
      getLifterStatusRowClass(
        lifter
      )

    if (
      statusClass !== ''
    ) {
      row.classList.add(
        statusClass
      )
    }
  }

  document
    .querySelectorAll<HTMLElement>(
      `[data-competition-status="${lifter.id}"]`
    )
    .forEach(
      element => {
        element.textContent =
          getCompetitionStatusSummary(
            meet,
            lifter
          )
      }
    )

  updateCompetitionResultEditingState(
    lifter
  )

  const readinessLabel =
    getLifterReadinessLabel(
      lifter,
      meet
    )

  document
    .querySelectorAll<HTMLElement>(
      `[data-competition-readiness="${lifter.id}"]`
    )
    .forEach(
      element => {
        element.textContent =
          readinessLabel

        element.classList.remove(
          'ready',
          'not-competing',
          'attention'
        )

        element.classList.add(
          readinessLabel ===
            'Ready'
              ? 'ready'
              : readinessLabel ===
                'Not Competing'
                ? 'not-competing'
                : 'attention'
        )
      }
    )
}


function hasThreeFailedAttemptsOnLift(
  lifter: Lifter,
): boolean {

  const results =
    getAllAttemptResults(
      lifter
    )

  return [
    results.squat,
    results.bench,
    results.deadlift,
  ].some(
    attempts =>
      attempts.attempt1.status ===
        'bad' &&
      attempts.attempt2.status ===
        'bad' &&
      attempts.attempt3.status ===
        'bad'
  )
}


function isCompetitionResultEditingLocked(
  lifter: Lifter,
): boolean {

  return lifter.status ===
      'scratched' ||
    lifter.status ===
      'disqualified'
}


function updateCompetitionResultEditingState(
  lifter: Lifter,
): void {

  const locked =
    isCompetitionResultEditingLocked(
      lifter
    )

  document
    .querySelectorAll<
      HTMLInputElement | HTMLButtonElement
    >(
      `[data-competition-lifter-id="${lifter.id}"][data-best-lift], ` +
      `[data-competition-lifter-id="${lifter.id}"][data-attempt-weight], ` +
      `[data-competition-lifter-id="${lifter.id}"][data-attempt-status-cycle]`
    )
    .forEach(
      control => {
        control.disabled =
          locked

        if (
          control instanceof HTMLButtonElement &&
          control.hasAttribute(
            'data-attempt-status-cycle'
          )
        ) {
          const title =
            control.dataset
              .attemptStatusTitle ??
              'Result'

          const lift =
            control.dataset
              .attemptLift ??
              'lift'

          const attemptKey =
            control.dataset
              .attemptKey ??
              'attempt'

          if (
            locked
          ) {
            control.removeAttribute(
              'title'
            )

            control.setAttribute(
              'aria-label',
              `${lift} ${attemptKey}: ${title}.`
            )
          } else {
            control.title =
              `${title} — click to cycle result`

            control.setAttribute(
              'aria-label',
              `${lift} ${attemptKey}: ${title}. Click to cycle result.`
            )
          }
        }
      }
    )
}


function updateBombedStatusFromAttempts(
  lifter: Lifter,
  changedAttemptStatus: CompetitionAttempt['status'],
): void {

  const hasBombedEvent =
    hasThreeFailedAttemptsOnLift(
      lifter
    )

  let statusChanged =
    false

  if (
    hasBombedEvent
  ) {
    competitionAutoBombedLifterIds.add(
      lifter.id
    )

    if (
      lifter.status !==
        'bombed'
    ) {
      lifter.status =
        'bombed'

      statusChanged =
        true
    }
  } else {
    competitionAutoBombedLifterIds.delete(
      lifter.id
    )

    if (
      lifter.status ===
        'bombed' &&
      (
        changedAttemptStatus ===
          'good' ||
        changedAttemptStatus ===
          'unspecified'
      )
    ) {
      lifter.status =
        'active'

      statusChanged =
        true
    }
  }

  if (
    !statusChanged
  ) {
    return
  }

  const meet =
    getSelectedMeet()

  if (
    meet !== undefined
  ) {
    updateCompetitionLifterStatusDisplays(
      meet,
      lifter
    )

    updateCompetitionPlaceDisplays(
      meet
    )
  }
}


function setAttemptStatus(
  lifter: Lifter,
  lift: CompetitionLift,
  attemptKey: CompetitionAttemptKey,
  status: CompetitionAttempt['status'],
  sourceElement?: HTMLElement,
): void {

  if (
    isCompetitionResultEditingLocked(
      lifter
    )
  ) {
    return
  }

  const results =
    ensureAllAttemptResults(
      lifter
    )

  const attempt =
    results[lift][attemptKey]

  attempt.status =
    status

  attempt.source =
    'manual'

  const cell =
    sourceElement
      ?.closest<HTMLElement>(
        '[data-attempt-cell]'
      )

  if (
    cell !== null &&
    cell !== undefined
  ) {
    cell.classList.remove(
      'attempt-good',
      'attempt-bad',
      'attempt-unspecified'
    )

    cell.classList.add(
      `attempt-${status}`
    )

    const cycleButton =
      cell.querySelector<HTMLButtonElement>(
        '[data-attempt-status-cycle]'
      )

    if (
      cycleButton !== null
    ) {
      cycleButton.classList.remove(
        'attempt-status-good',
        'attempt-status-bad',
        'attempt-status-unspecified'
      )

      cycleButton.classList.add(
        `attempt-status-${status}`
      )

      cycleButton.textContent =
        getAttemptStatusSymbol(
          status
        )

      const title =
        getAttemptStatusTitle(
          status
        )

      cycleButton.dataset
        .attemptStatusTitle =
          title

      if (
        cycleButton.disabled
      ) {
        cycleButton.removeAttribute(
          'title'
        )

        cycleButton.setAttribute(
          'aria-label',
          `${lift} ${attemptKey}: ${title}.`
        )
      } else {
        cycleButton.title =
          `${title} — click to cycle result`

        cycleButton.setAttribute(
          'aria-label',
          `${lift} ${attemptKey}: ${title}. Click to cycle result.`
        )
      }
    }
  }

  updateBombedStatusFromAttempts(
    lifter,
    status
  )

  updateAttemptSummaryDisplay(
    lifter
  )
}


function focusCompetitionFieldOnNextLifter(
  current: HTMLElement,
): void {

  const lifterId =
    Number(
      current.dataset
        .competitionLifterId
    )

  const column =
    current.dataset
      .competitionColumn

  if (
    Number.isNaN(
      lifterId
    ) ||
    column ===
    undefined
  ) {
    return
  }

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }

  const lifters =
    getCompetitionLifters(
      meet
    )

  const index =
    lifters.findIndex(
      lifter =>
        lifter.id ===
        lifterId
    )

  if (
    index < 0 ||
    index >=
      lifters.length - 1
  ) {
    return
  }

  const nextId =
    lifters[index + 1]
      .id

  document
    .querySelector<HTMLElement>(
      `[data-competition-lifter-id="${nextId}"][data-competition-column="${column}"]`
    )
    ?.focus()
}


function focusCompetitionWeightByArrow(
  current: HTMLInputElement,
  key: string,
): void {

  const row =
    current.closest<HTMLElement>(
      '[data-competition-lifter-row]'
    )

  if (
    row === null
  ) {
    return
  }

  if (
    key === 'ArrowLeft' ||
    key === 'ArrowRight'
  ) {
    const inputs =
      [
        ...row.querySelectorAll<HTMLInputElement>(
          '.competition-result-input'
        ),
      ]

    const index =
      inputs.indexOf(
        current
      )

    const nextIndex =
      key === 'ArrowLeft'
        ? index - 1
        : index + 1

    const nextInput =
      inputs[nextIndex]

    if (
      nextInput !== undefined
    ) {
      const lifterId =
        Number(
          nextInput.dataset
            .competitionLifterId
        )

      if (
        !Number.isNaN(
          lifterId
        )
      ) {
        selectCompetitionRow(
          lifterId
        )
      }

      nextInput.focus()
    }

    return
  }

  if (
    key !== 'ArrowUp' &&
    key !== 'ArrowDown'
  ) {
    return
  }

  const meet =
    getSelectedMeet()

  const column =
    current.dataset
      .competitionColumn

  const lifterId =
    Number(
      current.dataset
        .competitionLifterId
    )

  if (
    meet === undefined ||
    column === undefined ||
    Number.isNaN(
      lifterId
    )
  ) {
    return
  }

  const lifters =
    getCompetitionLifters(
      meet
    )

  const index =
    lifters.findIndex(
      lifter =>
        lifter.id ===
        lifterId
    )

  const nextIndex =
    key === 'ArrowUp'
      ? index - 1
      : index + 1

  const nextLifter =
    lifters[nextIndex]

  if (
    nextLifter === undefined
  ) {
    return
  }

  const nextInput =
    document
      .querySelector<HTMLInputElement>(
        `[data-competition-lifter-id="${nextLifter.id}"][data-competition-column="${column}"]`
      )

  if (
    nextInput !== null
  ) {
    selectCompetitionRow(
      nextLifter.id
    )

    nextInput.focus()
  }
}


function resolveLifterStatusShortcut(
  lifter: Lifter,
  requestedStatus: Lifter['status'],
): Lifter['status'] {

  let resolvedStatus =
    requestedStatus

  if (
    requestedStatus !== 'active' &&
    lifter.status === requestedStatus
  ) {
    resolvedStatus =
      'active'
  }

  if (
    resolvedStatus === 'active' &&
    hasThreeFailedAttemptsOnLift(
      lifter
    )
  ) {
    resolvedStatus =
      'bombed'
  }

  return resolvedStatus
}


function setLifterStatusFromShortcut(
  lifter: Lifter,
  requestedStatus: Lifter['status'],
): void {

  const resolvedStatus =
    resolveLifterStatusShortcut(
      lifter,
      requestedStatus
    )

  const hasBombedEvent =
    hasThreeFailedAttemptsOnLift(
      lifter
    )

  if (
    resolvedStatus === 'bombed' &&
    hasBombedEvent
  ) {
    competitionAutoBombedLifterIds.add(
      lifter.id
    )
  } else {
    competitionAutoBombedLifterIds.delete(
      lifter.id
    )
  }

  lifter.status =
    resolvedStatus
}


function setCompetitionLifterStatusShortcut(
  lifterId: number,
  status: Lifter['status'],
): void {

  const meet =
    getSelectedMeet()

  const lifter =
    meet?.state.lifters.find(
      item =>
        item.id ===
        lifterId
    )

  if (
    meet === undefined ||
    lifter === undefined
  ) {
    return
  }

  setLifterStatusFromShortcut(
    lifter,
    status
  )

  selectedLifterId =
    lifter.id

  updateCompetitionLifterStatusDisplays(
    meet,
    lifter
  )

  updateCompetitionPlaceDisplays(
    meet
  )
}


function handleCompetitionStatusShortcut(
  event: KeyboardEvent,
): boolean {

  const key =
    event.key.toLocaleLowerCase()

  let status:
    Lifter['status'] | null =
      null

  switch (
    key
  ) {
    case 'a':
      status = 'active'
      break

    case 'b':
      status = 'bombed'
      break

    case 's':
      status = 'scratched'
      break

    case 'q':
      status = 'disqualified'
      break

    default:
      return false
  }

  const active =
    document.activeElement as
      HTMLElement | null

  const activeLifterId =
    active?.dataset
      .competitionLifterId

  const lifterId =
    activeLifterId === undefined
      ? selectedLifterId
      : Number(
          activeLifterId
        )

  if (
    lifterId === null ||
    Number.isNaN(
      lifterId
    )
  ) {
    return false
  }

  event.preventDefault()
  event.stopPropagation()

  setCompetitionLifterStatusShortcut(
    lifterId,
    status
  )

  return true
}


function handleCompetitionArrowNavigation(
  event: KeyboardEvent,
): boolean {

  if (
    event.key !== 'ArrowLeft' &&
    event.key !== 'ArrowRight' &&
    event.key !== 'ArrowUp' &&
    event.key !== 'ArrowDown'
  ) {
    return false
  }

  const active =
    document.activeElement as
      HTMLElement | null

  // Weight inputs handle their own arrow navigation.
  if (
    active?.classList.contains(
      'competition-result-input'
    )
  ) {
    return false
  }

  const activeLifterId =
    active?.dataset
      .competitionLifterId

  const lifterId =
    activeLifterId === undefined
      ? selectedLifterId
      : Number(
          activeLifterId
        )

  if (
    lifterId === null ||
    Number.isNaN(
      lifterId
    )
  ) {
    return false
  }

  const row =
    document.querySelector<HTMLElement>(
      `[data-competition-lifter-row="${lifterId}"]`
    )

  if (
    row === null
  ) {
    return false
  }

  let currentInput:
    HTMLInputElement | null =
      null

  if (
    active?.matches(
      '[data-attempt-status-cycle]'
    )
  ) {
    const lift =
      active.dataset
        .attemptLift

    const attemptKey =
      active.dataset
        .attemptKey

    if (
      lift !== undefined &&
      attemptKey !== undefined
    ) {
      currentInput =
        row.querySelector<HTMLInputElement>(
          `[data-attempt-weight][data-attempt-lift="${lift}"][data-attempt-key="${attemptKey}"]`
        )
    }
  }

  if (
    currentInput === null
  ) {
    const column =
      active?.dataset
        .competitionColumn

    if (
      column !== undefined
    ) {
      currentInput =
        row.querySelector<HTMLInputElement>(
          `[data-competition-column="${column}"]`
        )
    }
  }

  if (
    currentInput === null
  ) {
    const inputs =
      [
        ...row.querySelectorAll<HTMLInputElement>(
          '.competition-result-input'
        ),
      ]

    if (
      inputs.length === 0
    ) {
      return false
    }

    if (
      event.key === 'ArrowLeft'
    ) {
      currentInput =
        inputs[inputs.length - 1] ??
        null
    } else if (
      event.key === 'ArrowRight'
    ) {
      currentInput =
        inputs[0] ??
        null
    } else {
      currentInput =
        inputs[0] ??
        null

      if (
        currentInput !== null
      ) {
        focusCompetitionWeightByArrow(
          currentInput,
          event.key
        )

        event.preventDefault()
        event.stopPropagation()

        return true
      }
    }

    if (
      currentInput !== null
    ) {
      selectCompetitionRow(
        lifterId
      )

      currentInput.focus()

      event.preventDefault()
      event.stopPropagation()

      return true
    }
  }

  if (
    currentInput === null
  ) {
    return false
  }

  event.preventDefault()
  event.stopPropagation()

  focusCompetitionWeightByArrow(
    currentInput,
    event.key
  )

  return true
}


function wireCompetitionStatusShortcuts():
  void {

  if (
    competitionShortcutKeydownHandler !==
    null
  ) {
    document.removeEventListener(
      'keydown',
      competitionShortcutKeydownHandler
    )
  }

  competitionShortcutKeydownHandler =
    event => {
      if (
        event.defaultPrevented
      ) {
        return
      }

      if (
        handleCompetitionArrowNavigation(
          event
        )
      ) {
        return
      }

      handleCompetitionStatusShortcut(
        event
      )
    }

  document.addEventListener(
    'keydown',
    competitionShortcutKeydownHandler
  )
}


function disableCompetitionStatusShortcuts():
  void {

  if (
    competitionShortcutKeydownHandler ===
    null
  ) {
    return
  }

  document.removeEventListener(
    'keydown',
    competitionShortcutKeydownHandler
  )

  competitionShortcutKeydownHandler =
    null
}


function selectCompetitionRow(
  lifterId: number,
): void {

  selectedLifterId =
    lifterId

  document
    .querySelectorAll<HTMLElement>(
      '[data-competition-lifter-row]'
    )
    .forEach(
      row => {
        row.classList.toggle(
          'selected',
          Number(
            row.dataset
              .competitionLifterRow
          ) ===
          lifterId
        )
      }
    )
}


function wireCompetition():
  void {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }

  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-competition-sort]'
    )
    .forEach(
      button => {
        button.addEventListener(
          'click',
          () => {
            const column =
              button.dataset
                .competitionSort as
                  CompetitionSortColumn | undefined

            if (
              column ===
              undefined
            ) {
              return
            }

            if (
              competitionSortColumn ===
              column
            ) {
              competitionSortAscending =
                !competitionSortAscending
            } else {
              competitionSortColumn =
                column

              competitionSortAscending =
                true
            }

            renderApp()
          }
        )
      }
    )

  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-competition-division]'
    )
    .forEach(
      button => {
        button.addEventListener(
          'click',
          () => {
            const id =
              Number(
                button.dataset
                  .competitionDivision
              )

            if (
              Number.isNaN(
                id
              )
            ) {
              return
            }

            rememberCompetitionWeightClass(
              meet
            )

            selectedDivisionId =
              id

            selectedTeamId =
              null

            restoreCompetitionWeightClass(
              meet,
              id
            )

            selectFirstCompetitionLifter(
              meet
            )

            renderApp()
          }
        )
      }
    )

  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-competition-weight-class]'
    )
    .forEach(
      button => {
        button.addEventListener(
          'click',
          () => {
            const value =
              button.dataset
                .competitionWeightClass ??
              ''

            selectedCompetitionWeightClass =
              value === ''
                ? null
                : value

            rememberCompetitionWeightClass(
              meet
            )

            selectFirstCompetitionLifter(
              meet
            )

            renderApp()
          }
        )
      }
    )

  document
    .querySelectorAll<HTMLElement>(
      '[data-competition-lifter-row]'
    )
    .forEach(
      row => {

        row.addEventListener(
          'mousedown',
          () => {
            const id =
              Number(
                row.dataset
                  .competitionLifterRow
              )

            if (
              !Number.isNaN(
                id
              )
            ) {
              selectCompetitionRow(
                id
              )
            }
          }
        )
      }
    )

  document
    .querySelectorAll<HTMLInputElement>(
      '[data-best-lift]'
    )
    .forEach(
      input => {

        input.addEventListener(
          'focus',
          () => {
            const lifterId =
              Number(
                input.dataset
                  .competitionLifterId
              )

            if (
              !Number.isNaN(
                lifterId
              )
            ) {
              selectCompetitionRow(
                lifterId
              )
            }
          }
        )

        input.addEventListener(
          'input',
          () => {
            const lifterId =
              Number(
                input.dataset
                  .competitionLifterId
              )

            const lift =
              input.dataset
                .bestLift as
                  CompetitionLift | undefined

            const lifter =
              getCompetitionLifterById(
                lifterId
              )

            if (
              lifter === undefined ||
              lift === undefined ||
              isCompetitionResultEditingLocked(
                lifter
              )
            ) {
              return
            }

            const results =
              ensureBestLiftResults(
                lifter
              )

            results[lift] =
              readCompetitionWeight(
                input.value
              )

            updateBestLiftTotalDisplay(
              lifter
            )
          }
        )

        input.addEventListener(
          'keydown',
          event => {
            if (
              event.key === 'ArrowLeft' ||
              event.key === 'ArrowRight' ||
              event.key === 'ArrowUp' ||
              event.key === 'ArrowDown'
            ) {
              event.preventDefault()
              focusCompetitionWeightByArrow(
                input,
                event.key
              )

              return
            }

            if (
              event.key ===
              'Enter'
            ) {
              event.preventDefault()
              focusCompetitionFieldOnNextLifter(
                input
              )
            }
          }
        )
      }
    )

  document
    .querySelectorAll<HTMLInputElement>(
      '[data-attempt-weight]'
    )
    .forEach(
      input => {

        input.addEventListener(
          'focus',
          () => {
            const lifterId =
              Number(
                input.dataset
                  .competitionLifterId
              )

            if (
              !Number.isNaN(
                lifterId
              )
            ) {
              selectCompetitionRow(
                lifterId
              )
            }
          }
        )

        input.addEventListener(
          'input',
          () => {
            const lifterId =
              Number(
                input.dataset
                  .competitionLifterId
              )

            const lift =
              input.dataset
                .attemptLift as
                  CompetitionLift | undefined

            const attemptKey =
              input.dataset
                .attemptKey as
                  CompetitionAttemptKey | undefined

            const lifter =
              getCompetitionLifterById(
                lifterId
              )

            if (
              lifter === undefined ||
              lift === undefined ||
              attemptKey === undefined ||
              isCompetitionResultEditingLocked(
                lifter
              )
            ) {
              return
            }

            const attempt =
              ensureAllAttemptResults(
                lifter
              )[lift][attemptKey]

            attempt.weight =
              readCompetitionWeight(
                input.value
              )

            attempt.source =
              'manual'

            updateAttemptSummaryDisplay(
              lifter
            )
          }
        )

        input.addEventListener(
          'keydown',
          event => {

            const lifterId =
              Number(
                input.dataset
                  .competitionLifterId
              )

            const lift =
              input.dataset
                .attemptLift as
                  CompetitionLift | undefined

            const attemptKey =
              input.dataset
                .attemptKey as
                  CompetitionAttemptKey | undefined

            const lifter =
              getCompetitionLifterById(
                lifterId
              )

            if (
              lifter === undefined ||
              lift === undefined ||
              attemptKey === undefined
            ) {
              return
            }

            if (
              event.key === 'ArrowLeft' ||
              event.key === 'ArrowRight' ||
              event.key === 'ArrowUp' ||
              event.key === 'ArrowDown'
            ) {
              event.preventDefault()
              focusCompetitionWeightByArrow(
                input,
                event.key
              )

              return
            }

            const key =
              event.key
                .toLocaleLowerCase()

            if (
              event.key ===
              ' '
            ) {
              event.preventDefault()

              const attempt =
                ensureAllAttemptResults(
                  lifter
                )[lift][attemptKey]

              setAttemptStatus(
                lifter,
                lift,
                attemptKey,
                getNextAttemptStatus(
                  attempt.status
                ),
                input
              )

              return
            }

            if (
              key === 'g' ||
              key === 'r' ||
              key === 'w'
            ) {
              event.preventDefault()

              setAttemptStatus(
                lifter,
                lift,
                attemptKey,
                key === 'g'
                  ? 'good'
                  : key === 'r'
                    ? 'bad'
                    : 'unspecified',
                input
              )

              return
            }

            if (
              event.key ===
              'Enter'
            ) {
              event.preventDefault()
              focusCompetitionFieldOnNextLifter(
                input
              )
            }
          }
        )
      }
    )

  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-attempt-status-cycle]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          () => {
            const lifterId =
              Number(
                button.dataset
                  .competitionLifterId
              )

            const lift =
              button.dataset
                .attemptLift as
                  CompetitionLift | undefined

            const attemptKey =
              button.dataset
                .attemptKey as
                  CompetitionAttemptKey | undefined

            const lifter =
              getCompetitionLifterById(
                lifterId
              )

            if (
              lifter === undefined ||
              lift === undefined ||
              attemptKey === undefined
            ) {
              return
            }

            const attempt =
              ensureAllAttemptResults(
                lifter
              )[lift][attemptKey]

            setAttemptStatus(
              lifter,
              lift,
              attemptKey,
              getNextAttemptStatus(
                attempt.status
              ),
              button
            )
          }
        )
      }
    )
}


function readNumberInput(
  selector: string,
): number | null {

  const input =
    document.querySelector<HTMLInputElement>(
      selector
    )

  if (
    input === null ||
    input.value.trim() ===
    ''
  ) {
    return null
  }

  const value =
    Number(
      input.value
    )

  return Number.isFinite(value)
    ? value
    : null
}


function updateEntryWeightClasses():
  void {

  const meet =
    getSelectedMeet()

  const division =
    getSelectedDivision()

  const classInput =
    document.querySelector<HTMLSelectElement>(
      '#entryWeightClass'
    )

  if (
    meet === undefined ||
    division === undefined ||
    classInput === null
  ) {
    return
  }

  const bodyWeight =
    readNumberInput(
      '#entryBodyWeight'
    )

  const coefficientCell =
    document.querySelector<HTMLElement>(
      '#entryLifterCoefficient'
    )

  if (
    coefficientCell !== null
  ) {
    coefficientCell.textContent =
      formatBodyWeightCoefficient(
        getBodyWeightCoefficient(
          division,
          bodyWeight
        )
      )
  }

  let automaticClass =
    ''

  try {

    const rules =
      getDivisionRules(
        division
      )

    automaticClass =
      getAutomaticWeightClass(
        bodyWeight,
        rules.weightClasses
      ) ??
      ''

  } catch {
    automaticClass =
      ''
  }

  classInput.innerHTML =
    renderEntryWeightClassOptions(
      meet,
      division.id,
      automaticClass
    )

  classInput.value =
    automaticClass
}


function updateEditLifterWeightClasses():
  void {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined ||
    activeEdit?.type !==
      'lifter'
  ) {
    return
  }

  const lifter =
    meet.state.lifters.find(
      item =>
        item.id ===
        Number(
          activeEdit?.id
        )
    )

  const classInput =
    document.querySelector<HTMLSelectElement>(
      '#editLifterWeightClass'
    )

  const bodyWeightInput =
    document.querySelector<HTMLInputElement>(
      '#editLifterBodyWeight'
    )

  if (
    lifter === undefined ||
    classInput === null ||
    bodyWeightInput === null
  ) {
    return
  }

  const division =
    meet.state.divisions.find(
      item =>
        item.id ===
        lifter.divisionId
    )

  if (
    division === undefined
  ) {
    return
  }

  const bodyWeight =
    bodyWeightInput.value.trim() ===
    ''
      ? null
      : Number(
          bodyWeightInput.value
        )

  const coefficientCell =
    document.querySelector<HTMLElement>(
      '#editLifterCoefficient'
    )

  if (
    coefficientCell !== null
  ) {
    coefficientCell.textContent =
      formatBodyWeightCoefficient(
        getBodyWeightCoefficient(
          division,
          Number.isFinite(
            bodyWeight
          )
            ? bodyWeight
            : null
        )
      )
  }

  let selectedClass =
    classInput.value

  try {
    const rules =
      getDivisionRules(
        division
      )

    if (
      lifter.weightClassSource ===
        'automatic' &&
      !editLifterWeightClassManuallyChanged
    ) {
      selectedClass =
        getAutomaticWeightClass(
          bodyWeight,
          rules.weightClasses
        ) ??
        ''
    }

    classInput.innerHTML =
      renderEntryWeightClassOptions(
        meet,
        division.id,
        selectedClass
      )

    classInput.value =
      selectedClass

  } catch {
    // Keep the current selection when division
    // rules cannot be resolved.
  }
}


function commitNewLifter():
  void {

  const meet =
    getSelectedMeet()

  const division =
    getSelectedDivision()

  const team =
    getSelectedTeam()

  if (
    meet === undefined ||
    division === undefined ||
    team === undefined
  ) {
    window.alert(
      'Select a team before adding lifters.'
    )

    return
  }

  const numberInput =
    document.querySelector<HTMLInputElement>(
      '#entryLifterNumber'
    )

  const firstInput =
    document.querySelector<HTMLInputElement>(
      '#entryFirstName'
    )

  const lastInput =
    document.querySelector<HTMLInputElement>(
      '#entryLastName'
    )

  const classInput =
    document.querySelector<HTMLSelectElement>(
      '#entryWeightClass'
    )

  const gradeInput =
    document.querySelector<HTMLInputElement>(
      '#entryGrade'
    )

  const equipmentInput =
    document.querySelector<HTMLSelectElement>(
      '#entryEquipment'
    )

  const teamStatusInput =
    document.querySelector<HTMLSelectElement>(
      '#entryTeamStatus'
    )

  const lifterStatusInput =
    document.querySelector<HTMLSelectElement>(
      '#entryLifterStatus'
    )

  if (
    numberInput === null ||
    firstInput === null ||
    lastInput === null ||
    classInput === null ||
    equipmentInput === null ||
    teamStatusInput === null ||
    lifterStatusInput === null
  ) {
    return
  }

  const lifterNumber =
    Number(
      numberInput.value
    )

  if (
    !Number.isInteger(
      lifterNumber
    ) ||
    lifterNumber <= 0
  ) {
    window.alert(
      'Enter a valid lifter number.'
    )

    numberInput.focus()

    return
  }

  const firstName =
    firstInput.value.trim()

  const lastName =
    lastInput.value.trim()

  if (
    firstName === ''
  ) {
    window.alert(
      'Enter the lifter first name.'
    )

    firstInput.focus()

    return
  }

  if (
    lastName === ''
  ) {
    window.alert(
      'Enter the lifter last name.'
    )

    lastInput.focus()

    return
  }

  let rules

  try {

    rules =
      getDivisionRules(
        division
      )

  } catch (
    error
  ) {

    window.alert(
      error instanceof Error
        ? error.message
        : 'Unable to determine division rules.'
    )

    return
  }

  const bodyWeight =
    readNumberInput(
      '#entryBodyWeight'
    )

  const grade =
    gradeInput === null ||
    gradeInput.value.trim() ===
    ''
      ? null
      : Number(
          gradeInput.value
        )

  if (
    grade !== null &&
    (
      !Number.isInteger(
        grade
      ) ||
      grade < 9 ||
      grade > 12
    )
  ) {
    window.alert(
      'Grade must be 9, 10, 11, or 12.'
    )

    gradeInput?.focus()

    return
  }

  try {

    let lifter =
      createRegisteredLifter(
        meet.state,
        {
          id:
            getNextLifterId(
              meet.state
            ),

          lifterNumber,

          firstName,

          lastName,

          divisionId:
            division.id,

          teamId:
            team.id,

          bodyWeight,

          equipmentType:
            equipmentInput.value as
              Lifter['equipmentType'],

          age:
            null,

          grade,

          isGuest:
            teamStatusInput.value ===
            'guest',

          isExtraLifter:
            teamStatusInput.value ===
            'bteam',
        },
        rules
      )

    lifter.status =
      lifterStatusInput.value as
        Lifter['status']

    const selectedClass =
      classInput.value

    if (
      selectedClass !== '' &&
      selectedClass !==
        lifter.weightClass
    ) {
      lifter =
        assignRegisteredLifterWeightClass(
          lifter,
          selectedClass,
          rules
        )
    }

    meet.state.lifters.push(
      lifter
    )

    selectedLifterId =
      lifter.id

    registrationDefaults = {
      equipmentType:
        lifter.equipmentType,
    }

    activeEntry =
      'lifter'

    renderApp()

    flashRow(
      `[data-lifter-row="${lifter.id}"]`
    )

    focusElement(
      '#entryFirstName'
    )

  } catch (
    error
  ) {

    window.alert(
      error instanceof Error
        ? error.message
        : 'Unable to add lifter.'
    )
  }
}


function wireNavigation(): void {

  document
    .querySelector<HTMLButtonElement>(
      '#navRegistration'
    )
    ?.addEventListener(
      'click',
      () => {
        currentPage =
          'registration'

        selectedTeamId =
          null

        selectedCompetitionWeightClass =
          null

        renderApp()
      }
    )

  document
    .querySelector<HTMLButtonElement>(
      '#navCompetition'
    )
    ?.addEventListener(
      'click',
      () => {
        if (
          !finishBulkEdit(
            true
          ) ||
          !finishActiveEdit(
            true,
            false
          )
        ) {
          return
        }

        activeEntry =
          null

        currentPage =
          'competition'

        const meet =
          getSelectedMeet()

        if (
          meet !== undefined &&
          getSelectedDivision() ===
          undefined
        ) {
          selectFirstDivisionForMeet(
            meet
          )
        }

        if (
          meet !== undefined &&
          selectedDivisionId !==
            null
        ) {
          restoreCompetitionWeightClass(
            meet,
            selectedDivisionId
          )

          selectFirstCompetitionLifter(
            meet
          )
        }

        renderApp()
      }
    )

  const shortcutDialog =
    document.querySelector<HTMLDialogElement>(
      '#shortcutHelpDialog'
    )

  document
    .querySelector<HTMLButtonElement>(
      '#shortcutHelp'
    )
    ?.addEventListener(
      'click',
      () => {
        shortcutDialog?.showModal()
      }
    )

  document
    .querySelector<HTMLButtonElement>(
      '#closeShortcutHelp'
    )
    ?.addEventListener(
      'click',
      () => {
        shortcutDialog?.close()
      }
    )

  shortcutDialog
    ?.addEventListener(
      'click',
      event => {
        if (
          event.target ===
          shortcutDialog
        ) {
          shortcutDialog.close()
        }
      }
    )
}


function wireEntryKeyboard(
  selector: string,
  commit: () => void,
): void {

  document
    .querySelector<HTMLElement>(
      selector
    )
    ?.addEventListener(
      'keydown',
      event => {

        if (
          event.key ===
          'Escape'
        ) {
          event.preventDefault()
          cancelActiveEntry()
          return
        }

        if (
          event.key ===
          'Enter'
        ) {
          event.preventDefault()
          commit()
        }
      }
    )
}


function wireEditKeyboard():
  void {

  document
    .querySelector<HTMLElement>(
      '[data-edit-row]'
    )
    ?.addEventListener(
      'keydown',
      event => {

        if (
          event.key ===
          'Escape'
        ) {
          event.preventDefault()

          finishActiveEdit(
            true,
            true
          )

          return
        }

        if (
          event.key ===
          'Enter'
        ) {
          event.preventDefault()

          const editTarget =
            activeEdit

          if (
            editTarget?.type ===
            'lifter'
          ) {
            const meet =
              getSelectedMeet()

            const currentId =
              Number(
                editTarget.id
              )

            const visibleLifters =
              meet === undefined
                ? []
                : getSortedVisibleLifters(
                    meet
                  )

            const currentIndex =
              visibleLifters.findIndex(
                lifter =>
                  lifter.id ===
                  currentId
              )

            const nextLifterId =
              currentIndex >= 0
                ? (
                    visibleLifters[
                      currentIndex + 1
                    ]?.id ??
                    currentId
                  )
                : currentId

            if (
              commitActiveEdit(
                false
              )
            ) {
              selectedLifterId =
                nextLifterId

              renderApp()

              focusSelectedRegistrationRowLater(
                'lifter'
              )
            }

            return
          }

          commitActiveEdit(
            true
          )
        }
      }
    )
}


function wireOutsideEntryDismissal():
  void {

  if (
    outsideEntryClickHandler !==
    null
  ) {
    document.removeEventListener(
      'click',
      outsideEntryClickHandler
    )
  }

  outsideEntryClickHandler =
    event => {

      const target =
        event.target

      if (
        !(target instanceof Element)
      ) {
        return
      }

      if (
        target.closest(
          '[data-entry-row]'
        ) !== null ||
        target.closest(
          '[data-edit-row]'
        ) !== null ||
        target.closest(
          '[data-open-entry]'
        ) !== null ||
        target.closest(
          '[data-open-edit]'
        ) !== null
      ) {
        return
      }

      if (
        activeEdit !==
        null
      ) {
        finishActiveEdit(
          true,
          true
        )

        return
      }

      if (
        activeEntry !==
        null
      ) {
        cancelActiveEntry()
      }
    }

  document.addEventListener(
    'click',
    outsideEntryClickHandler
  )
}


function updateFocusedLifterShortcut(
  lifterId: number,
  update: (
    meet: LocalMeet,
    lifter: Lifter,
  ) => boolean,
): void {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }

  const lifter =
    meet.state.lifters.find(
      item =>
        item.id ===
        lifterId
    )

  if (
    lifter === undefined ||
    !update(
      meet,
      lifter
    )
  ) {
    return
  }

  selectedLifterId =
    lifter.id

  renderApp()

  focusSelectedRegistrationRowLater(
    'lifter'
  )
}


function setFocusedLifterStatusShortcut(
  lifterId: number,
  status: Lifter['status'],
): void {

  updateFocusedLifterShortcut(
    lifterId,
    (
      _meet,
      lifter,
    ) => {
      setLifterStatusFromShortcut(
        lifter,
        status
      )

      return true
    }
  )
}


function setFocusedLifterEquipmentShortcut(
  lifterId: number,
  equipmentType: Lifter['equipmentType'],
): void {

  updateFocusedLifterShortcut(
    lifterId,
    (
      _meet,
      lifter,
    ) => {
      lifter.equipmentType =
        equipmentType

      registrationDefaults = {
        equipmentType,
      }

      return true
    }
  )
}


function setFocusedLifterBodyWeightShortcut(
  lifterId: number,
  directBodyWeight?: number,
): void {

  const meet =
    getSelectedMeet()

  const lifter =
    meet?.state.lifters.find(
      item =>
        item.id ===
        lifterId
    )

  if (
    meet === undefined ||
    lifter === undefined
  ) {
    return
  }

  const entered =
    directBodyWeight ===
      undefined
      ? window.prompt(
          `Enter BWT for ${lifter.firstName} ${lifter.lastName}:`,
          lifter.bodyWeight?.toString() ??
          ''
        )
      : directBodyWeight.toString()

  if (
    entered === null
  ) {
    focusSelectedRegistrationRowLater(
      'lifter'
    )

    return
  }

  const bodyWeight =
    Number(
      entered.trim()
    )

  if (
    !Number.isFinite(
      bodyWeight
    ) ||
    bodyWeight <= 0
  ) {
    window.alert(
      'Enter a valid body weight.'
    )

    focusSelectedRegistrationRowLater(
      'lifter'
    )

    return
  }

  const division =
    meet.state.divisions.find(
      item =>
        item.id ===
        lifter.divisionId
    )

  if (
    division === undefined
  ) {
    return
  }

  lifter.bodyWeight =
    bodyWeight

  if (
    lifter.weightClassSource ===
    'automatic'
  ) {
    try {
      const rules =
        getDivisionRules(
          division
        )

      lifter.weightClass =
        getAutomaticWeightClass(
          bodyWeight,
          rules.weightClasses
        )
    } catch (
      error
    ) {
      window.alert(
        error instanceof Error
          ? error.message
          : 'Unable to determine the weight class.'
      )

      return
    }
  }

  selectedLifterId =
    lifter.id

  renderApp()

  focusSelectedRegistrationRowLater(
    'lifter'
  )
}


function handleFocusedLifterShortcut(
  event: KeyboardEvent,
  row: HTMLElement,
): boolean {

  if (
    document.activeElement !==
    row
  ) {
    return false
  }

  const lifterId =
    Number(
      row.dataset.lifterRow
    )

  if (
    Number.isNaN(
      lifterId
    )
  ) {
    return false
  }

  const key =
    event.key
      .toLocaleLowerCase()

  if (
    /^[0-9]$/.test(
      key
    )
  ) {
    const now =
      Date.now()

    if (
      focusedLifterWeightLifterId !==
        lifterId ||
      now -
        focusedLifterWeightLastAt >
        LIFTER_WEIGHT_DIGIT_MS
    ) {
      focusedLifterWeightDigits =
        ''
    }

    focusedLifterWeightLifterId =
      lifterId

    focusedLifterWeightLastAt =
      now

    focusedLifterWeightDigits +=
      key

    event.preventDefault()
    event.stopPropagation()

    if (
      focusedLifterWeightDigits.length ===
      3
    ) {
      const bodyWeight =
        Number(
          focusedLifterWeightDigits
        )

      focusedLifterWeightDigits =
        ''

      focusedLifterWeightLifterId =
        null

      focusedLifterWeightLastAt =
        0

      if (
        bodyWeight > 0 &&
        bodyWeight <= 999
      ) {
        setFocusedLifterBodyWeightShortcut(
          lifterId,
          bodyWeight
        )
      }
    }

    return true
  }

  focusedLifterWeightDigits =
    ''

  focusedLifterWeightLifterId =
    null

  focusedLifterWeightLastAt =
    0

  switch (
    key
  ) {
    case 'a':
      setFocusedLifterStatusShortcut(
        lifterId,
        'active'
      )
      break

    case 'b':
      setFocusedLifterStatusShortcut(
        lifterId,
        'bombed'
      )
      break

    case 's':
      setFocusedLifterStatusShortcut(
        lifterId,
        'scratched'
      )
      break

    case 'q':
      setFocusedLifterStatusShortcut(
        lifterId,
        'disqualified'
      )
      break

    case 'e':
      setFocusedLifterEquipmentShortcut(
        lifterId,
        'equipped'
      )
      break

    case 'u':
      setFocusedLifterEquipmentShortcut(
        lifterId,
        'unequipped'
      )
      break

    case 'w':
      setFocusedLifterBodyWeightShortcut(
        lifterId
      )
      break

    default:
      return false
  }

  event.preventDefault()
  event.stopPropagation()

  return true
}


function getRegistrationSectionRows(
  type: RegistrationEntry,
): HTMLElement[] {

  const selector =
    type === 'meet'
      ? '[data-meet-row]:not([data-edit-row])'
      : type === 'division'
        ? '[data-division-row]:not([data-edit-row])'
        : type === 'team'
          ? '[data-all-teams-row], [data-team-row]:not([data-edit-row])'
          : '[data-lifter-row][data-select-lifter]:not([data-edit-row])'

  return Array.from(
    document.querySelectorAll<HTMLElement>(
      selector
    )
  )
}


function getRegistrationRowKey(
  type: RegistrationEntry,
  row: HTMLElement,
): string | null {

  if (
    type === 'team' &&
    row.hasAttribute(
      'data-all-teams-row'
    )
  ) {
    return 'team:all'
  }

  const rawId =
    type === 'meet'
      ? row.dataset.meetRow
      : type === 'division'
        ? row.dataset.divisionRow
        : type === 'team'
          ? row.dataset.teamRow
          : row.dataset.lifterRow

  return rawId === undefined
    ? null
    : `${type}:${rawId}`
}


function activateRegistrationRow(
  type: RegistrationEntry,
  row: HTMLElement,
): boolean {

  if (
    type === 'team' &&
    row.hasAttribute(
      'data-all-teams-row'
    )
  ) {
    if (
      selectedTeamId !== null
    ) {
      selectAllTeams()
    }

    return true
  }

  if (
    type === 'meet'
  ) {
    const meetId =
      row.dataset.meetRow

    if (
      meetId === undefined
    ) {
      return false
    }

    if (
      selectedMeetId !== meetId
    ) {
      selectMeet(
        meetId
      )
    }

    return true
  }

  const rawId =
    type === 'division'
      ? row.dataset.divisionRow
      : type === 'team'
        ? row.dataset.teamRow
        : row.dataset.lifterRow

  const id =
    Number(
      rawId
    )

  if (
    rawId === undefined ||
    Number.isNaN(
      id
    )
  ) {
    return false
  }

  if (
    type === 'division'
  ) {
    if (
      selectedDivisionId !== id
    ) {
      selectDivision(
        id
      )
    }
  } else if (
    type === 'team'
  ) {
    if (
      selectedTeamId !== id
    ) {
      selectTeam(
        id
      )
    }
  } else if (
    selectedLifterId !== id
  ) {
    selectLifter(
      id
    )
  }

  return true
}


function editRegistrationRow(
  type: RegistrationEntry,
  row: HTMLElement,
): void {

  if (
    type === 'team' &&
    row.hasAttribute(
      'data-all-teams-row'
    )
  ) {
    return
  }

  const rawId =
    type === 'meet'
      ? row.dataset.meetRow
      : type === 'division'
        ? row.dataset.divisionRow
        : type === 'team'
          ? row.dataset.teamRow
          : row.dataset.lifterRow

  if (
    rawId === undefined
  ) {
    return
  }

  if (
    type === 'meet'
  ) {
    startEdit(
      type,
      rawId
    )

    return
  }

  const id =
    Number(
      rawId
    )

  if (
    Number.isNaN(
      id
    )
  ) {
    return
  }

  startEdit(
    type,
    id
  )
}


function focusSelectedRegistrationRow(
  type: RegistrationEntry,
): void {

  const row =
    getRegistrationSectionRows(
      type
    ).find(
      item =>
        item.classList.contains(
          'selected'
        )
    )

  row?.focus()
}


function focusSelectedRegistrationRowLater(
  type: RegistrationEntry,
): void {

  window.requestAnimationFrame(
    () => {
      focusSelectedRegistrationRow(
        type
      )
    }
  )
}


function wireRegistrationRowInteractions():
  void {

  const sections:
    RegistrationEntry[] = [
      'meet',
      'division',
      'team',
      'lifter',
    ]

  for (
    const type of
    sections
  ) {
    const rows =
      getRegistrationSectionRows(
        type
      )

    rows.forEach(
      row => {

        row.addEventListener(
          'click',
          event => {
            const target =
              event.target

            if (
              target instanceof Element &&
              target.closest(
                '.row-edit, .row-delete'
              ) !== null
            ) {
              return
            }

            event.stopPropagation()

            const key =
              getRegistrationRowKey(
                type,
                row
              )

            if (
              key === null
            ) {
              return
            }

            const now =
              Date.now()

            const doubleClick =
              lastRegistrationRowClickKey ===
                key &&
              now -
                lastRegistrationRowClickAt <=
                REGISTRATION_DOUBLE_CLICK_MS

            lastRegistrationRowClickKey =
              doubleClick
                ? null
                : key

            lastRegistrationRowClickAt =
              now

            if (
              doubleClick &&
              !(
                type === 'team' &&
                row.hasAttribute(
                  'data-all-teams-row'
                )
              )
            ) {
              editRegistrationRow(
                type,
                row
              )

              return
            }

            if (
              activateRegistrationRow(
                type,
                row
              )
            ) {
              focusSelectedRegistrationRowLater(
                type
              )
            }
          }
        )

        row.addEventListener(
          'keydown',
          event => {

            if (
              type === 'lifter' &&
              handleFocusedLifterShortcut(
                event,
                row
              )
            ) {
              return
            }

            if (
              event.key ===
                'ArrowUp' ||
              event.key ===
                'ArrowDown'
            ) {
              event.preventDefault()
              event.stopPropagation()

              const currentRows =
                getRegistrationSectionRows(
                  type
                )

              const currentKey =
                getRegistrationRowKey(
                  type,
                  row
                )

              const currentIndex =
                currentRows.findIndex(
                  item =>
                    getRegistrationRowKey(
                      type,
                      item
                    ) ===
                    currentKey
                )

              if (
                currentIndex < 0
              ) {
                return
              }

              const offset =
                event.key ===
                  'ArrowDown'
                  ? 1
                  : -1

              const nextIndex =
                Math.max(
                  0,
                  Math.min(
                    currentRows.length - 1,
                    currentIndex +
                      offset
                  )
                )

              const nextRow =
                currentRows[
                  nextIndex
                ]

              if (
                nextRow !==
                undefined &&
                activateRegistrationRow(
                  type,
                  nextRow
                )
              ) {
                focusSelectedRegistrationRowLater(
                  type
                )
              }

              return
            }

            if (
              event.key ===
              'Enter'
            ) {
              event.preventDefault()
              event.stopPropagation()

              editRegistrationRow(
                type,
                row
              )
            }
          }
        )
      }
    )
  }
}


function moveToRegistrationSection(
  type: RegistrationEntry,
): void {

  if (
    type === 'meet'
  ) {
    const meet =
      localMeets[0]

    if (
      meet === undefined
    ) {
      return
    }

    if (
      selectedMeetId !==
      meet.state.meet.id
    ) {
      selectMeet(
        meet.state.meet.id
      )
    }

    focusSelectedRegistrationRowLater(
      'meet'
    )

    return
  }

  let meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    const firstMeet =
      localMeets[0]

    if (
      firstMeet === undefined
    ) {
      return
    }

    selectMeet(
      firstMeet.state.meet.id
    )

    meet =
      getSelectedMeet()
  }

  if (
    meet === undefined
  ) {
    return
  }

  if (
    type === 'division'
  ) {
    const division =
      meet.state.divisions[0]

    if (
      division === undefined
    ) {
      return
    }

    if (
      selectedDivisionId !==
      division.id
    ) {
      selectDivision(
        division.id
      )
    }

    focusSelectedRegistrationRowLater(
      'division'
    )

    return
  }

  if (
    getSelectedDivision() ===
    undefined
  ) {
    const division =
      meet.state.divisions[0]

    if (
      division === undefined
    ) {
      return
    }

    selectDivision(
      division.id
    )
  }

  if (
    type === 'team'
  ) {
    if (
      selectedTeamId !== null
    ) {
      selectAllTeams()
    }

    focusSelectedRegistrationRowLater(
      'team'
    )

    return
  }

  const visibleLifters =
    getSortedVisibleLifters(
      meet
    )

  const lifter =
    visibleLifters[0]

  if (
    lifter === undefined
  ) {
    return
  }

  if (
    selectedLifterId !==
    lifter.id
  ) {
    selectLifter(
      lifter.id
    )
  }

  focusSelectedRegistrationRowLater(
    'lifter'
  )
}


function beginShortcutEntry(
  type: RegistrationEntry,
): void {

  if (
    type === 'meet'
  ) {
    startMeetEntry()
    return
  }

  let meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    moveToRegistrationSection(
      'meet'
    )

    meet =
      getSelectedMeet()
  }

  if (
    meet === undefined
  ) {
    return
  }

  if (
    type === 'division'
  ) {
    startDivisionEntry()
    return
  }

  if (
    getSelectedDivision() ===
    undefined
  ) {
    moveToRegistrationSection(
      'division'
    )
  }

  if (
    type === 'team'
  ) {
    startTeamEntry()
    return
  }

  if (
    getSelectedTeam() ===
    undefined
  ) {
    const selectedLifter =
      meet.state.lifters.find(
        lifter =>
          lifter.id ===
          selectedLifterId
      )

    const candidateTeamId =
      selectedLifter?.teamId ??
      getTeamsForSelectedDivision()[0]
        ?.id ??
      null

    if (
      candidateTeamId === null
    ) {
      return
    }

    selectTeam(
      candidateTeamId
    )
  }

  startLifterEntry()
}


function wireRegistrationShortcuts():
  void {

  if (
    registrationShortcutKeydownHandler !==
    null
  ) {
    document.removeEventListener(
      'keydown',
      registrationShortcutKeydownHandler
    )
  }

  registrationShortcutKeydownHandler =
    event => {

      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.repeat ||
        activeEntry !== null ||
        activeEdit !== null ||
        isBulkEditing
      ) {
        return
      }

      const target =
        event.target

      if (
        target instanceof HTMLElement &&
        (
          target.matches(
            'input, select, textarea'
          ) ||
          target.isContentEditable
        )
      ) {
        return
      }

      const key =
        event.key
          .toLocaleLowerCase()

      const type:
        RegistrationEntry | null =
          key === 'm'
            ? 'meet'
            : key === 'd'
              ? 'division'
              : key === 't'
                ? 'team'
                : key === 'l'
                  ? 'lifter'
                  : null

      if (
        type === null
      ) {
        lastRegistrationShortcutKey =
          null

        return
      }

      event.preventDefault()

      const now =
        Date.now()

      const doubleShortcut =
        lastRegistrationShortcutKey ===
          type &&
        now -
          lastRegistrationShortcutAt <=
          REGISTRATION_SHORTCUT_MS

      lastRegistrationShortcutKey =
        doubleShortcut
          ? null
          : type

      lastRegistrationShortcutAt =
        now

      if (
        doubleShortcut
      ) {
        beginShortcutEntry(
          type
        )

        return
      }

      moveToRegistrationSection(
        type
      )
    }

  document.addEventListener(
    'keydown',
    registrationShortcutKeydownHandler
  )
}


function disableRegistrationShortcuts():
  void {

  if (
    registrationShortcutKeydownHandler !==
    null
  ) {
    document.removeEventListener(
      'keydown',
      registrationShortcutKeydownHandler
    )

    registrationShortcutKeydownHandler =
      null
  }

  lastRegistrationShortcutKey =
    null

  focusedLifterWeightDigits =
    ''

  focusedLifterWeightLifterId =
    null
}


function wireRegistrationSetup(): void {

  document
    .querySelector<HTMLButtonElement>(
      '#addMeet'
    )
    ?.addEventListener(
      'click',
      startMeetEntry
    )

  document
    .querySelector<HTMLButtonElement>(
      '#addDivision'
    )
    ?.addEventListener(
      'click',
      startDivisionEntry
    )

  document
    .querySelector<HTMLButtonElement>(
      '#addTeam'
    )
    ?.addEventListener(
      'click',
      startTeamEntry
    )

  document
    .querySelector<HTMLButtonElement>(
      '#addLifter'
    )
    ?.addEventListener(
      'click',
      startLifterEntry
    )

  wireEntryKeyboard(
    '.meet-entry-row',
    commitNewMeet
  )

  wireEntryKeyboard(
    '.division-entry-row',
    commitNewDivision
  )

  wireEntryKeyboard(
    '.team-entry-row',
    commitNewTeam
  )

  wireEditKeyboard()


  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-edit-entity][data-edit-id]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          event => {
            event.stopPropagation()

            const type =
              button.dataset
                .editEntity as
                  RegistrationEntry | undefined

            const rawId =
              button.dataset
                .editId

            if (
              type === undefined ||
              rawId === undefined
            ) {
              return
            }

            if (
              type ===
              'meet'
            ) {
              startEdit(
                type,
                rawId
              )

              return
            }

            const id =
              Number(
                rawId
              )

            if (
              Number.isNaN(
                id
              )
            ) {
              return
            }

            startEdit(
              type,
              id
            )
          }
        )
      }
    )


  wireRegistrationRowInteractions()


  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-delete-meet]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          event => {
            event.stopPropagation()

            const meetId =
              button.dataset
                .deleteMeet

            if (
              meetId !== undefined
            ) {
              deleteMeet(
                meetId
              )
            }
          }
        )
      }
    )


  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-delete-division]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          event => {
            event.stopPropagation()

            const id =
              Number(
                button.dataset
                  .deleteDivision
              )

            if (
              !Number.isNaN(id)
            ) {
              deleteDivision(
                id
              )
            }
          }
        )
      }
    )


  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-delete-team]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          event => {
            event.stopPropagation()

            const id =
              Number(
                button.dataset
                  .deleteTeam
              )

            if (
              !Number.isNaN(id)
            ) {
              deleteTeam(
                id
              )
            }
          }
        )
      }
    )


  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-delete-lifter]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          event => {
            event.stopPropagation()

            const id =
              Number(
                button.dataset
                  .deleteLifter
              )

            if (
              !Number.isNaN(id)
            ) {
              deleteLifter(
                id
              )
            }
          }
        )
      }
    )
}


function wireRegistration():
  void {

  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-lifter-sort]'
    )
    .forEach(
      button => {
        button.addEventListener(
          'click',
          () => {
            const column =
              button.dataset
                .lifterSort as
                  LifterSortColumn | undefined

            if (
              column ===
              undefined
            ) {
              return
            }

            if (
              !finishActiveEdit(
                true,
                false
              )
            ) {
              return
            }

            activeEntry =
              null

            if (
              lifterSortColumn ===
              column
            ) {
              lifterSortAscending =
                !lifterSortAscending
            } else {
              lifterSortColumn =
                column

              lifterSortAscending =
                true
            }

            renderApp()
          }
        )
      }
    )

  document
    .querySelector<HTMLInputElement>(
      '#entryBodyWeight'
    )
    ?.addEventListener(
      'input',
      updateEntryWeightClasses
    )


  document
    .querySelector<HTMLSelectElement>(
      '#entryEquipment'
    )
    ?.addEventListener(
      'change',
      event => {

        const target =
          event.currentTarget as
            HTMLSelectElement

        registrationDefaults
          .equipmentType =
            target.value as
              Lifter['equipmentType']
      }
    )


  document
    .querySelector<HTMLInputElement>(
      '#editLifterNumber'
    )
    ?.addEventListener(
      'input',
      validateEditLifterNumberImmediate
    )


  document
    .querySelector<HTMLInputElement>(
      '#editLifterBodyWeight'
    )
    ?.addEventListener(
      'input',
      updateEditLifterWeightClasses
    )


  document
    .querySelector<HTMLSelectElement>(
      '#editLifterWeightClass'
    )
    ?.addEventListener(
      'change',
      () => {
        editLifterWeightClassManuallyChanged =
          true
      }
    )


  wireEntryKeyboard(
    '.registration-entry-row',
    commitNewLifter
  )

  wireBulkEdit()
  wireOutsideEntryDismissal()
}


function renderApp(): void {

  const app =
    document.querySelector<HTMLDivElement>(
      '#app'
    )

  if (
    app === null
  ) {
    return
  }

  const meet =
    getSelectedMeet()

  app.innerHTML = `
    <div class="powerscore">

      <header class="app-header">

        <div class="brand">
          <strong>PowerScore</strong>

          <span>
            Powerlifting Meet Management
          </span>
        </div>

        <div class="current-meet">
          ${
            meet === undefined
              ? 'No Meet Selected'
              : escapeHtml(
                  meet.state.meet.name
                )
          }
        </div>

        <div class="version">
          Development Version
        </div>

      </header>

      ${renderNavigation()}

      ${renderShortcutHelpDialog()}

      ${
        currentPage ===
        'competition'
          ? renderCompetition()
          : renderRegistration()
      }

    </div>
  `

  wireNavigation()

  if (
    currentPage ===
    'competition'
  ) {
    disableRegistrationShortcuts()
    wireCompetition()
    wireCompetitionStatusShortcuts()
    wireSelectAllOnEditableInputs()

    return
  }

  disableCompetitionStatusShortcuts()
  wireRegistrationSetup()
  wireRegistration()
  wireSelectAllOnEditableInputs()
  wireRegistrationShortcuts()
}


selectFirstHierarchy()
renderApp()