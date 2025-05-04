<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    
    export let isVisible: boolean = false;
    export let cartAdded: string = 'Item has been added to your Shopping Cart';
    export let autoDismiss: boolean = true;
    
    const dispatch = createEventDispatcher();
    
    onMount(() => {
        if (isVisible && autoDismiss) {
            const timer = setTimeout(() => {
                dispatch('close');
            }, duration);
            
            return () => clearTimeout(timer);
        }
    });
    
    function closeModal() {
        dispatch('close');
    }
    
    function handleBackdropClick(event: MouseEvent) {
        if (event.target === event.currentTarget) {
            closeModal();
        }
    }
</script>

{#if isVisible}
    <div 
        class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
        on:click={handleBackdropClick}
    >
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
    </div>
{/if} 