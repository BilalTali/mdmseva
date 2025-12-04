<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            // Personal Information
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'phone' => [
                'nullable',
                'string',
                'max:15',
                Rule::unique(User::class, 'phone')->ignore($this->user()->id),
            ],

            'address' => ['nullable', 'string', 'max:500'],
            
            // Location Information
            'state' => ['nullable', 'string', 'max:255'],
            'district' => ['nullable', 'string', 'max:255'],
            'zone' => ['nullable', 'string', 'max:255'],
            'district_id' => ['nullable', 'integer', 'exists:districts,id'],
            'zone_id' => ['nullable', 'integer', 'exists:zones,id'],
            
            // Institutional Information (School)
            'school_name' => ['nullable', 'string', 'max:255'],
            'school_type' => [
                'nullable',
                Rule::in(['primary', 'middle', 'secondary'])
            ],
            'institute_address' => ['nullable', 'string', 'max:500'],
            'school_pincode' => ['nullable', 'string', 'max:10'],
            
            // NOTE: UDISE is NOT included here - it should never be updated
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'date_of_birth' => 'date of birth',
            'district_id' => 'district',
            'zone_id' => 'zone',
            'school_name' => 'school name',
            'school_type' => 'school type',
            'institute_address' => 'institute address',
            'school_pincode' => 'school pincode',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'date_of_birth.before' => 'The date of birth must be a date before today.',
            'school_type.in' => 'The school type must be either primary, middle, or secondary.',
            'district_id.exists' => 'The selected district is invalid.',
            'zone_id.exists' => 'The selected zone is invalid.',
        ];
    }
}