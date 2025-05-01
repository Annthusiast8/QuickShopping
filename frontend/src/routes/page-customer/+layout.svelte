<script lang="ts">
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  //*Check if user is logged in and is a customer (COMMENT)
  onMount(() => {
    if (!$auth.isAuthenticated) {
      goto('/login');
      return;
    }

    if ($auth.user && $auth.user.role !== 'customer') {
      goto('/login');
    }
  });

  function logout() {
    auth.logout();
    goto('/login');
  }

  // Navigation items
  const navItems = [
    { label: 'Shop', href: '/page-customer/home', icon: 'shopping-bag' },
    { label: 'Cart', href: '/page-customer/cart', icon: 'shopping-cart' },
    { label: 'My Purchase', href: '/page-customer/purchases', icon: 'star' },
  ];

  // Profile menu state
  let showProfileMenu = false;

  function toggleProfileMenu() {
    showProfileMenu = !showProfileMenu;
  }

  function handleProfileClick(e: MouseEvent) {
    e.preventDefault();
    toggleProfileMenu();
  }

  function handleEditProfile() {
    goto('/page-customer/profile/edit');
    showProfileMenu = false;
  }

  // Helper function to check if a nav item is active
  function isActive(href: string): boolean {
    return $page.url.pathname.startsWith(href);
  }

  // Filter state
  let showFilterMenu = false;
  let sortBy = 'none';
  let sortOrder = 'asc';
  let showCategoryAccordion = false;

  function toggleFilterMenu() {
    showFilterMenu = !showFilterMenu;
  }

  function handleSort(option: string) {
    sortBy = option;
    // Emit event to parent component to handle sorting
    // This will be implemented in the product listing page
    const event = new CustomEvent('sortProducts', {
      detail: { sortBy, sortOrder }
    });
    window.dispatchEvent(event);
  }

  function toggleSortOrder() {
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    if (sortBy !== 'none') {
      handleSort(sortBy);
    }
  }

  function toggleCategoryAccordion() {
    showCategoryAccordion = !showCategoryAccordion;
  }
</script>

<div class="min-h-screen bg-[#F5ECD5]">
  <!-- Navigation Bar -->
  <nav class="bg-[#789DBC] shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex-shrink-0">
          <a href="/page-customer/home" class="flex items-center">
            <h1 class="text-2xl font-bold text-[#fffff]">
              Quick<span class="text-yellow-500">Buy</span>
            </h1>
          </a>
        </div>

        <!-- Filter and Search Section -->
        <div class="flex-1 max-w-2xl mx-8 flex items-center">
          <!-- Filter Button - Only show on home page -->
          {#if $page.url.pathname === '/page-customer/home'}
            <div class="relative mr-4">
              <button
                on:click={toggleFilterMenu}
                class="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                title="Filter and Sort"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
              
              <!-- Filter Dropdown Menu -->
              {#if showFilterMenu}
                <div class="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <div class="px-4 py-2 text-sm font-bold text-black border-b">
                    Sort by:
                  </div>
                  <button
                    on:click={() => {
                      sortBy = 'name';
                      toggleSortOrder();
                    }}
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {sortBy === 'name' ? `By name (${sortOrder === 'asc' ? 'a-z' : 'z-a'})` : 'By name (a-z)'}
                  </button>
                  <button
                    on:click={() => {
                      sortBy = 'price';
                      toggleSortOrder();
                    }}
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {sortBy === 'price' ? `Price ${sortOrder === 'asc' ? '↑' : '↓' }` : 'Price ↓'}
                  </button>
                 
                  
                  <div class="border-t border-gray-200 mt-1">
                    <button
                      on:click={toggleCategoryAccordion}
                      class="flex justify-between items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <span>Filter by Category</span>
                      <svg
                        class={`w-4 h-4 transform transition-transform ${showCategoryAccordion ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {#if showCategoryAccordion}
                      <div class="pl-4">
                        {#each ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Toys', 'Other'] as category}
                          <button
                            on:click={() => {
                              const event = new CustomEvent('filterByCategory', {
                                detail: { category }
                              });
                              window.dispatchEvent(event);
                              showCategoryAccordion = false;
                              showFilterMenu = false;
                            }}
                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {category}
                          </button>
                        {/each}
                      </div>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>
          {/if}

          <!-- Search Bar - Hide on profile page -->
          {#if $page.url.pathname !== '/page-customer/profile'}
            <div class="flex-1">
              <div class="relative">
                <input
                  type="text"
                  placeholder="Search product..."
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#21463E] focus:border-transparent"
                  on:input={(e) => {
                    const event = new CustomEvent('searchProducts', {
                      detail: { query: e.target.value }
                    });
                    window.dispatchEvent(event);
                  }}
                />
                <button class="absolute right-3 top-2.5 text-gray-400 hover:text-[#21463E]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          {/if}
        </div>

        <!-- Navigation Icons -->
        <div class="flex items-center space-x-4">
          {#each navItems as item}
            <a
              href={item.href}
              class="p-2 rounded-full hover:bg-gray-100 {isActive(item.href) ? 'text-[#dad736]' : 'text-gray-600'}"
              title={item.label}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {#if item.icon === 'chart-pie'}
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                {:else if item.icon === 'shopping-cart'}
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                {:else if item.icon === 'star'}
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                {:else if item.icon === 'shopping-bag'}
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                {/if}
              </svg>
            </a>
          {/each}

          <!-- Profile Button with Dropdown -->
          <div class="relative">
            <button
              on:click={handleProfileClick}
              class="p-2 rounded-full hover:bg-gray-100 {isActive('/page-customer/profile') ? 'text-[#dad736]' : 'text-gray-600'}"
              title="Profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            <!-- Profile Dropdown Menu -->
            {#if showProfileMenu}
              <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <a
                  href="/page-customer/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  My Profile
                </a>
                <button
                  on:click={logout}
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </nav>

  <!-- Mobile Navigation (Hamburger Menu) -->
  <div class="sm:hidden">
    <div class="px-2 pt-2 pb-3 space-y-1">
      {#each navItems as item}
        <a
          href={item.href}
          class="block px-3 py-2 rounded-md text-base font-medium {isActive(item.href) ? 'bg-[#21463E] text-white' : 'text-gray-600 hover:bg-gray-100'}"
        >
          {item.label}
        </a>
      {/each}
    </div>
  </div>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <slot />
  </main>
</div> 