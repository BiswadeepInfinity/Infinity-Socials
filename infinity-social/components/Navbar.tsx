'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

export default function Navbar() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      width: '100%',
      backgroundColor: 'rgba(5, 5, 8, 0.85)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Polished High-Precision Infinity Reading Numberline Bar */}
      <div style={{
        width: '100%',
        backgroundColor: '#040408',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '3px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        userSelect: 'none',
      }}>
        {/* Left: -∞ Continuum Start */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: 900,
            color: '#f43f5e',
            letterSpacing: '-0.02em',
            textShadow: '0 0 10px rgba(244, 63, 94, 0.6)',
          }}>
            -∞
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '8px',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.35)',
            letterSpacing: '0.08em',
          }}>
            START
          </span>
        </div>

        {/* Center Continuum Track */}
        <div style={{
          position: 'relative',
          flex: 1,
          height: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.07)',
          borderRadius: '99px',
          overflow: 'visible',
        }}>
          {/* Neutral 0 Axis Line and Tag */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10,
          }}>
            <div style={{
              width: '2px',
              height: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '1px',
              boxShadow: '0 0 6px rgba(255, 255, 255, 0.5)',
            }} />
          </div>

          {/* Dynamic Glowing Gradient Continuum Progress */}
          <div style={{
            height: '100%',
            width: `${scrollProgress}%`,
            background: 'linear-gradient(90deg, #f43f5e 0%, #f59e0b 35%, #10b981 70%, #a855f7 100%)',
            borderRadius: '99px',
            boxShadow: '0 0 12px rgba(16, 185, 129, 0.6)',
            transition: 'width 75ms ease-out',
          }} />
        </div>

        {/* Right: +∞ Continuum End */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '8px',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.35)',
            letterSpacing: '0.08em',
          }}>
            END
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: 900,
            color: scrollProgress >= 95 ? '#c084fc' : '#a855f7',
            letterSpacing: '-0.02em',
            textShadow: scrollProgress >= 95 ? '0 0 12px rgba(168, 85, 247, 0.9)' : '0 0 8px rgba(168, 85, 247, 0.5)',
            transition: 'all 0.3s ease',
          }}>
            +∞
          </span>
        </div>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '1240px',
        height: '72px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        
        {/* Left: Brand Identity in Titanium / Silver */}
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textDecoration: 'none',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ffffff 0%, #71717a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(255, 255, 255, 0.15)',
          }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#09090b', lineHeight: 1 }}>∞</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              background: 'linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              INFINITY
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#f4f4f5',
              letterSpacing: '0.05em',
            }}>
              JOURNAL
            </span>
          </div>
        </Link>

        {/* Center: Nav Items Floating Capsule Dock */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 8px',
          borderRadius: '99px',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 4px 20px rgba(0, 0, 0, 0.3)',
          fontFamily: 'var(--font-display)',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '-0.01em',
        }}>
          <Link href="/" className="nav-link-zoom" style={{ color: '#ffffff', textDecoration: 'none' }}>
            Feed
          </Link>
          <Link href="/reviews" className="nav-link-zoom" style={{ color: 'rgba(255, 255, 255, 0.65)', textDecoration: 'none' }}>
            Reviews
          </Link>
          <Link href="/interviews" className="nav-link-zoom" style={{ color: 'rgba(255, 255, 255, 0.65)', textDecoration: 'none' }}>
            Interviews
          </Link>
          <Link href="/anime" className="nav-link-zoom" style={{ color: 'rgba(255, 255, 255, 0.65)', textDecoration: 'none' }}>
            Anime
          </Link>
          <Link href="/gaming" className="nav-link-zoom" style={{ color: 'rgba(255, 255, 255, 0.65)', textDecoration: 'none' }}>
            Gaming
          </Link>
          <Link href="/community" className="nav-link-zoom" style={{ color: 'rgba(255, 255, 255, 0.65)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Community</span>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)' }} />
          </Link>
        </nav>

        {/* Right: Search & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}>
            <input
              type="text"
              placeholder="Search..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: searchFocused ? '200px' : '150px',
                height: '36px',
                padding: '0 12px 0 30px',
                borderRadius: '99px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: searchFocused ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontSize: '12px',
                outline: 'none',
                transition: 'all 0.25s ease',
              }}
            />
            <span style={{
              position: 'absolute',
              left: '10px',
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: '12px',
              pointerEvents: 'none',
            }}>
              🔍
            </span>
          </div>

          <NavbarAuthSection />
        </div>

      </div>
    </header>
  );
}

function NavbarAuthSection() {
  const { user, profile, loading, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />;
  }

  if (user && profile) {
    return (
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 p-1 pr-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-colors cursor-pointer"
        >
          <div className="w-7 h-7 rounded-full overflow-hidden bg-violet-600/30 border border-white/20 flex items-center justify-center">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-white">
                {profile.username ? profile.username.charAt(0).toUpperCase() : 'U'}
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-white tracking-tight">
            @{profile.username}
          </span>
          <span className="text-[10px] text-white/40">▾</span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 py-1.5 bg-[#0e0e18] border border-white/15 rounded-2xl shadow-2xl z-50 backdrop-blur-xl">
            <div className="px-3.5 py-2 border-b border-white/10">
              <p className="text-[11px] font-semibold text-white truncate">{profile.display_name || profile.username}</p>
              <p className="text-[10px] text-white/40 truncate">{user.email}</p>
              {profile.role === 'admin' && (
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Admin
                </span>
              )}
            </div>

            {profile.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setDropdownOpen(false)}
                className="block px-3.5 py-2 text-xs text-violet-300 hover:bg-white/[0.06] transition-colors"
              >
                ⚙️ Admin CMS
              </Link>
            )}

            <button
              onClick={() => {
                setDropdownOpen(false);
                signOut();
              }}
              className="w-full text-left px-3.5 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href="/auth/login"
      className="btn-editorial-primary"
      style={{
        padding: '8px 20px',
        fontSize: '12px',
        fontWeight: 600,
      }}
    >
      Sign In
    </Link>
  );
}

