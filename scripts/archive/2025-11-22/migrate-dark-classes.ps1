# Batch migration script to replace dark: classes with CSS variables
# This script processes all JSX files in the resources/js directory

$replacements = @(
    # Background colors
    @{Pattern = 'bg-white dark:bg-secondary-800'; Replace = 'bg-[var(--surface-00)]'},
    @{Pattern = 'bg-white dark:bg-secondary-900'; Replace = 'bg-[var(--surface-00)]'},
    @{Pattern = 'bg-secondary-50 dark:bg-secondary-900'; Replace = 'bg-[var(--bg-secondary)]'},
    @{Pattern = 'bg-secondary-50 dark:bg-secondary-800'; Replace = 'bg-[var(--bg-secondary)]'},
    @{Pattern = 'bg-secondary-100 dark:bg-secondary-800'; Replace = 'bg-[var(--surface-10)]'},
    @{Pattern = 'bg-secondary-100 dark:bg-secondary-700'; Replace = 'bg-[var(--surface-10)]'},
    
    # Text colors
    @{Pattern = 'text-secondary-900 dark:text-white'; Replace = 'text-[var(--text-primary)]'},
    @{Pattern = 'text-secondary-900 dark:text-secondary-100'; Replace = 'text-[var(--text-primary)]'},
    @{Pattern = 'text-secondary-800 dark:text-secondary-200'; Replace = 'text-[var(--text-primary)]'},
    @{Pattern = 'text-secondary-700 dark:text-secondary-300'; Replace = 'text-[var(--text-secondary)]'},
    @{Pattern = 'text-secondary-600 dark:text-secondary-400'; Replace = 'text-[var(--text-secondary)]'},
    @{Pattern = 'text-secondary-500 dark:text-secondary-400'; Replace = 'text-[var(--text-tertiary)]'},
    @{Pattern = 'text-secondary-500 dark:text-secondary-500'; Replace = 'text-[var(--text-tertiary)]'},
    @{Pattern = 'text-secondary-400 dark:text-secondary-500'; Replace = 'text-[var(--text-muted)]'},
    @{Pattern = 'text-secondary-400 dark:text-secondary-600'; Replace = 'text-[var(--text-muted)]'},
    @{Pattern = 'text-gray-900 dark:text-gray-100'; Replace = 'text-[var(--text-primary)]'},
    @{Pattern = 'text-gray-800 dark:text-gray-200'; Replace = 'text-[var(--text-primary)]'},
    @{Pattern = 'text-gray-700 dark:text-gray-300'; Replace = 'text-[var(--text-secondary)]'},
    @{Pattern = 'text-gray-600 dark:text-gray-400'; Replace = 'text-[var(--text-secondary)]'},
    
    # Border colors
    @{Pattern = 'border-secondary-200 dark:border-secondary-800'; Replace = 'border-[var(--border-light)]'},
    @{Pattern = 'border-secondary-200 dark:border-secondary-700'; Replace = 'border-[var(--border-light)]'},
    @{Pattern = 'border-secondary-300 dark:border-secondary-700'; Replace = 'border-[var(--border-light)]'},
    @{Pattern = 'border-secondary-100 dark:border-secondary-700'; Replace = 'border-[var(--border-light)]'},
    @{Pattern = 'border-gray-200 dark:border-gray-700'; Replace = 'border-[var(--border-light)]'},
    @{Pattern = 'border-gray-300 dark:border-gray-700'; Replace = 'border-[var(--border-light)]'},
    
    # Hover states
    @{Pattern = 'hover:bg-secondary-50 dark:hover:bg-secondary-800'; Replace = 'hover:bg-[var(--surface-10)]'},
    @{Pattern = 'hover:bg-secondary-100 dark:hover:bg-secondary-700'; Replace = 'hover:bg-[var(--surface-10)]'},
    @{Pattern = 'hover:bg-secondary-100 dark:hover:bg-secondary-800'; Replace = 'hover:bg-[var(--surface-10)]'},
    @{Pattern = 'hover:text-secondary-900 dark:hover:text-white'; Replace = 'hover:text-[var(--text-primary)]'},
    
    # Focus states
    @{Pattern = 'focus:bg-secondary-100 dark:focus:bg-secondary-700'; Replace = 'focus:bg-[var(--surface-10)]'},
    @{Pattern = 'focus:bg-secondary-100 dark:focus:bg-secondary-800'; Replace = 'focus:bg-[var(--surface-10)]'},
    @{Pattern = 'focus:ring-primary-500 dark:focus:ring-primary-400'; Replace = 'focus:ring-[var(--primary-500)]'},
    @{Pattern = 'focus:border-primary-500 dark:focus:border-primary-400'; Replace = 'focus:border-[var(--primary-500)]'},
    
    # Primary colors
    @{Pattern = 'text-primary-600 dark:text-primary-400'; Replace = 'text-[var(--primary-600)]'},
    @{Pattern = 'text-primary-700 dark:text-primary-300'; Replace = 'text-[var(--primary-700)]'},
    @{Pattern = 'bg-primary-50 dark:bg-primary-900/20'; Replace = 'bg-[var(--primary-50)]'},
    @{Pattern = 'bg-primary-100 dark:bg-primary-900/40'; Replace = 'bg-[var(--primary-100)]'},
    @{Pattern = 'border-primary-200 dark:border-primary-800'; Replace = 'border-[var(--primary-200)]'},
    
    # Semantic colors
    @{Pattern = 'text-error-600 dark:text-error-400'; Replace = 'text-[var(--color-danger)]'},
    @{Pattern = 'text-success-600 dark:text-success-400'; Replace = 'text-[var(--color-success)]'},
    @{Pattern = 'text-warning-600 dark:warning-400'; Replace = 'text-[var(--color-warning)]'},
    @{Pattern = 'text-info-600 dark:text-info-400'; Replace = 'text-[var(--color-info)]'},
    
    # Gradients
    @{Pattern = 'from-primary-600 to-primary-700 dark:from-primary-900 dark:to-primary-800'; Replace = 'from-[var(--primary-600)] to-[var(--primary-700)]'},
    @{Pattern = 'from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20'; Replace = 'from-[var(--primary-50)] to-[var(--primary-100)]'}
)

$files = Get-ChildItem -Path "resources\js" -Filter "*.jsx" -Recurse

Write-Host "Found $($files.Count) JSX files to process..."

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $changeCount = 0
    
    foreach ($replacement in $replacements) {
        $pattern = [regex]::Escape($replacement.Pattern)
        if ($content -match $pattern) {
            $content = $content -replace $pattern, $replacement.Replace
            $changeCount++
        }
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "✓ Updated: $($file.FullName) ($changeCount replacements)" -ForegroundColor Green
    }
}

Write-Host "`n✅ Migration complete!" -ForegroundColor Green
