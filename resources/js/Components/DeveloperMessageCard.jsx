import React from 'react';
import { User, Briefcase, Star } from 'lucide-react';

export default function TeamMemberCard({ name, designation, role, message, image_path }) {
    return (
        <div className="flex-shrink-0 w-full max-w-6xl min-h-[24rem] bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-amber-100 flex flex-col lg:flex-row items-stretch mx-auto">
            {/* Left Side - Image & Gradient */}
            <div className="w-full lg:w-80 h-64 lg:h-auto flex-shrink-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 relative flex items-center justify-center p-6">
                <div className="relative z-10 transform transition-transform duration-500 hover:scale-105">
                    {image_path ? (
                        <img
                            src={image_path}
                            alt={name}
                            className="w-40 h-40 lg:w-56 lg:h-56 rounded-full object-cover border-4 border-white shadow-2xl"
                        />
                    ) : (
                        <div className="w-40 h-40 lg:w-56 lg:h-56 rounded-full bg-white/20 border-4 border-white shadow-2xl flex items-center justify-center backdrop-blur-sm">
                            <User className="w-20 h-20 lg:w-28 lg:h-28 text-white" />
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side - Content */}
            <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center text-left bg-white">
                {/* Name */}
                <h3 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-2">{name}</h3>

                {/* Designation */}
                <div className="flex items-center gap-2 text-amber-700 mb-4">
                    <Briefcase className="w-5 h-5 lg:w-6 lg:h-6" />
                    <p className="text-lg lg:text-xl font-semibold">{designation}</p>
                </div>

                {/* Role Badge */}
                {role && (
                    <div className="mb-6">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 rounded-full text-sm font-medium border border-amber-100 shadow-sm">
                            <Star className="w-4 h-4 text-amber-600" />
                            {role}
                        </span>
                    </div>
                )}

                {/* Message */}
                <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
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
