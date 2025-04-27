<script>
  import { page } from '$app/stores';
  
  const menuItems = [
    { name: 'Dashboard', icon: '/Dashboard%20Layout.png', href: '/Admin_page' },
    { name: 'Manage Users', icon: '/Users.png', href: '/Admin_page/users' },
    { name: 'Business', icon: '/Business.png', href: '/Admin_page/business' },
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
    width: 220px;
    height: 100vh;
    background: #fffaec;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 0;
    position: fixed;
    left: 0;
    top: 0;
    box-shadow: 2px 0 8px rgba(0,0,0,0.04);
  }
  nav {
    width: 100%;
    margin-top: 40px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }
  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 90%;
    padding: 12px 0 12px 16px;
    color: #222;
    text-decoration: none;
    font-size: 16px;
    font-weight: 500;
    border-radius: 8px;
    background: none;
    transition: background 0.2s, color 0.2s;
    justify-content: flex-start;
  }
  .nav-item.active, .nav-item:focus {
    background: #e6ecf2;
    color: #2b4b66;
  }
  .icon {
    width: 26px;
    height: 26px;
    flex-shrink: 0;
    object-fit: contain;
  }
  .logout {
    margin-top: auto;
    margin-bottom: 32px;
    align-self: center;
    width: 85%;
    height: 40px;
    background: #ed3324;
    color: #fff;
    border: none;
    border-radius: 20px;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .logout:hover {
    background: #c82333;
  }
</style>