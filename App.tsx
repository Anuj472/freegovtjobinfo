
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Job, PageType } from './types';
import { fetchJobs, getJobBySlug } from './services/bloggerService';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import JobTable from './components/JobTable';
import JobDetail from './components/JobDetail';
import { STATES, QUALIFICATIONS, CATEGORIES, SITE_NAME } from './constants';

const StaticPage = ({ title, children, onBack }: { title: string, children?: React.ReactNode, onBack: () => void }) => (
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-500 max-w-4xl mx-auto">
    <div className="bg-blue-900 px-6 py-4 text-white flex justify-between items-center border-b border-blue-800">
      <h1 className="text-xl font-black uppercase tracking-tight">{title}</h1>
      <button 
        onClick={onBack} 
        className="text-[10px] font-bold uppercase border border-white/30 px-3 py-1 rounded hover:bg-white/10 transition-colors"
      >
        Close
      </button>
    </div>
    <div className="p-6 md:p-10 prose prose-blue max-w-none prose-sm md:prose-base">
      {children}
    </div>
  </div>
);

const QuickLinkSection = ({ title, items, getHref }: { title: string, items: any[], getHref: (id: string) => string }) => (
  <div className="bg-white border border-gray-300 shadow-sm mb-6 overflow-hidden rounded">
    <div className="bg-blue-600 text-white px-3 py-2 text-[11px] font-black uppercase tracking-widest text-center border-b border-gray-300">
      {title}
    </div>
    <div className="p-2 flex flex-col gap-1 max-h-80 overflow-y-auto scrollbar-thin">
      {items.map((item) => (
        <a 
          key={item.id} 
          href={item.id === 'all-india' ? '/' : getHref(item.id)}
          onClick={(e) => {
            e.preventDefault();
            const url = item.id === 'all-india' ? '/' : getHref(item.id);
            window.history.pushState({}, '', url);
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}
          className="text-[10px] font-bold text-blue-700 uppercase hover:bg-blue-50 px-2 py-1.5 rounded transition-colors border-b border-gray-50 last:border-0"
        >
          {item.label} Jobs
        </a>
      ))}
    </div>
  </div>
);

const DenseColumn = ({ 
  title, 
  colorClass, 
  jobs, 
  onSelect 
}: { 
  title: string, 
  colorClass: string, 
  jobs: Job[], 
  onSelect: (slug: string) => void 
}) => (
  <div className="flex flex-col border border-gray-300 bg-white h-full overflow-hidden shadow-sm rounded">
    <div className={`${colorClass} text-white px-3 py-2 text-xs font-black uppercase tracking-widest text-center border-b border-gray-300`}>
      {title}
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse table-fixed min-w-[500px]">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest border-r border-gray-100">Job Notification</th>
            <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest w-[140px] text-center">Qualification</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {jobs.length === 0 ? (
            <tr>
              <td colSpan={2} className="py-12 text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">No Alerts Available Currently</td>
            </tr>
          ) : (
            jobs.map((job) => (
              <tr key={job.id} className="hover:bg-blue-50/50 transition-colors group">
                <td className="px-3 py-2 border-r border-gray-100 min-w-0">
                  <button 
                    onClick={() => onSelect(job.slug)}
                    className="dense-link block truncate text-left w-full hover:underline decoration-red-500 decoration-1 underline-offset-4"
                  >
                    {job.organization}: {job.jobRole}
                    {job.isLatest && (
                      <span className="text-[8px] font-black text-red-600 uppercase tracking-tighter animate-blink ml-2 border border-red-100 px-1 rounded bg-red-50">
                        New
                      </span>
                    )}
                  </button>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="text-[9px] font-bold text-gray-600 uppercase truncate block">
                    {job.qualification[0]}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

function App() {
  const [view, setView] = useState<PageType>('HOME');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  const [selectedState, setSelectedState] = useState<string>('all-india');
  const [selectedQuals, setSelectedQuals] = useState<string[]>([]);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [onlyTrending, setOnlyTrending] = useState(false);

  const logoUrl = "https://lh3.googleusercontent.com/d/16mxMJQS75JFnupMKIFRtiOzPECzE94qY";

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const allJobs = await fetchJobs();
      setJobs(allJobs);
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Dynamic Metadata and Schema Helper
  const updatePageMeta = (title: string, description: string, url: string, job?: Job) => {
    document.title = title;
    const descMeta = document.getElementById('meta-description');
    if (descMeta) descMeta.setAttribute('content', description);
    
    const canonical = document.getElementById('canonical-link');
    if (canonical) canonical.setAttribute('href', `https://freegovtjob.info${url}`);

    // Inject JobPosting Schema if it's a job detail page
    const existingSchema = document.getElementById('dynamic-job-schema');
    if (existingSchema) existingSchema.remove();

    if (job) {
      const schemaScript = document.createElement('script');
      schemaScript.id = 'dynamic-job-schema';
      schemaScript.type = 'application/ld+json';
      schemaScript.text = JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "JobPosting",
        "title": job.title,
        "description": job.shortDescription,
        "datePosted": job.publishDate,
        "validThrough": job.lastDate,
        "employmentType": "FULL_TIME",
        "hiringOrganization": {
          "@type": "Organization",
          "name": job.organization,
          "logo": logoUrl
        },
        "jobLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressRegion": job.state[0],
            "addressCountry": "IN"
          }
        }
      });
      document.head.appendChild(schemaScript);
    }
  };

  useEffect(() => {
    const handleNavigation = async () => {
      const path = window.location.pathname;
      setSelectedJob(null);
      setOnlyTrending(false);

      if (path === '/' || path === '/all-india') {
        setSelectedState('all-india'); setSelectedQuals([]); setSelectedCats([]); setView('HOME');
        updatePageMeta(`${SITE_NAME} - Latest Govt Jobs 2025`, "Latest Government Job alerts and recruitment notifications in India for all qualifications.", "/");
      } else if (path === '/trending') {
        setSelectedState('all-india'); setSelectedQuals([]); setSelectedCats([]); setOnlyTrending(true); setView('HOME');
        updatePageMeta(`Trending Jobs 2025 - ${SITE_NAME}`, "Check out verified trending recruitment alerts for 2025.", "/trending");
      } else if (path === '/sitemap') {
        setView('SITEMAP');
        updatePageMeta(`Website Sitemap - ${SITE_NAME}`, "Complete navigation of all job categories and state-wise recruitment notifications.", "/sitemap");
      } else if (path === '/privacy-policy') {
        setView('PRIVACY');
        updatePageMeta(`Privacy & Editorial Policy - ${SITE_NAME}`, "Our commitment to data privacy and verified job information delivery.", "/privacy-policy");
      } else if (path === '/contact-us') {
        setView('CONTACT');
        updatePageMeta(`Contact Us - ${SITE_NAME}`, "Get in touch for support regarding job alerts or reporting broken links.", "/contact-us");
      } else if (path.startsWith('/job/')) {
        const slug = path.replace('/job/', '');
        const job = await getJobBySlug(slug);
        if (job) { 
          setSelectedJob(job); 
          setView('DETAIL'); 
          updatePageMeta(`${job.title} - ${SITE_NAME}`, job.shortDescription, path, job);
        } else { 
          window.history.pushState({}, '', '/');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      } else if (path.startsWith('/qualification/')) {
        const qId = path.replace('/qualification/', '');
        const q = QUALIFICATIONS.find(item => item.id === qId);
        setSelectedState('all-india'); setSelectedQuals([qId]); setSelectedCats([]); setView('HOME');
        updatePageMeta(`${q?.label || 'Qualification'} Jobs 2025 - ${SITE_NAME}`, `Find latest ${q?.label} government jobs in India.`, path);
      } else if (path.startsWith('/category/')) {
        const cId = path.replace('/category/', '');
        const c = CATEGORIES.find(item => item.id === cId);
        setSelectedState('all-india'); setSelectedQuals([]); setSelectedCats([cId]); setView('HOME');
        updatePageMeta(`${c?.label || 'Sector'} Jobs - ${SITE_NAME}`, `Browse latest recruitment alerts in the ${c?.label} sector.`, path);
      } else {
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        const sMatch = STATES.find(s => s.id === cleanPath);
        if (sMatch) {
          setSelectedState(cleanPath); setSelectedQuals([]); setSelectedCats([]); setView('HOME');
          updatePageMeta(`${sMatch.label} Govt Jobs 2025 - ${SITE_NAME}`, `Latest Sarkari Naukri notifications for ${sMatch.label} state.`, path);
        } else {
          setView('HOME');
          updatePageMeta(SITE_NAME, "Official Government Job alerts portal.", "/");
        }
      }
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handleNavigation);
    handleNavigation();
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  const handleJobSelect = (slug: string) => { 
    window.history.pushState({}, '', `/job/${slug}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleNavigateHome = () => { 
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleResetFilters = () => { 
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const getPageTitle = useCallback(() => {
    if (onlyTrending) return "Trending Job Alerts 2025";
    if (selectedState !== 'all-india') {
      const state = STATES.find(s => s.id === selectedState);
      return `${state?.label || 'State'} Govt Jobs 2025`;
    }
    if (selectedQuals.length > 0) {
      const quals = selectedQuals.map(qId => QUALIFICATIONS.find(q => q.id === qId)?.label).filter(Boolean);
      return `${quals.join(', ')} Notification Alerts`;
    }
    if (selectedCats.length > 0) {
      const cats = selectedCats.map(cId => CATEGORIES.find(c => c.id === cId)?.label).filter(Boolean);
      return `${cats.join(', ')} Sarkari Jobs`;
    }
    return "Latest Recruitment Notifications";
  }, [onlyTrending, selectedState, selectedQuals, selectedCats]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      if (onlyTrending && !job.isTrending) return false;
      let matchesState = selectedState === 'all-india' || job.state.some(s => s === selectedState);
      let matchesQual = selectedQuals.length === 0 || selectedQuals.some(qId => {
        const q = QUALIFICATIONS.find(opt => opt.id === qId);
        return q ? job.qualification.some(jq => jq.toLowerCase().includes(q.code.toLowerCase())) : false;
      });
      let matchesCat = selectedCats.length === 0 || selectedCats.some(cId => {
        const c = CATEGORIES.find(opt => opt.id === cId);
        return c ? job.category.some(jc => jc.toLowerCase().includes(c.code.toLowerCase())) : false;
      });
      return matchesState && matchesQual && matchesCat;
    });
  }, [jobs, selectedState, selectedQuals, selectedCats, onlyTrending]);

  const renderContent = () => {
    switch (view) {
      case 'DETAIL':
        return selectedJob ? <JobDetail job={selectedJob} onBack={handleNavigateHome} /> : null;
      case 'SITEMAP':
        return (
          <StaticPage title="Website Sitemap" onBack={handleNavigateHome}>
            <p className="text-gray-600 mb-8 italic">Find your way through our extensive database of government jobs categorized by state, sector, and qualification.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <section>
                <h2 className="text-lg font-black uppercase tracking-widest mb-4 border-b-2 border-blue-600 pb-2 text-blue-900">By Sector</h2>
                <ul className="space-y-2 list-none p-0">
                  {CATEGORIES.map(c => (
                    <li key={c.id}>
                      <a 
                        href={`/category/${c.id}`} 
                        onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', `/category/${c.id}`); window.dispatchEvent(new PopStateEvent('popstate')); }}
                        className="text-blue-700 hover:text-red-600 font-bold text-xs uppercase transition-colors"
                      >
                        {c.label} Alerts
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h2 className="text-lg font-black uppercase tracking-widest mb-4 border-b-2 border-blue-600 pb-2 text-blue-900">By Qualification</h2>
                <ul className="space-y-2 list-none p-0">
                  {QUALIFICATIONS.map(q => (
                    <li key={q.id}>
                      <a 
                        href={`/qualification/${q.id}`} 
                        onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', `/qualification/${q.id}`); window.dispatchEvent(new PopStateEvent('popstate')); }}
                        className="text-blue-700 hover:text-red-600 font-bold text-xs uppercase transition-colors"
                      >
                        {q.label} Jobs
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h2 className="text-lg font-black uppercase tracking-widest mb-4 border-b-2 border-blue-600 pb-2 text-blue-900">By Region</h2>
                <div className="grid grid-cols-1 gap-1">
                  {STATES.map(s => (
                    <li key={s.id} className="list-none">
                      <a 
                        href={`/${s.id}`} 
                        onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', `/${s.id}`); window.dispatchEvent(new PopStateEvent('popstate')); }}
                        className="text-blue-700 hover:text-red-600 font-bold text-xs uppercase transition-colors"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </div>
              </section>
            </div>
          </StaticPage>
        );
      case 'PRIVACY':
        return (
          <StaticPage title="Privacy & Editorial Policy" onBack={handleNavigateHome}>
            <div className="space-y-6 text-gray-700 leading-relaxed text-justify">
              <p>Welcome to <strong>{SITE_NAME}</strong>. We value your privacy and are committed to protecting it. This policy outlines how we handle data and verify information on our platform.</p>
              
              <h3 className="text-lg font-black text-blue-900 uppercase">Verification Policy (E-E-A-T)</h3>
              <p>Every job alert published on FreeGovtJob.info is manually verified against official government notifications. We do not publish unverified or rumored vacancies. Our team cross-checks dates, eligibility, and links directly with official department portals.</p>

              <h3 className="text-lg font-black text-blue-900 uppercase">Information Security</h3>
              <p>We do not collect personal identifiable information (PII) like names or addresses. We only track anonymous visit data to improve site performance and relevancy of job alerts.</p>
              
              <h3 className="text-lg font-black text-blue-900 uppercase">External Official Links</h3>
              <p>Our job detail pages link directly to official Government Department websites. Users are encouraged to verify information on the official portals before applying.</p>
              
              <h3 className="text-lg font-black text-blue-900 uppercase">Correction Policy</h3>
              <p>If you find any discrepancy in our job listings, please contact our helpdesk immediately at contact@freegovtjob.info for a prompt correction.</p>
            </div>
          </StaticPage>
        );
      case 'CONTACT':
        return (
          <StaticPage title="Contact Support" onBack={handleNavigateHome}>
            <div className="max-w-2xl space-y-8">
              <p className="text-gray-700 font-medium">Have questions or found an issue with a job link? Reach out to us via the channels below.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 group hover:border-blue-400 transition-colors">
                  <h4 className="font-black uppercase tracking-widest text-[10px] text-blue-800 mb-2">Email Helpdesk</h4>
                  <a href="mailto:contact@freegovtjob.info" className="text-blue-600 font-bold hover:underline block break-all">contact@freegovtjob.info</a>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 group hover:border-blue-400 transition-colors">
                  <h4 className="font-black uppercase tracking-widest text-[10px] text-blue-800 mb-2">Social Hub</h4>
                  <a href="https://t.me/freegovtjob" target="_blank" rel="noopener" className="text-blue-600 font-bold hover:underline block">Telegram @freegovtjob</a>
                </div>
              </div>
            </div>
          </StaticPage>
        );
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b-2 border-blue-600">
                <div className="flex flex-col gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-blue-900 uppercase tracking-tighter leading-none">
                    {getPageTitle()}
                  </h1>
                  <FilterBar 
                    selectedState={selectedState}
                    selectedQuals={selectedQuals}
                    selectedCats={selectedCats}
                    onStateChange={(s) => { window.history.pushState({}, '', `/${s}`); window.dispatchEvent(new PopStateEvent('popstate')); }}
                    onQualsChange={setSelectedQuals}
                    onCatsChange={setSelectedCats}
                    onReset={handleResetFilters}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <a href="https://t.me/freegovtjob" target="_blank" rel="noopener noreferrer" className="bg-[#0088cc] text-white px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest hover:bg-[#0077b5] shadow-sm flex items-center gap-1.5">
                     Join Telegram
                  </a>
                </div>
              </div>

              {loading ? (
                <div className="h-64 bg-gray-200 animate-pulse border border-gray-300 rounded"></div>
              ) : (
                <div className="w-full">
                  <DenseColumn 
                    title="Active Alerts - Featured Openings 2025" 
                    colorClass="bg-blue-600" 
                    jobs={filteredJobs.slice(0, 15)} 
                    onSelect={handleJobSelect} 
                  />
                </div>
              )}
              
              <div className="mt-8">
                <div className="bg-blue-900 text-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] inline-block rounded-t-sm">
                   Complete Recruitment Archive 2025
                </div>
                <JobTable jobs={filteredJobs} loading={loading} onSelectJob={handleJobSelect} />
              </div>
            </div>

            <aside className="lg:col-span-1">
              <QuickLinkSection 
                title="Sarkari Jobs by Sector" 
                items={CATEGORIES} 
                getHref={(id) => `/category/${id}`} 
              />
              <QuickLinkSection 
                title="Jobs by Qualification" 
                items={QUALIFICATIONS} 
                getHref={(id) => `/qualification/${id}`} 
              />
              <QuickLinkSection 
                title="Jobs by State" 
                items={STATES} 
                getHref={(id) => `/${id}`} 
              />
              <div className="bg-blue-50 border border-blue-200 p-4 rounded text-center shadow-sm">
                 <p className="text-[10px] font-bold text-blue-800 uppercase mb-2">Never Miss An Update</p>
                 <a href="https://t.me/freegovtjob" target="_blank" rel="noopener" className="block bg-blue-600 text-white text-[9px] font-black p-2 rounded uppercase tracking-widest hover:bg-blue-700 transition-colors">Follow Our Telegram</a>
              </div>
            </aside>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 antialiased overflow-x-hidden text-sm">
      <Header onNavigateHome={handleNavigateHome} />
      
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-4 lg:py-8 max-w-7xl">
        {renderContent()}
      </main>

      <footer className="bg-gray-900 text-white mt-auto border-t-4 border-blue-600">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center gap-6">
            <div className="bg-white p-1.5 rounded shadow-lg cursor-pointer hover:scale-105 transition-transform" onClick={handleNavigateHome}>
              <img src={logoUrl} alt="FreeGovtJob Portal Footer" className="h-10 md:h-12 w-auto object-contain" crossOrigin="anonymous" />
            </div>
            
            <nav className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              <a href="/sitemap" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/sitemap'); window.dispatchEvent(new PopStateEvent('popstate')); }} className="hover:text-blue-400 transition-colors">Sitemap</a>
              <a href="/privacy-policy" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/privacy-policy'); window.dispatchEvent(new PopStateEvent('popstate')); }} className="hover:text-blue-400 transition-colors">Privacy Policy</a>
              <a href="/contact-us" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/contact-us'); window.dispatchEvent(new PopStateEvent('popstate')); }} className="hover:text-blue-400 transition-colors">Contact Support</a>
            </nav>
            
            <div className="pt-4 border-t border-gray-800 w-full text-center">
              <div className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-600">
                © 2025 {SITE_NAME} | ALL RIGHTS RESERVED
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
