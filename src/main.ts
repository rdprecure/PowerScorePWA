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
      ],

      lifters: [],
    },

    divisionTeams: [
      {
        divisionId: 1,
        teamId: 1,
      },

      {
        divisionId: 1,
        teamId: 2,
      },

      {
        divisionId: 2,
        teamId: 1,
      },

      {
        divisionId: 2,
        teamId: 3,
      },
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
    divisionId === null ||
    teamId === null
  ) {
    return undefined
  }

  return [...meet.state.lifters]
    .filter(
      lifter =>
        lifter.divisionId ===
          divisionId &&
        lifter.teamId ===
          teamId
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

  selectedTeamId =
    getTeamsForDivision(
      meet,
      divisionId
    )[0]?.id ??
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


function selectLifter(
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
          lifterId &&
        item.divisionId ===
          selectedDivisionId &&
        item.teamId ===
          selectedTeamId
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

    if (
      name === null
    ) {
      return null
    }

    return JSON.stringify({
      name:
        name.value.trim(),
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

  const guest =
    document.querySelector<HTMLInputElement>(
      '#editLifterGuest'
    )

  const extra =
    document.querySelector<HTMLInputElement>(
      '#editLifterExtra'
    )

  if (
    number === null ||
    first === null ||
    last === null ||
    bodyWeight === null ||
    weightClass === null ||
    grade === null ||
    equipment === null ||
    guest === null ||
    extra === null
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
      guest.checked,
    isExtraLifter:
      extra.checked,
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

  if (
    meet === undefined ||
    nameInput === null
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

  const duplicate =
    meet.state.teams.some(
      item =>
        item.id !==
          teamId &&
        item.name
          .trim()
          .toLocaleLowerCase() ===
        name.toLocaleLowerCase()
    )

  if (
    duplicate
  ) {
    window.alert(
      'A team with that name already exists in this meet.'
    )

    nameInput.focus()

    return false
  }

  team.name =
    name

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

  const guestInput =
    document.querySelector<HTMLInputElement>(
      '#editLifterGuest'
    )

  const extraInput =
    document.querySelector<HTMLInputElement>(
      '#editLifterExtra'
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
    guestInput === null ||
    extraInput === null
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
      grade < 1 ||
      grade > 12
    )
  ) {
    window.alert(
      'Grade must be between 1 and 12.'
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
        guestInput.checked,
      isExtraLifter:
        extraInput.checked,
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
            item.teamId ===
              selectedTeamId
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
      normalized
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

  if (
    meet === undefined ||
    division === undefined ||
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

  let team =
    findTeamByName(
      meet,
      name
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
      (a, b) =>
        a.name.localeCompare(
          b.name
        )
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

    </nav>
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
            >

              <button
                type="button"
                class="selector-button meet-selector-button"
                data-select-meet="${escapeHtml(meet.id)}"
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
            >

              <button
                type="button"
                class="selector-button"
                data-select-division="${division.id}"
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
                <input
                  id="editTeamName"
                  class="row-edit-input"
                  type="text"
                  value="${escapeHtml(team.name)}"
                  autocomplete="off"
                  aria-label="Team name"
                >

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
            >

              <button
                type="button"
                class="selector-button"
                data-select-team="${team.id}"
              >
                <span class="team-name">
                  ${
                    escapeHtml(
                      team.name
                    )
                  }
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

  return `
    ${rows}

    ${
      activeEntry ===
      'team'
        ? `
          <div
            class="quick-entry-row team-entry-row"
            data-entry-row="team"
          >
            <input
              id="newTeamName"
              type="text"
              placeholder="Team name"
              autocomplete="off"
              aria-label="New or existing team name"
            >
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
      ' · ' +
      division.name
    )
  }

  if (
    division !== undefined
  ) {
    return division.name
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


function renderLifterEditRow(
  meet: LocalMeet,
  lifter: Lifter,
): string {

  return `
    <div
      class="registration-row registered-row selected editing-row"
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

      <input
        id="editLifterBodyWeight"
        class="grid-input number-input"
        type="number"
        min="0"
        step="0.1"
        value="${
          lifter.bodyWeight ??
          ''
        }"
        aria-label="Body weight"
      >

      <select
        id="editLifterWeightClass"
        class="grid-select"
        aria-label="Weight class"
      >
        ${
          renderEntryWeightClassOptions(
            meet,
            lifter.divisionId,
            lifter.weightClass ??
            ''
          )
        }
      </select>

      <input
        id="editLifterGrade"
        class="grid-input number-input"
        type="number"
        min="1"
        max="12"
        value="${
          lifter.grade ??
          ''
        }"
        aria-label="Grade"
      >

      <select
        id="editLifterEquipment"
        class="grid-select"
        aria-label="Equipment"
      >
        <option
          value="equipped"
          ${
            lifter.equipmentType ===
            'equipped'
              ? 'selected'
              : ''
          }
        >
          Eq
        </option>

        <option
          value="unequipped"
          ${
            lifter.equipmentType ===
            'unequipped'
              ? 'selected'
              : ''
          }
        >
          UnEq
        </option>
      </select>

      <label
        class="grid-check"
        title="Guest lifter"
      >
        <input
          id="editLifterGuest"
          type="checkbox"
          aria-label="Guest lifter"
          ${
            lifter.isGuest
              ? 'checked'
              : ''
          }
        >
      </label>

      <label
        class="grid-check"
        title="Extra lifter"
      >
        <input
          id="editLifterExtra"
          type="checkbox"
          aria-label="Extra lifter"
          ${
            lifter.isExtraLifter
              ? 'checked'
              : ''
          }
        >
      </label>

      <div class="readiness editing-status">
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

  const lifters =
    getVisibleLifters(
      meet
    )

  if (
    lifters.length ===
    0
  ) {
    return ''
  }

  return [...lifters]
    .sort(
      (a, b) =>
        a.lifterNumber -
        b.lifterNumber
    )
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
            class="registration-row registered-row ${
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

            <div class="cell-number">
              ${
                lifter.bodyWeight ??
                ''
              }
            </div>

            <div class="cell-class">
              ${
                escapeHtml(
                  lifter.weightClass ??
                  ''
                )
              }
            </div>

            <div class="cell-number">
              ${
                lifter.grade ??
                ''
              }
            </div>

            <div class="cell-text">
              ${
                lifter.equipmentType ===
                'equipped'
                  ? 'Eq'
                  : 'UnEq'
              }
            </div>

            <div class="cell-flag">
              ${
                lifter.isGuest
                  ? 'G'
                  : ''
              }
            </div>

            <div class="cell-flag">
              ${
                lifter.isExtraLifter
                  ? 'X'
                  : ''
              }
            </div>

            <div
              class="readiness ${
                readiness === 'Ready'
                  ? 'ready'
                  : readiness ===
                    'Not Competing'
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

  return `
    <div
      class="registration-row registration-entry-row"
      data-entry-row="lifter"
    >

      <input
        id="entryLifterNumber"
        class="grid-input number-input"
        type="number"
        min="1"
        value="${
          getNextUnusedLifterNumber(
            meet.state
          )
        }"
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
        ${
          renderEntryWeightClassOptions(
            meet,
            division.id,
            ''
          )
        }
      </select>

      <input
        id="entryGrade"
        class="grid-input number-input"
        type="number"
        min="1"
        max="12"
        aria-label="Grade"
      >

      <select
        id="entryEquipment"
        class="grid-select"
        aria-label="Equipment"
      >
        <option
          value="equipped"
          ${
            registrationDefaults
              .equipmentType ===
            'equipped'
              ? 'selected'
              : ''
          }
        >
          Eq
        </option>

        <option
          value="unequipped"
          ${
            registrationDefaults
              .equipmentType ===
            'unequipped'
              ? 'selected'
              : ''
          }
        >
          UnEq
        </option>
      </select>

      <label
        class="grid-check"
        title="Guest lifter"
      >
        <input
          id="entryGuest"
          type="checkbox"
          aria-label="Guest lifter"
        >
      </label>

      <label
        class="grid-check"
        title="Extra lifter"
      >
        <input
          id="entryExtra"
          type="checkbox"
          aria-label="Extra lifter"
        >
      </label>

      <div></div>
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


function renderRegistration():
  string {

  const meet =
    getSelectedMeet()

  const selectedTeam =
    getSelectedTeam()

  const visibleLifterCount =
    meet === undefined
      ? 0
      : getVisibleLifters(
          meet
        ).length

  return `
    <main class="workspace registration-workspace">

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
                    <span class="registration-help">
                      ${
                        selectedTeam ===
                        undefined
                          ? 'Select a team to add lifters'
                          : activeEntry ===
                            'lifter'
                            ? 'Tab moves fields · Enter adds · Esc cancels'
                            : ''
                      }
                    </span>

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
                  </div>

                </div>


                <div class="registration-grid">

                  <div
                    class="registration-row registration-header"
                  >
                    <div>#</div>
                    <div>First</div>
                    <div>Last</div>
                    <div>BW</div>
                    <div>Class</div>
                    <div>Grade</div>
                    <div>Equip</div>
                    <div>G</div>
                    <div>X</div>
                    <div>Status</div>
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

  const guestInput =
    document.querySelector<HTMLInputElement>(
      '#entryGuest'
    )

  const extraInput =
    document.querySelector<HTMLInputElement>(
      '#entryExtra'
    )

  if (
    numberInput === null ||
    firstInput === null ||
    lastInput === null ||
    classInput === null ||
    gradeInput === null ||
    equipmentInput === null ||
    guestInput === null ||
    extraInput === null
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
    gradeInput.value.trim() ===
    ''
      ? null
      : Number(
          gradeInput.value
        )

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
            guestInput.checked,

          isExtraLifter:
            extraInput.checked,
        },
        rules
      )

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


  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-select-meet]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          () => {

            const meetId =
              button.dataset
                .selectMeet

            if (
              meetId !== undefined
            ) {
              selectMeet(
                meetId
              )
            }
          }
        )
      }
    )


  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-select-division]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          () => {

            const id =
              Number(
                button.dataset
                  .selectDivision
              )

            if (
              !Number.isNaN(id)
            ) {
              selectDivision(
                id
              )
            }
          }
        )
      }
    )


  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-select-team]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          () => {

            const id =
              Number(
                button.dataset
                  .selectTeam
              )

            if (
              !Number.isNaN(id)
            ) {
              selectTeam(
                id
              )
            }
          }
        )
      }
    )


  document
    .querySelectorAll<HTMLElement>(
      '[data-select-lifter]'
    )
    .forEach(
      row => {

        const activate =
          () => {

            const id =
              Number(
                row.dataset
                  .selectLifter
              )

            if (
              !Number.isNaN(id)
            ) {
              selectLifter(
                id
              )
            }
          }

        row.addEventListener(
          'click',
          activate
        )

        row.addEventListener(
          'keydown',
          event => {

            if (
              event.key ===
                'Enter' ||
              event.key ===
                ' '
            ) {
              event.preventDefault()
              activate()
            }
          }
        )
      }
    )


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
    .querySelector<HTMLInputElement>(
      '#entryBodyWeight'
    )
    ?.addEventListener(
      'change',
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
      '#editLifterBodyWeight'
    )
    ?.addEventListener(
      'change',
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

      ${renderRegistration()}

    </div>
  `

  wireNavigation()
  wireRegistrationSetup()
  wireRegistration()
}


selectFirstHierarchy()
renderApp()