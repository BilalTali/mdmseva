// Location: resources/js/Components/Welcome/TestimonialsSection.jsx
import React from 'react';
import { Star, CheckCircle } from 'lucide-react';

const TestimonialsSection = ({ testimonials, loadingTestimonials, testimonialsError }) => {
  const formatDate = (iso) => {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return null;
    }
  };

  return (
    <section id="testimonials" className="py-16 bg-amber-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-amber-900">
            What Schools Say
          </h2>
          <p className="text-lg text-stone-700">
            Hear from educators who trust our system
          </p>
          {testimonialsError && (
            <p className="text-sm text-amber-800 mt-3">{testimonialsError}</p>
          )}
        </div>

        {loadingTestimonials ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((skeleton) => (
              <div 
                key={skeleton} 
                className="bg-white/70 rounded-xl p-6 border-2 border-dashed border-amber-200 animate-pulse"
              >
                <div className="h-4 bg-amber-100 rounded w-2/3 mb-4"></div>
                <div className="h-3 bg-amber-50 rounded w-full mb-2"></div>
                <div className="h-3 bg-amber-50 rounded w-5/6 mb-2"></div>
                <div className="h-3 bg-amber-50 rounded w-4/6"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.id} 
                className="bg-white/90 backdrop-blur rounded-xl p-6 shadow-lg border-2 border-amber-300 flex flex-col gap-4"
              >
                <div>
                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < (testimonial.rating || 0)
                            ? 'fill-amber-500 text-amber-500'
                            : 'fill-stone-200 text-stone-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm mb-4 italic text-stone-800">
                    "{testimonial.message}"
                  </p>
                </div>

                {testimonial.admin_response && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
                    <p className="font-semibold mb-1 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Admin Reply
                    </p>
                    <p className="text-sm text-amber-900 whitespace-pre-line">
                      {testimonial.admin_response}
                    </p>
                    <div className="text-xs text-amber-700 mt-2 flex flex-wrap gap-2">
                      {testimonial.responded_by?.name && (
                        <span>— {testimonial.responded_by.name}</span>
                      )}
                      {formatDate(testimonial.responded_at) && (
                        <span>• {formatDate(testimonial.responded_at)}</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center mt-auto">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-700 to-orange-800 flex items-center justify-center mr-3">
                    <span className="text-white font-semibold">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-amber-900">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-stone-600">
                      {testimonial.role}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      UDISE: {testimonial.udise_code || '—'}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      {testimonial.district || 'District'} • {testimonial.zone || 'Zone'}
                    </p>
                    {formatDate(testimonial.submitted_at) && (
                      <p className="text-[11px] text-stone-500">
                        Shared on {formatDate(testimonial.submitted_at)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;