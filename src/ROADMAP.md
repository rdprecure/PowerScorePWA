# PowerScorePWA Roadmap

This roadmap reflects the current project direction as of September 2026.

Target production season:

```text
2027-2028
```

The emphasis now is less on basic UI construction and more on integration, recovery, offline confidence, and production hardening.

## Status key

- ✅ Implemented / substantially complete
- 🟡 Implemented but still needs acceptance testing or refinement
- ⬜ Planned / remaining

## 1. Core meet model and rules

- ✅ Meet / Division / Team / Lifter hierarchy
- ✅ THSPA rules
- ✅ THSWPA rules
- ✅ NMAA Boys rules
- ✅ NMAA Girls rules
- ✅ Texas 7-5-3-2-1 team scoring
- ✅ NMAA team-scoring restrictions
- ✅ Best Lifter awards
- ✅ Schwartz / Malone coefficient handling
- ✅ automatic weight-class assignment
- ✅ persistent manual weight-class override
- ✅ competition-readiness validation
- ✅ BO / SC / DQ status handling

## 2. Registration

- ✅ hierarchical Meet / Division / Team navigation
- ✅ inline Meet entry
- ✅ inline Division entry
- ✅ inline Team entry
- ✅ inline Lifter entry
- ✅ lifters inherit selected Division and Team
- ✅ bulk editing
- ✅ compact meet information
- ✅ automatic initial selection
- ✅ newly-added Meet rows brought into view
- ✅ newly-added Division rows brought into view
- ✅ newly-added Team rows brought into view
- ✅ newly-added Lifter rows brought into view
- 🟡 continued usability polish as real users test the workflow

## 3. Meet Setup Wizard

- ✅ optional Guided Setup
- ✅ separate Add and Meet Wizard buttons in the Meets section
- ✅ Add creates a new meet and enters normal row-edit mode; Meet Wizard opens Guided Setup directly
- ✅ Guided Setup covers core initial configuration
- ⬜ conduct first-time-user usability testing
- ⬜ refine wording/steps based on beta feedback
- ⬜ decide whether any additional contextual help is useful without making the wizard longer

The wizard should remain optional and should not replace the normal Registration workflow.

## 4. Competition

- ✅ Best Lift mode
- ✅ All Attempts mode
- ✅ attempt-result cycling/editing
- ✅ BO/SC/DQ keyboard shortcuts
- ✅ automatic BO behavior from failed lifts
- ✅ clearing BO when corrected results permit it
- ✅ result-edit restrictions for SC/DQ
- ✅ live subtotals/totals
- ✅ continuous placing
- ✅ correction workflow
- 🟡 continue full-meet regression testing with realistic data

## 5. PlatformManager integration

- ✅ Platform MeetID generation/use
- ✅ submission discovery/parsing
- ✅ application of PlatformManager results
- ✅ incomplete-registration handling
- ✅ Platform Issues workflow
- ✅ training/test PlatformManager support
- 🟡 extended live-meet testing with multiple platforms
- 🟡 validate failure/retry behavior under poor connectivity

## 6. Reports and print output

- ✅ Standings
- ✅ Best Lifters
- ✅ Best Lifts
- ✅ Summary
- ✅ Detail
- ✅ formatted copy options
- ✅ Runner Sheets
- ✅ Expeditor Cards
- ✅ association logos
- ✅ Expeditor logo print-race fix
- 🟡 print testing on representative browsers/printers
- 🟡 verify page scaling/margins under real meet printer configurations

## 7. Tools organization

- ✅ expandable/collapsible Tools page
- ✅ Meet Backup / Transfer
- ✅ Runner Sheets
- ✅ Expeditor Cards
- ✅ tool-specific Division selectors hidden until the tool is expanded
- ⬜ add future utilities using the same collapsed-tool pattern

## 8. Meet persistence, backup, export, and import

