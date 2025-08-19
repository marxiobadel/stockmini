<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\CustomerResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Models\Unity;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category');
        if ($request->filled('sort') && $request->filled('direction')) {
            $query->orderBy($request->sort, $request->direction);
        } else {
            $query->latest();
        }

        if ($request->filled('search')) {
            $query->whereAny(['name', 'description'], 'like', '%' . $request->search . '%');
        }

        $products = $query->paginate(3)->withQueryString();

        return Inertia::render('product/index', [
            'unities' => Unity::latest()->get(),
            'categories' => Category::latest()->get(),
            'products' => ProductResource::collection($products)->response()->getData(true),
        ]);
    }

    public function show(Product $product)
    {
        return Inertia::render('product/show', [
            'customers' => CustomerResource::collection(User::customer()->latest()->get()),
            'product' => $product->toResource(ProductResource::class)
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:products,name',
            'description' => 'nullable|string|max:1000',
            'selling_price' => 'required|numeric',
            'purchasing_price' => 'nullable|numeric',
            'threshold_alert' => 'required|integer',
            'category_id' => 'required|exists:categories,id',
            'unity_id' => 'required|exists:unities,id',
        ]);

        Product::create($validated);

        return redirect()->route('products.index', ['page' => 1])
                        ->with('success', 'Produit ajouté avec succès.');
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:products,name,' . $product->id,
            'description' => 'nullable|string|max:1000',
            'selling_price' => 'required|numeric',
            'purchasing_price' => 'nullable|numeric',
            'threshold_alert' => 'required|integer',
            'category_id' => 'required|exists:categories,id',
            'unity_id' => 'required|exists:unities,id',
        ]);

        $product->update($validated);

        return redirect()->back()->with('success', 'Produit modifié avec succès.');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->back()->with('success', 'Produit supprimé avec succès.');
    }

    public function storeSpecificPrices(Request $request, Product $product)
    {
        $data = $request->validate([
            'specific_prices' => 'required|array',
            'specific_prices.*.id' => 'nullable|integer|exists:specific_prices,id',
            'specific_prices.*.start_date' => 'nullable|date',
            'specific_prices.*.end_date' => 'nullable|date|after_or_equal:specific_prices.*.start_date',
            'specific_prices.*.reduction_type' => 'required|in:percent,amount',
            'specific_prices.*.reduction_value' => 'required|numeric|min:0',
            'specific_prices.*.from_quantity' => 'required|integer|min:1',
            'specific_prices.*.customer_ids' => 'nullable|array',
            'specific_prices.*.customer_ids.*' => 'integer|exists:users,id',
        ]);

        $inputPrices = $data['specific_prices'];

        // Récupérer les IDs existants liés au produit
        $existingIds = $product->specificPrices()->pluck('id')->toArray();

        $submittedIds = collect($inputPrices)
            ->pluck('id')
            ->filter()
            ->map(fn($id) => (int) $id)
            ->toArray();

        // Supprimer les prix spécifiques supprimés par l'utilisateur
        $idsToDelete = array_diff($existingIds, $submittedIds);
        if (count($idsToDelete) > 0) {
            $product->specificPrices()->whereIn('id', $idsToDelete)->delete();
        }

        foreach ($inputPrices as $price) {
            $price['customer_ids'] ??= [];

            if (isset($price['id'])) {
                $specificPrice = $product->specificPrices()->find($price['id']);
                if ($specificPrice) {
                    $specificPrice->update([
                        'start_date' => Carbon::parse($price['start_date'])->format('Y-m-d'),
                        'end_date' => $price['end_date'] ? Carbon::parse($price['end_date'])->format('Y-m-d') : null,
                        'reduction_type' => $price['reduction_type'],
                        'reduction_value' => $price['reduction_value'],
                        'from_quantity' => $price['from_quantity'],
                    ]);

                    $specificPrice->customers()->sync($price['customer_ids']);
                }
            } else {
                $product->specificPrices()->create([
                    'start_date' => Carbon::parse($price['start_date'])->format('Y-m-d'),
                    'end_date' => $price['end_date'] ? Carbon::parse($price['end_date'])->format('Y-m-d') : null,
                    'reduction_type' => $price['reduction_type'],
                    'reduction_value' => $price['reduction_value'],
                    'from_quantity' => $price['from_quantity'],
                ])->customers()->sync($price['customer_ids'] ?? []);
            }
        }

        return back()->with('success', 'Prix spécifiques enregistrés.');
    }
}
