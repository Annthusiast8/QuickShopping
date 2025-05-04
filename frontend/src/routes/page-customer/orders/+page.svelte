<script lang="ts">
    import { onMount } from 'svelte';
    
    // Sample orders data
    let orders = [
        {
            id: "ORD-123456",
            date: new Date(Date.now() - 86400000 * 2), // 2 days ago
            total: 2289.97,
            status: "Delivered",
            items: [
                { 
                    name: "Gaming Laptop", 
                    price: 1999.99, 
                    quantity: 1,
                    image: "/images/laptop.jpg",
                    variations: { color: "Silver", size: "13.3" }
                },
                { 
                    name: "Portable Bluetooth Speaker", 
                    price: 89.99, 
                    quantity: 1,
                    image: "/images/speaker.jpg",
                    variations: { color: "Red" }
                },
                { 
                    name: "Premium Wireless Headphones", 
                    price: 199.99, 
                    quantity: 1,
                    image: "/images/headphones.jpg",
                    variations: { color: "White", size: "Compact" }
                }
            ]
        },
        {
            id: "ORD-123455",
            date: new Date(Date.now() - 86400000 * 10), // 10 days ago
            total: 459.98,
            status: "Delivered",
            items: [
                { 
                    name: "Smart Watch", 
                    price: 299.99, 
                    quantity: 1,
                    image: "/images/watch.jpg",
                    variations: { color: "Black" }
                },
                { 
                    name: "Fitness Tracker", 
                    price: 159.99, 
                    quantity: 1,
                    image: "/images/tracker.jpg",
                    variations: { color: "Blue" }
                }
            ]
        }
    ];
    
    // Format date
    function formatDate(date: Date): string {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Format price
    function formatPrice(price: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
    <h1 class="text-2xl font-bold mb-6">My Orders</h1>
    
    {#if orders.length === 0}
        <div class="bg-white rounded-lg shadow p-8 text-center">
            <p class="text-gray-600 mb-4">You don't have any orders yet</p>
            <a href="/page-customer/home" class="px-4 py-2 bg-[#21463E] text-white rounded-md hover:bg-[#143129]">
                Start Shopping
            </a>
        </div>
    {:else}
        {#each orders as order}
            <div class="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
                <!-- Order header -->
                <div class="p-4 bg-gray-50 border-b flex flex-wrap justify-between">
                    <div>
                        <p class="font-medium text-gray-800">Order #{order.id}</p>
                        <p class="text-sm text-gray-600">Placed on {formatDate(order.date)}</p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-[#21463E]">{formatPrice(order.total)}</p>
                        <p class="text-sm">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                {order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                                order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                                order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-gray-100 text-gray-800'}">
                                {order.status}
                            </span>
                        </p>
                    </div>
                </div>
                
                <!-- Order items -->
                <div class="divide-y divide-gray-200">
                    {#each order.items as item}
                        <div class="p-4 flex">
                            <div class="w-16 h-16 overflow-hidden rounded-md mr-4">
                                <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    class="w-full h-full object-cover" 
                                    on:error={() => { 
                                        // @ts-ignore
                                        event.target.src = '/images/placeholder.jpg'; 
                                    }}
                                />
                            </div>
                            <div class="flex-1">
                                <h3 class="font-medium text-gray-800">{item.name}</h3>
                                <div class="text-sm text-gray-600">
                                    Variations: {item.variations.color}
                                    {#if item.variations.size}
                                        , Size: {item.variations.size}
                                    {/if}
                                </div>
                                <div class="mt-1 text-sm">
                                    <span class="text-gray-700">{formatPrice(item.price)} × {item.quantity}</span>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="font-semibold text-gray-800">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                        </div>
                    {/each}
                </div>
                
                <!-- Order footer -->
                <div class="p-4 bg-gray-50 border-t flex justify-between items-center">
                    <a href="#" class="text-[#21463E] hover:underline text-sm">View Order Details</a>
                    <button class="px-4 py-2 border border-[#21463E] text-[#21463E] rounded-md hover:bg-[#21463E] hover:text-white transition-colors">
                        Track Package
                    </button>
                </div>
            </div>
        {/each}
    {/if}
</div> 