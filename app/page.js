'use client'

import { useState } from 'react'
import CalculatorForm from './components/forms/CalculatorForm'
import PalletResults from './components/results/PalletResults'
import ContainerResults from './components/results/ContainerResults'
import Recommendations from './components/Recommendations'
import Container3DViewer from './components/visualization/Container3DViewer'
import { CalculationService } from './services/CalculationService'
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
    
    const service = new CalculationService()
    let result

    if (usePalletization && palletType) {
      // SA PALETIZACIJOM
      result = service.calculateWithPalletization(cargoItems, palletType, palletConfig, transportType)
      
      setPalletizationResult(result.palletizationResult)
      setContainerResult(result.containerResult)
      setRecommendations(result.recommendations)

      // 3D prikaz za palete
      generate3DForPallets(
        transportType,
        result.palletizationResult,
        result.containerResult
      )

    } else {
      // BEZ PALETIZACIJE
      result = service.calculateDirectPacking(cargoItems, transportType)
      
      setPalletizationResult(null)
      setContainerResult(result.containerResult)
      setRecommendations(result.recommendations)

      // 3D prikaz za direktan teret
      generate3DForCargo(
        transportType,
        cargoItems,
        result.containerResult
      )
    }
  }

  const generate3DForPallets = (transportType, palletizationResult, containerResult) => {
    const container = containerDimensions[transportType]
    const palletPositions = generatePalletPositions(
      palletizationResult.results,
      containerResult.bestOrientation,
      containerResult.maxPalletsPerContainer
    )
    
    // DIJAGNOSTIKA
    console.log('=== DIJAGNOSTIKA PALETIZACIJE ===')
    console.log('Kontejner dimenzije (L×W×H):', container.length, '×', container.width, '×', container.height)
    console.log('Paleta dimenzije (L×W×H):', palletizationResult.results[0].palletDimensions)
    console.log('Best orientation:', containerResult.bestOrientation)
    console.log('Paleta po redu (L):', containerResult.bestOrientation.unitsL)
    console.log('Paleta po koloni (W):', containerResult.bestOrientation.unitsW)
    console.log('Max paleta po kontejneru:', containerResult.maxPalletsPerContainer)
    console.log('Broj paleta za prikaz:', palletPositions.length)
    console.log('================================')
    
    setViewer3DData({
      containerDimensions: container,
      items: palletPositions,
      showPallets: true
    })
  }

  const generate3DForCargo = (transportType, cargoItems, containerResult) => {
    const container = containerDimensions[transportType]
    const firstCargo = cargoItems[0]
    const firstResult = containerResult.results[0]
    
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
