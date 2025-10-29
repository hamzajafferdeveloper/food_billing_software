<?php

namespace App\Http\Controllers\Chief;

use App\Http\Controllers\Controller;
use App\Models\FoodItem;
use App\Models\Order;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ChiefController extends Controller
{
    public function newOrder()
    {
        return Inertia::render('chief/new-order');
    }

    public function getNewOrder(Request $request)
    {
        try {
            $orders = Order::with('cart', 'customer', 'payment', 'waiter')->where('status', 'pending')->orderBy('id', 'desc')->get();

            return response()->json(['data' => $orders], 200);
        } catch (Exception $e) {
            // return response()->json($e);
            Log::error($e->getMessage());
        }
    }

    public function getOrderDetails(string $id)
    {
        try {
            $order = Order::with(['customer', 'payment', 'cart'])->findOrFail($id);



            $cart = $order->cart;
            $items = collect($cart->cart_items ?? [])->map(function ($item) {
                $food = FoodItem::find($item['food_item_id']);

                return [
                    'food_item_id' => $item['food_item_id'],
                    'quantity' => $item['quantity'],
                    'food_item' => $food ? [
                        'id' => $food->id,
                        'name' => $food->name,
                        'price' => $food->price,
                        'image' => $food->image ?? null,
                    ] : null,
                    'addons' => $item['addons'] ?? [],
                    'extras' => $item['extras'] ?? [],
                    // 'totalPrice' => $item['totalPrice'],
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $order->id,
                    'total_amount' => $order->total_amount,
                    'payment_status' => $order->payment_status,
                    'created_at' => $order->created_at,
                    'customer' => $order->customer,
                    'payment' => $order->payment,
                    'cart' => [
                        'id' => $cart->id,
                        'customer_id' => $cart->customer_id,
                        'cart_items' => $items,
                    ],
                ],
            ]);
        } catch (Exception $e) {
            Log::error($e->getMessage());
        }
    }

    public function confirm($id)
    {
        $order = Order::findOrFail($id);
        $order->status = 'confirmed';
        $order->save();

        return back()->with('success', 'Order confirmed successfully.');
    }

    /**
     * Decline the order.
     */
    public function decline($id)
    {
        $order = Order::findOrFail($id);
        $order->status = 'declined';
        $order->save();

        return back()->with('success', 'Order confirmed successfully.');
    }

    public function confirmOrder()
    {
        return Inertia::render('chief/confirm-order');
    }

    public function getConfirmOrder(Request $request)
    {
        try {
            $orders = Order::with('cart', 'customer', 'payment')->where('status', 'confirmed')->orderBy('id', 'desc')->get();

            return response()->json(['data' => $orders], 200);
        } catch (Exception $e) {
            // return response()->json($e);
            Log::error($e->getMessage());
        }
    }

    public function orderServed()
    {
        return Inertia::render('chief/order-served');
    }

    public function getServerdOrder(Request $request)
    {
        try {
            $orders = Order::with('cart', 'customer', 'payment')->where('status', 'completed')->orderBy('id', 'desc')->get();

            return response()->json(['data' => $orders], 200);
        } catch (Exception $e) {
            // return response()->json($e);
            Log::error($e->getMessage());
        }
    }

    public function serveOrder($id)
    {
        $order = Order::findOrFail($id);
        $order->status = 'completed';
        $order->save();

        return back();
    }
}
