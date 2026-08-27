'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { UserReview, Collection, WatchlistItem } from '@/types/database';
import AvatarCropperModal from '@/components/AvatarCropperModal';
import ButterflyLoader from '@/components/ButterflyLoader';
import RichArticleEditor from '@/components/RichArticleEditor';
import ArticleRenderer from '@/components/ArticleRenderer';
import Link from 'next/link';

type TabType = 'reviews' | 'collections' | 'bookmarks';
type ReviewFilter = 'all' | 'must_buy' | 'wait_sale' | 'wait_patches' | 'skip';

const VERDICT_CONFIG = {
  must_buy: { label: '🔥 Must Buy / Watch', pill: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
  wait_sale: { label: '🏷️ Wait for Sale', pill: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
  wait_patches: { label: '⏳ Wait / Patches', pill: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' },
  skip: { label: '🚫 Skip', pill: 'bg-rose-500/10 text-rose-300 border-rose-500/30' },
};

export default function ProfilePage() {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();

  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<TabType>('reviews');
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Supabase Data State
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [userLikedReviewIds, setUserLikedReviewIds] = useState<Set<string>>(new Set());
  const [dataLoading, setDataLoading] = useState(true);

  // Edit Profile Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfileSuccess, setSavedProfileSuccess] = useState(false);
  const [profileModalError, setProfileModalError] = useState<string | null>(null);

  // New Review Modal
  const [isNewReviewModalOpen, setIsNewReviewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Game' | 'Movie' | 'Anime' | 'Series' | 'Tech' | 'Music'>('Game');
  const [newYear, setNewYear] = useState<number>(new Date().getFullYear());
  const [newVerdict, setNewVerdict] = useState<'must_buy' | 'wait_sale' | 'wait_patches' | 'skip'>('must_buy');
  const [newScore, setNewScore] = useState<number>(95);
  const [newContent, setNewContent] = useState('');
  const [newYoutubeUrl, setNewYoutubeUrl] = useState('');
  const [newVoiceFile, setNewVoiceFile] = useState<File | null>(null);
  const [newVoicePreview, setNewVoicePreview] = useState<string | null>(null);
  const [proInput, setProInput] = useState('');
  const [pros, setPros] = useState<string[]>([]);
  const [conInput, setConInput] = useState('');
  const [cons, setCons] = useState<string[]>([]);
  const [bottomLine, setBottomLine] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [creatingReview, setCreatingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // New Collection Modal
  const [isNewCollectionModalOpen, setIsNewCollectionModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [newCollectionIsPrivate, setNewCollectionIsPrivate] = useState(false);
  const [creatingCollection, setCreatingCollection] = useState(false);

  // New Watchlist Item
  const [isNewWatchlistOpen, setIsNewWatchlistOpen] = useState(false);
  const [watchTitle, setWatchTitle] = useState('');
  const [watchCategory, setWatchCategory] = useState('Game');
  const [watchWindow, setWatchWindow] = useState('2025');
  const [addingWatchlist, setAddingWatchlist] = useState(false);

  const loadUserData = async () => {
    if (!user) return;
    setDataLoading(true);

    try {
      const [revsRes, likesRes, colsRes, bmsRes, wlRes] = await Promise.all([
        supabase.from('user_reviews').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('user_review_likes').select('review_id').eq('user_id', user.id),
        supabase.from('collections').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('bookmarks').select('*, articles(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('user_watchlist').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);

      if (revsRes?.data) setReviews(revsRes.data as UserReview[]);
      if (colsRes?.data) setCollections(colsRes.data as Collection[]);
      if (bmsRes?.data) setBookmarks(bmsRes.data);
      if (wlRes?.data) setWatchlist(wlRes.data as WatchlistItem[]);
      if (likesRes?.data) {
        setUserLikedReviewIds(new Set(likesRes.data.map((l: any) => l.review_id)));
      }
    } catch (err: any) {
      console.warn('Error loading profile user data:', err?.message || err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setDisplayName(profile?.display_name || '');
      setBio(profile?.bio || '');
      loadUserData();
    }
  }, [user, profile]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center">
        <ButterflyLoader size="lg" text="AUTHENTICATING..." />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-[#050508] text-white flex flex-col justify-between">
        <Navbar />
        <div className="text-center py-28 px-4">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-4 text-2xl">
            🔒
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Profile Access Required</h2>
          <p className="text-sm text-white/50 mb-6 max-w-sm mx-auto">
            Please log in to your Infinity Social account to manage your profile, reviews, and library.
          </p>
          <Link href="/auth/login" className="btn-editorial-primary px-8 py-3 rounded-full inline-block font-semibold text-xs tracking-wider uppercase">
            Sign In
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleToggleLike = async (reviewId: string) => {
    const isLiked = userLikedReviewIds.has(reviewId);
    setUserLikedReviewIds((prev) => {
      const next = new Set(prev);
      if (isLiked) next.delete(reviewId);
      else next.add(reviewId);
      return next;
    });

    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, likes_count: r.likes_count + (isLiked ? -1 : 1) } : r))
    );

    if (isLiked) {
      await supabase.from('user_review_likes').delete().eq('review_id', reviewId).eq('user_id', user.id);
    } else {
      await supabase.from('user_review_likes').insert({ review_id: reviewId, user_id: user.id });
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    await supabase.from('user_reviews').delete().eq('id', reviewId).eq('user_id', user.id);
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setReviewError('Title and Detailed Breakdown are required');
      return;
    }
    if (!newYoutubeUrl.trim()) {
      setReviewError('YouTube Link is mandatory for this review.');
      return;
    }

    setCreatingReview(true);
    setReviewError(null);

    try {
      let finalCoverUrl = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80';
      let finalVoiceUrl: string | null = null;

      if (coverFile && user) {
        const fileExt = coverFile.name.split('.').pop();
        const filePath = `${user.id}/reviews/covers/${Date.now()}.${fileExt}`;

        const { error: uploadErr } = await supabase.storage
          .from('avatars')
          .upload(filePath, coverFile, { upsert: true });

        if (!uploadErr) {
          const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          finalCoverUrl = publicUrlData.publicUrl;
        }
      }

      if (newVoiceFile && user) {
        const fileExt = newVoiceFile.name.split('.').pop();
        const filePath = `${user.id}/reviews/audio/${Date.now()}.${fileExt}`;

        const { error: voiceUploadErr } = await supabase.storage
          .from('avatars')
          .upload(filePath, newVoiceFile, { upsert: true });

        if (!voiceUploadErr) {
          const { data: voiceUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          finalVoiceUrl = voiceUrlData.publicUrl;
        }
      }

      const payload = {
        user_id: user.id,
        title: newTitle.trim(),
        category: newCategory,
        release_year: Number(newYear),
        verdict: newVerdict,
        score: Number(newScore),
        content: newContent.trim(),
        youtube_url: newYoutubeUrl.trim(),
        voice_url: finalVoiceUrl,
        pros,
        cons,
        bottom_line: bottomLine.trim() || null,
        cover_url: finalCoverUrl,
        likes_count: 0,
        comments_count: 0,
        is_public: true,
      };

      const { data, error } = await supabase.from('user_reviews').insert(payload).select().single();
      if (error) throw error;

      if (data) {
        setReviews([data as UserReview, ...reviews]);
      }
      setIsNewReviewModalOpen(false);
      setNewTitle('');
      setNewContent('');
      setNewYoutubeUrl('');
      setNewVoiceFile(null);
      setNewVoicePreview(null);
      setPros([]);
      setCons([]);
      setBottomLine('');
      setCoverFile(null);
      setCoverPreview(null);
    } catch (err: any) {
      setReviewError(err.message || 'Failed to publish review');
    } finally {
      setCreatingReview(false);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    setCreatingCollection(true);

    try {
      const payload = {
        user_id: user.id,
        name: newCollectionName.trim(),
        description: newCollectionDesc.trim() || null,
        is_private: newCollectionIsPrivate,
        cover_gradient: 'from-violet-900/40 to-black/90',
        items_count: 0,
      };

      const { data, error } = await supabase.from('collections').insert(payload).select().single();
      if (error) throw error;

      if (data) {
        setCollections([data as Collection, ...collections]);
      }
      setIsNewCollectionModalOpen(false);
      setNewCollectionName('');
      setNewCollectionDesc('');
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingCollection(false);
    }
  };

  const handleAddWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!watchTitle.trim()) return;
    setAddingWatchlist(true);

    try {
      const payload = {
        user_id: user.id,
        title: watchTitle.trim(),
        category: watchCategory,
        release_window: watchWindow.trim() || '2025',
        hype_score: Math.floor(Math.random() * 8) + 92,
      };

      const { data, error } = await supabase.from('user_watchlist').insert(payload).select().single();
      if (error) throw error;

      if (data) {
        setWatchlist([data as WatchlistItem, ...watchlist]);
      }
      setIsNewWatchlistOpen(false);
      setWatchTitle('');
    } catch (err) {
      console.error(err);
    } finally {
      setAddingWatchlist(false);
    }
  };

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 8 * 1024 * 1024) {
        setProfileModalError('Image size must be under 8MB.');
        return;
      }
      const rawUrl = URL.createObjectURL(file);
      setRawImageForCrop(rawUrl);
      setIsCropModalOpen(true);
      setProfileModalError(null);
      e.target.value = '';
    }
  };

  const handleCropComplete = (croppedBlob: Blob, previewUrl: string) => {
    setAvatarBlob(croppedBlob);
    setAvatarPreview(previewUrl);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileModalError(null);

    try {
      let finalAvatarUrl = profile?.avatar_url || null;

      if (avatarBlob && user) {
        setUploadingAvatar(true);
        const filePath = `${user.id}/${Date.now()}.webp`;

        const { error: uploadErr } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarBlob, { upsert: true, contentType: 'image/webp' });

        if (uploadErr) {
          throw new Error(`Avatar upload failed: ${uploadErr.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        finalAvatarUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim() || profile?.username,
          bio: bio.trim(),
          avatar_url: finalAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      setSavedProfileSuccess(true);
      setAvatarBlob(null);
      setTimeout(() => {
        setSavedProfileSuccess(false);
        setIsEditModalOpen(false);
      }, 900);
    } catch (err: any) {
      setProfileModalError(err.message || 'Failed to save profile');
    } finally {
      setSavingProfile(false);
      setUploadingAvatar(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (reviewFilter !== 'all' && r.verdict !== reviewFilter) return false;
    if (searchQuery.trim() && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getInitials = () => {
    const name = profile.display_name || profile.username || 'U';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#060609] text-[#ececf1] flex flex-col justify-between selection:bg-white selection:text-black">
      <Navbar />

      {/* Main Container */}
      <main className="max-w-[1340px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          
          {/* ============================================================ */}
          {/* LEFT: Identity Card */}
          {/* ============================================================ */}
          <aside className="lg:col-span-4 xl:col-span-3.5">
            <div className="p-7 rounded-[28px] bg-[#0c0c12] border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.65)] flex flex-col items-center text-center relative overflow-hidden">
              {/* Subtle top ambient glow */}
              <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-violet-500/[0.08] to-transparent pointer-events-none" />

              {/* Profile Avatar */}
              <div className="w-28 h-28 rounded-full overflow-hidden bg-[#161622] border-2 border-white/10 flex items-center justify-center text-2xl font-bold relative shadow-2xl z-10">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold tracking-wider text-white/80">
                    {getInitials()}
                  </span>
                )}
                {profile.role === 'admin' && (
                  <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-violet-600 border-2 border-[#0c0c12] flex items-center justify-center text-[10px] text-white">
                    ★
                  </div>
                )}
              </div>

              {/* Names & Username */}
              <h1 className="mt-4 text-xl font-bold tracking-tight text-white z-10">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-xs text-white/40 font-mono mt-0.5 z-10">@{profile.username}</p>

              {/* Bio */}
              <p className="mt-3.5 text-xs text-white/50 italic leading-relaxed max-w-xs font-normal z-10">
                {profile.bio ? `"${profile.bio}"` : 'No bio added yet. Tell the world what you love!'}
              </p>

              {/* Activity Stats */}
              <div className="grid grid-cols-2 gap-2.5 w-full mt-6 pt-5 border-t border-white/[0.06] z-10">
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-lg font-bold text-white block">{reviews.length}</span>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Reviews</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-lg font-bold text-white block">{collections.length}</span>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Collections</span>
                </div>
              </div>

              {/* Follower Stats & Join Date */}
              <div className="flex items-center justify-center gap-4 mt-4 text-xs font-medium text-white/50 z-10">
                <span><strong className="text-white">128</strong> Followers</span>
                <span>•</span>
                <span><strong className="text-white">64</strong> Following</span>
              </div>

              <div className="flex items-center gap-1.5 mt-3 text-[11px] text-white/35 font-mono z-10">
                <span>🗓️ Joined {new Date(profile.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-2 mt-6 z-10">
                <button
                  onClick={() => {
                    setDisplayName(profile.display_name || '');
                    setBio(profile.bio || '');
                    setIsEditModalOpen(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </aside>

          {/* ============================================================ */}
          {/* CENTER: Editorial Feed & Activity */}
          {/* ============================================================ */}
          <section className="lg:col-span-8 xl:col-span-5.5 space-y-5">
            
            {/* Primary Segment Control Header */}
            <div className="flex items-center justify-between gap-4">
              <div className="p-1 rounded-2xl bg-[#0c0c12] border border-white/[0.08] flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'reviews'
                      ? 'bg-white/[0.09] text-white shadow-md border border-white/10'
                      : 'text-white/45 hover:text-white'
                  }`}
                >
                  <span>📝</span>
                  <span>Reviews ({reviews.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('collections')}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'collections'
                      ? 'bg-white/[0.09] text-white shadow-md border border-white/10'
                      : 'text-white/45 hover:text-white'
                  }`}
                >
                  <span>📁</span>
                  <span>Collections ({collections.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('bookmarks')}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'bookmarks'
                      ? 'bg-white/[0.09] text-white shadow-md border border-white/10'
                      : 'text-white/45 hover:text-white'
                  }`}
                >
                  <span>🔖</span>
                  <span>Bookmarks</span>
                </button>
              </div>

              <button
                onClick={() => setIsNewReviewModalOpen(true)}
                className="hidden sm:inline-flex px-3.5 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                + Write
              </button>
            </div>

            {/* TAB 1: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {/* Clean Filters Row */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    {(
                      [
                        { id: 'all', label: 'All' },
                        { id: 'must_buy', label: 'Must Buy / Watch' },
                        { id: 'wait_sale', label: 'Wait for Sale' },
                        { id: 'wait_patches', label: 'Wait / Patches' },
                        { id: 'skip', label: 'Skip' },
                      ] as const
                    ).map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setReviewFilter(filter.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          reviewFilter === filter.id
                            ? 'bg-white text-black font-bold shadow'
                            : 'bg-white/[0.04] text-white/50 hover:text-white border border-white/[0.06]'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Filter title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-32 sm:w-36 px-3 py-1.5 text-xs rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/25 outline-none focus:border-white/30"
                    />
                    <div className="flex items-center p-0.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`px-2 py-1 text-xs rounded-lg ${viewMode === 'list' ? 'bg-white/15 text-white' : 'text-white/40'}`}
                      >
                        ☰
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`px-2 py-1 text-xs rounded-lg ${viewMode === 'grid' ? 'bg-white/15 text-white' : 'text-white/40'}`}
                      >
                        ⊞
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                {dataLoading ? (
                  <div className="p-14 text-center rounded-3xl bg-[#0c0c12] border border-white/[0.06]">
                    <ButterflyLoader size="md" text="FETCHING REVIEWS..." />
                  </div>
                ) : filteredReviews.length === 0 ? (
                  <div className="p-14 text-center rounded-3xl bg-[#0c0c12] border border-white/[0.06]">
                    <p className="text-xs font-semibold text-white/50 mb-1">No reviews found</p>
                    <p className="text-[11px] text-white/30 mb-4">You haven't written any critiques matching this filter.</p>
                    <button
                      onClick={() => setIsNewReviewModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-bold cursor-pointer"
                    >
                      Post a Review
                    </button>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
                    {filteredReviews.map((rev) => {
                      const verdictCfg = VERDICT_CONFIG[rev.verdict] || VERDICT_CONFIG.must_buy;
                      return (
                        <div
                          key={rev.id}
                          className="p-5 rounded-[26px] bg-[#0c0c12] border border-white/[0.07] hover:border-white/[0.15] transition-all group flex flex-col sm:flex-row gap-5 items-start relative shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
                        >
                          {/* Left Poster */}
                          <div className="w-full sm:w-28 h-36 sm:h-36 rounded-2xl overflow-hidden bg-black/40 border border-white/[0.08] flex-shrink-0 relative">
                            <img
                              src={rev.cover_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80'}
                              alt={rev.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md text-[10px] font-bold text-white font-mono border border-white/10 shadow-lg">
                              ★ {rev.score}%
                            </div>
                          </div>

                          {/* Center Content */}
                          <div className="flex-1 flex flex-col justify-between h-full w-full">
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
                                  {rev.title}
                                </h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${verdictCfg.pill}`}>
                                  {verdictCfg.label}
                                </span>
                              </div>

                              <p className="text-[11px] text-white/35 mt-0.5 font-mono">
                                {rev.category} • {rev.release_year} • {new Date(rev.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>

                              <ArticleRenderer content={rev.content} isExcerpt={true} className="mt-2.5" />

                              {/* Media Link Badges */}
                              {(rev.youtube_url || rev.voice_url) && (
                                <div className="flex items-center gap-2 mt-3">
                                  {rev.youtube_url && (
                                    <a
                                      href={rev.youtube_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-[10px] font-semibold transition-colors"
                                    >
                                      <span>▶</span>
                                      <span>YouTube</span>
                                    </a>
                                  )}
                                  {rev.voice_url && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-semibold">
                                      <span>🎙️</span>
                                      <span>Voice Review</span>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Interaction Bottom Bar */}
                            <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.04]">
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => handleToggleLike(rev.id)}
                                  className={`flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                                    userLikedReviewIds.has(rev.id) ? 'text-rose-400' : 'text-white/40 hover:text-white'
                                  }`}
                                >
                                  <span>{userLikedReviewIds.has(rev.id) ? '♥' : '♡'}</span>
                                  <span>{rev.likes_count}</span>
                                </button>

                                <div className="flex items-center gap-1.5 text-xs text-white/35">
                                  <span>💬</span>
                                  <span>{rev.comments_count}</span>
                                </div>
                              </div>

                              <button
                                onClick={() => handleDeleteReview(rev.id)}
                                className="text-xs text-white/20 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: COLLECTIONS */}
            {activeTab === 'collections' && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">Shelves & Curation</h3>
                  <button
                    onClick={() => setIsNewCollectionModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white border border-white/[0.08] cursor-pointer"
                  >
                    + New Shelf
                  </button>
                </div>

                {collections.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-[#0c0c12] border border-white/[0.06]">
                    <p className="text-xs font-semibold text-white/50 mb-1">No collections created yet</p>
                    <p className="text-[11px] text-white/30 mb-3">Group your favorite franchise reviews or media into curated shelves.</p>
                    <button
                      onClick={() => setIsNewCollectionModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-bold"
                    >
                      Create First Shelf
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {collections.map((col) => (
                      <div
                        key={col.id}
                        className="p-5 rounded-3xl bg-[#0c0c12] border border-white/[0.06] hover:border-white/[0.12] transition-colors flex flex-col justify-between h-40"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-white/40">📁 Collection</span>
                          {col.is_private ? (
                            <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-white/[0.06] text-white/50">Private</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-emerald-500/10 text-emerald-400">Public</span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{col.name}</h4>
                          <p className="text-[11px] text-white/40 mt-0.5">
                            {col.description || `${col.items_count} items`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: BOOKMARKS */}
            {activeTab === 'bookmarks' && (
              <div className="space-y-3">
                {bookmarks.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-[#0c0c12] border border-white/[0.06]">
                    <p className="text-xs font-semibold text-white/50 mb-1">Bookshelf Empty</p>
                    <p className="text-[11px] text-white/30">Articles you save from the main feed will appear here.</p>
                  </div>
                ) : (
                  bookmarks.map((bm) => (
                    <div key={bm.id} className="p-4 rounded-2xl bg-[#0c0c12] border border-white/[0.06] flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">{bm.articles?.title || 'Saved Article'}</h4>
                        <p className="text-[10px] text-white/35 font-mono">{bm.articles?.category || 'Article'}</p>
                      </div>
                      <Link href={`/articles/${bm.articles?.slug || ''}`} className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white">
                        Read →
                      </Link>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>

          {/* ============================================================ */}
          {/* RIGHT: Interested In & Critic Credibility Widgets */}
          {/* ============================================================ */}
          <aside className="lg:col-span-12 xl:col-span-3 space-y-5">
            {/* Box 1: Interested In */}
            <div className="p-6 rounded-[28px] bg-[#0c0c12] border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                  <span>⚡</span>
                  <span>Interested In</span>
                </div>
                <span className="text-[10px] font-mono text-white/30">2025-2026</span>
              </div>

              {watchlist.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-[11px] text-white/30 mb-3">No upcoming titles tracked.</p>
                  <button
                    onClick={() => setIsNewWatchlistOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs text-white border border-white/10"
                  >
                    + Add Title
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {watchlist.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between hover:bg-white/[0.04] transition-colors"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white/90">{item.title}</h4>
                        <p className="text-[10px] text-white/35 mt-0.5">{item.category} • {item.release_window}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {item.hype_score}%
                      </span>
                    </div>
                  ))}
                  <button
                    onClick={() => setIsNewWatchlistOpen(true)}
                    className="w-full py-2 text-center text-xs text-white/40 hover:text-white border border-dashed border-white/10 rounded-xl transition-colors"
                  >
                    + Add Title
                  </button>
                </div>
              )}
            </div>

            {/* Box 2: Critic Credibility Gauge */}
            <div className="p-6 rounded-[28px] bg-[#0c0c12] border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5)] space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
                <span className="text-sm">📊</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/80 font-mono">
                  Critic Credibility
                </h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Community Trust Index</span>
                    <span className="font-mono font-bold text-violet-400">94%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full w-[94%]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Consensus Alignment</span>
                    <span className="font-mono font-bold text-emerald-400">89%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full w-[89%]" />
                  </div>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </main>

      {/* ============================================================ */}
      {/* MODAL 1: WRITE A REVIEW */}
      {/* ============================================================ */}
      {isNewReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-3xl p-6 sm:p-8 rounded-3xl bg-[#111116] border border-white/10 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold text-white">Post Critique & Review</h3>
                <p className="text-xs text-white/40">Rich editorial critique editor with inline media support</p>
              </div>
              <button onClick={() => setIsNewReviewModalOpen(false)} className="text-white/40 hover:text-white text-base">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-3.5">
              {reviewError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {reviewError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/50">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Elden Ring: Shadow of the Erdtree"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-white/50">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
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

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-white/50">Verdict</label>
                  <select
                    value={newVerdict}
                    onChange={(e: any) => setNewVerdict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#16161d] border border-white/[0.08] text-white text-xs outline-none"
                  >
                    <option value="must_buy">🔥 Must Buy / Watch</option>
                    <option value="wait_sale">🏷️ Wait for Sale</option>
                    <option value="wait_patches">⏳ Wait / Patches</option>
                    <option value="skip">🚫 Skip</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-white/50">Score (0% to 100%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={newScore}
                      onChange={(e) => setNewScore(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none pr-8"
                    />
                    <span className="absolute right-3 top-2 text-xs text-white/40 font-mono">%</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-white/50">Year</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none"
                  />
                </div>
              </div>

              {/* 2. Cover Photo File Upload */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-white/50 block">Upload Cover Art / Poster</label>
                <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="w-14 h-18 rounded-lg overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center flex-shrink-0">
                    {coverPreview ? (
                      <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg text-white/30">🖼️</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="profile-review-cover-file"
                      className="inline-block px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white border border-white/10 transition-colors cursor-pointer"
                    >
                      Choose Poster File
                    </label>
                    <input
                      id="profile-review-cover-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          setCoverFile(file);
                          setCoverPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                    />
                    <p className="text-[10px] text-white/35">Upload poster or game key art (max 8MB).</p>
                  </div>
                </div>
              </div>

              {/* 3. Detailed Analysis with Rich Text & Inline Images */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-white/50">Detailed Breakdown & Editorial Review</label>
                <RichArticleEditor
                  value={newContent}
                  onChange={setNewContent}
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (proInput.trim()) {
                            setPros([...pros, proInput.trim()]);
                            setProInput('');
                          }
                        }
                      }}
                      placeholder="Add key strength..."
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs outline-none focus:border-emerald-500/40"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (proInput.trim()) {
                          setPros([...pros, proInput.trim()]);
                          setProInput('');
                        }
                      }}
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (conInput.trim()) {
                            setCons([...cons, conInput.trim()]);
                            setConInput('');
                          }
                        }
                      }}
                      placeholder="Add drawback or flaw..."
                      className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs outline-none focus:border-rose-500/40"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (conInput.trim()) {
                          setCons([...cons, conInput.trim()]);
                          setConInput('');
                        }
                      }}
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
                    <span>YouTube Link (Mandatory)</span>
                  </div>
                  <input
                    type="url"
                    required
                    value={newYoutubeUrl}
                    onChange={(e) => setNewYoutubeUrl(e.target.value)}
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
                      htmlFor="profile-review-voice-file"
                      className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white border border-white/10 transition-colors cursor-pointer"
                    >
                      {newVoiceFile ? 'Change Audio File' : 'Upload Audio (.mp3, .m4a, .wav)'}
                    </label>
                    <input
                      id="profile-review-voice-file"
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setNewVoiceFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    {newVoiceFile && (
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
                  onClick={() => setIsNewReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingReview}
                  className="px-5 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {creatingReview ? 'Publishing...' : 'Publish Critique'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: CREATE COLLECTION */}
      {/* ============================================================ */}
      {isNewCollectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#111116] border border-white/10 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3">Create New Shelf</h3>
            <form onSubmit={handleCreateCollection} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/50">Shelf Name</label>
                <input
                  type="text"
                  required
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g. Cyberpunk Cinema"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/50">Description</label>
                <input
                  type="text"
                  value={newCollectionDesc}
                  onChange={(e) => setNewCollectionDesc(e.target.value)}
                  placeholder="Optional description"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="priv"
                  checked={newCollectionIsPrivate}
                  onChange={(e) => setNewCollectionIsPrivate(e.target.checked)}
                />
                <label htmlFor="priv" className="text-xs text-white/60">Private Shelf</label>
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button type="button" onClick={() => setIsNewCollectionModalOpen(false)} className="px-3.5 py-1.5 text-xs text-white/50">
                  Cancel
                </button>
                <button type="submit" disabled={creatingCollection} className="px-4 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-bold">
                  {creatingCollection ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: ADD TO WATCHLIST RADAR */}
      {/* ============================================================ */}
      {isNewWatchlistOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#111116] border border-white/10 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-3">Add to Anticipated Radar</h3>
            <form onSubmit={handleAddWatchlist} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/50">Title</label>
                <input
                  type="text"
                  required
                  value={watchTitle}
                  onChange={(e) => setWatchTitle(e.target.value)}
                  placeholder="e.g. GTA VI"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-white/50">Category</label>
                  <select
                    value={watchCategory}
                    onChange={(e) => setWatchCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#16161d] border border-white/[0.08] text-white text-xs outline-none"
                  >
                    <option value="Game">Game</option>
                    <option value="Movie">Movie</option>
                    <option value="Anime">Anime</option>
                    <option value="Series">Series</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-white/50">Release Window</label>
                  <input
                    type="text"
                    value={watchWindow}
                    onChange={(e) => setWatchWindow(e.target.value)}
                    placeholder="e.g. Fall 2025"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button type="button" onClick={() => setIsNewWatchlistOpen(false)} className="px-3.5 py-1.5 text-xs text-white/50">
                  Cancel
                </button>
                <button type="submit" disabled={addingWatchlist} className="px-4 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-bold">
                  {addingWatchlist ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: EDIT PROFILE DETAILS */}
      {/* ============================================================ */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#111116] border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">Edit Profile</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-white/40 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-3.5">
              {savedProfileSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                  ✓ Profile updated successfully!
                </div>
              )}
              {profileModalError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {profileModalError}
                </div>
              )}

              {/* Circular Avatar Selector */}
              <div className="space-y-1.5 pb-2">
                <label className="text-[11px] font-medium text-white/50 block">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-[#181820] border-2 border-white/15 flex items-center justify-center text-lg font-bold shadow-md group-hover:border-white/40 transition-all">
                      {avatarPreview || profile?.avatar_url ? (
                        <img src={avatarPreview || profile?.avatar_url || ''} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white/60 font-mono">{getInitials()}</span>
                      )}
                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        </div>
                      )}
                    </div>
                    <label
                      htmlFor="profile-modal-avatar-input"
                      className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-medium cursor-pointer transition-opacity"
                    >
                      📷
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="profile-modal-avatar-input"
                      className="inline-block px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white border border-white/10 transition-colors cursor-pointer"
                    >
                      Choose Photo
                    </label>
                    <input
                      id="profile-modal-avatar-input"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileSelect}
                      className="hidden"
                    />
                    <p className="text-[10px] text-white/35">JPG, PNG, GIF or WEBP</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/50">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/50">Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell others what you play, watch, or review..."
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-3.5 py-1.5 text-xs text-white/50 hover:text-white">
                  Cancel
                </button>
                <button type="submit" disabled={savingProfile || uploadingAvatar} className="px-4 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-bold">
                  {savingProfile ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Canvas Avatar Aspect Ratio & Crop Modal */}
      <AvatarCropperModal
        isOpen={isCropModalOpen}
        imageSrc={rawImageForCrop}
        onClose={() => setIsCropModalOpen(false)}
        onCropComplete={handleCropComplete}
      />

      <Footer />
    </div>
  );
}
