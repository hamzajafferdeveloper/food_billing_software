<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    protected $fillable = ['customer_id', 'cart_items', 'status', 'room_id'];

    protected $casts = [
        'cart_items' => 'array',
    ];



}
