<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ComplexCategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        if ($this->resource === null) {
            return [];
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'products' => $this->products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'purchasing_price' => $product->purchasing_price,
                    'quantity' => $product->quantity,
                    'quantity_in_stock' => $product->quantity_in_stock,
                    'selling_price' => $product->selling_price,
                    'threshold_alert' => $product->threshold_alert,
                    'unity' => [
                        'id' => $product->unity->id,
                        'name' => $product->unity->name,
                        'created_at' => $product->unity->created_at,
                        'updated_at' => $product->unity->updated_at,
                    ],
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
