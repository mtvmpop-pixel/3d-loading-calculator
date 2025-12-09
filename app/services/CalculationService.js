import { PalletCalculator } from '../core/calculators/PalletCalculator'
import { ContainerCalculator } from '../core/calculators/ContainerCalculator'
import { generateOptimizationRecommendations } from './optimizationRecommendations'
import { groupByCompatibility } from '../config/pallets/palletDimensions'

export class CalculationService {
  constructor() {
    this.palletCalculator = null
    this.containerCalculator = null
  }

  // PALETIZACIJA + KONTEJNER
  calculateWithPalletization(cargoItems, palletType, palletConfig, containerType) {
    // 1. Proveri kompatibilnost
    const groups = groupByCompatibility(cargoItems)
    const compatibilityWarnings = this.generateCompatibilityWarnings(groups)

    // 2. Izračunaj paletizaciju
    this.palletCalculator = new PalletCalculator(palletType, palletConfig)
    const palletResults = []
    
    cargoItems.forEach(cargo => {
      const cargoOptions = this.palletCalculator.calculateForCargo(cargo)
      const selectedOption = this.palletCalculator.selectBestOption(cargoOptions)
      const result = this.palletCalculator.buildResult(cargo, selectedOption, cargoOptions)
      
      // Dodaj optimization recommendations
      result.recommendations = generateOptimizationRecommendations(cargo, result)
      
      palletResults.push(result)
    })

    const totalPallets = palletResults.reduce((sum, r) => sum + r.palletsNeeded, 0)
    const avgUtilization = (
      palletResults.reduce((sum, r) => sum + parseFloat(r.utilization), 0) / palletResults.length
    ).toFixed(1)

    // 3. Pakuj palete u kontejner
    this.containerCalculator = new ContainerCalculator(containerType)
    const containerResult = this.containerCalculator.packPallets(palletResults)

    // 4. Generiši preporuke
    const recommendations = [
      ...compatibilityWarnings,
      ...this.generatePalletRecommendations(avgUtilization, palletResults, containerType),
      ...this.generateContainerRecommendations(containerResult)
    ]

    return {
      palletizationResult: {
        results: palletResults,
        totalPallets,
        avgUtilization
      },
      containerResult,
      recommendations
    }
  }

  // DIREKTNO PAKOVANJE (BEZ PALETIZACIJE)
  calculateDirectPacking(cargoItems, containerType) {
    this.containerCalculator = new ContainerCalculator(containerType)
    const containerResult = this.containerCalculator.packCargoDirectly(cargoItems)

    const recommendations = [
      ...this.generateDirectPackingRecommendations(cargoItems),
      ...this.generateContainerRecommendations(containerResult)
    ]

    return {
      containerResult,
      recommendations
    }
  }

  // HELPER: Kompatibilnost warnings
  generateCompatibilityWarnings(groups) {
    if (groups.length > 1) {
      const incompatibleTypes = groups.map(g => g[0].packagingType).join(', ')
      return [`⚠️ Tereti nisu kompatibilni (${incompatibleTypes}) - biće pakovani na odvojene palete`]
    } else if (groups[0].length > 1) {
      return [`✅ Tereti su kompatibilni - mogu se kombinovati na istoj paleti`]
    }
    return []
  }

  // HELPER: Pallet recommendations
  generatePalletRecommendations(avgUtilization, palletResults, containerType) {
    const recs = []
    
    if (parseFloat(avgUtilization) < 70) {
      recs.push(`💡 Prosečna iskorišćenost paleta je ${avgUtilization}% - razmislite o optimizaciji dimenzija`)
    }

    // Proveri da li palete prelaze visinu kontejnera
    const container = this.containerCalculator.container
    const maxPalletHeight = Math.max(...palletResults.map(r => r.palletDimensions.height))
    
    if (maxPalletHeight > container.height) {
      recs.push(`⚠️ UPOZORENJE: Visina paleta (${maxPalletHeight} cm) prelazi visinu kontejnera (${container.height} cm)! Smanjite max visinu.`)
    }

    return recs
  }

  // HELPER: Direct packing recommendations
  generateDirectPackingRecommendations(cargoItems) {
    if (cargoItems.length > 1) {
      return [`📦 Više tipova tereta - razmislite o paletizaciji za lakše rukovanje`]
    }
    return []
  }

  // HELPER: Container recommendations
  generateContainerRecommendations(containerResult) {
    const recs = []
    
    if (!containerResult.containerBreakdown || containerResult.containerBreakdown.length === 0) {
      return recs
    }

    const lastContainer = containerResult.containerBreakdown[containerResult.containersNeeded - 1]
    
    if (containerResult.containersNeeded > 1) {
      const lastUtil = parseFloat(lastContainer.volumeUtilization)
      if (lastUtil < 50) {
        recs.push(`📦 Poslednji kontejner je samo ${lastUtil}% pun - razmislite o optimizaciji ili dodavanju još tereta`)
      }
    }

    const firstContainer = containerResult.containerBreakdown[0]
    const volumeUtil = parseFloat(firstContainer.volumeUtilization)
    const weightUtil = parseFloat(firstContainer.weightUtilization)

    if (volumeUtil < 70) {
      recs.push(`💡 Iskorišćenost prostora je ${volumeUtil}% - razmislite o manjoj jedinici prevoza`)
    }

    if (weightUtil < 50 && volumeUtil > 80) {
      recs.push(`⚖️ Kontejner je pun po volumenu (${volumeUtil}%), ali ima kapaciteta po težini (${weightUtil}%) - možete dodati teži teret`)
    }

    if (containerResult.bestOrientation && containerResult.bestOrientation.name !== 'Original (L×W×H)') {
      recs.push(`🔄 Preporučena orijentacija: ${containerResult.bestOrientation.name}`)
    }

    return recs
  }
}
