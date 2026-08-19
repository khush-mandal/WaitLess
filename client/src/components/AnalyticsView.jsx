import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const AnalyticsView = () => {
  const { token, user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/analytics/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setAnalyticsData(data.data[0]);
        } else {
          setError(data.message || 'No business analytics available.');
        }
      } catch (err) {
        setError('Error reaching analytics server.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  if (loading) {
    return (
      <div className="p-8 text-center text-[#707975] flex items-center justify-center gap-2">
        <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
        <span>Loading Business Analytics...</span>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="glass-card rounded-3xl p-8 border border-white/60 text-center">
          <span className="material-symbols-outlined text-4xl text-[#F44336] mb-2">lock</span>
          <h2 className="text-xl font-bold text-[#191c1b]">Business Dashboard Restricted</h2>
          <p className="text-sm text-[#3f4945] mt-1">{error || 'Only verified Business Owners or Admins can access venue analytics.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-5 space-y-6 pb-24 animate-fadeIn">
      <div className="glass-card rounded-[2rem] p-6 border border-white/60 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#004d40]/10 text-[#004d40] text-xs font-bold mb-2">
            <span className="material-symbols-outlined text-sm">storefront</span>
            Verified Business Portal
          </div>
          <h1 className="text-2xl font-extrabold text-[#191c1b] tracking-tight">{analyticsData.placeName}</h1>
          <p className="text-xs text-[#3f4945] mt-0.5">Live Traffic Insights & Customer Crowd Metrics</p>
        </div>
        <div className="flex items-center gap-2 bg-white/60 p-2 rounded-2xl border border-white/70">
          <span className="material-symbols-outlined text-[#004d40]">verified_user</span>
          <span className="text-xs font-bold text-[#191c1b]">{user?.email}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/60">
          <div className="text-xs font-bold text-[#707975] uppercase tracking-wider mb-1">Visitors Today</div>
          <div className="text-2xl font-extrabold text-[#004d40]">{analyticsData.totalVisitorsToday}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">↑ 14% vs yesterday</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/60">
          <div className="text-xs font-bold text-[#707975] uppercase tracking-wider mb-1">Peak Wait Time</div>
          <div className="text-2xl font-extrabold text-[#d97706]">{analyticsData.peakWaitTime} min</div>
          <div className="text-[11px] text-[#3f4945] font-semibold mt-1">Between 5:00 - 7:00 PM</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/60">
          <div className="text-xs font-bold text-[#707975] uppercase tracking-wider mb-1">Avg Customer Rating</div>
          <div className="text-2xl font-extrabold text-[#191c1b] flex items-center gap-1">
            {analyticsData.averageRating}
            <span className="material-symbols-outlined text-amber-500 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          </div>
          <div className="text-[11px] text-[#3f4945] font-semibold mt-1">Based on 148 reports</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/60">
          <div className="text-xs font-bold text-[#707975] uppercase tracking-wider mb-1">Satisfaction Score</div>
          <div className="text-2xl font-extrabold text-[#004d40]">{analyticsData.customerSatisfactionPercent}%</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">Top 5% in category</div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-3xl border border-white/60">
        <h3 className="font-extrabold text-base text-[#191c1b] mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#004d40]">bar_chart</span>
          Hourly Busyness & Queue Trends
        </h3>
        <div className="flex items-end justify-between gap-2 h-40 pt-6">
          {analyticsData.hourlyTrends?.map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div className="text-[10px] font-bold text-[#00342b]">{item.busyness}%</div>
              <div
                className="w-full rounded-t-xl bg-gradient-to-t from-[#00342b] to-[#00695c] transition-all hover:opacity-80 shadow-sm"
                style={{ height: `${item.busyness}%` }}
              ></div>
              <div className="text-[11px] font-semibold text-[#707975]">{item.hour}:00</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
