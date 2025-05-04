<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Product } from '$lib/stores/products';

  export let product: Product;
  export let isOpen: boolean = false;
  
  let quantity: number = 1;
  
  const dispatch = createEventDispatcher();
  
  function closeModal() {
    dispatch('close');
  }
  
  function addToCart() {
    dispatch('addToCart', {...product, quantity});
    closeModal();
  }
  
  function incrementQuantity() {
    if (quantity < product.stock) {
      quantity += 1;
    }
  }
  
  function decrementQuantity() {
    if (quantity > 1) {
      quantity -= 1;
    }
  }
  
  function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg w-full max-w-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-900">Add to Cart</h2>
        <button 
          on:click={closeModal}
          class="text-gray-500 hover:text-gray-700"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="flex items-center gap-4 mb-6">
        <img 
          src={product.image_url || '/placeholder-image.jpg'} 
          alt={product.name}
          class="w-20 h-20 object-cover rounded-md"
        />
        <div>
          <h3 class="font-medium text-gray-900">{product.name}</h3>
          <p class="text-[#21463E] font-bold">{formatPrice(product.price)}</p>
        </div>
      </div>
      
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
        <div class="flex items-center border border-gray-300 rounded-md w-1/2">
          <button 
            on:click={decrementQuantity}
            class="px-3 py-2 text-gray-600 hover:bg-gray-100 {quantity <= 1 ? 'opacity-50 cursor-not-allowed' : ''}"
            disabled={quantity <= 1}
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
          </button>
          <span class="flex-1 text-center py-2">{quantity}</span>
          <button 
            on:click={incrementQuantity}
            class="px-3 py-2 text-gray-600 hover:bg-gray-100 {quantity >= product.stock ? 'opacity-50 cursor-not-allowed' : ''}"
            disabled={quantity >= product.stock}
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <p class="text-sm text-gray-500 mt-1">Available: {product.stock} units</p>
      </div>
      
      <div class="flex justify-between items-center mb-4">
        <span class="text-gray-700 font-medium">Subtotal:</span>
        <span class="text-[#21463E] font-bold">{formatPrice(product.price * quantity)}</span>
      </div>
      
      <button
        on:click={addToCart}
        class="w-full py-3 bg-[#21463E] text-white rounded-md hover:bg-[#143129] transition-colors duration-200 font-semibold"
      >
        Add to Cart
      </button>
    </div>
  </div>
{/if}
