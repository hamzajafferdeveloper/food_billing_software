<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\FoodCategoryController;
use App\Http\Controllers\Admin\FoodItemController;
use App\Http\Controllers\Admin\UserController;

Route::prefix('admin/')->middleware(['auth', 'verified', 'isAdmin'])->name('admin.')->group(function() {
    Route::get('dashboard', [AdminController::class, 'dashboard'])->name('dashboard');

    // Food Category Routes
    Route::prefix('food-category/')->name('food.category.')->group(function () {
        Route::get('all', [FoodCategoryController::class, 'index'])->name('index');
        Route::post('store', [FoodCategoryController::class, 'store'])->name('store');
        Route::put('update/{id}', [FoodCategoryController::class, 'update'])->name('update');
        Route::delete('delete/{id}', [FoodCategoryController::class, 'destroy'])->name('destroy');
    });

    // Food Item Routes
    Route::prefix('food-item/')->name('food.item.')->group(function () {
        Route::get('all', [FoodItemController::class, 'index'])->name('index');
        Route::get('{id}', [FoodItemController::class, 'show'])->name('single');
        Route::post('store', [FoodItemController::class, 'store'])->name('store');
        Route::put('update/{id}', [FoodItemController::class, 'update'])->name('update');
        Route::delete('delete/{id}', [FoodItemController::class, 'destroy'])->name('destroy');
    });

    // User Routes
    Route::prefix('user/')->name('user.')->group(function () {
        Route::get('all', [UserController::class, 'index'])->name('index');
        Route::get('{id}', [UserController::class, 'show'])->name('single');
        Route::post('store', [UserController::class, 'store'])->name('store');
        Route::put('update/{id}', [UserController::class, 'update'])->name('update');
        Route::delete('delete/{id}', [UserController::class, 'destroy'])->name('destroy');
    });
});
