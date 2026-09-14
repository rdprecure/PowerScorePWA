import {
    describe,
    expect,
    test,
  } from 'vitest'
  
  import { getWeightClass } from './weightClass'
  
  import type {
    WeightClass,
  } from '../models/WeightClass'
  
  const boysWeightClasses: WeightClass[] = [
    { name: '114', maxWeight: 114 },
    { name: '123', maxWeight: 123 },
    { name: '132', maxWeight: 132 },
    { name: '148', maxWeight: 148 },
    { name: '165', maxWeight: 165 },
    { name: '181', maxWeight: 181 },
    { name: '198', maxWeight: 198 },
    { name: '220', maxWeight: 220 },
    { name: '242', maxWeight: 242 },
    { name: '275', maxWeight: 275 },
    { name: 'SHW', maxWeight: 9999 },
  ]
  
  describe('PowerScore weight class assignment', () => {
  
    test('assigns lifter to first class that includes bodyweight', () => {
      expect(
        getWeightClass(113.5, boysWeightClasses)
      ).toBe('114')
    })
  
    test('bodyweight exactly on class limit stays in that class', () => {
      expect(
        getWeightClass(123, boysWeightClasses)
      ).toBe('123')
    })
  
    test('bodyweight above one limit moves to next class', () => {
      expect(
        getWeightClass(123.1, boysWeightClasses)
      ).toBe('132')
    })
  
    test('zero bodyweight is unclassed', () => {
      expect(
        getWeightClass(0, boysWeightClasses)
      ).toBe('UNC')
    })
  
    test('no configured weight classes returns N/A', () => {
      expect(
        getWeightClass(150, [])
      ).toBe('N/A')
    })
  
    test('weight above configured classes uses last class', () => {
      const classes: WeightClass[] = [
        { name: '114', maxWeight: 114 },
        { name: '123', maxWeight: 123 },
        { name: 'SHW', maxWeight: 9999 },
      ]
  
      expect(
        getWeightClass(350, classes)
      ).toBe('SHW')
    })
  
  })