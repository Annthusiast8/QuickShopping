<script lang="ts">
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import CartIndicator from '$lib/components/CartIndicator.svelte';
  import Alerts from '$lib/components/Alerts.svelte';

  //*Check if user is logged in and is a customer (COMMENT)
  /*onMount(() => {
    if (!$auth.isAuthenticated) {
      goto('/login');
      return;
    }

    if ($auth.user && $auth.user.role !== 'customer') {
      goto('/login');
    }
  }); */

  // Logout alert state
  let showLogoutAlert = false;

  function logout() {
    showLogoutAlert = true;
  }

  function handleConfirmLogout() {
    auth.logout();
    goto('/login');
  }

  function closeLogoutAlert() {
    showLogoutAlert = false;
  }

  // Navigation items
  const navItems = [
    { label: 'Shop', href: '/page-customer/home', icon: 'shopping-bag' },
  ];

  // Profile menu state
  let showProfileMenu = false;
  let profileMenuRef: HTMLDivElement;

  function toggleProfileMenu() {
    showProfileMenu = !showProfileMenu;
  }

  function closeProfileMenu() {
    showProfileMenu = false;
  }

  function handleProfileClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
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
  let filterMenuRef: HTMLDivElement | null = null;

  // Search state
  let searchQuery = '';
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;
  const SEARCH_DELAY = 300; // ms delay for search to prevent too many searches while typing

  function handleSearch(e: Event) {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Get current page path
      const currentPath = $page.url.pathname;
      
      // If we're already on the home page, dispatch searchProducts event
      if (currentPath.includes('/page-customer/home')) {
        window.dispatchEvent(new CustomEvent('searchProducts', {
          detail: { query: searchQuery.trim() }
        }));
      } 
      // If we're on the cart page, filter cart items
      else if (currentPath.includes('/page-customer/cart')) {
        window.dispatchEvent(new CustomEvent('searchCart', {
          detail: { query: searchQuery.trim() }
        }));
      }
      // If we're on my-purchases page, filter orders
      else if (currentPath.includes('/page-customer/profile/my-purchases')) {
        window.dispatchEvent(new CustomEvent('searchPurchases', {
          detail: { query: searchQuery.trim() }
        }));
      }
      // Otherwise navigate to search page
      else {
        goto(`/page-customer/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  }

  function handleSearchInput() {
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout to delay search until typing stops
    searchTimeout = setTimeout(() => {
      const currentPath = $page.url.pathname;
      
      // Only trigger search if we're on a searchable page and have query text
      if (searchQuery.trim()) {
        if (currentPath.includes('/page-customer/home')) {
          window.dispatchEvent(new CustomEvent('searchProducts', {
            detail: { query: searchQuery.trim() }
          }));
        } else if (currentPath.includes('/page-customer/cart')) {
          window.dispatchEvent(new CustomEvent('searchCart', {
            detail: { query: searchQuery.trim() }
          }));
        } else if (currentPath.includes('/page-customer/profile/my-purchases')) {
          window.dispatchEvent(new CustomEvent('searchPurchases', {
            detail: { query: searchQuery.trim() }
          }));
        }
      } else {
        // If search is cleared, reset the search
        if (currentPath.includes('/page-customer/home')) {
          window.dispatchEvent(new CustomEvent('searchProducts', {
            detail: { query: '' }
          }));
        } else if (currentPath.includes('/page-customer/cart')) {
          window.dispatchEvent(new CustomEvent('searchCart', {
            detail: { query: '' }
          }));
        } else if (currentPath.includes('/page-customer/profile/my-purchases')) {
          window.dispatchEvent(new CustomEvent('searchPurchases', {
            detail: { query: '' }
          }));
        }
      }
    }, SEARCH_DELAY);
  }

  function toggleFilterMenu() {
    showFilterMenu = !showFilterMenu;
  }

  function closeFilterMenu() {
    showFilterMenu = false;
    showCategoryAccordion = false;
  }

  function handleClickOutside(event: MouseEvent) {
    if (showFilterMenu && filterMenuRef && !filterMenuRef.contains(event.target as Node)) {
      closeFilterMenu();
    }
    if (showProfileMenu && profileMenuRef && !profileMenuRef.contains(event.target as Node)) {
      closeProfileMenu();
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });

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
  <nav class="bg-[#789DBC] shadow-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo - Hidden on mobile -->
        <div class="flex-shrink-0 hidden sm:block">
          <a href="/page-customer/home" class="flex items-center">
            <h1 class="text-2xl font-bold text-[#fffff]">
              Quick<span class="text-yellow-500">Buy</span>
            </h1>
          </a>
        </div>

        <!-- Filter and Search Section -->
        <div class="flex-1 max-w-full sm:max-w-2xl sm:mx-8 flex items-center">
          <!-- Filter Button - Only show on home page -->
          
          <!-- Search Bar -->
          <form on:submit={handleSearch} class="w-full">
            <div class="relative flex items-center bg-[#f2f2f2] rounded-full">
              <input
                bind:value={searchQuery}
                on:input={handleSearchInput}
                placeholder="Search product..."
                class="block w-full pl-4 pr-10 py-2 bg-transparent border-none rounded-full focus:outline-none focus:ring-0 sm:text-sm"
              />
              <button 
                type="submit" 
                class="absolute right-0 p-2 rounded-full focus:outline-none"
              >
                <svg class="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </div>
          </form>
        </div>

        <!-- Navigation Icons -->
        <div class="flex items-center space-x-1 sm:space-x-4">
          {#each navItems as item}
            <a
              href={item.href}
              class="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 {isActive(item.href) ? 'text-[#dad736]' : 'text-gray-600'}"
              title={item.label}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {#if item.icon === 'chart-pie'}
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                {:else if item.icon === 'star'}
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                {:else if item.icon === 'store'}
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h18v2a3 3 0 01-3 3H6a3 3 0 01-3-3V3zm0 15v-2a3 3 0 013-3h12a3 3 0 013 3v2H3zm12-9h3v3h-3V9zM9 9h3v3H9V9zM6 9h.01v.01H6V9z" />
                {:else if item.icon === 'shopping-bag'}
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                {:else if item.icon === 'shopping-shop'}
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                {/if}
              </svg>
            </a>
          {/each}

          <!-- Cart with count indicator -->
          <div class="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 {isActive('/page-customer/cart') ? 'text-[#dad736]' : 'text-gray-600'}">
            <CartIndicator />
          </div>

          <!-- Profile Button with Dropdown -->
          <div class="relative">
            <button
              on:click={handleProfileClick}
              class="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 {isActive('/page-customer/profile') ? 'text-[#dad736]' : 'text-gray-600'}"
              title="Profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            <!-- Profile Dropdown Menu -->
            {#if showProfileMenu}
              <div 
                bind:this={profileMenuRef}
                on:click|stopPropagation
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
              >
                <a
                  href="/page-customer/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  My Profile
                </a>
                <a
                  href="/page-customer/profile/my-purchases"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  My Purchases
                </a>
                <button
                  on:click|stopPropagation={logout}
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

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <slot />
  </main>

  <!-- Logout Alert -->
  <Alerts 
    isVisible={showLogoutAlert}
    type="logout-confirm"
    on:close={closeLogoutAlert}
    on:confirmLogout={handleConfirmLogout}
  />
</div> 