'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useChannelsStore } from '@/lib/channels-store';
import { useAuth } from '@/components/AuthProvider';
import CommentItem from '@/components/CommentItem';
import CreatePostModal from '@/components/CreatePostModal';

interface ArticleDiscussionHubProps {
  articleSlug: string;
  articleTitle: string;
  category: string;
}

export default function ArticleDiscussionHub({
  articleSlug,
  articleTitle,
  category,
}: ArticleDiscussionHubProps) {
  const { user, profile } = useAuth();
  const {
    channels,
    posts,
    commentsByPostId,
    votePost,
    voteComment,
    addComment,
  } = useChannelsStore();

  const [activeTab, setActiveTab] = useState<'hot' | 'top' | 'new'>('hot');
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [commentLimit, setCommentLimit] = useState(6);

  // Map article category to matching discussion channel
  const targetChannelSlug = useMemo(() => {
    const cat = category.toLowerCase();
    if (cat.includes('anime')) return 'anime';
    if (cat.includes('tech')) return 'tech';
    if (cat.includes('movie') || cat.includes('film') || cat.includes('cinema')) return 'cinema';
    return 'gaming';
  }, [category]);

  const targetChannel = useMemo(() => {
    return channels.find((c) => c.slug === targetChannelSlug) || channels[0];
  }, [channels, targetChannelSlug]);

  // Find canonical discussion thread for this article or fallback to top channel post
  const canonicalPost = useMemo(() => {
    // Look for a post directly matching the slug or channel
    const matching = posts.find(
      (p) =>
        p.title.toLowerCase().includes(articleSlug.split('-')[0]) ||
        p.channel_id === targetChannel?.id
    );
    return matching || posts[0];
  }, [posts, articleSlug, targetChannel]);

  // Related spin-off discussion threads
  const relatedSpinoffPosts = useMemo(() => {
    return posts
      .filter((p) => p.id !== canonicalPost?.id)
      .slice(0, 4);
  }, [posts, canonicalPost]);

  const comments = useMemo(() => {
    if (!canonicalPost) return [];
    const list = commentsByPostId[canonicalPost.id] || [];
    
    // Sort based on active tab
    const sorted = [...list];
    if (activeTab === 'top') {
      sorted.sort((a, b) => b.upvotes - a.upvotes);
    } else if (activeTab === 'new') {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      // Hot: combination of upvotes and recency
      sorted.sort((a, b) => b.upvotes * 1.5 - a.upvotes);
    }
    return sorted;
  }, [canonicalPost, commentsByPostId, activeTab]);

  const visibleComments = comments.slice(0, commentLimit);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !canonicalPost) return;

    setIsSubmitting(true);
    const authorName = profile?.display_name || user?.email?.split('@')[0] || 'Community Critic';
    const authorUsername = profile?.username || 'user_' + Math.floor(Math.random() * 1000);
    const authorAvatar =
      profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorUsername}`;

    addComment(canonicalPost.id, null, newCommentText.trim(), {
      id: user?.id || `anon-${Date.now()}`,
      name: authorName,
      username: authorUsername,
      avatar: authorAvatar,
      badges: ['top_1_percent_commenter'],
    });

    setNewCommentText('');
    setIsSubmitting(false);
  };

  if (!canonicalPost) return null;

  return (
    <section id="community-discussion" className="w-full max-w-[1100px] mx-auto px-3 sm:px-6 my-12 sm:my-16">
      
      {/* Container Card with Dark Liquid Glass Aesthetic */}
      <div className="rounded-[24px] sm:rounded-[32px] bg-[#090910]/90 border border-white/[0.12] p-4 sm:p-8 backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.85)] relative overflow-hidden">
        
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[250px] bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/[0.08] relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.9)]" />
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-cyan-300 font-bold">
                Pop Culture Community Debates
              </span>
              <span className="text-white/30 font-mono text-xs">•</span>
              <Link
                href={`/channels/${targetChannel.slug}`}
                className="font-mono text-[10px] sm:text-[11px] text-zinc-400 hover:text-white transition-colors"
              >
                r/{targetChannel.slug}
              </Link>
            </div>

            <h2 className="font-display font-extrabold text-xl sm:text-3xl text-white tracking-tight leading-snug">
              Article Debates & Fan Theories
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-light mt-1 max-w-xl leading-relaxed">
              Join nested deep-dive threads, earn verified community badges, and share your takes with {targetChannel.member_count.toLocaleString()} members.
            </p>
          </div>

          {/* Quick Action Button: Start New Spin-off Thread */}
          <div className="flex items-center gap-2 sm:gap-3 self-start md:self-auto shrink-0">
            <button
              onClick={() => setShowCreatePostModal(true)}
              className="px-4 py-2 rounded-full bg-white text-black font-display font-bold text-xs sm:text-sm hover:bg-zinc-200 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-1.5 cursor-pointer"
            >
              <span>+</span>
              <span>New Fan Thread</span>
            </button>
          </div>
        </div>

        {/* Horizontal Spin-off Threads Deck (Pop Culture Fan Theories) */}
        <div className="my-6 relative z-10">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="font-mono text-[10px] sm:text-xs text-white/50 uppercase tracking-wider font-semibold">
              Trending Related Threads in r/{targetChannel.slug}
            </span>
            <Link
              href={`/channels/${targetChannel.slug}`}
              className="font-mono text-[10px] sm:text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              <span>View all threads</span>
              <span>→</span>
            </Link>
          </div>

          {/* Horizontal Scrollable Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {relatedSpinoffPosts.map((spinoff) => (
              <Link
                key={spinoff.id}
                href={`/channels/${targetChannel.slug}/${spinoff.id}`}
                className="group p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/25 transition-all duration-200 flex flex-col justify-between gap-3 shadow-lg no-underline"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-white/70 font-mono text-[9px] font-semibold uppercase">
                      {spinoff.flair}
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400 font-bold">
                      ▲ {spinoff.upvotes}
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-xs text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                    {spinoff.title}
                  </h4>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-white/40 pt-2 border-t border-white/[0.04]">
                  <span className="truncate max-w-[100px]">u/{spinoff.author_username}</span>
                  <span>💬 {spinoff.comments_count}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Active Canonical Discussion Stream */}
        <div className="mt-8 pt-6 border-t border-white/[0.08] relative z-10">
          
          {/* Main Canonical Post Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] mb-6 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
            
            {/* Voting Widget */}
            <div className="flex sm:flex-col items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/[0.06] shrink-0">
              <button
                onClick={() => votePost(canonicalPost.id, 'up')}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors ${
                  canonicalPost.user_vote === 'up'
                    ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                    : 'text-white/50 hover:bg-white/10 hover:text-white'
                }`}
                title="Upvote"
              >
                ▲
              </button>
              <span className="font-mono text-xs font-bold text-white px-1">
                {canonicalPost.upvotes - canonicalPost.downvotes}
              </span>
              <button
                onClick={() => votePost(canonicalPost.id, 'down')}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors ${
                  canonicalPost.user_vote === 'down'
                    ? 'bg-rose-500/20 text-rose-400 font-bold'
                    : 'text-white/50 hover:bg-white/10 hover:text-white'
                }`}
                title="Downvote"
              >
                ▼
              </button>
            </div>

            {/* Post Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono text-[9px] font-bold uppercase tracking-wider">
                  Pinned Megathread
                </span>
                <span className="text-[11px] font-mono text-white/50">
                  Posted by <span className="text-white/80 font-medium">u/{canonicalPost.author_username}</span>
                </span>
                <span className="text-[10px] font-mono text-white/30">• {canonicalPost.created_at}</span>
              </div>

              <h3 className="font-display font-extrabold text-base sm:text-lg text-white leading-snug mb-2">
                {canonicalPost.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed whitespace-pre-line line-clamp-3">
                {canonicalPost.content}
              </p>
            </div>
          </div>

          {/* Comment Submission Form */}
          <form onSubmit={handlePostComment} className="mb-8">
            <div className="rounded-2xl bg-black/40 border border-white/[0.12] p-3 sm:p-4 focus-within:border-cyan-400/50 transition-colors shadow-inner">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs overflow-hidden border border-white/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-mono text-[11px] text-white/60">
                  Comment as <span className="text-white font-medium">@{profile?.username || 'critic'}</span>
                </span>
              </div>

              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Share your review take, fan theory, or critique analysis..."
                rows={3}
                className="w-full bg-transparent border-none text-xs sm:text-sm text-white placeholder-zinc-500 outline-none resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] mt-2">
                <span className="font-mono text-[10px] text-white/30 hidden sm:inline">
                  Markdown & spoilers supported
                </span>
                <button
                  type="submit"
                  disabled={!newCommentText.trim() || isSubmitting}
                  className="px-4 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-display font-bold text-xs active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all ml-auto shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
                >
                  Post Take ↵
                </button>
              </div>
            </div>
          </form>

          {/* Discussion Stream Controls: Filter Tabs */}
          <div className="flex items-center justify-between gap-4 mb-5 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
              {(['hot', 'top', 'new'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold capitalize transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-white/40 hover:text-white/75'
                  }`}
                >
                  {tab === 'hot' && '🔥 Hot Takes'}
                  {tab === 'top' && '⭐ Top Karma'}
                  {tab === 'new' && '⚡ Latest'}
                </button>
              ))}
            </div>

            <span className="font-mono text-xs text-white/40">
              {comments.length} Discussion {comments.length === 1 ? 'Take' : 'Takes'}
            </span>
          </div>

          {/* Nested Comments List */}
          <div className="space-y-4">
            {visibleComments.length === 0 ? (
              <div className="py-12 text-center text-white/40 font-mono text-xs">
                No discussion takes yet. Be the first to start the debate!
              </div>
            ) : (
              visibleComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  postId={canonicalPost.id}
                  depth={0}
                  onVote={voteComment}
                  onReply={addComment}
                />
              ))
            )}
          </div>

          {/* Load More Pagination */}
          {comments.length > commentLimit && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setCommentLimit((prev) => prev + 6)}
                className="px-6 py-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.12] text-xs font-mono text-white/80 hover:text-white transition-all cursor-pointer shadow-md active:scale-95"
              >
                ▼ Load More Community Takes ({comments.length - commentLimit} remaining)
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Create New Post Modal */}
      {showCreatePostModal && (
        <CreatePostModal
          channelId={targetChannel.id}
          channelName={targetChannel.name}
          onClose={() => setShowCreatePostModal(false)}
        />
      )}

    </section>
  );
}
