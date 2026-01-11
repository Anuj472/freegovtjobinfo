
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
      <div className="w-full space-y-1">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="animate-pulse bg-white border border-gray-200 h-8"></div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white border border-gray-300 p-8 text-center">
        <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">No Matching Notifications Found</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 shadow-sm overflow-hidden rounded-b-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed min-w-[600px]">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="px-2 py-2 text-[9px] font-black uppercase tracking-widest w-[40px] text-center border-r border-gray-200">#</th>
              <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest border-r border-gray-200">Recruitment Notification</th>
              <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest w-[100px] text-center border-r border-gray-200">Last Date</th>
              <th className="px-3 py-2 text-[9px] font-black uppercase tracking-widest w-[80px] text-center">Info</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {jobs.map((job, idx) => {
              const lastDateObj = new Date(job.lastDate);
              const diffDays = Math.ceil((lastDateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              const isClosingSoon = diffDays > 0 && diffDays <= 5;

              return (
                <tr key={job.id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-2 py-2 text-[10px] font-bold text-gray-400 text-center border-r border-gray-100 italic">{idx + 1}</td>
                  <td className="px-3 py-2 border-r border-gray-100 min-w-0">
                    <button 
                      onClick={() => onSelectJob(job.slug)}
                      className="dense-link block truncate text-left w-full hover:underline decoration-red-500 decoration-2 underline-offset-4"
                    >
                      {job.organization} - {job.jobRole}
                      {job.isLatest && <span className="text-[8px] font-black text-red-600 uppercase ml-1 animate-blink px-1 bg-red-50 border border-red-100 rounded">NEW</span>}
                    </button>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center border-r border-gray-100">
                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${isClosingSoon ? 'text-red-600 font-black' : 'text-gray-700'}`}>
                      {new Date(job.lastDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button 
                      onClick={() => onSelectJob(job.slug)}
                      className="text-blue-700 text-[9px] font-black uppercase hover:text-red-700 transition-colors underline decoration-dotted"
                    >
                      Details
                    </button>
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
