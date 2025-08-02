// src/AnimatedBackground.js

import React, { useState, useEffect, useRef } from 'react';

// Make sure the VANTA object is available from the scripts we added
const VANTA = window.VANTA;

const AnimatedBackground = () => {
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  useEffect(() => {
    if (!vantaEffect && VANTA) {
      setVantaEffect(VANTA.NET({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x9333ea,      // Purple
        backgroundColor: 0x111827, // gray-900
        points: 10.00,
        maxDistance: 22.00,
        spacing: 18.00
      }));
    }
    // Cleanup function to destroy the effect when the component unmounts
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