'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const HERO_FEATURED = [
  {
    category: 'Exclusive Cover Story',
    title: 'The Brutal Masterpiece of Shadow of the Erdtree',
    subtitle: 'Inside FromSoftware’s quest to redefine action RPG difficulty, density, and mythic storytelling in modern gaming.',
    rating: '9.8',
    readTime: '8 MIN',
    slug: 'elden-ring-shadow-erdtree-review',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80',
    bgImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=85',
  },
  {
    category: 'Anime Analysis',
    title: 'Demon Slayer: Why Hashira Training Redefined Shonen',
    subtitle: 'Ufotable transforms quiet character arcs into a sakuga animation spectacle of historic scale.',
    rating: '9.4',
    readTime: '6 MIN',
    slug: 'demon-slayer-hashira-training',
    thumbnail: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&q=80',
    bgImage: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=1600&q=85',
  },
  {
    category: 'Special Report',
    title: 'GTA VI: The Tech Engineering Behind Vice City 2026',
    subtitle: 'From dual-protagonist narrative mechanics to advanced AI crowd simulation in the biggest launch in history.',
    rating: '10/10',
    readTime: '12 MIN',
    slug: 'gta-6-everything-we-know',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80',
    bgImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&q=85',
  },
  {
    category: 'AAA Gaming Debut',
    title: 'Black Myth: Wukong & the Rise of Global Chinese Studios',
    subtitle: 'Unreal Engine 5 mythology and deep martial combat set a new global benchmark.',
    rating: '9.0',
    readTime: '10 MIN',
    slug: 'black-myth-wukong-review',
    thumbnail: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600&q=80',
    bgImage: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1600&q=85',
  },
  {
    category: 'Live-Action Special',
    title: 'One Piece Season 2: Capturing the Perils of the Grand Line',
    subtitle: 'Exclusive showrunner interview on casting Chopper and scaling Baroque Works.',
    rating: '8.8',
    readTime: '7 MIN',
    slug: 'one-piece-live-action-season-2',
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80',
    bgImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1600&q=85',
  },
  {
    category: 'Survival Horror',
    title: 'Silent Hill 2 Remake: Atmospheric Psychological Terror Reborn',
    subtitle: 'Bloober Team delivers a faithful, fog-drenched modernization of the legendary classic.',
    rating: '9.2',
    readTime: '9 MIN',
    slug: 'silent-hill-2-remake',
    thumbnail: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=600&q=80',
    bgImage: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=1600&q=85',
  },
];

