<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserProfile;
use App\Models\UserAddress;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CustomerController extends Controller
{
    /**
     * Health check endpoint for the customer API
     */
    public function checkHealth()
    {
        return response()->json(['status' => 'Customer API is working!']);
    }
    
    /**
     * Get the current customer's profile
     */
    public function getProfile()
    {
        $user = Auth::user();
        $profile = UserProfile::where('user_id', $user->id)->first();
        
        if (!$profile) {
            $profile = UserProfile::create([
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email
            ]);
        }
        
        return response()->json([
            'user' => $user,
            'profile' => $profile
        ]);
    }
    
    /**
     * Update the current customer's profile
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'name' => 'string|max:255',
            'email' => 'email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'avatar' => 'nullable|image|max:2048'
        ]);
        
        // Update user data
        $userData = [];
        
        if ($request->has('name')) {
            $userData['name'] = $request->name;
        }
        
        if ($request->has('email')) {
            $userData['email'] = $request->email;
        }
        
        if (!empty($userData)) {
            DB::table('users')->where('id', $user->id)->update($userData);
        }
        
        // Get profile or create if it doesn't exist
        $profile = UserProfile::where('user_id', $user->id)->first();
        
        if (!$profile) {
            $profile = UserProfile::create([
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email
            ]);
        }
        
        // Prepare profile data for update
        $profileData = [];
        
        if ($request->has('phone')) {
            $profileData['phone'] = $request->phone;
        }
        
        if ($request->has('address')) {
            $profileData['address'] = $request->address;
        }
        
        // Update profile with the collected data
        if (!empty($profileData)) {
            DB::table('user_profiles')->where('id', $profile->id)->update($profileData);
        }
        
        // Refresh data
        $user = User::find($user->id);
        $profile = UserProfile::where('user_id', $user->id)->first();
        
        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
            'profile' => $profile
        ]);
    }
    
    /**
     * Get all addresses for the current customer
     */
    public function getAddresses()
    {
        $addresses = UserAddress::where('user_id', Auth::id())->get();
        
        return response()->json($addresses);
    }
    
    /**
     * Add a new address for the current customer
     */
    public function addAddress(Request $request)
    {
        $request->validate([
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:100',
            'is_default' => 'boolean'
        ]);
        
        // If this is the default address, unset other default addresses
        if ($request->is_default) {
            UserAddress::where('user_id', Auth::id())
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }
        
        $address = UserAddress::create([
            'user_id' => Auth::id(),
            'address_line1' => $request->address_line1,
            'address_line2' => $request->address_line2,
            'city' => $request->city,
            'state' => $request->state,
            'postal_code' => $request->postal_code,
            'country' => $request->country,
            'is_default' => $request->is_default ?? false
        ]);
        
        return response()->json([
            'message' => 'Address added successfully',
            'address' => $address
        ], 201);
    }
    
    /**
     * Update an address for the current customer
     */
    public function updateAddress(Request $request, $id)
    {
        $address = UserAddress::where('user_id', Auth::id())
            ->findOrFail($id);
            
        $request->validate([
            'address_line1' => 'string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city' => 'string|max:100',
            'state' => 'string|max:100',
            'postal_code' => 'string|max:20',
            'country' => 'string|max:100',
            'is_default' => 'boolean'
        ]);
        
        // If this is being set as default, unset other default addresses
        if ($request->has('is_default') && $request->is_default) {
            UserAddress::where('user_id', Auth::id())
                ->where('id', '!=', $id)
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }
        
        $address->update($request->all());
        
        return response()->json([
            'message' => 'Address updated successfully',
            'address' => $address
        ]);
    }
    
    /**
     * Delete an address for the current customer
     */
    public function deleteAddress($id)
    {
        $address = UserAddress::where('user_id', Auth::id())
            ->findOrFail($id);
            
        $address->delete();
        
        return response()->json([
            'message' => 'Address deleted successfully'
        ]);
    }
    
    /**
     * Get all orders for the current customer
     */
    public function getOrders()
    {
        $orders = Order::where('user_id', Auth::id())
            ->with(['item.seller'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
            
        return response()->json($orders);
    }
    
    /**
     * Get a specific order for the current customer
     */
    public function getOrder($id)
    {
        $order = Order::where('user_id', Auth::id())
            ->with(['item.seller'])
            ->findOrFail($id);
            
        return response()->json($order);
    }
}
