'use client';

import React, { useState, use } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChannelsSidebar from '@/components/ChannelsSidebar';
import ChannelInfoSidebar from '@/components/ChannelInfoSidebar';
import ChannelPostCard from '@/components/ChannelPostCard';
import CommentItem from '@/components/CommentItem';
import CreatePostModal from '@/components/CreatePostModal';
import CreateChannelModal from '@/components/CreateChannelModal';
import { useChannelsStore } from '@/lib/channels-store';
import { useAuth } from '@/components/AuthProvider';
import { 
  ArrowLeft, 
  Send, 
  Sparkles, 
  SlidersHorizontal,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import toast from 'react-hot-toast';

export default function PostDiscussionPage({
  params,
}: {
  params: Promise<{ slug: string; postId: string }>;
}) {
  const resolvedParams = use(params);
  const { user, profile } = useAuth();
  const { channels, posts, commentsByPostId, addComment } = useChannelsStore();
  const [commentInput, setCommentInput] = useState('');
  const [commentSort, setCommentSort] = useState<'top' | 'new'>('top');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);

  const post = posts.find((p) => p.id === resolvedParams.postId);
  const channel = channels.find(
    (c) => c.slug.toLowerCase() === resolvedParams.slug.toLowerCase()
  );

  if (!post || !channel) {
    return notFound();
  }

  const comments = commentsByPostId[post.id] || [];

  const sortedComments = [...comments].sort((a, b) => {
    // Keep pinned / mod comments on top
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;

    if (commentSort === 'top') {
      return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
    }
    return b.id.localeCompare(a.id);
  });

  const authorName = profile?.display_name || user?.email?.split('@')[0] || 'Community Critic';
  const authorUsername = profile?.username || 'user_' + Math.floor(Math.random() * 1000);
  const authorAvatar = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorUsername}`;

  const handleSendRootComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    addComment(post.id, null, commentInput.trim(), {
      id: user?.id || `anon-${Date.now()}`,
      name: authorName,
      username: authorUsername,
      avatar: authorAvatar,
      badges: ['top_1_percent_commenter'],
    });

    setCommentInput('');
    toast.success('Comment posted!');
  };

  return (
    <div className="min-h-screen bg-[#040408] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href={`/channels/${channel.slug}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to r/{channel.slug}
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Sidebar */}
          <ChannelsSidebar onOpenCreateChannel={() => setIsCreateChannelOpen(true)} />

          {/* Main Discussion Thread */}
          <div className="flex-1 min-w-0 w-full flex flex-col gap-6">
            {/* Main Post Detailed Card */}
            <ChannelPostCard
              post={post}
              channelSlug={channel.slug}
              isDetailed={true}
            />

            {/* Comment Section Card */}
            <section className="bg-[#0a0a10]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
              {/* Comment Input Editor */}
              <form onSubmit={handleSendRootComment} className="mb-6">
                <div className="text-xs text-zinc-400 mb-2 flex items-center justify-between">
                  <span>
                    Comment as <span className="text-cyan-400 font-bold">u/{authorUsername}</span> (🪐 Top 1% Commenter)
                  </span>
                </div>

                <div className="relative">
                  <textarea
                    rows={4}
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="What are your thoughts?"
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/80 resize-none transition-colors"
                  />
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span>Markdown supported</span>
                    </div>
                    <button
                      type="submit"
                      disabled={!commentInput.trim()}
                      className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                        commentInput.trim()
                          ? 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg shadow-cyan-500/20 cursor-pointer'
                          : 'bg-white/5 text-zinc-600 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" /> Comment
                    </button>
                  </div>
                </div>
              </form>

              {/* Sorting Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>{post.comments_count} Comments</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span>Sort by:</span>
                  <button
                    onClick={() => setCommentSort('top')}
                    className={`font-semibold transition-colors ${
                      commentSort === 'top' ? 'text-cyan-400' : 'hover:text-white'
                    }`}
                  >
                    Top
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => setCommentSort('new')}
                    className={`font-semibold transition-colors ${
                      commentSort === 'new' ? 'text-cyan-400' : 'hover:text-white'
                    }`}
                  >
                    New
                  </button>
                </div>
              </div>

              {/* Nested Comments Tree */}
              <div className="divide-y divide-white/5">
                {sortedComments.length === 0 ? (
                  <div className="py-12 text-center text-xs text-zinc-500">
                    No comments yet. Be the first to share your take!
                  </div>
                ) : (
                  sortedComments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      postId={post.id}
                    />
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Right Community Metadata Sidebar */}
          <ChannelInfoSidebar
            channel={channel}
            onOpenCreatePost={() => setIsCreatePostOpen(true)}
          />
        </div>
      </main>

      <Footer />

      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        defaultChannelId={channel.id}
      />
      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
      />
    </div>
  );
}
