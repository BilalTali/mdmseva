<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\District;
use App\Models\Zone;
use App\Rules\StrongPassword;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        // Validate all incoming registration data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email:rfc,dns|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', new StrongPassword()],
            'phone' => ['required', 'digits:10', 'unique:users,phone'],
            'udise_code' => ['required', 'digits:11', 'unique:users,udise_code'],
            
            // Location master data validation (J&K/Ladakh only)
            'state' => 'required|string|in:Jammu and Kashmir,Ladakh',
            'district_id' => 'required|integer|exists:districts,id',
            'zone_id' => 'required|integer|exists:zones,id',
            
            'school_name' => 'required|string|max:255',
            'school_type' => 'required|string|in:primary,middle,secondary',
            'institute_address' => 'required|string|max:500',
            'school_pincode' => 'required|string|max:10',
        ]);

        // Load District and Zone models for auto-population (non-blocking).
        // The validation rules already ensure that the IDs exist, so we avoid
        // sending the user back to the form for minor data mismatches.
        $zone = Zone::find($validated['zone_id']);
        $district = District::find($validated['district_id']);

        try {
            // Create user with all validated data
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'],
                'udise_code' => $validated['udise_code'],
                
                // Foreign keys (master data)
                'district_id' => $validated['district_id'],
                'zone_id' => $validated['zone_id'],
                'state' => $district?->state ?? $validated['state'],
                'district' => $district?->name,
                'zone' => $zone?->name,
                
                // Status (enum: active, inactive, pending)
                'status' => 'active',
                
                'school_name' => $validated['school_name'],
                'school_type' => $validated['school_type'],
                'institute_address' => $validated['institute_address'],
                'school_pincode' => $validated['school_pincode'],
            ]);

            Log::info('User created successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);

            // Auto-assign 'school' role after registration
            try {
                $user->assignRole('school');
                Log::info('School role assigned', ['user_id' => $user->id]);
            } catch (\Exception $e) {
                Log::warning('Failed to assign school role, but continuing registration', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
                // Continue registration even if role assignment fails
            }

            // Log the user in
            Auth::login($user);

            Log::info('User logged in, redirecting to dashboard', [
                'user_id' => $user->id,
                'authenticated' => Auth::check(),
            ]);

            // Redirect directly to dashboard (no email verification)
            return redirect()->route('dashboard')
                ->with('status', 'Registration successful!');

        } catch (\Exception $e) {
            Log::error('User registration failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'email' => $validated['email'] ?? 'unknown',
                'district_id' => $validated['district_id'] ?? null,
                'zone_id' => $validated['zone_id'] ?? null,
            ]);

            return back()->withErrors([
                'registration' => 'Registration failed: ' . $e->getMessage()
            ])->withInput();
        }
    }
}