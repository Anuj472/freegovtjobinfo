import fs from 'fs';
import path from 'path';
import { fetchJobs } from './services/bloggerService.js';
import { STATES, QUALIFICATIONS, CATEGORIES } from './constants.js';

async function generateSitemap() {
  console.log('🚀 Starting SEO Sitemap Generation...');
  
  const publicDir = path.resolve((process as any).cwd(), 'public');
  const distDir = path.resolve((process as any).cwd(), 'dist');

  try {
    const jobs = await fetchJobs();
    const baseUrl = 'https://freegovtjob.info';
    
    // Safety check: Google rejects future dates.
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Core Pages -->
  <url><loc>${baseUrl}/</loc><lastmod>${currentDate}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${baseUrl}/trending</loc><lastmod>${currentDate}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${baseUrl}/sitemap</loc><lastmod>${currentDate}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>${baseUrl}/about-us</loc><lastmod>${currentDate}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>${baseUrl}/privacy-policy</loc><lastmod>${currentDate}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>
`;

    // 1. Add State Landing Pages (Crucial for Local SEO)
    STATES.forEach(s => {
      const stateUrl = s.id === 'all-india' ? `${baseUrl}/` : `${baseUrl}/${s.id}`;
      if (s.id !== 'all-india') {
        xml += `  <url><loc>${stateUrl}</loc><lastmod>${currentDate}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>\n`;
      }
    });

    // 2. Add Qualification Landing Pages
    QUALIFICATIONS.forEach(q => {
      xml += `  <url><loc>${baseUrl}/qualification/${q.id}</loc><lastmod>${currentDate}</lastmod><changefreq>daily</changefreq><priority>0.7</priority></url>\n`;
    });

    // 3. Add Category Hubs
    CATEGORIES.forEach(c => {
      xml += `  <url><loc>${baseUrl}/category/${c.id}</loc><lastmod>${currentDate}</lastmod><changefreq>daily</changefreq><priority>0.7</priority></url>\n`;
    });

    // 4. Add Individual Job Pages
    jobs.forEach(job => {
      let jobDate = job.updatedDate ? job.updatedDate.split('T')[0] : currentDate;
      // Cap future dates to today
      if (new Date(jobDate) > now) jobDate = currentDate;
      
      xml += `  <url>
    <loc>${baseUrl}/job/${job.slug}</loc>
    <lastmod>${jobDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>\n`;
    });

    xml += '</urlset>';

    const finalXml = xml.trim();

    // Ensure directory exists
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    
    // Write to public folder
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), finalXml);
    console.log(`✅ Created public/sitemap.xml (${jobs.length + 50}+ URLs)`);

    // Sync to dist if it exists
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), finalXml);
      ['_headers', '_redirects', 'robots.txt'].forEach(f => {
        const src = path.join(publicDir, f);
        if (fs.existsSync(src)) fs.copyFileSync(src, path.join(distDir, f));
      });
    }

  } catch (error) {
    console.error('❌ Sitemap Error:', error);
    (process as any).exit(1);
  }
}

generateSitemap();