export default function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [deckOffset, setDeckOffset] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % HERO_FEATURED.length;
        setDeckOffset(Math.max(0, Math.min(next, HERO_FEATURED.length - 3)));
        return next;
      });
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // Idle Scroll Hint: Only appear if user stays idle for >3.5s at the top of the page
  useEffect(() => {
    const idleTimer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.scrollY < 30) {
        setShowScrollHint(true);
      }
    }, 3500);

    const handleDismiss = () => {
      setShowScrollHint(false);
    };

    window.addEventListener('scroll', handleDismiss, { passive: true });
    window.addEventListener('touchstart', handleDismiss, { passive: true });
    window.addEventListener('wheel', handleDismiss, { passive: true });

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('scroll', handleDismiss);
      window.removeEventListener('touchstart', handleDismiss);
      window.removeEventListener('wheel', handleDismiss);
    };
  }, []);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Detect horizontal swipe if deltaX is greater than vertical deltaY
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Swiped Left -> Next Story
        setActiveIndex((prev) => {
          const next = (prev + 1) % HERO_FEATURED.length;
          setDeckOffset(Math.max(0, Math.min(next, HERO_FEATURED.length - 3)));
          return next;
        });
      } else {
        // Swiped Right -> Previous Story
        setActiveIndex((prev) => {
          const prevIdx = (prev - 1 + HERO_FEATURED.length) % HERO_FEATURED.length;
          setDeckOffset(Math.max(0, Math.min(prevIdx, HERO_FEATURED.length - 3)));
          return prevIdx;
        });
      }
    }
  };

  const current = HERO_FEATURED[activeIndex];

  const scrollToWindow = () => {
    const target = document.getElementById('featured-articles-window');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeckWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 20) {
      setDeckOffset((prev) => Math.min(prev + 1, HERO_FEATURED.length - 3));
    } else if (e.deltaY < -20) {
      setDeckOffset((prev) => Math.max(prev - 1, 0));
    }
  };

  return (
    <section
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full min-h-0 sm:min-h-[480px] lg:h-[calc(100vh-72px)] bg-[#030305] flex flex-col justify-between items-center overflow-hidden select-none pt-4 pb-5 sm:py-6 lg:py-4 touch-pan-y"
    >
      
      {/* Background Photography */}
      {HERO_FEATURED.map((item, idx) => (
        <div
          key={item.title}
          className={`absolute inset-0 pointer-events-none transition-all duration-700 ${
            idx === activeIndex ? 'opacity-30 sm:opacity-35 scale-105' : 'opacity-0 scale-100'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.bgImage}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-[#030305]/80 to-[#030305]/60" />
        </div>
      ))}

      {/* Main Hero Stage - Stacked on Mobile, 2-Column on Desktop */}
      <div className="relative z-10 w-full max-w-[1200px] my-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)] gap-5 sm:gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Headline & Action Stage */}
        <div className="flex flex-col items-start text-left">
          
          {/* Category Tag */}
          <div className="mb-2 sm:mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3.5 sm:py-1.5 rounded-full bg-white/[0.08] border border-white/20 text-zinc-100 font-mono text-[9px] sm:text-xs uppercase tracking-wider font-semibold backdrop-blur-md">
              <span className="w-1 h-1 rounded-full bg-zinc-200" />
              {current.category}
            </span>
          </div>

          {/* Headline */}
          <div className="min-h-0 sm:min-h-[90px] lg:min-h-[110px] flex items-center mb-2 sm:mb-3">
            <h1 className="font-display text-xl xs:text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.2] tracking-tight m-0 drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
              {current.title}
            </h1>
          </div>

          {/* Subtitle */}
          <div className="min-h-0 sm:min-h-[44px] lg:min-h-[48px] flex items-center mb-4 sm:mb-6">
            <p className="text-[11px] xs:text-xs sm:text-sm lg:text-base font-light text-white/65 leading-relaxed m-0 max-w-xl line-clamp-2 sm:line-clamp-none">
              {current.subtitle}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap mb-4 sm:mb-6 w-full sm:w-auto">
            <Link
              href={`/articles/${current.slug}`}
              className="btn-editorial-primary flex-1 sm:flex-initial justify-center px-4 sm:px-7 py-2 sm:py-3 text-[11px] sm:text-sm font-bold text-white no-underline text-center"
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
          <div className="flex items-center gap-1.5 sm:gap-2 h-3 sm:h-4">
            {HERO_FEATURED.map((_, idx) => (
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

        {/* Right Column: Genuine 3D Perspective Floating Deck in Grayscale/Titanium (Desktop Only) */}
        <div
          onWheel={handleDeckWheel}
          className="hidden lg:flex"
          style={{
            perspective: '1400px',
            perspectiveOrigin: 'center center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Left Arrow Button */}
          <button
            onClick={() => {
              const newIdx = (activeIndex - 1 + HERO_FEATURED.length) % HERO_FEATURED.length;
              setActiveIndex(newIdx);
              setDeckOffset(Math.max(0, Math.min(newIdx, HERO_FEATURED.length - 3)));
            }}
            aria-label="Previous Story"
            style={{
              position: 'absolute',
              left: '-20px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 30,
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              color: 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <span style={{ fontSize: '15px', lineHeight: 1, marginLeft: '-1px' }}>‹</span>
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={() => {
              const newIdx = (activeIndex + 1) % HERO_FEATURED.length;
              setActiveIndex(newIdx);
              setDeckOffset(Math.max(0, Math.min(newIdx, HERO_FEATURED.length - 3)));
            }}
            aria-label="Next Story"
            style={{
              position: 'absolute',
              right: '-20px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 30,
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              color: 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <span style={{ fontSize: '15px', lineHeight: 1, marginRight: '-1px' }}>›</span>
          </button>

          <div style={{
            width: '100%',
            maxWidth: '390px',
            transform: 'rotateY(-14deg) rotateX(6deg) rotateZ(-1deg)',
            transformStyle: 'preserve-3d',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            position: 'relative',
          }}>
            
            {/* Header Tag in 3D Space */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 8px 4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.5)',
              transform: 'translateZ(15px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff', boxShadow: '0 0 8px #ffffff' }} />
                <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Story Deck
                </span>
              </div>
              <span style={{ color: '#ffffff', fontWeight: 600 }}>0{activeIndex + 1} / 0{HERO_FEATURED.length}</span>
            </div>

            {/* Display Top 3 Visible Cards in 3D Hierarchy */}
            {HERO_FEATURED.slice(deckOffset, deckOffset + 3).map((item, localIdx) => {
              const globalIdx = deckOffset + localIdx;
              const isActive = globalIdx === activeIndex;
              const zDepth = isActive ? 45 : 10 - localIdx * 10;
              const scale = isActive ? 1.04 : 0.98;

              return (
                <div
                  key={item.title}
                  onClick={() => setActiveIndex(globalIdx)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '18px',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%), rgba(15, 15, 22, 0.85)'
                      : 'rgba(12, 12, 18, 0.55)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: isActive ? '1px solid rgba(255, 255, 255, 0.22)' : '1px solid rgba(255, 255, 255, 0.07)',
                    boxShadow: isActive
                      ? '0 20px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.25)'
                      : '0 10px 25px rgba(0,0,0,0.4)',
                    transform: `translateZ(${zDepth}px) scale(${scale})`,
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    position: 'relative',
                  }}
                >
                  {/* Thumbnail Cover */}
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    backgroundColor: '#000000',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: isActive ? '#f4f4f5' : 'rgba(255,255,255,0.5)',
                        letterSpacing: '0.04em',
                      }}>
                        {item.category}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#facc15',
                      }}>
                        ★ {item.rating}
                      </span>
                    </div>

                    <h4 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#ffffff',
                      lineHeight: 1.3,
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {item.title}
                    </h4>
                  </div>
                </div>
              );
            })}

          </div>
        </div>

      </div>

      {/* Floating Idle Scroll Hint (Only appears after idle period, disappears on any scroll) */}
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
