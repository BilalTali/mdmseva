import React, { useState } from 'react';
import { Star, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import axios from 'axios';

const FeedbackForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        school_name: '',
        message: '',
        rating: 0,
        type: 'general'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
    const [submitMessage, setSubmitMessage] = useState('');
    const [errors, setErrors] = useState({});

    const feedbackTypes = [
        { value: 'general', label: 'General Feedback', icon: '💬' },
        { value: 'bug_report', label: 'Bug Report', icon: '🐛' },
        { value: 'feature_request', label: 'Feature Request', icon: '💡' },
        { value: 'support', label: 'Support Request', icon: '🆘' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleRatingClick = (rating) => {
        setFormData(prev => ({
            ...prev,
            rating
        }));
        
        if (errors.rating) {
            setErrors(prev => ({
                ...prev,
                rating: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters long';
        }
        
        if (formData.rating === 0) {
            newErrors.rating = 'Please provide a rating';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        setSubmitStatus(null);
        setSubmitMessage('');
        
        try {
            const response = await axios.post('/api/feedback', formData);
            
            if (response.data.success) {
                setSubmitStatus('success');
                setSubmitMessage(response.data.message);
                
                // Reset form after successful submission
                setTimeout(() => {
                    setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        school_name: '',
                        message: '',
                        rating: 0,
                        type: 'general'
                    });
                    setSubmitStatus(null);
                    setSubmitMessage('');
                }, 3000);
            }
        } catch (error) {
            setSubmitStatus('error');
            
            if (error.response?.status === 422) {
                // Validation errors
                setErrors(error.response.data.errors || {});
                setSubmitMessage('Please fix the errors below and try again.');
            } else if (error.response?.status === 429) {
                // Rate limiting
                setSubmitMessage(error.response.data.error || 'Too many submissions. Please try again later.');
            } else {
                setSubmitMessage(error.response?.data?.error || 'Failed to submit feedback. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Send us your feedback</h3>
                <p className="text-gray-600">We'd love to hear from you. Your feedback helps us improve!</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Your full name"
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                </div>

                {/* Email Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="your.email@example.com"
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                </div>

                {/* Phone Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone (Optional)
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setFormData(prev => ({ ...prev, phone: digits }));
                            if (errors.phone) {
                                setErrors(prev => ({ ...prev, phone: null }));
                            }
                        }}
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 9876543210"
                    />
                </div>

                {/* School Name Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        School Name (Optional)
                    </label>
                    <input
                        type="text"
                        name="school_name"
                        value={formData.school_name}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your school name"
                    />
                </div>

                {/* Feedback Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Feedback Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {feedbackTypes.map((type) => (
                            <button
                                key={type.value}
                                type="button"
                                onClick={() => handleInputChange({ target: { name: 'type', value: type.value } })}
                                className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                                    formData.type === type.value
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <span className="mr-2">{type.icon}</span>
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Rating */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating *
                    </label>
                    <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => handleRatingClick(star)}
                                className={`p-1 rounded transition-colors ${
                                    star <= formData.rating ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                                }`}
                            >
                                <Star className="w-6 h-6 fill-current" />
                            </button>
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                            {formData.rating > 0 && `${formData.rating}/5`}
                        </span>
                    </div>
                    {errors.rating && (
                        <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
                    )}
                </div>

                {/* Message Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message *
                    </label>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={4}
                        className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.message ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Tell us about your experience, suggestions, or any issues you've encountered..."
                    />
                    <div className="flex justify-between items-center mt-1">
                        {errors.message && (
                            <p className="text-red-500 text-sm">{errors.message}</p>
                        )}
                        <p className="text-gray-500 text-sm ml-auto">
                            {formData.message.length}/2000
                        </p>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader className="w-4 h-4 animate-spin" />
                            <span>Sending...</span>
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            <span>Send Feedback</span>
                        </>
                    )}
                </button>

                {/* Status Messages */}
                {submitMessage && (
                    <div className={`rounded-lg p-3 flex items-center space-x-2 ${
                        submitStatus === 'success' 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                        {submitStatus === 'success' ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <AlertCircle className="w-5 h-5" />
                        )}
                        <p className="text-sm">{submitMessage}</p>
                    </div>
                )}
            </form>
        </div>
    );
};

export default FeedbackForm;
