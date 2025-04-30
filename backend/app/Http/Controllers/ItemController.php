<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ItemController extends Controller
{
    public function index(Request $request)
    {
        $query = Item::query();

        if ($request->filter === 'new') {
            $query->newItems();
        } elseif ($request->filter === 'top_rated') {
            $query->topRated();
        }

        return $query->with('seller')->paginate(12);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'required|image|max:2048'
        ]);

        $imagePath = $request->file('image')->store('items', 'public');

        $item = Item::create([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
            'image' => $imagePath,
            'seller_id' => Auth::id(),
            'status' => 'active'
        ]);

        return response()->json([
            'message' => 'Item created successfully',
            'item' => $item
        ], 201);
    }

    public function myItems()
    {
        return Item::where('seller_id', Auth::id())
            ->withCount('orders')
            ->withAvg('reviews', 'rating')
            ->paginate(10);
    }

    public function show($id)
    {
        return Item::with(['reviews.user', 'seller'])
            ->withAvg('reviews', 'rating')
            ->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $item = Item::where('seller_id', Auth::id())->findOrFail($id);

        $request->validate([
            'name' => 'string|max:255',
            'description' => 'string',
            'price' => 'numeric|min:0',
            'stock' => 'integer|min:0',
            'image' => 'image|max:2048'
        ]);

        if ($request->hasFile('image')) {
            Storage::disk('public')->delete($item->image);
            $imagePath = $request->file('image')->store('items', 'public');
            $item->image = $imagePath;
        }

        $item->update($request->except('image'));

        return response()->json([
            'message' => 'Item updated successfully',
            'item' => $item
        ]);
    }

    public function destroy($id)
    {
        $item = Item::where('seller_id', Auth::id())->findOrFail($id);
        Storage::disk('public')->delete($item->image);
        $item->delete();

        return response()->json(['message' => 'Item deleted successfully']);
    }
}
