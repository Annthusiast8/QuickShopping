import { writable, get } from 'svelte/store';
import { api } from '$lib/services/api.js';
import { mockReviews } from '$lib/mock/data';

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  user_name: string;
  user_image: string;
  rating: number;
  comment: string;
  created_at: string;
  images: string[];
}

function createReviewStore() {
  const store = writable<{
    reviews: Review[];
    loading: boolean;
    error: string | null;
  }>({
    reviews: [...mockReviews], // Initialize with mock data
    loading: false,
    error: null
  });
  
  const { subscribe, set, update } = store;

  return {
    subscribe,

    // Add a new review
    addReview: async (review: Omit<Review, 'id' | 'created_at'>) => {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        // In a real app, this would be an API call
        // For now, we'll mock the API response
        
        const newReview: Review = {
          ...review,
          id: Math.floor(Math.random() * 1000) + 10, // Generate random ID
          created_at: new Date().toISOString().split('T')[0], // Today's date
        };
        
        // Add to the store
        update(state => ({
          ...state,
          reviews: [...state.reviews, newReview],
          loading: false
        }));
        
        return { success: true, review: newReview };
      } catch (err: any) {
        update(state => ({
          ...state,
          error: err.message || 'Error adding review',
          loading: false
        }));
        throw err;
      }
    },

    // Get reviews for a specific product
    getProductReviews: (productId: number) => {
      const state = get(store);
      return state.reviews.filter(review => review.product_id === productId);
    },

    // Reset store state
    reset: () => {
      set({
        reviews: [...mockReviews],
        loading: false,
        error: null
      });
    }
  };
}

export const reviewStore = createReviewStore(); 