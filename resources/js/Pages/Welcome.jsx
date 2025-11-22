
import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, FileText, Receipt, Package, Activity, Star, ChevronRight, Mail, Phone, MapPin, CheckCircle, Award, BarChart3, Zap, School, Clock, User, MessageSquare, ChevronLeft, Check, Send, AlertCircle, Sparkles } from 'lucide-react';

// Feedback Wizard Component
function FeedbackWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    school: '',
    feedbackType: '',
    priority: 'normal',
    rating: 0,
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [hoveredRating, setHoveredRating] = useState(0);

  const totalSteps = 4;

  const feedbackTypes = [
    { value: 'feature_request', label: 'Feature Request', icon: '✨', color: 'from-amber-600 to-amber-700' },
    { value: 'bug_report', label: 'Bug Report', icon: '🐛', color: 'from-red-700 to-red-800' },
    { value: 'general_feedback', label: 'General Feedback', icon: '💬', color: 'from-emerald-700 to-emerald-800' },
    { value: 'complaint', label: 'Complaint', icon: '⚠️', color: 'from-orange-700 to-orange-800' },
    { value: 'appreciation', label: 'Appreciation', icon: '🎉', color: 'from-purple-700 to-purple-800' },
    { value: 'support', label: 'Support Request', icon: '🆘', color: 'from-teal-700 to-teal-800' }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'bg-emerald-100 text-emerald-800 border-emerald-400' },
    { value: 'normal', label: 'Normal', color: 'bg-amber-100 text-amber-800 border-amber-400' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-400' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800 border-red-400' }
  ];

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone is required';
      } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
        newErrors.phone = 'Invalid phone format';
      }
      if (!formData.school.trim()) newErrors.school = 'School name is required';
    }
    if (step === 2) {
      if (!formData.feedbackType) newErrors.feedbackType = 'Please select a feedback type';
    }
    if (step === 3) {
      if (formData.rating === 0) newErrors.rating = 'Please provide a rating';
    }
    if (step === 4) {
      if (!formData.message.trim()) newErrors.message = 'Message is required';
      if (formData.message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);
    
    setTimeout(() => {
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setCurrentStep(1);
        setFormData({
          name: '',
          email: '',
          phone: '',
          school: '',
          feedbackType: '',
          priority: 'normal',
          rating: 0,
          message: ''
        });
      }, 3000);
      setIsSubmitting(false);
    }, 1500);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const renderProgressBar = () => (
    <div className="flex items-center justify-between mb-8">
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              step < currentStep ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg' :
              step === currentStep ? 'bg-gradient-to-r from-amber-700 to-orange-700 text-white shadow-xl ring-4 ring-amber-200' :
              'bg-stone-200 text-stone-500'
            }`}>
              {step < currentStep ? <Check className="w-5 h-5" /> : step}
            </div>
            <span className={`text-xs mt-2 font-semibold ${step <= currentStep ? 'text-amber-800' : 'text-stone-500'}`}>
              {step === 1 ? 'Info' : step === 2 ? 'Type' : step === 3 ? 'Rating' : 'Message'}
            </span>
          </div>
          {step < 4 && (
            <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
              step < currentStep ? 'bg-gradient-to-r from-amber-600 to-amber-700' : 'bg-stone-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  if (submitSuccess) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 shadow-2xl text-center animate-fade-in border-2 border-amber-300">
        <div className="w-20 h-20 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-3xl font-bold text-amber-900 mb-3">Thank You!</h3>
        <p className="text-stone-700 font-medium mb-2">Your feedback has been submitted successfully.</p>
        <p className="text-sm text-stone-600">We'll review it and get back to you within 24-48 hours.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl p-6 shadow-2xl border-2 border-amber-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-amber-700 to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-amber-900">Feedback Wizard</h3>
          <p className="text-sm text-stone-600">Step {currentStep} of {totalSteps}</p>
        </div>
      </div>

      {renderProgressBar()}

      <div className="min-h-[320px]">
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-bold text-amber-900 mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="John Doe"
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.name ? 'border-red-500 bg-red-50' : 'border-amber-300 bg-white'
                } focus:border-amber-600 focus:ring-2 focus:ring-amber-200 outline-none transition-all`}
              />
              {errors.name && <p className="text-xs text-red-700 mt-1 font-semibold">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-amber-900 mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="john@school.edu"
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-amber-300 bg-white'
                } focus:border-amber-600 focus:ring-2 focus:ring-amber-200 outline-none transition-all`}
              />
              {errors.email && <p className="text-xs text-red-700 mt-1 font-semibold">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-amber-900 mb-2">Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                placeholder="+91 12345 67890"
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.phone ? 'border-red-500 bg-red-50' : 'border-amber-300 bg-white'
                } focus:border-amber-600 focus:ring-2 focus:ring-amber-200 outline-none transition-all`}
              />
              {errors.phone && <p className="text-xs text-red-700 mt-1 font-semibold">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-amber-900 mb-2">School *</label>
              <input
                type="text"
                value={formData.school}
                onChange={(e) => updateFormData('school', e.target.value)}
                placeholder="ABC Primary School"
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.school ? 'border-red-500 bg-red-50' : 'border-amber-300 bg-white'
                } focus:border-amber-600 focus:ring-2 focus:ring-amber-200 outline-none transition-all`}
              />
              {errors.school && <p className="text-xs text-red-700 mt-1 font-semibold">{errors.school}</p>}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-sm font-bold text-amber-900 mb-3">Feedback Type *</label>
              <div className="grid grid-cols-2 gap-3">
                {feedbackTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateFormData('feedbackType', type.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.feedbackType === type.value
                        ? `bg-gradient-to-r ${type.color} text-white border-transparent shadow-lg scale-105`
                        : 'bg-white border-amber-300 hover:border-amber-500 hover:shadow-md'
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className={`text-sm font-bold ${formData.feedbackType === type.value ? 'text-white' : 'text-amber-900'}`}>
                      {type.label}
                    </div>
                  </button>
                ))}
              </div>
              {errors.feedbackType && <p className="text-xs text-red-700 mt-2 font-semibold">{errors.feedbackType}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-amber-900 mb-3">Priority *</label>
              <div className="grid grid-cols-4 gap-2">
                {priorityLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => updateFormData('priority', level.value)}
                    className={`p-3 rounded-xl border-2 font-bold text-xs transition-all ${
                      formData.priority === level.value
                        ? level.color + ' shadow-md'
                        : 'bg-white border-amber-300 text-stone-700 hover:border-amber-500'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in text-center">
            <div>
              <label className="block text-sm font-bold text-amber-900 mb-4">Rate Your Experience *</label>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => updateFormData('rating', star)}
                    className="transform transition-all hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-12 h-12 ${
                        star <= (hoveredRating || formData.rating)
                          ? 'fill-amber-500 text-amber-500'
                          : 'fill-stone-200 text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {formData.rating > 0 && (
                <p className="text-xl font-bold text-amber-800 animate-fade-in">
                  {formData.rating === 5 ? 'Excellent!' : formData.rating === 4 ? 'Great!' : formData.rating === 3 ? 'Good' : formData.rating === 2 ? 'Fair' : 'Poor'}
                </p>
              )}
              {errors.rating && <p className="text-xs text-red-700 mt-2 font-semibold">{errors.rating}</p>}
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-bold text-amber-900 mb-2">Message *</label>
              <textarea
                value={formData.message}
                onChange={(e) => updateFormData('message', e.target.value)}
                placeholder="Tell us more..."
                rows={6}
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.message ? 'border-red-500 bg-red-50' : 'border-amber-300 bg-white'
                } focus:border-amber-600 focus:ring-2 focus:ring-amber-200 outline-none resize-none transition-all`}
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-stone-600">{formData.message.length} characters</span>
                {errors.message && <p className="text-xs text-red-700 font-semibold">{errors.message}</p>}
              </div>
            </div>

            <div className="bg-amber-100 rounded-xl p-4 border-2 border-amber-300">
              <p className="text-xs font-bold text-amber-900 mb-3">Summary:</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-700">Type:</span>
                  <span className="font-bold text-amber-900">{feedbackTypes.find(t => t.value === formData.feedbackType)?.label}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-700">Rating:</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < formData.rating ? 'fill-amber-500 text-amber-500' : 'fill-stone-300 text-stone-400'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-amber-300">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1 transition-all ${
            currentStep === 1
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : 'bg-white text-amber-800 hover:bg-amber-100 border-2 border-amber-300 shadow-md'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-orange-700 text-white font-bold text-sm hover:shadow-xl flex items-center gap-1 transition-all shadow-lg"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1 transition-all shadow-lg ${
              isSubmitting
                ? 'bg-stone-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-700 to-emerald-800 text-white hover:shadow-xl'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit
              </>
            )}
          </button>
        )}
      </div>

      {errors.submit && (
        <div className="mt-3 p-3 bg-red-100 border-2 border-red-400 rounded-xl">
          <p className="text-xs text-red-800 font-semibold">{errors.submit}</p>
        </div>
      )}
    </div>
  );
}

// Design system constants
const gradients = {
  primary: 'bg-gradient-to-r from-amber-700 to-orange-700',
  primaryHover: 'bg-gradient-to-r from-amber-800 to-orange-800',
  badge: 'bg-gradient-to-r from-yellow-500 to-amber-500',
  success: 'bg-gradient-to-r from-emerald-600 to-emerald-700',
  text: {
    primary: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-800 to-orange-800',
    secondary: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-900 to-red-800',
    accent1: 'text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-yellow-700',
  }
};

export default function MDMHomepage() {
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

  // Fetch realtime public stats for the welcome page
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

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showChatWidget, setShowChatWidget] = useState(false);

  const handleQuickSupport = () => {
    setShowChatWidget(true);
  };

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
      icon: <FileText className="w-8 h-8" />,
      title: 'Comprehensive Reporting',
      description: 'Generate monthly rice and amount reports with detailed breakdowns and multiple PDF themes.',
      color: 'from-emerald-700 to-emerald-800'
    },
    {
      icon: <Receipt className="w-8 h-8" />,
      title: 'Vendor Bill Management',
      description: 'Create detailed bills for Kiryana and Fuel vendors with itemized breakdowns and salt subcategories.',
      color: 'from-red-700 to-red-800'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Analytics Dashboard',
      description: 'Visualize trends with interactive charts showing rice balance, spending patterns, and service statistics.',
      color: 'from-pink-700 to-pink-800'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Compliance Ready',
      description: 'Meet government audit requirements with historical accuracy and detailed documentation.',
      color: 'from-indigo-700 to-indigo-800'
    }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'MDM Coordinator, ABC Primary School',
      message: 'This system has revolutionized how we manage our mid-day meal program. The automated calculations save us hours every week!',
      rating: 5,
      avatar: 'PS'
    },
    {
      name: 'Rajesh Kumar',
      role: 'Principal, XYZ Middle School',
      message: 'Finally, a solution that maintains historical accuracy while allowing configuration changes. Perfect for government audits.',
      rating: 5,
      avatar: 'RK'
    },
    {
      name: 'Anita Desai',
      role: 'School Administrator',
      message: 'The bill generation feature with salt subcategories is exactly what we needed for vendor management. Highly recommended!',
      rating: 5,
      avatar: 'AD'
    }
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 min-h-screen">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-amber-400 to-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-br from-yellow-400 to-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-gradient-to-br from-orange-300 to-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10">
          <div className="container mx-auto flex items-center justify-between py-6 px-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-700 to-orange-800 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-800 to-orange-800 text-transparent bg-clip-text">MDM System</h1>
                <p className="text-xs text-stone-700 font-medium">Mid-Day Meal Management</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-stone-800 hover:text-amber-800 font-medium transition-colors">Features</a>
              <a href="#stats" className="text-stone-800 hover:text-amber-800 font-medium transition-colors">Statistics</a>
              <a href="#testimonials" className="text-stone-800 hover:text-amber-800 font-medium transition-colors">Testimonials</a>
              <a href="#contact" className="text-stone-800 hover:text-amber-800 font-medium transition-colors">Contact</a>
              <a href="/login" className="px-4 py-2 rounded-lg bg-white border-2 border-amber-400 text-amber-800 font-semibold hover:border-amber-600 transition-all">
                Login
              </a>
              <a href="/register" className={`px-6 py-2.5 rounded-lg ${gradients.primary} text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all`}>
                Register
              </a>
            </div>

            <button
              className="md:hidden p-2 rounded-lg bg-white/70 backdrop-blur border border-amber-300"
              onClick={() => setMobileNavOpen(v => !v)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>

        {mobileNavOpen && (
          <div className="md:hidden relative z-10 container mx-auto px-6 pb-4 space-y-2">
            <a href="#features" className="block px-4 py-3 bg-white/80 backdrop-blur rounded-lg border border-amber-300 text-stone-800 font-medium">Features</a>
            <a href="#stats" className="block px-4 py-3 bg-white/80 backdrop-blur rounded-lg border border-amber-300 text-stone-800 font-medium">Statistics</a>
            <a href="#testimonials" className="block px-4 py-3 bg-white/80 backdrop-blur rounded-lg border border-amber-300 text-stone-800 font-medium">Testimonials</a>
            <a href="#contact" className="block px-4 py-3 bg-white/80 backdrop-blur rounded-lg border border-amber-300 text-stone-800 font-medium">Contact</a>
            <div className="flex gap-2">
              <a href="/login" className="flex-1 px-4 py-3 rounded-lg bg-white border-2 border-amber-400 text-amber-800 font-semibold text-center">Login</a>
              <a href="/register" className={`flex-1 px-4 py-3 rounded-lg ${gradients.primary} text-white font-semibold text-center`}>Register</a>
            </div>
          </div>
        )}

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className={`inline-flex items-center space-x-2 ${gradients.badge} px-5 py-2.5 rounded-full border-2 border-yellow-400 shadow-md`}>
                <Zap className="w-4 h-4 text-amber-900" />
                <span className="text-sm font-bold text-amber-900">Trusted by {formatNumber(stats.total_schools || 247)}+ Schools Nationwide</span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight">
                <span className={gradients.text.primary}>Smart MDM</span>
                <span className={`block text-3xl md:text-4xl lg:text-5xl ${gradients.text.secondary} mt-2`}>
                  Management
                </span>
                <span className="block text-2xl md:text-3xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-red-800 to-orange-700 mt-4">Made Simple</span>
              </h2>

              <p className="text-base sm:text-lg md:text-xl leading-relaxed max-w-xl font-medium text-stone-800">
                Streamline your Mid-Day Meal program with <span className="text-amber-800 font-bold">automated rice tracking</span>, <span className="text-orange-800 font-bold">real-time consumption monitoring</span>, <span className="text-red-800 font-bold">instant PDF reports</span>, and <span className="text-amber-900 font-bold">comprehensive vendor billing</span>—designed specifically for Indian schools.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/register" className={`px-8 py-4 rounded-xl ${gradients.primary} text-white font-bold text-lg shadow-2xl hover:shadow-lg flex items-center justify-center gap-2 transform hover:scale-105 transition-all`}>
                  <span>Get Started Free</span>
                  <ChevronRight className="w-5 h-5" />
                </a>
                <button className="px-8 py-4 rounded-xl bg-white border-2 border-amber-400 text-amber-900 font-bold text-lg hover:bg-amber-50 hover:border-amber-600 transition-all shadow-lg flex items-center justify-center gap-2">
                  <span>Watch Demo</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                  </svg>
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t-2 border-amber-400">
                <div>
                  <div className={`text-3xl font-bold ${gradients.text.accent1}`}>
                    {loading ? '...' : formatNumber(stats.total_students || 89000)}+
                  </div>
                  <div className="text-sm text-stone-700 font-semibold">Students Served</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-800 to-red-800">
                    {loading ? '...' : formatNumber(Math.max(0, stats.rice_available || 0))}+
                  </div>
                  <div className="text-sm text-stone-700 font-semibold">Rice Balance (KG's)</div>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl p-4 border-2 border-orange-400 shadow-md hover:shadow-lg transition-shadow">
                      <Package className="w-8 h-8 text-orange-800 mb-3" />
                      <div className="text-2xl font-bold text-orange-900">
                        {loading ? '...' : (Math.max(0, stats.rice_available || 0)).toLocaleString()}
                      </div>
                      <div className="text-orange-800 text-xs font-semibold">Rice Balance (KG's)</div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl p-4 border-2 border-emerald-400 shadow-md hover:shadow-lg transition-shadow">
                      <FileText className="w-8 h-8 text-emerald-800 mb-3" />
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
                      <Award className="w-6 h-6 text-emerald-800" />
                      <span className="font-bold text-emerald-900">100% Compliance Ready</span>
                    </div>
                    <p className="text-sm text-emerald-800 font-medium">Automated audit reports & historical tracking</p>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className={`absolute -bottom-6 -left-6 ${gradients.success} rounded-2xl p-4 shadow-xl animate-bounce`}>
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-6 -right-6 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-2xl p-4 shadow-xl animate-bounce" style={{animationDelay: '1s'}}>
                <Star className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(254 243 199)"/>
          </svg>
        </div>
      </header>

      {/* Real-time Stats Section */}
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

              {/* Bills Generated */}
              <div className="bg-gradient-to-br from-rose-700 to-pink-800 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Receipt className="w-10 h-10 opacity-80" />
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-4xl font-bold mb-2">{formatNumber(stats.bills_total)}</div>
                <div className="text-rose-100 font-medium">Bills Generated</div>
                <div className="mt-3 pt-3 border-t border-rose-600 text-xs space-y-1">
                  <div>Kiryana: {formatNumber(stats.bills_kiryana)}</div>
                  <div>Fuel: {formatNumber(stats.bills_fuel)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-amber-900">Powerful Features</h2>
            <p className="text-lg text-stone-700">Everything you need to manage your Mid-Day Meal program efficiently</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-amber-200">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 text-white shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-amber-900">{feature.title}</h3>
                <p className="text-sm text-stone-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-amber-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-amber-900">What Schools Say</h2>
            <p className="text-lg text-stone-700">Hear from educators who trust our system</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg border-2 border-amber-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-sm mb-4 italic text-stone-800">"{testimonial.message}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-700 to-orange-800 flex items-center justify-center mr-3">
                    <span className="text-white font-semibold">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-amber-900">{testimonial.name}</p>
                    <p className="text-xs text-stone-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section - Feedback Wizard */}
      <section id="contact" className="py-16 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-amber-900">Get In Touch</h2>
            <p className="text-lg text-stone-700">Share your feedback through our guided wizard</p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Feedback Wizard */}
            <FeedbackWizard />

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg border-2 border-amber-300">
                <h3 className="text-lg font-semibold mb-4 text-amber-900">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mr-4">
                      <Mail className="w-5 h-5 text-amber-800" />
                    </div>
                    <div>
                      <p className="text-sm text-stone-600">Email</p>
                      <p className="font-medium text-amber-900">talibilal342@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mr-4">
                      <Phone className="w-5 h-5 text-emerald-800" />
                    </div>
                    <div>
                      <p className="text-sm text-stone-600">Phone</p>
                      <p className="font-medium text-amber-900">8899055335</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mr-4">
                      <MapPin className="w-5 h-5 text-orange-800" />
                    </div>
                    <div>
                      <p className="text-sm text-stone-600">Location</p>
                      <p className="font-medium text-amber-900">Education Department, Jammu & Kashmir</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg border-2 border-amber-300">
                <h3 className="text-lg font-semibold mb-3 text-amber-900">Office Hours</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-700">Monday - Friday</span>
                    <span className="font-medium text-amber-900">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-700">Saturday</span>
                    <span className="font-medium text-amber-900">9:00 AM - 1:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-700">Sunday</span>
                    <span className="font-medium text-red-800">Closed</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-700 to-orange-800 rounded-xl p-6 shadow-lg text-white border-2 border-amber-600">
                <h3 className="text-lg font-semibold mb-3">Quick Support</h3>
                <p className="text-sm text-amber-100 mb-4">Need immediate assistance? Our support team is here to help you.</p>
                <button
                  onClick={handleQuickSupport}
                  className="w-full px-4 py-2 rounded-lg bg-white text-amber-800 font-semibold hover:bg-amber-50 transition-all"
                >
                  Start Live Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-amber-800 via-orange-800 to-red-800">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your MDM Program?
          </h2>
          <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of schools across India who are already benefiting from our comprehensive management system.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register" className="px-8 py-4 rounded-xl bg-white text-amber-800 font-bold text-lg shadow-2xl hover:shadow-xl transform hover:scale-105 transition-all">
              Get Started Now
            </a>
            <a href="#features" className="px-8 py-4 rounded-xl bg-transparent border-2 border-white text-white font-bold text-lg hover:bg-white hover:text-amber-800 transition-all">
              Learn More
            </a>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 pt-12 border-t border-white/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">100%</div>
                <div className="text-sm text-amber-100">Secure</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">24/7</div>
                <div className="text-sm text-amber-100">Support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">99.9%</div>
                <div className="text-sm text-amber-100">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">Free</div>
                <div className="text-sm text-amber-100">Updates</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gradient-to-br from-amber-900 via-amber-950 to-amber-900">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-700 to-orange-800 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">MDM System</h3>
                  <p className="text-xs text-gray-400">Mid-Day Meal Management</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Empowering schools across India with smart, efficient meal management solutions.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-amber-400 transition-colors">Features</a></li>
                <li><a href="#stats" className="text-gray-400 hover:text-amber-400 transition-colors">Statistics</a></li>
                <li><a href="#testimonials" className="text-gray-400 hover:text-amber-400 transition-colors">Testimonials</a></li>
                <li><a href="/register" className="text-gray-400 hover:text-amber-400 transition-colors">Register</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="/user-guide#documentation" className="text-gray-400 hover:text-amber-400 transition-colors">Documentation</a></li>
                <li><a href="/user-guide" className="text-gray-400 hover:text-amber-400 transition-colors">User Guide</a></li>
                <li><a href="#" className="text-gray-400 hover:text-amber-400 transition-colors">Video Tutorials</a></li>
                <li><a href="/user-guide#faqs" className="text-gray-400 hover:text-amber-400 transition-colors">FAQs</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/cookie-policy" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-amber-700/70">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-400 mb-4 md:mb-0">
                &copy; 2025 MDM SEVA Portal. All rights reserved. | Designed for Indian Schools | Designed by Staff Of BMS PWC in year 2025
              </p>
              <div className="flex items-center gap-6">
                {/* Simple social icons */}
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.633 7.997c.013.176.013.353.013.53 0 5.383-4.096 11.59-11.59 11.59-2.3 0-4.437-.676-6.235-1.84.321.038.63.05.964.05a8.18 8.18 0 0 0 5.074-1.747 4.093 4.093 0 0 1-3.82-2.84c.25.037.5.062.763.062.366 0 .732-.05 1.073-.138a4.084 4.084 0 0 1-3.277-4.012v-.05c.54.3 1.16.48 1.82.5a4.078 4.078 0 0 1-1.82-3.406c0-.75.202-1.435.556-2.033a11.61 11.61 0 0 0 8.422 4.272 4.61 4.61 0 0 1-.101-.935 4.084 4.084 0 0 1 7.067-2.794 8.06 8.06 0 0 0 2.59-.99 4.08 4.08 0 0 1-1.796 2.252 8.17 8.17 0 0 0 2.35-.64 8.78 8.78 0 0 1-2.043 2.12z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.04c-5.522 0-10 4.477-10 10 0 4.991 3.657 9.128 8.438 9.878v-6.988H7.898v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.772-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.988C18.343 21.168 22 17.03 22 12.04c0-5.523-4.478-10-10-10z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.75 2h8.5A5.76 5.76 0 0 1 22 7.75v8.5A5.76 5.76 0 0 1 16.25 22h-8.5A5.76 5.76 0 0 1 2 16.25v-8.5A5.76 5.76 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2A3 3 0 1 0 12 17a3 3 0 0 0 0-6zm5.25-.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {showChatWidget && <SupportChatWidget />}

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