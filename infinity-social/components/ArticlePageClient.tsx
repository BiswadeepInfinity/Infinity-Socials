'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArticleDiscussionHub from '@/components/ArticleDiscussionHub';
import Toolkit from '@/components/Toolkit';
import ArticleRenderer from '@/components/ArticleRenderer';
import ButterflyLoader from '@/components/ButterflyLoader';
import { supabase } from '@/lib/supabase';
import { UserReview } from '@/types/database';
import { useAuth } from '@/components/AuthProvider';

interface ArticlePageClientProps {
  slug?: string;
  reviewId?: string;
}

const MOCK_ARTICLE = {
  id: '1',
  slug: 'elden-ring-shadow-erdtree-review',
  title: 'Elden Ring: Shadow of the Erdtree — The Most Uncompromising Expansion in Gaming History',
  subtitle: 'FromSoftware raises the bar for world density, mechanical depth, and mythic ambiguity in a gargantuan return to the Lands Between.',
  youtubeVideoId: 'qLZenOn7WUo',
  author: {
    name: 'Aryan Shah',
    role: 'Editor-in-Chief & Lead Critic',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
  },
  publishedAt: 'AUGUST 2025',
  readTime: '9 MIN READ',
  category: 'CRITICAL REVIEW',
  categoryStyle: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  tags: ['FromSoftware', 'Elden Ring', 'Hidetaka Miyazaki', 'Action RPG', 'Review'],
  metrics: {
    score: '9.8',
    tier: 'MASTERPIECE',
    pros: [
      'The Land of Shadow is one of the densest, most vertically awe-inspiring open worlds ever crafted',
      'Scadutree Fragment progression intelligently solves late-game RPG power scaling',
      'Messmer and Midra set unprecedented benchmarks for boss choreography and audio design',
      'Eight entirely new weapon archetypes that dramatically reshape build variety',
    ],
    cons: [
      'Camera tracking during giant-scale boss encounters remains occasionally frustrating',
      'Performance dips in select high-density shadow-forest biomes at launch',
    ],
    verdict: 'Shadow of the Erdtree is not merely DLC; it is a monumental magnum opus that surpasses the scope of most standalone AAA titles. An uncompromising triumph of artistic vision.',
  },
  content: [
    {
      type: 'paragraph',
      text: "FromSoftware has long operated at the bleeding edge of interactive challenge, but with Shadow of the Erdtree, Hidetaka Miyazaki’s team has engineered something almost terrifying in its ambition. Rather than offering a comfortable victory lap for the 25 million players who conquered the base game, the Land of Shadow immediately demands complete mechanical humility.",
    },
    {
      type: 'heading',
      text: 'Verticality and the Geography of Mystery',
    },
    {
      type: 'paragraph',
      text: "The first thing that strikes you upon stepping through the withered arm of Miquella is the sheer geometric impossibility of the terrain. The Land of Shadow is layered like a Renaissance painting of purgatory—colossal aqueducts suspended across yawning abysses, submerged sunken churches, and jagged gravestones jutting from ancient cliffs. It renders standard map navigation delightfully obsolete.",
    },
    {
      type: 'quote',
      text: '“Shadow of the Erdtree rejects the modern trend of frictionless gaming in favor of genuine, unvarnished discovery. Every vista earned feels like a personal triumph.”',
    },
    {
      type: 'paragraph',
      text: "Progress is governed by the new Scadutree Blessing system, a stroke of genius that decouples DLC difficulty from character level. Whether you arrive at Level 120 or Level 400, your survival hinges on exploring the world to unearth sacred fragments. It restores that electrifying sensation of vulnerability that made your first hours in Limgrave so unforgettable.",
    },
    {
      type: 'heading',
      text: 'Boss Encounters: The Symphony of Ruin',
    },
    {
      type: 'paragraph',
      text: "Much has been made of the expansion’s unforgiving tuning, yet when examined under a critic’s microscope, battles like Messmer the Impaler represent the pinnacle of FromSoftware’s boss design. Every sweeping spear thrust, serpentine flame arc, and momentary cadence lull has been choreographed with rhythmic precision.",
    },
    {
      type: 'paragraph',
      text: "When you finally triumph after dozens of failed attempts, the surge of adrenaline is unmatched. This is video game artistry operating without compromise—dense, poetic, and magnificently ruthless.",
    },
  ],
  moreArticles: [
    { id: '2', slug: 'gta-6-everything-we-know', title: 'GTA VI: The Tech Engineering Behind Vice City 2026', category: 'SPECIAL REPORT', thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&q=80', readTime: '12 MIN' },
    { id: '3', slug: 'demon-slayer-hashira-training', title: 'Demon Slayer: Why Hashira Training Redefined Shonen Pacing', category: 'ANIME DEEP DIVE', thumbnail: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=500&q=80', readTime: '6 MIN' },
    { id: '4', slug: 'black-myth-wukong-review', title: 'Black Myth: Wukong and the Global Ascent of Chinese AAA', category: 'DEEP DIVE', thumbnail: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=500&q=80', readTime: '10 MIN' },
  ],
};

export default function ArticlePageClient({ slug, reviewId }: ArticlePageClientProps) {
  const article = MOCK_ARTICLE;
  const { user: currentUser } = useAuth();
  const [selectedLang, setSelectedLang] = useState('EN');
  const [ttsActive, setTtsActive] = useState(false);
  const [loadingDbReview, setLoadingDbReview] = useState(Boolean(reviewId));
  const [dbReview, setDbReview] = useState<UserReview | null>(null);

  const isAuthor = Boolean(currentUser && dbReview && currentUser.id === dbReview.user_id);

  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [upvotes, setUpvotes] = useState(89420);
  const [downvotes, setDownvotes] = useState(1240);

  // Audience Interactive Verdict Polling State
  type AudienceOption = 'must_buy' | 'wait_sale' | 'wait' | 'skip';
  const [userAudienceVote, setUserAudienceVote] = useState<AudienceOption | null>(null);
  const [audienceVotes, setAudienceVotes] = useState({
    must_buy: 0,
    wait_sale: 0,
    wait: 0,
    skip: 0,
  });

  const totalAudienceVotes = audienceVotes.must_buy + audienceVotes.wait_sale + audienceVotes.wait + audienceVotes.skip;

  const handleAudienceVote = async (option: AudienceOption) => {
    if (isAuthor) {
      alert("As the author/creator of this review, your official verdict is already published above. The community poll is reserved for audience readers!");
      return;
    }
    if (userAudienceVote === option) return;

    const previousVote = userAudienceVote;
    const updatedVotes = { ...audienceVotes };
    if (previousVote) {
      updatedVotes[previousVote] = Math.max(0, updatedVotes[previousVote] - 1);
    }
    updatedVotes[option] += 1;

    // Optimistic UI update
    setAudienceVotes(updatedVotes);
    setUserAudienceVote(option);

    // Save to local storage for instant guest recognition
    if (reviewId) {
      try {
        localStorage.setItem(`poll_vote_${reviewId}`, option);
      } catch (e) {
        // ignore
      }

      // Persist to Supabase database
      try {
        await supabase
          .from('user_reviews')
          .update({ community_votes: updatedVotes })
          .eq('id', reviewId);
      } catch (err) {
        console.error('Error saving community vote to database:', err);
      }
    }
  };

  const getWinningAudienceOption = () => {
    if (totalAudienceVotes === 0) {
      return {
        label: 'AWAITING COMMUNITY VERDICT',
        tag: 'POLL OPEN',
        color: 'text-cyan-300',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/30',
        desc: 'No audience votes have been cast yet. Be the first to vote on your verdict below!',
        icon: '🗳️',
        votes: 0,
        percentage: 0,
        key: 'none' as const,
      };
    }

    const entries = Object.entries(audienceVotes) as [AudienceOption, number][];
    entries.sort((a, b) => b[1] - a[1]);
    const top = entries[0];
    const pct = Math.round((top[1] / totalAudienceVotes) * 100);

    const labels: Record<AudienceOption, { label: string; tag: string; color: string; bg: string; border: string; desc: string; icon: string }> = {
      must_buy: {
        label: 'MUST BUY / WATCH',
        tag: 'CRUCIAL ESSENTIAL',
        color: 'text-emerald-300',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        desc: 'Overwhelming majority consensus recommends experiencing immediately at launch.',
        icon: '🔥',
      },
      wait_sale: {
        label: 'WAIT FOR SALE',
        tag: 'VALUE CONTENDER',
        color: 'text-amber-300',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        desc: 'Great experience, but community advises picking up during a discount cycle.',
        icon: '🏷️',
      },
      wait: {
        label: 'WAIT / ON THE FENCE',
        tag: 'NEEDS PATCHES',
        color: 'text-cyan-300',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/30',
        desc: 'Hold off for future performance updates, DLC, or balance patches.',
        icon: '⏳',
      },
      skip: {
        label: 'SKIP ENTIRELY',
        tag: 'CRITICAL WARNING',
        color: 'text-rose-300',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        desc: 'Not recommended based on significant flaws or community feedback.',
        icon: '🚫',
      },
    };

    return { ...labels[top[0]], votes: top[1], percentage: pct, key: top[0] };
  };

  const scorecardRef = useRef<HTMLDivElement | null>(null);
  const [isScoreVisible, setIsScoreVisible] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [scoreRevealed, setScoreRevealed] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Smooth number ticker from 0 up to score
  useEffect(() => {
    if (!isScoreVisible) {
      setAnimatedScore(0);
      return;
    }

    const target = dbReview ? Number(dbReview.score) : 98;
    const duration = 1400;
    const startTime = performance.now();

    const animateNumber = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      } else {
        setAnimatedScore(target);
      }
    };

    const animFrame = requestAnimationFrame(animateNumber);
    return () => cancelAnimationFrame(animFrame);
  }, [isScoreVisible, dbReview]);

  useEffect(() => {
    if (!reviewId) return;

    const fetchReview = async () => {
      try {
        setLoadingDbReview(true);
        const { data, error } = await supabase
          .from('user_reviews')
          .select('*, author:profiles(*)')
          .eq('id', reviewId)
          .single();

        if (!error && data) {
          setDbReview(data as any);
          const up = typeof data.upvotes_count === 'number' ? data.upvotes_count : 0;
          const down = typeof data.downvotes_count === 'number' ? data.downvotes_count : 0;
          setUpvotes(up);
          setDownvotes(down);

          // Load real community votes from database
          if (data.community_votes && typeof data.community_votes === 'object') {
            setAudienceVotes({
              must_buy: Number(data.community_votes.must_buy || 0),
              wait_sale: Number(data.community_votes.wait_sale || 0),
              wait: Number(data.community_votes.wait || 0),
              skip: Number(data.community_votes.skip || 0),
            });
          } else {
            setAudienceVotes({ must_buy: 0, wait_sale: 0, wait: 0, skip: 0 });
          }

          // Check if current user has already voted on this review
          try {
            const savedVote = localStorage.getItem(`poll_vote_${reviewId}`);
            if (savedVote && ['must_buy', 'wait_sale', 'wait', 'skip'].includes(savedVote)) {
              setUserAudienceVote(savedVote as any);
            }
          } catch (e) {
            // ignore
          }
        }
      } catch (e) {
        console.error('Error loading review:', e);
      } finally {
        setLoadingDbReview(false);
      }
    };

    fetchReview();
  }, [reviewId]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsScoreVisible(true);
        }
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.2 }
    );

    if (scorecardRef.current) {
      observer.observe(scorecardRef.current);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [loadingDbReview]);

  const handleVote = (type: 'up' | 'down') => {
    if (userVote === type) {
      // Toggle off
      setUserVote(null);
      if (type === 'up') setUpvotes((v) => v - 1);
      else setDownvotes((v) => v - 1);
    } else {
      // Switch or set vote
      if (userVote === 'up') setUpvotes((v) => v - 1);
      if (userVote === 'down') setDownvotes((v) => v - 1);
      
      setUserVote(type);
      if (type === 'up') setUpvotes((v) => v + 1);
      else setDownvotes((v) => v + 1);
    }
  };

  const formatCount = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const LANGUAGES = ['EN', 'JA', 'ES', 'DE', 'FR', 'HI', 'KO', 'ZH'];

  // Use dbReview data if available, fallback to mock article
  const currentTitle = dbReview?.title || article.title;
  const currentCategory = dbReview?.category || article.category;
  const currentCategoryStyle = dbReview ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' : article.categoryStyle;
  const currentReleaseYear = dbReview?.release_year || '2026';
  const currentPublishedAt = dbReview ? new Date(dbReview.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase() : article.publishedAt;
  const currentReadTime = dbReview ? `${Math.max(1, Math.ceil(dbReview.content.split(' ').length / 200))} MIN READ` : article.readTime;
  
  const currentAuthor = {
    name: dbReview?.author?.display_name || dbReview?.author?.username || article.author.name,
    role: dbReview?.author ? 'Master Critic' : article.author.role,
    avatar: dbReview?.author?.avatar_url || article.author.avatar,
    subscribers: '142K Subscribers',
  };

  const currentYoutubeUrl = dbReview?.youtube_url;
  const currentYoutubeId = currentYoutubeUrl
    ? (currentYoutubeUrl.includes('v=')
        ? currentYoutubeUrl.split('v=')[1]?.split('&')[0]
        : currentYoutubeUrl.split('/').pop())
    : article.youtubeVideoId;

  const currentScore = dbReview ? (dbReview.score / 10).toFixed(1) : article.metrics.score;
  const currentPros = dbReview?.pros && dbReview.pros.length > 0 ? dbReview.pros : article.metrics.pros;
  const currentCons = dbReview?.cons && dbReview.cons.length > 0 ? dbReview.cons : article.metrics.cons;
  const currentBottomLine = dbReview?.bottom_line || article.metrics.verdict;

  if (loadingDbReview) {
    return (
      <div className="fixed inset-0 z-[999] bg-[#030305] flex flex-col items-center justify-center text-white">
        <ButterflyLoader size="xl" text="LOADING EDITORIAL CRITIQUE..." />
      </div>
    );
  }

  return (
    <div className="bg-[#030305] min-h-screen text-[#f3f3f7] selection:bg-cyan-500/30 selection:text-cyan-200 relative">
      <Navbar />
      <Toolkit articleId={dbReview?.id || article.id} />

      <main className="pt-28 pb-20">
        
        {/* Article Header & YouTube Cinematic Deck */}
        <header className="max-w-5xl mx-auto px-6 mb-12">
          
          {/* Eyebrows */}
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <span className={`px-3 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border ${currentCategoryStyle}`}>
              {currentCategory}
            </span>
            <span className="font-mono text-xs text-white/40">{currentPublishedAt}</span>
            <span className="font-mono text-xs text-cyan-400 font-bold">• {currentReadTime}</span>
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-3xl sm:text-5xl xl:text-6xl text-white leading-[1.1] tracking-tight mb-6">
            {currentTitle}
          </h1>

          {/* YouTube-Style Creator Channel Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0a14]/90 border border-white/[0.1] backdrop-blur-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
            {/* Left: Author Profile */}
            <div className="flex items-center gap-3.5">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentAuthor.avatar}
                  alt={currentAuthor.name}
                  className="w-12 h-12 rounded-full object-cover border border-white/20 shadow-md bg-violet-600/30"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-cyan-500 rounded-full border-2 border-[#0a0a14] flex items-center justify-center text-[8px] text-black font-bold" title="Verified Creator">
                  ✓
                </span>
              </div>
              <div>
                {/* Master Reviewer Status Tag */}
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    MASTER REVIEWER
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-base text-white">{currentAuthor.name}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-white/[0.06] text-white/60 border border-white/10">
                    Creator
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-white/50 mt-0.5">
                  <span className="text-cyan-400 font-semibold">{currentAuthor.subscribers}</span>
                  <span>•</span>
                  <span>{currentAuthor.role}</span>
                </div>
              </div>
            </div>

            {/* Right: Actions & Tools */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between lg:justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-white/[0.06]">
              {/* Upvote / Downvote Pill */}
              <div className="flex items-center bg-black/60 border border-white/10 rounded-full p-1 shadow-inner backdrop-blur-md">
                <button
                  onClick={() => handleVote('up')}
                  title="Upvote"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all duration-200 ${
                    userVote === 'up'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'text-white/70 hover:text-emerald-400 hover:bg-white/[0.06]'
                  }`}
                >
                  <span className={`text-sm transform transition-transform ${userVote === 'up' ? 'scale-125' : ''}`}>▲</span>
                  <span>{formatCount(upvotes)}</span>
                </button>
                
                <div className="w-[1px] h-4 bg-white/10 my-auto mx-0.5" />

                <button
                  onClick={() => handleVote('down')}
                  title="Downvote"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all duration-200 ${
                    userVote === 'down'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                      : 'text-white/70 hover:text-rose-400 hover:bg-white/[0.06]'
                  }`}
                >
                  <span className={`text-sm transform transition-transform ${userVote === 'down' ? 'scale-125' : ''}`}>▼</span>
                  <span>{formatCount(downvotes)}</span>
                </button>
              </div>

              {/* Join Channel Button */}
              <button
                onClick={() => alert(`Joined ${currentAuthor.name}'s Creator Club!`)}
                className="px-4 py-2 rounded-full text-xs font-mono font-bold tracking-wide transition-all bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-[0_0_16px_rgba(6,182,212,0.3)] hover:shadow-[0_0_24px_rgba(6,182,212,0.5)] flex items-center gap-1.5"
              >
                <span>★</span>
                <span>Join</span>
              </button>

              <div className="hidden sm:block w-[1px] h-6 bg-white/10 mx-1" />

              {/* Language Selector */}
              <div className="flex items-center gap-1 bg-black/50 border border-white/10 px-2.5 py-1.5 rounded-xl text-xs font-mono">
                <span className="text-white/40">🌐</span>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="bg-transparent text-cyan-300 font-bold outline-none cursor-pointer"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang} className="bg-[#0c0c14] text-white">
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* TTS Listen Button */}
              <button
                onClick={() => setTtsActive(!ttsActive)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                  ttsActive
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                    : 'bg-white/[0.04] text-white/70 border-white/10 hover:bg-white/[0.08]'
                }`}
              >
                <span>{ttsActive ? '⏸ AI Audio' : '🔊 Listen (TTS)'}</span>
              </button>
            </div>
          </div>

          {/* Embedded YouTube Media Center */}
          {currentYoutubeId && (
            <div className="mt-8 rounded-[28px] overflow-hidden border border-white/[0.12] shadow-[0_30px_90px_rgba(0,0,0,0.9)] bg-black aspect-video relative">
              <iframe
                src={`https://www.youtube.com/embed/${currentYoutubeId}?rel=0&modestbranding=1&color=white`}
                title={currentTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-none"
              />
            </div>
          )}
        </header>

        {/* Article Body Content */}
        <article className="max-w-3xl mx-auto px-6 space-y-6 text-base sm:text-lg leading-relaxed text-white/80 font-light">
          {dbReview ? (
            <ArticleRenderer content={dbReview.content} />
          ) : (
            article.content.map((block, i) => {
              if (block.type === 'heading') {
                return (
                  <h2
                    key={i}
                    className="font-display font-bold text-2xl sm:text-3xl text-white pt-8 pb-2 tracking-tight"
                  >
                    {block.text}
                  </h2>
                );
              }
              if (block.type === 'quote') {
                return (
                  <blockquote
                    key={i}
                    className="my-8 p-6 rounded-2xl bg-gradient-to-r from-violet-950/30 to-transparent border-l-4 border-cyan-400 font-display font-medium text-lg sm:text-xl text-white italic shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  >
                    {block.text}
                  </blockquote>
                );
              }
              return (
                <p key={i} className="text-white/80 leading-[1.85]">
                  {block.text}
                </p>
              );
            })
          )}

          {/* Two Distinct, Unstretched Scorecard & Assessment Cards */}
          <div ref={scorecardRef} className="my-16 space-y-6">
            
            {/* Interactive Audience Verdict Voting Station (Positioned just above the metrics) */}
            <div className="rounded-[28px] p-6 sm:p-7 bg-[#090912] border border-white/[0.1] shadow-2xl relative overflow-hidden space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-bold">
                      COMMUNITY VERDICT POLL
                    </span>
                    {isAuthor && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 ml-2">
                        Creator View
                      </span>
                    )}
                  </div>
                  <h4 className="font-display font-bold text-xl sm:text-2xl text-white mt-1">
                    {isAuthor ? "Audience Reader Verdicts on Your Critique" : "What is your verdict on this title?"}
                  </h4>
                </div>
                <span className="text-xs font-mono text-white/50 bg-white/[0.04] px-3 py-1 rounded-full border border-white/10 w-fit">
                  {totalAudienceVotes.toLocaleString()} Total Votes Cast
                </span>
              </div>

              {/* 4 Interactive Vote Buttons */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {([
                  { key: 'must_buy', label: 'Must Buy / Watch', icon: '🔥', activeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_16px_rgba(16,185,129,0.35)]', hoverBg: 'hover:border-emerald-500/30 hover:bg-emerald-500/5' },
                  { key: 'wait_sale', label: 'Wait for Sale', icon: '🏷️', activeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_16px_rgba(245,158,11,0.35)]', hoverBg: 'hover:border-amber-500/30 hover:bg-amber-500/5' },
                  { key: 'wait', label: 'Wait / Patches', icon: '⏳', activeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_16px_rgba(6,182,212,0.35)]', hoverBg: 'hover:border-cyan-500/30 hover:bg-cyan-500/5' },
                  { key: 'skip', label: 'Skip', icon: '🚫', activeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_16px_rgba(244,63,94,0.35)]', hoverBg: 'hover:border-rose-500/30 hover:bg-rose-500/5' },
                ] as const).map((btn) => {
                  const isSelected = userAudienceVote === btn.key;
                  const count = audienceVotes[btn.key];
                  const pct = totalAudienceVotes > 0 ? Math.round((count / totalAudienceVotes) * 100) : 0;

                  return (
                    <button
                      key={btn.key}
                      onClick={() => handleAudienceVote(btn.key)}
                      className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-2 relative overflow-hidden group cursor-pointer ${
                        isSelected
                          ? btn.activeBg
                          : `bg-[#050509] border-white/[0.08] text-white/80 ${btn.hoverBg}`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{btn.icon}</span>
                        <span className="font-mono text-xs font-bold text-white/60">{pct}%</span>
                      </div>
                      <div>
                        <div className="font-display font-bold text-xs sm:text-sm text-white group-hover:text-white">
                          {btn.label}
                        </div>
                        <div className="text-[10px] font-mono text-white/40 mt-0.5">
                          {count.toLocaleString()} votes {isSelected && '• (Voted)'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Box 1: Dual Metrics Card (Critic Infinity Meter + Audience Top Consensus Opinion) */}
            <div className="rounded-[32px] p-6 sm:p-8 bg-[#090912] border border-white/[0.1] shadow-2xl relative overflow-hidden space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-bold">
                      INFINITY METRICS & VERDICTS
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight mt-1">
                    Critic Continuum vs Audience Consensus
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/[0.05] text-white/70 border border-white/10 w-fit">
                  Verified Data Stream
                </span>
              </div>

              {/* Full-Width Spacious Stacked Landscape Modules */}
              <div className="grid grid-cols-1 gap-6">

                {/* Module 1: Master Critic Infinity Meter (Full Width Landscape) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#050509] border border-white/[0.08] p-6 sm:p-7 rounded-[28px] shadow-inner gap-6">
                  {/* Left: Critic Info & Consensus Tiers */}
                  <div className="space-y-4 max-w-xs shrink-0">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">
                          CRITIC CONTINUUM
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-xl text-white">{currentAuthor.name}</h4>
                      <p className="text-xs font-mono text-white/50">{currentAuthor.role}</p>
                    </div>

                    {/* Dynamic 4-Tier Continuum Breakdown based on Score */}
                    {(() => {
                      const s = dbReview ? dbReview.score : 98;
                      // Dynamic distribution tailored to the actual score
                      let flaw = 1, pass = 5, accl = 30, trans = 64;
                      if (s >= 90) {
                        trans = Math.min(95, Math.round((s - 70) * 3));
                        accl = Math.max(10, 100 - trans - 4);
                        pass = 3;
                        flaw = 1;
                      } else if (s >= 75) {
                        accl = Math.min(85, Math.round(s * 0.8));
                        trans = Math.max(5, Math.round((s - 75) * 1.5));
                        pass = Math.max(5, 100 - accl - trans - 2);
                        flaw = 2;
                      } else if (s >= 50) {
                        pass = Math.min(75, Math.round(s * 0.9));
                        accl = Math.max(10, Math.round((s - 50) * 1.2));
                        flaw = Math.max(5, 100 - pass - accl - 5);
                        trans = 5;
                      } else {
                        flaw = Math.min(90, Math.round((100 - s) * 0.9));
                        pass = Math.max(5, 100 - flaw - 5);
                        accl = 3;
                        trans = 2;
                      }

                      return (
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06]">
                          <div className="bg-white/[0.03] p-2 rounded-xl border border-white/[0.05]">
                            <div className="text-[9px] font-mono text-white/40 uppercase">Critical Flaw</div>
                            <div className="text-xs font-mono font-bold text-rose-400 mt-0.5">{flaw}%</div>
                          </div>
                          <div className="bg-white/[0.03] p-2 rounded-xl border border-white/[0.05]">
                            <div className="text-[9px] font-mono text-white/40 uppercase">Passable</div>
                            <div className="text-xs font-mono font-bold text-amber-400 mt-0.5">{pass}%</div>
                          </div>
                          <div className="bg-white/[0.03] p-2 rounded-xl border border-white/[0.05]">
                            <div className="text-[9px] font-mono text-white/40 uppercase">Acclaimed</div>
                            <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">{accl}%</div>
                          </div>
                          <div className="bg-white/[0.03] p-2 rounded-xl border border-white/[0.05]">
                            <div className="text-[9px] font-mono text-white/40 uppercase">Transcendent</div>
                            <div className="text-xs font-mono font-bold text-purple-300 mt-0.5">{trans}%</div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Right: The Arc Gauge */}
                  <div className="flex-1 flex items-center justify-center select-none py-1">
                    <svg className="w-full max-w-[340px] h-48 overflow-visible" viewBox="0 0 340 185">
                      <defs>
                        <linearGradient id="criticArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f43f5e" />
                          <stop offset="35%" stopColor="#f59e0b" />
                          <stop offset="70%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                        <filter id="scoreGlow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#00f0ff" floodOpacity="0.5" />
                        </filter>
                      </defs>

                      {/* Perimeter Ticks */}
                      {[0, 30, 60, 90, 120, 150, 180].map((angle, i) => {
                        const rad = (angle * Math.PI) / 180;
                        const x1 = 170 - Math.cos(rad) * 128;
                        const y1 = 145 - Math.sin(rad) * 128;
                        const x2 = 170 - Math.cos(rad) * 135;
                        const y2 = 145 - Math.sin(rad) * 135;
                        return (
                          <line
                            key={i}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="rgba(255,255,255,0.18)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        );
                      })}

                      {/* Base Track */}
                      <path
                        d="M 55 145 A 115 115 0 0 1 285 145"
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="14"
                        strokeLinecap="round"
                      />

                      {/* Dynamic Arc Fill */}
                      {(() => {
                        const targetScore = dbReview ? Number(dbReview.score) : 98;
                        const totalArcLength = 361.28;
                        const targetOffset = totalArcLength * (1 - Math.min(100, Math.max(0, targetScore)) / 100);
                        const currentOffset = isScoreVisible ? targetOffset : totalArcLength;
                        return (
                          <path
                            d="M 55 145 A 115 115 0 0 1 285 145"
                            fill="none"
                            stroke="url(#criticArcGradient)"
                            strokeWidth="14"
                            strokeDasharray={totalArcLength}
                            strokeDashoffset={currentOffset}
                            strokeLinecap="round"
                            style={{
                              transition: 'stroke-dashoffset 1500ms cubic-bezier(0.16, 1, 0.3, 1)',
                              willChange: 'stroke-dashoffset',
                            }}
                          />
                        );
                      })()}

                      {/* Center 0 Notch */}
                      <line x1="170" y1="22" x2="170" y2="38" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

                      {/* Axis Labels */}
                      <text x="170" y="10" textAnchor="middle" fill="#ffffff" className="font-mono font-black" style={{ fontSize: '14px', fontWeight: 900 }}>0</text>
                      <text x="170" y="20" textAnchor="middle" fill="rgba(255,255,255,0.4)" className="font-mono" style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.1em' }}>NEUTRAL</text>
                      <text x="40" y="172" textAnchor="middle" fill="#f43f5e" className="font-mono font-black" style={{ fontSize: '18px', fontWeight: 900 }}>-∞</text>
                      <text x="40" y="185" textAnchor="middle" fill="rgba(255,255,255,0.4)" className="font-mono" style={{ fontSize: '8px', fontWeight: 700 }}>ABYSSAL</text>
                      <text x="300" y="172" textAnchor="middle" fill="#c084fc" className="font-mono font-black" style={{ fontSize: '18px', fontWeight: 900 }}>+∞</text>
                      <text x="300" y="185" textAnchor="middle" fill="rgba(255,255,255,0.4)" className="font-mono" style={{ fontSize: '8px', fontWeight: 700 }}>ASCENDANT</text>

                      {/* Animated Score Counter Display */}
                      <text
                        x="170"
                        y="114"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#ffffff"
                        className="font-display select-none"
                        filter="url(#scoreGlow)"
                        style={{
                          fontSize: '58px',
                          fontWeight: 900,
                          letterSpacing: '-0.03em',
                          opacity: isScoreVisible ? 1 : 0.3,
                          transform: isScoreVisible ? 'scale(1)' : 'scale(0.85)',
                          transformOrigin: '170px 114px',
                          transition: 'opacity 800ms ease-out, transform 800ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                      >
                        {animatedScore}%
                      </text>
                    </svg>
                  </div>
                </div>

                {/* Module 2: Winning Audience Consensus View (Full Width Landscape) */}
                {(() => {
                  const winner = getWinningAudienceOption();
                  return (
                    <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#050509] border border-white/[0.08] p-6 sm:p-7 rounded-[28px] shadow-inner gap-6">
                      
                      {/* Left: Big Winning Verdict Hero Display */}
                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-cyan-400" />
                          <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-300">
                            COMMUNITY CONSENSUS VERDICT
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${winner.bg} ${winner.color} ${winner.border} border ml-auto sm:ml-2`}>
                            {winner.tag}
                          </span>
                        </div>

                        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-4">
                          <span className="text-3xl sm:text-4xl shrink-0 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                            {winner.icon}
                          </span>
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <div className={`font-display font-black text-base sm:text-xl lg:text-2xl ${winner.color} tracking-tight leading-snug break-words`}>
                              {winner.label}
                            </div>
                            <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed mt-1">
                              {winner.desc}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Right: Vote Stats & Legend Distribution */}
                      <div className="w-full md:w-80 shrink-0 space-y-3 pt-4 md:pt-0 md:pl-6 border-t md:border-t-0 md:border-l border-white/[0.06] flex flex-col justify-center">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-white/40">Total Consensus</span>
                          <span className="text-white font-bold">
                            {totalAudienceVotes > 0 ? `${winner.percentage}% Majority` : '0 Votes'}
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full h-2.5 rounded-full bg-white/[0.06] overflow-hidden flex p-0.5">
                          {totalAudienceVotes > 0 ? (
                            <>
                              <div className="h-full bg-emerald-400 rounded-l-full transition-all duration-500" style={{ width: `${(audienceVotes.must_buy / totalAudienceVotes) * 100}%` }} />
                              <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${(audienceVotes.wait_sale / totalAudienceVotes) * 100}%` }} />
                              <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: `${(audienceVotes.wait / totalAudienceVotes) * 100}%` }} />
                              <div className="h-full bg-rose-400 rounded-r-full transition-all duration-500" style={{ width: `${(audienceVotes.skip / totalAudienceVotes) * 100}%` }} />
                            </>
                          ) : (
                            <div className="h-full bg-white/[0.08] w-full rounded-full" />
                          )}
                        </div>

                        {/* Mini Legend */}
                        <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono text-center text-white/50 pt-1">
                          <div className="bg-white/[0.03] py-1.5 rounded-xl border border-white/[0.05]">
                            <span className="text-emerald-400 font-bold block sm:inline">
                              {totalAudienceVotes > 0 ? `${Math.round((audienceVotes.must_buy / totalAudienceVotes) * 100)}%` : '0%'}
                            </span>{' '}
                            <span>Buy</span>
                          </div>
                          <div className="bg-white/[0.03] py-1.5 rounded-xl border border-white/[0.05]">
                            <span className="text-amber-400 font-bold block sm:inline">
                              {totalAudienceVotes > 0 ? `${Math.round((audienceVotes.wait_sale / totalAudienceVotes) * 100)}%` : '0%'}
                            </span>{' '}
                            <span>Sale</span>
                          </div>
                          <div className="bg-white/[0.03] py-1.5 rounded-xl border border-white/[0.05]">
                            <span className="text-cyan-400 font-bold block sm:inline">
                              {totalAudienceVotes > 0 ? `${Math.round((audienceVotes.wait / totalAudienceVotes) * 100)}%` : '0%'}
                            </span>{' '}
                            <span>Wait</span>
                          </div>
                          <div className="bg-white/[0.03] py-1.5 rounded-xl border border-white/[0.05]">
                            <span className="text-rose-400 font-bold block sm:inline">
                              {totalAudienceVotes > 0 ? `${Math.round((audienceVotes.skip / totalAudienceVotes) * 100)}%` : '0%'}
                            </span>{' '}
                            <span>Skip</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              </div>
            </div>

            {/* Box 2: Dedicated Key Assessment & Pros/Cons Card */}
            <div className="rounded-[32px] p-7 sm:p-8 bg-[#090912] border border-white/[0.1] shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-bold">
                    CRITICAL BREAKDOWN
                  </span>
                  <h3 className="font-display font-bold text-2xl text-white mt-0.5">Key Strengths & Flaws</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {dbReview ? `${dbReview.verdict.toUpperCase()} TIER` : 'MASTERPIECE TIER'}
                </span>
              </div>

              {/* Pros & Cons Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-white/[0.05]">
                  <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <span>✓</span> Key Strengths
                  </h4>
                  <ul className="space-y-2.5">
                    {currentPros.map((pro, idx) => (
                      <li key={idx} className="text-xs text-white/70 flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-white/[0.05]">
                  <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-rose-400 flex items-center gap-2">
                    <span>✗</span> Weak Points
                  </h4>
                  <ul className="space-y-2.5">
                    {currentCons.map((con, idx) => (
                      <li key={idx} className="text-xs text-white/70 flex items-start gap-2 leading-relaxed">
                        <span className="text-rose-400 mt-0.5">•</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Verdict Box */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <div className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest mb-1.5">
                  FINAL VERDICT
                </div>
                <p className="font-display text-xs sm:text-sm text-white/90 leading-relaxed italic">
                  "{currentBottomLine}"
                </p>
              </div>
            </div>

          </div>
        </article>

        {/* Pop Culture Reddit-style Discussion Hub */}
        <ArticleDiscussionHub
          articleSlug={slug || article.slug}
          articleTitle={currentTitle}
          category={currentCategory}
        />

        {/* More Articles Deck */}
        <section className="max-w-5xl mx-auto px-6 mt-20">
          <h3 className="font-display font-bold text-2xl text-white mb-6">Related Coverage</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {article.moreArticles.map((item) => (
              <a
                key={item.id}
                href={`/articles/${item.slug}`}
                className="rounded-[22px] overflow-hidden bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/[0.2] transition-all p-4 flex flex-col justify-between group"
              >
                <div className="h-36 rounded-xl overflow-hidden mb-3 bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-cyan-300">{item.category}</span>
                  <h4 className="font-display font-bold text-sm text-white group-hover:text-cyan-300 transition-colors mt-1 line-clamp-2">
                    {item.title}
                  </h4>
                </div>
              </a>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
