/**
 * Custom environment variable loader
 * Reads .env file and loads GOOGLE_INDEXING_CREDENTIALS
 */

import { readFileSync } from 'fs';
import { join } from 'path';

export function loadEnv() {
  try {
    const envPath = join(process.cwd(), '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    
    // Parse .env file
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      // Skip empty lines and comments
      if (!line || line.startsWith('#')) continue;
      
      // Find the = sign
      const equalIndex = line.indexOf('=');
      if (equalIndex === -1) continue;
      
      const key = line.substring(0, equalIndex).trim();
      const value = line.substring(equalIndex + 1).trim();
      
      // Set environment variable
      process.env[key] = value;
    }
    
    return true;
  } catch (error: any) {
    console.error('Failed to load .env file:', error.message);
    return false;
  }
}
