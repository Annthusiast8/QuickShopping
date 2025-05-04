<script lang="ts">
    import { onMount } from 'svelte';
    import { auth } from '$lib/stores/auth';
    import { profileStore } from '$lib/stores/profile';
    import { productStore, type Product } from '$lib/stores/products';
    import ProductCard from '$lib/components/ProductCard.svelte';

    // Sample products for testing
    const sampleProducts: Product[] = [
        {
            id: 5,
            seller_id: 2,
            name: "Newest Product - Gaming Laptop",
            description: "High-performance gaming laptop with RTX 4080, 32GB RAM and 1TB SSD",
            price: 1999.99,
            stock: 5,
            image_url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGxhcHRvcHxlbnwwfHwwfHx8MA%3D%3D",
            is_active: true,
            created_at: "2024-05-15", // Most recent product
            updated_at: null,
            rating: 5.0,
            review_count: 12,
            category: "Electronics"
        },
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

    // Sort products by creation date (newest first)
    function sortProductsByDate(productsToSort: Product[]): Product[] {
        return [...productsToSort].sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return dateB - dateA; // Newest first
        });
    }

    let products = sortProductsByDate(sampleProducts);
    let filteredProducts = products;
    let searchQuery = '';
    let selectedCategory: string | null = null;
    let currentSort = { by: 'date', order: 'desc', label: 'Newest First' };
    const loading = false;
    const error = null;

    onMount(() => {
        // Default to sorting by buyers count initially
        sortProductsByBuyers();
        currentSort = { by: 'buyers', order: 'desc', label: 'Most Popular' };

        window.addEventListener('searchProducts', ((event: CustomEvent) => {
            searchQuery = event.detail.query.toLowerCase();
            filterProducts();
        }) as EventListener);

        window.addEventListener('sortProducts', ((event: CustomEvent) => {
            const { sortBy, sortOrder } = event.detail;
            
            // Update the current sort
            if (sortBy === 'name') {
                currentSort = { by: 'name', order: sortOrder, label: 'Name: A to Z' };
                sortProductsByName(sortOrder);
            } else if (sortBy === 'price') {
                currentSort = { 
                    by: 'price', 
                    order: sortOrder, 
                    label: sortOrder === 'asc' ? 'Price: Low to High' : 'Price: High to Low' 
                };
                sortProductsByPrice(sortOrder);
            } else if (sortBy === 'date') {
                currentSort = { 
                    by: 'date', 
                    order: sortOrder, 
                    label: sortOrder === 'asc' ? 'Oldest First' : 'Newest First' 
                };
                sortProductsByCreationDate(sortOrder);
            } else if (sortBy === 'rating') {
                currentSort = { 
                    by: 'rating', 
                    order: sortOrder, 
                    label: sortOrder === 'asc' ? 'Lowest Rated' : 'Highest Rated' 
                };
                sortProductsByRating(sortOrder);
            } else if (sortBy === 'buyers') {
                currentSort = { 
                    by: 'buyers', 
                    order: sortOrder, 
                    label: sortOrder === 'asc' ? 'Least Popular' : 'Most Popular' 
                };
                sortProductsByBuyers(sortOrder);
            }
        }) as EventListener);

        window.addEventListener('filterByCategory', ((event: CustomEvent) => {
            selectedCategory = event.detail.category;
            filterProducts();
        }) as EventListener);

        window.addEventListener('removeFilters', (() => {
            // Reset all filters and sorting
            searchQuery = '';
            selectedCategory = null;
            currentSort = { by: 'buyers', order: 'desc', label: 'Most Popular' }; 
            filteredProducts = [...products].sort((a, b) => {
                // Calculate buyers count consistently based on product ID
                const buyersCountA = (a.id * 123) % 1000 + 50;
                const buyersCountB = (b.id * 123) % 1000 + 50;
                return buyersCountB - buyersCountA; // Most buyers first
            });
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

    function sortProductsByCreationDate(order: string) {
        filteredProducts = [...filteredProducts].sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return order === 'asc'
                ? dateA - dateB // Oldest first
                : dateB - dateA; // Newest first
        });
    }

    function sortProductsByRating(order: string = 'desc') {
        filteredProducts = [...filteredProducts].sort((a, b) => {
            const ratingA = a.rating || 0;
            const ratingB = b.rating || 0;
            return order === 'asc'
                ? ratingA - ratingB // Lowest first
                : ratingB - ratingA; // Highest first
        });
    }

    // New function to sort by buyers count
    function sortProductsByBuyers(order: string = 'desc') {
        // Use the same buyer count calculation as in ProductCard
        filteredProducts = [...filteredProducts].sort((a, b) => {
            // Calculate buyers count consistently based on product ID
            const buyersCountA = (a.id * 123) % 1000 + 50;
            const buyersCountB = (b.id * 123) % 1000 + 50;
            return order === 'asc'
                ? buyersCountA - buyersCountB // Least buyers first
                : buyersCountB - buyersCountA; // Most buyers first
        });
    }

    function filterProducts() {
        let tempProducts = [...products];

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

        // Apply current sort
        if (currentSort.by === 'name') {
            tempProducts = tempProducts.sort((a, b) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                return currentSort.order === 'asc' 
                    ? nameA.localeCompare(nameB)
                    : nameB.localeCompare(nameA);
            });
        } else if (currentSort.by === 'price') {
            tempProducts = tempProducts.sort((a, b) => {
                return currentSort.order === 'asc' 
                    ? a.price - b.price // Low to high
                    : b.price - a.price; // High to low
            });
        } else if (currentSort.by === 'date') {
            tempProducts = tempProducts.sort((a, b) => {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return currentSort.order === 'asc'
                    ? dateA - dateB // Oldest first
                    : dateB - dateA; // Newest first
            });
        } else if (currentSort.by === 'rating') {
            tempProducts = tempProducts.sort((a, b) => {
                const ratingA = a.rating || 0;
                const ratingB = b.rating || 0;
                return currentSort.order === 'asc'
                    ? ratingA - ratingB // Lowest first
                    : ratingB - ratingA; // Highest first
            });
        } else if (currentSort.by === 'buyers') {
            tempProducts = tempProducts.sort((a, b) => {
                // Calculate buyers count consistently based on product ID
                const buyersCountA = (a.id * 123) % 1000 + 50;
                const buyersCountB = (b.id * 123) % 1000 + 50;
                return currentSort.order === 'asc'
                    ? buyersCountA - buyersCountB // Least buyers first
                    : buyersCountB - buyersCountA; // Most buyers first
            });
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

    <!-- Sort controls -->
    <div class="flex justify-end mb-4">
        <div class="relative inline-block text-left">
            <button type="button" class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none" 
                on:click={() => document.getElementById('sort-menu')?.classList.toggle('hidden')}
            >
                Sort by:
                <svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
            <div id="sort-menu" class="hidden origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div class="py-1" role="menu" aria-orientation="vertical">
                    <button 
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" 
                        role="menuitem"
                        on:click={() => {
                            window.dispatchEvent(new CustomEvent('sortProducts', { detail: { sortBy: 'rating', sortOrder: 'desc' } }));
                            document.getElementById('sort-menu')?.classList.add('hidden');
                        }}
                    >
                        Top Rated
                    </button>
                    <button 
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" 
                        role="menuitem"
                        on:click={() => {
                            window.dispatchEvent(new CustomEvent('sortProducts', { detail: { sortBy: 'date', sortOrder: 'desc' } }));
                            document.getElementById('sort-menu')?.classList.add('hidden');
                        }}
                    >
                        Newest First
                    </button>
                    <button 
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" 
                        role="menuitem"
                        on:click={() => {
                            window.dispatchEvent(new CustomEvent('sortProducts', { detail: { sortBy: 'date', sortOrder: 'asc' } }));
                            document.getElementById('sort-menu')?.classList.add('hidden');
                        }}
                    >
                        Oldest First
                    </button>
                    <button 
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" 
                        role="menuitem"
                        on:click={() => {
                            window.dispatchEvent(new CustomEvent('removeFilters'));
                            document.getElementById('sort-menu')?.classList.add('hidden');
                        }}
                    >
                        Remove Sort
                    </button>

                </div>
            </div>
        </div>
    </div>

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
