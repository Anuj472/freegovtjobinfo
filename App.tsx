import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Job, PageType } from './types';
import { fetchJobs, getJobBySlug } from './services/bloggerService';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import JobTable from './components/JobTable';
import JobDetail from './components/JobDetail';
import { STATES, QUALIFICATIONS, CATEGORIES, SITE_NAME } from './constants';

const CONTACT_EMAIL = "info.freegovtinfo@gmail.com";

const StaticPage = ({ title, children, onBack }: { title: string, children?: React.ReactNode, onBack: () => void }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-500 max-w-4xl mx-auto">
    <div className="bg-blue-950 px-8 py-5 text-white flex justify-between items-center border-b border-blue-800">
      <h1 className="text-lg font-black uppercase tracking-tight">{title}</h1>
      <button 
        onClick={onBack} 
        className="text-[10px] font-black uppercase border border-white/30 px-4 py-2 rounded hover:bg-white/10 transition-colors active:scale-95"
      >
        Close
      </button>
    </div>
    <div className="p-8 md:p-12 prose prose-blue max-w-none prose-sm md:prose-base leading-relaxed text-gray-700">
      {children}
    </div>
  </div>
);

const SitemapPage = ({ onBack }: { onBack: () => void }) => (
  <StaticPage title="Sitemap - Quick Navigation" onBack={onBack}>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      <div>
        <h3 className="text-blue-900 font-black uppercase text-sm border-b-2 border-blue-100 pb-2 mb-4">States</h3>
        <div className="flex flex-col gap-2">
          {STATES.map(s => (
            <a 
              key={s.id} 
              href={`/${s.id}`} 
              onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', `/${s.id}`); window.dispatchEvent(new PopStateEvent('popstate')); }}
              className="text-[11px] font-bold text-gray-600 hover:text-blue-600 uppercase"
            >
              {s.label} Jobs
            </a>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-blue-900 font-black uppercase text-sm border-b-2 border-blue-100 pb-2 mb-4">Qualifications</h3>
        <div className="flex flex-col gap-2">
          {QUALIFICATIONS.map(q => (
            <a 
              key={q.id} 
              href={`/qualification/${q.id}`} 
              onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', `/qualification/${q.id}`); window.dispatchEvent(new PopStateEvent('popstate')); }}
              className="text-[11px] font-bold text-gray-600 hover:text-blue-600 uppercase"
            >
              {q.label} Alerts
            </a>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-blue-900 font-black uppercase text-sm border-b-2 border-blue-100 pb-2 mb-4">Sectors</h3>
        <div className="flex flex-col gap-2">
          {CATEGORIES.map(c => (
            <a 
              key={c.id} 
              href={`/category/${c.id}`} 
              onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', `/category/${c.id}`); window.dispatchEvent(new PopStateEvent('popstate')); }}
              className="text-[11px] font-bold text-gray-600 hover:text-blue-600 uppercase"
            >
              {c.label} Notifications
            </a>
          ))}
        </div>
      </div>
    </div>
  </StaticPage>
);

const QuickLinkSection = ({ title, items, getHref }: { title: string, items: any[], getHref: (id: string) => string }) => (
  <div className="bg-white border border-gray-200 shadow-sm mb-6 overflow-hidden rounded-lg">
    <div className="bg-blue-700 text-white px-4 py-3 text-[10px] font-black uppercase tracking-widest text-center">
      {title}
    </div>
    <div className="p-3 flex flex-col gap-1 max-h-80 overflow-y-auto scrollbar-thin">
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
          className="text-[11px] font-bold text-blue-700 uppercase hover:bg-blue-50 active:bg-blue-100 px-3 py-3 rounded transition-colors border-b border-gray-50 last:border-0 flex justify-between items-center"
        >
          {item.label}
          <svg className="w-3 h-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
        </a>
      ))}
    </div>
  </div>
);

const MobileTicker = () => (
  <div className="bg-red-600 text-white overflow-hidden whitespace-nowrap py-1.5 border-b border-red-700">
    <div className="inline-block animate-[scroll_25s_linear_infinite] px-4 text-[9px] font-black uppercase tracking-widest">
      Latest Updates: SSC CGL 2025 Verification Desk Complete • Railway RRB NTPC Notifications Released • Verified Sarkari Result Alerts 2025-26 •
    </div>
    <style>{`
      @keyframes scroll {
        0% { transform: translateX(100%); }
        100% { transform: translateX(-100%); }
      }
    `}</style>
  </div>
);

function App() {
  const [view, setView] = useState<PageType | 'ABOUT' | 'SITEMAP'>('HOME');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  const [selectedState, setSelectedState] = useState<string>('all-india');
  const [selectedQuals, setSelectedQuals] = useState<string[]>([]);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [onlyTrending, setOnlyTrending] = useState(false);

  const logoUrl = "https://lh3.googleusercontent.com/d/16mxMJQS75JFnupMKIFRtiOzPECzE94qY";

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname.startsWith('www.')) {
        window.location.href = window.location.href.replace('www.', '');
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const allJobs = await fetchJobs();
      setJobs(allJobs || []);
    } catch (error) {
      console.error("Data Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const updatePageMeta = (title: string, description: string, url: string, job?: Job) => {
    try {
      document.title = title || SITE_NAME;
      const descMeta = document.getElementById('meta-description');
      if (descMeta) descMeta.setAttribute('content', description || "");
      
      const canonical = document.getElementById('canonical-link');
      if (canonical) canonical.setAttribute('href', `https://freegovtjob.info${url}`);

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
          "directApply": true,
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
    } catch (e) {
      console.error("Failed to update meta:", e);
    }
  };

  useEffect(() => {
    const handleNavigation = async () => {
      try {
        const path = window.location.pathname;
        setSelectedJob(null);
        setOnlyTrending(false);

        if (path === '/' || path === '/all-india') {
          setSelectedState('all-india'); setView('HOME');
          updatePageMeta(`${SITE_NAME} - Latest Govt Jobs 2025-26`, "Access verified Latest Government Job alerts 2025-26. Manual verification for SSC, Banking, Railway notifications.", "/");
        } else if (path === '/trending') {
          setOnlyTrending(true); setView('HOME');
          updatePageMeta(`Trending Job Alerts 2025-26 - ${SITE_NAME}`, "Trending verified recruitment notifications for the current academic session.", "/trending");
        } else if (path === '/sitemap') {
          setView('SITEMAP');
          updatePageMeta(`Sitemap - ${SITE_NAME}`, "Complete index of government jobs by state, qualification, and category.", "/sitemap");
        } else if (path === '/about-us') {
          setView('ABOUT');
          updatePageMeta(`About Our Verification Process - ${SITE_NAME}`, "Learn how FreeGovtJob.info manually verifies recruitment links to ensure safety and accuracy.", "/about-us");
        } else if (path === '/privacy-policy') {
          setView('PRIVACY');
          updatePageMeta(`Editorial & Privacy Policy - ${SITE_NAME}`, "Our methodology for verifying government job notifications and user data security.", "/privacy-policy");
        } else if (path.startsWith('/job/')) {
          const slug = path.replace('/job/', '');
          if (slug) {
            const job = await getJobBySlug(slug);
            if (job) { 
              setSelectedJob(job); setView('DETAIL'); 
              updatePageMeta(`${job.title} - Verified Alert 2025-26`, job.shortDescription, path, job);
            } else { 
              window.history.pushState({}, '', '/'); 
              window.dispatchEvent(new PopStateEvent('popstate')); 
            }
          }
        } else if (path.startsWith('/qualification/')) {
          const qId = path.replace('/qualification/', '');
          const q = QUALIFICATIONS.find(item => item.id === qId);
          setSelectedQuals([qId]); setView('HOME');
          updatePageMeta(`${q?.label || 'Qualification'} Jobs 2025-26 - ${SITE_NAME}`, `Latest verified ${q?.label} government job alerts.`, path);
        } else if (path.startsWith('/category/')) {
          const cId = path.replace('/category/', '');
          const c = CATEGORIES.find(item => item.id === cId);
          setSelectedCats([cId]); setView('HOME');
          updatePageMeta(`${c?.label || 'Sector'} Jobs - ${SITE_NAME}`, `Active recruitment updates in the ${c?.label} department.`, path);
        } else {
          const cleanPath = path.startsWith('/') ? path.substring(1) : path;
          const sMatch = STATES.find(s => s.id === cleanPath);
          if (sMatch) {
            setSelectedState(cleanPath); setView('HOME');
            updatePageMeta(`${sMatch.label} Govt Jobs 2025-26 - ${SITE_NAME}`, `Latest state-wise government recruitment updates for ${sMatch.label}.`, path);
          } else { 
            setView('HOME'); 
            updatePageMeta(SITE_NAME, "Verified Government Job portal.", "/");
          }
        }
      } catch (e) {
        console.error("Navigation error:", e);
      }
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handleNavigation);
    handleNavigation();
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  const handleJobSelect = (slug: string) => { 
    if (!slug) return;
    window.history.pushState({}, '', `/job/${slug}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleNavigateHome = () => { 
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const filteredJobs = useMemo(() => {
    return (jobs || []).filter(job => {
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
        return selectedJob ? <JobDetail job={selectedJob} onBack={handleNavigateHome} /> : <div className="p-10 text-center">Loading Job...</div>;
      case 'ABOUT':
        return (
            <StaticPage title="Verification Desk & Editorial Team" onBack={handleNavigateHome}>
                <div className="space-y-8">
                    <h3 className="text-xl font-black text-blue-900 border-b border-blue-100 pb-2">Verified Since 2024</h3>
                    <p>Unlike automated portals that scrape fake results, <strong>FreeGovtJob.info</strong> employs researchers who manually verify every listing against official Government Gazettes (.gov.in) and the <em>Weekly Employment News</em>.</p>
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 italic font-medium">
                      "Our verification step ensures that application links lead directly to official portals, protecting you from phishing."
                    </div>
                    <h3 className="text-xl font-black text-blue-900 border-b border-blue-100 pb-2">Our Mission</h3>
                    <p>To provide Indian job seekers with a single, trustworthy gateway to public sector recruitment without the noise of unverified ads.</p>
                </div>
            </StaticPage>
        );
      case 'PRIVACY':
        return (
          <StaticPage title="Editorial & Privacy Standards" onBack={handleNavigateHome}>
            <div className="space-y-6">
              <h3 className="text-lg font-black text-blue-900">100% Data Integrity</h3>
              <p>We do not collect personal identifiers. Our editorial desk manually cross-references 'Apply Now' links to ensure they match official department domains. If a link expires, we update it within 6 hours of an official amendment.</p>
              <h3 className="text-lg font-black text-blue-900">Correction Protocol</h3>
              <p>Discovered an error? Reach out at <strong>{CONTACT_EMAIL}</strong> for priority editorial review.</p>
            </div>
          </StaticPage>
        );
      case 'SITEMAP':
        return <SitemapPage onBack={handleNavigateHome} />;
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="flex flex-col gap-6 mb-8">
                <h1 className="text-2xl md:text-3xl font-black text-blue-900 uppercase tracking-tighter border-b-4 border-blue-700 pb-2 inline-block self-start">
                   Latest Verified Jobs 2025-26
                </h1>
                <FilterBar 
                  selectedState={selectedState} selectedQuals={selectedQuals} selectedCats={selectedCats}
                  onStateChange={(s) => { window.history.pushState({}, '', `/${s}`); window.dispatchEvent(new PopStateEvent('popstate')); }}
                  onQualsChange={setSelectedQuals} onCatsChange={setSelectedCats}
                  onReset={() => { window.history.pushState({}, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }}
                />
              </div>

              <JobTable jobs={filteredJobs} loading={loading} onSelectJob={handleJobSelect} />
            </div>

            <aside className="lg:col-span-1 flex flex-col gap-6">
              <QuickLinkSection title="Browse State-Wise" items={STATES} getHref={(id) => `/${id}`} />
              <QuickLinkSection title="By Qualification" items={QUALIFICATIONS} getHref={(id) => `/qualification/${id}`} />
              <QuickLinkSection title="Sector Hubs" items={CATEGORIES} getHref={(id) => `/category/${id}`} />
              
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl shadow-sm text-center">
                 <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-4">Real-Time Alerts</p>
                 <a href="https://t.me/freegovtjob" target="_blank" rel="noopener" className="block bg-blue-600 text-white text-[11px] font-black p-4 rounded-lg uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95">Follow Our Telegram</a>
              </div>
            </aside>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-sm overflow-x-hidden antialiased">
      <MobileTicker />
      <Header onNavigateHome={handleNavigateHome} />
      <main className="flex-grow container mx-auto px-4 py-8 lg:py-12 max-w-7xl">{renderContent()}</main>
      <footer className="bg-blue-950 text-white mt-auto border-t-8 border-blue-700">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col items-center gap-8">
            <img src={logoUrl} alt="FreeGovtJob Footer" className="h-12 w-auto bg-white p-1 rounded" />
            <nav className="flex flex-wrap justify-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">
              <a href="/about-us" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/about-us'); window.dispatchEvent(new PopStateEvent('popstate')); }} className="hover:text-white transition-colors">About Desk</a>
              <a href="/privacy-policy" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/privacy-policy'); window.dispatchEvent(new PopStateEvent('popstate')); }} className="hover:text-white transition-colors">Editorial Policy</a>
              <a href="/sitemap" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/sitemap'); window.dispatchEvent(new PopStateEvent('popstate')); }} className="hover:text-white transition-colors">Site Map</a>
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white transition-colors">Contact</a>
            </nav>
            <div className="text-[9px] font-black uppercase tracking-[0.5em] text-blue-800 opacity-60">
              © 2025-26 FREEGOVTJOB.INFO | {CONTACT_EMAIL}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;