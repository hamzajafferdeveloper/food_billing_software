<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        $adminRole = Role::create(['name' => 'admin']);
        $chiefRole = Role::create(['name' => 'chief']);
        $userRole  = Role::create(['name' => 'user']);
        Role::create(['name' => 'waiter']);

        // Create users & assign roles
        $adminUser = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
        ]);
        $adminUser->assignRole($adminRole);

        $chiefUser = User::factory()->create([
            'name' => 'Chief User',
            'email' => 'chief@example.com',
        ]);
        $chiefUser->assignRole($chiefRole);

        $testUser = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $testUser->assignRole($userRole);
    }
}
