import {
  describe,
  expect,
  test,
} from 'vitest'

import {
  parsePlatformManagerCsv,
  parsePlatformManagerFilename,
  parsePlatformManagerSubmission,
} from './platformManager'

const CSV = [
  'Platform,Lifter,Round,Weight,Result,Status',
  '2,101,1,315,1,0',
  '2,102,1,275,0,1',
  '2,103,1,225,2,2',
  '2,104,1,205,1,3',
].join('\n')

describe('PlatformManager integration parsing', () => {
  test('parses round filename', () => {
    expect(
      parsePlatformManagerFilename(
        'ABCD1234__Platform2__Squat__Round1.csv',
      ),
    ).toMatchObject({
      meetId: 'ABCD1234',
      platform: '2',
      lift: 'squat',
      mode: 'round',
      round: 1,
    })
  })

  test('parses best lifts filename', () => {
    expect(
      parsePlatformManagerFilename(
        'ABCD1234__Platform3__Deadlift__BestLifts.csv',
      ),
    ).toMatchObject({
      lift: 'deadlift',
      mode: 'best-lifts',
      round: 0,
    })
  })

  test('maps result and lifter status codes', () => {
    const rows = parsePlatformManagerCsv(CSV)

    expect(rows.map(row => row.result)).toEqual([
      'good',
      'bad',
      'unspecified',
      'good',
    ])

    expect(rows.map(row => row.status)).toEqual([
      'active',
      'bombed',
      'scratched',
      'disqualified',
    ])
  })

  test('rejects wrong MeetID', () => {
    expect(() =>
      parsePlatformManagerSubmission(
        'ABCD1234__Platform2__Squat__Round1.csv',
        CSV,
        'WXYZ5678',
      ),
    ).toThrow(/does not match this meet/)
  })

  test('rejects round mismatch', () => {
    expect(() =>
      parsePlatformManagerSubmission(
        'ABCD1234__Platform2__Squat__Round2.csv',
        CSV,
        'ABCD1234',
      ),
    ).toThrow(/does not match filename round/)
  })
})
