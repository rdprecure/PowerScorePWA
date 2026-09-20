export type PlatformManagerLift =
  | 'squat'
  | 'bench'
  | 'deadlift'

export type PlatformManagerResult =
  | 'good'
  | 'bad'
  | 'unspecified'

export type PlatformManagerLifterStatus =
  | 'active'
  | 'bombed'
  | 'scratched'
  | 'disqualified'

export interface PlatformManagerSubmissionDescriptor {
  meetId: string
  platform: string
  lift: PlatformManagerLift
  mode: 'round' | 'best-lifts'
  round: 0 | 1 | 2 | 3
  filename: string
}

export interface PlatformManagerRow {
  platform: string
  lifterNumber: number
  round: 0 | 1 | 2 | 3
  weight: number
  result: PlatformManagerResult
  status: PlatformManagerLifterStatus
}

export interface PlatformManagerSubmission {
  descriptor: PlatformManagerSubmissionDescriptor
  rows: PlatformManagerRow[]
}

const HEADER = [
  'Platform',
  'Lifter',
  'Round',
  'Weight',
  'Result',
  'Status',
]

function normalizeLift(value: string): PlatformManagerLift {
  switch (value.toLowerCase()) {
    case 'squat':
      return 'squat'
    case 'bench':
      return 'bench'
    case 'deadlift':
      return 'deadlift'
    default:
      throw new Error(`Unsupported PlatformManager lift: ${value}`)
  }
}

function mapResult(value: number): PlatformManagerResult {
  switch (value) {
    case 0:
      return 'bad'
    case 1:
      return 'good'
    case 2:
      return 'unspecified'
    default:
      throw new Error(`Invalid PlatformManager result code: ${value}`)
  }
}

function mapStatus(value: number): PlatformManagerLifterStatus {
  switch (value) {
    case 0:
      return 'active'
    case 1:
      return 'bombed'
    case 2:
      return 'scratched'
    case 3:
      return 'disqualified'
    default:
      throw new Error(`Invalid PlatformManager status code: ${value}`)
  }
}

export function createPlatformMeetId(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const digits = '0123456789'
  const bytes = new Uint8Array(8)

  if (
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.getRandomValues === 'function'
  ) {
    globalThis.crypto.getRandomValues(bytes)
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256)
    }
  }

  const letterPart = Array.from(
    bytes.slice(0, 4),
    value => letters[value % letters.length],
  ).join('')

  const digitPart = Array.from(
    bytes.slice(4, 8),
    value => digits[value % digits.length],
  ).join('')

  return letterPart + digitPart
}

export function parsePlatformManagerFilename(
  filename: string,
): PlatformManagerSubmissionDescriptor {
  const name = filename.trim()
  const match = name.match(
    /^([A-Za-z]{4}\d{4})__Platform([^_]+)__(Squat|Bench|Deadlift)__(Round([123])|BestLifts)\.csv$/i,
  )

  if (match === null) {
    throw new Error(
      `Invalid PlatformManager filename: ${name}. Expected ABCD1234__PlatformN__Lift__RoundN.csv or ABCD1234__PlatformN__Lift__BestLifts.csv.`,
    )
  }

  const roundText = match[5]
  const round = roundText === undefined
    ? 0
    : Number(roundText) as 1 | 2 | 3

  return {
    meetId: match[1].toUpperCase(),
    platform: match[2],
    lift: normalizeLift(match[3]),
    mode: round === 0 ? 'best-lifts' : 'round',
    round,
    filename: name,
  }
}

export function parsePlatformManagerCsv(
  csv: string,
): PlatformManagerRow[] {
  const lines = csv
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line !== '')

  if (lines.length === 0) {
    throw new Error('PlatformManager CSV is empty.')
  }

  const header = lines[0].split(',').map(value => value.trim())

  if (
    header.length !== HEADER.length ||
    !HEADER.every((value, index) => header[index] === value)
  ) {
    throw new Error(
      `Invalid PlatformManager CSV header. Expected: ${HEADER.join(',')}`,
    )
  }

  return lines.slice(1).map((line, lineIndex) => {
    const values = line.split(',').map(value => value.trim())

    if (values.length !== 6) {
      throw new Error(
        `Invalid PlatformManager CSV row ${lineIndex + 2}: expected 6 columns.`,
      )
    }

    const lifterNumber = Number(values[1])
    const roundValue = Number(values[2])
    const weight = Number(values[3])
    const resultCode = Number(values[4])
    const statusCode = Number(values[5])

    if (!Number.isInteger(lifterNumber) || lifterNumber <= 0) {
      throw new Error(`Invalid lifter number on CSV row ${lineIndex + 2}.`)
    }

    if (![0, 1, 2, 3].includes(roundValue)) {
      throw new Error(`Invalid round on CSV row ${lineIndex + 2}.`)
    }

    if (!Number.isFinite(weight) || weight < 0) {
      throw new Error(`Invalid weight on CSV row ${lineIndex + 2}.`)
    }

    return {
      platform: values[0],
      lifterNumber,
      round: roundValue as 0 | 1 | 2 | 3,
      weight,
      result: mapResult(resultCode),
      status: mapStatus(statusCode),
    }
  })
}

