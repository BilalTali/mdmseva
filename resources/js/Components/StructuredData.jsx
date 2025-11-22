import { Head } from '@inertiajs/react';

/**
 * StructuredData Component
 * 
 * Generates Schema.org JSON-LD structured data for SEO
 * Supports Organization, WebSite, and BreadcrumbList schemas
 */
export default function StructuredData({ type = 'organization', data = {} }) {
    const getStructuredData = () => {
        switch (type) {
            case 'organization':
                return {
                    "@context": "https://schema.org",
                    "@type": "GovernmentOrganization",
                    "name": data.name || "MDM SEVA Portal",
                    "description": data.description || "Mid Day Meal Management System for efficient tracking and reporting of school meal programs",
                    "url": data.url || window.location.origin,
                    "logo": data.logo || `${window.location.origin}/images/logo.png`,
                    "contactPoint": {
                        "@type": "ContactPoint",
                        "contactType": "Customer Service",
                        "email": data.email || "support@mdmseva.gov.in"
                    },
                    "areaServed": {
                        "@type": "AdministrativeArea",
                        "name": "Jammu and Kashmir, Ladakh"
                    }
                };
            
            case 'website':
                return {
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    "name": data.name || "MDM SEVA Portal",
                    "url": data.url || window.location.origin,
                    "description": data.description || "Mid Day Meal Management System",
                    "potentialAction": {
                        "@type": "SearchAction",
                        "target": {
                            "@type": "EntryPoint",
                            "urlTemplate": `${window.location.origin}/search?q={search_term_string}`
                        },
                        "query-input": "required name=search_term_string"
                    }
                };
            
            case 'breadcrumb':
                return {
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": (data.items || []).map((item, index) => ({
                        "@type": "ListItem",
                        "position": index + 1,
                        "name": item.name,
                        "item": item.url
                    }))
                };
            
            default:
                return null;
        }
    };

    const structuredData = getStructuredData();

    if (!structuredData) {
        return null;
    }

    return (
        <Head>
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Head>
    );
}

/**
 * Usage Examples:
 * 
 * // Organization schema (use on homepage)
 * <StructuredData type="organization" />
 * 
 * // Website schema with search
 * <StructuredData type="website" />
 * 
 * // Breadcrumb schema
 * <StructuredData 
 *   type="breadcrumb" 
 *   data={{
 *     items: [
 *       { name: 'Home', url: '/' },
 *       { name: 'Dashboard', url: '/dashboard' },
 *       { name: 'Reports', url: '/reports' }
 *     ]
 *   }} 
 * />
 */
