<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Contracts\Validation\Validator;

class StoreAmountConfigurationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $user = Auth::user();
        $rules = [
            'year' => ['required', 'integer', 'min:2020', 'max:2100'],
            'month' => ['required', 'integer', 'min:1', 'max:12'],
        ];

        if ($user->hasPrimaryStudents()) {
            $rules['daily_pulses_primary'] = ['required', 'numeric', 'min:0', 'max:999999.99'];
            $rules['daily_vegetables_primary'] = ['required', 'numeric', 'min:0', 'max:999999.99'];
            $rules['daily_oil_primary'] = ['required', 'numeric', 'min:0', 'max:999999.99'];
            $rules['daily_salt_primary'] = ['required', 'numeric', 'min:0', 'max:999999.99'];
            $rules['daily_fuel_primary'] = ['required', 'numeric', 'min:0', 'max:999999.99'];
        }

        if ($user->hasMiddleStudents()) {
            $rules['daily_pulses_middle'] = ['required', 'numeric', 'min:0', 'max:999999.99'];
            $rules['daily_vegetables_middle'] = ['required', 'numeric', 'min:0', 'max:999999.99'];
            $rules['daily_oil_middle'] = ['required', 'numeric', 'min:0', 'max:999999.99'];
            $rules['daily_salt_middle'] = ['required', 'numeric', 'min:0', 'max:999999.99'];
            $rules['daily_fuel_middle'] = ['required', 'numeric', 'min:0', 'max:999999.99'];
        }

        $rules['salt_percentage_common'] = ['required', 'numeric', 'min:0', 'max:100'];
        $rules['salt_percentage_chilli'] = ['required', 'numeric', 'min:0', 'max:100'];
        $rules['salt_percentage_turmeric'] = ['required', 'numeric', 'min:0', 'max:100'];
        $rules['salt_percentage_coriander'] = ['required', 'numeric', 'min:0', 'max:100'];
        $rules['salt_percentage_other'] = ['required', 'numeric', 'min:0', 'max:100'];

        return $rules;
    }

    /**
     * Configure the validator instance.
     * ✅ Single validation check for unified salt percentages.
     *
     * @param  \Illuminate\Contracts\Validation\Validator  $validator
     * @return void
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            // ✅ Validate unified salt percentages sum to 100
            $total = 
                ($this->input('salt_percentage_common', 0)) +
                ($this->input('salt_percentage_chilli', 0)) +
                ($this->input('salt_percentage_turmeric', 0)) +
                ($this->input('salt_percentage_coriander', 0)) +
                ($this->input('salt_percentage_other', 0));
            
            // Allow tolerance of ±0.01 for floating point precision
            if (abs($total - 100) > 0.01) {
                $validator->errors()->add(
                    'salt_percentage_common',
                    "Salt & condiments percentages must sum to 100% (current total: " . round($total, 2) . "%)"
                );
            }
        });
    }

    protected function prepareForValidation(): void
    {
        $user = Auth::user();
        $data = [];

        if (!$user->hasPrimaryStudents()) {
            $data['daily_pulses_primary'] = 0;
            $data['daily_vegetables_primary'] = 0;
            $data['daily_oil_primary'] = 0;
            $data['daily_salt_primary'] = 0;
            $data['daily_fuel_primary'] = 0;
        }

        if (!$user->hasMiddleStudents()) {
            $data['daily_pulses_middle'] = 0;
            $data['daily_vegetables_middle'] = 0;
            $data['daily_oil_middle'] = 0;
            $data['daily_salt_middle'] = 0;
            $data['daily_fuel_middle'] = 0;
        }

        if (!$this->has('salt_percentage_common')) {
            $data['salt_percentage_common'] = 5;
            $data['salt_percentage_chilli'] = 35;
            $data['salt_percentage_turmeric'] = 25;
            $data['salt_percentage_coriander'] = 15;
            $data['salt_percentage_other'] = 20;
        }

        if (!empty($data)) {
            $this->merge($data);
        }
    }

    /**
     * Get custom attribute names.
     */
    public function attributes(): array
    {
        return [
            'daily_pulses_primary' => 'primary pulses rate',
            'daily_vegetables_primary' => 'primary vegetables rate',
            'daily_oil_primary' => 'primary oil/fat rate',
            'daily_salt_primary' => 'primary salt rate',
            'daily_fuel_primary' => 'primary fuel rate',
            'daily_pulses_middle' => 'middle pulses rate',
            'daily_vegetables_middle' => 'middle vegetables rate',
            'daily_oil_middle' => 'middle oil/fat rate',
            'daily_salt_middle' => 'middle salt rate',
            'daily_fuel_middle' => 'middle fuel rate',
            
            // ✅ Unified salt percentages
            'salt_percentage_common' => 'common salt percentage',
            'salt_percentage_chilli' => 'chilli powder percentage',
            'salt_percentage_turmeric' => 'turmeric percentage',
            'salt_percentage_coriander' => 'coriander percentage',
            'salt_percentage_other' => 'other condiments percentage',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            '*.required' => 'The :attribute is required.',
            '*.numeric' => 'The :attribute must be a number.',
            '*.min' => 'The :attribute cannot be negative.',
            '*.max' => 'The :attribute is too large.',
        ];
    }
}