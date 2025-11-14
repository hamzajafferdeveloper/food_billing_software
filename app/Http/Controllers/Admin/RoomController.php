<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Guest;
use App\Models\Room;
use App\Models\RoomBill;
use App\Models\RoomBooking;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RoomController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $per_page = $request->input('per_page', 10);

        $rooms = Room::query()
            ->when($search, function ($query, $search) {
                $query->where('number', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%");
            })
            ->orderBy('id', 'desc')
            ->paginate($per_page)
            ->appends([
                'search' => $search,
                'per_page' => $per_page,
            ]);

        return Inertia::render('admin/room/index', [
            'roomsPagination' => $rooms,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'number' => 'required',
                'type' => 'required',
                'price_per_night' => 'required',
                'note' => 'nullable',
            ]);

            $room = new Room;
            $room->number = $request->number;
            $room->type = $request->type;
            $room->price_per_night = $request->price_per_night;
            $room->note = $request->note;
            $room->save();

            return redirect()->back()->with('success', 'Room created successfully');

        } catch (Exception $e) {
            Log::error($e->getMessage());

            return redirect()->back()->with('error', 'Something went wrong');
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'number' => 'required',
                'type' => 'required',
                'price_per_night' => 'required',
                'note' => 'nullable',
            ]);

            $room = Room::find($id);
            $room->number = $request->number;
            $room->type = $request->type;
            $room->price_per_night = $request->price_per_night;
            $room->note = $request->note;
            $room->save();

            return redirect()->back()->with('success', 'Room updated successfully');

        } catch (Exception $e) {
            Log::error($e->getMessage());

            return redirect()->back()->with('error', 'Something went wrong');
        }
    }

    public function destroy($id)
    {
        try {
            $room = Room::find($id);
            $room->delete();

            return redirect()->back()->with('success', 'Room deleted successfully');

        } catch (Exception $e) {
            Log::error($e->getMessage());

            return redirect()->back()->with('error', 'Something went wrong');
        }
    }

    public function bookingIndex(Request $request)
    {

        $search = $request->input('search');
        $per_page = $request->input('per_page', 10);
        $status = $request->input('status');
        $room_number = $request->input('room_number');
        $start_date = $request->input('from');
        $end_date = $request->input('to');

        $query = RoomBooking::with('room', 'guest', 'roomBill')->orderBy('id', 'desc');

        if ($search) {
            $query->whereHas('guest', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('document_number', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone_number', 'like', "%{$search}%");
            })->orWhereHas('room', function ($q) use ($search) {
                $q->where('number', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%");
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($room_number) {
            $query->whereHas('room', function ($q) use ($room_number) {
                $q->where('number', $room_number);
            });
        }

        if ($start_date && $end_date) {
            $query->whereBetween('check_in', [$start_date, $end_date]);
        } elseif ($start_date) {
            $query->whereDate('check_in', '>=', $start_date);
        } elseif ($end_date) {
            $query->whereDate('check_in', '<=', $end_date);
        }

        $roomBookings = $query->orderBy('id', 'desc')
            ->paginate($per_page)
            ->appends([
                'search' => $search,
                'per_page' => $per_page,
                'status' => $status,
                'room_number' => $room_number,
            ]);

        $rooms = Room::orderBy('id', 'desc')->get();

        return Inertia::render('admin/room/booking/index', [
            'roomBookingsPagination' => $roomBookings,
            'rooms' => $rooms,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function getRoomsForBooking(Request $request)
    {
        try {
            $search = $request->input('search');

            $rooms = Room::query()
                ->where('status', 'available')
                ->when($search, function ($query, $search) {
                    $query->where(function ($q) use ($search) {
                        $q->where('number', 'like', "%{$search}%")
                            ->orWhere('type', 'like', "%{$search}%")
                            ->orWhere('status', 'like', "%{$search}%");
                    });
                })
                ->orderBy('id', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $rooms,
            ]);
        } catch (Exception $e) {
            \Log::error('Error fetching rooms for booking: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Something went wrong while fetching rooms.',
            ], 500);
        }
    }

    public function getGuestsForBooking(Request $request)
    {
        try {
            $search = $request->input('search');

            $guests = Guest::query()
                ->when($search, function ($query, $search) {
                    $query->where(function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('phone_number', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('document_number', 'like', "%{$search}%");
                    });
                })
                ->orderBy('id', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $guests,
            ]);
        } catch (Exception $e) {
            \Log::error('Error fetching guests for booking: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Something went wrong while fetching guests.',
            ], 500);
        }
    }

    public function createBooking(Request $request)
    {
        $request->validate([
            'guest.document_number' => 'required|string',
            'guest.name' => 'required|string',
            'room.id' => 'required|integer|exists:rooms,id',
            'check_in' => 'required|date',
            'check_in_time' => 'required|date_format:H:i',
            'expected_days' => 'required|integer',
        ]);

        try {
            DB::beginTransaction();

            // Check if guest exists
            $guestData = $request->input('guest');
            $guest = Guest::where('document_number', $guestData['document_number'])->first();

            if (! $guest) {
                // Create new guest
                $guest = Guest::create([
                    'name' => $guestData['name'],
                    'document_number' => $guestData['document_number'],
                    'phone_number' => $guestData['phone_number'] ?? null,
                    'email' => $guestData['email'] ?? null,
                    'address' => $guestData['address'] ?? null,
                    'document_type' => $guestData['document_type'] ?? null,
                ]);
            }

            $room = Room::findOrFail($request->input('room.id'));
            $room->status = 'occupied';
            $room->save();

            $checkInDateTime = date('Y-m-d H:i:s', strtotime($request->input('check_in').' '.$request->input('check_in_time')));
            // Create room booking
            $roomBooking =  RoomBooking::create([
                'guest_id' => (int) $guest->id,
                'room_id' => (int) $request->input('room.id'),
                'check_in' => $checkInDateTime,
                'expected_days' => $request->input('expected_days'),
            ]);

            RoomBill::create([
                'room_booking_id' => $roomBooking->id,
                'room_id' => $request->input('room.id'),
                'guest_id' => $guest->id,
                'food_bill' => 0,
                'total_amount' => 0,
                'room_bill' => 0,
                'payment_status' => 'unpaid',
                'status' => 'unpaid',
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Room booking created successfully.');

        } catch (Exception $e) {
            DB::rollBack();
            \Log::error('Error creating booking: '.$e->getMessage());

            return redirect()->back()->with('error', 'Something went wrong while creating booking.');
        }
    }

   public function updateBooking(Request $request, $id)
    {
        $request->validate([
            'guest.document_number' => 'required|string',
            'guest.name' => 'required|string',
            'room.id' => 'required|integer|exists:rooms,id',
            'check_in' => 'required|date',
            'check_in_time' => 'required|date_format:H:i',
            'expected_days' => 'required|integer',
        ]);

        try {
            DB::beginTransaction();

            // Find existing booking
            $roomBooking = RoomBooking::findOrFail($id);

            // Handle guest
            $guestData = $request->input('guest');
            $guest = Guest::find($roomBooking->guest_id);

            if ($guest) {
                // Update existing guest
                $guest->update([
                    'name' => $guestData['name'],
                    'document_number' => $guestData['document_number'],
                    'phone_number' => $guestData['phone_number'] ?? $guest->phone_number,
                    'email' => $guestData['email'] ?? $guest->email,
                    'address' => $guestData['address'] ?? $guest->address,
                    'document_type' => $guestData['document_type'] ?? $guest->document_type,
                ]);
            } else {
                // Guest not linked, create or find by document_number
                $guest = Guest::firstOrCreate(
                    ['document_number' => $guestData['document_number']],
                    [
                        'name' => $guestData['name'],
                        'phone_number' => $guestData['phone_number'] ?? null,
                        'email' => $guestData['email'] ?? null,
                        'address' => $guestData['address'] ?? null,
                        'document_type' => $guestData['document_type'] ?? null,
                    ]
                );
            }

            // Handle room change
            $newRoomId = (int) $request->input('room.id');
            if ($roomBooking->room_id !== $newRoomId) {
                // Free previous room
                Room::where('id', $roomBooking->room_id)->update(['status' => 'available']);

                // Occupy new room
                Room::where('id', $newRoomId)->update(['status' => 'occupied']);
            }

            $checkInDateTime = date('Y-m-d H:i:s', strtotime($request->input('check_in').' '.$request->input('check_in_time')));
            // Update booking
            $roomBooking->update([
                'guest_id' => $guest->id,
                'room_id' => $newRoomId,
                'check_in' => $checkInDateTime,
                'expected_days' => $request->input('expected_days'),
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Room booking updated successfully.');
        } catch (Exception $e) {
            DB::rollBack();
            \Log::error('Error updating booking: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Something went wrong while updating booking.');
        }
    }

    public function updateBookingStatus(Request $request, string $id)
    {
        try {
            $roomBooking = RoomBooking::findOrFail($id);

            $roomBooking->status = $request->status;

            // If status is "checked_out", set check_out to now
            if ($request->status === 'checked_out') {
                $roomBooking->check_out = now();

                // Calculate total days (ensure at least 1 day)
                $checkIn = Carbon::parse($roomBooking->check_in);
                $checkOut = Carbon::parse($roomBooking->check_out);
                $total_days = max($checkIn->diffInDays($checkOut), 1);

                // Calculate total room amount
                $roomBooking->total_amount = $total_days * $roomBooking->room->price_per_night;
                $roomBooking->save();

                // Find or create RoomBill record for this room + guest
                $roomBill = RoomBill::where('room_booking_id', $roomBooking->id)->first();

                // Default food bill to 0 if not set
                $roomBill->food_bill = $roomBill->food_bill ?? 0;

                // Update room and total amounts
                $roomBill->room_bill = $roomBooking->total_amount;
                $roomBill->total_amount = $roomBill->room_bill + $roomBill->food_bill;

                $roomBill->save();
            }

            $roomBooking->save();

            $room = Room::find($roomBooking->room_id);
            $room->status = 'available';
            $room->save();

            return redirect()->back()->with('success', 'Status updated successfully.');
        } catch (Exception $e) {
            \Log::error('Error updating booking status: '.$e->getMessage());

            return redirect()->back()->with('error', 'Failed to update status.');
        }
    }

    public function receipt(string $id)
    {
        try {
            // Step 1: Get booking first
            $roomBooking = RoomBooking::findOrFail($id);

            // Step 2: Get check_in / check_out times in proper format
            $checkIn = Carbon::parse($roomBooking->check_in)->format('Y-m-d H:i:s');
            $checkOut = Carbon::parse($roomBooking->check_out)->format('Y-m-d H:i:s');

            // Step 3: Load relations with correct order filtering
            $roomBooking->load([
                'guest',
                'roomBill.room',
                'room.orders' => function ($query) use ($checkIn, $checkOut) {
                    $query->whereHas('cart', function ($q) use ($checkIn, $checkOut) {
                        $q->whereBetween('created_at', [$checkIn, $checkOut]);
                    });
                },
            ]);

            // Step 4: Attach food item details for each cart
            foreach ($roomBooking->room->orders as $order) {
                $cart = $order->cart;
                if ($cart && is_array($cart->cart_items)) {
                    $foodItemIds = collect($cart->cart_items)->pluck('food_item_id')->unique();
                    $foodItems = \App\Models\FoodItem::whereIn('id', $foodItemIds)->get()->keyBy('id');

                    $cart->cart_items = collect($cart->cart_items)->map(function ($item) use ($foodItems) {
                        $item['food_item'] = $foodItems[$item['food_item_id']] ?? null;

                        return $item;
                    })->toArray();
                }
            }

            return response()->json([
                'success' => true,
                'data' => $roomBooking,
            ]);
        } catch (Exception $e) {
            \Log::error($e->getMessage());

            return response()->json([
                'error' => 'Something went wrong',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function billPaid(Request $request, string $id){
        try {
            $roomBill = RoomBill::where('room_booking_id', $id)->first();

            $roomBill->payment_method = 'cash';
            $roomBill->payment_status = 'paid';
            $roomBill->save();

            return redirect()->back()->with('success', 'Bill paid successfully.');
        } catch (Exception $e) {
            \Log::error($e->getMessage());

            return redirect()->back()->with('success', 'Failed to update status.');
        }
    }

}


