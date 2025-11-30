// Location: resources/js/Pages/Welcome.jsx
import React, { useState, useEffect } from 'react';
import Navigation from '@/Components/Welcome/Navigation';
import HeroSection from '@/Components/Welcome/HeroSection';
import TeamCarousel from '@/Components/Welcome/TeamCarousel';
import StatsSection from '@/Components/Welcome/StatsSection';
import FeaturesSection from '@/Components/Welcome/FeaturesSection';
import TestimonialsSection from '@/Components/Welcome/TestimonialsSection';
import ContactSection from '@/Components/Welcome/ContactSection';
import Footer from '@/Components/Footer';
import SupportChatWidget from '@/Components/SupportChatWidget';

// Fallback testimonials
const fallbackTestimonials = [
  {
    id: 'fallback-ps',
    name: 'Priya Sharma',
    role: 'MDM Coordinator, ABC Primary School',
    udise_code: '01010101011',
    phone: '8899055335',
    state: 'Jammu & Kashmir',
    district: 'Srinagar',
    zone: 'Zone I',
    message: 'This system has revolutionized how we manage our mid-day meal program. The automated calculations save us hours every week!',
    rating: 5,
    avatar: 'PS',
    admin_response: 'Thank you for trusting MDM SEVA! We are here to keep your operations running smoothly.',
    responded_by: { name: 'MDM Support Team' },
    responded_at: '2025-01-12T10:00:00+05:30'
  },
  {
    id: 'fallback-rk',
    name: 'Rajesh Kumar',
    role: 'Principal, XYZ Middle School',
    udise_code: '02020202022',
    phone: '7711889922',
    state: 'Punjab',
    district: 'Amritsar',
    zone: 'Central Block',
    message: 'Finally, a solution that maintains historical accuracy while allowing configuration changes. Perfect for government audits.',
    rating: 5,
    avatar: 'RK',
    admin_response: 'We are glad historical audit trails are helping your inspections. More compliance tools are on the way!',
    responded_by: { name: 'Audit Response Desk' },
    responded_at: '2025-01-08T15:30:00+05:30'
  },
  {
    id: 'fallback-ad',
    name: 'Anita Desai',
    role: 'School Administrator',
    udise_code: '03030303033',
    phone: '9812345678',
    state: 'Gujarat',
    district: 'Surat',
    zone: 'South Cluster',
    message: 'The bill generation feature with salt subcategories is exactly what we needed for vendor management. Highly recommended!',
    rating: 5,
    avatar: 'AD',
    admin_response: 'Happy to hear the vendor billing tools are working well. Let us know if you need more custom fields.',
    responded_by: { name: 'Vendor Success Lead' },
    responded_at: '2025-01-05T11:45:00+05:30'
  }
];

export default function Welcome() {
  // State Management
  const [stats, setStats] = useState({
    total_schools: 247,
    active_schools: 247,
    total_students: 89000,
    rice_available: 45000,
    reports_generated: 7200,
    active_users_today: 180,
    bills_total: 3400,
    bills_kiryana: 2100,
    bills_fuel: 1300,
    avg_students_per_school: 360,
    last_updated: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [testimonials, setTestimonials] = useState(fallbackTestimonials);
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [testimonialsError, setTestimonialsError] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showChatWidget, setShowChatWidget] = useState(false);

  // Fetch Real-time Statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/public/stats');
        if (!response.ok) {
          throw new Error('Failed to load statistics');
        }

        const json = await response.json();
        const data = json.data || {};

        setStats(prev => ({
          ...prev,
          total_schools: data.totalSchools ?? prev.total_schools,
          active_schools: data.activeSchools ?? prev.active_schools,
          total_students: data.totalStudentsServed ?? prev.total_students,
          rice_available: data.riceAvailable ?? prev.rice_available,
          reports_generated: (data.riceReportsGenerated ?? 0) + (data.amountReportsGenerated ?? 0) || prev.reports_generated,
          active_users_today: data.activeUsers ?? prev.active_users_today,
          bills_total: data.totalBills ?? prev.bills_total,
          bills_kiryana: data.kiryanaaBills ?? prev.bills_kiryana,
          bills_fuel: data.fuelBills ?? prev.bills_fuel,
          avg_students_per_school: data.averageStudentsPerSchool ?? prev.avg_students_per_school,
          last_updated: data.lastUpdated ?? prev.last_updated,
        }));
      } catch (e) {
        console.error('Failed to fetch public stats', e);
        setError('Unable to load live statistics right now. Showing demo data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch Team Members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch('/api/developer-message');
        const data = await response.json();
        if (data.success && data.messages) {
          setTeamMembers(data.messages);
        }
      } catch (error) {
        console.error('Failed to fetch team members:', error);
      } finally {
        setLoadingTeam(false);
      }
    };

    fetchTeamMembers();
  }, []);

  // Fetch Testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setTestimonialsError(null);
        const response = await fetch('/api/feedback/testimonials');
        if (!response.ok) {
          throw new Error('Failed to load testimonials');
        }
        const json = await response.json();
        const data = Array.isArray(json.data) ? json.data : [];
        if (data.length > 0) {
          setTestimonials(data);
        }
      } catch (error) {
        console.error('Testimonials fetch error:', error);
        setTestimonialsError('Unable to load latest feedback. Showing curated highlights.');
        setTestimonials(fallbackTestimonials);
      } finally {
        setLoadingTestimonials(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Handler for Quick Support
  const handleQuickSupport = () => {
    setShowChatWidget(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Hero Section with Navigation */}
      <header className="relative overflow-hidden bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 min-h-screen">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-amber-400 to-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div
            className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-br from-yellow-400 to-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
            style={{ animationDelay: '2s' }}
          ></div>
          <div
            className="absolute -bottom-8 left-1/3 w-96 h-96 bg-gradient-to-br from-orange-300 to-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
            style={{ animationDelay: '4s' }}
          ></div>
        </div>

        {/* Navigation Component */}
        <Navigation
          mobileNavOpen={mobileNavOpen}
          setMobileNavOpen={setMobileNavOpen}
        />

        {/* Hero Content */}
        <HeroSection
          stats={stats}
          loading={loading}
        />

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(254 243 199)" />
          </svg>
        </div>
      </header>

      {/* Team Members Carousel */}
      <TeamCarousel
        teamMembers={teamMembers}
        loadingTeam={loadingTeam}
      />

      {/* Real-time Stats Section */}
      <StatsSection
        stats={stats}
        loading={loading}
        error={error}
      />

      {/* Features Section */}
      <FeaturesSection />

      {/* Testimonials Section */}
      <TestimonialsSection
        testimonials={testimonials}
        loadingTestimonials={loadingTestimonials}
        testimonialsError={testimonialsError}
      />

      {/* Contact Section with Feedback Wizard */}
      <ContactSection
        handleQuickSupport={handleQuickSupport}
      />

      {/* Footer */}
      <Footer />

      {/* Support Chat Widget */}
      {showChatWidget && <SupportChatWidget />}

      {/* Animation Styles */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}