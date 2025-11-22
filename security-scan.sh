#!/bin/bash

# Security Scan Script for Laravel + React Application
# Run this script to perform comprehensive security checks

echo "🔒 Starting Security Audit for MDM SEVA Application"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Check for SQL Injection vulnerabilities
print_status "Scanning for SQL Injection vulnerabilities..."
sql_issues=$(grep -r --exclude-dir=vendor -nE "DB::select.*\$|selectRaw.*\$|whereRaw.*\$|DB::statement.*\$|->raw\(.*\$" app/ || true)
if [ -n "$sql_issues" ]; then
    print_error "Potential SQL Injection vulnerabilities found:"
    echo "$sql_issues"
else
    print_success "No SQL Injection vulnerabilities detected"
fi

# 2. Check for XSS vulnerabilities in Blade templates
print_status "Scanning for XSS vulnerabilities in Blade templates..."
xss_issues=$(find resources/views -name "*.blade.php" -exec grep -l "{!!" {} \; 2>/dev/null || true)
if [ -n "$xss_issues" ]; then
    print_warning "Potential XSS vulnerabilities found in Blade templates:"
    echo "$xss_issues"
else
    print_success "No XSS vulnerabilities detected in Blade templates"
fi

# 3. Check for hardcoded secrets
print_status "Scanning for hardcoded secrets..."
secrets=$(grep -r --exclude-dir=vendor --exclude-dir=node_modules -i -E "(password|secret|key|token).*=.*['\"][^'\"]{8,}" . --exclude="*.log" --exclude="composer.lock" --exclude="package-lock.json" || true)
if [ -n "$secrets" ]; then
    print_warning "Potential hardcoded secrets found (review manually):"
    echo "$secrets" | head -10
else
    print_success "No obvious hardcoded secrets detected"
fi

# 4. Check for debug mode in production
print_status "Checking debug configuration..."
if grep -q "APP_DEBUG=true" .env 2>/dev/null; then
    print_error "DEBUG mode is enabled! This should be disabled in production"
else
    print_success "Debug mode properly configured"
fi

# 5. Run Composer security audit
print_status "Running Composer security audit..."
if command -v composer &> /dev/null; then
    composer audit --format=json > composer-audit.json 2>/dev/null || true
    if [ -s composer-audit.json ]; then
        vulnerabilities=$(jq '.advisories | length' composer-audit.json 2>/dev/null || echo "0")
        if [ "$vulnerabilities" -gt 0 ]; then
            print_error "$vulnerabilities security vulnerabilities found in PHP dependencies"
            print_status "Run 'composer audit' for details"
        else
            print_success "No security vulnerabilities in PHP dependencies"
        fi
    fi
    rm -f composer-audit.json
else
    print_warning "Composer not found, skipping PHP dependency audit"
fi

# 6. Run NPM security audit
print_status "Running NPM security audit..."
if command -v npm &> /dev/null; then
    npm_audit=$(npm audit --json 2>/dev/null || echo '{"vulnerabilities":{}}')
    high_vulns=$(echo "$npm_audit" | jq '.vulnerabilities | to_entries | map(select(.value.severity == "high" or .value.severity == "critical")) | length' 2>/dev/null || echo "0")
    if [ "$high_vulns" -gt 0 ]; then
        print_error "$high_vulns high/critical vulnerabilities found in NPM dependencies"
        print_status "Run 'npm audit' for details"
    else
        print_success "No high/critical vulnerabilities in NPM dependencies"
    fi
else
    print_warning "NPM not found, skipping JavaScript dependency audit"
fi

# 7. Check file permissions
print_status "Checking file permissions..."
if [ -d "storage" ]; then
    storage_perms=$(find storage -type f -perm /o+w 2>/dev/null || true)
    if [ -n "$storage_perms" ]; then
        print_warning "World-writable files found in storage directory"
    else
        print_success "Storage directory permissions look good"
    fi
fi

# 8. Check for .env file exposure
print_status "Checking for .env file exposure..."
if [ -f "public/.env" ]; then
    print_error ".env file found in public directory! This is a critical security issue"
elif [ -f ".env" ] && [ ! -f "public/.htaccess" ]; then
    print_warning ".env file exists but no .htaccess protection found"
else
    print_success ".env file properly protected"
fi

# 9. Check HTTPS configuration
print_status "Checking HTTPS configuration..."
if grep -q "FORCE_HTTPS=true" .env 2>/dev/null; then
    print_success "HTTPS enforcement enabled"
elif grep -q "APP_ENV=production" .env 2>/dev/null; then
    print_warning "Production environment detected but HTTPS not enforced"
else
    print_success "HTTPS configuration appropriate for development"
fi

# 10. Check session configuration
print_status "Checking session security..."
session_issues=0
if ! grep -q "SESSION_SECURE=true" .env 2>/dev/null && grep -q "APP_ENV=production" .env 2>/dev/null; then
    print_warning "SESSION_SECURE should be true in production"
    session_issues=$((session_issues + 1))
fi
if ! grep -q "SESSION_SAME_SITE=strict" .env 2>/dev/null; then
    print_warning "SESSION_SAME_SITE should be set to 'strict' for better security"
    session_issues=$((session_issues + 1))
fi
if [ $session_issues -eq 0 ]; then
    print_success "Session configuration looks secure"
fi

echo ""
echo "🔒 Security Audit Complete"
echo "=========================="
print_status "Review any warnings or errors above"
print_status "Run individual tools for more detailed analysis:"
echo "  - composer audit (PHP dependencies)"
echo "  - npm audit (JavaScript dependencies)"
echo "  - ./vendor/bin/phpstan analyse (Static analysis)"
echo "  - npm run lint (Frontend linting)"
