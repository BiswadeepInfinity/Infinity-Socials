'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ClubPost } from '@/types/database';
import { useChannelsStore } from '@/lib/channels-store';
import ClubBadge from '@/components/ChannelBadge';
import { 
  Flame, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Calendar,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ChannelPostCardProps {
  post: ClubPost;
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
  const { boostPost, clubs, societies, events } = useChannelsStore();
  const [saved, setSaved] = useState(false);

  const club = clubs.find((c) => c.id === post.club_id);
  const society = societies.find((s) => s.id === post.society_id);
  const linkedEvent = events.find((ev) => ev.id === post.event_id);
  const currentSlug = channelSlug || club?.slug || 'crucible';

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/clubs/${currentSlug}/${post.id}`;
      navigator.clipboard.writeText(url);
      toast.success('Club discussion link copied to clipboard!');
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
    toast.success(saved ? 'Removed from saved' : 'Topic saved to collection!');
  };

  const handleBoost = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    boostPost(post.id);
  };

  return (
    <article
      className={`ios-glass-card rounded-2xl transition-all duration-200 ${
        isDetailed
          ? 'p-6 sm:p-7'
          : 'p-4 sm:p-5 hover:bg-white/[0.02]'
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Left Boost Action */}
        <div className="flex flex-col items-center bg-white/[0.02] border border-white/[0.06] rounded-xl p-1 min-w-[38px] select-none shrink-0" title="Club Boost">
          <button
            onClick={handleBoost}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              post.user_boosted
                ? 'text-rose-400 bg-rose-500/10'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
            }`}
            title="Boost Topic"
            aria-label="Boost Topic"
          >
            <Flame className={`w-4 h-4 ${post.user_boosted ? 'fill-rose-400 stroke-rose-400' : 'stroke-[2]'}`} />
          </button>

          <span
            className={`text-xs font-mono font-medium my-0.5 ${
              post.user_boosted ? 'text-rose-400 font-bold' : 'text-zinc-400'
            }`}
          >
            {post.boosts}
          </span>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          {/* Post Header Meta */}
          <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-zinc-400">
            {club && (
              <Link
                href={`/clubs/${club.slug}`}
                className="font-medium text-zinc-200 hover:text-white transition-colors flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <span>{club.name}</span>
              </Link>
            )}

            {society && (
              <span className="font-mono text-[11px] text-zinc-500">
                • {society.name}
              </span>
            )}

            <span className="text-zinc-600">•</span>
            
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-zinc-400">by</span>
              <span className="text-zinc-200 font-bold hover:underline cursor-pointer">
                @{post.author_username}
              </span>

              {/* Hierarchy Rank and Custom Discord-Style Roles directly to the right */}
              <ClubBadge 
                rank={post.author_rank} 
                customRoles={post.author_custom_roles || []} 
                clubTag={post.author_club_tag || club?.tag} 
                size="xs" 
              />
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
            <Link href={`/clubs/${currentSlug}/${post.id}`} className="group block mb-1.5">
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

          {/* Linked Digital Event Pill */}
          {linkedEvent && (
            <div className="mb-3 p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-purple-950/20 to-black border border-cyan-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase font-bold text-cyan-300 block">
                    Guild Digital Event Scheduled
                  </span>
                  <p className="text-xs text-white truncate font-medium">{linkedEvent.title}</p>
                </div>
              </div>
              <span className="px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono text-[10px] shrink-0 font-bold">
                +{linkedEvent.xp_reward} XP
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

          {/* Linked Source Article Preview */}
          {post.article_slug && !hideArticlePreview && (
            <Link
              href={`/articles/${post.article_slug}`}
              className="mt-3.5 group/article flex flex-col sm:flex-row items-stretch gap-3 p-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/[0.08] hover:border-white/20 transition-all duration-200 shadow-md no-underline overflow-hidden relative"
            >
              <div className="relative w-full sm:w-[130px] h-[80px] rounded-lg overflow-hidden bg-black shrink-0 border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.article_thumbnail || post.media_url || '/placeholder.png'}
                  alt={post.article_title || 'Article cover'}
                  className="w-full h-full object-cover group-hover/article:scale-105 transition-transform duration-300"
                />
                {post.article_score && (
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 border border-white/20 text-[9px] font-mono font-bold text-amber-300 backdrop-blur-sm">
                    ★ {post.article_score}
                  </div>
                )}
              </div>

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

          {/* Footer Action Bar */}
          <div className="flex items-center gap-2 md:gap-4 mt-4 pt-3 border-t border-white/5 text-xs text-zinc-400">
            <Link
              href={`/clubs/${currentSlug}/${post.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 text-zinc-300 font-semibold transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>{post.comments_count} Discussions</span>
            </Link>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 text-zinc-300 font-medium transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 font-medium transition-colors cursor-pointer ${
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
