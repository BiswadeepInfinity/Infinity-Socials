'use client';

import React from 'react';
import Link from 'next/link';
import { MediaTitle } from '@/types/media';

interface MediaTitleCardProps {
  media: MediaTitle;
}

export default function MediaTitleCard({ media }: MediaTitleCardProps) {
  // Determine badge styling
  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'New Movie':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Season 1 Episode 3':
      case 'New Episode':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'OTT Release':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Trailer':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'Must Play':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-zinc-800/80 text-zinc-300 border-white/10';
    }
  };

  return (
    <Link
      href={`/title/${media.slug || media.id}`}
      className="group block relative no-underline select-none"
    >
      <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-950 border border-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.6)] transition-all duration-300 group-hover:scale-[1.03] group-hover:border-white/30 group-hover:shadow-[0_12px_32px_rgba(255,255,255,0.1)]">
        {/* Poster Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media.posterUrl}
          alt={media.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Ambient Dark Gradient on bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Top Type / Rating Chip */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {media.rating && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/70 backdrop-blur-md border border-white/20 text-amber-300 shadow-md">
              ★ {media.rating}
            </span>
          )}
        </div>

        {/* Floating Quick Action Overlay on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white text-xl shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            ▶
          </div>
        </div>

        {/* Bottom Badge inside the image */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between">
          <span
            className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider border backdrop-blur-md ${getBadgeStyle(
              media.badge
            )}`}
          >
            {media.badge}
          </span>
          {media.relatedArticles && media.relatedArticles.length > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/80 border border-white/15 backdrop-blur-md">
              {media.relatedArticles.length} {media.relatedArticles.length === 1 ? 'Article' : 'Articles'}
            </span>
          )}
        </div>
      </div>

      {/* Meta underneath poster */}
      <div className="mt-2.5 px-0.5">
        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate group-hover:text-amber-400 transition-colors">
          {media.title}
        </h3>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400">
          <span>{media.badge}</span>
          <span>•</span>
          <span className="capitalize">{media.type}</span>
          {media.releaseYear && (
            <>
              <span>•</span>
              <span className="font-mono text-[11px] text-zinc-500">{media.releaseYear}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
