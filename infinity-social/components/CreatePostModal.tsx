'use client';

import React, { useState } from 'react';
import { useChannelsStore } from '@/lib/channels-store';
import { useAuth } from '@/components/AuthProvider';
import { X, Image, Link as LinkIcon, FileText, Sparkles, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultChannelId?: string;
  articleSlug?: string;
  articleTitle?: string;
  articleThumbnail?: string;
  articleScore?: string;
  articleCategory?: string;
}

export default function CreatePostModal({ 
  isOpen, 
  onClose, 
  defaultChannelId,
  articleSlug,
  articleTitle,
  articleThumbnail,
  articleScore,
  articleCategory
}: CreatePostModalProps) {
  const { user, profile } = useAuth();
  const { channels, createPost } = useChannelsStore();
  const [selectedChannelId, setSelectedChannelId] = useState(defaultChannelId || channels[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'text' | 'media' | 'link'>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [flair, setFlair] = useState(articleSlug ? 'Fan Theory' : 'Discussion');
  const [mediaUrl, setMediaUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a post title');
      return;
    }

    const authorName = profile?.display_name || user?.email?.split('@')[0] || 'Community Critic';
    const authorUsername = profile?.username || 'user_' + Math.floor(Math.random() * 1000);
    const authorAvatar = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorUsername}`;

    createPost({
      channel_id: selectedChannelId,
      title: title.trim(),
      content: content.trim(),
      flair: flair.trim(),
      media_url: activeTab === 'media' ? mediaUrl.trim() : undefined,
      link_url: activeTab === 'link' ? linkUrl.trim() : undefined,
      article_slug: articleSlug,
      article_title: articleTitle,
      article_thumbnail: articleThumbnail,
      article_score: articleScore,
      article_category: articleCategory,
      user_id: user?.id || `anon-${Date.now()}`,
      author_name: authorName,
      author_username: authorUsername,
      author_avatar: authorAvatar,
    });

    toast.success('Discussion posted successfully!');
    setTitle('');
    setContent('');
    setMediaUrl('');
    setLinkUrl('');
    onClose();
  };

  const flairs = ['Discussion', 'Deep Analysis', 'Tech Breakdown', 'Fan Theory', 'Feedback', 'News'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0d0d14] border border-white/15 rounded-3xl p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Create a Post</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Linked Article Notice */}
        {articleTitle && (
          <div className="mt-3 p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold block">
                Linked Source Article
              </span>
              <p className="text-xs text-zinc-200 truncate font-medium">
                {articleTitle}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {/* Channel selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400">Select Community</label>
            <select
              value={selectedChannelId}
              onChange={(e) => setSelectedChannelId(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              {channels.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#0e0e16] text-white">
                  r/{c.slug} — {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Post Tabs */}
          <div className="flex border-b border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'text'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileText className="w-4 h-4" /> Post
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('media')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'media'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Image className="w-4 h-4" /> Images & Media
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('link')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'link'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LinkIcon className="w-4 h-4" /> Link
            </button>
          </div>

          {/* Title */}
          <div>
            <input
              type="text"
              placeholder="Title (required)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          {/* Flairs selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-zinc-500 mr-1">Flair:</span>
            {flairs.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFlair(f)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  flair === f
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                    : 'bg-white/5 text-zinc-400 border-white/10 hover:border-white/20'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Media URL if media tab */}
          {activeTab === 'media' && (
            <div>
              <input
                type="url"
                placeholder="Image / Banner URL (e.g. https://images.unsplash.com/...)"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {/* Link URL if link tab */}
          {activeTab === 'link' && (
            <div>
              <input
                type="url"
                placeholder="External Article / Website URL (https://...)"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {/* Content Body */}
          <div>
            <textarea
              rows={5}
              placeholder="Text body / analysis / thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 shadow-lg shadow-cyan-500/20 transition-all"
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
