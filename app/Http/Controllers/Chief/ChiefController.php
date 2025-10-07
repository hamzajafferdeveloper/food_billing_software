<?php

namespace App\Http\Controllers\Chief;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ChiefController extends Controller
{
    public function newOrder()
    {
        return Inertia::render('chief/new-order');
    }

    public function getNewOrder(Request $request)
    {
        try {
            $orders = Order::with('cart', 'customer')->orderBy('id', 'desc')->get();

            return response()->json(['data' => $orders], 200);
        } catch (Exception $e) {
            // return response()->json($e);
            Log::error($e->getMessage());
        }
    }
}
