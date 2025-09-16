<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FoodCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;

class FoodCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Get per_page from query, default to 10
        $perPage = $request->input('per_page', 2);
        $search_query = $request->input('search', '');

        $food_categories = FoodCategory::orderBy('id', 'desc')
            ->when($search_query, function ($query, $search_query) {
                $query->where(function ($q) use ($search_query) {
                    $q->where('name', 'like', "%{$search_query}%");
                });
            })
            ->paginate($perPage)
            ->appends(['per_page' => $perPage]);

        return Inertia::render('admin/food-category/index', [
            'categoriesPagination' => $food_categories,
            'per_page'        => $perPage,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $imagePath = null;

        if ($request->hasFile('image')) {
            // Generate unique file name
            $filename = Str::uuid()->toString() . '.' . $request->file('image')->getClientOriginalExtension();

            // Store the file in "public/food_categories"
            $imagePath = $request->file('image')->storeAs('food_categories', $filename, 'public');
        }

        FoodCategory::create([
            'name'  => $validated['name'],
            'image' => $imagePath, // will be null if no image uploaded
        ]);

        return redirect()->route('admin.food.category.index')
            ->with('success', 'Food Category created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $category = FoodCategory::findOrFail($id);
        $imagePath = $category->image; // keep old image by default

        if ($request->hasFile('image')) {
            // Delete old image if it exists
            if ($category->image && Storage::disk('public')->exists($category->image)) {
                Storage::disk('public')->delete($category->image);
            }

            // Generate unique file name
            $filename = Str::uuid()->toString() . '.' . $request->file('image')->getClientOriginalExtension();

            // Store the file in "public/food_categories"
            $imagePath = $request->file('image')->storeAs('food_categories', $filename, 'public');
        }

        // Update category
        $category->update([
            'name'  => $validated['name'],
            'image' => $imagePath,
        ]);

        return redirect()->route('admin.food.category.index')
            ->with('success', 'Category updated successfully.');
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $category = FoodCategory::findOrFail($id);

        if ($category->image && Storage::disk('public')->exists($category->image)) {
            Storage::disk('public')->delete($category->image);
        }

        $category->delete();

        return redirect()->route('admin.food.category.index')
            ->with('success', 'Category deleted successfully.');
    }
}
