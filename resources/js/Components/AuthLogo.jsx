import { themeConfig } from '@/config/themeConfig';

export default function AuthLogo({ title, subtitle }) {
    return (
        <div className="text-center mb-8 fade-in">
            {/* Logo */}
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${themeConfig.colors.logoGradientFrom} ${themeConfig.colors.logoGradientTo} flex items-center justify-center shadow-lg`}>
                {themeConfig.logo.type === 'image' && themeConfig.logo.imagePath ? (
                    <img 
                        src={themeConfig.logo.imagePath} 
                        alt={themeConfig.logo.alt}
                        className="w-10 h-10 object-contain"
                    />
                ) : (
                    themeConfig.logo.svgIcon
                )}
            </div>

            {/* Title */}
            <h1 className={`text-3xl font-bold ${themeConfig.colors.primaryText} mb-2`}>
                {title}
            </h1>

            {/* Subtitle */}
            <p className={themeConfig.colors.secondaryText}>
                {subtitle}
            </p>
        </div>
    );
}