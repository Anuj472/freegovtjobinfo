
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
          <div key={i} className="animate-pulse bg-white p-4 rounded-xl border border-gray-200 h-24"></div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500 text-lg">No jobs found for this filter.</p>
        <button className="mt-4 text-blue-600 font-semibold hover:underline">Reset Filters</button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">S.No</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Organization</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Job Role</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Qualification</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {jobs.map((job, idx) => {
              const lastDateObj = new Date(job.lastDate);
              const today = new Date();
              const diffDays = Math.ceil((lastDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              const isClosingSoon = diffDays > 0 && diffDays <= 7;

              return (
                <tr key={job.id} className="hover:bg-blue-50 transition-colors group">
                  <td className="px-6 py-5 text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-5">
                    <span className="font-bold text-gray-900">{job.organization}</span>
                  </td>
                  <td className="px-6 py-5">
                    <button 
                      onClick={() => onSelectJob(job.slug)}
                      className="text-blue-600 font-medium hover:text-blue-800 transition-colors text-left"
                    >
                      {job.jobRole}
                    </button>
                    {job.isLatest && (
                      <span className="ml-2 bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter">New</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-1">
                      {job.qualification.map((q) => (
                        <span key={q} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full border border-blue-100">
                          {q}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-sm font-medium ${isClosingSoon ? 'text-orange-600' : 'text-gray-700'}`}>
                      {new Date(job.lastDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {isClosingSoon && <div className="text-[10px] font-bold">Closing Soon!</div>}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <button 
                      onClick={() => onSelectJob(job.slug)}
                      className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
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
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <span className="text-sm text-gray-500">Showing {jobs.length} of {jobs.length} jobs</span>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50" disabled>Previous</button>
          <button className="px-3 py-1 bg-white border border-gray-300 rounded text-sm text-blue-600 font-bold shadow-sm">1</button>
          <button className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50" disabled>Next</button>
        </div>
      </div>
    </div>
  );
};

export default JobTable;
