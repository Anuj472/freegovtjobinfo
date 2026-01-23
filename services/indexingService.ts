/**
 * Google Indexing API Service
 * Automatically submit URLs to Google for instant indexing
 */

import { google } from 'googleapis';

interface IndexingResult {
  success: boolean;
  url: string;
  message?: string;
  error?: string;
}

/**
 * Submit a single URL to Google Indexing API
 * @param url - Full URL to submit (e.g., https://freegovtjob.info/job/ssc-cgl-2026)
 * @param type - 'URL_UPDATED' for new/updated pages, 'URL_DELETED' for removed pages
 */
export async function submitUrlToIndex(
  url: string,
  type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<IndexingResult> {
  try {
    // Get credentials from environment variable
    const credentials = process.env.GOOGLE_INDEXING_CREDENTIALS;
    
    if (!credentials) {
      console.error('Missing GOOGLE_INDEXING_CREDENTIALS environment variable');
      return {
        success: false,
        url,
        error: 'Missing Google Indexing API credentials'
      };
    }

    // Parse JSON credentials
    const key = JSON.parse(credentials);

    // Create JWT client for authentication
    const jwtClient = new google.auth.JWT(
      key.client_email,
      undefined,
      key.private_key,
      ['https://www.googleapis.com/auth/indexing'],
      undefined
    );

    // Authorize the client
    await jwtClient.authorize();

    // Create Indexing API client
    const indexing = google.indexing({
      version: 'v3',
      auth: jwtClient
    });

    // Submit URL notification
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: type
      }
    });

    console.log(`✅ Successfully submitted to Google: ${url}`);

    return {
      success: true,
      url,
      message: `Successfully submitted: ${type}`,
    };

  } catch (error: any) {
    console.error('❌ Indexing API Error:', error.message);
    return {
      success: false,
      url,
      error: error.message
    };
  }
}

/**
 * Submit multiple URLs in batch
 * Note: Google allows 200 URLs per day per project
 * @param urls - Array of URLs to submit
 * @param type - Type of notification
 */
export async function submitBatchUrls(
  urls: string[],
  type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<IndexingResult[]> {
  const results: IndexingResult[] = [];

  console.log(`Starting batch submission of ${urls.length} URLs...`);

  // Submit URLs with delay to avoid rate limiting
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    
    console.log(`[${i + 1}/${urls.length}] Submitting: ${url}`);
    
    const result = await submitUrlToIndex(url, type);
    results.push(result);
    
    // Wait 100ms between requests to be respectful to API
    if (i < urls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  const successful = results.filter(r => r.success).length;
  console.log(`\n✅ Batch complete: ${successful}/${urls.length} URLs submitted successfully`);

  return results;
}

/**
 * Get indexing metadata/status for a URL
 * @param url - URL to check status for
 */
export async function getIndexingStatus(url: string): Promise<any> {
  try {
    const credentials = process.env.GOOGLE_INDEXING_CREDENTIALS;
    if (!credentials) {
      throw new Error('Missing Google Indexing API credentials');
    }

    const key = JSON.parse(credentials);
    
    const jwtClient = new google.auth.JWT(
      key.client_email,
      undefined,
      key.private_key,
      ['https://www.googleapis.com/auth/indexing'],
      undefined
    );

    await jwtClient.authorize();

    const indexing = google.indexing({
      version: 'v3',
      auth: jwtClient
    });

    const response = await indexing.urlNotifications.getMetadata({
      url: url
    });

    return response.data;

  } catch (error: any) {
    console.error('Get status error:', error.message);
    return { 
      error: error.message,
      url 
    };
  }
}

/**
 * Auto-submit recent job pages (published in last 7 days)
 * Call this from your build process or scheduled task
 * @param jobs - Array of job objects with slug and publishDate
 */
export async function autoIndexRecentJobs(jobs: any[]): Promise<void> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Filter jobs published in last 7 days
  const recentJobs = jobs.filter(job => {
    const publishDate = new Date(job.publishDate);
    return publishDate > sevenDaysAgo;
  });

  if (recentJobs.length === 0) {
    console.log('No recent jobs to index.');
    return;
  }

  console.log(`Found ${recentJobs.length} recent jobs to submit to Google`);

  // Generate URLs
  const urls = recentJobs.map(
    job => `https://freegovtjob.info/job/${job.slug}`
  );

  // Submit in batch
  await submitBatchUrls(urls, 'URL_UPDATED');
}

/**
 * Submit expired job pages as deleted
 * @param expiredJobSlugs - Array of slugs for expired jobs
 */
export async function removeExpiredJobs(expiredJobSlugs: string[]): Promise<void> {
  if (expiredJobSlugs.length === 0) {
    console.log('No expired jobs to remove.');
    return;
  }

  console.log(`Removing ${expiredJobSlugs.length} expired jobs from Google index`);

  const urls = expiredJobSlugs.map(
    slug => `https://freegovtjob.info/job/${slug}`
  );

  await submitBatchUrls(urls, 'URL_DELETED');
}
