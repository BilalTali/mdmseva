<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFeedbackRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Public feedback submission from welcome page is allowed
        return true;
    }

    protected function prepareForValidation(): void
    {
        $sanitizedPhone = preg_replace('/\D+/', '', (string) $this->input('phone'));
        $sanitizedUdise = preg_replace('/\D+/', '', (string) $this->input('udise_code'));

        $this->merge([
            'phone' => $sanitizedPhone ?: null,
            'school_name' => $this->input('school_name') ?? $this->input('school'),
            'udise_code' => $sanitizedUdise ?: null,
            'state' => trim((string) $this->input('state')) ?: null,
            'district' => trim((string) $this->input('district')) ?: null,
            'zone' => trim((string) $this->input('zone')) ?: null,
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email:rfc,dns', 'max:255'],
            'phone' => ['required', 'regex:/^[0-9]{10,15}$/'],
            'school_name' => ['nullable', 'string', 'max:255'],
            'udise_code' => ['required', 'regex:/^[0-9]{11}$/'],
            'state' => ['required', 'string', 'max:120'],
            'district' => ['required', 'string', 'max:120'],
            'zone' => ['required', 'string', 'max:120'],
            'subject' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:2000'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'type' => ['nullable', 'in:general,bug_report,feature_request,support,complaint,appreciation'],
            'category' => ['nullable', 'in:bug,feature,improvement,other'],
            'priority' => ['nullable', 'in:low,medium,high,urgent'],
        ];
    }
}
