<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Table;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CustomerController extends Controller
{
    public function createCustomer(Request $request, string $table_number)
    {
        $table = Table::where('table_number', $table_number)->firstOrFail();

        $unique_id = Str::uuid()->toString();

        $customer = Customer::create([
            'unique_id' => $unique_id,
            'table_id' => $table->id,
        ]);

        return redirect()->route('customer.food.items', $unique_id);

    }
}
