<script lang="ts">
  import { goto } from "$app/navigation";
  import { api } from "$lib/services/api";
  import type { ApiResponse } from "$lib/services/api";

  let errorMessage = "";
  let successMessage = "";
  let isLoading = false;
  let showPassword = false;
  let showRepeatPassword = false;

  interface SellerData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    shop_name: string;
    role: string;
  }

  let userData: SellerData = {
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "seller",
    shop_name: ""
  };

  async function submitForm() {
    errorMessage = "";
    successMessage = "";
    isLoading = true;

    if (userData.password !== userData.password_confirmation) {
      errorMessage = "Passwords do not match";
      isLoading = false;
      return;
    }

    if (!userData.shop_name.trim()) {
      errorMessage = "Shop name is required";
      isLoading = false;
      return;
    }

    try {
      const response = await api.register('seller', userData);

      if (response.message) {
        successMessage = "Registration successful! Redirecting...";
        userData = {
          name: "",
          email: "",
          password: "",
          password_confirmation: "",
          role: "seller",
          shop_name: ""
        };

        setTimeout(() => {
          goto("/login");
        }, 2000);
      } else {
        errorMessage = response.message || "Registration failed!";
      }
    } catch (error: any) {
      errorMessage = error.message || "Connection error - please try again";
      console.error('Registration error:', error);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat p-0 sm:p-4" style="background-image: url('/Register.png');">
  <div class="relative z-10 bg-[#FFF5E0]/95 w-full min-h-screen sm:min-h-fit sm:w-auto sm:max-w-md md:max-w-lg p-4 sm:p-8 md:p-10 rounded-none sm:rounded-2xl shadow-2xl flex flex-col justify-center text-center">
    {#if errorMessage}
      <div class="absolute -top-4 left-0 right-0 mx-4">
        <p class="bg-red-100 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
          {errorMessage}
        </p>
      </div>
    {/if}

    {#if successMessage}
      <div class="absolute -top-4 left-0 right-0 mx-4">
        <p class="bg-green-100 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
          {successMessage}
        </p>
      </div>
    {/if}

    <img src="/SLOGAN.png" alt="QuickShopping Slogan" class="mx-auto mb-6 max-w-[85%] h-auto object-contain" />

    <form on:submit|preventDefault={submitForm} class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2 text-left">
          <label for="shop_name" class="block text-sm font-medium text-gray-700">Shop Name</label>
          <input
            id="shop_name"
            type="text"
            required
            bind:value={userData.shop_name}
            class="w-full px-4 py-2 bg-[#FFF5E0]/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-800"
            placeholder="Your Shop Name"
          />
        </div>

        <div class="space-y-2 text-left">
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            required
            bind:value={userData.email}
            class="w-full px-4 py-2 bg-[#FFF5E0]/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-800"
            placeholder="shop@email.com"
          />
        </div>
      </div>

      <div class="space-y-2 text-left">
        <label for="name" class="block text-sm font-medium text-gray-700">Username</label>
        <input
          id="name"
          type="text"
          required
          bind:value={userData.name}
          class="w-full px-4 py-2 bg-[#FFF5E0]/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-800"
          placeholder="Enter your name"
        />
      </div>

      <div class="space-y-2 text-left">
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <div class="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            bind:value={userData.password}
            class="w-full px-4 py-2 bg-[#FFF5E0]/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-800 pr-10"
            placeholder="password"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2"
            on:click={() => showPassword = !showPassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {#if showPassword}
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" class="text-gray-500">
                <path stroke="currentColor" stroke-width="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/>
                <circle cx="12" cy="12" r="3.5" stroke="currentColor" stroke-width="2"/>
              </svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" class="text-gray-500">
                <path stroke="currentColor" stroke-width="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/>
                <circle cx="12" cy="12" r="3.5" stroke="currentColor" stroke-width="2"/>
                <path stroke="currentColor" stroke-width="2" d="M4 4l16 16"/>
              </svg>
            {/if}
          </button>
        </div>
      </div>

      <div class="space-y-2 text-left">
        <label for="password_confirmation" class="block text-sm font-medium text-gray-700">Repeat Password</label>
        <div class="relative">
          <input
            id="password_confirmation"
            type={showRepeatPassword ? 'text' : 'password'}
            required
            bind:value={userData.password_confirmation}
            class="w-full px-4 py-2 bg-[#FFF5E0]/80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-800 pr-10"
            placeholder="password"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2"
            on:click={() => showRepeatPassword = !showRepeatPassword}
            aria-label={showRepeatPassword ? 'Hide password' : 'Show password'}
          >
            {#if showRepeatPassword}
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" class="text-gray-500">
                <path stroke="currentColor" stroke-width="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/>
                <circle cx="12" cy="12" r="3.5" stroke="currentColor" stroke-width="2"/>
              </svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" class="text-gray-500">
                <path stroke="currentColor" stroke-width="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/>
                <circle cx="12" cy="12" r="3.5" stroke="currentColor" stroke-width="2"/>
                <path stroke="currentColor" stroke-width="2" d="M4 4l16 16"/>
              </svg>
            {/if}
          </button>
        </div>
      </div>

      <div class="text-right">
        <a href="/forgot-password" class="text-blue-600 hover:underline text-sm">Forgot Password?</a>
      </div>

      <button
        type="submit"
        class="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        disabled={isLoading}
      >
        {#if isLoading}
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        {/if}
        {isLoading ? 'Creating account...' : 'Register as a Seller!'}
      </button>

      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-200"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-[#FFF5E0]/95 text-gray-500">Want to shop with us?</span>
        </div>
      </div>

      <div class="space-y-2">
        <a href="/login" class="block text-blue-600 hover:underline">Log In</a>
        <p class="text-gray-600">
          Want to shop instead?
          <a href="/register/customer" class="text-blue-600 hover:underline">Register as a Customer</a>
        </p>
      </div>
    </form>
  </div>
</div>

