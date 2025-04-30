<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function index()
    {
        return Order::where('user_id', Auth::id())
            ->with(['item.seller'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
    }

    public function sellerOrders()
    {
        return Order::whereHas('item', function ($query) {
                $query->where('seller_id', Auth::id());
            })
            ->with(['item', 'user'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);
    }

    public function store(Request $request, $itemId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'shipping_address' => 'required|string'
        ]);

        $item = Item::findOrFail($itemId);

        if ($item->stock < $request->quantity) {
            return response()->json([
                'message' => 'Not enough stock available'
            ], 400);
        }

        $order = Order::create([
            'user_id' => Auth::id(),
            'item_id' => $itemId,
            'quantity' => $request->quantity,
            'total_price' => $item->price * $request->quantity,
            'shipping_address' => $request->shipping_address,
            'status' => 'pending',
            'payment_status' => 'pending'
        ]);

        // Decrease stock
        $item->decrement('stock', $request->quantity);

        return response()->json([
            'message' => 'Order placed successfully',
            'order' => $order->load('item')
        ], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::whereHas('item', function ($query) {
            $query->where('seller_id', Auth::id());
        })->findOrFail($id);

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

    public function show($id)
    {
        $order = Order::where(function ($query) {
            $query->where('user_id', Auth::id())
                ->orWhereHas('item', function ($q) {
                    $q->where('seller_id', Auth::id());
                });
        })
        ->with(['item.seller', 'user'])
        ->findOrFail($id);

        return response()->json($order);
    }
} 