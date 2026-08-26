'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      width: '100%',
      height: '72px',
      backgroundColor: 'rgba(5, 5, 8, 0.85)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1240px',
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

        {/* Center: Nav Items */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          fontWeight: 500,
        }}>
          <Link href="/" style={{ color: '#ffffff', textDecoration: 'none', transition: 'color 0.2s' }}>
            Feed
          </Link>
          <Link href="/reviews" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', transition: 'color 0.2s' }}>
            Reviews
          </Link>
          <Link href="/interviews" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', transition: 'color 0.2s' }}>
            Interviews
          </Link>
          <Link href="/anime" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', transition: 'color 0.2s' }}>
            Anime
          </Link>
          <Link href="/gaming" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', transition: 'color 0.2s' }}>
            Gaming
          </Link>
          <Link href="/community" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Community</span>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
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
        </div>

      </div>
    </header>
  );
}
