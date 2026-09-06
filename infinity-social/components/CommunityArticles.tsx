'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { fetchAllUserReviews, FormattedReviewItem, FALLBACK_EDITORIAL_REVIEWS } from '@/lib/fetchReviews';

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
  slug?: string;
  link: string;
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

function formatReviewsToLeaderboard(reviews: FormattedReviewItem[]): ArticleItem[] {
  return reviews.map((r, idx) => ({
    id: r.id,
    slug: r.slug,
    link: r.link,
    rank: idx + 1,
    title: r.title,
    excerpt: r.deck,
    category: `${r.category} Review`,
    readTime: r.readTime,
    thumbnail: r.imageUrl,
    upvotes: r.metrics?.upvotes || 0,
    downvotes: r.metrics?.downvotes || 0,
    author: r.author.name,
    creator: {
      name: r.author.name,
      handle: r.author.handle,
      avatar: r.author.avatar,
      subscribers: `${Math.floor((r.score || 80) * 1.5)}K`,
      totalUpvotes: (r.metrics?.upvotes || 100) * 12,
      totalDownvotes: (r.metrics?.downvotes || 5) * 4,
    },
    commentsCount: r.metrics?.comments || 0,
    date: r.date,
  }));
}

export default function CommunityArticles() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'gaming' | 'tech' | 'anime'>('all');
  const [articles, setArticles] = useState<ArticleItem[]>(() => formatReviewsToLeaderboard(FALLBACK_EDITORIAL_REVIEWS));
  const [votes, setVotes] = useState<
    Record<string, { up: number; down: number; userVote: 'up' | 'down' | null }>
  >(() =>
    Object.fromEntries(
      formatReviewsToLeaderboard(FALLBACK_EDITORIAL_REVIEWS).map((a) => [
        a.id,
        { up: a.upvotes, down: a.downvotes, userVote: null },
      ])
    )
  );

  const [joinedCreators, setJoinedCreators] = useState<Record<string, boolean>>({});
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAllUserReviews().then((items) => {
      if (items && items.length > 0) {
        const mapped = formatReviewsToLeaderboard(items);
        setArticles(mapped);
        setVotes(
          Object.fromEntries(
            mapped.map((a) => [a.id, { up: a.upvotes, down: a.downvotes, userVote: null }])
          )
        );
      }
    });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      if (!sectionRef.current) return;
      const cards = sectionRef.current.querySelectorAll('.community-card-item');
      if (!cards.length) return;

      const viewportCenter = window.innerHeight * 0.48;
      let closestIdx = 0;
      let minDistance = Infinity;

      cards.forEach((card, idx) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const distance = Math.abs(cardCenter - viewportCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestIdx = idx;
        }
      });

      setMobileActiveIndex(closestIdx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, activeFilter]);

  const toggleJoin = (creatorName: string) => {
    setJoinedCreators((prev) => ({
      ...prev,
      [creatorName]: !prev[creatorName],
    }));
  };

  const handleVote = async (id: string, type: 'up' | 'down') => {
    const current = votes[id] || { up: 0, down: 0, userVote: null };
    let newUp = current.up;
    let newDown = current.down;
    let newVote: 'up' | 'down' | null = type;

    if (current.userVote === type) {
      // Toggle off
      newVote = null;
      if (type === 'up') newUp = Math.max(0, newUp - 1);
      else newDown = Math.max(0, newDown - 1);
    } else if (current.userVote) {
      // Switch vote
      if (type === 'up') {
        newUp += 1;
        newDown = Math.max(0, newDown - 1);
      } else {
        newDown += 1;
        newUp = Math.max(0, newUp - 1);
      }
    } else {
      // First vote
      if (type === 'up') newUp += 1;
      else newDown += 1;
    }

    setVotes((prev) => ({
      ...prev,
      [id]: { up: newUp, down: newDown, userVote: newVote },
    }));

    // If review has a real UUID in user_reviews, sync optimistic vote to Supabase
    if (!id.startsWith('fb-')) {
      try {
        await supabase
          .from('user_reviews')
          .update({
            upvotes_count: newUp,
            downvotes_count: newDown,
          })
          .eq('id', id);
      } catch (err) {
        console.error('Failed to sync vote to supabase:', err);
      }
    }
  };

  const filteredItems = articles.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'gaming') return item.category.toLowerCase().includes('game') || item.category.toLowerCase().includes('critique');
    if (activeFilter === 'tech') return item.category.toLowerCase().includes('tech');
    if (activeFilter === 'anime') return item.category.toLowerCase().includes('anime');
    return true;
  });

  return (
    <section ref={sectionRef} className="py-6 sm:py-16 bg-[#030306] w-full flex justify-center border-t border-white/[0.06] relative overflow-hidden">
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

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl overflow-x-auto max-w-full scrollbar-none">
            {(['all', 'gaming', 'tech', 'anime'] as const).map((filter) => {
              const labels = {
                all: 'All Stories',
                gaming: '🎮 Gaming',
                tech: '⚡ Tech',
                anime: '⛩️ Anime',
              };
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 sm:px-4 py-1.5 rounded-full font-mono text-[11px] font-semibold whitespace-nowrap transition-all duration-200 border-none cursor-pointer ${
                    activeFilter === filter
                      ? 'bg-white text-black shadow-[0_2px_10px_rgba(255,255,255,0.3)] font-bold'
                      : 'bg-transparent text-white/60 hover:text-white'
                  }`}
                >
                  {labels[filter]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Leaderboard Feed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredItems.map((item, index) => {
            const v = votes[item.id] || { up: item.upvotes, down: item.downvotes, userVote: null };
            const netKarma = v.up - v.down;
            const currentLifetimeUp = item.creator.totalUpvotes + (v.up - item.upvotes);
            const isJoined = joinedCreators[item.creator.name];

            const isMobileSpotlight = isMobile && index === mobileActiveIndex;

            return (
              <div
                key={item.id}
                className={`community-card-item scroll-reveal-card group relative p-3 sm:p-5 rounded-[16px] sm:rounded-[22px] bg-[#09090f]/80 backdrop-blur-xl border transition-all duration-300 flex flex-col justify-between gap-3 sm:gap-4 select-none ${
                  isMobileSpotlight
                    ? 'border-white/35 bg-[#0f0f18]/90 shadow-[0_12px_35px_rgba(0,0,0,0.85)] -translate-y-1 ring-1 ring-white/20'
                    : 'border-white/[0.08] hover:border-white/25 hover:bg-[#0c0c14]/90 shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.8)] hover:-translate-y-1'
                }`}
              >
                {/* Creator Header Profile Bar */}
                <div className="flex items-center justify-between gap-2.5 pb-2.5 border-b border-white/[0.06]">
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
                  <div className="relative w-full sm:w-[130px] h-[120px] xs:h-[135px] sm:h-[105px] rounded-[12px] sm:rounded-[16px] overflow-hidden flex-shrink-0 bg-[#050508] border border-white/15 shadow-inner">
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

                    <Link href={item.link} className="block group/title">
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
                      href={item.link}
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

        {/* Leaderboard CTA Banner */}
        <div className="scroll-reveal mt-8 sm:mt-12 p-4 sm:p-7 rounded-[18px] sm:rounded-[24px] bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent border border-white/[0.08] backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-white/60 font-semibold">
              Join the Editorial Guild
            </span>
            <h4 className="font-display font-bold text-base sm:text-lg text-white mt-0.5">
              Publish critical reviews. Climb the verified creator leaderboard.
            </h4>
          </div>
          <Link
            href="/reviews"
            className="btn-editorial-primary px-5 py-2.5 text-xs font-bold text-white no-underline text-center shrink-0 self-start sm:self-auto"
          >
            <span>Write a Review</span>
            <span>→</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
