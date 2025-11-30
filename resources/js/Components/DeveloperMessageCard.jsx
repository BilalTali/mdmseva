import React from 'react';
import { User, Briefcase, Star } from 'lucide-react';

export default function TeamMemberCard({ name, designation, role, message, image_path }) {
    return (
        <div className="flex-shrink-0 w-full md:w-[24rem] min-h-[18rem] bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-amber-100 flex flex-col md:flex-row items-stretch">
            {/* Left Side - Image & Gradient */}
            <div className="w-full md:w-40 h-52 md:h-auto flex-shrink-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 relative flex items-center justify-center">
                <div className="relative z-10">
                    {image_path ? (
                        <img
                            src={image_path}
                            alt={name}
                            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-xl"
                        />
                    ) : (
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/20 border-4 border-white shadow-xl flex items-center justify-center backdrop-blur-sm">
                            <User className="w-16 h-16 md:w-20 md:h-20 text-white" />
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side - Content */}
            <div className="flex-1 p-6 flex flex-col justify-center text-left bg-white">
                {/* Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-1">{name}</h3>

                {/* Designation */}
                <div className="flex items-center gap-2 text-amber-700 mb-3">
                    <Briefcase className="w-4 h-4" />
                    <p className="text-sm font-semibold">{designation}</p>
                </div>

                {/* Role Badge */}
                {role && (
                    <div className="mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 rounded-full text-xs font-medium border border-amber-100 shadow-sm">
                            <Star className="w-3 h-3 text-amber-600" />
                            {role}
                        </span>
                    </div>
                )}

                {/* Message */}
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                    {message}
                </p>

                {/* Decorative dots */}
                <div className="mt-4 flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                </div>
            </div>
        </div>
    );
}
