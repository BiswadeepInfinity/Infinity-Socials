'use client';

import React from 'react';
import { ChannelBadgeType } from '@/types/database';
import { ShieldCheck, Sparkles, Flame, CheckCircle2, User } from 'lucide-react';

interface ChannelBadgeProps {
  type: ChannelBadgeType;
  showText?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export default function ChannelBadge({ type, showText = true, className = '', size = 'sm' }: ChannelBadgeProps) {
  const isSm = size === 'sm';

  switch (type) {
    case 'top_1_percent_commenter':
      return (
        <span
          title="Top 1% Commenter — Awarded for top insightful comments & community upvotes"
          className={`inline-flex items-center gap-1 font-semibold rounded-full select-none cursor-default transition-all duration-200 ${
            isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.18) 0%, rgba(20, 184, 166, 0.25) 100%)',
            border: '1px solid rgba(45, 212, 191, 0.45)',
            color: '#5eead4',
            boxShadow: '0 0 10px rgba(20, 184, 166, 0.2)',
          }}
        >
          {/* Planet / Sparkle Badge Icon */}
          <span className="text-[12px] leading-none">🪐</span>
          {showText && <span className="tracking-tight font-medium">Top 1% Commenter</span>}
        </span>
      );

    case 'moderator':
      return (
        <span
          title="Channel Moderator"
          className={`inline-flex items-center gap-1 font-bold rounded-full select-none cursor-default ${
            isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs'
          } ${className}`}
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            color: '#4ade80',
            boxShadow: '0 0 8px rgba(34, 197, 94, 0.2)',
          }}
        >
          <ShieldCheck className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-green-400`} />
          {showText && <span className="tracking-wider uppercase font-bold text-[9px]">MOD</span>}
        </span>
      );

    case 'original_poster':
      return (
        <span
          title="Original Poster"
          className={`inline-flex items-center gap-1 font-bold rounded-full select-none cursor-default ${
            isSm ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs'
          } ${className}`}
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.18)',
            border: '1px solid rgba(96, 165, 250, 0.4)',
            color: '#93c5fd',
          }}
        >
          <User className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-blue-400`} />
          {showText && <span className="tracking-wider uppercase font-bold text-[9px]">OP</span>}
        </span>
      );

    case 'top_5_percent_poster':
      return (
        <span
          title="Top 5% Poster — High engagement creator in this channel"
          className={`inline-flex items-center gap-1 font-medium rounded-full select-none cursor-default ${
            isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
          style={{
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.18) 0%, rgba(245, 158, 11, 0.25) 100%)',
            border: '1px solid rgba(251, 146, 60, 0.45)',
            color: '#fdba74',
            boxShadow: '0 0 8px rgba(249, 115, 22, 0.15)',
          }}
        >
          <Flame className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-amber-400`} />
          {showText && <span className="tracking-tight">Top 5% Poster</span>}
        </span>
      );

    case 'verified_critic':
      return (
        <span
          title="Verified Media Critic"
          className={`inline-flex items-center gap-1 font-medium rounded-full select-none cursor-default ${
            isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
          style={{
            backgroundColor: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(192, 132, 252, 0.4)',
            color: '#d8b4fe',
          }}
        >
          <Sparkles className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-purple-400`} />
          {showText && <span className="tracking-tight">Critic</span>}
        </span>
      );

    default:
      return null;
  }
}
