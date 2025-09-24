import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import { Mesh } from 'three';
import { Loader2 } from 'lucide-react';

interface Model3DProps {
  url: string;
  fileType: 'obj' | 'gltf' | 'usdz';
}

function Model3D({ url, fileType }: Model3DProps) {
  const meshRef = useRef<Mesh>(null);
  const [error, setError] = useState(false);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  try {
    if (fileType === 'gltf') {
      const { scene } = useGLTF(url);
      return <primitive ref={meshRef} object={scene} scale={[2, 2, 2]} />;
    }
    
    // For other formats, show a placeholder with loading animation
    return (
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff4d6d" transparent opacity={0.8} />
      </mesh>
    );
  } catch (error) {
    console.error('Error loading 3D model:', error);
    setError(true);
    return (
      <Html center>
        <div className="text-destructive text-sm">Erro ao carregar modelo 3D</div>
      </Html>
    );
  }
}

interface Model3DViewerProps {
  modelUrl: string;
  fileType: 'obj' | 'gltf' | 'usdz';
  className?: string;
}

export function Model3DViewer({ modelUrl, fileType, className }: Model3DViewerProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm rounded-xl z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando modelo 3D...</p>
          </div>
        </div>
      )}
      
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        onCreated={() => setIsLoading(false)}
        className="rounded-xl"
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        <Model3D url={modelUrl} fileType={fileType} />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
        />
      </Canvas>
      
      <div className="absolute bottom-2 right-2 bg-primary/80 backdrop-blur-sm rounded-full px-3 py-1">
        <p className="text-xs text-primary-foreground font-medium">🔄 Clique e arraste para rotacionar</p>
      </div>
    </div>
  );
}