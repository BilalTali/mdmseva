const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Define all replacements
const replacements = [
    // Backgrounds
    { from: /bg-white dark:bg-secondary-800/g, to: 'bg-[var(--surface-00)]' },
    { from: /bg-white dark:bg-secondary-900/g, to: 'bg-[var(--surface-00)]' },
    { from: /bg-secondary-50 dark:bg-secondary-900/g, to: 'bg-[var(--bg-secondary)]' },
    { from: /bg-secondary-50 dark:bg-secondary-800/g, to: 'bg-[var(--bg-secondary)]' },
    { from: /bg-secondary-100 dark:bg-secondary-800/g, to: 'bg-[var(--surface-10)]' },
    { from: /bg-secondary-100 dark:bg-secondary-700/g, to: 'bg-[var(--surface-10)]' },
    { from: /bg-secondary-200 dark:bg-secondary-700/g, to: 'bg-[var(--surface-10)]' },

    // Text colors  
    { from: /text-secondary-900 dark:text-white/g, to: 'text-[var(--text-primary)]' },
    { from: /text-secondary-900 dark:text-secondary-100/g, to: 'text-[var(--text-primary)]' },
    { from: /text-secondary-800 dark:text-secondary-200/g, to: 'text-[var(--text-primary)]' },
    { from: /text-secondary-700 dark:text-secondary-300/g, to: 'text-[var(--text-secondary)]' },
    { from: /text-secondary-600 dark:text-secondary-400/g, to: 'text-[var(--text-secondary)]' },
    { from: /text-secondary-500 dark:text-secondary-400/g, to: 'text-[var(--text-tertiary)]' },
    { from: /text-secondary-500 dark:text-secondary-500/g, to: 'text-[var(--text-tertiary)]' },
    { from: /text-secondary-400 dark:text-secondary-500/g, to: 'text-[var(--text-muted)]' },
    { from: /text-secondary-400 dark:text-secondary-600/g, to: 'text-[var(--text-muted)]' },
    { from: /text-gray-900 dark:text-gray-100/g, to: 'text-[var(--text-primary)]' },
    { from: /text-gray-800 dark:text-gray-200/g, to: 'text-[var(--text-primary)]' },
    { from: /text-gray-700 dark:text-gray-300/g, to: 'text-[var(--text-secondary)]' },
    { from: /text-gray-600 dark:text-gray-400/g, to: 'text-[var(--text-secondary)]' },

    // Borders
    { from: /border-secondary-200 dark:border-secondary-800/g, to: 'border-[var(--border-light)]' },
    { from: /border-secondary-200 dark:border-secondary-700/g, to: 'border-[var(--border-light)]' },
    { from: /border-secondary-300 dark:border-secondary-700/g, to: 'border-[var(--border-light)]' },
    { from: /border-secondary-100 dark:border-secondary-700/g, to: 'border-[var(--border-light)]' },
    { from: /border-gray-200 dark:border-gray-700/g, to: 'border-[var(--border-light)]' },
    { from: /border-gray-300 dark:border-gray-700/g, to: 'border-[var(--border-light)]' },

    // Hover states
    { from: /hover:bg-secondary-50 dark:hover:bg-secondary-800/g, to: 'hover:bg-[var(--surface-10)]' },
    { from: /hover:bg-secondary-100 dark:hover:bg-secondary-700/g, to: 'hover:bg-[var(--surface-10)]' },
    { from: /hover:bg-secondary-100 dark:hover:bg-secondary-800/g, to: 'hover:bg-[var(--surface-10)]' },
    { from: /hover:text-secondary-900 dark:hover:text-white/g, to: 'hover:text-[var(--text-primary)]' },

    // Focus states
    { from: /focus:bg-secondary-100 dark:focus:bg-secondary-700/g, to: 'focus:bg-[var(--surface-10)]' },
    { from: /focus:bg-secondary-100 dark:focus:bg-secondary-800/g, to: 'focus:bg-[var(--surface-10)]' },
    { from: /focus:ring-primary-500 dark:focus:ring-primary-400/g, to: 'focus:ring-[var(--primary-500)]' },
    { from: /focus:border-primary-500 dark:focus:border-primary-400/g, to: 'focus:border-[var(--primary-500)]' },

    // Primary colors
    { from: /text-primary-600 dark:text-primary-400/g, to: 'text-[var(--primary-600)]' },
    { from: /text-primary-700 dark:text-primary-300/g, to: 'text-[var(--primary-700)]' },
    { from: /bg-primary-50 dark:bg-primary-900\/20/g, to: 'bg-[var(--primary-50)]' },
    { from: /bg-primary-100 dark:bg-primary-900\/40/g, to: 'bg-[var(--primary-100)]' },
    { from: /border-primary-200 dark:border-primary-800/g, to: 'border-[var(--primary-200)]' },

    // Semantic colors
    { from: /text-error-600 dark:text-error-400/g, to: 'text-[var(--color-danger)]' },
    { from: /text-success-600 dark:text-success-400/g, to: 'text-[var(--color-success)]' },
    { from: /text-warning-600 dark:text-warning-400/g, to: 'text-[var(--color-warning)]' },
    { from: /text-info-600 dark:text-info-400/g, to: 'text-[var(--color-info)]' },

    // Gradients
    { from: /from-primary-600 to-primary-700 dark:from-primary-900 dark:to-primary-800/g, to: 'from-[var(--primary-600)] to-[var(--primary-700)]' },
    { from: /from-primary-50 to-primary-100 dark:from-primary-900\/20 dark:to-primary-800\/20/g, to: 'from-[var(--primary-50)] to-[var(--primary-100)]' },
];

// Find all JSX files
const files = glob.sync('resources/js/**/*.jsx');

console.log(`Found ${files.length} JSX files to process...`);

let totalChanges = 0;
let filesChanged = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    let changes = 0;

    replacements.forEach(({ from, to }) => {
        const matches = content.match(from);
        if (matches) {
            content = content.replace(from, to);
            changes += matches.length;
        }
    });

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`✓ ${file} (${changes} replacements)`);
        filesChanged++;
        totalChanges += changes;
    }
});

console.log(`\n✅ Migration complete!`);
console.log(`📊 Changed ${filesChanged} files with ${totalChanges} total replacements`);
