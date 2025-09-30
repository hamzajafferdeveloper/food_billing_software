<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\FoodCategory;
use App\Models\FoodItem;
use Inertia\Inertia;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function home(string $unique_id)
    {
        $food_items = FoodItem::paginate(12);

        return Inertia::render('customer/home', [
            'uniqueId' => $unique_id,
            'foodItems' => $food_items,
        ]);
    }

    public function foodItems(Request $request, string $unique_id)
    {
        $searched_category = $request->input('category');

        // Find category by name
        $category = FoodCategory::where('name', $searched_category)->first();

        $food_items = FoodItem::when($category, function ($query, $category) {
            $query->where('category_id', $category->id);
        })->paginate(12)->withQueryString();

        return Inertia::render('customer/all-items', [
            'uniqueId' => $unique_id,
            'foodItems' => $food_items,
        ]);
    }

    public function foodCategories(string $unique_id)
    {
        $food_categories = FoodCategory::all();
        return Inertia::render('customer/all-categories', [
            'uniqueId' => $unique_id,
            'foodCategories' => $food_categories
        ]);
    }
}
