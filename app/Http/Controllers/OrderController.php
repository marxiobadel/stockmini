<?php

namespace App\Http\Controllers;

use App\Http\Requests\OrderRequest;
use App\Http\Resources\CustomerResource;
use App\Http\Resources\OrderResource;
use App\Http\Resources\ProductResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class OrderController extends Controller
{
    public function index()
    {
        return Inertia::render('order/index', [
            'orders' => OrderResource::collection(
                Order::withCount('products')->with('products')->latest()->get()
            )
        ]);
    }

    public function create()
    {
        return Inertia::render('order/create', [
            'customers' => CustomerResource::collection(User::latest()->get()),
            'products' => ProductResource::collection(Product::latest()->get()),
        ]);
    }

    public function edit(Order $order)
    {
        $order->load('payments');

        return Inertia::render('order/edit', [
            'order' => new OrderResource($order),
            'customers' => CustomerResource::collection(User::latest()->get()),
            'products' => ProductResource::collection(Product::latest()->get()),
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
        $order->load(['products', 'customer']);

        // Générer le PDF depuis une vue Blade
        $pdf = Pdf::loadView('pdfs.order-ticket', compact('order'))
                    ->setPaper([0, 0, 300.77, 900]);

        // Retourner le PDF en téléchargement ou affichage
        return $pdf->stream('ticket_vente_' . (string) $order->id . '.pdf');
    }

    public function store(OrderRequest $request)
    {
        $validated = $request->validated();
        $customerId = $validated['customer_id'] ?? null;
   
        try {
            DB::beginTransaction();

            // --- Vérifier les stocks ---
            foreach ($validated['product_ids'] as $productId) {
                $product = Product::findOrFail($productId);
                $requestedQty = $validated['product_quantities'][$productId] ?? 1;

                if ($product->quantity_in_stock < $requestedQty) {
                    throw new \Exception(
                        "Stock insuffisant pour le produit : {$product->name}. Stock restant : {$product->quantity_in_stock}, demandé : {$requestedQty}"
                    );
                }
            }

            // --- Créer la commande ---
            $order = Order::create([
                'reference' => 'ORD-' . strtoupper(uniqid()),
                'date' => now(),
                'customer_id' => $customerId,
                'status' => $validated['status'],
            ]);

            // --- Attacher les produits ---
            foreach ($validated['product_ids'] as $productId) {
                $quantity = $validated['product_quantities'][$productId] ?? 1;
                $price = $validated['product_prices'][$productId] ?? 1;

                $order->products()->attach($productId, [
                    'quantity' => $quantity,
                    'price' => $price,
                ]);
            }

            // --- Ajouter les paiements ---
            if (!empty($validated['payments'])) {
                foreach ($validated['payments'] as $payment) {
                    $order->payments()->create([
                        'amount' => $payment['amount'],
                        'payment_date' => $payment['payment_date'] ?? now(),
                        'status' => $payment['status'],
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('orders.index')
                ->with('success', 'La commande a bien été enregistrée.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'error' => 'Erreur lors de la création de la commande: ' . $e->getMessage()
            ]);
        }
    }

    public function update(OrderRequest $request, Order $order)
    {
        $validated = $request->validated();
        $customerId = $validated['customer_id'] ?? null;

        try {
            DB::beginTransaction();

            $syncData = [];

            foreach ($validated['product_ids'] as $productId) {
                $newQuantity = $validated['product_quantities'][$productId] ?? 1;
                $product = Product::with('orders')->findOrFail($productId);

                // Somme des quantités commandées dans d'autres commandes (hors celle-ci)
                $orderedInOtherOrders = $product->orders()
                    ->where('orders.id', '!=', $order->id)
                    ->sum('order_product.quantity');

                $remainingStock = $product->quantity_in_stock - $orderedInOtherOrders;

                if ($remainingStock < $newQuantity) {
                    throw new \Exception("Stock insuffisant pour le produit '{$product->name}'. Stock disponible : {$remainingStock}, demandé : {$newQuantity}");
                }

                $price = $validated['product_prices'][$productId] ?? 1;

                $syncData[$productId] = [
                    'quantity' => $newQuantity,
                    'price' => $price,
                ];
            }

            // Mise à jour de la commande et des produits
            $order->update(['customer_id' => $customerId, 'status' => $validated['status']]);
            $order->products()->sync($syncData);

            // --- Mettre à jour les paiements ---
            if (isset($validated['payments'])) {
                $order->payments()->delete(); // supprimer les anciens paiements
                foreach ($validated['payments'] as $payment) {
                    $order->payments()->create([
                        'amount' => $payment['amount'],
                        'payment_date' => $payment['payment_date'] ?? now(),
                        'status' => $payment['status'],
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('orders.index')
                ->with('success', 'Vente mise à jour avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Erreur lors de la mise à jour : ' . $e->getMessage()]);
        }
    }

    public function destroy(Order $order)
    {
        try {
            DB::beginTransaction();

            // --- Supprimer les paiements liés ---
            $order->payments()->delete();

            // --- Supprimer la relation produits + la commande ---
            $order->products()->detach();
            $order->delete();

            DB::commit();

            return back()->with('success', 'Vente supprimée avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors([
                'error' => 'Erreur lors de la suppression de la vente : ' . $e->getMessage()
            ]);
        }
    }

}
