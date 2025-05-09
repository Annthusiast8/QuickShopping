<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { goto } from '$app/navigation';
    
    // Create a local edit mode store
    const editMode = writable(false);
    
    let sidebarOpen = false;
    let isMobile = false;
    
    // Sidebar menu items
    const menuItems = [
      { name: 'My Profile', icon: '/profile.png', href: '/page-customer/profile' },
      { 
        name: 'My Purchases', 
        icon: 'svg',
        href: '/page-customer/profile/my-purchases',
        svg: '<svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 4h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3m0 3h6m-5-4v4h4V3h-4Z"/></svg>'
      }
    ];
  
    // Reactive statement to detect if current route is in page-customer
    $: isCustomerPage = $page.url.pathname.startsWith('/page-customer');
  
    function handleResize() {
      isMobile = window.innerWidth <= 768;
      if (!isMobile) sidebarOpen = false;
    }
  
    onMount(() => {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    });

    // Function to toggle edit mode and navigate to profile page
    function toggleEditMode() {
      $editMode = true;
      // Navigate to profile page with edit=true query param
      window.location.href = '/page-customer/profile?edit=true';
    }

    // Logout function to handle user logout
    function handleLogout() {
      // Clear any stored user data or tokens (localStorage, cookies, etc)
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      // Use goto for navigation within the SPA
      goto('/login');
    }
</script>

{#if isMobile}
  <button class="sidebar-toggle" on:click={() => sidebarOpen = !sidebarOpen} aria-label="Toggle sidebar">
    <svg width="28" height="28" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="#222" stroke-width="2" stroke-linecap="round"/></svg>
  </button>
{/if}

<div class="sidebar {isMobile ? 'mobile' : ''} {sidebarOpen ? 'open' : ''}" tabindex="-1">
  {#if isCustomerPage}
    <!-- Customer Page Layout -->
    <div class="profile-section">
      <img class="avatar" src="/briar-lol-game-4k-wallpaper-uhdpaper.com-899@1@l.jpg" alt="User Avatar" />
      <div class="username">kape_meow</div>
      <div class="edit-profile"><button on:click={toggleEditMode}>✎ Edit profile</button></div>
    </div>
    <nav class="user-nav">
      {#each menuItems as item}
        <a href={item.href} class="nav-item" class:active={$page.url.pathname === item.href}>
          {#if item.icon === 'svg'}
            {@html item.svg}
          {:else}
            <img class="icon" src={item.icon} alt={item.name} />
          {/if}
          <span>{item.name}</span>
        </a>
      {/each}
    </nav>
  {/if}
  <button class="logout" on:click={handleLogout}>Logout</button>
</div>

<style>
  .sidebar {
    width: 200px;
    min-height: calc(100vh - 60px);
    background: #fffaec;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 0;
    position: fixed;
    left: 0;
    top: 60px;
    box-shadow: 2px 0 8px rgba(0,0,0,0.04);
    overflow: hidden;
    transition: left 0.3s, box-shadow 0.3s;
    z-index: 0;
  }

  nav {
    width: 100%;
    padding-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
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
    object-fit: contain;
    opacity: 0.7;
  }

  .nav-item.active .icon,
  .nav-item:hover .icon {
    opacity: 1;
  }

  .logout {
    margin-top: auto;
    margin-bottom: 1.5rem;
    width: 85%;
    height: 36px;
    background: #ed3324;
    color: #fff;
    border: none;
    border-radius: 18px;
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

  .profile-section {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 1.5rem;
    margin-bottom: 2rem;
  }

  .avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 0.5rem;
    border: 2px solid #e6e6e6;
  }

  .username {
    font-weight: 600;
    font-size: 1.1rem;
    color: #222;
    margin-bottom: 0.1rem;
  }

  .edit-profile {
    font-size: 0.85rem;
    color: #888;
    margin-bottom: 0.5rem;
  }

  .edit-profile button {
    background: none;
    border: none;
    color: #888;
    text-decoration: none;
    transition: color 0.2s;
    cursor: pointer;
    font-size: 0.85rem;
    padding: 0;
  }

  .edit-profile button:hover {
    color: #2b4b66;
  }

  .user-nav {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .user-nav .nav-item {
    width: 85%;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #222;
    background: none;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s;
  }

  .user-nav .nav-item.active, 
  .user-nav .nav-item:active, 
  .user-nav .nav-item:focus {
    background: #b2c6d6;
    color: #fff;
  }

  .user-nav .nav-item:hover {
    background: #e6ecf2;
    color: #2b4b66;
  }

  .sidebar.mobile {
    left: -220px;
    top: 62px;
    min-height: 95vh;
    box-shadow: none;
    position: fixed;
    width: 200px;
    background: #fffaec;
  }

  .sidebar.mobile.open {
    left: 0;
    box-shadow: 2px 0 8px rgba(0,0,0,0.18);
  }

  .sidebar-toggle {
    position: fixed;
    top: 16px;
    left: 16px;
    z-index: 1100;
    background: #fff;
    border: none;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  @media (max-width: 768px) {
    .sidebar {
      left: -220px;
      top: 0;
      min-height: 100vh;
      box-shadow: none;
      position: fixed;
      width: 200px;
      background: #fffaec;
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