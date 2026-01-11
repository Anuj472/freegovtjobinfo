
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Job, PageType } from './types';
import { fetchJobs, getJobBySlug } from './services/bloggerService';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import JobTable from './components/JobTable';
import JobDetail from './components/JobDetail';
import { STATES, QUALIFICATIONS, CATEGORIES, SITE_NAME } from './constants';

const StaticPage = ({ title, children, onBack }: { title: string, children: React.ReactNode, onBack: () => void }) => (
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
          href={getHref(item.id)}
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
    <div className="p-1 overflow-y-auto max-h-[600px] scrollbar-thin">
      {jobs.length === 0 ? (
        <div className="py-12 text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">No Alerts Available Currently</div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {jobs.map((job) => (
            <li key={job.id} className="py-2 px-3 hover:bg-blue-50 transition-colors group">
              <button 
                onClick={() => onSelect(job.slug)}
                className="text-left w-full block"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-2 overflow-hidden">
                    <span className="dense-link leading-tight truncate">
                      {job.organization}: {job.jobRole}
                    </span>
                    {job.isLatest && (
                      <span className="text-[8px] font-black text-red-600 uppercase tracking-tighter shrink-0 animate-blink mt-0.5 border border-red-100 px-1 rounded bg-red-50">
                        New
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
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

  // SEO & Routing
  useEffect(() => {
    const handleHashChange = async () => {
      const hash = window.location.hash.replace('#', '');
      setSelectedJob(null);
      setOnlyTrending(false);

      if (!hash || hash === '/' || hash === '/all-india') {
        setSelectedState('all-india'); setSelectedQuals([]); setSelectedCats([]); setView('HOME');
        document.title = `${SITE_NAME} - Latest Govt Jobs 2026`;
      } else if (hash === '/trending') {
        setSelectedState('all-india'); setSelectedQuals([]); setSelectedCats([]); setOnlyTrending(true); setView('HOME');
        document.title = `Trending Jobs - ${SITE_NAME}`;
      } else if (hash === '/sitemap') {
        setView('SITEMAP');
        document.title = `Sitemap - ${SITE_NAME}`;
      } else if (hash === '/privacy-policy') {
        setView('PRIVACY');
        document.title = `Privacy Policy - ${SITE_NAME}`;
      } else if (hash === '/contact-us') {
        setView('CONTACT');
        document.title = `Contact Us - ${SITE_NAME}`;
      } else if (hash.startsWith('/job/')) {
        const slug = hash.replace('/job/', '');
        const job = await getJobBySlug(slug);
        if (job) { 
          setSelectedJob(job); 
          setView('DETAIL'); 
          document.title = `${job.title} - ${SITE_NAME}`;
        }
        else { window.location.hash = '/'; }
      } else if (hash.startsWith('/qualification/')) {
        const qId = hash.replace('/qualification/', '');
        const q = QUALIFICATIONS.find(item => item.id === qId);
        setSelectedState('all-india'); setSelectedQuals([qId]); setSelectedCats([]); setView('HOME');
        document.title = `${q?.label || 'Qualification'} Govt Jobs 2026 - ${SITE_NAME}`;
      } else if (hash.startsWith('/category/')) {
        const cId = hash.replace('/category/', '');
        const c = CATEGORIES.find(item => item.id === cId);
        setSelectedState('all-india'); setSelectedQuals([]); setSelectedCats([cId]); setView('HOME');
        document.title = `${c?.label || 'Sector'} Job Openings - ${SITE_NAME}`;
      } else {
        const cleanHash = hash.startsWith('/') ? hash.substring(1) : hash;
        const sMatch = STATES.find(s => s.id === cleanHash);
        if (sMatch) {
          setSelectedState(cleanHash); setSelectedQuals([]); setSelectedCats([]); setView('HOME');
          document.title = `${sMatch.label} Govt Jobs 2026 - ${SITE_NAME}`;
        } else {
          setView('HOME');
          document.title = SITE_NAME;
        }
      }
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleJobSelect = (slug: string) => { window.location.hash = `/job/${slug}`; };
  const handleNavigateHome = () => { window.location.hash = '/'; };
  const handleResetFilters = () => { window.location.hash = '/'; };

  const getPageTitle = useCallback(() => {
    if (onlyTrending) return "Trending Job Alerts";
    if (selectedState !== 'all-india') {
      const state = STATES.find(s => s.id === selectedState);
      return `${state?.label || 'State'} Govt Jobs 2026`;
    }
    if (selectedQuals.length > 0) {
      const quals = selectedQuals.map(qId => QUALIFICATIONS.find(q => q.id === qId)?.label).filter(Boolean);
      return `${quals.join(', ')} Notifications 2026`;
    }
    if (selectedCats.length > 0) {
      const cats = selectedCats.map(cId => CATEGORIES.find(c => c.id === cId)?.label).filter(Boolean);
      return `${cats.join(', ')} Job Alerts`;
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
            <p className="text-gray-600 mb-8 italic">Navigate through our comprehensive collection of government job notifications categorized by sector, qualification, and region.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <section>
                <h2 className="text-lg font-black uppercase tracking-widest mb-4 border-b-2 border-blue-600 pb-2 text-blue-900">Sectors</h2>
                <ul className="space-y-2 list-none p-0">
                  {CATEGORIES.map(c => <li key={c.id}><a href={`#/category/${c.id}`} className="text-blue-700 hover:text-red-600 font-bold text-xs uppercase transition-colors">{c.label} Jobs</a></li>)}
                </ul>
              </section>
              <section>
                <h2 className="text-lg font-black uppercase tracking-widest mb-4 border-b-2 border-blue-600 pb-2 text-blue-900">Qualifications</h2>
                <ul className="space-y-2 list-none p-0">
                  {QUALIFICATIONS.map(q => <li key={q.id}><a href={`#/qualification/${q.id}`} className="text-blue-700 hover:text-red-600 font-bold text-xs uppercase transition-colors">{q.label} Jobs</a></li>)}
                </ul>
              </section>
              <section>
                <h2 className="text-lg font-black uppercase tracking-widest mb-4 border-b-2 border-blue-600 pb-2 text-blue-900">States/Regions</h2>
                <div className="grid grid-cols-1 gap-1">
                  {STATES.map(s => <li key={s.id} className="list-none"><a href={`#/${s.id}`} className="text-blue-700 hover:text-red-600 font-bold text-xs uppercase transition-colors">{s.label}</a></li>)}
                </div>
              </section>
            </div>
          </StaticPage>
        );
      case 'PRIVACY':
        return (
          <StaticPage title="Privacy Policy" onBack={handleNavigateHome}>
            <div className="space-y-6 text-gray-700 leading-relaxed text-justify">
              <p>At <strong>{SITE_NAME}</strong>, accessible from freegovtjob.info, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by us and how we use it.</p>
              
              <h3 className="text-lg font-black text-blue-900 uppercase">Log Files</h3>
              <p>FreeGovtJob.info follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks.</p>
              
              <h3 className="text-lg font-black text-blue-900 uppercase">Cookies and Web Beacons</h3>
              <p>Like any other website, FreeGovtJob.info uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.</p>

              <h3 className="text-lg font-black text-blue-900 uppercase">Third Party Privacy Policies</h3>
              <p>Our website provides links to external government portals. FreeGovtJob.info's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party servers for more detailed information.</p>
              
              <h3 className="text-lg font-black text-blue-900 uppercase">Consent</h3>
              <p>By using our website, you hereby consent to our Privacy Policy and agree to its terms and conditions.</p>
            </div>
          </StaticPage>
        );
      case 'CONTACT':
        return (
          <StaticPage title="Contact Us" onBack={handleNavigateHome}>
            <div className="max-w-2xl space-y-8">
              <p className="text-gray-700 font-medium">Have queries regarding a job notification? Or want to report a dead link? Feel free to reach out to us. We typically respond within 24-48 hours.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 group hover:border-blue-400 transition-colors">
                  <h4 className="font-black uppercase tracking-widest text-[10px] text-blue-800 mb-2">Official Email</h4>
                  <a href="mailto:contact@freegovtjob.info" className="text-blue-600 font-bold hover:underline block break-all">contact@freegovtjob.info</a>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 group hover:border-blue-400 transition-colors">
                  <h4 className="font-black uppercase tracking-widest text-[10px] text-blue-800 mb-2">Telegram Support</h4>
                  <a href="https://t.me/freegovtjob" target="_blank" rel="noopener" className="text-blue-600 font-bold hover:underline block">@freegovtjob_info</a>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-black text-gray-800 mb-4 uppercase text-xs">Note to Candidates</h4>
                <p className="text-xs text-gray-600 leading-loose">
                  Please note that we are a notification portal. We do not hire people directly. For application status or exam results, please visit the official government department website mentioned in the specific job detail page.
                </p>
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
                    onStateChange={setSelectedState}
                    onQualsChange={setSelectedQuals}
                    onCatsChange={setSelectedCats}
                    onReset={handleResetFilters}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <a href="https://t.me/freegovtjob" target="_blank" rel="noopener noreferrer" className="bg-[#0088cc] text-white px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest hover:bg-[#0077b5] shadow-sm">Telegram</a>
                </div>
              </div>

              {loading ? (
                <div className="h-64 bg-gray-200 animate-pulse border border-gray-300 rounded"></div>
              ) : (
                <div className="w-full">
                  <DenseColumn 
                    title="Latest Alerts - Top 15 Positions" 
                    colorClass="bg-blue-600" 
                    jobs={filteredJobs.slice(0, 15)} 
                    onSelect={handleJobSelect} 
                  />
                </div>
              )}
              
              <div className="mt-8">
                <div className="bg-blue-900 text-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] inline-block rounded-t-sm">
                  Comprehensive Database
                </div>
                <JobTable jobs={filteredJobs} loading={loading} onSelectJob={handleJobSelect} />
              </div>
            </div>

            <aside className="lg:col-span-1">
              <QuickLinkSection 
                title="Jobs by Sector" 
                items={CATEGORIES} 
                getHref={(id) => `#/category/${id}`} 
              />
              <QuickLinkSection 
                title="Jobs by Qualification" 
                items={QUALIFICATIONS} 
                getHref={(id) => `#/qualification/${id}`} 
              />
              <QuickLinkSection 
                title="Jobs by Region" 
                items={STATES} 
                getHref={(id) => `#/${id}`} 
              />
              <div className="bg-blue-50 border border-blue-200 p-4 rounded text-center">
                 <p className="text-[10px] font-bold text-blue-800 uppercase mb-2">Subscribe for Daily Updates</p>
                 <a href="https://t.me/freegovtjob" className="block bg-blue-600 text-white text-[9px] font-black p-2 rounded uppercase tracking-widest hover:bg-blue-700 transition-colors">Join Telegram Channel</a>
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
            <div className="bg-white p-1.5 rounded shadow-lg cursor-pointer" onClick={handleNavigateHome}>
              <img src="/logo.png" alt="FreeGovtJob Portal" className="h-12 md:h-14 w-auto object-contain" />
            </div>
            
            <nav className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              <a href="#/sitemap" className="hover:text-blue-400 transition-colors">Sitemap</a>
              <a href="#/privacy-policy" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
              <a href="#/contact-us" className="hover:text-blue-400 transition-colors">Contact Us</a>
            </nav>

            <div className="text-center space-y-2">
              <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest max-w-lg mx-auto opacity-70">
                Providing up-to-date information on Central and State government recruitment for students and job seekers across India.
              </p>
              <div className="flex justify-center">
                 <a href="https://t.me/freegovtjob" className="text-gray-400 hover:text-[#0088cc] transition-colors">
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.891 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.331-.373-.121l-6.871 4.326-2.962-.924c-.643-.201-.657-.643.134-.952l11.57-4.458c.537-.196 1.006.128.832.93z"/></svg>
                 </a>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-800 w-full text-center">
              <div className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-600">
                © 2026 {SITE_NAME} GATEWAY
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
