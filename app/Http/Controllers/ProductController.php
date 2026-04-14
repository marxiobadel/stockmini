<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
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
        $request->validate([
            'page' => ['integer', 'min:1'],
            'per_page' => ['integer', 'min:1', 'max:100'],
            'search' => ['nullable', 'string'],
            'sort' => ['nullable', 'string'],
        ]);

        $query = Product::with('category');

        if ($request->filled('search')) {
            $query->whereAny(['name', 'description'], 'like', '%' . $request->string('search') . '%');
        }

        $allowed = ['name', 'description', 'created_at', 'updated_at'];
        if ($request->filled('sort')) {
            $sort = $request->string('sort');
            $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
            $column = ltrim($sort, '-');
            if (in_array($column, $allowed)) {
                $query->orderBy($column, $direction);
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = $request->integer('per_page', 10);
        $products = $query->paginate($perPage)->withQueryString();

        return Inertia::render('product/index', [
            'unities' => fn () => Unity::latest()->get(),
            'categories' => fn () => Category::latest()->get(),
            'products' => ProductResource::collection($products)->response()->getData(true),
            'filters' => $request->only(['search', 'page', 'sort', 'per_page']),
        ]);
    }

    public function show(Product $product)
    {
        return Inertia::render('product/show', [
            'customers' => CustomerResource::collection(User::customer()->latest()->get()),
            'product' => $product->toResource(ProductResource::class)
        ]);
    }

    public function store(ProductRequest $request)
    {
        $validated = $request->validated();

        Product::create($validated);

        return back()->with('success', 'Produit ajouté avec succès.');
    }

    public function update(ProductRequest $request, Product $product)
    {
        $validated = $request->validated();

        $product->update($validated);

        return back()->with('success', 'Produit modifié avec succès.');
    }

    public function destroy(Request $request)
    {
        try {
            if ($request->has('ids')) {
                $ids = $request->input('ids', []);

                Product::destroy($ids);
            }

            return back()->with('success', 'Produit(s) supprimé(s) avec succès.');
        } catch (\Exception $e) {
            return back()->with('error', 'Erreur : '.$e->getMessage());
        }
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
