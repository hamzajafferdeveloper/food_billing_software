<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FoodItemExtras extends Model
{
    protected $fillable = [
        'food_item_id',
        'name',
        'price',
    ];

    public function foodItem()
    {
        return $this->belongsTo(FoodItem::class, 'food_item_id');
    }
}
