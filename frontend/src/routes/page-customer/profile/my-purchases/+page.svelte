<script lang="ts">
    import CustomerSidebar from '$lib/components/CustomerSidebar.svelte';
    
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
            seller: 'AudioTech Store'
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
                            <button class="btn-action">View Details</button>
                            {#if order.status === 'completed'}
                                <button class="btn-action">Write Review</button>
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
    }
</style>
