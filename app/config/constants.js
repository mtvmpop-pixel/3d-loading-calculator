// PALLET CONSTANTS
export const PALLET_BASE_HEIGHT = 15 // cm
export const HEIGHT_OPTIONS = [70, 80, 90, 100, 110, 120] // cm
export const DEFAULT_MAX_PALLET_HEIGHT = 120 // cm
export const DEFAULT_MAX_PALLET_WEIGHT = 1500 // kg

// CONTAINER CONSTANTS
export const SAFETY_GAP_DEFAULT = 2 // cm
export const SAFETY_GAP_OPTIONS = [0, 1, 2, 3, 5] // cm

// PACKAGING COMPATIBILITY RULES
export const PACKAGING_COMPATIBILITY = {
  'Kartonska kutija': ['Kartonska kutija'],
  'Drvena gajba': ['Drvena gajba'],
  'Plastična gajba': ['Plastična gajba', 'Kartonska kutija'],
  'Metalna gajba': ['Metalna gajba'],
  'Vreća': ['Vreća'],
  'Bure': ['Bure'],
  'IBC kontejner': ['IBC kontejner'],
  'Rinfuz (bulk)': ['Rinfuz (bulk)']
}

// ORIENTATION NAMES
export const ORIENTATION_NAMES = {
  'L×W×H': 'Original (Dužina × Širina × Visina)',
  'L×H×W': 'Rotacija 1 (Dužina × Visina × Širina)',
  'W×L×H': 'Rotacija 2 (Širina × Dužina × Visina)',
  'W×H×L': 'Rotacija 3 (Širina × Visina × Dužina)',
  'H×L×W': 'Rotacija 4 (Visina × Dužina × Širina)',
  'H×W×L': 'Rotacija 5 (Visina × Širina × Dužina)'
}

// CALCULATION THRESHOLDS
export const UTILIZATION_THRESHOLDS = {
  EXCELLENT: 85,
  GOOD: 70,
  ACCEPTABLE: 50,
  POOR: 30
}

// RECOMMENDATION SETTINGS
export const RECOMMENDATION_CONFIG = {
  MIN_UTILIZATION_FOR_WARNING: 70,
  MIN_LAST_CONTAINER_UTILIZATION: 50,
  MIN_WEIGHT_UTILIZATION_FOR_SUGGESTION: 50,
  MIN_VOLUME_FOR_WEIGHT_SUGGESTION: 80
}

// 3D VISUALIZATION
export const VIEWER_3D_CONFIG = {
  CAMERA_DISTANCE_MULTIPLIER: 2.5,
  GRID_SIZE: 1000,
  GRID_DIVISIONS: 20,
  PALLET_COLORS: {
    DEFAULT: 0x8B4513,
    HIGHLIGHT: 0xFF6B35
  },
  CARGO_COLORS: {
    DEFAULT: 0x4A90E2,
    HIGHLIGHT: 0x50E3C2
  },
  CONTAINER_COLOR: 0x2C3E50,
  CONTAINER_OPACITY: 0.2
}

// EXPORT ALL AS DEFAULT
export default {
  PALLET_BASE_HEIGHT,
  HEIGHT_OPTIONS,
  DEFAULT_MAX_PALLET_HEIGHT,
  DEFAULT_MAX_PALLET_WEIGHT,
  SAFETY_GAP_DEFAULT,
  SAFETY_GAP_OPTIONS,
  PACKAGING_COMPATIBILITY,
  ORIENTATION_NAMES,
  UTILIZATION_THRESHOLDS,
  RECOMMENDATION_CONFIG,
  VIEWER_3D_CONFIG
}
