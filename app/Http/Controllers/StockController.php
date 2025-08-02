<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Http\Resources\StockResource;
use App\Http\Resources\SupplierResource;
use App\Models\Product;
use App\Models\Stock;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockController extends Controller
{
    public function index()
    {
        return Inertia::render('stocks', [
            'stocks' => StockResource::collection(Stock::latest()->get()),
            'products' => ProductResource::collection(Product::latest()->get()),
            'suppliers' => SupplierResource::collection(Supplier::latest()->get())
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'quantity_in_stock' => 'required|integer',
            'supplier_id' => 'required|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
        ]);

        Stock::create($validated);

        return redirect()->back()->with('success', 'Stock ajouté avec succès.');
    }

    public function update(Request $request, Stock $stock)
    {
        $validated = $request->validate([
            'quantity_in_stock' => 'required|integer',
            'supplier_id' => 'required|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
        ]);

        $stock->update($validated);

        return redirect()->back()->with('success', 'Stock modifié avec succès.');
    }

    public function destroy(Stock $stock)
    {
        $stock->delete();

        return redirect()->back()->with('success', 'Stock supprimé avec succès.');
    }
}
