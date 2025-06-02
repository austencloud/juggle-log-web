<!-- src/routes/profile/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { enhancedUserStore } from '$lib/stores/enhancedUserStore';
  import { gamificationStore } from '$lib/stores/gamificationStore';
  import { achievementStore } from '$lib/stores/achievementStore';
  import UserProfile from '$lib/components/auth/UserProfile.svelte';
  import AuthModal from '$lib/components/auth/AuthModal.svelte';
  import UserManagement from '$lib/components/ui/UserManagement.svelte';

  let showAuthModal = false;
  let authMode: 'signin' | 'signup' = 'signin';
  let activeTab: 'profile' | 'stats' | 'achievements' | 'users' = 'profile';

  // Reactive state
  $: isAuthenticated = $enhancedUserStore.isAuthenticated;
  $: currentUser = $enhancedUserStore.currentUser;
  $: gamificationState = $gamificationStore;
  $: achievements = $achievementStore.achievements;

  function openAuth(mode: 'signin' | 'signup') {
    authMode = mode;
    showAuthModal = true;
  }

  function closeAuthModal() {
    showAuthModal = false;
  }

  function setActiveTab(tab: typeof activeTab) {
    activeTab = tab;
  }

  // Calculate achievement stats
  $: achievementStats = (() => {
    const achievementList = Object.values(achievements);
    const completed = achievementList.filter(a => a.completed).length;
    const total = achievementList.length;
    const totalXP = achievementList
      .filter(a => a.completed)
      .reduce((sum, a) => sum + a.xpReward, 0);
    
    return { completed, total, totalXP };
  })();
</script>

<svelte:head>
  <title>Profile - Juggle Log</title>
  <meta name="description" content="Manage your juggling profile, view stats, and track achievements" />
</svelte:head>

