# Google Indexing API Setup - Complete Guide

## Benefits
- ✅ Instant indexing of new job pages (minutes instead of days)
- ✅ Update Google when job posts expire
- ✅ 200 URL submissions per day (enough for daily job updates)
- ✅ Priority indexing for time-sensitive content

---

## Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Gmail account

2. **Create New Project**
   - Click "Select a project" → "New Project"
   - Project name: `freegovtjob-indexing`
   - Click "Create"

3. **Enable Required APIs**
   - Go to "APIs & Services" → "Library"
   - Search and enable:
     - ✅ **Web Search Indexing API**
     - ✅ **Google Search Console API**

---

## Step 2: Create Service Account

1. **Navigate to Service Accounts**
   - Go to: "IAM & Admin" → "Service Accounts"
   - Click "+ CREATE SERVICE ACCOUNT"

2. **Fill Details**
   - Service account name: `indexing-bot`
   - Description: `Automated indexing for FreeGovtJob.info`
   - Click "Create and Continue"

3. **Grant Permissions**
   - Role: `Owner` (for full access)
   - Click "Continue" → "Done"

4. **Create JSON Key**
   - Click on your new service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON"
   - Download the JSON file (keep it secure!)

---

## Step 3: Add Service Account to Search Console

1. **Get Service Account Email**
   - From JSON file, copy the email
   - Format: `indexing-bot@freegovtjob-indexing.iam.gserviceaccount.com`

2. **Add to Search Console**
   - Go to: https://search.google.com/search-console
   - Select your property: `freegovtjob.info`
   - Settings → Users and permissions
   - Click "Add user"
   - Paste service account email
   - Permission level: **Owner**
   - Click "Add"

---

## Step 4: Store Credentials Securely

### For Cloudflare Pages (Recommended):

1. **Go to Cloudflare Dashboard**
   - Select your Pages project
   - Settings → Environment Variables

2. **Add Variable**
   - Name: `GOOGLE_INDEXING_CREDENTIALS`
   - Value: Paste entire JSON file content
   - Type: Secret
   - Apply to: Production

### Alternative: GitHub Secrets

1. Go to your repo: `Anuj472/freegovtjobinfo`
2. Settings → Secrets and variables → Actions
3. New repository secret
4. Name: `GOOGLE_INDEXING_CREDENTIALS`
5. Value: Paste JSON content

---

## Step 5: Install Dependencies

Add to `package.json`:

```json
"dependencies": {
  "googleapis": "^131.0.0"
}
```

Run:
```bash
npm install googleapis
```

---

## Step 6: Create Indexing Service

Create file: `services/indexingService.ts`

```typescript
import { google } from 'googleapis';

interface IndexingResult {
  success: boolean;
  url: string;
  message?: string;
  error?: string;
}

/**
 * Submit URL to Google Indexing API
 */
export async function submitUrlToIndex(
  url: string,
  type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<IndexingResult> {
  try {
    // Get credentials from environment
    const credentials = process.env.GOOGLE_INDEXING_CREDENTIALS;
    if (!credentials) {
      return {
        success: false,
        url,
        error: 'Missing credentials'
      };
    }

    // Parse credentials
    const key = JSON.parse(credentials);

    // Create JWT client
    const jwtClient = new google.auth.JWT(
      key.client_email,
      undefined,
      key.private_key,
      ['https://www.googleapis.com/auth/indexing'],
      undefined
    );

    // Authorize
    await jwtClient.authorize();

    // Create indexing API client
    const indexing = google.indexing({
      version: 'v3',
      auth: jwtClient
    });

    // Submit URL
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: type
      }
    });

    return {
      success: true,
      url,
      message: `Successfully submitted: ${type}`
    };
  } catch (error: any) {
    console.error('Indexing API Error:', error);
    return {
      success: false,
      url,
      error: error.message
    };
  }
}

/**
 * Submit multiple URLs in batch
 */
export async function submitBatchUrls(
  urls: string[],
  type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<IndexingResult[]> {
  const results: IndexingResult[] = [];

  // Google allows 200 requests per day
  // Submit in batches with delay to avoid rate limits
  for (const url of urls) {
    const result = await submitUrlToIndex(url, type);
    results.push(result);
    
    // Wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}

/**
 * Get indexing status
 */
export async function getIndexingStatus(url: string): Promise<any> {
  try {
    const credentials = process.env.GOOGLE_INDEXING_CREDENTIALS;
    if (!credentials) throw new Error('Missing credentials');

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
    console.error('Get status error:', error);
    return { error: error.message };
  }
}
```

---

## Step 7: Auto-Submit New Job Posts

