// src/lib/utils/dataMigration.ts
import { supabase } from '../supabase'
import { isBrowser } from './browser'
import type { Database } from '../types/database'

type UserRow = Database['public']['Tables']['users']['Row']
type PersonalRecordInsert = Database['public']['Tables']['personal_records']['Insert']
type UserGamificationInsert = Database['public']['Tables']['user_gamification']['Insert']
type UserAchievementInsert = Database['public']['Tables']['user_achievements']['Insert']

interface LocalStorageUser {
  id: string
  username: string
  createdAt: number
  lastLogin: number
}

interface LocalStorageProgressData {
  completedPatterns: string[]
  maxCatches: Record<string, number>
  lastUpdatedDates: Record<string, string>
}

interface LocalStorageGamificationState {
  level: number
  totalXP: number
  currentLevelXP: number
  xpToNextLevel: number
  lastLevelUp: number | null
}

interface LocalStorageAchievementData {
  achievements: Record<string, any>
  recentlyEarned: string[]
}

export class DataMigration {
  private static readonly MIGRATION_STATUS_KEY = 'jugglelog_migration_status'
  private static readonly BACKUP_PREFIX = 'jugglelog_backup_'

  /**
   * Check if migration has been completed for the current user
   */
  static isMigrationComplete(userId: string): boolean {
    if (!isBrowser) return false
    
    const migrationStatus = localStorage.getItem(`${this.MIGRATION_STATUS_KEY}_${userId}`)
    return migrationStatus === 'completed'
  }

  /**
   * Mark migration as complete for the current user
   */
  static markMigrationComplete(userId: string): void {
    if (!isBrowser) return
    
    localStorage.setItem(`${this.MIGRATION_STATUS_KEY}_${userId}`, 'completed')
    localStorage.setItem(`${this.MIGRATION_STATUS_KEY}_${userId}_timestamp`, Date.now().toString())
  }

  /**
   * Create backup of localStorage data before migration
   */
  static createBackup(userId: string): void {
    if (!isBrowser) return

    const backupData = {
      timestamp: Date.now(),
      userData: this.getLocalStorageUserData(userId),
      progressData: this.getLocalStorageProgressData(userId),
      gamificationData: this.getLocalStorageGamificationData(userId),
      achievementData: this.getLocalStorageAchievementData(userId)
    }

    localStorage.setItem(`${this.BACKUP_PREFIX}${userId}`, JSON.stringify(backupData))
  }

  /**
   * Get user data from localStorage
   */
  static getLocalStorageUserData(userId: string): LocalStorageUser | null {
    if (!isBrowser) return null

    try {
      const usersData = localStorage.getItem('jugglelog_users')
      const currentUserId = localStorage.getItem('jugglelog_current_user')
      
      if (!usersData || currentUserId !== userId) return null

      const users: LocalStorageUser[] = JSON.parse(usersData)
      return users.find(user => user.id === userId) || null
    } catch (error) {
      console.error('Error getting localStorage user data:', error)
      return null
    }
  }

  /**
   * Get progress data from localStorage
   */
  static getLocalStorageProgressData(userId: string): LocalStorageProgressData | null {
    if (!isBrowser) return null

    try {
      const progressKey = `user_${userId}_jugglelog_progress`
      const progressData = localStorage.getItem(progressKey)
      
      if (!progressData) return null

      return JSON.parse(progressData)
    } catch (error) {
      console.error('Error getting localStorage progress data:', error)
      return null
    }
  }

  /**
   * Get gamification data from localStorage
   */
  static getLocalStorageGamificationData(userId: string): LocalStorageGamificationState | null {
    if (!isBrowser) return null

    try {
      const gamificationKey = `user_${userId}_jugglelog_gamification_state`
      const gamificationData = localStorage.getItem(gamificationKey)
      
      if (!gamificationData) return null

      return JSON.parse(gamificationData)
    } catch (error) {
      console.error('Error getting localStorage gamification data:', error)
      return null
    }
  }

  /**
   * Get achievement data from localStorage
   */
  static getLocalStorageAchievementData(userId: string): LocalStorageAchievementData | null {
    if (!isBrowser) return null

    try {
      const achievementKey = `user_${userId}_jugglelog_achievements`
      const achievementData = localStorage.getItem(achievementKey)
      
      if (!achievementData) return null

      return JSON.parse(achievementData)
    } catch (error) {
      console.error('Error getting localStorage achievement data:', error)
      return null
    }
  }

