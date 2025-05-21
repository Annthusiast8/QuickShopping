<script lang="ts">
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth';
  import { admin } from '$lib/stores/admin';
  import { goto } from '$app/navigation';
  import { onMount, onDestroy } from 'svelte';
  import Header from '$lib/header.svelte';

  // Check if user is logged in and is admin
  onMount(() => {
    if (!$auth.user) {
      goto('/login');
      return;
    }

    if ($auth.user.role !== 'admin') {
      goto('/login');
      return;
    }
    
    // Load admin data when component mounts
    admin.loadUsers();
    admin.loadPendingBusinesses();
    admin.loadReports();
  });
  
  // Clean up when component is destroyed
  onDestroy(() => {
    // Reset admin store when navigating away
    admin.reset();
  });

  function logout() {
    auth.logout();
    goto('/login');
  }

  // Navigation items
  const navItems = [
    { name: 'Dashboard', icon: '/Dashboard%20Layout.png', href: '/page-admin/dashboard' },
    { name: 'Users', icon: '/Users.png', href: '/page-admin/users' },
    { name: 'Business Approvals', icon: '/Business.png', href: '/page-admin/business' },
    { name: 'Reported Items', icon: '/reports.png', href: '/page-admin/reports' }
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