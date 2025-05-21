<script lang="ts">
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth';
  import { cart } from '$lib/stores/cart';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import CartIndicator from '$lib/components/CartIndicator.svelte';
  import Alerts from '$lib/components/Alerts.svelte';

  // Check if user is logged in and is a customer
  onMount(() => {
    if (!$auth.token) {
      goto('/login');
      return;
    }

    if ($auth.user && $auth.user.role !== 'customer') {
      goto('/login');
    }
  });

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
    { label: 'Shop', href: '/page-customer/shop', icon: 'shopping-bag' },
    { label: 'Cart', href: '/page-customer/cart', icon: 'shopping-cart' },
    { label: 'Profile', href: '/page-customer/profile', icon: 'user' },
    { label: 'My Purchases', href: '/page-customer/profile/my-purchases', icon: 'receipt' }
  ];

  // Profile menu state
  let showProfileMenu = false;
  let profileMenuRef: HTMLDivElement | null = null;

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
      if (currentPath.includes('/page-customer/shop')) {
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
        if (currentPath.includes('/page-customer/shop')) {
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
        if (currentPath.includes('/page-customer/shop')) {
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

<div class="min-h-screen bg-[#F5ECD5] flex">
  <!-- Sidebar Navigation -->
  <aside class="w-64 bg-white shadow-md hidden md:block">
    <div class="h-full flex flex-col">
      <!-- Logo -->
      <div class="p-4 border-b">
        <a href="/page-customer/shop" class="flex items-center">
          <h1 class="text-xl font-bold text-gray-800">
            Quick<span class="text-yellow-500">Shopping</span>
          </h1>
        </a>
      </div>
      
      <!-- User Profile Section -->
      <div class="p-4 border-b flex items-center space-x-3">
        <div class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
          <svg class="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div>
          <p class="font-medium text-gray-800">{$auth.user ? $auth.user.name : 'Guest'}</p>
          <p class="text-xs text-gray-500">{$auth.user ? $auth.user.email : ''}</p>
        </div>
      </div>
      
      <!-- Navigation Links -->
      <nav class="flex-1 p-4 space-y-2">
        {#each navItems as item}
          <a 
            href={item.href} 
            class="flex items-center space-x-3 p-3 rounded-lg transition-colors {isActive(item.href) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}"
          >
            <span class="w-6 h-6">
              {#if item.icon === 'shopping-bag'}
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              {:else if item.icon === 'shopping-cart'}
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              {:else if item.icon === 'user'}
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              {:else if item.icon === 'receipt'}
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              {/if}
            </span>
            <span>{item.label}</span>
            
            {#if item.icon === 'shopping-cart'}
              <span class="ml-auto bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {$cart.items.reduce((count: number, cartItem: any) => count + cartItem.quantity, 0)}
              </span>
            {/if}
          </a>
        {/each}
      </nav>
      
      <!-- Logout Button -->
      <div class="p-4 border-t">
        <button 
          onclick={logout}
          class="w-full flex items-center justify-center space-x-2 p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  </aside>

  <!-- Mobile Header and Content -->
  <div class="flex-1 flex flex-col">
    <!-- Mobile Header -->
    <header class="bg-white shadow-sm p-4 flex items-center justify-between md:hidden">
      <!-- Mobile Menu Button -->
      <button class="text-gray-600" aria-label="Toggle mobile menu">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      <!-- Logo -->
      <a href="/page-customer/shop" class="flex items-center">
        <h1 class="text-lg font-bold text-gray-800">
          Quick<span class="text-yellow-500">Shopping</span>
        </h1>
      </a>
      
      <!-- Cart Icon -->
      <div class="relative">
        <CartIndicator />
      </div>
    </header>
    
    <!-- Search Bar -->
    <div class="bg-white p-4 border-b">
      <form onsubmit={handleSearch} class="w-full">
        <div class="relative flex items-center bg-gray-100 rounded-lg">
          <input
            bind:value={searchQuery}
            oninput={handleSearchInput}
            placeholder="Search products..."
            class="block w-full pl-4 pr-10 py-2 bg-transparent border-none rounded-lg focus:outline-none focus:ring-0 text-sm"
          />
          <button 
            type="submit" 
            class="absolute right-0 p-2 rounded-full focus:outline-none"
            aria-label="Search"
          >
            <svg class="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </form>
    </div>
    
    <!-- Main Content -->
    <main class="flex-1 p-4 bg-[#F5ECD5] overflow-auto">
      <div class="max-w-7xl mx-auto">
        <slot />
      </div>
    </main>
  </div>

  <!-- Logout Alert -->
  <Alerts 
    isVisible={showLogoutAlert}
    type="logout-confirm"
    on:close={closeLogoutAlert}
    on:confirmLogout={handleConfirmLogout}
  />
</div> 