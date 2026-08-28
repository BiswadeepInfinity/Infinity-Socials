'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useChannelsStore } from '@/lib/channels-store';
import { 
  Flame, 
  Compass, 
  Plus, 
  Gamepad2, 
  Film, 
  Tv, 
  Cpu
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
    <aside className="w-full lg:w-60 flex-shrink-0 flex flex-col gap-5 select-none text-xs">
      
      {/* Unified Minimalist Sidebar Box */}
      <div className="bg-[#090910]/90 border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-6 backdrop-blur-xl shadow-lg">
        
        {/* Feeds Section */}
        <div>
          <div className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase px-2 mb-2">
            Feeds
          </div>
          <div className="flex flex-col gap-1">
            <Link
              href="/channels"
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl font-medium transition-all ${
                pathname === '/channels'
                  ? 'bg-white/[0.08] text-white border border-white/[0.12] shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Trending & Hot</span>
            </Link>

            <Link
              href="/channels"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-all"
            >
              <Compass className="w-3.5 h-3.5 text-zinc-400" />
              <span>All Discussions</span>
            </Link>
          </div>
        </div>

        {/* Subscribed Communities */}
        <div className="pt-4 border-t border-white/[0.06]">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase">
              Your Channels
            </span>
            {onOpenCreateChannel && (
              <button
                onClick={onOpenCreateChannel}
                className="text-zinc-400 hover:text-white transition-colors p-0.5 rounded hover:bg-white/10"
                title="Create new channel"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1">
            {subscribedChannels.length === 0 ? (
              <div className="px-2 py-1 text-zinc-500 font-mono text-[11px]">
                No joined channels.
              </div>
            ) : (
              subscribedChannels.map((channel) => {
                const isActive = pathname === `/channels/${channel.slug}`;
                return (
                  <Link
                    key={channel.id}
                    href={`/channels/${channel.slug}`}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-white/[0.08] text-white border border-white/[0.12] font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={channel.avatar_url}
                      alt={channel.name}
                      className="w-4 h-4 rounded-full object-cover border border-white/10"
                    />
                    <span className="truncate">r/{channel.slug}</span>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Topic Categories */}
        <div className="pt-4 border-t border-white/[0.06]">
          <div className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase px-2 mb-2">
            Categories
          </div>
          <div className="flex flex-col gap-1">
            <Link
              href="/channels/gaming"
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-all"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Gaming</span>
            </Link>
            <Link
              href="/channels/anime"
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-all"
            >
              <Tv className="w-3.5 h-3.5 text-zinc-400" />
              <span>Anime & Manga</span>
            </Link>
            <Link
              href="/channels/cinema"
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-all"
            >
              <Film className="w-3.5 h-3.5 text-zinc-400" />
              <span>Cinema & TV</span>
            </Link>
            <Link
              href="/channels/tech"
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-all"
            >
              <Cpu className="w-3.5 h-3.5 text-zinc-400" />
              <span>Hardware & Tech</span>
            </Link>
          </div>
        </div>

      </div>

    </aside>
  );
}
