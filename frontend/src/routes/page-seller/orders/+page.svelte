<script lang="ts">
  import Header from '$lib/header.svelte';

  // Dummy orders data
  const orders = [
    {
      id: '202210023',
      date: 'Feb. 14, 2025',
      name: 'Alyssa Mae P.',
      product: 'Hydrolux Stealth Tumbler',
      qty: 3,
      status: 'DELIVERED',
      price: 1999,
      img: '/briar-lol-game-4k-wallpaper-uhdpaper.com-899@1@l.jpg',
    },
    {
      id: '202210024',
      date: 'Feb. 15, 2025',
      name: 'Alyssa Mae P.',
      product: 'Barenbliss Peach Makes Perfect Lip Tint',
      qty: 2,
      status: 'IN TRANSIT',
      price: 1720,
      img: '/briar-lol-game-4k-wallpaper-uhdpaper.com-899@1@l.jpg',
    },
    {
      id: '202210025',
      date: 'Feb. 17, 2025',
      name: 'Alyssa Mae P.',
      product: 'Prada Veloce X1 Sunglasses',
      qty: 1,
      status: 'PENDING',
      price: 1250,
      img: '/briar-lol-game-4k-wallpaper-uhdpaper.com-899@1@l.jpg',
    },
  ];

  // Sorting (dummy, not functional)
  const sortOptions = [
    'Best Sellers',
    'Price: Low to High',
    'New Arrivals',
  ];
</script>

<Header />

<div class="orders-page-container">
  <aside class="orders-sidebar">
    <nav class="sidebar-nav">
      <ul>
        <li><a href="/page-seller/profile">Your Profile</a></li>
        <li><a href="/page-seller/create-prod">Your Products</a></li>
        <li class="active"><a href="/page-seller/orders">All Orders</a></li>
        <li><a href="#">Your Coupons</a></li>
        <li><a href="#">Category List</a></li>
      </ul>
    </nav>
    <div class="sort-section">
      <span class="sort-title">SORT BY</span>
      <ul class="sort-list">
        {#each sortOptions as opt}
          <li>{opt}</li>
        {/each}
      </ul>
    </div>
    <button class="logout-btn">Log Out</button>
  </aside>

  <main class="orders-main">
    <h2 class="orders-title">All Orders</h2>
    <div class="orders-list">
      {#each orders as order}
        <div class="order-card">
          <img class="order-avatar" src={order.img} alt="Profile" />
          <div class="order-info">
            <div class="order-header">
              <span class="order-name">{order.name}</span>
              <span class="order-id">ID: {order.id}</span>
              <span class="order-date">| {order.date}</span>
            </div>
            <div class="order-product">
              Order: {order.product} <span class="order-qty">x{order.qty}</span>
            </div>
          </div>
          <div class="order-status-price">
            <span class="order-status {order.status.toLowerCase().replace(' ', '-')}">{order.status}</span>
            <span class="order-price">₱{order.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      {/each}
    </div>
  </main>
</div>

<style>
.orders-page-container {
  display: flex;
  background: #f7f3e7;
  min-height: 100vh;
  padding-top: 60px;
}
.orders-sidebar {
  width: 260px;
  background: #f7f3e7;
  padding: 2rem 1.5rem 1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-height: calc(100vh - 60px);
  border-right: 1px solid #e6ecf2;
}
.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
}
.sidebar-nav li {
  margin-bottom: 1.2rem;
}
.sidebar-nav a {
  color: #222;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  transition: color 0.2s;
}
.sidebar-nav .active a {
  color: #2b4b66;
  font-weight: 700;
}
.sort-section {
  margin-bottom: 2rem;
}
.sort-title {
  font-size: 0.9rem;
  color: #888;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
}
.sort-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.sort-list li {
  font-size: 0.95rem;
  color: #444;
  margin-bottom: 0.3rem;
}
.logout-btn {
  margin-top: auto;
  background: #e6ecf2;
  color: #2b4b66;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 0;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.logout-btn:hover {
  background: #d1e3f0;
}
.orders-main {
  flex: 1;
  padding: 2.5rem 2rem 2rem 2rem;
}
.orders-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #2b4b66;
}
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.order-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(44, 62, 80, 0.06);
  padding: 1.5rem 2rem;
  gap: 1.5rem;
  position: relative;
}
.order-avatar {
  width: 60px;
  height: 90px;
  border-radius: 50% / 55%; /* 90-degree oval */
  object-fit: cover;
  border: 3px solid #e6ecf2;
}
.order-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.order-header {
  font-size: 1.1rem;
  font-weight: 600;
  color: #222;
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.order-id, .order-date {
  font-size: 0.95rem;
  color: #888;
  font-weight: 400;
}
.order-product {
  font-size: 1rem;
  color: #444;
}
.order-qty {
  color: #aaa;
  font-size: 0.95rem;
  margin-left: 0.3rem;
}
.order-status-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.7rem;
  min-width: 120px;
}
.order-status {
  padding: 0.3rem 1.1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  display: inline-block;
  text-align: center;
}
.order-status.delivered {
  background: #00e6b0;
  color: #fff;
}
.order-status.in-transit {
  background: #d6f542;
  color: #2b4b66;
}
.order-status.pending {
  background: #bdbdbd;
  color: #fff;
}
.order-price {
  font-size: 1.3rem;
  font-weight: 700;
  color: #222;
}
@media (max-width: 900px) {
  .orders-page-container {
    flex-direction: column;
  }
  .orders-sidebar {
    width: 100%;
    flex-direction: row;
    border-right: none;
    border-bottom: 1px solid #e6ecf2;
    padding: 1rem;
    min-height: unset;
  }
  .orders-main {
    padding: 1rem;
  }
}
</style>
