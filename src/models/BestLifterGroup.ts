export interface BestLifterGroup {
    name: string
    firstWeightClass: string
    lastWeightClass: string
  }
  
  export interface BestLifterRules {
    placesPerGroup: number
    groups: BestLifterGroup[]
  }