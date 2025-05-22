<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { seller } from '$lib/stores/seller';
  import { auth } from '$lib/stores/auth';
  import { api } from '$lib/services/api';
  import Header from '$lib/header.svelte';
  import Alerts from '$lib/components/Alerts.svelte';

  // Order state
  let orders: any[] = [];
  let filteredOrders: any[] = [];
  let loading = true;
  let error: string | null = null;
  
  // UI state
  let showDetailModal = false;
  let showUpdateModal = false;
  let selectedOrder: any = null;
  let newStatus = '';
  let updateNotes = '';
  let showAlert = false;
  let alertType: 'success' | 'error' = 'success';
  let alertMessage = '';

  // Filters
  let searchQuery = '';
  let statusFilter = 'all';
  let sortBy = 'date_desc';
  
  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' }
  ];
  
  const sortOptions = [
    { value: 'date_desc', label: 'Newest First' },
    { value: 'date_asc', label: 'Oldest First' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'price_asc', label: 'Price: Low to High' }
  ];

  // Format date
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Format price
  function formatPrice(price: number) {
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    });
  }

  // Get status class
  function getStatusClass(status: string) {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Load orders
  async function loadOrders() {
    loading = true;
    error = null;
    
    try {
      const response = await api.getSellerOrders();
      console.log('Orders API response:', response);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        orders = response;
      } else if (response && typeof response === 'object' && 'data' in response) {
        orders = (response as {data: any[]}).data;
      } else {
        console.error('Unexpected API response format:', response);
        orders = [];
      }
      
      // We don't need to manually update the seller store as it doesn't expose an update method
      // Just use the orders directly in this component
      
      applyFilters();
    } catch (err) {
      console.error('Failed to load orders:', err);
      error = 'Failed to load orders. Please try again.';
    } finally {
      loading = false;
    }
  }

  // Apply filters and sorting
  function applyFilters() {
    // Filter by status
    let result = [...orders];
    
    if (statusFilter !== 'all') {
      result = result.filter(order => 
        order.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(order => 
        order.id.toString().includes(query) ||
        (order.customer?.name || '').toLowerCase().includes(query) ||
        (order.items.some((item: any) => 
          item.product_name.toLowerCase().includes(query)
        ))
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'date_asc':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'date_desc':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'price_asc':
        result.sort((a, b) => a.total_amount - b.total_amount);
        break;
      case 'price_desc':
        result.sort((a, b) => b.total_amount - a.total_amount);
        break;
    }
    
    filteredOrders = result;
  }

  // Open order detail modal
  function viewOrderDetails(order: any) {
    selectedOrder = order;
    showDetailModal = true;
  }

  // Close order detail modal
  function closeDetailModal() {
    showDetailModal = false;
    selectedOrder = null;
  }

  // Open update status modal
  function openUpdateModal(order: any) {
    selectedOrder = order;
    newStatus = order.status.toLowerCase();
    updateNotes = '';
    showUpdateModal = true;
  }

  // Close update status modal
  function closeUpdateModal() {
    showUpdateModal = false;
    selectedOrder = null;
    newStatus = '';
    updateNotes = '';
  }

  // Update order status
  async function updateOrderStatus() {
    if (!selectedOrder || !newStatus) return;
    
    loading = true;
    try {
      await api.updateOrderStatus(selectedOrder.id, newStatus as 'approved' | 'rejected' | 'completed');
      showUpdateModal = false;
      showAlert = true;
      alertType = 'success';
      alertMessage = `Order #${selectedOrder.id} status updated to ${newStatus.toUpperCase()}`;
      
      // Reload orders
      await loadOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
      showAlert = true;
      alertType = 'error';
      alertMessage = 'Failed to update order status. Please try again.';
    } finally {
      loading = false;
    }
  }

  // Initialize
  onMount(async () => {
    if (!$auth.user) {
      goto('/login?redirect=/page-seller/orders');
      return;
    }

    if ($auth.user.role !== 'seller') {
      goto('/');
      return;
    }

    await loadOrders();
  });

  // Watch for filter changes
  $: {
    if (orders.length > 0) {
      applyFilters();
    }
  }
</script>

<Header />

<div class="p-4 max-w-7xl mx-auto mt-16">
  <div class="bg-white rounded-lg shadow-md p-6">
    <!-- Header with filters -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <h1 class="text-2xl font-bold text-gray-800">Order Management</h1>
      
      <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <!-- Search -->
        <div class="relative">
          <input 
            type="text" 
            bind:value={searchQuery}
            placeholder="Search orders..."
            class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
          <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </div>
        
        <!-- Status filter -->
        <select 
          bind:value={statusFilter}
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {#each statusOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
        
        <!-- Sort options -->
        <select 
          bind:value={sortBy}
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {#each sortOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>
    </div>
    
    <!-- Orders table -->
    {#if loading && orders.length === 0}
      <div class="flex justify-center items-center py-20">
        <svg class="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    {:else if error}
      <div class="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
        <p>{error}</p>
        <button 
          class="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          on:click={loadOrders}
        >
          Try Again
        </button>
      </div>
    {:else if filteredOrders.length === 0}
      <div class="bg-yellow-50 p-8 rounded-lg text-center">
        <svg class="mx-auto h-12 w-12 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900">No orders found</h3>
        <p class="mt-1 text-gray-500">
          {searchQuery || statusFilter !== 'all' ? 'Try changing your filters' : 'You don\'t have any orders yet'}
        </p>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each filteredOrders as order}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.customer?.name || 'Anonymous'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(order.created_at)}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  <div class="flex flex-col">
                    {#each order.items.slice(0, 2) as item}
                      <span>{item.product_name} x{item.quantity}</span>
                    {/each}
                    {#if order.items.length > 2}
                      <span class="text-xs text-blue-500">+{order.items.length - 2} more items</span>
                    {/if}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatPrice(order.total_amount)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {getStatusClass(order.status)}">
                    {order.status.toUpperCase()}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button 
                      type="button"
                      class="text-blue-600 hover:text-blue-900"
                      on:click={() => viewOrderDetails(order)}
                    >
                      View
                    </button>
                    <button 
                      type="button"
                      class="text-green-600 hover:text-green-900"
                      on:click={() => openUpdateModal(order)}
                    >
                      Update
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>

<!-- Order Detail Modal -->
{#if showDetailModal && selectedOrder}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" role="dialog" tabindex="-1" aria-modal="true">
    <div class="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <div class="p-6 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-800">Order #{selectedOrder.id}</h2>
          <button 
            type="button" 
            class="text-gray-400 hover:text-gray-500" 
            on:click={closeDetailModal}
          >
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Order Info -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Order Information</h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm font-medium text-gray-500">Order Date</p>
                  <p class="text-sm text-gray-900">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Status</p>
                  <p class="text-sm">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full {getStatusClass(selectedOrder.status)}">
                      {selectedOrder.status.toUpperCase()}
                    </span>
                  </p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Payment Method</p>
                  <p class="text-sm text-gray-900">{selectedOrder.payment_method || 'Cash on Delivery'}</p>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-500">Payment Status</p>
                  <p class="text-sm text-gray-900">{selectedOrder.payment_status || 'Pending'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Customer Info -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Customer Information</h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm font-medium text-gray-900">{selectedOrder.customer?.name || 'Anonymous'}</p>
              <p class="text-sm text-gray-500">{selectedOrder.customer?.email || 'No email provided'}</p>
              <p class="text-sm text-gray-500">{selectedOrder.customer?.phone || 'No phone provided'}</p>
              <div class="mt-2">
                <p class="text-sm font-medium text-gray-500">Shipping Address</p>
                <p class="text-sm text-gray-900">{selectedOrder.shipping_address || 'No address provided'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Order Items -->
        <h3 class="text-lg font-medium text-gray-900 mb-2">Order Items</h3>
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variations</th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                {#each selectedOrder.items as item}
                  <tr>
                    <td class="px-4 py-3 text-sm text-gray-900">{item.product_name}</td>
                    <td class="px-4 py-3 text-sm text-gray-500">
                      {#if item.variation}
                        {#each Object.entries(item.variation) as [key, value]}
                          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mr-1">
                            {key}: {value}
                          </span>
                        {/each}
                      {:else}
                        <span class="text-gray-400">None</span>
                      {/if}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-900">{formatPrice(item.price)}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</td>
                  </tr>
                {/each}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="px-4 py-3 text-sm font-medium text-gray-900 text-right">Subtotal:</td>
                  <td class="px-4 py-3 text-sm font-medium text-gray-900">{formatPrice(selectedOrder.subtotal || selectedOrder.total_amount)}</td>
                </tr>
                {#if selectedOrder.shipping_fee}
                  <tr>
                    <td colspan="4" class="px-4 py-3 text-sm font-medium text-gray-900 text-right">Shipping Fee:</td>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900">{formatPrice(selectedOrder.shipping_fee)}</td>
                  </tr>
                {/if}
                {#if selectedOrder.discount}
                  <tr>
                    <td colspan="4" class="px-4 py-3 text-sm font-medium text-gray-900 text-right">Discount:</td>
                    <td class="px-4 py-3 text-sm font-medium text-green-600">-{formatPrice(selectedOrder.discount)}</td>
                  </tr>
                {/if}
                <tr>
                  <td colspan="4" class="px-4 py-3 text-base font-bold text-gray-900 text-right">Total:</td>
                  <td class="px-4 py-3 text-base font-bold text-gray-900">{formatPrice(selectedOrder.total_amount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex justify-end space-x-3">
          <button 
            type="button"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            on:click={closeDetailModal}
          >
            Close
          </button>
          <button 
            type="button"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            on:click={() => openUpdateModal(selectedOrder)}
          >
            Update Status
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Update Status Modal -->
{#if showUpdateModal && selectedOrder}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" tabindex="-1" aria-modal="true">
    <div class="bg-white rounded-lg max-w-md w-full">
      <div class="p-6 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-800">Update Order Status</h2>
          <button 
            type="button" 
            class="text-gray-400 hover:text-gray-500" 
            aria-label="Close update status modal"
            on:click={closeUpdateModal}
          >
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div class="p-6">
        <div class="mb-4">
          <label for="order-status" class="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
          <select 
            id="order-status"
            bind:value={newStatus}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        <div class="mb-4">
          <label for="update-notes" class="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
          <textarea 
            id="update-notes"
            bind:value={updateNotes}
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add any notes about this status update..."
          ></textarea>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button 
            type="button"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            on:click={closeUpdateModal}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="button"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
            on:click={updateOrderStatus}
            disabled={loading}
          >
            {#if loading}
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            {/if}
            Update Status
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Alert Component -->
<Alerts 
  isVisible={showAlert}
  type={alertType}
  title={alertType === 'success' ? 'Success' : 'Error'}
  cartAdded={alertMessage}
  autoDismiss={true}
  on:close={() => showAlert = false}
/>

<style>
  .animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
