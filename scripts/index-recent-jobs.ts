#!/usr/bin/env tsx
/**
 * Daily Job Indexing Script
 * 
 * Fetches recent jobs from Blogger and submits them to Google Indexing API.
 * Only submits jobs that haven't been submitted in the last 7 days.
 * 
 * Usage:
 *   npm run index:jobs
 */

import { loadEnv } from './load-env';
import { fetchJobs } from '../services/bloggerService';
import { submitBatchUrls } from '../services/indexingService';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load environment variables
loadEnv();

// Path to tracking file
const TRACKING_FILE = join(process.cwd(), '.indexing-cache.json');

interface TrackingData {
  submittedUrls: { [url: string]: string }; // url -> submission date
}

/**
 * Load previously submitted URLs
 */
function loadTracking(): TrackingData {
  try {
    if (existsSync(TRACKING_FILE)) {
      const data = readFileSync(TRACKING_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('No previous tracking data found, starting fresh.');
  }
  return { submittedUrls: {} };
}

/**
 * Save submitted URLs
 */
function saveTracking(data: TrackingData): void {
  try {
    writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to save tracking data:', error);
  }
}

/**
 * Check if URL was submitted in last N days
 */
function wasRecentlySubmitted(url: string, tracking: TrackingData, days: number = 7): boolean {
  const submittedDate = tracking.submittedUrls[url];
  if (!submittedDate) return false;

  const daysSinceSubmission = (Date.now() - new Date(submittedDate).getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceSubmission < days;
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('  Google Indexing API - Daily Job Submission');
  console.log('  FreeGovtJob.info');
  console.log('='.repeat(60) + '\n');

  // Load tracking data
  const tracking = loadTracking();
  const previousCount = Object.keys(tracking.submittedUrls).length;
  console.log(`📊 Previously tracked: ${previousCount} URLs\n`);

  // Fetch jobs from Blogger
  console.log('⏳ Fetching jobs from Blogger...');
  const allJobs = await fetchJobs();
  console.log(`✅ Fetched ${allJobs.length} total jobs\n`);

  if (allJobs.length === 0) {
    console.log('⚠️  No jobs found. Exiting.');
    return;
  }

  // Filter to recent jobs (last 7 days)
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - 7);

  const recentJobs = allJobs.filter(job => {
    const publishDate = new Date(job.publishDate);
    return publishDate > daysAgo;
  });

  console.log(`📅 Found ${recentJobs.length} jobs published in last 7 days`);

  // Filter out already submitted URLs
  const newJobs = recentJobs.filter(job => {
    const url = `https://freegovtjob.info/job/${job.slug}`;
    return !wasRecentlySubmitted(url, tracking, 7);
  });

  console.log(`🆕 Found ${newJobs.length} NEW jobs (not submitted in last 7 days)\n`);

  if (newJobs.length === 0) {
    console.log('ℹ️  No new jobs to submit. All recent jobs already indexed.');
    console.log('\n' + '='.repeat(60));
    console.log('  ✅ INDEXING CHECK COMPLETE!');
    console.log('='.repeat(60) + '\n');
    return;
  }

  // Limit to 200 URLs per day (Google API quota)
  const jobsToSubmit = newJobs.slice(0, 200);
  
  if (newJobs.length > 200) {
    console.log(`⚠️  Limiting to 200 URLs (API quota). ${newJobs.length - 200} will be submitted tomorrow.\n`);
  }

  // Display jobs to be submitted
  console.log('Jobs to be submitted:');
  console.log('-'.repeat(60));
  jobsToSubmit.slice(0, 10).forEach((job, index) => {
    const publishDate = new Date(job.publishDate);
    const formattedDate = publishDate.toLocaleDateString('en-IN');
    console.log(`${index + 1}. ${job.title}`);
    console.log(`   Published: ${formattedDate}`);
    console.log(`   URL: https://freegovtjob.info/job/${job.slug}`);
  });

  if (jobsToSubmit.length > 10) {
    console.log(`... and ${jobsToSubmit.length - 10} more jobs`);
  }
  console.log('');

  // Submit to Google Indexing API
  console.log('🚀 Submitting to Google Indexing API...');
  console.log('⏳ Please wait (this may take a few minutes)...\n');

  const urls = jobsToSubmit.map(job => `https://freegovtjob.info/job/${job.slug}`);
  const results = await submitBatchUrls(urls, 'URL_UPDATED');

  // Update tracking data
  const now = new Date().toISOString();
  results.forEach(result => {
    if (result.success) {
      tracking.submittedUrls[result.url] = now;
    }
  });

  // Clean up old tracking data (older than 30 days)
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  Object.keys(tracking.submittedUrls).forEach(url => {
    const submittedDate = new Date(tracking.submittedUrls[url]).getTime();
    if (submittedDate < thirtyDaysAgo) {
      delete tracking.submittedUrls[url];
    }
  });

  // Save tracking data
  saveTracking(tracking);

  // Show results
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('\n' + '='.repeat(60));
  console.log('  📊 SUBMISSION RESULTS');
  console.log('='.repeat(60));
  console.log(`✅ Successfully submitted: ${successful} URLs`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed} URLs`);
    console.log('\nFailed URLs:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.url}`);
      console.log(`    Error: ${r.error}`);
    });
  }
  console.log('='.repeat(60));
  console.log('');

  // Summary
  console.log('='.repeat(60));
  console.log('  ✅ INDEXING COMPLETE!');
  console.log('='.repeat(60));
  console.log('');
  console.log('📈 Summary:');
  console.log(`  - Total jobs in Blogger: ${allJobs.length}`);
  console.log(`  - Recent jobs (7 days): ${recentJobs.length}`);
  console.log(`  - NEW jobs submitted today: ${successful}`);
  console.log(`  - Total tracked URLs: ${Object.keys(tracking.submittedUrls).length}`);
  console.log('');
  console.log('🔍 Check Google Search Console in 24-48 hours to see indexed pages.');
  console.log('📅 Next run: Tomorrow at 6:30 AM IST\n');
}

// Run the script
main().catch(error => {
  console.error('\n❌ Fatal Error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
