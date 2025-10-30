<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FoodItem;
use App\Models\Order;
use App\Models\User;
use DB;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard(Request $request)
    {

        $per_page = $request->input('per_page', 10);

        $food_items = FoodItem::orderBy('id', 'desc')
            ->paginate($per_page)
            ->appends(['per_page', $per_page]);

        return Inertia::render('admin/dashboard', [
            'ItemsPagination' => $food_items,
        ]);
    }

    public function SaleReports(Request $request)
    {
        $search = $request->input('search');
        $waiter = $request->input('waiter');
        $sortBy = $request->input('sortBy', 'date');
        $sortDir = $request->input('sortDir', 'desc');
        $from = $request->input('from');
        $to = $request->input('to');
        $perPage = $request->input('perPage', 10);

        $query = Order::query()
            ->leftJoin('users', 'orders.waiter_id', '=', 'users.id')
            ->select([
                DB::raw('DATE(orders.created_at) as date'),
                DB::raw('COALESCE(users.name, "No Waiter") as waiter'),
                DB::raw('SUM(orders.total_amount) as sales'),
            ])
            ->where('orders.payment_status', 'completed')
            ->where('orders.status', 'completed')
            ->groupBy(DB::raw('DATE(orders.created_at)'), 'users.name');

        // ✅ Date range filter
        if ($from && $to) {
            $query->whereBetween(DB::raw('DATE(orders.created_at)'), [$from, $to]);
        }

        // ✅ Waiter filter
        if ($waiter && $waiter !== 'all') {
            $query->where('users.name', $waiter);
        }

        // ✅ Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('users.name', 'like', "%{$search}%")
                    ->orWhere('orders.total_amount', 'like', "%{$search}%")
                    ->orWhereDate('orders.created_at', 'like', "%{$search}%");
            });
        }

        // ✅ Sorting (secure against SQL injection)
        $validSorts = ['date', 'waiter', 'sales'];
        if (in_array($sortBy, $validSorts)) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderBy('date', 'desc');
        }

        // ✅ Pagination
        $salesData = $query->paginate($perPage)->appends($request->query());

        // ✅ Get all waiters by role
        $allWaiters = User::whereHas('roles', function ($query) {
            $query->where('name', 'waiter');
        })
            ->whereNotNull('name')
            ->pluck('name')
            ->toArray();

        return Inertia::render('admin/reports/sale', [
            'salesData' => $salesData,
            'filters' => [
                'search' => $search,
                'waiter' => $waiter,
                'sortBy' => $sortBy,
                'sortDir' => $sortDir,
                'from' => $from,
                'to' => $to,
                'perPage' => $perPage,
            ],
            'allWaiters' => $allWaiters,
        ]);
    }

   public function itemReports(Request $request)
{
    // Filters
    $filterType = $request->input('filterType', 'all');
    $search = $request->input('search', '');
    $sortBy = $request->input('sortBy', 'sold');
    $sortDir = $request->input('sortDir', 'desc');
    $startDate = $request->input('startDate');
    $endDate = $request->input('endDate');
    $pageSize = $request->input('pageSize', 10);

    // Preload food items for category lookup
    $foodItems = FoodItem::with('category')->get()->keyBy('id');

    // Get orders, filter by date if range is selected
    $orders = Order::with('cart')
        ->whereNotNull('card_id')
        ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
            $q->whereBetween('created_at', [$startDate, $endDate]);
        })
        ->orderBy('created_at', 'desc')
        ->get();

    $data = [];

    foreach ($orders as $order) {
        $cartItems = $order->cart?->cart_items ?? [];

        foreach ($cartItems as $cartItem) {
            $food = $foodItems->get($cartItem['food_item_id']);
            if (!$food) continue;

            $itemKey = $food->id; // aggregate by item, not by date

            if (!isset($data[$itemKey])) {
                $data[$itemKey] = [
                    'item' => $food->name,
                    'category' => $food->category?->name ?? 'Unknown',
                    'sold' => 0,
                    'cancelled' => 0,
                ];
            }

            $quantity = $cartItem['quantity'] ?? 1;

            if (($cartItem['status'] ?? 'sold') === 'cancelled') {
                $data[$itemKey]['cancelled'] += $quantity;
            } else {
                $data[$itemKey]['sold'] += $quantity;
            }
        }
    }

    $itemData = collect($data)->values();

    // ===== Server-side filtering =====
    if ($filterType === 'top') {
        $itemData = $itemData->sortByDesc('sold')->take(10);
    } elseif ($filterType === 'cancelled') {
        $itemData = $itemData->filter(fn($row) => $row['cancelled'] > 0)
                             ->sortByDesc('cancelled');
    }

    if ($search) {
        $search = strtolower($search);
        $itemData = $itemData->filter(fn($row) =>
            str_contains(strtolower($row['item']), $search) ||
            str_contains(strtolower($row['category']), $search)
        );
    }

    // ===== Sorting =====
    $itemData = $itemData->sortBy($sortBy, SORT_REGULAR, $sortDir === 'desc');

    // ===== Pagination =====
    $currentPage = $request->input('page', 1);
    $total = $itemData->count();
    $paginated = $itemData->forPage($currentPage, $pageSize)->values();

    return Inertia::render('admin/reports/item', [
        'itemData' => $paginated,
        'total' => $total,
        'page' => (int)$currentPage,
        'pageSize' => (int)$pageSize,
        'filterType' => $filterType,
        'search' => $search,
        'sortBy' => $sortBy,
        'sortDir' => $sortDir,
        'startDate' => $startDate,
        'endDate' => $endDate,
    ]);
}

}
