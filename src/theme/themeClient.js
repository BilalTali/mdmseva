/**
 * themeClient.js
 * 
 * Runtime utility for accessing CSS custom properties and theme colors.
 * Used by chart libraries and components that need inline color values.
 */

/**
 * Read a CSS custom property value from the document root
 * @param {string} varName - CSS variable name (with or without --)
 * @returns {string} The computed value of the CSS variable
 */
export function getCssVar(varName) {
  const cleanName = varName.startsWith('--') ? varName : `--${varName}`;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(cleanName)
    .trim();
  return value;
}

/**
 * Get all theme-aware colors as an object
 * @returns {object} Object containing all color tokens
 */
export function getThemeColors() {
  return {
    // Background colors
    bgPrimary: getCssVar('--bg-primary'),
    bgSecondary: getCssVar('--bg-secondary'),
    bgTertiary: getCssVar('--bg-tertiary'),
    
    // Text colors
    textPrimary: getCssVar('--text-primary'),
    textSecondary: getCssVar('--text-secondary'),
    textTertiary: getCssVar('--text-tertiary'),
    textMuted: getCssVar('--text-muted'),
    
    // Brand colors
    primary: getCssVar('--primary-500'),
    primaryHover: getCssVar('--primary-600'),
    accentPrimary: getCssVar('--accent-primary'),
    accentSecondary: getCssVar('--accent-secondary'),
    
    // Semantic colors
    success: getCssVar('--color-success') || getCssVar('--success-500'),
    danger: getCssVar('--color-danger') || getCssVar('--error-500'),
    warning: getCssVar('--color-warning') || getCssVar('--warning-500'),
    info: getCssVar('--color-info') || getCssVar('--info-500'),
    
    // Border and surface
    border: getCssVar('--border-light'),
    surface: getCssVar('--bg-primary'),
  };
}

/**
 * Get chart-specific color palette (6 colors for data visualization)
 * @returns {string[]} Array of 6 hex color values
 */
export function getChartColors() {
  // Try to get chart-specific tokens first
  const chart1 = getCssVar('--chart-1');
  const chart2 = getCssVar('--chart-2');
  const chart3 = getCssVar('--chart-3');
  const chart4 = getCssVar('--chart-4');
  const chart5 = getCssVar('--chart-5');
  const chart6 = getCssVar('--chart-6');
  
  // If chart tokens exist and are not HSL format, use them
  if (chart1 && !chart1.includes('%')) {
    return [chart1, chart2, chart3, chart4, chart5, chart6].filter(Boolean);
  }
  
  // Fallback to semantic color palette
  const colors = getThemeColors();
  return [
    colors.accentPrimary || '#7C5CFF',
    colors.accentSecondary || '#06B6D4',
    colors.success || '#10B981',
    colors.warning || '#F59E0B',
    colors.danger || '#EF4444',
    colors.textMuted || '#64748B',
  ];
}

/**
 * Get chart colors as Recharts-compatible format
 * @returns {string[]} Array of color values
 */
export function getRechartsColors() {
  return getChartColors();
}

/**
 * Subscribe to theme changes
 * @param {function} callback - Function to call when theme changes
 * @returns {function} Unsubscribe function
 */
export function subscribeToThemeChange(callback) {
  // Create a MutationObserver to watch for class or data-theme changes on html element
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === 'attributes' &&
        (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme')
      ) {
        const currentTheme = document.documentElement.classList.contains('dark')
          ? 'dark'
          : document.documentElement.getAttribute('data-theme') || 'light';
        callback(currentTheme);
      }
    });
  });

  // Start observing the html element
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme'],
  });

  // Return unsubscribe function
  return () => observer.disconnect();
}

/**
 * Get current theme name
 * @returns {'light' | 'dark'} Current theme
 */
export function getCurrentTheme() {
  if (document.documentElement.classList.contains('dark')) {
    return 'dark';
  }
  const dataTheme = document.documentElement.getAttribute('data-theme');
  return dataTheme || 'light';
}

/**
 * Utility to convert HSL string to hex (for shadcn/ui HSL variables)
 * @param {string} hslString - HSL string like "220 70% 50%"
 * @returns {string} Hex color like "#3b82f6"
 */
export function hslToHex(hslString) {
  if (!hslString) return '';
  
  // Parse HSL string format "220 70% 50%"
  const parts = hslString.trim().split(/\s+/);
  if (parts.length !== 3) return '';
  
  const h = parseFloat(parts[0]);
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }
  
  const toHex = (n) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Get chart colors in hex format (converting HSL if needed)
 * @returns {string[]} Array of hex color values
 */
export function getChartColorsHex() {
  const colors = getChartColors();
  return colors.map(color => {
    // If it's HSL format like "220 70% 50%", convert it
    if (color && !color.startsWith('#') && !color.startsWith('rgb')) {
      return hslToHex(color);
    }
    return color;
  });
}
