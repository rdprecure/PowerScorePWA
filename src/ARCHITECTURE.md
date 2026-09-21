# PowerScorePWA Architecture

This document describes the current architecture and the design constraints that should guide future changes.

## 1. Architectural principles

PowerScorePWA follows several practical principles:

1. **Meet operation comes first.** The application must remain usable and understandable during a live powerlifting meet.
2. **Business rules are deterministic.** Scoring, placing, weight-class assignment, status rules, and association restrictions should be implemented as explicit code, not inferred dynamically.
3. **The UI should use the domain, not redefine it.** Avoid copying scoring or rule logic into click handlers, reports, or print code.
4. **Offline-capable operation is a core requirement.** A meet should not depend on continuous Internet access after the application has been installed/cached.
5. **Portable meet files are the disaster-recovery boundary.** Browser storage is convenient persistence; downloaded backup/export files are the portable recovery mechanism.
6. **PlatformManager and PowerScore have separate responsibilities.** PlatformManager captures platform activity; PowerScore performs meet-wide scoring, registration, reporting, and results workflows.
7. **Existing meet-director workflow has value.** Modernization should not introduce workflow change merely for architectural elegance.

## 2. Current source structure

The current UI composition root is:

```text
src/main.ts
```

Primary application styling is:

```text
src/style.css
```

`src/main.ts` is currently large and contains application state coordination, HTML rendering, event wiring, reporting/printing coordination, tools, persistence, and integrations.

This is a known characteristic of the current application.

Do not perform a broad decomposition/refactor of `main.ts` unless specifically requested. When extracting code, do so incrementally and only where ownership is clear.

### Models

Core model definitions include files such as:

```text
src/models/MeetState.ts
src/models/Division.ts
src/models/Team.ts
src/models/Lifter.ts
src/models/Competition.ts
```

The central aggregate is conceptually:

```text
MeetState
  meet
  divisions[]
  teams[]
  lifters[]
```

PowerScore also tracks Division-to-Team membership outside the simple model arrays where required by the current UI/state layer.

### Domain modules

Examples of domain logic currently imported by the UI include:

```text
src/domain/lifterRegistration.ts
src/domain/weightClassAssignment.ts
src/domain/lifterCompetitionReadiness.ts
src/domain/competitionProgress.ts
src/domain/competitionMissingResults.ts
src/domain/standings.ts
```

These modules are preferred homes for reusable meet-domain behavior.

### Rules

Association-specific behavior is accessed through the rule layer, including:

```text
src/rules/divisionRules.ts
```

Supported rule sets:

```text
THSPA
THSWPA
NMAA_BOYS
NMAA_GIRLS
```

Association rules must not be inferred from UI labels. Use the existing rule-set values and rule-resolution functions.

### Scoring

Scoring is implemented in dedicated scoring modules and is covered by Vitest tests.

Existing test/module names show separate concepts for:

- division scoring;
- individual scoring;
- team scoring;
- team standings;
- Best Lifter placing;
- Texas division pipelines;
- NMAA logic;
- coefficient calculations;
- weight classes and totals.

Preserve this separation when new scoring behavior is added.

### Integration

PlatformManager integration lives under:

```text
src/integration/platformManager.ts
```

Training-specific PlatformManager behavior lives under:

```text
src/training/platformManagerTraining.ts
```

The normal application and training/test behavior should remain distinguishable so training fixtures do not contaminate user-meet persistence.

## 3. Application state

At runtime, the UI works with local meet aggregates.

Conceptually:

```text
LocalMeet
  state: MeetState
  divisionTeams: DivisionTeam[]
```

Selection state is maintained separately for UI navigation, including values such as:

```text
selectedMeetId
selectedDivisionId
selectedTeamId
```

The Registration UI depends on this hierarchy.

### Selection behavior

Expected Registration selection semantics:

```text
Meet selected
  -> show all lifters in that meet

Division selected
  -> show all lifters in that division

Team selected
  -> show lifters for that team within the selected division
```

