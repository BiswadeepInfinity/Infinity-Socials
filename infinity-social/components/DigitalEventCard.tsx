'use client';

import React, { useState, useEffect } from 'react';
import { DigitalEvent } from '@/types/database';
import { useChannelsStore } from '@/lib/channels-store';
import { useAuth } from '@/components/AuthProvider';
import { 
  Calendar, 
  Clock, 
  ExternalLink, 
  Users, 
  Sparkles, 
  Gamepad2, 
  Tv, 
  Film, 
  Cpu, 
  CheckCircle2 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DigitalEventCardProps {
  event: DigitalEvent;
  compact?: boolean;
}

export default function DigitalEventCard({ event, compact = false }: DigitalEventCardProps) {
  const { user } = useAuth();
  const { rsvpEvent, clubs, societies } = useChannelsStore();
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  const club = clubs.find((c) => c.id === event.club_id);
  const society = societies.find((s) => s.id === event.society_id);
  const currentUserId = user?.id || 'anon-guest';
  const hasRsvp = event.rsvp_user_ids.includes(currentUserId);

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(event.start_time).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [event.start_time]);

  const handleRsvp = () => {
    rsvpEvent(event.id, currentUserId);
    toast.success(hasRsvp ? 'RSVP withdrawn' : `RSVP confirmed! +${event.xp_reward} XP added`);
  };

  const getCategoryIcon = () => {
    switch (event.category) {
      case 'game': return <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'anime': return <Tv className="w-3.5 h-3.5 text-pink-400" />;
      case 'movie': return <Film className="w-3.5 h-3.5 text-amber-400" />;
      case 'tech': return <Cpu className="w-3.5 h-3.5 text-cyan-400" />;
      default: return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  const formattedDate = new Date(event.start_time).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className={`ios-glass-card rounded-2xl overflow-hidden transition-all duration-300 flex flex-col group ${
      compact ? 'p-3.5' : 'p-5'
    }`}>
      {/* Banner / Poster Header */}
      <div className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden border border-white/10 bg-black/60 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.banner_url}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040406] via-black/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium uppercase bg-black/80 border border-white/10 text-zinc-200 backdrop-blur-md">
            {getCategoryIcon()}
            <span>{event.category}</span>
          </span>

          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium uppercase bg-black/60 border border-white/10 text-zinc-300 backdrop-blur-md">
            {event.event_type.replace('_', ' ')}
          </span>
        </div>

        {/* XP Reward Badge */}
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 border border-white/10 text-zinc-300 font-mono text-[10px] font-semibold backdrop-blur-md">
          +{event.xp_reward} XP
        </div>

        {/* Live Countdown Clock */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs">
          {timeLeft ? (
            <div className="flex items-center gap-1 text-[11px] font-mono font-medium text-zinc-200 bg-black/80 px-2.5 py-1 rounded-md border border-white/15 backdrop-blur-md">
              <Clock className="w-3 h-3 text-zinc-400" />
              <span>
                {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
              </span>
            </div>
          ) : (
            <div className="px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-white font-mono text-[11px] font-medium">
              LIVE NOW
            </div>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="flex-1 flex flex-col justify-between pt-3.5 gap-3">
        <div>
          {/* Host Club / Society Identity */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 mb-1">
            {club && (
              <span className="text-zinc-300 font-bold">
                [{club.tag}] {club.name}
              </span>
            )}
            {society && (
              <span className="text-purple-400">
                • {society.name}
              </span>
            )}
          </div>

          <h3 className="font-display font-bold text-sm sm:text-base text-white hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
            {event.title}
          </h3>

          <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Footer Meta & RSVP Controls */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3 text-xs">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[11px] font-mono text-zinc-300 flex items-center gap-1 truncate">
              <Calendar className="w-3 h-3 text-zinc-500" />
              {formattedDate}
            </span>
            <span className="text-[10px] text-cyan-400 truncate">
              📍 {event.platform_name}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={event.platform_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
              title="Open link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleRsvp}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                hasRsvp
                  ? 'bg-white/10 text-white border border-white/15'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/10'
              }`}
            >
              {hasRsvp ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Attending</span>
                </>
              ) : (
                <>
                  <Users className="w-3.5 h-3.5 text-zinc-400" />
                  <span>RSVP</span>
                </>
              )}
              <span className="font-mono text-[10px] text-zinc-400">
                ({event.rsvp_user_ids.length})
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}