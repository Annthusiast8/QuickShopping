<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required'
        ]);

        // Attempt to authenticate the user
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Get the authenticated user
        $user = User::where('email', $request->email)->first();
        
        // Generate token based on user's role
        $token = $user->createToken($user->role . '-token')->plainTextToken;

        return response()->json([
            'message' => 'Logged in successfully',
            'token' => $token,
            'user' => $user
        ]);
    }
    
    // Legacy role-based login - can be removed if not needed
    public function loginWithRole(Request $request, $role)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required'
        ]);

        // Check if the user exists with the given role
        $user = User::where('email', $request->email)
                    ->where('role', $role)
                    ->first();

        if (!$user || !Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Generate API token
        $token = $user->createToken($role . '-token')->plainTextToken;

        return response()->json([
            'message' => ucfirst($role) . ' logged in successfully',
            'token' => $token,
            'user' => $user
        ]);
    }
    
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}
