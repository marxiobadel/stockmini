<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpecificPrice extends Model
{
    protected $fillable = [
        'start_date',
        'end_date',
        'reduction_type',
        'reduction_value',
        'from_quantity',
        'product_id'
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function customers()
    {
        return $this->belongsToMany(User::class, 'specific_price_user', 'specific_price_id', 'user_id');
    }
}
