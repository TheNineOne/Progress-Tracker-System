import { useState } from 'react';
import {
  LogIn,
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  Github,
  Code2,
  MessageSquare,
  FileText,
  BarChart3,
  ChevronRight,
  Shield,
  Zap,
  Brain
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAppStore } from '../../store/appStore';
import { cn } from '../../utils/cn';

interface LoginProps {
  onLogin: () => void;
}

const features = [
  { icon: MessageSquare, label: 'AI Interview Simulator', color: 'text-violet-400', bg: 'bg-violet-500/10' },
  { icon: Code2, label: 'Real-Time Code Review', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: FileText, label: 'Resume Analyzer', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { icon: BarChart3, label: 'Productivity Tracker', color: 'text-amber-400', bg: 'bg-amber-500/10' },
];

export function Login({ onLogin }: LoginProps) {
  const { setUser } = useAppStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Real Google OAuth login
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setLoadingProvider('google');
      try {
        // Fetch user info from Google
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then((r) => r.json());

        const user = {
          id: userInfo.sub || `google_${Date.now()}`,
          name: userInfo.name || 'Google User',
          email: userInfo.email || 'user@gmail.com',
          avatar: userInfo.picture || '',
          createdAt: new Date(),
          provider: 'google' as const,
        };
        setUser(user);
        onLogin();
      } catch (err) {
        // Fallback if Google info fetch fails
        console.error('Google login error:', err);
        const user = {
          id: `google_${Date.now()}`,
          name: 'Google User',
          email: 'user@gmail.com',
          avatar: '',
          createdAt: new Date(),
          provider: 'google' as const,
        };
        setUser(user);
        onLogin();
      } finally {
        setIsLoading(false);
        setLoadingProvider(null);
      }
    },
    onError: (error) => {
      console.error('Google Login Failed:', error);
      setError('Google login failed. Please try email login instead.');
      setIsLoading(false);
      setLoadingProvider(null);
    },
  });

  const handleGoogleLogin = () => {
    setError('');
    setLoadingProvider('google');
    googleLogin();
  };

  const handleGitHubLogin = async () => {
    setError('');
    setLoadingProvider('github');
    setIsLoading(true);

    // Simulate GitHub OAuth (real OAuth needs backend redirect)
    await new Promise((r) => setTimeout(r, 1200));

    const user = {
      id: `github_${Date.now()}`,
      name: 'GitHub Developer',
      email: 'dev@github.com',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=github`,
      createdAt: new Date(),
      provider: 'github' as const,
    };
    setUser(user);
    setIsLoading(false);
    setLoadingProvider(null);
    onLogin();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill all required fields.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setLoadingProvider('email');
    await new Promise((r) => setTimeout(r, 1000));

    const user = {
      id: `user_${Date.now()}`,
      name: formData.name || formData.email.split('@')[0],
      email: formData.email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`,
      createdAt: new Date(),
      provider: 'email' as const,
    };

    setUser(user);
    setIsLoading(false);
    setLoadingProvider(null);
    onLogin();
  };

  const isAnyLoading = isLoading || loadingProvider !== null;

  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/80 via-gray-900 to-indigo-900/80" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-600/10 rounded-full blur-2xl" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        {/* Content */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Progress Tracking System</h1>
              <p className="text-violet-400 text-sm">Developed by Shrey Mishra</p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-5xl font-bold text-white leading-tight mb-4">
              Track Your
              <span className="block bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Dev Progress
              </span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              The all-in-one AI platform by <span className="text-violet-300 font-semibold">Shrey Mishra</span> — practice interviews,
              review code in real-time, analyze resumes, and track your productivity.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className={cn('flex items-center gap-3 p-4 rounded-2xl border border-white/5', f.bg)}>
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', f.bg)}>
                    <Icon className={cn('w-5 h-5', f.color)} />
                  </div>
                  <span className="text-gray-300 text-sm font-medium">{f.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="relative flex items-center gap-8">
          {[
            { icon: Brain, label: 'AI Powered', val: '4 Modules' },
            { icon: Shield, label: 'Secure Auth', val: 'JWT + OAuth' },
            { icon: Zap, label: 'Real-Time', val: 'WebSockets' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-violet-400" />
                <div>
                  <p className="text-white font-bold text-sm">{s.val}</p>
                  <p className="text-gray-500 text-xs">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gray-950">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25 mb-3">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Progress Tracking System</h1>
            <p className="text-violet-400 text-sm mt-1">by Shrey Mishra</p>
          </div>

          {/* Tab Switch */}
          <div className="flex p-1 rounded-2xl bg-gray-900 border border-gray-800 mb-8">
            <button
              onClick={() => setIsSignUp(false)}
              className={cn(
                'flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                !isSignUp
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20'
                  : 'text-gray-400 hover:text-gray-200'
              )}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={cn(
                'flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                isSignUp
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20'
                  : 'text-gray-400 hover:text-gray-200'
              )}
            >
              Sign Up
            </button>
          </div>

          <div className="rounded-3xl p-8 bg-gray-900 border border-gray-800 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              {isSignUp
                ? 'Start your AI-powered dev journey today'
                : 'Sign in to continue your learning journey'}
            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                <span className="text-red-500">⚠</span>
                {error}
              </div>
            )}

            {/* Social Login Buttons */}
            <div className="space-y-3 mb-6">
              {/* Google Login - Real OAuth */}
              <button
                onClick={handleGoogleLogin}
                disabled={isAnyLoading}
                className={cn(
                  'w-full flex items-center gap-3 py-3.5 px-5 rounded-xl border font-medium text-sm transition-all duration-200',
                  'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-750 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  loadingProvider === 'google' && 'border-violet-500/50 bg-gray-800'
                )}
              >
                {loadingProvider === 'google' ? (
                  <div className="w-5 h-5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                <span className="flex-1 text-left">
                  {loadingProvider === 'google' ? 'Connecting to Google...' : 'Continue with Google'}
                </span>
                <span className="text-xs text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">OAuth 2.0</span>
              </button>

              {/* GitHub Login */}
              <button
                onClick={handleGitHubLogin}
                disabled={isAnyLoading}
                className={cn(
                  'w-full flex items-center gap-3 py-3.5 px-5 rounded-xl border font-medium text-sm transition-all duration-200',
                  'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-750 hover:border-gray-500 hover:shadow-lg',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  loadingProvider === 'github' && 'border-gray-500'
                )}
              >
                {loadingProvider === 'github' ? (
                  <div className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
                ) : (
                  <Github className="w-5 h-5 flex-shrink-0" />
                )}
                <span className="flex-1 text-left">
                  {loadingProvider === 'github' ? 'Connecting to GitHub...' : 'Continue with GitHub'}
                </span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-gray-900 text-gray-600">or use email</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your full name"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 text-sm transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-400">Password</label>
                  {!isSignUp && (
                    <button type="button" className="text-xs text-violet-400 hover:text-violet-300">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Strength (signup only) */}
              {isSignUp && formData.password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-colors',
                          formData.password.length >= i * 3
                            ? i <= 1 ? 'bg-red-500' : i <= 2 ? 'bg-amber-500' : i <= 3 ? 'bg-yellow-400' : 'bg-emerald-500'
                            : 'bg-gray-800'
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    {formData.password.length < 6 ? 'Too short' :
                      formData.password.length < 8 ? 'Weak' :
                        formData.password.length < 12 ? 'Good' : 'Strong'} password
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isAnyLoading}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200',
                  'bg-gradient-to-r from-violet-600 to-indigo-600 text-white',
                  'hover:from-violet-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-violet-500/25',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {loadingProvider === 'email' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle */}
            <p className="mt-6 text-center text-sm text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Sign Up for free'}
              </button>
            </p>
          </div>

          {/* Google Note */}
          <div className="mt-4 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-center">
            <p className="text-xs text-gray-600">
              🔐 <span className="text-blue-400 font-medium">Google OAuth 2.0</span> enabled — click "Continue with Google" to use your real Google account
            </p>
          </div>

          {/* Developer Credit */}
          <div className="mt-3 p-3 rounded-xl bg-violet-500/5 border border-violet-500/10 text-center">
            <p className="text-xs text-gray-600">
              ⚡ <span className="text-violet-400 font-semibold">Progress Tracking System</span> — Developed with ❤️ by{' '}
              <span className="text-violet-300 font-bold">Shrey Mishra</span>
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-gray-700">
            By continuing, you agree to our{' '}
            <a href="#" className="text-violet-500 hover:underline">Terms</a>
            {' & '}
            <a href="#" className="text-violet-500 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
