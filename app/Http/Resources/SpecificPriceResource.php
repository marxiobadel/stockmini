<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SpecificPriceResource extends JsonResource
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
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'reduction_type' => $this->reduction_type,
            'reduction_value' => $this->reduction_value,
            'from_quantity' => $this->from_quantity,
            'customer_ids' => $this->customers->modelKeys(),
        ];
    }
}
