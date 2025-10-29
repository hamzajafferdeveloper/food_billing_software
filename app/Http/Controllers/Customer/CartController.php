<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\FoodItem;
use App\Models\Order;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class CartController extends Controller
{
    /**
     * 🛒 Add item to cart
     */
    public function addToCart(Request $request, string $unique_id)
    {
        try {
            // ✅ Validate incoming data
            $validated = $request->validate([
                'food_item_id' => 'required|integer|exists:food_items,id',
                'quantity' => 'required|integer|min:1',
                'instructions' => 'nullable|string',
                'addons' => 'nullable|array',
                'addons.*.name' => 'required_with:addons|string',
                'addons.*.price' => 'required_with:addons|numeric|min:0',
                'extras' => 'nullable|array',
                'extras.*.name' => 'required_with:extras|string',
                'extras.*.price' => 'required_with:extras|numeric|min:0',
                'extras.*.quantity' => 'required_with:extras|integer|min:1',
            ]);

            // ✅ Fetch or create active (pending) cart
            $cart = Cart::where('customer_id', $unique_id)
                ->where('status', 'pending')
                ->first();

            if (! $cart || $cart->status === 'completed') {
                $cart = Cart::create([
                    'customer_id' => $unique_id,
                    'cart_items' => [],
                    'status' => 'pending',
                ]);
            }

            // ✅ Ensure `cart_items` is always array
            $items = is_array($cart->cart_items) ? $cart->cart_items : [];

            // ✅ Match same item + addons/extras to prevent duplicates
            $index = collect($items)->search(function ($item) use ($validated) {
                return $item['food_item_id'] == $validated['food_item_id']
                    && json_encode($item['addons'] ?? []) === json_encode($validated['addons'] ?? [])
                    && json_encode($item['extras'] ?? []) === json_encode($validated['extras'] ?? []);
            });

            if ($index !== false) {
                $items[$index]['quantity'] += $validated['quantity'];
            } else {
                $items[] = [
                    'food_item_id' => $validated['food_item_id'],
                    'quantity' => $validated['quantity'],
                    'instructions' => $validated['instructions'] ?? '',
                    'addons' => $validated['addons'] ?? [],
                    'extras' => $validated['extras'] ?? [],
                ];
            }

            // ✅ Save cart
            $cart->update(['cart_items' => array_values($items)]);

            // ✅ Clear cached cart if any
            Cache::forget("cart_{$unique_id}");

            // ✅ Return success
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Item added to cart successfully!',
                    'cart' => $cart->fresh(),
                ], 201);
            }

            return back()->with('success', 'Item added to cart!');
        } catch (Exception $e) {
            Log::error("Add to cart failed: {$e->getMessage()}");

            return response()->json([
                'error' => 'Internal server error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * ✏️ Update specific item (quantity or extras)
     */
    public function updateCartItem(Request $request, string $unique_id)
    {
        $validated = $request->validate([
            'food_item_id' => 'required|integer|exists:food_items,id',
            'quantity' => 'required|integer|min:1',
            'instructions' => 'nullable|string',
            'addons' => 'nullable|array',
            'addons.*.name' => 'required_with:addons|string',
            'addons.*.price' => 'required_with:addons|numeric|min:0',
            'extras' => 'nullable|array',
            'extras.*.name' => 'required_with:extras|string',
            'extras.*.price' => 'required_with:extras|numeric|min:0',
            'extras.*.quantity' => 'required_with:extras|integer|min:1',
            'totalPrice' => 'required|numeric|min:0',
        ]);

        $cart = Cart::firstOrCreate(['customer_id' => $unique_id], ['cart_items' => []]);
        $items = $cart->cart_items ?? [];

        $index = collect($items)->search(fn ($i) => $i['food_item_id'] == $validated['food_item_id']);

        if ($index !== false) {
            $items[$index] = [
                ...$items[$index],
                'quantity' => $validated['quantity'],
                'instructions' => $validated['instructions'] ?? '',
                'addons' => $validated['addons'] ?? [],
                'extras' => $validated['extras'] ?? [],
                'totalPrice' => $validated['totalPrice'],
            ];
        }

        $cart->update(['cart_items' => array_values($items)]);

        Cache::forget("cart_{$unique_id}");

        return back()->with('success', 'Cart updated!');
    }

    /**
     * 🔄 Update only quantity
     */
    public function updateCartQuantity(Request $request, string $unique_id)
    {
        $validated = $request->validate([
            'food_item_id' => 'required|integer|exists:food_items,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = Cart::where('customer_id', $unique_id)->where('status', 'pending')->first();
        $items = $cart->cart_items ?? [];

        $index = collect($items)->search(fn ($i) => $i['food_item_id'] == $validated['food_item_id']);

        if ($index === false) {
            return response()->json(['message' => 'Item not found in cart'], 404);
        }

        $items[$index]['quantity'] = $validated['quantity'];
        $cart->update(['cart_items' => $items]);

        Cache::forget("cart_{$unique_id}");

        return $this->formatCartResponse($cart);
    }

    /**
     * 🗑 Remove item from cart
     */
    public function removeFromCart(Request $request, string $unique_id)
    {
        $validated = $request->validate([
            'food_item_id' => 'required|integer|exists:food_items,id',
        ]);

        $cart = Cart::where('customer_id', $unique_id)->where('status', 'pending')->first();

        $items = collect($cart->cart_items)
            ->reject(fn ($i) => $i['food_item_id'] == $validated['food_item_id'])
            ->values();

        $cart->update(['cart_items' => $items]);

        Cache::forget("cart_{$unique_id}");

        return $this->formatCartResponse($cart);
    }

    /**
     * 🧾 Get all cart items
     */
    public function getCart(string $unique_id)
    {
        try {
            $cart = Cart::where('customer_id', $unique_id)->where('status', 'pending')->first();

            if (! $cart || $cart->status === 'completed') {
                return response()->json(['items' => [], 'total' => 0], 200);
            }

            return $this->formatCartResponse($cart);
        } catch (Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }

    /**
     * 📦 Checkout — create order, clear cart & cache
     */
    public function checkout(Request $request, string $unique_id)
    {
        try {
            $cart = Cart::where('customer_id', $unique_id)->where('status', 'pending')->first();

            if (! $cart) {
                return back()->with('error', 'Cart not found!');
            }

            $order = Order::where('card_id', $cart->id)->first();

            if (! $order) {
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

                // ✅ Mark cart as completed and clear cache
                $cart->update(['status' => 'completed']);
                Cache::forget("cart_{$unique_id}");

                // ✅ Create new order
                $order = Order::create([
                    'customer_id' => $cart->customer_id,
                    'card_id' => $cart->id,
                    'total_amount' => $items->sum('subtotal'),
                    'payment_status' => 'pending',
                ]);

                // ✅ Clear Laravel cache after checkout
                \Artisan::call('cache:clear');
                \Artisan::call('config:clear');
                \Artisan::call('route:clear');
                \Artisan::call('view:clear');
            }

            return Inertia::render('customer/checkout', [
                'order' => $order,
                'uniqueId' => $unique_id,
            ]);
        } catch (Exception $e) {
            Log::error('Checkout failed: ' . $e->getMessage());
            return back()->with('error', 'Checkout failed, please try again.');
        }
    }

    /**
     * 🧠 Helper — format cart JSON output
     */
    private function formatCartResponse(Cart $cart)
    {
        $items = collect($cart->cart_items ?? [])->map(function ($item) {
            $food = FoodItem::find($item['food_item_id']);
            if (! $food) return null;

            return [
                'id' => $food->id,
                'name' => $food->name,
                'price' => $food->price,
                'image' => $food->image,
                'quantity' => $item['quantity'],
                'subtotal' => $food->price * $item['quantity'],
                'instructions' => $item['instructions'],
                'addons' => $item['addons'],
                'extras' => $item['extras'],
            ];
        })->filter();

        return response()->json([
            'items' => $items->values(),
            'total' => $items->sum('subtotal'),
        ]);
    }

    /**
     * 🚦 Check order status
     */
    public function getOrderStatus(string $unique_id)
    {
        try {
            $order = Order::where('customer_id', $unique_id)->latest()->first();

            return response()->json(['data' => $order], 200);
        } catch (Exception $e) {
            Log::error($e->getMessage());
            return response()->json(['error' => 'Failed to fetch order status'], 500);
        }
    }
}
