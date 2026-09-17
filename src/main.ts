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


type AppPage =
  | 'setup'
  | 'registration'


interface DivisionTeam {
  divisionId: number
  teamId: number
}


interface LocalMeet {
  state: MeetState
  divisionTeams: DivisionTeam[]
}


interface RegistrationDefaults {
  divisionId: number | null
  teamId: number | null
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


let currentPage:
  AppPage =
    'setup'


let selectedMeetId:
  string | null =
    localMeets[0]?.state.meet.id ??
    null


let selectedDivisionId:
  number | null =
    getSelectedMeet()
      ?.state.divisions[0]
      ?.id ??
    null


let registrationDefaults:
  RegistrationDefaults = {

    divisionId:
      selectedDivisionId,

    teamId:
      null,

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


function selectMeet(
  meetId: string,
): void {

  selectedMeetId =
    meetId

  const meet =
    getSelectedMeet()

  selectedDivisionId =
    meet?.state.divisions[0]
      ?.id ??
    null

  registrationDefaults = {
    divisionId:
      selectedDivisionId,

    teamId:
      null,

    equipmentType:
      'equipped',
  }

  renderApp()
}


function selectDivision(
  divisionId: number,
): void {

  selectedDivisionId =
    divisionId

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


function startMeetEntry():
  void {

  focusElement(
    '#newMeetName'
  )
}


function startDivisionEntry():
  void {

  focusElement(
    '#newDivisionName'
  )
}


function startTeamEntry():
  void {

  focusElement(
    '#newTeamName'
  )
}


function commitNewMeet():
  void {

  const input =
    document.querySelector<HTMLInputElement>(
      '#newMeetName'
    )

  if (
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

  const meetId =
    createMeetId()

  const newMeet:
    LocalMeet = {

      state: {
        meet: {
          id:
            meetId,

          name,

          date:
            '',

          location:
            '',

          resultEntryMode:
            'best-lift-only',
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

  registrationDefaults = {
    divisionId: null,
    teamId: null,
    equipmentType:
      'equipped',
  }

  renderApp()

  flashRow(
    `[data-meet-row="${meetId}"]`
  )

  focusElement(
    '#meetDate'
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

  registrationDefaults.divisionId =
    division.id

  registrationDefaults.teamId =
    null

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

  renderApp()

  flashRow(
    `[data-team-row="${team.id}"]`
  )

  focusElement(
    '#newTeamName'
  )
}


function removeDivision(
  divisionId: number,
): void {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }

  const used =
    meet.state.lifters.some(
      lifter =>
        lifter.divisionId ===
        divisionId
    )

  if (
    used
  ) {
    window.alert(
      'This division cannot be removed because one or more lifters are assigned to it.'
    )

    return
  }

  meet.state.divisions =
    meet.state.divisions.filter(
      division =>
        division.id !==
        divisionId
    )

  meet.divisionTeams =
    meet.divisionTeams.filter(
      item =>
        item.divisionId !==
        divisionId
    )

  if (
    selectedDivisionId ===
    divisionId
  ) {
    selectedDivisionId =
      meet.state.divisions[0]
        ?.id ??
      null
  }

  renderApp()
}


function removeTeamFromDivision(
  teamId: number,
): void {

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

  const used =
    meet.state.lifters.some(
      lifter =>
        lifter.divisionId ===
          division.id &&
        lifter.teamId ===
          teamId
    )

  if (
    used
  ) {
    window.alert(
      'This team cannot be removed from the division because one or more lifters in this division are assigned to it.'
    )

    return
  }

  meet.divisionTeams =
    meet.divisionTeams.filter(
      item =>
        !(
          item.divisionId ===
            division.id &&
          item.teamId ===
            teamId
        )
    )

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
        id="navSetup"
        type="button"
        class="nav-item ${
          currentPage ===
          'setup'
            ? 'active'
            : ''
        }"
      >
        Meet Setup
      </button>

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

          return `
            <div
              class="selector-row ${
                selected
                  ? 'selected'
                  : ''
              }"
              data-meet-row="${meet.id}"
              data-select-meet="${meet.id}"
              tabindex="0"
            >

              <div class="selector-main">
                ${
                  escapeHtml(
                    meet.name
                  )
                }
              </div>

              <div class="selector-detail">
                ${
                  meet.date === ''
                    ? 'Date not set'
                    : escapeHtml(
                        meet.date
                      )
                }
              </div>

            </div>
          `
        }
      )
      .join('')

  return `
    ${rows}

    <div class="quick-entry-row">
      <input
        id="newMeetName"
        type="text"
        placeholder="New meet — Enter to add"
        autocomplete="off"
        aria-label="New meet name"
      >
    </div>
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

          const detail =
            getDivisionRuleSetLabel(
              division.ruleSet
            )

          return `
            <div
              class="selector-row selector-row-with-delete ${
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
                class="row-delete"
                data-delete-division="${division.id}"
                title="Remove division"
                tabindex="-1"
              >
                ×
              </button>

            </div>
          `
        }
      )
      .join('')

  return `
    ${rows}

    <div class="quick-entry-row">

      <div class="division-entry-fields">

        <input
          id="newDivisionName"
          type="text"
          placeholder="New division — Enter to add"
          autocomplete="off"
          aria-label="New division name"
        >

        <select
          id="newDivisionRuleSet"
          aria-label="Division rule set"
        >
          <option value="THSPA">
            THSPA
          </option>

          <option value="THSWPA">
            THSWPA
          </option>

          <option value="NMAA_BOYS">
            NMAA Boys
          </option>

          <option value="NMAA_GIRLS">
            NMAA Girls
          </option>
        </select>

      </div>

    </div>
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
        Add a division before
        adding teams.
      </div>
    `
  }

  const teams =
    getTeamsForSelectedDivision()

  const rows =
    teams
      .map(
        team => `
          <div
            class="selector-row selector-row-with-delete"
            data-team-row="${team.id}"
          >

            <div class="team-name">
              ${
                escapeHtml(
                  team.name
                )
              }
            </div>

            <button
              type="button"
              class="row-delete"
              data-remove-team="${team.id}"
              title="Remove team from division"
              tabindex="-1"
            >
              ×
            </button>

          </div>
        `
      )
      .join('')

  return `
    ${rows}

    <div class="quick-entry-row">
      <input
        id="newTeamName"
        type="text"
        placeholder="New or existing team — Enter to add"
        autocomplete="off"
        aria-label="New or existing team name"
      >
    </div>
  `
}


function renderMeetDetails():
  string {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return `
      <div class="meet-details-empty">
        Select or create a meet
        to edit its information.
      </div>
    `
  }

  return `
    <div class="meet-details">

      <label class="field">
        <span>Meet Name</span>

        <input
          id="meetName"
          type="text"
          value="${
            escapeHtml(
              meet.state.meet.name
            )
          }"
        >
      </label>

      <label class="field">
        <span>Date</span>

        <input
          id="meetDate"
          type="date"
          value="${
            meet.state.meet.date
          }"
        >
      </label>

      <label class="field">
        <span>Location</span>

        <input
          id="meetLocation"
          type="text"
          value="${
            escapeHtml(
              meet.state.meet.location
            )
          }"
        >
      </label>
      <label class="field">
        <span>Result Entry</span>

        <select
          id="resultEntryMode"
        >
          <option
            value="best-lift-only"
            ${
              meet.state.meet
                .resultEntryMode ===
              'best-lift-only'
                ? 'selected'
                : ''
            }
          >
            Best Lift Only
          </option>

          <option
            value="all-attempts"
            ${
              meet.state.meet
                .resultEntryMode ===
              'all-attempts'
                ? 'selected'
                : ''
            }
          >
            All Attempts
          </option>
        </select>
      </label>

    </div>
  `
}


function renderMeetSetup():
  string {

  const meet =
    getSelectedMeet()

  const division =
    getSelectedDivision()

  return `
    <main class="workspace setup-workspace">

      <div class="setup-browser">

        <section class="setup-column">

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
              tabindex="-1"
            >
              + Meet
            </button>

          </div>

          <div class="column-context">
            Local meets on this device
          </div>

          <div class="selector-list">
            ${renderMeetRows()}
          </div>

        </section>


        <section class="setup-column">

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
              ${
                meet === undefined
                  ? 'disabled'
                  : ''
              }
              tabindex="-1"
            >
              + Division
            </button>

          </div>

          <div class="column-context">
            ${
              meet === undefined
                ? 'Select a meet'
                : escapeHtml(
                    meet.state.meet.name
                  )
            }
          </div>

          <div class="selector-list">
            ${renderDivisionRows()}
          </div>

        </section>


        <section class="setup-column">

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
              ${
                division === undefined
                  ? 'disabled'
                  : ''
              }
              tabindex="-1"
            >
              + Team
            </button>

          </div>

          <div class="column-context">
            ${
              division === undefined
                ? 'Select a division'
                : escapeHtml(
                    division.name
                  )
            }
          </div>

          <div class="selector-list">
            ${renderTeamRows()}
          </div>

        </section>

      </div>


      <section class="workspace-panel">

        <div class="detail-heading">
          Meet Information
        </div>

        ${renderMeetDetails()}

      </section>


      <div class="setup-note">
        Teams are shared within a meet.
        The Teams column shows which
        teams participate in the
        selected division.
      </div>

    </main>
  `
}


function renderDivisionOptions(
  state: MeetState,
  selectedId: number | null,
): string {

  return state.divisions
    .map(
      division => `
        <option
          value="${division.id}"
          ${
            division.id ===
            selectedId
              ? 'selected'
              : ''
          }
        >
          ${
            escapeHtml(
              division.name
            )
          }
        </option>
      `
    )
    .join('')
}


function renderTeamOptions(
  meet: LocalMeet,
  divisionId: number | null,
  selectedTeamId: number | null,
): string {

  if (
    divisionId === null
  ) {
    return `
      <option value="">
        Unattached
      </option>
    `
  }

  const teams =
    getTeamsForDivision(
      meet,
      divisionId
    )

  return `
    <option
      value=""
      ${
        selectedTeamId === null
          ? 'selected'
          : ''
      }
    >
      Unattached
    </option>

    ${
      teams
        .map(
          team => `
            <option
              value="${team.id}"
              ${
                team.id ===
                selectedTeamId
                  ? 'selected'
                  : ''
              }
            >
              ${
                escapeHtml(
                  team.name
                )
              }
            </option>
          `
        )
        .join('')
    }
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


function renderRegisteredLifterRows(
  meet: LocalMeet,
): string {

  if (
    meet.state.lifters.length ===
    0
  ) {
    return ''
  }

  return [...meet.state.lifters]
    .sort(
      (a, b) =>
        a.lifterNumber -
        b.lifterNumber
    )
    .map(
      lifter => {

        const division =
          meet.state.divisions.find(
            item =>
              item.id ===
              lifter.divisionId
          )

        const team =
          lifter.teamId === null
            ? undefined
            : meet.state.teams.find(
                item =>
                  item.id ===
                  lifter.teamId
              )

        const readiness =
          getLifterReadinessLabel(
            lifter,
            meet
          )

        return `
          <div
            class="registration-row registered-row"
            data-lifter-row="${lifter.id}"
          >

            <div class="cell-number">
              ${lifter.lifterNumber}
            </div>

            <div class="cell-name">
              ${
                escapeHtml(
                  lifter.firstName
                )
              }
            </div>

            <div class="cell-name">
              ${
                escapeHtml(
                  lifter.lastName
                )
              }
            </div>

            <div class="cell-text">
              ${
                escapeHtml(
                  division?.name ??
                  ''
                )
              }
            </div>

            <div class="cell-text">
              ${
                escapeHtml(
                  team?.name ??
                  'Unattached'
                )
              }
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

          </div>
        `
      }
    )
    .join('')
}


function renderRegistrationEntryRow(
  meet: LocalMeet,
): string {

  if (
    meet.state.divisions.length ===
    0
  ) {
    return `
      <div class="registration-empty">
        Add at least one division
        on Meet Setup before
        registering lifters.
      </div>
    `
  }

  let divisionId =
    registrationDefaults
      .divisionId

  const divisionExists =
    meet.state.divisions.some(
      division =>
        division.id ===
        divisionId
    )

  if (
    !divisionExists
  ) {
    divisionId =
      meet.state.divisions[0]
        ?.id ??
      null

    registrationDefaults
      .divisionId =
        divisionId

    registrationDefaults
      .teamId =
        null
  }

  const division =
    divisionId === null
      ? undefined
      : meet.state.divisions.find(
          item =>
            item.id ===
            divisionId
        )

  let automaticClass =
    ''

  if (
    division !== undefined
  ) {
    try {

      const rules =
        getDivisionRules(
          division
        )

      const bodyWeight =
        readNumberInput(
          '#entryBodyWeight'
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
  }

  return `
    <div
      class="registration-row registration-entry-row"
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

      <select
        id="entryDivision"
        class="grid-select"
        aria-label="Division"
      >
        ${
          renderDivisionOptions(
            meet.state,
            divisionId
          )
        }
      </select>

      <select
        id="entryTeam"
        class="grid-select"
        aria-label="Team"
      >
        ${
          renderTeamOptions(
            meet,
            divisionId,
            registrationDefaults
              .teamId
          )
        }
      </select>

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
            divisionId,
            automaticClass
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

      <button
        id="addLifter"
        type="button"
        class="entry-add-button"
      >
        Add
      </button>

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

  if (
    meet === undefined
  ) {
    return `
      <main class="workspace">

        <section class="workspace-panel">

          <div class="registration-placeholder">

            <strong>
              No Meet Selected
            </strong>

            <span>
              Select or create a meet
              on Meet Setup.
            </span>

          </div>

        </section>

      </main>
    `
  }

  return `
    <main class="workspace registration-workspace">

      <section class="workspace-panel registration-panel">

        <div class="registration-toolbar">

          <div>
            <span class="section-title">
              Registration
            </span>

            <span class="item-count">
              ${
                meet.state.lifters.length
              }
              lifters
            </span>
          </div>

          <div class="registration-meet-name">
            ${
              escapeHtml(
                meet.state.meet.name
              )
            }
          </div>

          <div class="registration-help">
            Enter adds lifter
          </div>

        </div>


        <div class="registration-grid">

          <div class="registration-row registration-header">
            <div>#</div>
            <div>First</div>
            <div>Last</div>
            <div>Division</div>
            <div>Team</div>
            <div>BW</div>
            <div>Class</div>
            <div>Grade</div>
            <div>Equip</div>
            <div>G</div>
            <div>X</div>
            <div>Status</div>
          </div>

          <div class="registration-body">
            ${
              renderRegisteredLifterRows(
                meet
              )
            }
          </div>

          <div class="registration-entry">
            ${
              renderRegistrationEntryRow(
                meet
              )
            }
          </div>

        </div>

      </section>

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


function updateEntryTeams():
  void {

  const meet =
    getSelectedMeet()

  const divisionInput =
    document.querySelector<HTMLSelectElement>(
      '#entryDivision'
    )

  const teamInput =
    document.querySelector<HTMLSelectElement>(
      '#entryTeam'
    )

  if (
    meet === undefined ||
    divisionInput === null ||
    teamInput === null
  ) {
    return
  }

  const divisionId =
    Number(
      divisionInput.value
    )

  registrationDefaults
    .divisionId =
      divisionId

  registrationDefaults
    .teamId =
      null

  teamInput.innerHTML =
    renderTeamOptions(
      meet,
      divisionId,
      null
    )

  updateEntryWeightClasses()
}


function updateEntryWeightClasses():
  void {

  const meet =
    getSelectedMeet()

  const divisionInput =
    document.querySelector<HTMLSelectElement>(
      '#entryDivision'
    )

  const classInput =
    document.querySelector<HTMLSelectElement>(
      '#entryWeightClass'
    )

  if (
    meet === undefined ||
    divisionInput === null ||
    classInput === null
  ) {
    return
  }

  const divisionId =
    Number(
      divisionInput.value
    )

  const bodyWeight =
    readNumberInput(
      '#entryBodyWeight'
    )

  let automaticClass =
    ''

  const division =
    meet.state.divisions.find(
      item =>
        item.id ===
        divisionId
    )

  if (
    division !== undefined
  ) {
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
  }

  classInput.innerHTML =
    renderEntryWeightClassOptions(
      meet,
      divisionId,
      automaticClass
    )

  if (
    automaticClass !== ''
  ) {
    classInput.value =
      automaticClass
  }
}


function commitNewLifter():
  void {

  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
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

  const divisionInput =
    document.querySelector<HTMLSelectElement>(
      '#entryDivision'
    )

  const teamInput =
    document.querySelector<HTMLSelectElement>(
      '#entryTeam'
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
    divisionInput === null ||
    teamInput === null ||
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

  const divisionId =
    Number(
      divisionInput.value
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
    window.alert(
      'Select a valid division.'
    )

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

  const teamId =
    teamInput.value === ''
      ? null
      : Number(
          teamInput.value
        )

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

          divisionId,

          teamId,

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

    registrationDefaults = {
      divisionId,

      teamId,

      equipmentType:
        lifter.equipmentType,
    }

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
      '#navSetup'
    )
    ?.addEventListener(
      'click',
      () => {

        currentPage =
          'setup'

        renderApp()
      }
    )

  document
    .querySelector<HTMLButtonElement>(
      '#navRegistration'
    )
    ?.addEventListener(
      'click',
      () => {

        currentPage =
          'registration'

        renderApp()

        focusElement(
          '#entryFirstName'
        )
      }
    )
}


function wireMeetSetup(): void {

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
    .querySelector<HTMLInputElement>(
      '#newMeetName'
    )
    ?.addEventListener(
      'keydown',
      event => {

        if (
          event.key ===
          'Enter'
        ) {
          event.preventDefault()
          commitNewMeet()
        }
      }
    )


  document
    .querySelector<HTMLInputElement>(
      '#newDivisionName'
    )
    ?.addEventListener(
      'keydown',
      event => {

        if (
          event.key ===
          'Enter'
        ) {
          event.preventDefault()
          commitNewDivision()
        }
      }
    )


  document
    .querySelector<HTMLInputElement>(
      '#newTeamName'
    )
    ?.addEventListener(
      'keydown',
      event => {

        if (
          event.key ===
          'Enter'
        ) {
          event.preventDefault()
          commitNewTeam()
        }
      }
    )


  document
    .querySelectorAll<HTMLElement>(
      '[data-select-meet]'
    )
    .forEach(
      row => {

        const activate =
          () => {

            const meetId =
              row.dataset
                .selectMeet

            if (
              meetId !== undefined
            ) {
              selectMeet(
                meetId
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
      '[data-delete-division]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          () => {

            const id =
              Number(
                button.dataset
                  .deleteDivision
              )

            if (
              !Number.isNaN(id)
            ) {
              removeDivision(
                id
              )
            }
          }
        )
      }
    )


  document
    .querySelectorAll<HTMLButtonElement>(
      '[data-remove-team]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          () => {

            const id =
              Number(
                button.dataset
                  .removeTeam
              )

            if (
              !Number.isNaN(id)
            ) {
              removeTeamFromDivision(
                id
              )
            }
          }
        )
      }
    )


  const meet =
    getSelectedMeet()

  if (
    meet === undefined
  ) {
    return
  }


  document
    .querySelector<HTMLInputElement>(
      '#meetName'
    )
    ?.addEventListener(
      'input',
      event => {

        const target =
          event.currentTarget as
            HTMLInputElement

        meet.state.meet.name =
          target.value

        const currentMeet =
          document.querySelector(
            '.current-meet'
          )

        if (
          currentMeet !== null
        ) {
          currentMeet.textContent =
            target.value
        }
      }
    )


  document
    .querySelector<HTMLInputElement>(
      '#meetDate'
    )
    ?.addEventListener(
      'change',
      event => {

        const target =
          event.currentTarget as
            HTMLInputElement

        meet.state.meet.date =
          target.value
      }
    )


  document
    .querySelector<HTMLInputElement>(
      '#meetLocation'
    )
    ?.addEventListener(
      'input',
      event => {

        const target =
          event.currentTarget as
            HTMLInputElement

        meet.state.meet.location =
          target.value
      }
    )

  document
    .querySelector<HTMLSelectElement>(
      '#resultEntryMode'
    )
    ?.addEventListener(
      'change',
      event => {

        const target =
          event.currentTarget as
            HTMLSelectElement

        meet.state.meet.resultEntryMode =
          target.value as
            ResultEntryMode
      }
    )
}


function wireRegistration():
  void {

  document
    .querySelector<HTMLSelectElement>(
      '#entryDivision'
    )
    ?.addEventListener(
      'change',
      updateEntryTeams
    )


  document
    .querySelector<HTMLSelectElement>(
      '#entryTeam'
    )
    ?.addEventListener(
      'change',
      event => {

        const target =
          event.currentTarget as
            HTMLSelectElement

        registrationDefaults.teamId =
          target.value === ''
            ? null
            : Number(
                target.value
              )
      }
    )


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
    .querySelector<HTMLButtonElement>(
      '#addLifter'
    )
    ?.addEventListener(
      'click',
      commitNewLifter
    )


document
  .querySelector<HTMLElement>(
    '.registration-entry-row'
  )
  ?.addEventListener(
    'keydown',
    event => {

      if (
        event.key !==
        'Enter'
      ) {
        return
      }

      const target =
        event.target as
          HTMLElement

      if (
        target.tagName ===
        'SELECT'
      ) {
        return
      }

      event.preventDefault()

      commitNewLifter()
    }
  )
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

      ${
        currentPage ===
        'setup'
          ? renderMeetSetup()
          : renderRegistration()
      }

    </div>
  `

  wireNavigation()

  if (
    currentPage ===
    'setup'
  ) {
    wireMeetSetup()
  }

  if (
    currentPage ===
    'registration'
  ) {
    wireRegistration()
  }
}


renderApp()