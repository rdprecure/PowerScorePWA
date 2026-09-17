import './style.css'

import type {
  Association,
} from './models/Meet'

import type {
  Division,
} from './models/Division'

import type {
  Team,
} from './models/Team'

import type {
  MeetState,
} from './models/MeetState'

import type {
  ResultEntryMode,
} from './models/Competition'


type AppPage =
  | 'setup'
  | 'registration'


const meetState: MeetState = {
  meet: {
    id: 'development-meet',
    name: 'PowerScore Development Meet',
    date: '2026-09-16',
    location: 'Lubbock, Texas',
    association: 'THSPA',
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
  ],

  lifters: [],
}


let currentPage:
  AppPage =
    'setup'


function escapeHtml(
  value: string,
): string {

  return value
    .replaceAll(
      '&',
      '&amp;',
    )
    .replaceAll(
      '<',
      '&lt;',
    )
    .replaceAll(
      '>',
      '&gt;',
    )
    .replaceAll(
      '"',
      '&quot;',
    )
    .replaceAll(
      "'",
      '&#039;',
    )
}


function getNextDivisionId():
  number {

  if (
    meetState.divisions.length === 0
  ) {
    return 1
  }

  return (
    Math.max(
      ...meetState.divisions.map(
        division =>
          division.id
      )
    ) + 1
  )
}


function getNextTeamId():
  number {

  if (
    meetState.teams.length === 0
  ) {
    return 1
  }

  return (
    Math.max(
      ...meetState.teams.map(
        team =>
          team.id
      )
    ) + 1
  )
}


function addDivision(): void {

  const division:
    Division = {

      id:
        getNextDivisionId(),

      meetId:
        meetState.meet.id,

      name:
        '',
    }

  meetState.divisions.push(
    division
  )

  renderApp()

  const input =
    document.querySelector<HTMLInputElement>(
      `[data-division-name="${division.id}"]`
    )

  input?.focus()
}


