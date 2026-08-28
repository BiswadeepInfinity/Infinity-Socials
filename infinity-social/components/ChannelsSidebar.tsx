'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useChannelsStore } from '@/lib/channels-store';
import { 
  Flame, 
  Compass, 
  TrendingUp, 
  PlusCircle, 
  Globe2, 
  Gamepad2, 
  Tv, 
  Cpu, 
  Sparkles,
  Bookmark
} from 'lucide-react';

interface ChannelsSidebarProps {
  onOpenCreateChannel?: () => void;
}

export default function ChannelsSidebar({ onOpenCreateChannel }: ChannelsSidebarProps) {
  const pathname = usePathname();
  const { channels, subscribedChannelIds } = useChannelsStore();

  const subscribedChannels = channels.filter((c) =>
    subscribedChannelIds.includes(c.id)
  );

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-6 select-none">
      {/* Feeds Section */}
      <div className="bg-[#0a0a10]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3">
        <div className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase px-3 py-1">
          FEEDS
        </div>
        <div className="flex flex-col gap-0.5 mt-1">
          <Link
            href="/channels"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
              pathname === '/channels'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-zinc-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Popular & Hot</span>
          </Link>

          <Link
            href="/channels/explore"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
              pathname === '/channels/explore'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-zinc-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Explore All</span>
          </Link>
        </div>
      </div>

      {/* Subscribed Communities */}
      <div className="bg-[#0a0a10]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3">
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
            YOUR COMMUNITIES
          </span>
          {onOpenCreateChannel && (
            <button
              onClick={onOpenCreateChannel}
              className="text-cyan-400 hover:text-cyan-300 transition-colors p-1"
              title="Create new channel"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1 mt-2 max-h-[280px] overflow-y-auto pr-1">
          {subscribedChannels.length === 0 ? (
            <div className="px-3 py-2 text-xs text-zinc-500">
              No joined channels yet.
            </div>
          ) : (
            subscribedChannels.map((channel) => {
              const isActive = pathname === `/channels/${channel.slug}`;
              return (
                <Link
                  key={channel.id}
                  href={`/channels/${channel.slug}`}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={channel.avatar_url}
                    alt={channel.name}
                    className="w-5 h-5 rounded-full object-cover border border-white/10 flex-shrink-0"
                  />
                  <span className="truncate">r/{channel.slug}</span>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Topics */}
      <div className="bg-[#0a0a10]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-3">
        <div className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase px-3 py-1">
          TOPICS
        </div>
        <div className="flex flex-col gap-0.5 mt-1 text-xs">
          <Link
            href="/channels/gaming"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-300 hover:bg-white/5 transition-colors"
          >
            <Gamepad2 className="w-4 h-4 text-purple-400" />
            <span>Gaming</span>
          </Link>
          <Link
            href="/channels/anime"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-300 hover:bg-white/5 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>Anime & Manga</span>
          </Link>
          <Link
            href="/channels/cinema"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-300 hover:bg-white/5 transition-colors"
          >
            <Tv className="w-4 h-4 text-amber-400" />
            <span>Cinema & TV</span>
          </Link>
          <Link
            href="/channels/tech"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-300 hover:bg-white/5 transition-colors"
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Tech & Setups</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
