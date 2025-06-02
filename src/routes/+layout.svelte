<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { enhancedUserStore } from '$lib/stores/enhancedUserStore';
  import { onMount } from 'svelte';
  import '../app.css';

  // Navigation items
  const navItems = [
    { href: '/', label: 'Practice', icon: '🎯' },
    { href: '/world-records', label: 'World Records', icon: '🏆' },
    { href: '/siteswap-generator', label: 'Siteswap Generator', icon: '🎲' },
    { href: '/siteswap-info', label: 'Pattern Guide', icon: '📚' },
    { href: '/profile', label: 'Profile', icon: '👤' }
  ];

  let isMenuOpen = false;
  let currentPath = '/';

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  function closeMenu() {
    isMenuOpen = false;
  }

  onMount(() => {
    // Track current path for navigation highlighting
    currentPath = window.location.pathname;
  });
</script>

<div class="app-layout">
  <nav class="main-nav">
    <div class="nav-container">
      <div class="nav-brand">
        <a href="/" class="brand-link">
          <span class="brand-icon">🤹</span>
          <span class="brand-text">Juggle Log</span>
        </a>
      </div>

      <!-- Mobile menu button -->
      <button class="mobile-menu-btn" on:click={toggleMenu} aria-label="Toggle menu">
        <span class="hamburger" class:open={isMenuOpen}></span>
      </button>

      <!-- Navigation links -->
      <div class="nav-links" class:open={isMenuOpen}>
        {#each navItems as item}
          <a
            href={item.href}
            class="nav-link"
            class:active={currentPath === item.href}
            on:click={closeMenu}
          >
            <span class="nav-icon">{item.icon}</span>
            <span class="nav-label">{item.label}</span>
          </a>
        {/each}

        <!-- User info -->
        {#if $enhancedUserStore.isAuthenticated && $enhancedUserStore.currentUser}
          <div class="user-info">
            <span class="user-name">{$enhancedUserStore.currentUser.display_name || $enhancedUserStore.currentUser.username}</span>
            <button class="logout-btn" on:click={() => enhancedUserStore.logoutUser()}>
              Logout
            </button>
          </div>
        {/if}
      </div>
    </div>
  </nav>

  <main class="main-content">
    <slot />
  </main>
</div>

<style>
  .app-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .main-nav {
    background: var(--card-background);
    border-bottom: 1px solid var(--border-color);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .nav-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 4rem;
  }

  .nav-brand {
    flex-shrink: 0;
  }

  .brand-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: var(--text-color);
    font-weight: 600;
    font-size: 1.25rem;
  }

  .brand-icon {
    font-size: 1.5rem;
  }

  .mobile-menu-btn {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    color: var(--text-color);
  }

  .hamburger {
    display: block;
    width: 1.5rem;
    height: 2px;
    background: currentColor;
    position: relative;
    transition: background 0.3s;
  }

  .hamburger::before,
  .hamburger::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 2px;
    background: currentColor;
    transition: transform 0.3s;
  }

  .hamburger::before {
    top: -0.5rem;
  }

  .hamburger::after {
    bottom: -0.5rem;
  }

  .hamburger.open {
    background: transparent;
  }

  .hamburger.open::before {
    transform: rotate(45deg) translate(0.35rem, 0.35rem);
  }

  .hamburger.open::after {
    transform: rotate(-45deg) translate(0.35rem, -0.35rem);
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    text-decoration: none;
    color: var(--text-light);
    border-radius: var(--border-radius-md);
    transition: all 0.3s;
    font-weight: 500;
  }

  .nav-link:hover {
    color: var(--text-color);
    background: rgba(255, 255, 255, 0.05);
  }

  .nav-link.active {
    color: var(--primary-color);
    background: rgba(78, 205, 196, 0.1);
  }

  .nav-icon {
    font-size: 1.1rem;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-left: 2rem;
    border-left: 1px solid var(--border-color);
  }

  .user-name {
    color: var(--text-color);
    font-weight: 500;
  }

  .logout-btn {
    background: none;
    border: 1px solid var(--border-color);
    color: var(--text-light);
    padding: 0.25rem 0.75rem;
    border-radius: var(--border-radius-sm);
    cursor: pointer;
    transition: all 0.3s;
    font-size: 0.9rem;
  }

  .logout-btn:hover {
    color: var(--text-color);
    border-color: var(--text-light);
  }

  .main-content {
    flex: 1;
  }

  /* Mobile styles */
  @media (max-width: 768px) {
    .mobile-menu-btn {
      display: block;
    }

    .nav-links {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--card-background);
      border-bottom: 1px solid var(--border-color);
      flex-direction: column;
      gap: 0;
      padding: 1rem;
      transform: translateY(-100%);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s;
    }

    .nav-links.open {
      transform: translateY(0);
      opacity: 1;
      visibility: visible;
    }

    .nav-link {
      width: 100%;
      justify-content: flex-start;
      padding: 0.75rem 1rem;
    }

    .user-info {
      width: 100%;
      padding-left: 1rem;
      border-left: none;
      border-top: 1px solid var(--border-color);
      padding-top: 1rem;
      margin-top: 1rem;
      justify-content: space-between;
    }
  }
</style>
