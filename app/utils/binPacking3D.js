export function findBestOrientation(itemL, itemW, itemH, containerL, containerW, containerH, isPallet = false) {
  // Ako je paleta, testiramo samo 2 orijentacije (rotacija po osnovi)
  // Ako je kutija, testiramo svih 6 orijentacija
  const orientations = isPallet ? [
    { l: itemL, w: itemW, h: itemH, name: 'Original (L×W×H)' },
    { l: itemW, w: itemL, h: itemH, name: 'Rotacija 90° (W×L×H)' },
  ] : [
    { l: itemL, w: itemW, h: itemH, name: 'Original (L×W×H)' },
    { l: itemL, w: itemH, h: itemW, name: 'Rotacija 1 (L×H×W)' },
    { l: itemW, w: itemL, h: itemH, name: 'Rotacija 2 (W×L×H)' },
    { l: itemW, w: itemH, h: itemL, name: 'Rotacija 3 (W×H×L)' },
    { l: itemH, w: itemL, h: itemW, name: 'Rotacija 4 (H×L×W)' },
    { l: itemH, w: itemW, h: itemL, name: 'Rotacija 5 (H×W×L)' },
  ]

  let bestOrientation = null
  let maxUnits = 0

  orientations.forEach(orientation => {
    // PROVERA: Da li stane u kontejner u ovoj orijentaciji?
    if (orientation.l > containerL || orientation.w > containerW || orientation.h > containerH) {
      return // Preskoči ovu orijentaciju
    }

    const unitsL = Math.floor(containerL / orientation.l)
    const unitsW = Math.floor(containerW / orientation.w)
    const unitsH = Math.floor(containerH / orientation.h)
    const totalUnits = unitsL * unitsW * unitsH

    // Ako je isti broj kutija, bira onu sa boljom iskorišćenošću
    if (totalUnits > maxUnits || 
        (totalUnits === maxUnits && bestOrientation && 
         (orientation.l * orientation.w * orientation.h) > 
         (bestOrientation.l * bestOrientation.w * bestOrientation.h))) {
      maxUnits = totalUnits
      bestOrientation = { 
        ...orientation, 
        unitsL, 
        unitsW, 
        unitsH, 
        totalUnits 
      }
    }
  })

  return bestOrientation
}

export function calculateVolume(length, width, height) {
  return length * width * height
}

export function calculateUtilization(usedVolume, totalVolume) {
  return (usedVolume / totalVolume) * 100
}
