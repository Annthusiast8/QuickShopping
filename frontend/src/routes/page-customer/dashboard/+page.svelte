<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { profileStore } from '$lib/stores/profile';

  // Reactive variables
  const user = $derived($auth.user);
  const profile = $derived($profileStore.profile);
  
  // Sample data for the dashboard
  const recentOrders = [
    { id: '1001', date: '2023-07-15', status: 'Delivered', total: 125.50 },
    { id: '1002', date: '2023-08-02', status: 'Processing', total: 85.20 },
    { id: '1003', date: '2023-08-10', status: 'Shipped', total: 210.75 }
  ];
  
  // Format currency
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
  
  // Format date
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }
  
  // Get status badge class
  function getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  
  // Fetch profile data on mount
  onMount(() => {
    profileStore.fetchProfile();
  });
</script>

<div>
  <div class="sm:flex sm:items-center sm:justify-between mb-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-1 text-sm text-gray-500">Welcome back, {user?.name || 'Customer'}</p>
    </div>
  </div>

  <!-- Account Overview -->
  <div class="mb-8">
    <h2 class="text-lg font-medium text-gray-900 mb-4">Account Overview</h2>
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      <div class="px-4 py-5 sm:px-6">
        <h3 class="text-base font-medium leading-6 text-gray-900">Personal Information</h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">Your personal details and preferences</p>
      </div>
      <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
        <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Full name</dt>
            <dd class="mt-1 text-sm text-gray-900">{profile?.name || user?.name || 'Not provided'}</dd>
          </div>
          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Email address</dt>
            <dd class="mt-1 text-sm text-gray-900">{profile?.email || user?.email || 'Not provided'}</dd>
          </div>
          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Phone number</dt>
            <dd class="mt-1 text-sm text-gray-900">{profile?.phone || 'Not provided'}</dd>
          </div>
          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Default shipping address</dt>
            <dd class="mt-1 text-sm text-gray-900">
              {#if profile?.addresses?.find(a => a.is_default)}
                {@const defaultAddress = profile.addresses.find(a => a.is_default)}
                {defaultAddress.street}, {defaultAddress.city}, {defaultAddress.state} {defaultAddress.postal_code}
              {:else}
                No default address set
              {/if}
            </dd>
          </div>
        </dl>
      </div>
      <div class="border-t border-gray-200 px-4 py-4 sm:px-6">
        <a href="/page-customer/profile" class="text-sm font-medium text-[#21463E] hover:text-[#143129]">
          Edit profile
          <span aria-hidden="true"> &rarr;</span>
        </a>
      </div>
    </div>
  </div>
  
  <!-- Recent Orders -->
  <div class="mb-8">
    <h2 class="text-lg font-medium text-gray-900 mb-4">Recent Orders</h2>
    <div class="bg-white shadow overflow-hidden sm:rounded-lg">
      {#if recentOrders.length > 0}
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">View</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each recentOrders as order}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{order.id}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(order.date)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusBadgeClass(order.status)}">
                    {order.status}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(order.total)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="/page-customer/orders/{order.id}" class="text-[#21463E] hover:text-[#143129]">
                    View details
                  </a>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <div class="text-center py-10">
          <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by shopping for products.</p>
          <div class="mt-6">
            <a href="/products" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#21463E] hover:bg-[#143129] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#21463E]">
              <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Browse products
            </a>
          </div>
        </div>
      {/if}
      <div class="border-t border-gray-200 px-4 py-4 sm:px-6">
        <a href="/page-customer/orders" class="text-sm font-medium text-[#21463E] hover:text-[#143129]">
          View all orders
          <span aria-hidden="true"> &rarr;</span>
        </a>
      </div>
    </div>
  </div>
</div> 