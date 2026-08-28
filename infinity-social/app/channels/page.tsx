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
  Sparkles, 
  TrendingUp, 
  Clock, 
  Plus, 
  Search,
  MessageSquare
} from 'lucide-react';

export default function ChannelsPage() {
  const { posts, channels } = useChannelsStore();
  const [filterSort, setFilterSort] = useState<'hot' | 'new' | 'top'>('hot');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);

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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Top Community Banner Header */}
        <div className="mb-8 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-blue-950/40 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 uppercase tracking-wider">
                  Reddit-Style Channels
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                Discussion Channels & Forums
              </h1>
              <p className="text-zinc-400 text-sm md:text-base mt-1 max-w-2xl">
                Explore dedicated topic communities, join nested deep-dive threads, earn Top 1% Commenter badges, and share your takes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCreatePostOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-sm transition-all shadow-lg shadow-cyan-500/25"
              >
                <Plus className="w-4 h-4" /> Create Post
              </button>
            </div>
          </div>
        </div>

        {/* 3-Column Reddit Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Navigation Sidebar */}
          <ChannelsSidebar onOpenCreateChannel={() => setIsCreateChannelOpen(true)} />

          {/* Main Feed Content Area */}
          <section className="flex-1 min-w-0 w-full flex flex-col gap-5">
            {/* Sorting & Search Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#0a0a10]/80 border border-white/10 backdrop-blur-xl">
              {/* Sort pill toggles */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setFilterSort('hot')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterSort === 'hot'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                  }`}
                >
                  <Flame className="w-4 h-4" /> Hot
                </button>

                <button
                  onClick={() => setFilterSort('new')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterSort === 'new'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                  }`}
                >
                  <Clock className="w-4 h-4" /> New
                </button>

                <button
                  onClick={() => setFilterSort('top')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterSort === 'top'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" /> Top
                </button>
              </div>

              {/* Search in discussions */}
              <div className="relative flex-1 max-w-xs min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Flair Filter Bar */}
            {allFlairs.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-zinc-500 text-[11px] font-semibold whitespace-nowrap">
                  Filter by tag:
                </span>
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-3 py-1 rounded-lg border transition-colors whitespace-nowrap ${
                    selectedTag === null
                      ? 'bg-white/15 text-white border-white/30 font-bold'
                      : 'bg-white/5 text-zinc-400 border-white/5 hover:border-white/15'
                  }`}
                >
                  All
                </button>
                {allFlairs.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                    className={`px-3 py-1 rounded-lg border transition-colors whitespace-nowrap ${
                      selectedTag === tag
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                        : 'bg-white/5 text-zinc-400 border-white/5 hover:border-white/15'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* Posts Stream */}
            <div className="flex flex-col gap-4">
              {filteredPosts.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-[#0a0a10]/50 border border-white/10">
                  <MessageSquare className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-zinc-300">No discussions found</h3>
                  <p className="text-xs text-zinc-500 mt-1 mb-4">
                    Be the first one to start a conversation!
                  </p>
                  <button
                    onClick={() => setIsCreatePostOpen(true)}
                    className="px-4 py-2 rounded-xl bg-cyan-400 text-black text-xs font-bold hover:bg-cyan-300"
                  >
                    Create Discussion
                  </button>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <ChannelPostCard key={post.id} post={post} />
                ))
              )}
            </div>
          </section>

          {/* Right Trending Communities Panel */}
          <aside className="hidden xl:flex flex-col gap-5 w-72 flex-shrink-0">
            <div className="bg-[#0a0a10]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Trending Communities
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                {channels.map((ch, idx) => (
                  <div key={ch.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-bold text-zinc-500 w-4">
                        {idx + 1}
                      </span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ch.avatar_url}
                        alt={ch.name}
                        className="w-7 h-7 rounded-full object-cover border border-white/10 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-200 truncate">
                          r/{ch.slug}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {ch.member_count.toLocaleString()} members
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievement Badges Guide Card */}
            <div className="bg-gradient-to-br from-cyan-950/30 to-purple-950/30 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 mb-2 flex items-center gap-1.5">
                <span>🪐</span> Community Badges
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Post thoughtful analyses, participate in discussions, and earn exclusive badges like{' '}
                <span className="text-cyan-300 font-bold">Top 1% Commenter</span> and community flairs!
              </p>
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
