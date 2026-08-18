<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\ComplexCategoryResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function products()
    {
        // On récupère uniquement les catégories qui ont au moins un produit, 
        // avec la relation 'products' chargée pour éviter le problème N+1.
        $categories = Category::has('products')
            ->with(['products', 'products.stocks', 'products.orders'])
            ->get();

        return Inertia::render('reports/products', [
            'categories' => ComplexCategoryResource::collection($categories),
        ]);
    }

    /**
     * Affiche le rapport des commandes avec filtre de dates.
     */
    public function orders(Request $request)
    {
        // On initialise la requête en chargeant la relation client
        $query = Order::with('customer');

        // Application du filtre de date de début si présent
        if ($request->filled('start_date')) {
            $query->whereDate('date', '>=', $request->start_date);
        }

        // Application du filtre de date de fin si présent
        if ($request->filled('end_date')) {
            $query->whereDate('date', '<=', $request->end_date);
        }

        // On exécute la requête en triant par date décroissante
        $orders = $query->orderBy('date', 'desc')->get();

        // Calcul des statistiques (résumé)
        $summary = [
            'total_paid' => $orders->sum(function ($order) {
                return $order->payments()->where('status', 'paid')->sum('amount');
            }), 
            'total_revenue' => $orders->sum('amount'), // Somme du montant total des commandes
            'orders_count' => $orders->count(),        // Nombre total de commandes sur la période
        ];

        return Inertia::render('reports/orders', [
            'orders' => OrderResource::collection($orders),
            'filters' => $request->only(['start_date', 'end_date']),
            'summary' => $summary,
        ]);
    }
}
