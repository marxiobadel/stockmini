<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::query()->withCount('products')->with(['customer', 'products']);

        if ($request->filled('from')) {
            $query->whereDate('date', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->whereDate('date', '<=', $request->to);
        }

        $orders = $query->latest()->get();

        return Inertia::render('dashboard', [
            'filters' => $request->only(['from', 'to', 'preset']),
            'orders' => OrderResource::collection($orders)
        ]);
    }
}
