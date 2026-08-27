'use client';

import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

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

  // Image Upload handler to Supabase storage with markdown insertion
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_inline.${fileExt}`;
      const filePath = `${userId}/articles/inline/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // Insert markdown image tag at cursor
      insertFormatting(`\n\n![${file.name.replace(/\.[^/.]+$/, '')}](${publicUrl})\n*Caption: `, `*\n\n`, 'Describe this screenshot');
    } catch (err: any) {
      console.error('Error uploading inline image:', err);
      alert('Failed to upload image. Please try again.');
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

          // 2. Blockquote
          if (line.startsWith('> ')) {
            return (
              <blockquote key={idx} className="border-l-2 border-amber-400 pl-3.5 py-1.5 bg-white/[0.02] rounded-r-xl italic text-white/90 my-2">
                {line.replace('> ', '')}
              </blockquote>
            );
          }

          // 3. Image with Caption: ![alt](url)
          const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
          if (imgMatch) {
            const alt = imgMatch[1];
            const src = imgMatch[2];
            return (
              <div key={idx} className="my-4 space-y-1.5">
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-xl max-h-[460px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={alt} className="w-full h-full object-cover" />
                </div>
                {alt && <p className="text-[10.5px] text-center text-white/40 italic font-mono">{alt}</p>}
              </div>
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

          {/* Insert Image Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 font-medium transition-colors cursor-pointer disabled:opacity-50"
            title="Insert Inline Image / Screenshot"
          >
            <span>{uploadingImage ? '⏳' : '🖼️'}</span>
            <span>{uploadingImage ? 'Uploading...' : 'Insert Image'}</span>
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
