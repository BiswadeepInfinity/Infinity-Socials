'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ForumSection from '@/components/ForumSection';
import Toolkit from '@/components/Toolkit';

const MOCK_ARTICLE = {
  id: '1',
  slug: 'elden-ring-shadow-erdtree-review',
  title: 'Elden Ring: Shadow of the Erdtree — The Most Uncompromising Expansion in Gaming History',
  subtitle: 'FromSoftware raises the bar for world density, mechanical depth, and mythic ambiguity in a gargantuan return to the Lands Between.',
  youtubeVideoId: 'qLZenOn7WUo',
  author: {
    name: 'Aryan Shah',
    role: 'Editor-in-Chief & Lead Critic',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
  },
  publishedAt: 'AUGUST 2025',
  readTime: '9 MIN READ',
  category: 'CRITICAL REVIEW',
  categoryStyle: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  tags: ['FromSoftware', 'Elden Ring', 'Hidetaka Miyazaki', 'Action RPG', 'Review'],
  metrics: {
    score: '9.8',
    tier: 'MASTERPIECE',
    pros: [
      'The Land of Shadow is one of the densest, most vertically awe-inspiring open worlds ever crafted',
      'Scadutree Fragment progression intelligently solves late-game RPG power scaling',
      'Messmer and Midra set unprecedented benchmarks for boss choreography and audio design',
      'Eight entirely new weapon archetypes that dramatically reshape build variety',
    ],
    cons: [
      'Camera tracking during giant-scale boss encounters remains occasionally frustrating',
      'Performance dips in select high-density shadow-forest biomes at launch',
    ],
    verdict: 'Shadow of the Erdtree is not merely DLC; it is a monumental magnum opus that surpasses the scope of most standalone AAA titles. An uncompromising triumph of artistic vision.',
  },
  content: [
    {
      type: 'paragraph',
      text: "FromSoftware has long operated at the bleeding edge of interactive challenge, but with Shadow of the Erdtree, Hidetaka Miyazaki’s team has engineered something almost terrifying in its ambition. Rather than offering a comfortable victory lap for the 25 million players who conquered the base game, the Land of Shadow immediately demands complete mechanical humility.",
    },
    {
      type: 'heading',
      text: 'Verticality and the Geography of Mystery',
    },
    {
      type: 'paragraph',
      text: "The first thing that strikes you upon stepping through the withered arm of Miquella is the sheer geometric impossibility of the terrain. The Land of Shadow is layered like a Renaissance painting of purgatory—colossal aqueducts suspended across yawning abysses, submerged sunken churches, and jagged gravestones jutting from ancient cliffs. It renders standard map navigation delightfully obsolete.",
    },
    {
      type: 'quote',
      text: '“Shadow of the Erdtree rejects the modern trend of frictionless gaming in favor of genuine, unvarnished discovery. Every vista earned feels like a personal triumph.”',
    },
    {
      type: 'paragraph',
      text: "Progress is governed by the new Scadutree Blessing system, a stroke of genius that decouples DLC difficulty from character level. Whether you arrive at Level 120 or Level 400, your survival hinges on exploring the world to unearth sacred fragments. It restores that electrifying sensation of vulnerability that made your first hours in Limgrave so unforgettable.",
    },
    {
      type: 'heading',
      text: 'Boss Encounters: The Symphony of Ruin',
    },
    {
      type: 'paragraph',
      text: "Much has been made of the expansion’s unforgiving tuning, yet when examined under a critic’s microscope, battles like Messmer the Impaler represent the pinnacle of FromSoftware’s boss design. Every sweeping spear thrust, serpentine flame arc, and momentary cadence lull has been choreographed with rhythmic precision.",
    },
    {
      type: 'paragraph',
      text: "When you finally triumph after dozens of failed attempts, the surge of adrenaline is unmatched. This is video game artistry operating without compromise—dense, poetic, and magnificently ruthless.",
    },
  ],
  moreArticles: [
    { id: '2', slug: 'gta-6-everything-we-know', title: 'GTA VI: The Tech Engineering Behind Vice City 2026', category: 'SPECIAL REPORT', thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&q=80', readTime: '12 MIN' },
    { id: '3', slug: 'demon-slayer-hashira-training', title: 'Demon Slayer: Why Hashira Training Redefined Shonen Pacing', category: 'ANIME DEEP DIVE', thumbnail: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=500&q=80', readTime: '6 MIN' },
    { id: '4', slug: 'black-myth-wukong-review', title: 'Black Myth: Wukong and the Global Ascent of Chinese AAA', category: 'DEEP DIVE', thumbnail: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=500&q=80', readTime: '10 MIN' },
  ],
};

export default function ArticlePageClient({ slug }: { slug: string }) {
  const article = MOCK_ARTICLE;
  const [selectedLang, setSelectedLang] = useState('EN');
  const [ttsActive, setTtsActive] = useState(false);

  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [upvotes, setUpvotes] = useState(89420);
  const [downvotes, setDownvotes] = useState(1240);

  // Audience Interactive Verdict Polling State
  type AudienceOption = 'must_buy' | 'wait_sale' | 'wait' | 'skip';
  const [userAudienceVote, setUserAudienceVote] = useState<AudienceOption | null>(null);
  const [audienceVotes, setAudienceVotes] = useState({
    must_buy: 3842,
    wait_sale: 742,
    wait: 180,
    skip: 65,
  });

  const totalAudienceVotes = audienceVotes.must_buy + audienceVotes.wait_sale + audienceVotes.wait + audienceVotes.skip;

  const handleAudienceVote = (option: AudienceOption) => {
    if (userAudienceVote === option) return;
    setAudienceVotes(prev => {
      const next = { ...prev };
      if (userAudienceVote) {
        next[userAudienceVote] = Math.max(0, next[userAudienceVote] - 1);
      }
      next[option] += 1;
      return next;
    });
    setUserAudienceVote(option);
  };

  const getWinningAudienceOption = () => {
    const entries = Object.entries(audienceVotes) as [AudienceOption, number][];
    entries.sort((a, b) => b[1] - a[1]);
    const top = entries[0];
    const pct = Math.round((top[1] / (totalAudienceVotes || 1)) * 100);

    const labels: Record<AudienceOption, { label: string; tag: string; color: string; bg: string; border: string; desc: string; icon: string }> = {
      must_buy: {
        label: 'MUST BUY / WATCH',
        tag: 'CRUCIAL ESSENTIAL',
        color: 'text-emerald-300',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        desc: 'Overwhelming majority consensus recommends experiencing immediately at launch.',
        icon: '🔥',
      },
      wait_sale: {
        label: 'WAIT FOR SALE',
        tag: 'VALUE CONTENDER',
        color: 'text-amber-300',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        desc: 'Great experience, but community advises picking up during a discount cycle.',
        icon: '🏷️',
      },
      wait: {
        label: 'WAIT / ON THE FENCE',
        tag: 'NEEDS PATCHES',
        color: 'text-cyan-300',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/30',
        desc: 'Hold off for future performance updates, DLC, or balance patches.',
        icon: '⏳',
      },
      skip: {
        label: 'SKIP ENTIRELY',
        tag: 'CRITICAL WARNING',
        color: 'text-rose-300',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        desc: 'Not recommended based on significant flaws or community feedback.',
        icon: '🚫',
      },
    };

    return { ...labels[top[0]], votes: top[1], percentage: pct, key: top[0] };
  };

  const scorecardRef = useRef<HTMLDivElement | null>(null);
  const [isScoreVisible, setIsScoreVisible] = useState(false);
  const [scoreRevealed, setScoreRevealed] = useState(false);
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

    let timer: NodeJS.Timeout;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScoreVisible(entry.isIntersecting);
        if (entry.isIntersecting) {
          // Reveal score text right as the needle finishes its spring overshoot and settles on +9.8
          timer = setTimeout(() => {
            setScoreRevealed(true);
          }, 1100);
        } else {
          setScoreRevealed(false);
        }
      },
      { threshold: 0.3 }
    );

    if (scorecardRef.current) {
      observer.observe(scorecardRef.current);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const handleVote = (type: 'up' | 'down') => {
    if (userVote === type) {
      // Toggle off
      setUserVote(null);
      if (type === 'up') setUpvotes((v) => v - 1);
      else setDownvotes((v) => v - 1);
    } else {
      // Switch or set vote
      if (userVote === 'up') setUpvotes((v) => v - 1);
      if (userVote === 'down') setDownvotes((v) => v - 1);
      
      setUserVote(type);
      if (type === 'up') setUpvotes((v) => v + 1);
      else setDownvotes((v) => v + 1);
    }
  };

  const formatCount = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const LANGUAGES = ['EN', 'JA', 'ES', 'DE', 'FR', 'HI', 'KO', 'ZH'];

  return (
    <div className="bg-[#030305] min-h-screen text-[#f3f3f7] selection:bg-cyan-500/30 selection:text-cyan-200 relative">
      <Navbar />
      <Toolkit articleId={article.id} />

      <main className="pt-28 pb-20">
        
        {/* Article Header & YouTube Cinematic Deck */}
        <header className="max-w-5xl mx-auto px-6 mb-12">
          
          {/* Eyebrows */}
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <span className={`px-3 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border ${article.categoryStyle}`}>
              {article.category}
            </span>
            <span className="font-mono text-xs text-white/40">{article.publishedAt}</span>
            <span className="font-mono text-xs text-cyan-400 font-bold">• {article.readTime}</span>
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-3xl sm:text-5xl xl:text-6xl text-white leading-[1.1] tracking-tight mb-6">
            {article.title}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-white/70 font-light leading-relaxed mb-8 max-w-4xl">
            {article.subtitle}
          </p>

          {/* YouTube-Style Creator Channel Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0a14]/90 border border-white/[0.1] backdrop-blur-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
            {/* Left: Author Profile */}
            <div className="flex items-center gap-3.5">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-12 h-12 rounded-full object-cover border border-white/20 shadow-md"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-cyan-500 rounded-full border-2 border-[#0a0a14] flex items-center justify-center text-[8px] text-black font-bold" title="Verified Creator">
                  ✓
                </span>
              </div>
              <div>
                {/* Master Reviewer Status Tag */}
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    MASTER REVIEWER
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-base text-white">{article.author.name}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-white/[0.06] text-white/60 border border-white/10">
                    Creator
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-white/50 mt-0.5">
                  <span className="text-cyan-400 font-semibold">142K Subscribers</span>
                  <span>•</span>
                  <span>{article.author.role}</span>
                </div>
              </div>
            </div>

            {/* Right: Actions & Tools */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between lg:justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-white/[0.06]">
              {/* Upvote / Downvote Pill */}
              <div className="flex items-center bg-black/60 border border-white/10 rounded-full p-1 shadow-inner backdrop-blur-md">
                <button
                  onClick={() => handleVote('up')}
                  title="Upvote"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all duration-200 ${
                    userVote === 'up'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'text-white/70 hover:text-emerald-400 hover:bg-white/[0.06]'
                  }`}
                >
                  <span className={`text-sm transform transition-transform ${userVote === 'up' ? 'scale-125' : ''}`}>▲</span>
                  <span>{formatCount(upvotes)}</span>
                </button>
                
                <div className="w-[1px] h-4 bg-white/10 my-auto mx-0.5" />

                <button
                  onClick={() => handleVote('down')}
                  title="Downvote"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all duration-200 ${
                    userVote === 'down'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                      : 'text-white/70 hover:text-rose-400 hover:bg-white/[0.06]'
                  }`}
                >
                  <span className={`text-sm transform transition-transform ${userVote === 'down' ? 'scale-125' : ''}`}>▼</span>
                  <span>{formatCount(downvotes)}</span>
                </button>
              </div>

              {/* Join Channel Button */}
              <button
                onClick={() => alert(`Joined ${article.author.name}'s Creator Club!`)}
                className="px-4 py-2 rounded-full text-xs font-mono font-bold tracking-wide transition-all bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-[0_0_16px_rgba(6,182,212,0.3)] hover:shadow-[0_0_24px_rgba(6,182,212,0.5)] flex items-center gap-1.5"
              >
                <span>★</span>
                <span>Join</span>
              </button>

              <div className="hidden sm:block w-[1px] h-6 bg-white/10 mx-1" />

              {/* Language Selector */}
              <div className="flex items-center gap-1 bg-black/50 border border-white/10 px-2.5 py-1.5 rounded-xl text-xs font-mono">
                <span className="text-white/40">🌐</span>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="bg-transparent text-cyan-300 font-bold outline-none cursor-pointer"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang} className="bg-[#0c0c14] text-white">
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* TTS Listen Button */}
              <button
                onClick={() => setTtsActive(!ttsActive)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                  ttsActive
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                    : 'bg-white/[0.04] text-white/70 border-white/10 hover:bg-white/[0.08]'
                }`}
              >
                <span>{ttsActive ? '⏸ AI Audio' : '🔊 Listen (TTS)'}</span>
              </button>
            </div>
          </div>

          {/* Embedded YouTube Media Center */}
          <div className="mt-8 rounded-[28px] overflow-hidden border border-white/[0.12] shadow-[0_30px_90px_rgba(0,0,0,0.9)] bg-black aspect-video relative">
            <iframe
              src={`https://www.youtube.com/embed/${article.youtubeVideoId}?rel=0&modestbranding=1&color=white`}
              title={article.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-none"
            />
          </div>
        </header>

        {/* Article Body Content */}
        <article className="max-w-3xl mx-auto px-6 space-y-6 text-base sm:text-lg leading-relaxed text-white/80 font-light">
          {article.content.map((block, i) => {
            if (block.type === 'heading') {
              return (
                <h2
                  key={i}
                  className="font-display font-bold text-2xl sm:text-3xl text-white pt-8 pb-2 tracking-tight"
                >
                  {block.text}
                </h2>
              );
            }
            if (block.type === 'quote') {
              return (
                <blockquote
                  key={i}
                  className="my-8 p-6 rounded-2xl bg-gradient-to-r from-violet-950/30 to-transparent border-l-4 border-cyan-400 font-display font-medium text-lg sm:text-xl text-white italic shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                >
                  {block.text}
                </blockquote>
              );
            }
            return (
              <p key={i} className="text-white/80 leading-[1.85]">
                {block.text}
              </p>
            );
          })}

          {/* Two Distinct, Unstretched Scorecard & Assessment Cards */}
          <div ref={scorecardRef} className="my-16 space-y-6">
            
            {/* Interactive Audience Verdict Voting Station (Positioned just above the metrics) */}
            <div className="rounded-[28px] p-6 sm:p-7 bg-[#090912] border border-white/[0.1] shadow-2xl relative overflow-hidden space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-bold">
                      COMMUNITY VERDICT POLL
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-xl sm:text-2xl text-white mt-1">
                    What is your verdict on this title?
                  </h4>
                </div>
                <span className="text-xs font-mono text-white/50 bg-white/[0.04] px-3 py-1 rounded-full border border-white/10 w-fit">
                  {totalAudienceVotes.toLocaleString()} Total Votes Cast
                </span>
              </div>

              {/* 4 Interactive Vote Buttons */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {([
                  { key: 'must_buy', label: 'Must Buy / Watch', icon: '🔥', activeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_16px_rgba(16,185,129,0.35)]', hoverBg: 'hover:border-emerald-500/30 hover:bg-emerald-500/5' },
                  { key: 'wait_sale', label: 'Wait for Sale', icon: '🏷️', activeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_16px_rgba(245,158,11,0.35)]', hoverBg: 'hover:border-amber-500/30 hover:bg-amber-500/5' },
                  { key: 'wait', label: 'Wait / Patches', icon: '⏳', activeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_16px_rgba(6,182,212,0.35)]', hoverBg: 'hover:border-cyan-500/30 hover:bg-cyan-500/5' },
                  { key: 'skip', label: 'Skip', icon: '🚫', activeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_16px_rgba(244,63,94,0.35)]', hoverBg: 'hover:border-rose-500/30 hover:bg-rose-500/5' },
                ] as const).map((btn) => {
                  const isSelected = userAudienceVote === btn.key;
                  const count = audienceVotes[btn.key];
                  const pct = Math.round((count / (totalAudienceVotes || 1)) * 100);

                  return (
                    <button
                      key={btn.key}
                      onClick={() => handleAudienceVote(btn.key)}
                      className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-2 relative overflow-hidden group cursor-pointer ${
                        isSelected
                          ? btn.activeBg
                          : `bg-[#050509] border-white/[0.08] text-white/80 ${btn.hoverBg}`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{btn.icon}</span>
                        <span className="font-mono text-xs font-bold text-white/60">{pct}%</span>
                      </div>
                      <div>
                        <div className="font-display font-bold text-xs sm:text-sm text-white group-hover:text-white">
                          {btn.label}
                        </div>
                        <div className="text-[10px] font-mono text-white/40 mt-0.5">
                          {count.toLocaleString()} votes {isSelected && '• (Voted)'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Box 1: Dual Metrics Card (Critic Infinity Meter + Audience Top Consensus Opinion) */}
            <div className="rounded-[32px] p-6 sm:p-8 bg-[#090912] border border-white/[0.1] shadow-2xl relative overflow-hidden space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-bold">
                      INFINITY METRICS & VERDICTS
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight mt-1">
                    Critic Continuum vs Audience Consensus
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/[0.05] text-white/70 border border-white/10 w-fit">
                  Verified Data Stream
                </span>
              </div>

              {/* Full-Width Spacious Stacked Landscape Modules */}
              <div className="grid grid-cols-1 gap-6">

                {/* Module 1: Master Critic Infinity Meter (Full Width Landscape) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#050509] border border-white/[0.08] p-6 sm:p-7 rounded-[28px] shadow-inner gap-6">
                  {/* Left: Critic Info & Consensus Tiers */}
                  <div className="space-y-4 max-w-xs shrink-0">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                          CRITIC CONTINUUM
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-xl text-white">Aryan Shah</h4>
                      <p className="text-xs font-mono text-white/50">Lead Gaming & Tech Critic</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06]">
                      <div className="bg-white/[0.03] p-2 rounded-xl border border-white/[0.05]">
                        <div className="text-[9px] font-mono text-white/40 uppercase">Critical Flaw</div>
                        <div className="text-xs font-mono font-bold text-rose-400 mt-0.5">1%</div>
                      </div>
                      <div className="bg-white/[0.03] p-2 rounded-xl border border-white/[0.05]">
                        <div className="text-[9px] font-mono text-white/40 uppercase">Passable</div>
                        <div className="text-xs font-mono font-bold text-amber-400 mt-0.5">7%</div>
                      </div>
                      <div className="bg-white/[0.03] p-2 rounded-xl border border-white/[0.05]">
                        <div className="text-[9px] font-mono text-white/40 uppercase">Acclaimed</div>
                        <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">64%</div>
                      </div>
                      <div className="bg-white/[0.03] p-2 rounded-xl border border-white/[0.05]">
                        <div className="text-[9px] font-mono text-white/40 uppercase">Transcendent</div>
                        <div className="text-xs font-mono font-bold text-purple-300 mt-0.5">28%</div>
                      </div>
                    </div>
                  </div>

                  {/* Right: The Arc Gauge */}
                  <div className="flex-1 flex items-center justify-center select-none py-1">
                    <svg className="w-full max-w-[340px] h-48 overflow-visible" viewBox="0 0 340 185">
                      <defs>
                        <linearGradient id="criticGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f43f5e" />
                          <stop offset="35%" stopColor="#f59e0b" />
                          <stop offset="70%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>

                      {/* Perimeter Ticks */}
                      {[0, 30, 60, 90, 120, 150, 180].map((angle, i) => {
                        const rad = (angle * Math.PI) / 180;
                        const x1 = 170 - Math.cos(rad) * 128;
                        const y1 = 145 - Math.sin(rad) * 128;
                        const x2 = 170 - Math.cos(rad) * 135;
                        const y2 = 145 - Math.sin(rad) * 135;
                        return (
                          <line
                            key={i}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="rgba(255,255,255,0.12)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        );
                      })}

                      {/* Base Track */}
                      <path
                        d="M 55 145 A 115 115 0 0 1 285 145"
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="12"
                        strokeLinecap="round"
                      />

                      {/* Dynamic Arc Fill */}
                      <path
                        d="M 55 145 A 115 115 0 0 1 285 145"
                        fill="none"
                        stroke="url(#criticGrad)"
                        strokeWidth="12"
                        strokeDasharray="361.28"
                        strokeDashoffset={isScoreVisible ? "32" : "361.28"}
                        strokeLinecap="round"
                        style={{
                          transition: 'stroke-dashoffset 1200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                          willChange: 'stroke-dashoffset'
                        }}
                      />

                      {/* Center 0 Notch */}
                      <line x1="170" y1="22" x2="170" y2="38" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

                      {/* Axis Labels */}
                      <text x="170" y="10" textAnchor="middle" fill="#ffffff" className="font-mono font-black" style={{ fontSize: '14px', fontWeight: 900 }}>0</text>
                      <text x="170" y="20" textAnchor="middle" fill="rgba(255,255,255,0.4)" className="font-mono" style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.1em' }}>NEUTRAL</text>
                      <text x="40" y="172" textAnchor="middle" fill="#f43f5e" className="font-mono font-black" style={{ fontSize: '18px', fontWeight: 900 }}>-∞</text>
                      <text x="40" y="185" textAnchor="middle" fill="rgba(255,255,255,0.4)" className="font-mono" style={{ fontSize: '8px', fontWeight: 700 }}>ABYSSAL</text>
                      <text x="300" y="172" textAnchor="middle" fill="#c084fc" className="font-mono font-black" style={{ fontSize: '18px', fontWeight: 900 }}>+∞</text>
                      <text x="300" y="185" textAnchor="middle" fill="rgba(255,255,255,0.4)" className="font-mono" style={{ fontSize: '8px', fontWeight: 700 }}>ASCENDANT</text>

                      {/* Score: 98% */}
                      <text
                        x="170"
                        y="114"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#ffffff"
                        className="font-display select-none"
                        style={{
                          fontSize: '56px',
                          fontWeight: 900,
                          letterSpacing: '-0.03em',
                          filter: 'drop-shadow(0px 4px 20px rgba(0,0,0,0.8)) drop-shadow(0px 0px 16px rgba(255,255,255,0.25))',
                          opacity: scoreRevealed ? 1 : 0,
                          transform: scoreRevealed ? 'scale(1)' : 'scale(0.85)',
                          transformOrigin: '170px 114px',
                          transition: 'opacity 500ms ease-out, transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                      >
                        98%
                      </text>
                    </svg>
                  </div>
                </div>

                {/* Module 2: Winning Audience Consensus View (Full Width Landscape) */}
                {(() => {
                  const winner = getWinningAudienceOption();
                  return (
                    <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#050509] border border-white/[0.08] p-6 sm:p-7 rounded-[28px] shadow-inner gap-6">
                      
                      {/* Left: Big Winning Verdict Hero Display */}
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                          <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-300">
                            COMMUNITY CONSENSUS VERDICT
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${winner.bg} ${winner.color} ${winner.border} border ml-auto sm:ml-2`}>
                            {winner.tag}
                          </span>
                        </div>

                        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-4">
                          <span className="text-4xl sm:text-5xl shrink-0">{winner.icon}</span>
                          <div className="min-w-0">
                            <div className={`font-display font-black text-2xl sm:text-3xl ${winner.color} tracking-tight leading-tight`}>
                              {winner.label}
                            </div>
                            <p className="text-xs sm:text-sm text-white/65 font-light leading-relaxed mt-1">
                              {winner.desc}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Vote Stats & Legend Distribution */}
                      <div className="w-full md:w-80 shrink-0 space-y-3 pt-4 md:pt-0 md:pl-6 border-t md:border-t-0 md:border-l border-white/[0.06]">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-white/50">Community Vote Share</span>
                          <span className={`font-bold ${winner.color}`}>
                            {winner.percentage}% ({winner.votes.toLocaleString()} votes)
                          </span>
                        </div>

                        {/* Stacked Distribution Bar */}
                        <div className="h-2.5 w-full bg-white/[0.06] rounded-full overflow-hidden flex gap-0.5 p-0.5">
                          <div style={{ width: `${Math.round((audienceVotes.must_buy / totalAudienceVotes) * 100)}%` }} className="bg-emerald-400 rounded-l-full" title="Must Buy/Watch" />
                          <div style={{ width: `${Math.round((audienceVotes.wait_sale / totalAudienceVotes) * 100)}%` }} className="bg-amber-400" title="Wait for Sale" />
                          <div style={{ width: `${Math.round((audienceVotes.wait / totalAudienceVotes) * 100)}%` }} className="bg-cyan-400" title="Wait" />
                          <div style={{ width: `${Math.round((audienceVotes.skip / totalAudienceVotes) * 100)}%` }} className="bg-rose-400 rounded-r-full" title="Skip" />
                        </div>

                        {/* Micro Breakdown Legend */}
                        <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono text-white/40 pt-1 text-center">
                          <div className="bg-white/[0.03] py-1.5 rounded-lg border border-white/[0.05]">
                            <span className="text-emerald-400 font-bold">{Math.round((audienceVotes.must_buy / totalAudienceVotes) * 100)}%</span> Buy
                          </div>
                          <div className="bg-white/[0.03] py-1.5 rounded-lg border border-white/[0.05]">
                            <span className="text-amber-400 font-bold">{Math.round((audienceVotes.wait_sale / totalAudienceVotes) * 100)}%</span> Sale
                          </div>
                          <div className="bg-white/[0.03] py-1.5 rounded-lg border border-white/[0.05]">
                            <span className="text-cyan-400 font-bold">{Math.round((audienceVotes.wait / totalAudienceVotes) * 100)}%</span> Wait
                          </div>
                          <div className="bg-white/[0.03] py-1.5 rounded-lg border border-white/[0.05]">
                            <span className="text-rose-400 font-bold">{Math.round((audienceVotes.skip / totalAudienceVotes) * 100)}%</span> Skip
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })()}

              </div>
            </div>

            {/* Box 2: Dedicated Key Assessment & Pros/Cons Card */}
            <div className="rounded-[32px] p-7 sm:p-8 bg-[#090912] border border-white/[0.1] shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-bold">
                    CRITICAL BREAKDOWN
                  </span>
                  <h3 className="font-display font-bold text-2xl text-white mt-0.5">Key Strengths & Flaws</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  MASTERPIECE TIER
                </span>
              </div>

              {/* Pros & Cons Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-white/[0.05]">
                  <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <span>✓</span> Key Strengths
                  </h4>
                  <ul className="space-y-2.5">
                    {article.metrics.pros.map((pro, idx) => (
                      <li key={idx} className="text-xs text-white/70 flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-white/[0.05]">
                  <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-rose-400 flex items-center gap-2">
                    <span>✗</span> Weak Points
                  </h4>
                  <ul className="space-y-2.5">
                    {article.metrics.cons.map((con, idx) => (
                      <li key={idx} className="text-xs text-white/70 flex items-start gap-2 leading-relaxed">
                        <span className="text-rose-400 mt-0.5">•</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Verdict Box */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <div className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest mb-1.5">
                  FINAL VERDICT
                </div>
                <p className="font-display text-xs sm:text-sm text-white/90 leading-relaxed italic">
                  “{article.metrics.verdict}”
                </p>
              </div>
            </div>

          </div>
        </article>

        {/* Discord-like Community Forums */}
        <ForumSection articleId={article.id} articleTitle={article.title} />

        {/* More Articles Deck */}
        <section className="max-w-5xl mx-auto px-6 mt-20">
          <h3 className="font-display font-bold text-2xl text-white mb-6">Related Coverage</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {article.moreArticles.map((item) => (
              <a
                key={item.id}
                href={`/articles/${item.slug}`}
                className="rounded-[22px] overflow-hidden bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.2] transition-all p-4 flex flex-col justify-between group"
              >
                <div className="h-36 rounded-xl overflow-hidden mb-3 bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-cyan-300">{item.category}</span>
                  <h4 className="font-display font-bold text-sm text-white group-hover:text-cyan-300 transition-colors mt-1 line-clamp-2">
                    {item.title}
                  </h4>
                </div>
              </a>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
