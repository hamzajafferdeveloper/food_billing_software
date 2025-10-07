<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'customer_id',
        'card_id',
        'total_amount',
        'payment_status',
    ];

    public function cart(){
        return $this->belongsTo(Cart::class, 'card_id', 'id');
    }

    public function customer(){
        return $this->belongsTo(Customer::class, 'customer_id', 'unique_id');
    }
}
