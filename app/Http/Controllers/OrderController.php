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
            'customers' => CustomerResource::collection(User::latest()->get()),
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
    }

    public function store(OrderRequest $request)
    {
        $validated = $request->validated();

        $customerId = $validated['customer_id'] ?? null;

        try {
            DB::beginTransaction();

            // Vérifier les stocks
            foreach ($validated['product_ids'] as $productId) {
                $product = Product::findOrFail($productId);
                $requestedQty = $validated['product_quantities'][$productId] ?? 1;

                if ($product->quantity_in_stock < $requestedQty) {
                    throw new \Exception("Stock insuffisant pour le produit : {$product->name}. Stock restant : {$product->quantity_in_stock}, demandé : {$requestedQty}");
                }
            }

            // Créer la commande
            $order = Order::create([
                'reference' => 'ORD-' . strtoupper(uniqid()),
                'date' => now(),
                'customer_id' => $customerId,
            ]);

            // Attacher les produits avec quantités et prix spécifiques
            foreach ($validated['product_ids'] as $productId) {
                $quantity = $validated['product_quantities'][$productId] ?? 1;

                $product = Product::findOrFail($productId);

                $price = $product->selling_price;

                $specificPriceQuery = $product->specificPrices()
                    ->whereDate('start_date', '<=', now())
                    ->where(function ($q) {
                        $q->whereNull('end_date')->orWhere('end_date', '>=', now());
                    });

                if ($customerId) {
                    $specificPriceQuery->where(function ($q) use ($customerId) {
                        $q->whereHas('customers', function ($q2) use ($customerId) {
                            $q2->where('users.id', $customerId);
                        })->orWhereDoesntHave('customers');
                    });
                } else {
                    $specificPriceQuery->whereDoesntHave('customers');
                }

                $specificPrice = $specificPriceQuery->first();

                if ($specificPrice) {
                    if ($specificPrice->reduction_type === 'percent') {
                        $price = $product->selling_price * (1 - $specificPrice->reduction_value / 100);
                    } elseif ($specificPrice->reduction_type === 'amount') {
                        $price = max(0, $product->selling_price - $specificPrice->reduction_value);
                    }
                }

                $order->products()->attach($productId, [
                    'quantity' => $quantity,
                    'price' => $price,
                ]);
            }

            DB::commit();

            return redirect()->route('orders.index')->with('success', 'La commande a bien été enregistrée.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Erreur lors de la création de la commande: ' . $e->getMessage()]);
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

                // Calcul du stock disponible
                $remainingStock = $product->quantity - $orderedInOtherOrders;

                if ($remainingStock < $newQuantity) {
                    throw new \Exception("Stock insuffisant pour le produit '{$product->name}'. Stock disponible : {$remainingStock}, demandé : {$newQuantity}");
                }

                // Prix spécifique selon client ou global
                $price = $product->selling_price;

                $specificPriceQuery = $product->specificPrices()
                    ->whereDate('start_date', '<=', now())
                    ->where(function ($q) {
                        $q->whereNull('end_date')->orWhere('end_date', '>=', now());
                    });

                if ($customerId) {
                    $specificPriceQuery->where(function ($q) use ($customerId) {
                        $q->whereHas('customers', function ($q2) use ($customerId) {
                            $q2->where('users.id', $customerId);
                        })->orWhereDoesntHave('customers');
                    });
                } else {
                    $specificPriceQuery->whereDoesntHave('customers');
                }

                $specificPrice = $specificPriceQuery->first();

                if ($specificPrice) {
                    if ($specificPrice->reduction_type === 'percent') {
                        $price = $product->selling_price * (1 - $specificPrice->reduction_value / 100);
                    } elseif ($specificPrice->reduction_type === 'amount') {
                        $price = max(0, $product->selling_price - $specificPrice->reduction_value);
                    }
                }

                $syncData[$productId] = [
                    'quantity' => $newQuantity,
                    'price' => $price,
                ];
            }

            $order->update(['customer_id' => $customerId]);
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
