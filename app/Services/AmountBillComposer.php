<?php

namespace App\Services;

use App\Models\AmountConfiguration;
use App\Models\User;

/**
 * AmountBillComposer Service
 * 
 * Composes amount data for bill creation with salt subdivision.
 * This service provides the subdivided salt amounts based on configured percentages
 * for use in bill creation forms and calculations.
 * 
 * Key responsibilities:
 * - Provide base amounts per student for all categories
 * - Calculate salt subcategory amounts based on percentages
 * - Format data for frontend consumption in bill creation pages
 */
class AmountBillComposer
{
    /**
     * Compose bill amounts with salt subdivision for create forms.
     * 
     * This method retrieves the user's amount configuration and returns
     * structured data including:
     * - Base per-student amounts for all categories
     * - Salt percentages for each subcategory
     * - Calculated salt amounts per student for each subcategory
     * - Both primary and middle section data
     * 
     * @param User $user The user/school creating the bill
     * @return array Structured data for bill creation
     * @throws \Exception If no configuration found
     */
    public function composeBillAmountsForCreate(User $user): array
    {
        // Get latest amount configuration
        $config = AmountConfiguration::where('user_id', $user->id)
            ->latest()
            ->first();

        if (!$config) {
            throw new \Exception('Amount configuration not found. Please set up your configuration first.');
        }

        // Calculate salt breakdowns per student
        $saltPrimaryBreakdownPerStudent = $config->calculateSaltSubcategoriesPrimary();
        $saltMiddleBreakdownPerStudent = $config->calculateSaltSubcategoriesMiddle();

        // Compose the response data
        return [
            // Configuration metadata
            'config_id' => $config->id,
            'config_period' => [
                'month' => $config->month,
                'year' => $config->year,
                'month_name' => $config->month_name,
                'formatted' => $config->formatted_period,
            ],
            
            // Primary section data
            'primary' => [
                // Base amounts per student
                'base_amounts' => [
                    'pulses' => (float) $config->daily_pulses_primary,
                    'vegetables' => (float) $config->daily_vegetables_primary,
                    'oil' => (float) $config->daily_oil_primary,
                    'salt_total' => (float) $config->daily_salt_primary,
                    'fuel' => (float) $config->daily_fuel_primary,
                    'total' => (float) $config->total_daily_primary,
                ],
                
                // Salt percentages (unified for both primary and middle)
                'salt_percentages' => [
                    'common_salt' => (float) $config->salt_percentage_common,
                    'chilli_powder' => (float) $config->salt_percentage_chilli,
                    'turmeric' => (float) $config->salt_percentage_turmeric,
                    'coriander' => (float) $config->salt_percentage_coriander,
                    'other_condiments' => (float) $config->salt_percentage_other,
                ],
                
                // Salt amounts per student (subdivided)
                'salt_amounts_per_student' => [
                    'common_salt' => $saltPrimaryBreakdownPerStudent['common_salt'],
                    'chilli_powder' => $saltPrimaryBreakdownPerStudent['chilli_powder'],
                    'turmeric' => $saltPrimaryBreakdownPerStudent['turmeric'],
                    'coriander' => $saltPrimaryBreakdownPerStudent['coriander'],
                    'other_condiments' => $saltPrimaryBreakdownPerStudent['other_condiments'],
                ],
            ],
            
            // Middle section data
            'middle' => [
                // Base amounts per student
                'base_amounts' => [
                    'pulses' => (float) $config->daily_pulses_middle,
                    'vegetables' => (float) $config->daily_vegetables_middle,
                    'oil' => (float) $config->daily_oil_middle,
                    'salt_total' => (float) $config->daily_salt_middle,
                    'fuel' => (float) $config->daily_fuel_middle,
                    'total' => (float) $config->total_daily_middle,
                ],
                
                // Salt percentages (unified for both primary and middle)
                'salt_percentages' => [
                    'common_salt' => (float) $config->salt_percentage_common,
                    'chilli_powder' => (float) $config->salt_percentage_chilli,
                    'turmeric' => (float) $config->salt_percentage_turmeric,
                    'coriander' => (float) $config->salt_percentage_coriander,
                    'other_condiments' => (float) $config->salt_percentage_other,
                ],
                
                // Salt amounts per student (subdivided)
                'salt_amounts_per_student' => [
                    'common_salt' => $saltMiddleBreakdownPerStudent['common_salt'],
                    'chilli_powder' => $saltMiddleBreakdownPerStudent['chilli_powder'],
                    'turmeric' => $saltMiddleBreakdownPerStudent['turmeric'],
                    'coriander' => $saltMiddleBreakdownPerStudent['coriander'],
                    'other_condiments' => $saltMiddleBreakdownPerStudent['other_condiments'],
                ],
            ],
            
            // School metadata
            'school_info' => [
                'school_type' => $user->school_type,
                'has_primary' => $user->hasPrimaryStudents(),
                'has_middle' => $user->hasMiddleStudents(),
            ],
        ];
    }

