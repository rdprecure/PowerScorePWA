import './style.css'

import type {
  Lifter,
} from './models/Lifter'

import type {
  MeetState,
} from './models/MeetState'

import {
  getLifterStatusLabel,
} from './models/LifterStatus'

import {
  THSPA_RULES,
} from './rules/thspa'

import {
  validateLifterCompetitionReadiness,
} from './domain/lifterCompetitionReadiness'

import {
  validateMeetCompetitionReadiness,
} from './domain/meetCompetitionReadiness'


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

  lifters: [
    {
      id: 1,
      lifterNumber: 101,
      firstName: 'John',
      lastName: 'Smith',
      divisionId: 1,
      teamId: 1,
      bodyWeight: 160,
      weightClass: '165',
      weightClassSource:
        'automatic',
      equipmentType:
        'equipped',
      age: 17,
      grade: 11,
      status: 'active',
      isGuest: false,
      isExtraLifter: false,
      declaredDeadliftOpener:
        405,
    },

    {
      id: 2,
      lifterNumber: 102,
      firstName: 'Michael',
      lastName: 'Jones',
      divisionId: 1,
      teamId: 2,
      bodyWeight: 176,
      weightClass: '181',
      weightClassSource:
        'automatic',
      equipmentType:
        'equipped',
      age: 18,
      grade: 12,
      status: 'active',
      isGuest: false,
      isExtraLifter: false,
      declaredDeadliftOpener:
        455,
    },

    {
      id: 3,
      lifterNumber: 103,
      firstName: 'David',
      lastName: 'Williams',
      divisionId: 1,
      teamId: 1,
      bodyWeight: null,
      weightClass: null,
      weightClassSource:
        'automatic',
      equipmentType:
        'equipped',
      age: 16,
      grade: 10,
      status: 'active',
      isGuest: false,
      isExtraLifter: false,
      declaredDeadliftOpener:
        null,
    },

    {
      id: 4,
      lifterNumber: 104,
      firstName: 'Robert',
      lastName: 'Brown',
      divisionId: 1,
      teamId: 2,
      bodyWeight: null,
      weightClass: null,
      weightClassSource:
        'automatic',
      equipmentType:
        'equipped',
      age: 17,
      grade: 11,
      status: 'scratched',
      isGuest: false,
      isExtraLifter: false,
      declaredDeadliftOpener:
        null,
    },
  ],
}


let selectedLifterId:
  number | null =
    meetState.lifters[0]?.id ??
    null


function getSelectedLifter():
  Lifter | null {

  return (
    meetState.lifters.find(
      lifter =>
        lifter.id ===
        selectedLifterId
    ) ??
    null
  )
}


function getTeamName(
  lifter: Lifter,
): string {

  if (
    lifter.teamId === null
  ) {
    return 'Unattached'
  }

  return (
    meetState.teams.find(
      team =>
        team.id ===
        lifter.teamId
    )?.name ??
    'Unknown Team'
  )
}


function getDivisionName(
  lifter: Lifter,
): string {

  return (
    meetState.divisions.find(
      division =>
        division.id ===
        lifter.divisionId
    )?.name ??
    'Unknown Division'
  )
}


function getReadiness(
  lifter: Lifter,
) {

  return (
    validateLifterCompetitionReadiness(
      lifter,
      meetState,
      THSPA_RULES,
    )
  )
}


function getReadinessLabel(
  lifter: Lifter,
): string {

  const readiness =
    getReadiness(lifter)

  if (
    !readiness.requiresReadiness
  ) {
    return 'Not Competing'
  }

  if (
    readiness.ready
  ) {
    return 'Ready'
  }

  return 'Needs Attention'
}


function getReadinessClass(
  lifter: Lifter,
): string {

  const readiness =
    getReadiness(lifter)

  if (
    !readiness.requiresReadiness
  ) {
    return 'not-competing'
  }

  if (
    readiness.ready
  ) {
    return 'ready'
  }

  return 'attention'
}


