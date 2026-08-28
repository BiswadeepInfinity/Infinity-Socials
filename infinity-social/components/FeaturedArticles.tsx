'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type ReviewDomain = 'all' | 'movies' | 'games' | 'tech' | 'anime';

const FEATURED_ARTICLES = [
  {
    id: '1',
    slug: 'elden-ring-shadow-erdtree-review',
    title: 'Shadow of the Erdtree: The Brutal Pinnacle of FromSoftware',
    excerpt: 'How Miyazaki redefined difficulty and subterranean vertical exploration in the Land of Shadow.',
    category: 'REVIEW',
    domain: 'games',
    accentColor: '#f43f5e',
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=85',
    readTime: '8 MIN',
    author: 'Aryan Shah',
    score: '98%',
  },
  {
    id: '2',
    slug: 'demon-slayer-hashira-training',
    title: 'Demon Slayer: Why Ufotable’s Animation Defies Industry Limits',
    excerpt: 'Deconstructing the sakuga frame rates and composite lighting powering the Hashira Training climax.',
    category: 'ANIME',
    domain: 'anime',
    accentColor: '#f59e0b',
    coverImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=85',
    readTime: '6 MIN',
    author: 'Kenji Tanaka',
    score: '94%',
  },
  {
    id: '3',
    slug: 'gta-6-everything-we-know',
    title: 'GTA VI: The Living Next-Gen Simulation of Leonida',
    excerpt: 'Inside the patented procedural physics, AI traffic systems, and dual-protagonist narrative engine.',
    category: 'SPECIAL',
    domain: 'games',
    accentColor: '#e4e4e7',
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=85',
    readTime: '12 MIN',
    author: 'Sofia Rivera',
    score: '100%',
  },
  {
    id: '4',
    slug: 'black-myth-wukong-review',
    title: 'Black Myth: Wukong & the Global Ascent of Eastern AAA',
    excerpt: 'How Chinese cultural myth paired with Unreal Engine 5 shattered Steam concurrent player records.',
    category: 'DEEP DIVE',
    domain: 'games',
    accentColor: '#10b981',
    coverImage: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1200&q=85',
    readTime: '10 MIN',
    author: 'Marcus Chen',
    score: '90%',
  },
  {
    id: '5',
    slug: 'one-piece-live-action-season-2',
    title: 'One Piece Season 2: Rebuilding the Grand Line for Netflix',
    excerpt: 'Showrunner interview on practical sets, scaling Baroque Works, and bringing Tony Tony Chopper to life.',
    category: 'EXCLUSIVE',
    domain: 'movies',
    accentColor: '#a855f7',
    coverImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&q=85',
    readTime: '7 MIN',
    author: 'Sofia Rivera',
    score: '88%',
  },
  {
    id: '6',
    slug: 'rtx-5090-blackwell-deep-dive',
    title: 'Nvidia RTX 5090: Next-Gen Neural Rendering & Architecture',
    excerpt: 'Deep-dive analysis on Blackwell tensor cores, power efficiency, and real-time path tracing performance.',
    category: 'TECH',
    domain: 'tech',
    accentColor: '#06b6d4',
    coverImage: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&q=85',
    readTime: '9 MIN',
    author: 'Kenji Tanaka',
    score: '96%',
  },
];

