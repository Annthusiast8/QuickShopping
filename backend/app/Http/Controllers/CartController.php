<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Item;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    /**
     * Get the current user's cart
     */
    public function getCart()
    {
        $cart = Cart::where('user_id', Auth::id())
            ->with(['items.item', 'items.variation'])
            ->first();
            
        if (!$cart) {
            $cart = Cart::create([
                'user_id' => Auth::id()
            ]);
        }
        
        return response()->json($cart);
    }
    
    /**
     * Add an item to the cart
     */
    public function addToCart(Request $request)
    {
        $request->validate([
            'item_id' => 'required|exists:items,id',
            'quantity' => 'required|integer|min:1',
            'variation' => 'required|array',
            'variation.color' => 'required|string',
            'variation.size' => 'required'
        ]);
        
        $item = Item::findOrFail($request->item_id);
        
        // Check if there's enough stock
        if ($item->stock < $request->quantity) {
            return response()->json([
                'message' => 'Not enough stock available'
            ], 400);
        }
        
        // Get or create cart
        $cart = Cart::firstOrCreate([
            'user_id' => Auth::id()
        ]);
        
        // Check if item with same variation already exists in cart
        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('item_id', $request->item_id)
            ->where('variation->color', $request->variation['color'])
            ->where('variation->size', $request->variation['size'])
            ->first();
            
        if ($cartItem) {
            // Update quantity if item exists
            $newQuantity = $cartItem->quantity + $request->quantity;
            
            if ($newQuantity > $item->stock) {
                return response()->json([
                    'message' => 'Not enough stock available'
                ], 400);
            }
            
            $cartItem->quantity = $newQuantity;
            $cartItem->save();
        } else {
            // Create new cart item
            $cartItem = CartItem::create([
                'cart_id' => $cart->id,
                'item_id' => $request->item_id,
                'quantity' => $request->quantity,
                'variation' => $request->variation,
                'selected' => true
            ]);
        }
        
        return response()->json([
            'message' => 'Item added to cart',
            'cart_item' => $cartItem->load('item')
        ]);
    }
    
    /**
     * Update cart item quantity
     */
    public function updateCartItem(Request $request, $itemId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'variation' => 'required|array',
            'variation.color' => 'required|string',
            'variation.size' => 'required',
            'selected' => 'boolean'
        ]);
        
        $cart = Cart::where('user_id', Auth::id())->first();
        
        if (!$cart) {
            return response()->json([
                'message' => 'Cart not found'
            ], 404);
        }
        
        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('item_id', $itemId)
            ->where('variation->color', $request->variation['color'])
            ->where('variation->size', $request->variation['size'])
            ->first();
            
        if (!$cartItem) {
            return response()->json([
                'message' => 'Cart item not found'
            ], 404);
        }
        
        // Check stock if quantity is being updated
        if ($request->has('quantity') && $request->quantity != $cartItem->quantity) {
            $item = Item::findOrFail($itemId);
            
            if ($request->quantity > $item->stock) {
                return response()->json([
                    'message' => 'Not enough stock available'
                ], 400);
            }
            
            $cartItem->quantity = $request->quantity;
        }
        
        // Update selected status if provided
        if ($request->has('selected')) {
            $cartItem->selected = $request->selected;
        }
        
        $cartItem->save();
        
        return response()->json([
            'message' => 'Cart item updated',
            'cart_item' => $cartItem->load('item')
        ]);
    }
    
    /**
     * Remove an item from the cart
     */
    public function removeFromCart(Request $request, $itemId)
    {
        $request->validate([
            'variation' => 'required|array',
            'variation.color' => 'required|string',
            'variation.size' => 'required'
        ]);
        
        $cart = Cart::where('user_id', Auth::id())->first();
        
        if (!$cart) {
            return response()->json([
                'message' => 'Cart not found'
            ], 404);
        }
        
        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('item_id', $itemId)
            ->where('variation->color', $request->variation['color'])
            ->where('variation->size', $request->variation['size'])
            ->first();
            
        if (!$cartItem) {
            return response()->json([
                'message' => 'Cart item not found'
            ], 404);
        }
        
        $cartItem->delete();
        
        return response()->json([
            'message' => 'Item removed from cart'
        ]);
    }
    
    /**
     * Checkout the cart
     */
    public function checkout(Request $request)
    {
        $request->validate([
            'shipping_address' => 'required|string',
            'payment_method' => 'required|string'
        ]);
        
        $cart = Cart::where('user_id', Auth::id())
            ->with(['items' => function($query) {
                $query->where('selected', true);
            }, 'items.item'])
            ->first();
            
        if (!$cart || $cart->items->isEmpty()) {
            return response()->json([
                'message' => 'No items selected for checkout'
            ], 400);
        }
        
        DB::beginTransaction();
        
        try {
            // Create orders for each item
            foreach ($cart->items as $cartItem) {
                $item = $cartItem->item;
                
                // Check stock
                if ($item->stock < $cartItem->quantity) {
                    throw new \Exception("Not enough stock for {$item->name}");
                }
                
                // Create order
                $order = Order::create([
                    'user_id' => Auth::id(),
                    'item_id' => $item->id,
                    'quantity' => $cartItem->quantity,
                    'total_price' => $item->price * $cartItem->quantity,
                    'shipping_address' => $request->shipping_address,
                    'variation' => $cartItem->variation,
                    'status' => 'pending',
                    'payment_status' => 'pending',
                    'payment_method' => $request->payment_method
                ]);
                
                // Decrease stock
                $item->decrement('stock', $cartItem->quantity);
                
                // Remove item from cart
                $cartItem->delete();
            }
            
            DB::commit();
            
            return response()->json([
                'message' => 'Checkout successful'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Checkout failed: ' . $e->getMessage()
            ], 400);
        }
    }
} 