function renderRoster(): string {

  if (
    meetState.lifters.length === 0
  ) {
    return `
      <div class="empty-roster">
        No lifters have been registered.
      </div>
    `
  }

  return meetState.lifters
    .map(
      lifter => {

        const selected =
          lifter.id ===
          selectedLifterId

        return `
          <button
            type="button"
            class="roster-row ${
              selected
                ? 'selected'
                : ''
            }"
            data-lifter-id="${lifter.id}"
          >
            <span class="roster-number">
              ${lifter.lifterNumber}
            </span>

            <span class="roster-name">
              ${lifter.lastName},
              ${lifter.firstName}
            </span>

            <span class="roster-team">
              ${getTeamName(lifter)}
            </span>

            <span
              class="readiness-badge
                ${getReadinessClass(lifter)}"
            >
              ${getReadinessLabel(lifter)}
            </span>
          </button>
        `
      }
    )
    .join('')
}


function renderReadinessErrors(
  lifter: Lifter,
): string {

  const readiness =
    getReadiness(lifter)

  if (
    !readiness.requiresReadiness
  ) {
    return `
      <div class="readiness-message neutral">
        This lifter is not currently
        competing and is excluded from
        competition readiness checks.
      </div>
    `
  }

  if (
    readiness.ready
  ) {
    return `
      <div class="readiness-message success">
        Registration is complete for
        competition.
      </div>
    `
  }

  return `
    <div class="readiness-message warning">
      <strong>
        Registration needs attention:
      </strong>

      <ul>
        ${readiness.errors
          .map(
            error =>
              `<li>${error.message}</li>`
          )
          .join('')}
      </ul>
    </div>
  `
}


function renderSelectedLifter():
  string {

  const lifter =
    getSelectedLifter()

  if (
    lifter === null
  ) {
    return `
      <div class="no-selection">
        Select a lifter from the roster.
      </div>
    `
  }

  const statusLabel =
    getLifterStatusLabel(
      lifter.status
    )

  return `
    <div class="editor-heading">
      <div>
        <div class="eyebrow">
          Lifter #${lifter.lifterNumber}
        </div>

        <h2>
          ${lifter.firstName}
          ${lifter.lastName}
        </h2>
      </div>

      <span
        class="readiness-badge
          large
          ${getReadinessClass(lifter)}"
      >
        ${getReadinessLabel(lifter)}
      </span>
    </div>

    ${renderReadinessErrors(lifter)}

    <div class="form-section">
      <h3>Registration</h3>

      <div class="form-grid">
        <label>
          <span>Lifter Number</span>
          <input
            value="${lifter.lifterNumber}"
            readonly
          >
        </label>

        <label>
          <span>Status</span>
          <input
            value="${
              statusLabel ||
              'Active'
            }"
            readonly
          >
        </label>

        <label>
          <span>First Name</span>
          <input
            value="${lifter.firstName}"
            readonly
          >
        </label>

        <label>
          <span>Last Name</span>
          <input
            value="${lifter.lastName}"
            readonly
          >
        </label>

        <label>
          <span>Team</span>
          <input
            value="${getTeamName(lifter)}"
            readonly
          >
        </label>

        <label>
          <span>Division</span>
          <input
            value="${getDivisionName(lifter)}"
            readonly
          >
        </label>
      </div>
    </div>

    <div class="form-section">
      <h3>Competition Information</h3>

      <div class="form-grid">
        <label>
          <span>Body Weight</span>
          <input
            value="${
              lifter.bodyWeight ??
              ''
            }"
            placeholder="Not entered"
            readonly
          >
        </label>

        <label>
          <span>Weight Class</span>
          <input
            value="${
              lifter.weightClass ??
              ''
            }"
            placeholder="Not assigned"
            readonly
          >
        </label>

        <label>
          <span>Equipment</span>
          <input
            value="${
              lifter.equipmentType ===
              'equipped'
                ? 'Equipped'
                : 'Unequipped'
            }"
            readonly
          >
        </label>

        <label>
          <span>
            Declared Deadlift Opener
          </span>
          <input
            value="${
              lifter.declaredDeadliftOpener ??
              ''
            }"
            placeholder="Not entered"
            readonly
          >
        </label>

        <label>
          <span>Age</span>
          <input
            value="${
              lifter.age ??
              ''
            }"
            readonly
          >
        </label>

        <label>
          <span>Grade</span>
          <input
            value="${
              lifter.grade ??
              ''
            }"
            readonly
          >
        </label>
      </div>
    </div>

    <div class="registration-flags">
      <span
        class="${
          lifter.isGuest
            ? 'flag active'
            : 'flag'
        }"
      >
        Guest
      </span>

      <span
        class="${
          lifter.isExtraLifter
            ? 'flag active'
            : 'flag'
        }"
      >
        Extra Lifter
      </span>

      <span class="flag">
        Weight Class:
        ${
          lifter.weightClassSource ===
          'manual'
            ? 'Manual'
            : 'Automatic'
        }
      </span>
    </div>
  `
}