export default function FeaturedArticlesWindow() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeDomain, setActiveDomain] = useState<ReviewDomain>('all');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const displayedArticles = activeDomain === 'all'
    ? FEATURED_ARTICLES
    : FEATURED_ARTICLES.filter((a) => a.domain === activeDomain);

  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const checkScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

    // Calculate active visible card on mobile for dynamic spotlight effect
    if (window.innerWidth < 640) {
      const cardElements = scrollRef.current.querySelectorAll('.card-slot');
      let closestIdx = 0;
      let minDistance = Infinity;
      const containerLeft = scrollRef.current.getBoundingClientRect().left;

      cardElements.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.left - containerLeft - 16);
        if (distance < minDistance) {
          minDistance = distance;
          closestIdx = idx;
        }
      });
      setMobileActiveIndex(closestIdx);
    }
  };

  const scrollByAmount = (amount: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.stopPropagation();
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('scroll', checkScrollState, { passive: true });
    checkScrollState();

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('scroll', checkScrollState);
    };
  }, [displayedArticles.length]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate dynamic reactive shift offset for every tile based on which tile is active or hovered
  const getCardTransform = (index: number) => {
    if (isMobile) {
      const isCardActive = mobileActiveIndex === index;
      return {
        width: '100%',
        transform: isCardActive ? 'scale(1) translateY(0px)' : 'scale(0.93) translateY(4px)',
        zIndex: isCardActive ? 10 : 1,
        opacity: isCardActive ? 1 : 0.42,
        filter: isCardActive ? 'brightness(1) saturate(1.2)' : 'brightness(0.5) saturate(0.7)',
        borderColor: isCardActive ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.08)',
        boxShadow: isCardActive
          ? '0 24px 50px rgba(0,0,0,0.9), 0 0 25px rgba(255,255,255,0.12), inset 0 1px 1px rgba(255,255,255,0.4)'
          : '0 8px 20px rgba(0,0,0,0.5)',
      };
    }

    if (hoveredIndex === null) {
      return {
        width: '340px',
        transform: 'translateX(0px) translateY(0px) scale(1)',
        zIndex: 1,
        opacity: 1,
        filter: 'none',
        borderColor: 'rgba(255, 255, 255, 0.16)',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
      };
    }

    const isHovered = index === hoveredIndex;
    const isFirst = hoveredIndex === 0;
    const isLast = hoveredIndex === displayedArticles.length - 1;

    // 1. THE HOVERED CARD EXPANDS
    if (isHovered) {
      let shiftX = -90; // Default middle card expands from both sides (-90px left)
      if (isFirst) shiftX = 0; // First card expands right
      if (isLast) shiftX = -180; // Last card expands left

      return {
        width: '520px',
        transform: `translateX(${shiftX}px) translateY(-6px) scale(1)`,
        zIndex: 50,
        opacity: 1,
        filter: 'none',
        borderColor: 'rgba(255, 255, 255, 0.6)',
        boxShadow: '0 35px 85px rgba(0, 0, 0, 0.95), 0 0 35px rgba(255, 255, 255, 0.2), inset 0 1.5px 2px rgba(255, 255, 255, 0.7)',
      };
    }

    // 2. OTHER CARDS REACTIVELY SHIFT AWAY TO MAKE ROOM
    let otherShiftX = 0;

    if (isFirst) {
      if (index > hoveredIndex) otherShiftX = 180;
    } else if (isLast) {
      if (index < hoveredIndex) otherShiftX = -180;
    } else {
      if (index < hoveredIndex) otherShiftX = -90;
      else if (index > hoveredIndex) otherShiftX = 90;
    }

    return {
      width: '340px',
      transform: `translateX(${otherShiftX}px) translateY(0px) scale(0.97)`,
      zIndex: 1,
      opacity: 0.7,
      filter: 'none',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
    };
  };

  return (
    <>
      <style>{`
        /* Track with hidden scrollbar and snap-scrolling on mobile */
        .isolated-deck-track {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
          scroll-snap-type: x mandatory;
          padding: 8px 16px 24px 16px;
          align-items: center;
        }
        @media (min-width: 640px) {
          .isolated-deck-track {
            gap: 24px;
            scroll-snap-type: none;
            padding: 20px 40px 40px 20px;
          }
        }
        .isolated-deck-track::-webkit-scrollbar {
          display: none;
        }

        /* Fixed slot container */
        .card-slot {
          flex-shrink: 0;
          width: 80vw;
          max-width: 300px;
          height: 420px;
          position: relative;
          scroll-snap-align: start;
        }
        @media (min-width: 640px) {
          .card-slot {
            width: 340px;
            height: 480px;
            scroll-snap-align: unset;
          }
        }

        /* Cinema card inside slot */
        .cinema-poster-card {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 22px;
          overflow: hidden;
          text-decoration: none;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%), rgba(10, 10, 16, 0.7);
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.16);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.4);
          transition: width 0.45s cubic-bezier(0.2, 0.9, 0.3, 1),
                      transform 0.45s cubic-bezier(0.2, 0.9, 0.3, 1),
                      opacity 0.4s ease,
                      filter 0.4s ease,
                      border-color 0.35s ease,
                      box-shadow 0.35s ease;
        }
        @media (min-width: 640px) {
          .cinema-poster-card {
            border-radius: 30px;
          }
        }

        /* Active Hover Highlights */
        .is-active-card {
          border-color: rgba(255, 255, 255, 0.6) !important;
          box-shadow: 0 35px 85px rgba(0, 0, 0, 0.95), 0 0 35px rgba(255, 255, 255, 0.2), inset 0 1.5px 2px rgba(255, 255, 255, 0.7) !important;
        }

        /* Text fades away smoothly on active hover */
        .is-active-card .card-text-overlay {
          opacity: 0 !important;
          transform: translateY(14px) !important;
          pointer-events: none;
        }
        .card-text-overlay {
          opacity: 1;
          transform: translateY(0px);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        /* Scrim fades out for full brightness trailer view */
        .is-active-card .card-scrim {
          opacity: 0.08 !important;
        }
        .card-scrim {
          opacity: 1;
          transition: opacity 0.4s ease;
        }

        /* Media zoom */
        .is-active-card .card-media {
          filter: brightness(1) saturate(1.3) !important;
          transform: scale(1.04) !important;
        }
        .card-media {
          filter: brightness(0.65) saturate(1.2);
          transform: scale(1);
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s ease;
        }

        /* Diagonal Corner Ribbon */
        .corner-ribbon-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 90px;
          height: 90px;
          overflow: hidden;
          z-index: 25;
          pointer-events: none;
        }
        .corner-ribbon-sash {
          position: absolute;
          top: 18px;
          left: -32px;
          width: 120px;
          padding: 4px 0;
          transform: rotate(-45deg);
          text-align: center;
          font-family: var(--font-mono);
          font-size: 8.5px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          box-shadow: 0 4px 15px rgba(0,0,0,0.6);
        }

        /* Live Cinema Stream indicator */
        .cinema-live-indicator {
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s;
        }
        .is-active-card .cinema-live-indicator {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <section
        id="featured-articles-window"
        className="w-full py-10 sm:py-16 lg:py-24 bg-[#020204] flex flex-col items-center relative overflow-hidden"
      >
        <div className="w-full max-w-[1240px] px-4 sm:px-6 mx-auto">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-9">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                  Curated Features
                </span>
              </div>

              <h2 className="font-display text-xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight m-0">
                Recent Reviews & Deep Dives
              </h2>
            </div>

            {/* Middle: Domain Filter Pills (Horizontally Scrollable on Mobile) */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl overflow-x-auto max-w-full scrollbar-none">
              {(['all', 'movies', 'games', 'tech', 'anime'] as ReviewDomain[]).map((dom) => {
                const isActive = activeDomain === dom;
                const labels: Record<ReviewDomain, string> = {
                  all: 'All',
                  movies: '🎬 Movies',
                  games: '🎮 Games',
                  tech: '⚡ Tech',
                  anime: '⛩️ Anime',
                };
                return (
                  <button
                    key={dom}
                    onClick={() => {
                      setActiveDomain(dom);
                      setHoveredIndex(null);
                      if (scrollRef.current) scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                    }}
                    className={`px-3 py-1.5 rounded-full font-mono text-[11px] font-semibold whitespace-nowrap transition-all duration-200 border-none cursor-pointer ${
                      isActive
                        ? 'bg-white text-black shadow-[0_2px_10px_rgba(255,255,255,0.3)] font-bold'
                        : 'bg-transparent text-white/60 hover:text-white'
                    }`}
                  >
                    {labels[dom]}
                  </button>
                );
              })}
            </div>

            {/* Navigation Controls (Desktop only) */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scrollByAmount(-440)}
                disabled={!canScrollLeft}
                className={`w-10 h-10 rounded-full bg-white/[0.05] border border-white/15 text-white flex items-center justify-center transition-all ${
                  canScrollLeft ? 'cursor-pointer hover:bg-white/10 opacity-100' : 'cursor-not-allowed opacity-30'
                }`}
                title="Previous Story"
              >
                ←
              </button>
              <button
                onClick={() => scrollByAmount(440)}
                disabled={!canScrollRight}
                className={`w-10 h-10 rounded-full bg-white/[0.05] border border-white/15 text-white flex items-center justify-center transition-all ${
                  canScrollRight ? 'cursor-pointer hover:bg-white/10 opacity-100' : 'cursor-not-allowed opacity-30'
                }`}
                title="Next Story"
              >
                →
              </button>
            </div>
          </div>

          {/* Symmetrical Reactive Shifting Deck Track */}
          <div
            ref={scrollRef}
            className="isolated-deck-track"
          >
            {displayedArticles.map((article, index) => {
              const cardStyle = getCardTransform(index);
              const isHovered = hoveredIndex === index;

              return (
                <div
                  key={article.id}
                  className="card-slot"
                  style={{ zIndex: cardStyle.zIndex }}
                >
                  <Link
                    href={`/articles/${article.slug}`}
                    className={`cinema-poster-card ${isHovered ? 'is-active-card' : ''}`}
                    style={{
                      width: cardStyle.width,
                      transform: cardStyle.transform,
                      opacity: cardStyle.opacity,
                      filter: cardStyle.filter,
                      borderColor: cardStyle.borderColor,
                      boxShadow: cardStyle.boxShadow,
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* 1. DIAGONAL CORNER RIBBON SASH */}
                    <div className="corner-ribbon-wrapper">
                      <div
                        className="corner-ribbon-sash"
                        style={{
                          backgroundColor: 'rgba(8, 8, 16, 0.94)',
                          color: article.accentColor,
                          borderTop: `1px solid ${article.accentColor}`,
                          borderBottom: `1px solid ${article.accentColor}`,
                          backdropFilter: 'blur(16px)',
                          boxShadow: `0 4px 15px rgba(0,0,0,0.8), 0 0 10px ${article.accentColor}40`,
                        }}
                      >
                        {article.category}
                      </div>
                    </div>

                    {/* Full Bleed Image / Media Canvas */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="card-media"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />

                    {/* Dark Vignette Scrim */}
                    <div
                      className="card-scrim"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(8,8,16,0.1) 0%, rgba(8,8,16,0.5) 40%, rgba(8,8,16,0.98) 85%)',
                      }}
                    />

                    {/* Top Right Floating Score Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '18px',
                      right: '20px',
                      zIndex: 20,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '5px 12px',
                      borderRadius: '99px',
                      backgroundColor: 'rgba(5, 5, 10, 0.85)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#facc15',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                    }}>
                      <span>★</span>
                      <span>{article.score}</span>
                    </div>

                    {/* Live Cinema Indicator on Hover */}
                    <div
                      className="cinema-live-indicator"
                      style={{
                        position: 'absolute',
                        bottom: '24px',
                        left: '26px',
                        zIndex: 20,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 14px',
                        borderRadius: '99px',
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: '#f4f4f5',
                        letterSpacing: '0.08em',
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff', boxShadow: '0 0 8px #ffffff' }} />
                      <span>PREVIEW STREAM</span>
                    </div>

                    {/* Text Content Overlay: Fixed at Bottom with Padding */}
                    <div
                      className="card-text-overlay"
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: isMobile ? '16px 18px' : '22px 24px',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <h3 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: isMobile ? '16px' : '18px',
                        fontWeight: 700,
                        color: '#ffffff',
                        lineHeight: 1.25,
                        letterSpacing: '-0.01em',
                        margin: 0,
                        textShadow: '0 2px 10px rgba(0,0,0,0.9)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {article.title}
                      </h3>

                      <p style={{
                        fontSize: isMobile ? '11px' : '12px',
                        color: 'rgba(255, 255, 255, 0.75)',
                        fontWeight: 300,
                        lineHeight: 1.4,
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {article.excerpt}
                      </p>

                      {/* Meta Footer */}
                      <div style={{
                        paddingTop: '8px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontFamily: 'var(--font-mono)',
                        fontSize: isMobile ? '10px' : '11px',
                        color: 'rgba(255, 255, 255, 0.5)',
                      }}>
                        <span style={{ color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }} className="truncate max-w-[140px]">
                          by {article.author}
                        </span>
                        <span className="shrink-0">{article.readTime}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

        </div>
      </section>
    </>
  );
}
