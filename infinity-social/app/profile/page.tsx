'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { UserReview, Collection, WatchlistItem } from '@/types/database';
import Link from 'next/link';

type TabType = 'reviews' | 'collections' | 'bookmarks';
type ReviewFilter = 'all' | 'masterpiece' | 'must_buy' | 'timepass' | 'skip';

const VERDICT_CONFIG = {
  masterpiece: { label: 'Perfection', pill: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
  must_buy: { label: 'Go For It', pill: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' },
  timepass: { label: 'Timepass', pill: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
  skip: { label: 'Skip', pill: 'bg-rose-500/10 text-rose-300 border-rose-500/30' },
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
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfileSuccess, setSavedProfileSuccess] = useState(false);
  const [profileModalError, setProfileModalError] = useState<string | null>(null);

  // New Review Modal
  const [isNewReviewModalOpen, setIsNewReviewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Game' | 'Movie' | 'Anime' | 'Series' | 'Tech' | 'Music'>('Game');
  const [newYear, setNewYear] = useState<number>(new Date().getFullYear());
  const [newVerdict, setNewVerdict] = useState<'masterpiece' | 'must_buy' | 'timepass' | 'skip'>('masterpiece');
  const [newScore, setNewScore] = useState<number>(9.5);
  const [newContent, setNewContent] = useState('');
  const [newCoverUrl, setNewCoverUrl] = useState('');
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
      const [
        { data: revData },
        { data: likesData },
        { data: colData },
        { data: bmarkData },
        { data: watchData },
      ] = await Promise.all([
        supabase.from('user_reviews').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('user_review_likes').select('review_id').eq('user_id', user.id),
        supabase.from('collections').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('bookmarks').select('*, articles(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('user_watchlist').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);

      if (revData) setReviews(revData as UserReview[]);
      if (likesData) setUserLikedReviewIds(new Set(likesData.map((l) => l.review_id)));
      if (colData) setCollections(colData as Collection[]);
      if (bmarkData) setBookmarks(bmarkData);
      if (watchData) setWatchlist(watchData as WatchlistItem[]);
    } catch (err) {
      console.error('Error loading profile data:', err);
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
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
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
      setReviewError('Title and content are required');
      return;
    }
    setCreatingReview(true);
    setReviewError(null);

    try {
      const payload = {
        user_id: user.id,
        title: newTitle.trim(),
        category: newCategory,
        release_year: Number(newYear),
        verdict: newVerdict,
        score: Number(newScore),
        content: newContent.trim(),
        cover_url: newCoverUrl.trim() || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80',
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
      setNewCoverUrl('');
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

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileModalError(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim() || profile.username,
          bio: bio.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      setSavedProfileSuccess(true);
      setTimeout(() => {
        setSavedProfileSuccess(false);
        setIsEditModalOpen(false);
      }, 900);
    } catch (err: any) {
      setProfileModalError(err.message || 'Failed to save profile');
    } finally {
      setSavingProfile(false);
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
          {/* LEFT: Human-crafted Identity & Bio Card */}
          {/* ============================================================ */}
          <aside className="lg:col-span-4 xl:col-span-3.5">
            <div className="p-6 rounded-2xl bg-[#0e0e13] border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.5)] flex flex-col items-center text-center">
              
              {/* Profile Avatar */}
              <div className="w-24 h-24 rounded-full overflow-hidden bg-[#181820] border border-white/10 flex items-center justify-center text-2xl font-bold relative shadow-inner">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold tracking-wider text-white/80">
                    {getInitials()}
                  </span>
                )}
                {profile.role === 'admin' && (
                  <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-violet-600 border-2 border-[#0e0e13] flex items-center justify-center text-[9px] text-white">
                    ★
                  </div>
                )}
              </div>

              {/* Names & Username */}
              <h1 className="mt-4 text-lg font-bold tracking-tight text-white">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-xs text-white/40 font-mono mt-0.5">@{profile.username}</p>

              {profile.role === 'admin' && (
                <span className="mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-violet-500/10 text-violet-300 border border-violet-500/20">
                  Admin
                </span>
              )}

              {/* Bio */}
              <p className="mt-3.5 text-xs text-white/60 leading-relaxed max-w-xs font-normal">
                {profile.bio || 'No bio added yet.'}
              </p>

              {/* Activity Stats */}
              <div className="grid grid-cols-2 gap-2.5 w-full mt-5 pt-5 border-t border-white/[0.06]">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-base font-bold text-white block">{reviews.length}</span>
                  <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Reviews</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-base font-bold text-white block">{collections.length}</span>
                  <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Collections</span>
                </div>
              </div>

              {/* Meta join date */}
              <div className="flex items-center gap-1.5 mt-4 text-[11px] text-white/35">
                <span>Joined {new Date(profile.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-2 mt-5">
                <button
                  onClick={() => {
                    setDisplayName(profile.display_name || '');
                    setBio(profile.bio || '');
                    setIsEditModalOpen(true);
                  }}
                  className="w-full py-2 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-xs font-medium text-white/90 transition-colors cursor-pointer"
                >
                  Edit Profile
                </button>

                <button
                  onClick={() => setIsNewReviewModalOpen(true)}
                  className="w-full py-2 px-4 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  + Write a Review
                </button>
              </div>
            </div>
          </aside>

          {/* ============================================================ */}
          {/* CENTER: Editorial Feed & Activity */}
          {/* ============================================================ */}
          <section className="lg:col-span-8 xl:col-span-5.5 space-y-5">
            
            {/* Primary Segment Control */}
            <div className="p-1 rounded-xl bg-[#0e0e13] border border-white/[0.08] flex items-center">
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'bg-white/[0.08] text-white shadow-sm'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                Reviews ({reviews.length})
              </button>

              <button
                onClick={() => setActiveTab('collections')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'collections'
                    ? 'bg-white/[0.08] text-white shadow-sm'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                Collections ({collections.length})
              </button>

              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'bookmarks'
                    ? 'bg-white/[0.08] text-white shadow-sm'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                Bookmarks ({bookmarks.length})
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
                        { id: 'masterpiece', label: 'Perfection' },
                        { id: 'must_buy', label: 'Go For It' },
                        { id: 'timepass', label: 'Timepass' },
                        { id: 'skip', label: 'Skip' },
                      ] as const
                    ).map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setReviewFilter(filter.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          reviewFilter === filter.id
                            ? 'bg-white/[0.12] text-white border border-white/20'
                            : 'text-white/45 hover:text-white hover:bg-white/[0.03]'
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
                      className="w-32 sm:w-36 px-2.5 py-1 text-xs rounded-lg bg-white/[0.03] border border-white/[0.08] text-white placeholder-white/25 outline-none focus:border-white/30"
                    />
                    <div className="flex items-center p-0.5 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`px-1.5 py-0.5 text-xs rounded ${viewMode === 'list' ? 'bg-white/15 text-white' : 'text-white/40'}`}
                      >
                        ☰
                      </button>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`px-1.5 py-0.5 text-xs rounded ${viewMode === 'grid' ? 'bg-white/15 text-white' : 'text-white/40'}`}
                      >
                        ⊞
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                {dataLoading ? (
                  <div className="p-12 text-center rounded-2xl bg-[#0e0e13] border border-white/[0.06]">
                    <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin mx-auto mb-2" />
                    <p className="text-xs text-white/40 font-mono">Loading reviews...</p>
                  </div>
                ) : filteredReviews.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-[#0e0e13] border border-white/[0.06]">
                    <p className="text-xs font-semibold text-white/50 mb-1">No reviews found</p>
                    <p className="text-[11px] text-white/30 mb-4">You haven't written any critiques matching this filter.</p>
                    <button
                      onClick={() => setIsNewReviewModalOpen(true)}
                      className="px-4 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-xs font-semibold text-white border border-white/10 cursor-pointer"
                    >
                      Post a Review
                    </button>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3.5' : 'space-y-3.5'}>
                    {filteredReviews.map((rev) => {
                      const verdictCfg = VERDICT_CONFIG[rev.verdict] || VERDICT_CONFIG.must_buy;
                      return (
                        <div
                          key={rev.id}
                          className="p-4 rounded-2xl bg-[#0e0e13] border border-white/[0.06] hover:border-white/[0.12] transition-colors group flex flex-col sm:flex-row gap-4 items-start relative"
                        >
                          {/* Image */}
                          <div className="w-full sm:w-24 h-32 sm:h-32 rounded-xl overflow-hidden bg-black/40 border border-white/[0.06] flex-shrink-0 relative">
                            <img
                              src={rev.cover_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80'}
                              alt={rev.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-bold text-white font-mono">
                              ★ {rev.score}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 flex flex-col justify-between h-full w-full">
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="text-sm font-bold text-white tracking-tight line-clamp-1">
                                  {rev.title}
                                </h3>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${verdictCfg.pill}`}>
                                  {verdictCfg.label}
                                </span>
                              </div>

                              <p className="text-[11px] text-white/35 mt-0.5 font-mono">
                                {rev.category} • {rev.release_year} • {new Date(rev.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>

                              <p className="text-xs text-white/70 mt-2 leading-relaxed line-clamp-3">
                                {rev.content}
                              </p>
                            </div>

                            {/* Interaction Bar */}
                            <div className="flex items-center justify-between pt-3 mt-2.5 border-t border-white/[0.04]">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleToggleLike(rev.id)}
                                  className={`flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
                                    userLikedReviewIds.has(rev.id) ? 'text-rose-400' : 'text-white/40 hover:text-white'
                                  }`}
                                >
                                  <span>{userLikedReviewIds.has(rev.id) ? '♥' : '♡'}</span>
                                  <span>{rev.likes_count}</span>
                                </button>

                                <div className="flex items-center gap-1 text-[11px] text-white/35">
                                  <span>💬</span>
                                  <span>{rev.comments_count}</span>
                                </div>
                              </div>

                              <button
                                onClick={() => handleDeleteReview(rev.id)}
                                className="text-[11px] text-white/20 hover:text-rose-400 transition-colors cursor-pointer"
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
                    className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white border border-white/[0.08] cursor-pointer"
                  >
                    + New Shelf
                  </button>
                </div>

                {collections.length === 0 ? (
                  <div className="p-10 text-center rounded-2xl bg-[#0e0e13] border border-white/[0.06]">
                    <p className="text-xs font-semibold text-white/50 mb-1">No collections created yet</p>
                    <p className="text-[11px] text-white/30 mb-3">Group your favorite franchise reviews or media into curated shelves.</p>
                    <button
                      onClick={() => setIsNewCollectionModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-xs font-semibold text-white border border-white/10"
                    >
                      Create First Shelf
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {collections.map((col) => (
                      <div
                        key={col.id}
                        className="p-4 rounded-2xl bg-[#0e0e13] border border-white/[0.06] hover:border-white/[0.12] transition-colors flex flex-col justify-between h-36"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-white/40">📁 Collection</span>
                          {col.is_private ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/[0.06] text-white/50">Private</span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-500/10 text-emerald-400">Public</span>
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
                  <div className="p-10 text-center rounded-2xl bg-[#0e0e13] border border-white/[0.06]">
                    <p className="text-xs font-semibold text-white/50 mb-1">Bookshelf Empty</p>
                    <p className="text-[11px] text-white/30">Articles you save from the main feed will appear here.</p>
                  </div>
                ) : (
                  bookmarks.map((bm) => (
                    <div key={bm.id} className="p-3.5 rounded-xl bg-[#0e0e13] border border-white/[0.06] flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">{bm.articles?.title || 'Saved Article'}</h4>
                        <p className="text-[10px] text-white/35 font-mono">{bm.articles?.category || 'Article'}</p>
                      </div>
                      <Link href={`/articles/${bm.articles?.slug || ''}`} className="px-2.5 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] text-[11px] font-semibold text-white">
                        Read →
                      </Link>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>

          {/* ============================================================ */}
          {/* RIGHT: Anticipated Radar Widget */}
          {/* ============================================================ */}
          <aside className="lg:col-span-12 xl:col-span-3 space-y-4">
            <div className="p-5 rounded-2xl bg-[#0e0e13] border border-white/[0.08]">
              <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-white/[0.05]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/70">
                  Anticipated Radar
                </h3>
                <button
                  onClick={() => setIsNewWatchlistOpen(true)}
                  className="text-[11px] text-white/50 hover:text-white font-medium cursor-pointer"
                >
                  + Add
                </button>
              </div>

              {watchlist.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-[11px] text-white/30">No upcoming titles tracked.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {watchlist.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white/90">{item.title}</h4>
                        <p className="text-[10px] text-white/35 mt-0.5">{item.category} • {item.release_window}</p>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-emerald-400">
                        {item.hype_score}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>

        </div>
      </main>

      {/* ============================================================ */}
      {/* MODAL 1: WRITE A REVIEW */}
      {/* ============================================================ */}
      {isNewReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#111116] border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">Post Critique & Review</h3>
              <button onClick={() => setIsNewReviewModalOpen(false)} className="text-white/40 hover:text-white">
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
                    <option value="masterpiece">Perfection</option>
                    <option value="must_buy">Go For It</option>
                    <option value="timepass">Timepass</option>
                    <option value="skip">Skip</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-white/50">Score (0.0 to 10.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={newScore}
                    onChange={(e) => setNewScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none"
                  />
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

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/50">Cover Image URL (Optional)</label>
                <input
                  type="url"
                  value={newCoverUrl}
                  onChange={(e) => setNewCoverUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-white/50">Critique / Review Notes</label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewReviewModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs text-white/50 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingReview}
                  className="px-4 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-bold"
                >
                  {creatingReview ? 'Publishing...' : 'Publish'}
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
                <button type="submit" disabled={savingProfile} className="px-4 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-bold">
                  {savingProfile ? 'Saving...' : 'Save'}
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
