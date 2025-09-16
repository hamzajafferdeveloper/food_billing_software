<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FoodItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard(Request $request){

        $per_page = $request->input('per_page', 10);

        $food_items = FoodItem::orderBy('id', 'desc')
            ->paginate($per_page)
            ->appends(['per_page', $per_page]);

        return Inertia::render('admin/dashboard', [
            'ItemsPagination' => $food_items
        ]);
    }
}
