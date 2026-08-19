import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const LoginView = ({ onLogin }) => {
  const { login, signup, forgotPassword, resetPassword, authError, setAuthError } = useAuth();

  const [mode, setMode] = useState(() => {
    return window.location.pathname === '/signup' ? 'signup' : 'signin';
  }); // 'signin', 'signup', 'forgot', 'reset'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // 'customer', 'business_owner', 'admin'
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setSuccessMessage('');
    const success = await login(email, password);
    setIsLoading(false);

    if (success && onLogin) {
      onLogin();
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setIsLoading(true);
    setSuccessMessage('');
    const success = await signup(name, email, password, role);
    setIsLoading(false);

    if (success) {
      setSuccessMessage('Account created successfully! Welcome to WaitLess.');
      setTimeout(() => {
        if (onLogin) onLogin();
      }, 1000);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setSuccessMessage('');
    const res = await forgotPassword(email);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage(res.message);
      if (res.resetToken) {
        setResetToken(res.resetToken);
        setMode('reset');
      }
    } else {
      setAuthError(res.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetToken || !newPassword) return;

    setIsLoading(true);
    setSuccessMessage('');
    const res = await resetPassword(resetToken, newPassword);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        setMode('signin');
        setSuccessMessage('');
      }, 2000);
    } else {
      setAuthError(res.message);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-5 my-auto">
      <div className="glass-card w-full max-w-md rounded-[2.5rem] p-8 border border-white/60 shadow-[0_12px_40px_rgba(0,0,0,0.12)] animate-slide-up relative overflow-hidden">
        
        {/* Decorative ambient background glows */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#B2DFDB]/50 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-[#ffb5a1]/40 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          
          {/* Top Logo & Title Header */}
          <div className="text-center mb-6">
            <img src="/logo.svg" alt="WaitLess Logo" className="w-20 h-20 mx-auto mb-3 shadow-lg shadow-[#004d40]/20 rounded-[1.25rem] object-cover" />
            <h1 className="font-extrabold text-2xl text-[#191c1b] tracking-tight">
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'signup' && 'Create Your Account'}
              {mode === 'forgot' && 'Reset Password'}
              {mode === 'reset' && 'Set New Password'}
            </h1>
            <p className="text-xs text-[#3f4945] font-medium mt-1">
              {mode === 'signin' && 'Sign in to access your personalized crowd dashboard'}
              {mode === 'signup' && 'Join WaitLess to dodge crowd surges & earn rewards'}
              {mode === 'forgot' && 'Enter your email address to receive a password reset link'}
              {mode === 'reset' && 'Choose a strong new password for your account'}
            </p>
          </div>

          {/* Feedback Alerts */}
          {authError && (
            <div className="mb-4 p-3 rounded-2xl bg-[#ffdad6] border border-[#ffb4ab] text-[#410002] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{authError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-[#ccebe1] border border-[#7ed8be] text-[#00201a] text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* ----------------- MODE 1: SIGN IN FORM ----------------- */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3f4945] mb-1 pl-1">Email Address</label>
                <div className="glass-panel-inner rounded-2xl flex items-center px-4 py-3 gap-3 transition-all focus-within:border-[#00342b] focus-within:bg-white/90 focus-within:shadow-md hover:bg-white/60 border border-white/50">
                  <span className="material-symbols-outlined text-[#707975] text-[20px]">mail</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="bg-transparent border-none outline-none w-full text-sm text-[#191c1b] placeholder-[#707975] font-medium p-0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3f4945] mb-1 pl-1">Password</label>
                <div className="glass-panel-inner rounded-2xl flex items-center px-4 py-3 gap-3 transition-all focus-within:border-[#00342b] focus-within:bg-white/90 focus-within:shadow-md hover:bg-white/60 border border-white/50">
                  <span className="material-symbols-outlined text-[#707975] text-[20px]">lock</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-transparent border-none outline-none w-full text-sm text-[#191c1b] placeholder-[#707975] font-medium p-0"
                    required
                  />
                </div>
                <div className="text-right mt-2">
                  <button
                    type="button"
                    onClick={() => { setAuthError(null); setSuccessMessage(''); setMode('forgot'); }}
                    className="text-xs font-bold text-[#004d40] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#004d40] text-white hover:bg-[#00342b] font-bold text-sm py-3.5 rounded-2xl transition-all shadow-lg shadow-[#004d40]/25 flex items-center justify-center gap-2 active:scale-[0.98] mt-6 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                ) : (
                  <>
                    Sign In
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>

              <div className="mt-6 text-center text-xs font-medium text-[#707975]">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthError(null); setSuccessMessage(''); setMode('signup'); }}
                  className="font-bold text-[#004d40] hover:underline"
                >
                  Create one now
                </button>
              </div>
            </form>
          )}

          {/* ----------------- MODE 2: SIGN UP FORM ----------------- */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#3f4945] mb-1 pl-1">Full Name</label>
                <div className="glass-panel-inner rounded-2xl flex items-center px-4 py-2.5 gap-3 transition-all focus-within:border-[#00342b] focus-within:bg-white/90 focus-within:shadow-md hover:bg-white/60 border border-white/50">
                  <span className="material-symbols-outlined text-[#707975] text-[20px]">person</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="bg-transparent border-none outline-none w-full text-sm text-[#191c1b] placeholder-[#707975] font-medium p-0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3f4945] mb-1 pl-1">Email Address</label>
                <div className="glass-panel-inner rounded-2xl flex items-center px-4 py-2.5 gap-3 transition-all focus-within:border-[#00342b] focus-within:bg-white/90 focus-within:shadow-md hover:bg-white/60 border border-white/50">
                  <span className="material-symbols-outlined text-[#707975] text-[20px]">mail</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="bg-transparent border-none outline-none w-full text-sm text-[#191c1b] placeholder-[#707975] font-medium p-0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3f4945] mb-1 pl-1">Password</label>
                <div className="glass-panel-inner rounded-2xl flex items-center px-4 py-2.5 gap-3 transition-all focus-within:border-[#00342b] focus-within:bg-white/90 focus-within:shadow-md hover:bg-white/60 border border-white/50">
                  <span className="material-symbols-outlined text-[#707975] text-[20px]">lock</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="bg-transparent border-none outline-none w-full text-sm text-[#191c1b] placeholder-[#707975] font-medium p-0"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3f4945] mb-1 pl-1">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      role === 'customer'
                        ? 'bg-[#004d40] text-white border-[#004d40] shadow-md'
                        : 'bg-white/40 text-[#3f4945] border-white/60 hover:bg-white/70'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">person</span>
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('business_owner')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      role === 'business_owner'
                        ? 'bg-[#004d40] text-white border-[#004d40] shadow-md'
                        : 'bg-white/40 text-[#3f4945] border-white/60 hover:bg-white/70'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">storefront</span>
                    Business Owner
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#004d40] text-white hover:bg-[#00342b] font-bold text-sm py-3.5 rounded-2xl transition-all shadow-lg shadow-[#004d40]/25 flex items-center justify-center gap-2 active:scale-[0.98] mt-5 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                ) : (
                  <>
                    Sign Up Now
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  </>
                )}
              </button>

              <div className="mt-5 text-center text-xs font-medium text-[#707975]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthError(null); setSuccessMessage(''); setMode('signin'); }}
                  className="font-bold text-[#004d40] hover:underline"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}

          {/* ----------------- MODE 3: FORGOT PASSWORD FORM ----------------- */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3f4945] mb-1 pl-1">Registered Email</label>
                <div className="glass-panel-inner rounded-2xl flex items-center px-4 py-3 gap-3 transition-all focus-within:border-[#00342b] focus-within:bg-white/90 focus-within:shadow-md hover:bg-white/60 border border-white/50">
                  <span className="material-symbols-outlined text-[#707975] text-[20px]">mail</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="bg-transparent border-none outline-none w-full text-sm text-[#191c1b] placeholder-[#707975] font-medium p-0"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#004d40] text-white hover:bg-[#00342b] font-bold text-sm py-3.5 rounded-2xl transition-all shadow-lg shadow-[#004d40]/25 flex items-center justify-center gap-2 active:scale-[0.98] mt-6 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                ) : (
                  <>
                    Send Reset Token
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </>
                )}
              </button>

              <div className="mt-6 text-center text-xs font-medium text-[#707975]">
                Remembered your password?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthError(null); setSuccessMessage(''); setMode('signin'); }}
                  className="font-bold text-[#004d40] hover:underline"
                >
                  Back to sign in
                </button>
              </div>
            </form>
          )}

          {/* ----------------- MODE 4: RESET PASSWORD FORM ----------------- */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3f4945] mb-1 pl-1">Reset Token</label>
                <div className="glass-panel-inner rounded-2xl flex items-center px-4 py-3 gap-3 transition-all focus-within:border-[#00342b] focus-within:bg-white/90 focus-within:shadow-md hover:bg-white/60 border border-white/50">
                  <span className="material-symbols-outlined text-[#707975] text-[20px]">key</span>
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Enter reset token"
                    className="bg-transparent border-none outline-none w-full text-sm text-[#191c1b] placeholder-[#707975] font-medium p-0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3f4945] mb-1 pl-1">New Password</label>
                <div className="glass-panel-inner rounded-2xl flex items-center px-4 py-3 gap-3 transition-all focus-within:border-[#00342b] focus-within:bg-white/90 focus-within:shadow-md hover:bg-white/60 border border-white/50">
                  <span className="material-symbols-outlined text-[#707975] text-[20px]">lock_reset</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="bg-transparent border-none outline-none w-full text-sm text-[#191c1b] placeholder-[#707975] font-medium p-0"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#004d40] text-white hover:bg-[#00342b] font-bold text-sm py-3.5 rounded-2xl transition-all shadow-lg shadow-[#004d40]/25 flex items-center justify-center gap-2 active:scale-[0.98] mt-6 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                ) : (
                  <>
                    Confirm Password Reset
                    <span className="material-symbols-outlined text-[18px]">lock_open</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
