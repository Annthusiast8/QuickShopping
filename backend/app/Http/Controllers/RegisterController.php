<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Shop;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class RegisterController extends Controller
{
    public function registerCustomer(Request $request)
    {
        return $this->register($request, 'customer');
    }

    public function registerSeller(Request $request)
    {
        // Validate input specific to sellers
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed',
            'shop_name' => 'required|string|max:255',
        ]);

        // Use database transaction to ensure that both user and shop are created or neither
        try {
            DB::beginTransaction();

            // Create user with seller role
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'seller',
            ]);

            // Create shop for the seller
            Shop::create([
                'user_id' => $user->id,
                'name' => $request->shop_name,
                // Additional fields can be set here if provided in the request
            ]);

            DB::commit();

            return response()->json(['message' => 'Seller registered successfully!'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Registration failed: ' . $e->getMessage()], 500);
        }
    }

    public function registerAdmin(Request $request)
    {
        // Add admin-specific validation or authorization logic here
        // You might want to check if the requester is already an admin
        
        return $this->register($request, 'admin');
    }

    private function register(Request $request, string $roleName)
    {
        // Validate input
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed',
        ]);

        // Create user with the specified role
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $roleName,
        ]);

        return response()->json(['message' => ucfirst($roleName) . ' registered successfully!'], 201);
    }
}
