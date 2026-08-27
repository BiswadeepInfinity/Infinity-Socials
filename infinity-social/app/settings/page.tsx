'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import AvatarCropperModal from '@/components/AvatarCropperModal';
import Link from 'next/link';

type SettingsTab = 'profile' | 'account' | 'appearance' | 'notifications';

export default function SettingsPage() {
  const { user, profile, refreshProfile, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Profile Form
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password / Security Form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Preference switches
  const [emailDigest, setEmailDigest] = useState(true);
  const [commentAlerts, setCommentAlerts] = useState(true);
  const [compactFeed, setCompactFeed] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 8 * 1024 * 1024) {
        setProfileError('Image file size must be under 8MB.');
        return;
      }
      const rawUrl = URL.createObjectURL(file);
      setRawImageForCrop(rawUrl);
      setIsCropModalOpen(true);
      setProfileError(null);
      e.target.value = '';
    }
  };

  const handleCropComplete = (croppedBlob: Blob, previewUrl: string) => {
    setAvatarBlob(croppedBlob);
    setAvatarPreview(previewUrl);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      let finalAvatarUrl = avatarUrl;

      // Upload cropped blob to Supabase Storage if chosen
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
        setAvatarUrl(finalAvatarUrl);
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim() || username,
          bio: bio.trim(),
          avatar_url: finalAvatarUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      setProfileSuccess(true);
      setAvatarBlob(null);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
      setUploadingAvatar(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setUpdatingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060609] text-[#ececf1] flex flex-col justify-between selection:bg-white selection:text-black">
      <Navbar />

      <main className="max-w-[1100px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Page Header */}
        <div className="pb-6 border-b border-white/[0.08] mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">Account Settings</h1>
          <p className="text-xs text-white/45 mt-1 font-normal">
            Manage your personal profile, security, and notification preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Side Nav Tabs */}
          <div className="md:col-span-4 space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-3 ${
                activeTab === 'profile'
                  ? 'bg-white/[0.08] text-white border border-white/10'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <span>👤</span>
              <span>Profile Information</span>
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-3 ${
                activeTab === 'account'
                  ? 'bg-white/[0.08] text-white border border-white/10'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <span>🔒</span>
              <span>Security & Password</span>
            </button>

            <button
              onClick={() => setActiveTab('appearance')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-3 ${
                activeTab === 'appearance'
                  ? 'bg-white/[0.08] text-white border border-white/10'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <span>🎨</span>
              <span>Preferences & Theme</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-3 ${
                activeTab === 'notifications'
                  ? 'bg-white/[0.08] text-white border border-white/10'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <span>🔔</span>
              <span>Notifications</span>
            </button>

            <div className="pt-4 mt-4 border-t border-white/[0.06]">
              <button
                onClick={() => signOut()}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer flex items-center gap-3"
              >
                <span>🚪</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Settings Main Content Area */}
          <div className="md:col-span-8 p-6 sm:p-7 rounded-2xl bg-[#0e0e13] border border-white/[0.08]">
            
            {/* TAB 1: PROFILE */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-base font-bold text-white mb-1">Public Profile</h2>
                <p className="text-xs text-white/40 mb-6">This information is visible across Infinity Social.</p>

                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                  {profileSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                      ✓ Profile details saved successfully.
                    </div>
                  )}
                  {profileError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                      {profileError}
                    </div>
                  )}

                  {/* Circular Avatar Upload UI */}
                  <div className="space-y-2 pb-2">
                    <label className="text-[11px] font-medium text-white/50 block">Profile Avatar</label>
                    <div className="flex items-center gap-5">
                      <div className="relative group">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-[#181820] border-2 border-white/15 flex items-center justify-center text-xl font-bold relative shadow-lg group-hover:border-white/40 transition-all">
                          {avatarPreview || avatarUrl ? (
                            <img src={avatarPreview || avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white/60 font-mono">{username.slice(0, 2).toUpperCase() || 'U'}</span>
                          )}
                          {uploadingAvatar && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            </div>
                          )}
                        </div>
                        <label
                          htmlFor="avatar-file-input"
                          className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] text-white font-medium cursor-pointer transition-opacity backdrop-blur-xs"
                        >
                          <span>📷</span>
                          <span>Change</span>
                        </label>
                      </div>

                      <div className="space-y-1.5">
                        <label
                          htmlFor="avatar-file-input"
                          className="inline-block px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white border border-white/10 transition-colors cursor-pointer"
                        >
                          Upload new photo
                        </label>
                        <input
                          id="avatar-file-input"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFileSelect}
                          className="hidden"
                        />
                        <p className="text-[10px] text-white/35">Supports JPG, PNG, GIF or WEBP under 5MB.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-white/50">Username</label>
                    <input
                      type="text"
                      disabled
                      value={username}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-white/40 text-xs font-mono cursor-not-allowed"
                    />
                    <p className="text-[10px] text-white/30">Usernames cannot be changed once established.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-white/50">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Adrian Vance"
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none focus:border-white/30"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-white/50">Bio</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Write a short summary of your tastes..."
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none focus:border-white/30 resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingProfile || uploadingAvatar}
                      className="px-4 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: SECURITY */}
            {activeTab === 'account' && (
              <div>
                <h2 className="text-base font-bold text-white mb-1">Security & Login</h2>
                <p className="text-xs text-white/40 mb-6">Manage authentication credentials and password.</p>

                <div className="space-y-6 max-w-lg">
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <span className="text-[11px] text-white/40 block">Connected Email Address</span>
                    <span className="text-xs font-mono font-semibold text-white mt-0.5 block">{user?.email}</span>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-3.5 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">Update Password</h3>

                    {passwordSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                        ✓ Password updated successfully.
                      </div>
                    )}
                    {passwordError && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                        {passwordError}
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-white/50">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none focus:border-white/30"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-white/50">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-xs outline-none focus:border-white/30"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={updatingPassword}
                        className="px-4 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-all cursor-pointer"
                      >
                        {updatingPassword ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 3: PREFERENCES */}
            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-base font-bold text-white mb-1">Preferences & Interface</h2>
                <p className="text-xs text-white/40 mb-6">Customize display styles and view behaviors.</p>

                <div className="space-y-4 max-w-lg">
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Default Dark Mode</h4>
                      <p className="text-[10px] text-white/40 mt-0.5">Infinity Social is calibrated for dark room gaming & cinema viewing.</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-white/60 bg-white/[0.06] px-2 py-1 rounded">
                      Active
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Compact Reading Layout</h4>
                      <p className="text-[10px] text-white/40 mt-0.5">Condense whitespace on article reviews.</p>
                    </div>
                    
                    {/* Modern iOS-style Pill Toggle */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={compactFeed}
                      onClick={() => setCompactFeed(!compactFeed)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                        compactFeed ? 'bg-white' : 'bg-white/20 hover:bg-white/30'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-md transition duration-200 ease-in-out ${
                          compactFeed ? 'translate-x-4 bg-black' : 'translate-x-0 bg-white'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-base font-bold text-white mb-1">Notification Preferences</h2>
                <p className="text-xs text-white/40 mb-6">Configure how and when Infinity Social reaches you.</p>

                <div className="space-y-4 max-w-lg">
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Weekly Review Digest</h4>
                      <p className="text-[10px] text-white/40 mt-0.5">Top-voted critical verdicts and community highlights.</p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={emailDigest}
                      onClick={() => setEmailDigest(!emailDigest)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                        emailDigest ? 'bg-white' : 'bg-white/20 hover:bg-white/30'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-md transition duration-200 ease-in-out ${
                          emailDigest ? 'translate-x-4 bg-black' : 'translate-x-0 bg-white'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Discussion Replies & Likes</h4>
                      <p className="text-[10px] text-white/40 mt-0.5">Notify when someone interacts with your critiques or comments.</p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={commentAlerts}
                      onClick={() => setCommentAlerts(!commentAlerts)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                        commentAlerts ? 'bg-white' : 'bg-white/20 hover:bg-white/30'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-md transition duration-200 ease-in-out ${
                          commentAlerts ? 'translate-x-4 bg-black' : 'translate-x-0 bg-white'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Interactive Aspect Ratio & Crop Canvas Modal */}
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
