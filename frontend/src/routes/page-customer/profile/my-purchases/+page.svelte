<script lang="ts">
    import CustomerSidebar from '$lib/components/CustomerSidebar.svelte';
    import Alerts from '$lib/components/Alerts.svelte';
    
    let activeTab = 'All';
    const tabs = ['All', 'Pending', 'To Ship', 'To Receive', 'Completed'];
    
    // Mock data for orders
    const orders = [
        {
            id: '1001',
            item: {
                name: 'Wireless Headphones',
                image: 'https://placehold.co/100x100',
                price: 79.99
            },
            quantity: 1,
            total_price: 79.99,
            status: 'pending',
            date: '2023-11-05',
            seller: 'AudioTech Store'
        },
        {
            id: '1002',
            item: {
                name: 'Smart Watch',
                image: 'https://placehold.co/100x100',
                price: 159.99
            },
            quantity: 1,
            total_price: 159.99,
            status: 'to_ship',
            date: '2023-11-10',
            seller: 'GadgetWorld'
        },
        {
            id: '1003',
            item: {
                name: 'Laptop Sleeve',
                image: 'https://placehold.co/100x100',
                price: 24.99
            },
            quantity: 2,
            total_price: 49.98,
            status: 'to_receive',
            date: '2023-11-12',
            seller: 'TechAccessories'
        },
        {
            id: '1004',
            item: {
                name: 'Bluetooth Speaker',
                image: 'https://placehold.co/100x100',
                price: 45.99
            },
            quantity: 1,
            total_price: 45.99,
            status: 'completed',
            date: '2023-10-28',
            seller: 'AudioTech Store',
            review: {
                rating: 4,
                text: 'Great sound quality and battery life. The only downside is it\'s a bit heavier than expected.',
                date: '2023-11-01'
            }
        },
        {
            id: '1005',
            item: {
                name: 'USB-C Charging Cable',
                image: 'https://placehold.co/100x100',
                price: 12.99
            },
            quantity: 3,
            total_price: 38.97,
            status: 'completed',
            date: '2023-10-15',
            seller: 'CableConnect'
        }
    ];
    
    // Filter orders based on active tab
    $: filteredOrders = activeTab === 'All' 
        ? orders 
        : orders.filter(order => {
            const status = activeTab.toLowerCase().replace(' ', '_');
            return order.status === status;
        });
    
    function setActiveTab(tab: string) {
        activeTab = tab;
    }

    function scrollTabs(direction: 'left' | 'right') {
        const tabsContainer = document.querySelector('.tabs-scroll');
        if (tabsContainer) {
            const scrollAmount = 150;
            tabsContainer.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
        }
    }

    // Review Modal
    let showReviewModal = false;
    let selectedProduct: {name: string; image: string; variation: string} | null = null;
    let rating = 5;
    let reviewText = '';
    
    // Order Details Modal
    let showOrderDetailsModal = false;
    let selectedOrder: any = null;
    
    // Alert state
    let showAlert = false;
    
    function openReviewModal(order: any) {
        selectedProduct = {
            name: order.item.name,
            image: order.item.image,
            variation: 'Black' // Default variation for mock data
        };
        rating = 5; // Default to 5 stars
        reviewText = '';
        showReviewModal = true;
    }

    function closeReviewModal() {
        showReviewModal = false;
    }
    
    function openOrderDetailsModal(order: any) {
        selectedOrder = order;
        showOrderDetailsModal = true;
    }
    
    function closeOrderDetailsModal() {
        showOrderDetailsModal = false;
    }

    function submitReview() {
        // Here you would implement the logic to submit the review to your backend
        console.log('Submitting review:', {
            product: selectedProduct,
            rating,
            reviewText
        });
        
        // Close the modal after submission
        closeReviewModal();
        
        // Show the alert instead of using alert()
        showAlert = true;
    }
    
    function closeAlert() {
        showAlert = false;
    }
</script>

<CustomerSidebar />

