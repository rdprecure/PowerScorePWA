import {
    describe,
    expect,
    test,
  } from 'vitest'
  
  import {
    getLifterStatusLabel,
  } from './LifterStatus'
  
  describe('PowerScore lifter status', () => {
  
    test('active lifter has no status label', () => {
      expect(
        getLifterStatusLabel('active')
      ).toBe('')
    })
  
    test('bombed lifter displays BO', () => {
      expect(
        getLifterStatusLabel('bombed')
      ).toBe('BO')
    })
  
    test('scratched lifter displays SC', () => {
      expect(
        getLifterStatusLabel('scratched')
      ).toBe('SC')
    })
  
    test('disqualified lifter displays DQ', () => {
      expect(
        getLifterStatusLabel('disqualified')
      ).toBe('DQ')
    })
  
  })