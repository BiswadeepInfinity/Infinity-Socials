'use client';

import React from 'react';

interface ArticleRendererProps {
  content: string;
  className?: string;
  isExcerpt?: boolean;
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
    <div className={`space-y-3.5 text-xs text-white/80 leading-relaxed ${className}`}>
      {lines.map((line, idx) => {
        // 1. Heading 1
        if (line.startsWith('# ')) {
          return (
            <h2 key={idx} className="text-lg sm:text-xl font-bold tracking-tight text-white mt-5 mb-2 font-display">
              {line.replace('# ', '')}
            </h2>
          );
        }

        // 2. Heading 2
        if (line.startsWith('## ')) {
          return (
            <h3 key={idx} className="text-base sm:text-lg font-bold text-white mt-4 mb-1.5 border-b border-white/[0.08] pb-1 font-display">
              {line.replace('## ', '')}
            </h3>
          );
        }

        // 3. Heading 3
        if (line.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-sm font-bold text-white/95 mt-3 mb-1 font-display">
              {line.replace('### ', '')}
            </h4>
          );
        }

        // 4. Blockquotes
        if (line.startsWith('> ')) {
          return (
            <blockquote key={idx} className="border-l-2 border-amber-400/80 pl-3.5 py-1.5 my-2.5 bg-white/[0.02] rounded-r-xl italic text-white/90">
              {line.replace('> ', '')}
            </blockquote>
          );
        }

        // 5. Attached Images with Captions: ![alt](url)
        const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
        if (imgMatch) {
          const alt = imgMatch[1];
          const src = imgMatch[2];
          return (
            <figure key={idx} className="my-4 space-y-1.5">
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-xl max-h-[440px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt}
                  className="w-full h-full object-cover hover:scale-[1.01] transition-transform duration-300"
                />
              </div>
              {alt && (
                <figcaption className="text-[10.5px] text-center text-white/45 italic font-mono">
                  {alt}
                </figcaption>
              )}
            </figure>
          );
        }

        // 6. Bullet Lists
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <li key={idx} className="ml-4 list-disc text-white/75 space-y-1">
              {line.replace(/^[-*]\s+/, '')}
            </li>
          );
        }

        // 7. Empty line spacing
        if (!line.trim()) {
          return <div key={idx} className="h-1.5" />;
        }

        // 8. Regular text with **bold** & *italic* formatting
        const formattedLine = line.split(/(\*\*.*?\*\*)/g).map((chunk, cIdx) => {
          if (chunk.startsWith('**') && chunk.endsWith('**')) {
            return <strong key={cIdx} className="font-bold text-white">{chunk.slice(2, -2)}</strong>;
          }
          return chunk;
        });

        return (
          <p key={idx} className="text-white/75 leading-relaxed">
            {formattedLine}
          </p>
        );
      })}
    </div>
  );
}
