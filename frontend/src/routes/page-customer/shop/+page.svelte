<script lang="ts">
    import { onMount } from 'svelte';
    import { auth } from '$lib/stores/auth';
    import { profile } from '$lib/stores/profile';
    import { products } from '$lib/stores/products';
    import { cart } from '$lib/stores/cart';
    import ProductCard from '$lib/components/ProductCard.svelte';
    import type { FilterParams } from '$lib/services/api';
    
    // Define product interface
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

    // Define categories for filtering
    const categories = [
        { id: 'electronics', name: 'Electronics', count: 0 },
        { id: 'clothing', name: 'Clothing', count: 0 },
        { id: 'home-kitchen', name: 'Home & Kitchen', count: 0 },
        { id: 'beauty-health', name: 'Beauty & Health', count: 0 },
        { id: 'gaming', name: 'Gaming', count: 0 },
    ];

    // Sort options
    const sortOptions = [
        { id: 'best-sellers', name: 'Best Sellers', sortBy: 'buyers', sortOrder: 'desc' },
        { id: 'price-low-high', name: 'Price: Low to High', sortBy: 'price', sortOrder: 'asc' },
        { id: 'price-high-low', name: 'Price: High to Low', sortBy: 'price', sortOrder: 'desc' },
        { id: 'newest', name: 'New Arrivals', sortBy: 'date', sortOrder: 'desc' },
        { id: 'rating', name: 'Highest Rated', sortBy: 'rating', sortOrder: 'desc' }
    ];

    // Track selected sort options
    let selectedSortOptions = new Set(['best-sellers']);

    // State variables
    let filteredProducts: Product[] = [];
    let searchQuery = '';
    let selectedCategory: string | null = null;
    let currentSort = { by: 'date', order: 'desc', label: 'Newest First' };
    
    // Reactive variables to track store state
    $: loading = $products.loading;
    $: error = $products.error;
    $: storeProducts = $products.items as Product[];
    $: pagination = $products.pagination;
    $: filters = $products.filters;
    
    // Update category counts based on products
    $: {
        if (storeProducts && storeProducts.length > 0) {
            categories.forEach(category => {
                category.count = storeProducts.filter(p => 
                    p.category && p.category.toLowerCase() === category.id.toLowerCase()
                ).length;
            });
        }
    }
    
    // Filter products based on search query and category
    $: {
        if (storeProducts) {
            filteredProducts = storeProducts.filter(product => {
                // Filter by search query
                const matchesSearch = !searchQuery || 
                    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
                
                // Filter by category
                const matchesCategory = !selectedCategory || 
                    (product.category && product.category.toLowerCase() === selectedCategory.toLowerCase());
                
                return matchesSearch && matchesCategory;
            });
        }
    }
    
    // UI state
    let isCategoryExpanded = true;
    let isSortExpanded = true;
    let isFilterSidebarVisible = false; // Control mobile sidebar visibility

    // Load products when component mounts
    onMount(async () => {
        try {
            // Load initial products
            await products.loadProducts();
            
            // Default to sorting by newest
            sortProductsByCreationDate('desc');
            currentSort = { by: 'date', order: 'desc', label: 'Newest First' };

            // Set up event listeners for search and sort
            window.addEventListener('searchProducts', ((event: CustomEvent) => {
                searchQuery = event.detail.query.toLowerCase();
                applyFilters();
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
            
            // Set up event listener for category filtering
            window.addEventListener('filterByCategory', ((event: CustomEvent) => {
                selectedCategory = event.detail.category;
                applyFilters();
            }) as EventListener);
            
            // Set up event listener for removing all filters
            window.addEventListener('removeFilters', (() => {
                // Reset all filters and sorting
                searchQuery = '';
                selectedCategory = null;
                currentSort = { by: 'buyers', order: 'desc', label: 'Most Popular' }; 
                selectedSortOptions = new Set(['best-sellers']);
                applyFilters();
            }) as EventListener);
            
            // Load cart data
            await cart.loadCart();
        } catch (err) {
            console.error('Error loading initial data:', err);
        }
    });

    // Apply filters and update products from API
    async function applyFilters() {
        const filterParams: FilterParams = {};
        
        // Add search query if present
        if (searchQuery) {
            filterParams.search = searchQuery;
        }
        
        // Add category if selected
        if (selectedCategory) {
            filterParams.category = selectedCategory;
        }
        
        // Add sorting
        if (currentSort.by === 'price') {
            filterParams.sort_by = currentSort.order === 'asc' ? 'price_asc' : 'price_desc';
        } else if (currentSort.by === 'name') {
            filterParams.sort_by = currentSort.order === 'asc' ? 'name_asc' : 'name_desc';
        } else if (currentSort.by === 'date') {
            filterParams.sort_by = currentSort.order === 'asc' ? 'date_asc' : 'date_desc';
        } else if (currentSort.by === 'rating') {
            filterParams.sort_by = 'rating';
        }
        
        try {
            await products.loadProducts(filterParams);
        } catch (err) {
            console.error('Error applying filters:', err);
        }
    }

    // Sorting functions
    function sortProductsByName(order: string = 'asc') {
        filteredProducts = [...filteredProducts].sort((a, b) => {
            const nameA = a.name.toLowerCase();
            const nameB = b.name.toLowerCase();
            return order === 'asc' 
                ? nameA.localeCompare(nameB)
                : nameB.localeCompare(nameA);
        });
    }

    function sortProductsByPrice(order: string = 'asc') {
        filteredProducts = [...filteredProducts].sort((a, b) => {
            return order === 'asc' 
                ? a.price - b.price
                : b.price - a.price;
        });
    }

    function sortProductsByCreationDate(order: string = 'desc') {
        filteredProducts = [...filteredProducts].sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return order === 'asc' 
                ? dateA - dateB
                : dateB - dateA;
        });
    }

    function sortProductsByRating(order: string = 'desc') {
        filteredProducts = [...filteredProducts].sort((a, b) => {
            const ratingA = a.rating || 0;
            const ratingB = b.rating || 0;
            return order === 'asc' 
                ? ratingA - ratingB
                : ratingB - ratingA;
        });
    }

    function sortProductsByBuyers(order: string = 'desc') {
        filteredProducts = [...filteredProducts].sort((a, b) => {
            const buyersA = a.review_count || 0;
            const buyersB = b.review_count || 0;
            return order === 'asc' 
                ? buyersA - buyersB
                : buyersB - buyersA;
        });
    }

    // Toggle filter sidebar on mobile
    function toggleFilterSidebar() {
        isFilterSidebarVisible = !isFilterSidebarVisible;
        // Add overflow hidden to body when filter is visible to prevent scrolling behind the dropdown
        if (isFilterSidebarVisible) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
    
    // Category selection
    function handleCategorySelect(category: string) {
        selectedCategory = category === selectedCategory ? null : category;
        applyFilters();
        // Close mobile sidebar after selection on small screens
        if (window.innerWidth < 768) {
            isFilterSidebarVisible = false;
        }
    }

    // Handle sort option selection
    function handleSortOptionToggle(option: {id: string, sortBy: string, sortOrder: string, name: string}) {
        // Find the selected sort option
        const sortOption = sortOptions.find(opt => opt.id === option.id);
        if (sortOption) {
            // Update current sort
            currentSort = {
                by: sortOption.sortBy,
                order: sortOption.sortOrder,
                label: sortOption.name
            };
            
            // Update selected sort options
            selectedSortOptions.clear();
            selectedSortOptions.add(option.id);
            selectedSortOptions = selectedSortOptions; // Trigger reactivity
            
            // Apply the sort
            if (sortOption.sortBy === 'name') {
                sortProductsByName(sortOption.sortOrder);
            } else if (sortOption.sortBy === 'price') {
                sortProductsByPrice(sortOption.sortOrder);
            } else if (sortOption.sortBy === 'date') {
                sortProductsByCreationDate(sortOption.sortOrder);
            } else if (sortOption.sortBy === 'rating') {
                sortProductsByRating(sortOption.sortOrder);
            } else if (sortOption.sortBy === 'buyers') {
                sortProductsByBuyers(sortOption.sortOrder);
            }
            
            // Apply filters to API
            applyFilters();
            
            // Close mobile sidebar after selection on small screens
            if (window.innerWidth < 768) {
                isFilterSidebarVisible = false;
            }
        }
    }
    
    // Add to cart function
    async function addToCart(product: Product) {
        try {
            await cart.addToCart({
                item_id: product.id,
                quantity: 1
            });
            // Show success message or notification here
        } catch (err) {
            console.error('Error adding to cart:', err);
            // Show error message
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
        <button 
            class="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
            on:click={() => isFilterSidebarVisible = false}
            on:keydown={(e) => e.key === 'Escape' && (isFilterSidebarVisible = false)}
            aria-label="Close filter sidebar"
        ></button>
        <div 
            id="mobile-filter-sidebar"
            class="md:hidden fixed inset-x-0 top-14 z-40 bg-white shadow-lg animate-slide-down"
            role="dialog"
            aria-labelledby="filter-sidebar-title"
        >
            <h2 id="filter-sidebar-title" class="sr-only">Filter Options</h2>
            <div class="max-w-full max-h-[calc(100vh-14rem)] overflow-y-auto p-4 transform transition-transform duration-300 ease-in-out" role="document">
                <!-- Categories Section -->
                <div class="mb-6">
                    <button 
                        class="w-full flex justify-between items-center mb-3 cursor-pointer" 
                        on:click={() => isCategoryExpanded = !isCategoryExpanded}
                        on:keydown={(e) => e.key === 'Enter' && (isCategoryExpanded = !isCategoryExpanded)}
                        aria-expanded={isCategoryExpanded}
                        aria-controls="category-list"
                    >
                        <h2 class="font-bold text-gray-700 uppercase text-sm">CATEGORIES</h2>
                        <span class="text-sm text-gray-500">
                            {isCategoryExpanded ? '▼' : '▶'}
                        </span>
                    </button>
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
                    <button 
                        class="w-full flex justify-between items-center mb-3 cursor-pointer" 
                        on:click={() => isSortExpanded = !isSortExpanded}
                        on:keydown={(e) => e.key === 'Enter' && (isSortExpanded = !isSortExpanded)}
                        aria-expanded={isSortExpanded}
                        aria-controls="sort-options-list"
                    >
                        <h2 class="font-bold text-gray-700 uppercase text-sm">SORT BY</h2>
                        <span class="text-sm text-gray-500">
                            {isSortExpanded ? '▼' : '▶'}
                        </span>
                    </button>
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
                        // Reset all filters and sorting
                        searchQuery = '';
                        selectedCategory = null;
                        currentSort = { by: 'buyers', order: 'desc', label: 'Most Popular' }; 
                        selectedSortOptions = new Set(['best-sellers']);
                        applyFilters();
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
        <!-- Main Content - No need for left margin as the layout already has a sidebar -->
        <div class="flex-1 p-4 pt-4">
            <!-- Filter controls for desktop view -->
            <div class="hidden md:flex mb-6 gap-4">
                <!-- Categories dropdown -->
                <div class="relative">
                    <button 
                        class="bg-white px-4 py-2 rounded-md shadow-sm flex items-center gap-2"
                        on:click={() => isCategoryExpanded = !isCategoryExpanded}
                    >
                        <span>Categories</span>
                        <span class="text-sm text-gray-500">{isCategoryExpanded ? '▼' : '▶'}</span>
                    </button>
                    
                    {#if isCategoryExpanded}
                        <div class="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg z-10 w-48">
                            <ul class="py-2">
                                {#each categories as category}
                                    <li>
                                        <button 
                                            class="w-full text-left flex items-center justify-between py-2 px-4 hover:bg-gray-100 transition-colors {selectedCategory === category.name ? 'bg-gray-100 font-medium' : ''}"
                                            on:click={() => handleCategorySelect(category.name)}
                                        >
                                            <span>{category.name}</span>
                                            <span class="text-xs text-gray-500">{category.count}</span>
                                        </button>
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    {/if}
                </div>
                
                <!-- Sort dropdown -->
                <div class="relative">
                    <button 
                        class="bg-white px-4 py-2 rounded-md shadow-sm flex items-center gap-2"
                        on:click={() => isSortExpanded = !isSortExpanded}
                    >
                        <span>Sort: {currentSort.label}</span>
                        <span class="text-sm text-gray-500">{isSortExpanded ? '▼' : '▶'}</span>
                    </button>
                    
                    {#if isSortExpanded}
                        <div class="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg z-10 w-48">
                            <ul class="py-2">
                                {#each sortOptions as option}
                                    <li>
                                        <button 
                                            class="w-full text-left py-2 px-4 hover:bg-gray-100 transition-colors {currentSort.label === option.name ? 'bg-gray-100 font-medium' : ''}"
                                            on:click={() => {
                                                isSortExpanded = false;
                                                handleSortOptionToggle(option);
                                            }}
                                        >
                                            {option.name}
                                        </button>
                                    </li>
                                {/each}
                            </ul>
                        </div>
                    {/if}
                </div>
                
                <!-- Reset filters button -->
                <button 
                    class="bg-[#789DBC] text-white px-4 py-2 rounded-md flex items-center gap-2"
                    on:click={() => {
                        // Reset all filters and sorting
                        searchQuery = '';
                        selectedCategory = null;
                        currentSort = { by: 'buyers', order: 'desc', label: 'Most Popular' }; 
                        selectedSortOptions = new Set(['best-sellers']);
                        applyFilters();
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reset Filters
                </button>
            </div>
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
                            <ProductCard {product} onAddToCart={() => addToCart(product)} />
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
