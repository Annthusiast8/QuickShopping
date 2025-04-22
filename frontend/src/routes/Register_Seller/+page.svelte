<script lang="ts">
    import type { PageData } from '../Register_Seller/$types';
    import { goto } from '$app/navigation';

    let shopName = '';
    let email = '';
    let password = '';
    let repeatPassword = '';
    let showPassword = false;
    let showRepeatPassword = false;
  
    function handleRegister() {
      // Add your seller registration logic here
      console.log('Registering Seller with:', { shopName, email, password, repeatPassword });
    }
    function goToCustomerRegister() {
      goto('/Register_Customer');
    }
</script>

<!-- ===================
  PAGE BACKGROUND SECTION
=================== -->
<div class="register-bg">

  <!-- ===================
    REGISTRATION CARD CONTAINER
  =================== -->
  <div class="register-container">
    
    <!-- Slogan/Logo Image -->
    <img src="/SLOGAN.png" alt="QuickShopping Slogan" class="slogan-img" />

    <!-- ===================
      REGISTRATION FORM SECTION
    =================== -->
    <form class="register-form" on:submit|preventDefault={handleRegister}>
      <!-- Shop Name and Email Row -->
      <div class="form-row">
        <div class="form-group">
          <label for="shopName">Shop Name:</label>
          <input
            type="text"
            id="shopName"
            bind:value={shopName}
            placeholder="Your Shop Name"
            required
          />
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input
            type="email"
            id="email"
            bind:value={email}
            placeholder="shop@email.com"
            required
          />
        </div>
      </div>
      <!-- Password Field -->
      <div class="form-group password-group">
        <label for="password">Password:</label>
        <div class="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            bind:value={password}
            placeholder="password"
            required
          />
          <button type="button" class="eye-btn" tabindex="-1" on:click={() => showPassword = !showPassword} aria-label={showPassword ? 'Hide password' : 'Show password'}>
            {#if showPassword}
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="#888" stroke-width="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="3.5" stroke="#888" stroke-width="2"/></svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="#888" stroke-width="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="3.5" stroke="#888" stroke-width="2"/><path stroke="#888" stroke-width="2" d="M4 4l16 16"/></svg>
            {/if}
          </button>
        </div>
      </div>
      <!-- Repeat Password Field -->
      <div class="form-group password-group">
        <label for="repeat-password">Repeat Password:</label>
        <div class="password-wrapper">
          <input
            type={showRepeatPassword ? 'text' : 'password'}
            id="repeat-password"
            bind:value={repeatPassword}
            placeholder="password"
            required
          />
          <button type="button" class="eye-btn" tabindex="-1" on:click={() => showRepeatPassword = !showRepeatPassword} aria-label={showRepeatPassword ? 'Hide password' : 'Show password'}>
            {#if showRepeatPassword}
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="#888" stroke-width="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="3.5" stroke="#888" stroke-width="2"/></svg>
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="#888" stroke-width="2" d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="3.5" stroke="#888" stroke-width="2"/><path stroke="#888" stroke-width="2" d="M4 4l16 16"/></svg>
            {/if}
          </button>
        </div>
      </div>
      <!-- Forgot Password Link -->
      <p class="forgot-password">
        <a href="/forgot-password">Forgot Password?</a>
      </p>
      <!-- Register Button -->
      <button type="submit" class="register-btn">Register as a Seller!</button>
    </form>
    <!-- Login and Customer Links -->
    <p class="login-link">
      Already have a seller account? <a href="/login">Log In</a>
    </p>
    

<!-- ...rest of your markup... -->
<p class="seller-link">
  Want to shop instead? <a href="/Register_Customer" on:click|preventDefault={goToCustomerRegister}>Register as a Customer</a>
</p>
  </div>
</div>

<style>
.register-bg {
  min-height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  background: url('/Register.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 0;
}

.register-container {
  position: relative;
  z-index: 2;
  background: rgba(255, 245, 224, 0.95);
  padding: 2.5rem 2rem;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(60,60,60,0.18);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

/* ===================
  FORM LAYOUT
=================== */
.register-form {
  width: 100%;
}
.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.form-row .form-group {
  flex: 1 1 0;
  margin-bottom: 0;
}
@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
.form-group {
  margin-bottom: 1rem;
  text-align: left;
}
.form-group label {
  display: block;
  font-size: 0.98rem;
  color: #3a3a3a;
  margin-bottom: 0.3rem;
}
/* ===================
  TEXT FIELD STYLES
=================== */
.form-group input {
  width: 100%;
  padding: 0.55rem 0.9rem;
  font-size: 1.05rem;
  border: 1px solid #d3d3d3;
  border-radius: 7px;
  outline: none;
  margin-top: 0.1rem;
  box-sizing: border-box;
  transition: border 0.2s, box-shadow 0.2s;
  background: rgba(255, 250, 236, 0.8);
}
/* ===================
  PASSWORD VISIBILITY TOGGLE
=================== */
.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.password-wrapper input {
  padding-right: 2.2rem;
}
.eye-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  height: 100%;
}
.eye-btn svg {
  display: block;
  pointer-events: none;
}
.password-group {
  margin-bottom: 1rem;
}
.form-group input:focus {
  border: 1.5px solid #4A90E2;
  box-shadow: 0 0 0 2px #eaf4fd;
}
/* ===================
  LINKS AND BUTTONS
=================== */
.forgot-password {
  text-align: right;
  margin-bottom: 1.2rem;
}
.forgot-password a {
  color: #4A90E2;
  font-size: 0.98rem;
  text-decoration: none;
  transition: text-decoration 0.2s;
}
.forgot-password a:hover {
  text-decoration: underline;
}
.register-btn {
  width: 100%;
  background: #4A90E2;
  color: #fff;
  padding: 0.65rem 0;
  border: none;
  border-radius: 7px;
  font-size: 1.07rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 0.5rem;
}
.register-btn:hover {
  background: #357ABD;
}
.login-link, .seller-link {
  color: #444;
  font-size: 0.98rem;
  margin-top: 0.7rem;
}
.login-link a, .seller-link a {
  color: #4A90E2;
  text-decoration: none;
  transition: text-decoration 0.2s;
}
.login-link a:hover, .seller-link a:hover {
  text-decoration: underline;
}
@media (max-width: 600px) {
  .register-container {
    padding: 1.2rem 0.5rem;
    max-width: 98vw;
  }
}
@media (max-width: 400px) {
  .register-container {
    padding: 0.7rem 0.2rem;
  }
}
/* ===================
  SLOGAN IMAGE STYLES
=================== */
.slogan-img {
  display: block;
  margin: 0 auto 1.5rem auto;
  max-width: 85%;
  height: auto;
  object-fit: contain;
}
</style>