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
  countAttemptProgressResults,
  countAttemptProgressResultsNoBwt,
  countBestLiftProgressResults,
  countBestLiftProgressResultsNoBwt,
  getCompetitionProgressCellState,
  getExpectedNoBwtProgressLifters,
  getExpectedProgressLiftersForClass,
  getNoBwtProgressLifters,
} from './domain/competitionProgress'

import {
  calculateIndividualStandings,
  calculateTeamStandings,
} from './domain/standings'

import type {
  IndividualStanding,
  TeamStanding,
} from './domain/standings'


import {
  hasLaterAttemptResultInSequence,
  hasLaterBestLiftResultInSequence,
  hasPeerAttemptResult,
  hasPeerBestLiftResult,
  isAttemptResultComplete,
  isAttemptResultMissing,
  isBestLiftResultComplete,
  isBestLiftResultMissing,
} from './domain/competitionMissingResults'


import {
  getDivisionRules,
} from './rules/divisionRules'

import {
  createPlatformMeetId,
  getPlatformManagerSubmissionCsv,
  listPlatformManagerSubmissions,
  listProcessedPlatformManagerSubmissions,
  markPlatformManagerSubmissionProcessed,
  parsePlatformManagerFilename,
  parsePlatformManagerSubmission,
} from './integration/platformManager'

import type {
  PlatformManagerSubmission,
  PlatformManagerLifterStatus,
} from './integration/platformManager'


import {
  configureTrainingPlatformManagerFiles,
  getTrainingPlatformManagerCsv,
  listProcessedTrainingPlatformManagerFiles,
  listTrainingPlatformManagerFiles,
  markTrainingPlatformManagerFileProcessed,
  resetTrainingPlatformManagerFiles,
  TRAINING_ALL_ATTEMPTS_MEET_ID,
  TRAINING_ALL_ATTEMPTS_PLATFORM_MEET_ID,
  TRAINING_BEST_LIFT_MEET_ID,
  TRAINING_BEST_LIFT_PLATFORM_MEET_ID,
} from './training/platformManagerTraining'


const TEST_BEST_LIFT_MEET_ID =
  'powerscore-test-best-lift'

const TEST_ALL_ATTEMPTS_MEET_ID =
  'powerscore-test-all-attempts'


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
  | 'standings'
  | 'best-lifters'
  | 'best-lifts'
  | 'summary'
  | 'detail'
  | 'tools'
  | 'platform-issues'
  | 'help'


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


const PLATFORM_MANAGER_HANDLER_URL =
  'https://thspa.us/PlatformManager.ashx'


type ExpeditorSource =
  | 'weight-class'
  | 'team'
  | 'lifter'


interface ExpeditorCardOptions {
  leaveBodyWeightBlank: boolean
  leaveLifterNumberBlank: boolean
  leaveWeightClassBlank: boolean
  omitAssociationLogo: boolean
  includeDeclaredWeights: boolean
  includeDividingLine: boolean
}


interface ExpeditorCardData {
  lifterNumber: string
  weightClass: string
  divisionName: string
  bodyWeight: string
  lifterName: string
  teamName: string
  squatOpener: string
  benchOpener: string
  deadliftOpener: string
  cardTitle: string
  associationLogo: string
  associationLogoAlt: string
  footer: string
  isBlank: boolean
}


interface RunnerSheetRowData {
  lifterNumber: string
  lifterName: string
  schoolName: string
  bestSquat: string
  bestBench: string
  bestDeadlift: string
}


interface RunnerSheetPageData {
  meetTitle: string
  meetLocationAndDate: string
  weightClass: string
  rows: RunnerSheetRowData[]
}


let runnerSheetSelectionDivisionId:
  number | null =
    null

let runnerSheetSelectedWeightClasses =
  new Set<string>()

let runnerSheetForceBlankBestLiftColumns =
  true

let runnerSheetPrintPages:
  RunnerSheetPageData[] =
  []


let expeditorSource:
  ExpeditorSource =
    'weight-class'

let expeditorSelectionDivisionId:
  number | null =
    null

let expeditorSelectedWeightClasses =
  new Set<string>()

let expeditorSelectedTeamIds =
  new Set<number>()

let expeditorSelectedLifterIds =
  new Set<number>()

let expeditorOptions:
  ExpeditorCardOptions = {
    leaveBodyWeightBlank:
      false,
    leaveLifterNumberBlank:
      false,
    leaveWeightClassBlank:
      false,
    omitAssociationLogo:
      false,
    includeDeclaredWeights:
      false,
    includeDividingLine:
      true,
  }

let expeditorCardTitle =
  ''

let expeditorPrintCards:
  ExpeditorCardData[] =
  []


type StandingsOutputScope =
  | 'individual'
  | 'team'
  | 'both'

type StandingsCopyFormat =
  | 'formatted'
  | 'spreadsheet'
  | 'word'


type IndividualStandingsSortColumn =
  | 'weightClass'
  | 'place'
  | 'lifterNumber'
  | 'lifter'
  | 'team'
  | 'bodyWeight'
  | 'total'

type TeamStandingsSortColumn =
  | 'place'
  | 'team'
  | 'firsts'
  | 'seconds'
  | 'thirds'
  | 'fourths'
  | 'fifths'
  | 'totalPoints'


type DetailSortColumn =
  | 'weightClass'
  | 'place'
  | 'lifter'
  | 'lifterNumber'
  | 'team'
  | 'bodyWeight'
  | 'squat'
  | 'bench'
  | 'deadlift'
  | 'total'
  | 'coefficient'
  | 'coefficientSquat'
  | 'coefficientBench'
  | 'coefficientDeadlift'
  | 'coefficientTotal'


type BestLiftSortColumn =
  | 'lift'
  | 'weightGroup'
  | 'place'
  | 'lifterNumber'
  | 'lifter'
  | 'team'
  | 'liftWeight'
  | 'coefficient'
  | 'coefficientLift'


type BestLifterSortColumn =
  | 'weightGroup'
  | 'place'
  | 'lifterNumber'
  | 'lifter'
  | 'team'
  | 'squat'
  | 'bench'
  | 'deadlift'
  | 'total'
  | 'coefficient'
  | 'coefficientTotal'


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
  | 'subtotal'
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
        name: 'Platform Test 1',
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
            'THSPA Boys',
          ruleSet:
            'THSPA',
        },

        {
          id: 2,
          meetId:
            'second-development-meet',
          name:
            'THSWPA Girls',
          ruleSet:
            'THSWPA',
        },
      ],

      teams: [
        {
          id: 1,
          meetId:
            'second-development-meet',
          name:
            'Mustangs',
          region: null,
          classification: null,
        },

        {
          id: 2,
          meetId:
            'second-development-meet',
          name:
            'Eagles',
          region: null,
          classification: null,
        },

        {
          id: 3,
          meetId:
            'second-development-meet',
          name:
            'Bulldogs',
          region: null,
          classification: null,
        },

        {
          id: 4,
          meetId:
            'second-development-meet',
          name:
            'Tigers',
          region: null,
          classification: null,
        },

        {
          id: 5,
          meetId:
            'second-development-meet',
          name:
            'Lady Mustangs',
          region: null,
          classification: null,
        },

        {
          id: 6,
          meetId:
            'second-development-meet',
          name:
            'Lady Eagles',
          region: null,
          classification: null,
        },

        {
          id: 7,
          meetId:
            'second-development-meet',
          name:
            'Lady Bulldogs',
          region: null,
          classification: null,
        },

        {
          id: 8,
          meetId:
            'second-development-meet',
          name:
            'Lady Tigers',
          region: null,
          classification: null,
        },
      ],

      lifters: [],
    },

    divisionTeams: [
      { divisionId: 1, teamId: 1 },
      { divisionId: 1, teamId: 2 },
      { divisionId: 1, teamId: 3 },
      { divisionId: 1, teamId: 4 },

      { divisionId: 2, teamId: 5 },
      { divisionId: 2, teamId: 6 },
      { divisionId: 2, teamId: 7 },
      { divisionId: 2, teamId: 8 },
    ],
  },

  {
    state: {
      meet: {
        id:
          TRAINING_BEST_LIFT_MEET_ID,
        name:
          'PowerScore Training - Best Lift',
        date:
          '2026-10-10',
        location:
          'Training Only',
        resultEntryMode:
          'best-lift-only',
        platformMeetId:
          TRAINING_BEST_LIFT_PLATFORM_MEET_ID,
      },

      divisions: [
        {
          id: 101,
          meetId:
            TRAINING_BEST_LIFT_MEET_ID,
          name:
            'THSPA Training Boys',
          ruleSet:
            'THSPA',
        },

        {
          id: 102,
          meetId:
            TRAINING_BEST_LIFT_MEET_ID,
          name:
            'THSWPA Training Girls',
          ruleSet:
            'THSWPA',
        },
      ],

      teams: [
        {
          id: 101,
          meetId:
            TRAINING_BEST_LIFT_MEET_ID,
          name:
            'Training Mustangs',
          region: null,
          classification: null,
        },

        {
          id: 102,
          meetId:
            TRAINING_BEST_LIFT_MEET_ID,
          name:
            'Training Eagles',
          region: null,
          classification: null,
        },

        {
          id: 103,
          meetId:
            TRAINING_BEST_LIFT_MEET_ID,
          name:
            'Training Tigers',
          region: null,
          classification: null,
        },

        {
          id: 104,
          meetId:
            TRAINING_BEST_LIFT_MEET_ID,
          name:
            'Training Bulldogs',
          region: null,
          classification: null,
        },
      ],

      lifters: [],
    },

    divisionTeams: [
      { divisionId: 101, teamId: 101 },
      { divisionId: 101, teamId: 102 },
      { divisionId: 102, teamId: 103 },
      { divisionId: 102, teamId: 104 },
    ],
  },

  {
    state: {
      meet: {
        id:
          TRAINING_ALL_ATTEMPTS_MEET_ID,
        name:
          'PowerScore Training - All Attempts',
        date:
          '2026-10-11',
        location:
          'Training Only',
        resultEntryMode:
          'all-attempts',
        platformMeetId:
          TRAINING_ALL_ATTEMPTS_PLATFORM_MEET_ID,
      },

      divisions: [
        {
          id: 201,
          meetId:
            TRAINING_ALL_ATTEMPTS_MEET_ID,
          name:
            'THSPA Training Boys',
          ruleSet:
            'THSPA',
        },

        {
          id: 202,
          meetId:
            TRAINING_ALL_ATTEMPTS_MEET_ID,
          name:
            'THSWPA Training Girls',
          ruleSet:
            'THSWPA',
        },
      ],

      teams: [
        {
          id: 201,
          meetId:
            TRAINING_ALL_ATTEMPTS_MEET_ID,
          name:
            'Training Mustangs',
          region: null,
          classification: null,
        },

        {
          id: 202,
          meetId:
            TRAINING_ALL_ATTEMPTS_MEET_ID,
          name:
            'Training Eagles',
          region: null,
          classification: null,
        },

        {
          id: 203,
          meetId:
            TRAINING_ALL_ATTEMPTS_MEET_ID,
          name:
            'Training Tigers',
          region: null,
          classification: null,
        },

        {
          id: 204,
          meetId:
            TRAINING_ALL_ATTEMPTS_MEET_ID,
          name:
            'Training Bulldogs',
          region: null,
          classification: null,
        },
      ],

      lifters: [],
    },

    divisionTeams: [
      { divisionId: 201, teamId: 201 },
      { divisionId: 201, teamId: 202 },
      { divisionId: 202, teamId: 203 },
      { divisionId: 202, teamId: 204 },
    ],
  },
]

function populatePlatformTestMeet():
  void {

  const meet =
    localMeets.find(
      item =>
        item.state.meet.id ===
        'second-development-meet'
    )

  if (
    meet === undefined ||
    meet.state.lifters.length > 0
  ) {
    return
  }

  const boys = [
    ['Aaron', 'Bennett'],
    ['Brandon', 'Carter'],
    ['Cody', 'Dawson'],
    ['Derek', 'Ellis'],
    ['Evan', 'Foster'],
    ['Garrett', 'Griffin'],
    ['Henry', 'Hayes'],
    ['Isaiah', 'Irwin'],
    ['Jason', 'Jenkins'],
    ['Kevin', 'Knight'],
    ['Lucas', 'Lawson'],
    ['Marcus', 'Miller'],
    ['Nathan', 'Norris'],
    ['Owen', 'Owens'],
    ['Preston', 'Parker'],
    ['Quinton', 'Qualls'],
    ['Ryan', 'Reed'],
    ['Samuel', 'Sutton'],
    ['Trevor', 'Taylor'],
    ['Victor', 'Vargas'],
    ['William', 'Walker'],
    ['Xavier', 'Young'],
    ['Zachary', 'Zimmerman'],
    ['Cole', 'Andrews'],
  ] as const

  const boysBodyWeights = [
    166.2, 167.8, 168.5, 169.7, 170.4, 171.6,
    172.3, 173.9, 174.5, 175.2, 176.8, 177.4,
    178.1, 179.3, 180.6, 166.9, 168.8, 170.9,
    172.7, 174.8, 176.1, 177.9, 179.8, 180.9,
  ]

  const girls = [
    ['Alyssa', 'Baker'],
    ['Brooke', 'Collins'],
    ['Caitlyn', 'Davis'],
    ['Danielle', 'Edwards'],
    ['Emily', 'Franklin'],
    ['Gabriella', 'Garza'],
    ['Hailey', 'Harris'],
    ['Isabella', 'Ingram'],
    ['Jasmine', 'Johnson'],
    ['Kayla', 'King'],
    ['Lauren', 'Lewis'],
    ['Megan', 'Moore'],
    ['Nicole', 'Nelson'],
    ['Olivia', 'Ortega'],
    ['Paige', 'Phillips'],
    ['Rachel', 'Roberts'],
    ['Samantha', 'Scott'],
    ['Taylor', 'Thomas'],
    ['Vanessa', 'Valdez'],
    ['Whitney', 'White'],
    ['Zoe', 'Zuniga'],
  ] as const

  const girlsBodyWeights = [
    149.2, 150.6, 151.8, 153.1, 154.4, 155.7,
    157.2, 158.5, 159.9, 161.3, 162.6, 163.8,
    164.7, 149.9, 152.4, 154.9, 157.7, 160.4,
    162.1, 163.4, 164.3,
  ]

  for (
    let index = 0;
    index < boys.length;
    index += 1
  ) {
    const lifterNumber =
      index + 1

    const lifter =
      createDevelopmentLifter(
        lifterNumber,
        lifterNumber,
        boys[index][0],
        boys[index][1],
        1,
        (index % 4) + 1,
        'equipped',
      )

    lifter.bodyWeight =
      boysBodyWeights[index]

    lifter.weightClass =
      '181'

    lifter.weightClassSource =
      'automatic'

    meet.state.lifters.push(
      lifter
    )
  }

  for (
    let index = 0;
    index < girls.length;
    index += 1
  ) {
    const lifterNumber =
      50 + index

    const lifter =
      createDevelopmentLifter(
        100 + lifterNumber,
        lifterNumber,
        girls[index][0],
        girls[index][1],
        2,
        5 + (index % 4),
        'equipped',
      )

    lifter.bodyWeight =
      girlsBodyWeights[index]

    lifter.weightClass =
      '165'

    lifter.weightClassSource =
      'automatic'

    meet.state.lifters.push(
      lifter
    )
  }
}


populatePlatformTestMeet()


const TRAINING_GENERAL_BOYS_FIRST_NAMES = [
  'Aaron',
  'Blake',
  'Caleb',
  'Cole',
  'Connor',
  'Derek',
  'Ethan',
  'Garrett',
  'Gavin',
  'Grant',
  'Henry',
  'Hunter',
  'Isaac',
  'Jack',
  'Jacob',
  'Kyle',
  'Landon',
  'Luke',
  'Mason',
  'Nathan',
  'Owen',
  'Parker',
  'Ryan',
  'Tyler',
] as const


const TRAINING_GENERAL_GIRLS_FIRST_NAMES = [
  'Abigail',
  'Allison',
  'Avery',
  'Brooke',
  'Caroline',
  'Chloe',
  'Claire',
  'Ella',
  'Emily',
  'Grace',
  'Hannah',
  'Hailey',
  'Katie',
  'Lauren',
  'Megan',
  'Natalie',
  'Olivia',
  'Paige',
  'Rachel',
  'Sarah',
  'Taylor',
  'Victoria',
  'Whitney',
  'Zoe',
] as const


const TRAINING_GENERAL_LAST_NAMES = [
  'Anderson',
  'Baker',
  'Bennett',
  'Brooks',
  'Campbell',
  'Carter',
  'Collins',
  'Cooper',
  'Davis',
  'Edwards',
  'Foster',
  'Green',
  'Harris',
  'Hayes',
  'Hill',
  'Johnson',
  'King',
  'Lewis',
  'Miller',
  'Moore',
  'Nelson',
  'Parker',
  'Price',
  'Reed',
  'Roberts',
  'Scott',
  'Smith',
  'Stewart',
  'Taylor',
  'Turner',
  'Walker',
  'Wilson',
] as const


const TRAINING_HISPANIC_BOYS_FIRST_NAMES = [
  'Alejandro',
  'Andres',
  'Angel',
  'Carlos',
  'Cristian',
  'Diego',
  'Eduardo',
  'Emilio',
  'Fernando',
  'Gabriel',
  'Hector',
  'Javier',
  'Jesus',
  'Jorge',
  'Jose',
  'Luis',
  'Manuel',
  'Marco',
  'Mateo',
  'Miguel',
  'Rafael',
  'Ricardo',
  'Sergio',
  'Victor',
] as const


const TRAINING_HISPANIC_GIRLS_FIRST_NAMES = [
  'Adriana',
  'Alejandra',
  'Ana',
  'Camila',
  'Carolina',
  'Daniela',
  'Elena',
  'Esmeralda',
  'Gabriela',
  'Isabella',
  'Jasmine',
  'Leticia',
  'Lucia',
  'Mariana',
  'Marisol',
  'Natalia',
  'Patricia',
  'Sofia',
  'Valeria',
  'Vanessa',
  'Veronica',
  'Ximena',
  'Yadira',
  'Yesenia',
] as const


const TRAINING_HISPANIC_LAST_NAMES = [
  'Alvarez',
  'Castillo',
  'Chavez',
  'Cruz',
  'Delgado',
  'Diaz',
  'Dominguez',
  'Flores',
  'Garcia',
  'Gonzales',
  'Gonzalez',
  'Guerrero',
  'Gutierrez',
  'Hernandez',
  'Jimenez',
  'Lopez',
  'Martinez',
  'Mendoza',
  'Morales',
  'Navarro',
  'Ortiz',
  'Ramirez',
  'Reyes',
  'Rodriguez',
  'Salazar',
  'Sanchez',
  'Solis',
  'Torres',
  'Valdez',
  'Vasquez',
] as const


const TRAINING_BLACK_BOYS_FIRST_NAMES = [
  'Andre',
  'Anthony',
  'Brandon',
  'Cameron',
  'Darius',
  'DeAndre',
  'Donovan',
  'Elijah',
  'Isaiah',
  'Jalen',
  'Jamal',
  'Jordan',
  'Joshua',
  'Kendrick',
  'Malcolm',
  'Marcus',
  'Miles',
  'Terrell',
  'Trevon',
  'Xavier',
] as const


const TRAINING_BLACK_GIRLS_FIRST_NAMES = [
  'Aaliyah',
  'Alexis',
  'Amaya',
  'Brianna',
  'Destiny',
  'Imani',
  'Jada',
  'Jasmine',
  'Jordan',
  'Kayla',
  'Kennedy',
  'Kiara',
  'Maya',
  'Nia',
  'Raven',
  'Simone',
  'Tiana',
  'Trinity',
  'Zaria',
  'Zoe',
] as const


const TRAINING_BLACK_LAST_NAMES = [
  'Allen',
  'Banks',
  'Brown',
  'Coleman',
  'Daniels',
  'Dixon',
  'Freeman',
  'Grant',
  'Hall',
  'Jackson',
  'Jefferson',
  'Jenkins',
  'Mitchell',
  'Robinson',
  'Sanders',
  'Thomas',
  'Thompson',
  'Washington',
  'Williams',
  'Wright',
] as const


type TrainingNameCategory =
  | 'hispanic'
  | 'black'
  | 'general'


function getTrainingNameCategory(
  overallIndex: number,
  seedBase: number,
): TrainingNameCategory {

  const cycleOffset =
    getDeterministicTrainingInt(
      seedBase + 3300,
      0,
      9
    )

  const cycleIndex =
    (
      overallIndex +
      cycleOffset
    ) %
    10

  if (
    cycleIndex < 4
  ) {
    return 'hispanic'
  }

  if (
    cycleIndex < 6
  ) {
    return 'black'
  }

  return 'general'
}


function getTrainingName(
  isGirls: boolean,
  category: TrainingNameCategory,
  nameIndex: number,
  classIndex: number,
  seedBase: number,
): {
  firstName: string
  lastName: string
} {

  const firstNames =
    category === 'hispanic'
      ? (
          isGirls
            ? TRAINING_HISPANIC_GIRLS_FIRST_NAMES
            : TRAINING_HISPANIC_BOYS_FIRST_NAMES
        )
      : category === 'black'
        ? (
            isGirls
              ? TRAINING_BLACK_GIRLS_FIRST_NAMES
              : TRAINING_BLACK_BOYS_FIRST_NAMES
          )
        : (
            isGirls
              ? TRAINING_GENERAL_GIRLS_FIRST_NAMES
              : TRAINING_GENERAL_BOYS_FIRST_NAMES
          )

  const lastNames =
    category === 'hispanic'
      ? TRAINING_HISPANIC_LAST_NAMES
      : category === 'black'
        ? TRAINING_BLACK_LAST_NAMES
        : TRAINING_GENERAL_LAST_NAMES

  const firstIndex =
    (
      nameIndex * 7 +
      classIndex * 3 +
      getDeterministicTrainingInt(
        seedBase + 4100,
        0,
        firstNames.length - 1
      )
    ) %
    firstNames.length

  const lastIndex =
    (
      nameIndex * 11 +
      classIndex * 5 +
      getDeterministicTrainingInt(
        seedBase + 4200,
        0,
        lastNames.length - 1
      )
    ) %
    lastNames.length

  return {
    firstName:
      firstNames[
        firstIndex
      ],
    lastName:
      lastNames[
        lastIndex
      ],
  }
}


const TRAINING_TEAM_NAMES = [
  'Levelland',
  'Gainesville',
  'Sulphur Springs',
  'Brenham',
  'Uvalde',
  'Alice',
] as const


const TRAINING_TEAMS_PER_DIVISION =
  6

const TRAINING_MIN_LIFTERS_PER_WEIGHT_CLASS =
  5

const TRAINING_MAX_LIFTERS_PER_WEIGHT_CLASS =
  15

const TRAINING_MIN_LIFTERS_PER_TEAM =
  12

const TRAINING_MAX_LIFTERS_PER_TEAM =
  20

const TRAINING_BTEAM_LIFTERS_PER_DIVISION =
  4


function createTrainingMeetDefinition(
  meetId: string,
): LocalMeet {

  const isBestLift =
    meetId ===
    TRAINING_BEST_LIFT_MEET_ID

  const divisionBase =
    isBestLift
      ? 100
      : 200

  const platformMeetId =
    isBestLift
      ? TRAINING_BEST_LIFT_PLATFORM_MEET_ID
      : TRAINING_ALL_ATTEMPTS_PLATFORM_MEET_ID

  return {
    state: {
      meet: {
        id:
          meetId,
        name:
          isBestLift
            ? 'PowerScore Training - Best Lift'
            : 'PowerScore Training - All Attempts',
        date:
          isBestLift
            ? '2026-10-10'
            : '2026-10-11',
        location:
          'Training Only',
        resultEntryMode:
          isBestLift
            ? 'best-lift-only'
            : 'all-attempts',
        platformMeetId,
      },

      divisions: [
        {
          id:
            divisionBase + 1,
          meetId,
          name:
            'THSPA Training Boys',
          ruleSet:
            'THSPA',
        },

        {
          id:
            divisionBase + 2,
          meetId,
          name:
            'THSWPA Training Girls',
          ruleSet:
            'THSWPA',
        },
      ],

      teams: [],

      lifters: [],
    },

    divisionTeams: [],
  }
}


function ensureTrainingMeetExists(
  meetId: string,
): LocalMeet {

  let meet =
    localMeets.find(
      item =>
        item.state.meet.id ===
        meetId
    )

  if (
    meet !== undefined
  ) {
    return meet
  }

  meet =
    createTrainingMeetDefinition(
      meetId
    )

  localMeets.push(
    meet
  )

  return meet
}


function getDeterministicTrainingUnit(
  seed: number,
): number {

  const value =
    Math.sin(
      seed * 12.9898 +
      78.233
    ) *
    43758.5453

  return (
    value -
    Math.floor(
      value
    )
  )
}


function getDeterministicTrainingInt(
  seed: number,
  minimum: number,
  maximum: number,
): number {

  return (
    minimum +
    Math.floor(
      getDeterministicTrainingUnit(
        seed
      ) *
      (
        maximum -
        minimum +
        1
      )
    )
  )
}


function getTrainingWeightClassCounts(
  weightClassNames:
    readonly string[],
  seedBase: number,
): number[] {

  if (
    weightClassNames.length === 0
  ) {
    return []
  }

  const lastIndex =
    weightClassNames.length - 1

  const counts =
    weightClassNames.map(
      (
        _,
        index
      ) => {
        const normalized =
          lastIndex === 0
            ? 0
            : (
                index /
                lastIndex
              ) *
                2 -
              1

        const bell =
          Math.pow(
            Math.max(
              0,
              1 -
              Math.abs(
                normalized
              )
            ),
            1.25
          )

        const baseCount =
          TRAINING_MIN_LIFTERS_PER_WEIGHT_CLASS +
          Math.round(
            bell * 8
          )

        const jitter =
          getDeterministicTrainingInt(
            seedBase +
              index * 17,
            -2,
            2
          )

        return Math.max(
          TRAINING_MIN_LIFTERS_PER_WEIGHT_CLASS,
          Math.min(
            TRAINING_MAX_LIFTERS_PER_WEIGHT_CLASS,
            baseCount +
              jitter
          )
        )
      }
    )

  const minimumTotal =
    TRAINING_TEAMS_PER_DIVISION *
    TRAINING_MIN_LIFTERS_PER_TEAM

  const maximumTotal =
    TRAINING_TEAMS_PER_DIVISION *
    TRAINING_MAX_LIFTERS_PER_TEAM

  const center =
    (
      counts.length -
      1
    ) / 2

  const middleFirstIndexes =
    counts
      .map(
        (
          _,
          index
        ) =>
          index
      )
      .sort(
        (
          a,
          b
        ) =>
          Math.abs(
            a -
            center
          ) -
          Math.abs(
            b -
            center
          )
      )

  let total =
    counts.reduce(
      (
        sum,
        count
      ) =>
        sum +
        count,
      0
    )

  while (
    total <
    minimumTotal
  ) {
    let changed =
      false

    for (
      const index of
      middleFirstIndexes
    ) {
      if (
        counts[index] >=
        TRAINING_MAX_LIFTERS_PER_WEIGHT_CLASS
      ) {
        continue
      }

      counts[index] +=
        1

      total +=
        1

      changed =
        true

      if (
        total >=
        minimumTotal
      ) {
        break
      }
    }

    if (
      !changed
    ) {
      break
    }
  }

  const outsideFirstIndexes =
    [...middleFirstIndexes]
      .reverse()

  while (
    total >
    maximumTotal
  ) {
    let changed =
      false

    for (
      const index of
      outsideFirstIndexes
    ) {
      if (
        counts[index] <=
        TRAINING_MIN_LIFTERS_PER_WEIGHT_CLASS
      ) {
        continue
      }

      counts[index] -=
        1

      total -=
        1

      changed =
        true

      if (
        total <=
        maximumTotal
      ) {
        break
      }
    }

    if (
      !changed
    ) {
      break
    }
  }

  return counts
}


function getTrainingBodyWeight(
  weightClassNames:
    readonly string[],
  classIndex: number,
  lifterIndexWithinClass: number,
  seedBase: number,
): number {

  const current =
    Number.parseFloat(
      weightClassNames[
        classIndex
      ]
    )

  const previous =
    classIndex > 0
      ? Number.parseFloat(
          weightClassNames[
            classIndex - 1
          ]
        )
      : Number.NaN

  if (
    Number.isFinite(
      current
    )
  ) {
    const lower =
      Number.isFinite(
        previous
      )
        ? previous + 0.2
        : Math.max(
            1,
            current - 9
          )

    const upper =
      current - 0.2

    const fraction =
      0.15 +
      getDeterministicTrainingUnit(
        seedBase +
          classIndex * 101 +
          lifterIndexWithinClass * 7
      ) *
        0.7

    const value =
      lower +
      (
        upper -
        lower
      ) *
        fraction

    return Math.round(
      value * 10
    ) / 10
  }

  if (
    Number.isFinite(
      previous
    )
  ) {
    return (
      Math.round(
        (
          previous +
          7 +
          getDeterministicTrainingUnit(
            seedBase +
              lifterIndexWithinClass * 13
          ) *
            13
        ) *
          10
      ) /
      10
    )
  }

  return 150
}


function rebuildTrainingTeams(
  meet: LocalMeet,
  boysDivisionId: number,
  girlsDivisionId: number,
  teamIdBase: number,
): number[] {

  meet.state.teams = []
  meet.divisionTeams = []

  const teamIds:
    number[] =
    []

  for (
    let index = 0;
    index <
    TRAINING_TEAMS_PER_DIVISION;
    index += 1
  ) {
    const teamId =
      teamIdBase +
      index +
      1

    teamIds.push(
      teamId
    )

    meet.state.teams.push({
      id:
        teamId,
      meetId:
        meet.state.meet.id,
      name:
        TRAINING_TEAM_NAMES[
          index
        ],
      region:
        null,
      classification:
        null,
      isBTeam:
        false,
    })

    meet.divisionTeams.push(
      {
        divisionId:
          boysDivisionId,
        teamId,
      },

      {
        divisionId:
          girlsDivisionId,
        teamId,
      }
    )
  }

  return teamIds
}


function getTrainingTeamAssignments(
  totalLifters: number,
  seedBase: number,
): number[] {

  const assignments:
    number[] =
    []

  const teamCounts =
    Array.from(
      {
        length:
          TRAINING_TEAMS_PER_DIVISION,
      },
      () =>
        0
    )

  for (
    let index = 0;
    index <
    totalLifters;
    index += 1
  ) {
    const eligible =
      teamCounts
        .map(
          (
            count,
            teamIndex
          ) => ({
            count,
            teamIndex,
          })
        )
        .filter(
          item =>
            item.count <
            TRAINING_MAX_LIFTERS_PER_TEAM
        )

    const minimumCount =
      Math.min(
        ...eligible.map(
          item =>
            item.count
        )
      )

    const smallestTeams =
      eligible.filter(
        item =>
          item.count ===
          minimumCount
      )

    const choice =
      smallestTeams[
        getDeterministicTrainingInt(
          seedBase +
            index * 19,
          0,
          smallestTeams.length - 1
        )
      ]

    assignments.push(
      choice.teamIndex
    )

    teamCounts[
      choice.teamIndex
    ] +=
      1
  }

  return assignments
}


function populateTrainingDivision(
  meet: LocalMeet,
  division: Division,
  teamIds:
    readonly number[],
  idBase: number,
  firstLifterNumber: number,
  isGirls: boolean,
  seedBase: number,
): void {

  const weightClasses =
    getDivisionRules(
      division
    ).weightClasses
      .map(
        item =>
          item.name
      )

  const classCounts =
    getTrainingWeightClassCounts(
      weightClasses,
      seedBase
    )

  const totalLifters =
    classCounts.reduce(
      (
        sum,
        count
      ) =>
        sum +
        count,
      0
    )

  const teamAssignments =
    getTrainingTeamAssignments(
      totalLifters,
      seedBase +
        5000
    )

  const bTeamIndexes =
    new Set<number>()

  while (
    bTeamIndexes.size <
    Math.min(
      TRAINING_BTEAM_LIFTERS_PER_DIVISION,
      totalLifters
    )
  ) {
    bTeamIndexes.add(
      getDeterministicTrainingInt(
        seedBase +
          7000 +
          bTeamIndexes.size * 37,
        0,
        totalLifters - 1
      )
    )
  }

  let overallIndex =
    0

  classCounts.forEach(
    (
      classCount,
      classIndex
    ) => {
      for (
        let classLifterIndex = 0;
        classLifterIndex <
        classCount;
        classLifterIndex += 1
      ) {
        const category =
          getTrainingNameCategory(
            overallIndex,
            seedBase
          )

        const generatedName =
          getTrainingName(
            isGirls,
            category,
            overallIndex,
            classIndex,
            seedBase
          )

        let firstName =
          generatedName.firstName

        let lastName =
          generatedName.lastName

        let nameAttempt =
          0

        while (
          meet.state.lifters.some(
            existing =>
              existing.firstName
                .trim()
                .toLocaleLowerCase() ===
                firstName
                  .trim()
                  .toLocaleLowerCase() &&
              existing.lastName
                .trim()
                .toLocaleLowerCase() ===
                lastName
                  .trim()
                  .toLocaleLowerCase()
          )
        ) {
          nameAttempt +=
            1

          const alternateName =
            getTrainingName(
              isGirls,
              category,
              overallIndex +
                nameAttempt * 13,
              classIndex +
                nameAttempt,
              seedBase +
                nameAttempt * 101
            )

          firstName =
            alternateName.firstName

          lastName =
            alternateName.lastName
        }

        const lifterNumber =
          firstLifterNumber +
          overallIndex

        const lifter =
          createDevelopmentLifter(
            idBase +
              overallIndex,
            lifterNumber,
            firstName,
            lastName,
            division.id,
            teamIds[
              teamAssignments[
                overallIndex
              ]
            ],
            'equipped'
          )

        lifter.bodyWeight =
          getTrainingBodyWeight(
            weightClasses,
            classIndex,
            classLifterIndex,
            seedBase +
              9000
          )

        lifter.weightClass =
          weightClasses[
            classIndex
          ]

        lifter.weightClassSource =
          'automatic'

        lifter.isExtraLifter =
          bTeamIndexes.has(
            overallIndex
          )

        meet.state.lifters.push(
          lifter
        )

        overallIndex +=
          1
      }
    }
  )
}


function populateTrainingRoster(
  meet: LocalMeet,
  boysDivisionId: number,
  girlsDivisionId: number,
  teamIdBase: number,
  idBase: number,
): void {

  meet.state.lifters = []

  const boysDivision =
    meet.state.divisions.find(
      division =>
        division.id ===
        boysDivisionId
    )

  const girlsDivision =
    meet.state.divisions.find(
      division =>
        division.id ===
        girlsDivisionId
    )

  if (
    boysDivision === undefined ||
    girlsDivision === undefined
  ) {
    return
  }

  const teamIds =
    rebuildTrainingTeams(
      meet,
      boysDivisionId,
      girlsDivisionId,
      teamIdBase
    )

  populateTrainingDivision(
    meet,
    boysDivision,
    teamIds,
    idBase,
    1,
    false,
    idBase + 1100
  )

  populateTrainingDivision(
    meet,
    girlsDivision,
    teamIds,
    idBase + 1000,
    201,
    true,
    idBase + 2200
  )
}


function buildTrainingCsv(
  rows:
    readonly (
      readonly [
        number,
        number,
        number,
        number,
        number,
        number,
      ]
    )[],
): string {

  return [
    'Platform,Lifter,Round,Weight,Result,Status',
    ...rows.map(
      row =>
        row.join(',')
    ),
    '',
  ].join('\n')
}


function getTrainingLiftWeight(
  lifter: Lifter,
  lift:
    CompetitionLift,
  attemptNumber = 0,
): number {

  const bodyWeight =
    lifter.bodyWeight ??
    150

  const lifterSeed =
    lifter.lifterNumber *
      97 +
    Math.round(
      bodyWeight * 10
    )

  const squatMultiplier =
    1.55 +
    getDeterministicTrainingUnit(
      lifterSeed + 11
    ) *
      0.55

  const squatBest =
    bodyWeight *
    squatMultiplier

  const deadliftRatio =
    0.80 +
    getDeterministicTrainingUnit(
      lifterSeed + 29
    ) *
      0.10

  const benchRatio =
    0.48 +
    getDeterministicTrainingUnit(
      lifterSeed + 47
    ) *
      0.14

  const bestWeight =
    lift ===
      'squat'
      ? squatBest
      : lift ===
          'deadlift'
        ? squatBest *
          deadliftRatio
        : squatBest *
          benchRatio

  const round =
    Math.max(
      0,
      attemptNumber
    )

  const attemptAdjustment =
    round <= 0
      ? 0
      : (
          round -
          3
        ) *
          10

  return Math.max(
    45,
    Math.round(
      (
        bestWeight +
        attemptAdjustment
      ) /
      5
    ) *
      5
  )
}


interface TrainingAttempt {
  weight: number
  result: 0 | 1
}


function getTrainingAttemptPlan(
  lifter: Lifter,
  lift: CompetitionLift,
  platform: number,
  lifterIndex: number,
): readonly [
  TrainingAttempt,
  TrainingAttempt,
  TrainingAttempt,
] {

  const seed =
    lifter.lifterNumber *
      131 +
    platform *
      43 +
    lifterIndex *
      17 +
    (
      lift ===
        'squat'
        ? 3
        : lift ===
            'bench'
          ? 7
          : 11
    )

  const opener =
    getTrainingLiftWeight(
      lifter,
      lift,
      1
    )

  const firstIncrease =
    getDeterministicTrainingInt(
      seed + 101,
      1,
      3
    ) *
      5

  const secondIncrease =
    getDeterministicTrainingInt(
      seed + 211,
      1,
      3
    ) *
      5

  const pattern =
    getDeterministicTrainingInt(
      seed + 307,
      0,
      4
    )

  if (
    pattern === 0
  ) {
    return [
      {
        weight:
          opener,
        result: 0,
      },
      {
        weight:
          opener,
        result: 1,
      },
      {
        weight:
          opener +
          secondIncrease,
        result: 1,
      },
    ]
  }

  if (
    pattern === 1
  ) {
    const secondWeight =
      opener +
      firstIncrease

    return [
      {
        weight:
          opener,
        result: 1,
      },
      {
        weight:
          secondWeight,
        result: 0,
      },
      {
        weight:
          secondWeight,
        result: 1,
      },
    ]
  }

  if (
    pattern === 2
  ) {
    return [
      {
        weight:
          opener,
        result: 1,
      },
      {
        weight:
          opener +
          firstIncrease,
        result: 1,
      },
      {
        weight:
          opener +
          firstIncrease +
          secondIncrease,
        result: 0,
      },
    ]
  }

  return [
    {
      weight:
        opener,
      result: 1,
    },
    {
      weight:
        opener +
        firstIncrease,
      result: 1,
    },
    {
      weight:
        opener +
        firstIncrease +
        secondIncrease,
      result: 1,
    },
  ]
}


interface TrainingWeightClassGroup {
  divisionId: number
  weightClass: string
  sortWeight: number
  lifters: Lifter[]
}


function getTrainingWeightClassSortWeight(
  weightClass: string,
  fallback: number,
): number {

  const parsed =
    Number.parseFloat(
      weightClass
    )

  if (
    Number.isFinite(
      parsed
    )
  ) {
    return parsed
  }

  return fallback
}


