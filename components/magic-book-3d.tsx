'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls } from '@react-three/drei'
import { Suspense, useRef, useEffect } from 'react'
import * as THREE from 'three'

function Book() {
  const { scene } = useGLTF('/flying_magic_book/scene.gltf')
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
          toneMappingExposure: 1
        }} 
        style={{ background: 'transparent' }}
        camera={{ position: [0, 0, 35], fov: 30 }}
      >
        <Suspense fallback={null}>
          <OrbitControls 
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            minDistance={20}
            maxDistance={50}
            target={[0, 0, 0]}
          />
          <ambientLight intensity={1.2} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} />
          <pointLight position={[-5, 3, -5]} intensity={0.8} color="#8b5cf6" />
          <pointLight position={[5, -3, 5]} intensity={0.8} color="#ec4899" />
          <Book />
        </Suspense>
      </Canvas>
    </div>
  )
}
