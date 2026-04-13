<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'page' => ['integer', 'min:1'],
            'per_page' => ['integer', 'min:1', 'max:100'],
            'search' => ['nullable', 'string'],
            'sort' => ['nullable', 'string'],
        ]);

        $query = Category::query();

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
        $categories = $query->paginate($perPage)->withQueryString();

        return Inertia::render("categories/index", [
            'categories' => CategoryResource::collection($categories)->response()->getData(true),
            'filters' => $request->only(['search', 'page', 'sort', 'per_page']),
        ]);
    }

    // Enregistre une nouvelle catégorie
    public function store(CategoryRequest $request)
    {
        Category::create($request->validated());

        return back()->with('success', 'Catégorie créée avec succès.');
    }

    // Met à jour une catégorie existante
    public function update(CategoryRequest $request, Category $category)
    {
        $category->update($request->validated());

        return redirect()->back()->with('success', 'Catégorie modifiée avec succès.');
    }

    public function destroy(Request $request)
    {
        try {
            if ($request->has('ids')) {
                $ids = $request->input('ids', []);

                Category::destroy($ids);
            }

            return redirect()->back()->with('success', 'Catégorie(s) supprimée(s) avec succès.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erreur : '.$e->getMessage());
        }
    }
}
