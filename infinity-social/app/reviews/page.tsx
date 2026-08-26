'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// 1. SPOTLIGHT OF THE WEEK
const SPOTLIGHT_OF_THE_WEEK = {
  title: 'Elden Ring: Shadow of the Erdtree — The Definitive Verdict',
  subtitle: 'FromSoftware delivers their crowning achievement in level density, boss complexity, and atmospheric horror.',
  score: '9.8',
  verdict: 'Masterpiece',
  reviewer: 'Adrian Vance',
  reviewerRole: 'Lead Gaming Critic',
  readTime: '12 min read',
  date: 'August 24, 2026',
  slug: 'elden-ring-shadow-erdtree-review',
  coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=85',
  pros: [
    'Unprecedented vertical world architecture and hidden legacy dungeons',
    'Messmer and Midra stand among the greatest boss fights in gaming history',
    'Exquisite mythic lore deepening Marika’s tragedy',
  ],
  cons: [
    'Camera tracking remains finicky on ultra-large beast encounters',
  ],
};

// 2. DAILY NEWS / RECENT CRITIQUES
const DAILY_NEWS_REVIEWS = [
  {
    title: 'Silent Hill 2 Remake: Atmospheric Psychological Terror Reborn',
    category: 'Game Review',
    score: '9.2',
    date: 'Today • 3h ago',
    excerpt: 'Bloober Team delivers a faithful, fog-drenched modernization that honors the psychological depth of the 2001 classic.',
    slug: 'silent-hill-2-remake',
    thumbnail: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=600&q=80',
    author: 'Elena Rostova',
  },
  {
    title: 'Black Myth: Wukong — A Visual Marvel with Deep Combat Roots',
    category: 'Game Review',
    score: '9.0',
    date: 'Today • 5h ago',
    excerpt: 'Game Science demonstrates jaw-dropping Unreal Engine 5 fidelity paired with high-tempo Chinese martial arts combat.',
    slug: 'black-myth-wukong-review',
    thumbnail: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600&q=80',
    author: 'Kenji Tanaka',
  },
  {
    title: 'Demon Slayer: Hashira Training Arc — Sakuga Spectacle',
    category: 'Anime Review',
    score: '9.4',
    date: 'Yesterday',
    excerpt: 'Ufotable turns quiet character development arcs into an animation tour-de-force setting the stage for Infinity Castle.',
    slug: 'demon-slayer-hashira-training',
    thumbnail: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&q=80',
    author: 'Marcus Chen',
  },
  {
    title: 'One Piece Season 2 Production Preview: Setting Sail for Grand Line',
    category: 'Series Review',
    score: '8.8',
    date: 'Yesterday',
    excerpt: 'Exclusive showrunner interview and set analysis on bringing Baroque Works and Chopper to live action.',
    slug: 'one-piece-live-action-season-2',
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80',
    author: 'Sofia Rivera',
  },
];

// 3. GENRES & DEEP DIVES
const GENRE_CATEGORIES = [
  {
    name: 'Action RPGs & Soulsborne',
    count: '280+ Reviews',
    avgScore: '9.1',
    description: 'Punishing stamina-based combat, lore-dense worlds, and epic boss fights.',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80',
    slug: 'action-games',
  },
  {
    name: 'Open World & Sandboxes',
    count: '195+ Reviews',
    avgScore: '8.9',
    description: 'Vast immersive ecosystems, emergent narrative systems, and exploration.',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80',
    slug: 'rpgs',
  },
  {
    name: 'Shonen & Battle Anime',
    count: '320+ Reviews',
    avgScore: '9.3',
    description: 'High-octane animation, iconic power escalations, and tournament arcs.',
    image: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=600&q=80',
    slug: 'shonen',
  },
  {
    name: 'Sci-Fi & Cyberpunk Cinema',
    count: '240+ Reviews',
    avgScore: '9.0',
    description: 'Dystopian futures, synth soundtracks, and high-concept philosophy.',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80',
    slug: 'sci-fi-movies',
  },
  {
    name: 'Survival Horror',
    count: '110+ Reviews',
    avgScore: '8.7',
    description: 'Tense psychological atmosphere, resource scarcity, and terror.',
    image: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=600&q=80',
    slug: 'horror-games',
  },
  {
    name: 'Indie Breakthroughs',
    count: '160+ Reviews',
    avgScore: '9.4',
    description: 'Artistic innovation, boundary-pushing mechanics, and auteur vision.',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80',
    slug: 'indie-games',
  },
];

