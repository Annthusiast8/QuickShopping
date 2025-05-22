<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Shop;
use App\Models\Item;
use App\Models\Order;
use App\Models\ProductVariation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class SellerController extends Controller
{
    /**
     * Health check endpoint for the seller API
     */
    public function checkHealth()
    {
        return response()->json(['status' => 'Seller API is working!']);
    }
    
    /**
     * Get the current seller's business profile
     */
    public function getProfile()
    {
        $user = Auth::user();
        $shop = $user->shop;
        
        if (!$shop) {
            $shop = Shop::create([
                'user_id' => $user->id,
                'name' => $user->name . "'s Shop",
                'is_active' => true,
                'is_approved' => false
            ]);
        }
        
        // Make sure we're returning the latest data from the database
        $shop->refresh();
        
        return response()->json([
            'user' => $user,
            'shop' => $shop
        ]);
    }
    
    /**
     * Update the current seller's business profile
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $shop = $user->shop;
        
        if (!$shop) {
            $shop = Shop::create([
                'user_id' => $user->id,
                'name' => $user->name . "'s Shop",
                'is_active' => true
            ]);
        }
        
        $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'logo' => 'nullable|image|max:2048',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255'
        ]);
        
        // Update shop data
        if ($request->has('name')) {
            $shop->name = $request->name;
        }
        
        if ($request->has('description')) {
            $shop->description = $request->description;
        }
        
        if ($request->has('contact_email')) {
            $shop->contact_email = $request->contact_email;
        }
        
        if ($request->has('contact_phone')) {
            $shop->contact_phone = $request->contact_phone;
        }
        
        if ($request->has('address')) {
            $shop->address = $request->address;
        }
        
        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($shop->logo_url) {
                Storage::disk('public')->delete($shop->logo_url);
            }
            
            // Store new logo
            $logoPath = $request->file('logo')->store('shop_logos', 'public');
            $shop->logo_url = $logoPath;
        }
        
        $shop->save();
        
        return response()->json([
            'message' => 'Shop profile updated successfully',
            'shop' => $shop
        ]);
    }
    
    /**
     * Get all products for the current seller
     */
    public function getProducts()
    {
        $products = Item::where('seller_id', Auth::id())
            ->withCount('orders')
            ->withAvg('reviews', 'rating')
            ->paginate(10);
            
        return response()->json($products);
    }
    
    /**
     * Add a new product
     */
    public function addProduct(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category' => 'required|string|max:100',
            'variations' => 'nullable|array',
            'image' => 'required|image|max:2048'
        ]);
        
        // Handle image upload
        $imagePath = $request->file('image')->store('items', 'public');
        
        // Create product
        $product = Item::create([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
            'image' => $imagePath,
            'seller_id' => Auth::id(),
            'status' => 'active',
            'category' => $request->category,
            'variations' => $request->variations
        ]);
        
        return response()->json([
            'message' => 'Product added successfully',
            'product' => $product
        ], 201);
    }
    
    /**
     * Update an existing product
     */
    public function updateProduct(Request $request, $id)
    {
        $product = Item::where('seller_id', Auth::id())->findOrFail($id);
        
        $request->validate([
            'name' => 'string|max:255',
            'description' => 'string',
            'price' => 'numeric|min:0',
            'stock' => 'integer|min:0',
            'category' => 'string|max:100',
            'variations' => 'nullable|array',
            'image' => 'nullable|image|max:2048'
        ]);
        
        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            
            // Store new image
            $imagePath = $request->file('image')->store('items', 'public');
            $product->image = $imagePath;
        }
        
        // Update product data
        if ($request->has('name')) {
            $product->name = $request->name;
        }
        
        if ($request->has('description')) {
            $product->description = $request->description;
        }
        
        if ($request->has('price')) {
            $product->price = $request->price;
        }
        
        if ($request->has('stock')) {
            $product->stock = $request->stock;
        }
        
        if ($request->has('category')) {
            $product->category = $request->category;
        }
        
        if ($request->has('variations')) {
            $product->variations = $request->variations;
        }
        
        $product->save();
        
        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product
        ]);
    }
    
    /**
     * Delete a product
     */
    public function deleteProduct($id)
    {
        $product = Item::where('seller_id', Auth::id())->findOrFail($id);
        
        // Delete product image
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }
        
        $product->delete();
        
        return response()->json([
            'message' => 'Product deleted successfully'
        ]);
    }
    
    /**
     * Add a variation to a product
     */
    public function addProductVariation(Request $request, $id)
    {
        $product = Item::where('seller_id', Auth::id())->findOrFail($id);
        
        $request->validate([
            'size' => 'required',
            'color' => 'required|string|max:50',
            'stock' => 'required|integer|min:0',
            'price_adjustment' => 'nullable|numeric',
            'sku' => 'nullable|string|max:50'
        ]);
        
        $variation = ProductVariation::create([
            'item_id' => $id,
            'size' => $request->size,
            'color' => $request->color,
            'stock' => $request->stock,
            'price_adjustment' => $request->price_adjustment ?? 0,
            'sku' => $request->sku
        ]);
        
        return response()->json([
            'message' => 'Variation added successfully',
            'variation' => $variation
        ], 201);
    }
    
    /**
     * Update a product variation
     */
    public function updateProductVariation(Request $request, $id, $variationId)
    {
        // Ensure the product belongs to the seller
        $product = Item::where('seller_id', Auth::id())->findOrFail($id);
        
        // Find the variation
        $variation = ProductVariation::where('item_id', $id)
            ->findOrFail($variationId);
            
        $request->validate([
            'size' => 'nullable',
            'color' => 'nullable|string|max:50',
            'stock' => 'nullable|integer|min:0',
            'price_adjustment' => 'nullable|numeric',
            'sku' => 'nullable|string|max:50'
        ]);
        
        $variation->update($request->all());
        
        return response()->json([
            'message' => 'Variation updated successfully',
            'variation' => $variation
        ]);
    }
    
    /**
     * Delete a product variation
     */
    public function deleteProductVariation($id, $variationId)
    {
        // Ensure the product belongs to the seller
        $product = Item::where('seller_id', Auth::id())->findOrFail($id);
        
        // Find and delete the variation
        $variation = ProductVariation::where('item_id', $id)
            ->findOrFail($variationId);
            
        $variation->delete();
        
        return response()->json([
            'message' => 'Variation deleted successfully'
        ]);
    }
    
    /**
     * Get all orders for the seller's products
     */
    public function getOrders()
    {
        $orders = Order::whereHas('item', function ($query) {
                $query->where('seller_id', Auth::id());
            })
            ->with(['item', 'user'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
            
        return response()->json($orders);
    }
    
    /**
     * Update an order status
     */
    public function updateOrderStatus(Request $request, $id)
    {
        $order = Order::whereHas('item', function ($query) {
                $query->where('seller_id', Auth::id());
            })
            ->findOrFail($id);
            
        $request->validate([
            'status' => 'required|in:approved,rejected,completed'
        ]);
        
        $order->update([
            'status' => $request->status
        ]);
        
        // If rejected, return stock
        if ($request->status === 'rejected') {
            $order->item->increment('stock', $order->quantity);
        }
        
        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order->load(['item', 'user'])
        ]);
    }
}
