<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { api } from '$lib/services/api';
  import type { ReportData } from '$lib/services/api';
  import Alerts from './Alerts.svelte';
  
  // Define Product interface inline (matching the one used in ProductCard)
  interface Product {
    id: number;
    seller_id?: number;
    name: string;
    description?: string;
    price: number;
    stock?: number;
    image_url?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string | null;
    rating?: number;
    review_count?: number;
    category?: string;
    variations?: {
      sizes?: any[];
      sizeType?: string;
      sizeUnit?: string;
      colors?: string[];
    };
  }

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
  let description: string = '';
  let showAlert = false;
  let alertType: 'success' | 'error' = 'success';
  let loading = false;
  let error: string | null = null;

  const dispatch = createEventDispatcher();

  function closeModal() {
    // Reset form state
    selectedReason = null;
    description = '';
    error = null;
    dispatch('close');
  }

  async function submitReport() {
    if (!selectedReason) return;
    
    loading = true;
    error = null;
    
    try {
      // Create report data object according to the API interface
      const reportData: ReportData = {
        reason: selectedReason,
        description: description.trim() || `Reported for ${selectedReason}`
      };
      
      // Call the API to report the product
      await api.reportProduct(product.id, reportData);
      
      // Show success alert
      alertType = 'success';
      showAlert = true;
      
      // Close modal after a delay
      setTimeout(() => {
        showAlert = false;
        closeModal();
      }, 2000);
      
      // Notify parent component
      dispatch('report', {
        productId: product.id,
        reason: selectedReason,
        description: description
      });
    } catch (err) {
      // Handle error
      error = err instanceof Error ? err.message : 'Failed to submit report';
      alertType = 'error';
      showAlert = true;
    } finally {
      loading = false;
    }
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" role="dialog" tabindex="0" aria-modal="true" aria-labelledby="report-modal-title" on:keydown={(e) => e.key === 'Escape' && closeModal()}>
    <div class="bg-white rounded-lg w-full max-w-md overflow-hidden shadow-xl">
      <!-- Header -->
      <div class="flex justify-between items-center border-b border-gray-200 p-4">
        <h3 id="report-modal-title" class="text-lg font-semibold text-gray-800">Report Product</h3>
        <button 
          on:click={closeModal} 
          class="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Content -->
      <div class="p-5">
        <!-- Product info -->
        <div class="mb-4 p-3 bg-gray-50 rounded-lg">
          <p class="font-medium text-gray-700">Reporting: {product.name}</p>
        </div>
        
        <!-- Reason selection -->
        <div class="mb-4">
          <label id="reason-group-label" class="block text-sm font-medium text-gray-700 mb-2">Select a reason:</label>
          <div class="space-y-1 max-h-48 overflow-y-auto" role="radiogroup" aria-labelledby="reason-group-label">
            {#each reportReasons as reason}
              <div 
                class="p-3 border rounded-md cursor-pointer transition-colors
                  {selectedReason === reason ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50 border-gray-200'}"
                on:click={() => selectedReason = reason}
                on:keydown={(e) => e.key === 'Enter' && (selectedReason = reason)}
                role="radio"
                aria-checked={selectedReason === reason}
                tabindex="0"
              >
                {reason}
              </div>
            {/each}
          </div>
        </div>
        
        <!-- Description field -->
        <div class="mb-4">
          <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Additional details (optional):</label>
          <textarea
            id="description"
            bind:value={description}
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Please provide any additional details about this report..."
          ></textarea>
        </div>
        
        <!-- Error message -->
        {#if error}
          <div class="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        {/if}
        
        <!-- Action buttons -->
        <div class="mt-5 flex justify-end space-x-3">
          <button 
            on:click={closeModal}
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            on:click={submitReport}
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={!selectedReason || loading}
          >
            {#if loading}
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            {:else}
              Submit Report
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<Alerts 
  isVisible={showAlert} 
  type={alertType === 'success' ? 'report-success' : 'error'}
  title={alertType === 'success' ? 'Report Submitted' : 'Error'}
  cartAdded={alertType === 'success' ? 'Thank you for your report. Our team will review it shortly.' : error || 'Failed to submit report'}
  autoDismiss={alertType === 'success'}
  on:close={() => showAlert = false} 
 />