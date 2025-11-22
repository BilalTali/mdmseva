import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { colors, components, spacing, borderRadius, shadows } from '@/lib/design-system';

/**
 * Professional Navigation Components
 * Unified navigation components for consistent navigation across the application
 */

// Main Navigation Container
export const Navigation = ({ 
  children, 
  className = '',
  variant = 'horizontal',
  ...props 
}) => {
  const baseStyles = `
    flex items-center
    ${variant === 'vertical' ? 'flex-col space-y-1' : 'space-x-1'}
    ${className}
  `;

  return (
    <nav className={baseStyles} {...props}>
      {children}
    </nav>
  );
};

// Navigation Item
export const NavigationItem = ({ 
  children, 
  href,
  active = false,
  icon,
  className = '',
  variant = 'default',
  size = 'md',
  ...props 
}) => {
  const sizeStyles = {
    sm: {
      padding: `${spacing[1]} ${spacing[2]}`,
      fontSize: '0.875rem',
      iconSize: 'w-4 h-4',
    },
    md: {
      padding: `${spacing[2]} ${spacing[3]}`,
      fontSize: '0.875rem',
      iconSize: 'w-5 h-5',
    },
    lg: {
      padding: `${spacing[3]} ${spacing[4]}`,
      fontSize: '1rem',
      iconSize: 'w-6 h-6',
    },
  };

  const variantStyles = {
    default: {
      base: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
      active: 'text-blue-600 bg-blue-50',
    },
    pill: {
      base: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
      active: 'text-white bg-blue-600 hover:bg-blue-700',
    },
    underline: {
      base: 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent',
      active: 'text-blue-600 border-blue-600',
    },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  const baseStyles = `
    inline-flex items-center
    font-medium rounded-md
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    ${className}
  `;

  const content = (
    <>
      {icon && (
        <span className={`${currentSize.iconSize} mr-2`}>
          {icon}
        </span>
      )}
      <span style={{ fontSize: currentSize.fontSize }}>
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={baseStyles}
        style={{
          padding: currentSize.padding,
          color: active ? colors.primary[600] : colors.text.secondary,
          backgroundColor: active ? colors.primary[50] : 'transparent',
        }}
        {...props}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={baseStyles}
      style={{
        padding: currentSize.padding,
        color: active ? colors.primary[600] : colors.text.secondary,
        backgroundColor: active ? colors.primary[50] : 'transparent',
      }}
      {...props}
    >
      {content}
    </button>
  );
};

// Sidebar Navigation
export const SidebarNavigation = ({ 
  items = [],
  currentRoute,
  className = '',
  ...props 
}) => {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpanded = (key) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isActive = (route) => {
    return currentRoute === route;
  };

  const hasActiveChild = (item) => {
    if (!item.children) return false;
    return item.children.some(child => 
      isActive(child.route) || (child.children && hasActiveChild(child))
    );
  };

  const renderNavItem = (item, level = 0) => {
    const isItemActive = isActive(item.route);
    const isExpanded = expandedItems[item.key] || hasActiveChild(item);
    const hasChildren = item.children && item.children.length > 0;

    const baseStyles = `
      flex items-center justify-between
      w-full text-left rounded-lg
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-blue-500
      ${level === 0 ? 'px-4 py-3' : 'px-3 py-2 ml-4'}
      ${className}
    `;

    const activeStyles = isItemActive ? {
      backgroundColor: colors.primary[600],
      color: colors.text.inverse,
    } : {
      backgroundColor: 'transparent',
      color: colors.text.secondary,
    };

    const hoverStyles = {
      backgroundColor: isItemActive ? colors.primary[700] : colors.secondary[50],
      color: isItemActive ? colors.text.inverse : colors.secondary[700],
    };

    return (
      <div key={item.key}>
        <button
          className={baseStyles}
          style={activeStyles}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.key);
            } else if (item.route) {
              // Navigate to route
            }
          }}
          onMouseEnter={(e) => {
            Object.assign(e.target.style, hoverStyles);
          }}
          onMouseLeave={(e) => {
            Object.assign(e.target.style, activeStyles);
          }}
        >
          <div className="flex items-center flex-1">
            {item.icon && (
              <span className={`mr-3 ${level === 0 ? 'w-5 h-5' : 'w-4 h-4'}`}>
                {item.icon}
              </span>
            )}
            <span className={`font-medium ${level === 0 ? 'text-sm' : 'text-xs'}`}>
              {item.label}
            </span>
          </div>
          
          {hasChildren && (
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {/* Submenu */}
        {hasChildren && (
          <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
              {item.children.map(child => renderNavItem(child, level + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="space-y-1" {...props}>
      {items.map(item => renderNavItem(item))}
    </nav>
  );
};

// Top Navigation Bar
export const TopNavigation = ({ 
  user,
  logo,
  title = 'MDM SEVA Portal',
  className = '',
  ...props 
}) => {
  const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
  const { auth } = usePage().props;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm" {...props}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Logo and Title */}
          <div className="flex items-center">
            {logo && (
              <Link href="/">
                <span className="block h-9 w-auto fill-current text-gray-800">
                  {logo}
                </span>
              </Link>
            )}
            <span className="ml-4 text-xl font-semibold text-gray-800">
              {title}
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:ml-6">
            <Navigation variant="horizontal">
              <NavigationItem href={route('dashboard')} active={route().current('dashboard')}>
                Dashboard
              </NavigationItem>
              <NavigationItem href={route('daily-consumptions.index')} active={route().current('daily-consumptions.*')}>
                Daily Consumption
              </NavigationItem>
              <NavigationItem href={route('rice-reports.index')} active={route().current('rice-reports.*')}>
                Reports
              </NavigationItem>
            </Navigation>
          </div>

          {/* User Menu */}
          <div className="hidden sm:flex sm:items-center sm:ml-6">
            <div className="relative ml-3">
              <button
                onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition duration-150 ease-in-out"
              >
                <span>{user?.name || auth.user.name}</span>
                <svg className="ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showingNavigationDropdown && (
                <div className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <Link
                      href={route('profile.edit')}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => router.post(route('logout'))}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:bg-gray-100 focus:text-gray-500"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {showingNavigationDropdown && (
        <div className="sm:hidden">
          <div className="space-y-1 pb-3 pt-2">
            <NavigationItem href={route('dashboard')} active={route().current('dashboard')}>
              Dashboard
            </NavigationItem>
            <NavigationItem href={route('daily-consumptions.index')} active={route().current('daily-consumptions.*')}>
              Daily Consumption
            </NavigationItem>
            <NavigationItem href={route('rice-reports.index')} active={route().current('rice-reports.*')}>
              Reports
            </NavigationItem>
          </div>

          <div className="border-t border-gray-200 pb-1 pt-4">
            <div className="px-4">
              <div className="text-base font-medium text-gray-800">
                {user?.name || auth.user.name}
              </div>
              <div className="text-sm font-medium text-gray-500">
                {user?.email || auth.user.email}
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <NavigationItem href={route('profile.edit')}>
                Profile
              </NavigationItem>
              <button
                onClick={() => router.post(route('logout'))}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

