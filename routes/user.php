<?php

use App\Http\Controllers\Customer\CartController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;;
use App\Http\Controllers\Customer\CustomerController;
use App\Http\Controllers\Customer\HomeController;

// Create Customer With Unique Id
Route::get('/table-number={table_number}', [CustomerController::class, 'createCustomer'])->name('customer.table.number');

Route::prefix('/{unique_id}')->name('customer.')->middleware(['isCustomer'])->group(function () {
    Route::get('/home', [HomeController::class, 'home'])->name( 'home');
    Route::get('/food-items', [HomeController::class, 'foodItems'])->name('food.items');
    Route::get('/food-items/load-more', [HomeController::class, 'loadMoreFoodItems']) ->name('foodItems.loadMore');
    Route::get('/food-categories', [HomeController::class, 'foodCategories'])->name('food.categories');
    Route::get('/food-categories/load-more', [HomeController::class, 'loadMoreFoodCategories'])->name('foodCategories.loadMore');
    Route::post('/add-to-cart', [CartController::class, 'addToCart'])->name('add.to.cart');
    Route::get('/get-cart', [CartController::class, 'getCart'])->name('get.cart');
    Route::get('/cart', function (string $unique_id) {
        return Inertia::render('customer/cart', ['uniqueId' => $unique_id]);
    })->name('cart');

    Route::post('/update-cart-item', [CartController::class, 'updateCartItem']);
    Route::post('/remove-from-cart', [CartController::class, 'removeFromCart'])->name('remove.from.cart');
    Route::post('/update-cart-item-quantity', action: [CartController::class, 'updateCartQuantity'])->name('update.cart.quantity');
    Route::get('/checkout/payment_type={payment_type}', [CartController::class, 'checkout'])->name('checkout');
    Route::get('/order-status', [CartController::class, 'getOrderStatus']);
    Route::get('/notification', function (string $unique_id) {
        return Inertia::render('customer/notification', ['uniqueId' => $unique_id]);
    })->name('notification');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('user/dashboard', function () {
        return Inertia::render('user/dashboard');
    })->name('user.dashboard');
});
