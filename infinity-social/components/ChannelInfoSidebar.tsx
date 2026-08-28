'use client';

import React from 'react';
import { Channel } from '@/types/database';
import { useChannelsStore } from '@/lib/channels-store';
import { 
  Users, 
  Eye, 
  MessageSquareQuote, 
  Calendar, 
  ShieldAlert, 
  Lock, 
  Globe, 
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ChannelInfoSidebarProps {
  channel: Channel;
  onOpenCreatePost?: () => void;
}

export default function ChannelInfoSidebar({ channel, onOpenCreatePost }: ChannelInfoSidebarProps) {
  const { subscribedChannelIds, joinChannel, leaveChannel } = useChannelsStore();
  const isSubscribed = subscribedChannelIds.includes(channel.id);

  const toggleJoin = () => {
    if (isSubscribed) {
      leaveChannel(channel.id);
      toast.success(`Left r/${channel.slug}`);
    } else {
      joinChannel(channel.id);
      toast.success(`Joined r/${channel.slug}!`);
    }
  };

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-5">
      {/* About Community Card */}
      <div className="bg-[#0a0a10]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {/* Banner header accent */}
        <div className="h-16 bg-gradient-to-r from-cyan-600/30 via-purple-600/20 to-pink-600/30 border-b border-white/10 p-3 flex items-end">
          <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-300">
            About Community
          </span>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={channel.avatar_url}
              alt={channel.name}
              className="w-12 h-12 rounded-xl object-cover border border-white/15 shadow-md"
            />
            <div>
              <h3 className="font-bold text-white text-base leading-tight">
                {channel.name}
              </h3>
              <div className="text-xs text-cyan-400 font-mono">r/{channel.slug}</div>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-zinc-300 leading-relaxed">
            {channel.description}
          </p>

          {/* Stats Grid (Weekly visitors, Weekly contributions) */}
          <div className="grid grid-cols-2 gap-2 py-3 px-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
            <div>
              <div className="text-sm font-bold text-white">
                {channel.member_count.toLocaleString()}
              </div>
              <div className="text-[10px] text-zinc-400 font-medium">Members</div>
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {channel.weekly_visitors.toLocaleString()}
              </div>
              <div className="text-[10px] text-zinc-400 font-medium">Weekly visitors</div>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex flex-col gap-2 text-xs text-zinc-400 border-t border-white/5 pt-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>Created {new Date(channel.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>

            <div className="flex items-center gap-2">
              {channel.is_restricted ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Restricted community</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Public community</span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 mt-2">
            {onOpenCreatePost && (
              <button
                onClick={onOpenCreatePost}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold text-xs transition-all shadow-lg shadow-cyan-500/20"
              >
                <Plus className="w-4 h-4" /> Create Post
              </button>
            )}

            <button
              onClick={toggleJoin}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all border ${
                isSubscribed
                  ? 'border-white/20 bg-white/5 hover:bg-red-500/20 hover:border-red-500/40 text-zinc-200 hover:text-red-300'
                  : 'border-cyan-400/40 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300'
              }`}
            >
              {isSubscribed ? 'Joined' : 'Join Community'}
            </button>
          </div>
        </div>
      </div>

      {/* Rules Widget */}
      {channel.rules && channel.rules.length > 0 && (
        <div className="bg-[#0a0a10]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              r/{channel.slug} Rules
            </h4>
          </div>

          <ol className="list-decimal list-inside space-y-2 text-xs text-zinc-400">
            {channel.rules.map((rule, idx) => (
              <li key={idx} className="leading-normal">
                <span className="text-zinc-200 font-medium">{rule}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </aside>
  );
}
