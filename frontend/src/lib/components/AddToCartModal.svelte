<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { Product } from '$lib/stores/products';
    
    export let product: Product;
    export let isOpen: boolean = false;
    
    const dispatch = createEventDispatcher();
    
    let quantity: number = 1;
    let selectedColor: string = '';
    let selectedSize: string | number = '';
    let showToast = false;
    
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
        dispatch('close');
    }
    
    function handleAddToCart() {
        if (!selectedColor || (hasSizeVariations && !selectedSize)) {
            return;
        }
        
        dispatch('addToCart', { 
            product, 
            quantity,
            variation: {
                color: selectedColor,
                size: selectedSize
            }
        });
        
        // Show success toast
        showToast = true;
        
        closeModal();
    }
    
    function closeToast() {
        showToast = false;
    }
    
    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            closeModal();
        }
    }
    
    function incrementQuantity() {
        if (quantity < product.stock) {
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
    >
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 relative">
            <button 
                class="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                on:click={closeModal}
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            
            <h2 class="text-xl font-bold mb-4">Add to Cart</h2>
            
            <div class="flex mb-6">
                <div class="w-1/3 mr-4">
                    <img 
                        src={product.image_url} 
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
                    
                    <p class="text-sm text-gray-500 mt-1">{product.stock} items in stock</p>
                </div>
            </div>
            
            <div class="mb-4">
                <h3 class="block text-sm font-medium text-gray-700 mb-2">Variation</h3>
                
                <div class="mb-3">
                    <label class="block text-xs text-gray-500 mb-1">Color</label>
                    <div class="flex flex-wrap gap-2">
                        {#each colors as color}
                            <button 
                                class="px-3 py-1 border rounded-md {selectedColor === color ? 'border-[#148280] bg-[#148280] bg-opacity-10' : 'border-gray-300'}"
                                on:click={() => selectedColor = color}
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
                    <label class="block text-xs text-gray-500 mb-1">
                        Size {sizeType === 'numeric' ? `(${sizeUnit})` : ''}
                    </label>
                    <div class="flex flex-wrap gap-2">
                        {#each sizes as size}
                            <button 
                                class="px-3 py-1 border rounded-md {selectedSize === size ? 'border-[#148280] bg-[#148280] bg-opacity-10' : 'border-gray-300'}"
                                on:click={() => selectedSize = size}
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
                <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <div class="flex items-center">
                    <button 
                        class="px-3 py-1 border border-gray-300 rounded-l-md bg-gray-100 hover:bg-gray-200"
                        on:click={decrementQuantity}
                        disabled={quantity <= 1}
                    >
                        -
                    </button>
                    <input 
                        type="number" 
                        bind:value={quantity} 
                        min="1" 
                        max={product.stock}
                        class="w-16 text-center border-t border-b border-gray-300 py-1"
                    />
                    <button 
                        class="px-3 py-1 border border-gray-300 rounded-r-md bg-gray-100 hover:bg-gray-200"
                        on:click={incrementQuantity}
                        disabled={quantity >= product.stock}
                    >
                        +
                    </button>
                </div>
            </div>
            
            <div class="flex justify-end gap-2">
                <button 
                    class="px-4 py-2 border border-gray-300 bg-red-600 text-white rounded-md hover:bg-gray-600"
                    on:click={closeModal}
                >
                    Cancel
                </button>
                <button 
                    class="px-4 py-2 {(!selectedColor || (hasSizeVariations && !selectedSize)) ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-green-500'} text-white rounded-md transition-colors duration-200"
                    on:click={handleAddToCart}
                    disabled={!selectedColor || (hasSizeVariations && !selectedSize)}
                    title={(!selectedColor || (hasSizeVariations && !selectedSize)) ? 'Please select all required variations' : 'Add to cart'}
                >
                    Add to Cart
                </button>
            </div>
        </div>
    </div>
{/if}