    /**
     * Calculate total bill amounts for specific student counts.
     * 
     * Given the number of students served in each section, calculates
     * the total amounts needed including salt subdivision.
     * 
     * @param User $user The user/school
     * @param int $primaryStudents Number of primary students
     * @param int $middleStudents Number of middle students
     * @return array Calculated totals with salt breakdown
     * @throws \Exception If no configuration found
     */
    public function calculateBillTotals(User $user, int $primaryStudents, int $middleStudents): array
    {
        $config = AmountConfiguration::where('user_id', $user->id)
            ->latest()
            ->first();

        if (!$config) {
            throw new \Exception('Amount configuration not found.');
        }

        // Calculate primary totals
        $primaryPulses = round($primaryStudents * $config->daily_pulses_primary, 2);
        $primaryVegetables = round($primaryStudents * $config->daily_vegetables_primary, 2);
        $primaryOil = round($primaryStudents * $config->daily_oil_primary, 2);
        $primarySaltTotal = round($primaryStudents * $config->daily_salt_primary, 2);
        $primaryFuel = round($primaryStudents * $config->daily_fuel_primary, 2);

        // Get salt breakdown for primary
        $saltPrimaryBreakdown = $config->calculateSaltSubcategoriesPrimary();
        $primarySaltAmounts = array_map(function($amount) use ($primaryStudents) {
            return round($amount * $primaryStudents, 2);
        }, $saltPrimaryBreakdown);

        $primaryTotal = round(
            $primaryPulses + $primaryVegetables + $primaryOil + $primarySaltTotal + $primaryFuel,
            2
        );

        // Calculate middle totals
        $middlePulses = round($middleStudents * $config->daily_pulses_middle, 2);
        $middleVegetables = round($middleStudents * $config->daily_vegetables_middle, 2);
        $middleOil = round($middleStudents * $config->daily_oil_middle, 2);
        $middleSaltTotal = round($middleStudents * $config->daily_salt_middle, 2);
        $middleFuel = round($middleStudents * $config->daily_fuel_middle, 2);

        // Get salt breakdown for middle
        $saltMiddleBreakdown = $config->calculateSaltSubcategoriesMiddle();
        $middleSaltAmounts = array_map(function($amount) use ($middleStudents) {
            return round($amount * $middleStudents, 2);
        }, $saltMiddleBreakdown);

        $middleTotal = round(
            $middlePulses + $middleVegetables + $middleOil + $middleSaltTotal + $middleFuel,
            2
        );

        // Grand total
        $grandTotal = round($primaryTotal + $middleTotal, 2);

        return [
            'primary' => [
                'students' => $primaryStudents,
                'pulses' => $primaryPulses,
                'vegetables' => $primaryVegetables,
                'oil' => $primaryOil,
                'salt_total' => $primarySaltTotal,
                'salt_breakdown' => [
                    'common_salt' => $primarySaltAmounts['common_salt'],
                    'chilli_powder' => $primarySaltAmounts['chilli_powder'],
                    'turmeric' => $primarySaltAmounts['turmeric'],
                    'coriander' => $primarySaltAmounts['coriander'],
                    'other_condiments' => $primarySaltAmounts['other_condiments'],
                ],
                'fuel' => $primaryFuel,
                'total' => $primaryTotal,
            ],
            'middle' => [
                'students' => $middleStudents,
                'pulses' => $middlePulses,
                'vegetables' => $middleVegetables,
                'oil' => $middleOil,
                'salt_total' => $middleSaltTotal,
                'salt_breakdown' => [
                    'common_salt' => $middleSaltAmounts['common_salt'],
                    'chilli_powder' => $middleSaltAmounts['chilli_powder'],
                    'turmeric' => $middleSaltAmounts['turmeric'],
                    'coriander' => $middleSaltAmounts['coriander'],
                    'other_condiments' => $middleSaltAmounts['other_condiments'],
                ],
                'fuel' => $middleFuel,
                'total' => $middleTotal,
            ],
            'grand_total' => $grandTotal,
        ];
    }

    /**
     * Get formatted salt subcategory labels for display.
     * 
     * @return array
     */
    public function getSaltSubcategoryLabels(): array
    {
        return [
            'common_salt' => 'Common Salt',
            'chilli_powder' => 'Chilli Powder',
            'turmeric' => 'Turmeric',
            'coriander' => 'Coriander',
            'other_condiments' => 'Other Condiments',
        ];
    }

    /**
     * Validate that amount configuration has valid salt percentages.
     * 
     * @param User $user
     * @return array ['valid' => bool, 'errors' => array]
     */
    public function validateConfiguration(User $user): array
    {
        $config = AmountConfiguration::where('user_id', $user->id)
            ->latest()
            ->first();

        if (!$config) {
            return [
                'valid' => false,
                'errors' => ['Amount configuration not found.'],
            ];
        }

        $errors = [];

        // Validate unified salt percentages (applies to both primary and middle)
        $validation = $config->validateSaltPercentages();
        if (!$validation['valid']) {
            $errors[] = $validation['error'];
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors,
        ];
    }
}