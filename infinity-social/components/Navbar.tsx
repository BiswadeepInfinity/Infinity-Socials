'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

export default function Navbar() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-50 w-full bg-[#050508]/90 backdrop-blur-2xl border-b border-white/[0.08]">
      {/* Polished High-Precision Infinity Reading Numberline Bar */}
      <div className="w-full bg-[#040408] border-b border-white/[0.06] px-3 sm:px-5 py-1 flex items-center justify-between gap-2 sm:gap-3.5 select-none">
        {/* Left: -∞ Continuum Start */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-mono text-xs sm:text-[13px] font-black text-rose-500 tracking-tight drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">
            -∞
          </span>
          <span className="font-mono text-[8px] font-bold text-white/40 tracking-wider hidden sm:inline">
            START
          </span>
        </div>

        {/* Center Continuum Track */}
        <div className="relative flex-1 h-1 bg-white/[0.07] rounded-full overflow-visible">
          {/* Neutral 0 Axis Line */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-0.5 h-2.5 bg-white/70 rounded-sm shadow-[0_0_6px_rgba(255,255,255,0.5)]" />
          </div>

          {/* Dynamic Progress Bar */}
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-500 via-emerald-500 to-purple-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-75"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Right: +∞ Continuum End */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-mono text-[8px] font-bold text-white/40 tracking-wider hidden sm:inline">
            END
          </span>
          <span className={`font-mono text-xs sm:text-[13px] font-black tracking-tight transition-all duration-300 ${
            scrollProgress >= 95 ? 'text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.9)]' : 'text-purple-500 drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]'
          }`}>
            +∞
          </span>
        </div>
      </div>

      <div className="max-w-[1240px] h-16 sm:h-[72px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
        
        {/* Left: Brand Identity */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 text-white no-underline shrink-0 group">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-black border border-white/[0.14] flex items-center justify-center shadow-lg p-1 overflow-hidden shrink-0 group-hover:border-white/30 transition-all">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Infinity Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
              INFINITY SOCIALS
            </span>
            <span className="font-mono text-[8px] sm:text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-white uppercase tracking-wider hidden xs:inline">
              BETA
            </span>
          </div>
        </Link>

        {/* Center: Desktop Nav Capsule Dock */}
        <nav className="hidden lg:flex items-center gap-1.5 py-1 px-2 rounded-full bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] text-xs font-semibold">
          <Link href="/" className="nav-link-zoom text-white no-underline">
            Feed
          </Link>
          <Link href="/reviews" className="nav-link-zoom text-white/70 no-underline">
            Reviews
          </Link>
          <Link href="/interviews" className="nav-link-zoom text-white/70 no-underline">
            Interviews
          </Link>
          <Link href="/anime" className="nav-link-zoom text-white/70 no-underline">
            Anime
          </Link>
          <Link href="/gaming" className="nav-link-zoom text-white/70 no-underline">
            Gaming
          </Link>
          <Link href="/community" className="nav-link-zoom text-white/70 no-underline flex items-center gap-1.5">
            <span>Community</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          </Link>
        </nav>

        {/* Right: Search & Profile & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* Desktop/Tablet Search */}
          <div className="relative hidden sm:flex items-center">
            <input
              type="text"
              placeholder="Search..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={`h-9 rounded-full bg-white/[0.06] border text-xs text-white placeholder-white/40 pl-8 pr-3 outline-none transition-all duration-200 ${
                searchFocused ? 'w-48 sm:w-56 border-white/40 bg-white/[0.1]' : 'w-28 sm:w-36 border-white/[0.12]'
              }`}
            />
            <span className="absolute left-2.5 text-xs text-white/40 pointer-events-none">
              🔍
            </span>
          </div>

          <NavbarAuthSection />

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white transition-all cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Slide-Down Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#07070c]/98 backdrop-blur-2xl px-5 py-5 space-y-4 shadow-2xl animate-dropdown">
          {/* Mobile Search */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search articles, reviews, anime..."
              className="w-full h-10 rounded-xl bg-white/[0.06] border border-white/[0.12] text-xs text-white placeholder-white/40 pl-9 pr-4 outline-none focus:border-white/40"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/40 pointer-events-none">
              🔍
            </span>
          </div>

          {/* Mobile Nav Links */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-white no-underline border border-white/[0.06]"
            >
              <span>🏠</span>
              <span>Feed</span>
            </Link>

            <Link
              href="/reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-white no-underline border border-white/[0.06]"
            >
              <span>✍️</span>
              <span>Reviews</span>
            </Link>

            <Link
              href="/interviews"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-white no-underline border border-white/[0.06]"
            >
              <span>🎙️</span>
              <span>Interviews</span>
            </Link>

            <Link
              href="/anime"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-white no-underline border border-white/[0.06]"
            >
              <span>⛩️</span>
              <span>Anime</span>
            </Link>

            <Link
              href="/gaming"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-white no-underline border border-white/[0.06]"
            >
              <span>🎮</span>
              <span>Gaming</span>
            </Link>

            <Link
              href="/community"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-white no-underline border border-white/[0.06]"
            >
              <div className="flex items-center gap-2">
                <span>💬</span>
                <span>Community</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)]" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function NavbarAuthSection() {
  const { user, profile, loading, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />;
  }

  if (user && profile) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 p-1 pr-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-all cursor-pointer"
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
          <div className="absolute right-0 mt-2.5 w-56 p-2 bg-[#100f16]/95 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06)] z-50 backdrop-blur-2xl animate-dropdown">
            {/* Header info */}
            <div className="px-3.5 py-2.5 border-b border-white/[0.06] mb-1.5 bg-white/[0.02] rounded-xl">
              <p className="text-[13px] font-bold text-white truncate">{profile.display_name || profile.username}</p>
              <p className="text-[10px] text-white/45 truncate font-mono">@{profile.username}</p>
            </div>

            {/* Menu Links */}
            <div className="space-y-1">
              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-white/80 hover:text-white hover:bg-white/[0.08] active:scale-[0.98] transition-all duration-150"
              >
                <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>My Profile</span>
              </Link>

              <Link
                href="/my-reviews"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-white/80 hover:text-white hover:bg-white/[0.08] active:scale-[0.98] transition-all duration-150"
              >
                <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>My Reviews</span>
              </Link>

              <Link
                href="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-white/80 hover:text-white hover:bg-white/[0.08] active:scale-[0.98] transition-all duration-150"
              >
                <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
              </Link>

              {profile.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-violet-300 hover:text-violet-200 hover:bg-violet-500/15 active:scale-[0.98] transition-all duration-150"
                >
                  <span className="text-sm">⚡</span>
                  <span>Admin CMS</span>
                </Link>
              )}
            </div>

            {/* Logout Row matching reference pill style */}
            <div className="pt-2 mt-1.5 border-t border-white/[0.06]">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  signOut();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold text-[#f87171] bg-[#3a151b]/80 hover:bg-[#4a1b23] active:scale-[0.98] border border-rose-500/20 transition-all duration-150 cursor-pointer shadow-inner"
              >
                <svg className="w-4 h-4 text-[#f87171]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
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

