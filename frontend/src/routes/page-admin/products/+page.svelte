npm<script lang="ts">
    import type { PageData } from './$types';

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
                return { label: 'Pending Review', class: 'bg-[#e6ecf2] text-[#2b4b66]' };
            case 'approved':
                return { label: 'Approved', class: 'bg-[#e6f4ea] text-[#1e8e3e]' };
            case 'rejected':
                return { label: 'Rejected', class: 'bg-[#fde7e7] text-[#d93025]' };
            default:
                return { label: status, class: '' };
        }
    }
</script>

<main class=" p-8 bg-[#F5ECD5] min-h-[calc(100vh-60px)]">
    <div class="flex gap-4 mb-8">
        <button 
            class="px-4 py-2 bg-white rounded flex items-center gap-2 text-sm text-gray-600 hover:bg-[#e6ecf2] hover:text-[#2b4b66] transition-all duration-200 {activeTab === 'pending' ? 'bg-[#e6ecf2] text-[#2b4b66] font-semibold' : ''}"
            on:click={() => activeTab = 'pending'}
        >
            Pending <span class="bg-gray-100 px-2 py-0.5 rounded-full text-xs">{counts.pending}</span>
        </button>
        <button 
            class="px-4 py-2 bg-white rounded flex items-center gap-2 text-sm text-gray-600 hover:bg-[#e6ecf2] hover:text-[#2b4b66] transition-all duration-200 {activeTab === 'approved' ? 'bg-[#e6ecf2] text-[#2b4b66] font-semibold' : ''}"
            on:click={() => activeTab = 'approved'}
        >
            Approved <span class="bg-gray-100 px-2 py-0.5 rounded-full text-xs">{counts.approved}</span>
        </button>
        <button 
            class="px-4 py-2 bg-white rounded flex items-center gap-2 text-sm text-gray-600 hover:bg-[#e6ecf2] hover:text-[#2b4b66] transition-all duration-200 {activeTab === 'rejected' ? 'bg-[#e6ecf2] text-[#2b4b66] font-semibold' : ''}"
            on:click={() => activeTab = 'rejected'}
        >
            Rejected <span class="bg-gray-100 px-2 py-0.5 rounded-full text-xs">{counts.rejected}</span>
        </button>
    </div>

    <div class="flex flex-col gap-4">
        {#each filteredBusinesses as business}
            <div class="bg-white rounded-lg p-6 shadow-sm">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h2 class="text-lg font-semibold text-gray-900">{business.name}</h2>
                        <p class="text-sm text-gray-600 mt-1">{business.category}</p>
                    </div>
                    <span class="px-3 py-1.5 rounded text-sm {getStatusInfo(business.status).class}">
                        {getStatusInfo(business.status).label}
                    </span>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                        <img src="/location-icon.png" alt="Location" class="w-4 h-4 opacity-70" />
                        <p>{business.location}</p>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                        <img src="/email-icon.png" alt="Email" class="w-4 h-4 opacity-70" />
                        <p>{business.email}</p>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                        <img src="/phone-icon.png" alt="Phone" class="w-4 h-4 opacity-70" />
                        <p>{business.phone}</p>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600">
                        <img src="/calendar-icon.png" alt="Submitted" class="w-4 h-4 opacity-70" />
                        <p>Submitted: {business.submittedDate}</p>
                    </div>
                </div>

                <div class="mb-4">
                    <h3 class="text-base font-medium text-gray-900 mb-2">Business Description</h3>
                    <p class="text-sm text-gray-600 leading-relaxed">{business.description}</p>
                </div>

                {#if business.status === 'pending'}
                    <div class="flex justify-end gap-4">
                        <button class="px-6 py-2 border border-[#ed3324] text-[#ed3324] rounded hover:bg-[#fff5f5] transition-colors duration-200">
                            Reject
                        </button>
                        <button class="px-6 py-2 bg-[#4CAF50] text-white rounded hover:bg-[#43a047] transition-colors duration-200">
                            Approve
                        </button>
                    </div>
                {/if}
            </div>
        {/each}
    </div>
</main>