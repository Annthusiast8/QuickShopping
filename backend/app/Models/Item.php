<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Item extends Model
{
    protected $fillable = [
        'name',
        'description',
        'price',
        'image',
        'seller_id',
        'stock',
        'status',
        'category',
        'variations'
    ];

    protected $appends = ['average_rating'];

    protected $casts = [
        'variations' => 'array',
        'price' => 'float'
    ];

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function getAverageRatingAttribute()
    {
        return $this->reviews()->avg('rating') ?? 0;
    }

    public function scopeNewItems($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    public function scopeTopRated($query)
    {
        return $query->withAvg('reviews', 'rating')
                    ->orderByDesc('reviews_avg_rating');
    }

    public function variations()
    {
        return $this->hasMany(ProductVariation::class);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByPriceRange($query, $min, $max)
    {
        return $query->whereBetween('price', [$min, $max]);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
    }

    /**
     * Get all reports for this item
     */
    public function reports()
    {
        return $this->hasMany(ItemReport::class);
    }
}
