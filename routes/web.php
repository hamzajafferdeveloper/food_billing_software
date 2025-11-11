<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Artisan;

Route::get('/clear-cache', function () {
    Artisan::call('cache:clear');
    Artisan::call('config:clear');
    Artisan::call('route:clear');
    Artisan::call('view:clear');
    return redirect(route('home'));
})->name('clear.cache');

Route::get('/storage-link', function () {
    Artisan::call('storage:link');
    return redirect()->back()->with('success', 'Storage link created successfully');
})->name('storage.link');

Route::get('/', function () {
    $tables = \App\Models\Table::all();

    $app_url = env('APP_URL', 'localhost:8000');;


    foreach ($tables as $table)
    {
        $table->qr_code = (string) QrCode::size(300)->generate( $app_url . 'table-number=' . $table->table_number);
    }

    return Inertia::render('welcome', [
        'tables' => $tables
    ]);
})->name('home');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
require __DIR__.'/chief.php';
require __DIR__.'/user.php';
