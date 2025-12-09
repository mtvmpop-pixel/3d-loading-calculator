export const palletDimensions = {
  "EUR Paleta": { 
    length: 120, 
    width: 80, 
    maxHeight: 150, 
    maxWeight: 1500,
    name: "EUR Paleta (120×80 cm)"
  },
  "Industrijska (100×120)": { 
    length: 100, 
    width: 120, 
    maxHeight: 150, 
    maxWeight: 1500,
    name: "Industrijska (100×120 cm)"
  },
  "Industrijska (120×120)": { 
    length: 120, 
    width: 120, 
    maxHeight: 150, 
    maxWeight: 1500,
    name: "Industrijska (120×120 cm)"
  },
  "US Paleta (48×40)": { 
    length: 122, 
    width: 102, 
    maxHeight: 150, 
    maxWeight: 1500,
    name: "US Paleta (122×102 cm)"
  },
}

export const palletOptions = Object.keys(palletDimensions)

export const palletCompatibility = {
  "Box": ["Box"],
  "Barrel": ["Barrel"],
  "Bag": ["Bag", "Box"],
  "Big Bag": ["Big Bag"],
  "Paleta": ["Paleta"]
}

export function areCompatible(type1, type2) {
  if (!palletCompatibility[type1]) return false
  return palletCompatibility[type1].includes(type2)
}

export function groupByCompatibility(cargoItems) {
  const groups = []
  const used = new Set()

  cargoItems.forEach((item, index) => {
    if (used.has(index)) return

    const group = [item]
    used.add(index)

    cargoItems.forEach((otherItem, otherIndex) => {
      if (used.has(otherIndex)) return
      if (areCompatible(item.packagingType, otherItem.packagingType)) {
        group.push(otherItem)
        used.add(otherIndex)
      }
    })

    groups.push(group)
  })

  return groups
}