function renderApp(): void {

  const meetReadiness =
    validateMeetCompetitionReadiness(
      meetState,
      THSPA_RULES,
    )

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
          <h1>PowerScore</h1>
          <p>
            Powerlifting Meet Management
          </p>
        </div>

        <div class="header-meet">
          <strong>
            ${meetState.meet.name}
          </strong>

          <span>
            ${meetState.meet.association}
          </span>
        </div>

        <div class="version">
          Development Version
        </div>
      </header>

      <nav class="main-nav">
        <button
          class="nav-item active"
          type="button"
        >
          Registration
        </button>

        <button
          class="nav-item"
          type="button"
          disabled
        >
          Competition
        </button>

        <button
          class="nav-item"
          type="button"
          disabled
        >
          Standings
        </button>

        <button
          class="nav-item"
          type="button"
          disabled
        >
          Best Lifters
        </button>

        <button
          class="nav-item"
          type="button"
          disabled
        >
          Reports
        </button>
      </nav>

      <section class="meet-summary">
        <div>
          <span class="summary-label">
            Meet
          </span>
          <strong>
            ${meetState.meet.name}
          </strong>
        </div>

        <div>
          <span class="summary-label">
            Date
          </span>
          <strong>
            ${meetState.meet.date}
          </strong>
        </div>

        <div>
          <span class="summary-label">
            Location
          </span>
          <strong>
            ${meetState.meet.location}
          </strong>
        </div>

        <div>
          <span class="summary-label">
            Lifters
          </span>
          <strong>
            ${meetReadiness.totalLifters}
          </strong>
        </div>

        <div>
          <span class="summary-label">
            Ready
          </span>
          <strong>
            ${meetReadiness.readyLifters}
          </strong>
        </div>

        <div>
          <span class="summary-label">
            Needs Attention
          </span>
          <strong>
            ${meetReadiness.notReadyLifters}
          </strong>
        </div>

        <div>
          <span class="summary-label">
            Not Competing
          </span>
          <strong>
            ${meetReadiness.notCompetingLifters}
          </strong>
        </div>
      </section>

      <main class="registration-workspace">

        <aside class="roster-panel">
          <div class="panel-heading">
            <div>
              <h2>Lifters</h2>
              <span>
                ${meetState.lifters.length}
                registered
              </span>
            </div>

            <button
              type="button"
              class="primary-button"
              disabled
            >
              + Add Lifter
            </button>
          </div>

          <div class="roster-column-headings">
            <span>No.</span>
            <span>Name</span>
            <span>Team</span>
            <span>Status</span>
          </div>

          <div class="roster-list">
            ${renderRoster()}
          </div>
        </aside>

        <section class="lifter-panel">
          ${renderSelectedLifter()}
        </section>

      </main>

    </div>
  `

  document
    .querySelectorAll<HTMLButtonElement>(
      '.roster-row'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          () => {

            const id =
              Number(
                button.dataset
                  .lifterId
              )

            if (
              Number.isNaN(id)
            ) {
              return
            }

            selectedLifterId =
              id

            renderApp()
          }
        )
      }
    )
}


renderApp()