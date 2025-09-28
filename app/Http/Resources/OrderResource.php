<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'date' => $this->date,
            'amount' => $this->amount,
            'products_count' => $this->products->count(),
            'products' => $this->products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'unity' => [
                        'name' => $product->unity->name,
                    ],
                    'pivot' => [
                        'quantity' => $product->pivot?->quantity ?? 1,
                        'price' => $product->pivot?->price,
                    ],
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'status' => $this->status,
            'customer' => new CustomerResource($this->customer),
        ];
    }
}
