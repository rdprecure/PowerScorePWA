import {
    describe,
    expect,
    test,
  } from 'vitest'
  
  import {
    DEFAULT_TOTAL_POINTS,
    getPointsForPlace,
  } from './points'
  
  describe('PowerScore individual points', () => {
  
    test('first place receives 7 points', () => {
      expect(
        getPointsForPlace(
          1,
          DEFAULT_TOTAL_POINTS
        )
      ).toBe(7)
    })
  
    test('second place receives 5 points', () => {
      expect(
        getPointsForPlace(
          2,
          DEFAULT_TOTAL_POINTS
        )
      ).toBe(5)
    })
  
    test('third place receives 3 points', () => {
      expect(
        getPointsForPlace(
          3,
          DEFAULT_TOTAL_POINTS
        )
      ).toBe(3)
    })
  
    test('fourth place receives 2 points', () => {
      expect(
        getPointsForPlace(
          4,
          DEFAULT_TOTAL_POINTS
        )
      ).toBe(2)
    })
  
    test('fifth place receives 1 point', () => {
      expect(
        getPointsForPlace(
          5,
          DEFAULT_TOTAL_POINTS
        )
      ).toBe(1)
    })
  
    test('place beyond scoring places receives zero by default', () => {
      expect(
        getPointsForPlace(
          6,
          DEFAULT_TOTAL_POINTS
        )
      ).toBe(0)
    })
  
    test('place beyond scoring places can receive last-place points', () => {
      expect(
        getPointsForPlace(
          6,
          DEFAULT_TOTAL_POINTS,
          true
        )
      ).toBe(1)
    })
  
    test('null place receives zero points', () => {
      expect(
        getPointsForPlace(
          null,
          DEFAULT_TOTAL_POINTS
        )
      ).toBe(0)
    })
  
    test('zero place receives zero points', () => {
      expect(
        getPointsForPlace(
          0,
          DEFAULT_TOTAL_POINTS
        )
      ).toBe(0)
    })
  
  })