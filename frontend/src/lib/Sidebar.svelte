<script>
  import { page } from '$app/stores';
  
  const menuItems = [
    { name: 'Dashboard', icon: '/Dashboard%20Layout.png', href: '/Admin_page' },
    { name: 'Manage Users', icon: '/Users.png', href: '/Admin_page' },
    { name: 'Business', icon: '/Business.png', href: '/bussiness' },
    { name: 'Reported Items', icon: '/Group%20248.png', href: '/Admin_page/reports' }
  ];
</script>

<div class="sidebar">
  <nav>
    {#each menuItems as item}
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
</style>