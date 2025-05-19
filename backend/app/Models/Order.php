<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'item_id',
        'quantity',
        'total_price',
        'shipping_address',
        'variation',
        'status',
        'payment_status',
        'payment_method'
    ];

    protected $casts = [
        'variation' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    public function seller()
    {
        return $this->item->seller();
    }
} 