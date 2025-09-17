<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = ['unique_id', 'table_id'];

    public function table()
    {
        return $this->belongsTo(Table::class);
    }
}
