<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\SupplierController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::resource('categories', CategoryController::class)->except(['edit', 'create', 'show']);
    Route::resource('suppliers', SupplierController::class)->except(['edit', 'create', 'show']);
    Route::resource('products', ProductController::class)->except(['edit', 'create', 'show']);
    Route::resource('stocks', StockController::class)->except(['edit', 'create', 'show']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
