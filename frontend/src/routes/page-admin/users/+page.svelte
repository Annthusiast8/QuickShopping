<script lang="ts">
    import type { PageData } from './$types';
    import { onMount } from 'svelte';
    import { usersStore, type User } from '$lib/stores/users';

    let { data }: { data: PageData } = $props();

    // Store reactive variables using runes syntax
    const users = $derived($usersStore.users);
    const loading = $derived($usersStore.loading);
    const error = $derived($usersStore.error);
    
    // For role update modal
    let showRoleModal = false;
    let selectedUser: User | null = null;
    let selectedRole: 'admin' | 'seller' | 'customer' = 'customer';
    
    // For delete confirmation modal
    let showDeleteModal = false;
    let userToDelete: User | null = null;
    
    // Fetch users on component mount
    onMount(() => {
      usersStore.fetchUsers();
    });
    
    function openRoleModal(user: User) {
      selectedUser = user;
      selectedRole = user.role;
      showRoleModal = true;
    }
    
    function closeRoleModal() {
      showRoleModal = false;
      selectedUser = null;
    }
    
    async function updateUserRole() {
      if (selectedUser && selectedRole) {
        await usersStore.updateUserRole(selectedUser.id, selectedRole);
        closeRoleModal();
      }
    }
    
    function openDeleteModal(user: User) {
      userToDelete = user;
      showDeleteModal = true;
    }
    
    function closeDeleteModal() {
      showDeleteModal = false;
      userToDelete = null;
    }
    
    async function deleteUser() {
      if (userToDelete) {
        await usersStore.deleteUser(userToDelete.id);
        closeDeleteModal();
      }
    }
    
    function formatDate(dateString: string) {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    }
    
    function getRoleBadgeClass(role: string) {
      switch (role) {
        case 'admin':
          return 'bg-purple-100 text-purple-800';
        case 'seller':
          return 'bg-blue-100 text-blue-800';
        case 'customer':
          return 'bg-green-100 text-green-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
</script>

<div>
  <div class="sm:flex sm:items-center sm:justify-between mb-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Users</h1>
      <p class="mt-1 text-sm text-gray-500">Manage users and their roles</p>
    </div>
    <div class="mt-4 sm:mt-0 flex">
      <button 
        class="ml-3 inline-flex items-center rounded-md bg-[#21463E] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#143129] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        on:click={() => usersStore.fetchUsers()}
      >
        Refresh
      </button>
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
              on:click={() => usersStore.clearError()}
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

  <div class="mt-8 flow-root">
    <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
        <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table class="min-w-full divide-y divide-gray-300">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">ID</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Joined</th>
                <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Shop</th>
                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              {#if loading && users.length === 0}
                <tr>
                  <td colspan="7" class="py-10 text-center text-sm text-gray-500">
                    <div class="flex justify-center">
                      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-[#21463E]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Loading users...</span>
                    </div>
                  </td>
                </tr>
              {:else if users.length === 0}
                <tr>
                  <td colspan="7" class="py-10 text-center text-sm text-gray-500">
                    No users found
                  </td>
                </tr>
              {:else}
                {#each users as user (user.id)}
                  <tr>
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{user.id}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.name}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.email}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getRoleBadgeClass(user.role)}">
                        {user.role}
                      </span>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatDate(user.created_at)}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {#if user.role === 'seller' && user.shop}
                        {user.shop.name}
                      {:else}
                        -
                      {/if}
                    </td>
                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div class="flex justify-end space-x-2">
                        <button 
                          on:click={() => openRoleModal(user)}
                          class="text-blue-600 hover:text-blue-900"
                        >
                          Change Role
                        </button>
                        <span class="text-gray-300">|</span>
                        <button 
                          on:click={() => openDeleteModal(user)}
                          class="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Change Role Modal -->
{#if showRoleModal}
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-10"></div>
  <div class="fixed inset-0 z-10 overflow-y-auto">
    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
        <div>
          <div class="mt-3 text-center sm:mt-5">
            <h3 class="text-base font-semibold leading-6 text-gray-900">Change User Role</h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                Update the role for user: <span class="font-medium">{selectedUser?.name}</span>
              </p>
            </div>
          </div>
        </div>
        <div class="mt-5 sm:mt-6">
          <label for="role" class="block text-sm font-medium leading-6 text-gray-900">Select Role</label>
          <select 
            id="role" 
            bind:value={selectedRole} 
            class="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="admin">Admin</option>
            <option value="seller">Seller</option>
            <option value="customer">Customer</option>
          </select>
          
          <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button 
              type="button" 
              on:click={updateUserRole}
              class="inline-flex w-full justify-center rounded-md bg-[#21463E] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#143129] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
              disabled={loading}
            >
              {#if loading}
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              {:else}
                Update
              {/if}
            </button>
            <button 
              type="button" 
              on:click={closeRoleModal}
              class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-10"></div>
  <div class="fixed inset-0 z-10 overflow-y-auto">
    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
            <h3 class="text-base font-semibold leading-6 text-gray-900">Delete User</h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                Are you sure you want to delete the user <span class="font-medium">{userToDelete?.name}</span>? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button 
            type="button" 
            on:click={deleteUser}
            class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
            disabled={loading}
          >
            {#if loading}
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Deleting...
            {:else}
              Delete
            {/if}
          </button>
          <button 
            type="button" 
            on:click={closeDeleteModal}
            class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}