<script lang="ts">
    import axios from "axios";
    import { onMount } from "svelte";
    import Header from '$lib/header.svelte';
    import Sidebar from '$lib/Sidebar.svelte';
    let data : any = ""

    onMount(()=>{
        axios.get('http://127.0.0.1:8000/api/items/')
        .then((res: any)=>{
            data = res.data
            console.log(data[0].name)
        }).catch((err:any)=>{

        })
    })

	let name: string = 'world';

	function greet(name: string) {
		alert(`Hello, ${name}!`);
	}

  let orders = [
    {
      storeName: 'Prada Official Store',
      status: 'To Ship',
      productImg: '/sunglasses.jpg',
      productTitle: 'Prada Veloce X1 Sunglasses',
      variation: 'Black',
      qty: 1,
      price: 1250,
      orderTotal: 1250
    },
    {
      storeName: 'Gucci Flagship',
      status: 'Pending',
      productImg: '/gucci-bag.jpg',
      productTitle: 'Gucci Marmont Bag',
      variation: 'Red',
      qty: 2,
      price: 980,
      orderTotal: 1960
    },
    {
      storeName: 'Nike Store',
      status: 'Completed',
      productImg: '/nike-shoes.jpg',
      productTitle: 'Nike Air Max',
      variation: 'White',
      qty: 1,
      price: 150,
      orderTotal: 150
    },
    {
      storeName: 'Adidas Shop',
      status: 'To Receive',
      productImg: '/adidas-shoes.jpg',
      productTitle: 'Adidas Ultraboost',
      variation: 'Black',
      qty: 1,
      price: 180,
      orderTotal: 180
    }
  ];

  const tabs = [
    { label: 'All', value: 'All' },
    { label: 'Pending', value: 'Pending' },
    { label: 'To Ship', value: 'To Ship' },
    { label: 'To Receive', value: 'To Receive' },
    { label: 'Completed', value: 'Completed' }
  ];

  let selectedTab = 'All';

  $: filteredOrders = selectedTab === 'All' ? orders : orders.filter(order => order.status === selectedTab);
</script>

<Header />
<div class="main-layout">
  <Sidebar />
  <div class="content-area">
    <div class="tabs">
      {#each tabs as tab}
        <div
          class="tab {selectedTab === tab.value ? 'active' : ''}"
          on:click={() => selectedTab = tab.value}
        >
          {tab.label}
        </div>
      {/each}
    </div>
    <div class="search-bar">
      <input type="text" placeholder="You can search by Seller or Product name" />
      <span class="search-icon">🔍</span>
    </div>
    <div class="orders-list">
      {#each filteredOrders as order}
      <div class="order-card">
        <div class="order-header">
          <span class="store-name">{order.storeName}</span>
          <span class="order-status">{order.status}</span>
        </div>
        <div class="order-body">
          <img class="product-img" src={order.productImg} alt={order.productTitle} />
          <div class="product-info">
            <div class="product-title">{order.productTitle}</div>
            <div class="product-variation">Variation: {order.variation}</div>
            <div class="product-qty">x{order.qty}</div>
          </div>
          <div class="product-price">${order.price.toLocaleString()}</div>
        </div>
        <div class="order-footer">
          <span>Order Total: <span class="order-total">${order.orderTotal.toLocaleString()}</span></span>
        </div>
      </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .main-layout {
    display: flex;
    margin-top: 60px;
    background: #f6f1e4;
    min-height: calc(100vh - 60px);
  }
  .content-area {
    flex: 1;
    padding: 2rem 2.5rem 2rem 2.5rem;
    margin-left: 200px;
    background: #f6f1e4;
    min-height: 100vh;
  }
  .tabs {
    display: flex;
    gap: 2.5rem;
    border-bottom: 2px solid #e6e6e6;
    margin-bottom: 1.2rem;
    font-size: 1.05rem;
    font-weight: 500;
  }
  .tab {
    padding: 0.5rem 0;
    cursor: pointer;
    color: #888;
    border-bottom: 2px solid transparent;
    transition: color 0.2s, border 0.2s;
  }
  .tab.active {
    color: #2b4b66;
    border-bottom: 2px solid #2b4b66;
    font-weight: 600;
  }
  .search-bar {
    display: flex;
    align-items: center;
    background: #f6f1e4;
    border-radius: 18px;
    border: 1.5px solid #e6e6e6;
    padding: 0.5rem 1.2rem;
    margin: 1.2rem 0 2rem 0;
    width: 100%;
    max-width: 600px;
  }
  .search-bar input {
    border: none;
    outline: none;
    background: transparent;
    flex: 1;
    font-size: 1rem;
    color: #444;
  }
  .search-icon {
    font-size: 1.2rem;
    color: #bbb;
    margin-left: 0.5rem;
  }
  .orders-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .order-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    padding: 1.2rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.05rem;
    font-weight: 600;
    color: #222;
  }
  .order-status {
    color: #2b4b66;
    font-weight: 600;
    font-size: 1rem;
  }
  .order-body {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    margin-top: 0.5rem;
  }
  .product-img {
    width: 70px;
    height: 50px;
    object-fit: contain;
    border-radius: 6px;
    border: 1px solid #eee;
  }
  .product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }
  .product-title {
    font-weight: 600;
    color: #222;
    font-size: 1rem;
  }
  .product-variation, .product-qty {
    color: #888;
    font-size: 0.95rem;
  }
  .product-price {
    font-weight: 600;
    color: #2b4b66;
    font-size: 1.1rem;
    margin-left: 1.5rem;
  }
  .order-footer {
    text-align: right;
    font-size: 1.1rem;
    color: #222;
    font-weight: 500;
  }
  .order-total {
    color: #2b4b66;
    font-size: 1.25rem;
    font-weight: 700;
    margin-left: 0.2rem;
  }
  @media (max-width: 700px) {
    .main-layout {
      flex-direction: column;
      margin-top: 0;
    }
    .content-area {
      margin-left: 0;
      padding: 1rem 0.5rem;
    }
    .tabs {
      gap: 1rem;
      font-size: 0.95rem;
      flex-wrap: wrap;
    }
    .order-card {
      padding: 0.7rem 0.5rem;
    }
    .product-img {
      width: 50px;
      height: 36px;
    }
  }
</style>
