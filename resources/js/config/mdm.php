<?php

return [
    /*
    |--------------------------------------------------------------------------
    | MDM Rice Per Student Configuration
    |--------------------------------------------------------------------------
    |
    | Define the fixed rice allocation per student for each section.
    | Values are in kilograms (kg).
    |
    */
    'rice_per_student' => [
        'primary' => 0.1,  // 100 grams per primary student
        'middle'  => 0.15, // 150 grams per middle student
    ],

    /*
    |--------------------------------------------------------------------------
    | MDM Default Settings
    |--------------------------------------------------------------------------
    |
    | Additional configuration options for the MDM system.
    |
    */
    'default_working_days' => 22, // Average working days per month
    
    'school_types' => [
        'primary' => 'Primary School',
        'middle' => 'Middle School',
        'primary_with_middle' => 'Primary with Middle School',
    ],

    /*
    |--------------------------------------------------------------------------
    | Validation Limits
    |--------------------------------------------------------------------------
    |
    | Maximum allowed values for various fields.
    |
    */
    'max_students_per_school' => 1000,
    'max_rice_stock' => 10000, // in kg
    'max_amount_per_ingredient' => 100, // in rupees
];