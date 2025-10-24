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
        $search_query = $request->input('search', '');

        $categories = FoodCategory::select('id', 'name')->get();

        $food_items = FoodItem::orderBy('id', 'desc')
            ->when($search_query, function ($query, $search_query) {
                $query->where(function ($q) use ($search_query) {
                    $q->where('name', 'like', "%{$search_query}%");
                });
            })
            ->with(['addons', 'extras'])
            ->paginate($perPage)
            ->appends(['per_page' => $perPage]);

        return Inertia::render('admin/food-item/index', [
            'itemsPagination' => $food_items,
            'per_page' => $perPage,
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:food_categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'addons' => 'nullable|string',
            'extras' => 'nullable|string',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $filename = Str::uuid().'.'.$request->file('image')->getClientOriginalExtension();
            $imagePath = $request->file('image')->storeAs('food_items', $filename, 'public');
        }

        $foodItem = FoodItem::create([
            'name' => $validated['name'],
            'price' => $validated['price'],
            'category_id' => $validated['category_id'],
            'image' => $imagePath,
        ]);

        // ✅ Decode JSON into array
        $addons = json_decode($request->addons, true) ?? [];
        $extras = json_decode($request->extras, true) ?? [];

        // ✅ Create individual child rows
        foreach ($addons as $addon) {
            $foodItem->addons()->create($addon);
        }

        foreach ($extras as $extra) {
            $foodItem->extras()->create($extra);
        }

        return redirect()->route('admin.food.item.index')
            ->with('success', 'Food Item created successfully ✅');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $item = FoodItem::findOrFail($id);
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'price' => 'required|numeric|min:0',
                'category_id' => 'required|exists:food_categories,id',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',

                'addons' => 'nullable|string',
                'extras' => 'nullable|string',
            ]);

            // ✅ Update image only if new one uploaded
            if ($request->hasFile('image')) {
                if ($item->image && Storage::disk('public')->exists($item->image)) {
                    Storage::disk('public')->delete($item->image);
                }

                $filename = Str::uuid().'.'.$request->file('image')->getClientOriginalExtension();
                $item->image = $request->file('image')->storeAs('food_items', $filename, 'public');
            }

            // ✅ Update basic fields
            $item->update([
                'name' => $validated['name'],
                'price' => $validated['price'],
                'category_id' => $validated['category_id'],
                'image' => $item->image, // ensures stored image persists
            ]);

            // ✅ Decode JSON → safe fallback to empty array
            $addons = json_decode($request->addons, true) ?? [];
            $extras = json_decode($request->extras, true) ?? [];

            // ✅ Remove old & insert new (hasMany)
            $item->addons()->delete();
            $item->extras()->delete();

            foreach ($addons as $addon) {
                $item->addons()->create($addon);
            }

            foreach ($extras as $extra) {
                $item->extras()->create($extra);
            }

            return back()->with('success', 'Food Item updated ✅');
        } catch (\Exception $e) {
            return back()->with('error', 'Error updating food item: '.$e->getMessage());
        }
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
