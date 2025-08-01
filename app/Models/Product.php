<?php

namespace App\Models;

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

    public function stock()
    {
        return $this->hasOne(Stock::class);
    }

    public function movements()
    {
        return $this->hasMany(Movement::class);
    }
}
