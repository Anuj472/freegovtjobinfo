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
      <div className="w-full space-y-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse bg-white border border-gray-200 h-14 md:h-10 rounded-sm"></div>
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

  return (
    <div className="bg-white border border-gray-300 shadow-sm overflow-hidden rounded-sm">
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full text-left border-collapse table-fixed min-w-[650px]">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="px-3 py-4 text-[9px] font-black uppercase tracking-widest w-[45px] text-center border-r border-gray-200">#</th>
              <th className="px-4 py-4 text-[9px] font-black uppercase tracking-widest border-r border-gray-200">Recruitment Alert</th>
              <th className="px-3 py-4 text-[9px] font-black uppercase tracking-widest w-[130px] text-center border-r border-gray-200">Qualification</th>
              <th className="px-3 py-4 text-[9px] font-black uppercase tracking-widest w-[120px] text-center border-r border-gray-200">Last Date</th>
              <th className="px-3 py-4 text-[9px] font-black uppercase tracking-widest w-[80px] text-center">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {jobs.map((job, idx) => {
              const lastDateObj = new Date(job.lastDate);
              const diffDays = Math.ceil((lastDateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              const isClosingSoon = diffDays > 0 && diffDays <= 5;

              return (
                <tr 
                  key={job.id} 
                  className="hover:bg-blue-50/50 active:bg-blue-100 transition-colors group cursor-pointer"
                  onClick={() => onSelectJob(job.slug)}
                >
                  <td className="px-3 py-4 text-[11px] font-bold text-gray-400 text-center border-r border-gray-100 italic">{idx + 1}</td>
                  <td className="px-4 py-4 border-r border-gray-100 min-w-0">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-blue-700 group-hover:underline underline-offset-4 decoration-2 truncate">
                        {job.organization}
                      </span>
                      <span className="text-[10px] text-gray-600 font-medium truncate mt-0.5">
                        {job.jobRole}
                        {job.isLatest && <span className="text-[8px] font-black text-red-600 uppercase ml-2 animate-blink bg-red-50 border border-red-100 px-1 rounded inline-block">NEW</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-center border-r border-gray-100">
                    <span className="text-[10px] font-bold text-blue-800 uppercase bg-blue-50 px-2 py-1 rounded-sm truncate inline-block max-w-full">
                      {job.qualification[0] || 'Check'}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-center border-r border-gray-100">
                    <span className={`text-[10px] font-bold uppercase tracking-tight ${isClosingSoon ? 'text-red-600 font-black' : 'text-gray-700'}`}>
                      {new Date(job.lastDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <svg className="w-5 h-5 mx-auto text-blue-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
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