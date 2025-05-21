<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { cart } from '$lib/stores/cart';
    import { orders } from '$lib/stores/orders';
    import { profile } from '$lib/stores/profile';
    import { auth } from '$lib/stores/auth';
    import Alerts from '$lib/components/Alerts.svelte';
    
    // Define CartItem interface
    interface CartItem {
        id: number;
        product: {
            id: number;
            seller_id: number;
            name: string;
            description?: string;
            price: number;
            stock: number;
            image_url?: string;
            category?: string;
            rating?: number;
            review_count?: number;
        };
        quantity: number;
        variation: {
            color?: string;
            size?: string;
        };
        selected: boolean;
    }
    
    // Define Address interface
    interface Address {
        id?: number;
        name: string;
        phoneNumber: string;
        street: string;
        village: string;
        city: string;
        zipCode: string;
        isDefault: boolean;
    }
    
    // Define the OrderItem type
    interface OrderItem {
        id: string;
        item: {
            name: string;
            image: string;
            price: number;
        };
        quantity: number;
        total_price: number;
        status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
        date: string;
        seller: string;
    }
    
    let selectedItems: CartItem[] = [];
    let addresses: Address[] = [];
    let shippingAddress: Address | null = null;
    let paymentMethod: 'cash' | 'ewallet' = 'cash';
    let shippingFee = 105; // Fixed shipping fee
    let isProcessing = false;
    let error: string | null = null;
    let showSuccessAlert = false;
    let showErrorAlert = false;
    let errorMessage = '';
    
    // Store reactive variables
    $: cartItems = $cart.items.map(item => ({
        ...item,
        selected: item.selected || false // Ensure selected property exists
    }));
    $: profileAddresses = $profile.addresses || [];
    $: cartLoading = $cart.loading;
    $: profileLoading = $profile.loading;
    $: ordersLoading = $orders.loading;
    $: loading = cartLoading || profileLoading || ordersLoading || isProcessing;
    
    // Function to generate a random order ID
    function generateOrderId(): string {
        return Math.random().toString(36).substring(2, 12);
    }
    
    // Get seller name function - would be replaced with API call in production
    function getSellerName(sellerId: number): string {
        // This would be replaced with actual data from a business/seller store
        const businessProfiles: Record<string, string> = {
            '1': 'Fresh Produce Co.',
            '2': 'Organic Delights',
            '3': 'Farm Fresh Market',
            '4': 'Local Harvest',
            '5': 'Green Grocer',
            '6': 'Prada Official Store'
        };
        
        return businessProfiles[sellerId.toString()] || `Seller ${sellerId}`;
    }
    
    // Array to track orders - in a real app, this would be handled by a store or API
    let pendingOrders: OrderItem[] = [];
    
    async function loadData() {
        try {
            // Load cart items if not already loaded
            if ($cart.items.length === 0) {
                await cart.loadCart();
            }
            
            // Load profile addresses if not already loaded
            if ($profile.addresses.length === 0) {
                await profile.loadAddresses();
            }
            
            // Get selected items from the cart store
            selectedItems = $cart.items.filter((item: CartItem) => item.selected);
            
            // If no items are selected, redirect back to cart
            if (selectedItems.length === 0) {
                goto('/page-customer/cart');
                return;
            }
            
            // Get user shipping address from profile
            addresses = $profile.addresses || [];
            if (addresses.length > 0) {
                shippingAddress = addresses.find((address: Address) => address.isDefault) || addresses[0];
            }
            
            // Get any existing pending orders from localStorage
            const storedOrders = localStorage.getItem('pendingOrders');
            if (storedOrders) {
                pendingOrders = JSON.parse(storedOrders);
            }
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to load data';
            showErrorAlert = true;
            errorMessage = error;
        }
    }
    
    onMount(() => {
        // Check if user is authenticated
        if (!$auth.user) {
            goto('/login?redirect=/page-customer/checkout');
            return;
        }
        
        loadData();
    });
    
    $: subtotal = selectedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    $: total = subtotal + shippingFee;
    
    async function handlePlaceOrder() {
        try {
            isProcessing = true;
            
            // Create checkout data for API
            const checkoutData = {
                shipping_address: shippingAddress?.id?.toString() || '',
                payment_method: paymentMethod
            };
            
            // In a real implementation, we would call the API
            // await api.checkout(checkoutData);
            
            // For now, we'll simulate the API call with local storage
            // Create new orders for each selected item
            const newOrders = selectedItems.map(item => {
                return {
                    id: generateOrderId(),
                    item: {
                        name: item.product.name,
                        image: item.product.image_url || '/images/placeholder.jpg', // Ensure image is not undefined
                        price: item.product.price
                    },
                    quantity: item.quantity,
                    total_price: item.product.price * item.quantity,
                    status: 'pending' as const,
                    date: new Date().toISOString().split('T')[0], // Today's date
                    seller: getSellerName(item.product.seller_id)
                };
            });
            
            // Add the new orders to the pending orders list
            pendingOrders = [...pendingOrders, ...newOrders];
            
            // Save to localStorage to persist data between pages
            localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
            
            // Remove the purchased items from the cart
            for (const item of selectedItems) {
                await cart.removeFromCart(
                    item.product.id,
                    {
                        color: item.variation.color,
                        size: item.variation.size
                    }
                );
            }
            
            // Show a success message
            showSuccessAlert = true;
            
            // Set session flag to redirect to pending tab
            sessionStorage.setItem('fromCheckout', 'true');
            
            // Navigate to the orders page after a short delay
            setTimeout(() => {
                goto('/page-customer/profile/my-purchases');
            }, 1500);
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to place order';
            showErrorAlert = true;
            errorMessage = error;
        } finally {
            isProcessing = false;
        }
    }
</script>

<svelte:head>
    <title>Checkout | QuickShopping</title>
</svelte:head>

{#if showSuccessAlert}
    <Alerts 
        isVisible={showSuccessAlert}
        type="success" 
        title="Order placed successfully!" 
        on:close={() => showSuccessAlert = false} 
    />
{/if}

{#if showErrorAlert}
    <Alerts 
        isVisible={showErrorAlert}
        type="error" 
        title={errorMessage} 
        on:close={() => showErrorAlert = false} 
    />
{/if}

<div class="max-w-6xl mx-auto px-4 py-8">
    {#if loading}
        <div class="flex justify-center items-center py-10">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#789DBC]"></div>
        </div>
    {:else}
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
                    disabled={loading || !shippingAddress || selectedItems.length === 0}
                >
                    {isProcessing ? 'PROCESSING...' : 'PLACE ORDER'}
                </button>
            </div>
        </div>
        </div>
    {/if}
</div>
