<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Product } from '$lib/stores/products';
  import { mockReviews } from '$lib/mock/data';

  export let product: Product;
  export let isOpen: boolean = false;

  let activeTab: 'description' | 'reviews' = 'description';

  const dispatch = createEventDispatcher();

  function closeModal() {
    dispatch('close');
  }

  function reportProduct() {
    dispatch('report', product);
  }

  function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto relative">
      <!-- Close button -->
      <div class="sticky top-0 right-0 z-50 flex justify-end">
        <button 
          on:click={closeModal}
          class="text-gray-500 hover:text-gray-700 m-4"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
        <!-- Product Image - Show in both tabs but in different positions -->
        {#if activeTab === 'description'}
          <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 rounded-lg">
            {#if product.image_url}
              <img src={product.image_url} alt={product.name} class="object-cover w-full h-full" />
            {:else}
              <div class="w-full h-full flex items-center justify-center bg-gray-100">
                <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            {/if}
          </div>
        {:else}
          <div class="md:col-span-2 flex justify-center mb-6">
            <div class="w-full max-w-2xl h-64 overflow-hidden bg-gray-200 rounded-lg">
              {#if product.image_url}
                <img src={product.image_url} alt={product.name} class="object-cover w-full h-full" />
              {:else}
                <div class="w-full h-full flex items-center justify-center bg-gray-100">
                  <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              {/if}
            </div>
          </div>
        {/if}

        <!-- Product Details -->
        <div class="flex flex-col {activeTab === 'reviews' ? 'md:col-span-2' : ''}">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
          
          <div class="flex items-center mb-4">
            <span class="inline-block px-3 py-1 text-sm font-semibold text-[#21463E] bg-[#21463E]/10 rounded-full mr-4">{product.category}</span>
            <span class="text-yellow-500 text-xl mr-2">{renderStars(product.rating || 0)}</span>
            <span class="text-gray-600">({(product.rating || 0).toFixed(1)}/5.0 • {product.review_count || 0} reviews)</span>
          </div>

          <p class="text-3xl font-bold text-[#21463E] mb-4">{formatPrice(product.price)}</p>
          
          <div class="mb-4">
            <p class="text-gray-600">Stock: {product.stock} units available</p>
          </div>

          <div class="flex gap-2 mb-6">
            <button
              on:click={() => dispatch('addToCart', product)}
              class="flex-1 px-6 py-3 bg-[#21463E] text-white rounded-md hover:bg-[#143129] transition-colors duration-200 font-semibold"
            >
              Add to Cart
            </button>
            <button
              on:click={() => dispatch('buy', product)}
              class="flex-1 px-6 py-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors duration-200 font-semibold"
            >
              Buy
            </button>
            <button
              on:click={reportProduct}
              class="p-3 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors duration-200"
              title="Report Product"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            </button>
          </div>

          <!-- Tabs -->
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8">
              <button
                class="py-4 px-1 border-b-2 font-medium text-sm {activeTab === 'description' ? 'border-[#21463E] text-[#21463E]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                on:click={() => activeTab = 'description'}
              >
                Product Description
              </button>
              <button
                class="py-4 px-1 border-b-2 font-medium text-sm {activeTab === 'reviews' ? 'border-[#21463E] text-[#21463E]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                on:click={() => activeTab = 'reviews'}
              >
                All Reviews
              </button>
            </nav>
          </div>

          <!-- Tab Content -->
          <div class="mt-4">
            {#if activeTab === 'description'}
              <div class="text-gray-600">
                {product.description || 'No description available'}
              </div>
            {:else}
              <div class="space-y-6">
                {#if product.review_count > 0}
                  {#each mockReviews as review}
                    <div class="border-b border-gray-200 pb-6">
                      <div class="flex items-start space-x-4">
                        <img 
                          src={review.user_image} 
                          alt={review.user_name}
                          class="w-12 h-12 rounded-full object-cover"
                        />
                        <div class="flex-1">
                          <div class="flex items-center justify-between">
                            <div>
                              <h4 class="font-medium text-gray-900">{review.user_name}</h4>
                              <div class="flex items-center mt-1">
                                <span class="text-yellow-500 mr-2">{renderStars(review.rating)}</span>
                                <span class="text-gray-500 text-sm">{formatDate(review.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          <p class="mt-2 text-gray-600">{review.comment}</p>
                          
                          {#if review.images.length > 0}
                            <div class="mt-4 grid grid-cols-2 gap-2">
                              {#each review.images as image}
                                <img 
                                  src={image} 
                                  alt="Review image"
                                  class="rounded-lg object-cover w-full h-32"
                                />
                              {/each}
                            </div>
                          {/if}
                        </div>
                      </div>
                    </div>
                  {/each}
                {:else}
                  <p class="text-gray-600">No reviews yet. Be the first to review this product!</p>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if} 