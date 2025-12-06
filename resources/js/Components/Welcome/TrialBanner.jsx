// Location: resources/js/Components/Welcome/TrialBanner.jsx
import React from 'react';

export default function TrialBanner() {
    return (
        <div className="relative w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 py-3 overflow-hidden shadow-lg border-y-2 border-amber-700">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute w-full h-full bg-repeat" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
            </div>

            {/* Scrolling Text Container */}
            <div className="relative flex items-center">
                {/* Icon */}
                <div className="absolute left-4 z-10 flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                    <svg className="w-5 h-5 text-white mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-white font-bold text-sm uppercase tracking-wider">Trial Mode</span>
                </div>

                {/* Scrolling Text */}
                <div className="ml-48 w-full overflow-hidden relative">
                    <div className="scrolling-text flex whitespace-nowrap">
                        <span className="text-white font-semibold text-lg px-8 flex items-center">
                            🌟 This website is on trial seeking your feedback for updates and final launch 🌟
                        </span>
                        <span className="text-white font-semibold text-lg px-8 flex items-center">
                            📢 We value your input! Share your thoughts and help us improve 📢
                        </span>
                        <span className="text-white font-semibold text-lg px-8 flex items-center">
                            🌟 This website is on trial seeking your feedback for updates and final launch 🌟
                        </span>
                        <span className="text-white font-semibold text-lg px-8 flex items-center">
                            📢 We value your input! Share your thoughts and help us improve 📢
                        </span>
                    </div>
                </div>
            </div>

            {/* Scrolling Animation Styles */}
            <style>{`
                @keyframes scroll {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }

                .scrolling-text {
                    animation: scroll 30s linear infinite;
                    display: inline-flex;
                }

                .scrolling-text:hover {
                    animation-play-state: paused;
                }

                /* Gradient edges for smooth fade effect */
                .scrolling-text::before,
                .scrolling-text::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    width: 100px;
                    height: 100%;
                    z-index: 2;
                }

                .scrolling-text::before {
                    left: 0;
                    background: linear-gradient(to right, rgba(217, 119, 6, 1), transparent);
                }

                .scrolling-text::after {
                    right: 0;
                    background: linear-gradient(to left, rgba(217, 119, 6, 1), transparent);
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .scrolling-text span {
                        font-size: 0.875rem;
                    }
                }
            `}</style>
        </div>
    );
}
