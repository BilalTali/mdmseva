export default function ApplicationLogo({ className = '', variant = 'default' }) {
    // Color variants for different backgrounds
    const colors = {
        default: {
            bowl: '#FF6B35',      // Warm orange
            accent: '#00B4A6',    // Deep teal
            rice: '#FFF8E7',      // Soft cream
            book: '#1E3A5F',      // Navy blue
            text: '#1A1A1A',      // Dark text
        },
        dark: {
            bowl: '#FF8C5A',      // Brighter orange
            accent: '#00D4C4',    // Bright teal
            rice: '#FFFFFF',      // White
            book: '#4A9EFF',      // Light blue
            text: '#FFFFFF',      // White text
        },
        white: {
            bowl: '#FFFFFF',
            accent: '#FFFFFF',
            rice: '#F0F0F0',
            book: '#FFFFFF',
            text: '#FFFFFF',
        }
    };

    const currentColors = colors[variant] || colors.default;

    return (
        <svg
            className={className}
            viewBox="0 0 200 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="MDM SEVA Logo"
        >
            {/* Bowl with Rice */}
            <g id="icon">
                {/* Bowl */}
                <path
                    d="M 20 25 Q 20 35, 30 40 Q 35 42, 40 42 Q 45 42, 50 40 Q 60 35, 60 25 L 60 22 L 20 22 Z"
                    fill={currentColors.bowl}
                    stroke={currentColors.accent}
                    strokeWidth="1.5"
                />

                {/* Rice grains */}
                <ellipse cx="30" cy="28" rx="3" ry="4" fill={currentColors.rice} opacity="0.9" />
                <ellipse cx="40" cy="26" rx="3" ry="4" fill={currentColors.rice} opacity="0.9" />
                <ellipse cx="50" cy="28" rx="3" ry="4" fill={currentColors.rice} opacity="0.9" />
                <ellipse cx="35" cy="30" rx="2.5" ry="3.5" fill={currentColors.rice} opacity="0.8" />
                <ellipse cx="45" cy="30" rx="2.5" ry="3.5" fill={currentColors.rice} opacity="0.8" />

                {/* Book element (integrated) */}
                <rect
                    x="48"
                    y="15"
                    width="10"
                    height="8"
                    rx="1"
                    fill={currentColors.book}
                    opacity="0.9"
                />
                <line x1="53" y1="15" x2="53" y2="23" stroke={currentColors.rice} strokeWidth="0.5" />
                <line x1="50" y1="18" x2="56" y2="18" stroke={currentColors.rice} strokeWidth="0.5" />

                {/* Accent curve */}
                <path
                    d="M 22 22 Q 40 18, 58 22"
                    stroke={currentColors.accent}
                    strokeWidth="1.5"
                    fill="none"
                    opacity="0.7"
                />
            </g>

            {/* Text: MDM SEVA */}
            <g id="text">
                {/* MDM */}
                <text
                    x="75"
                    y="28"
                    fontFamily="Inter, system-ui, sans-serif"
                    fontSize="16"
                    fontWeight="700"
                    fill={currentColors.text}
                    letterSpacing="-0.5"
                >
                    MDM
                </text>

                {/* SEVA */}
                <text
                    x="75"
                    y="44"
                    fontFamily="Inter, system-ui, sans-serif"
                    fontSize="20"
                    fontWeight="800"
                    fill={currentColors.bowl}
                    letterSpacing="0.5"
                >
                    SEVA
                </text>

                {/* Tagline */}
                <text
                    x="140"
                    y="36"
                    fontFamily="Inter, system-ui, sans-serif"
                    fontSize="8"
                    fontWeight="500"
                    fill={currentColors.accent}
                    opacity="0.8"
                >
                    Nourishing Futures
                </text>
            </g>
        </svg>
    );
}