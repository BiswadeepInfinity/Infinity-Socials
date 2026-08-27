'use client';

import React, { useState } from 'react';

interface ArticleRendererProps {
  content: string;
  className?: string;
  isExcerpt?: boolean;
}

// 3D Image Stack Carousel Component for traversing multiple images in the same slot
function ImageStackViewer({ urls, alts }: { urls: string[]; alts: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((c) => (c > 0 ? c - 1 : urls.length - 1));
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((c) => (c < urls.length - 1 ? c + 1 : 0));
  };

  return (
    <figure className="my-10 space-y-3">
      {/* 3D Stack Container */}
      <div className="relative aspect-video w-full select-none">
        
        {/* Layer 3 - Bottom-most stack shadow card */}
        {urls.length > 2 && (
          <div className="absolute inset-0 top-3 scale-[0.92] rounded-[28px] bg-white/[0.03] border border-white/[0.04] backdrop-blur-sm -z-20 transition-all duration-300 pointer-events-none" />
        )}

        {/* Layer 2 - Middle stack card */}
        {urls.length > 1 && (
          <div className="absolute inset-0 top-1.5 scale-[0.96] rounded-[28px] bg-[#0c0c16] border border-white/[0.08] shadow-xl -z-10 transition-all duration-300 pointer-events-none" />
        )}

        {/* Layer 1 - Active Top Image */}
        <div className="w-full h-full rounded-[28px] overflow-hidden border border-white/[0.15] bg-black shadow-[0_25px_70px_rgba(0,0,0,0.9)] relative group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urls[currentIndex]}
            alt={alts[currentIndex] || `Image ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-all duration-500"
          />

          {/* Overlay Gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          {/* Navigation Arrows */}
          <button
            onClick={prev}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-lg hover:scale-110 active:scale-95 cursor-pointer opacity-90 group-hover:opacity-100"
            title="Previous image"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-lg hover:scale-110 active:scale-95 cursor-pointer opacity-90 group-hover:opacity-100"
            title="Next image"
          >
            ›
          </button>

          {/* Stack Count Badge */}
          <div className="absolute top-4 right-4 bg-black/70 border border-white/15 px-3 py-1 rounded-full text-xs font-mono font-bold text-cyan-300 backdrop-blur-md shadow-md flex items-center gap-1.5">
            <span>📚</span>
            <span>{currentIndex + 1} / {urls.length}</span>
          </div>

          {/* Dot Indicators */}
          <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
            {urls.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === currentIndex ? 'w-5 bg-cyan-400' : 'w-1.5 bg-white/30 hover:bg-white/60'
                }`}
                title={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Caption with active slide info */}
      <figcaption className="text-xs sm:text-sm text-center text-white/85 font-mono pt-2 font-medium tracking-wide">
        <span className="text-cyan-400/80 mr-1.5 font-bold">—</span>
        <span className="text-white/90">{alts[currentIndex] || `Photo ${currentIndex + 1}`}</span>
        <span className="text-cyan-400/70 ml-2 text-[11px]">({currentIndex + 1} of {urls.length})</span>
      </figcaption>
    </figure>
  );
}

export default function ArticleRenderer({
  content,
  className = '',
  isExcerpt = false,
}: ArticleRendererProps) {
  if (!content) return null;

  if (isExcerpt) {
    // Strip markdown tags for clean excerpt
    const plainText = content
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/[#*`>_]/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    return (
      <p className={`text-xs text-white/70 leading-relaxed italic line-clamp-2 ${className}`}>
        "{plainText}"
      </p>
    );
  }

  const lines = content.split('\n');

  return (
    <div className={`space-y-6 text-base sm:text-lg leading-relaxed text-white/80 font-light ${className}`}>
      {lines.map((line, idx) => {
        // 1. Heading 1
        if (line.startsWith('# ')) {
          return (
            <h2 key={idx} className="font-display font-bold text-2xl sm:text-3xl text-white pt-8 pb-2 tracking-tight">
              {line.replace('# ', '')}
            </h2>
          );
        }

        // 2. Heading 2
        if (line.startsWith('## ')) {
          return (
            <h3 key={idx} className="font-display font-bold text-xl sm:text-2xl text-white pt-6 pb-1 tracking-tight border-b border-white/[0.08]">
              {line.replace('## ', '')}
            </h3>
          );
        }

        // 3. Heading 3
        if (line.startsWith('### ')) {
          return (
            <h4 key={idx} className="font-display font-bold text-lg sm:text-xl text-white/95 pt-4 pb-1">
              {line.replace('### ', '')}
            </h4>
          );
        }

        // 4. Blockquotes: Glowing Cyan Border + Gradient Glass
        if (line.startsWith('> ')) {
          return (
            <blockquote
              key={idx}
              className="my-8 p-6 rounded-2xl bg-gradient-to-r from-violet-950/30 to-transparent border-l-4 border-cyan-400 font-display font-medium text-lg sm:text-xl text-white italic shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
            >
              “{line.replace('> ', '').replace(/^["“”]/, '').replace(/["“”]$/, '')}”
            </blockquote>
          );
        }

        // 5. Attached Images / Multiple Image Stacks (16:9 Cinematic Ratio)
        const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
        if (imgMatch) {
          const rawAlts = imgMatch[1];
          const rawUrls = imgMatch[2];

          const urls = rawUrls.split(' | ').map((u) => u.trim()).filter(Boolean);
          const alts = rawAlts.split(' | ').map((a) => a.trim());

          if (urls.length > 1) {
            return <ImageStackViewer key={idx} urls={urls} alts={alts} />;
          }

          const alt = alts[0] || '';
          const src = urls[0] || rawUrls;

          return (
            <figure key={idx} className="my-8 space-y-2">
              <div className="rounded-[28px] overflow-hidden border border-white/[0.12] bg-black shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative group aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
              {alt && (
                <figcaption className="text-xs sm:text-sm text-center text-white/85 font-mono pt-2 font-medium tracking-wide">
                  <span className="text-cyan-400/80 mr-1.5 font-bold">—</span>
                  <span className="text-white/90">{alt}</span>
                </figcaption>
              )}
            </figure>
          );
        }

        // 6. Bullet Lists
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <li key={idx} className="ml-5 list-disc text-white/80 leading-[1.8] pl-1">
              {line.replace(/^[-*]\s+/, '')}
            </li>
          );
        }

        // 7. Empty line spacing
        if (!line.trim()) {
          return <div key={idx} className="h-3" />;
        }

        // 8. Regular paragraph text with **bold** & *italic* formatting
        const formattedLine = line.split(/(\*\*.*?\*\*)/g).map((chunk, cIdx) => {
          if (chunk.startsWith('**') && chunk.endsWith('**')) {
            return <strong key={cIdx} className="font-semibold text-white">{chunk.slice(2, -2)}</strong>;
          }
          return chunk;
        });

        return (
          <p key={idx} className="text-white/80 leading-[1.85]">
            {formattedLine}
          </p>
        );
      })}
    </div>
  );
}
