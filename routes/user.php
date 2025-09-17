<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;;
use App\Http\Controllers\Customer\CustomerController;
use App\Http\Controllers\Customer\HomeController;

// Create Customer With Unique Id
Route::get('/table-number={table_number}', [CustomerController::class, 'createCustomer'])->name('customer.table.number');

Route::prefix('/{unique_id}')->name('customer.')->group(function () {
    Route::get('/home', [HomeController::class, 'home'])->name('home');
    Route::get('/food-items', [HomeController::class, 'foodItems'])->name('food.items');
    Route::get('/food-categories', [HomeController::class, 'foodCategories'])->name('food.categories');
});









Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('user/dashboard', function () {
        return Inertia::render('user/dashboard');
    })->name('user.dashboard');
});
