#!/usr/bin/env tsx

import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Setup database and run import
 */
async function setupDatabase() {
  console.log(`
🏔️  CLANCY'S OUTDOORS DATABASE SETUP
===================================
`);

  // Check if .env exists and has DATABASE_URL
  try {
    const envContent = await fs.readFile('.env', 'utf-8');
    if (!envContent.includes('DATABASE_URL') || envContent.includes('localhost')) {
      console.log('❌ Please update your .env file with the Supabase connection string first!');
      console.log('');
      console.log('Steps:');
      console.log('1. Go to https://supabase.com/dashboard');
      console.log('2. Create a new project: "clancys-outdoors"');
      console.log('3. Go to Settings → Database');
      console.log('4. Copy the URI connection string');
      console.log('5. Update your .env file:');
      console.log('   DATABASE_URL="your-supabase-connection-string"');
      console.log('');
      console.log('Then run this script again!');
      return;
    }
  } catch (error) {
    console.log('❌ No .env file found. Please create one with your Supabase DATABASE_URL');
    return;
  }

  console.log('✅ Database connection found in .env');
  
  try {
    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    await execAsync('npx prisma generate');
    console.log('✅ Prisma client generated');

    // Push database schema
    console.log('🗄️  Pushing database schema...');
    await execAsync('npx prisma db push');
    console.log('✅ Database schema created');

    // Run the import
    console.log('📦 Starting data import...');
    await execAsync('npx tsx scripts/import-clancys-data.ts');
    console.log('🎉 Import complete!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.log('');
    console.log('Please check:');
    console.log('1. Your DATABASE_URL is correct');
    console.log('2. Your Supabase database is accessible');
    console.log('3. Try running each step manually:');
    console.log('   npx prisma generate');
    console.log('   npx prisma db push');
    console.log('   npx tsx scripts/import-clancys-data.ts');
  }
}

if (require.main === module) {
  setupDatabase();
}

export { setupDatabase }; 