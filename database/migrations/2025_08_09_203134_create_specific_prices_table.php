<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('specific_prices', function (Blueprint $table) {
            $table->id();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->enum('reduction_type', ['percent', 'amount'])->default('amount');
            $table->float('reduction_value');
            $table->integer('from_quantity')->default(1);
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('specific_price_user', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('specific_price_id')->constrained('specific_prices')->cascadeOnDelete();
            $table->primary(['user_id', 'specific_price_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('specific_price_user');
        Schema::dropIfExists('specific_prices');
    }
};
