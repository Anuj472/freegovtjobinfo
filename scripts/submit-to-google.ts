/**
 * Google Indexing API - Bulk Submission Script
 * 
 * Usage:
 *   npx tsx scripts/submit-to-google.ts
 * 
 * Prerequisites:
 *   1. Set up service account in Google Cloud
 *   2. Enable Web Search Indexing API
 *   3. Add service account to Search Console as Owner
 *   4. Set environment variables (see docs/INDEXING_API.md)
 */

import { fetchJobs } from '../services/bloggerService';

// Environment variables check
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('Required: GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY');
  console.error('See docs/INDEXING_API.md for setup instructions');
  process.exit(1);
}

// Simple fetch-based implementation (no googleapis dependency needed)
async function getAccessToken(): Promise<string> {
  const jwtHeader = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  
  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = Buffer.from(JSON.stringify({
    iss: GOOGLE_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  })).toString('base64url');

  const crypto = require('crypto');
  const signatureInput = `${jwtHeader}.${jwtPayload}`;
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(signatureInput)
    .sign(GOOGLE_PRIVATE_KEY, 'base64url');

  const jwt = `${signatureInput}.${signature}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const data = await response.json();
  return data.access_token;
}

async function submitUrl(url: string, accessToken: string): Promise<boolean> {
  try {
    const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        url: url,
        type: 'URL_UPDATED',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed: ${url} - ${error}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error: ${url} -`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 Google Indexing API - Bulk Submission\n');

  // Get access token
  console.log('🔑 Authenticating...');
  const accessToken = await getAccessToken();
  console.log('✅ Authenticated\n');

  // Fetch all jobs
  console.log('📥 Fetching jobs...');
  const jobs = await fetchJobs();
  console.log(`✅ Found ${jobs.length} jobs\n`);

  // Submit URLs
  console.log('📤 Submitting to Google Indexing API...');
  console.log('Limit: 200 URLs/day\n');

  let successCount = 0;
  let failCount = 0;
  const MAX_PER_DAY = 200;

  const urlsToSubmit = jobs.slice(0, MAX_PER_DAY);

  for (let i = 0; i < urlsToSubmit.length; i++) {
    const job = urlsToSubmit[i];
    const url = `https://freegovtjob.info/job/${job.slug}`;

    const success = await submitUrl(url, accessToken);
    
    if (success) {
      successCount++;
      console.log(`[${i + 1}/${urlsToSubmit.length}] ✅ ${job.title}`);
    } else {
      failCount++;
      console.log(`[${i + 1}/${urlsToSubmit.length}] ❌ ${job.title}`);
    }

    // Rate limiting: wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`\n⏱️  Expected indexing time: 1-2 hours`);
  console.log(`🔍 Verify at: https://search.google.com/search-console`);

  if (jobs.length > MAX_PER_DAY) {
    console.log(`\n⚠️  ${jobs.length - MAX_PER_DAY} jobs remaining for tomorrow's quota`);
  }
}

main().catch(console.error);
