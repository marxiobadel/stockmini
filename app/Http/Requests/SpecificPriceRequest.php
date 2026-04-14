<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SpecificPriceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'specific_prices' => 'required|array',
            'specific_prices.*.id' => 'nullable|integer|exists:specific_prices,id',
            'specific_prices.*.start_date' => 'nullable|date',
            'specific_prices.*.end_date' => 'nullable|date|after_or_equal:specific_prices.*.start_date',
            'specific_prices.*.reduction_type' => 'required|in:percent,amount',
            'specific_prices.*.reduction_value' => 'required|numeric|min:0',
            'specific_prices.*.from_quantity' => 'required|integer|min:1',
            'specific_prices.*.customer_ids' => 'nullable|array',
            'specific_prices.*.customer_ids.*' => 'integer|exists:users,id',
        ];
    }

    public function messages(): array
    {
        return [
            'specific_prices.required' => 'Les prix spécifiques sont requis.',
            'specific_prices.*.reduction_type.required' => 'Le type de réduction est requis.',
            'specific_prices.*.reduction_type.in' => 'Le type de réduction doit être "percent" ou "amount".',
            'specific_prices.*.reduction_value.required' => 'La valeur de réduction est requise.',
            'specific_prices.*.reduction_value.numeric' => 'La valeur de réduction doit être un nombre.',
            'specific_prices.*.reduction_value.min' => 'La valeur de réduction doit être au moins 0.',
            'specific_prices.*.from_quantity.required' => 'La quantité minimale est requise.',
            'specific_prices.*.from_quantity.integer' => 'La quantité minimale doit être un entier.',
            'specific_prices.*.from_quantity.min' => 'La quantité minimale doit être au moins 1.',
        ];
    }
}
