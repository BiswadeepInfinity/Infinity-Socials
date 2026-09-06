'use client';

import React, { useState } from 'react';
import { Club, ClubRole, ClubHierarchyRank } from '@/types/database';
import { useChannelsStore } from '@/lib/channels-store';
import { 
  X, 
  Plus, 
  Trash2, 
  Crown, 
  Swords, 
  ShieldCheck, 
  User, 
  Sparkles, 
  Palette,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ClubSettingsModalProps {
  club: Club;
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_ROLE_COLORS = [
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#eab308', // Yellow
];

export default function ClubSettingsModal({ club, isOpen, onClose }: ClubSettingsModalProps) {
  const { 
    createCustomRole, 
    deleteCustomRole, 
    assignRoleToMember, 
    removeRoleFromMember, 
    setMemberRank 
  } = useChannelsStore();

  const [activeTab, setActiveTab] = useState<'roles' | 'members' | 'overview'>('roles');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleColor, setNewRoleColor] = useState(PRESET_ROLE_COLORS[0]);
  const [newRoleIcon, setNewRoleIcon] = useState('⚔️');

  if (!isOpen) return null;

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      toast.error('Please enter a role name');
      return;
    }

    createCustomRole(club.id, {
      name: newRoleName.trim(),
      color: newRoleColor,
      icon: newRoleIcon.trim() || '🏷️',
    });

    toast.success(`Role "${newRoleName}" created!`);
    setNewRoleName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0a0a10] border border-white/[0.14] rounded-3xl p-6 sm:p-7 shadow-[0_30px_90px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Specular Highlight Line */}
        <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight font-display">
                {club.name} — Club Settings
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                Hierarchy, Custom Roles & Member Capacity
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 pt-3 shrink-0">
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'roles'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Custom Roles ({club.custom_roles.length})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'members'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Roster & Hierarchy ({club.members.length})
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Perks & Capacity
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* TAB 1: Custom Roles Builder */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              {/* Role Creator Form */}
              <form onSubmit={handleCreateRole} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <Palette className="w-4 h-4" /> Create Custom Discord-Style Role
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-zinc-400 mb-1 block">Role Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Speedrun Sensei, Lore Master, MVP"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 mb-1 block">Role Icon</label>
                    <input
                      type="text"
                      placeholder="e.g. ⚔️, 🛡️, 🎯"
                      value={newRoleIcon}
                      onChange={(e) => setNewRoleIcon(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 text-center"
                    />
                  </div>
                </div>

                {/* Color presets picker */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 mb-1.5 block">Role Color</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {PRESET_ROLE_COLORS.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setNewRoleColor(c)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                          newRoleColor === c ? 'scale-110 border-white shadow-lg' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: c }}
                      >
                        {newRoleColor === c && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Role Preview Pill */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">Preview:</span>
                    <span
                      className="inline-flex items-center gap-1 font-semibold text-xs px-2.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${newRoleColor}22`,
                        borderColor: `${newRoleColor}66`,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        color: newRoleColor,
                        boxShadow: `0 0 10px ${newRoleColor}33`,
                      }}
                    >
                      <span>{newRoleIcon}</span>
                      <span>{newRoleName || 'Sample Role'}</span>
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    + Add Role
                  </button>
                </div>
              </form>

              {/* Existing Custom Roles List */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Configured Club Roles ({club.custom_roles.length})
                </h4>

                {club.custom_roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1 font-semibold text-xs px-2.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${role.color}22`,
                          borderColor: `${role.color}66`,
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          color: role.color,
                        }}
                      >
                        <span>{role.icon}</span>
                        <span>{role.name}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => deleteCustomRole(club.id, role.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete role"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Member Hierarchy & Role Assignment */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Assign hierarchy ranks (President, Vice President, Executive, Member) and custom roles. Roles display beside usernames on posts and comments.
              </p>

              <div className="space-y-2.5">
                {club.members.map((member) => (
                  <div
                    key={member.id}
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={member.avatar_url}
                        alt={member.username}
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs">{member.display_name}</span>
                          <span className="text-zinc-500 font-mono text-[11px]">@{member.username}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {/* Rank badge */}
                          <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300">
                            {member.rank.replace('_', ' ')}
                          </span>

                          {/* Member's assigned custom roles with instant removal */}
                          {member.custom_roles.map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => {
                                removeRoleFromMember(club.id, member.user_id, r.id);
                                toast.success(`Removed role "${r.name}" from @${member.username}`);
                              }}
                              className="group inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-rose-500/10 hover:border-rose-500/30 text-zinc-300 hover:text-rose-300 border border-white/[0.08] transition-colors cursor-pointer"
                              title={`Click to remove role "${r.name}"`}
                            >
                              <span>{r.icon}</span>
                              <span>{r.name}</span>
                              <span className="text-zinc-500 group-hover:text-rose-400 text-xs font-bold leading-none ml-0.5">×</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Controls: Change Rank & Add Custom Role */}
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <select
                        value={member.rank}
                        onChange={(e) => setMemberRank(club.id, member.user_id, e.target.value as ClubHierarchyRank)}
                        className="bg-[#0e0e16] border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none"
                      >
                        <option value="president">👑 President</option>
                        <option value="vice_president">⚔️ Vice Pres</option>
                        <option value="executive">🛡️ Executive</option>
                        <option value="member">🔰 Member</option>
                      </select>

                      {/* Add role dropdown */}
                      {club.custom_roles.length > 0 && (
                        <select
                          onChange={(e) => {
                            const roleId = e.target.value;
                            const targetRole = club.custom_roles.find(r => r.id === roleId);
                            if (targetRole) {
                              assignRoleToMember(club.id, member.user_id, targetRole);
                            }
                          }}
                          defaultValue=""
                          className="bg-[#0e0e16] border border-white/10 rounded-xl px-2 py-1 text-xs text-zinc-300 focus:outline-none"
                        >
                          <option value="" disabled>+ Role</option>
                          {club.custom_roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Perks & Capacity Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Club Level:</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">Level {club.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Total Club XP:</span>
                  <span className="font-mono font-bold text-cyan-300">{club.xp.toLocaleString()} XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Member Capacity:</span>
                  <span className="font-mono text-zinc-300">
                    {club.member_count} / {club.member_limit} Members
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, (club.member_count / club.member_limit) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                <h4 className="font-mono font-bold text-zinc-300 uppercase tracking-wider text-[11px]">
                  Club Perks & Privileges
                </h4>
                <ul className="space-y-1.5 text-zinc-400">
                  {club.perks.map((perk, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}