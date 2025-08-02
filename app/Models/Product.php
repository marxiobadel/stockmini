<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'description',
        'selling_price',
        'purchasing_price',
        'threshold_alert',
        'category_id',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function suppliers()
    {
        return $this->belongsToMany(Supplier::class);
    }

    public function stocks()
    {
        return $this->hasMany(Stock::class);
    }

    public function quantityInStock(): Attribute
    {
        return new Attribute(
            get: fn () => $this->stocks->sum('quantity_in_stock')
        );
    }

    public function movements()
    {
        return $this->hasMany(Movement::class);
    }
}
