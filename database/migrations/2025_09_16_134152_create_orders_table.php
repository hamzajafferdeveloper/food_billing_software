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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            // orders migration
            $table->uuid('customer_id')->nullable();
            $table->foreign('customer_id')
                ->references('unique_id')
                ->on('customers')
                ->nullOnDelete();


            $table->foreignId('card_id')->constrained('carts')->cascadeOnDelete();
            $table->decimal('total_amount');
            $table->enum('payment_status', ['pending', 'completed', 'failed']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
