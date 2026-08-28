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

  const checkScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
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
    el.addEventListener('scroll', checkScrollState);
    checkScrollState();

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('scroll', checkScrollState);
    };
  }, [displayedArticles.length]);

  // Calculate dynamic reactive shift offset for every tile based on which tile is hovered
  const getCardTransform = (index: number) => {
    if (hoveredIndex === null) {
      return {
        width: '340px',
        transform: 'translateX(0px) translateY(0px) scale(1)',
        zIndex: 1,
        opacity: 1,
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
      };
    }

    // 2. OTHER CARDS REACTIVELY SHIFT AWAY TO MAKE ROOM
    let otherShiftX = 0;

    if (isFirst) {
      // First card expanded to the right, shift all right-hand cards +180px
      if (index > hoveredIndex) {
        otherShiftX = 180;
      }
    } else if (isLast) {
      // Last card expanded to the left, shift all left-hand cards -180px
      if (index < hoveredIndex) {
        otherShiftX = -180;
      }
    } else {
      // Middle card expanded symmetrically (-90px left, +90px right)
      if (index < hoveredIndex) {
        otherShiftX = -90; // push left
      } else if (index > hoveredIndex) {
        otherShiftX = 90; // push right
      }
    }

    return {
      width: '340px',
      transform: `translateX(${otherShiftX}px) translateY(0px) scale(0.97)`,
      zIndex: 1,
      opacity: 0.7, // Subtle focus dimming
    };
  };

  return (
    <>
      <style>{`
        /* Track with hidden scrollbar and generous padding for floating expansion */
        .isolated-deck-track {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
          padding: 16px 20px 32px 16px;
          align-items: center;
        }
        @media (min-width: 640px) {
          .isolated-deck-track {
            gap: 24px;
            padding: 20px 40px 40px 20px;
          }
        }
        .isolated-deck-track::-webkit-scrollbar {
          display: none;
        }

        /* Fixed slot container */
        .card-slot {
          flex-shrink: 0;
          width: 280px;
          height: 420px;
          position: relative;
        }
        @media (min-width: 640px) {
          .card-slot {
            width: 340px;
            height: 480px;
          }
        }

        /* Cinema card inside slot */
        .cinema-poster-card {
          position: absolute;
          top: 0;
          left: 0;
          height: 420px;
          border-radius: 24px;
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
                      border-color 0.35s ease,
                      box-shadow 0.35s ease;
        }
        @media (min-width: 640px) {
          .cinema-poster-card {
            height: 480px;
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
        style={{
          width: '100%',
          padding: '90px 0 110px',
          backgroundColor: '#020204',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          width: '100%',
          maxWidth: '1240px',
          padding: '0 24px',
          margin: '0 auto',
        }}>
          
          {/* Section Header */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '36px',
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 10px rgba(255,255,255,0.8)',
                }} />
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: '#a1a1aa',
                  fontWeight: 600,
                }}>
                  Curated Features
                </span>
              </div>

              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 3.8vw, 3rem)',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                lineHeight: 1.12,
                margin: 0,
              }}>
                Recent Reviews & Deep Dives
              </h2>
            </div>

            {/* Middle: Domain Filter Pills */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px',
              borderRadius: '99px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(16px)',
            }}>
              {(['all', 'movies', 'games', 'tech', 'anime'] as ReviewDomain[]).map((dom) => {
                const isActive = activeDomain === dom;
                const labels: Record<ReviewDomain, string> = {
                  all: 'All Domains',
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
                    style={{
                      padding: '6px 14px',
                      borderRadius: '99px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#000000' : 'rgba(255, 255, 255, 0.6)',
                      backgroundColor: isActive ? '#ffffff' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      boxShadow: isActive ? '0 2px 10px rgba(255,255,255,0.3)' : 'none',
                    }}
                  >
                    {labels[dom]}
                  </button>
                );
              })}
            </div>

            {/* Navigation Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => scrollByAmount(-440)}
                disabled={!canScrollLeft}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: canScrollLeft ? 'pointer' : 'not-allowed',
                  opacity: canScrollLeft ? 1 : 0.3,
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(16px)',
                }}
                title="Previous Story"
              >
                ←
              </button>
              <button
                onClick={() => scrollByAmount(440)}
                disabled={!canScrollRight}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: canScrollRight ? 'pointer' : 'not-allowed',
                  opacity: canScrollRight ? 1 : 0.3,
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(16px)',
                }}
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
                        padding: '24px 26px',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      <h3 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '19px',
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
                        fontSize: '12.5px',
                        color: 'rgba(255, 255, 255, 0.75)',
                        fontWeight: 300,
                        lineHeight: 1.45,
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
                        paddingTop: '10px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: 'rgba(255, 255, 255, 0.5)',
                      }}>
                        <span style={{ color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>
                          by {article.author}
                        </span>
                        <span>{article.readTime} READ</span>
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
