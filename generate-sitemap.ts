import fs from 'fs';
import path from 'path';
import { fetchJobs } from './services/bloggerService.js';
import { STATES, QUALIFICATIONS, CATEGORIES } from './constants.js';

async function generateSitemap() {
  console.log('--- [Sitemap Generator] Starting ---');
  
  const root = (process as any).cwd();
  const publicDir = path.join(root, 'public');
  const distDir = path.join(root, 'dist');

  try {
    const jobs = await fetchJobs();
    const baseUrl = 'https://freegovtjob.info';
    
    // STRICT DATE CONTROL: Use current server time, never future.
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];

    // Build XML string - Strict structure, no leading spaces
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><lastmod>${currentDate}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${baseUrl}/trending</loc><lastmod>${currentDate}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${baseUrl}/sitemap</loc><lastmod>${currentDate}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>${baseUrl}/about-us</loc><lastmod>${currentDate}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>${baseUrl}/privacy-policy</loc><lastmod>${currentDate}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>`;

    // Add State Pages
    STATES.forEach(s => {
      if (s.id !== 'all-india') {
        xml += `\n  <url><loc>${baseUrl}/${s.id}</loc><lastmod>${currentDate}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>`;
      }
    });

    // Add Job Pages with Date Safety
    jobs.forEach(job => {
      let jobDate = job.updatedDate ? job.updatedDate.split('T')[0] : currentDate;
      // If Blogger post has a future date, cap it to today
      if (new Date(jobDate) > now) {
        jobDate = currentDate;
      }
      
      xml += `\n  <url><loc>${baseUrl}/job/${job.slug}</loc><lastmod>${jobDate}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`;
    });

    xml += '\n</urlset>';

    const finalXml = xml.trim();

    // Ensure public folder exists
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    
    // Write to public folder (standard source for Vite)
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), finalXml);
    console.log('✅ Created public/sitemap.xml');

    // Sync to dist folder for immediate deployment
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), finalXml);
      
      // Copy critical headers/redirects to dist
      ['_headers', '_redirects', 'robots.txt'].forEach(file => {
        const src = path.join(publicDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, path.join(distDir, file));
        }
      });
      console.log('✅ Synced static files to dist/ directory');
    }

    // CLEANUP: Delete the wrong sitemap.xml in the project root if it exists
    const rootSitemap = path.join(root, 'sitemap.xml');
    if (fs.existsSync(rootSitemap)) {
      fs.unlinkSync(rootSitemap);
      console.log('🗑 Deleted redundant root sitemap.xml');
    }

  } catch (error) {
    console.error('✘ Sitemap Generation Failed:', error);
    (process as any).exit(1);
  }
}

generateSitemap();