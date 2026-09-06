'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useChannelsStore } from '@/lib/channels-store';
import { useAuth } from '@/components/AuthProvider';
import ChannelPostCard from '@/components/ChannelPostCard';
import CommentItem from '@/components/CommentItem';
import { ChevronLeft, MessageSquare, Send, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClubDiscussionPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const postId = params?.postId as string;
  const { user, profile } = useAuth();
  const { posts, clubs, commentsByPostId, addComment } = useChannelsStore();

  const [commentText, setCommentText] = useState('');

  const post = posts.find((p) => p.id === postId);
  const club = clubs.find((c) => c.slug === slug || c.id === post?.club_id);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#07070d] text-zinc-100 pt-32 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-3">Topic Not Found</h1>
        <p className="text-zinc-400 mb-6">This discussion topic does not exist or has been removed.</p>
        <Link href="/clubs" className="px-4 py-2 rounded-xl bg-cyan-400 text-black font-bold text-sm">
          Return to Clubs
        </Link>
      </div>
    );
  }

  const comments = commentsByPostId[post.id] || [];

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const currentMember = club?.members.find((m) => m.user_id === user?.id);

    addComment(post.id, null, commentText.trim(), {
      id: user?.id || `anon-${Date.now()}`,
      name: profile?.display_name || user?.email?.split('@')[0] || 'Club Member',
      username: profile?.username || 'user_' + Math.floor(Math.random() * 1000),
      avatar: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'anon'}`,
      rank: currentMember?.rank || 'member',
      custom_roles: currentMember?.custom_roles || [],
    });

    setCommentText('');
    toast.success('Discussion take submitted!');
  };

  return (
    <div className="min-h-screen bg-[#040406] text-zinc-100 pt-24 pb-20 selection:bg-cyan-500 selection:text-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <Link href="/clubs" className="hover:text-white transition-colors flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Clubs</span>
          </Link>
          {club && (
            <>
              <span>/</span>
              <Link href={`/clubs/${club.slug}`} className="hover:text-cyan-300 transition-colors">
                [{club.tag}] {club.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-zinc-500 truncate max-w-[200px]">{post.title}</span>
        </div>

        {/* Detailed Post Card */}
        <ChannelPostCard post={post} channelSlug={club?.slug} isDetailed={true} />

        {/* Comment Submission Box */}
        <div className="ios-glass-card p-5 sm:p-6 rounded-2xl space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>Contribute to Club Discussion</span>
          </h3>

          <form onSubmit={handleAddComment} className="space-y-3">
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share analysis, review perspectives, lore interpretations, or technical insights..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] font-mono text-zinc-500">
                Your Club rank & custom role badges will show beside your username.
              </span>
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:pointer-events-none text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-400/20 cursor-pointer transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Take</span>
              </button>
            </div>
          </form>
        </div>

        {/* Comments Tree */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
              Responses ({comments.length})
            </h4>
          </div>

          {comments.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white/[0.01] border border-white/[0.06] text-center text-zinc-500 text-xs">
              No replies yet. Be the first to share an insight!
            </div>
          ) : (
            comments.map((c) => (
              <CommentItem key={c.id} comment={c} postId={post.id} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}