
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Job, PageType } from './types';
import { fetchJobs, getJobBySlug } from './services/bloggerService';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import JobTable from './components/JobTable';
import JobDetail from './components/JobDetail';
import { STATES, QUALIFICATIONS, CATEGORIES } from './constants';

function App() {
  const [view, setView] = useState<PageType>('HOME');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Filtering States
  const [selectedState, setSelectedState] = useState<string>('all-india');
  const [selectedQuals, setSelectedQuals] = useState<string[]>([]);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

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

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync hash with view
  useEffect(() => {
    const handleHashChange = async () => {
      const hash = window.location.hash.replace('#', '');
      
      if (!hash || hash === '/') {
        setView('HOME');
        setSelectedJob(null);
      } else if (hash.startsWith('/job/')) {
        const slug = hash.replace('/job/', '');
        const job = await getJobBySlug(slug);
        if (job) {
          setSelectedJob(job);
          setView('DETAIL');
        } else {
          window.location.hash = '/';
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleJobSelect = (slug: string) => {
    window.location.hash = `/job/${slug}`;
  };

  const handleNavigateHome = () => {
    window.location.hash = '/';
    handleResetFilters();
  };

  const handleResetFilters = () => {
    setSelectedState('all-india');
    setSelectedQuals([]);
    setSelectedCats([]);
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Filter by State: Extracting from labels like "haryana-jobs" -> ID "haryana"
      let matchesState = true;
      if (selectedState !== 'all-india') {
        matchesState = job.state.some(s => {
          // Check if the label state (e.g. "haryana") matches the selected ID (e.g. "haryana")
          const stateObj = STATES.find(st => st.id === selectedState);
          return s === selectedState || (stateObj && s === stateObj.id);
        });
      }

      // Filter by Qualifications (OR matching)
      let matchesQual = true;
      if (selectedQuals.length > 0) {
        matchesQual = selectedQuals.some(qualId => {
          const qualObj = QUALIFICATIONS.find(q => q.id === qualId);
          return qualObj ? job.qualification.some(q => q.toLowerCase().includes(qualObj.code.toLowerCase())) : false;
        });
      }

      // Filter by Categories (OR matching)
      let matchesCat = true;
      if (selectedCats.length > 0) {
        matchesCat = selectedCats.some(catId => {
          const catObj = CATEGORIES.find(c => c.id === catId);
          return catObj ? job.category.some(c => c.toLowerCase().includes(catObj.code.toLowerCase())) : false;
        });
      }

      return matchesState && matchesQual && matchesCat;
    });
  }, [jobs, selectedState, selectedQuals, selectedCats]);

  const getPageTitle = () => {
    if (view === 'HOME') {
      if (selectedState !== 'all-india') {
        const state = STATES.find(s => s.id === selectedState);
        return `Govt Jobs in ${state?.label || 'State'}`;
      }
      return "Latest Government Jobs 2026";
    }
    return "Job Details";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onNavigateHome={handleNavigateHome} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {view === 'DETAIL' && selectedJob ? (
          <JobDetail job={selectedJob} onBack={handleNavigateHome} />
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <nav className="flex items-center gap-2 text-xs text-gray-500 mb-2 uppercase tracking-widest font-bold">
                  <span className="cursor-pointer hover:text-blue-600" onClick={handleNavigateHome}>Home</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  <span className="text-gray-800">Jobs</span>
                </nav>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{getPageTitle()}</h2>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-full border border-green-100 w-fit">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Updated Real-time
              </div>
            </div>

            <FilterBar 
              selectedState={selectedState}
              selectedQuals={selectedQuals}
              selectedCats={selectedCats}
              onStateChange={setSelectedState}
              onQualsChange={setSelectedQuals}
              onCatsChange={setSelectedCats}
              onReset={handleResetFilters}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                {jobs.length === 0 && !loading ? (
                  <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center shadow-sm">
                    <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found from Blogger</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-6">Make sure your Blogger posts have labels like <code className="bg-gray-100 px-1 rounded text-blue-600 font-mono">Latest-jobs</code> or <code className="bg-gray-100 px-1 rounded text-blue-600 font-mono">haryana-jobs</code>.</p>
                    <button onClick={loadData} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">Retry Connection</button>
                  </div>
                ) : (
                  <JobTable 
                    jobs={filteredJobs} 
                    loading={loading} 
                    onSelectJob={handleJobSelect} 
                  />
                )}
              </div>

              <aside className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2 text-sm">Trending Now</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['Railway', 'UP Police', 'SSC CGL', 'Banking', 'Defense'].map(tag => (
                      <span key={tag} className="bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-500 px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors border border-gray-100 hover:border-blue-100 uppercase tracking-tighter">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2 text-sm">Quick Links</h4>
                  <div className="flex flex-col gap-2">
                    <a href="#/all-india" className="text-xs text-blue-600 hover:underline">All India Govt Jobs</a>
                    <a href="#/qualification/graduation" className="text-xs text-blue-600 hover:underline">Jobs for Graduates</a>
                    <a href="#/qualification/12th-pass" className="text-xs text-blue-600 hover:underline">Jobs for 12th Pass</a>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-white pt-12 pb-6 border-t-4 border-blue-600 mt-20">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <div className="bg-blue-600 p-1 rounded font-bold text-base">FG</div>
              FreeGovtJob.info
            </h3>
            <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
              The #1 portal for government job seekers. We fetch real-time data from official Blogger feeds.
            </p>
          </div>
          <div className="flex flex-col md:items-end">
            <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-[10px] opacity-60">Follow Us</h4>
            <div className="flex gap-4">
              <a href="https://t.me/freegovtjob" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-500 transition-colors shadow-lg" title="Follow on Telegram">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.891 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.331-.373-.121l-6.871 4.326-2.962-.924c-.643-.201-.657-.643.134-.952l11.57-4.458c.537-.196 1.006.128.832.93z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-6 border-t border-gray-800 text-center text-gray-500 text-[10px]">
          <p>© 2026 FreeGovtJob.info. All data from official feeds.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
