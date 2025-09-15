<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified', 'isChief'])->group(function () {
    Route::get('chief/dashboard', function () {
        return Inertia::render('chief/dashboard');
    })->name('chief.dashboard');
});
