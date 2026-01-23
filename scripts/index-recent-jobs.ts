#!/usr/bin/env tsx
/**
 * Daily Job Indexing Script
 * 
 * This script:
 * 1. Fetches all jobs from Blogger
 * 2. Filters jobs published in last 7 days
 * 3. Submits them to Google Indexing API
 * 
 * Run daily via cron job or GitHub Actions
 * 
 * Usage:
 *   npm run index:jobs
 */

import { fetchJobs } from '../services/bloggerService';
import { autoIndexRecentJobs, submitBatchUrls } from '../services/indexingService';

async function main() {
  console.log('='.repeat(60));
  console.log('  Google Indexing API - Daily Job Submission');
  console.log('  FreeGovtJob.info');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Check for credentials
    if (!process.env.GOOGLE_INDEXING_CREDENTIALS) {
      console.error('❌ Error: GOOGLE_INDEXING_CREDENTIALS not found in environment');
      console.error('Please add your Google Service Account JSON to environment variables');
      process.exit(1);
    }

    console.log('⏳ Fetching jobs from Blogger...');
    const jobs = await fetchJobs();
    console.log(`✅ Fetched ${jobs.length} total jobs\n`);

    // Filter recent jobs (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentJobs = jobs.filter(job => {
      const publishDate = new Date(job.publishDate);
      return publishDate > sevenDaysAgo;
    });

    console.log(`📅 Found ${recentJobs.length} jobs published in last 7 days\n`);

    if (recentJobs.length === 0) {
      console.log('ℹ️ No recent jobs to submit. Exiting.');
      return;
    }

    // Display jobs to be indexed
    console.log('Jobs to be submitted:');
    console.log('-'.repeat(60));
    recentJobs.forEach((job, i) => {
      const date = new Date(job.publishDate).toLocaleDateString('en-IN');
      console.log(`${i + 1}. ${job.title}`);
      console.log(`   Published: ${date}`);
      console.log(`   URL: https://freegovtjob.info/job/${job.slug}`);
      console.log('');
    });

    // Confirm before submission
    console.log('-'.repeat(60));
    console.log(`\n🚀 Starting submission of ${recentJobs.length} URLs to Google...\n`);

    // Generate URLs
    const urls = recentJobs.map(job => `https://freegovtjob.info/job/${job.slug}`);

    // Submit to Google Indexing API
    const results = await submitBatchUrls(urls, 'URL_UPDATED');

    // Summary
    console.log('');
    console.log('='.repeat(60));
    console.log('  SUBMISSION SUMMARY');
    console.log('='.repeat(60));
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\n✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${results.length}\n`);

    if (failed > 0) {
      console.log('Failed URLs:');
      results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`  - ${r.url}`);
          console.log(`    Error: ${r.error}`);
        });
      console.log('');
    }

    console.log('='.repeat(60));
    console.log('✅ Daily indexing complete!');
    console.log('='.repeat(60));

  } catch (error: any) {
    console.error('\n❌ Fatal Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
main();
