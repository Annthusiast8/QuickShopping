<script lang="ts">
  import type { Product } from '$lib/stores/products';
  import ProductModal from './ProductModal.svelte';

  export let product: Product;
  export let onAddToCart: (product: Product) => void;

  let showModal = false;

  function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  }

  function renderStars(rating: number) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push('★');
      } else if (i === fullStars && hasHalfStar) {
        stars.push('☆');
      } else {
        stars.push('☆');
      }
    }
    return stars.join('');
  }

  function handleAddToCart(event: CustomEvent<Product>) {
    onAddToCart(event.detail);
    showModal = false;
  }
</script>

<div 
  class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
  on:click={() => showModal = true}
  on:keydown={(e) => e.key === 'Enter' && (showModal = true)}
  role="button"
  tabindex="0"
>
  <!-- Product Image -->
  <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
    {#if product.image_url}
      <img src={product.image_url} alt={product.name} class="object-cover w-full h-48" />
    {:else}
      <div class="w-full h-48 flex items-center justify-center bg-gray-100">
        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    {/if}
  </div>

  <!-- Product Info -->
  <div class="p-4 relative min-h-[180px]">
    <h3 class="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
    <span class="inline-block px-2 py-1 text-xs font-semibold text-[#21463E] bg-[#21463E]/10 rounded-full mb-2">{product.category}</span>
    <div class="flex items-center mb-2">
      <span class="text-yellow-500 text-lg mr-1">{renderStars(product.rating || 0)}</span>
      <span class="text-gray-500 text-sm">({(product.rating || 0).toFixed(1)}/5.0 • {product.review_count || 0} reviews)</span>
    </div>
    <div class="flex items-center justify-between mt-2">
      <span class="text-lg font-bold text-[#21463E]">{formatPrice(product.price)}</span>
    </div>
    <button
      on:click|stopPropagation={() => onAddToCart(product)}
      class="absolute bottom-4 right-4 px-4 py-2 bg-[#21463E] text-white rounded-md hover:bg-[#143129] transition-colors duration-200"
    >
      Add to Cart
    </button>
  </div>
</div>

<ProductModal 
  {product}
  isOpen={showModal}
  on:close={() => showModal = false}
  on:addToCart={handleAddToCart}
/> 