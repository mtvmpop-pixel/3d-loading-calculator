import { PACKAGING_COMPATIBILITY } from '../constants'

// PACKAGING TYPES
export const PACKAGING_TYPES = [
  'Kartonska kutija',
  'Drvena gajba',
  'Plastična gajba',
  'Metalna gajba',
  'Vreća',
  'Bure',
  'IBC kontejner',
  'Rinfuz (bulk)'
]

// CHECK IF TWO PACKAGING TYPES ARE COMPATIBLE
export function arePackagingTypesCompatible(type1, type2) {
  const compatibleTypes = PACKAGING_COMPATIBILITY[type1]
  if (!compatibleTypes) return false
  return compatibleTypes.includes(type2)
}

// GROUP CARGO ITEMS BY COMPATIBILITY
export function groupCargoByCompatibility(cargoItems) {
  const groups = []
  
  cargoItems.forEach(cargo => {
    let addedToGroup = false
    
    for (let group of groups) {
      const firstInGroup = group[0]
      if (arePackagingTypesCompatible(cargo.packagingType, firstInGroup.packagingType)) {
        group.push(cargo)
        addedToGroup = true
        break
      }
    }
    
    if (!addedToGroup) {
      groups.push([cargo])
    }
  })
  
  return groups
}

// GET PACKAGING PROPERTIES
export function getPackagingProperties(packagingType) {
  const properties = {
    'Kartonska kutija': {
      stackable: true,
      fragile: true,
      maxStackHeight: 200,
      recommendedSafetyGap: 2
    },
    'Drvena gajba': {
      stackable: true,
      fragile: false,
      maxStackHeight: 300,
      recommendedSafetyGap: 1
    },
    'Plastična gajba': {
      stackable: true,
      fragile: false,
      maxStackHeight: 250,
      recommendedSafetyGap: 1
    },
    'Metalna gajba': {
      stackable: true,
      fragile: false,
      maxStackHeight: 400,
      recommendedSafetyGap: 1
    },
    'Vreća': {
      stackable: true,
      fragile: false,
      maxStackHeight: 150,
      recommendedSafetyGap: 3
    },
    'Bure': {
      stackable: false,
      fragile: false,
      maxStackHeight: 0,
      recommendedSafetyGap: 2
    },
    'IBC kontejner': {
      stackable: false,
      fragile: false,
      maxStackHeight: 0,
      recommendedSafetyGap: 5
    },
    'Rinfuz (bulk)': {
      stackable: false,
      fragile: false,
      maxStackHeight: 0,
      recommendedSafetyGap: 0
    }
  }
  
  return properties[packagingType] || {
    stackable: true,
    fragile: false,
    maxStackHeight: 200,
    recommendedSafetyGap: 2
  }
}

// VALIDATE CARGO FOR PALLETIZATION
export function validateCargoForPalletization(cargo) {
  const errors = []
  const warnings = []
  
  const props = getPackagingProperties(cargo.packagingType)
  
  if (!props.stackable) {
    warnings.push(`${cargo.packagingType} nije idealan za slaganje na palete`)
  }
  
  if (props.fragile && cargo.weight > 50) {
    warnings.push(`Težak i krhak teret - razmislite o dodatnoj zaštiti`)
  }
  
  if (cargo.height > props.maxStackHeight) {
    errors.push(`Visina tereta (${cargo.height} cm) prelazi preporučenu max visinu za ${cargo.packagingType} (${props.maxStackHeight} cm)`)
  }
  
  return { errors, warnings }
}

export default {
  PACKAGING_TYPES,
  arePackagingTypesCompatible,
  groupCargoByCompatibility,
  getPackagingProperties,
  validateCargoForPalletization
}
