// Location: resources/js/Components/Welcome/StatsSection.jsx
import React from 'react';
import {
  School, Users, Package, FileText, Receipt,
  TrendingUp, BarChart3
} from 'lucide-react';

const StatsSection = ({ stats, loading, error }) => {
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  return (
    <section id="stats" className="py-16 -mt-1 bg-amber-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold mb-4 text-amber-900">
            Real-Time System Statistics
          </h3>
          <p className="text-lg text-stone-700">Live data from schools across India</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-700 border-t-transparent"></div>
            <p className="mt-4 text-stone-700">Loading real-time statistics...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-100 rounded-xl border-2 border-red-400">
            <p className="text-red-800 font-semibold">Unable to load statistics</p>
            <p className="text-sm text-red-700 mt-2">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {/* Total Schools */}
            <div className="bg-gradient-to-br from-amber-700 to-amber-800 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-4">
                <School className="w-10 h-10 opacity-80" />
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-4xl font-bold mb-2">{stats.total_schools?.toLocaleString()}</div>
              <div className="text-amber-100 font-medium">Total Schools</div>
              <div className="mt-3 pt-3 border-t border-amber-600">
                <div className="text-sm">{stats.active_schools?.toLocaleString()} Active</div>
              </div>
            </div>

            {/* Students Served */}
            <div className="bg-gradient-to-br from-orange-700 to-orange-800 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-10 h-10 opacity-80" />
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-4xl font-bold mb-2">{formatNumber(stats.total_students)}</div>
              <div className="text-orange-100 font-medium">Students Served</div>
              <div className="mt-3 pt-3 border-t border-orange-600">
                <div className="text-sm">Cumulative Total</div>
              </div>
            </div>

            {/* Rice Available */}
            <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-4">
                <Package className="w-10 h-10 opacity-80" />
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-4xl font-bold mb-2">{formatNumber(Math.max(0, stats.rice_available || 0))}</div>
              <div className="text-emerald-100 font-medium">KG's Rice</div>
              <div className="mt-3 pt-3 border-t border-emerald-600">
                <div className="text-sm">Rice Available in Schools</div>
              </div>
            </div>

            {/* Reports Generated */}
            <div className="bg-gradient-to-br from-red-700 to-red-800 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-4">
                <FileText className="w-10 h-10 opacity-80" />
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="text-4xl font-bold mb-2">{formatNumber(stats.reports_generated)}</div>
              <div className="text-red-100 font-medium">Reports Generated</div>
              <div className="mt-3 pt-3 border-t border-red-600">
                <div className="text-sm">All Time Total</div>
              </div>
            </div>


          </div>
        )}
      </div>
    </section>
  );
};

export default StatsSection;