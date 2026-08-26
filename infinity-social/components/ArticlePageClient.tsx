'use client';

import { useState } from 'react';
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

  const LANGUAGES = ['EN', 'JA', 'ES', 'DE', 'FR', 'HI', 'KO', 'ZH'];

  return (
    <div className="bg-[#030305] min-h-screen text-[#f3f3f7] selection:bg-cyan-500/30 selection:text-cyan-200">
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

          {/* YouTube-Style Creator Channel Bar + AI Audio/Lang Tools */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0a14]/90 border border-white/[0.1] backdrop-blur-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center justify-between sm:justify-start gap-4">
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
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-base text-white">{article.author.name}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-white/[0.06] text-white/60 border border-white/10">
                      Creator
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-white/50 mt-0.5">
                    <span className="text-cyan-400 font-semibold">142K Subscribers</span>
                    <span>•</span>
                    <span>Lifetime: <strong className="text-emerald-400 font-medium">▲89.4k</strong> / <strong className="text-rose-400 font-medium">▼1.2k</strong></span>
                  </div>
                </div>
              </div>

              {/* YouTube-Style Join Button */}
              <button
                onClick={() => alert(`Joined ${article.author.name}'s Creator Club!`)}
                className="px-4 py-2 rounded-full text-xs font-mono font-bold tracking-wide transition-all bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-[0_0_16px_rgba(6,182,212,0.3)] hover:shadow-[0_0_24px_rgba(6,182,212,0.5)] flex items-center gap-1.5"
              >
                <span>★</span>
                <span>Join</span>
              </button>
            </div>

            {/* AI Multi-Language & Audio Engine Bar */}
            <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-white/[0.06]">
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

              <button
                onClick={() => setTtsActive(!ttsActive)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
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

          {/* Precision Review Scorecard */}
          <div className="my-16 rounded-[32px] p-8 bg-[#0a0a14]/80 backdrop-blur-3xl border border-white/[0.14] shadow-[0_30px_80px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.25)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-cyan-300 font-bold">
                  INFINITY SCORECARD
                </span>
                <h3 className="font-display font-bold text-2xl text-white mt-1">Critical Assessment</h3>
              </div>

              {/* Massive Score Gauge */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-mono font-bold text-xs text-amber-400">{article.metrics.tier}</div>
                  <div className="text-[10px] font-mono text-white/40">VERIFIED CRITIC</div>
                </div>
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 p-[1px] shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                  <div className="w-full h-full bg-[#0c0c14] rounded-2xl flex items-center justify-center font-display font-bold text-3xl text-amber-300">
                    {article.metrics.score}
                  </div>
                </div>
              </div>
            </div>

            {/* Pros & Cons Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div className="space-y-3">
                <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <span>✓</span> Key Strengths
                </h4>
                <ul className="space-y-2">
                  {article.metrics.pros.map((pro, idx) => (
                    <li key={idx} className="text-xs text-white/70 flex items-start gap-2 leading-relaxed">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-rose-400 flex items-center gap-2">
                  <span>✗</span> Weak Points
                </h4>
                <ul className="space-y-2">
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
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <p className="font-display text-xs sm:text-sm text-white/90 leading-relaxed italic">
                “{article.metrics.verdict}”
              </p>
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