function getTrainingWeightClassGroups(
  meet: LocalMeet,
): TrainingWeightClassGroup[] {

  const groups:
    TrainingWeightClassGroup[] =
    []

  meet.state.divisions.forEach(
    (
      division,
      divisionIndex
    ) => {
      const weightClasses =
        getDivisionRules(
          division
        ).weightClasses
          .map(
            item =>
              item.name
          )

      weightClasses.forEach(
        (
          weightClass,
          classIndex
        ) => {
          const lifters =
            meet.state.lifters
              .filter(
                lifter =>
                  lifter.divisionId ===
                    division.id &&
                  lifter.weightClass ===
                    weightClass
              )
              .sort(
                (
                  a,
                  b
                ) =>
                  a.lifterNumber -
                  b.lifterNumber
              )

          if (
            lifters.length === 0
          ) {
            return
          }

          groups.push({
            divisionId:
              division.id,
            weightClass,
            sortWeight:
              getTrainingWeightClassSortWeight(
                weightClass,
                1000 +
                  divisionIndex * 100 +
                  classIndex
              ),
            lifters,
          })
        }
      )
    }
  )

  return groups.sort(
    (
      a,
      b
    ) => {
      if (
        a.sortWeight !==
        b.sortWeight
      ) {
        return (
          a.sortWeight -
          b.sortWeight
        )
      }

      return (
        a.divisionId -
        b.divisionId
      )
    }
  )
}


function getTrainingPlatformAssignments(
  meet: LocalMeet,
):
  Array<{
    platform: number
    groups:
      TrainingWeightClassGroup[]
    lifters:
      Lifter[]
  }> {

  const platformCount =
    6

  const groups =
    getTrainingWeightClassGroups(
      meet
    )

  const totalLifters =
    groups.reduce(
      (
        sum,
        group
      ) =>
        sum +
        group.lifters.length,
      0
    )

  const target =
    totalLifters /
    platformCount

  const assignments:
    Array<{
      platform: number
      groups:
        TrainingWeightClassGroup[]
      lifters:
        Lifter[]
    }> =
    []

  let groupIndex =
    0

  for (
    let platform = 1;
    platform <=
    platformCount;
    platform += 1
  ) {
    const groupsRemaining =
      groups.length -
      groupIndex

    const platformsRemaining =
      platformCount -
      platform +
      1

    const platformGroups:
      TrainingWeightClassGroup[] =
      []

    let platformLifterCount =
      0

    while (
      groupIndex <
      groups.length
    ) {
      const groupsAfterTaking =
        groups.length -
        (
          groupIndex +
          1
        )

      const mustLeaveAtLeastOneGroupPerPlatform =
        groupsAfterTaking <
        platformsRemaining -
          1

      if (
        mustLeaveAtLeastOneGroupPerPlatform
      ) {
        break
      }

      const nextGroup =
        groups[
          groupIndex
        ]

      const nextTotal =
        platformLifterCount +
        nextGroup.lifters.length

      const platformTarget =
        target

      const currentDistance =
        Math.abs(
          platformLifterCount -
          platformTarget
        )

      const nextDistance =
        Math.abs(
          nextTotal -
          platformTarget
        )

      const shouldTakeNext =
        platformGroups.length === 0 ||
        nextDistance <=
          currentDistance ||
        groupsRemaining ===
          platformsRemaining

      if (
        !shouldTakeNext
      ) {
        break
      }

      platformGroups.push(
        nextGroup
      )

      platformLifterCount =
        nextTotal

      groupIndex +=
        1
    }

    assignments.push({
      platform,
      groups:
        platformGroups,
      lifters:
        platformGroups.flatMap(
          group =>
            group.lifters
        ),
    })
  }

  // If rounding left any groups behind, append them to the final platform.
  if (
    groupIndex <
    groups.length
  ) {
    const final =
      assignments[
        assignments.length -
        1
      ]

    while (
      groupIndex <
      groups.length
    ) {
      const group =
        groups[
          groupIndex
        ]

      final.groups.push(
        group
      )

      final.lifters.push(
        ...group.lifters
      )

      groupIndex +=
        1
    }
  }

  return assignments
}


function getTrainingPlatformLifters(
  meet: LocalMeet,
  platform: number,
): Lifter[] {

  return (
    getTrainingPlatformAssignments(
      meet
    )
      .find(
        assignment =>
          assignment.platform ===
          platform
      )
      ?.lifters ??
    []
  )
}


function configureBestLiftTrainingFiles(
  meet: LocalMeet,
): void {

  const files:
    Array<{
      name: string
      csv: string
    }> =
    []

  for (
    let platform = 1;
    platform <= 6;
    platform += 1
  ) {
    const lifters =
      getTrainingPlatformLifters(
        meet,
        platform
      )

    const squatRows =
      lifters.map(
        lifter => [
          platform,
          lifter.lifterNumber,
          0,
          getTrainingLiftWeight(
            lifter,
            'squat'
          ),
          1,
          0,
        ] as const
      )

    files.push({
      name:
        `${TRAINING_BEST_LIFT_PLATFORM_MEET_ID}__Platform${platform}__Squat__BestLifts.csv`,
      csv:
        buildTrainingCsv(
          squatRows
        ),
    })

    const benchRows =
      lifters.map(
        lifter => [
          platform,
          lifter.lifterNumber,
          0,
          getTrainingLiftWeight(
            lifter,
            'bench'
          ),
          1,
          0,
        ] as const
      )

    if (
      platform === 3
    ) {
      benchRows.push(
        [
          platform,
          999,
          0,
          185,
          1,
          0,
        ]
      )
    }

    files.push({
      name:
        `${TRAINING_BEST_LIFT_PLATFORM_MEET_ID}__Platform${platform}__Bench__BestLifts.csv`,
      csv:
        buildTrainingCsv(
          benchRows
        ),
    })

    const missingIndex =
      (
        platform === 4 ||
        platform === 6
      ) &&
      lifters.length > 2
        ? Math.max(
            1,
            Math.floor(
              lifters.length / 2
            )
          )
        : -1

    const statusIndex =
      (
        platform === 5 ||
        platform === 6
      ) &&
      lifters.length > 1
        ? Math.max(
            0,
            lifters.length - 2
          )
        : -1

    const deadliftRows =
      lifters
        .filter(
          (
            _,
            index
          ) =>
            index !==
            missingIndex
        )
        .map(
          lifter => {
            const originalIndex =
              lifters.indexOf(
                lifter
              )

            if (
              originalIndex ===
              statusIndex
            ) {
              return [
                platform,
                lifter.lifterNumber,
                0,
                0,
                platform === 5
                  ? 0
                  : 2,
                platform === 5
                  ? 1
                  : 2,
              ] as const
            }

            return [
              platform,
              lifter.lifterNumber,
              0,
              getTrainingLiftWeight(
                lifter,
                'deadlift'
              ),
              1,
              0,
            ] as const
          }
        )

    files.push({
      name:
        `${TRAINING_BEST_LIFT_PLATFORM_MEET_ID}__Platform${platform}__Deadlift__BestLifts.csv`,
      csv:
        buildTrainingCsv(
          deadliftRows
        ),
    })
  }

  configureTrainingPlatformManagerFiles(
    TRAINING_BEST_LIFT_PLATFORM_MEET_ID,
    files
  )
}


function configureAllAttemptsTrainingFiles(
  meet: LocalMeet,
): void {

  const files:
    Array<{
      name: string
      csv: string
    }> =
    []

  const lifts:
    readonly CompetitionLift[] =
    [
      'squat',
      'bench',
      'deadlift',
    ]

  for (
    let platform = 1;
    platform <= 6;
    platform += 1
  ) {
    const lifters =
      getTrainingPlatformLifters(
        meet,
        platform
      )

    for (
      const lift of
      lifts
    ) {
      const plans:
        Array<
          readonly [
            TrainingAttempt,
            TrainingAttempt,
            TrainingAttempt,
          ]
        > =
        lifters.map(
          (
            lifter,
            index
          ) =>
            getTrainingAttemptPlan(
              lifter,
              lift,
              platform,
              index
            )
        )

      const missingIndex =
        Math.max(
          1,
          Math.floor(
            lifters.length / 2
          )
        )

      const bombIndex =
        Math.max(
          0,
          lifters.length - 2
        )

      const statusIndex =
        Math.max(
          0,
          lifters.length - 3
        )

      if (
        lift ===
          'squat' &&
        lifters.length > 0
      ) {
        const opener =
          getTrainingLiftWeight(
            lifters[
              bombIndex
            ],
            lift,
            1
          )

        plans[
          bombIndex
        ] = [
          {
            weight:
              opener,
            result: 0,
          },
          {
            weight:
              opener +
              5,
            result: 0,
          },
          {
            weight:
              opener +
              10,
            result: 0,
          },
        ]
      }

      for (
        let round = 1;
        round <= 3;
        round += 1
      ) {
        const rows:
          Array<
            readonly [
              number,
              number,
              number,
              number,
              number,
              number,
            ]
          > =
          []

        lifters.forEach(
          (
            lifter,
            index
          ) => {
            if (
              lift !==
                'squat' &&
              index ===
                bombIndex
            ) {
              return
            }

            if (
              lift ===
                'deadlift' &&
              round ===
                3 &&
              (
                platform === 5 ||
                platform === 6
              ) &&
              index ===
                statusIndex
            ) {
              return
            }

            if (
              lift ===
                'bench' &&
              round ===
                2 &&
              (
                platform === 4 ||
                platform === 5
              ) &&
              index ===
                missingIndex
            ) {
              return
            }

            if (
              lift ===
                'deadlift' &&
              round ===
                3 &&
              (
                platform === 4 ||
                platform === 6
              ) &&
              index ===
                missingIndex
            ) {
              return
            }

            let status =
              0

            let attempt =
              plans[
                index
              ][
                round - 1
              ]

            if (
              lift ===
                'deadlift' &&
              round ===
                2 &&
              (
                platform === 5 ||
                platform === 6
              ) &&
              index ===
                statusIndex
            ) {
              status =
                platform === 5
                  ? 2
                  : 3

              attempt = {
                weight: 0,
                result: 1,
              }
            }

            rows.push(
              [
                platform,
                lifter.lifterNumber,
                round,
                status === 0
                  ? attempt.weight
                  : 0,
                status === 0
                  ? attempt.result
                  : 2,
                status,
              ]
            )
          }
        )

        if (
          platform === 3 &&
          lift ===
            'bench' &&
          round ===
            3
        ) {
          rows.push(
            [
              platform,
              998,
              round,
              205,
              1,
              0,
            ]
          )
        }

        const liftName =
          lift ===
            'squat'
            ? 'Squat'
            : lift ===
                'bench'
              ? 'Bench'
              : 'Deadlift'

        files.push({
          name:
            `${TRAINING_ALL_ATTEMPTS_PLATFORM_MEET_ID}__Platform${platform}__${liftName}__Round${round}.csv`,
          csv:
            buildTrainingCsv(
              rows
            ),
        })
      }
    }
  }

  configureTrainingPlatformManagerFiles(
    TRAINING_ALL_ATTEMPTS_PLATFORM_MEET_ID,
    files
  )
}


function populateTrainingMeet(
  meetId: string,
  forceReset = false,
): void {

  const meet =
    ensureTrainingMeetExists(
      meetId
    )

  if (
    !forceReset &&
    meet.state.lifters.length > 0
  ) {
    return
  }

  const isBestLift =
    meetId ===
    TRAINING_BEST_LIFT_MEET_ID

  const divisionBase =
    isBestLift
      ? 100
      : 200

  const teamIdBase =
    isBestLift
      ? 1000
      : 2000

  populateTrainingRoster(
    meet,
    divisionBase + 1,
    divisionBase + 2,
    teamIdBase,
    isBestLift
      ? 10000
      : 20000
  )

  if (
    isBestLift
  ) {
    configureBestLiftTrainingFiles(
      meet
    )
  } else {
    configureAllAttemptsTrainingFiles(
      meet
    )
  }
}


function openTrainingMeet(
  meetId: string,
  reset = false,
): void {

  populateTrainingMeet(
    meetId,
    reset
  )

  const meet =
    ensureTrainingMeetExists(
      meetId
    )

  if (
    meet.state.lifters.length === 0
  ) {
    populateTrainingMeet(
      meetId,
      true
    )
  }

  const platformMeetId =
    getNormalizedPlatformMeetId(
      meet
    )

  if (
    reset
  ) {
    resetTrainingPlatformManagerFiles(
      platformMeetId
    )
  }

  pendingPlatformResultCountByMeetId.set(
    platformMeetId,
    listTrainingPlatformManagerFiles(
      platformMeetId
    ).length
  )

  selectedMeetId =
    meetId

  selectedDivisionId =
    meet.state.divisions[0]?.id ??
    null

  selectedTeamId =
    meet.state.teams[0]?.id ??
    null

  currentPage =
    'registration'

  renderApp()
}


populateTrainingMeet(
  TRAINING_BEST_LIFT_MEET_ID
)

populateTrainingMeet(
  TRAINING_ALL_ATTEMPTS_MEET_ID
)


function completeTestImportedLifter(
  meet: LocalMeet,
  lifter: Lifter,
): void {

  const isBestLift =
    meet.state.meet.id ===
    TEST_BEST_LIFT_MEET_ID

  const division =
    meet.state.divisions[0]

  if (
    division === undefined
  ) {
    return
  }

  const teamId =
    meet.divisionTeams.find(
      item =>
        item.divisionId ===
        division.id
    )?.teamId ??
    meet.state.teams[0]?.id ??
    null

  lifter.divisionId =
    division.id

  lifter.teamId =
    teamId

  lifter.firstName =
    isBestLift
      ? 'Mateo'
      : 'Darius'

  lifter.lastName =
    isBestLift
      ? 'Renteria'
      : 'Coleman'

  lifter.bodyWeight =
    isBestLift
      ? 179.6
      : 180.2

  lifter.weightClass =
    '181'

  lifter.weightClassSource =
    'automatic'

  setPlatformRegistrationState(
    lifter,
    undefined
  )
}


function createPreloadedTestMeet(
  trainingMeetId: string,
  testMeetId: string,
  testMeetName: string,
  trainingPlatformMeetId: string,
  idOffset: number,
): void {

  if (
    localMeets.some(
      meet =>
        meet.state.meet.id ===
        testMeetId
    )
  ) {
    return
  }

  populateTrainingMeet(
    trainingMeetId
  )

  const trainingMeet =
    localMeets.find(
      meet =>
        meet.state.meet.id ===
        trainingMeetId
    )

  if (
    trainingMeet === undefined
  ) {
    return
  }

  const testMeet =
    JSON.parse(
      JSON.stringify(
        trainingMeet
      )
    ) as LocalMeet

  testMeet.state.meet.id =
    testMeetId

  testMeet.state.meet.name =
    testMeetName

  testMeet.state.meet.location =
    'Development Test Data'

  delete testMeet.state.meet
    .platformMeetId

  const divisionIdMap =
    new Map<number, number>()

  testMeet.state.divisions.forEach(
    division => {
      const oldId =
        division.id

      const newId =
        oldId +
        idOffset

      divisionIdMap.set(
        oldId,
        newId
      )

      division.id =
        newId

      division.meetId =
        testMeetId

      division.name =
        division.name.replace(
          'Training',
          'Test'
        )
    }
  )

  const teamIdMap =
    new Map<number, number>()

  testMeet.state.teams.forEach(
    team => {
      const oldId =
        team.id

      const newId =
        oldId +
        idOffset

      teamIdMap.set(
        oldId,
        newId
      )

      team.id =
        newId

      team.meetId =
        testMeetId
    }
  )

  testMeet.divisionTeams.forEach(
    item => {
      item.divisionId =
        divisionIdMap.get(
          item.divisionId
        ) ??
        item.divisionId

      item.teamId =
        teamIdMap.get(
          item.teamId
        ) ??
        item.teamId
    }
  )

  testMeet.state.lifters.forEach(
    lifter => {
      lifter.id +=
        idOffset * 10

      lifter.divisionId =
        divisionIdMap.get(
          lifter.divisionId
        ) ??
        lifter.divisionId

      if (
        lifter.teamId !==
        null
      ) {
        lifter.teamId =
          teamIdMap.get(
            lifter.teamId
          ) ??
          lifter.teamId
      }
    }
  )

  localMeets.push(
    testMeet
  )

  const submissions =
    listTrainingPlatformManagerFiles(
      trainingPlatformMeetId
    )
      .map(
        file =>
          parsePlatformManagerSubmission(
            file.name,
            getTrainingPlatformManagerCsv(
              trainingPlatformMeetId,
              file.name
            ),
            trainingPlatformMeetId
          )
      )

  applyPlatformManagerSubmissions(
    testMeet,
    submissions
  )

  testMeet.state.lifters
    .filter(
      lifter =>
        isPlatformRegistrationIncomplete(
          lifter
        )
    )
    .forEach(
      lifter => {
        completeTestImportedLifter(
          testMeet,
          lifter
        )
      }
    )
}


function ensurePreloadedTestMeets():
  void {

  createPreloadedTestMeet(
    TRAINING_BEST_LIFT_MEET_ID,
    TEST_BEST_LIFT_MEET_ID,
    'PowerScore Test - Best Lift',
    TRAINING_BEST_LIFT_PLATFORM_MEET_ID,
    10000
  )

  createPreloadedTestMeet(
    TRAINING_ALL_ATTEMPTS_MEET_ID,
    TEST_ALL_ATTEMPTS_MEET_ID,
    'PowerScore Test - All Attempts',
    TRAINING_ALL_ATTEMPTS_PLATFORM_MEET_ID,
    20000
  )
}


ensurePreloadedTestMeets()


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

let individualStandingsSortColumn:
  IndividualStandingsSortColumn =
    'weightClass'

let individualStandingsSortAscending =
  true

let teamStandingsSortColumn:
  TeamStandingsSortColumn =
    'place'

let teamStandingsSortAscending =
  true


let bestLifterSortColumn:
  BestLifterSortColumn =
    'weightGroup'

let bestLifterSortAscending =
  true


let bestLiftSortColumn:
  BestLiftSortColumn =
    'lift'

let bestLiftSortAscending =
  true


let detailSortColumn:
  DetailSortColumn =
    'weightClass'

let detailSortAscending =
  true


const competitionWeightClassByDivision =
  new Map<string, string | null>()


const missingResultsReviewDivisions =
  new Set<string>()


const PLATFORM_RESULTS_POLL_INTERVAL_MS =
  15000

let platformResultsPollTimer:
  number | null =
    null

const pendingPlatformResultCountByMeetId =
  new Map<string, number>()


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


function generateSelectedPlatformMeetId():
  void {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }

  const existing =
    meet.state.meet
      .platformMeetId

  if (
    existing !== undefined &&
    existing !== '' &&
    !window.confirm(
      `Generate a new Platform MeetID?\n\nThe current MeetID ${existing} will no longer match PlatformManager stations using the old code.`
    )
  ) {
    return
  }

  meet.state.meet.platformMeetId =
    createPlatformMeetId()

  renderApp()
}


function getNormalizedPlatformMeetId(
  meet: LocalMeet,
): string {

  return meet.state.meet
    .platformMeetId
    ?.trim()
    .toUpperCase() ??
    ''
}


function togglePlatformMeetIdVisibility(
  inputId: string,
  buttonId: string,
): void {

  const input =
    document.querySelector<HTMLInputElement>(
      `#${inputId}`
    )

  const button =
    document.querySelector<HTMLButtonElement>(
      `#${buttonId}`
    )

  if (
    input === null ||
    button === null ||
    input.value === ''
  ) {
    return
  }

  const showing =
    input.type === 'text'

  input.type =
    showing
      ? 'password'
      : 'text'

  button.textContent =
    showing
      ? 'View'
      : 'Hide'
}


async function copySelectedPlatformMeetId():
  Promise<void> {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }

  const meetId =
    getNormalizedPlatformMeetId(
      meet
    )

  if (
    meetId === ''
  ) {
    return
  }

  try {
    await navigator.clipboard
      .writeText(
        meetId
      )
  } catch {
    const textarea =
      document.createElement(
        'textarea'
      )

    textarea.value =
      meetId

    textarea.style.position =
      'fixed'

    textarea.style.opacity =
      '0'

    document.body.appendChild(
      textarea
    )

    textarea.select()
    document.execCommand(
      'copy'
    )
    textarea.remove()
  }

  const button =
    document.querySelector<HTMLButtonElement>(
      '#copyPlatformMeetId, #copyCompetitionPlatformMeetId'
    )

  if (
    button !== null
  ) {
    const original =
      button.textContent ??
      'Copy'

    button.textContent =
      'Copied'

    window.setTimeout(
      () => {
        button.textContent =
          original
      },
      1200
    )
  }
}


function wirePlatformMeetIdControls():
  void {

  document
    .querySelector<HTMLButtonElement>(
      '#viewPlatformMeetId'
    )
    ?.addEventListener(
      'click',
      () =>
        togglePlatformMeetIdVisibility(
          'platformMeetIdDisplay',
          'viewPlatformMeetId'
        )
    )

  document
    .querySelector<HTMLButtonElement>(
      '#viewCompetitionPlatformMeetId'
    )
    ?.addEventListener(
      'click',
      () =>
        togglePlatformMeetIdVisibility(
          'competitionPlatformMeetIdDisplay',
          'viewCompetitionPlatformMeetId'
        )
    )

  document
    .querySelectorAll<HTMLButtonElement>(
      '#copyPlatformMeetId, #copyCompetitionPlatformMeetId'
    )
    .forEach(
      button =>
        button.addEventListener(
          'click',
          () => {
            void copySelectedPlatformMeetId()
          }
        )
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

  const platformTeam =
    document.querySelector<HTMLSelectElement>(
      '#editLifterTeam'
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
    teamId:
      platformTeam?.value ??
      '',
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

  const platformTeamInput =
    document.querySelector<HTMLSelectElement>(
      '#editLifterTeam'
    )

  if (
    lifter === undefined ||
    division === undefined ||
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

  const duplicateName =
    findDuplicateLifterName(
      meet,
      firstName,
      lastName,
      lifter.id
    )

  if (
    duplicateName !==
    undefined
  ) {
    showDuplicateLifterNameMessage(
      duplicateName
    )

    firstInput.focus()

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

    gradeInput?.focus()

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
      teamId:
        platformTeamInput === null ||
        platformTeamInput.value === ''
          ? lifter.teamId
          : Number(
              platformTeamInput.value
            ),
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

  refreshPlatformRegistrationState(
    lifter
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
        id="navStandings"
        type="button"
        class="nav-item ${
          currentPage === 'standings'
            ? 'active'
            : ''
        }"
      >
        Standings
      </button>

      <button
        id="navBestLifters"
        type="button"
        class="nav-item ${
          currentPage ===
          'best-lifters'
            ? 'active'
            : ''
        }"
      >
        Best Lifters
      </button>

      <button
        id="navBestLifts"
        type="button"
        class="nav-item ${
          currentPage ===
          'best-lifts'
            ? 'active'
            : ''
        }"
      >
        Best Lifts
      </button>

      <button
        id="navSummary"
        type="button"
        class="nav-item ${
          currentPage ===
          'summary'
            ? 'active'
            : ''
        }"
      >
        Summary
      </button>

      <button
        id="navDetail"
        type="button"
        class="nav-item ${
          currentPage ===
          'detail'
            ? 'active'
            : ''
        }"
      >
        Detail
      </button>

      <button
        id="navTools"
        type="button"
        class="nav-item ${
          currentPage ===
          'tools'
            ? 'active'
            : ''
        }"
      >
        Tools
      </button>

      <button
        id="navHelp"
        type="button"
        class="nav-item ${
          currentPage ===
          'help'
            ? 'active'
            : ''
        }"
      >
        Help
      </button>

      ${
        (() => {
          const issueCount =
            getSelectedMeet() === undefined
              ? 0
              : getPlatformImportIssues(
                  getSelectedMeet()!
                ).length

          return issueCount > 0
            ? `
              <button
                id="navPlatformIssues"
                type="button"
                class="nav-item ${currentPage === 'platform-issues' ? 'active' : ''}"
              >
                Platform Issues (${issueCount})
              </button>
            `
            : ''
        })()
      }

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


function getStandingsTeamName(
  meet: LocalMeet,
  teamId: number | null,
): string {
  if (teamId === null) return 'Unattached'

  return (
    meet.state.teams.find(
      team => team.id === teamId
    )?.name ??
    'Unknown Team'
  )
}


function getStandingsData(
  meet: LocalMeet,
) {
  const division = getSelectedDivision()

  if (division === undefined) {
    return {
      division: undefined,
      individual: [] as IndividualStanding[],
      teams: [] as TeamStanding[],
    }
  }

  const individual = calculateIndividualStandings(
    meet.state.lifters
      .filter(lifter => lifter.divisionId === division.id)
      .map(lifter => ({
        id: lifter.id,
        lifterNumber: lifter.lifterNumber,
        firstName: lifter.firstName,
        lastName: lifter.lastName,
        teamId: lifter.teamId,
        bodyWeight: lifter.bodyWeight,
        weightClass: lifter.weightClass,
        status: lifter.status,
        isGuest: lifter.isGuest,
        isExtraLifter: lifter.isExtraLifter,
        squat: getCompetitionBestLiftValue(meet, lifter, 'squat'),
        bench: getCompetitionBestLiftValue(meet, lifter, 'bench'),
        deadlift: getCompetitionBestLiftValue(meet, lifter, 'deadlift'),
      }))
  )

  return {
    division,
    individual,
    teams: calculateTeamStandings(individual),
  }
}


function compareStandingsText(
  a: string,
  b: string,
  ascending: boolean,
): number {
  const result = a.localeCompare(
    b,
    undefined,
    {
      sensitivity: 'base',
      numeric: true,
    }
  )

  return ascending ? result : -result
}


function getSortedIndividualStandings(
  meet: LocalMeet,
  rows: readonly IndividualStanding[],
): IndividualStanding[] {
  return [...rows].sort((a, b) => {
    let result = 0

    switch (individualStandingsSortColumn) {
      case 'weightClass':
        result =
          getWeightClassSortValue(a.weightClass) -
          getWeightClassSortValue(b.weightClass)

        if (!individualStandingsSortAscending) result = -result

        if (result === 0) result = a.place - b.place
        break

      case 'place':
        result = a.place - b.place
        break

      case 'lifterNumber':
        result = a.lifterNumber - b.lifterNumber
        break

      case 'lifter':
        return compareStandingsText(
          `${a.lastName}, ${a.firstName}`,
          `${b.lastName}, ${b.firstName}`,
          individualStandingsSortAscending
        )

      case 'team':
        return compareStandingsText(
          getStandingsTeamName(meet, a.teamId),
          getStandingsTeamName(meet, b.teamId),
          individualStandingsSortAscending
        )

      case 'bodyWeight':
        result = a.bodyWeight - b.bodyWeight
        break

      case 'total':
        result = a.total - b.total
        break
    }

    if (
      individualStandingsSortColumn !== 'weightClass' &&
      !individualStandingsSortAscending
    ) {
      result = -result
    }

    if (result !== 0) return result
    return a.lifterNumber - b.lifterNumber
  })
}


function getSortedTeamStandings(
  meet: LocalMeet,
  rows: readonly TeamStanding[],
): TeamStanding[] {
  return [...rows].sort((a, b) => {
    let result = 0

    switch (teamStandingsSortColumn) {
      case 'place': result = a.place - b.place; break
      case 'team':
        return compareStandingsText(
          getStandingsTeamName(meet, a.teamId),
          getStandingsTeamName(meet, b.teamId),
          teamStandingsSortAscending
        )
      case 'firsts': result = a.firsts - b.firsts; break
      case 'seconds': result = a.seconds - b.seconds; break
      case 'thirds': result = a.thirds - b.thirds; break
      case 'fourths': result = a.fourths - b.fourths; break
      case 'fifths': result = a.fifths - b.fifths; break
      case 'totalPoints': result = a.totalPoints - b.totalPoints; break
    }

    if (!teamStandingsSortAscending) result = -result
    if (result !== 0) return result
    return a.place - b.place
  })
}


function renderIndividualStandingsSortHeader(
  label: string,
  column: IndividualStandingsSortColumn,
): string {
  const active = individualStandingsSortColumn === column

  return `
    <th>
      <button
        type="button"
        class="standings-sort-button ${active ? 'active' : ''}"
        data-individual-standings-sort="${column}"
      >
        <span>${escapeHtml(label)}</span>
        <span>${active ? (individualStandingsSortAscending ? '▲' : '▼') : ''}</span>
      </button>
    </th>
  `
}


function renderTeamStandingsSortHeader(
  label: string,
  column: TeamStandingsSortColumn,
): string {
  const active = teamStandingsSortColumn === column

  return `
    <th>
      <button
        type="button"
        class="standings-sort-button ${active ? 'active' : ''}"
        data-team-standings-sort="${column}"
      >
        <span>${escapeHtml(label)}</span>
        <span>${active ? (teamStandingsSortAscending ? '▲' : '▼') : ''}</span>
      </button>
    </th>
  `
}


function renderStandingsDivisionTabs(
  meet: LocalMeet,
): string {
  return `
    <div class="standings-division-tabs">
      ${meet.state.divisions.map(
        division => `
          <button
            type="button"
            class="standings-division-tab ${division.id === selectedDivisionId ? 'active' : ''}"
            data-standings-division="${division.id}"
          >
            ${escapeHtml(division.name)}
          </button>
        `
      ).join('')}
    </div>
  `
}


function renderStandings(): string {
  const meet = getSelectedMeet()

  if (meet === undefined) {
    return `
      <main class="standings-page">
        <div class="empty-state">Select a meet to view standings.</div>
      </main>
    `
  }

  const { division, individual, teams } = getStandingsData(meet)

  if (division === undefined) {
    return `
      <main class="standings-page">
        ${renderStandingsDivisionTabs(meet)}
        <div class="empty-state">Select a division to view standings.</div>
      </main>
    `
  }

  const sortedIndividual = getSortedIndividualStandings(meet, individual)
  const sortedTeams = getSortedTeamStandings(meet, teams)

  return `
    <main class="standings-page">

      <div class="standings-screen-toolbar no-print">
        <div>
          <div class="standings-print-menu">
            <button
              id="printStandingsMenu"
              type="button"
              class="compact-button"
            >
              Print ▾
            </button>

            <div
              id="standingsPrintOptions"
              class="standings-print-options"
              hidden
            >
              <button
                type="button"
                data-print-standings="individual"
              >
                Individual
              </button>

              <button
                type="button"
                data-print-standings="team"
              >
                Team
              </button>

              <button
                type="button"
                data-print-standings="both"
              >
                Both
              </button>
            </div>
          </div>

          <div class="standings-copy-menu">
            <button id="copyStandingsMenu" type="button" class="compact-button">
              Copy ▾
            </button>

            <div
              id="standingsCopyOptions"
              class="standings-copy-options"
              hidden
            >
              <button
                type="button"
                data-copy-format="formatted"
              >
                Copy Formatted ▸
              </button>

              <button
                type="button"
                data-copy-format="spreadsheet"
              >
                Copy for Spreadsheet ▸
              </button>

              <button
                type="button"
                data-copy-format="word"
              >
                Copy for Word ▸
              </button>

              <div
                id="standingsCopyScopeOptions"
                class="standings-copy-scope-options"
                hidden
              >
                <button
                  type="button"
                  data-copy-scope="individual"
                >
                  Individual
                </button>

                <button
                  type="button"
                  data-copy-scope="team"
                >
                  Team
                </button>

                <button
                  type="button"
                  data-copy-scope="both"
                >
                  Both
                </button>
              </div>
            </div>
          </div>

          <button
            id="resetStandingsSort"
            type="button"
            class="compact-button"
            title="Restore default standings sorting"
          >
            Reset Sort
          </button>
        </div>

        <div class="standings-toolbar-note">
          Click a column heading to sort. Sorting does not change official placing.
        </div>
      </div>

      ${renderStandingsDivisionTabs(meet)}

      <section class="standings-print-heading">
        <h1 class="print-only">${escapeHtml(meet.state.meet.name)}</h1>
        <h2>${escapeHtml(division.name)} Standings</h2>
      </section>

      <div class="standings-layout">

        <section class="standings-panel individual-standings-panel">
          <div class="standings-panel-heading">
            <h2>Individual Standings</h2>
            <span>${individual.length} completed lifters</span>
          </div>

          <div class="standings-table-scroll">
            <table class="standings-table">
              <thead>
                <tr>
                  ${renderIndividualStandingsSortHeader('Wt. Class', 'weightClass')}
                  ${renderIndividualStandingsSortHeader('Place', 'place')}
                  ${renderIndividualStandingsSortHeader('Lifter #', 'lifterNumber')}
                  ${renderIndividualStandingsSortHeader('Lifter', 'lifter')}
                  ${renderIndividualStandingsSortHeader('Team', 'team')}
                  ${renderIndividualStandingsSortHeader('BWT', 'bodyWeight')}
                  ${renderIndividualStandingsSortHeader('Total', 'total')}
                </tr>
              </thead>
              <tbody>
                ${
                  sortedIndividual.length === 0
                    ? '<tr><td colspan="7" class="standings-empty-row">No completed lifters yet.</td></tr>'
                    : sortedIndividual.map(
                        row => `
                          <tr>
                            <td class="numeric">${escapeHtml(row.weightClass)}</td>
                            <td class="numeric">${row.place}</td>
                            <td class="numeric">${row.lifterNumber}</td>
                            <td class="lifter-name">
                              ${escapeHtml(getIndividualStandingDisplayName(meet, row))}
                            </td>
                            <td>${escapeHtml(getStandingsTeamName(meet, row.teamId))}</td>
                            <td class="numeric">${row.bodyWeight.toFixed(1)}</td>
                            <td class="numeric standings-total">${row.total}</td>
                          </tr>
                        `
                      ).join('')
                }
              </tbody>
            </table>
          </div>
        </section>

        <section class="standings-panel team-standings-panel">
          <div class="standings-panel-heading">
            <h2>Team Standings</h2>
            <span>7-5-3-2-1 scoring</span>
          </div>

          <div class="standings-table-scroll">
            <table class="standings-table">
              <thead>
                <tr>
                  ${renderTeamStandingsSortHeader('Place', 'place')}
                  ${renderTeamStandingsSortHeader('Team', 'team')}
                  ${renderTeamStandingsSortHeader('1st x7', 'firsts')}
                  ${renderTeamStandingsSortHeader('2nd x5', 'seconds')}
                  ${renderTeamStandingsSortHeader('3rd x3', 'thirds')}
                  ${renderTeamStandingsSortHeader('4th x2', 'fourths')}
                  ${renderTeamStandingsSortHeader('5th x1', 'fifths')}
                  ${renderTeamStandingsSortHeader('Total Pts.', 'totalPoints')}
                </tr>
              </thead>
              <tbody>
                ${
                  sortedTeams.length === 0
                    ? '<tr><td colspan="8" class="standings-empty-row">No team points have been scored yet.</td></tr>'
                    : sortedTeams.map(
                        row => `
                          <tr>
                            <td class="numeric">${row.place}</td>
                            <td>${escapeHtml(getStandingsTeamName(meet, row.teamId))}</td>
                            <td class="numeric">${row.firsts}</td>
                            <td class="numeric">${row.seconds}</td>
                            <td class="numeric">${row.thirds}</td>
                            <td class="numeric">${row.fourths}</td>
                            <td class="numeric">${row.fifths}</td>
                            <td class="numeric standings-total">${row.totalPoints}</td>
                          </tr>
                        `
                      ).join('')
                }
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  `
}


function getStandingsSpreadsheetText(
  meet: LocalMeet,
  scope:
    StandingsOutputScope =
      'both',
): string {

  const {
    division,
    individual,
    teams,
  } =
    getStandingsData(
      meet
    )

  if (
    division === undefined
  ) {
    return ''
  }

  const lines:
    string[] =
    [
      meet.state.meet.name,
      `${division.name} Standings`,
    ]

  if (
    scope ===
      'individual' ||
    scope ===
      'both'
  ) {
    lines.push(
      '',
      'Individual Standings',
      [
        'Wt. Class',
        'Place',
        'Lifter #',
        'Lifter',
        'Team',
        'BWT',
        'Total',
      ].join('\t')
    )

    getSortedIndividualStandings(
      meet,
      individual
    ).forEach(
      row => {
        lines.push(
          [
            row.weightClass,
            row.place,
            row.lifterNumber,
            getIndividualStandingDisplayName(
              meet,
              row
            ),
            getStandingsTeamName(
              meet,
              row.teamId
            ),
            row.bodyWeight.toFixed(
              1
            ),
            row.total,
          ].join('\t')
        )
      }
    )
  }

  if (
    scope ===
      'team' ||
    scope ===
      'both'
  ) {
    lines.push(
      '',
      'Team Standings',
      [
        'Place',
        'Team',
        '1st x7',
        '2nd x5',
        '3rd x3',
        '4th x2',
        '5th x1',
        'Total Pts.',
      ].join('\t')
    )

    getSortedTeamStandings(
      meet,
      teams
    ).forEach(
      row => {
        lines.push(
          [
            row.place,
            getStandingsTeamName(
              meet,
              row.teamId
            ),
            row.firsts,
            row.seconds,
            row.thirds,
            row.fourths,
            row.fifths,
            row.totalPoints,
          ].join('\t')
        )
      }
    )
  }

  return lines.join('\n')
}


function getStandingsFormattedHtml(
  meet: LocalMeet,
  scope:
    StandingsOutputScope =
      'both',
): string {

  const {
    division,
    individual,
    teams,
  } =
    getStandingsData(
      meet
    )

  if (
    division === undefined
  ) {
    return ''
  }

  const th =
    'border:1px solid #9ca3af;background:#dbe7f3;padding:6px 8px;font-weight:700;'

  const td =
    'border:1px solid #cbd5e1;padding:5px 7px;'

  const individualRows =
    getSortedIndividualStandings(
      meet,
      individual
    )
      .map(
        row => `
          <tr>
            <td style="${td}">${escapeHtml(row.weightClass)}</td>
            <td style="${td}text-align:center">${row.place}</td>
            <td style="${td}text-align:center">${row.lifterNumber}</td>
            <td style="${td}">${escapeHtml(
              getIndividualStandingDisplayName(
                meet,
                row
              )
            )}</td>
            <td style="${td}">${escapeHtml(getStandingsTeamName(meet, row.teamId))}</td>
            <td style="${td}text-align:right">${row.bodyWeight.toFixed(1)}</td>
            <td style="${td}text-align:right;font-weight:700">${row.total}</td>
          </tr>
        `
      )
      .join('')

  const teamRows =
    getSortedTeamStandings(
      meet,
      teams
    )
      .map(
        row => `
          <tr>
            <td style="${td}text-align:center">${row.place}</td>
            <td style="${td}">${escapeHtml(getStandingsTeamName(meet, row.teamId))}</td>
            <td style="${td}text-align:center">${row.firsts}</td>
            <td style="${td}text-align:center">${row.seconds}</td>
            <td style="${td}text-align:center">${row.thirds}</td>
            <td style="${td}text-align:center">${row.fourths}</td>
            <td style="${td}text-align:center">${row.fifths}</td>
            <td style="${td}text-align:right;font-weight:700">${row.totalPoints}</td>
          </tr>
        `
      )
      .join('')

  const individualSection =
    scope ===
      'team'
      ? ''
      : `
        <h3>Individual Standings</h3>
        <table style="border-collapse:collapse;width:100%;font-size:12px;margin-bottom:18px;">
          <thead><tr>
            <th style="${th}">Wt. Class</th><th style="${th}">Place</th>
            <th style="${th}">Lifter #</th><th style="${th}">Lifter</th>
            <th style="${th}">Team</th><th style="${th}">BWT</th>
            <th style="${th}">Total</th>
          </tr></thead>
          <tbody>${individualRows}</tbody>
        </table>
      `

  const teamSection =
    scope ===
      'individual'
      ? ''
      : `
        <h3>Team Standings</h3>
        <table style="border-collapse:collapse;width:100%;font-size:12px;">
          <thead><tr>
            <th style="${th}">Place</th><th style="${th}">Team</th>
            <th style="${th}">1st x7</th><th style="${th}">2nd x5</th>
            <th style="${th}">3rd x3</th><th style="${th}">4th x2</th>
            <th style="${th}">5th x1</th><th style="${th}">Total Pts.</th>
          </tr></thead>
          <tbody>${teamRows}</tbody>
        </table>
      `

  return `
    <div style="font-family:Arial,sans-serif;color:#111827;">
      <h2 style="margin:0 0 2px;">${escapeHtml(meet.state.meet.name)}</h2>
      <h3 style="margin:0 0 14px;">${escapeHtml(division.name)} Standings</h3>
      ${individualSection}
      ${teamSection}
    </div>
  `
}


