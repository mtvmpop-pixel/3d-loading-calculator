'use client'

export default function CargoItemForm({ cargo, index, onUpdate, onRemove }) {
  
  const handleChange = (field, value) => {
    onUpdate(index, { ...cargo, [field]: value })
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200 relative">
      
      {/* Remove Button */}
      <button 
        onClick={() => onRemove(index)}
        className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-bold text-xl"
      >
        ✕
      </button>

      <h3 className="text-lg font-bold text-gray-800 mb-4">
        📦 Teret #{index + 1}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Name (Optional) */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Naziv (Opciono)
          </label>
          <input 
            type="text" 
            placeholder="npr. Kutije sa proizvodima"
            value={cargo.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Packaging Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tip Pakovanja
          </label>
          <select 
            value={cargo.packagingType}
            onChange={(e) => handleChange('packagingType', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Izaberi tip</option>
            <option value="Box">📦 Box (Kutija)</option>
            <option value="Barrel">🛢️ Barrel (Bure)</option>
            <option value="Bag">👜 Bag (Vreća)</option>
            <option value="Big Bag">🏗️ Big Bag</option>
            <option value="Paleta">📋 Paleta</option>
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Broj Jedinica
          </label>
          <input 
            type="number" 
            placeholder="npr. 100"
            value={cargo.quantity}
            onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Dimensions */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dimenzije (cm)
          </label>
          <div className="grid grid-cols-3 gap-4">
            <input 
              type="number" 
              placeholder="Dužina"
              value={cargo.length}
              onChange={(e) => handleChange('length', parseFloat(e.target.value) || 0)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input 
              type="number" 
              placeholder="Širina"
              value={cargo.width}
              onChange={(e) => handleChange('width', parseFloat(e.target.value) || 0)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input 
              type="number" 
              placeholder="Visina"
              value={cargo.height}
              onChange={(e) => handleChange('height', parseFloat(e.target.value) || 0)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Težina Po Jedinici (kg)
          </label>
          <input 
            type="number" 
            placeholder="npr. 25"
            value={cargo.weight}
            onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Safety Gap */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sigurnosni Razmak (cm)
          </label>
          <input 
            type="number" 
            value={cargo.safetyGap}
            onChange={(e) => handleChange('safetyGap', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

      </div>
    </div>
  )
}
