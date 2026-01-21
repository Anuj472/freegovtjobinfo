/**
 * Structured Data / Schema.org utilities for better Google search appearance
 */

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generate BreadcrumbList schema for better sitelinks in Google
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): string {
  const itemListElement = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url
  }));

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement
  });
}

/**
 * Generate Organization schema with sitelinks searchbox
 */
export function generateOrganizationSchema(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FreeGovtJob.info',
    url: 'https://freegovtjob.info',
    logo: 'https://lh3.googleusercontent.com/d/16mxMJQS75JFnupMKIFRtiOzPECzE94qY',
    description: 'Latest Government Job alerts 2025-26. Verified recruitment notifications from Official Gazettes. SSC, Railway, Banking, State jobs.',
    sameAs: [
      'https://t.me/freegovtjob'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info.freegovtinfo@gmail.com',
      contactType: 'Customer Service',
      availableLanguage: ['en', 'hi']
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://freegovtjob.info/?search={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  });
}

/**
 * Generate WebSite schema for search box
 */
export function generateWebSiteSchema(): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FreeGovtJob.info',
    alternateName: ['Free Govt Job', 'FreeGovtJob', 'Sarkari Result'],
    url: 'https://freegovtjob.info',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://freegovtjob.info/?search={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  });
}

/**
 * Generate CollectionPage schema for category/state pages
 */
export function generateCollectionPageSchema({
  name,
  description,
  url
}: {
  name: string;
  description: string;
  url: string;
}): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    isPartOf: {
      '@type': 'WebSite',
      name: 'FreeGovtJob.info',
      url: 'https://freegovtjob.info'
    }
  });
}

/**
 * Generate JobPosting schema for individual job pages
 */
export function generateJobPostingSchema(job: {
  title: string;
  organization: string;
  description: string;
  datePosted: string;
  validThrough: string;
  state: string[];
  category: string[];
  qualification: string[];
  url: string;
}): string {
  const location = job.state[0] === 'all-india' ? 'India' : job.state[0];
  
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    identifier: {
      '@type': 'PropertyValue',
      name: job.organization,
      value: job.url
    },
    datePosted: job.datePosted,
    validThrough: job.validThrough,
    employmentType: 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: job.organization,
      sameAs: 'https://freegovtjob.info'
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: location,
        addressRegion: location,
        addressCountry: 'IN',
        streetAddress: 'Government Office',
        postalCode: '110001'
      }
    },
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'INR',
      value: {
        '@type': 'QuantitativeValue',
        minValue: 25000,
        maxValue: 100000,
        unitText: 'MONTH'
      }
    },
    educationRequirements: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: job.qualification.join(', ')
    },
    industry: job.category.join(', '),
    directApply: true,
    applicantLocationRequirements: {
      '@type': 'Country',
      name: 'India'
    }
  });
}