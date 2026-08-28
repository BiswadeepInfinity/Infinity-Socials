'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollRevealProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Select all scroll-reveal elements
    const elements = document.querySelectorAll<HTMLElement>('.scroll-reveal, .scroll-reveal-card, .scroll-reveal-hero');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            // Optional: unobserve once revealed so it doesn't re-trigger unnecessarily
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    elements.forEach((el) => {
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return <>{children}</>;
}
