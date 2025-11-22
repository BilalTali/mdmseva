<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\Zone;
use App\Services\CacheService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * LocationController - Phase 5: Location API Endpoints
 * 
 * Provides public API endpoints for districts and zones
 * Used by registration form for cascading dropdowns
 */
class LocationController extends Controller
{
    protected CacheService $cacheService;
    
    public function __construct(CacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }
    
    /**
     * Get all districts with optional state filter
     * 
     * GET /api/districts
     * Query params:
     *   - state (optional): Filter by 'Jammu and Kashmir' or 'Ladakh'
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getDistricts(Request $request): JsonResponse
    {
        // Validate state parameter if provided
        $request->validate([
            'state' => 'nullable|string|in:Jammu and Kashmir,Ladakh',
        ]);

        // Get districts from cache
        $districts = $this->cacheService->getDistricts($request->state);
        
        // Load zones relationship if not already loaded
        $districts->load('zones');

        // Format response
        return response()->json([
            'success' => true,
            'data' => $districts->map(function ($district) {
                return [
                    'id' => $district->id,
                    'name' => $district->name,
                    'state' => $district->state,
                    'code' => $district->code,
                    'zones' => $district->zones->map(function ($zone) {
                        return [
                            'id' => $zone->id,
                            'name' => $zone->name,
                            'code' => $zone->code,
                        ];
                    }),
                ];
            }),
            'total' => $districts->count(),
            'cached' => true, // Indicate data is cached
        ]);
    }

    /**
     * Get zones for a specific district
     * 
     * GET /api/zones/{districtId}
     * 
     * @param int $districtId
     * @return JsonResponse
     */
    public function getZones(int $districtId): JsonResponse
    {
        // Verify district exists
        $district = District::find($districtId);

        if (!$district) {
            return response()->json([
                'success' => false,
                'message' => 'District not found.',
                'data' => [],
            ], 404);
        }

        // Get zones from cache
        $zones = $this->cacheService->getZonesByDistrict($districtId);

        // Format response
        return response()->json([
            'success' => true,
            'data' => $zones->map(function ($zone) {
                return [
                    'id' => $zone->id,
                    'name' => $zone->name,
                    'code' => $zone->code,
                    'district_id' => $zone->district_id,
                ];
            }),
            'district' => [
                'id' => $district->id,
                'name' => $district->name,
                'state' => $district->state,
            ],
            'total' => $zones->count(),
            'cached' => true, // Indicate data is cached
        ]);
    }

    /**
     * Get all states (for completeness)
     * 
     * GET /api/states
     * 
     * @return JsonResponse
     */
    public function getStates(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                [
                    'value' => 'Jammu and Kashmir',
                    'label' => 'Jammu and Kashmir',
                ],
                [
                    'value' => 'Ladakh',
                    'label' => 'Ladakh',
                ],
            ],
        ]);
    }

    /**
     * Validate zone belongs to district (utility endpoint)
     * 
     * GET /api/validate-location
     * Query params:
     *   - district_id (required)
     *   - zone_id (required)
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function validateLocation(Request $request): JsonResponse
    {
        $request->validate([
            'district_id' => 'required|integer|exists:districts,id',
            'zone_id' => 'required|integer|exists:zones,id',
        ]);

        // Check if zone belongs to district
        $zone = Zone::where('id', $request->zone_id)
            ->where('district_id', $request->district_id)
            ->first();

        if ($zone) {
            return response()->json([
                'success' => true,
                'valid' => true,
                'message' => 'Zone belongs to the selected district.',
                'data' => [
                    'district' => $zone->district->name,
                    'zone' => $zone->name,
                    'state' => $zone->district->state,
                ],
            ]);
        }

        return response()->json([
            'success' => false,
            'valid' => false,
            'message' => 'Zone does not belong to the selected district.',
        ], 422);
    }

    /**
     * Get location hierarchy (for debugging/admin)
     * 
     * GET /api/location-hierarchy
     * 
     * @return JsonResponse
     */
    public function getLocationHierarchy(): JsonResponse
    {
        $jkDistricts = District::where('state', 'Jammu and Kashmir')
            ->with('zones')
            ->orderBy('name')
            ->get();

        $ladakhDistricts = District::where('state', 'Ladakh')
            ->with('zones')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'Jammu and Kashmir' => [
                    'total_districts' => $jkDistricts->count(),
                    'total_zones' => $jkDistricts->sum(fn($d) => $d->zones->count()),
                    'districts' => $jkDistricts->map(function ($district) {
                        return [
                            'id' => $district->id,
                            'name' => $district->name,
                            'code' => $district->code,
                            'zones_count' => $district->zones->count(),
                            'zones' => $district->zones->pluck('name'),
                        ];
                    }),
                ],
                'Ladakh' => [
                    'total_districts' => $ladakhDistricts->count(),
                    'total_zones' => $ladakhDistricts->sum(fn($d) => $d->zones->count()),
                    'districts' => $ladakhDistricts->map(function ($district) {
                        return [
                            'id' => $district->id,
                            'name' => $district->name,
                            'code' => $district->code,
                            'zones_count' => $district->zones->count(),
                            'zones' => $district->zones->pluck('name'),
                        ];
                    }),
                ],
            ],
            'summary' => [
                'total_states' => 2,
                'total_districts' => $jkDistricts->count() + $ladakhDistricts->count(),
                'total_zones' => $jkDistricts->sum(fn($d) => $d->zones->count()) + 
                                $ladakhDistricts->sum(fn($d) => $d->zones->count()),
            ],
        ]);
    }
}