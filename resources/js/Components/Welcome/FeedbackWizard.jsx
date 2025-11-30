// Location: resources/js/Components/Welcome/FeedbackWizard.jsx
import React, { useState } from 'react';
import { Check, CheckCircle, ChevronLeft, ChevronRight, Send, Sparkles, Star } from 'lucide-react';

const FeedbackWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    udise: '',
    email: '',
    phone: '',
    school: '',
    state: '',
    district: '',
    zone: '',
    feedbackType: '',
    priority: 'medium',
    rating: 0,
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [hoveredRating, setHoveredRating] = useState(0);

  const totalSteps = 5;
  const stepLabels = ['Info', 'School', 'Type', 'Rating', 'Message'];

  const feedbackTypes = [
    { value: 'feature_request', label: 'Feature Request', icon: '✨', color: 'from-amber-600 to-amber-700' },
    { value: 'bug_report', label: 'Bug Report', icon: '🐛', color: 'from-red-700 to-red-800' },
    { value: 'general', label: 'General Feedback', icon: '💬', color: 'from-emerald-700 to-emerald-800' },
    { value: 'complaint', label: 'Complaint', icon: '⚠️', color: 'from-orange-700 to-orange-800' },
    { value: 'appreciation', label: 'Appreciation', icon: '🎉', color: 'from-purple-700 to-purple-800' },
    { value: 'support', label: 'Support Request', icon: '🆘', color: 'from-teal-700 to-teal-800' }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'bg-emerald-100 text-emerald-800 border-emerald-400' },
    { value: 'medium', label: 'Normal', color: 'bg-amber-100 text-amber-800 border-amber-400' },
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
    }
    if (step === 2) {
      if (!formData.udise.trim()) {
        newErrors.udise = 'UDISE code is required';
      } else if (!/^\d{11}$/.test(formData.udise.trim())) {
        newErrors.udise = 'UDISE must be 11 digits';
      }
      if (!formData.school.trim()) newErrors.school = 'School name is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.district.trim()) newErrors.district = 'District is required';
      if (!formData.zone.trim()) newErrors.zone = 'Zone is required';
    }
    if (step === 3) {
      if (!formData.feedbackType) newErrors.feedbackType = 'Please select a feedback type';
    }
    if (step === 4) {
      if (formData.rating === 0) newErrors.rating = 'Please provide a rating';
    }
    if (step === 5) {
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
    setErrors(prev => ({ ...prev, submit: null }));

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.replace(/\D+/g, '') || null,
      school_name: formData.school.trim() || null,
      udise_code: formData.udise.trim(),
      state: formData.state.trim(),
      district: formData.district.trim(),
      zone: formData.zone.trim(),
      message: formData.message.trim(),
      rating: formData.rating,
      type: formData.feedbackType || 'general',
      priority: formData.priority,
    };

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || undefined,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 422 && data.errors) {
          setErrors(prev => ({ ...prev, ...data.errors }));
          throw new Error('Please fix the highlighted errors.');
        }
        throw new Error(data.error || 'Failed to submit feedback. Please try again.');
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setCurrentStep(1);
        setFormData({
          name: '',
          udise: '',
          email: '',
          phone: '',
          school: '',
          state: '',
          district: '',
          zone: '',
          feedbackType: '',
          priority: 'medium',
          rating: 0,
          message: ''
        });
      }, 2500);
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: error.message || 'Failed to submit feedback.' }));
    } finally {
      setIsSubmitting(false);
    }
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
      {stepLabels.map((label, index) => {
        const step = index + 1;
        return (
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
                {label}
              </span>
            </div>
            {step < totalSteps && (
              <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                step < currentStep ? 'bg-gradient-to-r from-amber-600 to-amber-700' : 'bg-stone-200'
              }`} />
            )}
          </React.Fragment>
        );
      })}
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
                placeholder="Tali Bilal"
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
                placeholder="talibilal342@gmail.com"
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
                placeholder="+91 9906343434"
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.phone ? 'border-red-500 bg-red-50' : 'border-amber-300 bg-white'
                } focus:border-amber-600 focus:ring-2 focus:ring-amber-200 outline-none transition-all`}
              />
              {errors.phone && <p className="text-xs text-red-700 mt-1 font-semibold">{errors.phone}</p>}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-bold text-amber-900 mb-2">UDISE Code *</label>
              <input
                type="text"
                value={formData.udise}
                onChange={(e) => updateFormData('udise', e.target.value)}
                placeholder="11 digit UDISE"
                maxLength={11}
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.udise ? 'border-red-500 bg-red-50' : 'border-amber-300 bg-white'
                } focus:border-amber-600 focus:ring-2 focus:ring-amber-200 outline-none transition-all`}
              />
              {errors.udise && <p className="text-xs text-red-700 mt-1 font-semibold">{errors.udise}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-amber-900 mb-2">School *</label>
              <input
                type="text"
                value={formData.school}
                onChange={(e) => updateFormData('school', e.target.value)}
                placeholder=" Primary School"
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.school ? 'border-red-500 bg-red-50' : 'border-amber-300 bg-white'
                } focus:border-amber-600 focus:ring-2 focus:ring-amber-200 outline-none transition-all`}
              />
              {errors.school && <p className="text-xs text-red-700 mt-1 font-semibold">{errors.school}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-amber-900 mb-2">State *</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => updateFormData('state', e.target.value)}
                placeholder="Jammu & Kashmir"
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.state ? 'border-red-500 bg-red-50' : 'border-amber-300 bg-white'
                } focus:border-amber-600 focus:ring-2 focus:ring-amber-200 outline-none transition-all`}
              />
              {errors.state && <p className="text-xs text-red-700 mt-1 font-semibold">{errors.state}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-amber-900 mb-2">District *</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => updateFormData('district', e.target.value)}
                placeholder="Srinagar"
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.district ? 'border-red-500 bg-red-50' : 'border-amber-300 bg-white'
                } focus:border-amber-600 focus:ring-2 focus:ring-amber-200 outline-none transition-all`}
              />
              {errors.district && <p className="text-xs text-red-700 mt-1 font-semibold">{errors.district}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-amber-900 mb-2">Zone *</label>
              <input
                type="text"
                value={formData.zone}
                onChange={(e) => updateFormData('zone', e.target.value)}
                placeholder="Zone 1"
                className={`w-full px-4 py-3 rounded-xl border-2 ${
                  errors.zone ? 'border-red-500 bg-red-50' : 'border-amber-300 bg-white'
                } focus:border-amber-600 focus:ring-2 focus:ring-amber-200 outline-none transition-all`}
              />
              {errors.zone && <p className="text-xs text-red-700 mt-1 font-semibold">{errors.zone}</p>}
            </div>
          </div>
        )}

        {currentStep === 3 && (
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
                    <div className={`text-sm font-bold ${
                      formData.feedbackType === type.value ? 'text-white' : 'text-amber-900'
                    }`}>
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

        {currentStep === 4 && (
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

        {currentStep === 5 && (
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
                  <span className="font-bold text-amber-900">
                    {feedbackTypes.find(t => t.value === formData.feedbackType)?.label}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-700">Rating:</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${
                        i < formData.rating ? 'fill-amber-500 text-amber-500' : 'fill-stone-300 text-stone-400'
                      }`} />
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
};

export default FeedbackWizard;