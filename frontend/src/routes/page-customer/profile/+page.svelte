<script lang="ts">
  import { onMount } from 'svelte';
  import { profileStore } from '$lib/stores/profile';
  import ProfileInfo from './ProfileInfo.svelte';
  import AddressManager from './AddressManager.svelte';
  
  // Reactive declarations using runes
  const profile = $derived($profileStore.profile);
  const loading = $derived($profileStore.loading);
  const error = $derived($profileStore.error);
  
  // Tab management
  const tabs = [
    { id: 'personal', label: 'Personal Information' },
    { id: 'addresses', label: 'Addresses' },
    { id: 'security', label: 'Security' }
  ];
  
  let activeTab = 'personal';
  
  function setActiveTab(tabId: string) {
    activeTab = tabId;
  }
  
  // Fetch profile on mount
  onMount(() => {
    profileStore.fetchProfile();
  });
</script>

<div>
  <div class="sm:flex sm:items-center sm:justify-between mb-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">My Profile</h1>
      <p class="mt-1 text-sm text-gray-500">Manage your account details and preferences</p>
    </div>
  </div>

  {#if error}
    <div class="rounded-md bg-red-50 p-4 mb-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{error}</p>
          </div>
        </div>
        <div class="ml-auto pl-3">
          <div class="-mx-1.5 -my-1.5">
            <button 
              type="button" 
              on:click={() => profileStore.clearError()}
              class="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
            >
              <span class="sr-only">Dismiss</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if loading && !profile}
    <div class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#21463E]"></div>
    </div>
  {:else}
    <!-- Tab navigation -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        {#each tabs as tab}
          <button
            on:click={() => setActiveTab(tab.id)}
            class={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-[#21463E] text-[#21463E]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        {/each}
      </nav>
    </div>

    <!-- Tab content -->
    <div class="bg-white shadow rounded-lg p-6">
      {#if activeTab === 'personal'}
        <ProfileInfo />
      {:else if activeTab === 'addresses'}
        <AddressManager />
      {:else if activeTab === 'security'}
        <div class="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Security settings coming soon</h3>
          <p class="mt-1 text-sm text-gray-500">This feature is currently under development.</p>
        </div>
      {/if}
    </div>
  {/if}
</div> 