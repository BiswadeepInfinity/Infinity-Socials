'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChannelsStore } from '@/lib/channels-store';
import { useAuth } from '@/components/AuthProvider';
import { X, ShieldPlus, Sparkles, Image, Hash, Users, Compass } from 'lucide-react';
import toast from 'react-hot-toast';

interface FoundClubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FoundClubModal({ isOpen, onClose }: FoundClubModalProps) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { createClub } = useChannelsStore();

  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [motto, setMotto] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Gaming' | 'Anime' | 'Pop Culture' | 'Tech'>('Gaming');
  const [entryType, setEntryType] = useState<'open' | 'application' | 'invite'>('open');
  const [memberLimit, setMemberLimit] = useState<number>(100);
  const [avatarUrl, setAvatarUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !tag.trim()) {
      toast.error('Club name and tag are required');
      return;
    }

    if (tag.length < 2 || tag.length > 5) {
      toast.error('Club tag must be between 2 and 5 characters');
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const finalAvatar = avatarUrl.trim() || `https://api.dicebear.com/7.x/identicon/svg?seed=${slug}`;

    const created = createClub({
      name: name.trim(),
      slug,
      tag: tag.trim().toUpperCase(),
      motto: motto.trim() || 'Forward into the digital frontier.',
      description: description.trim() || 'A premier gathering of enthusiasts, critics, and players.',
      category,
      avatar_url: finalAvatar,
      entry_type: entryType,
      member_limit: memberLimit,
      created_by: user?.id || 'anon-founder',
    });

    toast.success(`Club [${created.tag}] ${created.name} successfully founded!`);
    onClose();
    router.push(`/clubs/${created.slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0a0a10] border border-white/[0.14] rounded-3xl p-6 sm:p-7 shadow-[0_30px_90px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Specular Highlight Line */}
        <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldPlus className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight font-display">
                Found a New Club
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Establish your club, tag & member limits
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* Club Name & Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-mono text-zinc-300 font-bold uppercase tracking-wider text-[11px]">
                Club Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Crucible Vanguard"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-zinc-300 font-bold uppercase tracking-wider text-[11px]">
                Tag (2-5 ch) *
              </label>
              <input
                type="text"
                required
                maxLength={5}
                value={tag}
                onChange={(e) => setTag(e.target.value.toUpperCase())}
                placeholder="CRUC"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-center font-mono font-bold text-cyan-300 placeholder-zinc-500 uppercase focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
          </div>

          {/* Motto */}
          <div>
            <label className="text-zinc-400 font-semibold mb-1 block">Club Motto / Battle Cry</label>
            <input
              type="text"
              placeholder="e.g. Victory through unity and mastery."
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Category & Member Limit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-400 font-semibold mb-1 block">Focus Domain</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#12121c] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="Gaming">Gaming (eSports & Raids)</option>
                <option value="Anime">Anime & Animation</option>
                <option value="Pop Culture">Movies & Cinema</option>
                <option value="Tech">Tech, AI & Hardware</option>
              </select>
            </div>

            <div>
              <label className="text-zinc-400 font-semibold mb-1 block">Capacity Limit</label>
              <select
                value={memberLimit}
                onChange={(e) => setMemberLimit(Number(e.target.value))}
                className="w-full bg-[#12121c] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 font-mono"
              >
                <option value={50}>50 Members (Compact Squad)</option>
                <option value={100}>100 Members (Standard Club)</option>
                <option value={200}>200 Members (Expanded Club)</option>
                <option value={500}>500 Members (Premier Club)</option>
              </select>
            </div>
          </div>

          {/* Entry Type */}
          <div>
            <label className="text-zinc-400 font-semibold mb-1 block">Recruitment Policy</label>
            <div className="grid grid-cols-3 gap-2">
              {(['open', 'application', 'invite'] as const).map((mode) => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => setEntryType(mode)}
                  className={`py-2 px-3 rounded-xl border text-center capitalize transition-all font-semibold cursor-pointer ${
                    entryType === mode
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-zinc-400 font-semibold mb-1 block">Club Description & Mission</label>
            <textarea
              rows={3}
              placeholder="Describe your club's focus, weekly events, discussions, and community culture..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-[0_4px_20px_rgba(6,182,212,0.35)] cursor-pointer transition-all active:scale-95"
            >
              Establish Club 👑
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}