'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import { Suspense, useRef, useEffect } from 'react'
import * as THREE from 'three'

function Book() {
  const { scene } = useGLTF('/steampunk_book/scene.gltf')
  const bookRef = useRef<THREE.Group>(null)
  
  useEffect(() => {
    if (scene) {
      // Clone the scene to avoid issues with reusing the same object
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })
    }
  }, [scene])
  
  useFrame((state) => {
    if (bookRef.current) {
      // Gentle floating animation
      bookRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
      // Slow rotation
      bookRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })
  
  return (
    <primitive 
      ref={bookRef}
      object={scene} 
      scale={0.35}
      position={[0, 0, 0]}
      rotation={[Math.PI * 0.1, 0, 0.2]}
    />
  )
}

export function MagicBook3D() {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas 
        gl={{ 
          alpha: true, 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }} 
        style={{ background: 'transparent' }}
        camera={{ position: [0, 0, 8], fov: 35 }}
      >
        <Suspense fallback={null}>
          <OrbitControls 
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={12}
            maxDistance={15}
            target={[0, 0, 0]}
          />
          {/* Enhanced ambient lighting */}
          <ambientLight intensity={1.5} />
          
          {/* Main directional lights */}
          <directionalLight position={[10, 10, 5]} intensity={2} castShadow />
          <directionalLight position={[-10, -10, -5]} intensity={0.8} />
          
          {/* Accent point lights for magical effect */}
          <pointLight position={[-5, 3, -5]} intensity={1.2} color="#8b5cf6" />
          <pointLight position={[5, -3, 5]} intensity={1.2} color="#ec4899" />
          <pointLight position={[0, 5, 3]} intensity={1} color="#fbbf24" />
          
          {/* Spotlight for dramatic effect */}
          <spotLight 
            position={[0, 8, 0]} 
            intensity={1.5} 
            angle={0.6} 
            penumbra={0.5}
            castShadow
          />
          
          <Book />
        </Suspense>
      </Canvas>
    </div>
  )
}
