<script lang="ts">
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import Header from '$lib/header.svelte';

  // Check if user is logged in and is admin (COMMENT)
  /*onMount(() => {
    if (!$auth.isAuthenticated) {
      goto('/login');
      return;
    }

    if ($auth.user && $auth.user.role !== 'admin') {
      goto('/login');
    }
  });*/

  function logout() {
    auth.logout();
    goto('/login');
  }

  // Navigation items
  const navItems = [
    { name: 'Dashboard', icon: '/Dashboard%20Layout.png', href: '/page-admin/dashboard' },
    { name: 'Users', icon: '/Users.png', href: '/page-admin/users' },
    { name: 'Business', icon: '/Business.png', href: '/page-admin/orders' },
    { name: 'Reported Items', icon: '/cart.png', href: '/page-admin/products' },
  ];

  // You can keep your stats logic here
  let stats = [
    { name: 'Total Users', value: '12,457', icon: '/users.svg' },
    { name: 'Montly Orders', value: '6,095', icon: '/orders.svg' },
    { name: 'Pending Deliveries', value: '132', icon: '/delivery.svg' },
    { name: 'Total Visitors', value: '8,742', icon: '/visitors.svg' }
  ];

  let latestOrders = [
    { id: '1231', product: 'Prada Veloce X1 Sunglasses', img: '/sunglasses.png', date: '03.15.2025 - 07:12 AM', customer: 'Zhang Ruonan', total: '$1,355' },
    { id: '1232', product: 'Prada Veloce X1 Sunglasses', img: '/sunglasses.png', date: '03.10.2025 - 06:29 PM', customer: 'Wang Yibo', total: '$1,355' },
    { id: '1233', product: 'Prada Veloce X1 Sunglasses', img: '/sunglasses.png', date: '03.17.2025 - 12:38 AM', customer: 'Bai Lu', total: '$1,355' }
  ];
</script>

<Header />

<div class="flex">
  <!-- Sidebar -->
  <div
    class="fixed left-0 top-[60px] w-[200px] min-h-[calc(100vh-60px)] bg-[#fffaec] flex flex-col items-center shadow-md z-20"
  >
    <nav class="w-full pt-4 flex flex-col gap-2 items-center">
      {#each navItems as item}
        {@const isActive = $page.url.pathname === item.href}
        <a
          href={item.href}
          class="flex items-center gap-3 w-[85%] px-4 py-3 rounded-md font-medium text-[0.95rem] text-gray-600 hover:bg-[#789DBC] hover:text-[#ffffff] transition-all duration-200
            { isActive ? 'bg-[#789DBC] text-[#ffffff] font-semibold' : '' }"
        >
          <div class="w-5 h-5 flex items-center justify-center">
            <img 
              class="w-5 h-5 object-contain transition-all duration-200" 
              src={item.icon} 
              alt={item.name}
              style="filter: {isActive ? 'brightness(0) invert(1)' : 'brightness(0)'}"
            />
          </div>
          <span>{item.name}</span>
        </a>
      {/each}
    </nav>
    <button
      class="mt-auto mb-6 w-[85%] h-9 bg-[#ed3324] text-white rounded-full font-medium text-base flex items-center justify-center shadow hover:bg-[#c82333] transition-colors duration-200"
      on:click={logout}
    >
      Logout
    </button>
  </div>

  <!-- Main content -->
  <main class="flex-1 ml-[200px] mt-[60px] min-h-[calc(100vh-60px)] bg-[#f8fafc]">
    <slot />
  </main>
</div> 