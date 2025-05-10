<script lang="ts">
  // --- DUMMY DATA SECTION ---
  // Replace these with actual API calls or store subscriptions when backend is ready
  let storeName = "QuickBuy";
  let email = "quickbuy@gmail.com";
  let phone = "0990909090";
  let address = "blank@gmail.com";
  let verified = true;
  // --- END DUMMY DATA SECTION ---

  // --- BACKEND INTEGRATION SECTION ---
  // Fetch/store/update logic should go here in the future
  // --- END BACKEND INTEGRATION SECTION ---

  import Header from '$lib/header.svelte';

  // Delete account modal state
  let showDeleteModal = false;
  let deletePassword = '';
  let deleteError = '';

  function openDeleteModal() {
    showDeleteModal = true;
    deletePassword = '';
    deleteError = '';
  }

  function closeDeleteModal() {
    showDeleteModal = false;
    deletePassword = '';
    deleteError = '';
  }

  async function confirmDelete() {
    if (!deletePassword) {
      deleteError = 'Please enter your password';
      return;
    }

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/seller/delete', {
      //   method: 'POST',
      //   body: JSON.stringify({ password: deletePassword })
      // });
      
      // if (!response.ok) throw new Error('Invalid password');
      
      // Handle successful deletion (e.g., redirect to logout)
      window.location.href = '/logout';
    } catch (error) {
      deleteError = 'Invalid password';
    }
  }
</script>

<Header />

<!-- Delete Account Modal -->
{#if showDeleteModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-96">
      <h3 class="text-xl font-semibold mb-4">Delete Account</h3>
      <p class="text-gray-600 mb-4">Please enter your password to confirm account deletion. This action cannot be undone.</p>
      
      <div class="mb-4">
        <input
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
          on:click={closeDeleteModal}
          class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
        >
          Cancel
        </button>
        <button
          on:click={confirmDelete}
          class="px-4 py-2 bg-[#ed3324] text-white rounded hover:bg-[#c82333]"
        >
          Delete Account
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Profile Card with small blue header -->
<div class="max-w-md mx-auto mt-24 bg-white rounded-2xl shadow-lg flex flex-col items-center pb-8 px-8">
  <!-- Small blue header background -->
  <div class="w-full h-20 bg-[#7da6c7] rounded-t-2xl flex justify-center relative">
    <img
      class="w-20 h-20 rounded-full border-4 border-white absolute left-1/2 -bottom-10 -translate-x-1/2 bg-white object-cover"
      src="/briar-lol-game-4k-wallpaper-uhdpaper.com-899@1@l.jpg"
      alt="Profile"
    />
  </div>
  <div class="w-full flex flex-col gap-4 mt-14">
    <div class="flex items-center gap-2">
      <label class="flex-1 font-medium text-gray-700">Store Name</label>
      <input class="flex-2 bg-[#f9f6ef] rounded px-3 py-2 text-gray-700 text-sm w-full" type="text" bind:value={storeName} readonly />
      <span class="ml-2 text-gray-400 cursor-pointer text-lg">✎</span>
    </div>
    <div class="flex items-center gap-2">
      <label class="flex-1 font-medium text-gray-700">Email</label>
      <input class="flex-2 bg-[#f9f6ef] rounded px-3 py-2 text-gray-700 text-sm w-full" type="email" bind:value={email} readonly />
      <span class="ml-2 text-gray-400 cursor-pointer text-lg">✎</span>
    </div>
    <div class="flex items-center gap-2">
      <label class="flex-1 font-medium text-gray-700">Seller Phone</label>
      <input class="flex-2 bg-[#f9f6ef] rounded px-3 py-2 text-gray-700 text-sm w-full" type="text" bind:value={phone} readonly />
      <span class="ml-2 text-gray-400 cursor-pointer text-lg">✎</span>
    </div>
    <div class="flex items-center gap-2">
      <label class="flex-1 font-medium text-gray-700">Store Address</label>
      <input class="flex-2 bg-[#f9f6ef] rounded px-3 py-2 text-gray-700 text-sm w-full" type="text" bind:value={address} readonly />
      <span class="ml-2 text-gray-400 cursor-pointer text-lg">✎</span>
    </div>
    <div class="flex items-center gap-2">
      <label class="flex-1 font-medium text-gray-700">Verification Status</label>
      <span class="bg-[#b7d7e8] text-[#2b4b66] rounded px-4 py-1 font-semibold text-sm ml-2">{verified ? 'Verified' : 'Unverified'}</span>
    </div>
    <button class="bg-[#f7f3e7] text-gray-800 rounded font-semibold py-2 mt-4 hover:bg-[#e6ecf2] transition">Save Changes</button>
    <button 
      on:click={openDeleteModal}
      class="bg-[#ed3324] text-white rounded font-semibold py-2 mt-2 hover:bg-[#c82333] transition"
    >
      Delete Account
    </button>
  </div>
</div>
