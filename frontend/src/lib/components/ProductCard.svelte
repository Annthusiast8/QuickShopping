<script lang="ts">
  import ProductModal from './ProductModal.svelte';
  import AddToCartModal from './AddToCartModal.svelte';
  import AddToCartSuccess from './Alerts.svelte';
  import { onMount } from 'svelte';
  import { cart } from '$lib/stores/cart';
  
  // Define Product interface inline
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

  export let product: Product;
  export let onAddToCart: (product: Product) => void;

  let showModal = false;
  let showAddToCartModal = false;
  let showSuccessOverlay = false;

  let sellerName = '';

  // Mock business profiles
  const mockBusinessProfiles: Record<string, { business_name: string; logo_url: null }> = {
    '1': { business_name: 'Fresh Produce Co.', logo_url: null },
    '2': { business_name: 'Organic Delights', logo_url: null },
    '3': { business_name: 'Farm Fresh Market', logo_url: null },
    '4': { business_name: 'Local Harvest', logo_url: null },
    '5': { business_name: 'Green Grocer', logo_url: null }
  };

  onMount(() => {
    // Use mock data instead of API call
    // Handle case where seller_id might be undefined
    if (product.seller_id) {
      const mockProfile = mockBusinessProfiles[product.seller_id.toString()];
      if (mockProfile) {
        sellerName = mockProfile.business_name;
      }
    } else {
      // Default seller name if seller_id is missing
      sellerName = 'QuickShopping Marketplace';
    }
  });

  function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-PH', {
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

  function handleAddToCart(event: CustomEvent) {
    const cartData = event.detail;
    
    // Add to cart using cart store
    cart.addToCart({
      item_id: cartData.product.id,
      quantity: cartData.quantity || 1,
      variation: cartData.variation
    });
    
    // Still call the parent component's handler if needed
    onAddToCart(cartData.product);
    
    // Close modals
    showModal = false;
    showAddToCartModal = false;
    
    // Show success overlay
    showSuccessOverlay = true;
  }

  function closeSuccessOverlay() {
    showSuccessOverlay = false;
  }

  // Calculate buyers count based on product ID for consistency
  // Handle case where product ID might be undefined
  const buyersCount = product.id ? (product.id * 123) % 1000 + 50 : 50; // Using product ID to ensure consistent values
</script>

<div 
  class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full flex flex-col w-full"
  on:click={() => showModal = true}
  on:keydown={(e) => e.key === 'Enter' && (showModal = true)}
  role="button"
  tabindex="0"
>
  <!-- Product Image -->
  <div class="w-full overflow-hidden bg-gray-200">
    {#if product.image_url}
      <img src={product.image_url} alt={product.name} class="object-cover w-full h-48 md:h-56 lg:h-64" />
    {:else}
      <div class="w-full h-48 md:h-56 lg:h-64 flex items-center justify-center bg-gray-100">
        <svg class="w-10 h-10 md:w-12 md:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    {/if}
  </div>

  <!-- Product Info -->
  <div class="p-3 md:p-4 flex-grow flex flex-col">
    <h3 class="text-base md:text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
    <div class="flex flex-wrap items-center gap-1 md:gap-2 mb-1 md:mb-2">
      <span class="inline-block px-2 py-0.5 text-xs font-semibold text-[#21463E] bg-[#21463E]/10 rounded-full">{product.category}</span>
    </div>
    <div class="flex items-center mb-1 md:mb-2">
      <span class="text-yellow-500 text-sm md:text-base lg:text-lg mr-1">{renderStars(product.rating || 0)}</span>
      <span class="text-gray-500 text-xs md:text-sm">({(product.rating || 0).toFixed(1)}/5.0)</span>
    </div>
    <div class="flex items-center text-gray-500 text-xs md:text-sm mb-1 md:mb-2">
      <svg class="w-3 h-3 md:w-4 md:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <span>{buyersCount} buyers</span>
    </div>
    <div class="flex items-center justify-between mt-auto">
      <span class="text-base md:text-lg font-bold text-[#21463E]">{formatPrice(product.price)}</span>
    </div>
  </div>
</div>

<ProductModal 
  {product}
  {sellerName}
  {buyersCount}
  isOpen={showModal}
  on:close={() => showModal = false}
  on:addToCart={handleAddToCart}
/>

<AddToCartModal
  {product}
  isOpen={showAddToCartModal}
  on:close={() => showAddToCartModal = false}
  on:addToCart={handleAddToCart}
/>

<AddToCartSuccess
  isVisible={showSuccessOverlay}
  on:close={closeSuccessOverlay}
/> 