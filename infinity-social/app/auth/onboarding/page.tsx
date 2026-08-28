'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { sanitizeUsername } from '@/lib/auth-validation';

export default function OnboardingPage() {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
    if (profile?.username && !profile.username.startsWith('user_temp_') && !profile.username.includes('@')) {
      // Already has a valid username
      router.push('/');
    }
  }, [user, profile, authLoading, router]);

  // Pre-fill display name and avatar from Google OAuth metadata if available
  useEffect(() => {
    if (user) {
      if (!displayName) {
        const oAuthName = user.user_metadata?.full_name || user.user_metadata?.name || '';
        if (oAuthName) setDisplayName(oAuthName);
      }
      if (!avatarPreview) {
        const oAuthAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || profile?.avatar_url;
        if (oAuthAvatar) setAvatarPreview(oAuthAvatar);
      }
    }
  }, [user, profile, displayName, avatarPreview]);

  // Handle Username availability check with debounce
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameError(username.length > 0 ? 'Username must be at least 3 characters' : null);
      setIsAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      setUsernameError(null);
      const clean = sanitizeUsername(username);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', clean)
          .neq('id', user?.id || '')
          .maybeSingle();

        if (error) {
          console.error('Error checking username:', error);
        } else if (data) {
          setIsAvailable(false);
          setUsernameError('This username is already taken');
        } else {
          setIsAvailable(true);
          setUsernameError(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username, user?.id]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image size should be less than 5MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setErrorMsg(null);
    }
  };

  const handleComplete = async (skipAvatar: boolean = false) => {
    if (!username || username.length < 3) {
      setUsernameError('Please choose a valid username');
      return;
    }
    if (isAvailable === false) {
      setUsernameError('Username is already taken');
      return;
    }
    if (!user) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      let finalAvatarUrl: string | null = avatarPreview || profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

      // 1. Upload avatar if custom file selected and not skipped
      if (!skipAvatar && avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) {
          console.warn('Avatar upload error:', uploadError.message);
        } else {
          const { data: publicData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          finalAvatarUrl = publicData.publicUrl;
        }
      }

      // 2. Upsert profile with chosen username and avatar
      const cleanUsername = sanitizeUsername(username);
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: cleanUsername,
          display_name: displayName.trim() || cleanUsername,
          avatar_url: finalAvatarUrl,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        throw new Error(profileError.message);
      }

      await refreshProfile();
      router.push('/');
    } catch (err: any) {
      console.error('Onboarding failed:', err);
      setErrorMsg(err.message || 'Failed to complete profile setup.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040406] text-[#f5f5f7] flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden selection:bg-white selection:text-black">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.15] bg-gradient-to-tr from-purple-600 to-pink-500 animate-pulse top-[-10%] left-[20%]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
      </div>

      {/* Top logo */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5 text-white">
          <span className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center font-bold text-base">
            ∞
          </span>
          <span className="font-bold text-sm tracking-tight">Infinity Social</span>
        </div>
      </div>

      {/* Center Setup Card */}
      <div className="relative z-10 w-full max-w-md mx-auto my-auto py-10">
        <div className="bg-[#090912]/85 backdrop-blur-2xl border border-white/[0.1] p-7 sm:p-9 rounded-[28px] shadow-[0_25px_60px_rgba(0,0,0,0.7)] space-y-6">
          
          <div className="text-center space-y-1.5">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-white/[0.06] border border-white/10 text-white/70">
              One Last Step
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">Complete Your Profile</h1>
            <p className="text-xs text-white/50">
              Choose your unique public handle and customize how you appear across reviews and discussions.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
              {errorMsg}
            </div>
          )}

          {/* Profile Picture Upload (Optional) */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full border-2 border-white/15 bg-white/[0.03] overflow-hidden flex items-center justify-center relative shadow-inner">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl text-white/30 font-light">
                    {username ? username.charAt(0).toUpperCase() : '👤'}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-[10px] text-white">
                  <span>Change</span>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <div className="text-center">
              <p className="text-[11px] font-medium text-white/70">Profile Picture <span className="text-white/30">(Optional)</span></p>
              <p className="text-[10px] text-white/40">Click to upload JPG, PNG or WEBP (Max 5MB)</p>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="space-y-4">
            {/* Username Input (Mandatory) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold text-white/80">
                  Username <span className="text-red-400">*</span>
                </label>
                {isCheckingUsername && (
                  <span className="text-[10px] text-white/40 animate-pulse">Checking...</span>
                )}
                {!isCheckingUsername && isAvailable === true && (
                  <span className="text-[10px] text-emerald-400 font-medium">✓ Available</span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-xs font-mono">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(sanitizeUsername(e.target.value))}
                  placeholder="critickid"
                  className={`w-full pl-8 pr-4 py-2.5 rounded-xl text-xs bg-white/[0.04] border ${
                    usernameError ? 'border-red-500/50' : isAvailable ? 'border-emerald-500/50' : 'border-white/10'
                  } focus:border-white/40 text-white placeholder-white/20 outline-none transition-colors font-mono`}
                />
              </div>
              {usernameError && (
                <p className="text-[10px] text-red-400 mt-1">{usernameError}</p>
              )}
            </div>

            {/* Display Name Input */}
            <div>
              <label className="block text-[11px] font-semibold text-white/80 mb-1.5">
                Display Name <span className="text-white/30 text-[10px] font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Akira Toriyama"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white/[0.04] border border-white/10 focus:border-white/40 text-white placeholder-white/20 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              disabled={submitting || !username || username.length < 3 || isAvailable === false}
              onClick={() => handleComplete(false)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white text-black hover:bg-white/90 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg cursor-pointer"
            >
              {submitting ? 'Saving Profile…' : 'Save & Continue'}
            </button>

            {avatarFile && (
              <button
                type="button"
                disabled={submitting || !username || username.length < 3 || isAvailable === false}
                onClick={() => handleComplete(true)}
                className="w-full py-2 text-center text-[11px] text-white/40 hover:text-white/80 transition-colors"
              >
                Skip avatar upload for now
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center text-[11px] text-white/30">
        Infinity Social Media Platform • User Verification
      </div>
    </div>
  );
}
