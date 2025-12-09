'use client'

import { useState } from 'react'
import CalculatorForm from './components/forms/CalculatorForm'
import PalletResults from './components/results/PalletResults'
import ContainerResults from './components/results/ContainerResults'
import Recommendations from './components/Recommendations'
import Container3DViewer from './components/visualization/Container3DViewer'
import { calculatePalletization } from './services/palletPacking'
import { packPalletsInContainer, packCargoDirectly } from './services/containerPacking'
import { groupByCompatibility } from './config/pallets/palletDimensions'
import { containerDimensions } from './config/vehicles/containerDimensions'
import { generateItemPositions, generatePalletPositions } from './core/algorithms/position3D'

export default function Home() {
  const [usePalletization, setUsePalletization] = useState(false)
  const [palletType, setPalletType] = useState('')
  const [palletConfig, setPalletConfig] = useState({
    maxHeight: 120,
    maxWeight: 1500
  })

  const [palletizationResult, setPalletizationResult] = useState(null)
  const [containerResult, setContainerResult] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [viewer3DData, setViewer3DData] = useState(null)

  const handleCalculate = (transportType, cargoItems) => {
    // Reset 3D prikaza
    setViewer3DData(null)
    
    let finalContainerResult = null
    let finalPalletResult = null
    const recs = []

    if (usePalletization && palletType) {
      const groups = groupByCompatibility(cargoItems)
      
      if (groups.length > 1) {
        const incompatibleTypes = groups.map(g => g[0].packagingType).join(', ')
        recs.push(`⚠️ Tereti nisu kompatibilni (${incompatibleTypes}) - biće pakovani na odvojene palete`)
      } else if (groups[0].length > 1) {
        recs.push(`✅ Tereti su kompatibilni - mogu se kombinovati na istoj paleti`)
      }

      const palletResult = calculatePalletization(cargoItems, palletType, palletConfig, true)
      setPalletizationResult(palletResult)
      finalPalletResult = palletResult

      const containerPacking = packPalletsInContainer(palletResult.results, transportType)
      setContainerResult(containerPacking)
      finalContainerResult = containerPacking

      if (parseFloat(palletResult.avgUtilization) < 70) {
        recs.push(`💡 Prosečna iskorišćenost paleta je ${palletResult.avgUtilization}% - razmislite o optimizaciji dimenzija`)
      }

      // Proveri da li palete prelaze visinu kontejnera
      const container = containerDimensions[transportType]
      const maxPalletHeight = Math.max(...palletResult.results.map(r => r.palletDimensions.height))
      
      if (maxPalletHeight > container.height) {
        recs.push(`⚠️ UPOZORENJE: Visina paleta (${maxPalletHeight} cm) prelazi visinu kontejnera (${container.height} cm)! Smanjite max visinu.`)
      }

    } else {
      setPalletizationResult(null)
      
      const directPacking = packCargoDirectly(cargoItems, transportType)
      setContainerResult(directPacking)
      finalContainerResult = directPacking

      if (cargoItems.length > 1) {
        recs.push(`📦 Više tipova tereta - razmislite o paletizaciji za lakše rukovanje`)
      }
    }

    if (finalContainerResult) {
      const lastContainer = finalContainerResult.containerBreakdown[finalContainerResult.containersNeeded - 1]
      
      if (finalContainerResult.containersNeeded > 1) {
        const lastUtil = parseFloat(lastContainer.volumeUtilization)
        if (lastUtil < 50) {
          recs.push(`📦 Poslednji kontejner je samo ${lastUtil}% pun - razmislite o optimizaciji ili dodavanju još tereta`)
        }
      }

      const firstContainer = finalContainerResult.containerBreakdown[0]
      const volumeUtil = parseFloat(firstContainer.volumeUtilization)
      const weightUtil = parseFloat(firstContainer.weightUtilization)

      if (volumeUtil < 70) {
        recs.push(`💡 Iskorišćenost prostora je ${volumeUtil}% - razmislite o manjoj jedinici prevoza`)
      }

      if (weightUtil < 50 && volumeUtil > 80) {
        recs.push(`⚖️ Kontejner je pun po volumenu (${volumeUtil}%), ali ima kapaciteta po težini (${weightUtil}%) - možete dodati teži teret`)
      }

      if (finalContainerResult.bestOrientation && finalContainerResult.bestOrientation.name !== 'Original (L×W×H)') {
        recs.push(`🔄 Preporučena orijentacija: ${finalContainerResult.bestOrientation.name}`)
      }
    }

    // Generiši 3D prikaz podatke
    if (usePalletization && finalPalletResult && finalContainerResult) {
      const container = containerDimensions[transportType]
      const palletPositions = generatePalletPositions(
        finalPalletResult.results,
        finalContainerResult.bestOrientation,
        finalContainerResult.maxPalletsPerContainer
      )
      
      // DIJAGNOSTIKA
      console.log('=== DIJAGNOSTIKA PALETIZACIJE ===')
      console.log('Kontejner dimenzije (L×W×H):', container.length, '×', container.width, '×', container.height)
      console.log('Paleta dimenzije (L×W×H):', finalPalletResult.results[0].palletDimensions)
      console.log('Best orientation:', finalContainerResult.bestOrientation)
      console.log('Paleta po redu (L):', finalContainerResult.bestOrientation.unitsL)
      console.log('Paleta po koloni (W):', finalContainerResult.bestOrientation.unitsW)
      console.log('Max paleta po kontejneru:', finalContainerResult.maxPalletsPerContainer)
      console.log('Broj paleta za prikaz:', palletPositions.length)
      
      // DEBUG: Proveri šta je u palletPositions
      console.log('🔍 Prva paleta iz palletPositions:', palletPositions[0])
      console.log('🔍 Poslednja paleta iz palletPositions:', palletPositions[palletPositions.length - 1])
      
      // Proveri da li palete izlaze
      const maxX = Math.max(...palletPositions.map(p => p.x + p.length/2))
      const minX = Math.min(...palletPositions.map(p => p.x - p.length/2))
      const maxZ = Math.max(...palletPositions.map(p => p.z + p.width/2))
      const minZ = Math.min(...palletPositions.map(p => p.z - p.width/2))
      
      console.log('🔍 Primer kalkulacije za Z:', {
        'Paleta 0 z': palletPositions[0].z,
        'Paleta 0 width': palletPositions[0].width,
        'z + width/2': palletPositions[0].z + palletPositions[0].width/2,
        'Poslednja paleta z': palletPositions[palletPositions.length - 1].z,
        'Poslednja z + width/2': palletPositions[palletPositions.length - 1].z + palletPositions[palletPositions.length - 1].width/2
      })
      
      console.log('Palete X opseg:', minX, 'do', maxX, '(kontejner:', -container.length/2, 'do', container.length/2, ')')
      console.log('Palete Z opseg:', minZ, 'do', maxZ, '(kontejner:', -container.width/2, 'do', container.width/2, ')')
      
      if (maxX > container.length/2 || minX < -container.length/2) {
        console.log('⚠️ PALETE IZLAZE PO X OSI!')
      }
      if (maxZ > container.width/2 || minZ < -container.width/2) {
        console.log('⚠️ PALETE IZLAZE PO Z OSI!')
      }
      
      console.log('================================')
      
      setViewer3DData({
        containerDimensions: container,
        items: palletPositions,
        showPallets: true
      })
    } else if (finalContainerResult && finalContainerResult.results) {
      const container = containerDimensions[transportType]
      const firstCargo = cargoItems[0]
      const firstResult = finalContainerResult.results[0]
      
      if (firstResult && firstResult.bestOrientation) {
        const itemPositions = generateItemPositions(
          firstResult.bestOrientation,
          Math.min(firstCargo.quantity, firstResult.maxUnitsPerContainer),
          {
            length: firstResult.bestOrientation.l,
            width: firstResult.bestOrientation.w,
            height: firstResult.bestOrientation.h
          },
          firstCargo.safetyGap
        )
        
        setViewer3DData({
          containerDimensions: container,
          items: itemPositions,
          showPallets: false
        })
      }
    }

    setRecommendations(recs)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🚚 Container Loading Calculator
          </h1>
          <p className="text-blue-100 text-lg">
            3D Optimizacija utovara sa AI-powered algoritmom
          </p>
        </div>

        <CalculatorForm 
          onCalculate={handleCalculate}
          usePalletization={usePalletization}
          setUsePalletization={setUsePalletization}
          palletType={palletType}
          setPalletType={setPalletType}
          palletConfig={palletConfig}
          setPalletConfig={setPalletConfig}
        />

        {palletizationResult && (
          <PalletResults palletizationResult={palletizationResult} />
        )}

        {containerResult && (
          <ContainerResults 
            containerResult={containerResult} 
            usePalletization={usePalletization}
          />
        )}

        {viewer3DData && (
          <Container3DViewer
            key={`3d-viewer-${viewer3DData.showPallets ? 'pallets' : 'cargo'}`}
            containerDimensions={viewer3DData.containerDimensions}
            items={viewer3DData.items}
            showPallets={viewer3DData.showPallets}
          />
        )}

        {recommendations.length > 0 && (
          <div className="mt-8">
            <Recommendations recommendations={recommendations} />
          </div>
        )}

        <div className="text-center mt-12 text-blue-100">
          <p>Powered by AI • West Balkans Logistics</p>
        </div>

      </div>
    </div>
  )
}
