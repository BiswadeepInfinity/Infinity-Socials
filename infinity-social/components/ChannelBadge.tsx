'use client';

import React from 'react';
import { ClubHierarchyRank, ClubRole } from '@/types/database';
import { Crown, Swords, ShieldCheck, User, Sparkles } from 'lucide-react';

interface ClubBadgeProps {
  rank?: ClubHierarchyRank;
  customRoles?: ClubRole[];
  clubTag?: string;
  clanTag?: string; // legacy support
  size?: 'xs' | 'sm' | 'md';
}

export default function ClubBadge({ 
  rank, 
  customRoles = [], 
  clubTag,
  clanTag, 
  size = 'sm' 
}: ClubBadgeProps) {
  const isXs = size === 'xs';
  const isSm = size === 'sm';
  const displayTag = clubTag || clanTag;

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      {/* Club Tag Pill with Specular Liquid Highlight */}
      {displayTag && (
        <span 
          className={`font-mono font-bold tracking-wider uppercase rounded-md bg-white/[0.06] border border-white/[0.14] text-zinc-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] backdrop-blur-md ${
            isXs ? 'px-1 py-0.2 text-[9px]' : isSm ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
          }`}
          title={`Club Tag: [${displayTag}]`}
        >
          [{displayTag}]
        </span>
      )}

      {/* Official Hierarchy Rank */}
      {rank === 'president' && (
        <span
          title="Club President"
          className={`inline-flex items-center gap-1 font-semibold rounded-md select-none cursor-default bg-amber-500/10 text-amber-300/90 border border-amber-500/20 ${
            isXs ? 'px-1.5 py-0.2 text-[9px]' : isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs'
          }`}
        >
          <Crown className={`${isXs ? 'w-2.5 h-2.5' : isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-amber-400`} />
          <span className="tracking-wider uppercase text-[9px] font-bold">President</span>
        </span>
      )}

      {rank === 'vice_president' && (
        <span
          title="Club Vice President"
          className={`inline-flex items-center gap-1 font-semibold rounded-md select-none cursor-default bg-cyan-500/10 text-cyan-300/90 border border-cyan-500/20 ${
            isXs ? 'px-1.5 py-0.2 text-[9px]' : isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs'
          }`}
        >
          <Swords className={`${isXs ? 'w-2.5 h-2.5' : isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-cyan-400`} />
          <span className="tracking-wider uppercase text-[9px] font-bold">Vice Pres</span>
        </span>
      )}

      {rank === 'executive' && (
        <span
          title="Club Executive Member"
          className={`inline-flex items-center gap-1 font-semibold rounded-md select-none cursor-default bg-emerald-500/10 text-emerald-300/90 border border-emerald-500/20 ${
            isXs ? 'px-1.5 py-0.2 text-[9px]' : isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs'
          }`}
        >
          <ShieldCheck className={`${isXs ? 'w-2.5 h-2.5' : isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-emerald-400`} />
          <span className="tracking-wider uppercase text-[9px] font-bold">Executive</span>
        </span>
      )}

      {/* Custom Discord-Style Roles Displayed Right of Username */}
      {customRoles && customRoles.map((role) => (
        <span
          key={role.id || role.name}
          title={`Role: ${role.name}`}
          className={`inline-flex items-center gap-1 font-medium rounded-md select-none cursor-default bg-white/[0.04] text-zinc-300 border border-white/[0.08] ${
            isXs ? 'px-1.5 py-0.2 text-[9px]' : isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
          }`}
        >
          {role.icon && <span className="text-[10px] leading-none opacity-80">{role.icon}</span>}
          <span className="tracking-tight">{role.name}</span>
        </span>
      ))}
    </div>
  );
}
