import { findBestOrientation, calculateVolume } from './binPacking3D'
import { palletDimensions } from './palletDimensions'

// Pakovanje jednog tipa tereta na palete
export function packCargoOnPallets(cargoItem, palletType, palletConfig) {
  const pallet = palletDimensions[palletType]
  
  // Primeni custom config ako postoji
  const maxHeight = palletConfig?.maxHeight || pallet.maxHeight
  const maxWeight = palletConfig?.maxWeight || pallet.maxWeight
  
  // Dimenzije pakovanja (sa sigurnosnim razmakom)
  const itemLength = cargoItem.length + cargoItem.safetyGap
  const itemWidth = cargoItem.width + cargoItem.safetyGap
  const itemHeight = cargoItem.height + cargoItem.safetyGap
  const itemWeight = cargoItem.weight
  
  // Pronađi najbolju orijentaciju za paletu
  const bestOrientation = findBestOrientation(
    itemLength,
    itemWidth,
    itemHeight,
    pallet.length,
    pallet.width,
    maxHeight
  )
  
  // Maksimalan broj jedinica po paleti
  const maxUnitsByVolume = bestOrientation.totalUnits
  const maxUnitsByWeight = Math.floor(maxWeight / itemWeight)
  const unitsPerPallet = Math.min(maxUnitsByVolume, maxUnitsByWeight)
  
  // Broj potrebnih paleta
  const palletsNeeded = Math.ceil(cargoItem.quantity / unitsPerPallet)
  
  // Visina jedne palete sa teretom
  const palletHeight = bestOrientation.unitsH * itemHeight
  
  // Težina jedne pune palete
  const palletWeight = unitsPerPallet * itemWeight
  
  // Iskorišćenost palete
  const palletVolume = pallet.length * pallet.width * maxHeight
  const usedVolume = unitsPerPallet * itemLength * itemWidth * itemHeight
  const volumeUtilization = (usedVolume / palletVolume) * 100
  
  return {
    cargoId: cargoItem.id,
    cargoName: cargoItem.name || `${cargoItem.packagingType} ${cargoItem.length}×${cargoItem.width}×${cargoItem.height}`,
    packagingType: cargoItem.packagingType,
    unitsPerPallet,
    palletsNeeded,
    palletHeight,
    palletWeight,
    volumeUtilization: volumeUtilization.toFixed(1),
    bestOrientation,
    limitedBy: maxUnitsByVolume < maxUnitsByWeight ? 'volumen' : 'težina',
    palletType,
    palletDimensions: {
      length: pallet.length,
      width: pallet.width,
      height: palletHeight
    }
  }
}

// Pakovanje više tipova tereta na palete (kombinovano)
export function packMixedCargoOnPallets(cargoGroup, palletType, palletConfig) {
  const pallet = palletDimensions[palletType]
  const maxHeight = palletConfig?.maxHeight || pallet.maxHeight
  const maxWeight = palletConfig?.maxWeight || pallet.maxWeight
  
  // Sortiraj po težini (najteži dole)
  const sortedCargo = [...cargoGroup].sort((a, b) => b.weight - a.weight)
  
  // Jednostavna strategija: pakuj svaki tip posebno
  // (Napredna verzija bi kombinovala na istoj paleti)
  const results = sortedCargo.map(cargo => 
    packCargoOnPallets(cargo, palletType, palletConfig)
  )
  
  return results
}

// Glavna funkcija za paletizaciju
export function calculatePalletization(cargoItems, palletType, palletConfig, allowMixing = true) {
  if (!palletType || cargoItems.length === 0) {
    return null
  }
  
  const results = []
  
  if (allowMixing && cargoItems.length > 1) {
    // Kombinovano pakovanje (za kompatibilne tipove)
    const mixedResults = packMixedCargoOnPallets(cargoItems, palletType, palletConfig)
    results.push(...mixedResults)
  } else {
    // Pojedinačno pakovanje
    cargoItems.forEach(cargo => {
      const result = packCargoOnPallets(cargo, palletType, palletConfig)
      results.push(result)
    })
  }
  
  // Ukupan broj paleta
  const totalPallets = results.reduce((sum, r) => sum + r.palletsNeeded, 0)
  
  // Prosečna iskorišćenost
  const avgUtilization = results.reduce((sum, r) => sum + parseFloat(r.volumeUtilization), 0) / results.length
  
  return {
    results,
    totalPallets,
    avgUtilization: avgUtilization.toFixed(1),
    palletType,
    palletConfig
  }
}
