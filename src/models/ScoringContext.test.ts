import {
    describe,
    expect,
    test,
  } from 'vitest'
  
  import {
    createScoringContext,
    isChampionshipMeet,
  } from './ScoringContext'
  
  describe(
    'PowerScore scoring context',
    () => {
  
      test('defaults to invitational meet', () => {
  
        const context =
          createScoringContext()
  
        expect(
          context.meetLevel
        ).toBe('invitational')
      })
  
      test('creates invitational context explicitly', () => {
  
        const context =
          createScoringContext(
            'invitational'
          )
  
        expect(
          context.meetLevel
        ).toBe('invitational')
      })
  
      test('creates regional context', () => {
  
        const context =
          createScoringContext(
            'regional'
          )
  
        expect(
          context.meetLevel
        ).toBe('regional')
      })
  
      test('creates state context', () => {
  
        const context =
          createScoringContext(
            'state'
          )
  
        expect(
          context.meetLevel
        ).toBe('state')
      })
  
      test('invitational is not a championship meet', () => {
  
        const context =
          createScoringContext(
            'invitational'
          )
  
        expect(
          isChampionshipMeet(
            context
          )
        ).toBe(false)
      })
  
      test('regional is a championship meet', () => {
  
        const context =
          createScoringContext(
            'regional'
          )
  
        expect(
          isChampionshipMeet(
            context
          )
        ).toBe(true)
      })
  
      test('state is a championship meet', () => {
  
        const context =
          createScoringContext(
            'state'
          )
  
        expect(
          isChampionshipMeet(
            context
          )
        ).toBe(true)
      })
  
    }
  )