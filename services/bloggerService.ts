import { Job } from '../types';
import { STATES, QUALIFICATIONS, CATEGORIES } from '../constants';

// Support both Vite (import.meta.env) and Node.js (process.env) environments
// In Vite build: import.meta.env is available
// In Node.js (sitemap generation): process.env is available
const BLOGGER_API_KEY = (() => {
  // Try Vite environment first (browser/build)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_BLOGGER_API_KEY || '';
  }
  // Fall back to Node.js environment (sitemap generation)
  if (typeof process !== 'undefined' && process.env) {
    return process.env.VITE_BLOGGER_API_KEY || '';
  }
  return '';
})();

const BLOGGER_BLOG_ID = '6302142054352195282';
const BASE_URL = `https://www.googleapis.com/blogger/v3/blogs/${BLOGGER_BLOG_ID}`;

/**
 * Transforms a Blogger post object into our application's Job interface.
 */
function transformBloggerPost(post: any): Job {
  if (!post || !post.title) {
    throw new Error("Malformed post data from Blogger API");
  }

  const labels = post.labels || [];
  const content = post.content || "";
  
  const foundStates: string[] = [];
  const foundQuals: string[] = [];
  const foundCats: string[] = [];
  let lastDate = "2026-12-31"; 
  let postDate = post.published ? post.published.split('T')[0] : new Date().toISOString().split('T')[0];

  labels.forEach((l: string) => {
    if (!l) return;
    const lowerLabel = l.toLowerCase().trim();
    
    // Check for ddmmyyyy date label (expiry/last date - exactly 8 digits)
    if (/^\d{8}$/.test(l)) {
      const day = l.substring(0, 2);
      const month = l.substring(2, 4);
      const year = l.substring(4, 8);
      lastDate = `${year}-${month}-${day}`;
    }

    // Check for postdateDDMMYYYY label (exactly 16 characters: postdate + 8 digits)
    if (lowerLabel.startsWith('postdate') && lowerLabel.length === 16) {
      const datePart = l.substring(8);
      if (/^\d{8}$/.test(datePart)) {
        const day = datePart.substring(0, 2);
        const month = datePart.substring(2, 4);
        const year = datePart.substring(4, 8);
        postDate = `${year}-${month}-${day}`;
      }
    }

    const suffix = "-jobs";
    // Check for "-jobs" suffix and extract base
    if (lowerLabel.endsWith(suffix)) {
      const lowerBase = lowerLabel.substring(0, lowerLabel.length - suffix.length).trim();

      // Match States
      const stateMatch = STATES.find(s => s.label.toLowerCase() === lowerBase || s.id === lowerBase);
      if (stateMatch) foundStates.push(stateMatch.id);

      // Match Qualifications (Improved Post Graduate detection)
      const isPostGrad = lowerBase === 'post graduate' || 
                         lowerBase === 'post-graduate' || 
                         lowerBase === 'postgraduate' ||
                         lowerBase === 'post grduate'; // Handle potential typo

      if (isPostGrad) {
        foundQuals.push('Post Graduate');
      } else {
        const qualMatch = QUALIFICATIONS.find(q => 
          q.label.toLowerCase() === lowerBase || 
          q.id === lowerBase ||
          (lowerBase === 'graduate' && q.id === 'graduation')
        );
        if (qualMatch) foundQuals.push(qualMatch.label);
      }

      // Match Categories
      const catMatch = CATEGORIES.find(c => c.label.toLowerCase() === lowerBase || c.id === lowerBase);
      if (catMatch) foundCats.push(catMatch.label);
    }

    // Direct string matching for labels without "-jobs" suffix
    if (lowerLabel === 'graduate' || lowerLabel === 'graduation') foundQuals.push('Graduation');
    if (lowerLabel === 'post graduate' || lowerLabel === 'post-graduate' || lowerLabel === 'postgraduate') {
        foundQuals.push('Post Graduate');
    }
    if (lowerLabel === 'mtech') foundQuals.push('M.Tech');
    if (lowerLabel === 'phd') foundQuals.push('PhD');
  });

  const slug = post.url 
    ? post.url.split('/').pop().replace('.html', '') 
    : post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const titleParts = post.title.split('-').map((s: string) => (s || "").trim());
  const organization = titleParts[0] || "Government Org";
  const jobRole = titleParts[1] || post.title;

  return {
    id: post.id,
    title: post.title,
    slug: slug,
    organization: organization,
    jobRole: jobRole,
    qualification: foundQuals.length > 0 ? Array.from(new Set(foundQuals)) : ["Check Detail"],
    postDate: postDate,
    lastDate: lastDate,
    state: foundStates.length > 0 ? foundStates : ["all-india"],
    category: foundCats.length > 0 ? foundCats : ["General"],
    content: content,
    shortDescription: content.replace(/<[^>]*>/g, '').substring(0, 160).trim() + '...',
    publishDate: post.published || new Date().toISOString(),
    updatedDate: post.updated || new Date().toISOString(),
    externalLink: post.url || "#",
    isLatest: labels.some((l: string) => l.toLowerCase() === 'latest-jobs'),
    isTrending: labels.some((l: string) => 
      l.toLowerCase() === 'trending_job' || 
      l.toLowerCase() === 'verified-recruitment' ||
      l.toLowerCase() === 'trending'
    ),
    thumbnailUrl: post.images?.[0]?.url || `https://picsum.photos/seed/${post.id}/400/200`
  };
}

/**
 * Fetches jobs from Blogger API.
 * Uses cache-busting and filters for valid recruitment posts.
 */
export async function fetchJobs(): Promise<Job[]> {
  try {
    const url = `${BASE_URL}/posts?key=${BLOGGER_API_KEY}&maxResults=500&fetchImages=true&_cb=${Date.now()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Blogger API returned ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.items) return [];

    const jobPosts = data.items.filter((post: any) => 
      post.labels?.some((l: string) => 
        l.toLowerCase() === 'latest-jobs' || 
        l.toLowerCase().endsWith('-jobs')
      )
    );

    return jobPosts.map((post: any) => {
      try {
        return transformBloggerPost(post);
      } catch (e) {
        console.error("Failed to transform post:", post.id, e);
        return null;
      }
    }).filter((j: any): j is Job => j !== null);
  } catch (error) {
    console.error("Critical Blogger API Error:", error);
    return [];
  }
}

/**
 * Gets a specific job by its slug.
 */
export async function getJobBySlug(slug: string): Promise<Job | undefined> {
  try {
    const allJobs = await fetchJobs();
    return allJobs.find(j => j.slug === slug);
  } catch (error) {
    console.error("getJobBySlug Error:", error);
    return undefined;
  }
}