function getStandingsWordHtml(
  meet: LocalMeet,
  scope:
    StandingsOutputScope,
): string {

  const {
    division,
    individual,
    teams,
  } =
    getStandingsData(
      meet
    )

  if (
    division === undefined
  ) {
    return ''
  }

  const th =
    'border:1px solid #9ca3af;background:#eaf1f8;padding:4px 5px;font-family:Arial,sans-serif;font-size:9px;font-weight:700;'

  const td =
    'border:1px solid #cbd5e1;padding:3px 5px;font-family:Arial,sans-serif;font-size:9px;'

  const sections:
    string[] =
    []

  if (
    scope ===
      'individual' ||
    scope ===
      'both'
  ) {
    const rows =
      getSortedIndividualStandings(
        meet,
        individual
      )
        .map(
          row => `
            <tr>
              <td style="${td}width:58px;text-align:right;">${escapeHtml(row.weightClass)}</td>
              <td style="${td}width:38px;text-align:right;">${row.place}</td>
              <td style="${td}width:48px;text-align:right;">${row.lifterNumber}</td>
              <td style="${td}width:175px;font-weight:600;">${escapeHtml(
              getIndividualStandingDisplayName(
                meet,
                row
              )
            )}</td>
              <td style="${td}width:120px;">${escapeHtml(getStandingsTeamName(meet, row.teamId))}</td>
              <td style="${td}width:56px;text-align:right;">${row.bodyWeight.toFixed(1)}</td>
              <td style="${td}width:65px;text-align:right;font-weight:700;">${row.total}</td>
            </tr>
          `
        )
        .join('')

    sections.push(`
      <div style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;margin:0 0 5px;">
        Individual Standings
      </div>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:620px;table-layout:fixed;margin-bottom:14px;">
        <tr>
          <th style="${th}width:58px;">Wt. Class</th>
          <th style="${th}width:38px;">Place</th>
          <th style="${th}width:48px;">Lifter #</th>
          <th style="${th}width:175px;">Lifter</th>
          <th style="${th}width:120px;">Team</th>
          <th style="${th}width:56px;">BWT</th>
          <th style="${th}width:65px;">Total</th>
        </tr>
        ${rows}
      </table>
    `)
  }

  if (
    scope ===
      'team' ||
    scope ===
      'both'
  ) {
    const rows =
      getSortedTeamStandings(
        meet,
        teams
      )
        .map(
          row => `
            <tr>
              <td style="${td}width:38px;text-align:right;">${row.place}</td>
              <td style="${td}width:185px;font-weight:600;">${escapeHtml(getStandingsTeamName(meet, row.teamId))}</td>
              <td style="${td}width:48px;text-align:center;">${row.firsts}</td>
              <td style="${td}width:48px;text-align:center;">${row.seconds}</td>
              <td style="${td}width:48px;text-align:center;">${row.thirds}</td>
              <td style="${td}width:48px;text-align:center;">${row.fourths}</td>
              <td style="${td}width:48px;text-align:center;">${row.fifths}</td>
              <td style="${td}width:72px;text-align:right;font-weight:700;">${row.totalPoints}</td>
            </tr>
          `
        )
        .join('')

    sections.push(`
      <div style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;margin:0 0 5px;">
        Team Standings
      </div>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:620px;table-layout:fixed;">
        <tr>
          <th style="${th}width:38px;">Place</th>
          <th style="${th}width:185px;">Team</th>
          <th style="${th}width:48px;">1st x7</th>
          <th style="${th}width:48px;">2nd x5</th>
          <th style="${th}width:48px;">3rd x3</th>
          <th style="${th}width:48px;">4th x2</th>
          <th style="${th}width:48px;">5th x1</th>
          <th style="${th}width:72px;">Total Pts.</th>
        </tr>
        ${rows}
      </table>
    `)
  }

  return `
    <div style="width:620px;font-family:Arial,sans-serif;color:#111827;">
      <div style="font-size:18px;font-weight:700;margin-bottom:2px;">
        ${escapeHtml(meet.state.meet.name)}
      </div>
      <div style="font-size:12px;font-weight:700;margin-bottom:12px;">
        ${escapeHtml(division.name)} Standings
      </div>
      ${sections.join('')}
    </div>
  `
}


async function copyStandingsWord(
  scope:
    StandingsOutputScope,
): Promise<void> {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }

  const plainText =
    getStandingsSpreadsheetText(
      meet,
      scope
    )

  const html =
    getStandingsWordHtml(
      meet,
      scope
    )

  if (
    typeof ClipboardItem !==
      'undefined' &&
    navigator.clipboard.write !==
      undefined
  ) {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/plain':
          new Blob(
            [plainText],
            {
              type:
                'text/plain',
            }
          ),
        'text/html':
          new Blob(
            [html],
            {
              type:
                'text/html',
            }
          ),
      }),
    ])
  } else {
    await navigator.clipboard.writeText(
      plainText
    )
  }

  window.alert(
    'Word-formatted Standings copied. Paste into Word.'
  )
}


async function copyStandingsForSpreadsheet(
  scope:
    StandingsOutputScope,
): Promise<void> {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }

  await navigator.clipboard.writeText(
    getStandingsSpreadsheetText(
      meet,
      scope
    )
  )

  window.alert(
    'Standings copied for spreadsheet paste.'
  )
}


async function copyStandingsFormatted(
  scope:
    StandingsOutputScope,
): Promise<void> {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }

  const plainText =
    getStandingsSpreadsheetText(
      meet,
      scope
    )

  const html =
    getStandingsFormattedHtml(
      meet,
      scope
    )

  if (
    typeof ClipboardItem !==
      'undefined' &&
    navigator.clipboard.write !==
      undefined
  ) {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/plain':
          new Blob(
            [plainText],
            {
              type:
                'text/plain',
            }
          ),
        'text/html':
          new Blob(
            [html],
            {
              type:
                'text/html',
            }
          ),
      }),
    ])
  } else {
    await navigator.clipboard.writeText(
      plainText
    )
  }

  window.alert(
    'Formatted standings copied. Paste into email or Word.'
  )
}


function wireStandings(): void {
  document
    .querySelectorAll<HTMLButtonElement>('[data-standings-division]')
    .forEach(button => {
      button.addEventListener('click', () => {
        const divisionId = Number(button.dataset.standingsDivision)
        if (!Number.isFinite(divisionId)) return

        selectedDivisionId = divisionId
        renderApp()
      })
    })

  document
    .querySelectorAll<HTMLButtonElement>('[data-individual-standings-sort]')
    .forEach(button => {
      button.addEventListener('click', () => {
        const column =
          button.dataset.individualStandingsSort as IndividualStandingsSortColumn

        if (individualStandingsSortColumn === column) {
          individualStandingsSortAscending = !individualStandingsSortAscending
        } else {
          individualStandingsSortColumn = column
          individualStandingsSortAscending = column !== 'total'
        }

        renderApp()
      })
    })

  document
    .querySelectorAll<HTMLButtonElement>('[data-team-standings-sort]')
    .forEach(button => {
      button.addEventListener('click', () => {
        const column =
          button.dataset.teamStandingsSort as TeamStandingsSortColumn

        if (teamStandingsSortColumn === column) {
          teamStandingsSortAscending = !teamStandingsSortAscending
        } else {
          teamStandingsSortColumn = column
          teamStandingsSortAscending =
            column === 'place' || column === 'team'
        }

        renderApp()
      })
    })

  document
    .querySelector<HTMLButtonElement>(
      '#resetStandingsSort'
    )
    ?.addEventListener(
      'click',
      () => {
        individualStandingsSortColumn =
          'weightClass'

        individualStandingsSortAscending =
          true

        teamStandingsSortColumn =
          'place'

        teamStandingsSortAscending =
          true

        renderApp()
      }
    )

  const copyOptions =
    document
      .querySelector<HTMLDivElement>(
        '#standingsCopyOptions'
      )

  const copyScopeOptions =
    document
      .querySelector<HTMLDivElement>(
        '#standingsCopyScopeOptions'
      )

  const printOptions =
    document
      .querySelector<HTMLDivElement>(
        '#standingsPrintOptions'
      )

  const copyMenu =
    document
      .querySelector<HTMLButtonElement>(
        '#copyStandingsMenu'
      )

  const printMenu =
    document
      .querySelector<HTMLButtonElement>(
        '#printStandingsMenu'
      )

  let selectedCopyFormat:
    StandingsCopyFormat =
      'formatted'

  const closeStandingsMenus =
    () => {
      if (
        copyOptions !==
        null
      ) {
        copyOptions.hidden =
          true
      }

      if (
        copyScopeOptions !==
        null
      ) {
        copyScopeOptions.hidden =
          true
      }

      if (
        printOptions !==
        null
      ) {
        printOptions.hidden =
          true
      }
    }

  copyMenu
    ?.addEventListener(
      'click',
      event => {
        event.stopPropagation()

        if (
          copyOptions ===
          null
        ) {
          return
        }

        const opening =
          copyOptions.hidden

        closeStandingsMenus()

        copyOptions.hidden =
          !opening
      }
    )

  printMenu
    ?.addEventListener(
      'click',
      event => {
        event.stopPropagation()

        if (
          printOptions ===
          null
        ) {
          return
        }

        const opening =
          printOptions.hidden

        closeStandingsMenus()

        printOptions.hidden =
          !opening
      }
    )

  copyOptions
    ?.addEventListener(
      'click',
      event => {
        event.stopPropagation()
      }
    )

  printOptions
    ?.addEventListener(
      'click',
      event => {
        event.stopPropagation()
      }
    )

  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-copy-format]'
    )
    .forEach(
      button => {
        button.addEventListener(
          'click',
          () => {
            selectedCopyFormat =
              button.dataset
                .copyFormat as
                  StandingsCopyFormat

            if (
              copyScopeOptions !==
              null
            ) {
              copyScopeOptions.hidden =
                false
            }
          }
        )
      }
    )

  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-copy-scope]'
    )
    .forEach(
      button => {
        button.addEventListener(
          'click',
          () => {
            const scope =
              button.dataset
                .copyScope as
                  StandingsOutputScope

            closeStandingsMenus()

            if (
              selectedCopyFormat ===
              'formatted'
            ) {
              void copyStandingsFormatted(
                scope
              )

              return
            }

            if (
              selectedCopyFormat ===
              'word'
            ) {
              void copyStandingsWord(
                scope
              )

              return
            }

            void copyStandingsForSpreadsheet(
              scope
            )
          }
        )
      }
    )

  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-print-standings]'
    )
    .forEach(
      button => {
        button.addEventListener(
          'click',
          () => {
            closeStandingsMenus()

            const mode =
              button.dataset
                .printStandings ??
              'both'

            document.body.classList.remove(
              'standings-print-individual',
              'standings-print-team'
            )

            if (
              mode ===
              'individual'
            ) {
              document.body.classList.add(
                'standings-print-individual'
              )
            } else if (
              mode ===
              'team'
            ) {
              document.body.classList.add(
                'standings-print-team'
              )
            }

            window.addEventListener(
              'afterprint',
              () => {
                document.body.classList.remove(
                  'standings-print-individual',
                  'standings-print-team'
                )
              },
              {
                once: true,
              }
            )

            window.print()
          }
        )
      }
    )

  installReportMenuClickAway()
}


interface BestLifterReportRow {
  groupIndex: number
  weightGroup: string
  place: number
  lifterNumber: number
  lifterName: string
  teamName: string
  squat: number
  bench: number
  deadlift: number
  total: number
  coefficient: number
  coefficientTotal: number
}


function getBestLifterWeightGroups(
  division: Division,
):
  Array<{
    label: string
    classes: Set<string>
  }> {

  const weightClasses =
    getDivisionRules(
      division
    ).weightClasses
      .map(
        item =>
          item.name
      )

  if (
    weightClasses.length === 0
  ) {
    return []
  }

  const splitIndex =
    Math.ceil(
      weightClasses.length / 2
    )

  const lower =
    weightClasses.slice(
      0,
      splitIndex
    )

  const upper =
    weightClasses.slice(
      splitIndex
    )

  const makeLabel =
    (
      classes:
        readonly string[],
    ) => {
      if (
        classes.length === 0
      ) {
        return ''
      }

      return (
        `${classes[0]} to ` +
        `${classes[classes.length - 1]}`
      )
    }

  return [
    {
      label:
        makeLabel(
          lower
        ),
      classes:
        new Set(
          lower
        ),
    },

    ...(upper.length > 0
      ? [
          {
            label:
              makeLabel(
                upper
              ),
            classes:
              new Set(
                upper
              ),
          },
        ]
      : []),
  ]
}


function getBestLifterReportRows(
  meet: LocalMeet,
  division: Division,
): BestLifterReportRow[] {

  const groups =
    getBestLifterWeightGroups(
      division
    )

  const candidateRows =
    meet.state.lifters
      .filter(
        lifter =>
          lifter.divisionId ===
            division.id &&
          lifter.status ===
            'active' &&
          !lifter.isGuest &&
          lifter.weightClass !==
            null &&
          lifter.bodyWeight !==
            null
      )
      .map(
        lifter => {
          const squat =
            getCompetitionBestLiftValue(
              meet,
              lifter,
              'squat'
            )

          const bench =
            getCompetitionBestLiftValue(
              meet,
              lifter,
              'bench'
            )

          const deadlift =
            getCompetitionBestLiftValue(
              meet,
              lifter,
              'deadlift'
            )

          const coefficient =
            getLifterBodyWeightCoefficient(
              meet,
              lifter
            )

          if (
            squat === null ||
            bench === null ||
            deadlift === null ||
            coefficient === null
          ) {
            return null
          }

          const total =
            squat +
            bench +
            deadlift

          const groupIndex =
            groups.findIndex(
              group =>
                group.classes.has(
                  lifter.weightClass as string
                )
            )

          if (
            groupIndex < 0
          ) {
            return null
          }

          return {
            groupIndex,
            weightGroup:
              groups[
                groupIndex
              ].label,
            lifterNumber:
              lifter.lifterNumber,
            lifterName:
              getNonRegistrationLifterDisplayName(
                meet,
                lifter
              ),
            teamName:
              getStandingsTeamName(
                meet,
                lifter.teamId
              ),
            squat,
            bench,
            deadlift,
            total,
            coefficient,
            coefficientTotal:
              total *
              coefficient,
          }
        }
      )
      .filter(
        (
          row
        ): row is Omit<
          BestLifterReportRow,
          'place'
        > =>
          row !== null
      )

  const result:
    BestLifterReportRow[] =
    []

  groups.forEach(
    (
      _,
      groupIndex
    ) => {
      candidateRows
        .filter(
          row =>
            row.groupIndex ===
            groupIndex
        )
        .sort(
          (
            a,
            b
          ) => {
            if (
              a.coefficientTotal !==
              b.coefficientTotal
            ) {
              return (
                b.coefficientTotal -
                a.coefficientTotal
              )
            }

            if (
              a.total !==
              b.total
            ) {
              return (
                b.total -
                a.total
              )
            }

            return (
              a.lifterNumber -
              b.lifterNumber
            )
          }
        )
        .slice(
          0,
          3
        )
        .forEach(
          (
            row,
            index
          ) => {
            result.push({
              ...row,
              place:
                index + 1,
            })
          }
        )
    }
  )

  return result
}


function getSortedBestLifterRows(
  rows:
    readonly BestLifterReportRow[],
): BestLifterReportRow[] {

  return [...rows]
    .sort(
      (
        a,
        b
      ) => {
        let result =
          0

        switch (
          bestLifterSortColumn
        ) {
          case 'weightGroup':
            result =
              a.groupIndex -
              b.groupIndex

            if (
              result === 0
            ) {
              result =
                a.place -
                b.place
            }

            break

          case 'place':
            result =
              a.place -
              b.place
            break

          case 'lifterNumber':
            result =
              a.lifterNumber -
              b.lifterNumber
            break

          case 'lifter':
            result =
              a.lifterName.localeCompare(
                b.lifterName,
                undefined,
                {
                  sensitivity:
                    'base',
                  numeric:
                    true,
                }
              )
            break

          case 'team':
            result =
              a.teamName.localeCompare(
                b.teamName,
                undefined,
                {
                  sensitivity:
                    'base',
                  numeric:
                    true,
                }
              )
            break

          case 'squat':
            result =
              a.squat -
              b.squat
            break

          case 'bench':
            result =
              a.bench -
              b.bench
            break

          case 'deadlift':
            result =
              a.deadlift -
              b.deadlift
            break

          case 'total':
            result =
              a.total -
              b.total
            break

          case 'coefficient':
            result =
              a.coefficient -
              b.coefficient
            break

          case 'coefficientTotal':
            result =
              a.coefficientTotal -
              b.coefficientTotal
            break
        }

        if (
          !bestLifterSortAscending
        ) {
          result =
            -result
        }

        if (
          result !== 0
        ) {
          return result
        }

        return (
          a.lifterNumber -
          b.lifterNumber
        )
      }
    )
}


function renderBestLifterSortHeader(
  label: string,
  column:
    BestLifterSortColumn,
): string {

  const active =
    bestLifterSortColumn ===
    column

  return `
    <th>
      <button
        type="button"
        class="standings-sort-button ${
          active
            ? 'active'
            : ''
        }"
        data-best-lifter-sort="${column}"
      >
        <span>${escapeHtml(label)}</span>
        <span>${
          active
            ? (
                bestLifterSortAscending
                  ? '▲'
                  : '▼'
              )
            : ''
        }</span>
      </button>
    </th>
  `
}


function renderBestLifterDivisionTabs(
  meet: LocalMeet,
): string {

  return `
    <div class="standings-division-tabs">
      ${
        meet.state.divisions
          .map(
            division => `
              <button
                type="button"
                class="standings-division-tab ${
                  division.id ===
                  selectedDivisionId
                    ? 'active'
                    : ''
                }"
                data-best-lifter-division="${division.id}"
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


function getBestLifterCoefficientLabel(
  division: Division,
): string {

  const system =
    getDivisionCoefficientSystem(
      division
    )

  if (
    system ===
    'schwartz'
  ) {
    return 'Schwartz'
  }

  if (
    system ===
    'malone'
  ) {
    return 'Malone'
  }

  return 'Coefficient'
}


function renderBestLifters():
  string {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return `
      <main class="best-lifters-page">
        <div class="empty-state">
          Select a meet to view Best Lifters.
        </div>
      </main>
    `
  }

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return `
      <main class="best-lifters-page">
        ${renderBestLifterDivisionTabs(meet)}
        <div class="empty-state">
          Select a division to view Best Lifters.
        </div>
      </main>
    `
  }

  const rows =
    getSortedBestLifterRows(
      getBestLifterReportRows(
        meet,
        division
      )
    )

  const coefficientLabel =
    getBestLifterCoefficientLabel(
      division
    )

  return `
    <main class="best-lifters-page">

      <div class="standings-screen-toolbar no-print">
        <div>
          <button
            id="printBestLifters"
            type="button"
            class="compact-button"
          >
            Print
          </button>

          <div class="standings-copy-menu">
            <button
              id="copyBestLiftersMenu"
              type="button"
              class="compact-button"
            >
              Copy ▾
            </button>

            <div
              id="bestLiftersCopyOptions"
              class="standings-copy-options"
              hidden
            >
              <button
                type="button"
                data-copy-best-lifters="formatted"
              >
                Copy Formatted
              </button>

              <button
                type="button"
                data-copy-best-lifters="spreadsheet"
              >
                Copy for Spreadsheet
              </button>

              <button
                type="button"
                data-copy-best-lifters="word"
              >
                Copy for Word
              </button>
            </div>
          </div>

          <button
            id="resetBestLiftersSort"
            type="button"
            class="compact-button"
            title="Restore default Best Lifters sorting"
          >
            Reset Sort
          </button>
        </div>

        <div class="standings-toolbar-note">
          Click a column heading to sort. Sorting does not change official Best Lifter placing.
        </div>
      </div>

      ${renderBestLifterDivisionTabs(meet)}

      <section class="standings-print-heading">
        <h1 class="print-only">
          ${escapeHtml(meet.state.meet.name)}
        </h1>
        <h2>
          ${escapeHtml(division.name)} Best Lifters
        </h2>
      </section>

      <section class="standings-panel best-lifters-panel">
        <div class="standings-panel-heading">
          <h2>Best Lifters</h2>
          <span>Top 3 in each weight group</span>
        </div>

        <div class="standings-table-scroll">
          <table class="standings-table best-lifters-table">
            <thead>
              <tr>
                ${renderBestLifterSortHeader('Weight Group', 'weightGroup')}
                ${renderBestLifterSortHeader('Place', 'place')}
                ${renderBestLifterSortHeader('Lifter #', 'lifterNumber')}
                ${renderBestLifterSortHeader('Lifter', 'lifter')}
                ${renderBestLifterSortHeader('Team', 'team')}
                ${renderBestLifterSortHeader('Squat', 'squat')}
                ${renderBestLifterSortHeader('Bench Press', 'bench')}
                ${renderBestLifterSortHeader('Deadlift', 'deadlift')}
                ${renderBestLifterSortHeader('Total', 'total')}
                ${renderBestLifterSortHeader(coefficientLabel, 'coefficient')}
                ${renderBestLifterSortHeader(`${coefficientLabel} Total`, 'coefficientTotal')}
              </tr>
            </thead>

            <tbody>
              ${
                rows.length === 0
                  ? `
                    <tr>
                      <td
                        colspan="11"
                        class="standings-empty-row"
                      >
                        No completed lifters are available for Best Lifter calculations.
                      </td>
                    </tr>
                  `
                  : rows
                      .map(
                        row => `
                          <tr>
                            <td>${escapeHtml(row.weightGroup)}</td>
                            <td class="numeric">${row.place}</td>
                            <td class="numeric">${row.lifterNumber}</td>
                            <td class="lifter-name">${escapeHtml(row.lifterName)}</td>
                            <td>${escapeHtml(row.teamName)}</td>
                            <td class="numeric">${row.squat}</td>
                            <td class="numeric">${row.bench}</td>
                            <td class="numeric">${row.deadlift}</td>
                            <td class="numeric standings-total">${row.total}</td>
                            <td class="numeric">${row.coefficient.toFixed(4)}</td>
                            <td class="numeric standings-total">${row.coefficientTotal.toFixed(2)}</td>
                          </tr>
                        `
                      )
                      .join('')
              }
            </tbody>
          </table>
        </div>
      </section>
    </main>
  `
}


function getBestLifterSpreadsheetText(
  meet: LocalMeet,
): string {

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return ''
  }

  const coefficientLabel =
    getBestLifterCoefficientLabel(
      division
    )

  const rows =
    getSortedBestLifterRows(
      getBestLifterReportRows(
        meet,
        division
      )
    )

  const lines =
    [
      meet.state.meet.name,
      `${division.name} Best Lifters`,
      '',
      [
        'Weight Group',
        'Place',
        'Lifter #',
        'Lifter',
        'Team',
        'Squat',
        'Bench Press',
        'Deadlift',
        'Total',
        coefficientLabel,
        `${coefficientLabel} Total`,
      ].join('\t'),
    ]

  rows.forEach(
    row => {
      lines.push(
        [
          row.weightGroup,
          row.place,
          row.lifterNumber,
          row.lifterName,
          row.teamName,
          row.squat,
          row.bench,
          row.deadlift,
          row.total,
          row.coefficient.toFixed(4),
          row.coefficientTotal.toFixed(2),
        ].join('\t')
      )
    }
  )

  return lines.join(
    '\n'
  )
}


function getBestLifterFormattedHtml(
  meet: LocalMeet,
): string {

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return ''
  }

  const coefficientLabel =
    getBestLifterCoefficientLabel(
      division
    )

  const rows =
    getSortedBestLifterRows(
      getBestLifterReportRows(
        meet,
        division
      )
    )

  const th =
    'border:1px solid #9ca3af;background:#dbe7f3;padding:6px 8px;font-weight:700;'

  const td =
    'border:1px solid #cbd5e1;padding:5px 7px;'

  const body =
    rows
      .map(
        row => `
          <tr>
            <td style="${td}">${escapeHtml(row.weightGroup)}</td>
            <td style="${td}text-align:center">${row.place}</td>
            <td style="${td}text-align:center">${row.lifterNumber}</td>
            <td style="${td}">${escapeHtml(row.lifterName)}</td>
            <td style="${td}">${escapeHtml(row.teamName)}</td>
            <td style="${td}text-align:right">${row.squat}</td>
            <td style="${td}text-align:right">${row.bench}</td>
            <td style="${td}text-align:right">${row.deadlift}</td>
            <td style="${td}text-align:right;font-weight:700">${row.total}</td>
            <td style="${td}text-align:right">${row.coefficient.toFixed(4)}</td>
            <td style="${td}text-align:right;font-weight:700">${row.coefficientTotal.toFixed(2)}</td>
          </tr>
        `
      )
      .join('')

  return `
    <div style="font-family:Arial,sans-serif;color:#111827;">
      <h2 style="margin:0 0 2px;">
        ${escapeHtml(meet.state.meet.name)}
      </h2>
      <h3 style="margin:0 0 14px;">
        ${escapeHtml(division.name)} Best Lifters
      </h3>

      <table style="border-collapse:collapse;width:100%;font-size:12px;">
        <thead>
          <tr>
            <th style="${th}">Weight Group</th>
            <th style="${th}">Place</th>
            <th style="${th}">Lifter #</th>
            <th style="${th}">Lifter</th>
            <th style="${th}">Team</th>
            <th style="${th}">Squat</th>
            <th style="${th}">Bench Press</th>
            <th style="${th}">Deadlift</th>
            <th style="${th}">Total</th>
            <th style="${th}">${escapeHtml(coefficientLabel)}</th>
            <th style="${th}">${escapeHtml(`${coefficientLabel} Total`)}</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `
}


function getBestLifterWordHtml(
  meet: LocalMeet,
): string {

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return ''
  }

  const coefficientLabel =
    getBestLifterCoefficientLabel(
      division
    )

  const rows =
    getSortedBestLifterRows(
      getBestLifterReportRows(
        meet,
        division
      )
    )

  const th =
    'border:1px solid #9ca3af;background:#eaf1f8;padding:3px 3px;font-family:Arial,sans-serif;font-size:7.5px;font-weight:700;'

  const td =
    'border:1px solid #cbd5e1;padding:2px 3px;font-family:Arial,sans-serif;font-size:7.5px;'

  const body =
    rows
      .map(
        row => `
          <tr>
            <td style="${td}width:68px;">${escapeHtml(row.weightGroup)}</td>
            <td style="${td}width:28px;text-align:right;">${row.place}</td>
            <td style="${td}width:38px;text-align:right;">${row.lifterNumber}</td>
            <td style="${td}width:112px;font-weight:600;">${escapeHtml(row.lifterName)}</td>
            <td style="${td}width:82px;">${escapeHtml(row.teamName)}</td>
            <td style="${td}width:44px;text-align:right;">${row.squat}</td>
            <td style="${td}width:44px;text-align:right;">${row.bench}</td>
            <td style="${td}width:44px;text-align:right;">${row.deadlift}</td>
            <td style="${td}width:48px;text-align:right;font-weight:700;">${row.total}</td>
            <td style="${td}width:54px;text-align:right;">${row.coefficient.toFixed(4)}</td>
            <td style="${td}width:58px;text-align:right;font-weight:700;">${row.coefficientTotal.toFixed(2)}</td>
          </tr>
        `
      )
      .join('')

  return `
    <div style="width:620px;font-family:Arial,sans-serif;color:#111827;">
      <div style="font-size:17px;font-weight:700;margin-bottom:2px;">
        ${escapeHtml(meet.state.meet.name)}
      </div>
      <div style="font-size:11px;font-weight:700;margin-bottom:10px;">
        ${escapeHtml(division.name)} Best Lifters
      </div>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:620px;table-layout:fixed;">
        <tr>
          <th style="${th}width:68px;">Weight Group</th>
          <th style="${th}width:28px;">Place</th>
          <th style="${th}width:38px;">Lifter #</th>
          <th style="${th}width:112px;">Lifter</th>
          <th style="${th}width:82px;">Team</th>
          <th style="${th}width:44px;">Squat</th>
          <th style="${th}width:44px;">Bench</th>
          <th style="${th}width:44px;">Deadlift</th>
          <th style="${th}width:48px;">Total</th>
          <th style="${th}width:54px;">${escapeHtml(coefficientLabel)}</th>
          <th style="${th}width:58px;">${escapeHtml(`${coefficientLabel} Total`)}</th>
        </tr>
        ${body}
      </table>
    </div>
  `
}


async function copyBestLiftersWord():
  Promise<void> {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }

  const plainText =
    getBestLifterSpreadsheetText(
      meet
    )

  const html =
    getBestLifterWordHtml(
      meet
    )

  if (
    typeof ClipboardItem !==
      'undefined' &&
    navigator.clipboard.write !==
      undefined
  ) {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/plain':
          new Blob([plainText], { type: 'text/plain' }),
        'text/html':
          new Blob([html], { type: 'text/html' }),
      }),
    ])
  } else {
    await navigator.clipboard.writeText(
      plainText
    )
  }

  window.alert(
    'Word-formatted Best Lifters copied. Paste into Word.'
  )
}


async function copyBestLiftersSpreadsheet():
  Promise<void> {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }

  await navigator.clipboard.writeText(
    getBestLifterSpreadsheetText(
      meet
    )
  )

  window.alert(
    'Best Lifters copied for spreadsheet paste.'
  )
}


async function copyBestLiftersFormatted():
  Promise<void> {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }

  const plainText =
    getBestLifterSpreadsheetText(
      meet
    )

  const html =
    getBestLifterFormattedHtml(
      meet
    )

  if (
    typeof ClipboardItem !==
      'undefined' &&
    navigator.clipboard.write !==
      undefined
  ) {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/plain':
          new Blob(
            [plainText],
            {
              type:
                'text/plain',
            }
          ),
        'text/html':
          new Blob(
            [html],
            {
              type:
                'text/html',
            }
          ),
      }),
    ])
  } else {
    await navigator.clipboard.writeText(
      plainText
    )
  }

  window.alert(
    'Formatted Best Lifters copied. Paste into email or Word.'
  )
}


function wireBestLifters():
  void {

  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-best-lifter-division]'
    )
    .forEach(
      button => {
        button.addEventListener(
          'click',
          () => {
            const divisionId =
              Number(
                button.dataset
                  .bestLifterDivision
              )

            if (
              !Number.isFinite(
                divisionId
              )
            ) {
              return
            }

            selectedDivisionId =
              divisionId

            renderApp()
          }
        )
      }
    )

  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-best-lifter-sort]'
    )
    .forEach(
      button => {
        button.addEventListener(
          'click',
          () => {
            const column =
              button.dataset
                .bestLifterSort as
                  BestLifterSortColumn

            if (
              bestLifterSortColumn ===
              column
            ) {
              bestLifterSortAscending =
                !bestLifterSortAscending
            } else {
              bestLifterSortColumn =
                column

              bestLifterSortAscending =
                ![
                  'squat',
                  'bench',
                  'deadlift',
                  'total',
                  'coefficientTotal',
                ].includes(
                  column
                )
            }

            renderApp()
          }
        )
      }
    )

  document
    .querySelector<HTMLButtonElement>(
      '#resetBestLiftersSort'
    )
    ?.addEventListener(
      'click',
      () => {
        bestLifterSortColumn =
          'weightGroup'

        bestLifterSortAscending =
          true

        renderApp()
      }
    )

  const copyMenu =
    document
      .querySelector<HTMLButtonElement>(
        '#copyBestLiftersMenu'
      )

  const copyOptions =
    document
      .querySelector<HTMLDivElement>(
        '#bestLiftersCopyOptions'
      )

  const closeMenu =
    () => {
      if (
        copyOptions !==
        null
      ) {
        copyOptions.hidden =
          true
      }
    }

  copyMenu
    ?.addEventListener(
      'click',
      event => {
        event.stopPropagation()

        if (
          copyOptions ===
          null
        ) {
          return
        }

        copyOptions.hidden =
          !copyOptions.hidden
      }
    )

  copyOptions
    ?.addEventListener(
      'click',
      event => {
        event.stopPropagation()
      }
    )

  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-copy-best-lifters]'
    )
    .forEach(
      button => {
        button.addEventListener(
          'click',
          () => {
            closeMenu()

            if (
              button.dataset
                .copyBestLifters ===
              'formatted'
            ) {
              void copyBestLiftersFormatted()

              return
            }

            if (
              button.dataset
                .copyBestLifters ===
              'word'
            ) {
              void copyBestLiftersWord()

              return
            }

            void copyBestLiftersSpreadsheet()
          }
        )
      }
    )

  document
    .querySelector<HTMLButtonElement>(
      '#printBestLifters'
    )
    ?.addEventListener(
      'click',
      () => {
        window.print()
      }
    )

  installReportMenuClickAway()
}


let reportMenuClickAwayInstalled =
  false


function closeAllReportMenus():
  void {

  document
    .querySelectorAll<HTMLElement>(
      [
        '.standings-print-options',
        '.standings-copy-options',
        '.standings-copy-scope-options',
      ].join(',')
    )
    .forEach(
      element => {
        element.hidden =
          true
      }
    )
}


function installReportMenuClickAway():
  void {

  if (
    reportMenuClickAwayInstalled
  ) {
    return
  }

  reportMenuClickAwayInstalled =
    true

  document.addEventListener(
    'click',
    event => {
      const target =
        event.target as
          HTMLElement | null

      if (
        target?.closest(
          '.standings-print-menu, .standings-copy-menu'
        ) !==
        null
      ) {
        return
      }

      closeAllReportMenus()
    }
  )
}


interface BestLiftReportRow {
  liftIndex: number
  lift: CompetitionLift
  liftLabel: string
  groupIndex: number
  weightGroup: string
  place: number
  lifterNumber: number
  lifterName: string
  teamName: string
  liftWeight: number
  coefficient: number
  coefficientLift: number
}


function getBestLiftReportRows(
  meet: LocalMeet,
  division: Division,
): BestLiftReportRow[] {

  const groups =
    getBestLifterWeightGroups(
      division
    )

  const lifts:
    Array<{
      lift: CompetitionLift
      label: string
    }> = [
      {
        lift: 'squat',
        label: 'Squat',
      },
      {
        lift: 'bench',
        label: 'Bench',
      },
      {
        lift: 'deadlift',
        label: 'Deadlift',
      },
    ]

  const result:
    BestLiftReportRow[] =
    []

  lifts.forEach(
    (
      liftInfo,
      liftIndex
    ) => {
      groups.forEach(
        (
          group,
          groupIndex
        ) => {
          const groupRows =
            meet.state.lifters
              .filter(
                lifter =>
                  lifter.divisionId ===
                    division.id &&
                  lifter.status ===
                    'active' &&
                  !lifter.isGuest &&
                  lifter.weightClass !==
                    null &&
                  lifter.bodyWeight !==
                    null &&
                  group.classes.has(
                    lifter.weightClass
                  )
              )
              .map(
                lifter => {
                  const liftWeight =
                    getCompetitionBestLiftValue(
                      meet,
                      lifter,
                      liftInfo.lift
                    )

                  const coefficient =
                    getLifterBodyWeightCoefficient(
                      meet,
                      lifter
                    )

                  if (
                    liftWeight ===
                      null ||
                    coefficient ===
                      null
                  ) {
                    return null
                  }

                  return {
                    liftIndex,
                    lift:
                      liftInfo.lift,
                    liftLabel:
                      liftInfo.label,
                    groupIndex,
                    weightGroup:
                      group.label,
                    lifterNumber:
                      lifter.lifterNumber,
                    lifterName:
                      getNonRegistrationLifterDisplayName(
                        meet,
                        lifter
                      ),
                    teamName:
                      getStandingsTeamName(
                        meet,
                        lifter.teamId
                      ),
                    liftWeight,
                    coefficient,
                    coefficientLift:
                      liftWeight *
                      coefficient,
                  }
                }
              )
              .filter(
                (
                  row
                ): row is Omit<
                  BestLiftReportRow,
                  'place'
                > =>
                  row !== null
              )
              .sort(
                (
                  a,
                  b
                ) => {
                  if (
                    a.coefficientLift !==
                    b.coefficientLift
                  ) {
                    return (
                      b.coefficientLift -
                      a.coefficientLift
                    )
                  }

                  if (
                    a.liftWeight !==
                    b.liftWeight
                  ) {
                    return (
                      b.liftWeight -
                      a.liftWeight
                    )
                  }

                  return (
                    a.lifterNumber -
                    b.lifterNumber
                  )
                }
              )
              .slice(
                0,
                3
              )

          groupRows.forEach(
            (
              row,
              index
            ) => {
              result.push({
                ...row,
                place:
                  index + 1,
              })
            }
          )
        }
      )
    }
  )

  return result
}


function getSortedBestLiftRows(
  rows:
    readonly BestLiftReportRow[],
): BestLiftReportRow[] {

  return [...rows]
    .sort(
      (
        a,
        b
      ) => {
        let result =
          0

        switch (
          bestLiftSortColumn
        ) {
          case 'lift':
            result =
              a.liftIndex -
              b.liftIndex

            if (
              result === 0
            ) {
              result =
                a.groupIndex -
                b.groupIndex
            }

            if (
              result === 0
            ) {
              result =
                a.place -
                b.place
            }

            break

          case 'weightGroup':
            result =
              a.groupIndex -
              b.groupIndex

            if (
              result === 0
            ) {
              result =
                a.liftIndex -
                b.liftIndex
            }

            if (
              result === 0
            ) {
              result =
                a.place -
                b.place
            }

            break

          case 'place':
            result =
              a.place -
              b.place
            break

          case 'lifterNumber':
            result =
              a.lifterNumber -
              b.lifterNumber
            break

          case 'lifter':
            result =
              a.lifterName.localeCompare(
                b.lifterName,
                undefined,
                {
                  sensitivity:
                    'base',
                  numeric:
                    true,
                }
              )
            break

          case 'team':
            result =
              a.teamName.localeCompare(
                b.teamName,
                undefined,
                {
                  sensitivity:
                    'base',
                  numeric:
                    true,
                }
              )
            break

          case 'liftWeight':
            result =
              a.liftWeight -
              b.liftWeight
            break

          case 'coefficient':
            result =
              a.coefficient -
              b.coefficient
            break

          case 'coefficientLift':
            result =
              a.coefficientLift -
              b.coefficientLift
            break
        }

        if (
          !bestLiftSortAscending
        ) {
          result =
            -result
        }

        if (
          result !== 0
        ) {
          return result
        }

        return (
          a.lifterNumber -
          b.lifterNumber
        )
      }
    )
}


