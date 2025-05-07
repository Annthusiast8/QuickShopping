<script lang="ts">
    // --- DUMMY DATA SECTION: Replace with backend integration when available ---
    import type { PageData } from './$types';
    import Header from '$lib/header.svelte';

    let { data }: { data: PageData } = $props();

    // Dummy product data (Replace this with data fetched from backend API)
    const products = [
        {
            id: 1,
            name: 'Prado Veloce X1 Sunglasses',
            price: '$1,250',
            image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
            rating: 5
        },
        {
            id: 2,
            name: 'Prado Veloce X1 Sunglasses',
            price: '$1,250',
            image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
            rating: 5
        },
        {
            id: 3,
            name: 'Prado Veloce X1 Sunglasses',
            price: '$1,250',
            image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
            rating: 5
        },
        {
            id: 4,
            name: 'Prado Veloce X1 Sunglasses',
            price: '$1,250',
            image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
            rating: 5
        }
    ];

    // Modal state
    let showModal = $state(false);

    // Dummy modal data (Replace this with selected product data from backend)
    let modalProduct = $state({
        image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        variations: [
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80'
        ],
        name: 'HydroLux Stealth Tumbler',
        price: '$650',
        detail: 'A stealth tumbler.',
        categories: ['Drinkware', 'Sports and Fitness'],
        colors: ['Aurora', 'Cylinder', 'Pink'],
        sizes: ['22oz', '34oz', '40oz'],
        stock: 500
    });
    // --- END DUMMY DATA SECTION ---

    // The following functions are for demo only and should be replaced with real logic
    function handleAdd() {
        alert('Product added! (Demo only)');
        showModal = false;
    }
    function removeTag(type: 'categories'|'colors'|'sizes', idx: number) {
        modalProduct[type].splice(idx, 1);
        // Force update
        modalProduct = { ...modalProduct };
    }
    function addTag(type: 'categories'|'colors'|'sizes') {
        const val = prompt('Enter new ' + type.slice(0, -1));
        if (val) {
            modalProduct[type].push(val);
            modalProduct = { ...modalProduct };
        }
    }
    function addImage() {
        alert('Image upload not implemented (Demo only)');
    }
    function addVariation() {
        alert('Add variation not implemented (Demo only)');
    }
</script>

<Header />

