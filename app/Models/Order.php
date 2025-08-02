<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'customer_id',
        'date',
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class)->withPivot(['quantity', 'price']);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function amount(): Attribute
    {
        return new Attribute(
            get: fn() => $this->products->sum(fn ($product) => $product->pivot->price * $product->pivot->quantity)
        );
    }
}
