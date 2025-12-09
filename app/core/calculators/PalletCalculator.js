import { findBestOrientation } from '../algorithms/binPacking3D'
import { palletDimensions } from '../../config/pallets/palletDimensions'
import { HEIGHT_OPTIONS, PALLET_BASE_HEIGHT } from '../../config/constants'


export class PalletCalculator {
  constructor(palletType, palletConfig) {
    this.palletType = palletType
    this.palletConfig = palletConfig
    this.pallet = this.resolvePallet()
  }

  resolvePallet() {
    if (this.palletType === 'Custom') {
      if (!this.palletConfig.customLength || !this.palletConfig.customWidth) {
        throw new Error('Molimo unesite dimenzije custom palete!')
      }
      return {
        length: this.palletConfig.customLength,
        width: this.palletConfig.customWidth,
        name: `Custom Paleta (${this.palletConfig.customLength}×${this.palletConfig.customWidth} cm)`
      }
    }
    
    const pallet = palletDimensions[this.palletType]
    if (!pallet) {
      throw new Error(`Unknown pallet type: ${this.palletType}`)
    }
    return pallet
  }

  calculateForCargo(cargo) {
    const cargoOptions = []
    
    HEIGHT_OPTIONS.forEach(maxHeight => {
      if (maxHeight > this.palletConfig.maxHeight) return
      
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
          this.pallet.length,
          this.pallet.width,
          maxHeight,
          false
        )
        
        if (!result) return
        
        const unitsPerPallet = result.totalUnits
        const palletWeight = unitsPerPallet * cargo.weight
        
        if (palletWeight > this.palletConfig.maxWeight) return
        
        const totalPalletHeight = maxHeight + PALLET_BASE_HEIGHT
        const palletVolume = this.pallet.length * this.pallet.width * totalPalletHeight
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
    
    cargoOptions.sort((a, b) => b.utilization - a.utilization)
    return cargoOptions
  }

  selectBestOption(cargoOptions) {
    return cargoOptions.find(opt => 
      opt.maxHeight === this.palletConfig.maxHeight
    ) || cargoOptions[0]
  }

  buildResult(cargo, selectedOption, cargoOptions) {
    if (!selectedOption) {
      throw new Error('Nije moguće naći validnu opciju za paletizaciju.')
    }
    
    const palletsNeeded = Math.ceil(cargo.quantity / selectedOption.unitsPerPallet)
    const top3 = cargoOptions.slice(0, 3)
    
    return {
      cargoId: cargo.id,
      palletType: this.pallet.name,
      cargoName: cargo.name || `${cargo.packagingType} ${cargo.length}×${cargo.width}×${cargo.height}`,
      packagingType: cargo.packagingType,
      unitsPerPallet: selectedOption.unitsPerPallet,
      palletsNeeded: palletsNeeded,
      palletWeight: selectedOption.palletWeight,
      palletDimensions: {
        length: this.pallet.length,
        width: this.pallet.width,
        height: selectedOption.totalHeight
      },
      cargoHeight: selectedOption.maxHeight,
      utilization: selectedOption.utilization.toFixed(1),
      orientation: selectedOption.orientation,
      layout: selectedOption.layout,
      bestOrientation: selectedOption.bestOrientation,
      alternatives: top3.map((opt, idx) => ({
        rank: idx + 1,
        orientation: opt.orientation,
        maxHeight: opt.maxHeight,
        totalHeight: opt.totalHeight,
        unitsPerPallet: opt.unitsPerPallet,
        utilization: opt.utilization.toFixed(1),
        layout: opt.layout,
        palletsNeeded: Math.ceil(cargo.quantity / opt.unitsPerPallet)
      }))
    }
  }
}
