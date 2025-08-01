<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // Affiche la liste des catégories
    public function index()
    {
        // On récupère toutes les catégories triées par date de création décroissante
        return Inertia::render('categories', [
            'categories' => Category::latest()->get()
        ]);
    }

    // Enregistre une nouvelle catégorie
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:categories,name',
            'description' => 'nullable|string|max:1000',
        ]);

        Category::create($validated);

        return redirect()->back()->with('success', 'Catégorie ajoutée avec succès.');
    }

    // Met à jour une catégorie existante
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:categories,name,' . $category->id,
            'description' => 'nullable|string|max:1000',
        ]);

        $category->update($validated);

        return redirect()->back()->with('success', 'Catégorie modifiée avec succès.');
    }

    // Supprime une catégorie
    public function destroy(Category $category)
    {
        if ($category->products->isNotEmpty()) {
            return redirect()->back()->with('warning', 'Merci de supprimer avant tous les produits de cette catégorie.');
        }

        $category->delete();

        return redirect()->back()->with('success', 'Catégorie supprimée avec succès.');
    }
}
