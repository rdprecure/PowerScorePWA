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


type TeamStatusValue =
  | 'regular'
  | 'bteam'
  | 'guest'


type LifterSortColumn =
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
          'best-lift-only',
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
        class="nav-item active"
      >
        Registration
      </button>

      <button
        type="button"
        class="nav-item"
        disabled
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
          <span><kbd>b</kbd> Bombed</span>
          <span><kbd>s</kbd> Scratched</span>
          <span><kbd>q</kbd> Disqualified</span>
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
                class="selector-button"
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
                    B Team
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
                class="selector-button"
                data-select-team="${team.id}"
                tabindex="-1"
              >
                <span class="team-name">
                  ${escapeHtml(team.name)}
                </span>
                ${
                  team.isBTeam === true
                    ? '<span class="selector-button-detail">B Team</span>'
                    : ''
                }
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
                B Team
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
      class="registration-row registered-row selected editing-row ${getLifterGridClassNames(meet)}"
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

      <input
        id="editLifterFirstName"
        class="grid-input"
        type="text"
        value="${escapeHtml(lifter.firstName)}"
        autocomplete="off"
        aria-label="First name"
      >

      <input
        id="editLifterLastName"
        class="grid-input"
        type="text"
        value="${escapeHtml(lifter.lastName)}"
        autocomplete="off"
        aria-label="Last name"
      >

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
            class="registration-row registered-row ${getLifterGridClassNames(meet)} ${
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
              ${escapeHtml(lifter.firstName)}
            </div>

            <div class="cell-name">
              ${escapeHtml(lifter.lastName)}
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

      <input
        id="entryFirstName"
        class="grid-input"
        type="text"
        autocomplete="off"
        aria-label="First name"
      >

      <input
        id="entryLastName"
        class="grid-input"
        type="text"
        autocomplete="off"
        aria-label="Last name"
      >

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
      class="bulk-edit-row ${showGradeColumn ? 'with-grade-column' : ''}"
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
                          ${renderLifterSortHeader('First', 'firstName')}
                          ${renderLifterSortHeader('Last', 'lastName')}
                          ${
                            shouldShowLifterTeamColumn()
                              ? renderLifterSortHeader('Team', 'team')
                              : ''
                          }
                          ${renderLifterSortHeader('BWT', 'bodyWeight')}
                          ${renderLifterSortHeader('Weight Class', 'weightClass')}
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
        // Registration is already the active workspace.
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
      lifter.status =
        status

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

      ${renderRegistration()}

    </div>
  `

  wireNavigation()
  wireRegistrationSetup()
  wireRegistration()
  wireSelectAllOnEditableInputs()
  wireRegistrationShortcuts()
}


selectFirstHierarchy()
renderApp()