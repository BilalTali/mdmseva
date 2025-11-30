// Icon-only logo for favicon and small spaces
export default function LogoIcon({ className = '', size = 48 }) {
    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="MDM SEVA Icon"
        >
            {/* Bowl */}
            <path
                d="M 12 28 Q 12 42, 24 50 Q 32 54, 40 50 Q 52 42, 52 28 L 52 24 L 12 24 Z"
                fill="#FF6B35"
                stroke="#00B4A6"
                strokeWidth="2.5"
            />

            {/* Rice grains */}
            <ellipse cx="22" cy="32" rx="4" ry="6" fill="#FFF8E7" opacity="0.95" />
            <ellipse cx="32" cy="30" rx="4" ry="6" fill="#FFF8E7" opacity="0.95" />
            <ellipse cx="42" cy="32" rx="4" ry="6" fill="#FFF8E7" opacity="0.95" />
            <ellipse cx="27" cy="36" rx="3.5" ry="5" fill="#FFF8E7" opacity="0.9" />
            <ellipse cx="37" cy="36" rx="3.5" ry="5" fill="#FFF8E7" opacity="0.9" />
            <ellipse cx="32" cy="40" rx="3" ry="4.5" fill="#FFF8E7" opacity="0.85" />

            {/* Book element */}
            <rect
                x="42"
                y="12"
                width="14"
                height="11"
                rx="1.5"
                fill="#1E3A5F"
                opacity="0.95"
            />
            <line x1="49" y1="12" x2="49" y2="23" stroke="#FFF8E7" strokeWidth="1" />
            <line x1="44" y1="16" x2="54" y2="16" stroke="#FFF8E7" strokeWidth="0.8" />
            <line x1="44" y1="20" x2="54" y2="20" stroke="#FFF8E7" strokeWidth="0.8" />

            {/* Accent curves */}
            <path
                d="M 14 24 Q 32 18, 50 24"
                stroke="#00B4A6"
                strokeWidth="2"
                fill="none"
                opacity="0.8"
            />
            <path
                d="M 16 28 Q 32 24, 48 28"
                stroke="#00B4A6"
                strokeWidth="1.5"
                fill="none"
                opacity="0.6"
            />
        </svg>
    );
}
