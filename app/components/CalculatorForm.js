'use client'

import { useState } from 'react'
import { containerOptions } from '../utils/containerDimensions'
import CargoItemForm from './CargoItemForm'

export default function CalculatorForm({ 
  onCalculate,
  usePalletization,
  setUsePalletization,
  palletType,
  setPalletType,
  palletConfig,
  setPalletConfig
}) {
  const [transportType, setTransportType] = useState('')
  const [cargoItems, setCargoItems] = useState([
    {
      id: 1,
      name: '',
      packagingType: '',
      length: '',
      width: '',
      height: '',
      weight: '',
      quantity: '',
      safetyGap: 5
    }
  ])

  const addCargoItem = () => {
    setCargoItems([
      ...cargoItems,
      {
        id: Date.now(),
        name: '',
        packagingType: '',
        length: '',
        width: '',
        height: '',
        weight: '',
        quantity: '',
        safetyGap: 5
      }
    ])
  }

  const updateCargoItem = (index, updatedCargo) => {
    const newItems = [...cargoItems]
    newItems[index] = updatedCargo
    setCargoItems(newItems)
  }

  const removeCargoItem = (index) => {
    if (cargoItems.length > 1) {
      setCargoItems(cargoItems.filter((_, i) => i !== index))
    }
  }

  const handleCalculate = () => {
    // Validacija
    if (!transportType) {
      alert('Molimo izaberite tip prevoza!')
      return
    }

    const invalidCargo = cargoItems.find(cargo => 
      !cargo.packagingType || !cargo.length || !cargo.width || !cargo.height || !cargo.weight || !cargo.quantity
    )

    if (invalidCargo) {
      alert('Molimo popunite sva polja za sve stavke tereta!')
      return
    }

    if (usePalletization && !palletType) {
      alert('Molimo izaberite tip palete!')
      return
    }

    onCalculate(transportType, cargoItems)
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Unesi Parametre Utovara
      </h2>

      {/* Transport Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tip Prevoza
        </label>
        <select 
          value={transportType}
          onChange={(e) => setTransportType(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Izaberi tip prevoza</option>
          {containerOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {/* Cargo Items */}
      <div className="space-y-6 mb-6">
        {cargoItems.map((cargo, index) => (
          <CargoItemForm
            key={cargo.id}
            cargo={cargo}
            index={index}
            onUpdate={updateCargoItem}
            onRemove={removeCargoItem}
          />
        ))}
      </div>

      {/* Add More Cargo */}
      <button
        onClick={addCargoItem}
        className="w-full mb-8 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
      >
        + Dodaj Još Tereta
      </button>

      {/* Palletization Section */}
      <div className="border-t-2 border-gray-200 pt-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            📋 Paletizacija
          </h3>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={usePalletization}
              onChange={(e) => setUsePalletization(e.target.checked)}
              className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Koristi paletizaciju
            </span>
          </label>
        </div>

        {usePalletization && (
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Pallet Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tip Palete *
                </label>
                <select 
                  value={palletType}
                  onChange={(e) => setPalletType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Izaberi paletu</option>
                  <option value="EUR">EUR Paleta (120×80 cm)</option>
                  <option value="Industrial">Industrijska Paleta (100×120 cm)</option>
                </select>
              </div>

              {/* Max Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Visina Slaganja (cm)
                </label>
                <input 
                  type="number" 
                  placeholder="150 (preporučeno)"
                  value={palletConfig.maxHeight}
                  onChange={(e) => setPalletConfig({...palletConfig, maxHeight: parseFloat(e.target.value) || 150})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Max Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Težina Po Paleti (kg)
                </label>
                <input 
                  type="number" 
                  placeholder="1500 (preporučeno)"
                  value={palletConfig.maxWeight}
                  onChange={(e) => setPalletConfig({...palletConfig, maxWeight: parseFloat(e.target.value) || 1500})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
      >
        🧮 Izračunaj Optimalni Utovar
      </button>

    </div>
  )
}
