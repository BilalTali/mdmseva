<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * ✅ NEW: Request validation for adding rice arranged from alternative sources
 */
class AddRiceArrangedRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'amount_primary' => 'nullable|numeric|min:0|max:10000',
            'amount_upper_primary' => 'nullable|numeric|min:0|max:10000',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2100',
            'notes' => 'nullable|string|max:500',
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     */
    public function attributes(): array
    {
        return [
            'amount_primary' => 'primary section rice amount',
            'amount_upper_primary' => 'upper primary section rice amount',
            'month' => 'month',
            'year' => 'year',
            'notes' => 'notes/remarks',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'amount_primary.min' => 'Primary rice amount cannot be negative.',
            'amount_primary.max' => 'Primary rice amount seems too large. Please verify.',
            'amount_upper_primary.min' => 'Upper primary rice amount cannot be negative.',
            'amount_upper_primary.max' => 'Upper primary rice amount seems too large. Please verify.',
            'month.required' => 'Month is required.',
            'month.min' => 'Month must be between 1 and 12.',
            'month.max' => 'Month must be between 1 and 12.',
            'year.required' => 'Year is required.',
            'year.min' => 'Year must be 2020 or later.',
            'year.max' => 'Year must be 2100 or earlier.',
            'notes.max' => 'Notes cannot exceed 500 characters.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Ensure at least one amount is provided
        if (!$this->has('amount_primary') && !$this->has('amount_upper_primary')) {
            $this->merge([
                'amount_primary' => 0,
                'amount_upper_primary' => 0,
            ]);
        }
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $amountPrimary = (float) ($this->input('amount_primary') ?? 0);
            $amountUpperPrimary = (float) ($this->input('amount_upper_primary') ?? 0);

            // Ensure at least one amount is greater than 0
            if ($amountPrimary <= 0 && $amountUpperPrimary <= 0) {
                $validator->errors()->add(
                    'amount_primary',
                    'At least one rice amount (Primary or Upper Primary) must be greater than zero.'
                );
            }
        });
    }
}