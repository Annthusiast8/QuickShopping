<script lang="ts">
    import CustomerSidebar from '$lib/components/CustomerSidebar.svelte';
    import Alerts from '$lib/components/Alerts.svelte';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    
    // Create a store to track if edit mode is active
    export const isEditMode = writable(false);
    
    // User profile data with mock data
    let profileData = {
        username: 'kape_meow',
        name: 'Katherine Peterson',
        email: 'kathy.peterson@example.com',
        phone: '+1 (555) 123-4567',
        shippingAddress: '123 Maple Street, Apt 4B\nBrooklyn, NY 11201\nUnited States'
    };
    
    let profileImage = '/briar-lol-game-4k-wallpaper-uhdpaper.com-899@1@l.jpg';
    let showDeleteModal = false;
    let showCountdownModal = false;
    let alertType: 'success' | 'delete-account' | 'delete-countdown' | 'review-success' | 'error' | 'profile-update' = 'delete-account';
    let showUpdateAlert = false;
    
    function updateProfile() {
        // Handle profile update logic here
        // Display the update alert instead of the JavaScript alert
        alertType = 'profile-update';
        showUpdateAlert = true;
        
        // Close edit mode after updating
        $isEditMode = false;
    }
    
    function deleteProfile() {
        showDeleteModal = true;
        alertType = 'delete-account';
    }
    
    function handleConfirmDelete(event: { detail: { password: string } }) {
        // Get the password from the event detail
        const password = event.detail.password;
        
        // Here you would validate the password and perform the deletion
        console.log('Deleting account with password:', password);
        
        // First close the password confirmation modal
        showDeleteModal = false;
        
        // Then show the countdown modal
        setTimeout(() => {
            alertType = 'delete-countdown';
            showDeleteModal = true;
            
            // Here you would make an API call to delete the account
            // For example:
            // api.deleteAccount(password)
            //    .then(() => console.log('Account deleted successfully'))
            //    .catch(err => console.error('Error deleting account:', err));
        }, 300);
    }
    
    function closeDeleteModal() {
        showDeleteModal = false;
    }
    
    function closeUpdateAlert() {
        showUpdateAlert = false;
    }
    
    function handleImageChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profileImage = e.target?.result as string;
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    // Check URL parameters for edit mode
    onMount(() => {
        // Check if we should start in edit mode
        const params = new URLSearchParams(window.location.search);
        if (params.get('edit') === 'true') {
            $isEditMode = true;
        }
    });
</script>

