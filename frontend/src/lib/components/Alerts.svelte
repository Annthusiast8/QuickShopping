<script lang="ts">
    import { createEventDispatcher, onMount, afterUpdate } from 'svelte';
    import { goto } from '$app/navigation';
    
    export let isVisible: boolean = false;
    export let cartAdded: string = 'Item added to cart';
    export let autoDismiss: boolean = true;
    export let type: 'success' | 'delete-account' | 'delete-countdown' | 'review-success' | 'error' | 'profile-update' | 'logout-confirm' | 'delete-item' | 'report-success' = 'success';
    export let title: string = '';
    export let itemName: string = '';
    
    const dispatch = createEventDispatcher();
    let dismissTimer: ReturnType<typeof setTimeout> | null = null;
    let password: string = '';
    let countdown: number = 5;
    
    function setupAutoDismiss() {
        if (isVisible && autoDismiss && (type === 'success' || type === 'profile-update' || type === 'report-success')) {
            // Clear any existing timer first
            if (dismissTimer) clearTimeout(dismissTimer);
            
            dismissTimer = setTimeout(() => {
                dispatch('close');
            }, 2000);
        }
    }
    
    onMount(() => {
        setupAutoDismiss();
    });
    
    // This ensures the timer is set up whenever isVisible changes to true
    afterUpdate(() => {
        setupAutoDismiss();
        
        // Start countdown when showing delete countdown or review success
        if (isVisible && (type === 'delete-countdown' || type === 'review-success') && countdown === 5) {
            startCountdown();
        }
    });
    
    // Clean up timer on component destruction
    onMount(() => {
        return () => {
            if (dismissTimer) clearTimeout(dismissTimer);
        };
    });
    
    function closeModal() {
        password = '';
        dispatch('close');
    }
    
    function confirmDelete() {
        dispatch('confirm', { password });
        password = '';
    }
    
    function startCountdown() {
        const countInterval = setInterval(() => {
            countdown -= 1;
            
            if (countdown <= 0) {
                clearInterval(countInterval);
                // Proceed to login page after countdown completes if it's delete-countdown
                if (type === 'delete-countdown') {
                    setTimeout(() => {
                        goto('/login');
                    }, 500);
                } else {
                    // Just close the modal for review-success
                    dispatch('close');
                }
                // Reset countdown for next time
                countdown = 5;
            }
        }, 1000);
        
        // Clean up interval if modal is closed
        return () => clearInterval(countInterval);
    }
    
    function handleBackdropClick(e: MouseEvent) {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    }
    
    function confirmLogout() {
        dispatch('confirmLogout');
    }

    function cancelLogout() {
        dispatch('close');
    }

    function confirmDeleteItem() {
        dispatch('confirmDeleteItem');
    }

    function cancelDeleteItem() {
        dispatch('close');
    }
</script>

{#if isVisible}
    <div 
        class="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50"
        on:click={handleBackdropClick}
    >
        {#if type === 'success' || type === 'profile-update'}
            <div class="bg-black bg-opacity-80 rounded-lg shadow-lg max-w-sm mx-auto text-center p-5 h-[200px] w-[400px] flex flex-col items-center justify-center">
                <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                
                <p class="text-white mb-0">
                    {cartAdded}
                </p>
            </div>
        {:else if type === 'report-success'}
            <div class="bg-black bg-opacity-80 rounded-lg shadow-lg max-w-sm mx-auto text-center p-5 h-[200px] w-[400px] flex flex-col items-center justify-center">
                <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                
                <p class="text-white text-xl font-medium mb-0">
                    Report Submitted Successfully
                </p>
            </div>
        {:else if type === 'review-success'}
            <div class="bg-black bg-opacity-80 rounded-lg shadow-lg max-w-sm mx-auto text-center p-5 h-[200px] w-[400px] flex flex-col items-center justify-center">
                <div class="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span class="text-white text-4xl font-bold">{countdown}</span>
                </div>
                
                <h2 class="text-white text-xl font-bold mb-1">{title}</h2>
                <p class="text-white mb-0">
                    Review has been submitted
                </p>
            </div>
        {:else if type === 'delete-account'}
            <div class="bg-white rounded-lg shadow-lg max-w-sm mx-auto text-center p-5 w-[400px]" on:click|stopPropagation>
                <div class="mb-4 text-center">
                    <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <h2 class="text-xl font-bold mb-1">Deleting account</h2>
                    <p class="text-gray-600 text-sm mb-4">
                        Deleting your account will remove all of your information from our database. This cannot be undone.
                    </p>
                    
                    <div class="mb-4">
                        <label for="password" class="text-sm text-left block mb-1">To confirm, please type your password:</label>
                        <input 
                            type="password" 
                            id="password" 
                            bind:value={password} 
                            placeholder="Your password"
                            class="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                    </div>
                    
                    <div class="flex gap-2">
                        <button 
                            class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                            on:click={closeModal}
                        >
                            Cancel
                        </button>
                        <button 
                            class="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            on:click={confirmDelete}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        {:else if type === 'delete-countdown'}
            <div class="bg-white rounded-lg shadow-lg max-w-sm mx-auto text-center p-5 w-[400px]" on:click|stopPropagation>
                <div class="mb-4 text-center">
                    <div class="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span class="text-white text-4xl font-bold">{countdown}</span>
                    </div>
                    <h2 class="text-xl font-bold mb-1">Account deletion in progress</h2>
                    <p class="text-gray-600 text-sm mb-4">
                        Your account is being deleted. You will be redirected to the login page in {countdown} seconds.
                    </p>
                </div>
            </div>
        {:else if type === 'error'}
            <div class="bg-black bg-opacity-80 rounded-lg shadow-lg max-w-sm mx-auto text-center p-5 h-[200px] w-[400px] flex flex-col items-center justify-center">
                <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                
                <h2 class="text-white text-xl font-bold mb-1">{title}</h2>
                <p class="text-white mb-0">
                    {cartAdded}
                </p>
            </div>
        {:else if type === 'logout-confirm'}
            <div class="bg-white rounded-lg shadow-lg max-w-sm mx-auto text-center p-5 w-[400px]" on:click|stopPropagation>
                <div class="mb-4 text-center">
                    <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    
                    <h2 class="text-xl font-bold mb-2">Logout Confirmation</h2>
                    <p class="text-gray-600 mb-4">
                        Are you sure you want to logout?
                    </p>
                    
                    <div class="flex gap-2">
                        <button 
                            class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                            on:click={cancelLogout}
                        >
                            No
                        </button>
                        <button 
                            class="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            on:click={confirmLogout}
                        >
                            Yes
                        </button>
                    </div>
                </div>
            </div>
        {:else if type === 'delete-item'}
            <div class="bg-white rounded-lg shadow-lg max-w-sm mx-auto text-center p-5 w-[400px]" on:click|stopPropagation>
                <div class="mb-4 text-center">
                    <h2 class="text-xl font-bold mb-4">Are you sure you want to remove this item from your cart?</h2>
                    
                    <div class="flex gap-2">
                        <button 
                            class="flex-1 px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                            on:click={cancelDeleteItem}
                        >
                            Cancel
                        </button>
                        <button 
                            class="flex-1 px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            on:click={confirmDeleteItem}
                        >
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        {/if}
    </div>
{/if} 