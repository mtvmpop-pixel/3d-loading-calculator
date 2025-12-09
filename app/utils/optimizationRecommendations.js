import { findBestOrientation } from './binPacking3D'
import { palletDimensions } from './palletDimensions'

const HEIGHT_OPTIONS = [70, 80, 90, 100, 110, 120]

// Generiši preporuke za optimizaciju
export function generateOptimizationRecommendations(cargo, currentResult) {
  const recommendations = {
    alternativePallets: [],
    dimensionAdjustments: [],
    orientationComparison: []
  }

  // 1. TESTIRAJ SVE TIPOVE PALETA (bez aliasa i Custom)
  const validPalletTypes = [
    "EUR Paleta",
    "Industrijska (100×120)",
    "Industrijska (120×120)",
    "Industrijska (100×100)",
    "Industrijska (80×120)",
    "US Paleta (48×40)",
    "US Paleta (48×48)",
    "Azijska (110×110)",
    "Azijska (100×100)"
  ]
  
  validPalletTypes.forEach(palletType => {
    const pallet = palletDimensions[palletType]
    if (!pallet) return
    
    let bestForThisPallet = null
    let maxUtilization = 0

    HEIGHT_OPTIONS.forEach(maxHeight => {
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

        const totalPalletHeight = maxHeight + 15
        const palletVolume = pallet.length * pallet.width * totalPalletHeight
        const cargoVolume = result.totalUnits * orientation.l * orientation.w * orientation.h
        const utilization = (cargoVolume / palletVolume) * 100

        if (utilization > maxUtilization) {
          maxUtilization = utilization
          bestForThisPallet = {
            palletType: pallet.name,
            unitsPerPallet: result.totalUnits,
            utilization: utilization.toFixed(1),
            orientation: orientation.name,
            layout: `${result.unitsL}×${result.unitsW}×${result.unitsH}`,
            maxHeight: maxHeight,
            totalHeight: totalPalletHeight
          }
        }
      })
    })

    if (bestForThisPallet && parseFloat(bestForThisPallet.utilization) > parseFloat(currentResult.utilization)) {
      recommendations.alternativePallets.push({
        ...bestForThisPallet,
        improvement: (parseFloat(bestForThisPallet.utilization) - parseFloat(currentResult.utilization)).toFixed(1),
        palletsNeeded: Math.ceil(cargo.quantity / bestForThisPallet.unitsPerPallet)
      })
    }
  })

  // Sortiraj po iskorišćenosti
  recommendations.alternativePallets.sort((a, b) => parseFloat(b.utilization) - parseFloat(a.utilization))

  // 2. PREPORUKE ZA KOREKCIJU DIMENZIJA KUTIJA
  const adjustments = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]
  
  // Podrška za Custom paletu
  let currentPallet
  if (currentResult.palletType.startsWith('Custom')) {
    // Ekstraktuj dimenzije iz naziva "Custom Paleta (150×100 cm)"
    const match = currentResult.palletType.match(/(\d+)×(\d+)/)
    if (match) {
      currentPallet = {
        length: parseInt(match[1]),
        width: parseInt(match[2]),
        name: currentResult.palletType
      }
    }
  } else {
    currentPallet = Object.values(palletDimensions).find(p => p.name === currentResult.palletType)
  }
  
  if (currentPallet) {
    const dimensions = ['length', 'width', 'height']
    
    dimensions.forEach(dim => {
      adjustments.forEach(adj => {
        const adjustedCargo = { ...cargo }
        adjustedCargo[dim] = cargo[dim] + adj

        // Proveri da li je nova dimenzija validna
        if (adjustedCargo[dim] <= 0) return

        const result = findBestOrientation(
          adjustedCargo.length,
          adjustedCargo.width,
          adjustedCargo.height,
          currentPallet.length,
          currentPallet.width,
          currentResult.cargoHeight || 100
        )

        if (!result) return

        const totalPalletHeight = (currentResult.cargoHeight || 100) + 15
        const palletVolume = currentPallet.length * currentPallet.width * totalPalletHeight
        const cargoVolume = result.totalUnits * adjustedCargo.length * adjustedCargo.width * adjustedCargo.height
        const utilization = (cargoVolume / palletVolume) * 100

        if (utilization >= 95 && utilization > parseFloat(currentResult.utilization)) {
          recommendations.dimensionAdjustments.push({
            dimension: dim,
            adjustment: adj > 0 ? `+${adj}` : `${adj}`,
            newDimension: adjustedCargo[dim],
            originalDimension: cargo[dim],
            unitsPerPallet: result.totalUnits,
            utilization: utilization.toFixed(1),
            layout: `${result.unitsL}×${result.unitsW}×${result.unitsH}`,
            improvement: (utilization - parseFloat(currentResult.utilization)).toFixed(1)
          })
        }
      })
    })
  }

  // Sortiraj po iskorišćenosti i ukloni duplikate
  recommendations.dimensionAdjustments.sort((a, b) => parseFloat(b.utilization) - parseFloat(a.utilization))
  
  // Ukloni duplikate (ista iskorišćenost)
  const uniqueAdjustments = []
  const seenUtilizations = new Set()
  
  recommendations.dimensionAdjustments.forEach(adj => {
    const key = `${adj.utilization}-${adj.unitsPerPallet}`
    if (!seenUtilizations.has(key)) {
      seenUtilizations.add(key)
      uniqueAdjustments.push(adj)
    }
  })
  
  recommendations.dimensionAdjustments = uniqueAdjustments.slice(0, 5)

  return recommendations
}

// Proveri da li je moguće postići 100% iskorišćenost
export function checkPerfectFit(cargo, palletLength, palletWidth, maxHeight) {
  const orientations = [
    { l: cargo.length, w: cargo.width, h: cargo.height, name: 'L×W×H' },
    { l: cargo.length, w: cargo.height, h: cargo.width, name: 'L×H×W' },
    { l: cargo.width, w: cargo.length, h: cargo.height, name: 'W×L×H' },
    { l: cargo.width, w: cargo.height, h: cargo.length, name: 'W×H×L' },
    { l: cargo.height, w: cargo.length, h: cargo.width, name: 'H×L×W' },
    { l: cargo.height, w: cargo.width, h: cargo.length, name: 'H×W×L' }
  ]

  for (const orientation of orientations) {
    const unitsL = palletLength / orientation.l
    const unitsW = palletWidth / orientation.w
    const unitsH = maxHeight / orientation.h

    // Proveri da li su svi brojevi celi (savršeno slaganje)
    if (Number.isInteger(unitsL) && Number.isInteger(unitsW) && Number.isInteger(unitsH)) {
      return {
        isPerfect: true,
        orientation: orientation.name,
        layout: `${unitsL}×${unitsW}×${unitsH}`,
        unitsPerPallet: unitsL * unitsW * unitsH
      }
    }
  }

  return { isPerfect: false }
}
