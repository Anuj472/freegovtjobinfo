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
    const currentDate = new Date().toISOString().split('T')[0];

    // Build XML string - ENSURE NO WHITESPACE BEFORE THE XML TAG
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
      const jobDate = job.updatedDate ? job.updatedDate.split('T')[0] : currentDate;
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

    // 1. Write to public folder (so it's available in next build)
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), finalXml);
    
    // 2. Also copy headers and redirects to dist if they exist in public
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), finalXml);

    // Copy Cloudflare config files to dist manually to ensure they are present
    ['_headers', '_redirects', 'robots.txt'].forEach(file => {
      const src = path.join(publicDir, file);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(distDir, file));
        console.log(`✔ Copied ${file} to dist/`);
      }
    });
    
    console.log(`--- [Sitemap Generator] Success: ${jobs.length + 5} URLs ---`);
  } catch (error) {
    console.error('✘ Critical Error:', error);
    (process as any).exit(1);
  }
}

generateSitemap();