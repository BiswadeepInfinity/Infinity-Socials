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
  ExternalLink,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ChannelPostCardProps {
  post: ChannelPost;
  channelSlug?: string;
  isDetailed?: boolean;
  hideArticlePreview?: boolean;
}

export default function ChannelPostCard({ 
  post, 
  channelSlug, 
  isDetailed = false,
  hideArticlePreview = false 
}: ChannelPostCardProps) {
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
                className="font-semibold text-zinc-300 hover:text-white transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                r/{channel.slug}
              </Link>
            )}

            <span className="text-zinc-600">•</span>
            
            <div className="flex items-center gap-1.5">
              <span>by</span>
              <span className="text-zinc-200 font-medium hover:underline cursor-pointer">
                u/{post.author_username}
              </span>
              
              {/* Single Badge to prevent clutter */}
              {post.author_badges?.[0] && (
                <ChannelBadge type={post.author_badges[0]} size="sm" />
              )}
            </div>

            <span className="text-zinc-600">•</span>
            <span className="text-zinc-500 font-mono text-[11px]">{post.created_at}</span>

            {post.is_pinned && (
              <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase">
                PINNED
              </span>
            )}
          </div>

          {/* Post Title */}
          {isDetailed ? (
            <h1 className="text-xl md:text-2xl font-bold text-white mb-2 leading-snug tracking-tight">
              {post.title}
            </h1>
          ) : (
            <Link href={`/channels/${currentSlug}/${post.id}`} className="group block mb-1.5">
              <h2 className="text-base sm:text-lg font-bold text-zinc-100 group-hover:text-cyan-300 transition-colors leading-snug">
                {post.title}
              </h2>
            </Link>
          )}

          {/* Post Flair */}
          {post.flair && (
            <div className="mb-2.5">
              <span className="inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/[0.06] text-zinc-300 border border-white/[0.06]">
                {post.flair}
              </span>
            </div>
          )}

          {/* Post Body Text */}
          <div
            className={`text-zinc-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
              !isDetailed && 'line-clamp-3'
            }`}
          >
            {post.content}
          </div>

          {/* Linked Source Article Cinema Window (High-end Media Bar) */}
          {post.article_slug && !hideArticlePreview && (
            <Link
              href={`/articles/${post.article_slug}`}
              className="mt-3.5 group/article flex flex-col sm:flex-row items-stretch gap-3 p-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/[0.08] hover:border-white/20 transition-all duration-200 shadow-md no-underline overflow-hidden relative"
            >
              {/* Widescreen Thumbnail */}
              <div className="relative w-full sm:w-[130px] h-[80px] rounded-lg overflow-hidden bg-black shrink-0 border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.article_thumbnail || post.media_url || '/placeholder.png'}
                  alt={post.article_title || 'Article cover'}
                  className="w-full h-full object-cover group-hover/article:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover/article:bg-transparent transition-colors" />

                {post.article_score && (
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 border border-white/20 text-[9px] font-mono font-bold text-amber-300 backdrop-blur-sm">
                    ★ {post.article_score}
                  </div>
                )}
              </div>

              {/* Text Info */}
              <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                <div>
                  <div className="flex items-center gap-1.5 mb-1 font-mono text-[9px] text-zinc-400 uppercase tracking-wider">
                    <span>{post.article_category || 'Article'}</span>
                    <span>•</span>
                    <span>{post.article_read_time || 'Read'}</span>
                  </div>
                  <h4 className="font-display font-semibold text-xs sm:text-sm text-zinc-200 group-hover/article:text-white transition-colors line-clamp-1 leading-snug">
                    {post.article_title || post.title}
                  </h4>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 font-semibold group-hover/article:translate-x-0.5 transition-transform">
                  <span>Read Article & Watch Video</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          )}

          {/* Optional Media Image */}
          {post.media_url && !post.article_slug && (
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
          {post.link_url && !post.article_slug && (
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
