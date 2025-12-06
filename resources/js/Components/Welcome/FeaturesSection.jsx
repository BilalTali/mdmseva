// Location: resources/js/Components/Welcome/FeaturesSection.jsx
import React from 'react';
import { Package, Activity, FileText, Receipt, BarChart3, Award } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Package className="w-8 h-8" />,
      title: 'Rice Inventory Management',
      description: 'Track opening balance, rice lifted, consumed amounts, and closing balance with automatic calculations.',
      color: 'from-amber-700 to-amber-800'
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: 'Daily Consumption Tracking',
      description: 'Record daily meal service with automatic rice and cost calculations based on configured rates.',
      color: 'from-orange-700 to-orange-800'
    },
    {
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
      title: 'AI Chatbot Support',
      description: 'Get instant help with our intelligent chatbot assistant available 24/7 to answer queries and guide you through the system.',
      color: 'from-blue-700 to-indigo-800'
    },

    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Analytics Dashboard',
      description: 'Visualize trends with interactive charts showing rice balance, spending patterns, and service statistics.',
      color: 'from-pink-700 to-pink-800'
    },
    {
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
      title: 'Quick Feedback System',
      description: 'Share your experience with our multi-step feedback wizard and get responses from our support team within 24-48 hours.',
      color: 'from-purple-700 to-pink-800'
    }
  ];

  return (
    <section id="features" className="py-16 bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-amber-900">
            Powerful Features
          </h2>
          <p className="text-lg text-stone-700">
            Everything you need to manage your Mid-Day Meal program efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-amber-200"
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 text-white shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-amber-900">
                {feature.title}
              </h3>
              <p className="text-sm text-stone-700">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;