'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#030306] text-white flex flex-col justify-between selection:bg-white selection:text-black overflow-hidden relative">
      <Navbar />

      {/* Atmospheric Background Lights & Particle Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-white/[0.04] via-cyan-500/[0.05] to-purple-500/[0.03] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />

      {/* Main Landing Canvas */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-6 py-20 flex flex-col items-center text-center my-auto">
        
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.15] backdrop-blur-xl mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-mono text-xs uppercase tracking-widest text-white/80 font-semibold">
            Transmission Inbound • Coming Soon
          </span>
        </div>

        {/* Big Creative Display Headline */}
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl tracking-tight text-white leading-[1.08] mb-6">
          Architecting The Next <br />
          <span className="bg-gradient-to-r from-white via-white/90 to-white/40 bg-clip-text text-transparent">
            Dimension of Pop Culture
          </span>
        </h1>

        {/* Subtitle / Narrative */}
        <p className="text-base sm:text-lg text-white/60 font-light max-w-2xl leading-relaxed mb-10">
          This sector of the Infinity Network is currently under heavy editorial and engineering construction. We are crafting forensic reviews, interactive creator hubs, and immersive deep dives.
        </p>

        {/* Interactive VIP Notify / Access Box */}
        <div className="w-full max-w-md mb-12">
          {!subscribed ? (
            <form
              onSubmit={handleNotify}
              className="flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl bg-white/[0.04] border border-white/[0.12] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email for early access..."
                required
                className="w-full px-4 py-3 bg-transparent text-sm text-white placeholder-white/40 outline-none font-mono"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-black font-mono font-bold text-xs hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_28px_rgba(255,255,255,0.5)] flex-shrink-0 cursor-pointer"
              >
                Notify Me
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-2xl bg-white/[0.08] border border-white/20 backdrop-blur-xl text-center">
              <div className="text-sm font-mono text-cyan-300 font-semibold mb-1">
                ✓ Access Request Registered
              </div>
              <p className="text-xs text-white/60">
                You’ll be the first to know the moment this sector unlocks.
              </p>
            </div>
          )}
        </div>

        {/* Live Sector Status Deck */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-12">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md text-left">
            <div className="font-mono text-[10px] uppercase text-white/40 mb-1">Sector 01</div>
            <div className="font-display font-bold text-sm text-white">Gaming Deep Tech</div>
            <div className="font-mono text-[11px] text-cyan-400 mt-2">● In Development (88%)</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md text-left">
            <div className="font-mono text-[10px] uppercase text-white/40 mb-1">Sector 02</div>
            <div className="font-display font-bold text-sm text-white">Cinema Matrix</div>
            <div className="font-mono text-[11px] text-purple-400 mt-2">● Curating (94%)</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md text-left">
            <div className="font-mono text-[10px] uppercase text-white/40 mb-1">Sector 03</div>
            <div className="font-display font-bold text-sm text-white">Creator Studio</div>
            <div className="font-mono text-[11px] text-emerald-400 mt-2">● Alpha Testing</div>
          </div>
        </div>

        {/* Return to Base Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white/70 hover:text-white px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all group"
        >
          <span>← Return to Home Feed</span>
        </Link>

      </main>

      <Footer />
    </div>
  );
}
