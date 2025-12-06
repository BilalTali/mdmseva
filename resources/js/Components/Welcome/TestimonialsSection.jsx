// Location: resources/js/Components/Welcome/TestimonialsSection.jsx
import React from 'react';
import { Star, CheckCircle } from 'lucide-react';

const TestimonialsSection = ({ testimonials, loadingTestimonials, testimonialsError }) => {
  const scrollContainerRef = React.useRef(null);

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
                className="min-w-full md:min-w-[calc(50%-12px)] lg:min-w-[calc(33.333%-16px)] flex-shrink-0"
              >
                <div className="bg-white rounded-2xl p-8 border border-amber-100 shadow-sm h-full animate-pulse">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-amber-100 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-amber-100 rounded w-32"></div>
                      <div className="h-3 bg-amber-50 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-amber-50 rounded w-full"></div>
                    <div className="h-3 bg-amber-50 rounded w-5/6"></div>
                    <div className="h-3 bg-amber-50 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Testimonial Cards
            testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="min-w-full md:min-w-[calc(50%-12px)] lg:min-w-[calc(33.333%-16px)] flex-shrink-0 snap-center"
              >
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-amber-100 hover:shadow-md transition-shadow h-full flex flex-col relative group/card">
                  {/* Quote Icon Background */}
                  <div className="absolute top-6 right-6 text-amber-100 opacity-50">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" />
                    </svg>
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

                  <p className="text-stone-700 mb-6 italic leading-relaxed flex-grow">
                    "{testimonial.message}"
                  </p>

                  <div className="flex items-center mt-auto pt-6 border-t border-amber-50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white font-bold text-sm shadow-sm mr-3">
                      {testimonial.avatar || testimonial.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">{testimonial.name}</h4>
                      <p className="text-xs text-amber-700 font-medium">{testimonial.role || 'Educator'}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-stone-500">
                        <span>{testimonial.district || 'District'}</span>
                        <span>•</span>
                        <span>{testimonial.zone || 'Zone'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
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
      </div>
    </section>
  );
};

export default TestimonialsSection;