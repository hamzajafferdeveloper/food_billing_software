<?php

use App\Http\Controllers\Chief\ChiefController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('chief/')->name('chief.')->middleware(['auth', 'verified', 'isChief'])->group(function () {
        Route::get('new-order',[ChiefController::class, 'newOrder'])->name('new-order');
        Route::get('get-new-order', [ChiefController::class, 'getNewOrder'])->name('get-new-order');
});
