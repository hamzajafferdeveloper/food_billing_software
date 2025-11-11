<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $fillable = [
        'number',
        'type',
        'status',
        'price_per_night',
        'note',
        'created_at',
        'updated_at',
    ];
}
