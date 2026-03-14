'use client';

import { useEffect, useState } from 'react';

/**
 * Ambient background dengan floating particles dan gradient shift.
 * Ringan karena menggunakan CSS animation, bukan canvas.
 */
export default function AmbientBackground() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate particles only on the client side to avoid hydration mismatch
    const newParticles = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 8}s`,
      animationDuration: `${6 + Math.random() * 8}s`,
      width: `${1 + Math.random() * 2}px`,
      height: `${1 + Math.random() * 2}px`,
      opacity: 0.15 + Math.random() * 0.25,
    }));
    setParticles(newParticles);
    setMounted(true);
  }, []);

  return (
    <div className="ambient-bg" aria-hidden="true">
      {/* Gradient orbs - ambient glow */}
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />
      <div className="ambient-orb ambient-orb-3" />

      {/* Floating particles - render only when mounted on client */}
      {mounted && particles.map((style, i) => (
        <div
          key={i}
          className="ambient-particle"
          style={style}
        />
      ))}
    </div>
  );
}
