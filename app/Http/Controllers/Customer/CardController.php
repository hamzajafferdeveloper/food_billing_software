<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\FoodItem;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CardController extends Controller
{
    public function addToCart(Request $request, string $unique_id)
    {
        $validated = $request->validate([
            'food_item_id' => 'required|integer|exists:food_items,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = Cart::firstOrCreate(['customer_id' => $unique_id], ['cart_items' => []]);

        $items = $cart->cart_items ?? [];

        // check if already exists
        $index = collect($items)->search(fn ($i) => $i['food_item_id'] == $validated['food_item_id']);

        if ($index !== false) {
            $items[$index]['quantity'] += $validated['quantity'];
        } else {
            $items[] = [
                'food_item_id' => $validated['food_item_id'],
                'quantity' => $validated['quantity'],
            ];
        }

        $cart->update(['cart_items' => $items]);

        return back();
    }

    public function removeFromCart(Request $request, string $unique_id)
    {
        $validated = $request->validate([
            'food_item_id' => 'required|integer|exists:food_items,id',
        ]);

        $cart = Cart::where('customer_id', $unique_id)->firstOrFail();

        $items = collect($cart->cart_items)->reject(fn ($i) => $i['food_item_id'] == $validated['food_item_id'])->values();

        $cart->update(['cart_items' => $items]);

        return response()->json(['message' => 'Item removed', 'cart' => $cart]);
    }

    public function getCart(string $unique_id)
    {

        $cart = Cart::where('customer_id', $unique_id)->first();

        // hydrate with food details
        $items = collect($cart->cart_items ?? [])->map(function ($item) {
            $food = FoodItem::find($item['food_item_id']);

            return [
                'id' => $food->id,
                'name' => $food->name,
                'price' => $food->price,
                'image' => $food->image,
                'quantity' => $item['quantity'],
                'subtotal' => $food->price * $item['quantity'],
            ];
        });

        return response()->json([
            'items' => $items,
            'total' => $items->sum('subtotal'),
        ]);
    }

    public function checkout(Request $request, string $unique_id)
    {
        $cart = Cart::where('customer_id', $unique_id)->first();

        $items = collect($cart->cart_items ?? [])->map(function ($item) {
            $food = FoodItem::find($item['food_item_id']);

            return [
                'id' => $food->id,
                'name' => $food->name,
                'price' => $food->price,
                'image' => $food->image,
                'quantity' => $item['quantity'],
                'subtotal' => $food->price * $item['quantity'],
            ];
        });

        $order = Order::create([
            'customer_id' => $cart->customer_id,
            'card_id' => $cart->id,
            'total_amount' => $items->sum('subtotal'),
            'payment_status' => 'pending',
        ]);

        return Inertia::render('customer/checkout', [
            'order' => $order,
            'uniqueId' => $unique_id,
        ]);

    }
}
