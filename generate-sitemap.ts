import fs from 'fs';
import path from 'path';
import { fetchJobs } from './services/bloggerService.js';

async function generateSitemap() {
  console.log('--- [Sitemap Generator] Starting ---');
  
  // Ensure we have a dist directory to write to
  // Fix: Cast process to any to resolve property 'cwd' not found on type 'Process'
  const distDir = path.resolve((process as any).cwd(), 'dist');
  // Fix: Cast process to any to resolve property 'cwd' not found on type 'Process'
  const publicDir = path.resolve((process as any).cwd(), 'public');

  try {
    const jobs = await fetchJobs();
    const baseUrl = 'https://freegovtjob.info';
    const currentDate = new Date().toISOString().split('T')[0];

    // Build the XML string - NO LEADING WHITESPACE
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

    // Add dynamic job pages
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

    // Write to public folder for dev
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml.trim());
    console.log('✔ Saved to public/sitemap.xml');

    // Write to dist folder for production deployment
    if (!fs.existsSync(distDir)) {
      console.log('Creating dist directory...');
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml.trim());
    console.log('✔ Saved to dist/sitemap.xml');
    
    console.log(`--- [Sitemap Generator] Success: ${jobs.length + 5} URLs ---`);
  } catch (error) {
    console.error('✘ CRITICAL ERROR: Sitemap Generation Failed:', error);
    // Fix: Cast process to any to resolve property 'exit' not found on type 'Process'
    (process as any).exit(1); // Fail the build
  }
}

generateSitemap();