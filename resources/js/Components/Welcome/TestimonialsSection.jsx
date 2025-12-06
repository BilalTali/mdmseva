import React, { useState, useRef } from 'react';
import { Star, CheckCircle, X, Quote } from 'lucide-react';

const TestimonialsSection = ({ testimonials, loadingTestimonials, testimonialsError }) => {
  const scrollContainerRef = useRef(null);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth; // Scroll one full viewing width
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

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
    <section id="testimonials" className="py-16 bg-amber-50">
      <div className="container mx-auto px-6 relative group">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-amber-900">
            What Schools Say
          </h2>
          <p className="text-lg text-stone-700 max-w-2xl mx-auto">
            Trusted by over 500+ schools across J&K and Ladakh
          </p>
          {testimonialsError && (
            <p className="text-sm text-amber-800 mt-3">{testimonialsError}</p>
          )}
        </div>

        {/* Navigation Buttons */}
        {!loadingTestimonials && testimonials?.length > 0 && (
          <>
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 z-10 bg-white text-amber-900 p-3 rounded-full shadow-lg border border-amber-200 hover:bg-amber-50 hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label="Previous testimonials"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 z-10 bg-white text-amber-900 p-3 rounded-full shadow-lg border border-amber-200 hover:bg-amber-50 hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label="Next testimonials"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Carousel Container */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loadingTestimonials ? (
            // Loading Skeletons
            [1, 2, 3].map((skeleton) => (
              <div
                key={skeleton}
                className="w-full lg:w-[calc(33.333%-16px)] flex-shrink-0"
              >
                <div className="bg-white rounded-2xl p-8 border border-amber-100 shadow-sm h-full animate-pulse flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-amber-100 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-amber-100 rounded w-32"></div>
                      <div className="h-3 bg-amber-50 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="space-y-3 flex-grow">
                    <div className="h-3 bg-amber-50 rounded w-full"></div>
                    <div className="h-3 bg-amber-50 rounded w-5/6"></div>
                    <div className="h-3 bg-amber-50 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Testimonial Cards
            testimonials.map((testimonial) => {
              const isLong = testimonial.message && testimonial.message.length > 150;

              return (
                <div
                  key={testimonial.id}
                  className="w-full lg:w-[calc(33.333%-16px)] flex-shrink-0 snap-center flex"
                >
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-amber-100 hover:shadow-md transition-shadow w-full flex flex-col relative group/card h-full">
                    {/* Quote Icon Background */}
                    <div className="absolute top-6 right-6 text-amber-100 opacity-50">
                      <Quote className="w-10 h-10 fill-current text-amber-100" />
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < (testimonial.rating || 0)
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-stone-200 text-stone-200'
                            }`}
                        />
                      ))}
                    </div>

                  <div className="flex-grow mb-6 relative flex flex-col gap-4">
                    <div>
                      <p className={`text-stone-700 italic leading-relaxed ${isLong ? 'line-clamp-4' : ''}`}>
                        "{testimonial.message}"
                      </p>
                      {isLong && (
                        <button 
                          onClick={() => setSelectedTestimonial(testimonial)}
                          className="text-amber-700 hover:text-amber-800 font-semibold text-sm mt-2 inline-flex items-center gap-1 hover:underline focus:outline-none"
                        >
                          Read more
                        </button>
                      )}
                    </div>

                    {testimonial.admin_response && (
                      <div className="bg-stone-50 p-3 rounded-lg border-l-4 border-amber-500 mt-auto">
                        <p className="text-xs font-bold text-amber-800 mb-1">Admin Response</p>
                        <p className="text-sm text-stone-600 line-clamp-2">
                          {testimonial.admin_response}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center mt-auto pt-6 border-t border-amber-50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white font-bold text-sm shadow-sm mr-3 flex-shrink-0">
                      {testimonial.avatar || testimonial.name?.charAt(0) || 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-stone-900 text-sm truncate">{testimonial.name}</h4>
                      <p className="text-xs text-amber-700 font-medium truncate">{testimonial.role || 'Educator'}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-stone-500 truncate">
                        <span>{testimonial.district || 'District'}</span>
                        <span>•</span>
                        <span>{testimonial.zone || 'Zone'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )})
          )}
        </div>
        
        {/* Mobile Swipe Hint */}
        {!loadingTestimonials && testimonials?.length > 1 && (
          <div className="flex justify-center mt-4 gap-2 md:hidden">
            {[...Array(Math.min(5, Math.ceil(testimonials.length)))].map((_, i) => (
               <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-200"></div>
            ))}
          </div>
        )}

        {/* Read More Modal */}
        {selectedTestimonial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedTestimonial(null)}>
            <div 
              className="bg-white rounded-2xl w-full max-w-2xl relative shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]" 
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-amber-100 flex items-center justify-between bg-amber-50/50">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {selectedTestimonial.avatar || selectedTestimonial.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-stone-900">{selectedTestimonial.name}</h3>
                      <div className="text-sm text-amber-700 font-medium flex items-center gap-2">
                        {selectedTestimonial.role || 'Educator'}
                        <span className="text-stone-300">•</span>
                        <span className="text-stone-500">{selectedTestimonial.district}, {selectedTestimonial.zone}</span>
                      </div>
                    </div>
                 </div>
                 <button 
                  onClick={() => setSelectedTestimonial(null)} 
                  className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
                 >
                   <X className="w-6 h-6" />
                 </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 overflow-y-auto">
                 <Quote className="w-10 h-10 text-amber-200 mb-6 rotate-180" />
                 <p className="text-stone-700 text-lg leading-relaxed whitespace-pre-line italic font-serif">
                   "{selectedTestimonial.message}"
                 </p>
                 
                 {selectedTestimonial.admin_response && (
                    <div className="bg-stone-50 p-6 rounded-xl border-l-4 border-amber-500 mt-8">
                       <h4 className="font-bold text-amber-800 text-sm mb-2 uppercase tracking-wide">Response from Admin</h4>
                       <p className="text-stone-700 leading-relaxed">
                          {selectedTestimonial.admin_response}
                       </p>
                    </div>
                 )}

                 <div className="mt-8 flex items-center gap-2 pt-6 border-t border-stone-100">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < (selectedTestimonial.rating || 0)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-stone-200 text-stone-200'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-stone-500 ml-2">
                      {selectedTestimonial.rating ? `${selectedTestimonial.rating}.0 rating` : 'Testimonial'}
                    </span>
                 </div>

                 {selectedTestimonial.submitted_at && (
                    <p className="text-xs text-stone-400 mt-4">
                      Shared on {formatDate(selectedTestimonial.submitted_at)}
                    </p>
                 )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;