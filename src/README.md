# PowerScorePWA

PowerScorePWA is the modern web/PWA replacement for the long-running PowerScore Windows application used to score high-school powerlifting meets.

The original PowerScore dates to 1996 and was written for Windows/VB6. The current project is a TypeScript/Vite Progressive Web App intended to preserve the familiar meet-director workflow while removing the dependency on a Windows-only desktop install.

> Target production season: 2027-2028

## Project goals

PowerScorePWA should:

- run on modern Windows, macOS, and Chromebook-class systems through a browser/PWA;
- remain usable during a meet even when Internet access is unavailable;
- preserve the workflows meet directors already know from PowerScore;
- support both Texas and New Mexico rule sets in one application;
- integrate with PlatformManager rather than replace it;
- keep scoring and business rules deterministic and testable;
- allow meets to be backed up, exported, imported, and moved between computers;
- minimize disruption to the established results-upload workflow.

Modernize the technology without unnecessarily changing how a powerlifting meet is conducted.

## Current technology

The current application is built with:

- TypeScript
- Vite
- Vitest
- browser/PWA APIs
- browser `localStorage` for persistent user-meet data

The current UI is implemented primarily in `src/main.ts` using TypeScript, HTML template rendering, DOM event handlers, and `src/style.css`.

Do **not** migrate the current UI to another framework or redesign the architecture unless that change has been explicitly requested.

## Local project

Typical development location:

```text
C:\Appl\PowerScoreWeb
```

Git repository:

```text
PowerScore-PWA
```

## Common commands

Install dependencies:

```powershell
npm install
```

Run the development server:

```powershell
npm run dev
```

Run unit tests:

```powershell
npm test
```

Create a production build:

```powershell
npm run build
```

Before considering a change complete, run both:

```powershell
npm test
npm run build
```

Do not report a clean test/build unless the commands were actually run successfully.

## Main application areas

PowerScore currently includes these major areas:

- Registration
- Competition
- Standings
- Best Lifters
- Best Lifts
- Summary
- Detail
- Tools
- Platform Issues
- Help

### Registration hierarchy

The primary data hierarchy is:

```text
Meet
  Division
    Team
      Lifter
```

Registration behavior is intentionally hierarchical:

- selecting a Meet shows all lifters in the meet;
- selecting a Division shows lifters in that division;
- selecting a Team shows lifters for that team within the selected division;
- a Team must be selected before adding a lifter;
- new lifters inherit the selected Division and Team;
- Division and Team are therefore not separate dropdowns in the normal lifter-entry row.

Meet, Division, Team, and Lifter entry use inline rows. New rows should always be brought into view so a newly-created record is not hidden below a scroll boundary.

## Associations and rules

Supported rule sets are:

- `THSPA`
- `THSWPA`
- `NMAA_BOYS`
- `NMAA_GIRLS`

Important rules include:

### Texas team scoring

```text
1st = 7
2nd = 5
3rd = 3
4th = 2
5th = 1
```

Texas individual placing is based on highest total, with lighter body weight used as a tie-breaker where applicable.

### NMAA

NMAA uses the same 7-5-3-2-1 team scoring scale, with additional team-roster/scoring restrictions implemented in the rule layer.

### Best Lifter

Best Lifter is an awards calculation only and does not contribute to team scoring.

- Boys use Schwartz.
- Girls use Malone.

## Competition modes

PowerScore supports two result-entry modes:

1. Best Lift
2. All Attempts

Common lifter statuses include:

- Active
- BO — Bombed Out
- SC — Scratched
- DQ — Disqualified

Competition status keyboard shortcuts currently include:

```text
a = Active
b = BO
s = SC
q = DQ
```

Status transitions are rule-aware. For example, a lifter with a true three-attempt failure cannot simply be changed to Active if the competition results still require BO status.

## Weight-class behavior

A lifter's competition class is initially assigned from body weight.

If the user manually changes the competition class, that manual override must persist. Later body-weight edits must not silently overwrite the manual class selection.

This behavior is important and should be preserved in any registration or import changes.

## PlatformManager

PlatformManager remains the platform-side capture tool.

PowerScorePWA:

