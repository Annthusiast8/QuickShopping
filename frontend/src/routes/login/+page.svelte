<script lang="ts">
    import { goto } from "$app/navigation";
    import { api } from "$lib/services/api";
    import { auth } from "$lib/stores/auth";
    import type { LoginResponse } from "$lib/services/api";
  
    interface FormData {
      email: string;
      password: string;
    }

    let formData: FormData = {
      email: "",
      password: "",
    };
  
    let error = "";
    let success = "";
    let isLoading = false;
  
    async function handleLogin() {
      isLoading = true;
      error = "";
      try {
        const response = await api.login(formData);
  
        if (response.token) {
          await auth.login(response.token, response.user);
          success = response.message;
  
          // Use the direct role property instead of roles array
          const userRole = response.user.role || 'customer';
          
          switch (userRole) {
            case "admin":
              goto("/page-admin/users");
              break;
            case "seller":
              goto("/page-seller/profile");
              break;
            case "customer":
              goto("/page-customer/profile");
              break;
            default:
              goto("/");
              break;
          }
        } else {
          error = response.message || "Login failed";
        }
      } catch (err: any) {
        error = err.response?.data?.message || "An error occurred. Please try again.";
        console.error("Login error:", err);
      } finally {
        isLoading = false;
      }
    }
  </script>

<div class="min-h-screen flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative">
      {#if error}
        <div class="absolute -top-4 left-0 right-0 mx-4">
          <p class="bg-red-100 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </p>
        </div>
      {/if}
  
      {#if success}
        <div class="absolute -top-4 left-0 right-0 mx-4">
          <p class="bg-green-100 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
            {success}
          </p>
        </div>
      {/if}
  
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-[#21463E] mb-2">
          Quick<span class="text-yellow-500">Buy</span>
        </h1>
        <p class="text-gray-600 text-sm">Shop in a Snap with us!</p>
      </div>
  
      <form on:submit|preventDefault={handleLogin} class="space-y-4">
        <div class="space-y-2">
          <label for="email" class="text-sm font-medium text-gray-700">Email</label>
          <div class="relative">
            <input
              id="email"
              type="email"
              required
              bind:value={formData.email}
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#21463E] focus:border-transparent transition-all outline-none text-gray-800"
              placeholder="Enter your email"
            />
          </div>
        </div>
  
        <div class="space-y-2">
          <label for="password" class="text-sm font-medium text-gray-700">Password</label>
          <div class="relative">
            <input
              id="password"
              type="password"
              required
              bind:value={formData.password}
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#21463E] focus:border-transparent transition-all outline-none text-gray-800"
              placeholder="Enter your password"
            />
          </div>
        </div>
  
        <button
          type="submit"
          class="w-full bg-[#21463E] text-white py-3 rounded-lg font-medium hover:bg-[#2d5d52] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={isLoading}
        >
          {#if isLoading}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          {/if}
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
  
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Don't have an account?</span>
          </div>
        </div>
  
        <div class="flex space-x-4">
          <button
            type="button"
            on:click={() => goto('/register/customer')}
            class="flex-1 bg-white text-[#21463E] border-2 border-[#21463E] py-3 rounded-lg font-medium hover:bg-[#21463E] hover:text-white transition-colors duration-200"
          >
            Register as customer
          </button>
          
          <button
            type="button"
            on:click={() => goto('/register/seller')}
            class="flex-1 bg-white text-[#21463E] border-2 border-[#21463E] py-3 rounded-lg font-medium hover:bg-[#21463E] hover:text-white transition-colors duration-200"
          >
            Register as seller
          </button>
        </div>
      </form>
    </div>
  </div>
  
  
  