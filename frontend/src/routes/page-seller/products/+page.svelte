<script lang="ts">
    import { onMount } from 'svelte';
    import Header from '$lib/header.svelte';
    import { seller } from '$lib/stores/seller';
    import { auth } from '$lib/stores/auth';
    import { goto } from '$app/navigation';
    import Alerts from '$lib/components/Alerts.svelte';
    import type { Product, Variation } from '$lib/stores/seller';
    import type { ProductData, VariationData } from '$lib/services/api';

    // Alert state
    let showAlert = false;
    let alertType: 'success' | 'error' | 'delete-item' = 'success';
    let alertMessage = '';

    // Modal state
    let showModal = false;
    let showEditModal = false;
    let showDeleteModal = false;
    let productToDelete: Product | null = null;
    let isLoading = false;

    // New product form data
    let newProduct: ProductData = {
        name: '',
        price: 0,
        description: '',
        stock: 0,
        category: '',
        image: undefined
    };

    // Edit product form data
    let editProduct: Partial<Product> & { id?: number, image_url?: string | null, variations?: Variation[] } = {};

    // Variation data
    let newVariation: {
        size: string;
        color: string;
        stock: number;
        price_adjustment: number;
    } = {
        size: '',
        color: '',
        stock: 0,
        price_adjustment: 0
    };

    // File upload state
    let selectedFile: File | undefined = undefined;
    let imagePreview: string | null = null;

    onMount(async () => {
        // Check if user is authenticated and is a seller
        if (!$auth.user) {
            goto('/login?redirect=/page-seller/products');
            return;
        }

        if ($auth.user.role !== 'seller') {
            goto('/');
            return;
        }
        
        // Make sure seller profile is loaded before checking approval status
        if (!$seller.profile) {
            isLoading = true;
            try {
                await seller.loadProfile();
                console.log('Loaded seller profile:', $seller.profile);
            } catch (error) {
                console.error('Error loading seller profile:', error);
            } finally {
                isLoading = false;
            }
        }
        
        console.log('Seller store state:', $seller);
        
        // Check if seller profile is approved
        if ($seller.profile && !$seller.profile.is_approved) {
            showAlert = true;
            alertType = 'error';
            alertMessage = 'Your business profile is not approved yet. You cannot manage products until your profile is approved.';
            setTimeout(() => {
                goto('/page-seller/profile');
            }, 3000);
            return;
        }

        // Load products
        isLoading = true;
        try {
            console.log('Loading seller products...');
            const products = await seller.loadProducts();
            console.log('Loaded products:', products);
        } catch (error) {
            console.error('Error loading products:', error);
            showErrorAlert('Failed to load products. Please try again.');
        } finally {
            isLoading = false;
        }
    });

    // Handle file selection for new product image
    function handleImageChange(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            const file = target.files[0];
            selectedFile = file; // Store the file in selectedFile
            newProduct.image = file;
            
            // Create a preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }
    
    // Handle file selection for edit product image
    function handleEditFileChange(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0]) {
            const file = target.files[0];
            selectedFile = file;
            
            // Create a preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview = e.target?.result as string;
                // Clear the existing image URL so we show the preview instead
                if (editProduct) {
                    editProduct.image_url = null;
                }
            };
            reader.readAsDataURL(file);
        }
    }

    // Reset form data
    function resetForm() {
        newProduct = {
            name: '',
            price: 0,
            description: '',
            stock: 0,
            category: '',
            image: undefined
        };
        selectedFile = undefined;
        imagePreview = null;
    }

    // Add new product
    async function handleAddProduct() {
        if (!newProduct.name || !newProduct.price) {
            showErrorAlert('Product name and price are required');
            return;
        }

        // Make sure we're using the image from the file input
        if (imagePreview && selectedFile) {
            newProduct.image = selectedFile;
        }

        isLoading = true;
        try {
            // Add the product and get the response
            const response = await seller.addProduct(newProduct);
            console.log('Product added successfully:', response);
            
            // Explicitly reload products to update the list
            await seller.loadProducts();
            
            // Reset form and show success message
            showModal = false;
            resetForm();
            showSuccessAlert('Product added successfully');
        } catch (error) {
            console.error('Error adding product:', error);
            showErrorAlert(error instanceof Error ? error.message : 'Failed to add product');
        } finally {
            isLoading = false;
        }
    }

    // Edit product
    async function handleEditProduct() {
        if (!editProduct.id) return;

        isLoading = true;
        try {
            // Convert to ProductData format expected by the API
            const productData: Partial<ProductData> = {
                name: editProduct.name,
                price: editProduct.price,
                description: editProduct.description || undefined,
                stock: editProduct.stock,
                category: editProduct.category || undefined
            };
            
            // If we have a new image from the file input, use it
            if (imagePreview && !editProduct.image_url) {
                productData.image = selectedFile;
            }

            console.log('Updating product with data:', productData);
            const response = await seller.updateProduct(editProduct.id, productData);
            console.log('Product updated successfully:', response);
            
            // Explicitly reload products to update the list
            await seller.loadProducts();
            
            // Close modal and show success message
            showEditModal = false;
            showSuccessAlert('Product updated successfully');
        } catch (error) {
            console.error('Error updating product:', error);
            showErrorAlert(error instanceof Error ? error.message : 'Failed to update product');
        } finally {
            isLoading = false;
        }
    }

    // Delete product
    async function handleDeleteProduct() {
        if (!productToDelete) return;

        isLoading = true;
        try {
            console.log('Deleting product:', productToDelete.id);
            const response = await seller.deleteProduct(productToDelete.id);
            console.log('Product deleted successfully:', response);
            
            // Explicitly reload products to update the list
            await seller.loadProducts();
            
            showDeleteModal = false;
            showSuccessAlert('Product deleted successfully');
        } catch (error) {
            console.error('Error deleting product:', error);
            showErrorAlert(error instanceof Error ? error.message : 'Failed to delete product');
        } finally {
            isLoading = false;
            productToDelete = null;
        }
    }

    // Open edit modal with product data
    function openEditModal(product: Product) {
        editProduct = {
            id: product.id,
            name: product.name,
            price: product.price,
            description: product.description || '',
            stock: product.stock,
            category: product.category || '',
            variations: product.variations || []
        };
        imagePreview = product.image_url;
        showEditModal = true;
    }
    
    // Handle adding a variation
    function handleAddVariation() {
        if (!editProduct.variations) {
            editProduct.variations = [];
        }
        
        // Show a dialog or form to add variation details
        const size = prompt('Enter size (e.g., S, M, L):');
        const color = prompt('Enter color:');
        
        if (size && color) {
            // Create a temporary variation with required fields
            const tempVariation: Variation = {
                id: Date.now(), // Temporary ID
                product_id: editProduct.id || 0,
                size,
                color,
                stock: 0,
                price_adjustment: 0,
                sku: null,
                created_at: new Date().toISOString(),
                updated_at: null
            };
            
            editProduct.variations.push(tempVariation);
        }
    }
    
    // Handle removing a variation
    function removeVariation(id: number) {
        if (editProduct.variations) {
            editProduct.variations = editProduct.variations.filter(v => v.id !== id);
        }
    }

    // Format price to display with currency symbol
    function formatPrice(price: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }
    
    // Alert functions
    function showSuccessAlert(message: string) {
        alertType = 'success';
        alertMessage = message;
        showAlert = true;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            showAlert = false;
        }, 3000);
    }
    
    function showErrorAlert(message: string) {
        alertType = 'error';
        alertMessage = message;
        showAlert = true;
    }
    
    function showConfirmAlert(message: string) {
        alertType = 'delete-item';
        alertMessage = message;
        showAlert = true;
    }
    
    // Open delete confirmation modal
    function openDeleteModal(product: Product) {
        productToDelete = product;
        showDeleteModal = true;
    }

    // Calculate average rating
    function getAverageRating(product: Product): number {
        return product.average_rating || 0;
    }
