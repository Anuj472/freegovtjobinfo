# Google Indexing API Setup

Automate job page indexing - get pages indexed in 1-2 hours instead of days.

## Quick Start

### Step 1: Google Cloud Setup (15 min)

1. **Create Project**
   - Go to: https://console.cloud.google.com/
   - Click "New Project"
   - Name: `FreeGovtJob-Indexing`

2. **Enable API**
   - Search: "Web Search Indexing API"
   - Click "ENABLE"

3. **Create Service Account**
   - IAM & Admin → Service Accounts
   - Create service account
   - Download JSON key file

### Step 2: Search Console (5 min)

1. Open JSON file, copy `client_email`
2. Go to: https://search.google.com/search-console
3. Settings → Users → Add user
4. Paste email, select "Owner"

### Step 3: Environment Variables

Add to Cloudflare Pages environment variables:

```
GOOGLE_CLIENT_EMAIL=your@serviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
GOOGLE_PROJECT_ID=your-project-id
```

## Implementation

### Install Package

```bash
npm install googleapis
```

### Create Service (services/indexing.ts)

```typescript
import { google } from 'googleapis';

export async function notifyGoogle(url: string) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });

  const indexing = google.indexing({ 
    version: 'v3', 
    auth: await auth.getClient() 
  });

  await indexing.urlNotifications.publish({
    requestBody: {
      url: url,
      type: 'URL_UPDATED',
    },
  });
}
```

### Use on Job Publish

```typescript
// When job is published
const jobUrl = `https://freegovtjob.info/job/${slug}`;
await notifyGoogle(jobUrl);
```

## Limits

- 200 URLs per day
- Perfect for daily job updates

## Expected Results

- Without API: 1-7 days
- With API: 1-2 hours ✅

Full guide: https://developers.google.com/search/apis/indexing-api/v3/quickstart
