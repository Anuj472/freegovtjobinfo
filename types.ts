
export interface Job {
  id: string;
  title: string;
  slug: string;
  organization: string;
  jobRole: string;
  qualification: string[];
  postDate: string; // New field for extraction from postdateDDMMYYYY label
  lastDate: string;
  state: string[];
  category: string[];
  content: string;
  shortDescription: string;
  publishDate: string;
  updatedDate: string;
  externalLink: string;
  isLatest: boolean;
  isTrending: boolean;
  thumbnailUrl?: string;
}

export interface LabelInfo {
  states: string[];
  qualifications: string[];
  categories: string[];
}

export type PageType = 'HOME' | 'STATE' | 'QUALIFICATION' | 'DETAIL' | 'SITEMAP' | 'PRIVACY' | 'CONTACT';
