<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Table extends Model
{
    protected $fillable = ['table_number'];

    public function customer()
    {
        return $this->hasMany(Customer::class, );
    }

}
