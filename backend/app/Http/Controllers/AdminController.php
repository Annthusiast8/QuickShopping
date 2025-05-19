<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Shop;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{
    /**
     * Health check endpoint for the admin API
     */
    public function checkHealth()
    {
        return response()->json(['status' => 'Admin API is working!']);
    }

    /**
     * Get all users with their shop details if they are sellers
     */
    public function getUsers()
    {
        $users = User::with(['shop' => function ($query) {
            $query->select('id', 'user_id', 'name');
        }])->get();

        return response()->json($users);
    }

    /**
     * Update user role
     */
    public function updateUserRole(Request $request, $userId)
    {
        $request->validate([
            'role' => 'required|in:admin,seller,customer',
        ]);

        $user = User::findOrFail($userId);
        $oldRole = $user->role;
        $newRole = $request->role;

        // Start transaction to ensure data consistency
        DB::beginTransaction();

        try {
            // Update user role
            $user->role = $newRole;
            $user->save();

            // Handle role-specific changes
            if ($oldRole === 'seller' && $newRole !== 'seller') {
                // If user was a seller but is no longer one, handle shop
                $shop = Shop::where('user_id', $userId)->first();
                if ($shop) {
                    // Either delete the shop or mark it as inactive
                    $shop->is_active = false;
                    $shop->save();
                }
            } else if ($oldRole !== 'seller' && $newRole === 'seller') {
                // If user is becoming a seller, create a placeholder shop
                $shopExists = Shop::where('user_id', $userId)->exists();
                if (!$shopExists) {
                    Shop::create([
                        'user_id' => $userId,
                        'name' => $user->name . "'s Shop",
                        'is_active' => true
                    ]);
                }
            }

            DB::commit();
            return response()->json(['message' => 'User role updated successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update user role: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to update user role'], 500);
        }
    }

    /**
     * Delete a user
     */
    public function deleteUser($userId)
    {
        try {
            $user = User::findOrFail($userId);
            
            // Delete related shop if user is a seller
            if ($user->role === 'seller') {
                Shop::where('user_id', $userId)->delete();
            }
            
            // Delete the user
            $user->delete();
            
            return response()->json(['message' => 'User deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Failed to delete user: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to delete user'], 500);
        }
    }
    
    /**
     * Get all business profiles pending approval
     */
    public function getPendingBusinesses()
    {
        $businesses = Shop::where('is_approved', false)
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->paginate(10);
            
        return response()->json($businesses);
    }
    
    /**
     * Approve a business
     */
    public function approveBusinessProfile($shopId)
    {
        $shop = Shop::findOrFail($shopId);
        
        $shop->is_approved = true;
        $shop->is_active = true;
        $shop->approval_date = now();
        $shop->approved_by = Auth::id();
        $shop->save();
        
        return response()->json([
            'message' => 'Business profile approved successfully',
            'shop' => $shop->load('user')
        ]);
    }
    
    /**
     * Reject a business
     */
    public function rejectBusinessProfile(Request $request, $shopId)
    {
        $request->validate([
            'rejection_reason' => 'required|string'
        ]);
        
        $shop = Shop::findOrFail($shopId);
        
        $shop->is_approved = false;
        $shop->is_active = false;
        $shop->rejection_reason = $request->rejection_reason;
        $shop->save();
        
        return response()->json([
            'message' => 'Business profile rejected',
            'shop' => $shop->load('user')
        ]);
    }
}