function renderBestLiftSortHeader(
  label: string,
  column:
    BestLiftSortColumn,
): string {

  const active =
    bestLiftSortColumn ===
    column

  return `
    <th>
      <button
        type="button"
        class="standings-sort-button ${
          active
            ? 'active'
            : ''
        }"
        data-best-lift-sort="${column}"
      >
        <span>${escapeHtml(label)}</span>
        <span>${
          active
            ? (
                bestLiftSortAscending
                  ? '▲'
                  : '▼'
              )
            : ''
        }</span>
      </button>
    </th>
  `
}


function renderBestLifts():
  string {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return `
      <main class="best-lifts-page">
        <div class="empty-state">
          Select a meet to view Best Lifts.
        </div>
      </main>
    `
  }

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return `
      <main class="best-lifts-page">
        ${renderBestLifterDivisionTabs(meet)}
        <div class="empty-state">
          Select a division to view Best Lifts.
        </div>
      </main>
    `
  }

  const rows =
    getSortedBestLiftRows(
      getBestLiftReportRows(
        meet,
        division
      )
    )

  const coefficientLabel =
    getBestLifterCoefficientLabel(
      division
    )

  return `
    <main class="best-lifts-page">

      <div class="standings-screen-toolbar no-print">
        <div>
          <button
            id="printBestLifts"
            type="button"
            class="compact-button"
          >
            Print
          </button>

          <div class="standings-copy-menu">
            <button
              id="copyBestLiftsMenu"
              type="button"
              class="compact-button"
            >
              Copy ▾
            </button>

            <div
              id="bestLiftsCopyOptions"
              class="standings-copy-options"
              hidden
            >
              <button
                type="button"
                data-copy-best-lifts="formatted"
              >
                Copy Formatted
              </button>

              <button
                type="button"
                data-copy-best-lifts="spreadsheet"
              >
                Copy for Spreadsheet
              </button>

              <button
                type="button"
                data-copy-best-lifts="word"
              >
                Copy for Word
              </button>
            </div>
          </div>

          <button
            id="resetBestLiftsSort"
            type="button"
            class="compact-button"
          >
            Reset Sort
          </button>
        </div>

        <div class="standings-toolbar-note">
          Click a column heading to sort. Sorting does not change official Best Lift placing.
        </div>
      </div>

      ${renderBestLifterDivisionTabs(meet)}

      <section class="standings-print-heading">
        <h1 class="print-only">
          ${escapeHtml(meet.state.meet.name)}
        </h1>
        <h2>
          ${escapeHtml(division.name)} Best Lifts
        </h2>
      </section>

      <section class="standings-panel best-lifts-panel">
        <div class="standings-panel-heading">
          <h2>Best Lifts</h2>
          <span>Top 3 in each lift and weight group</span>
        </div>

        <div class="standings-table-scroll">
          <table class="standings-table best-lifts-table">
            <thead>
              <tr>
                ${renderBestLiftSortHeader('Lift', 'lift')}
                ${renderBestLiftSortHeader('Weight Group', 'weightGroup')}
                ${renderBestLiftSortHeader('Place', 'place')}
                ${renderBestLiftSortHeader('Lifter #', 'lifterNumber')}
                ${renderBestLiftSortHeader('Lifter', 'lifter')}
                ${renderBestLiftSortHeader('Team', 'team')}
                ${renderBestLiftSortHeader('Lift Weight', 'liftWeight')}
                ${renderBestLiftSortHeader(coefficientLabel, 'coefficient')}
                ${renderBestLiftSortHeader(`${coefficientLabel} Lift`, 'coefficientLift')}
              </tr>
            </thead>

            <tbody>
              ${
                rows.length === 0
                  ? `
                    <tr>
                      <td
                        colspan="9"
                        class="standings-empty-row"
                      >
                        No completed lift data is available for Best Lift calculations.
                      </td>
                    </tr>
                  `
                  : rows
                      .map(
                        row => `
                          <tr>
                            <td>${escapeHtml(row.liftLabel)}</td>
                            <td>${escapeHtml(row.weightGroup)}</td>
                            <td class="numeric">${row.place}</td>
                            <td class="numeric">${row.lifterNumber}</td>
                            <td class="lifter-name">${escapeHtml(row.lifterName)}</td>
                            <td>${escapeHtml(row.teamName)}</td>
                            <td class="numeric standings-total">${row.liftWeight}</td>
                            <td class="numeric">${row.coefficient.toFixed(4)}</td>
                            <td class="numeric standings-total">${row.coefficientLift.toFixed(2)}</td>
                          </tr>
                        `
                      )
                      .join('')
              }
            </tbody>
          </table>
        </div>
      </section>
    </main>
  `
}


function getBestLiftSpreadsheetText(
  meet: LocalMeet,
): string {

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return ''
  }

  const coefficientLabel =
    getBestLifterCoefficientLabel(
      division
    )

  const rows =
    getSortedBestLiftRows(
      getBestLiftReportRows(
        meet,
        division
      )
    )

  const lines =
    [
      meet.state.meet.name,
      `${division.name} Best Lifts`,
      '',
      [
        'Lift',
        'Weight Group',
        'Place',
        'Lifter #',
        'Lifter',
        'Team',
        'Lift Weight',
        coefficientLabel,
        `${coefficientLabel} Lift`,
      ].join('\t'),
    ]

  rows.forEach(
    row => {
      lines.push(
        [
          row.liftLabel,
          row.weightGroup,
          row.place,
          row.lifterNumber,
          row.lifterName,
          row.teamName,
          row.liftWeight,
          row.coefficient.toFixed(4),
          row.coefficientLift.toFixed(2),
        ].join('\t')
      )
    }
  )

  return lines.join(
    '\n'
  )
}


function getBestLiftFormattedHtml(
  meet: LocalMeet,
): string {

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return ''
  }

  const coefficientLabel =
    getBestLifterCoefficientLabel(
      division
    )

  const rows =
    getSortedBestLiftRows(
      getBestLiftReportRows(
        meet,
        division
      )
    )

  const th =
    'border:1px solid #9ca3af;background:#dbe7f3;padding:6px 8px;font-weight:700;'

  const td =
    'border:1px solid #cbd5e1;padding:5px 7px;'

  const body =
    rows
      .map(
        row => `
          <tr>
            <td style="${td}">${escapeHtml(row.liftLabel)}</td>
            <td style="${td}">${escapeHtml(row.weightGroup)}</td>
            <td style="${td}text-align:center">${row.place}</td>
            <td style="${td}text-align:center">${row.lifterNumber}</td>
            <td style="${td}">${escapeHtml(row.lifterName)}</td>
            <td style="${td}">${escapeHtml(row.teamName)}</td>
            <td style="${td}text-align:right;font-weight:700">${row.liftWeight}</td>
            <td style="${td}text-align:right">${row.coefficient.toFixed(4)}</td>
            <td style="${td}text-align:right;font-weight:700">${row.coefficientLift.toFixed(2)}</td>
          </tr>
        `
      )
      .join('')

  return `
    <div style="font-family:Arial,sans-serif;color:#111827;">
      <h2 style="margin:0 0 2px;">
        ${escapeHtml(meet.state.meet.name)}
      </h2>
      <h3 style="margin:0 0 14px;">
        ${escapeHtml(division.name)} Best Lifts
      </h3>

      <table style="border-collapse:collapse;width:100%;font-size:12px;">
        <thead>
          <tr>
            <th style="${th}">Lift</th>
            <th style="${th}">Weight Group</th>
            <th style="${th}">Place</th>
            <th style="${th}">Lifter #</th>
            <th style="${th}">Lifter</th>
            <th style="${th}">Team</th>
            <th style="${th}">Lift Weight</th>
            <th style="${th}">${escapeHtml(coefficientLabel)}</th>
            <th style="${th}">${escapeHtml(`${coefficientLabel} Lift`)}</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `
}


function getBestLiftWordHtml(
  meet: LocalMeet,
): string {

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return ''
  }

  const coefficientLabel =
    getBestLifterCoefficientLabel(
      division
    )

  const rows =
    getSortedBestLiftRows(
      getBestLiftReportRows(
        meet,
        division
      )
    )

  const th =
    'border:1px solid #9ca3af;background:#eaf1f8;padding:3px 4px;font-family:Arial,sans-serif;font-size:8px;font-weight:700;'

  const td =
    'border:1px solid #cbd5e1;padding:2px 4px;font-family:Arial,sans-serif;font-size:8px;'

  const body =
    rows
      .map(
        row => `
          <tr>
            <td style="${td}width:55px;">${escapeHtml(row.liftLabel)}</td>
            <td style="${td}width:90px;">${escapeHtml(row.weightGroup)}</td>
            <td style="${td}width:32px;text-align:right;">${row.place}</td>
            <td style="${td}width:42px;text-align:right;">${row.lifterNumber}</td>
            <td style="${td}width:135px;font-weight:600;">${escapeHtml(row.lifterName)}</td>
            <td style="${td}width:100px;">${escapeHtml(row.teamName)}</td>
            <td style="${td}width:55px;text-align:right;font-weight:700;">${row.liftWeight}</td>
            <td style="${td}width:55px;text-align:right;">${row.coefficient.toFixed(4)}</td>
            <td style="${td}width:65px;text-align:right;font-weight:700;">${row.coefficientLift.toFixed(2)}</td>
          </tr>
        `
      )
      .join('')

  return `
    <div style="width:620px;font-family:Arial,sans-serif;color:#111827;">
      <div style="font-size:17px;font-weight:700;margin-bottom:2px;">
        ${escapeHtml(meet.state.meet.name)}
      </div>
      <div style="font-size:11px;font-weight:700;margin-bottom:10px;">
        ${escapeHtml(division.name)} Best Lifts
      </div>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:620px;table-layout:fixed;">
        <tr>
          <th style="${th}width:55px;">Lift</th>
          <th style="${th}width:90px;">Weight Group</th>
          <th style="${th}width:32px;">Place</th>
          <th style="${th}width:42px;">Lifter #</th>
          <th style="${th}width:135px;">Lifter</th>
          <th style="${th}width:100px;">Team</th>
          <th style="${th}width:55px;">Lift Weight</th>
          <th style="${th}width:55px;">${escapeHtml(coefficientLabel)}</th>
          <th style="${th}width:65px;">${escapeHtml(`${coefficientLabel} Lift`)}</th>
        </tr>
        ${body}
      </table>
    </div>
  `
}


async function copyBestLiftsWord():
  Promise<void> {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }

  const plainText =
    getBestLiftSpreadsheetText(
      meet
    )

  const html =
    getBestLiftWordHtml(
      meet
    )

  if (
    typeof ClipboardItem !==
      'undefined' &&
    navigator.clipboard.write !==
      undefined
  ) {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/plain':
          new Blob([plainText], { type: 'text/plain' }),
        'text/html':
          new Blob([html], { type: 'text/html' }),
      }),
    ])
  } else {
    await navigator.clipboard.writeText(
      plainText
    )
  }

  window.alert(
    'Word-formatted Best Lifts copied. Paste into Word.'
  )
}


async function copyBestLiftsSpreadsheet():
  Promise<void> {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }

  await navigator.clipboard.writeText(
    getBestLiftSpreadsheetText(
      meet
    )
  )

  window.alert(
    'Best Lifts copied for spreadsheet paste.'
  )
}


async function copyBestLiftsFormatted():
  Promise<void> {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }

  const plainText =
    getBestLiftSpreadsheetText(
      meet
    )

  const html =
    getBestLiftFormattedHtml(
      meet
    )

  if (
    typeof ClipboardItem !==
      'undefined' &&
    navigator.clipboard.write !==
      undefined
  ) {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/plain':
          new Blob(
            [plainText],
            {
              type:
                'text/plain',
            }
          ),
        'text/html':
          new Blob(
            [html],
            {
              type:
                'text/html',
            }
          ),
      }),
    ])
  } else {
    await navigator.clipboard.writeText(
      plainText
    )
  }

  window.alert(
    'Formatted Best Lifts copied. Paste into email or Word.'
  )
}


function wireBestLifts():
  void {

  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-best-lifter-division]'
    )
    .forEach(
      button => {
        button.addEventListener(
          'click',
          () => {
            const divisionId =
              Number(
                button.dataset
                  .bestLifterDivision
              )

            if (
              !Number.isFinite(
                divisionId
              )
            ) {
              return
            }

            selectedDivisionId =
              divisionId

            renderApp()
          }
        )
      }
    )

  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-best-lift-sort]'
    )
    .forEach(
      button => {
        button.addEventListener(
          'click',
          () => {
            const column =
              button.dataset
                .bestLiftSort as
                  BestLiftSortColumn

            if (
              bestLiftSortColumn ===
              column
            ) {
              bestLiftSortAscending =
                !bestLiftSortAscending
            } else {
              bestLiftSortColumn =
                column

              bestLiftSortAscending =
                ![
                  'liftWeight',
                  'coefficientLift',
                ].includes(
                  column
                )
            }

            renderApp()
          }
        )
      }
    )

  document
    .querySelector<HTMLButtonElement>(
      '#resetBestLiftsSort'
    )
    ?.addEventListener(
      'click',
      () => {
        bestLiftSortColumn =
          'lift'

        bestLiftSortAscending =
          true

        renderApp()
      }
    )

  const copyMenu =
    document
      .querySelector<HTMLButtonElement>(
        '#copyBestLiftsMenu'
      )

  const copyOptions =
    document
      .querySelector<HTMLDivElement>(
        '#bestLiftsCopyOptions'
      )

  copyMenu
    ?.addEventListener(
      'click',
      event => {
        event.stopPropagation()

        if (
          copyOptions ===
          null
        ) {
          return
        }

        const opening =
          copyOptions.hidden

        closeAllReportMenus()

        copyOptions.hidden =
          !opening
      }
    )

  copyOptions
    ?.addEventListener(
      'click',
      event => {
        event.stopPropagation()
      }
    )

  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-copy-best-lifts]'
    )
    .forEach(
      button => {
        button.addEventListener(
          'click',
          () => {
            closeAllReportMenus()

            if (
              button.dataset
                .copyBestLifts ===
              'formatted'
            ) {
              void copyBestLiftsFormatted()

              return
            }

            if (
              button.dataset
                .copyBestLifts ===
              'word'
            ) {
              void copyBestLiftsWord()

              return
            }

            void copyBestLiftsSpreadsheet()
          }
        )
      }
    )

  document
    .querySelector<HTMLButtonElement>(
      '#printBestLifts'
    )
    ?.addEventListener(
      'click',
      () => {
        closeAllReportMenus()
        window.print()
      }
    )

  installReportMenuClickAway()
}


interface SummaryWeightClassSection {
  weightClass: string
  rows: IndividualStanding[]
}


function getSummaryWeightClassSections(
  meet: LocalMeet,
  division: Division,
): SummaryWeightClassSection[] {

  const {
    individual,
  } =
    getStandingsData(
      meet
    )

  const classOrder =
    getDivisionRules(
      division
    ).weightClasses
      .map(
        item =>
          item.name
      )

  return classOrder
    .map(
      weightClass => ({
        weightClass,
        rows:
          individual
            .filter(
              row =>
                row.weightClass ===
                weightClass
            )
            .sort(
              (
                a,
                b
              ) =>
                a.place -
                b.place
            )
            .slice(
              0,
              5
            ),
      })
    )
    .filter(
      section =>
        section.rows.length >
        0
    )
}


function getSummaryTeamPointExpression(
  row: TeamStanding,
): string {

  const points:
    number[] =
    []

  for (
    let index = 0;
    index < row.firsts;
    index += 1
  ) {
    points.push(7)
  }

  for (
    let index = 0;
    index < row.seconds;
    index += 1
  ) {
    points.push(5)
  }

  for (
    let index = 0;
    index < row.thirds;
    index += 1
  ) {
    points.push(3)
  }

  for (
    let index = 0;
    index < row.fourths;
    index += 1
  ) {
    points.push(2)
  }

  for (
    let index = 0;
    index < row.fifths;
    index += 1
  ) {
    points.push(1)
  }

  if (
    points.length === 0
  ) {
    return (
      `${row.totalPoints} points`
    )
  }

  return (
    `${points.join('+')}=` +
    `${row.totalPoints} ` +
    `${row.totalPoints === 1 ? 'point' : 'points'}`
  )
}


function renderSummaryIndividualSection(
  meet: LocalMeet,
  division: Division,
): string {

  const sections =
    getSummaryWeightClassSections(
      meet,
      division
    )

  return `
    <section class="summary-section">
      <h2>Individual Totals</h2>

      <div class="summary-two-column-grid">
        ${
          sections
            .map(
              section => `
                <article class="summary-card">
                  <h3>
                    ${escapeHtml(section.weightClass)} Class
                  </h3>

                  <div class="summary-list">
                    ${
                      section.rows
                        .map(
                          row => `
                            <div class="summary-result-row">
                              <span class="summary-place">
                                ${row.place}.
                              </span>

                              <span class="summary-name">
                                ${escapeHtml(
                                  getIndividualStandingDisplayName(
                                    meet,
                                    row
                                  )
                                )}
                              </span>

                              <span class="summary-number">
                                ${row.lifterNumber}
                              </span>

                              <span class="summary-team">
                                ${escapeHtml(
                                  getStandingsTeamName(
                                    meet,
                                    row.teamId
                                  )
                                )}
                              </span>

                              <span class="summary-value">
                                ${row.total}
                              </span>
                            </div>
                          `
                        )
                        .join('')
                    }
                  </div>
                </article>
              `
            )
            .join('')
        }
      </div>
    </section>
  `
}


function renderSummaryBestLiftersSection(
  meet: LocalMeet,
  division: Division,
): string {

  const rows =
    getBestLifterReportRows(
      meet,
      division
    )

  const groups =
    getBestLifterWeightGroups(
      division
    )

  const coefficientLabel =
    getBestLifterCoefficientLabel(
      division
    )

  return `
    <section class="summary-section">
      <h2>
        Best Lifters (${escapeHtml(coefficientLabel)})
      </h2>

      <div class="summary-two-column-grid">
        ${
          groups
            .map(
              (
                group,
                groupIndex
              ) => `
                <article class="summary-card">
                  <h3>
                    ${escapeHtml(group.label)} Classes
                  </h3>

                  <div class="summary-list">
                    ${
                      rows
                        .filter(
                          row =>
                            row.groupIndex ===
                            groupIndex
                        )
                        .sort(
                          (
                            a,
                            b
                          ) =>
                            a.place -
                            b.place
                        )
                        .map(
                          row => `
                            <div class="summary-result-row summary-four-column">
                              <span class="summary-place">
                                ${row.place}.
                              </span>

                              <span class="summary-name">
                                ${escapeHtml(row.lifterName)}
                              </span>

                              <span class="summary-number">
                                ${row.lifterNumber}
                              </span>

                              <span class="summary-team">
                                ${escapeHtml(row.teamName)}
                              </span>

                              <span class="summary-value">
                                ${row.coefficientTotal.toFixed(2)}
                              </span>
                            </div>
                          `
                        )
                        .join('')
                    }
                  </div>
                </article>
              `
            )
            .join('')
        }
      </div>
    </section>
  `
}


function renderSummaryBestLiftsSection(
  meet: LocalMeet,
  division: Division,
): string {

  const rows =
    getBestLiftReportRows(
      meet,
      division
    )

  const groups =
    getBestLifterWeightGroups(
      division
    )

  const coefficientLabel =
    getBestLifterCoefficientLabel(
      division
    )

  const liftOrder:
    Array<{
      index: number
      label: string
    }> =
    [
      {
        index: 0,
        label: 'Squat',
      },
      {
        index: 1,
        label: 'Bench Press',
      },
      {
        index: 2,
        label: 'Deadlift',
      },
    ]

  return `
    <section class="summary-section">
      <h2>
        Best Lifts (${escapeHtml(coefficientLabel)})
      </h2>

      <div class="summary-two-column-grid">
        ${
          liftOrder
            .flatMap(
              lift =>
                groups.map(
                  (
                    group,
                    groupIndex
                  ) => `
                    <article class="summary-card">
                      <h3>
                        ${escapeHtml(lift.label)} -
                        ${escapeHtml(group.label)} Classes
                      </h3>

                      <div class="summary-list">
                        ${
                          rows
                            .filter(
                              row =>
                                row.liftIndex ===
                                  lift.index &&
                                row.groupIndex ===
                                  groupIndex
                            )
                            .sort(
                              (
                                a,
                                b
                              ) =>
                                a.place -
                                b.place
                            )
                            .map(
                              row => `
                                <div class="summary-result-row summary-four-column">
                                  <span class="summary-place">
                                    ${row.place}.
                                  </span>

                                  <span class="summary-name">
                                    ${escapeHtml(row.lifterName)}
                                  </span>

                                  <span class="summary-number">
                                    ${row.lifterNumber}
                                  </span>

                                  <span class="summary-team">
                                    ${escapeHtml(row.teamName)}
                                  </span>

                                  <span class="summary-value">
                                    ${row.coefficientLift.toFixed(2)}
                                  </span>
                                </div>
                              `
                            )
                            .join('')
                        }
                      </div>
                    </article>
                  `
                )
            )
            .join('')
        }
      </div>
    </section>
  `
}


function renderSummaryTeamFinishesSection(
  meet: LocalMeet,
): string {

  const {
    teams,
  } =
    getStandingsData(
      meet
    )

  return `
    <section class="summary-section">
      <h2>Team Finishes</h2>

      <div class="summary-team-finishes">
        ${
          teams
            .sort(
              (
                a,
                b
              ) =>
                a.place -
                b.place
            )
            .map(
              row => `
                <div class="summary-team-row">
                  <span>
                    ${row.place}.
                  </span>

                  <strong>
                    ${escapeHtml(
                      getStandingsTeamName(
                        meet,
                        row.teamId
                      )
                    )}
                  </strong>

                  <span>
                    ${escapeHtml(
                      getSummaryTeamPointExpression(
                        row
                      )
                    )}
                  </span>
                </div>
              `
            )
            .join('')
        }
      </div>
    </section>
  `
}


function renderSummary():
  string {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return `
      <main class="summary-page">
        <div class="empty-state">
          Select a meet to view the Summary.
        </div>
      </main>
    `
  }

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return `
      <main class="summary-page">
        ${renderBestLifterDivisionTabs(meet)}

        <div class="empty-state">
          Select a division to view the Summary.
        </div>
      </main>
    `
  }

  return `
    <main class="summary-page">

      <div class="standings-screen-toolbar no-print">
        <div>
          <button
            id="printSummary"
            type="button"
            class="compact-button"
          >
            Print
          </button>

          <div class="standings-copy-menu">
            <button
              id="copySummaryMenu"
              type="button"
              class="compact-button"
            >
              Copy ▾
            </button>

            <div
              id="summaryCopyOptions"
              class="standings-copy-options"
              hidden
            >
              <button
                type="button"
                data-copy-summary="formatted"
              >
                Copy Formatted
              </button>

              <button
                type="button"
                data-copy-summary="spreadsheet"
              >
                Copy for Spreadsheet
              </button>

              <button
                type="button"
                data-copy-summary="word"
              >
                Copy for Word
              </button>
            </div>
          </div>
        </div>

        <div class="standings-toolbar-note">
          Condensed official meet summary for the selected division.
        </div>
      </div>

      ${renderBestLifterDivisionTabs(meet)}

      <section class="standings-print-heading">
        <h1 class="print-only">
          ${escapeHtml(meet.state.meet.name)}
        </h1>

        <h2>
          ${escapeHtml(division.name)} Summary
        </h2>
      </section>

      ${renderSummaryIndividualSection(meet, division)}

      ${renderSummaryBestLiftersSection(meet, division)}

      ${renderSummaryBestLiftsSection(meet, division)}

      ${renderSummaryTeamFinishesSection(meet)}

    </main>
  `
}


function getSummarySpreadsheetText(
  meet: LocalMeet,
): string {

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return ''
  }

  const coefficientLabel =
    getBestLifterCoefficientLabel(
      division
    )

  const lines:
    string[] =
    [
      meet.state.meet.name,
      `${division.name} Summary`,
      '',
      'Individual Totals',
    ]

  getSummaryWeightClassSections(
    meet,
    division
  )
    .forEach(
      section => {
        lines.push(
          `${section.weightClass} Class`
        )

        section.rows.forEach(
          row => {
            lines.push(
              [
                row.place,
                getIndividualStandingDisplayName(
                  meet,
                  row
                ),
                row.lifterNumber,
                getStandingsTeamName(
                  meet,
                  row.teamId
                ),
                row.total,
              ].join('\t')
            )
          }
        )

        lines.push('')
      }
    )

  lines.push(
    `Best Lifters (${coefficientLabel})`
  )

  getBestLifterReportRows(
    meet,
    division
  )
    .forEach(
      row => {
        lines.push(
          [
            row.weightGroup,
            row.place,
            row.lifterName,
            row.lifterNumber,
            row.teamName,
            row.coefficientTotal.toFixed(2),
          ].join('\t')
        )
      }
    )

  lines.push(
    '',
    `Best Lifts (${coefficientLabel})`
  )

  getBestLiftReportRows(
    meet,
    division
  )
    .forEach(
      row => {
        lines.push(
          [
            row.liftLabel,
            row.weightGroup,
            row.place,
            row.lifterName,
            row.lifterNumber,
            row.teamName,
            row.coefficientLift.toFixed(2),
          ].join('\t')
        )
      }
    )

  lines.push(
    '',
    'Team Finishes'
  )

  getStandingsData(
    meet
  ).teams
    .sort(
      (
        a,
        b
      ) =>
        a.place -
        b.place
    )
    .forEach(
      row => {
        lines.push(
          [
            row.place,
            getStandingsTeamName(
              meet,
              row.teamId
            ),
            getSummaryTeamPointExpression(
              row
            ),
          ].join('\t')
        )
      }
    )

  return lines.join(
    '\n'
  )
}


function getSummaryFormattedHtml(
  meet: LocalMeet,
): string {

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return ''
  }

  const coefficientLabel =
    getBestLifterCoefficientLabel(
      division
    )

  const outerTableStyle =
    'border-collapse:collapse;width:760px;font-family:Arial,sans-serif;color:#111827;'

  const sectionTitleStyle =
    'font-size:16px;font-weight:700;text-decoration:underline;padding:10px 0 6px;'

  const pairCellStyle =
    'width:50%;vertical-align:top;padding:0 6px 10px 0;'

  const boxTableStyle =
    'border-collapse:collapse;width:100%;table-layout:fixed;border:1px solid #9fb0c2;'

  const boxHeadingStyle =
    'background:#eaf1f8;border-bottom:1px solid #b8c7d7;padding:5px 7px;font-size:13px;font-weight:700;text-align:left;'

  const rowCellStyle =
    'padding:2px 4px;border:0;font-size:11px;line-height:1.25;vertical-align:top;'

  const makeResultBox =
    (
      heading: string,
      rowsHtml: string,
    ) => `
      <table
        role="presentation"
        cellpadding="0"
        cellspacing="0"
        style="${boxTableStyle}"
      >
        <tr>
          <td
            colspan="5"
            style="${boxHeadingStyle}"
          >
            ${heading}
          </td>
        </tr>

        ${rowsHtml}
      </table>
    `

  const makeTwoColumnRows =
    (
      boxes:
        readonly string[],
    ) => {
      const rows:
        string[] =
        []

      for (
        let index = 0;
        index <
        boxes.length;
        index += 2
      ) {
        rows.push(`
          <tr>
            <td style="${pairCellStyle}">
              ${boxes[index]}
            </td>

            <td style="width:50%;vertical-align:top;padding:0 0 10px 6px;">
              ${
                boxes[
                  index + 1
                ] ??
                ''
              }
            </td>
          </tr>
        `)
      }

      return rows.join('')
    }

  const individualBoxes =
    getSummaryWeightClassSections(
      meet,
      division
    )
      .map(
        section => {
          const rows =
            section.rows
              .map(
                row => `
                  <tr>
                    <td style="${rowCellStyle}width:22px;text-align:right;">
                      ${row.place}.
                    </td>

                    <td style="${rowCellStyle}width:135px;font-weight:600;">
                      ${escapeHtml(
                        getIndividualStandingDisplayName(
                          meet,
                          row
                        )
                      )}
                    </td>

                    <td style="${rowCellStyle}width:34px;text-align:right;">
                      ${row.lifterNumber}
                    </td>

                    <td style="${rowCellStyle}width:86px;">
                      ${escapeHtml(
                        getStandingsTeamName(
                          meet,
                          row.teamId
                        )
                      )}
                    </td>

                    <td style="${rowCellStyle}width:48px;text-align:right;font-weight:700;">
                      ${row.total}
                    </td>
                  </tr>
                `
              )
              .join('')

          return makeResultBox(
            `${escapeHtml(section.weightClass)} Class`,
            rows
          )
        }
      )

  const bestLifterRows =
    getBestLifterReportRows(
      meet,
      division
    )

  const bestLifterBoxes =
    getBestLifterWeightGroups(
      division
    )
      .map(
        (
          group,
          groupIndex
        ) => {
          const rows =
            bestLifterRows
              .filter(
                row =>
                  row.groupIndex ===
                  groupIndex
              )
              .sort(
                (
                  a,
                  b
                ) =>
                  a.place -
                  b.place
              )
              .map(
                row => `
                  <tr>
                    <td style="${rowCellStyle}width:22px;text-align:right;">
                      ${row.place}.
                    </td>

                    <td style="${rowCellStyle}width:135px;font-weight:600;">
                      ${escapeHtml(row.lifterName)}
                    </td>

                    <td style="${rowCellStyle}width:34px;text-align:right;">
                      ${row.lifterNumber}
                    </td>

                    <td style="${rowCellStyle}width:86px;">
                      ${escapeHtml(row.teamName)}
                    </td>

                    <td style="${rowCellStyle}width:56px;text-align:right;font-weight:700;">
                      ${row.coefficientTotal.toFixed(2)}
                    </td>
                  </tr>
                `
              )
              .join('')

          return makeResultBox(
            `${escapeHtml(group.label)} Classes`,
            rows
          )
        }
      )

  const bestLiftRows =
    getBestLiftReportRows(
      meet,
      division
    )

  const liftGroups =
    [
      {
        index: 0,
        label: 'Squat',
      },
      {
        index: 1,
        label: 'Bench Press',
      },
      {
        index: 2,
        label: 'Deadlift',
      },
    ]

  const bestLiftBoxes =
    liftGroups
      .flatMap(
        lift =>
          getBestLifterWeightGroups(
            division
          )
            .map(
              (
                group,
                groupIndex
              ) => {
                const rows =
                  bestLiftRows
                    .filter(
                      row =>
                        row.liftIndex ===
                          lift.index &&
                        row.groupIndex ===
                          groupIndex
                    )
                    .sort(
                      (
                        a,
                        b
                      ) =>
                        a.place -
                        b.place
                    )
                    .map(
                      row => `
                        <tr>
                          <td style="${rowCellStyle}width:22px;text-align:right;">
                            ${row.place}.
                          </td>

                          <td style="${rowCellStyle}width:135px;font-weight:600;">
                            ${escapeHtml(row.lifterName)}
                          </td>

                          <td style="${rowCellStyle}width:34px;text-align:right;">
                            ${row.lifterNumber}
                          </td>

                          <td style="${rowCellStyle}width:86px;">
                            ${escapeHtml(row.teamName)}
                          </td>

                          <td style="${rowCellStyle}width:56px;text-align:right;font-weight:700;">
                            ${row.coefficientLift.toFixed(2)}
                          </td>
                        </tr>
                      `
                    )
                    .join('')

                return makeResultBox(
                  `${escapeHtml(lift.label)} - ${escapeHtml(group.label)} Classes`,
                  rows
                )
              }
            )
      )

  const teamRows =
    getStandingsData(
      meet
    ).teams
      .sort(
        (
          a,
          b
        ) =>
          a.place -
          b.place
      )
      .map(
        row => `
          <tr>
            <td style="${rowCellStyle}width:22px;text-align:right;">
              ${row.place}.
            </td>

            <td style="${rowCellStyle}width:135px;font-weight:700;">
              ${escapeHtml(
                getStandingsTeamName(
                  meet,
                  row.teamId
                )
              )}
            </td>

            <td
              colspan="3"
              style="${rowCellStyle}"
            >
              ${escapeHtml(
                getSummaryTeamPointExpression(
                  row
                )
              )}
            </td>
          </tr>
        `
      )
      .join('')

  const teamBox =
    makeResultBox(
      'Team Finishes',
      teamRows
    )

  return `
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      style="${outerTableStyle}"
    >
      <tr>
        <td style="padding:0 0 2px;font-size:19px;font-weight:700;">
          ${escapeHtml(meet.state.meet.name)}
        </td>
      </tr>

      <tr>
        <td style="padding:0 0 12px;font-size:13px;font-weight:700;">
          ${escapeHtml(division.name)} Summary
        </td>
      </tr>

      <tr>
        <td style="${sectionTitleStyle}">
          Individual Totals
        </td>
      </tr>

      <tr>
        <td>
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            style="border-collapse:collapse;width:100%;"
          >
            ${makeTwoColumnRows(individualBoxes)}
          </table>
        </td>
      </tr>

      <tr>
        <td style="${sectionTitleStyle}">
          Best Lifters (${escapeHtml(coefficientLabel)})
        </td>
      </tr>

      <tr>
        <td>
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            style="border-collapse:collapse;width:100%;"
          >
            ${makeTwoColumnRows(bestLifterBoxes)}
          </table>
        </td>
      </tr>

      <tr>
        <td style="${sectionTitleStyle}">
          Best Lifts (${escapeHtml(coefficientLabel)})
        </td>
      </tr>

      <tr>
        <td>
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            style="border-collapse:collapse;width:100%;"
          >
            ${makeTwoColumnRows(bestLiftBoxes)}
          </table>
        </td>
      </tr>

      <tr>
        <td style="${sectionTitleStyle}">
          Team Finishes
        </td>
      </tr>

      <tr>
        <td>
          ${teamBox}
        </td>
      </tr>
    </table>
  `
}


function getSummaryWordHtml(
  meet: LocalMeet,
): string {

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return ''
  }

  const coefficientLabel =
    getBestLifterCoefficientLabel(
      division
    )

  const pageWidth =
    '640px'

  const sectionHeading =
    'font-family:Arial,sans-serif;font-size:15px;font-weight:700;text-decoration:underline;padding:12px 0 6px;'

  const boxTable =
    'border-collapse:collapse;width:640px;table-layout:fixed;border:1px solid #9fb0c2;margin-bottom:10px;'

  const boxHeading =
    'background:#eaf1f8;border-bottom:1px solid #b8c7d7;padding:5px 7px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;text-align:left;'

  const cell =
    'padding:2px 4px;font-family:Arial,sans-serif;font-size:10.5px;line-height:1.2;vertical-align:top;'

  const makeBox =
    (
      heading: string,
      rowsHtml: string,
    ) => `
      <table
        role="presentation"
        cellpadding="0"
        cellspacing="0"
        style="${boxTable}"
      >
        <tr>
          <td
            colspan="5"
            style="${boxHeading}"
          >
            ${heading}
          </td>
        </tr>

        ${rowsHtml}
      </table>
    `

  const individualHtml =
    getSummaryWeightClassSections(
      meet,
      division
    )
      .map(
        section => {
          const rows =
            section.rows
              .map(
                row => `
                  <tr>
                    <td style="${cell}width:28px;text-align:right;">
                      ${row.place}.
                    </td>

                    <td style="${cell}width:235px;font-weight:600;">
                      ${escapeHtml(
                        getIndividualStandingDisplayName(
                          meet,
                          row
                        )
                      )}
                    </td>

                    <td style="${cell}width:45px;text-align:right;">
                      ${row.lifterNumber}
                    </td>

                    <td style="${cell}width:160px;">
                      ${escapeHtml(
                        getStandingsTeamName(
                          meet,
                          row.teamId
                        )
                      )}
                    </td>

                    <td style="${cell}width:70px;text-align:right;font-weight:700;">
                      ${row.total}
                    </td>
                  </tr>
                `
              )
              .join('')

          return makeBox(
            `${escapeHtml(section.weightClass)} Class`,
            rows
          )
        }
      )
      .join('')

  const bestLifterRows =
    getBestLifterReportRows(
      meet,
      division
    )

  const bestLiftersHtml =
    getBestLifterWeightGroups(
      division
    )
      .map(
        (
          group,
          groupIndex
        ) => {
          const rows =
            bestLifterRows
              .filter(
                row =>
                  row.groupIndex ===
                  groupIndex
              )
              .sort(
                (
                  a,
                  b
                ) =>
                  a.place -
                  b.place
              )
              .map(
                row => `
                  <tr>
                    <td style="${cell}width:28px;text-align:right;">
                      ${row.place}.
                    </td>

                    <td style="${cell}width:235px;font-weight:600;">
                      ${escapeHtml(row.lifterName)}
                    </td>

                    <td style="${cell}width:45px;text-align:right;">
                      ${row.lifterNumber}
                    </td>

                    <td style="${cell}width:160px;">
                      ${escapeHtml(row.teamName)}
                    </td>

                    <td style="${cell}width:70px;text-align:right;font-weight:700;">
                      ${row.coefficientTotal.toFixed(2)}
                    </td>
                  </tr>
                `
              )
              .join('')

          return makeBox(
            `${escapeHtml(group.label)} Classes`,
            rows
          )
        }
      )
      .join('')

  const bestLiftRows =
    getBestLiftReportRows(
      meet,
      division
    )

  const liftGroups =
    [
      {
        index: 0,
        label: 'Squat',
      },
      {
        index: 1,
        label: 'Bench Press',
      },
      {
        index: 2,
        label: 'Deadlift',
      },
    ]

  const bestLiftsHtml =
    liftGroups
      .flatMap(
        lift =>
          getBestLifterWeightGroups(
            division
          )
            .map(
              (
                group,
                groupIndex
              ) => {
                const rows =
                  bestLiftRows
                    .filter(
                      row =>
                        row.liftIndex ===
                          lift.index &&
                        row.groupIndex ===
                          groupIndex
                    )
                    .sort(
                      (
                        a,
                        b
                      ) =>
                        a.place -
                        b.place
                    )
                    .map(
                      row => `
                        <tr>
                          <td style="${cell}width:28px;text-align:right;">
                            ${row.place}.
                          </td>

                          <td style="${cell}width:235px;font-weight:600;">
                            ${escapeHtml(row.lifterName)}
                          </td>

                          <td style="${cell}width:45px;text-align:right;">
                            ${row.lifterNumber}
                          </td>

                          <td style="${cell}width:160px;">
                            ${escapeHtml(row.teamName)}
                          </td>

                          <td style="${cell}width:70px;text-align:right;font-weight:700;">
                            ${row.coefficientLift.toFixed(2)}
                          </td>
                        </tr>
                      `
                    )
                    .join('')

                return makeBox(
                  `${escapeHtml(lift.label)} - ${escapeHtml(group.label)} Classes`,
                  rows
                )
              }
            )
      )
      .join('')

  const teamRows =
    getStandingsData(
      meet
    ).teams
      .sort(
        (
          a,
          b
        ) =>
          a.place -
          b.place
      )
      .map(
        row => `
          <tr>
            <td style="${cell}width:28px;text-align:right;">
              ${row.place}.
            </td>

            <td style="${cell}width:190px;font-weight:700;">
              ${escapeHtml(
                getStandingsTeamName(
                  meet,
                  row.teamId
                )
              )}
            </td>

            <td
              colspan="3"
              style="${cell}width:360px;"
            >
              ${escapeHtml(
                getSummaryTeamPointExpression(
                  row
                )
              )}
            </td>
          </tr>
        `
      )
      .join('')

  const teamHtml =
    makeBox(
      'Team Finishes',
      teamRows
    )

  return `
    <div
      style="width:${pageWidth};max-width:${pageWidth};font-family:Arial,sans-serif;color:#111827;"
    >
      <div style="font-size:18px;font-weight:700;margin-bottom:2px;">
        ${escapeHtml(meet.state.meet.name)}
      </div>

      <div style="font-size:12px;font-weight:700;margin-bottom:14px;">
        ${escapeHtml(division.name)} Summary
      </div>

      <div style="${sectionHeading}">
        Individual Totals
      </div>

      ${individualHtml}

      <div style="${sectionHeading}">
        Best Lifters (${escapeHtml(coefficientLabel)})
      </div>

      ${bestLiftersHtml}

      <div style="${sectionHeading}">
        Best Lifts (${escapeHtml(coefficientLabel)})
      </div>

      ${bestLiftsHtml}

      <div style="${sectionHeading}">
        Team Finishes
      </div>

      ${teamHtml}
    </div>
  `
}


