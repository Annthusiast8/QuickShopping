<script lang="ts">
  import { onMount } from 'svelte';
  import { usersStore } from '$lib/stores/users';

  // Stats data
  let stats = [
    { name: 'Total Users', value: '0', icon: 'users', color: 'bg-blue-500' },
    { name: 'Customers', value: '0', icon: 'user', color: 'bg-green-500' },
    { name: 'Sellers', value: '0', icon: 'store', color: 'bg-purple-500' },
    { name: 'Admins', value: '0', icon: 'shield', color: 'bg-red-500' }
  ];

  // Update stats using runes
  $effect(() => {
    if ($usersStore.users.length > 0) {
      const users = $usersStore.users;
      stats[0].value = users.length.toString();
      stats[1].value = users.filter(user => user.role === 'customer').length.toString();
      stats[2].value = users.filter(user => user.role === 'seller').length.toString();
      stats[3].value = users.filter(user => user.role === 'admin').length.toString();
    }
  });

  // Fetch users on component mount
  onMount(() => {
    usersStore.fetchUsers();
  });
</script>

<div style="display: flex; min-height: 100vh;">
 
  <main style="flex: 1; margin-left: 10px; padding: 2rem 2rem 2rem 2rem; background: #f8fafc; min-height: 100vh;">
    <div class="sm:flex sm:items-center sm:justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="mt-1 text-sm text-gray-500">Overview of your store</p>
      </div>
    </div>

    <div class="mt-4">
      <dl class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {#each stats as stat}
          <div class="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
            <dt>
              <div class="{stat.color} absolute rounded-md p-3">
                {#if stat.icon === 'users'}
                  <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                {:else if stat.icon === 'user'}
                  <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                {:else if stat.icon === 'store'}
                  <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                  </svg>
                {:else if stat.icon === 'shield'}
                  <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                {/if}
              </div>
              <p class="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
            </dt>
            <dd class="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p class="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <div class="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
                <div class="text-sm">
                  <a href="/page-admin/users" class="font-medium text-indigo-600 hover:text-indigo-500">View all<span class="sr-only"> {stat.name}</span></a>
                </div>
              </div>
            </dd>
          </div>
        {/each}
      </dl>
    </div>

    <div class="mt-12">
      <h2 class="text-base font-semibold leading-7 text-gray-900">Recent Activity</h2>
      <p class="mt-1 text-sm leading-6 text-gray-500">Latest activity in your store</p>
      <div class="mt-4 overflow-hidden rounded-lg border border-gray-200">
        <div class="bg-white p-6">
          <p class="text-center text-gray-500">No recent activity</p>
        </div>
      </div>
    </div>
  </main>
</div> 