<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FoodCategory extends Model
{
    protected $fillable = [
        'name',
        'image'
    ];

    public function item()
    {
        return $this->hasMany(FoodItem::class);
    }
}
