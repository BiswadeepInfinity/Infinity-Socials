'use client';

import React, { useState } from 'react';
import { Club } from '@/types/database';
import { useChannelsStore } from '@/lib/channels-store';
import { X, Handshake, Scroll, Sparkles, Shield, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface TreatyPactModalProps {
  currentClub: Club;
  isOpen: boolean;
  onClose: () => void;
}

export default function TreatyPactModal({ currentClub, isOpen, onClose }: TreatyPactModalProps) {
  const { clubs, createSocietyWithPact } = useChannelsStore();

  const otherClubs = clubs.filter((c) => c.id !== currentClub.id);
  const [targetClubId, setTargetClubId] = useState(otherClubs[0]?.id || '');
  const [societyName, setSocietyName] = useState('');
  const [societyTag, setSocietyTag] = useState('');
  const [societyMotto, setSocietyMotto] = useState('');
  const [charterPoints, setCharterPoints] = useState([
    'Mutual digital event co-hosting and shared stage streams.',
    'Combined event rosters & knowledge exchange between clubs.',
    'Shared diplomatic summit and cross-club discussion channels.'
  ]);

  if (!isOpen) return null;

  const handleCreateTreaty = (e: React.FormEvent) => {
    e.preventDefault();

    if (!societyName.trim() || !societyTag.trim() || !targetClubId) {
      toast.error('Please complete all treaty fields');
      return;
    }

    const slug = societyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    createSocietyWithPact({
      name: societyName.trim(),
      slug,
      tag: societyTag.trim().toUpperCase(),
      motto: societyMotto.trim() || 'A coalition bound by mutual honour and digital artistry.',
      description: `A grand alliance between [${currentClub.tag}] and allied clubs to pool prestige, events, and community summits.`,
      category: currentClub.category,
      crest_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=80',
      founderClubId: currentClub.id,
      alliedClubId: targetClubId,
      treatyCharter: charterPoints,
    });

    toast.success(`Grand Society [${societyTag.toUpperCase()}] established!`);
    onClose();
  };

  const targetClub = clubs.find(c => c.id === targetClubId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#090912] border border-purple-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
              <Handshake className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                Establish Mutual Treaty & Grand Society
              </h2>
              <p className="text-xs text-purple-300/80 font-mono">
                Pact between [{currentClub.tag}] and an allied Clan
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreateTreaty} className="py-4 space-y-4 text-xs overflow-y-auto">
          {/* Signatory Clubs Visual */}
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentClub.avatar_url} alt={currentClub.name} className="w-8 h-8 rounded-lg border border-white/10" />
              <div>
                <span className="font-mono text-[10px] text-zinc-400 block">Signatory A (Founder)</span>
                <span className="font-bold text-white text-xs">[{currentClub.tag}] {currentClub.name}</span>
              </div>
            </div>

            <Handshake className="w-5 h-5 text-purple-400 shrink-0" />

            <div className="flex items-center gap-2 text-right">
              <div>
                <span className="font-mono text-[10px] text-zinc-400 block">Signatory B (Ally)</span>
                <select
                  value={targetClubId}
                  onChange={(e) => setTargetClubId(e.target.value)}
                  className="bg-[#12121e] border border-white/10 rounded-lg px-2 py-1 text-xs text-cyan-300 font-bold focus:outline-none"
                >
                  {otherClubs.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.tag}] {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Grand Society Details */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-zinc-400 font-semibold mb-1 block">Grand Society Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Pantheon of Interactive Arts"
                value={societyName}
                onChange={(e) => setSocietyName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="text-zinc-400 font-semibold mb-1 block">Society Tag</label>
              <input
                type="text"
                required
                maxLength={5}
                placeholder="PANTH"
                value={societyTag}
                onChange={(e) => setSocietyTag(e.target.value.toUpperCase())}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-mono uppercase text-center placeholder-zinc-500 focus:outline-none focus:border-purple-400 font-bold"
              />
            </div>
          </div>

          {/* Motto */}
          <div>
            <label className="text-zinc-400 font-semibold mb-1 block">Alliance Motto / Declaration</label>
            <input
              type="text"
              placeholder="e.g. United across disciplines in pursuit of higher art."
              value={societyMotto}
              onChange={(e) => setSocietyMotto(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Treaty Charter Clauses */}
          <div className="space-y-2">
            <label className="text-zinc-300 font-bold flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider">
              <Scroll className="w-3.5 h-3.5 text-purple-400" /> Treaty Charter Articles
            </label>
            {charterPoints.map((point, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="font-mono text-purple-400 font-bold text-xs">§{index + 1}</span>
                <input
                  type="text"
                  value={point}
                  onChange={(e) => {
                    const next = [...charterPoints];
                    next[index] = e.target.value;
                    setCharterPoints(next);
                  }}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold shadow-lg shadow-purple-500/25 cursor-pointer transition-all active:scale-95"
            >
              Ratify Treaty & Ratify Alliance 📜
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}