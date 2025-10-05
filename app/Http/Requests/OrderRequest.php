<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrderRequest extends FormRequest
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
    public function rules()//: array
    {
        return [
            // --- Informations générales ---
            'customer_id' => 'nullable|exists:users,id',
            'status' => 'required|in:paid,pending,partial',

            // --- Produits ---
            'product_ids' => 'required|array|min:1',
            'product_ids.*' => 'integer|exists:products,id',
            'product_quantities' => 'required|array',
            'product_quantities.*' => 'integer|min:1',
            'product_prices' => 'required|array',
            'product_prices.*' => 'numeric|min:0',

            // --- Paiements multiples ---
            'payments' => 'nullable|array',
            'payments.*.amount' => 'required|numeric|min:0',
            'payments.*.payment_date' => 'nullable|date',
            'payments.*.status' => 'required|in:pending,paid',
        ];
    }

    /**
     * Personnalise les messages d’erreur.
     */
    public function messages(): array
    {
        return [
            'status.in' => 'Le statut doit être "paid", "pending" ou "partial".',
            'product_ids.required' => 'Veuillez sélectionner au moins un produit.',
            'product_quantities.*.min' => 'La quantité doit être au moins de 1.',
            'product_prices.*.min' => 'Le prix doit être supérieur ou égal à 0.',
            'payments.*.amount.required' => 'Chaque paiement doit avoir un montant.',
            'payments.*.status.required' => 'Chaque paiement doit avoir un statut.',
        ];
    }
}
