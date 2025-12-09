export default function AlternativeOptions({ alternatives, cargoName }) {
  if (!alternatives || alternatives.length === 0) return null

  return (
    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-yellow-800 mb-4">
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
                <span className="ml-3 text-gray-600">
                  Visina: {alt.maxHeight} cm
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
            
            {alt.rank === 1 && (
              <div className="mt-2 text-green-700 font-semibold text-sm">
                ⭐ Najbolja opcija - Preporučujemo!
              </div>
            )}
          </div>
        ))}
      </div>
      
      {alternatives[0].utilization > parseFloat(alternatives[0].utilization) + 10 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
          💡 <strong>Preporuka:</strong> Promena orijentacije može povećati iskorišćenost za{' '}
          {(parseFloat(alternatives[0].utilization) - parseFloat(alternatives[alternatives.length - 1].utilization)).toFixed(1)}%
        </div>
      )}
    </div>
  )
}
