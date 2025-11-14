<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\FoodItem;
use App\Models\Order;
use App\Models\Room;
use App\Models\RoomBill;
use App\Models\RoomBooking;
use DB;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function orderIndex()
    {
        $rooms = Room::where('status', 'occupied')->get();

        return Inertia::render('admin/orders/index', [
            'rooms' => $rooms,
        ]);
    }

    public function searchFoodItem(Request $request)
    {
        try {
            $search = $request->input('search');
            $foodItems = FoodItem::where('name', 'like', "%{$search}%")->with(['addons', 'extras'])->get();

            return response()->json([
                'success' => true,
                'data' => $foodItems,
            ]);
        } catch (Exception $e) {
            Log::error($e->getMessage());

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'room_id' => ['required', 'exists:rooms,id'],
                'cart_items' => ['required', 'array', 'min:1'],
                'cart_items.*.food_item_id' => ['required', 'exists:food_items,id'],
                'cart_items.*.quantity' => ['required', 'integer', 'min:1'],
                'cart_items.*.instructions' => ['nullable', 'string'],
                'cart_items.*.addons' => ['nullable', 'array'],
                'cart_items.*.extras' => ['nullable', 'array'],
                'totalPrice' => ['required', 'numeric', 'min:0'],
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput();
            }

            $data = $validator->validated();

            DB::beginTransaction();

            // Get or create pending cart
            $cart = Cart::firstOrCreate(
                ['room_id' => $data['room_id'], 'status' => 'pending'],
                ['cart_items' => []]
            );

            $items = is_array($cart->cart_items) ? $cart->cart_items : [];

            foreach ($data['cart_items'] as $newItem) {
                $index = collect($items)->search(function ($item) use ($newItem) {
                    return $item['food_item_id'] == $newItem['food_item_id']
                        && json_encode($item['addons'] ?? []) === json_encode($newItem['addons'] ?? [])
                        && json_encode($item['extras'] ?? []) === json_encode($newItem['extras'] ?? []);
                });

                if ($index !== false) {
                    $items[$index]['quantity'] += $newItem['quantity'];
                } else {
                    $items[] = [
                        'food_item_id' => $newItem['food_item_id'],
                        'quantity' => $newItem['quantity'],
                        'instructions' => $newItem['instructions'] ?? '',
                        'addons' => $newItem['addons'] ?? [],
                        'extras' => $newItem['extras'] ?? [],
                    ];
                }
            }

            // Update cart
            $cart->update([
                'cart_items' => array_values($items),
                'totalPrice' => $data['totalPrice'],
            ]);

            // Create order
            $order = Order::create([
                'room_id' => $data['room_id'],
                'card_id' => $cart->id,
                'total_amount' => $data['totalPrice'],
                'status' => 'confirmed',
            ]);

            // Get active room booking (not checked out)
            $room_booking = RoomBooking::where('room_id', $data['room_id'])
                ->whereNull('check_out')
                ->where('status', 'active')
                ->first();

            if (!$room_booking) {
                DB::rollBack();
                return redirect()->back()->with('error', 'No active booking found for this room.');
            }

            // Get or create unpaid RoomBill
            $roomBill = RoomBill::firstOrNew([
                'room_id' => $data['room_id'],
                'guest_id' => $room_booking->guest_id,
                'status' => 'unpaid',
            ]);

            // Initialize values if null
            $roomBill->room_bill = $roomBill->room_bill ?? 0;
            $roomBill->food_bill = $roomBill->food_bill ?? 0;
            $roomBill->total_amount = $roomBill->total_amount ?? 0;

            // Update bills
            $roomBill->food_bill += $data['totalPrice'];
            $roomBill->total_amount = $roomBill->room_bill + $roomBill->food_bill;

            $roomBill->save();

            // Complete cart
            $cart->update(['status' => 'completed']);

            DB::commit();

            return redirect()->route('admin.order.index')->with('success', 'Order created successfully');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Order Store Error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Something went wrong while creating the order.');
        }
    }

}
