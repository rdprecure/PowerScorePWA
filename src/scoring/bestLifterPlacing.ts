import type {
    LifterStatus,
  } from '../models/LifterStatus'
  
  import type {
    AssociationRules,
  } from '../rules/AssociationRules'
  
  import {
    calculateCoefficientTotal,
  } from './coefficientTotal'
  
  import {
    getBestLifterGroup,
  } from './bestLifterGroup'
  
  export interface BestLifterCandidate {
    id: number
    bodyWeight: number
    weightClass: string
    total: number
    status: LifterStatus
    isGuest: boolean
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
      lifter.isGuest === false
    )
  }
  
  export function placeBestLifters(
    lifters: BestLifterCandidate[],
    rules: AssociationRules,
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
  
            const group =
              getBestLifterGroup(
                lifter.weightClass,
                rules.weightClasses,
                rules.bestLifterGroups
              )
  
            const coefficientResult =
              calculateCoefficientTotal(
                lifter.bodyWeight,
                lifter.total,
                rules.coefficient
              )
  
            return {
              lifter,
              group,
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
            candidate.group !== 'N/A' &&
            candidate.coefficientTotal > 0
        )
  
    const groups =
      Array.from(
        new Set(
          eligible.map(
            candidate =>
              candidate.group
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
              candidate.group ===
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