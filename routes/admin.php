<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\FoodCategoryController;
use App\Http\Controllers\Admin\FoodItemController;
use App\Http\Controllers\Admin\TableController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\WaiterController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin/')->middleware(['auth', 'verified', 'isAdmin'])->name('admin.')->group(function () {
    Route::get('dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('reports/sale', [AdminController::class, 'SaleReports'])->name('reports.sale');
    Route::get('reports/items', [AdminController::class, 'itemReports'])->name('reports.items');

    Route::prefix('/settings')->group(function () {
        Route::get('/', [AdminController::class, 'settings'])->name('settings');
        Route::post('/update', [AdminController::class, 'updateSettings'])->name('settings.update');

    });

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
        Route::post('store', [FoodItemController::class, 'store'])->name('store');
        Route::put('update/{id}', [FoodItemController::class, 'update'])->name('update');
        Route::delete('delete/{id}', [FoodItemController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('waiter/')->name('waiter.')->group(function () {
        Route::get('all', [WaiterController::class, 'index'])->name('index');
        Route::get('{id}', [WaiterController::class, 'show'])->name('single');
        Route::post('store', [WaiterController::class, 'store'])->name('store');
        Route::put('update/{id}', [WaiterController::class, 'update'])->name('update');
        Route::delete('delete/{id}', [WaiterController::class, 'destroy'])->name('destroy');
    });

    // User Routes
    Route::prefix('user/')->name('user.')->group(function () {
        Route::get('all', [UserController::class, 'index'])->name('index');
        Route::get('{id}', [UserController::class, 'show'])->name('single');
        Route::post('store', [UserController::class, 'store'])->name('store');
        Route::put('update/{id}', [UserController::class, 'update'])->name('update');
        Route::delete('delete/{id}', [UserController::class, 'destroy'])->name('destroy');
    });

    // Tables Routes
    Route::prefix('tables/')->name('table.')->group(function () {
        Route::get('all', [TableController::class, 'index'])->name('index');
        Route::get('{id}', [TableController::class, 'show'])->name('single');
        Route::post('store', [TableController::class, 'store'])->name('store');
        Route::put('update/{id}', [TableController::class, 'update'])->name('update');
        Route::delete('delete/{id}', [TableController::class, 'destroy'])->name('destroy');
    });
});
