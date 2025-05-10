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
    let showEditModal = $state(false);
    let showDeleteModal = $state(false);
    let productToDelete = $state<{
        id: number;
        name: string;
        price: string;
        image: string;
        rating: number;
    } | null>(null);

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

    let editProduct = $state({...modalProduct});
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
    function handleEdit() {
        alert('Product updated! (Demo only)');
        showEditModal = false;
    }
    function handleDelete() {
        // Here you would typically make an API call to delete the product
        alert('Product deleted! (Demo only)');
        showDeleteModal = false;
        productToDelete = null;
    }
</script>

<Header />

<div class="flex ml-52 mt-16 bg-[#f6ecd3] min-h-[calc(100vh-60px)] max-md:ml-0 max-md:flex-col">
    <div class="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4 p-4 flex-1 content-start w-full max-md:p-2 max-sm:grid-cols-1">
        <div class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-4 flex flex-col items-start min-h-[270px] relative hover:shadow-[0_4px_16px_rgba(0,0,0,0.13)] transition-shadow w-full justify-center items-center cursor-pointer border-2 border-dashed border-[#cfc6b0] text-[#b2a07a] max-sm:min-h-[200px]" on:click={() => showModal = true}>
            <div class="text-5xl font-light mb-2 max-sm:text-4xl">+</div>
            <div class="text-lg font-medium max-sm:text-base">Create new Product</div>
        </div>
        {#each products as product}
            <div class="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.07)] p-4 flex flex-col items-start min-h-[270px] relative hover:shadow-[0_4px_16px_rgba(0,0,0,0.13)] transition-shadow w-full max-sm:min-h-[200px]">
                <img class="w-full h-[32vh] object-cover rounded-md mb-3 max-sm:h-[24vh]" src={product.image} alt={product.name} />
                <div class="w-full mb-2">
                    <div class="text-base font-semibold text-[#222] mb-1 max-sm:text-sm">{product.name}</div>
                    <div class="text-[0.98rem] text-[#7a6d53] mb-1 max-sm:text-sm">{product.price}</div>
                    <div class="text-[#f5c518] text-base max-sm:text-sm">
                        {#each Array(product.rating) as _, i}
                            <span class="star">★</span>
                        {/each}
                    </div>
                </div>
                <div class="absolute bottom-4 right-4 flex gap-3">
                    <span class="text-[1.15rem] cursor-pointer opacity-70 hover:opacity-100 transition-opacity max-sm:text-base" on:click={() => { editProduct = {...product}; showEditModal = true; }}>✎</span>
                    <span class="text-[1.15rem] cursor-pointer opacity-70 hover:opacity-100 transition-opacity max-sm:text-base" on:click={() => { productToDelete = product; showDeleteModal = true; }}>🗑️</span>
                </div>
            </div>
        {/each}
    </div>
</div>

{#if showModal}
<div class="fixed inset-0 bg-black/20 z-[2000] flex items-center justify-center p-4 overflow-y-auto">
    <div class="bg-[#fdf7ec] rounded-3xl shadow-[0_4px_32px_rgba(0,0,0,0.18)] p-6 min-w-[320px] max-w-[900px] w-[90vw] min-h-[420px] border-4 border-[#e2dbc7] flex flex-col gap-5 max-[1100px]:max-w-[98vw] max-[1100px]:p-4 max-[600px]:w-[99vw] max-[600px]:p-2 my-4 max-sm:min-h-[auto]">
        <div class="flex justify-between items-center mb-2 max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-2">
            <span class="text-xl font-bold text-[#4a463b] tracking-wide max-sm:text-lg">NEW PRODUCT</span>
            <img src="/X.png" alt="Close" class="w-7 h-7 cursor-pointer hover:brightness-75 transition-filter max-sm:w-6 max-sm:h-6" on:click={() => showModal = false} />
        </div>
        <div class="flex gap-8 max-[1100px]:gap-4 max-[900px]:flex-col max-[900px]:gap-5 max-[600px]:gap-3">
            <div class="flex-1 flex flex-col items-center gap-4 max-[900px]:w-full max-[900px]:items-stretch max-[600px]:gap-3">
                <div class="relative w-[180px] h-[220px] bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center max-[900px]:w-[120px] max-[900px]:h-[140px] max-[600px]:w-[80px] max-[600px]:h-[90px]">
                    <img class="w-[140px] h-[180px] object-contain max-[900px]:w-[90px] max-[900px]:h-[110px] max-[600px]:w-[60px] max-[600px]:h-[70px]" src={modalProduct.image} alt="Product" />
                    <span class="absolute top-2 left-2 bg-white rounded-full w-6 h-6 flex items-center justify-center text-xl text-[#b2a07a] border-2 border-[#e2dbc7] cursor-pointer max-sm:w-5 max-sm:h-5 max-sm:text-base" on:click={addImage}>+</span>
                </div>
                <div class="flex items-center gap-2">
                    {#each modalProduct.variations as v}
                        <img class="w-[38px] h-[38px] rounded-lg object-cover bg-white shadow-[0_1px_4px_rgba(0,0,0,0.07)] border-2 border-[#e2dbc7] max-[600px]:w-7 max-[600px]:h-7" src={v} alt="Variation" />
                    {/each}
                    <span class="w-7 h-7 rounded-full bg-white border-2 border-dashed border-[#b2a07a] text-[#b2a07a] flex items-center justify-center text-xl cursor-pointer max-[600px]:w-6 max-[600px]:h-6" on:click={addVariation}>+</span>
                </div>
                <div class="text-base font-medium text-[#7a6d53] mb-1 mt-3 max-[600px]:text-sm">Product Name</div>
                <input class="w-full p-3 rounded-2xl border-2 border-[#e2dbc7] bg-[#f8f5ee] text-base text-[#4a463b] mb-2 max-[600px]:text-sm max-[600px]:p-2" value={modalProduct.name} readonly />
                <div class="text-base font-medium text-[#7a6d53] mb-1 max-[600px]:text-sm">Price</div>
                <input class="w-full p-3 rounded-2xl border-2 border-[#e2dbc7] bg-[#f8f5ee] text-base text-[#4a463b] mb-2 max-[600px]:text-sm max-[600px]:p-2" value={modalProduct.price} readonly />
            </div>
            <div class="flex-[1.3] flex flex-col gap-2 max-[900px]:w-full max-[900px]:items-stretch">
                <div class="text-base font-medium text-[#7a6d53] mb-1 max-[600px]:text-sm">Detail</div>
                <textarea class="w-full min-h-[60px] rounded-xl border-2 border-[#e2dbc7] bg-[#f8f5ee] text-base p-3 text-[#4a463b] mb-3 resize-none max-[600px]:text-sm max-[600px]:p-2" readonly>{modalProduct.detail}</textarea>
                <div class="text-base font-medium text-[#7a6d53] mb-1 flex items-center max-[600px]:text-sm">
                    Category
                    <span class="text-base text-[#b2a07a] ml-1 cursor-pointer max-[600px]:text-sm" on:click={() => addTag('categories')}>✎</span>
                </div>
                <div class="flex flex-wrap gap-2 mb-2">
                    {#each modalProduct.categories as cat, i}
                        <span class="bg-[#f3ead2] text-[#7a6d53] rounded-2xl px-3 py-1 text-[0.97rem] flex items-center gap-1 max-[600px]:text-sm">
                            {cat}
                            <span class="text-[1.1rem] text-[#b2a07a] cursor-pointer ml-1 max-[600px]:text-base" on:click={() => removeTag('categories', i)}>×</span>
                        </span>
                    {/each}
                </div>
                <div class="text-base font-medium text-[#7a6d53] mb-1 flex items-center max-[600px]:text-sm">
                    Color
                    <span class="text-base text-[#b2a07a] ml-1 cursor-pointer max-[600px]:text-sm" on:click={() => addTag('colors')}>+</span>
                </div>
                <div class="flex flex-wrap gap-2 mb-2">
                    {#each modalProduct.colors as color, i}
                        <span class="bg-[#f3ead2] text-[#7a6d53] rounded-2xl px-3 py-1 text-[0.97rem] flex items-center gap-1 max-[600px]:text-sm">
                            {color}
                            <span class="text-[1.1rem] text-[#b2a07a] cursor-pointer ml-1 max-[600px]:text-base" on:click={() => removeTag('colors', i)}>×</span>
                        </span>
                    {/each}
                </div>
                <div class="text-base font-medium text-[#7a6d53] mb-1 flex items-center max-[600px]:text-sm">
                    Sizes
                    <span class="text-base text-[#b2a07a] ml-1 cursor-pointer max-[600px]:text-sm" on:click={() => addTag('sizes')}>+</span>
                </div>
                <div class="flex flex-wrap gap-2 mb-2">
                    {#each modalProduct.sizes as size, i}
                        <span class="bg-[#f3ead2] text-[#7a6d53] rounded-2xl px-3 py-1 text-[0.97rem] flex items-center gap-1 max-[600px]:text-sm">
                            {size}
                            <span class="text-[1.1rem] text-[#b2a07a] cursor-pointer ml-1 max-[600px]:text-base" on:click={() => removeTag('sizes', i)}>×</span>
                        </span>
                    {/each}
                </div>
                <div class="text-base font-medium text-[#7a6d53] mb-1 max-[600px]:text-sm">Stock</div>
                <input class="w-full p-3 rounded-2xl border-2 border-[#e2dbc7] bg-[#f8f5ee] text-base text-[#4a463b] mb-2 max-[600px]:text-sm max-[600px]:p-2" value={modalProduct.stock} readonly />
                <button class="mt-5 w-full h-12 bg-[#4a6d96] text-white rounded-3xl text-lg font-semibold shadow-[0_2px_8px_rgba(74,109,150,0.13)] hover:bg-[#39567a] transition-colors max-[900px]:h-10 max-[900px]:text-base max-[600px]:h-9 max-[600px]:text-sm" on:click={handleAdd}>ADD</button>
            </div>
        </div>
    </div>
</div>
{/if}

{#if showEditModal}
<div class="fixed inset-0 bg-black/20 z-[2000] flex items-center justify-center p-4 overflow-y-auto">
    <div class="bg-[#fdf7ec] rounded-3xl shadow-[0_4px_32px_rgba(0,0,0,0.18)] p-6 min-w-[320px] max-w-[900px] w-[90vw] min-h-[420px] border-4 border-[#e2dbc7] flex flex-col gap-5 max-[1100px]:max-w-[98vw] max-[1100px]:p-4 max-[600px]:w-[99vw] max-[600px]:p-2 my-4 max-sm:min-h-[auto]">
        <div class="flex justify-between items-center mb-2 max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-2">
            <span class="text-xl font-bold text-[#4a463b] tracking-wide max-sm:text-lg">EDIT PRODUCT</span>
            <img src="/X.png" alt="Close" class="w-7 h-7 cursor-pointer hover:brightness-75 transition-filter max-sm:w-6 max-sm:h-6" on:click={() => showEditModal = false} />
        </div>
        <div class="flex gap-8 max-[1100px]:gap-4 max-[900px]:flex-col max-[900px]:gap-5 max-[600px]:gap-3">
            <div class="flex-1 flex flex-col items-center gap-4 max-[900px]:w-full max-[900px]:items-stretch max-[600px]:gap-3">
                <div class="relative w-[180px] h-[220px] bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center max-[900px]:w-[120px] max-[900px]:h-[140px] max-[600px]:w-[80px] max-[600px]:h-[90px]">
                    <img class="w-[140px] h-[180px] object-contain max-[900px]:w-[90px] max-[900px]:h-[110px] max-[600px]:w-[60px] max-[600px]:h-[70px]" src={editProduct.image} alt="Product" />
                    <span class="absolute top-2 left-2 bg-white rounded-full w-6 h-6 flex items-center justify-center text-xl text-[#b2a07a] border-2 border-[#e2dbc7] cursor-pointer max-sm:w-5 max-sm:h-5 max-sm:text-base" on:click={addImage}>+</span>
                </div>
                <div class="flex items-center gap-2">
                    {#each editProduct.variations as v}
                        <img class="w-[38px] h-[38px] rounded-lg object-cover bg-white shadow-[0_1px_4px_rgba(0,0,0,0.07)] border-2 border-[#e2dbc7] max-[600px]:w-7 max-[600px]:h-7" src={v} alt="Variation" />
                    {/each}
                    <span class="w-7 h-7 rounded-full bg-white border-2 border-dashed border-[#b2a07a] text-[#b2a07a] flex items-center justify-center text-xl cursor-pointer max-[600px]:w-6 max-[600px]:h-6" on:click={addVariation}>+</span>
                </div>
                <div class="text-base font-medium text-[#7a6d53] mb-1 mt-3 max-[600px]:text-sm">Product Name</div>
                <input class="w-full p-3 rounded-2xl border-2 border-[#e2dbc7] bg-[#f8f5ee] text-base text-[#4a463b] mb-2 max-[600px]:text-sm max-[600px]:p-2" bind:value={editProduct.name} />
                <div class="text-base font-medium text-[#7a6d53] mb-1 max-[600px]:text-sm">Price</div>
                <input class="w-full p-3 rounded-2xl border-2 border-[#e2dbc7] bg-[#f8f5ee] text-base text-[#4a463b] mb-2 max-[600px]:text-sm max-[600px]:p-2" bind:value={editProduct.price} />
            </div>
            <div class="flex-[1.3] flex flex-col gap-2 max-[900px]:w-full max-[900px]:items-stretch">
                <div class="text-base font-medium text-[#7a6d53] mb-1 max-[600px]:text-sm">Detail</div>
                <textarea class="w-full min-h-[60px] rounded-xl border-2 border-[#e2dbc7] bg-[#f8f5ee] text-base p-3 text-[#4a463b] mb-3 resize-none max-[600px]:text-sm max-[600px]:p-2" bind:value={editProduct.detail}></textarea>
                <div class="text-base font-medium text-[#7a6d53] mb-1 flex items-center max-[600px]:text-sm">
                    Category
                    <span class="text-base text-[#b2a07a] ml-1 cursor-pointer max-[600px]:text-sm" on:click={() => addTag('categories')}>✎</span>
                </div>
                <div class="flex flex-wrap gap-2 mb-2">
                    {#each editProduct.categories as cat, i}
                        <span class="bg-[#f3ead2] text-[#7a6d53] rounded-2xl px-3 py-1 text-[0.97rem] flex items-center gap-1 max-[600px]:text-sm">
                            {cat}
                            <span class="text-[1.1rem] text-[#b2a07a] cursor-pointer ml-1 max-[600px]:text-base" on:click={() => removeTag('categories', i)}>×</span>
                        </span>
                    {/each}
                </div>
                <div class="text-base font-medium text-[#7a6d53] mb-1 flex items-center max-[600px]:text-sm">
                    Color
                    <span class="text-base text-[#b2a07a] ml-1 cursor-pointer max-[600px]:text-sm" on:click={() => addTag('colors')}>+</span>
                </div>
                <div class="flex flex-wrap gap-2 mb-2">
                    {#each editProduct.colors as color, i}
                        <span class="bg-[#f3ead2] text-[#7a6d53] rounded-2xl px-3 py-1 text-[0.97rem] flex items-center gap-1 max-[600px]:text-sm">
                            {color}
                            <span class="text-[1.1rem] text-[#b2a07a] cursor-pointer ml-1 max-[600px]:text-base" on:click={() => removeTag('colors', i)}>×</span>
                        </span>
                    {/each}
                </div>
                <div class="text-base font-medium text-[#7a6d53] mb-1 flex items-center max-[600px]:text-sm">
                    Sizes
                    <span class="text-base text-[#b2a07a] ml-1 cursor-pointer max-[600px]:text-sm" on:click={() => addTag('sizes')}>+</span>
                </div>
                <div class="flex flex-wrap gap-2 mb-2">
                    {#each editProduct.sizes as size, i}
                        <span class="bg-[#f3ead2] text-[#7a6d53] rounded-2xl px-3 py-1 text-[0.97rem] flex items-center gap-1 max-[600px]:text-sm">
                            {size}
                            <span class="text-[1.1rem] text-[#b2a07a] cursor-pointer ml-1 max-[600px]:text-base" on:click={() => removeTag('sizes', i)}>×</span>
                        </span>
                    {/each}
                </div>
                <div class="text-base font-medium text-[#7a6d53] mb-1 max-[600px]:text-sm">Stock</div>
                <input class="w-full p-3 rounded-2xl border-2 border-[#e2dbc7] bg-[#f8f5ee] text-base text-[#4a463b] mb-2 max-[600px]:text-sm max-[600px]:p-2" bind:value={editProduct.stock} />
                <button class="mt-5 w-full h-12 bg-[#4a6d96] text-white rounded-3xl text-lg font-semibold shadow-[0_2px_8px_rgba(74,109,150,0.13)] hover:bg-[#39567a] transition-colors max-[900px]:h-10 max-[900px]:text-base max-[600px]:h-9 max-[600px]:text-sm" on:click={handleEdit}>UPDATE</button>
            </div>
        </div>
    </div>
</div>
{/if}

{#if showDeleteModal}
<div class="fixed inset-0 bg-black/20 z-[2000] flex items-center justify-center p-4 overflow-y-auto">
    <div class="bg-[#fdf7ec] rounded-3xl shadow-[0_4px_32px_rgba(0,0,0,0.18)] p-6 min-w-[320px] max-w-[500px] w-[90vw] border-4 border-[#e2dbc7] flex flex-col gap-5 max-[1100px]:max-w-[98vw] max-[1100px]:p-4 max-[600px]:w-[99vw] max-[600px]:p-2 my-4">
        <div class="flex justify-between items-center mb-2">
            <span class="text-xl font-bold text-[#4a463b] tracking-wide max-sm:text-lg">DELETE PRODUCT</span>
            <img src="/X.png" alt="Close" class="w-7 h-7 cursor-pointer hover:brightness-75 transition-filter max-sm:w-6 max-sm:h-6" on:click={() => { showDeleteModal = false; productToDelete = null; }} />
        </div>
        <div class="flex flex-col items-center py-4">
            <div class="w-32 h-32 mb-4 rounded-xl overflow-hidden bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] max-sm:w-24 max-sm:h-24">
                <img 
                    src={productToDelete?.image} 
                    alt={productToDelete?.name} 
                    class="w-full h-full object-cover"
                />
            </div>
            <p class="text-[#4a463b] text-lg mb-2 max-sm:text-base">Are you sure you want to delete</p>
            <p class="text-[#7a6d53] font-medium text-xl max-sm:text-lg">{productToDelete?.name}?</p>
            <p class="text-[#7a6d53] mt-1 max-sm:text-sm">{productToDelete?.price}</p>
        </div>
        <div class="flex gap-4 mt-2">
            <button 
                class="flex-1 h-12 bg-gray-200 text-[#4a463b] rounded-3xl text-lg font-semibold hover:bg-gray-300 transition-colors max-[600px]:h-9 max-[600px]:text-sm" 
                on:click={() => { showDeleteModal = false; productToDelete = null; }}
            >
                CANCEL
            </button>
            <button 
                class="flex-1 h-12 bg-red-500 text-white rounded-3xl text-lg font-semibold hover:bg-red-600 transition-colors max-[600px]:h-9 max-[600px]:text-sm" 
                on:click={handleDelete}
            >
                DELETE
            </button>
        </div>
    </div>
</div>
{/if}
