<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Models\Unity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        return Inertia::render('product/index', [
            'unities' => Unity::latest()->get(),
            'categories' => Category::latest()->get(),
            'products' => ProductResource::collection(Product::with('category')->latest()->get())
        ]);
    }

    public function show(Product $product)
    {
        return Inertia::render('product/show', [
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

        return redirect()->back()->with('success', 'Produit ajouté avec succès.');
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
}
