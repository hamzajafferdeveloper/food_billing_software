<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('user/dashboard', function () {
        return Inertia::render('user/dashboard');
    })->name('user.dashboard');
});
