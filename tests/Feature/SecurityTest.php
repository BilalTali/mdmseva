<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SecurityTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test rate limiting on login endpoint
     */
    public function test_login_rate_limiting(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        // Make 5 login attempts (should succeed)
        for ($i = 0; $i < 5; $i++) {
            $response = $this->post('/login', [
                'email' => 'test@example.com',
                'password' => 'wrongpassword',
            ]);
        }

        // 6th attempt should be rate limited
        $response = $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(429); // Too Many Requests
    }

    /**
     * Test rate limiting on registration endpoint
     */
    public function test_registration_rate_limiting(): void
    {
        // Make 3 registration attempts (should succeed)
        for ($i = 0; $i < 3; $i++) {
            $this->post('/register', [
                'name' => 'Test User',
                'email' => "test{$i}@example.com",
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ]);
        }

        // 4th attempt should be rate limited
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test4@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(429); // Too Many Requests
    }

    /**
     * Test strong password policy
     */
    public function test_strong_password_policy(): void
    {
        // Weak password should fail
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'weak',
            'password_confirmation' => 'weak',
        ]);

        $response->assertSessionHasErrors('password');

        // Strong password should pass
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'StrongP@ssw0rd123',
            'password_confirmation' => 'StrongP@ssw0rd123',
        ]);

        $response->assertSessionDoesntHaveErrors('password');
    }

    /**
     * Test security headers are present
     */
    public function test_security_headers_present(): void
    {
        $response = $this->get('/');

        $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-XSS-Protection', '1; mode=block');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    /**
     * Test CSRF protection
     */
    public function test_csrf_protection(): void
    {
        $response = $this->post('/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        // Without CSRF token, should fail
        $response->assertStatus(419); // CSRF token mismatch
    }

    /**
     * Test session encryption configuration
     */
    public function test_session_encryption_enabled(): void
    {
        // In production, session encryption should be enabled
        if (app()->environment('production')) {
            $this->assertTrue(config('session.encrypt'));
        }
    }
}
