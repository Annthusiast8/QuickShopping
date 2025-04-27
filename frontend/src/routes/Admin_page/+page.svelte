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
                    <img src="/Leading-icon.png" alt="Leading Icon" class="leading-icon">
                    <input type="text" placeholder="Search a user..." bind:value={searchQuery}>
                    <button class="search-btn">
                        <img src="/Search.png" alt="Search">
                    </button>
                </div>

                <div class="filters">
                    <div class="user-type">
                        <span>User Type:</span>
                        <div class="buttons">
                            <button class:active={userType === 'Seller'} on:click={() => userType = 'Seller'}>Seller</button>
                            <button class:active={userType === 'Customer'} on:click={() => userType = 'Customer'}>Customer</button>
                        </div>
                    </div>

                    <div class="sort-by">
                        <span>Sort by:</span>
                        <div class="buttons">
                            <button class:active={sortBy === 'User ID'} on:click={() => sortBy = 'User ID'}>User ID</button>
                            <button class:active={sortBy === 'Username'} on:click={() => sortBy = 'Username'}>Username</button>
                            <button class:active={sortBy === 'Status'} on:click={() => sortBy = 'Status'}>Status</button>
                            <button class:active={sortBy === 'Type'} on:click={() => sortBy = 'Type'}>Type</button>
                            <button class:active={sortBy === 'Date Joined'} on:click={() => sortBy = 'Date Joined'}>Date Joined</button>
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

                <div class="table-container">
                    <div class="table-headers">
                        <div class="header-checkbox"></div>
                        <div class="header-item">User ID</div>
                        <div class="header-item">User's Name</div>
                        <div class="header-item">Status</div>
                        <div class="header-item">Type</div>
                        <div class="header-item">Date Joined</div>
                        <div class="header-item">Action</div>
                    </div>

                    <table>
                        <tbody>
                            {#each users as user}
                                <tr>
                                    <td class="checkbox-column"><input type="checkbox"></td>
                                    <td>{user.id}</td>
                                    <td>{user.name}</td>
                                    <td class={user.status.toLowerCase()}>{user.status}</td>
                                    <td>{user.type}</td>
                                    <td>{user.dateJoined}</td>
                                    <td class="actions">
                                        <button class="edit"><img src="/Edit User.png" alt="Edit"></button>
                                        <button class="delete"><img src="/Trash.png" alt="Delete"></button>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>
</div>

<style>
    .layout {
        display: flex;
        min-height: 100vh;
        background-color: #F5ECD5;
        padding-top: 60px;
    }

    main {
        flex: 1;
        margin-left: 200px;
        padding: 1.5rem 2rem;
        max-width: calc(100vw - 200px);
        box-sizing: border-box;
    }

    .content {
        max-width: 1200px;
        margin: 0 auto;
    }

    .search-section {
        margin-bottom: 1.5rem;
        background-color: transparent;
        padding: 1.5rem;
        max-width: 800px;
    }

    .search-bar {
        display: flex;
        align-items: center;
        margin-bottom: 1.5rem;
        background: #FFF;
        border-radius: 25px;
        border: 1px solid #E5E5E5;
        padding: 0.5rem;
        max-width: 600px;
    }

    .search-bar img.leading-icon {
        width: 18px;
        height: 18px;
        margin-left: 12px;
        margin-right: 8px;
        opacity: 0.6;
    }

    .search-bar input {
        flex: 1;
        padding: 0.5rem;
        border: none;
        font-size: 0.95rem;
        outline: none;
        background: transparent;
    }

    .search-btn {
        padding: 0.5rem 0.75rem;
        background: none;
        border: none;
        cursor: pointer;
    }

    .search-btn img {
        width: 18px;
        height: 18px;
        opacity: 0.6;
    }

    .filters {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        margin-top: 1rem;
    }

    .user-type, .sort-by {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .user-type span, .sort-by span {
        font-size: 0.95rem;
        color: #333;
        font-weight: 500;
    }

    .buttons {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
    }

    .buttons button {
        padding: 0.5rem 1rem;
        border: 1px solid #E5E5E5;
        background: #F5ECD5;
        border-radius: 20px;
        cursor: pointer;
        font-size: 0.95rem;
        color: #666;
        transition: all 0.2s ease;
    }

    .buttons button.active {
        background-color: #92A8D1;
        color: white;
        border-color: #92A8D1;
    }

    .buttons button:hover:not(.active) {
        background-color: #eee4cc;
    }

    .users-list {
        background: white;
        border-radius: 8px;
        padding: 1.25rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .list-header h2 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #333;
    }

    .list-controls {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .list-controls select {
        padding: 0.3rem 0.6rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 0.9rem;
        color: #666;
    }

    .view-all {
        padding: 0.3rem 0.6rem;
        background: none;
        border: none;
        color: #92A8D1;
        font-size: 0.9rem;
        cursor: pointer;
    }

    .table-container {
        width: 100%;
        background: white;
        border-radius: 8px;
        overflow: hidden;
    }

    .table-headers {
        display: flex;
        background-color: #F5ECD5;
        padding: 0.75rem 0;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
    }

    .header-checkbox {
        width: 40px;
    }

    .header-item {
        flex: 1;
        padding: 0 1rem;
        color: #333;
        font-weight: 500;
        font-size: 0.95rem;
    }

    .header-item:last-child {
        text-align: right;
        padding-right: 2rem;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    td {
        padding: 1rem;
        border-bottom: 1px solid #E5E5E5;
        color: #666;
    }

    .checkbox-column {
        width: 40px;
        text-align: center;
    }

    input[type="checkbox"] {
        width: 16px;
        height: 16px;
        border: 1px solid #ddd;
        border-radius: 3px;
        cursor: pointer;
    }

    .actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
        padding-right: 1rem;
    }

    .actions button {
        background: none;
        border: none;
        padding: 0.25rem;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.2s;
    }

    .actions button:hover {
        opacity: 1;
    }

    .actions img {
        width: 18px;
        height: 18px;
    }

    td.active {
        color: #28a745;
    }

    td.inactive {
        color: #dc3545;
    }

    tr:hover {
        background-color: #f8f9fa;
    }
</style>