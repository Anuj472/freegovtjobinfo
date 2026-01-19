import fs from 'fs';
import path from 'path';
import { fetchJobs } from './services/bloggerService.js';
import { STATES, QUALIFICATIONS, CATEGORIES } from './constants.js';

/**
 * Escapes XML special characters to ensure valid XML output
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Validates and formats date to ISO format (YYYY-MM-DD)
 * Ensures date is never in the future
 */
function getSafeDate(dateStr?: string): string {
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  
  if (!dateStr) return currentDate;
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return currentDate;
    
    // Cap to current date if in future
    if (date > now) return currentDate;
    
    return date.toISOString().split('T')[0];
  } catch {
    return currentDate;
  }
}

/**
 * Creates a sitemap URL entry
 */
function createUrlEntry({
  loc,
  lastmod,
  changefreq,
  priority
}: {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: number;
}): string {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
}

async function generateSitemap() {
  console.log('🚀 [Sitemap Generator] Starting sitemap generation...');
  
  const root = (process as any).cwd();
  const publicDir = path.join(root, 'public');
  const distDir = path.join(root, 'dist');
  const currentDate = new Date().toISOString().split('T')[0];
  const baseUrl = 'https://freegovtjob.info';

  try {
    // Fetch jobs data
    console.log('📡 Fetching jobs data...');
    const jobs = await fetchJobs();
    console.log(`✅ Retrieved ${jobs.length} jobs`);

    // Start building sitemap
    const urls: string[] = [];
    
    // Core pages - highest priority
    urls.push(createUrlEntry({
      loc: `${baseUrl}/`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 1.0
    }));
    
    urls.push(createUrlEntry({
      loc: `${baseUrl}/trending`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 0.9
    }));

    // State pages - high priority
    console.log('📍 Adding state pages...');
    STATES.forEach(state => {
      if (state.id !== 'all-india') {
        urls.push(createUrlEntry({
          loc: `${baseUrl}/${state.id}`,
          lastmod: currentDate,
          changefreq: 'daily',
          priority: 0.8
        }));
      }
    });
    console.log(`✅ Added ${STATES.length - 1} state pages`);

    // Category pages (if CATEGORIES exist)
    if (typeof CATEGORIES !== 'undefined' && Array.isArray(CATEGORIES)) {
      console.log('📂 Adding category pages...');
      CATEGORIES.forEach(category => {
        if (category.id) {
          urls.push(createUrlEntry({
            loc: `${baseUrl}/category/${category.id}`,
            lastmod: currentDate,
            changefreq: 'weekly',
            priority: 0.7
          }));
        }
      });
      console.log(`✅ Added ${CATEGORIES.length} category pages`);
    }

    // Qualification pages (if QUALIFICATIONS exist)
    if (typeof QUALIFICATIONS !== 'undefined' && Array.isArray(QUALIFICATIONS)) {
      console.log('🎓 Adding qualification pages...');
      QUALIFICATIONS.forEach(qual => {
        if (qual.id) {
          urls.push(createUrlEntry({
            loc: `${baseUrl}/qualification/${qual.id}`,
            lastmod: currentDate,
            changefreq: 'weekly',
            priority: 0.7
          }));
        }
      });
      console.log(`✅ Added ${QUALIFICATIONS.length} qualification pages`);
    }

    // Job pages - dynamic content
    console.log('💼 Adding job pages...');
    jobs.forEach(job => {
      if (job.slug) {
        const jobDate = getSafeDate(job.updatedDate || job.publishedDate);
        urls.push(createUrlEntry({
          loc: `${baseUrl}/job/${job.slug}`,
          lastmod: jobDate,
          changefreq: 'weekly',
          priority: 0.7
        }));
      }
    });
    console.log(`✅ Added ${jobs.length} job pages`);

    // Static pages - lower priority
    const staticPages = [
      { path: '/sitemap', priority: 0.6 },
      { path: '/about-us', priority: 0.5 },
      { path: '/contact', priority: 0.5 },
      { path: '/privacy-policy', priority: 0.4 },
      { path: '/terms-of-service', priority: 0.4 },
      { path: '/disclaimer', priority: 0.4 }
    ];

    staticPages.forEach(page => {
      urls.push(createUrlEntry({
        loc: `${baseUrl}${page.path}`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: page.priority
      }));
    });

    // Build final XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.join('\n')}
</urlset>`;

    // Validate XML structure
    if (!xml.includes('</urlset>')) {
      throw new Error('Invalid XML structure: missing closing tag');
    }

    // Ensure public directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
      console.log('📁 Created public directory');
    }
    
    // Write to public folder (source for Vite)
    const publicSitemapPath = path.join(publicDir, 'sitemap.xml');
    fs.writeFileSync(publicSitemapPath, xml, 'utf8');
    console.log(`✅ Created public/sitemap.xml (${urls.length} URLs)`);

    // Sync to dist folder if it exists (for deployment)
    if (fs.existsSync(distDir)) {
      const distSitemapPath = path.join(distDir, 'sitemap.xml');
      fs.writeFileSync(distSitemapPath, xml, 'utf8');
      console.log('✅ Synced sitemap to dist/sitemap.xml');
      
      // Copy critical static files to dist
      const staticFiles = ['_headers', '_redirects', 'robots.txt'];
      staticFiles.forEach(file => {
        const srcPath = path.join(publicDir, file);
        const destPath = path.join(distDir, file);
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, destPath);
          console.log(`✅ Copied ${file} to dist/`);
        }
      });
    }

    // Cleanup: Remove any sitemap.xml in project root
    const rootSitemap = path.join(root, 'sitemap.xml');
    if (fs.existsSync(rootSitemap)) {
      fs.unlinkSync(rootSitemap);
      console.log('🗑️  Removed redundant root sitemap.xml');
    }

    // Generate summary
    console.log('\n📊 Sitemap Generation Summary:');
    console.log(`   Total URLs: ${urls.length}`);
    console.log(`   Jobs: ${jobs.length}`);
    console.log(`   States: ${STATES.length - 1}`);
    console.log(`   Generated: ${currentDate}`);
    console.log(`   Location: ${baseUrl}/sitemap.xml`);
    console.log('\n✅ Sitemap generation completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Sitemap Generation Failed:');
    console.error(error);
    console.error('\nStack trace:');
    if (error instanceof Error) {
      console.error(error.stack);
    }
    (process as any).exit(1);
  }
}

// Execute sitemap generation
generateSitemap();