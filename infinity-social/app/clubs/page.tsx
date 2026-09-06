'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useChannelsStore } from '@/lib/channels-store';
import { useAuth } from '@/components/AuthProvider';
import ChannelPostCard from '@/components/ChannelPostCard';
import DigitalEventCard from '@/components/DigitalEventCard';
import FoundClubModal from '@/components/FoundClubModal';
import { 
  Shield, 
  Crown, 
  Handshake, 
  Calendar, 
  Sparkles, 
  Plus, 
  Users, 
  Layers, 
  Flame, 
  Scroll, 
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClubsPage() {
  const { user } = useAuth();
  const { clubs, societies, pacts, events, posts, subscribedClubIds, joinClub, leaveClub } = useChannelsStore();

  const [activeTab, setActiveTab] = useState<'clubs' | 'societies' | 'events' | 'feed'>('clubs');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFoundModalOpen, setIsFoundModalOpen] = useState(false);

  // Filtered clubs
  const filteredClubs = clubs.filter((c) => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filtered digital events
  const filteredEvents = events.filter((ev) => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Gaming') return ev.category === 'game';
    if (selectedCategory === 'Anime') return ev.category === 'anime';
    if (selectedCategory === 'Pop Culture') return ev.category === 'movie';
    if (selectedCategory === 'Tech') return ev.category === 'tech';
    return true;
  });

  const categories = ['All', 'Gaming', 'Anime', 'Pop Culture', 'Tech'];

  return (
    <div className="min-h-screen bg-[#07070d] text-zinc-100 pt-24 pb-20 selection:bg-cyan-500 selection:text-black">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Header with Liquid Glass Styling */}
        <div className="ios-glass-card relative rounded-3xl overflow-hidden p-6 sm:p-10 shadow-2xl">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-mono text-cyan-300 backdrop-blur-md">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>CLUBS • DISCUSSIONS • GRAND SOCIETIES</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display text-white">
              Clubs & Grand Societies
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
              Found your club, define custom Discord-style roles, host digital watchparties & event nights, or sign mutual alliance treaties to establish prestigious multi-club Societies.
            </p>

            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <button
                onClick={() => setIsFoundModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_4px_20px_rgba(6,182,212,0.35)] cursor-pointer transition-all active:scale-95"
              >
                <Crown className="w-4 h-4" />
                <span>Found a Club</span>
              </button>

              <button
                onClick={() => setActiveTab('societies')}
                className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-semibold text-purple-300 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Handshake className="w-4 h-4" />
                <span>View Grand Societies ({societies.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('events')}
                className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-semibold text-cyan-300 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Digital Events ({events.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Navigation Tabs & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveTab('clubs')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'clubs'
                  ? 'bg-white/10 text-white border border-white/15'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Clubs ({clubs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('societies')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'societies'
                  ? 'bg-white/10 text-white border border-white/15'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Building2Icon className="w-3.5 h-3.5" />
              <span>Grand Societies ({societies.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-white/10 text-white border border-white/15'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Events ({events.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('feed')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'feed'
                  ? 'bg-white/10 text-white border border-white/15'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Alliance Feed</span>
            </button>
          </div>

          {/* Search bar */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search clubs, tags, events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* TAB 1: CLUBS DIRECTORY */}
        {activeTab === 'clubs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => {
              const isJoined = subscribedClubIds.includes(club.id);
              const society = societies.find((s) => s.id === club.society_id);

              return (
                <div
                  key={club.id}
                  className="ios-glass-card rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xl group"
                >
                  {/* Club Banner */}
                  <div className="relative h-32 w-full bg-black/60 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={club.banner_url}
                      alt={club.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#040406] via-black/40 to-transparent" />

                    {/* Club Tag Top Right */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-black/75 border border-white/20 font-mono font-black text-xs text-white backdrop-blur-md shadow-sm">
                      [{club.tag}]
                    </div>

                    {/* Club Level Top Left */}
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold backdrop-blur-md">
                      LVL {club.level} • {club.xp.toLocaleString()} XP
                    </div>
                  </div>

                  {/* Club Body */}
                  <div className="p-5 pt-0 relative flex-1 flex flex-col justify-between">
                    <div>
                      {/* Avatar */}
                      <div className="-mt-9 mb-3 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={club.avatar_url}
                          alt={club.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-[#090912] shadow-xl bg-black"
                        />
                      </div>

                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/clubs/${club.slug}`}>
                          <h2 className="text-lg font-bold text-white hover:text-cyan-300 transition-colors">
                            {club.name}
                          </h2>
                        </Link>
                      </div>

                      <p className="text-xs font-mono text-zinc-400 mb-2">
                        &quot;{club.motto}&quot;
                      </p>

                      <p className="text-xs text-zinc-400/90 line-clamp-2 leading-relaxed mb-3">
                        {club.description}
                      </p>

                      {/* Allied Society line if allied */}
                      {society && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-3">
                          <Handshake className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Part of</span>
                          <span className="text-zinc-200 font-medium">
                            {society.name}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-500">[{society.tag}]</span>
                        </div>
                      )}

                      {/* Custom Roles preview as subtle text pills */}
                      {club.custom_roles.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap mb-4">
                          {club.custom_roles.slice(0, 3).map((role) => (
                            <span
                              key={role.id}
                              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-300 border border-white/[0.06]"
                            >
                              {role.icon} {role.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer: Clean inline stats & action button */}
                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                      <div className="text-xs font-mono">
                        <span className="text-zinc-300 font-semibold">{club.member_count}</span>
                        <span className="text-zinc-500">/{club.member_limit} members</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/clubs/${club.slug}`}
                          className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 text-zinc-300 text-xs font-medium transition-colors"
                        >
                          View Club
                        </Link>

                        <button
                          onClick={() => {
                            if (isJoined) {
                              leaveClub(club.id, user?.id);
                              toast.success(`Left [${club.tag}] ${club.name}`);
                            } else {
                              const success = joinClub(club.id, user ? {
                                id: user.id,
                                username: user.email?.split('@')[0] || 'member',
                                display_name: user.email?.split('@')[0] || 'Club Member',
                                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
                              } : undefined);
                              if (success) {
                                toast.success(`Joined [${club.tag}] ${club.name}!`);
                              } else {
                                toast.error('Club is at max capacity.');
                              }
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            isJoined
                              ? 'text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]'
                              : 'text-white bg-white/10 hover:bg-white/20 border border-white/10'
                          }`}
                        >
                          {isJoined ? 'Joined' : 'Join'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: GRAND SOCIETIES (Federated Multi-Club Treaties) */}
        {activeTab === 'societies' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl border border-purple-500/30 bg-gradient-to-r from-[#140e26] via-[#0b0816] to-[#07060f]">
              <div className="flex items-center gap-3 mb-2">
                <Building2Icon className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                  Grand Societies (Multi-Club Alliances)
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
                When top-tier clubs sign mutual treaties, they establish a permanent Society. Societies unlock joint summits, combined member pools, federated live streams, and prestige leaderboards.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {societies.map((society) => {
                const alliedClubs = clubs.filter((c) => society.member_club_ids.includes(c.id));
                const alliedPacts = pacts.filter((p) => p.society_id === society.id);

                return (
                  <div
                    key={society.id}
                    className="p-6 rounded-3xl border border-purple-500/20 bg-[#090714] backdrop-blur-xl space-y-5 shadow-2xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={society.crest_url}
                            alt={society.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-purple-500/40 shadow-lg"
                          />
                          <div>
                            <span className="font-mono text-[10px] text-purple-400 font-bold uppercase tracking-wider block">
                              LEVEL {society.level} • {society.xp.toLocaleString()} PRESTIGE XP
                            </span>
                            <h3 className="text-lg font-bold text-white leading-tight">
                              [{society.tag}] {society.name}
                            </h3>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 border border-purple-500/40 text-purple-300">
                          {alliedClubs.length} Allied Clubs
                        </span>
                      </div>

                      <p className="text-xs font-mono text-zinc-400 italic mt-2">
                        &quot;{society.motto}&quot;
                      </p>

                      <p className="text-xs text-zinc-300 leading-relaxed mt-2">
                        {society.description}
                      </p>

                      {/* Signatory Member Clubs */}
                      <div className="mt-4 pt-3 border-t border-white/[0.08] space-y-2">
                        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                          Signatory Member Clubs:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {alliedClubs.map((club) => (
                            <Link
                              key={club.id}
                              href={`/clubs/${club.slug}`}
                              className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 flex items-center gap-2.5 transition-colors"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={club.avatar_url} alt={club.name} className="w-7 h-7 rounded-lg object-cover" />
                              <div className="min-w-0">
                                <span className="font-bold text-white text-xs block truncate">[{club.tag}] {club.name}</span>
                                <span className="font-mono text-[10px] text-zinc-400">{club.member_count} members</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Treaty Charter Clauses */}
                      <div className="mt-4 p-3.5 rounded-2xl bg-black/40 border border-purple-500/20 space-y-2">
                        <span className="text-[10px] font-mono uppercase text-purple-300 font-bold flex items-center gap-1.5">
                          <Scroll className="w-3.5 h-3.5" /> Mutual Treaty Charter Terms
                        </span>
                        <ul className="space-y-1.5 text-xs text-zinc-400">
                          {society.treaty_charter.map((clause, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-purple-400 font-bold font-mono">§{idx + 1}</span>
                              <span>{clause}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400 font-mono">
                      <span>Status: ACTIVE MUTUAL ALLIANCE</span>
                      <span className="text-purple-300">Summits Open</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: DIGITAL EVENTS CALENDAR */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl border border-cyan-500/20 bg-[#090d16] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  <span>Scheduled Club Digital Events</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  RSVP to live raid streams, anime watchparties, cinema deep dives, and developer keynote discussions.
                </p>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold shrink-0">
                Live Timers Active ⏱️
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((ev) => (
                <DigitalEventCard key={ev.id} event={ev} />
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ALLIANCE FEED (Posts & Discussions) */}
        {activeTab === 'feed' && (
          <div className="space-y-4 max-w-3xl mx-auto">
            {posts.map((post) => (
              <ChannelPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Found Club Modal */}
      <FoundClubModal
        isOpen={isFoundModalOpen}
        onClose={() => setIsFoundModalOpen(false)}
      />
    </div>
  );
}

function Building2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v8" />
      <path d="M18 9h2a2 2 0 0 1 2 2v11" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}