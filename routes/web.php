<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

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
