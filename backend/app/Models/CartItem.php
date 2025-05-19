<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    protected $fillable = [
        'cart_id',
        'item_id',
        'quantity',
        'variation',
        'selected'
    ];

    protected $casts = [
        'variation' => 'array',
        'selected' => 'boolean'
    ];

    /**
     * Get the cart that owns the item.
     */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    /**
     * Get the product item.
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
} 