import { findBestOrientation, calculateVolume } from './binPacking3D'
import { containerDimensions } from './containerDimensions'

// Pakovanje paleta u kontejner
export function packPalletsInContainer(palletResults, containerType) {
  const container = containerDimensions[containerType]
  
  const allPallets = []
  
  // Kreiraj listu svih paleta
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
  
  // Sortiraj palete po težini (najteže dole)
  allPallets.sort((a, b) => b.weight - a.weight)
  
  // Pronađi najbolju orijentaciju za palete
  const avgPalletLength = allPallets.reduce((sum, p) => sum + p.length, 0) / allPallets.length
  const avgPalletWidth = allPallets.reduce((sum, p) => sum + p.width, 0) / allPallets.length
  const avgPalletHeight = allPallets.reduce((sum, p) => sum + p.height, 0) / allPallets.length
  
  const bestOrientation = findBestOrientation(
    avgPalletLength,
    avgPalletWidth,
    avgPalletHeight,
    container.length,
    container.width,
    container.height,
    true  // isPallet = true (samo 2 orijentacije po osnovi)
  )
  
  // Maksimalan broj paleta po kontejneru
  const palletsPerLayer = bestOrientation.unitsL * bestOrientation.unitsW
  const layers = bestOrientation.unitsH || 1
  const maxPalletsByVolume = palletsPerLayer * layers
  
  const totalWeight = allPallets.reduce((sum, p) => sum + p.weight, 0)
  const avgPalletWeight = totalWeight / allPallets.length
  const maxPalletsByWeight = Math.floor(container.maxWeight / avgPalletWeight)
  
  const maxPalletsPerContainer = Math.min(maxPalletsByVolume, maxPalletsByWeight)
  
  // Broj potrebnih kontejnera
  const containersNeeded = Math.ceil(allPallets.length / maxPalletsPerContainer)
  
  // Raspored po kontejnerima
  const containerBreakdown = []
  let remainingPallets = [...allPallets]
  
  for (let i = 0; i < containersNeeded; i++) {
    const palletsInThisContainer = remainingPallets.slice(0, maxPalletsPerContainer)
    remainingPallets = remainingPallets.slice(maxPalletsPerContainer)
    
    const containerWeight = palletsInThisContainer.reduce((sum, p) => sum + p.weight, 0)
    const containerVolume = palletsInThisContainer.reduce((sum, p) => sum + (p.length * p.width * p.height), 0)
    const totalContainerVolume = container.length * container.width * container.height
    
    // Grupiši po tipu tereta
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
      layers: layers,
      palletsPerLayer: palletsPerLayer,
      weight: containerWeight.toFixed(0),
      volumeUtilization: ((containerVolume / totalContainerVolume) * 100).toFixed(1),
      weightUtilization: ((containerWeight / container.maxWeight) * 100).toFixed(1),
      emptySpace: ((totalContainerVolume - containerVolume) / 1000000).toFixed(2),
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
    layers: layers,
    palletsPerLayer: palletsPerLayer,
    containerBreakdown,
    bestOrientation,
    limitedBy: maxPalletsByVolume < maxPalletsByWeight ? 'volumen' : 'težina'
  }
}

// Direktno pakovanje tereta u kontejner (bez paletizacije)
export function packCargoDirectly(cargoItems, containerType) {
  const container = containerDimensions[containerType]
  
  const allResults = []
  let totalUnitsNeeded = 0
  
  cargoItems.forEach(cargo => {
    const itemLength = cargo.length + cargo.safetyGap
    const itemWidth = cargo.width + cargo.safetyGap
    const itemHeight = cargo.height + cargo.safetyGap
    
    // Za direktno pakovanje, testiramo SVE orijentacije (isPallet = false)
    const bestOrientation = findBestOrientation(
      itemLength,
      itemWidth,
      itemHeight,
      container.length,
      container.width,
      container.height,
      false  // isPallet = false (svih 6 orijentacija)
    )
    
    const maxUnitsByVolume = bestOrientation.totalUnits
    const maxUnitsByWeight = Math.floor(container.maxWeight / cargo.weight)
    const maxUnitsPerContainer = Math.min(maxUnitsByVolume, maxUnitsByWeight)
    
    const containersNeeded = Math.ceil(cargo.quantity / maxUnitsPerContainer)
    totalUnitsNeeded += containersNeeded
    
    allResults.push({
      cargoId: cargo.id,
      cargoName: cargo.name || `${cargo.packagingType} ${cargo.length}×${cargo.width}×${cargo.height}`,
      maxUnitsPerContainer,
      containersNeeded,
      bestOrientation,
      limitedBy: maxUnitsByVolume < maxUnitsByWeight ? 'volumen' : 'težina'
    })
  })
  
  // Maksimalan broj kontejnera potreban
  const maxContainersNeeded = Math.max(...allResults.map(r => r.containersNeeded))
  
  // Raspored po kontejnerima
  const containerBreakdown = []
  
  for (let i = 0; i < maxContainersNeeded; i++) {
    const cargoInThisContainer = []
    let totalWeight = 0
    let totalVolume = 0
    
    allResults.forEach(result => {
      if (i < result.containersNeeded) {
        const remainingUnits = cargoItems.find(c => c.id === result.cargoId).quantity - (i * result.maxUnitsPerContainer)
        const unitsInThisContainer = Math.min(remainingUnits, result.maxUnitsPerContainer)
        const cargo = cargoItems.find(c => c.id === result.cargoId)
        
        const weight = unitsInThisContainer * cargo.weight
        const volume = unitsInThisContainer * (cargo.length + cargo.safetyGap) * (cargo.width + cargo.safetyGap) * (cargo.height + cargo.safetyGap)
        
        totalWeight += weight
        totalVolume += volume
        
        cargoInThisContainer.push({
          name: result.cargoName,
          units: unitsInThisContainer,
          weight: weight.toFixed(0),
          packagingType: cargo.packagingType,
          orientation: result.bestOrientation.name,
          layout: `${result.bestOrientation.unitsL}×${result.bestOrientation.unitsW}×${result.bestOrientation.unitsH}`,
          utilization: ((volume / (container.length * container.width * container.height)) * 100).toFixed(1)
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
