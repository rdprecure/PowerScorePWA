import type {
    LifterStatus,
  } from '../models/LifterStatus'
  
  import type {
    CoefficientRules,
  } from '../rules/AssociationRules'
  
  import {
    calculateCoefficientTotal,
  } from './coefficientTotal'
  
  export interface BestLifterCandidate {
    id: number
    bodyWeight: number
    total: number
    status: LifterStatus
    isGuest: boolean
    group: string
  }
  
  export interface BestLifterPlacement {
    id: number
    group: string
    place: number
    coefficient: number
    coefficientTotal: number
  }
  
  function isEligibleForBestLifter(
    lifter: BestLifterCandidate
  ): boolean {
  
    return (
      lifter.status === 'active' &&
      lifter.total > 0 &&
      lifter.bodyWeight > 0 &&
      lifter.isGuest === false &&
      lifter.group.trim() !== ''
    )
  }
  
  export function placeBestLifters(
    lifters: BestLifterCandidate[],
    coefficientRules: CoefficientRules,
    placesPerGroup: number
  ): BestLifterPlacement[] {
  
    if (placesPerGroup <= 0) {
      return []
    }
  
    const eligible =
      lifters
        .filter(
          isEligibleForBestLifter
        )
        .map(
          lifter => {
  
            const coefficientResult =
              calculateCoefficientTotal(
                lifter.bodyWeight,
                lifter.total,
                coefficientRules
              )
  
            return {
              lifter,
              coefficient:
                coefficientResult.coefficient,
              coefficientTotal:
                coefficientResult
                  .coefficientTotal,
            }
          }
        )
        .filter(
          candidate =>
            candidate
              .coefficientTotal > 0
        )
  
    const groups =
      Array.from(
        new Set(
          eligible.map(
            candidate =>
              candidate.lifter.group
          )
        )
      )
  
    const placements:
      BestLifterPlacement[] = []
  
    for (const group of groups) {
  
      const groupCandidates =
        eligible
          .filter(
            candidate =>
              candidate.lifter.group ===
              group
          )
          .sort(
            (a, b) => {
  
              if (
                b.coefficientTotal !==
                a.coefficientTotal
              ) {
                return (
                  b.coefficientTotal -
                  a.coefficientTotal
                )
              }
  
              if (
                a.lifter.bodyWeight !==
                b.lifter.bodyWeight
              ) {
                return (
                  a.lifter.bodyWeight -
                  b.lifter.bodyWeight
                )
              }
  
              return (
                a.lifter.id -
                b.lifter.id
              )
            }
          )
          .slice(
            0,
            placesPerGroup
          )
  
      for (
        let index = 0;
        index < groupCandidates.length;
        index++
      ) {
  
        const candidate =
          groupCandidates[index]
  
        placements.push({
          id:
            candidate.lifter.id,
          group,
          place:
            index + 1,
          coefficient:
            candidate.coefficient,
          coefficientTotal:
            candidate.coefficientTotal,
        })
      }
    }
  
    return placements
  }