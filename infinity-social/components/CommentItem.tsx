'use client';

import React, { useState } from 'react';
import { ChannelComment } from '@/types/database';
import { useChannelsStore } from '@/lib/channels-store';
import ChannelBadge from '@/components/ChannelBadge';
import { 
  ArrowBigUp, 
  ArrowBigDown, 
  MessageSquare, 
  Share2, 
  Sparkles, 
  ChevronDown, 
  ChevronRight,
  Pin,
  Send
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import toast from 'react-hot-toast';

interface CommentItemProps {
  comment: ChannelComment;
  postId: string;
  depth?: number;
  onVote?: (postId: string, commentId: string, type: 'up' | 'down') => void;
  onReply?: (postId: string, parentId: string | null, content: string, user: any) => void;
}

export default function CommentItem({ comment, postId, depth = 0, onVote, onReply }: CommentItemProps) {
  const { user, profile } = useAuth();
  const { voteComment, addComment } = useChannelsStore();
  const [collapsed, setCollapsed] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const score = comment.upvotes - comment.downvotes;
  const hasReplies = comment.replies && comment.replies.length > 0;

  const handleVote = (type: 'up' | 'down') => {
    if (onVote) {
      onVote(postId, comment.id, type);
    } else {
      voteComment(postId, comment.id, type);
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;

    const authorName = profile?.display_name || user?.email?.split('@')[0] || 'Community Critic';
    const authorUsername = profile?.username || 'user_' + Math.floor(Math.random() * 1000);
    const authorAvatar = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorUsername}`;

    const userData = {
      id: user?.id || `anon-${Date.now()}`,
      name: authorName,
      username: authorUsername,
      avatar: authorAvatar,
      badges: ['top_1_percent_commenter' as const],
    };

    if (onReply) {
      onReply(postId, comment.id, replyText.trim(), userData);
    } else {
      addComment(postId, comment.id, replyText.trim(), userData);
    }

    setReplyText('');
    setIsReplying(false);
    toast.success('Reply posted!');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Comment link copied!');
    }
  };

  return (
    <div className={`relative ${depth > 0 ? 'mt-3' : 'mt-4'}`}>
      {/* Main Comment Box */}
      <div
        className={`group relative flex gap-3 text-sm transition-colors rounded-xl p-2 ${
          comment.is_pinned
            ? 'bg-emerald-950/20 border border-emerald-500/20'
            : 'hover:bg-white/[0.02]'
        }`}
      >
        {/* Left Tree Connector Line + Collapse Toggle */}
        <div className="flex flex-col items-center flex-shrink-0">
          {/* Avatar / Collapse Icon */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="relative focus:outline-none"
            title={collapsed ? 'Expand comment thread' : 'Collapse comment thread'}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={comment.author_avatar}
              alt={comment.author_username}
              className={`w-7 h-7 rounded-full object-cover border ${
                comment.is_op
                  ? 'border-blue-400 ring-2 ring-blue-500/30'
                  : comment.is_mod
                  ? 'border-emerald-400 ring-2 ring-emerald-500/30'
                  : 'border-white/10'
              }`}
            />
            {collapsed && (
              <div className="absolute -bottom-1 -right-1 bg-zinc-800 rounded-full p-0.5 border border-white/20">
                <ChevronRight className="w-3 h-3 text-zinc-300" />
              </div>
            )}
          </button>

          {/* Vertical Thread Indent Line */}
          {!collapsed && (
            <div
              onClick={() => setCollapsed(true)}
              className="w-[2px] flex-1 bg-white/10 hover:bg-cyan-400/60 transition-colors cursor-pointer my-2 rounded-full"
              title="Click to collapse thread"
            />
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs mb-1">
            <span
              className={`font-bold ${
                comment.is_op
                  ? 'text-blue-400'
                  : comment.is_mod
                  ? 'text-emerald-400'
                  : 'text-zinc-200'
              }`}
            >
              u/{comment.author_username}
            </span>

            {/* OP Badge */}
            {comment.is_op && <ChannelBadge type="original_poster" size="sm" />}

            {/* MOD Badge */}
            {comment.is_mod && <ChannelBadge type="moderator" size="sm" />}

            {/* Custom Badges (Top 1% Commenter, etc.) */}
            {comment.author_badges?.map((badge) => (
              <ChannelBadge key={badge} type={badge} size="sm" />
            ))}

            <span>•</span>
            <span className="text-zinc-500 text-[11px]">{comment.created_at}</span>

            {comment.is_pinned && (
              <span className="flex items-center gap-0.5 text-emerald-400 text-[11px] font-medium ml-1">
                <Pin className="w-3 h-3" /> Stickied comment
              </span>
            )}

            {collapsed && (
              <button
                onClick={() => setCollapsed(false)}
                className="text-cyan-400 text-xs font-semibold hover:underline ml-2 flex items-center gap-1"
              >
                [+{1 + (comment.replies?.length || 0)} more replies]
              </button>
            )}
          </div>

          {!collapsed && (
            <>
              {/* Comment text */}
              <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line my-1.5">
                {comment.content}
              </div>

              {/* Action Buttons Bar */}
              <div className="flex items-center gap-3 text-xs text-zinc-400 mt-2">
                {/* Voting counter */}
                <div className="flex items-center bg-white/[0.04] rounded-lg px-1.5 py-0.5 border border-white/5">
                  <button
                    onClick={() => handleVote('up')}
                    className={`p-1 rounded transition-colors ${
                      comment.user_vote === 'up'
                        ? 'text-orange-500 bg-orange-500/10'
                        : 'text-zinc-400 hover:text-orange-400'
                    }`}
                    title="Upvote"
                  >
                    <ArrowBigUp className="w-4 h-4 fill-current" />
                  </button>

                  <span
                    className={`font-bold text-xs px-1 ${
                      comment.user_vote === 'up'
                        ? 'text-orange-500'
                        : comment.user_vote === 'down'
                        ? 'text-indigo-400'
                        : 'text-zinc-300'
                    }`}
                  >
                    {score}
                  </span>

                  <button
                    onClick={() => handleVote('down')}
                    className={`p-1 rounded transition-colors ${
                      comment.user_vote === 'down'
                        ? 'text-indigo-400 bg-indigo-500/10'
                        : 'text-zinc-400 hover:text-indigo-400'
                    }`}
                    title="Downvote"
                  >
                    <ArrowBigDown className="w-4 h-4 fill-current" />
                  </button>
                </div>

                {/* Reply button */}
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-white/5 hover:text-zinc-200 transition-colors font-semibold"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>

                {/* Award / Reaction */}
                <button
                  onClick={() => toast.success('Award granted!')}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/5 hover:text-amber-400 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Award</span>
                </button>

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/5 hover:text-zinc-200 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>

              {/* Inline Reply Editor */}
              {isReplying && (
                <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-cyan-500/30">
                  <div className="text-xs text-zinc-400 mb-1.5">
                    Replying to <span className="text-cyan-400 font-semibold">u/{comment.author_username}</span>
                  </div>
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="What are your thoughts?"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/80 resize-none"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => setIsReplying(false)}
                      className="px-3 py-1 text-xs text-zinc-400 hover:text-white rounded-lg hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendReply}
                      className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
                    >
                      <Send className="w-3 h-3" /> Reply
                    </button>
                  </div>
                </div>
              )}

              {/* Recursive Child Replies */}
              {hasReplies && (
                <div className="pl-2 sm:pl-4 border-l border-white/5">
                  {comment.replies!.map((child) => (
                    <CommentItem
                      key={child.id}
                      comment={child}
                      postId={postId}
                      depth={depth + 1}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
