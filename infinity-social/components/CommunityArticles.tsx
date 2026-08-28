'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CreatorInfo {
  name: string;
  avatar: string;
  handle: string;
  subscribers: string;
  totalUpvotes: number;
  totalDownvotes: number;
}

interface ArticleItem {
  id: string;
  slug: string;
  rank: number;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  thumbnail: string;
  upvotes: number;
  downvotes: number;
  author: string;
  creator: CreatorInfo;
  commentsCount: number;
  date: string;
}

const COMMUNITY_LEADERBOARD: ArticleItem[] = [
  {
    id: '1',
    slug: 'elden-ring-shadow-erdtree-review',
    rank: 1,
    title: 'Shadow of the Erdtree: Why Messmer is FromSoftware’s Best Boss in 15 Years',
    excerpt: 'An exhaustive tactical breakdown of phase transitions, hitboxes, and lore revelations in the Realm of Shadow.',
    category: 'Gaming Essay',
    readTime: '6 min read',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=700&q=80',
    upvotes: 3428,
    downvotes: 82,
    author: 'Aryan Shah',
    creator: {
      name: 'Aryan Shah',
      handle: '@aryanshah',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
      subscribers: '142K',
      totalUpvotes: 89400,
      totalDownvotes: 1240,
    },
    commentsCount: 148,
    date: '2h ago',
  },
  {
    id: '2',
    slug: 'gta-6-everything-we-know',
    rank: 2,
    title: 'How Rockstar is Using Next-Gen Machine Learning for Vice City NPC Routines',
    excerpt: 'Deconstructing the patented animation streaming systems powering the most dense digital metropolis ever created.',
    category: 'Tech Analysis',
    readTime: '8 min read',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=700&q=80',
    upvotes: 2890,
    downvotes: 45,
    author: 'Sofia Rivera',
    creator: {
      name: 'Sofia Rivera',
      handle: '@sofia_r',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80',
      subscribers: '215K',
      totalUpvotes: 124500,
      totalDownvotes: 980,
    },
    commentsCount: 94,
    date: '4h ago',
  },
  {
    id: '3',
    slug: 'demon-slayer-hashira-training',
    rank: 3,
    title: 'Infinity Castle Trilogy: Can Cinema Truly Capture the Scale of the Manga?',
    excerpt: 'Why Ufotable’s theatrical transition marks a pivotal shift for anime distribution and box office records.',
    category: 'Anime Industry',
    readTime: '5 min read',
    thumbnail: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=700&q=80',
    upvotes: 2410,
    downvotes: 67,
    author: 'Kenji Tanaka',
    creator: {
      name: 'Kenji Tanaka',
      handle: '@kenji_t',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
      subscribers: '98.5K',
      totalUpvotes: 67800,
      totalDownvotes: 1120,
    },
    commentsCount: 112,
    date: '6h ago',
  },
  {
    id: '4',
    slug: 'black-myth-wukong-review',
    rank: 4,
    title: 'The Journey West: Cultural Authenticity vs Western Localization in AAA Gaming',
    excerpt: 'Analyzing the global discourse surrounding mythology, translation fidelity, and mechanical combat design.',
    category: 'Critique',
    readTime: '7 min read',
    thumbnail: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=700&q=80',
    upvotes: 1870,
    downvotes: 95,
    author: 'Marcus Chen',
    creator: {
      name: 'Marcus Chen',
      handle: '@marcuschen',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
      subscribers: '64.2K',
      totalUpvotes: 43200,
      totalDownvotes: 870,
    },
    commentsCount: 82,
    date: 'Yesterday',
  },
];

