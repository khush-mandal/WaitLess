import { useState } from 'react';

export const LoginView = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      onLogin();
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-5">
      <div className="glass-card w-full max-w-sm rounded-[2rem] p-8 border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] animate-slide-up relative overflow-hidden">
        
        {/* Decorative background elements inside the card */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#B2DFDB]/40 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#ffb5a1]/30 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#004d40] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#004d40]/20">
              <span className="material-symbols-outlined text-3xl">hourglass_bottom</span>
            </div>
            <h1 className="font-extrabold text-2xl text-[#191c1b] tracking-tight">Welcome Back</h1>
            <p className="text-sm text-[#3f4945] font-medium mt-1">Log in to WaitLess</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="glass-panel-inner rounded-2xl flex items-center px-4 py-3.5 gap-3 transition-all focus-within:border-[#00342b] focus-within:bg-white/80 focus-within:shadow-md hover:bg-white/50 border border-white/40">
                <span className="material-symbols-outlined text-[#707975] text-[20px]">mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="bg-transparent border-none outline-none w-full text-sm text-[#191c1b] placeholder-[#707975] font-medium focus:ring-0 p-0"
                  required
                />
              </div>
            </div>

            <div>
              <div className="glass-panel-inner rounded-2xl flex items-center px-4 py-3.5 gap-3 transition-all focus-within:border-[#00342b] focus-within:bg-white/80 focus-within:shadow-md hover:bg-white/50 border border-white/40">
                <span className="material-symbols-outlined text-[#707975] text-[20px]">lock</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="bg-transparent border-none outline-none w-full text-sm text-[#191c1b] placeholder-[#707975] font-medium focus:ring-0 p-0"
                  required
                />
              </div>
              <div className="text-right mt-2">
                <button type="button" className="text-xs font-bold text-[#00342b] hover:underline">
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#004d40] text-white hover:bg-[#00342b] font-bold text-sm py-3.5 rounded-2xl transition-all shadow-lg shadow-[#004d40]/20 flex items-center justify-center gap-2 active:scale-[0.98] mt-6"
            >
              Sign In
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs font-medium text-[#707975]">
            Don't have an account?{' '}
            <button type="button" className="font-bold text-[#00342b] hover:underline">
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
