export interface StandingsLifterInput {
  id: number
  lifterNumber: number
  firstName: string
  lastName: string
  teamId: number | null
  bodyWeight: number | null
  weightClass: string | null
  status: string
  isGuest: boolean
  isExtraLifter: boolean
  squat: number | null
  bench: number | null
  deadlift: number | null
}

export interface IndividualStanding {
  lifterId: number
  lifterNumber: number
  firstName: string
  lastName: string
  teamId: number | null
  bodyWeight: number
  weightClass: string
  place: number
  total: number
  isExtraLifter: boolean
}

export interface TeamStanding {
  teamId: number
  firsts: number
  seconds: number
  thirds: number
  fourths: number
  fifths: number
  totalPoints: number
  place: number
}

const TEAM_POINTS =
  [7, 5, 3, 2, 1] as const

function getCompletedTotal(
  lifter: StandingsLifterInput,
): number | null {

  if (
    lifter.status !== 'active' ||
    lifter.isGuest ||
    lifter.weightClass === null ||
    lifter.bodyWeight === null ||
    lifter.squat === null ||
    lifter.bench === null ||
    lifter.deadlift === null
  ) {
    return null
  }

  return (
    lifter.squat +
    lifter.bench +
    lifter.deadlift
  )
}

export function calculateIndividualStandings(
  lifters:
    readonly StandingsLifterInput[],
): IndividualStanding[] {

  const byClass =
    new Map<
      string,
      StandingsLifterInput[]
    >()

  lifters.forEach(
    lifter => {
      if (
        getCompletedTotal(
          lifter
        ) === null
      ) {
        return
      }

      const weightClass =
        lifter.weightClass as string

      const existing =
        byClass.get(
          weightClass
        ) ?? []

      existing.push(
        lifter
      )

      byClass.set(
        weightClass,
        existing
      )
    }
  )

  const result:
    IndividualStanding[] =
    []

  byClass.forEach(
    classLifters => {
      const ordered =
        [...classLifters]
          .sort(
            (
              a,
              b
            ) => {
              const totalA =
                getCompletedTotal(
                  a
                ) as number

              const totalB =
                getCompletedTotal(
                  b
                ) as number

              if (
                totalA !==
                totalB
              ) {
                return (
                  totalB -
                  totalA
                )
              }

              const bodyWeightA =
                a.bodyWeight as number

              const bodyWeightB =
                b.bodyWeight as number

              if (
                bodyWeightA !==
                bodyWeightB
              ) {
                return (
                  bodyWeightA -
                  bodyWeightB
                )
              }

              return (
                a.lifterNumber -
                b.lifterNumber
              )
            }
          )

      ordered.forEach(
        (
          lifter,
          index
        ) => {
          result.push({
            lifterId:
              lifter.id,
            lifterNumber:
              lifter.lifterNumber,
            firstName:
              lifter.firstName,
            lastName:
              lifter.lastName,
            teamId:
              lifter.teamId,
            bodyWeight:
              lifter.bodyWeight as number,
            weightClass:
              lifter.weightClass as string,
            place:
              index + 1,
            total:
              getCompletedTotal(
                lifter
              ) as number,
            isExtraLifter:
              lifter.isExtraLifter,
          })
        }
      )
    }
  )

  return result
}

export function calculateTeamStandings(
  individual:
    readonly IndividualStanding[],
): TeamStanding[] {

  const byTeam =
    new Map<
      number,
      Omit<
        TeamStanding,
        'place'
      >
    >()

  individual.forEach(
    standing => {
      if (
        standing.teamId === null ||
        standing.isExtraLifter ||
        standing.place >
          TEAM_POINTS.length
      ) {
        return
      }

      const row =
        byTeam.get(
          standing.teamId
        ) ?? {
          teamId:
            standing.teamId,
          firsts: 0,
          seconds: 0,
          thirds: 0,
          fourths: 0,
          fifths: 0,
          totalPoints: 0,
        }

      row.totalPoints +=
        TEAM_POINTS[
          standing.place - 1
        ]

      switch (
        standing.place
      ) {
        case 1:
          row.firsts += 1
          break

        case 2:
          row.seconds += 1
          break

        case 3:
          row.thirds += 1
          break

        case 4:
          row.fourths += 1
          break

        case 5:
          row.fifths += 1
          break
      }

      byTeam.set(
        standing.teamId,
        row
      )
    }
  )

  const rows =
    Array.from(
      byTeam.values()
    )
      .sort(
        (
          a,
          b
        ) => {
          if (
            a.totalPoints !==
            b.totalPoints
          ) {
            return (
              b.totalPoints -
              a.totalPoints
            )
          }

          const placeCountsA =
            [
              a.firsts,
              a.seconds,
              a.thirds,
              a.fourths,
              a.fifths,
            ]

          const placeCountsB =
            [
              b.firsts,
              b.seconds,
              b.thirds,
              b.fourths,
              b.fifths,
            ]

          for (
            let index = 0;
            index <
            placeCountsA.length;
            index += 1
          ) {
            if (
              placeCountsA[index] !==
              placeCountsB[index]
            ) {
              return (
                placeCountsB[index] -
                placeCountsA[index]
              )
            }
          }

          return (
            a.teamId -
            b.teamId
          )
        }
      )

  return rows.map(
    (
      row,
      index
    ) => ({
      ...row,
      place:
        index + 1,
    })
  )
}
