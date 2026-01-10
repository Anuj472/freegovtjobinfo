
import React from 'react';
import { Job } from '../types';

interface JobDetailProps {
  job: Job;
  onBack: () => void;
}

const JobDetail: React.FC<JobDetailProps> = ({ job, onBack }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-8 text-white relative">
        <button 
          onClick={onBack}
          className="absolute top-8 right-8 text-white/80 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to list
        </button>
        
        <div className="max-w-2xl">
          <div className="flex flex-wrap gap-2 mb-4">
            {job.isLatest && <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">Latest Notification</span>}
            <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">{job.category[0]}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-blue-100 text-sm">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              {job.organization}
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              Last Date: {new Date(job.lastDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
              {job.state.join(', ')}
            </span>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div 
              className="prose prose-blue max-w-none" 
              dangerouslySetInnerHTML={{ __html: job.content }} 
            />
            
            <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-xl font-bold text-blue-900 mb-1">Ready to apply?</h4>
                <p className="text-blue-700 text-sm">Make sure you have read the official notification carefully.</p>
              </div>
              <a 
                href={job.externalLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-3"
              >
                Apply Online Now
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </a>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"></path></svg>
                Share This Job
              </h4>
              <div className="flex gap-4">
                <button className="flex-1 bg-green-500 text-white p-3 rounded-lg flex justify-center hover:bg-green-600 transition-colors">
                  <span className="font-bold">WhatsApp</span>
                </button>
                <button className="flex-1 bg-blue-500 text-white p-3 rounded-lg flex justify-center hover:bg-blue-600 transition-colors">
                  <span className="font-bold">Telegram</span>
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-800 mb-4">Post Information</h4>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Post Date</span>
                  <span className="font-medium text-gray-800">{new Date(job.publishDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Updated</span>
                  <span className="font-medium text-gray-800">{new Date(job.updatedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Qualification</span>
                  <span className="font-medium text-gray-800 text-right">{job.qualification.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
