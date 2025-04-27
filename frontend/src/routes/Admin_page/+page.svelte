<script lang="ts">
    import type { PageData } from './$types';
    import Sidebar from '$lib/Sidebar.svelte';
    import Header from '$lib/header.svelte';

    let { data }: { data: PageData } = $props();
    let searchQuery = '';
    let userType = 'Seller';
    let sortBy = 'User ID';

    const users = [
        { id: '0001', name: 'Zhang Ruonan', status: 'Active', type: 'Seller', dateJoined: 'January 1, 2025' },
        { id: '0002', name: 'Wen Junhui', status: 'Active', type: 'Seller', dateJoined: 'February 2, 2025' },
        { id: '0003', name: 'Bai Lu', status: 'Inactive', type: 'Seller', dateJoined: 'February 3, 2025' },
        { id: '0004', name: 'Wang Yibo', status: 'Active', type: 'Seller', dateJoined: 'March 1, 2025' },
        { id: '0005', name: 'Xu Minghao', status: 'Active', type: 'Seller', dateJoined: 'March 3, 2025' }
    ];
</script>

<div class="layout">
    <Header />
    <Sidebar />
    <main>
        <div class="content">
            <div class="search-section">
                <div class="search-bar">
                    <input type="text" placeholder="Search a user..." bind:value={searchQuery}>
                    <button class="search-btn">
                        <img src="/search.png" alt="Search">
                    </button>
                </div>

                <div class="filters">
                    <div class="user-type">
                        <span>User Type:</span>
                        <div class="buttons">
                            <button class:active={userType === 'Seller'} onclick={() => userType = 'Seller'}>Seller</button>
                            <button class:active={userType === 'Customer'} onclick={() => userType = 'Customer'}>Customer</button>
                        </div>
                    </div>

                    <div class="sort-by">
                        <span>Sort by:</span>
                        <div class="buttons">
                            <button class:active={sortBy === 'User ID'} onclick={() => sortBy = 'User ID'}>User ID</button>
                            <button class:active={sortBy === 'Username'} onclick={() => sortBy = 'Username'}>Username</button>
                            <button class:active={sortBy === 'Status'} onclick={() => sortBy = 'Status'}>Status</button>
                            <button class:active={sortBy === 'Type'} onclick={() => sortBy = 'Type'}>Type</button>
                            <button class:active={sortBy === 'Date Joined'} onclick={() => sortBy = 'Date Joined'}>Date Joined</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="users-list">
                <div class="list-header">
                    <h2>Users List</h2>
                    <div class="list-controls">
                        <select>
                            <option>Show 3</option>
                            <option>Show 5</option>
                            <option>Show 10</option>
                        </select>
                        <button class="view-all">View All</button>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th><input type="checkbox"></th>
                            <th>User ID</th>
                            <th>User's Name</th>
                            <th>Status</th>
                            <th>Type</th>
                            <th>Date Joined</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each users as user}
                            <tr>
                                <td><input type="checkbox"></td>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td class={user.status.toLowerCase()}>{user.status}</td>
                                <td>{user.type}</td>
                                <td>{user.dateJoined}</td>
                                <td class="actions">
                                    <button class="edit"><img src="/edit.png" alt="Edit"></button>
                                    <button class="delete"><img src="/delete.png" alt="Delete"></button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </main>
</div>

<style>
    .layout {
        display: flex;
        min-height: 100vh;
    }

    main {
        flex: 1;
        margin-left: 250px;
        padding: 2rem;
        background-color: #F5ECD5;
    }

    .content {
        max-width: 1200px;
        margin: 0 auto;
    }

    .search-section {
        margin-bottom: 2rem;
    }

    .search-bar {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .search-bar input {
        flex: 1;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 1rem;
    }

    .search-btn {
        padding: 0.75rem 1.5rem;
        background: none;
        border: none;
        cursor: pointer;
    }

    .search-btn img {
        width: 24px;
        height: 24px;
    }

    .filters {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .user-type, .sort-by {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .buttons {
        display: flex;
        gap: 0.5rem;
    }

    .buttons button {
        padding: 0.5rem 1rem;
        border: 1px solid #ddd;
        background: white;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .buttons button.active {
        background-color: #007bff;
        color: white;
        border-color: #007bff;
    }

    .users-list {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .list-controls {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .list-controls select {
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .view-all {
        padding: 0.5rem 1rem;
        background: none;
        border: none;
        color: #007bff;
        cursor: pointer;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid #ddd;
    }

    th {
        font-weight: 500;
        color: #666;
    }

    td.active {
        color: #28a745;
    }

    td.inactive {
        color: #dc3545;
    }

    .actions {
        display: flex;
        gap: 0.5rem;
    }

    .actions button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem;
    }

    .actions img {
        width: 20px;
        height: 20px;
    }
</style>