async function copySummaryWord():
  Promise<void> {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }

  const plainText =
    getSummarySpreadsheetText(
      meet
    )

  const html =
    getSummaryWordHtml(
      meet
    )

  if (
    typeof ClipboardItem !==
      'undefined' &&
    navigator.clipboard.write !==
      undefined
  ) {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/plain':
          new Blob(
            [plainText],
            {
              type:
                'text/plain',
            }
          ),
        'text/html':
          new Blob(
            [html],
            {
              type:
                'text/html',
            }
          ),
      }),
    ])
  } else {
    await navigator.clipboard.writeText(
      plainText
    )
  }

  window.alert(
    'Word-formatted Summary copied. Paste into Word.'
  )
}


async function copySummarySpreadsheet():
  Promise<void> {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }

  await navigator.clipboard.writeText(
    getSummarySpreadsheetText(
      meet
    )
  )

  window.alert(
    'Summary copied for spreadsheet paste.'
  )
}


async function copySummaryFormatted():
  Promise<void> {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }

  const plainText =
    getSummarySpreadsheetText(
      meet
    )

  const html =
    getSummaryFormattedHtml(
      meet
    )

  if (
    typeof ClipboardItem !==
      'undefined' &&
    navigator.clipboard.write !==
      undefined
  ) {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/plain':
          new Blob(
            [plainText],
            {
              type:
                'text/plain',
            }
          ),
        'text/html':
          new Blob(
            [html],
            {
              type:
                'text/html',
            }
          ),
      }),
    ])
  } else {
    await navigator.clipboard.writeText(
      plainText
    )
  }

  window.alert(
    'Formatted Summary copied. Paste into email or Word.'
  )
}


function wireSummary():
  void {

  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-best-lifter-division]'
    )
    .forEach(
      button => {
        button.addEventListener(
          'click',
          () => {
            const divisionId =
              Number(
                button.dataset
                  .bestLifterDivision
              )

            if (
              !Number.isFinite(
                divisionId
              )
            ) {
              return
            }

            selectedDivisionId =
              divisionId

            renderApp()
          }
        )
      }
    )

  const copyMenu =
    document
      .querySelector<HTMLButtonElement>(
        '#copySummaryMenu'
      )

  const copyOptions =
    document
      .querySelector<HTMLDivElement>(
        '#summaryCopyOptions'
      )

  copyMenu
    ?.addEventListener(
      'click',
      event => {
        event.stopPropagation()

        if (
          copyOptions ===
          null
        ) {
          return
        }

        const opening =
          copyOptions.hidden

        closeAllReportMenus()

        copyOptions.hidden =
          !opening
      }
    )

  copyOptions
    ?.addEventListener(
      'click',
      event => {
        event.stopPropagation()
      }
    )

  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-copy-summary]'
    )
    .forEach(
      button => {
        button.addEventListener(
          'click',
          () => {
            closeAllReportMenus()

            if (
              button.dataset
                .copySummary ===
              'formatted'
            ) {
              void copySummaryFormatted()

              return
            }

            if (
              button.dataset
                .copySummary ===
              'word'
            ) {
              void copySummaryWord()

              return
            }

            void copySummarySpreadsheet()
          }
        )
      }
    )

  document
    .querySelector<HTMLButtonElement>(
      '#printSummary'
    )
    ?.addEventListener(
      'click',
      () => {
        closeAllReportMenus()
        window.print()
      }
    )

  installReportMenuClickAway()
}


interface DetailReportRow {
  lifterId: number
  weightClass: string
  placeText: string
  placeSort: number
  lifterName: string
  lifterNumber: number
  teamName: string
  bodyWeight: number | null
  squat: number
  bench: number
  deadlift: number
  total: number
  coefficient: number | null
  coefficientSquat: number
  coefficientBench: number
  coefficientDeadlift: number
  coefficientTotal: number
}


function getDetailLifterName(
  meet: LocalMeet,
  lifter: Lifter,
): string {

  return getNonRegistrationLifterDisplayName(
    meet,
    lifter
  )
}


function getDetailPlaceSort(
  lifter: Lifter,
  place: number | null,
): number {

  if (
    lifter.status ===
    'active'
  ) {
    return (
      place ??
      900
    )
  }

  switch (
    lifter.status
  ) {
    case 'bombed':
      return 1001

    case 'scratched':
      return 1002

    case 'disqualified':
      return 1003

    default:
      return 1004
  }
}


function getDetailReportRows(
  meet: LocalMeet,
  division: Division,
): DetailReportRow[] {

  return meet.state.lifters
    .filter(
      lifter =>
        lifter.divisionId ===
        division.id
    )
    .map(
      lifter => {
        const place =
          getCompetitionPlace(
            meet,
            lifter
          )

        const squat =
          getCompetitionBestLiftValue(
            meet,
            lifter,
            'squat'
          ) ??
          0

        const bench =
          getCompetitionBestLiftValue(
            meet,
            lifter,
            'bench'
          ) ??
          0

        const deadlift =
          getCompetitionBestLiftValue(
            meet,
            lifter,
            'deadlift'
          ) ??
          0

        const runningTotal =
          getCompetitionRunningTotalForLifter(
            meet,
            lifter
          ) ??
          0

        const total =
          lifter.status ===
          'active'
            ? runningTotal
            : 0

        const coefficient =
          getLifterBodyWeightCoefficient(
            meet,
            lifter
          )

        const scoringEligible =
          lifter.status ===
          'active' &&
          coefficient !==
          null

        return {
          lifterId:
            lifter.id,
          weightClass:
            lifter.weightClass ??
            '—',
          placeText:
            formatCompetitionPlace(
              lifter,
              place
            ),
          placeSort:
            getDetailPlaceSort(
              lifter,
              place
            ),
          lifterName:
            getDetailLifterName(
              meet,
              lifter
            ),
          lifterNumber:
            lifter.lifterNumber,
          teamName:
            getLifterTeamName(
              meet,
              lifter
            ),
          bodyWeight:
            lifter.bodyWeight,
          squat,
          bench,
          deadlift,
          total,
          coefficient,
          coefficientSquat:
            scoringEligible
              ? squat *
                (coefficient as number)
              : 0,
          coefficientBench:
            scoringEligible
              ? bench *
                (coefficient as number)
              : 0,
          coefficientDeadlift:
            scoringEligible
              ? deadlift *
                (coefficient as number)
              : 0,
          coefficientTotal:
            scoringEligible
              ? total *
                (coefficient as number)
              : 0,
        }
      }
    )
}


function compareDetailOptionalNumber(
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


function getSortedDetailRows(
  rows:
    readonly DetailReportRow[],
): DetailReportRow[] {

  return [...rows]
    .sort(
      (
        a,
        b
      ) => {
        let result =
          0

        switch (
          detailSortColumn
        ) {
          case 'weightClass':
            result =
              getWeightClassSortValue(
                a.weightClass
              ) -
              getWeightClassSortValue(
                b.weightClass
              )

            if (
              result === 0
            ) {
              result =
                a.placeSort -
                b.placeSort
            }

            break

          case 'place':
            result =
              a.placeSort -
              b.placeSort
            break

          case 'lifter':
            result =
              a.lifterName.localeCompare(
                b.lifterName,
                undefined,
                {
                  sensitivity:
                    'base',
                  numeric:
                    true,
                }
              )
            break

          case 'lifterNumber':
            result =
              a.lifterNumber -
              b.lifterNumber
            break

          case 'team':
            result =
              a.teamName.localeCompare(
                b.teamName,
                undefined,
                {
                  sensitivity:
                    'base',
                  numeric:
                    true,
                }
              )
            break

          case 'bodyWeight':
            result =
              compareDetailOptionalNumber(
                a.bodyWeight,
                b.bodyWeight
              )
            break

          case 'squat':
            result =
              a.squat -
              b.squat
            break

          case 'bench':
            result =
              a.bench -
              b.bench
            break

          case 'deadlift':
            result =
              a.deadlift -
              b.deadlift
            break

          case 'total':
            result =
              a.total -
              b.total
            break

          case 'coefficient':
            result =
              compareDetailOptionalNumber(
                a.coefficient,
                b.coefficient
              )
            break

          case 'coefficientSquat':
            result =
              a.coefficientSquat -
              b.coefficientSquat
            break

          case 'coefficientBench':
            result =
              a.coefficientBench -
              b.coefficientBench
            break

          case 'coefficientDeadlift':
            result =
              a.coefficientDeadlift -
              b.coefficientDeadlift
            break

          case 'coefficientTotal':
            result =
              a.coefficientTotal -
              b.coefficientTotal
            break
        }

        if (
          !detailSortAscending
        ) {
          result =
            -result
        }

        if (
          result !== 0
        ) {
          return result
        }

        return (
          a.lifterNumber -
          b.lifterNumber
        )
      }
    )
}


function renderDetailSortHeader(
  label: string,
  column:
    DetailSortColumn,
): string {

  const active =
    detailSortColumn ===
    column

  return `
    <th>
      <button
        type="button"
        class="standings-sort-button ${
          active
            ? 'active'
            : ''
        }"
        data-detail-sort="${column}"
      >
        <span>${escapeHtml(label)}</span>
        <span>${
          active
            ? (
                detailSortAscending
                  ? '▲'
                  : '▼'
              )
            : ''
        }</span>
      </button>
    </th>
  `
}


function renderDetail():
  string {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return `
      <main class="detail-page">
        <div class="empty-state">
          Select a meet to view Detail.
        </div>
      </main>
    `
  }

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return `
      <main class="detail-page">
        ${renderBestLifterDivisionTabs(meet)}
        <div class="empty-state">
          Select a division to view Detail.
        </div>
      </main>
    `
  }

  const coefficientLabel =
    getBestLifterCoefficientLabel(
      division
    )

  const rows =
    getSortedDetailRows(
      getDetailReportRows(
        meet,
        division
      )
    )

  return `
    <main class="detail-page">

      <div class="standings-screen-toolbar no-print">
        <div>
          <button
            id="printDetail"
            type="button"
            class="compact-button"
          >
            Print
          </button>

          <div class="standings-copy-menu">
            <button
              id="copyDetailMenu"
              type="button"
              class="compact-button"
            >
              Copy ▾
            </button>

            <div
              id="detailCopyOptions"
              class="standings-copy-options"
              hidden
            >
              <button
                type="button"
                data-copy-detail="formatted"
              >
                Copy Formatted
              </button>

              <button
                type="button"
                data-copy-detail="spreadsheet"
              >
                Copy for Spreadsheet
              </button>

              <button
                type="button"
                data-copy-detail="word"
              >
                Copy for Word
              </button>
            </div>
          </div>

          <button
            id="resetDetailSort"
            type="button"
            class="compact-button"
          >
            Reset Sort
          </button>
        </div>

        <div class="standings-toolbar-note">
          All lifters are included, regardless of competition status.
        </div>
      </div>

      ${renderBestLifterDivisionTabs(meet)}

      <section class="standings-print-heading">
        <h1 class="print-only">
          ${escapeHtml(meet.state.meet.name)}
        </h1>
        <h2>
          ${escapeHtml(division.name)} Detail
        </h2>
      </section>

      <section class="standings-panel detail-panel">
        <div class="standings-table-scroll detail-table-scroll">
          <table class="standings-table detail-table">
            <thead>
              <tr>
                ${renderDetailSortHeader('Wt. Class', 'weightClass')}
                ${renderDetailSortHeader('Place', 'place')}
                ${renderDetailSortHeader('Lifter', 'lifter')}
                ${renderDetailSortHeader('Lifter #', 'lifterNumber')}
                ${renderDetailSortHeader('Team', 'team')}
                ${renderDetailSortHeader('BWT', 'bodyWeight')}
                ${renderDetailSortHeader('Squat', 'squat')}
                ${renderDetailSortHeader('Bench Press', 'bench')}
                ${renderDetailSortHeader('Deadlift', 'deadlift')}
                ${renderDetailSortHeader('Total', 'total')}
                ${renderDetailSortHeader(coefficientLabel, 'coefficient')}
                ${renderDetailSortHeader(`${coefficientLabel} Squat`, 'coefficientSquat')}
                ${renderDetailSortHeader(`${coefficientLabel} Bench`, 'coefficientBench')}
                ${renderDetailSortHeader(`${coefficientLabel} Deadlift`, 'coefficientDeadlift')}
                ${renderDetailSortHeader(`${coefficientLabel} Total`, 'coefficientTotal')}
              </tr>
            </thead>

            <tbody>
              ${
                rows.length === 0
                  ? `
                    <tr>
                      <td
                        colspan="15"
                        class="standings-empty-row"
                      >
                        No lifters are registered in this division.
                      </td>
                    </tr>
                  `
                  : rows
                      .map(
                        row => `
                          <tr>
                            <td class="numeric">${escapeHtml(row.weightClass)}</td>
                            <td class="numeric">${escapeHtml(row.placeText)}</td>
                            <td class="lifter-name">${escapeHtml(row.lifterName)}</td>
                            <td class="numeric">${row.lifterNumber}</td>
                            <td>${escapeHtml(row.teamName)}</td>
                            <td class="numeric">${row.bodyWeight === null ? '—' : row.bodyWeight.toFixed(1)}</td>
                            <td class="numeric">${row.squat}</td>
                            <td class="numeric">${row.bench}</td>
                            <td class="numeric">${row.deadlift}</td>
                            <td class="numeric standings-total">${row.total}</td>
                            <td class="numeric">${row.coefficient === null ? '—' : row.coefficient.toFixed(4)}</td>
                            <td class="numeric">${row.coefficientSquat.toFixed(2)}</td>
                            <td class="numeric">${row.coefficientBench.toFixed(2)}</td>
                            <td class="numeric">${row.coefficientDeadlift.toFixed(2)}</td>
                            <td class="numeric standings-total">${row.coefficientTotal.toFixed(2)}</td>
                          </tr>
                        `
                      )
                      .join('')
              }
            </tbody>
          </table>
        </div>
      </section>
    </main>
  `
}


function getDetailSpreadsheetText(
  meet: LocalMeet,
): string {

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return ''
  }

  const coefficientLabel =
    getBestLifterCoefficientLabel(
      division
    )

  const rows =
    getSortedDetailRows(
      getDetailReportRows(
        meet,
        division
      )
    )

  const lines:
    string[] =
    [
      meet.state.meet.name,
      `${division.name} Detail`,
      '',
      [
        'Wt. Class',
        'Place',
        'Lifter',
        'Lifter #',
        'Team',
        'BWT',
        'Squat',
        'Bench Press',
        'Deadlift',
        'Total',
        coefficientLabel,
        `${coefficientLabel} Squat`,
        `${coefficientLabel} Bench`,
        `${coefficientLabel} Deadlift`,
        `${coefficientLabel} Total`,
      ].join('\t'),
    ]

  rows.forEach(
    row => {
      lines.push(
        [
          row.weightClass,
          row.placeText,
          row.lifterName,
          row.lifterNumber,
          row.teamName,
          row.bodyWeight ===
            null
              ? ''
              : row.bodyWeight.toFixed(1),
          row.squat,
          row.bench,
          row.deadlift,
          row.total,
          row.coefficient ===
            null
              ? ''
              : row.coefficient.toFixed(4),
          row.coefficientSquat.toFixed(2),
          row.coefficientBench.toFixed(2),
          row.coefficientDeadlift.toFixed(2),
          row.coefficientTotal.toFixed(2),
        ].join('\t')
      )
    }
  )

  return lines.join(
    '\n'
  )
}


function getDetailFormattedHtml(
  meet: LocalMeet,
  wordSafe = false,
): string {

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return ''
  }

  const coefficientLabel =
    getBestLifterCoefficientLabel(
      division
    )

  const rows =
    getSortedDetailRows(
      getDetailReportRows(
        meet,
        division
      )
    )

  const width =
    wordSafe
      ? '640px'
      : '100%'

  const fontSize =
    wordSafe
      ? '7px'
      : '10px'

  const th =
    `border:1px solid #9ca3af;background:#eaf1f8;padding:3px;font-family:Arial,sans-serif;font-size:${fontSize};font-weight:700;`

  const td =
    `border:1px solid #cbd5e1;padding:2px 3px;font-family:Arial,sans-serif;font-size:${fontSize};`

  const body =
    rows
      .map(
        row => `
          <tr>
            <td style="${td}">${escapeHtml(row.weightClass)}</td>
            <td style="${td}text-align:center;">${escapeHtml(row.placeText)}</td>
            <td style="${td}font-weight:600;">${escapeHtml(row.lifterName)}</td>
            <td style="${td}text-align:right;">${row.lifterNumber}</td>
            <td style="${td}">${escapeHtml(row.teamName)}</td>
            <td style="${td}text-align:right;">${row.bodyWeight === null ? '—' : row.bodyWeight.toFixed(1)}</td>
            <td style="${td}text-align:right;">${row.squat}</td>
            <td style="${td}text-align:right;">${row.bench}</td>
            <td style="${td}text-align:right;">${row.deadlift}</td>
            <td style="${td}text-align:right;font-weight:700;">${row.total}</td>
            <td style="${td}text-align:right;">${row.coefficient === null ? '—' : row.coefficient.toFixed(4)}</td>
            <td style="${td}text-align:right;">${row.coefficientSquat.toFixed(2)}</td>
            <td style="${td}text-align:right;">${row.coefficientBench.toFixed(2)}</td>
            <td style="${td}text-align:right;">${row.coefficientDeadlift.toFixed(2)}</td>
            <td style="${td}text-align:right;font-weight:700;">${row.coefficientTotal.toFixed(2)}</td>
          </tr>
        `
      )
      .join('')

  return `
    <div style="width:${width};font-family:Arial,sans-serif;color:#111827;">
      <div style="font-size:${wordSafe ? '16px' : '18px'};font-weight:700;margin-bottom:2px;">
        ${escapeHtml(meet.state.meet.name)}
      </div>
      <div style="font-size:${wordSafe ? '10px' : '12px'};font-weight:700;margin-bottom:10px;">
        ${escapeHtml(division.name)} Detail
      </div>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:${width};table-layout:fixed;">
        <tr>
          <th style="${th}">Wt. Class</th>
          <th style="${th}">Place</th>
          <th style="${th}">Lifter</th>
          <th style="${th}">Lifter #</th>
          <th style="${th}">Team</th>
          <th style="${th}">BWT</th>
          <th style="${th}">Squat</th>
          <th style="${th}">Bench</th>
          <th style="${th}">Deadlift</th>
          <th style="${th}">Total</th>
          <th style="${th}">${escapeHtml(coefficientLabel)}</th>
          <th style="${th}">${escapeHtml(`${coefficientLabel} Squat`)}</th>
          <th style="${th}">${escapeHtml(`${coefficientLabel} Bench`)}</th>
          <th style="${th}">${escapeHtml(`${coefficientLabel} Deadlift`)}</th>
          <th style="${th}">${escapeHtml(`${coefficientLabel} Total`)}</th>
        </tr>
        ${body}
      </table>
    </div>
  `
}


async function copyDetailRich(
  wordSafe: boolean,
): Promise<void> {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }

  const plainText =
    getDetailSpreadsheetText(
      meet
    )

  const html =
    getDetailFormattedHtml(
      meet,
      wordSafe
    )

  if (
    typeof ClipboardItem !==
      'undefined' &&
    navigator.clipboard.write !==
      undefined
  ) {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/plain':
          new Blob([plainText], { type: 'text/plain' }),
        'text/html':
          new Blob([html], { type: 'text/html' }),
      }),
    ])
  } else {
    await navigator.clipboard.writeText(
      plainText
    )
  }

  window.alert(
    wordSafe
      ? 'Word-formatted Detail copied. Paste into Word.'
      : 'Formatted Detail copied. Paste into email.'
  )
}


async function copyDetailSpreadsheet():
  Promise<void> {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }

  await navigator.clipboard.writeText(
    getDetailSpreadsheetText(
      meet
    )
  )

  window.alert(
    'Detail copied for spreadsheet paste.'
  )
}


function wireDetail():
  void {

  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-best-lifter-division]'
    )
    .forEach(
      button => {
        button.addEventListener(
          'click',
          () => {
            const divisionId =
              Number(
                button.dataset
                  .bestLifterDivision
              )

            if (
              !Number.isFinite(
                divisionId
              )
            ) {
              return
            }

            selectedDivisionId =
              divisionId

            renderApp()
          }
        )
      }
    )

  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-detail-sort]'
    )
    .forEach(
      button => {
        button.addEventListener(
          'click',
          () => {
            const column =
              button.dataset
                .detailSort as
                  DetailSortColumn

            if (
              detailSortColumn ===
              column
            ) {
              detailSortAscending =
                !detailSortAscending
            } else {
              detailSortColumn =
                column

              detailSortAscending =
                ![
                  'squat',
                  'bench',
                  'deadlift',
                  'total',
                  'coefficientSquat',
                  'coefficientBench',
                  'coefficientDeadlift',
                  'coefficientTotal',
                ].includes(
                  column
                )
            }

            renderApp()
          }
        )
      }
    )

  document
    .querySelector<HTMLButtonElement>(
      '#resetDetailSort'
    )
    ?.addEventListener(
      'click',
      () => {
        detailSortColumn =
          'weightClass'

        detailSortAscending =
          true

        renderApp()
      }
    )

  const copyOptions =
    document
      .querySelector<HTMLDivElement>(
        '#detailCopyOptions'
      )

  document
    .querySelector<HTMLButtonElement>(
      '#copyDetailMenu'
    )
    ?.addEventListener(
      'click',
      event => {
        event.stopPropagation()

        if (
          copyOptions ===
          null
        ) {
          return
        }

        const opening =
          copyOptions.hidden

        closeAllReportMenus()

        copyOptions.hidden =
          !opening
      }
    )

  copyOptions
    ?.addEventListener(
      'click',
      event => {
        event.stopPropagation()
      }
    )

  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-copy-detail]'
    )
    .forEach(
      button => {
        button.addEventListener(
          'click',
          () => {
            closeAllReportMenus()

            const format =
              button.dataset
                .copyDetail

            if (
              format ===
              'formatted'
            ) {
              void copyDetailRich(
                false
              )

              return
            }

            if (
              format ===
              'word'
            ) {
              void copyDetailRich(
                true
              )

              return
            }

            void copyDetailSpreadsheet()
          }
        )
      }
    )

  document
    .querySelector<HTMLButtonElement>(
      '#printDetail'
    )
    ?.addEventListener(
      'click',
      () => {
        closeAllReportMenus()
        window.print()
      }
    )

  installReportMenuClickAway()
}


function getRunnerSheetWeightClasses(
  division: Division,
): string[] {

  return getDivisionRules(
    division
  ).weightClasses
    .map(
      item =>
        item.name
    )
}


function ensureRunnerSheetSelections(
  division: Division,
): void {

  if (
    runnerSheetSelectionDivisionId ===
    division.id
  ) {
    return
  }

  runnerSheetSelectionDivisionId =
    division.id

  runnerSheetSelectedWeightClasses =
    new Set(
      getRunnerSheetWeightClasses(
        division
      )
    )
}


function getRunnerSheetLifters(
  meet: LocalMeet,
  division: Division,
  weightClass: string,
): Lifter[] {

  return meet.state.lifters
    .filter(
      lifter =>
        lifter.divisionId ===
          division.id &&
        lifter.weightClass ===
          weightClass
    )
    .sort(
      (
        a,
        b
      ) => {
        const numberDifference =
          a.lifterNumber -
          b.lifterNumber

        if (
          numberDifference !== 0
        ) {
          return numberDifference
        }

        const last =
          a.lastName.localeCompare(
            b.lastName,
            undefined,
            {
              sensitivity:
                'base',
              numeric:
                true,
            }
          )

        if (
          last !== 0
        ) {
          return last
        }

        return a.firstName.localeCompare(
          b.firstName,
          undefined,
          {
            sensitivity:
              'base',
            numeric:
              true,
          }
        )
      }
    )
}


function hasThreeFailedAttemptsForLift(
  lifter: Lifter,
  lift: CompetitionLift,
): boolean {

  const attempts =
    getAllAttemptResults(
      lifter
    )[lift]

  return (
    attempts.attempt1.status ===
      'bad' &&
    attempts.attempt2.status ===
      'bad' &&
    attempts.attempt3.status ===
      'bad'
  )
}


function getRunnerSheetBombedLift(
  meet: LocalMeet,
  lifter: Lifter,
): CompetitionLift | null {

  if (
    hasThreeFailedAttemptsForLift(
      lifter,
      'squat'
    )
  ) {
    return 'squat'
  }

  if (
    hasThreeFailedAttemptsForLift(
      lifter,
      'bench'
    )
  ) {
    return 'bench'
  }

  if (
    hasThreeFailedAttemptsForLift(
      lifter,
      'deadlift'
    )
  ) {
    return 'deadlift'
  }

  const squatValue =
    getCompetitionBestLiftValue(
      meet,
      lifter,
      'squat'
    )

  const benchValue =
    getCompetitionBestLiftValue(
      meet,
      lifter,
      'bench'
    )

  const deadliftValue =
    getCompetitionBestLiftValue(
      meet,
      lifter,
      'deadlift'
    )

  if (
    squatValue === null
  ) {
    return 'squat'
  }

  if (
    benchValue === null
  ) {
    return 'bench'
  }

  if (
    deadliftValue === null
  ) {
    return 'deadlift'
  }

  return null
}


function shouldShowRunnerSheetBombedIndicator(
  meet: LocalMeet,
  lifter: Lifter,
  lift: CompetitionLift,
): boolean {

  const bombedLift =
    getRunnerSheetBombedLift(
      meet,
      lifter
    )

  if (
    bombedLift === null
  ) {
    return false
  }

  switch (
    bombedLift
  ) {
    case 'squat':
      return true

    case 'bench':
      return lift !== 'squat'

    case 'deadlift':
      return lift === 'deadlift'
  }
}


function formatRunnerSheetBestLift(
  meet: LocalMeet,
  lifter: Lifter,
  lift: CompetitionLift,
): string {

  if (
    runnerSheetForceBlankBestLiftColumns
  ) {
    return ''
  }

  if (
    lifter.status ===
      'scratched'
  ) {
    return '----SC----'
  }

  if (
    lifter.status ===
      'disqualified'
  ) {
    return '----DQ----'
  }

  if (
    lifter.status ===
      'bombed' &&
    shouldShowRunnerSheetBombedIndicator(
      meet,
      lifter,
      lift
    )
  ) {
    return '----BO----'
  }

  const value =
    getCompetitionBestLiftValue(
      meet,
      lifter,
      lift
    )

  return value ===
    null
      ? ''
      : String(
          value
        )
}


function createRunnerSheetPageData(
  meet: LocalMeet,
  division: Division,
  weightClass: string,
): RunnerSheetPageData {

  const location =
    meet.state.meet.location
      .trim()

  const date =
    formatExpeditorFooterDate(
      meet.state.meet.date
    )

  return {
    meetTitle:
      `${meet.state.meet.name} - ` +
      `${division.name}`,
    meetLocationAndDate:
      location.length > 0
        ? `${location} ${date}`
        : date,
    weightClass,
    rows:
      getRunnerSheetLifters(
        meet,
        division,
        weightClass
      )
        .map(
          lifter => ({
            lifterNumber:
              String(
                lifter.lifterNumber
              ),
            lifterName:
              getNonRegistrationLifterDisplayName(
                meet,
                lifter
              ),
            schoolName:
              getLifterTeamName(
                meet,
                lifter
              ),
            bestSquat:
              formatRunnerSheetBestLift(
                meet,
                lifter,
                'squat'
              ),
            bestBench:
              formatRunnerSheetBestLift(
                meet,
                lifter,
                'bench'
              ),
            bestDeadlift:
              formatRunnerSheetBestLift(
                meet,
                lifter,
                'deadlift'
              ),
          })
        ),
  }
}


function getRunnerSheetPrintPages(
  meet: LocalMeet,
  division: Division,
): RunnerSheetPageData[] {

  return getRunnerSheetWeightClasses(
    division
  )
    .filter(
      weightClass =>
        runnerSheetSelectedWeightClasses.has(
          weightClass
        )
    )
    .map(
      weightClass =>
        createRunnerSheetPageData(
          meet,
          division,
          weightClass
        )
    )
    .filter(
      page =>
        page.rows.length > 0
    )
}


function renderRunnerSheetWeightClassChoices(
  division: Division,
): string {

  return getRunnerSheetWeightClasses(
    division
  )
    .map(
      weightClass => `
        <label class="runner-sheet-check-item">
          <input
            type="checkbox"
            data-runner-sheet-weight-class="${escapeHtml(weightClass)}"
            ${
              runnerSheetSelectedWeightClasses.has(
                weightClass
              )
                ? 'checked'
                : ''
            }
          >
          <span>
            ${escapeHtml(weightClass)}
          </span>
        </label>
      `
    )
    .join('')
}


