<?php
// Location: app/Http/Requests/AddRiceRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\\Models\\MonthlyRiceConfiguration;

class AddRiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $config = MonthlyRiceConfiguration::forUser(auth()->id())->first();
        
        return [
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2100',
            'amount_primary' => [
                $config && $config->needsPrimary() ? 'required' : 'nullable',
                'numeric',
                'min:0',
            ],
            'amount_upper_primary' => [
                $config && $config->needsUpperPrimary() ? 'required' : 'nullable',
                'numeric',
                'min:0',
            ],
            'notes' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'month.required' => 'Please specify the month.',
            'month.min' => 'Month must be between 1 and 12.',
            'month.max' => 'Month must be between 1 and 12.',
            'year.required' => 'Please specify the year.',
            'year.min' => 'Year must be 2020 or later.',
            'amount_primary.required' => 'Amount for primary students is required.',
            'amount_primary.min' => 'Amount cannot be negative.',
            'amount_upper_primary.required' => 'Amount for upper primary students is required.',
            'amount_upper_primary.min' => 'Amount cannot be negative.',
            'notes.max' => 'Notes cannot exceed 1000 characters.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Ensure at least one amount is provided
            $amountPrimary = (float) $this->input('amount_primary', 0);
            $amountUpperPrimary = (float) $this->input('amount_upper_primary', 0);
            
            if ($amountPrimary == 0 && $amountUpperPrimary == 0) {
                $validator->errors()->add(
                    'amount_primary',
                    'At least one amount (primary or upper primary) must be greater than zero.'
                );
            }
        });
    }
}
