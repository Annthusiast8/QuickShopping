<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Product } from '$lib/stores/products';
  import Alerts from './Alerts.svelte';

  export let isOpen: boolean = false;
  export let product: Product;

  const reportReasons = [
    'Prohibited (Banned) Items',
    'Counterfeits and Copyright',
    'Offensive or Potentially Offensive Items',
    'Order Brushing',
    'Fraudulent Listings'
  ];

  let selectedReason: string | null = null;
  let showReportSuccess = false;

  const dispatch = createEventDispatcher();

  function closeModal() {
    dispatch('close');
    selectedReason = null;
  }

  function submitReport() {
    if (selectedReason) {
      dispatch('report', {
        productId: product.id,
        reason: selectedReason
      });
      showReportSuccess = true;
      setTimeout(() => {
        showReportSuccess = false;
        closeModal();
      }, 2000);
    }
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg w-full max-w-md overflow-hidden">
      <div class="flex justify-between items-center border-b border-gray-200 p-4">
        <h3 class="text-lg font-medium">Select a Reason</h3>
        <button on:click={closeModal} class="text-gray-500 hover:text-gray-700">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="p-4">
        <div class="space-y-1">
          {#each reportReasons as reason}
            <div 
              class="p-3 hover:bg-gray-100 cursor-pointer rounded-md {selectedReason === reason ? 'bg-gray-100' : ''}"
              on:click={() => selectedReason = reason}
            >
              {reason}
            </div>
          {/each}
        </div>
        
        <div class="mt-6 flex justify-end">
          <button 
            on:click={submitReport}
            class="px-4 py-2 bg-[#789DBC] text-black rounded-md hover:bg-[#0F73E6]  disabled:cursor-not-allowed"
            disabled={!selectedReason}
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<Alerts 
  isVisible={showReportSuccess} 
  type="report-success" 
  autoDismiss={true} 
  on:close={() => showReportSuccess = false} 
/> 