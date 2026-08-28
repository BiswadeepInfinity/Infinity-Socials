'use client';

import React, { useState } from 'react';
import { useChannelsStore } from '@/lib/channels-store';
import { X, Hash, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateChannelModal({ isOpen, onClose }: CreateChannelModalProps) {
  const { createChannel } = useChannelsStore();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Gaming');
  const [avatarUrl, setAvatarUrl] = useState('');

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 24));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast.error('Please enter a community name and slug');
      return;
    }

    const created = createChannel({
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || 'A new community on Infinity Socials.',
      category,
      avatar_url: avatarUrl.trim() || `https://api.dicebear.com/7.x/identicon/svg?seed=${slug}`,
    });

    toast.success(`r/${created.slug} community created!`);
    setName('');
    setSlug('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0d0d14] border border-white/15 rounded-3xl p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Create a Community</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1 block">Community Name</label>
            <input
              type="text"
              placeholder="e.g. Cyberpunk Mechanics"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1 block">Community URL Handle</label>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-400">
              <span className="text-cyan-400 font-mono mr-1">r/</span>
              <input
                type="text"
                placeholder="community-handle"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="bg-transparent text-white w-full focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1 block">Category Topic</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#0e0e16] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Gaming">Gaming</option>
              <option value="Anime">Anime & Manga</option>
              <option value="Pop Culture">Pop Culture & Movies</option>
              <option value="Tech">Tech & Hardware</option>
              <option value="Music">Music & Sound</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1 block">Description</label>
            <textarea
              rows={3}
              placeholder="Tell visitors what this channel is about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

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
              Create Community
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
