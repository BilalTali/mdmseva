// Location: resources/js/Components/DeveloperMessageCard.jsx
import React from 'react';
import { User, Briefcase, Star, Quote } from 'lucide-react';

export default function TeamMemberCard({ name, designation, role, message, image_path, onReadMore }) {
    const isLong = message && message.length > 250;

    return (
        <div className="flex-shrink-0 w-full max-w-5xl mx-auto my-8">
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row transition-transform hover:scale-[1.01] duration-500 border border-stone-100 min-h-[500px] md:min-h-[400px]">

                {/* Decorative background pattern */}
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                    <Quote size={300} className="text-amber-900 rotate-180" />
                </div>

                {/* Left Side - Image Profile */}
                <div className="w-full md:w-2/5 relative bg-gradient-to-br from-amber-700 via-orange-600 to-amber-800 p-10 flex flex-col items-center justify-center text-center shrink-0">
                    {/* Abstract shapes */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                        <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
                        <div className="absolute bottom-[-20%] right-[-20%] w-64 h-64 bg-amber-300 rounded-full mix-blend-overlay filter blur-3xl"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="relative inline-block group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 to-orange-300 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-500"></div>
                            {image_path ? (
                                <img
                                    src={image_path}
                                    alt={name}
                                    className="relative w-48 h-48 lg:w-56 lg:h-56 rounded-full object-cover border-[6px] border-white/20 shadow-2xl"
                                />
                            ) : (
                                <div className="relative w-48 h-48 lg:w-56 lg:h-56 rounded-full bg-white/10 border-[6px] border-white/20 shadow-2xl flex items-center justify-center backdrop-blur-md">
                                    <User className="w-24 h-24 text-white/90" />
                                </div>
                            )}

                            {/* Role Badge Floating */}
                            {role && (
                                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white text-amber-700 rounded-full text-sm font-bold shadow-lg border border-amber-50">
                                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                        {role}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 text-white">
                            <h3 className="text-2xl lg:text-3xl font-bold tracking-tight text-white mb-1.5">{name}</h3>
                            <div className="flex items-center justify-center gap-2 text-amber-100/90 font-medium tracking-wide text-sm uppercase">
                                <Briefcase className="w-4 h-4" />
                                {designation}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Message Content */}
                <div className="w-full md:w-3/5 p-8 md:p-12 lg:p-16 flex flex-col relative bg-white/50 backdrop-blur-3xl">
                    <Quote className="w-12 h-12 text-amber-200 mb-6 opacity-80" />

                    <div className="relative z-10 flex-grow mb-4">
                        <p className={`text-lg md:text-xl lg:text-2xl text-stone-700 leading-relaxed font-medium italic font-serif ${isLong ? 'line-clamp-5' : ''}`}>
                            "{message}"
                        </p>
                        {isLong && (
                            <button
                                onClick={onReadMore}
                                className="text-amber-700 hover:text-amber-800 font-bold text-base mt-3 inline-flex items-center gap-1 hover:underline focus:outline-none transition-colors"
                            >
                                Read more message...
                            </button>
                        )}
                    </div>

                    <div className="mt-auto pt-8 border-t border-amber-100 flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-amber-900 font-bold text-lg">MDM SEVA Initiative</span>
                            <span className="text-stone-500 text-sm">Dedicated to efficient school management</span>
                        </div>
                        <div className="ml-auto opacity-50">
                            {/* Signature or Brand mark */}
                            <svg className="h-8 w-auto text-amber-900" viewBox="0 0 100 30" fill="currentColor">
                                <path d="M10,15 Q25,25 40,15 T70,15 T100,15" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
