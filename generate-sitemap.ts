import fs from 'fs';
import { fetchJobs } from './services/bloggerService';

async function generateSitemap() {
  console.log('--- Generating Dynamic Sitemap ---');
  try {
    const jobs = await fetchJobs();
    const baseUrl = 'https://freegovtjob.info';
    const currentDate = new Date().toISOString().split('T')[0];

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
    <priority>0.5</priority>
  </url>`;

    // Add individual job pages
    jobs.forEach(job => {
      xml += `
  <url>
    <loc>${baseUrl}/job/${job.slug}</loc>
    <lastmod>${job.updatedDate.split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += '\n</urlset>';

    fs.writeFileSync('public/sitemap.xml', xml);
    // Also write to dist if it exists
    if (fs.existsSync('dist')) {
      fs.writeFileSync('dist/sitemap.xml', xml);
    }
    
    console.log(`Successfully generated sitemap with ${jobs.length + 4} URLs.`);
  } catch (error) {
    console.error('Sitemap Generation Failed:', error);
    // Fix: Casting process to any to access the 'exit' method which is missing from the current 'Process' type definition
    (process as any).exit(1);
  }
}

generateSitemap();