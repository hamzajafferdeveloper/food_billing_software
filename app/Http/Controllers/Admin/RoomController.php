<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Exception;
use Illuminate\Http\Request;
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
}
