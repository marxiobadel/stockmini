<?php

namespace App\Http\Controllers;

use App\Http\Resources\OrderResource;
use App\Http\Resources\ProductResource;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class OrderController extends Controller
{
    public function index()
    {
        return Inertia::render('order/index', [
            'products' => ProductResource::collection(Product::latest()->get()),
            'orders' => OrderResource::collection(
                Order::withCount('products')->with('products')->latest()->get()
            )
        ]);
    }

    public function show(Order $order)
    {
        return Inertia::render('order/show', [
            'order' => $order->toResource(OrderResource::class)
        ]);
    }

    public function print(Order $order)
    {
        // Charger les relations nécessaires (par ex: products)
        $order->load('products');

        // Générer le PDF depuis une vue Blade
        $pdf = Pdf::loadView('pdfs.order-ticket', compact('order'));

        // Retourner le PDF en téléchargement ou affichage
        return $pdf->stream('ticket_vente_' . (string) $order->id . '.pdf');
        // ou pour forcer le téléchargement :
        // return $pdf->download('ticket_vente_'.$order->id.'.pdf');
    }

    public function store(Request $request)
    {
        // 1. Valider les données
        $validated = $request->validate([
            'product_ids' => 'required|array|min:1',
            'product_ids.*' => 'exists:products,id',
            'product_quantities' => 'required|array',
            'product_quantities.*' => 'integer|min:1',
        ]);

        try {
            DB::beginTransaction();

            foreach ($validated['product_ids'] as $productId) {
                $product = Product::findOrFail($productId);
                $requestedQty = $validated['product_quantities'][$productId] ?? 1;

                if ($product->quantity_in_stock < $requestedQty) {
                    throw new \Exception("Stock insuffisant pour le produit : {$product->name}.
                    Stock restant : {$product->quantity_in_stock}, demandé : {$requestedQty}");
                }
            }

            // 2. Créer la commande
            $order = Order::create([
                'reference' => 'ORD-' . strtoupper(uniqid()),
                'date' => now(),
            ]);


            // 3. Attacher les produits avec leurs quantités
            foreach ($validated['product_ids'] as $productId) {
                $quantity = $validated['product_quantities'][$productId] ?? 1;

                $product = Product::findOrFail($productId);

                $order->products()->attach($productId, [
                    'quantity' => $quantity,
                    'price' => $product->selling_price,
                ]);
            }

            DB::commit();

            return redirect()->route('orders.index')
                ->with('success', 'La commande a bien été enregistrée.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Erreur lors de la création de la commande: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, Order $order)
    {
        // Valider la requête
        $validated = $request->validate([
            'product_ids' => ['required', 'array'],
            'product_ids.*' => ['integer', 'exists:products,id'],
            'product_quantities' => ['required', 'array'],
            'product_quantities.*' => ['integer', 'min:1'],
        ]);

        try {
            DB::beginTransaction();

            $syncData = [];

            foreach ($validated['product_ids'] as $productId) {
                $newQuantity = $validated['product_quantities'][$productId] ?? 1;

                $product = Product::with('orders')->findOrFail($productId);

                // Quantité déjà réservée par cette commande
                $oldQuantity = $order->products()
                    ->where('product_id', '=', $productId)
                    ->first()
                    ?->pivot
                        ?->quantity ?? 0;

                // Calculer le stock total commandé par d'autres commandes (hors celle-ci)
                $orderedInOtherOrders = $product->orders()
                    ->where('orders.id', '!=', $order->id)
                    ->sum('order_product.quantity');

                // Stock restant = stock total - autres commandes + quantité déjà prise par cette commande
                $remainingStock = $product->stocks->sum('quantity_in_stock') - $orderedInOtherOrders + $oldQuantity;

                if ($newQuantity > $remainingStock) {
                    throw new \Exception("Stock insuffisant pour le produit '{$product->name}'.
                    Stock disponible : {$remainingStock}, demandé : {$newQuantity}");
                }

                $syncData[$productId] = [
                    'quantity' => $newQuantity,
                    'price' => $product->selling_price,
                ];
            }

            $order->products()->sync($syncData);

            DB::commit();
            return back()->with('success', 'Vente mise à jour avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Erreur lors de la mise à jour : ' . $e->getMessage()]);
        }
    }

    public function destroy(Order $order)
    {
        $order->delete();

        return back()->with('success', 'Vente supprimée avec succès.');
    }
}
