import { findBestOrientation } from '../core/algorithms/binPacking3D'
import { palletDimensions } from '../config/pallets/palletDimensions'
import { generateOptimizationRecommendations } from './optimizationRecommendations'

// Testiraj sve moguće visine palete
const HEIGHT_OPTIONS = [70, 80, 90, 100, 110, 120]
const PALLET_BASE_HEIGHT = 15 // Visina same palete (EUR standard)

export function calculatePalletization(cargoItems, palletType, palletConfig, allowMixing = true) {
  let pallet
  
  // Custom paleta
  if (palletType === 'Custom') {
    if (!palletConfig.customLength || !palletConfig.customWidth) {
      throw new Error('Molimo unesite dimenzije custom palete!')
    }
    pallet = {
      length: palletConfig.customLength,
      width: palletConfig.customWidth,
      name: `Custom Paleta (${palletConfig.customLength}×${palletConfig.customWidth} cm)`
    }
  } else {
    pallet = palletDimensions[palletType]
    if (!pallet) {
      throw new Error(`Unknown pallet type: ${palletType}`)
    }
  }

  const results = []
  const allOptions = [] // Za prikaz alternativa

  cargoItems.forEach(cargo => {
    const cargoOptions = []
    
    // Testiraj SVE orijentacije i visine
    HEIGHT_OPTIONS.forEach(maxHeight => {
      // Proveri da li je visina validna
      if (maxHeight > palletConfig.maxHeight) return
      
      // Testiraj sve orijentacije kutije
      const orientations = [
        { l: cargo.length, w: cargo.width, h: cargo.height, name: 'L×W×H' },
        { l: cargo.length, w: cargo.height, h: cargo.width, name: 'L×H×W' },
        { l: cargo.width, w: cargo.length, h: cargo.height, name: 'W×L×H' },
        { l: cargo.width, w: cargo.height, h: cargo.length, name: 'W×H×L' },
        { l: cargo.height, w: cargo.length, h: cargo.width, name: 'H×L×W' },
        { l: cargo.height, w: cargo.width, h: cargo.length, name: 'H×W×L' }
      ]
      
      orientations.forEach(orientation => {
        const result = findBestOrientation(
          orientation.l,
          orientation.w,
          orientation.h,
          pallet.length,
          pallet.width,
          maxHeight
        )
        
        if (!result) return
        
        const unitsPerPallet = result.totalUnits
        const palletWeight = unitsPerPallet * cargo.weight
        
        // Proveri težinu
        if (palletWeight > palletConfig.maxWeight) return
        
        // UKUPNA VISINA = visina robe + visina palete
        const totalPalletHeight = maxHeight + PALLET_BASE_HEIGHT
        const palletVolume = pallet.length * pallet.width * totalPalletHeight
        const cargoVolume = unitsPerPallet * orientation.l * orientation.w * orientation.h
        const utilization = (cargoVolume / palletVolume) * 100
        
        cargoOptions.push({
          orientation: orientation.name,
          maxHeight: maxHeight,
          totalHeight: totalPalletHeight,
          unitsPerPallet: unitsPerPallet,
          palletWeight: palletWeight,
          utilization: utilization,
          layout: `${result.unitsL}×${result.unitsW}×${result.unitsH}`,
          bestOrientation: result
        })
      })
    })
    
    // Sortiraj po iskorišćenosti
    cargoOptions.sort((a, b) => b.utilization - a.utilization)
    
    // Uzmi TOP 3
    const top3 = cargoOptions.slice(0, 3)
    
    // Koristi prvobitne parametre (prva opcija ili najbliža user input-u)
    const selectedOption = cargoOptions.find(opt => 
      opt.maxHeight === palletConfig.maxHeight
    ) || cargoOptions[0]
    
    if (!selectedOption) {
      throw new Error('Nije moguće naći validnu opciju za paletizaciju. Proverite dimenzije kutija i palete.')
    }
    
    const palletsNeeded = Math.ceil(cargo.quantity / selectedOption.unitsPerPallet)
    
    // Generiši preporuke za optimizaciju
    const currentResult = {
      utilization: selectedOption.utilization.toFixed(1),
      palletType: pallet.name,
      cargoHeight: selectedOption.maxHeight
    }
    const recommendations = generateOptimizationRecommendations(cargo, currentResult)
    
    results.push({
      cargoId: cargo.id,
      cargoName: cargo.name || `${cargo.packagingType} ${cargo.length}×${cargo.width}×${cargo.height}`,
      packagingType: cargo.packagingType,
      unitsPerPallet: selectedOption.unitsPerPallet,
      palletsNeeded: palletsNeeded,
      palletWeight: selectedOption.palletWeight,
      palletDimensions: {
        length: pallet.length,
        width: pallet.width,
        height: selectedOption.totalHeight  // Ukupna visina (roba + paleta)
      },
      cargoHeight: selectedOption.maxHeight,  // Samo visina robe
      utilization: selectedOption.utilization.toFixed(1),
      orientation: selectedOption.orientation,
      layout: selectedOption.layout,
      bestOrientation: selectedOption.bestOrientation,
      // Dodaj top 3 opcije za preporuke
      alternatives: top3.map((opt, idx) => ({
        rank: idx + 1,
        orientation: opt.orientation,
        maxHeight: opt.maxHeight,
        totalHeight: opt.totalHeight,
        unitsPerPallet: opt.unitsPerPallet,
        utilization: opt.utilization.toFixed(1),
        layout: opt.layout,
        palletsNeeded: Math.ceil(cargo.quantity / opt.unitsPerPallet)
      })),
      recommendations: recommendations  // NOVO!
    })
    
    allOptions.push(...cargoOptions)
  })

  const totalPallets = results.reduce((sum, r) => sum + r.palletsNeeded, 0)
  const avgUtilization = (results.reduce((sum, r) => sum + parseFloat(r.utilization), 0) / results.length).toFixed(1)

  return {
    results,
    totalPallets,
    avgUtilization,
    palletType: pallet.name
  }
}

export function packCargoOnPallet(cargo, palletLength, palletWidth, maxHeight, maxWeight) {
  const bestOrientation = findBestOrientation(
    cargo.length,
    cargo.width,
    cargo.height,
    palletLength,
    palletWidth,
    maxHeight
  )

  if (!bestOrientation) {
    throw new Error('Nije moguće naći validnu orijentaciju za kutiju na paleti.')
  }

  const unitsPerPallet = bestOrientation.totalUnits
  const palletWeight = unitsPerPallet * cargo.weight

  if (palletWeight > maxWeight) {
    const maxUnits = Math.floor(maxWeight / cargo.weight)
    return {
      unitsPerPallet: maxUnits,
      limitedBy: 'weight',
      bestOrientation: bestOrientation
    }
  }

  return {
    unitsPerPallet: unitsPerPallet,
    limitedBy: 'volume',
    bestOrientation: bestOrientation
  }
}
