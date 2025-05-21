<script lang="ts">
  import { cart } from '$lib/stores/cart';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Alerts from '$lib/components/Alerts.svelte';
  
  // Define CartItem interface
  interface CartItem {
    id: number;
    product: {
      id: number;
      seller_id: number;
      name: string;
      description?: string;
      price: number;
      stock: number;
      image_url?: string;
      category?: string;
      rating?: number;
      review_count?: number;
    };
    quantity: number;
    variation: {
      color?: string;
      size?: string;
    };
    selected: boolean;
  }

  // State for delete confirmation modal
  let showDeleteConfirmModal = false;
  let itemToDelete: CartItem | null = null;
  
  // State for mobile accordions
  let expandedItems: Record<string, boolean> = {};

  // Toggle expanded state for an item
  function toggleItemExpanded(itemId: string) {
    expandedItems[itemId] = !expandedItems[itemId];
    expandedItems = {...expandedItems}; // Force reactivity
  }

  // Check if an item is expanded
  function isItemExpanded(itemId: string): boolean {
    return !!expandedItems[itemId];
  }

  // Group items by seller
  // Search functionality
  let searchQuery = '';
  let cartItems: CartItem[] = [];
  let loading = false;
  
  // Update cart items when the store changes
  $: {
    cartItems = $cart.items.map(item => ({
      ...item,
      selected: item.selected || false // Ensure selected property exists
    }));
    loading = $cart.loading;
  }
  
  // Filter items based on search query
  $: visibleItems = searchQuery.trim() 
    ? cartItems.filter(item => 
        item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : cartItems;
  
  $: itemsBySeller = groupItemsBySeller(visibleItems);
  $: anyItemSelected = cartItems.some(item => item.selected);
  $: allItemsSelected = cartItems.length > 0 && cartItems.every(item => item.selected);
  $: selectedItems = cartItems.filter(item => item.selected);
  $: totalSelectedPrice = calculateTotalSelectedPrice(selectedItems);
  
  // Format price to currency
  function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  // Calculate total price for selected items
  function calculateTotalSelectedPrice(items: CartItem[]): number {
    return items.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0);
  }

  // Group items by seller
  function groupItemsBySeller(items: CartItem[]) {
    const grouped = new Map<number, { 
      seller_id: number, 
      seller_name: string, 
      items: CartItem[],
      allSelected: boolean
    }>();
    
    items.forEach(item => {
      const seller_id = item.product.seller_id;
      
      if (!grouped.has(seller_id)) {
        // Get seller name from mock data
        const seller_name = getSellerName(seller_id);
        
        grouped.set(seller_id, {
          seller_id,
          seller_name,
          items: [],
          allSelected: true
        });
      }
      
      grouped.get(seller_id)?.items.push(item);
    });
    
    // Update allSelected flag for each seller group
    grouped.forEach(group => {
      group.allSelected = group.items.every(item => item.selected);
    });
    
    return Array.from(grouped.values());
  }

  // Mock business profiles for now
  function getSellerName(sellerId: number): string {
    const mockBusinessProfiles: Record<string, string> = {
      '1': 'Fresh Produce Co.',
      '2': 'Organic Delights',
      '3': 'Farm Fresh Market',
      '4': 'Local Harvest',
      '5': 'Green Grocer',
      '6': 'Prada Official Store'
    };
    
    return mockBusinessProfiles[sellerId.toString()] || `Seller ${sellerId}`;
  }

  // Handle quantity change
  async function updateQuantity(item: CartItem, newQuantity: number) {
    if (newQuantity > 0 && newQuantity <= item.product.stock) {
      try {
        await cart.updateCartItem(item.product.id, {
          quantity: newQuantity,
          variation: {
            color: item.variation.color,
            size: item.variation.size
          }
        });
      } catch (error) {
        console.error('Failed to update quantity:', error);
      }
    }
  }

  // Handle item removal with confirmation
  function confirmRemoveItem(item: CartItem) {
    itemToDelete = item;
    showDeleteConfirmModal = true;
  }
  
  // Actually remove the item after confirmation
  async function handleConfirmDelete() {
    if (itemToDelete) {
      try {
        await cart.removeFromCart(
          itemToDelete.product.id, 
          {
            color: itemToDelete.variation.color, 
            size: itemToDelete.variation.size
          }
        );
      } catch (error) {
        console.error('Failed to remove item:', error);
      }
    }
    showDeleteConfirmModal = false;
    itemToDelete = null;
  }

  // Handle item selection toggle
  function toggleItemSelection(item: CartItem) {
    // Update local state since the cart store doesn't handle selection
    const index = cartItems.findIndex(i => 
      i.product.id === item.product.id && 
      i.variation.color === item.variation.color && 
      i.variation.size === item.variation.size
    );
    
    if (index !== -1) {
      cartItems[index].selected = !cartItems[index].selected;
      cartItems = [...cartItems]; // Force reactivity
    }
  }

  // Handle seller group selection toggle
  function toggleSellerSelection(sellerId: number, selected: boolean) {
    // Update all items from this seller
    cartItems = cartItems.map(item => {
      if (item.product.seller_id === sellerId) {
        return { ...item, selected };
      }
      return item;
    });
  }

  // Handle all items selection toggle
  function toggleAllSelection() {
    const newSelectedState = !allItemsSelected;
    cartItems = cartItems.map(item => ({ ...item, selected: newSelectedState }));
  }

  // Handle continue shopping
  function handleContinueShopping() {
    goto('/page-customer/home');
  }

  // Handle view orders
  function handleViewOrders() {
    goto('/page-customer/orders');
  }

  // Create a unique ID for each item
  function getItemId(item: CartItem): string {
    return `${item.product.id}-${item.variation.color}-${item.variation.size}`;
  }

  onMount(() => {
    // Load cart data
    const loadCartData = async () => {
      try {
        // Load cart items from the API
        await cart.loadCart();
        
        // If cart is empty and we're in development, add a sample item
        if (cartItems.length === 0 && window.location.hostname === 'localhost') {
          const mockProduct = {
            id: 101,
            seller_id: 6,
            name: "Prada Veloce X1 Sunglasses",
            description: "Luxury sunglasses with UV protection",
            price: 1250,
            stock: 10,
            image_url: "/images/sunglasses.jpg", // Replace with actual image path
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: null,
            rating: 4.8,
            review_count: 120,
            category: "Accessories"
          };
          
          // Add sample item to cart using the cart store
          await cart.addToCart({
            item_id: mockProduct.id,
            quantity: 1,
            variation: {
              color: "Black",
              size: "Standard"
            }
          });
          
          // After adding, reload the cart to get the updated items
          await cart.loadCart();
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    };
    
    // Start loading cart data
    loadCartData();
    
    // Listen for search events from the layout
    const searchHandler = ((event: CustomEvent) => {
      searchQuery = event.detail.query;
    }) as EventListener;
    
    window.addEventListener('searchCart', searchHandler);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('searchCart', searchHandler);
    };
  });
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
  <h1 class="text-2xl font-bold mb-6">Shopping Cart</h1>

  {#if loading}
    <div class="bg-white rounded-lg shadow p-8 text-center">
      <p class="text-gray-600 mb-4">Loading your cart...</p>
    </div>
  {:else if cartItems.length === 0}
    <div class="bg-white rounded-lg shadow p-8 text-center">
      <p class="text-gray-600 mb-4">Your cart is empty</p>
      <a href="/page-customer/shop" class="px-4 py-2 bg-[#21463E] text-white rounded-md hover:bg-[#143129]">
        Continue Shopping
      </a>
    </div>
  {:else}
    <!-- Desktop: Cart header with column labels (hidden on mobile) -->
    <div class="bg-white rounded-lg shadow-md mb-4 overflow-hidden hidden md:block">
      <div class="p-4 grid grid-cols-12 gap-4 items-center border-b">
        <div class="col-span-1">
          <input 
            type="checkbox" 
            checked={allItemsSelected}
            on:change={toggleAllSelection}
            class="h-5 w-5 rounded border-gray-300 text-[#21463E] focus:ring-[#21463E]"
          />
        </div>
        <div class="col-span-5 font-medium">Product</div>
        <div class="col-span-2 font-medium text-center">Price</div>
        <div class="col-span-2 font-medium text-center">Quantity</div>
        <div class="col-span-2 font-medium text-center">Action</div>
      </div>
    </div>

    <!-- Cart items grouped by seller -->
    {#each itemsBySeller as sellerGroup}
      <div class="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
        <!-- Seller header -->
        <div class="p-4 flex items-center border-b bg-gray-50">
          <input 
            type="checkbox" 
            checked={sellerGroup.allSelected}
            on:change={() => toggleSellerSelection(sellerGroup.seller_id, !sellerGroup.allSelected)}
            class="h-5 w-5 mr-4 rounded border-gray-300 text-[#21463E] focus:ring-[#21463E]"
          />
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span class="font-medium">{sellerGroup.seller_name}</span>
          </div>
        </div>

        <!-- Products from this seller -->
        {#each sellerGroup.items as item}
          {@const itemId = getItemId(item)}
          <!-- Desktop view (hidden on mobile) -->
          <div class="hidden md:grid p-4 grid-cols-12 gap-4 items-center border-b last:border-b-0 hover:bg-gray-50">
            <div class="col-span-1">
              <input 
                type="checkbox" 
                checked={item.selected}
                on:change={() => toggleItemSelection(item)}
                class="h-5 w-5 rounded border-gray-300 text-[#21463E] focus:ring-[#21463E]"
              />
            </div>
            <div class="col-span-5 flex items-center">
              <div class="w-16 h-16 overflow-hidden rounded-md mr-4">
                {#if item.product.image_url}
                  <img 
                    src={item.product.image_url} 
                    alt={item.product.name} 
                    class="w-full h-full object-cover" 
                  />
                {:else}
                  <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                {/if}
              </div>
              <div>
                <h3 class="font-medium text-gray-800">{item.product.name}</h3>
                <div class="text-sm text-gray-600">
                  Variation: {item.variation.color}
                  {#if item.variation.size !== "Standard"}
                    , Size: {item.variation.size}
                  {/if}
                </div>
              </div>
            </div>
            <div class="col-span-2 text-center font-semibold">
              {formatPrice(item.product.price)}
            </div>
            <div class="col-span-2 flex items-center justify-center">
              <button 
                class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-100 hover:bg-gray-200"
                on:click={() => updateQuantity(item, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <input 
                type="number" 
                value={item.quantity}
                min="1" 
                max={item.product.stock}
                on:change={(e) => updateQuantity(item, parseInt(e.currentTarget.value))}
                class="w-12 h-8 text-center border-t border-b border-gray-300"
              />
              <button 
                class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-100 hover:bg-gray-200"
                on:click={() => updateQuantity(item, item.quantity + 1)}
                disabled={item.quantity >= item.product.stock}
              >
                +
              </button>
            </div>
            <div class="col-span-2 flex justify-center">
              <button 
                class="text-red-500 hover:text-red-700"
                on:click={() => confirmRemoveItem(item)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Mobile view (hidden on desktop) -->
          <div class="md:hidden border-b last:border-b-0">
            <div class="flex p-4">
              <div class="flex-shrink-0 pr-4">
                <input 
                  type="checkbox" 
                  checked={item.selected}
                  on:change={() => toggleItemSelection(item)}
                  class="h-5 w-5 rounded border-gray-300 text-[#21463E] focus:ring-[#21463E]"
                />
              </div>
              <div class="flex flex-1">
                <div class="w-20 h-20 overflow-hidden rounded-md mr-3">
                  {#if item.product.image_url}
                    <img 
                      src={item.product.image_url} 
                      alt={item.product.name} 
                      class="w-full h-full object-cover" 
                    />
                  {:else}
                    <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  {/if}
                </div>
                <div class="flex-1 flex flex-col">
                  <h3 class="font-medium text-gray-800">{item.product.name}</h3>
                  <div class="text-sm text-gray-600 mb-2">
                    Variation: {item.variation.color}
                    {#if item.variation.size !== "Standard"}
                      , Size: {item.variation.size}
                    {/if}
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="font-semibold text-[#21463E]">{formatPrice(item.product.price)}</span>
                    <button 
                      class="text-red-500 hover:text-red-700"
                      on:click={() => confirmRemoveItem(item)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Accordion for quantity controls and more details -->
            <div 
              class="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50 cursor-pointer"
              on:click={() => toggleItemExpanded(itemId)}
              on:keydown={(e) => e.key === 'Enter' && toggleItemExpanded(itemId)}
              role="button"
              tabindex="0"
            >
              <span class="text-sm text-gray-600">
                {isItemExpanded(itemId) ? 'Hide details' : 'Show details'}
              </span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class="h-5 w-5 text-gray-500 transform transition-transform {isItemExpanded(itemId) ? 'rotate-180' : ''}" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {#if isItemExpanded(itemId)}
              <div class="p-4 bg-gray-50 border-t border-gray-100">
                <div class="mb-4">
                  <p class="text-gray-700 mb-2">Quantity:</p>
                  <div class="flex items-center">
                    <button 
                      class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-100 hover:bg-gray-200"
                      on:click={() => updateQuantity(item, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      value={item.quantity}
                      min="1" 
                      max={item.product.stock}
                      on:change={(e) => updateQuantity(item, parseInt(e.currentTarget.value))}
                      class="w-12 h-8 text-center border-t border-b border-gray-300"
                    />
                    <button 
                      class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-100 hover:bg-gray-200"
                      on:click={() => updateQuantity(item, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div class="text-sm text-gray-600">
                  <p class="mb-1">Item Total: <span class="font-semibold">{formatPrice(item.product.price * item.quantity)}</span></p>
                  <p>Available Stock: <span class="font-semibold">{item.product.stock} items</span></p>
                </div>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/each}

    <!-- Checkout section - Modified for responsiveness -->
    <div class="bg-white rounded-lg shadow-md bg-yellow-200 border-2 border-yellow-300 p-4 sticky bottom-0 z-10">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex items-center">
          <input 
            type="checkbox" 
            checked={allItemsSelected}
            on:change={toggleAllSelection}
            class="h-5 w-5 mr-4 rounded border-gray-300 text-[#21463E] focus:ring-[#21463E]"
          />
          <button 
            class="text-[#21463E] hover:underline mr-4"
            on:click={toggleAllSelection}
          >
            {allItemsSelected ? 'Deselect All' : 'Select All'}
          </button>
          <span class="text-gray-700 hidden md:inline">
            Selected ({selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'})
          </span>
        </div>
        
        <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
          <div>
            <span class="text-gray-600 mr-2">Total:</span>
            <span class="text-xl font-bold text-[#21463E]">{formatPrice(totalSelectedPrice)}</span>
          </div>
          <button 
            class="w-full md:w-auto px-6 py-2 bg-[#21463E] text-white rounded-md hover:bg-[#143129] disabled:opacity-50 disabled:cursor-not-allowed"
            on:click={() => goto('/page-customer/checkout')}
            disabled={!anyItemSelected}
          >
            Checkout
          </button>
        </div>
      </div>
      
      <!-- Additional mobile-only info -->
      <div class="md:hidden mt-2 text-gray-700">
        Selected ({selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'})
      </div>
    </div>
  {/if}
</div>

<!-- Delete Confirmation Modal -->
<Alerts 
  isVisible={showDeleteConfirmModal}
  type="delete-item"
  on:close={() => showDeleteConfirmModal = false}
  on:confirmDeleteItem={handleConfirmDelete}
/>
