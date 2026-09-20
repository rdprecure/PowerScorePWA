import {
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest'

import {
  configureTrainingPlatformManagerFiles,
  getTrainingPlatformManagerCsv,
  getTrainingPlatformManagerFileCount,
  listProcessedTrainingPlatformManagerFiles,
  listTrainingPlatformManagerFiles,
  markTrainingPlatformManagerFileProcessed,
  resetTrainingPlatformManagerFiles,
} from './platformManagerTraining'


const bestMeetId =
  'TRNG1001'

const attemptsMeetId =
  'TRNG2001'


beforeEach(
  () => {
    configureTrainingPlatformManagerFiles(
      bestMeetId,
      [
        {
          name:
            'TRNG1001__Platform1__Squat__BestLifts.csv',
          csv:
            'Platform,Lifter,Round,Weight,Result,Status\n1,1,0,200,1,0\n',
        },
      ]
    )

    configureTrainingPlatformManagerFiles(
      attemptsMeetId,
      [
        {
          name:
            'TRNG2001__Platform1__Squat__Round1.csv',
          csv:
            'Platform,Lifter,Round,Weight,Result,Status\n1,1,1,200,1,0\n',
        },

        {
          name:
            'TRNG2001__Platform1__Squat__Round2.csv',
          csv:
            'Platform,Lifter,Round,Weight,Result,Status\n1,1,2,210,1,0\n',
        },
      ]
    )
  }
)


describe(
  'PlatformManager training queues',
  () => {

    test(
      'keeps best-lift and all-attempt queues independent',
      () => {
        expect(
          getTrainingPlatformManagerFileCount(
            bestMeetId
          )
        ).toBe(1)

        expect(
          getTrainingPlatformManagerFileCount(
            attemptsMeetId
          )
        ).toBe(2)
      }
    )

    test(
      'training CSV uses current six-column schema',
      () => {
        const file =
          listTrainingPlatformManagerFiles(
            bestMeetId
          )[0]

        const csv =
          getTrainingPlatformManagerCsv(
            bestMeetId,
            file.name
          )

        expect(
          csv.split(/\r?\n/)[0]
        ).toBe(
          'Platform,Lifter,Round,Weight,Result,Status'
        )
      }
    )

    test(
      'processed file moves only in its own queue',
      () => {
        const filename =
          listTrainingPlatformManagerFiles(
            attemptsMeetId
          )[0].name

        markTrainingPlatformManagerFileProcessed(
          attemptsMeetId,
          filename
        )

        expect(
          listTrainingPlatformManagerFiles(
            attemptsMeetId
          )
        ).toHaveLength(1)

        expect(
          listProcessedTrainingPlatformManagerFiles(
            attemptsMeetId
          )
        ).toHaveLength(1)

        expect(
          listTrainingPlatformManagerFiles(
            bestMeetId
          )
        ).toHaveLength(1)
      }
    )

    test(
      'reset restores one queue without changing the other',
      () => {
        const bestFilename =
          listTrainingPlatformManagerFiles(
            bestMeetId
          )[0].name

        const attemptsFilename =
          listTrainingPlatformManagerFiles(
            attemptsMeetId
          )[0].name

        markTrainingPlatformManagerFileProcessed(
          bestMeetId,
          bestFilename
        )

        markTrainingPlatformManagerFileProcessed(
          attemptsMeetId,
          attemptsFilename
        )

        resetTrainingPlatformManagerFiles(
          bestMeetId
        )

        expect(
          listTrainingPlatformManagerFiles(
            bestMeetId
          )
        ).toHaveLength(1)

        expect(
          listTrainingPlatformManagerFiles(
            attemptsMeetId
          )
        ).toHaveLength(1)
      }
    )
  }
)
