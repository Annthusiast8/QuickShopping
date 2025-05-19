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

        // Basic filters
        if ($request->filter === 'new') {
            $query->newItems();
        } elseif ($request->filter === 'top_rated') {
            $query->topRated();
        }
        
        // Category filter
        if ($request->has('category') && $request->category) {
            $query->byCategory($request->category);
        }
        
        // Price range filter
        if ($request->has('min_price') && $request->has('max_price')) {
            $query->byPriceRange($request->min_price, $request->max_price);
        }
        
        // Search by name or description
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }
        
        // Sort options
        if ($request->has('sort_by')) {
            switch ($request->sort_by) {
                case 'price_asc':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('price', 'desc');
                    break;
                case 'name_asc':
                    $query->orderBy('name', 'asc');
                    break;
                case 'name_desc':
                    $query->orderBy('name', 'desc');
                    break;
                case 'date_asc':
                    $query->orderBy('created_at', 'asc');
                    break;
                case 'date_desc':
                    $query->orderBy('created_at', 'desc');
                    break;
                case 'rating':
                    $query->withAvg('reviews', 'rating')
                          ->orderByDesc('reviews_avg_rating');
                    break;
            }
        } else {
            // Default sort by newest
            $query->orderBy('created_at', 'desc');
        }
        
        // Only active items
        $query->where('status', 'active');

        // Include relationships
        $query->with('seller');
        
        // Paginate results
        $perPage = $request->per_page ?? 12;
        return $query->paginate($perPage);
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
