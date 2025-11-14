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
        Schema::table('room_bills', function (Blueprint $table) {
            $table->foreignId('room_booking_id')->nullable()->constrained('room_bookings')->nullOnDelete()->after('guest_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('room_bills', function (Blueprint $table) {
            //
        });
    }
};
