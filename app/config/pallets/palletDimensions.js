import { groupCargoByCompatibility } from '../packaging/packagingRules'

// PALLET DIMENSIONS
export const palletDimensions = {
  'EUR': { length: 120, width: 80, name: 'EUR Paleta (120×80 cm)' },
  'EUR Paleta': { length: 120, width: 80, name: 'EUR Paleta (120×80 cm)' },
  'Industrijska': { length: 120, width: 100, name: 'Industrijska Paleta (120×100 cm)' },
  'Industrijska Paleta': { length: 120, width: 100, name: 'Industrijska Paleta (120×100 cm)' },
  'UK': { length: 120, width: 100, name: 'UK Paleta (120×100 cm)' },
  'UK Paleta': { length: 120, width: 100, name: 'UK Paleta (120×100 cm)' },
  'US': { length: 120, width: 101.6, name: 'US Paleta (48×40 in)' },
  'US Paleta': { length: 120, width: 101.6, name: 'US Paleta (48×40 in)' },
  'Custom': { length: 0, width: 0, name: 'Custom Paleta' }
}

// PALLET OPTIONS FOR DROPDOWN
export const palletOptions = [
  { value: 'EUR', label: 'EUR Paleta (120×80 cm)' },
  { value: 'Industrijska', label: 'Industrijska Paleta (120×100 cm)' },
  { value: 'UK', label: 'UK Paleta (120×100 cm)' },
  { value: 'US', label: 'US Paleta (48×40 in / 120×101.6 cm)' },
  { value: 'Custom', label: 'Custom Paleta (unesite dimenzije)' }
]

// RE-EXPORT groupCargoByCompatibility
export { groupCargoByCompatibility as groupByCompatibility }

export default {
  palletDimensions,
  palletOptions,
  groupByCompatibility: groupCargoByCompatibility
}
