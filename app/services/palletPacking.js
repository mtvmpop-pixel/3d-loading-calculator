import { PalletCalculator } from '../core/calculators/PalletCalculator'
import { generateOptimizationRecommendations } from './optimizationRecommendations'

export function calculatePalletization(cargoItems, palletType, palletConfig, includeRecommendations = false) {
  const calculator = new PalletCalculator(palletType, palletConfig)
  const results = []
  
  cargoItems.forEach(cargo => {
    const cargoOptions = calculator.calculateForCargo(cargo)
    const selectedOption = calculator.selectBestOption(cargoOptions)
    const result = calculator.buildResult(cargo, selectedOption, cargoOptions)
    
    if (includeRecommendations) {
      result.recommendations = generateOptimizationRecommendations(cargo, result)
    }
    
    results.push(result)
  })
  
  const totalPallets = results.reduce((sum, r) => sum + r.palletsNeeded, 0)
  const avgUtilization = (
    results.reduce((sum, r) => sum + parseFloat(r.utilization), 0) / results.length
  ).toFixed(1)
  
  return {
    results,
    totalPallets,
    avgUtilization
  }
}
