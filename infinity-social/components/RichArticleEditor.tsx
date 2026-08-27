'use client';

import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { compressImageToWebP } from '@/lib/image-compression';

interface RichArticleEditorProps {
  value: string;
  onChange: (markdownText: string) => void;
  userId?: string;
  placeholder?: string;
}

export default function RichArticleEditor({
  value,
  onChange,
  userId = 'anonymous',
  placeholder = 'Write your in-depth review breakdown here... Add headings, bold highlights, quotes, or insert images wherever you want!',
}: RichArticleEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to insert formatting tags at current cursor position
  const insertFormatting = (before: string, after: string = '', defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end) || defaultPlaceholder;
    const replacement = `${before}${selectedText}${after}`;

    const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 10);
  };

  // Image Upload handler to Supabase storage with automatic WebP compression & multiple image stack support
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      setUploadingImage(true);

      const uploadPromises = files.map(async (file, i) => {
        // 1. Compress image to modern WebP format client-side (saving 80-90% storage)
        const { file: compressedFile } = await compressImageToWebP(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.82,
        });

        const fileName = `${Date.now()}_${i}_inline.webp`;
        const filePath = `${userId}/articles/inline/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, compressedFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        return {
          name: file.name.replace(/\.[^/.]+$/, ''),
          url: data.publicUrl,
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);

      if (uploadedImages.length === 1) {
        // Single image
        const img = uploadedImages[0];
        insertFormatting(`\n\n![${img.name}](${img.url})\n*Caption: `, `*\n\n`, 'Describe this screenshot');
      } else {
        // Multi-image Stack Gallery
        const combinedAlt = uploadedImages.map(img => img.name).join(' | ');
        const combinedUrls = uploadedImages.map(img => img.url).join(' | ');
        insertFormatting(`\n\n![${combinedAlt}](${combinedUrls})\n*Image Stack (${uploadedImages.length} images) — Click arrows or swipe to browse*\n\n`, '', '');
      }
    } catch (err: any) {
      console.error('Error uploading inline images:', err);
      alert('Failed to upload image(s). Please try again.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Simple and safe markdown parser for rendering formatted content
  const renderFormattedPreview = (markdown: string) => {
    if (!markdown.trim()) {
      return <p className="text-white/30 italic text-xs">No text written yet. Switch to "Write" to start crafting your article.</p>;
    }

    const lines = markdown.split('\n');
    return (
      <div className="space-y-3.5 text-xs leading-relaxed text-white/85">
        {lines.map((line, idx) => {
          // 1. Headings
          if (line.startsWith('### ')) {
            return <h4 key={idx} className="text-sm font-bold text-white mt-3.5 mb-1 font-display">{line.replace('### ', '')}</h4>;
          }
          if (line.startsWith('## ')) {
            return <h3 key={idx} className="text-base font-bold text-white mt-5 mb-2 border-b border-white/[0.08] pb-1 font-display">{line.replace('## ', '')}</h3>;
          }
          if (line.startsWith('# ')) {
            return <h2 key={idx} className="text-lg sm:text-xl font-bold text-white mt-6 mb-2.5 font-display">{line.replace('# ', '')}</h2>;
          }

          // 2. Blockquote: Cyan Gradient & Italic Serif Glow
          if (line.startsWith('> ')) {
            return (
              <blockquote
                key={idx}
                className="my-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-950/30 to-transparent border-l-4 border-cyan-400 font-display font-medium text-sm sm:text-base text-white italic shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
              >
                “{line.replace('> ', '').replace(/^["“”]/, '').replace(/["“”]$/, '')}”
              </blockquote>
            );
          }

          // 3. Image or Multi-Image Stack with 16:9 aspect ratio
          const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
          if (imgMatch) {
            const rawAlts = imgMatch[1];
            const rawUrls = imgMatch[2];
            const urls = rawUrls.split(' | ').map(u => u.trim()).filter(Boolean);
            const alts = rawAlts.split(' | ').map(a => a.trim());

            return (
              <figure key={idx} className="my-5 space-y-1.5">
                <div className="rounded-[20px] overflow-hidden border border-white/[0.12] bg-black shadow-2xl aspect-video relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={urls[0]} alt={alts[0] || 'Image'} className="w-full h-full object-cover" />
                  {urls.length > 1 && (
                    <div className="absolute top-3 right-3 bg-black/80 border border-white/20 px-2.5 py-1 rounded-full text-[10px] font-mono text-cyan-300 font-bold backdrop-blur-md">
                      📚 Image Stack ({urls.length} images)
                    </div>
                  )}
                </div>
                {alts[0] && <figcaption className="text-[11px] text-center text-white/40 italic font-mono pt-0.5">— {alts[0]} {urls.length > 1 && `(+${urls.length - 1} more in stack)`}</figcaption>}
              </figure>
            );
          }

          // 4. List items
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <li key={idx} className="ml-4 list-disc text-white/75">
                {line.replace(/^[-*]\s+/, '')}
              </li>
            );
          }

          // 5. Empty space
          if (!line.trim()) {
            return <div key={idx} className="h-1.5" />;
          }

          // 6. Regular paragraph with bolding parser
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
            <p key={idx} className="text-white/80 leading-relaxed">
              {parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={pIdx} className="text-white font-bold">{part.slice(2, -2)}</strong>;
                }
                return part;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-[#0d0d14] overflow-hidden focus-within:border-white/20 transition-all shadow-2xl flex flex-col ${
        isFullscreen
          ? 'fixed inset-4 sm:inset-10 z-[100] max-w-5xl mx-auto shadow-[0_0_100px_rgba(0,0,0,0.95)]'
          : 'w-full'
      }`}
    >
      {/* Editor Top Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-white/[0.03] border-b border-white/[0.06] text-xs">
        {/* Left: Quick Format Actions */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          <button
            type="button"
            onClick={() => insertFormatting('**', '**', 'Bold text')}
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-white/80 hover:text-white font-bold transition-colors cursor-pointer"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*', 'Italic text')}
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-white/80 hover:text-white italic transition-colors cursor-pointer"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('## ', '', 'Section Heading')}
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-white/80 hover:text-white font-mono font-bold transition-colors cursor-pointer"
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('### ', '', 'Subheading')}
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-white/80 hover:text-white font-mono font-bold transition-colors cursor-pointer"
            title="Heading 3"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('> ', '', 'Notable quote or takeaway')}
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Quote"
          >
            “ Quote
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('- ', '', 'List item')}
            className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Bullet List"
          >
            • List
          </button>

          {/* Insert Image / Multi-Image Stack Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-medium transition-all flex items-center gap-1.5 cursor-pointer border border-cyan-500/30"
            title="Upload single image or select multiple for an Interactive Image Stack"
          >
            <span>{uploadingImage ? '⏳ Compressing & Uploading...' : '🖼️ + Add Photos / Stack'}</span>
          </button>
        </div>

        {/* Right: Write vs Preview & Fullscreen Toggle */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/40 border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                activeTab === 'write' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              ✏️ Write
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                activeTab === 'preview' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              👁️ Preview
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-white/50 hover:text-white text-xs transition-colors cursor-pointer"
            title={isFullscreen ? 'Collapse' : 'Expand Fullscreen'}
          >
            {isFullscreen ? '✕ Exit' : '⛶ Expand'}
          </button>
        </div>
      </div>

      {/* Editor Content Area (Much Larger Spacious Canvas) */}
      {activeTab === 'write' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full p-4 bg-transparent text-white text-xs leading-relaxed outline-none resize-y placeholder-white/20 font-sans ${
            isFullscreen ? 'flex-1 min-h-[500px]' : 'min-h-[280px]'
          }`}
        />
      ) : (
        <div
          className={`p-6 bg-white/[0.01] overflow-y-auto ${
            isFullscreen ? 'flex-1 min-h-[500px]' : 'min-h-[280px] max-h-[520px]'
          }`}
        >
          {renderFormattedPreview(value)}
        </div>
      )}

      {/* Footer helper hint */}
      <div className="px-4 py-2 bg-white/[0.02] border-t border-white/[0.04] flex items-center justify-between text-[10.5px] text-white/35 font-mono">
        <span>Tip: Use **bold**, ## Headings, &gt; Quotes, or Click &apos;🖼️ Insert Image&apos;</span>
        <span>{value.length} characters • {value.split(/\s+/).filter(Boolean).length} words</span>
      </div>
    </div>
  );
}
