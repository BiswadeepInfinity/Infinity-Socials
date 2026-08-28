'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChannelPost } from '@/types/database';
import { useChannelsStore } from '@/lib/channels-store';
import ChannelBadge from '@/components/ChannelBadge';
import { 
  ArrowBigUp, 
  ArrowBigDown, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Pin,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ChannelPostCardProps {
  post: ChannelPost;
  channelSlug?: string;
  isDetailed?: boolean;
}

export default function ChannelPostCard({ post, channelSlug, isDetailed = false }: ChannelPostCardProps) {
  const { votePost, channels } = useChannelsStore();
  const [saved, setSaved] = useState(false);

  const channel = channels.find((c) => c.id === post.channel_id);
  const score = post.upvotes - post.downvotes;
  const currentSlug = channelSlug || channel?.slug || 'all';

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/channels/${currentSlug}/${post.id}`;
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
    toast.success(saved ? 'Removed from saved' : 'Post saved!');
  };

  return (
    <article
      className={`rounded-2xl transition-all duration-200 border bg-[#0a0a10]/80 backdrop-blur-xl ${
        isDetailed
          ? 'border-white/15 p-6'
          : 'border-white/10 hover:border-white/20 p-5 hover:bg-[#0e0e16]/90'
      }`}
      style={{
        boxShadow: '0 4px 24px -2px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div className="flex items-start gap-4">
        {/* Left Voting Column (Reddit Style) */}
        <div className="flex flex-col items-center bg-white/[0.03] border border-white/5 rounded-xl p-1.5 min-w-[42px] select-none">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              votePost(post.id, 'up');
            }}
            className={`p-1 rounded-lg transition-colors ${
              post.user_vote === 'up'
                ? 'text-orange-500 bg-orange-500/10'
                : 'text-zinc-400 hover:text-orange-400 hover:bg-white/5'
            }`}
            title="Upvote"
            aria-label="Upvote"
          >
            <ArrowBigUp className="w-6 h-6 fill-current" />
          </button>

          <span
            className={`text-xs font-bold my-0.5 tracking-tight ${
              post.user_vote === 'up'
                ? 'text-orange-500 font-extrabold'
                : post.user_vote === 'down'
                ? 'text-indigo-400 font-extrabold'
                : 'text-zinc-300'
            }`}
          >
            {score}
          </span>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              votePost(post.id, 'down');
            }}
            className={`p-1 rounded-lg transition-colors ${
              post.user_vote === 'down'
                ? 'text-indigo-400 bg-indigo-500/10'
                : 'text-zinc-400 hover:text-indigo-400 hover:bg-white/5'
            }`}
            title="Downvote"
            aria-label="Downvote"
          >
            <ArrowBigDown className="w-6 h-6 fill-current" />
          </button>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          {/* Post Header Meta */}
          <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-zinc-400">
            {channel && (
              <Link
                href={`/channels/${channel.slug}`}
                className="flex items-center gap-1.5 font-bold text-zinc-200 hover:text-white transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={channel.avatar_url}
                  alt={channel.name}
                  className="w-5 h-5 rounded-full object-cover border border-white/10"
                />
                <span>r/{channel.slug}</span>
              </Link>
            )}

            <span>•</span>
            
            <div className="flex items-center gap-1.5">
              <span>Posted by</span>
              <span className="text-zinc-300 font-medium hover:underline cursor-pointer">
                u/{post.author_username}
              </span>
              
              {/* Badges */}
              {post.author_badges?.map((badge) => (
                <ChannelBadge key={badge} type={badge} size="sm" />
              ))}
            </div>

            <span>•</span>
            <span className="text-zinc-500">{post.created_at}</span>

            {post.is_pinned && (
              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                <Pin className="w-3 h-3" /> PINNED
              </span>
            )}
          </div>

          {/* Post Title */}
          {isDetailed ? (
            <h1 className="text-xl md:text-2xl font-bold text-white mb-3 leading-snug tracking-tight">
              {post.title}
            </h1>
          ) : (
            <Link href={`/channels/${currentSlug}/${post.id}`} className="group block">
              <h2 className="text-lg font-bold text-zinc-100 group-hover:text-cyan-400 transition-colors mb-2 leading-snug">
                {post.title}
              </h2>
            </Link>
          )}

          {/* Post Flair */}
          {post.flair && (
            <div className="mb-3">
              <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-md bg-white/10 text-cyan-300 border border-white/10">
                {post.flair}
              </span>
            </div>
          )}

          {/* Post Body Text */}
          <div
            className={`text-zinc-300 text-sm md:text-[15px] leading-relaxed whitespace-pre-line ${
              !isDetailed && 'line-clamp-4'
            }`}
          >
            {post.content}
          </div>

          {/* Optional Media Image */}
          {post.media_url && (
            <div className="mt-4 rounded-xl overflow-hidden border border-white/10 bg-black/40 max-h-[500px] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.media_url}
                alt="Post attachment"
                className="w-full h-auto max-h-[500px] object-cover"
              />
            </div>
          )}

          {/* Optional Link Preview */}
          {post.link_url && (
            <a
              href={post.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/40 text-cyan-400 text-xs transition-colors"
            >
              <span className="truncate">{post.link_url}</span>
              <ExternalLink className="w-4 h-4 ml-2 flex-shrink-0" />
            </a>
          )}

          {/* Footer Action Bar */}
          <div className="flex items-center gap-2 md:gap-4 mt-4 pt-3 border-t border-white/5 text-xs text-zinc-400">
            <Link
              href={`/channels/${currentSlug}/${post.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 text-zinc-300 font-semibold transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>{post.comments_count} Comments</span>
            </Link>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 text-zinc-300 font-medium transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 font-medium transition-colors ${
                saved ? 'text-amber-400' : 'text-zinc-300'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
              <span>{saved ? 'Saved' : 'Save'}</span>
            </button>

            <button className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 ml-auto transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
