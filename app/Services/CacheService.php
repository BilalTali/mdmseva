<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use App\Models\District;
use App\Models\Zone;

/**
 * CacheService
 * 
 * Centralized caching service for reference data and frequently accessed queries
 * Improves performance by reducing database queries
 */
class CacheService
{
    /**
     * Cache TTL constants (in seconds)
     */
    const REFERENCE_DATA_TTL = 86400; // 24 hours
    const USER_DATA_TTL = 3600;       // 1 hour
    const DASHBOARD_TTL = 300;        // 5 minutes
    
    /**
     * Cache key prefixes
     */
    const PREFIX_DISTRICTS = 'districts';
    const PREFIX_ZONES = 'zones';
    const PREFIX_USER = 'user';
    const PREFIX_DASHBOARD = 'dashboard';
    
    /**
     * Get all districts with caching
     * 
     * @param string|null $state Optional state filter
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getDistricts(?string $state = null): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = $state 
            ? self::PREFIX_DISTRICTS . ':' . $state 
            : self::PREFIX_DISTRICTS . ':all';
        
        return Cache::remember($cacheKey, self::REFERENCE_DATA_TTL, function () use ($state) {
            $query = District::query()->orderBy('name');
            
            if ($state) {
                $query->where('state', $state);
            }
            
            return $query->get();
        });
    }
    
    /**
     * Get zones for a specific district with caching
     * 
     * @param int $districtId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getZonesByDistrict(int $districtId): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = self::PREFIX_ZONES . ':district:' . $districtId;
        
        return Cache::remember($cacheKey, self::REFERENCE_DATA_TTL, function () use ($districtId) {
            return Zone::where('district_id', $districtId)
                ->orderBy('name')
                ->get();
        });
    }
    
    /**
     * Get all zones with caching
     * 
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAllZones(): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = self::PREFIX_ZONES . ':all';
        
        return Cache::remember($cacheKey, self::REFERENCE_DATA_TTL, function () {
            return Zone::with('district')->orderBy('name')->get();
        });
    }
    
    /**
     * Invalidate district cache
     * Call this when districts are created, updated, or deleted
     * 
     * @return void
     */
    public function invalidateDistrictsCache(): void
    {
        // Clear all district-related cache keys
        Cache::forget(self::PREFIX_DISTRICTS . ':all');
        
        // Clear state-specific caches
        $states = ['Jammu and Kashmir', 'Ladakh'];
        foreach ($states as $state) {
            Cache::forget(self::PREFIX_DISTRICTS . ':' . $state);
        }
    }
    
    /**
     * Invalidate zone cache
     * Call this when zones are created, updated, or deleted
     * 
     * @param int|null $districtId Optional district ID to clear specific cache
     * @return void
     */
    public function invalidateZonesCache(?int $districtId = null): void
    {
        if ($districtId) {
            Cache::forget(self::PREFIX_ZONES . ':district:' . $districtId);
        } else {
            // Clear all zone caches
            Cache::forget(self::PREFIX_ZONES . ':all');
            
            // Clear district-specific zone caches
            $districts = District::pluck('id');
            foreach ($districts as $id) {
                Cache::forget(self::PREFIX_ZONES . ':district:' . $id);
            }
        }
    }
    
    /**
     * Invalidate all reference data caches
     * 
     * @return void
     */
    public function invalidateAllReferenceData(): void
    {
        $this->invalidateDistrictsCache();
        $this->invalidateZonesCache();
    }
    
    /**
     * Warm up the cache with reference data
     * Call this on application boot or after cache clear
     * 
     * @return void
     */
    public function warmUpReferenceData(): void
    {
        // Warm up districts cache
        $this->getDistricts();
        $this->getDistricts('Jammu and Kashmir');
        $this->getDistricts('Ladakh');
        
        // Warm up zones cache
        $this->getAllZones();
        
        // Warm up district-specific zones
        $districts = District::pluck('id');
        foreach ($districts as $districtId) {
            $this->getZonesByDistrict($districtId);
        }
    }
    
    /**
     * Get cache statistics
     * 
     * @return array
     */
    public function getCacheStats(): array
    {
        return [
            'districts_cached' => Cache::has(self::PREFIX_DISTRICTS . ':all'),
            'zones_cached' => Cache::has(self::PREFIX_ZONES . ':all'),
            'cache_driver' => config('cache.default'),
        ];
    }
}