export function parsePlatformManagerSubmission(
  filename: string,
  csv: string,
  expectedMeetId?: string,
): PlatformManagerSubmission {
  const descriptor = parsePlatformManagerFilename(filename)
  const rows = parsePlatformManagerCsv(csv)

  if (
    expectedMeetId !== undefined &&
    descriptor.meetId !== expectedMeetId.trim().toUpperCase()
  ) {
    throw new Error(
      `PlatformManager MeetID ${descriptor.meetId} does not match this meet.`,
    )
  }

  for (const row of rows) {
    if (String(row.platform) !== String(descriptor.platform)) {
      throw new Error(
        `CSV platform ${row.platform} does not match filename platform ${descriptor.platform}.`,
      )
    }

    if (
      descriptor.mode === 'round' &&
      row.round !== descriptor.round
    ) {
      throw new Error(
        `CSV round ${row.round} does not match filename round ${descriptor.round}.`,
      )
    }

    if (
      descriptor.mode === 'best-lifts' &&
      row.round !== 0
    ) {
      throw new Error('BestLifts CSV rows must use Round 0.')
    }
  }

  return {
    descriptor,
    rows,
  }
}


export interface PlatformManagerRemoteFile {
  name: string
  size?: number
  modified?: string
}

function buildHandlerUrl(
  handlerUrl: string,
  action: string,
  parameters: Record<string, string>,
): string {
  const url = new URL(handlerUrl, window.location.href)
  url.searchParams.set('action', action)

  Object.entries(parameters).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  return url.toString()
}


function looksLikeHtml(value: string): boolean {
  const trimmed = value.trimStart().toLowerCase()

  return (
    trimmed.startsWith('<!doctype html') ||
    trimmed.startsWith('<html') ||
    trimmed.startsWith('<head') ||
    trimmed.startsWith('<body')
  )
}

function assertPlatformManagerTextResponse(
  text: string,
  actionDescription: string,
): void {
  if (looksLikeHtml(text)) {
    throw new Error(
      `PlatformManager server returned an HTML page instead of ${actionDescription}. ` +
      'Check the PlatformManager service URL and CORS configuration.',
    )
  }
}

export async function listPlatformManagerSubmissions(
  handlerUrl: string,
  meetId: string,
): Promise<PlatformManagerRemoteFile[]> {
  const normalizedMeetId = meetId.trim().toUpperCase()

  if (!/^[A-Z]{4}\d{4}$/.test(normalizedMeetId)) {
    throw new Error('A valid Platform MeetID requires 4 letters followed by 4 numbers.')
  }

  const response = await fetch(
    buildHandlerUrl(
      handlerUrl,
      'list',
      { meetID: normalizedMeetId },
    ),
    { cache: 'no-store' },
  )

  if (!response.ok) {
    throw new Error(`Unable to list PlatformManager submissions (HTTP ${response.status}).`)
  }

  const text = await response.text()

  assertPlatformManagerTextResponse(
    text,
    'a submission list',
  )

  return text
    .split(/\r?\n/)
    .map(name => name.trim())
    .filter(name => name !== '')
    .map(name => ({ name }))
}


export async function listProcessedPlatformManagerSubmissions(
  handlerUrl: string,
  meetId: string,
): Promise<PlatformManagerRemoteFile[]> {
  const normalizedMeetId = meetId.trim().toUpperCase()

  if (!/^[A-Z]{4}\d{4}$/.test(normalizedMeetId)) {
    throw new Error('A valid Platform MeetID requires 4 letters followed by 4 numbers.')
  }

  const response = await fetch(
    buildHandlerUrl(
      handlerUrl,
      'listprocessed',
      { meetID: normalizedMeetId },
    ),
    { cache: 'no-store' },
  )

  if (!response.ok) {
    throw new Error(
      `Unable to list processed PlatformManager submissions (HTTP ${response.status}).`,
    )
  }

  const text = await response.text()

  assertPlatformManagerTextResponse(
    text,
    'a processed submission list',
  )

  return text
    .split(/\r?\n/)
    .map(name => name.trim())
    .filter(name => name !== '')
    .map(name => ({ name }))
}

export async function getPlatformManagerSubmissionCsv(
  handlerUrl: string,
  filename: string,
): Promise<string> {
  const response = await fetch(
    buildHandlerUrl(
      handlerUrl,
      'get',
      { filename },
    ),
    { cache: 'no-store' },
  )

  if (!response.ok) {
    throw new Error(
      `Unable to retrieve PlatformManager submission ${filename} (HTTP ${response.status}).`,
    )
  }

  const text = await response.text()

  assertPlatformManagerTextResponse(
    text,
    'CSV data',
  )

  return text
}

export async function markPlatformManagerSubmissionProcessed(
  handlerUrl: string,
  filename: string,
): Promise<void> {
  const response = await fetch(
    buildHandlerUrl(
      handlerUrl,
      'markprocessed',
      { filename },
    ),
    {
      method: 'POST',
      cache: 'no-store',
    },
  )

  if (!response.ok) {
    throw new Error(
      `Imported ${filename}, but could not mark it processed (HTTP ${response.status}).`,
    )
  }
}
