import React from 'react';

export const LandingView = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen mesh-bg text-[#191c1b] overflow-x-hidden selection:bg-[#afefdd] selection:text-[#00201a]">
      {/* Navigation Bar */}
      <nav className="fixed w-full z-50 glass-card px-6 py-4 flex justify-between items-center rounded-b-3xl">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="WaitLess Logo" className="w-10 h-10 rounded-xl shadow-md object-cover" />
          <span className="font-extrabold text-2xl tracking-tight text-[#00342b]">WaitLess</span>
        </div>
        <button 
          onClick={onGetStarted}
          className="bg-[#004d40] text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-[#00342b] transition-all shadow-lg active:scale-95"
        >
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 flex flex-col items-center text-center max-w-4xl mx-auto relative animate-slide-up">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#B2DFDB]/40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-20 -right-20 w-72 h-72 bg-[#ffb5a1]/30 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-[#ccebe1] border border-[#7ed8be] text-[#004d40] font-bold text-sm shadow-sm relative z-10 animate-fade-in">
          🚀 Smart Crowd Predictor - No more waiting in lines
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[#00201a] leading-tight mb-6 relative z-10">
          Skip the Line. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004d40] to-[#00897b]">
            Know Before You Go.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-[#3f4945] font-medium max-w-2xl mb-10 relative z-10">
          WaitLess provides live crowd intelligence and real-time wait estimations for your favorite spots. Avoid the surge, save time, and earn rewards for helping the community.
        </p>
        <button 
          onClick={onGetStarted}
          className="relative z-10 bg-[#004d40] text-white px-8 py-4 rounded-2xl font-extrabold text-lg flex items-center gap-3 hover:bg-[#00342b] hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 shadow-lg shadow-[#004d40]/30"
        >
          Get Started for Free
          <span className="material-symbols-outlined font-bold">arrow_forward</span>
        </button>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-slide-up delay-100">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#00201a] mb-4">Everything You Need to Save Time</h2>
          <p className="text-[#3f4945] font-medium text-lg">Powerful features designed to optimize your day and keep you moving.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <div className="glass-card rounded-[2rem] p-8 hover:-translate-y-2 transition-all animate-slide-up delay-100">
            <div className="w-14 h-14 rounded-2xl bg-[#ccebe1] text-[#004d40] flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[28px]">radar</span>
            </div>
            <h3 className="text-xl font-bold text-[#191c1b] mb-3">Live Crowd Intelligence</h3>
            <p className="text-[#3f4945] text-sm leading-relaxed">
              Instantly see how busy a venue is right now, powered by real-time community reports and predictive AI.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card rounded-[2rem] p-8 hover:-translate-y-2 transition-all animate-slide-up delay-200">
            <div className="w-14 h-14 rounded-2xl bg-[#ffdad6] text-[#410002] flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[28px]">schedule</span>
            </div>
            <h3 className="text-xl font-bold text-[#191c1b] mb-3">Wait Time Estimations</h3>
            <p className="text-[#3f4945] text-sm leading-relaxed">
              Get highly accurate wait time predictions in minutes, so you can plan your visit perfectly.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card rounded-[2rem] p-8 hover:-translate-y-2 transition-all animate-slide-up delay-300">
            <div className="w-14 h-14 rounded-2xl bg-[#e3f2fd] text-[#00344d] flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[28px]">emoji_events</span>
            </div>
            <h3 className="text-xl font-bold text-[#191c1b] mb-3">Community Rewards</h3>
            <p className="text-[#3f4945] text-sm leading-relaxed">
              Earn points for reporting crowd levels. Climb the leaderboard and unlock exclusive perks.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="glass-card rounded-[2rem] p-8 hover:-translate-y-2 transition-all animate-slide-up delay-400">
            <div className="w-14 h-14 rounded-2xl bg-[#f0e6ff] text-[#3b0087] flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[28px]">map</span>
            </div>
            <h3 className="text-xl font-bold text-[#191c1b] mb-3">Interactive Maps</h3>
            <p className="text-[#3f4945] text-sm leading-relaxed">
              Browse your city on a dynamic map. Spot busy zones and find quieter alternatives in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Positive Points / Benefits Section */}
      <section className="py-20 px-6 mesh-bg-blue mt-10">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 animate-slide-up">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#00201a] mb-6 leading-tight">
              Why Choose WaitLess?
            </h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="mt-1 w-8 h-8 rounded-full bg-[#004d40] text-white flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#191c1b] mb-1">Reclaim Your Time</h4>
                  <p className="text-[#3f4945] text-sm">Stop wasting hours standing in lines. We help you make smarter decisions on where to go and when.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 w-8 h-8 rounded-full bg-[#004d40] text-white flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#191c1b] mb-1">Make Better Decisions</h4>
                  <p className="text-[#3f4945] text-sm">View historical crowd patterns and predict when your favorite spots will be least crowded.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 w-8 h-8 rounded-full bg-[#004d40] text-white flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#191c1b] mb-1">Crowdsourced Accuracy</h4>
                  <p className="text-[#3f4945] text-sm">Our data is updated by real people in real-time, ensuring the highest level of accuracy.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="lg:w-1/2 animate-slide-up delay-200">
            <div className="glass-card rounded-[3rem] p-12 border-2 border-white/80 shadow-2xl relative overflow-hidden flex justify-center items-center">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#004d40]/10 rounded-full blur-2xl"></div>
              <img src="/logo.svg" alt="WaitLess App Preview" className="w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#00201a] mb-4">Frequently Asked Questions</h2>
          <p className="text-[#3f4945] font-medium text-lg">Got questions? We've got answers.</p>
        </div>

        <div className="space-y-4 animate-slide-up delay-100">
          <FAQItem 
            question="How accurate are the wait times?" 
            answer="Our wait times are highly accurate. We use a combination of real-time community reports, historical data, and AI to estimate wait times down to the minute."
          />
          <FAQItem 
            question="Is the app completely free?" 
            answer="Yes! WaitLess is completely free for all users. You can explore venues, check wait times, and earn rewards without spending a dime."
          />
          <FAQItem 
            question="How do I earn rewards?" 
            answer="You earn points every time you report the crowd level at a venue you visit. Accumulate points to climb the leaderboard and unlock exclusive in-app badges."
          />
          <FAQItem 
            question="What types of places are covered?" 
            answer="We currently cover restaurants, cafes, hospitals, retail stores, and grocery markets. We are constantly expanding our database to include more venues."
          />
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="bg-[#00201a] text-white py-16 px-6 text-center rounded-t-3xl mt-10">
        <h2 className="text-3xl font-extrabold mb-6">Ready to skip the line?</h2>
        <button 
          onClick={onGetStarted}
          className="bg-[#afefdd] text-[#00201a] px-8 py-4 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2 mx-auto hover:bg-white hover:scale-105 transition-all active:scale-95 shadow-xl"
        >
          Create Free Account
          <span className="material-symbols-outlined text-[20px] font-bold">arrow_forward</span>
        </button>
        <p className="text-[#707975] text-sm mt-10">© 2026 WaitLess. All rights reserved.</p>
      </footer>
    </div>
  );
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="glass-card rounded-2xl border border-white/60 overflow-hidden transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex justify-between items-center bg-white/40 hover:bg-white/60 transition-colors"
      >
        <span className="font-bold text-[#191c1b] text-left">{question}</span>
        <span className="material-symbols-outlined text-[#004d40]">
          {isOpen ? 'remove' : 'add'}
        </span>
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-white/20">
          <p className="text-[#3f4945] text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};
