<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Table;
use Illuminate\Http\Request;

class TableController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
