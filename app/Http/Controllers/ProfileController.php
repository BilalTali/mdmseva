<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\District;
use App\Models\Zone;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{ 
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        // Get all districts for dropdown
        $districts = District::orderBy('name')->get(['id', 'name', 'state']);

        // Get distinct states from districts (for state dropdown)
        $states = District::select('state')
            ->distinct()
            ->orderBy('state')
            ->pluck('state');
        
        // Get zones based on user's district or all zones
        $zones = $request->user()->district_id 
            ? Zone::where('district_id', $request->user()->district_id)
                  ->orderBy('name')
                  ->get(['id', 'name'])
            : Zone::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Profile/Edit', [
            'user' => $request->user(),
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'states' => $states,
            'districts' => $districts,
            'zones' => $zones,
            'schoolTypes' => [
                ['value' => 'primary', 'label' => 'Primary School (I-V)'],
                ['value' => 'middle', 'label' => 'Middle School (I-VIII)'],
                ['value' => 'secondary', 'label' => 'Secondary School (VI-VIII)'],
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        
        // Fill all validated data except UDISE
        $validated = $request->validated();
        
        // Remove UDISE if somehow it got included
        unset($validated['udise']);
        
        $user->fill($validated);

        // If email changed, reset email verification
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    /**
     * Get zones by district (AJAX endpoint)
     */
    public function getZonesByDistrict(Request $request, int $districtId)
    {
        $zones = Zone::where('district_id', $districtId)
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json($zones);
    }
}