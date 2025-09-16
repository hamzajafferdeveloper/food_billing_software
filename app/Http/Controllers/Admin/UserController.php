<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $per_page = $request->input('per_page', 2);
        $search_query = $request->input('search', '');
        $authenticated_user = Auth::user();
        $existing_emails = User::select('email')->get();

        $users = User::where('id', '!=', $authenticated_user->id)
            ->with('roles')
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
                'search_query' => $search_query
            ]);

        $roles = Role::all();

        return Inertia::render('admin/user/index', [
            'usersPagination' => $users,
            'roles' => $roles,
            'existingEmails' => $existing_emails,
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
            'role_id' => 'required|exists:roles,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone_number' => $validated['number'],
            'password' => $validated['password']
        ]);

        $role = Role::findById($validated['role_id']);

        $user->assignRole($role);

        return redirect()->route('admin.user.index')
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
            'email' => 'required|email|unique:users,email,' . $id ,
            'number' => 'required|numeric',
            'password' => 'nullable|string|max:255|confirmed',
            'role_id' => 'required|exists:roles,id',
        ]);

        $user = User::findOrFail($id);
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone_number = $validated['number'];

        if ($request->filled('password')) {
            $user->password = bcrypt($validated['password']);
        }

        if($request->filled('role_id'))
        {
            $role = Role::findById($validated['role_id']);

            $user->syncRoles([$role->name]);
        }

        $user->save();

        return redirect()->route('admin.user.index')
            ->with('success', 'User updated successfully.');

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
