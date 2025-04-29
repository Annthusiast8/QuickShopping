<script lang="ts">
  import { profileStore, type Address } from '$lib/stores/profile';
  
  // Reactive declarations
  const profile:any = $derived($profileStore.profile);
  const loading:any= $derived($profileStore.loading);
  
  // Form state for adding/editing address
  let addressForm: Address = {
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    is_default: false
  };
  
  let isAddingAddress = false;
  let isEditingAddress = false;
  let editingAddressId: number | null = null;
  let isSaving = false;
  
  // Available countries (simplified list)
  const countries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'Germany',
    'France',
    'India',
    'Japan',
    'China',
    'Brazil'
  ];
  
  // Start adding a new address
  function startAddAddress() {
    resetAddressForm();
    isAddingAddress = true;
    isEditingAddress = false;
    editingAddressId = null;
  }
  
  // Start editing an existing address
  function startEditAddress(address: Address) {
    if (!address.id) return;
    
    addressForm = { ...address };
    isAddingAddress = false;
    isEditingAddress = true;
    editingAddressId = address.id;
  }
  
  // Reset the address form
  function resetAddressForm() {
    addressForm = {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      is_default: false
    };
  }
  
  // Cancel address form
  function cancelAddressForm() {
    isAddingAddress = false;
    isEditingAddress = false;
    editingAddressId = null;
    resetAddressForm();
  }
  
  // Save address (add or update)
  async function saveAddress() {
    isSaving = true;
    
    try {
      let success = false;
      
      if (isEditingAddress && editingAddressId) {
        success = await profileStore.updateAddress(editingAddressId, addressForm);
      } else if (isAddingAddress) {
        success = await profileStore.addAddress(addressForm);
      }
      
      if (success) {
        isAddingAddress = false;
        isEditingAddress = false;
        editingAddressId = null;
        resetAddressForm();
      }
    } finally {
      isSaving = false;
    }
  }
  
  // Delete an address
  async function deleteAddress(addressId: number) {
    if (confirm('Are you sure you want to delete this address?')) {
      await profileStore.deleteAddress(addressId);
    }
  }
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h2 class="text-lg font-medium text-gray-900">Addresses</h2>
    {#if !isAddingAddress && !isEditingAddress}
      <button 
        on:click={startAddAddress}
        type="button" 
        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#21463E]"
      >
        <svg class="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Address
      </button>
    {/if}
  </div>

  {#if loading && !profile}
    <div class="flex justify-center py-6">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#21463E]"></div>
    </div>
  {:else}
    <!-- Address Form (Add/Edit) -->
    {#if isAddingAddress || isEditingAddress}
      <div class="bg-white overflow-hidden border border-gray-200 rounded-md p-4">
        <h3 class="text-base font-medium text-gray-900 mb-4">
          {isAddingAddress ? 'Add New Address' : 'Edit Address'}
        </h3>
        
        <form on:submit|preventDefault={saveAddress} class="space-y-4">
          <div class="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
            <div class="sm:col-span-6">
              <label for="street" class="block text-sm font-medium text-gray-700">Street address</label>
              <div class="mt-1">
                <input
                  type="text"
                  name="street"
                  id="street"
                  bind:value={addressForm.street}
                  required
                  class="shadow-sm focus:ring-[#21463E] focus:border-[#21463E] block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div class="sm:col-span-2">
              <label for="city" class="block text-sm font-medium text-gray-700">City</label>
              <div class="mt-1">
                <input
                  type="text"
                  name="city"
                  id="city"
                  bind:value={addressForm.city}
                  required
                  class="shadow-sm focus:ring-[#21463E] focus:border-[#21463E] block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div class="sm:col-span-2">
              <label for="state" class="block text-sm font-medium text-gray-700">State / Province</label>
              <div class="mt-1">
                <input
                  type="text"
                  name="state"
                  id="state"
                  bind:value={addressForm.state}
                  required
                  class="shadow-sm focus:ring-[#21463E] focus:border-[#21463E] block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div class="sm:col-span-2">
              <label for="postal_code" class="block text-sm font-medium text-gray-700">ZIP / Postal code</label>
              <div class="mt-1">
                <input
                  type="text"
                  name="postal_code"
                  id="postal_code"
                  bind:value={addressForm.postal_code}
                  required
                  class="shadow-sm focus:ring-[#21463E] focus:border-[#21463E] block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div class="sm:col-span-4">
              <label for="country" class="block text-sm font-medium text-gray-700">Country</label>
              <div class="mt-1">
                <select
                  id="country"
                  name="country"
                  bind:value={addressForm.country}
                  required
                  class="shadow-sm focus:ring-[#21463E] focus:border-[#21463E] block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Select a country</option>
                  {#each countries as country}
                    <option value={country}>{country}</option>
                  {/each}
                </select>
              </div>
            </div>
            
            <div class="sm:col-span-6">
              <div class="flex items-start">
                <div class="flex items-center h-5">
                  <input
                    id="is_default"
                    name="is_default"
                    type="checkbox"
                    bind:checked={addressForm.is_default}
                    class="focus:ring-[#21463E] h-4 w-4 text-[#21463E] border-gray-300 rounded"
                  />
                </div>
                <div class="ml-3 text-sm">
                  <label for="is_default" class="font-medium text-gray-700">Set as default address</label>
                  <p class="text-gray-500">This address will be used as the shipping address by default.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-5">
            <button
              type="button"
              on:click={cancelAddressForm}
              class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#21463E]"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#21463E] hover:bg-[#143129] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#21463E]"
              disabled={isSaving}
            >
              {#if isSaving}
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              {:else}
                Save
              {/if}
            </button>
          </div>
        </form>
      </div>
    {/if}

    <!-- Address List -->
    <div class="bg-white overflow-hidden">
      {#if profile?.addresses?.length > 0}
        <ul class="divide-y divide-gray-200">
          {#each profile.addresses as address (address.id)}
            <li class="px-4 py-4 sm:px-0">
              <div class="flex items-start justify-between">
                <div class="flex-grow">
                  <div class="flex items-center">
                    <h4 class="text-sm font-medium text-gray-900">
                      {address.street}
                      {#if address.is_default}
                        <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Default
                        </span>
                      {/if}
                    </h4>
                  </div>
                  <p class="mt-1 text-sm text-gray-500">
                    {address.city}, {address.state} {address.postal_code}<br>
                    {address.country}
                  </p>
                </div>
                <div class="ml-4 flex-shrink-0 flex space-x-2">
                  <button
                    type="button"
                    on:click={() => startEditAddress(address)}
                    class="text-[#21463E] hover:text-[#143129] text-sm font-medium"
                  >
                    Edit
                  </button>
                  <span class="text-gray-300">|</span>
                  <button
                    type="button"
                    on:click={() => deleteAddress(address.id!)}
                    class="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          {/each}
        </ul>
      {:else}
        <div class="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No addresses</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by adding a new address.</p>
          <div class="mt-6">
            <button
              type="button"
              on:click={startAddAddress}
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#21463E] hover:bg-[#143129] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#21463E]"
            >
              <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Address
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div> 