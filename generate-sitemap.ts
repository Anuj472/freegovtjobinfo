import fs from 'fs';
import { fetchJobs } from './services/bloggerService';

async function generateSitemap() {
  console.log('--- [Sitemap Generator] Starting ---');
  try {
    const jobs = await fetchJobs();
    const baseUrl = 'https://freegovtjob.info';
    const currentDate = new Date().toISOString().split('T')[0];

    // Build the XML string using standard 0.9 protocol
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Primary Entry Points -->
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
  
  <!-- Static Pages -->
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

    // Dynamic Job Notification Pages
    // Mapping Blogger posts to individual URL nodes
    jobs.forEach(job => {
      // Use job's actual update date if available, otherwise fallback to current
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

    // Output 1: Write to Public folder (for local dev visibility)
    if (!fs.existsSync('./public')) fs.mkdirSync('./public');
    fs.writeFileSync('./public/sitemap.xml', xml);
    console.log('✔ Successfully saved to ./public/sitemap.xml');

    // Output 2: Write to Dist folder (Crucial for Cloudflare/Hosting deployment)
    if (fs.existsSync('./dist')) {
      fs.writeFileSync('./dist/sitemap.xml', xml);
      console.log('✔ Successfully saved to ./dist/sitemap.xml');
    } else {
      console.warn('⚠ Warning: ./dist folder not found. Run "npm run build" to ensure sitemap is deployed.');
    }
    
    console.log(`--- [Sitemap Generator] Complete: ${jobs.length + 5} URLs indexed ---`);
  } catch (error) {
    console.error('✘ Sitemap Generation Failed:', error);
    (process as any).exit(1);
  }
}

generateSitemap();