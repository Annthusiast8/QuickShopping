<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserProfile;
use App\Models\UserAddress;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Review;
use App\Models\ItemReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AccountController extends Controller
{
    /**
     * Delete the current user's account
     */
    public function deleteAccount(Request $request)
    {
        $user = Auth::user();
        
        // Validate password to confirm deletion
        $request->validate([
            'password' => 'required'
        ]);
        
        // Check if password is correct
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Incorrect password'
            ], 403);
        }
        
        // Begin transaction
        DB::beginTransaction();
        
        try {
            // Delete profile
            UserProfile::where('user_id', $user->id)->delete();
            
            // Delete addresses
            UserAddress::where('user_id', $user->id)->delete();
            
            // Delete cart
            $cart = Cart::where('user_id', $user->id)->first();
            if ($cart) {
                CartItem::where('cart_id', $cart->id)->delete();
                $cart->delete();
            }
            
            // Anonymize reviews instead of deleting them
            Review::where('user_id', $user->id)->update([
                'user_id' => null,
                'comment' => 'Comment removed as user account was deleted.'
            ]);
            
            // Delete reports
            ItemReport::where('user_id', $user->id)->delete();
            
            // Delete user
            $user->delete();
            
            DB::commit();
            
            return response()->json([
                'message' => 'Account deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to delete account: ' . $e->getMessage()
            ], 500);
        }
    }
} 