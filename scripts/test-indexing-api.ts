#!/usr/bin/env tsx
/**
 * Test Script for Google Indexing API
 * 
 * This script verifies that:
 * 1. Credentials are properly configured
 * 2. Service account has correct permissions
 * 3. API is accessible and working
 * 4. Can successfully submit a test URL
 * 
 * Usage:
 *   npm run test:indexing
 */

import { submitUrlToIndex, getIndexingStatus } from '../services/indexingService';

async function testIndexingAPI() {
  console.log('\n' + '='.repeat(70));
  console.log('  GOOGLE INDEXING API - VERIFICATION TEST');
  console.log('  FreeGovtJob.info');
  console.log('='.repeat(70) + '\n');

  // Test 1: Check credentials
  console.log('🔍 Test 1: Checking credentials...');
  if (!process.env.GOOGLE_INDEXING_CREDENTIALS) {
    console.error('❌ FAILED: GOOGLE_INDEXING_CREDENTIALS not found!');
    console.error('\nPlease add your Google Service Account JSON to environment variables.');
    console.error('\nFor local testing, run:');
    console.error('  export GOOGLE_INDEXING_CREDENTIALS=\'{...your json...}\'');
    process.exit(1);
  }
  console.log('✅ Credentials found\n');

  // Test 2: Parse credentials
  console.log('🔍 Test 2: Parsing credentials...');
  try {
    const creds = JSON.parse(process.env.GOOGLE_INDEXING_CREDENTIALS);
    console.log('✅ Service account email:', creds.client_email);
    console.log('✅ Project ID:', creds.project_id);
    console.log('');
  } catch (error: any) {
    console.error('❌ FAILED: Invalid JSON format');
    console.error('Error:', error.message);
    process.exit(1);
  }

  // Test 3: Submit test URL
  console.log('🔍 Test 3: Submitting test URL to Google...');
  const testUrl = 'https://freegovtjob.info/';
  console.log('Test URL:', testUrl);
  console.log('Please wait...\n');

  const result = await submitUrlToIndex(testUrl, 'URL_UPDATED');

  if (result.success) {
    console.log('✅ SUCCESS! URL submitted to Google Indexing API');
    console.log('   URL:', result.url);
    console.log('   Message:', result.message);
    console.log('');
  } else {
    console.error('❌ FAILED: Could not submit URL');
    console.error('   Error:', result.error);
    console.error('\n🛠️  Troubleshooting:');
    console.error('   1. Verify service account has Owner role in Search Console');
    console.error('   2. Check that Web Search Indexing API is enabled');
    console.error('   3. Ensure service account email is added to freegovtjob.info property');
    console.error('   4. Wait 10-15 minutes after adding service account (permissions can take time)');
    process.exit(1);
  }

  // Test 4: Check indexing status (optional)
  console.log('🔍 Test 4: Checking indexing status...');
  try {
    const status = await getIndexingStatus(testUrl);
    if (status.error) {
      console.log('⚠️  Status check failed (this is normal for first-time setup)');
      console.log('   Error:', status.error);
    } else {
      console.log('✅ Status retrieved successfully');
      console.log('   Latest update:', status.latestUpdate?.type || 'None');
      console.log('   Notify time:', status.latestUpdate?.notifyTime || 'N/A');
    }
  } catch (error: any) {
    console.log('⚠️  Status check not available (normal for new URLs)');
  }
  console.log('');

  // Summary
  console.log('='.repeat(70));
  console.log('  ✅ ALL TESTS PASSED!');
  console.log('='.repeat(70));
  console.log('');
  console.log('🎉 Your Google Indexing API is configured correctly!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Run daily script: npm run index:jobs');
  console.log('  2. Check Google Search Console in 24-48 hours');
  console.log('  3. Monitor indexing status regularly');
  console.log('');
  console.log('='.repeat(70) + '\n');
}

// Run the test
testIndexingAPI().catch(error => {
  console.error('\n❌ Fatal Error:', error.message);
  process.exit(1);
});
