<script lang="ts">
  import { onMount } from 'svelte';
  import { seller } from '$lib/stores/seller';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import Header from '$lib/header.svelte';
  import Alerts from '$lib/components/Alerts.svelte';
  import type { BusinessProfileData } from '$lib/services/api';

  // Form state
  let profileForm: BusinessProfileData = {
    name: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    logo: undefined
  };

  // UI state
  let isEditing = false;
  let logoPreview: string | null = null;
  let showAlert = false;
  let alertType: 'success' | 'error' | 'delete-account' | 'delete-countdown' | 'review-success' | 'profile-update' | 'logout-confirm' | 'delete-item' | 'report-success' = 'success';
  let alertMessage = '';

  // Form validation
  let errors: Record<string, string> = {};

  // Delete account modal state
  let showDeleteModal = false;
  let deletePassword = '';
  let deleteError = '';
  let deleteCountdown = 0;
  let deleteCountdownInterval: number | null = null;

  // Initialize the profile data when the component mounts
  onMount(() => {
    // Use IIFE for async operations to avoid returning a Promise
    (async () => {
      // Redirect to login if not authenticated
      if (!$auth.user) {
        goto('/login?redirect=/page-seller/profile');
        return;
      }

      // If profile is already loaded in the store, use it
      if ($seller.profile) {
        initializeFormFromProfile();
      } else {
        // Otherwise load the profile from the API
        try {
          await seller.loadProfile();
          initializeFormFromProfile();
        } catch (error) {
          showErrorAlert('Failed to load profile. Please try again.');
        }
      }
    })();
  });

  // Helper function to initialize the form from the profile data
  function initializeFormFromProfile() {
    if (!$seller.profile) return;
    
    profileForm = {
      name: $seller.profile.business_name || '',
      description: $seller.profile.description || '',
      contact_email: $seller.profile.contact_email || '',
      contact_phone: $seller.profile.contact_phone || '',
      address: $seller.profile.address || '',
      logo: undefined
    };
    
    if ($seller.profile.logo_url) {
      logoPreview = $seller.profile.logo_url;
    }
  }

  // Toggle edit mode
  function toggleEdit() {
    isEditing = !isEditing;
    if (!isEditing) {
      // Reset form to current profile values when canceling edit
      initializeFormFromProfile();
      // Reset any errors
      errors = {};
    }
  }

  // Validate the form before submission
  function validateForm(): boolean {
    errors = {};
    
    if (!profileForm.name?.trim()) {
      errors.name = 'Business name is required';
    }
    
    if (!profileForm.contact_email?.trim()) {
      errors.contact_email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(profileForm.contact_email)) {
      errors.contact_email = 'Please enter a valid email address';
    }
    
    if (profileForm.contact_phone && !/^\d{10,15}$/.test(profileForm.contact_phone.replace(/[\s-]/g, ''))) {
      errors.contact_phone = 'Please enter a valid phone number';
    }
    
    return Object.keys(errors).length === 0;
  }

  // Save the profile changes
  async function saveProfile() {
    if (!validateForm()) return;
    
    try {
      await seller.updateProfile(profileForm);
      isEditing = false;
      showSuccessAlert('Profile updated successfully!');
      
      // Reset the logo file after successful update
      profileForm.logo = undefined;
    } catch (error) {
      showErrorAlert('Failed to update profile. Please try again.');
    }
  }

  // Handle logo file upload
  function handleLogoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type and size
      if (!file.type.match('image.*')) {
        errors.logo = 'Please select an image file';
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        errors.logo = 'Image size should be less than 5MB';
        return;
      }
      
      // Set the file to the form data
      profileForm.logo = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        logoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      
      // Clear any previous errors
      delete errors.logo;
    }
  }

  // Open the delete account modal
  function openDeleteModal() {
    showDeleteModal = true;
    deletePassword = '';
    deleteError = '';
  }

  // Close the delete account modal
  function closeDeleteModal() {
    showDeleteModal = false;
    deletePassword = '';
    deleteError = '';
    
    // Clear any countdown if active
    if (deleteCountdownInterval) {
      clearInterval(deleteCountdownInterval);
      deleteCountdownInterval = null;
    }
    deleteCountdown = 0;
  }

  // Start the countdown for account deletion
  function startDeleteCountdown() {
    if (!deletePassword) {
      deleteError = 'Please enter your password';
      return;
    }
    
    deleteError = '';
    deleteCountdown = 5;
    
    if (deleteCountdownInterval) {
      clearInterval(deleteCountdownInterval);
    }
    
    showAlert = true;
    alertType = 'delete-countdown';
    alertMessage = 'Your account will be permanently deleted in 5 seconds. Click Cancel to abort.';
    
    deleteCountdownInterval = setInterval(() => {
      deleteCountdown--;
      alertMessage = `Your account will be permanently deleted in ${deleteCountdown} seconds. Click Cancel to abort.`;
      
      if (deleteCountdown <= 0) {
        if (deleteCountdownInterval) {
          clearInterval(deleteCountdownInterval);
          deleteCountdownInterval = null;
        }
        deleteAccount();
      }
    }, 1000) as unknown as number;
  }

  // Cancel the delete countdown
  function cancelDeleteCountdown() {
    if (deleteCountdownInterval) {
      clearInterval(deleteCountdownInterval);
      deleteCountdownInterval = null;
    }
    deleteCountdown = 0;
    showAlert = false;
    closeDeleteModal();
  }

  // Delete the account
  async function deleteAccount() {
    if (deleteCountdownInterval) {
      clearInterval(deleteCountdownInterval);
      deleteCountdownInterval = null;
    }
    
    try {
      await auth.deleteAccount(deletePassword);
      showAlert = true;
      alertType = 'delete-account';
      alertMessage = 'Your account has been deleted. You will be redirected to the homepage.';
      setTimeout(() => {
        goto('/');
      }, 3000);
    } catch (error) {
      deleteError = 'Failed to delete account. Please check your password and try again.';
      showAlert = false;
    } finally {
      closeDeleteModal();
    }
  }

  // Helper function to show error alerts
  function showErrorAlert(message: string) {
    showAlert = true;
    alertType = 'error';
    alertMessage = message;
  }

  // Helper function to show success alerts
  function showSuccessAlert(message: string) {
    showAlert = true;
    alertType = 'profile-update';
    alertMessage = message;
  }

  // Close the alert
  function closeAlert() {
    showAlert = false;
  }
