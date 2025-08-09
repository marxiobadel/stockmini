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

    public function unity()
    {
        return $this->belongsTo(Unity::class);
    }

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

    public function orders()
    {
        return $this->belongsToMany(Order::class)->withPivot(['quantity', 'price']);
    }

    public function quantity(): Attribute
    {
        return Attribute::get(fn () => $this->stocks()->sum('quantity_in_stock'));
    }

    public function quantityInStock(): Attribute
    {
        return Attribute::get(function () {
            // Stock total ajouté
            $totalStock = $this->stocks()->sum('quantity_in_stock');

            // Quantité totale vendue (dans toutes les commandes)
            $totalSold = $this->orders()->sum('order_product.quantity');

            return max($totalStock - $totalSold, 0); // éviter les stocks négatifs
        });
    }

    public function specificPrices()
    {
        return $this->hasMany(SpecificPrice::class);
    }
}
