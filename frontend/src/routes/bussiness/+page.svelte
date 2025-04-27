<script lang="ts">
    import type { PageData } from './$types';
    import Header from '$lib/header.svelte';
    import Sidebar from '$lib/Sidebar.svelte';

    let { data }: { data: PageData } = $props();
    
    // Mock data for business listings with different statuses
    const allBusinessListings = [
        {
            name: 'PowerBoost Gadgets',
            category: 'Mobile Accessories & Power Banks',
            location: '3rd Floor, Ayala Malls Feliz, Pasig City',
            email: 'powerboostgadgetph@gmail.com',
            phone: '09123456789',
            submittedDate: 'March 2, 2025, 2:45 PM',
            description: 'Specializing in durable and fast-charging power banks, cables, adapters, and wireless accessories for tech-savvy Filipinos.',
            status: 'pending'
        },
        {
            name: 'Urban Carry',
            category: 'Bags & Accessories Store',
            location: 'Greenhills, San Juan City',
            email: 'urbancarryph@gmail.com',
            phone: '09123456789',
            submittedDate: 'March 11, 2025, 08:27 AM',
            description: 'Trendy and durable bags for students, professionals, and travelers—fashion meets function.',
            status: 'pending'
        },
        {
            name: 'TechHub Solutions',
            category: 'Electronics Store',
            location: 'SM Megamall, Mandaluyong City',
            email: 'techhub@gmail.com',
            phone: '09187654321',
            submittedDate: 'March 1, 2025, 10:15 AM',
            description: 'Your one-stop shop for all electronics needs - from smartphones to laptops and accessories.',
            status: 'approved'
        },
        {
            name: 'Fashion Forward',
            category: 'Clothing Store',
            location: 'Robinsons Place Manila',
            email: 'fashionforward@gmail.com',
            phone: '09234567890',
            submittedDate: 'February 28, 2025, 3:30 PM',
            description: 'Latest fashion trends for men and women at affordable prices.',
            status: 'approved'
        },
        {
            name: 'Fake Store',
            category: 'Suspicious Items',
            location: 'Unknown Location',
            email: 'fake@scam.com',
            phone: '09999999999',
            submittedDate: 'March 5, 2025, 12:00 AM',
            description: 'Suspicious business selling counterfeit items.',
            status: 'rejected'
        }
    ];

    let activeTab = $state('pending');

    // Filter businesses based on active tab
    const filteredBusinesses = $derived(
        allBusinessListings.filter(business => business.status === activeTab)
    );
    
    // Count for each status
    const counts = $derived({
        pending: allBusinessListings.filter(b => b.status === 'pending').length,
        approved: allBusinessListings.filter(b => b.status === 'approved').length,
        rejected: allBusinessListings.filter(b => b.status === 'rejected').length
    });

    // Function to get appropriate status label and style
    function getStatusInfo(status: string) {
        switch (status) {
            case 'pending':
                return { label: 'Pending Review', class: 'status-pending' };
            case 'approved':
                return { label: 'Approved', class: 'status-approved' };
            case 'rejected':
                return { label: 'Rejected', class: 'status-rejected' };
            default:
                return { label: status, class: '' };
        }
    }
</script>

<Header />
<Sidebar />

<main class="main-content">
    <div class="tabs">
        <button 
            class:active={activeTab === 'pending'} 
            on:click={() => activeTab = 'pending'}
        >
            Pending <span class="count">{counts.pending}</span>
        </button>
        <button 
            class:active={activeTab === 'approved'} 
            on:click={() => activeTab = 'approved'}
        >
            Approved <span class="count">{counts.approved}</span>
        </button>
        <button 
            class:active={activeTab === 'rejected'} 
            on:click={() => activeTab = 'rejected'}
        >
            Rejected <span class="count">{counts.rejected}</span>
        </button>
    </div>

    <div class="business-listings">
        {#each filteredBusinesses as business}
            <div class="business-card">
                <div class="business-header">
                    <div>
                        <h2>{business.name}</h2>
                        <p class="category">{business.category}</p>
                    </div>
                    <span class="status {getStatusInfo(business.status).class}">
                        {getStatusInfo(business.status).label}
                    </span>
                </div>

                <div class="business-details">
                    <div class="detail">
                        <img src="/location-icon.png" alt="Location" />
                        <p>{business.location}</p>
                    </div>
                    <div class="detail">
                        <img src="/email-icon.png" alt="Email" />
                        <p>{business.email}</p>
                    </div>
                    <div class="detail">
                        <img src="/phone-icon.png" alt="Phone" />
                        <p>{business.phone}</p>
                    </div>
                    <div class="detail">
                        <img src="/calendar-icon.png" alt="Submitted" />
                        <p>Submitted: {business.submittedDate}</p>
                    </div>
                </div>

                <div class="business-description">
                    <h3>Business Description</h3>
                    <p>{business.description}</p>
                </div>

                {#if business.status === 'pending'}
                    <div class="action-buttons">
                        <button class="reject">Reject</button>
                        <button class="approve">Approve</button>
                    </div>
                {/if}
            </div>
        {/each}
    </div>
</main>

<style>
    .main-content {
        margin-left: 200px;
        margin-top: 60px;
        padding: 2rem;
        background-color: #F5ECD5;

        min-height: calc(100vh - 60px);
    }

    .tabs {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .tabs button {
        padding: 0.5rem 1rem;
        border: none;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
        color: #666;
    }

    .tabs button.active {
        background: #e6ecf2;
        color: #2b4b66;
        font-weight: 600;
    }

    .count {
        background: #f0f0f0;
        padding: 0.2rem 0.5rem;
        border-radius: 12px;
        font-size: 0.8rem;
    }

    .business-listings {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .business-card {
        background: white;
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .business-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
    }

    .business-header h2 {
        margin: 0;
        font-size: 1.2rem;
        color: #333;
    }

    .category {
        margin: 0.25rem 0 0;
        color: #666;
        font-size: 0.9rem;
    }

    .status {
        padding: 0.4rem 0.8rem;
        border-radius: 4px;
        font-size: 0.8rem;
    }

    .business-details {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .detail {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #666;
        font-size: 0.9rem;
    }

    .detail img {
        width: 16px;
        height: 16px;
        opacity: 0.7;
    }

    .business-description {
        margin-bottom: 1rem;
    }

    .business-description h3 {
        font-size: 1rem;
        margin: 0 0 0.5rem;
        color: #333;
    }

    .business-description p {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
        line-height: 1.5;
    }

    .action-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }

    .action-buttons button {
        padding: 0.5rem 1.5rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
    }

    .reject {
        background: white;
        border: 1px solid #ed3324 !important;
        color: #ed3324;
    }

    .approve {
        background: #4CAF50;
        color: white;
    }

    .reject:hover {
        background: #fff5f5;
    }

    .approve:hover {
        background: #43a047;
    }

    .status-pending {
        background: #e6ecf2;
        color: #2b4b66;
    }

    .status-approved {
        background: #e6f4ea;
        color: #1e8e3e;
    }

    .status-rejected {
        background: #fde7e7;
        color: #d93025;
    }
</style>