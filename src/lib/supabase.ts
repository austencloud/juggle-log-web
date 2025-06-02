// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import type { Database } from './types/database'
import { browser } from '$app/environment'

let supabase: ReturnType<typeof createClient<Database>> | null = null

// Only create client if we have valid configuration
if (browser && PUBLIC_SUPABASE_URL && PUBLIC_SUPABASE_ANON_KEY &&
    PUBLIC_SUPABASE_URL !== '' && PUBLIC_SUPABASE_ANON_KEY !== '' &&
    PUBLIC_SUPABASE_URL.startsWith('https://')) {
  try {
    supabase = createClient<Database>(
      PUBLIC_SUPABASE_URL,
      PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      }
    )
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error)
    supabase = null
  }
}

export { supabase }

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(PUBLIC_SUPABASE_URL && PUBLIC_SUPABASE_ANON_KEY && supabase)
}

// Helper function to get the current user
export async function getCurrentUser() {
  if (!supabase) return null
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  return user
}

// Helper function to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  if (!supabase) return false
  const user = await getCurrentUser()
  return user !== null
}

// Helper function to get user session
export async function getSession() {
  if (!supabase) return null
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error getting session:', error)
    return null
  }
  return session
}

// Helper function to sign out
export async function signOut() {
  if (!supabase) throw new Error('Supabase not initialized')
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

// Helper function to sign in with email/password
export async function signInWithPassword(email: string, password: string) {
  if (!supabase) throw new Error('Supabase not initialized')
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) {
    console.error('Error signing in:', error)
    throw error
  }
  
  return data
}

// Helper function to sign up with email/password
export async function signUpWithPassword(email: string, password: string, username: string) {
  if (!supabase) throw new Error('Supabase not initialized')
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username
      }
    }
  })
  
  if (error) {
    console.error('Error signing up:', error)
    throw error
  }
  
  return data
}

// Helper function to update user profile
export async function updateUserProfile(updates: {
  display_name?: string
  bio?: string
  location?: string
  website?: string
  youtube_channel?: string
  instagram_handle?: string
}) {
  if (!supabase) throw new Error('Supabase not initialized')
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    throw error
  }

  return data
}

// Helper function to get user profile
export async function getUserProfile(userId?: string) {
  if (!supabase) throw new Error('Supabase not initialized')
  const targetUserId = userId || (await getCurrentUser())?.id
  if (!targetUserId) {
    throw new Error('No user ID provided')
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', targetUserId)
    .single()

  if (error) {
    console.error('Error getting user profile:', error)
    throw error
  }

  return data
}

// Helper function to create or update user profile on first login
export async function ensureUserProfile(user: any) {
  if (!supabase) throw new Error('Supabase not initialized')
  const { data: existingProfile, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error checking user profile:', fetchError)
    throw fetchError
  }

  if (!existingProfile) {
    // Create new user profile
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: user.id,
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
        email: user.email,
        display_name: user.user_metadata?.display_name || user.user_metadata?.username,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      throw error
    }

    return data
  } else {
    // Update last login
    const { data, error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating last login:', error)
      throw error
    }

    return data
  }
}
