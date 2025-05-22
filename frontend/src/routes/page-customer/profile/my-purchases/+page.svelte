<script lang="ts">
    import Alerts from '$lib/components/Alerts.svelte';
    import { reviews } from '$lib/stores/reviews';
    import { orders } from '$lib/stores/orders';
    import { auth } from '$lib/stores/auth';
    import { api } from '$lib/services/api';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    
    // Order interface
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
        review?: {
            rating: number;
            text: string;
            date: string;
        };
    }
    
    // Review interface
    interface ReviewData {
        product_id: number;
        user_id: number;
        user_name: string;
        user_image?: string;
        rating: number;
        comment: string;
        images?: string[];
    }
    
    let activeTab = 'All';
    const tabs = ['All', 'Pending', 'To Ship', 'To Receive', 'Completed'];
    
    // Search functionality
    let searchQuery = '';
    
    // Order data
    let localOrders: OrderItem[] = [];
    let loading = false;
    let error: string | null = null;
    
    // Alert state
    let showAlert = false;
    let alertType: 'success' | 'error' | 'review-success' | 'delete-account' | 'delete-countdown' | 'profile-update' | 'logout-confirm' | 'delete-item' | 'report-success' = 'success';
    let alertTitle = '';
    let cartAdded = '';
    
    // Reactive variables from stores
    $: storeOrders = $orders.orders || [];
    $: storeLoading = $orders.loading;
    $: storeError = $orders.error;
    
    // Combine loading states
    $: loading = storeLoading;
    
    // Check if we came from checkout
    let fromCheckout = false;
    
    async function loadOrders() {
        try {
            // First, try to load orders from the API
            await orders.loadOrders();
            
            // Load orders from localStorage
            loadOrdersFromLocalStorage();
            
            // If we came from checkout, switch to the Pending tab
            if (fromCheckout) {
                setActiveTab('Pending');
                fromCheckout = false;
            }
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to load orders';
            showErrorAlert('Failed to load orders');
        }
    }
    
    function loadOrdersFromLocalStorage() {
        if (browser) {
            // Get pending orders from localStorage
            const storedOrders = localStorage.getItem('pendingOrders');
            if (storedOrders) {
                try {
                    const pendingOrders = JSON.parse(storedOrders) as OrderItem[];
                    
                    // Merge with existing orders, avoiding duplicates
                    const existingIds = new Set(localOrders.map(order => order.id));
                    const newOrders = pendingOrders.filter(order => !existingIds.has(order.id));
                    
                    localOrders = [...localOrders, ...newOrders];
                } catch (err) {
                    console.error('Error parsing orders from localStorage:', err);
                }
            }
        }
    }
    
    function updateOrdersInLocalStorage() {
        if (browser) {
            // Get the pending orders
            const pendingOrders = localOrders.filter(order => order.status === 'pending');
            // Save to localStorage
            localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
        }
    }
    
    onMount(() => {
        // Check if user is authenticated
        if (!$auth.user) {
            goto('/login?redirect=/page-customer/profile/my-purchases');
            return;
        }
        
        // Check if we came from checkout
        if (browser) {
            fromCheckout = sessionStorage.getItem('fromCheckout') === 'true';
            if (fromCheckout) {
                sessionStorage.removeItem('fromCheckout');
            }
        }
        
        // Listen for search events from the layout
        window.addEventListener('searchPurchases', ((event: CustomEvent) => {
            searchQuery = event.detail.query;
        }) as EventListener);
        
        loadOrders();
        
        return () => {
            window.removeEventListener('searchPurchases', ((event: CustomEvent) => {}) as EventListener);
        };
    });
    
    // Combine orders from API and localStorage
    $: combinedOrders = [...(Array.isArray(storeOrders) ? storeOrders : []), ...(Array.isArray(localOrders) ? localOrders : [])];
    
    // Filter orders based on active tab and search query
    $: filteredOrders = activeTab === 'All' 
        ? combinedOrders.filter(order => 
            searchQuery.trim() === '' || 
            order.item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.seller.toLowerCase().includes(searchQuery.toLowerCase()))
        : combinedOrders.filter(order => {
            const status = activeTab.toLowerCase().replace(' ', '_');
            return order.status === status && 
                (searchQuery.trim() === '' || 
                 order.item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 order.seller.toLowerCase().includes(searchQuery.toLowerCase()));
        });
    
    function setActiveTab(tab: string) {
        activeTab = tab;
    }

    function scrollTabs(direction: 'left' | 'right') {
        const tabsContainer = document.querySelector('.overflow-x-auto');
        if (tabsContainer) {
            const scrollAmount = 150;
            tabsContainer.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
        }
    }

    // Show success alert
    function showSuccessAlert(title: string, message: string = '') {
        alertType = 'success';
        alertTitle = title;
        cartAdded = message;
        showAlert = true;
    }
    
    // Show error alert
    function showErrorAlert(message: string, details: string = '') {
        alertType = 'error';
        alertTitle = 'Error';
        cartAdded = details || message;
        showAlert = true;
    }

    // Order received function
    async function markOrderReceived(orderId: string) {
        try {
            // First try to update via API if it's a numeric ID (from the API)
            if (!isNaN(Number(orderId))) {
                await api.updateOrderStatus(Number(orderId), 'completed');
                await orders.loadOrders();
            } else {
                // For localStorage orders
                const orderIndex = localOrders.findIndex(o => o.id === orderId);
                if (orderIndex !== -1) {
                    // Change order status to completed
                    localOrders[orderIndex].status = 'completed';
                    // Add the current date as the completed date
                    localOrders[orderIndex].date = new Date().toISOString().split('T')[0];
                    
                    // Update the localOrders array to trigger reactivity
                    localOrders = [...localOrders];
                    
                    // Update localStorage with current orders
                    updateOrdersInLocalStorage();
                }
            }
            
            // Show success alert
            showSuccessAlert('Order Marked as Received', 'Your order has been marked as received');
            
            // Switch to the completed tab after marking as received
            setActiveTab('Completed');
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to update order status';
            showErrorAlert('Failed to update order status');
        }
    }

    // Cancel order function
    async function cancelOrder(orderId: string) {
        try {
            // For localStorage orders
            const orderIndex = localOrders.findIndex(o => o.id === orderId);
            if (orderIndex !== -1) {
                // Remove the order from the array
                localOrders.splice(orderIndex, 1);
                
                // Update the localOrders array to trigger reactivity
                localOrders = [...localOrders];
                
                // Update localStorage with current orders
                updateOrdersInLocalStorage();
                
                // Show success alert
                showSuccessAlert('Order Cancelled', 'Order has been cancelled');
                
                // Ensure we're looking at the right tab
                setActiveTab('Pending');
            }
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to cancel order';
            showErrorAlert('Failed to cancel order');
        }
    }

    // Review Modal
    let showReviewModal = false;
    let selectedProduct: {id: number; name: string; image: string; variation: string} | null = null;
    let selectedOrderId: string = '';
    let rating = 5;
    let reviewText = '';
    let reviewImages: string[] = []; // Array to store the selected images
    let maxImages = 3; // Maximum number of images allowed
    
    function openReviewModal(order: OrderItem) {
        selectedProduct = {
            id: Number(order.id), // Store the product ID
            name: order.item.name,
            image: order.item.image,
            variation: 'Standard' // Default variation
        };
        selectedOrderId = order.id;
        rating = 5; // Default to 5 stars
        reviewText = '';
        reviewImages = []; // Reset images when opening modal
        showReviewModal = true;
    }

    function closeReviewModal() {
        showReviewModal = false;
    }
    
    function handleImageSelection(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            // Only add more images if below the maximum limit
            if (reviewImages.length < maxImages) {
                const file = input.files[0];
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    if (e.target && typeof e.target.result === 'string') {
                        reviewImages = [...reviewImages, e.target.result];
                    }
                };
                
                reader.readAsDataURL(file);
            }
            
            // Reset the input value so the same file can be selected again if needed
            input.value = '';
        }
    }
    
    function removeImage(index: number) {
        reviewImages = reviewImages.filter((_, i) => i !== index);
    }

    async function submitReview() {
        if (!selectedProduct || !reviewText) {
            showErrorAlert('Please provide a review text', 'You must enter review text before submitting');
            return;
        }

        try {
            // Create the review object
            const reviewData: ReviewData = {
                product_id: selectedProduct.id,
                user_id: $auth.user?.id || 1, // Default to 1 if not logged in
                user_name: $auth.user?.name || 'John Doe',
                user_image: 'https://randomuser.me/api/portraits/men/1.jpg', // Default image
                rating: rating,
                comment: reviewText,
                images: reviewImages
            };

            // Add the review to the store - pass both itemId and reviewData
            await reviews.addReview(selectedProduct.id, reviewData);

            // Update the local order to show it has been reviewed
            const orderIndex = localOrders.findIndex(o => o.id === selectedOrderId);
            if (orderIndex !== -1) {
                localOrders[orderIndex].review = {
                    rating: rating,
                    text: reviewText,
                    date: new Date().toISOString().split('T')[0]
                };
                
                // Update the localOrders array to trigger reactivity
                localOrders = [...localOrders];
                
                // Update localStorage
                updateOrdersInLocalStorage();
            }

            // Close the modal after submission
            closeReviewModal();
            
            // Show the success alert
            showSuccessAlert('Review Submitted', 'Your review has been submitted successfully');
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to submit review';
            showErrorAlert('Failed to submit review', 'There was an error submitting your review');
        }
    }
    
    function closeAlert() {
        showAlert = false;
    }

    function navigateToHome() {
        goto('/page-customer/home');
    }

    
