import React from 'react';
import { Job } from '../types';

interface JobTableProps {
  jobs: Job[];
  loading: boolean;
  onSelectJob: (slug: string) => void;
}

const JobTable: React.FC<JobTableProps> = ({ jobs, loading, onSelectJob }) => {
  if (loading) {
    return (
      <div className="w-full space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse bg-white border border-gray-200 h-16 rounded-sm"></div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white border border-gray-300 p-12 text-center rounded">
        <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">No Matching Notifications Found</p>
      </div>
    );
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    if (e.ctrlKey || e.metaKey || e.button === 1) return;
    e.preventDefault();
    onSelectJob(slug);
  };

  return (
    <div className="bg-white border border-gray-300 shadow-sm overflow-hidden rounded-sm">
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full text-left border-collapse table-fixed min-w-[750px]">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="px-4 py-5 text-[9px] font-black uppercase tracking-widest border-r border-gray-200">Recruitment Alert</th>
              <th className="px-3 py-5 text-[9px] font-black uppercase tracking-widest w-[180px] text-center border-r border-gray-200">Eligibility</th>
              <th className="px-3 py-5 text-[9px] font-black uppercase tracking-widest w-[110px] text-center border-r border-gray-200">Post Date</th>
              <th className="px-3 py-5 text-[9px] font-black uppercase tracking-widest w-[110px] text-center border-r border-gray-200">Last Date</th>
              <th className="px-3 py-5 text-[9px] font-black uppercase tracking-widest w-[70px] text-center">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {jobs.map((job) => {
              const lastDateObj = new Date(job.lastDate);
              const diffDays = Math.ceil((lastDateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              const isClosingSoon = diffDays > 0 && diffDays <= 5;

              return (
                <tr 
                  key={job.id} 
                  className="hover:bg-blue-50/50 active:bg-blue-100 transition-colors group"
                >
                  <td className="px-4 py-6 border-r border-gray-100 min-w-0">
                    <div className="flex flex-col">
                      <a 
                        href={`/job/${job.slug}`}
                        onClick={(e) => handleLinkClick(e, job.slug)}
                        className="text-[14px] font-bold text-blue-700 hover:underline underline-offset-4 decoration-2 leading-tight"
                      >
                        {job.organization}
                      </a>
                      <span className="text-[11px] text-gray-600 font-semibold mt-1">
                        {job.jobRole}
                        {job.isLatest && <span className="text-[8px] font-black text-red-600 uppercase ml-2 animate-blink bg-red-50 border border-red-100 px-1.5 rounded-full inline-block">NEW</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-6 text-center border-r border-gray-100">
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {job.qualification.map((q, idx) => (
                        <span key={idx} className="text-[9px] font-black text-blue-900 uppercase bg-blue-100/50 border border-blue-200 px-2 py-1 rounded-sm">
                          {q}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-6 text-center border-r border-gray-100">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                      {new Date(job.postDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-3 py-6 text-center border-r border-gray-100">
                    <div className="flex flex-col items-center">
                      <span className={`text-[11px] font-bold uppercase tracking-tight ${isClosingSoon ? 'text-red-600 font-black' : 'text-gray-700'}`}>
                        {new Date(job.lastDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      {isClosingSoon && <span className="text-[8px] text-red-500 font-black uppercase tracking-tighter">Closing Soon!</span>}
                    </div>
                  </td>
                  <td className="px-3 py-6 text-center">
                    <a 
                      href={`/job/${job.slug}`}
                      onClick={(e) => handleLinkClick(e, job.slug)}
                      className="inline-block p-1 text-blue-400 group-hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobTable;