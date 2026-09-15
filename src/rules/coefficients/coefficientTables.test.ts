import {
    describe,
    expect,
    test,
  } from 'vitest'
  
  import {
    getTableCoefficient,
  } from '../../scoring/coefficient'
  
  import {
    SCHWARTZ_TABLE,
  } from './schwartz'
  
  import {
    MALONE_TABLE,
  } from './malone'
  
  describe('PowerScore legacy coefficient tables', () => {
  
    test('Schwartz table contains every pound from 90 through 365', () => {
      expect(
        SCHWARTZ_TABLE
      ).toHaveLength(276)
  
      expect(
        SCHWARTZ_TABLE[0].bodyWeight
      ).toBe(90)
  
      expect(
        SCHWARTZ_TABLE[
          SCHWARTZ_TABLE.length - 1
        ].bodyWeight
      ).toBe(365)
    })
  
    test('Malone table contains every pound from 90 through 250', () => {
      expect(
        MALONE_TABLE
      ).toHaveLength(161)
  
      expect(
        MALONE_TABLE[0].bodyWeight
      ).toBe(90)
  
      expect(
        MALONE_TABLE[
          MALONE_TABLE.length - 1
        ].bodyWeight
      ).toBe(250)
    })
  
    test('Schwartz legacy values are preserved', () => {
      expect(
        SCHWARTZ_TABLE.find(
          entry =>
            entry.bodyWeight === 90
        )?.coefficient
      ).toBe(1.2803)
  
      expect(
        SCHWARTZ_TABLE.find(
          entry =>
            entry.bodyWeight === 150
        )?.coefficient
      ).toBe(0.7207)
  
      expect(
        SCHWARTZ_TABLE.find(
          entry =>
            entry.bodyWeight === 200
        )?.coefficient
      ).toBe(0.5826)
  
      expect(
        SCHWARTZ_TABLE.find(
          entry =>
            entry.bodyWeight === 365
        )?.coefficient
      ).toBe(0.4784)
    })
  
    test('Malone legacy values are preserved', () => {
      expect(
        MALONE_TABLE.find(
          entry =>
            entry.bodyWeight === 90
        )?.coefficient
      ).toBe(1.1756)
  
      expect(
        MALONE_TABLE.find(
          entry =>
            entry.bodyWeight === 150
        )?.coefficient
      ).toBe(0.7737)
  
      expect(
        MALONE_TABLE.find(
          entry =>
            entry.bodyWeight === 200
        )?.coefficient
      ).toBe(0.6287)
  
      expect(
        MALONE_TABLE.find(
          entry =>
            entry.bodyWeight === 250
        )?.coefficient
      ).toBe(0.5649)
    })
  
    test('Schwartz exact bodyweight uses exact table row', () => {
      expect(
        getTableCoefficient(
          180,
          SCHWARTZ_TABLE,
          {
            roundUpBodyWeight: false,
          }
        )
      ).toBe(0.6238)
    })
  
    test('Schwartz fractional bodyweight uses previous whole-pound row', () => {
      expect(
        getTableCoefficient(
          180.9,
          SCHWARTZ_TABLE,
          {
            roundUpBodyWeight: false,
          }
        )
      ).toBe(0.6238)
    })
  
    test('Malone exact bodyweight uses exact table row', () => {
      expect(
        getTableCoefficient(
          180,
          MALONE_TABLE,
          {
            roundUpBodyWeight: false,
          }
        )
      ).toBe(0.6786)
    })
  
    test('Malone fractional bodyweight uses previous whole-pound row', () => {
      expect(
        getTableCoefficient(
          180.9,
          MALONE_TABLE,
          {
            roundUpBodyWeight: false,
          }
        )
      ).toBe(0.6786)
    })
  
    test('Schwartz lookup uses final coefficient above table maximum', () => {
      expect(
        getTableCoefficient(
          400,
          SCHWARTZ_TABLE,
          {
            roundUpBodyWeight: false,
          }
        )
      ).toBe(0.4784)
    })
  
    test('Malone lookup uses final coefficient above table maximum', () => {
      expect(
        getTableCoefficient(
          300,
          MALONE_TABLE,
          {
            roundUpBodyWeight: false,
          }
        )
      ).toBe(0.5649)
    })
  
  })