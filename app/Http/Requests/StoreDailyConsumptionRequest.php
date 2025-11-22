<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDailyConsumptionRequest extends FormRequest
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
        $schoolType = $this->user()->school_type;
        
        $rules = [
            'consumption_date' => [
                'required',
                'date',
                'before_or_equal:today',
                Rule::unique('daily_consumptions')
                    ->where('user_id', $this->user()->id)
                    ->ignore($this->route('daily_consumption'))
            ],
            'opening_balance' => 'required|numeric|min:0',
            'remaining_balance' => 'nullable|numeric|min:0',
        ];

        // Add school type specific validations
        if (in_array($schoolType, ['primary', 'primary_middle'])) {
            $rules['served_primary'] = 'required|integer|min:0';
            $rules['amount_primary'] = 'required|numeric|min:0';
        }

        if (in_array($schoolType, ['middle', 'primary_middle'])) {
            $rules['served_middle'] = 'required|integer|min:0';
            $rules['amount_middle'] = 'required|numeric|min:0';
        }

        // Total fields (calculated on frontend but validated)
        $rules['total_students_served'] = 'required|integer|min:0';
        $rules['total_amount_consumed'] = 'required|numeric|min:0';
        $rules['cumulative_amount'] = 'nullable|numeric|min:0';

        return $rules;
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'consumption_date' => 'date',
            'served_primary' => 'primary students served',
            'served_middle' => 'middle students served',
            'amount_primary' => 'primary amount',
            'amount_middle' => 'middle amount',
            'total_students_served' => 'total students',
            'total_amount_consumed' => 'total amount',
            'opening_balance' => 'opening balance',
            'remaining_balance' => 'remaining balance',
            'cumulative_amount' => 'cumulative amount',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'consumption_date.unique' => 'A consumption entry already exists for this date.',
            'consumption_date.before_or_equal' => 'The date cannot be in the future.',
            'served_primary.required' => 'Please enter the number of primary students served.',
            'served_middle.required' => 'Please enter the number of middle students served.',
            'amount_primary.required' => 'Please enter the rice amount for primary students.',
            'amount_middle.required' => 'Please enter the rice amount for middle students.',
        ];
    }

    /**
     * Prepare data for validation
     */
    protected function prepareForValidation(): void
    {
        // Ensure numeric fields are properly formatted
        $this->merge([
            'opening_balance' => $this->toFloat('opening_balance'),
            'remaining_balance' => $this->toFloat('remaining_balance'),
            'amount_primary' => $this->toFloat('amount_primary'),
            'amount_middle' => $this->toFloat('amount_middle'),
            'total_amount_consumed' => $this->toFloat('total_amount_consumed'),
            'cumulative_amount' => $this->toFloat('cumulative_amount'),
            'served_primary' => $this->toInt('served_primary'),
            'served_middle' => $this->toInt('served_middle'),
            'total_students_served' => $this->toInt('total_students_served'),
        ]);
    }

    /**
     * Convert value to float
     */
    private function toFloat(?string $key): ?float
    {
        $value = $this->input($key);
        return $value !== null ? (float) $value : null;
    }

    /**
     * Convert value to integer
     */
    private function toInt(?string $key): ?int
    {
        $value = $this->input($key);
        return $value !== null ? (int) $value : null;
    }
}