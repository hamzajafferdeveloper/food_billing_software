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

}
