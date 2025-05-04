<script lang="ts">
    import AddToCartModal from '$lib/components/AddToCartModal.svelte';
    import type { Product } from '$lib/stores/products';
    
    // Sample products with different size types
    const standardSizesProduct: Product = {
        id: 1,
        seller_id: 1,
        name: "Classic T-Shirt",
        description: "A comfortable cotton t-shirt",
        price: 29.99,
        stock: 100,
        image_url: "https://via.placeholder.com/150",
        is_active: true,
        created_at: "2023-01-01",
        updated_at: null,
        rating: 4.5,
        review_count: 120,
        category: "Clothing",
        variations: {
            sizeType: 'standard',
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            colors: ['Black', 'White', 'Navy', 'Gray']
        }
    };
    
    const numericSizesProduct: Product = {
        id: 2,
        seller_id: 1,
        name: "Men's Jeans",
        description: "Premium denim jeans",
        price: 59.99,
        stock: 75,
        image_url: "https://via.placeholder.com/150",
        is_active: true,
        created_at: "2023-01-01",
        updated_at: null,
        rating: 4.2,
        review_count: 85,
        category: "Clothing",
        variations: {
            sizeType: 'numeric',
            sizeUnit: 'inch',
            sizes: [30, 32, 34, 36, 38, 40],
            colors: ['Blue', 'Black', 'Gray']
        }
    };
    
    let showStandardSizesModal = false;
    let showNumericSizesModal = false;
    
    function handleAddToCart(event: CustomEvent) {
        const { product, quantity, variation } = event.detail;
        console.log('Added to cart:', { product, quantity, variation });
        alert(`Added ${quantity} of ${product.name} to cart (Size: ${variation.size}, Color: ${variation.color})`);
    }
</script>

<div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Product Size Types Demo</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Standard Sizes Product Card -->
        <div class="border rounded-lg p-4 shadow-md">
            <h2 class="text-xl font-semibold mb-2">{standardSizesProduct.name}</h2>
            <p class="text-gray-600 mb-2">{standardSizesProduct.description}</p>
            <p class="font-bold text-lg mb-3">${standardSizesProduct.price.toFixed(2)}</p>
            <div class="mb-2">
                <span class="text-sm font-medium">Size Type:</span>
                <span class="text-sm text-gray-600">Standard (S, M, L, etc.)</span>
            </div>
            <button 
                class="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                on:click={() => showStandardSizesModal = true}
            >
                Add to Cart
            </button>
        </div>
        
        <!-- Numeric Sizes Product Card -->
        <div class="border rounded-lg p-4 shadow-md">
            <h2 class="text-xl font-semibold mb-2">{numericSizesProduct.name}</h2>
            <p class="text-gray-600 mb-2">{numericSizesProduct.description}</p>
            <p class="font-bold text-lg mb-3">${numericSizesProduct.price.toFixed(2)}</p>
            <div class="mb-2">
                <span class="text-sm font-medium">Size Type:</span>
                <span class="text-sm text-gray-600">Numeric ({numericSizesProduct.variations?.sizeUnit || 'inch'})</span>
            </div>
            <button 
                class="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                on:click={() => showNumericSizesModal = true}
            >
                Add to Cart
            </button>
        </div>
    </div>
</div>

<!-- Modal for Standard Sizes -->
<AddToCartModal 
    product={standardSizesProduct} 
    isOpen={showStandardSizesModal} 
    on:close={() => showStandardSizesModal = false}
    on:addToCart={handleAddToCart}
/>

<!-- Modal for Numeric Sizes -->
<AddToCartModal 
    product={numericSizesProduct} 
    isOpen={showNumericSizesModal} 
    on:close={() => showNumericSizesModal = false}
    on:addToCart={handleAddToCart}
/> 