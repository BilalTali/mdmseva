// Location: resources/js/Components/Welcome/TeamCarousel.jsx
import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X, Quote, Star, Briefcase } from 'lucide-react';
import DeveloperMessageCard from '@/Components/DeveloperMessageCard';

const CARD_GAP = 24;

const TeamCarousel = ({ teamMembers, loadingTeam }) => {
  const scrollContainerRef = useRef(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const firstCard = container.querySelector('[data-team-card]');
    const cardWidth = firstCard?.offsetWidth || container.offsetWidth;
    const scrollAmount = cardWidth + CARD_GAP;

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (loadingTeam) {
    return null;
  }

  if (!teamMembers || teamMembers.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 overflow-hidden">
      <div className="w-full px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-amber-800 to-orange-800">
            Message from Developer
          </h2>
          <p className="text-gray-600 text-lg">The vision and dedication behind MDM SEVA</p>
        </div>

        {/* Horizontal Scrolling Container */}
        <div className="relative group -mx-4 sm:mx-0 px-4">

          {/* Left Scroll Button */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg border border-amber-100 text-amber-700 hover:bg-amber-600 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 hidden md:flex items-center justify-center transform hover:scale-110"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide px-2"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {teamMembers.map((member) => (
              <div
                key={member.id}
                data-team-card
                className="snap-center shrink-0 w-full flex justify-center px-4"
              >
                <DeveloperMessageCard
                  name={member.name}
                  designation={member.designation}
                  role={member.role}
                  message={member.message}
                  image_path={member.image_path ? `/storage/${member.image_path}` : null}
                  onReadMore={() => setSelectedMember(member)}
                />
              </div>
            ))}
          </div>

          {/* Right Scroll Button */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg border border-amber-100 text-amber-700 hover:bg-amber-600 hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 hidden md:flex items-center justify-center transform hover:scale-110"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Scroll hint on sides */}
          <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-amber-50/90 to-transparent pointer-events-none md:hidden"></div>
        </div>

        {/* Mobile Controls & Hint */}
        <div className="mt-6 flex flex-col gap-4">
          <div className="flex items-center justify-center gap-4 md:hidden">
            <button
              onClick={() => scroll('left')}
              className="p-3 rounded-full bg-white shadow-md border border-amber-200 text-amber-700"
              aria-label="Previous team member"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-3 rounded-full bg-white shadow-md border border-amber-200 text-amber-700"
              aria-label="Next team member"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <ChevronLeft className="w-4 h-4" />
            Swipe or use the arrows to explore the team
            <ChevronRight className="w-4 h-4" />
          </p>
        </div>

        {/* Read More Modal */}
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedMember(null)}>
            <div
              className="bg-white rounded-2xl w-full max-w-3xl relative shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative h-32 bg-gradient-to-r from-amber-700 to-orange-800 shrink-0">
                <div className="absolute inset-0 opacity-20">
                  <Quote className="w-full h-full text-white rotate-12 scale-150 translate-x-10 -translate-y-10" />
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-4 right-4 p-2 bg-black/20 text-white hover:bg-black/30 rounded-full transition-colors z-10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="px-8 pb-8 -mt-16 flex flex-col overflow-y-auto">
                <div className="flex flex-col md:flex-row gap-6 mb-6 shrink-0">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-stone-100 shrink-0 mx-auto md:mx-0 overflow-hidden relative">
                    {selectedMember.image_path ? (
                      <img
                        src={`/storage/${selectedMember.image_path}`}
                        alt={selectedMember.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400">
                        <span className="text-4xl font-bold">{selectedMember.name?.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-16 md:pt-16 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-stone-900">{selectedMember.name}</h3>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-amber-700 font-medium mt-1">
                      <Briefcase className="w-4 h-4" />
                      {selectedMember.designation}
                    </div>
                    {selectedMember.role && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold mt-2">
                        <Star className="w-3 h-3 fill-amber-600" />
                        {selectedMember.role}
                      </div>
                    )}
                  </div>
                </div>

                <div className="prose prose-amber max-w-none">
                  <h4 className="flex items-center gap-2 text-lg font-bold text-stone-800 border-b border-amber-100 pb-2 mb-4">
                    <Quote className="w-5 h-5 text-amber-600" />
                    Developer Message
                  </h4>
                  <p className="text-stone-700 text-lg leading-relaxed whitespace-pre-line italic font-serif">
                    "{selectedMember.message}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @media (min-width: 768px) {
          .flex {
            scroll-snap-type: x mandatory;
          }
        }
      `}</style>
    </section>
  );
};

export default TeamCarousel;