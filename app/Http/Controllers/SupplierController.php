<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'page' => ['integer', 'min:1'],
            'per_page' => ['integer', 'min:1', 'max:100'],
            'search' => ['nullable', 'string'],
            'sort' => ['nullable', 'string'],
        ]);

        $query = Supplier::query();

        if ($request->filled('search')) {
            $query->whereAny(['name', 'phone', 'address'], 'like', '%' . $request->string('search') . '%');
        }

        $allowed = ['name', 'phone', 'address', 'created_at', 'updated_at'];
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
        $suppliers = $query->paginate($perPage)->withQueryString();

        return Inertia::render("suppliers/index", [
            'suppliers' => SupplierResource::collection($suppliers)->response()->getData(true),
            'filters' => $request->only(['search', 'page', 'sort', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:suppliers,name',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
        ]);

        Supplier::create($validated);

        return back()->with('success', 'Fournisseur ajouté avec succès.');
    }

    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:suppliers,name,' . $supplier->id,
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
        ]);

        $supplier->update($validated);

        return back()->with('success', 'Fournisseur modifié avec succès.');
    }

    public function destroy(Request $request)
    {
        try {
            if ($request->has('ids')) {
                $ids = $request->input('ids', []);

                Supplier::destroy($ids);
            }

            return redirect()->back()->with('success', 'Fournisseur(s) supprimé(s) avec succès.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Erreur : ' . $e->getMessage());
        }
    }
}
