'use client';

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

interface BoxData {
  id: number;
  position: [number, number, number];
}

const DraggableBox: React.FC<{
  position: [number, number, number];
  onRemove: () => void;
}> = ({ position, onRemove }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <group position={position}>
      <mesh
        position={[0, 0.5, 0]}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={isHovered ? 'orange' : 'blue'} />
      </mesh>
      {isHovered && (
        <Html position={[0, 1.5, 0]} center>
          <button
            onClick={onRemove}
            className="bg-red-600 text-white px-2 py-1 rounded text-sm shadow"
          >
            Sil
          </button>
        </Html>
      )}
    </group>
  );
};

const WarehouseScene: React.FC = () => {
  const [boxes, setBoxes] = useState<BoxData[]>([]);

  const addContainer = () => {
    const newId = boxes.length ? boxes[boxes.length - 1].id + 1 : 1;
    const newBox: BoxData = {
      id: newId,
      position: [
        Math.random() * 10 - 5,
        0,
        Math.random() * 10 - 5
      ],
    };
    setBoxes([...boxes, newBox]);
  };

  const removeBox = (id: number) => {
    setBoxes(boxes.filter(box => box.id !== id));
  };

  return (
    <div className="h-screen w-full relative">
      <button
        onClick={addContainer}
        className="absolute top-4 left-4 z-10 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
      >
        Konteyner Ekle
      </button>

      <Canvas
        shadows
        camera={{ position: [10, 10, 10], fov: 50 }}
        style={{ background: '#f0f0f0' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 10, 7.5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <OrbitControls />

        {/* Zemin */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <shadowMaterial opacity={0.3} />
        </mesh>

        {/* Konteynerler */}
        {boxes.map(box => (
          <DraggableBox
            key={box.id}
            position={box.position}
            onRemove={() => removeBox(box.id)}
          />
        ))}
      </Canvas>
    </div>
  );
};

export default WarehouseScene;
