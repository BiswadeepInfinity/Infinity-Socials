'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { fetchAllUserReviews, FormattedReviewItem, FALLBACK_EDITORIAL_REVIEWS } from '@/lib/fetchReviews';

export default function HeroSection() {
  const [reviews, setReviews] = useState<FormattedReviewItem[]>(FALLBACK_EDITORIAL_REVIEWS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [deckOffset, setDeckOffset] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(false);

  useEffect(() => {
    fetchAllUserReviews().then((items) => {
      if (items && items.length > 0) {
        setReviews(items);
      }
    });
  }, []);

  useEffect(() => {
    if (reviews.length === 0) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % reviews.length;
        if (next > 2) setDeckOffset(next - 2);
        else setDeckOffset(0);
        return next;
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  // Idle timer for scroll hint
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    const resetIdleTimer = () => {
      setShowScrollHint(false);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (window.scrollY < 100) {
          setShowScrollHint(true);
        }
      }, 5000);
    };

    const handleScroll = () => {
      setShowScrollHint(false);
      clearTimeout(idleTimer);
    };

    window.addEventListener('mousemove', resetIdleTimer, { passive: true });
    window.addEventListener('keydown', resetIdleTimer, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    idleTimer = setTimeout(() => {
      if (window.scrollY < 100) setShowScrollHint(true);
    }, 5000);

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const current = reviews[activeIndex] || reviews[0] || FALLBACK_EDITORIAL_REVIEWS[0];

  const scrollToWindow = () => {
    const el = document.getElementById('featured-articles-window');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full h-[620px] xs:h-[680px] sm:h-[750px] lg:h-[820px] overflow-hidden flex flex-col justify-center select-none bg-[#030305]">
      {/* Dynamic Full-Bleed Background Images with Cross-Dissolve */}
      {reviews.map((item, idx) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out pointer-events-none ${
            idx === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover object-center filter brightness-[0.4] contrast-[1.15]"
          />
          {/* Cinematic Vignette Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#030305] via-[#030305]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-[#030305]/80 to-[#030305]/60" />
        </div>
      ))}

      {/* Main Hero Stage - Stacked on Mobile, 2-Column on Desktop */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-8 lg:gap-14 items-center">
        
        {/* Left Column: Headline & Action Stage */}
        <div className="flex flex-col items-start text-left">
          
          {/* Category Tag */}
          <div className="mb-3.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/[0.08] border border-white/20 text-zinc-100 font-mono text-[10px] sm:text-xs uppercase tracking-wider font-semibold backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
              {current.category} Review
            </span>
          </div>

          {/* Headline */}
          <div className="min-h-0 sm:min-h-[85px] lg:min-h-[105px] flex items-center mb-3 sm:mb-4">
            <h1 className="font-display text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.18] tracking-tight m-0 drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
              {current.title}
            </h1>
          </div>

          {/* Subtitle */}
          <div className="min-h-0 sm:min-h-[44px] lg:min-h-[48px] flex items-center mb-6 sm:mb-8">
            <p className="text-xs xs:text-sm lg:text-base font-light text-white/75 leading-relaxed m-0 max-w-xl line-clamp-3 sm:line-clamp-none">
              {current.deck}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap mb-6 sm:mb-7 w-full sm:w-auto">
            <Link
              href={current.link}
              className="btn-editorial-primary flex-1 sm:flex-initial justify-center px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white no-underline text-center shadow-lg"
            >
              <span>Read Full Story</span>
              <span>→</span>
            </Link>

            <button
              onClick={scrollToWindow}
              className="btn-editorial-glass hidden sm:inline-flex px-5 sm:px-6 py-3 text-xs sm:text-sm font-semibold"
            >
              <span>Explore Featured Deck</span>
              <span>↓</span>
            </button>
          </div>

          {/* Slide Indicator Bars */}
          <div className="flex items-center gap-2 h-4">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveIndex(idx);
                  if (idx > 2) setDeckOffset(idx - 2);
                  else setDeckOffset(0);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === activeIndex
                    ? 'w-8 sm:w-9 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]'
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>

        {/* Right Column: Clean Aligned Story Deck (Desktop & Tablet) */}
        <div className="relative hidden md:flex items-center justify-end w-full py-4">
          
          <div className="w-full max-w-[430px] flex flex-col gap-3">
            
            {/* Header Tag */}
            <div className="flex items-center justify-between px-1 pb-1 font-mono text-[11px] text-white/50">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
                <span className="font-semibold text-white/90 uppercase tracking-wider text-[10px]">
                  Story Deck
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-white font-semibold">0{activeIndex + 1} / 0{reviews.length}</span>
                {/* Arrow Controls inline with Deck header */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const newIdx = (activeIndex - 1 + reviews.length) % reviews.length;
                      setActiveIndex(newIdx);
                      setDeckOffset(Math.max(0, Math.min(newIdx, reviews.length - 3)));
                    }}
                    aria-label="Previous Story"
                    className="w-6 h-6 rounded-full bg-white/[0.08] hover:bg-white/[0.2] border border-white/20 text-white flex items-center justify-center text-xs transition-all active:scale-95 cursor-pointer"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => {
                      const newIdx = (activeIndex + 1) % reviews.length;
                      setActiveIndex(newIdx);
                      setDeckOffset(Math.max(0, Math.min(newIdx, reviews.length - 3)));
                    }}
                    aria-label="Next Story"
                    className="w-6 h-6 rounded-full bg-white/[0.08] hover:bg-white/[0.2] border border-white/20 text-white flex items-center justify-center text-xs transition-all active:scale-95 cursor-pointer"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>

            {/* Display Top 3 Visible Cards */}
            {reviews.slice(deckOffset, deckOffset + 3).map((item, localIdx) => {
              const globalIdx = deckOffset + localIdx;
              const isActive = globalIdx === activeIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveIndex(globalIdx)}
                  className={`p-3.5 sm:p-4 rounded-[18px] border backdrop-blur-xl transition-all duration-300 cursor-pointer flex items-center gap-3.5 select-none ${
                    isActive
                      ? 'bg-gradient-to-r from-white/[0.12] to-white/[0.04] border-white/30 shadow-[0_16px_36px_rgba(0,0,0,0.6)] ring-1 ring-white/20'
                      : 'bg-[#0b0b12]/80 border-white/[0.08] hover:border-white/20 hover:bg-[#0f0f18]/90 shadow-[0_8px_20px_rgba(0,0,0,0.35)] opacity-75 hover:opacity-100'
                  }`}
                >
                  {/* Thumbnail Cover */}
                  <div className="w-[52px] h-[52px] rounded-xl overflow-hidden shrink-0 bg-black/60 border border-white/15 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`font-mono text-[9px] font-bold uppercase tracking-wider ${
                        isActive ? 'text-zinc-200' : 'text-white/50'
                      }`}>
                        {item.category}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-amber-400 shrink-0">
                        ★ {item.score}
                      </span>
                    </div>

                    <h4 className="font-display text-[13px] font-semibold text-white leading-snug m-0 line-clamp-2">
                      {item.title}
                    </h4>
                  </div>
                </div>
              );
            })}

          </div>
        </div>

      </div>

      {/* Floating Idle Scroll Hint */}
      <div
        onClick={scrollToWindow}
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a0a10]/90 border border-white/20 backdrop-blur-xl text-white shadow-[0_10px_30px_rgba(0,0,0,0.8)] cursor-pointer transition-all duration-500 select-none ${
          showScrollHint ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <span className="font-mono text-[10px] text-white/80 font-medium tracking-wide uppercase">
          Scroll to explore
        </span>
        <span className="text-white text-xs animate-bounce">↓</span>
      </div>

    </section>
  );
}
