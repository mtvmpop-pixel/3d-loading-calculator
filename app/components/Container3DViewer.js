'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default function Container3DViewer({ 
  containerDimensions, 
  items,
  showPallets = false 
}) {
  const mountRef = useRef(null)

  useEffect(() => {
    if (!mountRef.current || !containerDimensions || !items || items.length === 0) return

    // Clear any existing content
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild)
    }

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf0f4f8)

    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      1,
      10000
    )
    
    const maxDim = Math.max(containerDimensions.length, containerDimensions.width, containerDimensions.height)
    camera.position.set(maxDim * 1.5, maxDim * 1.2, maxDim * 1.5)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    mountRef.current.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(100, 200, 100)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    const containerGeometry = new THREE.BoxGeometry(
      containerDimensions.length,
      containerDimensions.height,
      containerDimensions.width
    )
    const containerEdges = new THREE.EdgesGeometry(containerGeometry)
    const containerLine = new THREE.LineSegments(
      containerEdges,
      new THREE.LineBasicMaterial({ color: 0x2563eb, linewidth: 2 })
    )
    containerLine.position.set(0, containerDimensions.height / 2, 0)
    scene.add(containerLine)

    const gridHelper = new THREE.GridHelper(
      Math.max(containerDimensions.length, containerDimensions.width) * 1.5,
      20,
      0xcccccc,
      0xeeeeee
    )
    scene.add(gridHelper)

    const colors = [
      0x3b82f6,
      0x10b981,
      0xf59e0b,
      0xef4444,
      0x8b5cf6,
      0xec4899,
    ]

        items.forEach((item, index) => {
      // Za palete: različita boja po tipu tereta
      // Za direktan teret: svi iste boje
      const colorIndex = item.cargoIndex !== undefined ? item.cargoIndex : 0
      const color = colors[colorIndex % colors.length]

      
      const geometry = new THREE.BoxGeometry(item.length, item.height, item.width)
      
      const material = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: showPallets ? 0.7 : 0.85,
        roughness: showPallets ? 0.3 : 0.5,
        metalness: showPallets ? 0.2 : 0.1
      })
      const mesh = new THREE.Mesh(geometry, material)
      
      mesh.position.set(
        item.x || 0,
        (item.y || 0) + (item.height / 2),  // Dodaj height/2 jer Three.js pozicionira od centra
        item.z || 0
      )

      
      mesh.castShadow = true
      mesh.receiveShadow = true
      scene.add(mesh)

      const edges = new THREE.EdgesGeometry(geometry)
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ 
          color: showPallets ? 0x1e40af : 0x000000, 
          linewidth: showPallets ? 2 : 1 
        })
      )
      line.position.copy(mesh.position)
      scene.add(line)
    })

    let animationId
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!mountRef.current) return
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      
      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose()
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose())
          } else {
            object.material.dispose()
          }
        }
      })
      
      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement)
      }
      
      renderer.dispose()
      controls.dispose()
    }
  }, [containerDimensions, JSON.stringify(items), showPallets])

  const handleResetView = () => {
    // Reset će se desiti kroz re-render
    if (mountRef.current) {
      const event = new Event('resize')
      window.dispatchEvent(event)
    }
  }

  if (!containerDimensions) {
    return (
      <div className="bg-gray-100 rounded-2xl p-8 text-center">
        <p className="text-gray-500">Izračunaj utovar da vidiš 3D prikaz</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 mt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            📦 3D Prikaz Utovara
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {showPallets ? '📋 Prikaz: Palete u kontejneru' : '📦 Prikaz: Direktan teret u kontejneru'}
          </p>
        </div>
        <button
          onClick={handleResetView}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          🔄 Reset View
        </button>
      </div>

      <div 
        ref={mountRef} 
        className="w-full h-[600px] bg-gray-50 rounded-lg border-2 border-gray-200"
      />

      <div className="mt-4 text-sm text-gray-600 text-center">
        💡 Koristi miš za rotaciju, zoom i pomeranje prikaza
      </div>
    </div>
  )
}
