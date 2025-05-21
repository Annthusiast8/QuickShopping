<script lang="ts">
    import { onMount } from 'svelte';
    import { auth } from '$lib/stores/auth';
    import { profileStore } from '$lib/stores/profile';
    import { productStore, type Product } from '$lib/stores/products';
    import ProductCard from '$lib/components/ProductCard.svelte';
    import { cartStore } from '$lib/stores/cart';

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
            category: "Electronics",
            variations: {
                sizes: [13.3, 15.6, 17.3],
                sizeType: 'numeric',
                sizeUnit: 'inch',
                colors: ['Black', 'Silver', 'Space Gray']
            }
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
            category: "Electronics",
            variations: {
                sizes: ['Standard', 'Compact'],
                sizeType: 'standard',
                colors: ['Black', 'White', 'Rose Gold', 'Blue']
            }
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
            category: "Sports",
            variations: {
                sizes: [38, 40, 42, 44],
                sizeType: 'numeric',
                sizeUnit: 'mm',
                colors: ['Black', 'Silver', 'Gold', 'Blue']
            }
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
            category: "Electronics",
            variations: {
                sizes: ['Mini', 'Standard', 'XL'],
                sizeType: 'standard',
                colors: ['Black', 'Blue', 'Red', 'Green']
            }
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
            category: "Electronics",
            variations: {
                sizes: [],
                sizeType: 'standard',
                colors: ['Black', 'White']
            }
        }
    ];

    // Categories based on products
    const categories = [
        { id: 'electronics', name: 'Electronics', count: sampleProducts.filter(p => p.category === 'Electronics').length },
        { id: 'clothing', name: 'Clothing', count: 28 },
        { id: 'home-kitchen', name: 'Home & Kitchen', count: 42 },
        { id: 'beauty-health', name: 'Beauty & Health', count: 35 },
        { id: 'gaming', name: 'Gaming', count: 17 },
    ];

    // Sort options
    const sortOptions = [
        { id: 'best-sellers', name: 'Best Sellers', sortBy: 'buyers', sortOrder: 'desc' },
        { id: 'price-low-high', name: 'Price: Low to High', sortBy: 'price', sortOrder: 'asc' },
        { id: 'price-high-low', name: 'Price: High to Low', sortBy: 'price', sortOrder: 'desc' },
        { id: 'newest', name: 'New Arrivals', sortBy: 'date', sortOrder: 'desc' }
    ];

    // Track selected sort options
    let selectedSortOptions = new Set(['best-sellers']);

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
    
    // UI state
    let isCategoryExpanded = true;
    let isSortExpanded = true;
    let isFilterSidebarVisible = false; // Control mobile sidebar visibility

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
            selectedSortOptions = new Set(['best-sellers']);
            filterProducts();
        }) as EventListener);
        
        // Close sidebar on window resize if it's a larger screen
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) { // md breakpoint
                isFilterSidebarVisible = false;
            }
        });
        
        // Close sidebar when clicking outside
        document.addEventListener('click', (event) => {
            const sidebar = document.getElementById('mobile-filter-sidebar');
            const toggleButton = document.getElementById('filter-toggle-button');
            
            if (isFilterSidebarVisible && sidebar && !sidebar.contains(event.target as Node) && 
                toggleButton && !toggleButton.contains(event.target as Node)) {
                isFilterSidebarVisible = false;
            }
        });
    });

    function toggleFilterSidebar() {
        isFilterSidebarVisible = !isFilterSidebarVisible;
        // Add overflow hidden to body when filter is visible to prevent scrolling behind the dropdown
        if (isFilterSidebarVisible) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

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
                ? a.price - b.price // Low to high
                : b.price - a.price; // High to low
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

        // Apply multiple sort criteria
        if (selectedSortOptions.size > 0) {
            // Convert to array for stable sorting
            let sortingCriteria = Array.from(selectedSortOptions)
                .map(id => sortOptions.find(opt => opt.id === id))
                .filter(opt => opt !== undefined);
            
            // Apply each sort criterion in order
            if (sortingCriteria.length > 0) {
                tempProducts = applySortingCriteria(tempProducts, sortingCriteria);
            }
        }

        filteredProducts = tempProducts;
    }

    function applySortingCriteria(products: Product[], criteria: any[]) {
        // Start with a copy of the products
        let sortedProducts = [...products];
        
        // Apply each criterion in order
        for (const criterion of criteria) {
            if (criterion.sortBy === 'name') {
                sortedProducts = sortedProducts.sort((a, b) => {
                    const nameA = a.name.toLowerCase();
                    const nameB = b.name.toLowerCase();
                    return criterion.sortOrder === 'asc' 
                        ? nameA.localeCompare(nameB)
                        : nameB.localeCompare(nameA);
                });
            } else if (criterion.sortBy === 'price') {
                sortedProducts = sortedProducts.sort((a, b) => {
                    return criterion.sortOrder === 'asc' 
                        ? a.price - b.price // Low to high
                        : b.price - a.price; // High to low
                });
            } else if (criterion.sortBy === 'date') {
                sortedProducts = sortedProducts.sort((a, b) => {
                    const dateA = new Date(a.created_at).getTime();
                    const dateB = new Date(b.created_at).getTime();
                    return criterion.sortOrder === 'asc'
                        ? dateA - dateB // Oldest first
                        : dateB - dateA; // Newest first
                });
            } else if (criterion.sortBy === 'rating') {
                sortedProducts = sortedProducts.sort((a, b) => {
                    const ratingA = a.rating || 0;
                    const ratingB = b.rating || 0;
                    return criterion.sortOrder === 'asc'
                        ? ratingA - ratingB // Lowest first
                        : ratingB - ratingA; // Highest first
                });
            } else if (criterion.sortBy === 'buyers') {
                sortedProducts = sortedProducts.sort((a, b) => {
                    // Calculate buyers count consistently based on product ID
                    const buyersCountA = (a.id * 123) % 1000 + 50;
                    const buyersCountB = (b.id * 123) % 1000 + 50;
                    return criterion.sortOrder === 'asc'
                        ? buyersCountA - buyersCountB // Least buyers first
                        : buyersCountB - buyersCountA; // Most buyers first
                });
            }
        }
        
        return sortedProducts;
    }

    function handleAddToCart(product: Product) {
        console.log('Product added to cart:', product);
        // The actual adding to cart is now handled in ProductCard component via cartStore
    }

    function handleCategorySelect(category: string) {
        selectedCategory = category === selectedCategory ? null : category;
        filterProducts();
        // Close mobile sidebar after selection on small screens
        if (window.innerWidth < 768) {
            isFilterSidebarVisible = false;
        }
    }

    function handleSortOptionToggle(option: {id: string, sortBy: string, sortOrder: string, name: string}) {
        // Toggle the option in the set
        if (selectedSortOptions.has(option.id)) {
            selectedSortOptions.delete(option.id);
            // Ensure at least one option is selected
            if (selectedSortOptions.size === 0) {
                selectedSortOptions.add('best-sellers');
            }
        } else {
            // For price sorting, ensure only one price option can be selected
            if (option.sortBy === 'price') {
                // Remove any existing price sort options
                sortOptions.forEach(opt => {
                    if (opt.sortBy === 'price') {
                        selectedSortOptions.delete(opt.id);
                    }
                });
            }
            selectedSortOptions.add(option.id);
        }
        
        // Force Svelte to recognize the change
        selectedSortOptions = new Set(selectedSortOptions);
        
        // Apply the sorting
        filterProducts();
        
        // Close mobile sidebar after selection on small screens
        if (window.innerWidth < 768) {
            isFilterSidebarVisible = false;
        }
    }
