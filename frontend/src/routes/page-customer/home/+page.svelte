<script lang="ts">
    import { onMount } from 'svelte';
    import { auth } from '$lib/stores/auth';
    import { profileStore } from '$lib/stores/profile';
    import { productStore } from '$lib/stores/products';
    import ProductCard from '$lib/components/ProductCard.svelte';

    interface Product {
        id: number;
        seller_id: number;
        name: string;
        description: string | null;
        price: number;
        stock: number;
        image_url: string;
        is_active: boolean;
        created_at: string;
        updated_at: null;
        rating: number;
        review_count: number;
        category?: string;
    }

    // Sample products for testing
    const sampleProducts: Product[] = [
        {
            id: 1,
            seller_id: 1,
            name: "Premium Wireless Headphones",
            description: "High-quality wireless headphones with noise cancellation and 30-hour battery life , good for gaming and music",
            price: 199.99,
            stock: 15,
            image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aGVhZHBob25lc3xlbnwwfHwwfHx8MA%3D%3D",
            is_active: true,
            created_at: "2024-01-01",
            updated_at: null,
            rating: 4.5,
            review_count: 128,
            category: "Electronics"
        },
        {
            id: 2,
            seller_id: 1,
            name: "Smart Watch Pro",
            description: "Advanced smartwatch with health monitoring and GPS tracking , good for sports and health",
            price: 299.99,
            stock: 10,
            image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D",
            is_active: true,
            created_at: "2024-01-02",
            updated_at: null,
            rating: 4.8,
            review_count: 256,
            category: "Sports"
        },
        {
            id: 3,
            seller_id: 1,
            name: "Portable Bluetooth Speaker",
            description: "Waterproof speaker with 360° sound and 20-hour playtime",
            price: 89.99,
            stock: 25,
            image_url: "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c3BlYWtlcnxlbnwwfHwwfHx8MA%3D%3D",
            is_active: true,
            created_at: "2024-01-03",
            updated_at: null,
            rating: 4.2,
            review_count: 89,
            category: "Electronics"
        },
        {
            id: 4,
            seller_id: 1,
            name: "Ultra HD Webcam",
            description: "4K webcam with built-in microphone and auto light correction",
            price: 129.99,
            stock: 8,
            image_url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FtZXJhfGVufDB8fDB8fHww",
            is_active: true,
            created_at: "2024-01-04",
            updated_at: null,
            rating: 4.0,
            review_count: 45,
            category: "Electronics"
        }
    ];

    let products = sampleProducts;
    let filteredProducts = products;
    let searchQuery = '';
    let selectedCategory: string | null = null;
    const loading = false;
    const error = null;

    onMount(() => {
        window.addEventListener('searchProducts', ((event: CustomEvent) => {
            searchQuery = event.detail.query.toLowerCase();
            filterProducts();
        }) as EventListener);

        window.addEventListener('sortProducts', ((event: CustomEvent) => {
            const { sortBy, sortOrder } = event.detail;
            if (sortBy === 'name') {
                sortProductsByName(sortOrder);
            } else if (sortBy === 'price') {
                sortProductsByPrice(sortOrder);
            }
        }) as EventListener);

        window.addEventListener('filterByCategory', ((event: CustomEvent) => {
            selectedCategory = event.detail.category;
            filterProducts();
        }) as EventListener);
    });

    function sortProductsByName(order: string) {
        filteredProducts = [...filteredProducts].sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            return order === 'asc' 
                ? nameA.localeCompare(nameB)
                : nameB.localeCompare(nameA);
        });
    }

    function sortProductsByPrice(order: string) {
        filteredProducts = [...filteredProducts].sort((a, b) => {
            return order === 'asc' 
                ? b.price - a.price // High to low
                : a.price - b.price; // Low to high
        });
    }

    function filterProducts() {
        let tempProducts = products;

        // Apply category filter
        if (selectedCategory) {
            tempProducts = tempProducts.filter(product => 
                product.category === selectedCategory
            );
        }

        // Apply search filter
        if (searchQuery) {
            tempProducts = tempProducts.filter(product => 
                product.name.toLowerCase().includes(searchQuery) ||
                product.description?.toLowerCase().includes(searchQuery) === true
            );
        }

        filteredProducts = tempProducts;
    }

    function handleAddToCart(product: Product) {
        // TODO: Implement add to cart functionality
        console.log('Adding to cart:', product);
    }
</script>

<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Browse Products</h1>

    {#if loading}
        <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#21463E]"></div>
        </div>
    {:else if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong class="font-bold">Error!</strong>
            <span class="block sm:inline"> {error}</span>
        </div>
    {:else if filteredProducts.length === 0}
        <div class="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p class="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
        </div>
    {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {#each filteredProducts as product}
                <ProductCard {product} onAddToCart={handleAddToCart} />
            {/each}
        </div>
    {/if}
</div>