- generates/uses a Platform MeetID;
- reads PlatformManager result submissions;
- processes result files/submissions into the correct meet;
- identifies incomplete registration when imported platform data references a lifter that is not fully registered;
- supports training/test PlatformManager data separately from normal user meets.

Relevant integration code is under:

```text
src/integration/platformManager.ts
```

Training support is under:

```text
src/training/platformManagerTraining.ts
```

Do not create a second competing PlatformManager import architecture without a compelling reason.

## Meet backup, export, and import

PowerScore supports downloaded meet files for:

- live-meet backup/recovery;
- long-term storage;
- transferring a meet to another computer.

The current file envelope is versioned and identifies itself as a PowerScore meet file.

Conceptually:

```text
PowerScoreMeet
  formatVersion
  createdAt
  purpose: backup | export
  meet
```

Import validation should remain defensive. Unsupported or malformed meet files must not silently replace current data.

Before replacing an existing meet during import, PowerScore should preserve the user's ability to recover the existing copy.

## Browser persistence

Normal user meets are automatically persisted in browser `localStorage`.

Current storage key:

```text
powerscore-pwa-user-meets-v1
```

Current browser-save behavior:

- user meets are saved about every 2 seconds;
- user meets are also saved on `pagehide`;
- built-in Development, Training, and Test meets are excluded from normal persistent user storage.

Downloaded backup/export files are separate from browser storage and are the portable recovery mechanism.

## Tools

The Tools page uses collapsed tool panels so additional utilities can be added without making the page unwieldy.

Current tools include:

- Meet Backup / Transfer
- Runner Sheets
- Expeditor Cards

Runner Sheets and Expeditor Cards contain their own Division selection controls; those controls are hidden until the corresponding tool is expanded.

### Runner Sheets

Runner Sheets are generated by weight class and sorted by Lifter Number.

They support blank best-lift columns or current result values, including appropriate BO/SC/DQ indicators.

### Expeditor Cards

Expeditor Cards are printable paper cards used during meet operation.

Important physical/output rules include:

- US Letter landscape;
- two cards per page;
- side-by-side;
- optional dividing/cut line;
- association logo support;
- paper Expeditor cards are authoritative if an electronic/paper discrepancy occurs.

Association logo assets are:

```text
public/assets/associations/thspa-logo.png
public/assets/associations/thswpa-logo.jpg
public/assets/associations/nmaa-logo.png
```

The print process intentionally waits for association-logo images to load/decode before calling `window.print()`.

## Meet Setup Wizard

`+ Add` Meet offers two creation paths:

- Normal Setup
- Guided Setup

Normal Setup creates a new Meet row and puts it directly into edit mode.

Guided Setup walks a new user through meet information, divisions, teams, and how lifters will be added.

The wizard is an optional guide over the existing data model. It must not create a separate parallel meet-configuration architecture.

## Display-name conventions

Outside Registration, lifter names may include status/category suffixes:

- B-team: `(B)`
- Guest: `(G)`
- Unequipped: `(U)`

Combinations are allowed where appropriate.

Registration intentionally displays the plain lifter name.

Use the existing centralized display-name helpers rather than reproducing suffix logic in individual reports.

## Development guidance for Codex

Before making a non-trivial change:

1. Read this file.
2. Read `ARCHITECTURE.md`.
3. Check `ROADMAP.md` for planned work.
4. Check `CHANGELOG.md` for recent behavior changes.
5. Inspect the existing implementation before creating new abstractions.

When editing:

- preserve established meet-director workflows unless the task explicitly changes them;
- keep deterministic scoring/business rules out of ad-hoc UI code when a domain/rules module is appropriate;
- extend existing helpers instead of duplicating logic;
- do not silently change association rules;
- do not change serialized meet-file formats without versioning/migration consideration;
- do not break existing PlatformManager integration;
- preserve offline-capable behavior;
- add or update tests when business rules change;
- prefer focused changes over broad refactors;
- avoid unrelated formatting churn.

After editing:

```powershell
npm test
npm run build
```

If either command fails, report the failure and do not describe the change as fully validated.

## Documentation

Additional project documentation:

- `ARCHITECTURE.md` — system structure, data boundaries, and design rules
- `ROADMAP.md` — completed areas and remaining work
- `CHANGELOG.md` — significant project changes
