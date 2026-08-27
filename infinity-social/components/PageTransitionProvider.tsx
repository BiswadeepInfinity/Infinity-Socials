'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import ButterflyLoader from '@/components/ButterflyLoader';

export default function PageTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // When pathname or searchParams change, smoothly flash the butterfly transition overlay
  useEffect(() => {
    setIsTransitioning(false);
  }, [pathname, searchParams]);

  // Intercept click on internal navigation links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Only trigger for internal links that differ from current location
      if (
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !href.startsWith('/#') &&
        !target.hasAttribute('download') &&
        target.getAttribute('target') !== '_blank'
      ) {
        const url = new URL(href, window.location.origin);
        if (url.pathname !== window.location.pathname || url.search !== window.location.search) {
          setIsTransitioning(true);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleAnchorClick, { capture: true });
    };
  }, []);

  return (
    <>
      {/* Fullscreen Butterfly Brand Page Transition Overlay */}
      <div
        className={`fixed inset-0 z-[9999] bg-[#030305] flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
          isTransitioning ? 'opacity-100 pointer-events-auto' : 'opacity-0'
        }`}
        style={{
          transitionProperty: 'opacity',
          transitionDuration: isTransitioning ? '150ms' : '300ms',
        }}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <ButterflyLoader size="xl" text="INFINITY SOCIAL" />
        </div>
      </div>

      {children}
    </>
  );
}
