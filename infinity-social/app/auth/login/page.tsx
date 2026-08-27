'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { validatePassword } from '@/lib/auth-validation';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const passwordAnalysis = validatePassword(password);

  // Social Auth Handlers (Google, GitHub)
  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMessage(err.message || `Failed to sign in with ${provider}`);
      setLoading(false);
    }
  };

  // Email/Password Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // If Sign Up, enforce strong password criteria
    if (!isLogin && !passwordAnalysis.isStrong) {
      setErrorMessage('Please create a stronger password meeting all security requirements.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Sign In Flow
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        // Check if user has completed profile username
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', data.user.id)
            .single();

          if (!profile || !profile.username || profile.username.startsWith('user_temp_') || profile.username.includes('@')) {
            router.push('/auth/onboarding');
          } else {
            router.push('/');
          }
        }
      } else {
        // Sign Up Flow
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: `user_temp_${Math.floor(Math.random() * 1000000)}`,
            },
          },
        });

        if (error) throw error;

        if (data?.session) {
          // Auto-logged in after signup -> Direct to Onboarding (Username + Avatar)
          router.push('/auth/onboarding');
        } else if (data?.user && !data.session) {
          // Email confirmation is required by Supabase auth
          setSuccessMessage('Registration successful! Please check your email inbox to confirm your account.');
          setLoading(false);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040406] text-[#f5f5f7] flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden selection:bg-white selection:text-black">
      
      {/* Dynamic Animated Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.12] bg-gradient-to-tr from-violet-600 to-indigo-500 animate-pulse"
          style={{ top: '-15%', left: '20%', animationDuration: '8s' }}
        />
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-[130px] opacity-[0.09] bg-gradient-to-br from-cyan-500 to-blue-600 animate-pulse"
          style={{ bottom: '-10%', right: '15%', animationDuration: '10s', animationDelay: '2s' }}
        />
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040406]/40 via-transparent to-[#040406]" />
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between w-full max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5 text-white no-underline group">
          <span className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center font-bold text-base group-hover:bg-white group-hover:text-black transition-all">
            ∞
          </span>
          <span className="font-bold text-sm tracking-tight">Infinity Social</span>
        </Link>

        <Link
          href="/"
          className="text-xs text-white/50 hover:text-white transition-colors"
        >
          ← Back to Articles
        </Link>
      </div>

      {/* Center Auth Form */}
      <div className="relative z-10 w-full max-w-sm mx-auto my-auto py-8">
        <div className="space-y-5 bg-[#090912]/80 backdrop-blur-xl border border-white/[0.08] p-7 sm:p-8 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          
          {/* Headline */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {isLogin ? 'Sign in to Infinity' : 'Create an account'}
            </h1>
            <p className="text-xs text-white/50 mt-1">
              {isLogin
                ? 'Enter your credentials to access your saved reviews & voting.'
                : 'Join critics and readers discussing modern media.'}
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs leading-relaxed">
              {successMessage}
            </div>
          )}

          {/* Clean Segmented Tab Control */}
          <div className="grid grid-cols-2 p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setErrorMessage(null); setSuccessMessage(null); }}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                isLogin
                  ? 'bg-white text-black shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setErrorMessage(null); setSuccessMessage(null); }}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                !isLogin
                  ? 'bg-white text-black shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Social Connect Buttons (Google & GitHub) */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleOAuthLogin('google')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-xs font-medium text-white transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z"/>
                <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleOAuthLogin('github')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-xs font-medium text-white transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-[10px] text-white/30 tracking-widest uppercase">or with email</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* Input Fields */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-medium text-white/70 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white/[0.03] border border-white/[0.1] focus:border-white/40 text-white placeholder-white/20 outline-none transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-medium text-white/70">
                  Password
                </label>
                {isLogin && (
                  <a href="#" className="text-[10px] text-white/40 hover:text-white transition-colors">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-xs bg-white/[0.03] border border-white/[0.1] focus:border-white/40 text-white placeholder-white/20 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Real-time Password Strength Criteria (Shown on Sign Up) */}
              {!isLogin && password.length > 0 && (
                <div className="mt-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-white/50">Password Strength</span>
                    <span className={`font-semibold ${
                      passwordAnalysis.score <= 2 ? 'text-red-400' :
                      passwordAnalysis.score <= 4 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {passwordAnalysis.score <= 2 ? 'Weak' : passwordAnalysis.score <= 4 ? 'Good' : 'Strong'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={`h-full flex-1 rounded-full transition-all duration-300 ${
                          lvl <= passwordAnalysis.score
                            ? passwordAnalysis.score <= 2
                              ? 'bg-red-500'
                              : passwordAnalysis.score <= 4
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Criteria Checklist */}
                  <div className="grid grid-cols-2 gap-1 pt-1 text-[10px]">
                    <span className={passwordAnalysis.hasMinLength ? 'text-emerald-400' : 'text-white/30'}>
                      {passwordAnalysis.hasMinLength ? '✓' : '○'} 8+ Characters
                    </span>
                    <span className={passwordAnalysis.hasUppercase ? 'text-emerald-400' : 'text-white/30'}>
                      {passwordAnalysis.hasUppercase ? '✓' : '○'} Uppercase letter
                    </span>
                    <span className={passwordAnalysis.hasLowercase ? 'text-emerald-400' : 'text-white/30'}>
                      {passwordAnalysis.hasLowercase ? '✓' : '○'} Lowercase letter
                    </span>
                    <span className={passwordAnalysis.hasNumber ? 'text-emerald-400' : 'text-white/30'}>
                      {passwordAnalysis.hasNumber ? '✓' : '○'} Number
                    </span>
                    <span className={passwordAnalysis.hasSpecialChar ? 'text-emerald-400' : 'text-white/30'}>
                      {passwordAnalysis.hasSpecialChar ? '✓' : '○'} Special symbol
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (!isLogin && !passwordAnalysis.isStrong)}
              className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-white text-black hover:bg-white/90 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg cursor-pointer"
            >
              {loading ? 'Please wait…' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center text-[11px] text-white/30">
        By continuing, you agree to Infinity Social's{' '}
        <Link href="/terms" className="text-white/60 hover:text-white underline underline-offset-2">
          Terms
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-white/60 hover:text-white underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </div>

    </div>
  );
}
