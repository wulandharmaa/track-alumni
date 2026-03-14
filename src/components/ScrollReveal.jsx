'use client';

import { useEffect, useRef } from 'react';

/**
 * Wrapper component yang menambahkan scroll-triggered reveal animation.
 * Menggunakan Intersection Observer API untuk performa optimal.
 */
export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up', // up, left, right, scale
  threshold = 0.15,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Terapkan delay lalu tambahkan class revealed
          setTimeout(() => {
            el.classList.add('revealed');
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  const directionClass = `reveal-${direction}`;

  return (
    <div ref={ref} className={`reveal-base ${directionClass} ${className}`}>
      {children}
    </div>
  );
}