export default function CommunityArticles() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'gaming' | 'tech' | 'anime'>('all');
  const [votes, setVotes] = useState<
    Record<string, { up: number; down: number; userVote: 'up' | 'down' | null }>
  >(() =>
    Object.fromEntries(
      COMMUNITY_LEADERBOARD.map((a) => [
        a.id,
        { up: a.upvotes, down: a.downvotes, userVote: null },
      ])
    )
  );

  const [joinedCreators, setJoinedCreators] = useState<Record<string, boolean>>({});

  const toggleJoin = (creatorName: string) => {
    setJoinedCreators((prev) => ({
      ...prev,
      [creatorName]: !prev[creatorName],
    }));
  };

  const handleVote = (id: string, type: 'up' | 'down') => {
    setVotes((prev) => {
      const current = prev[id];
      if (current.userVote === type) {
        return {
          ...prev,
          [id]: { ...current, [type]: current[type] - 1, userVote: null },
        };
      } else if (current.userVote) {
        const other = type === 'up' ? 'down' : 'up';
        return {
          ...prev,
          [id]: {
            ...current,
            [type]: current[type] + 1,
            [other]: current[other] - 1,
            userVote: type,
          },
        };
      } else {
        return {
          ...prev,
          [id]: { ...current, [type]: current[type] + 1, userVote: type },
        };
      }
    });
  };

  const filteredItems = COMMUNITY_LEADERBOARD.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'gaming') return item.category.toLowerCase().includes('gaming') || item.category.toLowerCase().includes('critique');
    if (activeFilter === 'tech') return item.category.toLowerCase().includes('tech');
    if (activeFilter === 'anime') return item.category.toLowerCase().includes('anime');
    return true;
  });

  return (
    <section className="py-12 sm:py-20 bg-[#030306] w-full flex justify-center border-t border-white/[0.06] relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-white/[0.02] via-white/[0.04] to-transparent rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-[1240px] px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="scroll-reveal flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10 pb-5 sm:pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-white/60 font-semibold">
                Verified Creator Leaderboard
              </span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
              Community Top Charts
            </h2>
            <p className="text-xs sm:text-sm text-white/50 font-light mt-1 max-w-xl leading-relaxed">
              Curated and ranked in real-time by community karma, critical reviews, and verified creator scores.
            </p>
          </div>

          {/* Filter Pills (Horizontally scrollable on mobile) */}
          <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-full border border-white/[0.1] backdrop-blur-md overflow-x-auto max-w-full scrollbar-none self-start md:self-auto">
            {(['all', 'gaming', 'tech', 'anime'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-mono font-medium transition-all capitalize whitespace-nowrap ${
                  activeFilter === filter
                    ? 'bg-white text-black font-bold shadow-[0_0_14px_rgba(255,255,255,0.4)]'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Redesigned Clean & Premium Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredItems.map((item, index) => {
            const v = votes[item.id];
            const netKarma = v.up - v.down;
            const isJoined = joinedCreators[item.creator.name] || false;
            const currentLifetimeUp = item.creator.totalUpvotes + (v.userVote === 'up' ? 1 : 0);

            return (
              <div
                key={item.id}
                style={{ transitionDelay: `${index * 90}ms` }}
                className="scroll-reveal-card touch-spring group relative rounded-[20px] sm:rounded-[24px] bg-[#0c0c14]/80 border border-white/[0.12] hover:border-white/30 transition-all duration-300 backdrop-blur-xl p-4 sm:p-6 flex flex-col justify-between gap-4 sm:gap-5 shadow-[0_12px_32px_rgba(0,0,0,0.6)] hover:shadow-[0_24px_50px_rgba(0,0,0,0.85)] hover:-translate-y-0.5 active:border-white/30"
              >
                {/* Top Subtle Specular Highlight */}
                <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

                {/* Creator Header Row */}
                <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.creator.avatar}
                        alt={item.creator.name}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-white/20 shadow-sm transition-transform duration-300 group-hover:scale-105"
                      />
                      <span
                        className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full border-2 border-[#0c0c14] flex items-center justify-center text-[8px] text-black font-black shadow-sm"
                        title="Verified Creator"
                      >
                        ✓
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-display font-bold text-[13px] sm:text-[14px] text-white tracking-tight truncate">
                          {item.creator.name}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-mono text-white/40 truncate">
                          {item.creator.handle}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-white/50 mt-0.5">
                        <span className="text-white/80 font-semibold">{item.creator.subscribers}</span>
                        <span className="text-white/30">•</span>
                        <span>{(currentLifetimeUp / 1000).toFixed(1)}k karma</span>
                      </div>
                    </div>
                  </div>

                  {/* Join / Follow Button */}
                  <button
                    onClick={() => toggleJoin(item.creator.name)}
                    className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-mono font-semibold transition-all duration-200 flex items-center gap-1 flex-shrink-0 active:scale-90 ${
                      isJoined
                        ? 'bg-white/10 text-white/90 border border-white/25 hover:bg-white/15'
                        : 'bg-white text-black hover:bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.3)] hover:shadow-[0_0_18px_rgba(255,255,255,0.5)]'
                    }`}
                  >
                    <span>{isJoined ? '✓ Joined' : '+ Follow'}</span>
                  </button>
                </div>

                {/* Main Content Layout */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4.5 items-start">
                  {/* Thumbnail Cover with Rank Indicator */}
                  <div className="relative w-full sm:w-[130px] h-[160px] xs:h-[180px] sm:h-[105px] rounded-[14px] sm:rounded-[16px] overflow-hidden flex-shrink-0 bg-[#050508] border border-white/15 shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* Rank Badge */}
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md font-mono font-bold text-[10px] backdrop-blur-md border shadow-sm flex items-center gap-1 transition-all ${
                      item.rank === 1
                        ? 'bg-amber-950/85 border-amber-400/50 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                        : 'bg-black/75 border-white/20 text-white'
                    }`}>
                      <span>#{item.rank}</span>
                    </div>
                  </div>

                  {/* Text Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0 w-full">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-semibold uppercase tracking-wider bg-white/[0.07] text-white/80 border border-white/15">
                        {item.category}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-mono text-white/40">•</span>
                      <span className="text-[10px] sm:text-[11px] font-mono text-white/40">{item.date}</span>
                      <span className="text-[10px] sm:text-[11px] font-mono text-white/40">•</span>
                      <span className="text-[10px] sm:text-[11px] font-mono text-white/40">{item.readTime}</span>
                    </div>

                    <Link href={`/articles/${item.slug}`} className="block group/title">
                      <h3 className="font-display font-bold text-[15px] sm:text-[16px] text-white group-hover/title:text-white/80 transition-colors leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-white/55 font-light mt-1.5 line-clamp-2 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>
                </div>

                {/* Footer Controls: Interactive Voting & Meta */}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] mt-0.5">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    {/* Voting Pill */}
                    <div className="flex items-center bg-white/[0.05] p-0.5 rounded-full border border-white/[0.1]">
                      <button
                        onClick={() => handleVote(item.id, 'up')}
                        className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-bold transition-all active:scale-125 ${
                          v.userVote === 'up'
                            ? 'bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                            : 'text-white/70 hover:text-white hover:bg-white/[0.08]'
                        }`}
                        title="Upvote"
                      >
                        <span className="active:scale-125 transition-transform">▲</span>
                        <span>{v.up.toLocaleString()}</span>
                      </button>

                      <div className="w-[1px] h-3 bg-white/10 mx-0.5" />

                      <button
                        onClick={() => handleVote(item.id, 'down')}
                        className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-mono transition-all active:scale-125 ${
                          v.userVote === 'down'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                            : 'text-white/40 hover:text-white/70 hover:bg-white/[0.08]'
                        }`}
                        title="Downvote"
                      >
                        <span className="active:scale-125 transition-transform">▼</span>
                        <span>{v.down}</span>
                      </button>
                    </div>

                    <span className="hidden sm:inline-block font-mono text-[11px] text-white/40">
                      Score: <strong className={netKarma >= 0 ? 'text-white font-bold' : 'text-rose-400'}>{netKarma > 0 ? `+${netKarma}` : netKarma}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="flex items-center gap-1 text-[11px] sm:text-xs font-mono text-white/50">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{item.commentsCount}</span>
                    </span>

                    <Link
                      href={`/articles/${item.slug}`}
                      className="text-[11px] sm:text-xs font-mono font-semibold text-white/80 hover:text-white flex items-center gap-1 group/link active:translate-x-1 transition-transform"
                    >
                      <span>Read Story</span>
                      <span className="group-hover/link:translate-x-0.5 transition-transform">→</span>
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
