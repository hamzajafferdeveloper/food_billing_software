<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomBill extends Model
{
    protected $fillable = [
        'room_id',
        'guest_id',
        'room_bill',
        'food_bill',
        'total_amount',
        'payment_method',
        'payment_status',
        'status',
        'room_booking_id'
    ];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
