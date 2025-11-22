<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DailyConsumptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Routes using this request are already protected by auth middleware
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $user = $this->user();
        $sections = method_exists($user, 'getRequiredSections')
            ? (array) $user->getRequiredSections()
            : [];

        $rules = [
            'date' => ['required', 'date', 'before_or_equal:today'],
            'remarks' => ['nullable', 'string', 'max:500'],
        ];

        if (in_array('primary', $sections, true)) {
            $rules['served_primary'] = ['required', 'integer', 'min:0'];
        }

        if (in_array('middle', $sections, true)) {
            $rules['served_middle'] = ['required', 'integer', 'min:0'];
        }

        return $rules;
    }
}
