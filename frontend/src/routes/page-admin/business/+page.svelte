<script lang="ts">
    import { onMount } from 'svelte';
    import { admin } from '$lib/stores/admin';

    // State variables
    let searchQuery = $state('');
    let statusFilter = $state('Pending');
    let sortBy = $state('Date');
    let showPerPage = $state('5');
    
    // Filter and sort businesses based on selected criteria
    let filteredBusinesses = $state<any[]>([]);
    
    // Update filtered businesses whenever dependencies change
    $effect(() => {
        if (!$admin.pendingBusinesses || $admin.pendingBusinesses.length === 0) {
            filteredBusinesses = [];
            return;
        }
        
        // First filter by search query
        let result = $admin.pendingBusinesses.filter(business => {
            if (!searchQuery) return true;
            
            const query = searchQuery.toLowerCase();
            return (
                business.name?.toLowerCase().includes(query) ||
                business.user?.name?.toLowerCase().includes(query) ||
                business.id?.toString().includes(query)
            );
        });
        
        // Then filter by status if needed
        if (statusFilter !== 'All') {
            result = result.filter(business => {
                if (statusFilter === 'Pending') {
                    return business.status === 'pending' || !business.status;
                } else if (statusFilter === 'Approved') {
                    return business.status === 'approved';
                } else if (statusFilter === 'Rejected') {
                    return business.status === 'rejected';
                }
                return true;
            });
        }
        
        // Sort businesses based on selected criteria
        filteredBusinesses = result.sort((a:any, b:any) => {
            switch (sortBy) {
                case 'ID':
                    return a.id - b.id;
                case 'Name':
                    return a.name.localeCompare(b.name);
                case 'Owner':
                    return a.user?.name.localeCompare(b.user?.name);
                case 'Date':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                default:
                    return 0;
            }
        });
    });
    
    // Pagination
    let perPage = $state(parseInt(showPerPage));
    let totalPages = $state(1);
    let currentPage = $state(1);
    
    // Update pagination variables when dependencies change
    $effect(() => {
        perPage = parseInt(showPerPage);
        totalPages = Math.ceil(filteredBusinesses.length / perPage);
    });
    
    // Get current page businesses
    let paginatedBusinesses = $state<any[]>([]);
    $effect(() => {
        const startIndex = (currentPage - 1) * perPage;
        paginatedBusinesses = filteredBusinesses.slice(startIndex, startIndex + perPage);
    });
    
    // For approval/rejection modal
    let showApprovalModal = $state(false);
    let showRejectionModal = $state(false);
    let selectedBusiness = $state<any | null>(null);
    let rejectionReason = $state('');
    
    // Fetch businesses on component mount
    onMount(() => {
        admin.loadPendingBusinesses();
    });
    
    function openApprovalModal(business: any) {
        selectedBusiness = business;
        showApprovalModal = true;
    }
    
    function closeApprovalModal() {
        showApprovalModal = false;
        selectedBusiness = null;
    }
    
    function openRejectionModal(business: any) {
        selectedBusiness = business;
        showRejectionModal = true;
    }
    
    function closeRejectionModal() {
        showRejectionModal = false;
        selectedBusiness = null;
        rejectionReason = '';
    }
    
    async function approveBusiness() {
        if (selectedBusiness) {
            await admin.approveBusiness(selectedBusiness.id);
            closeApprovalModal();
        }
    }
    
    async function rejectBusiness() {
        if (selectedBusiness && rejectionReason) {
            await admin.rejectBusiness(selectedBusiness.id, rejectionReason);
            closeRejectionModal();
        }
    }
    
    function formatDate(dateString: string) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }
    
    function getStatusBadgeClass(status: string) {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'pending':
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    }
</script>

