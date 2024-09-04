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
        Schema::create('return_item_quantities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('return_booking_item_id')->constrained('return_booking_items')->cascadeOnDelete();
            $table->string('item_name')->nullable();
            $table->integer('quantity')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('return_item_quantities');
    }
};