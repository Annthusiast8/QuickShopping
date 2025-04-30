<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


use App\Http\Controllers\AdminController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\SellerController;
use App\Http\Controllers\AuthController;

use App\Http\Middleware\RoleMiddleware;

use App\Http\Controllers\RegisterController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\OrderController;

//Admin Routes -> http://127.0.0.1:8000/api/admin
Route::prefix('admin')
    ->middleware(['auth:sanctum', RoleMiddleware::class.':admin'])
    ->controller(AdminController::class)
    ->group(function () {
        Route::get('/users', 'getUsers');
        Route::put('/users/{userId}/role', 'updateUserRole');
        Route::delete('/users/{userId}', 'deleteUser');
    });


// Seller Routes
Route::prefix('seller')
    ->middleware(['auth:sanctum', RoleMiddleware::class.':seller'])
    ->controller(SellerController::class)
    ->group(function () {
        
    });

// Customer Routes
Route::prefix('customer')
    ->middleware(['auth:sanctum', RoleMiddleware::class.':customer'])
    ->controller(CustomerController::class)
    ->group(function () {
        
    });


//Auth Routes 
/*
POST /api/login → Generic login endpoint (preferred)
POST /api/login/{role} → Role-specific login (legacy)
*/ 
Route::post('/login', [AuthController::class, 'login']);
Route::post('/login/{role}', [AuthController::class, 'loginWithRole'])->where('role', 'admin|seller|customer');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

//Register Routes
/*
POST /api/register/seller → For Seller Login
POST /api/register/customer → For Customer Login
POST /api/register/admin → For Admin Registration
*/
Route::post('/register/customer', [RegisterController::class, 'registerCustomer']);
Route::post('/register/seller', [RegisterController::class, 'registerSeller']);
Route::post('/register/admin', [RegisterController::class, 'registerAdmin']);

//Health Checks
Route::prefix('/health')->group(function (){
    Route::get('/admin', [AdminController::class, 'checkHealth']);
    Route::get('/customer', [CustomerController::class, 'checkHealth']);
    Route::get('/seller', [SellerController::class, 'checkHealth']);
});

// Public routes
Route::get('/items', [ItemController::class, 'index']);
Route::get('/items/{id}', [ItemController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Item routes
    Route::post('/items', [ItemController::class, 'store']);
    Route::get('/seller/items', [ItemController::class, 'myItems']);
    Route::put('/items/{id}', [ItemController::class, 'update']);
    Route::delete('/items/{id}', [ItemController::class, 'destroy']);

    // Review routes
    Route::post('/items/{itemId}/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

    // Order routes
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/seller/orders', [OrderController::class, 'sellerOrders']);
    Route::post('/items/{itemId}/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
});