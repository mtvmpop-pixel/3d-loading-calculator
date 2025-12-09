import { findBestOrientation } from './binPacking3D'
import { containerDimensions } from './containerDimensions'

export function packPalletsInContainer(palletResults, containerType) {
  const container = containerDimensions[containerType]
  
  const allPallets = []
  
  palletResults.forEach(result => {
    for (let i = 0; i < result.palletsNeeded; i++) {
      allPallets.push({
        cargoId: result.cargoId,
        cargoName: result.cargoName,
        packagingType: result.packagingType,
        length: result.palletDimensions.length,
        width: result.palletDimensions.width,
        height: result.palletDimensions.height,
        weight: result.palletWeight,
        unitsOnPallet: result.unitsPerPallet
      })
    }
  })
  
  allPallets.sort((a, b) => b.weight - a.weight)
  
  const avgPalletLength = allPallets.reduce((sum, p) => sum + p.length, 0) / allPallets.length
  const avgPalletWidth = allPallets.reduce((sum, p) => sum + p.width, 0) / allPallets.length
  const avgPalletHeight = allPallets.reduce((sum, p) => sum + p.height, 0) / allPallets.length
  
  const bestOrientation = findBestOrientation(
    avgPalletLength,
    avgPalletWidth,
    avgPalletHeight,
    container.length,
    container.width,
    container.height
  )
  
  // NOVA LOGIKA: Dozvoli slojevito pakovanje
  // Broj paleta u JEDNOM sloju (L × W)
  const palletsPerLayer = bestOrientation.unitsL * bestOrientation.unitsW
  
  // Broj slojeva po visini (ako palete nisu previsoke)
  const layers = bestOrientation.unitsH || 1
  
  // MAKSIMIZACIJA: Koristi sve dostupne slojeve
  const maxPalletsByVolume = palletsPerLayer * layers
  
  const totalWeight = allPallets.reduce((sum, p) => sum + p.weight, 0)
  const avgPalletWeight = totalWeight / allPallets.length
  const maxPalletsByWeight = Math.floor(container.maxWeight / avgPalletWeight)
  
  const maxPalletsPerContainer = Math.min(maxPalletsByVolume, maxPalletsByWeight)
  const containersNeeded = Math.ceil(allPallets.length / maxPalletsPerContainer)
  
  const containerBreakdown = []
  let remainingPallets = [...allPallets]
  
  for (let i = 0; i < containersNeeded; i++) {
    const palletsInThisContainer = remainingPallets.slice(0, maxPalletsPerContainer)
    remainingPallets = remainingPallets.slice(maxPalletsPerContainer)
    
    const containerWeight = palletsInThisContainer.reduce((sum, p) => sum + p.weight, 0)
    
    // KORISTI DIMENZIJE IZ BEST ORIENTATION ZA VOLUMEN
    const palletVolumeInOrientation = bestOrientation.l * bestOrientation.w * bestOrientation.h
    const containerVolume = palletsInThisContainer.length * palletVolumeInOrientation
    const totalContainerVolume = container.length * container.width * container.height
    
    const cargoBreakdown = {}
    palletsInThisContainer.forEach(pallet => {
      if (!cargoBreakdown[pallet.cargoName]) {
        cargoBreakdown[pallet.cargoName] = {
          pallets: 0,
          units: 0,
          weight: 0,
          packagingType: pallet.packagingType
        }
      }
      cargoBreakdown[pallet.cargoName].pallets++
      cargoBreakdown[pallet.cargoName].units += pallet.unitsOnPallet
      cargoBreakdown[pallet.cargoName].weight += pallet.weight
    })
    
    containerBreakdown.push({
      containerNumber: i + 1,
      pallets: palletsInThisContainer.length,
      weight: containerWeight.toFixed(0),
      volumeUtilization: ((containerVolume / totalContainerVolume) * 100).toFixed(1),
      weightUtilization: ((containerWeight / container.maxWeight) * 100).toFixed(1),
      emptySpace: ((totalContainerVolume - containerVolume) / 1000000).toFixed(2),
      layers: Math.min(layers, Math.ceil(palletsInThisContainer.length / palletsPerLayer)),
      palletsPerLayer: palletsPerLayer,
      cargoBreakdown: Object.entries(cargoBreakdown).map(([name, data]) => ({
        name,
        ...data,
        weight: data.weight.toFixed(0)
      }))
    })
  }
  
  return {
    containersNeeded,
    maxPalletsPerContainer,
    totalPallets: allPallets.length,
    containerBreakdown,
    bestOrientation,
    layers: layers,
    palletsPerLayer: palletsPerLayer,
    limitedBy: maxPalletsByVolume < maxPalletsByWeight ? 'volumen' : 'težina'
  }
}