<div class="page-container">
    <div class="product-grid">
        <div class="product-card create-card" on:click={() => showModal = true}>
            <div class="plus">+</div>
            <div class="create-label">Create new Product</div>
        </div>
        {#each products as product}
            <div class="product-card">
                <img class="product-image" src={product.image} alt={product.name} />
                <div class="product-info">
                    <div class="product-name">{product.name}</div>
                    <div class="product-price">{product.price}</div>
                    <div class="product-rating">
                        {#each Array(product.rating) as _, i}
                            <span class="star">★</span>
                        {/each}
                    </div>
                </div>
                <div class="product-actions">
                    <span class="icon edit">✎</span>
                    <span class="icon delete">🗑️</span>
                </div>
            </div>
        {/each}
    </div>
</div>

{#if showModal}
<div class="modal-overlay">
    <div class="modal-box">
        <div class="modal-header">
            <span class="modal-title">NEW PRODUCT</span>
            <img src="/X.png" alt="Close" class="modal-close" on:click={() => showModal = false} />
        </div>
        <div class="modal-content">
            <div class="modal-left">
                <div class="modal-image-wrap">
                    <img class="modal-image" src={modalProduct.image} alt="Product" />
                    <span class="modal-image-add" on:click={addImage}>+</span>
                </div>
                <div class="modal-variation">
                    {#each modalProduct.variations as v}
                        <img class="variation-thumb" src={v} alt="Variation" />
                    {/each}
                    <span class="variation-add" on:click={addVariation}>+</span>
                </div>
                <div class="modal-field-label">Product Name</div>
                <input class="modal-input" value={modalProduct.name} readonly />
                <div class="modal-field-label">Price</div>
                <input class="modal-input" value={modalProduct.price} readonly />
            </div>
            <div class="modal-right">
                <div class="modal-field-label">Detail</div>
                <textarea class="modal-textarea" readonly>{modalProduct.detail}</textarea>
                <div class="modal-field-label">Category <span class="edit-icon" on:click={() => addTag('categories')}>✎</span></div>
                <div class="modal-tags">
                    {#each modalProduct.categories as cat, i}
                        <span class="modal-tag">{cat} <span class="tag-x" on:click={() => removeTag('categories', i)}>×</span></span>
                    {/each}
                </div>
                <div class="modal-field-label">Color <span class="edit-icon" on:click={() => addTag('colors')}>+</span></div>
                <div class="modal-tags">
                    {#each modalProduct.colors as color, i}
                        <span class="modal-tag">{color} <span class="tag-x" on:click={() => removeTag('colors', i)}>×</span></span>
                    {/each}
                </div>
                <div class="modal-field-label">Sizes <span class="edit-icon" on:click={() => addTag('sizes')}>+</span></div>
                <div class="modal-tags">
                    {#each modalProduct.sizes as size, i}
                        <span class="modal-tag">{size} <span class="tag-x" on:click={() => removeTag('sizes', i)}>×</span></span>
                    {/each}
                </div>
                <div class="modal-field-label">Stock</div>
                <input class="modal-input" value={modalProduct.stock} readonly />
                <button class="modal-add-btn" on:click={handleAdd}>ADD</button>
            </div>
        </div>
    </div>
</div>
{/if}

<style>
    .page-container {
        display: flex;
        margin-left: 200px;
        margin-top: 60px;
        background: #f6ecd3;
        min-height: calc(100vh - 60px);
    }
    .product-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: .5rem;
        padding: 2rem;
        flex: 1;
        align-content: flex-start;
        width: 73%;
    }
    .product-card {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.07);
        padding: 1rem;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        min-height: 270px;
        position: relative;
        transition: box-shadow 0.2s;
        width: 73%;

    }
    .product-card:hover {
        box-shadow: 0 4px 16px rgba(0,0,0,0.13);
    }
    .create-card {
        justify-content: center;
        align-items: center;
        cursor: pointer;
        border: 2px dashed #cfc6b0;
        color: #b2a07a;
        min-height: 270px;
    }
    .plus {
        font-size: 2.5rem;
        font-weight: 400;
        margin-bottom: 0.5rem;
    }
    .create-label {
        font-size: 1.1rem;
        font-weight: 500;
    }
    .product-image {
        width: 100%;
        height: 32vh;
        object-fit: cover;
        border-radius: 6px;
        margin-bottom: 0.7rem;
    }
    .product-info {
        width: 100%;
        margin-bottom: 0.5rem;
    }
    .product-name {
        font-size: 1rem;
        font-weight: 600;
        color: #222;
        margin-bottom: 0.2rem;
    }
    .product-price {
        font-size: 0.98rem;
        color: #7a6d53;
        margin-bottom: 0.2rem;
    }
    .product-rating {
        color: #f5c518;
        font-size: 1rem;
    }
    .product-actions {
        position: absolute;
        bottom: 1rem;
        right: 1rem;
        display: flex;
        gap: 0.7rem;
    }
    .icon {
        font-size: 1.15rem;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.2s;
    }
    .icon:hover {
        opacity: 1;
    }
    @media (max-width: 900px) {
        .page-container {
            flex-direction: column;
            margin-left: 0;
        }
        .product-grid {
            padding: 1rem;
        }
    }
    .modal-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.18);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .modal-box {
        background: #fdf7ec;
        border-radius: 22px;
        box-shadow: 0 4px 32px rgba(0,0,0,0.18);
        padding: 1.5rem 2rem 2rem 2rem;
        min-width: 320px;
        max-width: 900px;
        width: 90vw;
        min-height: 420px;
        position: relative;
        border: 3px solid #e2dbc7;
        display: flex;
        flex-direction: column;
        gap: 1.2rem;
    }
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    .modal-title {
        font-size: 1.4rem;
        font-weight: 700;
        color: #4a463b;
        letter-spacing: 1px;
    }
    .modal-close {
        width: 28px;
        height: 28px;
        cursor: pointer;
        transition: filter 0.2s;
    }
    .modal-close:hover {
        filter: brightness(0.7);
    }
    .modal-content {
        display: flex;
        gap: 2rem;
    }
    .modal-left {
        flex: 1.1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.1rem;
    }
    .modal-image-wrap {
        position: relative;
        width: 180px;
        height: 220px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .modal-image {
        width: 140px;
        height: 180px;
        object-fit: contain;
    }
    .modal-image-add {
        position: absolute;
        top: 8px;
        left: 8px;
        background: #fff;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        color: #b2a07a;
        border: 1.5px solid #e2dbc7;
        cursor: pointer;
    }
    .modal-variation {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .variation-thumb {
        width: 38px;
        height: 38px;
        border-radius: 7px;
        object-fit: cover;
        background: #fff;
        box-shadow: 0 1px 4px rgba(0,0,0,0.07);
        border: 1.5px solid #e2dbc7;
    }
    .variation-add {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #fff;
        border: 1.5px dashed #b2a07a;
        color: #b2a07a;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        cursor: pointer;
    }
    .modal-field-label {
        font-size: 1rem;
        font-weight: 500;
        color: #7a6d53;
        margin-bottom: 0.2rem;
        margin-top: 0.7rem;
    }
    .modal-input {
        width: 100%;
        padding: 0.6rem 1rem;
        border-radius: 18px;
        border: 1.5px solid #e2dbc7;
        background: #f8f5ee;
        font-size: 1rem;
        margin-bottom: 0.5rem;
        color: #4a463b;
    }
    .modal-textarea {
        width: 100%;
        min-height: 60px;
        border-radius: 14px;
        border: 1.5px solid #e2dbc7;
        background: #f8f5ee;
        font-size: 1rem;
        padding: 0.7rem 1rem;
        color: #4a463b;
        margin-bottom: 0.7rem;
        resize: none;
    }
    .modal-right {
        flex: 1.3;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    .modal-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }
    .modal-tag {
        background: #f3ead2;
        color: #7a6d53;
        border-radius: 16px;
        padding: 0.3rem 0.9rem 0.3rem 0.9rem;
        font-size: 0.97rem;
        display: flex;
        align-items: center;
        gap: 0.3rem;
    }
    .tag-x {
        font-size: 1.1rem;
        color: #b2a07a;
        cursor: pointer;
        margin-left: 0.2rem;
    }
    .edit-icon {
        font-size: 1rem;
        color: #b2a07a;
        margin-left: 0.3rem;
        cursor: pointer;
    }
    .modal-add-btn {
        margin-top: 1.2rem;
        width: 100%;
        height: 48px;
        background: #4a6d96;
        color: #fff;
        border: none;
        border-radius: 24px;
        font-size: 1.15rem;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(74,109,150,0.13);
        transition: background 0.2s;
    }
    .modal-add-btn:hover {
        background: #39567a;
    }
    @media (max-width: 1100px) {
        .modal-box {
            max-width: 98vw;
            padding: 1rem 0.5rem;
        }
        .modal-content {
            gap: 1rem;
        }
    }
    @media (max-width: 900px) {
        .modal-content {
            flex-direction: column;
            gap: 1.2rem;
        }
        .modal-left, .modal-right {
            width: 100%;
            align-items: stretch;
        }
        .modal-image-wrap {
            width: 120px;
            height: 140px;
        }
        .modal-image {
            width: 90px;
            height: 110px;
        }
        .modal-add-btn {
            height: 40px;
            font-size: 1rem;
        }
    }
    @media (max-width: 600px) {
        .modal-box {
            min-width: unset;
            width: 99vw;
            padding: 0.5rem 0.2rem;
        }
        .modal-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }
        .modal-title {
            font-size: 1.1rem;
        }
        .modal-content {
            flex-direction: column;
            gap: 0.7rem;
        }
        .modal-left, .modal-right {
            width: 100%;
            align-items: stretch;
        }
        .modal-image-wrap {
            width: 80px;
            height: 90px;
        }
        .modal-image {
            width: 60px;
            height: 70px;
        }
        .modal-add-btn {
            height: 36px;
            font-size: 0.95rem;
        }
        .modal-field-label, .modal-tag {
            font-size: 0.92rem;
        }
        .modal-input, .modal-textarea {
            font-size: 0.95rem;
            padding: 0.5rem 0.7rem;
        }
        .variation-thumb {
            width: 28px;
            height: 28px;
        }
    }
</style>