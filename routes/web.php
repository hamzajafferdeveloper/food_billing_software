<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

Route::get('/', function () {
    $qrCode = QrCode::size(300)->generate('Hello, Laravel 11!');
    return $qrCode;
})->name('home');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
require __DIR__.'/chief.php';
require __DIR__.'/user.php';
