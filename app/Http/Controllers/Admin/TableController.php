<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Table;
use Illuminate\Http\Request;
use Inertia\Inertia;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class TableController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search_query = $request->input('search', '');
        $tables = Table::orderBy('id', 'desc')
            ->when($search_query, function ($query, $search_query) {
                $query->where(function ($q) use ($search_query) {
                    $q->where('table_number', 'like', "%{$search_query}%");
                });
            })->get();


        foreach ($tables as $table)
        {
            $table->qr_code = (string) QrCode::size(300)->generate($table->table_number);
        }

        return Inertia::render('admin/table/index', [
            'tables' => $tables
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'table_number' => 'required'
        ]);

        Table::create([
            'table_number' => $validated['table_number']
        ]);

        return redirect()->route('admin.table.index')->with('success', 'Table Created Successfully');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'table_number' => 'required'
        ]);

        $table = Table::findOrFail($id);
        $table->table_number = $validated['table_number'];
        $table->save();

        return redirect()->route('admin.table.index')->with('success', 'Table Updated Successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $table = Table::findOrFail($id);

        $table->delete();

        return redirect()->route('admin.table.index')->with('success', 'Table Delete Successfully');
    }
}
