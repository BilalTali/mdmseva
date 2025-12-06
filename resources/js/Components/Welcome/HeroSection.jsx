// Location: resources/js/Components/Welcome/HeroSection.jsx
import React from 'react';
import {
  Zap, Package, ChevronRight, Clock, School,
  Activity, CheckCircle, Star
} from 'lucide-react';

const HeroSection = ({ stats, loading }) => {
  const gradients = {
    primary: 'bg-gradient-to-r from-amber-700 to-orange-700',
    badge: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    success: 'bg-gradient-to-r from-emerald-600 to-emerald-700',
    text: {
      primary: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-800 to-orange-800',
      secondary: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-900 to-red-800',
      accent1: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-yellow-700',
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  return (
    <div className="relative z-10 container mx-auto px-6 py-16">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-8">
          <div className={`inline-flex items-center space-x-2 ${gradients.badge} px-5 py-2.5 rounded-full border-2 border-yellow-400 shadow-md`}>
            <Zap className="w-4 h-4 text-amber-900" />
            <span className="text-sm font-bold text-amber-900">
              Trusted by {formatNumber(stats.total_schools || 247)}+ Schools Nationwide
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight">
            <span className={gradients.text.primary}>Smart MDM</span>
            <span className={`block text-3xl md:text-4xl lg:text-5xl ${gradients.text.secondary} mt-2`}>
              Management
            </span>
            <span className="block text-2xl md:text-3xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-red-800 to-orange-700 mt-4">
              Made Simple
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl leading-relaxed max-w-xl font-medium text-stone-800">
            Streamline your Mid-Day Meal program with{' '}
            <span className="text-amber-800 font-bold">automated rice tracking</span>,{' '}
            <span className="text-orange-800 font-bold">real-time consumption monitoring</span>,{' '}
            <span className="text-red-800 font-bold">instant PDF reports</span>
            —designed specifically for Indian schools.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/register"
              className={`px-8 py-4 rounded-xl ${gradients.primary} text-white font-bold text-lg shadow-2xl hover:shadow-lg flex items-center justify-center gap-2 transform hover:scale-105 transition-all`}
            >
              <span>Get Started Free</span>
              <ChevronRight className="w-5 h-5" />
            </a>
            <button className="px-8 py-4 rounded-xl bg-white border-2 border-amber-400 text-amber-900 font-bold text-lg hover:bg-amber-50 hover:border-amber-600 transition-all shadow-lg flex items-center justify-center gap-2">
              <span>Watch Demo</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t-2 border-amber-400">
            <div>
              <div className={`text-3xl font-bold ${gradients.text.accent1}`}>
                {loading ? '...' : formatNumber(stats.total_students || 89000)}+
              </div>
              <div className="text-sm text-stone-700 font-semibold">Students Served</div>
            </div>

            <div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 to-emerald-900">
                {loading ? '...' : formatNumber(stats.reports_generated || 7200)}+
              </div>
              <div className="text-sm text-stone-700 font-semibold">Reports Generated</div>
            </div>
          </div>
        </div>

        {/* Right Content - Live Dashboard Preview */}
        <div className="relative">
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-amber-400 shadow-2xl">
            <div className={`absolute -top-4 -right-4 ${gradients.success} text-white px-6 py-2 rounded-full font-bold text-sm shadow-xl flex items-center gap-2`}>
              <Clock className="w-4 h-4 animate-pulse" />
              Live Dashboard
            </div>

            <div className="space-y-6">
              {/* Today's Summary */}
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-6 border-2 border-amber-400 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-amber-900 font-bold">Today's Summary</span>
                  <Activity className="w-5 h-5 text-emerald-700" />
                </div>
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-800 to-orange-800 mb-2">
                  {loading ? '...' : stats.total_students?.toLocaleString() || '0'}
                </div>
                <div className="text-amber-900 text-sm font-semibold">Students Fed Today</div>
              </div>

              <div className="grid grid-cols-1 gap-4">


                <div className="bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl p-4 border-2 border-emerald-400 shadow-md hover:shadow-lg transition-shadow">
                  <svg className="w-8 h-8 text-emerald-800 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="text-2xl font-bold text-emerald-900">
                    {loading ? '...' : stats.reports_generated?.toLocaleString() || '0'}
                  </div>
                  <div className="text-emerald-800 text-xs font-semibold">Reports Generated</div>
                </div>
              </div>

              {/* Active Schools Card */}
              <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl p-5 border-2 border-yellow-400 shadow-md">
                <div className="flex items-center space-x-3 mb-3">
                  <School className="w-6 h-6 text-amber-800" />
                  <span className="font-bold text-amber-900">
                    {loading ? '...' : `${stats.active_schools || 0} / ${stats.total_schools || 0}`} Active Schools
                  </span>
                </div>
                <p className="text-sm text-amber-800 font-medium">
                  {loading ? 'Loading...' : `${stats.active_users_today || 0} users active today`}
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl p-5 border-2 border-emerald-400 shadow-md">
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-emerald-800" />
                  <span className="font-bold text-emerald-900">100% Compliance Ready</span>
                </div>
                <p className="text-sm text-emerald-800 font-medium">
                  Automated audit reports & historical tracking
                </p>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className={`absolute -bottom-6 -left-6 ${gradients.success} rounded-2xl p-4 shadow-xl animate-bounce`}>
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <div
            className="absolute -top-6 -right-6 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-2xl p-4 shadow-xl animate-bounce"
            style={{ animationDelay: '1s' }}
          >
            <Star className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;