<div class="profile-page">
  {#if !isAuthenticated}
    <!-- Not authenticated state -->
    <div class="auth-prompt">
      <div class="auth-content">
        <h1>👤 Your Profile</h1>
        <p>Sign in to access your profile, track your progress, and submit world records.</p>
        
        <div class="auth-buttons">
          <button class="auth-btn primary" on:click={() => openAuth('signin')}>
            Sign In
          </button>
          <button class="auth-btn secondary" on:click={() => openAuth('signup')}>
            Create Account
          </button>
        </div>

        <div class="legacy-section">
          <h3>Continue with Local Account</h3>
          <p>Manage your local practice data without creating an online account.</p>
          <UserManagement />
        </div>
      </div>
    </div>
  {:else}
    <!-- Authenticated state -->
    <div class="profile-header">
      <h1>👤 Profile</h1>
      <p>Manage your account and view your juggling progress</p>
    </div>

    <div class="profile-content">
      <!-- Tab Navigation -->
      <nav class="tab-nav">
        <button 
          class="tab-btn" 
          class:active={activeTab === 'profile'}
          on:click={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button 
          class="tab-btn" 
          class:active={activeTab === 'stats'}
          on:click={() => setActiveTab('stats')}
        >
          Statistics
        </button>
        <button 
          class="tab-btn" 
          class:active={activeTab === 'achievements'}
          on:click={() => setActiveTab('achievements')}
        >
          Achievements
        </button>
        <button 
          class="tab-btn" 
          class:active={activeTab === 'users'}
          on:click={() => setActiveTab('users')}
        >
          Account
        </button>
      </nav>

      <!-- Tab Content -->
      <div class="tab-content">
        {#if activeTab === 'profile' && currentUser}
          <UserProfile user={currentUser} />
        
        {:else if activeTab === 'stats'}
          <div class="stats-section">
            <h2>📊 Your Statistics</h2>
            
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">🎯</div>
                <div class="stat-content">
                  <h3>Level {gamificationState.level}</h3>
                  <p>{gamificationState.totalXP} Total XP</p>
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      style="width: {(gamificationState.currentLevelXP / (gamificationState.currentLevelXP + gamificationState.xpToNextLevel)) * 100}%"
                    ></div>
                  </div>
                  <small>{gamificationState.xpToNextLevel} XP to next level</small>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">🏆</div>
                <div class="stat-content">
                  <h3>{achievementStats.completed}/{achievementStats.total}</h3>
                  <p>Achievements Unlocked</p>
                  <small>{achievementStats.totalXP} XP from achievements</small>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon">⭐</div>
                <div class="stat-content">
                  <h3>{currentUser?.verification_level || 'basic'}</h3>
                  <p>Verification Level</p>
                  <small>Reputation: {currentUser?.reputation_score || 0}</small>
                </div>
              </div>
            </div>
          </div>

        {:else if activeTab === 'achievements'}
          <div class="achievements-section">
            <h2>🏆 Achievements</h2>
            
            <div class="achievement-stats">
              <p>
                <strong>{achievementStats.completed}</strong> of <strong>{achievementStats.total}</strong> achievements unlocked
                ({Math.round((achievementStats.completed / achievementStats.total) * 100)}%)
              </p>
            </div>

            <div class="achievements-grid">
              {#each Object.values(achievements) as achievement}
                <div class="achievement-card" class:completed={achievement.completed}>
                  <div class="achievement-icon">
                    {achievement.completed ? '🏆' : '🔒'}
                  </div>
                  <div class="achievement-content">
                    <h4>{achievement.name}</h4>
                    <p>{achievement.description}</p>
                    <div class="achievement-meta">
                      <span class="xp-reward">+{achievement.xpReward} XP</span>
                      {#if achievement.completed && achievement.completionDate}
                        <span class="completion-date">
                          Completed {new Date(achievement.completionDate).toLocaleDateString()}
                        </span>
                      {:else}
                        <span class="progress">
                          {achievement.currentValue}/{achievement.requiredValue}
                        </span>
                      {/if}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>

        {:else if activeTab === 'users'}
          <div class="users-section">
            <h2>👥 Account Management</h2>
            <UserManagement />
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<!-- Auth Modal -->
{#if showAuthModal}
  <AuthModal 
    isOpen={showAuthModal}
    mode={authMode}
    on:close={closeAuthModal}
  />
{/if}

<style>
  .profile-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    min-height: calc(100vh - 4rem);
  }

  .auth-prompt {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
  }

  .auth-content {
    text-align: center;
    max-width: 500px;
    padding: 2rem;
    background: var(--card-background);
    border-radius: var(--border-radius-md);
    border: 1px solid var(--border-color);
  }

  .auth-content h1 {
    margin: 0 0 1rem 0;
    color: var(--header-color);
  }

  .auth-content p {
    color: var(--text-light);
    margin-bottom: 2rem;
  }

  .auth-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 2rem;
  }

  .auth-btn {
    padding: 0.75rem 1.5rem;
    border-radius: var(--border-radius-md);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    border: none;
  }

  .auth-btn.primary {
    background: var(--primary-color);
    color: white;
  }

  .auth-btn.primary:hover {
    background: var(--primary-dark);
  }

  .auth-btn.secondary {
    background: transparent;
    color: var(--text-color);
    border: 1px solid var(--border-color);
  }

  .auth-btn.secondary:hover {
    background: var(--border-color);
  }

  .legacy-section {
    border-top: 1px solid var(--border-color);
    padding-top: 2rem;
    margin-top: 2rem;
  }

  .legacy-section h3 {
    margin: 0 0 0.5rem 0;
    color: var(--header-color);
  }

  .legacy-section p {
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }

  .profile-header {
    margin-bottom: 2rem;
  }

  .profile-header h1 {
    margin: 0 0 0.5rem 0;
    color: var(--header-color);
  }

  .profile-header p {
    color: var(--text-light);
    margin: 0;
  }

  .tab-nav {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid var(--border-color);
  }

  .tab-btn {
    background: none;
    border: none;
    padding: 0.75rem 1rem;
    cursor: pointer;
    color: var(--text-light);
    border-bottom: 2px solid transparent;
    transition: all 0.3s;
    font-weight: 500;
  }

  .tab-btn:hover {
    color: var(--text-color);
  }

  .tab-btn.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
  }

  .stat-card {
    background: var(--card-background);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-md);
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .stat-icon {
    font-size: 2rem;
    flex-shrink: 0;
  }

  .stat-content h3 {
    margin: 0 0 0.25rem 0;
    color: var(--header-color);
  }

  .stat-content p {
    margin: 0 0 0.5rem 0;
    color: var(--text-light);
  }

  .stat-content small {
    color: var(--text-light);
    font-size: 0.8rem;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: var(--border-color);
    border-radius: 3px;
    overflow: hidden;
    margin: 0.5rem 0;
  }

  .progress-fill {
    height: 100%;
    background: var(--primary-color);
    transition: width 0.3s;
  }

  .achievement-stats {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: var(--card-background);
    border-radius: var(--border-radius-md);
    border: 1px solid var(--border-color);
  }

  .achievements-grid {
    display: grid;
    gap: 1rem;
  }

  .achievement-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--card-background);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-md);
    opacity: 0.6;
    transition: all 0.3s;
  }

  .achievement-card.completed {
    opacity: 1;
    border-color: var(--primary-color);
  }

  .achievement-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .achievement-content {
    flex: 1;
  }

  .achievement-content h4 {
    margin: 0 0 0.25rem 0;
    color: var(--header-color);
  }

  .achievement-content p {
    margin: 0 0 0.5rem 0;
    color: var(--text-light);
    font-size: 0.9rem;
  }

  .achievement-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
  }

  .xp-reward {
    color: var(--primary-color);
    font-weight: 600;
  }

  .completion-date,
  .progress {
    color: var(--text-light);
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .profile-page {
      padding: 1rem;
    }

    .auth-buttons {
      flex-direction: column;
    }

    .tab-nav {
      flex-wrap: wrap;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .stat-card {
      flex-direction: column;
      text-align: center;
    }

    .achievement-card {
      flex-direction: column;
      text-align: center;
    }

    .achievement-meta {
      flex-direction: column;
      gap: 0.25rem;
    }
  }
</style>