</script>

<Header />

<div class="flex mt-16 bg-[#f6ecd3] min-h-[calc(100vh-60px)] max-md:ml-0 max-md:flex-col">
    <div class="w-full p-6 max-md:p-4 max-sm:p-3">
        <!-- Page header with action buttons -->
        <div class="flex justify-between items-center mb-6 max-sm:flex-col max-sm:items-start max-sm:gap-4">
            <div>
                <h1 class="text-2xl font-bold text-[#4a463b] mb-1">My Products</h1>
                <p class="text-[#7a6d53] text-sm">Manage your store's product inventory</p>
            </div>
            <button 
                class="bg-[#7da6c7] text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-[#5a89af] transition-colors shadow-sm"
                on:click={() => showModal = true}
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Product
            </button>
        </div>

        <!-- Loading state -->
        {#if isLoading && $seller.products.length === 0}
            <div class="flex justify-center items-center py-16">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7da6c7]"></div>
            </div>
        <!-- Empty state -->
        {:else if $seller.products.length === 0}
            <div class="bg-white rounded-xl shadow-sm p-8 flex flex-col justify-center items-center py-16 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 class="text-2xl font-semibold text-gray-700 mb-3">No Products Yet</h3>
                <p class="text-gray-500 mb-8 max-w-md">Start adding products to your store to begin selling. Your products will appear here once created.</p>
                <button 
                    class="px-6 py-3 bg-[#7da6c7] text-white rounded-xl font-medium hover:bg-[#5a89af] transition-colors shadow-sm flex items-center gap-2"
                    on:click={() => showModal = true}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Your First Product
                </button>
            </div>
        {:else}
            <!-- Products grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
                <!-- Add new product card -->
                <button 
                    class="bg-white rounded-xl shadow-sm p-6 flex flex-col justify-center items-center cursor-pointer border-2 border-dashed border-[#e2dbc7] text-[#7a6d53] hover:border-[#7da6c7] hover:text-[#7da6c7] transition-all min-h-[280px] w-full" 
                    on:click={() => showModal = true}
                    aria-label="Add new product"
                >
                    <div class="w-16 h-16 rounded-full bg-[#f8f5ee] flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold mb-2">Add New Product</h3>
                    <p class="text-center text-sm text-gray-500">Click here to add a new product to your store</p>
                </button>
                
                <!-- Product cards -->
                {#each $seller.products as product (product.id)}
                    <div class="bg-white rounded-xl shadow-sm p-5 flex flex-col items-start relative hover:shadow-md transition-shadow">
                        <!-- Product image -->
                        <div class="w-full h-[200px] rounded-lg mb-4 bg-[#f8f5ee] flex items-center justify-center overflow-hidden">
                            {#if product.image_url}
                                <img class="w-full h-full object-cover" src={product.image_url} alt={product.name} />
                            {:else}
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            {/if}
                        </div>
                        
                        <!-- Product info -->
                        <div class="flex flex-col gap-2 w-full">
                            <h3 class="text-lg font-semibold text-[#4a463b] line-clamp-1">{product.name}</h3>
                            
                            <!-- Price and stock -->
                            <div class="flex justify-between items-center w-full">
                                <span class="text-[#7da6c7] font-medium text-lg">{formatPrice(product.price)}</span>
                                <span class="text-sm bg-[#f8f5ee] px-2 py-1 rounded-full text-[#7a6d53]">Stock: {product.stock || 0}</span>
                            </div>
                            
                            <!-- Rating stars -->
                            <div class="flex items-center mt-1 mb-2">
                                {#each Array(5) as _, i}
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 {i < getAverageRating(product) ? 'text-yellow-400' : 'text-gray-300'}" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                {/each}
                                <span class="text-xs text-gray-500 ml-1">{getAverageRating(product).toFixed(1)}</span>
                            </div>
                            
                            <!-- Category tag if available -->
                            {#if product.category}
                                <div class="text-xs text-[#7a6d53] bg-[#f8f5ee] inline-block px-2 py-1 rounded-full w-fit mb-2">
                                    {product.category}
                                </div>
                            {/if}
                            
                            <!-- Action buttons -->
                            <div class="flex gap-3 mt-auto pt-3 border-t border-[#f0eadb]">
                                <button 
                                    class="flex-1 py-2 px-3 bg-[#f0e9d6] text-[#7a6d53] rounded-lg hover:bg-[#e6dfc8] transition-colors text-sm font-medium flex items-center justify-center gap-1"
                                    on:click={() => openEditModal(product)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    Edit
                                </button>
                                <button 
                                    class="flex-1 py-2 px-3 bg-[#f8e1e1] text-[#c76e6e] rounded-lg hover:bg-[#f5d4d4] transition-colors text-sm font-medium flex items-center justify-center gap-1"
                                    on:click={() => openDeleteModal(product)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

{#if showModal}
<div class="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4 overflow-y-auto">
    <div class="bg-white rounded-xl shadow-lg p-6 max-w-[900px] w-[90vw] max-h-[85vh] overflow-y-auto flex flex-col gap-5 max-[1100px]:max-w-[98vw] max-[600px]:w-[99vw] my-4">
        <div class="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-gray-100">
            <h2 class="text-xl font-bold text-[#4a463b]">Add New Product</h2>
            <button 
                class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors" 
                on:click={() => showModal = false}
                aria-label="Close modal"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        <div class="flex gap-8 max-[900px]:flex-col max-[900px]:gap-5">
            <!-- Image upload section -->
            <div class="flex-1 flex flex-col items-center gap-4 max-[900px]:w-full">
                <div class="relative w-full h-[250px] bg-[#f8f5ee] rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                    {#if imagePreview}
                        <img class="max-w-full max-h-full object-contain" src={imagePreview} alt="Product Preview" />
                    {:else}
                        <div class="text-gray-400 flex flex-col items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span class="text-sm">No image selected</span>
                            <p class="text-xs mt-1 text-gray-400">Recommended size: 800x800px</p>
                        </div>
                    {/if}
                </div>
                
                <label class="relative cursor-pointer w-full">
                    <div class="flex items-center justify-center py-2.5 px-4 bg-[#7da6c7] text-white rounded-lg hover:bg-[#6b97ba] transition-colors gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Upload Product Image
                    </div>
                    <input 
                        type="file" 
                        class="hidden" 
                        accept="image/*"
                        on:change={handleImageChange}
                    />
                </label>
            </div>
            
            <!-- Product details section -->
            <div class="flex-[1.3] flex flex-col gap-3 max-[900px]:w-full">
                <!-- Product name -->
                <div class="mb-1">
                    <label for="product-name" class="block text-sm font-medium text-[#4a463b] mb-1">Product Name*</label>
                    <input 
                        id="product-name"
                        type="text" 
                        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[#4a463b]" 
                        placeholder="Enter product name" 
                        bind:value={newProduct.name}
                    />
                </div>
                
                <!-- Price and stock in a row -->
                <div class="grid grid-cols-2 gap-4 mb-1">
                    <div>
                        <label for="product-price" class="block text-sm font-medium text-[#4a463b] mb-1">Price*</label>
                        <input 
                            id="product-price"
                            type="number" 
                            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[#4a463b]" 
                            placeholder="0.00" 
                            bind:value={newProduct.price}
                        />
                    </div>
                    <div>
                        <label for="product-stock" class="block text-sm font-medium text-[#4a463b] mb-1">Stock*</label>
                        <input 
                            id="product-stock"
                            type="number" 
                            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[#4a463b]" 
                            placeholder="0" 
                            bind:value={newProduct.stock}
                        />
                    </div>
                </div>
                
                <!-- Description -->
                <div class="mb-1">
                    <label for="product-description" class="block text-sm font-medium text-[#4a463b] mb-1">Description*</label>
                    <textarea 
                        id="product-description"
                        class="w-full min-h-[100px] rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[#4a463b] resize-none" 
                        placeholder="Enter product description" 
                        bind:value={newProduct.description}
                    ></textarea>
                </div>
                
                <!-- Category -->
                <div class="mb-1">
                    <label for="product-category" class="block text-sm font-medium text-[#4a463b] mb-1">Category</label>
                    <input 
                        id="product-category"
                        type="text" 
                        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[#4a463b]" 
                        placeholder="Enter category (optional)" 
                        bind:value={newProduct.category}
                    />
                </div>
                
                <!-- Action buttons -->
                <div class="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button 
                        class="py-2.5 px-5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium" 
                        on:click={() => showModal = false}
                    >
                        Cancel
                    </button>
                    <button 
                        class="py-2.5 px-5 bg-[#7da6c7] text-white rounded-lg hover:bg-[#6b97ba] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                        on:click={handleAddProduct}
                        disabled={isLoading || !newProduct.name || !newProduct.price}
                    >
                        {#if isLoading}
                            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {:else}
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        {/if}
                        Create Product
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
{/if}

{#if showEditModal}
<div class="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4 overflow-y-auto">
    <div class="bg-white rounded-xl shadow-lg p-6 max-w-[900px] w-[90vw] max-h-[85vh] overflow-y-auto flex flex-col gap-5 max-[1100px]:max-w-[98vw] max-[600px]:w-[99vw] my-4">
        <div class="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-gray-100">
            <h2 class="text-xl font-bold text-[#4a463b]">Edit Product</h2>
            <button 
                class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors" 
                on:click={() => showEditModal = false}
                aria-label="Close modal"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        <div class="flex gap-8 max-[900px]:flex-col max-[900px]:gap-5">
            <!-- Image upload section -->
            <div class="flex-1 flex flex-col items-center gap-4 max-[900px]:w-full">
                <div class="relative w-full h-[250px] bg-[#f8f5ee] rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                    {#if editProduct.image_url}
                        <img class="max-w-full max-h-full object-contain" src={editProduct.image_url} alt="Product" />
                    {:else if imagePreview}
                        <img class="max-w-full max-h-full object-contain" src={imagePreview} alt="Product Preview" />
                    {:else}
                        <div class="text-gray-400 flex flex-col items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span class="text-sm">No image selected</span>
                            <p class="text-xs mt-1 text-gray-400">Recommended size: 800x800px</p>
                        </div>
                    {/if}
                </div>
                
                <label class="relative cursor-pointer w-full">
                    <div class="flex items-center justify-center py-2.5 px-4 bg-[#7da6c7] text-white rounded-lg hover:bg-[#6b97ba] transition-colors gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Change Product Image
                    </div>
                    <input 
                        type="file" 
                        class="hidden" 
                        accept="image/*"
                        on:change={handleEditFileChange}
                    />
                </label>
            </div>
            
            <!-- Product details section -->
            <div class="flex-[1.3] flex flex-col gap-3 max-[900px]:w-full">
                <!-- Product name -->
                <div class="mb-1">
                    <label for="edit-product-name" class="block text-sm font-medium text-[#4a463b] mb-1">Product Name*</label>
                    <input 
                        id="edit-product-name"
                        type="text" 
                        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[#4a463b]" 
                        placeholder="Enter product name" 
                        bind:value={editProduct.name}
                    />
                </div>
                
                <!-- Price and stock in a row -->
                <div class="grid grid-cols-2 gap-4 mb-1">
                    <div>
                        <label for="edit-product-price" class="block text-sm font-medium text-[#4a463b] mb-1">Price*</label>
                        <input 
                            id="edit-product-price"
                            type="number" 
                            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[#4a463b]" 
                            placeholder="0.00" 
                            bind:value={editProduct.price}
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div>
                        <label for="edit-product-stock" class="block text-sm font-medium text-[#4a463b] mb-1">Stock*</label>
                        <input 
                            id="edit-product-stock"
                            type="number" 
                            class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[#4a463b]" 
                            placeholder="0" 
                            bind:value={editProduct.stock}
                            min="0"
                        />
                    </div>
                </div>
                
                <!-- Description -->
                <div class="mb-1">
                    <label for="edit-product-description" class="block text-sm font-medium text-[#4a463b] mb-1">Description*</label>
                    <textarea 
                        id="edit-product-description"
                        class="w-full min-h-[100px] rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[#4a463b] resize-none" 
                        placeholder="Enter product description" 
                        bind:value={editProduct.description}
                    ></textarea>
                </div>
                
                <!-- Category -->
                <div class="mb-1">
                    <label for="edit-product-category" class="block text-sm font-medium text-[#4a463b] mb-1">Category</label>
                    <input 
                        id="edit-product-category"
                        type="text" 
                        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-[#4a463b]" 
                        placeholder="Enter category (optional)" 
                        bind:value={editProduct.category}
                    />
                </div>
                
                <!-- Action buttons -->
                <div class="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button 
                        class="py-2.5 px-5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium" 
                        on:click={() => showEditModal = false}
                    >
                        Cancel
                    </button>
                    <button 
                        class="py-2.5 px-5 bg-[#7da6c7] text-white rounded-lg hover:bg-[#6b97ba] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                        on:click={handleEditProduct}
                        disabled={isLoading || !editProduct.name || !editProduct.price}
                    >
                        {#if isLoading}
                            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {:else}
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        {/if}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
{/if}

{#if showDeleteModal}
<div class="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4 overflow-y-auto">
    <div class="bg-white rounded-xl shadow-lg p-6 max-w-[500px] w-[90vw] flex flex-col gap-5 max-[600px]:w-[95vw] my-4">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-[#4a463b]">Delete Product</h2>
            <button 
                class="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors" 
                on:click={() => showDeleteModal = false}
                aria-label="Close modal"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        <div class="flex flex-col items-center text-center gap-4">
            <div class="text-[#c76e6e] bg-[#f8e1e1] w-20 h-20 rounded-full flex items-center justify-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </div>
            <h3 class="text-xl font-semibold text-[#4a463b] mb-1">Delete {productToDelete?.name || 'Product'}?</h3>
            <p class="text-gray-600 mb-6">This action cannot be undone. The product will be permanently removed from your store.</p>
            
            <div class="flex gap-4 w-full">
                <button 
                    class="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium" 
                    on:click={() => showDeleteModal = false}
                >
                    Cancel
                </button>
                <button 
                    class="flex-1 py-2.5 px-4 bg-[#f8e1e1] text-[#c76e6e] rounded-lg hover:bg-[#f5d4d4] transition-colors font-medium flex items-center justify-center gap-2" 
                    on:click={() => {
                        showDeleteModal = false;
                        showConfirmAlert(`Are you sure you want to delete ${productToDelete?.name}?`);
                    }}
                    disabled={isLoading}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Product
                </button>
            </div>
        </div>
    </div>
</div>
{/if}

<!-- Alerts component for notifications -->
<Alerts 
    isVisible={showAlert}
    type={alertType}
    title={alertType === 'success' ? 'Success' : alertType === 'error' ? 'Error' : 'Confirm'}
    cartAdded={alertMessage}
    autoDismiss={alertType !== 'delete-item'}
    on:close={() => showAlert = false}
    on:confirm={() => {
        if (alertType === 'delete-item' && productToDelete) {
            handleDeleteProduct();
        }
    }}
/>
