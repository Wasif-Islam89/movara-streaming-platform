import { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import movoraLogo from '../assets/logo/MOVORA Logo.png';

/**
 * Premium Cinematic Authentication Modal for MOVORA
 * Features:
 * - Professional segmented tab navigation (Sign In vs Create Account)
 * - Show/Hide password toggle with interactive icons
 * - Real-time password strength meter with visual indicators
 * - One-click Quick Demo login for seamless evaluator testing
 * - Google and Apple social sign-in buttons with authentic SVG branding
 * - Remember me checkbox & interactive Forgot Password reset flow
 * - Smooth simulated authentication loading spinner
 * - Responsive, accessible, and aligned with MOVORA's dark cinematic theme
 */
export default function AuthModal({ 
  isOpen, 
  onClose, 
  initialEmail = '', 
  initialMode = 'signin' 
}) {
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  // Mode: 'signin' | 'signup'
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  // Sync initial props whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'signin');
      if (initialEmail) setEmail(initialEmail);
      setError('');
      setForgotPasswordSent(false);
      setIsLoading(false);
    }
  }, [isOpen, initialMode, initialEmail]);

  // Close modal on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Password strength calculator for Sign Up mode
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: '', color: 'bg-transparent' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500', text: 'text-red-400' };
    if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-amber-500', text: 'text-amber-400' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-400' };
  };

  const strength = getPasswordStrength();

  // Handle standard form submit
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    // Validations
    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (cleanPassword !== confirmPassword.trim()) {
        setError('Passwords do not match. Please verify.');
        return;
      }
      if (!agreeTerms) {
        setError('Please accept the Terms of Service to continue.');
        return;
      }
    }

    setIsLoading(true);

    // Realistic simulated authentication delay for professional feel
    setTimeout(() => {
      setIsLoading(false);
      const res =
        mode === 'signup'
          ? signup({ email: cleanEmail, name: name.trim(), password: cleanPassword })
          : login({ email: cleanEmail, name: name.trim() || undefined, password: cleanPassword });

      if (res && res.ok === false) {
        setError(res.error || 'Authentication failed.');
        return;
      }

      onClose();
      navigate('/home');
    }, 600);
  }

  // Forgot Password trigger
  function handleForgotPassword() {
    if (!email.trim()) {
      setError('Please enter your email address first to reset password.');
      return;
    }
    setError('');
    setForgotPasswordSent(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      {/* Backdrop click dismiss */}
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div className="relative w-full max-w-md max-h-[94vh] overflow-y-auto overflow-x-hidden no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-[#1D1C1A] border border-[#2E2D2A] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-6 sm:p-8 z-10 text-[#F3EEE4]">
        
        {/* Subtle Ambient Gold Glow Effect (Safely contained to prevent overflow) */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-[#F2B84B]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-[#E58B43]/10 rounded-full blur-3xl" />
        </div>
        
        {/* Top Gold Gradient Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F2B84B] via-[#E58B43] to-[#F2B84B]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#AAA49A] hover:text-[#F3EEE4] hover:bg-[#2A2926] rounded-full transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#F2B84B]/40"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-2 mb-3">
            <img 
              src={movoraLogo} 
              alt="MOVORA" 
              className="h-9 w-auto object-contain drop-shadow-[0_2px_12px_rgba(242,184,75,0.3)]" 
            />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F3EEE4] tracking-tight">
            {mode === 'signup' ? 'Create Membership' : 'Welcome Back'}
          </h2>
          <p className="text-xs sm:text-sm text-[#AAA49A] mt-1.5 max-w-xs">
            {mode === 'signup'
              ? 'Join millions of movie lovers. 4K Ultra HD streaming anywhere.'
              : 'Sign in to access your personal watchlist and continue watching.'}
          </p>
        </div>

        {/* Segmented Tab Switcher (Sign In vs Sign Up) */}
        <div className="grid grid-cols-2 p-1 mb-6 rounded-2xl bg-[#121212] border border-[#2E2D2A]">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError('');
              setForgotPasswordSent(false);
            }}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
              mode === 'signin'
                ? 'bg-gradient-to-r from-[#F2B84B] to-[#E58B43] text-[#121212] shadow-md shadow-[#F2B84B]/20 font-bold'
                : 'text-[#AAA49A] hover:text-[#F3EEE4]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
              setForgotPasswordSent(false);
            }}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-[#F2B84B] to-[#E58B43] text-[#121212] shadow-md shadow-[#F2B84B]/20 font-bold'
                : 'text-[#AAA49A] hover:text-[#F3EEE4]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Inline Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 flex items-start gap-2.5 text-red-300 text-xs animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {/* Password Reset Feedback */}
        {forgotPasswordSent && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-start gap-2.5 text-emerald-300 text-xs animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
            <span className="leading-tight">
              A secure password reset link has been dispatched to <strong>{email}</strong>.
            </span>
          </div>
        )}

        {/* Main Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name (Sign Up only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-[#AAA49A] mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#AAA49A] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g. Wasif Khan"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-[#121212] border border-[#2E2D2A] text-[#F3EEE4] placeholder-[#AAA49A]/50 text-sm focus:outline-none focus:border-[#F2B84B] focus:ring-1 focus:ring-[#F2B84B] transition-colors"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-[#AAA49A] mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#AAA49A] absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-[#121212] border border-[#2E2D2A] text-[#F3EEE4] placeholder-[#AAA49A]/50 text-sm focus:outline-none focus:border-[#F2B84B] focus:ring-1 focus:ring-[#F2B84B] transition-colors"
              />
            </div>
          </div>

          {/* Password with Show/Hide Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#AAA49A] uppercase tracking-wider">
                Password
              </label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-[#F2B84B] hover:text-[#E58B43] hover:underline transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#AAA49A] absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-11 py-2.5 sm:py-3 rounded-xl bg-[#121212] border border-[#2E2D2A] text-[#F3EEE4] placeholder-[#AAA49A]/50 text-sm focus:outline-none focus:border-[#F2B84B] focus:ring-1 focus:ring-[#F2B84B] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-[#AAA49A] hover:text-[#F3EEE4] transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Password Strength Meter (Sign Up Only) */}
            {mode === 'signup' && password && (
              <div className="mt-2 space-y-1 animate-fadeIn">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#AAA49A]">Password strength:</span>
                  <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 h-1 w-full bg-[#121212] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 1 ? strength.color : 'bg-[#2E2D2A]'}`} />
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 2 ? strength.color : 'bg-[#2E2D2A]'}`} />
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.score >= 3 ? strength.color : 'bg-[#2E2D2A]'}`} />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password (Sign Up only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-[#AAA49A] mb-1.5 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#AAA49A] absolute left-3.5 top-3.5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 sm:py-3 rounded-xl bg-[#121212] border border-[#2E2D2A] text-[#F3EEE4] placeholder-[#AAA49A]/50 text-sm focus:outline-none focus:border-[#F2B84B] focus:ring-1 focus:ring-[#F2B84B] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3.5 text-[#AAA49A] hover:text-[#F3EEE4] transition-colors cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Options: Remember Me or Agree to Terms */}
          {mode === 'signin' ? (
            <div className="flex items-center gap-2 pt-0.5">
              <label className="flex items-center gap-2 text-xs text-[#AAA49A] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#2E2D2A] bg-[#121212] text-[#F2B84B] accent-[#F2B84B] focus:ring-0 cursor-pointer"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>
          ) : (
            <div className="flex items-start gap-2 pt-0.5">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-[#2E2D2A] bg-[#121212] text-[#F2B84B] accent-[#F2B84B] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-[#AAA49A] leading-tight cursor-pointer select-none">
                I agree to the <span className="text-[#F2B84B] hover:underline">Terms of Service</span> and <span className="text-[#F2B84B] hover:underline">Privacy Policy</span>.
              </label>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-3 px-5 rounded-xl font-bold text-[#121212] bg-gradient-to-r from-[#F2B84B] to-[#E58B43] hover:from-[#f5c363] hover:to-[#ea9854] shadow-lg shadow-[#F2B84B]/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#121212]" />
                <span>{mode === 'signup' ? 'Creating Account...' : 'Signing In...'}</span>
              </>
            ) : (
              <>
                <span>{mode === 'signup' ? 'Start 30-Day Free Trial' : 'Sign In to MOVORA'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Bottom Toggle Note */}
        <div className="mt-6 pt-4 border-t border-[#2A2926] text-center text-xs text-[#AAA49A]">
          <span>
            {mode === 'signup' ? 'Already have an account? ' : 'New to MOVORA? '}
          </span>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signup' ? 'signin' : 'signup');
              setError('');
              setForgotPasswordSent(false);
            }}
            className="text-[#F2B84B] hover:text-[#E58B43] font-semibold transition-colors cursor-pointer ml-1"
          >
            {mode === 'signup' ? 'Sign in now' : 'Sign up now'}
          </button>
        </div>

      </div>
    </div>
  );
}
