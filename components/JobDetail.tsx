
import React from 'react';
import { Job } from '../types';

interface JobDetailProps {
  job: Job;
  onBack: () => void;
}

const JobDetail: React.FC<JobDetailProps> = ({ job, onBack }) => {
  const shareUrl = window.location.href;
  const shareText = `Check out this job opportunity: ${job.title}`;

  const handleShareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`, '_blank');
  };

  const handleShareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-8 text-white relative">
        <button 
          onClick={onBack}
          className="absolute top-8 right-8 text-white/80 hover:text-white flex items-center gap-2 text-sm font-bold uppercase transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back
        </button>
        
        <div className="max-w-2xl">
          <div className="flex flex-wrap gap-2 mb-4">
            {job.isLatest && <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">Latest Alert</span>}
            <span className="bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Verified Recruitment
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-blue-100 text-sm font-medium">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              {job.organization}
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              Apply By: {new Date(job.lastDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {/* Quick Summary Table for Users/Bots */}
            <div className="mb-8 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-700">Recruitment Summary</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 bg-white divide-x divide-y divide-gray-100">
                    <div className="p-4"><span className="block text-[9px] text-gray-400 uppercase font-bold">Organization</span><span className="text-xs font-bold">{job.organization}</span></div>
                    <div className="p-4"><span className="block text-[9px] text-gray-400 uppercase font-bold">Post Name</span><span className="text-xs font-bold">{job.jobRole}</span></div>
                    <div className="p-4"><span className="block text-[9px] text-gray-400 uppercase font-bold">Qualification</span><span className="text-xs font-bold">{job.qualification.join(', ')}</span></div>
                    <div className="p-4"><span className="block text-[9px] text-gray-400 uppercase font-bold">Last Date</span><span className="text-xs font-bold text-red-600">{new Date(job.lastDate).toLocaleDateString()}</span></div>
                    <div className="p-4"><span className="block text-[9px] text-gray-400 uppercase font-bold">State</span><span className="text-xs font-bold uppercase">{job.state.join(', ')}</span></div>
                    <div className="p-4"><span className="block text-[9px] text-gray-400 uppercase font-bold">Status</span><span className="text-xs font-bold text-green-600">Active</span></div>
                </div>
            </div>

            <div 
              className="prose prose-blue max-w-none" 
              dangerouslySetInnerHTML={{ __html: job.content }} 
            />
          </div>

          <div className="space-y-8">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"></path></svg>
                Share This Job
              </h4>
              <div className="flex flex-col gap-3">
                <button onClick={handleShareWhatsApp} className="w-full bg-[#25D366] text-white p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-colors shadow-sm font-bold uppercase text-xs">WhatsApp</button>
                <button onClick={handleShareTelegram} className="w-full bg-[#0088cc] text-white p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#0077b5] transition-colors shadow-sm font-bold uppercase text-xs">Telegram</button>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-800 mb-4 uppercase text-xs tracking-widest">Official Links</h4>
              <div className="space-y-4">
                  <p className="text-[10px] text-gray-500 font-medium">Please verify all details in the official notification before applying.</p>
                  <a href={job.externalLink} target="_blank" rel="noopener noreferrer" className="block text-center bg-blue-700 text-white p-3 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-blue-800 transition-colors">Apply Online Link</a>
                  <a href={job.externalLink} target="_blank" rel="noopener noreferrer" className="block text-center border-2 border-blue-700 text-blue-700 p-3 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-blue-50 transition-colors">Download Notification</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