function renderRunnerSheetPage(
  page: RunnerSheetPageData,
): string {

  return `
    <section class="runner-sheet-page">
      <header class="runner-sheet-header">
        <div class="runner-sheet-meet-title">
          ${escapeHtml(page.meetTitle)}
        </div>

        <div class="runner-sheet-location-date">
          ${escapeHtml(page.meetLocationAndDate)}
        </div>

        <div class="runner-sheet-report-title">
          Runner Sheet - ${escapeHtml(page.weightClass)} Class
        </div>
      </header>

      <table class="runner-sheet-table">
        <colgroup>
          <col class="runner-sheet-number-column">
          <col class="runner-sheet-lifter-column">
          <col class="runner-sheet-school-column">
          <col class="runner-sheet-lift-column">
          <col class="runner-sheet-lift-column">
          <col class="runner-sheet-lift-column">
        </colgroup>

        <thead>
          <tr>
            <th>Lifter #</th>
            <th>Lifter</th>
            <th>School</th>
            <th>Best Squat</th>
            <th>Best Bench Press</th>
            <th>Best Deadlift</th>
          </tr>
        </thead>

        <tbody>
          ${page.rows
            .map(
              row => `
                <tr>
                  <td class="runner-sheet-number-cell">
                    ${escapeHtml(row.lifterNumber)}
                  </td>
                  <td>
                    ${escapeHtml(row.lifterName)}
                  </td>
                  <td>
                    ${escapeHtml(row.schoolName)}
                  </td>
                  <td class="runner-sheet-lift-cell">
                    ${escapeHtml(row.bestSquat)}
                  </td>
                  <td class="runner-sheet-lift-cell">
                    ${escapeHtml(row.bestBench)}
                  </td>
                  <td class="runner-sheet-lift-cell">
                    ${escapeHtml(row.bestDeadlift)}
                  </td>
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>

      <div class="runner-sheet-footer">
        BO=Bombed out, SC=Scratched, DQ=Disqualified
      </div>
    </section>
  `
}


function renderRunnerSheetPrintPages():
  string {

  return `
    <div class="runner-sheet-print-root">
      ${runnerSheetPrintPages
        .map(
          page =>
            renderRunnerSheetPage(
              page
            )
        )
        .join('')}
    </div>
  `
}


function startRunnerSheetPrint(
  pages:
    RunnerSheetPageData[],
): void {

  runnerSheetPrintPages =
    pages

  renderApp()

  document.body.classList.add(
    'runner-sheet-print-active'
  )

  window.addEventListener(
    'afterprint',
    () => {
      document.body.classList.remove(
        'runner-sheet-print-active'
      )

      runnerSheetPrintPages =
        []

      renderApp()
    },
    {
      once: true,
    }
  )

  window.setTimeout(
    () => {
      window.print()
    },
    0
  )
}


function getExpeditorDivisionTeams(
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
      (
        a,
        b
      ) =>
        a.name.localeCompare(
          b.name,
          undefined,
          {
            sensitivity:
              'base',
            numeric:
              true,
          }
        )
    )
}


function getExpeditorDivisionLifters(
  meet: LocalMeet,
  divisionId: number,
): Lifter[] {

  return meet.state.lifters
    .filter(
      lifter =>
        lifter.divisionId ===
        divisionId
    )
    .sort(
      (
        a,
        b
      ) => {
        const last =
          a.lastName.localeCompare(
            b.lastName,
            undefined,
            {
              sensitivity:
                'base',
              numeric:
                true,
            }
          )

        if (
          last !== 0
        ) {
          return last
        }

        const first =
          a.firstName.localeCompare(
            b.firstName,
            undefined,
            {
              sensitivity:
                'base',
              numeric:
                true,
            }
          )

        if (
          first !== 0
        ) {
          return first
        }

        return (
          a.lifterNumber -
          b.lifterNumber
        )
      }
    )
}


function getExpeditorWeightClasses(
  division: Division,
): string[] {

  return getDivisionRules(
    division
  ).weightClasses
    .map(
      item =>
        item.name
    )
}


function getExpeditorDefaultCardTitle(
  division: Division,
): string {

  switch (
    division.ruleSet
  ) {
    case 'THSPA':
      return (
        'Texas High School ' +
        'Powerlifting Association'
      )

    case 'THSWPA':
      return (
        "Texas High School Women's " +
        'Powerlifting Association'
      )

    case 'NMAA_BOYS':
    case 'NMAA_GIRLS':
      return (
        'New Mexico Activities Association'
      )

    default:
      return 'PowerScore'
  }
}


function getExpeditorAssociationLogo(
  division: Division,
): string {

  switch (
    division.ruleSet
  ) {
    case 'THSPA':
      return (
        '/assets/associations/' +
        'thspa-logo.png'
      )

    case 'THSWPA':
      return (
        '/assets/associations/' +
        'thswpa-logo.jpg'
      )

    case 'NMAA_BOYS':
    case 'NMAA_GIRLS':
      return (
        '/assets/associations/' +
        'nmaa-logo.png'
      )

    default:
      return ''
  }
}


function getExpeditorAssociationLogoAlt(
  division: Division,
): string {

  switch (
    division.ruleSet
  ) {
    case 'THSPA':
      return 'THSPA logo'

    case 'THSWPA':
      return 'THSWPA logo'

    case 'NMAA_BOYS':
    case 'NMAA_GIRLS':
      return 'NMAA logo'

    default:
      return ''
  }
}


function ensureExpeditorSelections(
  meet: LocalMeet,
  division: Division,
): void {

  if (
    expeditorSelectionDivisionId ===
    division.id
  ) {
    return
  }

  expeditorSelectionDivisionId =
    division.id

  expeditorSelectedWeightClasses =
    new Set(
      getExpeditorWeightClasses(
        division
      )
    )

  expeditorSelectedTeamIds =
    new Set(
      getExpeditorDivisionTeams(
        meet,
        division.id
      )
        .map(
          team =>
            team.id
        )
    )

  expeditorSelectedLifterIds =
    new Set(
      getExpeditorDivisionLifters(
        meet,
        division.id
      )
        .map(
          lifter =>
            lifter.id
        )
    )

  expeditorCardTitle =
    getExpeditorDefaultCardTitle(
      division
    )
}


function getExpeditorSelectedLifters(
  meet: LocalMeet,
  division: Division,
): Lifter[] {

  const lifters =
    getExpeditorDivisionLifters(
      meet,
      division.id
    )

  switch (
    expeditorSource
  ) {
    case 'team':
      return lifters
        .filter(
          lifter =>
            lifter.teamId !==
              null &&
            expeditorSelectedTeamIds.has(
              lifter.teamId
            )
        )

    case 'lifter':
      return lifters
        .filter(
          lifter =>
            expeditorSelectedLifterIds.has(
              lifter.id
            )
        )

    default:
      return lifters
        .filter(
          lifter =>
            lifter.weightClass !==
              null &&
            expeditorSelectedWeightClasses.has(
              lifter.weightClass
            )
        )
  }
}


function getExpeditorDeclaredWeight(
  lifter: Lifter,
  lift:
    CompetitionLift,
): string {

  if (
    !expeditorOptions
      .includeDeclaredWeights
  ) {
    return ''
  }

  const attempts =
    getAllAttemptResults(
      lifter
    )

  const value =
    attempts[
      lift
    ].attempt1.weight

  if (
    value !== null
  ) {
    return String(
      value
    )
  }

  if (
    lift ===
      'deadlift' &&
    lifter.declaredDeadliftOpener !==
      null
  ) {
    return String(
      lifter.declaredDeadliftOpener
    )
  }

  return ''
}


function formatExpeditorFooterDate(
  value: string,
): string {

  const parts =
    value.split(
      '-'
    )

  if (
    parts.length !== 3
  ) {
    return value
  }

  return (
    `${Number(parts[1])}/` +
    `${Number(parts[2])}/` +
    `${parts[0]}`
  )
}


function createExpeditorCardData(
  meet: LocalMeet,
  division: Division,
  lifter: Lifter,
): ExpeditorCardData {

  return {
    lifterNumber:
      expeditorOptions
        .leaveLifterNumberBlank
        ? ''
        : String(
            lifter.lifterNumber
          ),
    weightClass:
      expeditorOptions
        .leaveWeightClassBlank
        ? ''
        : (
            lifter.weightClass ??
            ''
          ),
    divisionName:
      division.name,
    bodyWeight:
      expeditorOptions
        .leaveBodyWeightBlank
        ? ''
        : (
            lifter.bodyWeight ===
              null
              ? ''
              : lifter.bodyWeight
                  .toFixed(1)
          ),
    lifterName:
      getNonRegistrationLifterDisplayName(
        meet,
        lifter
      ),
    teamName:
      getLifterTeamName(
        meet,
        lifter
      ),
    squatOpener:
      getExpeditorDeclaredWeight(
        lifter,
        'squat'
      ),
    benchOpener:
      getExpeditorDeclaredWeight(
        lifter,
        'bench'
      ),
    deadliftOpener:
      getExpeditorDeclaredWeight(
        lifter,
        'deadlift'
      ),
    cardTitle:
      expeditorCardTitle,
    associationLogo:
      expeditorOptions
        .omitAssociationLogo
        ? ''
        : getExpeditorAssociationLogo(
            division
          ),
    associationLogoAlt:
      expeditorOptions
        .omitAssociationLogo
        ? ''
        : getExpeditorAssociationLogoAlt(
            division
          ),
    footer:
      `${meet.state.meet.name}, ` +
      `${formatExpeditorFooterDate(
        meet.state.meet.date
      )}`,
    isBlank:
      false,
  }
}


function createBlankExpeditorCard(
  meet: LocalMeet,
  division: Division,
): ExpeditorCardData {

  return {
    lifterNumber: '',
    weightClass: '',
    divisionName: '',
    bodyWeight: '',
    lifterName: '',
    teamName: '',
    squatOpener: '',
    benchOpener: '',
    deadliftOpener: '',
    cardTitle:
      expeditorCardTitle,
    associationLogo:
      expeditorOptions
        .omitAssociationLogo
        ? ''
        : getExpeditorAssociationLogo(
            division
          ),
    associationLogoAlt:
      expeditorOptions
        .omitAssociationLogo
        ? ''
        : getExpeditorAssociationLogoAlt(
            division
          ),
    footer:
      `${meet.state.meet.name}, ` +
      `${formatExpeditorFooterDate(
        meet.state.meet.date
      )}`,
    isBlank:
      true,
  }
}


function createTestExpeditorCard(
  meet: LocalMeet,
  division: Division,
): ExpeditorCardData {

  return {
    lifterNumber:
      '999',
    weightClass:
      getExpeditorWeightClasses(
        division
      )[0] ??
      '',
    divisionName:
      division.name,
    bodyWeight:
      '123.4',
    lifterName:
      'Sample, Lifter',
    teamName:
      'Sample School',
    squatOpener:
      expeditorOptions
        .includeDeclaredWeights
        ? '225'
        : '',
    benchOpener:
      expeditorOptions
        .includeDeclaredWeights
        ? '135'
        : '',
    deadliftOpener:
      expeditorOptions
        .includeDeclaredWeights
        ? '275'
        : '',
    cardTitle:
      expeditorCardTitle,
    associationLogo:
      expeditorOptions
        .omitAssociationLogo
        ? ''
        : getExpeditorAssociationLogo(
            division
          ),
    associationLogoAlt:
      expeditorOptions
        .omitAssociationLogo
        ? ''
        : getExpeditorAssociationLogoAlt(
            division
          ),
    footer:
      `${meet.state.meet.name}, ` +
      `${formatExpeditorFooterDate(
        meet.state.meet.date
      )}`,
    isBlank:
      false,
  }
}


function renderExpeditorFieldLine(
  label: string,
  value: string,
  className = '',
): string {

  return `
    <div class="expeditor-field ${className}">
      <span class="expeditor-field-label">
        ${escapeHtml(label)}
      </span>

      <span class="expeditor-field-value">
        ${escapeHtml(value)}
      </span>
    </div>
  `
}


function renderExpeditorLiftRow(
  label: string,
  opener: string,
  showPinHole: boolean,
): string {

  return `
    <tr>
      <td class="expeditor-event-cell">
        <strong>${escapeHtml(label)}</strong>

        ${
          showPinHole
            ? `
              <span class="expeditor-pin-hole">
                Pin<br>Hole
              </span>
            `
            : ''
        }
      </td>

      <td class="expeditor-attempt-cell">
        ${escapeHtml(opener)}
      </td>

      <td class="expeditor-attempt-cell"></td>
      <td class="expeditor-attempt-cell"></td>
      <td class="expeditor-attempt-cell"></td>
    </tr>
  `
}


function renderExpeditorCard(
  card: ExpeditorCardData,
): string {

  return `
    <article class="expeditor-card">

      <div class="expeditor-card-top">
        <div class="expeditor-brand">
          ${
            card.associationLogo ===
            ''
              ? `
                <div class="expeditor-logo-space"></div>
              `
              : `
                <div class="expeditor-logo-space">
                  <img
                    class="expeditor-association-logo ${
                      card.associationLogo.includes(
                        'thspa-logo'
                      )
                        ? 'expeditor-association-logo-thspa'
                        : ''
                    }"
                    src="${escapeHtml(card.associationLogo)}"
                    alt="${escapeHtml(card.associationLogoAlt)}"
                  >
                </div>
              `
          }

          <div class="expeditor-card-title">
            ${escapeHtml(card.cardTitle)}
          </div>
        </div>

        <div class="expeditor-card-id-fields">
          ${renderExpeditorFieldLine(
            'Lifter #',
            card.lifterNumber,
            'expeditor-center-value'
          )}

          ${renderExpeditorFieldLine(
            'Wt. Class',
            card.weightClass,
            'expeditor-center-value'
          )}
        </div>
      </div>

      <div class="expeditor-registration-grid">
        ${renderExpeditorFieldLine(
          'Division',
          card.divisionName,
          'expeditor-division-field'
        )}

        ${renderExpeditorFieldLine(
          'BWT',
          card.bodyWeight,
          'expeditor-center-value expeditor-bwt-field'
        )}

        ${renderExpeditorFieldLine(
          'Name',
          card.lifterName,
          'expeditor-span-two'
        )}

        ${renderExpeditorFieldLine(
          'School',
          card.teamName,
          'expeditor-span-two'
        )}
      </div>

      <table class="expeditor-lift-table">
        <thead>
          <tr>
            <th>EVENT</th>
            <th>1st Att.</th>
            <th>2nd Att.</th>
            <th>3rd Att.</th>
            <th>BEST LIFT</th>
          </tr>
        </thead>

        <tbody>
          ${renderExpeditorLiftRow(
            'SQUAT',
            card.squatOpener,
            true
          )}

          ${renderExpeditorLiftRow(
            'BENCH PRESS',
            card.benchOpener,
            true
          )}

          <tr class="expeditor-subtotal-row">
            <td colspan="4">
              SUB-TOTAL
            </td>
            <td></td>
          </tr>

          ${renderExpeditorLiftRow(
            'DEADLIFT',
            card.deadliftOpener,
            false
          )}
        </tbody>
      </table>

      <div class="expeditor-card-bottom">
        <table class="expeditor-bumps-table">
          <caption>BUMPS</caption>
          <thead>
            <tr>
              <th>1</th>
              <th>2</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <div class="expeditor-total-box">
          <span>TOTAL</span>
          <div></div>
        </div>
      </div>

      <div class="expeditor-card-footer">
        ${escapeHtml(card.footer)}
      </div>

    </article>
  `
}


function renderExpeditorPrintSheets():
  string {

  if (
    expeditorPrintCards.length ===
    0
  ) {
    return ''
  }

  const cards =
    [...expeditorPrintCards]

  if (
    cards.length % 2 !==
    0
  ) {
    cards.push({
      ...cards[0],
      lifterNumber: '',
      weightClass: '',
      divisionName: '',
      bodyWeight: '',
      lifterName: '',
      teamName: '',
      squatOpener: '',
      benchOpener: '',
      deadliftOpener: '',
      footer: '',
      isBlank: true,
    })
  }

  const sheets:
    string[] =
    []

  for (
    let index = 0;
    index <
    cards.length;
    index += 2
  ) {
    sheets.push(`
      <section class="expeditor-sheet">
        <div class="expeditor-half">
          ${renderExpeditorCard(
            cards[index]
          )}
        </div>

        <div
          class="expeditor-half ${
            expeditorOptions
              .includeDividingLine
              ? 'with-cut-line'
              : ''
          }"
        >
          ${renderExpeditorCard(
            cards[index + 1]
          )}
        </div>
      </section>
    `)
  }

  return `
    <div class="expeditor-print-root">
      ${sheets.join('')}
    </div>
  `
}


function renderExpeditorWeightClassChoices(
  division: Division,
): string {

  return getExpeditorWeightClasses(
    division
  )
    .map(
      weightClass => `
        <label class="expeditor-check-item">
          <input
            type="checkbox"
            data-expeditor-weight-class="${escapeHtml(weightClass)}"
            ${
              expeditorSelectedWeightClasses.has(
                weightClass
              )
                ? 'checked'
                : ''
            }
          >
          <span>
            ${escapeHtml(weightClass)}
          </span>
        </label>
      `
    )
    .join('')
}


function renderExpeditorTeamChoices(
  meet: LocalMeet,
  division: Division,
): string {

  return getExpeditorDivisionTeams(
    meet,
    division.id
  )
    .map(
      team => `
        <label class="expeditor-check-item">
          <input
            type="checkbox"
            data-expeditor-team-id="${team.id}"
            ${
              expeditorSelectedTeamIds.has(
                team.id
              )
                ? 'checked'
                : ''
            }
          >
          <span>
            ${escapeHtml(team.name)}
          </span>
        </label>
      `
    )
    .join('')
}


function renderExpeditorLifterChoices(
  meet: LocalMeet,
  division: Division,
): string {

  return getExpeditorDivisionLifters(
    meet,
    division.id
  )
    .map(
      lifter => `
        <label class="expeditor-check-item">
          <input
            type="checkbox"
            data-expeditor-lifter-id="${lifter.id}"
            ${
              expeditorSelectedLifterIds.has(
                lifter.id
              )
                ? 'checked'
                : ''
            }
          >
          <span>
            ${escapeHtml(
              `${lifter.lastName}, ` +
              `${lifter.firstName} - ` +
              `${getLifterTeamName(
                meet,
                lifter
              )}`
            )}
          </span>
        </label>
      `
    )
    .join('')
}


function renderTools():
  string {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return `
      <main class="tools-page">
        <div class="empty-state">
          Select a meet to use Tools.
        </div>
      </main>
    `
  }

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return `
      <main class="tools-page">
        ${renderBestLifterDivisionTabs(meet)}

        <div class="empty-state">
          Select a division to use Tools.
        </div>
      </main>
    `
  }

  ensureRunnerSheetSelections(
    division
  )

  ensureExpeditorSelections(
    meet,
    division
  )

  const runnerSheetSelectedCount =
    runnerSheetSelectedWeightClasses
      .size

  const selectedCount =
    getExpeditorSelectedLifters(
      meet,
      division
    ).length

  return `
    <main class="tools-page">

      <div class="tools-screen-content">

        ${renderBestLifterDivisionTabs(meet)}

        <section class="tool-panel runner-sheet-tool-panel">
          <div class="tool-panel-heading">
            <div>
              <h1>Runner Sheets</h1>
              <p>
                Print one runner sheet per selected weight class.
                Lifters are listed in lifter-number order.
              </p>
            </div>

            <div class="tool-selection-count">
              ${runnerSheetSelectedCount} class${
                runnerSheetSelectedCount === 1
                  ? ''
                  : 'es'
              } selected
            </div>
          </div>

          <fieldset class="runner-sheet-fieldset">
            <legend>Select Weight Classes to Print</legend>

            <div class="runner-sheet-weight-class-list">
              ${renderRunnerSheetWeightClassChoices(
                division
              )}
            </div>

            <div class="runner-sheet-choice-actions">
              <button
                type="button"
                class="compact-button"
                id="selectAllRunnerSheetWeightClasses"
              >
                Select All
              </button>

              <button
                type="button"
                class="compact-button"
                id="unselectAllRunnerSheetWeightClasses"
              >
                Unselect All
              </button>
            </div>
          </fieldset>

          <fieldset class="runner-sheet-fieldset">
            <legend>Options</legend>

            <label class="runner-sheet-option">
              <input
                id="runnerSheetForceBlankBestLiftColumns"
                type="checkbox"
                ${
                  runnerSheetForceBlankBestLiftColumns
                    ? 'checked'
                    : ''
                }
              >
              Force blanks into the best-lift columns
            </label>
          </fieldset>

          <div class="runner-sheet-tool-actions">
            <button
              id="printRunnerSheets"
              type="button"
              class="primary-action"
              ${
                runnerSheetSelectedCount === 0
                  ? 'disabled'
                  : ''
              }
            >
              Print Runner Sheets
            </button>
          </div>
        </section>

        <section class="tool-panel">
          <div class="tool-panel-heading">
            <div>
              <h1>Expeditor Cards</h1>
              <p>
                Print blank cards or pre-filled lifter cards for meet officials.
                Printed two cards per 8.5×11 landscape sheet.
              </p>
            </div>

            <div class="tool-selection-count">
              ${selectedCount} lifter${
                selectedCount === 1
                  ? ''
                  : 's'
              } selected
            </div>
          </div>

          <fieldset class="expeditor-source-fieldset">
            <legend>Source</legend>

            <div class="expeditor-source-tabs">
              <label>
                <input
                  type="radio"
                  name="expeditor-source"
                  value="weight-class"
                  ${
                    expeditorSource ===
                    'weight-class'
                      ? 'checked'
                      : ''
                  }
                >
                By Weight Class
              </label>

              <label>
                <input
                  type="radio"
                  name="expeditor-source"
                  value="team"
                  ${
                    expeditorSource ===
                    'team'
                      ? 'checked'
                      : ''
                  }
                >
                By Team
              </label>

              <label>
                <input
                  type="radio"
                  name="expeditor-source"
                  value="lifter"
                  ${
                    expeditorSource ===
                    'lifter'
                      ? 'checked'
                      : ''
                  }
                >
                By Lifter
              </label>
            </div>

            <div class="expeditor-source-panel">
              <div
                class="expeditor-choice-box ${
                  expeditorSource ===
                  'weight-class'
                    ? ''
                    : 'hidden'
                }"
                data-expeditor-source-panel="weight-class"
              >
                <strong>
                  Select Weight Classes to Print
                </strong>

                <div class="expeditor-choice-list expeditor-weight-class-list">
                  ${renderExpeditorWeightClassChoices(
                    division
                  )}
                </div>

                <div class="expeditor-choice-actions">
                  <button
                    type="button"
                    class="compact-button"
                    data-expeditor-select-all="weight-class"
                  >
                    Select All
                  </button>

                  <button
                    type="button"
                    class="compact-button"
                    data-expeditor-unselect-all="weight-class"
                  >
                    Unselect All
                  </button>
                </div>
              </div>

              <div
                class="expeditor-choice-box ${
                  expeditorSource ===
                  'team'
                    ? ''
                    : 'hidden'
                }"
                data-expeditor-source-panel="team"
              >
                <strong>
                  Select Teams to Print
                </strong>

                <div class="expeditor-choice-list">
                  ${renderExpeditorTeamChoices(
                    meet,
                    division
                  )}
                </div>

                <div class="expeditor-choice-actions">
                  <button
                    type="button"
                    class="compact-button"
                    data-expeditor-select-all="team"
                  >
                    Select All
                  </button>

                  <button
                    type="button"
                    class="compact-button"
                    data-expeditor-unselect-all="team"
                  >
                    Unselect All
                  </button>
                </div>
              </div>

              <div
                class="expeditor-choice-box ${
                  expeditorSource ===
                  'lifter'
                    ? ''
                    : 'hidden'
                }"
                data-expeditor-source-panel="lifter"
              >
                <strong>
                  Select Lifters to Print
                </strong>

                <div class="expeditor-choice-list expeditor-lifter-list">
                  ${renderExpeditorLifterChoices(
                    meet,
                    division
                  )}
                </div>

                <div class="expeditor-choice-actions">
                  <button
                    type="button"
                    class="compact-button"
                    data-expeditor-select-all="lifter"
                  >
                    Select All
                  </button>

                  <button
                    type="button"
                    class="compact-button"
                    data-expeditor-unselect-all="lifter"
                  >
                    Unselect All
                  </button>
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset class="expeditor-options-fieldset">
            <legend>Options</legend>

            <div class="expeditor-options-grid">
              <label>
                <input
                  type="checkbox"
                  data-expeditor-option="leaveBodyWeightBlank"
                  ${
                    expeditorOptions
                      .leaveBodyWeightBlank
                      ? 'checked'
                      : ''
                  }
                >
                Leave BWT blank
              </label>

              <label>
                <input
                  type="checkbox"
                  data-expeditor-option="leaveLifterNumberBlank"
                  ${
                    expeditorOptions
                      .leaveLifterNumberBlank
                      ? 'checked'
                      : ''
                  }
                >
                Leave Lifter Number blank
              </label>

              <label>
                <input
                  type="checkbox"
                  data-expeditor-option="leaveWeightClassBlank"
                  ${
                    expeditorOptions
                      .leaveWeightClassBlank
                      ? 'checked'
                      : ''
                  }
                >
                Leave Wt. Class blank
              </label>

              <label>
                <input
                  type="checkbox"
                  data-expeditor-option="includeDeclaredWeights"
                  ${
                    expeditorOptions
                      .includeDeclaredWeights
                      ? 'checked'
                      : ''
                  }
                >
                Include declared weights from 1st attempts
              </label>

              <label>
                <input
                  type="checkbox"
                  data-expeditor-option="omitAssociationLogo"
                  ${
                    expeditorOptions
                      .omitAssociationLogo
                      ? 'checked'
                      : ''
                  }
                >
                Omit association logo
              </label>

              <label>
                <input
                  type="checkbox"
                  data-expeditor-option="includeDividingLine"
                  ${
                    expeditorOptions
                      .includeDividingLine
                      ? 'checked'
                      : ''
                  }
                >
                Include dividing line between cards
              </label>
            </div>

            <label class="expeditor-title-field">
              <span>Card Title</span>

              <input
                id="expeditorCardTitle"
                type="text"
                value="${escapeHtml(expeditorCardTitle)}"
              >
            </label>
          </fieldset>

          <div class="expeditor-tool-actions">
            <button
              id="printSelectedExpeditorCards"
              type="button"
              class="primary-action"
              ${
                selectedCount === 0
                  ? 'disabled'
                  : ''
              }
            >
              Print Selected Cards
            </button>

            <button
              id="printTestExpeditorCard"
              type="button"
              class="compact-button"
            >
              Print a Test Card
            </button>

            <button
              id="printBlankExpeditorCard"
              type="button"
              class="compact-button"
            >
              Print Blank Cards
            </button>
          </div>
        </section>

      </div>

      ${renderRunnerSheetPrintPages()}

      ${renderExpeditorPrintSheets()}

    </main>
  `
}


function startExpeditorPrint(
  cards:
    ExpeditorCardData[],
): void {

  expeditorPrintCards =
    cards

  renderApp()

  document.body.classList.add(
    'expeditor-print-active'
  )

  window.addEventListener(
    'afterprint',
    () => {
      document.body.classList.remove(
        'expeditor-print-active'
      )

      expeditorPrintCards =
        []

      renderApp()
    },
    {
      once: true,
    }
  )

  window.setTimeout(
    () => {
      window.print()
    },
    0
  )
}


function updateExpeditorSelectedSet(
  source:
    ExpeditorSource,
  selected:
    boolean,
  meet: LocalMeet,
  division: Division,
): void {

  if (
    source ===
    'weight-class'
  ) {
    expeditorSelectedWeightClasses =
      selected
        ? new Set(
            getExpeditorWeightClasses(
              division
            )
          )
        : new Set()

    return
  }

  if (
    source ===
    'team'
  ) {
    expeditorSelectedTeamIds =
      selected
        ? new Set(
            getExpeditorDivisionTeams(
              meet,
              division.id
            )
              .map(
                team =>
                  team.id
              )
          )
        : new Set()

    return
  }

  expeditorSelectedLifterIds =
    selected
      ? new Set(
          getExpeditorDivisionLifters(
            meet,
            division.id
          )
            .map(
              lifter =>
                lifter.id
            )
        )
      : new Set()
}


function wireTools():
  void {

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

  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-best-lifter-division]'
    )
    .forEach(
      button => {
        button.addEventListener(
          'click',
          () => {
            const divisionId =
              Number(
                button.dataset
                  .bestLifterDivision
              )

            if (
              !Number.isFinite(
                divisionId
              )
            ) {
              return
            }

            selectedDivisionId =
              divisionId

            runnerSheetSelectionDivisionId =
              null

            expeditorSelectionDivisionId =
              null

            renderApp()
          }
        )
      }
    )

  document
    .querySelectorAll<HTMLInputElement>(
      '[data-runner-sheet-weight-class]'
    )
    .forEach(
      input => {
        input.addEventListener(
          'change',
          () => {
            const value =
              input.dataset
                .runnerSheetWeightClass

            if (
              value ===
              undefined
            ) {
              return
            }

            if (
              input.checked
            ) {
              runnerSheetSelectedWeightClasses.add(
                value
              )
            } else {
              runnerSheetSelectedWeightClasses.delete(
                value
              )
            }

            renderApp()
          }
        )
      }
    )

  document
    .querySelector<HTMLButtonElement>(
      '#selectAllRunnerSheetWeightClasses'
    )
    ?.addEventListener(
      'click',
      () => {
        runnerSheetSelectedWeightClasses =
          new Set(
            getRunnerSheetWeightClasses(
              division
            )
          )

        renderApp()
      }
    )

  document
    .querySelector<HTMLButtonElement>(
      '#unselectAllRunnerSheetWeightClasses'
    )
    ?.addEventListener(
      'click',
      () => {
        runnerSheetSelectedWeightClasses =
          new Set()

        renderApp()
      }
    )

  document
    .querySelector<HTMLInputElement>(
      '#runnerSheetForceBlankBestLiftColumns'
    )
    ?.addEventListener(
      'change',
      event => {
        runnerSheetForceBlankBestLiftColumns =
          (
            event.currentTarget as
              HTMLInputElement
          ).checked
      }
    )

  document
    .querySelector<HTMLButtonElement>(
      '#printRunnerSheets'
    )
    ?.addEventListener(
      'click',
      () => {
        const pages =
          getRunnerSheetPrintPages(
            meet,
            division
          )

        if (
          pages.length ===
          0
        ) {
          window.alert(
            'No selected weight classes contain lifters.'
          )

          return
        }

        startRunnerSheetPrint(
          pages
        )
      }
    )

  document
    .querySelectorAll<HTMLInputElement>(
      'input[name="expeditor-source"]'
    )
    .forEach(
      input => {
        input.addEventListener(
          'change',
          () => {
            expeditorSource =
              input.value as
                ExpeditorSource

            renderApp()
          }
        )
      }
    )

  document
    .querySelectorAll<HTMLInputElement>(
      '[data-expeditor-weight-class]'
    )
    .forEach(
      input => {
        input.addEventListener(
          'change',
          () => {
            const value =
              input.dataset
                .expeditorWeightClass

            if (
              value ===
              undefined
            ) {
              return
            }

            if (
              input.checked
            ) {
              expeditorSelectedWeightClasses.add(
                value
              )
            } else {
              expeditorSelectedWeightClasses.delete(
                value
              )
            }

            renderApp()
          }
        )
      }
    )

  document
    .querySelectorAll<HTMLInputElement>(
      '[data-expeditor-team-id]'
    )
    .forEach(
      input => {
        input.addEventListener(
          'change',
          () => {
            const value =
              Number(
                input.dataset
                  .expeditorTeamId
              )

            if (
              !Number.isFinite(
                value
              )
            ) {
              return
            }

            if (
              input.checked
            ) {
              expeditorSelectedTeamIds.add(
                value
              )
            } else {
              expeditorSelectedTeamIds.delete(
                value
              )
            }

            renderApp()
          }
        )
      }
    )

  document
    .querySelectorAll<HTMLInputElement>(
      '[data-expeditor-lifter-id]'
    )
    .forEach(
      input => {
        input.addEventListener(
          'change',
          () => {
            const value =
              Number(
                input.dataset
                  .expeditorLifterId
              )

            if (
              !Number.isFinite(
                value
              )
            ) {
              return
            }

            if (
              input.checked
            ) {
              expeditorSelectedLifterIds.add(
                value
              )
            } else {
              expeditorSelectedLifterIds.delete(
                value
              )
            }

            renderApp()
          }
        )
      }
    )

  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-expeditor-select-all]'
    )
    .forEach(
      button => {
        button.addEventListener(
          'click',
          () => {
            updateExpeditorSelectedSet(
              button.dataset
                .expeditorSelectAll as
                  ExpeditorSource,
              true,
              meet,
              division
            )

            renderApp()
          }
        )
      }
    )

  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-expeditor-unselect-all]'
    )
    .forEach(
      button => {
        button.addEventListener(
          'click',
          () => {
            updateExpeditorSelectedSet(
              button.dataset
                .expeditorUnselectAll as
                  ExpeditorSource,
              false,
              meet,
              division
            )

            renderApp()
          }
        )
      }
    )

  document
    .querySelectorAll<HTMLInputElement>(
      '[data-expeditor-option]'
    )
    .forEach(
      input => {
        input.addEventListener(
          'change',
          () => {
            const option =
              input.dataset
                .expeditorOption as
                  keyof
                    ExpeditorCardOptions

            expeditorOptions[
              option
            ] =
              input.checked
          }
        )
      }
    )

  document
    .querySelector<HTMLInputElement>(
      '#expeditorCardTitle'
    )
    ?.addEventListener(
      'input',
      event => {
        expeditorCardTitle =
          (
            event.currentTarget as
              HTMLInputElement
          ).value
      }
    )

  document
    .querySelector<HTMLButtonElement>(
      '#printSelectedExpeditorCards'
    )
    ?.addEventListener(
      'click',
      () => {
        const lifters =
          getExpeditorSelectedLifters(
            meet,
            division
          )

        if (
          lifters.length ===
          0
        ) {
          window.alert(
            'No lifters are selected.'
          )

          return
        }

        startExpeditorPrint(
          lifters.map(
            lifter =>
              createExpeditorCardData(
                meet,
                division,
                lifter
              )
          )
        )
      }
    )

  document
    .querySelector<HTMLButtonElement>(
      '#printTestExpeditorCard'
    )
    ?.addEventListener(
      'click',
      () => {
        startExpeditorPrint([
          createTestExpeditorCard(
            meet,
            division
          ),
          createTestExpeditorCard(
            meet,
            division
          ),
        ])
      }
    )

  document
    .querySelector<HTMLButtonElement>(
      '#printBlankExpeditorCard'
    )
    ?.addEventListener(
      'click',
      () => {
        startExpeditorPrint([
          createBlankExpeditorCard(
            meet,
            division
          ),
          createBlankExpeditorCard(
            meet,
            division
          ),
        ])
      }
    )
}


function renderHelp():
  string {

  return `
    <main class="help-page">

      <section class="help-hero">
        <div>
          <h1>PowerScore Help</h1>

          <p>
            PowerScore is designed to follow the same basic meet workflow you already know.
            Use this Quick Start Guide as a first-time walkthrough or as a refresher before meet day.
          </p>
        </div>

        <div class="help-hero-note">
          <strong>Quick reminder</strong>
          <span>
            Registration sets up the meet. Competition records and checks the lifting results.
          </span>
        </div>
      </section>

      <section class="help-section">
        <div class="help-section-heading">
          <div>
            <h2>Quick Start Guide</h2>
            <p>Follow these steps in order for a typical meet.</p>
          </div>
        </div>

        <div class="help-workflow">

          <article class="help-phase">
            <div class="help-phase-title">
              <span class="help-phase-number">1</span>
              <div>
                <h3>Before the Meet</h3>
                <p>Set up the meet and make sure the roster is ready.</p>
              </div>
            </div>

            <ol class="help-step-list">
              <li>
                <strong>Select or create the meet.</strong>
                Enter the meet name, date, location, and result-entry mode.
              </li>

              <li>
                <strong>Create the divisions.</strong>
                Choose the correct association/rule set for each division.
              </li>

              <li>
                <strong>Add the teams.</strong>
                Attach each team to the appropriate division.
              </li>

              <li>
                <strong>Register the lifters.</strong>
                Verify lifter number, name, team, body weight, equipment, status, and weight class.
              </li>

              <li>
                <strong>Generate a Platform MeetID if PlatformManager will be used.</strong>
                The same MeetID is entered into each PlatformManager station for this meet.
              </li>
            </ol>

            <div class="help-callout">
              <strong>Before competition starts:</strong>
              Resolve any lifter marked Needs Attention, Platform Incomplete, or Division Required.
            </div>
          </article>

          <article class="help-phase">
            <div class="help-phase-title">
              <span class="help-phase-number">2</span>
              <div>
                <h3>During the Meet</h3>
                <p>Enter results manually or bring them in from PlatformManager.</p>
              </div>
            </div>

            <ol class="help-step-list">
              <li>
                <strong>Open Competition and select the division.</strong>
                Use the weight-class tabs to narrow the display when needed.
              </li>

              <li>
                <strong>Enter results as they become available.</strong>
                Places, SubTotal, and Total update continuously as results are entered.
              </li>

              <li>
                <strong>Watch for PlatformManager results.</strong>
                When pending files exist, the Check for Platform Results button shows the number available.
              </li>

              <li>
                <strong>Import PlatformManager files deliberately.</strong>
                Open the Platform Results Manager, select the file or files you want, and import them.
                Successfully imported files move to the Processed list.
              </li>

              <li>
                <strong>Monitor overall entry progress.</strong>
                Use Show Data Entry Progress to see how many lifters have results in each weight class.
              </li>

              <li>
                <strong>Watch for missing-result warnings.</strong>
                A darker red result cell and flagged column header indicate an entry that appears to have been skipped.
              </li>
            </ol>

            <div class="help-callout">
              <strong>Near the end of an event:</strong>
              Use Review Missing Results to check all remaining blank or zero entries for active lifters.
            </div>
          </article>

          <article class="help-phase">
            <div class="help-phase-title">
              <span class="help-phase-number">3</span>
              <div>
                <h3>Resolve Exceptions</h3>
                <p>Fix issues as they are discovered instead of waiting until the end.</p>
              </div>
            </div>

            <ol class="help-step-list">
              <li>
                <strong>Platform Incomplete:</strong>
                A PlatformManager lifter was not already registered in PowerScore.
                Supply the missing name, team, and body weight.
              </li>

              <li>
                <strong>Division Required:</strong>
                PowerScore could not safely determine the lifter's division.
                Select the correct division before completing the lifter.
              </li>

              <li>
                <strong>No BWT:</strong>
                Enter a valid body weight so PowerScore can assign the correct weight class.
              </li>

              <li>
                <strong>Missing result:</strong>
                Verify the platform record or correct the result directly on the Competition page.
              </li>
            </ol>
          </article>

        </div>
      </section>

      <section class="help-section">
        <div class="help-section-heading">
          <div>
            <h2>PlatformManager Quick Reference</h2>
            <p>The Platform MeetID connects PlatformManager submissions to the correct PowerScore meet.</p>
          </div>
        </div>

        <div class="help-reference-grid">
          <article class="help-reference-card">
            <h3>MeetID</h3>
            <p>
              Generate the MeetID on Registration. It uses four letters followed by four numbers.
              Enter the same MeetID into every PlatformManager station for the meet.
            </p>
          </article>

          <article class="help-reference-card">
            <h3>Available Results</h3>
            <p>
              PowerScore checks for pending PlatformManager files while Competition is open.
              The button shows a count when files are waiting.
            </p>
          </article>

          <article class="help-reference-card">
            <h3>Controlled Import</h3>
            <p>
              PowerScore does not blindly import every file. Select the results you want to import.
              Processed files remain visible for reference.
            </p>
          </article>

          <article class="help-reference-card">
            <h3>Unexpected Lifters</h3>
            <p>
              If a lifter number is not registered, PowerScore creates an incomplete lifter record and
              sends it to Platform Issues for correction.
            </p>
          </article>
        </div>
      </section>

      <section class="help-section">
        <div class="help-section-heading">
          <div>
            <h2>Lifter Status Reference</h2>
            <p>Competition status is separate from registration/readiness issues.</p>
          </div>
        </div>

        <div class="help-status-grid">
          <div class="help-status-item">
            <strong>Active</strong>
            <span>Lifter is competing normally.</span>
          </div>

          <div class="help-status-item">
            <strong>BO</strong>
            <span>Bombed Out. Three failed attempts in a lift also sets BO automatically.</span>
          </div>

          <div class="help-status-item">
            <strong>SC</strong>
            <span>Scratched. The lifter is no longer expected to receive additional results.</span>
          </div>

          <div class="help-status-item">
            <strong>DQ</strong>
            <span>Disqualified. The lifter is no longer expected to receive additional results.</span>
          </div>
        </div>
      </section>

      <section class="help-section help-shortcuts-section">
        <div>
          <h2>Keyboard Shortcuts</h2>
          <p>
            Registration and Competition both include a Shortcut Help button in the navigation bar.
            Use it for the keyboard commands available on the page you are working in.
          </p>
        </div>

        <div class="help-shortcut-examples">
          <span><kbd>Tab</kbd> Move through entry fields</span>
          <span><kbd>Enter</kbd> Advance through result entry</span>
          <span><kbd>G</kbd> Good</span>
          <span><kbd>R</kbd> Failed</span>
          <span><kbd>W</kbd> Unknown</span>
          <span><kbd>B</kbd> BO</span>
          <span><kbd>S</kbd> SC</span>
          <span><kbd>Q</kbd> DQ</span>
        </div>
      </section>

      <section class="help-section help-training-meet">
        <div class="help-section-heading">
          <div>
            <h2>Practice with Training Meets</h2>
            <p>
              Both training meets are isolated from the live PlatformManager queue.
              Each division has six Texas-town teams, includes a small number of B-team lifters,
              and represents every weight class currently available in PowerScore.
              Weight-class participation follows a realistic bell curve, and the classes are distributed
              across six mixed boys/girls platforms while keeping each weight class intact.
            </p>
          </div>
        </div>

        <div class="help-training-meet-grid">
          <div>
            <h3>Best Lift Training</h3>
            <p>
              MeetID <strong>TRNG1001</strong>. Uses the Best Lift entry mode.
              Squat imports are intentionally clean across all six platforms.
              Bench introduces an unknown lifter later in the sequence,
              and Deadlift adds missing-result and status scenarios on selected platforms.
            </p>

            <div class="help-training-actions">
              <button
                id="openBestLiftTrainingMeet"
                type="button"
                class="compact-button"
              >
                Open Best Lift Training
              </button>

              <button
                id="resetBestLiftTrainingMeet"
                type="button"
                class="compact-button secondary-button"
              >
                Reset Best Lift Training
              </button>
            </div>
          </div>

          <div>
            <h3>All Attempts Training</h3>
            <p>
              MeetID <strong>TRNG2001</strong>. Uses three attempts per lift.
              The Squat files begin clean across all six platforms.
              Later Bench and Deadlift rounds introduce skipped attempts, an unknown lifter,
              SC/DQ statuses, and a natural bomb-out.
            </p>

            <div class="help-training-actions">
              <button
                id="openAllAttemptsTrainingMeet"
                type="button"
                class="compact-button"
              >
                Open All Attempts Training
              </button>

              <button
                id="resetAllAttemptsTrainingMeet"
                type="button"
                class="compact-button secondary-button"
              >
                Reset All Attempts Training
              </button>
            </div>
          </div>
        </div>

        <div class="help-callout">
          <strong>Suggested practice sequence:</strong>
          Start with Squat. The first imports are designed to build confidence.
          Continue through Bench and Deadlift as the exercises become progressively more complex.
        </div>
      </section>

      <section class="help-section">
        <div class="help-section-heading">
          <div>
            <h2>Development Test Meets</h2>
            <p>
              PowerScore also includes ready-to-use Test versions of both training meets for development work.
            </p>
          </div>
        </div>

        <div class="help-reference-grid">
          <article class="help-reference-card">
            <h3>PowerScore Test - Best Lift</h3>
            <p>
              Uses the same realistic roster and scenarios as Best Lift Training,
              but all simulated PlatformManager results are already loaded.
            </p>
          </article>

          <article class="help-reference-card">
            <h3>PowerScore Test - All Attempts</h3>
            <p>
              Uses the same realistic all-attempt roster and scenarios,
              with all PlatformManager round results already loaded.
            </p>
          </article>

          <article class="help-reference-card">
            <h3>No Import Required</h3>
            <p>
              The Test Meets do not use a live PlatformManager MeetID.
              They are intended for Standings, Reports, sorting, printing, and other development testing.
            </p>
          </article>

          <article class="help-reference-card">
            <h3>Training vs. Test</h3>
            <p>
              Use Training Meets to practice the import workflow.
              Use Test Meets when you need realistic completed data immediately.
            </p>
          </article>
        </div>
      </section>

      <section class="help-training-placeholder">
        <div>
          <h2>Training Videos</h2>
          <p>
            Short training videos will be added here as the remaining PowerScore workflows are finalized.
          </p>
        </div>

        <span class="help-coming-soon">Coming later</span>
      </section>

    </main>
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
    isPlatformDivisionRequired(
      lifter
    )
  ) {
    return 'Division Required'
  }

  if (
    isPlatformRegistrationIncomplete(
      lifter
    )
  ) {
    return 'Platform Incomplete'
  }

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


function getNonRegistrationLifterDisplayName(
  meet: LocalMeet,
  lifter: Lifter,
): string {

  const suffixes:
    string[] =
    []

  const team =
    getLifterTeam(
      meet,
      lifter
    )

  if (
    lifter.isExtraLifter ||
    team?.isBTeam ===
      true
  ) {
    suffixes.push(
      '(B)'
    )
  }

  if (
    lifter.isGuest
  ) {
    suffixes.push(
      '(G)'
    )
  }

  if (
    lifter.equipmentType ===
    'unequipped'
  ) {
    suffixes.push(
      '(U)'
    )
  }

  return (
    `${lifter.lastName}, ${lifter.firstName}` +
    (
      suffixes.length > 0
        ? ` ${suffixes.join(' ')}`
        : ''
    )
  )
}


