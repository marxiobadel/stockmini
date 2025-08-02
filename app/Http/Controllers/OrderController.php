<?php

namespace App\Http\Controllers;

use App\Http\Resources\ListOrderResource;
use App\Http\Resources\ProductResource;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        return Inertia::render('order/index', [
            'products' => ProductResource::collection(Product::latest()->get()),
            'orders' => ListOrderResource::collection(
                Order::withCount('products')->with('products')->latest()->get()
            )
        ]);
    }

    public function store(Request $request)
    {

    }
}
