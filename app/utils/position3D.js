export function generateItemPositions(orientation, quantity, itemDimensions, safetyGap = 0) {
  const items = []
  
  const itemL = orientation.l
  const itemW = orientation.w
  const itemH = orientation.h

  let index = 0
  
  // Izračunaj ukupne dimenzije
  const totalLength = orientation.unitsL * itemL
  const totalWidth = orientation.unitsW * itemW
  
  for (let z = 0; z < orientation.unitsH && index < quantity; z++) {
    for (let y = 0; y < orientation.unitsW && index < quantity; y++) {
      for (let x = 0; x < orientation.unitsL && index < quantity; x++) {
        items.push({
          length: itemL,
          width: itemW,
          height: itemH,
          x: (x * itemL) - (totalLength / 2) + (itemL / 2),
          y: z * itemH,
          z: (y * itemW) - (totalWidth / 2) + (itemW / 2),
          index: index
        })
        index++
      }
    }
  }

  return items
}

export function generatePalletPositions(palletResults, bestOrientation, maxPalletsPerContainer) {
  const items = []
  
  if (!palletResults || palletResults.length === 0) return items
  
  // KORISTI DIMENZIJE IZ BEST ORIENTATION
  const palletLength = bestOrientation.l
  const palletWidth = bestOrientation.w
  const palletHeight = bestOrientation.h
  
  // Broj paleta po redovima
  const palletsPerRow = bestOrientation.unitsL || 1
  const palletsPerCol = bestOrientation.unitsW || 1
  
  // Ukupne dimenzije svih paleta
  const totalLength = palletsPerRow * palletLength
  const totalWidth = palletsPerCol * palletWidth
  
  // Offset za centriranje
  const offsetX = -totalLength / 2
  const offsetZ = -totalWidth / 2
  
  let palletIndex = 0
  
  palletResults.forEach((result, cargoIndex) => {
    const palletsToPlace = Math.min(result.palletsNeeded, maxPalletsPerContainer)
    
    for (let i = 0; i < palletsToPlace; i++) {
      const row = Math.floor(palletIndex / palletsPerRow)
      const col = palletIndex % palletsPerRow
      
      const x = offsetX + (col * palletLength) + (palletLength / 2)
      const z = offsetZ + (row * palletWidth) + (palletWidth / 2)
      
      items.push({
        length: palletLength,
        width: palletWidth,
        height: palletHeight,
        x: x,
        y: 0,  // NA PODU
        z: z,
        cargoIndex: cargoIndex,
        cargoName: result.cargoName
      })
      
      palletIndex++
    }
  })

  return items
}