</script>


<div class="container mx-auto px-4 py-8 max-w-6xl">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">My Purchases</h1>
    
    <!-- Search Bar -->
    <div class="mb-6">
        <div class="relative">
            <input 
                type="text" 
                bind:value={searchQuery} 
                placeholder="Search orders by product or seller" 
                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
        </div>
    </div>
    
    <!-- Tabs -->
    <div class="relative mb-6 bg-white rounded-lg shadow overflow-hidden">
        <div class="flex overflow-x-auto scrollbar-hide">
            {#each tabs as tab}
                <button 
                    class="flex-shrink-0 px-6 py-3 text-sm font-medium transition-colors duration-200 ease-in-out
                    ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}"
                    on:click={() => setActiveTab(tab)}
                >
                    {tab}
                </button>
            {/each}
        </div>
        
        <!-- Tab Navigation Buttons (for mobile) -->
        <button 
            class="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-white to-transparent w-8 flex items-center justify-center z-10 md:hidden"
            aria-label="Scroll tabs left" 
            on:click={() => scrollTabs('left')}
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
        </button>
        
        <button 
            class="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-white to-transparent w-8 flex items-center justify-center z-10 md:hidden"
            aria-label="Scroll tabs right" 
            on:click={() => scrollTabs('right')}
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
        </button>
    </div>
    
    <!-- Loading State -->
    {#if loading}
        <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    {:else}
        <!-- Orders List -->
        <div class="space-y-4">
            {#if filteredOrders.length > 0}
                {#each filteredOrders as order}
                    <div class="bg-white rounded-lg shadow overflow-hidden transition-all duration-200 hover:shadow-md">
                        <!-- Order Header -->
                        <div class="bg-gray-50 px-4 py-3 flex flex-col sm:flex-row justify-between border-b">
                            <div class="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                                <span>Order placed: <span class="font-medium">{order.date}</span></span>
                                <span class="hidden sm:block">•</span>
                                <span>Order ID: <span class="font-medium">{order.id}</span></span>
                            </div>
                            <div class="mt-2 sm:mt-0">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                    order.status === 'to_ship' ? 'bg-blue-100 text-blue-800' : 
                                    order.status === 'to_receive' ? 'bg-purple-100 text-purple-800' : 
                                    'bg-green-100 text-green-800'}"
                                >
                                    {order.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>
                        </div>
                        
                        <!-- Order Content -->
                        <div class="p-4">
                            <div class="flex flex-col md:flex-row items-start gap-4">
                                <!-- Product Image -->
                                <div class="w-24 h-24 flex-shrink-0">
                                    <img 
                                        src={order.item.image} 
                                        alt="" 
                                        class="w-full h-full object-cover rounded-md border border-gray-200"
                                    />
                                </div>
                                
                                <!-- Product Details -->
                                <div class="flex-grow">
                                    <h3 class="text-lg font-medium text-gray-900">{order.item.name}</h3>
                                    <p class="text-sm text-gray-500 mt-1">Seller: {order.seller}</p>
                                    <p class="text-sm text-gray-700 mt-1">${order.item.price.toFixed(2)} × {order.quantity}</p>
                                </div>
                                
                                <!-- Price -->
                                <div class="mt-4 md:mt-0 text-right">
                                    <p class="text-lg font-medium text-gray-900">Total: ${order.total_price.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Order Actions -->
                        <div class="px-4 py-3 bg-gray-50 border-t flex flex-wrap justify-end gap-3">
                            {#if order.status === 'completed'}
                                {#if order.review}
                                    <!-- Review Display -->
                                    <div class="w-full bg-gray-100 rounded-md p-3">
                                        <div class="flex justify-between items-center mb-2">
                                            <div class="flex items-center">
                                                {#each Array(5) as _, i}
                                                    <svg 
                                                        xmlns="http://www.w3.org/2000/svg" 
                                                        class="h-4 w-4 ${i < order.review.rating ? 'text-yellow-400' : 'text-gray-300'}"
                                                        viewBox="0 0 20 20" 
                                                        fill="currentColor"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                {/each}
                                            </div>
                                            <span class="text-xs text-gray-500">Reviewed on {order.review.date}</span>
                                        </div>
                                        <p class="text-sm text-gray-700">{order.review.text}</p>
                                    </div>
                                {:else}
                                    <button 
                                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        on:click={() => openReviewModal(order)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                        </svg>
                                        Write a Review
                                    </button>
                                {/if}
                            {/if}
                            {#if order.status === 'to_receive'}
                                <button 
                                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    on:click={() => markOrderReceived(order.id)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Order Received
                                </button>
                            {/if}
                            {#if order.status === 'pending'}
                                <button 
                                    class="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md shadow-sm text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    on:click={() => cancelOrder(order.id)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancel Order
                                </button>
                            {/if}
                        </div>
                    </div>
                {/each}
            {:else}
                <!-- Empty State -->
                <div class="bg-white rounded-lg shadow-sm p-8 text-center">
                    <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                    <p class="text-gray-500 mb-6">You don't have any orders in this category yet.</p>
                    <button 
                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        on:click={navigateToHome}
                    >
                        Start Shopping
                    </button>
                </div>
            {/if}
        </div>
    {/if}
</div>

<!-- Review Modal -->
{#if showReviewModal && selectedProduct}
<div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="p-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-800">Rate Product</h2>
                <button 
                    class="text-gray-500 hover:text-gray-700 focus:outline-none" 
                    on:click={closeReviewModal}
                    aria-label="Close modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div class="flex items-center space-x-4 mb-6 p-3 bg-gray-50 rounded-lg">
                <img 
                    src={selectedProduct.image} 
                    alt="" 
                    class="w-16 h-16 object-cover rounded-md border border-gray-200" 
                />
                <div>
                    <h3 class="font-medium text-gray-900">{selectedProduct.name}</h3>
                    <p class="text-sm text-gray-500">Variation: {selectedProduct.variation}</p>
                </div>
            </div>
            
            <div class="mb-6">
                <p class="font-medium text-gray-700 mb-2">Product Quality</p>
                <div class="flex items-center space-x-2">
                    {#each Array(5) as _, i}
                        <button 
                            class="focus:outline-none transition-colors duration-150"
                            on:click={() => rating = i + 1}
                            aria-label="Rate {i + 1} stars"
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                class="h-8 w-8 {i < rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400"
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </button>
                    {/each}
                    <span class="ml-2 text-sm font-medium text-gray-700">
                        {#if rating === 1}Poor
                        {:else if rating === 2}Fair
                        {:else if rating === 3}Good
                        {:else if rating === 4}Very Good
                        {:else}Amazing
                        {/if}
                    </span>
                </div>
            </div>
            
            <div class="mb-6">
                <label for="review-text" class="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                <textarea 
                    id="review-text"
                    bind:value={reviewText} 
                    placeholder="Share your thoughts on the product to help other buyers."
                    rows="4"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
            </div>
            
            <!-- Image Upload Section -->
            <div class="mb-6">
                <p class="block text-sm font-medium text-gray-700 mb-2">Add Photos (Optional)</p>
                <div class="flex flex-wrap gap-2 mb-2">
                    {#each reviewImages as image, index}
                        <div class="relative w-20 h-20 border border-gray-200 rounded-md overflow-hidden group">
                            <img src={image} alt="" class="w-full h-full object-cover" />
                            <button 
                                class="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-bl-md opacity-80 hover:opacity-100 focus:outline-none"
                                on:click={() => removeImage(index)}
                                aria-label="Remove image"
                            >
                                ×
                            </button>
                        </div>
                    {/each}
                    
                    {#if reviewImages.length < maxImages}
                        <label class="w-20 h-20 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors duration-150">
                            <input type="file" accept="image/*" on:change={handleImageSelection} class="hidden" />
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span class="text-xs text-gray-500 mt-1">Add Photo</span>
                        </label>
                    {/if}
                </div>
                <p class="text-xs text-gray-500">{reviewImages.length} of {maxImages} photos</p>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button 
                    class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    on:click={closeReviewModal}
                >
                    Cancel
                </button>
                <button 
                    class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    on:click={submitReview}
                >
                    Submit Review
                </button>
            </div>
        </div>
    </div>
</div>
{/if}

<!-- Success Alert -->
<Alerts 
    isVisible={showAlert}
    type={alertType}
    title={alertTitle}
    cartAdded={cartAdded}
    on:close={closeAlert}
/>

<!-- Using Tailwind CSS, no custom styles needed -->
