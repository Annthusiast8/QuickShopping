<script lang="ts">
  import { profileStore, type Profile } from '$lib/stores/profile';
  
  // Reactive declarations
  const profile = $derived($profileStore.profile);
  const loading = $derived($profileStore.loading);
  
  // Form state
  let formData = {
    name: '',
    email: '',
    phone: '',
    bio: ''
  };
  
  // Update formData when profile changes
  $effect(() => {
    if (profile) {
      formData = {
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        bio: profile.bio || ''
      };
    }
  });
  
  let isEditing = false;
  let isSaving = false;
  
  // Toggle edit mode
  function toggleEdit() {
    isEditing = !isEditing;
    if (!isEditing) {
      // Reset form data when canceling
      formData = {
        name: profile?.name || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        bio: profile?.bio || ''
      };
    }
  }
  
  // Save profile changes
  async function saveProfile() {
    isSaving = true;
    
    try {
      const success = await profileStore.updateProfile(formData);
      if (success) {
        isEditing = false;
      }
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <h2 class="text-lg font-medium text-gray-900">Personal Information</h2>
    {#if !isEditing}
      <button 
        on:click={toggleEdit}
        type="button" 
        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#21463E]"
      >
        <svg class="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Edit
      </button>
    {/if}
  </div>

  {#if loading && !profile}
    <div class="flex justify-center py-6">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#21463E]"></div>
    </div>
  {:else}
    <div class="bg-white overflow-hidden">
      {#if isEditing}
        <form on:submit|preventDefault={saveProfile} class="space-y-4">
          <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div class="sm:col-span-3">
              <label for="name" class="block text-sm font-medium text-gray-700">Full name</label>
              <div class="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  bind:value={formData.name}
                  class="shadow-sm focus:ring-[#21463E] focus:border-[#21463E] block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div class="sm:col-span-3">
              <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
              <div class="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  bind:value={formData.email}
                  class="shadow-sm focus:ring-[#21463E] focus:border-[#21463E] block w-full sm:text-sm border-gray-300 rounded-md"
                  readonly
                />
                <p class="mt-1 text-xs text-gray-500">Email cannot be changed for security reasons.</p>
              </div>
            </div>

            <div class="sm:col-span-3">
              <label for="phone" class="block text-sm font-medium text-gray-700">Phone number</label>
              <div class="mt-1">
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  bind:value={formData.phone}
                  class="shadow-sm focus:ring-[#21463E] focus:border-[#21463E] block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div class="sm:col-span-6">
              <label for="bio" class="block text-sm font-medium text-gray-700">About</label>
              <div class="mt-1">
                <textarea
                  id="bio"
                  name="bio"
                  rows="3"
                  bind:value={formData.bio}
                  class="shadow-sm focus:ring-[#21463E] focus:border-[#21463E] block w-full sm:text-sm border-gray-300 rounded-md"
                ></textarea>
                <p class="mt-2 text-sm text-gray-500">Brief description for your profile.</p>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-5">
            <button
              type="button"
              on:click={toggleEdit}
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
      {:else}
        <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Full name</dt>
            <dd class="mt-1 text-sm text-gray-900">{profile?.name || 'Not provided'}</dd>
          </div>
          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Email address</dt>
            <dd class="mt-1 text-sm text-gray-900">{profile?.email || 'Not provided'}</dd>
          </div>
          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Phone number</dt>
            <dd class="mt-1 text-sm text-gray-900">{profile?.phone || 'Not provided'}</dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-sm font-medium text-gray-500">About</dt>
            <dd class="mt-1 text-sm text-gray-900">{profile?.bio || 'No bio information provided'}</dd>
          </div>
        </dl>
      {/if}
    </div>
  {/if}
</div> 