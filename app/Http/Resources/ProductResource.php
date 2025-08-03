<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
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
            'name' => $this->name,
            'description' => $this->description,
            'purchasing_price' => $this->purchasing_price,
            'quantity' => $this->quantity,
            'quantity_in_stock' => $this->quantity_in_stock,
            'selling_price' => $this->selling_price,
            'threshold_alert' => $this->threshold_alert,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'category_id' => $this->category_id,
            'unity_id' => $this->unity_id,
            'category' => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'description' => $this->category->description,
                'created_at' => $this->category->created_at,
                'updated_at' => $this->category->updated_at,
            ],
            'unity' => [
                'id' => $this->unity->id,
                'name' => $this->unity->name,
                'created_at' => $this->unity->created_at,
                'updated_at' => $this->unity->updated_at,
            ],
        ];
    }
}
