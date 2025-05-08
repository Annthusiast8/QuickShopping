<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { cartStore, type CartItem } from '$lib/stores/cart';
    
    // Mock types and data instead of importing from userStore
    interface Address {
        name: string;
        phoneNumber: string;
        street: string;
        village: string;
        city: string;
        zipCode: string;
        isDefault: boolean;
    }
    
    let selectedItems: CartItem[] = [];
    let shippingAddress: Address | null = null;
    let paymentMethod: 'cash' | 'ewallet' = 'cash';
    let shippingFee = 105;
    
    // Mockup data using profile information
    const mockUserData = {
        addresses: [
            {
                name: "Katherine Peterson",
                phoneNumber: "+1 (555) 123-4567",
                street: "123 Maple Street, Apt 4B",
                village: "Brooklyn",
                city: "NY",
                zipCode: "11201",
                isDefault: true
            }
        ]
    };
    
    // Mock cart items using the Prada sunglasses from cart page
    const mockCartItems: CartItem[] = [
        {
            product: {
                id: 101,
                seller_id: 6,
                name: "Prada Veloce X1 Sunglasses",
                description: "Luxury sunglasses with UV protection",
                price: 1250,
                stock: 10,
                image_url: "/images/sunglasses.jpg", 
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: null,
                rating: 4.8,
                review_count: 120,
                category: "Accessories",
                variations: {
                    sizes: ["Standard"],
                    sizeType: "standard" as 'standard' | 'numeric',
                    colors: ["Black", "Brown", "Gold"]
                }
            },
            quantity: 1,
            variation: {
                color: "Black",
                size: "Standard"
            },
            selected: true
        }
    ];
    
    // Get seller name function from cart page
    function getSellerName(sellerId: number): string {
        const mockBusinessProfiles: Record<string, string> = {
            '1': 'Fresh Produce Co.',
            '2': 'Organic Delights',
            '3': 'Farm Fresh Market',
            '4': 'Local Harvest',
            '5': 'Green Grocer',
            '6': 'Prada Official Store'
        };
        
        return mockBusinessProfiles[sellerId.toString()] || `Seller ${sellerId}`;
    }
    
    // Function to generate a random order ID
    function generateOrderId(): string {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
    
    // Interface for order items
    interface OrderItem {
        id: string;
        item: {
            name: string;
            image: string;
            price: number;
        };
        quantity: number;
        total_price: number;
        status: 'pending' | 'to_ship' | 'to_receive' | 'completed';
        date: string;
        seller: string;
    }
    
    // Array to track orders - in a real app, this would be handled by a store or API
    let pendingOrders: OrderItem[] = [];
    
    onMount(() => {
        // Get selected items from the cart store instead of using mock data
        selectedItems = $cartStore.items.filter(item => item.selected);
        
        // If no items are selected (shouldn't happen due to button being disabled), redirect back to cart
        if (selectedItems.length === 0) {
            goto('/page-customer/cart');
            return;
        }
        
        // Get user shipping address from mock data
        if (mockUserData && mockUserData.addresses && mockUserData.addresses.length > 0) {
            shippingAddress = mockUserData.addresses.find(address => address.isDefault) || mockUserData.addresses[0];
        }
        
        // Get any existing pending orders from localStorage
        const storedOrders = localStorage.getItem('pendingOrders');
        if (storedOrders) {
            pendingOrders = JSON.parse(storedOrders);
        }
    });
    
    $: subtotal = selectedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    $: total = subtotal + shippingFee;
    
    function handlePlaceOrder() {
        // Create new orders for each selected item
        const newOrders: OrderItem[] = selectedItems.map(item => {
            return {
                id: generateOrderId(),
                item: {
                    name: item.product.name,
                    image: item.product.image_url,
                    price: item.product.price
                },
                quantity: item.quantity,
                total_price: item.product.price * item.quantity,
                status: 'pending',
                date: new Date().toISOString().split('T')[0], // Today's date
                seller: getSellerName(item.product.seller_id)
            };
        });
        
        // Add the new orders to the pending orders list
        pendingOrders = [...pendingOrders, ...newOrders];
        
        // Save to localStorage to persist data between pages
        localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
        
        // Remove the purchased items from the cart
        selectedItems.forEach(item => {
            cartStore.removeItem(
                item.product.id,
                item.variation.color,
                item.variation.size
            );
        });
        
        // Show a success message
        alert('Order placed successfully!');
        
        // Set session flag to redirect to pending tab
        sessionStorage.setItem('fromCheckout', 'true');
        
        // Navigate to the orders page
        goto('/page-customer/profile/my-purchases');
    }
</script>

<svelte:head>
    <title>Checkout | QuickShopping</title>
</svelte:head>

<div class="max-w-6xl mx-auto px-4 py-8">
    <div class="flex flex-col lg:flex-row gap-8">
        <!-- Left column: Shipping Address and Product Details -->
        <div class="w-full lg:w-8/12">
            <!-- Shipping Address -->
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div class="flex justify-between items-center mb-3">
                    <h2 class="text-lg font-semibold">Shipping Address</h2>
                    <button class="text-blue-500 hover:text-blue-700 text-sm">Edit</button>
                </div>
                
                {#if shippingAddress}
                    <div>
                        <p class="font-medium">{shippingAddress.name} {shippingAddress.phoneNumber}</p>
                        <p class="text-gray-700">{shippingAddress.street} {shippingAddress.village}, {shippingAddress.city}, {shippingAddress.zipCode}</p>
                    </div>
                {:else}
                    <p class="text-gray-500">No shipping address available. Please add one.</p>
                {/if}
            </div>
            
            <!-- Product Details -->
            <div class="bg-white rounded-lg shadow-sm p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-semibold">Product Ordered</h2>
                    
                    {#if selectedItems.length > 0 && selectedItems[0].product.seller_id}
                        <div class="text-sm text-gray-600">
                            Shipped by {getSellerName(selectedItems[0].product.seller_id)}
                        </div>
                    {/if}
                </div>
                
                <div class="border-t pt-4">
                    {#each selectedItems as item}
                        <div class="flex items-center py-4 border-b last:border-b-0">
                            <div class="w-20 h-20 flex-shrink-0">
                                <img 
                                    src={item.product.image_url} 
                                    alt={item.product.name}
                                    class="w-full h-full object-cover rounded-md"
                                />
                            </div>
                            
                            <div class="ml-4 flex-grow">
                                <h3 class="font-medium">{item.product.name}</h3>
                                <p class="text-sm text-gray-600">Variation: {item.variation?.color || 'N/A'} {item.variation?.size ? `- ${item.variation.size}` : ''}</p>
                            </div>
                            
                            <div class="text-right">
                                <p class="font-semibold">${item.product.price.toFixed(2)}</p>
                                <p class="text-sm text-gray-600">Qty: {item.quantity}</p>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
        
        <!-- Right column: Payment Method and Order Summary -->
        <div class="w-full lg:w-4/12">
            <!-- Payment Method -->
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 class="text-lg font-semibold mb-4">Select Payment Method</h2>
                
                <div class="space-y-3">
                    <label class="flex items-center justify-between p-4 border rounded-lg cursor-pointer {paymentMethod === 'cash' ? 'border-[#789DBC]' : ''}">
                        <div class="flex items-center">
                            <input 
                                type="radio" 
                                name="payment-method" 
                                value="cash" 
                                bind:group={paymentMethod}
                                class="mr-3 hidden"
                            />
                            <span>Cash on Delivery</span>
                        </div>
                        {#if paymentMethod === 'cash'}
                            <div class="text-[#789DBC] bg-[#789DBC] bg-opacity-20 rounded-full p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        {:else}
                            <div class="h-6 w-6 border border-gray-300 rounded-full"></div>
                        {/if}
                    </label>
                    
                    <label class="flex items-center justify-between p-4 border rounded-lg cursor-pointer {paymentMethod === 'ewallet' ? 'border-[#789DBC]' : ''}">
                        <div class="flex items-center">
                            <input 
                                type="radio" 
                                name="payment-method" 
                                value="ewallet" 
                                bind:group={paymentMethod}
                                class="mr-3 hidden"
                            />
                            <span>E-Wallet</span>
                        </div>
                        {#if paymentMethod === 'ewallet'}
                            <div class="text-[#789DBC] bg-[#789DBC] bg-opacity-20 rounded-full p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        {:else}
                            <div class="h-6 w-6 border border-gray-300 rounded-full"></div>
                        {/if}
                    </label>
                </div>
            </div>
            
            <!-- Order Summary -->
            <div class="bg-white rounded-lg shadow-sm p-6">
                <h2 class="text-lg font-semibold mb-4">Order Summary</h2>
                
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Merchandise Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div class="flex justify-between">
                        <span class="text-gray-600">Shipping Subtotal</span>
                        <span>${shippingFee.toFixed(2)}</span>
                    </div>
                    
                    <div class="border-t pt-3 mt-3">
                        <div class="flex justify-between font-semibold">
                            <span>Total Payment:</span>
                            <span class="text-[#789DBC]">${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                <button 
                    class="w-full bg-[#789DBC] text-white font-semibold py-3 px-6 rounded-lg mt-6 hover:bg-[#5e7ea0] transition-colors"
                    on:click={handlePlaceOrder}
                >
                    PLACE ORDER
                </button>
            </div>
        </div>
    </div>
</div>