export function packCargoDirectly(cargoItems, containerType) {
  const container = containerDimensions[containerType]
  
  const allResults = []
  
  cargoItems.forEach(cargo => {
    const itemLength = cargo.length + cargo.safetyGap
    const itemWidth = cargo.width + cargo.safetyGap
    const itemHeight = cargo.height + cargo.safetyGap
    
    // Testiraj SVE orijentacije
    const orientations = [
      { l: itemLength, w: itemWidth, h: itemHeight, name: 'L×W×H' },
      { l: itemLength, w: itemHeight, h: itemWidth, name: 'L×H×W' },
      { l: itemWidth, w: itemLength, h: itemHeight, name: 'W×L×H' },
      { l: itemWidth, w: itemHeight, h: itemLength, name: 'W×H×L' },
      { l: itemHeight, w: itemLength, h: itemWidth, name: 'H×L×W' },
      { l: itemHeight, w: itemWidth, h: itemLength, name: 'H×W×L' }
    ]
    
    const cargoOptions = []
    
    orientations.forEach(orientation => {
      const result = findBestOrientation(
        orientation.l,
        orientation.w,
        orientation.h,
        container.length,
        container.width,
        container.height
      )
      
      const maxUnitsByVolume = result.totalUnits
      const maxUnitsByWeight = Math.floor(container.maxWeight / cargo.weight)
      const maxUnitsPerContainer = Math.min(maxUnitsByVolume, maxUnitsByWeight)
      const containersNeeded = Math.ceil(cargo.quantity / maxUnitsPerContainer)
      
      const containerVolume = container.length * container.width * container.height
      const cargoVolume = maxUnitsPerContainer * orientation.l * orientation.w * orientation.h
      const utilization = (cargoVolume / containerVolume) * 100
      
      cargoOptions.push({
        orientation: orientation.name,
        maxUnitsPerContainer: maxUnitsPerContainer,
        containersNeeded: containersNeeded,
        utilization: utilization,
        layout: `${result.unitsL}×${result.unitsW}×${result.unitsH}`,
        bestOrientation: result,
        limitedBy: maxUnitsByVolume < maxUnitsByWeight ? 'volumen' : 'težina'
      })
    })
    
    // Sortiraj po iskorišćenosti
    cargoOptions.sort((a, b) => b.utilization - a.utilization)
    
    // Uzmi TOP 3
    const top3 = cargoOptions.slice(0, 3)
    
    // Koristi najbolju opciju
    const selectedOption = cargoOptions[0]
    
    allResults.push({
      cargoId: cargo.id,
      cargoName: cargo.name || `${cargo.packagingType} ${cargo.length}×${cargo.width}×${cargo.height}`,
      maxUnitsPerContainer: selectedOption.maxUnitsPerContainer,
      containersNeeded: selectedOption.containersNeeded,
      bestOrientation: selectedOption.bestOrientation,
      orientation: selectedOption.orientation,
      layout: selectedOption.layout,
      utilization: selectedOption.utilization.toFixed(1),
      limitedBy: selectedOption.limitedBy,
      // Dodaj alternativne opcije
      alternatives: top3.map((opt, idx) => ({
        rank: idx + 1,
        orientation: opt.orientation,
        maxUnitsPerContainer: opt.maxUnitsPerContainer,
        containersNeeded: opt.containersNeeded,
        utilization: opt.utilization.toFixed(1),
        layout: opt.layout
      }))
    })
  })
  
  const maxContainersNeeded = Math.max(...allResults.map(r => r.containersNeeded))
  
  const containerBreakdown = []
  
  for (let i = 0; i < maxContainersNeeded; i++) {
    const cargoInThisContainer = []
    let totalWeight = 0
    let totalVolume = 0
    
    allResults.forEach(result => {
      if (i < result.containersNeeded) {
        const cargo = cargoItems.find(c => c.id === result.cargoId)
        const remainingUnits = cargo.quantity - (i * result.maxUnitsPerContainer)
        const unitsInThisContainer = Math.min(remainingUnits, result.maxUnitsPerContainer)
        
        const weight = unitsInThisContainer * cargo.weight
        const volume = unitsInThisContainer * (cargo.length + cargo.safetyGap) * (cargo.width + cargo.safetyGap) * (cargo.height + cargo.safetyGap)
        
        totalWeight += weight
        totalVolume += volume
        
        cargoInThisContainer.push({
          name: result.cargoName,
          units: unitsInThisContainer,
          weight: weight.toFixed(0),
          packagingType: cargo.packagingType,
          orientation: result.orientation,
          layout: result.layout,
          utilization: result.utilization
        })
      }
    })
    
    const totalContainerVolume = container.length * container.width * container.height
    
    containerBreakdown.push({
      containerNumber: i + 1,
      cargo: cargoInThisContainer,
      weight: totalWeight.toFixed(0),
      volumeUtilization: ((totalVolume / totalContainerVolume) * 100).toFixed(1),
      weightUtilization: ((totalWeight / container.maxWeight) * 100).toFixed(1),
      emptySpace: ((totalContainerVolume - totalVolume) / 1000000).toFixed(2)
    })
  }
  
  return {
    containersNeeded: maxContainersNeeded,
    containerBreakdown,
    results: allResults
  }
}
