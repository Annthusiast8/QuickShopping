import { writable, get } from 'svelte/store';
import type { Product } from './products';

export interface CartItem {
  product: Product;
  quantity: number;
  variation: {
    color: string;
    size: string | number;
  };
  selected: boolean;
}

export interface StoreCart {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

function createCartStore() {
  // Initialize from localStorage if available
  const storedCart = typeof window !== 'undefined' ? 
    localStorage.getItem('quickShoppingCart') : null;
  
  const initialState: StoreCart = storedCart ? 
    JSON.parse(storedCart) : 
    {
      items: [],
      loading: false,
      error: null
    };

  const { subscribe, set, update } = writable<StoreCart>(initialState);

  // Save to localStorage whenever cart changes
  subscribe(cart => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('quickShoppingCart', JSON.stringify(cart));
    }
  });

  return {
    subscribe,

    // Add item to cart
    addItem: (cartItem: CartItem) => {
      update(state => {
        // Check if this product with same variation exists
        const existingItemIndex = state.items.findIndex(item => 
          item.product.id === cartItem.product.id && 
          item.variation.color === cartItem.variation.color &&
          item.variation.size === cartItem.variation.size
        );

        if (existingItemIndex !== -1) {
          // Update existing item quantity
          const updatedItems = [...state.items];
          updatedItems[existingItemIndex].quantity += cartItem.quantity;
          
          return {
            ...state,
            items: updatedItems
          };
        } else {
          // Add new item
          return {
            ...state,
            items: [...state.items, { ...cartItem, selected: true }]
          };
        }
      });
    },

    // Remove item from cart
    removeItem: (productId: number, color: string, size: string | number) => {
      update(state => ({
        ...state,
        items: state.items.filter(item => 
          !(item.product.id === productId && 
            item.variation.color === color && 
            item.variation.size === size)
        )
      }));
    },

    // Update item quantity
    updateQuantity: (productId: number, color: string, size: string | number, quantity: number) => {
      update(state => ({
        ...state,
        items: state.items.map(item => 
          (item.product.id === productId && 
           item.variation.color === color && 
           item.variation.size === size) 
            ? { ...item, quantity } 
            : item
        )
      }));
    },

    // Toggle item selection
    toggleSelection: (productId: number, color: string, size: string | number) => {
      update(state => ({
        ...state,
        items: state.items.map(item => 
          (item.product.id === productId && 
           item.variation.color === color && 
           item.variation.size === size) 
            ? { ...item, selected: !item.selected } 
            : item
        )
      }));
    },

    // Toggle seller items selection 
    toggleSellerSelection: (sellerId: number, selected: boolean) => {
      update(state => ({
        ...state,
        items: state.items.map(item => 
          item.product.seller_id === sellerId 
            ? { ...item, selected } 
            : item
        )
      }));
    },

    // Toggle all items selection
    toggleAllSelection: (selected: boolean) => {
      update(state => ({
        ...state,
        items: state.items.map(item => ({ ...item, selected }))
      }));
    },

    // Get selected items
    getSelectedItems: () => {
      const cart = get({ subscribe });
      return cart.items.filter(item => item.selected);
    },

    // Clear cart
    clearCart: () => {
      set({
        items: [],
        loading: false,
        error: null
      });
    }
  };
}

export const cartStore = createCartStore();
