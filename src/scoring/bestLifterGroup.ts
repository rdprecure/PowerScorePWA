import type {
    BestLifterGroup,
  } from '../models/BestLifterGroup'
  
  import type {
    WeightClass,
  } from '../models/WeightClass'
  
  export function getBestLifterGroup(
    weightClass: string,
    weightClasses: WeightClass[],
    groups: BestLifterGroup[]
  ): string {
  
    const classIndex =
      weightClasses.findIndex(
        currentClass =>
          currentClass.name ===
          weightClass
      )
  
    if (classIndex < 0) {
      return 'N/A'
    }
  
    for (const group of groups) {
  
      const firstIndex =
        weightClasses.findIndex(
          currentClass =>
            currentClass.name ===
            group.firstWeightClass
        )
  
      const lastIndex =
        weightClasses.findIndex(
          currentClass =>
            currentClass.name ===
            group.lastWeightClass
        )
  
      if (
        firstIndex < 0 ||
        lastIndex < 0
      ) {
        continue
      }
  
      if (
        classIndex >= firstIndex &&
        classIndex <= lastIndex
      ) {
        return group.name
      }
    }
  
    return 'N/A'
  }