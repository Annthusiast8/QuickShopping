import { writable } from 'svelte/store';
import { api } from '../services/api';
import type { ReviewData } from '../services/api';

interface ReviewsState {
    reviews: any[];
    selectedReview: any | null;
    loading: boolean;
    error: string | null;
}

function createReviewsStore() {
    const { subscribe, set, update } = writable<ReviewsState>({
        reviews: [],
        selectedReview: null,
        loading: false,
        error: null
    });

    return {
        subscribe,
        addReview: async (itemId: number, reviewData: ReviewData) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.addReview(itemId, reviewData);
                update(state => ({ ...state, loading: false }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to add review'
                }));
                throw error;
            }
        },
        updateReview: async (reviewId: number, reviewData: Partial<ReviewData>) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.updateReview(reviewId, reviewData);
                update(state => ({ ...state, loading: false }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to update review'
                }));
                throw error;
            }
        },
        deleteReview: async (reviewId: number) => {
            update(state => ({ ...state, loading: true, error: null }));
            try {
                const response = await api.deleteReview(reviewId);
                update(state => ({ ...state, loading: false }));
                return response;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to delete review'
                }));
                throw error;
            }
        },
        clearSelected: () => {
            update(state => ({ ...state, selectedReview: null }));
        }
    };
}

export const reviews = createReviewsStore(); 