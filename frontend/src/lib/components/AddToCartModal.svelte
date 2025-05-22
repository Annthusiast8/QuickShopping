<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { cart } from '$lib/stores/cart';
    import { goto } from '$app/navigation';
    import Alerts from './Alerts.svelte';
    import type { CartItemData } from '$lib/services/api';
    
    // Define Product interface inline to avoid dependency issues
    interface Product {
        id: number;
        seller_id?: number;
        name: string;
        description?: string;
        price: number;
        stock?: number;
        image_url?: string;
        is_active?: boolean;
        created_at?: string;
        updated_at?: string | null;
        rating?: number;
        review_count?: number;
        category?: string;
        variations?: {
            sizes?: any[];
            sizeType?: string;
            sizeUnit?: string;
            colors?: string[];
        };
    }
    
    export let product: Product;
    export let isOpen: boolean = false;
    export let buyNow: boolean = false;
    
    const dispatch = createEventDispatcher();
    
    let quantity: number = 1;
    let selectedColor: string = '';
    let selectedSize: string | number = '';
    let showAlert = false;
    let alertType: 'success' | 'error' = 'success';
    let loading = false;
    let error: string | null = null;
    
    // Default sizes if product doesn't specify variations
    const defaultStandardSizes = ['XS', 'S', 'M', 'L', 'XL'];
    const defaultNumericSizes = [36, 38, 40, 42, 44];
    
    // Determine if we're using standard or numeric sizes
    $: sizeType = product.variations?.sizeType || 'standard';
    $: sizeUnit = product.variations?.sizeUnit || 'cm';
    $: sizes = product.variations?.sizes || 
        (sizeType === 'standard' ? defaultStandardSizes : defaultNumericSizes);
    
    // Colors from product or default
    $: colors = product.variations?.colors || ['Red', 'Blue', 'Black', 'White', 'Green'];
    
    // Check if sizes array is empty to determine if the product has size variations
    $: hasSizeVariations = Array.isArray(sizes) && sizes.length > 0;
    
    // Reset form when modal is opened
    $: if (isOpen) {
        selectedColor = '';
        selectedSize = hasSizeVariations ? '' : 'N/A'; // Set default size to 'N/A' if no sizes available
        quantity = 1;
    }
    
    function closeModal() {
        // Reset state
        error = null;
        dispatch('close');
    }
    
    async function handleAddToCart() {
        if (!selectedColor || (hasSizeVariations && !selectedSize)) {
            return;
        }
        
        loading = true;
        error = null;
        
        try {
            // Create cart item data according to the API interface
            const cartItem: CartItemData = {
                item_id: product.id,
                quantity: quantity,
                variation: {
                    color: selectedColor,
                    size: String(selectedSize)
                }
            };
            
            if (buyNow) {
                // Add to cart and redirect to checkout
                await cart.addToCart(cartItem);
                closeModal();
                
                // Show success alert briefly before redirecting
                alertType = 'success';
                showAlert = true;
                
                setTimeout(() => {
                    goto('/page-customer/cart');
                    setTimeout(() => {
                        goto('/page-customer/checkout');
                    }, 100);
                }, 500);
            } else {
                // Just add to cart
                await cart.addToCart(cartItem);
                
                // Show success alert
                alertType = 'success';
                showAlert = true;
                
                // Close modal after a delay
                setTimeout(() => {
                    showAlert = false;
                    closeModal();
                }, 1500);
            }
            
            // Notify parent component
            const detail = { 
                product, 
                quantity,
                variation: {
                    color: selectedColor,
                    size: selectedSize
                }
            };
            
            dispatch('addToCart', detail);
        } catch (err) {
            console.error('Add to cart error:', err);
            // Handle error
            error = err instanceof Error ? err.message : 'Failed to add item to cart';
            alertType = 'error';
            showAlert = true;
        } finally {
            loading = false;
        }
    }
    
    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            closeModal();
        }
    }
    
    function incrementQuantity() {
        const maxStock = product.stock ?? 10; // Default to 10 if stock is undefined
        if (quantity < maxStock) {
            quantity++;
        }
    }
    
    function decrementQuantity() {
        if (quantity > 1) {
            quantity--;
        }
    }
    
    function formatSize(size: string | number): string {
        if (sizeType === 'numeric' && typeof size === 'number') {
            return `${size} ${sizeUnit}`;
        }
        return String(size);
    }
</script>

