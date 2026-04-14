<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
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
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products', 'name')->ignore($this->product?->id),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'category_id' => ['required', 'exists:categories,id'],
            'unity_id' => ['required', 'exists:unities,id'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'purchasing_price' => ['nullable', 'numeric', 'min:0'],
            'threshold_alert' => ['required', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'La catégorie est requise.',
            'category_id.exists' => 'La catégorie sélectionnée est invalide.',
            'unity_id.required' => 'L\'unité est requise.',
            'unity_id.exists' => 'L\'unité sélectionnée est invalide.',
            'selling_price.required' => 'Le prix de vente est requis.',
            'purchasing_price.numeric' => 'Le prix d\'achat doit être un nombre.',
            'threshold_alert.required' => 'Le seuil d\'alerte est requis.',
        ];
    }
}
