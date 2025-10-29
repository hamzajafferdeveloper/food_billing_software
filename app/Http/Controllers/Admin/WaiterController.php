<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class WaiterController extends Controller
{
    public function index(Request $request)
    {
        $per_page = $request->input('per_page', 10);
        $search_query = $request->input('search', '');

        $users = User::with('roles')
            ->whereHas('roles', function ($query) {
                $query->where('name', 'waiter');
            })
            ->when($search_query, function ($query, $search_query) {
                $query->where(function ($q) use ($search_query) {
                    $q->where('name', 'like', "%{$search_query}%")
                        ->orWhere('email', 'like', "%{$search_query}%")
                        ->orWhere('phone_number', 'like', "%{$search_query}%");
                });
            })
            ->orderBy('id', 'desc')
            ->paginate($per_page)
            ->appends([
                'per_page' => $per_page,
                'search_query' => $search_query,
            ]);

        return Inertia::render('admin/waiter/index', [
            'usersPagination' => $users,
            'existingEmails' => User::select('email')->get(),
            'filters' => [
                'search_query' => $search_query,
                'per_page' => $per_page,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the request data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'number' => 'required|numeric',
            'password' => 'required|string|max:255|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone_number' => $validated['number'],
            'password' => $validated['password'],
        ]);

        $role = Role::findById(4);

        $user->assignRole($role);

        return redirect()->route('admin.waiter.index')
            ->with('success', 'User created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Validate the request data
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$id,
            'number' => 'required|numeric',
            'password' => 'nullable|string|max:255|confirmed',
        ]);

        $user = User::findOrFail($id);
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone_number = $validated['number'];

        if ($request->filled('password')) {
            $user->password = bcrypt($validated['password']);
        }

        $user->save();

        return redirect()->route('admin.waiter.index')
            ->with('success', 'User updated successfully.');

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $user = User::findOrFail($id);
            $user->delete();

            return redirect()->route('admin.waiter.index')
                ->with('success', 'User deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->route('admin.waiter.index')
                ->with('error', 'Failed to delete user.');
        }
    }
}
