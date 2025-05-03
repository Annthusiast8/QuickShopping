<script lang="ts">
    import type { PageData } from './$types';
    import Header from '../../lib/header.svelte';

    let { data }: { data: PageData } = $props();
    
    // Dummy product data
    let products = [
        {
            id: 1,
            name: 'Prada Value X1 Sunglasses',
            price: 1199,
            category: 'Electronics',
            image: '/shades.png',
            isNew: true,
            rating: 4
        },
        {
            id: 2,
            name: 'Creed Aventus Noir Parfum',
            price: 299,
            category: 'Beauty & Health',
            image: '/creed.png',
            rating: 5,
            isNew: false
        },
        {
            id: 3,
            name: 'Benefitlex Peach Makes Perfect Lip Tint',
            price: 89,
            category: 'Beauty & Health',
            image: '/bnb.png',
            isNew: true,
            rating: 3
        },
        {
            id: 4,
            name: 'Gaming Keyboard RGB',
            price: 199,
            category: 'Gaming',
            image: '/wallpaperflare.com_wallpaper (1).jpg',
            rating: 4,
            isNew: false
        },
        {
            id: 5,
            name: 'Smart Home Speaker',
            price: 149,
            category: 'Home & Kitchen',
            image: '/briar-lol-game-4k-wallpaper-uhdpaper.com-899@1@l.jpg',
            rating: 4,
            isNew: true
        },
        {
            id: 6,
            name: 'Yoga Mat Pro',
            price: 49,
            category: 'Sports & Travel',
            image: '/briar-lol-game-4k-wallpaper-uhdpaper.com-899@1@l.jpg',
            rating: 5,
            isNew: false
        }
    ];

    // Categories
    const categories = [
        'Electronics',
        'Gaming',
        'Home & Kitchen',
        'Beauty & Health',
        'Sports & Travel'
    ];

    // Filter states
    let selectedCategory = '';
    let sortBy = 'default';
    let showNewArrivals = false;
    let filteredProducts = products;

    function updateFilteredProducts() {
        filteredProducts = products.filter(product => {
            const matchesCategory = !selectedCategory || product.category === selectedCategory;
            const matchesNewArrival = !showNewArrivals || product.isNew;
            return matchesCategory && matchesNewArrival;
        }).sort((a, b) => {
            if (sortBy === 'price-low-high') return a.price - b.price;
            if (sortBy === 'price-high-low') return b.price - a.price;
            if (sortBy === 'rating') return b.rating - a.rating;
            return 0;
        });
    }

    $effect(() => {
        updateFilteredProducts();
    });
</script>

<Header />

<div class="dashboard-bg">
  <div class="dashboard-container">
    <div class="sidebar-filters">
        <div class="categories">
            <h3>CATEGORIES</h3>
            <div class="category-list">
                <label>
                    <input type="radio" bind:group={selectedCategory} value="" />
                    All Categories
                </label>
                {#each categories as category}
                    <label>
                        <input type="radio" bind:group={selectedCategory} value={category} />
                        {category}
                    </label>
                {/each}
            </div>
        </div>

        <div class="sort-by">
            <h3>SORT BY</h3>
            <label>
                <input type="checkbox" bind:checked={showNewArrivals} />
                New Arrival
            </label>
            <select bind:value={sortBy}>
                <option value="default">Best Sellers</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
            </select>
        </div>
    </div>

    <div class="main-content">
        <div class="product-grid">
            {#each filteredProducts as product}
                <div class="product-card">
                    <div class="product-image">
                        <img src={product.image} alt={product.name} />
                        {#if product.isNew}
                            <span class="new-badge">NEW ARRIVAL</span>
                        {/if}
                    </div>
                    <div class="product-info">
                        <div class="product-name">{product.name}</div>
                        <div class="product-price">${product.price}</div>
                        {#if product.rating}
                            <div class="rating">
                                {'★'.repeat(product.rating)}{'☆'.repeat(5-product.rating)}
                            </div>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    </div>
  </div>
</div>

<style>
.dashboard-bg {
    min-height: 100vh;
    background: #faf1dd;
    padding: 0;
}

.dashboard-container {
    display: flex;
    gap: 32px;
    padding: 40px 20px 20px 20px;
    max-width: 100vw;
    margin-top: 60px;
}

.sidebar-filters {
    width: 270px;
    background: #fff;
    padding: 28px 20px 24px 20px;
    border-radius: 14px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.07);
    display: flex;
    flex-direction: column;
    gap: 32px;
    align-items: flex-start;
}

.categories h3, .sort-by h3 {
    font-size: 15px;
    color: #222;
    margin-bottom: 18px;
    font-weight: 700;
    letter-spacing: 0.5px;
}

.category-list {
    display: flex;
    flex-direction: column;
    gap: 13px;
}

.category-list label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    color: #444;
    cursor: pointer;
    font-weight: 500;
}

.sort-by {
    width: 100%;
}

.sort-by label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    color: #444;
    margin-bottom: 12px;
    cursor: pointer;
}

.sort-by select {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    font-size: 15px;
    margin-top: 8px;
    background: #fafafa;
}

.main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 24px;
}

.product-card {
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    display: flex;
    flex-direction: column;
    transition: box-shadow 0.2s, transform 0.2s;
    min-height: 370px;
}

.product-card:hover {
    box-shadow: 0 6px 18px rgba(44, 62, 80, 0.13);
    transform: translateY(-2px) scale(1.01);
}

.product-image {
    width: 100%;
    height: 210px;
    background: #fff;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    position: relative;
    padding: 0;
    border-bottom: 1.5px solid #f0e9d2;
    box-sizing: border-box;
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    margin: 0;
    background: none;
    border-radius: 0;
    box-shadow: none;
    padding: 0;
}

.new-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    background: #ff4757;
    color: white;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.5px;
    box-shadow: 0 1px 4px rgba(255,71,87,0.13);
}

.product-info {
    padding: 18px 18px 14px 18px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    flex: 1;
    justify-content: flex-end;
}

.product-name {
    font-size: 16px;
    font-weight: 700;
    color: #222;
    margin-bottom: 2px;
    line-height: 1.2;
}

.product-price {
    font-size: 15px;
    font-weight: 600;
    color: #2b4b66;
    margin-bottom: 2px;
}

.rating {
    color: #ffd700;
    font-size: 15px;
    margin-top: 2px;
    letter-spacing: 1px;
}
</style>