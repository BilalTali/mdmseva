export default function AuthLogo({ className = '' }) {
    return (
        <div className={`flex flex-col items-center justify-center gap-6 ${className}`}>
            {/* MDM SEVA Text */}
            <h1 className="text-4xl font-extrabold tracking-tight text-center">
                <span className="text-gray-800 dark:text-gray-200">MDM</span>
                {' '}
                <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">SEVA</span>
            </h1>
        </div>
    );
}