  /**
   * Migrate personal records from localStorage to Supabase
   */
  static async migratePersonalRecords(userId: string, progressData: LocalStorageProgressData): Promise<void> {
    if (!progressData) return

    const personalRecords: PersonalRecordInsert[] = []

    // Convert maxCatches records to personal records
    for (const [storageKey, maxCatches] of Object.entries(progressData.maxCatches)) {
      const lastUpdated = progressData.lastUpdatedDates[storageKey] || null
      const isCompleted = maxCatches >= 100

      // Extract pattern from storage key (remove _R or _L suffix if present)
      const pattern = storageKey.replace(/_[RL]$/, '')

      personalRecords.push({
        user_id: userId,
        pattern,
        pattern_notation: 'custom',
        storage_key: storageKey,
        max_catches: maxCatches,
        is_completed: isCompleted,
        last_updated: lastUpdated,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }

    if (personalRecords.length > 0) {
      const { error } = await supabase
        .from('personal_records')
        .insert(personalRecords)

      if (error) {
        console.error('Error migrating personal records:', error)
        throw error
      }

      console.log(`Migrated ${personalRecords.length} personal records for user ${userId}`)
    }
  }

  /**
   * Migrate gamification data from localStorage to Supabase
   */
  static async migrateGamificationData(userId: string, gamificationData: LocalStorageGamificationState): Promise<void> {
    if (!gamificationData) return

    const gamificationRecord: UserGamificationInsert = {
      user_id: userId,
      level: gamificationData.level,
      total_xp: gamificationData.totalXP,
      current_level_xp: gamificationData.currentLevelXP,
      xp_to_next_level: gamificationData.xpToNextLevel,
      last_level_up: gamificationData.lastLevelUp ? new Date(gamificationData.lastLevelUp).toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('user_gamification')
      .insert(gamificationRecord)

    if (error) {
      console.error('Error migrating gamification data:', error)
      throw error
    }

    console.log(`Migrated gamification data for user ${userId}`)
  }

  /**
   * Migrate achievement data from localStorage to Supabase
   */
  static async migrateAchievementData(userId: string, achievementData: LocalStorageAchievementData): Promise<void> {
    if (!achievementData || !achievementData.achievements) return

    const achievements: UserAchievementInsert[] = []

    for (const [achievementId, achievementInfo] of Object.entries(achievementData.achievements)) {
      if (achievementInfo && typeof achievementInfo === 'object' && achievementInfo.earned) {
        achievements.push({
          user_id: userId,
          achievement_id: achievementId,
          earned_at: achievementInfo.earnedAt ? new Date(achievementInfo.earnedAt).toISOString() : new Date().toISOString(),
          progress: achievementInfo.progress || null
        })
      }
    }

    if (achievements.length > 0) {
      const { error } = await supabase
        .from('user_achievements')
        .insert(achievements)

      if (error) {
        console.error('Error migrating achievement data:', error)
        throw error
      }

      console.log(`Migrated ${achievements.length} achievements for user ${userId}`)
    }
  }

  /**
   * Complete migration process for a user
   */
  static async migrateUserData(userId: string): Promise<void> {
    try {
      console.log(`Starting migration for user ${userId}`)

      // Check if migration already completed
      if (this.isMigrationComplete(userId)) {
        console.log(`Migration already completed for user ${userId}`)
        return
      }

      // Create backup before migration
      this.createBackup(userId)

      // Get all localStorage data
      const progressData = this.getLocalStorageProgressData(userId)
      const gamificationData = this.getLocalStorageGamificationData(userId)
      const achievementData = this.getLocalStorageAchievementData(userId)

      // Migrate each data type
      if (progressData) {
        await this.migratePersonalRecords(userId, progressData)
      }

      if (gamificationData) {
        await this.migrateGamificationData(userId, gamificationData)
      }

      if (achievementData) {
        await this.migrateAchievementData(userId, achievementData)
      }

      // Mark migration as complete
      this.markMigrationComplete(userId)

      console.log(`Migration completed successfully for user ${userId}`)
    } catch (error) {
      console.error(`Migration failed for user ${userId}:`, error)
      throw error
    }
  }

  /**
   * Restore data from backup if migration fails
   */
  static restoreFromBackup(userId: string): boolean {
    if (!isBrowser) return false

    try {
      const backupData = localStorage.getItem(`${this.BACKUP_PREFIX}${userId}`)
      if (!backupData) return false

      const backup = JSON.parse(backupData)
      
      // Restore localStorage data
      if (backup.progressData) {
        localStorage.setItem(`user_${userId}_jugglelog_progress`, JSON.stringify(backup.progressData))
      }
      
      if (backup.gamificationData) {
        localStorage.setItem(`user_${userId}_jugglelog_gamification_state`, JSON.stringify(backup.gamificationData))
      }
      
      if (backup.achievementData) {
        localStorage.setItem(`user_${userId}_jugglelog_achievements`, JSON.stringify(backup.achievementData))
      }

      console.log(`Restored data from backup for user ${userId}`)
      return true
    } catch (error) {
      console.error('Error restoring from backup:', error)
      return false
    }
  }
}
