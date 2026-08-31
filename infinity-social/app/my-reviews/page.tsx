'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ButterflyLoader from '@/components/ButterflyLoader';
import RichArticleEditor from '@/components/RichArticleEditor';
import ArticleRenderer from '@/components/ArticleRenderer';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { UserReview } from '@/types/database';
import Link from 'next/link';
import { compressImageToWebP } from '@/lib/image-compression';

type ReviewFilter = 'all' | 'must_buy' | 'wait_sale' | 'wait_patches' | 'skip';

const VERDICT_CONFIG = {
  must_buy: { label: '🔥 Must Buy / Watch', pill: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
  wait_sale: { label: '🏷️ Wait for Sale', pill: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
  wait_patches: { label: '⏳ Wait / Patches', pill: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' },
  skip: { label: '🚫 Skip', pill: 'bg-rose-500/10 text-rose-300 border-rose-500/30' },
};

export default function MyReviewsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReviewFilter>('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<UserReview | null>(null);
  
  // Structured Review Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Game' | 'Movie' | 'Anime' | 'Series' | 'Tech' | 'Music'>('Game');
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear());
  const [verdict, setVerdict] = useState<'must_buy' | 'wait_sale' | 'wait_patches' | 'skip'>('must_buy');
  const [score, setScore] = useState<number>(95);
  const [content, setContent] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [voicePreview, setVoicePreview] = useState<string | null>(null);
  const [existingVoiceUrl, setExistingVoiceUrl] = useState<string>('');
  const [proInput, setProInput] = useState('');
  const [pros, setPros] = useState<string[]>([]);
  const [conInput, setConInput] = useState('');
  const [cons, setCons] = useState<string[]>([]);
  const [bottomLine, setBottomLine] = useState('');

  // Image Upload State
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchMyReviews = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_reviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase query warning/error on user_reviews:', error.message || error);
      }
      if (data) {
        setReviews(data as UserReview[]);
      } else {
        setReviews([]);
      }
    } catch (err: any) {
      console.warn('Error fetching user reviews:', err?.message || err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyReviews();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#060609] text-white flex items-center justify-center">
        <ButterflyLoader size="lg" text="AUTHENTICATING..." />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-[#060609] text-white flex flex-col justify-between">
        <Navbar />
        <div className="text-center py-28 px-4">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-4 text-2xl">
            ✍️
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Sign in to View Your Reviews</h2>
          <p className="text-sm text-white/50 mb-6 max-w-sm mx-auto">
            Manage your personal library of critiques, scores, and verdicts.
          </p>
          <Link href="/auth/login" className="btn-editorial-primary px-8 py-3 rounded-full inline-block font-semibold text-xs tracking-wider uppercase">
            Sign In
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const openNewModal = () => {
    setEditingReview(null);
    setTitle('');
    setCategory('Game');
    setReleaseYear(new Date().getFullYear());
    setVerdict('must_buy');
    setScore(95);
    setContent('');
    setYoutubeUrl('');
    setVoiceFile(null);
    setVoicePreview(null);
    setExistingVoiceUrl('');
    setPros([]);
    setCons([]);
    setBottomLine('');
    setCoverFile(null);
    setCoverPreview(null);
    setExistingCoverUrl('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (rev: UserReview) => {
    setEditingReview(rev);
    setTitle(rev.title);
    setCategory(rev.category);
    setReleaseYear(rev.release_year);
    setVerdict(rev.verdict);
    setScore(rev.score);
    setContent(rev.content);
    setYoutubeUrl(rev.youtube_url || '');
    setVoiceFile(null);
    setVoicePreview(null);
    setExistingVoiceUrl(rev.voice_url || '');
    setPros(rev.pros || []);
    setCons(rev.cons || []);
    setBottomLine(rev.bottom_line || '');
    setCoverFile(null);
    setCoverPreview(null);
    setExistingCoverUrl(rev.cover_url || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleAddPro = () => {
    if (proInput.trim()) {
      setPros([...pros, proInput.trim()]);
      setProInput('');
    }
  };

  const handleAddCon = () => {
    if (conInput.trim()) {
      setCons([...cons, conInput.trim()]);
      setConInput('');
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 8 * 1024 * 1024) {
        setFormError('Image must be under 8MB.');
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
      setFormError(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    setReviews((prev) => prev.filter((r) => r.id !== id));
    await supabase.from('user_reviews').delete().eq('id', id).eq('user_id', user.id);
  };

  const handleVoiceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 25 * 1024 * 1024) {
        setFormError('Voice review audio must be under 25MB.');
        return;
      }
      setVoiceFile(file);
      setVoicePreview(URL.createObjectURL(file));
      setFormError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setFormError('Title and Detailed Breakdown are required.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      let finalCoverUrl = existingCoverUrl;
      let finalVoiceUrl = existingVoiceUrl;

      // Upload Cover Image file to Supabase storage if selected with WebP compression
      if (coverFile) {
        const { file: compressedCover } = await compressImageToWebP(coverFile, {
          maxWidth: 1200,
          maxHeight: 1600,
          quality: 0.85,
        });

        const filePath = `${user.id}/reviews/covers/${Date.now()}.webp`;

        const { error: uploadErr } = await supabase.storage
          .from('avatars')
          .upload(filePath, compressedCover, { upsert: true });

        if (uploadErr) {
          throw new Error(`Cover upload error: ${uploadErr.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        finalCoverUrl = publicUrlData.publicUrl;
      }

      // Upload Voice Review Audio file to Supabase storage if selected
      if (voiceFile) {
        const fileExt = voiceFile.name.split('.').pop();
        const filePath = `${user.id}/reviews/audio/${Date.now()}.${fileExt}`;

        const { error: voiceUploadErr } = await supabase.storage
          .from('avatars')
          .upload(filePath, voiceFile, { upsert: true });

        if (voiceUploadErr) {
          throw new Error(`Voice upload error: ${voiceUploadErr.message}`);
        }

        const { data: voiceUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        finalVoiceUrl = voiceUrlData.publicUrl;
      }

      // Fallback: If score is greater than 10 but table might be scale 0-10 or 0-100, we preserve number
      let normalizedScore = Number(score);
      if (isNaN(normalizedScore)) normalizedScore = 0;

      const payload: Record<string, any> = {
        user_id: user.id,
        title: title.trim(),
        category,
        release_year: Number(releaseYear) || new Date().getFullYear(),
        verdict,
        score: normalizedScore,
        content: content.trim(),
        youtube_url: youtubeUrl.trim(),
        voice_url: finalVoiceUrl || null,
        pros: pros || [],
        cons: cons || [],
        bottom_line: bottomLine.trim() || null,
        cover_url: finalCoverUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80',
        updated_at: new Date().toISOString(),
      };

      if (editingReview) {
        const { data, error } = await supabase
          .from('user_reviews')
          .update(payload)
          .eq('id', editingReview.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          console.error('Update review error:', error);
          throw new Error(error.message || 'Failed to update review in database');
        }
        setReviews((prev) => prev.map((r) => (r.id === editingReview.id ? (data as UserReview) : r)));
      } else {
        const { data, error } = await supabase
          .from('user_reviews')
          .insert({
            ...payload,
            upvotes_count: 0,
            downvotes_count: 0,
            likes_count: 0,
            comments_count: 0,
            is_public: true,
          })
          .select()
          .single();

        if (error) {
          console.error('Insert review error:', error);
          throw new Error(error.message || 'Failed to save review in database');
        }
        setReviews((prev) => [data as UserReview, ...prev]);
      }

      setIsModalOpen(false);
      alert('Review published successfully!');
    } catch (err: any) {
      console.error('Submission failed:', err);
      const msg = err.message || 'Failed to publish review. Please check database permissions.';
      setFormError(msg);
      alert(`Error publishing review: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filter !== 'all' && r.verdict !== filter) return false;
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    if (search.trim() && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#060609] text-[#ececf1] flex flex-col justify-between selection:bg-white selection:text-black">
      <Navbar />

      <main className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-white/[0.08]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>My Reviews</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/[0.08] text-white/70">
                {reviews.length} total
              </span>
            </h1>
            <p className="text-xs text-white/45 mt-1 font-normal">
              Manage your personal critiques, pros & cons, and verdicts.
            </p>
          </div>

          <button
            onClick={openNewModal}
            className="px-4 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-2"
          >
            <span>+ Write Structured Review</span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-6">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {(
              [
                { id: 'all', label: 'All Verdicts' },
                { id: 'must_buy', label: '🔥 Must Buy / Watch' },
                { id: 'wait_sale', label: '🏷️ Wait for Sale' },
                { id: 'wait_patches', label: '⏳ Wait / Patches' },
                { id: 'skip', label: '🚫 Skip' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  filter === f.id
                    ? 'bg-white/[0.12] text-white border border-white/20'
                    : 'text-white/45 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg bg-white/[0.03] border border-white/[0.08] text-white outline-none"
            >
              <option value="all">All Media Types</option>
              <option value="Game">Games</option>
              <option value="Movie">Movies</option>
              <option value="Anime">Anime</option>
              <option value="Series">Series</option>
              <option value="Tech">Tech</option>
              <option value="Music">Music</option>
            </select>

            <input
              type="text"
              placeholder="Search titles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-36 sm:w-44 px-3 py-1 text-xs rounded-lg bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/25 outline-none focus:border-white/30"
            />
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="p-16 text-center rounded-2xl bg-[#0e0e13] border border-white/[0.06]">
            <ButterflyLoader size="md" text="LOADING REVIEWS..." />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-[#0e0e13] border border-white/[0.06]">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto mb-3 text-xl">
              📝
            </div>
            <h3 className="text-sm font-bold text-white mb-1">No reviews found</h3>
            <p className="text-xs text-white/40 mb-4 max-w-sm mx-auto">
              {search || filter !== 'all' || categoryFilter !== 'all'
                ? 'No critiques match your active filters.'
                : "You haven't written any critiques yet. Share your first score!"}
            </p>
            <button
              onClick={openNewModal}
              className="px-4 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-all cursor-pointer"
            >
              Write First Review
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReviews.map((rev) => {
              const verdictCfg = VERDICT_CONFIG[rev.verdict] || VERDICT_CONFIG.must_buy;
              return (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-[#0e0e13] border border-white/[0.07] hover:border-white/[0.14] transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex gap-4 items-start">
                    <Link
                      href={`/reviews/${rev.id}`}
                      className="w-24 h-32 rounded-xl overflow-hidden bg-black/40 border border-white/[0.06] flex-shrink-0 relative block group"
                    >
                      <img
                        src={rev.cover_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80'}
                        alt={rev.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-emerald-400 font-mono border border-white/10">
                        {rev.score}%
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          href={`/reviews/${rev.id}`}
                          className="text-sm font-bold text-white tracking-tight line-clamp-1 hover:text-cyan-300 transition-colors"
                        >
                          {rev.title}
                        </Link>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex-shrink-0 ${verdictCfg.pill}`}>
                          {verdictCfg.label}
                        </span>
                      </div>

                      <p className="text-[11px] text-white/35 mt-0.5 font-mono">
                      {rev.category} • {rev.release_year} • {new Date(rev.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>

                    <ArticleRenderer content={rev.content} isExcerpt={true} className="mt-2" />
                    </div>
                  </div>

                  {/* Structured Pros & Cons Pill Preview */}
                  {((rev.pros && rev.pros.length > 0) || (rev.cons && rev.cons.length > 0)) && (
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2 text-xs">
                      {rev.pros && rev.pros.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase text-emerald-400 font-mono">Key Highlights:</span>
                          <ul className="space-y-0.5 text-white/70 text-[11px]">
                            {rev.pros.slice(0, 2).map((p, idx) => (
                              <li key={idx} className="line-clamp-1">✓ {p}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {rev.cons && rev.cons.length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-white/[0.03]">
                          <span className="text-[10px] font-bold uppercase text-rose-400 font-mono">Shortcomings:</span>
                          <ul className="space-y-0.5 text-white/70 text-[11px]">
                            {rev.cons.slice(0, 2).map((c, idx) => (
                              <li key={idx} className="line-clamp-1">✕ {c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Media Links: YouTube (Mandatory) & Voice Audio (Optional) */}
                  <div className="space-y-2 pt-1">
                    {rev.youtube_url && (
                      <a
                        href={rev.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-[11px] font-semibold transition-colors"
                      >
                        <span>▶</span>
                        <span>Watch on YouTube</span>
                      </a>
                    )}

                    {rev.voice_url && (
                      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-cyan-500/20 space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-mono">
                          <span>🎙️</span>
                          <span>Voice Review Commentary</span>
                        </div>
                        <audio src={rev.voice_url} controls className="w-full h-7 rounded-lg opacity-90" />
                      </div>
                    )}
                  </div>

                  {/* Bottom Line Verdict */}
                  {rev.bottom_line && (
                    <div className="px-3 py-2 rounded-xl bg-white/[0.02] border-l-2 border-violet-500 text-[11px] text-white/80 italic">
                      "{rev.bottom_line}"
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                    <span className="text-[11px] text-white/40 font-mono">♥ {rev.likes_count} likes</span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(rev)}
                        className="px-2.5 py-1 rounded bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-medium text-white/80 transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(rev.id)}
                        className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-[11px] font-medium text-rose-300 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* FIXED STRUCTURED REVIEW MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl p-6 sm:p-8 rounded-3xl bg-[#111116] border border-white/10 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingReview ? 'Edit Structured Review' : 'New Standardized Review'}
                </h3>
                <p className="text-xs text-white/40">Rich editorial critique editor with inline media support</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white text-base">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {formError}
                </div>
              )}

              {/* 1. Header Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-white/50">Media Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Elden Ring / Dune 2"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none focus:border-white/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-white/50">Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#16161d] border border-white/[0.08] text-white text-xs outline-none"
                  >
                    <option value="Game">Game</option>
                    <option value="Movie">Movie</option>
                    <option value="Anime">Anime</option>
                    <option value="Series">Series</option>
                    <option value="Tech">Tech</option>
                    <option value="Music">Music</option>
                  </select>
                </div>
              </div>

              {/* 2. Cover Photo File Upload */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-white/50 block">Upload Cover Art / Poster</label>
                <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center flex-shrink-0">
                    {coverPreview || existingCoverUrl ? (
                      <img src={coverPreview || existingCoverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl text-white/30">🖼️</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="review-cover-file"
                      className="inline-block px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white border border-white/10 transition-colors cursor-pointer"
                    >
                      Choose Poster File
                    </label>
                    <input
                      id="review-cover-file"
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <p className="text-[10px] text-white/35">Upload vertical poster or game key art (max 8MB).</p>
                  </div>
                </div>
              </div>

              {/* 3. Verdict & Score */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-white/50">Verdict Tier</label>
                  <select
                    value={verdict}
                    onChange={(e: any) => setVerdict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#16161d] border border-white/[0.08] text-white text-xs outline-none"
                  >
                    <option value="must_buy">🔥 Must Buy / Watch</option>
                    <option value="wait_sale">🏷️ Wait for Sale</option>
                    <option value="wait_patches">⏳ Wait / Patches</option>
                    <option value="skip">🚫 Skip</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-white/50">Score (0% to 100%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={score}
                      onChange={(e) => setScore(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none pr-8"
                    />
                    <span className="absolute right-3 top-2 text-xs text-white/40 font-mono">%</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-white/50">Release Year</label>
                  <input
                    type="number"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none"
                  />
                </div>
              </div>

              {/* 4. Detailed Critique with Rich Editor & Inline Images */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-white/50">Detailed Breakdown & Editorial Review</label>
                <RichArticleEditor
                  value={content}
                  onChange={setContent}
                  userId={user.id}
                  placeholder="Write your in-depth review breakdown here... Add headings, bold highlights, quotes, or insert screenshot images wherever you want!"
                />
              </div>

              {/* 5. Fixed Structure: Pros & Cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pros */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-emerald-500/[0.02] border border-emerald-500/20 shadow-inner">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                    <span>✓</span>
                    <span>Key Highlights (Pros)</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={proInput}
                      onChange={(e) => setProInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPro(); } }}
                      placeholder="Add key strength..."
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs outline-none focus:border-emerald-500/40"
                    />
                    <button
                      type="button"
                      onClick={handleAddPro}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <ul className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                    {pros.map((p, i) => (
                      <li key={i} className="text-xs text-white/90 flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                        <span>✓ {p}</span>
                        <button type="button" onClick={() => setPros(pros.filter((_, idx) => idx !== i))} className="text-white/40 hover:text-white ml-2 text-xs">✕</button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cons */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-rose-500/[0.02] border border-rose-500/20 shadow-inner">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-400 font-mono">
                    <span>✕</span>
                    <span>Shortcomings (Cons)</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={conInput}
                      onChange={(e) => setConInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCon(); } }}
                      placeholder="Add drawback or flaw..."
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs outline-none focus:border-rose-500/40"
                    />
                    <button
                      type="button"
                      onClick={handleAddCon}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <ul className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                    {cons.map((c, i) => (
                      <li key={i} className="text-xs text-white/90 flex items-center justify-between bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl">
                        <span>✕ {c}</span>
                        <button type="button" onClick={() => setCons(cons.filter((_, idx) => idx !== i))} className="text-white/40 hover:text-white ml-2 text-xs">✕</button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 6. Media Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-rose-400 font-mono">
                    <span>▶</span>
                    <span>YouTube Link (Optional)</span>
                  </div>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs outline-none focus:border-rose-500/40"
                  />
                  <p className="text-[10px] text-white/35">Provide video gameplay, trailer, or review URL.</p>
                </div>

                <div className="space-y-1.5 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                    <span>🎙️</span>
                    <span>Voice Review Audio (Optional)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="review-voice-file"
                      className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white border border-white/10 transition-colors cursor-pointer"
                    >
                      {voiceFile ? 'Change Audio File' : 'Upload Audio (.mp3, .m4a, .wav)'}
                    </label>
                    <input
                      id="review-voice-file"
                      type="file"
                      accept="audio/*"
                      onChange={handleVoiceFileChange}
                      className="hidden"
                    />
                    {(voicePreview || existingVoiceUrl) && (
                      <span className="text-[11px] text-cyan-300 font-mono">Ready ✓</span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/35">Upload recorded commentary (max 25MB).</p>
                </div>
              </div>

              {/* 7. Bottom Line */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-white/50 block">The Bottom Line (One-Sentence Summary)</label>
                <input
                  type="text"
                  value={bottomLine}
                  onChange={(e) => setBottomLine(e.target.value)}
                  placeholder="e.g. An uncompromising dark fantasy benchmark that surpasses all expectations."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-xs outline-none focus:border-white/30 italic"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : editingReview ? 'Update Critique' : 'Publish Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
