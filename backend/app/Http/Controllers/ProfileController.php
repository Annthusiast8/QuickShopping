<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    /**
     * Get the current user's profile
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
     * Update the current user's profile
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
        
        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($profile->avatar) {
                Storage::disk('public')->delete($profile->avatar);
            }
            
            // Store new avatar
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $profileData['avatar'] = $avatarPath;
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
} 