'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);
  const [islandExpanded, setIslandExpanded] = useState(false);
  const contractTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleIslandClick = () => {
    setIslandExpanded(prev => !prev);
    // Auto-contract after 4 seconds of inactivity if expanded via click
    if (contractTimerRef.current) clearTimeout(contractTimerRef.current);
    contractTimerRef.current = setTimeout(() => {
      setIslandExpanded(false);
    }, 4000);
  };

  const handleIslandMouseEnter = () => {
    if (contractTimerRef.current) clearTimeout(contractTimerRef.current);
    setIslandExpanded(true);
  };

  const handleIslandMouseLeave = () => {
    if (contractTimerRef.current) clearTimeout(contractTimerRef.current);
    contractTimerRef.current = setTimeout(() => {
      setIslandExpanded(false);
    }, 400);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 60);

      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (currentScrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (contractTimerRef.current) clearTimeout(contractTimerRef.current);
    };
  }, []);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/[0.08] transition-all duration-300"
        style={{
          backgroundColor: isScrolled ? 'rgba(5, 5, 8, 0.85)' : '#050508',
          backdropFilter: isScrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(16px)' : 'none',
        }}
      >
        {/* Polished High-Precision Infinity Reading Numberline Bar */}
        <div className="w-full bg-[#030306] border-b border-white/[0.06] px-3 sm:px-5 py-1 flex items-center justify-between gap-2 sm:gap-3.5 select-none">
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
              className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-500 via-emerald-500 to-purple-500 shadow-[0_0_10px_rgba(160,80,255,0.6)] transition-all duration-75"
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

        <div className="max-w-[1240px] h-14 sm:h-[68px] mx-auto px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 relative">
          
          {/* Left: Brand Identity */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 text-white no-underline shrink-0 group">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-black border border-white/[0.14] flex items-center justify-center shadow-lg p-1 overflow-hidden shrink-0 group-hover:border-white/30 transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Infinity Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-sm sm:text-base lg:text-lg tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent whitespace-nowrap">
                INFINITY SOCIALS
              </span>
              <span className="font-mono text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-white/10 border border-white/20 text-white uppercase tracking-wider hidden md:inline">
                BETA
              </span>
            </div>
          </Link>

          {/* Center: Dynamic Island Morphing Capsule Dock (Permanently centered) */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 items-center justify-center pointer-events-auto z-20">
            {/* Contracted Dynamic Island Punchhole (When Scrolled & Not Expanded) */}
            {isScrolled && !islandExpanded ? (
              <button
                type="button"
                onClick={handleIslandClick}
                onMouseEnter={handleIslandMouseEnter}
                className="group flex items-center gap-2.5 h-10 px-4 rounded-full bg-black/95 border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.95),0_0_15px_rgba(255,255,255,0.08),inset_0_1px_1px_rgba(255,255,255,0.4)] cursor-pointer backdrop-blur-2xl transition-all duration-300 hover:scale-105 hover:border-white/60 select-none animate-pulse-slow"
                title="Click or Hover to expand Dynamic Island"
                aria-label="Expand Navigation Dock"
              >
                {/* Apple Dynamic Island Punchhole Camera / Sensor Dot */}
                <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-white/[0.08] border border-white/15">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,1)] animate-ping" style={{ animationDuration: '2.5s' }} />
                  <span className="absolute w-2 h-2 rounded-full bg-rose-500" />
                </div>

                {/* Punchhole Dynamic Island Pill Content */}
                <span className="font-mono text-[11px] font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                  <span>Navigation</span>
                  <span className="text-white/40 text-[9px]">▾</span>
                </span>

                {/* Apple Dynamic Island Right Status Waveform / Indicator */}
                <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity pl-0.5">
                  <span className="w-1 h-3 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.8)]" />
                  <span className="w-1 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                </div>
              </button>
            ) : (
              /* Expanded Capsule Dock (Normal state OR expanded on hover/click) */
              <nav
                onMouseLeave={isScrolled ? handleIslandMouseLeave : undefined}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-semibold transition-all duration-300 select-none ${
                  isScrolled
                    ? 'bg-black/95 border border-white/40 shadow-[0_12px_45px_rgba(0,0,0,0.98),0_0_20px_rgba(255,255,255,0.1),inset_0_1px_1px_rgba(255,255,255,0.4)] backdrop-blur-3xl scale-100 ring-1 ring-white/10'
                    : 'bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                }`}
              >
                {isScrolled && (
                  /* Punchhole indicator inside expanded dock */
                  <div className="flex items-center justify-center w-4 h-4 rounded-full bg-white/[0.1] mr-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.9)]" />
                  </div>
                )}
                <Link href="/" className="nav-link-zoom text-white no-underline">
                  Feed
                </Link>
                <Link href="/browse" className="nav-link-zoom text-white/90 hover:text-white no-underline flex items-center gap-1.5">
                  <span>Explore</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                </Link>
              <Link href="/#featured-articles" className="nav-link-zoom text-white/70 hover:text-white no-underline">
                News
              </Link>
              <Link href="/reviews" className="nav-link-zoom text-white/70 no-underline">
                Reviews
              </Link>
              <Link href="/browse?type=anime" className="nav-link-zoom text-white/70 no-underline">
                Anime
              </Link>
              <Link href="/browse?type=game" className="nav-link-zoom text-white/70 no-underline">
                Gaming
              </Link>
              <Link href="/browse?type=movie" className="nav-link-zoom text-white/70 no-underline">
                Movies
              </Link>
              <Link href="/clubs" className="nav-link-zoom text-white/70 no-underline flex items-center gap-1.5">
                <span>Clubs & Societies</span>
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              </Link>
            </nav>
          )}
        </div>

        {/* Right: Search & Profile & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Desktop/Tablet Search */}
          <form onSubmit={handleSearchSubmit} className="relative hidden md:flex items-center">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={`h-8 sm:h-9 rounded-full bg-white/[0.06] border text-xs text-white placeholder-white/40 pl-8 pr-3 outline-none transition-all duration-200 ${
                searchFocused ? 'w-48 border-white/40 bg-white/[0.1]' : 'w-28 border-white/[0.12]'
              }`}
            />
            <span className="absolute left-2.5 text-xs text-white/40 pointer-events-none">
              🔍
            </span>
          </form>

          <NavbarAuthSection />

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white transition-all cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Slide-Down Drawer */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden border-t border-white/10 px-4 py-4 space-y-3 shadow-2xl animate-dropdown"
          style={{ backgroundColor: '#07070c' }}
        >
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search reviews, anime, gaming..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8.5 rounded-lg bg-white/[0.05] border border-white/[0.12] text-xs text-white placeholder-white/40 pl-8 pr-3 outline-none focus:border-white/40 transition-all font-mono"
            />
            <svg
              className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>

          {/* Clean Editorial Nav List */}
          <div className="flex flex-col rounded-xl bg-white/[0.03] border border-white/[0.08] divide-y divide-white/[0.05] overflow-hidden">
            {[
              {
                name: 'Feed',
                href: '/',
                icon: (
                  <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                ),
              },
              {
                name: 'Reviews & Deep Dives',
                href: '/reviews',
                icon: (
                  <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ),
              },
              {
                name: 'News & Editorials',
                href: '/#featured-articles',
                icon: (
                  <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                ),
              },
              {
                name: 'Anime Hub',
                href: '/browse?type=anime',
                icon: (
                  <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                name: 'Gaming & Tech',
                href: '/browse?type=game',
                icon: (
                  <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                ),
              },
              {
                name: 'Movies & Cinema',
                href: '/browse?type=movie',
                icon: (
                  <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                ),
              },
              {
                name: 'Clubs & Societies',
                href: '/clubs',
                badge: 'Clans & Guilds',
                icon: (
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
              },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 hover:bg-white/[0.06] active:bg-white/[0.1] text-xs font-medium text-white/90 no-underline transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:border-white/20 transition-colors">
                    {link.icon}
                  </div>
                  <span className="font-display font-medium text-[13px]">{link.name}</span>
                </div>
                {link.badge ? (
                  <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider">
                    {link.badge}
                  </span>
                ) : (
                  <span className="text-white/30 text-xs group-hover:text-white/70 group-hover:translate-x-0.5 transition-all">
                    →
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
    {/* Spacer so page content starts below the fixed navbar */}
    <div className="h-[90px] sm:h-[104px] w-full pointer-events-none" aria-hidden="true" />
    </>
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
    return <div className="w-7 h-7 rounded-full bg-white/10 animate-pulse" />;
  }

  if (user && profile) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1.5 sm:gap-2.5 p-1 pr-2 sm:pr-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-all cursor-pointer shrink-0"
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden bg-violet-600/30 border border-white/20 flex items-center justify-center shrink-0">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] font-bold text-white uppercase">
                {profile.username?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-white/90 max-w-[80px] sm:max-w-[120px] truncate hidden xs:inline">
            @{profile.username}
          </span>
          <span className="text-[9px] text-white/40">▾</span>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2.5 w-56 p-2 bg-[#100f16]/98 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06)] z-50 backdrop-blur-2xl animate-dropdown">
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

            {/* Logout Row */}
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
      className="inline-flex items-center justify-center px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white text-black text-xs font-bold whitespace-nowrap hover:bg-zinc-200 active:scale-95 transition-all shadow-md no-underline shrink-0"
    >
      Sign In
    </Link>
  );
}
