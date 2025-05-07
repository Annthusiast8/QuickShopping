<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let isOpen: boolean = false;
  export let total: number = 0;

  const dispatch = createEventDispatcher();

  function closeModal() {
    dispatch('close');
  }

  function continueShopping() {
    dispatch('continueShopping');
    closeModal();
  }

  function viewOrders() {
    dispatch('viewOrders');
    closeModal();
  }

  function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div class="p-6">
        <div class="text-center">
          <!-- Success icon -->
          <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg class="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h3 class="text-2xl font-medium text-gray-900 mb-2">Order Successful!</h3>
          <p class="text-gray-600 mb-6">
            Your order has been placed successfully. Thank you for shopping with us!
          </p>
          
          <div class="bg-gray-100 p-4 rounded-lg mb-6">
            <div class="flex justify-between mb-2">
              <span class="text-gray-700">Order Total:</span>
              <span class="font-bold text-gray-900">{formatPrice(total)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-700">Estimated Delivery:</span>
              <span class="text-gray-900">3-5 Business Days</span>
            </div>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-4">
            <button 
              class="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
              on:click={continueShopping}
            >
              Continue Shopping
            </button>
            <button 
              class="w-full px-4 py-2 bg-[#21463E] text-white rounded-md hover:bg-[#143129] focus:outline-none"
              on:click={viewOrders}
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