function removeDivision(
  divisionId: number,
): void {

  const used =
    meetState.lifters.some(
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

  meetState.divisions =
    meetState.divisions.filter(
      division =>
        division.id !==
        divisionId
    )

  renderApp()
}


function addTeam(): void {

  const team:
    Team = {

      id:
        getNextTeamId(),

      meetId:
        meetState.meet.id,

      name:
        '',

      region:
        null,

      classification:
        null,
    }

  meetState.teams.push(
    team
  )

  renderApp()

  const input =
    document.querySelector<HTMLInputElement>(
      `[data-team-name="${team.id}"]`
    )

  input?.focus()
}


function removeTeam(
  teamId: number,
): void {

  const used =
    meetState.lifters.some(
      lifter =>
        lifter.teamId ===
        teamId
    )

  if (
    used
  ) {
    window.alert(
      'This team cannot be removed because one or more lifters are assigned to it.'
    )

    return
  }

  meetState.teams =
    meetState.teams.filter(
      team =>
        team.id !==
        teamId
    )

  renderApp()
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


function renderDivisionRows():
  string {

  if (
    meetState.divisions.length === 0
  ) {
    return `
      <div class="empty-grid">
        No divisions have been added.
      </div>
    `
  }

  return meetState.divisions
    .map(
      division => `
        <div class="data-row division-row">

          <span class="row-number">
            ${division.id}
          </span>

          <input
            type="text"
            value="${
              escapeHtml(
                division.name
              )
            }"
            data-division-name="${
              division.id
            }"
            aria-label="Division name"
          >

          <button
            type="button"
            class="row-delete"
            data-delete-division="${
              division.id
            }"
            title="Remove division"
          >
            ×
          </button>

        </div>
      `
    )
    .join('')
}


function renderTeamRows():
  string {

  if (
    meetState.teams.length === 0
  ) {
    return `
      <div class="empty-grid">
        No teams have been added.
      </div>
    `
  }

  return meetState.teams
    .map(
      team => `
        <div class="data-row team-row">

          <span class="row-number">
            ${team.id}
          </span>

          <input
            type="text"
            value="${
              escapeHtml(
                team.name
              )
            }"
            data-team-name="${
              team.id
            }"
            aria-label="Team name"
          >

          <input
            type="text"
            value="${
              escapeHtml(
                team.region ??
                ''
              )
            }"
            data-team-region="${
              team.id
            }"
            aria-label="Region"
          >

          <input
            type="text"
            value="${
              escapeHtml(
                team.classification ??
                ''
              )
            }"
            data-team-classification="${
              team.id
            }"
            aria-label="Classification"
          >

          <button
            type="button"
            class="row-delete"
            data-delete-team="${
              team.id
            }"
            title="Remove team"
          >
            ×
          </button>

        </div>
      `
    )
    .join('')
}


function renderMeetSetup():
  string {

  return `
    <main class="workspace setup-workspace">

      <section class="workspace-panel">

        <div class="section-title">
          Meet Information
        </div>

        <div class="meet-form">

          <label class="field meet-name-field">
            <span>Meet Name</span>

            <input
              id="meetName"
              type="text"
              value="${
                escapeHtml(
                  meetState.meet.name
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
                meetState.meet.date
              }"
            >
          </label>

          <label class="field location-field">
            <span>Location</span>

            <input
              id="meetLocation"
              type="text"
              value="${
                escapeHtml(
                  meetState.meet.location
                )
              }"
            >
          </label>

          <label class="field">
            <span>Association</span>

            <select
              id="meetAssociation"
            >
              <option
                value="THSPA"
                ${
                  meetState.meet
                    .association ===
                  'THSPA'
                    ? 'selected'
                    : ''
                }
              >
                THSPA
              </option>

              <option
                value="THSWPA"
                ${
                  meetState.meet
                    .association ===
                  'THSWPA'
                    ? 'selected'
                    : ''
                }
              >
                THSWPA
              </option>

              <option
                value="NMAA"
                ${
                  meetState.meet
                    .association ===
                  'NMAA'
                    ? 'selected'
                    : ''
                }
              >
                NMAA
              </option>
            </select>
          </label>

          <label class="field">
            <span>Result Entry</span>

            <select
              id="resultEntryMode"
            >
              <option
                value="best-lift-only"
                ${
                  meetState.meet
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
                  meetState.meet
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

      </section>


      <div class="setup-columns">

        <section class="workspace-panel">

          <div class="panel-toolbar">

            <div>
              <span class="section-title">
                Divisions
              </span>

              <span class="item-count">
                ${
                  meetState.divisions
                    .length
                }
              </span>
            </div>

            <button
              id="addDivision"
              type="button"
              class="compact-button"
            >
              + Add Division
            </button>

          </div>

          <div class="data-grid">

            <div
              class="data-header
                division-row"
            >
              <span>ID</span>
              <span>Division Name</span>
              <span></span>
            </div>

            <div class="data-body">
              ${renderDivisionRows()}
            </div>

          </div>

        </section>


        <section class="workspace-panel">

          <div class="panel-toolbar">

            <div>
              <span class="section-title">
                Teams
              </span>

              <span class="item-count">
                ${
                  meetState.teams
                    .length
                }
              </span>
            </div>

            <button
              id="addTeam"
              type="button"
              class="compact-button"
            >
              + Add Team
            </button>

          </div>

          <div class="data-grid">

            <div
              class="data-header
                team-row"
            >
              <span>ID</span>
              <span>Team / School</span>
              <span>Region</span>
              <span>Class</span>
              <span></span>
            </div>

            <div class="data-body">
              ${renderTeamRows()}
            </div>

          </div>

        </section>

      </div>

      <div class="setup-note">
        Changes are currently held in
        memory for this development
        milestone. Meet file storage
        will be added later.
      </div>

    </main>
  `
}


function renderRegistration():
  string {

  return `
    <main class="workspace">

      <section class="workspace-panel">

        <div class="panel-toolbar">

          <div>
            <span class="section-title">
              Registration
            </span>

            <span class="item-count">
              ${
                meetState.lifters
                  .length
              }
              lifters
            </span>
          </div>

          <button
            type="button"
            class="compact-button"
            disabled
          >
            + Add Lifter
          </button>

        </div>

        <div class="registration-placeholder">

          <strong>
            Lifter Registration
          </strong>

          <span>
            ${
              meetState.divisions.length
            }
            division${
              meetState.divisions.length ===
              1
                ? ''
                : 's'
            }
            and
            ${
              meetState.teams.length
            }
            team${
              meetState.teams.length ===
              1
                ? ''
                : 's'
            }
            are currently configured.
          </span>

          <span>
            The compact keyboard-first
            lifter entry grid is the
            next development step.
          </span>

        </div>

      </section>

    </main>
  `
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
            escapeHtml(
              meetState.meet.name
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
      }
    )
}


function wireMeetSetup(): void {

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

        meetState.meet.name =
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

        meetState.meet.date =
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

        meetState.meet.location =
          target.value
      }
    )


  document
    .querySelector<HTMLSelectElement>(
      '#meetAssociation'
    )
    ?.addEventListener(
      'change',
      event => {

        const target =
          event.currentTarget as
            HTMLSelectElement

        meetState.meet.association =
          target.value as
            Association
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

        meetState.meet.resultEntryMode =
          target.value as
            ResultEntryMode
      }
    )


  document
    .querySelector<HTMLButtonElement>(
      '#addDivision'
    )
    ?.addEventListener(
      'click',
      addDivision
    )


  document
    .querySelector<HTMLButtonElement>(
      '#addTeam'
    )
    ?.addEventListener(
      'click',
      addTeam
    )


  document
    .querySelectorAll<HTMLInputElement>(
      '[data-division-name]'
    )
    .forEach(
      input => {

        input.addEventListener(
          'input',
          () => {

            const id =
              Number(
                input.dataset
                  .divisionName
              )

            const division =
              meetState.divisions.find(
                item =>
                  item.id === id
              )

            if (
              division !== undefined
            ) {
              division.name =
                input.value
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
              removeDivision(id)
            }
          }
        )
      }
    )


  document
    .querySelectorAll<HTMLInputElement>(
      '[data-team-name]'
    )
    .forEach(
      input => {

        input.addEventListener(
          'input',
          () => {

            const id =
              Number(
                input.dataset
                  .teamName
              )

            const team =
              meetState.teams.find(
                item =>
                  item.id === id
              )

            if (
              team !== undefined
            ) {
              team.name =
                input.value
            }
          }
        )
      }
    )


  document
    .querySelectorAll<HTMLInputElement>(
      '[data-team-region]'
    )
    .forEach(
      input => {

        input.addEventListener(
          'input',
          () => {

            const id =
              Number(
                input.dataset
                  .teamRegion
              )

            const team =
              meetState.teams.find(
                item =>
                  item.id === id
              )

            if (
              team !== undefined
            ) {
              team.region =
                input.value === ''
                  ? null
                  : input.value
            }
          }
        )
      }
    )


  document
    .querySelectorAll<HTMLInputElement>(
      '[data-team-classification]'
    )
    .forEach(
      input => {

        input.addEventListener(
          'input',
          () => {

            const id =
              Number(
                input.dataset
                  .teamClassification
              )

            const team =
              meetState.teams.find(
                item =>
                  item.id === id
              )

            if (
              team !== undefined
            ) {
              team.classification =
                input.value === ''
                  ? null
                  : input.value
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
          () => {

            const id =
              Number(
                button.dataset
                  .deleteTeam
              )

            if (
              !Number.isNaN(id)
            ) {
              removeTeam(id)
            }
          }
        )
      }
    )
}


renderApp()