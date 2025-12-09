export const palletDimensions = {
  // EUR Palete
  "EUR Paleta": { 
    length: 120, 
    width: 80, 
    maxHeight: 150, 
    maxWeight: 1500,
    name: "EUR Paleta (120×80 cm)",
    category: "EUR"
  },
  "EUR": {  // ALIAS
    length: 120, 
    width: 80, 
    maxHeight: 150, 
    maxWeight: 1500,
    name: "EUR Paleta (120×80 cm)",
    category: "EUR"
  },
  
  // Industrijske Palete
  "Industrijska (100×120)": { 
    length: 100, 
    width: 120, 
    maxHeight: 150, 
    maxWeight: 1500,
    name: "Industrijska (100×120 cm)",
    category: "Industrial"
  },
  "Industrial": {  // ALIAS
    length: 100, 
    width: 120, 
    maxHeight: 150, 
    maxWeight: 1500,
    name: "Industrijska (100×120 cm)",
    category: "Industrial"
  },
  "Industrijska (120×120)": { 
    length: 120, 
    width: 120, 
    maxHeight: 150, 
    maxWeight: 1500,
    name: "Industrijska (120×120 cm)",
    category: "Industrial"
  },
  "Industrijska (100×100)": { 
    length: 100, 
    width: 100, 
    maxHeight: 150, 
    maxWeight: 1500,
    name: "Industrijska (100×100 cm)",
    category: "Industrial"
  },
  "Industrijska (80×120)": { 
    length: 80, 
    width: 120, 
    maxHeight: 150, 
    maxWeight: 1500,
    name: "Industrijska (80×120 cm)",
    category: "Industrial"
  },
  
  // US Palete
  "US Paleta (48×40)": { 
    length: 122, 
    width: 102, 
    maxHeight: 150, 
    maxWeight: 1500,
    name: "US Paleta (122×102 cm)",
    category: "US"
  },
  "US Paleta (48×48)": { 
    length: 122, 
    width: 122, 
    maxHeight: 150, 
    maxWeight: 1500,
    name: "US Paleta (122×122 cm)",
    category: "US"
  },
  
  // Azijske Palete
  "Azijska (110×110)": { 
    length: 110, 
    width: 110, 
    maxHeight: 150, 
    maxWeight: 1500,
    name: "Azijska (110×110 cm)",
    category: "Asian"
  },
  "Azijska (100×100)": { 
    length: 100, 
    width: 100, 
    maxHeight: 150, 
    maxWeight: 1500,
    name: "Azijska (100×100 cm)",
    category: "Asian"
  },
}

// Samo validni tipovi (bez aliasa) za dropdown
export const palletOptions = [
  "EUR Paleta",
  "Industrijska (100×120)",
  "Industrijska (120×120)",
  "Industrijska (100×100)",
  "Industrijska (80×120)",
  "US Paleta (48×40)",
  "US Paleta (48×48)",
  "Azijska (110×110)",
  "Azijska (100×100)",
  "Custom"  // NOVO!
]

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
