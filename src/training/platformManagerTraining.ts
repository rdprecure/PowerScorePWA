export const TRAINING_BEST_LIFT_MEET_ID =
  'powerscore-training-best-lift'

export const TRAINING_BEST_LIFT_PLATFORM_MEET_ID =
  'TRNG1001'

export const TRAINING_ALL_ATTEMPTS_MEET_ID =
  'powerscore-training-all-attempts'

export const TRAINING_ALL_ATTEMPTS_PLATFORM_MEET_ID =
  'TRNG2001'


interface TrainingPlatformFile {
  name: string
  csv: string
}


const trainingFilesByMeetId =
  new Map<
    string,
    Map<string, string>
  >()


const processedFilesByMeetId =
  new Map<
    string,
    Set<string>
  >()


function getTrainingFiles(
  platformMeetId: string,
): Map<string, string> {

  const files =
    trainingFilesByMeetId.get(
      platformMeetId
    )

  if (
    files === undefined
  ) {
    throw new Error(
      `Training PlatformManager queue is not configured for ${platformMeetId}.`
    )
  }

  return files
}


function getProcessedFiles(
  platformMeetId: string,
): Set<string> {

  let processed =
    processedFilesByMeetId.get(
      platformMeetId
    )

  if (
    processed === undefined
  ) {
    processed =
      new Set<string>()

    processedFilesByMeetId.set(
      platformMeetId,
      processed
    )
  }

  return processed
}


export function configureTrainingPlatformManagerFiles(
  platformMeetId: string,
  files: readonly TrainingPlatformFile[],
): void {

  trainingFilesByMeetId.set(
    platformMeetId,
    new Map(
      files.map(
        file => [
          file.name,
          file.csv,
        ]
      )
    )
  )

  processedFilesByMeetId.set(
    platformMeetId,
    new Set<string>()
  )
}


export function listTrainingPlatformManagerFiles(
  platformMeetId: string,
):
  Array<{
    name: string
  }> {

  const files =
    getTrainingFiles(
      platformMeetId
    )

  const processed =
    getProcessedFiles(
      platformMeetId
    )

  return Array.from(
    files.keys()
  )
    .filter(
      filename =>
        !processed.has(
          filename
        )
    )
    .map(
      name => ({
        name,
      })
    )
}


export function listProcessedTrainingPlatformManagerFiles(
  platformMeetId: string,
):
  Array<{
    name: string
  }> {

  return Array.from(
    getProcessedFiles(
      platformMeetId
    )
  )
    .map(
      name => ({
        name,
      })
    )
}


export function getTrainingPlatformManagerCsv(
  platformMeetId: string,
  filename: string,
): string {

  const csv =
    getTrainingFiles(
      platformMeetId
    ).get(
      filename
    )

  if (
    csv === undefined
  ) {
    throw new Error(
      `Training PlatformManager file not found: ${filename}`
    )
  }

  return csv
}


export function markTrainingPlatformManagerFileProcessed(
  platformMeetId: string,
  filename: string,
): void {

  if (
    !getTrainingFiles(
      platformMeetId
    ).has(
      filename
    )
  ) {
    throw new Error(
      `Training PlatformManager file not found: ${filename}`
    )
  }

  getProcessedFiles(
    platformMeetId
  ).add(
    filename
  )
}


export function resetTrainingPlatformManagerFiles(
  platformMeetId: string,
): void {

  getProcessedFiles(
    platformMeetId
  ).clear()
}


export function getTrainingPlatformManagerFileCount(
  platformMeetId: string,
): number {

  return getTrainingFiles(
    platformMeetId
  ).size
}