function getIndividualStandingDisplayName(
  meet: LocalMeet,
  row: IndividualStanding,
): string {

  const lifter =
    meet.state.lifters.find(
      candidate =>
        candidate.id ===
        row.lifterId
    )

  if (
    lifter !== undefined
  ) {
    return getNonRegistrationLifterDisplayName(
      meet,
      lifter
    )
  }

  return (
    `${row.lastName}, ${row.firstName}` +
    (
      row.isExtraLifter
        ? ' (B)'
        : ''
    )
  )
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

  if (
    !Number.isFinite(
      parsed
    )
  ) {
    return 9999
  }

  return (
    value.trim().endsWith(
      '+'
    )
      ? parsed + 0.1
      : parsed
  )
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
          ? isPlatformRegistrationIncomplete(
              lifter
            )
            ? `
              <select
                id="editLifterTeam"
                class="grid-select"
                aria-label="Team"
              >
                <option value="">Select team</option>
                ${
                  meet.state.teams
                    .filter(
                      team =>
                        meet.divisionTeams.some(
                          link =>
                            link.divisionId === lifter.divisionId &&
                            link.teamId === team.id
                        )
                    )
                    .map(
                      team =>
                        `<option value="${team.id}" ${lifter.teamId === team.id ? 'selected' : ''}>${escapeHtml(team.name)}${team.isBTeam === true ? ' (B Team)' : ''}</option>`
                    )
                    .join('')
                }
              </select>
            `
            : `
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
        ${isPlatformDivisionRequired(lifter) ? 'Division Required' : isPlatformRegistrationIncomplete(lifter) ? 'Platform Incomplete' : 'Editing'}
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
              ${
                isPlatformRegistrationIncomplete(lifter) &&
                lifter.firstName.trim() === '' &&
                lifter.lastName.trim() === ''
                  ? '<strong>NAME REQUIRED</strong>'
                  : `${escapeHtml(lifter.lastName)}, ${escapeHtml(lifter.firstName)}`
              }
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

  const usedNames =
    new Map<
      string,
      Lifter
    >(
      meet.state.lifters
        .filter(
          lifter =>
            !editedIds.has(
              lifter.id
            )
        )
        .map(
          lifter => [
            `${normalizeLifterNamePart(
              lifter.firstName
            )}|${normalizeLifterNamePart(
              lifter.lastName
            )}`,
            lifter,
          ]
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

    const nameKey =
      `${normalizeLifterNamePart(
        firstName
      )}|${normalizeLifterNamePart(
        lastName
      )}`

    const duplicateName =
      usedNames.get(
        nameKey
      )

    if (
      duplicateName !==
      undefined
    ) {
      showDuplicateLifterNameMessage(
        duplicateName
      )

      firstInput.focus()

      return false
    }

    usedNames.set(
      nameKey,
      {
        ...lifter,
        firstName,
        lastName,
      }
    )

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

                  <div class="registration-platform-meet-id">
                    <span>Platform MeetID:</span>
                    ${
                      meet.state.meet.platformMeetId
                        ? `
                          <input
                            id="platformMeetIdDisplay"
                            type="password"
                            value="${escapeHtml(getNormalizedPlatformMeetId(meet))}"
                            readonly
                            autocomplete="off"
                            aria-label="Platform MeetID"
                            style="width:92px; font-family:monospace; text-align:center;"
                          >
                          <button
                            id="viewPlatformMeetId"
                            type="button"
                            class="compact-button secondary-button"
                          >
                            View
                          </button>
                          <button
                            id="copyPlatformMeetId"
                            type="button"
                            class="compact-button secondary-button"
                          >
                            Copy
                          </button>
                        `
                        : '<strong>Not generated</strong>'
                    }
                    <button
                      id="generatePlatformMeetId"
                      type="button"
                      class="compact-button secondary-button"
                    >
                      ${
                        meet.state.meet.platformMeetId
                          ? 'Regenerate'
                          : 'Generate'
                      }
                    </button>
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


function calculateCompetitionSubTotal(
  results: CompetitionBestLiftResults,
): number | null {

  const values =
    [
      results.squat,
      results.bench,
    ].filter(
      value =>
        value !== null
    ) as number[]

  if (
    values.length === 0
  ) {
    return null
  }

  return values.reduce(
    (sum, value) =>
      sum + value,
    0
  )
}


function calculateCompetitionTotal(
  results: CompetitionBestLiftResults,
): number | null {

  const values =
    [
      results.squat,
      results.bench,
      results.deadlift,
    ].filter(
      value =>
        value !== null
    ) as number[]

  if (
    values.length === 0
  ) {
    return null
  }

  return values.reduce(
    (sum, value) =>
      sum + value,
    0
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


function getCompetitionSubTotalForLifter(
  meet: LocalMeet,
  lifter: Lifter,
): number | null {

  if (
    meet.state.meet.resultEntryMode ===
    'all-attempts'
  ) {
    return calculateCompetitionSubTotal(
      getAllAttemptBestLifts(
        lifter
      )
    )
  }

  return calculateCompetitionSubTotal(
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

    case 'subtotal':
      result =
        compareCompetitionOptionalNumbers(
          getCompetitionSubTotalForLifter(
            meet,
            a
          ),
          getCompetitionSubTotalForLifter(
            meet,
            b
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
  extraClass = '',
  competitionColumn = '',
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
    <div
      class="competition-sort-header-cell ${extraClass}"
      ${
        competitionColumn === ''
          ? ''
          : `data-missing-result-column="${competitionColumn}"`
      }
    >
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


function getCompetitionRunningTotalForLifter(
  meet: LocalMeet,
  lifter: Lifter,
): number | null {

  const results =
    meet.state.meet.resultEntryMode ===
      'all-attempts'
        ? getAllAttemptBestLifts(
            lifter
          )
        : getBestLiftResults(
            lifter
          )

  const completed =
    [
      results.squat,
      results.bench,
      results.deadlift,
    ].filter(
      value =>
        value !== null
    ) as number[]

  if (
    completed.length === 0
  ) {
    return null
  }

  return completed.reduce(
    (sum, value) =>
      sum + value,
    0
  )
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

  const runningTotal =
    getCompetitionRunningTotalForLifter(
      meet,
      lifter
    )

  if (
    runningTotal === null
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
          getCompetitionRunningTotalForLifter(
            meet,
            candidate
          ) !==
            null
      )
      .sort(
        (a, b) => {

          const totalA =
            getCompetitionRunningTotalForLifter(
              meet,
              a
            ) ?? 0

          const totalB =
            getCompetitionRunningTotalForLifter(
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
      getCompetitionRunningTotalForLifter(
        meet,
        previous
      ) ===
        runningTotal &&
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


function getMissingResultsReviewKey(
  meet: LocalMeet,
  divisionId: number,
): string {

  return (
    `${meet.state.meet.id}:` +
    `${divisionId}`
  )
}


function isMissingResultsReviewEnabled(
  meet: LocalMeet,
  divisionId: number,
): boolean {

  return missingResultsReviewDivisions.has(
    getMissingResultsReviewKey(
      meet,
      divisionId
    )
  )
}


function isBestLiftMissingForCompetition(
  meet: LocalMeet,
  lifter: Lifter,
  lift: CompetitionLift,
): boolean {

  const reviewEnabled =
    lifter.divisionId !== null &&
    isMissingResultsReviewEnabled(
      meet,
      lifter.divisionId
    )

  if (
    isBestLiftResultComplete(
      lifter,
      lift
    )
  ) {
    return false
  }

  if (
    isBestLiftResultMissing(
      lifter,
      lift,
      reviewEnabled
    )
  ) {
    return true
  }

  if (
    lifter.status !==
      'active'
  ) {
    return false
  }

  const competitionLifters =
    getCompetitionLifters(
      meet
    )

  if (
    hasLaterBestLiftResultInSequence(
      lifter,
      competitionLifters,
      lift
    )
  ) {
    return true
  }

  if (
    isPlatformManagerCreatedLifter(
      lifter
    ) &&
    lifter.weightClass !==
      null
  ) {
    return hasPeerBestLiftResult(
      lifter,
      competitionLifters,
      lift
    )
  }

  return false
}


function isAttemptMissingForCompetition(
  meet: LocalMeet,
  lifter: Lifter,
  lift: CompetitionLift,
  attemptKey: CompetitionAttemptKey,
): boolean {

  const reviewEnabled =
    lifter.divisionId !== null &&
    isMissingResultsReviewEnabled(
      meet,
      lifter.divisionId
    )

  if (
    isAttemptResultComplete(
      lifter,
      lift,
      attemptKey
    )
  ) {
    return false
  }

  if (
    isAttemptResultMissing(
      lifter,
      lift,
      attemptKey,
      reviewEnabled
    )
  ) {
    return true
  }

  if (
    lifter.status !==
      'active'
  ) {
    return false
  }

  const competitionLifters =
    getCompetitionLifters(
      meet
    )

  if (
    hasLaterAttemptResultInSequence(
      lifter,
      competitionLifters,
      lift,
      attemptKey
    )
  ) {
    return true
  }

  if (
    isPlatformManagerCreatedLifter(
      lifter
    ) &&
    lifter.weightClass !==
      null
  ) {
    return hasPeerAttemptResult(
      lifter,
      competitionLifters,
      lift,
      attemptKey
    )
  }

  return false
}


function doesBestLiftColumnHaveMissingResults(
  meet: LocalMeet,
  lift: CompetitionLift,
): boolean {

  return getCompetitionLifters(
    meet
  ).some(
    lifter =>
      isBestLiftMissingForCompetition(
        meet,
        lifter,
        lift
      )
  )
}


function doesAttemptColumnHaveMissingResults(
  meet: LocalMeet,
  lift: CompetitionLift,
  attemptKey: CompetitionAttemptKey,
): boolean {

  return getCompetitionLifters(
    meet
  ).some(
    lifter =>
      isAttemptMissingForCompetition(
        meet,
        lifter,
        lift,
        attemptKey
      )
  )
}


function getMissingHeaderLabel(
  label: string,
  missing: boolean,
): string {

  return missing
    ? `${label} ⚠`
    : label
}


function renderCompetitionAttemptHeader(
  meet: LocalMeet,
  label: string,
  lift: CompetitionLift,
  attemptKey: CompetitionAttemptKey,
): string {

  const missing =
    doesAttemptColumnHaveMissingResults(
      meet,
      lift,
      attemptKey
    )

  return `
    <div
      class="${
        missing
          ? 'competition-header-missing-result'
          : ''
      }"
      data-missing-result-column="${lift}-${attemptKey}"
    >
      ${escapeHtml(
        getMissingHeaderLabel(
          label,
          missing
        )
      ).replace(
        ' ',
        '<br>'
      )}
    </div>
  `
}


function updateCompetitionMissingResultIndicators(
  meet: LocalMeet,
): void {

  document
    .querySelectorAll<HTMLInputElement>(
      '[data-best-lift]'
    )
    .forEach(
      input => {
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

        const cell =
          input.closest<HTMLElement>(
            '.competition-result-cell'
          )

        if (
          lifter === undefined ||
          lift === undefined ||
          cell === null
        ) {
          return
        }

        cell.classList.toggle(
          'competition-missing-result-cell',
          isBestLiftMissingForCompetition(
            meet,
            lifter,
            lift
          )
        )
      }
    )

  document
    .querySelectorAll<HTMLInputElement>(
      '[data-attempt-weight]'
    )
    .forEach(
      input => {
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

        const cell =
          input.closest<HTMLElement>(
            '.competition-attempt-cell'
          )

        if (
          lifter === undefined ||
          lift === undefined ||
          attemptKey === undefined ||
          cell === null
        ) {
          return
        }

        cell.classList.toggle(
          'competition-missing-result-cell',
          isAttemptMissingForCompetition(
            meet,
            lifter,
            lift,
            attemptKey
          )
        )
      }
    )

  document
    .querySelectorAll<HTMLElement>(
      '[data-missing-result-column]'
    )
    .forEach(
      header => {
        const column =
          header.dataset
            .missingResultColumn ??
          ''

        let missing =
          false

        if (
          column.startsWith(
            'best-'
          )
        ) {
          const lift =
            column.replace(
              'best-',
              ''
            ) as CompetitionLift

          missing =
            doesBestLiftColumnHaveMissingResults(
              meet,
              lift
            )
        } else {
          const [
            lift,
            attemptKey,
          ] =
            column.split(
              '-'
            ) as [
              CompetitionLift,
              CompetitionAttemptKey,
            ]

          missing =
            doesAttemptColumnHaveMissingResults(
              meet,
              lift,
              attemptKey
            )
        }

        header.classList.toggle(
          'competition-header-missing-result',
          missing
        )

        const warning =
          header.querySelector<HTMLElement>(
            '.competition-missing-header-warning'
          )

        if (
          warning !== null
        ) {
          warning.hidden =
            !missing
        }
      }
    )
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

      const subtotal =
        calculateCompetitionSubTotal(
          results
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
            <strong>${escapeHtml(getNonRegistrationLifterDisplayName(meet, lifter))}</strong>
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
              meet,
              lifter,
              'squat',
              results.squat
            )
          }

          ${
            renderBestLiftInput(
              meet,
              lifter,
              'bench',
              results.bench
            )
          }

          ${
            renderBestLiftInput(
              meet,
              lifter,
              'deadlift',
              results.deadlift
            )
          }

          <div
            class="competition-total"
            data-best-subtotal="${lifter.id}"
          >
            ${formatCompetitionDisplayWeight(subtotal)}
          </div>

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
  meet: LocalMeet,
  lifter: Lifter,
  lift: CompetitionLift,
  value: number | null,
): string {

  const missing =
    isBestLiftMissingForCompetition(
      meet,
      lifter,
      lift
    )

  return `
    <div
      class="competition-result-cell ${
        missing
          ? 'competition-missing-result-cell'
          : ''
      }"
    >
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
  meet: LocalMeet,
  lifter: Lifter,
  lift: CompetitionLift,
  attemptKey: CompetitionAttemptKey,
  attempt: CompetitionAttempt,
): string {

  const editingLocked =
    isCompetitionResultEditingLocked(
      lifter
    )

  const missing =
    isAttemptMissingForCompetition(
      meet,
      lifter,
      lift,
      attemptKey
    )

  return `
    <div
      class="competition-attempt-cell attempt-${attempt.status} ${
        missing
          ? 'competition-missing-result-cell'
          : ''
      }"
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

      const subtotal =
        calculateCompetitionSubTotal(
          best
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
            <strong>${escapeHtml(getNonRegistrationLifterDisplayName(meet, lifter))}</strong>
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

          ${renderAttemptCell(meet, lifter, 'squat', 'attempt1', attempts.squat.attempt1)}
          ${renderAttemptCell(meet, lifter, 'squat', 'attempt2', attempts.squat.attempt2)}
          ${renderAttemptCell(meet, lifter, 'squat', 'attempt3', attempts.squat.attempt3)}

          ${renderAttemptCell(meet, lifter, 'bench', 'attempt1', attempts.bench.attempt1)}
          ${renderAttemptCell(meet, lifter, 'bench', 'attempt2', attempts.bench.attempt2)}
          ${renderAttemptCell(meet, lifter, 'bench', 'attempt3', attempts.bench.attempt3)}

          ${renderAttemptCell(meet, lifter, 'deadlift', 'attempt1', attempts.deadlift.attempt1)}
          ${renderAttemptCell(meet, lifter, 'deadlift', 'attempt2', attempts.deadlift.attempt2)}
          ${renderAttemptCell(meet, lifter, 'deadlift', 'attempt3', attempts.deadlift.attempt3)}

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
            data-attempt-subtotal="${lifter.id}"
          >
            ${formatCompetitionDisplayWeight(subtotal)}
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



function getPlatformManagerStatusPriority(
  status: PlatformManagerLifterStatus,
): number {

  switch (
    status
  ) {
    case 'disqualified':
      return 3

    case 'scratched':
      return 2

    case 'bombed':
      return 1

    default:
      return 0
  }
}


type PlatformRegistrationState =
  | 'incomplete'
  | 'division-required'


type PlatformImportedLifter =
  Lifter & {
    platformRegistrationState?:
      PlatformRegistrationState

    platformManagerCreated?:
      boolean
  }


function isPlatformManagerCreatedLifter(
  lifter: Lifter,
): boolean {

  return (
    (
      lifter as
        PlatformImportedLifter
    ).platformManagerCreated ===
    true
  )
}


function getPlatformRegistrationState(
  lifter: Lifter,
): PlatformRegistrationState | undefined {

  return (
    lifter as PlatformImportedLifter
  ).platformRegistrationState
}


function isPlatformRegistrationIncomplete(
  lifter: Lifter,
): boolean {

  return getPlatformRegistrationState(
    lifter
  ) !== undefined
}


function isPlatformDivisionRequired(
  lifter: Lifter,
): boolean {

  return getPlatformRegistrationState(
    lifter
  ) === 'division-required'
}


function setPlatformRegistrationState(
  lifter: Lifter,
  state: PlatformRegistrationState | undefined,
): void {

  const imported =
    lifter as PlatformImportedLifter

  if (
    state === undefined
  ) {
    delete imported.platformRegistrationState
  } else {
    imported.platformRegistrationState =
      state
  }
}


function setPlatformRegistrationIncomplete(
  lifter: Lifter,
  incomplete: boolean,
): void {

  setPlatformRegistrationState(
    lifter,
    incomplete
      ? 'incomplete'
      : undefined
  )
}


function hasCompletePlatformRegistration(
  lifter: Lifter,
): boolean {

  return (
    lifter.firstName.trim() !== '' &&
    lifter.lastName.trim() !== '' &&
    lifter.teamId !== null &&
    lifter.bodyWeight !== null &&
    Number.isFinite(lifter.bodyWeight) &&
    lifter.bodyWeight > 0
  )
}


function refreshPlatformRegistrationState(
  lifter: Lifter,
): void {

  if (
    !isPlatformRegistrationIncomplete(
      lifter
    )
  ) {
    return
  }

  if (
    hasCompletePlatformRegistration(
      lifter
    )
  ) {
    setPlatformRegistrationIncomplete(
      lifter,
      false
    )
  }
}


function inferPlatformManagerDivisionId(
  submission: PlatformManagerSubmission,
  lifterByNumber: Map<number, Lifter>,
): number | null {

  const divisionIds =
    new Set<number>()

  for (
    const row of submission.rows
  ) {
    const known =
      lifterByNumber.get(
        row.lifterNumber
      )

    if (
      known === undefined ||
      isPlatformRegistrationIncomplete(
        known
      )
    ) {
      continue
    }

    divisionIds.add(
      known.divisionId
    )
  }

  if (
    divisionIds.size !== 1
  ) {
    return null
  }

  return [...divisionIds][0]
}


function createPlatformIncompleteLifter(
  meet: LocalMeet,
  lifterNumber: number,
  divisionId: number | null,
): Lifter {

  const lifter:
    Lifter = {
      id:
        getNextLifterId(
          meet.state
        ),
      lifterNumber,
      firstName: '',
      lastName: '',
      divisionId:
        divisionId ?? 0,
      teamId: null,
      bodyWeight: null,
      weightClass: null,
      weightClassSource:
        'automatic',
      equipmentType:
        'equipped',
      age: null,
      grade: null,
      status: 'active',
      isGuest: false,
      isExtraLifter: false,
      declaredDeadliftOpener:
        null,
    };

  (
    lifter as
      PlatformImportedLifter
  ).platformManagerCreated =
    true

  setPlatformRegistrationState(
    lifter,
    divisionId === null
      ? 'division-required'
      : 'incomplete'
  )

  meet.state.lifters.push(
    lifter
  )

  return lifter
}


function applyPlatformManagerSubmissions(
  meet: LocalMeet,
  submissions: PlatformManagerSubmission[],
): {
  rowCount: number
  lifterCount: number
  addedLifters: Array<{
    lifterNumber: number
    divisionId: number | null
    divisionName: string
  }>
} {

  const lifterByNumber =
    new Map<number, Lifter>(
      meet.state.lifters.map(
        lifter => [
          lifter.lifterNumber,
          lifter,
        ]
      )
    )

  const importedStatuses =
    new Map<number, PlatformManagerLifterStatus>()

  let rowCount = 0

  const addedLifters:
    Array<{
      lifterNumber: number
      divisionId: number | null
      divisionName: string
    }> =
      []

  for (
    const submission of submissions
  ) {
    for (
      const row of submission.rows
    ) {
      let lifter =
        lifterByNumber.get(
          row.lifterNumber
        )

      if (
        lifter === undefined
      ) {
        const divisionId =
          inferPlatformManagerDivisionId(
            submission,
            lifterByNumber
          )

        lifter =
          createPlatformIncompleteLifter(
            meet,
            row.lifterNumber,
            divisionId
          )

        lifterByNumber.set(
          row.lifterNumber,
          lifter
        )

        const division =
          divisionId === null
            ? undefined
            : meet.state.divisions.find(
                item =>
                  item.id ===
                  divisionId
              )

        addedLifters.push({
          lifterNumber:
            row.lifterNumber,
          divisionId,
          divisionName:
            divisionId === null
              ? 'Division Required'
              : division?.name ??
                `Division ${divisionId}`,
        })
      }

      if (
        submission.descriptor.mode ===
        'best-lifts'
      ) {
        const results =
          ensureBestLiftResults(
            lifter
          )

        results[
          submission.descriptor.lift
        ] =
          row.result === 'good' &&
          row.weight > 0
            ? row.weight
            : null
      } else {
        const attemptKey =
          `attempt${row.round}` as
            CompetitionAttemptKey

        const attempt =
          ensureAllAttemptResults(
            lifter
          )[
            submission.descriptor.lift
          ][attemptKey]

        attempt.weight =
          row.weight

        attempt.status =
          row.result
      }

      const existingStatus =
        importedStatuses.get(
          lifter.id
        )

      if (
        existingStatus === undefined ||
        getPlatformManagerStatusPriority(
          row.status
        ) >
        getPlatformManagerStatusPriority(
          existingStatus
        )
      ) {
        importedStatuses.set(
          lifter.id,
          row.status
        )
      }

      rowCount += 1
    }
  }

  for (
    const [
      lifterId,
      importedStatus,
    ] of importedStatuses
  ) {
    const lifter =
      meet.state.lifters.find(
        item =>
          item.id ===
          lifterId
      )

    if (
      lifter === undefined
    ) {
      continue
    }

    if (
      importedStatus ===
      'disqualified'
    ) {
      lifter.status =
        'disqualified'
    } else if (
      importedStatus ===
      'scratched'
    ) {
      lifter.status =
        'scratched'
    } else if (
      importedStatus ===
        'bombed' ||
      hasThreeFailedAttemptsOnLift(
        lifter
      )
    ) {
      lifter.status =
        'bombed'
    } else {
      lifter.status =
        'active'
    }
  }

  return {
    rowCount,
    lifterCount:
      importedStatuses.size,
    addedLifters,
  }
}


function getPlatformImportIssues(
  meet: LocalMeet,
): Lifter[] {

  return meet.state.lifters
    .filter(
      lifter =>
        isPlatformRegistrationIncomplete(
          lifter
        )
    )
    .sort(
      (a, b) => {
        const aDivision =
          isPlatformDivisionRequired(a)
            ? Number.MAX_SAFE_INTEGER
            : a.divisionId

        const bDivision =
          isPlatformDivisionRequired(b)
            ? Number.MAX_SAFE_INTEGER
            : b.divisionId

        return (
          aDivision - bDivision ||
          a.lifterNumber - b.lifterNumber
        )
      }
    )
}


function getPlatformIssueLabel(
  lifter: Lifter,
): string {

  return isPlatformDivisionRequired(
    lifter
  )
    ? 'Division Required'
    : 'Platform Incomplete'
}


function renderPlatformIssueTeamOptions(
  meet: LocalMeet,
  divisionId: number,
  selectedTeamId: number | null,
): string {

  const teams =
    getTeamsForDivision(
      meet,
      divisionId
    )

  return `
    <option value="">Select team</option>
    ${
      teams
        .map(
          team =>
            `<option value="${team.id}" ${selectedTeamId === team.id ? 'selected' : ''}>${escapeHtml(team.name)}${team.isBTeam === true ? ' (B Team)' : ''}</option>`
        )
        .join('')
    }
  `
}


function renderPlatformImportIssues(): string {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return `
      <main class="workspace registration-workspace">
        <section class="workspace-panel" style="padding: 18px;">
          <strong>No Meet Selected</strong>
        </section>
      </main>
    `
  }

  const issues =
    getPlatformImportIssues(
      meet
    )

  if (
    issues.length === 0
  ) {
    return `
      <main class="workspace registration-workspace">
        <section class="workspace-panel" style="padding: 18px;">
          <div style="display:flex; justify-content:space-between; gap:12px; align-items:center;">
            <div>
              <strong>Platform Import Issues</strong>
              <div style="margin-top:6px;">There are no unresolved PlatformManager import issues.</div>
            </div>
            <button id="returnToRegistrationFromIssues" type="button" class="compact-button">Return to Registration</button>
          </div>
        </section>
      </main>
    `
  }

  return `
    <main class="workspace registration-workspace">
      <section class="workspace-panel" style="padding: 16px; overflow:auto;">
        <div style="display:flex; justify-content:space-between; gap:16px; align-items:flex-start; margin-bottom:14px;">
          <div>
            <strong style="font-size:1.05rem;">Platform Import Issues</strong>
            <div style="margin-top:5px; max-width:900px;">
              Complete the missing registration information below. PowerScore will not guess a division when the PlatformManager file does not identify one unambiguously.
            </div>
          </div>
          <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end;">
            <button id="createDivisionFromIssues" type="button" class="compact-button">+ Create Division</button>
            <button id="savePlatformIssues" type="button" class="compact-button">Save Completed Lifters</button>
            <button id="returnToRegistrationFromIssues" type="button" class="compact-button">Close</button>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:90px minmax(170px,1.15fr) minmax(135px,1fr) minmax(135px,1fr) minmax(180px,1.2fr) 95px minmax(150px,1fr); gap:6px 8px; align-items:center; min-width:980px;">
          <strong>Lifter #</strong>
          <strong>Division</strong>
          <strong>First Name</strong>
          <strong>Last Name</strong>
          <strong>Team</strong>
          <strong>BWT</strong>
          <strong>Issue</strong>

          ${
            issues
              .map(
                lifter => {
                  const divisionValid =
                    meet.state.divisions.some(
                      division =>
                        division.id ===
                        lifter.divisionId
                    ) &&
                    !isPlatformDivisionRequired(
                      lifter
                    )

                  return `
                    <div data-platform-issue-row="${lifter.id}" style="display:contents;">
                      <strong>#${lifter.lifterNumber}</strong>

                      <select data-platform-issue-division="${lifter.id}" class="grid-select">
                        <option value="">Select division</option>
                        ${
                          meet.state.divisions
                            .map(
                              division =>
                                `<option value="${division.id}" ${divisionValid && lifter.divisionId === division.id ? 'selected' : ''}>${escapeHtml(division.name)}</option>`
                            )
                            .join('')
                        }
                      </select>

                      <input data-platform-issue-first="${lifter.id}" class="grid-input" type="text" value="${escapeHtml(lifter.firstName)}" placeholder="First name">

                      <input data-platform-issue-last="${lifter.id}" class="grid-input" type="text" value="${escapeHtml(lifter.lastName)}" placeholder="Last name">

                      <select data-platform-issue-team="${lifter.id}" class="grid-select" ${divisionValid ? '' : 'disabled'}>
                        ${
                          divisionValid
                            ? renderPlatformIssueTeamOptions(
                                meet,
                                lifter.divisionId,
                                lifter.teamId
                              )
                            : '<option value="">Select division first</option>'
                        }
                      </select>

                      <input data-platform-issue-bwt="${lifter.id}" class="grid-input number-input" type="number" min="0" step="0.1" value="${lifter.bodyWeight ?? ''}" placeholder="BWT">

                      <div class="readiness ${isPlatformDivisionRequired(lifter) ? 'needs-attention' : ''}">
                        ${getPlatformIssueLabel(lifter)}
                      </div>
                    </div>
                  `
                }
              )
              .join('')
          }
        </div>

        <div style="margin-top:14px;">
          <strong>Required to clear an issue:</strong>
          Division, first name, last name, team, and body weight. Weight class is recalculated automatically from the selected division and BWT. Competition status is preserved.
        </div>
      </section>
    </main>
  `
}


function wirePlatformImportIssues(): void {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }

  document
    .querySelector<HTMLButtonElement>(
      '#returnToRegistrationFromIssues'
    )
    ?.addEventListener(
      'click',
      () => {
        currentPage =
          'registration'

        renderApp()
      }
    )

  document
    .querySelector<HTMLButtonElement>(
      '#createDivisionFromIssues'
    )
    ?.addEventListener(
      'click',
      () => {
        currentPage =
          'registration'

        activeEntry =
          'division'

        selectedTeamId =
          null

        renderApp()

        focusElement(
          '#newDivisionName'
        )
      }
    )

  document
    .querySelectorAll<HTMLSelectElement>(
      '[data-platform-issue-division]'
    )
    .forEach(
      divisionSelect =>
        divisionSelect.addEventListener(
          'change',
          () => {
            const lifterId =
              Number(
                divisionSelect.dataset.platformIssueDivision
              )

            const teamSelect =
              document.querySelector<HTMLSelectElement>(
                `[data-platform-issue-team="${lifterId}"]`
              )

            if (
              teamSelect === null
            ) {
              return
            }

            const divisionId =
              Number(
                divisionSelect.value
              )

            if (
              !Number.isFinite(divisionId) ||
              divisionId <= 0
            ) {
              teamSelect.disabled =
                true

              teamSelect.innerHTML =
                '<option value="">Select division first</option>'

              return
            }

            teamSelect.disabled =
              false

            teamSelect.innerHTML =
              renderPlatformIssueTeamOptions(
                meet,
                divisionId,
                null
              )
          }
        )
    )

  document
    .querySelector<HTMLButtonElement>(
      '#savePlatformIssues'
    )
    ?.addEventListener(
      'click',
      () => {
        const issues =
          getPlatformImportIssues(
            meet
          )

        let completed = 0
        let remaining = 0

        for (
          const lifter of issues
        ) {
          const divisionSelect =
            document.querySelector<HTMLSelectElement>(
              `[data-platform-issue-division="${lifter.id}"]`
            )

          const firstInput =
            document.querySelector<HTMLInputElement>(
              `[data-platform-issue-first="${lifter.id}"]`
            )

          const lastInput =
            document.querySelector<HTMLInputElement>(
              `[data-platform-issue-last="${lifter.id}"]`
            )

          const teamSelect =
            document.querySelector<HTMLSelectElement>(
              `[data-platform-issue-team="${lifter.id}"]`
            )

          const bodyWeightInput =
            document.querySelector<HTMLInputElement>(
              `[data-platform-issue-bwt="${lifter.id}"]`
            )

          if (
            divisionSelect === null ||
            firstInput === null ||
            lastInput === null ||
            teamSelect === null ||
            bodyWeightInput === null
          ) {
            remaining += 1
            continue
          }

          const divisionId =
            Number(
              divisionSelect.value
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
            setPlatformRegistrationState(
              lifter,
              'division-required'
            )

            lifter.teamId =
              null

            remaining += 1
            continue
          }

          lifter.divisionId =
            division.id

          lifter.firstName =
            firstInput.value.trim()

          lifter.lastName =
            lastInput.value.trim()

          const teamId =
            Number(
              teamSelect.value
            )

          lifter.teamId =
            meet.state.teams.some(
              team =>
                team.id === teamId &&
                getTeamsForDivision(
                  meet,
                  division.id
                ).some(
                  divisionTeam =>
                    divisionTeam.id === team.id
                )
            )
              ? teamId
              : null

          const bodyWeight =
            Number(
              bodyWeightInput.value
            )

          lifter.bodyWeight =
            Number.isFinite(bodyWeight) &&
            bodyWeight > 0
              ? bodyWeight
              : null

          if (
            lifter.bodyWeight !== null
          ) {
            try {
              const rules =
                getDivisionRules(
                  division
                )

              lifter.weightClass =
                getAutomaticWeightClass(
                  lifter.bodyWeight,
                  rules.weightClasses
                )

              lifter.weightClassSource =
                'automatic'
            } catch {
              lifter.weightClass =
                null
            }
          } else {
            lifter.weightClass =
              null
          }

          if (
            hasCompletePlatformRegistration(
              lifter
            )
          ) {
            setPlatformRegistrationState(
              lifter,
              undefined
            )

            completed += 1
          } else {
            setPlatformRegistrationState(
              lifter,
              'incomplete'
            )

            remaining += 1
          }
        }

        if (
          remaining === 0
        ) {
          currentPage =
            'registration'
        }

        renderApp()

        window.alert(
          remaining === 0
            ? `Platform issues resolved. ${completed} lifter(s) completed.`
            : `${completed} lifter(s) completed. ${remaining} issue(s) still require information.`
        )
      }
    )
}



function resetSelectedCompetitionDivision():
  void {

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

  const lifters =
    meet.state.lifters.filter(
      lifter =>
        lifter.divisionId ===
        division.id
    )

  if (
    lifters.length === 0
  ) {
    window.alert(
      'There are no lifters in the selected division to reset.'
    )

    return
  }

  if (
    !window.confirm(
      `Reset ${division.name} for testing?\n\nThis will clear all competition weights/results for ${lifters.length} lifter(s) and return BO/SC/DQ lifter status to Active.\n\nRegistration data will not be changed.`
    )
  ) {
    return
  }

  for (
    const lifter of lifters
  ) {
    lifter.status =
      'active'

    lifter.bestLiftResults = {
      squat: null,
      bench: null,
      deadlift: null,
    }

    lifter.allAttemptResults =
      createEmptyAllAttemptResults()

    competitionAutoBombedLifterIds.delete(
      lifter.id
    )
  }

  renderApp()

  window.alert(
    `${division.name} has been reset for testing.`
  )
}


function getPlatformResultSetLabel(
  filename: string,
): string {

  try {
    const descriptor =
      parsePlatformManagerFilename(
        filename
      )

    return (
      descriptor.mode ===
      'best-lifts'
        ? 'BestLifts'
        : `Round ${descriptor.round}`
    )
  } catch {
    return 'Unknown'
  }
}


function getPlatformResultLiftLabel(
  filename: string,
): string {

  try {
    const descriptor =
      parsePlatformManagerFilename(
        filename
      )

    switch (
      descriptor.lift
    ) {
      case 'squat':
        return 'Squat'

      case 'bench':
        return 'Bench'

      case 'deadlift':
        return 'Deadlift'
    }
  } catch {
    return 'Unknown'
  }
}


function getPlatformResultPlatformLabel(
  filename: string,
): string {

  try {
    const descriptor =
      parsePlatformManagerFilename(
        filename
      )

    return descriptor.platform
  } catch {
    return '?'
  }
}


function isPlatformResultFileCompatible(
  meet: LocalMeet,
  filename: string,
): boolean {

  try {
    const descriptor =
      parsePlatformManagerFilename(
        filename
      )

    const expectedMode =
      meet.state.meet
        .resultEntryMode ===
        'all-attempts'
          ? 'round'
          : 'best-lifts'

    return (
      descriptor.mode ===
      expectedMode
    )
  } catch {
    return false
  }
}


function sortPlatformResultFiles(
  files: Array<{
    name: string
  }>,
): Array<{
  name: string
}> {

  const liftOrder =
    new Map<string, number>([
      ['squat', 1],
      ['bench', 2],
      ['deadlift', 3],
    ])

  return [
    ...files,
  ].sort(
    (a, b) => {
      try {
        const aDescriptor =
          parsePlatformManagerFilename(
            a.name
          )

        const bDescriptor =
          parsePlatformManagerFilename(
            b.name
          )

        const aPlatform =
          Number(
            aDescriptor.platform
          )

        const bPlatform =
          Number(
            bDescriptor.platform
          )

        if (
          Number.isFinite(
            aPlatform
          ) &&
          Number.isFinite(
            bPlatform
          ) &&
          aPlatform !==
          bPlatform
        ) {
          return (
            aPlatform -
            bPlatform
          )
        }

        const platformCompare =
          aDescriptor.platform.localeCompare(
            bDescriptor.platform,
            undefined,
            {
              numeric: true,
            }
          )

        if (
          platformCompare !==
          0
        ) {
          return platformCompare
        }

        const liftCompare =
          (
            liftOrder.get(
              aDescriptor.lift
            ) ??
            99
          ) -
          (
            liftOrder.get(
              bDescriptor.lift
            ) ??
            99
          )

        if (
          liftCompare !==
          0
        ) {
          return liftCompare
        }

        return (
          aDescriptor.round -
          bDescriptor.round
        )
      } catch {
        return a.name.localeCompare(
          b.name
        )
      }
    }
  )
}


function closePlatformResultsDialog():
  void {

  const dialog =
    document.querySelector<HTMLDialogElement>(
      '#platformResultsDialog'
    )

  if (
    dialog !== null
  ) {
    dialog.close()
    dialog.remove()
  }
}


function getOriginalProcessedPlatformFilename(
  filename: string,
): string {

  return filename.replace(
    /__20\d{2}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}(?=\.csv$)/i,
    ''
  )
}


function renderProcessedPlatformResultRows(
  files: Array<{
    name: string
  }>,
): string {

  if (
    files.length === 0
  ) {
    return `
      <tr>
        <td
          colspan="4"
          class="platform-results-empty"
        >
          No processed files for this MeetID.
        </td>
      </tr>
    `
  }

  return [
    ...files,
  ]
    .reverse()
    .map(
      file => {
        const originalName =
          getOriginalProcessedPlatformFilename(
            file.name
          )

        return `
          <tr>
            <td>
              ${escapeHtml(
                getPlatformResultPlatformLabel(
                  originalName
                )
              )}
            </td>
            <td>
              ${escapeHtml(
                getPlatformResultLiftLabel(
                  originalName
                )
              )}
            </td>
            <td>
              ${escapeHtml(
                getPlatformResultSetLabel(
                  originalName
                )
              )}
            </td>
            <td class="platform-results-filename">
              ${escapeHtml(file.name)}
            </td>
          </tr>
        `
      }
    )
    .join('')
}


function renderPlatformResultsDialog(
  meet: LocalMeet,
  availableFiles: Array<{
    name: string
  }>,
  processedFiles: Array<{
    name: string
  }>,
): void {

  closePlatformResultsDialog()

  const sortedAvailableFiles =
    sortPlatformResultFiles(
      availableFiles
    )

  const dialog =
    document.createElement(
      'dialog'
    )

  dialog.id =
    'platformResultsDialog'

  dialog.className =
    'platform-results-dialog platform-results-dialog-wide'

  const meetId =
    getNormalizedPlatformMeetId(
      meet
    )

  const availableRows =
    sortedAvailableFiles.length ===
      0
        ? `
          <tr>
            <td
              colspan="6"
              class="platform-results-empty"
            >
              No pending PlatformManager result files were found for this MeetID.
            </td>
          </tr>
        `
        : sortedAvailableFiles
          .map(
            file => {
              const compatible =
                isPlatformResultFileCompatible(
                  meet,
                  file.name
                )

              return `
                <tr class="${
                  compatible
                    ? ''
                    : 'platform-results-incompatible'
                }">
                  <td class="platform-results-select">
                    <input
                      type="checkbox"
                      name="platformResultFile"
                      value="${escapeHtml(file.name)}"
                      ${
                        compatible
                          ? ''
                          : 'disabled'
                      }
                      aria-label="Select ${escapeHtml(file.name)}"
                    >
                  </td>
                  <td>
                    ${escapeHtml(
                      getPlatformResultPlatformLabel(
                        file.name
                      )
                    )}
                  </td>
                  <td>
                    ${escapeHtml(
                      getPlatformResultLiftLabel(
                        file.name
                      )
                    )}
                  </td>
                  <td>
                    ${escapeHtml(
                      getPlatformResultSetLabel(
                        file.name
                      )
                    )}
                  </td>
                  <td class="platform-results-filename">
                    ${escapeHtml(file.name)}
                  </td>
                  <td>
                    ${
                      compatible
                        ? 'Ready'
                        : 'Different entry mode'
                    }
                  </td>
                </tr>
              `
            }
          )
          .join('')

  dialog.innerHTML = `
    <div class="platform-results-dialog-content">

      <div class="platform-results-dialog-header">
        <div>
          <strong>Platform Results Manager</strong>
          <span>
            MeetID ${escapeHtml(meetId)}
          </span>
        </div>

        <button
          id="closePlatformResultsDialog"
          type="button"
          class="compact-button secondary-button"
        >
          Close
        </button>
      </div>

      <p class="platform-results-help">
        Select one or more available result files to import. Files are imported sequentially and moved to Processed only after each file imports successfully.
      </p>

      <div class="platform-results-two-pane">

        <section class="platform-results-pane">
          <div class="platform-results-pane-header">
            <strong>Available</strong>

            <label class="platform-results-select-all">
              <input
                id="selectAllPlatformResults"
                type="checkbox"
              >
              Select all ready
            </label>
          </div>

          <div class="platform-results-table-wrap">
            <table class="platform-results-table platform-results-table-available">
              <thead>
                <tr>
                  <th></th>
                  <th>Plat</th>
                  <th>Lift</th>
                  <th>Set</th>
                  <th>Filename</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${availableRows}
              </tbody>
            </table>
          </div>
        </section>

        <section class="platform-results-pane">
          <div class="platform-results-pane-header">
            <strong>Processed</strong>
            <span>
              ${processedFiles.length} file(s)
            </span>
          </div>

          <div class="platform-results-table-wrap">
            <table class="platform-results-table platform-results-table-processed">
              <thead>
                <tr>
                  <th>Plat</th>
                  <th>Lift</th>
                  <th>Set</th>
                  <th>Filename</th>
                </tr>
              </thead>
              <tbody>
                ${renderProcessedPlatformResultRows(
                  processedFiles
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      <div class="platform-results-dialog-actions">
        <span>
          ${
            sortedAvailableFiles.length
          }
          available file(s)
        </span>

        <div>
          <button
            id="refreshPlatformResults"
            type="button"
            class="compact-button secondary-button"
          >
            Refresh
          </button>

          <button
            id="importSelectedPlatformResults"
            type="button"
            class="compact-button"
            ${
              sortedAvailableFiles.some(
                file =>
                  isPlatformResultFileCompatible(
                    meet,
                    file.name
                  )
              )
                ? ''
                : 'disabled'
            }
          >
            Import Selected Files
          </button>
        </div>
      </div>

    </div>
  `

  document.body.appendChild(
    dialog
  )

  dialog
    .querySelector<HTMLButtonElement>(
      '#closePlatformResultsDialog'
    )
    ?.addEventListener(
      'click',
      () => {
        closePlatformResultsDialog()
      }
    )

  dialog
    .querySelector<HTMLButtonElement>(
      '#refreshPlatformResults'
    )
    ?.addEventListener(
      'click',
      () => {
        void refreshPlatformResultsDialog()
      }
    )

  dialog
    .querySelector<HTMLInputElement>(
      '#selectAllPlatformResults'
    )
    ?.addEventListener(
      'change',
      event => {
        const checked =
          (
            event.currentTarget as
              HTMLInputElement
          ).checked

        dialog
          .querySelectorAll<HTMLInputElement>(
            'input[name="platformResultFile"]:not(:disabled)'
          )
          .forEach(
            checkbox => {
              checkbox.checked =
                checked
            }
          )
      }
    )

  dialog
    .querySelector<HTMLButtonElement>(
      '#importSelectedPlatformResults'
    )
    ?.addEventListener(
      'click',
      () => {
        void importSelectedPlatformResults()
      }
    )

  dialog.addEventListener(
    'cancel',
    event => {
      event.preventDefault()
      closePlatformResultsDialog()
    }
  )

  dialog.showModal()
}


function isTrainingMeet(
  meet: LocalMeet,
): boolean {

  return (
    meet.state.meet.id ===
      TRAINING_BEST_LIFT_MEET_ID ||
    meet.state.meet.id ===
      TRAINING_ALL_ATTEMPTS_MEET_ID
  )
}


async function listAvailablePlatformResultFiles(
  meet: LocalMeet,
): Promise<Array<{
  name: string
}>> {

  if (
    isTrainingMeet(
      meet
    )
  ) {
    return listTrainingPlatformManagerFiles(
      getNormalizedPlatformMeetId(
        meet
      )
    )
  }

  return listPlatformManagerSubmissions(
    PLATFORM_MANAGER_HANDLER_URL,
    getNormalizedPlatformMeetId(
      meet
    )
  )
}


async function listProcessedPlatformResultFiles(
  meet: LocalMeet,
): Promise<Array<{
  name: string
}>> {

  if (
    isTrainingMeet(
      meet
    )
  ) {
    return listProcessedTrainingPlatformManagerFiles(
      getNormalizedPlatformMeetId(
        meet
      )
    )
  }

  return listProcessedPlatformManagerSubmissions(
    PLATFORM_MANAGER_HANDLER_URL,
    getNormalizedPlatformMeetId(
      meet
    )
  )
}


async function getPlatformResultCsvForMeet(
  meet: LocalMeet,
  filename: string,
): Promise<string> {

  if (
    isTrainingMeet(
      meet
    )
  ) {
    return getTrainingPlatformManagerCsv(
      getNormalizedPlatformMeetId(
        meet
      ),
      filename
    )
  }

  return getPlatformManagerSubmissionCsv(
    PLATFORM_MANAGER_HANDLER_URL,
    filename
  )
}


async function markPlatformResultProcessedForMeet(
  meet: LocalMeet,
  filename: string,
): Promise<void> {

  if (
    isTrainingMeet(
      meet
    )
  ) {
    markTrainingPlatformManagerFileProcessed(
      getNormalizedPlatformMeetId(
        meet
      ),
      filename
    )

    return
  }

  await markPlatformManagerSubmissionProcessed(
    PLATFORM_MANAGER_HANDLER_URL,
    filename
  )
}


async function loadPlatformResultFileLists(
  meet: LocalMeet,
): Promise<{
  availableFiles: Array<{
    name: string
  }>
  processedFiles: Array<{
    name: string
  }>
}> {

  const [
    availableFiles,
    processedFiles,
  ] =
    await Promise.all([
      listAvailablePlatformResultFiles(
        meet
      ),
      listProcessedPlatformResultFiles(
        meet
      ),
    ])

  return {
    availableFiles,
    processedFiles,
  }
}


async function refreshPlatformResultsDialog():
  Promise<void> {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    closePlatformResultsDialog()
    return
  }

  const meetId =
    getNormalizedPlatformMeetId(
      meet
    )

  if (
    !/^[A-Z]{4}\d{4}$/.test(
      meetId
    )
  ) {
    closePlatformResultsDialog()

    window.alert(
      'Generate a Platform MeetID on Registration before checking PlatformManager results.'
    )

    return
  }

  try {
    const {
      availableFiles,
      processedFiles,
    } =
      await loadPlatformResultFileLists(
        meet
      )

    pendingPlatformResultCountByMeetId.set(
      meetId,
      availableFiles.length
    )

    updatePlatformResultsAvailabilityButton(
      availableFiles.length
    )

    renderPlatformResultsDialog(
      meet,
      availableFiles,
      processedFiles
    )
  } catch (
    error
  ) {
    closePlatformResultsDialog()

    window.alert(
      error instanceof Error
        ? error.message
        : 'Unable to retrieve PlatformManager results.'
    )
  }
}


async function importSelectedPlatformResults():
  Promise<void> {

  const meet =
    getSelectedMeet()

  const dialog =
    document.querySelector<HTMLDialogElement>(
      '#platformResultsDialog'
    )

  if (
    meet === undefined ||
    dialog === null
  ) {
    return
  }

  const selectedFiles =
    Array.from(
      dialog.querySelectorAll<HTMLInputElement>(
        'input[name="platformResultFile"]:checked'
      )
    )
      .map(
        checkbox =>
          checkbox.value
      )

  if (
    selectedFiles.length === 0
  ) {
    window.alert(
      'Select at least one PlatformManager result file to import.'
    )

    return
  }

  const importButton =
    dialog.querySelector<HTMLButtonElement>(
      '#importSelectedPlatformResults'
    )

  if (
    importButton !== null
  ) {
    importButton.disabled =
      true

    importButton.textContent =
      `Importing 0 of ${selectedFiles.length}...`
  }

  const meetId =
    getNormalizedPlatformMeetId(
      meet
    )

  const expectedMode =
    meet.state.meet
      .resultEntryMode ===
      'all-attempts'
        ? 'round'
        : 'best-lifts'

  let importedFileCount = 0
  let importedRowCount = 0
  const updatedLifterIds =
    new Set<number>()

  try {
    for (
      let index = 0;
      index < selectedFiles.length;
      index += 1
    ) {
      const filename =
        selectedFiles[index]

      if (
        importButton !== null
      ) {
        importButton.textContent =
          `Importing ${index + 1} of ${selectedFiles.length}...`
      }

      const csv =
        await getPlatformResultCsvForMeet(
          meet,
          filename
        )

      const submission =
        parsePlatformManagerSubmission(
          filename,
          csv,
          meetId
        )

      if (
        submission.descriptor.mode !==
        expectedMode
      ) {
        throw new Error(
          `${filename} does not match this meet's Competition result-entry mode.`
        )
      }

      const summary =
        applyPlatformManagerSubmissions(
          meet,
          [
            submission,
          ]
        )

      await markPlatformResultProcessedForMeet(
        meet,
        filename
      )

      importedFileCount +=
        1

      importedRowCount +=
        summary.rowCount

      for (
        const lifter of
        meet.state.lifters
      ) {
        if (
          submission.rows.some(
            row =>
              row.lifterNumber ===
              lifter.lifterNumber
          )
        ) {
          updatedLifterIds.add(
            lifter.id
          )
        }
      }
    }

    renderApp()

    void refreshPlatformResultsAvailability()

    let message =
      `PlatformManager import complete.\n\n` +
      `Files imported: ${importedFileCount}\n` +
      `Rows imported: ${importedRowCount}\n` +
      `Lifters updated: ${updatedLifterIds.size}`

    const issues =
      getPlatformImportIssues(
        meet
      )

    if (
      issues.length > 0
    ) {
      const divisionRequiredCount =
        issues.filter(
          issue =>
            issue.divisionId ===
            null
        ).length

      message +=
        `\n\nPlatform issues found: ${issues.length}` +
        `\n  Incomplete lifters: ${issues.length - divisionRequiredCount}` +
        `\n  Division required: ${divisionRequiredCount}`
    }

    window.alert(
      message
    )

    if (
      issues.length > 0
    ) {
      closePlatformResultsDialog()

      currentPage =
        'platform-issues'

      renderApp()

      return
    }

    await refreshPlatformResultsDialog()
  } catch (
    error
  ) {
    const detail =
      error instanceof Error
        ? error.message
        : 'Unknown import error.'

    window.alert(
      `PlatformManager import stopped.\n\n` +
      `Files successfully imported before the error: ${importedFileCount}\n\n` +
      detail
    )

    await refreshPlatformResultsDialog()
  }
}


