/**
 * Google Indexing API Script
 * Instantly notify Google when new job pages are published
 * 
 * Setup Instructions:
 * 1. Enable Indexing API in Google Cloud Console
 * 2. Create service account and download JSON key
 * 3. Add service account email to Search Console as Owner
 * 4. Store JSON key as GOOGLE_SERVICE_ACCOUNT_JSON in environment/secrets
 * 5. Run: npm run index-urls
 */

import https from 'https';
import { readFileSync } from 'fs';
import { join } from 'path';

// Service account credentials from Google Cloud
const SERVICE_ACCOUNT_FILE = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || './service-account.json';

interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

/**
 * Get OAuth2 access token from service account
 */
async function getAccessToken(credentials: ServiceAccount): Promise<string> {
  const jwtHeader = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const jwtClaim = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: credentials.token_uri,
    exp: now + 3600,
    iat: now
  };

  // Create JWT manually (simplified version)
  const { sign } = await import('crypto');
  const base64url = (str: string) => 
    Buffer.from(str).toString('base64url');
  
  const header = base64url(JSON.stringify(jwtHeader));
  const claim = base64url(JSON.stringify(jwtClaim));
  const signatureInput = `${header}.${claim}`;
  
  const signature = sign(
    'RSA-SHA256',
    Buffer.from(signatureInput),
    credentials.private_key
  ).toString('base64url');

  const jwt = `${signatureInput}.${signature}`;

  // Exchange JWT for access token
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    }).toString();

    const options = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.access_token) {
            resolve(response.access_token);
          } else {
            reject(new Error('No access token received'));
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Submit URL to Google Indexing API
 */
async function submitUrl(
  url: string,
  accessToken: string,
  type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      url,
      type
    });

    const options = {
      hostname: 'indexing.googleapis.com',
      path: '/v3/urlNotifications:publish',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        'Authorization': `Bearer ${accessToken}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            resolve({ 
              success: true, 
              message: `✅ Indexed: ${url}` 
            });
          } else {
            resolve({ 
              success: false, 
              message: `❌ Failed: ${url} - ${response.error?.message || 'Unknown error'}` 
            });
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

/**
 * Main function to index URLs
 */
async function indexUrls(urls: string[]) {
  try {
    console.log('🚀 Starting Google Indexing API submission...');
    console.log(`📝 URLs to index: ${urls.length}`);

    // Load service account credentials
    const credentials: ServiceAccount = JSON.parse(
      readFileSync(SERVICE_ACCOUNT_FILE, 'utf-8')
    );

    // Get access token
    console.log('🔑 Getting access token...');
    const accessToken = await getAccessToken(credentials);
    console.log('✅ Access token obtained');

    // Submit URLs (max 200 per day per property)
    console.log('\n📤 Submitting URLs to Google...');
    const results = [];
    
    for (const url of urls) {
      try {
        const result = await submitUrl(url, accessToken);
        results.push(result);
        console.log(result.message);
        
        // Rate limiting: wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        console.error(`❌ Error indexing ${url}:`, err);
        results.push({ success: false, message: `Error: ${url}` });
      }
    }

    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log('\n📊 Summary:');
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Total: ${urls.length}`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Example usage
if (require.main === module) {
  // Get URLs from command line or use defaults
  const urls = process.argv.slice(2);
  
  if (urls.length === 0) {
    console.log('📝 Usage: npm run index-urls <url1> <url2> ...');
    console.log('📝 Example: npm run index-urls https://freegovtjob.info/job/ssc-cgl-2026');
    console.log('\n📝 Or provide URLs in urls.txt file (one per line)');
    
    // Try to read from urls.txt if exists
    try {
      const urlsFromFile = readFileSync('./urls.txt', 'utf-8')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && line.startsWith('http'));
      
      if (urlsFromFile.length > 0) {
        console.log(`\n✅ Found ${urlsFromFile.length} URLs in urls.txt`);
        indexUrls(urlsFromFile);
      } else {
        console.log('\n❌ No URLs found. Please provide URLs as arguments or in urls.txt');
      }
    } catch {
      console.log('\n❌ No urls.txt file found. Please provide URLs as arguments.');
    }
  } else {
    indexUrls(urls);
  }
}

export { indexUrls, submitUrl, getAccessToken };