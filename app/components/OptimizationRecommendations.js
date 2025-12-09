export default function OptimizationRecommendations({ recommendations, cargoName }) {
  if (!recommendations) return null

  const { alternativePallets, dimensionAdjustments } = recommendations

  const hasRecommendations = 
    (alternativePallets && alternativePallets.length > 0) ||
    (dimensionAdjustments && dimensionAdjustments.length > 0)

  if (!hasRecommendations) return null

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl p-6 mb-6">
      <h3 className="text-2xl font-bold text-purple-800 mb-4">
        🚀 Preporuke za Optimizaciju - {cargoName}
      </h3>

      {/* Alternativne Palete */}
      {alternativePallets && alternativePallets.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-bold text-gray-800 mb-3">
            📦 Alternativne Palete (Bolja Iskorišćenost)
          </h4>
          <div className="space-y-3">
            {alternativePallets.slice(0, 3).map((alt, idx) => (
              <div 
                key={idx}
                className="bg-white border-2 border-green-300 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-bold text-lg text-green-700">
                      {alt.palletType}
                    </span>
                    <span className="ml-3 text-sm text-gray-600">
                      {alt.orientation} • Visina: {alt.maxHeight} cm
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">
                      {alt.utilization}%
                    </div>
                    <div className="text-sm text-green-700 font-semibold">
                      +{alt.improvement}% bolje!
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm mt-2">
                  <div>
                    <span className="text-gray-600">Po paleti:</span>
                    <span className="ml-2 font-semibold">{alt.unitsPerPallet} kom</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Raspored:</span>
                    <span className="ml-2 font-semibold">{alt.layout}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Paleta:</span>
                    <span className="ml-2 font-semibold">{alt.palletsNeeded} kom</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Korekcije Dimenzija */}
      {dimensionAdjustments && dimensionAdjustments.length > 0 && (
        <div>
          <h4 className="text-lg font-bold text-gray-800 mb-3">
            📏 Preporuke za Korekciju Dimenzija Kutija
          </h4>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
            <p className="text-sm text-blue-800">
              💡 <strong>Savет:</strong> Male izmene dimenzija kutija mogu značajno poboljšati iskorišćenost palete!
            </p>
          </div>
          <div className="space-y-3">
            {dimensionAdjustments.slice(0, 3).map((adj, idx) => (
              <div 
                key={idx}
                className="bg-white border-2 border-blue-300 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-bold text-lg text-blue-700">
                      {adj.dimension === 'length' ? 'Dužina' : adj.dimension === 'width' ? 'Širina' : 'Visina'}:
                    </span>
                    <span className="ml-2 text-gray-700">
                      {adj.originalDimension} cm → {adj.newDimension} cm
                    </span>
                    <span className={`ml-2 font-semibold ${
                      adj.adjustment.startsWith('+') ? 'text-red-600' : 'text-green-600'
                    }`}>
                      ({adj.adjustment} cm)
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      {adj.utilization}%
                    </div>
                    <div className="text-sm text-blue-700 font-semibold">
                      +{adj.improvement}% bolje!
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                  <div>
                    <span className="text-gray-600">Po paleti:</span>
                    <span className="ml-2 font-semibold">{adj.unitsPerPallet} kom</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Raspored:</span>
                    <span className="ml-2 font-semibold">{adj.layout}</span>
                  </div>
                </div>
                {parseFloat(adj.utilization) >= 99 && (
                  <div className="mt-2 text-green-700 font-semibold text-sm">
                    ⭐ Skoro savršeno slaganje!
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