{#if isOpen}
    <div 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        on:click={handleBackdropClick}
        on:keydown={(e) => e.key === 'Escape' && closeModal()}
        role="dialog"
        tabindex="0"
        aria-modal="true"
        aria-labelledby="modal-title"
    >
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 relative">
            <button 
                class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
                on:click={closeModal}
                aria-label="Close"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            
            <h2 id="modal-title" class="text-xl font-bold mb-4">{buyNow ? 'Place Order' : 'Add to Cart'}</h2>
            
            <!-- Error message -->
            {#if error}
                <div class="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {error}
                </div>
            {/if}
            
            <div class="flex mb-6">
                <div class="w-1/3 mr-4">
                    <img 
                        src={product.image_url || 'https://via.placeholder.com/150'} 
                        alt={product.name}
                        class="w-full h-auto rounded-md object-cover"
                    />
                </div>
                
                <div class="w-2/3">
                    <h3 class="font-medium text-lg mb-1">{product.name}</h3>
                    
                    <div class="flex items-center mb-2">
                        <div class="flex text-yellow-400 mr-1">
                            {#each Array(5) as _, i}
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill={i < Math.floor(product.rating || 0) ? 'currentColor' : 'none'}>
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            {/each}
                        </div>
                        <span class="text-sm text-gray-600">{product.rating || 0} ({product.review_count || 0} reviews)</span>
                    </div>
                    
                    <p class="text-lg font-bold text-[#21463E]">${product.price.toFixed(2)}</p>
                    
                    <p class="text-sm text-gray-500 mt-1">{product.stock ?? 'Unknown'} items in stock</p>
                </div>
            </div>
            
            <div class="mb-4">
                <h3 class="block text-sm font-medium text-gray-700 mb-2">Variation</h3>
                
                <div class="mb-3">
                    <label id="color-label" class="block text-xs text-gray-500 mb-1">Color</label>
                    <div class="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="color-label">
                        {#each colors as color}
                            <button 
                                class="px-3 py-1 border rounded-md {selectedColor === color ? 'border-[#148280] bg-[#148280] bg-opacity-10' : 'border-gray-300'}"
                                on:click={() => selectedColor = color}
                                role="radio"
                                aria-checked={selectedColor === color}
                            >
                                {color}
                            </button>
                        {/each}
                    </div>
                    {#if !selectedColor && colors.length > 0}
                        <p class="text-xs text-red-500 mt-1">Please select a color</p>
                    {/if}
                </div>
                
                {#if hasSizeVariations}
                <div>
                    <label id="size-label" class="block text-xs text-gray-500 mb-1">
                        Size {sizeType === 'numeric' ? `(${sizeUnit})` : ''}
                    </label>
                    <div class="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="size-label">
                        {#each sizes as size}
                            <button 
                                class="px-3 py-1 border rounded-md {selectedSize === size ? 'border-[#148280] bg-[#148280] bg-opacity-10' : 'border-gray-300'}"
                                on:click={() => selectedSize = size}
                                role="radio"
                                aria-checked={selectedSize === size}
                            >
                                {formatSize(size)}
                            </button>
                        {/each}
                    </div>
                    {#if !selectedSize && sizes.length > 0}
                        <p class="text-xs text-red-500 mt-1">Please select a size</p>
                    {/if}
                </div>
                {/if}
            </div>
            
            <div class="mb-6">
                <label for="quantity-input" class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <div class="flex items-center">
                    <button 
                        class="px-3 py-1 border border-gray-300 rounded-l-md bg-gray-100 hover:bg-gray-200"
                        on:click={decrementQuantity}
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                        </svg>
                    </button>
                    
                    <input 
                        id="quantity-input"
                        type="number" 
                        bind:value={quantity}
                        min="1"
                        max={product.stock ?? 10}
                        class="w-16 text-center border-t border-b border-gray-300 py-1"
                        aria-label="Quantity"
                    />
                    
                    <button 
                        class="px-3 py-1 border border-gray-300 rounded-r-md bg-gray-100 hover:bg-gray-200"
                        on:click={incrementQuantity}
                        disabled={quantity >= (product.stock ?? 10)}
                        aria-label="Increase quantity"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
            </div>
            
            <div class="flex justify-end gap-2">
                <button 
                    class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    on:click={closeModal}
                    disabled={loading}
                >
                    Cancel
                </button>
                <button 
                    class="px-4 py-2 {(!selectedColor || (hasSizeVariations && !selectedSize) || loading) ? 'bg-gray-400 cursor-not-allowed' : buyNow ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-[#21463E] hover:bg-[#143129]'} text-white rounded-md transition-colors duration-200 flex items-center"
                    on:click={handleAddToCart}
                    disabled={!selectedColor || (hasSizeVariations && !selectedSize) || loading}
                    title={(!selectedColor || (hasSizeVariations && !selectedSize)) ? 'Please select all required variations' : buyNow ? 'Checkout' : 'Add to cart'}
                >
                    {#if loading}
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    {:else}
                        {buyNow ? 'Checkout' : 'Add to Cart'}
                    {/if}
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- Alert for success/error messages -->
<Alerts 
    isVisible={showAlert} 
    type={alertType === 'success' ? 'success' : 'error'}
    title={alertType === 'success' ? (buyNow ? 'Proceeding to Checkout' : 'Added to Cart') : 'Error'}
    cartAdded={alertType === 'success' ? `${product.name} has been added to your cart` : error || 'Failed to add item to cart'}
    autoDismiss={alertType === 'success'}
    on:close={() => showAlert = false} 
/>
