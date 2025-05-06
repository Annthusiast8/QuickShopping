<header>
    <div class="header-container">
      <a href="/Profile" class="logo">QuickShopping</a>
      <a href="/Profile" class="profile-link">
        <div class="profile-section">
          <img src="/briar-lol-game-4k-wallpaper-uhdpaper.com-899@1@l.jpg" alt="Profile" class="profile-image">
        </div>
      </a>
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
      height: 60px;
      z-index: 1000;
    }
  
    .header-container {
      height: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  
    .logo {
      font-size: 1.5rem;
      font-weight: bold;
      color: white;
      text-decoration: none;
      font-family: 'Arial', sans-serif;
      letter-spacing: 0.5px;
    }
  
    .profile-link {
      text-decoration: none;
      display: flex;
      align-items: center;
    }
  
    .profile-section {
      display: flex;
      align-items: center;
      padding: 4px;
      border-radius: 24px;
      transition: background-color 0.2s ease;
    }
  
    .profile-section:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  
    .profile-image {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid white;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
  
    .profile-image:hover {
      transform: scale(1.05);
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    }
  </style>