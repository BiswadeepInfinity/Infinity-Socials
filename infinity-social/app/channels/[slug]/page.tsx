'use client';

import React, { useState, use } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChannelsSidebar from '@/components/ChannelsSidebar';
import ChannelInfoSidebar from '@/components/ChannelInfoSidebar';
import ChannelPostCard from '@/components/ChannelPostCard';
import CreatePostModal from '@/components/CreatePostModal';
import CreateChannelModal from '@/components/CreateChannelModal';
import { useChannelsStore } from '@/lib/channels-store';
import { 
  Flame, 
  Clock, 
  TrendingUp, 
  Plus, 
  Search, 
  MessageSquare,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default function ChannelDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const { channels, posts } = useChannelsStore();
  const [filterSort, setFilterSort] = useState<'hot' | 'new' | 'top'>('hot');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);

  const currentChannel = channels.find(
    (c) => c.slug.toLowerCase() === resolvedParams.slug.toLowerCase()
  );

  if (!currentChannel) {
    return notFound();
  }

  const channelPosts = posts
    .filter((p) => p.channel_id === currentChannel.id)
    .filter((p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (filterSort === 'hot') {
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      }
      if (filterSort === 'new') {
        return b.id.localeCompare(a.id);
      }
      return b.upvotes - a.upvotes;
    });

  return (
    <div className="min-h-screen bg-[#040408] text-white flex flex-col">
      <Navbar />

      {/* Channel Header Banner */}
      {currentChannel.banner_url && (
        <div className="w-full h-40 md:h-52 relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentChannel.banner_url}
            alt={currentChannel.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#040408] via-transparent to-transparent" />
        </div>
      )}

      {/* Channel Title & Stats Bar */}
      <div className="bg-[#08080e] border-b border-white/10 pb-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-4 -mt-8 md:-mt-10 relative z-10">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentChannel.avatar_url}
              alt={currentChannel.name}
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover border-2 border-white/20 shadow-2xl bg-black"
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
                {currentChannel.name}
              </h1>
              <div className="text-xs md:text-sm text-cyan-400 font-mono">
                r/{currentChannel.slug}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreatePostOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs transition-all shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" /> Create Discussion
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Navigation Sidebar */}
          <ChannelsSidebar onOpenCreateChannel={() => setIsCreateChannelOpen(true)} />

          {/* Main Feed Content Area */}
          <section className="flex-1 min-w-0 w-full flex flex-col gap-5">
            {/* Sorting Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#0a0a10]/80 border border-white/10 backdrop-blur-xl">
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

              <div className="relative flex-1 max-w-xs min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder={`Search in r/${currentChannel.slug}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Channel Posts */}
            <div className="flex flex-col gap-4">
              {channelPosts.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-[#0a0a10]/50 border border-white/10">
                  <MessageSquare className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-zinc-300">
                    No discussions in r/{currentChannel.slug} yet
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 mb-4">
                    Kickstart the discussion and share your thoughts!
                  </p>
                  <button
                    onClick={() => setIsCreatePostOpen(true)}
                    className="px-4 py-2 rounded-xl bg-cyan-400 text-black text-xs font-bold hover:bg-cyan-300"
                  >
                    Post First Thread
                  </button>
                </div>
              ) : (
                channelPosts.map((post) => (
                  <ChannelPostCard
                    key={post.id}
                    post={post}
                    channelSlug={currentChannel.slug}
                  />
                ))
              )}
            </div>
          </section>

          {/* Right Community Metadata Sidebar (Screenshot 1) */}
          <ChannelInfoSidebar
            channel={currentChannel}
            onOpenCreatePost={() => setIsCreatePostOpen(true)}
          />
        </div>
      </main>

      <Footer />

      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        defaultChannelId={currentChannel.id}
      />
      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
      />
    </div>
  );
}