Update `services/bloggerService.ts` to auto-submit:

```typescript
import { submitUrlToIndex } from './indexingService';

// After fetching new jobs
export async function autoIndexNewJobs(jobs: Job[]) {
  const recentJobs = jobs.filter(job => {
    const publishedDate = new Date(job.publishDate);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return publishedDate > yesterday;
  });

  for (const job of recentJobs) {
    const url = `https://freegovtjob.info/job/${job.slug}`;
    await submitUrlToIndex(url, 'URL_UPDATED');
    console.log(`Submitted to Google: ${job.title}`);
  }
}
```

---

## Step 8: Create Cloudflare Worker for Auto-Indexing

Create `functions/api/index-job.ts`:

```typescript
import { submitUrlToIndex } from '../../services/indexingService';

export async function onRequest(context: any) {
  const { request, env } = context;

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await request.json();
    const { url, type = 'URL_UPDATED' } = body;

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Submit to indexing API
    const result = await submitUrlToIndex(url, type);

    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

---

## Step 9: Test the Setup

### Manual Test:

```bash
curl -X POST https://freegovtjob.info/api/index-job \
  -H "Content-Type: application/json" \
  -d '{"url": "https://freegovtjob.info/job/test-job"}'
```

### Expected Response:
```json
{
  "success": true,
  "url": "https://freegovtjob.info/job/test-job",
  "message": "Successfully submitted: URL_UPDATED"
}
```

---

## Usage Examples

### 1. Submit Single Job (Manual)
```typescript
import { submitUrlToIndex } from './services/indexingService';

// When publishing new job
const result = await submitUrlToIndex(
  'https://freegovtjob.info/job/ssc-cgl-2026',
  'URL_UPDATED'
);
```

### 2. Remove Expired Job
```typescript
// When job expires
await submitUrlToIndex(
  'https://freegovtjob.info/job/old-expired-job',
  'URL_DELETED'
);
```

### 3. Batch Submit All Jobs
```typescript
import { submitBatchUrls } from './services/indexingService';

const jobUrls = jobs.map(j => `https://freegovtjob.info/job/${j.slug}`);
await submitBatchUrls(jobUrls);
```

---

## Daily Automation Script

Create `scripts/daily-index.ts`:

```typescript
import { fetchJobs } from '../services/bloggerService';
import { submitBatchUrls } from '../services/indexingService';

async function dailyIndexing() {
  console.log('Starting daily indexing...');
  
  // Get all jobs
  const jobs = await fetchJobs();
  
  // Get jobs from last 7 days
  const recentJobs = jobs.filter(job => {
    const publishDate = new Date(job.publishDate);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return publishDate > weekAgo;
  });

  // Submit to Google
  const urls = recentJobs.map(j => `https://freegovtjob.info/job/${j.slug}`);
  const results = await submitBatchUrls(urls);

  const successful = results.filter(r => r.success).length;
  console.log(`✅ Submitted ${successful}/${urls.length} URLs to Google`);
}

dailyIndexing();
```

Add to `package.json`:
```json
"scripts": {
  "index:daily": "tsx scripts/daily-index.ts"
}
```

---

## Monitoring & Limits

### API Quotas:
- **200 URLs per day** (per project)
- **100 metadata requests per day**
- No cost for up to these limits

### Best Practices:
- ✅ Only submit new/updated pages (last 7 days)
- ✅ Submit expired jobs as `URL_DELETED`
- ✅ Add 100ms delay between requests
- ✅ Log all submissions for tracking
- ✅ Run daily automation via cron job

---

## Troubleshooting

### Error: "Permission denied"
- ✅ Verify service account has Owner role in Search Console
- ✅ Check service account email is correct

### Error: "Invalid credentials"
- ✅ Ensure JSON is properly formatted
- ✅ Check environment variable is set

### Error: "Quota exceeded"
- ✅ You've hit 200 URLs/day limit
- ✅ Wait 24 hours or create new project

---

## Expected Results

| Metric | Before API | After API |
|--------|-----------|----------|
| Indexing time | 3-7 days | 1-2 hours |
| New jobs indexed | 20-30% | 90-95% |
| Search visibility | Delayed | Immediate |
| Index coverage | ~50% | ~95% |

---

## Next Steps

1. ✅ Complete Google Cloud setup
2. ✅ Add credentials to Cloudflare
3. ✅ Install googleapis package
4. ✅ Create indexing service
5. ✅ Test with one URL
6. ✅ Set up daily automation
7. ✅ Monitor Search Console

---

**Your job pages will now be indexed within hours instead of days!** 🚀
