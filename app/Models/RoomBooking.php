<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomBooking extends Model
{
    protected $fillable = [
        'room_id',
        'guest_id',
        'status',
        'check_in',
        'check_out',
        'total_amount',
        'expected_days',
    ];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function guest()
    {
        return $this->belongsTo(Guest::class);
    }

    public function roomBill()
    {
        return $this->hasOne(RoomBill::class, 'room_id', 'room_id');
    }
}
