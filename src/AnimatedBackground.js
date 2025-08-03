// src/AnimatedBackground.js
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import FOG from 'vanta/dist/vanta.fog.min'; // Import FOG instead of NET

const AnimatedBackground = () => {
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(FOG({
        el: vantaRef.current,
        THREE: THREE, // Pass THREE.js to Vanta
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        highlightColor: 0x9333ea, // Purple
        midtoneColor: 0x6b21a8,   // Deeper Purple
        lowlightColor: 0x4f46e5,  // Indigo
        baseColor: 0x111827,      // Dark Gray/Black
        blurFactor: 0.50,
        speed: 1.20,
        zoom: 0.80
      }));
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <div
      ref={vantaRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0
      }}
    />
  );
};

export default AnimatedBackground;