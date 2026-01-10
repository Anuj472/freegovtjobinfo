
import { Job } from '../types';
import { STATES, QUALIFICATIONS, CATEGORIES } from '../constants';

const BLOGGER_API_KEY = 'AIzaSyCl_oje2gH5QYD24aTEU7d9OoVsO9ZDLqk';
const BLOGGER_BLOG_ID = '6302142054352195282';
const BASE_URL = `https://www.googleapis.com/blogger/v3/blogs/${BLOGGER_BLOG_ID}`;

/**
 * Transforms a Blogger post object into our application's Job interface.
 */
function transformBloggerPost(post: any): Job {
  const labels = post.labels || [];
  
  const foundStates: string[] = [];
  const foundQuals: string[] = [];
  const foundCats: string[] = [];

  labels.forEach((l: string) => {
    const lowerLabel = l.toLowerCase();
    
    // Pattern: [Name]-Jobs
    const suffix = "-jobs";
    if (lowerLabel.endsWith(suffix)) {
      const baseName = l.substring(0, l.length - suffix.length).trim();
      const lowerBase = baseName.toLowerCase();

      // Match States
      const stateMatch = STATES.find(s => s.label.toLowerCase() === lowerBase);
      if (stateMatch) foundStates.push(stateMatch.id);

      // Match Qualifications
      const qualMatch = QUALIFICATIONS.find(q => q.label.toLowerCase() === lowerBase);
      if (qualMatch) foundQuals.push(qualMatch.label);

      // Match Categories
      const catMatch = CATEGORIES.find(c => c.label.toLowerCase() === lowerBase);
      if (catMatch) foundCats.push(catMatch.label);
    }

    // Special case for Faculty (which user mentioned previously)
    if (lowerLabel === 'faculty') {
      foundCats.push('Faculty');
    }
  });

  // Extract date from content
  let lastDate = "2026-12-31"; 
  const dateMatch = post.content.match(/(\d{1,2}[-/]\d{1,2}[-/]\d{4})|(\d{4}[-/]\d{1,2}[-/]\d{1,2})/);
  if (dateMatch) {
    lastDate = dateMatch[0];
  }

  const slug = post.url 
    ? post.url.split('/').pop().replace('.html', '') 
    : post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const titleParts = post.title.split('-').map((s: string) => s.trim());
  const organization = titleParts[0] || "Government Org";
  const jobRole = titleParts[1] || post.title;

  return {
    id: post.id,
    title: post.title,
    slug: slug,
    organization: organization,
    jobRole: jobRole,
    qualification: foundQuals.length > 0 ? foundQuals : ["Check Detail"],
    lastDate: lastDate,
    state: foundStates.length > 0 ? foundStates : ["all-india"],
    category: foundCats.length > 0 ? foundCats : ["General"],
    content: post.content,
    shortDescription: post.content.replace(/<[^>]*>/g, '').substring(0, 160).trim() + '...',
    publishDate: post.published,
    updatedDate: post.updated,
    externalLink: post.url,
    isLatest: labels.some((l: string) => l.toLowerCase() === 'latest-jobs'),
    isTrending: labels.some((l: string) => 
      l.toLowerCase() === 'trending_job' || 
      l.toLowerCase() === 'verified-recruitment'
    ),
    thumbnailUrl: post.images?.[0]?.url || `https://picsum.photos/seed/${post.id}/400/200`
  };
}

export async function fetchJobs(): Promise<Job[]> {
  try {
    const response = await fetch(`${BASE_URL}/posts?key=${BLOGGER_API_KEY}&maxResults=500&fetchImages=true&_cb=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`Blogger API returned ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.items) return [];

    // All jobs should have 'Latest-Jobs' label
    const jobPosts = data.items.filter((post: any) => 
      post.labels?.some((l: string) => l.toLowerCase() === 'latest-jobs')
    );

    return jobPosts.map(transformBloggerPost);
  } catch (error) {
    console.error("Critical Blogger API Error:", error);
    return [];
  }
}

export async function getJobBySlug(slug: string): Promise<Job | undefined> {
  const allJobs = await fetchJobs();
  return allJobs.find(j => j.slug === slug);
}