</script>

<div class="relative">
    <!-- Filter Toggle Button (Mobile) -->
    <div class="md:hidden bg-[#F5ECD5] sticky top-0 z-10 mb-4 py-2 px-4 shadow-sm flex justify-between items-center">
        <button 
            id="filter-toggle-button"
            class="bg-[#789DBC] text-white px-4 py-2 rounded-md flex items-center space-x-1"
            on:click|stopPropagation={toggleFilterSidebar}
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters</span>
        </button>
        <div class="text-gray-700">
            <span class="text-sm font-medium">Sort: </span>
            <span class="text-sm">{currentSort.label}</span>
        </div>
    </div>

    <!-- Mobile Filter Sidebar (overlay) -->
    {#if isFilterSidebarVisible}
        <!-- Overlay background -->
        <div 
            class="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
            on:click={() => isFilterSidebarVisible = false}
        ></div>
        <div 
            id="mobile-filter-sidebar"
            class="md:hidden fixed inset-x-0 top-14 z-40 bg-white shadow-lg animate-slide-down"
        >
            <div class="max-w-full max-h-[calc(100vh-14rem)] overflow-y-auto p-4 transform transition-transform duration-300 ease-in-out">
                <!-- Categories Section -->
                <div class="mb-6">
                    <div class="flex justify-between items-center mb-3 cursor-pointer" on:click={() => isCategoryExpanded = !isCategoryExpanded}>
                        <h2 class="font-bold text-gray-700 uppercase text-sm">CATEGORIES</h2>
                        <span class="text-sm text-gray-500">
                            {isCategoryExpanded ? '▼' : '▶'}
                        </span>
                    </div>
                    {#if isCategoryExpanded}
                        <ul class="space-y-2">
                            {#each categories as category}
                                <li>
                                    <button 
                                        class="w-full text-left flex items-center justify-between py-1 px-2 rounded hover:bg-gray-200 transition-colors {selectedCategory === category.name ? 'bg-gray-200 font-medium' : ''}"
                                        on:click={() => handleCategorySelect(category.name)}
                                    >
                                        <span class="text-sm">{category.name}</span>
                                        <span class="text-xs text-gray-500">{category.count}</span>
                                    </button>
                                </li>
                            {/each}
                            <li>
                                <button class="text-gray-500 hover:text-gray-700 text-sm pt-1 pl-2">
                                    View More
                                </button>
                            </li>
                        </ul>
                    {/if}
                </div>
                
                <!-- Sort By Section -->
                <div>
                    <div class="flex justify-between items-center mb-3 cursor-pointer" on:click={() => isSortExpanded = !isSortExpanded}>
                        <h2 class="font-bold text-gray-700 uppercase text-sm">SORT BY</h2>
                        <span class="text-sm text-gray-500">
                            {isSortExpanded ? '▼' : '▶'}
                        </span>
                    </div>
                    {#if isSortExpanded}
                        <ul class="space-y-2">
                            {#each sortOptions as option}
                                <li>
                                    <label 
                                        class="w-full text-left py-1 px-2 rounded hover:bg-gray-200 transition-colors text-sm flex items-center"
                                    >
                                        <input 
                                            type="checkbox" 
                                            checked={selectedSortOptions.has(option.id)} 
                                            on:change={() => handleSortOptionToggle(option)}
                                            class="mr-2"
                                        />
                                        {option.name}
                                    </label>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                </div>
                
                <!-- Remove Filter Button for Mobile -->
                <button 
                    class="mt-6 mb-3 w-full bg-[#789DBC] text-white py-2 rounded-md flex justify-center items-center"
                    on:click={() => {
                        window.dispatchEvent(new CustomEvent('removeFilters'));
                        isFilterSidebarVisible = false;
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Remove Filters
                </button>
                
                <!-- Close button -->
                <button 
                    class="mt-6 w-full bg-red-500 text-white py-2 rounded-md"
                    on:click={() => isFilterSidebarVisible = false}
                >
                    Close
                </button>
            </div>
        </div>
    {/if}

    <div class="flex">
        <!-- Desktop Sidebar - Hidden on mobile, positioned at left edge -->
        <div class="hidden md:block w-56 bg-gray-100 p-4 shadow-md fixed left-0 overflow-y-auto z-20 top-[var(--navbar-height)] h-[100vh] max-h-[calc(100vh-var(--navbar-height))]">
            <!-- Categories Section -->
            <div class="mb-6">
                <div class="flex justify-between items-center mb-3 cursor-pointer" on:click={() => isCategoryExpanded = !isCategoryExpanded}>
                    <h2 class="font-bold text-gray-700 uppercase text-sm">CATEGORIES</h2>
                    <span class="text-sm text-gray-500">
                        {isCategoryExpanded ? '▼' : '▶'}
                    </span>
                </div>
                {#if isCategoryExpanded}
                    <ul class="space-y-2">
                        {#each categories as category}
                            <li>
                                <button 
                                    class="w-full text-left flex items-center justify-between py-1 px-2 rounded hover:bg-gray-200 transition-colors {selectedCategory === category.name ? 'bg-gray-200 font-medium' : ''}"
                                    on:click={() => handleCategorySelect(category.name)}
                                >
                                    <span class="text-sm">{category.name}</span>
                                    <span class="text-xs text-gray-500">{category.count}</span>
                                </button>
                            </li>
                        {/each}
                        <li>
                            <button class="text-gray-500 hover:text-gray-700 text-sm pt-1 pl-2">
                                View More
                            </button>
                        </li>
                    </ul>
                {/if}
            </div>
            
            <!-- Sort By Section -->
            <div>
                <div class="flex justify-between items-center mb-3 cursor-pointer" on:click={() => isSortExpanded = !isSortExpanded}>
                    <h2 class="font-bold text-gray-700 uppercase text-sm">SORT BY</h2>
                    <span class="text-sm text-gray-500">
                        {isSortExpanded ? '▼' : '▶'}
                    </span>
                </div>
                {#if isSortExpanded}
                    <ul class="space-y-2">
                        {#each sortOptions as option}
                            <li>
                                <label 
                                    class="w-full text-left py-1 px-2 rounded hover:bg-gray-200 transition-colors text-sm flex items-center"
                                >
                                    <input 
                                        type="checkbox" 
                                        checked={selectedSortOptions.has(option.id)} 
                                        on:change={() => handleSortOptionToggle(option)}
                                        class="mr-2"
                                    />
                                    {option.name}
                                </label>
                            </li>
                        {/each}
                    </ul>
                {/if}
                
                <!-- Remove Filter Button for Desktop -->
                <button 
                    class="mt-4 w-full bg-[#789DBC] text-white py-2 rounded-md flex justify-center items-center"
                    on:click={() => {
                        window.dispatchEvent(new CustomEvent('removeFilters'));
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Remove Filters
                </button>
            </div>
        </div>

        <!-- Main Content - Added left margin to accommodate fixed sidebar -->
        <div class="flex-1 p-4 md:ml-56 pt-4">
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
                <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8 w-full max-w-full">
                    {#each filteredProducts as product}
                        <div class="w-full">
                            <ProductCard {product} onAddToCart={handleAddToCart} />
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    /* Define navbar height variable */
    :root {
        --navbar-height: 60px;
    }
    
    /* Animation for filter dropdown */
    @keyframes slide-down {
        from {
            transform: translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .animate-slide-down {
        animation: slide-down 0.3s ease-out forwards;
    }
</style>