New lifters inherit the selected Division and Team.

A Team must be selected before lifter creation.

## 4. Meet identity and Platform MeetID

PowerScore's internal meet identity and the Platform MeetID serve different purposes.

The Platform MeetID associates PlatformManager submissions with the correct PowerScore meet.

Do not assume that a display name is a stable integration key.

If Platform MeetID handling changes, consider:

- existing PlatformManager stations;
- pending result submissions;
- imported/exported meet files;
- duplicate MeetID detection;
- training/test MeetIDs.

## 5. Weight-class assignment

Weight-class assignment has two modes of ownership:

```text
automatic
manual
```

Typical behavior:

1. Body weight is entered.
2. PowerScore determines the automatic competition class.
3. A user may manually override that class.
4. Once manually overridden, later body-weight changes must not automatically overwrite the user's selected class.

Any future registration import, bulk-edit, wizard, or PlatformManager workflow must preserve this rule.

## 6. Lifter status state machine

Primary competition statuses include:

```text
active
BO
SC
DQ
```

Status behavior is not just cosmetic.

Examples:

- three failed attempts in a lift can force BO;
- correcting the attempt results can remove an automatically-derived BO where rules allow;
- SC and DQ prevent competition-result editing;
- when leaving SC or DQ, a lifter may return to BO rather than Active if competition results still require BO.

Do not implement status changes as simple string toggles without using/maintaining the existing status rules.

## 7. Competition modes

PowerScore supports:

```text
Best Lift
All Attempts
```

Best Lift stores/works with the accepted best result per lift.

All Attempts tracks attempt-level results and derives competition totals from them.

Reports, PlatformManager import, reset behavior, status handling, and validation may vary by result-entry mode.

Any code that touches competition results should test both modes unless the feature is explicitly mode-specific.

## 8. Standings and awards

Core outputs include:

- individual standings;
- team standings;
- Best Lifter;
- Best Lifts;
- Summary;
- Detail.

Best Lifter is an award calculation only. It does not add team points.

Coefficient conventions currently include:

```text
Boys -> Schwartz
Girls -> Malone
```

Do not collapse awards logic into team scoring.

## 9. Display-name formatting

Outside Registration, PowerScore uses centralized helpers to append qualifiers to lifter names.

Current suffix conventions:

```text
B-team      -> (B)
Guest       -> (G)
Unequipped  -> (U)
```

Registration shows the plain name.

Reports and copied output should use the centralized formatting helpers so all screens remain consistent.

## 10. Persistence architecture

### Browser persistence

Normal user meets are serialized into browser `localStorage`.

Current key:

```text
powerscore-pwa-user-meets-v1
```

Current format version:

```text
1
```

Current behavior:

- persistence runs every 2 seconds;
- persistence also runs on `pagehide`;
- built-in development, training, and test meets are excluded.

Browser persistence is a convenience and continuity feature, not the only backup strategy.

### Downloaded meet files

PowerScore uses a versioned portable envelope.

Current conceptual schema:

```text
PowerScoreMeetFile {
  fileType: "PowerScoreMeet"
  formatVersion: 1
  createdAt: string
  purpose: "backup" | "export"
  meet: LocalMeet
}
```

The same complete-meet payload supports both backup and transfer use cases.

Any schema change must consider backward compatibility. Prefer adding a new format version and explicit migration rather than silently changing the meaning of version 1.

### Import safety

Meet import should:

1. parse the file;
2. verify it is a supported PowerScore meet file;
3. validate basic meet/division/team/lifter structure;
4. detect meaningful identity conflicts;
5. preserve a recovery path before replacing an existing meet.

Never trust a user-selected JSON file merely because it parses.

## 11. PWA/offline boundary

PowerScore is intended to operate without Internet access during normal meet scoring after initial installation/caching.

Features fall into two groups:

### Should work offline during a meet

Examples:

