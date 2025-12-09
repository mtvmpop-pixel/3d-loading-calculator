# Loading Calculator - Architecture & Logic Documentation

**Version:** 1.0 (Phase A - Basic Implementation)  
**Date:** 2025-12-09  
**Status:** Functional - Ready for Refactoring

---

## 🎯 PROJECT OVERVIEW

Multi-modal loading calculator for optimizing cargo placement in trucks and containers, with support for palletization and direct loading.

---
## 📁 CURRENT STRUCTURE

app/
- components/
  - CalculatorForm.js (Main input form)
  - PalletResults.js (Palletization results display)
  - ContainerResults.js (Container loading results)
  - AlternativeOptions.js (Alternative packing options)
  - OptimizationRecommendations.js (Optimization suggestions)
  - Container3DViewer.js (3D visualization with Three.js)

- utils/
  - binPacking3D.js (Core 3D bin-packing algorithm)
  - palletPacking.js (Palletization logic)
  - containerPacking.js (Container packing logic)
  - palletDimensions.js (Pallet type definitions)
  - containerDimensions.js (Container type definitions)
  - optimizationRecommendations.js (Optimization engine)
  - position3D.js (3D position calculator)

- page.js (Main page orchestrator)

---## 🧮 CORE ALGORITHMS

### 1. 3D Bin Packing Algorithm (binPacking3D.js)

**Type:** Greedy, Grid-Based  
**Approach:** First-Fit Decreasing (FFD)

**Logic:**
1. Test all 6 orientations for each item (or 2 for pallets)
2. Calculate how many items fit in each dimension (L, W, H)
3. Skip orientations where item doesn't fit
4. If counts are equal, prefer higher volume utilization

**Limitations:**
- Does not perform true 3D bin packing
- No weight distribution optimization
- No stability checking

**Expected Results:**
- 70-90% utilization for most cases
- 100% only in perfect-fit scenarios

---

### 2. Palletization Logic (palletPacking.js)

**Two-Step Process:**
1. Pack cargo onto pallets
2. Pack pallets into containers

**Features:**
- Tests all height options: 70, 80, 90, 100, 110, 120 cm
- Tests all cargo orientations (6 for boxes, 2 for pallets)
- Adds 15 cm pallet base height
- Calculates volume and weight utilization
- Provides top 3 alternatives

**Pallet Types Supported:**
- EUR (120×80 cm)
- Industrial (100×120, 120×120, 100×100, 80×120 cm)
- US (122×102, 122×122 cm)
- Asian (110×110, 100×100 cm)
- Custom (user-defined dimensions)

---
### 3. Container Packing (containerPacking.js)

**Two Modes:**

**A) Palletized Loading:**
- Packs pre-calculated pallets into containers
- Only 2 pallet orientations (base rotation only)
- Calculates layers and pallets per layer
- Groups cargo by type in breakdown

**B) Direct Loading:**
- Packs cargo directly without pallets
- All 6 orientations tested
- Per-cargo breakdown in each container

**Container Types:**
- 20ft Standard
- 40ft Standard
- 40ft High Cube
- Custom (user-defined)

---

### 4. Optimization Recommendations (optimizationRecommendations.js)

**Two Types of Recommendations:**

**A) Alternative Pallets:**
- Tests all pallet types (EUR, Industrial, US, Asian)
- Tests all height options (70-120 cm)
- Tests all cargo orientations
- Shows only pallets with better utilization
- Displays improvement percentage

**B) Dimension Adjustments:**
- Tests cargo dimension changes (-5 to +5 cm)
- Tests all three dimensions (length, width, height)
- Shows only adjustments with ≥95% utilization
- Displays top 5 unique recommendations

---
## 🔄 PACKAGING TYPES & ROTATION RULES

### Box (Kutija)
- **Rotations:** All 6 orientations allowed
- **Mixing:** Only with other boxes
- **Use Case:** Standard cargo

### Barrel (Burad)
- **Rotations:** None (vertical only)
- **Mixing:** Only with other barrels
- **Use Case:** Liquids, cylindrical items

### Bag (Vreća)
- **Rotations:** All 6 orientations allowed
- **Mixing:** Only with other bags
- **Use Case:** Flexible cargo

### Big Bag
- **Rotations:** Base only (2 orientations: L×W×H, W×L×H)
- **Mixing:** Only with other big bags
- **Use Case:** Bulk materials

