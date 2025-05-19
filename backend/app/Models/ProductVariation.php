<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariation extends Model
{
    protected $fillable = [
        'item_id',
        'size',
        'color',
        'stock',
        'price_adjustment',
        'sku'
    ];

    protected $casts = [
        'price_adjustment' => 'float'
    ];

    /**
     * Get the item that owns the variation.
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
} 