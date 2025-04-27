<script lang="ts">
    import type { PageData } from './$types';
    import Header from '$lib/header.svelte';

    export let data: PageData;
    let profileImage = "/briar-lol-game-4k-wallpaper-uhdpaper.com-899@1@l.jpg";
    
    // State for delete modal
    let showDeleteModal = false;

    // Function to handle delete confirmation
    function handleDelete() {
        // TODO: Add backend integration here to delete the user's account
        showDeleteModal = false;
    }

    // Function to open modal
    function openDeleteModal() {
        showDeleteModal = true;
    }

    // Function to close modal
    function closeDeleteModal() {
        showDeleteModal = false;
    }
</script>

<div class="layout">
    <Header />
    <main>
        <div class="profile-container">
            <h2>My Profile</h2>
            <div class="profile-card">
                <div class="profile-image-section">
                    <div class="image-container">
                        <img src={profileImage} alt="Profile" class="profile-image">
                    </div>
                    <button class="change-photo-btn">Change Photo</button>
                </div>

                <form class="profile-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="username">Username</label>
                            <input type="text" id="username" placeholder="Enter username">
                        </div>
                        <div class="form-group">
                            <label for="name">Name</label>
                            <input type="text" id="name" placeholder="Enter name">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" placeholder="Enter email">
                        </div>
                        <div class="form-group">
                            <label for="phone">Phone Number</label>
                            <input type="tel" id="phone" placeholder="Enter phone number">
                        </div>
                    </div>

                    <div class="form-group full-width">
                        <label for="address">Shipping Address</label>
                        <input type="text" id="address" placeholder="Enter shipping address">
                    </div>

                    <div class="button-group">
                        <button type="submit" class="update-btn">Update Profile</button>
                        <button type="button" class="delete-btn" on:click={openDeleteModal}>Delete Profile</button>
                    </div>
                </form>
            </div>
        </div>
    </main>
</div>

{#if showDeleteModal}
<div class="modal-overlay" on:click={closeDeleteModal}>
    <div class="modal" on:click|stopPropagation>
        <div class="modal-content">
            <span class="warning-icon">⚠️</span>
            <h3>Are you sure you want to delete your account?</h3>
            <p>Deleting your account will remove all of your information from our database. This cannot be undone.</p>
            <div class="modal-buttons">
                <button class="cancel-btn" on:click={closeDeleteModal}>No</button>
                <button class="confirm-delete-btn" on:click={handleDelete}>Yes</button>
            </div>
        </div>
    </div>
</div>
{/if}

<style>
    .layout {
        min-height: 100vh;
        background-color: #F5ECD5;
        padding-top: 60px;
    }

    main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .profile-container {
        max-width: 800px;
        margin: 0 auto;
    }

    h2 {
        font-size: 1.5rem;
        color: #333;
        margin-bottom: 2rem;
        text-align: center;
    }

    .profile-card {
        background: white;
        border-radius: 12px;
        padding: 3rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3rem;
    }

    .profile-image-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        margin-bottom: 1rem;
    }

    .image-container {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        overflow: hidden;
        border: 3px solid #F5ECD5;
    }

    .profile-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .change-photo-btn {
        background: none;
        border: none;
        color: #92A8D1;
        font-size: 1rem;
        cursor: pointer;
        padding: 0.5rem 1rem;
        transition: color 0.2s;
    }

    .change-photo-btn:hover {
        color: #7089b3;
    }

    .profile-form {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .form-row {
        display: flex;
        gap: 2.5rem;
        width: 100%;
    }

    .form-group {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .full-width {
        width: 100%;
        margin-top: 1rem;
    }

    label {
        font-size: 1rem;
        color: #666;
        font-weight: 500;
    }

    input {
        padding: 1rem;
        border: 1px solid #E5E5E5;
        border-radius: 8px;
        font-size: 1rem;
        width: 100%;
        background: #F5ECD5;
        color: #333;
    }

    input::placeholder {
        color: #999;
    }

    .button-group {
        display: flex;
        gap: 1.5rem;
        margin-top: 2.5rem;
        justify-content:flex-end;
    }

    .update-btn, .delete-btn {
        padding: 1rem 2rem;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        transition: opacity 0.2s;
        min-width: 150px;
    }

    .update-btn {
        background-color: #92A8D1;
        color: white;
    }

    .delete-btn {
        background-color: #E57373;
        color: white;
    }

    .update-btn:hover, .delete-btn:hover {
        opacity: 0.9;
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .modal-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1rem;
    }

    .warning-icon {
        font-size: 3rem;
    }

    .modal h3 {
        color: #333;
        margin: 0;
    }

    .modal p {
        color: #666;
        margin: 1rem 0;
    }

    .modal-buttons {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
    }

    .cancel-btn, .confirm-delete-btn {
        padding: 0.75rem 2rem;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        transition: opacity 0.2s;
        min-width: 100px;
    }

    .cancel-btn {
        background-color: #E0E0E0;
        color: #333;
    }

    .confirm-delete-btn {
        background-color: #E57373;
        color: white;
    }

    .cancel-btn:hover, .confirm-delete-btn:hover {
        opacity: 0.9;
    }
</style>