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
    public function index(){

        $rooms = Room::paginate(10);

        return Inertia::render('admin/room/index');
    }

    public function store(Request $request) {
        try {
            $request->validate([
                'number' => 'required',
                'type' => 'required',
                'price_per_night' => 'required',
                'note' => 'nullable'
            ]);

            $room = new Room();
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
}