function getPendingPlatformResultCount(
  meet: LocalMeet,
): number {

  const meetId =
    getNormalizedPlatformMeetId(
      meet
    )

  return (
    pendingPlatformResultCountByMeetId.get(
      meetId
    ) ??
    0
  )
}


function updatePlatformResultsAvailabilityButton(
  count: number,
): void {

  const button =
    document.querySelector<HTMLButtonElement>(
      '#checkPlatformResults'
    )

  if (
    button === null
  ) {
    return
  }

  button.classList.toggle(
    'platform-results-available',
    count > 0
  )

  button.textContent =
    count > 0
      ? `Check for Platform Results (${count})`
      : 'Check for Platform Results'

  button.title =
    count > 0
      ? `${count} pending PlatformManager result file(s) are available for this meet.`
      : 'No pending PlatformManager result files are currently available.'
}


async function refreshPlatformResultsAvailability():
  Promise<void> {

  if (
    currentPage !==
    'competition'
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

  const meetId =
    getNormalizedPlatformMeetId(
      meet
    )

  if (
    !/^[A-Z]{4}\d{4}$/.test(
      meetId
    )
  ) {
    pendingPlatformResultCountByMeetId.set(
      meetId,
      0
    )

    updatePlatformResultsAvailabilityButton(
      0
    )

    return
  }

  try {
    const files =
      await listAvailablePlatformResultFiles(
        meet
      )

    const count =
      files.length

    pendingPlatformResultCountByMeetId.set(
      meetId,
      count
    )

    updatePlatformResultsAvailabilityButton(
      count
    )
  } catch {
    // Background availability checks are advisory only.
    // Do not interrupt the meet clerk if one check fails.
  }
}


function stopPlatformResultsAvailabilityPolling():
  void {

  if (
    platformResultsPollTimer !==
    null
  ) {
    window.clearInterval(
      platformResultsPollTimer
    )

    platformResultsPollTimer =
      null
  }
}


function startPlatformResultsAvailabilityPolling():
  void {

  stopPlatformResultsAvailabilityPolling()

  void refreshPlatformResultsAvailability()

  platformResultsPollTimer =
    window.setInterval(
      () => {
        void refreshPlatformResultsAvailability()
      },
      PLATFORM_RESULTS_POLL_INTERVAL_MS
    )
}


async function checkPlatformResults():
  Promise<void> {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }

  const meetId =
    getNormalizedPlatformMeetId(
      meet
    )

  if (
    !/^[A-Z]{4}\d{4}$/.test(
      meetId
    )
  ) {
    window.alert(
      'Generate a Platform MeetID on Registration before checking PlatformManager results.'
    )

    return
  }

  try {
    const {
      availableFiles,
      processedFiles,
    } =
      await loadPlatformResultFileLists(
        meet
      )

    pendingPlatformResultCountByMeetId.set(
      meetId,
      availableFiles.length
    )

    updatePlatformResultsAvailabilityButton(
      availableFiles.length
    )

    renderPlatformResultsDialog(
      meet,
      availableFiles,
      processedFiles
    )
  } catch (
    error
  ) {
    window.alert(
      error instanceof Error
        ? error.message
        : 'Unable to retrieve PlatformManager results.'
    )
  }
}


function getCompetitionProgressWeightClasses(
  meet: LocalMeet,
): string[] {

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return []
  }

  const classesWithLifters =
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

    return rules.weightClasses
      .map(
        weightClass =>
          weightClass.name
      )
      .filter(
        name =>
          classesWithLifters.has(
            name
          )
      )
  } catch {
    return Array.from(
      classesWithLifters
    ).sort(
      (a, b) =>
        a.localeCompare(
          b,
          undefined,
          {
            numeric: true,
          }
        )
    )
  }
}


function countBestLiftProgress(
  meet: LocalMeet,
  weightClass: string,
  lift: CompetitionLift,
): number {

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return 0
  }

  return countBestLiftProgressResults(
    meet.state.lifters,
    division.id,
    weightClass,
    lift
  )
}


function countAttemptProgress(
  meet: LocalMeet,
  weightClass: string,
  lift: CompetitionLift,
  attemptKey: CompetitionAttemptKey,
): number {

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return 0
  }

  return countAttemptProgressResults(
    meet.state.lifters,
    division.id,
    weightClass,
    lift,
    attemptKey
  )
}


function getCompetitionProgressClassTotal(
  meet: LocalMeet,
  weightClass: string,
): number {

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return 0
  }

  return meet.state.lifters.filter(
    lifter =>
      lifter.divisionId ===
        division.id &&
      lifter.weightClass ===
        weightClass
  ).length
}


function getCompetitionProgressNoBwtLifters(
  meet: LocalMeet,
): Lifter[] {

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return []
  }

  return getNoBwtProgressLifters(
    meet.state.lifters,
    division.id
  )
}


function countBestLiftProgressNoBwt(
  meet: LocalMeet,
  lift: CompetitionLift,
): number {

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return 0
  }

  return countBestLiftProgressResultsNoBwt(
    meet.state.lifters,
    division.id,
    lift
  )
}


function countAttemptProgressNoBwt(
  meet: LocalMeet,
  lift: CompetitionLift,
  attemptKey: CompetitionAttemptKey,
): number {

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return 0
  }

  return countAttemptProgressResultsNoBwt(
    meet.state.lifters,
    division.id,
    lift,
    attemptKey
  )
}


function getCompetitionProgressResultCellClass(
  count: number,
  expectedTotal: number,
): string {

  switch (
    getCompetitionProgressCellState(
      count,
      expectedTotal
    )
  ) {
    case 'complete':
      return 'competition-progress-cell-complete'

    case 'short':
      return 'competition-progress-cell-short'

    case 'zero':
      return 'competition-progress-cell-zero'

    case 'empty':
    default:
      return 'competition-progress-cell-empty'
  }
}


function getCompetitionProgressExpectedLiftersForClass(
  meet: LocalMeet,
  weightClass: string,
): Lifter[] {

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return []
  }

  return getExpectedProgressLiftersForClass(
    meet.state.lifters,
    division.id,
    weightClass
  )
}


function getCompetitionProgressExpectedNoBwtLifters(
  meet: LocalMeet,
): Lifter[] {

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return []
  }

  return getExpectedNoBwtProgressLifters(
    meet.state.lifters,
    division.id
  )
}


function getCompetitionProgressLiftersForClass(
  meet: LocalMeet,
  weightClass: string,
): Lifter[] {

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return []
  }

  return meet.state.lifters.filter(
    lifter =>
      lifter.divisionId ===
        division.id &&
      lifter.weightClass ===
        weightClass
  )
}


function countCompetitionProgressStatus(
  meet: LocalMeet,
  weightClass: string,
  status:
    | 'bombed'
    | 'scratched'
    | 'disqualified',
): number {

  return getCompetitionProgressLiftersForClass(
    meet,
    weightClass
  ).filter(
    lifter =>
      lifter.status ===
        status
  ).length
}


function countCompetitionProgressNeedsAttention(
  meet: LocalMeet,
  weightClass: string,
): number {

  return getCompetitionProgressLiftersForClass(
    meet,
    weightClass
  ).filter(
    lifter => {
      if (
        lifter.status !==
        'active'
      ) {
        return false
      }

      const readiness =
        getLifterReadinessLabel(
          lifter,
          meet
        )

      return (
        readiness ===
          'Needs Attention' ||
        readiness ===
          'Platform Incomplete' ||
        readiness ===
          'Division Required'
      )
    }
  ).length
}


function renderCompetitionProgressSummaryRows(
  meet: LocalMeet,
  weightClasses: string[],
  showNoBwt: boolean,
): string {

  const noBwtLifters =
    getCompetitionProgressNoBwtLifters(
      meet
    )

  const definitions:
    Array<{
      label: string
      getCount:
        (
          weightClass: string
        ) => number
      getNoBwtCount:
        () => number
      className: string
    }> = [
      {
        label: 'BO Lifters',
        getCount:
          weightClass =>
            countCompetitionProgressStatus(
              meet,
              weightClass,
              'bombed'
            ),
        getNoBwtCount:
          () =>
            noBwtLifters.filter(
              lifter =>
                lifter.status ===
                  'bombed'
            ).length,
        className:
          'competition-progress-summary-bo',
      },
      {
        label: 'SC Lifters',
        getCount:
          weightClass =>
            countCompetitionProgressStatus(
              meet,
              weightClass,
              'scratched'
            ),
        getNoBwtCount:
          () =>
            noBwtLifters.filter(
              lifter =>
                lifter.status ===
                  'scratched'
            ).length,
        className:
          'competition-progress-summary-sc',
      },
      {
        label: 'DQ Lifters',
        getCount:
          weightClass =>
            countCompetitionProgressStatus(
              meet,
              weightClass,
              'disqualified'
            ),
        getNoBwtCount:
          () =>
            noBwtLifters.filter(
              lifter =>
                lifter.status ===
                  'disqualified'
            ).length,
        className:
          'competition-progress-summary-dq',
      },
      {
        label: 'Needs Attention',
        getCount:
          weightClass =>
            countCompetitionProgressNeedsAttention(
              meet,
              weightClass
            ),
        getNoBwtCount:
          () =>
            noBwtLifters.filter(
              lifter =>
                lifter.status ===
                  'active'
            ).length,
        className:
          'competition-progress-summary-attention',
      },
      {
        label: 'Total Lifters',
        getCount:
          weightClass =>
            getCompetitionProgressClassTotal(
              meet,
              weightClass
            ),
        getNoBwtCount:
          () =>
            noBwtLifters.length,
        className:
          'competition-progress-summary-total',
      },
    ]

  return definitions
    .map(
      definition => `
        <tr class="competition-progress-summary-row ${definition.className}">
          <th>
            ${definition.label}
          </th>
          ${
            weightClasses
              .map(
                weightClass => `
                  <td>
                    ${definition.getCount(
                      weightClass
                    )}
                  </td>
                `
              )
              .join('')
          }

          ${
            showNoBwt
              ? `
                <td class="competition-progress-no-bwt-cell">
                  ${definition.getNoBwtCount()}
                </td>
              `
              : ''
          }
        </tr>
      `
    )
    .join('')
}


function renderCompetitionProgressGrid(
  meet: LocalMeet,
): string {

  const division =
    getSelectedDivision()

  if (
    division === undefined
  ) {
    return ''
  }

  const weightClasses =
    getCompetitionProgressWeightClasses(
      meet
    )

  const noBwtLifters =
    getCompetitionProgressNoBwtLifters(
      meet
    )

  const noBwtTotal =
    noBwtLifters.length

  const showNoBwt =
    noBwtTotal > 0

  if (
    weightClasses.length === 0 &&
    !showNoBwt
  ) {
    return ''
  }

  const headerCells =
    weightClasses
      .map(
        weightClass => `
          <th
            title="${getCompetitionProgressClassTotal(
              meet,
              weightClass
            )} lifter(s) registered in this class"
          >
            ${escapeHtml(weightClass)}
          </th>
        `
      )
      .join('') +
    (
      showNoBwt
        ? `
          <th
            class="competition-progress-no-bwt-header"
            title="${noBwtTotal} lifter(s) in this division have no valid body weight"
          >
            No BWT
          </th>
        `
        : ''
    )

  let rows =
    ''

  if (
    meet.state.meet
      .resultEntryMode ===
      'best-lift-only'
  ) {
    const rowDefinitions:
      Array<[
        string,
        CompetitionLift,
      ]> = [
        ['Squat', 'squat'],
        ['Bench', 'bench'],
        ['Deadlift', 'deadlift'],
      ]

    rows =
      rowDefinitions
        .map(
          ([
            label,
            lift,
          ]) => {

            const expectedNoBwtTotal =
              getCompetitionProgressExpectedNoBwtLifters(
                meet
              ).length

            const noBwtCount =
              countBestLiftProgressNoBwt(
                meet,
                lift
              )

            return `
              <tr>
                <th>${label}</th>
                ${
                  weightClasses
                    .map(
                      weightClass => {
                        const count =
                          countBestLiftProgress(
                            meet,
                            weightClass,
                            lift
                          )

                        const expectedTotal =
                          getCompetitionProgressExpectedLiftersForClass(
                            meet,
                            weightClass
                          ).length

                        return `
                          <td
                            class="${getCompetitionProgressResultCellClass(
                              count,
                              expectedTotal
                            )}"
                            title="${count} result(s); ${expectedTotal} active lifter(s) expected"
                          >
                            ${count}
                          </td>
                        `
                      }
                    )
                    .join('')
                }

                ${
                  showNoBwt
                    ? `
                      <td
                        class="competition-progress-no-bwt-cell ${getCompetitionProgressResultCellClass(
                          noBwtCount,
                          expectedNoBwtTotal
                        )}"
                        title="${noBwtCount} result(s); ${expectedNoBwtTotal} active no-BWT lifter(s) expected"
                      >
                        ${noBwtCount}
                      </td>
                    `
                    : ''
                }
              </tr>
            `
          }
        )
        .join('')
  } else {
    const lifts:
      Array<[
        string,
        CompetitionLift,
      ]> = [
        ['Squat', 'squat'],
        ['Bench', 'bench'],
        ['Deadlift', 'deadlift'],
      ]

    const attempts:
      Array<[
        string,
        CompetitionAttemptKey,
      ]> = [
        ['1st', 'attempt1'],
        ['2nd', 'attempt2'],
        ['3rd', 'attempt3'],
      ]

    rows =
      lifts
        .flatMap(
          ([
            liftLabel,
            lift,
          ]) =>
            attempts.map(
              ([
                attemptLabel,
                attemptKey,
              ]) => {

                const expectedNoBwtTotal =
                  getCompetitionProgressExpectedNoBwtLifters(
                    meet
                  ).length

                const noBwtCount =
                  countAttemptProgressNoBwt(
                    meet,
                    lift,
                    attemptKey
                  )

                return `
                  <tr>
                    <th>
                      ${attemptLabel} ${liftLabel}
                    </th>
                    ${
                      weightClasses
                        .map(
                          weightClass => {
                            const count =
                              countAttemptProgress(
                                meet,
                                weightClass,
                                lift,
                                attemptKey
                              )

                            const expectedTotal =
                              getCompetitionProgressExpectedLiftersForClass(
                                meet,
                                weightClass
                              ).length

                            return `
                              <td
                                class="${getCompetitionProgressResultCellClass(
                                  count,
                                  expectedTotal
                                )}"
                                title="${count} result(s); ${expectedTotal} active lifter(s) expected"
                              >
                                ${count}
                              </td>
                            `
                          }
                        )
                        .join('')
                    }

                    ${
                      showNoBwt
                        ? `
                          <td
                            class="competition-progress-no-bwt-cell ${getCompetitionProgressResultCellClass(
                              noBwtCount,
                              expectedNoBwtTotal
                            )}"
                            title="${noBwtCount} result(s); ${expectedNoBwtTotal} active no-BWT lifter(s) expected"
                          >
                            ${noBwtCount}
                          </td>
                        `
                        : ''
                    }
                  </tr>
                `
              }
            )
        )
        .join('')
  }

  const dividerColspan =
    weightClasses.length +
    1 +
    (
      showNoBwt
        ? 1
        : 0
    )

  return `
    <div class="competition-progress-panel">
      <div class="competition-progress-title">
        Data Entry Progress — ${escapeHtml(division.name)}
      </div>

      <div class="competition-progress-scroll">
        <table class="competition-progress-grid">
          <thead>
            <tr>
              <th>Results</th>
              ${headerCells}
            </tr>
          </thead>
          <tbody>
            ${rows}

            <tr class="competition-progress-divider-row">
              <td colspan="${dividerColspan}"></td>
            </tr>

            ${renderCompetitionProgressSummaryRows(
              meet,
              weightClasses,
              showNoBwt
            )}
          </tbody>
        </table>
      </div>
    </div>
  `
}


function closeCompetitionProgressDialog():
  void {

  const dialog =
    document.querySelector<HTMLDialogElement>(
      '#competitionProgressDialog'
    )

  if (
    dialog !== null
  ) {
    dialog.close()
    dialog.remove()
  }
}


function toggleMissingResultsReviewForSelectedDivision():
  void {

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

  const key =
    getMissingResultsReviewKey(
      meet,
      division.id
    )

  if (
    missingResultsReviewDivisions.has(
      key
    )
  ) {
    missingResultsReviewDivisions.delete(
      key
    )
  } else {
    missingResultsReviewDivisions.add(
      key
    )

    selectedCompetitionWeightClass =
      null

    rememberCompetitionWeightClass(
      meet
    )
  }

  renderApp()
}


function showCompetitionProgressDialog():
  void {

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

  closeCompetitionProgressDialog()

  const reviewEnabled =
    isMissingResultsReviewEnabled(
      meet,
      division.id
    )

  const dialog =
    document.createElement(
      'dialog'
    )

  dialog.id =
    'competitionProgressDialog'

  dialog.className =
    'competition-progress-dialog'

  dialog.innerHTML = `
    <div class="competition-progress-dialog-content">

      <div class="competition-progress-dialog-header">
        <div>
          <strong>Data Entry Progress</strong>
          <span>
            ${escapeHtml(division.name)}
          </span>
        </div>

        <div class="competition-progress-dialog-header-actions">
          <button
            id="closeCompetitionProgressDialog"
            type="button"
            class="compact-button secondary-button"
          >
            Close
          </button>
        </div>
      </div>

      ${
        reviewEnabled
          ? `
            <div class="competition-progress-review-note">
              Missing Results Review is ON. Every blank or zero result for an Active lifter is now treated as missing and is flagged on the Competition page.
            </div>
          `
          : `
            <div class="competition-progress-review-note neutral">
              Normal monitoring is active. Started result sets that are short are counted in Missing Results. Use the Review Missing Results button on the Competition page near the end of an event to scan all remaining blanks and zeros.
            </div>
          `
      }

      ${renderCompetitionProgressGrid(
        meet
      )}

    </div>
  `

  document.body.appendChild(
    dialog
  )

  dialog
    .querySelector<HTMLButtonElement>(
      '#closeCompetitionProgressDialog'
    )
    ?.addEventListener(
      'click',
      () => {
        closeCompetitionProgressDialog()
      }
    )

  dialog.addEventListener(
    'cancel',
    event => {
      event.preventDefault()
      closeCompetitionProgressDialog()
    }
  )

  dialog.showModal()
}


function updateCompetitionProgressGrid():
  void {

  const dialog =
    document.querySelector<HTMLDialogElement>(
      '#competitionProgressDialog'
    )

  if (
    dialog === null ||
    !dialog.open
  ) {
    return
  }

  showCompetitionProgressDialog()
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

        <div class="competition-division-toolbar">

          <div class="competition-division-toolbar-tabs">
            ${renderCompetitionDivisionTabs(meet)}
          </div>

          <div class="competition-division-toolbar-actions">
            <button
              id="resetCompetitionDivision"
              type="button"
              class="compact-button secondary-button"
              ${division === undefined ? 'disabled' : ''}
              title="Temporary testing control"
            >
              Reset Division
            </button>

            <button
              id="checkPlatformResults"
              type="button"
              class="compact-button secondary-button ${
                getPendingPlatformResultCount(
                  meet
                ) > 0
                  ? 'platform-results-available'
                  : ''
              } ${
                getNormalizedPlatformMeetId(
                  meet
                ) === ''
                  ? 'platform-results-meetid-missing'
                  : ''
              }"
              aria-disabled="${
                getNormalizedPlatformMeetId(
                  meet
                ) === ''
                  ? 'true'
                  : 'false'
              }"
              title="${
                getNormalizedPlatformMeetId(
                  meet
                ) === ''
                  ? 'Platform MeetID has not been set for this meet.'
                  : (
                      getPendingPlatformResultCount(
                        meet
                      ) > 0
                        ? `${getPendingPlatformResultCount(
                            meet
                          )} pending PlatformManager result file(s) are available for this meet.`
                        : 'No pending PlatformManager result files are currently available.'
                    )
              }"
            >
              ${
                getPendingPlatformResultCount(
                  meet
                ) > 0
                  ? `Check for Platform Results (${getPendingPlatformResultCount(
                      meet
                    )})`
                  : 'Check for Platform Results'
              }
            </button>

            <button
              id="showCompetitionProgress"
              type="button"
              class="compact-button secondary-button"
              ${division === undefined ? 'disabled' : ''}
            >
              Show Data Entry Progress
            </button>

            <button
              id="toggleMissingResultsReview"
              type="button"
              class="compact-button ${
                division !== undefined &&
                isMissingResultsReviewEnabled(
                  meet,
                  division.id
                )
                  ? 'competition-review-active'
                  : 'secondary-button'
              }"
              ${division === undefined ? 'disabled' : ''}
            >
              ${
                division !== undefined &&
                isMissingResultsReviewEnabled(
                  meet,
                  division.id
                )
                  ? 'End Missing Results Review'
                  : 'Review Missing Results'
              }
            </button>
          </div>

        </div>

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
                    ${renderCompetitionAttemptHeader(meet, '1st Squat', 'squat', 'attempt1')}
                    ${renderCompetitionAttemptHeader(meet, '2nd Squat', 'squat', 'attempt2')}
                    ${renderCompetitionAttemptHeader(meet, '3rd Squat', 'squat', 'attempt3')}
                    ${renderCompetitionAttemptHeader(meet, '1st Bench', 'bench', 'attempt1')}
                    ${renderCompetitionAttemptHeader(meet, '2nd Bench', 'bench', 'attempt2')}
                    ${renderCompetitionAttemptHeader(meet, '3rd Bench', 'bench', 'attempt3')}
                    ${renderCompetitionAttemptHeader(meet, '1st Deadlift', 'deadlift', 'attempt1')}
                    ${renderCompetitionAttemptHeader(meet, '2nd Deadlift', 'deadlift', 'attempt2')}
                    ${renderCompetitionAttemptHeader(meet, '3rd Deadlift', 'deadlift', 'attempt3')}
                    ${renderCompetitionSortHeader('Best Squat', 'bestSquat')}
                    ${renderCompetitionSortHeader('Best Bench', 'bestBench')}
                    ${renderCompetitionSortHeader('Best Deadlift', 'bestDeadlift')}
                    ${renderCompetitionSortHeader('SubTotal', 'subtotal')}
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
                    ${renderCompetitionSortHeader(getMissingHeaderLabel('Best Squat', doesBestLiftColumnHaveMissingResults(meet, 'squat')), 'bestSquat', doesBestLiftColumnHaveMissingResults(meet, 'squat') ? 'competition-header-missing-result' : '', 'best-squat')}
                    ${renderCompetitionSortHeader(getMissingHeaderLabel('Best Bench', doesBestLiftColumnHaveMissingResults(meet, 'bench')), 'bestBench', doesBestLiftColumnHaveMissingResults(meet, 'bench') ? 'competition-header-missing-result' : '', 'best-bench')}
                    ${renderCompetitionSortHeader(getMissingHeaderLabel('Best Deadlift', doesBestLiftColumnHaveMissingResults(meet, 'deadlift')), 'bestDeadlift', doesBestLiftColumnHaveMissingResults(meet, 'deadlift') ? 'competition-header-missing-result' : '', 'best-deadlift')}
                    ${renderCompetitionSortHeader('SubTotal', 'subtotal')}
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

  const results =
    getBestLiftResults(
      lifter
    )

  const subtotal =
    calculateCompetitionSubTotal(
      results
    )

  const total =
    calculateCompetitionTotal(
      results
    )

  const subtotalCell =
    document.querySelector<HTMLElement>(
      `[data-best-subtotal="${lifter.id}"]`
    )

  if (
    subtotalCell !== null
  ) {
    subtotalCell.textContent =
      formatCompetitionDisplayWeight(
        subtotal
      )
  }

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

    updateCompetitionProgressGrid()
    updateCompetitionMissingResultIndicators(
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

  const subtotal =
    calculateCompetitionSubTotal(
      best
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

  const subtotalCell =
    document.querySelector<HTMLElement>(
      `[data-attempt-subtotal="${lifter.id}"]`
    )

  if (
    subtotalCell !== null
  ) {
    subtotalCell.textContent =
      formatCompetitionDisplayWeight(
        subtotal
      )
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

    updateCompetitionProgressGrid()
    updateCompetitionMissingResultIndicators(
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

  updateCompetitionMissingResultIndicators(
    meet
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


function wireHelp():
  void {

  const wireTrainingButton =
    (
      buttonId: string,
      meetId: string,
      reset: boolean,
    ) => {
      document
        .querySelector<HTMLButtonElement>(
          `#${buttonId}`
        )
        ?.addEventListener(
          'click',
          () => {
            if (
              reset &&
              !window.confirm(
                'Reset this PowerScore training meet? This clears its competition results and restores all simulated PlatformManager files.'
              )
            ) {
              return
            }

            openTrainingMeet(
              meetId,
              reset
            )
          }
        )
    }

  wireTrainingButton(
    'openBestLiftTrainingMeet',
    TRAINING_BEST_LIFT_MEET_ID,
    false
  )

  wireTrainingButton(
    'resetBestLiftTrainingMeet',
    TRAINING_BEST_LIFT_MEET_ID,
    true
  )

  wireTrainingButton(
    'openAllAttemptsTrainingMeet',
    TRAINING_ALL_ATTEMPTS_MEET_ID,
    false
  )

  wireTrainingButton(
    'resetAllAttemptsTrainingMeet',
    TRAINING_ALL_ATTEMPTS_MEET_ID,
    true
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

  startPlatformResultsAvailabilityPolling()

  document
    .querySelector<HTMLButtonElement>(
      '#showCompetitionProgress'
    )
    ?.addEventListener(
      'click',
      () => {
        showCompetitionProgressDialog()
      }
    )

  document
    .querySelector<HTMLButtonElement>(
      '#toggleMissingResultsReview'
    )
    ?.addEventListener(
      'click',
      () => {
        toggleMissingResultsReviewForSelectedDivision()
      }
    )

  document
    .querySelector<HTMLButtonElement>(
      '#resetCompetitionDivision'
    )
    ?.addEventListener(
      'click',
      () => {
        resetSelectedCompetitionDivision()
      }
    )

  document
    .querySelector<HTMLButtonElement>(
      '#checkPlatformResults'
    )
    ?.addEventListener(
      'click',
      () => {
        const selectedMeet =
          getSelectedMeet()

        if (
          selectedMeet === undefined
        ) {
          return
        }

        const meetId =
          getNormalizedPlatformMeetId(
            selectedMeet
          )

        if (
          !/^[A-Z]{4}\d{4}$/.test(
            meetId
          )
        ) {
          window.alert(
            'The Platform MeetID has not been set for this meet.\n\nOpen Registration and generate a Platform MeetID before checking for PlatformManager results.'
          )

          return
        }

        void checkPlatformResults()
      }
    )

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


function normalizeLifterNamePart(
  value: string,
): string {

  return value
    .trim()
    .replace(
      /\s+/g,
      ' '
    )
    .toLocaleLowerCase()
}


function findDuplicateLifterName(
  meet: LocalMeet,
  firstName: string,
  lastName: string,
  excludeLifterId:
    number | null =
      null,
): Lifter | undefined {

  const normalizedFirst =
    normalizeLifterNamePart(
      firstName
    )

  const normalizedLast =
    normalizeLifterNamePart(
      lastName
    )

  if (
    normalizedFirst === '' ||
    normalizedLast === ''
  ) {
    return undefined
  }

  return meet.state.lifters.find(
    lifter =>
      lifter.id !==
        excludeLifterId &&
      normalizeLifterNamePart(
        lifter.firstName
      ) ===
        normalizedFirst &&
      normalizeLifterNamePart(
        lifter.lastName
      ) ===
        normalizedLast
  )
}


function showDuplicateLifterNameMessage(
  duplicate: Lifter,
): void {

  window.alert(
    `A lifter named ${duplicate.firstName} ${duplicate.lastName} is already registered in this meet as lifter #${duplicate.lifterNumber}.`
  )
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

  const duplicateName =
    findDuplicateLifterName(
      meet,
      firstName,
      lastName
    )

  if (
    duplicateName !==
    undefined
  ) {
    showDuplicateLifterNameMessage(
      duplicateName
    )

    firstInput.focus()

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

  document
    .querySelector<HTMLButtonElement>(
      '#navDetail'
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

        currentPage =
          'detail'

        renderApp()
      }
    )


  document
    .querySelector<HTMLButtonElement>(
      '#navSummary'
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

        currentPage =
          'summary'

        renderApp()
      }
    )


  document
    .querySelector<HTMLButtonElement>(
      '#navBestLifts'
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

        currentPage =
          'best-lifts'

        renderApp()
      }
    )


  document
    .querySelector<HTMLButtonElement>(
      '#navBestLifters'
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

        currentPage =
          'best-lifters'

        renderApp()
      }
    )


  document
    .querySelector<HTMLButtonElement>(
      '#navStandings'
    )
    ?.addEventListener(
      'click',
      () => {
        if (
          !finishBulkEdit(true) ||
          !finishActiveEdit(true, false)
        ) {
          return
        }

        currentPage = 'standings'
        renderApp()
      }
    )


  document
    .querySelector<HTMLButtonElement>(
      '#navTools'
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

        currentPage =
          'tools'

        renderApp()
      }
    )


  document
    .querySelector<HTMLButtonElement>(
      '#navHelp'
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
          'help'

        renderApp()
      }
    )

  document
    .querySelector<HTMLButtonElement>(
      '#navPlatformIssues'
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
          'platform-issues'

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
      '#generatePlatformMeetId'
    )
    ?.addEventListener(
      'click',
      generateSelectedPlatformMeetId
    )

  wirePlatformMeetIdControls()

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

  if (
    currentPage !==
    'competition'
  ) {
    stopPlatformResultsAvailabilityPolling()
  }

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
          : currentPage ===
              'standings'
            ? renderStandings()
            : currentPage ===
                'best-lifters'
              ? renderBestLifters()
              : currentPage ===
                  'best-lifts'
                ? renderBestLifts()
                : currentPage ===
                    'summary'
                  ? renderSummary()
                  : currentPage ===
                      'detail'
                    ? renderDetail()
                    : currentPage ===
                        'tools'
                      ? renderTools()
                      : currentPage ===
              'platform-issues'
            ? renderPlatformImportIssues()
            : currentPage ===
                'help'
              ? renderHelp()
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

  if (
    currentPage ===
    'tools'
  ) {
    disableRegistrationShortcuts()
    disableCompetitionStatusShortcuts()

    wireTools()

    return
  }

  if (
    currentPage ===
    'detail'
  ) {
    disableRegistrationShortcuts()
    disableCompetitionStatusShortcuts()

    wireDetail()

    return
  }

  if (
    currentPage ===
    'summary'
  ) {
    disableRegistrationShortcuts()
    disableCompetitionStatusShortcuts()

    wireSummary()

    return
  }

  if (
    currentPage ===
    'best-lifts'
  ) {
    disableRegistrationShortcuts()
    disableCompetitionStatusShortcuts()

    wireBestLifts()

    return
  }

  if (
    currentPage ===
    'best-lifters'
  ) {
    disableRegistrationShortcuts()
    disableCompetitionStatusShortcuts()

    wireBestLifters()

    return
  }

  if (
    currentPage ===
    'standings'
  ) {
    disableRegistrationShortcuts()
    disableCompetitionStatusShortcuts()
    wireStandings()
    return
  }

  if (
    currentPage ===
    'help'
  ) {
    disableRegistrationShortcuts()
    disableCompetitionStatusShortcuts()

    wireHelp()

    return
  }

  if (
    currentPage ===
    'platform-issues'
  ) {
    disableRegistrationShortcuts()
    disableCompetitionStatusShortcuts()
    wirePlatformImportIssues()
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