<CustomerSidebar />
<div class="content">
    <h1>My Profile</h1>
    
    {#if $isEditMode}
    <div class="profile-card">
        <div class="profile-header">
            <div class="profile-image-container">
                <img src={profileImage} alt="Profile" class="profile-image" />
                <label for="profile-image-upload" class="change-photo-btn">Change Photo</label>
                <input 
                    type="file" 
                    id="profile-image-upload" 
                    accept="image/*" 
                    on:change={handleImageChange} 
                    hidden
                />
            </div>
        </div>
        
        <div class="profile-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input 
                        type="text" 
                        id="username" 
                        bind:value={profileData.username} 
                        placeholder="Username"
                    />
                </div>
                
                <div class="form-group">
                    <label for="name">Name</label>
                    <input 
                        type="text" 
                        id="name" 
                        bind:value={profileData.name} 
                        placeholder="Full Name"
                    />
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        bind:value={profileData.email} 
                        placeholder="Email Address"
                    />
                </div>
                
                <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input 
                        type="tel" 
                        id="phone" 
                        bind:value={profileData.phone} 
                        placeholder="Phone Number"
                    />
                </div>
            </div>
            
            <div class="form-group full-width">
                <label for="shipping">Shipping Address</label>
                <textarea 
                    id="shipping" 
                    bind:value={profileData.shippingAddress} 
                    placeholder="Shipping Address"
                ></textarea>
            </div>
            
            <div class="profile-actions">
                <button class="update-btn" on:click={updateProfile}>
                    Update Profile
                </button>
                <button class="delete-btn" on:click={deleteProfile}>
                    Delete Profile
                </button>
                <button class="cancel-btn" on:click={() => $isEditMode = false}>
                    Cancel
                </button>
            </div>
        </div>
    </div>
    {:else}
    <div class="profile-view">
        <div class="profile-header">
            <div class="profile-image-container">
                <img src={profileImage} alt="Profile" class="profile-image" />
            </div>
            <div class="profile-details">
                <h2>{profileData.username}</h2>
                {#if profileData.name}<p><strong>Name:</strong> {profileData.name}</p>{/if}
                {#if profileData.email}<p><strong>Email:</strong> {profileData.email}</p>{/if}
                {#if profileData.phone}<p><strong>Phone:</strong> {profileData.phone}</p>{/if}
                {#if profileData.shippingAddress}<p><strong>Shipping Address:</strong> {profileData.shippingAddress}</p>{/if}
            </div>
        </div>
    </div>
    {/if}
</div>

<Alerts 
    isVisible={showDeleteModal}
    type={alertType}
    autoDismiss={false}
    on:close={closeDeleteModal}
    on:confirm={handleConfirmDelete}
/>

<Alerts 
    isVisible={showUpdateAlert}
    type="profile-update"
    autoDismiss={true}
    cartAdded="Profile has been updated"
    on:close={closeUpdateAlert}
/>

<style>
    .content {
        margin-left: 220px;
        padding: 2rem;
        min-height: calc(100vh - 60px);
    }

    h1 {
        color: #2b4b66;
        margin-bottom: 2rem;
        font-family: 'Poppins', sans-serif;
        font-size: 40px;
        font-weight: bold;
    }
    
    .profile-card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        padding: 2rem;
        max-width: 900px;
    }
    
    .profile-header {
        display: flex;
        justify-content: center;
        margin-bottom: 2rem;
    }
    
    .profile-image-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }
    
    .profile-image {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #f0f0f0;
    }
    
    .change-photo-btn {
        background: #f8f8f8;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .change-photo-btn:hover {
        background: #eee;
    }
    
    .profile-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .form-row {
        display: flex;
        gap: 1.5rem;
        width: 100%;
    }
    
    .form-group {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .full-width {
        width: 100%;
    }
    
    label {
        font-size: 0.85rem;
        font-weight: 500;
        color: #555;
    }
    
    input, textarea {
        padding: 0.75rem;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        background-color: #fffdf6;
        font-size: 0.95rem;
        width: 100%;
        transition: border-color 0.2s;
    }
    
    textarea {
        min-height: 100px;
        resize: vertical;
    }
    
    input:focus, textarea:focus {
        outline: none;
        border-color: #2b4b66;
    }
    
    .profile-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .update-btn, .delete-btn, .cancel-btn, .edit-btn {
        padding: 0.75rem 1.5rem;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
    }
    
    .update-btn {
        background: #5d93c5;
        color: white;
    }
    
    .update-btn:hover {
        background: #4a7dab;
    }
    
    .delete-btn {
        background: #e77979;
        color: white;
    }
    
    .delete-btn:hover {
        background: #d45c5c;
    }
    
    .cancel-btn {
        background: #f0f0f0;
        color: #555;
    }
    
    .cancel-btn:hover {
        background: #e0e0e0;
    }
    
    .edit-btn {
        background: #5d93c5;
        color: white;
        margin-top: 1rem;
    }
    
    .edit-btn:hover {
        background: #4a7dab;
    }
    
    .profile-view {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        padding: 2rem;
        max-width: 900px;
    }
    
    .profile-view .profile-header {
        display: flex;
        align-items: center;
        justify-content: flex-start;
    }
    
    .profile-details {
        margin-left: 2rem;
    }
    
    .profile-details h2 {
        margin-top: 0;
        margin-bottom: 1rem;
        color: #2b4b66;
    }
    
    .profile-details p {
        margin: 0.5rem 0;
        font-size: 0.95rem;
        color: #555;
    }
    
    @media (max-width: 768px) {
        .content {
            margin-left: 0;
            padding: 1rem;
        }
        
        .form-row {
            flex-direction: column;
            gap: 1rem;
        }
        
        .profile-actions {
            flex-direction: column;
            width: 100%;
        }
        
        .update-btn, .delete-btn, .cancel-btn, .edit-btn {
            width: 100%;
        }
        
        .profile-view .profile-header {
            flex-direction: column;
            text-align: center;
        }
        
        .profile-details {
            margin-left: 0;
            margin-top: 1rem;
        }
    }
</style>
  

