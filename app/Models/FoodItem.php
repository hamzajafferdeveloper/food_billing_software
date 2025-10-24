<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FoodItem extends Model
{
    protected $fillable = [
        'name', 'price', 'category_id', 'image'
    ];

    public function category()
    {
        return $this->belongsTo(FoodCategory::class);
    }

    public function addons()
    {
        return $this->hasMany(FoodItemAddon::class, 'food_item_id');
    }

    public function extras()
    {
        return $this->hasMany(FoodItemExtras::class, 'food_item_id');
    }
}
