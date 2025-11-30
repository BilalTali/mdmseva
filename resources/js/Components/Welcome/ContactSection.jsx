// Location: resources/js/Components/Welcome/ContactSection.jsx
import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import FeedbackWizard from './FeedbackWizard';

const ContactSection = ({ handleQuickSupport }) => {
  return (
    <section id="contact" className="py-16 bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-amber-900">
            Get In Touch
          </h2>
          <p className="text-lg text-stone-700">
            Share your feedback through our guided wizard
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Feedback Wizard */}
          <FeedbackWizard />

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg border-2 border-amber-300">
              <h3 className="text-lg font-semibold mb-4 text-amber-900">
                Contact Information
              </h3>
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
                    <p className="font-medium text-amber-900">
                      Education Department, Jammu & Kashmir
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg border-2 border-amber-300">
              <h3 className="text-lg font-semibold mb-3 text-amber-900">
                Office Hours
              </h3>
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
              <p className="text-sm text-amber-100 mb-4">
                Need immediate assistance? Our support team is here to help you.
              </p>
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
  );
};

export default ContactSection;