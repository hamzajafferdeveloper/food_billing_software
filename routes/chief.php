<?php

use App\Http\Controllers\Chief\ChiefController;
use Illuminate\Support\Facades\Route;

Route::prefix('chief/')->name('chief.')->middleware(['auth', 'verified', 'isChief'])->group(function () {
    Route::get('new-order', [ChiefController::class, 'newOrder'])->name('new-order');
    Route::get('get-new-order', [ChiefController::class, 'getNewOrder'])->name('get-new-order');
    Route::get('/get-order-details/{id}', [ChiefController::class, 'getOrderDetails'])->name('get-order-details');
    Route::post('/confirm-order/{id}', [ChiefController::class, 'confirm'])->name('confirm-order');
    Route::post('/decline-order/{id}', [ChiefController::class, 'decline'])->name('decline-order');

    Route::get('/confirm-orders', [ChiefController::class, 'confirmOrder'])->name('confirm-orders');
    Route::get('get-confirmed-order', [ChiefController::class, 'getConfirmOrder'])->name('get-confirmed-order');

    Route::get('/served-order', [ChiefController::class, 'orderServed'])->name('served-order');
    Route::get('/get-served-order', [ChiefController::class, 'getServerdOrder'])->name('get-served-order');
    Route::post('/serve-order/{id}', [ChiefController::class, 'serveOrder'])->name('serve-order');

    Route::post('/update_payment_status/order_id={orderId}', [ChiefController::class, 'updatePaymentStatus'])->name('update_payment_status');
});
