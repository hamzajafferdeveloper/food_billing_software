<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FoodCategory;
use App\Models\FoodItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class FoodItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Get per_page from query, default to 10
        $perPage = $request->input('per_page', 10);

        $categories = FoodCategory::select('id', 'name')->get();

        $food_items = FoodItem::orderBy('id', 'desc')
            ->paginate($perPage)
            ->appends(['per_page' => $perPage]);

        return Inertia::render('admin/food-item/index', [
            'ItemsPagination' => $food_items,
            'per_page'        => $perPage,
            'categories' => $categories
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'price'       => 'required|numeric|min:0',
            'category_id' => 'required|exists:food_categories,id',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $imagePath = null;

        if ($request->hasFile('image')) {
            // Generate unique file name
            $filename = Str::uuid()->toString() . '.' . $request->file('image')->getClientOriginalExtension();

            // Store the file in "public/food_categories"
            $imagePath = $request->file('image')->storeAs('food_item', $filename, 'public');
        }

        FoodItem::create([
            'name'  => $validated['name'],
            'price' => $validated['price'],
            'category_id' => $validated['category_id'],
            'image' => $imagePath, // will be null if no image uploaded
        ]);

        return redirect()->route('admin.food.item.index')
            ->with('success', 'Food Category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'price'       => 'required|numeric|min:0',
            'category_id' => 'required|exists:food_categories,id',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $category = FoodItem::findOrFail($id);
        $imagePath = $category->image;

        if ($request->hasFile('image')) {
            // Delete old image if it exists
            if ($category->image && Storage::disk('public')->exists($category->image)) {
                Storage::disk('public')->delete($category->image);
            }

            // Generate unique file name
            $filename = Str::uuid()->toString() . '.' . $request->file('image')->getClientOriginalExtension();

            // Store the file in "public/food_categories"
            $imagePath = $request->file('image')->storeAs('food_item', $filename, 'public');
        }

        $category->update([
            'name'  => $validated['name'],
            'price' => $validated['price'],
            'category_id' => $validated['category_id'],
            'image' => $imagePath, // will be null if no image uploaded
        ]);

        return redirect()->route('admin.food.item.index')
            ->with('success', 'Food Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $category = FoodItem::findOrFail($id);

        if ($category->image && Storage::disk('public')->exists($category->image)) {
            Storage::disk('public')->delete($category->image);
        }

        $category->delete();

        return redirect()->route('admin.food.item.index')
            ->with('success', 'Category deleted successfully.');
    }
}
