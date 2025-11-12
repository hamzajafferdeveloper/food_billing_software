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
    ];
}
