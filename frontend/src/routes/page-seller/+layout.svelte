<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { seller } from '$lib/stores/seller';
  import Alerts from '$lib/components/Alerts.svelte';
  
  // Use Svelte stores for reactivity
  export const sidebarOpen = writable(false);
  export const isMobile = writable(false);

  // Alert state
  let showAlert = false;
  let alertType: 'success' | 'error' | 'logout-confirm' = 'success';
  let alertMessage = '';
  let confirmLogout = false;

  // Define all possible menu items
  const allMenuItems = [
    { name: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', href: '/page-seller/profile', requiresApproval: false },
    { name: 'Products', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', href: '/page-seller/create-prod', requiresApproval: true },
    { name: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', href: '/page-seller/orders', requiresApproval: true }
  ];
  
  // Reactive store for menu items based on approval status
  $: sellerMenuItems = $seller.profile?.is_approved 
    ? allMenuItems 
    : allMenuItems.filter(item => !item.requiresApproval);

  // Loading state
  let loading = false;

  function handleResize() {
    isMobile.set(window.innerWidth <= 768);
    if (window.innerWidth > 768) sidebarOpen.set(false);
  }

  // Check if user is authenticated and is a seller
  async function checkAuth() {
    if (!$auth.user) {
      goto('/login?redirect=/page-seller/profile');
      return false;
    }

    if ($auth.user.role !== 'seller') {
      showAlert = true;
      alertType = 'error';
      alertMessage = 'You do not have permission to access the seller dashboard';
      setTimeout(() => {
        goto('/');
      }, 2000);
      return false;
    }

    return true;
  }

  // Load seller profile
  async function loadSellerProfile() {
    loading = true;
    try {
      await seller.loadProfile();
    } catch (error) {
      console.error('Failed to load seller profile:', error);
    } finally {
      loading = false;
    }
  }

  // Handle logout
  function handleLogout() {
    confirmLogout = true;
    showAlert = true;
    alertType = 'logout-confirm';
  }

  async function confirmLogoutAction() {
    loading = true;
    try {
      await auth.logout();
      goto('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      showAlert = true;
      alertType = 'error';
      alertMessage = 'Failed to logout. Please try again.';
    } finally {
      loading = false;
      confirmLogout = false;
    }
  }

  function cancelLogout() {
    confirmLogout = false;
    showAlert = false;
  }

  onMount(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Run these async operations without returning them
    (async () => {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        await loadSellerProfile();
      }
    })();
    
    // Return the cleanup function directly
    return () => window.removeEventListener('resize', handleResize);
  });
</script>

{#if $isMobile}
  <button class="sidebar-toggle z-50" on:click={() => sidebarOpen.update(v => !v)} aria-label="Toggle sidebar">
    <svg width="28" height="28" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="#222" stroke-width="2" stroke-linecap="round"/></svg>
  </button>
{/if}

{#if $isMobile && $sidebarOpen}
  <div class="backdrop" on:click={() => sidebarOpen.set(false)}></div>
{/if}

<div class="sidebar {($isMobile ? 'mobile' : '')} {($sidebarOpen ? 'open' : '')}" tabindex="-1">
  <!-- User Profile Section -->
  <div class="profile-summary">
    <div class="profile-image">
      {#if $auth.user}
        {#if $seller.profile?.logo_url}
          <img src={$seller.profile.logo_url} alt="{$seller.profile.business_name}" />
        {:else}
          <div class="profile-placeholder">{$auth.user.name.charAt(0)}</div>
        {/if}
      {/if}
    </div>
    <div class="profile-info">
      {#if $auth.user}
        <h3 class="user-name">{$auth.user.name}</h3>
        <p class="user-email">{$auth.user.email}</p>
      {/if}
      
      {#if $seller.profile}
        <div class="business-info">
          <h4 class="business-name">{$seller.profile.business_name}</h4>
          <div class="approval-status" class:approved={$seller.profile.is_approved} class:pending={!$seller.profile.is_approved}>
            {$seller.profile.is_approved ? 'Approved' : 'Pending Approval'}
          </div>
        </div>
      {/if}
    </div>
  </div>
  
  <nav class="seller-nav">
    {#each sellerMenuItems as item}
      <a href={item.href} class="nav-item" class:active={$page.url.pathname === item.href || $page.url.pathname.startsWith(item.href + '/')}>
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon} />
        </svg>
        <span>{item.name}</span>
      </a>
    {/each}
  </nav>
  
  <button class="logout" on:click={handleLogout} disabled={loading}>
    {#if loading}
      <svg class="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    {/if}
    Logout
  </button>
</div>

<div class="content-area {($isMobile ? 'mobile' : '')}">
  <slot />
</div>

<Alerts 
  isVisible={showAlert}
  type={alertType}
  title={alertType === 'logout-confirm' ? 'Confirm Logout' : alertType === 'error' ? 'Error' : 'Success'}
  cartAdded={alertMessage}
  autoDismiss={alertType !== 'logout-confirm'}
  on:close={() => showAlert = false}
  on:confirm={confirmLogoutAction}
  on:cancel={cancelLogout}
/>

<style>
  .sidebar {
    width: 250px;
    min-height: calc(100vh - 60px);
    background: #fffaec;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 1.5rem 0 0 0;
    position: fixed;
    left: 0;
    top: 60px;
    box-shadow: 2px 0 8px rgba(0,0,0,0.04);
    overflow: hidden;
    transition: left 0.3s, box-shadow 0.3s;
    z-index: 10;
  }

  .profile-summary {
    width: 85%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid rgba(0,0,0,0.05);
  }

  .profile-image {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 1rem;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .profile-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .profile-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #2b4b66;
    color: white;
    font-size: 2rem;
    font-weight: bold;
  }

  .profile-info {
    text-align: center;
    width: 100%;
  }

  .user-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.25rem;
  }

  .user-email {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 1rem;
    word-break: break-word;
  }

  .business-info {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px dashed rgba(0,0,0,0.1);
  }

  .business-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.25rem;
  }

  .approval-status {
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    display: inline-block;
  }

  .approval-status.approved {
    background: rgba(72, 187, 120, 0.1);
    color: #38a169;
  }

  .approval-status.pending {
    background: rgba(237, 137, 54, 0.1);
    color: #dd6b20;
  }

  .seller-nav {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 85%;
    padding: 0.75rem 1rem;
    color: #666;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
    border-radius: 6px;
    background: none;
    transition: all 0.2s ease;
  }

  .nav-item:hover {
    background: rgba(230, 236, 242, 0.5);
    color: #2b4b66;
  }

  .nav-item.active {
    background: #e6ecf2;
    color: #2b4b66;
    font-weight: 600;
  }

  .icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    opacity: 0.7;
    stroke: currentColor;
  }

  .nav-item.active .icon,
  .nav-item:hover .icon {
    opacity: 1;
  }

  .logout {
    margin-top: auto;
    margin-bottom: 1.5rem;
    width: 85%;
    height: 40px;
    background: #ed3324;
    color: #fff;
    border: none;
    border-radius: 20px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(237, 51, 36, 0.2);
  }

  .logout:hover {
    background: #c82333;
  }

  .logout:disabled {
    background: #f5a199;
    cursor: not-allowed;
  }

  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 40;
    opacity: 0;
    animation: fadeIn 0.2s ease forwards;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .sidebar.mobile {
    left: -270px;
    top: 59px;
    min-height: 92vh;
    box-shadow: none;
    position: fixed;
    width: 250px;
    background: #fffaec;
    z-index: 50;
    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .sidebar.mobile.open {
    left: 0;
    box-shadow: 2px 0 8px rgba(0,0,0,0.18);
  }

  .sidebar-toggle {
    position: fixed;
    top: 8px;
    left: 8px;
    z-index: 1100;
    background: #ffffff;
    border: none;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .sidebar-toggle:hover {
    transform: scale(1.05);
  }

  .content-area {
    margin-left: 250px;
    padding: 1rem;
    min-height: calc(100vh - 60px);
    background: #f6ecd3;
  }

  .content-area.mobile {
    margin-left: 0;
  }

  @media (max-width: 768px) {
    .sidebar {
    }
    .sidebar.open {
      left: 0;
      box-shadow: 2px 0 8px rgba(0,0,0,0.18);
    }
    .sidebar-toggle {
      display: flex;
    }
  }

  @media (min-width: 769px) {
    .sidebar-toggle {
      display: none;
    }
  }
</style>
