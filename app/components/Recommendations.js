'use client'

export default function Recommendations({ recommendations }) {
  if (!recommendations || recommendations.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        💡 Preporuke Za Optimizaciju
      </h2>
      
      <ul className="space-y-3">
        {recommendations.map((rec, index) => (
          <li key={index} className="flex items-start bg-blue-50 p-4 rounded-lg">
            <span className="text-blue-600 mr-3 text-xl">•</span>
            <span className="text-blue-800">{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
