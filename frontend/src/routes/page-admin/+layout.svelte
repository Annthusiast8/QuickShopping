<script lang="ts">
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  // Check if user is logged in and is admin
  onMount(() => {
    if (!$auth.isAuthenticated) {
      goto('/login');
      return;
    }

    if ($auth.user && $auth.user.role !== 'admin') {
      goto('/login');
    }
  });

  function logout() {
    auth.logout();
    goto('/login');
  }

  // Navigation items
  const navItems = [
    { label: 'Dashboard', href: '/page-admin/dashboard', icon: 'chart-pie' },
    { label: 'Users', href: '/page-admin/users', icon: 'users' },
    { label: 'Products', href: '/page-admin/products', icon: 'shopping-bag' },
    { label: 'Orders', href: '/page-admin/orders', icon: 'shopping-cart' },
    { label: 'Settings', href: '/page-admin/settings', icon: 'cog' }
  ];

  // Helper function to check if a nav item is active
  function isActive(href: string): boolean {
    return $page.url.pathname.startsWith(href);
  }
</script>

<div class="flex h-screen bg-[#f5ecd5]">
  <!-- Sidebar -->
  <div class="hidden md:flex md:flex-shrink-0">
    <div class="flex flex-col w-64">
      <div class="flex flex-col flex-grow pt-5 overflow-y-auto bg-[#21463E] border-r">
        <div class="flex items-center flex-shrink-0 px-4">
          <h1 class="text-2xl font-bold text-white">
            Quick<span class="text-yellow-500">Buy</span> <span class="text-sm font-normal">Admin</span>
          </h1>
        </div>
        <div class="flex flex-col flex-grow px-4 mt-5">
          <nav class="flex-1 space-y-1">
            {#each navItems as item}
              <a 
                href={item.href} 
                class="flex items-center px-2 py-2 text-sm font-medium rounded-md group {isActive(item.href) ? 'bg-[#143129] text-white' : 'text-gray-300 hover:bg-[#143129] hover:text-white'}"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="flex-shrink-0 w-6 h-6 mr-3 {isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {#if item.icon === 'chart-pie'}
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                  {:else if item.icon === 'users'}
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  {:else if item.icon === 'shopping-bag'}
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  {:else if item.icon === 'shopping-cart'}
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  {:else if item.icon === 'cog'}
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  {/if}
                </svg>
                {item.label}
              </a>
            {/each}
          </nav>
        </div>
        <div class="flex-shrink-0 p-4 border-t border-[#143129]">
          <button 
            on:click={logout}
            class="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-[#143129] hover:text-white group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="flex-shrink-0 w-6 h-6 mr-3 text-gray-400 group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile header -->
  <div class="flex flex-col flex-1 overflow-hidden">
    <div class="md:hidden">
      <div class="flex items-center justify-between px-4 py-2 bg-[#21463E] border-b border-[#143129]">
        <h1 class="text-xl font-bold text-white">
          Quick<span class="text-yellow-500">Buy</span> <span class="text-sm font-normal">Admin</span>
        </h1>
        <button class="text-gray-300 focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Main content -->
    <main class="flex-1 overflow-y-auto focus:outline-none bg-gray-100">
      <div class="py-6">
        <div class="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
          <slot />
        </div>
      </div>
    </main>
  </div>
</div> 