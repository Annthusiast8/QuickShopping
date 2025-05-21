<script lang="ts">
    import { onMount } from 'svelte';
    import { admin } from '$lib/stores/admin';

    // State variables
    let searchQuery = $state('');
    let statusFilter = $state<'pending' | 'reviewed' | 'resolved' | 'all'>('pending');
    let sortBy = $state('Date');
    let showPerPage = $state('5');
    
    // Filter and sort reports based on selected criteria
    let filteredReports = $state<any[]>([]);
    
    // Update filtered reports whenever dependencies change
    $effect(() => {
        if (!$admin.reports || $admin.reports.length === 0) {
            filteredReports = [];
            return;
        }
        
        // First filter by search query
        let result = $admin.reports.filter(report => {
            if (!searchQuery) return true;
            
            const query = searchQuery.toLowerCase();
            return (
                report.reason?.toLowerCase().includes(query) ||
                report.item?.name?.toLowerCase().includes(query) ||
                report.user?.name?.toLowerCase().includes(query) ||
                report.id?.toString().includes(query)
            );
        });
        
        // Then filter by status if needed
        if (statusFilter !== 'all') {
            result = result.filter(report => report.status === statusFilter);
        }
        
        // Sort reports based on selected criteria
        filteredReports = result.sort((a, b) => {
            switch (sortBy) {
                case 'ID':
                    return a.id - b.id;
                case 'Item':
                    return (a.item?.name || '').localeCompare(b.item?.name || '');
                case 'Reporter':
                    return (a.user?.name || '').localeCompare(b.user?.name || '');
                case 'Status':
                    return (a.status || '').localeCompare(b.status || '');
                case 'Date':
                default:
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
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
        totalPages = Math.ceil(filteredReports.length / perPage);
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        }
    });
    
    // Get current page reports
    let paginatedReports = $state<any[]>([]);
    $effect(() => {
        const startIndex = (currentPage - 1) * perPage;
        paginatedReports = filteredReports.slice(startIndex, startIndex + perPage);
    });
    
    // For review modal
    let showReviewModal = $state(false);
    let selectedReport = $state<any | null>(null);
    let adminNotes = $state('');
    let removeItem = $state(false);
    let reviewStatus = $state('reviewed');
    
    // Fetch reports on component mount
    onMount(() => {
        loadReports(statusFilter);
    });
    
    async function loadReports(status: 'pending' | 'reviewed' | 'resolved' | 'all' = 'pending') {
        await admin.loadReports(status === 'all' ? undefined : status as 'pending' | 'reviewed' | 'resolved');
    }
    
    function openReviewModal(report: any) {
        selectedReport = report;
        adminNotes = report.admin_notes || '';
        removeItem = false;
        reviewStatus = report.status === 'pending' ? 'reviewed' : report.status;
        showReviewModal = true;
    }
    
    function closeReviewModal() {
        showReviewModal = false;
        selectedReport = null;
        adminNotes = '';
        removeItem = false;
    }
    
    async function submitReview() {
        if (selectedReport) {
            const reviewData = {
                status: reviewStatus as 'reviewed' | 'resolved',
                admin_notes: adminNotes,
                remove_item: removeItem
            };
            
            await admin.reviewReport(selectedReport.id, reviewData);
            closeReviewModal();
            
            // Reload reports with current filter
            await loadReports(statusFilter);
        }
    }
    
    function formatDate(dateString: string) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }
    
    function getStatusBadgeClass(status: string) {
        switch (status) {
            case 'resolved':
                return 'bg-green-100 text-green-800';
            case 'reviewed':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    }
    
    function truncateText(text: string, maxLength = 50) {
        if (!text) return 'N/A';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
</script>

<div class="min-h-screen bg-[#F5ECD5] pt-[1px]">
    <main class="flex-1 p-6 max-w-[calc(100vw-200px)]">
        <div class="max-w-7xl mx-auto">
            <h1 class="text-2xl font-bold text-gray-800 mb-6">Reports Management</h1>
            
            <!-- Search Section -->
            <div class="mb-6 bg-transparent p-6 max-w-3xl">
                <div class="flex items-center mb-6 bg-white rounded-full border border-gray-200 p-2 max-w-2xl">
                    <img src="/Leading-icon.png" alt="Leading Icon" class="w-[18px] h-[18px] ml-3 mr-2 opacity-60">
                    <input 
                        type="text" 
                        placeholder="Search by item name, reporter, or reason..." 
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
                                class="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 transition-colors {statusFilter === 'all' ? 'bg-[#92A8D1] text-white border-[#92A8D1]' : 'bg-[#F5ECD5] hover:bg-[#eee4cc]'}"
                                on:click={() => { statusFilter = 'all'; currentPage = 1; loadReports('all'); }}
                            >
                                All
                            </button>
                            <button 
                                class="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 transition-colors {statusFilter === 'pending' ? 'bg-[#92A8D1] text-white border-[#92A8D1]' : 'bg-[#F5ECD5] hover:bg-[#eee4cc]'}"
                                on:click={() => { statusFilter = 'pending'; currentPage = 1; loadReports('pending'); }}
                            >
                                Pending
                            </button>
                            <button 
                                class="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 transition-colors {statusFilter === 'reviewed' ? 'bg-[#92A8D1] text-white border-[#92A8D1]' : 'bg-[#F5ECD5] hover:bg-[#eee4cc]'}"
                                on:click={() => { statusFilter = 'reviewed'; currentPage = 1; loadReports('reviewed'); }}
                            >
                                Reviewed
                            </button>
                            <button 
                                class="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 transition-colors {statusFilter === 'resolved' ? 'bg-[#92A8D1] text-white border-[#92A8D1]' : 'bg-[#F5ECD5] hover:bg-[#eee4cc]'}"
                                on:click={() => { statusFilter = 'resolved'; currentPage = 1; loadReports('resolved'); }}
                            >
                                Resolved
                            </button>
                        </div>
                    </div>

                    <div class="flex flex-col gap-3">
                        <span class="text-sm font-medium text-gray-700">Sort by:</span>
                        <div class="flex gap-3 flex-wrap">
                            {#each ['ID', 'Item', 'Reporter', 'Status', 'Date'] as option}
                                <button 
                                    class="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 transition-colors {sortBy === option ? 'bg-[#92A8D1] text-white border-[#92A8D1]' : 'bg-[#F5ECD5] hover:bg-[#eee4cc]'}"
                                    on:click={() => { sortBy = option; }}
                                >
                                    {option}
                                </button>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Reports List -->
            <div class="bg-white rounded-lg p-5 shadow-sm">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-semibold text-gray-800">Reports List</h2>
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
                            on:click={() => { showPerPage = filteredReports.length.toString(); currentPage = 1; }}
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
                            <div class="text-sm font-medium text-gray-700">Item</div>
                            <div class="text-sm font-medium text-gray-700">Reporter</div>
                            <div class="text-sm font-medium text-gray-700">Reason</div>
                            <div class="text-sm font-medium text-gray-700">Status</div>
                            <div class="text-sm font-medium text-gray-700">Date Reported</div>
                            <div class="text-sm font-medium text-gray-700 text-right pr-4">Action</div>
                        </div>
                    </div>

                    <div class="bg-white">
                        {#if $admin.loading && $admin.reports.length === 0}
                            <div class="p-10 text-center text-sm text-gray-500">
                                <div class="flex justify-center">
                                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-[#21463E]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Loading reports...</span>
                                </div>
                            </div>
                        {:else if filteredReports.length === 0}
                            <div class="p-10 text-center text-sm text-gray-500">
                                No reports found matching your criteria
                            </div>
                        {:else}
                            {#each paginatedReports as report (report.id)}
                                <div class="grid grid-cols-7 gap-4 p-4 border-b border-gray-200 hover:bg-gray-50">
                                    <div class="text-sm text-gray-600">{report.id}</div>
                                    <div class="text-sm text-gray-600">{report.item?.name || 'N/A'}</div>
                                    <div class="text-sm text-gray-600">{report.user?.name || 'N/A'}</div>
                                    <div class="text-sm text-gray-600 truncate" title={report.reason}>{truncateText(report.reason)}</div>
                                    <div class="text-sm">
                                        <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getStatusBadgeClass(report.status)}">
                                            {report.status}
                                        </span>
                                    </div>
                                    <div class="text-sm text-gray-600">{formatDate(report.created_at)}</div>
                                    <div class="flex gap-3 justify-end pr-4">
                                        <button 
                                            on:click={() => openReviewModal(report)}
                                            class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                                        >
                                            {report.status === 'pending' ? 'Review' : 'Update'}
                                        </button>
                                    </div>
                                </div>
                            {/each}
                        {/if}
                    </div>
                    
                    <!-- Pagination Controls -->
                    {#if filteredReports.length > 0 && totalPages > 1}
                        <div class="flex justify-between items-center mt-4 px-4">
                            <div class="text-sm text-gray-500">
                                Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, filteredReports.length)} of {filteredReports.length} reports
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

<!-- Review Modal -->
{#if showReviewModal}
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-10"></div>
    <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                    <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div class="mt-3 text-center sm:mt-5">
                        <h3 class="text-base font-semibold leading-6 text-gray-900">Review Report</h3>
                        <div class="mt-2">
                            <div class="mb-4">
                                <div class="text-sm font-medium text-gray-700 mb-1 text-left">Item:</div>
                                <div class="text-sm text-gray-600 text-left">{selectedReport?.item?.name || 'N/A'}</div>
                            </div>
                            <div class="mb-4">
                                <div class="text-sm font-medium text-gray-700 mb-1 text-left">Reported by:</div>
                                <div class="text-sm text-gray-600 text-left">{selectedReport?.user?.name || 'N/A'}</div>
                            </div>
                            <div class="mb-4">
                                <div class="text-sm font-medium text-gray-700 mb-1 text-left">Reason:</div>
                                <div class="text-sm text-gray-600 text-left">{selectedReport?.reason || 'N/A'}</div>
                            </div>
                            <div class="mb-4">
                                <div class="text-sm font-medium text-gray-700 mb-1 text-left">Description:</div>
                                <div class="text-sm text-gray-600 text-left">{selectedReport?.description || 'No description provided'}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mt-4">
                    <label for="review-status" class="block text-sm font-medium leading-6 text-gray-900 text-left">Status</label>
                    <div class="mt-2">
                        <select
                            id="review-status"
                            bind:value={reviewStatus}
                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                            <option value="reviewed">Reviewed</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>
                </div>
                
                <div class="mt-4">
                    <label for="admin-notes" class="block text-sm font-medium leading-6 text-gray-900 text-left">Admin Notes</label>
                    <div class="mt-2">
                        <textarea
                            id="admin-notes"
                            rows="4"
                            bind:value={adminNotes}
                            class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="Add your notes about this report..."
                        ></textarea>
                    </div>
                </div>
                
                <div class="mt-4 flex items-start">
                    <div class="flex h-6 items-center">
                        <input
                            id="remove-item"
                            type="checkbox"
                            bind:checked={removeItem}
                            class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        >
                    </div>
                    <div class="ml-3 text-sm leading-6">
                        <label for="remove-item" class="font-medium text-gray-900">Remove reported item</label>
                        <p class="text-gray-500">This will mark the item as removed and it will no longer be visible to customers.</p>
                    </div>
                </div>
                
                <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button 
                        type="button" 
                        on:click={submitReview}
                        class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2"
                        disabled={$admin.loading}
                    >
                        {#if $admin.loading}
                            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                        {:else}
                            Submit Review
                        {/if}
                    </button>
                    <button 
                        type="button" 
                        on:click={closeReviewModal}
                        class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}