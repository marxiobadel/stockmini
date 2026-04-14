<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\SupplierController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('categories', CategoryController::class)->only(['index', 'store', 'update']);
    Route::post('categories/destroy', [CategoryController::class, 'destroy'])->name('categories.destroy');

    Route::resource('suppliers', SupplierController::class)->only(['index', 'store', 'update']);
    Route::post('suppliers/destroy', [SupplierController::class, 'destroy'])->name('suppliers.destroy');

    Route::resource('products', ProductController::class)->only(['index', 'show', 'store', 'update']);
    Route::post('products/destroy', [ProductController::class, 'destroy'])->name('products.destroy');
    Route::post('products/{product}/specific-prices', [ProductController::class, 'storeSpecificPrices'])->name('products.specific-prices.store');

    Route::resource('stocks', StockController::class)->except(['edit', 'create', 'show']);
    Route::post('stocks/destroy', [StockController::class, 'destroy'])->name('stocks.destroy');

    Route::resource('orders', OrderController::class)->except(['destroy']);
    Route::post('orders/destroy', [OrderController::class, 'destroy'])->name('orders.destroy');
    Route::get('orders/{order}/print', [OrderController::class, 'print'])->name('orders.print');

    Route::resource('customers', CustomerController::class)->except(['edit', 'create', 'destroy']);
    Route::post('customers/destroy', [CustomerController::class, 'destroy'])->name('customers.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
