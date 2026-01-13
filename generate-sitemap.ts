import fs from 'fs';
import path from 'path';
import { fetchJobs } from './services/bloggerService.js';

async function generateSitemap() {
  console.log('--- [Sitemap Generator] Starting ---');
  
  const distDir = path.resolve((process as any).cwd(), 'dist');
  const publicDir = path.resolve((process as any).cwd(), 'public');

  try {
    const jobs = await fetchJobs();
    const baseUrl = 'https://freegovtjob.info';
    
    // Safety check for date to avoid "Future Date" errors in Search Console
    // If system clock is wrong, we manually cap it to 2025 for now
    let now = new Date();
    if (now.getFullYear() > 2025) {
        now = new Date('2025-01-13'); 
    }
    const currentDate = now.toISOString().split('T')[0];

    // Build XML string - STRICKLY NO WHITESPACE BEFORE <?xml
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/trending</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/sitemap</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/about-us</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy-policy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;

    jobs.forEach(job => {
      // Ensure job date isn't in the future either
      let jobDate = job.updatedDate ? job.updatedDate.split('T')[0] : currentDate;
      if (jobDate.startsWith('2026')) jobDate = currentDate;
      
      xml += `
  <url>
    <loc>${baseUrl}/job/${job.slug}</loc>
    <lastmod>${jobDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += '\n</urlset>';

    const finalXml = xml.trim();

    // 1. Write to public (for future builds)
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), finalXml);
    
    // 2. Write to dist (for current deployment)
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), finalXml);

    // 3. Ensure Cloudflare config files are in dist
    ['_headers', '_redirects', 'robots.txt'].forEach(file => {
      const src = path.join(publicDir, file);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(distDir, file));
        console.log(`✔ Verified ${file} in dist/`);
      }
    });
    
    console.log(`--- [Sitemap Generator] Success: ${jobs.length + 5} URLs ---`);
  } catch (error) {
    console.error('✘ Sitemap Error:', error);
    (process as any).exit(1);
  }
}

generateSitemap();