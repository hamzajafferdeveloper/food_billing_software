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
        'status',
        'waiter_id',
        'payment_type'
    ];

    protected $casts = [
        // 👇 Automatically formats the timestamp
        'created_at' => 'datetime:d M Y, h:i A',
        'updated_at' => 'datetime:d M Y, h:i A',
    ];

    public function cart(){
        return $this->belongsTo(Cart::class, 'card_id', 'id');
    }

    public function customer(){
        return $this->belongsTo(Customer::class, 'customer_id', 'unique_id');
    }

    public function payment(){
        return $this->hasOne(Payment::class,'order_id', 'id');
    }
    public function waiter(){
        return $this->belongsTo(User::class, 'waiter_id', 'id');
    }
}