<div class="content">
    <h1>My Purchases</h1>
    
    <div class="tabs-container">
        <button class="scroll-btn left" on:click={() => scrollTabs('left')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="none" d="M0 0h24v24H0z"/>
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/>
            </svg>
        </button>
        
        <div class="tabs-scroll">
            <div class="tabs">
                {#each tabs as tab}
                    <button 
                        class="tab-button {activeTab === tab ? 'active' : ''}" 
                        on:click={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                {/each}
            </div>
        </div>
        
        <button class="scroll-btn right" on:click={() => scrollTabs('right')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="none" d="M0 0h24v24H0z"/>
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/>
            </svg>
        </button>
    </div>
    
    <div class="orders-container">
        <div class="orders-section">
            {#if filteredOrders.length > 0}
                {#each filteredOrders as order}
                    <div class="order-card">
                        <div class="order-header">
                            <span class="order-date">Order placed: {order.date}</span>
                            <span class="order-id">Order ID: {order.id}</span>
                        </div>
                        
                        <div class="order-content">
                            <div class="order-item">
                                <img src={order.item.image} alt={order.item.name} class="item-image" />
                                <div class="item-details">
                                    <h3>{order.item.name}</h3>
                                    <p class="seller">Seller: {order.seller}</p>
                                    <p class="price">${order.item.price.toFixed(2)} × {order.quantity}</p>
                                </div>
                                <div class="item-status">
                                    <span class="status-badge {order.status}">
                                        {order.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                    <p class="total-price">Total: ${order.total_price.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="order-actions">
                            <button class="btn-action" on:click={() => openOrderDetailsModal(order)}>View Details</button>
                            {#if order.status === 'completed'}
                                {#if order.review}
                                    <div class="review-box">
                                        <div class="review-header">
                                            <div class="star-display">
                                                {#each Array(5) as _, i}
                                                    <span class="star {i < order.review.rating ? 'filled' : ''}">
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                                                            <path fill="none" d="M0 0h24v24H0z"/>
                                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/>
                                                        </svg>
                                                    </span>
                                                {/each}
                                            </div>
                                            <span class="review-date">Reviewed on {order.review.date}</span>
                                        </div>
                                        <p class="review-text">{order.review.text}</p>
                                    </div>
                                {:else}
                                    <button class="btn-action" on:click={() => openReviewModal(order)}>Write Review</button>
                                {/if}
                            {/if}
                            {#if order.status === 'to_receive'}
                                <button class="btn-action primary">Confirm Receipt</button>
                            {/if}
                            {#if order.status === 'pending'}
                                <button class="btn-action cancel">Cancel Order</button>
                            {/if}
                        </div>
                    </div>
                {/each}
            {:else}
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <p>No orders found in this category</p>
                    <button class="btn-primary">Start Shopping</button>
                </div>
            {/if}
        </div>
    </div>
</div>

<!-- Review Modal -->
{#if showReviewModal && selectedProduct}
<div class="modal-overlay">
    <div class="modal-container">
        <div class="modal-content">
            <h2>Rate Product</h2>
            
            <div class="product-info">
                <img src={selectedProduct.image} alt={selectedProduct.name} class="product-image" />
                <div class="product-details">
                    <h3>{selectedProduct.name}</h3>
                    <p>Variation: {selectedProduct.variation}</p>
                </div>
            </div>
            
            <div class="rating-section">
                <p>Product Quality</p>
                <div class="star-rating">
                    {#each Array(5) as _, i}
                        <button 
                            class="star-btn {i < rating ? 'active' : ''}" 
                            on:click={() => rating = i + 1}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="none" d="M0 0h24v24H0z"/>
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/>
                            </svg>
                        </button>
                    {/each}
                    <span class="rating-text">
                        {#if rating === 1}Poor
                        {:else if rating === 2}Fair
                        {:else if rating === 3}Good
                        {:else if rating === 4}Very Good
                        {:else}Amazing
                        {/if}
                    </span>
                </div>
            </div>
            
            <div class="review-input">
                <textarea 
                    bind:value={reviewText} 
                    placeholder="Share your thoughts on the product to help other buyers."
                    rows="6"
                ></textarea>
            </div>
            
            <div class="modal-buttons">
                <button class="btn-cancel" on:click={closeReviewModal}>Cancel</button>
                <button class="btn-submit" on:click={submitReview}>Submit</button>
            </div>
        </div>
    </div>
</div>
{/if}

<!-- Order Details Modal -->
{#if showOrderDetailsModal && selectedOrder}
<div class="modal-overlay">
    <div class="modal-container order-details-modal">
        <div class="modal-content">
            <button class="close-modal-btn" on:click={closeOrderDetailsModal}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path fill="none" d="M0 0h24v24H0z"/>
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                </svg>
            </button>
            <h2>Order Details</h2>
            
            <div class="order-details-section">
                <div class="order-details-header">
                    <div>
                        <h3>Order #{selectedOrder.id}</h3>
                        <p class="order-date-detail">Placed on {selectedOrder.date}</p>
                    </div>
                    <span class="status-badge detail-badge {selectedOrder.status}">
                        {selectedOrder.status.replace('_', ' ').toUpperCase()}
                    </span>
                </div>
                
                <div class="order-details-content">
                    <div class="detail-card">
                        <h4>Product Information</h4>
                        <div class="product-info-detail">
                            <img src={selectedOrder.item.image} alt={selectedOrder.item.name} class="product-image-detail" />
                            <div>
                                <h5>{selectedOrder.item.name}</h5>
                                <p>Seller: {selectedOrder.seller}</p>
                                <p>Price: ${selectedOrder.item.price.toFixed(2)}</p>
                                <p>Quantity: {selectedOrder.quantity}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-card">
                        <h4>Payment Information</h4>
                        <div class="detail-info">
                            <div class="detail-row">
                                <span>Subtotal:</span>
                                <span>${(selectedOrder.item.price * selectedOrder.quantity).toFixed(2)}</span>
                            </div>
                            <div class="detail-row">
                                <span>Shipping Fee:</span>
                                <span>$5.00</span>
                            </div>
                            <div class="detail-row">
                                <span>Discount:</span>
                                <span>-$5.00</span>
                            </div>
                            <div class="detail-row total">
                                <span>Total:</span>
                                <span>${selectedOrder.total_price.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    {#if selectedOrder.status === 'completed' && selectedOrder.review}
                    <div class="detail-card">
                        <h4>Your Review</h4>
                        <div class="review-box detail-review">
                            <div class="review-header">
                                <div class="star-display">
                                    {#each Array(5) as _, i}
                                        <span class="star {i < selectedOrder.review.rating ? 'filled' : ''}">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                                                <path fill="none" d="M0 0h24v24H0z"/>
                                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/>
                                            </svg>
                                        </span>
                                    {/each}
                                </div>
                                <span class="review-date">Reviewed on {selectedOrder.review.date}</span>
                            </div>
                            <p class="review-text">{selectedOrder.review.text}</p>
                        </div>
                    </div>
                    {/if}
                </div>
            </div>
            
            <div class="modal-buttons">
                <button class="btn-cancel" on:click={closeOrderDetailsModal}>Close</button>
                {#if selectedOrder.status === 'to_receive'}
                    <button class="btn-submit">Confirm Receipt</button>
                {/if}
            </div>
        </div>
    </div>
</div>
{/if}

<!-- Success Alert -->
<Alerts 
    isVisible={showAlert}
    type="review-success"
    title="Review Submitted"
    on:close={closeAlert}
/>

<style>
    .content {
        margin-left: 220px;
        padding: 2rem;
    }

    h1 {
        color: #2b4b66;
        margin-bottom: 1.5rem;
    }
    
    .tabs-container {
        display: flex;
        align-items: center;
        margin-bottom: 2rem;
        position: relative;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    
    .tabs-scroll {
        overflow-x: auto;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE/Edge */
        width: 100%;
    }
    
    .tabs-scroll::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
    }
    
    .tabs {
        display: flex;
        border-bottom: 1px solid #e0e0e0;
        width: 100%;
        background-color: white;
    }
    
    .tab-button {
        padding: 0.75rem 0;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1rem;
        color: #555;
        position: relative;
        flex: 1;
        text-align: center;
        min-width: max-content;
    }
    
    .tab-button.active {
        color: #2b4b66;
        font-weight: 600;
    }
    
    .tab-button.active::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 100%;
        height: 3px;
        background-color: #2b4b66;
    }
    
    .scroll-btn {
        display: none;
        background: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        cursor: pointer;
        align-items: center;
        justify-content: center;
        position: absolute;
        z-index: 1;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .scroll-btn.left {
        left: -8px;
    }
    
    .scroll-btn.right {
        right: -8px;
    }
    
    .orders-container {
        min-height: 300px;
    }
    
    .orders-section {
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        padding: 1.5rem;
    }

    /* Order card styles */
    .order-card {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        overflow: hidden;
    }
    
    .order-header {
        background-color: #f5f7f9;
        padding: 0.75rem 1rem;
        display: flex;
        justify-content: space-between;
        font-size: 0.9rem;
        color: #555;
        border-bottom: 1px solid #e0e0e0;
    }
    
    .order-content {
        padding: 1rem;
    }
    
    .order-item {
        display: flex;
        align-items: center;
        padding: 0.5rem 0;
    }
    
    .item-image {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 4px;
        border: 1px solid #eee;
    }
    
    .item-details {
        flex: 1;
        padding: 0 1rem;
    }
    
    .item-details h3 {
        margin: 0 0 0.25rem 0;
        font-size: 1.1rem;
        color: #333;
    }
    
    .seller {
        color: #777;
        font-size: 0.9rem;
        margin: 0.25rem 0;
    }
    
    .price {
        font-size: 0.9rem;
        color: #444;
        margin: 0.25rem 0;
    }
    
    .item-status {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        min-width: 120px;
    }
    
    .status-badge {
        padding: 0.35rem 0.75rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        margin-bottom: 0.5rem;
    }
    
    .status-badge.pending {
        background-color: #fff8e1;
        color: #f57c00;
    }
    
    .status-badge.to_ship {
        background-color: #e3f2fd;
        color: #1976d2;
    }
    
    .status-badge.to_receive {
        background-color: #e8f5e9;
        color: #388e3c;
    }
    
    .status-badge.completed {
        background-color: #f5f5f5;
        color: #616161;
    }
    
    .total-price {
        font-weight: 600;
        color: #222;
        font-size: 1rem;
        margin: 0.25rem 0;
    }
    
    .order-actions {
        display: flex;
        justify-content: flex-end;
        padding: 0.75rem 1rem;
        background-color: #fafafa;
        border-top: 1px solid #eee;
        gap: 0.75rem;
    }
    
    .btn-action {
        padding: 0.5rem 1rem;
        background-color: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        color: #444;
        transition: all 0.2s;
    }
    
    .btn-action:hover {
        background-color: #eee;
    }
    
    .btn-action.primary {
        background-color: #2b4b66;
        color: white;
        border-color: #2b4b66;
    }
    
    .btn-action.primary:hover {
        background-color: #1e3a52;
    }
    
    .btn-action.cancel {
        background-color: #fff;
        color: #e53935;
        border-color: #e53935;
    }
    
    .btn-action.cancel:hover {
        background-color: #ffebee;
    }
    
    /* Empty state */
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 1rem;
        color: #888;
    }
    
    .empty-state svg {
        color: #bbb;
        margin-bottom: 1rem;
    }
    
    .empty-state p {
        margin-bottom: 1.5rem;
        font-size: 1.1rem;
    }
    
    .btn-primary {
        padding: 0.75rem 1.5rem;
        background-color: #2b4b66;
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
    }
    
    .btn-primary:hover {
        background-color: #1e3a52;
    }

    /* Review Modal Styles */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .modal-container {
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .modal-content {
        padding: 1.5rem;
    }
    
    .modal-content h2 {
        color: #333;
        margin-top: 0;
        margin-bottom: 1.5rem;
        text-align: center;
    }
    
    .product-info {
        display: flex;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #eee;
    }
    
    .product-image {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 4px;
        margin-right: 1rem;
    }
    
    .product-details h3 {
        margin: 0 0 0.25rem;
        font-size: 1.1rem;
    }
    
    .product-details p {
        color: #777;
        margin: 0;
    }
    
    .rating-section {
        margin-bottom: 1.5rem;
    }
    
    .rating-section p {
        font-weight: 500;
        margin-bottom: 0.5rem;
    }
    
    .star-rating {
        display: flex;
        align-items: center;
    }
    
    .star-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        color: #ddd;
        transition: color 0.2s;
        margin-right: 0.25rem;
    }
    
    .star-btn.active {
        color: #ffb400;
    }
    
    .rating-text {
        margin-left: 0.75rem;
        font-weight: 500;
        color: #ffb400;
    }
    
    .review-input {
        margin-bottom: 1.5rem;
    }
    
    .review-input textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        resize: vertical;
        font-family: inherit;
        font-size: 0.95rem;
    }
    
    .modal-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }
    
    .btn-cancel {
        padding: 0.6rem 1.2rem;
        background-color: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        color: #555;
    }
    
    .btn-submit {
        padding: 0.6rem 1.2rem;
        background-color: #789DBC;
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
    }
    
    .btn-submit:hover {
        background-color: #1e3a52;
    }

    .review-box {
        background-color: #f9f9f9;
        border: 1px solid #eee;
        border-radius: 6px;
        padding: 0.75rem;
        margin-top: 0.5rem;
        font-size: 0.9rem;
    }

    .review-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }

    .star-display {
        display: flex;
    }

    .star {
        color: #ddd;
        margin-right: 2px;
    }

    .star.filled {
        color: #ffb400;
    }

    .review-date {
        font-size: 0.8rem;
        color: #777;
    }

    .review-text {
        margin: 0;
        color: #555;
        line-height: 1.4;
    }

    /* Order Details Modal Styles */
    .order-details-modal {
        max-width: 600px;
    }
    
    .close-modal-btn {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        cursor: pointer;
        color: #777;
        padding: 4px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .close-modal-btn:hover {
        background-color: #f5f5f5;
        color: #333;
    }
    
    .order-details-section {
        margin-bottom: 1.5rem;
    }
    
    .order-details-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.5rem;
    }
    
    .order-date-detail {
        color: #777;
        font-size: 0.9rem;
        margin: 0.25rem 0 0 0;
    }
    
    .detail-badge {
        margin: 0;
    }
    
    .detail-card {
        background-color: #f9f9f9;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
    }
    
    .detail-card h4 {
        margin-top: 0;
        margin-bottom: 0.75rem;
        color: #444;
        font-size: 1rem;
    }
    
    .product-info-detail {
        display: flex;
        align-items: center;
    }
    
    .product-image-detail {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 4px;
        margin-right: 1rem;
    }
    
    .product-info-detail h5 {
        margin: 0 0 0.5rem 0;
        font-size: 1.1rem;
    }
    
    .product-info-detail p {
        margin: 0.25rem 0;
        color: #555;
    }
    
    .detail-info {
        padding: 0 0.5rem;
    }
    
    .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #eee;
    }
    
    .detail-row.total {
        font-weight: 600;
        font-size: 1.1rem;
        border-bottom: none;
        padding-top: 0.75rem;
    }
    
    .detail-review {
        margin: 0;
    }
    
    @media (max-width: 768px) {
        .content {
            margin-left: 0;
            padding: 1rem;
        }
        
        .tabs {
            padding: 0 0.5rem;
        }
        
        .tab-button {
            padding: 0.5rem 1rem;
            white-space: nowrap;
            flex: 0 0 auto;
        }
        
        .scroll-btn {
            display: flex;
        }
        
        .order-item {
            flex-direction: column;
            align-items: flex-start;
        }
        
        .item-image {
            margin-bottom: 0.75rem;
        }
        
        .item-details {
            padding: 0;
            margin-bottom: 0.75rem;
            width: 100%;
        }
        
        .item-status {
            width: 100%;
            align-items: flex-start;
        }
        
        .order-actions {
            flex-wrap: wrap;
        }
        
        .modal-container {
            width: 95%;
        }
        
        .order-details-header {
            flex-direction: column;
        }
        
        .status-badge.detail-badge {
            margin-top: 0.5rem;
        }
    }
</style>
