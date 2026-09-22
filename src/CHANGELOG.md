# Changelog

Significant PowerScorePWA changes are recorded here.

This is a curated product/development changelog, not a replacement for Git history.

## [Unreleased]

### Added

- Add Lifter now works with All Teams selected. New lifter rows include a team-name autocomplete selector limited to teams in the current division, with distinct B Team labels.
- Association-specific team-name autocomplete in Registration and Meet Wizard. Team lists refresh once per app load and persist locally for offline reuse.
- Double-click a Registration sidebar splitter to expand the panel above it to fit its rows, while preserving minimum space for the other panels.
- Meet backup/export/import workflow for complete portable meet files.
- Automatic browser persistence for normal user meets.
- Guided Meet Setup Wizard for first-time users.
- Normal Setup option that creates a meet and immediately places the new meet row into edit mode.
- New-record visibility behavior so newly-added Meet, Division, Team, and Lifter rows are brought into view.

### Changed

- Removed spinner controls from body-weight entry fields in Registration, Bulk Edit, and Platform Issues.
- Team directories now load from `PowerScore.asmx/GetTeams` on all three association websites.
- Team-name autocomplete matches typed text anywhere in a name, case-insensitively.
- Meet Wizard defaults the date to today and starts with empty division/team lists. Matching Add buttons open focused entry rows; Enter continues filled-row entry, Enter on an empty row is ignored, Escape removes an empty row, and Enter outside a row advances to the next step. Step navigation discards blank rows.
- Meet Wizard step 4 now offers only Enter Lifters Manually and Set Up Meet Only; removed the PlatformManager Workflow lifter-entry option.
- Registration's Add Meet button now creates a meet directly in edit mode; an adjacent Meet Wizard button opens Guided Setup without a chooser screen.
- Tools page reorganized into collapsed/expandable tool panels.
- Runner Sheets and Expeditor Cards now contain their own Division selectors inside each tool.
- Tool headers simplified by removing summary/count text from collapsed headers.
- Meet Backup / Transfer help rewritten around user intent and step-by-step tasks.

### Fixed

- Parse `GetTeams` records as `TeamName,Region,Division,UILClass` separated by semicolons, using only team names for autocomplete. Versioned the directory cache to discard previously misparsed lists.
- Expeditor Card association logos now wait for image loading/decoding before print, eliminating intermittent missing logos in print preview/output.

## [2026-09-21] - Main UI stabilization

### Added

- Runner Sheet tool.
- Weight-class selection for Runner Sheets.
- Runner Sheet printing by selected weight class.
- BO/SC/DQ display behavior in Runner Sheets.
- Meet backup/recovery and transfer concepts integrated into the Tools workflow.

### Changed

- Registration left-side Meet/Division/Team layout refined and compacted.
- Registration sizing increased for readability at normal browser zoom.
- Meet and Division default panel heights adjusted to show the intended initial number of rows.
- Division and Team rows display lifter counts with improved spacing.
- Registration row typography normalized.
- Lifter header controls reorganized.
- Tools layout prepared for future utilities.

### Fixed

- Expeditor print timing issue that could intermittently omit the association logo.

## [2026-09-20] - Reports and Expeditor Cards

### Added

- Expeditor Cards tool.
- Association-specific logo support:
  - THSPA
  - THSWPA
  - NMAA
- Card selection by Weight Class, Team, and Lifter.
- Select All / Unselect All controls.
- Blank/test card printing.
- Optional declared first-attempt weights.
- Optional blank BWT, Lifter Number, and Weight Class.
- Optional association-logo omission.
- Optional dividing/cut line.
- Editable card title.
- Summary and Detail reporting refinements.
- Central non-Registration lifter-name suffix formatting.

### Changed

- Expeditor Card physical layout tuned for two cards on US Letter landscape.
- Registration information typography and alignment on cards refined.
- BWT alignment adjusted.
- Report copy/print behavior standardized.

## [2026-09-19] - Competition status behavior

### Changed

- BO, SC, and DQ keyboard-toggle behavior refined.
- Returning from SC/DQ now respects existing three-attempt failure state.
- Cycling a BO lifter's result to a successful result can return the lifter to Active when rule conditions permit.
- Three failed attempts continue to force BO.

### Fixed

- Competition hover guidance no longer suggests result editing when SC/DQ prevents editing.

## [2026-09-18] - Registration and competition workflow

### Added

- Consolidated Registration workflow centered on Meet -> Division -> Team -> Lifter.
- Inline row entry with Tab/Enter behavior.
- Automatic first Meet/Division/Team selection on load.
- Team-required lifter entry.
- Lifter inheritance of selected Division and Team.

### Changed

- Selected Meet information moved into the Meet section.
- Separate Meet Information area removed.
- Competition-class override behavior made persistent after manual selection.

## [2026-09-17] - PowerScorePWA direction

### Added

- Expanded unit coverage around scoring, rules, standings, weight classes, lifter registration, lifter editing, and status management.
- PlatformManager workflow integration and training support continued.

### Changed

- Project direction standardized around one PowerScorePWA codebase supporting Texas and New Mexico rather than separate application versions.

## Project background

PowerScorePWA is the web/PWA modernization of the original PowerScore Windows application first released in 1996.

The modernization goals are:

- preserve proven meet workflows;
- remove Windows-only deployment constraints;
- support offline meet operation;
- integrate with PlatformManager;
- keep results transfer compatible with association operations;
- improve maintainability through TypeScript and automated tests.

## Changelog guidance for Codex

When making a user-visible or architectural change, update the `Unreleased` section.

Add entries under the most appropriate heading:

```text
Added
Changed
Fixed
Removed
```

Do not add changelog entries for trivial formatting-only edits unless they materially affect the UI or behavior.

When a formal release is created, move the relevant `Unreleased` entries into a dated/versioned section rather than deleting them.