<div class="min-h-screen bg-[#F5ECD5] pt-[1px]">
    <main class="flex-1 p-6 max-w-[calc(100vw-200px)]">
        <div class="max-w-7xl mx-auto">
            <h1 class="text-2xl font-bold text-gray-800 mb-6">Business Approval Management</h1>
            
            <!-- Search Section -->
            <div class="mb-6 bg-transparent p-6 max-w-3xl">
                <div class="flex items-center mb-6 bg-white rounded-full border border-gray-200 p-2 max-w-2xl">
                    <img src="/Leading-icon.png" alt="Leading Icon" class="w-[18px] h-[18px] ml-3 mr-2 opacity-60">
                    <input 
                        type="text" 
                        placeholder="Search business or owner..." 
                        bind:value={searchQuery}
                        class="flex-1 p-2 text-sm outline-none bg-transparent"
                    >
                    <button class="p-2">
                        <img src="/Search.png" alt="Search" class="w-[18px] h-[18px] opacity-60">
                    </button>
                </div>

                <!-- Filters -->
                <div class="flex flex-col gap-6 mt-4">
                    <div class="flex flex-col gap-3">
                        <span class="text-sm font-medium text-gray-700">Status:</span>
                        <div class="flex gap-3 flex-wrap">
                            <button 
                                class="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 transition-colors {statusFilter === 'All' ? 'bg-[#92A8D1] text-white border-[#92A8D1]' : 'bg-[#F5ECD5] hover:bg-[#eee4cc]'}"
                                on:click={() => { statusFilter = 'All'; currentPage = 1; }}
                            >
                                All
                            </button>
                            <button 
                                class="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 transition-colors {statusFilter === 'Pending' ? 'bg-[#92A8D1] text-white border-[#92A8D1]' : 'bg-[#F5ECD5] hover:bg-[#eee4cc]'}"
                                on:click={() => { statusFilter = 'Pending'; currentPage = 1; }}
                            >
                                Pending
                            </button>
                            <button 
                                class="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 transition-colors {statusFilter === 'Approved' ? 'bg-[#92A8D1] text-white border-[#92A8D1]' : 'bg-[#F5ECD5] hover:bg-[#eee4cc]'}"
                                on:click={() => { statusFilter = 'Approved'; currentPage = 1; }}
                            >
                                Approved
                            </button>
                            <button 
                                class="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 transition-colors {statusFilter === 'Rejected' ? 'bg-[#92A8D1] text-white border-[#92A8D1]' : 'bg-[#F5ECD5] hover:bg-[#eee4cc]'}"
                                on:click={() => { statusFilter = 'Rejected'; currentPage = 1; }}
                            >
                                Rejected
                            </button>
                        </div>
                    </div>

                    <div class="flex flex-col gap-3">
                        <span class="text-sm font-medium text-gray-700">Sort by:</span>
                        <div class="flex gap-3 flex-wrap">
                            {#each ['ID', 'Name', 'Owner', 'Date'] as option}
                                <button 
                                    class="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 transition-colors {sortBy === option ? 'bg-[#92A8D1] text-white border-[#92A8D1]' : 'bg-[#F5ECD5] hover:bg-[#eee4cc]'}"
                                    on:click={() => { sortBy = option; currentPage = 1; }}
                                >
                                    {option}
                                </button>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Businesses List -->
            <div class="bg-white rounded-lg p-5 shadow-sm">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-semibold text-gray-800">Businesses List</h2>
                    <div class="flex gap-4 items-center">
                        <select 
                            bind:value={showPerPage}
                            class="px-2 py-1 border border-gray-200 rounded text-sm text-gray-600"
                            on:change={() => currentPage = 1}
                        >
                            <option value="3">Show 3</option>
                            <option value="5">Show 5</option>
                            <option value="10">Show 10</option>
                            <option value="20">Show 20</option>
                        </select>
                        <button 
                            class="text-[#92A8D1] text-sm"
                            on:click={() => { showPerPage = filteredBusinesses.length.toString(); currentPage = 1; }}
                        >
                            View All
                        </button>
                    </div>
                </div>

                <!-- Table -->
                <div class="overflow-x-auto">
                    <div class="min-w-full bg-[#F5ECD5] rounded-t-lg">
                        <div class="grid grid-cols-7 gap-4 p-3">
                            <div class="text-sm font-medium text-gray-700">ID</div>
                            <div class="text-sm font-medium text-gray-700">Business Name</div>
                            <div class="text-sm font-medium text-gray-700">Owner</div>
                            <div class="text-sm font-medium text-gray-700">Status</div>
                            <div class="text-sm font-medium text-gray-700">Submission Date</div>
                            <div class="text-sm font-medium text-gray-700">Description</div>
                            <div class="text-sm font-medium text-gray-700 text-right pr-4">Action</div>
                        </div>
                    </div>

                    <div class="bg-white">
                        {#if $admin.loading && $admin.pendingBusinesses.length === 0}
                            <div class="p-10 text-center text-sm text-gray-500">
                                <div class="flex justify-center">
                                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-[#21463E]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Loading businesses...</span>
                                </div>
                            </div>
                        {:else if filteredBusinesses.length === 0}
                            <div class="p-10 text-center text-sm text-gray-500">
                                No businesses found matching your criteria
                            </div>
                        {:else}
                            {#each paginatedBusinesses as business (business.id)}
                                <div class="grid grid-cols-7 gap-4 p-4 border-b border-gray-200 hover:bg-gray-50">
                                    <div class="text-sm text-gray-600">{business.id}</div>
                                    <div class="text-sm text-gray-600">{business.name || 'N/A'}</div>
                                    <div class="text-sm text-gray-600">{business.user?.name || 'N/A'}</div>
                                    <div class="text-sm">
                                        <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusBadgeClass(business.status || 'pending')}">
                                            {business.status || 'pending'}
                                        </span>
                                    </div>
                                    <div class="text-sm text-gray-600">{formatDate(business.created_at)}</div>
                                    <div class="text-sm text-gray-600 truncate">{business.description || 'No description'}</div>
                                    <div class="flex gap-3 justify-end pr-4">
                                        {#if !business.status || business.status === 'pending'}
                                            <button 
                                                on:click={() => openApprovalModal(business)}
                                                class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium hover:bg-green-200 transition-colors"
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                on:click={() => openRejectionModal(business)}
                                                class="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium hover:bg-red-200 transition-colors"
                                            >
                                                Reject
                                            </button>
                                        {:else}
                                            <span class="text-xs text-gray-500">No actions available</span>
                                        {/if}
                                    </div>
                                </div>
                            {/each}
                        {/if}
                    </div>
                    
                    <!-- Pagination Controls -->
                    {#if filteredBusinesses.length > 0 && totalPages > 1}
                        <div class="flex justify-between items-center mt-4 px-4">
                            <div class="text-sm text-gray-500">
                                Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filteredBusinesses.length)} of {filteredBusinesses.length} businesses
                            </div>
                            <div class="flex gap-2">
                                <button 
                                    on:click={() => currentPage = Math.max(1, currentPage - 1)}
                                    class="px-3 py-1 border border-gray-200 rounded text-sm {currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'}"
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                {#each Array.from({length: Math.min(5, totalPages)}, (_, i) => i) as i}
                                    {#if totalPages <= 5 || (i < 3 && currentPage <= 3) || (i >= totalPages - 3 && currentPage >= totalPages - 2) || (i >= currentPage - 2 && i <= currentPage)}
                                        <button 
                                            on:click={() => currentPage = i + 1}
                                            class="px-3 py-1 border border-gray-200 rounded text-sm {currentPage === i + 1 ? 'bg-[#92A8D1] text-white border-[#92A8D1]' : 'text-gray-600 hover:bg-gray-50'}"
                                        >
                                            {i + 1}
                                        </button>
                                    {/if}
                                {/each}
                                <button 
                                    on:click={() => currentPage = Math.min(totalPages, currentPage + 1)}
                                    class="px-3 py-1 border border-gray-200 rounded text-sm {currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'}"
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </main>
</div>

<!-- Approval Confirmation Modal -->
{#if showApprovalModal}
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-10"></div>
    <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                    <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                    <div class="mt-3 text-center sm:mt-5">
                        <h3 class="text-base font-semibold leading-6 text-gray-900">Approve Business</h3>
                        <div class="mt-2">
                            <p class="text-sm text-gray-500">
                                Are you sure you want to approve the business <span class="font-medium">{selectedBusiness?.name}</span>? 
                                This will allow the seller to start listing products.
                            </p>
                        </div>
                    </div>
                </div>
                <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button 
                        type="button" 
                        on:click={approveBusiness}
                        class="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 sm:col-start-2"
                        disabled={$admin.loading}
                    >
                        {#if $admin.loading}
                            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Approving...
                        {:else}
                            Approve
                        {/if}
                    </button>
                    <button 
                        type="button" 
                        on:click={closeApprovalModal}
                        class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<!-- Rejection Modal -->
{#if showRejectionModal}
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-10"></div>
    <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                    <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <h3 class="text-base font-semibold leading-6 text-gray-900">Reject Business</h3>
                        <div class="mt-2">
                            <p class="text-sm text-gray-500">
                                Please provide a reason for rejecting the business <span class="font-medium">{selectedBusiness?.name}</span>.
                            </p>
                        </div>
                    </div>
                </div>
                <div class="mt-5 sm:mt-4">
                    <label for="rejection-reason" class="block text-sm font-medium leading-6 text-gray-900">Rejection Reason</label>
                    <div class="mt-2">
                        <textarea
                            id="rejection-reason"
                            rows="4"
                            bind:value={rejectionReason}
                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="Please provide a detailed reason for rejection..."
                        ></textarea>
                    </div>
                    
                    <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button 
                            type="button" 
                            on:click={rejectBusiness}
                            class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                            disabled={$admin.loading || !rejectionReason}
                        >
                            {#if $admin.loading}
                                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Rejecting...
                            {:else}
                                Reject
                            {/if}
                        </button>
                        <button 
                            type="button" 
                            on:click={closeRejectionModal}
                            class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}