</script>

<Header />

<!-- Delete Account Modal -->
{#if showDeleteModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
    <div class="bg-white rounded-lg p-6 w-96">
      <h3 class="text-xl font-semibold mb-4">Delete Account</h3>
      <p class="text-gray-600 mb-4">Please enter your password to confirm account deletion. This action cannot be undone.</p>
      
      <div class="mb-4">
        <label for="delete-password" class="sr-only">Password</label>
        <input
          id="delete-password"
          type="password"
          bind:value={deletePassword}
          placeholder="Enter your password"
          class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#7da6c7]"
        />
        {#if deleteError}
          <p class="text-red-500 text-sm mt-1">{deleteError}</p>
        {/if}
      </div>

      <div class="flex justify-end gap-3">
        <button
          type="button"
          on:click={closeDeleteModal}
          class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
        >
          Cancel
        </button>
        <button
          type="button"
          on:click={startDeleteCountdown}
          class="px-4 py-2 bg-[#ed3324] text-white rounded hover:bg-[#c82333] transition-colors"
        >
          Delete Account
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Profile Card -->
<div class="max-w-2xl mx-auto mt-8 bg-white rounded-2xl shadow-lg flex flex-col items-center pb-8 px-8">
  {#if $seller.loading && !$seller.profile}
    <div class="w-full py-16 flex justify-center items-center">
      <svg class="animate-spin h-10 w-10 text-[#7da6c7]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  {:else}
    <!-- Header with logo upload -->
    <div class="w-full h-24 bg-[#7da6c7] rounded-t-2xl flex justify-center relative">
      <div class="w-24 h-24 rounded-full border-4 border-white absolute left-1/2 -bottom-12 -translate-x-1/2 bg-white overflow-hidden">
        {#if logoPreview}
          <img src={logoPreview} alt="Business Logo" class="w-full h-full object-cover" />
        {:else}
          <div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-4xl font-bold">
            {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : 'B'}
          </div>
        {/if}
        
        {#if isEditing}
          <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
            <label for="logo-upload" class="text-white text-xs font-medium cursor-pointer">
              Change Logo
              <input 
                id="logo-upload" 
                type="file" 
                accept="image/*" 
                on:change={handleLogoChange} 
                class="hidden" 
              />
            </label>
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Form fields -->
    <div class="w-full flex flex-col gap-4 mt-16">
      {#if $seller.profile}
        
        <!-- Approval Status Banner -->
        {#if !$seller.profile.is_approved}
          <div class="w-full p-4 mb-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-md">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-amber-800">Business Approval Pending</h3>
                <div class="mt-2 text-sm text-amber-700">
                  <p>Your business profile is currently under review by our admin team. Once approved, you'll be able to:</p>
                  <ul class="list-disc pl-5 mt-1 space-y-1">
                    <li>Add and manage products</li>
                    <li>Receive and process orders</li>
                    <li>Access all seller features</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        {/if}
        <div class="flex justify-between items-center mb-2">
          <h2 class="text-xl font-semibold text-gray-800">Business Profile</h2>
          {#if !isEditing}
            <button 
              type="button" 
              on:click={toggleEdit} 
              class="text-[#7da6c7] hover:text-[#2b4b66] flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Profile
            </button>
          {/if}
        </div>
        
        <div class="flex items-center gap-2 mb-4">
          <label for="business_name" class="flex-1 font-medium text-gray-700">Business Name</label>
          <input 
            type="text" 
            id="business_name" 
            bind:value={profileForm.name}
            class="flex-[3] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 {errors.name ? 'border-red-500' : 'border-gray-300'}"
            placeholder="Your business name"
            disabled={!isEditing}
          />
        </div>
        {#if errors.name}
          <p class="text-red-500 text-sm mb-4 ml-auto w-3/4">{errors.name}</p>
        {/if}
        
        <div class="flex items-start gap-2">
          <label for="business-description" class="flex-1 font-medium text-gray-700 pt-2">Description</label>
          <textarea 
            id="business-description"
            class="w-full bg-[#f9f6ef] rounded px-3 py-2 text-gray-700 text-sm border ${errors.description ? 'border-red-500' : 'border-transparent'}" 
            rows="3" 
            bind:value={profileForm.description} 
            readonly={!isEditing}
            placeholder={isEditing ? 'Describe your business...' : 'No description provided'}
          ></textarea>
          {#if errors.description}
            <p class="text-red-500 text-xs mt-1">{errors.description}</p>
          {/if}
        </div>
        
        <div class="flex items-center gap-2">
          <label for="contact-email" class="flex-1 font-medium text-gray-700">Contact Email</label>
          <input 
            id="contact-email"
            class="w-full bg-[#f9f6ef] rounded px-3 py-2 text-gray-700 text-sm border ${errors.contact_email ? 'border-red-500' : 'border-transparent'}" 
            type="email" 
            bind:value={profileForm.contact_email} 
            readonly={!isEditing} 
          />
          {#if errors.contact_email}
            <p class="text-red-500 text-xs mt-1">{errors.contact_email}</p>
          {/if}
        </div>
        
        <div class="flex items-center gap-2">
          <label for="contact-phone" class="flex-1 font-medium text-gray-700">Contact Phone</label>
          <input 
            id="contact-phone"
            class="w-full bg-[#f9f6ef] rounded px-3 py-2 text-gray-700 text-sm border ${errors.contact_phone ? 'border-red-500' : 'border-transparent'}" 
            type="tel" 
            bind:value={profileForm.contact_phone} 
            readonly={!isEditing} 
            placeholder={isEditing ? 'Enter phone number' : 'No phone provided'}
          />
          {#if errors.contact_phone}
            <p class="text-red-500 text-xs mt-1">{errors.contact_phone}</p>
          {/if}
        </div>
        
        <div class="flex items-center gap-2">
          <label for="business-address" class="flex-1 font-medium text-gray-700">Business Address</label>
          <input 
            id="business-address"
            class="w-full bg-[#f9f6ef] rounded px-3 py-2 text-gray-700 text-sm border ${errors.address ? 'border-red-500' : 'border-transparent'}" 
            type="text" 
            bind:value={profileForm.address} 
            readonly={!isEditing} 
            placeholder={isEditing ? 'Enter business address' : 'No address provided'}
          />
          {#if errors.address}
            <p class="text-red-500 text-xs mt-1">{errors.address}</p>
          {/if}
        </div>
        
        <div class="flex items-center gap-2">
          <label class="flex-1 font-medium text-gray-700">Approval Status</label>
          <span class="${$seller.profile.is_approved ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'} rounded px-4 py-1 font-semibold text-sm">
            {$seller.profile.is_approved ? 'Approved' : 'Pending Approval'}
          </span>
        </div>
        
        {#if isEditing}
          <div class="flex gap-3 mt-4">
            <button 
              type="button"
              on:click={toggleEdit} 
              class="flex-1 bg-gray-200 text-gray-800 rounded font-semibold py-2 hover:bg-gray-300 transition"
              disabled={$seller.loading}
            >
              Cancel
            </button>
            <button 
              type="button"
              on:click={saveProfile} 
              class="flex-1 bg-[#7da6c7] text-white rounded font-semibold py-2 hover:bg-[#5a89af] transition disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={$seller.loading}
            >
              Save Changes
            </button>
          </div>
        {:else}
          <button 
            type="button"
            on:click={openDeleteModal}
            class="bg-[#ed3324] text-white rounded font-semibold py-2 mt-2 hover:bg-[#c82333] transition flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Account
          </button>
        {/if}
      {/if}
    </div>
  {/if}
</div>

<Alerts 
  isVisible={showAlert}
  type={alertType}
  title={alertType === 'success' || alertType === 'profile-update' ? 'Success' : 
         alertType === 'error' ? 'Error' : 
         alertType === 'delete-account' ? 'Account Deleted' : 
         alertType === 'delete-countdown' ? 'Confirm Deletion' : 'Notification'}
  cartAdded={alertType === 'delete-countdown' ? `Deleting account in ${deleteCountdown} seconds...` : alertMessage}
  autoDismiss={alertType !== 'delete-countdown'}
  on:close={() => {
    if (alertType === 'delete-countdown') {
      cancelDeleteCountdown();
    } else {
      showAlert = false;
    }
  }}
/>

<!-- Display error from seller store if present -->
{#if $seller.error}
  <div class="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
    <span class="block sm:inline">{$seller.error}</span>
    <button class="absolute top-0 right-0 px-4 py-3" on:click={() => seller.clearError()}>
      <span class="sr-only">Close</span>
      <svg class="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
    </button>
  </div>
{/if}

<style>
  .animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
