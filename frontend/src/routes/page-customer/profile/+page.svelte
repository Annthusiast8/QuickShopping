<script lang="ts">
    import Alerts from '$lib/components/Alerts.svelte';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { auth } from '$lib/stores/auth';
    import { profile } from '$lib/stores/profile';
    import { goto } from '$app/navigation';
    
    // Create a store to track if edit mode is active
    export const isEditMode = writable(false);
    
    // User profile data
    let profileData = $state({
        username: '',
        name: '',
        email: '',
        phone: '',
        shippingAddress: ''
    });
    
    let profileImage = $state('/profile-placeholder.png');
    let avatarFile: File | null = null;
    let isLoading = $state(false);
    let showDeleteModal = $state(false);
    let showCountdownModal = $state(false);
    let alertType: 'success' | 'delete-account' | 'delete-countdown' | 'review-success' | 'error' | 'profile-update' = $state('delete-account');
    let showAlert = $state(false);
    let errorMessage = $state('');
    let activeTab = $state('personal');
    
    // Load user profile data
    async function loadProfileData() {
        try {
            isLoading = true;
            const response = await profile.loadProfile();
            
            if (response && response.user) {
                profileData.username = response.user.username || response.user.name.split(' ')[0].toLowerCase();
                profileData.name = response.user.name || '';
                profileData.email = response.user.email || '';
                
                if (response.profile) {
                    profileData.phone = response.profile.phone || '';
                    profileData.shippingAddress = response.profile.address || '';
                    
                    if (response.profile.avatar) {
                        // Construct the full URL for the avatar
                        profileImage = `http://localhost/QuickShopping/backend/public/storage/${response.profile.avatar}`;
                    }
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            errorMessage = 'Failed to load profile data. Please try again.';
            alertType = 'error';
            showAlert = true;
        } finally {
            isLoading = false;
        }
    }
    
    async function updateProfile() {
        try {
            isLoading = true;
            
            // Make API call to update profile using the profile store
            await profile.updateProfile({
                name: profileData.name,
                email: profileData.email,
                phone: profileData.phone,
                address: profileData.shippingAddress,
                avatar: avatarFile || undefined
            });
            
            // Show success alert
            alertType = 'profile-update';
            showAlert = true;
            
            // Close edit mode after updating
            $isEditMode = false;
        } catch (error: any) {
            console.error('Error updating profile:', error);
            errorMessage = error.message || 'Failed to update profile. Please try again.';
            alertType = 'error';
            showAlert = true;
        } finally {
            isLoading = false;
        }
    }
    
    function deleteProfile() {
        showDeleteModal = true;
        alertType = 'delete-account';
    }
    
    async function handleConfirmDelete(event: { detail: { password: string } }) {
        try {
            // Get the password from the event detail
            const password = event.detail.password;
            
            // First close the password confirmation modal
            showDeleteModal = false;
            isLoading = true;
            
            // Make API call to delete account
            await auth.deleteAccount(password);
            
            // Show countdown modal
            alertType = 'delete-countdown';
            showDeleteModal = true;
            
            // Redirect to login page after a delay
            setTimeout(() => {
                auth.logout();
                goto('/login');
            }, 3000);
        } catch (error: any) {
            console.error('Error deleting account:', error);
            errorMessage = error.message || 'Failed to delete account. Please try again.';
            alertType = 'error';
            showAlert = true;
            isLoading = false;
        }
    }
    
    function closeModal() {
        showDeleteModal = false;
        showAlert = false;
    }
    
    function handleImageChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            avatarFile = input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                profileImage = e.target?.result as string;
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    // Check URL parameters for edit mode and load profile data
    onMount(() => {
        // Load profile data
        loadProfileData();
        
        // Check if we should start in edit mode
        const params = new URLSearchParams(window.location.search);
        if (params.get('edit') === 'true') {
            $isEditMode = true;
        }
    });
</script>

<div class="content">
    <div class="profile-container">
        <div class="profile-header">
            <h1>My Profile</h1>
            {#if !$isEditMode}
                <button class="edit-profile-btn" on:click={() => $isEditMode = true}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit Profile
                </button>
            {/if}
        </div>

        <div class="profile-tabs">
            <button 
                class="tab-btn {activeTab === 'personal' ? 'active' : ''}" 
                on:click={() => activeTab = 'personal'}
            >
                Personal Information
            </button>
            <button 
                class="tab-btn {activeTab === 'security' ? 'active' : ''}" 
                on:click={() => activeTab = 'security'}
            >
                Security
            </button>
        </div>

        {#if activeTab === 'personal'}
            {#if $isEditMode}
                <!-- Edit Mode -->
                <div class="profile-card">
                    <div class="avatar-section">
                        <div class="avatar-container">
                            <img src={profileImage} alt="Profile" class="avatar" />
                            <div class="avatar-overlay">
                                <label for="profile-image-upload" class="avatar-change-btn">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                        <circle cx="12" cy="13" r="4"></circle>
                                    </svg>
                                </label>
                                <input 
                                    type="file" 
                                    id="profile-image-upload" 
                                    accept="image/*" 
                                    on:change={handleImageChange} 
                                    hidden
                                />
                            </div>
                        </div>
                        <p class="avatar-help">Click on the image to change your profile picture</p>
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
                                <label for="name">Full Name</label>
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
                                <label for="email">Email Address</label>
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
                                placeholder="Enter your shipping address"
                                rows="4"
                            ></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button class="btn-secondary" on:click={() => $isEditMode = false}>
                                Cancel
                            </button>
                            <button class="btn-primary" on:click={updateProfile}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            {:else}
                <!-- View Mode -->
                <div class="profile-card">
                    <div class="profile-view">
                        <div class="profile-section">
                            <div class="avatar-container view-mode">
                                <img src={profileImage} alt="Profile" class="avatar" />
                            </div>
                            <div class="profile-info">
                                <h2>{profileData.name || 'No name provided'}</h2>
                                <p class="username">@{profileData.username}</p>
                            </div>
                        </div>

                        <div class="info-section">
                            <div class="info-group">
                                <h3>Contact Information</h3>
                                <div class="info-item">
                                    <div class="info-label">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                            <polyline points="22,6 12,13 2,6"></polyline>
                                        </svg>
                                        <span>Email</span>
                                    </div>
                                    <div class="info-value">{profileData.email || 'No email provided'}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                        </svg>
                                        <span>Phone</span>
                                    </div>
                                    <div class="info-value">{profileData.phone || 'No phone provided'}</div>
                                </div>
                            </div>

                            <div class="info-group">
                                <h3>Shipping Address</h3>
                                <div class="info-item address">
                                    <div class="info-label">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                            <circle cx="12" cy="10" r="3"></circle>
                                        </svg>
                                        <span>Address</span>
                                    </div>
                                    <div class="info-value address-value">
                                        {#if profileData.shippingAddress}
                                            {profileData.shippingAddress}
                                        {:else}
                                            <span class="no-data">No shipping address provided</span>
                                        {/if}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            {/if}
        {:else if activeTab === 'security'}
            <div class="profile-card">
                <div class="security-section">
                    <h3>Account Security</h3>
                    <p class="security-info">Manage your account security settings and delete your account if needed.</p>
                    
                    <div class="security-actions">
                        <button class="btn-outline">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            Change Password
                        </button>
                        
                        <button class="btn-danger" on:click={deleteProfile}>
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                            Delete Account
                        </button>
                    </div>
                    
                    <div class="security-warning">
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        <p>Deleting your account is permanent. All your data will be permanently removed and cannot be recovered.</p>
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>

<Alerts 
    isVisible={showDeleteModal}
    type={alertType}
    autoDismiss={false}
    on:close={closeModal}
    on:confirm={handleConfirmDelete}
/>

{#if showAlert}
<Alerts 
    isVisible={showAlert}
    type={alertType}
    cartAdded={errorMessage}
    autoDismiss={true}  
    on:close={() => showAlert = false}
/>
{/if}

{#if isLoading}
<div class="loading-overlay">
    <div class="spinner"></div>
</div>
{/if}

<style>
    .content {
        padding: 2rem;
        min-height: calc(100vh - 60px);
        background-color: #f9fafb;
    }

    .profile-container {
        max-width: 900px;
        margin: 0 auto;
    }

    .profile-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    h1 {
        color: #1e293b;
        font-size: 1.875rem;
        font-weight: 700;
        margin: 0;
    }

    h2 {
        color: #1e293b;
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0 0 0.25rem 0;
    }

    h3 {
        color: #334155;
        font-size: 1.125rem;
        font-weight: 600;
        margin: 0 0 1rem 0;
    }

    .edit-profile-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background-color: #3b82f6;
        color: white;
        border: none;
        border-radius: 0.375rem;
        padding: 0.625rem 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .edit-profile-btn:hover {
        background-color: #2563eb;
    }

    .icon {
        width: 1.25rem;
        height: 1.25rem;
    }

    .profile-tabs {
        display: flex;
        border-bottom: 1px solid #e2e8f0;
        margin-bottom: 1.5rem;
    }

    .tab-btn {
        padding: 0.75rem 1.25rem;
        background: transparent;
        border: none;
        border-bottom: 2px solid transparent;
        color: #64748b;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .tab-btn:hover {
        color: #334155;
    }

    .tab-btn.active {
        color: #3b82f6;
        border-bottom-color: #3b82f6;
    }

    .profile-card {
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }

    .avatar-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem;
        border-bottom: 1px solid #e2e8f0;
    }

    .avatar-container {
        position: relative;
        width: 120px;
        height: 120px;
        border-radius: 50%;
        overflow: hidden;
        margin-bottom: 1rem;
    }

    .avatar-container.view-mode {
        width: 100px;
        height: 100px;
        margin-bottom: 0;
    }

    .avatar {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .avatar-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.2s;
    }

    .avatar-container:hover .avatar-overlay {
        opacity: 1;
    }

    .avatar-change-btn {
        color: white;
        cursor: pointer;
    }

    .avatar-help {
        color: #64748b;
        font-size: 0.875rem;
        margin: 0;
    }

    .profile-form {
        padding: 2rem;
    }

    .form-row {
        display: flex;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
    }

    .form-group {
        flex: 1;
    }

    .full-width {
        width: 100%;
        margin-bottom: 1.5rem;
    }

    label {
        display: block;
        color: #4b5563;
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
    }

    input, textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        transition: border-color 0.2s;
    }

    input:focus, textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    textarea {
        resize: vertical;
        min-height: 100px;
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }

    .btn-primary, .btn-secondary, .btn-outline, .btn-danger {
        padding: 0.625rem 1.25rem;
        border-radius: 0.375rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }

    .btn-primary {
        background-color: #3b82f6;
        color: white;
        border: none;
    }

    .btn-primary:hover {
        background-color: #2563eb;
    }

    .btn-secondary {
        background-color: #f3f4f6;
        color: #4b5563;
        border: none;
    }

    .btn-secondary:hover {
        background-color: #e5e7eb;
    }

    .btn-outline {
        background-color: transparent;
        color: #3b82f6;
        border: 1px solid #3b82f6;
    }

    .btn-outline:hover {
        background-color: rgba(59, 130, 246, 0.05);
    }

    .btn-danger {
        background-color: transparent;
        color: #ef4444;
        border: 1px solid #ef4444;
    }

    .btn-danger:hover {
        background-color: rgba(239, 68, 68, 0.05);
    }

    .profile-section {
        display: flex;
        align-items: center;
        padding: 2rem;
        border-bottom: 1px solid #e2e8f0;
    }

    .profile-info {
        margin-left: 1.5rem;
    }

    .username {
        color: #64748b;
        font-size: 0.875rem;
        margin: 0;
    }

    .info-section {
        padding: 2rem;
    }

    .info-group {
        margin-bottom: 2rem;
    }

    .info-item {
        display: flex;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #f1f5f9;
    }

    .info-item:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
    }

    .info-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        width: 150px;
        color: #64748b;
        font-weight: 500;
    }

    .info-value {
        flex: 1;
        color: #1e293b;
    }

    .address-value {
        white-space: pre-line;
    }

    .no-data {
        color: #94a3b8;
        font-style: italic;
    }

    .security-section {
        padding: 2rem;
    }

    .security-info {
        color: #64748b;
        margin-bottom: 2rem;
    }

    .security-actions {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .security-warning {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem;
        background-color: #fee2e2;
        border-radius: 0.375rem;
    }

    .security-warning p {
        color: #b91c1c;
        margin: 0;
        font-size: 0.875rem;
    }

    .icon.warning {
        color: #b91c1c;
        flex-shrink: 0;
    }

    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(59, 130, 246, 0.1);
        border-radius: 50%;
        border-top-color: #3b82f6;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
        .content {
            padding: 1rem;
        }

        .profile-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
        }

        .form-row {
            flex-direction: column;
            gap: 1rem;
        }

        .profile-section {
            flex-direction: column;
            text-align: center;
        }

        .profile-info {
            margin-left: 0;
            margin-top: 1rem;
        }

        .info-item {
            flex-direction: column;
            gap: 0.5rem;
        }

        .info-label {
            width: 100%;
        }

        .security-actions {
            flex-direction: column;
        }

        .form-actions {
            flex-direction: column-reverse;
        }

        .btn-primary, .btn-secondary, .btn-outline, .btn-danger {
            width: 100%;
            justify-content: center;
        }
    }
</style>
  

