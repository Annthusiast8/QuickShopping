<header>
  <div class="header-container">
    <a href="/" class="logo">QuickShopping</a>
    <div class="profile-icon">👤</div>
  </div>
</header>

<style>
  header {
    background: linear-gradient(to right, #2c3e50, #3498db);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
  }

  .header-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    font-size: 1.8rem;
    font-weight: bold;
    color: white;
    text-decoration: none;
    font-family: 'Arial', sans-serif;
    letter-spacing: 0.5px;
  }

  .profile-icon {
    font-size: 1.5rem;
    color: white;
    cursor: pointer;
  }
</style>