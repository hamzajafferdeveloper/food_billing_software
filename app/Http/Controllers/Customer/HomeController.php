<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\FoodItem;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function home(string $unique_id)
    {
        return Inertia::render('customer/home', [
            'uniqueId' => $unique_id
        ]);
    }

    public function foodItems(string $unique_id)
    {

        $food_items = FoodItem::all();
        return Inertia::render('customer/all-items', [
            'foodItems' => $food_items
        ]);
    }

    public function foodCategories()
    {
        return Inertia::render('customer/all-categories');
    }
}