---

## 📊 CALCULATION FLOW

1. USER INPUT
   - Cargo details (dimensions, weight, quantity, packaging type)
   - Loading method (direct or palletized)
   - If palletized: pallet type + max height/weight

2. PALLETIZATION (if selected)
   - Test all orientations for cargo
   - Test all height options
   - Calculate units per pallet
   - Calculate pallet weight
   - Select best option (or user-specified height)
   - Generate alternatives

3. CONTAINER PACKING
   - Pack pallets (or cargo) into containers
   - Calculate layers and layout
   - Calculate utilization (volume + weight)
   - Generate per-container breakdown

4. OPTIMIZATION
   - Test alternative pallets
   - Test dimension adjustments
   - Rank by utilization improvement

5. RESULTS DISPLAY
   - Summary (total pallets/containers, avg utilization)
   - Per-cargo breakdown
   - Alternative options
   - Optimization recommendations
   - 3D visualization

---
## 🎨 3D VISUALIZATION

**Technology:** Three.js

**Features:**
- Interactive camera (rotate, zoom, pan)
- Color-coded cargo types
- Pallet vs. cargo distinction
- Container wireframe
- Responsive canvas

**Current Implementation:**
- Renders all pallets/cargo in container
- Y-axis centering for proper placement
- OrbitControls for user interaction

---

## 🐛 KNOWN ISSUES & LIMITATIONS

### Algorithm:
1. Grid-based approach limits optimization potential
2. No weight distribution checking
3. No stability analysis
4. No mixed-orientation packing within same layer

### UI/UX:
1. No PDF export yet
2. No step-by-step loading instructions
3. No 2D layout view
4. No cost calculation

### Performance:
1. Optimization can be slow for many cargo types
2. 3D rendering may lag with 20+ pallets

---
## 🚀 FUTURE IMPROVEMENTS (Phase B)

### Priority 1: Optimization
- [ ] Implement true 3D bin-packing algorithm
- [ ] Add weight distribution optimization
- [ ] Add stability checking
- [ ] Add AI/ML-based optimization

### Priority 2: Features
- [ ] PDF export (results + loading instructions)
- [ ] Step-by-step loading guide
- [ ] Cost calculation
- [ ] Multi-vehicle comparison

### Priority 3: Architecture
- [ ] Refactor to modular structure (services, core, config)
- [ ] Add validation layer
- [ ] Add error handling
- [ ] Add unit tests

### Priority 4: UI/UX
- [ ] Improve 3D visualization (labels, measurements)
- [ ] Add 2D layout view
- [ ] Add print-friendly views
- [ ] Add save/load functionality

---

## 📝 TECHNICAL NOTES

### Key Files:

**binPacking3D.js**
- findBestOrientation(): Core algorithm, tests orientations and returns best fit
- isPallet parameter: Restricts to 2 orientations for pallets

**palletPacking.js**
- calculatePalletization(): Main palletization function
- Supports custom pallets via dimension extraction

**containerPacking.js**
- packPalletsInContainer(): Packs pallets into containers
- packCargoDirectly(): Direct loading without pallets

**optimizationRecommendations.js**
- generateOptimizationRecommendations(): Generates all recommendations
- Tests all pallet types and dimension adjustments

---
## 🔧 CONFIGURATION

### Height Options:
[70, 80, 90, 100, 110, 120] cm

### Pallet Base Height:
15 cm (EUR standard)

### Adjustment Range:
[-5, -4, -3, -2, -1, +1, +2, +3, +4, +5] cm

### Utilization Threshold (for recommendations):
≥95%

---

## 📚 DEPENDENCIES

- Next.js 14+
- React 18+
- Three.js (3D visualization)
- Tailwind CSS (styling)

---

## 🎯 SUCCESS METRICS

### Phase A (Current):
- ✅ Functional palletization
- ✅ Functional container packing
- ✅ 3D visualization working
- ✅ Optimization recommendations
- ✅ 70-90% utilization for most cases

### Phase B (Target):
- 🎯 80-95% utilization consistently
- 🎯 PDF export functional
- 🎯 Step-by-step guide
- 🎯 Modular architecture

---

## 📋 NEXT STEPS

See PHASE_B_PLAN.md for detailed refactoring plan.

---

**End of Documentation**
