import { ContainerCalculator } from '../core/calculators/ContainerCalculator'

export function packPalletsInContainer(palletResults, containerType) {
  const calculator = new ContainerCalculator(containerType)
  return calculator.packPallets(palletResults)
}

export function packCargoDirectly(cargoItems, containerType) {
  const calculator = new ContainerCalculator(containerType)
  return calculator.packCargoDirectly(cargoItems)
}
