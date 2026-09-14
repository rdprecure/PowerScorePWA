export type LifterStatus =
| 'active'
| 'bombed'
| 'scratched'
| 'disqualified'

export function getLifterStatusLabel(
status: LifterStatus
): string {
switch (status) {
  case 'active':
    return ''

  case 'bombed':
    return 'BO'

  case 'scratched':
    return 'SC'

  case 'disqualified':
    return 'DQ'
}
}