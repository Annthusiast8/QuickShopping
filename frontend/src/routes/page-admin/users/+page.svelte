<script lang="ts">
    import type { PageData } from './$types';
    import Header from '$lib/header.svelte';
    import { onMount } from 'svelte';
    import { admin, type User } from '$lib/stores/admin';

    let { data }: { data: PageData } = $props();
    let searchQuery = $state('');
    let userType = $state('Seller');
    let sortBy = $state('User ID');
    let showPerPage = $state('5');


    // Store reactive variables using runes syntax
    const users = $derived($admin.users);
    const loading = $derived($admin.loading);
    const error = $derived($admin.error);
    
    // For role update modal
    let showRoleModal = $state(false);
    let selectedUser = $state<User | null>(null);
    let selectedRole = $state<'admin' | 'seller' | 'customer'>('customer');
    
    // For delete confirmation modal
    let showDeleteModal = $state(false);
    let userToDelete = $state<User | null>(null);
    
    // Fetch users on component mount
    onMount(() => {
      admin.loadUsers();
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
        await admin.updateUserRole(selectedUser.id, selectedRole);
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
        await admin.deleteUser(userToDelete.id);
        closeDeleteModal();
      }
    }
    
    function formatDate(dateString: string) {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
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

<div class="min-h-screen bg-[#F5ECD5] pt-[1px]">
    <Header />
    <main class="flex-1 p-6 max-w-[calc(100vw-200px)]">
        <div class="max-w-7xl mx-auto">
            <!-- Search Section -->
            <div class="mb-6 bg-transparent p-6 max-w-3xl">
                <div class="flex items-center mb-6 bg-white rounded-full border border-gray-200 p-2 max-w-2xl">
                    <img src="/Leading-icon.png" alt="Leading Icon" class="w-[18px] h-[18px] ml-3 mr-2 opacity-60">
                    <input 
                        type="text" 
                        placeholder="Search a user..." 
                        bind:value={searchQuery}
                        class="flex-1 p-2 text-sm outline-none bg-transparent"
                    >
                    <button class="p-2">
                        <img src="/Search.png" alt="Search" class="w-[18px] h-[18px] opacity-60">
                    </button>
                </div>

                <!-- Filters -->
                <div class="flex flex-col gap-6 mt-4">
                    <div class="flex flex-col gap-3">
                        <span class="text-sm font-medium text-gray-700">User Type:</span>
                        <div class="flex gap-3 flex-wrap">
                            <button 
                                class="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 transition-colors {userType === 'Seller' ? 'bg-[#92A8D1] text-white border-[#92A8D1]' : 'bg-[#F5ECD5] hover:bg-[#eee4cc]'}"
                                onclick={() => userType = 'Seller'}
                            >
                                Seller
                            </button>
                            <button 
                                class="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 transition-colors {userType === 'Customer' ? 'bg-[#92A8D1] text-white border-[#92A8D1]' : 'bg-[#F5ECD5] hover:bg-[#eee4cc]'}"
                                onclick={() => userType = 'Customer'}
                            >
                                Customer
                            </button>
                        </div>
                    </div>

                    <div class="flex flex-col gap-3">
                        <span class="text-sm font-medium text-gray-700">Sort by:</span>
                        <div class="flex gap-3 flex-wrap">
                            {#each ['User ID', 'Username', 'Status', 'Type', 'Date Joined'] as option}
                                <button 
                                    class="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-600 transition-colors {sortBy === option ? 'bg-[#92A8D1] text-white border-[#92A8D1]' : 'bg-[#F5ECD5] hover:bg-[#eee4cc]'}"
                                    onclick={() => sortBy = option}
                                >
                                    {option}
                                </button>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Users List -->
            <div class="bg-white rounded-lg p-5 shadow-sm">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-xl font-semibold text-gray-800">Users List</h2>
                    <div class="flex gap-4 items-center">
                        <select 
                            bind:value={showPerPage}
                            class="px-2 py-1 border border-gray-200 rounded text-sm text-gray-600"
                        >
                            <option value="3">Show 3</option>
                            <option value="5">Show 5</option>
                            <option value="10">Show 10</option>
                        </select>
                        <button class="text-[#92A8D1] text-sm">View All</button>
                    </div>
                </div>

                <!-- Table -->
                <div class="overflow-x-auto">
                    <div class="min-w-full bg-[#F5ECD5] rounded-t-lg">
                        <div class="grid grid-cols-7 gap-4 p-3">
                            <div class="w-10"></div>
                            <div class="text-sm font-medium text-gray-700">User ID</div>
                            <div class="text-sm font-medium text-gray-700">User's Name</div>
                            <div class="text-sm font-medium text-gray-700">Status</div>
                            <div class="text-sm font-medium text-gray-700">Type</div>
                            <div class="text-sm font-medium text-gray-700">Date Joined</div>
                            <div class="text-sm font-medium text-gray-700 text-right pr-4">Action</div>
                        </div>
                    </div>

                    <div class="bg-white">
                        {#if loading && users.length === 0}
                            <div class="p-10 text-center text-sm text-gray-500">
                                <div class="flex justify-center">
                                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-[#21463E]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Loading users...</span>
                                </div>
                            </div>
                        {:else if users.length === 0}
                            <div class="p-10 text-center text-sm text-gray-500">
                                No users found
                            </div>
                        {:else}
                            {#each users as user (user.id)}
                                <div class="grid grid-cols-7 gap-4 p-4 border-b border-gray-200 hover:bg-gray-50">
                                    <div class="w-10 flex items-center justify-center">
                                        <input type="checkbox" class="w-4 h-4 border border-gray-300 rounded">
                                    </div>
                                    <div class="text-sm text-gray-600">{user.id}</div>
                                    <div class="text-sm text-gray-600">{user.name}</div>
                                    <div class="text-sm">
                                        <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getRoleBadgeClass(user.role)}">
                                            {user.role}
                                        </span>
                                    </div>
                                    <div class="text-sm text-gray-600">{user.role}</div>
                                    <div class="text-sm text-gray-600">{formatDate(user.created_at)}</div>
                                    <div class="flex gap-3 justify-end pr-4">
                                        <button 
                                            onclick={() => openRoleModal(user)}
                                            class="opacity-70 hover:opacity-100 transition-opacity"
                                        >
                                            <img src="/Edit User.png" alt="Edit" class="w-[18px] h-[18px]">
                                        </button>
                                        <button 
                                            onclick={() => openDeleteModal(user)}
                                            class="opacity-70 hover:opacity-100 transition-opacity"
                                        >
                                            <img src="/Trash.png" alt="Delete" class="w-[18px] h-[18px]">
                                        </button>
                                    </div>
                                </div>
                            {/each}
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </main>
</div>

<!-- Role Update Modal -->
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
                            onclick={updateUserRole}
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
                            onclick={closeRoleModal}
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
                        onclick={deleteUser}
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
                        onclick={closeDeleteModal}
                        class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}