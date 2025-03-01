/**
 * Script to create a default admin user in Supabase
 * Run this script to ensure there's always a test account available
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Default user details
const DEFAULT_USER = {
  email: 'admin@letterloop.test',
  password: 'password123',
  name: 'Admin User',
  role: 'coordinator'
};

async function createDefaultUser() {
  console.log('Creating default admin user...');
  
  try {
    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', DEFAULT_USER.email);
    
    if (checkError) {
      throw new Error(`Error checking for existing user: ${checkError.message}`);
    }
    
    if (existingUsers && existingUsers.length > 0) {
      console.log('Default user already exists. Skipping creation.');
      return;
    }
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: DEFAULT_USER.email,
      password: DEFAULT_USER.password,
      email_confirm: true
    });
    
    if (authError) {
      throw new Error(`Error creating auth user: ${authError.message}`);
    }
    
    const userId = authData.user.id;
    console.log(`Auth user created with ID: ${userId}`);
    
    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email: DEFAULT_USER.email,
          name: DEFAULT_USER.name,
          role: DEFAULT_USER.role
        }
      ]);
    
    if (profileError) {
      throw new Error(`Error creating user profile: ${profileError.message}`);
    }
    
    console.log('Default admin user created successfully!');
    console.log('Email:', DEFAULT_USER.email);
    console.log('Password:', DEFAULT_USER.password);
    console.log('Role:', DEFAULT_USER.role);
    
  } catch (error) {
    console.error('Failed to create default user:', error.message);
    process.exit(1);
  }
}

createDefaultUser();
