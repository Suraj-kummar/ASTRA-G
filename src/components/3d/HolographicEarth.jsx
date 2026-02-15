import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, OrbitControls } from '@react-three/drei';

const Hologram = () => {
    const ref = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        ref.current.rotation.y = t * 0.1; // Slow spin
        ref.current.rotation.x = t * 0.05;
    });

    return (
        <group scale={2.4}>
            {/* Core Wireframe Sphere */}
            <Sphere ref={ref} args={[1, 32, 32]}>
                <meshPhongMaterial
                    color="#00f3ff"
                    emissive="#050505"
                    wireframe
                    transparent
                    opacity={0.15}
                />
            </Sphere>

            {/* Inner Glitch Core */}
            <Sphere args={[0.8, 16, 16]}>
                <MeshDistortMaterial
                    color="#bc13fe"
                    speed={2}
                    distort={0.4}
                    transparent
                    opacity={0.2}
                    wireframe
                />
            </Sphere>

            {/* Scanning Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[1.6, 0.02, 16, 100]} />
                <meshBasicMaterial color="#00f3ff" transparent opacity={0.3} />
            </mesh>
        </group>
    );
};

const HolographicEarth = () => {
    return (
        <div className="w-full h-full absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00f3ff" />
                <Hologram />
                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
};

export default HolographicEarth;
