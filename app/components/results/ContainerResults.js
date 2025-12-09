import DirectPackingAlternatives from './DirectPackingAlternatives'

export default function ContainerResults({ containerResult, usePalletization }) {
  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 mb-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        🚢 Rezultati Pakovanja u Kontejner
      </h2>

      <div className="grid grid-cols-2 gap-6 mb-8 p-6 bg-green-50 rounded-lg">
        <div>
          <p className="text-gray-600 text-sm">📦 Potrebno je</p>
          <p className="text-5xl font-bold text-green-600">
            {containerResult.containersNeeded}
          </p>
          <p className="text-gray-600 text-lg">
            {containerResult.containersNeeded === 1 ? 'kontejner' : 'kontejnera'}
          </p>
        </div>
        
        {usePalletization && (
          <div>
            <p className="text-gray-600 text-sm">Ukupno paleta: {containerResult.totalPallets}</p>
            <p className="text-gray-600 text-sm">Max po kontejneru: {containerResult.maxPalletsPerContainer}</p>
            {containerResult.layers > 1 && (
              <p className="text-blue-600 font-semibold text-sm mt-2">
                🔄 {containerResult.layers} sloja paleta ({containerResult.palletsPerLayer} po sloju)
              </p>
            )}
          </div>
        )}
      </div>

      {/* Prikaz alternativnih opcija za direktno pakovanje */}
      {!usePalletization && containerResult.results && containerResult.results.map((result, idx) => (
        result.alternatives && result.alternatives.length > 0 && (
          <DirectPackingAlternatives 
            key={idx}
            alternatives={result.alternatives} 
            cargoName={result.cargoName}
          />
        )
      ))}

      <div className="space-y-6">
        {containerResult.containerBreakdown.map((container, index) => (
          <div key={index} className="border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">
                Kontejner #{container.containerNumber}
              </h3>
              {usePalletization && container.layers > 1 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  📚 {container.layers} sloja
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">
                  {usePalletization ? 'Paleta' : 'Jedinica'}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {usePalletization ? container.pallets : container.cargo.reduce((sum, c) => sum + c.units, 0)}
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Težina</p>
                <p className="text-2xl font-bold text-purple-600">{container.weight}</p>
                <p className="text-xs text-gray-500">kg</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Iskorišćenost Volumena</p>
                <p className="text-2xl font-bold text-green-600">{container.volumeUtilization}%</p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Iskorišćenost Težine</p>
                <p className="text-2xl font-bold text-yellow-600">{container.weightUtilization}%</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600">
                Prazan prostor: <span className="font-semibold">{container.emptySpace} m³</span>
              </p>
            </div>

            {usePalletization && container.cargoBreakdown && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-3">📋 Raspored Tereta:</h4>
                <div className="space-y-2">
                  {container.cargoBreakdown.map((cargo, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded">
                      <div>
                        <p className="font-semibold text-gray-800">{cargo.name}</p>
                        <p className="text-sm text-gray-500">{cargo.packagingType}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          <span className="font-semibold">{cargo.pallets}</span> paleta
                        </p>
                        <p className="text-sm text-gray-500">
                          {cargo.units} jedinica • {cargo.weight} kg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!usePalletization && container.cargo && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-3">📋 Raspored Tereta:</h4>
                <div className="space-y-2">
                  {container.cargo.map((cargo, idx) => (
                    <div key={idx} className="p-3 bg-white border border-gray-200 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <p className="font-semibold text-gray-800">{cargo.name}</p>
                          <p className="text-sm text-gray-500">{cargo.packagingType}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            <span className="font-semibold">{cargo.units}</span> jedinica
                          </p>
                          <p className="text-sm text-gray-500">{cargo.weight} kg</p>
                        </div>
                      </div>
                      {cargo.orientation && (
                        <div className="flex gap-2 text-xs">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            🔄 {cargo.orientation}
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                            📐 {cargo.layout}
                          </span>
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                            ✅ {cargo.utilization}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  )
}
