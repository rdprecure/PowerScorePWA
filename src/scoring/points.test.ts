import {
    describe,
    expect,
    test,
  } from 'vitest'
  
  import {
    getPointsForPlace,
  } from './points'
  
  import {
    TEXAS_INDIVIDUAL_POINTS,
  } from '../rules/texas'
  
  describe('PowerScore individual points', () => {
  
    test('first place receives 7 points', () => {
      expect(
        getPointsForPlace(
          1,
          TEXAS_INDIVIDUAL_POINTS
        )
      ).toBe(7)
    })
  
    test('second place receives 5 points', () => {
      expect(
        getPointsForPlace(
          2,
          TEXAS_INDIVIDUAL_POINTS
        )
      ).toBe(5)
    })
  
    test('third place receives 3 points', () => {
      expect(
        getPointsForPlace(
          3,
          TEXAS_INDIVIDUAL_POINTS
        )
      ).toBe(3)
    })
  
    test('fourth place receives 2 points', () => {
      expect(
        getPointsForPlace(
          4,
          TEXAS_INDIVIDUAL_POINTS
        )
      ).toBe(2)
    })
  
    test('fifth place receives 1 point', () => {
      expect(
        getPointsForPlace(
          5,
          TEXAS_INDIVIDUAL_POINTS
        )
      ).toBe(1)
    })
  
    test('sixth place receives no points by default', () => {
      expect(
        getPointsForPlace(
          6,
          TEXAS_INDIVIDUAL_POINTS
        )
      ).toBe(0)
    })
  
    test('sixth place receives last-place points when enabled', () => {
      expect(
        getPointsForPlace(
          6,
          TEXAS_INDIVIDUAL_POINTS,
          true
        )
      ).toBe(1)
    })
  
    test('null place receives no points', () => {
      expect(
        getPointsForPlace(
          null,
          TEXAS_INDIVIDUAL_POINTS
        )
      ).toBe(0)
    })
  
    test('zero place receives no points', () => {
      expect(
        getPointsForPlace(
          0,
          TEXAS_INDIVIDUAL_POINTS
        )
      ).toBe(0)
    })
  
  })