export default function ReviewsPage() {
  const [selectedGenreTab, setSelectedGenreTab] = useState('all');

  return (
    <div className="min-h-screen bg-[#030306] text-white selection:bg-white selection:text-black">
      <Navbar />

      <main className="w-full flex flex-col items-center">
        
        {/* Page Title & Breadcrumb Header */}
        <section className="w-full max-w-[1240px] px-6 pt-12 pb-6">
          <div className="flex items-center gap-2 font-mono text-[11px] text-white/40 uppercase mb-2 tracking-wider">
            <Link href="/" className="hover:text-white transition-colors">Infinity</Link>
            <span>/</span>
            <span className="text-white">Editorial Reviews</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
                Forensic Reviews & Critiques
              </h1>
              <p className="text-sm text-white/50 font-light mt-1 max-w-xl">
                Uncompromising, spoiler-free technical and narrative evaluations by verified staff critics.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-white/60 bg-white/[0.04] border border-white/10 px-3.5 py-1.5 rounded-full self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>100% Independent Scoring</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* STEP 1: WEEKLY SPOTLIGHT                                                 */}
        {/* ========================================================================= */}
        <section className="w-full max-w-[1240px] px-6 py-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            <span className="font-mono text-xs uppercase tracking-widest text-amber-300 font-bold">
              Weekly Spotlight
            </span>
          </div>

          <div className="relative rounded-[28px] overflow-hidden border border-white/15 bg-[#090910] shadow-[0_24px_60px_rgba(0,0,0,0.8)] group">
            {/* Background Image Banner */}
            <div className="absolute inset-0 z-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SPOTLIGHT_OF_THE_WEEK.coverImage}
                alt={SPOTLIGHT_OF_THE_WEEK.title}
                className="w-full h-full object-cover brightness-[0.4] group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090910] via-[#090910]/75 to-transparent" />
            </div>

            {/* Spotlight Content */}
            <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row gap-8 justify-between">
              
              <div className="max-w-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    {/* Domain / Category Tag */}
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>Gaming • Action RPG</span>
                    </span>

                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ★ Essential Award
                    </span>
                    <span className="text-xs font-mono text-white/50">{SPOTLIGHT_OF_THE_WEEK.date}</span>
                    <span className="text-xs font-mono text-white/50">•</span>
                    <span className="text-xs font-mono text-white/50">{SPOTLIGHT_OF_THE_WEEK.readTime}</span>
                  </div>

                  <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-tight mb-3">
                    {SPOTLIGHT_OF_THE_WEEK.title}
                  </h2>

                  <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed mb-6">
                    {SPOTLIGHT_OF_THE_WEEK.subtitle}
                  </p>

                  {/* Pros & Cons Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-1.5">
                        ✓ Key Strengths
                      </span>
                      <ul className="space-y-1 text-xs text-white/75 font-light">
                        {SPOTLIGHT_OF_THE_WEEK.pros.map((p, i) => (
                          <li key={i} className="line-clamp-1">• {p}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="text-[11px] font-mono font-bold text-rose-400 uppercase tracking-wider block mb-1.5">
                        ✕ Friction Points
                      </span>
                      <ul className="space-y-1 text-xs text-white/75 font-light">
                        {SPOTLIGHT_OF_THE_WEEK.cons.map((c, i) => (
                          <li key={i} className="line-clamp-1">• {c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <Link
                    href={`/articles/${SPOTLIGHT_OF_THE_WEEK.slug}`}
                    className="btn-editorial-primary px-6 py-3 text-xs sm:text-sm font-mono font-bold"
                  >
                    <span>Read Full Spotlight Review</span>
                    <span>→</span>
                  </Link>

                  <div className="text-xs font-mono text-white/50">
                    Reviewed by <strong className="text-white">{SPOTLIGHT_OF_THE_WEEK.reviewer}</strong> ({SPOTLIGHT_OF_THE_WEEK.reviewerRole})
                  </div>
                </div>
              </div>

              {/* Big Score Card */}
              <div className="flex flex-col items-center justify-center p-8 rounded-[24px] bg-white/[0.05] border border-white/15 backdrop-blur-2xl text-center self-start lg:self-center min-w-[200px] shadow-2xl">
                <span className="font-mono text-[11px] uppercase tracking-widest text-white/50 mb-1">
                  Editorial Score
                </span>
                <span className="font-display font-black text-6xl sm:text-7xl text-white tracking-tight leading-none mb-2">
                  {SPOTLIGHT_OF_THE_WEEK.score}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-white text-black">
                  {SPOTLIGHT_OF_THE_WEEK.verdict}
                </span>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* STEP 2: DAILY NEWS & LATEST REVIEWS                                      */}
        {/* ========================================================================= */}
        <section className="w-full max-w-[1240px] px-6 py-10">
          <div className="flex items-center justify-between gap-4 mb-6 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="font-mono text-xs uppercase tracking-widest text-cyan-300 font-bold">
                2. Daily News & Recent Critiques
              </span>
            </div>
            <span className="text-xs font-mono text-white/40">Updated every 2 hours</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {DAILY_NEWS_REVIEWS.map((news) => (
              <Link
                key={news.slug}
                href={`/articles/${news.slug}`}
                className="p-5 rounded-[22px] bg-[#0c0c14] border border-white/[0.1] hover:border-white/30 transition-all duration-300 flex flex-col sm:flex-row gap-4.5 group shadow-[0_12px_30px_rgba(0,0,0,0.5)] hover:-translate-y-0.5"
              >
                {/* Thumbnail with score */}
                <div className="relative w-full sm:w-[130px] h-[105px] rounded-[16px] overflow-hidden flex-shrink-0 bg-black border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={news.thumbnail}
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md border border-white/20 text-amber-300 font-mono font-bold text-[10px]">
                    ★ {news.score}
                  </div>
                </div>

                {/* News Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/70 bg-white/[0.06] px-2 py-0.5 rounded-full border border-white/10">
                        {news.category}
                      </span>
                      <span className="text-[11px] font-mono text-white/40">•</span>
                      <span className="text-[11px] font-mono text-white/40">{news.date}</span>
                    </div>

                    <h3 className="font-display font-bold text-base text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                      {news.title}
                    </h3>

                    <p className="text-xs text-white/50 font-light mt-1 line-clamp-2 leading-relaxed">
                      {news.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-white/40 mt-3 pt-2 border-t border-white/[0.06]">
                    <span>By {news.author}</span>
                    <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">Read Analysis →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* STEP 3: GENRES & ARCHIVES                                                */}
        {/* ========================================================================= */}
        <section className="w-full max-w-[1240px] px-6 py-10 pb-20">
          <div className="flex items-center justify-between gap-4 mb-6 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="font-mono text-xs uppercase tracking-widest text-purple-300 font-bold">
                3. Browse by Genre & Ecosystem
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-white/50">
              <span>{GENRE_CATEGORIES.length} Curated Archives</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GENRE_CATEGORIES.map((genre) => (
              <Link
                key={genre.slug}
                href={`/categories/${genre.slug}`}
                className="group relative h-[220px] rounded-[22px] overflow-hidden border border-white/[0.12] hover:border-white/35 transition-all duration-300 p-5 flex flex-col justify-between bg-[#0c0c14] shadow-[0_16px_36px_rgba(0,0,0,0.6)] hover:-translate-y-1"
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={genre.image}
                    alt={genre.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out brightness-[0.4] group-hover:brightness-[0.55]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-[#0c0c14]/70 to-transparent" />
                </div>

                {/* Top Genre Meta */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-black/60 backdrop-blur-md border border-white/15 text-white/80">
                    {genre.count}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Avg ★ {genre.avgScore}
                  </span>
                </div>

                {/* Bottom Title & Description */}
                <div className="relative z-10">
                  <h4 className="font-display font-bold text-lg text-white group-hover:text-white transition-colors mb-1">
                    {genre.name}
                  </h4>
                  <p className="text-xs text-white/60 font-light line-clamp-2 leading-relaxed">
                    {genre.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