- ✅ automatic user-meet browser persistence
- ✅ timestamped live-meet backups
- ✅ portable complete-meet export
- ✅ complete-meet import
- ✅ basic import validation
- ✅ conflict warning/recovery behavior
- ✅ versioned meet-file envelope
- 🟡 test restore from multiple points during a realistic meet
- 🟡 test transfer between different computers/browsers
- 🟡 test import of damaged/invalid files
- 🟡 document compatibility expectations for future meet-file versions

## 9. Send results to directors

- ⬜ finalize the PowerScorePWA results-file generation workflow
- ⬜ preserve the familiar process:
  - PowerScore creates the results file
  - meet director sends it to the appropriate director
  - director uploads it to the association website
- ⬜ determine the preferred browser/PWA send experience
- ⬜ verify that generated files remain compatible with the website import process
- ⬜ add clear success/failure guidance for meet directors

This feature should preserve the existing operational workflow rather than introducing unnecessary server dependency.

## 10. Live Meets

- ⬜ implement/finish PowerScorePWA Live Meets update workflow
- ⬜ define the exact payload from current PowerScore data
- ⬜ determine update timing/frequency
- ⬜ handle network failures without interrupting scoring
- ⬜ queue/retry or clearly signal failed updates
- ⬜ ensure remote updates cannot corrupt authoritative local meet data
- ⬜ test intermittent Internet connectivity

The local PowerScore meet remains authoritative for scoring. Live Meets is a publishing/output concern.

## 11. Offline/PWA readiness

- 🟡 initial installation requires Internet access
- 🟡 normal meet operation is intended to work offline after installation/caching
- ⬜ perform a formal offline acceptance test covering:
  - app startup
  - Registration
  - Competition
  - Standings
  - all reports
  - printing
  - Runner Sheets
  - Expeditor Cards
  - backup/export
  - import
  - browser persistence
- ⬜ confirm all fonts/images/assets required during a meet are cached or bundled
- ⬜ verify behavior when connectivity disappears after the app starts
- ⬜ verify application-update behavior and user messaging

## 12. Results/security workflow

- 🟡 maintain controlled/compatible results generation
- ⬜ finalize integrity/security decisions around the website-import payload
- ⬜ confirm how much protection is required against hand-edited result files
- ⬜ document the trust boundary between PowerScorePWA, email/file transfer, and the association website

## 13. Beta release

- ⬜ create beta release package/build
- ⬜ provide to association officers/directors
- ⬜ test on Windows laptops
- ⬜ test installed PWA behavior
- ⬜ test browser-only behavior
- ⬜ test Chromebook/macOS where available
- ⬜ gather first-time-user feedback
- ⬜ gather experienced PowerScore-user feedback
- ⬜ fix beta issues before broader release

## 14. Production hardening

Before production release:

- ⬜ all tests passing
- ⬜ clean production build
- ⬜ no known data-loss path
- ⬜ successful backup/restore drill
- ⬜ successful computer-to-computer transfer drill
- ⬜ successful full-meet scoring test
- ⬜ successful PlatformManager multi-platform test
- ⬜ successful results-file website-import test
- ⬜ successful Live Meets test
- ⬜ successful offline meet test
- ⬜ print validation
- ⬜ browser/PWA update strategy documented

## Deferred / not currently required

The following are not current priorities unless requirements change:

- a dedicated platform-projection display inside PowerScorePWA;
- replacing PlatformManager as the platform display/capture tool;
- large-scale UI framework migration;
- cloud-only meet storage;
- team-centered development/process tooling for a multi-developer organization.

## Near-term recommended sequence

Current practical sequence:

1. harden backup/export/import with real recovery tests;
2. validate the Meet Setup Wizard with a first-time-user perspective;
3. finish/send results to directors workflow;
4. implement/finish Live Meets publishing;
5. run comprehensive offline acceptance testing;
6. beta release;
7. production hardening for the 2027-2028 season.
