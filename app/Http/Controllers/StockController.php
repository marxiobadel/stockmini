<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Http\Resources\StockResource;
use App\Http\Resources\SupplierResource;
use App\Models\Product;
use App\Models\Stock;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StockController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'page' => ['integer', 'min:1'],
            'per_page' => ['integer', 'min:1', 'max:100'],
            'search' => ['nullable', 'string'],
            'sort' => ['nullable', 'string'],
        ]);

        $query = Stock::with('product');

        if ($request->filled('search')) {
            $query->whereHas('product', function ($q) use ($request) {
                $q->whereAny(['name', 'description'], 'like', '%' . $request->string('search') . '%');
            });
        }

        $query->orderBy('created_at', 'desc');

        $perPage = $request->integer('per_page', 10);
        $stocks = $query->paginate($perPage)->withQueryString();

        return Inertia::render('stocks/index', [
            'stocks' => StockResource::collection($stocks),
            'products' => fn() => ProductResource::collection(Product::oldest('name')->get()),
            'suppliers' => fn() => SupplierResource::collection(Supplier::oldest('name')->get()),
            'filters' => $request->only(['search', 'page', 'sort', 'per_page']),
        ]);
    }

    public function convert(Request $request)
    {
        $validated = $request->validate([
            'source_stock_id' => 'required|exists:stocks,id',
            'source_quantity' => 'required|numeric|min:0.01',
            'destination_product_id' => 'required|exists:products,id',
            'destination_quantity' => 'required|numeric|min:0.01',
        ], [
            'source_stock_id.required' => 'Le stock source est requis.',
            'destination_product_id.required' => 'Le produit de destination est requis.',
        ]);

        DB::transaction(function () use ($validated) {
            // Verrouiller la ligne pour éviter les conflits concurrents (Pessimistic Locking)
            $sourceStock = Stock::lockForUpdate()->findOrFail($validated['source_stock_id']);

            // 1. Vérifier que la quantité est suffisante
            if ($sourceStock->quantity_in_stock < $validated['source_quantity']) {
                throw ValidationException::withMessages([
                    'source_quantity' => "Quantité insuffisante. Il ne reste que {$sourceStock->quantity_in_stock} en stock.",
                ]);
            }

            // 2. Vérifier qu'on ne convertit pas le produit en lui-même
            if ($sourceStock->product_id == $validated['destination_product_id']) {
                throw ValidationException::withMessages([
                    'destination_product_id' => "Le produit de destination doit être différent du produit source.",
                ]);
            }

            // 3. Déduire du stock source
            $sourceStock->quantity_in_stock -= $validated['source_quantity'];
            $sourceStock->save();

            // 4. Ajouter ou créer le stock de destination (en gardant le même fournisseur)
            $destinationStock = Stock::firstOrNew([
                'product_id' => $validated['destination_product_id'],
                'supplier_id' => $sourceStock->supplier_id, // On hérite du fournisseur
            ]);

            // Si c'est un nouveau stock, on s'assure qu'il commence à 0 avant d'ajouter
            if (!$destinationStock->exists) {
                $destinationStock->quantity_in_stock = 0;
            }

            $destinationStock->quantity_in_stock += $validated['destination_quantity'];
            $destinationStock->save();
        });

        // Le redirect() back sera géré par Inertia pour recharger les données
        return back()->with('success', 'Conversion de stock effectuée avec succès.');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'quantity_in_stock' => 'required|integer',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
        ]);

        Stock::create($validated);

        return back()->with('success', 'Stock ajouté avec succès.');
    }

    public function update(Request $request, Stock $stock)
    {
        $validated = $request->validate([
            'quantity_in_stock' => 'required|integer',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'product_id' => 'required|exists:products,id',
        ]);

        $stock->update($validated);

        return back()->with('success', 'Stock modifié avec succès.');
    }

    public function destroy(Request $request)
    {
        try {
            if ($request->has('ids')) {
                $ids = $request->input('ids', []);

                Stock::destroy($ids);
            }

            return back()->with('success', 'Stock(s) supprimé(s) avec succès.');
        } catch (\Exception $e) {
            return back()->with('error', 'Erreur : '.$e->getMessage());
        }
    }
}
