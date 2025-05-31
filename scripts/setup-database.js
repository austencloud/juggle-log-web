#!/usr/bin/env node

/**
 * Database Setup Script for Juggling World Records Platform
 * 
 * This script sets up the complete database schema in Supabase.
 * Run this after creating your Supabase project.
 * 
 * Usage: node scripts/setup-database.js
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Supabase configuration
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  console.error('')
  console.error('Please check your .env file and try again.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Juggling World Records Platform database...')
    console.log('')

    // Read the database schema file
    const schemaPath = join(__dirname, '..', 'database-schema.sql')
    const schema = readFileSync(schemaPath, 'utf8')

    console.log('📄 Executing database schema...')
    
    // Execute the schema
    const { error } = await supabase.rpc('exec_sql', { sql: schema })
    
    if (error) {
      console.error('❌ Error executing schema:', error)
      throw error
    }

    console.log('✅ Database schema created successfully!')
    console.log('')

    // Insert default throw types
    console.log('📝 Inserting default throw types...')
    
    const defaultThrowTypes = [
      { code: 'S', name: 'Single', description: 'Standard single throw', difficulty: 1, category: 'basic' },
      { code: 'D', name: 'Double', description: 'Throw travels twice as high', difficulty: 2, category: 'basic' },
      { code: 'L', name: 'Lazy', description: 'Low throw for timing adjustments', difficulty: 2, category: 'basic' },
      { code: 'F', name: 'Flat', description: 'Horizontal spin throw', difficulty: 2, category: 'basic' },
      { code: 'B', name: 'Behind the back', description: 'Throw from behind the back', difficulty: 3, category: 'trick' },
      { code: 'P', name: 'Penguin', description: 'Throw with arm across body', difficulty: 3, category: 'trick' },
      { code: 'O', name: 'Over the top', description: 'Throw a single on with an outside throw', difficulty: 3, category: 'trick' },
      { code: 'Od', name: 'Over the top double', description: 'Double height over the top', difficulty: 4, category: 'trick' },
      { code: 'Us', name: 'Under same leg', description: 'Throw under the same side leg', difficulty: 3, category: 'body' },
      { code: 'Uo', name: 'Under opposite leg', description: 'Throw under the opposite side leg', difficulty: 4, category: 'body' },
      { code: 'Cd', name: 'Circus Double', description: 'Double thrown at single height', difficulty: 4, category: 'trick' }
    ]

    const { error: throwTypesError } = await supabase
      .from('throw_types')
      .insert(defaultThrowTypes)

    if (throwTypesError) {
      console.error('❌ Error inserting throw types:', throwTypesError)
      throw throwTypesError
    }

    console.log('✅ Default throw types inserted successfully!')
    console.log('')

    // Test database connection
    console.log('🔍 Testing database connection...')
    
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('❌ Database connection test failed:', testError)
      throw testError
    }

    console.log('✅ Database connection test passed!')
    console.log('')

    console.log('🎉 Database setup completed successfully!')
    console.log('')
    console.log('Next steps:')
    console.log('1. Update your .env file with the Supabase credentials')
    console.log('2. Start your development server: npm run dev')
    console.log('3. Test the migration functionality with existing users')
    console.log('')

  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  }
}

// Run the setup
setupDatabase()
