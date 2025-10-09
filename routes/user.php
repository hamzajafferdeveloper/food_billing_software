<?php

use App\Http\Controllers\Customer\CardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;;
use App\Http\Controllers\Customer\CustomerController;
use App\Http\Controllers\Customer\HomeController;

// Create Customer With Unique Id
Route::get('/table-number={table_number}', [CustomerController::class, 'createCustomer'])->name('customer.table.number');

Route::prefix('/{unique_id}')->name('customer.')->middleware(['isCustomer'])->group(function () {
    Route::get('/home', [HomeController::class, 'home'])->name( 'home');
    Route::get('/food-items', [HomeController::class, 'foodItems'])->name('food.items');
    Route::get('/food-categories', [HomeController::class, 'foodCategories'])->name('food.categories');
    Route::post('/add-to-cart', [CardController::class, 'addToCart'])->name('add.to.cart');
    Route::get('/get-cart', [CardController::class, 'getCart'])->name('get.cart');
    Route::get('/cart', function (string $unique_id) {
        return Inertia::render('customer/cart', ['uniqueId' => $unique_id]);
    })->name('cart');
    
    Route::post('/remove-from-cart', [CardController::class, 'removeFromCart'])->name('remove.from.cart');
    Route::post('/update-cart-item-quantity', [CardController::class, 'updateCartQuantity'])->name('update.cart.quantity');
    Route::get('/checkout', [CardController::class, 'checkout'])->name('checkout');
    Route::get('/order-status', [CardController::class, 'getOrderStatus']);
    Route::get('/notification', function (string $unique_id) {
        return Inertia::render('customer/notification', ['uniqueId' => $unique_id]);
    });
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('user/dashboard', function () {
        return Inertia::render('user/dashboard');
    })->name('user.dashboard');
});
