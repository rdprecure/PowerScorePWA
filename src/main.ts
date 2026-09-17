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
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
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


function focusElement(
  selector: string,
): void {

  window.requestAnimationFrame(
    () => {
      document
        .querySelector<HTMLInputElement>(
          selector
        )
        ?.focus()
    }
  )
}


function startDivisionEntry():
  void {

  const input =
    document.querySelector<HTMLInputElement>(
      '#newDivisionName'
    )

  input?.focus()
}


function startTeamEntry():
  void {

  const input =
    document.querySelector<HTMLInputElement>(
      '#newTeamName'
    )

  input?.focus()
}


function commitNewDivision():
  void {

  const input =
    document.querySelector<HTMLInputElement>(
      '#newDivisionName'
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

  const division:
    Division = {

      id:
        getNextDivisionId(),

      meetId:
        meetState.meet.id,

      name,
    }

  meetState.divisions.push(
    division
  )

  renderApp()

  flashRow(
    `[data-division-row="${division.id}"]`
  )

  focusElement(
    '#newDivisionName'
  )
}


function commitNewTeam():
  void {

  const input =
    document.querySelector<HTMLInputElement>(
      '#newTeamName'
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

  const team:
    Team = {

      id:
        getNextTeamId(),

      meetId:
        meetState.meet.id,

      name,

      region:
        null,

      classification:
        null,
    }

  meetState.teams.push(
    team
  )

  renderApp()

  flashRow(
    `[data-team-row="${team.id}"]`
  )

  focusElement(
    '#newTeamName'
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
          currentPage === 'setup'
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
          currentPage === 'registration'
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

  const rows =
    meetState.divisions
      .map(
        division => `
          <div
            class="data-row division-row"
            data-division-row="${division.id}"
          >

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
              data-division-name="${division.id}"
              aria-label="Division name"
            >

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
      )
      .join('')

  return `
    ${rows}

    <div
      class="data-row division-row entry-row"
    >

      <span class="row-number">
        +
      </span>

      <input
        id="newDivisionName"
        type="text"
        value=""
        placeholder="New division — Enter to add"
        aria-label="New division name"
        autocomplete="off"
      >

      <span></span>

    </div>
  `
}


function renderTeamRows():
  string {

  const rows =
    meetState.teams
      .map(
        team => `
          <div
            class="data-row team-row"
            data-team-row="${team.id}"
          >

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
              data-team-name="${team.id}"
              aria-label="Team name"
            >

            <button
              type="button"
              class="row-delete"
              data-delete-team="${team.id}"
              title="Remove team"
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

    <div
      class="data-row team-row entry-row"
    >

      <span class="row-number">
        +
      </span>

      <input
        id="newTeamName"
        type="text"
        value=""
        placeholder="New team / school — Enter to add"
        aria-label="New team or school name"
        autocomplete="off"
      >

      <span></span>

    </div>
  `
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

          <label class="field">
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

          <label class="field">
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
                  meetState.divisions.length
                }
              </span>
            </div>

            <button
              id="addDivision"
              type="button"
              class="compact-button"
              tabindex="-1"
            >
              + Add Division
            </button>

          </div>

          <div class="entry-help">
            Type a division and press
            <kbd>Enter</kbd>
            to add the next one.
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
                  meetState.teams.length
                }
              </span>
            </div>

            <button
              id="addTeam"
              type="button"
              class="compact-button"
              tabindex="-1"
            >
              + Add Team
            </button>

          </div>

          <div class="entry-help">
            Type a school/team and press
            <kbd>Enter</kbd>
            to add the next one.
          </div>

          <div class="data-grid">

            <div
              class="data-header
                team-row"
            >
              <span>ID</span>
              <span>Team / School</span>
              <span></span>
            </div>

            <div class="data-body">
              ${renderTeamRows()}
            </div>

          </div>

        </section>

      </div>

      <div class="setup-note">
        School Region and Classification
        will come from the School Directory
        rather than being entered for each meet.
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
                meetState.lifters.length
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
              meetState.divisions.length === 1
                ? ''
                : 's'
            }
            and
            ${
              meetState.teams.length
            }
            team${
              meetState.teams.length === 1
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
        currentPage === 'setup'
          ? renderMeetSetup()
          : renderRegistration()
      }

    </div>
  `

  wireNavigation()

  if (
    currentPage === 'setup'
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
      '#newDivisionName'
    )
    ?.addEventListener(
      'keydown',
      event => {

        if (
          event.key === 'Enter'
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
          event.key === 'Enter'
        ) {
          event.preventDefault()
          commitNewTeam()
        }
      }
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

        input.addEventListener(
          'keydown',
          event => {

            if (
              event.key === 'Enter'
            ) {
              event.preventDefault()
              startDivisionEntry()
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

        input.addEventListener(
          'keydown',
          event => {

            if (
              event.key === 'Enter'
            ) {
              event.preventDefault()
              startTeamEntry()
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