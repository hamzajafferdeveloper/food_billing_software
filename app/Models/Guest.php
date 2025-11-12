<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Guest extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone_number',
        'address',
        'document_type',
        'document_number',
    ];

    public function roomBookings()
    {
        return $this->hasMany(RoomBooking::class);
    }
}
