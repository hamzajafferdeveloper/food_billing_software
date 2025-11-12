<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Guest;
use App\Models\Room;
use App\Models\RoomBooking;
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

        $query = RoomBooking::with('room', 'guest');

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
            $roomBooking = RoomBooking::create([
                'guest_id' => (int) $guest->id,
                'room_id' => (int) $request->input('room.id'),
                'check_in' => $checkInDateTime,
                'expected_days' => $request->input('expected_days'),
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
            'check_in_datetime' => 'required|date',
            'expected_days' => 'required|integer',
        ]);

        try {
            DB::beginTransaction();

            // Find existing booking
            $roomBooking = RoomBooking::findOrFail($id);

            // Handle guest
            $guestData = $request->input('guest');
            $guest = Guest::where('document_number', $guestData['document_number'])->first();

            if (! $guest) {
                // Create new guest if not exists
                $guest = Guest::create([
                    'name' => $guestData['name'],
                    'document_number' => $guestData['document_number'],
                    'phone_number' => $guestData['phone_number'] ?? null,
                    'email' => $guestData['email'] ?? null,
                    'address' => $guestData['address'] ?? null,
                    'document_type' => $guestData['document_type'] ?? null,
                ]);
            } else {
                // Update guest details if changed
                $guest->update([
                    'name' => $guestData['name'],
                    'phone_number' => $guestData['phone_number'] ?? $guest->phone_number,
                    'email' => $guestData['email'] ?? $guest->email,
                    'address' => $guestData['address'] ?? $guest->address,
                    'document_type' => $guestData['document_type'] ?? $guest->document_type,
                ]);
            }

            // Handle room status if changed
            $newRoomId = (int) $request->input('room.id');
            if ($roomBooking->room_id !== $newRoomId) {
                // Free previous room
                $previousRoom = Room::find($roomBooking->room_id);
                if ($previousRoom) {
                    $previousRoom->status = 'available';
                    $previousRoom->save();
                }

                // Occupy new room
                $newRoom = Room::findOrFail($newRoomId);
                $newRoom->status = 'occupied';
                $newRoom->save();
            }

            // Update booking
            $roomBooking->update([
                'guest_id' => $guest->id,
                'room_id' => $newRoomId,
                'check_in' => date('Y-m-d H:i:s', strtotime($request->input('check_in_datetime'))),
                'expected_days' => $request->input('expected_days'),
            ]);

            DB::commit();

            return redirect()->back()->with('success', 'Room booking updated successfully.');
        } catch (Exception $e) {
            DB::rollBack();
            \Log::error('Error updating booking: '.$e->getMessage());

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
}
