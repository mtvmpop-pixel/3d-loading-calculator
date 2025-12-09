export default function DirectPackingAlternatives({ alternatives, cargoName }) {
  if (!alternatives || alternatives.length === 0) return null

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mt-4">
      <h3 className="text-xl font-bold text-blue-800 mb-4">
        💡 Alternativne Opcije za {cargoName}
      </h3>
      
      <div className="space-y-3">
        {alternatives.map((alt) => (
          <div 
            key={`${alt.rank}-${alt.orientation}`}
            className={`p-4 rounded-lg border-2 ${
              alt.rank === 1 
                ? 'bg-green-100 border-green-300' 
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-lg">
                  #{alt.rank} - {alt.orientation}
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {alt.utilization}%
                </div>
                <div className="text-sm text-gray-500">
                  iskorišćenost
                </div>
              </div>
            </div>
            
            <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Po kontejneru:</span>
                <span className="ml-2 font-semibold">{alt.maxUnitsPerContainer} kom</span>
              </div>
              <div>
                <span className="text-gray-600">Raspored:</span>
                <span className="ml-2 font-semibold">{alt.layout}</span>
              </div>
              <div>
                <span className="text-gray-600">Kontejnera:</span>
                <span className="ml-2 font-semibold">{alt.containersNeeded} kom</span>
              </div>
            </div>
            
            {alt.rank === 1 && (
              <div className="mt-2 text-green-700 font-semibold text-sm">
                ⭐ Najbolja opcija - Maksimalna iskorišćenost!
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
