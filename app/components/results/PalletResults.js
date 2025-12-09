import AlternativeOptions from './AlternativeOptions'
import OptimizationRecommendations from './OptimizationRecommendations'

export default function PalletResults({ palletizationResult }) {
  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 mb-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        📦 Rezultati Paletizacije
      </h2>

      <div className="grid grid-cols-2 gap-6 mb-8 p-6 bg-blue-50 rounded-lg">
        <div>
          <p className="text-gray-600 text-sm">Ukupno paleta:</p>
          <p className="text-4xl font-bold text-blue-600">{palletizationResult.totalPallets}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Prosečna iskorišćenost:</p>
          <p className="text-4xl font-bold text-green-600">{palletizationResult.avgUtilization}%</p>
        </div>
      </div>

      <div className="space-y-6">
        {palletizationResult.results.map((result, index) => (
          <div key={index}>
            <div className="border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{result.cargoName}</h3>
                  <p className="text-gray-500">{result.packagingType}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">{result.palletsNeeded}</p>
                  <p className="text-sm text-gray-500">paleta</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-500 mb-1">Po Paleti</p>
                  <p className="text-lg font-bold text-gray-800">{result.unitsPerPallet}</p>
                  <p className="text-xs text-gray-500">jedinica</p>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-500 mb-1">Težina Palete</p>
                  <p className="text-lg font-bold text-gray-800">{result.palletWeight.toFixed(0)}</p>
                  <p className="text-xs text-gray-500">kg</p>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-500 mb-1">Visina Palete</p>
                  <p className="text-lg font-bold text-gray-800">{result.palletDimensions.height}</p>
                  <p className="text-xs text-gray-500">cm</p>
                </div>

                <div className="bg-green-50 p-3 rounded">
                  <p className="text-xs text-gray-500 mb-1">Iskorišćenost</p>
                  <p className="text-lg font-bold text-green-600">{result.utilization}%</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                  🔄 Orijentacija: {result.orientation}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                  📐 Raspored: {result.layout}
                </span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                  ⚖️ Ograničeno: {result.bestOrientation.limitedBy || 'volumen'}
                </span>
              </div>
            </div>

            {/* Prikaz alternativnih opcija */}
            {result.alternatives && result.alternatives.length > 0 && (
              <div className="mt-4">
                <AlternativeOptions 
                  alternatives={result.alternatives} 
                  cargoName={result.cargoName}
                />
              </div>
            )}

            {/* NOVO: Prikaz preporuka za optimizaciju */}
            {result.recommendations && (
              <div className="mt-4">
                <OptimizationRecommendations 
                  recommendations={result.recommendations} 
                  cargoName={result.cargoName}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
