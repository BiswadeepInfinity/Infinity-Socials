'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChannelsSidebar from '@/components/ChannelsSidebar';
import ChannelPostCard from '@/components/ChannelPostCard';
import CreatePostModal from '@/components/CreatePostModal';
import CreateChannelModal from '@/components/CreateChannelModal';
import { useChannelsStore } from '@/lib/channels-store';
import { 
  Flame, 
  TrendingUp, 
  Clock, 
  Plus, 
  Search,
  MessageSquare,
  RotateCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ChannelsPage() {
  const { posts, channels } = useChannelsStore();
  const [filterSort, setFilterSort] = useState<'hot' | 'new' | 'top'>('hot');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshFeed = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Feed refreshed with latest takes');
    }, 500);
  };

  // Top upvoted article forums
  const topUpvotedArticleForums = [...posts]
    .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes))
    .slice(0, 5);

  // Filtered and sorted posts
  const filteredPosts = posts
    .filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag ? post.flair === selectedTag : true;
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (filterSort === 'hot') {
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      }
      if (filterSort === 'new') {
        return b.id.localeCompare(a.id);
      }
      return b.upvotes - a.upvotes;
    });

  const allFlairs = Array.from(
    new Set(posts.map((p) => p.flair).filter(Boolean))
  ) as string[];

  return (
    <div className="min-h-screen bg-[#040408] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Sleek Minimalist Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-8 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1.5 font-mono text-[10px] sm:text-[11px] text-zinc-500 uppercase tracking-widest font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Channels</span>
              <span>•</span>
              <span className="text-zinc-400">Pop Culture Debates</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
              Community Discussions & Theories
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-light mt-1 max-w-xl leading-relaxed">
              Explore article-derived deep dives, vote on community hot takes, and earn verified commenter flairs.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <button
              onClick={handleRefreshFeed}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-sm"
              title="Refresh feed"
            >
              <RotateCw className={`w-3.5 h-3.5 text-zinc-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Updating...' : 'Refresh'}</span>
            </button>

            <button
              onClick={() => setIsCreatePostOpen(true)}
              className="px-4 py-2 rounded-xl bg-white text-black font-display font-bold text-xs hover:bg-zinc-200 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.2)] cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start Discussion</span>
            </button>
          </div>
        </div>

        {/* 3-Column Modern Reddit/Linear Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* Left Navigation Sidebar */}
          <ChannelsSidebar onOpenCreateChannel={() => setIsCreateChannelOpen(true)} />

          {/* Main Feed Content Area */}
          <section className="flex-1 min-w-0 w-full flex flex-col gap-4">
            
            {/* Sorting & Search Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-2 sm:p-2.5 rounded-2xl bg-[#090910]/90 border border-white/[0.08] backdrop-blur-xl">
              
              {/* Sort Pill Toggles */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFilterSort('hot')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    filterSort === 'hot'
                      ? 'bg-white/[0.1] text-white border border-white/[0.15] font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>Hot</span>
                </button>

                <button
                  onClick={() => setFilterSort('new')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    filterSort === 'new'
                      ? 'bg-white/[0.1] text-white border border-white/[0.15] font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>New</span>
                </button>

                <button
                  onClick={() => setFilterSort('top')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    filterSort === 'top'
                      ? 'bg-white/[0.1] text-white border border-white/[0.15] font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                  <span>Top</span>
                </button>
              </div>

              {/* Search in discussions */}
              <div className="relative flex-1 max-w-xs min-w-[180px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search debates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            {/* Tag Filter Bar */}
            {allFlairs.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-2.5 py-1 rounded-lg border transition-colors whitespace-nowrap cursor-pointer text-xs font-mono ${
                    selectedTag === null
                      ? 'bg-white/[0.1] text-white border-white/20 font-bold'
                      : 'bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:border-white/15'
                  }`}
                >
                  All
                </button>
                {allFlairs.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                    className={`px-2.5 py-1 rounded-lg border transition-colors whitespace-nowrap cursor-pointer text-xs font-mono ${
                      selectedTag === tag
                        ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 font-bold'
                        : 'bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:border-white/15'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* Posts Stream */}
            <div className="flex flex-col gap-3.5">
              {filteredPosts.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-[#090910]/80 border border-white/[0.08]">
                  <MessageSquare className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-zinc-300">No discussions found</h3>
                  <p className="text-xs text-zinc-500 mt-1 mb-3">
                    Start the first conversation in this topic.
                  </p>
                  <button
                    onClick={() => setIsCreatePostOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors"
                  >
                    Start Discussion
                  </button>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <ChannelPostCard key={post.id} post={post} />
                ))
              )}
            </div>
          </section>

          {/* Right Panel: Trending & Communities */}
          <aside className="hidden xl:flex flex-col gap-4 w-72 flex-shrink-0 select-none">
            
            {/* Most Upvoted Forums Box */}
            <div className="bg-[#090910]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between gap-2 mb-3 px-1">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                    Trending Debates
                  </h3>
                </div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase">Karma</span>
              </div>

              <div className="flex flex-col gap-1.5">
                {topUpvotedArticleForums.map((p, idx) => {
                  const chSlug = channels.find((c) => c.id === p.channel_id)?.slug || 'gaming';
                  return (
                    <Link
                      key={p.id}
                      href={`/channels/${chSlug}/${p.id}`}
                      className="group p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-white/[0.12] transition-all flex items-start gap-2.5 no-underline"
                    >
                      <span className="font-mono text-xs font-bold text-zinc-500 group-hover:text-white w-3.5 pt-0.5 shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                          {p.title}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mt-1">
                          <span className="text-zinc-400">{p.flair}</span>
                          <span className="font-bold text-orange-400/90">▲ {p.upvotes}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Channels Directory */}
            <div className="bg-[#090910]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 shadow-lg">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-3 px-1">
                Channels
              </div>

              <div className="flex flex-col gap-1.5">
                {channels.map((ch) => (
                  <Link
                    key={ch.id}
                    href={`/channels/${ch.slug}`}
                    className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-white/[0.04] transition-colors no-underline group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ch.avatar_url}
                        alt={ch.name}
                        className="w-5 h-5 rounded-full object-cover border border-white/10 flex-shrink-0"
                      />
                      <span className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors truncate">
                        r/{ch.slug}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                      {ch.member_count.toLocaleString()}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </main>

      <Footer />

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
      />
      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
      />
    </div>
  );
}