- Registration
- Competition scoring
- Standings
- Reports
- Printing
- Runner Sheets
- Expeditor Cards
- meet backup/export
- meet import from a local file
- browser persistence
- local scoring calculations

### May require network access

Examples include workflows that communicate with remote web services, such as:

- publishing/updating remote Live Meets;
- delivering results through an online endpoint;
- retrieving remote PlatformManager submissions when that integration is using the hosted handler;
- application installation/update retrieval.

Before production release, perform an explicit offline acceptance test rather than assuming that the PWA cache covers every required asset.

## 12. PlatformManager flow

PlatformManager remains the capture tool at the lifting platform.

The current integration handles:

- Platform MeetID creation/use;
- submission discovery;
- submission parsing;
- processed/unprocessed tracking;
- application of platform results;
- Platform Issues when imported data cannot be cleanly applied;
- training fixtures.

PowerScore must not assume PlatformManager data is sufficient to establish all Registration facts. Imported platform activity can identify that a lifter needs registration completion.

## 13. Tools architecture

The Tools page is an expandable/collapsible utility area.

Current tools:

```text
Meet Backup / Transfer
Runner Sheets
Expeditor Cards
```

Tool headers should remain compact.

Tool-specific controls should live inside the expanded tool. For example, Runner Sheets and Expeditor Cards each contain their own Division selector rather than exposing a shared selector when the tools are collapsed.

This pattern is intentional because more tools may be added later.

## 14. Printing

Printing is browser-based and uses print-specific CSS.

Expeditor Cards have additional requirements:

- Letter landscape;
- two cards side-by-side;
- optional cut/divider line;
- association logo;
- stable physical formatting.

The Expeditor print path waits for association logo images to load/decode before calling `window.print()` to prevent intermittent missing logos in print preview/output.

Do not replace that wait with an immediate print call.

## 15. Meet Setup Wizard

The wizard is a guided UI over the existing model and Registration behavior.

Adjacent buttons in the Registration Meets section:

```text
+ Add
Meet Wizard
```

`+ Add`:

- creates a new meet;
- selects it;
- places its row into the normal edit state.

`Meet Wizard` opens Guided Setup directly and walks a new user through initial configuration.

The wizard should call/reuse the same domain behavior used by normal Registration. Do not build duplicate rule, team, or lifter logic specifically for the wizard.

## 16. New-record visibility

Newly-created records can otherwise be added outside a scrollable panel's visible area.

The established UX behavior is to bring new/blank rows into view for:

- Meets;
- Divisions;
- Teams;
- Lifters.

Preserve this when changing list rendering.

## 17. Tests

Vitest is the project's unit-test runner.

The existing suite covers substantial domain/scoring behavior.

When changing:

- scoring;
- placing;
- association rules;
- weight-class behavior;
- lifter status rules;
- readiness rules;
- team-scoring eligibility;
- serialization/import rules;

add or update tests in the corresponding module area.

UI-only changes may not always require new unit tests, but they must still pass the existing suite and build.

## 18. Guidance for future refactoring

There are legitimate future opportunities to split `src/main.ts`, but do not do so as a drive-by cleanup.

If decomposition is explicitly requested, preferred extraction candidates are modules with clear ownership, for example:

```text
src/persistence/...
src/tools/...
src/printing/...
src/ui/registration/...
src/ui/competition/...
```

A safe extraction should:

1. preserve behavior first;
2. move one cohesive responsibility at a time;
3. keep tests passing after each step;
4. avoid mixing architectural refactor with domain-rule changes.

## 19. Codex change checklist

Before changing code:

- identify the existing owner of the behavior;
- search for existing helpers and tests;
- check whether behavior differs by association or competition mode;
- check whether serialized meet data is affected;
- check whether offline behavior is affected.

After changing code:

```powershell
npm test
npm run build
```

Then summarize:

- files changed;
- behavior changed;
- tests/build run;
- any unresolved issue or assumption.
