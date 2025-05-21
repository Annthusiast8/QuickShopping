<script lang="ts">
  import { cart } from '$lib/stores/cart';

  // Count total number of items in cart
  $: itemCount = $cart.items.reduce((count, item) => count + item.quantity, 0);
</script>

<a href="/page-customer/cart" class="relative flex items-center">
  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
  
  {#if itemCount > 0}
    <span class="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
      {itemCount > 99 ? '99+' : itemCount}
    </span>
  {/if}
</a> 