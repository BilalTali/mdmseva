// Location: resources/js/Components/Welcome/TeamCarousel.jsx
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DeveloperMessageCard from '@/Components/DeveloperMessageCard';

const CARD_GAP = 24;

const TeamCarousel = ({ teamMembers, loadingTeam }) => {
  const scrollContainerRef = useRef(null);

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
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-amber-800 to-orange-800">
            Meet Our Team
          </h2>
          <p className="text-gray-600 text-lg">The dedicated people behind MDM SEVA</p>
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
                className="snap-center shrink-0 w-[85vw] max-w-sm md:max-w-none md:w-auto"
              >
                <DeveloperMessageCard
                  name={member.name}
                  designation={member.designation}
                  role={member.role}
                  message={member.message}
                  image_path={member.image_path ? `/storage/${member.image_path}` : null}
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