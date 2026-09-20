# PowerScore Training Scenarios

Both training meets are self-restoring. If a user deletes one, opening or resetting it from Help recreates it.

## Roster design
- 2 divisions: THSPA boys and THSWPA girls
- 6 teams shared across both divisions:
  - Levelland
  - Gainesville
  - Sulphur Springs
  - Brenham
  - Uvalde
  - Alice
- 4 B-team/extra lifters per division
- every available weight class represented
- 5 to 15 lifters per weight class
- weight-class counts follow a randomized bell curve

## Platform assignment
- 6 platforms
- boys and girls compete on the same platforms
- each weight class stays intact on one platform
- classes are ordered by body weight
- lighter classes are assigned to early platforms
- heavier classes are assigned to later platforms
- contiguous groups of similar body-weight classes are kept together
- platform balancing targets as close to the same lifter count as possible
- middle platforms naturally receive fewer weight classes because middle classes have more lifters

## Lift generation
Training weights are deterministic so Reset reproduces the same scenario.
For every lifter:
- Squat is the heaviest lift
- Deadlift is between Squat and Bench
- Bench is the lightest lift
- values vary by lifter and are rounded to 5-lb increments
- all-attempt weights progress across attempts

## Best Lift — TRNG1001
- Squat BestLifts: clean imports on all 6 platforms
- Bench BestLifts: mostly clean; Platform 3 introduces unknown lifter #999
- Deadlift BestLifts: selected later platforms introduce missing-result and BO/SC status practice

## All Attempts — TRNG2001
- Squat Round 1: clean
- Squat Round 2: normal mix of good/failed judged attempts
- Squat Round 3: natural bomb-out practice
- Bench Round 2: selected later platforms contain a skipped attempt
- Bench Round 3: Platform 3 introduces unknown lifter #998
- Deadlift Round 2: Platform 5/6 introduce SC/DQ practice
- Deadlift Round 3: selected later platforms contain a skipped final attempt

## Missing-results review
Starting Review Missing Results automatically changes the Competition filter to All Weight Classes so every flagged result is visible.

Training queues are generated in memory and never use the production PlatformManager endpoint.
