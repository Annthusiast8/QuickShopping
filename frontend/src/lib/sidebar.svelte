<script lang="ts">
  import { page } from '$app/stores';
  
  // Admin/Business sidebar menu items
  const adminMenuItems = [
    { name: 'Dashboard', icon: '/Dashboard%20Layout.png', href: '/page-admin' },
    { name: 'Manage Users', icon: '/Users.png', href: '/page-admin/users' },
    { name: 'Business', icon: '/Business.png', href: '/page-admin/business' },
    { name: 'Reported Items', icon: '/Group%20248.png', href: '/page-admin/reports' }
  ];

  // Create Product sidebar menu items
  const createProductMenuItems = [
    { name: 'Your Profile', icon: '/profile.png', href: '/page-customer/profile' },
    { name: 'Your Products', icon: '/market.png', href: '/page-customer/products' },
    { name: 'All Orders', icon: '/cart.png', href: '/page-customer/orders' },
    { name: 'Your Coupons', icon: '/coupon.png', href: '/page-customer/coupons' },
    { name: 'Category List', icon: '/categ.png', href: '/page-customer/categories' }
  ];

  // Reactive statement to detect if current route is in page-customer
  $: isCustomerPage = $page.url.pathname.startsWith('/page-customer');
  $: isAdminPage = $page.url.pathname.startsWith('/page-admin');
</script>

<div class="sidebar">
  {#if isCustomerPage}
    <!-- Customer Page Layout -->
    <div class="profile-section">
      <img class="avatar" src="/briar-lol-game-4k-wallpaper-uhdpaper.com-899@1@l.jpg" alt="User Avatar" />
      <div class="username">kape_meow</div>
      <div class="edit-profile"><a href="/page-customer/profile">✎ Edit profile</a></div>
    </div>
    <nav class="user-nav">
      {#each createProductMenuItems as item}
        <a href={item.href} class="nav-item" class:active={$page.url.pathname === item.href}>
          <img class="icon" src={item.icon} alt={item.name} />
          <span>{item.name}</span>
        </a>
      {/each}
    </nav>
  {:else if isAdminPage}
    <!-- Admin Page Layout -->
    <nav>
      {#each adminMenuItems as item}
        <a 
          href={item.href}
          class="nav-item"
          class:active={$page.url.pathname === item.href}
        >
          <img class="icon" src={item.icon} alt={item.name} />
          <span>{item.name}</span>
        </a>
      {/each}
    </nav>
  {/if}
  <button class="logout">Logout</button>
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

  .edit-profile a {
    color: #888;
    text-decoration: none;
    transition: color 0.2s;
  }

  .edit-profile a:hover {
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
</style>
